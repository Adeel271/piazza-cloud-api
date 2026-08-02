# Use the lightweight official Node.js 20 Alpine Linux image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to improve Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Set the application to run in production mode
ENV NODE_ENV=production

# Expose port 3000 for incoming HTTP requests
EXPOSE 3000

# Run the application using the non-root 'node' user for better security
USER node

# Start the Express server
CMD ["node", "server.js"]
