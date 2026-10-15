---
tags: [seedgrid, front, modulo, fe-billing-user]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-billing-user
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-billing-user

Módulo front de **billing do assinante**: assinatura corrente, uso do ciclo, checkout (1ª assinatura), troca de plano com prévia de rateio, cancelar/reativar, customer portal e faturas. A visão de backoffice é o [[SeedGrid/SeedGrid-components/modulos/fe-billing-platform|fe-billing-platform]]. Compõe sobre o [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/billing/Visao-geral|extension billing]]. Na extension billing, `MeBillingController`, `SubscriptionController`, `PlanCatalogController` e `UsageController` expõem os mesmos `/me/*`, **exceto** os de uso (ver Limitações).

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-billing-user` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` |
| `exports` | `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}` |

Dependência de módulo: **requer `security`**.

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `BillingUserPaths` | const | `.` | 13 paths `/me/*` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-billing-user/src/paths.ts → BillingUserPaths` |
| `SubscriptionCycle`, `SubscriptionPlanRef`, `SubscriptionPlanTerm`, `SubscriptionPendingChange`, `SubscriptionResponse` | interfaces | `.` | Assinatura corrente (`pendingChange`, `cancelAtPeriodEnd`…) | `.../src/billing.ts` |
| `UsageAlert`, `UsageSummaryResponse`, `UsageStatementEntry`, `UsageStatementResponse` | interfaces | `.` | Resumo e extrato de uso | `.../src/billing.ts` |
| `PlanCatalogItem`, `PlansPendingChange`, `PlansCatalogResponse` | interfaces | `.` | Catálogo assinável (`checkoutEnabled`, `current`, `pendingDowngrade`) | `.../src/billing.ts` |
| `CheckoutRequest`, `CheckoutSessionResponse` | interfaces | `.` | `{ planId }` → `checkoutUrl` | `.../src/billing.ts` |
| `PortalSessionResponse` | interface | `.` | `portalUrl` (request sem corpo) | `.../src/billing.ts` |
| `ChangePlanRequest`, `ChangePlanResponse` | interfaces | `.` | `PLAN_CHANGED` / `DOWNGRADE_SCHEDULED` | `.../src/billing.ts` |
| `CancelScheduledChangeResponse`, `CancelSubscriptionResponse`, `ReactivateSubscriptionResponse` | interfaces | `.` | Status literais | `.../src/billing.ts` |
| `ChangePreviewResponse` | interface | `.` | Prévia de rateio | `.../src/billing.ts` |
| `UpcomingInvoiceLine`, `UpcomingInvoiceResponse` | interfaces | `.` | Próxima fatura | `.../src/billing.ts` |
| `BillingInvoiceEnvelope` | interface | `.` | `{ invoices: Record<string, unknown>[] }` (item cru do provedor) | `.../src/billing.ts` |
| `billingUserMessages` | const | `.` | i18n `en`/`pt-BR` completos; `es`/`fr` = `en`; `pt-PT` = `pt-BR` | `.../src/messages.ts → billingUserMessages` |
| `createBillingUserServer` | função | `./server` | `(session) => BillingUserServer` | `.../src/server/create-billing-user-server.ts → createBillingUserServer` |
| `BillingUserServer` | interface | `./server` | 13 métodos | idem `→ BillingUserServer` |

Contagem: `.` = 26 (1 const de paths + 24 tipos + `billingUserMessages`); `./server` = 2.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]): `id: "billing-user"`, `configKey: "billing-user"`, `requires: ["security"]`, `navigation: useBillingUserAppShellSections` (`@/modules/billing-user`), `messages: billingUserMessages` (`@seedgrid/fe-billing-user`). Sem `variantGroup`/`provider` (o teste verifica).

Menu: seção `billing` (order 30) → `billing-user` → `billing-overview` (`/billing`), `billing-plans` (`/billing/plans`), `billing-invoices` (`/billing/invoices`); gated por `BILLING_READ`.

## Páginas (scaffold) e permissões

| Rota | Arquivo | Permissão |
|---|---|---|
| `/billing` | `scaffold/src/app/billing/page.tsx` | `BILLING_READ` |
| `/billing/plans` | `scaffold/src/app/billing/plans/page.tsx` | `BILLING_READ` |
| `/billing/invoices` | `scaffold/src/app/billing/invoices/page.tsx` | `BILLING_READ` |

Route Handlers em `scaffold/src/app/api/billing/`: `GET me` (combina assinatura + resumo de uso), `GET plans`, `POST checkout`, `POST portal`, `POST change-plan`, `GET change-preview?planId=`, `POST cancel`, `POST cancel-scheduled-change`, `POST reactivate`, `GET invoices?limit=`, `GET upcoming`. Bootstrap: `scaffold/src/modules/billing-user/server.ts.hbs → getBillingUserServer`.

## APIs backend chamadas (`createBillingUserServer`)

| Método | Path | Função |
|---|---|---|
| GET | `/me/subscription` | `getSubscription` |
| GET | `/me/plans` | `listPlans` |
| GET | `/me/usage/summary` | `getUsageSummary` |
| GET | `/me/usage/statement` | `getUsageStatement` (sem UI; requer `STATEMENT_READ` segundo comentário) |
| POST | `/me/billing/checkout` | `createCheckout` |
| POST | `/me/billing/portal` | `openPortal` |
| POST | `/me/billing/change-plan` | `changePlan` |
| POST | `/me/billing/cancel-scheduled-change` | `cancelScheduledChange` |
| POST | `/me/billing/cancel` | `cancelSubscription` |
| POST | `/me/billing/reactivate` | `reactivateSubscription` |
| GET | `/me/billing/invoices?limit=` | `listInvoices` |
| GET | `/me/billing/upcoming` | `getUpcomingInvoice` |
| GET | `/me/billing/change-preview?planId=` | `getChangePreview` |

13 endpoints. Na extension, esses controllers são `@Authenticated` (sem `@PermissionsAllowed`) — **Confirmado**.

## Separação client/server

Lib `.` client-safe; `./server` SERVER-ONLY. Telas client chamam apenas `/api/billing/*`.

## Configuração

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_access_token` | Não | Cookie do access token da sessão; vazio cai no padrão | `getBillingUserServer → createSecurityServer` | igual ao fe-security | runtime server | `scaffold/src/modules/billing-user/server.ts.hbs → ACCESS_COOKIE_NAME` |
| `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_refresh_token` | Não | Cookie do refresh token | idem | idem | runtime server | `... → REFRESH_COOKIE_NAME` |
| `billingUserConfig.routes.overview` / `.plans` / `.invoices` | string | rotas | `/billing`, `/billing/plans`, `/billing/invoices` | Não | Rotas do menu | `useBillingUserAppShellSections` | — | runtime client | `scaffold/src/modules/billing-user/config.ts → billingUserConfig` |

URLs de sucesso/cancelamento do checkout e retorno do portal são resolvidas **no backend** (`seedgrid.report.billing.checkout.{success,cancel}-url`, `seedgrid.report.billing.portal.return-url`, segundo comentários de `src/billing.ts`) — **Não confirmado** na extension.

## Exemplo (fonte: README)

```ts
import { createBillingUserServer } from "@seedgrid/fe-billing-user/server";
const billing = createBillingUserServer(session);
const assinatura = await billing.getSubscription();
const preview = await billing.getChangePreview("plan-pro");
await billing.changePlan({ planId: "plan-pro" });
```

Sem consumidor em `apps/showcase`.

## Testes (não executados)

`tests/module-manifest.test.mjs` — `id`, `requires`, `configKey`, `variantGroup`/`provider` ausentes, `navigation`, `messages`.

## Limitações

- A extension billing expõe apenas `GET /me/usage`; `getUsageSummary` e `getUsageStatement` (`/me/usage/summary`, `/me/usage/statement`) retornariam 404 contra ela.
- A extension tem endpoints sem contrato no front: `GET /me/billing/checkout/preview`, `GET|POST /me/billing/downgrade-user-selection`, `POST /me/billing/trial-ended`.
- O item de fatura é cru do provedor; a tela lê campos estilo Stripe defensivamente.
- `getUsageStatement` não tem tela; traduções `es`/`fr`/`pt-PT` em fallback.

