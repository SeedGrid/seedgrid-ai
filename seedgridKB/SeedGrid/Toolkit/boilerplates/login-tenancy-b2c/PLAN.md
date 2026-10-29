# PLANO — Boilerplate `login-tenancy` (backend + front + admin)

**Data:** 2026-09-09
**Origem:** `seedgrid-products/seedgrid-report` (api + client + admin)
**Destino:** `C:\empreendedorismo\seedgrid\boilerplate\login-tenancy\{backend,frontend,admin}` (hoje vazios)
**Status (2026-09-10):** Fases 2–6 executadas — backend, admin e front copiados; `pnpm install` e
`tsc --noEmit` verdes nos dois fronts; migrations aplicadas em banco limpo; signup, login e troca de
senha exercitados de ponta a ponta contra a API. Decisões D1–D5 fechadas (§10). Pendentes: Fase 7
(testes de sessão), Fase 8 (PWA + `rename.sh` + CI), §12 (`PlanTerm` na fundação) e §13 (`fe-*`).

---

> Atualizacao 2026-09-28: auditoria administrativa migrada para `@SgAudit` e `/audit-logs`
> da extensao nos dois boilerplates. `admin_audit_entries` permanece somente como arquivo
> historico, preservando migrations e dados existentes. A adocao de `seedgrid-ai-pricing`
> foi concluida nos dois backends com o artefato local `2026.09.12-SNAPSHOT`; veja
> `HANDOFF.md` e o README do backend. `seedgrid-exchange:2026.09.12-SNAPSHOT` tambem
> foi adotado nos dois backends, substituindo o pacote local de cambio. O recorte abaixo e historico.

## 0. Princípio que rege este trabalho

> **Copiar, não refazer.**

O Pulse foi derivado do report e foi **reescrito "seguindo o padrão"** em vez de copiado. O
resultado está documentado em `seedgrid-pulse/backend/docs/HANDOFF-login-tenancy.md`: telas que já
funcionavam no report voltaram quebradas — cadastro de usuário e criação de perfil sem o treeview
de permissões, "Meu perfil" pior que o original, rota `/security/apikeys` no menu contra
`/security/api-keys` real (404 garantido), `/security/change-password` chamando o endpoint de admin
em vez do self-service, gating de menu pelo catálogo de permissão errado, e a lista de
usuários/perfis **sempre vazia** porque o backend devolvia array cru onde o front lia
`data.items`.

Nada disso é bug difícil. Tudo isso é bug de **reescrita**.

**Regra operacional:** o default é `cp` do arquivo inteiro e depois *remover* o que é de domínio.
Nunca redigitar um componente que já existe. Quando a cópia literal for tecnicamente impossível
(há **um** caso, o transporte HTTP do client — §5.1), isolar o seam, dizer isso explicitamente, e
copiar o substituto de outro projeto que já resolveu aquilo **em produção** — não inventar.

---

## 1. Nomenclatura e placeholders

**Confirmado pelo dono em 2026-09-09.**

| Item | Valor proposto |
|---|---|
| Diretórios | `backend/` · `frontend/` · `admin/` (já criados) |
| Maven groupId | `br.com.seedgrid.app` |
| Maven artifactId | `seedgrid-app-api` |
| Pacote Java raiz | `br.com.seedgrid.app.api` |
| `seedgrid.login-tenancy.app.code` | `seedgrid-app` |
| npm (front) | `@seedgrid-app/seedgrid-app-client` |
| npm (admin) | `@seedgrid-app/seedgrid-app-admin` |
| Prefixo de config próprio | `seedgrid.app.*` (onde o report usa `seedgrid.report.*`) |
| Prefixo de env próprio | `SEEDGRID_APP_*` |

Um `rename.sh` na raiz do boilerplate faz a troca desses tokens em uma passada, para quem clonar o
boilerplate não ter de caçar `report` no meio do código. **Isso é a última etapa**, não a primeira:
copiar primeiro com os nomes originais, validar que sobe, renomear depois — assim qualquer quebra é
atribuível ou à poda de domínio ou ao rename, nunca aos dois ao mesmo tempo.

---

## 2. O que JÁ vem pronto — verificar antes de escrever qualquer linha

Esta seção existe porque o pedido foi explícito: *"antes de sair colocando coisas, verifique já vem
através do login-tenancy"*.

### 2.1 Backend — `seedgrid-login-tenancy` (extension Quarkus)

Fonte: `seedgrid-platform/java/seedgrid-quarkus-ext-login-tenancy` (`docs/ARQUITETURA.md`,
`docs/configuration.md`, `docs/example-consumo.md`).

Adicionar **uma** dependência já traz, transitivamente, o baseline v1 inteiro:

| Módulo | O que entrega |
|---|---|
| `seedgrid-security` | usuários, perfis/RBAC, JWT + refresh token com rotação e detecção de reuso, 2FA (EMAIL/TOTP/WHATSAPP), política de senha, mailer, avatar, self-enter/convites, company default, first-admin |
| `seedgrid-audit` (core) | auditoria com providers `postgresql` e `mongodb`, escolhidos por `seedgrid.audit.persistence.strategy` |
| `seedgrid-billing-core` | núcleo de billing agnóstico — **exige** um `BillingProvider` concreto no classpath |
| `seedgrid-backup` | export/backup com storage plugável (filesystem/s3/minio/azure/gcs/drive/onedrive) + notificação por e-mail |
| `seedgrid-apikeys` | API keys por instalação, com permissões e revogação |
| `seedgrid-filemanagement` | abstração de storage usada por avatar/backup/imagens |
| `seedgrid-privacy` | criptografia at-rest de PII (`@SgEncryptedField`) + busca por hash |
| `seedgrid-resilience` | `@SgRateLimit` (in-memory, sem Redis) |

E, da própria extension:

- **Signup institucional** completo: `POST /public/signup`, `confirm-email`, `resend-email`,
  `email-exists` (rate-limited), CNPJ único por Company, vínculo M2M de e-mail já existente, senha
  cifrada recuperável no `signup_request`, `SignupConfirmedEvent` (CDI) para o host pós-processar.
- **Controllers `/me`**: perfil, usuários e perfis por conta (`LoginTenancyProfileController`,
  `LoginTenancyUserController`, `LoginTenancyRoleController`).
- **Migrations per-schema** (`security → audit → backup → billing → apikeys → login-tenancy → app`),
  cada uma com sua `sg_flyway_schema_history_*`. O Flyway nativo do Quarkus fica **desligado**.
- **Bootstrap**: company default + primeiro admin.
- **Status/readiness**: `/public/login-tenancy/status` e `/q/health/ready`.
- **Isolamento lógico por company**: `AllowedCompaniesResolver`, carimbo de company na escrita de
  audit e escopo forçado na leitura (sem contexto ⇒ DENY, não ⇒ "vê tudo").

**Consequência para o plano:** *nada* de segurança, auditoria, backup, apikeys, signup ou
bootstrap é copiado do report — tudo isso já vem. Do report copiam-se **telas** e **domínio de
billing/contas**, não infraestrutura.

**Pegadinha herdada, já paga pelo report (ver comentário no `pom.xml` dele):** não pinar versão de
lib da foundation no host. O `seedgrid-login-tenancy-parent` é importado como BOM e fixa as
versões; um `<version>` direto em `seedgrid-security` vence por mediação, rebaixa a versão que o
login-tenancy pediu, e o sintoma aparece longe da causa (em 2026-08-19: sessão caindo sozinha por
rotação concorrente de refresh token). **Uma única property a bumpar: `seedgrid.login-tenancy.version`.**

