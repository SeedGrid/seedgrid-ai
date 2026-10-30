---
description: "Exemplos Dart de Inputs de seleção e valores em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Inputs de seleção e valores (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis `_x` do estado da página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes na página. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgAutocomplete

Página: `apps/seedgrid_showcase/lib/pages/sg_autocomplete_page.dart` (7 exemplo(s) na página; abaixo 3).

### Básico

Digite ao menos 2 letras: a busca roda depois de 300 ms sem digitar. Em tela estreita a lista abre como painel de baixo.

Região `sgAutocompleteBasico` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'pais',
  labelText: 'País',
  placeholder: 'Digite 2 letras',
  source: (q) =>
      const [
            'Argentina',
            'Bolívia',
            'Brasil',
            'Chile',
            'Colômbia',
            'Uruguai',
          ]
          .where((p) => p.toLowerCase().contains(q.toLowerCase()))
          .toList(),
)
```

### Fonte assíncrona

A fonte devolve um Future; enquanto espera aparece o texto de carregamento. Respostas antigas são descartadas.

Região `sgAutocompleteAssincrono` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'cidade',
  labelText: 'Cidade',
  delay: 200,
  loadingText: 'Buscando cidades...',
  source: (q) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return const ['Curitiba', 'Cuiabá', 'Campinas', 'Cascavel']
        .where((c) => c.toLowerCase().contains(q.toLowerCase()))
        .toList();
  },
)
```

### Botão de lista e abrir ao focar

Com showDropDownButton e openOnFocus a lista abre inteira (modo catálogo), sem digitar.

Região `sgAutocompleteBotao` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'cor',
  labelText: 'Cor',
  showDropDownButton: true,
  openOnFocus: true,
  minLengthForSearch: 0,
  source: (q) =>
      const ['Azul', 'Amarelo', 'Verde', 'Vermelho', 'Roxo']
          .where((c) => c.toLowerCase().contains(q.toLowerCase()))
          .toList(),
)
```

## SgCombobox

Página: `apps/seedgrid_showcase/lib/pages/sg_combobox_page.dart` (5 exemplo(s) na página; abaixo 3).

### Lista simples

Toque no campo para abrir. Com o campo focado, digitar uma letra salta para o item que começa com ela (type-ahead).

Região `sgComboboxSimples` em `sg_combobox_page.snippets.g.dart`.

```dart
const SgCombobox<String>(
  id: 'fruta',
  labelText: 'Fruta',
  source: ['Abacate', 'Abacaxi', 'Banana', 'Laranja', 'Uva'],
)
```

### Fonte assíncrona

A fonte é chamada ao abrir; enquanto espera aparece o texto de carregamento.

Região `sgComboboxAssincrono` em `sg_combobox_page.snippets.g.dart`.

```dart
SgCombobox<String>(
  id: 'estado',
  labelText: 'Estado',
  loadingText: 'Carregando estados...',
  source: (q) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return const ['Paraná', 'Santa Catarina', 'Rio Grande do Sul'];
  },
)
```

### Item, valor e rodapé próprios

Região `sgComboboxVisual` em `sg_combobox_page.snippets.g.dart`.

```dart
SgCombobox<SgAutocompleteItem>(
  id: 'status',
  labelText: 'Status',
  showCharCounter: false,
  renderItem: (item, active) => Row(
    children: [
      Icon(
        item.id == 1 ? Icons.check_circle : Icons.pending,
        size: 16,
        color: item.id == 1 ? Colors.green : Colors.orange,
      ),
      const SizedBox(width: 8),
      Text(item.label),
    ],
  ),
  renderValue: (item) => Text('● ${item?.label}'),
  renderFooter: (q, has) =>
      Text('Escolha o status atual'),
  source: [
    SgAutocompleteItem(id: 1, label: 'Concluído'),
    SgAutocompleteItem(id: 2, label: 'Pendente'),
  ],
)
```

## SgCheckboxGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_checkbox_group_page.dart` (5 exemplo(s) na página; abaixo 3).

### Horizontal e highlight

orientation horizontal quebra a linha; selectionStyle highlight troca a caixa por um cartão.

