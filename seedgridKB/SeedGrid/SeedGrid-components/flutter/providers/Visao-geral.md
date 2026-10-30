---
description: "Providers (ambiente/persistência e realtime) em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, providers]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Providers (ambiente/persistência e realtime) — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers (ambiente/persistência e realtime) — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/providers/API|API — Providers (ambiente/persistência e realtime) (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos|Exemplos — Providers (ambiente/persistência e realtime) (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

2 componente(s): **2 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgEnvironmentProvider` | portado | Fornece namespace, estratégia e configuração de persistência à árvore. | `pages/sg_environment_provider_page.dart` |
| `SgRealtimeProvider` | portado | Avisos em tempo real do Pulse para o usuário logado, com status e reconexão. | `pages/sg_realtime_provider_page.dart` |

## Quando usar

- `SgEnvironmentProvider`: uma vez perto da raiz do app, para dar um **namespace** (e escopo e estratégia) à persistência de layout dos componentes (`SgFloatActionButton`, `SgDatatable` e outros). Sem namespace, nada é persistido pelo ambiente.
- `SgRealtimeProvider`: uma vez no layout, quando a tela deve reagir a avisos do Pulse em vez de fazer polling; escute com `SgRealtimeEventListener` e use `useSgRealtimeStatus` para cair no polling quando `connected` for falso. Precisa de um `connectionFactory` (ver [[SeedGrid/SeedGrid-components/flutter/providers/API|API]]).
- Para tradução dos textos dos componentes, o provider é outro: `SgComponentsI18nProvider` ([[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral|fundamentos]]).

## O que muda em relação ao React

- Flutter não tem hooks: os `use*` viram funções que recebem o `BuildContext` (`useSgEnvironment`, `useSgPersistence`, `useSgRealtimeStatus`...), `useSgRealtimeEvent` vira o widget `SgRealtimeEventListener` (ou `listenSgRealtimeEvent`) e `useSgPersistentState` vira `SgPersistentState`/`SgPersistentStateBuilder`.
- `localStorage` vira `shared_preferences`; `enabled` do realtime vira `disabled`; `tokenEndpoint` precisa ser URL absoluta; o cliente do Pulse entra por `connectionFactory` e o adaptador do SDK não está ligado por dependência.
- Resumo de decisões: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] · [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte: [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers — React]]. Todos têm equivalente confirmado no código; nada ficou "não portado":

| Símbolo React | Equivalente Flutter |
|---|---|
| `useSgEnvironment`, `useSgNamespaceProvider`, `useSgPersistence`, `useHasSgEnvironmentProvider` | funções homônimas com `BuildContext` (`sg_environment_provider.dart`) |
| `useSgPersistentState` | `SgPersistentState` e `SgPersistentStateBuilder` (`persistent_state.dart`) |
| `buildSgPersistenceKey`, `createLocalStorageStrategy`, `createApiPersistenceStrategy`, `createCompositePersistenceStrategy` | funções homônimas (`persistence.dart`) |
| `readLocalPersistentState`, `writeLocalPersistentState`, `clearLocalPersistentState`, `resolvePersistedStateValue` | funções homônimas, sobre `SgStringStorage` (`SharedPreferencesStorage` para `shared_preferences`) |
| `useSgRealtimeEvent` | `SgRealtimeEventListener` (widget) e `listenSgRealtimeEvent` (função) |
| `useSgRealtimeStatus` | função `useSgRealtimeStatus(context)` (record `status` + `connected`) |
| `matchesSgRealtimeEvent` | `matchesSgRealtimeEvent` |

Extras do Flutter sem par no React: `SgPulseConnection`, `SgSimulatedPulseConnection`, `SgFetcher`/`sgDefaultFetcher` (`fetch` injetável) e `requestRealtimeToken`.

## Não verificado

- Não executei `flutter test` nem o showcase; o teste ao vivo contra o Pulse (2026-10-27) vem de `PULSE_ADAPTER.md` e `docs/PARIDADE.md`.
- Não verifiquei todos os componentes que consomem o ambiente de persistência.
- O extrator da tabela abaixo não listou `useSgRealtimeStatus` (retorna um record); ela está descrita acima e em [[SeedGrid/SeedGrid-components/flutter/providers/API|API]].

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `NamespaceProvider` | class | `{ getNamespace: () => string \| null }` do React. | `lib/src/providers/persistence.dart` |
| `PersistenceStrategy` | class | Estrategia de persistencia: `load`, `save` e `clear` por chave. Pode ser sincrona ou assincrona. | `lib/src/providers/persistence.dart` |
| `SgPersistenceRecordDTO` | class | Registro enviado e recebido pela persistencia por API (`SgPersistenceRecordDTO`). | `lib/src/providers/persistence.dart` |
| `SgPersistenceMode` | enum | `"strict" \| "fallback" \| "mirror"`. | `lib/src/providers/persistence.dart` |
| `SgPersistenceConfig` | class | `{ scope, mode, stateVersion }`. | `lib/src/providers/persistence.dart` |
| `SgEnvironmentValue` | class | Resultado de `useSgEnvironment`: namespace, estrategia e configuracao. | `lib/src/providers/persistence.dart` |
| `SgEnvironment` | typedef | `SgEnvironment` no React e um alias de `SgEnvironmentValue`. | `lib/src/providers/persistence.dart` |
| `buildSgPersistenceKey` | função | `chave final` = `sg:<namespace>[:<scope>]:<baseKey>`; `null` sem namespace (nada e persistido). | `lib/src/providers/persistence.dart` |
| `createLocalStorageStrategy` | função | Estrategia local (`localStorage` no React, `shared_preferences` no Flutter). Qualquer falha de leitura vira `null` e de escrita e ignorada, como no React. | `lib/src/providers/persistence.dart` |
| `createApiPersistenceStrategy` | função | Estrategia por API: `GET/POST/DELETE {baseUrl}/sg/persistence`. Erro HTTP lanca (para o composite cair no secundario). | `lib/src/providers/persistence.dart` |
| `createCompositePersistenceStrategy` | função | Combina duas estrategias: - `strict`: so a primaria (erro propaga); - `fallback`: primaria e, se falhar, a secundaria; - `mirror`: le a primaria (se vier valor), senao a secundaria; grava e apaga nas duas, ignorando falhas. | `lib/src/providers/persistence.dart` |
| `SgStringStorage` | class | `Pick<Storage, "getItem" \| "setItem" \| "removeItem">` do React. | `lib/src/providers/persistent_state.dart` |
| `SharedPreferencesStorage` | class | [SgStringStorage] sobre uma instancia ja carregada de `SharedPreferences`. | `lib/src/providers/persistent_state.dart` |
| `resolvePersistedStateValue` | função | `null` => [defaultValue]; senao [deserialize] do valor carregado. | `lib/src/providers/persistent_state.dart` |
| `readLocalPersistentState` | função | — | `lib/src/providers/persistent_state.dart` |
| `writeLocalPersistentState` | função | — | `lib/src/providers/persistent_state.dart` |
| `clearLocalPersistentState` | função | — | `lib/src/providers/persistent_state.dart` |
| `SgPersistentState` | class | Estado persistido (equivale ao retorno de `useSgPersistentState`): `value`, `setValue`, `clear` e `hydrated`. Carrega ao criar e grava a cada mudanca depois de hidratado.  Com [SgEnvironmentProvider] acima usa a estrategia do ambiente (chave com namespace e escopo); sem ele usa o armazenamento local com a chave crua, como o React. | `lib/src/providers/persistent_state.dart` |
| `SgPersistentStateBuilder` | class | Dono do ciclo de vida de um [SgPersistentState]: cria ao montar, descarta ao sair e reconstroi a cada mudanca. E o equivalente de chamar `useSgPersistentState` dentro de um componente. | `lib/src/providers/persistent_state.dart` |
| `SgPersistencePartial` | class | Valores opcionais de `persistence` (no React o `value` e um `Partial<SgEnvironmentValue>` lido campo a campo). | `lib/src/providers/sg_environment_provider.dart` |
| `SgEnvironmentPartial` | class | `Partial<SgEnvironmentValue>`: o que faltar usa o padrao do ambiente. | `lib/src/providers/sg_environment_provider.dart` |
| `useSgEnvironment` | função | `useSgEnvironment()`: o ambiente do provider mais proximo, ou o padrao. | `lib/src/providers/sg_environment_provider.dart` |
| `useHasSgEnvironmentProvider` | função | `useHasSgEnvironmentProvider()`. | `lib/src/providers/sg_environment_provider.dart` |
| `useSgNamespaceProvider` | função | `useSgNamespaceProvider()`. | `lib/src/providers/sg_environment_provider.dart` |
| `SgPersistence` | class | Resultado de `useSgPersistence()`: `load`, `save` e `clear` ja com a chave final (`sg:<namespace>[:<scope>]:<baseKey>`). Sem namespace nada e lido nem gravado. | `lib/src/providers/sg_environment_provider.dart` |
| `useSgPersistence` | função | `useSgPersistence()`. | `lib/src/providers/sg_environment_provider.dart` |
| `SgFetchRequest` | class | Pedido HTTP (equivale aos argumentos `input` + `init` do `fetch`). | `lib/src/providers/sg_fetch.dart` |
| `SgFetchResponse` | class | Resposta HTTP (equivale ao `Response`: `ok`, `status` e `json()`). | `lib/src/providers/sg_fetch.dart` |
| `SgFetcher` | typedef | Equivale ao `fetch` injetavel do React. | `lib/src/providers/sg_fetch.dart` |
| `sgDefaultFetcher` | função | Fetcher padrao: [SgHttpClient] de seedgrid_commons. Respostas nao-2xx viram [SgFetchResponse] com o status (nao lancam), como o `fetch` do navegador. | `lib/src/providers/sg_fetch.dart` |
| `SgPulseState` | enum | Estados do cliente, com os mesmos nomes do `ConnectionState` do SDK. | `lib/src/providers/sg_pulse_connection.dart` |
| `SgPulseToken` | class | Token curto de conexao (`PulseConnectToken`). | `lib/src/providers/sg_pulse_connection.dart` |
| `SgPulseMessage` | class | Mensagem recebida (`PulseIncomingMessage`, so os campos que o provider usa). | `lib/src/providers/sg_pulse_connection.dart` |
| `SgPulseTokenGetter` | typedef | — | `lib/src/providers/sg_pulse_connection.dart` |
| `SgPulseConnection` | class | Cliente do Pulse. Implemente com o SDK real (ver PULSE_ADAPTER.md) ou use [SgSimulatedPulseConnection]. | `lib/src/providers/sg_pulse_connection.dart` |
| `SgSimulatedPulseConnection` | class | Conexao simulada, sem rede: serve ao showcase e aos testes. Os metodos `emit*` fazem o papel do servidor. | `lib/src/providers/sg_pulse_connection.dart` |
| `SgRealtimeStatus` | enum | Estado do realtime, do ponto de vista da tela: - `disabled`: o backend respondeu `{enabled:false}` (ou o provider esta desligado): use o polling. - `connecting` / `reconnecting`: ainda sem conexao: use o polling. - `connected`: avisos chegando: dispense o polling. - `unavailable`: o token falhou (401, 503, rede) ou a conexao caiu de vez: use o polling. - `auth-error`: o Pulse recusou a credencial (4403): use o polling. | `lib/src/providers/sg_realtime_provider.dart` |
| `SgRealtimeConnectResponse` | class | Resposta do `POST /realtime/connect` das extensoes de realtime (Java e Rust). | `lib/src/providers/sg_realtime_provider.dart` |
| `SgRealtimeEvent` | class | Aviso recebido. `data` so traz identificadores: busque o registro pela API de sempre. | `lib/src/providers/sg_realtime_provider.dart` |
| `SgTokenRequestInit` | class | `RequestInit` do pedido de token (cabecalhos e corpo). | `lib/src/providers/sg_realtime_provider.dart` |
| `requestRealtimeToken` | função | Pede o token ao backend. Falha de HTTP lanca (o provider vira `unavailable`). | `lib/src/providers/sg_realtime_provider.dart` |
| `SgRealtimeListener` | typedef | — | `lib/src/providers/sg_realtime_provider.dart` |
| `matchesSgRealtimeEvent` | função | `backup.finished.*` casa `backup.finished.success` e `backup.finished.error`; `*` casa tudo. | `lib/src/providers/sg_realtime_provider.dart` |
| `SgRealtimeSubscription` | class | Assinatura de [listenSgRealtimeEvent]. | `lib/src/providers/sg_realtime_provider.dart` |
| `listenSgRealtimeEvent` | função | Chama [handler] a cada aviso do [channel] cujo nome casa [events] (String ou List de String; aceita `prefixo.*` e `*`). Fora de um [SgRealtimeProvider] nao faz nada. Cancele em `dispose`. Para uso em `State`; em arvores de widgets prefira [SgRealtimeEventListener]. | `lib/src/providers/sg_realtime_provider.dart` |
| `SgRealtimeEventListener` | class | Equivale a `useSgRealtimeEvent`: ouve enquanto estiver montado. | `lib/src/providers/sg_realtime_provider.dart` |