### 2.2 Front — pacotes `@seedgrid/fe-*`

Fonte: `seedgrid-platform/front/seedgrid-fe-components/packages/modules`. Existem publicados:

`@seedgrid/fe-security` · `fe-apikeys` · `fe-audit` · `fe-backup` · `fe-billing-user` ·
`fe-billing-platform` · `fe-login-tenancy` · `fe-self-enter` · `fe-subdomain-tenancy`

**Verificado em 2026-09-09 — o estado real é bem diferente do que a lista de pacotes sugere.**
Varredura dos três fronts:

| Pacote | report-admin | report-client | pulse-ui |
|---|---|---|---|
| `fe-components` | 68 arquivos | 70 | 47 |
| `fe-theme` | 3 | 3 | 4 |
| `fe-core` | 6 arquivos | ausente | ausente |
| `fe-commons` (cep, cnpj, http) | **ausente** | ausente | ausente |
| os 9 módulos (`fe-security` & cia.) | só `SecurityPaths` | ausente | ausente |

O `report-admin` importa **apenas `SecurityPaths`** de `@seedgrid/fe-security` — 16 arquivos, 16
imports, todos idênticos. E não é preferência: ele pina **2026.6.1**, cujo `dist` instalado contém
só `index.js` + `paths.js`. O motor (22 arquivos, 2.460 linhas: `createSecurityServer`,
`permission-provider`, `session-contract`, `problem-response`) saiu na **2026.7.3** e **ninguém
instalou**. O `report-admin` segue com o próprio `lib/seedgrid-report-api-server.ts`, 323 linhas.

Ou seja: **o server tier de todos os 9 módulos tem zero consumidores.** O que está provado em
produção é `paths.ts` — um espelho do `RestControllerPath.java`.

Os módulos também nunca vão entregar tela: o modelo de distribuição decidido em
`SECURITY-EXTRACTION-MAP.md` é **lógica na lib npm, tela como scaffold dentro do app** (modelo
shadcn). O próprio `fe-audit/module.ts` registra que as telas de audit são "a genuine gap".

**Decisão do dono (2026-09-09): por ora, dos módulos usa-se só o `@seedgrid/fe-core`.** Os demais
entram num segundo momento, pelo caminho do §13.

Dependências de front do boilerplate, então:

| Pacote | Entra? | Por quê |
|---|---|---|
| `@seedgrid/fe-components` | **sim** | design system, 68/70/47 arquivos nos três fronts — é o mais provado de todos |
| `@seedgrid/fe-theme` | **sim** | temas, provado |
| `@seedgrid/fe-core` | **sim** | `createApiClient` + cadeia de erro; 6 arquivos em produção no report-admin |
| `@seedgrid/fe-security` e os outros 8 módulos | **não, por ora** | §13 |

**Consequência prática:** o report-admin importa `SecurityPaths` de `@seedgrid/fe-security` em 16
arquivos. Sem o pacote, esses paths viram `lib/security-paths.ts` **copiado** do `paths.ts` do
módulo, com cabeçalho dizendo a origem e a regra de que ele espelha o `RestControllerPath.java` do
backend. É cópia, não reescrita — e voltar a consumir o pacote depois é trocar o caminho do import.

> Vale saber, para quando o §13 chegar: a versão que o report-admin pina (`fe-security@2026.6.1`)
> contém **só** `index.js` + `paths.js`. Ela não é um "módulo com motor" — é literalmente um arquivo
> de paths. Não é ela que a decisão acima está adiando; é a 2026.7.3, que traz o
> `createSecurityServer`.

**Pegadinha:** `git push` na main de `seedgrid-fe-components` **publica no npm** (workflow
"Publish Components and Showcase"). Nunca empurrar ali durante este trabalho sem autorização
explícita, mesmo que se encontre um bug de componente pelo caminho.

---

## 3. Backend — `boilerplate/login-tenancy-b2c/backend`

Base: `seedgrid-report/seedgrid-report-api`.

### 3.1 Arquivos de infraestrutura — cópia direta

| Arquivo | Ação |
|---|---|
| `run.sh` | **cópia literal.** Lê o `dev.env` linha a linha (não `export $(... \| xargs)`, que quebra em valor com espaço) e roda `mvn quarkus:dev`. Já é a versão corrigida. |
| `Dockerfile` | cópia; trocar nome da imagem |
| `podman/podman-compose.yml` | cópia da raiz do report — Postgres :5440, pgAdmin :5050, Mongo :27017, mongo-express :8081, RabbitMQ. É a stack de dev compartilhada (`name: seedgrid-platform-dev`) |
| `.github/workflows/deploy.yml` | cópia, podando os jobs de domínio (mcp, client Tauri) — ver §8.4 sobre o `paths-filter` |
| `src/main/resources/keys/` | **não copiar as chaves do report.** Gerar par novo e deixar `keys/.gitkeep` + instrução no README |

### 3.2 `pom.xml`

Copiar o do report e **remover** o que é de domínio:

Sai: `json-schema-validator` (valida a `ReportDefinition` da IA), `openhtmltopdf-pdfbox` (PDF do
"Analisar minha tela").

Fica, exatamente como está — incluindo os comentários, que documentam decisões pagas caro:

- `seedgrid-login-tenancy` + import do BOM `seedgrid-login-tenancy-parent`
- `seedgrid-security` e `seedgrid-privacy` **sem `<version>`** (declaradas por import direto no
  código; versão pelo BOM)
- `seedgrid-audit-postgresql` **e** `seedgrid-audit-mongodb`, ambos `runtime` — o
  `AuditPersistenceRouter` escolhe por config; PRD usa MONGODB, testes usam JPA
- `seedgrid-billing-stripe` — a extension só empacota o `billing-core`
- **`io.minio:minio` explícito** — no `seedgrid-filemanagement` é `<optional>`, logo **não** chega
  transitivo; sem essa linha, `storage=minio` quebra em runtime com `NoClassDefFoundError`
- `seedgrid-whatsapp-evolution` — a security virou agnóstica em 2026.08.01, o host escolhe o provider
- bloco de teste completo (`quarkus-junit5`, `rest-assured`, `testcontainers/postgresql`,
  `mockito`, `quarkus-junit5-mockito`, `quarkus-test-security`)

### 3.3 `application.properties`

Copiar e podar. Blocos que **ficam** (são boilerplate de verdade):

`quarkus.application.name/http.port/app.build.version` · datasource · OpenTelemetry ·
`seedgrid.audit.persistence.strategy` · `seedgrid.login-tenancy.app.*` · `seedgrid.security.jwt.*` ·
refresh-token TTL · password policy · RBAC cache · encryption key · 2FA + rate limits de 2FA ·
mailer · avatar storage · `seedgrid.privacy.*` · self-enter · first-admin · default-company ·
`seedgrid.whatsapp.*` · `seedgrid.billing.*` (stripe) · portal return-url · alerta interno de falha
de e-mail · logging.

Blocos que **saem**: `seedgrid.report.ai.*` inteiro (LLM, modelos por fase, embeddings, qdrant,
image-storage, catalog cache, config-poll), `seedgrid.report.local-db.*`, `seedgrid.pulse.*`,
`seedgrid.report.ai-alert.*`, `seedgrid.report-trial.*` (**condicional** — ver §10, decisão D2).

