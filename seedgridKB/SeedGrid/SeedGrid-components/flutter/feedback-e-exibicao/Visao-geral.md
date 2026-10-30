---
description: "Feedback e exibição em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, feedback-e-exibicao]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Feedback e exibição — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Visao-geral|Feedback e exibição — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API|API — Feedback e exibição (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos|Exemplos — Feedback e exibição (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

9 componente(s): **9 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgAvatar` | portado | Avatar com imagem, ícone, iniciais ou fallback, com severidade, forma e tamanho. | `pages/sg_avatar_page.dart` |
| `SgAvatarGroup` | portado | Avatares sobrepostos com limite visível e contador de quem ficou de fora. | `pages/sg_avatar_group_page.dart` |
| `SgBadge` | portado | Etiqueta ou contador com severidade, ponto pulsante, ícones, clique e remoção. | `pages/sg_badge_page.dart` |
| `SgBadgeOverlay` | portado | Posiciona um selo (badge) sobre um canto ou lado de outro widget. | `pages/sg_badge_overlay_page.dart` |
| `SgSkeleton` | portado | Placeholder de carregamento com formas e animação de onda ou pulso. | `pages/sg_skeleton_page.dart` |
| `SgToaster` | portado | Pilha de toasts disparados por `toast(...)`, com posição, duração e cores. | `pages/sg_toaster_page.dart` |
| `SgToastHost` | portado | Define onde os toasts aparecem; com vários hosts, vale o último montado. | `pages/sg_toast_host_page.dart` |
| `SgWhistler` | portado | Lista de avisos no fluxo do layout, disparados por `sgWhistle.*`. | `pages/sg_whistler_page.dart` |
| `SgWhistleHost` | portado | Define onde os whistles aparecem; com vários hosts, vale o último montado. | `pages/sg_whistle_host_page.dart` |

## Quando usar

- `SgAvatar` / `SgAvatarGroup`: identificar pessoa ou entidade. Use o grupo para listas de participantes; para um número solto sobre o avatar, combine `SgBadgeOverlay` + `SgBadge`.
- `SgBadge`: rótulo curto, contagem ou estado. Para sobrepor a outro widget use `SgBadgeOverlay`; para clicar ou remover, use `onClick` / `removable`.
- `SgSkeleton`: enquanto os dados carregam. Para uma ação em andamento num botão, use `SgButton(loading: true)`.
- `SgToaster` / `SgToastHost` + `toast`: mensagens transitórias que não bloqueiam (sobrepõem a tela). Prefira o `SgToastHost` na raiz do app, para controlar o host ativo; o `SgToaster` solto serve a telas isoladas. Para confirmação que exige resposta use `SgConfirmationDialog` ([[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Navegação, overlay e wizard]]).
- `SgWhistler` / `SgWhistleHost` + `sgWhistle`: avisos que ficam no fluxo do layout (banner de página, erro de formulário). Se o aviso deve flutuar sobre a tela, use toast.

## O que muda em relação ao React

- A API imperativa tem os mesmos nomes (`toast`, `sgWhistle`, `dismissSgToast`, `subscribeSgToasts`, `dismissSgWhistle`, `subscribeSgWhistles`); as opções são objetos Dart (`SgToastOptions`, `SgWhistleOptions`) e `default` vira `defaultValue`.
- `SgToaster` não é `position: fixed`: preenche o pai limitado (`Stack`) ou desenha no `Overlay` quando o pai é ilimitado (`Column`, `ListView`). `SgWhistler` fica no fluxo do layout, como no React.
- `SgAvatar`: `aria-label` vira `semanticLabel`; `SgBadge` ganhou `count`; `SgBadgeOverlay` usa `child` no lugar de `children`; `className`/`style` não existem.
- O placar de paridade do grupo é 9 de 9 portados, sem ressalva na tabela do repositório. Detalhes e decisões gerais: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte do lado React: `feedback-e-exibicao/Visao-geral` ("Funções e tipos exportados relacionados").

| Símbolo do React | Equivalente em Flutter |
|---|---|
| `toast` (`.success`, `.error`, `.promise`…), `dismissSgToast`, `subscribeSgToasts` | portado: `toast` (`SgToastFn`), `dismissSgToast`, `subscribeSgToasts` em `feedback/sg_toast.dart` |
| `sgWhistle` (`.show`, `.update`, `.promise`…), `dismissSgWhistle`, `subscribeSgWhistles` | portado: `sgWhistle` (`SgWhistleApi`), `dismissSgWhistle`, `subscribeSgWhistles` em `feedback/sg_whistle.dart` |
| `registerHost`, `unregisterHost`, `getActiveHostId`, `hasAnyHost`, `subscribeHostRegistry`, `nextHostId` | **não portado como API pública**: existe a classe `SgHostRegistry` (`sgToastHostRegistry`, `sgWhistleHostRegistry`) em `feedback/sg_host_registry.dart`, mas o arquivo não é exportado pelo barril |
| `SgToasterHostContext`, `SgWhistlerHostContext` (contextos internos) | sem equivalente público: o Dart usa o parâmetro interno `renderedByHost` de `_SgToasterBody`/`_SgWhistlerBody` |
| Tipos de props (`SgToasterProps`…) | contratos gerados em `lib/src/generated/*.g.dart` (interfaces `Sg…Props`, exportadas) |

## Não verificado

- Não executei `flutter test` nem o showcase para esta nota; a leitura é estática do código no commit `e9989b8`.
- Não conferi o texto de i18n efetivo dos rótulos (apenas as chaves, como `components.toaster.close`).
- O comportamento de preencher o pai ou usar o `Overlay` no `SgToaster` foi lido no código (`LayoutBuilder` em `_SgToasterBodyState.build`), não visto em execução.

## Símbolos públicos do grupo (além dos widgets)

Extraído do barril `feedback/feedback.dart` e `commons/commons.dart` (arquivos exportados inteiros) e conferido à mão; descrição = comentário `///` do código quando existe. O que **não** é exportado (`SgHostRegistry` e instâncias) está na seção anterior.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgAvatarCustomColors` | class | Cores customizadas do avatar. | `lib/src/commons/sg_avatar.dart` |
| `normalizeAvatarLabel` | função | `normalizeLabel` do React: até 2 letras = maiúsculas; 2+ palavras = iniciais das 2 primeiras; senão as 2 primeiras letras. | `lib/src/commons/sg_avatar.dart` |
| `SgBadgeCustomColors` / `SgBadgeColors` / `resolveBadgeColors` | class / função | Cores customizadas e cores resolvidas do badge. | `lib/src/commons/sg_badge.dart` |
| `SgCssSize` | class | Dimensão do React já interpretada (pixels ou fração do espaço disponível). | `lib/src/commons/sg_skeleton.dart` |
| `toast` | constante (`SgToastFn`) | API imperativa de toasts (`toast` do React). | `lib/src/feedback/sg_toast.dart` |
| `SgToastType`, `SgToastOptions`, `SgToastAction`, `SgToastRecord`, `SgToastPromiseMessages`, `SgToastId`, `SgToastListener` | enum / class / typedef | Tipos do toast (`default` é `defaultValue`). | `lib/src/feedback/sg_toast.dart` |
| `dismissSgToast`, `subscribeSgToasts` | função | Remove um toast (ou todos) e assina as mudanças. | `lib/src/feedback/sg_toast.dart` |
| `sgToNode` | função | Converte `String` (ou qualquer valor) em `Widget`; `Widget` passa direto; `null` vira `null`. | `lib/src/feedback/sg_toast.dart` |
| `SgToasterTypeColors`, `SgToasterCustomColors` | class / typedef | Cores por tipo de toast. | `lib/src/feedback/sg_toaster.dart` |
| `sgWhistle` | constante (`SgWhistleApi`) | API imperativa de whistles (`sgWhistle` do React). | `lib/src/feedback/sg_whistle.dart` |
| `SgWhistleSeverity`, `SgWhistleBorderStyle`, `SgWhistleAction`, `SgWhistleOptions`, `SgWhistleCustomOptions`, `SgWhistleRecord`, `SgWhistlePromiseStates`, `SgWhistleId`, `SgWhistleListener` | enum / class / typedef | Tipos do whistle (`message` é obrigatório em `SgWhistleOptions`). | `lib/src/feedback/sg_whistle.dart` |
| `dismissSgWhistle`, `subscribeSgWhistles` | função | Remove um whistle (chama o `onClose`) e assina as mudanças. | `lib/src/feedback/sg_whistle.dart` |
| `SgWhistleColors`, `resolveWhistleColors` | class / função | Cores por severidade de whistle. | `lib/src/feedback/sg_whistler.dart` |
