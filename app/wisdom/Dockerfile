FROM node:lts-alpine

WORKDIR /app

EXPOSE 3000
EXPOSE 3001

ENV DATA_DIR=/data
ENV DIST_DIR=/dist
ENV NO_PREVIEW=true

COPY package.json package.json

RUN npm install

COPY dist ./dist

RUN npm link

ENTRYPOINT [ "wisdom", "serve" ]