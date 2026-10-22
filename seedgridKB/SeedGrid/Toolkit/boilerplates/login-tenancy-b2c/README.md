# Boilerplate `login-tenancy-b2c` (pessoa fisica)

> Variante **B2C** do `login-tenancy-b2b`: cadastro de pessoa fisica (CPF opcional, obrigatorio com `seedgrid.login-tenancy.signup.personal-document-required=true`), login social (Google/Facebook, ligado por `SEEDGRID_SOCIAL_PROVIDERS`), uma conta = uma pessoa, menu sem Usuarios/Perfis/Convites. O `subdomain-tenancy` nao tem versao pessoa fisica. Para empresa (CNPJ, sem login social), use o `login-tenancy-b2b`.

Produto SeedGrid completo e funcionando — API + app do cliente + backoffice — no modelo **POOLED**:
um único banco PostgreSQL, N empresas (*companies*), isolamento **lógico** por aplicação.

É o ponto de partida a ser **copiado**, não reimplementado. Ver [`../README.md`](../README.md).

```
login-tenancy-b2c/
├── backend/     API Quarkus 3.30.8 (porta 8080)
├── frontend/    App do CLIENTE — Next.js 16 (porta 3000)
└── admin/       Backoffice da PLATAFORMA — Next.js 16 (porta 3001)
```

| Documento | Serve para |
|---|---|
| [`backend/README.md`](backend/README.md) | Caminho clone → rodando, passo a passo |
| [`HANDOFF.md`](HANDOFF.md) | Estado atual, decisões tomadas, o que falta |
| [`PLAN.md`](PLAN.md) | O roteiro da construção, fase a fase |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de IA |

---

## 1. Começar

```bash
# 1. stack de dev (Postgres 5440, Mongo 27017, pgAdmin 5050)
cd backend && podman-compose -f podman/podman-compose.yml up -d
psql -h localhost -p 5440 -U postgres -c 'CREATE DATABASE seedgrid_app'

# 2. par de chaves JWT — cada clone gera o seu, não vêm no repositório
cd src/main/resources/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem

# 3. configuração local
cd ../../../..           # volta para backend/
cp dev.env.example dev.env
#   preencha tudo que estiver TROQUE-ME ou GERE-A-SUA (§4 deste arquivo)

# 4. subir
./run.sh                 # backend  :8080
cd ../frontend && pnpm install && pnpm run dev   # cliente :3000
cd ../admin    && pnpm install && pnpm run dev   # admin   :3001
```

> **`dev.env` não é versionado.** O que vai para o repositório é o `dev.env.example`. Em 2026-09-11
> descobriu-se que o `dev.env` herdado do `seedgrid-report` carregava **sete segredos de produção**,
> inclusive a chave privada dos JWT e a chave de criptografia at-rest. Não reverta.

O primeiro boot contra banco vazio **loga erros que não são erro** (`missing table [accounts]`,
stack trace de scheduler): é o Hibernate e os `@Scheduled` chegando antes de as migrations
terminarem. `backend/README.md` explica cada um.

---

## 2. O que já vem pronto

**Fundação** (extensões do Maven Central, empacotadas pelo `seedgrid-login-tenancy`): security
(login, RBAC, 2FA por e-mail/TOTP/WhatsApp, convites, recuperação de senha), audit, backup,
billing-core, apikeys, filemanagement, privacy (PII cifrada at-rest), resilience, commons.

**Produto**: signup institucional (empresa + usuário root), trial configurável, assinatura
Stripe com checkout/portal/faturas, cobrança de excedente por *meter*, telas de conta, planos,
contas e auditoria no admin, robô de preços de IA, alertas internos por WhatsApp.

**Migrations**: rodam por módulo, em ordem fixa, cada uma com a sua tabela de histórico —
`security → audit → backup → billing → apikeys → ai-pricing → exchange → login-tenancy → app`.
AI Pricing e Exchange são opcionais no runner; este boilerplate os habilita explicitamente.
As migrations próprias do host vivem em
`backend/src/main/resources/db/migration/app/`; o host mantém apenas o seed das permissões que
usa, em **V3000**. Na prática, V3000 deve conter somente permissões e vínculos do domínio próprio
do host. Cada extension cria suas permissões com `audience` adequado e faz os vínculos com roles
na própria migration. O schema e os seeds de Audit, AI Pricing, Exchange, Billing, Notification
e demais módulos pertencem às respectivas extensions, sem duplicação no boilerplate.

> **Regra que já custou caro:** migration de um módulo só pode referenciar tabelas do próprio
> módulo. E o Flyway roda com `validateOnMigrate=true` — apagar uma migration já aplicada quebra o
> boot com `Detected applied migration not resolved locally`.

**Campos próprios do usuário** (CPF, departamento, preferências…): não crie coluna em `users` nem
subclasse de entidade. O `User` do security é concreto, e os campos do produto vão em
`User.additionalAttributes` (coluna `users.additional_attributes`, `jsonb`). Esse mapa é enviado em
`POST /users` e atualizado por merge no `PATCH /users/{publicId}`: `null` remove a chave, e as chaves
ausentes são preservadas. Para validar, crie um bean `@ApplicationScoped` que implemente
`UserAdditionalFieldsValidator` e lance `InvalidUserAdditionalAttributesException` (HTTP 400).
Guia completo, com limites e consultas SQL por atributo, no `docs/USAGE.md` do `seedgrid-quarkus-ext-security`.

**Sessão**: o browser fala só com `/api/**` do próprio Next; quem fala com a API Quarkus é o
servidor. O token nunca chega ao browser (cookie `httpOnly`) e existe **um único** ponto de refresh,
server-side. **Não implemente refresh no cliente**: o segundo ponto de renovação não enxerga o
primeiro, e o resultado é sessão caindo sem motivo aparente — só um dos dois clientes HTTP
renova o token.

