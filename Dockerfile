FROM node:18-alpine

RUN apk add --no-cache bash
WORKDIR /code

COPY package.json pnpm-lock.yaml /code/

COPY . /code

# TODO: 在生产环境跑，需要去掉 chokidar 等文件监听手段
CMD npx vercel dev
