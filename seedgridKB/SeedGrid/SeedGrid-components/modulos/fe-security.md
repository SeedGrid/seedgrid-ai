---
tags: [seedgrid, front, modulo, fe-security]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-security
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-security

Links: [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]] · [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]] · [[SeedGrid/Extensions/security/Visao-geral|Extension security (backend)]]

> Convenção de fontes: caminhos relativos a `seedgrid-platform`. Abreviação usada nas tabelas: `PKG` = `front/seedgrid-fe-components/packages/modules/seedgrid-fe-security`.
> Testes **não executados**; nenhum build foi rodado nesta análise.

## Objetivo

Módulo-base de segurança do front SeedGrid (Next.js): sessão server-side com cookies httpOnly (login, refresh em 401, logout, 2FA), contrato de paths REST da extension backend `security`, helpers de permissão, DTOs, mensagens i18n e componentes client. Os demais módulos front (`fe-apikeys`, `fe-audit`, `fe-backup`, `fe-billing-*`, `fe-login-tenancy`, `fe-self-enter`, `fe-subdomain-tenancy`) declaram `requires: ["security"]` e compõem seus engines sobre `SecurityServer`. **Confirmado** (`PKG/README.md`; `packages/modules/*/src/module.ts`; ex.: `packages/modules/seedgrid-fe-apikeys/src/server/create-apikeys-server.ts → createApiKeysServer(session: SecurityServer)`).

O pacote tem duas partes distribuídas juntas (`"files": ["dist", "scaffold"]`):

| Parte | Onde | Natureza |
|---|---|---|
| Lib versionada | `PKG/src/**` → `dist/**` | Importada via npm; não se edita no app |
| Scaffold | `PKG/scaffold/src/**` | Copiado pelo SeedGrid CLI para dentro do app gerado (o app é dono do código). Contém templates `.hbs` |

**Confirmado** (`PKG/package.json → files`; `PKG/scaffold/README.md`).

## Pacote npm

| Item | Valor | Certeza / fonte |
|---|---|---|
| Nome | `@seedgrid/fe-security` | Confirmado — `PKG/package.json` |
| Versão | `2026.7.3` | Confirmado |
| Tipo | `"type": "module"` (ESM); `main: dist/index.js`, `types: dist/index.d.ts` | Confirmado |
| peerDependencies | `@seedgrid/fe-components: *`, `@seedgrid/fe-core: *`, `next: >=14` (opcional), `react: ^18.2.0 \|\| ^19.0.0` (opcional) | Confirmado (`peerDependenciesMeta`) |
| dependencies | nenhuma | Confirmado |
| devDependencies | `@seedgrid/fe-components` e `@seedgrid/fe-core` (`workspace:*`), `next 15.0.7`, `react 19.0.0`, `@types/react ^19` | Confirmado |
| Licença | MIT (declarada no README; não há campo `license` no `package.json`) | Confirmado |

Observação: `next` e `react` são opcionais no peer, mas `./client` importa `react`/`next/navigation` e `./server` importa `next/headers`/`next/server`; só `.` e `./paths` funcionam sem eles. **Inferência** (pelos imports).

### Campo `exports`

| Subpath | types | default | Natureza |
|---|---|---|---|
| `.` | `./dist/index.d.ts` | `./dist/index.js` | client-safe (sem `next/*`) |
| `./server` | `./dist/server/index.d.ts` | `./dist/server/index.js` | SERVER-ONLY (`next/headers`, `next/server`) |
| `./client` | `./dist/client/index.d.ts` | `./dist/client/index.js` | client (`"use client"`, React, `next/navigation`) |
| `./paths` | `./dist/paths.d.ts` | `./dist/paths.js` | standalone, só `SecurityPaths` |

**Confirmado** (`PKG/package.json → exports`; comentários em `PKG/src/index.ts`, `PKG/src/server/index.ts`, `PKG/src/client/index.ts`).

`dist/module.js` / `dist/module.json` são gerados mas **não** estão no mapa `exports` (o CLI lê o arquivo diretamente). **Confirmado**.

### Build e scripts

| Script | Comando |
|---|---|
| `build` | `tsc -p tsconfig.json` (`rootDir: src`, `outDir: dist`, `declaration`, `declarationMap`; estende `../../../tsconfig.base.json`) |
| `postbuild` | `node scripts/emit-module-manifest.mjs` — importa `dist/module.js` e grava `dist/module.json` |
| `typecheck` | `tsc -p tsconfig.json --noEmit` |
| `test` | `pnpm run build && node --test tests/paths.test.mjs tests/module-manifest.test.mjs tests/permissions.test.mjs` |

**Confirmado** (`PKG/package.json`, `PKG/tsconfig.json`, `PKG/scripts/emit-module-manifest.mjs`). O `tsconfig` inclui só `src`; o `scaffold/` não é compilado pelo pacote.

## Exports públicos por subpath

Contagem (Confirmado, lendo os barrels): **`.` = 32**, **`./client` = 6**, **`./server` = 10** (2 deles são re-export de tipos de `.`), **`./paths` = 1**.

