---
tags: [seedgrid, front, component, buttons]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/buttons
branch: main
commit: 0287d2f
analisado-em: 2026-11-11
description: "API React de Botões (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# API — botões (`src/buttons`) — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/buttons/API|API — Botões (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

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
| `loading` | `boolean` | `false` | Não | Exibe spinner e bloqueia interacao enquanto a acao esta em progresso. Continua valendo e **vence** o loading automático do `onClick`: o loading efetivo é `loading` ou operação pendente (`Promise` devolvida pelo `onClick`). |
| `customColors` | `SgButtonCustomColors` | — | Não | Sobrescreve cores de fundo, texto, borda e foco. |
| `enabled` | `boolean` | `true` | Não | Quando false, desabilita o botão. Padrão: true. |
| `onClick` | `(event: MouseEvent<HTMLButtonElement, MouseEvent>) => unknown` | — | Não | Clique do botão; pode ser síncrono ou assíncrono. Se **devolver** uma `Promise`, o botão entra em loading sozinho (spinner, desabilitado, `aria-busy`), ignora cliques até a operação terminar e volta ao normal ao terminar ou falhar. Regras completas em «`onClick` assíncrono» abaixo. O retorno é `unknown` só para não quebrar handlers de corpo-expressão (`() => lista.push(x)`). |

