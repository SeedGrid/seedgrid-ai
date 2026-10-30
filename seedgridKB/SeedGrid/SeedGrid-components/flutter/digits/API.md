---
description: "API Flutter de Dígitos animados: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, digits, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Dígitos animados (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/digits/API|API — Dígitos animados (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## Comportamento comum dos dígitos

Confirmado nos arquivos de `lib/src/digits/`:

- **Callbacks:** nenhum dos oito widgets tem `on*` no construtor. A única interação imperativa é o `SgDiscardDigitController`.
- **Cores como texto CSS.** As props de cor (`color`, `backgroundColor`, `offColor`...) são `String` e passam por `parseDigitColor`/`resolveDigitColor` (`simple/digit_colors.dart`): `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()` e os nomes `transparent`, `black`, `white`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `gray`/`grey` e `orange`. Valor inválido cai no padrão do widget (não lança erro). **`hsl(var(--token))` não é entendido aqui** (diferente dos gauges e do QR, que resolvem tokens do tema).
- **Tema:** `SgSegmentDigit` usa por padrão `--sg-text` (ou `--sg-fg`); `SgRoller3DDigit` usa `--sg-surface`/`--sg-bg`, `--sg-border`, `--sg-text` e `--sg-muted`; `SgFlipDigit` usa cores fixas da biblioteca (#333232 e #edebeb) e não tem props de cor.
- **Animação:** `SgFlipDigit` usa um `Ticker` próprio (`createTicker`); `SgSevenSegmentDigit` e `SgDiscardDigit` usam `AnimationController`; `SgFadeDigit` e `SgNeonDigit` usam `Timer` (e o neon, `TweenAnimationBuilder`); `SgRoller3DDigit` usa `TweenAnimationBuilder`. Não há `TickerMode` explícito nem tratamento de "reduzir movimento" nos arquivos (busca sem resultados). Inferência: os tickers criados por `createTicker`/`vsync` seguem o `TickerMode` do framework; os `Timer` não.
- **Acessibilidade (resumo):** `SgSevenSegmentDigit`, `SgSegmentDigit`, `SgMatrixDigit` e `SgNeonDigit` usam `Semantics(image: true, label: value, excludeSemantics: true)`; `SgFadeDigit` usa o mesmo, com o rótulo do valor **exibido** no momento (`_displayValue`); `SgDiscardDigit` usa `Semantics(label: value, image: true)` com `ExcludeSemantics` por dentro (equivale ao `role="img"` do React); `SgFlipDigit` envolve tudo em `ExcludeSemantics` **sem rótulo** (o React o marca `aria-hidden`); `SgRoller3DDigit` não tem `Semantics` explícito. Nenhum recebe foco nem teclado.

## SgDiscardDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDiscardDigit` (mesmo nome).

Digito animado com transicao de descarte para representar mudanca de valores em displays compactos.

- Arquivo: `packages/seedgrid_components/lib/src/digits/animated/sg_discard_digit.dart` (linha 111) · classe `class SgDiscardDigit extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_discard_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDiscardDigit({...})` com 13 parâmetro(s) nomeado(s), 11 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgDiscardDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no display. |
| `color` | `String` | `'#0f172a'` | não | React | Cor do caractere. |
| `font` | `String?` | — | não | React | Fonte (font-family) usada no texto. |
| `backgroundColor` | `String` | `'#f8fafc'` | não | React | Cor do fundo do card. |
| `fontSize` | `num` | `64` | não | React | Escala visual do digito. |
| `fontWeight` | `Object` | `700` | não | React | Peso da fonte. Tipo no React: `string \| number`. |
| `animateOnChange` | `bool` | `true` | não | React | Ativa animacao de descarte quando o valor muda. |
| `transitionMs` | `num` | `640` | não | React | Duracao total da animacao em ms. |
| `stackDepth` | `num` | `20` | não | React | Quantidade de folhas visiveis na pilha (min 2, max 30). Ignorado se totalNumberPages for definido. |
| `totalNumberPages` | `num?` | — | não | React | Total de paginas do monte. Quando definido, a pilha visual encolhe a cada increasePage(). |
| `changeAnimationMode` | `SgDiscardDigitChangeAnimationMode` | `SgDiscardDigitChangeAnimationMode.discard` | não | React | Estrategia de animacao para mudancas por prop `value`. Valores: `discard`, `incoming`. |
| `controller` | `SgDiscardDigitController?` | — | não | Flutter | Equivale ao `ref` do React. |
| `random` | `math.Random?` | — | não | Flutter | Fonte de numeros aleatorios (extra, para teste). Padrao: `Random()`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O `ref` virou `SgDiscardDigitController`; `page()` já devolve o valor novo (no React devolve o da última renderização).
- Prop extra `random` (fonte de números aleatórios para o movimento das folhas), pensada para teste.
- A borda de baixo das folhas de fundo vira uma linha de 1 px (o Flutter não aceita raio com bordas de cores diferentes).
- A cor em texto CSS entende hex, `rgb()`, `rgba()` e algumas palavras (ver comportamento comum).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `animated/sg_discard_digit.dart`):
- `SgDiscardDigitController` (prop extra `controller`): `decreasePage()` diminui a página atual (mínimo 1) e faz a próxima troca de valor entrar por baixo; `increasePage()` aumenta (máximo `totalNumberPages`, se definido); `page()` devolve a página atual (começa em 1). Sem widget ligado, `page()` devolve 1 e as outras não fazem nada.
- `changeAnimationMode`: `discard` (a folha atual voa para fora; padrão) ou `incoming` (uma folha nova sobe por baixo). Depois de `decreasePage()` a troca seguinte sempre usa o modo `incoming`.
- `animateOnChange: false` troca o valor sem animar. `transitionMs` padrão 640; a limpeza da folha usa um `Timer` de `max(120, transitionMs)` ms. `stackDepth` (2 a 30, padrão 20) é ignorado quando `totalNumberPages` existe (a pilha encolhe a cada `increasePage()`).
- `fontSize` padrão 64 (o código do React usa 64; o meta do React diz 72, segundo o comentário da prop).