### `.` (client-safe) — `PKG/src/index.ts`

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `SecurityPaths` | const + type | `.`, `./paths` | Paths REST da extension security (auth, twoFactor, users, roles, permissions, me, companies, selfEnter); builders aplicam `encodeURIComponent` | `PKG/src/paths.ts → SecurityPaths` |
| `SecuritySessionCookieNames` | interface | `.` | Nomes dos cookies `token`, `refresh`, `passwordChangeRequired` | `PKG/src/config.ts` |
| `SecurityServerConfig` | interface | `.` | Config do motor de sessão (ver Configuração) | `PKG/src/config.ts` |
| `SecurityLoginResponse` | type (união) | `.` | Resposta de login: `status:"OK"` (token…), `status:"2F_REQUIRED"` (tempToken), genérica | `PKG/src/session-contract.ts` |
| `SecurityResend2FAResponse` | type | `.` | Resposta de reenvio 2FA | idem |
| `MePermissions` | interface | `.` | `{ userPublicId, name, roles[], permissions[] }` (GET `/me/permissions`) | idem |
| `isLoginSuccess` | função | `.` | Type guard de login `OK` com `token` string | idem |
| `ProblemDetail` | interface | `.` | Problem Details RFC 7807 serializável (`status`, `title`, `detail`, `violations`) | `PKG/src/session-result.ts` |
| `ActionResult<T>` | type | `.` | `{ok:true,data}` \| `{ok:false,problem}` para Server Actions | idem |
| `readProblemMessage` | função | `.` | Mensagem exibível: `detail` → 1ª violation → `title` → `Erro {status}` | idem |
| `SecurityFetchOptions` | type | `.`, `./server` | `RequestInit` com `headers?: HeadersInit` | `PKG/src/server-contract.ts` |
| `SecurityServer` | interface | `.`, `./server` | Contrato do motor: `fetchWithSession`, `apiFetchSecurity`, `apiFetchServer`, `buildHeaders`, `applySessionCookies`, `clearAuthCookies`, `isInvalidSessionResponse` | idem |
| `PaginatedResult<T>` | interface | `.` | Página do backend (`items`, `totalRecords`, `page`, `size`, `sortField`, `sortOrder`, `query`) | `PKG/src/dtos.ts` |
| `PermissionOption` | interface | `.` | `{publicId,name,description}` | idem |
| `RoleSummary` | interface | `.` | `{publicId,name}` | idem |
| `RoleEntry` | interface | `.` | Role completa com `permissions` e `forIntegration` | idem |
| `UserEntry` | interface | `.` | Usuário (root, 2FA, emailConfirmed, roles…) | idem |
| `TwoFactorMethod` | type | `.` | `"TOTP" \| "EMAIL" \| "WHATSAPP"` | idem |
| `TwoFactorStatus` | interface | `.` | Status 2FA do usuário | idem |
| `TwoFactorEnableResponse` | interface | `.` | Resposta de enable/confirm (qrCode, secret, backupCodes, metadata) | idem |
| `PickListOption` | interface | `.` | Opção para `PickListField` | idem |
| `NavItem` | interface | `.` | Item de menu com `permission?` | `PKG/src/menu.ts` |
| `resolveNavHref` | função | `.` | Href do 1º filho ou do próprio item | idem |
| `canShowItem` | função | `.` | Regra de visibilidade (grupo, `/` público, `permission`, senão `adminRole`) | idem |
| `filterNavItems` | função | `.` | Filtra a árvore recursivamente, dropa grupos vazios | idem |
| `normalizePermission` | função | `.` | `.`/espaço/`-` → `_`, upper case | `PKG/src/permissions.ts` |
| `createPermissionSet` | função | `.` | `Set` normalizado | idem |
| `hasPermission` | função | `.` | Checa permissão normalizada | idem |
| `hasAnyPermission` | função | `.` | Alguma das exigidas | idem |
| `hasAllPermissions` | função | `.` | Todas as exigidas | idem |
| `buildCrudPermissions` | função | `.` | `RES` → `{read,create,update,delete}` = `RES_READ`… (remove sufixo CRUD se vier) | idem |
| `securityMessages` | const | `.` | Bundle i18n: `en`, `es`, `fr`, `pt-BR`, `pt-PT` (locales parciais fazem merge sobre `en`; `pt-PT` sobre `en`+`pt-BR`) | `PKG/src/messages.ts` |

### `./client` — `PKG/src/client/index.ts`

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `PermissionProvider` | componente React | `./client` | Contexto de permissões; faz `fetch(meUrl, {cache:"no-store"})` a cada mudança de `pathname`; `adminRole` implica todas as permissões | `PKG/src/client/permission-provider.tsx` |
| `usePermissions` | hook | `./client` | Lê `{loading, me, hasRole, hasPermission}` | idem |
| `PermissionContextValue` | type | `./client` | Valor do contexto | idem |
| `PermissionProviderProps` | type | `./client` | `children`, `meUrl?`, `adminRole?` | idem |
| `StatusBadge` | componente | `./client` | `SgBadge` success/neutral a partir de `active` | `PKG/src/client/status-badge.tsx` |
| `PickListField` | componente | `./client` | Wrapper de `SgPickList` (source/target com filtro, `readOnly`) | `PKG/src/client/pick-list-field.tsx` |

