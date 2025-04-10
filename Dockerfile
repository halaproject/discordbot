# Use official Node.js LTS version as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port (optional, not needed for Discord bot)
# EXPOSE 3000

# Run the bot
CMD ["node", "index.js"]
