---
description: "Exemplos Dart de Gadgets (relógio, calendário, gauges, QR) em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, gadgets, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Gadgets (relógio, calendário, gauges, QR) (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/gadgets/Exemplos|Exemplos — Gadgets (relógio, calendário, gauges, QR) (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/gadgets/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco com "Região" foi comparado, texto a texto, com a constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 (idêntico, com `context.tx` já trocado pelo literal); os blocos "Exemplo próprio" foram lidos contra o construtor Dart. Continua sem `flutter analyze`/`flutter test` nesta conferência. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgCalendar

Página: `apps/seedgrid_showcase/lib/pages/sg_calendar_page.dart` (9 exemplo(s) na página; abaixo 3).

### Básico

Calendário mensal em pt-BR, com o dia de hoje marcado e o atalho para voltar a ele.

Região `sgCalendarBasico` em `sg_calendar_page.snippets.g.dart`.

```dart
SgCalendar(onValueChange: (data) => debugPrint('Escolheu $data'))
```

### Idioma e início da semana

O locale muda os nomes; weekStartsOn escolhe o primeiro dia (0 = domingo, 1 = segunda); weekdayFormat: narrow, short ou long.

Região `sgCalendarIdioma` em `sg_calendar_page.snippets.g.dart`.

```dart
const SgCalendar(
  locale: 'en-US',
  weekStartsOn: 1,
  weekdayFormat: SgCalendarWeekdayFormat.short,
  defaultValue: '2026-07-04',
)
```

### Limites e dias bloqueados

minDate e maxDate são inclusivos; isDateDisabled bloqueia o que quiser (aqui, fins de semana).

Região `sgCalendarLimites` em `sg_calendar_page.snippets.g.dart`.

```dart
SgCalendar(
  defaultValue: '2026-03-16',
  minDate: '2026-03-10',
  maxDate: '2026-03-27',
  isDateDisabled: (data) =>
      data.weekday == DateTime.saturday ||
      data.weekday == DateTime.sunday,
)
```

## SgClock

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_page.dart` (15 exemplo(s) na página; abaixo 4).

### Digital

Presets de tamanho com locale/timezone.

Região `sgClockDigital` em `sg_clock_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgClock(
      size: 'sm',
      initialServerTime: '2026-06-15T09:41:07-03:00',
      timezone: 'America/Sao_Paulo',
    ),
    SgClock(
      initialServerTime: '2026-06-15T09:41:07-03:00',
      timezone: 'America/Sao_Paulo',
    ),
    SgClock(
      size: 'lg',
      initialServerTime: '2026-06-15T09:41:07-03:00',
      timezone: 'America/Sao_Paulo',
    ),
    SgClock(
      size: 28,
      initialServerTime: '2026-06-15T09:41:07-03:00',
      timezone: 'America/Sao_Paulo',
    ),
  ],
)
```

### Timezone

Troca rápida de timezone e formato 12h/24h.

Região `sgClockTimezone` em `sg_clock_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgClock(
      initialServerTime: '2026-06-15T15:41:07Z',
      timezone: 'UTC',
      format: SgClockFormat.v12h,
      locale: 'en-US',
      showSeconds: false,
    ),
    SgClock(
      initialServerTime: '2026-06-15T15:41:07Z',
      timezone: 'Europe/Lisbon',
      locale: 'pt-PT',
    ),
    SgClock(
      initialServerTime: '2026-06-15T15:41:07Z',
      timezone: 'Asia/Tokyo',
      format: SgClockFormat.v12h,
      locale: 'es',
    ),
  ],
)
```

### Analógico

Seletor de tema com segundos step/smooth.

Região `sgClockAnalogico` em `sg_clock_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: ListenableBuilder(
    listenable: Listenable.merge([_themeId, _smooth, _showSeconds]),
    builder: (context, _) => Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.start,
      children: [
        SizedBox(
          width: 260,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SgClockThemePicker(
                value: _themeId.value,
                onChange: (id) => _themeId.value = id,
                label: 'Tema',
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  SgButton(
                    label: Text(
                      _smooth.value
                          ? 'Segundos: smooth'
                          : 'Segundos: step',
                    ),
                    onClick: () => _smooth.value = !_smooth.value,
                  ),
                  SgButton(
                    label: Text(
                      _showSeconds.value
                          ? 'Segundos: ON'
                          : 'Segundos: OFF',
                    ),
                    onClick: () =>
                        _showSeconds.value = !_showSeconds.value,
                  ),
                ],
              ),
            ],
          ),
        ),
        SgClock(
          clockStyle: SgClockClockStyle.analog,
          size: 220,
          initialServerTime: '2026-06-15T10:08:30Z',
          timezone: 'UTC',
          themeId: _themeId.value,
          showSeconds: _showSeconds.value,
          secondHandMode: _smooth.value
              ? SgClockSecondHandMode.smooth
              : SgClockSecondHandMode.step,
        ),
      ],
    ),
  ),
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_showSeconds`: `ValueNotifier<bool>`, valor inicial `true`; `_smooth`: `ValueNotifier<bool>`, valor inicial `false`; `_themeId`: `ValueNotifier<String>`, valor inicial `'seedgrid'`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Desenho do dígito próprio (digitBuilder)

Com digitalStyle custom, o digitBuilder recebe as partes do relógio e devolve o desenho de cada dígito; sem ele, o relógio cai no estilo default.

Região `sgClockDigitBuilder` em `sg_clock_page.snippets.g.dart`.

```dart
SgClock(
  digitalStyle: SgClockDigitalStyle.custom,
  initialServerTime: '2026-06-15T09:41:07-03:00',
  timezone: 'America/Sao_Paulo',
  digitBuilder: (context, parts) {
    final scheme = Theme.of(context).colorScheme;
    return Wrap(
      spacing: 4,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (final ch in parts.text.split(''))
          ch == ':'
              ? Text(ch)
              : Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: scheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    ch,
                    style: TextStyle(color: scheme.onPrimary),
                  ),
                ),
      ],
    );
  },
)
```

## SgTimeProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_time_provider_page.dart` (5 exemplo(s) na página; abaixo 3).