### `./server` — `PKG/src/server/index.ts`

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `createSecurityServer` | função (factory) | `./server` | Cria o motor de sessão a partir de `SecurityServerConfig` | `PKG/src/server/create-security-server.ts` |
| `SecurityServer`, `SecurityFetchOptions` | type (re-export) | `./server` | Ver `.` | `PKG/src/server-contract.ts` |
| `ApiRequestError` | classe | `./server` | Erro com corpo cru (`status`, `body`) — usado por `apiFetchServer` | `PKG/src/server/errors.ts` |
| `ApiConnectionError` | classe | `./server` | Falha de rede (`path`, `cause`) | idem |
| `isApiConnectionError` | função | `./server` | Type guard | idem |
| `problemResponse` | função | `./server` | `ApiClientError` → `NextResponse` `application/problem+json` com status upstream; outros erros → 502 | `PKG/src/server/problem-response.ts` |
| `toProblem` | função | `./server` | Erro → `ProblemDetail` serializável (502 para erro de rede) | `PKG/src/server/to-problem.ts` |
| `toActionResult` | função | `./server` | Envolve Server Action em `ActionResult` (nunca lança) | `PKG/src/server/action.ts` |
| `toRouteResponse` | função | `./server` | Envolve route handler: sucesso → JSON (ou 204 se `null`/`undefined`), erro → `problemResponse` | `PKG/src/server/route.ts` |

### `./paths`

`SecurityPaths` (mesmo objeto de `.`). **Confirmado** (`PKG/src/paths.ts`).

### Comportamento do motor `createSecurityServer` (Confirmado — `PKG/src/server/create-security-server.ts`)

- `buildHeaders`: `Authorization: Bearer <cookie token>`; se não houver cookie e houver `serviceToken`, usa `Bearer <serviceToken>`; mescla `resolveTenancyHeaders()` e headers da chamada.
- `safeFetch`: `fetch(apiBaseUrl + path)` com `Content-Type: application/json`, `cache: "no-store"`; erro de rede → `ApiConnectionError`.
- `fetchWithSession`: em 401 chama `tryRefreshSession` (POST `SecurityPaths.auth.refresh` com `{refreshToken}` do cookie) e repete uma vez; refresh falho limpa cookies.
- `applySessionCookies`: grava `token`, `refresh` (se vier) e `passwordChangeRequired="1"` (ou apaga), com `httpOnly`, `path:"/"`, `sameSite:"lax"`, `secure` — **sem `maxAge`** (cookie de sessão).
- `isInvalidSessionResponse`: só 401 (ou corpo contendo "usuario nao encontrado"/"usuário não encontrado") invalida sessão; **403 não desloga**.
- `apiFetchSecurity` lança `ApiClientError` (de `@seedgrid/fe-core`) com corpo parseado; 204 → `null`. `apiFetchServer` lança `ApiRequestError` (retrocompat).
- Não há dedup/single-flight de refresh no motor da lib (cada chamada que recebe 401 faz seu refresh). **Confirmado** (ausência no código); o dedup existe só no scaffold (`session-routes.ts.hbs → pendingRefreshResponses`).

## Registro no @seedgrid/fe-core (manifesto CLI)

Não há registro em runtime: o "registro" é um **manifesto estático** tipado por `SeedGridCliModuleManifest` (de `@seedgrid/fe-core`), serializado para `dist/module.json` no `postbuild` e lido pelo SeedGrid CLI (Rust). **Confirmado** (`PKG/src/module.ts → module`; `front/seedgrid-fe-components/packages/seedgrid-fe-core/src/cli-module-manifest.ts → SeedGridCliModuleManifest`). O próprio fe-core avisa que `SeedGridModuleManifest` (de `./module`) é um rascunho de registry runtime não usado. Ver [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]].

| Campo | Valor | Observação |
|---|---|---|
| `id` | `security` | |
| `configKey` | `security` | |
| `requires` | — (ausente) | É a raiz das dependências |
| `provider` | `[{ import: "AuthProvider", from: "@/modules/security" }]` | Alias do app (scaffold), não import npm |
| `navigation` | `{ import: "useSecurityAppShellSections", from: "@/modules/security" }` | Hook do scaffold que monta o menu |
| `messages` | `{ import: "securityMessages", from: "@seedgrid/fe-security" }` | |
| `postAuthResolver` | — | Ponto de extensão consumido por outros módulos (marcadores em `scaffold/src/modules/security/navigation.ts`) |

**Rotas/paths no manifesto:** 0 — o tipo `SeedGridCliModuleManifest` não tem campos de rotas, menu ou permissões. Rotas vêm do scaffold copiado (19 páginas + 6 route handlers, abaixo); menu vem de `useSecurityAppShellSections`. **Confirmado**.

Ponto de extensão `postAuthResolver`: `scaffold/src/modules/security/navigation.ts → resolvePostAuthPath` percorre resolvers inseridos pelo CLI entre os marcadores `seedgrid:post-auth-resolvers-*`; resolver que lança é ignorado; fallback `securityConfig.routes.dashboard`. **Confirmado**.

## Rotas e páginas (scaffold)

Páginas Next (App Router) em `PKG/scaffold/src/app/` — **Confirmado** (listagem de arquivos):

