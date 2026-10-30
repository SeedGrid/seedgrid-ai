---
description: "Exemplos Dart de Layout e containers em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, layout, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Layout e containers (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/layout/Exemplos|Exemplos — Layout e containers (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/layout/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de variáveis ou auxiliares do `State` da página (`setState`, `_lateral`, `_slides`...) trazem, logo abaixo do bloco, uma linha **Ajuste** dizendo o que declarar. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgStack

Página: `apps/seedgrid_showcase/lib/pages/sg_stack_page.dart` (4 exemplo(s) na página; abaixo 3).

### Coluna com gap

O padrão é direction: column, align: stretch e gap 0.

Região `sgStackColuna` em `sg_stack_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  children: [
    SgBadge(value: Text('Primeiro')),
    SgBadge(value: Text('Segundo')),
    SgBadge(value: Text('Terceiro')),
  ],
)
```

### Linha com justify

justify distribui no eixo principal; align posiciona no eixo transversal.

Região `sgStackLinha` em `sg_stack_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  justify: SgStackJustify.between,
  align: SgStackAlign.center,
  children: [
    SgButton(
      label: Text('Cancelar'),
      appearance: SgAppearance.outline,
      onClick: () {},
    ),
    SgButton(label: Text('Salvar'), onClick: () {}),
  ],
)
```

### Quebra de linha

wrap: true quebra os filhos em várias linhas; o gap vale nos dois eixos.

Região `sgStackWrap` em `sg_stack_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  gap: 8,
  children: [
    for (final nome in [
      'Dart',
      'Flutter',
      'React',
      'Java',
      'Rust',
      'Quarkus',
      'TypeScript',
    ])
      SgBadge(value: Text(nome)),
  ],
)
```

## SgGrid

Página: `apps/seedgrid_showcase/lib/pages/sg_grid_page.dart` (5 exemplo(s) na página; abaixo 3).

### Colunas fixas

columns: 3 divide a largura em três colunas iguais; gap separa as células.

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

### Colunas por breakpoint

Os breakpoints medem a largura da janela (640, 768, 1024, 1280 e 1536 px), como o @media do React.

