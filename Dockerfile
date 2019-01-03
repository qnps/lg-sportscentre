FROM node:8.11.1-alpine

WORKDIR /app

COPY dist/* ./

RUN npm install --only=production

CMD [ "node", "bot.js" ]