| Rota | Arquivo | Guarda / permissão |
|---|---|---|
| `/` | `app/page.tsx` (`SecurityDashboard`) | `RouteGuard` (autenticado) |
| `/login` | `app/login/page.tsx` | redireciona para `securityConfig.routes.login` |
| `/auth/login` | `app/auth/login/page.tsx` | pública |
| `/auth/2fa/verify` | `app/auth/2fa/verify/page.tsx` | pública |
| `/auth/forgot-password` (+ `/confirm`, `/success`) | `app/auth/forgot-password/**` | pública |
| `/auth/welcome` | `app/auth/welcome/page.tsx` | pública (confirma e-mail) |
| `/security/users` | `app/security/users/(list)/page.tsx` | `USER_READ` |
| `/security/users/new` | `app/security/users/(create)/new/page.tsx` | `USER_CREATE` |
| `/security/users/[publicId]` | `app/security/users/(edit)/[publicId]/page.tsx` | `USER_READ` |
| `/security/roles`, `/new`, `/[publicId]` | `app/security/roles/**` | `ROLE_READ` / `ROLE_CREATE` / `ROLE_READ` |
| `/security/companies`, `/new`, `/[publicId]` | `app/security/companies/**` | `COMPANY_READ` / `COMPANY_CREATE` / `COMPANY_READ` (+ `CompanyManagementGuard`) |
| `/security/profile` | `app/security/profile/page.tsx` | `RouteGuard`; edição usa `USER_UPDATE` |
| `/security/2fa` | `app/security/2fa/page.tsx` | `RouteGuard` |
| `/users/change-password` | `app/users/change-password/page.tsx` | autenticado (o `RouteGuard` força esta rota quando `changePasswordRequired`) |

Route handlers (proxy BFF) — **Confirmado**:

| Método + rota Next | Handler | Encaminha para backend |
|---|---|---|
| `POST /api/security/session/login` | `createLoginRouteResponse` | `POST /public/auth/login` |
| `POST /api/security/session/2fa/verify` | `createVerifyTwoFactorRouteResponse` | `POST /public/2f/verify` |
| `POST /api/security/session/2fa/resend` | `createResendTwoFactorRouteResponse` | `POST /public/2f/resend` |
| `POST /api/security/session/refresh` | `createRefreshRouteResponse` (dedup por refresh token) | `POST /public/auth/refresh` |
| `POST /api/security/session/logout` | `createLogoutRouteResponse` | — (só limpa cookies) |
| `GET /api/security/users/[publicId]/avatar` | `createUserAvatarRouteResponse` (usa `getSecuritySessionServer().fetchWithSession`) | `GET /users/{publicId}/avatar[?v=]` |

`securityConfig.routes` também aponta para `/security/api-keys`, `/auth/self-enter`, `/self-enter/requests/to-approve` e `/self-enter/invitations`, cujas páginas **não** estão neste scaffold — vêm de `fe-apikeys` (`scaffold/src/app/security/`) e `fe-self-enter` (`scaffold/src/app/auth/self-enter`, `scaffold/src/app/self-enter/**`). **Confirmado** (listagem dos scaffolds vizinhos).

## APIs backend chamadas

Paths relativos a `apiBaseUrl` (no client o scaffold usa `"/api"` e depende de um proxy `/api/[[...path]]` do app base, que **não** está neste pacote — **Inferência** pelo comentário em `scaffold/src/modules/security/config.ts → resolveApiBaseUrl`). O scaffold usa strings literais, **não** `SecurityPaths`. Total: **47** pares método+path distintos (Confirmado, contagem manual em `scaffold/src/modules/security/services/*.ts`, `server/*.hbs`/`.ts` e na lib).

| Grupo | Método + path | Origem |
|---|---|---|
| Sessão (server) | `POST /public/auth/login`, `POST /public/2f/verify`, `POST /public/2f/resend`, `POST /public/auth/refresh` | `scaffold/.../server/session-routes.ts.hbs`; refresh também em `PKG/src/server/create-security-server.ts → tryRefreshSession` |
| Auth (client) | `POST /public/auth/forgot-password`, `GET /public/auth/reset-password?token=`, `GET /public/auth/confirm-email?token=`, `GET /me/permissions` | `scaffold/.../services/auth-service.ts → authService` |
| Users | `GET /users` (paginado; query `search`/`name`/`email`), `GET /users/{publicId}`, `POST /users`, `PATCH /users/{publicId}`, `DELETE /users/{publicId}`, `GET /users/{publicId}/avatar`, `POST /users/{publicId}/avatar` (body `{filename, contentType, base64}`), `PUT /users/change-password` | `scaffold/.../services/security-service.ts → securityService`; avatar GET também em `server/avatar-routes.ts` |
| Roles / permissões | `GET /roles` (paginado e lista), `GET /roles/{publicId}`, `POST /roles`, `PATCH /roles/{publicId}`, `DELETE /roles/{publicId}`, `GET /roles/integration`, `GET /permissions` | idem |
| Companies | `GET /companies`, `GET /companies/{publicId}`, `POST /companies`, `PATCH /companies/{publicId}`, `DELETE /companies/{publicId}` | idem |
| 2FA | `GET /2f/status`, `POST /2f/enable`, `POST /2f/totp/confirm`, `POST /2f/disable` | idem |
| Self-enter | `POST /public/self-enter/requests`, `POST /public/self-enter/requests/{id}/confirm-email`, `POST /public/self-enter/requests/{id}/resend-email`, `GET /public/self-enter/invitations/{token}`, `POST /public/self-enter/invitations/{token}/complete`, `POST /self-enter/invitations`, `GET /self-enter/invitations`, `POST /self-enter/invitations/{id}/resend`, `GET /self-enter/requests/to-approve`, `POST /self-enter/requests/{id}/approve`, `POST /self-enter/requests/{id}/reject` | idem |
| API keys | `GET /apikeys`, `GET /apikeys/role/{roleName}`, `POST /apikeys/role/{roleName}`, `POST /apikeys/{publicId}/revoke` | idem (endpoints da extension apikeys) |

