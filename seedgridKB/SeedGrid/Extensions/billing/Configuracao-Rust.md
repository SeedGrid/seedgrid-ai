---
tags: [seedgrid, extension, billing, rust, configuracao]
fonte: rust/seedgrid-rust-crate-billing
branch: main
commit: 7b5b6e1
analisado-em: 2026-11-11
---

# billing — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/billing/Rust|Porte Rust do billing]] · Java: [[SeedGrid/Extensions/billing/Configuracao|Configuração do billing (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `StripeConfig` (prefixo Java `seedgrid.billing.stripe`) — `rust/seedgrid-rust-crate-billing/src/config.rs` |
| Mecanismo | `StripeConfig::from_env()` (`std::env::var`), ou struct montada pelo host |
| Quem chama | `BillingPlatform::assemble` chama `StripeConfig::from_env()` |
| Leitura | no boot (uma vez) |

Helpers: `opt(name)` faz `trim` e trata vazio como ausente; `opt_any(names)` devolve o primeiro não vazio (primário antes do alias). `from_env` nunca falha: `api_key`/`webhook_secret` ausentes viram `""`.

## Stripe
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `SEEDGRID_BILLING_STRIPE_APIKEY` / alias `SEEDGRID_BILLING_STRIPE_API_KEY` (Java `seedgrid.billing.stripe.apiKey`) | String | chave secreta Stripe | `""` | Sim para habilitar via `BillingPlatform` (vazio → `Ok(None)`, billing desligado) | `Authorization: Bearer`; prefixo `sk_test` habilita Test Clock | `stripe/provider.rs` (transporte, Test Clock), `platform.rs` | `test_clock_enabled` | `StripeConfig::from_env()` | `config.rs`; `platform.rs` → `assemble` |
| 🔒 `SEEDGRID_BILLING_STRIPE_WEBHOOK_SECRET` (Java `webhookSecret`) | String | segredo `whsec_...` | `""` | Sim (na prática): sem ele a verificação de assinatura falha | verifica assinatura do webhook | `stripe/provider.rs` → `signature::construct_event` | — | `from_env()` | `config.rs`, `stripe/signature.rs` |
| `SEEDGRID_BILLING_STRIPE_DEFAULT_SUCCESS_URL` / alias `SEEDGRID_BILLING_STRPE_DEFAULT_SUCCESS_URL` (Java `defaultSuccessUrl`) | String | URL | `""` | Não | usada no checkout quando o request não traz URL | `stripe/provider.rs` | grafia correta tem precedência (teste `default_success_url_accepts_strpe_typo_alias_with_stripe_precedence`) | `from_env()` | `config.rs` |
| `SEEDGRID_BILLING_STRIPE_DEFAULT_CANCEL_URL` (Java `defaultCancelUrl`) | String | URL | `""` | Não | idem para cancelamento | `stripe/provider.rs` | — | `from_env()` | `config.rs` |
| `SEEDGRID_BILLING_STRIPE_TEST_CLOCK_ENABLED` (Java `test-clock-enabled`) | bool | `true`/`false` (parse `bool`, após `trim`) | `true` | Não | com chave `sk_test`, cria a assinatura sob um Test Clock | `stripe/provider.rs` | `api_key` | `from_env()` | `config.rs`, `provider.rs` |
| `SEEDGRID_BILLING_STRIPE_PRODUCT` (Java `seedgrid.billing.stripe.product`) | `Option<String>` | id de produto | — | Não | `ensure_product_bootstrap` garante o produto se definido | `stripe/bootstrap.rs` (host precisa chamar) | `product_name` | `from_env()` | `config.rs`, `bootstrap.rs` |
| `SEEDGRID_BILLING_STRIPE_PRODUCT_NAME` (Java `product-name`) | `Option<String>` | texto | — | Não | nome do produto no bootstrap | `stripe/bootstrap.rs` | `product` | `from_env()` | idem |
| `SEEDGRID_BILLING_STRIPE_API_BASE` | String | URL | `https://api.stripe.com` (`DEFAULT_STRIPE_API_BASE`) | Não | base da API (útil em testes/mocks) | `stripe/provider.rs` | sem equivalente Java | `from_env()` | `config.rs` |

