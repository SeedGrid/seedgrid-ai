---
description: "Flutter (nota anterior, commit 314cb5a): exemplos Flutter de Gadgets, dígitos, relógio, gauges e QR copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos, plataforma-flutter]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Gadgets, dígitos, relógio, gauges e QR

> **Plataforma: Flutter.** Nota anterior, por tema, mantida como estava no commit `314cb5a` (não foi revista contra o commit `e9989b8`). Os exemplos **atuais e completos por grupo** estão em: [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos|Gadgets]] · [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos|Dígitos]] · [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos|Providers]].

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgSevenSegmentDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_seven_segment_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Algarismos e letras

Região `sgSevenSegmentDigitAlgarismos` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final c in '0123456789-AbCdEFHJLPUY'.split(''))
      SgSevenSegmentDigit(
        value: c,
        size: 72,
        thickness: 8,
        padding: 8,
      ),
  ],
)
```

### Paletas

Região `sgSevenSegmentDigitPaletas` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final palette in SgSevenSegmentDigitPalette.values)
      SgSevenSegmentDigit(
        value: '8',
        palette: palette,
        size: 72,
        thickness: 8,
        padding: 8,
      ),
    const SgSevenSegmentDigit(
      value: '8',
      size: 72,
      thickness: 8,
      padding: 8,
      color: '#ff00aa',
      offColor: 'rgba(255, 0, 170, 0.15)',
      backgroundColor: '#14000d',
    ),
  ],
)
```

## SgSegmentDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_segment_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Algarismos, sinal e dois pontos

Região `sgSegmentDigitAlgarismos` em `sg_segment_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final c in '0123456789-:'.split(''))
      SgSegmentDigit(value: c, size: 48),
  ],
)
```

### Tamanhos

Região `sgSegmentDigitTamanhos` em `sg_segment_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgSegmentDigit(value: '8', size: 10),
    SgSegmentDigit(value: '8', size: 16),
    SgSegmentDigit(value: '8', size: 32),
    SgSegmentDigit(value: '8', size: 64),
    SgSegmentDigit(value: '8', size: 100),
  ],
)
```

## SgMatrixDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_matrix_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Texto em matriz de pontos

Região `sgMatrixDigitTexto` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const SgMatrixDigit(value: 'Seed Grid 2026')
```

### Símbolos e caractere desconhecido

Região `sgMatrixDigitSimbolos` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const SgMatrixDigit(value: r'-_.:/?! @#')
```

## SgNeonDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_neon_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Brilho neon

Região `sgNeonDigitBrilho` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 32,
  runSpacing: 32,
  children: [
    SgNeonDigit(value: '24'),
    SgNeonDigit(
      value: '59',
      color: '#ff7ad9',
      shadowColor: '#ff00aa',
      backgroundColor: '#1a0612',
    ),
    SgNeonDigit(
      value: 'GO',
      color: '#7dd3fc',
      shadowColor: '#0ea5e9',
      backgroundColor: '#04121c',
    ),
  ],
)
```

### Intensidade, fonte e espaçamento

Região `sgNeonDigitFonte` em `sg_neon_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 32,
  runSpacing: 32,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgNeonDigit(value: '8', shadowStrength: 0.3, fontSize: 36),
    SgNeonDigit(value: '8', shadowStrength: 2, fontSize: 36),
    SgNeonDigit(
      value: 'OK',
      fontWeight: 'bold',
      letterSpacing: 6,
      padding: 20,
      rounded: 28,
    ),
    SgNeonDigit(value: '7', fontWeight: 300, fontSize: 64),
  ],
)
```

## SgFadeDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_fade_digit_page.dart` (3 exemplo(s) na página; abaixo 2).

### Cartão com fade

Região `sgFadeDigitCartao` em `sg_fade_digit_page.snippets.g.dart`.

