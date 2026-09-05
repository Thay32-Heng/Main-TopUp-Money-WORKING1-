# Multi-Stage Dockerfile for Topup Tenant Standalone Instance
# Stage 1: Build static assets
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime utilities
RUN apk add --no-cache curl

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm install -g tsx

# Copy compiled SPA assets and server code
COPY --from=builder /app/dist ./dist
COPY database ./database
COPY server ./server
COPY scripts ./scripts
COPY server.ts ./
COPY tsconfig.json ./
COPY VERSION ./
COPY docker-entrypoint.sh ./

RUN mkdir -p /app/uploads && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
