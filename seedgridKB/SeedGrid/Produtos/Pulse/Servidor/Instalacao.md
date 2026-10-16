---
tags: [seedgrid, produto, pulse, servidor, instalacao, deploy]
fonte: seedgrid-products/seedgrid-pulse/backend
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse (servidor) — instalação e execução

O **servidor Pulse** é o backend Rust (Axum): API REST, WebSocket, entrega, retry, DLQ, presença e módulos de plataforma. A UI é outro componente: [[SeedGrid/Produtos/Pulse/UI/Visao-geral|Pulse UI]].

Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]] · variáveis: [[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração do servidor]] · brokers: [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers (Redis, Valkey, Dragonfly, NATS, RabbitMQ)]]

## Modos de execução

| Modo | Quando | Persistência |
|---|---|---|
| **Memória** (sem `POSTGRES_URL`) | desenvolvimento rápido, testes | nenhuma; plataforma (login, audit, apikeys) **desabilitada** — só o núcleo realtime |
| **Postgres** | produção de instância única | mensagens, contas, usuários, audit |
| **Distribuído** | várias réplicas | Postgres + broker pub/sub + presença em Redis |

Exemplos de `env` (Confirmado — `backend/README.md`):

```env
# simples
BROKER_PROVIDER=memory
PRESENCE_BACKEND=memory
DELIVERY_STORE_BACKEND=memory

# com Postgres
DELIVERY_STORE_BACKEND=postgres
POSTGRES_URL=postgres://<user>:<senha>@<host>:5432/<db>

# distribuído
BROKER_PROVIDER=redis
PRESENCE_BACKEND=redis
DELIVERY_STORE_BACKEND=postgres
BROKER_REDIS_URL=redis://<host>:6379/0
```

## Subir com Docker/Podman Compose

Em `backend/`:

```bash
docker compose up -d --build
```

Sobe `postgres`, `redis`, `seedgrid-pulse`, `prometheus`, `grafana` e `seedgrid-pulse-ui`. Portas locais (Confirmado — `docker-compose.yml`): API `18080`, Prometheus `19090`, Grafana `13001`, UI `13000`.

O compose de desenvolvimento traz valores de exemplo (chave de servidor, segredo do token, admin inicial). **Troque todos** em qualquer ambiente real. 🔒

## Rodar a partir do fonte

Pré-requisitos: Rust estável recente (edition 2024) e o repositório de crates da plataforma clonado ao lado (path dependencies).

```text
<raiz>/
├─ seedgrid-platform/rust/              # crates seedgrid-rust-crate-*
└─ seedgrid-products/seedgrid-pulse/    # este repo
```

O prefixo `../../../seedgrid-platform/rust/` está em `backend/Cargo.toml`; ajuste-o se o layout for outro.

```bash
cd backend
docker compose up -d postgres redis
cargo run
```

O build não precisa de banco (não há `sqlx::query!` verificada em compilação).

## Primeiro acesso

Com `POSTGRES_URL` e o par RSA do JWT, o boot roda as migrations e cria a company da plataforma e o **primeiro admin** a partir de `SEEDGRID_SECURITY_FIRST_ADMIN_USER_*` e `SEEDGRID_SECURITY_DEFAULT_COMPANY_*` ([[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração]]). Entre na UI com esse admin, crie a **conta** do seu produto e as **chaves** (Contas → conta → Chaves → Nova chave). O segredo da chave aparece **uma única vez**.

Par RSA do JWT (exemplo):

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -pubout -in private.pem -out public.pem
```

Aponte `SECURITY_PRIVATE_KEY_LOCATION` / `SECURITY_PUBLIC_KEY_LOCATION` (ou use PEM inline).

## Imagem e deploy

- Imagem no GHCR: `ghcr.io/seedgrid/seedgrid-pulse-backend` (Confirmado — `.github/workflows/deploy.yml`).
- `push` em `main` dispara o workflow, que detecta o que mudou, publica a imagem e chama o webhook do EasyPanel (secret `EASYPANEL_DEPLOY_URL_PULSE_BACKEND`). Commit só de documentação **não** redeploya.
- O container escuta `8080`; use `HTTP_HOST=0.0.0.0` em container.
- Probes: liveness `GET /health`, readiness `GET /ready` (200/503 com o estado de store, broker e presença).
- Migrations rodam no boot (`POSTGRES_RUN_MIGRATIONS`, padrão `true`).

## Checklist de produção

- [ ] `POSTGRES_URL` + `DELIVERY_STORE_BACKEND=postgres`.
- [ ] Mais de uma réplica ⇒ broker pub/sub (`redis`, ou `nats`/`rabbitmq` — ver [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers]]) **e** `PRESENCE_BACKEND=redis`.
- [ ] `SEEDGRID_PULSE_SERVER_KEY` e `SEEDGRID_PULSE_CONNECT_TOKEN_SECRET` longos e aleatórios, só em ENV. 🔒
- [ ] `SEEDGRID_PULSE_PUBLIC_WS_URL` com o endereço público do WebSocket (`wss://…`), se há clientes de navegador.
- [ ] `CORS_ALLOWED_ORIGINS` com a origem da UI.
- [ ] Par RSA do JWT próprio; admin inicial trocado.
- [ ] `SEEDGRID_SHOW_DEV_MESSAGE` desligado (padrão).
- [ ] Proxy reverso **não** repassa `x-seedgrid-company-id` / `x-seedgrid-all-companies` vindos do cliente.
- [ ] Retenção do histórico decidida (padrão: nunca apagar) — [[SeedGrid/Produtos/Pulse/Servidor/Operacao|Operação]].
