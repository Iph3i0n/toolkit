FROM node:lts-alpine AS setup

RUN npm install -g @go-task/cli

WORKDIR /lib

COPY . .

RUN npm install

FROM setup AS wisdom

RUN task wisdom:build

WORKDIR /lib/app/wisdom
RUN npm link

WORKDIR /app

ENV DATA_DIR=/data
ENV DIST_DIR=/dist
ENV NO_PREVIEW=true

EXPOSE 3000
EXPOSE 3001

ENTRYPOINT [ "wisdom", "serve" ]

FROM setup AS nandemo

RUN task nandemo:build

WORKDIR /lib/app/nandemo

EXPOSE 3000

ENV DATABASE_LOCATION=/data/db.db
ENV IMAGES_LOCATION=/data/images

ENTRYPOINT [ "node", "." ]