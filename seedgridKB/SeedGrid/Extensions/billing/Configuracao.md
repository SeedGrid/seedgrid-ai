---
tags: [seedgrid, extension, billing, quarkus, configuracao]
fonte: java/seedgrid-quarkus-ext-billing
branch: main
commit: ba38efc347
analisado-em: 2026-10-14
---

# Billing (Quarkus): configuração

Voltar para [[SeedGrid/Extensions/billing/Visao-geral|Visão geral do billing]] · [[SeedGrid/Extensions/billing/Exemplos|Exemplos]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.billing.*` no core e `seedgrid.billing.stripe.*` no provider Stripe |
| Classes `@ConfigMapping` (core) | `BillingAccessGateConfig` (`seedgrid.billing.access-gate`), `BillingApiConfig` (`seedgrid.billing.api`), `BillingCatalogConfig` (`.catalog`), `BillingCheckoutConfig` (`.checkout`), `BillingPortalConfig` (`.portal`), `BillingTrialConfig` (`.trial`), `BillingFeatureGateConfig` (`.feature-gate`), `PlanTermAttributesConfig` (`.plan-term.additional-attributes`), `BillingReconciliationConfig` (`.reconciliation`) |
| `@ConfigProperty` (core) | `BillingConfig` (business-timezone, currency, overage-meter-name), `BillingEntityManager` (persistence-unit), `PlanPublicationService` (stripe.product, como fallback) |
| `ConfigProvider` direto | `BillingApiOpenApiFilter` (`seedgrid.billing.api.enabled`) |
| `@ConfigProperty` (stripe) | `StripeBillingProvider` (apiKey, webhookSecret, defaultSuccessUrl, defaultCancelUrl, test-clock-enabled) e `StripeProductBootstrap` (product, product-name) |
| Defaults em arquivo | `seedgrid-billing-core/runtime/src/main/resources/META-INF/microprofile-config.properties` (ordinal 100) |
| Fase | **Todas são de runtime.** Não há `@ConfigRoot` nem `*BuildTimeConfig` nos deployments. Os processors só registram feature, beans e `ConsumesUsageSites`. |

Abreviações usadas na coluna Origem:
- `core/` = `java/seedgrid-quarkus-ext-billing/seedgrid-billing-core/runtime/src/main/java/br/com/seedgrid/billing/`
- `stripe/` = `java/seedgrid-quarkus-ext-billing/seedgrid-billing-stripe/runtime/src/main/java/br/com/seedgrid/billing/stripe/`
- `core-mp` = `seedgrid-billing-core/runtime/src/main/resources/META-INF/microprofile-config.properties`

**Por que cada grupo tem um prefixo próprio:** o SmallRye recusa chave desconhecida sob o prefixo de um mapping. Se houvesse um mapping único em `seedgrid.billing`, as chaves `seedgrid.billing.stripe.*` derrubariam o boot. **Confirmado** (javadoc de `BillingConfig`).

**Variáveis de ambiente:** a regra MicroProfile se aplica sem ambiguidade a todas as propriedades abaixo, porque a busca vai da propriedade para a env. Exemplos: `seedgrid.billing.access-gate.enabled` vira `SEEDGRID_BILLING_ACCESS_GATE_ENABLED`, e `seedgrid.billing.stripe.apiKey` vira `SEEDGRID_BILLING_STRIPE_APIKEY`. Além disso, o `core-mp` expande **nomes explícitos** em algumas chaves, indicados na coluna Relações. Três deles **diferem** da regra MP.

## 2. Propriedades próprias

### 2.1 Geral / negócio

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.business-timezone` | String (ZoneId) | qualquer `ZoneId` válido | `America/Sao_Paulo` | Não | Define o fuso em que o negócio conta os dias: vigência de preço, virada do ciclo e data nos e-mails de acesso. Valor vazio ou inválido gera um WARN e usa `America/Sao_Paulo`, sem derrubar o boot. | `BusinessTimeZone` → services de ciclo, `UserAccessEmails` | `core-mp` expande `${SEEDGRID_BILLING_BUSINESS_TIMEZONE:America/Sao_Paulo}`. É independente de `seedgrid.app.business-timezone` (commons). | runtime | declaração: `core/configs/BillingConfig.java` (construtor); consumo: `core/configs/BusinessTimeZone#resolve` |
| `seedgrid.billing.currency` | String | código ISO 4217 em minúsculas (ex.: `brl`, `usd`), como o Stripe espera | `brl` | Não | Moeda dos preços publicados no provider (fixo e metered) e do overview. | `PlanPublicationService#publish`, `BillingOverviewService` | `core-mp`: `${SEEDGRID_BILLING_CURRENCY:brl}` | runtime | `core/configs/BillingConfig.java`; consumo `core/services/PlanPublicationService#publish` |
| `seedgrid.billing.overage-meter-name` | String | texto livre | `Excedente` | Não | Prefixo do nome **exibido** do meter de excedente no provider: `"<valor> - <label do contador>"`. O identificador técnico é o event name `overage_<produto>_<contador>`. | `PlanPublicationService#publish` | — | runtime | `core/configs/BillingConfig.java`; consumo `core/services/PlanPublicationService#publish` |
| `seedgrid.billing.persistence-unit` | Optional\<String\> | nome de PU; vazio ou `<default>` = PU default | — (sem valor = PU default) | Não | Escolhe o `EntityManager` das tabelas do billing. | `BillingEntityManager` (repositories do billing) | O `subdomain-tenancy` define `master` no microprofile-config dele (**Confirmado**). Usuários e security continuam no EntityManager da security. | runtime | `core/repositories/BillingEntityManager.java` (construtor) |

### 2.2 API e bloqueio geral

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.api.enabled` | boolean | `true`/`false` | `true` | Não | Com `false`, os prefixos `/admin/plans`, `/admin/subscriptions`, `/admin/accounts`, `/admin/billing`, `/me/plans`, `/me/subscription`, `/me/usage` e `/me/billing` respondem 404 (pre-matching, antes da autenticação) e somem do OpenAPI. O webhook continua. | `BillingApiToggleFilter#filter` (lido por requisição) e `BillingApiOpenApiFilter` (no startup) | O login-tenancy liga este valor a `seedgrid.login-tenancy.modules.billing.enabled` (BILLING_INTEGRATION_GUIDE). O default fica no `@WithDefault` de propósito, para um tenancy poder definir o próprio default sem empatar em ordinal. | runtime | `core/configs/BillingApiConfig#enabled`; consumo `core/filters/BillingApiToggleFilter`, `core/filters/BillingApiOpenApiFilter#filterOpenAPI` |
| `seedgrid.billing.access-gate.enabled` | boolean | `true`/`false` | `false` | Não | Liga o bloqueio **geral**: conta sem assinatura vigente recebe 402 em qualquer endpoint autenticado. Ficam liberados `OPTIONS`, anônimos, `/public`, `/q/`, `/me/plans`, `/me/subscription`, `/me/usage`, `/me/billing`, `allowed-paths`, `@SgPlatformScope` e usuário sem conta. | `AccessGateFilter#filter` (por requisição) | O bloqueio por funcionalidade (`@SgConsumesUsage`/`@SgRequiresPlanFeature`) independe deste. | runtime | `core/configs/BillingAccessGateConfig#enabled`; consumo `core/filters/AccessGateFilter#filter` |
| `seedgrid.billing.access-gate.block-past-due` | boolean | `true`/`false` | `true` | Não | Assinatura `PAST_DUE` também nega acesso no bloqueio geral (402 `PAYMENT_PAST_DUE`). | `SubscriptionAccessService#denialForAccess`, chamado só por `AccessGateFilter` | **Confirmado:** só tem efeito com `access-gate.enabled=true`. O **consumo** (`denialForConsumption`/`denialForAnyConsumption`) sempre bloqueia `PAST_DUE`, independentemente desta flag. | runtime | `core/configs/BillingAccessGateConfig#blockPastDue`; consumo `core/services/SubscriptionAccessService#denialForAccess` |
| `seedgrid.billing.access-gate.allowed-paths` | Optional\<List\<String\>\> | prefixos separados por vírgula; casa por fronteira de segmento (`/me/plans` não casa `/me/plansx`); prefixo terminado em `/` casa qualquer coisa abaixo | — | Não | Prefixos extras sempre liberados pelo bloqueio geral. | `AccessGateFilter#allowedPaths`, `BillingPaths#startsWithAny` | Somados a `RestControllerPath.ACCESS_GATE_ALWAYS_ALLOWED`. | runtime | `core/configs/BillingAccessGateConfig#allowedPaths` |

### 2.3 Catálogo, checkout e portal

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.catalog.product-id` | Optional\<String\> | ID do produto no provider | — (cai em `seedgrid.billing.stripe.product`) | Condicional: um dos dois é necessário para publicar term, criar meter e reportar excedente | Define o produto sob o qual os preços dos planos e os meters (`overage_<produto>_<contador>`) são criados. Sem nenhum dos dois, a publicação lança `ProviderProductNotConfiguredException`, e o consumo com excedente não reporta ao provider (retorno silencioso). | `PlanPublicationService#productId`, `UsageService#reportOverageAfterCommit` | Fallback: `seedgrid.billing.stripe.product`. | runtime | `core/configs/BillingCatalogConfig#productId`; consumo `core/services/PlanPublicationService#productId` |
| `seedgrid.billing.checkout.success-url` | Optional\<String\> | URL absoluta | — | Condicional: o Stripe exige URL de sucesso; sem ela, vale `seedgrid.billing.stripe.defaultSuccessUrl` | URL para onde o provider devolve o cliente após o checkout. | `CheckoutService` → `CheckoutRequest.successUrl` | O Stripe usa `defaultSuccessUrl` quando esta é nula. Se ambas faltarem, envia `""` (**Inferência:** o Stripe recusaria a sessão). | runtime | `core/configs/BillingCheckoutConfig#successUrl`; consumo `core/services/CheckoutService` (l.120) |
| `seedgrid.billing.checkout.cancel-url` | Optional\<String\> | URL absoluta | — | Condicional (idem) | URL de retorno quando o cliente cancela o checkout. | `CheckoutService` | Fallback: `seedgrid.billing.stripe.defaultCancelUrl`. | runtime | `core/configs/BillingCheckoutConfig#cancelUrl`; consumo `core/services/CheckoutService` (l.121) |
| `seedgrid.billing.portal.return-url` | Optional\<String\> | URL absoluta | — | Não | URL de retorno do customer portal. Sem valor, não chama `setReturnUrl` (o Stripe usa o default da conta). | `SubscriptionChangeService#portal` → `StripeBillingProvider#createPortal` | — | runtime | `core/configs/BillingPortalConfig#returnUrl`; consumo `core/services/SubscriptionChangeService` (l.86) |

### 2.4 Trial e feature gate

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.trial.enabled` | boolean | `true`/`false` | `true` | Não | Conta nova sem nenhuma assinatura ganha uma assinatura `ACTIVE` no term do trial. | `TrialService#provisionTrial` | `core-mp`: `${SEEDGRID_BILLING_TRIAL_ENABLED:true}` | runtime | `core/configs/BillingTrialConfig#enabled`; consumo `core/services/TrialService#provisionTrial` |
| `seedgrid.billing.trial.plan-term-public-id` | String | `publicId` de um term do plano TRIAL | `00000000-0000-0000-0000-0000000000a2` (semeado pelo `R__billing_seed.sql`) | Não | Define o term usado no trial. Se não existir, `provisionTrial` só registra um WARN, enquanto `/admin/plans/trial` lança `TrialPlanNotFoundException`. Um term de outro plano também é recusado. | `TrialService#requireTrialTerm`, `#provisionTrial` | `core-mp`: `${SEEDGRID_BILLING_TRIAL_PLAN_TERM_PUBLIC_ID:...}` | runtime | `core/configs/BillingTrialConfig#planTermPublicId` |
| `seedgrid.billing.feature-gate.exempt-company-ids` | Optional\<List\<Long\>\> | IDs internos de `Company`, separados por vírgula | — | Não | Companies nunca bloqueadas por `@SgRequiresPlanFeature`, por exemplo a empresa da plataforma. | `PlanFeatureGate#isExempt` | — | runtime | `core/configs/BillingFeatureGateConfig#exemptCompanyIds`; consumo `core/services/PlanFeatureGate` |

### 2.5 Limites dos `additionalAttributes` e reconciliação

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.plan-term.additional-attributes.max-size-bytes` | int | inteiro positivo | `16384` | Não | Tamanho máximo, em bytes UTF-8, do JSON final. Se exceder, responde HTTP 400. | `PlanTermAttributesService` | `core-mp` expande `${SEEDGRID_BILLING_PLAN_TERM_ATTRIBUTES_MAX_SIZE_BYTES:16384}`. **O nome explícito difere** da regra MP (`SEEDGRID_BILLING_PLAN_TERM_ADDITIONAL_ATTRIBUTES_MAX_SIZE_BYTES`). Ambos funcionam (Inferência pela precedência de ordinais). | runtime | `core/configs/PlanTermAttributesConfig#maxSizeBytes`; consumo `core/services/PlanTermAttributesService` (l.50) |
| `seedgrid.billing.plan-term.additional-attributes.max-depth` | int | inteiro positivo (objeto raiz = 1) | `5` | Não | Profundidade máxima de aninhamento. | idem | `core-mp`: `SEEDGRID_BILLING_PLAN_TERM_ATTRIBUTES_MAX_DEPTH` (difere da regra MP) | runtime | `core/configs/PlanTermAttributesConfig#maxDepth` |
| `seedgrid.billing.plan-term.additional-attributes.max-keys` | int | inteiro positivo | `100` | Não | Total de chaves em todos os objetos, inclusive aninhados e dentro de arrays. | idem | `core-mp`: `SEEDGRID_BILLING_PLAN_TERM_ATTRIBUTES_MAX_KEYS` (difere da regra MP) | runtime | `core/configs/PlanTermAttributesConfig#maxKeys` |
| `seedgrid.billing.reconciliation.throttle-seconds` | long | `>= 0`; `0` = sem throttle | `60` | Não | Intervalo mínimo entre reconciliações **implícitas** da mesma conta com o provider (anti-stampede, guardado em memória). | `SubscriptionReconciliationService#reconcileThrottled` | `core-mp`: `${SEEDGRID_BILLING_RECONCILIATION_THROTTLE_SECONDS:60}` | runtime | `core/configs/BillingReconciliationConfig#throttleSeconds`; consumo `core/services/SubscriptionReconciliationService` (construtor) |

### 2.6 Provider Stripe (`seedgrid-billing-stripe`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `seedgrid.billing.stripe.apiKey` | String | secret key do Stripe (`sk_test_…`/`sk_live_…`); **não** use a publishable `pk_…` | — | **Sim**, com o módulo stripe presente (**Inferência forte**: `@ConfigProperty` String sem default; o teste de deployment define valor dummy) | Atribuída a `Stripe.apiKey` global no `@PostConstruct`. O prefixo `sk_test` ativa o Test Clock e a busca de customers em clocks. | `StripeBillingProvider#init`, `#maybeCreateTestClockCustomer` | env: `SEEDGRID_BILLING_STRIPE_APIKEY`. O guia de integração sugere `${STRIPE_API_KEY}` no host. | runtime | `stripe/spis/impl/StripeBillingProvider.java` (construtor) |
| 🔒 `seedgrid.billing.stripe.webhookSecret` | String | signing secret do endpoint (`whsec_…`) | — | **Sim**, com o módulo stripe (mesma inferência) | Valida o header `Stripe-Signature` em `Webhook.constructEvent`. Se falhar, responde 400. | `StripeBillingProvider#parseAndVerifyWebhook` | env: `SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET`. Em dev, vem do `stripe listen`. | runtime | idem (l.251) |
| `seedgrid.billing.stripe.defaultSuccessUrl` | Optional\<String\> | URL absoluta | — | Condicional (ver `checkout.success-url`) | Fallback quando o core não envia a URL de sucesso. Sem nenhuma das duas, envia `""`. | `StripeBillingProvider#createCheckout` | Preferir `seedgrid.billing.checkout.success-url`. | runtime | idem (l.126) |
| `seedgrid.billing.stripe.defaultCancelUrl` | Optional\<String\> | URL absoluta | — | Condicional | Fallback da URL de cancelamento. | `StripeBillingProvider#createCheckout` | Preferir `seedgrid.billing.checkout.cancel-url`. | runtime | idem (l.127) |
| `seedgrid.billing.stripe.test-clock-enabled` | boolean | `true`/`false` | `true` | Não | Com chave `sk_test`, a nova assinatura nasce num customer preso a um Stripe Test Clock, para testes E2E. Com chave live, é ignorada. | `StripeBillingProvider#maybeCreateTestClockCustomer` | Só tem efeito com `apiKey` iniciada por `sk_test`. | runtime | idem (construtor, l.101) |
| `seedgrid.billing.stripe.product` | Optional\<String\> | ID do produto Stripe (fixo, escolhido pelo host) | — | Condicional (ver `catalog.product-id`) | No startup, `StripeProductBootstrap` faz retrieve-or-create do produto. É best-effort: falha gera WARN. Também serve de fallback do `catalog.product-id`. | `StripeProductBootstrap#onStart`, `PlanPublicationService#productId` | Lida também pelo **core**. | runtime | `stripe/services/StripeProductBootstrap.java`; `core/services/PlanPublicationService.java` (construtor) |
| `seedgrid.billing.stripe.product-name` | Optional\<String\> | texto | — (usa o próprio ID) | Não | Nome do produto criado no bootstrap. | `StripeProductBootstrap#onStart` | Só tem efeito com `seedgrid.billing.stripe.product`. | runtime | `stripe/services/StripeProductBootstrap.java` |

### 2.7 Propriedades de outras extensions lidas ou exigidas pelo billing

| Propriedade | Dona | Uso no billing | Origem |
|---|---|---|---|
| `seedgrid.show-dev-message` (default `false`) | commons/security (mesma chave em `ApiExceptionHandler` do commons) | O `ApiExceptionHandler` do `commons` inclui a `devMessage` no problem+json (a `BillingApiExceptionExtension` e a base `BillingException` foram removidas: as exceptions do billing herdam `BusinessException`/`SystemSeedGridException`) | `commons` (`ApiExceptionHandler`) |
| `seedgrid.ratelimit.billing-webhook.{enabled,permits,window}` | resilience (`RateLimitService`) | ajusta o rate limit do webhook (default 300/min) | `core/controllers/BillingWebhookController` (`@SgRateLimit(configKey="billing-webhook")`) |
| `seedgrid.ratelimit.billing-checkout.{enabled,permits,window}` | resilience | checkout (default 30/min) | `core/controllers/MeBillingController` |
| `seedgrid.ratelimit.billing-portal.{enabled,permits,window}` | resilience | portal (default 30/min) | `core/controllers/MeBillingController` |
| `seedgrid.security.encryption.key` 🔒, `seedgrid.security.default-company.*`, `seedgrid.security.jwt.*` | security | obrigatórias da security, que o billing passou a exigir transitivamente em 2026-09-10 | comentário em `seedgrid-billing-core/deployment/src/test/resources/application.properties` |

Ver [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience]] e [[SeedGrid/Extensions/security/Configuracao|Configuração do security]].

