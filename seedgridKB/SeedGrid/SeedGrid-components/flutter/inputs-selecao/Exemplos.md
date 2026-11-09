---
description: "Exemplos Dart de Inputs de seleção e valores em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Inputs de seleção e valores (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco foi regerado a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 e comparado texto a texto (idêntico). Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, `${context.tx('texto')}` dentro de uma string virou `texto` e `context.txf('texto {k}', {'k': v})` virou a interpolação `'texto $v'`. O showcase não usa `setState` de página: o estado dos exemplos fica em `ValueNotifier`/`SgFormController` (campos com `name` + `control`) lidos por `ValueListenableBuilder`/`ListenableBuilder`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam membros `_x` definidos na página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgAutocomplete

Página: `apps/seedgrid_showcase/lib/pages/sg_autocomplete_page.dart` (11 exemplo(s) na página; abaixo 3).

### Básico

Digite e veja resultados conforme a busca.

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

### Botão dropdown

Botão para abrir/fechar a lista. Com um item selecionado, reabrir mostra a lista completa com o item destacado.

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

## SgCombobox

Página: `apps/seedgrid_showcase/lib/pages/sg_combobox_page.dart` (6 exemplo(s) na página; abaixo 3).

### Básico com lista de objetos

Sem input livre: com foco no campo, digite letras e ele "pula" para o item correspondente.

Região `sgComboboxItens` em `sg_combobox_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCombobox<SgAutocompleteItem>(
      id: 'cargo',
      labelText: 'Cargo',
      grouped: true,
      onValueChange: (id) => _escolhido.value = id,
      source: [
        SgAutocompleteItem(
          id: 1,
          label: 'Analista',
          group: 'TI',
        ),
        SgAutocompleteItem(
          id: 2,
          label: 'Gerente',
          group: 'TI',
        ),
        SgAutocompleteItem(
          id: 3,
          label: 'Diretor',
          group: 'Gestão',
          enabled: false,
        ),
        SgAutocompleteItem(
          id: 4,
          label: 'Coordenador',
          group: 'Gestão',
        ),
      ],
    ),
    ValueListenableBuilder<Object?>(
      valueListenable: _escolhido,
      builder: (context, escolhido, _) =>
          Text('id escolhido: ${escolhido ?? '-'}'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _escolhido = ValueNotifier(null);`

### Fonte assíncrona + render personalizado

Suporte a loadingText, renderItem, renderGroupHeader, renderFooter e itemTooltip.

Região `sgComboboxAssincrono` em `sg_combobox_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    final concluido = 'Concluído';
    final pendente = 'Pendente';
    return SgCombobox<SgAutocompleteItem>(
      id: 'status',
      labelText: 'Status',
      loadingText: 'Carregando status...',
      openOnFocus: true,
      showCharCounter: false,
      source: (q) async {
        await Future<void>.delayed(
          const Duration(milliseconds: 600),
        );
        return [
          SgAutocompleteItem(id: 1, label: concluido),
          SgAutocompleteItem(id: 2, label: pendente),
        ];
      },
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
    );
  },
)
```

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

## SgCheckboxGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_checkbox_group_page.dart` (17 exemplo(s) na página; abaixo 3).

### Básico

