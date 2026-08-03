FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

EXPOSE 3003

WORKDIR /app/server
CMD ["node", "server.js"]