- **Atributos DOM herdados**: o tipo é `Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "disabled" | "onClick"> & { ... }` (`onClick` e `enabled` são próprios); a contagem a seguir é do conjunto antes do `Omit` de `onClick`/`disabled` (2026-11-07) e vem de `@types/react`: acrescenta 287 props de `@types/react` (`ButtonHTMLAttributes` 10, `HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 170), incluindo `children`. Não listadas individualmente — ver contrato base `React.ButtonHTMLAttributes` em `@types/react`.
- Aceita `ref` (via `React.forwardRef`) e `key`.
- Prop herdada com padrão próprio: `type` (de `ButtonHTMLAttributes`) tem padrão `"button"` na desestruturação — o botão **não** submete formulários a menos que se passe `type="submit"` (Confirmado).
- `enabled` (`false` desabilita) é combinada com `loading`: o `<button>` fica `disabled` se `enabled` for `false` ou `loading` for verdadeiro (Confirmado em `SgButton.tsx`).
- `children` (herdada) tem prioridade sobre `label` (`children ?? label`). Demais atributos (`aria-*`, `form`, `name`…) são repassados ao `<button>` via `{...rest}` (Confirmado). `style` é mesclado depois das variáveis CSS de cor.

### Eventos e callbacks

- `onClick` — tipado `(event: React.MouseEvent<HTMLButtonElement>) => unknown` (próprio do `SgButton`; sai do `Omit` dos atributos herdados). Com `loading`, operação pendente ou `enabled: false`, o botão nativo fica desabilitado e não dispara cliques. Veja «`onClick` assíncrono» logo abaixo.
- Os demais eventos DOM de `<button>` (herdados) — repassados diretamente.

#### `onClick` assíncrono (loading automático)

1. **Pode ou não ser `async`.** Função síncrona (abrir modal, alternar painel) funciona como sempre; nada muda.
2. **Se DEVOLVE uma `Promise`**, o botão entra em loading sozinho (spinner, desabilitado, `aria-busy="true"`), ignora cliques até terminar — inclusive cliques seguidos antes do re-render, porque o bloqueio usa uma ref — e volta ao normal ao terminar ou falhar. Isso protege contra duplo clique e reenvio, mas **não substitui** a chave de idempotência no servidor.
3. **Precisa DEVOLVER a `Promise`.** `() => { salvar(); }` (chaves sem `return`) **não** protege; `() => salvar()` e `async () => { await salvar(); }` protegem.
4. **O erro não é engolido.** O botão sai do loading e relança a falha como rejeição não tratada; trate com `try/catch` dentro do `onClick` e avise o usuário com `sgWhistle.error`.
5. **`async` só para ação que pode demorar ou falhar** (salvar, enviar, pagar); ação instantânea fica síncrona.
6. **`loading` manual vence:** o loading efetivo é `loading` ou operação pendente.

Confirmado em `SgButton.tsx` (`handleClick`, `pendingRef`, `aria-busy`). Exemplos: «Loading automático com Future», «onClick síncrono x assíncrono» e «Tratando erro no onClick assíncrono» em [[SeedGrid/SeedGrid-components/buttons/Exemplos|Exemplos de botões]].

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
- `aria-busy="true"` no `<button>` enquanto o loading efetivo (`loading` ou operação pendente do `onClick`) estiver ativo. Spinner com `aria-hidden="true"`. Botões somente-ícone **não** recebem `aria-label` automático — informe `aria-label` (Confirmado: nenhum aria-label é gerado no componente).

### Tipos auxiliares exportados

`SgButtonCustomColors` — todas opcionais, `string` (qualquer cor CSS), viram variáveis CSS `--sg-btn-*`:

| Campo | Uso |
|---|---|
| `bg` | fundo |
| `fg` | texto |
| `border` | borda |
| `hoverBg` | fundo em hover |
| `hoverFg` | texto em hover, e também no estado ativo quando é customizado; sem cor customizada, cada estado usa o texto escolhido por contraste sobre o próprio fundo (`--sg-btn-<papel>-hover-fg` e `--sg-btn-<papel>-active-fg`, ver `pacotes/fe-theme`) |
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
| `loading` | `boolean` | `false` | Não | Exibe estado de carregamento na acao principal. |
| `onClick` | `() => void` | — | Não | Callback disparado na acao principal. |
| `items` | `SgSplitButtonItem[]` | — | Sim | Lista de acoes secundarias exibidas no menu dropdown. |
| `customColors` | `SgButtonCustomColors` | — | Não | Cores personalizadas repassadas aos dois `SgButton` internos (mesmo contrato `SgButtonCustomColors`). *(Inferência)* |
| `className` | `string` | — | Não | Visual customization of the split button container. |
| `style` | `React.CSSProperties` | — | Não | Estilo inline do container. |
| `enabled` | `boolean` | — | Não | — |

- Aceita `ref` (via `React.forwardRef`) e `key`.
- Não há herança de atributos DOM: apenas `className` e `style` chegam ao `<div>` container (Confirmado).

### Eventos e callbacks

- `onClick: () => void` — clique no botão principal (repassado ao 1º `SgButton`).
- `items[i].onClick: () => void` — clique no item; em seguida o menu fecha. Itens com `enabled: false` são ignorados.
- O menu fecha em clique fora do container (`mousedown` no `document`) e em `Escape` (Confirmado; testado em `tests/buttons-menus-dom.test.mjs`).

### Ref

`React.forwardRef<HTMLDivElement, SgSplitButtonProps>` — exposta via `useImperativeHandle` como o `<div>` container (Confirmado).

### Children, slots e composição

Sem `children`. Slots: `label`, `leftIcon` (botão principal); itens do menu via `items`. O botão de seta fica desabilitado com `enabled: false` **ou** `loading`.

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
| `enabled` | `boolean` | Não | Padrão `true`. Com `false` desabilita o item |
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
| `enabled` | `boolean` | — | Não | — |
| `floatActionButtonStyle` | `FABSeverity` | — | Não | — |
- Sem herança de atributos DOM: o tipo é um objeto literal fechado (Confirmado).

### Eventos e callbacks

- `onClick: () => void` — chamado no clique do botão principal **somente se não houver `actions`**; com ações, o clique alterna o menu (Confirmado).
- `actions[i].onClick` — chamado ao clicar na ação; o menu fecha em seguida.
- Clique é ignorado com `enabled: false`/`loading` e logo após um arraste (deslocamento > 3 px).
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
| `enabled` | `boolean` | Não | Padrão `true`. Com `false` desabilita a ação |

Aliases exportados: `FABPosition`, `FABSeverity`, `FABSize`, `FABShape`, `FABElevation`, `FABAnimation`, `FABAnimationTrigger`, `FABLayoutType` (valores na tabela de props).

## Funções auxiliares exportadas (`src/buttons/fab-helpers.ts`)

| Função | Assinatura | Comportamento |
|---|---|---|
| `buildFabStorageKey` | `(dragId?: string \| null) => string \| null` | `null` sem `dragId`; senão `` `sg-fab-pos:${dragId}` `` |
| `parseStoredFabDragPosition` | `(raw: unknown) => { x: number; y: number } \| null` | Aceita string JSON ou objeto; retorna `{x,y}` só se ambos forem números finitos, senão `null` |

Confirmado; cobertos por `tests/buttons-menus.test.mjs` ("FAB drag helpers normalize persisted positions deterministically").

## Cuidados de uso

- **`SgButton`, somente ícone:** sem `children`/`label` e com `leftIcon` ou `rightIcon`, o modo somente-ícone é inferido (`iconOnly` explícito vence), com `size="sm"` e `shape="circle"` por padrão. O componente não gera `aria-label`; informe um em produção. **Confirmado** (`src/buttons/SgButton.tsx`: `inferredIconOnly`, `resolvedSize`, `resolvedShape`; nenhum `aria-label` no `<button>`).
- **`SgButton`, `customColors` com `appearance="outline"`:** as chaves são `bg`, `fg`, `border`, `hoverBg`, `hoverFg`, `hoverBorder`, `activeBg` e `ring`. No `outline` o texto usa `bg` (não `fg`) e o hover é um tom translúcido, então `hoverBg` e `hoverFg` não se aplicam; `border` e `ring` valem. **Confirmado** (`SgButton.tsx`: `resolveButtonColors`, `appearanceClass`).
- **`SgButton`, desabilitar e carregar:** `enabled={false}` desabilita o botão; `loading` ou um `onClick` que devolve Promise pendente também o desabilitam e marcam `aria-busy`. O loading automático só protege se o handler **devolver** a Promise. **Confirmado** (`SgButton.tsx`: `isDisabled`, `aria-busy`; comentário da prop `onClick`).
- **`SgSplitButton`, separador:** `separator: true` desenha a divisória antes do item e é ignorado no primeiro item do menu. **Confirmado** (`src/buttons/SgSplitButton.tsx`: `item.separator && i > 0`).
- **`SgFloatActionButton`, `absolute`:** por padrão o FAB é `position: fixed` na viewport; com `absolute` ele se posiciona em relação ao ancestral posicionado mais próximo, então o contêiner precisa ter `position: relative` para o FAB ficar dentro dele. **Confirmado** a troca fixed/absolute (`src/buttons/SgFloatActionButton.tsx`: `position: absolute ? "absolute" : "fixed"`); a exigência de contêiner `relative` é **Inferido** do comportamento do CSS.
- **`SgFloatActionButton`, `direction` e `radius`:** `direction` (`up`, `down`, `left`, `right`) define para onde as ações se abrem; `radius` só altera a distância nos layouts em arco (`circle`, `semi-circle`, `quarter-circle`), com padrão por tamanho (`DEFAULT_RADIUS`). **Confirmado** (`SgFloatActionButton.tsx`: `computeItemPositions`).
- **`SgFloatActionButton`, arrastar e persistir:** a posição só é salva com `enableDragDrop` **e** `dragId`; vai para o `SgEnvironmentProvider` (se houver um acima) ou, sem ele, para o `localStorage` (chave `sg-fab-pos:<dragId>`). O clique direito só abre a confirmação de redefinir quando já existe posição salva. **Confirmado** (`SgFloatActionButton.tsx`: `loadStoredPosition`, `handleContextMenu` com `hasStoredPosRef`).
