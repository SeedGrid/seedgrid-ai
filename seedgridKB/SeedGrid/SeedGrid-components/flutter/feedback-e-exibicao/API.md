---
description: "API Flutter de Feedback e exibição: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, feedback-e-exibicao, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Feedback e exibição (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API|API — Feedback e exibição (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgAvatar

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgAvatar` (mesmo nome).

Representacao visual compacta de pessoa, usuario ou entidade por imagem, iniciais, icone ou fallback.

- Arquivo: `packages/seedgrid_components/lib/src/commons/sg_avatar.dart` (linha 66) · classe `class SgAvatar extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_avatar.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgAvatar({...})` com 18 parâmetro(s) nomeado(s), 14 do contrato React e 4 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgAvatar

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `src` | `String?` | — | não | React | URL da imagem principal do avatar. |
| `alt` | `String?` | — | não | React | Texto alternativo da imagem do avatar. |
| `label` | `Widget?` | — | não | React | Conteudo textual usado como iniciais ou identificacao visual. |
| `icon` | `Widget?` | — | não | React | — |
| `fallback` | `Widget?` | — | não | React | Conteudo de fallback quando nao ha imagem. |
| `size` | `SgAvatarSize` | `SgAvatarSize.md` | não | React | Escala visual do avatar. Valores: `sm`, `md`, `lg`, `xs`, `xl`. |
| `shape` | `SgAvatarShape` | `SgAvatarShape.circle` | não | React | Forma visual do avatar. Valores: `circle`, `square`. |
| `severity` | `SgAvatarSeverity` | `SgAvatarSeverity.primary` | não | React | Tom visual do avatar quando nao ha imagem. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `custom`. |
| `bordered` | `bool` | `true` | não | React | — |
| `disabled` | `bool` | `false` | não | React | — |
| `customColors` | `SgAvatarCustomColors?` | — | não | React | Tipo no React: `SgAvatarCustomColors`. |
| `imageClassName` | `String?` | — | não | React | className da imagem (React-only, ADR 50). Ignorado. |
| `child` | `Widget?` | — | não | React | `children` no React (tem precedencia sobre imagem, icone e label). |
| `onImageError` | `void Function(Object error)?` | — | não | React | Chamado quando a imagem falha ao carregar (o avatar cai no icone/label/fallback). Tipo no React: `((event: React.SyntheticEvent<HTMLImageElement, Event>) => void)`. |
| `onClick` | `VoidCallback?` | — | não | Flutter | Com `onClick` o avatar e interativo (focavel, cursor de mao), como no React. |
| `title` | `String?` | — | não | Flutter | — |
| `semanticLabel` | `String?` | — | não | Flutter | `aria-label` no React. |
| `imageProvider` | `ImageProvider?` | — | não | Flutter | Imagem pronta (ex.: `AssetImage`); tem precedencia sobre [src]. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- `imageClassName` é aceito e ignorado (sem `className` no Dart; ADR 50), como informa o comentário da prop em `commons/sg_avatar.dart`.
- Extras do Flutter: `onClick`, `title`, `semanticLabel` e `imageProvider` (imagem pronta, como `AssetImage`, com precedência sobre `src`).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/commons/sg_avatar.dart`, classe `_SgAvatarState`)
- `onClick: VoidCallback?`: com ele o avatar fica interativo (cursor de mão, `Focus`, `GestureDetector.onTap`). Não dispara com `disabled: true`.
- `onImageError: void Function(Object error)?`: chamado uma vez, depois do quadro em que a imagem falhou (`errorBuilder` + `addPostFrameCallback`); em seguida o avatar cai para ícone, label ou fallback.

**Controller, formulário e estado**: sem controller e sem ligação com `SgForm`. O estado interno é só `_imageFailed` e o foco visual.

**Acessibilidade** (Confirmado)
- `Semantics(label, button: interactive, enabled, image: showImage)`. O rótulo é `semanticLabel`, senão o texto de `label` quando `label` é um `Text`, senão `alt`, senão o texto i18n `components.avatar.defaultAlt`.
- `title` vira `Tooltip`. Com `onClick`, o foco por teclado desenha um anel (`BoxShadow` na cor `ring`).