Região `sgGridBreakpoints` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  columns: const {'base': 1, 'sm': 2, 'md': 3, 'lg': 4},
  gap: 8,
  children: [
    for (var i = 1; i <= 8; i++)
      SgPanel(
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('Item $i')],
      ),
  ],
)
```

### Largura mínima automática

minItemWidth monta quantas colunas couberem; colunas vazias colapsam.

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

## SgPanel

Página: `apps/seedgrid_showcase/lib/pages/sg_panel_page.dart` (4 exemplo(s) na página; abaixo 3).

### Estilos de borda

O padrão é tracejada (dashed). padding é a margem externa e contentPadding o espaço interno.

Região `sgPanelBorda` em `sg_panel_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  children: [
    SgPanel(
      contentPadding: 8,
      children: [Text('dashed (padrão)')],
    ),
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

### Docking

Filhos SgPanel com align (top, left, client, right, bottom) ocupam as bordas e o miolo; width e height são porcentagens.

Região `sgPanelDocking` em `sg_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 260,
  child: SgPanel(
    borderStyle: SgPanelBorderStyle.solid,
    children: [
      SgPanel(
        align: SgPanelAlign.top,
        height: 15,
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('top')],
      ),
      SgPanel(
        align: SgPanelAlign.left,
        width: 25,
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('left')],
      ),
      SgPanel(
        align: SgPanelAlign.client,
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('client')],
      ),
      SgPanel(
        align: SgPanelAlign.bottom,
        height: 15,
        borderStyle: SgPanelBorderStyle.solid,
        children: [Text('bottom')],
      ),
    ],
  ),
)
```

### Conteúdo em linha

contentDirection, contentGap, contentJustify, contentAlign e contentWrap organizam os filhos soltos.

Região `sgPanelConteudo` em `sg_panel_page.snippets.g.dart`.

```dart
SgPanel(
  borderStyle: SgPanelBorderStyle.solid,
  contentPadding: 8,
  contentDirection: SgPanelContentDirection.row,
  contentJustify: SgPanelContentJustify.between,
  contentAlign: SgPanelContentAlign.center,
  children: [
    Text('Início'),
    SgButton(
      label: Text('Ação'),
      size: SgSize.sm,
      onClick: () {},
    ),
    Text('Fim'),
  ],
)
```

## SgScreen

Página: `apps/seedgrid_showcase/lib/pages/sg_screen_page.dart` (3 exemplo(s) na página; abaixo 3).

### Tela com docking

Os filhos SgPanel com align formam cabeçalho, menu lateral e área principal.

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
      children: [Text('Cabeçalho')],
    ),
    SgPanel(
      align: SgPanelAlign.left,
      width: 25,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('Menu')],
    ),
    SgPanel(
      align: SgPanelAlign.client,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('Conteúdo')],
    ),
  ],
)
```

### Sem tela cheia

fullscreen: false não fixa largura nem altura: o SgScreen tem o tamanho do conteúdo.

Região `sgScreenLivre` em `sg_screen_page.snippets.g.dart`.

```dart
SgScreen(
  fullscreen: false,
  padding: 12,
  children: [
    Text('Altura do conteúdo'),
    Text('Segunda linha'),
  ],
)
```

### width e height

width e height aceitam número (px), "Npx" ou porcentagem e vencem o fullscreen.

Região `sgScreenTamanho` em `sg_screen_page.snippets.g.dart`.

```dart
SgScreen(
  width: '60%',
  height: 120,
  padding: 12,
  children: [Text('60% da largura, 120 de altura')],
)
```

## SgGroupBox

Página: `apps/seedgrid_showcase/lib/pages/sg_group_box_page.dart` (3 exemplo(s) na página; abaixo 3).

### Agrupando campos

A legenda fica sobre a borda, em caixa alta.

Região `sgGroupBoxCampos` em `sg_group_box_page.snippets.g.dart`.

```dart
SgGroupBox(
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

### Largura

O padrão é a largura toda. width aceita px ("240px"), número e porcentagem ("50%").

Região `sgGroupBoxLargura` em `sg_group_box_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  children: [
    SgGroupBox(
      title: 'Metade',
      width: '50%',
      child: Text('width: "50%"'),
    ),
    SgGroupBox(
      title: 'Fixa',
      width: 240,
      child: Text('width: 240'),
    ),
  ],
)
```

### Várias caixas lado a lado

Região `sgGroupBoxLado` em `sg_group_box_page.snippets.g.dart`.

```dart
SgGrid(
  minItemWidth: 200,
  gap: 12,
  children: [
    SgGroupBox(
      title: 'Entrega',
      child: Text('Rua das Flores, 100'),
    ),
    SgGroupBox(
      title: 'Cobrança',
      child: Text('Mesmo endereço'),
    ),
  ],
)
```

## SgCard

Página: `apps/seedgrid_showcase/lib/pages/sg_card_page.dart` (7 exemplo(s) na página; abaixo 3).

### Básico

Título, descrição, conteúdo e rodapé.

Região `sgCardBasico` em `sg_card_page.snippets.g.dart`.

```dart
SgCard(
  title: Text('Resumo financeiro'),
  description: Text('Visão consolidada do dia'),
  footer: Wrap(
    alignment: WrapAlignment.spaceBetween,
    spacing: 12,
    children: [
      Text('Atualizado agora'),
      Text('Última sincronização'),
    ],
  ),
  child: Column(
    spacing: 8,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Receita'),
          Text(
            'R\$ 12.400',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Pedidos'),
          Text('83', style: TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    ],
  ),
)
```

### Leading, trailing e ações

leading e trailing ladeiam o título; actions fica à direita do cabeçalho.

Região `sgCardLeading` em `sg_card_page.snippets.g.dart`.

```dart
SgCard(
  leading: SgAvatar(label: Text('Seed Grid')),
  trailing: SgBadge(value: Text('ativo')),
  title: Text('Conta enterprise'),
  description: Text('Resumo de performance e uso'),
  actions: SgButton(
    label: Text('Ação'),
    appearance: SgAppearance.ghost,
    size: SgSize.sm,
    onClick: () {},
  ),
  footer: Wrap(
    alignment: WrapAlignment.spaceBetween,
    spacing: 12,
    children: [Text('Expira em 12 dias'), Text('+12%')],
  ),
  child: Column(
    spacing: 8,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Receita'),
          Text(
            'R\$ 128.400',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Crescimento'),
          Text(
            '+12%',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    ],
  ),
)
```

### Recolhível

collapsible com o botão à direita; defaultOpen escolhe se começa aberto ou recolhido. Clique no cabeçalho ou no botão.

Região `sgCardRecolhivel` em `sg_card_page.snippets.g.dart`.

```dart
Column(
  children: [
    SgCard(
      title: Text('Painel recolhido'),
      description: Text('Abre sob demanda'),
      collapsible: true,
      defaultOpen: false,
      collapseToggleAlign: SgCardCollapseToggleAlign.right,
      collapseIconSize: 20,
      footer: Align(
        alignment: Alignment.centerRight,
        child: SgButton(
          label: Text('Ação'),
          size: SgSize.sm,
          onClick: () {},
        ),
      ),
      child: Text('Conteúdo recolhível do card.'),
    ),
    const SizedBox(height: 16),
    SgCard(
      title: Text('Painel aberto'),
      description: Text('Começa expandido'),
      collapsible: true,
      defaultOpen: true,
      collapseToggleAlign: SgCardCollapseToggleAlign.right,
      collapseIconSize: 20,
      footer: Wrap(
        alignment: WrapAlignment.spaceBetween,
        spacing: 12,
        children: [
          Text('128 itens'),
          Text('R\$ 9.820'),
        ],
      ),
      child: Column(
        spacing: 8,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tickets'),
              Text(
                '128',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Valor'),
              Text(
                'R\$ 9.820',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    ),
  ],
)
```

## SgAccordion

Página: `apps/seedgrid_showcase/lib/pages/sg_accordion_page.dart` (6 exemplo(s) na página; abaixo 3).

### Básico

Um aberto por vez; o primeiro abre sozinho (defaultOpenFirst). Os próximos exemplos usam esta mesma lista de itens (aqui escrita por extenso).

Região `sgAccordionBasico` em `sg_accordion_page.snippets.g.dart`.

```dart
SgAccordion(
  items: [
    SgAccordionItem(
      title: Text('Entrega'),
      content: Text(
        'Prazo de 2 a 5 dias úteis, conforme o CEP.',
      ),
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

### Vários abertos

Região `sgAccordionMultiplo` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(
  items: _itens,
  multiple: true,
  defaultActiveIndex: [0, 2],
)
```

Ajuste: `_itens` é uma `static const List<SgAccordionItem>` da página; use a mesma lista de quatro itens (Entrega, Pagamento, Trocas e Indisponível) do primeiro exemplo desta seção.

### Cor do cabeçalho e animação

headerBackgroundColor pinta os cabeçalhos; animationDuration (ms) ajusta a velocidade de abrir e fechar.

Região `sgAccordionCores` em `sg_accordion_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final escuro = Theme.of(context).brightness == Brightness.dark;
    return SgAccordion(
      headerBackgroundColor: escuro ? '#164E63' : '#E0F2FE',
      animationDuration: 600,
      items: [
        SgAccordionItem(
          title: Text('Primeiro'),
          content: Text('Abre devagar (600 ms).'),
        ),
        SgAccordionItem(
          title: Text('Segundo'),
          content: Text('Cabeçalho com outra cor.'),
          headerBackgroundColor: escuro ? '#713F12' : '#FEF3C7',
        ),
      ],
    );
  },
)
```

## SgPageControl

Página: `apps/seedgrid_showcase/lib/pages/sg_page_control_demo_page.dart` (4 exemplo(s) na página; abaixo 3).

### Abas básicas

Cada aba é um SgPageControlPage; só o painel ativo existe na tela.

Região `sgPageControlBasico` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
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

### Pílulas, tamanhos e abas iguais

Região `sgPageControlPilulas` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
  pageControlStyle: SgPageControlPageControlStyle.pills,
  size: SgPageControlSize.sm,
  fullWidthTabs: true,
  children: [
    SgPageControlPage(
      title: Text('Dia'),
      child: Text('Visão do dia'),
    ),
    SgPageControlPage(
      title: Text('Semana'),
      child: Text('Visão da semana'),
    ),
    SgPageControlPage(
      title: Text('Mês'),
      child: Text('Visão do mês'),
    ),
  ],
)
```

### No celular: lista de seleção

Abaixo de 768 px as abas viram uma lista (mobilePageControl: select). Estreite a janela para ver.

Região `sgPageControlCelular` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
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

## SgPageControlPage

Sem página de showcase própria: o `SgPageControlPage` aparece dentro dos exemplos de `SgPageControl` (acima), onde cada aba é uma `SgPageControlPage`. Veja a [[SeedGrid/SeedGrid-components/flutter/layout/API|API]].

## SgExpandablePanel

Página: `apps/seedgrid_showcase/lib/pages/sg_expandable_panel_page.dart` (7 exemplo(s) na página; abaixo 3).

### Lateral (inline)

O painel empurra o conteúdo ao lado: a largura anima de 0 até o tamanho.

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
        header: Text('Filtros'),
        child: Text('Conteúdo do painel'),
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

Ajuste: o trecho usa a variável de estado `bool _lateral = true;` e `setState`; declare-a no `State` do widget que contém o exemplo.

### Inferior com cabeçalho e rodapé

Região `sgExpandableInferior` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text(_inferior ? 'Recolher' : 'Expandir'),
      onClick: () => setState(() => _inferior = !_inferior),
    ),
    const SizedBox(height: 8),
    SgExpandablePanel(
      expandTo: SgExpandablePanelExpandTo.bottom,
      open: _inferior,
      size: const SgExpandablePanelSize(defaultSize: 150),
      header: Text('Detalhes'),
      footer: Text('Rodapé'),
      rounded: SgExpandablePanelRounded.xl,
      child: Text(
        'Mais informações aparecem aqui embaixo.',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa `bool _inferior = false;` e `setState` num `State`; declare a variável no widget que contém o exemplo.

### Overlay (gaveta)

Sobre a tela, com fundo escurecido. Esc ou toque fora fecham; o foco fica dentro do painel.

Região `sgExpandableOverlay` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir gaveta'),
      onClick: () => setState(() => _overlay = true),
    ),
    SgExpandablePanel(
      mode: SgExpandablePanelMode.overlay,
      expandTo: SgExpandablePanelExpandTo.right,
      open: _overlay,
      onOpenChange: (v) => setState(() => _overlay = v),
      header: Text('Menu'),
      footer: SgButton(
        label: Text('Fechar'),
        onClick: () => setState(() => _overlay = false),
      ),
      child: Text('Itens do menu lateral.'),
    ),
  ],
)
```