### Uso básico

Os relógios abaixo não têm initialServerTime: leem a hora do SgTimeProvider e andam juntos, alinhados à virada do segundo.

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

### Lendo o contexto de tempo

useSgTime(context) devolve serverStartMs, tick e nowMs. O tick sobe a cada segundo e reconstrói quem o lê.

Região `sgTimeProviderLeitura` em `sg_time_provider_page.snippets.g.dart`.

```dart
SgTimeProvider(
  initialServerTime: '2026-06-15T09:41:07Z',
  child: Builder(
    builder: (context) {
      final tempo = useSgTime(context);
      final agora = DateTime.fromMillisecondsSinceEpoch(
        tempo.nowMs().floor(),
        isUtc: true,
      );
      return Text(
        'tick ${tempo.tick}, agora (UTC) ${agora.toIso8601String()}',
      );
    },
  ),
)
```

### Hora do servidor diferente da do aparelho

É o uso típico: o servidor manda a hora certa e a tela segue por ela, sem depender do relógio do aparelho.

Região `sgTimeProviderServidor` em `sg_time_provider_page.snippets.g.dart`.

```dart
SgTimeProvider(
  initialServerTime: '2030-01-01T23:59:55Z',
  child: SgClock(
    timezone: 'UTC',
    cardTitle: Text('Hora do servidor'),
  ),
)
```

## SgClockThemeProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_provider_page.dart` (5 exemplo(s) na página; abaixo 3).

### Uso básico

Envolva SgClock e SgClockThemePicker com SgClockThemeProvider para compartilhar a resolução de temas.

Região `sgClockThemeProviderBasico` em `sg_clock_theme_provider_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: ValueListenableBuilder<String>(
    valueListenable: _themeId,
    builder: (context, themeId, _) => Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.start,
      children: [
        SgClock(
          clockStyle: SgClockClockStyle.analog,
          size: 160,
          initialServerTime: '2026-06-15T10:08:30Z',
          timezone: 'UTC',
          themeId: themeId,
        ),
        SizedBox(
          width: 300,
          child: SgClockThemePicker(
            value: themeId,
            onChange: (id) => _themeId.value = id,
          ),
        ),
      ],
    ),
  ),
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_themeId`: `ValueNotifier<String>`, valor inicial `'classic'`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Tema local customizado

