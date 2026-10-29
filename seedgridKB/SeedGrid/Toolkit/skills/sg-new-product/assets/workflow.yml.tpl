# Modelo do workflow de publicacao de {{nome}} no EasyPanel. Renderizado por render.mjs.
# Base: nao ha workflow de EasyPanel versionado do dono para copiar (lckfiscal/.github so tem hooks),
# entao usa o webhook de deploy do EasyPanel (POST em URL guardada em secret) depois de publicar a
# imagem no registry. A versao CalVer+sha segue o comentario do Dockerfile do backend do boilerplate.
# Secrets (cadastrar no repositorio): REGISTRY_USERNAME, REGISTRY_TOKEN e um EASYPANEL_WEBHOOK_<SERVICO>
# por servico. Nenhum valor secreto fica neste arquivo.
name: Publicar {{slug}}

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: publicar-{{slug}}
  cancel-in-progress: false

env:
  REGISTRY: {{registry}}
  PRODUTO_URL: https://{{dominio}}

jobs:
  # Segunda barreira contra credencial versionada (a primeira e' o hook de pre-commit): reprova antes de publicar.
  segredos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node .ai/skills/sg-check-secrets/scripts/check-secrets.mjs --ignore '^\.ai/' --ignore '^\.agents/' --ignore '^\.claude/'
  versao:
    needs: segredos
    runs-on: ubuntu-latest
    outputs:
      versao: ${{ steps.v.outputs.versao }}
    steps:
      - id: v
        run: echo "versao=$(date -u +%Y.%m.%d)-${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"
{{jobs}}