### 2.8 Propriedades do ciclo 2026.10.22 (NÃO PUBLICADAS): inadimplência e escolha no checkout

> **Não publicado.** Entram com `seedgrid-billing-core` 2026.10.22. Receitas e contratos: [[SeedGrid/Extensions/billing/Inadimplencia-e-limites-do-plano|Limites do plano e inadimplência]].

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.billing.past-due.enabled` | boolean | `true`, `false` | `false` | Não | Liga o ciclo de inadimplência das empresas e o agendador. Ligado, **substitui** o bloqueio geral 402 `PAYMENT_PAST_DUE` (`access-gate.block-past-due`); o bloqueio de consumo de contador continua. | `BillingPastDueConfig` | Prazos do `PlanTerm` sobrepõem | Runtime | `BillingPastDueConfig` |
| `seedgrid.billing.quota.users.enabled` | boolean | `true`, `false` | `false` | Não | Liga o `PlanUserQuotaValidator` (limite `maxUsers`). Desligada, o bean não existe (`@IfBuildProperty`, resolvido no build) e vale o "sem limite" da security. | `PlanUserQuotaValidator`/`PlanCompanyQuotaValidator` | Host com regra própria: deixar desligada e declarar o próprio validador, sem `@Alternative`/`@Priority` | Build | — |
| `seedgrid.billing.quota.companies.enabled` | boolean | `true`, `false` | `false` | Não | Liga o `PlanCompanyQuotaValidator` (limite `maxCompanies`). Desligada, o bean não existe (`@IfBuildProperty`, resolvido no build) e vale o "sem limite" da security. | `PlanUserQuotaValidator`/`PlanCompanyQuotaValidator` | Host com regra própria: deixar desligada e declarar o próprio validador, sem `@Alternative`/`@Priority` | Build | — |
| `seedgrid.billing.past-due.read-only-after-days` | int | `0` ou mais | `7` | Não | Dias `PAST_DUE` até as empresas da conta virarem `READ_ONLY`. `0` não aplica o passo. `PlanTerm.pastDueReadOnlyAfterDays` sobrepõe (nulo usa este). | `PastDueService` | — | Runtime | `BillingPastDueConfig` |
| `seedgrid.billing.past-due.disable-after-days` | int | `0` ou mais | `30` | Não | Dias `PAST_DUE` até desligar as empresas (menos a do responsável). `0` não aplica o passo. `PlanTerm.pastDueDisableAfterDays` sobrepõe. | `PastDueService` | — | Runtime | `BillingPastDueConfig` |
| `seedgrid.billing.past-due.interval` | String | intervalo do `@Scheduled every` | `1h` | Não | Intervalo do agendador de inadimplência. | `PastDueScheduler` | — | Runtime | Insumo Fase 5 (não publicado) |
| `seedgrid.billing.checkout.selection-ttl` | Duration | ex.: `48h` | `48h` | Não | Validade da referência (`selectionRef`) da escolha de usuários e empresas feita no checkout. Vencida, inexistente ou de outra conta: a assinatura é ativada sem perdas e o evento `CheckoutSelectionEvent` avisa o host. | `CheckoutSelectionService` | — | Runtime | Insumo Fase 5 (não publicado) |

## 3. Propriedades de frameworks (definidas no `core-mp`, ordinal 100)

> **Migrations por código (na `main` do `extensions` em 2026-10-27; vale a partir da próxima versão publicada).** A `billing` migra a si mesma, como `cities`, `ai-pricing`, `exchange`, `business-days` e `notification`: classe `BillingMigrations` (`LOCATION`, `HISTORY_TABLE`, `migrate(DataSource[, schema])`), runner no startup e `FlywayConfigurationCustomizer` que migra **antes** do Flyway do host (o host pode ter FK nas tabelas dela). Ela **não define** `quarkus.flyway.table|locations|migrate-at-start|baseline-*`, e o host não lista `db/migration/billing` no `quarkus.flyway.locations`. Histórico próprio: `sg_flyway_schema_history_billing`; a `flyway_schema_history` do host não muda. A única propriedade é `seedgrid.migrations.host-managed` (padrão `false`; `true` = o host migra chamando `migrate(...)` e o runner não age). Não existe `seedgrid.billing.migrations.enabled`.
>
> **Regra obrigatória para o host (quebra de compatibilidade):** aponte `quarkus.flyway.locations` para a pasta do próprio host (ex.: `classpath:db/migration/app`) e **nunca deixe o padrão `db/migration`**. O padrão varre as subpastas das extensions (`db/migration/security`, `/billing`, `/cities`...) e as migra de novo na `flyway_schema_history` do host; a migração da extension então falha com "tabela já existe" ou "ON CONFLICT sem constraint". Host sem migrations próprias também precisa da propriedade (a pasta pode nem existir). Host com migrations soltas em `db/migration/V1__...` deve movê-las para uma subpasta (ex.: `db/migration/app`).
>
> **Ordem:** o Quarkus não ordena os `FlywayConfigurationCustomizer`, então a ordem entre extensions vem de dependência no código: `BillingMigrations.migrate` e `ApiKeysMigrations.migrate` chamam `SecurityMigrations.migrate` antes (idempotente). No startup, os runners (`XxxMigrationRunner`) seguem o `@Priority` do CDI: security 10, audit 20, backup 30, billing 40, apikeys 50, cities 100. Só security, billing e apikeys têm customizer (migram antes do Flyway do host, que pode ter FK nas tabelas delas); audit e backup migram só pelo runner.

>
> **Baseline do Flyway do host:** depois que a extension migra, o schema não está vazio e o host ainda não tem histórico; o Flyway dele recusaria subir. Por isso o customizer liga `baselineOnMigrate=true` com `baselineVersion=0` no Flyway do **host** (sem sobrescrever se o host já definiu): `SecurityMigrations.allowNonEmptySchema(FluentConfiguration)`.
| Propriedade | Valor no `core-mp` | Efeito / recomendação |
|---|---|---|
| `quarkus.hibernate-orm.database.generation` | `none` | — |
| `quarkus.hibernate-orm.physical-naming-strategy` | (não definido) | **Recomendado** pelos testes: `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy`. As entidades da security exigem esse valor. O login-tenancy já o fixa. |

> Login-tenancy e subdomain-tenancy desligam o Flyway nativo e rodam as migrations por módulo (`LoginTenancyMigrationService`, `MigrationService`). Nesses hosts, os `quarkus.flyway.*` acima não governam a ordem.

## 4. Propriedades usadas só em testes

| Arquivo | Propriedades relevantes |
|---|---|
| `seedgrid-billing-core/deployment/src/test/resources/application.properties` | `quarkus.flyway.locations=classpath:db/migration/app` e `quarkus.flyway.table=flyway_schema_history` (security e billing migram sozinhas), naming strategy, `quarkus.hibernate-orm.schema-management.strategy=none`, `seedgrid.security.*` (valores de teste) |
| `seedgrid-billing-core/integration-tests/src/test/resources/application.properties` | datasource e Flyway (`classpath:db/migration/app`, `clean-at-start=true`; security, audit e billing migram sozinhas), `seedgrid.audit.*`, `seedgrid.security.*`, `mp.jwt.*`, `smallrye.jwt.*`, `quarkus.mailer.mock`, `seedgrid.ratelimit.{login,auth-refresh,billing-checkout,billing-portal,billing-webhook}.enabled=false`, `quarkus.index-dependency.seedgrid-filemanagement.*`, `quarkus.arc.exclude-types`, e valores de teste para `seedgrid.billing.catalog.product-id`, `checkout.*`, `portal.return-url`, `reconciliation.throttle-seconds=0` e `plan-term.additional-attributes.*` (2048/4/20) |
| `seedgrid-billing-core/integration-tests/.../TestData.java` | lê `seedgrid.security.default-company.cnpj` via `ConfigProvider` |
| `seedgrid-billing-stripe/deployment/src/test/resources/application.properties` | `seedgrid.billing.stripe.apiKey`/`webhookSecret` com valores dummy, `seedgrid.security.*`, Flyway |
| `seedgrid-billing-stripe/integration-tests/src/main/resources/application.properties` | vazio |

## 5. Aliases, obsoletas e renomeações

| Propriedade | Situação |
|---|---|
| `seedgrid.billing.stripe.product` usada pelo core | Alias de fato de `seedgrid.billing.catalog.product-id`. `PlanPublicationService` a chama de `legacyStripeProductId`. Precedência: `catalog.product-id` primeiro, depois `stripe.product`. |
| `seedgrid.billing.stripe.defaultSuccessUrl`/`defaultCancelUrl` | Fallback legado de `seedgrid.billing.checkout.success-url`/`cancel-url`. O README do Stripe recomenda as do core. |
| Nomes camelCase (`apiKey`, `webhookSecret`, `defaultSuccessUrl`) | Fogem do padrão kebab-case do restante. São os nomes reais, sem alias kebab. |

## 6. Configuração mínima (`application.properties`)

```properties
# Provider Stripe (segredos SOMENTE via ambiente)
seedgrid.billing.stripe.apiKey=${STRIPE_API_KEY}            # <SEGREDO:stripe-api-key>
seedgrid.billing.stripe.webhookSecret=${STRIPE_WEBHOOK_SECRET}  # <SEGREDO:stripe-webhook-secret>

