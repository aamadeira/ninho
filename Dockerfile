FROM --platform=$BUILDPLATFORM node:26-alpine AS web-builder
WORKDIR /srv/ninho/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web ./
RUN npm run build

FROM --platform=$BUILDPLATFORM node:26-alpine AS api-builder
WORKDIR /srv/ninho/api
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api/tsconfig.json ./
COPY api/src ./src
RUN npm run build

FROM node:26-alpine
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/srv/ninho/data/ninho.db
WORKDIR /srv/ninho/api
RUN apk add --no-cache su-exec
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY api/migrations ./migrations
COPY --from=api-builder /srv/ninho/api/dist ./dist
COPY --from=web-builder /srv/ninho/web/dist ../web/dist
COPY --chmod=755 entrypoint.sh /usr/local/bin/ninho-entrypoint
RUN mkdir -p /srv/ninho/data && chown node:node /srv/ninho/data
EXPOSE 8080
ENTRYPOINT ["ninho-entrypoint"]
CMD ["node", "dist/app.js"]