Passe um array themes para o provider para injetar temas locais sem registro global.

Região `sgClockThemeProviderLocal` em `sg_clock_theme_provider_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(
    themes: [
      SgClockTheme(
        id: 'ponto',
        label: 'Ponto',
        ops: [
          SgClockCircle(
            cx: 50,
            cy: 50,
            r: 48,
            fill: SgClockPaint(
              light: Color(0xFFFFF7ED),
              dark: Color(0xFF1C1917),
            ),
          ),
          SgClockCircle(
            cx: 50,
            cy: 12,
            r: 3,
            fill: SgClockPaint(
              light: Color(0xFFF97316),
              dark: Color(0xFFFB923C),
            ),
          ),
        ],
      ),
    ],
  ),
  child: SgClock(
    clockStyle: SgClockClockStyle.analog,
    size: 160,
    initialServerTime: '2026-06-15T10:08:30Z',
    timezone: 'UTC',
    themeId: 'ponto',
  ),
)
```

### Tema de recuo

Com mode fallback (padrão), um id desconhecido cai em fallbackThemeId (padrão: classic).

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

## SgClockThemePicker

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_picker_page.dart` (4 exemplo(s) na página; abaixo 3).

### Uso básico

Escolha de tema visual com preview imediato aplicado ao relógio.

Região `sgClockThemePickerBasico` em `sg_clock_theme_picker_page.snippets.g.dart`.

```dart
SgClockThemeProvider(
  value: SgClockThemeProviderValue(themes: sgClockThemesBuiltIn),
  child: ValueListenableBuilder<String>(
    valueListenable: _tema,
    builder: (context, tema, _) => Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.start,
      children: [
        SizedBox(
          width: 300,
          child: SgClockThemePicker(
            value: tema,
            onChange: (id) => _tema.value = id,
          ),
        ),
        SgClock(
          clockStyle: SgClockClockStyle.analog,
          size: 160,
          initialServerTime: '2026-06-15T10:08:30Z',
          timezone: 'UTC',
          themeId: tema,
        ),
      ],
    ),
  ),
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_tema`: `ValueNotifier<String>`, valor inicial `'classic'`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Sem busca, aberto e com miniatura grande

searchable: false esconde o campo de busca; defaultOpen abre o painel; previewSize muda a miniatura do botão.

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

### Tema de recuo e texto do botão

Valor desconhecido mostra o fallbackThemeId; placeholder aparece quando nenhum tema é resolvido (aqui, sem provider).

Região `sgClockThemePickerRecuo` em `sg_clock_theme_picker_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    SizedBox(
      width: 280,
      child: SgClockThemeProvider(
        value: SgClockThemeProviderValue(
          themes: sgClockThemesBuiltIn,
        ),
        child: SgClockThemePicker(
          value: 'nao-existe',
          onChange: (_) {},
          fallbackThemeId: 'dark',
        ),
      ),
    ),
    SizedBox(
      width: 280,
      child: SgClockThemePicker(
        value: 'classic',
        onChange: (_) {},
        placeholder: 'Nenhum tema registrado',
      ),
    ),
  ],
)
```

## SgClockThemePreview

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_preview_page.dart` (4 exemplo(s) na página; abaixo 3).

### Um tema

Miniatura com ponteiros fixos (hora 305°, minuto 60°, segundo 180°), na cor do texto.

Região `sgClockThemePreviewBasico` em `sg_clock_theme_preview_page.snippets.g.dart`.

```dart
SgClockThemePreview(theme: sgClockThemesBuiltIn.first)
```

### Galeria de temas

Previews compactos de temas embutidos para comparação visual.

Região `sgClockThemePreviewGaleria` em `sg_clock_theme_preview_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    for (final tema in sgClockThemesBuiltIn.take(8))
      SizedBox(
        width: 140,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: SgClockThemePreview(theme: tema, size: 72),
            ),
            const SizedBox(height: 8),
            Text(
              tema.label ?? tema.id,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Text(tema.id, style: const TextStyle(fontSize: 12)),
          ],
        ),
      ),
  ],
)
```

