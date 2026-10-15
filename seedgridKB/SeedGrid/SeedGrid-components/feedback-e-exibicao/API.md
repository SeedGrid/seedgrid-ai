---
tags: [seedgrid, front, component, feedback-e-exibicao]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/commons
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# API — feedback e exibição (`src/commons`)

Visão geral: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Visao-geral|Feedback e exibição — visão geral]] · Exemplos: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Exemplos|Exemplos de feedback e exibição]]

> **Como ler as tabelas.** Geradas a partir do tipo TypeScript real do 1º parâmetro de cada componente (TS checker, commit `ad30fc11de`) — lista completa das props próprias. **Padrão**: valor sem marca = inicializador na desestruturação do componente (Confirmado); `ᶠ` = fallback interno `??` no corpo do componente (Confirmado, expressão pode estar abreviada); `ᵇ` = padrão aplicado pelo componente base para o qual a prop é repassada; `ᵐ` = declarado só no `*.meta.ts`; `ˢ` = declarado só na tabela de props do showcase (`ᵐ`/`ˢ` = Não confirmado no código); `—` = sem padrão. **Descrição**: JSDoc > `*.meta.ts` > tabela do showcase (textos originais, sem acento quando assim na fonte); *(Inferência)* = escrita a partir da leitura do código. **Obrigatória** = prop não opcional no tipo.

Todos os componentes são `"use client"`. Textos padrão vêm do i18n interno (`useComponentsI18n` / `getComponentsI18n`) — ver [[SeedGrid/SeedGrid-components/fundamentos/API|API › i18n]].

## SgAvatar

Avatar com imagem, ícone, iniciais ou fallback. Fonte: `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/commons/SgAvatar.tsx` → `SgAvatar` (`React.forwardRef`).

### Import

