---
tags: [seedgrid, front, modulo, fe-login-tenancy]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-login-tenancy
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-login-tenancy

Módulo front de **multiempresa por login**: URL única, o usuário escolhe a empresa após o login e o backend re-emite o par de tokens escopado; inclui o signup institucional de empresa (CNPJ) com fluxo de **vinculação** quando o e-mail já existe. Variante exclusiva com [[SeedGrid/SeedGrid-components/modulos/fe-subdomain-tenancy|fe-subdomain-tenancy]] (`variantGroup: "tenancy"`). Compõe sobre o [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/login-tenancy/Visao-geral|extension login-tenancy]] (signup público, `RestControllerPath` em `java/seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/controllers/`) e [[SeedGrid/Extensions/security/Visao-geral|extension security]] (`/me/companies`, `/me/select-company` em `AccountUserController`) — **Confirmado** por leitura dos `RestControllerPath`.

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-login-tenancy` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-components: *` (opcional), `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *`, `react: ^18.2.0 \|\| ^19.0.0` |
| devDependencies | workspace `fe-components`, `fe-core`, `fe-security`; `react 19.0.0`; `@types/react ^19` |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` |

`exports`: `.` → `./dist/index.{d.ts,js}`; `./client` → `./dist/client/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}`.

Dependência de módulo: **requer `security`** (usa `SecurityPaths.me`, `isLoginSuccess`, `SecurityLoginResponse`, `SecurityServer`, `applySessionCookies`).

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `MyCompany` | interface | `.` | Empresa do usuário (`publicId`, `tradeName`, `corporateName`, `isRoot`) | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-login-tenancy/src/company.ts → MyCompany` |
| `SelectCompanyResult` | interface | `.` | `{ kind; message? }` (`"signed_in"` = sucesso) | `.../src/company.ts → SelectCompanyResult` |
| `companyLabel` | função | `.` | `tradeName → corporateName → publicId` | `.../src/company.ts → companyLabel` |
| `SignupRequestStatus` | type | `.` | `string` | `.../src/signup.ts` |
| `SignupAddress`, `SignupLegalRepresentative`, `InstitutionalSignupRequest`, `SignupResponse`, `EmailExistsResponse`, `ConfirmSignupRequest`, `ConfirmSignupResponse`, `ResendSignupEmailRequest` | interfaces | `.` | DTOs do signup institucional (`plainRootPassword?` opcional por causa da vinculação) | `.../src/signup.ts` |
| `LoginTenancyPaths` | const | `.` | `signup`, `signupEmailExists(email)`, `signupConfirmEmail`, `signupResendEmail` | `.../src/paths.ts → LoginTenancyPaths` |
| `loginTenancyMessages` | const | `.` | i18n `en`/`pt-BR`; `es`/`fr` = `en`; `pt-PT` = `pt-BR` | `.../src/messages.ts → loginTenancyMessages` |
| `CompanyScopePicker` | componente React | `./client` | Seletor de empresa desacoplado do transporte (props `listCompanies`, `selectCompany`, `onSignedIn`, `onCancel?`, textos, `readError?`); usa `SgCombobox`/`SgButton` | `.../src/client/company-scope-picker.tsx → CompanyScopePicker` |
| `CompanyScopePickerProps` | interface | `./client` | Props do picker | idem |
| `createLoginTenancyServer` | função | `./server` | `(session) => LoginTenancyServer` | `.../src/server/create-login-tenancy.ts → createLoginTenancyServer` |
| `LoginTenancyServer` | interface | `./server` | métodos do servidor (endpoints na seção de APIs backend) | idem |
| `SelectCompanyOutcome` | interface | `./server` | `{ signedIn; response }` | idem |

Contagem: `.` = 15; `./client` = 2; `./server` = 3.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]):

| Campo | Valor |
|---|---|
| `id` / `configKey` | `login-tenancy` |
| `requires` | `["security"]` |
| `variantGroup` | `tenancy` |
| `messages` | `loginTenancyMessages` de `@seedgrid/fe-login-tenancy` |
| `postAuthResolver` | `resolveLoginTenancyPostAuthPath` de `@/modules/login-tenancy` |

