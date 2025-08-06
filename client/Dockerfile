# Use the official Node.js image to build the app
FROM node:latest

# Set up working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the frontend code to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 for the Next.js server
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