Região `sgCheckboxGroupEstilos` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'horizontal',
      title: 'Horizontal',
      orientation: SgCheckboxGroupOrientation.horizontal,
      source: [
        SgCheckboxGroupOption(label: 'Um', value: 1),
        SgCheckboxGroupOption(
          label: 'Dois',
          value: 2,
          checked: true,
        ),
        SgCheckboxGroupOption(label: 'Três', value: 3),
      ],
    ),
    SizedBox(height: 16),
    SgCheckboxGroup(
      id: 'highlight',
      title: 'Highlight',
      selectionStyle: SgCheckboxGroupSelectionStyle.highlight,
      source: [
        SgCheckboxGroupOption(
          label: 'Lista',
          value: 'lista',
          checked: true,
          icon: Icon(Icons.list, size: 16),
        ),
        SgCheckboxGroupOption(
          label: 'Grade',
          value: 'grade',
          icon: Icon(Icons.grid_view, size: 16),
        ),
      ],
    ),
  ],
)
```

### Selecionar todos

showCheckAll marca só as opções habilitadas e mostra o estado indeterminado.

Região `sgCheckboxGroupTodos` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'todos',
  title: 'Permissões',
  showCheckAll: true,
  source: [
    SgCheckboxGroupOption(
      label: 'Ler',
      value: 'r',
      checked: true,
    ),
    SgCheckboxGroupOption(
      label: 'Escrever',
      value: 'w',
    ),
    SgCheckboxGroupOption(
      label: 'Apagar',
      value: 'd',
      disabled: true,
    ),
  ],
)
```

### Controle por código

O SgCheckboxGroupController substitui o ref do React (getChecked, setChecked, checkAll, clearAll).

