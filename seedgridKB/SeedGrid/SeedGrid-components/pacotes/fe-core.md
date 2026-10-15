---
tags: [seedgrid, front, pacote, fe-core]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-core
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# `@seedgrid/fe-core`

Infraestrutura comum dos pacotes front: contrato de manifesto de módulo para a CLI SeedGrid, registry de runtime, merge de i18n, estratégias de persistência, cliente HTTP (`createApiClient`) com refresh de token/retry, tratamento e extração de mensagens de erro (RFC 7807) e `useDebouncedValue`.

Relacionados: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]] · [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]] (usam `SeedGridCliModuleManifest`) · [[SeedGrid/SeedGrid-components/pacotes/fe-theme|@seedgrid/fe-theme]] (usa a persistência).

## Pacote

| Campo | Valor (Confirmado em `package.json`) |
|---|---|
| Nome / versão | `@seedgrid/fe-core` `2026.7.1` |
| `exports` | só `.` (não há subpath `./server`; `src/server.ts` é reexportado pelo barrel) |
| `peerDependencies` | `react ^18.2.0 \|\| ^19.0.0` |
| `dependencies` | nenhuma |
| Build | `tsc -p tsconfig.json && node scripts/build-ai-manifest.mjs` |
| Testes | `pnpm run build && node --test tests/api-errors.test.mjs` (não executados) — cobre `extractApiErrorMessage`, `readApiErrorMessage`, `isApiClientErrorLike`, `messageForHttpStatus` |

## API (barrel `src/index.ts`)

### Módulos e registry

| Export | Tipo | Fonte | Descrição |
|---|---|---|---|
| `SeedGridCliModuleManifest` | interface | `src/cli-module-manifest.ts` | Contrato lido pela **CLI SeedGrid (Rust)** para plugar um pacote `@seedgrid/fe-*` em um app gerado. Campos: `id`, `requires?: string[]`, `variantGroup?`, `configKey`, `env?: string[]`, `provider?: ImportRef[]`, `navigation?: ImportRef`, `messages?: ImportRef`, `postAuthResolver?: ImportRef` |
| `SeedGridCliModuleImportRef` | interface | idem | `{ import: string; from: string }` |
| `SeedGridProvider`, `SeedGridNavItem`, `SeedGridRoute` | tipos | `src/module.ts` | elementos aceitos pelo `SeedGridRegistry` (`SeedGridNavItem`: `id, labelKey, href, icon?, requiresAuth?, order?`; `SeedGridRoute`: `id, path, requiresAuth?`) |
| `SeedGridRegistry` | **classe** | `src/registry.ts` | `addProvider`, `addNavItem`, `addRoute`, `getProviders()`, `getNavItems()` (ordenado por `order`, padrão 999), `getRoutes()` |

Segundo o comentário de `cli-module-manifest.ts` (Confirmado): cada pacote exporta um `module` em `src/module.ts`, e um *postbuild* serializa para `dist/module.json`, único artefato lido pela CLI (ADR `seedgrid-cli/docs/adr/0004-module-manifest-contract.md`, **não analisado**). `postAuthResolver` = função `(permissions: Iterable<string>) => Promise<string|null> | string | null` registrada no `navigation.ts` do fe-security.

### i18n

| Export | Descrição |
|---|---|
| `SeedGridLocale` | `"pt-BR"` |
| `SeedGridMessages` | `Record<namespace, Record<chave, texto>>` |
| `mergeMessages(target, add)` | merge raso por namespace (o `add` vence) |

### Persistência — `src/persistence.ts`

| Export | Descrição |
|---|---|
| `PersistenceStrategy` | `{ load(key), save(key, state), clear(key) }` — síncrono ou `Promise` |
| `NamespaceProvider` | `{ getNamespace(): string \| null }` |
| `SgPersistenceRecordDTO` | `{ protocolVersion: 1, key, scope, stateVersion, updatedAt, state }` |
| `SgPersistenceMode` | `"strict" \| "fallback" \| "mirror"` |
| `SgPersistenceConfig` | `{ scope, mode, stateVersion }` |
| `SgEnvironmentValue` / `SgEnvironment` | `{ namespaceProvider, persistenceStrategy, persistence }` |
| `buildSgPersistenceKey(baseKey, namespace?, scope?)` | `null` se sem namespace; senão `sg:<ns>:<baseKey>` ou `sg:<ns>:<scope>:<baseKey>` |
| `createLocalStorageStrategy({prefix?})` | JSON em `localStorage`; erros silenciados (load → `null`) |
| `createApiPersistenceStrategy({baseUrl, fetcher?, scope, stateVersion})` | `GET {base}/sg/persistence?key=` (espera `{found, record}`), `POST {base}/sg/persistence` com `{record}`, `DELETE {base}/sg/persistence?key=`; lança `Error` em status não-OK |
| `createCompositePersistenceStrategy({mode, primary, secondary})` | `strict`: só primary; `fallback`: primary e, se lançar, secondary; `mirror`: load do primary (se `null`/erro → secondary), save/clear em ambos com `allSettled` |

**Lacuna**: o endpoint backend `/sg/persistence` não foi localizado nesta análise (lado Java/Rust fora do escopo F3).

### HTTP — `src/http/api-client.ts` (reexportado também por `src/server.ts`)