# Produto base no provider (necessário para publicar terms)
seedgrid.billing.stripe.product=<id-do-produto>

# Retorno do checkout (o Stripe exige as duas)
seedgrid.billing.checkout.success-url=https://<seu-app>/assinatura?ok=1
seedgrid.billing.checkout.cancel-url=https://<seu-app>/assinatura

# Migrations: security e billing migram sozinhas (security antes); o host aponta o Flyway dele para a pasta dele
quarkus.flyway.locations=classpath:db/migration/app
quarkus.hibernate-orm.physical-naming-strategy=org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy
```

Mais as obrigatórias da security: [[SeedGrid/Extensions/security/Configuracao|Configuração do security]].

## 7. Configuração completa comentada

```properties
# ---------- Negócio ----------
# Fuso do dia civil (vigência de preço, virada de ciclo). Default America/Sao_Paulo.
seedgrid.billing.business-timezone=America/Sao_Paulo
# Moeda ISO 4217 em minúsculas. Default brl.
seedgrid.billing.currency=brl
# Prefixo do nome exibido do meter de excedente. Default Excedente.
seedgrid.billing.overage-meter-name=Excedente
# PU das tabelas do billing. Sem valor = PU default. subdomain-tenancy usa master.
#seedgrid.billing.persistence-unit=master

