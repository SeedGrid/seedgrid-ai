---
description: "Exemplos Dart de Dígitos animados em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, digits, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Dígitos animados (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/digits/Exemplos|Exemplos — Dígitos animados (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/digits/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgDiscardDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_discard_digit_page.dart` (5 exemplo(s) na página; abaixo 3).

### Descarte (padrão)

A folha de cima voa para fora em 640 ms e o valor novo aparece embaixo. O movimento é sorteado a cada troca.

Região `sgDiscardDigitDescarte` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgDiscardDigit(value: '$_n'),
    SgButton(
      label: Text('Próximo'),
      onClick: () => setState(() => _n = _n % 9 + 1),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_n`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

### Entrando por baixo

changeAnimationMode: incoming — a folha nova sobe por baixo e o topo só muda no fim.

Região `sgDiscardDigitEntrando` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgDiscardDigit(
      value: '$_n',
      changeAnimationMode:
          SgDiscardDigitChangeAnimationMode.incoming,
    ),
    SgButton(
      label: Text('Próximo'),
      onClick: () => setState(() => _n = _n % 9 + 1),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_n`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

### Páginas de um monte

totalNumberPages faz a pilha encolher a cada increasePage(); decreasePage() traz a folha de volta por baixo.

Região `sgDiscardDigitPaginas` em `sg_discard_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgDiscardDigit(
      value: '$_page',
      controller: _pages,
      totalNumberPages: 8,
      stackDepth: 8,
    ),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Página $_page de 8'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 16,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            SgButton(
              label: Text('Anterior'),
              appearance: SgAppearance.outline,
              onClick: () => setState(() {
                _pages.decreasePage();
                _page = _pages.page();
              }),
            ),
            SgButton(
              label: Text('Próxima'),
              onClick: () => setState(() {
                _pages.increasePage();
                _page = _pages.page();
              }),
            ),
          ],
        ),
      ],
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_page`, `_pages`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

## SgFadeDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_fade_digit_page.dart` (3 exemplo(s) na página; abaixo 3).

### Cartão com fade

O cartão tem as mesmas proporções do SgFlipDigit: 88% x 138% do fontSize.

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

### Cores e tamanhos

color, backgroundColor, fontSize e font.

Região `sgFadeDigitCores` em `sg_fade_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgFadeDigit(
      value: '2',
      color: '#111827',
      backgroundColor: '#fde68a',
    ),
    SgFadeDigit(
      value: '9',
      fontSize: 40,
      color: '#22c55e',
      backgroundColor: '#052e16',
    ),
    SgFadeDigit(value: '0', fontSize: 100),
    SgFadeDigit(value: '1', fontSize: 24, font: 'monospace'),
  ],
)
```

### Troca de valor

O dígito atual apaga (200 ms), o novo entra invisível e acende (200 ms).

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
            child: Text('Próximo'),
          ),
        ],
      ),
    );
  },
)
```

## SgFlipDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_flip_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Contador

Cada troca de valor vira uma carta que gira em 800 ms com ease-out-bounce (o padrão do @pqina/flip).

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
      label: Text('Zerar'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _n = 0),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_n`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

### Tamanhos