Ajuste: o trecho usa `bool _overlay = false;` e `setState` num `State`; declare a variável no widget que contém o exemplo. Como `onOpenChange` só dispara no modo `overlay` (Esc ou toque no fundo), é ele que fecha a gaveta.

## SgCarousel

Página: `apps/seedgrid_showcase/lib/pages/sg_carousel_page.dart` (4 exemplo(s) na página; abaixo 3).

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

Ajuste: `_slides(n)` é um método estático da página: `static List<Widget> _slides(int n) => [for (var i = 0; i < n; i++) Container(decoration: BoxDecoration(color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400, borderRadius: BorderRadius.circular(8)), alignment: Alignment.center, child: Text('Slide ${i + 1}', style: const TextStyle(color: Colors.white, fontSize: 20)))];`. Os outros exemplos do carrossel usam o mesmo auxiliar.

### Reprodução automática

Avança a cada 2 s e pausa enquanto você toca ou passa o mouse.

Região `sgCarouselAutoplay` em `sg_carousel_page.snippets.g.dart`.

```dart
SgCarousel(
  height: 140,
  items: _slides(4),
  autoPlay: true,
  autoPlayInterval: 2000,
  showNavigators: false,
)
```

### Vertical e navegadores próprios

Região `sgCarouselVertical` em `sg_carousel_page.snippets.g.dart`.