# ---------- API REST ----------
# false = endpoints de plano/assinatura/me respondem 404 e somem do OpenAPI (webhook continua). Default true.
seedgrid.billing.api.enabled=true

# ---------- Bloqueio geral (opcional) ----------
# Default false. true = conta sem assinatura vigente só alcança o caminho para pagar.
seedgrid.billing.access-gate.enabled=false
# Default true. PAST_DUE entra no bloqueio geral.
seedgrid.billing.access-gate.block-past-due=true
# Prefixos extras liberados (sem default).
#seedgrid.billing.access-gate.allowed-paths=/me/permissions,/me/profile

# ---------- Catálogo / checkout / portal ----------
# Produto do provider; sem valor usa seedgrid.billing.stripe.product.
#seedgrid.billing.catalog.product-id=<id-do-produto>
seedgrid.billing.checkout.success-url=https://<seu-app>/assinatura?ok=1
seedgrid.billing.checkout.cancel-url=https://<seu-app>/assinatura
seedgrid.billing.portal.return-url=https://<seu-app>/assinatura

# ---------- Trial ----------
# Default true.
seedgrid.billing.trial.enabled=true
# Default 00000000-0000-0000-0000-0000000000a2 (seed `R__billing_seed.sql`).
#seedgrid.billing.trial.plan-term-public-id=<public-id-do-term-trial>

