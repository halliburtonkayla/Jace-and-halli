FROM node:24-alpine
WORKDIR /app
COPY . /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787 WORLD_DATA_DIR=/data
EXPOSE 8787
RUN mkdir -p /data && chown node:node /data
USER node
CMD ["node", "world/server/index.mjs"]