A correspondência 1:1 de `SecurityPaths` com `RestControllerPath.java` é afirmada no README/comentário, mas **não confirmada** nesta nota (ver [[SeedGrid/Extensions/security/Visao-geral|Extension security (backend)]]).

## Permissões e roles

| Permissão | Onde é usada | Certeza |
|---|---|---|
| `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE` | `RouteGuard` das páginas de users, `useCrudPermission("USER")`, menu, profile (`USER_UPDATE`) | Confirmado |
| `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE` | páginas de roles, `useCrudPermission("ROLE")`, menu | Confirmado |
| `COMPANY_READ`, `COMPANY_CREATE`, `COMPANY_UPDATE`, `COMPANY_DELETE` | páginas de companies, menu (só se `isCompanyManagementEnabledForHostKind` ≠ `master`) | Confirmado |
| `APIKEY_READ`, `APIKEY_CREATE`, `APIKEY_REVOKE` | menu e dashboard, só se o template tiver `security_api_keys_enabled` | Confirmado |
| `SELFENTER_APPROVE`, `SELFENTER_REJECT`, `SELFENTER_INVITE` | menu, só se o template tiver `security_self_enter_enabled` | Confirmado |
| Role `ADMIN` | default de `adminRole` em `PermissionProvider` (implica todas) e em `canShowItem`/`filterNavItems` (itens sem `permission`) | Confirmado |

Menu (`scaffold/src/modules/security/useSecurityAppShellSections.tsx.hbs`): seção `application` → grupo `access-management` (`users` ordem 10, `companies` 20, `roles` 30, `api-keys` 40) e, com self-enter, grupo `self-enter` (`self-enter-approval` 50, `self-enter-invitations` 60). Itens só-leitura recebem badge `security.common.readonly`. **Confirmado**.

`hasPermission` da lib normaliza (`user.read` = `USER_READ`); o `PermissionProvider` compara **sem** normalizar (`permissions.has(permission)`). **Confirmado** — diferença sutil de semântica.

## Separação client/server

| Camada | Pode importar `next/headers`? | Conteúdo |
|---|---|---|
| `@seedgrid/fe-security` (`.`) | Não | Tipos, paths, helpers puros, mensagens |
| `@seedgrid/fe-security/paths` | Não | `SecurityPaths` |
| `@seedgrid/fe-security/client` | Não (`"use client"`) | Provider/hook/componentes |
| `@seedgrid/fe-security/server` | Sim (SERVER-ONLY) | Motor de sessão e helpers de rota/action |
| Scaffold `server/*` | Sim | `session-routes`, `session-server` (`"use server"`), `avatar-routes`, `public-api-base-url` (`"use server"`) |

`SecurityServer` (tipo) mora em `.` para que outros pacotes (ex.: `fe-login-tenancy`) o importem sem puxar `next/headers`. **Confirmado** (`PKG/src/server-contract.ts`, comentário).

No scaffold há **dois caminhos de sessão**: (1) estabelecimento (`session-routes.ts.hbs`, grava cookies `access`/`refresh` com `maxAge`, refresh com dedup via `Map`) e (2) consumo autenticado (`session-server.ts.hbs → getSecuritySessionServer()` → `createSecurityServer`). Mantidos separados de propósito. **Confirmado** (`PKG/scaffold/README.md`).

## Configuração

A **lib não lê `process.env`**, exceto `NODE_ENV` como default de `secureCookies`. Toda env é lida pelo **scaffold** (código do app). **Confirmado** (`PKG/src/config.ts`, comentário; grep `process.env` em `PKG/src` → só `create-security-server.ts`).

Legenda de Fase: **build (NEXT_PUBLIC inline)** = Next substitui o valor no bundle no build; **runtime server** = lido no processo Node do Next; **runtime client** = resolvido no browser; **código (factory)** = valor passado pelo app no código; **geração (CLI/.hbs)** = substituído pelo CLI ao copiar o scaffold.