Mapeamento Java ↔ env: os nomes Java vêm de `@ConfigProperty` em `java/seedgrid-quarkus-ext-billing/seedgrid-billing-stripe/runtime/.../StripeBillingProvider.java` e `StripeProductBootstrap.java` (**Confirmado**). Os nomes de env do Rust **não** seguem exatamente a regra MicroProfile para chaves camelCase (ex.: `apiKey` → `SEEDGRID_BILLING_STRIPE_APIKEY`), são convenção do projeto (doc de `config.rs`).

## Núcleo da conta (`settings.rs`)

Estas structs são lidas por `BillingPlatform::assemble_accounts` (`src/accounts_platform.rs`): `AccountOverrides.core/trial/past_due/access_gate/quota` (todos `Option`) têm precedência; se `None`, vale `X::from_env()`. Parsing de `bool` (`env_bool`): só o texto `true` (sem diferenciar maiúsculas) é verdadeiro, e a variável vazia conta como ausente (usa o padrão). Números inválidos caem no padrão sem erro. Os limites de `plan-term.additional-attributes` (`PlanTermAttributesConfig`: `max_size_bytes` 16384, `max_depth` 5, `max_keys` 100) **não têm variável de ambiente**: vêm de `AccountOverrides.plan_term_attributes` ou do `Default`.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_BILLING_TRIAL_ENABLED` → `TrialConfig.enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `true` | Não | conta nova ganha assinatura no plano TRIAL (semeado no seed) | `TrialService` via `assemble_accounts` | `TRIAL_PLAN_TERM_PUBLIC_ID`; Java: `seedgrid.billing.trial.enabled` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_TRIAL_PLAN_TERM_PUBLIC_ID` → `TrialConfig.plan_term_public_id` | String | public id do term | `00000000-0000-0000-0000-0000000000a2` (id fixo do `R__billing_seed.sql`) | Não | term do trial | `TrialService` | `TRIAL_ENABLED`; Java: `seedgrid.billing.trial.*` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_PAST_DUE_ENABLED` → `PastDueConfig.enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `false` | Não | liga o ciclo de inadimplência e o agendador; ligado, **substitui** o bloqueio geral `access-gate.block-past-due` | `PastDueScheduler` (`accounts_platform.rs`), gate de acesso | `ACCESS_GATE_BLOCK_PAST_DUE`; Java: `seedgrid.billing.past-due.enabled` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_PAST_DUE_READ_ONLY_AFTER_DAYS` → `read_only_after_days` | `i32` | inteiro; inválido cai no padrão; `0` = não aplica o passo | `7` | Não | dias de inadimplência até as empresas virarem somente leitura (o valor efetivo mora no `PlanTerm`; a propriedade é o padrão quando o term é nulo) | ciclo de inadimplência | `PAST_DUE_DISABLE_AFTER_DAYS`; Java: `seedgrid.billing.past-due.read-only-after-days` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_PAST_DUE_DISABLE_AFTER_DAYS` → `disable_after_days` | `i32` | inteiro; inválido cai no padrão; `0` = não aplica o passo | `30` | Não | dias de inadimplência até as empresas serem desligadas | ciclo de inadimplência | `PAST_DUE_READ_ONLY_AFTER_DAYS`; Java: `seedgrid.billing.past-due.disable-after-days` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_PAST_DUE_INTERVAL` → `interval` | String | `1h`, `30m`, `1s`, `2d`, `500ms` ou ISO-8601 `PT1H`/`PT30M`/`PT1S` (`parse_interval`) | `1h` (valor inválido também cai em 1 h) | Não | intervalo do agendador de inadimplência | `PastDueScheduler` via `interval_duration()` | `PAST_DUE_ENABLED`; Java: `seedgrid.billing.past-due.interval` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_ACCESS_GATE_ENABLED` → `AccessGateConfig.enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `false` | Não | liga o bloqueio GERAL de acesso por situação da conta | `gate_config` em `assemble_accounts` (`access_gate.rs`) | `ACCESS_GATE_BLOCK_PAST_DUE`, `ACCESS_GATE_ALLOWED_PATHS`; Java: `seedgrid.billing.access-gate.enabled` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_ACCESS_GATE_BLOCK_PAST_DUE` → `block_past_due` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` (atenção: o padrão é `true`, mas um valor presente e diferente de `true` desliga) | `true` | Não | pagamento pendente também bloqueia (402 `PAYMENT_PAST_DUE`) | `access_gate.rs` | `PAST_DUE_ENABLED` (ligado, substitui este bloqueio); Java: `seedgrid.billing.access-gate.block-past-due` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_ACCESS_GATE_ALLOWED_PATHS` → `allowed_paths` | `Vec<String>` | CSV de prefixos de rota (`trim`, vazios descartados) | vazio | Não | prefixos sempre liberados, além dos padrão (`ACCESS_GATE_ALWAYS_ALLOWED`) | `access_gate.rs` | `ACCESS_GATE_ENABLED`; Java: `seedgrid.billing.access-gate.allowed-paths` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_QUOTA_USERS_ENABLED` → `QuotaConfig.users_enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `false` | Não | escolhe, ao montar o estado, o validador de cota de usuários do billing (sem ele valem as implementações padrão da security, sem limite) | `account/quota.rs` (`user_quota_validator`) | Java: `seedgrid.billing.quota.users.enabled` (`@IfBuildProperty` no Java; aqui é decidido ao montar o estado) | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_QUOTA_COMPANIES_ENABLED` → `QuotaConfig.companies_enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `false` | Não | idem para empresas | `account/quota.rs` (`company_quota_validator`) | Java: `seedgrid.billing.quota.companies.enabled` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_API_ENABLED` → `BillingApiConfig.enabled` | bool | `true` (sem diferenciar maiúsculas); qualquer outro valor vira `false` | `true` | Não | `false` faz `deny_if_disabled` devolver 404 `problem+json` nos prefixos de `API_PREFIXES` e `filter_openapi` remover esses paths do OpenAPI | `api_toggle.rs` (`deny_if_disabled`), `apidoc.rs` (`openapi_for`, `filter_openapi`); o crate não chama `BillingApiConfig::from_env()` sozinho: o host fornece a config por requisição (`SharedApiConfig`) | Java: `seedgrid.billing.api.enabled` | `from_env()` | `src/api_toggle.rs` |
| `SEEDGRID_BILLING_BUSINESS_TIMEZONE` → `CoreConfig.business_timezone` | String | id de fuso IANA | `America/Sao_Paulo` | Não | fuso em que o negócio conta os dias | `BusinessTimeZone::new` em `assemble_accounts` | Java: `seedgrid.billing.business-timezone` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_CURRENCY` → `currency` | String | ISO 4217, minúsculas | `brl` | Não | moeda dos preços publicados | `assemble_accounts` (publicação de preços) | Java: `seedgrid.billing.currency` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_OVERAGE_METER_NAME` → `overage_meter_name` | String | texto | `Excedente` | Não | nome EXIBIDO do meter de excedente (`<nome> - <rótulo>`) | `account/publication.rs` | Java: `seedgrid.billing.overage-meter-name` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_CATALOG_PRODUCT_ID` → `catalog_product_id` | `Option<String>` | id de produto do provider | — (ausente) | Condicional: sem ele e sem `SEEDGRID_BILLING_STRIPE_PRODUCT`, publicar preços falha (`provider_product_not_configured`) | produto do provider sob o qual os preços são criados; tem precedência sobre `SEEDGRID_BILLING_STRIPE_PRODUCT` (`CoreConfig::product_id`: aparado, vazio descartado) | `account/publication.rs` | `SEEDGRID_BILLING_STRIPE_PRODUCT` (`legacy_stripe_product_id`); Java: `seedgrid.billing.catalog.product-id` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_CHECKOUT_SUCCESS_URL` → `checkout_success_url` | `Option<String>` | URL | — (ausente) | Não | URL de sucesso enviada ao provider no checkout | `account/checkout.rs` | `CHECKOUT_CANCEL_URL`; Java: `seedgrid.billing.checkout.success-url` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_CHECKOUT_CANCEL_URL` → `checkout_cancel_url` | `Option<String>` | URL | — (ausente) | Não | URL de cancelamento do checkout | `account/checkout.rs` | `CHECKOUT_SUCCESS_URL`; Java: `seedgrid.billing.checkout.cancel-url` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_CHECKOUT_SELECTION_TTL` → `checkout_selection_ttl` | `Duration` | mesmo formato de `PAST_DUE_INTERVAL` (`parse_interval`); inválido cai no padrão | `48h` | Não | validade da seleção de checkout (`CheckoutSelectionService`) | `accounts_platform.rs` | Java: `seedgrid.billing.checkout.selection-ttl` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_PORTAL_RETURN_URL` → `portal_return_url` | `Option<String>` | URL | — (ausente) | Não | URL de retorno do portal do provider | `account/change.rs` | Java: `seedgrid.billing.portal.return-url` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_RECONCILIATION_THROTTLE_SECONDS` → `reconciliation_throttle_seconds` | `i64` | inteiro; inválido cai no padrão | `60` | Não | intervalo mínimo entre reconciliações | `accounts_platform.rs` | Java: `seedgrid.billing.reconciliation.throttle-seconds` | `from_env()` | `src/settings.rs` |
| `SEEDGRID_BILLING_FEATURE_GATE_EXEMPT_COMPANY_IDS` → `feature_gate_exempt_company_ids` | `Vec<i64>` | CSV de ids numéricos de empresa (itens não numéricos são descartados) | vazio | Não | empresas isentas do gate de funcionalidades do plano | `account/catalog.rs` (`exempt_company_ids`) | Java: `seedgrid.billing.feature-gate.exempt-company-ids` | `from_env()` | `src/settings.rs` |

