---
description: "Exemplos Dart de Providers (ambiente/persistência e realtime) em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, providers, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Providers (ambiente/persistência e realtime) (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/providers/Exemplos|Exemplos — Providers (ambiente/persistência e realtime) (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/providers/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgEnvironmentProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_environment_provider_page.dart` (4 exemplo(s) na página; abaixo 3).

### Namespace e escopo

A chave final é sg:<namespace>:<escopo>:<chave>. O valor fica salvo no armazenamento local do aparelho.

Região `sgEnvironmentProviderNamespace` em `sg_environment_provider_page.snippets.g.dart`.

```dart
SgEnvironmentProvider(
  value: SgEnvironmentPartial(
    namespaceProvider: NamespaceProvider(() => 'empresa-1'),
    persistence: const SgPersistencePartial(scope: 'app:showcase'),
  ),
  child: SgPersistentStateBuilder<int>(
    baseKey: 'cliques',
    defaultValue: 0,
    builder: (context, state) => Row(
      children: [
        SgButton(
          label: Text('Cliques: ${state.value}'),
          onClick: () => state.setValue(state.value + 1),
        ),
        const SizedBox(width: 12),
        SgButton(
          label: Text('Zerar'),
          appearance: SgAppearance.outline,
          onClick: state.clear,
        ),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            'chave: ${useSgPersistence(context).fullKeyOf('cliques')}',
          ),
        ),
      ],
    ),
  ),
)
```

### Sem namespace nada é salvo

Com o provider sem namespace (ou com namespace vazio) a chave não existe: o estado volta ao padrão.

Região `sgEnvironmentProviderSemNamespace` em `sg_environment_provider_page.snippets.g.dart`.

```dart
SgEnvironmentProvider(
  value: SgEnvironmentPartial(
    namespaceProvider: NamespaceProvider(() => null),
  ),
  child: SgPersistentStateBuilder<String>(
    baseKey: 'rascunho',
    defaultValue: 'padrão',
    builder: (context, state) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('valor: ${state.value}'),
        Text(
          'chave: ${useSgPersistence(context).fullKeyOf('rascunho')}',
        ),
        SgButton(
          label: Text('Tentar salvar'),
          onClick: () => state.setValue('salvo?'),
        ),
      ],
    ),
  ),
)
```

### Persistência por API

GET, POST e DELETE em /sg/persistence. Aqui o servidor é simulado e as chamadas aparecem abaixo.

Região `sgEnvironmentProviderApi` em `sg_environment_provider_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgEnvironmentProvider(
      value: SgEnvironmentPartial(
        namespaceProvider: NamespaceProvider(() => 'empresa-1'),
        persistenceStrategy: createApiPersistenceStrategy(
          baseUrl: 'https://api.exemplo.com',
          scope: 'app:showcase',
          stateVersion: 1,
          fetcher: _fakeServer,
        ),
      ),
      child: SgPersistentStateBuilder<int>(
        baseKey: 'pontos',
        defaultValue: 0,
        builder: (context, state) => Row(
          children: [
            SgButton(
              label: Text('Pontos: ${state.value}'),
              onClick: () => state.setValue(state.value + 10),
            ),
            const SizedBox(width: 12),
            SgButton(
              label: Text('Apagar'),
              appearance: SgAppearance.outline,
              onClick: state.clear,
            ),
          ],
        ),
      ),
    ),
    const SizedBox(height: 8),
    Text('chamadas: ${_requests.join(' | ')}'),
  ],
)
```

Ajuste: `_fakeServer` é um método da página do showcase (`Future<SgFetchResponse> Function(SgFetchRequest)`) que simula o servidor de persistência; troque por um `fetcher` real ou omita o parâmetro para usar `sgDefaultFetcher`.

## SgRealtimeProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_realtime_provider_page.dart` (4 exemplo(s) na página; abaixo 3).

### Simulador

Os botões fazem o papel do Pulse: publicam um aviso, derrubam a conexão e revogam a credencial.

Região `sgRealtimeProviderSimulador` em `sg_realtime_provider_page.snippets.g.dart`.

```dart
SgRealtimeProvider(
  channels: const ['backup'],
  fetchToken: _token,
  connectionFactory: () => _pulse,
  child: SgRealtimeEventListener(
    channel: 'backup',
    events: 'backup.finished.*',
    handler: (e) =>
        setState(() => _avisos.add('${e.event} #${e.messageId}')),
    child: Builder(
      builder: (context) {
        final r = useSgRealtimeStatus(context);
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Estado: ${r.status.value}  (conectado: ${r.connected})',
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SgButton(
                  label: Text(
                    'Publicar backup.finished.success',
                  ),
                  onClick: () => _pulse.emitMessage(
                    channel: 'backup',
                    event: 'backup.finished.success',
                    messageId: '${_avisos.length + 1}',
                  ),
                ),
                SgButton(
                  label: Text('Queda e reconexão'),
                  appearance: SgAppearance.outline,
                  onClick: () => _pulse.simulateReconnect(),
                ),
                SgButton(
                  label: Text('Revogar credencial'),
                  severity: SgSeverity.danger,
                  appearance: SgAppearance.outline,
                  onClick: _pulse.simulateRevoked,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Avisos: ${_avisos.isEmpty ? '(nenhum)' : _avisos.join(', ')}',
            ),
          ],
        );
      },
    ),
  ),
)
```

Ajuste: `_pulse`, `_avisos`, `_token` e `setState` vêm do `State` da página. `_pulse` é um `SgSimulatedPulseConnection()`, `_avisos` é uma `List<String>` e `_token` é um `Future<SgRealtimeConnectResponse> Function()` que devolve `SgRealtimeConnectResponse(enabled: true, token: ...)`.

### Polling de reserva

Enquanto não está conectado, a tela cai no polling; conectado, dispensa.

Região `sgRealtimeProviderPolling` em `sg_realtime_provider_page.snippets.g.dart`.

```dart
SgRealtimeProvider(
  channels: const ['backup'],
  fetchToken: _token,
  connectionFactory: () => _pulse2,
  child: Builder(
    builder: (context) {
      final r = useSgRealtimeStatus(context);
      return Row(
        children: [
          Icon(r.connected ? Icons.bolt : Icons.sync, size: 18),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              r.connected
                  ? 'Avisos em tempo real: sem polling.'
                  : 'Sem realtime (${r.status.value}): consultando a API a cada 5 s.',
            ),
          ),
          const SizedBox(width: 12),
          SgButton(
            label: Text('Derrubar'),
            appearance: SgAppearance.outline,
            size: SgSize.sm,
            onClick: () =>
                _pulse2.emitState(SgPulseState.reconnecting),
          ),
        ],
      );
    },
  ),
)
```

Ajuste: `_pulse2` (outro `SgSimulatedPulseConnection`), `_token` e as variáveis de contagem são membros do `State` da página do showcase.

### Desligado

Com disabled (ex.: enquanto não há usuário logado) não pede token nem conecta.

Região `sgRealtimeProviderDesligado` em `sg_realtime_provider_page.snippets.g.dart`.

```dart
SgRealtimeProvider(
  channels: const ['backup'],
  disabled: true,
  fetchToken: _token,
  child: Builder(
    builder: (context) => Text(
      'Estado: ${useSgRealtimeStatus(context).status.value}',
    ),
  ),
)
```

Ajuste: `_token` é um membro do `State` da página (ver o exemplo do simulador).

