---
tags: [seedgrid, extension, billing, rust]
fonte: rust/seedgrid-rust-crate-billing
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# billing — porte Rust (`seedgrid-rust-crate-billing`)

Porte das extensões Quarkus `seedgrid-billing-core` + `seedgrid-billing-stripe`. Lado Java: [[SeedGrid/Extensions/billing/Visao-geral|Visão geral do billing (Java)]] · [[SeedGrid/Extensions/billing/Configuracao|Configuração do billing (Java)]]. Configuração Rust: [[SeedGrid/Extensions/billing/Configuracao-Rust|Configuração Rust do billing]].

Domínio de billing independente de provedor (planos, assinaturas, uso), SPI de provedor, `BillingEventHandler` do host, dispatcher de webhook idempotente, router Axum (checkout/portal/webhook) e backend Stripe (cliente `reqwest` + verificação de assinatura). **Confirmado** (`src/lib.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-billing` (lib `seedgrid_billing`) |
| Versão | workspace `2026.10.14` |
| Features | `postgres` (default; `sqlx`, repositório e migrations), `stripe` (default; `reqwest`, `hmac`, `sha2`, `hex`) |
| Dependência SeedGrid | `seedgrid-rust-crate-resilience` (rate limit) |
| Consumidores | login-tenancy, subdomain-tenancy (doc de `src/lib.rs`) |

## API pública principal
| Símbolo | Papel | Fonte |
|---|---|---|
| `BillingService::new(Arc<dyn BillingProvider>)` | fachada: `create_checkout`, `create_portal`, `process_webhook`, `change_subscription_plan`, `cancel_subscription(_immediately)`, `pause/resume/reactivate_subscription`, `list_invoices`, `get_upcoming_invoice`, `get_subscription`, `preview_plan_change`… | `src/service.rs` |
| traits `BillingProvider`, `BillingCatalogProvider`, `BillingUsageProvider` | SPI; capacidades detectadas por `as_catalog()`/`as_usage()` (equivalente ao `instanceof` do Java) | `src/spi.rs` |
| trait `BillingEventHandler` | lógica de domínio do host para eventos | `src/spi.rs` |
| `BillingEventDispatcher::new(service, repo, Option<handler>)` | idempotência por `(provider, event_id)` | `src/dispatcher.rs` |
| `BillingApiState::new` / `::builder(..).authorizer(..).build()` | estado do router; guard default `AllowAllBillingAuthorizer` | `src/state.rs` |
| `router(state)` | rotas abaixo | `src/routes.rs` |
| `checkout_rate_limit()`, `portal_rate_limit()`, `webhook_rate_limit()` | `SgRateLimit` (`billing-checkout` 30/min, `billing-portal` 30/min, `billing-webhook` 300/min) para o host acoplar o middleware do resilience | `src/routes.rs` |
| `stripe::StripeBillingProvider::new(StripeConfig)` | backend Stripe; Test Clock em chaves `sk_test` | `src/stripe/provider.rs` |
| `stripe::ensure_product_bootstrap` | garante o produto base no startup (opt-in por `product`) — o host precisa chamar | `src/stripe/bootstrap.rs` |
| `BillingPlatform::assemble(Option<&PgPool>, BillingOverrides)` | montagem "estilo CDI": exige Postgres **e** `api_key` Stripe; roda migrations | `src/platform.rs` (features `postgres`+`stripe`) |
| `migrate` / `MIGRATOR` | `0500_create_billing_events.sql`, `0501_add_permissions.sql`; histórico `_sqlx_migrations_billing` | `src/lib.rs` |
| `openapi()` | spec utoipa | `src/apidoc.rs` |

Permissões (constantes em `src/state.rs`): `BILLING_CHECKOUT_CREATE`, `BILLING_PORTAL_CREATE`, `BILLING_SUBSCRIPTION_READ`.

## Endpoints
| Método | Path | Permissão |
|---|---|---|
| POST | `/billing/checkout` | `BILLING_CHECKOUT_CREATE` |
| POST | `/billing/portal` | `BILLING_PORTAL_CREATE` |
| GET | `/billing/subscription` | `BILLING_SUBSCRIPTION_READ` — **só no Rust** (extensão deliberada) |
| POST | `/public/billing/webhook` | público (assinatura do Stripe) |

## Exemplo (doc de `src/lib.rs`)
```rust
use std::sync::Arc;
use seedgrid_billing::{
    migrate, BillingService, BillingEventDispatcher, BillingApiState, router,
    PgBillingEventRepository, config::StripeConfig, stripe::StripeBillingProvider,
};

migrate(&pool).await?;
let provider = Arc::new(StripeBillingProvider::new(StripeConfig::from_env()));
let service = BillingService::new(provider);
let repo = Arc::new(PgBillingEventRepository::new(pool));
let dispatcher = BillingEventDispatcher::new(service.clone(), repo, /* handler */ None);
let app = router(BillingApiState::new(service, dispatcher));
```
Alternativa: `BillingPlatform::assemble(Some(&pool), BillingOverrides { event_handler: Some(handler) })`. Não há app em `rust/examples/` para billing.

## Testes
- Unitários em `src/*` (inclui teste de alias `STRPE` em `config.rs` e `ensure_product` no provider).
- `tests/pg_billing_events_it.rs` (`#[ignore]`, `BILLING_IT_PG_URL`); `tests/stripe_transport_it.rs` (`BILLING_STRIPE_IT_BASE`, `BILLING_STRIPE_IT_KEY`).
- **Não executados.**

## Limitações

- A rota `GET /billing/subscription` existe só no Rust.
- O `seedgrid-billing-core` Java tem grupos de configuração (`seedgrid.billing.trial`, `.catalog`, `.checkout`, `.portal`, `.access-gate`, `.feature-gate`, `.reconciliation`, `.api`, `.plan-term.additional-attributes`, `business-timezone`, `currency`, `overage-meter-name`, `persistence-unit`) que **não têm contraparte** em `src/config.rs` do Rust (Confirmado).

## Enums
Equivalentes Java: [[SeedGrid/Extensions/billing/Enums|Enums do billing (Java)]].

| Enum | Arquivo | Java equivalente |
|---|---|---|
| `BillingEventType` | `src/domain.rs` | [[SeedGrid/Extensions/billing/Enums#BillingEventType\|BillingEventType]] |
| `RecurringInterval` | `src/dtos.rs` | [[SeedGrid/Extensions/billing/Enums#RecurringInterval\|RecurringInterval]] |
| `AggregationFormula` | `src/dtos.rs` | [[SeedGrid/Extensions/billing/Enums#AggregationFormula\|AggregationFormula]] |
| `TiersMode` | `src/dtos.rs` | [[SeedGrid/Extensions/billing/Enums#TiersMode\|TiersMode]] |
| `BillingError` | `src/error.rs` | exceções do billing |
| `HttpMethod` (`Get`, `Post`, `Delete`) | `src/stripe/transport.rs` | interno do transporte Stripe |

### BillingEventType
`#[serde(rename_all = "SCREAMING_SNAKE_CASE")]`; `name()` = nome Java; é o valor da coluna `billing_events.type VARCHAR(50)` (sem CHECK). Mapeamento do Stripe (`stripe/translate.rs` → `map_event_type`):

| Valor | Evento Stripe |
|---|---|
| `CheckoutCompleted` (`CHECKOUT_COMPLETED`) | `checkout.session.completed` |
| `PaymentConfirmed` (`PAYMENT_CONFIRMED`) | `invoice.paid` |
| `PaymentFailed` (`PAYMENT_FAILED`) | `invoice.payment_failed` |
| `SubscriptionCreated` (`SUBSCRIPTION_CREATED`) | `customer.subscription.created` |
| `SubscriptionUpdated` (`SUBSCRIPTION_UPDATED`) | `customer.subscription.updated` |
| `SubscriptionCanceled` (`SUBSCRIPTION_CANCELED`) | `customer.subscription.deleted` |
| `RefundCreated` (`REFUND_CREATED`) | `charge.refunded` |
| `DisputeOpened` (`DISPUTE_OPENED`) | `charge.dispute.created` |

Qualquer outro tipo de evento → `BillingError::UnsupportedEvent` (o webhook responde 204). Os 8 valores são **iguais** aos do Java.

### RecurringInterval / AggregationFormula / TiersMode
`#[serde(rename_all = "UPPERCASE")]`. `RecurringInterval` = `DAY`, `WEEK`, `MONTH`, `YEAR` (Stripe `day`/`week`/`month`/`year`; ausente → `MONTH`). `AggregationFormula` = `SUM`, `COUNT`, `LAST` (ausente → `SUM`; `LAST` é mapeado para `sum` no Stripe, lacuna herdada do Java). `TiersMode` = `GRADUATED`, `VOLUME`. Valores iguais ao Java.

### BillingError
`Unsupported`, `InvalidWebhook` (400 no webhook), `UnsupportedEvent` (204), `Provider` (500), `Forbidden` (403), `Config`, `Json`, `Database` (feature `postgres`), `Internal`.
