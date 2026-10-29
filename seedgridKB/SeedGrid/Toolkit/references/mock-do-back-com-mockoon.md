---
description: "Como o produto gerado pelo sg-new-product traz um back falso (Mockoon) para o front rodar sem o back real; como subir, apontar o front e editar. Leia ao passar o front para outro desenvolvedor."
---
# Mock do back com Mockoon

Todo produto gerado pelo `sg-new-product` com front ou admin traz um **back falso** com dados fictícios em pt-BR, para o front rodar sem o back real, sem banco e sem as extensions. Extension **não** cria mock; ele vive só no produto (decisão do dono, 2026-10-27).

## O que o produto traz
- `mocks/<produto>.mockoon.json`: só as rotas dos módulos escolhidos na matriz (autenticação, perfil, 2FA, usuários e perfis; os demais módulos entram aos poucos).
- Serviço `mockoon` no `docker-compose.yml` (`mockoon/cli:9.9.0`), com `profiles: ["mock"]`: **não sobe por padrão**.
- O manifesto `.seedgrid/manifesto.json` registra o mock; `--reconfigurar` adiciona e remove rotas junto com o módulo.

## Como usar
1. Subir o mock: `docker compose --profile mock up -d mockoon` (porta `3100`, só em `127.0.0.1`; o quadro de portas do produto a lista).
2. Apontar o front para ele **por variável de ambiente na linha de comando**, não por arquivo: `SEEDGRID_APP_API_BASE_URL=http://127.0.0.1:3100`. (O `.gitignore` do produto ignora `.env.*`.)
3. Editar rotas e dados: **não há interface web**; abra `mocks/<produto>.mockoon.json` no aplicativo desktop do Mockoon.

## Regras dos dados
- Pt-BR, sem dado real; ids fixos (o mesmo produto gera sempre o mesmo arquivo), para os testes do front não quebrarem.
- O token de login é um JWT fictício de assinatura inválida de propósito: só o front lê o claim `audience`.
- Os caminhos espelham o `RestControllerPath` das extensions; se uma rota mudar, o mock precisa acompanhar (hoje sem guardião).

Ver também a ADR 55 (KB de plataforma): o mock vive só no host.
