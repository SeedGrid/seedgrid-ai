---
tags: [seedgrid, produto, pulse, servidor, configuracao, variaveis]
fonte: seedgrid-products/seedgrid-pulse/backend (src/config.rs, env.md)
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse (servidor) — variáveis de ambiente

Todas as variáveis do **servidor**. As da UI estão em [[SeedGrid/Produtos/Pulse/UI/Configuracao|Configuração da UI]]. Arquitetura atual: **login-tenancy, banco único** — a separação entre clientes é lógica, por `company_id`. Sem `POSTGRES_URL` o servidor sobe em modo memória/dev com a plataforma desabilitada.

Convenção: 🔒 = segredo (nunca em repositório/log); valores de exemplo são placeholders, **não** padrões.

## Runtime (HTTP, WebSocket, CORS)

| Variável | Padrão | Descrição |
|---|---|---|
| `HTTP_HOST` | `127.0.0.1` | IP de bind. Em container use `0.0.0.0`. |
| `HTTP_PORT` | `8080` | Porta HTTP. |
| `WS_PATH` | `/ws` | Path do WebSocket legado (o endpoint do protocolo é `/api/v1/connect`). |
| `CORS_ALLOWED_ORIGINS` | vazio | Lista separada por vírgula. Vazio = nenhuma origem liberada. |
| `WS_HEARTBEAT_INTERVAL_SECONDS` | `30` | Heartbeat do WebSocket. |
| `WS_IDLE_TIMEOUT_SECONDS` | `90` | Fecha conexão ociosa. |

## Credenciais do Pulse 🔒

| Variável | Padrão | Descrição |
|---|---|---|
| `SEEDGRID_PULSE_SERVER_KEY` | — | Chave **administrativa** (contas/chaves, métricas) em `x-api-key`. **Não publica** (403). Só em ENV; fica só com a operação do Pulse. |
| `SEEDGRID_PULSE_CONNECT_TOKEN_SECRET` | — | Segredo HMAC-SHA256 que assina o token curto de conexão. Sem ele, `POST /api/v1/connect-tokens` responde 503. |
| `SEEDGRID_PULSE_CONNECT_TOKEN_PREVIOUS_SECRET` | — | Segredo anterior, aceito só na verificação (rotação sem derrubar tokens válidos). |
| `SEEDGRID_PULSE_CONNECT_TOKEN_TTL_SECS` | `300` | Validade do token quando o pedido não informa `ttlSeconds`. É a janela para **conectar**. |
| `SEEDGRID_PULSE_CONNECT_TOKEN_MAX_TTL_SECS` | `900` | Teto: pedido acima → 422. |
| `SEEDGRID_PULSE_CONNECT_TOKEN_RATE_PER_KEY` | `600` | Emissões/min por chave `project`; `0` desliga. Por instância. |
| `SEEDGRID_PULSE_CONNECT_TOKEN_RATE_PER_SUBJECT` | `30` | Emissões/min por `subject` na mesma chave; `0` desliga. Por instância. |
| `SEEDGRID_PULSE_PUBLIC_WS_URL` | — | Endereço **público** do WebSocket devolvido em `connectUrl`. Ausente = campo omitido. |

Quem usa cada credencial: [[SeedGrid/Produtos/Pulse/Autenticacao-e-chaves|Autenticação e chaves]].

## Persistência e mensageria

| Variável | Padrão | Descrição |
|---|---|---|
| `POSTGRES_URL` | — | **Interruptor da plataforma.** Sem ela, security/login-tenancy/audit/apikeys ficam desligados. 🔒 |
| `POSTGRES_RUN_MIGRATIONS` | `true` | Roda migrations na subida. |
| `DELIVERY_STORE_BACKEND` | `memory` | `memory` \| `postgres`. Em produção, `postgres`. |
| `BROKER_PROVIDER` | `memory` | `memory` \| `redis` \| `nats` \| `rabbitmq` (fallback `EVENT_BUS_BACKEND`). Valor desconhecido cai em `memory`. Detalhes e variáveis por provider: [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers]]. |
| `PRESENCE_BACKEND` | `memory` | `memory` \| `redis`. Multi-réplica ⇒ `redis`. |
| `BROKER_REDIS_URL` | — | URL Redis-compatível (fallback `REDIS_URL`). 🔒 |
| `BROKER_REDIS_CHANNEL` | `seedgrid:pulse:events` | Canal pub/sub (fallback `REDIS_PUBSUB_CHANNEL`). |
| `BROKER_NATS_URL` | — | URL do NATS (`nats://host:4222`; fallback `NATS_URL`). Obrigatória com `nats`. 🔒 |
| `BROKER_NATS_SUBJECT` | `seedgrid.pulse.events` | Subject do pub/sub. |
| `BROKER_RABBITMQ_URL` | — | URL AMQP (fallbacks `RABBITMQ_URL`, `AMQP_URL`). Obrigatória com `rabbitmq`. 🔒 |
| `BROKER_RABBITMQ_EXCHANGE` | `seedgrid.pulse.events` | Exchange fanout. |

