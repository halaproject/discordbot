// index.js

// Load environment variables from .env file
require("dotenv").config();

// Import necessary packages
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios"); // We'll use axios to send HTTP requests

// ====== CONFIGURATION ======
// Using environment variables for sensitive information
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TARGET_URL = process.env.TARGET_URL;
const HTTP_USERNAME = process.env.HTTP_USERNAME;
const HTTP_PASSWORD = process.env.HTTP_PASSWORD;
// ===========================

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define the /start command
const commands = [
  new SlashCommandBuilder()
    .setName("start")
    .setDescription("Send HTTP request with Basic Auth to example.com"),
].map((command) => command.toJSON());

// Register the slash command with Discord API
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Register commands for a specific guild (for development, faster)
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// Event: When the bot is ready
client.once("ready", () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

// Event: When a slash command is used
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "start") {
    try {
      // Send HTTP POST request with Basic Auth
      const response = await axios.post(
        TARGET_URL,
        {},
        {
          auth: {
            username: HTTP_USERNAME,
            password: HTTP_PASSWORD,
          },
        }
      );

      // Reply to the user with the status of the request
      await interaction.reply(
        `✅ HTTP request sent! Status: ${response.status}`
      );
    } catch (error) {
      console.error("Error sending HTTP request:", error);

      // Reply to the user with error information
      await interaction.reply({
        content: `❌ Failed to send HTTP request: ${error.message}`,
        ephemeral: true,
      });
    }
  }
});

// Log in to Discord
client.login(BOT_TOKEN);
