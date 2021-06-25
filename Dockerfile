FROM node:14-alpine

EXPOSE 5000

WORKDIR /app

CMD ["node", "dist/index.js"]