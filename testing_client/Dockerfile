FROM node:26-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN mkdir -p /sandbox
ENV SANDBOX_PATH=/sandbox

COPY . .

RUN npm run build

EXPOSE 8081
ENV PORT=8081
ENV NODE_ENV=production

CMD ["npm", "start"]
