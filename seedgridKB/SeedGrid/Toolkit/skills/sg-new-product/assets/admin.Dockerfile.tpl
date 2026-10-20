# syntax=docker/dockerfile:1
# Modelo de publicacao do servico {{nome}} ({{slug}}). Preenchido por render.mjs a partir do produto.json.
# Baseado no Dockerfile do admin do boilerplate login-tenancy (origin/main): build Next.js
# multi-stage (node 22 alpine) com `npm ci` e runtime com o output standalone, usuario nao-root.
# Diferenca: a porta (PORT/EXPOSE) vem do produto.json.

FROM node:22-alpine AS build
WORKDIR /app

# scripts/ precisa existir antes da instalacao (postinstall = strip-bom)
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
LABEL org.opencontainers.image.title="{{slug}}-{{nome}}" \
      org.opencontainers.image.url="https://{{dominio}}"
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT={{porta}} \
    HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE {{porta}}
CMD ["node", "server.js"]