### Variáveis de ambiente

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED` | string → boolean | `"true"` (case-insensitive, com trim) habilita; qualquer outro valor = `false` | `false` (ausente) | Não | Define `securityConfig.features.selfEnterEnabled` | Flag de self-enter no client (o menu de self-enter, porém, é decidido pelo template `security_self_enter_enabled`) | `security_self_enter_enabled` (template); módulo `fe-self-enter` | build (NEXT_PUBLIC inline) | `PKG/scaffold/src/modules/security/config.ts → resolveBooleanFlag`; consumo em `seedgrid-fe-self-enter/scaffold/src/app/auth/self-enter/page.tsx` |
| `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` | string | nome de cookie | `sg_{{project_slug}}_access_token` | Não | Nome do cookie httpOnly do access token (trim; vazio cai no padrão) | Login/refresh/logout e motor de sessão | Deve ser igual nos dois arquivos que a leem | runtime server | `PKG/scaffold/src/modules/security/server/session-routes.ts.hbs → ACCESS_COOKIE_NAME`; `.../server/session-server.ts.hbs → ACCESS_COOKIE_NAME` |
| `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | string | nome de cookie | `sg_{{project_slug}}_refresh_token` | Não | Nome do cookie httpOnly do refresh token | idem | idem | runtime server | idem `REFRESH_COOKIE_NAME` |
| `SEEDGRID_SECURITY_REFRESH_COOKIE_MAX_AGE_SECONDS` | string → inteiro | inteiro > 0 | `2592000` (30 dias) | Não | `maxAge` do cookie de refresh; inválido/≤0 cai no padrão | `setRefreshTokenCookie` | Só no caminho `session-routes` (o motor da lib não usa `maxAge`) | runtime server | `.../session-routes.ts.hbs → resolveRefreshCookieMaxAge` |
| `NODE_ENV` | string | `production` / outros | — | Não | `secure` dos cookies = `NODE_ENV === "production"` | cookies do scaffold; default de `secureCookies` na lib | `SecurityServerConfig.secureCookies` sobrepõe na lib | runtime server (Inferência: o Next pode inlinear `NODE_ENV` no build) | `PKG/src/server/create-security-server.ts → createSecurityServer`; `.../session-routes.ts.hbs` |

Variáveis do app base consumidas indiretamente (via `@/config/environment`, fora deste pacote): `appEnvironment.hosts.apiOrigin`, `appEnvironment.hosts.masterAppHost`, `appEnvironment.persistence.scope`, `resolveApiBaseUrlForHostname(hostname)`. As envs que os alimentam **não estão neste repositório** — **Não confirmado**.

### `SecurityServerConfig` (lib — `createSecurityServer`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `apiBaseUrl` | `string` | URL base do report-api, sem barra final (é concatenada com o path) | — | Sim | Prefixo de todas as chamadas | `safeFetch`, `tryRefreshSession` | No scaffold vem de `resolvePublicApiBaseUrl()` (por hostname) | código (factory), resolvido em runtime server | `PKG/src/config.ts → SecurityServerConfig`; `PKG/src/server/create-security-server.ts` |
| `cookies.token` | `string` | nome de cookie | — | Sim | Lê o access token → `Authorization: Bearer` | `buildHeaders`, `applySessionCookies`, `clearAuthCookies` | `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` no scaffold | código (factory) | `PKG/src/config.ts → SecuritySessionCookieNames` |
| `cookies.refresh` | `string` | nome de cookie | — | Sim | Refresh token usado em 401 | `tryRefreshSession` | `SEEDGRID_SECURITY_REFRESH_COOKIE_NAME` | código (factory) | idem |
| `cookies.passwordChangeRequired` | `string` | nome de cookie | — | Sim | Cookie `"1"` quando login exige troca de senha | `applySessionCookies`, `clearAuthCookies` | Scaffold fixa `sg_{{project_slug}}_password_change_required` (sem env) | código (factory) | idem; `.../session-server.ts.hbs` |
| `secureCookies` | `boolean` | `true`/`false` | `process.env.NODE_ENV === "production"` | Não | Flag `secure` dos cookies gravados | `applySessionCookies` | `NODE_ENV` | código (factory) / runtime server | `PKG/src/server/create-security-server.ts` |
| `serviceToken` 🔒 | `string` | `<SEGREDO:report-api-service-token>` | — | Não | `Bearer` usado **apenas** sem cookie de sessão | `buildHeaders` | Passado só via código na factory; o scaffold não o define | código (factory) | idem |
| `resolveTenancyHeaders` | `() => Promise<HeadersInit> \| HeadersInit` | função | — | Não | Headers extras por request (ex.: `X-Company-Id`, header de tenant) | `buildHeaders` | Plug de `fe-login-tenancy`/`fe-subdomain-tenancy` (Inferência pelo comentário) | código (factory), runtime server | `PKG/src/config.ts` |

### Props/parâmetros configuráveis da lib (client/menu)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `PermissionProvider.meUrl` | `string` | URL que devolve `MePermissions` | `"/api/auth/me"` | Não | Fetch a cada troca de `pathname` | `loadPermissions` | Rota `/api/auth/me` **não existe** no scaffold | runtime client | `PKG/src/client/permission-provider.tsx` |
| `PermissionProvider.adminRole` | `string` | nome de role | `"ADMIN"` | Não | Role que implica todas as permissões | `hasPermission` do contexto | `canShowItem.adminRole` | runtime client | idem |
| `canShowItem` / `filterNavItems` `adminRole` | `string` | nome de role | `"ADMIN"` | Não | Itens folha sem `permission` só aparecem para essa role | filtragem de menu | `PermissionProvider.adminRole` | runtime client | `PKG/src/menu.ts` |

### `securityConfig` (scaffold — `scaffold/src/modules/security/config.ts`)