As URLs Redis-compatíveis servem para Valkey e Dragonfly sem mudar mais nada; ver [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers]].

## Entrega (retry, TTL, limpeza)

Os pares `*_CAP` são o **teto** que uma configuração por mensagem pode pedir; omitidos, assumem o valor base. Todos (exceto o intervalo de limpeza) são editáveis em runtime em **Configurações**.

| Variável | Padrão | Descrição |
|---|---|---|
| `DELIVERY_RETRY_STRATEGY` | `exponential` | `exponential` (qualquer outro valor = linear). |
| `DELIVERY_RETRY_BASE_MS` | `300` | Backoff base. |
| `DELIVERY_RETRY_MAX_MS` | `5000` | Backoff máximo. |
| `DELIVERY_MAX_ATTEMPTS` | `20` | Tentativas de execução por mensagem (modo `processed`). |
| `DELIVERY_TTL_SECONDS` | `86400` | TTL da mensagem (1 dia). |
| `DELIVERY_RETRY_BASE_MS_CAP` / `DELIVERY_RETRY_MAX_MS_CAP` / `DELIVERY_MAX_ATTEMPTS_CAP` / `DELIVERY_TTL_SECONDS_CAP` | = valor base | Tetos para o override por mensagem. |
| `DELIVERY_CLEANUP_INTERVAL_SECONDS` | `60` | Intervalo do poller de limpeza/expiração. Exige reinício. |
| `DELIVERY_CLEANUP_RETENTION_DAYS` | `0` (nunca apaga) | **Dias** que uma mensagem em estado final (`completed`/`dead_letter`/`expired`) é mantida. `0` desliga a varredura: o histórico é prova. Obsoleta: `DELIVERY_CLEANUP_RETENTION_SECONDS` (lida só se a de dias não existir). |
| `DELIVERY_TRASH_AUTO_CLEAN_DAYS` | `0` (só manual) | Dias na lixeira antes da limpeza automática. Cada limpeza vai ao audit como `system:pulse`. |

Detalhes e as regras de lixeira: [[SeedGrid/Produtos/Pulse/Servidor/Operacao|Operação]].

## Security (login, JWT, RBAC)

Habilitado com `POSTGRES_URL` **e** as chaves RSA. Nomes alinhados à extension Java `security` ([[SeedGrid/Extensions/security/Configuracao|Configuração do security]]).

| Variável | Descrição |
|---|---|
| `SECURITY_PRIVATE_KEY_LOCATION` / `SECURITY_PUBLIC_KEY_LOCATION` | Caminhos do par RSA (primários). 🔒 |
| `SECURITY_JWT_PRIVATE_KEY_PEM` / `SECURITY_JWT_PUBLIC_KEY_PEM` | PEM inline (secundário). 🔒 |
| `SECURITY_JWT_ISSUER` / `SECURITY_JWT_KID` | Issuer e `kid` do JWT. |
| `SECURITY_JWT_TTL` | Validade do access token, ISO-8601 (`PT8H`). |
| `SECURITY_REFRESH_TOKEN_TTL` | Validade do refresh token (`P30D`). |
| `SECURITY_PASSWORD_MIN_SIZE` / `_EXPIRATION_DAYS` / `_MAX_HISTORY` | Política de senha. |
| `SECURITY_ENCRYPTION_KEY` | AES-256 (base64) da cripto de campo; obrigatória se usar TOTP. 🔒 |
| `SECURITY_FRONTEND_BASE_URL` | Base da UI nos links de e-mail. |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` / `_NAME` / `_INITIAL_PASSWORD` | Bootstrap do primeiro admin. 🔒 |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` / `_CORPORATE_NAME` / `_TRADE_NAME` | Company da plataforma (razão social e fantasia são obrigatórias no bootstrap). |

