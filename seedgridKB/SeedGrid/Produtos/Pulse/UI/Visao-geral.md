---
tags: [seedgrid, produto, pulse, ui, nextjs]
fonte: seedgrid-products/seedgrid-pulse/frontend/seedgrid-pulse-ui
branch: main
commit: 9dcbdad
analisado-em: 2026-10-16
---

# Pulse UI — visão geral, instalação e execução

Painel web **operacional/administrativo** do Pulse (Next.js + React + `@seedgrid/fe-components`). É um componente separado do servidor: tem imagem, deploy e variáveis próprios. Variáveis: [[SeedGrid/Produtos/Pulse/UI/Configuracao|Configuração da UI]]. Servidor: [[SeedGrid/Produtos/Pulse/Servidor/Instalacao|Pulse (servidor)]].

Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral do Pulse]]

## O que a UI faz

| Área | Telas |
|---|---|
| Visão operacional | dashboard, conexões ativas, métricas e agregados |
| Mensagens | listagem (mais recente primeiro), detalhe (entregas por destinatário e tentativas, com o motivo `result_timeout` traduzido), publicação manual (inclui o campo opcional "Prazo de execução (s)"), **lixeira** (filtro "Na lixeira") |
| Pendências | backlog, descarte |
| Falhas | DLQ (reprocessar, limpar), lixeira da DLQ |
| Entregas | entregas por destinatário |
| Contas | contas, chaves (criar, rotacionar, revogar), **lixeira de contas** |
| Segurança | usuários, perfis/permissions, auditoria |
| Configurações | ajustes de entrega em runtime (retry, TTL, retenção, lixeira) |

Idiomas: en, pt-BR, pt-PT, fr, es.

## Como ela autentica

A UI **não guarda credencial de conexão**. As telas usam o **JWT do operador logado** (login do `security`) e cada ação exige a **permission** correspondente (RBAC) — ver [[SeedGrid/Produtos/Pulse/Autenticacao-e-chaves|Autenticação e chaves]]. Antes existiam `NEXT_PUBLIC_PULSE_BASIC_USER/_PASSWORD`; foram removidas porque o Next as embutia no bundle e elas ficavam legíveis no HTML. A tela de publicação publica **como o operador** (`PULSE_MESSAGE_PUBLISH`), não com a chave de servidor.

## Instalação e execução

Requisitos: Node 22 (a imagem usa `node:22-bookworm-slim`; Next 16, React 19).

```bash
cd frontend/seedgrid-pulse-ui
npm install
npm run dev          # http://127.0.0.1:3000
```

Variáveis em `.env` (copie de `.env.example`). Com o `podman-compose`/`docker compose` da pasta, a UI sobe em `http://127.0.0.1:13000` junto de Pulse, Postgres e Redis.

Qualidade e testes:

```bash
npm run lint
npm run build
npm test                  # unitários (vitest)
npm run test:integration  # sobe um mock do Pulse com testcontainers
```

## Imagem e deploy

- Imagem no GHCR: `ghcr.io/seedgrid/seedgrid-pulse-ui` (Confirmado — `.github/workflows/deploy.yml`).
- `push` em `main` com mudança em `frontend/**` publica a imagem e chama o webhook do EasyPanel (secret `EASYPANEL_DEPLOY_URL_PULSE_UI`).
- As variáveis são lidas em **runtime** pelo layout (`force-dynamic`): troca-se de ambiente mudando o env do container, **sem rebuild**.

## Rede: dois endereços do mesmo servidor

| Quem acessa | Variável | Exemplo |
|---|---|---|
| **Navegador** do operador | `SEEDGRID_PULSE_SERVER_BASE_URL` | `https://pulse.exemplo.com` |
| **Servidor da UI** (proxies `/api/security/*`, `/api/pulse/messages`) | `SEEDGRID_PULSE_INTERNAL_BASE_URL` | `http://seedgrid-pulse:8080` (mesma rede de containers) |

Se a UI e o servidor estão em containers na mesma rede, defina os dois; o interno é opcional e, ausente, usa o primeiro.

## Atenção

- A UI não deve receber `SEEDGRID_PULSE_SERVER_KEY`: a chave de servidor não publica e não pertence ao serviço da UI.
- O servidor precisa de `CORS_ALLOWED_ORIGINS` com a origem da UI.
- Papel `ADMIN` herda as permissions de lixeira (`PULSE_MESSAGE_DELETE/PURGE`, `PULSE_ACCOUNT_DELETE/PURGE`); outros perfis precisam recebê-las para ver os botões.
