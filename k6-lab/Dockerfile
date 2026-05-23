FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache docker-cli \
  && npm install --production
COPY . .

EXPOSE 3006
CMD ["node", "server.js"]
