# Use official Node.js LTS version as base image
FROM node:18-alpine

# Add metadata for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/yourusername/halaproject-discordbot
LABEL org.opencontainers.image.description="halaproject-discordbot - A Discord bot for sending research parameters to DeepSeek AI API"
LABEL org.opencontainers.image.licenses=ISC

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source code
COPY . .

# Expose port (optional, not needed for Discord bot)
# EXPOSE 3000

# Run the bot
CMD ["node", "index.js"]
