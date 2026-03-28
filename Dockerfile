FROM node:lts-bookworm-slim

WORKDIR /app

COPY . .

RUN npm install --ignore-scripts \
  && npm run build \
  && npx playwright install --with-deps chromium \
  && apt-get clean \
  && npm prune --omit=dev \
  && npm cache clean --force \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/cache/apt/*

EXPOSE 3033

ENTRYPOINT ["node", "build/index.js"]

CMD ["--transport", "sse", "--port", "3033"]
