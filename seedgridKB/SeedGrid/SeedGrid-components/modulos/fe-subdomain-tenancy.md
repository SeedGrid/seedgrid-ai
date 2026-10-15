---
tags: [seedgrid, front, modulo, fe-subdomain-tenancy]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-subdomain-tenancy
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-subdomain-tenancy

Módulo front de **multitenancy por subdomínio**: cada tenant vive em `empresa.<sufixo>`, com signup público que cria tenant + usuário root e confirmação de e-mail por código. Variante exclusiva com [[SeedGrid/SeedGrid-components/modulos/fe-login-tenancy|fe-login-tenancy]] (`variantGroup: "tenancy"`). Compõe sobre o [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral|extension subdomain-tenancy]] — `SubdomainTenancyPaths` bate com `java/seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/configs/RestControllerPath.java` (`/public/tenants`, `/validate-email`, `/resend-email`) — **Confirmado**.

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-subdomain-tenancy` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *`, `react: ^18.2.0 \|\| ^19.0.0` (opcional) |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` |
| Test (script) | `pnpm run build && node --test tests/module-manifest.test.mjs tests/subdomain-rules.test.mjs` |

`exports`: `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}`; `./client` → `./dist/client/index.{d.ts,js}`.

Dependência de módulo: **requer `security`** (tipo `SecurityServer`; scaffold usa `resolveApiBaseUrlForHostname` de `@/config/environment` e `@/modules/core`).

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `BrazilianState` | type | `.` | UF (`string`) | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-subdomain-tenancy/src/tenant-signup.ts` |
| `TenantAddress`, `TenantLegalRepresentative`, `TenantSignupRequest`, `TenantValidateEmailRequest`, `TenantSignupResult` | interfaces | `.` | DTOs do signup (`TenantSignupResult` com shape flexível, não confirmado) | `.../src/tenant-signup.ts` |
| `SubdomainTenancyPaths` | const | `.` | `tenants`, `validateEmail`, `resendEmail(subdomain)` | `.../src/paths.ts → SubdomainTenancyPaths` |
| `RESERVED_SUBDOMAINS` | const | `.` | 35 nomes reservados (`admin`, `api`, `www`, …) | `.../src/subdomain-rules.ts → RESERVED_SUBDOMAINS` |
| `SubdomainValidationKey` | type | `.` | Chaves i18n `multitenancy.signup.fields.subdomain.validation.*` | `.../src/subdomain-rules.ts` |
| `normalizeSubdomain` | função | `.` | trim, minúsculas, não `[a-z0-9-]` → `-`, colapsa/remove hífens | `.../src/subdomain-rules.ts → normalizeSubdomain` |
| `isReservedSubdomain` | função | `.` | Testa contra `RESERVED_SUBDOMAINS` | idem |
| `getSubdomainValidationKey` | função | `.` | `required` / `too_short` (<3) / `too_long` (>32) / `invalid_pattern` / `reserved` / `null` | idem |
| `validateSubdomain` | função | `.` | Chave ou texto traduzido (`translate?`) | idem |
| `TenantProvider` | componente React | `./client` | Contexto com `currentTenant` (inicial `"default"`) e `setTenant` | `.../src/client/tenant-provider.tsx → TenantProvider` |
| `useTenantContext` | hook | `./client` | Lança erro fora do provider | idem |
| `createSubdomainTenancyServer` | função | `./server` | `(session) => SubdomainTenancyServer` | `.../src/server/create-subdomain-tenancy-server.ts` |
| `SubdomainTenancyServer` | interface | `./server` | `signupTenant`, `validateEmail`, `resendEmail` | idem |

Contagem: `.` = 13; `./client` = 2; `./server` = 2.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]): `id: "subdomain-tenancy"`, `configKey: "subdomain-tenancy"`, `requires: ["security"]`, `variantGroup: "tenancy"`, `provider: [{ import: "TenantProvider", from: "@seedgrid/fe-subdomain-tenancy/client" }]` (o CLI envolve o app com o provider). Sem `navigation`/`messages`.

## Páginas e rotas (scaffold)