Valores literais no código copiado para o app (editáveis no app). **Confirmado**.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `apiBaseUrl` | `string` | — | client: `"/api"`; server: `appEnvironment.hosts.apiOrigin` | — (calculado) | Base dos clients `createApiClient` privado/público | `services/security-api.ts` | Proxy `/api/[[...path]]` do app base (Inferência) | runtime client / runtime server (avaliado no import) | `config.ts → resolveApiBaseUrl` |
| `pagination.defaultPageSize` | number | inteiro | `10` | — | Tamanho de página padrão | listas CRUD | | código (scaffold) | `config.ts` |
| `pagination.pageSizeOptions` | number[] | — | `[10, 20, 50]` | — | Opções de página | listas CRUD | | código (scaffold) | `config.ts` |
| `search.debounceMs` | number | ms | `1000` | — | Debounce da busca | `useDebouncedSearch` (Inferência pelo README do scaffold) | | código (scaffold) | `config.ts` |
| `search.minLength` | number | — | `3` | — | Mínimo de caracteres da busca | listas | `security.common.search_hint` | código (scaffold) | `config.ts` |
| `storage.sessionKey` | string | — | `` `${appEnvironment.persistence.scope}:security:session` `` | — | Chave no `localStorage` da sessão client | `services/session-storage.ts` | `appEnvironment.persistence.scope` | runtime client | `config.ts` |
| `storage.pendingTwoFactorKey` | string | — | `` `${scope}:security:pending-2fa` `` | — | Chave do 2FA pendente (tempToken) | idem | idem | runtime client | `config.ts` |
| `features.selfEnterEnabled` | boolean | — | `false` | — | Ver `NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED` | Bloqueia a tela pública `/auth/self-enter` do fe-self-enter quando `false` | | build (NEXT_PUBLIC inline) | `config.ts` |
| `routes.dashboard` | string | path | `/` | — | Destino pós-login padrão | `resolvePostAuthPath` | | código (scaffold) | `config.ts` |
| `routes.profile` | string | path | `/security/profile` | — | | menu/telas | | código (scaffold) | `config.ts` |
| `routes.login` | string | path | `/auth/login` | — | Redirect do `RouteGuard` | `RouteGuard`, `/login` | | código (scaffold) | `config.ts` |
| `routes.welcome` | string | path | `/auth/welcome` | — | | | | código (scaffold) | `config.ts` |
| `routes.forgotPassword` | string | path | `/auth/forgot-password` | — | | | | código (scaffold) | `config.ts` |
| `routes.forgotPasswordConfirm` | string | path | `/auth/forgot-password/confirm` | — | | | | código (scaffold) | `config.ts` |
| `routes.forgotPasswordSuccess` | string | path | `/auth/forgot-password/success` | — | | | | código (scaffold) | `config.ts` |
| `routes.verifyTwoFactor` | string | path | `/auth/2fa/verify` | — | | | | código (scaffold) | `config.ts` |
| `routes.users` | string | path | `/security/users` | — | | menu | | código (scaffold) | `config.ts` |
| `routes.companies` | string | path | `/security/companies` | — | | menu | | código (scaffold) | `config.ts` |
| `routes.roles` | string | path | `/security/roles` | — | | menu | | código (scaffold) | `config.ts` |
| `routes.twoFactor` | string | path | `/security/2fa` | — | | | | código (scaffold) | `config.ts` |
| `routes.apiKeys` | string | path | `/security/api-keys` | — | Página vem de `fe-apikeys` | menu | | código (scaffold) | `config.ts` |
| `routes.changePassword` | string | path | `/users/change-password` | — | Redirect forçado quando `changePasswordRequired` | `RouteGuard` | | código (scaffold) | `config.ts` |
| `routes.selfEnterPublic` | string | path | `/auth/self-enter` | — | Página vem de `fe-self-enter` | | | código (scaffold) | `config.ts` |
| `routes.selfEnterApproval` | string | path | `/self-enter/requests/to-approve` | — | idem | menu | | código (scaffold) | `config.ts` |
| `routes.selfEnterInvitations` | string | path | `/self-enter/invitations` | — | idem | menu | | código (scaffold) | `config.ts` |

### Variáveis de template (CLI)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `project_slug` | string | slug | não confirmado (definido pelo CLI) | Sim (para os `.hbs`) | Compõe nomes padrão de cookie | `session-routes.ts.hbs`, `session-server.ts.hbs` | `SEEDGRID_SECURITY_*_COOKIE_NAME` | geração (CLI/.hbs) | grep `{{project_slug}}` |
| `security_api_keys_enabled` | boolean | — | não confirmado | Não | Inclui menu/atalhos de API keys | `useSecurityAppShellSections.tsx.hbs`, `SecurityDashboard.tsx.hbs` | módulo `fe-apikeys` | geração (CLI/.hbs) | `{{#if security_api_keys_enabled}}` |
| `security_self_enter_enabled` | boolean | — | não confirmado | Não | Inclui menu de self-enter | idem | `NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED`; módulo `fe-self-enter` | geração (CLI/.hbs) | `{{#if security_self_enter_enabled}}` |

Valores fixos (não configuráveis por env): `maxAge` do cookie de access no scaffold = `expiresIn` da resposta ou `900` s; cookies com `sameSite:"lax"`, `path:"/"`, `httpOnly`. **Confirmado** (`session-routes.ts.hbs → setAccessTokenCookie`).

## Exemplos de uso reais

Não há uso em `apps/showcase` (grep sem resultados). Exemplos abaixo vêm do README e de módulos consumidores do mesmo repositório.

