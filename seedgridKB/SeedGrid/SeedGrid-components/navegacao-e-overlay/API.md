---
tags: [seedgrid, front, component, navegacao-e-overlay]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/menus, front/seedgrid-fe-components/packages/seedgrid-fe-components/src/overlay, front/seedgrid-fe-components/packages/seedgrid-fe-components/src/wizard
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Navegação, overlay e wizard (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API — navegação e overlay — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API|API — Navegação, overlay e wizard (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Visao-geral|Navegação e overlay]] · Exemplos: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Exemplos|Exemplos]] · i18n/estilos: [[SeedGrid/SeedGrid-components/fundamentos/API|Fundamentos › API]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Nenhum componente deste grupo usa `React.forwardRef`: **nenhum aceita `ref`** (Confirmado — todos são `function` simples). Nenhum repassa atributos HTML arbitrários (os tipos não estendem `React.HTMLAttributes`).

---

## SgDockMenu

Dock flutuante de ações (ícone + rótulo em tooltip), com badges, efeito *magnify*, 8 posições ancoradas, arraste opcional e persistência da posição. Fonte: `src/menus/SgDockMenu.tsx` → `SgDockMenu`.

### Import

```tsx
import { SgDockMenu, type SgDockMenuProps, type SgDockMenuItem, type SgDockMenuPosition, type SgDockMenuOrientation } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Unique identifier for the dock |
| `items` | `SgDockMenuItem[]` | — | Sim | Items to display in the dock |
| `position` | `SgDockMenuPosition` = `"left-top" \| "left-center" \| "left-bottom" \| "center-top" \| "center-bottom" \| "right-top" \| "right-center" \| "right-bottom"` | `"center-bottom"` | Não | Position of the dock |
| `enableDragDrop` | `boolean` | `false` | Não | Enable drag and drop repositioning |
| `dragId` | `string` | — | Não | ID for persisting drag position |
| `offset` | `{ x?: number; y?: number }` | — | Não | Deslocamento em px somado à posição fixa (afasta da borda ancorada: `right`/`bottom` são reduzidos, `left`/`top` aumentados). Base da borda: 24px (`DOCK_EDGE`). *(Inferência)* |
| `className` | `string` | `""` | Não | Custom class name for container |
| `itemClassName` | `string` | `""` | Não | Custom class name for items |
| `zIndex` | `number` | `50` | Não | Z-index |
| `itemSize` | `number` | `48` | Não | Item size in pixels |
| `gap` | `number` | `16` | Não | Gap between items in pixels |
| `backgroundColor` | `string` | `"rgb(var(--sg-surface, 248 250 252) / 0.9)"` | Não | Background color |
| `showLabels` | `boolean` | `true` | Não | Show labels on hover |
| `magnify` | `boolean` | `true` | Não | Magnification effect on hover |
| `magnifyScale` | `number` | `1.5` | Não | Magnification scale |
| `borderRadius` | `number` | `16` | Não | Border radius |
| `elevation` | `"none" \| "sm" \| "md" \| "lg"` | `"lg"` | Não | Shadow elevation |
| `style` | `React.CSSProperties` | — | Não | Custom style |

### Eventos e callbacks

- Não há callback no nível do componente. Cada item tem `onClick?: () => void`, chamado no clique do botão do item, **exceto** se `item.disabled` ou se o ponteiro acabou de arrastar o dock (> 3px de movimento). **Confirmado** (`handleItemClick`).
- Arraste (`enableDragDrop`): botão esquerdo do ponteiro inicia; a posição é limitada à viewport (ou ao `offsetParent` quando `style.position === "absolute"`) e salva no `pointerup` se houver `dragId`.
- Menu de contexto (clique direito): só abre quando `enableDragDrop && dragId` e já existe posição salva/arrastada (`buildDockMenuContextMenuState`). Mostra um diálogo de confirmação "resetar posição" (textos i18n `components.dock.resetPosition`/`resetConfirm`, `components.actions.cancel`/`confirm`); confirmar apaga a posição persistida e volta à posição ancorada. **Confirmado**.

### Ref

Não aceita `ref`.

### Children, slots e composição

Não recebe `children`; o conteúdo vem de `items`. Ícones são `ReactNode` livres (o showcase usa `lucide-react`). Posição: `position: fixed` por padrão; passe `style={{ position: "absolute" }}` para ancorar dentro de um container `relative` (o arraste passa a ser limitado ao pai e a chave de persistência termina em `:parent`).

### Contexto, providers e hooks

- Consome `useComponentsI18n()` (textos do diálogo de reset).
- Consome `useSgPersistence()` e o hook interno `useHasSgEnvironmentProvider()`: dentro de `SgEnvironmentProvider` a posição é salva via estratégia de persistência do ambiente; fora dele, em `localStorage`. Valor salvo inválido é descartado e apagado (`parseStoredPanelDragPosition`). Ver [[SeedGrid/SeedGrid-components/providers/API|Providers]].

### Acessibilidade

- Cada item é `<button type="button">` com `aria-label={item.label}`, `title={item.label}` e `disabled={item.disabled}` (coberto por `tests/buttons-menus.test.mjs`). **Confirmado**.
- O container não tem `role` (ex.: `toolbar`/`menu`) nem navegação por setas; o diálogo de reset não tem `role="dialog"` nem tratamento de `Esc` (fecha clicando no fundo). **Confirmado** (ausência no código).

### Tipos auxiliares exportados

`SgDockMenuItem`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` | Sim | Identificador único (chave da lista) |
| `icon` | `React.ReactNode` | Sim | Ícone exibido |
| `label` | `string` | Sim | Rótulo/tooltip e `aria-label` |
| `onClick` | `() => void` | Não | Handler de clique |
| `disabled` | `boolean` | Não | Desabilita o item (opacidade 0.5, cursor `not-allowed`) |
| `badge` | `string \| number` | Não | Conteúdo da bolha de badge |
| `className` | `string` | Não | Classe extra do item |

`SgDockMenuPosition` = `"left-top" | "left-center" | "left-bottom" | "center-top" | "center-bottom" | "right-top" | "right-center" | "right-bottom"`. `SgDockMenuOrientation` = `"horizontal" | "vertical"` — derivada da posição: `left-center`/`right-center` → vertical; as demais (inclusive cantos) → horizontal.

### Helpers puros exportados (`src/menus/dock-menu-logic.ts`, `src/layout/drag-position.ts`)

| Função | Assinatura | Retorno / comportamento |
|---|---|---|
| `resolveDockMenuOrientation` | `(position: SgDockMenuPosition) => SgDockMenuOrientation` | Regra acima |
| `resolveDockMenuLiftDirection` | `(position, orientation) => number` | `-1`/`1`: horizontal sobe se `position` contém `bottom`; vertical vai para a direita se começa com `left` |
| `buildDockMenuLayout` | `(position) => { orientation; liftDirection }` | Combina as duas anteriores |
| `buildDockMenuItemMotion` | `(args: { index; hoveredIndex: number \| null; magnify; magnifyScale; itemSize; gap; orientation; liftDirection }) => { scale; translateX; translateY; transformOrigin; zIndex }` | Curva de ampliação (influência até 3 itens de distância), elevação e espalhamento dos vizinhos |
| `buildDockMenuLabelStyle` | `(orientation, position) => React.CSSProperties` | Posição do tooltip (acima no horizontal; à direita/esquerda no vertical) |
| `buildDockMenuContainerStyle` | `(args: { position; zIndex; enableDragDrop; dragPos: {x;y} \| null; offset?: {x?;y?} }) => { style: React.CSSProperties; transform: string }` | `position: fixed` + coordenadas da posição (borda de 24px), sobreposição pela posição arrastada e aplicação de `offset` |
| `buildDockMenuContextMenuState` | `(args: { enableDragDrop: boolean; dragId?: string; hasStoredPosition: boolean }) => { canOpenContextMenu; canResetPosition }` | Ambos `true` só com arraste + `dragId` + posição salva |
| `buildDockMenuStorageKey` | `(dragId?: string \| null, isAbsolutePosition = false) => string \| null` | `null` sem `dragId`; senão `sg-dockmenu-pos:<dragId>:parent\|viewport` |

---

## SgPopup

Overlay contextual **não modal** ancorado a um elemento, com título/subtítulo opcionais, conteúdo livre e/ou lista de ações. Fonte: `src/overlay/SgPopup.tsx` → `SgPopup`.

### Import

```tsx
import { SgPopup, type SgPopupProps, type SgPopupAction, type SgPopupPlacement, type SgPopupPreferPlacement, type SgPopupAlign, type SgPopupSeverity } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `title` | `string` | — | Não | Titulo opcional do popup. |
| `subtitle` | `string` | — | Não | Subtitulo opcional do popup. |
| `open` | `boolean` | — (sem `open` o componente é não controlado) | Não | Controla a visibilidade do popup em modo controlado. |
| `onOpenChange` | `(open: boolean) => void` | — | Não | Callback disparado quando o estado de abertura muda. |
| `defaultOpen` | `boolean` | `false` | Não | Controle de visibilidade. |
| `onOpen` | `() => void` | — | Não | Eventos de ciclo de abertura. |
| `onClose` | `() => void` | — | Não | Eventos de ciclo de abertura. |
| `anchorRef` | `React.RefObject<HTMLElement>` | — | Sim | Elemento ancora usado para posicionar o popup. |
| `placement` | `SgPopupPlacement` = `"top" \| "right" \| "bottom" \| "left" \| "auto"` | `"auto"` | Não | Posicionamento principal do popup em relacao a ancora. |
| `preferPlacement` | `SgPopupPreferPlacement` = `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Não | Posicionamento e alinhamento do popup. |
| `align` | `SgPopupAlign` = `"start" \| "center" \| "end"` | `"start"` | Não | Posicionamento e alinhamento do popup. |
| `offset` | `number` | `8` | Não | Distancia e margem de viewport. |
| `padding` | `number` | `8` | Não | Distancia e margem de viewport. |
| `closeOnOutsideClick` | `boolean` | `true` | Não | Fecha o popup quando o usuario clica fora dele. |
| `closeOnEscape` | `boolean` | `true` | Não | Regras de fechamento. |
| `className` | `string` | — | Não | Customizacoes visuais. |
| `style` | `React.CSSProperties` | — | Não | Customizacoes visuais. |
| `zIndex` | `number` | `60` | Não | Customizacoes visuais. |
| `minWidth` | `number \| string` | `180` | Não | Customizacoes visuais. |
| `actions` | `SgPopupAction[]` | — | Não | Lista de acoes contextuais renderizadas no popup. |
| `children` | `React.ReactNode` | — | Não | Conteudo textual e corpo customizado. |

### Eventos e callbacks

| Callback | Assinatura | Quando dispara |
|---|---|---|
| `onOpenChange` | `(open: boolean) => void` | Sempre que o popup pede para mudar de estado: clique fora (se `closeOnOutsideClick`), `Esc` (se `closeOnEscape`), clique numa ação com `closeOnClick !== false` |
| `onOpen` | `() => void` | Efeito: transição de fechado → aberto (inclusive em modo controlado) |
| `onClose` | `() => void` | Efeito: transição de aberto → fechado |
| `SgPopupAction.onClick` | `() => void` | Clique na ação; depois fecha se `closeOnClick ?? true` |

Modo controlado quando `typeof open === "boolean"`; senão usa estado interno iniciado com `defaultOpen`. Não há gatilho interno para abrir — o consumidor abre (ex.: `onClick` do botão âncora). **Confirmado**.

### Posicionamento

`placement="auto"` escolhe o lado com espaço a partir de `preferPlacement`; `align` alinha ao início/centro/fim da âncora; `offset` é a distância da âncora e `padding` a margem mínima da viewport. A posição é recalculada em `resize` e `scroll` (captura) enquanto aberto. Antes da primeira medição o painel fica em `top/left = -9999`. **Confirmado** (`computePosition`, `recompute`).

### Ref

Não aceita `ref`. A âncora é passada por `anchorRef: React.RefObject<HTMLElement>` (obrigatória).

### Children, slots e composição

- `children` → bloco com `p-2` abaixo do cabeçalho.
- `actions` → lista de botões após o conteúdo (separada por borda se houver `children`).
- `title` → faixa de cabeçalho (`bg-primary`); `subtitle` → linha abaixo.
- Renderiza em portal no `document.body` (`position: fixed`, `zIndex` padrão 60). Não renderiza nada quando fechado.

### Contexto, providers e hooks

Consome `useComponentsI18n()` (aria-label padrão `components.popup.ariaLabel`).

### Acessibilidade

- Painel com `role="dialog"`, `aria-modal="false"`, `aria-label = title ?? i18n("components.popup.ariaLabel")`. **Confirmado**.
- `Esc` fecha (listener em `document`). Não há gestão de foco (não move o foco para o popup nem o devolve à âncora). Ações são `<button type="button">` com `title={hint}` e `disabled`. **Confirmado**.

### Tipos auxiliares exportados

`SgPopupAction`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | `string` | Sim | Texto da ação |
| `icon` | `React.ReactNode` | Não | Ícone antes do texto |
| `hint` | `string` | Não | Tooltip nativo (`title`) |
| `severity` | `SgPopupSeverity` | Não | Cor de fundo da ação; sem valor usa estilo neutro transparente |
| `disabled` | `boolean` | Não | Desabilita o botão |
| `closeOnClick` | `boolean` | Não | Fecha após o clique (padrão efetivo `true`) |
| `onClick` | `() => void` | Não | Handler |

`SgPopupSeverity` = `"primary" | "secondary" | "success" | "info" | "warning" | "help" | "danger" | "plain"`. `SgPopupPlacement` = `"auto" | "top" | "right" | "bottom" | "left"`; `SgPopupPreferPlacement` = mesmo sem `"auto"`; `SgPopupAlign` = `"start" | "center" | "end"`.

---

## SgDialog

Modal com cabeçalho (leading/título/subtítulo/trailing/fechar), corpo rolável e rodapé; severidade visual, animação, auto-fechamento, gestão de foco e bloqueio de scroll. Fonte: `src/overlay/SgDialog.tsx` → `SgDialog`.

### Import

```tsx
import { SgDialog, type SgDialogProps, type SgDialogSize, type SgDialogSeverity, type SgDialogAnimation } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `open` | `boolean` | — (sem `open` o componente é não controlado) | Não | Controla a abertura do dialog em modo controlado. |
| `onOpenChange` | `(open: boolean) => void` | — | Não | Callback disparado quando o estado de abertura muda. |
| `defaultOpen` | `boolean` | `false` | Não | Controle de abertura. |
| `title` | `React.ReactNode` | — | Não | Titulo principal do dialog. |
| `subtitle` | `React.ReactNode` | — | Não | Subtitulo complementar do dialog. |
| `leading` | `React.ReactNode` | — | Não | Conteúdo renderizado à esquerda do título no cabeçalho (ex.: ícone/avatar). *(Inferência)* |
| `trailing` | `React.ReactNode` | — | Não | Conteúdo renderizado à direita no cabeçalho, antes do botão de fechar. *(Inferência)* |
| `children` | `React.ReactNode` | — | Não | Conteudo principal do corpo do dialog. |
| `footer` | `React.ReactNode` | — | Não | Estrutura principal do conteúdo. |
| `size` | `SgDialogSize` = `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Não | Escala do container modal. |
| `severity` | `SgDialogSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger" \| "plain"` | `"plain"` | Não | Tom semântico: tinge o **fundo** do diálogo (12% da cor da severidade sobre `--background`, só sem `customColor`) e a **faixa do topo** (com `showTopAccent`). A cor é a mesma do fundo do `SgButton` da mesma severidade; `plain` não tinge. |
| `animation` | `SgDialogAnimation` = `"fade" \| "zoom" \| "slideUp"` | `"zoom"` | Não | Animação e duração da transição. |
| `transitionMs` | `number` | `160` | Não | Animação e duração da transição. |
| `autoCloseMs` | `number` | — | Não | Fecha automaticamente após o tempo informado. |
| `className` | `string` | — | Não | Customização de estilos por seção. |
| `style` | `React.CSSProperties` | — | Não | Customização de estilos por seção. |
| `customColor` | `React.CSSProperties["backgroundColor"]` | — | Não | Customiza cor de fundo e elevacao do card do dialog. |
| `elevation` | `"none" \| "sm" \| "md" \| "lg" \| React.CSSProperties["boxShadow"]` | — | Não | Customiza cor de fundo e elevacao do card do dialog. |
| `shadow` | `React.CSSProperties["boxShadow"]` | — | Não | **Obsoleta** (`@deprecated`). Sombra CSS (box-shadow) do card; usada apenas quando `elevation` não é informado. Substituída por `elevation`. *(Inferência)* |
| `showTopAccent` | `boolean` | `true` | Não | Exibe a borda superior colorida (border-t-4) com a cor da `severity`. *(Inferência)* |
| `overlayClassName` | `string` | — | Não | Customização de estilos por seção. |
| `contentClassName` | `string` | — | Não | Customização de estilos por seção. |
| `headerClassName` | `string` | — | Não | Customização de estilos por seção. |
| `bodyClassName` | `string` | — | Não | Customização de estilos por seção. |
| `footerClassName` | `string` | — | Não | Customização de estilos por seção. |
| `closeable` | `boolean` | `true` | Não | Regras de fechamento. |
| `onClose` | `() => void` | — | Não | Controle avançado de fechamento e foco. |
| `closeOnOverlayClick` | `boolean` | `true` | Não | Fecha o dialog ao clicar fora do conteudo. |
| `closeOnEsc` | `boolean` | `true` | Não | Regras de fechamento. |
| `lockBodyScroll` | `boolean` | `true` | Não | Acessibilidade e foco. |
| `initialFocusRef` | `React.RefObject<HTMLElement>` | — | Não | Controle avançado de fechamento e foco. |
| `restoreFocus` | `boolean` | `true` | Não | Acessibilidade e foco. |
| `ariaLabel` | `string` | `?? (typeof title === "string" ? title : undefined) ?? t(i18n, "components.dialog.ariaLabel")` ᶠ | Não | Rótulo acessível do `role="dialog"`. Sem valor, usa `title` (se for string) ou o texto i18n `components.dialog.ariaLabel`. *(Inferência)* |

### Eventos e callbacks

| Callback | Assinatura | Quando dispara |
|---|---|---|
| `onOpenChange` | `(open: boolean) => void` | Ao fechar por botão X, clique no overlay (se `closeOnOverlayClick`), `Esc` (se `closeOnEsc`) ou `autoCloseMs` — sempre com `false` |
| `onClose` | `() => void` | Logo após `onOpenChange(false)` nos mesmos fechamentos internos; **não** dispara quando o pai muda `open` para `false` |

Modo controlado quando `open !== undefined`. O componente não renderiza nada antes de montar no cliente (`mounted`) e mantém o conteúdo presente por `transitionMs` após fechar (animação de saída). **Confirmado**.

### Ref

Não aceita `ref`. Foco inicial: `initialFocusRef`, ou o primeiro elemento com `data-sg-dialog-initial-focus="true"`, ou o primeiro focável (`button, [href], input, select, textarea, [tabindex]`).

### Children, slots e composição

- `children` → corpo (`overflow-auto`, card com `max-h-[85vh]`).
- `footer` → rodapé alinhado à direita (renderizado só se informado).
- `leading`, `title`, `subtitle`, `trailing` → cabeçalho; o cabeçalho só aparece se algum deles existir **ou** `closeable` for `true`.
- `size`: `sm` → `max-w-sm`, `md` → `max-w-lg`, `lg` → `max-w-2xl`, `xl` → `max-w-4xl`, `full` → viewport menos 2rem.
- `elevation`: `"none" | "sm" | "md" | "lg"` mapeiam para sombras fixas; qualquer outra string é usada como `box-shadow` literal; sem `elevation` usa `shadow` (obsoleta). `customColor` define o fundo e, se for cor CSS parseável, deriva cores de texto/borda/hover contrastantes.
- Portal em `document.body`, container `fixed inset-0 z-[1000]` (`className`/`style` vão para esse container externo).

### Contexto, providers e hooks

Consome `useComponentsI18n()` (`components.dialog.ariaLabel`, `components.dialog.close`).

### Acessibilidade

- Container com `role="dialog"`, `aria-modal="true"` e `aria-label` (ver `ariaLabel`). Botão de fechar com `aria-label` i18n e ícone `aria-hidden`. **Confirmado**.
- Teclado: `Esc` fecha; `Tab`/`Shift+Tab` circulam entre os focáveis do conteúdo (*focus trap*) — **ambos só ativos quando `closeOnEsc` é `true`**. **Confirmado**.
- `restoreFocus` devolve o foco ao elemento ativo antes da abertura; `lockBodyScroll` aplica `overflow: hidden` no `body` enquanto aberto. **Confirmado**.
- Não usa `aria-labelledby`/`aria-describedby` ligados ao título/corpo.

### Tipos auxiliares exportados

`SgDialogSize` = `"sm" | "md" | "lg" | "xl" | "full"`; `SgDialogSeverity` = `"primary" | "secondary" | "success" | "info" | "warning" | "help" | "danger" | "plain"` (tinge o fundo e, com `showTopAccent`, a borda superior, com a cor do fundo do `SgButton` da severidade; `plain` não tinge. **No código do front ainda não commitado em 2026-10-27**: até lá só a borda superior mudava, com tokens próprios); `SgDialogAnimation` = `"fade" | "zoom" | "slideUp"`.

---

## SgConfirmationDialog

Modal de confirmação construído sobre `SgDialog`: mensagem, ícone por severidade e botões Cancelar/Confirmar (`SgButton`). Fonte: `src/overlay/SgConfirmationDialog.tsx` → `SgConfirmationDialog`.

### Import

```tsx
import { SgConfirmationDialog, type SgConfirmationDialogProps, type SgConfirmationDialogButtonConfig } from "@seedgrid/fe-components";
```

### Props

O tipo é `Omit<SgDialogProps, "title" | "children" | "footer" | "severity" | "shadow" | "showTopAccent"> & { ... }`. As props herdadas de [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API#SgDialog|SgDialogProps]] não desestruturadas pelo componente são repassadas sem alteração (`{...dialogProps}`) ao `SgDialog` interno — daí os padrões `ᵇ`, válidos (Confirmado). O componente **sobrepõe** os padrões de `closeable` (`false`) e `size` (`"sm"`), e controla `open`, `onOpenChange`, `severity`, `showTopAccent` (= `showSeverityAccent`), `title`, `footer` e `children`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `className` | `string` | — | Não | Customização de estilos por seção. |
| `style` | `React.CSSProperties` | — | Não | Customização de estilos por seção. |
| `size` | `SgDialogSize` = `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"sm"` | Não | Escala do container modal. |
| `elevation` | `"none" \| "sm" \| "md" \| "lg" \| React.CSSProperties["boxShadow"]` | — | Não | Customiza customColor e elevation do card do dialog. |
| `animation` | `SgDialogAnimation` = `"fade" \| "zoom" \| "slideUp"` | `"zoom"` ᵇ | Não | Animação e duração da transição. |
| `transitionMs` | `number` | `160` ᵇ | Não | Animação e duração da transição. |
| `headerClassName` | `string` | — | Não | Customização de estilos por seção. |
| `bodyClassName` | `string` | — | Não | Customização de estilos por seção. |
| `footerClassName` | `string` | — | Não | Customização de estilos por seção. |
| `leading` | `React.ReactNode` | — | Não | Repassada ao `SgDialog`: conteúdo à esquerda do título no cabeçalho. *(Inferência)* |
| `trailing` | `React.ReactNode` | — | Não | Repassada ao `SgDialog`: conteúdo à direita no cabeçalho. *(Inferência)* |
| `defaultOpen` | `boolean` | `false` | Não | Controle de abertura do dialogo. |
| `open` | `boolean` | — (sem `open` o componente é não controlado) | Não | Controla a abertura do dialog de confirmacao. |
| `onOpenChange` | `(open: boolean) => void` | — | Não | Controle de abertura do dialogo. |
| `ariaLabel` | `string` | `?? (typeof title === "string" ? title : undefined) ?? t(i18n, "components.dialog.ariaLabel")` ᵇ | Não | Repassada ao `SgDialog`: rótulo acessível; sem valor usa `title` string ou o texto i18n `components.dialog.ariaLabel`. *(Inferência)* |
| `contentClassName` | `string` | — | Não | Customização de estilos por seção. |
| `closeOnEsc` | `boolean` | `true` ᵇ | Não | Comportamentos de fechamento via ESC e overlay. |
| `overlayClassName` | `string` | — | Não | Customização de estilos por seção. |
| `subtitle` | `React.ReactNode` | — | Não | Subtitulo complementar do dialog. |
| `onClose` | `() => void` | — | Não | Controle avançado de fechamento e foco. |
| `autoCloseMs` | `number` | — | Não | Fecha automaticamente após o tempo informado. |
| `customColor` | `React.CSSProperties["backgroundColor"]` | — | Não | Customiza customColor e elevation do card do dialog. |
| `closeable` | `boolean` | `false` | Não | Regras de fechamento. |
| `closeOnOverlayClick` | `boolean` | `true` ᵇ | Não | Comportamentos de fechamento via ESC e overlay. |
| `lockBodyScroll` | `boolean` | `true` ᵇ | Não | Acessibilidade e foco. |
| `initialFocusRef` | `React.RefObject<HTMLElement>` | — | Não | Controle avançado de fechamento e foco. |
| `restoreFocus` | `boolean` | `true` ᵇ | Não | Acessibilidade e foco. |
| `title` | `React.ReactNode` | — | Não | Titulo principal da confirmacao. |
| `message` | `React.ReactNode` | — | Não | Mensagem principal explicando o risco ou decisao. |
| `icon` | `React.ReactNode` | — | Não | Icone opcional no corpo. Se nao for informado, info/warning/danger usam icones padrao. |
| `iconPlacement` | `"left" \| "top"` | `"left"` | Não | Posicao do icone no corpo. |
| `severity` | `SgDialogSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger" \| "plain"` | `"warning"` | Não | Tom semantico da confirmacao. |
| `showSeverityAccent` | `boolean` | `false` | Não | Habilita a faixa superior de severidade no dialogo. |
| `cancelButton` | `SgConfirmationDialogButtonConfig` | — | Não | Configuracao visual e comportamental do botao de cancelamento. |
| `confirmButton` | `SgConfirmationDialogButtonConfig` | — | Não | Configuracao visual e comportamental do botao de confirmacao. |
| `onCancel` | `() => void` | — | Não | Callback disparado quando o usuario cancela a acao. |
| `onConfirm` | `() => void` | — | Não | Callback disparado quando o usuario confirma a acao. |
| `closeOnCancel` | `boolean` | `true` | Não | Define se fecha automaticamente apos acao. |
| `closeOnConfirm` | `boolean` | `true` | Não | Define se fecha automaticamente apos acao. |

- Props declaradas em `SgDialogProps` (contrato reutilizado): `className`, `style`, `size`, `elevation`, `animation`, `transitionMs`, `headerClassName`, `bodyClassName`, `footerClassName`, `leading`, `trailing`, `defaultOpen`, `open`, `onOpenChange`, `ariaLabel`, `contentClassName`, `closeOnEsc`, `overlayClassName`, `subtitle`, `onClose`, `autoCloseMs`, `customColor`, `closeable`, `closeOnOverlayClick`, `lockBodyScroll`, `initialFocusRef`, `restoreFocus`.
- Tipo base: `Omit< SgDialogProps, "title" \| "children" \| "footer" \| "severity" \| "shadow" \| "showTopAccent" >`.

### Eventos e callbacks

| Callback | Assinatura | Quando dispara |
|---|---|---|
| `onConfirm` | `() => void` | Clique em Confirmar, depois de `confirmButton.onClick`; em seguida fecha se `closeOnConfirm` |
| `onCancel` | `() => void` | Clique em Cancelar (depois de `cancelButton.onClick`; fecha se `closeOnCancel`) **e** em qualquer dispensa do dialog (overlay, `Esc`, X, `autoCloseMs`) — "fluxo de cancelamento compartilhado" |
| `onOpenChange` | `(open: boolean) => void` | Ao fechar por cancelar/confirmar (com os `closeOn*` ligados) ou por dispensa do dialog |
| `onClose` | `() => void` | Repassado ao `SgDialog`: só nos fechamentos internos do dialog (overlay/Esc/X/auto), não nos botões Cancelar/Confirmar |

**Confirmado** (`handleCancel`, `handleConfirm`, `handleDialogOpenChange`; teste `overlay.test.mjs`).

### Padrões dos botões

- Cancelar: `appearance` `"outline"`, `severity` `"secondary"`, `shape` `"rounded"`, rótulo i18n `components.actions.cancel`, ícone X; sem `appearance`/`severity`/`className` aplica `customColors` neutras.
- Confirmar: `appearance` `"solid"`, `severity` = severidade do dialog (ou `"primary"` se `plain`), `shape` `"rounded"`, rótulo i18n `components.actions.confirm`, ícone check.
- Ícone do corpo: `icon` se informado (inclusive `null` para suprimir); senão ícone padrão para `info`/`warning`/`danger`; outras severidades sem ícone. **Confirmado**.

### Ref

Não aceita `ref`.

### Children, slots e composição

Não aceita `children`/`footer` (omitidos do tipo). Conteúdo = `message` (+ `icon` à esquerda ou no topo conforme `iconPlacement`). `title` e `subtitle`/`leading`/`trailing` vão para o cabeçalho do `SgDialog`.

### Contexto, providers e hooks

Consome `useComponentsI18n()`; herda o comportamento de `SgDialog`.

### Acessibilidade

Herda de `SgDialog` (`role="dialog"`, `aria-modal`, `Esc`, *focus trap*, foco inicial no primeiro focável — no caso, o botão Cancelar, por ser o primeiro botão do conteúdo quando `closeable` é `false`: **Inferência** pela ordem do DOM). Ícones padrão com `aria-hidden`.

### Tipos auxiliares exportados

`SgConfirmationDialogButtonConfig`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | Não | Texto do botão (padrão i18n) |
| `icon` | `React.ReactNode` | Não | Ícone à esquerda (padrão X/check) |
| `severity` | `SgButtonProps["severity"]` | Não | Severidade do `SgButton` |
| `appearance` | `SgButtonProps["appearance"]` | Não | `"solid" \| "outline" \| "ghost"` |
| `shape` | `SgButtonProps["shape"]` | Não | Formato do `SgButton` (padrão `"rounded"`) |
| `disabled` | `boolean` | Não | Desabilita o botão |
| `className` | `string` | Não | Classe extra |
| `onClick` | `() => void` | Não | Chamado antes de `onCancel`/`onConfirm` |

Ver `SgButton` em [[SeedGrid/SeedGrid-components/buttons/API|API dos botões]].

---

## SgWizard

Fluxo em etapas: renderiza uma `SgWizardPage` por vez, botões Anterior/Próximo/Concluir, stepper opcional (numerado ou por ícones), validação automática dos inputs da etapa e guardas síncronas/assíncronas. Fonte: `src/wizard/SgWizard.tsx` → `SgWizard`.

### Import

```tsx
import { SgWizard, SgWizardPage, type SgWizardProps, type SgWizardPageProps, type SgWizardLabels, type SgWizardStepper } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | — | Sim | Paginas do wizard renderizadas em ordem. |
| `onFinish` | `() => void \| Promise<void>` | — | Sim | Acao executada ao concluir o wizard. |
| `onStepChange` | `(index: number) => void` | — | Não | Callback disparado ao trocar de etapa. |
| `onBeforeNext` | `(index: number) => boolean \| Promise<boolean>` | — | Não | Roda ao clicar em Proximo; devolver false (ou uma Promise<false>) impede o avanco. Enquanto e aguardado, o botao fica desabilitado. |
| `onBeforeFinish` | `(index: number) => boolean \| Promise<boolean>` | — | Não | Roda ao clicar em concluir; devolver false impede a finalizacao. |
| `validateStep` | `(index: number) => boolean \| Promise<boolean>` | — | Não | Valida a etapa atual antes de avancar. |
| `nextDisabled` | `boolean` | `?? false` ᶠ | Não | Desabilita o avanco de forma declarativa: o botao "Proximo" fica desabilitado (opaco, com cursor de bloqueio) e o stepper para de oferecer as etapas seguintes. Complementa `onBeforeNext`/`validateStep`, que so' agem NO CLIQUE. Quando o consumidor ja sabe que a etapa nao pode avancar — tipicamente o resultado de uma checagem assincrona que ja' terminou, como "este CNPJ ja' tem cadastro" — o botao continuava com aparencia de clicavel e o clique nao fazia nada, sem explicar por que. Nao afeta o botao de conclusao da ultima etapa: para esse caso existe `onBeforeFinish`. |
| `initialStep` | `number` | `0` (via `clampWizardStep`, que também limita ao intervalo de páginas) | Não | Indice inicial da etapa ativa. |
| `labels` | `Partial<SgWizardLabels>` | textos i18n `components.wizard.next/previous/finish` | Não | Override dos textos dos botoes de navegacao. |
| `stepper` | `SgWizardStepper` = `"none" \| "numbered" \| "icons"` | `?? "none"` ᶠ | Não | Modo visual do stepper. |
| `stepNavigation` | `WizardStepNavigation` = `"none" \| "previous" \| "previous-and-next"` | `?? "previous-and-next"` ᶠ | Não | Define quais etapas podem ser acessadas clicando no stepper. |
| `className` | `string` | — | Não | Classes e estilo inline do container do wizard. |
| `style` | `React.CSSProperties` | — | Não | Classes e estilo inline do container do wizard. |

### Eventos e callbacks

| Callback | Assinatura | Quando dispara |
|---|---|---|
| `validateStep` | `(index: number) => boolean \| Promise<boolean>` | No avanço e na conclusão, após a validação automática; `false` bloqueia |
| `onBeforeNext` | `(index: number) => boolean \| Promise<boolean>` | No avanço (botão Próximo ou clique na etapa seguinte do stepper), após `validateStep` |
| `onBeforeFinish` | `(index: number) => boolean \| Promise<boolean>` | Na conclusão, após `validateStep` |
| `onFinish` | `() => void \| Promise<void>` | Quando todas as guardas da última etapa passam; o botão fica desabilitado enquanto a Promise não resolve |
| `onStepChange` | `(index: number) => void` | Em efeito após render com dependências `[props, step]` (ver observação na visão geral) |

Ordem das guardas (`canProceedWizardAction`): **1)** validação automática da etapa — foca e desfoca cada `input/select/textarea` da etapa, aguarda um tick e bloqueia se existir algum elemento `[data-sg-error]`; **2)** `validateStep`; **3)** `onBeforeNext`/`onBeforeFinish`. Durante a execução os botões ficam desabilitados (`isValidating`). Voltar (botão Anterior ou etapa anterior no stepper) não executa guardas. **Confirmado**.

### Ref

Não aceita `ref`; não há API imperativa nem etapa controlada.

### Children, slots e composição

- `children`: apenas elementos `SgWizardPage` diretos são considerados (filtro por `child.type === SgWizardPage`); fragmentos/wrappers são ignorados.
- Stepper (`stepper !== "none"`): `<nav>` com `<ol>`; etapa concluída mostra check; em `icons` usa `SgWizardPage.icon` (se ausente, o número); título = `SgWizardPage.title` ou i18n `components.wizard.step`.
- `stepNavigation`: `"none"` (stepper não clicável), `"previous"` (só etapas anteriores), `"previous-and-next"` (anteriores + somente a imediatamente seguinte). Com `nextDisabled`, etapas futuras deixam de ser clicáveis.
- Botão Anterior só aparece fora da primeira etapa; na última etapa Próximo vira Concluir.

### Contexto, providers e hooks

Consome `useComponentsI18n()` (`components.wizard.next/previous/finish/progress/step`).

### Acessibilidade

- Stepper em `<nav aria-label={i18n "components.wizard.progress"}>`; etapa atual com `aria-current="step"`; etapas clicáveis são `<button type="button">` com anel de foco visível; ícone check `aria-hidden`. **Confirmado**.
- Não move o foco para o conteúdo da nova etapa após avançar/voltar; não há região `aria-live`. **Confirmado** (ausência no código).

### Tipos auxiliares exportados

`SgWizardLabels` = `{ next: string; previous: string; finish: string }` (a prop aceita `Partial`). `SgWizardStepper` = `"numbered" | "icons" | "none"`. `WizardStepNavigation` = `"none" | "previous" | "previous-and-next"`. `WizardGuardRunner` = `{ validateCurrentPage: () => boolean | Promise<boolean>; validateStep?: (index: number) => boolean | Promise<boolean>; beforeAction?: (index: number) => boolean | Promise<boolean>; step: number }`.

### Helpers puros exportados (`src/wizard/logic.ts`)

| Função | Assinatura | Comportamento |
|---|---|---|
| `clampWizardStep` | `(initialStep: number \| undefined, pageCount: number) => number` | `initialStep ?? 0` limitado a `[0, max(pageCount - 1, 0)]` |
| `canNavigateToWizardStep` | `(args: { currentStep: number; targetStep: number; pageCount: number; stepNavigation?: WizardStepNavigation }) => boolean` | `false` fora do intervalo ou para a etapa atual; anterior permitida em `previous`/`previous-and-next`; posterior só em `previous-and-next` e só `currentStep + 1` (padrão `"previous-and-next"`) |
| `canProceedWizardAction` | `(runner: WizardGuardRunner) => Promise<boolean>` | Executa `validateCurrentPage` → `validateStep(step)` → `beforeAction(step)`, parando no primeiro `false` |

---

## SgWizardPage

Etapa de um `SgWizard`. Renderiza apenas `<div className style>{children}</div>`; `title` e `icon` são lidos pelo `SgWizard` para o stepper. Fonte: `src/wizard/SgWizard.tsx` → `SgWizardPage`.

### Import

```tsx
import { SgWizardPage, type SgWizardPageProps } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `title` | `string` | — | Não | Titulo exibido no stepper do wizard. Sem valor, o stepper usa o texto i18n `components.wizard.step` ("Etapa N"). |
| `icon` | `React.ReactNode` | — | Não | Icone opcional exibido quando o wizard usa stepper por icones. |
| `children` | `React.ReactNode` | — | Sim | Conteudo da etapa. |
| `className` | `string` | — | Não | Classes adicionais da etapa. |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do `<div>` da etapa. *(Inferência)* |

### Ref, eventos e acessibilidade

Não aceita `ref`; não tem callbacks; sem atributos ARIA próprios. Só funciona como filho direto de `SgWizard`.
