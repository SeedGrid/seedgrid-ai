---
tags: [seedgrid, front, component, buttons]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/buttons
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# API — botões (`src/buttons`)

Visão geral: [[SeedGrid/SeedGrid-components/buttons/Visao-geral|Botões — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/buttons/Exemplos|Exemplos de botões]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Todos os arquivos são `"use client"`. Textos padrão (aria-labels, "abrir/fechar") vêm do i18n do pacote via `useComponentsI18n()` — ver [[SeedGrid/SeedGrid-components/fundamentos/API|API › i18n]].

## SgButton

Botão de ação com severidade, aparência, formato, elevação, ícones e estado de carregamento. Fonte: `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/buttons/SgButton.tsx` → `SgButton` (`React.forwardRef`).

### Import

```tsx
import { SgButton, type SgButtonProps, type SgButtonCustomColors } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `severity` | `Severity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger"` | `"primary"` | Não | Define o peso visual e semantico da acao. |
| `appearance` | `Appearance` = `"solid" \| "outline" \| "ghost"` | `"solid"` | Não | Variante visual base do botao. |
| `size` | `Size` = `"sm" \| "md" \| "lg"` | `?? (isIconOnly ? "sm" : "md")` ᶠ | Não | Tamanho do componente. |
| `shape` | `Shape` = `"default" \| "rounded" \| "square" \| "circle"` | `?? (isIconOnly ? "circle" : "default")` ᶠ | Não | Formato das bordas. |
| `elevation` | `Elevation` = `"sm" \| "md" \| "none"` | `"none"` | Não | Nível de elevação/sombra. |
| `label` | `React.ReactNode` | — | Não | Conteudo textual principal do botao. Usado apenas quando `children` não é informado (`children ?? label`). |
| `iconOnly` | `boolean` | inferido ᶠ | Não | Força o modo somente-ícone (quadrado, sem texto). Se omitido, é inferido como verdadeiro quando não há `children`/`label` e existe `leftIcon` ou `rightIcon`; afeta os padrões de `size` (`sm`) e `shape` (`circle`). *(Inferência)* |
| `leftIcon` | `React.ReactNode` | — | Não | Icone exibido antes do label. |
| `rightIcon` | `React.ReactNode` | — | Não | Icone exibido depois do label. |
| `loading` | `boolean` | `false` | Não | Exibe spinner e bloqueia interacao enquanto a acao esta em progresso. |
| `customColors` | `SgButtonCustomColors` | — | Não | Sobrescreve cores de fundo, texto, borda e foco. |

- **Atributos DOM herdados**: o tipo é `Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { ... }`; acrescenta 287 props de `@types/react` (`ButtonHTMLAttributes` 10, `HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 170), incluindo `children`. Não listadas individualmente — ver contrato base `React.ButtonHTMLAttributes` em `@types/react`.
- Aceita `ref` (via `React.forwardRef`) e `key`.
- Prop herdada com padrão próprio: `type` (de `ButtonHTMLAttributes`) tem padrão `"button"` na desestruturação — o botão **não** submete formulários a menos que se passe `type="submit"` (Confirmado).
- `disabled` (herdada) é combinada com `loading`: o `<button>` fica `disabled` se qualquer um for verdadeiro (Confirmado).
- `children` (herdada) tem prioridade sobre `label` (`children ?? label`). Demais atributos (`onClick`, `aria-*`, `form`, `name`…) são repassados ao `<button>` via `{...rest}` (Confirmado). `style` é mesclado depois das variáveis CSS de cor.

### Eventos e callbacks

- `onClick` e todos os eventos DOM de `<button>` (herdados) — repassados diretamente. Com `loading` ou `disabled`, o botão nativo fica desabilitado e não dispara cliques.

### Ref

`React.forwardRef<HTMLButtonElement, SgButtonProps>` — a ref aponta para o `<button>` nativo (Confirmado).

### Children, slots e composição

- Conteúdo: `children` ou `label`; slots `leftIcon` / `rightIcon`. Em `loading`, os ícones são substituídos por um spinner SVG (`aria-hidden`) e o texto continua visível.
- Modo somente-ícone: inferido quando não há texto e existe ícone (ou forçado com `iconOnly`) → `aspect-square`, padrão `size="sm"` e `shape="circle"`.
- `SgSplitButton` e vários outros componentes usam `SgButton` internamente.

### Contexto, providers e hooks

Nenhum contexto consumido.

### Acessibilidade

- Elemento nativo `<button>` (foco e teclado nativos); anel de foco `focus-visible` com a cor `ring` (Confirmado).
- Spinner com `aria-hidden="true"`. Botões somente-ícone **não** recebem `aria-label` automático — informe `aria-label` (Confirmado: nenhum aria-label é gerado no componente).

### Tipos auxiliares exportados

`SgButtonCustomColors` — todas opcionais, `string` (qualquer cor CSS), viram variáveis CSS `--sg-btn-*`:

| Campo | Uso |
|---|---|
| `bg` | fundo |
| `fg` | texto |
| `border` | borda |
| `hoverBg` | fundo em hover |
| `hoverFg` | texto em hover |
| `hoverBorder` | borda em hover |
| `activeBg` | fundo ativo |
| `ring` | anel de foco |

Os tipos `Severity`, `Appearance`, `Size`, `Shape`, `Elevation` são aliases **internos** (não exportados); os valores aceitos estão na tabela.

## SgSplitButton

Botão com ação principal + botão de seta que abre um menu de ações secundárias. Fonte: `src/buttons/SgSplitButton.tsx` → `SgSplitButton` (`React.forwardRef`). Compõe dois `SgButton`.

### Import

```tsx
import { SgSplitButton, type SgSplitButtonProps, type SgSplitButtonItem } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `label` | `string` | — | Não | Conteudo textual principal da acao. |
| `leftIcon` | `React.ReactNode` | — | Não | Icone exibido junto do label principal. |
| `severity` | `Severity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger"` | `"primary"` | Não | Peso visual e semantico da acao principal. |
| `appearance` | `Appearance` = `"solid" \| "outline" \| "ghost"` | `"solid"` | Não | Variante visual base do split button. |
| `size` | `Size` = `"sm" \| "md" \| "lg"` | `"md"` | Não | Tamanho do componente (repassado ao `SgButton`; também ajusta o menu). |
| `shape` | `Shape` = `"default" \| "rounded" \| "square"` | `"default"` | Não | Formato das bordas dos dois botões internos (repassado ao `SgButton`). *(Inferência)* |
| `elevation` | `Elevation` = `"sm" \| "md" \| "none"` | `"none"` | Não | Nível de elevação/sombra dos botões. |
| `disabled` | `boolean` | `false` | Não | Desabilita a acao principal e o menu secundario. |
| `loading` | `boolean` | `false` | Não | Exibe estado de carregamento na acao principal. |
| `onClick` | `() => void` | — | Não | Callback disparado na acao principal. |
| `items` | `SgSplitButtonItem[]` | — | Sim | Lista de acoes secundarias exibidas no menu dropdown. |
| `customColors` | `SgButtonCustomColors` | — | Não | Cores personalizadas repassadas aos dois `SgButton` internos (mesmo contrato `SgButtonCustomColors`). *(Inferência)* |
| `className` | `string` | — | Não | Visual customization of the split button container. |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do container. |

- Aceita `ref` (via `React.forwardRef`) e `key`.
- Não há herança de atributos DOM: apenas `className` e `style` chegam ao `<div>` container (Confirmado).

### Eventos e callbacks

- `onClick: () => void` — clique no botão principal (repassado ao 1º `SgButton`).
- `items[i].onClick: () => void` — clique no item; em seguida o menu fecha. Itens com `disabled` são ignorados.
- O menu fecha em clique fora do container (`mousedown` no `document`) e em `Escape` (Confirmado; testado em `tests/buttons-menus-dom.test.mjs`).

### Ref

`React.forwardRef<HTMLDivElement, SgSplitButtonProps>` — exposta via `useImperativeHandle` como o `<div>` container (Confirmado).

### Children, slots e composição

Sem `children`. Slots: `label`, `leftIcon` (botão principal); itens do menu via `items`. O botão de seta fica desabilitado com `disabled` **ou** `loading`.

### Contexto, providers e hooks

Usa `useComponentsI18n()` para o `aria-label` do botão de seta (`components.actions.openList` / `components.actions.close`).

### Acessibilidade

- Botão de seta: `aria-haspopup="menu"`, `aria-expanded`, `aria-label` traduzido (Confirmado; testado em `tests/buttons-menus.test.mjs`).
- Menu: `role="menu"`; itens são `<button type="button" role="menuitem">`. Não há navegação por setas entre itens nem gestão de foco ao abrir (Confirmado: só `Escape` é tratado).

### Tipos auxiliares exportados

`SgSplitButtonItem`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `label` | `string` | Sim | Texto do item |
| `icon` | `React.ReactNode` | Não | Ícone à esquerda |
| `onClick` | `() => void` | Não | Ação do item |
| `disabled` | `boolean` | Não | Desabilita o item |
| `separator` | `boolean` | Não | Desenha uma linha divisória **antes** do item (ignorado no 1º item) |

## SgFloatActionButton

Botão de ação flutuante (FAB) com ações secundárias em layout linear/circular, tooltip, animações, ocultação ao rolar e arrastar-e-soltar com posição persistida. Fonte: `src/buttons/SgFloatActionButton.tsx` → `SgFloatActionButton` (função, sem forwardRef).

### Import

```tsx
import {
  SgFloatActionButton,
  type SgFloatActionButtonProps, type SgFABAction,
  type FABPosition, type FABSeverity, type FABSize, type FABShape,
  type FABElevation, type FABAnimation, type FABAnimationTrigger, type FABLayoutType
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `hint` | `string` | — | Não | Texto do tooltip exibido após `hintDelay` ms de hover. Também é usado como `aria-label` do botão; sem `hint`, o `aria-label` usa os textos i18n de abrir/fechar. *(Inferência)* |
| `hintPosition` | `"top" \| "right" \| "bottom" \| "left"` | `?? DEFAULT_HINT[position]` ᶠ (lado oposto à borda; ex.: `right-bottom` → `left`) | Não | Configuracoes do tooltip de dica. |
| `hintDelay` | `number` | `300` | Não | Configuracoes do tooltip de dica. |
| `icon` | `React.ReactNode` | ícone `+` interno ᶠ | Não | Icone principal exibido no FAB. |
| `activeIcon` | `React.ReactNode` | — | Não | Icone principal e icone alternativo quando aberto. |
| `position` | `FABPosition` = `"left-top" \| "left-center" \| "left-bottom" \| "center-top" \| "center-bottom" \| "right-top" \| "right-center" \| "right-bottom"` | `"right-bottom"` | Não | Posicao do FAB na area visivel. |
| `offset` | `{ x?: number; y?: number }` | — | Não | Deslocamento em px aplicado à posição calculada (`x` desloca horizontalmente, `y` verticalmente, a partir da borda de ancoragem). *(Inferência)* |
| `enableDragDrop` | `boolean` | `false` | Não | Habilita o comportamento de arrastar e soltar. |
| `dragId` | `string` | — | Não | Habilita o comportamento de arrastar e soltar. |
| `severity` | `FABSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "help" \| "danger" \| "plain"` | `"primary"` | Não | Peso visual da acao flutuante. |
| `color` | `string` | cor da severidade ᶠ | Não | Cor de fundo personalizada do FAB (qualquer cor CSS); quando informada o texto fica branco e o anel de foco é derivado via `color-mix`. *(Inferência)* |
| `size` | `FABSize` = `"sm" \| "md" \| "lg"` | `"md"` | Não | Tamanho do FAB. |
| `shape` | `FABShape` = `"rounded" \| "square" \| "circle"` | `"circle"` | Não | Formato do botao. |
| `elevation` | `FABElevation` = `"sm" \| "md" \| "lg" \| "none"` | `"md"` | Não | Intensidade da sombra. |
| `disabled` | `boolean` | `false` | Não | Desabilita a acao principal e as acoes derivadas. |
| `loading` | `boolean` | `false` | Não | Exibe estado de carregamento no FAB. |
| `autoHideOnScroll` | `boolean` | `false` | Não | Oculta o FAB ao rolar a janela (listener em `window.scroll`, limiar de 5 px). *(Inferência)* |
| `hideDirection` | `"down" \| "up"` | `"down"` | Não | Sentido de rolagem que oculta o FAB quando `autoHideOnScroll` está ativo (`down` = ao rolar para baixo). *(Inferência)* |
| `animation` | `FABAnimation` = `"none" \| "scale" \| "slide" \| "fade" \| "rotate" \| "pulse"` | `"scale"` | Não | Configuracoes de animacao visual. |
| `animationOn` | `FABAnimationTrigger` = `"mount" \| "hover" \| "click"` | `"mount"` | Não | Configuracoes de animacao visual. |
| `animationDuration` | `number` | `200` | Não | Duração em ms das animações do FAB (também usada para encerrar o estado de clique). *(Inferência)* |
| `direction` | `"up" \| "down" \| "left" \| "right"` | `?? DEFAULT_DIR[position]` ᶠ (ex.: `right-bottom` → `up`) | Não | Direcao usada nos layouts linear e parcial. |
| `type` | `FABLayoutType` = `"circle" \| "linear" \| "semi-circle" \| "quarter-circle"` | `"linear"` | Não | Tipo de distribuicao do layout das acoes. |
| `radius` | `number` | `?? DEFAULT_RADIUS[size]` ᶠ (sm 100, md 120, lg 150) | Não | Raio (px) para layouts `circle`, `semi-circle` e `quarter-circle`. |
| `transitionDelay` | `number` | `30` | Não | Atraso em ms entre a entrada de cada ação (escalonamento; invertido ao fechar). *(Inferência)* |
| `actions` | `SgFABAction[]` | — | Não | Acoes secundarias exibidas a partir do botao flutuante. Se houver ações, o clique abre/fecha o menu em vez de chamar `onClick`. |
| `onClick` | `() => void` | — | Não | Callback da acao principal do FAB. |
| `className` | `string` | — | Não | Classes CSS extras do container posicionado. *(Inferência)* |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do container posicionado. *(Inferência)* |
| `zIndex` | `number` | `50` | Não | `z-index` do container do FAB. *(Inferência)* |
| `absolute` | `boolean` | `false` | Não | Usa `position: absolute` (relativo ao ancestral posicionado) em vez de `fixed` (viewport). |
- Sem herança de atributos DOM: o tipo é um objeto literal fechado (Confirmado).

### Eventos e callbacks

- `onClick: () => void` — chamado no clique do botão principal **somente se não houver `actions`**; com ações, o clique alterna o menu (Confirmado).
- `actions[i].onClick` — chamado ao clicar na ação; o menu fecha em seguida.
- Clique é ignorado com `disabled`/`loading` e logo após um arraste (deslocamento > 3 px).
- Menu de ações fecha em clique fora e `Escape`.
- Botão direito (context menu): com `enableDragDrop` + `dragId` e posição salva, abre um `SgPopup` "redefinir posição" (Sim/Não); "Sim" limpa a posição persistida (Confirmado; testado em `tests/buttons-menus-dom.test.mjs`).

### Ref

Não aceita `ref` (função simples, sem `forwardRef`).

### Children, slots e composição

Sem `children`. Slots: `icon`, `activeIcon` (exibido quando aberto; sem ele, o ícone gira 45°), ícones das ações. Usa `SgPopup` internamente para o menu de redefinição.

### Contexto, providers e hooks

- **Persistência da posição arrastada** (`enableDragDrop` + `dragId`): chave `sg-fab-pos:<dragId>` (`buildFabStorageKey`). Se houver `SgEnvironmentProvider` acima, usa `useSgPersistence()` (load/save/clear da estratégia configurada); senão, `localStorage` direto (Confirmado). Ver [[SeedGrid/SeedGrid-components/providers/API|Providers › SgEnvironmentProvider]].
- Posição restaurada é limitada à viewport (ou ao `offsetParent` quando `absolute`).

### Acessibilidade

- Botão principal: `aria-label` = `hint` ou texto i18n abrir/fechar; `aria-expanded` quando há `actions` (Confirmado; testado).
- Ações: `<button>` com `aria-label={label}`; ações sem `label` ficam sem nome acessível.
- `Escape` fecha o menu. Os `<button>` internos não declaram `type="button"` (Confirmado) — dentro de `<form>` agiriam como submit (Inferência pelo comportamento HTML padrão).

### Tipos auxiliares exportados

`SgFABAction`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `icon` | `React.ReactNode` | Sim | Ícone da ação |
| `label` | `string` | Não | Tooltip e `aria-label` |
| `onClick` | `() => void` | Não | Ação |
| `severity` | `FABSeverity` | Não | Cor da ação (padrão `"plain"`) |
| `floatActionButtonStyle` | `FABSeverity` | Não | Alias usado se `severity` ausente |
| `disabled` | `boolean` | Não | Desabilita a ação |

Aliases exportados: `FABPosition`, `FABSeverity`, `FABSize`, `FABShape`, `FABElevation`, `FABAnimation`, `FABAnimationTrigger`, `FABLayoutType` (valores na tabela de props).

## Funções auxiliares exportadas (`src/buttons/fab-helpers.ts`)

| Função | Assinatura | Comportamento |
|---|---|---|
| `buildFabStorageKey` | `(dragId?: string \| null) => string \| null` | `null` sem `dragId`; senão `` `sg-fab-pos:${dragId}` `` |
| `parseStoredFabDragPosition` | `(raw: unknown) => { x: number; y: number } \| null` | Aceita string JSON ou objeto; retorna `{x,y}` só se ambos forem números finitos, senão `null` |

Confirmado; cobertos por `tests/buttons-menus.test.mjs` ("FAB drag helpers normalize persisted positions deterministically").
