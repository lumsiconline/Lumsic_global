FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm prune --omit=dev && chown -R node:node /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["npm","start"]