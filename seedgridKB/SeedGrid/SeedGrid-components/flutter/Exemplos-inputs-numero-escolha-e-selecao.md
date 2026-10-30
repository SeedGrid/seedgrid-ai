---
description: "Flutter (nota anterior, commit 314cb5a): exemplos Flutter de Inputs de número, escolha e seleção copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos, plataforma-flutter]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Inputs de número, escolha e seleção

> **Plataforma: Flutter.** Nota anterior, por tema, mantida como estava no commit `314cb5a` (não foi revista contra o commit `e9989b8`). Os exemplos **atuais e completos por grupo** estão em: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos|Inputs de texto]] · [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos|Inputs de seleção]].

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgInputNumber

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_number_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputNumberBasico` em `sg_input_number_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputNumber(
      id: 'quantidade',
      labelText: 'Quantidade',
      onChange: (v) => setState(() => _valor = v),
    ),
    const SizedBox(height: 8),
    Text(
      'onChange: ${_valor.isEmpty ? '(nada digitado)' : _valor}',
    ),
  ],
)
```

### Casas decimais e sinal

Região `sgInputNumberDecimais` em `sg_input_number_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputNumber(
      id: 'inteiro',
      labelText: 'Inteiro (decimals: 0)',
      decimals: 0,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'tres',
      labelText: 'Três casas (decimals: 3)',
      decimals: 3,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'positivo',
      labelText: 'Só positivo',
      allowNegative: false,
    ),
  ],
)
```

## SgInputCurrency

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_currency_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputCurrencyBasico` em `sg_input_currency_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputCurrency(
      id: 'preco',
      labelText: 'Preço',
      onChange: (v) => setState(() => _valor = v),
    ),
    const SizedBox(height: 8),
    Text(
      'onChange: ${_valor.isEmpty ? '(nada digitado)' : _valor}',
    ),
  ],
)
```

### Validação

Região `sgInputCurrencyValidacao` em `sg_input_currency_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputCurrency(
      id: 'obrigatorio',
      labelText: 'Obrigatório',
      required: true,
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'faixa',
      labelText: 'Entre 10 e 500',
      minValue: 10,
      maxValue: 500,
      maxValueMessage: 'Acima do limite',
    ),
  ],
)
```

## SgStepperInput

Fonte: `apps/seedgrid_showcase/lib/pages/sg_stepper_input_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

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

## SgCheckboxGroup

Fonte: `apps/seedgrid_showcase/lib/pages/sg_checkbox_group_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgCheckboxGroupBasico` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'frutas',
      title: 'Frutas',
      source: const [
        SgCheckboxGroupOption(
          label: 'Maçã',
          value: 'maca',
          checked: true,
        ),
        SgCheckboxGroupOption(label: 'Banana', value: 'banana'),
        SgCheckboxGroupOption(
          label: 'Cereja',
          value: 'cereja',
          disabled: true,
        ),
      ],
      onChange: (v) => setState(() => _escolhidas = v),
    ),
    Text('Escolhidas: ${_escolhidas.join(', ')}'),
  ],
)
```

### Selecionar todos

Região `sgCheckboxGroupTodos` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
const SgCheckboxGroup(
  id: 'todos',
  title: 'Permissões',
  showCheckAll: true,
  source: [
    SgCheckboxGroupOption(label: 'Ler', value: 'r', checked: true),
    SgCheckboxGroupOption(label: 'Escrever', value: 'w'),
    SgCheckboxGroupOption(
      label: 'Apagar',
      value: 'd',
      disabled: true,
    ),
  ],
)
```

## SgRadioGroup

Fonte: `apps/seedgrid_showcase/lib/pages/sg_radio_group_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgRadioGroupBasico` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'tamanho',
      title: 'Tamanho',
      source: const [
        SgRadioGroupOption(label: 'Pequeno', value: 'p'),
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

### Dentro de um formulário

Região `sgRadioGroupFormulario` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      id: 'plano',
      name: 'plano',
      control: _form,
      title: 'Plano',
      required: true,
      source: const [
        SgRadioGroupOption(label: 'Grátis', value: 'free'),
        SgRadioGroupOption(label: 'Pro', value: 'pro'),
      ],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: const Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => setState(() => _enviado = '${values['plano']}'),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

## SgToggleSwitch

Fonte: `apps/seedgrid_showcase/lib/pages/sg_toggle_switch_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

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

### Validação