Manter os comentários longos. Eles não são enfeite: explicam por que o rate limit de 2FA é folgado
(o limite por IP derrubava escritório inteiro atrás de NAT), por que `business-timezone` existe
(assinatura iniciada 21h do dia 31 valia como dia 1º), por que o `self-enter.default-role` é a
sentinela `NO_DEFAULT_ROLE` e não string vazia (o `@WithDefault` trata `""` como null e o SmallRye
falha no startup).

### 3.4 `dev.env`

**Copiar a estrutura, NÃO os valores.** O `dev.env` do report tem, em claro e versionado: chave
privada RSA de produção, senha SMTP do ZeptoMail, chaves de API do OpenAI, api-key do Qdrant, chaves
Stripe (test e live comentada), senha do MinIO e senha do banco do cliente.

Um boilerplate que é clonado a cada produto novo **não pode** carregar isso. O `dev.env` do
boilerplate leva as mesmas chaves com valores placeholder e, ao lado de cada segredo, o comando que
o gera — a maioria já está escrita nos comentários do report (`openssl genpkey`, `openssl rand
-base64 32`, etc.). Complementar com `.env` gitignored para os valores reais.

### 3.5 Código Java — classificação (267 arquivos no report)

**COPIA integral** (é o boilerplate pedido):

| Pacote | O quê | Observação |
|---|---|---|
| `common/exceptions/**` | `ApiException` + 9 subtipos + `ReportApiExceptionExtension` | RFC 7807; o Pulse quebrou por não falar 7807 |
| `common/` | `RestControllerPath`, `BusinessTimeZone`, `AlertThrottle` | |
| `common/security/` | `ApiKeyAwareCurrentUserProvider` | |
| `billing/` | `BillingCheckoutResource/Service`, `MeBillingResource`, `BillingPurchaseEntity/Status`, `BillingNotificationService`, `BillingNotifyConfigEntity`, `SeedgridReportBillingEventHandler`, `UserAccessSelectionService` | |
| `billing/plan/` | `AdminPlanResource/Service`, `PlansCatalogResource`, requests, `PlanTerm`, `PlanFeatureGate`, `ReportPlanTermFactory` | o `PlanTermFactory` é a costura do produto — renomear |
| `billing/subscription/` | pacote inteiro | assinaturas, ciclo, reconciliação, ativação |
| `exchange/` | pacote inteiro (13 arquivos) | moedas + cotação — o dono pediu no menu do admin |
| `mail/` | `AlertingEmailService`, `EmailDeliveryAlertService` | nasceu de um incidente real: créditos SMTP acabaram e ninguém soube por dias |
| `admin/` | `AdminAccountsResource/Service`, `AdminUserResource/Service/UpsertRequest`, `AdminRoleResource/Service/UpsertRequest`, `AdminMePermissionsResource/Service`, `PermissionResolutionService`, `AdminPlatformAccess*`, `AdminHealthResource`, `AdminDashboardResource`, `AdminBillingNotifyResource/Service`, `AgentApiKeyService` (se apikeys ficar) | |
| `accounts/` | `AccountResource`, `AccountProvisioningService`, `CurrentTenantService`, `MeResource`, `SignupAccountProvisioner`, `SignupAccountBackfillService` | o provisioner é quem observa o `SignupConfirmedEvent` |
| `SeedgridReportApplication`, `StartupBannerLogger` | | renomear |

**COPIA — confirmado nas decisões D2/D3:**

| Pacote | Decisão |
|---|---|
| `accounts/TrialProvisioningService` + `ReportTrialConfig` | **entra** (D2) — trial foi pedido no menu do admin |
| `ai/pricing/**` (6 arquivos) + `billing/usage/{AiModelEntity,AiModelPriceEntity,AiModelPriceToApproveEntity,AiPricingConfigEntity,AiModelPriceService}` + `admin/AdminPricingModelResource` + `admin/AdminModelResource/Service` | **entra completo** (D3) — o boilerplate já nasce pronto para produto que consome LLM |

**NÃO COPIA** (domínio report):

`reports/**` (28 arquivos) · `ai/**` exceto `ai/pricing` (≈90 arquivos: pipeline, assistant/Griddy,
config versionada, image storage, spec orchestration) · `budget/**` · `partners/**` (D4: Parceiros
fica de fora) · `accounts/{ClientDatabaseConfigEntity,LocalDatabaseConfigService,MeLocalDatabaseResource}`
+ `admin/AdminClientDatabaseConfigService` (D5: banco do cliente é domínio do report) ·
`integration/**` + `integration/pulse/**` · `admin/AdminAi{Profit,Request,RequestRetry}*` ·
`admin/AdminAssistant*` · `admin/AdminReport*` · `admin/AgentSilence*` · `admin/AiHealthProbeService` ·
`billing/usage/{AiModelUsageEntity,AiRequestUsageEntity,AiStepModelEntity,ConsumptionAlert*,
UsageAccountingService,UsageAlertService,UsageResource,AdminUsageResource,UserQuotaValidatorImpl}`
(o accounting é medido em requisição de IA — não é genérico).

> Nuance do D3: entra o **catálogo de modelos e o preço deles** (quanto custa o token), não o
> **consumo** (quantos tokens tal conta gastou). O consumo é medido em unidade de domínio do report
> e sai junto com `ai_request_usages`.

### 3.6 Migrations

A `V1000__seedgrid_report_baseline.sql` tem **80 KB e 32 tabelas**. Não dá para copiar inteira e
não dá para escrever do zero — é recorte cirúrgico, tabela por tabela, mantendo o DDL literal.

**Ficam (11):** `tenant_subscriptions`, `subscription_billing_cycles`, `billing_purchases`,
`billing_notify_config`, `currencies`, `currency_exchange_rates`, `admin_audit_entries`,
`ai_models`, `ai_model_prices`, `ai_model_prices_to_approve`, `ai_pricing_config` (as quatro
últimas por D3).
**Saem (21):** `reports`, `report_versions`, `report_templates`, `chat_sessions`, `pipeline_traces`,
`ai_config_*` (5 tabelas), `ai_report_requests`, `ai_request_usages`, `ai_step_models`,
`ai_uploaded_assets`, `ai_model_usages`, `consumption_alert_events`, `client_database_config` (D5),
`partners`, `company_partners`, `admin_user_partners` (D4).

Não existe tabela `accounts`: **"Conta" é a `Company` do security**. A tela de Contas do admin é
uma visão sobre companies + assinatura. Isso poupa uma entidade inteira — e é o tipo de coisa que,
não vista, vira uma tabela duplicada.

As V1001..V1033 são incrementais em cima da V1000 (a maioria é *seed de permissão* de tela do
report). Não se copiam: o boilerplate nasce com **uma** `V1000__boilerplate_baseline.sql`
consolidada + **uma** `V1001__seed_permissions.sql` só com as permissões das telas que sobraram
(`ACCOUNT_*`, `PLAN_*`, `PLAN_TERM_*`, `SUBSCRIPTION_*`, `CURRENCY_*`, `CURRENCY_RATE_*`,
`BILLING_NOTIFY_*`, `BACKUP_*`, `APIKEY_*`, `ADMIN_HEALTH_READ`, `LOG_READ`, `AI_MODEL_READ`,
`AI_PRICING_MODEL_READ`, `AI_PRICE_APPROVE` — as de `USER_*`/`ROLE_*` já vêm da security) +
os seeds que sobrevivem, recortados das V100x do report: `V1002__seed_plan_trial` (D2),
`V1003__seed_ai_models` (D3), `V1004__seed_billing_notify`, `V1005__seed_currencies`.

