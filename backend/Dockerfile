# Build stage
FROM oven/bun:1-debian AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies
RUN bun install

# Copy source
COPY packages/shared ./packages/shared
COPY backend ./backend

# Build
WORKDIR /app/backend
RUN bun run build

# Production stage
FROM oven/bun:1-debian AS runner

# Create non-root user
RUN groupadd -r marp && useradd -r -g marp -m marp

# Install Node.js for Playwright installation
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Chromium via Playwright (for ARM64 support)
RUN mkdir -p /tmp/playwright && \
    cd /tmp/playwright && \
    npm i playwright@latest && \
    PLAYWRIGHT_BROWSERS_PATH=/usr/local/bin/pw-browsers npx playwright install --with-deps chromium && \
    ln -s $(find /usr/local/bin/pw-browsers -name "chrome" -executable | head -n 1) /usr/local/bin/chrome && \
    cd / && \
    rm -rf /tmp/playwright && \
    npm cache clean --force

# Install Japanese fonts and runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    fonts-noto-color-emoji \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    locales \
    curl \
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
    CHROME_PATH=/usr/local/bin/chrome \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/chrome

EXPOSE 3001

USER marp

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "dist/index.js"]
