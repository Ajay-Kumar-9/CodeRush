# Use the official Node.js image as base
FROM node:latest

# Set the working directory in container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Update npm and install dependencies
RUN npm install -g npm@latest

# Install dependencies
RUN npm install

# Copy the backend code to container
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