### Tamanhos

Região `sgClockThemePreviewTamanhos` em `sg_clock_theme_preview_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgClockThemePreview(theme: sgClockThemesBuiltIn[7], size: 32),
    SgClockThemePreview(theme: sgClockThemesBuiltIn[7]),
    SgClockThemePreview(theme: sgClockThemesBuiltIn[7], size: 128),
  ],
)
```

## SgLinearGauge

Página: `apps/seedgrid_showcase/lib/pages/sg_linear_gauge_page.dart` (6 exemplo(s) na página; abaixo 3).

### Barra horizontal

Eixo com barra de progresso, ponteiro triangular e marcas automáticas.

Região `sgLinearGaugeBasico` em `sg_linear_gauge_page.snippets.g.dart`.

```dart
const SgLinearGauge(value: 62)
```

### Faixas e ponteiro extra

ranges coloridas sobre o eixo e um ponteiro adicional com rótulo.

Região `sgLinearGaugeFaixas` em `sg_linear_gauge_page.snippets.g.dart`.

```dart
SgLinearGauge(
  value: 35,
  ranges: [
    SgLinearGaugeRange(start: 0, end: 40, color: '#22c55e'),
    SgLinearGaugeRange(start: 40, end: 100, color: '#ef4444'),
  ],
  pointers: [
    SgLinearGaugePointer(
      value: 80,
      shape: SgLinearGaugePointerShape.diamond,
      label: 'meta',
    ),
  ],
  primaryPointerShape:
      SgLinearGaugePrimaryPointerShape.invertedTriangle,
)
```

### Vertical

orientation vertical usa o eixo y; isAxisInversed põe o mínimo no topo.

Região `sgLinearGaugeVertical` em `sg_linear_gauge_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 24,
  runSpacing: 24,
  children: [
    SgLinearGauge(
      value: 70,
      orientation: SgLinearGaugeOrientation.vertical,
    ),
    SgLinearGauge(
      value: 70,
      orientation: SgLinearGaugeOrientation.vertical,
      isAxisInversed: true,
      barColor: '#8b5cf6',
    ),
  ],
)
```

## SgRadialGauge

Página: `apps/seedgrid_showcase/lib/pages/sg_radial_gauge_page.dart` (11 exemplo(s) na página; abaixo 3).

### Ponteiro simples

Agulha sobre um arco de 270 graus, com marcas e rótulos automáticos.

Região `sgRadialGaugeBasico` em `sg_radial_gauge_page.snippets.g.dart`.

```dart
const SgRadialGauge(value: 62)
```

### Faixas coloridas e anotação

ranges pintam trechos da escala; annotations e centerContent colocam widgets sobre o arco.

Região `sgRadialGaugeFaixas` em `sg_radial_gauge_page.snippets.g.dart`.

```dart
SgRadialGauge(
  value: 72,
  width: 280,
  height: 280,
  ranges: [
    SgRadialGaugeRange(start: 0, end: 40, color: '#22c55e'),
    SgRadialGaugeRange(start: 40, end: 75, color: '#eab308'),
    SgRadialGaugeRange(start: 75, end: 100, color: '#ef4444'),
  ],
  annotations: [
    SgRadialGaugeAnnotation(
      value: 50,
      radiusFactor: 0.55,
      content: Text('média'),
    ),
  ],
  centerContent: Text(
    '72%',
    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
  ),
)
```

### Anel de progresso e ponteiros extras

primaryPointerType range preenche o anel; pointers adiciona marcadores e agulhas.

Região `sgRadialGaugeAnel` em `sg_radial_gauge_page.snippets.g.dart`.

```dart
SgRadialGauge(
  value: 55,
  primaryPointerType: SgRadialGaugePrimaryPointerType.range,
  ringThickness: 16,
  pointers: [
    SgRadialGaugePointer(
      id: 'meta',
      type: SgRadialGaugePointerType.marker,
      value: 80,
      shape: SgRadialGaugeMarkerShape.diamond,
      color: '#ef4444',
      label: 'meta',
    ),
  ],
)
```

## SgQRCode