```tsx
import {
  SgAvatar, SgAvatarGroup,
  type SgAvatarProps, type SgAvatarGroupProps, type SgAvatarSeverity, type SgAvatarShape,
  type SgAvatarSize, type SgAvatarCustomColors, type SgAvatarGroupOverlap
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `src` | `string` | — | Não | URL da imagem principal do avatar. |
| `alt` | `string` | `?? t(i18n, "components.avatar.defaultAlt")` ᶠ | Não | Texto alternativo da imagem do avatar. |
| `label` | `React.ReactNode` | — | Não | Conteudo textual usado como iniciais ou identificacao visual. |
| `icon` | `React.ReactNode` | — | Não | Conteúdo visual do avatar. |
| `fallback` | `React.ReactNode` | — | Não | Conteudo de fallback quando nao ha imagem. |
| `size` | `SgAvatarSize` = `"sm" \| "md" \| "lg" \| "xs" \| "xl"` | `"md"` | Não | Escala visual do avatar. |
| `shape` | `SgAvatarShape` = `"square" \| "circle"` | `"circle"` | Não | Forma visual do avatar. |
| `severity` | `SgAvatarSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "danger" \| "neutral" \| "custom"` | `"primary"` | Não | Tom visual do avatar quando nao ha imagem. |
| `bordered` | `boolean` | `true` | Não | Borda e estado desabilitado. |
| `disabled` | `boolean` | `false` | Não | Borda e estado desabilitado. |
| `customColors` | `SgAvatarCustomColors` | — | Não | Substituições de cores quando necessário. |
| `imageClassName` | `string` | — | Não | Classes CSS para imagem e container. |
| `children` | `React.ReactNode` | — | Não | Conteúdo visual do avatar. |
| `onImageError` | `(event: React.SyntheticEvent<HTMLImageElement, Event>) => void` | — | Não | Callback para falha ao carregar imagem. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLSpanElement>, "children" \| "color"> & { ... }`; acrescenta 276 props de `@types/react` (`HTMLAttributes` 54, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.
- Aceita `ref` (via `React.forwardRef`) e `key`.
- Atributos herdados tratados explicitamente: `onClick` (ignorado quando `disabled`), `role`, `tabIndex`, `title`, `style`, `aria-label`; o restante vai para o `<span>` raiz via `{...rest}` (Confirmado).

### Eventos e callbacks

- `onImageError(event)` — erro de carga da `<img>`; o avatar passa a mostrar ícone/label/fallback. O estado de erro é reiniciado quando `src` muda.
- `onClick` (herdado) — se presente (ou `role="button"`/`tabIndex` numérico), o avatar ganha estilo interativo com anel de foco.

### Ref

`React.forwardRef<HTMLSpanElement, SgAvatarProps>` → `<span>` raiz.

### Children, slots e composição

Ordem de prioridade do conteúdo (Confirmado): `children` > imagem (`src`, se não falhou) > `icon` > `label` (normalizado em até 2 iniciais maiúsculas) > `fallback` > `"?"`.

### Contexto, providers e hooks

`useComponentsI18n()` para o `alt` padrão (`components.avatar.defaultAlt`).

### Acessibilidade

- `aria-label` = prop `aria-label` ?? `label` (se string) ?? `alt` resolvido (Confirmado; testado em `tests/commons.test.mjs`).
- `<img>` com `alt` (padrão traduzido) e `loading="lazy"`.
- Não há `role` padrão; para avatar clicável informe `role="button"` e `tabIndex={0}` — o componente não trata teclado (Confirmado: sem `onKeyDown`).

### Tipos auxiliares exportados

`SgAvatarCustomColors`: `bg?`, `fg?`, `border?`, `ring?` (todas `string`, viram variáveis `--sg-avatar-*`). `SgAvatarSeverity`, `SgAvatarShape`, `SgAvatarSize`: valores na tabela.

## SgAvatarGroup

Agrupa avatares sobrepostos com contador de excedentes. Fonte: `src/commons/SgAvatar.tsx` → `SgAvatarGroup` (`React.forwardRef`).

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | — | Sim | Lista de avatares exibidos no agrupamento. |
| `max` | `number` | — | Não | Quantidade maxima de avatares visiveis antes do contador de overflow. |
| `total` | `number` | `?? avatars.length` ᶠ | Não | Quantidade total de participantes para calculo do overflow (usa o maior entre `total` e o nº de filhos). |
| `overlap` | `SgAvatarGroupOverlap` = `"sm" \| "md" \| "lg" \| "none"` | `"md"` | Não | Nivel de sobreposicao entre os avatares. |
| `moreSeverity` | `SgAvatarSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "danger" \| "neutral" \| "custom"` | `"neutral"` | Não | Severidade do avatar contador `+N` de excedentes. *(Inferência)* |
| `moreLabel` | `(remaining: number) => React.ReactNode` | `+N` ᶠ | Não | Função que gera o conteúdo do avatar de excedentes a partir da quantidade oculta. |
| `size` | `SgAvatarSize` = `"sm" \| "md" \| "lg" \| "xs" \| "xl"` | `"md"` | Não | Tamanho do avatar contador `+N`. Não é propagado aos filhos — defina `size` em cada `SgAvatar`. *(Inferência)* |
| `shape` | `SgAvatarShape` = `"square" \| "circle"` | `"circle"` | Não | Forma do avatar contador `+N` (não propagada aos filhos). *(Inferência)* |
| `bordered` | `boolean` | `true` | Não | Borda do avatar contador `+N` (não propagada aos filhos). *(Inferência)* |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.
- Aceita `ref` (via `React.forwardRef`) e `key`.

### Eventos e callbacks

Nenhum próprio; eventos DOM herdados vão para o `<div>` raiz via `{...rest}`.

### Ref

`React.forwardRef<HTMLDivElement, SgAvatarGroupProps>` → `<div>` raiz.

### Children, slots e composição

- `children` (obrigatório): normalmente `SgAvatar`. Exibe os primeiros `max` (inteiro > 0); os ocultos = `max(total ?? nº filhos, nº filhos) − visíveis`.
- O contador é um `SgAvatar` com `label` `+N` (ou `moreLabel(N)`), `moreSeverity`, `size`, `shape`, `bordered`. Essas três últimas **não** são propagadas aos filhos (Confirmado).
- `overlap` aplica margem negativa (`none`, `sm`, `md`, `lg`) a partir do 2º item.

### Acessibilidade

Sem role de grupo; cada `SgAvatar` mantém seu `aria-label`.

`SgAvatarGroupOverlap`: valores na tabela.

## SgBadge

Indicador/etiqueta com severidade, variantes, contador, ponto, ícones e remoção. Fonte: `src/commons/SgBadge.tsx` → `SgBadge` (função, sem forwardRef).

### Import

```tsx
import {
  SgBadge,
  type SgBadgeProps, type SgBadgeSeverity, type SgBadgeVariant, type SgBadgeSize,
  type SgBadgeCustomColors, type SgBadgePartsClassName
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `React.ReactNode` | — | Não | Conteudo principal exibido dentro do badge. |
| `severity` | `SgBadgeSeverity` = `"primary" \| "secondary" \| "success" \| "info" \| "warning" \| "danger" \| "neutral" \| "custom"` | `"primary"` | Não | Tom semantico do indicador. |
| `badgeStyle` | `SgBadgeVariant` = `"solid" \| "outline" \| "ghost" \| "soft"` | `"solid"` | Não | Variante visual do badge. |
| `size` | `SgBadgeSize` = `"sm" \| "md" \| "lg" \| "xs"` | `"md"` | Não | Escala visual do badge. |
| `rounded` | `boolean` | `true` | Não | Formato pílula (`rounded-full`) ou cantos `rounded-md`. |
| `dot` | `boolean` | `false` | Não | Exibe um pequeno marcador visual adicional. |
| `pulse` | `boolean` | `false` | Não | Animação de pulso (somente com `dot`). |
| `max` | `number` | — | Não | Para `value` numérico: acima de `max` exibe `max+` (ex.: `99+`). *(Inferência)* |
| `showZero` | `boolean` | `true` | Não | Para `value` numérico `0`: se `false`, o badge não é renderizado (salvo ícones/removable). |
| `leftIcon` | `React.ReactNode` | — | Não | Ícones opcionais. |
| `rightIcon` | `React.ReactNode` | — | Não | Ícones opcionais. |
| `removable` | `boolean` | `false` | Não | Permite remover o badge com um botao interno. |
| `onRemove` | `() => void` | — | Não | Callback disparado ao remover o badge. |
| `removeAriaLabel` | `string` | texto i18n `components.badge.remove` ᶠ | Não | `aria-label` do botão interno de remover. *(Inferência)* |
| `autoRemove` | `boolean` | `false` | Não | Comportamento de remoção. |
| `onClick` | `(e: React.MouseEvent) => void` | — | Não | Callback de clique; quando informado o badge é renderizado como `<button>`. |
| `disabled` | `boolean` | — | Não | Desabilita o badge clicável (só tem efeito quando `onClick` é informado). |
| `title` | `string` | — | Não | Atributo `title` do badge (usado se `hint` não for informado). |
| `hint` | `string` | `?? title` ᶠ | Não | Texto de dica (atributo `title`); tem prioridade sobre `title`. |
| `customColors` | `SgBadgeCustomColors` | — | Não | Customização visual avançada. |
| `className` | `string` | — | Não | Customização visual avançada. |
| `style` | `React.CSSProperties` | — | Não | Customização visual avançada. |
| `partsClassName` | `SgBadgePartsClassName` | — | Não | Customização visual avançada. |
| `aria-label` | `string` | — | Não | Repassado ao elemento raiz (via `...aria`). *(Inferência)* |
- Tipo fechado (sem herança de atributos DOM); props não listadas acima são repassadas só se chegarem pelo resto `...aria` (na prática, `aria-label`).

### Eventos e callbacks

- `onClick(e: React.MouseEvent)` — torna o badge um `<button type="button">`; ignorado com `disabled`.
- `onRemove()` — clique no botão interno `x` (com `stopPropagation`). Com `autoRemove`, o badge se oculta sozinho após o callback; sem ele, o pai deve removê-lo.

### Ref

Não aceita `ref`.

### Children, slots e composição

Sem `children`; conteúdo via `value`, `leftIcon`, `rightIcon`. Regras (Confirmado):
- `dot` renderiza só um ponto (com `pulse` opcional) e ignora `value`/ícones.
- `value` numérico: `> max` → `` `${max}+` ``; `0` com `showZero={false}` → oculto.
- Sem valor, ícones nem `removable`, não renderiza nada.
- `partsClassName` aplica classes em `container`, `label`, `removeButton`, `dot`.

### Contexto, providers e hooks

`useComponentsI18n()` para `removeAriaLabel` padrão (`components.badge.remove`).

### Acessibilidade

- Não clicável: `role="status"` no `<span>`. Clicável: `<button>` nativo.
- Botão remover: `aria-label` traduzido ou `removeAriaLabel` (Confirmado; testado em `tests/commons.test.mjs`).
- `hint ?? title` vira o atributo `title`.

### Tipos auxiliares exportados

`SgBadgeCustomColors` (todas `string?`, viram `--sg-badge-*`): `bg`, `fg`, `border`, `softBg`, `softFg`, `hoverBg`, `hoverFg`, `hoverBorder`, `ring`.

`SgBadgePartsClassName`: `container?`, `label?`, `removeButton?`, `dot?` (`string`).

## SgBadgeOverlay

Sobrepõe um badge a um elemento base. Fonte: `src/commons/SgBadgeOverlay.tsx` → `SgBadgeOverlay`.

### Import

```tsx
import { SgBadgeOverlay, type SgBadgeOverlayProps, type SgBadgeOverlayPlacement } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `children` | `React.ReactNode` | — | Sim | Elemento base que recebera o badge sobreposto. |
| `badge` | `React.ReactNode` | — | Sim | Conteudo do indicador exibido sobre o elemento base. |
| `placement` | `SgBadgeOverlayPlacement` = `"top" \| "right" \| "bottom" \| "left" \| "top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | Não | Posicao do badge sobreposto. |
| `className` | `string` | — | Não | Classes CSS extras aplicadas ao wrapper `relative inline-flex`. *(Inferência)* |
| `style` | `React.CSSProperties` | — | Não | Inline style aplicado ao wrapper. |

### Eventos, ref e composição

Sem callbacks e sem `ref`. Renderiza `<span class="relative inline-flex">{children}<span class="absolute …">{badge}</span></span>`; `badge` costuma ser um `SgBadge` (qualquer `ReactNode` serve). `placement` controla a posição por classes de translate.

### Acessibilidade

Nenhum atributo próprio; depende do conteúdo de `children` e `badge`.

## SgSkeleton

Placeholder de carregamento. Fonte: `src/commons/SgSkeleton.tsx` → `SgSkeleton`.

### Import

```tsx
import { SgSkeleton, type SgSkeletonProps, type SgSkeletonShape, type SgSkeletonAnimation } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `width` | `number \| string` | `100%`, ou `2.5rem` para `square`/`circle` ᶠ | Não | Largura do placeholder. |
| `height` | `number \| string` | `1rem` (`text`), `2rem` (`rectangle`/`rounded`), `2.5rem` (`square`/`circle`) ᶠ | Não | Altura do placeholder. |
| `size` | `number \| string` | — | Não | Tamanho unico para placeholders quadrados ou circulares; quando informado substitui `width` e `height`. |
| `borderRadius` | `number \| string` | por `shape` ᶠ: `circle`/`text` `9999px`, `square` `0`, `rounded` `0.75rem`, `rectangle` `0.375rem` | Não | Raio de borda customizado (número = px). |
| `shape` | `SgSkeletonShape` = `"rounded" \| "square" \| "circle" \| "text" \| "rectangle"` | `"text"` | Não | Forma visual base do placeholder. |
| `animation` | `SgSkeletonAnimation` = `"none" \| "pulse" \| "wave"` | `"wave"` | Não | Animacao aplicada ao placeholder. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.
- Números em `width`/`height`/`size`/`borderRadius` viram `px`. `style` é aplicado por último; demais atributos vão ao `<div>` via `{...rest}` (Confirmado).

### Eventos, ref e composição

Sem callbacks próprios, sem `ref`, sem `children` (omitido do tipo). `animation="wave"` usa Web Animations API (`element.animate`, 1300 ms, infinito); `pulse` usa a classe `animate-pulse`.

### Acessibilidade

A camada de onda tem `aria-hidden="true"`; o placeholder em si não declara `aria-busy`/`role` — sinalize o carregamento no container (Confirmado: sem atributos ARIA no `<div>`).

## SgToaster

Pilha de toasts fixa na tela, alimentada pela API imperativa `toast`. Fonte: `src/commons/SgToaster.tsx` → `SgToaster`.

### Import

```tsx
import {
  SgToaster, toast, dismissSgToast, subscribeSgToasts,
  type SgToasterProps, type SgToasterPosition, type SgToasterTypeColors, type SgToasterCustomColors
} from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `position` | `SgToasterPosition` = `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right" \| "top-center" \| "bottom-center"` | `"top-right"` | Não | Posicao global do stack de toasts. |
| `duration` | `number` | `4000` | Não | Duracao padrao dos toasts em milissegundos. |
| `visibleToasts` | `number` | `6` | Não | Quantidade maxima de toasts visiveis simultaneamente. |
| `closeButton` | `boolean` | `true` | Não | Exibe botao de fechar em cada toast. |
| `richColors` | `boolean` | `true` | Não | Ativa paleta visual rica por tipo de toast. |
| `transparency` | `number` | `0` | Não | Nivel de transparencia aplicado aos toasts. |
| `rounded` | `boolean` | `true` | Não | Arredonda os cantos de cada toast (rounded-md). Desligue para cantos retos. |
| `customColors` | `SgToasterCustomColors` | — | Não | Sobrescreve bg/fg/border por tipo. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.
- `className`/`style` e demais atributos vão para o `<div>` container (`fixed z-[1100]`) via `{...rest}` (Confirmado).

### Comportamento (Confirmado)

- Assina o store global (`subscribeSgToasts`) e mostra os **últimos** `visibleToasts` (≤ 0 → nenhum).
- Fechamento automático por toast: `toast.duration ?? duration`; `≤ 0` não expira; toasts `loading` nunca expiram.
- `closeButton` por toast sobrepõe a prop. Botão de `action` executa `onClick` e fecha o toast.
- `richColors` escolhe a paleta forte por tipo; `customColors[tipo]` sobrepõe `bg`/`fg`/`border`. `transparency` (0–100) vira `opacity = 1 − t/100`.
- Se existir qualquer `SgToastHost` montado, o `SgToaster` não renderiza nada (cede ao host).

### Ref e composição

Sem `ref` e sem `children`. Monte um `SgToaster` (ou `SgToastHost`) uma vez na árvore e dispare com `toast(...)`.

### Acessibilidade

Cada toast: `role="status"` + `aria-live="polite"`; botão fechar com `aria-label` traduzido (`components.toaster.close`). Sem foco automático nem atalho de teclado.

### Tipos auxiliares exportados

- `SgToasterTypeColors`: `bg?`, `fg?`, `border?` (`string`).
- `SgToasterCustomColors`: `Partial<Record<SgToastType, SgToasterTypeColors>>`.

## SgToastHost

Marca o ponto da árvore onde os toasts aparecem; resolve múltiplos hosts por pilha. Fonte: `src/commons/SgToastHost.tsx` → `SgToastHost`.

### Import

```tsx
import { SgToastHost, type SgToastHostProps } from "@seedgrid/fe-components";
```

### Props

`SgToastHostProps = SgToasterProps` — mesmas props do `SgToaster`, repassadas integralmente (`<SgToaster {...props} />`).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `position` | `SgToasterPosition` = `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right" \| "top-center" \| "bottom-center"` | `"top-right"` ᵇ | Não | Posicao dos toasts renderizados por este host. |
| `duration` | `number` | `4000` ᵇ | Não | Duracao padrao aplicada aos toasts deste host. |
| `visibleToasts` | `number` | `6` ᵇ | Não | Quantidade maxima de toasts visiveis. |
| `closeButton` | `boolean` | `true` ᵇ | Não | Exibe o botao de fechar em cada toast. |
| `richColors` | `boolean` | `true` ᵇ | Não | Usa uma paleta forte por severidade. |
| `transparency` | `number` | `0` ᵇ | Não | Nivel de transparencia aplicado aos toasts. |
| `rounded` | `boolean` | `true` ᵇ | Não | Arredonda os cantos de cada toast (rounded-md). Desligue para cantos retos. |
| `customColors` | `SgToasterCustomColors` | — | Não | Sobrescreve bg/fg/border por tipo. |

- Props declaradas em `SgToasterProps` (contrato reutilizado): `position`, `duration`, `visibleToasts`, `closeButton`, `richColors`, `transparency`, `rounded`, `customColors`.
- **Atributos DOM herdados**: o tipo é `SgToasterProps` (alias), que por sua vez é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

### Comportamento (Confirmado — JSDoc e código)

- Cada instância gera um id (`nextHostId()`) e se registra no `sgToastHostRegistry` ao montar; o host ativo é o **último montado**; ao desmontar, o anterior volta a ser ativo.
- Só o host ativo renderiza (um `SgToaster` dentro do contexto interno `SgToasterHostContext`, que pula a checagem de host). Começa inativo para evitar divergência de hidratação SSR.
- Com qualquer host presente, `SgToaster` "solto" deixa de renderizar.

Sem `ref`, sem `children`. Acessibilidade idêntica à do `SgToaster`.

## SgWhistler

Lista de avisos ("whistles") **no fluxo do layout** (não é fixa), alimentada pela API `sgWhistle`. Fonte: `src/commons/SgWhistler.tsx` → `SgWhistler`.

### Import

```tsx
import { SgWhistler, sgWhistle, dismissSgWhistle, subscribeSgWhistles, type SgWhistlerProps } from "@seedgrid/fe-components";
```

### Props

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `max` | `number` | `4` | Não | Quantidade maxima de whistle items visiveis. |
| `newestOnTop` | `boolean` | `false` | Não | Inverte a ordem visual para mostrar os mais novos primeiro. |
| `gap` | `number` | `12` | Não | Espacamento entre os avisos renderizados. |
| `duration` | `number` | `4000` | Não | Duracao padrao, em milissegundos, dos whistles deste host. Cada whistle pode sobrescrever com `options.duration`, que tem PRIORIDADE. Use 0 (ou negativo) para que nada suma sozinho por padrao. Whistle `loading` nunca expira, qualquer que seja o valor. Espelha o `duration` do SgToaster/SgToastHost — mesmo default e mesma precedencia. Antes o valor era fixo no codigo e nao havia como mudar o padrao sem repetir `duration` em toda chamada de sgWhistle. |
| `rounded` | `boolean` | `true` | Não | Arredonda os cantos de cada whistle (rounded-lg). Desligue para cantos retos. |
| `customColors` | `Partial<Record<SgWhistleSeverity, SgWhistleColors>>` | — | Não | Sobrescreve as cores contextuais por severidade. |

- **Atributos DOM herdados**: o tipo é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.
- O tipo das cores `SgWhistleColors` (`{ bg: string; fg: string; border: string }`, todos obrigatórios) é **interno** (não exportado).
- `className`/`style` e demais atributos vão para o `<div class="flex flex-col">` via `{...rest}`; `gap` vira `style.gap`.

### Comportamento (Confirmado)

- Mostra os últimos `max` whistles (≤ 0 → nenhum); `newestOnTop` inverte a ordem.
- Expiração: `whistle.duration ?? duration`; `≤ 0` não expira; `loading` nunca expira.
- `dismissible` (padrão `true` por whistle) mostra o botão fechar; `action` executa `onClick` e fecha.
- Conteúdo: `renderer` (de `sgWhistle.custom`) ou `title` + `message`; `icon` à esquerda. `borderStyle` (`solid` padrão, `soft`, `left-accent`, `full-accent`, `none`) e `opacity` (0–1) por whistle.
- Cede a vez a um `SgWhistleHost` montado (mesma lógica do toaster).

### Acessibilidade

Cada whistle: `role="status"` + `aria-live="polite"`; botão fechar com `aria-label` traduzido (`components.whistler.close`).

## SgWhistleHost

Equivalente ao `SgToastHost` para whistles. Fonte: `src/commons/SgWhistleHost.tsx` → `SgWhistleHost`. `SgWhistleHostProps = SgWhistlerProps` (repassadas a `<SgWhistler {...props} />`).

```tsx
import { SgWhistleHost, type SgWhistleHostProps } from "@seedgrid/fe-components";
```

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `max` | `number` | `4` ᵇ | Não | Quantidade maxima de whistle items visiveis neste host. |
| `newestOnTop` | `boolean` | `false` ᵇ | Não | Inverte a ordem visual para mostrar os mais novos primeiro. |
| `gap` | `number` | `12` ᵇ | Não | Espacamento entre os avisos renderizados. |
| `duration` | `number` | `4000` ᵇ | Não | Duracao padrao, em milissegundos, dos whistles deste host. Cada whistle pode sobrescrever com `options.duration`, que tem PRIORIDADE. Use 0 (ou negativo) para que nada suma sozinho por padrao. Whistle `loading` nunca expira, qualquer que seja o valor. Espelha o `duration` do SgToaster/SgToastHost — mesmo default e mesma precedencia. Antes o valor era fixo no codigo e nao havia como mudar o padrao sem repetir `duration` em toda chamada de sgWhistle. |
| `rounded` | `boolean` | `true` ᵇ | Não | Arredonda os cantos de cada whistle (rounded-lg). Desligue para cantos retos. |
| `customColors` | `Partial<Record<SgWhistleSeverity, SgWhistleColors>>` | — | Não | Sobrescreve as cores contextuais por severidade. |

- Props declaradas em `SgWhistlerProps` (contrato reutilizado): `max`, `newestOnTop`, `gap`, `duration`, `rounded`, `customColors`.
- **Atributos DOM herdados**: o tipo é `SgWhistlerProps` (alias), que por sua vez é `Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { ... }`; acrescenta 277 props de `@types/react` (`HTMLAttributes` 55, `AriaAttributes` 53, `DOMAttributes` 169). Não listadas individualmente — ver contrato base `React.HTMLAttributes` em `@types/react`.

Registro em `src/commons/sgWhistleHostRegistry.ts` (funções `registerWhistleHost`, `unregisterWhistleHost`, `getActiveWhistleHostId`, `hasAnyWhistleHost`, `subscribeWhistleHostRegistry`, `nextWhistleHostId` — **internas**, não exportadas no barrel). Último host montado vence; renderiza dentro de `SgWhistlerHostContext` (interno). Testado em `tests/commons-dom.test.mjs`.

## API imperativa de toasts (`src/commons/SgToast.ts`)

Store global em módulo (lista + listeners); funciona fora de componentes. Ids gerados: `sg-toast-<timestamp>-<n>`.

### `toast` (`SgToastFn`)

| Chamada | Assinatura | Retorno | Comportamento |
|---|---|---|---|
| `toast(title?, options?)` | `(title?: React.ReactNode, options?: SgToastOptions) => SgToastId` | id | tipo `default` |
| `toast.message` | idem | id | tipo `default` |
| `toast.success` / `.info` / `.warning` / `.error` / `.loading` | idem | id | tipo correspondente (`loading` não expira) |
| `toast.custom` | `(renderer: React.ReactNode \| ((id: SgToastId) => React.ReactNode), options?) => SgToastId` | id | renderiza o nó como `title` de um toast `default` |
| `toast.dismiss` | `(id?: SgToastId) => void` | — | igual a `dismissSgToast` |
| `toast.promise` | `<T>(promiseOrFactory: Promise<T> \| (() => Promise<T>), messages: SgToastPromiseMessages<T>, options?) => Promise<T>` | a própria promessa | mostra `loading` (texto i18n `components.toast.loading` se omitido); no sucesso/erro **atualiza o mesmo id** para `success`/`error`, ou fecha se a mensagem correspondente for omitida; relança o erro |

Passar `options.id` existente atualiza (merge) o toast em vez de criar outro (Confirmado: `upsertToast`).

### Funções

| Função | Assinatura | Comportamento |
|---|---|---|
| `dismissSgToast` | `(id?: SgToastId) => void` | sem id fecha todos; com id remove aquele |
| `subscribeSgToasts` | `(listener: (toasts: SgToastRecord[]) => void) => () => void` | chama o listener imediatamente com o snapshot atual e a cada mudança; retorna a função de cancelamento |

### Tipos exportados

| Tipo | Definição |
|---|---|
| `SgToastId` | `string` |
| `SgToastType` | `"default" \| "success" \| "info" \| "warning" \| "error" \| "loading"` |
| `SgToastAction` | `{ label: React.ReactNode; onClick?: () => void }` |
| `SgToastOptions` | `{ id?: SgToastId; description?: React.ReactNode; duration?: number; action?: SgToastAction; closeButton?: boolean; className?: string; style?: React.CSSProperties }` |
| `SgToastRecord` | `Omit<SgToastOptions, "id"> & { id: SgToastId; type: SgToastType; title?: React.ReactNode; createdAt: number }` |
| `SgToastPromiseMessages<T>` | `{ loading?: React.ReactNode; success?: React.ReactNode \| ((value: T) => React.ReactNode); error?: React.ReactNode \| ((error: unknown) => React.ReactNode) }` |
| `SgToastFn` | tipo da função `toast` (tabela acima) |

### Registro de hosts de toast (exportado)

`src/commons/sgToastHostRegistry.ts` — pilha global de ids usada por `SgToastHost`/`SgToaster`. Exportadas no barrel (uso avançado/testes):

| Função | Assinatura | Comportamento |
|---|---|---|
| `registerHost` | `(id: string) => void` | empilha (ignora duplicado) e notifica |
| `unregisterHost` | `(id: string) => void` | remove e notifica |
| `getActiveHostId` | `() => string \| null` | topo da pilha |
| `hasAnyHost` | `() => boolean` | pilha não vazia |
| `subscribeHostRegistry` | `(fn: () => void) => () => void` | listener de mudanças; retorna cancelamento |
| `nextHostId` | `() => string` | `sg-toast-host-<n>` |

Testado em `tests/commons.test.mjs` ("toast host registry …").

## API imperativa de whistles (`src/commons/SgWhistle.ts`)

Store global análogo; ids `sg-whistle-<timestamp>-<n>`. `onClose` do whistle é chamado quando ele é removido (por `dismiss`, expiração, ação ou botão fechar).

### `sgWhistle` (tipo interno `SgWhistleApi`)

| Método | Assinatura | Comportamento |
|---|---|---|
| `show` | `(options: SgWhistleOptions) => SgWhistleId` | severidade `options.severity ?? "default"` |
| `success` / `info` / `warning` / `error` / `loading` | `(options: SgWhistleOptions) => SgWhistleId` | força a severidade |
| `dismiss` | `(id?: SgWhistleId) => void` | igual a `dismissSgWhistle` |
| `update` | `(id: SgWhistleId, options: Partial<SgWhistleOptions>) => SgWhistleId` | merge no whistle existente (mantém `createdAt`); id inexistente → no-op |
| `custom` | `(renderer: React.ReactNode \| ((id) => React.ReactNode), options?: SgWhistleCustomOptions) => SgWhistleId` | conteúdo livre (`renderer`) |
| `promise` | `<T>(promiseOrFactory, states: SgWhistlePromiseStates<T>, options?: Omit<Partial<SgWhistleOptions>, "id" \| "severity" \| "message">) => Promise<T>` | `loading` → `update` para `success`/`error` no mesmo id, ou fecha se o estado for omitido; relança o erro |

### Funções

| Função | Assinatura | Comportamento |
|---|---|---|
| `dismissSgWhistle` | `(id?: SgWhistleId) => void` | sem id remove todos (chamando `onClose` de cada) |
| `subscribeSgWhistles` | `(listener: (whistles: SgWhistleRecord[]) => void) => () => void` | snapshot imediato + mudanças; retorna cancelamento |

### Tipos exportados

| Tipo | Definição |
|---|---|
| `SgWhistleId` | `string` |
| `SgWhistleSeverity` | `"default" \| "success" \| "info" \| "warning" \| "error" \| "loading"` |
| `SgWhistleBorderStyle` | `"solid" \| "soft" \| "left-accent" \| "full-accent" \| "none"` |
| `SgWhistleAction` | `{ label: string; onClick: () => void }` |
| `SgWhistleOptions` | `{ id?: string; severity?: SgWhistleSeverity; title?: string; message: string; icon?: React.ReactNode; duration?: number; dismissible?: boolean; borderStyle?: SgWhistleBorderStyle; opacity?: number; action?: SgWhistleAction; className?: string; style?: React.CSSProperties; onClose?: () => void }` (`message` obrigatório) |
| `SgWhistleCustomOptions` | `Omit<Partial<SgWhistleOptions>, "message"> & { message?: string }` |
| `SgWhistleRecord` | `Omit<SgWhistleCustomOptions, "id"> & { id: SgWhistleId; severity: SgWhistleSeverity; createdAt: number; renderer?: React.ReactNode }` |
| `SgWhistlePromiseStates<T>` | `{ loading?: …&{message: string}; success?: estado \| ((value: T) => estado); error?: estado \| ((error: unknown) => estado) }`, onde estado = `Omit<Partial<SgWhistleOptions>, "id" \| "severity"> & { message: string }` |

Testado em `tests/commons.test.mjs` (`sgWhistle.promise`, `sgWhistle.update`, `onClose`) e `tests/commons-dom.test.mjs`.