Região `sgCheckboxGroupBasico` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<List<Object>>(
      valueListenable: _basico,
      builder: (context, valor, _) => SgCheckboxGroup(
        id: 'basic',
        title: 'Escolha as opções',
        value: valor,
        onChange: (v) => _basico.value = v,
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
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<Object>>(
      valueListenable: _basico,
      builder: (context, valor, _) => Text(
        'Valores selecionados: [${valor.join(', ')}]',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _basico = ValueNotifier<List<Object>>(const ['option1']);`

### Orientação Horizontal

Região `sgCheckboxGroupOrientacaoHorizontal` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<List<Object>>(
      valueListenable: _horizontal,
      builder: (context, valor, _) => SgCheckboxGroup(
        id: 'horizontal',
        title: 'Selecione frutas',
        orientation: SgCheckboxGroupOrientation.horizontal,
        value: valor,
        onChange: (v) => _horizontal.value = v,
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
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<Object>>(
      valueListenable: _horizontal,
      builder: (context, valor, _) => Text(
        'Valores selecionados: [${valor.join(', ')}]',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _horizontal = ValueNotifier<List<Object>>(const []);`

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
    ValueListenableBuilder<Object?>(
      valueListenable: _basico,
      builder: (context, valor, _) => SgRadioGroup(
        id: 'basic',
        title: 'Escolha uma opção',
        value: valor,
        onChange: (v) => _basico.value = v,
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
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<Object?>(
      valueListenable: _basico,
      builder: (context, valor, _) => Text(
        'Valor selecionado: ${valor ?? '-'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _basico = ValueNotifier<Object?>('option1');`

### Orientação Horizontal

Região `sgRadioGroupOrientationHorizontal` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<Object?>(
      valueListenable: _fruta,
      builder: (context, valor, _) => SgRadioGroup(
        id: 'horizontal',
        title: 'Selecione uma fruta',
        orientation: SgRadioGroupOrientation.horizontal,
        value: valor,
        onChange: (v) => _fruta.value = v,
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
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _fruta = ValueNotifier<Object?>(null);`

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

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_page.dart` (9 exemplo(s) na página; abaixo 3).

### Básico (fechado / aberto, com e sem seleção)

Clique no campo para abrir. Marque várias opções; a lista continua aberta.

Região `sgMultiSelectBasico` em `sg_multi_select_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    SizedBox(
      width: 384,
      child: ListenableBuilder(
        listenable: _vazio,
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgMultiSelect(
              id: 'ms-empty',
              labelText: 'Empresas',
              placeholder: 'Selecione as empresas',
              options: [
                SgMultiSelectOption(
                  label: 'Empresa 1',
                  value: 'e1',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 2',
                  value: 'e2',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 3',
                  value: 'e3',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 4',
                  value: 'e4',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 5',
                  value: 'e5',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 6',
                  value: 'e6',
                ),
              ],
              value: _vazio.value,
              onChange: (v) => _vazio.value = v,
            ),
            const SizedBox(height: 8),
            Text(
              'Selecionadas: ${_vazio.value.isEmpty ? '(nenhuma)' : _vazio.value.join(', ')}',
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      width: 384,
      child: ListenableBuilder(
        listenable: _preselecionadas,
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgMultiSelect(
              id: 'ms-preselected',
              labelText: 'Empresas (com seleção)',
              placeholder: 'Selecione as empresas',
              options: [
                SgMultiSelectOption(
                  label: 'Empresa 1',
                  value: 'e1',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 2',
                  value: 'e2',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 3',
                  value: 'e3',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 4',
                  value: 'e4',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 5',
                  value: 'e5',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 6',
                  value: 'e6',
                ),
              ],
              value: _preselecionadas.value,
              onChange: (v) => _preselecionadas.value = v,
            ),
            const SizedBox(height: 8),
            Text(
              'Selecionadas: ${_preselecionadas.value.isEmpty ? '(nenhuma)' : _preselecionadas.value.join(', ')}',
            ),
          ],
        ),
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _vazio = ValueNotifier(const []);`
- `final ValueNotifier<List<Object>> _preselecionadas = ValueNotifier(const ['e1', 'e2', 'e4']);`

### Com busca

searchable habilita um campo de busca no topo do dropdown.

Região `sgMultiSelectBusca` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _pesquisavel,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelect(
          id: 'ms-searchable',
          labelText: 'Empresas',
          placeholder: 'Selecione as empresas',
          searchable: true,
          options: [
            SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
            SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
            SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
            SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
            SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
            SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
          ],
          value: _pesquisavel.value,
          onChange: (v) => _pesquisavel.value = v,
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_pesquisavel.value.isEmpty ? '(nenhuma)' : _pesquisavel.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _pesquisavel = ValueNotifier(const ['e1']);`

### Limite do resumo (summaryThreshold)

Por padrão o campo lista até 2 rótulos e depois mostra só a quantidade; summaryThreshold aumenta esse limite.

Região `sgMultiSelectResumo` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _resumo,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelect(
          id: 'ms-summary',
          labelText: 'Empresas',
          placeholder: 'Selecione as empresas',
          summaryThreshold: 4,
          options: [
            SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
            SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
            SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
            SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
            SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
            SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
          ],
          value: _resumo.value,
          onChange: (v) => _resumo.value = v,
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_resumo.value.isEmpty ? '(nenhuma)' : _resumo.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _resumo = ValueNotifier(const ['e1', 'e2', 'e4']);`

## SgMultiSelectChips

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_chips_page.dart` (7 exemplo(s) na página; abaixo 3).

### Básico (vazio / com chips)

Clique no campo para abrir. Cada item selecionado vira um chip com botão de remover.

Região `sgMultiSelectChipsBasico` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 16,
  children: [
    SizedBox(
      width: 384,
      child: ListenableBuilder(
        listenable: _vazio,
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgMultiSelectChips(
              id: 'msc-empty',
              labelText: 'Empresas',
              placeholder: 'Selecione as empresas',
              options: [
                SgMultiSelectOption(
                  label: 'Empresa 1',
                  value: 'e1',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 2',
                  value: 'e2',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 3',
                  value: 'e3',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 4',
                  value: 'e4',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 5',
                  value: 'e5',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 6',
                  value: 'e6',
                ),
              ],
              value: _vazio.value,
              onChange: (v) => _vazio.value = v,
            ),
            const SizedBox(height: 8),
            Text(
              'Selecionadas: ${_vazio.value.isEmpty ? '(nenhuma)' : _vazio.value.join(', ')}',
            ),
          ],
        ),
      ),
    ),
    SizedBox(
      width: 384,
      child: ListenableBuilder(
        listenable: _preselecionadas,
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgMultiSelectChips(
              id: 'msc-preselected',
              labelText: 'Empresas (com seleção)',
              placeholder: 'Selecione as empresas',
              options: [
                SgMultiSelectOption(
                  label: 'Empresa 1',
                  value: 'e1',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 2',
                  value: 'e2',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 3',
                  value: 'e3',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 4',
                  value: 'e4',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 5',
                  value: 'e5',
                ),
                SgMultiSelectOption(
                  label: 'Empresa 6',
                  value: 'e6',
                ),
              ],
              value: _preselecionadas.value,
              onChange: (v) => _preselecionadas.value = v,
            ),
            const SizedBox(height: 8),
            Text(
              'Selecionadas: ${_preselecionadas.value.isEmpty ? '(nenhuma)' : _preselecionadas.value.join(', ')}',
            ),
          ],
        ),
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _vazio = ValueNotifier(const []);`
- `final ValueNotifier<List<Object>> _preselecionadas = ValueNotifier(const ['e1', 'e2', 'e4']);`

### Com busca

searchable habilita um campo de busca no topo do dropdown.

Região `sgMultiSelectChipsBusca` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _pesquisavel,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelectChips(
          id: 'msc-searchable',
          labelText: 'Empresas',
          placeholder: 'Selecione as empresas',
          searchable: true,
          options: [
            SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
            SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
            SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
            SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
            SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
            SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
          ],
          value: _pesquisavel.value,
          onChange: (v) => _pesquisavel.value = v,
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_pesquisavel.value.isEmpty ? '(nenhuma)' : _pesquisavel.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _pesquisavel = ValueNotifier(const ['e1']);`

### Limpável e com limite

clearable adiciona o botão de limpar; maxSelected restringe o número de itens.

Região `sgMultiSelectChipsLimite` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _limitadas,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelectChips(
          id: 'msc-capped',
          labelText: 'Empresas (máx. 3)',
          placeholder: 'Selecione até 3 empresas',
          clearable: true,
          maxSelected: 3,
          options: [
            SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
            SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
            SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
            SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
            SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
            SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
          ],
          value: _limitadas.value,
          onChange: (v) => _limitadas.value = v,
        ),
        const SizedBox(height: 8),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Limpar'),
          onClick: () => _limitadas.value = const [],
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_limitadas.value.isEmpty ? '(nenhuma)' : _limitadas.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _limitadas = ValueNotifier(const []);`

## SgOrderList

Página: `apps/seedgrid_showcase/lib/pages/sg_order_list_page.dart` (8 exemplo(s) na página; abaixo 3).

### Seleção múltipla + controles externos

Com selectionMode multiple e showControls false, botões externos movem os itens selecionados e limpam a seleção.

Região `sgOrderListController` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      id: 'order-ref',
      title: 'Etapas do pipeline',
      source: [
        SgOrderListItem(label: 'Prospecção', value: 'lead'),
        SgOrderListItem(label: 'Qualificação', value: 'qualify'),
        SgOrderListItem(label: 'Proposta', value: 'proposal'),
        SgOrderListItem(label: 'Negociação', value: 'negotiation'),
        SgOrderListItem(label: 'Fechamento', value: 'close'),
      ],
      controller: _pipeline,
      selectionMode: SgOrderListSelectionMode.multiple,
      showControls: false,
    ),
    const SizedBox(height: 8),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Mover para o topo'),
          onClick: () => _pipeline.moveTop(),
        ),
        SgButton(
          label: Text('Subir'),
          onClick: () => _pipeline.moveUp(),
        ),
        SgButton(
          label: Text('Descer'),
          onClick: () => _pipeline.moveDown(),
        ),
        SgButton(
          label: Text('Mover para a base'),
          onClick: () => _pipeline.moveBottom(),
        ),
        SgButton(
          label: Text('Limpar seleção'),
          onClick: () => _pipeline.clearSelection(),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgOrderListController _pipeline = SgOrderListController();`

### Item personalizado e item desabilitado

itemTemplate personaliza o conteúdo de cada linha; um item com enabled false aparece desabilitado.

Região `sgOrderListTemplate` em `sg_order_list_page.snippets.g.dart`.

```dart
SgOrderList(
  id: 'order-template',
  title: 'Backlog da sprint',
  source: [
    SgOrderListItem(
      label: 'Implementar filtros',
      value: 'filtros',
      data: {'effort': 'M', 'priority': 'Alta'},
    ),
    SgOrderListItem(
      label: 'Ajustar layout mobile',
      value: 'mobile',
      data: {'effort': 'S', 'priority': 'Média'},
    ),
    SgOrderListItem(
      label: 'Refatorar API de pedidos',
      value: 'api',
      data: {'effort': 'L', 'priority': 'Alta'},
    ),
    SgOrderListItem(
      label: 'Atualizar testes E2E',
      value: 'e2e',
      data: {'effort': 'M', 'priority': 'Baixa'},
      enabled: false,
    ),
  ],
  controlsPosition: SgOrderListControlsPosition.right,
  itemTemplate: (item, state) {
    final meta = item.data as Map<String, String>?;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          item.label,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        Text(
          'Prioridade: ${meta?['priority'] ?? '-'} | Esforço: ${meta?['effort'] ?? '-'}',
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  },
)
```

### Seleção única e controles à direita

selectionMode single permite um item por vez e controlsPosition right move os botões para a direita.

Região `sgOrderListSingle` em `sg_order_list_page.snippets.g.dart`.

```dart
SgOrderList(
  id: 'order-single',
  title: 'Prioridades',
  source: [
    SgOrderListItem(label: 'Escrever o plano', value: 1),
    SgOrderListItem(label: 'Revisar com o time', value: 2),
    SgOrderListItem(label: 'Publicar', value: 3),
    SgOrderListItem(label: 'Arquivado', value: 4, enabled: false),
    SgOrderListItem(label: 'Comemorar', value: 5),
  ],
  selectionMode: SgOrderListSelectionMode.single,
  controlsPosition: SgOrderListControlsPosition.right,
)
```

## SgPickList

Página: `apps/seedgrid_showcase/lib/pages/sg_pick_list_page.dart` (8 exemplo(s) na página; abaixo 3).

### Com Filtros

showSourceFilter e showTargetFilter adicionam busca em cada lista; sourceHeader e targetHeader trocam os cabeçalhos.

Região `sgPickListFiltros` em `sg_pick_list_page.snippets.g.dart`.

```dart
SgPickList(
  id: 'pick-filter',
  title: 'Escolha as frutas',
  source: _frutas,
  target: const [],
  showSourceFilter: true,
  showTargetFilter: true,
  sourceHeader: 'Disponíveis',
  targetHeader: 'Escolhidas',
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `const List<SgPickListItem> _frutas = [SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', enabled: false), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva')];`

### Controles externos por ref

Os botões de mover ficam fora do componente e chamam moveToTarget, moveAllToTarget, moveToSource e moveAllToSource.

Região `sgPickListController` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      id: 'pick-ref',
      title: 'Canais',
      source: [
        SgPickListItem(label: 'E-mail', value: 'email'),
        SgPickListItem(label: 'SMS', value: 'sms'),
        SgPickListItem(label: 'Push', value: 'push'),
      ],
      target: const [],
      controller: _controller,
      showTransferControls: false,
      selectionMode: SgPickListSelectionMode.multiple,
    ),
    const SizedBox(height: 8),
    SgGrid(
      columns: 4,
      gap: 8,
      children: [
        SgButton(
          label: const Text('Mover >'),
          onClick: () => _controller.moveToTarget(),
        ),
        SgButton(
          label: const Text('Mover >>'),
          onClick: () => _controller.moveAllToTarget(),
        ),
        SgButton(
          label: const Text('Mover <'),
          onClick: () => _controller.moveToSource(),
        ),
        SgButton(
          label: const Text('Mover <<'),
          onClick: () => _controller.moveAllToSource(),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgPickListController _controller = SgPickListController();`

### Item template customizado

itemTemplate recebe o item e o estado e desenha cada linha como você quiser.

Região `sgPickListTemplate` em `sg_pick_list_page.snippets.g.dart`.

```dart
SgPickList(
  id: 'pick-template',
  title: 'Capacidade da equipe',
  source: [
    SgPickListItem(
      label: 'Frontend',
      value: 'frontend',
      data: const {'responsavel': 'Ana', 'esforco': 'M'},
    ),
    SgPickListItem(
      label: 'Backend',
      value: 'backend',
      data: const {'responsavel': 'Bruno', 'esforco': 'L'},
    ),
    SgPickListItem(
      label: 'QA',
      value: 'qa',
      data: const {'responsavel': 'Carla', 'esforco': 'S'},
      enabled: false,
    ),
  ],
  target: const [],
  itemTemplate: (item, state) {
    final meta = item.data as Map<String, String>?;
    return SgGrid(
      columns: 2,
      gap: 8,
      children: [
        Text(
          item.label,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        Text(
          'Responsável: ${meta?['responsavel'] ?? '-'} | Esforço: ${meta?['esforco'] ?? '-'}',
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  },
)
```

## SgPeriodSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_period_selector_page.dart` (7 exemplo(s) na página; abaixo 3).

### Básico

Flags padrão: grupos atuais e passados, mais período customizado.

Região `sgPeriodSelectorBasico` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ps-basic',
      label: 'Período',
      onChange: (p) =>
          _basico.value =
              '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} a ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _basico,
      builder: (context, resumo, _) => Text(resumo),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier<String>('Nenhum período escolhido');`

### Todos os grupos

Ligue e desligue permitPast, permitCurrent e permitFuture para ver cada grupo entrar e sair da lista (permitAll fica desligado).

Região `sgPeriodSelectorGrupos` em `sg_period_selector_page.snippets.g.dart`.

```dart
ValueListenableBuilder<List<bool>>(
  valueListenable: _grupos,
  builder: (context, grupos, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Wrap(
        spacing: 16,
        runSpacing: 8,
        children: [
          SgToggleSwitch(
            id: 'ps-flag-past',
            label: 'permitPast',
            checked: grupos[0],
            onChange: (v) =>
                _grupos.value = [v, grupos[1], grupos[2]],
          ),
          SgToggleSwitch(
            id: 'ps-flag-current',
            label: 'permitCurrent',
            checked: grupos[1],
            onChange: (v) =>
                _grupos.value = [grupos[0], v, grupos[2]],
          ),
          SgToggleSwitch(
            id: 'ps-flag-future',
            label: 'permitFuture',
            checked: grupos[2],
            onChange: (v) =>
                _grupos.value = [grupos[0], grupos[1], v],
          ),
        ],
      ),
      const SizedBox(height: 12),
      SgPeriodSelector(
        id: 'ps-flags',
        label: 'Período',
        permitPast: grupos[0],
        permitCurrent: grupos[1],
        permitFuture: grupos[2],
        permitAll: false,
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<bool>> _grupos = ValueNotifier<List<bool>>(const [true, true, false]);`

### Período customizado

Escolha Período para informar um intervalo de data inicial e final.

Região `sgPeriodSelectorPersonalizado` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ps-custom',
      label: 'Período',
      allowCustomPeriod: true,
      permitCurrent: false,
      permitPast: false,
      onChange: (p) =>
          _personalizado.value =
              '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} a ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _personalizado,
      builder: (context, resumo, _) => Text(resumo),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _personalizado = ValueNotifier<String>('Nenhum período escolhido');`

## SgYearPartSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_year_part_selector_page.dart` (6 exemplo(s) na página; abaixo 3).

### Básico

Os três controles: ano, recorte e fatia. Não há onChange na montagem: o intervalo resolvido aparece quando você mexe em algum deles.

Região `sgYearPartSelectorBasico` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'yps-basic',
      label: 'Recorte do ano',
      onChange: (r) => _basico.value = r,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<ResolvedYearPart?>(
      valueListenable: _basico,
      builder: (context, r, _) => Text(
        r == null
            ? 'Nenhum recorte confirmado ainda'
            : '${r.label}: ${r.startDate.toIso8601String().substring(0, 10)} - ${r.endDate.toIso8601String().substring(0, 10)}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final _basico = ValueNotifier<ResolvedYearPart?>(null);`

### Só semestre

Com allowedKinds de um item só, o combo de recorte some: sobram ano e fatia, que é o que um fechamento semestral realmente pergunta.

Região `sgYearPartSelectorSemestre` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'yps-semester',
      label: 'Semestre de apuração',
      allowedKinds: const [YearPartKind.semester],
      onChange: (r) => _semestre.value = r,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<ResolvedYearPart?>(
      valueListenable: _semestre,
      builder: (context, r, _) => Text(
        r == null
            ? 'Nenhum recorte confirmado ainda'
            : r.label,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final _semestre = ValueNotifier<ResolvedYearPart?>(null);`

### Estados

Desabilitado e obrigatório valem para os três controles de uma vez.

Região `sgYearPartSelectorEstados` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'yps-disabled',
      label: 'Recorte do ano',
      enabled: false,
    ),
    const SizedBox(height: 16),
    SgYearPartSelector(
      id: 'yps-required',
      label: 'Recorte do ano',
      required: true,
    ),
  ],
)
```

## SgToggleSwitch

Página: `apps/seedgrid_showcase/lib/pages/sg_toggle_switch_page.dart` (9 exemplo(s) na página; abaixo 3).

### Básico

Exemplo simples controlado por estado; clique no rótulo ou na chave (Tab foca e Espaço alterna).

Região `sgToggleSwitchBasico` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
ValueListenableBuilder<bool>(
  valueListenable: _basico,
  builder: (context, v, _) => SgStack(
    gap: 12,
    align: SgStackAlign.start,
    children: [
      SgToggleSwitch(
        id: 'demo-basic',
        label: 'Ativar notificações',
        checked: v,
        onChange: (next) => _basico.value = next,
      ),
      Text('Valor atual: $v'),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<bool> _basico = ValueNotifier<bool>(false);`

### Desabilitado e somente leitura

Demonstra os estados enabled: false e readOnly.

Região `sgToggleSwitchEstados` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  gap: 24,
  children: [
    SgToggleSwitch(
      id: 'demo-disabled',
      label: 'Desabilitado',
      checked: true,
      enabled: false,
      onIcon: const Icon(Icons.check, size: 12),
      offIcon: const Icon(Icons.close, size: 12),
    ),
    SgToggleSwitch(
      id: 'demo-readonly',
      label: 'Somente leitura',
      checked: false,
      readOnly: true,
      onIcon: const Icon(Icons.check, size: 12),
      offIcon: const Icon(Icons.close, size: 12),
    ),
  ],
)
```

### Validação

required valida ao sair do campo (validateOnBlur) ou a cada mudança (validateOnBlur: false).

Região `sgToggleSwitchValidacao` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgToggleSwitch(
      id: 'termos',
      label: 'Aceito os termos',
      required: true,
      requiredMessage: 'Aceite os termos para continuar',
    ),
    SgToggleSwitch(
      id: 'regra',
      label: 'Não pode ligar',
      validateOnBlur: false,
      validation: (ligado) => ligado
          ? 'Esta chave deve ficar desligada'
          : null,
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
      child: ValueListenableBuilder<num>(
        valueListenable: _basico,
        builder: (context, valor, _) => SgRating(
          value: valor,
          onChange: (v) => _basico.value = v,
        ),
      ),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<num>(
      valueListenable: _basico,
      builder: (context, valor, _) =>
          Text('Valor atual: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _basico = ValueNotifier<num>(0);`

### Meia estrela + tooltip

Permite clicar nas metades e exibir valor no hover.

Região `sgRatingMeia` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _meia,
      builder: (context, valor, _) => SgRating(
        label: 
          'Passe o mouse e clique nas meias estrelas',
        ,
        value: valor,
        allowHalf: true,
        showTooltip: true,
        onChange: (v) => _meia.value = v,
        onHover: (v) => _meiaHover.value = v,
      ),
    ),
    const SizedBox(height: 8),
    ListenableBuilder(
      listenable: Listenable.merge([_meia, _meiaHover]),
      builder: (context, _) => Text(
        'Selecionado: ${_meia.value} | Hover: ${_meiaHover.value ?? 'nenhum'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _meia = ValueNotifier<num>(2.5);`
- `final ValueNotifier<num?> _meiaHover = ValueNotifier<num?>(null);`

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

Página: `apps/seedgrid_showcase/lib/pages/sg_slider_page.dart` (6 exemplo(s) na página; abaixo 3).

### Básico

Define minValue e maxValue com um valor inicial via defaultValue.

Região `sgSliderBasico` em `sg_slider_page.snippets.g.dart`.

```dart
ConstrainedBox(
  constraints: const BoxConstraints(maxWidth: 384),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgSlider(
        id: 'slider-basic',
        minValue: 0,
        maxValue: 100,
        defaultValue: 50,
        onChange: (v) => _basico.value = v,
      ),
      ValueListenableBuilder<num>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor atual: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _basico = ValueNotifier<num>(50);`

### Controle externo

O valor pode ser definido externamente pela prop value.

Região `sgSliderControleExterno` em `sg_slider_page.snippets.g.dart`.

```dart
ConstrainedBox(
  constraints: const BoxConstraints(maxWidth: 384),
  child: ValueListenableBuilder<num>(
    valueListenable: _controlado,
    builder: (context, valor, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgSlider(
          id: 'slider-controlled',
          minValue: 0,
          maxValue: 100,
          value: valor,
          onChange: (v) => _controlado.value = v,
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Mín'),
              onClick: () => _controlado.value = 0,
            ),
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Meio'),
              onClick: () => _controlado.value = 50,
            ),
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Máx'),
              onClick: () => _controlado.value = 100,
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text('Valor controlado: $valor'),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _controlado = ValueNotifier<num>(35);`

### Passo e largura

Mostra step com width numérica e width em string CSS.

Região `sgSliderPassoLargura` em `sg_slider_page.snippets.g.dart`.

```dart
ValueListenableBuilder<num>(
  valueListenable: _passo,
  builder: (context, valor, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgSlider(
        id: 'slider-step-width-number',
        minValue: 0,
        maxValue: 60,
        step: 5,
        width: 320,
        value: valor,
        onChange: (v) => _passo.value = v,
      ),
      const SgSlider(
        id: 'slider-step-width-string',
        minValue: -20,
        maxValue: 20,
        step: 2,
        width: '18rem',
        defaultValue: 4,
      ),
      Text('Valor com step 5: $valor'),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _passo = ValueNotifier<num>(25);`

## SgStepperInput

Página: `apps/seedgrid_showcase/lib/pages/sg_stepper_input_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Ajuste por setas com minValue, maxValue e step.

Região `sgStepperInputBasico` em `sg_stepper_input_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  align: SgStackAlign.start,
  children: [
    SgStepperInput(
      id: 'stepper-basic',
      minValue: 0,
      maxValue: 40,
      step: 2,
      defaultValue: 12,
      width: 210,
      onChange: (v) => _atual.value = v,
    ),
    ValueListenableBuilder<num>(
      valueListenable: _atual,
      builder: (context, v, _) =>
          Text('Valor atual: $v'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _atual = ValueNotifier<num>(12);`

### Controle externo

O valor é controlado pela prop value; os botões alteram o número de fora do campo.

Região `sgStepperInputControleExterno` em `sg_stepper_input_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _controlado,
      builder: (context, v, _) => SgStepperInput(
        id: 'stepper-controlled',
        minValue: 10,
        maxValue: 30,
        step: 1,
        value: v,
        width: 210,
        onChange: (n) => _controlado.value = n,
      ),
    ),
    SgStack(
      direction: SgStackDirection.row,
      wrap: true,
      gap: 8,
      children: [
        for (final n in [10, 20, 30])
          SgButton(
            label: Text('$n'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _controlado.value = n,
          ),
      ],
    ),
    ValueListenableBuilder<num>(
      valueListenable: _controlado,
      builder: (context, v, _) =>
          Text('Valor controlado: $v'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _controlado = ValueNotifier<num>(18);`

### Passo e limites

step define o incremento (aceita decimais); no limite o botão fica desabilitado.

Região `sgStepperInputPasso` em `sg_stepper_input_page.snippets.g.dart`.

```dart
const SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgStepperInput(
      id: 'de-cinco',
      minValue: 0,
      maxValue: 50,
      step: 5,
      width: 160,
    ),
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

