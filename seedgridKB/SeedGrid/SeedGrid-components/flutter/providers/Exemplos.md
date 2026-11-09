---
description: "Exemplos Dart de Providers (ambiente/persistência e realtime) em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, providers, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Providers (ambiente/persistência e realtime) (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/providers/Exemplos|Exemplos — Providers (ambiente/persistência e realtime) (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/providers/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgEnvironmentProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_environment_provider_page.dart` (5 exemplo(s) na página; abaixo 3).

### Namespace customizado

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

### Default (namespace vazio)

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

### REST (por usuário)

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
          fetcher: _fakeServer(_server, _requests),
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
    ValueListenableBuilder<List<String>>(
      valueListenable: _requests,
      builder: (context, requests, _) =>
          Text('chamadas: ${requests.join(' | ')}'),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_fakeServer`: função `SgFetcher _fakeServer(Map<String, Object?> server, ValueNotifier<List<String>> requests)` do arquivo da página, que simula o servidor de persistência (troque por um `fetcher` real ou omita o parâmetro para usar `sgDefaultFetcher`); `_requests`: `ValueNotifier<List<String>>`, valor inicial `const []` com o registro das chamadas HTTP; `_server`: `Map<String, Object?>` (a base do servidor simulado). Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

## SgRealtimeProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_realtime_provider_page.dart` (5 exemplo(s) na página; abaixo 3).

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
    handler: (e) => _avisos.value = [
      ..._avisos.value,
      '${e.event} #${e.messageId}',
    ],
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
                    messageId: '${_avisos.value.length + 1}',
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
            ValueListenableBuilder<List<String>>(
              valueListenable: _avisos,
              builder: (context, avisos, _) => Text(
                'Avisos: ${avisos.isEmpty ? '(nenhum)' : avisos.join(', ')}',
              ),
            ),
          ],
        );
      },
    ),
  ),
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_avisos`: `ValueNotifier<List<String>>`, valor inicial `const []`; `_pulse`: `SgSimulatedPulseConnection` (Pulse simulado em memória); `_token`: função `Future<SgRealtimeConnectResponse> Function()` do estado da página, que devolve `SgRealtimeConnectResponse(enabled: true, token: ...)`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

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

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_pulse2`: `SgSimulatedPulseConnection` (outro Pulse simulado); `_token`: função `Future<SgRealtimeConnectResponse> Function()` do estado da página, que devolve `SgRealtimeConnectResponse(enabled: true, token: ...)`. Declare-os no seu widget.

### Desligado

Com enabled: false (ex.: enquanto não há usuário logado) não pede token nem conecta.

Região `sgRealtimeProviderDesligado` em `sg_realtime_provider_page.snippets.g.dart`.

```dart
SgRealtimeProvider(
  channels: const ['backup'],
  enabled: false,
  fetchToken: _token,
  child: Builder(
    builder: (context) => Text(
      'Estado: ${useSgRealtimeStatus(context).status.value}',
    ),
  ),
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_token`: função `Future<SgRealtimeConnectResponse> Function()` do estado da página, que devolve `SgRealtimeConnectResponse(enabled: true, token: ...)`. Declare-os no seu widget.

