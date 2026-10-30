---
tags: [seedgrid, front, component, digits]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/digits
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Dígitos animados (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API — dígitos animados (`digits`) — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/digits/API|API — Dígitos animados (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/digits/Visao-geral|Dígitos — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/digits/Exemplos|Dígitos — exemplos]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Características comuns (Confirmado, leitura dos 8 arquivos):
- Todos recebem `value: string` obrigatório e animam/redesenham quando ele muda. Nenhum dispara eventos (não há props de callback).
- Nenhum repassa atributos DOM arbitrários (sem `...rest`); só `className` e, em alguns, `style`.
- Somente `SgDiscardDigit` aceita `ref` (handle imperativo). Os demais são componentes de função sem `forwardRef`.
- Nenhum consome contexto/provider; não usam i18n.
- Import: todos pelo barrel `@seedgrid/fe-components` (também reexportados pelos `index.ts` de cada subpasta, que não são entradas públicas do `package.json`).

## SgDiscardDigit

Pilha de folhas de papel: a folha do topo é "descartada" (voa para fora) ou "chega" (`incoming`) quando `value` muda; suporta paginação imperativa. Fonte: `src/digits/discard-digit/SgDiscardDigit.tsx` → `SgDiscardDigit`.

### Import
```tsx
import { SgDiscardDigit, type SgDiscardDigitProps, type SgDiscardDigitHandle } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | Texto/valor exibido na folha do topo. |
| `color` | `string` | `"#0f172a"` | Não | Cor do texto principal. |
| `font` | `string` | — | Não | Fonte (font-family) usada no texto. |
| `backgroundColor` | `string` | `"#f8fafc"` | Não | Cor de fundo das folhas. |
| `fontSize` | `number` | `64` | Não | Tamanho da fonte em px (escala geral do bloco). |
| `fontWeight` | `number \| string` | `700` | Não | Peso da fonte. |
| `animateOnChange` | `boolean` | `true` | Não | Ativa animacao de descarte quando o valor muda. |
| `transitionMs` | `number` | `640` | Não | Duracao total da animacao em ms. |
| `stackDepth` | `number` | `20` | Não | Quantidade de folhas visiveis na pilha (min 2, max 30). Ignorado se totalNumberPages for definido. |
| `totalNumberPages` | `number` | — | Não | Total de paginas do monte. Quando definido, a pilha visual encolhe a cada increasePage(). |
| `changeAnimationMode` | `"discard" \| "incoming"` | `"discard"` | Não | Estrategia de animacao para mudancas por prop `value`. |
| `className` | `string` | — | Não | Classes CSS adicionais. |
| `style` | `React.CSSProperties` | — | Não | Estilo inline adicional. |

- Aceita `ref` (via `React.forwardRef`) e `key`.

### Eventos e callbacks
Nenhum. A mudança de `value` dispara a animação (se `animateOnChange`); com `changeAnimationMode="discard"` a folha atual voa com movimento aleatório (`createRandomMotion`), com `"incoming"` a nova folha entra sobre a pilha. Confirmado.

### Ref
`React.forwardRef<SgDiscardDigitHandle, SgDiscardDigitProps>` com `useImperativeHandle` (Confirmado):

| Método | Retorno | Comportamento |
|---|---|---|
| `decreasePage()` | `void` | Página atual − 1 (mínimo 1). |
| `increasePage()` | `void` | Página atual + 1 (máximo `totalNumberPages`, se definido; sem limite caso contrário). |
| `page()` | `number` | Página atual (1-indexed). |

Profundidade visual da pilha: com `totalNumberPages` = `clamp(totalNumberPages − páginaAtual + 1, 1, 30)`; sem ele = `clamp(stackDepth, 2, 30)`. O handle **não** altera `value` — o exemplo do showcase atualiza `value` e chama o método em paralelo.

### Children, slots e composição
Não aceita `children`. Usado internamente por `SgClock` (`digitalStyle="discard"`) e `SgStringAnimator` (`stringAnimatorStyle="discard"`).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Raiz com `role="img"` e `aria-label={value}`; camadas decorativas com `aria-hidden="true"`. Sem tratamento de `prefers-reduced-motion` encontrado. Confirmado.

### Tipos auxiliares exportados
`SgDiscardDigitHandle` (acima).

## SgFadeDigit

Card em que o caractere atual some (fade-out) e o novo aparece (fade-in). Fonte: `src/digits/fade-digit/SgFadeDigit.tsx` → `SgFadeDigit`.

### Import
```tsx
import { SgFadeDigit, type SgFadeDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | Character to display. When changed, the current digit fades out and the new one fades in. |
| `color` | `string` | `"#edebeb"` | Não | Text color of the digit. |
| `backgroundColor` | `string` | `"#333232"` | Não | Card background color. |
| `font` | `string` | — | Não | CSS font-family for the digit. |
| `fontSize` | `number` | `70` | Não | Font size in pixels — controls overall card scale. |
| `className` | `string` | — | Não | Additional CSS classes on the outer card wrapper. |

### Eventos e callbacks
Nenhum. Duração fixa do fade: constante interna `FADE_MS = 200` ms (não configurável). Confirmado.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="fade"`) e `SgStringAnimator`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Raiz com `aria-label={displayValue}` (valor exibido no momento), sem `role`. Confirmado.

## SgFlipDigit

Card "flip" (estilo placar de aeroporto) implementado com a biblioteca `@pqina/flip` (MIT), carregada por `import()` dinâmico dentro de `useEffect` (seguro para SSR). O CSS da biblioteca é embutido e injetado uma vez em `<style id="pqina-flip-css">`. Fonte: `src/digits/flip-digit/SgFlipDigit.tsx` → `SgFlipDigit`.

### Import
```tsx
import { SgFlipDigit, type SgFlipDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | The character to display (single char) |
| `fontSize` | `number` | `70` | Não | Font size in pixels — controls overall scale |
| `className` | `string` | — | Não | Additional CSS classes applied to the outer wrapper |

### Eventos e callbacks
Nenhum. Mudanças de `value` são aplicadas à instância `Tick` (`tickRef.current.value = value`).

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="flip"`) e `SgStringAnimator`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
O wrapper interno criado para a biblioteca recebe `aria-hidden="true"`; o componente **não** expõe `aria-label` nem `role` com o valor — o dígito não é anunciado por leitores de tela. Confirmado (lacuna de acessibilidade).

## SgMatrixDigit

Texto desenhado em matriz de pontos 5×7 (estilo painel LED). Aceita string com vários caracteres. Fonte: `src/digits/matrix-digit/SgMatrixDigit.tsx` → `SgMatrixDigit`.

### Import
```tsx
import { SgMatrixDigit, type SgMatrixDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — (`?? ""` interno) | Sim | Text to render using matrix dots. Supports letters, numbers and common symbols. Convertido para maiúsculas; glifos: espaço, 0-9, A-Z, `- _ . : / ? !`; demais caracteres usam um glifo de fallback. |
| `color` | `string` | `"#22d3ee"` | Não | Color of active dots. |
| `backgroundColor` | `string` | `"#0b1220"` | Não | Background color of the matrix container. |
| `offColor` | `string` | `"rgba(148, 163, 184, 0.22)"` | Não | Color of inactive dots. |
| `dotSize` | `number` | `9` | Não | Dot size in pixels. |
| `gap` | `number` | `3` | Não | Gap between dots in pixels. |
| `charGap` | `number` | `7` | Não | Gap between characters in pixels. |
| `padding` | `number` | `8` | Não | Internal padding in pixels. |
| `rounded` | `number` | `10` | Não | Border radius of the matrix container in pixels. |
| `glow` | `boolean` | `true` | Não | Add a subtle glow around active dots. |
| `className` | `string` | — | Não | Additional CSS classes for the outer wrapper. |
| `style` | `React.CSSProperties` | — | Não | Additional CSS style for the outer wrapper. |

### Eventos e callbacks
Nenhum.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="matrix"`) e `SgStringAnimator`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
`role="img"` + `aria-label={value}`; pontos com `aria-hidden`. Confirmado.

## SgNeonDigit

Texto com brilho neon (`text-shadow`) e troca com fade-out/fade-in. Fonte: `src/digits/neon-digit/SgNeonDigit.tsx` → `SgNeonDigit`.

### Import
```tsx
import { SgNeonDigit, type SgNeonDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | Text/character rendered with neon style. |
| `animateOnChange` | `boolean` | `true` | Não | Enables fade-out/fade-in animation when value changes. |
| `transitionMs` | `number` | `320` | Não | Total animation time in milliseconds when value changes. |
| `color` | `string` | `"#e2e8f0"` | Não | Main text color. |
| `backgroundColor` | `string` | `"#120f2b"` | Não | Background color of the component surface. |
| `shadowColor` | `string` | `?? color` ᶠ | Não | Glow/shadow color around the text. |
| `shadowStrength` | `number` | `1` | Não | Extra intensity factor for the glow effect. |
| `fontSize` | `number` | `46` | Não | Font size in pixels. |
| `fontWeight` | `number \| string` | `600` | Não | Font weight of the text. |
| `font` | `string` | `?? fontFamily` ᶠ | Não | Font family alias (same effect as fontFamily). |
| `letterSpacing` | `number` | `0` | Não | Letter spacing in pixels. |
| `padding` | `number` | `14` | Não | Internal padding in pixels. |
| `rounded` | `number` | `12` | Não | Border radius in pixels. |
| `fontFamily` | `string` | — | Não | Custom font family. |
| `className` | `string` | — | Não | Additional classes on container. |
| `style` | `React.CSSProperties` | — | Não | Additional style on container. |

`font` e `fontFamily` são aliases; `font` tem precedência (`font ?? fontFamily`). Na troca de valor, o texto é substituído na metade da duração (`max(40, round(transitionMs/2))` ms). Confirmado.

### Eventos e callbacks
Nenhum.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="neon"`) e `SgStringAnimator`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
`role="img"` + `aria-label={value}`. Confirmado.

## SgRoller3DDigit

Tambor vertical que rola até a posição de `value` dentro de `items` via `transform` CSS. Fonte: `src/digits/roller3d-digit/SgRoller3DDigit.tsx` → `SgRoller3DDigit`.

### Import
```tsx
import { SgRoller3DDigit, type SgRoller3DDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | Current value to display — must be present in `items` (se ausente, o tambor fica na posição 0: `Math.max(0, items.indexOf(value))`). |
| `items` | `string[]` | `DEFAULT_ITEMS` = `["0",…,"9"]` | Não | Ordered list of all possible values this roller can show. The drum scrolls to the position of `value` in this list. |
| `fontSize` | `number` | `32` | Não | Font size in pixels — controls overall scale |
| `transitionMs` | `number` | `500` | Não | Transition duration in milliseconds |
| `className` | `string` | — | Não | Additional CSS classes on the outer wrapper |

### Eventos e callbacks
Nenhum.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="roller3d"`) e `SgStringAnimator` (que passa `items = charset`).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Nenhum `role`/`aria-*` encontrado no arquivo; todos os itens de `items` ficam no DOM. Confirmado (lacuna).

## SgSegmentDigit

Dígito em segmentos SVG compacto (grade 6×10), herdando a cor do texto (`currentColor`). Suporta `:` para relógios. Fonte: `src/digits/segment-digit/SgSegmentDigit.tsx` → `SgSegmentDigit`.

### Import
```tsx
import { SgSegmentDigit, type SgSegmentDigitProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — (`?? " "` interno) | Sim | Character rendered by the component (first character is used). Glifos: 0-9, `-`, espaço e `:`; outros viram espaço. |
| `size` | `number` | `16` | Não | Display height in pixels. |
| `color` | `string` | — (`currentColor`, herda a cor de texto do tema) | Não | Color of active segments. |
| `className` | `string` | — | Não | Additional classes on outer wrapper. |
| `style` | `React.CSSProperties` | — | Não | Additional inline styles on outer wrapper. |

### Eventos e callbacks
Nenhum.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="segment"`).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
`<svg role="img" aria-label={value}>`. Confirmado.

## SgSevenSegmentDigit

Display de 7 segmentos estilo LED, com paletas predefinidas, brilho e inclinação. Fonte: `src/digits/seven-segment-digit/SgSevenSegmentDigit.tsx` → `SgSevenSegmentDigit`.

### Import
```tsx
import { SgSevenSegmentDigit, type SgSevenSegmentDigitProps, type SgSevenSegmentDigitPalette } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | Character rendered by the component (first character is used). Convertido para maiúscula; glifos: espaço, `-`, `_`, 0-9, A-F, H, J, L, P, U, Y; outros viram espaço. |
| `palette` | `SgSevenSegmentDigitPalette` = `"red" \| "blue" \| "yellow" \| "green" \| "white"` | `"red"` | Não | Preset visual palette for active, inactive and background colors. |
| `color` | `string` | `?? paletteTokens.color` ᶠ | Não | Color of active segments. |
| `backgroundColor` | `string` | `?? paletteTokens.backgroundColor` ᶠ | Não | Background color of the component panel. |
| `offColor` | `string` | `?? paletteTokens.offColor` ᶠ | Não | Color of inactive segments. |
| `size` | `number` | `108` | Não | Component height in pixels. |
| `width` | `number` | `?? h * 0.62` ᶠ | Não | Component width in pixels. By default, derived from `size`. |
| `thickness` | `number` | `14` | Não | Segment thickness in pixels. |
| `padding` | `number` | `10` | Não | Internal panel padding in pixels. |
| `rounded` | `number` | `12` | Não | Border radius of the panel in pixels. |
| `skew` | `number` | `-8` | Não | Applies a subtle skew to mimic classic LED displays. |
| `glow` | `boolean` | `true` | Não | Enables glow effect on active segments. |
| `transitionMs` | `number` | `180` | Não | Segment transition duration in milliseconds. |
| `className` | `string` | — | Não | Additional classes on outer wrapper. |
| `style` | `React.CSSProperties` | — | Não | Additional inline styles on outer wrapper. |

`color`, `backgroundColor` e `offColor` sobrescrevem individualmente os tokens da `palette` (`color ?? paletteTokens.color` etc.). Confirmado.

### Eventos e callbacks
Nenhum.

### Ref
Não aceita ref.

### Children, slots e composição
Não aceita `children`. Usado por `SgClock` (`digitalStyle="sevenSegment"`).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
`role="img"` + `aria-label={value}`; segmentos com `aria-hidden`. Confirmado.

### Tipos auxiliares exportados
`SgSevenSegmentDigitPalette = "red" | "blue" | "yellow" | "green" | "white"`.