`postAuthResolver` é inserido pelo CLI no registry `resolvePostAuthPath` do `navigation.ts` do fe-security; o resolver (`scaffold/src/modules/login-tenancy/post-auth.ts`) faz `GET /api/login-tenancy/companies` e devolve `/auth/select-company` quando há mais de uma empresa (falha → `null`, cai no dashboard). **Confirmado** no código do módulo; o lado do fe-security não foi verificado aqui.

## Páginas (scaffold)

| Rota | Arquivo | Acesso |
|---|---|---|
| `/signup` | `scaffold/src/app/(public)/signup/page.tsx` | público; wizard CNPJ/ViaCEP/UF; checa e-mail existente e ativa vinculação |
| `/auth/select-company` | `scaffold/src/app/auth/select-company/page.tsx` | pós-login; envolve `CompanyScopePicker`; sucesso → `/`, cancelar → `/auth/login` |

Route Handlers em `scaffold/src/app/api/login-tenancy/`: `GET companies`, `POST select-company` (exige `companyPublicId`, 400 se ausente), `POST signup`, `GET signup/email-exists?email=`, `POST signup/confirm-email`, `POST signup/resend-email`. Nenhuma permissão (`RouteGuard`) é usada.

## APIs backend chamadas (`createLoginTenancyServer`)

| Método | Path | Função |
|---|---|---|
| GET | `/me/companies` | `listMyCompanies` |
| POST | `/me/select-company` (body `{ companyPublicId }`) | `selectCompany` (em sucesso persiste cookies via `session.applySessionCookies`) |
| POST | `/public/signup` | `signup` |
| GET | `/public/signup/email-exists?email=` | `emailExists` |
| POST | `/public/signup/confirm-email` | `confirmSignup` |
| POST | `/public/signup/resend-email` | `resendSignupEmail` |

6 endpoints.

## Separação client/server

`.` client-safe; `./client` React (`"use client"`, depende de `@seedgrid/fe-components`); `./server` SERVER-ONLY. O `server.ts.hbs` do scaffold é `"use server"` e não é reexportado pelo barrel client do scaffold.

## Configuração

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_access_token` | Não | Cookie do access token; vazio cai no padrão | `getLoginTenancyServer → createSecurityServer` | deve coincidir com o fe-security; `selectCompany` regrava esse cookie | runtime server | `scaffold/src/modules/login-tenancy/server.ts.hbs → ACCESS_COOKIE_NAME` |
| `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | string (env) | nome de cookie | `sg_{{project_slug}}_refresh_token` | Não | Cookie do refresh token | idem | idem | runtime server | `... → REFRESH_COOKIE_NAME` |

Props de texto do `CompanyScopePicker` têm padrões em pt-BR (`description`, `companyFieldLabel = "Empresa"`, `confirmLabel = "Entrar"`, `cancelLabel = "Voltar ao login"`).

## Exemplos

Fonte: README.

```ts
import { createLoginTenancyServer } from "@seedgrid/fe-login-tenancy/server";
const loginTenancy = createLoginTenancyServer(session);
const empresas = await loginTenancy.listMyCompanies();
await loginTenancy.selectCompany(empresas[0].publicId);
```

Uso real do picker: `scaffold/src/app/auth/select-company/page.tsx`. Sem consumidor em `apps/showcase`.

## Testes (não executados)

`tests/module-manifest.test.mjs` — `id`, `requires`, `variantGroup`, `configKey`.

## Limitações

- `POST /api/login-tenancy/select-company` exige `companyPublicId` no corpo (enviar `{ publicId }` responde 400).
- A tela `/signup` consulta `/api/locations/states` e `/api/locations/cities`, que só existem no scaffold do `fe-subdomain-tenancy` (mutuamente exclusivo); sem eles os combos de UF/cidade ficam vazios.
- A extension tem `GET /public/signup/cnpj-status` sem contrato no front.

