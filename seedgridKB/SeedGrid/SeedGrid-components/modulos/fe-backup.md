---
tags: [seedgrid, front, modulo, fe-backup]
fonte: front/seedgrid-fe-components/packages/modules/seedgrid-fe-backup
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# @seedgrid/fe-backup

Módulo front de **backup/exportação de dados**: cria jobs de export, acompanha o status com polling, baixa o ZIP gerado e remove jobs. Compõe sobre o motor de sessão do [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]]. Parte dos [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

Backend: [[SeedGrid/Extensions/backup/Visao-geral|extension backup]] — `BackupPaths` espelha `java/seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/controllers/RestControllerPath.java` (`/exports`, `/exports/{jobId}`, `/exports/{jobId}/download`) (**Confirmado**). O `scaffold/README.md` registra que `BackupFormat` e `ArtifactInfo.id` foram corrigidos contra `BackupFormat.java`/`ExportResponse.java` reais.

## Pacote

| Item | Valor |
|---|---|
| Nome npm / versão | `@seedgrid/fe-backup` `2026.7.0` |
| peerDependencies | `@seedgrid/fe-core: *`, `@seedgrid/fe-security: *` |
| `files` | `dist`, `scaffold` |
| Build | `tsc -p tsconfig.json` + `postbuild` `emit-module-manifest.mjs` → `dist/module.json` |
| Test (script) | `pnpm run build && node --test tests/module-manifest.test.mjs tests/export-status.test.mjs` |
| `exports` | `.` → `./dist/index.{d.ts,js}`; `./server` → `./dist/server/index.{d.ts,js}` |

Dependência de módulo: **requer `security`**.

## Exports públicos

| Export | Tipo | Subpath | Descrição | Fonte |
|---|---|---|---|---|
| `BackupPaths` | const | `.` | `exports`, `byId(jobId)`, `download(jobId)` | `front/seedgrid-fe-components/packages/modules/seedgrid-fe-backup/src/paths.ts → BackupPaths` |
| `BackupFormat` | type | `.` | `"CSV_ZIP" \| "SQL_DUMP_ZIP"` | `.../src/backup.ts → BackupFormat` |
| `ExportScope` | type | `.` | `"CUSTOM" \| "DOMAIN" \| "RAW"` | `.../src/backup.ts → ExportScope` |
| `ExportStatus` | type | `.` | `REQUESTED`, `QUEUED`, `RUNNING`, `DONE`, `DONE_NOTIFIED`, `FAILED`, `CANCELLED`, `EXPIRED` | `.../src/backup.ts → ExportStatus` |
| `ExportRequest` | interface | `.` | `{ format; scope; includeAttachments?; options? }` | `.../src/backup.ts → ExportRequest` |
| `ArtifactInfo` | interface | `.` | Artefato (`id: number`, `filename`, `sizeBytes`, `sha256`…) | `.../src/backup.ts → ArtifactInfo` |
| `ExportResponse` | type | `.` | Status/resultado do job (`progress`, `downloadable`, `artifacts`…) | `.../src/backup.ts → ExportResponse` |
| `ExportStatusGroup` | type | `.` | `"pending" \| "running" \| "done" \| "failed" \| "terminal"` | `.../src/export-status.ts → ExportStatusGroup` |
| `classifyExportStatus` | função | `.` | Mapeia `ExportStatus` → grupo | `.../src/export-status.ts → classifyExportStatus` |
| `isExportInProgress` | função | `.` | `REQUESTED`/`QUEUED`/`RUNNING` | `.../src/export-status.ts → isExportInProgress` |
| `isExportDownloadable` | função | `.` | `DONE`/`DONE_NOTIFIED` | `.../src/export-status.ts → isExportDownloadable` |
| `backupMessages` | const | `.` | i18n: `en`, `es`, `fr`, `pt-BR`, `pt-PT` (merge sobre `en`) | `.../src/messages.ts → backupMessages` |
| `createBackupServer` | função | `./server` | `(session) => BackupServer` | `.../src/server/create-backup-server.ts → createBackupServer` |
| `BackupServer` | interface | `./server` | `createExport`, `listExports`, `getExportStatus`, `deleteExport`, `downloadExport` (devolve `Response` cru via `session.fetchWithSession`) | `.../src/server/create-backup-server.ts → BackupServer` |

Contagem: `.` = 12; `./server` = 2.

## Registro no @seedgrid/fe-core (manifesto do CLI)

`SeedGridCliModuleManifest` ([[SeedGrid/SeedGrid-components/pacotes/fe-core|@seedgrid/fe-core]]), `src/module.ts` (**Confirmado**):

| Campo | Valor |
|---|---|
| `id` / `configKey` | `backup` / `backup` |
| `requires` | `["security"]` |
| `navigation` | `{ import: "useBackupAppShellSections", from: "@/modules/backup" }` |
| `messages` | `{ import: "backupMessages", from: "@seedgrid/fe-backup" }` |
| `provider` | ausente |

Menu (`scaffold/src/modules/backup/useBackupAppShellSections.tsx`): seção `backup` (order 50) → item `backup-management` → filho `backup-exports` (`/backup/exports`), visível só com `JOB_READ`.

## Páginas (scaffold) e permissões

| Rota | Arquivo | Permissão |
|---|---|---|
| `/backup/exports` | `scaffold/src/app/backup/exports/(list)/page.tsx` | `RouteGuard` `JOB_READ`; polling a cada `backupConfig.polling.intervalMs` |
| `/backup/exports/new` | `scaffold/src/app/backup/exports/(create)/new/page.tsx` | `RouteGuard` `JOB_CREATE` |
| `GET /api/backup/exports/[jobId]/download` (Route Handler) | `scaffold/src/app/api/backup/exports/[jobId]/download/route.ts → GET` | repassa `Authorization`/`Cookie` ao backend; 404/410/502 mapeados |

Scaffold extra: `modules/backup/config.ts` (`backupConfig`), `services/backup-api.ts` (`configureBackupApi`, `extractBackupApiMessage`, `isApiClientError`), `services/backup-service.ts` (`backupService`), `components/ExportStatusBadge.tsx`, `types.ts` (reexporta a lib).

## APIs backend chamadas

| Método | Path | Onde |
|---|---|---|
| POST | `/exports` | `createExport` (lib) / `backupService.createExportJob` (scaffold) |
| GET | `/exports` (scaffold envia `?page=&size=`) | `listExports` / `listExportJobs` |
| GET | `/exports/{jobId}` | `getExportStatus` |
| DELETE | `/exports/{jobId}` | `deleteExport` / `deleteExportJob` |
| GET | `/exports/{jobId}/download` | `downloadExport` / Route Handler de download |

5 endpoints.

## Separação client/server

- Lib `.`: tipos, helpers puros e mensagens — client-safe. `./server`: SERVER-ONLY.
- Scaffold client: `backupConfig.apiBaseUrl` = `"/api"` quando `window` existe (proxy Next.js "para evitar CORS"); no server usa `appEnvironment.hosts.apiOrigin` (de `@/config/environment` do app).

## Configuração

Nenhuma variável de ambiente lida diretamente (verificado com `grep process.env`). Há um objeto de configuração no scaffold:

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `backupConfig.apiBaseUrl` | string | URL ou `/api` | `"/api"` no browser; `appEnvironment.hosts.apiOrigin` no server | Não (calculado) | Base do `createApiClient` do scaffold | `backup-api.ts → privateClient` | depende de `@/config/environment` (app) | runtime client / runtime server | `scaffold/src/modules/backup/config.ts → resolveApiBaseUrl` |
| `backupConfig.pagination.defaultPageSize` | number | inteiro | `10` | Não | Tamanho de página inicial | telas de lista | — | runtime client | `scaffold/.../config.ts → backupConfig` |
| `backupConfig.pagination.pageSizeOptions` | number[] | inteiros | `[10, 20, 50]` | Não | Opções do paginador | telas de lista | — | runtime client | idem |
| `backupConfig.polling.intervalMs` | number | ms | `5000` | Não | Intervalo de polling dos jobs em andamento | `(list)/page.tsx` | `isExportInProgress` | runtime client | idem |
| `backupConfig.routes.exports` | string | rota | `"/backup/exports"` | Não | Rota da lista / menu | `useBackupAppShellSections` | — | runtime client | idem |
| `backupConfig.routes.newExport` | string | rota | `"/backup/exports/new"` | Não | Rota de criação | telas | — | runtime client | idem |

`appEnvironment.hosts.apiOrigin` vem do app/fe-security (não deste pacote) — ver [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]].

