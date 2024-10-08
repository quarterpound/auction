# Use Bun runtime as the base image
FROM oven/bun:latest AS base

# Set the working directory
WORKDIR /app

# Copy the root package.json and bun.lockb into the container
COPY package.json bun.lockb ./

# Copy the package.json files from the subdirectories, including utils
COPY apps/server/package.json apps/server/
COPY apps/web-client/package.json apps/web-client/
COPY apps/utils/package.json apps/utils/

# Copy the Prisma directory into the container
COPY prisma ./prisma

# Install dependencies using Bun, including workspace dependencies
RUN bun install

# Build stage for the entire monorepo
FROM base AS build

# Set the working directory
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Run the build script defined in package.json to build both apps
RUN bun run build

# Final stage: Create the final image for production
FROM oven/bun:latest AS production

# Set the working directory
WORKDIR /app

# Copy the built outputs from the build stage
COPY --from=build /app/out /app/out

# Copy the root package.json, bun.lockb, and Prisma directory from the base stage
COPY --from=base /app/package.json /app/bun.lockb ./
COPY --from=base /app/prisma ./prisma
# Copy node_modules to ensure all dependencies are available in production
COPY --from=build /app/node_modules /app/node_modules

# Expose ports for the server and web-client
EXPOSE 3000
EXPOSE 3001
EXPOSE 4200

# Start the server and web-client using the custom script
CMD ["bun", "run", "start:all"]
