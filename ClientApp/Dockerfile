FROM node:18-alpine

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .


# ポート3000を公開
EXPOSE 3000

# React開発サーバーを起動
CMD ["npm", "run", "start"]
