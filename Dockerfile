FROM node:lts-bookworm-slim

# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括开发依赖，用于构建）
# 跳过 postinstall 脚本（避免过早安装 Playwright）
RUN npm ci --ignore-scripts

# 复制源代码
COPY . .

# 单独构建项目（不运行 prepare 脚本）
RUN npm run prebuild && npm run build

# 安装 Playwright，增加重试和更好的错误处理
RUN for i in 1 2 3; do \
        echo "Attempt $i: Installing Playwright..." && \
        npx playwright install --with-deps chromium && break || \
        if [ $i -eq 3 ]; then \
            echo "Failed to install Playwright after 3 attempts" && exit 1; \
        fi && \
        echo "Attempt $i failed, retrying in 30 seconds..." && \
        sleep 30; \
    done

# 清理缓存和不需要的文件
RUN npm prune --omit=dev && \
    apt-get clean && \
    npm cache clean --force && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/* && \
    rm -rf /tmp/*

CMD ["node", "build/index.js"]
