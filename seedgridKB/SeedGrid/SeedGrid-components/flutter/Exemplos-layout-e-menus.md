---
description: "Flutter (nota anterior, commit 314cb5a): exemplos Flutter de Layout, contêineres e menus copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos, plataforma-flutter]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Layout, contêineres e menus

> **Plataforma: Flutter.** Nota anterior, por tema, mantida como estava no commit `314cb5a` (não foi revista contra o commit `e9989b8`). Os exemplos **atuais e completos por grupo** estão em: [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos|Layout]] · [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Navegação e overlay]].

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgGrid

Fonte: `apps/seedgrid_showcase/lib/pages/sg_grid_page.dart` (5 exemplo(s) na página; abaixo 2).

### Colunas fixas

Região `sgGridColunas` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 3,
  gap: 8,
  children: [
    for (var i = 1; i <= 6; i++)
      SgPanel(
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('Célula $i')],
      ),
  ],
)
```

### Largura mínima automática

Região `sgGridAuto` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  minItemWidth: 140,
  gap: 8,
  children: [
    for (var i = 1; i <= 5; i++)
      SgPanel(
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('Cartão $i')],
      ),
  ],
)
```

## SgStack

Fonte: `apps/seedgrid_showcase/lib/pages/sg_stack_page.dart` (4 exemplo(s) na página; abaixo 2).

### Coluna com gap

Região `sgStackColuna` em `sg_stack_page.snippets.g.dart`.

```dart
const SgStack(
  gap: 8,
  children: [
    SgBadge(value: Text('Primeiro')),
    SgBadge(value: Text('Segundo')),
    SgBadge(value: Text('Terceiro')),
  ],
)
```

### grow dentro de uma linha

Região `sgStackGrow` em `sg_stack_page.snippets.g.dart`.

```dart
Row(
  children: [
    const SgStack(
      grow: true,
      children: [
        Text('Este bloco cresce e empurra o botão para a direita.'),
      ],
    ),
    SgButton(label: const Text('OK'), onClick: () {}),
  ],
)
```

## SgPanel

Fonte: `apps/seedgrid_showcase/lib/pages/sg_panel_page.dart` (4 exemplo(s) na página; abaixo 2).

### Estilos de borda

Região `sgPanelBorda` em `sg_panel_page.snippets.g.dart`.

```dart
const SgStack(
  gap: 8,
  children: [
    SgPanel(contentPadding: 8, children: [Text('dashed (padrão)')]),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      contentPadding: 8,
      children: [Text('solid')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.none,
      contentPadding: 8,
      children: [Text('none')],
    ),
  ],
)
```

### Rolagem

Região `sgPanelRolagem` em `sg_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 120,
  child: SgPanel(
    borderStyle: SgPanelBorderStyle.solid,
    scrollable: true,
    contentPadding: 8,
    children: [for (var i = 1; i <= 12; i++) Text('Linha $i')],
  ),
)
```

## SgGroupBox

Fonte: `apps/seedgrid_showcase/lib/pages/sg_group_box_page.dart` (3 exemplo(s) na página; abaixo 2).

### Agrupando campos

Região `sgGroupBoxCampos` em `sg_group_box_page.snippets.g.dart`.

```dart
const SgGroupBox(
  title: 'Dados do cliente',
  child: SgStack(
    gap: 12,
    children: [
      SgInputText(id: 'gb-nome', labelText: 'Nome'),
      SgInputText(id: 'gb-email', labelText: 'E-mail'),
    ],
  ),
)
```

### Várias caixas lado a lado

Região `sgGroupBoxLado` em `sg_group_box_page.snippets.g.dart`.

```dart
const SgGrid(
  minItemWidth: 200,
  gap: 12,
  children: [
    SgGroupBox(
      title: 'Entrega',
      child: Text('Rua das Flores, 100'),
    ),
    SgGroupBox(title: 'Cobrança', child: Text('Mesmo endereço')),
  ],
)
```

## SgScreen

Fonte: `apps/seedgrid_showcase/lib/pages/sg_screen_page.dart` (3 exemplo(s) na página; abaixo 2).

### Tela com docking

Região `sgScreenDocking` em `sg_screen_page.snippets.g.dart`.

```dart
SgScreen(
  height: 240,
  padding: 8,
  children: [
    SgPanel(
      align: SgPanelAlign.top,
      height: 20,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Cabeçalho')],
    ),
    SgPanel(
      align: SgPanelAlign.left,
      width: 25,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Menu')],
    ),
    SgPanel(
      align: SgPanelAlign.client,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Conteúdo')],
    ),
  ],
)
```