Região `sgCheckboxGroupController` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'ctrl',
      controller: _controller,
      source: const [
        SgCheckboxGroupOption(label: 'A', value: 'a'),
        SgCheckboxGroupOption(label: 'B', value: 'b'),
        SgCheckboxGroupOption(label: 'C', value: 'c'),
      ],
    ),
    const SizedBox(height: 8),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Marcar todos'),
          size: SgSize.sm,
          onClick: _controller.checkAll,
        ),
        SgButton(
          label: Text('Limpar'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          onClick: _controller.clearAll,
        ),
        SgButton(
          label: Text('Só B'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          onClick: () => _controller.setChecked(['b']),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgCheckboxGroupController _controller = SgCheckboxGroupController();`

## SgRadioGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_radio_group_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Escolha única; as setas do teclado movem a seleção e pulam opções desabilitadas.

Região `sgRadioGroupBasico` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'tamanho',
      title: 'Tamanho',
      source: [
        SgRadioGroupOption(
          label: 'Pequeno',
          value: 'p',
        ),
        SgRadioGroupOption(label: 'Médio', value: 'm'),
        SgRadioGroupOption(
          label: 'Grande',
          value: 'g',
          disabled: true,
        ),
      ],
      onChange: (v) => setState(() => _tamanho = v),
    ),
    Text('Escolhido: ${_tamanho ?? '-'}'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `Object? _tamanho;`

### Horizontal e highlight

Região `sgRadioGroupEstilos` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'horizontal',
      title: 'Horizontal',
      orientation: SgRadioGroupOrientation.horizontal,
      value: 'b',
      source: [
        SgRadioGroupOption(label: 'A', value: 'a'),
        SgRadioGroupOption(label: 'B', value: 'b'),
        SgRadioGroupOption(label: 'C', value: 'c'),
      ],
    ),
    SizedBox(height: 16),
    SgRadioGroup(
      id: 'highlight',
      title: 'Highlight',
      selectionStyle: SgRadioGroupSelectionStyle.highlight,
      value: 'lista',
      source: [
        SgRadioGroupOption(
          label: 'Lista',
          value: 'lista',
          icon: Icon(Icons.list, size: 16),
        ),
        SgRadioGroupOption(
          label: 'Grade',
          value: 'grade',
          icon: Icon(Icons.grid_view, size: 16),
        ),
      ],
    ),
  ],
)
```

### Só ícones, somente leitura e desabilitado

Região `sgRadioGroupEstados` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'icones',
      title: 'iconOnly',
      iconOnly: true,
      orientation: SgRadioGroupOrientation.horizontal,
      selectionStyle: SgRadioGroupSelectionStyle.highlight,
      value: 'a',
      source: [
        SgRadioGroupOption(
          label: 'Estrela',
          value: 'a',
          icon: Icon(Icons.star),
        ),
        SgRadioGroupOption(
          label: 'Coração',
          value: 'b',
          icon: Icon(Icons.favorite),
        ),
      ],
    ),
    SizedBox(height: 16),
    SgRadioGroup(
      id: 'leitura',
      title: 'readOnly',
      readOnly: true,
      value: 'x',
      source: [
        SgRadioGroupOption(label: 'X', value: 'x'),
        SgRadioGroupOption(label: 'Y', value: 'y'),
      ],
    ),
    SizedBox(height: 16),
    SgRadioGroup(
      id: 'off',
      title: 'disabled',
      disabled: true,
      value: 'x',
      source: [
        SgRadioGroupOption(label: 'X', value: 'x'),
        SgRadioGroupOption(label: 'Y', value: 'y'),
      ],
    ),
  ],
)
```

## SgMultiSelect

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Toque no campo para abrir a lista e marque quantas opções quiser. Em tela estreita (menos de 600 px) a lista abre como bottom sheet.

Região `sgMultiSelectBasico` em `sg_multi_select_page.snippets.g.dart`.

```dart
SgMultiSelect(
  id: 'estados',
  labelText: 'Estados',
  options: [
    SgMultiSelectOption(
      label: 'São Paulo',
      value: 'sp',
    ),
    SgMultiSelectOption(
      label: 'Rio de Janeiro',
      value: 'rj',
    ),
    SgMultiSelectOption(
      label: 'Minas Gerais',
      value: 'mg',
    ),
    SgMultiSelectOption(label: 'Bahia', value: 'ba'),
  ],
)
```

### Busca, limpar e limite

searchable abre um campo de busca; clearable mostra o botão de limpar; maxSelected impede marcar mais itens.

Região `sgMultiSelectBusca` em `sg_multi_select_page.snippets.g.dart`.

```dart
SgMultiSelect(
  id: 'cores',
  labelText: 'Até 3 cores',
  searchable: true,
  clearable: true,
  maxSelected: 3,
  searchPlaceholder: 'Buscar cor...',
  options: [
    SgMultiSelectOption(label: 'Azul', value: 'azul'),
    SgMultiSelectOption(label: 'Verde', value: 'verde'),
    SgMultiSelectOption(
      label: 'Vermelho',
      value: 'vermelho',
    ),
    SgMultiSelectOption(
      label: 'Amarelo',
      value: 'amarelo',
    ),
    SgMultiSelectOption(label: 'Roxo', value: 'roxo'),
    SgMultiSelectOption(
      label: 'Cinza (indisponível)',
      value: 'cinza',
      disabled: true,
    ),
  ],
)
```

### Resumo com chipLabel

chipLabel é o texto curto do item já selecionado. Até summaryThreshold itens o campo lista os rótulos; acima disso mostra "N selecionadas".

Região `sgMultiSelectResumo` em `sg_multi_select_page.snippets.g.dart`.

```dart
SgMultiSelect(
  id: 'filiais',
  labelText: 'Filiais',
  summaryThreshold: 3,
  options: [
    SgMultiSelectOption(
      label: '1 - Matriz',
      value: 1,
      chipLabel: '1',
    ),
    SgMultiSelectOption(
      label: '2 - Filial Centro',
      value: 2,
      chipLabel: '2',
    ),
    SgMultiSelectOption(
      label: '3 - Filial Norte',
      value: 3,
      chipLabel: '3',
    ),
    SgMultiSelectOption(
      label: '4 - Filial Sul',
      value: 4,
      chipLabel: '4',
    ),
  ],
)
```

## SgMultiSelectChips

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_chips_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Os valores marcados viram chips removíveis. Toque no campo para abrir a lista; em tela estreita (menos de 600 px) ela abre como bottom sheet.

Região `sgMultiSelectChipsBasico` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SgMultiSelectChips(
  id: 'linguagens',
  labelText: 'Linguagens',
  options: [
    SgMultiSelectOption(label: 'Dart', value: 'dart'),
    SgMultiSelectOption(label: 'Java', value: 'java'),
    SgMultiSelectOption(label: 'Rust', value: 'rust'),
    SgMultiSelectOption(
      label: 'TypeScript',
      value: 'ts',
    ),
  ],
)
```

### Busca, limpar e limite

searchable, clearable e maxSelected. O X do chip remove só aquele valor.

