FROM node:lts-alpine3.19

WORKDIR /app

COPY package.json package.json

RUN npm install

ENV PORT=8000

COPY . .

CMD [ "node", "index.js" ]