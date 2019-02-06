FROM node:8.11.1-alpine

WORKDIR /app

COPY bot.js ./
COPY lib ./

RUN npm install --only=production

CMD [ "node", "bot.js" ]