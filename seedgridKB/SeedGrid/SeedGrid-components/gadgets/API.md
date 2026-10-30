---
tags: [seedgrid, front, component, gadgets]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/gadgets
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Gadgets (relógio, calendário, gauges, QR) (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API — gadgets (`gadgets`) — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/gadgets/API|API — Gadgets (relógio, calendário, gauges, QR) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/gadgets/Exemplos|Gadgets — exemplos]] · Dígitos usados pelo relógio: [[SeedGrid/SeedGrid-components/digits/API|API dos dígitos]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Textos padrão (títulos, `aria-label`, placeholders) vêm do i18n do pacote (`useComponentsI18n` + chaves `components.gadgets.*`) — ver [[SeedGrid/SeedGrid-components/fundamentos/API|API › i18n]].

## SgCalendar

Calendário mensal (1–12 meses lado a lado) dentro de um `SgCard` recolhível e arrastável, com seleção controlada/não controlada, limites e regra de desabilitação. Fonte: `src/gadgets/calendar/SgCalendar.tsx` → `SgCalendar`.

### Import
```tsx
import { SgCalendar, type SgCalendarProps, type SgCalendarWeekdayFormat } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `defaultValue` | `Date \| string` | — (sem valor: hoje) | Não | Data selecionada inicial no modo não controlado; aceita `Date` ou string parseável. |
| `value` | `Date \| string` | — | Não | Data selecionada de forma controlada (ativa o modo controlado quando `!== undefined`; valor não parseável cai para hoje). |
| `onValueChange` | `(date: Date) => void` | — | Não | Callback disparado ao selecionar uma data. |
| `viewDate` | `Date \| string` | — | Não | Mes visivel de forma controlada. |
| `defaultViewDate` | `Date \| string` | — (mês de `defaultValue` ou de hoje) | Não | Mes visivel (controlado ou inicial) e callback de navegacao. |
| `onViewDateChange` | `(viewDate: Date) => void` | — | Não | Disparado ao navegar entre meses (anterior/próximo, atalho Hoje, ou ao selecionar dia de outro mês) com o 1º dia do mês. |
| `locale` | `string` | `"pt-BR"` | Não | Locale usado para formatacao de mes e dias. |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` | Não | Primeiro dia da semana (0 = domingo … 6 = sábado). |
| `weekdayFormat` | `SgCalendarWeekdayFormat` = `"narrow" \| "short" \| "long"` | `"narrow"` | Não | Formato textual dos dias da semana (narrow, short, long). |
| `numberOfMonths` | `number` | `1` | Não | Quantidade de meses visiveis ao mesmo tempo (limitado a 1–12). |
| `monthsPerLine` | `number` | `3` | Não | Quantidade de meses por linha antes de quebrar (limitado a 1–12 e a `numberOfMonths`). |
| `monthMinWidth` | `number \| string` | — (`20.75rem` com 1 coluna; `16rem` com várias) | Não | Largura minima de cada mes (numero em px ou string CSS, ex.: 280 ou 18rem). |
| `showAdjacentMonths` | `boolean` | `true` | Não | Exibe/oculta dias de meses adjacentes na grade. |
| `minDate` | `Date \| string` | — | Não | Limite minimo de selecao. |
| `maxDate` | `Date \| string` | — | Não | Limite maximo de selecao. |
| `isDateDisabled` | `(date: Date) => boolean` | — | Não | Regra adicional para desabilitar datas especificas. |
| `showTodayShortcut` | `boolean` | `true` | Não | Mostra/oculta o botao de atalho para voltar para hoje. |
| `cardTitle` | `React.ReactNode` | `?? t(i18n, "components.gadgets.calendar.title")` ᶠ | Não | Configura titulo e props do SgCard do gadget. |
| `cardProps` | `Omit<SgCardProps, "children" \| "title">` | — | Não | Props repassadas ao `SgCard` que envolve o calendário (o componente já define `collapsible`, `defaultOpen`, `draggable`, `cardStyle="outlined"` etc., sobrescrevíveis aqui). |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children" \| "onChange"> & { ... }`; acrescenta 275 props de `@types/react` (`HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 168). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

Os atributos DOM herdados (`...rest`) e `className`/`style` vão para o `div` interno do calendário (dentro do card), não para o card. `className`/`style` do card devem ir em `cardProps`. Confirmado.

### Eventos e callbacks
| Callback | Assinatura | Quando dispara |
|---|---|---|
| `onValueChange` | `(date: Date) => void` | Clique em dia habilitado, ou botão "Hoje" quando hoje não está desabilitado. Recebe cópia da data (meia-noite local). |
| `onViewDateChange` | `(viewDate: Date) => void` | Navegação anterior/próximo, botão "Hoje", ou seleção de dia de outro mês. Recebe o 1º dia do mês. |
| `isDateDisabled` | `(date: Date) => boolean` | Avaliado por célula, além de `minDate`/`maxDate`. |

Modos: `value`/`viewDate` definidos ⇒ controlado; caso contrário estado interno inicializado por `defaultValue`/`defaultViewDate`. Confirmado.

### Ref
Não aceita ref (componente de função sem `forwardRef`).

### Children, slots e composição
Sem `children` (omitido do tipo). Composição: renderiza `SgCard` (ver [[SeedGrid/SeedGrid-components/layout/API|API de layout › SgCard]]) com `title={cardTitle}` e as props de `cardProps`.

### Contexto, providers e hooks
Consome `useComponentsI18n()` (rótulos). Nenhum provider obrigatório.

### Acessibilidade
Botões de navegação com `aria-label` traduzidos (mês anterior/próximo, ir para hoje) e ícones `aria-hidden`; células de dia são `<button>` com `disabled` e `aria-pressed` no selecionado. Não há navegação por setas na grade nem `role="grid"`. Confirmado.

### Tipos auxiliares exportados
`SgCalendarWeekdayFormat = "narrow" | "short" | "long"`.

## SgClock

Relógio digital (9 estilos, reaproveitando os [[SeedGrid/SeedGrid-components/digits/Visao-geral|dígitos animados]]) ou analógico com temas SVG, dentro de um `SgCard`. Fonte: `src/gadgets/clock/SgClock.tsx` → `SgClock`.

### Import
```tsx
import { SgClock, type SgClockProps, type SgClockDigitalStyle } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `clockStyle` | `"digital" \| "analog"` | `"digital"` | Não | Modo principal de exibicao do relogio. |
| `size` | `"sm" \| "md" \| "lg" \| number` | `"md"` | Não | Escala visual do relogio. No analógico: `sm`=140, `md`=240, `lg`=320 px ou número em px. |
| `initialServerTime` | `string` | — | Não | Seed opcional de hora ISO para sincronizar o ponto inicial com o servidor. Ignorado quando há `SgTimeProvider` acima (o contexto tem precedência). |
| `timezone` | `string` | — (fuso do navegador) | Não | Timezone IANA usada no calculo da hora exibida (via `Intl.DateTimeFormat`). |
| `locale` | `string` | `"pt-BR"` | Não | Locale usado para formatacao da hora. |
| `format` | `"12h" \| "24h"` | `"24h"` | Não | Formato horario do relogio digital (`12h` exibe AM/PM localizado). |
| `showSeconds` | `boolean` | `true` | Não | Exibe ou oculta os segundos. |
| `digitalStyle` | `SgClockDigitalStyle` = `"default" \| "fade" \| "discard" \| "segment" \| "sevenSegment" \| "roller3d" \| "flip" \| "matrix" \| "neon"` | `"default"` | Não | Estilo visual do relogio digital. |
| `secondHandMode` | `"step" \| "smooth"` | `"step"` | Não | Comportamento do ponteiro de segundos no analogico (`step` salta; `smooth` usa milissegundos). |
| `themeId` | `string` | `"classic"` | Não | ID do tema do relógio analógico, resolvido pelo `SgClockThemeProvider` (se houver) ou pelo registro global; fallback `"classic"`. |
| `theme` | `SgClockTheme` | — | Não | Tema inline (`SgClockTheme`) para o relógio analógico; tem precedência sobre `themeId`. |
| `className` | `string` | — | Não | Classe extra no container do relogio. |
| `style` | `React.CSSProperties` | — | Não | Inline style extra no container do relogio. |
| `centerOverlay` | `React.ReactNode` | — | Não | Conteudo opcional sobreposto ao centro do relogio analogico (ignorado no digital). |
| `cardTitle` | `React.ReactNode` | `?? t(i18n, "components.gadgets.clock.title")` ᶠ | Não | Titulo do SgCard usado pelo gadget. |
| `cardProps` | `Omit<SgCardProps, "children" \| "title">` | — | Não | Sobrescreve configuracoes padrao do SgCard do gadget. `dragPersistKey` padrão: `cardProps.dragPersistKey` → `sg-clock:<cardProps.id>` → `"sg-clock"`. |

Mapeamento `digitalStyle` → componente (Confirmado): `flip`→`SgFlipDigit`, `roller3d`→`SgRoller3DDigit`, `fade`→`SgFadeDigit`, `discard`→`SgDiscardDigit`, `matrix`→`SgMatrixDigit`, `neon`→`SgNeonDigit`, `sevenSegment`→`SgSevenSegmentDigit`, `segment`→`SgSegmentDigit`, `default`→texto simples.

### Eventos e callbacks
Nenhum. Atualiza a cada segundo (intervalo interno) ou pelo `tick` do `SgTimeProvider`.

### Ref
Não aceita ref.

### Children, slots e composição
Sem `children`. Slot `centerOverlay` (analógico). Renderiza `SgCard` com `cardProps`.

### Contexto, providers e hooks
- **`SgTimeProvider`** (opcional): se presente, a hora vem de `ctx.nowMs()` e `initialServerTime` da prop é ignorado; senão usa `initialServerTime` (ou `Date.now()`) + `performance.now()`. Confirmado (`useClockNowMs`).
- **`SgClockThemeProvider`** (opcional): o tema analógico é `theme ?? resolveTheme(resolver, themeId, "classic")`; sem provider usa `getTheme(themeId) ?? getTheme("classic")` do registro global. **Os temas embutidos não são registrados automaticamente** — sem `registerThemes(sgClockThemesBuiltIn)` (ou `theme` inline / `themes` no provider) o mostrador fica sem tema. Confirmado.
- `useComponentsI18n()` para rótulos.

### Acessibilidade
Analógico: SVG com `aria-label` traduzido (`components.gadgets.clock.analogAria`). Digital: contêiner com `aria-label` traduzido (`components.gadgets.clock.digitalAria`). O rótulo não inclui a hora; não há `aria-live`. Confirmado.

### Tipos auxiliares exportados
`SgClockDigitalStyle = "default" | "segment" | "sevenSegment" | "roller3d" | "flip" | "fade" | "matrix" | "neon" | "discard"`.

## SgTimeProvider e `useSgTime`

Provider de relógio sincronizado com o servidor: parte de `initialServerTime` e avança com `performance.now()`; emite `tick` alinhado à virada de cada segundo. Fonte: `src/gadgets/clock/SgTimeProvider.tsx` → `SgTimeProvider`, `useSgTime`.

### Import
```tsx
import { SgTimeProvider, useSgTime, type SgTimeContextValue } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `initialServerTime` | `string` | — | Sim | Timestamp inicial do servidor em formato ISO 8601. |
| `children` | `React.ReactNode` | — | Sim | Arvore que vai consumir tempo sincronizado via useSgTime. |

- Tipo de props declarado inline na assinatura de `SgTimeProvider` (não há tipo `SgTimeProviderProps` exportado).

### Hook `useSgTime(): SgTimeContextValue`
Retorna o contexto do provider; **fora de um provider** retorna um fallback local memoizado `{ serverStartMs: Date.now(), perfStartMs: 0, tick: 0, nowMs: () => Date.now() }` (sem `tick`, portanto não re-renderiza sozinho). Confirmado.

| Campo de `SgTimeContextValue` | Tipo | Significado |
|---|---|---|
| `serverStartMs` | `number` | `Date.parse(initialServerTime)` |
| `perfStartMs` | `number` | `performance.now()` na hidratação |
| `tick` | `number` | Incrementa a cada segundo (1º disparo alinhado a `1000 - Date.now() % 1000`) — usar como dependência para re-render. |
| `nowMs` | `() => number` | Antes da hidratação: `serverStartMs`; depois: `serverStartMs + (performance.now() - perfStartMs)`. |

Interno (não exportado no barrel): `useSgTimeContext()` (retorna `null` sem provider), usado pelo `SgClock`.

### Eventos, ref, slots
Sem eventos; sem ref; `children` obrigatório.

### Acessibilidade
Não renderiza DOM próprio.

## SgClockThemeProvider, resolvedor e registro de temas

Temas do relógio analógico: registro **global** (módulo `registry.ts`, `Map` em memória) + resolvedor por contexto com temas locais. Fontes: `src/gadgets/clock/themes/{provider.tsx,registry.ts,renderTheme.tsx,useDarkFlag.ts,builtins.tsx,types.ts}`.

### Import
```tsx
import {
  SgClockThemeProvider, useSgClockThemeResolver, createThemeResolver,
  registerTheme, registerThemes, getTheme, hasTheme, listThemes, unregisterTheme, clearThemes,
  resolveTheme, ThemeLayer, useDarkFlag, sgClockThemesBuiltIn,
  type SgClockTheme, type SgClockThemeRenderArgs, type SgClockThemeResolveMode, type SgClockThemeResolver
} from "@seedgrid/fe-components";
```

### Props de `SgClockThemeProvider`
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `SgClockThemeProviderValue` | — | Não | Configuração do resolvedor: `{ mode?: SgClockThemeResolveMode; fallbackThemeId?: string; themes?: SgClockTheme[] }`. Padrões internos: `mode` `"fallback"`, `fallbackThemeId` `"classic"`, `themes` `[]` (temas locais, que sobrepõem os globais de mesmo `id`). |
| `children` | `React.ReactNode` | — | Sim | Arvore que vai consumir o resolver de temas. |

- Tipo de props declarado inline na assinatura de `SgClockThemeProvider` (não há tipo `SgClockThemeProviderProps` exportado).

O tipo do `value` (`SgClockThemeProviderValue`) é interno (não exportado). O resolvedor é recriado quando `value.mode`, `value.fallbackThemeId` ou a referência de `value.themes` mudam — memoize o array.

### Funções e hooks exportados

| Símbolo | Assinatura | Comportamento (Confirmado) |
|---|---|---|
| `useSgClockThemeResolver` | `() => SgClockThemeResolver \| null` | Resolvedor do provider mais próximo; `null` fora de provider. |
| `createThemeResolver` | `(params?: { mode?: SgClockThemeResolveMode; fallbackThemeId?: string; localThemes?: SgClockTheme[] }) => SgClockThemeResolver` | Padrões `mode="fallback"`, `fallbackThemeId="classic"`. `resolve(id)`: local → global; se não achar e `mode="fallback"`, tenta `fallbackThemeId`; em `"strict"` retorna `null`. `list()`: globais + locais (locais sobrepõem), ordenados por `order ?? 999`. `registerLocal(theme)` lança `Error` sem `theme.id`. |
| `registerTheme` | `(theme: SgClockTheme) => void` | Registra/substitui no mapa global; lança `Error("registerTheme: theme.id is required")` sem `id`. |
| `registerThemes` | `(themes: SgClockTheme[]) => void` | `registerTheme` em lote. |
| `getTheme` | `(id: string) => SgClockTheme \| null` | Busca global. |
| `hasTheme` | `(id: string) => boolean` | Existe no global. |
| `listThemes` | `() => SgClockTheme[]` | Globais ordenados por `order ?? 999`. |
| `unregisterTheme` | `(id: string) => void` | Remove do global. |
| `clearThemes` | `() => void` | Esvazia o global. |
| `resolveTheme` | `(resolver: SgClockThemeResolver \| null, themeId: string, fallbackThemeId: string) => SgClockTheme \| null` | `resolver.resolve(themeId)`, depois `fallbackThemeId`. |
| `ThemeLayer` | componente `({ theme: SgClockTheme; args: SgClockThemeRenderArgs })` | Renderiza `theme.render(args)` e/ou o conteúdo interno do SVG em `theme.url` (baixado com `fetch(..., { cache: "force-cache" })`, cache por URL, injetado com `dangerouslySetInnerHTML`). Deve ficar dentro de um `<svg>` (viewBox 0 0 100 100). |
| `useDarkFlag` | `() => boolean` | `true` se `--sg-mode` = `dark`, ou classe `dark` no `<html>`, ou `prefers-color-scheme: dark`; observa mudanças (MutationObserver + matchMedia). |
| `sgClockThemesBuiltIn` | `SgClockTheme[]` | 10 temas: `classic`, `minimal`, `dark`, `seedgrid`, `music`, `music-notes`, `music-staff`, `roman-classic`, `roman-ornate`, `segment`. **Não são registrados automaticamente.** |

### Tipos

| Tipo | Definição |
|---|---|
| `SgClockTheme` | `{ id: string; label?: string; tags?: string[]; render?: (args: SgClockThemeRenderArgs) => React.ReactNode; url?: string; order?: number }` |
| `SgClockThemeRenderArgs` | `{ size: number; dark: boolean }` |
| `SgClockThemeResolveMode` | `"strict" \| "fallback"` |
| `SgClockThemeResolver` | `{ resolve(id): SgClockTheme \| null; list(): SgClockTheme[]; registerLocal(theme): void; registerManyLocal(themes): void }` |

Segurança (Inferência): `url` é buscado e injetado como HTML sem sanitização — use apenas SVGs de origem confiável.

## SgClockThemePicker

Seletor de tema com preview, lista (`role="listbox"`) e busca opcional (via `SgAutocomplete`). Fonte: `src/gadgets/clock/themes/SgClockThemePicker.tsx` → `SgClockThemePicker`.

### Import
```tsx
import { SgClockThemePicker } from "@seedgrid/fe-components";
```
`SgClockThemePickerProps` **não** é exportado pelo barrel (só existe no arquivo). Confirmado.

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Sim | ID do tema atualmente selecionado. |
| `onChange` | `(id: string) => void` | — | Sim | Callback disparado quando um novo tema e escolhido. |
| `label` | `string` | `?? t(i18n, "components.gadgets.clock.theme")` ᶠ | Não | Rotulo opcional exibido acima do seletor. |
| `placeholder` | `string` | `?? t(i18n, "components.gadgets.clock.selectTheme")` ᶠ | Não | Texto exibido quando nenhum tema valido esta resolvido. |
| `className` | `string` | — | Não | Classes adicionais no `div` raiz (que já tem `relative`). *(Inferência)* |
| `filter` | `(theme: SgClockTheme) => boolean` | — | Não | Filtro adicional sobre a lista de temas disponiveis. |
| `previewSize` | `number` | `56` | Não | Tamanho do preview visual de cada tema. |
| `searchable` | `boolean` | `true` | Não | Ativa busca textual na lista de temas. |
| `fallbackThemeId` | `string` | `"classic"` | Não | Tema usado quando o valor atual nao pode ser resolvido. |
| `defaultOpen` | `boolean` | `false` | Não | Abre a lista inicialmente no primeiro render. |

### Eventos e callbacks
`onChange(id)` ao clicar numa opção ou selecionar um item na busca; fecha a lista em seguida. A lista também fecha com clique fora (`mousedown` no `document`). Confirmado.

### Ref
Não aceita ref.

### Children, slots e composição
Sem `children`. Usa `SgClockThemePreview` e `SgAutocomplete` (busca, quando `searchable`).

### Contexto, providers e hooks
**Requer `SgClockThemeProvider`**: a lista vem de `resolver?.list() ?? []` — sem provider fica vazia. `useComponentsI18n()` para textos.

### Acessibilidade
Botão gatilho com `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`; lista `role="listbox"` com opções `aria-selected`. Sem tratamento de `Escape` nem navegação por setas na lista (não encontrado). Coberto por `tests/gadgets.test.mjs` ("accessible listbox semantics"). Confirmado.

## SgClockThemePreview

Miniatura SVG de um tema com ponteiros fixos (10:10:30 aprox.). Fonte: `src/gadgets/clock/themes/SgClockThemePreview.tsx` → `SgClockThemePreview`.

### Import
```tsx
import { SgClockThemePreview, type SgClockTheme } from "@seedgrid/fe-components";
```
Não há tipo `SgClockThemePreviewProps` exportado.

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `theme` | `SgClockTheme` | — | Sim | Tema visual usado na renderizacao do preview. |
| `size` | `number` | `64` | Não | Dimensao do preview quadrado em pixels. |
| `className` | `string` | `?? "block"` ᶠ | Não | Classes adicionais aplicadas ao SVG raiz. |

- Tipo de props declarado inline na assinatura de `SgClockThemePreview` (não há tipo `SgClockThemePreviewProps` exportado).

### Eventos, ref, slots
Nenhum. Usa `useDarkFlag()` para `args.dark`.

### Acessibilidade
SVG com `aria-hidden="true"` (decorativo). Confirmado.

## SgLinearGauge

Medidor linear SVG (horizontal/vertical) com faixas, ticks, barra, ponteiro principal e ponteiros extras arrastáveis. Fonte: `src/gadgets/gauge/SgLinearGauge.tsx` → `SgLinearGauge`; matemática em `src/gadgets/gauge/math.ts` (interna).

### Import
```tsx
import {
  SgLinearGauge, type SgLinearGaugeProps, type SgLinearGaugeRange,
  type SgLinearGaugePointer, type SgLinearGaugePointerShape
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `min` | `number` | `0` | Não | Valor minimo da escala. |
| `max` | `number` | `100` | Não | Valor maximo da escala. |
| `value` | `number` | — | Não | Valor do ponteiro principal. |
| `defaultValue` | `number` | `min` | Não | Valor inicial do ponteiro principal no modo não controlado (usado quando `value` é `undefined`). |
| `onValueChange` | `(value: number) => void` | — | Não | Callback do ponteiro principal. |
| `pointers` | `SgLinearGaugePointer[]` | `[]` | Não | Ponteiros adicionais renderizados sobre o eixo. |
| `onPointerValueChange` | `(pointerId: string, value: number, pointer: SgLinearGaugePointer) => void` | — | Não | Disparado ao arrastar um ponteiro adicional (`draggable`), com `(pointerId, valor, ponteiro)`; o `id` padrão é `sg-linear-pointer-<índice>`. O ponteiro também chama seu próprio `onValueChange`. |
| `ranges` | `SgLinearGaugeRange[]` | `[]` | Não | Faixas coloridas aplicadas sobre a escala. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Não | Orientacao do gauge. |
| `isAxisInversed` | `boolean` | `false` | Não | Orientacao e direcao do eixo. |
| `showPrimaryPointer` | `boolean` | `true` | Não | Configuracoes do ponteiro primario (forma, cor, tamanho, arrastavel). |
| `primaryPointerShape` | `SgLinearGaugePointerShape` = `"circle" \| "triangle" \| "inverted-triangle" \| "diamond" \| "rect"` | `"triangle"` | Não | Forma do marcador do ponteiro principal. *(Inferência)* |
| `primaryPointerColor` | `string` | `"hsl(var(--primary))"` | Não | Cor do ponteiro principal. *(Inferência)* |
| `primaryPointerSize` | `number` | `11` | Não | Tamanho (px) do marcador do ponteiro principal. *(Inferência)* |
| `primaryPointerDraggable` | `boolean` | `false` | Não | Permite arrastar o ponteiro principal. |
| `barPointer` | `boolean` | `true` | Não | Barra preenchida ate o valor atual. |
| `barColor` | `string` | `"hsl(var(--primary))"` | Não | Barra preenchida ate o valor atual. |
| `barThickness` | `number` | `8` | Não | Barra preenchida ate o valor atual. |
| `showTicks` | `boolean` | `true` | Não | Exibe ticks da escala. |
| `showLabels` | `boolean` | `true` | Não | Exibe rotulos da escala. |
| `majorTickCount` | `number` | `5` | Não | Configuracao de marcacoes e rotulos. |
| `minorTicksPerInterval` | `number` | `1` | Não | Configuracao de marcacoes e rotulos. |
| `labelFormatter` | `(value: number) => React.ReactNode` | — | Não | Configuracao de marcacoes e rotulos. |
| `axisColor` | `string` | `"hsl(var(--border))"` | Não | Estilo do eixo principal. |
| `axisThickness` | `number` | `10` | Não | Estilo do eixo principal. |
| `width` | `number` | `orientation === "horizontal" ? 360 : 140` | Não | Dimensoes do SVG. |
| `height` | `number` | `orientation === "horizontal" ? 120 : 360` | Não | Dimensoes do SVG. |
| `animate` | `boolean` | `true` | Não | Configuracoes de animacao de transicao. |
| `animationDuration` | `number` | `350` | Não | Configuracoes de animacao de transicao. |
| `className` | `string` | — | Não | Estilizacao e acessibilidade. |
| `style` | `React.CSSProperties` | — | Não | Estilizacao e acessibilidade. |
| `ariaLabel` | `string` | `?? t(i18n, "components.gadgets.gauge.linearAria")` ᶠ | Não | Estilizacao e acessibilidade. |

### Eventos e callbacks
| Callback | Assinatura | Quando dispara |
|---|---|---|
| `onValueChange` | `(value: number) => void` | Arraste do ponteiro principal (`primaryPointerDraggable`); valor limitado a `[min, max]`. |
| `onPointerValueChange` | `(pointerId: string, value: number, pointer: SgLinearGaugePointer) => void` | Arraste de ponteiro extra com `draggable: true`. |
| `SgLinearGaugePointer.onValueChange` | `(value: number) => void` | Mesmo momento, no próprio ponteiro. |
| `labelFormatter` | `(value: number) => React.ReactNode` | Formatação dos rótulos da escala. |

Ponteiros extras mantêm o valor arrastado em estado interno e ressincronizam quando `pointers[i].value` muda. Arraste por Pointer Events (`onPointerDown` + listeners de movimento). Confirmado.

### Ref
Não aceita ref.

### Acessibilidade
Raiz `role="meter"` com `aria-valuemin/max/now` e `aria-label` (`ariaLabel` ou texto i18n). **Sem suporte a teclado** para arrastar (sem `tabIndex`/`onKeyDown`). Confirmado.

### Tipos auxiliares exportados
| Tipo | Campos |
|---|---|
| `SgLinearGaugeRange` | `start: number; end: number; color?: string; thickness?: number; opacity?: number; label?: React.ReactNode` |
| `SgLinearGaugePointer` | `id?: string; value: number; color?: string; size?: number; shape?: SgLinearGaugePointerShape; draggable?: boolean; onValueChange?: (value: number) => void; label?: React.ReactNode` |
| `SgLinearGaugePointerShape` | `"triangle" \| "inverted-triangle" \| "circle" \| "diamond" \| "rect"` |

## SgRadialGauge

Medidor radial SVG (arco configurável) com faixas, ticks, ponteiro principal (needle/marker/range), ponteiros extras, anotações e conteúdo central. Fonte: `src/gadgets/gauge/SgRadialGauge.tsx` → `SgRadialGauge`.

### Import
```tsx
import {
  SgRadialGauge, type SgRadialGaugeProps, type SgRadialGaugeRange, type SgRadialGaugePointer,
  type SgRadialGaugePointerType, type SgRadialGaugeMarkerShape, type SgRadialGaugeAnnotation
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `min` | `number` | `0` | Não | Valor minimo da escala. |
| `max` | `number` | `100` | Não | Valor maximo da escala. |
| `value` | `number` | — | Não | Valor do ponteiro principal. |
| `defaultValue` | `number` | `min` | Não | Valor inicial do ponteiro principal no modo não controlado (usado quando `value` é `undefined`). |
| `onValueChange` | `(value: number) => void` | — | Não | Callback do ponteiro principal. |
| `pointers` | `SgRadialGaugePointer[]` | `[]` | Não | Ponteiros adicionais do tipo needle, marker ou range. |
| `onPointerValueChange` | `(pointerId: string, value: number, pointer: SgRadialGaugePointer) => void` | — | Não | Disparado ao arrastar um ponteiro adicional (`draggable`), com `(pointerId, valor, ponteiro)`; o `id` padrão é `sg-radial-pointer-<índice>`. |
| `ranges` | `SgRadialGaugeRange[]` | `[]` | Não | Faixas coloridas sobre o arco principal. |
| `annotations` | `SgRadialGaugeAnnotation[]` | `[]` | Não | Anotacoes posicionadas por valor ou angulo. |
| `startAngle` | `number` | `135` | Não | Angulo inicial do arco. |
| `endAngle` | `number` | `45` | Não | Angulo final do arco. |
| `isAxisInversed` | `boolean` | `false` | Não | Configuracao do arco e direcao da escala. |
| `showPrimaryPointer` | `boolean` | `true` | Não | Configuracoes do ponteiro primario (needle/marker/range). |
| `primaryPointerType` | `SgRadialGaugePointerType` = `"needle" \| "marker" \| "range"` | `"needle"` | Não | Tipo visual do ponteiro principal. |
| `primaryPointerColor` | `string` | `"hsl(var(--primary))"` | Não | Cor do ponteiro principal. *(Inferência)* |
| `primaryPointerWidth` | `number` | `3` | Não | Espessura (px) do ponteiro principal tipo needle/range. *(Inferência)* |
| `primaryPointerSize` | `number` | `12` | Não | Tamanho (px) do ponteiro principal (cabeça do needle ou marcador). *(Inferência)* |
| `primaryPointerShape` | `SgRadialGaugeMarkerShape` = `"square" \| "circle" \| "triangle" \| "diamond"` | `"circle"` | Não | Forma do marcador quando `primaryPointerType="marker"`. *(Inferência)* |
| `primaryPointerDraggable` | `boolean` | `false` | Não | Permite arrastar o ponteiro principal (atualiza o valor e dispara `onValueChange`). *(Inferência)* |
| `primaryPointerLabel` | `React.ReactNode` | — | Não | Rótulo do ponteiro principal; se omitido, o needle principal mostra o valor arredondado. *(Inferência)* |
| `showTicks` | `boolean` | `true` | Não | Marcacoes e rotulos da escala. |
| `showLabels` | `boolean` | `true` | Não | Marcacoes e rotulos da escala. |
| `majorTickCount` | `number` | `5` | Não | Marcacoes e rotulos da escala. |
| `minorTicksPerInterval` | `number` | `1` | Não | Marcacoes e rotulos da escala. |
| `labelFormatter` | `(value: number) => React.ReactNode` | — | Não | Marcacoes e rotulos da escala. |
| `axisColor` | `string` | `"hsl(var(--border))"` | Não | Estilo do anel principal, espessura e conteudo central. |
| `ringThickness` | `number` | `?? axisWidth` ᶠ | Não | Estilo do anel principal, espessura e conteudo central. |
| `axisWidth` | `number` | `14` | Não | Estilo do anel principal, espessura e conteudo central. |
| `radiusFactor` | `number` | `0.9` | Não | Estilo do anel principal, espessura e conteudo central. |
| `centerContent` | `React.ReactNode` | — (rótulo i18n `components.gadgets.gauge.value` + valor arredondado) | Não | Conteúdo central do gauge; substitui o bloco padrão. |
| `width` | `number` | `300` | Não | Dimensoes do SVG. |
| `height` | `number` | `300` | Não | Dimensoes do SVG. |
| `animate` | `boolean` | `true` | Não | Configuracoes da animacao de transicao. |
| `animationDuration` | `number` | `350` | Não | Configuracoes da animacao de transicao. |
| `className` | `string` | — | Não | Estilizacao e acessibilidade. |
| `style` | `React.CSSProperties` | — | Não | Estilizacao e acessibilidade. |
| `ariaLabel` | `string` | `?? t(i18n, "components.gadgets.gauge.radialAria")` ᶠ | Não | Estilizacao e acessibilidade. |

Ângulos em graus no sistema SVG (0° = direita, sentido horário); o arco vai de `startAngle` a `endAngle` no sentido horário (sweep 0 ⇒ 360°). Confirmado (`toSweep`).

### Eventos e callbacks
Mesma semântica do linear: `onValueChange` (ponteiro principal arrastável), `onPointerValueChange(pointerId, value, pointer)` e `SgRadialGaugePointer.onValueChange` (ponteiros extras `draggable`), `labelFormatter`. IDs padrão `sg-radial-pointer-<índice>`. Confirmado.

### Ref
Não aceita ref.

### Acessibilidade
`role="meter"` + `aria-valuemin/max/now` + `aria-label` (`ariaLabel` ou i18n). Sem teclado. Confirmado.

### Tipos auxiliares exportados
| Tipo | Campos |
|---|---|
| `SgRadialGaugeRange` | `start: number; end: number; color?: string; width?: number; opacity?: number` |
| `SgRadialGaugePointer` | `id?: string; type?: SgRadialGaugePointerType; value: number; color?: string; width?: number; size?: number; shape?: SgRadialGaugeMarkerShape; draggable?: boolean; onValueChange?: (value: number) => void; label?: React.ReactNode` (padrões internos: `type` `"needle"`; `size` 10 needle / 12 demais; cor `hsl(var(--secondary))` para extras) |
| `SgRadialGaugePointerType` | `"needle" \| "marker" \| "range"` |
| `SgRadialGaugeMarkerShape` | `"circle" \| "diamond" \| "triangle" \| "square"` |
| `SgRadialGaugeAnnotation` | `id?: string; value?: number; angle?: number; radiusFactor?: number; content: React.ReactNode` |

## SgQRCode

QR Code SVG (via `qrcode.react` → `QRCodeSVG`) com logo central opcional e fallback para valor vazio/erro. Fonte: `src/gadgets/qr-code/SgQRCode.tsx` → `SgQRCode`.

### Import
```tsx
import { SgQRCode, type SgQRCodeProps, type SgQRCodeErrorCorrectionLevel } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Não | Valor textual codificado no QR Code (aplicado `trim()`; vazio → `emptyFallback` ou nada). |
| `size` | `number` | `220` | Não | Tamanho do QR em pixels (mínimo efetivo 64). |
| `margin` | `number` | `2` | Não | Margem interna do QR Code. |
| `fgColor` | `string` | `"#000000"` | Não | Cor principal do QR Code. |
| `bgColor` | `string` | `"#FFFFFF"` | Não | Cor de fundo do QR Code. |
| `errorCorrectionLevel` | `SgQRCodeErrorCorrectionLevel` = `"L" \| "M" \| "Q" \| "H"` | `"H"` | Não | Nível de correção de erro (L/M/Q/H) repassado como `level` ao gerador. |
| `logoSrc` | `string` | — | Não | URL da logo exibida no centro do QR. |
| `logoAlt` | `string` | `"Logo"` | Não | Texto alternativo da imagem do logo. |
| `logoSize` | `number` | `?? safeSize * 0.22` ᶠ | Não | Tamanho do logo em px (limitado entre 18 e `size`). *(Inferência)* |
| `logoPadding` | `number` | `6` | Não | Espaçamento interno (px) do contêiner do logo. *(Inferência)* |
| `logoBackgroundColor` | `string` | `"#FFFFFF"` | Não | Cor de fundo do contêiner do logo. *(Inferência)* |
| `logoBorderRadius` | `number` | `12` | Não | Raio da borda (px) do contêiner do logo. *(Inferência)* |
| `imageClassName` | `string` | — | Não | Classes adicionais no SVG do QR Code. *(Inferência)* |
| `logoClassName` | `string` | — | Não | Classes adicionais no contêiner (`span`) do logo. *(Inferência)* |
| `emptyFallback` | `React.ReactNode` | — | Não | Conteúdo exibido quando `value` está vazio; sem ele o componente retorna `null`. |
| `onGenerateError` | `(error: Error) => void` | — | Não | Chamado quando a geração do QR lança erro (capturado por error boundary interno, que mostra um placeholder). *(Inferência)* |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

Atributos DOM herdados vão para o `div` raiz via `{...rest}`. Confirmado.

### Eventos e callbacks
`onGenerateError(error)` — chamado por um error boundary interno (`QrErrorBoundary.componentDidCatch`) se a geração falhar; o boundary mostra um placeholder `animate-pulse` e se reseta quando valor/tamanho/margem/cores/nível mudam. Confirmado.

### Ref
Não aceita ref.

### Acessibilidade
O SVG recebe `title` traduzido (`components.gadgets.qrcode.title`); logo é `<img alt={logoAlt}>`; placeholder de erro `aria-hidden`. Confirmado.

### Tipos auxiliares exportados
`SgQRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H"`.

## SgStringAnimator

Anima uma string até outra, caractere por caractere, usando um dos dígitos animados por posição. Fonte: `src/gadgets/string-animator/SgStringAnimator.tsx` → `SgStringAnimator`, `SG_STRING_ANIMATOR_DEFAULT_CHARSET`.

### Import
```tsx
import {
  SgStringAnimator, SG_STRING_ANIMATOR_DEFAULT_CHARSET,
  type SgStringAnimatorProps, type SgStringAnimatorRef, type SgStringAnimatorStyle, type SgStringAnimatorAlign
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `sourceString` | `string` | — | Sim | String exibida antes da animacao |
| `targetString` | `string` | — | Sim | String de destino — o componente anima ate ela |
| `stringAnimatorStyle` | `SgStringAnimatorStyle` = `"fade" \| "discard" \| "roller3d" \| "flip" \| "matrix" \| "neon"` | `"roller3d"` | Não | Estilo de animacao por caractere. - "roller3d": tambor vertical (SgRoller3DDigit) - "flip": vira o card (SgFlipDigit) - "neon": brilho neon com fade (SgNeonDigit) - "fade": apaga e acende (SgFadeDigit) - "discard": folha descartada voando (SgDiscardDigit) - "matrix": pontos em matriz LED (SgMatrixDigit) |
| `velocity` | `number` | `50` | Não | Velocidade de 1 (muito lento) a 100 (muito rapido). Controla o intervalo de tempo entre a troca de cada caractere. |
| `emptyChar` | `string` | `" "` | Não | Caractere utilizado para preencher as posicoes extras quando sourceString e targetString possuem comprimentos diferentes. |
| `alignTo` | `SgStringAnimatorAlign` = `"right" \| "left"` | `"left"` | Não | Alinhamento das strings: - "left" — preenche a direita com emptyChar (ideal para texto/nomes) - "right" — preenche a esquerda com emptyChar (ideal para numeros) |
| `autoStart` | `boolean` | `false` | Não | Se true, inicia a animacao automaticamente quando o componente monta e sempre que targetString mudar. |
| `fontSize` | `number` | `32` | Não | Tamanho da fonte em pixels — controla a escala de cada digito. |
| `charset` | `string[]` | `SG_STRING_ANIMATOR_DEFAULT_CHARSET` | Não | Conjunto de caracteres validos para o SgRoller3DDigit. Deve conter todos os caracteres que podem aparecer em sourceString, targetString e emptyChar. Ignorado quando style != "roller3d". |
| `color` | `string` | — | Não | Cor principal do texto/ponto — aplicada nos estilos "neon", "fade", "discard" e "matrix". |
| `backgroundColor` | `string` | — | Não | Cor de fundo — aplicada nos estilos "neon", "fade", "discard" e "matrix". |
| `className` | `string` | — | Não | Classes CSS adicionais no container externo |

- Aceita `ref` (via `React.forwardRef`) e `key`.

Detalhes (Confirmado): as duas strings são preenchidas até o maior comprimento com `emptyChar` (1º caractere) conforme `alignTo`; intervalo por caractere = `round(600 − (clamp(velocity,1,100) − 1) × 5.65)` ms (≈600 ms a ≈41 ms); com `alignTo="right"` a animação começa pela posição mais à direita. Mudar `sourceString` cancela a animação e reinicia a exibição. `color`/`backgroundColor` só se aplicam a neon/fade/discard/matrix; `charset` só a `roller3d` (é passado como `items`).

### Eventos e callbacks
Nenhum callback (não há evento de fim de animação).

### Ref
`React.forwardRef<SgStringAnimatorRef, SgStringAnimatorProps>`; `SgStringAnimatorRef = { startAnimation: () => void }` — inicia (ou reinicia) a animação de `sourceString` até `targetString`. Com `autoStart`, dispara ao montar e quando `targetString` (preenchida) muda. Confirmado.

### Children, slots e composição
Sem `children`. Compõe `SgRoller3DDigit`, `SgFlipDigit`, `SgNeonDigit`, `SgFadeDigit`, `SgDiscardDigit`, `SgMatrixDigit`.

### Acessibilidade
Nenhum `role`/`aria-*` próprio; depende dos dígitos internos. Confirmado.

### Constante exportada
`SG_STRING_ANIMATOR_DEFAULT_CHARSET: string[]` — espaço, `0-9`, `A-Z`, `a-z` e `. ! ? - + # @ $ % & / * ( )`. Se `emptyChar` não estiver no `charset`, é inserido no início.

Lacuna: o JSDoc de `SgStringAnimator` mostra `style="neon"`/`style="fade"` nos `@example`, mas a prop real é `stringAnimatorStyle` (não existe prop `style` no tipo).