```dart
const Row(
  mainAxisSize: MainAxisSize.min,
  children: [
    SgFadeDigit(value: '1'),
    SizedBox(width: 8),
    SgFadeDigit(value: '4'),
    SizedBox(width: 8),
    SgFadeDigit(value: '0'),
    SizedBox(width: 8),
    SgFadeDigit(value: '7'),
  ],
)
```

### Troca de valor

Região `sgFadeDigitTroca` em `sg_fade_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value = 0;
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgFadeDigit(value: '$value'),
          const SizedBox(width: 24),
          FilledButton(
            onPressed: () => set(() => value = (value + 1) % 10),
            child: const Text('Próximo'),
          ),
        ],
      ),
    );
  },
)
```

## SgFlipDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_flip_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Contador

Região `sgFlipDigitContador` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgFlipDigit(value: '${_n % 10}', fontSize: 56),
    SgButton(
      label: const Text('+1'),
      onClick: () => setState(() => _n++),
    ),
    SgButton(
      label: const Text('Zerar'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _n = 0),
    ),
  ],
)
```

### Tamanhos

Região `sgFlipDigitTamanhos` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 16,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgFlipDigit(value: '${_n % 10}', fontSize: 28),
    SgFlipDigit(value: '${_n % 10}', fontSize: 48),
    SgFlipDigit(value: '${_n % 10}', fontSize: 72),
  ],
)
```

## SgRoller3dDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_roller3d_digit_page.dart` (4 exemplo(s) na página; abaixo 2).

### Dígitos de 0 a 9

Região `sgRoller3dDigitDigitos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgRoller3DDigit(value: '$_digit', fontSize: 32),
    SgButton(
      label: const Text('Próximo'),
      onClick: () => setState(() => _digit = (_digit + 1) % 10),
    ),
    SgButton(
      label: const Text('Aleatório'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _digit = (_digit * 7 + 3) % 10),
    ),
  ],
)
```

### Minutos (00 a 59)

Região `sgRoller3dDigitMinutos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgRoller3DDigit(
      value: _minute.toString().padLeft(2, '0'),
      items: List.generate(60, (i) => i.toString().padLeft(2, '0')),
      fontSize: 22,
    ),
    SgButton(
      label: const Text('+7 minutos'),
      onClick: () => setState(() => _minute = (_minute + 7) % 60),
    ),
  ],
)
```

## SgDiscardDigit

Fonte: `apps/seedgrid_showcase/lib/pages/sg_discard_digit_page.dart` (5 exemplo(s) na página; abaixo 2).

### Descarte (padrão)

Região `sgDiscardDigitDescarte` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgDiscardDigit(value: '$_n'),
    SgButton(
      label: const Text('Próximo'),
      onClick: () => setState(() => _n = _n % 9 + 1),
    ),
  ],
)
```

### Sem animação

Região `sgDiscardDigitSemAnimacao` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgDiscardDigit(value: '$_n', animateOnChange: false),
    SgButton(
      label: const Text('Próximo'),
      onClick: () => setState(() => _n = _n % 9 + 1),
    ),
  ],
)
```

## SgStringAnimator

Fonte: `apps/seedgrid_showcase/lib/pages/sg_string_animator_page.dart` (5 exemplo(s) na página; abaixo 2).

### Animação manual (roller3d)

Região `sgStringAnimatorManual` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      final controller = SgStringAnimatorController();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgStringAnimator(
            sourceString: 'LUCIANO',
            targetString: 'MARTA',
            controller: controller,
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: controller.startAnimation,
            child: const Text('Animar'),
          ),
        ],
      );
    },
  ),
)
```

### Números alinhados à direita

Região `sgStringAnimatorDireita` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      final controller = SgStringAnimatorController();
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgStringAnimator(
            sourceString: '7',
            targetString: '2048',
            alignTo: SgStringAnimatorAlignTo.right,
            emptyChar: '0',
            charset: const [
              '0',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
            ],
            velocity: 90,
            controller: controller,
          ),
          const SizedBox(width: 24),
          FilledButton(
            onPressed: controller.startAnimation,
            child: const Text('Contar'),
          ),
        ],
      );
    },
  ),
)
```

