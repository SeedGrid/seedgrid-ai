---
description: "Exemplos Dart de Layout e containers em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (todos os exemplos de cada componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, layout, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Layout e containers (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/layout/Exemplos|Exemplos — Layout e containers (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/layout/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza, na ordem e com os títulos do showcase; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco foi regenerado por script a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 (cópia 1:1). Única alteração: `context.tx('texto')` e `context.txf('texto {x}', {'x': v})` (i18n do showcase, não fazem parte da biblioteca) viraram o literal `'texto'` e a interpolação `'texto ${v}'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`. O showcase não usa `setState` de página: campos de formulário usam `name` + `control: SgFormController`, e o estado de exibição é local e isolado (`ValueNotifier` com `ValueListenableBuilder`/`ListenableBuilder`). Quando o trecho depende de um campo ou auxiliar da página, a linha **Ajuste** logo abaixo do bloco mostra a declaração dele. Todos os exemplos de cada componente estão aqui; o showcase fica em `apps/seedgrid_showcase`.

## SgStack

Página: `apps/seedgrid_showcase/lib/pages/sg_stack_page.dart` (3 exemplo(s) na página; todos abaixo).

### Coluna + Linha

Exemplos de layout comuns com stack.

Região `sgStackColunaLinha` em `sg_stack_page.snippets.g.dart`.

```dart
SgStack(
  gap: 16,
  children: [
    SgPanel(
      padding: 12,
      children: [
        SgStack(
          gap: 8,
          children: [
            Text('Stack em coluna'),
            SgButton(
              label: Text('Salvar'),
              onClick: () {},
            ),
            SgButton(
              label: Text('Cancelar'),
              appearance: SgAppearance.outline,
              onClick: () {},
            ),
            SgButton(
              label: Text('Ajuda'),
              appearance: SgAppearance.ghost,
              onClick: () {},
            ),
          ],
        ),
      ],
    ),
    SgPanel(
      padding: 12,
      children: [
        SgStack(
          direction: SgStackDirection.row,
          wrap: true,
          justify: SgStackJustify.between,
          align: SgStackAlign.center,
          gap: 8,
          children: [
            Text('Título'),
            SgStack(
              direction: SgStackDirection.row,
              gap: 8,
              children: [
                SgButton(
                  label: Text('Voltar'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                  onClick: () {},
                ),
                SgButton(
                  label: Text('Confirmar'),
                  size: SgSize.sm,
                  onClick: () {},
                ),
              ],
            ),
          ],
        ),
      ],
    ),
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

### grow dentro de uma linha

grow faz o SgStack ocupar o espaço restante de um pai flex.

Região `sgStackGrow` em `sg_stack_page.snippets.g.dart`.

```dart
Row(
  children: [
    SgStack(
      grow: true,
      children: [
        Text(
          'Este bloco cresce e empurra o botão para a direita.',
        ),
      ],
    ),
    SgButton(label: Text('OK'), onClick: () {}),
  ],
)
```

## SgGrid

Página: `apps/seedgrid_showcase/lib/pages/sg_grid_page.dart` (4 exemplo(s) na página; todos abaixo).

### Colunas responsivas

`columns` com breakpoints e `span` por item.

Região `sgGridBreakpoints` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  columns: const {'base': 1, 'sm': 2, 'md': 3, 'lg': 4},
  gap: 12,
  children: [
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 1')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 2')],
    ),
    SgPanel(
      span: 2,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 3 (span 2)')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 4')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 5')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card 6')],
    ),
  ],
)
```

### Auto-Fit + RowSpan

Grid fluido com `minItemWidth`, `dense` e `rowHeight`.

