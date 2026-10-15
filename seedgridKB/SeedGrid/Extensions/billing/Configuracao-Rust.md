---
tags: [seedgrid, extension, billing, rust, configuracao]
fonte: rust/seedgrid-rust-crate-billing
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
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

## Structs
| Campo | `Default` |
|---|---|
| `StripeConfig.api_key`, `webhook_secret`, `default_success_url`, `default_cancel_url` | `""` |
| `StripeConfig.test_clock_enabled` | `true` |
| `StripeConfig.product`, `product_name` | `None` |
| `StripeConfig.api_base` | `https://api.stripe.com` |

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
```

## Receitas
- **Habilitar com Stripe**: definir a API key e o webhook secret; `BillingPlatform::assemble(Some(&pool), BillingOverrides::default())`; montar `router(state)` e acoplar os rate limits.
- **Testes E2E com tempo avançado**: chave `sk_test_...` e `SEEDGRID_BILLING_STRIPE_TEST_CLOCK_ENABLED=true`.
- **Mock do Stripe**: `SEEDGRID_BILLING_STRIPE_API_BASE=http://localhost:<porta>`.

## Dúvidas e lacunas
- Grupos de config do billing-core Java atual (`trial`, `catalog`, `checkout`, `portal`, `access-gate`, `feature-gate`, `reconciliation`, `api`, `business-timezone`, `currency`, …) **não existem** no Rust.