### 2FA

Desligado por padrão. `SEEDGRID_SECURITY_2F_ENABLED=true` liga; `_ALLOWED_METHODS` (`EMAIL,TOTP`), `_DEFAULT_METHOD` (`TOTP`), `_EMAIL_CODE_TTL`, `_SESSION_TTL`, `_VERIFY_MAX_ATTEMPTS` (5), `_TOTP_ISSUER` (`SeedGrid`; vale trocar para `SeedGrid Pulse`), `_TOTP_DIGITS` (6), `_TOTP_PERIOD` (30), `_TOTP_WINDOW` (1), `_BACKUP_CODES_COUNT` (10). WhatsApp: `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` mais um provider em `SEEDGRID_WHATSAPP_API` (`evolution`/`cloud`) com credenciais ([[SeedGrid/Extensions/whatsapp/Configuracao|whatsapp]]).

### E-mail (SMTP)

`SECURITY_MAILER_USERNAME` e `_PASSWORD` ligam o SMTP real (🔒); `_HOST` (`smtp.gmail.com`), `_PORT` (587), `_START_TLS` (`REQUIRED`), `_FROM`. **Sem usuário e senha o e-mail só vai para o log** — confirmação, reset de senha e 2FA por e-mail não chegam.

## Login-tenancy

`SEEDGRID_LOGIN_TENANCY_APP_CODE` (`seedgrid-app`; use `seedgrid-pulse`), `_APP_NAME`, `_DATABASE_MIGRATE_AT_START` (`true`), `_DATABASE_BASELINE_ON_MIGRATE` (`true`), `_FOUNDATION_STATUS_ENABLED`, `_FOUNDATION_HEALTH_ENABLED`, `_BOOTSTRAP_ENABLED`, `_BOOTSTRAP_ADMIN_ENABLED`. Não existe flag "enabled": a dependência ativa o baseline. `SEEDGRID_SHOW_DEV_MESSAGE` (`false`) inclui detalhe interno nos erros — **nunca em produção**. Ver [[SeedGrid/Extensions/login-tenancy/Configuracao|login-tenancy]].

## Audit

`SEEDGRID_AUDIT_ENABLED` (`true`), `AUDIT_STRATEGY` (`JPA` = Postgres \| `MONGODB`), `SEEDGRID_AUDIT_DB_*` só para banco de auditoria separado, `SEEDGRID_AUDIT_MONGODB_URI`/`_DATABASE`. No deploy padrão as migrations de audit rodam no mesmo banco. A leitura é escopada por `company_id` via headers internos sobrescritos pelo JWT — não os repasse de proxy. Ver [[SeedGrid/Extensions/audit/Configuracao|audit]].

## API keys

`SEEDGRID_APIKEYS_PREFIX_LENGTH` (`8`), `SEEDGRID_APIKEYS_KEY_BYTES` (`32`). Ver [[SeedGrid/Extensions/apikeys/Configuracao|apikeys]].

## Observabilidade

`RUST_LOG` (ex.: `info`). Métricas: `GET /metrics` (JSON) e `GET /metrics/prometheus`; Prometheus e Grafana vêm no compose.

## Variáveis removidas (não configure)

As de multitenancy por subdomínio (`DOMAIN_SUFFIX`, `SEEDGRID_MULTITENANCY_*`, `PRODUCT_PREFIX`, `MULTITENANCY_MAILER_*`) foram eliminadas e são ignoradas. Backup (`BACKUP_*`) e billing (`SEEDGRID_BILLING_*`) não se aplicam ao Pulse hoje.

## Pegadinhas

- A chave de servidor nunca vai para produto nenhum nem para o serviço da UI.
- Variável definida no EasyPanel **vence** o padrão de código: ao mudar um padrão, confira o ambiente.
- `0` em retenção/limpeza significa **desligado** (não "apagar tudo").