Região `sgGridAuto` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  minItemWidth: 256,
  gap: 12,
  rowHeight: 120,
  dense: true,
  children: [
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card A')],
    ),
    SgPanel(
      rowSpan: 2,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card B (rowSpan 2)')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card C')],
    ),
    SgPanel(
      span: 2,
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card D (span 2)')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card E')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      children: const [Text('Card F')],
    ),
  ],
)
```

### Colunas fixas

columns={3} divide a largura em três colunas iguais; gap separa as células.

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

### rowHeight, align e dense

rowHeight fixa as linhas; align posiciona o item na célula; dense preenche buracos.

Região `sgGridLinhas` em `sg_grid_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 3,
  rowHeight: 56,
  gap: 8,
  dense: true,
  align: SgGridAlign.center,
  children: [
    SgPanel(
      span: 2,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('largo')],
    ),
    SgPanel(
      span: 2,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('largo')],
    ),
    Text('preenche o buraco'),
  ],
)
```

## SgPanel

Página: `apps/seedgrid_showcase/lib/pages/sg_panel_page.dart` (7 exemplo(s) na página; todos abaixo).

### Dock básico em SgPanel

`align` faz dock em relação ao pai e `width`/`height` em número viram porcentagem.

Região `sgPanelDockBasico` em `sg_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 430,
  child: SgPanel(
    borderStyle: SgPanelBorderStyle.solid,
    contentPadding: 12,
    contentGap: 8,
    children: [
      SgPanel(
        align: SgPanelAlign.top,
        height: 12,
        contentPadding: 10,
        children: [Text('Cabeçalho')],
      ),
      SgPanel(
        align: SgPanelAlign.left,
        width: 25,
        contentPadding: 10,
        children: [
          Text('Menu'),
          Text('Painel'),
          Text('Clientes'),
        ],
      ),
      SgPanel(
        align: SgPanelAlign.right,
        width: '25%',
        contentPadding: 10,
        children: [
          Text('Ações'),
          Text('Filtrar'),
          Text('Exportar'),
        ],
      ),
      SgPanel(
        align: SgPanelAlign.bottom,
        height: 10,
        contentPadding: 10,
        children: [Text('Rodapé')],
      ),
      SgPanel(
        align: SgPanelAlign.client,
        contentPadding: 10,
        children: [
          Text('Área principal'),
          Text(
            'Esta área ocupa todo o espaço restante.',
          ),
        ],
      ),
    ],
  ),
)
```

### Composição dentro de SgScreen

Este bloco reproduz o exemplo do `teste/page.tsx`, agora dentro do showcase oficial do componente.

Região `sgPanelComposicao` em `sg_panel_page.snippets.g.dart`.

```dart
SgScreen(
  fullscreen: false,
  height: 520,
  children: [
    SgPanel(
      align: SgPanelAlign.top,
      height: 5,
      contentPadding: 8,
      minHeightPx: 100,
      contentDirection: SgPanelContentDirection.row,
      contentJustify: SgPanelContentJustify.end,
      contentAlign: SgPanelContentAlign.center,
      contentWrap: true,
      children: [
        SgButton(label: Text('Salvar')),
        SgButton(label: Text('Editar')),
        SgButton(label: Text('Excluir')),
      ],
    ),
    SgPanel(
      align: SgPanelAlign.left,
      width: 30,
      contentPadding: 8,
      children: [
        SgButton(label: Text('Salvar')),
        SgButton(label: Text('Editar')),
        SgButton(label: Text('Excluir')),
      ],
    ),
    SgPanel(
      align: SgPanelAlign.client,
      contentPadding: 12,
      children: [Text('Conteúdo')],
    ),
    SgPanel(
      align: SgPanelAlign.bottom,
      height: 5,
      contentPadding: 8,
      minHeightPx: 100,
      contentDirection: SgPanelContentDirection.row,
      contentAlign: SgPanelContentAlign.center,
      contentWrap: true,
      children: [
        SgButton(label: Text('Salvar')),
        SgButton(label: Text('Editar')),
        SgButton(label: Text('Excluir')),
      ],
    ),
  ],
)
```

### span + rowSpan

`span` e `rowSpan` continuam valendo apenas dentro do `SgGrid`.

Região `sgPanelSpan` em `sg_panel_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 4,
  gap: 8,
  rowHeight: 90,
  dense: true,
  children: [
    SgPanel(
      contentPadding: 10,
      children: const [Text('Item 1')],
    ),
    SgPanel(
      span: 2,
      contentPadding: 10,
      children: const [Text('span=2')],
    ),
    SgPanel(
      rowSpan: 2,
      contentPadding: 10,
      children: const [Text('rowSpan=2')],
    ),
    SgPanel(
      contentPadding: 10,
      children: const [Text('Item 4')],
    ),
    SgPanel(
      contentPadding: 10,
      children: const [Text('Item 5')],
    ),
    SgPanel(
      span: 2,
      rowSpan: 2,
      contentPadding: 10,
      children: const [Text('span=2 + rowSpan=2')],
    ),
  ],
)
```

### borderStyle + padding + contentPadding

Diferença entre espaçamento externo do panel e espaçamento interno do conteúdo.

Região `sgPanelBorda` em `sg_panel_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 3,
  gap: 4,
  children: [
    SgPanel(
      borderStyle: SgPanelBorderStyle.none,
      contentPadding: 12,
      children: const [Text('contentPadding + borderStyle="none"')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.solid,
      contentPadding: 12,
      children: const [Text('contentPadding + borderStyle="solid"')],
    ),
    SgPanel(
      borderStyle: SgPanelBorderStyle.dashed,
      padding: 12,
      contentPadding: 12,
      children: const [Text('padding + contentPadding + dashed')],
    ),
  ],
)
```

### scrollable + scrollbarGutter

Scroll explícito apenas quando necessário.

Região `sgPanelRolagem` em `sg_panel_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 2,
  gap: 4,
  children: [
    SizedBox(
      height: 192,
      child: SgPanel(
        scrollable: true,
        contentPadding: 10,
        children: [
          for (var i = 1; i <= 10; i++)
            SgPanel(
              borderStyle: SgPanelBorderStyle.solid,
              contentPadding: 8,
              children: [Text('scrollable=true - linha $i')],
            ),
        ],
      ),
    ),
    SizedBox(
      height: 192,
      child: SgPanel(
        scrollable: 'auto',
        contentPadding: 10,
        children: [
          for (var i = 1; i <= 10; i++)
            SgPanel(
              borderStyle: SgPanelBorderStyle.solid,
              contentPadding: 8,
              children: [Text('scrollable="auto" - linha $i')],
            ),
        ],
      ),
    ),
    SizedBox(
      height: 192,
      child: SgPanel(
        scrollable: 'y',
        contentPadding: 10,
        children: [
          for (var i = 1; i <= 15; i++)
            SgPanel(
              borderStyle: SgPanelBorderStyle.solid,
              contentPadding: 8,
              children: [Text('Item vertical $i')],
            ),
        ],
      ),
    ),
    SizedBox(
      height: 192,
      child: SgPanel(
        scrollable: 'x',
        scrollbarGutter: true,
        contentPadding: 10,
        contentDirection: SgPanelContentDirection.row,
        contentGap: 8,
        children: [
          for (var i = 1; i <= 12; i++)
            SizedBox(
              width: 96,
              height: 96,
              child: SgPanel(
                borderStyle: SgPanelBorderStyle.solid,
                contentAlign: SgPanelContentAlign.center,
                children: [Text('Box $i')],
              ),
            ),
        ],
      ),
    ),
  ],
)
```

### Exemplo combinado

Exemplo único misturando dock, mínimos em pixel e grid.

Região `sgPanelCombinado` em `sg_panel_page.snippets.g.dart`.

```dart
SgStack(
  gap: 10,
  children: [
    SizedBox(
      height: 260,
      child: SgPanel(
        contentPadding: 8,
        contentGap: 8,
        children: [
          SgPanel(
            align: SgPanelAlign.top,
            height: 10,
            minHeightPx: 56,
            borderStyle: SgPanelBorderStyle.solid,
            contentPadding: 12,
            children: [Text('Cabeçalho')],
          ),
          SgPanel(
            align: SgPanelAlign.left,
            width: 18,
            minWidthPx: 120,
            borderStyle: SgPanelBorderStyle.dashed,
            contentPadding: 8,
            scrollable: 'y',
            children: [Text('Menu')],
          ),
          SgPanel(
            align: SgPanelAlign.client,
            borderStyle: SgPanelBorderStyle.none,
            contentPadding: 10,
            scrollable: 'auto',
            scrollbarGutter: true,
            children: [Text('Conteúdo')],
          ),
        ],
      ),
    ),
    SgGrid(
      columns: 3,
      gap: 8,
      children: [
        SgPanel(
          span: 2,
          contentPadding: 12,
          children: const [Text('span=2')],
        ),
        SgPanel(
          rowSpan: 2,
          contentPadding: 12,
          children: const [Text('rowSpan=2')],
        ),
      ],
    ),
  ],
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

Página: `apps/seedgrid_showcase/lib/pages/sg_screen_page.dart` (4 exemplo(s) na página; todos abaixo).

### Exemplo completo

Uso com fullscreen=false em área controlada, incluindo layout top/left/right/bottom/client.

Região `sgScreenCompleto` em `sg_screen_page.snippets.g.dart`.

```dart
SgScreen(
  fullscreen: false,
  height: 420,
  padding: 10,
  children: [
    SgPanel(
      align: SgPanelAlign.top,
      height: 12,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('Cabeçalho')],
    ),
    SgPanel(
      align: SgPanelAlign.left,
      width: 20,
      borderStyle: SgPanelBorderStyle.solid,
      children: [
        Text('Menu'),
        Text('Painel'),
        Text('Relatórios'),
        Text('Clientes'),
      ],
    ),
    SgPanel(
      align: SgPanelAlign.right,
      width: 18,
      borderStyle: SgPanelBorderStyle.solid,
      children: [
        Text('Ações'),
        Text('Filtrar'),
        Text('Exportar'),
      ],
    ),
    SgPanel(
      align: SgPanelAlign.bottom,
      height: 10,
      borderStyle: SgPanelBorderStyle.solid,
      children: [Text('Rodapé')],
    ),
    SgPanel(
      align: SgPanelAlign.client,
      borderStyle: SgPanelBorderStyle.solid,
      children: [
        Text('Área principal'),
        Text('Esta área ocupa todo o espaço restante.'),
      ],
    ),
  ],
)
```

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

Página: `apps/seedgrid_showcase/lib/pages/sg_group_box_page.dart` (5 exemplo(s) na página; todos abaixo).

### Básico

Uso simples do GroupBox.

Região `sgGroupBoxBasico` em `sg_group_box_page.snippets.g.dart`.

```dart
SgGroupBox(
  title: 'Dados pessoais',
  child: SgGrid(
    minItemWidth: 200,
    gap: 12,
    children: [
      SgInputText(id: 'gb-campo-1', labelText: 'Campo 1'),
      SgInputText(id: 'gb-campo-2', labelText: 'Campo 2'),
    ],
  ),
)
```

### Formulário

Exemplo com inputs reais dentro do GroupBox.

Região `sgGroupBoxFormulario` em `sg_group_box_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgGroupBox(
      title: 'Cadastro',
      child: SgGrid(
        minItemWidth: 240,
        gap: 16,
        children: [
          SgInputText(
            id: 'name',
            name: 'name',
            control: _form,
            labelText: 'Nome completo',
            required: true,
          ),
          SgInputEmail(
            id: 'email',
            name: 'email',
            control: _form,
            labelText: 'Email',
            required: true,
          ),
          SgInputPhone(
            id: 'phone',
            name: 'phone',
            control: _form,
            labelText: 'Telefone',
            required: true,
          ),
          SgInputPostalCode(
            id: 'cep',
            name: 'cep',
            control: _form,
            labelText: 'CEP',
            required: true,
          ),
          SgInputPassword(
            id: 'password',
            name: 'password',
            control: _form,
            labelText: 'Senha',
            required: true,
          ),
        ],
      ),
    ),
    const SizedBox(height: 12),
    ListenableBuilder(
      listenable: _form,
      builder: (context, _) =>
          Text('Valores: ${_form.getValues()}'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
```

### Tamanho

Largura e altura customizáveis.

Região `sgGroupBoxTamanho` em `sg_group_box_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  children: [
    SgGroupBox(
      title: 'Largura 320px',
      width: 320,
      child: Text('Conteúdo'),
    ),
    SgGroupBox(
      title: 'Altura 180px',
      height: 180,
      child: Text('Conteúdo'),
    ),
  ],
)
```

### Classe customizada

Envolva o SgGroupBox em um contêiner estilizado (fundo, espaçamento e cantos) para ajustar o layout externo.

Região `sgGroupBoxClasse` em `sg_group_box_page.snippets.g.dart`.

```dart
Container(
  padding: const EdgeInsets.all(8),
  decoration: BoxDecoration(
    color: Theme.of(
      context,
    ).colorScheme.onSurface.withValues(alpha: 0.05),
    borderRadius: BorderRadius.circular(12),
  ),
  child: SgGroupBox(
    title: 'Classe customizada',
    child: Text('Conteúdo'),
  ),
)
```

### Várias caixas lado a lado

Use o SgGrid para dispor várias caixas lado a lado.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_card_page.dart` (7 exemplo(s) na página; todos abaixo).

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

### Leading e trailing

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

### Variantes e tamanhos

default, elevated, outlined e flat, em tamanhos sm e lg.

Região `sgCardVariantes` em `sg_card_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 2,
  gap: 12,
  children: [
    SgCard(
      cardStyle: SgCardCardStyle.defaultValue,
      title: Text('Default'),
      size: SgCardSize.sm,
      child: Text('size sm'),
    ),
    SgCard(
      cardStyle: SgCardCardStyle.elevated,
      title: Text('Elevated'),
      size: SgCardSize.sm,
      child: Text('size sm'),
    ),
    SgCard(
      cardStyle: SgCardCardStyle.outlined,
      title: Text('Outlined'),
      size: SgCardSize.lg,
      child: Text('size lg'),
    ),
    SgCard(
      cardStyle: SgCardCardStyle.flat,
      title: Text('Flat'),
      size: SgCardSize.lg,
      child: Text('size lg'),
    ),
  ],
)
```

### Cores das áreas

Cabeçalho, corpo e rodapé podem ter fundos independentes.

Região `sgCardCores` em `sg_card_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final escuro = Theme.of(context).brightness == Brightness.dark;
    return SgCard(
      title: Text('Áreas com fundo próprio'),
      description: Text(
        'Cabeçalho e rodapé com cores independentes.',
      ),
      bgColor: escuro ? '#0f172a' : '#f8fafc',
      bgColorTitle: escuro ? '#1e3a8a' : '#dbeafe',
      bgColorFooter: escuro ? '#1e293b' : '#e2e8f0',
      footer: Wrap(
        alignment: WrapAlignment.spaceBetween,
        spacing: 12,
        children: [
          Text('Atualizado agora'),
          Text('Área do rodapé'),
        ],
      ),
      child: DefaultTextStyle.merge(
        style: TextStyle(
          color: Color(escuro ? 0xFFE2E8F0 : 0xFF334155),
        ),
        child: Column(
          spacing: 8,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Receita'),
                Text(
                  'R\$ 24.980',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Pedidos'),
                Text(
                  '162',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  },
)
```

### Arrastável com persistência

Arraste pelo cabeçalho; a posição é lembrada (dragPersistKey) e avisada em onPositionChange.

Região `sgCardArrastavel` em `sg_card_page.snippets.g.dart`.

```dart
SizedBox(
  height: 300,
  child: Align(
    alignment: Alignment.topLeft,
    child: SizedBox(
      width: 280,
      child: SgCard(
        id: 'sg-card-draggable-demo',
        draggable: true,
        defaultPosition: const SgCardPosition(16, 16),
        dragPersistKey: 'sg-card-draggable-demo',
        onPositionChange: (p) => _posicao.value = p,
        title: Text('Arraste-me pelo cabeçalho'),
        description: ValueListenableBuilder<SgCardPosition>(
          valueListenable: _posicao,
          builder: (context, p, _) =>
              Text('x: ${p.x.round()}  y: ${p.y.round()}'),
        ),
        collapsible: true,
        collapseToggleAlign: SgCardCollapseToggleAlign.right,
        collapseIconSize: 20,
        bgColor: '#ffffff',
        footer: Text('Posição persistida.'),
        child: DefaultTextStyle.merge(
          style: TextStyle(color: Color(0xFF334155)),
          child: Column(
            spacing: 8,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Status'),
                  Text(
                    'Online',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Região'),
                  Text(
                    'São Paulo',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_posicao`), definido assim na página do showcase:

```dart
final ValueNotifier<SgCardPosition> _posicao = ValueNotifier(
  const SgCardPosition(0, 0),
);
```

### Tamanhos e clique

Cada tamanho como cartão clicável; o clique é contado.

Região `sgCardTamanhos` em `sg_card_page.snippets.g.dart`.

```dart
Column(
  children: [
    for (final s in SgCardSize.values)
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: ValueListenableBuilder<int>(
          valueListenable: _cliques,
          builder: (context, cliques, _) => SgCard(
            size: s,
            clickable: true,
            onClick: () => _cliques.value++,
            title: Text('Tamanho ${s.value} (cliques: $cliques)'),
            child: Text('Cartão clicável'),
          ),
        ),
      ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_cliques`), definido assim na página do showcase:

```dart
final ValueNotifier<int> _cliques = ValueNotifier(0);
```

## SgAccordion

Página: `apps/seedgrid_showcase/lib/pages/sg_accordion_page.dart` (7 exemplo(s) na página; todos abaixo).

### Básico vertical (único)

Comportamento padrão em coluna, abrindo um painel por vez.

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
      enabled: false,
    ),
  ],
)
```

### Vários abertos + recolhível

Abra vários painéis ao mesmo tempo e controle o estado ativo externamente.

Região `sgAccordionMultiplo` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(
  items: _itens,
  multiple: true,
  defaultActiveIndex: [0, 2],
)
```

Ajuste: o trecho usa estado local do exemplo (`_itens`), definido assim na página do showcase:

```dart
static const _itens = [
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
    enabled: false,
  ),
];
```

### Horizontal

Cabeçalhos em trilho lateral e conteúdo expandindo horizontalmente.

Região `sgAccordionHorizontal` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(
  items: _itens,
  orientation: SgAccordionOrientation.horizontal,
  horizontalMinHeight: 200,
)
```

Ajuste: o trecho usa estado local do exemplo (`_itens`), definido assim na página do showcase:

```dart
static const _itens = [
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
    enabled: false,
  ),
];
```

### Controlado por estado

O estado vive fora do componente: os painéis ativos e o último toque são exibidos abaixo.

Região `sgAccordionControlado` em `sg_accordion_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_ativos, _ultimo]),
  builder: (context, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgAccordion(
        items: _itens,
        multiple: true,
        activeIndex: _ativos.value,
        onActiveIndexChange: (v) => _ativos.value = v,
        onItemToggle: (i, aberto) =>
            _ultimo.value = '$i ${aberto ? 'abriu' : 'fechou'}',
      ),
      const SizedBox(height: 8),
      Text(
        'O estado vive na página: ativos = ${_ativos.value}, último toque = ${_ultimo.value}.',
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativos`, `_ultimo`, `_itens`), definido assim na página do showcase:

```dart
final ValueNotifier<List<int>> _ativos = ValueNotifier(const [1]);
final ValueNotifier<String> _ultimo = ValueNotifier('nenhum');
static const _itens = [
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
    enabled: false,
  ),
];
```

### Itens personalizados + fundo do cabeçalho

O fundo do título usa primary-50 por padrão e pode ser customizado globalmente ou por item.

Região `sgAccordionPersonalizados` em `sg_accordion_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final escuro = Theme.of(context).brightness == Brightness.dark;
    return SgAccordion(
      defaultActiveIndex: const [0],
      headerBackgroundColor: escuro ? '#1E3A5F' : '#EFF6FF',
      items: [
        SgAccordionItem(
          title: Text('E-mail'),
          content: Text(
            'Configurações de SMTP, remetente padrão e modelos.',
          ),
          icon: const Icon(Icons.mail_outline, size: 18),
          end: Text('novo'),
          headerBackgroundColor: escuro ? '#164E63' : '#E0F2FE',
        ),
        SgAccordionItem(
          title: Text('Permissões'),
          content: Text(
            'Controle de perfis, papéis e trilhas de auditoria.',
          ),
          icon: const Icon(Icons.verified_user_outlined, size: 18),
        ),
        SgAccordionItem(
          title: Text('Módulo indisponível'),
          content: Text('Conteúdo bloqueado.'),
          icon: const Icon(Icons.warning_amber_outlined, size: 18),
          enabled: false,
        ),
      ],
    );
  },
)
```

### Exemplo de personalização de cores

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

### Sempre um aberto (collapsible: false)

Com collapsible: false, o painel aberto não pode ser recolhido; sempre resta um aberto.

Região `sgAccordionSemFechar` em `sg_accordion_page.snippets.g.dart`.

```dart
const SgAccordion(items: _itens, collapsible: false)
```

Ajuste: o trecho usa estado local do exemplo (`_itens`), definido assim na página do showcase:

```dart
static const _itens = [
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
    enabled: false,
  ),
];
```

## SgPageControl

Página: `apps/seedgrid_showcase/lib/pages/sg_page_control_demo_page.dart` (6 exemplo(s) na página; todos abaixo).

### Básico

Cada página define icon e title no SgPageControlPage.

Região `sgPageControlBasico` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
  defaultActivePageId: 'cadastro',
  children: [
    SgPageControlPage(
      id: 'cadastro',
      title: Text('Cadastro'),
      icon: Icon(Icons.person_outline),
      child: Text('Conteúdo: Cadastro'),
    ),
    SgPageControlPage(
      id: 'fiscal',
      title: Text('Fiscal'),
      icon: Icon(Icons.receipt_long_outlined),
      child: Text('Conteúdo: Fiscal'),
    ),
    SgPageControlPage(
      id: 'acesso',
      title: Text('Acesso'),
      icon: Icon(Icons.shield_outlined),
      child: Text('Conteúdo: Acesso'),
    ),
  ],
)
```

### Controle Externo

Use activePageId + onActivePageIdChange para setar a aba ativa.

Região `sgPageControlControleExterno` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
ValueListenableBuilder<String>(
  valueListenable: _ativa,
  builder: (context, ativa, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            label: Text('Ir para Cadastro'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _ativa.value = 'cadastro',
          ),
          SgButton(
            label: Text('Ir para Fiscal'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _ativa.value = 'fiscal',
          ),
          SgButton(
            label: Text('Ir para Acesso'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _ativa.value = 'acesso',
          ),
          SgButton(
            label: Text('Ir para Integrações'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _ativa.value = 'integracoes',
          ),
        ],
      ),
      const SizedBox(height: 8),
      SgPageControl(
        activePageId: ativa,
        onActivePageIdChange: (id, ctx) => _ativa.value = id,
        pageControlStyle: SgPageControlPageControlStyle.pills,
        children: [
          SgPageControlPage(
            id: 'cadastro',
            title: Text('Cadastro'),
            icon: Icon(Icons.person_outline),
            child: Text('Conteúdo: Cadastro'),
          ),
          SgPageControlPage(
            id: 'fiscal',
            title: Text('Fiscal'),
            icon: Icon(Icons.receipt_long_outlined),
            child: Text('Conteúdo: Fiscal'),
          ),
          SgPageControlPage(
            id: 'acesso',
            title: Text('Acesso'),
            icon: Icon(Icons.shield_outlined),
            child: Text('Conteúdo: Acesso'),
          ),
          SgPageControlPage(
            id: 'integracoes',
            title: Text('Integrações'),
            icon: Icon(Icons.folder_outlined),
            child: Text('Conteúdo: Integrações'),
          ),
        ],
      ),
      const SizedBox(height: 8),
      Text('Página ativa: $ativa'),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativa`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativa = ValueNotifier<String>('cadastro');
```

### Ocultar Página Externamente

hiddenPageIds permite esconder tabs sem apagar a declaração.

Região `sgPageControlOcultar` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
ValueListenableBuilder<List<String>>(
  valueListenable: _escondidas,
  builder: (context, escondidas, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: 12,
        runSpacing: 8,
        children: [
          SgToggleSwitch(
            id: 'ocultar-cadastro',
            label: 'Ocultar Cadastro',
            onChange: (v) => _escondidas.value = [
              for (final id in _escondidas.value)
                if (id != 'cadastro') id,
              if (v) 'cadastro',
            ],
          ),
          SgToggleSwitch(
            id: 'ocultar-fiscal',
            label: 'Ocultar Fiscal',
            onChange: (v) => _escondidas.value = [
              for (final id in _escondidas.value)
                if (id != 'fiscal') id,
              if (v) 'fiscal',
            ],
          ),
          SgToggleSwitch(
            id: 'ocultar-acesso',
            label: 'Ocultar Acesso',
            onChange: (v) => _escondidas.value = [
              for (final id in _escondidas.value)
                if (id != 'acesso') id,
              if (v) 'acesso',
            ],
          ),
          SgToggleSwitch(
            id: 'ocultar-integracoes',
            label: 'Ocultar Integrações',
            onChange: (v) => _escondidas.value = [
              for (final id in _escondidas.value)
                if (id != 'integracoes') id,
              if (v) 'integracoes',
            ],
          ),
        ],
      ),
      const SizedBox(height: 8),
      SgPageControl(
        hiddenPageIds: escondidas,
        keepMounted: true,
        children: [
          SgPageControlPage(
            id: 'cadastro',
            title: Text('Cadastro'),
            icon: Icon(Icons.person_outline),
            child: Text('Conteúdo: Cadastro'),
          ),
          SgPageControlPage(
            id: 'fiscal',
            title: Text('Fiscal'),
            icon: Icon(Icons.receipt_long_outlined),
            child: Text('Conteúdo: Fiscal'),
          ),
          SgPageControlPage(
            id: 'acesso',
            title: Text('Acesso'),
            icon: Icon(Icons.shield_outlined),
            child: Text('Conteúdo: Acesso'),
          ),
          SgPageControlPage(
            id: 'integracoes',
            title: Text('Integrações'),
            icon: Icon(Icons.folder_outlined),
            child: Text('Conteúdo: Integrações'),
          ),
        ],
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_escondidas`), definido assim na página do showcase:

```dart
final ValueNotifier<List<String>> _escondidas = ValueNotifier<List<String>>(
  const [],
);
```

### Com Hint nas Abas

Passe o mouse sobre a aba para ver o hint.

Região `sgPageControlHint` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
  defaultActivePageId: 'cadastro',
  children: [
    SgPageControlPage(
      id: 'cadastro',
      title: Text('Cadastro'),
      hint: 'Criar e editar os dados de cadastro.',
      icon: Icon(Icons.person_outline),
      child: Text('Conteúdo: Cadastro'),
    ),
    SgPageControlPage(
      id: 'fiscal',
      title: Text('Fiscal'),
      hint: 'Revisar as configurações fiscais.',
      icon: Icon(Icons.receipt_long_outlined),
      child: Text('Conteúdo: Fiscal'),
    ),
    SgPageControlPage(
      id: 'acesso',
      title: Text('Acesso'),
      hint: 'Gerenciar usuários, papéis e permissões.',
      icon: Icon(Icons.shield_outlined),
      child: Text('Conteúdo: Acesso'),
    ),
  ],
)
```

### Responsividade

Desktop e tablet mantêm as abas na mesma linha; no celular a lista rola na horizontal e a aba ativa entra em cena sozinha. mobilePageControl="select" troca as abas por um select nativo abaixo de 768px.

Região `sgPageControlResponsividade` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Redimensione a janela para ver o comportamento mudar em 768px.'),
    const SizedBox(height: 8),
    Text('fullWidthTabs — larguras iguais a partir do tablet'),
    SgPageControl(
      fullWidthTabs: true,
      children: [
        SgPageControlPage(
          id: 'cadastro',
          title: Text('Cadastro'),
          icon: Icon(Icons.person_outline),
          child: Text('Conteúdo: Cadastro'),
        ),
        SgPageControlPage(
          id: 'fiscal',
          title: Text('Fiscal'),
          icon: Icon(Icons.receipt_long_outlined),
          child: Text('Conteúdo: Fiscal'),
        ),
        SgPageControlPage(
          id: 'acesso',
          title: Text('Acesso'),
          icon: Icon(Icons.shield_outlined),
          child: Text('Conteúdo: Acesso'),
        ),
        SgPageControlPage(
          id: 'produtos',
          title: Text('Produtos'),
          icon: Icon(Icons.inventory_2_outlined),
          child: Text('Conteúdo: Produtos'),
        ),
        SgPageControlPage(
          id: 'frete',
          title: Text('Frete'),
          icon: Icon(Icons.local_shipping_outlined),
          child: Text('Conteúdo: Frete'),
        ),
        SgPageControlPage(
          id: 'integracoes',
          title: Text('Integrações'),
          icon: Icon(Icons.folder_outlined),
          child: Text('Conteúdo: Integrações'),
        ),
        SgPageControlPage(
          id: 'preferencias',
          title: Text('Preferências'),
          icon: Icon(Icons.build_outlined),
          child: Text('Conteúdo: Preferências'),
        ),
      ],
    ),
    const SizedBox(height: 16),
    Text('mobilePageControl="select" — abas viram um select no celular'),
    SgPageControl(
      mobilePageControl: SgPageControlMobilePageControl.select,
      children: [
        SgPageControlPage(
          id: 'cadastro',
          title: Text('Cadastro'),
          icon: Icon(Icons.person_outline),
          child: Text('Conteúdo: Cadastro'),
        ),
        SgPageControlPage(
          id: 'fiscal',
          title: Text('Fiscal'),
          icon: Icon(Icons.receipt_long_outlined),
          child: Text('Conteúdo: Fiscal'),
        ),
        SgPageControlPage(
          id: 'acesso',
          title: Text('Acesso'),
          icon: Icon(Icons.shield_outlined),
          child: Text('Conteúdo: Acesso'),
        ),
        SgPageControlPage(
          id: 'produtos',
          title: Text('Produtos'),
          icon: Icon(Icons.inventory_2_outlined),
          child: Text('Conteúdo: Produtos'),
        ),
        SgPageControlPage(
          id: 'frete',
          title: Text('Frete'),
          icon: Icon(Icons.local_shipping_outlined),
          child: Text('Conteúdo: Frete'),
        ),
        SgPageControlPage(
          id: 'integracoes',
          title: Text('Integrações'),
          icon: Icon(Icons.folder_outlined),
          child: Text('Conteúdo: Integrações'),
        ),
        SgPageControlPage(
          id: 'preferencias',
          title: Text('Preferências'),
          icon: Icon(Icons.build_outlined),
          child: Text('Conteúdo: Preferências'),
        ),
      ],
    ),
  ],
)
```

### Tamanho e aba desabilitada

size controla a densidade das abas; enabled: false bloqueia uma página, que continua visível mas não pode ser aberta.

Região `sgPageControlTamanhoDesabilitada` em `sg_page_control_demo_page.snippets.g.dart`.

```dart
SgPageControl(
  size: SgPageControlSize.sm,
  defaultActivePageId: 'cadastro',
  children: [
    SgPageControlPage(
      id: 'cadastro',
      title: Text('Cadastro'),
      child: Text('Conteúdo: Cadastro'),
    ),
    SgPageControlPage(
      id: 'fiscal',
      title: Text('Fiscal'),
      child: Text('Conteúdo: Fiscal'),
    ),
    SgPageControlPage(
      id: 'acesso',
      title: Text('Acesso'),
      enabled: false,
      child: Text('Conteúdo: Acesso'),
    ),
  ],
)
```

## SgPageControlPage

Sem página de showcase própria: o `SgPageControlPage` aparece dentro dos exemplos de `SgPageControl` (acima), onde cada aba é uma `SgPageControlPage`. Veja a [[SeedGrid/SeedGrid-components/flutter/layout/API|API]].

## SgExpandablePanel

Página: `apps/seedgrid_showcase/lib/pages/sg_expandable_panel_page.dart` (6 exemplo(s) na página; todos abaixo).

### Inline Controlado + Resize

Demonstra open/onOpenChange, size, resizable e onSizeChange.

Região `sgExpandableInline` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 300,
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Área principal'),
            const SizedBox(height: 8),
            Text(
              'Exemplo inline controlado com resize.',
            ),
            const SizedBox(height: 8),
            ValueListenableBuilder<bool>(
              valueListenable: _inline,
              builder: (context, open, _) => SgButton(
                size: SgSize.sm,
                label: Text(
                  open
                      ? 'Fechar inspector'
                      : 'Abrir inspector',
                ),
                onClick: () => _inline.value = !open,
              ),
            ),
            const SizedBox(height: 8),
            ValueListenableBuilder<num>(
              valueListenable: _largura,
              builder: (context, w, _) => Text(
                'Largura atual: ${w.round()}px',
              ),
            ),
          ],
        ),
      ),
      ValueListenableBuilder<bool>(
        valueListenable: _inline,
        builder: (context, open, _) => SgExpandablePanel(
          mode: SgExpandablePanelMode.inline,
          expandTo: SgExpandablePanelExpandTo.left,
          open: open,
          onOpenChange: (v) => _inline.value = v,
          size: const SgExpandablePanelSize(
            defaultSize: 160,
            min: 120,
            max: 300,
          ),
          resizable: true,
          onSizeChange: (v) => _largura.value = v,
          header: Text('Inspector'),
          footer: Text('Rodapé inline'),
          child: Text('Conteúdo do inspector.'),
        ),
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_inline`, `_largura`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _inline = ValueNotifier(true);
final ValueNotifier<num> _largura = ValueNotifier(160);
```

### Overlay + Comportamento

Demonstra placement, closeOnEsc, closeOnOutsideClick, trapFocus, showBackdrop e handle.

Região `sgExpandableOverlay` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir drawer'),
      onClick: () => _gaveta.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _gaveta,
      builder: (context, open, _) => SgExpandablePanel(
        mode: SgExpandablePanelMode.overlay,
        expandTo: SgExpandablePanelExpandTo.left,
        placement: SgExpandablePanelPlacement.center,
        open: open,
        onOpenChange: (v) => _gaveta.value = v,
        size: const SgExpandablePanelSize(
          defaultSize: 360,
          min: 260,
          max: 640,
        ),
        resizable: true,
        closeOnEsc: true,
        closeOnOutsideClick: true,
        trapFocus: true,
        showBackdrop: true,
        handle: const SizedBox(
          width: 48,
          height: 6,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.grey,
              borderRadius: BorderRadius.all(Radius.circular(3)),
            ),
          ),
        ),
        header: Text('Drawer com foco preso'),
        footer: SgButton(
          size: SgSize.sm,
          label: Text('Fechar'),
          onClick: () => _gaveta.value = false,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Props: placement, closeOnEsc, closeOnOutsideClick, trapFocus e showBackdrop.',
            ),
            SgCheckboxGroup(
              id: 'somente-ativos',
              source: [
                SgCheckboxGroupOption(
                  label: 'Somente ativos',
                  value: 'ativos',
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_gaveta`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _gaveta = ValueNotifier(false);
```

### defaultOpen + Estilização

Demonstra defaultOpen, elevation, border, rounded, classes por área e style.

Região `sgExpandableEstilo` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: _estiloChave,
  builder: (context, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Remontar defaultOpen'),
            onClick: () {
              _estiloAberto.value = true;
              _estiloChave.value++;
            },
          ),
          ValueListenableBuilder<bool>(
            valueListenable: _estiloAberto,
            builder: (context, open, _) => Text(
              'Estado reportado: ${open ? 'aberto' : 'fechado'}',
            ),
          ),
        ],
      ),
      SgExpandablePanel(
        key: ValueKey(_estiloChave.value),
        mode: SgExpandablePanelMode.inline,
        expandTo: SgExpandablePanelExpandTo.bottom,
        defaultOpen: true,
        onOpenChange: (v) => _estiloAberto.value = v,
        size: const SgExpandablePanelSize(
          defaultSize: 160,
          min: 100,
          max: 240,
        ),
        animation: const SgExpandablePanelAnimation(
          type: SgExpandablePanelAnimationType.slide,
          durationMs: 220,
        ),
        elevation: SgExpandablePanelElevation.lg,
        border: false,
        rounded: SgExpandablePanelRounded.xl,
        header: Text('Painel estilizado'),
        footer: Text('Rodapé do painel estilizado.'),
        child: Text(
          'Props visuais: elevation, border e rounded. Prop de estado: defaultOpen.',
        ),
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_estiloChave`, `_estiloAberto`), definido assim na página do showcase:

```dart
final ValueNotifier<int> _estiloChave = ValueNotifier(0);
final ValueNotifier<bool> _estiloAberto = ValueNotifier(true);
```

### Acessibilidade + Fade

Demonstra role, ariaLabel, overlayClassName, animation fade e closeOnOutsideClick=false.

Região `sgExpandableAcessibilidade` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      label: Text('Abrir painel com fade'),
      onClick: () => _acessivel.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _acessivel,
      builder: (context, open, _) => SgExpandablePanel(
        mode: SgExpandablePanelMode.overlay,
        expandTo: SgExpandablePanelExpandTo.top,
        placement: SgExpandablePanelPlacement.center,
        open: open,
        onOpenChange: (v) => _acessivel.value = v,
        role: SgExpandablePanelRole.dialog,
        ariaLabel: 'Painel de notificações',
        animation: const SgExpandablePanelAnimation(
          type: SgExpandablePanelAnimationType.fade,
          durationMs: 260,
        ),
        closeOnOutsideClick: false,
        trapFocus: true,
        size: const SgExpandablePanelSize(
          defaultSize: 280,
          min: 180,
          max: 420,
        ),
        header: Text('Notificações'),
        footer: SgButton(
          size: SgSize.sm,
          label: Text('Fechar'),
          onClick: () => _acessivel.value = false,
        ),
        child: Text(
          'Props: role, ariaLabel, animation fade e closeOnOutsideClick=false.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_acessivel`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _acessivel = ValueNotifier(false);
```

### Sem Backdrop + Animation none

Demonstra showBackdrop=false, closeOnOutsideClick=false, closeOnEsc e animation none.

Região `sgExpandableSemfundo` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgButton(
      appearance: SgAppearance.outline,
      label: Text('Abrir sem backdrop'),
      onClick: () => _semFundo.value = true,
    ),
    ValueListenableBuilder<bool>(
      valueListenable: _semFundo,
      builder: (context, open, _) => SgExpandablePanel(
        mode: SgExpandablePanelMode.overlay,
        expandTo: SgExpandablePanelExpandTo.bottom,
        open: open,
        onOpenChange: (v) => _semFundo.value = v,
        showBackdrop: false,
        closeOnOutsideClick: false,
        closeOnEsc: true,
        animation: const SgExpandablePanelAnimation(
          type: SgExpandablePanelAnimationType.none,
          durationMs: 0,
        ),
        size: const SgExpandablePanelSize(
          defaultSize: 220,
          min: 160,
          max: 360,
        ),
        header: Text('Sem backdrop'),
        footer: SgButton(
          size: SgSize.sm,
          label: Text('Fechar'),
          onClick: () => _semFundo.value = false,
        ),
        child: Text(
          'Props: showBackdrop=false e animation type none.',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_semFundo`), definido assim na página do showcase:

```dart
final ValueNotifier<bool> _semFundo = ValueNotifier(false);
```

### Redimensionável na altura

Com expandTo bottom a borda de baixo muda a altura (min 60, max 260). Arraste a borda e acompanhe o valor.

Região `sgExpandableRedimensionavelAltura` em `sg_expandable_panel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 300,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      ValueListenableBuilder<num>(
        valueListenable: _altura,
        builder: (context, h, _) => Text(
          'Altura atual: ${h.round()}px',
        ),
      ),
      SgExpandablePanel(
        expandTo: SgExpandablePanelExpandTo.bottom,
        defaultOpen: true,
        resizable: true,
        size: const SgExpandablePanelSize(
          defaultSize: 200,
          min: 60,
          max: 260,
        ),
        onSizeChange: (v) => _altura.value = v,
        child: Text('Arraste a borda de baixo'),
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_altura`), definido assim na página do showcase:

```dart
final ValueNotifier<num> _altura = ValueNotifier(200);
```

## SgCarousel

Página: `apps/seedgrid_showcase/lib/pages/sg_carousel_page.dart` (11 exemplo(s) na página; todos abaixo).

### Básico - Horizontal

Carrossel horizontal simples com um item visível por vez

Região `sgCarouselBasico` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: ClipRRect(
    borderRadius: BorderRadius.circular(12),
    child: SgCarousel(
      items: _slides(),
      numVisible: 1,
      orientation: SgCarouselOrientation.horizontal,
      height: '100%',
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Múltiplos itens visíveis

Carrossel mostrando 3 itens de uma vez

Região `sgCarouselMultiplos` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 3,
    numScroll: 1,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Auto play

Carrossel com navegação automática (a cada 2 segundos)

Região `sgCarouselAutoplay` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 1,
    autoPlay: true,
    autoPlayInterval: 2000,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Orientação vertical

Carrossel com navegação vertical

Região `sgCarouselVertical` em `sg_carousel_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 1,
  justify: SgGridJustify.center,
  children: [
    Align(
      alignment: Alignment.centerLeft,
      child: SizedBox(
        width: 320,
        height: 384,
        child: SgCarousel(
          items: _slides(),
          numVisible: 1,
          orientation: SgCarouselOrientation.vertical,
          height: '100%',
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Vertical - Múltiplos itens

Carrossel vertical mostrando 3 itens de uma vez

Região `sgCarouselVerticalMultiplos` em `sg_carousel_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 1,
  justify: SgGridJustify.center,
  children: [
    Align(
      alignment: Alignment.centerLeft,
      child: SizedBox(
        width: 320,
        height: 384,
        child: SgCarousel(
          items: _slides(),
          numVisible: 3,
          numScroll: 1,
          orientation: SgCarouselOrientation.vertical,
          height: '100%',
          gap: 8,
        ),
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Sem modo circular

Carrossel que para no final (sem loop infinito)

Região `sgCarouselSemCircular` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 1,
    circular: false,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Sem indicadores

Carrossel sem os indicadores (dots) na parte inferior

Região `sgCarouselSemIndicadores` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 1,
    showIndicators: false,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Sem navegadores

Carrossel sem os botões de navegação (apenas indicadores)

Região `sgCarouselSemNavegadores` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 1,
    showNavigators: false,
    autoPlay: true,
    autoPlayInterval: 2500,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Gap customizado

Carrossel com espaçamento personalizado entre itens (gap: 32px)

Região `sgCarouselGap` em `sg_carousel_page.snippets.g.dart`.

```dart
SizedBox(
  height: 256,
  child: SgCarousel(
    items: _slides(),
    numVisible: 3,
    numScroll: 1,
    gap: 32,
    orientation: SgCarouselOrientation.horizontal,
    height: '100%',
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Com callbacks

Carrossel com evento de mudança de índice

Região `sgCarouselCallbacks` em `sg_carousel_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      color: Theme.of(
        context,
      ).colorScheme.onSurface.withValues(alpha: 0.05),
      child: ValueListenableBuilder<int>(
        valueListenable: _activeIndex,
        builder: (context, index, _) =>
            Text('Índice Ativo: $index'),
      ),
    ),
    const SizedBox(height: 16),
    SizedBox(
      height: 256,
      child: SgCarousel(
        items: _slides(),
        numVisible: 2,
        numScroll: 1,
        orientation: SgCarouselOrientation.horizontal,
        height: '100%',
        onIndexChange: (index) {
          _activeIndex.value = index;
          _log('Índice mudou para: $index');
        },
      ),
    ),
    const SizedBox(height: 16),
    ValueListenableBuilder<List<String>>(
      valueListenable: _eventLog,
      builder: (context, entries, _) => ShowcaseLogBox(
        entries: entries,
        hint: 'Navegue pelo carrossel para ver os eventos...',
        height: 128,
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_activeIndex`, `_eventLog`, `_log`, `_slides`), definido assim na página do showcase:

```dart
final ValueNotifier<int> _activeIndex = ValueNotifier(0);
final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);
void _log(String message) {
  final now = DateTime.now().toString().substring(11, 19);
  _eventLog.value = ['[$now] $message', ..._eventLog.value].take(10).toList();
}
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

### Exemplo responsivo

Carrossel que se adapta ao tamanho da tela mostrando diferentes quantidades de itens

Região `sgCarouselResponsivo` em `sg_carousel_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final width = MediaQuery.sizeOf(context).width;
    final visible = width >= 1024 ? 4 : (width >= 768 ? 2 : 1);
    return SizedBox(
      height: 256,
      child: SgCarousel(
        key: ValueKey(visible),
        items: _slides(),
        numVisible: visible,
        numScroll: visible == 4 ? 2 : 1,
        orientation: SgCarouselOrientation.horizontal,
        height: '100%',
      ),
    );
  },
)
```

Ajuste: o trecho usa estado local do exemplo (`_slides`), definido assim na página do showcase:

```dart
static List<Widget> _slides([int n = 6]) => [
  for (var i = 0; i < n; i++)
    Container(
      decoration: BoxDecoration(
        color: Colors.primaries[(i * 3) % Colors.primaries.length].shade400,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Item ${i + 1}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Slide ${i + 1}',
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    ),
];
```

## SgBreadcrumb

Página: `apps/seedgrid_showcase/lib/pages/sg_breadcrumb_page.dart` (5 exemplo(s) na página; todos abaixo).

### Básico

O último item é a página atual e não é clicável.

Região `sgBreadcrumbBasico` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
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
        SgBreadcrumbItem(
          id: 'c',
          label: Text('Vendas'),
        ),
      ],
      onNavigate: (item, index) =>
          _ultimo.value = '${item.id} (índice $index)',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String?>(
      valueListenable: _ultimo,
      builder: (context, ultimo, _) => Text(
        'Último evento: ${ultimo ?? 'nada ainda'}',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_ultimo`), definido assim na página do showcase:

```dart
final ValueNotifier<String?> _ultimo = ValueNotifier<String?>(null);
```

### Caminho externo

Troca do caminho renderizado por estado externo.

Região `sgBreadcrumbExterno` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: const Text('Go to Registration'),
          onClick: () => _rota.value = 'registration',
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: const Text('Go to Fiscal'),
          onClick: () => _rota.value = 'fiscal',
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: const Text('Go to Integration'),
          onClick: () => _rota.value = 'integration',
        ),
      ],
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<String>(
      valueListenable: _rota,
      builder: (context, rota, _) => SgBreadcrumb(
        items: [
          SgBreadcrumbItem(
            id: 'erp',
            label: const Text('ERP'),
            href: '/erp',
          ),
          SgBreadcrumbItem(
            id: rota,
            label: Text(rota),
            href: '/erp/$rota',
          ),
          SgBreadcrumbItem(
            id: 'atual',
            label: const Text('Customers'),
          ),
        ],
        separator: SgBreadcrumbSeparator.arrow,
        variant: SgBreadcrumbVariant.subtle,
        onNavigate: (item, index) => _ultimoRota.value = item.id,
      ),
    ),
    const SizedBox(height: 8),
    ListenableBuilder(
      listenable: Listenable.merge([_rota, _ultimoRota]),
      builder: (context, _) => Text(
        'rota ativa: ${_rota.value} | último clique: ${_ultimoRota.value}',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_rota`, `_ultimoRota`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _rota = ValueNotifier<String>('registration');
final ValueNotifier<String> _ultimoRota = ValueNotifier<String>('-');
```

### Excedente

Colapso com dropdown ou scroll horizontal em telas pequenas.

Região `sgBreadcrumbMaxitems` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Collapse com dropdown'),
    const SizedBox(height: 8),
    SgBreadcrumb(
      items: _caminho,
      maxItems: 4,
      separator: SgBreadcrumbSeparator.slash,
    ),
    const SizedBox(height: 16),
    Text('Scroll horizontal'),
    const SizedBox(height: 8),
    SizedBox(
      width: 360,
      child: SgBreadcrumb(
        items: _caminho,
        overflowBehavior: SgBreadcrumbOverflowBehavior.scroll,
        separator: SgBreadcrumbSeparator.dot,
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_caminho`), definido assim na página do showcase:

```dart
static final _caminho = [
  for (final (i, nome) in [
    'Loja',
    'Eletrônicos',
    'Celulares',
    'Android',
    'Samsung',
    'Galaxy S',
  ].indexed)
    SgBreadcrumbItem(id: 'n$i', label: Text(nome), href: '/n$i'),
];
```

### Início, ícones e separadores

Ícone de início automático e os quatro separadores.

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

### Tamanhos e variantes

Tamanhos sm e lg e as variantes subtle e primary.

Região `sgBreadcrumbVariantes` em `sg_breadcrumb_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgBreadcrumb(
      items: _caminho.take(3).toList(),
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

Ajuste: o trecho usa estado local do exemplo (`_caminho`), definido assim na página do showcase:

```dart
static final _caminho = [
  for (final (i, nome) in [
    'Loja',
    'Eletrônicos',
    'Celulares',
    'Android',
    'Samsung',
    'Galaxy S',
  ].indexed)
    SgBreadcrumbItem(id: 'n$i', label: Text(nome), href: '/n$i'),
];
```

## SgMenu

Página: `apps/seedgrid_showcase/lib/pages/sg_menu_page.dart` (11 exemplo(s) na página; todos abaixo).

### Sidebar fixa

Menu lateral com grupos colapsáveis e botão de colapso.

Região `sgMenuSidebar` em `sg_menu_page.snippets.g.dart`.

```dart
Container(
  height: 460,
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  clipBehavior: Clip.antiAlias,
  child: ListenableBuilder(
    listenable: Listenable.merge([_ativo, _recolhido]),
    builder: (context, _) => Row(
      children: [
        SgMenu(
          menu: [
            SgMenuNode(
              id: 'dashboard',
              label: 'Dashboard',
              url: '/dashboard',
              icon: Icon(Icons.home_outlined),
            ),
            SgMenuNode(
              id: 'customers',
              label: 'Customers',
              icon: Icon(Icons.group_outlined),
              children: [
                SgMenuNode(
                  id: 'customers-new',
                  label: 'New',
                  icon: Icon(Icons.grid_view),
                  children: [
                    SgMenuNode(
                      id: 'customer-create',
                      label: 'Customer',
                      url: '/customers/new/customer',
                    ),
                    SgMenuNode(
                      id: 'customer-duplicate',
                      label: 'Duplicate',
                      url: '/customers/new/duplicate',
                    ),
                  ],
                ),
                SgMenuNode(
                  id: 'customers-reports',
                  label: 'Reports',
                  icon: Icon(Icons.assignment_outlined),
                  children: [
                    SgMenuNode(
                      id: 'customers-cohort',
                      label: 'Cohort',
                      url: '/customers/reports/cohort',
                    ),
                    SgMenuNode(
                      id: 'customers-churn',
                      label: 'Churn',
                      url: '/customers/reports/churn',
                    ),
                  ],
                ),
              ],
            ),
            SgMenuNode(
              id: 'orders',
              label: 'Orders',
              icon: Icon(Icons.grid_view),
              children: [
                SgMenuNode(
                  id: 'orders-sales',
                  label: 'Sales',
                  icon: Icon(Icons.search),
                  children: [
                    SgMenuNode(
                      id: 'orders-open',
                      label: 'Open Orders',
                      url: '/orders/sales/open',
                      badge: 4,
                    ),
                    SgMenuNode(
                      id: 'orders-closed',
                      label: 'Closed Orders',
                      url: '/orders/sales/closed',
                    ),
                  ],
                ),
                SgMenuNode(
                  id: 'orders-returns',
                  label: 'Returns',
                  url: '/orders/returns',
                  badge: 7,
                ),
              ],
            ),
            SgMenuNode(
              id: 'profile',
              label: 'Profile',
              url: '/profile',
              icon: Icon(Icons.settings_outlined),
            ),
          ],
          selection: SgMenuSelection(activeId: _ativo.value),
          menuStyle: SgMenuMenuStyle.sidebar,
          mode: SgMenuMode.accordion,
          collapsed: _recolhido.value,
          onCollapsedChange: (valor) => _recolhido.value = valor,
          showCollapseButton: true,
          search: SgMenuSearch(
            enabled: true,
            placeholder: 'Buscar módulo...',
          ),
          brand: const SgMenuBrand(title: 'SeedGrid ERP'),
          user: SgMenuUser(
            name: 'Lucia Souza',
            subtitle: 'Financeiro',
          ),
          userMenu: [
            SgMenuNode(
              id: 'perfil',
              label: 'My profile',
              onClick: () {},
            ),
            SgMenuNode(
              id: 'preferencias',
              label: 'Preferences',
              onClick: () {},
            ),
            SgMenuNode(
              id: 'logout',
              label: 'Sign out',
              onClick: () {},
            ),
          ],
          onNavigate: (node) => _ativo.value = node.id,
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Conteúdo principal',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Item ativo: ${_ativo.value}',
                ),
              ],
            ),
          ),
        ),
      ],
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativo`, `_recolhido`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativo = ValueNotifier('dashboard');
final ValueNotifier<bool> _recolhido = ValueNotifier(false);
```

### Drawer móvel

Abre em overlay e pode ser fixado por pin.

Região `sgMenuDrawer` em `sg_menu_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_gaveta, _fixada, _ativo]),
  builder: (context, _) => SizedBox(
    height: 160,
    child: Stack(
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            SgButton(
              label: Text('Abrir menu mobile'),
              onClick: () => _gaveta.value = true,
            ),
            SgButton(
              appearance: SgAppearance.outline,
              label: Text(
                _fixada.value
                    ? 'Soltar gaveta'
                    : 'Fixar gaveta',
              ),
              onClick: () => _fixada.value = !_fixada.value,
            ),
          ],
        ),
        SgMenu(
          menu: [
            SgMenuNode(
              id: 'dashboard',
              label: 'Dashboard',
              url: '/dashboard',
              icon: Icon(Icons.home_outlined),
            ),
            SgMenuNode(
              id: 'customers',
              label: 'Customers',
              icon: Icon(Icons.group_outlined),
              children: [
                SgMenuNode(
                  id: 'customers-new',
                  label: 'New',
                  icon: Icon(Icons.grid_view),
                  children: [
                    SgMenuNode(
                      id: 'customer-create',
                      label: 'Customer',
                      url: '/customers/new/customer',
                    ),
                    SgMenuNode(
                      id: 'customer-duplicate',
                      label: 'Duplicate',
                      url: '/customers/new/duplicate',
                    ),
                  ],
                ),
                SgMenuNode(
                  id: 'customers-reports',
                  label: 'Reports',
                  icon: Icon(Icons.assignment_outlined),
                  children: [
                    SgMenuNode(
                      id: 'customers-cohort',
                      label: 'Cohort',
                      url: '/customers/reports/cohort',
                    ),
                    SgMenuNode(
                      id: 'customers-churn',
                      label: 'Churn',
                      url: '/customers/reports/churn',
                    ),
                  ],
                ),
              ],
            ),
            SgMenuNode(
              id: 'orders',
              label: 'Orders',
              icon: Icon(Icons.grid_view),
              children: [
                SgMenuNode(
                  id: 'orders-sales',
                  label: 'Sales',
                  icon: Icon(Icons.search),
                  children: [
                    SgMenuNode(
                      id: 'orders-open',
                      label: 'Open Orders',
                      url: '/orders/sales/open',
                      badge: 4,
                    ),
                    SgMenuNode(
                      id: 'orders-closed',
                      label: 'Closed Orders',
                      url: '/orders/sales/closed',
                    ),
                  ],
                ),
                SgMenuNode(
                  id: 'orders-returns',
                  label: 'Returns',
                  url: '/orders/returns',
                  badge: 7,
                ),
              ],
            ),
            SgMenuNode(
              id: 'profile',
              label: 'Profile',
              url: '/profile',
              icon: Icon(Icons.settings_outlined),
            ),
          ],
          selection: SgMenuSelection(activeId: _ativo.value),
          menuStyle: SgMenuMenuStyle.drawer,
          open: _gaveta.value,
          onOpenChange: (aberto) => _gaveta.value = aberto,
          pinned: _fixada.value,
          onPinnedChange: (fixada) => _fixada.value = fixada,
          showPinButton: true,
          closeOnNavigate: true,
          search: SgMenuSearch(
            enabled: true,
            placeholder: 'Buscar...',
          ),
          brand: const SgMenuBrand(title: 'SeedGrid ERP'),
          onNavigate: (node) => _ativo.value = node.id,
        ),
      ],
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativo`, `_gaveta`, `_fixada`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativo = ValueNotifier('dashboard');
final ValueNotifier<bool> _gaveta = ValueNotifier(false);
final ValueNotifier<bool> _fixada = ValueNotifier(false);
```

### PanelMenu

Exemplo isolado para visualizar apenas o estilo painel.

Região `sgMenuPanel` em `sg_menu_page.snippets.g.dart`.

```dart
Container(
  height: 320,
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: ListenableBuilder(
    listenable: _ativo,
    builder: (context, _) => SgMenu(
      menu: [
        SgMenuNode(
          id: 'dashboard',
          label: 'Dashboard',
          url: '/dashboard',
          icon: Icon(Icons.home_outlined),
        ),
        SgMenuNode(
          id: 'customers',
          label: 'Customers',
          icon: Icon(Icons.group_outlined),
          children: [
            SgMenuNode(
              id: 'customers-new',
              label: 'New',
              icon: Icon(Icons.grid_view),
              children: [
                SgMenuNode(
                  id: 'customer-create',
                  label: 'Customer',
                  url: '/customers/new/customer',
                ),
                SgMenuNode(
                  id: 'customer-duplicate',
                  label: 'Duplicate',
                  url: '/customers/new/duplicate',
                ),
              ],
            ),
            SgMenuNode(
              id: 'customers-reports',
              label: 'Reports',
              icon: Icon(Icons.assignment_outlined),
              children: [
                SgMenuNode(
                  id: 'customers-cohort',
                  label: 'Cohort',
                  url: '/customers/reports/cohort',
                ),
                SgMenuNode(
                  id: 'customers-churn',
                  label: 'Churn',
                  url: '/customers/reports/churn',
                ),
              ],
            ),
          ],
        ),
        SgMenuNode(
          id: 'orders',
          label: 'Orders',
          icon: Icon(Icons.grid_view),
          children: [
            SgMenuNode(
              id: 'orders-sales',
              label: 'Sales',
              icon: Icon(Icons.search),
              children: [
                SgMenuNode(
                  id: 'orders-open',
                  label: 'Open Orders',
                  url: '/orders/sales/open',
                  badge: 4,
                ),
                SgMenuNode(
                  id: 'orders-closed',
                  label: 'Closed Orders',
                  url: '/orders/sales/closed',
                ),
              ],
            ),
            SgMenuNode(
              id: 'orders-returns',
              label: 'Returns',
              url: '/orders/returns',
              badge: 7,
            ),
          ],
        ),
        SgMenuNode(
          id: 'profile',
          label: 'Profile',
          url: '/profile',
          icon: Icon(Icons.settings_outlined),
        ),
      ],
      selection: SgMenuSelection(activeId: _ativo.value),
      menuStyle: SgMenuMenuStyle.inline,
      menuVariantStyle: SgMenuMenuVariantStyle.panelMenu,
      onNavigate: (node) => _ativo.value = node.id,
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativo`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativo = ValueNotifier('dashboard');
```

### Em níveis

Exemplo isolado para visualizar apenas o estilo em níveis.

Região `sgMenuNiveis` em `sg_menu_page.snippets.g.dart`.

```dart
Container(
  height: 320,
  padding: const EdgeInsets.all(8),
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: ListenableBuilder(
    listenable: _ativoNiveis,
    builder: (context, _) => SgMenu(
      menu: [
        SgMenuNode(
          id: 'dashboard',
          label: 'Dashboard',
          url: '/dashboard',
          icon: Icon(Icons.home_outlined),
        ),
        SgMenuNode(
          id: 'customers',
          label: 'Customers',
          icon: Icon(Icons.group_outlined),
          children: [
            SgMenuNode(
              id: 'customers-new',
              label: 'New',
              icon: Icon(Icons.grid_view),
              children: [
                SgMenuNode(
                  id: 'customer-create',
                  label: 'Customer',
                  url: '/customers/new/customer',
                ),
                SgMenuNode(
                  id: 'customer-duplicate',
                  label: 'Duplicate',
                  url: '/customers/new/duplicate',
                ),
              ],
            ),
            SgMenuNode(
              id: 'customers-reports',
              label: 'Reports',
              icon: Icon(Icons.assignment_outlined),
              children: [
                SgMenuNode(
                  id: 'customers-cohort',
                  label: 'Cohort',
                  url: '/customers/reports/cohort',
                ),
                SgMenuNode(
                  id: 'customers-churn',
                  label: 'Churn',
                  url: '/customers/reports/churn',
                ),
              ],
            ),
          ],
        ),
        SgMenuNode(
          id: 'orders',
          label: 'Orders',
          icon: Icon(Icons.grid_view),
          children: [
            SgMenuNode(
              id: 'orders-sales',
              label: 'Sales',
              icon: Icon(Icons.search),
              children: [
                SgMenuNode(
                  id: 'orders-open',
                  label: 'Open Orders',
                  url: '/orders/sales/open',
                  badge: 4,
                ),
                SgMenuNode(
                  id: 'orders-closed',
                  label: 'Closed Orders',
                  url: '/orders/sales/closed',
                ),
              ],
            ),
            SgMenuNode(
              id: 'orders-returns',
              label: 'Returns',
              url: '/orders/returns',
              badge: 7,
            ),
          ],
        ),
        SgMenuNode(
          id: 'profile',
          label: 'Profile',
          url: '/profile',
          icon: Icon(Icons.settings_outlined),
        ),
      ],
      selection: SgMenuSelection(activeId: _ativoNiveis.value),
      menuStyle: SgMenuMenuStyle.inline,
      menuVariantStyle: SgMenuMenuVariantStyle.tiered,
      onNavigate: (node) => _ativoNiveis.value = node.id,
      onItemClick: (node) => _ativoNiveis.value = node.id,
    ),
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativoNiveis`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativoNiveis = ValueNotifier('dashboard');
```

### MegaMenu horizontal

Exemplo isolado para visualizar apenas o MegaMenu horizontal.

Região `sgMenuMegaHorizontal` em `sg_menu_page.snippets.g.dart`.

```dart
Container(
  padding: const EdgeInsets.all(12),
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: SgMenu(
    menu: [
      SgMenuNode(
        id: 'fashion',
        label: 'Fashion',
        icon: Icon(Icons.group_outlined),
        children: [
          SgMenuNode(
            id: 'fashion-woman',
            label: 'Woman',
            children: [
              SgMenuNode(
                id: 'fashion-woman-1',
                label: 'Woman Casual',
                url: '/fashion/woman/1',
              ),
              SgMenuNode(
                id: 'fashion-woman-2',
                label: 'Woman Formal',
                url: '/fashion/woman/2',
              ),
            ],
          ),
          SgMenuNode(
            id: 'fashion-men',
            label: 'Men',
            children: [
              SgMenuNode(
                id: 'fashion-men-1',
                label: 'Men Casual',
                url: '/fashion/men/1',
              ),
              SgMenuNode(
                id: 'fashion-men-2',
                label: 'Men Formal',
                url: '/fashion/men/2',
              ),
            ],
          ),
        ],
      ),
      SgMenuNode(
        id: 'electronics',
        label: 'Electronics',
        icon: Icon(Icons.settings_outlined),
        children: [
          SgMenuNode(
            id: 'electronics-computer',
            label: 'Computer',
            children: [
              SgMenuNode(
                id: 'electronics-computer-1',
                label: 'Laptop',
                url: '/electronics/computer/1',
              ),
              SgMenuNode(
                id: 'electronics-computer-2',
                label: 'Desktop',
                url: '/electronics/computer/2',
              ),
            ],
          ),
          SgMenuNode(
            id: 'electronics-tv',
            label: 'TV',
            children: [
              SgMenuNode(
                id: 'electronics-tv-1',
                label: 'Smart TV',
                url: '/electronics/tv/1',
              ),
              SgMenuNode(
                id: 'electronics-tv-2',
                label: 'Home Theater',
                url: '/electronics/tv/2',
              ),
            ],
          ),
        ],
      ),
    ],
    selection: const SgMenuSelection(activeId: 'fashion'),
    menuStyle: SgMenuMenuStyle.inline,
    menuVariantStyle: SgMenuMenuVariantStyle.megaHorizontal,
  ),
)
```

### MegaMenu vertical

Exemplo isolado para visualizar apenas o MegaMenu vertical.

Região `sgMenuMegaVertical` em `sg_menu_page.snippets.g.dart`.

```dart
Container(
  height: 320,
  padding: const EdgeInsets.all(12),
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: SgMenu(
    menu: [
      SgMenuNode(
        id: 'fashion',
        label: 'Fashion',
        icon: Icon(Icons.group_outlined),
        children: [
          SgMenuNode(
            id: 'fashion-woman',
            label: 'Woman',
            children: [
              SgMenuNode(
                id: 'fashion-woman-1',
                label: 'Woman Casual',
                url: '/fashion/woman/1',
              ),
              SgMenuNode(
                id: 'fashion-woman-2',
                label: 'Woman Formal',
                url: '/fashion/woman/2',
              ),
            ],
          ),
          SgMenuNode(
            id: 'fashion-men',
            label: 'Men',
            children: [
              SgMenuNode(
                id: 'fashion-men-1',
                label: 'Men Casual',
                url: '/fashion/men/1',
              ),
              SgMenuNode(
                id: 'fashion-men-2',
                label: 'Men Formal',
                url: '/fashion/men/2',
              ),
            ],
          ),
        ],
      ),
      SgMenuNode(
        id: 'electronics',
        label: 'Electronics',
        icon: Icon(Icons.settings_outlined),
        children: [
          SgMenuNode(
            id: 'electronics-computer',
            label: 'Computer',
            children: [
              SgMenuNode(
                id: 'electronics-computer-1',
                label: 'Laptop',
                url: '/electronics/computer/1',
              ),
              SgMenuNode(
                id: 'electronics-computer-2',
                label: 'Desktop',
                url: '/electronics/computer/2',
              ),
            ],
          ),
          SgMenuNode(
            id: 'electronics-tv',
            label: 'TV',
            children: [
              SgMenuNode(
                id: 'electronics-tv-1',
                label: 'Smart TV',
                url: '/electronics/tv/1',
              ),
              SgMenuNode(
                id: 'electronics-tv-2',
                label: 'Home Theater',
                url: '/electronics/tv/2',
              ),
            ],
          ),
        ],
      ),
    ],
    selection: const SgMenuSelection(activeId: 'fashion'),
    menuStyle: SgMenuMenuStyle.inline,
    menuVariantStyle: SgMenuMenuVariantStyle.megaVertical,
  ),
)
```

### Sidebar acoplável

SgMenu dockable com menu completo, brand, userMenu, SgToolBar integrada e identidade visual do showcase.

Região `sgMenuAcoplavel` em `sg_menu_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_ativoDock, _estiloDock]),
  builder: (context, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgRadioGroup(
        title: 'Estilo do menu',
        source: const [
          SgRadioGroupOption(
            label: 'PanelMenu',
            value: 'PanelMenu',
          ),
          SgRadioGroupOption(label: 'Tiered Menu', value: 'Tiered'),
        ],
        value: _estiloDock.value,
        orientation: SgRadioGroupOrientation.horizontal,
        onChange: (valor) => _estiloDock.value = '$valor',
      ),
      const SizedBox(height: 12),
      Container(
        height: 520,
        decoration: BoxDecoration(
          color: const Color(0xFFF0EBE4),
          border: Border.all(color: const Color(0xFFE2CEBC)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: SgDockLayout(
          id: 'showcase-menu-dock-v2',
          child: Stack(
            children: [
              Positioned(
                left: 0,
                right: 0,
                top: 0,
                child: SgDockZone(
                  zone: SgDockZoneId.top,
                  children: [
                    SgToolBar(
                      id: 'toolbar-dock-v1',
                      dockZone: SgToolBarDockZone.top,
                      orientationDirection:
                          SgToolBarOrientationDirection
                              .horizontalLeft,
                      title: Text('Ferramentas'),
                      draggable: true,
                      collapsible: false,
                      overflow: true,
                      children: [
                        SgToolbarIconButton(
                          icon: const Icon(Icons.add),
                          hint: 'Novo registro',
                          severity:
                              SgToolbarIconButtonSeverity.primary,
                        ),
                        SgToolbarIconButton(
                          icon: const Icon(Icons.save_outlined),
                          hint: 'Salvar',
                        ),
                        SgToolbarIconButton(
                          icon: const Icon(Icons.print_outlined),
                          hint: 'Imprimir',
                        ),
                        SgToolbarIconButton(
                          icon: const Icon(Icons.download_outlined),
                          hint: 'Exportar',
                        ),
                        SgToolbarIconButton(
                          icon: const Icon(Icons.delete_outline),
                          hint: 'Excluir',
                          severity:
                              SgToolbarIconButtonSeverity.danger,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Positioned(
                left: 0,
                top: 64,
                bottom: 0,
                child: SgDockZone(
                  zone: SgDockZoneId.left,
                  children: [
                    SgMenu(
                      id: 'menu-dock-sidebar-v2',
                      menu: [
                        SgMenuNode(
                          id: 'dk-dashboard',
                          label: 'Dashboard',
                          url: '/dashboard',
                          icon: Icon(Icons.home_outlined),
                        ),
                        SgMenuNode(
                          id: 'dk-financeiro',
                          label: 'Finance',
                          icon: Icon(Icons.attach_money),
                          children: [
                            SgMenuNode(
                              id: 'dk-contas-pagar',
                              label: 'Accounts Payable',
                              icon: Icon(Icons.credit_card),
                              children: [
                                SgMenuNode(
                                  id: 'dk-pagar-aberto',
                                  label: 'Open',
                                  url: '/financeiro/pagar/aberto',
                                  badge: 12,
                                ),
                                SgMenuNode(
                                  id: 'dk-pagar-vencidas',
                                  label: 'Overdue',
                                  url: '/financeiro/pagar/vencidas',
                                  badge: 3,
                                ),
                              ],
                            ),
                            SgMenuNode(
                              id: 'dk-contas-receber',
                              label: 'Accounts Receivable',
                              icon: Icon(
                                Icons
                                    .account_balance_wallet_outlined,
                              ),
                              children: [
                                SgMenuNode(
                                  id: 'dk-receber-aberto',
                                  label: 'Open',
                                  url: '/financeiro/receber/aberto',
                                  badge: 8,
                                ),
                                SgMenuNode(
                                  id: 'dk-receber-recebidas',
                                  label: 'Received',
                                  url:
                                      '/financeiro/receber/recebidas',
                                ),
                              ],
                            ),
                            SgMenuNode(
                              id: 'dk-financeiro-rel',
                              label: 'Reports',
                              url: '/financeiro/relatorios',
                              icon: Icon(Icons.bar_chart),
                            ),
                          ],
                        ),
                        SgMenuNode(
                          id: 'dk-clientes',
                          label: 'Customers',
                          icon: Icon(Icons.group_outlined),
                          children: [
                            SgMenuNode(
                              id: 'dk-clientes-cadastro',
                              label: 'Register',
                              url: '/clientes/cadastro',
                            ),
                            SgMenuNode(
                              id: 'dk-clientes-relatorios',
                              label: 'Reports',
                              icon: Icon(Icons.assignment_outlined),
                              children: [
                                SgMenuNode(
                                  id: 'dk-clientes-cohort',
                                  label: 'Cohort',
                                  url:
                                      '/clientes/relatorios/cohort',
                                ),
                                SgMenuNode(
                                  id: 'dk-clientes-churn',
                                  label: 'Churn',
                                  url: '/clientes/relatorios/churn',
                                ),
                              ],
                            ),
                          ],
                        ),
                        SgMenuNode(
                          id: 'dk-pedidos',
                          label: 'Orders',
                          icon: Icon(Icons.shopping_cart_outlined),
                          children: [
                            SgMenuNode(
                              id: 'dk-pedidos-vendas',
                              label: 'Sales',
                              icon: Icon(Icons.search),
                              children: [
                                SgMenuNode(
                                  id: 'dk-pedidos-abertos',
                                  label: 'Open',
                                  url: '/pedidos/vendas/aberto',
                                  badge: 4,
                                ),
                                SgMenuNode(
                                  id: 'dk-pedidos-fechados',
                                  label: 'Closed',
                                  url: '/pedidos/vendas/encerrados',
                                ),
                              ],
                            ),
                            SgMenuNode(
                              id: 'dk-pedidos-devolucoes',
                              label: 'Returns',
                              url: '/pedidos/devolucoes',
                              badge: 7,
                            ),
                          ],
                        ),
                        SgMenuNode(
                          id: 'dk-configuracoes',
                          label: 'Settings',
                          icon: Icon(Icons.settings_outlined),
                          children: [
                            SgMenuNode(
                              id: 'dk-config-usuarios',
                              label: 'Users',
                              url: '/configuracoes/usuarios',
                            ),
                            SgMenuNode(
                              id: 'dk-config-perfis',
                              label: 'Access Profiles',
                              url: '/configuracoes/perfis',
                            ),
                            SgMenuNode(
                              id: 'dk-config-sistema',
                              label: 'System',
                              url: '/configuracoes/sistema',
                            ),
                          ],
                        ),
                      ],
                      selection: SgMenuSelection(
                        activeId: _ativoDock.value,
                      ),
                      menuStyle: SgMenuMenuStyle.sidebar,
                      menuVariantStyle:
                          _estiloDock.value == 'Tiered'
                          ? SgMenuMenuVariantStyle.tiered
                          : SgMenuMenuVariantStyle.panel,
                      mode: SgMenuMode.accordion,
                      dockable: true,
                      dockZone: SgDockZoneId.left,
                      draggable: true,
                      showCollapseButton: true,
                      search: SgMenuSearch(
                        enabled: true,
                        placeholder: 'Buscar módulo...',
                      ),
                      brand: const SgMenuBrand(
                        title: 'SeedGrid ERP',
                      ),
                      user: SgMenuUser(
                        name: 'Lucia Souza',
                        subtitle: 'Financeiro',
                      ),
                      userMenu: [
                        SgMenuNode(
                          id: 'dk-meu-perfil',
                          label: 'My Profile',
                          onClick: () {},
                        ),
                        SgMenuNode(
                          id: 'dk-preferencias',
                          label: 'Preferences',
                          onClick: () {},
                        ),
                        SgMenuNode(
                          id: 'dk-trocar-empresa',
                          label: 'Switch Company',
                          onClick: () {},
                        ),
                        SgMenuNode(
                          id: 'dk-logout',
                          label: 'Sign out',
                          onClick: () {},
                        ),
                      ],
                      onNavigate: (node) =>
                          _ativoDock.value = node.id,
                    ),
                  ],
                ),
              ),
              Positioned.fill(
                child: SgDockZone(
                  zone: SgDockZoneId.free,
                  child: Center(
                    child: Text('Área central livre'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_ativoDock`, `_estiloDock`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _ativoDock = ValueNotifier('dashboard');
final ValueNotifier<String> _estiloDock = ValueNotifier('PanelMenu');
```

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
          SgMenuNode(id: 'relatorio-mensal', label: 'Mensal'),
          SgMenuNode(id: 'relatorio-anual', label: 'Anual'),
        ],
      ),
      SgMenuNode(
        id: 'cadastros',
        label: 'Cadastros',
        children: [
          SgMenuNode(id: 'produtos', label: 'Produtos'),
          SgMenuNode(id: 'fornecedores', label: 'Fornecedores'),
        ],
      ),
    ],
  ),
)
```

### Usuário e menu do usuário (SgMenuUser)

user mostra nome, subtítulo e avatar no rodapé do menu; clicar no bloco chama onClick, e userMenu abre as ações do usuário.

Região `sgMenuUsuario` em `sg_menu_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      height: 460,
      child: SgMenu(
        id: 'menu-usuario',
        brand: const SgMenuBrand(title: 'SeedGrid ERP'),
        user: SgMenuUser(
          name: 'Lúcia Souza',
          subtitle: 'Financeiro',
          onClick: () => _usuarioAcao.value = 'user-block',
        ),
        userMenu: [
          SgMenuNode(
            id: 'perfil',
            label: 'Meu perfil',
            onClick: () => _usuarioAcao.value = 'perfil',
          ),
          SgMenuNode(
            id: 'preferencias',
            label: 'Preferências',
            onClick: () => _usuarioAcao.value = 'preferencias',
          ),
          SgMenuNode(
            id: 'sair',
            label: 'Sair',
            onClick: () => _usuarioAcao.value = 'sair',
          ),
        ],
        menu: [
          SgMenuNode(
            id: 'painel',
            label: 'Painel',
            icon: Icon(Icons.home_outlined),
          ),
          SgMenuNode(
            id: 'financeiro',
            label: 'Financeiro',
            icon: Icon(Icons.attach_money),
          ),
        ],
      ),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _usuarioAcao,
      builder: (context, acao, _) =>
          Text('Última ação: $acao'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_usuarioAcao`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _usuarioAcao = ValueNotifier('-');
```

### Submenu ao passar o mouse

Na variante tiered, openSubmenuOnHover abre os submenus ao passar o mouse; ariaLabel nomeia a navegação para leitores de tela.

Região `sgMenuSubmenuHover` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 320,
  child: SgMenu(
    id: 'menu-hover',
    ariaLabel: 'Navegação principal',
    menuStyle: SgMenuMenuStyle.inline,
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

### Rodapé e avatar do usuário

footer coloca um conteúdo fixo no fim do menu; o avatar do SgMenuUser personaliza a imagem do usuário.

Região `sgMenuRodapeAvatar` em `sg_menu_page.snippets.g.dart`.

```dart
SizedBox(
  height: 320,
  child: SgMenu(
    id: 'menu-rodape',
    menuStyle: SgMenuMenuStyle.sidebar,
    brand: const SgMenuBrand(title: 'SeedGrid ERP'),
    user: SgMenuUser(
      name: 'Lúcia Souza',
      subtitle: 'Financeiro',
      avatar: SgAvatar(size: SgAvatarSize.sm, label: const Text('LS')),
    ),
    footer: const Text('v1.0'),
    menu: [
      SgMenuNode(id: 'painel', label: 'Painel'),
      SgMenuNode(id: 'financeiro', label: 'Financeiro'),
    ],
  ),
)
```

## SgTreeView

Página: `apps/seedgrid_showcase/lib/pages/sg_tree_view_page.dart` (10 exemplo(s) na página; todos abaixo).

### Básico

Árvore pesquisável com check e clique apenas em leaf.

Região `sgTreeViewBasico` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgCard(
      title: 'Permissões',
      child: ValueListenableBuilder<List<String>>(
        valueListenable: _marcados,
        builder: (context, ids, _) => SgTreeView(
          controller: _arvore,
          searchable: true,
          searchPlaceholder: 'Pesquisar...',
          checkable: true,
          checkedIds: ids,
          onCheckedChange: (next) => _marcados.value = next,
          onLeafClick: (id) => _clicada.value = id,
          size: SgTreeViewSize.md,
          density: SgTreeViewDensity.normal,
          tone: SgTreeViewTone.defaultValue,
          nodes: [
            SgTreeNode(
              id: 'root',
              label: 'Administração',
              icon: const Icon(Icons.shield_outlined, size: 16),
              children: [
                SgTreeNode(
                  id: 'users',
                  label: 'Usuários',
                  icon: const Icon(Icons.people_outline, size: 16),
                  children: [
                    SgTreeNode(
                      id: 'users.list',
                      label: 'Listar usuários',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                    SgTreeNode(
                      id: 'users.create',
                      label: 'Criar usuário',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                  ],
                ),
                SgTreeNode(
                  id: 'reports',
                  label: 'Relatórios',
                  icon: const Icon(
                    Icons.bar_chart_outlined,
                    size: 16,
                  ),
                  children: [
                    SgTreeNode(
                      id: 'reports.sales',
                      label: 'Relatório de vendas',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                    SgTreeNode(
                      id: 'reports.financial',
                      label: 'Relatório financeiro',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    SgStack(
      direction: SgStackDirection.row,
      wrap: true,
      gap: 8,
      children: [
        SgButton(
          label: Text('Ler todos os checkeds'),
          appearance: SgAppearance.outline,
          onClick: () => _lerTodos.value = _arvore.getCheckedIds(),
        ),
        SgButton(
          label: Text('Ler apenas leafs'),
          appearance: SgAppearance.outline,
          onClick: () =>
              _lerFolhas.value = _arvore.getCheckedLeafIds(),
        ),
      ],
    ),
    ListenableBuilder(
      listenable: Listenable.merge([
        _lerTodos,
        _lerFolhas,
        _clicada,
      ]),
      builder: (context, _) => SgStack(
        gap: 4,
        align: SgStackAlign.start,
        children: [
          Text(
            'checkedIds: ${_lerTodos.value.isEmpty ? '-' : _lerTodos.value.join(', ')}',
          ),
          Text(
            'leafIds: ${_lerFolhas.value.isEmpty ? '-' : _lerFolhas.value.join(', ')}',
          ),
          Text(
            'Última folha clicada: ${_clicada.value}',
          ),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_arvore`, `_marcados`, `_lerTodos`, `_lerFolhas`, `_clicada`), definido assim na página do showcase:

```dart
final SgTreeViewController _arvore = SgTreeViewController();
final ValueNotifier<List<String>> _marcados = ValueNotifier<List<String>>(
  const [],
);
final ValueNotifier<List<String>> _lerTodos = ValueNotifier<List<String>>(
  const [],
);
final ValueNotifier<List<String>> _lerFolhas = ValueNotifier<List<String>>(
  const [],
);
final ValueNotifier<String> _clicada = ValueNotifier<String>('-');
```

### Tom dos ícones

Altere a cor dos ícones para primary.

Região `sgTreeViewTom` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgCard(
  title: 'Ícones em primary',
  child: SgTreeView(
    iconTone: SgTreeViewIconTone.primary,
    searchable: true,
    searchPlaceholder: 'Pesquisar...',
    nodes: [
      SgTreeNode(
        id: 'root',
        label: 'Administração',
        icon: const Icon(Icons.shield_outlined, size: 16),
        children: [
          SgTreeNode(
            id: 'users',
            label: 'Usuários',
            icon: const Icon(Icons.people_outline, size: 16),
            children: [
              SgTreeNode(
                id: 'users.list',
                label: 'Listar usuários',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
              SgTreeNode(
                id: 'users.create',
                label: 'Criar usuário',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
            ],
          ),
          SgTreeNode(
            id: 'reports',
            label: 'Relatórios',
            icon: const Icon(Icons.bar_chart_outlined, size: 16),
            children: [
              SgTreeNode(
                id: 'reports.sales',
                label: 'Relatório de vendas',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
              SgTreeNode(
                id: 'reports.financial',
                label: 'Relatório financeiro',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  ),
)
```

### Modo confirmação

Confirme os itens selecionados no rodapé.

Região `sgTreeViewConfirmacao` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgCard(
      title: 'Confirmação',
      child: SgTreeView(
        controller: _confirmCtrl,
        searchable: true,
        searchPlaceholder: 'Pesquisar...',
        checkable: true,
        checkMode: SgTreeViewCheckMode.confirm,
        confirmSelection: SgTreeViewConfirmSelection.leafOnly,
        confirmBar: SgTreeConfirmBar(
          label: 'Confirmar',
          showCancel: true,
          cancelLabel: 'Limpar',
          onConfirm: (ids) => _confirmados.value = ids,
          onCancel: _confirmCtrl.clearChecked,
        ),
        nodes: [
          SgTreeNode(
            id: 'root',
            label: 'Administração',
            icon: const Icon(Icons.shield_outlined, size: 16),
            children: [
              SgTreeNode(
                id: 'users',
                label: 'Usuários',
                icon: const Icon(Icons.people_outline, size: 16),
                children: [
                  SgTreeNode(
                    id: 'users.list',
                    label: 'Listar usuários',
                    icon: const Icon(
                      Icons.description_outlined,
                      size: 16,
                    ),
                  ),
                  SgTreeNode(
                    id: 'users.create',
                    label: 'Criar usuário',
                    icon: const Icon(
                      Icons.description_outlined,
                      size: 16,
                    ),
                  ),
                ],
              ),
              SgTreeNode(
                id: 'reports',
                label: 'Relatórios',
                icon: const Icon(
                  Icons.bar_chart_outlined,
                  size: 16,
                ),
                children: [
                  SgTreeNode(
                    id: 'reports.sales',
                    label: 'Relatório de vendas',
                    icon: const Icon(
                      Icons.description_outlined,
                      size: 16,
                    ),
                  ),
                  SgTreeNode(
                    id: 'reports.financial',
                    label: 'Relatório financeiro',
                    icon: const Icon(
                      Icons.description_outlined,
                      size: 16,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ),
    ValueListenableBuilder<List<String>>(
      valueListenable: _confirmados,
      builder: (context, ids, _) =>
          Text('confirmIds: ${ids.isEmpty ? '-' : ids.join(', ')}'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_confirmCtrl`, `_confirmados`), definido assim na página do showcase:

```dart
final SgTreeViewController _confirmCtrl = SgTreeViewController();
final ValueNotifier<List<String>> _confirmados = ValueNotifier<List<String>>(
  const [],
);
```

### Tamanho e densidade

Compacto, normal e confortável.

Região `sgTreeViewTamanho` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgStack(
  gap: 16,
  align: SgStackAlign.start,
  children: [
    SgTreeView(
      size: SgTreeViewSize.sm,
      density: SgTreeViewDensity.compact,
      nodes: [
        SgTreeNode(
          id: 'root',
          label: 'Administração',
          icon: const Icon(Icons.shield_outlined, size: 16),
          children: [
            SgTreeNode(
              id: 'users',
              label: 'Usuários',
              icon: const Icon(Icons.people_outline, size: 16),
              children: [
                SgTreeNode(
                  id: 'users.list',
                  label: 'Listar usuários',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'users.create',
                  label: 'Criar usuário',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
            SgTreeNode(
              id: 'reports',
              label: 'Relatórios',
              icon: const Icon(Icons.bar_chart_outlined, size: 16),
              children: [
                SgTreeNode(
                  id: 'reports.sales',
                  label: 'Relatório de vendas',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'reports.financial',
                  label: 'Relatório financeiro',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
    SgTreeView(
      size: SgTreeViewSize.md,
      density: SgTreeViewDensity.normal,
      nodes: [
        SgTreeNode(
          id: 'root',
          label: 'Administração',
          icon: const Icon(Icons.shield_outlined, size: 16),
          children: [
            SgTreeNode(
              id: 'users',
              label: 'Usuários',
              icon: const Icon(Icons.people_outline, size: 16),
              children: [
                SgTreeNode(
                  id: 'users.list',
                  label: 'Listar usuários',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'users.create',
                  label: 'Criar usuário',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
            SgTreeNode(
              id: 'reports',
              label: 'Relatórios',
              icon: const Icon(Icons.bar_chart_outlined, size: 16),
              children: [
                SgTreeNode(
                  id: 'reports.sales',
                  label: 'Relatório de vendas',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'reports.financial',
                  label: 'Relatório financeiro',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
    SgTreeView(
      size: SgTreeViewSize.lg,
      density: SgTreeViewDensity.comfortable,
      nodes: [
        SgTreeNode(
          id: 'root',
          label: 'Administração',
          icon: const Icon(Icons.shield_outlined, size: 16),
          children: [
            SgTreeNode(
              id: 'users',
              label: 'Usuários',
              icon: const Icon(Icons.people_outline, size: 16),
              children: [
                SgTreeNode(
                  id: 'users.list',
                  label: 'Listar usuários',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'users.create',
                  label: 'Criar usuário',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
            SgTreeNode(
              id: 'reports',
              label: 'Relatórios',
              icon: const Icon(Icons.bar_chart_outlined, size: 16),
              children: [
                SgTreeNode(
                  id: 'reports.sales',
                  label: 'Relatório de vendas',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
                SgTreeNode(
                  id: 'reports.financial',
                  label: 'Relatório financeiro',
                  icon: const Icon(
                    Icons.description_outlined,
                    size: 16,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ],
)
```

### Expandido por padrão

Use defaultExpandedIds para iniciar aberto.

Região `sgTreeViewExpandido` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgCard(
  title: 'Inicia expandido',
  child: SgTreeView(
    searchable: true,
    searchPlaceholder: 'Pesquisar...',
    defaultExpandedIds: const ['root', 'users'],
    nodes: [
      SgTreeNode(
        id: 'root',
        label: 'Administração',
        icon: const Icon(Icons.shield_outlined, size: 16),
        children: [
          SgTreeNode(
            id: 'users',
            label: 'Usuários',
            icon: const Icon(Icons.people_outline, size: 16),
            children: [
              SgTreeNode(
                id: 'users.list',
                label: 'Listar usuários',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
              SgTreeNode(
                id: 'users.create',
                label: 'Criar usuário',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
            ],
          ),
          SgTreeNode(
            id: 'reports',
            label: 'Relatórios',
            icon: const Icon(Icons.bar_chart_outlined, size: 16),
            children: [
              SgTreeNode(
                id: 'reports.sales',
                label: 'Relatório de vendas',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
              SgTreeNode(
                id: 'reports.financial',
                label: 'Relatório financeiro',
                icon: const Icon(
                  Icons.description_outlined,
                  size: 16,
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  ),
)
```

### JSON com checked

Carregue itens marcados a partir do JSON (ex.: permissões do usuário).

Região `sgTreeViewJsonChecked` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgCard(
  title: 'Checked via JSON',
  child: Builder(
    builder: (context) {
      final carregado = sgTreeFromJsonWithChecked(const [
        SgTreeNodeJson(
          id: 'root',
          label: 'Administração',
          children: [
            SgTreeNodeJson(
              id: 'users',
              label: 'Usuários',
              children: [
                SgTreeNodeJson(
                  id: 'users.list',
                  label: 'Listar usuários',
                  checked: true,
                ),
                SgTreeNodeJson(
                  id: 'users.create',
                  label: 'Criar usuário',
                ),
              ],
            ),
            SgTreeNodeJson(
              id: 'reports',
              label: 'Relatórios',
              children: [
                SgTreeNodeJson(
                  id: 'reports.sales',
                  label: 'Relatório de vendas',
                  checked: true,
                ),
                SgTreeNodeJson(
                  id: 'reports.financial',
                  label: 'Relatório financeiro',
                ),
              ],
            ),
          ],
        ),
      ]);
      return SgTreeView(
        nodes: carregado.nodes,
        checkable: true,
        defaultCheckedIds: carregado.checkedIds,
        defaultExpandedIds: const ['root', 'users'],
      );
    },
  ),
)
```

### Trilhas (colunas extras por linha)

Uma coluna por trilha, cada uma com seu cabeçalho (label) e largura (width). As trilhas boolean e enum têm cascata pai→filhos própria e independente; a trilha custom não tem estado: a árvore só cede a célula e a tela desenha o que quiser. O adornment põe conteúdo livre ao lado do controle (aqui, uma estrela em 'List users').

Região `sgTreeViewTrilhas` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgCard(
      title: 'Ativo + Prioridade + Tipo + coluna livre',
      child: ListenableBuilder(
        listenable: Listenable.merge([
          _marcados,
          _prioridade,
          _tipoConta,
        ]),
        builder: (context, _) => SgTreeView(
          checkable: true,
          checkableLabel: 'Ativo',
          checkedIds: _marcados.value,
          onCheckedChange: (next) => _marcados.value = next,
          defaultExpandedIds: const ['root', 'users', 'reports'],
          tracks: [
            SgTreeTrackBoolean(
              id: 'priority',
              label: 'Prioridade',
              ariaLabel: 'Prioridade',
              checkedIds: _prioridade.value,
              onCheckedChange: (next) => _prioridade.value = next,
              adornment: (node) => node.id == 'users.list'
                  ? const Icon(
                      Icons.star,
                      size: 14,
                      color: Colors.amber,
                    )
                  : null,
            ),
            SgTreeTrackEnum(
              id: 'accountType',
              label: 'Tipo de conta',
              width: '150px',
              placeholder: '—',
              mixedLabel: '— misto —',
              options: [
                SgTreeTrackOption(
                  value: 'fixo',
                  label: 'Custo fixo',
                ),
                SgTreeTrackOption(
                  value: 'variavel',
                  label: 'Custo variável',
                ),
                SgTreeTrackOption(
                  value: 'despesa',
                  label: 'Despesa variável',
                ),
                SgTreeTrackOption(
                  value: 'investimento',
                  label: 'Investimento',
                ),
              ],
              valueByNodeId: _tipoConta.value,
              onChange: (next) => _tipoConta.value = next,
            ),
            SgTreeTrackCustom(
              id: 'acao',
              label: 'Coluna livre',
              width: '130px',
              render: (node) => node.children?.isNotEmpty == true
                  ? const SizedBox.shrink()
                  : SgButton(
                      label: Text('marcar fixo'),
                      appearance: SgAppearance.ghost,
                      size: SgSize.sm,
                      onClick: () => _tipoConta.value = {
                        ..._tipoConta.value,
                        node.id: 'fixo',
                      },
                    ),
            ),
          ],
          nodes: [
            SgTreeNode(
              id: 'root',
              label: 'Administração',
              icon: const Icon(Icons.shield_outlined, size: 16),
              children: [
                SgTreeNode(
                  id: 'users',
                  label: 'Usuários',
                  icon: const Icon(Icons.people_outline, size: 16),
                  children: [
                    SgTreeNode(
                      id: 'users.list',
                      label: 'Listar usuários',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                    SgTreeNode(
                      id: 'users.create',
                      label: 'Criar usuário',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                  ],
                ),
                SgTreeNode(
                  id: 'reports',
                  label: 'Relatórios',
                  icon: const Icon(
                    Icons.bar_chart_outlined,
                    size: 16,
                  ),
                  children: [
                    SgTreeNode(
                      id: 'reports.sales',
                      label: 'Relatório de vendas',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                    SgTreeNode(
                      id: 'reports.financial',
                      label: 'Relatório financeiro',
                      icon: const Icon(
                        Icons.description_outlined,
                        size: 16,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    ListenableBuilder(
      listenable: Listenable.merge([
        _marcados,
        _prioridade,
        _tipoConta,
      ]),
      builder: (context, _) => SgStack(
        gap: 4,
        align: SgStackAlign.start,
        children: [
          Text(
            'checkedIds (principal): ${_marcados.value.isEmpty ? '-' : _marcados.value.join(', ')}',
          ),
          Text(
            'priorityIds (trilha boolean): ${_prioridade.value.isEmpty ? '-' : _prioridade.value.join(', ')}',
          ),
          Text(
            'accountTypeByNode (trilha enum): ${_tipoConta.value.isEmpty ? '-' : _tipoConta.value.entries.map((e) => '${e.key}=${e.value}').join(', ')}',
          ),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_marcados`, `_prioridade`, `_tipoConta`), definido assim na página do showcase:

```dart
final ValueNotifier<List<String>> _marcados = ValueNotifier<List<String>>(
  const [],
);
final ValueNotifier<List<String>> _prioridade = ValueNotifier<List<String>>(
  const [],
);
final ValueNotifier<Map<String, String?>> _tipoConta =
    ValueNotifier<Map<String, String?>>(const {});
```

### Busca com valor inicial

defaultSearchValue abre a árvore já filtrada: só os achados e seus ancestrais aparecem, e expandMatchesOnSearch (padrão true) abre os ancestrais.

Região `sgTreeViewBusca` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgTreeView(
  searchable: true,
  searchPlaceholder: 'Pesquisar...',
  defaultSearchValue: 'Couve',
  expandMatchesOnSearch: true,
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

### Tom dos rótulos (muted)

tone: muted suaviza a cor dos rótulos; o padrão é default. Compare as duas árvores.

Região `sgTreeViewTomMuted` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgGrid(
  columns: 2,
  gap: 16,
  children: [
    SgTreeView(
      tone: SgTreeViewTone.defaultValue,
      defaultExpandedIds: const ['docs'],
      nodes: [
        SgTreeNode(
          id: 'docs',
          label: 'Documentos',
          children: [
            SgTreeNode(id: 'contrato', label: 'Contrato'),
            SgTreeNode(id: 'nota', label: 'Nota fiscal'),
          ],
        ),
      ],
    ),
    SgTreeView(
      tone: SgTreeViewTone.muted,
      defaultExpandedIds: const ['docs'],
      nodes: [
        SgTreeNode(
          id: 'docs',
          label: 'Documentos',
          children: [
            SgTreeNode(id: 'contrato', label: 'Contrato'),
            SgTreeNode(id: 'nota', label: 'Nota fiscal'),
          ],
        ),
      ],
    ),
  ],
)
```

### Nó desabilitado

enabled: false deixa o nó visível, mas sem resposta a clique, expansão ou marcação.

Região `sgTreeViewDesabilitado` em `sg_tree_view_page.snippets.g.dart`.

```dart
SgTreeView(
  checkable: true,
  defaultExpandedIds: const ['docs'],
  nodes: [
    SgTreeNode(
      id: 'docs',
      label: 'Documentos',
      children: [
        SgTreeNode(id: 'contrato', label: 'Contrato'),
        SgTreeNode(
          id: 'bloqueado',
          label: 'Bloqueado',
          enabled: false,
        ),
      ],
    ),
  ],
)
```

## SgDockLayout

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_layout_page.dart` (3 exemplo(s) na página; todos abaixo).

### Básico

Quatro zonas (top/bottom/left/right) com toolbars arrastáveis.

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
            bottom: 60,
            width: 100,
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
          Positioned(
            right: 0,
            top: 60,
            bottom: 60,
            width: 100,
            child: SgDockZone(
              zone: SgDockZoneId.right,
              children: [
                SgButton(
                  label: Text('Usuários'),
                  size: SgSize.sm,
                  appearance: SgAppearance.ghost,
                ),
                SgButton(
                  label: Text('Ajustes'),
                  size: SgSize.sm,
                  appearance: SgAppearance.ghost,
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SgDockZone(
              zone: SgDockZoneId.bottom,
              children: [
                SgButton(
                  label: Text('Painel'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                ),
                SgButton(
                  label: Text('Relatório'),
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                ),
              ],
            ),
          ),
          Positioned(
            left: 100,
            right: 100,
            top: 60,
            bottom: 60,
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

Cada toolbar tem zona, ordem e recolhimento; o defaultState define o estado inicial.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_zone_page.dart` (4 exemplo(s) na página; todos abaixo).

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

### Um filho (child) ou vários (children)

children tem precedência sobre child.

Região `sgDockZoneFilhos` em `sg_dock_zone_page.snippets.g.dart`.

```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black26),
    borderRadius: BorderRadius.circular(8),
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgDockZone(
        zone: SgDockZoneId.top,
        child: Text('só child'),
      ),
      SgDockZone(
        zone: SgDockZoneId.top,
        child: Text('child ignorado'),
        children: [
          Text('children 1'),
          Text('children 2'),
        ],
      ),
    ],
  ),
)
```

## SgDockScreen

Página: `apps/seedgrid_showcase/lib/pages/sg_dock_screen_page.dart` (3 exemplo(s) na página; todos abaixo).

### Básico

Uso direto do SgDockScreen com quatro dock zones e área livre central, sem posicionamento manual.

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

O conteúdo fica na célula central, entre as zonas laterais.

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

Página: `apps/seedgrid_showcase/lib/pages/sg_tool_bar_page.dart` (6 exemplo(s) na página; todos abaixo).

### Básico

Exemplo vertical simples com botões de navegação.

Região `sgToolBarBasico` em `sg_tool_bar_page.snippets.g.dart`.

```dart
Align(
  alignment: Alignment.centerLeft,
  child: SgToolBar(
    id: 'tb-basic',
    title: Text('Navegação'),
    orientationDirection:
        SgToolBarOrientationDirection.verticalDown,
    children: [
      SgToolbarIconButton(
        icon: const Icon(Icons.home_outlined),
        label: 'Home',
        hint: 'Ir para o início',
        severity: SgToolbarIconButtonSeverity.primary,
      ),
      SgToolbarIconButton(
        icon: const Icon(Icons.people_outline),
        label: 'Usuários',
        hint: 'Abrir lista de usuários',
      ),
      SgToolbarIconButton(
        icon: const Icon(Icons.settings_outlined),
        label: 'Configurações',
        hint: 'Abrir configurações',
      ),
    ],
  ),
)
```

### onClick assíncrono com toast

Quando onClick retorna Promise, o botão mostra loading até concluir.

Região `sgToolBarAsync` em `sg_tool_bar_page.snippets.g.dart`.

```dart
Align(
  alignment: Alignment.centerLeft,
  child: SingleChildScrollView(
    scrollDirection: Axis.horizontal,
    child: SgToolBar(
      id: 'tb-async',
      title: Text('Ações'),
      orientationDirection:
          SgToolBarOrientationDirection.horizontalLeft,
      collapsible: true,
      children: [
        SgToolbarIconButton(
          icon: const Icon(Icons.add),
          label: 'Criar',
          hint: 'Criar novo registro',
          severity: SgToolbarIconButtonSeverity.success,
          onClick: () async {
            final mensagem = 'Ação Criar concluída';
            await Future<void>.delayed(const Duration(seconds: 1));
            toast.success(mensagem);
          },
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.edit_outlined),
          label: 'Editar',
          hint: 'Editar registro selecionado',
          severity: SgToolbarIconButtonSeverity.info,
          onClick: () async {
            final mensagem = 'Ação Editar concluída';
            await Future<void>.delayed(const Duration(seconds: 1));
            toast.info(mensagem);
          },
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.delete_outline),
          label: 'Excluir',
          hint: 'Excluir registro selecionado',
          severity: SgToolbarIconButtonSeverity.danger,
          onClick: () async {
            final mensagem = 'Ação Excluir concluída';
            await Future<void>.delayed(const Duration(seconds: 1));
            toast.warning(mensagem);
          },
        ),
      ],
    ),
  ),
)
```

### Orientação e quebra

Comparação entre horizontal-left e vertical-down com buttonsPerDirection.

Região `sgToolBarOrientacao` em `sg_tool_bar_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  gap: 24,
  children: [
    SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SgToolBar(
        id: 'tb-horizontal',
        title: Text('Ações'),
        orientationDirection:
            SgToolBarOrientationDirection.horizontalLeft,
        buttonsPerDirection: 3,
        collapsible: true,
        children: [
          SgToolbarIconButton(
            icon: const Icon(Icons.add),
            label: 'Criar',
            hint: 'Criar novo registro',
            severity: SgToolbarIconButtonSeverity.success,
          ),
          SgToolbarIconButton(
            icon: const Icon(Icons.edit_outlined),
            label: 'Editar',
            hint: 'Editar registro selecionado',
            severity: SgToolbarIconButtonSeverity.info,
          ),
          SgToolbarIconButton(
            icon: const Icon(Icons.delete_outline),
            label: 'Excluir',
            hint: 'Excluir registro selecionado',
            severity: SgToolbarIconButtonSeverity.danger,
          ),
          SgToolbarIconButton(
            icon: const Icon(Icons.filter_alt_outlined),
            label: 'Filtro',
            hint: 'Filtrar resultados',
          ),
          SgToolbarIconButton(
            icon: const Icon(Icons.refresh),
            label: 'Atualizar',
            hint: 'Atualizar dados da tela',
          ),
        ],
      ),
    ),
    SgToolBar(
      id: 'tb-vertical',
      title: Text('Navegação'),
      orientationDirection:
          SgToolBarOrientationDirection.verticalDown,
      buttonsPerDirection: 2,
      collapsible: true,
      children: [
        SgToolbarIconButton(
          icon: const Icon(Icons.home_outlined),
          label: 'Home',
          hint: 'Ir para o início',
          severity: SgToolbarIconButtonSeverity.primary,
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.people_outline),
          label: 'Usuários',
          hint: 'Abrir lista de usuários',
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.settings_outlined),
          label: 'Configurações',
          hint: 'Abrir configurações',
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.filter_alt_outlined),
          label: 'Filtro',
          hint: 'Filtrar resultados',
        ),
        SgToolbarIconButton(
          icon: const Icon(Icons.refresh),
          label: 'Atualizar',
          hint: 'Atualizar dados da tela',
        ),
      ],
    ),
  ],
)
```

### Cores de fundo

Uso de bgColor e bgColorTitle para destacar a toolbar.

Região `sgToolBarCores` em `sg_tool_bar_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final tema = Theme.of(context).colorScheme;
    String cor(Color c) =>
        '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, "0")}';
    return SgStack(
      direction: SgStackDirection.row,
      wrap: true,
      gap: 24,
      children: [
        SgToolBar(
          id: 'tb-style-a',
          title: Text('Cor no corpo'),
          orientationDirection:
              SgToolBarOrientationDirection.verticalDown,
          collapsible: true,
          bgColor: cor(tema.surfaceContainer),
          children: [
            SgToolbarIconButton(
              icon: const Icon(Icons.home_outlined),
              label: 'Home',
              hint: 'Ir para o início',
              severity: SgToolbarIconButtonSeverity.primary,
            ),
            SgToolbarIconButton(
              icon: const Icon(Icons.people_outline),
              label: 'Usuários',
              hint: 'Abrir lista de usuários',
            ),
            SgToolbarIconButton(
              icon: const Icon(Icons.settings_outlined),
              label: 'Configurações',
              hint: 'Abrir configurações',
            ),
          ],
        ),
        SgToolBar(
          id: 'tb-style-b',
          title: Text('Título destacado'),
          orientationDirection:
              SgToolBarOrientationDirection.verticalDown,
          collapsible: true,
          bgColor: cor(tema.surfaceContainerHigh),
          bgColorTitle: cor(tema.outlineVariant),
          children: [
            SgToolbarIconButton(
              icon: const Icon(Icons.filter_alt_outlined),
              label: 'Filtro',
              hint: 'Filtrar resultados',
            ),
            SgToolbarIconButton(
              icon: const Icon(Icons.refresh),
              label: 'Atualizar',
              hint: 'Atualizar dados da tela',
            ),
            SgToolbarIconButton(
              icon: const Icon(Icons.edit_outlined),
              label: 'Editar',
              hint: 'Editar registro selecionado',
              severity: SgToolbarIconButtonSeverity.info,
            ),
          ],
        ),
      ],
    );
  },
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
        id: 'tb-drag',
        title: Text('Arraste-me'),
        freeDrag: true,
        draggable: true,
        defaultPosition: const Offset(24, 24),
        children: [
          SgToolbarIconButton(
            icon: const Icon(Icons.star_outline),
            label: 'Favorito',
          ),
          SgToolbarIconButton(
            icon: const Icon(Icons.share_outlined),
            label: 'Compartilhar',
          ),
        ],
      ),
    ],
  ),
)
```

### Overflow: itens que não cabem vão para o menu "…"

Com overflow, os botões que não cabem na largura vão para um menu "…" (SgMenu); abaixo de 600 de largura ele abre como painel inferior.

Região `sgToolBarOverflow` em `sg_tool_bar_page.snippets.g.dart`.

```dart
SizedBox(
  width: 260,
  child: SgToolBar(
    id: 'tb-overflow',
    title: Text('Estreita'),
    orientationDirection:
        SgToolBarOrientationDirection.horizontalLeft,
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

Página: `apps/seedgrid_showcase/lib/pages/sg_toolbar_icon_button_page.dart` (3 exemplo(s) na página; todos abaixo).

### Básico

Botão de ícone com rótulo e dica (hint).

Região `sgToolbarIconButtonBasico` em `sg_toolbar_icon_button_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgToolbarIconButton(
      icon: const Icon(Icons.add),
      label: 'Novo',
      hint: 'Criar um registro',
      onClick: () => _cliques.value++,
    ),
    ValueListenableBuilder<int>(
      valueListenable: _cliques,
      builder: (context, n, _) =>
          Text('Cliques: $n'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_cliques`), definido assim na página do showcase:

```dart
final ValueNotifier<int> _cliques = ValueNotifier(0);
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
      enabled: false,
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

Os blocos foram gerados por script direto dos `*.snippets.g.dart` do showcase (3e7ea56), na ordem das páginas; `node scripts/kb-componentes-vs-codigo.mjs --exemplos --tipos --componente <Nome>` confere props, tipos e uso de API legada nos exemplos. Isso **não** substitui compilar: o `flutter test` do repositório continua sendo a garantia de que o código roda.