Região `sgMultiSelectChipsBusca` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SgMultiSelectChips(
  id: 'paises',
  labelText: 'Até 3 países',
  searchable: true,
  clearable: true,
  maxSelected: 3,
  searchPlaceholder: 'Buscar país...',
  options: [
    SgMultiSelectOption(label: 'Brasil', value: 'br'),
    SgMultiSelectOption(label: 'Portugal', value: 'pt'),
    SgMultiSelectOption(
      label: 'Argentina',
      value: 'ar',
    ),
    SgMultiSelectOption(label: 'Uruguai', value: 'uy'),
    SgMultiSelectOption(label: 'Paraguai', value: 'py'),
  ],
)
```

### chipLabel (texto curto no chip)

O chip mostra o chipLabel; o nome completo aparece como dica ao segurar o chip.

Região `sgMultiSelectChipsChiplabel` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SgMultiSelectChips(
  id: 'filiais',
  labelText: 'Filiais',
  value: [1, 3],
  options: [
    SgMultiSelectOption(
      label: '1 - Matriz São Paulo',
      value: 1,
      chipLabel: '1',
    ),
    SgMultiSelectOption(
      label: '2 - Filial Centro',
      value: 2,
      chipLabel: '2',
    ),
    SgMultiSelectOption(
      label: '3 - Filial Norte',
      value: 3,
      chipLabel: '3',
    ),
  ],
)
```

## SgOrderList

Página: `apps/seedgrid_showcase/lib/pages/sg_order_list_page.dart` (5 exemplo(s) na página; abaixo 3).

### Seleção única e controles à direita

selectionMode single e controlsPosition right; com Ctrl + setas, Home e End no teclado.

Região `sgOrderListSingle` em `sg_order_list_page.snippets.g.dart`.