**Pegadinha:** as migrations do domínio vão em `db/migration/app/`, não em `db/migration/`. A
extension roda o passo `app` em `classpath:db/migration/app` justamente para não colidir, por scan
recursivo, com `db/migration/security`, `.../audit` etc.

### 3.7 Templates de e-mail — cópia literal (pedido explícito)

`src/main/resources/templates/` → copiar as três pastas inteiras:

- `templates/logintenancy/`: `signup-confirmation.html`, `signup-welcome.html`, `user-activation.html`
- `templates/security/`: `email-confirmation.html`, `password-reset.html`, `welcome-email.html`,
  `two-factor-code.html`, `two-factor-code-whatsapp.txt`, `entry-request-{invitation,confirmation,
  confirmation-code,approved}.html`
- `templates/backup/ready-notification.html`

Mecanismo: a extension traz defaults em `templates/logintenancy-default/html/` e o host sobrescreve
por **arquivo** em `templates/logintenancy/` (ou por bean `LoginTenancyTemplateProvider`). Copiar os
arquivos já ativa a sobrescrita — só trocar marca/URLs.

Copiar também `resources/banner.txt` (o `StartupBannerLogger` loga a versão do build no boot — é o
que permite conferir no log qual build subiu).

---

## 4. Admin — `boilerplate/login-tenancy-b2c/admin`

Base: `seedgrid-report-admin` (Next.js 16, App Router, BFF próprio). É **web e já é a arquitetura
certa** — a cópia aqui é a mais direta dos três.

### 4.1 Infraestrutura — cópia literal, sem discussão

`lib/admin-auth.ts` · `lib/admin-session-cookies.ts` · `lib/seedgrid-report-api-server.ts` (o
coração: `fetchWithAdminSession` com refresh + mapa de refresh em voo) · `lib/core/*` ·
`lib/api-error.ts` · `lib/format.ts` · `lib/list.ts` · `lib/permission-tree.ts` +
`lib/client-permission-tree.ts` (716 linhas — é o **treeview de permissões** que o Pulse não portou
e sentiu falta) · `lib/self-enter.ts` · `lib/two-factor-pending.ts` · `proxy.ts` (middleware) ·
`next.config.ts` · `instrumentation.ts` (OTel) · `postcss/tailwind/tsconfig` · `scripts/`.

`app/components/`: `Shell.tsx`, `AdminAccessProvider.tsx`, `Providers.tsx`, `ThemeView.tsx`,
`TwoFactorManager.tsx`, `DatatableSkeleton.tsx`, `SgInputTextSearch.tsx`, `StatusBadge.tsx`,
`useSavedToast.ts`, logos. (`DiffView.tsx`/`diffLines.ts` são da config de IA — saem.)

### 4.2 Menu (`app/data.ts`) — pedido do dono × o que existe

O `navItems` do report já é quase exatamente o menu pedido. Recorte:

Menu final (D3 e D4 aplicados) — todas as folhas já existem no report, nenhuma tela é nova:

```
Visão Geral                    ← /                                  (D4 ✔)
Contas                         ← /accounts
Comercial
  Planos                       ← /plans/plan_list
  Trial                        ← /plans/plan_trial                  (D2 ✔)
  Assinaturas                  ← /subscriptions                     (D4 ✔)
Preços
  Robô de preços               ← /settings                          (D3 ✔)
  Preços IA (aprovação)        ← /ai/price-approvals                (D3 ✔)
  Modelos de IA                ← /ai/models/model_list              (D3 — o robô precifica ESTE catálogo)
Moedas
  Moedas                       ← /configuracao/moedas
  Cotação de moedas            ← /configuracao/cambio
Notificações de billing        ← /configuracao/notificacoes-billing
Plataforma
  Backup / Export              ← /exports/export_list
Segurança
  Usuários                     ← /security/users/user_list
  Convidar usuário externo     ← /security/self-enter
  Perfis                       ← /security/roles/role_list
  API Keys                     ← /apikeys/apikey_list
  Auditoria                    ← /security/audit
```

Saem do menu e das rotas: Relatórios, Templates de relatório, AI Requests, Consumo IA, Lucro por
cliente, Consumo, Extrato IA, `Configuração > IA` (Config de IA, Fases de IA, IA do Griddy e
Griddy-Análise — fica só Modelos de IA), Banco do cliente, Agente do cliente, Parceiros (D4),
Sessão (D4).

> "Modelos de IA" não estava na sua lista, mas o robô de preços aprova preço **de um modelo** — sem a
> tela de catálogo, `/ai/price-approvals` aprova algo que não dá para cadastrar nem consultar. Se
> preferir sem ela, o `AdminModelResource` continua servindo a API e só o item de menu some.

O `sgUserMenu` pedido (**Meu perfil / Temas**) é literalmente o que o `Shell.tsx` já monta
(`/perfil`, `/temas`, `Sair`) — cópia sem alteração.

### 4.3 Rotas de página e de API a copiar

**Páginas:** `login`, `auth/**`, `change-password`, `perfil`, `temas`, `theme`, `settings`
(robô de preços), `accounts`, `plans/**`, `subscriptions`, `billing`, `assinatura/**`,
`configuracao/{moedas,cambio,notificacoes-billing}`, `ai/{price-approvals,models,pricing-model}`,
`security/**`, `apikeys/**`, `exports/**`, `migration`, `components`, `page.tsx` (Visão Geral,
podada dos cartões de relatórios e de consumo de IA).

**API (BFF):** `api/auth/**`, `api/me/**`, `api/self-enter/**`, `api/health/**`, `api/exchange/**`,
`api/admin/{accounts,security,self-enter,apikeys,audit,audit-logs,plans,subscriptions,billing,
currencies,currency-exchange-rates,platform-access,exports,dashboard}/**` +
`api/admin/ai/{models,price-approvals,pricing-model}/**`.

Saem: `api/admin/{reports,partners,credits,usage}/**`, `api/admin/ai/{config,requests,step-models,
model-usage,profit,assistant-model,assistant-analyze-model}/**`, `api/session` e
`api/admin/accounts/[accountPublicId]/{agent-keys,local-db,partner}`.

---

## 5. Front do cliente — `boilerplate/login-tenancy-b2c/frontend`

**Decisão D1 fechada: Opção A** — esqueleto Next.js copiado do `seedgrid-report-admin`, telas
exclusivas portadas do `seedgrid-report-client`. O §5.1 abaixo explica por que a cópia direta do
client não era possível; o §5.2 mantém as duas opções registradas para não se perder o porquê.

### 5.1 O problema: o report-client não faz HTTP

O `seedgrid-report-client` é Vite + React + **Tauri**, e a camada de rede/sessão dele vive em
**Rust**, não em TypeScript:

- `src/api.ts` tem **1.683 linhas** e **174 chamadas `invoke<...>("comando_rust")`**. Nenhum `fetch`.
- Quem fala HTTP com a API é `src-tauri/src/infra/http.rs` (606 linhas) + `comandos/auth.rs`
  (747) + `secure_state.rs` + `estado.rs`. Login, 2FA, guarda do token, **refresh e detecção de
  sessão morta** estão todos lá.

