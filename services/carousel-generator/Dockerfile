# 🎨 Carousel Generator Service Dockerfile
FROM oven/bun:1-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy shared dependencies and modules
COPY shared/ ./shared/
COPY services/carousel-generator/package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies and shared modules
COPY --from=deps /app/node_modules ./node_modules
COPY shared ./shared

# Copy source code
COPY services/carousel-generator/src ./src
COPY services/carousel-generator/package.json ./
COPY services/carousel-generator/tsconfig.json ./
COPY services/carousel-generator/bunfig.toml ./

# Create directory structure to resolve relative imports
RUN mkdir -p /app/src/../../../ && cp -r shared /app/src/../../../

# Build the application
RUN bun run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 carousel
RUN adduser --system --uid 1001 carousel

# Copy shared modules
COPY --from=builder --chown=carousel:carousel /app/shared ./shared

# Copy built application
COPY --from=builder --chown=carousel:carousel /app/dist ./dist
COPY --from=builder --chown=carousel:carousel /app/package.json ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

USER carousel

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the service
CMD ["bun", "run", "dist/index.js"]
