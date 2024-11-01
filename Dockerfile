# Backend Dockerfile

# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your backend service will run on
EXPOSE 4000

# Start the application
CMD ["node", "index.js"]
