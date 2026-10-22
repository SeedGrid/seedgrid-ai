# syntax=docker/dockerfile:1

# ------------------------------------------------------------------
# Stage 1 — build. Os pacotes @seedgrid/* são públicos no npmjs;
# nenhum secret/.npmrc é necessário.
# ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# scripts/ precisa existir antes do npm ci (postinstall = strip-bom)
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ------------------------------------------------------------------
# Stage 2 — runtime (Alpine). Só o output standalone do Next.
# ------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE 3000
CMD ["node", "server.js"]
