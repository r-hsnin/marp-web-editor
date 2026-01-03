# Build stage
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY backend ./backend

# Build
WORKDIR /app/backend
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

# Create non-root user
RUN groupadd -r marp && useradd -r -g marp -m marp

# Install Chromium, Node.js, Japanese fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    nodejs \
    dumb-init \
    curl \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    fonts-noto-color-emoji \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    locales \
    && echo "ja_JP.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen ja_JP.UTF-8 \
    && fc-cache -fv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace structure from builder
COPY --from=builder --chown=marp:marp /app/package.json ./
COPY --from=builder --chown=marp:marp /app/node_modules ./node_modules
COPY --from=builder --chown=marp:marp /app/packages ./packages
COPY --from=builder --chown=marp:marp /app/backend ./backend

WORKDIR /app/backend

# Environment variables
ENV NODE_ENV=production \
    LANG=ja_JP.UTF-8 \
    LC_ALL=ja_JP.UTF-8 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

EXPOSE 3001

USER marp

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "dist/index.js"]