```dart
SgOrderList(
  title: 'Prioridades',
  source: _tarefas,
  selectionMode: SgOrderListSelectionMode.single,
  controlsPosition: SgOrderListControlsPosition.right,
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `const List<SgOrderListItem> _tarefas = [ SgOrderListItem(label: 'Escrever o plano', value: 1), SgOrderListItem(label: 'Revisar com o time', value: 2), SgOrderListItem(label: 'Publicar', value: 3), SgOrderListItem(label: 'Arquivado', value: 4, disabled: true), SgOrderListItem(label: 'Comemorar', value: 5), ];`

### Item personalizado

itemTemplate recebe o item e o estado (índice, selecionado, desabilitado).

Região `sgOrderListTemplate` em `sg_order_list_page.snippets.g.dart`.

```dart
SgOrderList(
  title: 'Com numeração',
  source: [
    SgOrderListItem(
      label: 'Um',
      value: 1,
      icon: Icon(Icons.looks_one, size: 16),
    ),
    SgOrderListItem(label: 'Dois', value: 2),
    SgOrderListItem(label: 'Três', value: 3),
  ],
  itemTemplate: (item, state) => Text(
    '#${state.index + 1} ${item.label}${state.selected ? ' *' : ''}',
  ),
)
```

### Controle por código

controller seleciona, move e troca a lista (substitui o ref do React).

Região `sgOrderListController` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      title: 'Controlada',
      source: _tarefas,
      controller: _controller,
    ),
    const SizedBox(height: 8),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Selecionar a 3ª'),
          onClick: () => _controller.setSelection(const [3]),
        ),
        SgButton(
          label: Text('Mover para o topo'),
          onClick: () => _controller.moveTop(),
        ),
        SgButton(
          label: Text('Inverter'),
          onClick: () => _controller.setItems(
            _controller.getItems().reversed.toList(),
          ),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `const List<SgOrderListItem> _tarefas = [ SgOrderListItem(label: 'Escrever o plano', value: 1), SgOrderListItem(label: 'Revisar com o time', value: 2), SgOrderListItem(label: 'Publicar', value: 3), SgOrderListItem(label: 'Arquivado', value: 4, disabled: true), SgOrderListItem(label: 'Comemorar', value: 5), ];`
- `final SgOrderListController _controller = SgOrderListController();`

## SgPickList

Página: `apps/seedgrid_showcase/lib/pages/sg_pick_list_page.dart` (5 exemplo(s) na página; abaixo 3).

### Filtros, cabeçalhos e seleção única

showSourceFilter e showTargetFilter com filterMatchMode startsWith; selectionMode single.

Região `sgPickListFiltros` em `sg_pick_list_page.snippets.g.dart`.

```dart
SgPickList(
  title: 'Escolha as frutas',
  source: _frutas,
  target: [
    SgPickListItem(label: 'Abacate', value: 'abacate'),
  ],
  sourceHeader: 'Disponíveis',
  targetHeader: 'Escolhidas',
  showSourceFilter: true,
  showTargetFilter: true,
  filterMatchMode: SgPickListFilterMatchMode.startsWith,
  selectionMode: SgPickListSelectionMode.single,
  showSourceControls: false,
  showTargetControls: false,
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `const List<SgPickListItem> _frutas = [ SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', disabled: true), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva'), ];`

### Item personalizado e desabilitado

itemTemplate recebe o item e o estado (índice, selecionado, desabilitado, lista).

Região `sgPickListTemplate` em `sg_pick_list_page.snippets.g.dart`.

```dart
SgPickList(
  title: 'Com ícones',
  source: [
    SgPickListItem(
      label: 'Favoritos',
      value: 1,
      icon: Icon(Icons.star, size: 16),
    ),
    SgPickListItem(
      label: 'Rápidos',
      value: 2,
      icon: Icon(Icons.bolt, size: 16),
    ),
    SgPickListItem(
      label: 'Bloqueado',
      value: 3,
      disabled: true,
    ),
  ],
  target: const [],
  itemTemplate: (item, state) => Row(
    children: [
      Icon(
        state.list == SgPickListListName.source
            ? Icons.inbox
            : Icons.check_circle,
        size: 16,
      ),
      const SizedBox(width: 8),
      Expanded(
        child: Text(
          '${state.index + 1}. ${item.label}${state.selected ? ' (selecionado)' : ''}',
        ),
      ),
    ],
  ),
)
```

### Controle por código

controller move e limpa a seleção sem tocar na lista (substitui o ref do React).

Região `sgPickListController` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      title: 'Controlada',
      source: _frutas,
      target: const [],
      controller: _controller,
    ),
    const SizedBox(height: 8),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Mover todos'),
          onClick: () => _controller.moveAllToTarget(),
        ),
        SgButton(
          label: Text('Devolver todos'),
          onClick: () => _controller.moveAllToSource(),
        ),
        SgButton(
          label: Text('Limpar seleção'),
          onClick: () => _controller.clearSelection(),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `const List<SgPickListItem> _frutas = [ SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', disabled: true), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva'), ];`
- `final SgPickListController _controller = SgPickListController();`

## SgPeriodSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_period_selector_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Escolha um período para receber o intervalo de datas já resolvido (início às 00:00:00 e fim às 23:59:59.999). Não dispara nada ao abrir a página.

Região `sgPeriodSelectorBasico` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      label: 'Período',
      onChange: (p) => setState(
        () => _basico =
            '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} a ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
      ),
    ),
    const SizedBox(height: 8),
    Text(_basico),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = 'Nenhum período escolhido';`

### Grupos de opções

Cada grupo liga e desliga com permitPast, permitCurrent, permitFuture, permitAll e allowCustomPeriod. Marque as caixas para ver a lista mudar.

Região `sgPeriodSelectorGrupos` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        FilterChip(
          label: Text('Passados'),
          selected: _passados,
          onSelected: (v) => setState(() => _passados = v),
        ),
        FilterChip(
          label: Text('Atuais'),
          selected: _atuais,
          onSelected: (v) => setState(() => _atuais = v),
        ),
        FilterChip(
          label: Text('Futuros'),
          selected: _futuros,
          onSelected: (v) => setState(() => _futuros = v),
        ),
        FilterChip(
          label: Text('Todos'),
          selected: _todos,
          onSelected: (v) => setState(() => _todos = v),
        ),
        FilterChip(
          label: Text('Período'),
          selected: _periodo,
          onSelected: (v) => setState(() => _periodo = v),
        ),
      ],
    ),
    const SizedBox(height: 12),
    SgPeriodSelector(
      id: 'grupos',
      label: 'Período',
      permitPast: _passados,
      permitCurrent: _atuais,
      permitFuture: _futuros,
      permitAll: _todos,
      allowCustomPeriod: _periodo,
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `bool _passados = true;`
- `bool _atuais = true;`
- `bool _futuros = false;`
- `bool _todos = true;`
- `bool _periodo = true;`

### Período personalizado com limites

Escolha "Periodo" para informar duas datas. minDate e maxDate limitam o calendário e fazem clamp nos períodos prontos. Enquanto o ano está incompleto, a data sai vazia.

Região `sgPeriodSelectorPersonalizado` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'personalizado',
      label: 'Período',
      minDate: DateTime(2024, 1, 1),
      maxDate: DateTime(2024, 12, 31),
      referenceDate: DateTime(2024, 6, 15),
      onChange: (p) => setState(
        () => _personalizado =
            '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} a ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
      ),
    ),
    const SizedBox(height: 8),
    Text(_personalizado),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _personalizado = 'Nenhum período escolhido';`

## SgYearPartSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_year_part_selector_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Escolha ano, recorte (semestre, trimestre ou bimestre) e fatia: o intervalo de datas sai resolvido. Abre no ano corrente, no primeiro recorte e na fatia em que hoje cai, sem disparar onChange.

Região `sgYearPartSelectorBasico` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      label: 'Recorte do ano',
      onChange: (r) => setState(
        () => _basico =
            '${r.value.year} - ${r.label}: ${r.startDate.toIso8601String().substring(0, 10)} a ${r.endDate.toIso8601String().substring(0, 10)}',
      ),
    ),
    const SizedBox(height: 8),
    Text(_basico),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = 'Nenhum recorte escolhido';`

### Só trimestres

allowedKinds restringe os recortes. Com um único recorte permitido, o combo de recorte some.

Região `sgYearPartSelectorTrimestres` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'trimestres',
      allowedKinds: const [YearPartKind.quarter],
      onChange: (r) => setState(
        () => _trimestres =
            '${r.label}: ${r.startDate.toIso8601String().substring(0, 10)} a ${r.endDate.toIso8601String().substring(0, 10)}',
      ),
    ),
    const SizedBox(height: 8),
    Text(_trimestres),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _trimestres = 'Nenhum recorte escolhido';`

### Rótulo, obrigatório e desabilitado

Região `sgYearPartSelectorEstados` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'obrigatorio',
      label: 'Período do relatório',
      required: true,
    ),
    SizedBox(height: 16),
    SgYearPartSelector(
      id: 'desabilitado',
      label: 'Desabilitado',
      disabled: true,
    ),
  ],
)
```

## SgToggleSwitch

Página: `apps/seedgrid_showcase/lib/pages/sg_toggle_switch_page.dart` (7 exemplo(s) na página; abaixo 3).

### Ícones, somente leitura e desabilitado

Região `sgToggleSwitchEstados` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgToggleSwitch(
      id: 'icones',
      label: 'Com ícones',
      defaultChecked: true,
      onIcon: Icon(Icons.check, size: 12),
      offIcon: Icon(Icons.close, size: 12),
    ),
    SizedBox(height: 12),
    SgToggleSwitch(
      id: 'leitura',
      label: 'readOnly',
      readOnly: true,
      defaultChecked: true,
    ),
    SizedBox(height: 12),
    SgToggleSwitch(
      id: 'off',
      label: 'disabled',
      disabled: true,
    ),
  ],
)
```

### Validação

required valida ao sair do campo (validateOnBlur) ou a cada mudança (validateOnBlur: false).

Região `sgToggleSwitchValidacao` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgToggleSwitch(
      id: 'termos',
      label: 'Aceito os termos',
      required: true,
      requiredMessage: 'Aceite os termos para continuar',
    ),
    const SizedBox(height: 12),
    SgToggleSwitch(
      id: 'regra',
      label: 'Não pode ligar',
      validateOnBlur: false,
      validation: (ligado) =>
          ligado ? 'Esta chave deve ficar desligada' : null,
    ),
  ],
)
```

### Erro externo e largura

error mostra uma mensagem vinda de fora; width limita a largura do componente.

Região `sgToggleSwitchErroExterno` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
SgToggleSwitch(
  id: 'erro',
  label: 'Aceito os termos',
  error: 'Aceite os termos para continuar',
  width: 280,
)
```

## SgRating