### width e height

Região `sgScreenTamanho` em `sg_screen_page.snippets.g.dart`.

```dart
const SgScreen(
  width: '60%',
  height: 120,
  padding: 12,
  children: [Text('60% da largura, 120 de altura')],
)
```

## SgCard

Fonte: `apps/seedgrid_showcase/lib/pages/sg_card_page.dart` (5 exemplo(s) na página; abaixo 2).

### Estilos

Região `sgCardEstilos` em `sg_card_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 12,
  children: [
    for (final s in SgCardCardStyle.values)
      SizedBox(
        width: 220,
        child: SgCard(
          cardStyle: s,
          title: Text(s.value),
          child: const Text('Conteúdo do cartão'),
        ),
      ),
  ],
)
```

### Recolhível

Região `sgCardRecolhivel` em `sg_card_page.snippets.g.dart`.

```dart
SgCard(
  collapsible: true,
  open: _aberto,
  onOpenChange: (v) => setState(() => _aberto = v),
  title: const Text('Detalhes'),
  description: Text(_aberto ? 'aberto' : 'recolhido'),
  child: const Text('Este conteúdo aparece e some com animação.'),
)
```

## SgAccordion

Fonte: `apps/seedgrid_showcase/lib/pages/sg_accordion_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgAccordionBasico` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(
  items: [
    SgAccordionItem(
      title: Text('Entrega'),
      content: Text('Prazo de 2 a 5 dias úteis, conforme o CEP.'),
    ),
    SgAccordionItem(
      title: Text('Pagamento'),
      content: Text('Cartão, boleto ou Pix.'),
      end: Text('3 formas'),
    ),
    SgAccordionItem(
      title: Text('Trocas'),
      content: Text('Até 30 dias após o recebimento.'),
      icon: Icon(Icons.swap_horiz, size: 18),
    ),
    SgAccordionItem(
      title: Text('Indisponível'),
      content: Text('Este item está desabilitado.'),
      disabled: true,
    ),
  ],
)
```

### Sempre um aberto (collapsible: false)

Região `sgAccordionSemFechar` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(items: _itens, collapsible: false)
```

## SgExpandablePanel

Fonte: `apps/seedgrid_showcase/lib/pages/sg_expandable_panel_page.dart` (4 exemplo(s) na página; abaixo 2).

### Lateral (inline)

Região `sgExpandableLateral` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 200,
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      SgExpandablePanel(
        expandTo: SgExpandablePanelExpandTo.right,
        open: _lateral,
        onOpenChange: (v) => setState(() => _lateral = v),
        size: const SgExpandablePanelSize(defaultSize: 180),
        header: const Text('Filtros'),
        child: const Text('Conteúdo do painel'),
      ),
      const SizedBox(width: 12),
      Expanded(
        child: Align(
          alignment: Alignment.topLeft,
          child: SgButton(
            label: Text(
              _lateral ? 'Fechar painel' : 'Abrir painel',
            ),
            onClick: () => setState(() => _lateral = !_lateral),
          ),
        ),
      ),
    ],
  ),
)
```

### Redimensionável

Região `sgExpandableRedimensionavel` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 140,
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      SgExpandablePanel(
        expandTo: SgExpandablePanelExpandTo.right,
        open: _redimensionavel,
        resizable: true,
        size: const SgExpandablePanelSize(
          defaultSize: 260,
          min: 160,
          max: 360,
        ),
        onSizeChange: (v) => setState(() => _tamanho = v),
        child: const Text('Arraste a borda'),
      ),
    ],
  ),
)
```

## SgBreadcrumb

Fonte: `apps/seedgrid_showcase/lib/pages/sg_breadcrumb_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgBreadcrumbBasico` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
SgBreadcrumb(
  items: [
    SgBreadcrumbItem(
      id: 'a',
      label: const Text('Início'),
      href: '/',
    ),
    SgBreadcrumbItem(
      id: 'b',
      label: const Text('Relatórios'),
      href: '/relatorios',
    ),
    const SgBreadcrumbItem(id: 'c', label: Text('Vendas')),
  ],
  onNavigate: (item, index) =>
      setState(() => _ultimo = '${item.id} (índice $index)'),
)
```

### Muitos níveis: maxItems

Região `sgBreadcrumbMaxitems` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
SgBreadcrumb(
  items: _caminho,
  maxItems: 4,
  onNavigate: (item, index) =>
      setState(() => _ultimo = '${item.id} (índice $index)'),
)
```

## SgPageControlDemo

Fonte: `apps/seedgrid_showcase/lib/pages/sg_page_control_demo_page.dart` (4 exemplo(s) na página; abaixo 2).

