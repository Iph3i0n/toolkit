FROM node:lts-alpine

WORKDIR /app

ENV DATABASE_LOCATION=/data/db.db
ENV IMAGES_LOCATION=/data/images
EXPOSE 3000

COPY package.json package.json

RUN npm install

COPY dist ./dist

ENTRYPOINT [ "node", "." ]