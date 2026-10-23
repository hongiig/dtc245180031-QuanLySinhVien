FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Chay duoi user khong dac quyen (Hardening)
USER node

EXPOSE 3000
CMD ["node", "server.js"]