### Abas básicas

Região `sgPageControlBasico` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
const SgPageControl(
  children: [
    SgPageControlPage(
      id: 'geral',
      title: Text('Geral'),
      child: Text('Dados gerais do cadastro.'),
    ),
    SgPageControlPage(
      id: 'endereco',
      title: Text('Endereço'),
      hint: 'Endereço de entrega',
      icon: Icon(Icons.place_outlined),
      child: Text('Rua, número e CEP.'),
    ),
    SgPageControlPage(
      id: 'bloqueada',
      title: Text('Bloqueada'),
      disabled: true,
      child: Text('Nunca aparece.'),
    ),
  ],
)
```

### No celular: lista de seleção

Região `sgPageControlCelular` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
const SgPageControl(
  mobilePageControl: SgPageControlMobilePageControl.select,
  keepMounted: true,
  children: [
    SgPageControlPage(
      title: Text('Perfil'),
      child: Text('Perfil do usuário'),
    ),
    SgPageControlPage(
      title: Text('Segurança'),
      child: Text('Senha e acesso'),
    ),
    SgPageControlPage(
      title: Text('Notificações'),
      child: Text('Avisos por e-mail'),
    ),
  ],
)
```

## SgCarousel

Fonte: `apps/seedgrid_showcase/lib/pages/sg_carousel_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgCarouselBasico` em `sg_carousel_page.snippets.g.dart`.

```dart
SgCarousel(
  height: 160,
  items: _slides(5),
  onIndexChange: (i) => setState(() => _slide = i),
)
```

### Vários itens visíveis

Região `sgCarouselVarios` em `sg_carousel_page.snippets.g.dart`.

```dart
SgCarousel(
  height: 120,
  items: _slides(8),
  numVisible: 3,
  numScroll: 2,
  gap: 12,
  circular: false,
)
```

## SgDockLayout

Fonte: `apps/seedgrid_showcase/lib/pages/sg_dock_layout_page.dart` (3 exemplo(s) na página; abaixo 1).

### Zonas ao redor da área de trabalho

Região `sgDockLayoutBasico` em `sg_dock_layout_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: SgDockLayout(
    id: 'showcase-dock-basico',
    child: Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black26),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Stack(
        children: [
          Positioned(
            left: 0,
            right: 0,
            top: 0,
            child: SgDockZone(
              zone: SgDockZoneId.top,
              children: [
                SgButton(
                  label: Text('Início'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                ),
                SgButton(
                  label: Text('Buscar'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            top: 60,
            bottom: 0,
            width: 150,
            child: SgDockZone(
              zone: SgDockZoneId.left,
              children: [
                SgButton(
                  label: Text('Clientes'),
                  size: SgSize.sm,
                  appearance: SgAppearance.ghost,
                ),
                SgButton(
                  label: Text('Config'),
                  size: SgSize.sm,
                  appearance: SgAppearance.ghost,
                ),
              ],
            ),
          ),
          Positioned.fill(
            child: SgDockZone(
              zone: SgDockZoneId.free,
              child: Text('Área central livre'),
            ),
          ),
        ],
      ),
    ),
  ),
)
```

## SgDockZone

Fonte: `apps/seedgrid_showcase/lib/pages/sg_dock_zone_page.dart` (4 exemplo(s) na página; abaixo 2).

### Zona horizontal (top e bottom)

Região `sgDockZoneHorizontal` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: const SgDockZone(
    zone: SgDockZoneId.top,
    children: [
      SgButton(label: Text('Novo'), size: SgSize.sm),
      SgButton(
        label: Text('Abrir'),
        size: SgSize.sm,
        appearance: SgAppearance.outline,
      ),
      SgButton(
        label: Text('Salvar'),
        size: SgSize.sm,
        appearance: SgAppearance.outline,
      ),
      SgButton(
        label: Text('Imprimir'),
        size: SgSize.sm,
        appearance: SgAppearance.outline,
      ),
    ],
  ),
)
```

### Zona livre (free)

Região `sgDockZoneLivre` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  height: 140,
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: const SgDockZone(
    zone: SgDockZoneId.free,
    height: 140,
    child: Text('Área central livre'),
  ),
)
```

## SgDockScreen

Fonte: `apps/seedgrid_showcase/lib/pages/sg_dock_screen_page.dart` (3 exemplo(s) na página; abaixo 2).

### Tela com as cinco zonas

