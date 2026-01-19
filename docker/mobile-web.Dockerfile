# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy mobile-web app files
COPY apps/mobile-web/package.json ./apps/mobile-web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/mobile-web ./apps/mobile-web
COPY tsconfig.json ./

# Build the application
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter mobile-web build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/apps/mobile-web/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
