---
description: "Exemplos Dart de Inputs de seleção e valores em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (todos os exemplos de cada componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Inputs de seleção e valores (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-09: cada bloco foi regerado a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 e comparado texto a texto (idêntico). Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, `${context.tx('texto')}` dentro de uma string virou `texto` e `context.txf('texto {k}', {'k': v})` virou a interpolação `'texto $v'`. O showcase não usa `setState` de página: o estado dos exemplos fica em `ValueNotifier`/`SgFormController` (campos com `name` + `control`) lidos por `ValueListenableBuilder`/`ListenableBuilder`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam membros `_x` definidos na página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes. Todos os exemplos de cada componente do showcase estão abaixo, na ordem e com os títulos dele (`apps/seedgrid_showcase`).

## SgAutocomplete

Página: `apps/seedgrid_showcase/lib/pages/sg_autocomplete_page.dart` (11 exemplo(s) na página; abaixo 11).

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

### Conteúdo personalizado

Renderiza o item com o código do país.

Região `sgAutocompletePersonalizado` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<SgAutocompleteItem>(
  id: 'pais-codigo',
  labelText: 'País',
  renderItem: (item, active) => Row(
    children: [
      Text(
        '${item.data}',
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
      const SizedBox(width: 8),
      Text(item.label),
    ],
  ),
  source: (q) =>
      const [
            SgAutocompleteItem(
              id: 1,
              label: 'Argentina',
              data: 'AR',
            ),
            SgAutocompleteItem(id: 2, label: 'Brasil', data: 'BR'),
            SgAutocompleteItem(id: 3, label: 'Chile', data: 'CL'),
            SgAutocompleteItem(
              id: 4,
              label: 'Colômbia',
              data: 'CO',
            ),
          ]
          .where(
            (i) => i.label.toLowerCase().contains(q.toLowerCase()),
          )
          .toList(),
)
```

### Agrupado

Agrupa pela primeira letra.

Região `sgAutocompleteAgrupado` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<SgAutocompleteItem>(
  id: 'pais-agrupado',
  labelText: 'País',
  grouped: true,
  source: (q) =>
      const [
            SgAutocompleteItem(
              id: 1,
              label: 'Argentina',
              group: 'A',
            ),
            SgAutocompleteItem(
              id: 2,
              label: 'Austrália',
              group: 'A',
            ),
            SgAutocompleteItem(id: 3, label: 'Brasil', group: 'B'),
            SgAutocompleteItem(id: 4, label: 'Bolívia', group: 'B'),
            SgAutocompleteItem(id: 5, label: 'Chile', group: 'C'),
          ]
          .where(
            (i) => i.label.toLowerCase().contains(q.toLowerCase()),
          )
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

### Rodapé

Rodapé personalizado com ação.

Região `sgAutocompleteRodape` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'pais-rodape',
  labelText: 'País',
  renderFooter: (q, has) => SgButton(
    label: Text(
      has
          ? 'Adicionar "$q"'
          : 'Adicionar novo',
    ),
    onClick: () {},
  ),
  source: (q) =>
      const ['Argentina', 'Bolívia', 'Brasil', 'Chile', 'Uruguai']
          .where((p) => p.toLowerCase().contains(q.toLowerCase()))
          .toList(),
)
```

### Comprimento mínimo

Só busca a partir de 3 caracteres.

Região `sgAutocompleteMinimo` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'pais-minimo',
  labelText: 'País',
  minLengthForSearch: 3,
  source: (q) =>
      const ['Argentina', 'Bolívia', 'Brasil', 'Chile', 'Uruguai']
          .where((p) => p.toLowerCase().contains(q.toLowerCase()))
          .toList(),
)
```

### Raio da borda

Aplica raio de borda ao campo e à lista de sugestões.

Região `sgAutocompleteRaio` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'pais-raio',
  labelText: 'País',
  minLengthForSearch: 1,
  showDropDownButton: true,
  openOnFocus: true,
  borderRadius: 14,
  source: (q) =>
      const ['Argentina', 'Bolívia', 'Brasil', 'Chile', 'Uruguai']
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

### Valor livre e limpar ao escolher

allowCustomValue guarda o que foi digitado; clearOnSelect esvazia o campo depois de escolher (útil para adicionar itens).

Região `sgAutocompleteLivre` em `sg_autocomplete_page.snippets.g.dart`.

```dart
Column(
  children: [
    SgAutocomplete<String>(
      id: 'livre',
      labelText: 'Aceita texto livre',
      allowCustomValue: true,
      source: (q) => const ['Alpha', 'Beta', 'Gamma']
          .where((c) => c.toLowerCase().contains(q.toLowerCase()))
          .toList(),
    ),
    const SizedBox(height: 12),
    SgAutocomplete<String>(
      id: 'adicionar',
      labelText: 'Limpa ao escolher',
      clearOnSelect: true,
      source: (q) => const ['Item A', 'Item B', 'Item C']
          .where((c) => c.toLowerCase().contains(q.toLowerCase()))
          .toList(),
    ),
  ],
)
```

### Limite de resultados

maxResult limita quantos itens a lista mostra.

Região `sgAutocompleteLimite` em `sg_autocomplete_page.snippets.g.dart`.

```dart
SgAutocomplete<String>(
  id: 'limite',
  labelText: 'Máximo de 2 resultados',
  maxResult: 2,
  source: (q) =>
      const ['Rio Branco', 'Rio Claro', 'Rio Grande', 'Rio Verde']
          .where((p) => p.toLowerCase().contains(q.toLowerCase()))
          .toList(),
)
```

### Dentro de um formulário

name + control + required, como no react-hook-form.

Região `sgAutocompleteFormulario` em `sg_autocomplete_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgAutocomplete<String>(
      id: 'fruta',
      name: 'fruta',
      control: _form,
      labelText: 'Fruta',
      required: true,
      requiredMessage: 'Escolha uma fruta',
      source: (q) => const ['Banana', 'Laranja', 'Uva']
          .where((c) => c.toLowerCase().contains(q.toLowerCase()))
          .toList(),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['fruta']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text(
              'Enviado: $enviado',
            ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

## SgCombobox

Página: `apps/seedgrid_showcase/lib/pages/sg_combobox_page.dart` (6 exemplo(s) na página; abaixo 6).

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

### Controlado por value

Use value/onValueChange para definir programaticamente um valor válido.

Região `sgComboboxControlado` em `sg_combobox_page.snippets.g.dart`.

```dart
Builder(
  builder: (context) {
    const paises = [
      SgAutocompleteItem(id: 1, label: 'Brazil', group: 'Americas'),
      SgAutocompleteItem(
        id: 2,
        label: 'Argentina',
        group: 'Americas',
      ),
      SgAutocompleteItem(id: 5, label: 'Germany', group: 'Europe'),
      SgAutocompleteItem(id: 9, label: 'Japan', group: 'Asia'),
    ];
    return ListenableBuilder(
      listenable: Listenable.merge([
        _valorControlado,
        _ultimoSelect,
      ]),
      builder: (context, _) {
        final valor = _valorControlado.value;
        final resolvido = paises
            .where((p) => p.id == valor)
            .map((p) => p.label)
            .firstOrNull;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SgCombobox<SgAutocompleteItem>(
              id: 'pais-controlado',
              labelText: 'Country (controlled)',
              value: valor,
              openOnFocus: true,
              source: paises,
              onValueChange: (id) => _valorControlado.value = id,
              onSelect: (item) => _ultimoSelect.value = item.label,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SgButton(
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                  label: Text(
                    'Definir Alemanha (id 5)',
                  ),
                  onClick: () => _valorControlado.value = 5,
                ),
                SgButton(
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                  label: Text('Definir Japão (id 9)'),
                  onClick: () => _valorControlado.value = 9,
                ),
                SgButton(
                  size: SgSize.sm,
                  appearance: SgAppearance.outline,
                  label: Text('Limpar valor'),
                  onClick: () => _valorControlado.value = null,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'valor: ${valor ?? '(vazio)'}',
            ),
            Text(
              'resolvido por value: ${resolvido ?? '(nenhum)'}',
            ),
            Text(
              'último onSelect: ${_ultimoSelect.value ?? '(nenhum)'}',
            ),
          ],
        );
      },
    );
  },
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _valorControlado = ValueNotifier(null);`
- `final ValueNotifier<String?> _ultimoSelect = ValueNotifier(null);`

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

### Raio da borda

Aplica o raio no input e no dropdown.

Região `sgComboboxRaio` em `sg_combobox_page.snippets.g.dart`.

```dart
SgCombobox<SgAutocompleteItem>(
  id: 'pais-raio',
  labelText: 'Country with custom radius',
  openOnFocus: true,
  grouped: true,
  borderRadius: 14,
  source: const [
    SgAutocompleteItem(id: 1, label: 'Brazil', group: 'Americas'),
    SgAutocompleteItem(
      id: 2,
      label: 'Argentina',
      group: 'Americas',
    ),
    SgAutocompleteItem(id: 5, label: 'Germany', group: 'Europe'),
    SgAutocompleteItem(id: 9, label: 'Japan', group: 'Asia'),
  ],
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

### Dentro de um formulário

name + control + required: a mensagem aparece no envio e some ao escolher.

Região `sgComboboxFormulario` em `sg_combobox_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCombobox<String>(
      id: 'pagamento',
      name: 'pagamento',
      control: _form,
      labelText: 'Forma de pagamento',
      required: true,
      requiredMessage: 'Escolha uma forma',
      source: const ['Boleto', 'Cartão', 'Pix'],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['pagamento']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

## SgCheckboxGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_checkbox_group_page.dart` (17 exemplo(s) na página; abaixo 16).

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

### Apenas Ícones (Icon Only)

Região `sgCheckboxGroupApenasIcones` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'icon-only',
  title: 'Escolha formas',
  iconOnly: true,
  source: [
    SgCheckboxGroupOption(
      label: 'Círculo',
      value: 'circle',
      icon: Icon(Icons.circle, size: 20),
    ),
    SgCheckboxGroupOption(
      label: 'Quadrado',
      value: 'square',
      icon: Icon(Icons.square, size: 20),
    ),
    SgCheckboxGroupOption(
      label: 'Triângulo',
      value: 'triangle',
      icon: Icon(Icons.change_history, size: 20),
    ),
  ],
)
```

### Seleção Controlada

Região `sgCheckboxGroupSelecaoControlada` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<List<Object>>(
      valueListenable: _controlada,
      builder: (context, valor, _) => SgCheckboxGroup(
        id: 'controlled-selection',
        title: 'Seleção controlada',
        value: valor,
        onChange: (v) => _controlada.value = v,
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
      valueListenable: _controlada,
      builder: (context, valor, _) =>
          Text('Valor: [${valor.join(', ')}]'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _controlada = ValueNotifier<List<Object>>(const ['option2']);`

### Controle Externo (setValue/getValue)

Região `sgCheckboxGroupControleExterno` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<List<Object>>(
      valueListenable: _externo,
      builder: (context, valor, _) => SgCheckboxGroup(
        id: 'external-control',
        title: 'Frutas favoritas',
        value: valor,
        onChange: (v) => _externo.value = v,
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
    const SizedBox(height: 16),
    SgGrid(
      columns: {'base': 2, 'md': 4},
      gap: 8,
      children: [
        SgButton(
          label: Text('Definir Maçã'),
          onClick: () => _externo.value = ['apple'],
        ),
        SgButton(
          label: Text('Banana + Uva'),
          onClick: () => _externo.value = ['banana', 'grape'],
        ),
        SgButton(
          label: Text('Selecionar Todos'),
          onClick: () => _externo.value = [
            'apple',
            'banana',
            'orange',
            'grape',
          ],
        ),
        SgButton(
          label: Text('Limpar'),
          onClick: () => _externo.value = [],
        ),
      ],
    ),
    const SizedBox(height: 16),
    ValueListenableBuilder<List<Object>>(
      valueListenable: _externo,
      builder: (context, valor, _) => Text(
        'Valor atual: [${valor.join(', ')}]',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _externo = ValueNotifier<List<Object>>(const ['banana']);`

### Com Opção Desabilitada

Região `sgCheckboxGroupComOpcaoDesabilitada` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'with-disabled-option',
  title: 'Nível de prioridade',
  source: [
    SgCheckboxGroupOption(label: 'Baixa', value: 'low'),
    SgCheckboxGroupOption(
      label: 'Média',
      value: 'medium',
    ),
    SgCheckboxGroupOption(label: 'Alta', value: 'high'),
    SgCheckboxGroupOption(
      label: 'Urgente',
      value: 'urgent',
      enabled: false,
    ),
  ],
)
```

### Grupo Desabilitado

Região `sgCheckboxGroupGrupoDesabilitado` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'disabled-group',
  title: 'Opções desabilitadas',
  value: const ['option2'],
  enabled: false,
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
)
```

### Somente Leitura

Região `sgCheckboxGroupSomenteLeitura` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'readonly',
  title: 'Configuração atual (somente leitura)',
  value: const ['banana', 'grape'],
  readOnly: true,
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
    SgCheckboxGroupOption(label: 'Uva', value: 'grape'),
  ],
)
```

### Obrigatório com Validação

name + control; required usa a mensagem do i18n e revalida a cada mudança depois do envio.

Região `sgCheckboxGroupObrigatorioComValidacao` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'preference',
      title: 'Preferência de contato *',
      name: 'preference',
      control: _formObrigatorio,
      required: true,
      source: [
        SgCheckboxGroupOption(
          label: 'Email',
          value: 'email',
          icon: Icon(Icons.mail, size: 16),
        ),
        SgCheckboxGroupOption(
          label: 'Telefone',
          value: 'phone',
          icon: Icon(Icons.phone, size: 16),
        ),
        SgCheckboxGroupOption(
          label: 'Presencial',
          value: 'in-person',
          icon: Icon(Icons.home, size: 16),
        ),
      ],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _formObrigatorio.handleSubmit(
        (values) =>
            _enviadoObrigatorio.value = '${values['preference']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviadoObrigatorio,
      builder: (context, valor, _) => valor.isEmpty
          ? const SizedBox.shrink()
          : Text('Dados do formulário: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _formObrigatorio = SgFormController();`
- `final ValueNotifier<String> _enviadoObrigatorio = ValueNotifier<String>('');`

### Estilo de Seleção Highlight (Lista)

Região `sgCheckboxGroupEstiloSelecaoHighlight` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: ValueListenableBuilder<List<Object>>(
        valueListenable: _highlight,
        builder: (context, valor, _) => SgCheckboxGroup(
          id: 'highlight-list',
          title: 'Opções',
          selectionStyle: SgCheckboxGroupSelectionStyle.highlight,
          value: valor,
          onChange: (v) => _highlight.value = v,
          source: [
            SgCheckboxGroupOption(
              label: 'Reserva',
              value: 'reserve',
              icon: Icon(
                Icons.account_balance,
                size: 16,
                color: Colors.indigo,
              ),
            ),
            SgCheckboxGroupOption(
              label: 'Alerta',
              value: 'alert',
              icon: Icon(
                Icons.notifications,
                size: 16,
                color: Colors.pink,
              ),
            ),
            SgCheckboxGroupOption(
              label: 'Atualizar',
              value: 'refresh',
              icon: Icon(
                Icons.refresh,
                size: 16,
                color: Colors.green,
              ),
            ),
          ],
        ),
      ),
    ),

    const SizedBox(height: 8),
    ValueListenableBuilder<List<Object>>(
      valueListenable: _highlight,
      builder: (context, valor, _) =>
          Text('Valor: [${valor.join(', ')}]'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _highlight = ValueNotifier<List<Object>>(const ['reserve']);`

### Com GroupBox Customizado

Região `sgCheckboxGroupComGroupboxCustomizado` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'custom-groupbox',
  title: 'Escolha com estilo customizado',
  groupBoxProps: SgChoiceGroupBoxProps(
    title: 'Preferências',
  ),
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

### Formulário - Register

Região `sgCheckboxGroupFormularioRegister` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'fruits',
      title: 'Escolha suas frutas',
      name: 'fruits',
      control: _formRegister,
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
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _formRegister.handleSubmit(
        (values) => _enviadoRegister.value = '${values['fruits']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviadoRegister,
      builder: (context, valor, _) => valor.isEmpty
          ? const SizedBox.shrink()
          : Text('Dados do formulário: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _formRegister = SgFormController();`
- `final ValueNotifier<String> _enviadoRegister = ValueNotifier<String>('');`

### Marcar todos (showCheckAll)

Checkbox 'Selecionar todos' separado por divisor, com estado indeterminado quando parcialmente selecionado

Região `sgCheckboxGroupMarcarTodos` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Sem label customizado (usa i18n)'),
    const SizedBox(height: 8),
    SgCheckboxGroup(
      id: 'check-all',
      title: 'Exemplo de marcar todos',
      showCheckAll: true,
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
    const SizedBox(height: 24),
    Text('Com checkAllLabel e checkAllIcon'),
    const SizedBox(height: 8),
    SgCheckboxGroup(
      id: 'check-all-custom',
      title: 'Com label + ícone customizados',
      showCheckAll: true,
      checkAllLabel: 'Marcar tudo',
      checkAllIcon: Icon(Icons.star, size: 16, color: Colors.amber),
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
  ],
)
```

### Checked inicial no source

Estado inicial definido diretamente na prop checked de cada opção (modo não controlado)

Região `sgCheckboxGroupCheckedInicial` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
SgCheckboxGroup(
  id: 'source-checked',
  title: 'Frutas favoritas (inicial pelo source)',
  source: [
    SgCheckboxGroupOption(
      label: 'Maçã',
      value: 'apple',
    ),
    SgCheckboxGroupOption(
      label: 'Banana',
      value: 'banana',
      checked: true,
    ),
    SgCheckboxGroupOption(
      label: 'Laranja',
      value: 'orange',
    ),
    SgCheckboxGroupOption(
      label: 'Uva',
      value: 'grape',
      checked: true,
    ),
  ],
)
```

### Controle por código

Acesso imperativo por código: getChecked, checkAll, clearAll, setChecked

Região `sgCheckboxGroupControllerImperativo` em `sg_checkbox_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCheckboxGroup(
      id: 'ref-example',
      title: 'Selecione as opções',
      controller: _controller,
      showCheckAll: true,
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
    SgGrid(
      columns: {'base': 2, 'md': 4},
      gap: 8,
      children: [
        SgButton(
          label: Text('getChecked()'),
          onClick: () {
            _saida.value = _controller.getChecked().toString();
          },
        ),
        SgButton(
          label: Text('checkAll()'),
          onClick: () {
            _controller.checkAll();
            _saida.value = 'checkAll()';
          },
        ),
        SgButton(
          label: Text('clearAll()'),
          onClick: () {
            _controller.clearAll();
            _saida.value = 'clearAll()';
          },
        ),
        SgButton(
          label: Text('setChecked'),
          onClick: () {
            _controller.setChecked(['option2']);
            _saida.value = "setChecked(['option2'])";
          },
        ),
      ],
    ),
    ValueListenableBuilder<String>(
      valueListenable: _saida,
      builder: (context, valor, _) => valor.isEmpty
          ? const SizedBox.shrink()
          : Text('Saída: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgCheckboxGroupController _controller = SgCheckboxGroupController();`
- `final ValueNotifier<String> _saida = ValueNotifier<String>('');`

## SgRadioGroup

Página: `apps/seedgrid_showcase/lib/pages/sg_radio_group_page.dart` (14 exemplo(s) na página; abaixo 14).

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

### Apenas Ícones (Icon Only)

Região `sgRadioGroupApenasIcones` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'icon-only',
  title: 'Escolha uma forma',
  iconOnly: true,
  source: [
    SgRadioGroupOption(
      label: 'Círculo',
      value: 'circle',
      icon: Icon(Icons.circle, size: 20),
    ),
    SgRadioGroupOption(
      label: 'Quadrado',
      value: 'square',
      icon: Icon(Icons.square, size: 20),
    ),
    SgRadioGroupOption(
      label: 'Triângulo',
      value: 'triangle',
      icon: Icon(Icons.change_history, size: 20),
    ),
  ],
)
```

### Seleção Controlada

Região `sgRadioGroupSelecaoControlada` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<Object?>(
      valueListenable: _controlada,
      builder: (context, valor, _) => SgRadioGroup(
        id: 'controlled-selection',
        title: 'Seleção controlada',
        value: valor,
        onChange: (v) => _controlada.value = v,
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
      valueListenable: _controlada,
      builder: (context, valor, _) => Text(
        'Valor: ${valor ?? 'Nenhum'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _controlada = ValueNotifier<Object?>('option2');`

### Controle Externo (setValue/getValue)

Região `sgRadioGroupControleExterno` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<Object?>(
      valueListenable: _externo,
      builder: (context, valor, _) => SgRadioGroup(
        id: 'external-control',
        title: 'Fruta favorita',
        value: valor,
        onChange: (v) => _externo.value = v,
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
    const SizedBox(height: 16),
    SgGrid(
      columns: {'base': 2, 'md': 4},
      gap: 8,
      children: [
        SgButton(
          label: Text('Definir Maçã'),
          onClick: () => _externo.value = 'apple',
        ),
        SgButton(
          label: Text('Definir Banana'),
          onClick: () => _externo.value = 'banana',
        ),
        SgButton(
          label: Text('Definir Laranja'),
          onClick: () => _externo.value = 'orange',
        ),
        SgButton(
          label: Text('Limpar'),
          onClick: () => _externo.value = null,
        ),
      ],
    ),
    const SizedBox(height: 16),
    ValueListenableBuilder<Object?>(
      valueListenable: _externo,
      builder: (context, valor, _) => Text(
        'Valor atual: ${valor ?? 'Nenhum'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _externo = ValueNotifier<Object?>('banana');`

### Com Opção Desabilitada

Região `sgRadioGroupComOpcaoDesabilitada` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'with-disabled-option',
  title: 'Nível de prioridade',
  source: [
    SgRadioGroupOption(label: 'Baixa', value: 'low'),
    SgRadioGroupOption(label: 'Média', value: 'medium'),
    SgRadioGroupOption(label: 'Alta', value: 'high'),
    SgRadioGroupOption(
      label: 'Urgente',
      value: 'urgent',
      enabled: false,
    ),
  ],
)
```

### Grupo Desabilitado

Região `sgRadioGroupGrupoDisabled` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'disabled-group',
  title: 'Opções desabilitadas',
  value: 'option2',
  enabled: false,
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
)
```

### Somente Leitura

Região `sgRadioGroupReadOnly` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'readonly',
  title: 'Configuração atual (somente leitura)',
  value: 'banana',
  readOnly: true,
  source: [
    SgRadioGroupOption(label: 'Maçã', value: 'apple'),
    SgRadioGroupOption(
      label: 'Banana',
      value: 'banana',
    ),
    SgRadioGroupOption(
      label: 'Laranja',
      value: 'orange',
    ),
    SgRadioGroupOption(label: 'Uva', value: 'grape'),
  ],
)
```

### Obrigatório com Validação

Região `sgRadioGroupObrigatorioComValidacao` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      title: 'Preferência de contato *',
      name: 'preference',
      control: _formObrigatorio,
      required: true,
      source: [
        SgRadioGroupOption(
          label: 'Email',
          value: 'email',
          icon: Icon(Icons.mail, size: 16),
        ),
        SgRadioGroupOption(
          label: 'Telefone',
          value: 'phone',
          icon: Icon(Icons.phone, size: 16),
        ),
        SgRadioGroupOption(
          label: 'Presencial',
          value: 'in-person',
          icon: Icon(Icons.home, size: 16),
        ),
      ],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _formObrigatorio.handleSubmit(
        (values) =>
            _enviadoObrigatorio.value = '${values['preference']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviadoObrigatorio,
      builder: (context, valor, _) => valor.isEmpty
          ? const SizedBox.shrink()
          : Text('Dados do formulário: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _formObrigatorio = SgFormController();`
- `final ValueNotifier<String> _enviadoObrigatorio = ValueNotifier<String>('');`

### Horizontal com Ícones Coloridos

Região `sgRadioGroupHorizontalComIconesColoridos` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'horizontal-colored',
  title: 'Condição climática',
  orientation: SgRadioGroupOrientation.horizontal,
  source: [
    SgRadioGroupOption(
      label: 'Sol',
      value: 'sun',
      icon: Icon(Icons.wb_sunny, size: 20, color: Colors.amber),
    ),
    SgRadioGroupOption(
      label: 'Lua',
      value: 'moon',
      icon: Icon(
        Icons.nightlight_round,
        size: 20,
        color: Colors.blue,
      ),
    ),
    SgRadioGroupOption(
      label: 'Nuvem',
      value: 'cloud',
      icon: Icon(Icons.cloud, size: 20, color: Colors.grey),
    ),
  ],
)
```

### Estilo de Seleção Destacado (Lista)

Região `sgRadioGroupSelectionStyleHighlight` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: ValueListenableBuilder<Object?>(
        valueListenable: _highlight,
        builder: (context, valor, _) => SgRadioGroup(
          id: 'highlight-list',
          title: 'Opções',
          selectionStyle: SgRadioGroupSelectionStyle.highlight,
          value: valor,
          onChange: (v) => _highlight.value = v,
          source: [
            SgRadioGroupOption(
              label: 'Reserva',
              value: 'reserve',
              icon: Icon(
                Icons.account_balance,
                size: 16,
                color: Colors.indigo,
              ),
            ),
            SgRadioGroupOption(
              label: 'Alerta',
              value: 'alert',
              icon: Icon(
                Icons.notifications,
                size: 16,
                color: Colors.pink,
              ),
            ),
            SgRadioGroupOption(
              label: 'Atualizar',
              value: 'refresh',
              icon: Icon(
                Icons.refresh,
                size: 16,
                color: Colors.green,
              ),
            ),
          ],
        ),
      ),
    ),

    const SizedBox(height: 8),
    ValueListenableBuilder<Object?>(
      valueListenable: _highlight,
      builder: (context, valor, _) => Text(
        'Valor: ${valor ?? 'Nenhum'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _highlight = ValueNotifier<Object?>('reserve');`

### Com GroupBox Customizado

Região `sgRadioGroupComGroupboxCustomizado` em `sg_radio_group_page.snippets.g.dart`.

```dart
SgRadioGroup(
  id: 'custom-groupbox',
  title: 'Escolha com estilo customizado',
  groupBoxProps: SgChoiceGroupBoxProps(
    title: 'Preferências',
  ),
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

### Formulário - Register

Região `sgRadioGroupFormularioRegister` em `sg_radio_group_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRadioGroup(
      title: 'Escolha sua fruta',
      name: 'fruit',
      control: _formRegister,
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
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _formRegister.handleSubmit(
        (values) => _enviadoRegister.value = '${values['fruit']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviadoRegister,
      builder: (context, valor, _) => valor.isEmpty
          ? const SizedBox.shrink()
          : Text('Dados do formulário: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _formRegister = SgFormController();`
- `final ValueNotifier<String> _enviadoRegister = ValueNotifier<String>('');`

## SgMultiSelect

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_page.dart` (9 exemplo(s) na página; abaixo 9).

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

### Limpável e com limite

clearable adiciona o botão de limpar; maxSelected restringe o número de itens.

Região `sgMultiSelectLimite` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _limitadas,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelect(
          id: 'ms-capped',
          labelText: 'Empresas (máx. 2)',
          placeholder: 'Selecione até 2 empresas',
          clearable: true,
          maxSelected: 2,
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

### Desabilitado

Com enabled=false o campo não abre nem altera a seleção.

Região `sgMultiSelectDesabilitado` em `sg_multi_select_page.snippets.g.dart`.

```dart
SgMultiSelect(
  id: 'ms-disabled',
  labelText: 'Empresas',
  placeholder: 'Selecione as empresas',
  options: [
    SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
    SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
    SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
    SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
    SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
    SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
  ],
  value: const ['e1', 'e3'],
  enabled: false,
)
```

### Rótulo curto (chipLabel)

Cada opção pode ter chipLabel: o campo fechado resume a seleção com o texto curto (ex.: "1, 3") e a lista continua com o label completo.

Região `sgMultiSelectChipLabel` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _filiais,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelect(
          id: 'ms-chip-label',
          labelText: 'Filiais',
          placeholder: 'Selecione as empresas',
          searchable: true,
          options: [
            SgMultiSelectOption(
              label: '1 - Matriz São Paulo',
              value: 1,
              chipLabel: '1',
            ),
            SgMultiSelectOption(
              label: '2 - Filial Campinas',
              value: 2,
              chipLabel: '2',
            ),
            SgMultiSelectOption(
              label: '3 - Filial Centro',
              value: 3,
              chipLabel: '3',
            ),
            SgMultiSelectOption(
              label: '4 - Filial Ribeirão Preto',
              value: 4,
              chipLabel: '4',
            ),
            SgMultiSelectOption(
              label: '5 - Depósito Jundiaí',
              value: 5,
              chipLabel: '5',
            ),
          ],
          value: _filiais.value,
          onChange: (v) => _filiais.value = v,
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_filiais.value.isEmpty ? '(nenhuma)' : _filiais.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _filiais = ValueNotifier(const [1, 3]);`

### Valor controlado

Com value, o pai manda: o campo só muda quando o value muda.

Região `sgMultiSelectControlado` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _controlado,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelect(
          id: 'ms-controlled',
          labelText: 'Cidades',
          options: [
            SgMultiSelectOption(label: 'São Paulo', value: 'sp'),
            SgMultiSelectOption(label: 'Campinas', value: 'cps'),
            SgMultiSelectOption(label: 'Santos', value: 'sts'),
          ],
          value: _controlado.value,
          onChange: (v) => _controlado.value = v,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Selecionar todas'),
              onClick: () =>
                  _controlado.value = ['sp', 'cps', 'sts'],
            ),
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Limpar'),
              onClick: () => _controlado.value = const [],
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_controlado.value.isEmpty ? '(nenhuma)' : _controlado.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _controlado = ValueNotifier(const ['sp']);`

### Dentro de um formulário

name + control: o valor do campo no formulário é a lista de valores marcados.

Região `sgMultiSelectFormulario` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgMultiSelect(
        id: 'ms-form',
        name: 'tags',
        control: _form,
        labelText: 'Tags',
        options: [
          SgMultiSelectOption(label: 'Urgente', value: 'urgente'),
          SgMultiSelectOption(label: 'Financeiro', value: 'fin'),
          SgMultiSelectOption(label: 'Suporte', value: 'sup'),
        ],
      ),
      const SizedBox(height: 12),
      SgButton(
        label: Text('Enviar'),
        onClick: () => _form.handleSubmit(
          (values) => _enviado.value =
              ((values['tags'] as List?) ?? const []).join(', '),
        ),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _enviado,
        builder: (context, enviado, _) => enviado.isEmpty
            ? const SizedBox.shrink()
            : Text('Enviado: $enviado'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

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

### Opção desabilitada e texto da busca

Uma opção com enabled false aparece desabilitada e não pode ser marcada; searchPlaceholder troca o texto do campo de busca.

Região `sgMultiSelectOpcaoDesabilitada` em `sg_multi_select_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgMultiSelect(
    id: 'ms-disabled-option',
    labelText: 'Empresas',
    placeholder: 'Selecione as empresas',
    searchable: true,
    searchPlaceholder: 'Buscar empresa...',
    options: [
      SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
      SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
      SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
      SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
      SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
      SgMultiSelectOption(
        label: 'Empresa 6',
        value: 'e6',
        enabled: false,
      ),
    ],
  ),
)
```

## SgMultiSelectChips

Página: `apps/seedgrid_showcase/lib/pages/sg_multi_select_chips_page.dart` (7 exemplo(s) na página; abaixo 7).

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

### Desabilitado

Com enabled=false o campo não abre, nem remove chips.

Região `sgMultiSelectChipsDesabilitado` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SgMultiSelectChips(
  id: 'msc-disabled',
  labelText: 'Empresas',
  placeholder: 'Selecione as empresas',
  options: [
    SgMultiSelectOption(label: 'Empresa 1', value: 'e1'),
    SgMultiSelectOption(label: 'Empresa 2', value: 'e2'),
    SgMultiSelectOption(label: 'Empresa 3', value: 'e3'),
    SgMultiSelectOption(label: 'Empresa 4', value: 'e4'),
    SgMultiSelectOption(label: 'Empresa 5', value: 'e5'),
    SgMultiSelectOption(label: 'Empresa 6', value: 'e6'),
  ],
  value: const ['e1', 'e3'],
  enabled: false,
)
```

### Rótulo curto (chipLabel)

Cada opção pode ter chipLabel: o chip mostra o texto curto (ex.: só o código) e a lista continua com o label completo. Passe o mouse no chip para ver o nome.

Região `sgMultiSelectChipsChipLabel` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _filiais,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelectChips(
          id: 'msc-chip-label',
          labelText: 'Filiais',
          placeholder: 'Selecione as empresas',
          searchable: true,
          options: [
            SgMultiSelectOption(
              label: '1 - Matriz São Paulo',
              value: 1,
              chipLabel: '1',
            ),
            SgMultiSelectOption(
              label: '2 - Filial Campinas',
              value: 2,
              chipLabel: '2',
            ),
            SgMultiSelectOption(
              label: '3 - Filial Centro',
              value: 3,
              chipLabel: '3',
            ),
            SgMultiSelectOption(
              label: '4 - Filial Ribeirão Preto',
              value: 4,
              chipLabel: '4',
            ),
            SgMultiSelectOption(
              label: '5 - Depósito Jundiaí',
              value: 5,
              chipLabel: '5',
            ),
          ],
          value: _filiais.value,
          onChange: (v) => _filiais.value = v,
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_filiais.value.isEmpty ? '(nenhuma)' : _filiais.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _filiais = ValueNotifier(const [1, 3]);`

### Valor controlado

Com value, o pai manda: o campo só muda quando o value muda.

Região `sgMultiSelectChipsControlado` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: ListenableBuilder(
    listenable: _controlado,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgMultiSelectChips(
          id: 'msc-controlled',
          labelText: 'Frameworks',
          options: [
            SgMultiSelectOption(label: 'Flutter', value: 'flutter'),
            SgMultiSelectOption(label: 'React', value: 'react'),
            SgMultiSelectOption(label: 'Quarkus', value: 'quarkus'),
          ],
          value: _controlado.value,
          onChange: (v) => _controlado.value = v,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Selecionar todas'),
              onClick: () => _controlado.value = [
                'flutter',
                'react',
                'quarkus',
              ],
            ),
            SgButton(
              size: SgSize.sm,
              appearance: SgAppearance.outline,
              label: Text('Limpar'),
              onClick: () => _controlado.value = const [],
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Selecionadas: ${_controlado.value.isEmpty ? '(nenhuma)' : _controlado.value.join(', ')}',
        ),
      ],
    ),
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<Object>> _controlado = ValueNotifier(const ['flutter']);`

### Erro e formulário

required só acrescenta o asterisco ao rótulo; com name + control o campo guarda a lista de valores marcados.

Região `sgMultiSelectChipsFormulario` em `sg_multi_select_chips_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgMultiSelectChips(
        id: 'msc-form',
        name: 'areas',
        control: _form,
        labelText: 'Áreas',
        required: true,
        options: [
          SgMultiSelectOption(label: 'Vendas', value: 'vendas'),
          SgMultiSelectOption(label: 'Compras', value: 'compras'),
          SgMultiSelectOption(label: 'Estoque', value: 'estoque'),
        ],
      ),
      const SizedBox(height: 12),
      SgButton(
        label: Text('Enviar'),
        onClick: () => _form.handleSubmit(
          (values) => _enviado.value =
              ((values['areas'] as List?) ?? const []).join(', '),
        ),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _enviado,
        builder: (context, enviado, _) => enviado.isEmpty
            ? const SizedBox.shrink()
            : Text('Enviado: $enviado'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

## SgOrderList

Página: `apps/seedgrid_showcase/lib/pages/sg_order_list_page.dart` (8 exemplo(s) na página; abaixo 8).

### Básico (controles internos)

Selecione itens e use os botões Topo, Subir, Descer e Base; arrastar também reordena.

Região `sgOrderListBasico` em `sg_order_list_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: _basico,
  builder: (context, _) {
    final produtos = <SgOrderListItem>[
      SgOrderListItem(
        label: 'Notebook',
        value: 'notebook',
        icon: Icon(Icons.account_balance, size: 16),
      ),
      SgOrderListItem(
        label: 'Mouse',
        value: 'mouse',
        icon: Icon(Icons.refresh, size: 16),
      ),
      SgOrderListItem(
        label: 'Teclado',
        value: 'keyboard',
        icon: Icon(Icons.notifications, size: 16),
      ),
      SgOrderListItem(
        label: 'Monitor',
        value: 'monitor',
        icon: Icon(Icons.star, size: 16),
      ),
      SgOrderListItem(
        label: 'Webcam',
        value: 'webcam',
        icon: Icon(Icons.favorite, size: 16),
      ),
    ];
    final atual = _basico.value.isEmpty ? produtos : _basico.value;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SgOrderList(
          id: 'order-basic',
          title: 'Produtos',
          source: produtos,
          value: atual,
          onChange: (itens) => _basico.value = itens,
        ),
        const SizedBox(height: 8),
        Text(
          'Ordem atual: ${atual.map((e) => e.label).join(' > ')}',
        ),
      ],
    );
  },
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<SgOrderListItem>> _basico = ValueNotifier(const []);`

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

### Drag and drop sem botões

Com showControls false e draggable, a ordem muda arrastando os itens, sem botões.

Região `sgOrderListDrag` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      id: 'order-drag',
      title: 'Time de atendimento',
      source: [
        SgOrderListItem(label: 'Ana - Produto', value: 'ana'),
        SgOrderListItem(label: 'Bruno - Design', value: 'bruno'),
        SgOrderListItem(label: 'Carla - Frontend', value: 'carla'),
        SgOrderListItem(label: 'Diego - Backend', value: 'diego'),
        SgOrderListItem(label: 'Elaine - QA', value: 'elaine'),
      ],
      showControls: false,
      draggable: true,
    ),
    const SizedBox(height: 8),
    Text(
      
        'Dica: arraste os itens para reordenar, sem usar os botões.',
      ,
    ),
  ],
)
```

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

### Ordem controlada por estado externo

O pai controla a ordem pelo estado: value e onChange permitem restaurar, inverter e ordenar por fora.

Região `sgOrderListControlada` em `sg_order_list_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: _controlada,
  builder: (context, _) {
    final produtos = <SgOrderListItem>[
      SgOrderListItem(
        label: 'Notebook',
        value: 'notebook',
        icon: Icon(Icons.account_balance, size: 16),
      ),
      SgOrderListItem(
        label: 'Mouse',
        value: 'mouse',
        icon: Icon(Icons.refresh, size: 16),
      ),
      SgOrderListItem(
        label: 'Teclado',
        value: 'keyboard',
        icon: Icon(Icons.notifications, size: 16),
      ),
      SgOrderListItem(
        label: 'Monitor',
        value: 'monitor',
        icon: Icon(Icons.star, size: 16),
      ),
      SgOrderListItem(
        label: 'Webcam',
        value: 'webcam',
        icon: Icon(Icons.favorite, size: 16),
      ),
    ];
    final atual = _controlada.value.isEmpty
        ? produtos
        : _controlada.value;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            SgButton(
              label: Text('Restaurar'),
              onClick: () => _controlada.value = produtos,
            ),
            SgButton(
              label: Text('Inverter'),
              onClick: () =>
                  _controlada.value = atual.reversed.toList(),
            ),
            SgButton(
              label: Text('Ordenar A-Z'),
              onClick: () =>
                  _controlada.value = [...atual]
                    ..sort((a, b) => a.label.compareTo(b.label)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SgOrderList(
          id: 'order-controlled',
          title: 'Produtos (controlado)',
          source: produtos,
          value: atual,
          onChange: (itens) => _controlada.value = itens,
        ),
      ],
    );
  },
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<SgOrderListItem>> _controlada = ValueNotifier(const []);`

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

### Dentro de um formulário

Ao enviar, o formulário recebe a lista na ordem atual.

Região `sgOrderListFormulario` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      id: 'order-form',
      name: 'ranking',
      control: _form,
      title: 'Ranking',
      source: [
        SgOrderListItem(label: 'Ouro', value: 'ouro'),
        SgOrderListItem(label: 'Prata', value: 'prata'),
        SgOrderListItem(label: 'Bronze', value: 'bronze'),
      ],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit((values) {
        final v = values['ranking'] as List<SgOrderListItem>?;
        _enviado.value = v?.map((e) => e.label).join(' > ') ?? '';
      }),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

### Seleção e lista por código

Seleciona a 3ª etapa por valor (setSelection), move a seleção para o topo (moveTop) e inverte a lista (setItems), sem usar os botões do componente.

Região `sgOrderListPorCodigo` em `sg_order_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgOrderList(
      id: 'order-code',
      title: 'Controlada',
      source: [
        SgOrderListItem(label: 'Prospecção', value: 'lead'),
        SgOrderListItem(label: 'Qualificação', value: 'qualify'),
        SgOrderListItem(label: 'Proposta', value: 'proposal'),
        SgOrderListItem(label: 'Negociação', value: 'negotiation'),
        SgOrderListItem(label: 'Fechamento', value: 'close'),
      ],
      controller: _porCodigo,
    ),
    const SizedBox(height: 8),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Selecionar a 3ª'),
          onClick: () => _porCodigo.setSelection(const ['proposal']),
        ),
        SgButton(
          label: Text('Mover para o topo'),
          onClick: () => _porCodigo.moveTop(),
        ),
        SgButton(
          label: Text('Inverter'),
          onClick: () => _porCodigo.setItems(
            _porCodigo.getItems().reversed.toList(),
          ),
        ),
      ],
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgOrderListController _porCodigo = SgOrderListController();`

## SgPickList

Página: `apps/seedgrid_showcase/lib/pages/sg_pick_list_page.dart` (8 exemplo(s) na página; abaixo 8).

### Básico

Mova itens entre origem e destino; onChange entrega as duas listas e o tipo da mudança.

Região `sgPickListBasico` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      id: 'pick-basic',
      title: 'Frutas',
      source: _frutas,
      target: const [],
      onChange: (e) =>
          _ultimo.value =
              '${e.type.value}: origem ${e.source.length}, destino ${e.target.length}',
    ),
    ValueListenableBuilder<String>(
      valueListenable: _ultimo,
      builder: (context, ultimo, _) =>
          Text('Estado atual: $ultimo'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `const List<SgPickListItem> _frutas = [SgPickListItem(label: 'Maçã', value: 'maca'), SgPickListItem(label: 'Banana', value: 'banana'), SgPickListItem(label: 'Cereja', value: 'cereja'), SgPickListItem(label: 'Damasco', value: 'damasco', enabled: false), SgPickListItem(label: 'Figo', value: 'figo'), SgPickListItem(label: 'Uva', value: 'uva')];`
- `final ValueNotifier<String> _ultimo = ValueNotifier<String>('nenhuma mudança ainda');`

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

### Somente transferência (sem ordenação)

Sem os botões de ordenar e sem arrastar: os itens só mudam de lista.

Região `sgPickListTransferencia` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      id: 'pick-transfer-only',
      title: 'Somente transferência',
      source: [
        SgPickListItem(
          label: 'Pendente',
          value: 'backlog',
          icon: Icon(Icons.inbox, size: 16),
        ),
        SgPickListItem(
          label: 'Em andamento',
          value: 'in-progress',
          icon: Icon(Icons.refresh, size: 16),
        ),
        SgPickListItem(
          label: 'Em revisão',
          value: 'review',
          icon: Icon(Icons.notifications_none, size: 16),
        ),
      ],
      target: [
        SgPickListItem(
          label: 'Concluído',
          value: 'done',
          icon: Icon(Icons.star_border, size: 16),
        ),
      ],
      showSourceControls: false,
      showTargetControls: false,
      draggable: false,
    ),
    Text(
      
        'Exemplo para cenários em que você só precisa mover itens entre listas.',
      ,
    ),
  ],
)
```

### Reordenação com controles de lista

Arraste os itens ou use os controles de lista para reordenar dentro de cada lado.

Região `sgPickListReordenacao` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text(
      
        'Dica: arraste itens entre listas ou dentro da mesma lista para reordenar.',
      ,
    ),
    SgPickList(
      id: 'pick-reorder',
      title: 'Quadro da sprint',
      source: [
        SgPickListItem(label: 'Tarefa A', value: 'a'),
        SgPickListItem(label: 'Tarefa B', value: 'b'),
        SgPickListItem(label: 'Tarefa C', value: 'c'),
      ],
      target: [
        SgPickListItem(label: 'Feito X', value: 'x'),
        SgPickListItem(label: 'Feito Y', value: 'y'),
      ],
      showSourceControls: true,
      showTargetControls: true,
      draggable: true,
    ),
  ],
)
```

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

### Dentro de um formulário

name + control: o valor do formulário são as duas listas.

Região `sgPickListFormulario` em `sg_pick_list_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPickList(
      id: 'equipe',
      name: 'equipe',
      control: _form,
      title: 'Equipe',
      source: [
        SgPickListItem(label: 'Ana', value: 'ana'),
        SgPickListItem(label: 'Bruno', value: 'bruno'),
        SgPickListItem(label: 'Carla', value: 'carla'),
      ],
      target: const [],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit((values) {
        final v = values['equipe'] as SgPickListValue?;
        _enviado.value =
            v?.target.map((e) => e.label).join(', ') ?? '';
      }),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

### Filtro por início e seleção única

filterMatchMode startsWith filtra pelo começo do texto e selectionMode single permite marcar um item por vez.

Região `sgPickListInicioUnica` em `sg_pick_list_page.snippets.g.dart`.

```dart
SgPickList(
  id: 'pick-starts-with',
  title: 'Cidades',
  source: const [
    SgPickListItem(label: 'Berlin', value: 'berlin'),
    SgPickListItem(label: 'Boston', value: 'boston'),
    SgPickListItem(label: 'Lisbon', value: 'lisbon'),
    SgPickListItem(label: 'Madrid', value: 'madrid'),
    SgPickListItem(label: 'Sao Paulo', value: 'sao-paulo'),
  ],
  target: const [],
  showSourceFilter: true,
  showTargetFilter: true,
  filterMatchMode: SgPickListFilterMatchMode.startsWith,
  selectionMode: SgPickListSelectionMode.single,
)
```

## SgPeriodSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_period_selector_page.dart` (7 exemplo(s) na página; abaixo 7).

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
              context.txf('{label}: {inicio} a {fim}', {
                'label': p.label,
                'inicio': p.startDate?.toIso8601String().substring(0, 10) ?? '-',
                'fim': p.endDate?.toIso8601String().substring(0, 10) ?? '-',
              }),
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
              context.txf('{label}: {inicio} a {fim}', {
                'label': p.label,
                'inicio': p.startDate?.toIso8601String().substring(0, 10) ?? '-',
                'fim': p.endDate?.toIso8601String().substring(0, 10) ?? '-',
              }),
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

### Estados

Estados desabilitado e obrigatório.

Região `sgPeriodSelectorEstados` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ps-disabled',
      label: 'Período',
      enabled: false,
    ),
    const SizedBox(height: 12),
    SgPeriodSelector(
      id: 'ps-required',
      label: 'Período',
      required: true,
    ),
  ],
)
```

### Clamp com minDate / maxDate

O intervalo resolvido é limitado pelos limites min/max (aqui restrito ao mês atual).

Região `sgPeriodSelectorClamp` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ps-clamped',
      label: 'Período',
      permitPast: true,
      permitCurrent: true,
      permitFuture: true,
      minDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
      maxDate: DateTime(
        DateTime.now().year,
        DateTime.now().month + 1,
        0,
      ),
      onChange: (p) =>
          _limitado.value =
              context.txf('{label}: {inicio} a {fim}', {
                'label': p.label,
                'inicio': p.startDate?.toIso8601String().substring(0, 10) ?? '-',
                'fim': p.endDate?.toIso8601String().substring(0, 10) ?? '-',
              }),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _limitado,
      builder: (context, resumo, _) => Text(resumo),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _limitado = ValueNotifier<String>('Nenhum período escolhido');`

### Idioma e data de referência

locale troca rótulos e grupos (pt-BR, en-US, es, pt-PT, fr). referenceDate fixa o "hoje" usado para resolver os presets.

Região `sgPeriodSelectorIdioma` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'ps-english',
      label: 'Period',
      locale: 'en-US',
      referenceDate: DateTime(2024, 2, 29),
      onChange: (p) =>
          _ingles.value =
              '${p.label}: ${p.startDate?.toIso8601String().substring(0, 10) ?? '-'} to ${p.endDate?.toIso8601String().substring(0, 10) ?? '-'}',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _ingles,
      builder: (context, resumo, _) => Text(resumo),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _ingles = ValueNotifier<String>('No period chosen');`

### Dentro de um formulário

name + control: o formulário guarda o texto do preset (por exemplo THIS_MONTH).

Região `sgPeriodSelectorFormulario` em `sg_period_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgPeriodSelector(
      id: 'periodo-form',
      name: 'periodo',
      control: _form,
      label: 'Período do relatório',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['periodo']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) =>
          enviado.isEmpty ? const SizedBox() : Text('Enviado: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

## SgYearPartSelector

Página: `apps/seedgrid_showcase/lib/pages/sg_year_part_selector_page.dart` (6 exemplo(s) na página; abaixo 6).

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

### Faixa de anos

minYear e maxYear estreitam a lista de anos. O padrão vai do ano corrente - 30 ao ano corrente + 10; ano sem movimento não deveria ser oferecido.

Região `sgYearPartSelectorFaixa` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'yps-range',
      label: 'Exercício',
      minYear: 2020,
      maxYear: 2026,
      onChange: (r) => _faixa.value = r,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<ResolvedYearPart?>(
      valueListenable: _faixa,
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
- `final _faixa = ValueNotifier<ResolvedYearPart?>(null);`

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

### Locale e as siglas

A sigla entre parênteses acompanha o idioma e NÃO é a inicial do nome traduzido: Q1..Q4 em pt-BR e en-US, T1..T4 em es, fr e pt-PT; semestre é S no português e H (Half-year) no inglês; bimestre não tem sigla consagrada e sai sem parênteses.

Região `sgYearPartSelectorLocale` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgYearPartSelector(
      id: 'yps-ptbr',
      label: 'pt-BR',
      locale: 'pt-BR',
      allowedKinds: const [YearPartKind.quarter],
    ),
    const SizedBox(height: 16),
    SgYearPartSelector(
      id: 'yps-enus',
      label: 'en-US',
      locale: 'en-US',
      allowedKinds: const [YearPartKind.semester],
    ),
    const SizedBox(height: 16),
    SgYearPartSelector(
      id: 'yps-es',
      label: 'es',
      locale: 'es',
      allowedKinds: const [YearPartKind.quarter],
    ),
  ],
)
```

### Valor controlado

Com value, o pai manda: escolher emite onChange e o campo só muda quando o value muda. Fatia que não existe no recorte cai na primeira.

Região `sgYearPartSelectorControlado` em `sg_year_part_selector_page.snippets.g.dart`.

```dart
ValueListenableBuilder<YearPartValue>(
  valueListenable: _controlado,
  builder: (context, valor, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgYearPartSelector(
        id: 'yps-controlled',
        label: 'Recorte do ano',
        value: valor,
        onChange: (r) => _controlado.value = r.value,
      ),
      const SizedBox(height: 8),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            label: Text('1º trimestre de 2024'),
            appearance: SgAppearance.outline,
            onClick: () => _controlado.value = const YearPartValue(
              year: 2024,
              kind: YearPartKind.quarter,
              part: 1,
            ),
          ),
          SgButton(
            label: Text('2º bimestre de 2023'),
            appearance: SgAppearance.outline,
            onClick: () => _controlado.value = const YearPartValue(
              year: 2023,
              kind: YearPartKind.bimester,
              part: 2,
            ),
          ),
        ],
      ),
      const SizedBox(height: 8),
      Text(
        'Valor: ${valor.year} - ${valor.kind.name} ${valor.part}',
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final _controlado = ValueNotifier<YearPartValue>(const YearPartValue(year: 2024, kind: YearPartKind.quarter, part: 1));`

## SgToggleSwitch

Página: `apps/seedgrid_showcase/lib/pages/sg_toggle_switch_page.dart` (9 exemplo(s) na página; abaixo 9).

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

### Com ícones (on/off)

Variação visual com ícones dentro do thumb para indicar ligado e desligado.

Região `sgToggleSwitchIcones` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
ValueListenableBuilder<bool>(
  valueListenable: _icone,
  builder: (context, v, _) => SgStack(
    gap: 12,
    align: SgStackAlign.start,
    children: [
      SgToggleSwitch(
        id: 'demo-icons',
        label: 'Status da conta',
        checked: v,
        onChange: (next) => _icone.value = next,
        onIcon: const Icon(Icons.check, size: 12),
        offIcon: const Icon(Icons.close, size: 12),
      ),
      Text('Valor atual: $v'),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<bool> _icone = ValueNotifier<bool>(true);`

### Atualização remota

Ao alterar a chave, simulamos uma atualização remota para representar um fluxo comum de persistência.

Região `sgToggleSwitchRemoto` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_remoto, _carregando, _log]),
  builder: (context, _) => SgStack(
    gap: 12,
    align: SgStackAlign.start,
    children: [
      SgToggleSwitch(
        id: 'demo-remote',
        label: _carregando.value
            ? 'Salvando...'
            : 'Publicar automaticamente',
        checked: _remoto.value,
        enabled: !_carregando.value,
        onIcon: const Icon(Icons.check, size: 12),
        offIcon: const Icon(Icons.close, size: 12),
        onChange: (next) {
          _remoto.value = next;
          _carregando.value = true;
          Future<void>.delayed(
            const Duration(milliseconds: 450),
            () {
              if (!mounted) return;
              _log.value = ['value=$next', ..._log.value]
                  .take(8)
                  .toList();
              _carregando.value = false;
            },
          );
        },
      ),
      if (_log.value.isEmpty)
        Text('Altere a chave para registrar eventos.')
      else
        for (final entrada in _log.value) Text(entrada),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<bool> _remoto = ValueNotifier<bool>(false);`
- `final ValueNotifier<bool> _carregando = ValueNotifier<bool>(false);`
- `final ValueNotifier<List<String>> _log = ValueNotifier<List<String>>([]);`

### Controlado externamente + captura do valor

Valor controlado por estado externo e captura via onChange.

Região `sgToggleSwitchControlado` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
ListenableBuilder(
  listenable: Listenable.merge([_externo, _capturado]),
  builder: (context, _) => SgStack(
    gap: 12,
    align: SgStackAlign.start,
    children: [
      SgToggleSwitch(
        id: 'demo-external',
        label: 'Permitir sincronização',
        checked: _externo.value,
        onChange: (next) {
          _externo.value = next;
          _capturado.value = 'onChange -> $next';
        },
        onIcon: const Icon(Icons.check, size: 12),
        offIcon: const Icon(Icons.close, size: 12),
      ),
      SgStack(
        direction: SgStackDirection.row,
        wrap: true,
        gap: 8,
        children: [
          SgButton(
            label: Text('Setar true'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _externo.value = true,
          ),
          SgButton(
            label: Text('Setar false'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _externo.value = false,
          ),
          SgButton(
            label: Text('Toggle externo'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _externo.value = !_externo.value,
          ),
          SgButton(
            label: Text('Capturar agora'),
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            onClick: () => _capturado.value =
                context.txf('captura manual -> {valor}', {
                  'valor': _externo.value,
                }),
          ),
        ],
      ),
      Text('value externo: ${_externo.value}'),
      Text('capturado: ${_capturado.value}'),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<bool> _externo = ValueNotifier<bool>(false);`
- `final ValueNotifier<String> _capturado = ValueNotifier<String>('(sem evento)');`

### Dentro de um formulário

Ligado ao formulário por name + control; o valor sai no envio.

Região `sgToggleSwitchFormulario` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgToggleSwitch(
      id: 'demo-rhf-notifications',
      name: 'notifications',
      control: _form,
      label: 'Receber notificações por e-mail',
    ),
    SgToggleSwitch(
      id: 'demo-rhf-control',
      name: 'active',
      control: _form,
      label: 'Conta ativa',
      onIcon: const Icon(Icons.check, size: 12),
      offIcon: const Icon(Icons.close, size: 12),
    ),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = jsonEncode(values),
      ),
    ),
    ListenableBuilder(
      listenable: Listenable.merge([_form, _enviado]),
      builder: (context, _) => SgStack(
        gap: 4,
        align: SgStackAlign.start,
        children: [
          Text(
            'watch.notifications: ${_form.getValue('notifications')}',
          ),
          Text('watch.active: ${_form.getValue('active')}'),
          Text(
            'Último envio: ${_enviado.value}',
          ),
        ],
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'notifications': false, 'active': true});`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('-');`

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

### Estado inicial (defaultChecked)

defaultChecked define o estado inicial; depois disso a chave controla a si mesma (modo não controlado).

Região `sgToggleSwitchEstadoInicial` em `sg_toggle_switch_page.snippets.g.dart`.

```dart
SgToggleSwitch(
  id: 'demo-default',
  label: 'Receber novidades',
  defaultChecked: true,
)
```

## SgRating

Página: `apps/seedgrid_showcase/lib/pages/sg_rating_page.dart` (8 exemplo(s) na página; abaixo 8).

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

### Tamanhos e quantidade de estrelas

Controle de size e stars.

Região `sgRatingTamanhos` em `sg_rating_page.snippets.g.dart`.

```dart
SgGrid(
  columns: const {'base': 1, 'md': 2},
  gap: 16,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _sm,
      builder: (context, valor, _) => SgRating(
        label: 'sm / 5 estrelas',
        size: SgRatingSize.sm,
        value: valor,

        onChange: (v) => _sm.value = v,
      ),
    ),
    ValueListenableBuilder<num>(
      valueListenable: _lg,
      builder: (context, valor, _) => SgRating(
        label: 'lg / 5 estrelas',
        size: SgRatingSize.lg,
        value: valor,

        onChange: (v) => _lg.value = v,
      ),
    ),
    ValueListenableBuilder<num>(
      valueListenable: _many,
      builder: (context, valor, _) => SgRating(
        label: '10 estrelas',
        stars: 10,
        size: SgRatingSize.sm,
        value: valor,

        onChange: (v) => _many.value = v,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _sm = ValueNotifier<num>(3);`
- `final ValueNotifier<num> _lg = ValueNotifier<num>(4);`
- `final ValueNotifier<num> _many = ValueNotifier<num>(7);`

### Cores e ícones customizados

Troca de cores e ícones de preenchido/vazio.

Região `sgRatingCores` em `sg_rating_page.snippets.g.dart`.

```dart
SgGrid(
  columns: const {'base': 1, 'md': 2},
  gap: 16,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _heart,
      builder: (context, valor, _) => SgRating(
        label: 'Coração',
        value: valor,
        color: '#ec4899',
        emptyColor: '#f9a8d4',
        onIcon: const Icon(Icons.favorite, size: 24),
        offIcon: const Icon(Icons.favorite_border, size: 24),

        onChange: (v) => _heart.value = v,
      ),
    ),
    ValueListenableBuilder<num>(
      valueListenable: _like,
      builder: (context, valor, _) => SgRating(
        label: 'Curtidas',
        value: valor,
        color: '#2563eb',
        emptyColor: '#93c5fd',
        onIcon: const Icon(Icons.thumb_up, size: 24),
        offIcon: const Icon(Icons.thumb_up_outlined, size: 24),

        onChange: (v) => _like.value = v,
      ),
    ),
    ValueListenableBuilder<num>(
      valueListenable: _fire,
      builder: (context, valor, _) => SgRating(
        label: 'Fogo',
        value: valor,
        color: '#f97316',
        emptyColor: '#fdba74',
        onIcon: const Icon(Icons.local_fire_department, size: 24),
        offIcon: const Icon(
          Icons.local_fire_department_outlined,
          size: 24,
        ),

        onChange: (v) => _fire.value = v,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _heart = ValueNotifier<num>(4);`
- `final ValueNotifier<num> _like = ValueNotifier<num>(3);`
- `final ValueNotifier<num> _fire = ValueNotifier<num>(5);`

### Callbacks

Exemplo com onChange e onHover + log de eventos.

Região `sgRatingCallbacks` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _cb,
      builder: (context, valor, _) => SgRating(
        label: 'Callbacks',
        value: valor,
        allowHalf: true,
        onChange: (v) {
          _cb.value = v;
          _pushLog('onChange -> $v');
        },
        onHover: (v) => _cbHover.value = v,
      ),
    ),
    const SizedBox(height: 12),
    SgGrid(
      columns: const {'base': 2, 'md': 4},
      gap: 8,
      children: [
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Zerar'),
          onClick: () => _cb.value = 0,
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Máximo'),
          onClick: () => _cb.value = 5,
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Limpar log'),
          onClick: () => _cbLog.value = [],
        ),
      ],
    ),
    const SizedBox(height: 12),
    ListenableBuilder(
      listenable: Listenable.merge([_cb, _cbHover]),
      builder: (context, _) => Text(
        'Selecionado: ${_cb.value} | Hover: ${_cbHover.value ?? 'nenhum'}',
      ),
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<List<String>>(
      valueListenable: _cbLog,
      builder: (context, log, _) => ShowcaseLogBox(
        entries: log,
        hint: 'Sem eventos',
        height: 112,
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _cb = ValueNotifier<num>(3);`
- `void _pushLog(String msg) {_cbLog.value = [msg, ..._cbLog.value].take(8).toList();}`
- `final ValueNotifier<num?> _cbHover = ValueNotifier<num?>(null);`
- `final ValueNotifier<List<String>> _cbLog = ValueNotifier<List<String>>([]);`

### Dentro de um formulário

Uso com control/name e envio.

Região `sgRatingFormulario` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgRating(
      label: 'Avalie o produto',
      name: 'productRating',
      control: _form,
    ),
    const SizedBox(height: 16),
    SgRating(
      label: 'Avalie o filme',
      name: 'movieRating',
      control: _form,
      allowHalf: true,
    ),
    const SizedBox(height: 16),
    SgButton(
      size: SgSize.sm,
      label: Text('Enviar avaliação'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '$values',
      ),
    ),
    const SizedBox(height: 16),
    ListenableBuilder(
      listenable: _form,
      builder: (context, _) => Text(
        'watch.productRating: ${_form.watch('productRating')} | watch.movieRating: ${_form.watch('movieRating')}',
      ),
    ),
    const SizedBox(height: 4),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) =>
          Text('Último envio: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'productRating': 4, 'movieRating': 2.5});`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('-');`

### Campo obrigatório

Exemplo com required e requiredMessage.

Região `sgRatingObrigatorio` em `sg_rating_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<num>(
      valueListenable: _req,
      builder: (context, valor, _) => SgRating(
        label: 'Avaliação obrigatória',
        value: valor,
        required: true,
        requiredMessage: 
          'Informe uma avaliação antes de continuar',
        ,
        onChange: (v) => _req.value = v,
      ),
    ),
    const SizedBox(height: 12),
    SgGrid(
      columns: const {'base': 2, 'md': 4},
      gap: 8,
      children: [
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Limpar'),
          onClick: () => _req.value = 0,
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Nota 1'),
          onClick: () => _req.value = 1,
        ),
        SgButton(
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          label: Text('Nota 5'),
          onClick: () => _req.value = 5,
        ),
      ],
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<num>(
      valueListenable: _req,
      builder: (context, valor, _) =>
          Text('Valor atual: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<num> _req = ValueNotifier<num>(0);`

## SgSlider

Página: `apps/seedgrid_showcase/lib/pages/sg_slider_page.dart` (6 exemplo(s) na página; abaixo 6).

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

### ariaLabel e desabilitado

Mostra acessibilidade (ariaLabel) e estado desabilitado.

Região `sgSliderAriaDesabilitado` em `sg_slider_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSlider(
      id: 'slider-aria',
      minValue: 0,
      maxValue: 100,
      defaultValue: 40,
      width: '20rem',
      ariaLabel: 'Nível de prioridade',
    ),
    SgSlider(
      id: 'slider-disabled',
      minValue: 0,
      maxValue: 100,
      defaultValue: 65,
      enabled: false,
      width: '20rem',
      ariaLabel: 'Slider desabilitado',
    ),
  ],
)
```

### Mensagem de erro

O texto de error aparece abaixo do slider e marca o campo como inválido.

Região `sgSliderErro` em `sg_slider_page.snippets.g.dart`.

```dart
ConstrainedBox(
  constraints: const BoxConstraints(maxWidth: 384),
  child: SgSlider(
    id: 'slider-error',
    minValue: 0,
    maxValue: 10,
    defaultValue: 9,
    error: 'Valor alto demais',
  ),
)
```

### Dentro de um formulário

name + control: o formulário guarda o valor escolhido.

Região `sgSliderFormulario` em `sg_slider_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgSlider(
      id: 'brilho',
      name: 'brilho',
      control: _form,
      minValue: 0,
      maxValue: 100,
      step: 10,
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['brilho']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'brilho': 40});`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

## SgStepperInput

Página: `apps/seedgrid_showcase/lib/pages/sg_stepper_input_page.dart` (6 exemplo(s) na página; abaixo 6).

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

### Somente leitura e desabilitado

readOnly bloqueia a edição, enabled: false desabilita o campo e error mostra a mensagem de erro.

Região `sgStepperInputSomenteLeitura` em `sg_stepper_input_page.snippets.g.dart`.

```dart
SgStack(
  direction: SgStackDirection.row,
  wrap: true,
  align: SgStackAlign.center,
  gap: 16,
  children: [
    const SgStepperInput(
      id: 'stepper-readonly',
      minValue: 0,
      maxValue: 10,
      value: 7,
      readOnly: true,
    ),
    const SgStepperInput(
      id: 'stepper-disabled',
      minValue: 0,
      maxValue: 10,
      value: 4,
      enabled: false,
    ),
    SgStepperInput(
      id: 'stepper-error',
      minValue: 0,
      maxValue: 10,
      error: 'Escolha ao menos 1',
    ),
  ],
)
```

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

### Dentro de um formulário

name + control: o formulário guarda um número.

Região `sgStepperInputFormulario` em `sg_stepper_input_page.snippets.g.dart`.

```dart
SgStack(
  gap: 12,
  align: SgStackAlign.start,
  children: [
    SgStepperInput(
      id: 'qtd',
      name: 'qtd',
      control: _form,
      minValue: 0,
      maxValue: 9,
      width: 160,
    ),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['qtd']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, v, _) => v.isEmpty
          ? const SizedBox.shrink()
          : Text('Enviado: $v'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

### Rótulo de acessibilidade (ariaLabel)

ariaLabel dá um nome acessível ao campo quando não há rótulo visível; leitores de tela anunciam esse texto.

Região `sgStepperInputAriaLabel` em `sg_stepper_input_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  align: SgStackAlign.start,
  children: [
    SgStepperInput(
      id: 'ingressos',
      ariaLabel: 'Quantidade de ingressos',
      minValue: 1,
      maxValue: 10,
      defaultValue: 2,
      width: 160,
    ),
    Text('ariaLabel: Quantidade de ingressos'),
  ],
)
```

