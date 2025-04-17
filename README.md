# HalaProject Discord Bot

A Discord bot for sending research parameters to an API endpoint using DeepSeek AI.

## Features

- `/research` command: Sends research parameters to target URL with the following structure:
  ```json
  {
    "trend_topic": "your research topic",
    "count": 1,
    "lang": "english"
  }
  ```
  Notes: 
  - `trend_topic` is a required string parameter
  - `count` is optional and defaults to 1 if not provided
  - `lang` is optional and defaults to "english" if not provided

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   TARGET_URL=https://example.com/api/research
   HTTP_USERNAME=your_username_here
   HTTP_PASSWORD=your_password_here
   ```
3. Install dependencies: `npm install`
4. Start the bot: `npm start`

## Docker Support

This project can be run using Docker:

```bash
docker-compose up -d
```

Or pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/yourusername/halaproject-discordbot:latest
docker run -d --env-file .env ghcr.io/yourusername/halaproject-discordbot:latest
```

## GitHub Container Registry

This project is published to GitHub Container Registry. To use the pre-built image:

1. Authenticate with GHCR:
   ```bash
   echo $PAT | docker login ghcr.io -u USERNAME --password-stdin
   ```
2. Pull and run the image as shown above.

## License

ISC 