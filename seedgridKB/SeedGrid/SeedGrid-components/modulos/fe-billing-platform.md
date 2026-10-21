---
tags: [seedgrid, front, modulo, fe-billing-platform]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-billing-platform
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-billing-platform

Módulo front de **billing da plataforma** (backoffice de planos): CRUD de planos, faixas de preço (*terms*) com publicação/arquivamento e configuração do trial. É a visão de quem opera a plataforma; a visão do assinante é o [[SeedGrid/SeedGrid-components/modulos/fe-billing-user|fe-billing-user]]. Compõe sobre o motor de sessão do [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/billing/Visao-geral|extension billing]]. O README cita o `AdminPlanResource` do `seedgrid-report-api`; no monorepo, os mesmos paths `/admin/plans/**` estão em `java/seedgrid-quarkus-ext-billing/seedgrid-billing-core/runtime/src/main/java/br/com/seedgrid/billing/controllers/AdminPlanController.java` (`@SgMonoCompany`) (verbo e permissões em Limitações).

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-billing-platform` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` → `dist/module.json` |
| `exports` | `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}` |

Dependência de módulo: **requer `security`** (usa `SecurityServer`, `PaginatedResult`; scaffold usa `toRouteResponse` de `@seedgrid/fe-security/server`).

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `BillingPlatformPaths` | const | `.` | `plans`, `trial`, `planById`, `terms`, `termById`, `archiveTerm`, `publishTerm` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-billing-platform/src/paths.ts → BillingPlatformPaths` |
| `PlanCurrentTerm` | interface | `.` | Term vigente embutido no plano | `.../src/billing-platform.ts → PlanCurrentTerm` |
| `PlanEntry` | type | `.` | Plano (limiares de cota, `currentTerm`) | `.../src/billing-platform.ts → PlanEntry` |
| `PlanTermStatus` | type | `.` | `"SCHEDULED" \| "CURRENT" \| "ENDED"` | `.../src/billing-platform.ts → PlanTermStatus` |
| `PlanTermEntry` | type | `.` | Faixa de preço | `.../src/billing-platform.ts → PlanTermEntry` |
| `TrialConfig` | interface | `.` | `{ planPublicId; termPublicId; monthlyRequests }` | `.../src/billing-platform.ts → TrialConfig` |
| `CreatePlanRequest` | interface | `.` | POST/PUT de plano (`name` obrigatório) | `.../src/billing-platform.ts → CreatePlanRequest` |
| `CreatePlanTermRequest` | interface | `.` | Criação de term (`monthlyPrice`, `overagePrice` obrigatórios) | `.../src/billing-platform.ts → CreatePlanTermRequest` |
| `CreatePlanTermResponse` | interface | `.` | Term + `published`/`publishError` (publicação automática no provedor) | `.../src/billing-platform.ts → CreatePlanTermResponse` |
| `PatchPlanTermRequest` | interface | `.` | Edição parcial de term agendado | `.../src/billing-platform.ts → PatchPlanTermRequest` |
| `PatchTrialRequest` | interface | `.` | `{ monthlyRequests? }` | `.../src/billing-platform.ts → PatchTrialRequest` |
| `billingPlatformMessages` | const | `.` | i18n `en`, `pt-BR` completos; `es`/`fr` = `en`; `pt-PT` = `pt-BR` | `.../src/messages.ts → billingPlatformMessages` |
| `createBillingPlatformServer` | função | `./server` | `(session) => BillingPlatformServer` | `.../src/server/create-billing-platform-server.ts → createBillingPlatformServer` |
| `BillingPlatformServer` | interface | `./server` | 13 métodos (planos, terms, trial) | idem `→ BillingPlatformServer` |

Contagem: `.` = 12; `./server` = 2.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]), `src/module.ts`:

| Campo | Valor |
|---|---|
| `id` / `configKey` | `billing-platform` |
| `requires` | `["security"]` |
| `navigation` | `useBillingPlatformAppShellSections` de `@/modules/billing-platform` |
| `messages` | `billingPlatformMessages` de `@seedgrid/fe-billing-platform` |

Menu: seção `platform` (order 40) → `platform-billing` → `platform-plans` (`/platform/plans`, badge "readonly" se só leitura) e `platform-trial` (`/platform/plans/trial`); só aparece com `useCrudPermission("PLAN").canRead`.

## Páginas (scaffold) e permissões

| Rota | Arquivo | Permissão |
|---|---|---|
| `/platform/plans` | `scaffold/src/app/platform/plans/(list)/page.tsx` | `PLAN_READ` (ações via `useCrudPermission("PLAN")`) |
| `/platform/plans/new` | `.../(create)/new/page.tsx` → `PlanEditor` | `PLAN_CREATE` |
| `/platform/plans/[publicId]` | `.../(edit)/[publicId]/page.tsx` → `PlanEditor` + `TermsSection` | `PLAN_READ` |
| `/platform/plans/trial` | `.../trial/page.tsx` | `PLAN_READ` |

Route Handlers (proxies finos com `toRouteResponse`) em `scaffold/src/app/api/platform/plans/**`: `GET/POST /api/platform/plans`, `GET/POST /api/platform/plans/trial`, `GET/PUT/DELETE /api/platform/plans/[publicId]`, `GET/POST .../[publicId]/terms`, `PATCH/DELETE .../terms/[termId]`, `POST .../terms/[termId]/publish`, `POST .../terms/[termId]/archive`. Bootstrap: `scaffold/src/modules/billing-platform/server.ts.hbs → getBillingPlatformServer`.

## APIs backend chamadas (`createBillingPlatformServer`)

| Método | Path | Função |
|---|---|---|
| GET | `/admin/plans` | `listPlans` |
| POST | `/admin/plans` | `createPlan` |
| GET | `/admin/plans/{id}` | `getPlan` |
| PUT | `/admin/plans/{id}` | `updatePlan` |
| DELETE | `/admin/plans/{id}` | `deletePlan` |
| GET | `/admin/plans/{id}/terms` | `listTerms` |
| POST | `/admin/plans/{id}/terms` | `createTerm` |
| PATCH | `/admin/plans/{id}/terms/{termId}` | `updateTerm` (sem UI) |
| DELETE | `/admin/plans/{id}/terms/{termId}` | `deleteTerm` |
| POST | `/admin/plans/{id}/terms/{termId}/archive` | `archiveTerm` |
| POST | `/admin/plans/{id}/terms/{termId}/publish` | `publishTerm` |
| GET | `/admin/plans/trial` | `getTrial` |
| POST | `/admin/plans/trial` | `updateTrial` |

13 chamadas (método+path).

## Separação client/server

Lib `.` client-safe; `./server` SERVER-ONLY. As telas (client) só chamam `/api/platform/plans/**` via `fetch`; os Route Handlers chamam o engine no servidor com o cookie de sessão.

## Configuração

Variáveis de ambiente lidas no scaffold (`server.ts.hbs`) e objeto `billingPlatformConfig`:

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_access_token` (slug substituído pelo CLI) | Não | Nome do cookie do access token usado pela sessão; `trim()`, vazio cai no padrão | `getBillingPlatformServer → createSecurityServer({ cookies.token })` | deve coincidir com o do fe-security (mesma sessão) | runtime server | `scaffold/src/modules/billing-platform/server.ts.hbs → ACCESS_COOKIE_NAME` |
| `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_refresh_token` | Não | Nome do cookie do refresh token | idem `cookies.refresh` | idem | runtime server | `... → REFRESH_COOKIE_NAME` |
| `billingPlatformConfig.pagination.defaultPageSize` | number | inteiro | `10` | Não | Página inicial | telas | — | runtime client | `scaffold/src/modules/billing-platform/config.ts → billingPlatformConfig` |
| `billingPlatformConfig.pagination.pageSizeOptions` | number[] | inteiros | `[10, 20, 50]` | Não | Opções do paginador | telas | — | runtime client | idem |
| `billingPlatformConfig.routes.*` | string / função | rotas | `plans=/platform/plans`, `newPlan=/platform/plans/new`, `trial=/platform/plans/trial`, `plan(id)=/platform/plans/{id}` | Não | Rotas das telas e do menu | menu e navegação | — | runtime client | idem |

O cookie `passwordChangeRequired` é fixo (`sg_{{project_slug}}_password_change_required`, sem env). A base da API vem de `resolvePublicApiBaseUrl` (`@/modules/security/server/public-api-base-url`, scaffold do [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]).

## Exemplo (fonte: README)

```ts
import { createSecurityServer } from "@seedgrid/fe-security/server";
import { createBillingPlatformServer } from "@seedgrid/fe-billing-platform/server";
const billingPlatform = createBillingPlatformServer(createSecurityServer({ /* ... */ }));
const planos = await billingPlatform.listPlans();
await billingPlatform.publishTerm(planId, termId);
```

Exemplo real de composição: `scaffold/src/modules/billing-platform/server.ts.hbs`. Sem consumidor em `apps/showcase`.

## Testes (não executados)

`tests/module-manifest.test.mjs` — `id`, `requires`, `configKey`.

## Limitações

- `updateTrial` usa `POST /admin/plans/trial`; na extension billing o path é declarado como `@PATCH`.
- O backend da extension exige `PLAN_TERM_READ/CREATE/UPDATE/DELETE/PUBLISH/ARCHIVE` para terms e trial; o front só verifica `PLAN_*`.
- Sem UI para editar term agendado (PATCH).
- Moeda fixa BRL; traduções `es`/`fr`/`pt-PT` são fallback.

