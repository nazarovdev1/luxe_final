FROM node:22-slim

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy client build (assumes build is run before)
COPY client/build ./server/public

# Copy server source
COPY server/ ./server/

EXPOSE 3003

WORKDIR /app/server
CMD ["node", "server.js"]