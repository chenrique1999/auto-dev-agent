FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY . .

# alinhar porta
ENV PORT=7777
EXPOSE 7777

# executar como usuário sem privilégios
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["npm","start"]