Ou seja: `npm run dev` sem Tauri não carrega uma tela — não é "remover 4 imports". A camada que o
dono mais quer preservada (a que já foi testada) é justamente a que **não existe em TypeScript**.

Isso não muda o princípio de copiar; muda **de onde** se copia cada parte.

### 5.2 As duas formas de copiar

**Opção A — esqueleto do `report-admin`, telas do `report-client`** ✅ **ESCOLHIDA**

Next.js + BFF do `report-admin` como base (é código web já testado em produção, com o refresh
correto), e por cima copiam-se as telas do `report-client` que não existem no admin — trocando, em
cada uma, `invoke("x")` por `fetch("/api/...")` no BFF. São 3 telas exclusivas do client:
`SignupForm` (1.041 linhas), `SubscriptionPlansView` + `SubscriptionManageView` (1.524) e
`SettingsView` (395). Perfil, temas, usuários, perfis e auditoria vêm do admin **em versão web já
pronta**, sem conversão nenhuma.

- Trabalho de conversão: ~3 telas.
- Some: shell/menu próprio do client, splash, mascote Griddy (Rive), `EmpresaSelector`,
  `SinoDePendencias`. Se algum desses for requisito, entra como port explícito.

**Opção B — Vite SPA do `report-client`, transporte reescrito** ❌ *(descartada — registrada só
para preservar o motivo)*

Copiar `src/` inteiro (views, componentes, estilos) e reescrever **só** `api.ts` como cliente HTTP,
portando `infra/http.rs` + `comandos/auth.rs` para TypeScript.

- Preserva 100% da identidade visual e do fluxo do client atual.
- Mas: 174 assinaturas a reimplementar, e a sessão/refresh — a peça mais delicada — passa a ser
  **código novo**. Mitigação: não escrever do zero; copiar o `securityRequest` + `renovarUmaVezSo`
  do `seedgrid-pulse-ui` (§6), que é web, é TS e está correto.
- Some ainda assim tudo que era Tauri de verdade: `windowSize.ts`, `services/appUpdater.tsx`,
  `plugin-log` (→ `console`), `plugin-opener` (→ `window.open`), `api/event` (→ estado React),
  `useConnectionGate` (conexão com o banco local do cliente).

Sem i18n em nenhuma das duas: **nem o report-client nem o report-admin têm i18n**. Quem tem é o
`seedgrid-pulse-ui` (`components/providers/locale-provider.tsx`, 5 idiomas, integrado ao
`SgComponentsI18nProvider` do `fe-components`). O `LocaleProvider` é copiado de lá em qualquer
das opções — inclusive com a correção do React #418 (ler `localStorage` por `useSyncExternalStore`,
não no inicializador do `useState`).

### 5.3 Menu do front (pedido do dono)

```
menu:  Usuário · Perfil · Auditoria          ← copiar do report-admin (já web: security/users,
                                                security/roles, security/audit + treeview)
sgUserMenu:  Meu perfil · Minha assinatura · Temas · Sair
temas · i18n · signup · api client
```

- **Minha assinatura** = `SubscriptionManageView` + `SubscriptionPlansView` do client, portadas.
- **Signup** = `SignupForm` do client, portado; o `POST /public/signup` + confirm/resend **já vem**
  da extension (§2.1).
- **Temas** = `app/temas` + `ThemeView.tsx` do report-admin, cópia literal.
- **i18n** = `locale-provider.tsx` do `seedgrid-pulse-ui`, cópia literal (5 idiomas, integrado ao
  `SgComponentsI18nProvider`).
- **api client** (era o que você chamou de "conexão com banco" — D5) = a camada de cliente HTTP do
  front: `lib/*-api.ts` (browser) + `lib/*-api-server.ts` (BFF) do report-admin, cópia literal. É
  exatamente a peça descrita no §6, com refresh no 401, refresh em voo compartilhado e redirect para
  o login quando o refresh morre. **Não** é `client_database_config` — isso ficou fora (D5).

---

### 5.4 PWA (decidido em 2026-09-09)

O front do cliente é instalável como PWA. Com a Opção A isso é **aditivo**: não muda arquitetura,
não toca no backend, não altera nenhuma tela. Next.js App Router tem suporte nativo — não entra
`next-pwa` (desalinhado com App Router) nem Serwist; o service worker é escrito à mão, que é o que
a própria doc do Next recomenda e o que dá controle sobre o item de risco abaixo.

**Entregável (5 peças, todas novas — nada é adaptação de código existente):**

| Peça | O quê |
|---|---|
| `app/manifest.ts` | `MetadataRoute.Manifest` tipado → serve `/manifest.webmanifest`. `display: "standalone"`, `start_url: "/"`, tema alinhado ao `fe-theme` |
| `app/icon.png` + `app/apple-icon.png` + 192/512 no manifest | derivados do `logo-seedgrid.svg` que já está em `public/` |
| `public/sw.js` | service worker. Ver regra de cache abaixo |
| `components/ServiceWorkerRegistrar.tsx` | client component de registro + aviso de "nova versão disponível" |
| `app/~offline/page.tsx` | shell offline — sem ele, app instalado sem rede abre no erro do Chrome |

**A regra que não pode ser afrouxada — cache × sessão:**

> O service worker faz cache **apenas de app shell e estáticos** (`/_next/static/**`, fontes,
> ícones), com `stale-while-revalidate`. Para `/api/**` e para qualquer navegação autenticada a
> estratégia é **network-only**, sem exceção.

Dois motivos, e o segundo é grave:

1. Resposta de API em cache é o mecanismo perfeito para uma tela **mentir** — mostrar dado velho
   com a mesma confiança com que mostraria dado fresco. É a mesma família do problema de "erro
   virando lista vazia" (§8.2 e a nota do `list-load-error`), só que pior, porque nem erro há.
2. O modelo é **multi-empresa com isolamento lógico** (§2.1): o escopo vem do token
   (`companyId` + `allowedCompanies`). Cache de resposta autenticada sobrevive a troca de usuário e
   a troca de conta — e aí não é UX ruim, é **vazamento de dado entre contas**. O SW não tem como
   saber que a sessão mudou.

**O que o PWA dá aqui:** instalável (ícone na tela, tela cheia sem barra de URL), arranque rápido do
shell, e a porta aberta para push. **O que ele não dá:** funcionar offline de verdade — este app
depende do backend para tudo (listas, billing, auditoria). Offline real exigiria cache de dados +
fila de escrita, e *isso* sim mudaria muito; está fora de escopo e não é recomendado.

**Pontos de atenção:**

- **Atualização presa.** Shell em cache faz o app instalado ficar numa versão velha depois do
  deploy. Precisa de `skipWaiting` + `clients.claim` e do aviso de nova versão. Dá para casar com o
  `app.build.version` (CalVer+sha) que o `StartupBannerLogger` já expõe.
- **`Cache-Control` do próprio `sw.js`** tem de ser `no-cache`, senão o navegador segura o SW velho
  e o problema acima vira permanente.
- **iOS/Safari:** sem `beforeinstallprompt` (instalação é manual, "Adicionar à Tela de Início" —
  vale um aviso na UI), push só depois de instalado, e exige `apple-touch-icon` +
  `apple-mobile-web-app-*` no `metadata.appleWebApp`.
- **`output: "standalone"`** (já no `next.config.ts` do report-admin) é compatível: o SW é arquivo
  estático de `public/`.
- **Push notification fica fora desta rodada** — exige VAPID, endpoint de subscription e tabela no
  backend. Entra como item próprio se/quando for pedido.

