---
description: "API Flutter de Providers (ambiente/persistência e realtime): construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, providers, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Providers (ambiente/persistência e realtime) (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/providers/API|API — Providers (ambiente/persistência e realtime) (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgEnvironmentProvider

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgEnvironmentProvider` (mesmo nome).

Provider de ambiente para namespace, escopo e estrategia de persistencia usados pelos componentes SeedGrid.

- Arquivo: `packages/seedgrid_components/lib/src/providers/sg_environment_provider.dart` (linha 54) · classe `class SgEnvironmentProvider extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_environment_provider.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgEnvironmentProvider({...})` com 2 parâmetro(s) nomeado(s), 2 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgEnvironmentProvider

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `SgEnvironmentPartial?` | — | não | React | `value` do React (`Partial<SgEnvironmentValue>`). Tipo no React: `Partial<SgEnvironmentValue>`. |
| `child` | `Widget` | — | sim | React | Arvore que consome o contexto de ambiente. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- Nenhuma ressalva registrada na tabela de paridade; o componente está `portado`.
- Flutter não tem hooks: `useSgEnvironment`, `useHasSgEnvironmentProvider`, `useSgNamespaceProvider` e `useSgPersistence` são **funções que recebem o `BuildContext`** (ver tabela de símbolos na [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|visão geral]]).
- `children` do React é `child`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum. O provider é um `StatelessWidget` que resolve o ambiente e o publica num `InheritedWidget` interno (`_SgEnvironmentScope`); os dependentes só são reconstruídos quando namespace, estratégia, `scope`, `mode` ou `stateVersion` mudam (por identidade/valor).

**Valor** (`providers/sg_environment_provider.dart`, `providers/persistence.dart`)
- `value: SgEnvironmentPartial?` com `namespaceProvider` (`NamespaceProvider(getNamespace)`), `persistenceStrategy` (`PersistenceStrategy`) e `persistence` (`SgPersistencePartial`: `scope`, `mode`, `stateVersion`). O que faltar usa o padrão `sgDefaultEnvironment`: namespace vazio (`''`), estratégia local (`createLocalStorageStrategy()`, sobre `shared_preferences`), `scope` `'app:unknown'`, `mode` `SgPersistenceMode.fallback`, `stateVersion` `1`.
- **Sem namespace nada é persistido**: `buildSgPersistenceKey` devolve `null` para namespace vazio, e `SgPersistence.load/save/clear` não fazem nada nesse caso. Para persistir, informe `namespaceProvider: NamespaceProvider(() => 'meu-app')` (ou o tenant/usuário).
- Chave final: `sg:<namespace>[:<scope>]:<baseKey>`.

**Funções de acesso** (equivalem aos hooks): `useSgEnvironment(context)` (ambiente do provider mais próximo, ou o padrão), `useHasSgEnvironmentProvider(context)`, `useSgNamespaceProvider(context)` e `useSgPersistence(context)`, que devolve `SgPersistence` com `load(baseKey)`, `save(baseKey, state)`, `clear(baseKey)`, `fullKeyOf(baseKey)`, `namespace`, `scope`, `mode` e `stateVersion`. Elas usam `dependOnInheritedWidgetOfExactType`, então reconstroem o chamador quando o ambiente muda.

**Estratégias** (`persistence.dart`)
- `createLocalStorageStrategy({prefix})`: `shared_preferences` com JSON; falha de leitura vira `null` e de escrita é ignorada.
- `createApiPersistenceStrategy({baseUrl, fetcher, scope, stateVersion})`: `GET`/`POST`/`DELETE` em `{baseUrl}/sg/persistence`; resposta HTTP de erro lança exceção.
- `createCompositePersistenceStrategy({mode, primary, secondary})`: `strict` (só a primária, erro propaga), `fallback` (secundária se a primária falhar) e `mirror` (lê a primária e, sem valor, a secundária; grava e apaga nas duas ignorando falhas).
- `PersistenceStrategy.from(load:, save:, clear:)` monta uma estratégia a partir de funções.

**Estado persistido**: `SgPersistentState<T>` (`ChangeNotifier` com `value`, `hydrated`, `setValue`, `clear`) e `SgPersistentStateBuilder<T>` (widget que cria e descarta o estado e reconstrói a cada mudança) equivalem a `useSgPersistentState`. Com `SgEnvironmentProvider` acima usam a estratégia do ambiente; sem ele, `shared_preferences` com a chave crua. Antes da hidratação, `setValue` só guarda em memória.

**Quem consome**: `SgFloatActionButton`, `SgDatatable` e demais componentes que persistem layout usam `useHasSgEnvironmentProvider`/`useSgPersistence` (confirmado em `buttons/sg_float_action_button.dart` e `inputs/datatable/sg_datatable.dart`; a lista completa de consumidores **não foi verificada**).

**Acessibilidade**: não aplicável, o provider não desenha nada (nenhum `Semantics` em `sg_environment_provider.dart`).

## SgRealtimeProvider

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgRealtimeProvider` (mesmo nome).