Região `sgDockScreenBasico` em `sg_dock_screen_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(12),
  ),
  child: const SgDockScreen(
    id: 'showcase-dock-screen-basico',
    fullscreen: false,
    height: 320,
    children: [
      SgDockZone(
        zone: SgDockZoneId.top,
        children: [
          SgButton(
            label: Text('Início'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
          ),
          SgButton(
            label: Text('Buscar'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
          ),
        ],
      ),
      SgDockZone(
        zone: SgDockZoneId.bottom,
        children: [
          SgButton(
            label: Text('Relatórios'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
          ),
        ],
      ),
      SgDockZone(
        zone: SgDockZoneId.left,
        children: [
          SgButton(
            label: Text('Clientes'),
            size: SgSize.sm,
            appearance: SgAppearance.ghost,
          ),
          SgButton(
            label: Text('Config'),
            size: SgSize.sm,
            appearance: SgAppearance.ghost,
          ),
        ],
      ),
      SgDockZone(
        zone: SgDockZoneId.right,
        children: [
          SgButton(
            label: Text('Equipe'),
            size: SgSize.sm,
            appearance: SgAppearance.ghost,
          ),
        ],
      ),
      SgDockZone(
        zone: SgDockZoneId.free,
        child: Text('Área central livre'),
      ),
    ],
  ),
)
```

### Conteúdo no centro

Região `sgDockScreenConteudo` em `sg_dock_screen_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(12),
  ),
  child: const SgDockScreen(
    id: 'showcase-dock-screen-conteudo',
    fullscreen: false,
    height: 200,
    children: [
      SgDockZone(zone: SgDockZoneId.left, child: Text('Menu')),
      Center(child: Text('Conteúdo da página')),
      SgDockZone(zone: SgDockZoneId.right, child: Text('Ajuda')),
    ],
  ),
)
```

## SgTreeView

Fonte: `apps/seedgrid_showcase/lib/pages/sg_tree_view_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgTreeViewBasico` em `sg_tree_view_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgTreeView(
      defaultExpandedIds: const ['frutas'],
      onLeafClick: (id) => setState(() => _clicado = id),
      nodes: const [
        SgTreeNode(
          id: 'frutas',
          label: 'Frutas',
          children: [
            SgTreeNode(id: 'maca', label: 'Maçã'),
            SgTreeNode(
              id: 'citricos',
              label: 'Cítricos',
              children: [
                SgTreeNode(id: 'laranja', label: 'Laranja'),
                SgTreeNode(id: 'limao', label: 'Limão'),
              ],
            ),
          ],
        ),
        SgTreeNode(id: 'graos', label: 'Grãos'),
        SgTreeNode(
          id: 'bloqueado',
          label: 'Bloqueado',
          disabled: true,
        ),
      ],
    ),
    const SizedBox(height: 8),
    Text('Última folha clicada: $_clicado'),
  ],
)
```

### Busca

Região `sgTreeViewBusca` em `sg_tree_view_page.snippets.g.dart`.

```dart
const SgTreeView(
  searchable: true,
  defaultSearchValue: 'couve',
  nodes: [
    SgTreeNode(
      id: 'verduras',
      label: 'Verduras',
      children: [
        SgTreeNode(id: 'alface', label: 'Alface'),
        SgTreeNode(id: 'couve', label: 'Couve'),
      ],
    ),
    SgTreeNode(
      id: 'legumes',
      label: 'Legumes',
      children: [SgTreeNode(id: 'cenoura', label: 'Cenoura')],
    ),
  ],
)
```

## SgMenu

Fonte: `apps/seedgrid_showcase/lib/pages/sg_menu_page.dart` (6 exemplo(s) na página; abaixo 2).

### Básico (painel em árvore)

Região `sgMenuBasico` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 360,
  child: SgMenu(
    id: 'menu-basico',
    ariaLabel: 'Navegação principal',
    onItemClick: (node) => setState(() => _ultimo = node.id),
    menu: const [
      SgMenuNode(
        id: 'inicio',
        label: 'Início',
        icon: Icon(Icons.home_outlined),
        url: '/inicio',
      ),
      SgMenuNode(
        id: 'vendas',
        label: 'Vendas',
        icon: Icon(Icons.shopping_cart_outlined),
        badge: 3,
        children: [
          SgMenuNode(
            id: 'pedidos',
            label: 'Pedidos',
            url: '/pedidos',
          ),
          SgMenuNode(
            id: 'clientes',
            label: 'Clientes',
            url: '/clientes',
          ),
        ],
      ),
      SgMenuNode(
        id: 'ajustes',
        label: 'Ajustes',
        icon: Icon(Icons.settings_outlined),
        disabled: true,
      ),
    ],
  ),
)
```

### Gaveta (drawer)

Região `sgMenuDrawer` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 120,
  child: Stack(
    children: [
      SgButton(
        label: const Text('Abrir menu'),
        onClick: () => setState(() => _gaveta = true),
      ),
      SgMenu(
        id: 'menu-drawer',
        menuStyle: SgMenuMenuStyle.drawer,
        open: _gaveta,
        onOpenChange: (aberto) => setState(() => _gaveta = aberto),
        menu: const [
          SgMenuNode(id: 'a', label: 'Primeiro item'),
          SgMenuNode(id: 'b', label: 'Segundo item'),
        ],
      ),
    ],
  ),
)
```