## SgRadialGauge

Fonte: `apps/seedgrid_showcase/lib/pages/sg_radial_gauge_page.dart` (5 exemplo(s) na página; abaixo 2).

### Ponteiro simples

Região `sgRadialGaugeBasico` em `sg_radial_gauge_page.snippets.g.dart`.

```dart
const SgRadialGauge(value: 62)
```

### Meio arco invertido

Região `sgRadialGaugeMeioArco` em `sg_radial_gauge_page.snippets.g.dart`.

```dart
const SgRadialGauge(
  value: 30,
  startAngle: 180,
  endAngle: 0,
  isAxisInversed: true,
  width: 300,
  height: 180,
  showLabels: false,
  animate: false,
)
```

## SgLinearGauge

Fonte: `apps/seedgrid_showcase/lib/pages/sg_linear_gauge_page.dart` (4 exemplo(s) na página; abaixo 2).

### Barra horizontal

Região `sgLinearGaugeBasico` em `sg_linear_gauge_page.snippets.g.dart`.

```dart
const SgLinearGauge(value: 62)
```

### Arrastar o ponteiro

Região `sgLinearGaugeArrastar` em `sg_linear_gauge_page.snippets.g.dart`.

```dart
Column(
  mainAxisSize: MainAxisSize.min,
  children: [
    SgLinearGauge(
      value: _volume,
      primaryPointerDraggable: true,
      onValueChange: (v) => setState(() => _volume = v),
      labelFormatter: (v) => '${v.round()}%',
    ),
    Text('Volume: ${_volume.round()}%'),
  ],
)
```

## SgQrCode

Fonte: `apps/seedgrid_showcase/lib/pages/sg_qr_code_page.dart` (4 exemplo(s) na página; abaixo 2).

### QR Code básico

Região `sgQrCodeBasico` em `sg_qr_code_page.snippets.g.dart`.

```dart
const SgQRCode(value: 'https://seedgrid.com.br')
```

### Vazio e erro

Região `sgQrCodeVazio` em `sg_qr_code_page.snippets.g.dart`.

```dart
const SgQRCode(
  value: '',
  size: 120,
  emptyFallback: Text('Informe um texto'),
)
```

## SgClock

Fonte: `apps/seedgrid_showcase/lib/pages/sg_clock_page.dart` (7 exemplo(s) na página; abaixo 2).

### Digital

Região `sgClockDigital` em `sg_clock_page.snippets.g.dart`.

```dart
const SgClock(
  initialServerTime: '2026-06-15T09:41:07-03:00',
  timezone: 'America/Sao_Paulo',
)
```

### Estilo digital registrado

Região `sgClockEstilo` em `sg_clock_page.snippets.g.dart`.

```dart
const SgClock(
  initialServerTime: '2026-06-15T09:41:07Z',
  timezone: 'UTC',
  digitalStyle: SgClockDigitalStyle.flip,
  showSeconds: false,
  size: 'lg',
)
```

## SgClockThemePicker

Fonte: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_picker_page.dart` (4 exemplo(s) na página; abaixo 2).

### Escolhendo o tema de um relógio

Região `sgClockThemePickerBasico` em `sg_clock_theme_picker_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: Wrap(
    spacing: 16,
    runSpacing: 16,
    crossAxisAlignment: WrapCrossAlignment.start,
    children: [
      SizedBox(
        width: 300,
        child: SgClockThemePicker(
          value: _tema,
          onChange: (id) => setState(() => _tema = id),
        ),
      ),
      SgClock(
        clockStyle: SgClockClockStyle.analog,
        size: 160,
        initialServerTime: '2026-06-15T10:08:30Z',
        timezone: 'UTC',
        themeId: _tema,
      ),
    ],
  ),
)
```

### Sem busca, aberto e com miniatura grande

Região `sgClockThemePickerAberto` em `sg_clock_theme_picker_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: SizedBox(
    width: 300,
    height: 440,
    child: SgClockThemePicker(
      value: 'music',
      onChange: (_) {},
      searchable: false,
      defaultOpen: true,
      previewSize: 72,
    ),
  ),
)
```

## SgClockThemePreview

Fonte: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_preview_page.dart` (4 exemplo(s) na página; abaixo 2).