## SgAvatarGroup

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgAvatarGroup` (mesmo nome).

Agrupamento visual de avatares com sobreposicao, limite de itens e contador de participantes restantes.

- Arquivo: `packages/seedgrid_components/lib/src/commons/sg_avatar.dart` (linha 297) · classe `class SgAvatarGroup extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_avatar_group.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgAvatarGroup({...})` com 9 parâmetro(s) nomeado(s), 8 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgAvatarGroup

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `children` | `List<Widget>` | — | sim | Flutter | Os avatares (no React, `children`). |
| `max` | `num?` | — | não | React | Quantidade maxima de avatares visiveis antes do contador de overflow. |
| `total` | `num?` | — | não | React | Quantidade total de participantes para calculo do overflow. |
| `overlap` | `SgAvatarGroupOverlap` | `SgAvatarGroupOverlap.md` | não | React | Nivel de sobreposicao entre os avatares. Valores: `none`, `sm`, `md`, `lg`. |
| `moreSeverity` | `SgAvatarSeverity` | `SgAvatarSeverity.neutral` | não | React | Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `custom`. |
| `moreLabel` | `Widget Function(int remaining)?` | — | não | React | `(remaining) => ReactNode` do React. Tipo no React: `((remaining: number) => React.ReactNode)`. |
| `size` | `SgAvatarSize` | `SgAvatarSize.md` | não | React | Escala aplicada aos avatares do grupo. Valores: `sm`, `md`, `lg`, `xs`, `xl`. |
| `shape` | `SgAvatarShape` | `SgAvatarShape.circle` | não | React | Forma visual aplicada ao grupo de avatares. Valores: `circle`, `square`. |
| `bordered` | `bool` | `true` | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- O `children` do React é o parâmetro `children: List<Widget>` (obrigatório) no Dart; o getter `child` do contrato devolve uma `Row` com eles.
- O avatar de overflow (`+N`) recebe o texto inteiro em `child` e não em `label`, para não cortar em 2 letras como o React faz (comentário em `commons/sg_avatar.dart`: o padrão `+18` viraria `+1` no React; defeito do React só registrado).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum callback próprio. `moreLabel: Widget Function(int remaining)?` personaliza o conteúdo do contador de overflow; recebe a quantidade de avatares ocultos (Confirmado em `packages/seedgrid_components/lib/src/commons/sg_avatar.dart`, `SgAvatarGroup.build`).

**Controller, formulário e estado**: `StatelessWidget`, sem controller. Mostra os `max` primeiros; `total` (se maior que `children.length`) entra no cálculo do contador. A sobreposição usa um `RenderBox` próprio (`_OverlapRow`), pois `Row` não aceita margem negativa.

**Acessibilidade**: Nenhum `Semantics` explícito encontrado em `commons/sg_avatar.dart (SgAvatarGroup)`; não confirmado se o widget Material interno já expõe a semântica. Cada `SgAvatar` filho e o avatar de overflow expõem a própria `Semantics` (ver `SgAvatar`); o avatar de overflow é criado sem `semanticLabel` (Inferência a partir do código), então seu rótulo cai no texto i18n padrão de `SgAvatar`.

## SgBadge

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgBadge` (mesmo nome).

Indicador compacto para status, contagens, rotulos curtos e destaque visual de pequenos estados.