**Telas novas — use a skill `seedgrid-crud`.** Para criar qualquer CRUD no front ou no admin, siga
[`.ai/skills/seedgrid-crud/SKILL.md`](.ai/skills/seedgrid-crud/SKILL.md) em vez de inventar a
estrutura. Ela fixa o que já está de pé nas telas existentes (`plan_list` / `plan_edit` são a
referência viva):

- duas páginas separadas, `<entidade>_list` e `<entidade>_edit` — não um modal de edição na lista;
- `publicId` na URL e nos parâmetros de rota; o `id` numérico fica interno;
- route handler em `app/api/admin/...` como proxy server-side — o browser nunca fala com a API
  Quarkus direto;
- componentes SeedGrid (`SgDatatable`, `SgInputTextSearch`, `SgConfirmationDialog`, `SgMenu`,
  `SgBreadcrumb`, …), com o input **do tipo certo** para cada campo: `SgInputNumber` e
  `SgInputCurrency` para número e dinheiro, nunca `SgInputText`, que aceita letra e só falha depois;
- integração com menu, breadcrumb, gate de permissão e os estados de loading/erro.

O catálogo completo de skills está em [`.ai/skills/README.md`](.ai/skills/README.md).

---

## 3. Billing, trial, cota e o contrato de 402

**Todo o billing é do `seedgrid-billing`** (planos, terms, trial, assinatura, ciclo, checkout, troca de
plano, vagas, webhook, admin de contas e os indicadores do dashboard), com os endpoints dele
(`/admin/plans`, `/admin/subscriptions`, `/admin/accounts`, `/admin/billing/overview`, `/me/plans`,
`/me/subscription`, `/me/usage`, `/me/billing/*`). Este produto só tem:

| O quê | Onde |
|---|---|
| **Contadores de uso** (o que se cobra por uso): `requests` e `storage-mb` de exemplo | declarados em `billing/AppUsageMeters.java`, contados em `demo/UsageDemoResource.java`, planos de demonstração na `V3001`. Guia: [`docs/contadores-de-uso.md`](docs/contadores-de-uso.md) |
| Campos do produto no term que não são contador (exemplo: `supportLevel`) | `AppPlanTermValidator` |
| Avisos internos (WhatsApp) e e-mails de perda/manutenção de acesso | extensions billing e notification; o host observa apenas `UserAccessEvent` para e-mails ao usuário |

A conta de billing e o trial nascem na confirmação do cadastro (o login-tenancy delega ao billing).

O trial é um `plan_term` semeado pela fundação, com `public_id` fixo
`00000000-0000-0000-0000-0000000000a2`. Duas coisas o definem:

| | Onde mora | O que significa |
|---|---|---|
| **Cota** | `plan_term_meters` do term do trial (uma linha por contador) | A franquia de cada contador no trial, sem excedente. A `V3001` semeia 20 requisições e deixa `storage-mb` **fora** do trial, de propósito, para mostrar o 402 `METER_NOT_IN_PLAN`. Contador sem linha = fora do trial. |
| **Prazo** | `plans.trial_days` | Dias até o trial vencer. **`0` = não expira por data**. |

Ambos são editáveis na tela `/plans/plan_trial` do admin, e a tela de contas permite conceder
requisições ou dias extras a uma conta específica (fica no histórico da conta, com o motivo).
Mudanças valem para as **próximas** assinaturas: a cota é copiada para o ciclo quando ele nasce.

Quando o acesso é barrado, a API devolve **402** com um `code` que o front usa para escolher a
mensagem do modal de assinatura:

| `code` | Situação |
|---|---|
| `TRIAL_QUOTA_EXCEEDED` | Acabaram as requisições do trial |
| `TRIAL_EXPIRED` | Passou de `trial_days` |
| `PAYMENT_PAST_DUE` | Assinatura paga em atraso |
| `FEATURE_NOT_IN_PLAN` | Recurso fora do plano contratado |

O acesso efetivo é a **interseção** entre a permissão do perfil (RBAC) e a permissão do plano.

---

## 4. Variáveis de ambiente

Todas as variáveis do backend ficam em `backend/dev.env` (a partir do `dev.env.example`). O
`run.sh` carrega `dev.env` e, **depois**, `.env` — quem vier por último vence, o que é útil para
separar segredos do resto.

> **Comentário vai em LINHA PRÓPRIA.** O `run.sh` não corta ` # ...` do valor, de propósito (senha
> com `#` é comum). Já aconteceu de `SECURITY_JWT_KID=x # Key ID` gerar tokens com
> `kid` = `"x # Key ID "`.

A coluna **Obrigatória** marca o que precisa de um valor real para o sistema funcionar; o resto tem
default razoável no `application.properties`.

### 4.1 Aplicação

| Variável | Obrigatória | O que é |
|---|:---:|---|
| `APP_NAME` | | Nome da aplicação no Quarkus e no OpenTelemetry. Default `seedgrid-app-api`. |
| `HTTP_PORT` | | Porta da API. Default `8080`. |
| `APP_VERSION` | | CalVer+sha injetado pelo pipeline (`2026.07.28-b42bbe3`), logado no boot. Local vale `dev`. |
| `SEEDGRID_APP_CODE` | | Código do produto na fundação. Default `seedgrid-app`. |
| `SEEDGRID_APP_NAME` | | Nome exibido do produto. Default `SeedGrid App`. |
| `SEEDGRID_APP_BUSINESS_TIMEZONE` | | Fuso em que o **negócio** conta os dias (virada de ciclo, competência). Não é o fuso do servidor: o container roda em UTC, e usar o relógio dele fazia assinatura iniciada às 21h do dia 31 valer como dia 1º. Default `America/Sao_Paulo`. |

### 4.2 Banco