```dart
SgCarousel(
  height: 200,
  width: 260,
  orientation: SgCarouselOrientation.vertical,
  items: _slides(4),
  customNavigators: const SgCarouselNavigators(
    prev: Icon(Icons.expand_less),
    next: Icon(Icons.expand_more),
  ),
)
```

## SgBreadcrumb

Página: `apps/seedgrid_showcase/lib/pages/sg_breadcrumb_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Região `sgBreadcrumbBasico` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
SgBreadcrumb(
  items: [
    SgBreadcrumbItem(
      id: 'a',
      label: Text('Início'),
      href: '/',
    ),
    SgBreadcrumbItem(
      id: 'b',
      label: Text('Relatórios'),
      href: '/relatorios',
    ),
    SgBreadcrumbItem(id: 'c', label: Text('Vendas')),
  ],
  onNavigate: (item, index) =>
      setState(() => _ultimo = '${item.id} (índice $index)'),
)
```

Ajuste: o trecho grava em `String _ultimo = 'nada ainda';` com `setState`; declare a variável num `State`.

### Início, ícones e separadores

Região `sgBreadcrumbSeparadores` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    for (final s in SgBreadcrumbSeparator.values)
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: SgBreadcrumb(
          showHomeIcon: true,
          separator: s,
          items: [
            SgBreadcrumbItem(
              id: 'a',
              label: Text('Pasta'),
              href: '/p',
              icon: Icon(Icons.folder_outlined),
            ),
            SgBreadcrumbItem(id: 'b', label: Text(s.name)),
          ],
        ),
      ),
  ],
)
```

### Rolagem, tamanhos e variantes

Região `sgBreadcrumbVariantes` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgBreadcrumb(
      items: _caminho,
      overflowBehavior: SgBreadcrumbOverflowBehavior.scroll,
      size: SgBreadcrumbSize.sm,
    ),
    const SizedBox(height: 8),
    SgBreadcrumb(
      items: _caminho.take(3).toList(),
      variant: SgBreadcrumbVariant.subtle,
    ),
    const SizedBox(height: 8),
    SgBreadcrumb(
      items: _caminho.take(3).toList(),
      variant: SgBreadcrumbVariant.primary,
      size: SgBreadcrumbSize.lg,
    ),
  ],
)
```