- Arquivo: `packages/seedgrid_components/lib/src/commons/sg_badge.dart` (linha 97) · classe `class SgBadge extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_badge.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgBadge({...})` com 23 parâmetro(s) nomeado(s), 22 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgBadge

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `Widget?` | — | não | React | Conteudo principal exibido dentro do badge. |
| `count` | `num?` | — | não | Flutter | Forma numerica de `value` (no React `value={5}`): aplica `max` ("99+") e `showZero`. `value` tem precedencia quando os dois vierem. |
| `severity` | `SgBadgeSeverity` | `SgBadgeSeverity.primary` | não | React | Tom semantico do indicador. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `custom`. |
| `badgeStyle` | `SgBadgeBadgeStyle` | `SgBadgeBadgeStyle.solid` | não | React | Variante visual do badge. Valores: `solid`, `soft`, `outline`, `ghost`. |
| `size` | `SgBadgeSize` | `SgBadgeSize.md` | não | React | Escala visual do badge. Valores: `sm`, `md`, `lg`, `xs`. |
| `rounded` | `bool` | `true` | não | React | — |
| `dot` | `bool` | `false` | não | React | Exibe um pequeno marcador visual adicional. |
| `pulse` | `bool` | `false` | não | React | — |
| `max` | `num?` | — | não | React | — |
| `showZero` | `bool` | `true` | não | React | — |
| `leftIcon` | `Widget?` | — | não | React | — |
| `rightIcon` | `Widget?` | — | não | React | — |
| `removable` | `bool` | `false` | não | React | Permite remover o badge com um botao interno. |
| `onRemove` | `VoidCallback?` | — | não | React | Callback disparado ao remover o badge. Tipo no React: `(() => void)`. |
| `removeAriaLabel` | `String?` | — | não | React | — |
| `autoRemove` | `bool` | `false` | não | React | — |
| `onClick` | `VoidCallback?` | — | não | React | Callback disparado quando o badge e clicado. Tipo no React: `((e: React.MouseEvent) => void)`. |
| `disabled` | `bool?` | — | não | React | — |
| `title` | `String?` | — | não | React | — |
| `hint` | `String?` | — | não | React | — |
| `customColors` | `SgBadgeCustomColors?` | — | não | React | Tipo no React: `SgBadgeCustomColors`. |
| `partsClassName` | `Object?` | — | não | React | className por parte (React-only, ADR 50). Ignorado. Tipo no React: `SgBadgePartsClassName`. |
| `semanticLabel` | `String?` | — | não | React | `aria-label` no React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- `partsClassName` é aceito e ignorado (ADR 50).
- Extras do Flutter: `count` (forma numérica de `value`; aplica `max` e `showZero`; `value` vence quando os dois vêm) e `semanticLabel` (o `aria-label` do React).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/commons/sg_badge.dart`, `_SgBadgeState.build`)
- `onClick: VoidCallback?`: transforma o badge em botão (cursor de mão, `Focus`, toque). Não dispara se `disabled`.
- `onRemove: VoidCallback?`: disparado ao tocar o "x" quando `removable: true`. Com `autoRemove: true` o badge também se esconde sozinho (`_autoRemoved`).

**Controller, formulário e estado**: sem controller nem formulário. `pulse` usa um `AnimationController` interno (ciclo de 1 s) no modo `dot`.

**Acessibilidade** (Confirmado)
- `Semantics(button: isButton, enabled, liveRegion: !isButton, label: semanticLabel)`: badge não clicável é uma região viva; clicável é botão.
- O botão de remover tem `Semantics(button: true, label: removeAriaLabel ?? i18n 'components.badge.remove')`.
- `hint` (ou `title`) vira `Tooltip`. O modo `dot` também usa `Semantics(label: semanticLabel)`.

## SgBadgeOverlay

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgBadgeOverlay` (mesmo nome).

Wrapper para sobrepor badges e indicadores compactos sobre avatares, icones e outros elementos visuais.

- Arquivo: `packages/seedgrid_components/lib/src/commons/sg_badge_overlay.dart` (linha 8) · classe `class SgBadgeOverlay extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_badge_overlay.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgBadgeOverlay({...})` com 3 parâmetro(s) nomeado(s), 3 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgBadgeOverlay

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `child` | `Widget` | — | sim | React | Elemento base que recebera o badge sobreposto. |
| `badge` | `Widget` | — | sim | React | Conteudo do indicador exibido sobre o elemento base. |
| `placement` | `SgBadgeOverlayPlacement` | `SgBadgeOverlayPlacement.topRight` | não | React | Posicao do badge sobreposto. Valores: `top`, `left`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `right`, `bottom`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- `children` do React vira `child`; `className` e `style` não existem (ADR 50; comentário em `commons/sg_badge_overlay.dart`).
- O selo recebe restrição livre e pode passar da borda do filho (equivale ao `position: absolute` do React), sem erro de overflow.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum. `child` e `badge` são obrigatórios; `placement` aceita oito posições (`SgBadgeOverlayPlacement`: quatro cantos, `top`, `bottom`, `left`, `right`) com deslocamento em fração do tamanho do próprio selo (Confirmado em `packages/seedgrid_components/lib/src/commons/sg_badge_overlay.dart`).