| Rota | Arquivo | Acesso |
|---|---|---|
| `/signup` | `scaffold/src/app/(public)/signup/page.tsx` | público; wizard BR (CNPJ, ViaCEP, UF/cidade), subdomínio validado em tempo real; após validar o e-mail redireciona para `<protocolo>://<subdominio>.<tenantHostSuffix>/auth/login` |
| `GET /api/locations/states?query=` | `scaffold/src/app/api/locations/states/route.ts` | Route Handler; proxy para `https://cities.seedgrid.com.br/states?countryId=1` |
| `GET /api/locations/cities?stateId=&query=` | `scaffold/src/app/api/locations/cities/route.ts` | Route Handler; proxy para `https://cities.seedgrid.com.br/cities?stateId=` |

Server actions (scaffold, `"use server"`): `createPublicTenantAction`, `validatePublicTenantEmailAction`, `resendPublicTenantActivationEmailAction` (em `scaffold/src/modules/subdomain-tenancy/server/`), com `createApiClient` de `@seedgrid/fe-core`, `requireAuth: false`, retry 2× em 429/502/503/504. Nenhuma permissão envolvida.

## APIs backend chamadas

| Método | Path | Onde |
|---|---|---|
| POST | `/public/tenants` | `signupTenant` (lib) / `createPublicTenantAction` |
| POST | `/public/tenants/validate-email` | `validateEmail` / `validatePublicTenantEmailAction` |
| POST | `/public/tenants/resend-email?subdomain=` | `resendEmail` / `resendPublicTenantActivationEmailAction` |

3 endpoints do backend SeedGrid + 2 externos (`cities.seedgrid.com.br`).

## Separação client/server

`.` client-safe (regras puras, testáveis em Node); `./client` React; `./server` SERVER-ONLY. A URL base pública é resolvida por hostname (`x-forwarded-host` → `host`, sem porta) em `scaffold/src/modules/subdomain-tenancy/server/public-api-base-url.ts → resolvePublicApiBaseUrl`; lança erro se não houver host.

## Configuração

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_CITIES_API_USERNAME` | string (env) | usuário da API de cidades | — | Condicional (sem ela, UF/cidade ficam vazios) | Compõe Basic auth com a key; ausente → responde `[]` 200 | `GET /api/locations/states`, `/cities` | exige `SEEDGRID_CITIES_API_KEY` | runtime server | `scaffold/src/app/api/locations/states/route.ts → GET`; `.../cities/route.ts → GET` |
| 🔒 `SEEDGRID_CITIES_API_KEY` | string (env) | `<SEGREDO:cities-api-key>` | — | Condicional (idem) | Senha do Basic auth para `cities.seedgrid.com.br` | idem | exige `SEEDGRID_CITIES_API_USERNAME` | runtime server | idem |

Valores do app usados pelo scaffold (definidos fora deste pacote, em `@/config/environment`): `appEnvironment.hosts.tenantHostSuffix`, `appEnvironment.deployment.protocol`, `appEnvironment.namespace`, `resolveApiBaseUrlForHostname`. A URL `https://cities.seedgrid.com.br` é constante no código (`CITIES_API_BASE_URL`), não configurável.

## Exemplos

Fonte: README (validação e contexto). Uso real das regras: `scaffold/src/modules/subdomain-tenancy/server/create-public-tenant-action.ts` (normaliza e valida antes do POST).

```ts
import { normalizeSubdomain, validateSubdomain } from "@seedgrid/fe-subdomain-tenancy";
const sub = normalizeSubdomain(input);
const erro = validateSubdomain(sub); // null se ok
```

Sem consumidor em `apps/showcase`.

## Testes (não executados)

- `tests/module-manifest.test.mjs`: `id`, `requires`, `variantGroup`, `configKey`, `provider`.
- `tests/subdomain-rules.test.mjs`: normalização, reservados, chaves `required/too_short/too_long/reserved`, `validateSubdomain` com e sem tradutor (`invalid_pattern` declarado inalcançável hoje).

## Limitações

- `useTenantContext()` expõe `currentTenant` (string) e `setTenant`, não um objeto `tenant`.
- `TenantProvider` só guarda uma string em estado (`"default"`); não deriva o tenant do host.
- `createSubdomainTenancyServer` usa `apiFetchSecurity` (sessão), inadequado para o signup pré-auth; o scaffold usa actions próprias.
- Chaves i18n usam o prefixo `multitenancy.*`; o pacote não entrega mensagens (sem `messages` no manifesto).
- `TenantAddress.phone` é opcional aqui; no login-tenancy é obrigatório.

