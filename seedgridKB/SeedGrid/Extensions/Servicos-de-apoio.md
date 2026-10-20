---
description: "Serviços de apoio do docker-compose de um produto SeedGrid (PostgreSQL, Mailpit, MinIO, MongoDB, pgAdmin, cache, Pulse): imagem, portas locais, variáveis, healthcheck e qual extension exige cada um. Leia ao montar ou alterar o compose de um produto."
tags: [seedgrid, host, docker-compose, produto-novo]
analisado-em: 2026-10-19
---

# Serviços de apoio do compose

Fonte: `docker-compose.yml` dos boilerplates `login-tenancy` e `subdomain-tenancy` e o compose de um produto em uso (`lckfiscal`). **As senhas nunca ficam fixas no compose:** cada serviço lê a senha de uma variável (`${POSTGRES_PASSWORD}`, `${MINIO_ROOT_PASSWORD}`...), definida no `.env` da raiz do produto (não versionado) com o **mesmo valor** que o `dev.env` do backend usa. Como gerar: [[SeedGrid/Extensions/Propriedades-para-subir|Propriedades para subir]].

Todas as portas escutam em `127.0.0.1` (nunca expor o banco na rede). Cada serviço é um bloco independente: o compose do produto leva só os que as respostas da matriz pedem.

| Serviço | Imagem | Porta local (host:container) | Variáveis | Healthcheck | Quem exige |
|---|---|---|---|---|---|
| `postgres` | `postgres:16` | login-tenancy `5440:5432`; subdomain-tenancy `5441:5432` | `POSTGRES_DB` (`<slug>_app` ou `<slug>_master`), `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD` | `pg_isready -U postgres -d <db>` a cada 5 s, 10 tentativas | **Sempre** (security e demais com migrations) |
| `mailpit` | `axllent/mailpit:v1.31.6` | SMTP `1025:1025` (login-tenancy) ou `1026:1025` (subdomain-tenancy); UI e API `8025` / `8026` (só em `127.0.0.1`) | `MP_SMTP_AUTH_ACCEPT_ANY=1` e `MP_SMTP_AUTH_ALLOW_INSECURE=1` (aceita qualquer usuário e senha, inclusive nenhum) | — | `security`, `backup` e `subdomain-tenancy`: e-mail de dev (`*_MAILER_HOST=localhost`, porta SMTP, `START_TLS=DISABLED`). A caixa é única: todo e-mail enviado aparece na UI, qualquer que seja o destinatário (a API `/api/v1/messages` serve para testes). Substitui o MailHog (sem manutenção) nos produtos gerados pelo `sg-new-product`; o servidor e a imagem foram exercitados com envio por SMTP, com e sem credencial. |
| `minio` | `soldevelo/minio:2026.7.17` | `9000:9000` (API), `9001:9001` (console) | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_DEFAULT_BUCKETS`; comando `server /data --console-address ":9001"` | — | storage `minio` de `security` (avatar), `backup` e `filemanagement`. Buckets padrão: avatar e backup (ex.: `<slug>-avatars`, `<slug>-backups`) |
| `mongodb` | `mongo:7.0` | `27017:27017` | `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` | `mongosh --quiet --eval "db.adminCommand('ping')"` a cada 5 s | `audit` com estratégia `MONGODB` (URI `mongodb://<user>:<senha>@localhost:27017/?authSource=admin`) |
| `mongo-express` | `mongo-express:1.0.2` | `8081:8081` | `ME_CONFIG_MONGODB_URL`, `ME_CONFIG_BASICAUTH_USERNAME`, `ME_CONFIG_BASICAUTH_PASSWORD` | — | opcional: visualizar a auditoria Mongo |
| `pgadmin` | `dpage/pgadmin4:latest` | `5050:80` | `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD` | `depends_on` `postgres` saudável | opcional: visualizar o banco |
| cache (`redis`, `valkey` ou `dragonfly`) | **a confirmar** (a KB não traz imagem) | `6379` (padrão do protocolo) | senha, se houver | **a confirmar** | `cache` (e `resilience` distribuído, `security` com revogação de sessão compartilhada entre instâncias) |
| `pulse` | **a confirmar** (serviço do SeedGrid Pulse; local, o `backend/run.sh` do repositório do Pulse sobe em `127.0.0.1:18080`) | `18080` | chave `project` criada na UI do Pulse | — | `realtime` |

## Volumes

Um volume nomeado por serviço com dados: `postgres_data`, `minio_data`, `mongo_data`, `pgadmin_data`.

## Regras de montagem

- Subir só o que as respostas pedem: `postgres` e `mailpit` sempre; `minio` se alguma storage for MinIO; `mongodb` se a auditoria for Mongo; cache e `pulse` só com as extensions correspondentes. `pgadmin` e `mongo-express` são opcionais e entram só se o dono pedir.
- O nome do banco e a porta do `postgres` têm de coincidir com `SEEDGRID_DB_URL` (login-tenancy) ou `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_URL` e `TENANT_DB_URL` (subdomain-tenancy). No subdomain-tenancy o `postgres` precisa permitir `CREATE DATABASE` (provisionamento de tenant): usar o usuário `postgres`.
- Escolher portas livres na máquina; as do boilerplate (5440, 5441, 1025, 1026, 9000) podem colidir com outro produto em desenvolvimento. O scaffold ajusta a porta e reflete no `dev.env`.
- Depois de `docker compose up`, o backend só sobe depois de o `postgres` estar saudável.

## Lacunas

Imagem e healthcheck de `redis`/`valkey`/`dragonfly` e do `pulse` não estão na KB. Enquanto isso, o `sg-new-product` avisa o dono de que esses serviços devem ser fornecidos por ele e não os inclui no compose.
