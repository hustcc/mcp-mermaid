FROM node:lts-alpine

WORKDIR /app

# Install system dependencies for Playwright and font support
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    fontconfig \
    font-noto-cjk

# Tell Playwright to use the installed Chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Manually install Playwright Node.js bindings without browsers (we use system chromium)
RUN npx playwright install-deps || true

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Command will be provided by smithery.yaml
CMD ["node", "build/index.js"]