**Acessibilidade:** `Semantics(label: value, image: true)` com `ExcludeSemantics` por dentro. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgFadeDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgFadeDigit` (mesmo nome).

Digito animado com transicao de fade para exibicao de numeros e caracteres em relogios e contadores luminosos.

- Arquivo: `packages/seedgrid_components/lib/src/digits/simple/sg_fade_digit.dart` (linha 21) · classe `class SgFadeDigit extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_fade_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgFadeDigit({...})` com 5 parâmetro(s) nomeado(s), 5 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgFadeDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no card. |
| `color` | `String` | `'#edebeb'` | não | React | Cor do caractere exibido. |
| `backgroundColor` | `String` | `'#333232'` | não | React | Cor de fundo do card. |
| `font` | `String?` | — | não | React | CSS font-family for the digit. |
| `fontSize` | `num` | `70` | não | React | Escala visual do digito. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- A sombra do cartão assume 1em = 16 px (a fonte padrão do navegador).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `simple/sg_fade_digit.dart`): ao mudar `value`, o caractere atual apaga (200 ms), troca com o dígito invisível e o novo acende (200 ms); a duração é fixa (`kFadeDigitMs = 200`, sem prop). O cartão tem as mesmas proporções do `SgFlipDigit` (`fadeDigitCard`: largura 0,88 e altura 1,38 vezes o `fontSize`), para misturar os dois num relógio. Um `Timer` faz a troca e é cancelado no `dispose`.

**Acessibilidade:** `Semantics(image: true, label: _displayValue, excludeSemantics: true)`; durante o fade o rótulo é o valor que está na tela, não o novo `value`. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgFlipDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgFlipDigit` (mesmo nome).

Digito animado estilo flip para exibir numeros ou caracteres unicos em relogios, contadores e paines visuais.