Ajuste: `_caminho` é uma `static final` da página: lista de `SgBreadcrumbItem(id: 'n$i', label: Text(nome), href: '/n$i')` para os nomes Loja, Eletrônicos, Celulares, Android, Samsung e Galaxy S.

## SgMenu

Página: `apps/seedgrid_showcase/lib/pages/sg_menu_page.dart` (7 exemplo(s) na página; abaixo 3).

### Acordeão, seleção e expansão inicial

mode accordion mantém um grupo aberto por vez; selection destaca o item ativo e abre o caminho até ele.

Região `sgMenuAcordeao` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 360,
  child: SgMenu(
    id: 'menu-acordeao',
    mode: SgMenuMode.accordion,
    selection: const SgMenuSelection(activeId: 'relatorio-mensal'),
    indent: 20,
    menu: [
      SgMenuNode(
        id: 'relatorios',
        label: 'Relatórios',
        children: [
          SgMenuNode(
            id: 'relatorio-mensal',
            label: 'Mensal',
          ),
          SgMenuNode(
            id: 'relatorio-anual',
            label: 'Anual',
          ),
        ],
      ),
      SgMenuNode(
        id: 'cadastros',
        label: 'Cadastros',
        children: [
          SgMenuNode(id: 'produtos', label: 'Produtos'),
          SgMenuNode(
            id: 'fornecedores',
            label: 'Fornecedores',
          ),
        ],
      ),
    ],
  ),
)
```

### Recolher, marca, busca e usuário

Botão de recolher (trilho de ícones), marca no topo, busca integrada e bloco do usuário.

Região `sgMenuRecolher` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 460,
  child: SgMenu(
    id: 'menu-recolher',
    showCollapseButton: true,
    brand: SgMenuBrand(title: 'SeedGrid'),
    search: SgMenuSearch(
      enabled: true,
      placeholder: 'Buscar no menu',
    ),
    user: SgMenuUser(
      name: 'Ana Souza',
      subtitle: 'Administradora',
    ),
    footer: const Text('v1.0'),
    menu: [
      SgMenuNode(
        id: 'painel',
        label: 'Painel',
        icon: Icon(Icons.dashboard_outlined),
      ),
      SgMenuNode(
        id: 'equipe',
        label: 'Equipe',
        icon: Icon(Icons.group_outlined),
        children: [
          SgMenuNode(id: 'membros', label: 'Membros'),
          SgMenuNode(id: 'convites', label: 'Convites'),
        ],
      ),
    ],
  ),
)
```

### Variante tiered (submenus em cascata)

Os submenus abrem em camadas ao clicar (ou ao passar o mouse com openSubmenuOnHover). Em telas estreitas vira árvore.

Região `sgMenuTiered` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 300,
  child: SgMenu(
    id: 'menu-tiered',
    menuVariantStyle: SgMenuMenuVariantStyle.tiered,
    openSubmenuOnHover: true,
    menu: [
      SgMenuNode(
        id: 'arquivo',
        label: 'Arquivo',
        children: [
          SgMenuNode(id: 'novo', label: 'Novo'),
          SgMenuNode(
            id: 'exportar',
            label: 'Exportar',
            children: [
              SgMenuNode(id: 'pdf', label: 'PDF'),
              SgMenuNode(id: 'csv', label: 'CSV'),
            ],
          ),
        ],
      ),
      SgMenuNode(id: 'editar', label: 'Editar'),
    ],
  ),
)
```

## SgTreeView

Página: `apps/seedgrid_showcase/lib/pages/sg_tree_view_page.dart` (9 exemplo(s) na página; abaixo 3).

### Busca

O filtro mostra só os achados e seus ancestrais, e abre os ancestrais (expandMatchesOnSearch).

Região `sgTreeViewBusca` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgTreeView(
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
      children: [
        SgTreeNode(id: 'cenoura', label: 'Cenoura'),
      ],
    ),
  ],
)
```

### Tom e ícones

