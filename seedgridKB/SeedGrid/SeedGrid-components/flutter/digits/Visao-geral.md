---
description: "Dígitos animados em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, digits]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Dígitos animados — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/digits/Visao-geral|Dígitos animados — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/digits/API|API — Dígitos animados (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos|Exemplos — Dígitos animados (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

8 componente(s): **8 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgDiscardDigit` | portado | Pilha de folhas: a do topo é descartada ao trocar o valor, com paginação. | `pages/sg_discard_digit_page.dart` |
| `SgFadeDigit` | portado | Cartão que apaga o caractere atual e acende o novo (fade de 200 ms). | `pages/sg_fade_digit_page.dart` |
| `SgFlipDigit` | portado | Cartão que vira como placar de aeroporto ao trocar o caractere. | `pages/sg_flip_digit_page.dart` |
| `SgMatrixDigit` | portado | Texto em matriz de pontos 5x7, no estilo painel LED. | `pages/sg_matrix_digit_page.dart` |
| `SgNeonDigit` | portado | Texto com brilho neon e troca que apaga e acende. | `pages/sg_neon_digit_page.dart` |
| `SgRoller3DDigit` | portado | Tambor vertical que rola até o valor dentro de uma lista de itens. | `pages/sg_roller3d_digit_page.dart` |
| `SgSegmentDigit` | portado | Dígito compacto em retângulos, na cor do tema, com suporte a dois pontos. | `pages/sg_segment_digit_page.dart` |
| `SgSevenSegmentDigit` | portado | Display LED de sete segmentos com paletas, brilho e inclinação. | `pages/sg_seven_segment_digit_page.dart` |

## Quando usar

- `SgFlipDigit`: contador ou placar que "vira" a cada troca (estilo aeroporto). Para o mesmo cartão sem o giro use `SgFadeDigit` (mesmas proporções, dá para misturar num relógio).
- `SgSevenSegmentDigit`: visor numérico clássico, grande, com paleta (0-9 e algumas letras). Para um dígito pequeno que herda a cor do tema use `SgSegmentDigit` (aceita `:` e `-`).
- `SgMatrixDigit`: texto livre (vários caracteres) em painel de pontos; é o único dígito que desenha mais de um caractere num widget só.
- `SgRoller3DDigit`: rolagem tipo odômetro com um conjunto próprio de valores (`items`).
- `SgDiscardDigit`: efeito de "folhear" páginas, com `SgDiscardDigitController` para avançar e voltar.
- `SgNeonDigit`: efeito decorativo de alto contraste; `SgFadeDigit` para a troca suave sem brilho.
- Para animar uma palavra inteira use `SgStringAnimator`, e para um relógio completo `SgClock` com `digitalStyle` (ambos em [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|Gadgets (Flutter)]]).

## O que muda em relação ao React

Os oito dígitos estão **portados** ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]). O `SgFlipDigit` não usa a biblioteca `@pqina/flip`: o motor do giro foi reescrito em Dart; o `ref` do `SgDiscardDigit` virou `SgDiscardDigitController`; as cores são texto CSS e passam por um parser próprio (sem `hsl(var(--token))`). Não há callbacks, como no React. Detalhes por componente na [[SeedGrid/SeedGrid-components/flutter/digits/API|API]]; regras gerais em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

O grupo React ([[SeedGrid/SeedGrid-components/digits/Visao-geral|Dígitos (React)]]) não tem hooks nem funções além dos oito componentes; os tipos exportados também têm equivalente: `SgDiscardDigitHandle` -> `SgDiscardDigitController` e `SgSevenSegmentDigitPalette` -> o enum de mesmo nome (`SgSevenSegmentDigitPalette.red` etc.). Nenhum símbolo do grupo ficou sem equivalente. Extras só do Flutter: o motor `SgFlipEngine`, os helpers de lógica (`seven_segment_logic.dart`, `matrix_logic.dart`, `neon_logic.dart`, `segment_logic.dart`) e `parseDigitColor`/`resolveDigitColor`.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `sgEaseOutBounce` | função | `ease-out-bounce` do Tick (padrao do flip: `flipEasing`). | `lib/src/digits/animated/digits_support.dart` |
| `sgEaseOutCubic` | função | `ease-out-cubic` do Tick. | `lib/src/digits/animated/digits_support.dart` |
| `sgEaseOutSine` | função | `ease-out-sine` do Tick. | `lib/src/digits/animated/digits_support.dart` |
| `SgFlipCard` | class | Uma carta: frente (metade de cima) e verso (metade de baixo). | `lib/src/digits/animated/flip_engine.dart` |
| `SgFlipEngine` | class | — | `lib/src/digits/animated/flip_engine.dart` |
| `SgDiscardMotion` | class | Movimento sorteado de uma folha (o que `createRandomMotion` devolve no React). | `lib/src/digits/animated/sg_discard_digit.dart` |
| `sgCreateRandomMotion` | função | `createRandomMotion` do React (mesma ordem de sorteios: lado, tx, ty, rotateZ, rotateX, scale). | `lib/src/digits/animated/sg_discard_digit.dart` |
| `SgDiscardMetrics` | class | Medidas do conjunto (iguais as do React). | `lib/src/digits/animated/sg_discard_digit.dart` |
| `sgDiscardDepth` | função | Profundidade da pilha: `totalNumberPages` manda; senao `stackDepth` (2 a 30). | `lib/src/digits/animated/sg_discard_digit.dart` |
| `SgDiscardDigitController` | class | Equivale ao `ref` (`SgDiscardDigitHandle`) do React. | `lib/src/digits/animated/sg_discard_digit.dart` |
| `SgFlipDigitState` | class | Estado publico para testes: expoe o motor e o relogio do flip. | `lib/src/digits/animated/sg_flip_digit.dart` |
| `SgRollerMetrics` | class | Medidas do roller: iguais as do React (`Math.round` do JS arredonda .5 para cima). | `lib/src/digits/animated/sg_roller3d_digit.dart` |
| `parseDigitColor` | função | Converte um texto de cor CSS em [Color]; devolve `null` se nao entender. | `lib/src/digits/simple/digit_colors.dart` |
| `resolveDigitColor` | função | [parseDigitColor] com cor de reserva (a prop invalida cai no padrao, em vez de quebrar). | `lib/src/digits/simple/digit_colors.dart` |
| `paintOuterShadow` | função | `box-shadow: dx dy blur spread color` (sombra externa): desenha [rrect] deslocado e dilatado, desfocado. | `lib/src/digits/simple/digit_paint.dart` |
| `paintInsetShadow` | função | `box-shadow: inset dx dy blur spread color`: preenche o que fica FORA do [rrect] (encolhido pelo [spread] e deslocado), desfocado, recortado ao proprio [rrect]. | `lib/src/digits/simple/digit_paint.dart` |
| `scaleAlpha` | função | Mesma cor com o alfa multiplicado por [factor] (0..1). | `lib/src/digits/simple/digit_paint.dart` |
| `matrixGlyph` | função | Glifo de um caractere ja em maiusculo. | `lib/src/digits/simple/matrix_logic.dart` |
| `jsToUpperCase` | função | Maiusculas com as mesmas regras do `String.prototype.toUpperCase` do JavaScript. O Dart so aplica o mapeamento simples (1 caractere para 1), e o JavaScript tambem expande alguns ("ß" vira "SS"), o que muda QUANTOS caracteres a matriz desenha. Cobre a tabela incondicional do Unicode SpecialCasing, sem as sequencias do grego com iota subscrito (essas caem no mapeamento simples do Dart). | `lib/src/digits/simple/matrix_logic.dart` |
| `matrixChars` | função | Caracteres a desenhar: [value] em maiusculo (como o JavaScript), por ponto de codigo; vazio vira um espaco. | `lib/src/digits/simple/matrix_logic.dart` |
| `matrixGlowSize` | função | Raio do brilho dos pontos acesos. | `lib/src/digits/simple/matrix_logic.dart` |
| `NeonShadow` | class | Camada de sombra: `0 0 {blur}px {color}`; [inset] = sombra interna do contorno. | `lib/src/digits/simple/neon_logic.dart` |
| `NeonMetrics` | class | — | `lib/src/digits/simple/neon_logic.dart` |
| `neonMetrics` | função | Raios do brilho, proporcionais a [fontSize] e a [shadowStrength] (minimo 0,2). | `lib/src/digits/simple/neon_logic.dart` |
| `neonTextShadows` | função | Sombras do texto: acesas (5 camadas) ou apagadas (1 camada fraca). | `lib/src/digits/simple/neon_logic.dart` |
| `neonContainerShadows` | função | Sombras do contorno: uma interna escura e duas externas coloridas (ou a versao apagada, de duas camadas). | `lib/src/digits/simple/neon_logic.dart` |
| `lerpNeonShadows` | função | Interpola duas listas de sombras como o CSS: par a par, e a lista mais curta e completada com sombras transparentes de raio 0. [t] = 0 devolve [dim]; 1 devolve [lit]. | `lib/src/digits/simple/neon_logic.dart` |
| `SegmentGeometry` | class | — | `lib/src/digits/simple/segment_logic.dart` |
| `segmentGeometry` | função | `char`, grade, tamanho final e retangulos para [value] com altura [size]. | `lib/src/digits/simple/segment_logic.dart` |
| `SevenSegmentPaletteColors` | class | Cores de uma paleta (como texto CSS, igual ao React). | `lib/src/digits/simple/seven_segment_logic.dart` |
| `sevenSegmentActive` | função | Segmentos acesos para [value]: usa o primeiro caractere, em maiusculo (`segmentSetFor` do React). Caractere sem glifo apaga tudo. | `lib/src/digits/simple/seven_segment_logic.dart` |
| `SevenSegmentLayout` | class | Geometria do painel e dos 7 segmentos, em pixels (todas as contas do React, na mesma ordem). | `lib/src/digits/simple/seven_segment_logic.dart` |
| `sevenSegmentLayout` | função | — | `lib/src/digits/simple/seven_segment_logic.dart` |
| `SgMatrixPainter` | class | Pintor da matriz (publico para os testes). | `lib/src/digits/simple/sg_matrix_digit.dart` |
| `neonFontWeight` | função | `fontWeight` do React: numero (100..900) ou texto (`bold`, `normal`, `600`). | `lib/src/digits/simple/sg_neon_digit.dart` |
| `SgNeonBoxPainter` | class | Pintor do contorno do neon: sombras externas, fundo e sombras internas (publico para os testes). | `lib/src/digits/simple/sg_neon_digit.dart` |
| `SgSegmentPainter` | class | Pintor do glifo (publico para os testes). | `lib/src/digits/simple/sg_segment_digit.dart` |
| `SgSevenSegmentPainter` | class | Pintor do display (publico para os testes inspecionarem `levels`). | `lib/src/digits/simple/sg_seven_segment_digit.dart` |

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase; as afirmações vêm da leitura do código no commit `e9989b8` e do `docs/paridade.json`.
- Os números de duração e curva do `SgFlipDigit` (800 ms, ease-out-bounce) são os do comentário de cabeçalho do arquivo; não medi a animação.
- Acessibilidade: li os `Semantics`/`ExcludeSemantics` do código; não testei com leitor de tela (o `SgRoller3DDigit` ficou sem confirmação).
- A tabela de símbolos públicos foi filtrada pelos `show` dos barris dos dígitos.
