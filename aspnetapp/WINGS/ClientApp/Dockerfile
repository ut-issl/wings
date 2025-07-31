# マルチステージビルド: ビルド段階
FROM node:18-alpine AS build

WORKDIR /app

# package.json と package-lock.json をコピー（依存関係のキャッシュ効率化）
COPY package*.json ./

# ビルドに必要なすべての依存関係をインストール（devDependenciesも含む）
RUN npm ci

# ソースコードをコピー（.dockerignoreで不要ファイルを除外）
COPY . .

# 環境変数設定
ENV REACT_APP_API_BASE_URL=http://backend:5000/api
ENV GENERATE_SOURCEMAP=false
ENV ESLINT_NO_DEV_ERRORS=true
ENV TSC_COMPILE_ON_ERROR=true

# プロダクションビルド
RUN npm run build

# マルチステージビルド: 本番段階
FROM nginx:alpine

# ビルド済みファイルをNginxの配信ディレクトリにコピー
COPY --from=build /app/build /usr/share/nginx/html

# Nginx設定ファイル
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