iconTone destaca os ícones com a cor primária; tone: muted suaviza os rótulos; cada nó aceita um icon.

Região `sgTreeViewTom` em `sg_tree_view_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgTreeView(
      defaultExpandedIds: ['docs'],
      iconTone: SgTreeViewIconTone.primary,
      nodes: [
        SgTreeNode(
          id: 'docs',
          label: 'Documentos',
          icon: Icon(Icons.folder_outlined, size: 16),
          children: [
            SgTreeNode(
              id: 'contrato',
              label: 'Contrato',
              icon: Icon(Icons.description_outlined, size: 16),
            ),
            SgTreeNode(
              id: 'nota',
              label: 'Nota fiscal',
              icon: Icon(Icons.receipt_long_outlined, size: 16),
            ),
          ],
        ),
        SgTreeNode(
          id: 'img',
          label: 'Imagens',
          icon: Icon(Icons.image_outlined, size: 16),
        ),
      ],
    ),
    SizedBox(height: 12),
    SgTreeView(
      defaultExpandedIds: ['docs'],
      tone: SgTreeViewTone.muted,
      nodes: [
        SgTreeNode(
          id: 'docs',
          label: 'Documentos',
          icon: Icon(Icons.folder_outlined, size: 16),
          children: [
            SgTreeNode(
              id: 'contrato',
              label: 'Contrato',
              icon: Icon(Icons.description_outlined, size: 16),
            ),
            SgTreeNode(
              id: 'nota',
              label: 'Nota fiscal',
              icon: Icon(Icons.receipt_long_outlined, size: 16),
            ),
          ],
        ),
        SgTreeNode(
          id: 'img',
          label: 'Imagens',
          icon: Icon(Icons.image_outlined, size: 16),
        ),
      ],
    ),
  ],
)
```

### Tamanho e densidade

size (sm, md, lg) muda a fonte e a altura da linha; density (compact, normal, comfortable) muda o espaçamento.

Região `sgTreeViewTamanho` em `sg_tree_view_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgTreeView(
      size: SgTreeViewSize.sm,
      density: SgTreeViewDensity.compact,
      defaultExpandedIds: ['a'],
      nodes: [
        SgTreeNode(
          id: 'a',
          label: 'Ramo A',
          children: [
            SgTreeNode(id: 'a1', label: 'Folha A1'),
            SgTreeNode(id: 'a2', label: 'Folha A2'),
          ],
        ),
        SgTreeNode(id: 'b', label: 'Folha B'),
      ],
    ),
    SizedBox(height: 12),
    SgTreeView(
      size: SgTreeViewSize.lg,
      density: SgTreeViewDensity.comfortable,
      defaultExpandedIds: ['a'],
      nodes: [
        SgTreeNode(
          id: 'a',
          label: 'Ramo A',
          children: [
            SgTreeNode(id: 'a1', label: 'Folha A1'),
            SgTreeNode(id: 'a2', label: 'Folha A2'),
          ],
        ),
        SgTreeNode(id: 'b', label: 'Folha B'),
      ],
    ),
  ],
)
```

