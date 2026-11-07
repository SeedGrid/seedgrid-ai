---
description: "Exemplos Dart de Inputs de seleção e valores em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 8a43f9d
analisado-em: 2026-11-07
---

# Exemplos — Inputs de seleção e valores (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, e `${context.tx('texto')}` dentro de uma string virou `texto`. Conferido em 2026-11-07 por comparação de texto com as constantes `*PageSnippets` do showcase (seedgrid-fe-flutter 8a43f9d): todos os blocos abaixo são cópia 1:1 dessas constantes, com essa única alteração. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis `_x` do estado da página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes na página. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

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

Página: `apps/seedgrid_showcase/lib/pages/sg_checkbox_group_page.dart` (16 exemplo(s) na página; abaixo 3).

### Básico

Região `sgCheckboxGroupBasico` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'basic',
      title: 'Escolha as opções',
      value: _basico,
      onChange: (v) => setState(() => _basico = v),
      source: [
        SgCheckboxGroupOption(
          label: 'Opção 1',
          value: 'option1',
        ),
        SgCheckboxGroupOption(
          label: 'Opção 2',
          value: 'option2',
        ),
        SgCheckboxGroupOption(
          label: 'Opção 3',
          value: 'option3',
        ),
      ],
    ),
    const SizedBox(height: 8),
    Text(
      'Valores selecionados: [${_basico.join(', ')}]',
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `List<Object> _basico = const ['option1'];`

### Orientação Horizontal

Região `sgCheckboxGroupOrientacaoHorizontal` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'horizontal',
      title: 'Selecione frutas',
      orientation: SgCheckboxGroupOrientation.horizontal,
      value: _horizontal,
      onChange: (v) => setState(() => _horizontal = v),
      source: [
        SgCheckboxGroupOption(
          label: 'Maçã',
          value: 'apple',
        ),
        SgCheckboxGroupOption(
          label: 'Banana',
          value: 'banana',
        ),
        SgCheckboxGroupOption(
          label: 'Laranja',
          value: 'orange',
        ),
        SgCheckboxGroupOption(
          label: 'Uva',
          value: 'grape',
        ),
      ],
    ),
    const SizedBox(height: 8),
    Text(
      'Valores selecionados: [${_horizontal.join(', ')}]',
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `List<Object> _horizontal = const [];`

### Com Ícones

Região `sgCheckboxGroupComIcones` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'with-icons',
  title: 'Escolha ações',
  source: [
    SgCheckboxGroupOption(
      label: 'Favorito',
      value: 'favorite',
      icon: Icon(Icons.favorite, size: 16),
    ),
    SgCheckboxGroupOption(
      label: 'Importante',
      value: 'important',
      icon: Icon(Icons.star, size: 16),
    ),
    SgCheckboxGroupOption(
      label: 'Curtir',
      value: 'like',
      icon: Icon(Icons.thumb_up, size: 16),
    ),
  ],
)
```

## SgRadioGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_radio_group_page.dart` (14 exemplo(s) na página; abaixo 3).

### Básico