1. Instância do motor no app gerado — `PKG/scaffold/src/modules/security/server/session-server.ts.hbs`:

```ts
import { createSecurityServer } from "@seedgrid/fe-security/server";
import { resolvePublicApiBaseUrl } from "./public-api-base-url";

export async function getSecuritySessionServer() {
  return createSecurityServer({
    apiBaseUrl: await resolvePublicApiBaseUrl(),
    cookies: {
      token: ACCESS_COOKIE_NAME,
      refresh: REFRESH_COOKIE_NAME,
      passwordChangeRequired: PASSWORD_CHANGE_REQUIRED_COOKIE_NAME,
    },
  });
}
```

2. Route handler com `toRouteResponse` — `packages/modules/seedgrid-fe-billing-user/scaffold/src/app/api/billing/me/route.ts`:

```ts
import { toRouteResponse } from "@seedgrid/fe-security/server";
import { getBillingUserServer } from "@/modules/billing-user/server";

export async function GET() {
  return toRouteResponse(async () => {
    const billing = await getBillingUserServer();
    const [subscription, usage] = await Promise.all([
      billing.getSubscription(),
      billing.getUsageSummary(),
    ]);
    return { subscription, usage };
  });
}
```

3. Composição de outro módulo sobre `SecurityServer` — `packages/modules/seedgrid-fe-apikeys/src/server/create-apikeys-server.ts`:

```ts
import type { SecurityServer } from "@seedgrid/fe-security";

export function createApiKeysServer(session: SecurityServer): ApiKeysServer {
  const P = ApiKeyPaths;
  return {
    createForRole: (roleName, req) =>
      session.apiFetchSecurity<ApiKeyCreateResponse>(P.byRole(roleName), {
        method: "POST",
        body: JSON.stringify(req),
      }),
    // ...
  };
}
```

4. Checagem de permissão — `PKG/README.md` (Uso rápido) e `PKG/scaffold/src/modules/security/hooks/usePermission.ts → useCrudPermission`:

```ts
import { hasPermission, buildCrudPermissions } from "@seedgrid/fe-security";

const USER_PERMISSIONS = buildCrudPermissions("USER"); // USER_READ, USER_CREATE, ...
if (hasPermission(userPermissions, USER_PERMISSIONS.read)) {
  // renderiza a lista de usuários
}
```

5. Server Action — comentário de uso em `PKG/src/server/action.ts`:

```ts
"use server";
export async function updateUser(input) {
  return toActionResult(() =>
    security.apiFetchSecurity(SecurityPaths.users.byPublicId(input.id), {
      method: "PUT", body: JSON.stringify(input),
    }),
  );
}
```

> Observação: o exemplo 5 usa `PUT /users/{publicId}`, mas o scaffold atualiza usuário com `PATCH` (`securityService.updateUser`). O método aceito pelo backend não foi confirmado aqui.

## Testes existentes (não executados)

| Arquivo | Runner | Cobre |
|---|---|---|
| `PKG/tests/paths.test.mjs` | `node --test` (sobre `dist/`) | Valores de `SecurityPaths` (auth, 2FA, users com encode, roles, permissions, me, companies, self-enter). Não cobre `twoFactor.status`, `me.companies` |
| `PKG/tests/module-manifest.test.mjs` | `node --test` (sobre `dist/module.json`) | `id`, `configKey`, `env`, `provider`, `messages` — **não** verifica `navigation` |
| `PKG/tests/permissions.test.mjs` | `node --test` | `normalizePermission`, `createPermissionSet`, `hasPermission`, `hasAny/AllPermissions`, `buildCrudPermissions` |
| `PKG/scaffold/src/modules/security/services/security-api.test.ts` | vitest (no app gerado; vitest não está nas devDeps do pacote — Inferência) | `extractApiMessage` (violations, RFC 7807, erros serializados, falha de fetch) |
| `PKG/scaffold/src/modules/security/services/security-service.test.ts` | vitest | `classifySelfEnterInvitationError`, `isSelfEnterInvitationEmailMismatchError`, `classifySelfEnterInvitationAdminError` |

Sem testes para `createSecurityServer`, `problemResponse`/`toProblem`, `PermissionProvider`, `menu.ts` ou as rotas de sessão (o próprio `scaffold/README.md` cita a falta de testes de runtime no login). **Confirmado**.

## Limitações

- O app base precisa fornecer `@/config/environment` (`apiOrigin`, `masterAppHost`, `persistence.scope`, `resolveApiBaseUrlForHostname`) e o proxy `/api/[[...path]]` usado pelos services do scaffold; não fazem parte deste pacote.
- O `session-routes` do scaffold não grava o cookie `passwordChangeRequired` (só `applySessionCookies` da lib o faria, e o scaffold não o chama no login).
- Cookies: `session-routes` grava refresh com `maxAge` (30 d) e access com `expiresIn`/900 s; a lib grava cookies de sessão sem `maxAge` ao renovar via `fetchWithSession`.
- Confira no backend os métodos HTTP aceitos (ex.: `PATCH` vs `PUT` em `/users/{publicId}`) contra `SecurityPaths`.
- Traduções `pt-BR`/`es`/`fr`/`pt-PT` são parciais (fallback para `en`).