**Controller, formulário e estado**: `StatelessWidget` (`Stack` + `CustomSingleChildLayout`); sem estado.

**Acessibilidade**: Nenhum `Semantics` explícito encontrado em `commons/sg_badge_overlay.dart`; não confirmado se o widget Material interno já expõe a semântica. A semântica fica a cargo do `child` e do `badge` (por exemplo, `SgBadge.semanticLabel`).

## SgSkeleton

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgSkeleton` (mesmo nome).

Placeholder visual para estados de carregamento, simulando texto, blocos e avatares antes da chegada dos dados reais.

- Arquivo: `packages/seedgrid_components/lib/src/commons/sg_skeleton.dart` (linha 36) · classe `class SgSkeleton extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_skeleton.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgSkeleton({...})` com 6 parâmetro(s) nomeado(s), 6 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgSkeleton

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `width` | `Object?` | — | não | React | Largura do placeholder. Tipo no React: `string \| number`. |
| `height` | `Object?` | — | não | React | Altura do placeholder. Tipo no React: `string \| number`. |
| `size` | `Object?` | — | não | React | Tamanho unico para placeholders quadrados ou circulares. Tipo no React: `string \| number`. |
| `borderRadius` | `Object?` | — | não | React | Raio de borda customizado. Tipo no React: `string \| number`. |
| `shape` | `SgSkeletonShape` | `SgSkeletonShape.text` | não | React | Forma visual base do placeholder. Valores: `text`, `circle`, `square`, `rounded`, `rectangle`. |
| `animation` | `SgSkeletonAnimation` | `SgSkeletonAnimation.wave` | não | React | Animacao aplicada ao placeholder. Valores: `none`, `pulse`, `wave`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- `width`, `height`, `size` e `borderRadius` aceitam número (px) ou texto (`'50%'`, `'2rem'`), lidos por `SgCssSize.parse` (Confirmado).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum.

**Controller, formulário e estado**: `AnimationController` interno; `animation` aceita `wave` (1,3 s), `pulse` (2 s) e `none` (para a animação). `size` vence `width`/`height` (Confirmado em `packages/seedgrid_components/lib/src/commons/sg_skeleton.dart`).

**Acessibilidade**: Nenhum `Semantics` explícito encontrado em `commons/sg_skeleton.dart`; não confirmado se o widget Material interno já expõe a semântica. Não há rótulo de "carregando": quem usar o esqueleto deve avisar o estado de carregamento por outro meio (Inferência).

## SgToaster

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgToaster` (mesmo nome).

Host visual de notificacoes toast globais, com controle de posicao, duracao, quantidade visivel e estilos ricos.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_toaster.dart` (linha 142) · classe `class SgToaster extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_toaster.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgToaster({...})` com 8 parâmetro(s) nomeado(s), 8 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgToaster

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `position` | `SgToasterPosition` | `SgToasterPosition.topRight` | não | React | Posicao global do stack de toasts. Valores: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`. |
| `duration` | `num` | `4000` | não | React | Duracao padrao dos toasts em milissegundos. |
| `visibleToasts` | `num` | `6` | não | React | Quantidade maxima de toasts visiveis simultaneamente. |
| `closeButton` | `bool` | `true` | não | React | Exibe botao de fechar em cada toast. |
| `richColors` | `bool` | `true` | não | React | Ativa paleta visual rica por tipo de toast. |
| `transparency` | `num` | `0` | não | React | 0 a 100 (%). |
| `rounded` | `bool` | `true` | não | React | Arredonda os cantos de cada toast (desligue para cantos retos). |
| `customColors` | `SgToasterCustomColors?` | — | não | React | Tipo no React: `Partial<Record<SgToastType, SgToasterTypeColors>>`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- Diferença confirmada no comentário de `feedback/sg_toaster.dart`: no React o toaster é `position: fixed`; no Flutter ele **preenche o espaço do pai** (deixando passar os toques fora dos cards) quando o pai tem largura e altura limitadas (por exemplo, filho de um `Stack`); em área ilimitada (`Column`, `ListView`) não ocupa espaço e desenha no `Overlay` da rota.
- Com algum `SgToastHost` montado, o `SgToaster` solto não desenha nada (igual ao React).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: o widget não tem callbacks. Cada toast tem `SgToastAction.onClick` (chamado ao tocar a ação; depois o toast é removido por `dismissSgToast`) e o botão "x" (`closeButton`, por toast ou do toaster), que chama `dismissSgToast(id)` (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_toaster.dart`, `_ToastCard`).

**API imperativa e estado** (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_toast.dart`): o armazenamento é global, em variáveis do módulo, e funciona fora de widgets.
- `toast` (`const SgToastFn`): `toast('x')`, `.message`, `.success`, `.info`, `.warning`, `.error`, `.loading`, `.custom(renderer)`, `.dismiss([id])` e `.promise<T>(futureOuFábrica, SgToastPromiseMessages, [options])`. Todos (menos `dismiss`) devolvem o `SgToastId`.
- `dismissSgToast([id])` e `subscribeSgToasts(listener)` são funções públicas. `SgToastOptions`: `id`, `description`, `duration` (ms; `<= 0` não some sozinho), `action`, `closeButton`.
- Toast `loading` nunca expira; `duration` padrão do toaster é 4000 ms; `visibleToasts` mostra os mais recentes (padrão 6).
- O registro de hosts (`sgToastHostRegistry`, classe `SgHostRegistry`) fica em `feedback/sg_host_registry.dart` e **não é exportado** pelo barril: não é API pública.

