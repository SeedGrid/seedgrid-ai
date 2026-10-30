---
description: "Exemplos Dart de Gadgets (relógio, calendário, gauges, QR) em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, gadgets, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Gadgets (relógio, calendário, gauges, QR) (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/gadgets/Exemplos|Exemplos — Gadgets (relógio, calendário, gauges, QR) (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/gadgets/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgCalendar

Página: `apps/seedgrid_showcase/lib/pages/sg_calendar_page.dart` (5 exemplo(s) na página; abaixo 3).

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

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_page.dart` (7 exemplo(s) na página; abaixo 3).

### Digital

Relógio digital padrão: 24 horas, com segundos. initialServerTime fixa a hora de partida; o relógio anda sozinho.

Região `sgClockDigital` em `sg_clock_page.snippets.g.dart`.

```dart
const SgClock(
  initialServerTime: '2026-06-15T09:41:07-03:00',
  timezone: 'America/Sao_Paulo',
)
```

### Fuso, idioma e 12 horas

timezone aceita nomes de fuso conhecidos (America/Sao_Paulo, Europe/Paris, Asia/Tokyo...), UTC e deslocamentos (+03:00). O período do dia vem do idioma.

Região `sgClock12h` em `sg_clock_page.snippets.g.dart`.

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
      timezone: 'Asia/Tokyo',
      format: SgClockFormat.v12h,
      locale: 'es',
    ),
  ],
)
```

### Tamanhos

size: sm, md (padrão), lg ou um número em pixels (altura de linha 1).

Região `sgClockTamanhos` em `sg_clock_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgClock(
      size: 'sm',
      initialServerTime: '2026-06-15T12:00:00Z',
      timezone: 'UTC',
    ),
    SgClock(
      size: 'lg',
      initialServerTime: '2026-06-15T12:00:00Z',
      timezone: 'UTC',
    ),
    SgClock(
      size: 28,
      initialServerTime: '2026-06-15T12:00:00Z',
      timezone: 'UTC',
    ),
  ],
)
```

## SgTimeProvider

Página: `apps/seedgrid_showcase/lib/pages/sg_time_provider_page.dart` (4 exemplo(s) na página; abaixo 3).

### Uma hora para toda a árvore

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

Página: `apps/seedgrid_showcase/lib/pages/sg_clock_theme_provider_page.dart` (4 exemplo(s) na página; abaixo 3).

### Registrando os temas embutidos

Os temas embutidos não vêm registrados: passe sgClockThemesBuiltIn no value. Todos os relógios abaixo do provider enxergam os temas.

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

### Um tema local

themes aceita temas próprios, que valem só abaixo do provider e vencem os globais de mesmo id.

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

### Escolhendo o tema de um relógio

O seletor lê os temas do SgClockThemeProvider mais próximo; o relógio ao lado usa o tema escolhido.

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

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_tema`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

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

### Os temas embutidos

Os dez temas que vêm com a biblioteca, em 72 px.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_linear_gauge_page.dart` (4 exemplo(s) na página; abaixo 3).

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

Página: `apps/seedgrid_showcase/lib/pages/sg_radial_gauge_page.dart` (5 exemplo(s) na página; abaixo 3).

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

Página: `apps/seedgrid_showcase/lib/pages/sg_qr_code_page.dart` (4 exemplo(s) na página; abaixo 3).

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

logoSrc (URL) ou logoImage (qualquer ImageProvider) com tamanho, respiro e cantos configuráveis.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_string_animator_page.dart` (5 exemplo(s) na página; abaixo 3).

### Animação manual (roller3d)

A animação só começa quando você chama startAnimation(), pelo controller (o ref do React).

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
            child: Text('Animar'),
          ),
        ],
      );
    },
  ),
)
```

### Troca de alvo com autoStart (flip)

Com autoStart a animação roda na montagem e sempre que targetString muda.

Região `sgStringAnimatorAuto` em `sg_string_animator_page.snippets.g.dart`.

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Builder(
    builder: (context) {
      var target = 'LUCIANO';
      return StatefulBuilder(
        builder: (context, set) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgStringAnimator(
              sourceString: 'LUCIANO',
              targetString: target,
              stringAnimatorStyle:
                  SgStringAnimatorStringAnimatorStyle.flip,
              autoStart: true,
              velocity: 70,
              fontSize: 28,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final nome in const ['MARTA', 'JOAO', 'ANA'])
                  OutlinedButton(
                    onPressed: () => set(() => target = nome),
                    child: Text(nome),
                  ),
              ],
            ),
          ],
        ),
      );
    },
  ),
)
```

### Números alinhados à direita

alignTo: right preenche à esquerda com emptyChar e anima as unidades primeiro; charset limita o tambor.

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
            child: Text('Contar'),
          ),
        ],
      );
    },
  ),
)
```