## Structs
| Campo | `Default` |
|---|---|
| `StripeConfig.api_key`, `webhook_secret`, `default_success_url`, `default_cancel_url` | `""` |
| `StripeConfig.test_clock_enabled` | `true` |
| `StripeConfig.product`, `product_name` | `None` |
| `StripeConfig.api_base` | `https://api.stripe.com` |
| `TrialConfig` / `PastDueConfig` / `AccessGateConfig` / `QuotaConfig` / `BillingApiConfig` / `CoreConfig` | padrões da seção "Núcleo da conta" |

## Features Cargo
| Feature | Padrão | Efeito |
|---|---|---|
| `postgres` | sim | `PgBillingEventRepository`, `migrate`, `MIGRATOR` |
| `stripe` | sim | módulo `stripe` (provider, assinatura, bootstrap) |
| `postgres` + `stripe` | — | habilitam `BillingPlatform`/`BillingOverrides` |

## Configuração não-env
- `BillingApiStateBuilder::authorizer(...)` (default `AllowAllBillingAuthorizer`).
- Rate limits fixos em código (`checkout_rate_limit`, `portal_rate_limit`, `webhook_rate_limit`); ver [[SeedGrid/Extensions/resilience/Configuracao-Rust|Configuração Rust do resilience]].

## Somente testes
| Variável | Onde |
|---|---|
| `BILLING_IT_PG_URL` | `tests/pg_billing_events_it.rs` |
| `BILLING_STRIPE_IT_BASE`, 🔒 `BILLING_STRIPE_IT_KEY` | `tests/stripe_transport_it.rs` |