## SgDockLayout

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_layout_page.dart` (3 exemplo(s) na página; abaixo 3).

### Zonas ao redor da área de trabalho

O SgDockLayout só guarda o estado das toolbars; quem posiciona as zonas é o seu layout (no React, classes CSS).

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
      child: Stack(
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

### Estado das toolbars (defaultState)

Cada toolbar tem zona, ordem e recolhimento. O controlador oferece as mesmas operações do React.

Região `sgDockLayoutEstado` em `sg_dock_layout_page.snippets.g.dart`.

```dart
SgDockLayout(
  id: 'showcase-dock-estado',
  defaultState: const SgDockLayoutState(
    toolbars: {
      'ferramentas': SgDockToolbarState(
        id: 'ferramentas',
        zone: SgDockZoneId.top,
        order: 0,
      ),
      'navegacao': SgDockToolbarState(
        id: 'navegacao',
        zone: SgDockZoneId.left,
        order: 0,
      ),
    },
  ),
  child: Builder(
    builder: (context) {
      final dock = SgDockLayout.maybeOf(context)!;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final tb in dock.state.toolbars.values)
            Text(
              '${tb.id}: zona ${tb.zone.value}, ordem ${dock.getToolbarOrder(tb.id)}',
            ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              SgButton(
                label: Text(
                  'Mover "navegacao" para a direita',
                ),
                size: SgSize.sm,
                onClick: () => dock.moveToolbar(
                  'navegacao',
                  SgDockZoneId.right,
                ),
              ),
              SgButton(
                label: Text(
                  'Mover "ferramentas" para a base',
                ),
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                onClick: () => dock.moveToolbar(
                  'ferramentas',
                  SgDockZoneId.bottom,
                ),
              ),
            ],
          ),
        ],
      );
    },
  ),
)
```

### Prévia de soltura

Ao arrastar uma toolbar as zonas mostram onde ela pode cair. Soltar o ponteiro encerra a prévia.

Região `sgDockLayoutPrevia` em `sg_dock_layout_page.snippets.g.dart`.

```dart
SizedBox(
  height: 190,
  child: SgDockLayout(
    id: 'showcase-dock-previa',
    child: Builder(
      builder: (context) {
        final dock = SgDockLayout.maybeOf(context)!;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SgButton(
                  label: Text('Simular arrasto'),
                  size: SgSize.sm,
                  onClick: () {
                    dock.setDropPreviewActive(true);
                    dock.setDraggingToolbarId('ferramentas');
                    dock.setDropIndicator(
                      const SgDockDropIndicator(
                        SgDockZoneId.top,
                        0,
                      ),
                    );
                  },
                ),
                SgButton(
                  label: Text('Encerrar'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                  onClick: () => dock.setDropPreviewActive(false),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: SgDockZone(
                    zone: SgDockZoneId.top,
                    child: Text('Topo'),
                  ),
                ),
                Expanded(
                  child: SgDockZone(
                    zone: SgDockZoneId.free,
                    child: Text('Livre'),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    ),
  ),
)
```

## SgDockZone

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_zone_page.dart` (4 exemplo(s) na página; abaixo 3).

### Zona horizontal (top e bottom)

Os filhos ficam em linha, com quebra, espaço de 12 e padding de 8.

Região `sgDockZoneHorizontal` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: SgDockZone(
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

### Zona vertical (left e right)

Os filhos ficam em coluna. Use width e height para fixar o tamanho (no React, classes como w-44).

Região `sgDockZoneVertical` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: SgDockZone(
    zone: SgDockZoneId.left,
    width: 160,
    height: 180,
    children: [
      SgButton(
        label: Text('Clientes'),
        size: SgSize.sm,
        appearance: SgAppearance.ghost,
      ),
      SgButton(
        label: Text('Pedidos'),
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
)
```

### Zona livre (free)

A zona free centraliza o conteúdo.

Região `sgDockZoneLivre` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  height: 140,
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: SgDockZone(
    zone: SgDockZoneId.free,
    height: 140,
    child: Text('Área central livre'),
  ),
)
```

## SgDockScreen

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_screen_page.dart` (3 exemplo(s) na página; abaixo 3).

### Tela com as cinco zonas

Grade padrão: colunas laterais de 12rem (192) e centro flexível; topo e base com a altura do conteúdo.

Região `sgDockScreenBasico` em `sg_dock_screen_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(12),
  ),
  child: SgDockScreen(
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

### Largura, altura e padding

width e height aceitam número (px) ou texto como "520px"; padding afasta a grade da borda.

Região `sgDockScreenTamanho` em `sg_dock_screen_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(12),
  ),
  child: SgDockScreen(
    id: 'showcase-dock-screen-tamanho',
    fullscreen: false,
    width: '520px',
    height: 220,
    padding: 12,
    children: [
      SgDockZone(
        zone: SgDockZoneId.top,
        child: SgButton(
          label: Text('Topo'),
          size: SgSize.sm,
        ),
      ),
      SgDockZone(
        zone: SgDockZoneId.left,
        child: SgButton(
          label: Text('Esquerda'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
        ),
      ),
      SgDockZone(
        zone: SgDockZoneId.free,
        child: Text('Centro'),
      ),
    ],
  ),
)
```

### Conteúdo no centro

Um filho que não é SgDockZone vai para a célula central.

Região `sgDockScreenConteudo` em `sg_dock_screen_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(12),
  ),
  child: SgDockScreen(
    id: 'showcase-dock-screen-conteudo',
    fullscreen: false,
    height: 200,
    children: [
      SgDockZone(
        zone: SgDockZoneId.left,
        child: Text('Menu'),
      ),
      Center(child: Text('Conteúdo da página')),
      SgDockZone(
        zone: SgDockZoneId.right,
        child: Text('Ajuda'),
      ),
    ],
  ),
)
```

## SgToolBar

Página: `apps/seedgrid_showcase/lib/pages/sg_tool_bar_page.dart` (4 exemplo(s) na página; abaixo 3).

### Orientações e botões por linha

orientationDirection define a direção; buttonsPerDirection quebra os botões em linhas ou colunas.

Região `sgToolBarOrientacao` em `sg_tool_bar_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 24,
  runSpacing: 16,
  children: [
    SgToolBar(
      id: 'tb-vertical',
      title: Text('Vertical'),
      orientationDirection:
          SgToolBarOrientationDirection.verticalDown,
      children: [
        SgToolbarIconButton(
          icon: Icon(Icons.save_outlined),
          label: 'Salvar',
        ),
        SgToolbarIconButton(
          icon: Icon(Icons.print_outlined),
          label: 'Imprimir',
        ),
      ],
    ),
    SgToolBar(
      id: 'tb-grade',
      title: Text('Grade 2x'),
      buttonsPerDirection: 2,
      bgColor: 'var(--muted)',
      children: const [
        SgToolbarIconButton(
          icon: Icon(Icons.copy),
          hideLabel: true,
        ),
        SgToolbarIconButton(icon: Icon(Icons.cut), hideLabel: true),
        SgToolbarIconButton(
          icon: Icon(Icons.paste),
          hideLabel: true,
        ),
        SgToolbarIconButton(
          icon: Icon(Icons.undo),
          hideLabel: true,
        ),
      ],
    ),
  ],
)
```

### Arrastar livremente

Com freeDrag e draggable, arraste pelo cabeçalho; a posição fica limitada à área e é guardada.

Região `sgToolBarArrastar` em `sg_tool_bar_page.snippets.g.dart`.

```dart
SizedBox(
  width: double.infinity,
  height: 220,
  child: Stack(
    children: [
      SgToolBar(
        id: 'tb-arrastar',
        title: Text('Arraste-me'),
        freeDrag: true,
        draggable: true,
        defaultPosition: const Offset(24, 24),
        children: [
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

### Overflow: itens que não cabem vão para o menu "…"

Extensão do Flutter: com overflow, os botões que não cabem na largura vão para um menu "…" (SgMenu); abaixo de 600 de largura ele abre como painel inferior.

Região `sgToolBarOverflow` em `sg_tool_bar_page.snippets.g.dart`.

```dart
SizedBox(
  width: 260,
  child: SgToolBar(
    id: 'tb-overflow',
    title: Text('Estreita'),
    overflow: true,
    size: const SgToolBarSize(w: 260),
    children: [
      SgToolbarIconButton(
        icon: Icon(Icons.add),
        label: 'Novo',
      ),
      SgToolbarIconButton(
        icon: Icon(Icons.edit_outlined),
        label: 'Editar',
      ),
      SgToolbarIconButton(
        icon: Icon(Icons.copy),
        label: 'Copiar',
      ),
      SgToolbarIconButton(
        icon: Icon(Icons.print_outlined),
        label: 'Imprimir',
      ),
      SgToolbarIconButton(
        icon: Icon(Icons.share_outlined),
        label: 'Compartilhar',
      ),
    ],
  ),
)
```

## SgToolbarIconButton

Página: `apps/seedgrid_showcase/lib/pages/sg_toolbar_icon_button_page.dart` (3 exemplo(s) na página; abaixo 3).

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

Ajuste: o trecho usa `int _cliques = 0;` e `setState` num `State`; declare a variável no widget que contém o exemplo.

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

### Desabilitado, carregando e sem rótulo

onClick assíncrono mostra o indicador de carregamento até terminar.

Região `sgToolbarIconButtonEstados` em `sg_toolbar_icon_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: [
    SgToolbarIconButton(
      icon: Icon(Icons.lock_outline),
      label: 'Bloqueado',
      disabled: true,
    ),
    SgToolbarIconButton(
      icon: Icon(Icons.sync),
      label: 'Carregando',
      loading: true,
    ),
    SgToolbarIconButton(
      icon: const Icon(Icons.cloud_upload_outlined),
      label: 'Enviar',
      onClick: () =>
          Future<void>.delayed(const Duration(seconds: 2)),
    ),
    SgToolbarIconButton(
      icon: Icon(Icons.search),
      label: 'Buscar',
      hideLabel: true,
    ),
  ],
)
```


## Conferência dos exemplos desta nota

Por script, comparei **todos** os exemplos extraídos do grupo (não só os 3 por componente mostrados) com a API real: cada argumento nomeado de widget e classe `Sg*` existe no construtor em `lib/src/` (988 argumentos nomeados, 0 divergências) e cada `Enum.valor` existe no enum correspondente. Isso **não** substitui compilar: o `flutter test` do repositório continua sendo a garantia de que o código roda.