- Arquivo: `packages/seedgrid_components/lib/src/digits/animated/sg_flip_digit.dart` (linha 17) · classe `class SgFlipDigit extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_flip_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgFlipDigit({...})` com 4 parâmetro(s) nomeado(s), 4 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgFlipDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no card flip. |
| `fontSize` | `num` | `70` | não | React | Tamanho da fonte do digito. |
| `width` | `num?` | `80` † | não | React | Largura visual do card. |
| `height` | `num?` | `120` † | não | React | Altura visual do card. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada na tabela de paridade para este componente.
- Observação do código (não é divergência registrada): o React usa `@pqina/flip`; o Flutter implementa o motor (`SgFlipEngine`, `animated/flip_engine.dart`) sem a biblioteca. `width` e `height` existem no contrato, mas o React também os ignora (obsoletos; use `fontSize`).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `animated/sg_flip_digit.dart`): ao mudar `value`, o motor desenha as cartas (cabeçalho do arquivo: 800 ms, ease-out-bounce, perspectiva de 4em e `rotateX`) e um `Ticker` avança o relógio do motor até ele terminar. `fontSize` (padrão 70) define a escala de tudo. As cores são as do CSS da biblioteca (#333232 e #edebeb), sem props de cor. `SgFlipDigitState` é público só para teste (expõe o motor).

**Acessibilidade:** `ExcludeSemantics` sem rótulo; o dígito é ignorado por leitores de tela (equivale ao `aria-hidden` do React). Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgMatrixDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgMatrixDigit` (mesmo nome).

Digito em estilo matriz para displays compactos de numeros e caracteres com estetica de painel digital.

- Arquivo: `packages/seedgrid_components/lib/src/digits/simple/sg_matrix_digit.dart` (linha 10) · classe `class SgMatrixDigit extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_matrix_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgMatrixDigit({...})` com 10 parâmetro(s) nomeado(s), 10 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgMatrixDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido na matriz. |
| `color` | `String` | `'#22d3ee'` | não | React | Cor principal do digito. |
| `backgroundColor` | `String` | `'#0b1220'` | não | React | Cor do fundo do display. |
| `offColor` | `String` | `'rgba(148, 163, 184, 0.22)'` | não | React | Color of inactive dots. |
| `dotSize` | `num` | `9` | não | React | Dot size in pixels. |
| `gap` | `num` | `3` | não | React | Gap between dots in pixels. |
| `charGap` | `num` | `7` | não | React | Gap between characters in pixels. |
| `padding` | `num` | `8` | não | React | Internal padding in pixels. |
| `rounded` | `num` | `10` | não | React | Border radius of the matrix container in pixels. |
| `glow` | `bool` | `true` | não | React | Add a subtle glow around active dots. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React o ponto é remontado ao trocar o caractere, então a transição de 160 ms nunca aparece; aqui também não há animação na troca de cor por prop.
- `jsToUpperCase` cobre o `SpecialCasing` incondicional; **não portado:** as sequências do grego com iota subscrito.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `simple/sg_matrix_digit.dart` e `matrix_logic.dart`): `StatelessWidget`, sem animação. Desenha `value` inteiro (vários caracteres) em matriz de pontos 5x7, em maiúsculas automaticamente; caractere sem glifo usa o glifo de "desconhecido" (o do `?`, mas com o ponto apagado). `dotSize`, `gap`, `charGap`, `padding` e `rounded` em px. Em tela estreita o painel encolhe (`FittedBox`, `BoxFit.scaleDown`).

**Acessibilidade:** `Semantics(image: true, label: value, excludeSemantics: true)`. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgNeonDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgNeonDigit` (mesmo nome).

Digito com visual neon para relogios, contadores e displays que exigem alto contraste e identidade luminosa.

- Arquivo: `packages/seedgrid_components/lib/src/digits/simple/sg_neon_digit.dart` (linha 38) · classe `class SgNeonDigit extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_neon_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgNeonDigit({...})` com 14 parâmetro(s) nomeado(s), 14 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgNeonDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no display. |
| `animateOnChange` | `bool` | `true` | não | React | Enables fade-out/fade-in animation when value changes. |
| `transitionMs` | `num` | `320` | não | React | Total animation time in milliseconds when value changes. |
| `color` | `String` | `'#e2e8f0'` | não | React | Cor luminosa principal. |
| `backgroundColor` | `String` | `'#120f2b'` | não | React | Cor de fundo do display. |
| `shadowColor` | `String?` | — | não | React | Glow/shadow color around the text. |
| `shadowStrength` | `num` | `1` | não | React | Extra intensity factor for the glow effect. |
| `fontSize` | `num` | `46` | não | React | Escala visual do digito. |
| `fontWeight` | `Object` | `600` | não | React | Font weight of the text. Tipo no React: `string \| number`. |
| `font` | `String?` | — | não | React | Font family alias (same effect as fontFamily). |
| `letterSpacing` | `num` | `0` | não | React | Letter spacing in pixels. |
| `padding` | `num` | `14` | não | React | Internal padding in pixels. |
| `rounded` | `num` | `12` | não | React | Border radius in pixels. |
| `fontFamily` | `String?` | — | não | React | Custom font family. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O filtro de brilho e saturação é aproximado por matriz de cor.
- As sombras do estado apagado foram conferidas contra o fonte do React, não executadas.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `simple/sg_neon_digit.dart`): com `animateOnChange: true` (padrão) a troca de `value` apaga o texto (fase 1), troca o conteúdo na metade da duração e acende de novo (fase 2); cada fase dura metade de `transitionMs` (padrão 320; mínimo de 40 ms por fase, conforme o comentário da prop). Um `Timer` faz a troca e é cancelado no `dispose`. `font` vence `fontFamily` (mesmo efeito); `shadowColor` padrão = a cor do texto; `shadowStrength` mínimo 0,2; `fontWeight` aceita número (100..900) ou texto (`bold`, `600`).

