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
  EmbedBuilder
} = require("discord.js");
const axios = require("axios"); // We'll use axios to send HTTP requests
const fs = require('fs');
const path = require('path');

// ====== CONFIGURATION ======
// Using environment variables for sensitive information
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TARGET_URL = process.env.TARGET_URL;
const HTTP_USERNAME = process.env.HTTP_USERNAME;
const HTTP_PASSWORD = process.env.HTTP_PASSWORD;
// ===========================

// Setup logging
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Custom logger function
function logger(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    // Add data but mask sensitive information
    const safeData = JSON.parse(JSON.stringify(data));
    if (safeData.auth) {
      safeData.auth = { username: '***', password: '***' };
    }
    logEntry += `\n${JSON.stringify(safeData, null, 2)}`;
  }
  
  // Log to console with color
  const colors = {
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    debug: '\x1b[36m'  // Cyan
  };
  const resetColor = '\x1b[0m';
  console.log(`${colors[level] || ''}${logEntry}${resetColor}`);
  
  // Also write to log file
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry + '\n');
  
  return logEntry;
}

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define commands
const commands = [
  new SlashCommandBuilder()
    .setName("research")
    .setDescription("Send research parameters to target URL")
    .addStringOption(option =>
      option.setName("trend_topic")
        .setDescription("The trend topic to research")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("count")
        .setDescription("The count parameter (default: 1)")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("lang")
        .setDescription("The language parameter (default: english)")
        .setRequired(false)),
].map((command) => command.toJSON());

// Register the slash command with Discord API
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
  try {
    logger('info', "Started refreshing application (/) commands");

    // Register commands for a specific guild (for development, faster)
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    logger('info', "Successfully reloaded application (/) commands");
  } catch (error) {
    logger('error', "Failed to reload commands", error);
  }
})();

// Event: When the bot is ready
client.once("ready", () => {
  logger('info', `Bot is online as ${client.user.tag}`);
  
  // Set bot status
  client.user.setActivity('DeepSeek AI Research', { type: 'WATCHING' });
});

// Log when bot disconnects
client.on('disconnect', (event) => {
  logger('warn', `Bot disconnected with code ${event.code}`, event);
});

// Log when bot reconnects
client.on('reconnecting', () => {
  logger('info', 'Bot is reconnecting');
});

// Event: When a slash command is used
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  const user = interaction.user;
  const guild = interaction.guild;
  
  logger('info', `Command "${commandName}" used by ${user.tag} (${user.id}) in guild ${guild?.name || 'DM'} (${guild?.id || 'N/A'})`);

  if (commandName === "research") {
    try {
      // Show that the bot is thinking
      await interaction.deferReply();
      
      // Get parameters from the interaction
      const trend_topic = interaction.options.getString("trend_topic");
      const count = interaction.options.getInteger("count") || 1;
      const lang = interaction.options.getString("lang") || "english";

      // Log the parameters
      logger('debug', "Research parameters", { trend_topic, count, lang });

      // Prepare request body
      const requestBody = {
        trend_topic: trend_topic,
        count: count,
        lang: lang
      };

      // Log request attempt
      logger('debug', `Sending HTTP request to ${TARGET_URL}`);
      
      const startTime = Date.now();
      
      // Send HTTP POST request with basic auth
      const response = await axios.post(
        TARGET_URL,
        requestBody,
        {
          auth: {
            username: HTTP_USERNAME,
            password: HTTP_PASSWORD,
          },
        }
      );
      
      const responseTime = Date.now() - startTime;
      
      // Log successful response
      logger('info', `API request successful - Status: ${response.status}, Time: ${responseTime}ms`);

      // Create a simpler embed for successful response
      // Build success embed with all enhancements
      const timeTakenSeconds = Math.round(responseTime / 1000);
      const summaryLine = `📊 count: ${count} | time: ${timeTakenSeconds}s | lang: ${lang}`;
      const NOCODB_URL = "https://nocodb.hophamlam.com/dashboard/#/nc/gallery/21715fa0-2dfa-4fe6-a46d-0cc02de7944c";
      
      const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Research Completed by DeepSeek AI')
        .setDescription(
          `**Trend Topic**\n${trend_topic}\n\n` +
          `${summaryLine}\n` +
          `🔗 [View Results](${NOCODB_URL})`
        );
      

      // Send reply
      await interaction.editReply({ embeds: [successEmbed] });

      // Log the response sent to user
      logger('debug', 'Response sent to user');
      
    } catch (error) {
      // Log the error with detailed information
      logger('error', 'Error sending research request', {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          } : 'No response'
        }
      });

      // Create simple embed for error response
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000) // Red color
        .setTitle('❌ Research Request Failed')
        .setDescription(error.message || 'Unknown error');
      
      // Reply to the user with error embed
      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// Handle process errors
process.on('uncaughtException', (error) => {
  logger('error', 'Uncaught Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger('error', 'Unhandled Rejection', { reason, promise });
});

// Log startup
logger('info', 'Bot starting up');

// Log in to Discord
client.login(BOT_TOKEN)
  .then(() => logger('info', 'Logged in successfully'))
  .catch(error => logger('error', 'Failed to login', error));