Avisos em tempo real para o usuario logado pelo SeedGrid Pulse: pede o token de conexao ao backend (que o emite para o usuario da sessao), conecta direto no Pulse, reconecta sozinho, para quando a credencial e revogada e expoe o status para a tela decidir entre aviso e polling de reserva.

- Arquivo: `packages/seedgrid_components/lib/src/providers/sg_realtime_provider.dart` (linha 163) · classe `class SgRealtimeProvider extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_realtime_provider.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgRealtimeProvider({...})` com 10 parâmetro(s) nomeado(s), 8 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgRealtimeProvider

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `child` | `Widget` | — | sim | React | Arvore que ouve os avisos com useSgRealtimeEvent. |
| `channels` | `List<String>` | — | sim | React | Channels que a aplicacao quer ouvir (ex.: ["backup"]). Tipo no React: `string[]`. |
| `tokenEndpoint` | `String` | `sgDefaultRealtimeTokenEndpoint` | não | React | Rota que entrega o token de conexao do usuario logado (a BFF, na mesma origem). |
| `tokenRequestInit` | `SgTokenRequestInit?` | — | não | React | Opções do `fetch` do token (ex.: `headers: { Authorization: ... }` quando não há cookie). Tipo no React: `RequestInit`. |
| `fetchToken` | `Future<SgRealtimeConnectResponse> Function()?` | — | não | React | Substitui o pedido de token inteiro (apps sem BFF, testes). Tipo no React: `(() => Promise<SgRealtimeConnectResponse>)`. |
| `pulseUrl` | `String?` | — | não | React | Endereço do Pulse, usado quando o token não traz `connectUrl` (Pulse sem endereço público). |
| `disabled` | `bool?` | `true` † | não | React | Liga/desliga (ex.: false enquanto nao ha usuario logado). |
| `connectOptions` | `Object?` | — | não | React | Opções avançadas do cliente do Pulse (reconexão, `webSocketImpl` em testes...). Tipo no React: `Omit<ConnectInput, "getToken" \| "accountKey" \| "baseUrl">`. |
| `connectionFactory` | `SgPulseConnection Function()?` | — | não | Flutter | Cria o cliente do Pulse (ver [SgPulseConnection]). Chamado a cada (re)conexao do provider. |
| `tokenFetcher` | `SgFetcher?` | — | não | Flutter | `fetch` injetavel do pedido de token padrao (testes). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- O cliente do Pulse entra por `connectionFactory` (`SgPulseConnection` injetável). **Sem ele o status fica `unavailable`**: o provider não tem cliente embutido.
- O adaptador para o SDK `seedgrid_pulse_subscriber` está documentado em `lib/src/providers/PULSE_ADAPTER.md`, mas **não ligado por dependência**. Decisão do dono pendente: ligar o SDK por dependência só depois de `seedgrid_pulse_subscriber` ir ao pub.dev.
- Com o adaptador, o provider foi executado ao vivo contra o Pulse real em 2026-10-27: conectou, recebeu a mensagem do próprio usuário e não recebeu a de outro; a reconexão com mensagem pendente também foi verificada. O modo `processed`, que exige confirmação (ack), **não foi exercitado**.
- `tokenEndpoint` precisa de URL absoluta (no Flutter não existe "mesma origem").
- `enabled` virou `disabled` e `children` virou `child`.
- Os hooks viraram widget e função: `useSgRealtimeEvent` → `SgRealtimeEventListener` e `listenSgRealtimeEvent`; `useSgRealtimeStatus` → função `useSgRealtimeStatus(context)`.

