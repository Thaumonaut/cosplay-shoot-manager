## Multi-stage Dockerfile for production
## Builder stage installs deps and builds client and server artifacts
FROM node:20 AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# copy package manifests first to leverage Docker layer cache
COPY package.json pnpm-lock.yaml ./

# install all dependencies (including dev deps needed for build)
# Use --no-frozen-lockfile in CI to handle potential lockfile mismatches
RUN pnpm install --no-frozen-lockfile

# copy rest of the repository
COPY . .

# build client and bundle server (produces ./dist)
RUN pnpm run build

## Runtime stage: smaller image with only production deps and build artifacts
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm

# copy package manifest and install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --prod

# copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the server listens on (default 5000)
EXPOSE 5000

# Use node directly, NODE_ENV is set by Docker ENV
CMD ["node", "dist/index.js"]