**Acessibilidade:** `Semantics(image: true, label: value, excludeSemantics: true)` (o novo `value`, mesmo durante a troca). Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgRoller3DDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgRoller3DDigit` (mesmo nome).

Digito animado com efeito roller 3D para mostrar caracteres unicos em relogios, marcadores e displays visuais.

- Arquivo: `packages/seedgrid_components/lib/src/digits/animated/sg_roller3d_digit.dart` (linha 53) · classe `class SgRoller3DDigit extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_roller3_d_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgRoller3DDigit({...})` com 4 parâmetro(s) nomeado(s), 4 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgRoller3DDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no display. |
| `items` | `List<String>` | `kRollerDefaultItems` | não | React | Ordered list of all possible values this roller can show. The drum scrolls to the position of `value` in this list. Tipo no React: `string[]`. |
| `fontSize` | `num` | `32` | não | React | Tamanho da fonte do digito. |
| `transitionMs` | `num` | `500` | não | React | Transition duration in milliseconds |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- A sombra interna (inset) é desenhada por `CustomPainter`, porque o Flutter não tem sombra inset.
- A máscara do tambor é um gradiente sobre o tambor inteiro, como no React (defeito do React mantido): com 10 itens, os dígitos perto das pontas (0, 1, 8, 9) aparecem esmaecidos mesmo no centro (comentário do arquivo).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `animated/sg_roller3d_digit.dart`): `StatelessWidget`; o tambor desliza por um `TweenAnimationBuilder` com a curva `cubic-bezier(0.22, 1, 0.36, 1)` em `transitionMs` (padrão 500). `value` precisa estar em `items` (padrão `kRollerDefaultItems`); se não estiver, o widget fica no primeiro item. A cor ativa e a esmaecida vêm dos tokens `--sg-text` e `--sg-muted`.

**Acessibilidade:** nenhum `Semantics` explícito encontrado em `sg_roller3d_digit.dart`; Inferência: todos os `Text` dos itens do tambor ficam na árvore semântica. Não confirmado com leitor de tela. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgSegmentDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgSegmentDigit` (mesmo nome).

