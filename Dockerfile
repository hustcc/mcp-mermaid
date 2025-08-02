FROM node:lts-bookworm-slim

WORKDIR /app

COPY . .

RUN npm install \
    && npm run build \
    && npx playwright install --with-deps chromium \
    && apt-get clean \
    && npm prune --omit=dev \
    && npm cache clean --force \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt/*

CMD ["node", "build/index.js"]