**Acessibilidade** (Confirmado): cada toast é `Semantics(liveRegion: true, container: true)`; o botão de fechar tem `Semantics(button: true, label: i18n 'components.toaster.close')`. Nenhum atalho de teclado encontrado em `sg_toaster.dart`.

## SgToastHost

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgToastHost` (mesmo nome).

Ponto explicito de montagem para notificacoes toast, usado quando a aplicacao precisa controlar a localizacao ativa do host.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_toaster.dart` (linha 196) · classe `class SgToastHost extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_toast_host.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgToastHost({...})` com 8 parâmetro(s) nomeado(s), 8 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgToastHost

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `position` | `SgToasterPosition` | `SgToasterPosition.topRight` | não | React | Posicao dos toasts renderizados por este host. Valores: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`. |
| `duration` | `num` | `4000` | não | React | Duracao padrao aplicada aos toasts deste host. |
| `visibleToasts` | `num` | `6` | não | React | Quantidade maxima de toasts visiveis. |
| `closeButton` | `bool` | `true` | não | React | — |
| `richColors` | `bool` | `true` | não | React | — |
| `transparency` | `num` | `0` | não | React | — |
| `rounded` | `bool` | `true` | não | React | Arredonda os cantos de cada toast (rounded-md). Desligue para cantos retos. |
| `customColors` | `SgToasterCustomColors?` | — | não | React | Tipo no React: `Partial<Record<SgToastType, SgToasterTypeColors>>`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- Aceita as mesmas props do `SgToaster`; o comportamento de preencher o pai ou usar o `Overlay` é o descrito no `SgToaster`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum callback próprio (os do toast estão em `SgToaster`).

**Host e registro** (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_toaster.dart`, `_SgToastHostState`): no `initState` assina `sgToastHostRegistry` e, depois do primeiro quadro, registra o próprio id; o host **ativo é o último a montar**. No `dispose`, desregistra e o anterior volta. Host inativo devolve `SizedBox.shrink()`. Uso indicado no comentário do arquivo: `MaterialApp(builder: (context, child) => Stack(children: [child!, const SgToastHost()]))`.

**Acessibilidade**: a mesma do `SgToaster` (região viva por toast); o host em si não declara `Semantics`.

