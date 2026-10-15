---
tags: [seedgrid, front, modulo, fe-audit]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-audit
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-audit

Módulo front de **auditoria**: consulta somente-leitura do trilho de auditoria (audit log) com filtros e detalhe antes/depois. Compõe sobre o motor de sessão do [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Faz parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/audit/Visao-geral|extension audit]] — os paths batem com `java/seedgrid-quarkus-ext-audit/seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/controllers/RestControllerPath.java` (`/audit-logs`, `/{id}`, `/entities`, `/users`) (**Confirmado**). O README e o comentário de `src/paths.ts` citam o "Audit Log Controller do `seedgrid-report-api`" e a lib `seedgrid-quarkus-lib-audit`; a extension do monorepo expõe os mesmos paths.

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-audit` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| `files` | `dist` (sem `scaffold`) |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` → `dist/module.json` |
| `exports` | `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}` |

Dependência de módulo: **requer `security`** (usa `SecurityServer` e `PaginatedResult` de `@seedgrid/fe-security`).

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `AuditPaths` | const | `.` | `logs`, `entities`, `users`, `byId(id)` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-audit/src/paths.ts → AuditPaths` |
| `AuditOperation` | type | `.` | `"CREATE" \| "UPDATE" \| "DELETE" \| "READ" \| "OTHER"` | `.../src/audit.ts → AuditOperation` |
| `AuditLogEntry` | interface | `.` | Registro com `beforeState`/`afterState` (JSON serializado), origem, IP, user-agent, `metadata?` | `.../src/audit.ts → AuditLogEntry` |
| `AuditLogFilters` | interface | `.` | Filtros do `GET /audit-logs` + `page`/`size` | `.../src/audit.ts → AuditLogFilters` |
| `AuditLogEntityOption` | interface | `.` | `{ id; entity }` | `.../src/audit.ts → AuditLogEntityOption` |
| `AuditLogUserOption` | interface | `.` | `{ id; userName }` | `.../src/audit.ts → AuditLogUserOption` |
| `createAuditServer` | função | `./server` | `(session) => AuditServer` | `.../src/server/create-audit-server.ts → createAuditServer` |
| `AuditServer` | interface | `./server` | `searchLogs`, `listEntities`, `listUsers`, `getById` | `.../src/server/create-audit-server.ts → AuditServer` |

Contagem: `.` = 6; `./server` = 2.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` (tipo de [[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]): `id: "audit"`, `requires: ["security"]`, `configKey: "audit"`. Sem `navigation`, `messages`, `provider` (**Confirmado**, `src/module.ts`).

## Páginas, rotas e permissões

**Nenhuma tela.** Não há pasta `scaffold/`; as telas de lista/detalhe de auditoria não são entregues pelo pacote ou pelo CLI. Nenhuma permissão é referenciada no pacote.

## APIs backend chamadas (`createAuditServer`)

| Método | Path | Função |
|---|---|---|
| GET | `/audit-logs?<filtros>` | `searchLogs` (filtros não vazios viram query string) |
| GET | `/audit-logs/entities` | `listEntities` |
| GET | `/audit-logs/users` | `listUsers` |
| GET | `/audit-logs/{id}` | `getById` |

## Separação client/server

`.` só tipos/constantes; `./server` SERVER-ONLY (sessão do fe-security). Só leitura — nenhuma mutação.

## Configuração

Nenhuma variável de ambiente lida (verificado com `grep process.env`). Sem objetos de configuração.

## Exemplo (fonte: README)

```ts
import { createSecurityServer } from "@seedgrid/fe-security/server";
import { createAuditServer } from "@seedgrid/fe-audit/server";

const session = createSecurityServer({ /* ... */ });
export const audit = createAuditServer(session);
const page = await audit.searchLogs({ entity: "User", operation: "UPDATE", operationDateFrom: "2026-07-01", page: 0, size: 20 });
```

Sem consumidor em `apps/showcase`.

## Testes (não executados)

`tests/module-manifest.test.mjs` — valida `id`, `requires`, `configKey` de `dist/module.json`.

## Limitações

- Não há telas de busca/detalhe de auditoria no pacote (o `files` não inclui `scaffold`).
- As permissões de leitura do audit não são modeladas no front.

