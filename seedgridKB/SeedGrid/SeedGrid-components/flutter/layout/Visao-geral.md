---
description: "Layout e containers em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, layout]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Layout e containers — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout e containers — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/layout/API|API — Layout e containers (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos|Exemplos — Layout e containers (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

19 componente(s): **19 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgStack` | portado | Empilha filhos em linha ou coluna, com espaçamento, alinhamento e quebra de linha. | `pages/sg_stack_page.dart` |
| `SgGrid` | portado | Grade responsiva de colunas por breakpoint, com spans de linha e coluna via SgPanel. | `pages/sg_grid_page.dart` |
| `SgPanel` | portado | Contêiner com borda, ancoragem de painéis por align, rolagem e fluxo flex do conteúdo. | `pages/sg_panel_page.dart` |
| `SgScreen` | portado | Raiz de tela cheia (largura do pai, altura da janela) com ancoragem de painéis. | `pages/sg_screen_page.dart` |
| `SgGroupBox` | portado | Agrupa campos relacionados numa caixa com legenda sobre a borda. | `pages/sg_group_box_page.dart` |
| `SgCard` | portado | Cartão com cabeçalho, descrição, rodapé, recolher e arraste com posição salva. | `pages/sg_card_page.dart` |
| `SgAccordion` | portado | Seções expansíveis na vertical ou horizontal, com um ou vários itens abertos. | `pages/sg_accordion_page.dart` |
| `SgPageControl` | portado | Abas para alternar páginas na mesma área, com navegação por teclado. | `pages/sg_page_control_demo_page.dart` |
| `SgPageControlPage` | portado | Declara uma aba (título, dica, ícone e conteúdo) dentro de um SgPageControl. | — |
| `SgExpandablePanel` | portado | Painel que expande numa direção, em linha ou como gaveta sobre a tela. | `pages/sg_expandable_panel_page.dart` |
| `SgCarousel` | portado | Carrossel de itens com autoplay, indicadores, navegadores e gesto de deslizar. | `pages/sg_carousel_page.dart` |
| `SgBreadcrumb` | portado | Trilha de navegação com colapso de itens, separadores e ícone de início. | `pages/sg_breadcrumb_page.dart` |
| `SgMenu` | portado | Menu de navegação em árvore, cascata ou mega, com busca, recolher e gaveta. | `pages/sg_menu_page.dart` |
| `SgTreeView` | portado | Árvore de dados com busca, caixas de seleção, colunas extras e controller. | `pages/sg_tree_view_page.dart` |
| `SgDockLayout` | portado | Contexto das toolbars encaixáveis: zonas, ordem, recolhimento e persistência. | `pages/sg_dock_layout_page.dart` |
| `SgDockZone` | portado | Região nomeada (top, bottom, left, right, free) onde as toolbars se encaixam. | `pages/sg_dock_zone_page.dart` |
| `SgDockScreen` | portado | Tela com SgDockLayout e grade de zonas pronta (SgScreen mais dock). | `pages/sg_dock_screen_page.dart` |
| `SgToolBar` | portado | Barra de ferramentas recolhível, arrastável e encaixável em zonas. | `pages/sg_tool_bar_page.dart` |
| `SgToolbarIconButton` | portado | Botão compacto de toolbar com ícone, rótulo, dica, carregamento e severidade. | `pages/sg_toolbar_icon_button_page.dart` |

## Quando usar

- `SgStack`: linha ou coluna simples com `gap`, alinhamento e quebra de linha. Para colunas por breakpoint use `SgGrid`; para borda, rolagem e ancoragem de blocos use `SgPanel`.
- `SgGrid`: grade responsiva (`columns` por breakpoint ou `minItemWidth`) de cartões e campos. Para um único eixo, `SgStack`.
- `SgPanel`: bloco com borda que ancora painéis filhos por `align` (`top`, `left`, `bottom`, `right`, `client`) e rola o conteúdo. Para só agrupar campos com título, `SgGroupBox`.
- `SgScreen`: raiz de uma tela inteira (altura da janela). Com zonas de toolbar encaixáveis, `SgDockScreen`.
- `SgGroupBox`: agrupar campos relacionados com legenda sobre a borda. Para um bloco destacado, recolhível ou arrastável, `SgCard`.
- `SgCard`: bloco destacado com cabeçalho, rodapé, recolher e arraste com posição salva. Para várias seções recolhíveis em sequência, `SgAccordion`.
- `SgAccordion`: seções expansíveis (um ou vários abertos, vertical ou horizontal). Para trocar de conteúdo na mesma área, `SgPageControl`.
- `SgPageControl` + `SgPageControlPage`: abas na mesma área da tela; cada aba é uma `SgPageControlPage`. Para uma sequência guiada, o `SgWizard` (grupo [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Navegação, overlay e wizard (Flutter)]]).
- `SgExpandablePanel`: painel lateral/inferior que abre em linha (`inline`) ou como gaveta sobre a tela (`overlay`). No modo `inline` quem abre e fecha é o app (`open`).
- `SgCarousel`: sequência de itens visuais com autoplay, indicadores e gesto de deslizar.
- `SgBreadcrumb`: trilha do caminho atual com retorno a níveis anteriores. Não navega sozinho: trate `onNavigate`.
- `SgMenu`: navegação estruturada (sidebar, gaveta, inline ou híbrido; árvore, cascata ou mega). Para navegar por arquivos/dados em árvore com seleção, `SgTreeView`.
- `SgTreeView`: árvore de dados com busca, caixas de seleção, colunas extras e `SgTreeViewController`.
- `SgDockLayout`, `SgDockZone`, `SgDockScreen`: encaixe de toolbars em zonas. `SgDockLayout` guarda o estado, `SgDockZone` é a região e `SgDockScreen` já traz a grade pronta (use-o quando não precisar posicionar as zonas à mão).
- `SgToolBar` e `SgToolbarIconButton`: barra de ações frequentes, recolhível, arrastável e encaixável; o botão compacto próprio da barra é o `SgToolbarIconButton` (para ações fora de barras, `SgButton`, no grupo [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Botões (Flutter)]]).

## O que muda em relação ao React

Os 19 componentes do grupo estão `portado` na tabela de paridade ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]), com ressalvas registradas. As diferenças que se repetem:

- Sem `className`/`style` (ADR 50): os `*ClassName` do contrato são aceitos sem efeito; use as props nomeadas (`width`, `height`, `padding`, `gap`, `customColors`...).
- Filhos: `children` (lista) em `SgStack`, `SgGrid`, `SgPanel`, `SgScreen`, `SgPageControl`; `child` onde o React passa um só (`SgGroupBox`, `SgExpandablePanel`, `SgDockLayout`).
- `ref` vira controller (`SgTreeViewController`) e a persistência de posição vai para `SgEnvironmentProvider` ou `shared_preferences` (`SgCard`, `SgToolBar`, `SgMenu`) ou para um `SgDockLayoutStore` que o app implementa (`SgDockLayout`).
- Breakpoints do `SgGrid`/`SgPanel`/`SgStack` medem a janela, como o `@media` do React.
- Não há navegação própria (`href`/`url`): `SgBreadcrumb` e `SgMenu` só chamam `onNavigate`.
- Sem portal no encaixe de toolbars: `SgToolBar` e `SgMenu` registram-se no `SgDockLayout`, mas o app os coloca dentro do `SgDockZone`.
- Mobile (abaixo de 600 px): `SgMenu` `tiered`/`mega` e o menu "..." do `SgToolBar` viram árvore/painel inferior; `SgPageControl` pode virar lista de seleção abaixo de 768 px.
- Extras do Flutter: gesto de deslizar no `SgCarousel`, navegação por teclado no `SgTreeView`, `overflow` no `SgToolBar`, `maxHeight` no `SgTreeView`.

Detalhe por componente em [[SeedGrid/SeedGrid-components/flutter/layout/API|API]]; regras gerais em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte do lado React: [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout e containers (React)]] e [[SeedGrid/SeedGrid-components/layout/API|API]]. Todos os 19 componentes `Sg*` do grupo React têm widget Flutter com o mesmo nome. Os helpers e hooks:

| Família React | Equivalente Flutter | Situação |
|---|---|---|
| `useSgDockLayout` | `useSgDockLayout(context)` e `SgDockLayout.maybeOf`/`maybeReadOf` (`dock/sg_dock_layout.dart`) | Portado e exportado |
| `renderDockContent`, `getDefaultContentDirection`, `getDefaultContentAlign`, `getDefaultContentGap` e tipos `SgDockAlign`/`SgDockContent*` (`sgDocking.tsx`) | `SgDockContent`, `getDefaultContent*`, `toSpacePx`, `toDockSize`, `SgDockItem`/`SgDockable` (`dock/sg_docking.dart`) | Portado e exportado. `SgPanel`/`SgScreen` usam um motor próprio não exportado (`basic/dock_content.dart`, `sgDockContent`); `SgDockContent` só aparece no teste do pacote (`sg_docking_test.dart`) |
| `parseStoredPanelDragPosition`, `buildToolbarStorageKey`, `resolveToolbarOrientationDirection`, `resolveToolbarDockOrientationDirection`, `buildToolbarLayoutState` | `menu/toolbar_logic.dart` | Portado, **não exportado** (uso interno do `SgToolBar`) |
| `buildDockMenuStorageKey` | `menus/dock_menu/dock_menu_logic.dart` | Portado junto do `SgDockMenu` (grupo [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral\|Navegação, overlay e wizard (Flutter)]]); não conferi se é exportado |
| Lógica do menu: `buildMenuMaps`, `collectParentChain`, `computeActiveSets`, `resolveEffectiveActiveId`, `mergeExpandedIdsForActivePath`, `resolveTiered*`, `resolveMenuLayoutState`, `resolveMenuNodeActionIntent`, `resolveExpandedIdsToggle`, `resolveHorizontalDockAlign`, `resolveMegaMenu*`, `resolveMenuAutocompleteItems`, `resolveMenuSearchSelectionState`, `filterMenuNodes`, `collectMenuSearchEntries`, `flattenVisibleNodes`, `resolveMenuKeyboardAction` | `menu/menu_logic.dart` | Portado, **não exportado** (o barril só exporta `SgMenuStyleKind`) |
| `resolveMenuHintPosition` | não encontrado no código Flutter | **Não portado**: a dica do menu usa `Tooltip` do Material |
| `sgTreeFromJson`, `sgTreeFromJsonWithChecked` | mesmos nomes (`tree/sg_tree_logic.dart`), mais `computeCheckedState`, `computeCascadeValue`, `filterTreeByQuery`, `SgCheckedState`, `SgTreeFilter` | Portado e exportado |
| `SgTreeViewRef` | `SgTreeViewController` | Portado e exportado |


## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos que o barril `seedgrid_components.dart` exporta, **respeitando os `show`** (por exemplo, de `menu_logic.dart` só `SgMenuStyleKind` sai do pacote). Descrição = comentário `///` do código, quando existe; `t_` é um alias interno que vazou no barril.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `sgSpace` | função | `number \| string` do React -> logical pixels. `null` quando nao ha valor ou a unidade nao e suportada. [viewport] resolve `vh`/`vw`/`vmin`/`vmax`; [available] resolve `%` (sem ele, `%` e nulo). | `lib/src/layout/basic/layout_units.dart` |
| `sgPercent` | função | `SgDockPercent` do React (`number \| "N%"`, ambos significam porcentagem) -> N. `null` se invalido. | `lib/src/layout/basic/layout_units.dart` |
| `sgSize` | função | Largura/altura estilo `toCssSize`: numero = px, 'N%' = fracao do espaco disponivel, 'Npx'/'Nrem'/`calc()`/`vh`... = px. Devolve o tamanho em px dado o espaco [available] (se 'N%' e [available] for finito) ou `null`. | `lib/src/layout/basic/layout_units.dart` |
| `sgGridColumnsFor` | função | Equivale a `normalizeColumns`: `columns` e um inteiro ou `{base, sm, md, lg, xl, 2xl}`. Sem `columns` = 1 coluna. Chaves invalidas ou < 1 sao ignoradas. | `lib/src/layout/basic/sg_grid.dart` |
| `SgGridCell` | class | Posicao de um item na grade (resultado da colocacao automatica do CSS grid). | `lib/src/layout/basic/sg_grid.dart` |
| `sgGridPlace` | função | Colocacao automatica do CSS grid (`grid-auto-flow: row` ou `dense`). [spans] = (colunas, linhas) por item. | `lib/src/layout/basic/sg_grid.dart` |
| `SgAccordionItem` | class | Item do acordeao (`SgAccordionItem` do React). | `lib/src/layout/containers/sg_accordion.dart` |
| `SgBreadcrumbSeparator` | enum | Separadores prontos do React (`"slash" \| "chevron" \| "dot" \| "arrow"`). | `lib/src/layout/containers/sg_breadcrumb.dart` |
| `SgBreadcrumbItem` | class | Item do breadcrumb (`SgBreadcrumbItem` do React). | `lib/src/layout/containers/sg_breadcrumb.dart` |
| `SgCardPosition` | class | — | `lib/src/layout/containers/sg_card.dart` |
| `SgCardPositionStore` | class | Posicoes salvas por chave (`dragPersistKey`, ou `sg-card-pos:<id>`). Memoria do processo: leitura imediata ao remontar o widget. O disco (SgEnvironmentProvider ou shared_preferences, como o React com localStorage) e lido logo depois da montagem e gravado ao soltar o card. Limpe com [clear] em testes. | `lib/src/layout/containers/sg_card.dart` |
| `SgCarouselNavigators` | class | `customNavigators` do React: botoes proprios de anterior/proximo. | `lib/src/layout/containers/sg_carousel.dart` |
| `SgExpandablePanelAnimationType` | enum | `animation.type` do React. | `lib/src/layout/containers/sg_expandable_panel.dart` |
| `SgExpandablePanelAnimation` | class | `animation` do React: tipo (`slide` por padrao) e duracao em ms (180 por padrao). | `lib/src/layout/containers/sg_expandable_panel.dart` |
| `SgExpandablePanelSize` | class | `size` do React: `min`, `max` e `default` (`defaultSize`, porque `default` e palavra reservada em Dart). Cada valor e numero (px) ou texto (`'320px'`, `'50%'`). | `lib/src/layout/containers/sg_expandable_panel.dart` |
| `SgPageControlContext` | class | Contexto passado aos callbacks de troca de pagina (`{ index, page }` / `{ pageId, page }` no React). | `lib/src/layout/containers/sg_page_control.dart` |
| `SgDockOrientation` | enum | `SgDockToolbarState["orientation"]`. | `lib/src/layout/dock/sg_dock_layout.dart` |
| `SgDockToolbarState` | class | `SgDockToolbarState` do React. | `lib/src/layout/dock/sg_dock_layout.dart` |
| `SgDockLayoutState` | class | `SgDockLayoutState` do React (`version: 1`). | `lib/src/layout/dock/sg_dock_layout.dart` |
| `SgDockDropIndicator` | class | Onde e como soltar uma toolbar (`SgDockDropIndicator`). | `lib/src/layout/dock/sg_dock_layout.dart` |
| `SgDockLayoutStore` | class | Persistencia do estado do layout. O React usa `useSgPersistentState({ baseKey: 'dock-layout:<id>' })`. | `lib/src/layout/dock/sg_dock_layout.dart` |
| `SgDockLayoutController` | class | Estado e coordenacao do SgDockLayout (equivale ao `DockContextValue` do React). | `lib/src/layout/dock/sg_dock_layout.dart` |
| `useSgDockLayout` | função | `useSgDockLayout` do React. | `lib/src/layout/dock/sg_dock_layout.dart` |
| `t_` | função | — | `lib/src/layout/dock/sg_dock_zone.dart` |
| `SgDockAlign` | enum | `SgDockAlign` do React. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockContentDirection` | enum | `SgDockContentDirection` do React. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockContentJustify` | enum | `SgDockContentJustify` do React. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockContentAlign` | enum | `SgDockContentAlign` do React. | `lib/src/layout/dock/sg_docking.dart` |
| `getDefaultContentDirection` | função | `getDefaultContentDirection`. | `lib/src/layout/dock/sg_docking.dart` |
| `getDefaultContentAlign` | função | `getDefaultContentAlign`. | `lib/src/layout/dock/sg_docking.dart` |
| `getDefaultContentGap` | função | `getDefaultContentGap`. | `lib/src/layout/dock/sg_docking.dart` |
| `toSpacePx` | função | `toCssSpace` em pixels logicos: numero = px; texto aceita `12`, `12px`, `1rem` e `1em` (16 px). Qualquer outra coisa (`calc()`, `%`) vira `null`, como se a prop nao existisse. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockSize` | typedef | Medida de encaixe: numero ou `'N%'` (`SgDockPercent`). `isPercent` = fracao do container. Texto `'Npx'` tambem e aceito (o React o repassa ao CSS como esta), valendo pixels. | `lib/src/layout/dock/sg_docking.dart` |
| `toDockSize` | função | `toCssPercent`: numero e texto `'N%'` sao porcentagem; `'Npx'` e pixel; o resto e `null`. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockable` | class | Item de encaixe (equivale a um `SgPanel` com `align` no React). | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockItem` | class | Embrulha qualquer widget como item de encaixe. | `lib/src/layout/dock/sg_docking.dart` |
| `SgDockContent` | class | `renderDockContent` do React. | `lib/src/layout/dock/sg_docking.dart` |
| `SgCheckedState` | enum | — | `lib/src/layout/tree/sg_tree_logic.dart` |
| `SgTreeFilter` | class | Resultado de `filterTreeByQuery`. Mesma pegadinha do React: um no que casa mas nenhum filho casa vira `children: []` (e portanto deixa de ter filhos na tela: e tratado como folha). | `lib/src/layout/tree/sg_tree_logic.dart` |
| `filterTreeByQuery` | função | — | `lib/src/layout/tree/sg_tree_logic.dart` |
| `computeCheckedState` | função | — | `lib/src/layout/tree/sg_tree_logic.dart` |
| `computeCascadeValue` | função | — | `lib/src/layout/tree/sg_tree_logic.dart` |
| `sgTreeFromJson` | função | `sgTreeFromJson`: troca o nome do icone pelo widget do registro; `children` vazio vira nulo. | `lib/src/layout/tree/sg_tree_logic.dart` |
| `SgTreeNode` | class | No da arvore (`SgTreeNode`). `meta` e livre. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeNodeJson` | class | No em forma de dado (`SgTreeNodeJson`): o icone e o NOME de um icone do registro. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeIconRegistry` | typedef | `SgTreeIconRegistry`: nome do icone -> widget. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeTrackOption` | class | Opcao de uma trilha `enum`. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeTrack` | class | Uma coluna extra por linha (`SgTreeTrack`). `width` e um valor CSS (`"140px"`, `"12rem"`); padrao 110px. `label` e o cabecalho da coluna. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeTrackBoolean` | class | Trilha de checkbox com cascata pai -> filhos propria, controlada de fora. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeTrackEnum` | class | Trilha de lista de opcoes (valor escolhido / sem valor / misto) com cascata. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeTrackCustom` | class | Celula livre alinhada com as outras: a arvore so cede a celula (largura e cabecalho). | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeConfirmBar` | class | Barra de confirmacao (`SgTreeConfirmBar`); `null` no `confirmBar` = `false` do React. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeViewController` | class | Equivale a `SgTreeViewRef` do React (`ref` vira `controller`, ADR 50). | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeViewControllerHost` | class | Contrato interno entre o estado do widget e o [SgTreeViewController]. | `lib/src/layout/tree/sg_tree_types.dart` |
| `SgTreeViewState` | class | — | `lib/src/layout/tree/sg_tree_view.dart` |
| `SgMenuStyleKind` | enum | Variante efetiva do menu (`menuVariantStyle` normalizado para `panel`, `tiered`, `mega-horizontal` ou `mega-vertical`). | `lib/src/layout/menu/menu_logic.dart` |
| `SgMenuNode` | class | Item do menu (`SgMenuNode` do React). `badge` e texto ou numero. | `lib/src/layout/menu/sg_menu_types.dart` |
| `SgMenuSelection` | class | Selecao ativa por id ou por url (`SgMenuSelection`). | `lib/src/layout/menu/sg_menu_types.dart` |
| `SgMenuBrand` | class | Bloco de marca no topo (`SgMenuBrand`). `imageSrc` e uma URL de rede. | `lib/src/layout/menu/sg_menu_types.dart` |
| `SgMenuUser` | class | Bloco do usuario (`SgMenuUser`). `avatarSrc` e uma URL de rede. | `lib/src/layout/menu/sg_menu_types.dart` |
| `SgMenuSearch` | class | Busca integrada (`search: { enabled, placeholder }`). | `lib/src/layout/menu/sg_menu_types.dart` |
| `SgToolBarSize` | class | `SgToolBarSize` do React (`w`/`h` em px). | `lib/src/layout/menu/sg_tool_bar.dart` |
| `SgToolbarScope` | class | Orientacao da toolbar que contem o botao (o `SgToolbarOrientationContext` do React), mais a chave da toolbar para posicionar a dica. Fora de uma SgToolBar, vale `vertical`. | `lib/src/layout/menu/sg_toolbar_icon_button.dart` |
| `sgToolbarSeverityColors` | função | `BTN_COLORS` do React: fundo, texto e anel por severidade, lidos dos aliases do tema. | `lib/src/layout/menu/sg_toolbar_icon_button.dart` |
| `kSgToolBarNarrowWidth` | const | Largura (600 px) abaixo da qual o menu de overflow da `SgToolBar` abre como painel inferior. | `lib/src/layout/menu/sg_tool_bar.dart` |
| `kSgGridBreakpoints` | const | Breakpoints do React em px de largura da janela (`sm` 640 ... `2xl` 1536). | `lib/src/layout/basic/sg_grid.dart` |
| `kSgDockSideColumn` | const | 12rem do React (192 px): largura das colunas laterais do `SgDockScreen`. | `lib/src/layout/dock/sg_dock_screen.dart` |

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase: o comportamento descrito vem da leitura de `lib/src/layout/` no commit `e9989b8`.
- Não conferi o aspecto visual nem o comportamento em dispositivo (a tabela de paridade também registra "não testado em IME nem em dispositivo" e goldens com a fonte de teste).
- Comentários de cabeçalho de alguns arquivos estão defasados em relação ao código (por exemplo, `layout/menu/sg_menu.dart` diz que `collapsedWidth` não aceita `rem`, e `dock/sg_dock_layout.dart` diz que o `SgEnvironmentProvider` "ainda não foi portado"); nesta nota vale o código e o `docs/PARIDADE.md`.
- A coluna "Para que serve" foi reescrita a partir da descrição do contrato gerado (texto original do React, sem acentos); `docs/PARIDADE.md` diz "dica sempre abaixo" para o `SgToolbarIconButton`, mas o código a posiciona também acima/à direita (ver a API).
