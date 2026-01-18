# Build stage
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies needed for Prisma
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy packages and apps files
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/api ./apps/api
COPY packages/core ./packages/core
COPY packages/types ./packages/types
COPY tsconfig.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma@5.8.0 generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-slim

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/types/package.json ./packages/types/

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma client again in production stage
RUN cd apps/api && npx prisma@5.8.0 generate

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/src/index.js"]