| Variável | Obrigatória | O que é |
|---|:---:|---|
| `SEEDGRID_DB_URL` | ✔ | JDBC do Postgres. Dev: `jdbc:postgresql://localhost:5440/seedgrid_app` (5440 é o mapeamento do `podman-compose`). |
| `SEEDGRID_DB_USERNAME` | ✔ | Usuário. |
| `SEEDGRID_DB_PASSWORD` | ✔ | Senha. |

### 4.3 JWT e chaves

| Variável | Obrigatória | O que é |
|---|:---:|---|
| `SECURITY_JWT_ISSUER` | ✔ | `iss` do token. Em produção, o domínio real com `https://`. Trocar invalida os tokens emitidos. |
| `SECURITY_JWT_KID` | ✔ | `kid` do token — identifica qual chave assinou. |
| `SECURITY_JWT_TTL` | | Validade do access token, ISO-8601. Default `PT8H`. |
| `SECURITY_REFRESH_TOKEN_TTL` | | Validade do refresh token. Default `P30D`. |
| `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64` | ✔ (prod) | Chave privada RSA 2048, **DER PKCS#8 em Base64**. Quando presente, vence o `_LOCATION`. |
| `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64` | ✔ (prod) | Chave pública correspondente, DER X.509 em Base64. |
| `MP_JWT_VERIFY_PUBLICKEY` | ✔ (prod) | Mesma chave pública, para o verificador do MicroProfile JWT. **Mesmo valor** da anterior. |
| `SECURITY_PRIVATE_KEY_LOCATION` | | Fallback em arquivo, usado em dev. Default `src/main/resources/keys/private.pem`. Ignorado se os Base64 estiverem setados. |
| `SECURITY_PUBLIC_KEY_LOCATION` | | Idem, chave pública. |

```bash
# par novo (PKCS#8, que é o que o código espera) e as duas linhas prontas para o env
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
echo "SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64=$(openssl pkey -in private.pem -outform DER | openssl base64 -A)"
echo "SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64=$(openssl pkey -in private.pem -pubout -outform DER | openssl base64 -A)"
```

> **Rotacionar a chave privada desloga todo mundo**, na hora. Não é operação de rotina.

### 4.4 Criptografia de dados (não rotacione sem plano)

| Variável | Obrigatória | O que é |
|---|:---:|---|
| `SEEDGRID_SECURITY_ENCRYPTION_KEY` | ✔ | AES-256 em Base64 (`openssl rand -base64 32`). Cifra campos sensíveis **em repouso**. |
| `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED` | | Liga a cifra de PII (e-mail, WhatsApp, CNPJ). **Opt-in e fail-closed**: ligar sem as duas chaves abaixo derruba o boot de propósito, para nunca gravar PII em claro por acidente. |
| `SEEDGRID_PRIVACY_CRYPTO_KEY` | ✔ se ligado | AES-256 em Base64 (`openssl rand -base64 32`). |
| `SEEDGRID_PRIVACY_SEARCH_KEY` | ✔ se ligado | Chave HMAC (≥32 bytes) que gera o hash de busca — é o que permite `findByEmail` com o e-mail cifrado. |

> **Escolha o modo com o BANCO VAZIO.** Ligar ou desligar a privacy com dados dentro exige
> migração. E trocar qualquer uma dessas chaves depois torna ilegível o que já está gravado —
> para descobrir de quem é uma conta, compara-se `users.email_hash` com
> `HMAC-SHA256(search_key, email)`.

### 4.5 Política de senha e RBAC

| Variável | O que é |
|---|---|
| `SECURITY_PASSWORD_MIN_SIZE` | Tamanho mínimo. Default `8`. |
| `SECURITY_PASSWORD_UPPER` | Exigir ao menos uma maiúscula. Default `true`. |
| `SECURITY_PASSWORD_LOWER` | Exigir ao menos uma minúscula. Default `true`. |
| `SECURITY_PASSWORD_SPECIAL` | Exigir ao menos um caractere especial. Default `true`. |
| `SECURITY_PASSWORD_NO_REPEAT` | Proíbe caracteres repetidos em sequência. Default `true`. |
| `SECURITY_PASSWORD_EXPIRATION_DAYS` | Dias até a senha expirar. Default `90`. |
| `SECURITY_PASSWORD_MAX_HISTORY` | Quantas senhas anteriores são bloqueadas. Default `5`. |
| `SECURITY_RBAC_CACHE_TTL` | Cache das permissões. Default `PT5M` — mudança de perfil demora até isso para valer. |

### 4.6 Front, self-enter e convites

| Variável | O que é |
|---|---|
| `SEEDGRID_SECURITY_FRONTEND_BASE_URL` | Base dos links que a API manda por e-mail (confirmação, recuperação, convite). **Se estiver errada, o e-mail sai com link para o lugar errado** — e o usuário não consegue entrar. |
| `SEEDGRID_SECURITY_FRONTEND_SELF_ENTER_PATH` | Caminho da página **pública** de conclusão de convite. Default `/auth/self-enter`. Não confundir com `/security/self-enter`, que é a tela de admin. |
| `SEEDGRID_SECURITY_SELF_ENTER_ENABLED` | Liga o auto-cadastro. Default `true`. |
| `SEEDGRID_SECURITY_SELF_ENTER_PUBLIC_ENABLED` | Permite auto-cadastro **sem convite**. Default `false`. |
| `SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED` | Permite cadastro **por convite**. Default `true`. |
| `SEEDGRID_SECURITY_SELF_ENTER_INVITE_NEEDS_APPROVAL` | Convite aceito ainda espera aprovação do admin. `false` aprova direto — quem convidou já escolheu e-mail e roles. Não afeta o self-enter público, que sempre exige aprovação. |
| `SEEDGRID_SECURITY_SELF_ENTER_DEFAULT_ROLE` | Role padrão do convidado. O default `NO_DEFAULT_ROLE` é uma **sentinela que não existe**: convite sem roles estoura 422 na aprovação, evitando criar usuário sem role — ou ADMIN por engano. Não pode ser string vazia (o SmallRye falha no startup). |