Página: `apps/seedgrid_showcase/lib/pages/sg_rating_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

value inicial, cancel zera a nota e onHover entrega a nota sob o ponteiro.

Região `sgRatingBasico` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRating(
      id: 'basico',
      label: 'Sua avaliação',
      value: 3,
      onChange: (v) => setState(() => _nota = v),
      onHover: (v) => setState(() => _hover = v),
    ),
    Text(
      'Nota: $_nota${_hover == null ? '' : ' (passando: $_hover)'}',
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `num _nota = 3;`
- `num? _hover;`

### Meia estrela e tooltip

allowHalf: a metade esquerda da estrela vale 0,5; showTooltip mostra a nota acima.

Região `sgRatingMeia` em `sg_rating_page.snippets.g.dart`.

```dart
const SgRating(
  id: 'meia',
  allowHalf: true,
  showTooltip: true,
  cancel: false,
  value: 2.5,
)
```

### Tamanhos, cores e ícones

size de sm a xl; color e emptyColor como #hex, rgb() ou hsl(var(--token)); ícones próprios.

Região `sgRatingVisual` em `sg_rating_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRating(
      id: 'sm',
      size: SgRatingSize.sm,
      cancel: false,
      value: 4,
    ),
    SizedBox(height: 8),
    SgRating(
      id: 'xl',
      size: SgRatingSize.xl,
      cancel: false,
      value: 2,
    ),
    SizedBox(height: 8),
    SgRating(
      id: 'cores',
      color: '#E11D48',
      emptyColor: '#9CA3AF',
      cancel: false,
      value: 3,
    ),
    SizedBox(height: 8),
    SgRating(
      id: 'icones',
      stars: 3,
      cancel: false,
      value: 2,
      onIcon: Icon(Icons.favorite, color: Colors.red),
      offIcon: Icon(Icons.favorite_border, color: Colors.grey),
    ),
  ],
)
```

## SgSlider

Página: `apps/seedgrid_showcase/lib/pages/sg_slider_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

minValue, maxValue e defaultValue; onChange entrega o número a cada mudança.

Região `sgSliderBasico` em `sg_slider_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSlider(
      id: 'volume',
      minValue: 0,
      maxValue: 100,
      defaultValue: 30,
      ariaLabel: 'Volume',
      onChange: (v) => setState(() => _volume = v),
    ),
    Text('Volume: $_volume'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `num _volume = 30;`

### Passo (step)

O valor só assume múltiplos do passo, a partir de minValue.

Região `sgSliderPasso` em `sg_slider_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSlider(
      id: 'passo',
      minValue: 0,
      maxValue: 100,
      step: 25,
      defaultValue: 50,
      onChange: (v) => setState(() => _passo = v),
    ),
    Text('Valor: $_passo'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `num _passo = 50;`

### Largura, desabilitado e erro

Região `sgSliderEstados` em `sg_slider_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSlider(
      id: 'largura',
      minValue: 0,
      maxValue: 10,
      defaultValue: 4,
      width: '50%',
    ),
    SgSlider(
      id: 'off',
      minValue: 0,
      maxValue: 10,
      defaultValue: 7,
      disabled: true,
    ),
    SgSlider(
      id: 'erro',
      minValue: 0,
      maxValue: 10,
      defaultValue: 9,
      error: 'Valor alto demais',
    ),
  ],
)
```

## SgStepperInput

Página: `apps/seedgrid_showcase/lib/pages/sg_stepper_input_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Botões de aumentar e diminuir; o valor fica sempre entre minValue e maxValue.

Região `sgStepperInputBasico` em `sg_stepper_input_page.snippets.g.dart`.

```dart
const SgStepperInput(
  id: 'basico',
  minValue: 0,
  maxValue: 10,
  defaultValue: 3,
  width: 160,
)
```

### Passo e limites

step define o incremento (aceita decimais); no limite o botão fica desabilitado.

Região `sgStepperInputPasso` em `sg_stepper_input_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgStepperInput(
      id: 'de-cinco',
      minValue: 0,
      maxValue: 50,
      step: 5,
      width: 160,
    ),
    SizedBox(height: 12),
    SgStepperInput(
      id: 'meio',
      minValue: 0,
      maxValue: 5,
      step: 0.5,
      defaultValue: 2.5,
      width: 160,
    ),
  ],
)
```

### Estados

Região `sgStepperInputEstados` em `sg_stepper_input_page.snippets.g.dart`.

```dart
const Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgStepperInput(
      id: 'desabilitado',
      minValue: 0,
      maxValue: 10,
      defaultValue: 4,
      disabled: true,
      width: 160,
    ),
    SizedBox(height: 12),
    SgStepperInput(
      id: 'leitura',
      minValue: 0,
      maxValue: 10,
      defaultValue: 4,
      readOnly: true,
      width: 160,
    ),
    SizedBox(height: 12),
    SgStepperInput(
      id: 'erro',
      minValue: 0,
      maxValue: 10,
      error: 'Escolha ao menos 1',
      width: 200,
    ),
  ],
)
```

