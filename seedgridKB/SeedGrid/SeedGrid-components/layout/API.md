---
tags: [seedgrid, front, component, layout]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/layout
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# API — layout (`@seedgrid/fe-components`)

Visão geral do grupo: [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/layout/Exemplos|Layout — exemplos]] · i18n/estilos: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Todos os caminhos de fonte abaixo são relativos a `front/seedgrid-fe-components/packages/seedgrid-fe-components/`. Todos os arquivos do grupo começam com `"use client"`.

## Sumário

- Primitivas de composição: [[#SgStack]] · [[#SgGrid]] · [[#SgPanel]] · [[#SgScreen]] · [[#SgGroupBox]]
- Containers: [[#SgCard]] · [[#SgAccordion]] · [[#SgPageControl]] (+ `SgPageControlPage`) · [[#SgExpandablePanel]] · [[#SgCarousel]]
- Navegação: [[#SgBreadcrumb]] · [[#SgMenu]] · [[#SgTreeView]]
- Docking: [[#SgDockLayout]] · [[#SgDockZone]] · [[#SgDockScreen]] · [[#SgToolBar]] (+ `SgToolbarIconButton`)
- [[#Funções utilitárias exportadas]]
- [[#Itens internos (não exportados)]]

---

## SgStack

Contêiner flex para empilhar filhos em coluna ou linha. Fonte: `src/layout/SgStack.tsx` → `SgStack`.

### Import
```tsx
import { SgStack, type SgStackProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `direction` | `"row" \| "column"` | `"column"` | Não | Direcao principal do empilhamento. |
| `gap` | `number \| string` | `0` | Não | Espacamento entre os itens. |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | `"start"` | Não | Distribuicao dos itens no eixo principal. |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | `"stretch"` | Não | Alinhamento dos itens no eixo cruzado. |
| `wrap` | `boolean` | `false` | Não | Permite quebra de linha quando necessario. |
| `grow` | `boolean` | `false` | Não | Permite que o stack cresca ocupando espaco disponivel. |
| `children` | `React.ReactNode` | — | Não | Itens renderizados dentro do stack. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "align" \| "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
Nenhum próprio. Eventos DOM herdados (`onClick` etc.) são repassados ao `<div>` raiz via `{...rest}` (Confirmado).

### Ref
Não usa `forwardRef`: `ref` não é repassado ao DOM (Confirmado — função simples).

### Children, slots e composição
`children` é renderizado direto dentro de um `<div class="flex ...">`. `gap` numérico vira `px`; `direction` mapeia para `flex-row`/`flex-col`; `grow` aplica `flex-1`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Não adiciona roles nem atributos ARIA; aceita `aria-*`/`role` herdados via `{...rest}` (Confirmado).

---

## SgGrid

Grade CSS responsiva por colunas fixas por breakpoint ou por largura mínima de item (`auto-fit`). Fonte: `src/layout/SgGrid.tsx` → `SgGrid`.

### Import
```tsx
import { SgGrid, type SgGridProps, type SgGridColumns } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `columns` | `SgGridColumns` | `1` coluna (`normalizeColumns(undefined)` → `{ base: 1 }`) ᶠ | Não | Define a quantidade de colunas base e por breakpoint. |
| `minItemWidth` | `number \| string` | — | Não | Largura minima dos itens em modo auto-fit. |
| `gap` | `number \| string` | `0` | Não | Espacamento entre os itens da grade. |
| `padding` | `number \| string` | — | Não | Espacamento interno do container grid. |
| `dense` | `boolean` | `false` | Não | Ativa preenchimento denso do fluxo de grade. |
| `rowHeight` | `number \| string` | — (não define `grid-auto-rows`) | Não | Altura automatica das linhas da grade. |
| `justify` | `"start" \| "center" \| "end" \| "stretch" \| "between" \| "around" \| "evenly"` | — | Não | Alinhamento do grid. |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | — | Não | Alinhamento do grid. |
| `children` | `React.ReactNode` | — | Não | Itens renderizados dentro da grade. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "align" \| "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
Nenhum próprio; atributos/eventos DOM vão para o `<div>` raiz via `{...rest}`.

### Ref
Não aceita `ref` (função simples).

### Children, slots e composição
- Breakpoints usados por `columns` (objeto): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px; injeta um `<style>` com `@media` por instância (`data-sg-grid`) e a variável `--sg-grid-cols` (Confirmado).
- Com `minItemWidth`, usa `repeat(auto-fit, minmax(<minItemWidth>, 1fr))` e ignora `columns` (Confirmado).
- **Contrato com os filhos**: se um filho tem prop `span` ou `rowSpan` numérica `> 1` (ex.: `SgPanel`), o filho é embrulhado num `<div>` com `grid-column: span N` / `grid-row: span N` (Confirmado). Funciona com qualquer elemento cujo `props` tenha `span`/`rowSpan`.

### Tipos auxiliares exportados
- `SgGridColumns = number | Partial<Record<"base" | "sm" | "md" | "lg" | "xl" | "2xl", number>>`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Sem roles/ARIA próprios.

---

## SgPanel

Painel estrutural com borda, margem/padding, scroll e **docking por alinhamento** (`align` top/left/right/bottom/client) quando colocado dentro de outro `SgPanel` ou de `SgScreen`. Fonte: `src/layout/SgPanel.tsx` → `SgPanel` (usa `src/layout/sgDocking.tsx`, interno).

### Import
```tsx
import {
  SgPanel,
  type SgPanelProps, type SgPanelAlign, type SgPanelBorderStyle, type SgPanelScrollable, type SgPanelPercent
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `align` | `SgPanelAlign` = `"top" \| "right" \| "bottom" \| "left" \| "client"` | `"client"` | Não | Posicionamento relativo ao container pai em cenarios de dock. |
| `width` | `SgPanelPercent` | — | Não | Largura do painel quando dockado ou usado em composicoes controladas. |
| `height` | `SgPanelPercent` | — | Não | Altura do painel quando dockado ou usado em composicoes controladas. |
| `minWidthPx` | `number` | — | Não | Limites minimos em pixels para evitar corte de conteudo. |
| `minHeightPx` | `number` | — | Não | Limites minimos em pixels para evitar corte de conteudo. |
| `span` | `number` | — | Não | Span de colunas e linhas quando usado dentro de `SgGrid`. |
| `rowSpan` | `number` | — | Não | Span de colunas e linhas quando usado dentro de `SgGrid`. |
| `borderStyle` | `SgPanelBorderStyle` = `"solid" \| "none" \| "dashed"` | `"dashed"` | Não | Estilo visual da borda do container. |
| `padding` | `number \| string` | — (aplicado como `margin`) | Não | Espacamento externo do painel em relacao ao slot recebido do pai. |
| `contentPadding` | `number \| string` | — (aplicado como `padding`) | Não | Espacamento interno entre a borda e o conteudo. |
| `scrollable` | `SgPanelScrollable` | `false` | Não | Habilita scroll apenas quando desejado. |
| `scrollbarGutter` | `boolean` | `false` | Não | Reserva espaco visual para scrollbar. |
| `contentDirection` | `SgPanelContentDirection` = `"row" \| "column"` | — | Não | Controlam a disposicao dos filhos dentro da area de conteudo. |
| `contentGap` | `number \| string` | — | Não | Controlam a disposicao dos filhos dentro da area de conteudo. |
| `contentJustify` | `SgPanelContentJustify` = `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | Não | Controlam a disposicao dos filhos dentro da area de conteudo. |
| `contentAlign` | `SgPanelContentAlign` = `"start" \| "center" \| "end" \| "stretch"` | — | Não | Controlam a disposicao dos filhos dentro da area de conteudo. |
| `contentWrap` | `boolean` | — | Não | Controlam a disposicao dos filhos dentro da area de conteudo. |
| `contentClassName` | `string` | — | Não | Classes do contêiner flex interno que envolve os filhos não ancorados (gerado por `renderDockContent`). *(Inferência)* |
| `contentStyle` | `React.CSSProperties` | — | Não | Estilo inline do contêiner flex interno dos filhos não ancorados (mesclado depois do `gap`). *(Inferência)* |
| `children` | `React.ReactNode` | — | Não | Conteudo livre ou outros elementos de layout aninhados. |

- **Atributos DOM herdados**: o tipo é `Omit< React.HTMLAttributes<HTMLDivElement>, "align" \| "children" > & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
Nenhum próprio; eventos DOM vão para o `<div>` raiz via `{...rest}`.

### Ref
Não aceita `ref`.

### Children, slots e composição
- **Docking (Confirmado, `renderDockContent`)**: os filhos que são `SgPanel` **com `align` definido** (detectados por `displayName === "SgPanel"`) são distribuídos em faixas: `top` e `bottom` (largura 100%, altura `height` em %), `left` e `right` (altura 100%, largura `width` em %), `client` (ocupa o restante, `flex: 1`). Filhos sem `align` ficam num contêiner flex na área central.
- Sem filhos ancorados, todos os filhos ficam num contêiner flex com `contentDirection` (padrão: `row` se o próprio painel for `top`/`bottom`, senão `column`), `contentGap` (padrão `10`px), `contentJustify` (`start`), `contentAlign` (padrão `start` para top/bottom, senão `stretch`) e `contentWrap` (`false`).
- `width`/`height` numéricos são **porcentagem** (`20` → `20%`); strings passam como CSS. `minWidthPx`/`minHeightPx` em px.
- `padding` vira `margin` do painel; `contentPadding` vira `padding` (Confirmado).
- `span`/`rowSpan` não são usados pelo próprio `SgPanel`; são lidos pelo `SgGrid` pai.
- `scrollable`: `false` → `overflow-hidden`; `true`/`"auto"` → `overflow-auto`; `"y"`/`"x"` → overflow só no eixo.

### Tipos auxiliares exportados
`SgPanelAlign = "top" | "left" | "bottom" | "right" | "client"` · `SgPanelBorderStyle = "none" | "solid" | "dashed"` · `SgPanelScrollable = boolean | "auto" | "y" | "x"` · `SgPanelPercent = number | \`${number}%\``. Os tipos `SgPanelContentDirection`, `SgPanelContentJustify`, `SgPanelContentAlign` existem no arquivo mas **não** são exportados pelo barrel.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Sem roles/ARIA próprios; aceita os herdados via `{...rest}`.

---

## SgScreen

Raiz de tela: ocupa a viewport (`100%` × `100dvh`) por padrão e aplica o mesmo docking por `align` dos `SgPanel` filhos (área tratada como `client`). Fonte: `src/layout/SgScreen.tsx` → `SgScreen`.

### Import
```tsx
import { SgScreen, type SgScreenProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `fullscreen` | `boolean` | `true` | Não | Define se a tela ocupa toda a viewport. |
| `width` | `number \| string` | — | Não | Largura explicita quando a tela nao for fullscreen. |
| `height` | `number \| string` | — | Não | Altura explicita quando a tela nao for fullscreen. |
| `padding` | `number \| string` | — | Não | Espacamento interno aplicado ao root da tela. |
| `children` | `React.ReactNode` | — | Não | Conteudo estrutural da tela, normalmente com panels dockados. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
Nenhum próprio; DOM via `{...rest}`.

### Ref
Não aceita `ref`.

### Children, slots e composição
Os filhos passam por `renderDockContent({ align: "client" })`: `SgPanel` com `align` são ancorados; os demais ficam num contêiner flex em coluna. `width`/`height` explícitos têm precedência sobre `fullscreen` (Confirmado).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Sem roles/ARIA próprios.

---

## SgGroupBox

Agrupador com `<fieldset>` + `<legend>` (título). Fonte: `src/layout/SgGroupBox.tsx` → `SgGroupBox`.

### Import
```tsx
import { SgGroupBox, type SgGroupBoxProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `title` | `string` | — | Sim | Titulo exibido no topo da secao agrupada. |
| `height` | `number \| string` | — | Não | Altura do bloco de agrupamento. |
| `width` | `number \| string` | — | Não | Largura do bloco de agrupamento. |
| `children` | `React.ReactNode` | — | Sim | Conteudo agrupado dentro do fieldset. |
| `className` | `string` | — | Não | Classes CSS adicionais para o estilo externo. |
| `style` | `React.CSSProperties` | — | Não | Inline style adicional do container. |

### Eventos e callbacks
Nenhum.

### Ref
Não aceita `ref`.

### Children, slots e composição
Estrutura: `<div style={width,height,...style}>` → `<fieldset>` → `<legend>{title}</legend>` + `<div>{children}</div>`. `width` padrão `100%` (fallback `toCssSize(width) ?? "100%"`); números viram `px`.

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Usa semântica nativa `fieldset`/`legend` (Confirmado). Não aceita outros atributos DOM (tipo fechado).

---

## SgCard

Card com cabeçalho (título/descrição/leading/trailing/actions), corpo, rodapé, modo clicável, colapso e arraste com posição persistida. Fonte: `src/layout/SgCard.tsx` → `SgCard`.

### Import
```tsx
import { SgCard, type SgCardProps, type SgCardVariant, type SgCardSize, type SgCardPosition } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `className` | `string` | — | Não | Customizacao de estilos por bloco. |
| `draggable` | `boolean` | `false` | Não | Arrasta o card ao segurar o cabecalho. |
| `children` | `React.ReactNode` | — | Não | Conteudo principal exibido dentro do card. |
| `headerClassName` | `string` | — | Não | Customizacao de estilos por bloco. |
| `bodyClassName` | `string` | — | Não | Customizacao de estilos por bloco. |
| `footerClassName` | `string` | — | Não | Customizacao de estilos por bloco. |
| `bgColor` | `string` | `?? style?.backgroundColor` ᶠ | Não | Cor de fundo do card, titulo e footer. |
| `bgColorTitle` | `string` | — | Não | Cor de fundo do card, titulo e footer. |
| `bgColorFooter` | `string` | — | Não | Cor de fundo do card, titulo e footer. |
| `cardStyle` | `SgCardVariant` = `"default" \| "outlined" \| "flat" \| "elevated"` | `"default"` | Não | Estilo visual da superficie do card. |
| `size` | `SgCardSize` = `"sm" \| "md" \| "lg"` | `"md"` | Não | Escala geral de espacos e dimensoes do card. |
| `leading` | `React.ReactNode` | — | Não | Elementos auxiliares no cabecalho. |
| `trailing` | `React.ReactNode` | `?? trailer` ᶠ | Não | Elementos auxiliares no cabecalho. |
| `trailer` | `React.ReactNode` | — | Não | Elementos auxiliares no cabecalho. |
| `title` | `React.ReactNode` | — | Não | Titulo principal do card. |
| `description` | `React.ReactNode` | — | Não | Descricao ou subtitulo complementar do cabecalho. |
| `actions` | `React.ReactNode` | — | Não | Areas customizaveis do layout. |
| `header` | `React.ReactNode` | — | Não | Areas customizaveis do layout. |
| `footer` | `React.ReactNode` | — | Não | Areas customizaveis do layout. |
| `clickable` | `boolean` | `false` | Não | Transforma o card em superficie clicavel. |
| `disabled` | `boolean` | `false` | Não | Modo clicavel e estado desabilitado. |
| `collapsible` | `boolean` | `false` | Não | Permite recolher e expandir o conteudo do card. |
| `defaultOpen` | `boolean` | `true` | Não | Controle de colapso do conteudo. |
| `open` | `boolean` | — (não controlado quando omitido) | Não | Controle de colapso do conteudo. |
| `onOpenChange` | `(open: boolean) => void` | — | Não | Callback de abertura/fechamento. |
| `collapseIcon` | `React.ReactNode` | `?? <DefaultCaret open={isOpen} size={collapseIconSize} />` ᶠ | Não | Customizacao do botao de colapso e posicao do icone. |
| `collapseIconSize` | `number` | `18` | Não | Customizacao do botao de colapso e posicao do icone. |
| `collapseToggleAlign` | `"left" \| "right"` | `"left"` | Não | Customizacao do botao de colapso e posicao do icone. |
| `toggleOnHeaderClick` | `boolean` | `true` | Não | Com `collapsible`, clicar no cabeçalho (ou Enter/Espaço com foco nele) alterna abrir/fechar; com `false`, só o botão de colapso alterna. *(Inferência)* |
| `defaultPosition` | `SgCardPosition` | — (usa `{ x: 0, y: 0 }` quando omitido) | Não | Arrasta o card ao segurar o cabecalho. |
| `dragPersistKey` | `string` | — | Não | Persistencia de posicao via EnvironmentProvider ou localStorage fallback. |
| `onPositionChange` | `(position: SgCardPosition) => void` | — | Não | Persistencia de posicao via EnvironmentProvider ou localStorage fallback. |
| `onClick` | `React.MouseEventHandler<HTMLElement>` | — | Não | Callback disparado quando o card e acionado. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLElement>, "title" \| "onClick"> & { ... }`; acrescenta 273 props de `@types/react` (`HTMLAttributes` 52, `AriaAttributes` 53, `DOMAttributes` 168). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
| Callback | Assinatura | Quando dispara (Confirmado) |
|---|---|---|
| `onClick` | `React.MouseEventHandler<HTMLElement>` | Clique no card (desativado com `disabled`). Se o card é interativo (`clickable` ou `onClick`, e **não** `collapsible`/`draggable`), a raiz é um `<button type="button">`. |
| `onOpenChange` | `(open: boolean) => void` | Ao alternar o colapso (botão ou cabeçalho), só com `collapsible`. |
| `onPositionChange` | `(position: SgCardPosition) => void` | Em todo commit de `dragPosition` (efeito), inclusive na montagem e ao hidratar a posição salva. |

### Ref
Não aceita `ref`.

### Children, slots e composição
- Slots: `header` (substitui o cabeçalho padrão inteiro), `title`, `description`, `leading`, `trailing` (alias legado `trailer`; `trailing ?? trailer`), `actions`, `footer`, `collapseIcon`, `children` (corpo).
- Raiz: `<section>` (ou `<button>` quando interativo); demais atributos via `{...rest}`.
- **Arraste** (`draggable`): arrasta segurando o cabeçalho (ignora cliques em botões, links, inputs e elementos com `data-sg-card-no-drag="true"`); aplica `transform: translate3d`. A posição é salva na chave `dragPersistKey` ou, na falta, `sg-card-pos:<id>`; sem chave, não persiste. Com `SgEnvironmentProvider` presente usa `useSgPersistence` (load/save/clear); sem provider usa `localStorage`. Valores inválidos são removidos (Confirmado).

### Contexto, providers e hooks
Consome `useHasSgEnvironmentProvider`/`useSgPersistence` (environment) e `useComponentsI18n` (rótulos "expandir/recolher").

### Acessibilidade
- Botão de colapso com `aria-label` traduzido (`components.actions.collapse`/`expand`) e `aria-expanded` (Confirmado; coberto por `tests/buttons-menus.test.mjs`).
- Com `collapsible` + `toggleOnHeaderClick`, o cabeçalho recebe `role="button"`, `tabIndex=0`, `aria-expanded` e alterna com **Enter** ou **Espaço** (Confirmado).
- Card interativo vira `<button>` nativo (foco/teclado nativos).

---

## SgAccordion

Lista de seções colapsáveis, vertical ou horizontal (cabeçalho com texto vertical), controlada ou não. Fonte: `src/layout/SgAccordion.tsx` → `SgAccordion`.

### Import
```tsx
import { SgAccordion, type SgAccordionProps, type SgAccordionItem, type SgAccordionOrientation } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | `?? 'sg-accordion-${generatedId}'` ᶠ | Não | Identificador do accordion. |
| `items` | `SgAccordionItem[]` | — | Sim | Colecao de secoes renderizadas pelo accordion. |
| `orientation` | `SgAccordionOrientation` = `"horizontal" \| "vertical"` | `"vertical"` | Não | Direcao de expansao dos paineis. |
| `multiple` | `boolean` | `false` | Não | Permite manter varios paineis abertos simultaneamente. |
| `collapsible` | `boolean` | `true` | Não | Permite fechar um painel ja ativo. |
| `activeIndex` | `number \| number[]` | — (não controlado quando omitido) | Não | Estado controlado dos paineis abertos. |
| `defaultActiveIndex` | `number \| number[]` | — (sem ele, abre o índice `0` se `defaultOpenFirst`) | Não | Estado inicial dos paineis abertos. |
| `defaultOpenFirst` | `boolean` | `true` | Não | Initial open behavior and DOM persistence. |
| `onActiveIndexChange` | `(indexes: number[]) => void` | — | Não | Callback disparado quando o conjunto de paineis abertos muda. |
| `onItemToggle` | `(index: number, isOpen: boolean) => void` | — | Não | State change events. |
| `panelClassName` | `string` | — | Não | Style customization per area. |
| `headerClassName` | `string` | — | Não | Style customization per area. |
| `headerBackgroundColor` | `string` | `?? DEFAULT_HEADER_BACKGROUND` ᶠ | Não | Cor base dos headers do accordion. |
| `contentClassName` | `string` | — | Não | Style customization per area. |
| `animationDuration` | `number` | `220` | Não | Open/close animation duration. |
| `horizontalHeaderWidth` | `number \| string` | `52` | Não | Dimensions in horizontal mode. |
| `horizontalMinHeight` | `number \| string` | `220` | Não | Dimensions in horizontal mode. |
| `keepMounted` | `boolean` | `true` | Não | Initial open behavior and DOM persistence. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & { ... }`; acrescenta 276 props de `@types/react` (`HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 169), incluindo `children`. Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks
| Callback | Assinatura | Quando dispara (Confirmado) |
|---|---|---|
| `onActiveIndexChange` | `(indexes: number[]) => void` | A cada alternância, com os índices abertos normalizados (ordenados, únicos, dentro do intervalo; no máximo 1 se `multiple=false`). |
| `onItemToggle` | `(index: number, isOpen: boolean) => void` | Após `onActiveIndexChange`, com o novo estado do item. Não dispara para item `disabled` nem ao tentar fechar com `collapsible=false`. |

### Ref
Não aceita `ref`.

### Tipos auxiliares exportados
`SgAccordionItem`:

| Campo | Tipo | Obrigatório | Uso |
|---|---|---|---|
| `id` | `string \| number` | Não | Compõe os ids DOM (`<baseId>-header-<id>` etc.); padrão = índice. |
| `title` | `React.ReactNode` | Sim | Texto do cabeçalho. |
| `content` | `React.ReactNode` | Sim | Conteúdo do painel. |
| `disabled` | `boolean` | Não | Bloqueia a alternância (botão `disabled`). |
| `icon` | `React.ReactNode` | Não | Ícone no cabeçalho. |
| `end` | `React.ReactNode` | Não | Conteúdo à direita do cabeçalho (só vertical). |
| `className` | `string` | Não | Classe do painel do item. |
| `headerClassName` | `string` | Não | Classe do cabeçalho do item. |
| `headerBackgroundColor` | `string` | Não | Cor do cabeçalho (precede a prop do componente). |
| `contentClassName` | `string` | Não | Classe da região de conteúdo. |

`SgAccordionOrientation = "vertical" | "horizontal"`.

### Children, slots e composição
Conteúdo vem só de `items` (não usa `children`). Com `keepMounted=false`, conteúdo fechado é desmontado. Na orientação vertical a animação usa `max-height` até `960px` — conteúdos mais altos podem ser cortados durante a transição/aberto (Inferência a partir do estilo `maxHeight: "960px"`).

### Contexto, providers e hooks
Nenhum.

### Acessibilidade
Cabeçalho é `<button type="button">` com `aria-controls` e `aria-expanded`; conteúdo tem `role="region"` e `aria-labelledby` apontando para o cabeçalho (Confirmado). Não há navegação por setas entre cabeçalhos.

---

## SgPageControl

Abas (`tablist`) com páginas declaradas como filhos `SgPageControlPage`; controlado por id ou índice; no celular vira rolagem ou `<select>`. Fonte: `src/layout/SgPageControl.tsx` → `SgPageControl`, `SgPageControlPage`.

### Import
```tsx
import { SgPageControl, SgPageControlPage, type SgPageControlProps, type SgPageControlPageProps } from "@seedgrid/fe-components";
```

### Props — `SgPageControl`
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | — | Sim | Paginas filhas definidas por SgPageControlPage. |
| `activePageId` | `string` | — | Não | Id da pagina ativa em modo controlado. |
| `activeIndex` | `number` | — | Não | Indice ativo em modo controlado. |
| `defaultActivePageId` | `string` | — | Não | Initial state when uncontrolled. |
| `defaultActiveIndex` | `number` | `0` | Não | Initial state when uncontrolled. |
| `onActivePageIdChange` | `( pageId: string, context: { index: number; page: SgPageControlPageProps } ) => void` | — | Não | Callback disparado quando a pagina ativa muda. |
| `onActiveIndexChange` | `( index: number, context: { pageId: string; page: SgPageControlPageProps } ) => void` | — | Não | Events triggered on page change. |
| `hiddenPageIds` | `string[]` | — (tratado como `[]`) | Não | Hide pages without removing declarations. |
| `keepMounted` | `boolean` | `false` | Não | Mantem paineis inativos montados no DOM. |
| `pageControlStyle` | `"underline" \| "pills"` | `"underline"` | Não | Estilo visual da lista de abas. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Não | Escala visual das abas. |
| `fullWidthTabs` | `boolean` | `false` | Não | Distribui as abas em larguras iguais a partir do tablet (`md`, 768px). No celular as abas mantem a largura natural e a lista rola — abas iguais numa tela estreita espremem os rotulos ate ninguem conseguir ler. |
| `mobilePageControl` | `"scroll" \| "select"` | `"scroll"` | Não | Comportamento das abas no celular (abaixo de `md`, 768px). - `"scroll"` (default): continuam abas, com rolagem horizontal, e a aba ativa e trazida para a area visivel sozinha. - `"select"`: viram um `<select>` nativo, util quando sao muitas abas ou os rotulos sao longos. Tablet e desktop nao mudam. |
| `keyboardNavigation` | `boolean` | `true` | Não | Arrow/Home/End navigation between tabs. |
| `ariaLabel` | `string` | `?? t(i18n, "components.pageControl.ariaLabel")` ᶠ | Não | Accessibility and empty state. |
| `emptyMessage` | `React.ReactNode` | `?? t(i18n, "components.pageControl.empty")` ᶠ | Não | Accessibility and empty state. |
| `className` | `string` | — | Não | Classes and styles for wrappers. |
| `tabListClassName` | `string` | — | Não | Classes and styles for wrappers. |
| `tabClassName` | `string` | — | Não | Classes and styles for wrappers. |
| `panelClassName` | `string` | — | Não | Classes and styles for wrappers. |
| `style` | `React.CSSProperties` | — | Não | Classes and styles for wrappers. |

### Props — `SgPageControlPage`
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Identificador estavel da pagina. |
| `title` | `React.ReactNode` | — | Sim | Titulo exibido na aba da pagina. |
| `hint` | `string` | — | Não | Descricao curta associada a aba. |
| `icon` | `React.ReactNode` | — | Não | Icone opcional da aba. |
| `hidden` | `boolean` | — (tratado como `false`) | Não | Oculta a pagina sem remove-la da estrutura. |
| `disabled` | `boolean` | — (tratado como `false`) | Não | Desabilita a selecao da pagina. |
| `className` | `string` | — | Não | Classes and styles for wrappers. |
| `style` | `React.CSSProperties` | — | Não | Classes and styles for wrappers. |
| `tabClassName` | `string` | — | Não | Classes and styles for wrappers. |
| `children` | `React.ReactNode` | — | Sim | Conteudo exibido no painel desta pagina. |

### Eventos e callbacks
| Callback | Assinatura | Quando dispara (Confirmado) |
|---|---|---|
| `onActivePageIdChange` | `(pageId: string, context: { index: number; page: SgPageControlPageProps }) => void` | Ao selecionar outra página visível (clique, teclado, select mobile). |
| `onActiveIndexChange` | `(index: number, context: { pageId: string; page: SgPageControlPageProps }) => void` | Junto com o anterior; `index` é relativo às páginas **visíveis**. |

### Ref
Nenhum dos dois aceita `ref`.

### Children, slots e composição
- Só filhos `SgPageControlPage` (ou com `displayName === "SgPageControlPage"`) viram páginas; o resto é ignorado. Id padrão: `sg-page-control-page-<n>` (1-based).
- `SgPageControlPage` apenas renderiza `children`; suas props são lidas pelo pai (título, ícone, `hint` como `title` da aba, `className`/`style` do painel, `tabClassName` da aba).
- Página ativa inválida (oculta/inexistente) cai para a primeira visível.
- `keepMounted` (no `SgPageControl`) mantém todos os painéis montados (ocultos com `hidden`).
- No select mobile, o rótulo da opção é `title` (se string/number), senão `hint`, senão o id.

### Contexto, providers e hooks
`useComponentsI18n` para `ariaLabel`/`emptyMessage` padrão.

### Acessibilidade (Confirmado)
- `role="tablist"` com `aria-label`; abas `role="tab"` com `aria-selected`, `aria-controls`, roving `tabIndex` (0 na ativa, -1 nas demais); painéis `role="tabpanel"` com `aria-labelledby`.
- Teclado (quando `keyboardNavigation`): **→/↓** próxima, **←/↑** anterior, **Home**/**End** primeira/última, **Enter**/**Espaço** ativam.
- `<select>` mobile com `aria-label`.

---

## SgExpandablePanel

Painel que expande para uma direção, inline (empurra o layout) ou em overlay (portal no `document.body`, com backdrop, foco preso e bloqueio de scroll). Fonte: `src/layout/SgExpandablePanel.tsx` → `SgExpandablePanel`.

### Import
```tsx
import {
  SgExpandablePanel,
  type SgExpandablePanelProps, type SgExpandablePanelDirection, type SgExpandablePanelPlacement,
  type SgExpandablePanelMode, type SgExpandablePanelSize, type SgExpandablePanelAnimation,
  type SgExpandablePanelElevation, type SgExpandablePanelRounded, type SgExpandablePanelRole
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `header` | `React.ReactNode` | — | Não | Conteudo opcional do cabecalho. |
| `children` | `React.ReactNode` | — | Sim | Conteudo principal do painel. |
| `footer` | `React.ReactNode` | — | Não | Conteudo opcional do rodape. |
| `handle` | `React.ReactNode` | — | Não | Elemento visual acima do header. |
| `open` | `boolean` | — | Não | Controla a abertura do painel. |
| `defaultOpen` | `boolean` | `false` | Não | Estado inicial no modo nao controlado. |
| `onOpenChange` | `(open: boolean) => void` | — | Não | Callback disparado ao abrir ou fechar o painel. |
| `expandTo` | `SgExpandablePanelDirection` = `"top" \| "right" \| "bottom" \| "left"` | — | Sim | Direcao para a qual o painel se expande. |
| `placement` | `SgExpandablePanelPlacement` = `"start" \| "center" \| "end"` | `"start"` | Não | Posicao no eixo perpendicular. |
| `mode` | `SgExpandablePanelMode` = `"inline" \| "overlay"` | `"inline"` | Não | Modo de renderizacao do painel. |
| `size` | `SgExpandablePanelSize` | `default`: `320` (eixo x) / `280` (eixo y); `min`: `180`/`140` ᶠ | Não | Configuracao de tamanho minimo, maximo e padrao. |
| `resizable` | `boolean` | `false` | Não | Permite redimensionar o painel. |
| `onSizeChange` | `(size: number \| string) => void` | — | Não | Retorno de chamada durante o redimensionamento. |
| `closeOnOutsideClick` | `boolean` | `?? mode === "overlay"` ᶠ | Não | Fecha ao clicar fora do painel. |
| `closeOnEsc` | `boolean` | `true` | Não | Fecha ao pressionar ESC. |
| `trapFocus` | `boolean` | `?? mode === "overlay"` ᶠ | Não | Prende foco dentro do painel. |
| `showBackdrop` | `boolean` | `true` | Não | Mostra camada de fundo no overlay. |
| `animation` | `SgExpandablePanelAnimation` | `{ type: "slide", durationMs: 180 }` ᶠ | Não | Animacao de entrada/saida. |
| `elevation` | `SgExpandablePanelElevation` = `"sm" \| "md" \| "lg" \| "none"` | `"md"` | Não | Sombra do painel. |
| `border` | `boolean` | `true` | Não | Exibe borda do container. |
| `rounded` | `SgExpandablePanelRounded` = `"md" \| "lg" \| "none" \| "xl"` | `"lg"` | Não | Raio dos cantos. |
| `ariaLabel` | `string` | `?? t(i18n, "components.expandablePanel.ariaLabel")` ᶠ | Não | Rotulo acessivel do painel. |
| `role` | `SgExpandablePanelRole` = `"dialog" \| "region"` | `?? (mode === "overlay" ? "dialog" : "region")` ᶠ | Não | Papel semantico aplicado ao painel. |
| `className` | `string` | — | Não | Classe extra no container do painel. |
| `contentClassName` | `string` | — | Não | Classe extra no wrapper de conteudo. |
| `headerClassName` | `string` | — | Não | Classe extra da area de header. |
| `bodyClassName` | `string` | — | Não | Classe extra da area de body. |
| `footerClassName` | `string` | — | Não | Classe extra da area de footer. |
| `overlayClassName` | `string` | — | Não | Classe extra da camada de overlay/backdrop. |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do container do painel. |

- Aceita `ref` (via `React.forwardRef`) e `key`.

### Eventos e callbacks
| Callback | Assinatura | Quando dispara (Confirmado) |
|---|---|---|
| `onOpenChange` | `(open: boolean) => void` | Fechamento por **Esc** (`closeOnEsc`), clique no backdrop (`closeOnOutsideClick`) — só em overlay. O componente não tem botão próprio de abrir/fechar: abrir é responsabilidade do chamador. |
| `onSizeChange` | `(size: number \| string) => void` | Durante o redimensionamento pela alça (`resizable`), com o tamanho em px já limitado a `min`/`max`. |

### Ref
`React.forwardRef<HTMLDivElement>` — o `ref` aponta para o elemento do painel (Confirmado).

### Tipos auxiliares exportados
`SgExpandablePanelDirection = "left" | "right" | "top" | "bottom"` · `SgExpandablePanelPlacement = "start" | "center" | "end"` · `SgExpandablePanelMode = "inline" | "overlay"` · `SgExpandablePanelSize = { min?: number | string; max?: number | string; default?: number | string }` · `SgExpandablePanelAnimation = { type?: "slide" | "fade" | "none"; durationMs?: number }` · `SgExpandablePanelElevation = "none" | "sm" | "md" | "lg"` · `SgExpandablePanelRounded = "none" | "md" | "lg" | "xl"` · `SgExpandablePanelRole = "dialog" | "region"`.

### Children, slots e composição
Slots `handle` (topo), `header`, `children` (corpo), `footer`. `size.min` padrão efetivo `180`px (x) / `140`px (y); `max` sem limite. Em overlay, o backdrop é renderizado se `showBackdrop` **ou** `closeOnOutsideClick` (fica transparente sem `showBackdrop`).

### Contexto, providers e hooks
`useComponentsI18n` (rótulo padrão `components.expandablePanel.ariaLabel`).

### Acessibilidade (Confirmado)
- `role` = `dialog` em overlay / `region` inline (ou a prop `role`); `aria-modal` em overlay; `aria-label` sempre presente.
- Overlay: foco vai para o 1º focável ao abrir e volta ao elemento anterior ao fechar; **Tab/Shift+Tab** circulam dentro do painel com `trapFocus`; **Esc** fecha com `closeOnEsc`; `document.body.style.overflow = "hidden"` enquanto aberto.
- A alça de resize é `aria-hidden` e só funciona com ponteiro (sem teclado).

---

## SgCarousel

Carrossel horizontal/vertical de `items`, com vários visíveis, rolagem em passos, modo circular, autoplay (pausa no hover), navegadores e indicadores. Fonte: `src/layout/SgCarousel.tsx` → `SgCarousel`.

### Import
```tsx
import { SgCarousel, type SgCarouselProps, type SgCarouselOrientation } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Unique identifier for the carousel |
| `items` | `React.ReactNode[]` | — | Sim | Items to display in the carousel |
| `numVisible` | `number` | `1` | Não | Number of items to display at once |
| `numScroll` | `number` | `1` | Não | Number of items to scroll at a time |
| `orientation` | `SgCarouselOrientation` = `"horizontal" \| "vertical"` | `"horizontal"` | Não | Orientation of the carousel |
| `circular` | `boolean` | `true` | Não | Enable circular mode (infinite loop) |
| `autoPlay` | `boolean` | `false` | Não | Enable auto play |
| `autoPlayInterval` | `number` | `3000` | Não | Auto play interval in milliseconds |
| `showNavigators` | `boolean` | `true` | Não | Show navigation buttons |
| `showIndicators` | `boolean` | `true` | Não | Show indicators (dots) |
| `className` | `string` | `""` | Não | Custom class name for container |
| `itemClassName` | `string` | `""` | Não | Custom class name for items |
| `width` | `number \| string` | `"100%"` | Não | Width of the carousel container |
| `height` | `number \| string` | — | Não | Height of the carousel container |
| `gap` | `number` | `16` | Não | Gap between items in pixels |
| `onIndexChange` | `(index: number) => void` | — | Não | Callback when active index changes |
| `style` | `React.CSSProperties` | — | Não | Custom inline style for container |
| `customNavigators` | `{ prev?: React.ReactNode; next?: React.ReactNode; }` | — | Não | Custom render for navigation buttons |

### Eventos e callbacks
`onIndexChange(index: number)` — disparado em efeito depois que o índice ativo (índice do 1º item visível) muda por navegação, indicador ou autoplay (Confirmado). Não há prop para controlar o índice externamente.

### Ref
Não aceita `ref`.

### Children, slots e composição
Conteúdo via `items: React.ReactNode[]` (não usa `children`). `customNavigators.prev/next` substituem o conteúdo dos botões de navegação. `numVisible`/`numScroll` < 1 são tratados como 1.

### Contexto, providers e hooks
`useComponentsI18n` (rótulo dos indicadores).

### Acessibilidade
- Indicadores têm `aria-label` traduzido (`components.carousel.goToSlide`, ex.: "slide 2") — Confirmado (teste em `tests/buttons-menus.test.mjs`).
- Botões anterior/próximo **não** têm `aria-label` (só ícone) e não há suporte a teclado próprio nem pausa do autoplay por foco — lacuna (Confirmado pela ausência no código).

---

## SgBreadcrumb

Trilha de navegação com separadores, ícone de início, colapso de itens excedentes (menu `<details>`) ou rolagem horizontal. Fonte: `src/layout/SgBreadcrumb.tsx` → `SgBreadcrumb`.

### Import
```tsx
import { SgBreadcrumb, type SgBreadcrumbProps, type SgBreadcrumbItem, type SgBreadcrumbSeparator } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `items` | `SgBreadcrumbItem[]` | — | Sim | Lista ordenada de niveis do caminho de navegacao. |
| `separator` | `SgBreadcrumbSeparator \| React.ReactNode` | `"chevron"` | Não | Separador visual entre os niveis. |
| `maxItems` | `number` | — | Não | Quantidade maxima de itens visiveis antes do colapso. |
| `overflowBehavior` | `"collapse" \| "scroll"` | `"collapse"` | Não | Comportamento quando o caminho excede o espaco disponivel. |
| `showHomeIcon` | `boolean` | `false` | Não | Adiciona um item inicial com icone de home. |
| `homeHref` | `string` | `"/"` | Não | Automatic Home item configuration. |
| `homeLabel` | `React.ReactNode` | `"Home"` | Não | Automatic Home item configuration. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Não | Visual size of items. |
| `variant` | `"default" \| "subtle" \| "primary"` | `"default"` | Não | Variante visual do breadcrumb. |
| `ariaLabel` | `string` | `?? t(i18n, "components.breadcrumb.ariaLabel")` ᶠ | Não | Accessible label for navigation. |
| `overflowLabel` | `string` | `?? t(i18n, "components.breadcrumb.overflow")` ᶠ | Não | Label for the overflow button. |
| `onNavigate` | `(item: SgBreadcrumbItem, index: number) => void` | — | Não | Callback disparado ao navegar por um item. |
| `className` | `string` | — | Não | Layout and style customization. |
| `itemClassName` | `string` | — | Não | Layout and style customization. |
| `style` | `React.CSSProperties` | — | Não | Layout and style customization. |

### Eventos e callbacks
`onNavigate(item, index)` — disparado ao clicar num item com `href` (como `<a>`, após `item.onClick`) ou com `onClick` (como `<button>`); não impede a navegação do link. O item de início gerado por `showHomeIcon` é reportado com `index = -1` (Confirmado). O último item nunca é clicável (é a página atual).

### Ref
Não aceita `ref`.

### Tipos auxiliares exportados
`SgBreadcrumbItem`: `id: string` (obrigatório), `label: React.ReactNode` (obrigatório), `href?: string`, `icon?: React.ReactNode`, `disabled?: boolean`, `hidden?: boolean` (filtrado antes de renderizar), `onClick?: () => void`.
`SgBreadcrumbSeparator = "slash" | "chevron" | "dot" | "arrow"`; `separator` também aceita um elemento React.

### Children, slots e composição
Colapso (`overflowBehavior="collapse"` + `maxItems >= 2`): mantém o 1º item e os `maxItems - 2` últimos; os do meio vão para um menu "…" (`<details>`). Com `maxItems = 2`, mostra só o primeiro e o último (sem menu).

### Contexto, providers e hooks
`useComponentsI18n` (`components.breadcrumb.ariaLabel`, `components.breadcrumb.overflow`).

### Acessibilidade (Confirmado)
`<nav aria-label>` com `<ol>`; separadores `aria-hidden`; último item com `aria-current="page"`; o botão de overflow (`<summary>`) tem `aria-label`.

---

## SgMenu

Menu de navegação hierárquico: sidebar (recolhível, com persistência), drawer (overlay), inline ou híbrido; variantes painel (árvore), em camadas e mega menu; busca integrada, marca, bloco de usuário, pin e encaixe em `SgDockLayout`. Fonte: `src/layout/SgMenu.tsx` → `SgMenu` (lógica pura em `src/layout/menu-logic.ts`).

### Import
```tsx
import {
  SgMenu,
  type SgMenuProps, type SgMenuStyle, type SgMenuNode, type SgMenuSelection, type SgMenuBrand, type SgMenuUser
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | `?? 'sg-menu-${autoId.replace(/[:]/g, "")}'` ᶠ | Não | Stable menu identifier (recommended for dockable persistence). |
| `menu` | `SgMenuNode[]` | — | Sim | Arvore de itens e subitens do menu. |
| `selection` | `SgMenuSelection` | — | Não | Selecao ativa por id ou url. |
| `brand` | `SgMenuBrand` | — | Não | Bloco de marca no topo do menu. |
| `user` | `SgMenuUser` | — | Não | Bloco de usuario exibido no menu. |
| `userMenu` | `SgMenuNode[]` | — | Não | Actions shown in the user menu. |
| `menuStyle` | `"sidebar" \| "drawer" \| "inline" \| "hybrid"` | `"sidebar"` | Não | Modo estrutural do menu. |
| `menuVariantStyle` | `SgMenuStyle` = `"panel" \| "tiered" \| "mega-horizontal" \| "mega-vertical" \| "PanelMenu" \| "Tiered" \| "MegaMenuHorizontal" \| "MegaMenuVertical"` | `"panel"` | Não | Variante visual e comportamental do menu. |
| `position` | `"left" \| "right"` | `"left"` | Não | Horizontal menu position. |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` | Não | Visual density of rows and icons. |
| `indent` | `number` | `16` | Não | Indent per depth level. |
| `collapsedWidth` | `number \| string` | `72` | Não | Width when collapsed. |
| `expandedWidth` | `number \| string` | `280` | Não | Width when expanded. |
| `overlaySize` | `SgExpandablePanelSize` | `?? { default: menuStyle === "drawer" ? 320 : expandedWidth, min: 240, max: 520 }` ᶠ | Não | Overlay size in drawer/hybrid modes. |
| `overlayBackdrop` | `boolean` | `?? (menuStyle === "drawer")` ᶠ | Não | Controls overlay backdrop. |
| `dockable` | `boolean` | `false` | Não | When true and inside SgDockLayout, the menu can be docked in zones. |
| `dockZone` | `SgDockZoneId` = `"top" \| "right" \| "bottom" \| "left" \| "free"` | `?? resolveDockZoneFromOrientationDirection(orientationDirection)` ᶠ | Não | Initial zone in dockable mode (if omitted, can be inferred from orientationDirection). |
| `draggable` | `boolean` | `false` | Não | In dockable mode, shows drag handle between dock zones. |
| `orientationDirection` | `SgMenuOrientationDirection` = `"horizontal-left" \| "horizontal-right" \| "vertical-up" \| "vertical-top" \| "vertical-down"` | — | Não | Optional direction used as fallback to infer initial dockZone. |
| `mode` | `"accordion" \| "multiple"` | `"multiple"` | Não | Group expansion strategy. |
| `expandedIds` | `string[]` | — | Não | External control of expanded groups. |
| `defaultExpandedIds` | `string[]` | `[]` | Não | Initial state of expanded groups. |
| `onExpandedIdsChange` | `(ids: string[]) => void` | — | Não | Callback when expanded groups change. |
| `collapsed` | `boolean` | — | Não | Controla o estado colapsado do menu. |
| `defaultCollapsed` | `boolean` | `false` | Não | Initial collapsed state. |
| `onCollapsedChange` | `(value: boolean) => void` | — | Não | Callback when collapsing/expanding. |
| `showCollapseButton` | `boolean` | `false` | Não | Shows collapse button in the header. |
| `open` | `boolean` | — | Não | External control of drawer/overlay open state. |
| `defaultOpen` | `boolean` | `false` | Não | Initial open state in drawer/overlay. |
| `onOpenChange` | `(value: boolean) => void` | — | Não | Callback when opening/closing overlay. |
| `closeOnNavigate` | `boolean` | `?? true` ᶠ | Não | Closes drawer after navigation. |
| `pinned` | `boolean` | — | Não | External control of pinned state. |
| `defaultPinned` | `boolean` | `false` | Não | Initial pinned state. |
| `onPinnedChange` | `(value: boolean) => void` | — | Não | Callback when pinning/unpinning. |
| `showPinButton` | `boolean` | `false` | Não | Shows pin button in the header. |
| `onNavigate` | `(node: SgMenuNode) => void` | — | Não | Callback disparado na navegacao por um item. |
| `onAction` | `(node: SgMenuNode) => void` | — | Não | Fired for action items. |
| `onItemClick` | `(node: SgMenuNode) => void` | — | Não | Fired on any item click. |
| `ariaLabel` | `string` | `?? t(i18n, "components.menu.ariaLabel")` ᶠ | Não | Accessibility label for nav. |
| `keyboardNavigation` | `boolean` | `true` | Não | Enables keyboard navigation. |
| `openSubmenuOnHover` | `boolean` | `false` | Não | In tiered style, opens submenu on hover when true; default opens on click. |
| `search` | `{ enabled: boolean; placeholder?: string }` | — (busca desligada: `search?.enabled ?? false`) | Não | Configuracao opcional de busca integrada. |
| `elevation` | `"none" \| "sm" \| "md"` | `"none"` | Não | Container elevation/shadow. |
| `border` | `boolean` | `true` | Não | Shows external menu border. |
| `className` | `string` | — | Não | Additional CSS classes on root. |
| `style` | `React.CSSProperties` | — | Não | Inline styles on root. |
| `userSectionClassName` | `string` | — | Não | Additional CSS classes in the user section (menu footer area). |
| `userSectionStyle` | `React.CSSProperties` | — | Não | Inline styles in the user section, useful to customize background color. |
| `footer` | `React.ReactNode` | — | Não | Menu footer content. |

### Eventos e callbacks
Ao ativar um item (clique, Enter/Espaço ou seleção na busca) — `activateNode`, Confirmado:
1. `onItemClick(node)` sempre (itens não `disabled`);
2. se o item tem `url`: `onNavigate(node)` se informado; **senão o menu executa `window.location.assign(url)`**;
3. se o item tem `onClick`: chama `node.onClick()` e depois `onAction(node)`;
4. em `drawer`/`hybrid`, com `url`, `closeOnNavigate` e não fixado (`pinned`), fecha o overlay.

Demais: `onExpandedIdsChange(ids)` (expansão de grupos; `mode="accordion"` mantém só um ramo por nível), `onCollapsedChange(value)`, `onOpenChange(value)` (drawer/hybrid), `onPinnedChange(value)`.

### Ref
Não aceita `ref`.

### Tipos auxiliares exportados
- `SgMenuNode`: `id: string`, `label: string`, `hint?: string` (tooltip), `url?: string`, `children?: SgMenuNode[]`, `disabled?: boolean`, `icon?: React.ReactNode`, `badge?: string | number`, `onClick?: () => void`.
- `SgMenuSelection`: `activeId?: string`, `activeUrl?: string` (item ativo por id ou pela primeira ocorrência da URL).
- `SgMenuBrand`: `title?: string`, `imageSrc?: string`, `image?: React.ReactNode`, `onClick?: () => void`.
- `SgMenuUser`: `name: string`, `subtitle?: string`, `avatarSrc?: string`, `avatar?: React.ReactNode`, `onClick?: () => void`.
- `SgMenuStyle` (valores de `menuVariantStyle`): `"panel" | "tiered" | "mega-horizontal" | "mega-vertical"` e os aliases equivalentes `"PanelMenu" | "Tiered" | "MegaMenuHorizontal" | "MegaMenuVertical"` (normalizados por `normalizeMenuStyle`).
- `SgMenuOrientationDirection` (tipo de `orientationDirection`) **não** é exportado pelo barrel; mapeia para zona inicial: `horizontal-left`→`top`, `horizontal-right`→`bottom`, `vertical-up`/`vertical-top`→`left`, `vertical-down`→`right`, padrão `left`.

### Children, slots e composição
- Sem `children`: estrutura vem de `menu`, `brand`, `user`, `userMenu` (renderizados como itens) e `footer`.
- `menuStyle`: `sidebar` (recolhível; largura `collapsedWidth`/`expandedWidth`), `drawer` (usa `SgExpandablePanel` em overlay, `role="dialog"`), `inline`, `hybrid` (rail recolhido + overlay; aberto quando `pinned`).
- Busca (`search.enabled`) usa `SgAutocomplete` internamente.
- Bloco de usuário usa `SgAvatar` e `SgCard`.
- **Persistência do colapso**: com `id` e `collapsed` não controlado, o estado é salvo em `sg-menu:<id>:collapsed` (via `useSgPersistence` se houver `SgEnvironmentProvider`, senão `localStorage`) — Confirmado.
- **Docking**: com `dockable`, dentro de `SgDockLayout`, e `menuStyle` diferente de `drawer`/`hybrid`, o menu é renderizado por portal na zona atribuída (`dockZone` ou derivada de `orientationDirection`); `draggable` mostra a alça para mover entre zonas.

### Contexto, providers e hooks
Consome `useSgDockLayout` (interno), `useHasSgEnvironmentProvider`/`useSgPersistence` e `useComponentsI18n`.

### Acessibilidade (Confirmado)
- Raiz `role="navigation"` com `aria-label` (padrão traduzido `components.menu.ariaLabel`; teste em `tests/buttons-menus.test.mjs`).
- Itens: `aria-current="page"` no item ativo, `aria-disabled`; botões de expandir com `aria-label` traduzido; botões de pin/arraste com `aria-label`.
- Teclado (`keyboardNavigation`, via `resolveMenuKeyboardAction`): **↓/↑** movem o foco; **→** abre o ramo ou entra no 1º filho; **←** fecha o ramo ou sobe ao pai; **Enter/Espaço** alternam ramos sem destino ou ativam o item (testes em `tests/menu-logic.test.mjs`).
- Drawer/hybrid usam `role="dialog"`.

---

## SgTreeView

Árvore com expansão, busca, checkboxes em cascata (com estado indeterminado), modo de confirmação, trilhas de colunas extras e API imperativa via ref. Fonte: `src/layout/SgTreeView.tsx` → `SgTreeView`, `sgTreeFromJson`, `sgTreeFromJsonWithChecked`.

### Import
```tsx
import {
  SgTreeView, sgTreeFromJson, sgTreeFromJsonWithChecked,
  type SgTreeViewProps, type SgTreeViewRef, type SgTreeNode, type SgTreeNodeJson,
  type SgTreeIconRegistry, type SgTreeConfirmBar, type SgSize, type SgDensity, type SgTone
} from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `nodes` | `SgTreeNode[]` | — | Sim | Lista hierarquica de nos exibidos pela arvore. |
| `className` | `string` | — | Não | Aulas extras sem container. |
| `style` | `React.CSSProperties` | — | Não | Inline style adicional no container. |
| `size` | `SgSize` = `"sm" \| "md" \| "lg"` | `"md"` | Não | Escala visual da arvore e dos itens. |
| `density` | `SgDensity` = `"compact" \| "comfortable" \| "normal"` | `"normal"` | Não | Ajustes visuais do componente. |
| `tone` | `SgTone` = `"default" \| "muted"` | `"default"` | Não | Ajustes visuais do componente. |
| `iconTone` | `"default" \| "primary"` | `"default"` | Não | Ajustes visuais do componente. |
| `checkable` | `boolean` | `false` | Não | Comportamento de seleção com checkboxes. |
| `checkMode` | `"live" \| "confirm"` | `"live"` | Não | Comportamento de seleção com checkboxes. |
| `confirmSelection` | `"all" \| "leafOnly"` | `"leafOnly"` | Não | Comportamento de seleção com checkboxes. |
| `checkedIds` | `string[]` | — (não controlado quando omitido) | Não | Nos marcados em cenarios de checkbox tree. |
| `defaultCheckedIds` | `string[]` | `?? []` ᶠ | Não | Estado de seleção. |
| `onCheckedChange` | `(ids: string[]) => void` | — | Não | Estado de seleção. |
| `checkableLabel` | `string` | — | Não | Cabecalho da coluna do checkbox principal -- so' e' desenhado quando `tracks` tambem esta' presente (e' o cabecalho de colunas como um todo que fica ambiguo com 2+ controles por linha, nao o checkbox sozinho). |
| `tracks` | `SgTreeTrack[]` | — | Não | Trilhas de selecao extras, uma por coluna de controle na linha -- ver SgTreeTrack. |
| `expandedIds` | `string[]` | — (não controlado quando omitido) | Não | Estado de expansão. |
| `defaultExpandedIds` | `string[]` | `?? []` ᶠ | Não | Estado de expansão. |
| `onExpandedChange` | `(ids: string[]) => void` | — | Não | Estado de expansão. |
| `onExpand` | `(node: SgTreeNode) => void` | — | Não | Eventos de interação. |
| `onCollapse` | `(node: SgTreeNode) => void` | — | Não | Eventos de interação. |
| `onLeafClick` | `(id: string) => void` | — | Não | Eventos de interação. |
| `branchLabelBehavior` | `"toggle" \| "none"` | `"toggle"` | Não | Clique no rótulo de um nó com filhos: `"toggle"` expande/recolhe; `"none"` não faz nada (só o caret alterna). *(Inferência)* |
| `searchable` | `boolean` | `false` | Não | Habilita campo interno de busca para filtrar nos. |
| `searchPlaceholder` | `string` | `?? '${t(i18n, "components.actions.search")}...'` ᶠ | Não | Busca e filtro da árvore. |
| `searchValue` | `string` | — (não controlado quando omitido) | Não | Busca e filtro da árvore. |
| `defaultSearchValue` | `string` | `?? ""` ᶠ | Não | Texto de busca inicial (não controlado). *(Inferência)* |
| `onSearchChange` | `(v: string) => void` | — | Não | Chamado a cada alteração do texto de busca. *(Inferência)* |
| `expandMatchesOnSearch` | `boolean` | `true` | Não | Durante a busca, expande automaticamente os ancestrais dos nós encontrados. *(Inferência)* |
| `confirmBar` | `SgTreeConfirmBar` | `?? false` ᶠ | Não | Configurações complementares da interface. |
| `emptyText` | `string` | `?? t(i18n, "components.tree.empty")` ᶠ | Não | Configurações complementares da interface. |
| `maxHeightClassName` | `string` | `"max-h-[60vh]"` | Não | Configurações complementares da interface. |

- Aceita `ref` (via `React.forwardRef`) e `key`.

### Eventos e callbacks
| Callback | Assinatura | Quando dispara (Confirmado) |
|---|---|---|
| `onCheckedChange` | `(ids: string[]) => void` | Mudança de marcação no modo `live` (cascata pai→filhos aplicada). |
| `onExpandedChange` | `(ids: string[]) => void` | Expandir/recolher, `expandAll`/`collapseAll`, expansão automática da busca. |
| `onExpand` / `onCollapse` | `(node: SgTreeNode) => void` | Ao expandir/recolher um nó pelo usuário. |
| `onLeafClick` | `(id: string) => void` | Clique no rótulo de um nó **sem filhos** (não `disabled`). |
| `onSearchChange` | `(v: string) => void` | Digitação na busca (`searchable`). |
| `confirmBar.onConfirm` | `(selectedIds: string[]) => void` | Botão confirmar (só com `checkable` + `checkMode="confirm"` + `confirmBar`); envia folhas (`confirmSelection="leafOnly"`) ou todos (`"all"`). |
| `confirmBar.onCancel` | `() => void` | Botão cancelar (`showCancel`). |

### Ref — `SgTreeViewRef` (forwardRef, `useImperativeHandle`, Confirmado)
| Método | Retorno | Efeito |
|---|---|---|
| `getCheckedIds()` | `string[]` | Ids marcados (pendentes, no modo `confirm`). |
| `getCheckedLeafIds()` | `string[]` | Só as folhas marcadas. |
| `setCheckedIds(ids)` | `void` | Define a marcação. |
| `getExpandedIds()` | `string[]` | Ids expandidos. |
| `setExpandedIds(ids)` | `void` | Define a expansão. |
| `expandAll()` / `collapseAll()` | `void` | Expande/recolhe tudo. |
| `clearChecked()` | `void` | Limpa a marcação. |

### Tipos auxiliares
- `SgTreeNode`: `id: string`, `label: string`, `icon?: React.ReactNode`, `children?: SgTreeNode[]`, `disabled?: boolean`, `meta?: unknown`.
- `SgTreeNodeJson`: igual, mas `icon?: string` (chave do registro) e `checked?: boolean`.
- `SgTreeIconRegistry = Record<string, React.ReactNode>`.
- `SgTreeConfirmBar = false | { label?: string; hint?: string; showCancel?: boolean; cancelLabel?: string; sticky?: boolean; disabledWhenEmpty?: boolean; resetAfterConfirm?: boolean; onConfirm: (selectedIds: string[]) => void; onCancel?: () => void }` — `disabledWhenEmpty` vale `true` salvo `false` explícito; `resetAfterConfirm` limpa a marcação após confirmar.
- `SgSize = "sm" | "md" | "lg"` · `SgDensity = "compact" | "normal" | "comfortable"` · `SgTone = "default" | "muted"`.
- **Trilhas (`tracks`)** — o tipo `SgTreeTrack` e variantes **não são exportados pelo barrel** (só existem em `SgTreeView.tsx`): base `{ id: string; label?: string; width?: string /* padrão 110px */ }` +
  - `SgTreeTrackBoolean`: `kind: "boolean"`, `checkedIds: string[]`, `onCheckedChange(ids)`, `disabled?(node)`, `ariaLabel?`, `adornment?(node)`;
  - `SgTreeTrackEnum`: `kind: "enum"`, `options: { value; label }[]`, `valueByNodeId: Record<string, string | undefined>`, `onChange(next)`, `disabled?(node)`, `ariaLabel?`, `placeholder?`, `mixedLabel?`, `adornment?(node)`;
  - `SgTreeTrackCustom`: `kind: "custom"`, `render(node)`.
  As trilhas `boolean`/`enum` são controladas de fora e têm cascata própria pai→filhos.

### Funções exportadas
- `sgTreeFromJson(json: SgTreeNodeJson[], iconRegistry?: SgTreeIconRegistry): SgTreeNode[]` — converte JSON (ícone por chave do registro).
- `sgTreeFromJsonWithChecked(json, iconRegistry?): { nodes: SgTreeNode[]; checkedIds: string[] }` — idem e coleta `checked: true`, incluindo todos os descendentes de ramos marcados.

### Children, slots e composição
Sem `children`. A área de rolagem usa `maxHeightClassName` (padrão `max-h-[60vh]`). `checkableLabel` só aparece quando há `tracks` (cabeçalho de colunas).

### Contexto, providers e hooks
`useComponentsI18n` (placeholder de busca, texto vazio, rótulos de expandir/recolher/limpar — teste em `tests/buttons-menus.test.mjs`).

### Acessibilidade
Botões de expandir com `aria-label` traduzido; checkboxes nativos com estado `indeterminate`; trilhas usam `ariaLabel`. **Não** há `role="tree"`/`treeitem` nem navegação por setas (Confirmado pela ausência no código).

---

## SgDockLayout

Provedor de layout com zonas de encaixe (`top`, `bottom`, `left`, `right`, `free`) para `SgToolBar`/`SgMenu`, com estado (zona, ordem, colapso) persistido. Fonte: `src/layout/SgDockLayout.tsx` → `SgDockLayout`.

### Import
```tsx
import { SgDockLayout, type SgDockLayoutProps, type SgDockLayoutState, type SgDockToolbarState, type SgDockZoneId } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador do layout usado para persistencia e coordenacao interna. |
| `className` | `string` | — | Não | Classes adicionais do container raiz. |
| `style` | `React.CSSProperties` | — | Não | Inline style adicional do container. |
| `children` | `React.ReactNode` | — | Sim | Zonas, toolbars e conteudo estrutural do layout. |
| `defaultState` | `SgDockLayoutState` | `?? EMPTY_STATE` ᶠ | Não | Estado inicial das toolbars e zonas do layout. |

### Eventos e callbacks
Nenhum callback público; mudanças de zona/ordem/colapso vão direto para o estado persistido.

### Ref
Não aceita `ref`.

### Tipos auxiliares exportados
- `SgDockZoneId = "top" | "bottom" | "left" | "right" | "free"`.
- `SgDockToolbarState = { id: string; zone: SgDockZoneId; collapsed?: boolean; orientation?: "horizontal" | "vertical"; order?: number }`.
- `SgDockLayoutState = { version: 1; toolbars: Record<string, SgDockToolbarState> }`.

### Children, slots e composição
Renderiza `<div className style>{children}</div>` dentro do contexto. Os filhos esperados são `SgDockZone` (registram seu elemento) e, dentro delas, `SgToolBar`/`SgMenu` (registram-se via `ensureToolbar`). O layout visual (grade) é responsabilidade do `className` do chamador — ver `SgDockScreen` para a grade pronta.

### Contexto, providers e hooks
- Fornece um contexto interno (`DockContext`), lido por `useSgDockLayout()` — **hook não exportado pelo barrel** (uso interno de `SgDockZone`, `SgToolBar`, `SgMenu`).
- Persistência: `useSgPersistentState({ baseKey: "dock-layout:<id>", defaultValue: defaultState ?? { version: 1, toolbars: {} } })` — ver [[SeedGrid/SeedGrid-components/providers/API|providers › useSgPersistentState]] (Confirmado). Toolbars novas só são registradas após hidratação.

### Acessibilidade
Sem ARIA próprio.

---

## SgDockZone

Região nomeada de um `SgDockLayout`. Fonte: `src/layout/SgDockZone.tsx` → `SgDockZone`.

### Import
```tsx
import { SgDockZone, type SgDockZoneProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `zone` | `SgDockZoneId` = `"top" \| "right" \| "bottom" \| "left" \| "free"` | — | Sim | Identificador da zona dentro do dock layout. |
| `className` | `string` | — (sem classe, aplica layout padrão por zona) | Não | Classes adicionais da zona. |
| `style` | `React.CSSProperties` | — | Não | Inline style adicional do container. |
| `children` | `React.ReactNode` | — | Não | Conteudo renderizado dentro da zona. |

### Eventos e callbacks
Nenhum.

### Ref
Não aceita `ref`.

### Children, slots e composição
- Registra o próprio `<div data-sg-dock-zone=<zone>>` no layout (`registerZone`). Fora de `SgDockLayout` apenas renderiza o `div`.
- Sem `className`, aplica posicionamento de grade padrão por zona: `top` `col-span-3 row-start-1`, `bottom` `col-span-3 row-start-3`, `left` `col-start-1 row-start-2`, `right` `col-start-3 row-start-2`, `free` `col-start-2 row-start-2` (pressupõe grade 3×3, como a do `SgDockScreen`). Com `className`, nada disso é aplicado.
- Durante o arraste de uma toolbar, mostra pré-visualização tracejada e slots de inserção (`><`); fora das zonas laterais/topo mostra o texto traduzido `components.dock.dropHere`.

### Acessibilidade
Indicadores de soltura são `aria-hidden`; arrastar é só por ponteiro.

---

## SgDockScreen

Atalho: `SgScreen` + `SgDockLayout` com grade 3×3 pronta (`grid-cols-[12rem_1fr_12rem] grid-rows-[auto_1fr_auto]`). Fonte: `src/layout/SgDockScreen.tsx` → `SgDockScreen`.

### Import
```tsx
import { SgDockScreen, type SgDockScreenProps } from "@seedgrid/fe-components";
```

### Props
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `width` | `number \| string` | — | Não | Dimensoes da tela base. |
| `height` | `number \| string` | — | Não | Dimensoes da tela base. |
| `padding` | `number \| string` | — ᵇ | Não | Preenchimento interno do SgScreen. |
| `fullscreen` | `boolean` | `true` ᵇ | Não | Quando ativo, a screen ocupa a viewport inteira. |
| `id` | `string` | — | Sim | Identificador do dock layout interno. |
| `screenId` | `string` | — | Não | ID opcional do elemento raiz de screen. |
| `defaultState` | `SgDockLayoutState` | — | Não | Estado inicial das toolbars e zonas internas. |
| `layoutClassName` | `string` | — | Não | Classes adicionais aplicadas ao SgDockLayout interno, somadas à grade padrão `grid-cols-[12rem_1fr_12rem] grid-rows-[auto_1fr_auto]`. |
| `children` | `React.ReactNode` | — | Não | Zonas e conteudo estrutural do dock screen. |

- Props declaradas em `SgScreenProps` (contrato reutilizado): `width`, `height`, `padding`, `fullscreen`.
- **Atributos DOM herdados**: o tipo é `Omit<SgScreenProps, "children" \| "id"> & { ... }`; acrescenta 276 props de `@types/react` (`HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Eventos e callbacks / Ref
Nenhum callback próprio; não aceita `ref`. As demais props (inclusive atributos DOM) vão para o `SgScreen` (`{...screenProps}`); `screenId` vira o `id` do `SgScreen`, e `id` vai para o `SgDockLayout` (chave de persistência `dock-layout:<id>`).

### Children, slots e composição
Filhos esperados: `SgDockZone` (sem `className`, para aproveitar o posicionamento padrão na grade).

### Acessibilidade
Sem ARIA próprio.

---

## SgToolBar

Barra de ferramentas colapsável, com orientação/direção, arraste entre zonas de um `SgDockLayout` (ou arraste livre com posição persistida). Fonte: `src/layout/SgToolBar.tsx` → `SgToolBar`, `SgToolbarIconButton` (lógica pura em `toolbar-logic.ts` e `drag-position.ts`).

### Import
```tsx
import {
  SgToolBar, SgToolbarIconButton,
  type SgToolBarProps, type SgToolBarOrientation, type SgToolBarOrientationDirection,
  type SgToolBarSeverity, type SgToolBarSize, type SgToolbarIconButtonProps
} from "@seedgrid/fe-components";
```

### Props — `SgToolBar`
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador estavel da toolbar. |
| `title` | `React.ReactNode` | — | Não | Titulo opcional exibido na barra. |
| `orientationDirection` | `SgToolBarOrientationDirection` = `"horizontal-left" \| "horizontal-right" \| "vertical-up" \| "vertical-down"` | `?? "vertical-down"` ᶠ | Não | Direcao e orientacao da toolbar. |
| `buttonsPerDirection` | `number` | — | Não | Quantidade de botoes distribuidos por direcao. |
| `bgColorTitle` | `string` | — | Não | Cor de fundo (CSS) da barra de título/colapso. *(Inferência)* |
| `bgColor` | `string` | — | Não | Cor de fundo (CSS) do contêiner da toolbar. *(Inferência)* |
| `size` | `SgToolBarSize` | — | Não | Largura (`w`) e altura (`h`) aplicadas ao estilo do contêiner. *(Inferência)* |
| `className` | `string` | — | Não | Classes adicionais do contêiner raiz da toolbar. *(Inferência)* |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do contêiner raiz (aplicado por último, sobrescreve posição/cores calculadas). *(Inferência)* |
| `dockZone` | `"top" \| "bottom" \| "left" \| "right" \| "free"` | `?? "free"` ᶠ | Não | Zona de encaixe da toolbar. |
| `draggable` | `boolean` | `false` | Não | Permite arrastar a toolbar. |
| `freeDrag` | `boolean` | `false` | Não | Com `draggable`, arrasta livremente (posição absoluta/fixa) em vez de reposicionar entre zonas do dock; a posição é persistida na chave `sg-toolbar-pos:<id>`. *(Inferência)* |
| `defaultPosition` | `{ x: number; y: number }` | — | Não | Posição inicial `{x, y}` usada no modo `freeDrag` (ignorada sem `freeDrag`). *(Inferência)* |
| `collapsible` | `boolean` | `true` | Não | Permite recolher a toolbar. |
| `collapsed` | `boolean` | — (dentro de `SgDockLayout`, usa o estado persistido do layout) | Não | Estado recolhido controlado. *(Inferência)* |
| `defaultCollapsed` | `boolean` | `false` | Não | Estado recolhido inicial (não controlado); também semeia o estado do toolbar no `SgDockLayout`. *(Inferência)* |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Não | Chamado ao alternar o colapso com o novo valor. *(Inferência)* |
| `children` | `React.ReactNode` | — | Não | Botoes e elementos de acao da toolbar. |

### Props — `SgToolbarIconButton`
| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `icon` | `React.ReactNode \| string` | — | Não | Icone principal exibido no botao. |
| `label` | `string` | — | Não | Rotulo textual da acao. |
| `showLabel` | `boolean` | `true` | Não | Exibe o rotulo junto do icone quando suportado pela toolbar. |
| `hint` | `string` | — | Não | Texto auxiliar usado como dica contextual. |
| `loading` | `boolean` | `false` | Não | Indica processamento em andamento. |
| `severity` | `SgToolBarSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger" \| "plain"` | `"plain"` | Não | Tom visual do botao de toolbar. |
| `disabled` | `boolean` | — | Não | Desabilita interacao. |
| `onClick` | `() => void \| Promise<void>` | — | Não | Callback executado ao clicar no item. |
| `className` | `string` | — | Não | Classes adicionais do botão. *(Inferência)* |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do botão. *(Inferência)* |
| `hideLabel` | `boolean` | — | Não | Oculta o rótulo visível e o tooltip de `hint`. Não faz parte de `SgToolbarIconButtonProps`: vem da interseção `& { hideLabel?: boolean }` na assinatura do componente. *(Inferência)* |

- Tipo de props declarado inline na assinatura de `SgToolbarIconButton` (não há tipo `SgToolbarIconButtonProps` exportado).

### Eventos e callbacks
- `SgToolBar.onCollapsedChange(collapsed)` — ao clicar no botão de colapso; dentro de dock também grava `collapsed` no estado do layout (Confirmado).
- `SgToolbarIconButton.onClick(): void | Promise<void>` — se retornar Promise, o botão fica em loading (`aria-busy`) até ela terminar; cliques são ignorados com `disabled` ou em loading (Confirmado).

### Ref
Nenhum dos dois aceita `ref`.

### Tipos auxiliares exportados
`SgToolBarOrientation = "horizontal" | "vertical"` · `SgToolBarOrientationDirection = "vertical-up" | "vertical-down" | "horizontal-left" | "horizontal-right"` · `SgToolBarSeverity = "primary" | "secondary" | "success" | "info" | "warning" | "help" | "danger" | "plain"` · `SgToolBarSize = { w?: number; h?: number }`.

### Children, slots e composição
- `children` (normalmente `SgToolbarIconButton`) ficam no contêiner de conteúdo; `buttonsPerDirection > 0` troca o flex por grade com N botões por linha (horizontal) ou por coluna (vertical).
- `SgToolbarIconButton` lê a orientação da toolbar por um contexto interno (posição do tooltip de `hint`, renderizado por portal). `icon` string é exibido como texto.
- **Dentro de `SgDockLayout`**: a toolbar se registra (`ensureToolbar`) e é renderizada por portal no elemento da zona atribuída (persistida) ou `dockZone`; em zonas `top`/`bottom` a orientação é forçada para horizontal e em `left`/`right` para vertical (`resolveToolbarDockOrientationDirection`). Com `draggable` (sem `freeDrag`) pode ser solta em outra zona/posição.
- **`freeDrag`**: arraste livre; posição salva em `sg-toolbar-pos:<id>` (via `useSgPersistence` com `SgEnvironmentProvider`, senão `localStorage`). Teste DOM em `tests/buttons-menus-dom.test.mjs`.
- Atenção (Confirmado em `toolbar-logic.ts`): `"horizontal-right"` resolve para `direction: "left"` (conteúdo abre à esquerda do título) e `"horizontal-left"` para `direction: "right"`.

### Contexto, providers e hooks
Consome `useSgDockLayout` (interno), `useHasSgEnvironmentProvider`/`useSgPersistence`, `useComponentsI18n`.

### Acessibilidade (Confirmado)
Botão de colapso com `aria-label` traduzido (`components.toolbar.toggle`; teste em `tests/buttons-menus.test.mjs`); `SgToolbarIconButton` com `aria-label = hint ?? label ?? (ícone texto)` e `aria-busy` em loading. Não há `role="toolbar"` nem navegação por setas entre botões.

---

## Funções utilitárias exportadas

Funções puras exportadas pelo barrel (usadas internamente pelos componentes e cobertas por testes). Assinaturas obtidas pelo TS checker.

### `src/layout/drag-position.ts`
| Função | Assinatura | O que faz |
|---|---|---|
| `parseStoredPanelDragPosition` | `(raw: unknown) => { x: number; y: number } \| null` | Aceita objeto ou string JSON; retorna `{x,y}` se ambos forem números finitos. |
| `buildToolbarStorageKey` | `(id: string) => string` | `sg-toolbar-pos:<id>`. |
| `buildDockMenuStorageKey` | `(dragId?: string \| null, isAbsolutePosition?: boolean) => string \| null` | `sg-dockmenu-pos:<dragId>:parent\|viewport`; `null` sem `dragId` (usado pelo SgDockMenu — ver [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|navegação e overlay]]). |

### `src/layout/toolbar-logic.ts`
| Função | Assinatura completa |
|---|---|
| `resolveToolbarOrientationDirection` | `(orientationDirection: SgToolBarOrientationDirection) => { orientation: SgToolBarOrientation; direction: "left" \| "right" \| "up" \| "down"; }` |
| `resolveToolbarDockOrientationDirection` | `(orientationDirection: SgToolBarOrientationDirection, inDock: boolean, zone: "left" \| "right" \| "top" \| "bottom" \| "free") => SgToolBarOrientationDirection` |
| `buildToolbarLayoutState` | `(args: { orientationDirection: SgToolBarOrientationDirection; inDock: boolean; zone: "left" \| "right" \| "top" \| "bottom" \| "free"; freeDrag: boolean; dragHoverZone: SgDockZoneId \| null; effectiveZone: "left" \| "right" \| "top" \| "bottom" \| "free"; showContent: boolean; }) => { zoneForOrientation: "left" \| "right" \| "top" \| "bottom" \| "free"; resolvedOrientationDirection: SgToolBarOrientationDirection; orientation: SgToolBarOrientation; direction: "left" \| "right" \| "up" \| "down"; openUp: boolean; openLeft: boolean; showLeadingCollapseButton: boolean; collapseIconDirection: "left" \| "right" \| "up" \| "down"; }` |

### `src/layout/menu-logic.ts`
Tipos exportados pelo barrel: `MenuLogicNode = { id: string; label?: string; children?: MenuLogicNode[]; url?: string; onClick?: () => void }`, `MenuVisibleNode<T> = { node: T; depth: number; parentId?: string }`, `MenuKeyboardAction = { type: "focus" \| "toggle" \| "activate"; id: string } \| { type: "noop" }`. Outros tipos usados nas assinaturas (`MenuMaps`, `MenuActiveSets`, `MenuSearchEntry`, `MenuAutocompleteItem`, `MenuHintPlacement`) existem só no arquivo (não exportados pelo barrel). Formas: `MenuMaps<T> = { parentById: Map<string, string>; nodeById: Map<string, T>; childrenByParent: Map<string, string[]>; firstByUrl: Map<string, string> }`; `MenuActiveSets = { exact: Set<string>; branch: Set<string> }`; `MenuSearchEntry = { id: string; label: string; path: string; group: string }`; `MenuAutocompleteItem = { id: string; label: string; value: string; group: string; data: { nodeId: string; path: string } }`; `MenuHintPlacement = "top" | "right"`.

| Função | Assinatura completa |
|---|---|
| `buildMenuMaps` | `<T extends MenuLogicNode>(menu: T[], rootParentId?: string) => MenuMaps<T>` |
| `collectParentChain` | `(parentById: Map<string, string>, id: string, rootParentId?: string) => string[]` |
| `computeActiveSets` | `<T extends MenuLogicNode>(nodes: T[], activeId: string \| undefined, activeUrl: string \| undefined) => MenuActiveSets` |
| `resolveEffectiveActiveId` | `(args: { activeId?: string \| undefined; activeUrl?: string \| undefined; localActiveId?: string \| undefined; firstByUrl: Map<string, string>; }) => string \| undefined` |
| `mergeExpandedIdsForActivePath` | `(currentIds: string[], parentChain: string[]) => string[]` |
| `resolveTieredActiveState` | `<T extends MenuLogicNode>(args: { effectiveActiveId?: string \| undefined; maps: MenuMaps<T>; menu: T[]; rootParentId?: string \| undefined; }) => { tieredPath: string[]; megaActiveId?: string \| undefined; }` |
| `resolveMenuLayoutState` | `(args: { dockMode: boolean; effectiveDockZone: string \| null; orientationDirection?: "horizontal-left" \| "horizontal-right" \| "vertical-up" \| "vertical-top" \| "vertical-down" \| undefined; position: "left" \| "right"; horizontalDockAlign: "left" \| "right" \| null; isCollapsed: boolean; menuStyle: "sidebar" \| "drawer" \| "inline" \| "hybrid"; effectiveMenuStyle: "panel" \| "tiered" \| "mega-horizontal" \| "mega-vertical"; pinnedState: boolean; expandedWidthCss: string; collapsedWidthCss: string; }) => { resolvedPosition: "left" \| "right"; isHorizontalDockZone: boolean; isVerticalDockZone: boolean; tieredOpenToLeft: boolean; isMegaMenuStyle: boolean; dockAlign: "start" \| "end" \| null; sidebarWidthCss: string; }` |
| `resolveMenuNodeActionIntent` | `(args: { variant: "panel" \| "flat"; hasChildren: boolean; hasActionTarget: boolean; isCollapsed?: boolean \| undefined; }) => "toggle" \| "activate" \| "noop"` |
| `resolveExpandedIdsToggle` | `(args: { currentIds: string[]; nodeId: string; mode: "accordion" \| "multiple"; parentById: Map<string, string>; childrenByParent: Map<string, string[]>; rootParentId?: string \| undefined; }) => string[]` |
| `resolveMenuHintPosition` | `(args: { isConnected: boolean; rect: { left: number; right: number; top: number; width: number; height: number; }; placement: MenuHintPlacement; }) => { x: number; y: number; } \| null` |
| `resolveHorizontalDockAlign` | `(clientX: number, zoneRect: { left: number; width: number; }) => "left" \| "right"` |
| `resolveTieredHoverPath` | `(currentPath: string[], depth: number, nodeId: string, hasChildren: boolean) => string[]` |
| `resolveTieredHoverIntent` | `(args: { currentPath: string[]; depth: number; nodeId: string; hasChildren: boolean; openSubmenuOnHover: boolean; }) => string[] \| undefined` |
| `resolveTieredClickState` | `(currentPath: string[], depth: number, nodeId: string) => { nextPath: string[]; isOpenAtDepth: boolean; }` |
| `resolveMenuSearchSelectionState` | `(args: { currentExpandedIds: string[]; parentChain: string[]; rootToParent: string[]; nodeId: string; hasChildren: boolean; hasActionTarget: boolean; }) => { expandedIds: string[]; tieredPath: string[]; megaActiveId?: string \| undefined; localActiveId?: string \| undefined; shouldActivateNode: boolean; }` |
| `resolveTieredNodeClickIntent` | `(args: { currentPath: string[]; depth: number; nodeId: string; hasChildren: boolean; hasActionTarget: boolean; }) => { nextPath: string[]; shouldActivateNode: boolean; isOpenAtDepth: boolean; }` |
| `resolveMegaMenuActiveNode` | `<T extends MenuLogicNode>(items: T[], megaActiveId?: string \| undefined) => T \| undefined` |
| `resolveMegaMenuInteraction` | `(args: { nodeId: string; hasChildren: boolean; }) => { nextMegaActiveId?: string \| undefined; shouldActivateNode: boolean; }` |
| `resolveMegaMenuHoverActiveId` | `(args: { nodeId: string; hasChildren: boolean; }) => string \| undefined` |
| `resolveMenuAutocompleteItems` | `(searchEntries: MenuSearchEntry[], query: string, limit?: number) => MenuAutocompleteItem[]` |
| `filterMenuNodes` | `<T extends MenuLogicNode>(nodes: T[], query: string) => T[]` |
| `collectMenuSearchEntries` | `<T extends MenuLogicNode>(nodes: T[], trail?: string[], out?: MenuSearchEntry[]) => MenuSearchEntry[]` |
| `flattenVisibleNodes` | `<T extends MenuLogicNode>(nodes: T[], expandedSet: Set<string>, collapsed: boolean, forceExpand: boolean, depth?: number, parentId?: string, out?: MenuVisibleNode<T>[]) => MenuVisibleNode<T>[]` |
| `resolveMenuKeyboardAction` | `(args: { key: string; visibleNodes: MenuVisibleNode<MenuLogicNode>[]; focusedId?: string \| undefined; expandedIds: Set<string>; hasSearch: boolean; isCollapsed: boolean; parentById: Map<string, string>; rootParentId: string; }) => MenuKeyboardAction` |

Comportamentos verificados em `tests/menu-logic.test.mjs` (ex.: `filterMenuNodes` mantém ramos/ancestrais que casam e devolve a mesma referência para consulta vazia; `resolveMenuKeyboardAction` vira no-op em ramos recolhidos/busca).

---

## Itens internos (não exportados)

| Item | Onde | Observação |
|---|---|---|
| `sgDocking.tsx` (`renderDockContent`, `cn`, `toCssSpace`, `toCssPercent`, `getDefaultContent*`, tipos `SgDock*`) | `src/layout/sgDocking.tsx` | Motor de docking de `SgPanel`/`SgScreen`. |
| `useSgDockLayout`, `SgDockDropIndicator` | `src/layout/SgDockLayout.tsx` | Contexto do dock (exportados só do arquivo). |
| `SgTreeTrack*` | `src/layout/SgTreeView.tsx` | Tipos da prop `tracks`, não exportados pelo barrel. |
| `SgMenuOrientationDirection` | `src/layout/SgMenu.tsx` | Tipo de `SgMenu.orientationDirection`, não exportado pelo barrel. |
| `SgPanelContentDirection/Justify/Align` | `src/layout/SgPanel.tsx` | Não exportados pelo barrel. |