Região `sgRadioGroupBasico` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'basic',
      title: 'Escolha uma opção',
      value: _basico,
      onChange: (v) => setState(() => _basico = v),
      source: [
        SgRadioGroupOption(
          label: 'Opção 1',
          value: 'option1',
        ),
        SgRadioGroupOption(
          label: 'Opção 2',
          value: 'option2',
        ),
        SgRadioGroupOption(
          label: 'Opção 3',
          value: 'option3',
        ),
      ],
    ),
    const SizedBox(height: 8),
    Text('Valor selecionado: ${_basico ?? '-'}'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `Object? _basico = 'option1';`

### Orientation Horizontal

Região `sgRadioGroupOrientationHorizontal` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'horizontal',
      title: 'Selecione uma fruta',
      orientation: SgRadioGroupOrientation.horizontal,
      value: _fruta,
      onChange: (v) => setState(() => _fruta = v),
      source: [
        SgRadioGroupOption(
          label: 'Maçã',
          value: 'apple',
        ),
        SgRadioGroupOption(
          label: 'Banana',
          value: 'banana',
        ),
        SgRadioGroupOption(
          label: 'Laranja',
          value: 'orange',
        ),
        SgRadioGroupOption(
          label: 'Uva',
          value: 'grape',
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `Object? _fruta;`

### Com Ícones

Região `sgRadioGroupComIcones` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'with-icons',
  title: 'Escolha uma ação',
  source: [
    SgRadioGroupOption(
      label: 'Favorito',
      value: 'favorite',
      icon: Icon(Icons.favorite, size: 16),
    ),
    SgRadioGroupOption(
      label: 'Importante',
      value: 'important',
      icon: Icon(Icons.star, size: 16),
    ),
    SgRadioGroupOption(
      label: 'Curtir',
      value: 'like',
      icon: Icon(Icons.thumb_up, size: 16),
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
      enabled: false,
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
- `const List<SgOrderListItem> _tarefas = [ SgOrderListItem(label: 'Escrever o plano', value: 1), SgOrderListItem(label: 'Revisar com o time', value: 2), SgOrderListItem(label: 'Publicar', value: 3), SgOrderListItem(label: 'Arquivado', value: 4, enabled: false), SgOrderListItem(label: 'Comemorar', value: 5), ];`

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
- `const List<SgOrderListItem> _tarefas = [ SgOrderListItem(label: 'Escrever o plano', value: 1), SgOrderListItem(label: 'Revisar com o time', value: 2), SgOrderListItem(label: 'Publicar', value: 3), SgOrderListItem(label: 'Arquivado', value: 4, enabled: false), SgOrderListItem(label: 'Comemorar', value: 5), ];`
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
- `const List<SgPickListItem> _frutas = [ SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', enabled: false), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva'), ];`

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
      enabled: false,
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
- `const List<SgPickListItem> _frutas = [ SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', enabled: false), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva'), ];`
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
      enabled: false,
    ),
  ],
)
```

## SgToggleSwitch

Página: `apps/seedgrid_showcase/lib/pages/sg_toggle_switch_page.dart` (7 exemplo(s) na página; abaixo 3).

### Básico

Clique no rótulo ou na chave; Tab foca e Espaço alterna.

Região `sgToggleSwitchBasico` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgToggleSwitch(
      id: 'notificar',
      label: 'Receber notificações',
      description: 'Avisos por e-mail',
      onChange: (v) => setState(() => _ligado = v),
    ),
    Text('Estado: ${_ligado ? 'ligado' : 'desligado'}'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `bool _ligado = false;`

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
      enabled: false,
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

## SgRating

Página: `apps/seedgrid_showcase/lib/pages/sg_rating_page.dart` (8 exemplo(s) na página; abaixo 3).

### Básico

Exemplo controlado com estado.

Região `sgRatingBasico` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0x403B82F6)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: SgRating(
        value: _basico,
        onChange: (v) => setState(() => _basico = v),
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: $_basico'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `num _basico = 0;`

### Meia estrela + tooltip

Permite clicar nas metades e exibir valor no hover.

Região `sgRatingMeia` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRating(
      label: 'Passe o mouse e clique nas meias estrelas',
      value: _meia,
      allowHalf: true,
      showTooltip: true,
      onChange: (v) => setState(() => _meia = v),
      onHover: (v) => setState(() => _meiaHover = v),
    ),
    const SizedBox(height: 8),
    Text(
      'Selecionado: $_meia | Hover: ${_meiaHover ?? 'nenhum'}',
    ),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `num _meia = 2.5;`
- `num? _meiaHover;`

### Read-only e desabilitado

Visualização sem interação e estado desabilitado.

Região `sgRatingReadonly` em `sg_rating_page.snippets.g.dart`.

```dart
SgGrid(
  columns: const {'base': 1, 'md': 2},
  gap: 16,
  children: [
    SgRating(
      label: 'Somente leitura',
      value: 3.5,
      allowHalf: true,
      readOnly: true,
    ),
    SgRating(
      label: 'Desabilitado',
      value: 2,
      enabled: false,
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
      enabled: false,
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
      enabled: false,
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