## SgWhistler

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgWhistler` (mesmo nome).

Renderizador de avisos persistentes ou semi-persistentes em pilha, com cores por severidade, acao opcional e controle de maximo visivel. Cede a vez quando um SgWhistleHost esta presente.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_whistler.dart` (linha 96) · classe `class SgWhistler extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_whistler.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgWhistler({...})` com 6 parâmetro(s) nomeado(s), 6 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgWhistler

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `max` | `num` | `4` | não | React | Quantidade maxima de whistle items visiveis. |
| `duration` | `num` | `4000` | não | React | Duracao padrao dos whistles em milissegundos (mesmo default do SgToaster). Cada whistle sobrescreve com options.duration, que tem prioridade; use 0 (ou negativo) para que nada suma sozinho. Whistle 'loading' nunca expira. |
| `newestOnTop` | `bool` | `false` | não | React | Inverte a ordem visual para mostrar os mais novos primeiro. |
| `gap` | `num` | `12` | não | React | Espacamento entre os avisos renderizados. |
| `rounded` | `bool` | `true` | não | React | Arredonda os cantos de cada whistle (desligue para cantos retos). |
| `customColors` | `Map<SgWhistleSeverity, SgWhistleColors>?` | — | não | React | Tipo no React: `Partial<Record<SgWhistleSeverity, SgWhistleColors>>`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- O whistle fica **no fluxo do layout** (uma `Column` no ponto onde o widget é colocado), como no React; não usa `Overlay`.
- `customColors` é `Map<SgWhistleSeverity, SgWhistleColors>`; o `default` do React é `SgWhistleSeverity.defaultValue` (palavra reservada do Dart).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_whistle.dart` e `sg_whistler.dart`): `SgWhistleAction.onClick` (chamado ao tocar a ação; depois o whistle é removido) e `SgWhistleOptions.onClose` (chamado quando o whistle é removido por `dismissSgWhistle`, inclusive por tempo).

**API imperativa e estado**
- `sgWhistle` (`const SgWhistleApi`): `show`, `success`, `info`, `warning`, `error`, `loading` (todos com `SgWhistleOptions`; `message` é obrigatório), `dismiss([id])`, `update(id, SgWhistleCustomOptions)`, `custom(renderer, [options])` e `promise<T>`.
- `dismissSgWhistle([id])` e `subscribeSgWhistles(listener)` são públicas.
- `max` (padrão 4) limita aos mais recentes; `newestOnTop` inverte a ordem; `duration` padrão 4000 ms (`<= 0` não some; severidade `loading` nunca expira).
- Com algum `SgWhistleHost` montado, o `SgWhistler` solto cede a vez e não desenha nada. O registro (`sgWhistleHostRegistry`) não é exportado.

**Acessibilidade** (Confirmado): cada whistle é `Semantics(liveRegion: true, container: true)`; o botão de fechar tem `Semantics(button: true, label, excludeSemantics: true)` com texto i18n. Nenhum atalho de teclado encontrado.

## SgWhistleHost

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgWhistleHost` (mesmo nome).

Marca o local onde os whistles aparecem. Suporta varios hosts simultaneos (ex.: topo e rodape) via registry: apenas o ultimo montado fica ativo, e o SgWhistler solto cede a vez quando qualquer host esta presente.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_whistler.dart` (linha 140) · classe `class SgWhistleHost extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_whistle_host.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgWhistleHost({...})` com 6 parâmetro(s) nomeado(s), 6 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgWhistleHost

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `max` | `num` | `4` | não | React | Quantidade maxima de whistle items visiveis neste host. |
| `duration` | `num` | `4000` | não | React | Duracao padrao aplicada aos whistles deste host, em milissegundos (mesmo default do SgToastHost). Cada whistle sobrescreve com options.duration, que tem prioridade; use 0 (ou negativo) para que nada suma sozinho. Whistle 'loading' nunca expira. Com varios hosts montados, vale o do host ATIVO (o ultimo montado). |
| `newestOnTop` | `bool` | `false` | não | React | Inverte a ordem visual para mostrar os mais novos primeiro. |
| `gap` | `num` | `12` | não | React | Espacamento entre os avisos renderizados. |
| `rounded` | `bool` | `true` | não | React | Arredonda os cantos de cada whistle (desligue para cantos retos). |
| `customColors` | `Map<SgWhistleSeverity, SgWhistleColors>?` | — | não | React | Tipo no React: `Partial<Record<SgWhistleSeverity, SgWhistleColors>>`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- Aceita as mesmas props do `SgWhistler`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum próprio.

**Host e registro** (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_whistler.dart`, `_SgWhistleHostState`): mesmo mecanismo do `SgToastHost`, com `sgWhistleHostRegistry`. Vários hosts podem existir (por exemplo, topo e rodapé), mas só o **último montado** renderiza; os demais ficam vazios.

**Acessibilidade**: a mesma do `SgWhistler` (região viva por whistle); o host em si não declara `Semantics`.

