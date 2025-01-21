# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

RUN unset NPM_CONFIG_REGISTRY
RUN unset NPM_TOKEN
RUN npm set registry https://registry.npmjs.org/
RUN npm cache clean --force
RUN env
COPY .npmrc .npmrc

# Copy package.json and package-lock.json into the container
COPY package*.json ./

RUN npm config list

# Install dependencies
RUN npm install --verbose

# Copy the rest of the application code into the container
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 7576

# Command to run the application
CMD ["npm", "start"]