# ---------- Feature gate ----------
# IDs de Company nunca bloqueados por @SgRequiresPlanFeature (sem default).
#seedgrid.billing.feature-gate.exempt-company-ids=<id-company-plataforma>

# ---------- Limites de additionalAttributes (HTTP 400 ao exceder) ----------
# Defaults 16384 / 5 / 100.
seedgrid.billing.plan-term.additional-attributes.max-size-bytes=16384
seedgrid.billing.plan-term.additional-attributes.max-depth=5
seedgrid.billing.plan-term.additional-attributes.max-keys=100

# ---------- Reconciliação ----------
# Segundos mínimos entre reconciliações implícitas da mesma conta. Default 60; 0 = sempre.
seedgrid.billing.reconciliation.throttle-seconds=60

# ---------- Stripe ----------
seedgrid.billing.stripe.apiKey=${STRIPE_API_KEY}                 # <SEGREDO:stripe-api-key>
seedgrid.billing.stripe.webhookSecret=${STRIPE_WEBHOOK_SECRET}   # <SEGREDO:stripe-webhook-secret>
seedgrid.billing.stripe.product=<id-do-produto>
seedgrid.billing.stripe.product-name=<Nome do Produto>
# Fallbacks (prefira as do core):
#seedgrid.billing.stripe.defaultSuccessUrl=https://<seu-app>/sucesso
#seedgrid.billing.stripe.defaultCancelUrl=https://<seu-app>/cancelado
# Só tem efeito com chave sk_test. Default true.
seedgrid.billing.stripe.test-clock-enabled=true