**Quando fazer:** Fase 8, com o front já verde. SW ligado durante o desenvolvimento serve versão
velha e faz caçar fantasma — é a armadilha clássica de PWA, e não vale pagá-la de graça.

---

## 6. Sessão e refresh token — correção obrigatória

Levantado pelo dono: *"tanto o report quanto o pulse tinha um problema do token expirar e ele não
pegava outro token pelo refresh token .. e se o refresh expirasse, não ia pro login"*.

Verificado no código. O estado hoje é:

| Projeto | Renova no 401? | Refresh morto → login? | Onde |
|---|---|---|---|
| `seedgrid-report-admin` | **sim** | sim (`AdminAccessProvider` → `/login?expired=1`) | `lib/seedgrid-report-api-server.ts:191-305` |
| `seedgrid-pulse-ui` (security) | **sim** | sim (`logout()` → `AuthGuard`) | `lib/api/security-client.ts:145-236` |
| `seedgrid-pulse-ui` (domínio) | **sim, desde a correção** | sim | `lib/api/pulse-client.ts:51-59, 92, 123` |
| `seedgrid-report-client` | no Rust (`comandos/auth.rs`) | sim | fora do TypeScript |

E o comentário no `pulse-client.ts:55` registra exatamente o bug lembrado:

> *"O handler de refresh estava registrado; este cliente é que nunca o consultava."*

Havia **dois** clientes HTTP no Pulse; só um consultava o refresh. O outro tomava 401 calado — e,
somado ao segundo defeito (erro virando lista vazia), a tela dizia "zero conexões" com a mesma
confiança com que diria zero de verdade. Isso custou uma tarde de investigação em keepalive e
`SplitStream` quando o que havia era um token vencido.

**Qual implementação vale para o boilerplate.** Os dois fronts (front do cliente e admin) usam o
**BFF do Next**: o browser fala só com `/api/**` do próprio Next, e quem fala com a API Quarkus é o
servidor. Consequência prática: o token **nunca chega ao browser** (fica em cookie `httpOnly`) e
existe **um único** ponto de refresh, server-side — `fetchWithAdminSession` + `refreshInFlight` do
`lib/*-api-server.ts`. O `renovarUmaVezSo` client-side do `pulse-ui` é a solução do *outro* modelo
(token no browser) e **não deve ser portado junto**: implementar os dois é criar o segundo cliente
HTTP que o item 1 abaixo proíbe. Do pulse-ui vêm só o `locale-provider` e o `list-load-error`.

**Regras que o boilerplate carrega, e que valem para qualquer cliente HTTP novo:**

1. **Um único cliente HTTP por app.** Se houver mais de um, todos passam pelo mesmo interceptor.
   Cliente que não consulta o refresh é o bug, não a exceção.
2. **Refresh em voo compartilhado.** O refresh token do ext-security **rotaciona e tem detecção de
   reuso**: quando 4 requisições tomam 401 juntas e as 4 chamam o refresh com o mesmo token, a 2ª é
   lida como reapresentação e **a família inteira é revogada** — inclusive o token que a 1ª acabou de
   emitir. O efeito é perverso: a tela "volta sozinha" e o logout só aparece no vencimento seguinte.
   Copiar a solução pronta: `renovarUmaVezSo`/`emVoo` (pulse-ui) ou `refreshInFlight` (report-admin).
   Existe uma janela de graça no servidor (`reuse_grace_window_secs`, 30s), mas é rede de proteção,
   não licença.
3. **Retry exatamente uma vez** (`_isRetry`), e só quando a chamada era autenticada. Rotas públicas
   (login, 2FA, forgot/reset, confirm-email, signup) nunca disparam refresh.
4. **API fora do ar ≠ sessão inválida.** Deploy/restart não pode apagar cookie: o report-admin
   distingue `unreachable` de `invalid` e só limpa a sessão no segundo caso. Sem isso, todo deploy
   desloga todo mundo.
5. **Refresh falhou ⇒ sessão encerrada e redirect imediato para `/login?expired=1`**, com guard
   contra N redirects simultâneos (um 401 chega por várias chamadas ao mesmo tempo).
6. **Erro nunca vira lista vazia.** `data?.items ?? []` sem tratar `isError` é proibido no
   boilerplate. Copiar `components/ui/list-load-error.tsx` do pulse-ui e usá-lo em toda tela de
   lista; `emptyMessage` responde só por vazio de verdade, e `severity` segue o **tipo** da
   mensagem (erro tem de parecer erro, não `info` num badge de rodapé).

Item de teste, não de código: uma suíte que **derruba o access token** e prova (a) que a tela se
recupera sozinha, (b) que N chamadas concorrentes geram **um** refresh, (c) que refresh inválido
leva ao login. Sem isso a regressão volta calada — foi assim das duas vezes.

---

## 7. Ordem de execução

Cada fase termina em algo **verificável**. Nada de "copiei tudo e depois vejo".

| # | Fase | Entregável / prova |
|---|---|---|
| 1 | ~~Decisões D1–D5~~ ✅ fechadas em 2026-09-09 (§10). Falta só a nomenclatura (§1) | tokens definidos |
| 2 | `backend/` esqueleto: pom, application.properties, run.sh, dev.env placeholder, Dockerfile, keys novas, templates, banner | `./run.sh` sobe, `/q/health/ready` verde, `/public/login-tenancy/status` lista os módulos ativos, first-admin criado |
| 3 | `V1000` recortada + `V1001` de permissões | migrations rodam em banco limpo; `sg_flyway_schema_history_*` por módulo |
| 4 | Java copiado (§3.5) | compila; `/admin/health/readiness` responde; suíte de integração (Testcontainers) verde |
| 5 | `admin/` copiado (infra + menu podado + rotas) | login com 2FA, treeview de permissões, CRUD de usuário/perfil, auditoria, contas, planos, moedas, backup |
| 6 | `frontend/`: esqueleto do admin copiado, telas Signup/Assinatura/Settings portadas, i18n do pulse-ui | signup ponta a ponta (e-mail → confirm → Company + ROOT + trial), login, perfil, assinatura, temas, i18n |
| 7 | Testes de sessão (§6, itens a/b/c) nos dois fronts | suíte verde |
| 8 | PWA do front (§5.4) + `rename.sh` + README + `.github/workflows/deploy.yml` | app instala e abre standalone; deploy novo avisa "nova versão"; `/api/**` provado network-only; deploy dispara só no que mudou (§8.4) |
| 9 | Dívida registrada: avaliar módulos `@seedgrid/fe-*` | doc, não código |

Fases 5 e 6 são independentes entre si e podem ir em paralelo; ambas dependem de 4.

---

## 8. Armadilhas conhecidas — pagas caro, não repetir

### 8.1 Reescrever o que já estava testado
Já descrito no §0. É a armadilha-mãe: as outras são consequência.

### 8.2 Contrato de lista: `{items, total}` × array cru
O front SeedGrid lê `data.items`/`data.totalRecords`. Backend devolvendo array cru ⇒ **toda tela
vazia**, sem erro nenhum. Aconteceu no Pulse em `/users`, `/roles` e depois em
`/me/security/roles[/permissions]` (achado P1 da varredura de 2026-09-07). Ao copiar telas, copiar
junto o formato que elas esperam — e testar com **um** registro no banco, não com zero: um banco
novo só tem o admin, e "lista vazia" parece plausível.

