---
tags: [seedgrid, front, component, providers]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/environment, front/seedgrid-fe-components/packages/seedgrid-fe-components/src/realtime
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Providers (ambiente/persistência e realtime) (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API — providers de ambiente e realtime — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/providers/API|API — Providers (ambiente/persistência e realtime) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/providers/Exemplos|Exemplos dos providers]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

## SgEnvironmentProvider

Provider de namespace, escopo e estratégia de persistência usados pelos componentes SeedGrid. Fonte: `src/environment/SgEnvironmentProvider.tsx` → `SgEnvironmentProvider`; tipos em `src/environment/persistence.ts`.

### Import

```tsx
import {
  SgEnvironmentProvider,
  useSgEnvironment,
  useSgNamespaceProvider,
  useSgPersistence,
  useSgPersistentState,
  buildSgPersistenceKey,
  createLocalStorageStrategy,
  createApiPersistenceStrategy,
  createCompositePersistenceStrategy,
  type SgEnvironmentValue,
  type PersistenceStrategy,
  type NamespaceProvider
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `Partial<SgEnvironmentValue>` | — | Não | Sobrescritas parciais do ambiente (`namespaceProvider`, `persistenceStrategy`, `persistence.scope/mode/stateVersion`); cada campo ausente cai no padrão interno (namespace vazio, localStorage, `app:unknown`, `fallback`, `1`). |
| `children` | `React.ReactNode` | — | Sim | Arvore que consome o contexto de ambiente. |

- Tipo de props declarado inline na assinatura de `SgEnvironmentProvider` (não há tipo `SgEnvironmentProviderProps` exportado).

Resolução de `value` (Confirmado, `useMemo` do provider): cada campo é resolvido isoladamente com `??`.

| Campo de `value` | Tipo | Padrão quando ausente |
|---|---|---|
| `namespaceProvider` | `NamespaceProvider` | `{ getNamespace: () => "" }` |
| `persistenceStrategy` | `PersistenceStrategy` | `createLocalStorageStrategy()` (sem prefixo) |
| `persistence.scope` | `string` | `"app:unknown"` |
| `persistence.mode` | `SgPersistenceMode` | `"fallback"` |
| `persistence.stateVersion` | `number` | `1` |

O valor do contexto só é recriado quando muda uma dessas cinco referências (dependências do `useMemo`).

### Eventos e callbacks

Nenhum evento próprio. Os callbacks relevantes estão nas estratégias (`load`/`save`/`clear`) — ver tipos abaixo.

### Ref

Não aceita `ref` (função simples, sem `forwardRef`).

### Children, slots e composição

`children` obrigatório: a árvore que consome o contexto. Pode ser aninhado; o provider mais próximo vence (contexto React). Componentes que leem este contexto: `SgFloatActionButton`, `SgCard`, `SgMenu`, `SgToolBar`, `SgDockMenu`, `SgDockLayout` (Confirmado por import).

### Contexto, providers e hooks

Contexto interno `SgEnvironmentContext` (não exportado). Hooks exportados:

| Hook | Assinatura | Retorno / comportamento (Confirmado) |
|---|---|---|
| `useSgEnvironment` | `(): SgEnvironmentValue` | Contexto do provider mais próximo ou o ambiente padrão (namespace `""`, localStorage, `app:unknown`/`fallback`/`1`). |
| `useSgNamespaceProvider` | `(): NamespaceProvider` | `useSgEnvironment().namespaceProvider`. |
| `useSgPersistence` | `(): { namespace: string \| null; scope: string; mode: SgPersistenceMode; stateVersion: number; load(baseKey: string): Promise<unknown>; save(baseKey: string, state: unknown): Promise<void>; clear(baseKey: string): Promise<void> }` | Calcula a chave com `buildSgPersistenceKey(baseKey, namespace, scope)`; se a chave for `null` (namespace vazio) `load` retorna `null` e `save`/`clear` não fazem nada. `load/save/clear` são memoizados por estratégia, namespace e scope. |
| `useSgPersistentState<T>` | `(args: { baseKey: string; defaultValue: T; serialize?: (value: T) => unknown; deserialize?: (value: unknown) => T }): { value: T; setValue: (next: T \| ((prev: T) => T)) => void; clear: () => Promise<void>; hydrated: boolean }` | Começa com `defaultValue` e `hydrated=false`; no mount carrega (com provider: `useSgPersistence().load(baseKey)`; sem provider: `localStorage.getItem(baseKey)` + `JSON.parse`), aplica `deserialize` se o valor não for `null/undefined` e marca `hydrated=true` (em erro volta ao `defaultValue`). Depois de hidratado, cada mudança de `value` é salva (com provider: `save(baseKey, serialize(value))`; sem provider: `localStorage.setItem(baseKey, JSON.stringify(value))`, sem `serialize`). `clear` limpa e volta ao `defaultValue`. |

Observação (Inferência): o efeito de carregamento depende de `defaultValue` e `deserialize`; passar um objeto/função novo a cada render provoca recarga. `serialize`/`deserialize` são memoizados pela referência recebida.

### Funções e tipos de persistência (exportados)

| Símbolo | Assinatura | Comportamento (Confirmado — `src/environment/persistence.ts`) |
|---|---|---|
| `buildSgPersistenceKey` | `(baseKey: string, namespace?: string \| null, scope?: string \| null) => string \| null` | `null` se namespace vazio; `sg:<namespace>:<baseKey>` se scope vazio (após `trim`); senão `sg:<namespace>:<scope>:<baseKey>`. |
| `createLocalStorageStrategy` | `(options?: { prefix?: string }) => PersistenceStrategy` | `window.localStorage` com `JSON.stringify/parse`; chave = `prefix + key`; erros engolidos (`load` → `null`). |
| `createApiPersistenceStrategy` | `(args: { baseUrl: string; fetcher?: (input: RequestInfo \| URL, init?: RequestInit) => Promise<Response>; scope: string; stateVersion: number }) => PersistenceStrategy` | `load`: `GET {baseUrl}/sg/persistence?key=…` → espera `{ found?: boolean; record?: SgPersistenceRecordDTO }` e devolve `record.state` ou `null`. `save`: `POST {baseUrl}/sg/persistence` com corpo `{ record }` (`protocolVersion: 1`, `key`, `scope`, `stateVersion`, `updatedAt` ISO, `state`). `clear`: `DELETE {baseUrl}/sg/persistence?key=…`. Resposta não-OK lança `Error("SG persistence <op> failed (<status>)")`. Barra final de `baseUrl` é removida; `fetcher` padrão = `fetch` global. |
| `createCompositePersistenceStrategy` | `(args: { mode: SgPersistenceMode; primary: PersistenceStrategy; secondary: PersistenceStrategy }) => PersistenceStrategy` | `strict`: só a primária. `fallback`: primária; se lançar, secundária. `mirror`: `load` tenta a primária e usa a secundária se der erro ou vier `null/undefined`; `save`/`clear` em ambas com `Promise.allSettled`. |
| `resolvePersistedStateValue<T>` | `(args: { loaded: unknown; defaultValue: T; deserialize: (value: unknown) => T }) => T` | `defaultValue` se `loaded` é `null/undefined`; senão `deserialize(loaded)`. |
| `readLocalPersistentState<T>` | `(args: { storage: Pick<Storage, "getItem">; baseKey: string; defaultValue: T; deserialize: (value: unknown) => T }) => T` | Lê e faz `JSON.parse`; ausência ou erro → `defaultValue`. |
| `writeLocalPersistentState<T>` | `(args: { storage: Pick<Storage, "setItem">; baseKey: string; value: T }) => void` | `setItem(baseKey, JSON.stringify(value))` (pode lançar). |
| `clearLocalPersistentState<T>` | `(args: { storage: Pick<Storage, "removeItem">; baseKey: string; defaultValue: T }) => T` | `removeItem(baseKey)` e devolve `defaultValue`. |

| Tipo | Definição (Confirmado) |
|---|---|
| `NamespaceProvider` | `{ getNamespace: () => string \| null }` |
| `PersistenceStrategy` | `{ load: (key: string) => unknown \| Promise<unknown>; save: (key: string, state: unknown) => void \| Promise<void>; clear: (key: string) => void \| Promise<void> }` |
| `SgPersistenceMode` | `"strict" \| "fallback" \| "mirror"` |
| `SgPersistenceConfig` | `{ scope: string; mode: SgPersistenceMode; stateVersion: number }` |
| `SgEnvironmentValue` | `{ namespaceProvider: NamespaceProvider; persistenceStrategy: PersistenceStrategy; persistence: SgPersistenceConfig }` |
| `SgEnvironment` | alias de `SgEnvironmentValue` |
| `SgPersistenceRecordDTO` | `{ protocolVersion: 1; key: string; scope: string; stateVersion: number; updatedAt: string; state: unknown }` |

### Acessibilidade

Não se aplica (não renderiza DOM; só `Context.Provider`).

## SgRealtimeProvider

Avisos em tempo real para o usuário logado pelo SeedGrid Pulse. Fonte: `src/realtime/SgRealtimeProvider.tsx` → `SgRealtimeProvider`, `useSgRealtimeEvent`, `useSgRealtimeStatus`, `matchesSgRealtimeEvent`.

### Import

```tsx
import {
  SgRealtimeProvider,
  useSgRealtimeEvent,
  useSgRealtimeStatus,
  matchesSgRealtimeEvent,
  type SgRealtimeProviderProps,
  type SgRealtimeStatus,
  type SgRealtimeEvent,
  type SgRealtimeConnectResponse
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | — | Sim | Arvore que ouve os avisos com useSgRealtimeEvent. |
| `channels` | `string[]` | — | Sim | Channels que a tela quer ouvir (ex.: `["backup"]`). |
| `tokenEndpoint` | `string` | `"/api/realtime/connect"` (`DEFAULT_TOKEN_ENDPOINT`) | Não | Rota que entrega o token de conexão do usuário logado. Default: `/api/realtime/connect` (a BFF, na mesma origem — o navegador manda o cookie da sessão). |
| `tokenRequestInit` | `RequestInit` | — | Não | Opções do `fetch` do token (ex.: `headers: { Authorization: ... }` quando não há cookie). |
| `fetchToken` | `() => Promise<SgRealtimeConnectResponse>` | — | Não | Substitui o pedido de token inteiro (apps sem BFF, testes). |
| `pulseUrl` | `string` | — | Não | Endereço do Pulse, usado quando o token não traz `connectUrl` (Pulse sem endereço público). |
| `enabled` | `boolean` | `true` | Não | Liga/desliga (ex.: `false` enquanto não há usuário logado). Default: `true`. |
| `connectOptions` | `Omit<ConnectInput, "getToken" \| "accountKey" \| "baseUrl">` | — | Não | Opções avançadas do cliente do Pulse (reconexão, `webSocketImpl` em testes...). |

`ConnectInput` vem de `@seedgrid/pulse-subscriber-react/core` (v3.0.0 instalada). Campos que restam após o `Omit` (lidos em `dist/core.d.ts` do pacote): `protocolVersion?` (padrão 1), `reconnect?: ReconnectOptions`, `auth?: PulseAuthOptions`, `connectPath?` (padrão `/api/v1/connect`), `webSocketImpl?`, `wsOptions?`, `connectTimeoutMs?` (padrão 10000), `logger?`. O provider sempre injeta `getToken` e, se informado, `baseUrl = pulseUrl`.

### Eventos e callbacks

- `fetchToken()` — chamado na conexão e em cada reconexão (o primeiro token é reaproveitado uma única vez). Sem `fetchToken`, o provider faz `fetch(tokenEndpoint, { method: "POST", credentials: "same-origin", ...tokenRequestInit })`; HTTP não-OK lança erro → status `unavailable`.
- Resposta `enabled: false` ou sem `token` → status `disabled` e nenhuma conexão.
- Mensagens recebidas viram `SgRealtimeEvent` e são entregues a todos os listeners; exceção num handler não afeta os demais.

### Ref

Não aceita `ref`.

### Children, slots e composição

`children` obrigatório. Montar uma vez (ex.: no layout autenticado). Sem `channels` (array vazio) ou com `enabled=false` não conecta (status `idle` ou `disabled`, respectivamente). Em SSR (`typeof window === "undefined"`) não conecta.

### Contexto, providers e hooks

Contexto interno `SgRealtimeContext` (`{ status, addListener }`, não exportado).

| Símbolo | Assinatura | Comportamento (Confirmado) |
|---|---|---|
| `useSgRealtimeEvent` | `(channel: string, events: string \| string[], handler: (event: SgRealtimeEvent) => void) => void` | Registra listener enquanto montado; chama `handler` quando `event.channel === channel` e o nome casa algum padrão de `events`. Usa sempre o `handler` mais recente (ref). Fora do provider, não faz nada. |
| `useSgRealtimeStatus` | `() => { status: SgRealtimeStatus; connected: boolean }` | `connected = status === "connected"`; fora do provider, `status = "disabled"`. |
| `matchesSgRealtimeEvent` | `(pattern: string, event: string) => boolean` | `true` para `"*"`, nome idêntico ou `prefixo.*` (casa nomes que começam com `prefixo.`). |

| Tipo | Definição (Confirmado) |
|---|---|
| `SgRealtimeStatus` | `"idle" \| "disabled" \| "connecting" \| "connected" \| "reconnecting" \| "unavailable" \| "auth-error"` — JSDoc: fora de `connected`, a tela deve usar polling. |
| `SgRealtimeConnectResponse` | `{ enabled: boolean; token?: string; expiresAt?: number /* segundos desde a época */; connectUrl?: string }` — campos da resposta do `POST /realtime/connect` das extensões de realtime que o provider lê (Confirmado). |
| `SgRealtimeEvent` | `{ channel: string; event: string; data: unknown; messageId: string; publishedAt: string }` — JSDoc: `data` só traz identificadores; buscar o registro pela API. |

### Acessibilidade

Não se aplica (não renderiza DOM).
