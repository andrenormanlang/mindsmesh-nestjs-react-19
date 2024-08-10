###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to utilize Docker cache
# This ensures that npm install is only rerun when package*.json files change
COPY package*.json ./

# Install app dependencies using the `npm ci` command for cleaner dependency installation
RUN npm ci

# Copy the application source files
COPY . .

# Use non-root user for better security practices
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM node:18-alpine As build

# Set working directory
WORKDIR /usr/src/app

# Copy npm dependency files
COPY --chown=node:node --from=development /usr/src/app/package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# Copy the rest of the application source
COPY --chown=node:node . .

# Build the application
RUN npm run build

# Set production environment to optimize libraries
ENV NODE_ENV=production

# Install only production dependencies and clean cache
RUN npm ci --only=production && npm cache clean --force

# Continue to use non-root user
USER node

###################
# PRODUCTION
###################
FROM node:18-alpine As production

# Set working directory
WORKDIR /usr/src/app

# Set environment variables securely
ENV NODE_ENV=production \
    DATABASE_HOST=host.docker.internal \
    DATABASE_PORT=5432 \
    DATABASE_USER=postgres \
    DATABASE_PASSWORD=shiva7 \
    DATABASE_NAME=skillsharehub \
    JWT_SECRET=PixieElvinCat77#

# Copy node_modules and build directory from the build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application using the production build
CMD ["node", "dist/main.js"]
