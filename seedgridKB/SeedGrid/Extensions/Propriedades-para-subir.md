---
description: "O que o backend de um produto SeedGrid precisa em dev.env para subir (login-tenancy e subdomain-tenancy), como obter cada valor (fixo, derivado, gerado com openssl, par RSA do JWT) e quais são segredos. Leia antes de montar ou revisar o dev.env de um produto novo."
tags: [seedgrid, host, dev-env, configuracao, produto-novo]
analisado-em: 2026-10-19
---

# Propriedades para subir (dev.env)

Fonte: `backend/dev.env.example` dos boilerplates `login-tenancy` e `subdomain-tenancy` (versionados) e as notas de [[SeedGrid/Extensions/Catalogo-de-propriedades|propriedades]] de cada extension. **O `dev.env` real nunca é versionado.** O que vai para o git é o `dev.env.example`, só com valores de desenvolvimento e marcadores (`change-me`). Segredo **nunca** vem copiado de outro projeto: é gerado para cada produto.

Cada variável do `.env` do front e do admin também tem um `.env.example` no produto (`frontend/.env.example`, `admin/.env.example`), criado pelo scaffold mesmo que o boilerplate não o traga.

## Como obter cada valor

| Origem | Significado |
|---|---|
| **fixo** | Valor de desenvolvimento que pode ficar como está (porta, flag, host local) |
| **resposta** | Vem de uma resposta da matriz do `sg-new-product` (nome, domínio, modelo, provider) |
| **gerado** | Gerado por produto; segredo; nunca fixo nem copiado (comando abaixo) |
| **externo** | Credencial de serviço de terceiro (Stripe, Evolution): o dono do produto fornece; no dev fica um marcador |

Comandos de geração (equivalentes em qualquer sistema com `openssl`):