### Um tema

Região `sgClockThemePreviewBasico` em `sg_clock_theme_preview_page.snippets.g.dart`.

```dart
SgClockThemePreview(theme: sgClockThemesBuiltIn.first)
```

### Os temas embutidos

Região `sgClockThemePreviewTodos` em `sg_clock_theme_preview_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final tema in sgClockThemesBuiltIn)
      Tooltip(
        message: tema.label ?? tema.id,
        child: SgClockThemePreview(theme: tema, size: 72),
      ),
  ],
)
```

## SgClockThemeProvider

Fonte: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_provider_page.dart` (4 exemplo(s) na página; abaixo 2).

### Registrando os temas embutidos

Região `sgClockThemeProviderBasico` em `sg_clock_theme_provider_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: const SgClock(
    clockStyle: SgClockClockStyle.analog,
    size: 160,
    initialServerTime: '2026-06-15T10:08:30Z',
    timezone: 'UTC',
    themeId: 'music-notes',
  ),
)
```

### Tema de recuo

Região `sgClockThemeProviderRecuo` em `sg_clock_theme_provider_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(
    themes: sgClockThemesBuiltIn,
    fallbackThemeId: 'roman-classic',
  ),
  child: const SgClock(
    clockStyle: SgClockClockStyle.analog,
    size: 160,
    initialServerTime: '2026-06-15T10:08:30Z',
    timezone: 'UTC',
    themeId: 'nao-existe',
  ),
)
```

## SgTimeProvider

Fonte: `apps/seedgrid_showcase/lib/pages/sg_time_provider_page.dart` (4 exemplo(s) na página; abaixo 2).

### Uma hora para toda a árvore

Região `sgTimeProviderBasico` em `sg_time_provider_page.snippets.g.dart`.

```dart
const SgTimeProvider(
  initialServerTime: '2026-06-15T09:41:07Z',
  child: Wrap(
    spacing: 12,
    runSpacing: 12,
    children: [
      SgClock(timezone: 'UTC'),
      SgClock(timezone: 'Asia/Tokyo'),
    ],
  ),
)
```

### Sem provider

Região `sgTimeProviderSem` em `sg_time_provider_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final tempo = useSgTime(context);
    return Text('Sem provider: tick ${tempo.tick}');
  },
)
```

## SgEnvironmentProvider

Fonte: `apps/seedgrid_showcase/lib/pages/sg_environment_provider_page.dart` (4 exemplo(s) na página; abaixo 2).

### Namespace e escopo

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
          label: const Text('Zerar'),
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
          label: const Text('Tentar salvar'),
          onClick: () => state.setValue('salvo?'),
        ),
      ],
    ),
  ),
)
```

## SgRealtimeProvider

Fonte: `apps/seedgrid_showcase/lib/pages/sg_realtime_provider_page.dart` (4 exemplo(s) na página; abaixo 2).

### Simulador

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
                  label: const Text(
                    'Publicar backup.finished.success',
                  ),
                  onClick: () => _pulse.emitMessage(
                    channel: 'backup',
                    event: 'backup.finished.success',
                    messageId: '${_avisos.length + 1}',
                  ),
                ),
                SgButton(
                  label: const Text('Queda e reconexão'),
                  appearance: SgAppearance.outline,
                  onClick: () => _pulse.simulateReconnect(),
                ),
                SgButton(
                  label: const Text('Revogar credencial'),
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

### Desligado

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