Região `sgToggleSwitchValidacao` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const SgToggleSwitch(
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

## SgSlider

Fonte: `apps/seedgrid_showcase/lib/pages/sg_slider_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

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

### Passo (step)

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

## SgRating

Fonte: `apps/seedgrid_showcase/lib/pages/sg_rating_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

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

### Meia estrela e tooltip

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

## SgCombobox

Fonte: `apps/seedgrid_showcase/lib/pages/sg_combobox_page.dart` (5 exemplo(s) na página; abaixo 2).

### Lista simples

Região `sgComboboxSimples` em `sg_combobox_page.snippets.g.dart`.

```dart
const SgCombobox<String>(
  id: 'fruta',
  labelText: 'Fruta',
  source: ['Abacate', 'Abacaxi', 'Banana', 'Laranja', 'Uva'],
)
```

### Fonte assíncrona

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

## SgAutocomplete

Fonte: `apps/seedgrid_showcase/lib/pages/sg_autocomplete_page.dart` (6 exemplo(s) na página; abaixo 2).

### Básico

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

### Botão de lista e abrir ao focar

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

## SgMultiSelect

Fonte: `apps/seedgrid_showcase/lib/pages/sg_multi_select_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgMultiSelectBasico` em `sg_multi_select_page.snippets.g.dart`.

```dart
const SgMultiSelect(
  id: 'estados',
  labelText: 'Estados',
  options: [
    SgMultiSelectOption(label: 'São Paulo', value: 'sp'),
    SgMultiSelectOption(label: 'Rio de Janeiro', value: 'rj'),
    SgMultiSelectOption(label: 'Minas Gerais', value: 'mg'),
    SgMultiSelectOption(label: 'Bahia', value: 'ba'),
  ],
)
```

### Resumo com chipLabel

Região `sgMultiSelectResumo` em `sg_multi_select_page.snippets.g.dart`.

```dart
const SgMultiSelect(
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

Fonte: `apps/seedgrid_showcase/lib/pages/sg_multi_select_chips_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgMultiSelectChipsBasico` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
const SgMultiSelectChips(
  id: 'linguagens',
  labelText: 'Linguagens',
  options: [
    SgMultiSelectOption(label: 'Dart', value: 'dart'),
    SgMultiSelectOption(label: 'Java', value: 'java'),
    SgMultiSelectOption(label: 'Rust', value: 'rust'),
    SgMultiSelectOption(label: 'TypeScript', value: 'ts'),
  ],
)
```

### chipLabel (texto curto no chip)

Região `sgMultiSelectChipsChiplabel` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
const SgMultiSelectChips(
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

## SgPickList

Fonte: `apps/seedgrid_showcase/lib/pages/sg_pick_list_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgPickListBasico` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      id: 'frutas',
      title: 'Frutas',
      source: _frutas,
      target: const [],
      onChange: (e) => setState(
        () => _ultimo =
            '${e.type.value}: origem ${e.source.length}, destino ${e.target.length}',
      ),
    ),
    Text('Última mudança: $_ultimo'),
  ],
)
```

### Filtros, cabeçalhos e seleção única

Região `sgPickListFiltros` em `sg_pick_list_page.snippets.g.dart`.

```dart
const SgPickList(
  title: 'Escolha as frutas',
  source: _frutas,
  target: [SgPickListItem(label: 'Abacate', value: 'abacate')],
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

## SgOrderList

Fonte: `apps/seedgrid_showcase/lib/pages/sg_order_list_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgOrderListBasico` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      id: 'tarefas',
      title: 'Tarefas',
      source: _tarefas,
      onChange: (items) => setState(
        () => _ordem = items.map((e) => e.label).join(' > '),
      ),
    ),
    Text('Ordem: ${_ordem.isEmpty ? '(original)' : _ordem}'),
  ],
)
```

### Seleção única e controles à direita

Região `sgOrderListSingle` em `sg_order_list_page.snippets.g.dart`.

```dart
const SgOrderList(
  title: 'Prioridades',
  source: _tarefas,
  selectionMode: SgOrderListSelectionMode.single,
  controlsPosition: SgOrderListControlsPosition.right,
)
```

## SgPeriodSelector

Fonte: `apps/seedgrid_showcase/lib/pages/sg_period_selector_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

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

### Idioma e data de referência

Região `sgPeriodSelectorIdioma` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ingles',
      label: 'Period',
      locale: 'en-US',
      referenceDate: DateTime(2024, 2, 29),
      onChange: (p) => setState(
        () => _ingles =
            '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} to ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
      ),
    ),
    const SizedBox(height: 8),
    Text(_ingles),
  ],
)
```

## SgYearPartSelector

Fonte: `apps/seedgrid_showcase/lib/pages/sg_year_part_selector_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

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

### Rótulo, obrigatório e desabilitado

Região `sgYearPartSelectorEstados` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
const Column(
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

## SgCalendar

Fonte: `apps/seedgrid_showcase/lib/pages/sg_calendar_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgCalendarBasico` em `sg_calendar_page.snippets.g.dart`.

```dart
SgCalendar(onValueChange: (data) => debugPrint('Escolheu $data'))
```

### Vários meses

Região `sgCalendarMeses` em `sg_calendar_page.snippets.g.dart`.

```dart
const SgCalendar(
  numberOfMonths: 3,
  monthsPerLine: 2,
  showAdjacentMonths: false,
  defaultViewDate: '2026-03-01',
)
```
