FROM node:18-alpine

RUN npm i -g pnpm@7
WORKDIR /code

COPY package.json pnpm-lock.yaml /code/
RUN pnpm i

COPY . /code

# TODO: 在生产环境跑，需要去掉 chokidar 等文件监听手段
CMD npm run dev