# ---------- Rate limit (extension resilience) ----------
#seedgrid.ratelimit.billing-webhook.permits=300
#seedgrid.ratelimit.billing-webhook.window=PT1M
#seedgrid.ratelimit.billing-checkout.enabled=true
```

## 8. Receitas

| Caso | Configuração |
|---|---|
| Bloquear tudo quando o trial acabar ou não houver pagamento | `seedgrid.billing.access-gate.enabled=true`. Para liberar telas extras, use `seedgrid.billing.access-gate.allowed-paths=/me/profile`. |
| Bloquear só funcionalidades anotadas (padrão) | Não configure nada. Use `@SgConsumesUsage`/`@SgRequiresPlanFeature`. |
| Empresa da plataforma nunca bloqueada por plano | `seedgrid.billing.feature-gate.exempt-company-ids=<id>` |
| Host com billing desligado (sem tabelas) | `seedgrid.billing.api.enabled=false`. No login-tenancy isso segue `seedgrid.login-tenancy.modules.billing.enabled`. |
| subdomain-tenancy | `seedgrid.billing.persistence-unit=master` (já definido pela extension de tenancy) |
| Desenvolvimento local com Stripe | `SEEDGRID_BILLING_STRIPE_APIKEY=<SEGREDO:stripe-test-key>`, `stripe listen --forward-to localhost:8080/public/billing/webhook` e `SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET=<SEGREDO:whsec-do-cli>` |
| Produção | Webhook em `https://<dominio>/public/billing/webhook` com no mínimo `checkout.session.completed` e `invoice.paid`, chave live e test clock irrelevante |
| Testes de integração sem esperar throttle | `seedgrid.billing.reconciliation.throttle-seconds=0` |

## 9. Dúvidas e lacunas
- `apiKey`/`webhookSecret` obrigatórias: dedução pela semântica do `@ConfigProperty` sem default, não testada aqui. O `@ApplicationScoped` é lazy, mas o Quarkus valida injection points de config no startup.
- Sem URL de sucesso ou cancelamento em lugar nenhum, o Stripe recebe `""`. O comportamento exato (erro do Stripe) não foi verificado.
- Nomes de env explícitos de `plan-term.additional-attributes.*` diferem da regra MP. Ambos devem funcionar, mas isso não foi testado.
