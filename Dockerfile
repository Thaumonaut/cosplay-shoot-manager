## Multi-stage Dockerfile for production
## Builder stage installs deps and builds client and server artifacts
FROM node:20 AS builder
WORKDIR /app

# copy package manifests first to leverage Docker layer cache
COPY package.json package-lock.json* ./

# install all dependencies (including dev deps needed for build)
RUN npm install --silent

# copy rest of the repository
COPY . .

# build client and bundle server (produces ./dist)
RUN npm run build

## Runtime stage: smaller image with only production deps and build artifacts
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# copy package manifest and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm run start

# copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the server listens on (default 5000)
EXPOSE 5000

# Use a minimal command to start the server
CMD ["node", "dist/index.js"]
