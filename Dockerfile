# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID}"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_URL=http://127.0.0.1:4000
ENV API_PORT=4000
ENV WEB_PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 flexywork

COPY --from=builder --chown=flexywork:nodejs /app/package.json ./package.json
COPY --from=builder --chown=flexywork:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=flexywork:nodejs /app/.next ./.next
COPY --from=builder --chown=flexywork:nodejs /app/public ./public
COPY --from=builder --chown=flexywork:nodejs /app/server ./server
COPY --from=builder --chown=flexywork:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=flexywork:nodejs /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER flexywork
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${WEB_PORT}/api/health" > /dev/null || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