### 4.7 2FA

| Variável | O que é |
|---|---|
| `SEEDGRID_SECURITY_2F_ENABLED` | Liga o segundo fator. Default `false`. |
| `SEEDGRID_SECURITY_2F_ALLOWED_METHODS` | `EMAIL,TOTP,WHATSAPP` — os métodos oferecidos. |
| `SEEDGRID_SECURITY_2F_TOTP_ISSUER` | Nome exibido no app autenticador. |
| `SEEDGRID_SECURITY_2F_EMAIL_CODE_TTL` | Validade do código por e-mail. Default `PT5M`. |
| `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` | Instância (`channelId`) do WhatsApp usada para mandar o código. Vazio = método some da lista. |
| `SEEDGRID_RATELIMIT_2FA_VERIFY_PERMITS` / `_WINDOW` | Anti-abuso **por IP**. Default folgado (30/15min) porque a chave é o IP: num escritório atrás de NAT, o limite apertado da extensão derrubava o terceiro funcionário a logar. O que protege contra força bruta é o limite **por sessão** (`2f.verify.max-attempts=5`). |
| `SEEDGRID_RATELIMIT_2FA_RESEND_PERMITS` / `_WINDOW` | Idem, para reenvio. |

### 4.8 E-mail

| Variável | O que é |
|---|---|
| `SECURITY_MAILER_FROM` | Remetente. Em produção precisa ser a conta autenticada / domínio verificado, ou o provedor recusa. |
| `SECURITY_MAILER_HOST` | Host do servidor SMTP. |
| `SECURITY_MAILER_PORT` | Porta SMTP (587 com STARTTLS; 1025 num MailHog local). |
| `SECURITY_MAILER_START_TLS` | `REQUIRED` em produção, `DISABLED` num MailHog local. |
| `SECURITY_MAILER_USERNAME` | Usuário SMTP. Em ZeptoMail/SendGrid costuma ser um literal (`emailapikey`). |
| `SECURITY_MAILER_PASSWORD` | Senha ou API key do SMTP. **Segredo.** |

> **Sem mailer configurado o e-mail só vai para o log** — e o signup "não chega" sem erro nenhum.
> É por isso que existe o alerta interno de falha de envio (§4.13): os créditos do provedor
> acabaram uma vez e a confirmação de cadastro parou de sair; só descobrimos dias depois, por
> reclamação de cliente.

### 4.9 Avatar

| Variável | O que é |
|---|---|
| `SEEDGRID_SECURITY_AVATAR_STORAGE` | `filesystem` ou `minio`. Default `filesystem`. |
| `SEEDGRID_SECURITY_AVATAR_FILESYSTEM_BASE_PATH` | Pasta local quando `filesystem`. Default `./data/seedgrid-security-files`. |
| `SEEDGRID_SECURITY_AVATAR_MINIO_ENDPOINT` | URL do MinIO/S3. |
| `SEEDGRID_SECURITY_AVATAR_MINIO_BUCKET` | Bucket dos avatares. |
| `SEEDGRID_SECURITY_AVATAR_MINIO_REGION` | Região. Default `us-east-1`. |
| `SEEDGRID_SECURITY_AVATAR_MINIO_ACCESS_KEY` | Access key. |
| `SEEDGRID_SECURITY_AVATAR_MINIO_SECRET_KEY` | Secret key. **Segredo.** |

### 4.10 Primeiro admin e empresa-plataforma

| Variável | O que é |
|---|---|
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` | E-mail do admin criado no primeiro boot. **Vazio = não cria ninguém.** |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_NAME` | Nome dele. |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_WHATSAPP` | WhatsApp (destinatário dos alertas internos). |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD` | Senha inicial, já com troca obrigatória no primeiro login. |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` | CNPJ **reservado** da empresa da plataforma. O signup recusa este CNPJ, garantindo que ela nunca colida com a empresa de um cliente. Default `99999999000199`. |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CORPORATE_NAME` | Razão social da plataforma. |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_TRADE_NAME` | Nome fantasia da plataforma. |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_ADDR_*` / `_REP_*` | Endereço e representante legal da plataforma (opcionais; usados em documentos e cobrança). |

> **O bootstrap do primeiro admin roda UMA VEZ.** Trocar o env depois não atualiza o usuário que já
> existe — a instalação nova trava no primeiro login por dois motivos distintos: e-mail não
> confirmado (403) e `PASSWORD_CHANGE_REQUIRED` (401). A empresa default **não** tem flag de
> liga/desliga: o modelo de autorização depende dela.

### 4.11 Trial

| Variável | O que é |
|---|---|
| `SEEDGRID_BILLING_TRIAL_ENABLED` | Conta nova ganha trial (na confirmação do cadastro). Default `true`. Do `seedgrid-billing`. |
| `SEEDGRID_BILLING_TRIAL_PLAN_TERM_PUBLIC_ID` | `public_id` do `plan_term` de trial. Fixo de propósito — um UUID aleatório quebraria a referência a cada ambiente novo. |

> A **cota** e o **prazo** do trial não se configuram aqui: são dados do banco (§3). O
> `seedgrid-report`, de onde este boilerplate veio, tinha um `included-requests=20` que o código
> **nunca lia**, enquanto o seed dava 3 — config morta dizendo o contrário do que o sistema fazia.
> Foi removida em vez de copiada.

### 4.12 WhatsApp (Evolution)

| Variável | O que é |
|---|---|
| `SEEDGRID_WHATSAPP_API` | `evolution` liga a integração. **Vazio desliga**: o 2FA por WhatsApp some da lista e as mensagens só vão para o log. |
| `SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL` | URL da Evolution API. |
| `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY` | Chave da Evolution API. |

### 4.13 Notificações internas