| O quê | Comando |
|---|---|
| Chave simétrica de 32 bytes (Base64) | `openssl rand -base64 32` |
| Chave de 32 bytes em hexadecimal | `openssl rand -hex 32` |
| Senha de banco / MinIO / Mongo | `openssl rand -base64 24` |
| Par RSA do JWT (PKCS#8) | `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem` |
| Chave pública a partir da privada | `openssl pkey -in private.pem -pubout -out public.pem` |
| Privada em Base64 (DER) | `openssl pkey -in private.pem -outform DER \| openssl base64 -A` |
| Pública em Base64 (DER) | `openssl pkey -in private.pem -pubout -outform DER \| openssl base64 -A` |

Para o JWT há duas formas: variáveis `*_BASE64` (vencem a outra) ou arquivos `keys/private.pem` e `keys/public.pem`. `MP_JWT_VERIFY_PUBLICKEY` precisa receber o **mesmo** valor da pública Base64 (não há ponte automática). Tanto `keys/` quanto `*.pem` ficam no `.gitignore`.

## Obrigatório para subir: login-tenancy (B2B e B2C)

| Variável | Origem | Segredo | Observação |
|---|---|---|---|
| `APP_NAME`, `HTTP_PORT` | resposta / fixo | não | `HTTP_PORT` padrão 8080 |
| `SEEDGRID_DB_URL`, `SEEDGRID_DB_USERNAME` | fixo | não | URL do PostgreSQL do compose |
| `SEEDGRID_DB_PASSWORD` | gerado | **sim** | a mesma senha vai ao serviço `postgres` do compose |
| `SEEDGRID_SECURITY_FRONTEND_BASE_URL` | resposta | não | origem do front/admin; prefixo dos links dos e-mails |
| `SECURITY_JWT_ISSUER`, `SECURITY_JWT_KID`, `SECURITY_JWT_TTL`, `SECURITY_REFRESH_TOKEN_TTL` | resposta / fixo | não | issuer = URL real em produção |
| `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64`, `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64`, `MP_JWT_VERIFY_PUBLICKEY` | gerado (par RSA) | **privada: sim** | ver tabela de comandos |
| `SEEDGRID_SECURITY_ENCRYPTION_KEY` | gerado | **sim** | `openssl rand -base64 32` |
| `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED` | fixo | não | com `true`, exige as duas chaves abaixo |
| `SEEDGRID_PRIVACY_CRYPTO_KEY` | gerado | **sim** | Base64 de 32 bytes |
| `SEEDGRID_PRIVACY_SEARCH_KEY` | gerado | **sim** | 32 bytes ou mais (`openssl rand -hex 32`) |
| `SECURITY_MAILER_FROM`, `_HOST`, `_PORT`, `_START_TLS` | resposta / fixo | não | em dev: MailHog (`localhost`, porta do compose, `DISABLED`) |
| `SECURITY_MAILER_USERNAME`, `SECURITY_MAILER_PASSWORD` | externo | **sim** | vazios em dev com MailHog |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL`, `_NAME` | resposta | não | sem e-mail o primeiro admin não é criado |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD` | gerado | **sim** | exigida pela política de senha; troca no primeiro acesso |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ`, `_CORPORATE_NAME`, `_TRADE_NAME` | resposta | não | empresa-plataforma |

## Obrigatório para subir: subdomain-tenancy

| Variável | Origem | Segredo | Observação |
|---|---|---|---|
| `APP_NAME`, `HTTP_PORT`, `PRODUCT_PREFIX` | resposta / fixo | não | prefixo dos bancos de tenant |
| `SEEDGRID_SUBDOMAIN_TENANCY_DOMAIN_SUFFIX` | resposta | não | sem ele, todo request cai no tenant master; `localhost` em dev |
| `SEEDGRID_SUBDOMAIN_TENANCY_USE_HTTPS`, `_PORT` | fixo | não | |
| `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_URL`, `_USERNAME` e `TENANT_DB_URL`, `_USERNAME` | fixo | não | |
| `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_PASSWORD`, `TENANT_DB_PASSWORD` | gerado | **sim** | iguais à senha do `postgres` do compose |
| `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_NAME`, `_ADMIN_EMAIL` | resposta | não | |
| `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_INITIAL_PASSWORD` | gerado | **sim** | |
| `SEEDGRID_SECURITY_ENCRYPTION_KEY` | gerado | **sim** | `openssl rand -base64 32` |
| `SECURITY_JWT_ISSUER`, `SECURITY_JWT_KID`, `SEEDGRID_SECURITY_FRONTEND_BASE_URL` | resposta / fixo | não | |
| `SECURITY_PRIVATE_KEY_LOCATION`, `SECURITY_PUBLIC_KEY_LOCATION` | gerado | privada: **sim** | caminhos dos `.pem` (padrão `src/main/resources/keys/...`) ou as variáveis `*_BASE64` |
| `SECURITY_MAILER_*` e `SEEDGRID_SUBDOMAIN_TENANCY_MAILER_*` | fixo (dev) | não | MailHog |
| `SEEDGRID_AUDIT_PERSISTENCE_STRATEGY` | resposta (pergunta 6) | não | `jpa` ou `mongodb` |

## Depende das respostas da matriz

| Resposta | Variáveis | Origem e segredos |
|---|---|---|
| Self-enter | `SEEDGRID_SECURITY_SELF_ENTER_ENABLED`, `_INVITE_ENABLED`, `_INVITE_NEEDS_APPROVAL`, `SEEDGRID_SECURITY_FRONTEND_SELF_ENTER_PATH` (`/auth/self-enter`) | resposta; sem segredo |
| Auditoria em MongoDB | `SEEDGRID_AUDIT_PERSISTENCE_STRATEGY=MONGODB`, `SEEDGRID_AUDIT_MONGODB_URI` | URI com usuário e senha **gerada**, a mesma do serviço `mongodb` do compose; segredo |
| Armazenamento MinIO (avatar, backup) | `SEEDGRID_SECURITY_AVATAR_STORAGE=minio`, `SEEDGRID_SECURITY_AVATAR_MINIO_ENDPOINT/_BUCKET/_REGION/_ACCESS_KEY/_SECRET_KEY`, `SEEDGRID_BACKUP_STORAGE=minio`, `SEEDGRID_BACKUP_MINIO_*` | bucket e região fixos; `*_ACCESS_KEY` fixa (`admin` em dev); `*_SECRET_KEY` **gerada**, igual ao `MINIO_ROOT_PASSWORD` do compose |
| Armazenamento filesystem | `SEEDGRID_SECURITY_AVATAR_STORAGE=filesystem`, `SEEDGRID_BACKUP_STORAGE=filesystem`, `SEEDGRID_BACKUP_FILESYSTEM_BASE` | fixo; sem segredo e sem serviço extra |
| Billing com Stripe | `SEEDGRID_BILLING_PROVIDER=stripe`, `SEEDGRID_BILLING_STRIPE_APIKEY`, `SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET`, `_PRODUCT`, `_PRODUCT_NAME`, `_DEFAULTSUCCESSURL`, `_DEFAULTCANCELURL`, `SEEDGRID_BILLING_PORTAL_RETURN_URL`, `SEEDGRID_BILLING_TRIAL_ENABLED`, `SEEDGRID_BILLING_TRIAL_PLAN_TERM_PUBLIC_ID` | chaves **externas** (`sk_test_...`, `whsec_...`; no `dev.env` ficam como marcador até o dono fornecer); URLs vêm da resposta de domínio. Chave `sk_live_` nunca entra no repositório |
| 2FA por WhatsApp | `SEEDGRID_WHATSAPP_API`, `SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL`, `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY`, `SEEDGRID_SECURITY_2F_*` | URL e canal da resposta; `EVOLUTION_API_KEY` **externa** |
| Realtime (Pulse) | `SEEDGRID_REALTIME_ENABLED`, `_PULSE_BASE_URL`, `_PULSE_PROJECT_KEY`, `_TOKEN_TTL` | `PROJECT_KEY` **externa** (criada na UI do Pulse); desligado por padrão |
| ai-pricing | `SEEDGRID_AI_PRICING_SOURCE_URL`, `_TIMEZONE` | fixo; opcional |
| Cache (Redis, Valkey, Dragonfly) | provider e conexão em [[SeedGrid/Extensions/cache/Configuracao|cache/Configuração]] | senha do serviço, se houver, **gerada** |

## Front e admin (`.env.example` de cada um)

| Variável | Origem | Observação |
|---|---|---|
| `SEEDGRID_APP_API_BASE_URL` | resposta | URL do backend (padrão `http://127.0.0.1:<HTTP_PORT>`) |
| `SEEDGRID_TENANCY_DOMAIN` | resposta | só no subdomain-tenancy; `localhost` em dev |
| `OTEL_SDK_DISABLED` | fixo | `true` em dev |
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME`, `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | fixo | padrão `sg_<slug>_access_token` e `sg_<slug>_refresh_token`; o slug vem da resposta 1 |
| `SEEDGRID_CITIES_API_USERNAME`, `SEEDGRID_CITIES_API_KEY` | **externa** | só no signup do subdomain-tenancy; sem elas UF e cidade ficam vazios |

## Observabilidade (opcional)

`LOG_LEVEL`, `LOG_SEEDGRID_LEVEL`, `OTEL_SDK_DISABLED=true`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `JAVA_TOOL_OPTIONS=-Dvertx.disableDnsResolver=true`: fixos, sem segredo.

## Regras

- O `dev.env` fica no `.gitignore` junto de `*.env`, `*.env.*`, `*.pem` e `keys/`; a trava `check-secrets` reprova qualquer variante (`_dev.env`, `.bak`). Exceção: `*.example`.
- Valor externo que o dono ainda não forneceu fica como `change-me`; a aplicação sobe, e a funcionalidade que depende dele (checkout, WhatsApp, Pulse) fica inoperante até o preenchimento.
- Lacuna: o `login-tenancy` B2C ainda não tem boilerplate; esta nota passa a cobri-lo quando o `business-day` entregar.