fontSize controla a escala do conjunto: as medidas vêm de múltiplos dele.

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

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_n`). Declare esses membros no seu `State` para copiá-lo.

### Vários dígitos

Um dígito por caractere, como num relógio de cartas. Só gira quem mudou.

Região `sgFlipDigitVarios` em `sg_flip_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    for (final ch in _clock.toString().padLeft(4, '0').split(''))
      SgFlipDigit(value: ch, fontSize: 44),
    SgButton(
      label: Text('Somar 111'),
      size: SgSize.sm,
      onClick: () =>
          setState(() => _clock = (_clock + 111) % 10000),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_clock`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

## SgMatrixDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_matrix_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Texto em matriz de pontos

Letras, números e símbolos comuns em grade 5 x 7; minúsculas viram maiúsculas.

Região `sgMatrixDigitTexto` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const SgMatrixDigit(value: 'Seed Grid 2026')
```

### Cores e brilho

color, offColor e backgroundColor; glow desliga o brilho dos pontos acesos.

Região `sgMatrixDigitCores` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    SgMatrixDigit(
      value: '12:34',
      color: '#22c55e',
      backgroundColor: '#04120a',
      offColor: 'rgba(34, 197, 94, 0.15)',
    ),
    SgMatrixDigit(
      value: 'OK',
      color: '#f97316',
      backgroundColor: '#1a0b02',
      offColor: 'rgba(249, 115, 22, 0.15)',
    ),
    SgMatrixDigit(value: 'OFF', glow: false),
  ],
)
```

### Medidas

dotSize, gap, charGap, padding e rounded em pixels.

Região `sgMatrixDigitMedidas` em `sg_matrix_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 12,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgMatrixDigit(value: 'AB', dotSize: 5, gap: 1, charGap: 4),
    SgMatrixDigit(value: 'AB'),
    SgMatrixDigit(
      value: 'AB',
      dotSize: 13,
      gap: 4,
      charGap: 12,
      padding: 14,
      rounded: 24,
    ),
    SgMatrixDigit(value: 'AB', gap: 0, padding: 0, rounded: 0),
  ],
)
```

## SgNeonDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_neon_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Brilho neon

Cinco camadas de brilho no texto e duas no contorno, todas em torno da cor do texto.

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

shadowStrength (mínimo 0,2), fontSize, fontWeight (número ou texto), letterSpacing, padding e rounded.

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

### Troca de valor com apagar e acender

Ao trocar o valor, o texto apaga, muda na metade de transitionMs e acende de novo (animateOnChange).

Região `sgNeonDigitTroca` em `sg_neon_digit_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    var value = 1;
    return StatefulBuilder(
      builder: (context, set) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SgNeonDigit(value: '$value', transitionMs: 400),
          const SizedBox(width: 24),
          FilledButton(
            onPressed: () => set(() => value = value % 9 + 1),
            child: Text('Próximo'),
          ),
        ],
      ),
    );
  },
)
```

## SgRoller3DDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_roller3d_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Dígitos de 0 a 9

O tambor desliza até a posição de value em 500 ms com cubic-bezier(0.22, 1, 0.36, 1).

Região `sgRoller3dDigitDigitos` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgRoller3DDigit(value: '$_digit', fontSize: 32),
    SgButton(
      label: Text('Próximo'),
      onClick: () => setState(() => _digit = (_digit + 1) % 10),
    ),
    SgButton(
      label: Text('Aleatório'),
      appearance: SgAppearance.outline,
      onClick: () => setState(() => _digit = (_digit * 7 + 3) % 10),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_digit`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

### Minutos (00 a 59)

items define os valores; a largura cresce com o maior deles.

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
      label: Text('+7 minutos'),
      onClick: () => setState(() => _minute = (_minute + 7) % 60),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_minute`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

### Letras (A a Z)

Região `sgRoller3dDigitLetras` em `sg_roller3d_digit_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgRoller3DDigit(
      value: String.fromCharCode(65 + _letter),
      items: List.generate(26, (i) => String.fromCharCode(65 + i)),
      fontSize: 32,
    ),
    SgButton(
      label: Text('Próxima letra'),
      onClick: () => setState(() => _letter = (_letter + 5) % 26),
    ),
  ],
)
```

Observação: este trecho não é autocontido; ele usa estado e controllers da página do showcase (`_letter`) e `setState`. Declare esses membros no seu `State` para copiá-lo.

## SgSegmentDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_segment_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Algarismos, sinal e dois pontos

Cada glifo é um conjunto de retângulos numa grade de 6 x 10 (dois pontos: 4 x 10).

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

size é a altura em pixels; a largura segue a proporção.

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

### Cores

Sem color, usa a cor de texto do tema; com color, aceita #rrggbb, rgb() e rgba().

Região `sgSegmentDigitCores` em `sg_segment_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgSegmentDigit(value: '1', size: 48),
    SgSegmentDigit(value: '2', size: 48, color: '#ef4444'),
    SgSegmentDigit(value: '3', size: 48, color: 'rgb(37, 99, 235)'),
    SgSegmentDigit(
      value: '4',
      size: 48,
      color: 'rgba(22, 163, 74, 0.5)',
    ),
  ],
)
```

## SgSevenSegmentDigit

Página: `apps/seedgrid_showcase/lib/pages/sg_seven_segment_digit_page.dart` (4 exemplo(s) na página; abaixo 3).

### Algarismos e letras

Cada caractere acende os segmentos da tabela do React; sem glifo, apaga tudo.

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

red (padrão), blue, yellow, green e white; color, backgroundColor e offColor vencem a paleta.

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

### Tamanho, espessura, inclinação e brilho

Região `sgSevenSegmentDigitMedidas` em `sg_seven_segment_digit_page.snippets.g.dart`.

```dart
const Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.end,
  children: [
    SgSevenSegmentDigit(value: '4', size: 48, thickness: 5),
    SgSevenSegmentDigit(value: '2', size: 108),
    SgSevenSegmentDigit(
      value: '7',
      size: 108,
      thickness: 8,
      width: 80,
    ),
    SgSevenSegmentDigit(
      value: '5',
      size: 108,
      thickness: 8,
      skew: 0,
      rounded: 0,
    ),
    SgSevenSegmentDigit(
      value: '3',
      size: 108,
      thickness: 8,
      skew: 15,
      glow: false,
    ),
  ],
)
```