As notificações usam `seedgrid-notification`. A tela `/configuracao/notificacoes`
lista os eventos registrados pelas extensões presentes e pelo host; para cada evento o admin
escolhe habilitação, canal e destinatários. Billing, câmbio, falhas de entrega de e-mail e AI
pricing passam pelo mesmo cadastro. A API expõe `/admin/notifications/events`,
`/admin/notifications/events/{code}` e `/admin/notifications/deliveries`, protegidos pelas
permissões `NOTIFICATION_READ` e `NOTIFICATION_UPDATE`.

| Variável | O que é |
|---|---|
| `SEEDGRID_APP_EMAIL_ALERT_WINDOW` | Janela anti-flood para falhas de entrega de e-mail. Sai um alerta por janela com o total acumulado. Default `PT15M`. |

Os canais e destinatários ficam nas regras da extensão, não em tabelas ou propriedades de billing.
Na primeira subida, configurações legadas alteradas são importadas; as migrations antigas
permanecem intactas para preservar checksums.

### 4.14 Robô de preços de IA

Fornecido por `seedgrid-ai-pricing:2026.10.13`. A extensão publica os eventos de
preços no notification; canais e destinatários são configurados na tela de notificações.
Endpoints, entidades e services de pricing vêm da extensão. Consulte
[instalacao e validacao](backend/README.md#ai-pricing-pela-extensao).

| Variável | O que é |
|---|---|
| `SEEDGRID_AI_PRICING_SOURCE_URL` | Página de preços consultada. É só o **default**: liga/desliga, horário e URL vivem na config editável no admin (`/ai/price-approvals`). |
| `SEEDGRID_AI_PRICING_TIMEZONE` | Fuso em que o cron do robô é interpretado. |

### 4.15 Backup

| Variável | O que é |
|---|---|
| `SEEDGRID_BACKUP_RETENTION_DAYS` | Dias que o export fica guardado. |
| `SEEDGRID_BACKUP_MAX_CONCURRENT_EXPORTS` | Exports simultâneos. |
| `SEEDGRID_BACKUP_ASYNC_ENABLED` | Export em fila, fora da request. |
| `SEEDGRID_BACKUP_QUEUE_POLL_INTERVAL` | Intervalo do poller da fila. |
| `SEEDGRID_BACKUP_STORAGE` | `filesystem` \| `s3` \| `minio` \| `azure-blob` \| `gcs` \| `google-drive` \| `onedrive`. |
| `SEEDGRID_BACKUP_MINIO_ENDPOINT` | URL do MinIO/S3. |
| `SEEDGRID_BACKUP_MINIO_BUCKET` | Bucket dos backups. |
| `SEEDGRID_BACKUP_MINIO_ACCESS_KEY` | Access key. |
| `SEEDGRID_BACKUP_MINIO_SECRET_KEY` | Secret key. **Segredo.** |
| `SEEDGRID_BACKUP_MINIO_REGION` | Região. Default `us-east-1`. |
| `SEEDGRID_BACKUP_FILESYSTEM_BASE` | Pasta quando `filesystem` (monte um volume persistente). |
| `SEEDGRID_BACKUP_NOTIFICATION_ENABLED` | Liga o poller que avisa por e-mail quando o export fica pronto. |
| `SEEDGRID_BACKUP_NOTIFICATION_POLL_INTERVAL` | De quanto em quanto tempo o poller roda (ex.: `5m`). |
| `SEEDGRID_BACKUP_NOTIFICATION_MAX_RETRIES` | Tentativas de envio antes de desistir. |
| `SEEDGRID_BACKUP_NOTIFICATION_RETRY_DELAY` | Espera entre tentativas (ex.: `PT15M`). |
| `SEEDGRID_BACKUP_MAILER_FROM` | Remetente do e-mail de export. É um mailer próprio do backup: sem ele, o backup só não manda e-mail. |
| `SEEDGRID_BACKUP_MAILER_HOST` | Host SMTP do backup. |
| `SEEDGRID_BACKUP_MAILER_PORT` | Porta SMTP do backup. |
| `SEEDGRID_BACKUP_MAILER_START_TLS` | `REQUIRED` em produção. |
| `SEEDGRID_BACKUP_MAILER_USERNAME` | Usuário SMTP do backup. |
| `SEEDGRID_BACKUP_MAILER_PASSWORD` | Senha/API key SMTP do backup. **Segredo.** |
| `SEEDGRID_BACKUP_CSV_DELIMITER` | Separador do CSV exportado. Default `,`. |
| `SEEDGRID_BACKUP_CSV_ENCODING` | Encoding do CSV. Default `UTF-8`. |

> **Só a variável com prefixo `SEEDGRID_` é lida.** Existiu um `BACKUP_STORAGE` sem prefixo que o
> código nunca leu — o storage era a exceção até o fix de 2026.08.03.

### 4.16 Ligar e desligar módulos da fundação

A extensão empacota os módulos fisicamente; estas flags controlam a ativação **lógica** (wiring,
bootstrap, migrations do módulo, status/health). Todas têm default `true`.

| Propriedade | Env equivalente | O que desliga |
|---|---|---|
| `seedgrid.login-tenancy.modules.billing.enabled` | `SEEDGRID_LOGIN_TENANCY_MODULES_BILLING_ENABLED` | Cobrança inteira — produto sem assinatura |
| `seedgrid.login-tenancy.modules.backup.enabled` | `SEEDGRID_LOGIN_TENANCY_MODULES_BACKUP_ENABLED` | Exports e a agenda deles |
| `seedgrid.login-tenancy.modules.apikeys.enabled` | `SEEDGRID_LOGIN_TENANCY_MODULES_APIKEYS_ENABLED` | Chaves de API |

As migrations de billing, backup e apikeys só rodam se o módulo estiver ativo — as de security,
audit e login-tenancy rodam sempre. Por isso **subir com `billing` desligado faz parte do teste de
um ambiente novo**: é o cenário em que uma migration que referencia tabela de outro módulo quebra.

### 4.17 Auditoria

| Variável | O que é |
|---|---|
| `SEEDGRID_AUDIT_PERSISTENCE_STRATEGY` | `jpa` (tabelas no Postgres, default do boilerplate) ou `MONGODB`. |
| `SEEDGRID_AUDIT_MONGODB_URI` | URI do Mongo quando `MONGODB`. Dev: `mongodb://admin:admin@localhost:27017/?tls=false&authSource=admin`. |

### 4.18 Observabilidade

| Variável | O que é |
|---|---|
| `LOG_LEVEL` | Nível global. Default `INFO`. |
| `LOG_SEEDGRID_LEVEL` | Nível de `br.com.seedgrid`. Default `DEBUG`. |
| `OTEL_SDK_DISABLED` | `true` desliga a exportação OpenTelemetry. Default `true` — ligue em produção com `false`. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Porta de **ingest** do coletor (4318 HTTP / 4317 gRPC), não a UI do Grafana. |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Default `http/protobuf`. |
| `OTEL_TRACES_SAMPLER` / `_ARG` | Amostragem. Default 100%; reduza (ex.: `0.1`) se o volume pesar. |
| `OTEL_METRICS_ENABLED` / `OTEL_LOGS_ENABLED` | Sinais além de traces. Só exportam com o SDK ligado. |
| `JAVA_TOOL_OPTIONS` | Flags da JVM. O `-Dvertx.disableDnsResolver=true` do exemplo evita o resolver próprio do Vert.x em ambiente com DNS local. |

### 4.19 Diagnóstico — `%dev.seedgrid.show-dev-message`

Não é variável de ambiente, é propriedade fixada **só no perfil `dev`**: faz o 500 chegar ao front
com a mensagem real da exceção em `devMessage`, em vez de `{"detail":"Ocorreu um erro interno…"}`
com a causa só no stdout.

O `devMessage` carrega `ex.getMessage()`, que pode trazer SQL, caminho de arquivo e nome de coluna —
em produção isso é vazamento. O default da fundação é `false` e **não se mexe nisso**.

> **Não existe, em lugar nenhum do backend, uma variável que ignore ou afrouxe a autenticação.**
> Nem `DEBUG_MODE`, nem equivalente. Autenticação e RBAC valem igual em dev e em produção; o que o
> perfil `dev` muda é só a mensagem de erro acima.

### 4.20 Front e admin — para onde eles apontam

Estes não vão no `dev.env` do backend: são do processo Next (`frontend/` e `admin/`).

| Variável | Onde | O que é |
|---|---|---|
| `SEEDGRID_APP_API_BASE_URL` | front e admin | URL da API Quarkus. **Sem ela, aponta para `http://127.0.0.1:8080`** — a API local, que é o default seguro. Em produção, defina com o domínio da sua API. |
| `SEEDGRID_APP_API_TOKEN` | front e admin | Opcional. Token de serviço-a-serviço (`Authorization: Bearer`), para chamadas fora do fluxo de sessão. |
| `SEEDGRID_APP_API_COMPANY_ID` | front e admin | Opcional. Fixa o `X-Company-Id` das chamadas de serviço. |
| `SEEDGRID_CLIENT_APP_BASE_URL` | admin | Opcional. Endereço do app do cliente (ex.: `http://localhost:3000`). O formulário público de cadastro (`/auth/self-enter`) mora lá; com ela, a tela "Convidar usuario externo" do admin mostra o link público completo — sem ela, só o caminho. |

**`DEBUG_MODE` foi removido.** No `seedgrid-report`, de onde estes arquivos vieram, ele escolhia
entre a API local e o domínio de **produção do report**, hardcoded. Num boilerplate isso é um
defeito: cada produto clonado apontaria, por default, para a API de **outro produto** — e o sintoma
não é erro de conexão, é autenticar contra o backend errado sem perceber. Com o domínio fora, o
`DEBUG_MODE` deixou de escolher qualquer coisa, e saiu junto.

É `127.0.0.1` e não `localhost` de propósito: a API sobe só na interface IPv4 e, no Windows,
`localhost` resolve `::1` primeiro — a conexão IPv6 falha e o fallback custa ~200 ms **por conexão
nova** (medido: 2-5 ms contra 214-244 ms, tudo no connect).

> **Cookie de sessão colide entre apps em `localhost`.** A porta não separa cookie: front (3000) e
> admin (3001) compartilham o mesmo, e o sintoma é 403 sem nada no log. Use janela anônima ou
> navegadores diferentes ao testar os dois ao mesmo tempo.

---

## 5. Stripe — a parte chata

É a configuração que mais dá trabalho, porque os valores não se inventam: cada um é criado ou
copiado do Dashboard do Stripe, e três deles mudam entre teste e produção. Esta seção é o caminho
completo.

### 5.1 O que o sistema faz com o Stripe

- **Checkout**: a assinatura nasce numa sessão de checkout hospedada pelo Stripe.
- **Portal**: o cliente gerencia cartão, faturas e cancelamento no portal do Stripe.
- **Meter de excedente**: consumo acima da cota do plano é reportado como evento de medição e
  cobrado na fatura seguinte.
- **Webhook**: o Stripe avisa a API quando algo acontece (pagou, falhou, cancelou). **Sem webhook,
  a assinatura não ativa** — o checkout termina no browser, mas quem grava o vínculo no banco é o
  evento.

### 5.2 Criar a conta e pegar as chaves

1. Crie a conta em <https://dashboard.stripe.com/register>.
2. O Dashboard tem um seletor **Test mode / Live mode** no topo. **Tudo é separado entre os dois**:
   chaves, produtos, preços, webhooks, clientes. Um objeto criado em teste não existe em produção.
3. Comece em **Test mode** e só passe para Live quando o fluxo inteiro funcionar.
4. **Developers → API keys**. Copie a **Secret key**:
   - teste: começa com `sk_test_…`
   - produção: começa com `sk_live_…` (só aparece uma vez — guarde na hora)

   Esse valor é o `SEEDGRID_BILLING_STRIPE_APIKEY`. Use a *secret key*, não a *publishable*
   (`pk_…`): quem fala com o Stripe aqui é o servidor.

### 5.3 Registrar o webhook e pegar o `whsec_`

1. **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: a sua API, no caminho `/public/billing/webhook`. Ex.:
   `https://app-api.seedgrid.com.br/public/billing/webhook`.
3. **Select events** — marque exatamente estes seis, que são os que o código trata:

   | Evento | O que dispara |
   |---|---|
   | `checkout.session.completed` | Checkout concluído |
   | `invoice.paid` | Pagamento confirmado (inclui renovação) |
   | `invoice.payment_failed` | Pagamento falhou → conta entra em atraso |
   | `customer.subscription.created` | Assinatura criada |
   | `customer.subscription.updated` | Plano alterado, ciclo renovado |
   | `customer.subscription.deleted` | Assinatura cancelada |

   Evento não listado volta **204** e é ignorado, sem erro.
4. Depois de criar, abra o endpoint e revele o **Signing secret** (`whsec_…`). Esse é o
   `SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET`.

> **O `whsec_` é por endpoint.** Cada endpoint registrado tem o seu. Se você tem um para produção e
> outro para o ambiente de teste, são dois segredos diferentes — e usar o do ambiente errado produz
> exatamente um sintoma: `SignatureVerificationException` no log e **400** de volta para o Stripe.
> Se aparecer esse erro em produção logo depois de alguém testar localmente, provavelmente foi um
> `stripe listen` ou um endpoint de teste apontado para a URL de produção; confira a aba
> **Webhook attempts** antes de mexer no segredo.

**Para testar localmente**, o webhook precisa chegar na sua máquina — use a CLI do Stripe:

```bash
stripe login
stripe listen --forward-to http://127.0.0.1:8080/public/billing/webhook
# imprime um whsec_... TEMPORÁRIO, válido só enquanto o listen roda.
# É esse que vai no dev.env enquanto você testa.
```

### 5.4 Produto e preços

O produto base é **criado automaticamente no startup** (retrieve-or-create pelo id fixo) — você não
precisa criá-lo no Dashboard. Os **preços** dos planos são gerenciados pelas telas de planos do
admin, que falam com a API de catálogo do Stripe.

Se a criação falhar (chave ausente, Stripe fora), o boot **não** cai: loga um aviso e segue, porque
as funções de billing falhariam adiante de qualquer forma.

### 5.5 As variáveis, uma a uma

| Variável | Obrigatória | Onde se obtém / o que é |
|---|:---:|---|
| `SEEDGRID_BILLING_PROVIDER` | | Qual provedor usar. Hoje só `stripe`. Default `stripe`. |
| `SEEDGRID_BILLING_STRIPE_APIKEY` | ✔ | **Developers → API keys → Secret key.** `sk_test_…` em teste, `sk_live_…` em produção. É o que autentica **todas** as chamadas ao Stripe. |
| `SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET` | ✔ | **Developers → Webhooks → \<seu endpoint\> → Signing secret** (`whsec_…`). Valida que o webhook veio mesmo do Stripe. Localmente, o que o `stripe listen` imprime. |
| `SEEDGRID_BILLING_STRIPE_PRODUCT` | ✔ | **Id fixo** do produto base — você escolhe a string (ex.: `seedgrid-app`). Não é copiado do Dashboard: o startup cria o produto com esse id se ele não existir. Mudar depois cria um produto novo e órfão. |
| `SEEDGRID_BILLING_STRIPE_PRODUCT_NAME` | | Nome exibido do produto no Dashboard e na fatura do cliente. Cosmético. |
| `SEEDGRID_BILLING_STRIPE_DEFAULTSUCCESSURL` | ✔ | Para onde o Stripe manda o cliente **depois de pagar**. Uma página sua (ex.: `https://app.seedgrid.com.br/assinatura/sucesso`). |
| `SEEDGRID_BILLING_STRIPE_DEFAULTCANCELURL` | ✔ | Para onde vai se ele **desistir** no checkout. |
| `SEEDGRID_BILLING_PORTAL_RETURN_URL` | ✔ | Para onde o **portal do cliente** volta quando ele sai. Default `http://localhost:3000/assinatura`. |
| `SEEDGRID_BILLING_OVERAGE_METER_NAME` | | Nome **exibido** do meter de excedente no Dashboard. O id técnico é o `event_name` `overage_<produto>`, derivado do produto. Cosmético. |
| `seedgrid.billing.stripe.test-clock-enabled` | | Propriedade, não env. Com chave de **teste**, a assinatura nasce sob um *Test Clock* do Stripe, o que permite avançar o tempo nos testes ponta a ponta. Com chave live é ignorado. Default `true`. |

> As três URLs (`SUCCESS`, `CANCEL`, `PORTAL_RETURN`) precisam ser alcançáveis pelo **browser do
> cliente**, não pela API. Em produção, domínio real com `https://`.

### 5.6 Segurança

Chaves `sk_live_…` e `whsec_…` **nunca** entram em arquivo versionado — nem comentadas. O GitHub
varre o commit, não a linha ativa, e uma chave live exposta dá acesso total à conta de cobrança.
Elas moram no `dev.env` (ignorado pelo git) ou no segredo do deploy.

Se uma vazar: **Developers → API keys → Roll key** revoga a antiga imediatamente.

---

## 6. Antes de considerar um ambiente novo pronto

1. Existe **um único** `plan_term` de trial; configure a cota de cada contador de uso na tela de Trial (sem cota, o contador fica fora do trial).
2. Os planos pagos foram **publicados** no Stripe (termos criados por SQL, como os da `V3001`, nascem sem preço: botão "Publicar" nas condições comerciais).
3. `plans.trial_days` está no valor pretendido — e a tela mostra "não expira" quando é `0`.
4. O `plan_term` de trial tem permissões associadas (sem isso o trial não acessa nada).
5. O boot funciona também com `seedgrid.login-tenancy.modules.billing.enabled=false` — produto sem cobrança tem de subir.
5. O primeiro login passa: e-mail confirmado e senha trocada.
6. O webhook do Stripe chega: faça um checkout de teste e confira a assinatura ativa no banco.

## Infraestrutura com Docker Compose

No Git Bash, na raiz de `login-tenancy`:

```bash
docker compose up -d
docker compose ps
cd backend
bash run.sh
```

Antes do primeiro `run.sh`, configure `backend/dev.env` e as chaves JWT conforme
o [README do backend](backend/README.md). Aguarde o PostgreSQL ficar `healthy`.
Os e-mails locais ficam em `http://localhost:8025`; não são enviados para destinatários reais.
API, admin e frontend continuam sendo executados no host.

Para parar a infraestrutura, execute `docker compose down` na raiz do projeto.
Se usa Podman, substitua `docker compose` por `podman compose` nos comandos.
O volume do PostgreSQL é preservado. `down -v` apaga os dados locais.
Cada boilerplate possui nome de projeto, volume e portas próprios.
Os bancos iniciais são criados somente quando o volume está vazio.
Não reutilize os dados da stack antiga sem uma migração explícita.


## Exchange

Cambio centralizado em `seedgrid-exchange:2026.10.13`, instalado no `.m2`.
As classes duplicadas foram removidas; pricing, billing e exchange publicam seus eventos
pelas extensions no notification. O host mantém o provider de WhatsApp usado pelo 2FA.
Veja [instalacao e validacao](backend/README.md#exchange-pela-extensao).

## Dias uteis

Feriados da empresa, semana de trabalho e calendario vem da extension
[`seedgrid-business-days:2026.10.15`](../../seedgrid-platform/java/seedgrid-quarkus-ext-business-days/README.md),
com tabelas proprias (`business_day_*`). A tenancy migra sozinha (toggle `seedgrid.login-tenancy.modules.business-days.enabled`, default `true`);
o escopo e a empresa corrente do token. No front: menu **Dias uteis** (`/dias-uteis/*`: feriados, semana de
trabalho, calendario), proxy em `app/api/business-days/[...path]` e permissoes `BUSINESS_DAY_*`.


## Tela nova: menu e permissões

Menu e catálogo de permissões são mantidos à mão em alguns lugares que precisam ficar sincronizados (migration da
permissão, `data.ts`, ícone no `Shell`, catálogo do editor de perfis e, se for vendável por plano, o catálogo do
admin). O passo a passo e o checklist estão na skill
[`.ai/skills/seedgrid-new-screen`](.ai/skills/seedgrid-new-screen/SKILL.md).

## Extensibilidade de PlanTerm e User

Veja o [guia de atributos adicionais](docs/extensibilidade.md) para contratos CDI, exemplos de
`supportLevel` e `cargo`, payloads, merge, remoção e validação. Para cobrar por uso (franquia e excedente
por plano, um ou vários contadores), veja o [guia de contadores de uso](docs/contadores-de-uso.md).
Para avisar o usuário na hora que um processo demorado terminou (o backup já faz isso; relatórios e
importações podem fazer igual), veja o [guia de eventos em tempo real](docs/eventos-em-tempo-real.md).

## Estado de acesso da empresa (somente leitura) e downgrade de empresas

Plano 4.12 (Fase 5 T5.5/T5.6). A empresa da sessao tem `accessMode` `ACTIVE | READ_ONLY | DISABLED`
(`AuthResponse.currentCompany`, guardado no cookie `<cookie-da-sessao>_company` pelo BFF e devolvido em `/api/auth/me`).

- **Faixa e botoes:** em `READ_ONLY`, `app/components/CompanyAccessBar.tsx` mostra "Somente leitura - fazer upgrade" (leva a
  `/assinatura`) e o `useAdminAccess()` passa a negar as permissoes de escrita (`*_CREATE`, `*_UPDATE`, `*_DELETE`, ...:
  `lib/company-access.ts#isWritePermission`), entao os botoes de escrita das telas CRUD somem sem mudar cada tela. Telas novas
  que gateiam por permissao ja herdam; as que nao gateiam usam `useAdminAccess().canWrite`.
- **Seletor de empresa:** a mesma barra lista `GET /api/me/companies` (so com mais de uma empresa), marca o estado
  ("(somente leitura)", "(desativada)") e troca por `POST /api/me/select-company` (regrava os cookies).
- **Erros:** `lib/api-error.ts` (`extractProblemCode`, `isCompanyReadOnlyBody`, `isCompanyDisabledBody`) e a guarda de fetch
  `lib/company-access-guard.ts` reconhecem 403 `COMPANY_READ_ONLY` (marca a empresa como somente leitura, sessao segue) e
  `COMPANY_DISABLED` (o BFF limpa a sessao; o front vai a `/login?expired=disabled` com a mensagem). `lib/ported/clientError.ts`
  traduz os dois codigos.
- **Downgrade de empresas:** `app/assinatura/DowngradeCompanySelectionDialog.tsx` (manter ativa / somente leitura / desligar),
  no molde do `DowngradeUserSelectionDialog`; empresas protegidas (plataforma e do responsavel) aparecem travadas e a escolha so
  confirma com as contagens exatas (`lib/downgrade-company-selection.ts`). Le `GET /me/billing/downgrade-company-selection`
  (BFF `app/api/me/billing/downgrade-company-selection`) e a escolha segue em `companySelection` no `POST /me/billing/change-plan`.
  Os campos `requiresCompanySelection`/`companySelection` na previa da troca de plano sao PROVISORIOS (nome ainda nao fechado no
  contrato do billing).
- Testes: `pnpm test` (vitest) em `lib/*.test.ts`.
