# Build stage
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN bun install

# Copy source
COPY packages/shared ./packages/shared
COPY frontend ./frontend

# Build
WORKDIR /app/frontend
RUN bun run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