`createApiClient(config: ApiClientConfig)` → `{ request, get, post, put, patch, delete }` (todos `(path, options?) => Promise<T>`).

| `ApiClientConfig` | Tipo | Descrição |
|---|---|---|
| `baseUrl` | `string` | absoluta, ou relativa (prefixada com `window.location.origin`; no servidor usa `http://localhost:3000` — Confirmado em `resolveAbsoluteBase`) |
| `defaultHeaders` | `HeadersInit` | — |
| `defaultCache` | `RequestCache` | — |
| `defaultNext` | `{ revalidate?, tags? }` | opções `next` do fetch do Next.js |
| `getAccessToken` | `() => Promise<string\|null>` | Bearer quando `requireAuth` (padrão `true`) |
| `refreshAccessToken` | `() => Promise<string\|null>` | chamado **uma vez** em 401; `null` → `onAuthFailure` + erro |
| `onAuthFailure` | `(ctx) => void` | em 401 sem refresh possível |
| `onException` | `(error, ctx) => void` | antes do `captureException` global |

| `ApiRequestOptions` (além de `RequestInit`) | Padrão | Descrição |
|---|---|---|
| `body` | — | `BodyInit` passa direto; objeto → `JSON.stringify` + `Content-Type: application/json` |
| `query` | — | `Record<string, primitivo\|null\|undefined>`; nulos ignorados |
| `parseAs` | `"json"` | `"json"` (204 → `null`), `"text"`, `"response"` |
| `requireAuth` | `true` | — |
| `retry` | sem retry | `true` → 2 tentativas extras, 250 ms × (n+1), em `[429, 502, 503, 504]` e em `TypeError` (rede); objeto `{attempts?, baseDelayMs?, retryOn?}` |
| `captureExceptions` | `true` | `false` → `suppressException` |
| `next` | `config.defaultNext` | — |

`ApiClientError` (`name`, `status`, `responseBody`) é lançado para status não-OK.

**Pontos de atenção (Confirmado na leitura)**:
- `request` faz `console.log` do comando **curl completo, URL, método, body e headers** (inclui `Authorization: Bearer …`) a cada chamada, e de `response`/erros (`console.log('aqui ', response)`, `'chegou no catch '`); `readResponseBody` também loga o corpo. Isso expõe tokens e dados em logs do navegador/servidor.
- **Inferência**: para erros HTTP, `config.onException` pode ser chamado duas vezes — uma no bloco `try` e outra no `catch` que recaptura o próprio `ApiClientError` lançado (o `captureException` global é idempotente via `Symbol.for("seedgrid.captured_exception")`, mas `onException` não).

### Tratamento de exceções — `src/http/api-exception-handler.ts`

`ExceptionArea` (`api|client|server`), `ExceptionContext` (`area, source, status, retryable, metadata`), `ExceptionReporter`, `registerExceptionReporter(fn) => unregister`, `captureException(error, ctx)` (dedup por símbolo, `console.error("[seedgrid]", …)`, chama reporters), `runGuarded(action, ctx)`, `suppressException(error)`, `normalizeError(unknown)`.

### Mensagens de erro — `src/http/api-errors.ts`

| Export | Descrição |
|---|---|
| `extractApiErrorMessage(error)` | busca em largura na cadeia `responseBody/cause/error/data/body`; prioridade `violations[].message → errors[].message → userMessage → detail → message → error → title`; nunca devolve JSON cru |
| `readApiErrorMessage(body)` | mesma lógica para um corpo já em mãos (objeto ou string JSON) |
| `messageForHttpStatus(status)` | mensagens pt-BR para 400, 401, 403, 404, 408/504, 409, 422, 429, 503, ≥500 e genérica |
| `isApiClientErrorLike(error)` | *type guard* (qualquer objeto) |

### Hook
`useDebouncedValue<T>(value, delayMs, normalize?)` — `"use client"`; `src/useDebouncedValue.ts`.

## Exemplo
Fonte: `packages/seedgrid-fe-core/README.md` (registry/persistência) + API confirmada (cliente HTTP, montado a partir da API).

```ts
import {
  SeedGridRegistry, mergeMessages,
  createLocalStorageStrategy, createCompositePersistenceStrategy,
  createApiClient, extractApiErrorMessage
} from "@seedgrid/fe-core";

const registry = new SeedGridRegistry();
registry.addNavItem({ id: "marketing", labelKey: "menu.marketing", href: "/marketing", order: 10 });

const messages = mergeMessages({ app: { welcome: "Bem-vindo" } }, { app: { logout: "Sair" } });

const persistence = createCompositePersistenceStrategy({
  mode: "mirror",
  primary: createLocalStorageStrategy({ prefix: "sg:" }),
  secondary: createLocalStorageStrategy(),
});

const api = createApiClient({ baseUrl: "", getAccessToken: async () => null });
try {
  await api.get("/api/recurso", { retry: true, requireAuth: false });
} catch (e) {
  const msg = extractApiErrorMessage(e);
}
```

Marcadores `// seedgrid:managed` no topo de `api-client.ts`, `api-errors.ts`, `api-exception-handler.ts`, `server.ts` e `useDebouncedValue.ts`. **Inferência**: arquivos sincronizados/gerenciados pela CLI SeedGrid (não confirmado).