### 8.3 `page` é 0-based no backend, 1-based no `SgDatatable`
Quem converte é a tela, não o cliente HTTP. Converter no cliente esconde a semântica e já produziu
um off-by-one que mostrava a 1ª página vazia com o total certo ao lado ("No users found" junto de
"1 - 1 of 1").

### 8.4 `paths-filter`: negação solta LIBERA tudo
No `dorny/paths-filter` a lista de padrões é avaliada em **OU**. Um item negado solto
(`- '!backend/**/*.md'`) casa com qualquer arquivo que **não** seja um `.md` do backend — ou seja,
quase tudo, e o filtro passa a liberar todo deploy. A forma correta é a exclusão dentro de um único
padrão: `- 'backend/**/!(*.md)'`. Antes de commitar mudança de filtro, rodar o próprio picomatch
com casos positivos e negativos. E conferir `gh api .../jobs`: job pulado tem
`conclusion=skipped`; se vier `success`, ele **rodou**.

### 8.5 Ordem de deploy quando há repo de plataforma
Se o `deploy.yml` do boilerplate fizer checkout da plataforma no ref `main`, a ordem de push é
**plataforma primeiro**, confirmada em `origin/main`, e só então o produto — senão o CI builda
contra artefatos velhos e quebra depois de ~11 min. E `git status` limpo não quer dizer que o
trabalho está no lugar certo: conferir `git log origin/main..main` nos dois repos.

### 8.6 Features de plataforma desligadas por default
2FA, self-enter e mailer SMTP vêm **desligados**. Sem o mailer, e-mail só vai para o log — e o
signup "não chega" sem erro nenhum. O `dev.env` do boilerplate liga os três explicitamente e
comenta o efeito de cada um.

### 8.7 Rota do menu ≠ rota real
`/security/apikeys` no menu contra `/security/api-keys` real = 404 garantido. Copiar menu e rotas
na mesma passada, e ter um teste que percorre o `navItems` e prova que toda `href` resolve.

### 8.8 Cookie de sessão é por DOMÍNIO, não por porta
Front e admin rodando em `localhost:3001` e `localhost:3000` **compartilham o mesmo jar de cookies**.
Com o mesmo nome de cookie (`sg_admin_token`, herdado da cópia), logar num apaga a sessão do outro.

O sintoma não se parece nada com a causa: em 2026-09-09, logar no front (usuário de empresa cliente,
`audience=client`) sobrescreveu a sessão do admin; o admin continuou "logado", mas com token de
cliente, e criar um plano deu **403 Acesso negado** — `PLAN_CREATE` tem `audience=platform` e é
filtrado. **Nada apareceu no log do backend**, porque 403 é decisão de autorização, não erro. Parecia
bug de permissão, ou do refresh token.

Por isso o front usa `sg_app_*` e o admin segue com `sg_admin_*`. Em produção, domínios distintos escondem
o problema; em dev ele é garantido. Ao criar um terceiro app, dê nome próprio ao cookie dele.

> Diagnóstico rápido: **403 ≠ 401**. 403 = sessão válida sem permissão (não desloga, não loga nada);
> 401 = sessão inválida. Se um 403 aparecer onde a permissão está claramente concedida no banco,
> desconfie de QUAL sessão está sendo usada antes de desconfiar da permissão.

### 8.9 Ruído do Cloudflare no console
O erro `startTime`/`reportAllChanges` no console **não é do produto** — é o Cloudflare Insights.
Descontar antes de investigar.

### 8.9 Testcontainers enchem o disco
Com RYUK desligado os containers ficam de pé depois da suíte. Limpar periodicamente, sem matar a
stack `seedgrid-platform-dev`.

### 8.10 Segredos no `dev.env`
Já tratado em §3.4 — e vale repetir porque é o item de maior consequência do plano: o `dev.env` do
report está versionado **com chave privada RSA, senha SMTP, chaves OpenAI, Qdrant, Stripe e MinIO em
claro**. Copiar esse arquivo como está para um boilerplate propaga todos eles para cada produto
novo. Placeholder + `.env` gitignored, sem exceção.

---

## 9. Inventário de origem (referência rápida)

| Origem | Tamanho | Papel no boilerplate |
|---|---|---|
| `seedgrid-report-api` | 267 arquivos Java, 33 migrations | base do backend |
| `seedgrid-report-admin` | Next.js 16, ~150 rotas de API BFF | base do admin **e** (opção A) do front |
| `seedgrid-report-client` | Vite+React+Tauri, 174 `invoke()`, ~12k linhas de views | telas do front |
| `seedgrid-pulse-ui` | Next.js 16 | i18n, `list-load-error`, refresh client-side |
| `seedgrid-quarkus-ext-login-tenancy` | extension | tudo de fundação (§2.1) |
| `seedgrid-fe-components/packages/modules` | 9 pacotes npm | dívida a avaliar (§2.2) |

---

## 10. Decisões — fechadas com o dono em 2026-09-09

**D1 — Base do front do cliente: Opção A.** Esqueleto Next.js + BFF copiado do `report-admin`;
Signup, Assinatura e Settings portadas do `report-client` (`invoke` → `fetch`); i18n e
`list-load-error` copiados do `seedgrid-pulse-ui`. Nada é inventado. Ver §5.2.

**D2 — Trial: entra.** `TrialProvisioningService` + `ReportTrialConfig` + seed do `plan_term` TRIAL
+ item "Trial" no menu do admin. É a assinatura gratuita provisionada no confirm-email do signup.

**D3 — Preços de IA: entra completo.** `ai/pricing/**`, as 4 tabelas do catálogo/preço de modelo,
o scheduler e o notificador. Entra o **preço do modelo**, não o **consumo por conta** (§3.5).

**D4 — Extras do admin: Visão Geral e Assinaturas entram; Sessão e Parceiros ficam de fora.**

**D5 — "Conexão com banco" era o *api client*.** Não é o banco do cliente: o
`client_database_config` e o `/me/local-db` são domínio do report e ficaram **fora**. O que entra é
a camada de cliente HTTP do front (§5.3 e §6).

*Aberto (menor, decidível na hora):* incluir ou não o item de menu "Modelos de IA" no admin — ver
nota ao fim do §4.2.

---

## 11. O que este plano deliberadamente NÃO faz

- Não adota o server tier dos módulos `@seedgrid/fe-*` durante a construção (§13 trata disso).
- Não toca em `seedgrid-fe-components` (push ali publica no npm).
- Não altera o `seedgrid-report` nem o `seedgrid-pulse`: os dois são **origem**, somente leitura.
- Não faz o PWA agora (§5.4) — fica para o momento oportuno, com confirmação antes.

---

## 12. `PlanTerm`: subir `maxUsers` e `permissions` para a fundação ✅ FEITO (2026-09-10)

> **Continuação decidida em 2026-09-10, ainda não executada:** os três — `plans`, `plan_terms` e
> `plan_term_permissions` — passam a ter **um dono só, o `seedgrid-billing-core`**, que passará a
> depender do `seedgrid-security`. O plano está em
> `seedgrid-platform-work/arquivo/planos/billing/2026-09-10-billing-dono-da-familia-plan.md`.
>
> O que está descrito abaixo **não vira desperdício**: a `V704` já tirou os dois campos do host, que
> era o problema concreto. A continuação move o DONO de módulo — mesma tabela, mesmas colunas, sem
> migração de dado — e a `V704` vira no-op sozinha, sem exigir `repair` em ambiente nenhum.