Digito em estilo segmentado para relogios, paines industriais e displays numericos classicos.

- Arquivo: `packages/seedgrid_components/lib/src/digits/simple/sg_segment_digit.dart` (linha 11) · classe `class SgSegmentDigit extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_segment_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgSegmentDigit({...})` com 3 parâmetro(s) nomeado(s), 3 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgSegmentDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no display. |
| `size` | `num` | `16` | não | React | Display height in pixels. |
| `color` | `String?` | — | não | React | Cor dos segmentos ativos. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada na tabela de paridade para este componente.

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `simple/sg_segment_digit.dart`): `StatelessWidget`, sem animação. Desenha o primeiro caractere de `value` em retângulos (grade 6x10; os dois pontos usam 4x10): dígito, `-`, `:` ou espaço; qualquer outro vira espaço. `size` é a altura em px; `color` padrão = o token `--sg-text` (ou `--sg-fg`; preto se nenhum existir).

**Acessibilidade:** `Semantics(image: true, label: value, excludeSemantics: true)`. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

## SgSevenSegmentDigit

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgSevenSegmentDigit` (mesmo nome).

Digito de sete segmentos para displays classicos de relogio, paineis eletronicos e contadores numericos.

- Arquivo: `packages/seedgrid_components/lib/src/digits/simple/sg_seven_segment_digit.dart` (linha 13) · classe `class SgSevenSegmentDigit extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_seven_segment_digit.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgSevenSegmentDigit({...})` com 13 parâmetro(s) nomeado(s), 13 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgSevenSegmentDigit

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | Caractere exibido no display. |
| `palette` | `SgSevenSegmentDigitPalette` | `SgSevenSegmentDigitPalette.red` | não | React | Preset visual palette for active, inactive and background colors. Valores: `blue`, `green`, `red`, `white`, `yellow`. |
| `color` | `String?` | — | não | React | Cor dos segmentos ativos. |
| `backgroundColor` | `String?` | — | não | React | Cor do fundo do display. |
| `offColor` | `String?` | — | não | React | Color of inactive segments. |
| `size` | `num` | `108` | não | React | Component height in pixels. |
| `width` | `num?` | — | não | React | Component width in pixels. By default, derived from `size`. |
| `thickness` | `num` | `14` | não | React | Segment thickness in pixels. |
| `padding` | `num` | `10` | não | React | Internal panel padding in pixels. |
| `rounded` | `num` | `12` | não | React | Border radius of the panel in pixels. |
| `skew` | `num` | `-8` | não | React | Applies a subtle skew to mimic classic LED displays. |
| `glow` | `bool` | `true` | não | React | Enables glow effect on active segments. |
| `transitionMs` | `num` | `180` | não | React | Segment transition duration in milliseconds. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- A sombra interna do painel é aproximada.
- A troca de cor por prop é imediata (no React anima); a transição dos segmentos ao trocar `value` anima em `transitionMs`.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `simple/sg_seven_segment_digit.dart` e `seven_segment_logic.dart`): usa o primeiro caractere de `value`, em maiúsculas; glifos definidos: 0-9, A, B, C, D, E, F, H, J, L, P, U, Y, `-`, `_` e espaço (`kSevenSegmentGlyphs`). Cada segmento transita entre apagado e aceso por um `AnimationController` (curva `ease`, `transitionMs` padrão 180; 0 ou menos troca na hora). As paletas `blue`, `green`, `red` (padrão), `white` e `yellow` dão `color`, `backgroundColor` e `offColor`; cada uma dessas props, quando informada, vence a paleta. `size` mínimo 48 px; `width` padrão 62% da altura (mínimo 28); `skew` em graus.

**Acessibilidade:** `Semantics(image: true, label: value, excludeSemantics: true)`. Ver também o [comportamento comum dos dígitos](#comportamento-comum-dos-dígitos).

