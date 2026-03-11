# Use official Node.js image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json first (for better caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Run tests by default
CMD ["npm", "test"]