## SgToolBar

Fonte: `apps/seedgrid_showcase/lib/pages/sg_tool_bar_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgToolBarBasico` em `sg_tool_bar_page.snippets.g.dart`.

```dart
Align(
  alignment: Alignment.centerLeft,
  child: SgToolBar(
    id: 'tb-basico',
    title: const Text('Ações'),
    children: [
      SgToolbarIconButton(
        icon: const Icon(Icons.add),
        label: 'Novo',
        hint: 'Criar um registro',
        severity: SgToolbarIconButtonSeverity.primary,
        onClick: () => setState(() => _ultimo = 'Novo'),
      ),
      SgToolbarIconButton(
        icon: const Icon(Icons.edit_outlined),
        label: 'Editar',
        onClick: () => setState(() => _ultimo = 'Editar'),
      ),
      SgToolbarIconButton(
        icon: const Icon(Icons.delete_outline),
        label: 'Excluir',
        severity: SgToolbarIconButtonSeverity.danger,
        onClick: () => setState(() => _ultimo = 'Excluir'),
      ),
    ],
  ),
)
```

### Arrastar livremente

Região `sgToolBarArrastar` em `sg_tool_bar_page.snippets.g.dart`.

```dart
SizedBox(
  width: double.infinity,
  height: 220,
  child: Stack(
    children: [
      SgToolBar(
        id: 'tb-arrastar',
        title: const Text('Arraste-me'),
        freeDrag: true,
        draggable: true,
        defaultPosition: const Offset(24, 24),
        children: const [
          SgToolbarIconButton(
            icon: Icon(Icons.star_outline),
            label: 'Favorito',
          ),
          SgToolbarIconButton(
            icon: Icon(Icons.share_outlined),
            label: 'Compartilhar',
          ),
        ],
      ),
    ],
  ),
)
```

## SgToolbarIconButton

Fonte: `apps/seedgrid_showcase/lib/pages/sg_toolbar_icon_button_page.dart` (3 exemplo(s) na página; abaixo 2).

### Básico

Região `sgToolbarIconButtonBasico` em `sg_toolbar_icon_button_page.snippets.g.dart`.

```dart
SgToolbarIconButton(
  icon: const Icon(Icons.add),
  label: 'Novo',
  hint: 'Criar um registro',
  onClick: () => setState(() => _cliques++),
)
```

### Severidades

Região `sgToolbarIconButtonSeveridades` em `sg_toolbar_icon_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    for (final s in SgToolbarIconButtonSeverity.values)
      SgToolbarIconButton(
        icon: const Icon(Icons.circle_outlined),
        label: s.value,
        severity: s,
      ),
  ],
)
```

## SgDockMenu

Fonte: `apps/seedgrid_showcase/lib/pages/sg_dock_menu_page.dart` (4 exemplo(s) na página; abaixo 2).

### Dock básico

Região `sgDockMenuBasico` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 220,
  child: Stack(
    children: [
      SgDockMenu(
        items: [
          SgDockMenuItem(
            id: 'home',
            icon: const Icon(Icons.home),
            label: 'Início',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'search',
            icon: const Icon(Icons.search),
            label: 'Buscar',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'settings',
            icon: const Icon(Icons.settings),
            label: 'Ajustes',
            onClick: () {},
          ),
        ],
      ),
    ],
  ),
)
```

### Arrastar e lembrar a posição

Região `sgDockMenuArrastar` em `sg_dock_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: Stack(
    children: [
      SgDockMenu(
        enableDragDrop: true,
        dragId: 'showcase-dock',
        position: SgDockMenuPosition.centerBottom,
        offset: const SgDockMenuOffset(y: -8),
        items: [
          SgDockMenuItem(
            id: 'play',
            icon: const Icon(Icons.play_arrow),
            label: 'Tocar',
            onClick: () {},
          ),
          SgDockMenuItem(
            id: 'pause',
            icon: const Icon(Icons.pause),
            label: 'Pausar',
            onClick: () {},
          ),
        ],
      ),
    ],
  ),
)
```
