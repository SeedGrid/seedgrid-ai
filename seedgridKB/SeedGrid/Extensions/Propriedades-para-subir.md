---
description: "O que o backend de um produto SeedGrid precisa em dev.env para subir (login-tenancy e subdomain-tenancy), como obter cada valor (fixo, derivado, gerado com openssl, par RSA do JWT) e quais são segredos. Leia antes de montar ou revisar o dev.env de um produto novo."
tags: [seedgrid, host, dev-env, configuracao, produto-novo]
analisado-em: 2026-11-08
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
| Privada em Base64 (DER, **PKCS#8**) | `openssl pkcs8 -topk8 -nocrypt -in private.pem -outform DER \| openssl base64 -A` |
| Pública em Base64 (DER) | `openssl pkey -in private.pem -pubout -outform DER \| openssl base64 -A` |

> **Atenção (2026-11-06):** `openssl pkey -in private.pem -outform DER` **não serve** para a privada: no OpenSSL 3.5.3 ele grava o DER em **PKCS#1** (`RSAPrivateKey`: `SEQUENCE { INTEGER 0, INTEGER n ... }`), mesmo a partir de um PEM `BEGIN PRIVATE KEY`, e o `RsaKeyProvider` do security falha com `algid parse error, not a sequence` (visto no display em produção). Para o Java a privada precisa ser PKCS#8 DER: use `openssl pkcs8 -topk8 -nocrypt -in private.pem -outform DER` (confirmado: `SEQUENCE { INTEGER 0, SEQUENCE { OBJECT rsaEncryption ...`). A **pública** (`pkey -pubout -outform DER`) está certa (X.509 SPKI). Confira o formato antes de subir: `echo "$B64" \| base64 -d \| openssl asn1parse -inform DER \| head -4` — o 3º item tem de ser `SEQUENCE` com `rsaEncryption`, não um `INTEGER` grande.

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
| `SECURITY_MAILER_FROM`, `_HOST`, `_PORT`, `_START_TLS` | resposta / fixo | não | em dev: Mailpit local (`localhost`, porta do compose, `DISABLED`); o remetente em dev é um por extension (`security@`, `backup@`, `subdomain.tenancy@` em `eu-dev.com.br`) |
| `SECURITY_MAILER_USERNAME`, `SECURITY_MAILER_PASSWORD` | externo | **sim** | em dev o `sg-new-product` grava usuário igual ao remetente e senha de preenchimento (`12345678`) só no `backend/dev.env`: o Mailpit aceita qualquer credencial; em produção são externos |
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
| `SECURITY_MAILER_*` e `SEEDGRID_SUBDOMAIN_TENANCY_MAILER_*` | fixo (dev) | não | Mailpit |
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
| `SEEDGRID_ADMIN_HOST` | resposta (domínio do admin) | só no `frontend` do subdomain-tenancy; opcional, **comentada** no `.env.example`. Padrão `admin.<SEEDGRID_TENANCY_DOMAIN>`; sem efeito com domínio `localhost`. Veja o checklist abaixo |
| `OTEL_SDK_DISABLED` | fixo | `true` em dev |
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME`, `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | fixo | padrão `sg_<slug>_access_token` e `sg_<slug>_refresh_token`; o slug vem da resposta 1 |
| `SEEDGRID_CITIES_API_USERNAME`, `SEEDGRID_CITIES_API_KEY` | **externa** | só no signup do subdomain-tenancy; sem elas UF e cidade ficam vazios |
| `SEEDGRID_APP_API_TOKEN` | vazia | **Deixe vazia em produção.** Bearer fixo de máquina, lido só no servidor (sem `NEXT_PUBLIC_`); só entra no `apiFetch` de `lib/seedgrid-app-api.ts` (chamada serviço-a-serviço, sem sessão de usuário). Veja a seção abaixo; segredo se for usada |
| `SEEDGRID_APP_API_COMPANY_ID` | vazia | **Deixe vazia em produção.** Fixa o `X-Company-Id` das chamadas do servidor; o backend só usa o header para token sem escopo de empresa. Veja a seção abaixo |

## Checklist de produção: admin do subdomain-tenancy

Conferido em 2026-11-08 nos fontes: `frontend/proxy.ts`, `frontend/.env.example`, `frontend/README.md`, `admin/lib/backend-fetch.ts` e `app/api/auth/confirm-email/route.ts` do boilerplate `subdomain-tenancy` (main, commit `62d5d28` em diante), e `RsaKeyProvider` da extension security. Não foi provado em produção nesta conferência (só a leitura dos fontes); o caso do display (2026-11-06) está em [[SeedGrid/Extensions/subdomain-tenancy/Configuracao|Configuração do subdomain-tenancy]].

Por que importa: o e-mail do admin inicial sai no boot, sem tenant, com a `seedgrid.security.frontend.base-url` **pura** (domínio raiz). O front do cliente não atende o master; quem atende é o app **admin** (que manda `X-Forwarded-Host` = `SEEDGRID_TENANCY_DOMAIN`). Por isso os 4 itens abaixo têm de estar certos antes de subir.

- [ ] **1. Host do admin.** Decida o host público do app admin (por exemplo `admin.seudominio.com.br`) e aponte o DNS e o proxy para o serviço `admin`. Ele tem de ficar **um nível** abaixo do wildcard do certificado (item 2) e não pode coincidir com um subdomínio de empresa (`admin` é nome reservado no cadastro).
- [ ] **2. Certificado.** Um wildcard `*.seudominio.com.br` cobre **um** nível: `admin.seudominio.com.br` e `empresa.seudominio.com.br` servem; `admin.produto.seudominio.com.br` (dois níveis) dá erro de TLS (`ERR_SSL_VERSION_OR_CIPHER_MISMATCH` no Cloudflare gratuito, no display). Se o produto vive em `produto.seudominio.com.br`, os tenants (`<empresa>.produto.seudominio.com.br`) também ficam a dois níveis: precisa de um wildcard próprio (`*.produto.seudominio.com.br`) ou de um host de admin de um nível (como `produto-admin.seudominio.com.br`).
- [ ] **3. `SEEDGRID_ADMIN_HOST` no `frontend`.** Defina no ambiente do **front do cliente** (não do admin, não do backend) o host do item 1, **só o host**, sem `https://` e sem barra (o código monta `https://<host><caminho><query>`). Sem a variável, o padrão é `admin.<SEEDGRID_TENANCY_DOMAIN>`: só serve se esse host existir e estiver coberto pelo certificado. Com isso, `/auth/welcome`, `/auth/confirm-email` e `/auth/forgot-password/confirm` no domínio raiz redirecionam para o admin mantendo `?token`. O `docker-compose` e o Dockerfile do boilerplate **não** trazem a variável: ela entra no orquestrador (no display, EasyPanel). Em `localhost` o redirect não se aplica.
- [ ] **4. Chave JWT em PKCS#8.** Em produção use `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64` e `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64` (vencem os arquivos) e `MP_JWT_VERIFY_PUBLICKEY` com o mesmo valor da pública. A privada sai de `openssl pkcs8 -topk8 -nocrypt -in private.pem -outform DER | openssl base64 -A` (ver os comandos no início desta nota); o `RsaKeyProvider` lê com `PKCS8EncodedKeySpec`, então PKCS#1 falha com `algid parse error`. Confira com `asn1parse` antes de subir.

Sinal de que algo falhou: o link do e-mail do admin abre no domínio raiz e mostra, na rota de confirmação, a mensagem 409 "Este link deve ser aberto no endereço do administrador da plataforma" (host do admin ou `SEEDGRID_ADMIN_HOST` ausentes/errados no front) ou erro de certificado no host do admin (item 2).

## SEEDGRID_APP_API_TOKEN e SEEDGRID_APP_API_COMPANY_ID em produção

Conferido nos fontes em 2026-11-06: boilerplate `subdomain-tenancy` (o `login-tenancy` tem o mesmo código) e `CompanyContextFilter` da extension security. Não foi provado com teste de execução.

- **O que são.** Variáveis opcionais de **serviço-a-serviço**, lidas só no servidor do Next (BFF), nunca expostas ao navegador.
  - `SEEDGRID_APP_API_TOKEN`: **token fixo** (um Bearer de máquina, por exemplo uma API key da extension apikeys). Vai em `Authorization` apenas nas chamadas de `apiFetch` (`lib/seedgrid-app-api.ts`), que não carregam sessão de usuário. O boilerplate não chama `apiFetch` em nenhuma tela hoje.
  - `SEEDGRID_APP_API_COMPANY_ID`: id numérico que vira o header `X-Company-Id` no `apiFetch` e na montagem de headers da sessão (`buildServerApiHeaders`).
- **O usuário logado não depende delas.** A empresa corrente vem **dentro do token da sessão** (claim escopado; o usuário a escolhe em `POST /me/select-company`). O `CompanyContextFilter` só olha o header **quando o token não tem escopo de empresa**, e nesse caso valida que o id está entre as empresas permitidas (senão 403). No subdomain-tenancy o `backendFetch` ainda **apaga** o `X-Company-Id` antes de enviar, e a empresa-tenant vem do host (cabeçalho `X-Forwarded-Host`): na prática a variável não tem efeito nas chamadas com sessão.
- **O token nunca substitui a sessão.** O fallback para `SEEDGRID_APP_API_TOKEN` quando o cookie de sessão some foi **removido de propósito** de `seedgrid-app-api-server.ts`: ele fazia a tela de perfil responder com os dados de outro usuário (identidade de máquina). Não reintroduza.
- **Produção:** deixe as duas **vazias** (ou ausentes). Só preencha se um dia o app chamar o backend por `apiFetch` sem usuário; nesse caso o token é **segredo** (não versione, use o segredo do orquestrador) e deve ter só as permissões mínimas. Fixar `COMPANY_ID` num front multiempresa ou multi-tenant é erro: um id só serve a uma empresa.

## Tema e idioma padrão do front do boilerplate

O boilerplate **não tem variável de ambiente** para isso (as `SEEDGRID_PULSE_DEFAULT_THEME_SEED/MODE` e `SEEDGRID_PULSE_UI_DEFAULT_LOCALE` são do Pulse). No `frontend/`: tema inicial em `app/components/Providers.tsx` (`initialTheme`: semente, modo claro, raio, `persistMode: true`); idioma inicial em `app/layout.tsx` (`<LocaleProvider defaultLocale="pt-BR">`), com a escolha do usuário guardada no `localStorage` (chave `seedgrid-app-client.locale`). Para mudar o padrão, edite esses dois arquivos; o tema e o idioma escolhidos pelo usuário valem sobre o padrão.

## Observabilidade (opcional)

`LOG_LEVEL`, `LOG_SEEDGRID_LEVEL`, `OTEL_SDK_DISABLED=true`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `JAVA_TOOL_OPTIONS=-Dvertx.disableDnsResolver=true`: fixos, sem segredo.

## Regras

- O `dev.env` fica no `.gitignore` junto de `*.env`, `*.env.*`, `*.pem` e `keys/`; a trava `check-secrets` reprova qualquer variante (`_dev.env`, `.bak`). Exceção: `*.example`.
- Valor externo que o dono ainda não forneceu fica como `change-me`; a aplicação sobe, e a funcionalidade que depende dele (checkout, WhatsApp, Pulse) fica inoperante até o preenchimento.
- O `login-tenancy` B2C tem boilerplate (`login-tenancy-b2c`) e está liberado no `sg-new-product` desde o toolkit 0.7.2; vale o mesmo que esta nota diz do B2B, com `customer-type=B2C`.
