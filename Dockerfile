FROM node:lts-alpine

WORKDIR /usr/app

COPY build ./build

COPY package-docker.json ./package.json

RUN npm install

COPY config.yml .

COPY webserver.js .

CMD [ "npm" , "start" ]