## Exemplo (fonte: README)

```ts
import { createBackupServer } from "@seedgrid/fe-backup/server";
const backup = createBackupServer(session);
const job = await backup.createExport({ format: "CSV_ZIP", scope: "DOMAIN" });
const status = await backup.getExportStatus(job.jobId);
```

```ts
import { classifyExportStatus, isExportDownloadable } from "@seedgrid/fe-backup";
```

Sem consumidor em `apps/showcase`.

## Testes (não executados)

- `tests/module-manifest.test.mjs`: `id`, `requires`, `configKey`, `messages`, `navigation`, `provider === undefined`.
- `tests/export-status.test.mjs`: classificação dos 8 status, `isExportInProgress`, `isExportDownloadable`.
- Scaffold (Vitest + Testing Library): `page.test.tsx` (lista e criação), `ExportStatusBadge.test.tsx`, `backup-api.test.ts`, `backup-service.test.ts`, `useBackupAppShellSections.test.tsx`.

## Limitações

- O client chama `/api/exports...`; o scaffold só traz o proxy de download, então o app precisa de um proxy genérico `/api/*`.
- `configureBackupApi` não é chamado no scaffold: ligue o token no seu app.
- `ExportStatusGroup` assume `pending`, `running`, `done`, `failed` ou `terminal`.