### Eventos, controllers e acessibilidade

**Atenção ao padrão de `disabled`**: a tabela acima mostra `true †` porque o contrato gerado copia o padrão de `enabled` do React. No Dart, `disabled` é `bool?` **sem padrão no construtor** e o código lê `!(widget.disabled ?? false)`: nulo significa **ligado**. Só `disabled: true` desliga (confirmado em `_SgRealtimeProviderState._enabled`).

**Fluxo** (`providers/sg_realtime_provider.dart`, `_connect`)
1. Com `disabled: true` o status vira `disabled`; com `channels` vazio, `idle`. Nos dois casos não há conexão.
2. Cria o cliente por `connectionFactory()` e ouve `states` e `messages`.
3. Pede o token: `fetchToken()` se informado; senão `POST` em `tokenEndpoint` com `tokenRequestInit` (`SgTokenRequestInit`: `headers`, `body`) usando `tokenFetcher` ou `sgDefaultFetcher`. Falha (HTTP não 2xx, rede) vira `unavailable`.
4. Resposta `{enabled:false}` ou sem token vira `disabled`. Sem `connectionFactory`, vira `unavailable`.
5. `connection.connect(getToken:, baseUrl: pulseUrl, options: connectOptions)` e depois `subscribe(channels)`. O primeiro token já pedido é reaproveitado; reconexões pedem um novo (o token vale só para entrar). O token fica só em memória.
6. Mudar `disabled`, `channels` ou `pulseUrl` encerra e reinicia a conexão (`didUpdateWidget`).

**Status** (`SgRealtimeStatus`): `idle`, `disabled`, `connecting`, `connected`, `reconnecting`, `unavailable`, `authError` (`'auth-error'`). Mapeamento a partir de `SgPulseState`: `connected`/`subscribed` → `connected`; `connecting`; `reconnecting`; `authError`; `idle`; qualquer outro (`disconnected`, `error`) → `unavailable`. Regra de uso: só `connected` dispensa o polling de reserva.

**Escuta de avisos**
- `SgRealtimeEventListener(channel:, events:, handler:, child:)`: widget que ouve enquanto está montado; `events` é `String` ou `List<String>` (nome exato, `prefixo.*` ou `*`, via `matchesSgRealtimeEvent`). O `handler` é sempre o mais recente, sem reassinar a cada build.
- `listenSgRealtimeEvent(context, channel, events, handler)`: devolve `SgRealtimeSubscription` com `cancel()` (chame em `dispose`). Fora de um `SgRealtimeProvider` não faz nada.
- `useSgRealtimeStatus(context)`: devolve o record `({SgRealtimeStatus status, bool connected})`; sem provider, `disabled`.
- `SgRealtimeEvent`: `channel`, `event`, `data` (só identificadores), `messageId`, `publishedAt`. Exceção num handler é engolida e não derruba os outros.

**Cliente do Pulse** (`providers/sg_pulse_connection.dart`): `SgPulseConnection` (`states`, `messages`, `connect`, `subscribe`, `disconnect`); `SgSimulatedPulseConnection` (sem rede, para showcase e testes, com `emitState`, `emitMessage`, `simulateReconnect`, `simulateRevoked` e contadores como `tokensRequested`, `connectCalls`); `SgPulseState`, `SgPulseToken`, `SgPulseMessage`. Resposta do backend: `SgRealtimeConnectResponse` (`enabled`, `token`, `expiresAt`, `connectUrl`, `channels`).

**`tokenEndpoint`**: o padrão é `sgDefaultRealtimeTokenEndpoint` (`/api/realtime/connect`), uma rota relativa que, segundo o comentário do código, não serve no Flutter; informe URL absoluta ou use `fetchToken`.

**Acessibilidade**: não aplicável, o provider não desenha nada (nenhum `Semantics` em `sg_realtime_provider.dart`).