Página: `apps/seedgrid_showcase/lib/pages/sg_qr_code_page.dart` (5 exemplo(s) na página; abaixo 3).

### QR Code básico

Gera a matriz do texto (nível de correção H por padrão) e a desenha sem suavização.

Região `sgQrCodeBasico` em `sg_qr_code_page.snippets.g.dart`.

```dart
const SgQRCode(value: 'https://seedgrid.com.br')
```

### Cores, tamanho e margem

fgColor e bgColor aceitam hex, rgb e tokens do tema; size é o lado em px e margin conta módulos.

Região `sgQrCodeCores` em `sg_qr_code_page.snippets.g.dart`.

```dart
const SgQRCode(
  value: 'seedgrid',
  size: 160,
  margin: 1,
  fgColor: '#1d4ed8',
  bgColor: '#e0f2fe',
  errorCorrectionLevel: SgQRCodeErrorCorrectionLevel.m,
)
```

### Logo no centro

O logo central tem tamanho, respiro e cantos configuráveis (logoSize, logoPadding e logoBorderRadius).

Região `sgQrCodeLogo` em `sg_qr_code_page.snippets.g.dart`.

```dart
SgQRCode(
  value: 'https://seedgrid.com.br/logo',
  size: 200,
  logoImage: const AssetImage('assets/logo-seedgrid.png'),
  logoSize: 56,
  logoPadding: 4,
  logoBorderRadius: 8,
)
```

## SgStringAnimator

Página: `apps/seedgrid_showcase/lib/pages/sg_string_animator_page.dart` (10 exemplo(s) na página; abaixo 3).

### Roller 3D - nomes (alinhado à esquerda)

Anima "LUCIANO" até "MARTA". Posições extras preenchidas com espaço à direita (alignTo="left").

Região `sgStringAnimatorRollerNomes` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      final animRef = SgStringAnimatorController();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgStringAnimator(
            sourceString: 'LUCIANO',
            targetString: 'MARTA',
            stringAnimatorStyle:
                SgStringAnimatorStringAnimatorStyle.roller3d,
            alignTo: SgStringAnimatorAlignTo.left,
            fontSize: 28,
            controller: animRef,
          ),
          const SizedBox(height: 16),
          SgButton(
            size: SgSize.sm,
            label: Text('Animar'),
            onClick: animRef.startAnimation,
          ),
        ],
      );
    },
  ),
)
```

### autoStart - animação automática

Com autoStart=true, a animação é iniciada automaticamente sempre que targetString mudar. Funciona com todos os estilos.

Região `sgStringAnimatorAutoStart` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      const names = [
        'LUCIANO',
        'MARTA',
        'PEDRO',
        'ANA',
        'SEEDGRID',
      ];
      var idx = 0;
      return StatefulBuilder(
        builder: (context, set) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgStringAnimator(
              sourceString:
                  names[(idx - 1 + names.length) % names.length],
              targetString: names[idx],
              stringAnimatorStyle:
                  SgStringAnimatorStringAnimatorStyle.roller3d,
              alignTo: SgStringAnimatorAlignTo.left,
              fontSize: 28,
              autoStart: true,
              velocity: 60,
            ),
            const SizedBox(height: 16),
            SgButton(
              size: SgSize.sm,
              label: Text('Próximo nome'),
              onClick: () =>
                  set(() => idx = (idx + 1) % names.length),
            ),
          ],
        ),
      );
    },
  ),
)
```

### Roller 3D - números (alinhado à direita)

Anima "42" até "1337". Espaços são inseridos à esquerda (alignTo="right") e os dígitos animam da direita para a esquerda.

Região `sgStringAnimatorRollerNumeros` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      final animRef = SgStringAnimatorController();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgStringAnimator(
            sourceString: '42',
            targetString: '1337',
            stringAnimatorStyle:
                SgStringAnimatorStringAnimatorStyle.roller3d,
            alignTo: SgStringAnimatorAlignTo.right,
            fontSize: 28,
            controller: animRef,
          ),
          const SizedBox(height: 16),
          SgButton(
            size: SgSize.sm,
            label: Text('Animar'),
            onClick: animRef.startAnimation,
          ),
        ],
      );
    },
  ),
)
```