**Decisão do dono, 2026-09-10.** Hoje o `PlanTerm` do host acumula três coisas de naturezas
diferentes; duas delas não são de produto nenhum.

Fronteira atual, verificada no código:

| Camada | Campos |
|---|---|
| `PlanTermEntity` (billing-core, `@MappedSuperclass`) | `planId`, `monthlyPrice`, `overagePrice`, `providerPriceId`, `providerOveragePriceId`, `effectiveFrom/To`, `featuresJson` |
| `PlanTerm` (host — veio do report) | `monthlyRequests`, `maxUsers`, `permissions` |

A fundação sabe **precificar excedente**, mas não sabe **o que** está sendo contado — e o que o
report conta é "requisição de IA". Já `maxUsers` (assentos) e `permissions` (feature gating por
plano) não têm nada de report: são de qualquer SaaS sobre tenancy.

### Destino: os dois vão para o `login-tenancy`. O `billing-core` NÃO é tocado.

Uma primeira versão deste plano mandava `max_users` para o `billing-core`, com o argumento de que é
"um número, universal a billing". O dono recusou, com razão, e o argumento não se sustenta:

- **Na prática:** o `login-tenancy` já vai ganhar um `@MappedSuperclass` por causa das
  `permissions`. `max_users` cabe nele sem custo — um artefato alterado em vez de dois, e **uma**
  cascata de republicação em vez de duas.
- **No mérito:** `max_users` é *usuários* por plano, e só significa algo onde existe modelo de
  usuário — que é exatamente o que o `billing-core` não conhece. Mandá-lo para lá seria enfiar um
  conceito de security dentro do módulo agnóstico, o mesmo erro que se evitou nas `permissions`.

`plan_term_permissions` tem FK para `permissions(id)`, da security; e o `billing-core` **não
depende de `seedgrid-security`** (só commons, privacy, resilience), agnosticidade que é deliberada.
O `login-tenancy` depende dos dois — é o orquestrador, e é onde os dois campos pertencem.

### Estratificação alvo

Preserva o motivo de `PlanTermEntity` ser `@MappedSuperclass` (evitar coluna discriminadora
`DTYPE`: cada host tem exatamente uma subclasse concreta):

```
BaseEntityPanache
 └─ PlanTermEntity            billing-core    INALTERADO
      └─ LoginTenancyPlanTerm login-tenancy   @MappedSuperclass  (+ maxUsers, + permissions)
           └─ PlanTerm        host            @Entity            (+ a cota do produto, se houver)
```

**Migration:** entra no passo `login-tenancy`, que roda DEPOIS de `billing` e de `security` (ordem
da §2.1) — então `plan_terms` já existe para receber o `alter`, e `permissions` já existe para a FK.
Alterar `plan_terms` de fora do `billing-core` não é novidade: é o que o próprio
`billing/V502.1__plan_term_quota_columns.sql` deste boilerplate já faz, uma camada abaixo.

**Efeito colateral bom:** o `PlanTerm` do boilerplate fica só com `monthly_requests` — exatamente o
que é domínio do report. O boilerplate passa a poder **não declarar** `PlanTerm` próprio, e cada
produto declara o seu com a unidade que ele mede (requisições, GB, notas, nada).

### Consequências (isto sai do boilerplate)

1. **Toca o `seedgrid-report`, que está em produção.** O `PlanTerm` dele declara `max_users` e
   `permissions`; ao subir a fundação nova, viram mapeamento duplicado e **têm de sair de lá na
   mesma passada**.
2. **Migrations da fundação precisam ser idempotentes** (`add column if not exists`,
   `create table if not exists`): o banco do report já tem as duas coisas, criadas pela V1000/V1026
   dele. Sem isso, o boot do report quebra na subida.
3. **Cascata de republicação:** `login-tenancy` (e o BOM dele) → report + boilerplate. O
   `billing-core` não entra.

### Sequenciamento recomendado

**Depois** de o boilerplate fechar verde — não junto. Misturar "montar o boilerplate copiando" com
"refatorar a fundação" é a mesma mistura do §0, e o erro se propagaria para todo produto derivado de
uma vez. O alcance também é diferente: aqui o risco é um produto em produção, não um repositório
novo.

---

## 13. "Arredondar os `fe-*`" — por que depois, e como

Pergunta do dono: já que o `fe-security` foi trabalhado até ficar redondo, dá para estender isso a
`fe-apikeys`, `fe-backup`, `fe-audit`, `fe-billing-user`, `fe-billing-platform`, `fe-self-enter` e
`fe-login-tenancy`? É o momento?

**O achado que muda a pergunta (§2.2):** isso **já foi feito**. Os 9 módulos já existem, já estão
publicados e já seguem a mesma forma — `paths.ts`, `module.ts` (manifesto do CLI Rust), DTOs,
`server/create-<x>-server.ts`. O `create-security-server.ts` diz no cabeçalho que é o
`lib/seedgrid-report-api-server.ts` do admin-web portado com os hardcodes parametrizados.

O que falta não é extração — é **um consumidor**. Nenhum app usa o motor de nenhum módulo, e o
`report-admin` está pinado numa versão que sequer contém o motor.

Um pacote com zero consumidores não está redondo; está **hipotético**. Estender a decisão para mais
7 antes de um app exercitar o primeiro multiplica por 8 uma aposta não testada — e cada iteração de
design custa um **release público**, porque push na main do `fe-components` publica no npm.

**Sequência proposta:**

1. **Terminar o boilerplate copiando** (Fases 2–7). Sem tocar em `fe-*`.
2. **Durante a cópia, anotar** o que veio literal do `report-admin` e não mudou uma linha. Essa
   lista é a evidência empírica do que é genérico de verdade — não a intuição. Previsão: o motor de
   sessão, os cookies, o `permission-tree`, o `problem-response`.
3. **Um experimento controlado, só no boilerplate:** trocar `lib/*-api-server.ts` por
   `createSecurityServer({...})` do `fe-security@2026.7.3`. O critério de aprovação são quatro
   pontos, não "compilou": login, 2FA, **refresh sob concorrência** (§6) e **403 ≠ 401** (403 não
   pode deslogar). Se passar, `fe-security` está provado com um consumidor real. Se não passar,
   você descobriu isso com **um** pacote, não com oito.
4. **Provado o `fe-security`, os outros 7 vão em cascata** — e aí é rápido, justamente porque já
   estão escritos na mesma forma. O trabalho vira validação, não design.
5. **O `report-admin` migra por último**, para a versão já validada. Ele é o app que está em
   produção; não é cobaia.

**Por que o boilerplate é o cobaia certo:** é o segundo consumidor de um código que hoje tem um. Uma
abstração se valida com dois — com um, você só descreveu o primeiro. E ele ainda não está em
produção, então errar é barato.

**Efeito colateral bom:** o passo 3 também decide o destino do `fe-commons` (cep, cnpj, http), que
hoje tem **zero** consumidores nos três fronts. O `SignupForm` do report-client valida CNPJ — é o
teste natural para saber se `fe-commons/cnpj` serve ou se é código órfão.

**Uma alternativa registrada e não recomendada:** construir o boilerplate já em cima dos `fe-*`
desde o início. É defensável (o consumidor nasce integrado), mas aí o boilerplate deixa de ser
cópia e vira integração — exatamente a troca que produziu os bugs do Pulse (§0), só que agora o
erro se propagaria para todo produto futuro de uma vez.
