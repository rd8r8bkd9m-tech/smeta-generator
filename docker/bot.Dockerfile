# Build stage
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy app and dependencies
COPY apps/telegram-bot/package.json ./apps/telegram-bot/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/telegram-bot ./apps/telegram-bot
COPY packages/types ./packages/types
COPY tsconfig.json ./

# Build the application
RUN pnpm build

# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/telegram-bot/package.json ./apps/telegram-bot/
COPY --from=builder /app/packages/types/package.json ./packages/types/

COPY --from=builder /app/apps/telegram-bot/dist ./apps/telegram-bot/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Set environment
ENV NODE_ENV=production

# Start the application
WORKDIR /app/apps/telegram-bot
CMD ["node", "dist/index.js"]
