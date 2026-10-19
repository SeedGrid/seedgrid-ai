# syntax=docker/dockerfile:1

# ------------------------------------------------------------------
# Stage 1 — build. Os pacotes @seedgrid/* são públicos no npmjs;
# nenhum secret/.npmrc é necessário.
# ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# scripts/ precisa existir antes do npm install (postinstall = strip-bom)
COPY package.json ./
COPY scripts ./scripts
# `npm ci` no report-admin. Aqui e' `install`: o boilerplate nasce SEM `package-lock.json` — o do
# report travaria as dependencias que este front nao tem mais (tiptap, recharts, fe-security).
# Gere o lock no primeiro `npm install` local, commite-o, e ENTAO troque esta linha de volta para
# `npm ci` (que e' o certo em CI: falha se o lock e o package.json divergirem).
RUN --mount=type=cache,target=/root/.npm \
    npm install

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