## Configuração mínima
```dotenv
SEEDGRID_BILLING_STRIPE_APIKEY=<SEGREDO:stripe-api-key>
SEEDGRID_BILLING_STRIPE_WEBHOOK_SECRET=<SEGREDO:stripe-webhook-secret>
```

## Configuração completa comentada
```dotenv
SEEDGRID_BILLING_STRIPE_APIKEY=<SEGREDO:stripe-api-key>          # alias: SEEDGRID_BILLING_STRIPE_API_KEY
SEEDGRID_BILLING_STRIPE_WEBHOOK_SECRET=<SEGREDO:stripe-webhook-secret>
SEEDGRID_BILLING_STRIPE_DEFAULT_SUCCESS_URL=https://<app>/assinatura?ok=1   # alias legado: ..._STRPE_...
SEEDGRID_BILLING_STRIPE_DEFAULT_CANCEL_URL=https://<app>/assinatura?cancel=1
SEEDGRID_BILLING_STRIPE_TEST_CLOCK_ENABLED=true   # só tem efeito com chave sk_test
SEEDGRID_BILLING_STRIPE_PRODUCT=<id-produto>      # bootstrap (host chama ensure_product_bootstrap)
SEEDGRID_BILLING_STRIPE_PRODUCT_NAME=<nome>
# SEEDGRID_BILLING_STRIPE_API_BASE=https://api.stripe.com
# --- Núcleo da conta (opcionais; valores abaixo = padrões) ---
SEEDGRID_BILLING_TRIAL_ENABLED=true
SEEDGRID_BILLING_PAST_DUE_ENABLED=false
SEEDGRID_BILLING_PAST_DUE_READ_ONLY_AFTER_DAYS=7
SEEDGRID_BILLING_PAST_DUE_DISABLE_AFTER_DAYS=30
SEEDGRID_BILLING_PAST_DUE_INTERVAL=1h
SEEDGRID_BILLING_ACCESS_GATE_ENABLED=false
SEEDGRID_BILLING_ACCESS_GATE_BLOCK_PAST_DUE=true
# SEEDGRID_BILLING_ACCESS_GATE_ALLOWED_PATHS=/public,/health
SEEDGRID_BILLING_QUOTA_USERS_ENABLED=false
SEEDGRID_BILLING_QUOTA_COMPANIES_ENABLED=false
SEEDGRID_BILLING_API_ENABLED=true
SEEDGRID_BILLING_BUSINESS_TIMEZONE=America/Sao_Paulo
SEEDGRID_BILLING_CURRENCY=brl
SEEDGRID_BILLING_OVERAGE_METER_NAME=Excedente
# SEEDGRID_BILLING_CATALOG_PRODUCT_ID=<id-produto>
# SEEDGRID_BILLING_CHECKOUT_SUCCESS_URL=https://<app>/assinatura?ok=1
# SEEDGRID_BILLING_CHECKOUT_CANCEL_URL=https://<app>/assinatura?cancel=1
SEEDGRID_BILLING_CHECKOUT_SELECTION_TTL=48h
# SEEDGRID_BILLING_PORTAL_RETURN_URL=https://<app>/assinatura
SEEDGRID_BILLING_RECONCILIATION_THROTTLE_SECONDS=60
# SEEDGRID_BILLING_FEATURE_GATE_EXEMPT_COMPANY_IDS=1,2
```

## Receitas
- **Habilitar com Stripe**: definir a API key e o webhook secret; `BillingPlatform::assemble(Some(&pool), BillingOverrides::default())`; montar `router(state)` e acoplar os rate limits.
- **Testes E2E com tempo avançado**: chave `sk_test_...` e `SEEDGRID_BILLING_STRIPE_TEST_CLOCK_ENABLED=true`.
- **Mock do Stripe**: `SEEDGRID_BILLING_STRIPE_API_BASE=http://localhost:<porta>`.

## Dúvidas e lacunas
- O núcleo Java (`trial`, `catalog`, `checkout`, `portal`, `access-gate`, `feature-gate`, `reconciliation`, `api`, `business-timezone`, `currency`, `overage-meter-name`, `past-due`, `quota`) **tem contraparte** em `src/settings.rs` e `src/api_toggle.rs` (seção "Núcleo da conta"; Confirmado). Sem contraparte lida do ambiente: `persistence-unit` (nenhuma ocorrência em `src/`) e `plan-term.additional-attributes` (só struct/`Default`, sem env).
