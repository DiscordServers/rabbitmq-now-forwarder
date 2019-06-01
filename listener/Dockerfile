FROM node:10.15.3-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/
RUN npm run build

RUN rm -r src prettier.config.js tsconfig.json README.md

CMD npm run start
