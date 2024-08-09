# Stage 1: Build the application
FROM node:14 as build

WORKDIR /app

# Copy the .env file
COPY .env .env

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application files, including src directory
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production environment
FROM node:14-alpine as production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set environment variables directly in the Dockerfile
ENV DATABASE_HOST=localhost
ENV DATABASE_PORT=5432
ENV DATABASE_USER=postgres
ENV DATABASE_PASSWORD=shiva7
ENV DATABASE_NAME=skillsharehub
ENV JWT_SECRET=PixieElvinCat77#

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Copy only the production dependencies from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Copy the .env file from the build stage
COPY --from=build /app/.env .env

# Copy the src directory if you need it in production
COPY --from=build /app/src ./src

# Prune non-production dependencies (optional)
RUN npm prune --production

# Expose the application port
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]

# ON SHELLSCRIPT EXECUTE THE FOLLOWING COMMAND!
# docker run -it -p <host_port>:<container_port> <image_name> /bin/sh
