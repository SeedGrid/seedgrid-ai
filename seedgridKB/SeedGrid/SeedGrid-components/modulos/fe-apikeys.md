---
tags: [seedgrid, front, modulo, fe-apikeys]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-apikeys
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-apikeys

Módulo front de **API keys**: gestão de chaves de integração criadas **por role**, com o segredo exibido uma única vez na criação. Compõe sobre o motor de sessão do [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Faz parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend correspondente: [[SeedGrid/Extensions/apikeys/Visao-geral|extension apikeys (Quarkus)]] — `ApiKeyPaths` é declarado como espelho de `RestControllerPath.java` da extensão (**Confirmado**: paths conferidos contra `java/seedgrid-quarkus-ext-apikeys/runtime/src/main/java/br/com/seedgrid/apikeys/controllers/RestControllerPath.java`).

## Pacote

| Item | Valor |
|---|---|
| Nome npm | `@seedgrid/fe-apikeys` |
| Versão | `2026.7.0` |
| `type` | `module` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| devDependencies | `@seedgrid/fe-core`, `@seedgrid/fe-security` (`workspace:*`) |
| `files` publicados | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json`; `postbuild` → `node scripts/emit-module-manifest.mjs` (gera `dist/module.json`) |
| Testes | `pnpm run build && node --test tests/module-manifest.test.mjs` |

Campo `exports` do `package.json` (**Confirmado**):

| Subpath | types | default | Natureza |
|---|---|---|---|
| `.` | `./dist/index.d.ts` | `./dist/index.js` | client-safe (DTOs + paths) |
| `./server` | `./dist/server/index.d.ts` | `./dist/server/index.js` | SERVER-ONLY |

Dependência de módulo: **requer `security`** (peer `@seedgrid/fe-security` + manifesto `requires: ["security"]`). Usa o tipo `SecurityServer` de [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]].

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `ApiKeyPaths` | const | `.` | Paths REST: `base`, `byRole(roleName)`, `revoke(publicId)` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-apikeys/src/paths.ts → ApiKeyPaths` |
| `ApiKeyCreateRequest` | interface | `.` | `{ name; expiresDays? }` (ausente = sem expiração) | `.../seedgrid-fe-apikeys/src/apikeys.ts → ApiKeyCreateRequest` |
| `ApiKeyCreateResponse` | interface | `.` | Resposta da criação; único momento em que `apiKey` (segredo cru) aparece | `.../src/apikeys.ts → ApiKeyCreateResponse` |
| `ApiKeyListItem` | interface | `.` | Item de listagem (só `prefix`/`masked`, `roleName`, `expiresAt`, `revokedAt`, `lastUsedAt`) | `.../src/apikeys.ts → ApiKeyListItem` |
| `ApiKeyRevokeResponse` | interface | `.` | `{ publicId; revokedAt }` | `.../src/apikeys.ts → ApiKeyRevokeResponse` |
| `createApiKeysServer` | função | `./server` | `(session: SecurityServer) => ApiKeysServer` | `.../src/server/create-apikeys-server.ts → createApiKeysServer` |
| `ApiKeysServer` | interface | `./server` | `createForRole`, `listByRole`, `listMine`, `revoke` | `.../src/server/create-apikeys-server.ts → ApiKeysServer` |

Contagem: `.` = 5 exports; `./server` = 2 exports. `module` (manifesto) existe em `src/module.ts` mas **não** é reexportado pelo barrel — só é serializado em `dist/module.json`.

## Registro no @seedgrid/fe-core (manifesto do CLI)

Não há registro em runtime. O módulo exporta um `SeedGridCliModuleManifest` (tipo de [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]], `packages/seedgrid-fe-core/src/cli-module-manifest.ts`) que o build serializa em `dist/module.json`, lido pelo SeedGrid CLI (Rust) para copiar o scaffold e fazer o wiring (**Confirmado**).

| Campo | Valor |
|---|---|
| `id` | `api-keys` |
| `requires` | `["security"]` |
| `configKey` | `api-keys` |
| `navigation` / `messages` / `provider` | não declarados |

Comentário em `src/module.ts`: o item de menu e o atalho de dashboard de API keys vivem no scaffold do fe-security (`useSecurityAppShellSections.tsx`/`SecurityDashboard.tsx`), condicionados por `{{#if security_api_keys_enabled}}` (dirigido por `config.is_module_enabled("api-keys")`). **Confirmado** (comentário no código); o template do fe-security não foi verificado aqui.

## Páginas (scaffold) e permissões

| Rota | Arquivo | Permissões |
|---|---|---|
| `/security/api-keys` | `scaffold/src/app/security/api-keys/page.tsx → ApiKeysPage` | `RouteGuard` com `APIKEY_READ`, `APIKEY_CREATE`, `APIKEY_REVOKE` (`permissionMode="any"`); ações individuais via `usePermission` |

A tela importa `securityService`, `securityConfig`, `RouteGuard` etc. de `@/modules/security` (scaffold do fe-security) — **não** usa `createApiKeysServer` nem os DTOs deste pacote (**Confirmado**). Usa componentes `SgButton`, `SgCombobox`, `SgConfirmationDialog`, `SgDatatable`, `SgInputText`.

## APIs backend chamadas

Via `createApiKeysServer` (lib, `session.apiFetchSecurity`):

| Método | Path | Função |
|---|---|---|
| POST | `/apikeys/role/{roleName}` | `createForRole` |
| GET | `/apikeys/role/{roleName}` | `listByRole` |
| GET | `/apikeys` | `listMine` |
| POST | `/apikeys/{publicId}/revoke` | `revoke` |

Via scaffold (`securityService` do fe-security): os mesmos 4 + `GET /roles/integration` (`listIntegrationRoles`) — 5 endpoints distintos no total. No backend, `GET /apikeys` é `ApiKeyManagementController#listCurrentUserKeys` (aceita `page`/`size`), `@PermissionsAllowed("APIKEY_READ")` (**Confirmado**).

## Separação client/server

- `.`: só tipos e constantes — seguro no client.
- `./server`: depende de `SecurityServer` (sessão por cookie, server-side). Usar em Route Handler/Server Action.

## Configuração

Nenhuma variável de ambiente lida (verificado com `grep process.env` em `src/` e `scaffold/`). Nenhum objeto de configuração próprio; a tela usa `securityConfig.pagination.defaultPageSize` do fe-security.

## Exemplo de uso (fonte: README do pacote)

```ts
import { createSecurityServer } from "@seedgrid/fe-security/server";
import { createApiKeysServer } from "@seedgrid/fe-apikeys/server";

const session = createSecurityServer({ /* ... */ });
export const apiKeys = createApiKeysServer(session);

const nova = await apiKeys.createForRole("INTEGRATION", { name: "Integração ERP", expiresDays: 90 });
const chaves = await apiKeys.listByRole("INTEGRATION");
await apiKeys.revoke(chaves[0].publicId);
```

Nenhum consumidor em `apps/showcase` (verificado por grep).

## Testes (não executados)

- `tests/module-manifest.test.mjs`: verifica `id`, `requires`, `configKey` do `dist/module.json` (exige build prévio).

## Limitações

- O segredo da chave criada vem no campo `apiKey` da resposta (`ApiKeyCreateResponse`); o scaffold do fe-security tipa `key?`, então leia `apiKey`.
- O backend expõe também `GET /apikeys/roles` e `GET /apikeys/me`, sem constante em `ApiKeyPaths`.

