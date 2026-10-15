---
tags: [seedgrid, front, modulo, fe-self-enter]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-self-enter
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-self-enter

Módulo front de **auto-cadastro de usuário** (self-enter): pedido público de acesso (nome/e-mail/senha) com confirmação de e-mail, convites de administrador e fila de aprovação. Não confundir com o cadastro de **empresa** ([[SeedGrid/SeedGrid-components/modulos/fe-login-tenancy|fe-login-tenancy]] / [[SeedGrid/SeedGrid-components/modulos/fe-subdomain-tenancy|fe-subdomain-tenancy]]). Compõe sobre o [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: **extension security**, não uma extension própria — [[SeedGrid/Extensions/security/Visao-geral|extension security]]. **Confirmado**: o engine usa `SecurityPaths.selfEnter` (fe-security), cujos valores batem com `RestControllerPath` de `java/seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/controllers/` (`SELF_ENTER*`), atendidos por `SelfEnterController`; a feature tem config própria (`SelfEnterConfig`). Modos no backend: `disabled` / `invite-only` / `public` (segundo comentário de `src/self-enter.ts`; **Não confirmado** aqui no Java).

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-self-enter` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` |
| `exports` | `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}` |

Dependência de módulo: **requer `security`** — inclusive em runtime (importa o valor `SecurityPaths` de `@seedgrid/fe-security`).

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `EntryRequestOrigin` | type | `.` | `"INVITE" \| "PUBLIC"` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-self-enter/src/self-enter.ts → EntryRequestOrigin` |
| `EntryRequestStatus` | type | `.` | `PENDING_EMAIL`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `EXPIRED` | `.../src/self-enter.ts → EntryRequestStatus` |
| `CreateEntryRequest` | interface | `.` | `{ name; email; password }` | `.../src/self-enter.ts` |
| `EntryRequestResponse` | interface | `.` | Pedido (status, aprovado/rejeitado por/quando, convite) | `.../src/self-enter.ts` |
| `CreateEntryInvitation` | interface | `.` | `{ email; name; roles? }` (`roles` vazio → `default-role` do backend) | `.../src/self-enter.ts` |
| `EntryInvitationResponse` | interface | `.` | Convite | `.../src/self-enter.ts` |
| `CompleteEntryInvitation` | interface | `.` | `{ name; email; password }` | `.../src/self-enter.ts` |
| `createSelfEnterServer` | função | `./server` | `(session) => SelfEnterServer` | `.../src/server/create-self-enter-server.ts → createSelfEnterServer` |
| `SelfEnterServer` | interface | `./server` | 5 métodos públicos + 6 de admin | idem |

Contagem: `.` = 7; `./server` = 2. Os paths **não** são exportados aqui (ficam em `SecurityPaths.selfEnter`).

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]): `id: "self-enter"`, `requires: ["security"]`, `configKey: "self-enter"`. Sem `navigation`/`messages`/`provider`: menu e atalho de dashboard vivem no scaffold do fe-security, condicionados por `{{#if security_self_enter_enabled}}` (`config.is_module_enabled("self-enter")`) — **Confirmado** pelo comentário de `src/module.ts`. As chaves i18n usadas (`security.self_enter.*`) também pertencem ao fe-security.

## Páginas (scaffold) e permissões

| Rota | Arquivo | Permissão |
|---|---|---|
| `/auth/self-enter` (público; `?token=` = modo convite) | `scaffold/src/app/auth/self-enter/page.tsx` | nenhuma; bloqueado se `securityConfig.features.selfEnterEnabled` for falso (exceto modo convite); sucesso redireciona para `securityConfig.routes.login` após 1,2 s |
| `/self-enter/invitations` | `scaffold/src/app/self-enter/invitations/page.tsx` | `SELFENTER_INVITE` |
| `/self-enter/requests/to-approve` | `scaffold/src/app/self-enter/requests/to-approve/page.tsx` | `SELFENTER_APPROVE` ou `SELFENTER_REJECT` (`permissionMode="any"`) |

As telas usam `securityService` do scaffold do fe-security (`createSelfEnterRequest`, `confirmSelfEnterRequestEmail`, `getSelfEnterInvitation`, `listSelfEnterInvitationsPage`, `approveSelfEnterRequest`…), e não `createSelfEnterServer`. Código de confirmação: 6 caracteres (`SgInputOTP`, máscara `### ###`).

## APIs backend chamadas (`createSelfEnterServer`)

| Método | Path | Função | Autenticação |
|---|---|---|---|
| POST | `/public/self-enter/requests` | `submitRequest` | pública |
| POST | `/public/self-enter/requests/{id}/confirm-email` | `confirmEmail` | pública |
| POST | `/public/self-enter/requests/{id}/resend-email` | `resendEmail` | pública |
| GET | `/public/self-enter/invitations/{token}` | `getInvitation` | pública |
| POST | `/public/self-enter/invitations/{token}/complete` | `completeInvitation` | pública |
| GET | `/self-enter/requests/to-approve` | `listToApprove` | sessão admin |
| POST | `/self-enter/requests/{id}/approve` | `approve` | sessão admin |
| POST | `/self-enter/requests/{id}/reject` | `reject` | sessão admin |
| POST | `/self-enter/invitations` | `createInvitation` | sessão admin |
| GET | `/self-enter/invitations` | `listInvitations` | sessão admin |
| POST | `/self-enter/invitations/{id}/resend` | `resendInvitation` | sessão admin |

11 endpoints.

## Separação client/server

`.` só tipos; `./server` SERVER-ONLY (sobre `SecurityServer.apiFetchSecurity`).

## Configuração

Nenhuma variável de ambiente lida pelo pacote nem pelo seu scaffold (verificado com `grep process.env`). Dependência indireta: a tela pública consulta `securityConfig.features.selfEnterEnabled`, que no scaffold do fe-security vem de `process.env.NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED` (build, NEXT_PUBLIC inline) — documentado em [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]].

## Exemplo (fonte: README)

```ts
import { createSelfEnterServer } from "@seedgrid/fe-self-enter/server";
const selfEnter = createSelfEnterServer(session);
await selfEnter.createInvitation({ name: "Maria", email: "maria@empresa.com" });
const pendentes = await selfEnter.listToApprove();
await selfEnter.approve(pendentes[0].id);
```

Sem consumidor em `apps/showcase`.

## Testes (não executados)

`tests/module-manifest.test.mjs` — `id`, `requires`, `configKey`.

## Limitações

- A tela de convites não envia `CreateEntryInvitation.roles`.
- `SecurityPaths.selfEnter.requestById` e o endpoint `public-link` do backend (`SELF_ENTER_PUBLIC_LINK`) não são usados pelo engine.
- `confirmEmail`/`approve`/`reject` aceitam `body?: unknown` (corpo sem tipagem).

