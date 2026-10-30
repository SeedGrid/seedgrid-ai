---
description: "API Flutter de Inputs de seleção e valores: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Inputs de seleção e valores (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/inputs-selecao/API|API — Inputs de seleção e valores (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## Comportamento comum do grupo

Confirmado em `inputs/choice/choice_shared.dart` (`ChoiceFieldBinding`), `inputs/lists/lists_shared.dart` (`ListFieldBinding`), `inputs/multi/multi_form_binding.dart` (`SgMultiFormBinding`) e nos estados de `SgCombobox`, `SgAutocomplete`, `SgPeriodSelector` e `SgStepperInput`.

- **Ligação a formulário:** com `name` (e `control`, ou o `SgForm` mais próximo via `SgForm.maybeOf`), o valor e o erro vêm do `SgFormController`; sem `name` ou sem controlador o campo funciona isolado. A gravação usa `setValue` e revalida quando o campo já tinha erro ou o formulário já foi enviado (`submitCount > 0`), como o react-hook-form. `YearPartSelector` é o único widget do grupo sem `name`/`control`.
- **`onChange` do usuário sempre roda**, também dentro de formulário (decisão do dono, 2026-10-25; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]); mudar o valor por fora (`setValue`, `reset`, prop `value`) não o chama.
- **`required` e validadores:** `SgCheckboxGroup`, `SgRadioGroup`, `SgToggleSwitch`, `SgRating` e `SgAutocomplete` mesclam `required` nas `rules` (`mergeRequiredRule`); `SgCombobox`, `SgMultiSelect`, `SgMultiSelectChips`, `SgOrderList`, `SgPickList`, `SgPeriodSelector`, `SgSlider` e `SgStepperInput` registram só `rules`. Somente `SgToggleSwitch` registra `validator` próprio (`registerField(validator:)`).
- **Textos padrão** (rótulos de botões, "sem resultados", "carregando") vêm do i18n do pacote (`useComponentsI18n`), em cinco idiomas.
- **Lista em tela estreita:** abaixo de 600 px a lista de opções (combobox, autocomplete, multisseleção) vira painel de baixo (`inputs/dropdown/sg_dropdown_host.dart`; ADR 51).
- **Nulo = não controlado:** o Dart não distingue `null` de indefinido; passar uma prop de valor de não nulo para nulo limpa o campo (`SgCombobox`, `SgAutocomplete`, `SgPeriodSelector`; no `SgToggleSwitch`, volta ao `defaultChecked`).

## SgAutocomplete

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgAutocomplete` (mesmo nome).

Campo de busca assistida com sugestoes, fonte assincrona, cache e selecao de item a partir de texto digitado.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/select/sg_autocomplete.dart` (linha 20) · classe `class SgAutocomplete<T> extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_autocomplete.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgAutocomplete({...})` com 69 parâmetro(s) nomeado(s), 69 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgAutocomplete

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `source` | `SgAutocompleteSource<T>` | — | sim | React | Fonte de resultados para busca. Tipo no React: `SgAutocompleteSource<T>`. |
| `value` | `String?` | — | não | React | Valor (o texto exibido/selecionado). Sem `control`, nulo = nao controlado. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `mapItem` | `SgAutocompleteItem Function(T raw)?` | — | não | React | Tipo no React: `((raw: T) => SgAutocompleteItem)`. |
| `minLengthForSearch` | `num` | `2` | não | React | Quantidade minima de caracteres para buscar. |
| `delay` | `num` | `300` | não | React | Debounce da pesquisa em milissegundos. |
| `maxResult` | `num` | `50` | não | React | Limite de resultados exibidos. |
| `cacheEnabled` | `bool` | `true` | não | React | — |
| `cacheTTL` | `num` | `5 * 60 * 1000` | não | React | Milissegundos. |
| `showDropDownButton` | `bool` | `false` | não | React | Exibe o botao que abre/fecha a lista. Abre a lista completa quando o texto e uma selecao; preserva o filtro quando o usuario digitou. |
| `openOnFocus` | `bool` | `false` | não | React | Abre a lista ao focar; com um item ja selecionado abre a lista completa. |
| `clearOnSelect` | `bool` | `false` | não | React | — |
| `allowCustomValue` | `bool` | `false` | não | React | Permite valor fora da lista. |
| `grouped` | `bool?` | — | não | React | — |
| `groupped` | `bool?` | — | não | React | — |
| `placeholderEmpty` | `String?` | — | não | React | — |
| `loadingText` | `String?` | — | não | React | — |
| `onSelect` | `ValueChanged<SgAutocompleteItem>?` | — | não | React | Callback disparado ao selecionar item. Tipo no React: `((item: SgAutocompleteItem) => void)`. |
| `onSearch` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((query: string) => void)`. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((open: boolean) => void)`. |
| `renderItem` | `SgSelectItemBuilder?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem, isActive: boolean) => React.ReactNode)`. |
| `renderGroupHeader` | `Widget Function(String group)?` | — | não | React | Tipo no React: `((group: string) => React.ReactNode)`. |
| `renderFooter` | `Widget Function(String query, bool hasResults)?` | — | não | React | Tipo no React: `((query: string, hasResults: boolean) => React.ReactNode)`. |
| `renderEmpty` | `Widget Function(String query)?` | — | não | React | Tipo no React: `((query: string) => React.ReactNode)`. |
| `formatSelection` | `String Function(SgAutocompleteItem item)?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem) => string)`. |
| `renderValue` | `Widget Function(SgAutocompleteItem? item)?` | — | não | React | Desenha o item selecionado por cima do campo (fora do foco). Tipo no React: `((item: SgAutocompleteItem) => React.ReactNode)`. |
| `itemTooltip` | `Widget Function(SgAutocompleteItem item)?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem) => React.ReactNode)`. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgAutocompleteElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente em Flutter (ADR 50). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgAutocompleteLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgAutocompleteLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgAutocompleteTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `renderValue` cobre o texto digitado com um contêiner opaco (o React deixa o texto transparente).
- `itemTooltip` vira `Tooltip` por toque longo, não por passar o mouse.
- `inputProps` é aceito e ignorado (ADR 50); sem `autocorrect` nem `spellCheck`.
- **Não portado:** `className`/`style` e os atributos HTML do `<input>` (3 props omitidas de propósito).
- Limitações registradas: não testado em IME nem em dispositivo; golden com a fonte de teste do Flutter.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_autocomplete.dart`)
- `onChange(String)`: a cada edição do usuário e a cada escolha. Com `allowCustomValue: true` emite o texto digitado; sem ele, enquanto digita emite `''` e o valor só passa a existir ao escolher (o texto emitido é `formatSelection(item)` ou `item.label`). Ao perder o foco sem `allowCustomValue`, o texto volta à última seleção (ou fica vazio) e `onChange` é chamado com esse valor (`_restoreIfNeeded`).
- `onSelect(SgAutocompleteItem)`: ao escolher um item, depois do `onChange`. Com `clearOnSelect`, o campo é esvaziado em seguida e `onChange('')` é chamado.
- `onSearch(String)`: antes de cada busca (inclusive quando a resposta vem do cache). `onOpenChange(bool)`: ao abrir e fechar a lista.
- `onClear`, `onEnter`, `onExit` e `onValidation(String?)` são repassados ao `SgInputText` interno.

**Fonte, cache e estado**
- `source` é `SgAutocompleteSource<T>` = `FutureOr<List<T>> Function(String query)` (`select_support.dart`): pode devolver a lista direto ou um `Future`. A busca usa debounce de `delay` ms (padrão 300), exige `minLengthForSearch` caracteres (padrão 2), corta em `maxResult` (50) e guarda o resultado por consulta por `cacheTTL` ms (5 min) quando `cacheEnabled`. Respostas antigas são descartadas (`_requestId`); se a fonte lançar erro, a lista abre vazia.
- `mapItem` converte o item bruto em `SgAutocompleteItem` (padrão `sgDefaultMapItem`). `value` é o **texto**, não o id; sem formulário, `value` nulo = não controlado, e passar de não nulo para nulo limpa o campo.

**Formulário:** com `name` (+ `control`, ou o `SgForm` mais próximo) o valor do formulário é o texto e o campo registra `rules` com o `required` mesclado (`mergeRequiredRule`) e `initialValue: value`. Não registra `validator` próprio; `validation`/`validateOnBlur` são tratados pelo `SgInputText` interno, que não tem `name`.

**Acessibilidade e teclado:** com a lista aberta, ↓/↑ movem o item ativo, Enter (ou Enter do teclado numérico) escolhe e Esc fecha (`_onKey`). O botão de lista (`showDropDownButton`) tem `tooltip` i18n (`components.actions.openList`) e não entra na ordem de foco. O item da lista expõe `Semantics(selected:)` (`select_support.dart`). Nenhum `Semantics` com rótulo no próprio widget; não confirmado se o `SgInputText` interno expõe o rótulo ao leitor de tela.

## SgCombobox

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCombobox` (mesmo nome).

Campo de escolha assistida que combina digitacao e selecao de item com suporte a fonte local ou remota.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/select/sg_combobox.dart` (linha 24) · classe `class SgCombobox<T> extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_combobox.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgCombobox({...})` com 53 parâmetro(s) nomeado(s), 53 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgCombobox

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `source` | `Object` | — | sim | React | Fonte de itens. Tipo no React: `SgComboboxSource<T>`. |
| `value` | `Object?` | — | não | React | Valor selecionado. Tipo no React: `ComboboxValue`. |
| `onValueChange` | `ValueChanged<Object?>?` | — | não | React | Callback de mudanca de valor. Tipo no React: `((value: ComboboxValue) => void)`. |
| `mapItem` | `SgAutocompleteItem Function(T raw)?` | — | não | React | Tipo no React: `((raw: T) => SgAutocompleteItem)`. |
| `grouped` | `bool?` | `false` † | não | React | Agrupa resultados por categoria. |
| `groupped` | `bool?` | — | não | React | — |
| `loadingText` | `String?` | — | não | React | Texto exibido durante carregamento. |
| `emptyText` | `String?` | — | não | React | — |
| `openOnFocus` | `bool` | `false` | não | React | Abre lista ao focar. |
| `onSelect` | `ValueChanged<T>?` | — | não | React | Callback ao selecionar item. Tipo no React: `((value: T) => void)`. |
| `renderItem` | `SgSelectItemBuilder?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem, isActive: boolean) => React.ReactNode)`. |
| `renderValue` | `Widget Function(SgAutocompleteItem? item)?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem) => React.ReactNode)`. |
| `renderGroupHeader` | `Widget Function(String group)?` | — | não | React | Tipo no React: `((group: string) => React.ReactNode)`. |
| `renderFooter` | `Widget Function(String query, bool hasResults)?` | — | não | React | Tipo no React: `((query: string, hasResults: boolean) => React.ReactNode)`. |
| `itemTooltip` | `Widget Function(SgAutocompleteItem item)?` | — | não | React | Tipo no React: `((item: SgAutocompleteItem) => React.ReactNode)`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente em Flutter (ADR 50). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgComboboxElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgComboboxLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgComboboxLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgComboboxTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `value` nulo significa "não controlado" (o Dart não distingue `null` de indefinido).
- Em tela estreita a lista vira um painel de baixo, e não um `showModalBottomSheet` (que tiraria o foco do campo).
- `inputProps` é aceito e ignorado (ADR 50); sem `autocorrect` nem `spellCheck`.
- Limitações registradas: não testado em IME nem em dispositivo; golden com a fonte de teste do Flutter.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_combobox.dart`)
- `onValueChange(Object?)`: com o **id** do item escolhido (clique, Enter/Espaço ou type-ahead). Não existe `onChange` neste widget.
- `onSelect(T)`: com o item **original** (`raw`), não o `SgAutocompleteItem`, ao escolher ou ao casar o type-ahead.
- `onClear`, `onEnter`, `onExit` e `onValidation(String?)` são repassados ao `SgInputText` interno (somente leitura, mostra o rótulo do item).

**Fonte e estado**
- `source` é `List<T>` ou `SgAutocompleteSource<T>`; a função é chamada **sempre com texto vazio** ao abrir (o Combobox não filtra por digitação: digitar faz type-ahead, com buffer que zera 700 ms após a última tecla). `mapItem` (padrão `sgDefaultMapItem`), `grouped`/`groupped`, `renderItem`, `renderValue`, `renderGroupHeader`, `renderFooter` e `itemTooltip` personalizam a lista.
- O valor é o id (texto ou número). Se o id não está nas entradas carregadas, o widget chama a fonte para achar o rótulo (`_reconcileSelection`). Sem formulário, `value` nulo = não controlado; passar de não nulo para nulo limpa a seleção.

**Formulário:** com `name`, grava o id no formulário (`setValue`, revalidando se já havia erro ou envio) e registra apenas `rules` e `initialValue: value`. Inferência: como `required` vai só ao `SgInputText` interno (que não tem `name`), ele não é regra do envio; para exigir o campo no `handleSubmit`, use `rules`.

**Acessibilidade e teclado:** letras fazem type-ahead; ↓/↑ abrem a lista ou movem o item ativo; Enter, Enter numérico e Espaço abrem ou escolhem; Esc e Tab fecham (`_onKey`). `openOnFocus` abre ao focar. O botão de seta tem `tooltip` i18n (`components.actions.openList`) e não recebe foco; o item da lista tem `Semantics(selected:)`.

## SgCheckboxGroup

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCheckboxGroup` (mesmo nome).

Grupo de checkboxes para multisselecao com orientacao, estilo de selecao e suporte opcional a marcar todos.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/choice/sg_checkbox_group.dart` (linha 42) · classe `class SgCheckboxGroup extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_checkbox_group.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgCheckboxGroup({...})` com 21 parâmetro(s) nomeado(s), 20 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgCheckboxGroup

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String?` | — | não | React | — |
| `title` | `String?` | — | não | React | Titulo do grupo. |
| `source` | `List<SgCheckboxGroupOption>` | — | sim | React | Opcoes disponiveis. Tipo no React: `SgCheckboxGroupOption[]`. |
| `value` | `List<Object>?` | — | não | React | Valores selecionados. Tipo no React: `(string \| number)[]`. |
| `orientation` | `SgCheckboxGroupOrientation` | `SgCheckboxGroupOrientation.vertical` | não | React | Orientacao visual do grupo. Valores: `vertical`, `horizontal`. |
| `selectionStyle` | `SgCheckboxGroupSelectionStyle` | `SgCheckboxGroupSelectionStyle.checkbox` | não | React | Estilo visual de selecao. Valores: `checkbox`, `highlight`. |
| `iconOnly` | `bool` | `false` | não | React | — |
| `disabled` | `bool` | `false` | não | React | — |
| `readOnly` | `bool` | `false` | não | React | — |
| `required` | `bool` | `false` | não | React | Marca o grupo como obrigatorio. |
| `onChange` | `ValueChanged<List<Object>>?` | — | não | React | Callback de mudanca. Tipo no React: `((value: (string \| number)[]) => void)`. |
| `showCheckAll` | `bool` | `false` | não | React | Exibe acao de marcar todos. |
| `checkAllLabel` | `String?` | — | não | React | — |
| `checkAllIcon` | `Widget?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `error` | `String?` | — | não | React | — |
| `optionClassName` | `String?` | — | não | React | React-only (classe CSS por opcao); sem efeito no Flutter. |
| `groupBoxProps` | `SgChoiceGroupBoxProps?` | `{}` † | não | React | Tipo no React: `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })`. |
| `controller` | `SgCheckboxGroupController?` | — | não | Flutter | Substitui o `ref` imperativo do React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Destaque (`selectionStyle: highlight`) e relevo são aproximados (bordas desenhadas por `Transform`).
- `groupBoxProps` vira `SgChoiceGroupBoxProps` (título, largura e altura); a caixa é o `SgGroupBox` real.
- **Não portado:** `className`/`style`, `inputProps` e `optionClassName` (aceito e sem efeito); 3 props omitidas de propósito (ADR 50).
- Limitações registradas: golden com a fonte de teste do Flutter; não testado em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_checkbox_group.dart`)
- `onChange(List<Object>)`: com a lista completa de valores marcados, a cada alternância do usuário, "marcar todos" ou chamada ao controller. `disabled` e `readOnly` impedem alternar.

**Controller:** `SgCheckboxGroupController` (equivale ao `ref`/`SgCheckboxGroupRef` do React): `getChecked()`, `setChecked(List<Object>)`, `checkAll()` (todos os habilitados) e `clearAll()`. `setChecked`, `checkAll` e `clearAll` passam por `_emit`, ou seja, **também chamam `onChange`**.

**Estado e formulário**
- `value` controlado quando não nulo; sem ele o estado inicial vem das opções com `checked: true`. `showCheckAll` mostra o item "marcar todos" tri-state (indeterminado quando há marcados parciais); clicar com todos os habilitados marcados desmarca tudo.
- Com `name`, o valor do formulário é a lista (inicial `[]`); registra `rules` com o `required` mesclado (`mergeRequiredRule`) e não registra `validator` próprio. Revalida a cada mudança se já havia erro ou envio (`ChoiceFieldBinding.set`, `choice_shared.dart`). O título ganha ` *` quando `required`.

**Acessibilidade e teclado:** cada opção é um `ChoiceTile` com `Semantics(checked, enabled, label)`; o grupo fica em `Semantics(container: true)` dentro de um `SgGroupBox` cujo título é `title`. Espaço ou Enter alternam a opção focada (`choice_tile.dart`, `_key`). Mensagem de erro em texto abaixo do grupo.

## SgRadioGroup

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgRadioGroup` (mesmo nome).

Grupo de radios para escolha unica com orientacao e estilo visual configuravel.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/choice/sg_radio_group.dart` (linha 29) · classe `class SgRadioGroup extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_radio_group.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgRadioGroup({...})` com 17 parâmetro(s) nomeado(s), 17 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgRadioGroup

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String?` | — | não | React | — |
| `title` | `String?` | — | não | React | Titulo do grupo. |
| `source` | `List<SgRadioGroupOption>` | — | sim | React | Opcoes disponiveis. Tipo no React: `SgRadioGroupOption[]`. |
| `value` | `Object?` | — | não | React | Valor selecionado. Tipo no React: `string \| number`. |
| `orientation` | `SgRadioGroupOrientation` | `SgRadioGroupOrientation.vertical` | não | React | Orientacao visual do grupo. Valores: `vertical`, `horizontal`. |
| `selectionStyle` | `SgRadioGroupSelectionStyle` | `SgRadioGroupSelectionStyle.radio` | não | React | Estilo visual de selecao. Valores: `radio`, `highlight`. |
| `iconOnly` | `bool` | `false` | não | React | — |
| `disabled` | `bool` | `false` | não | React | — |
| `readOnly` | `bool` | `false` | não | React | Impede alteracoes no valor. |
| `required` | `bool` | `false` | não | React | Marca o grupo como obrigatorio. |
| `onChange` | `ValueChanged<Object?>?` | — | não | React | Callback de mudanca. Tipo no React: `((value: string \| number) => void)`. |
| `name` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `error` | `String?` | — | não | React | — |
| `optionClassName` | `String?` | — | não | React | React-only (classe CSS por opcao); sem efeito no Flutter. |
| `groupBoxProps` | `SgChoiceGroupBoxProps?` | `{}` † | não | React | Tipo no React: `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Destaque e relevo aproximados (bordas desenhadas por `Transform`).
- `groupBoxProps` vira `SgChoiceGroupBoxProps`; a caixa é o `SgGroupBox` real.
- **Não portado:** `className`/`style`, `inputProps` e `optionClassName` (aceito e sem efeito); 3 props omitidas de propósito (ADR 50).
- Limitações registradas: golden com a fonte de teste do Flutter; não testado em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_radio_group.dart`)
- `onChange(Object?)`: com o valor escolhido. Tocar no rádio que já está marcado **não** emite de novo (`_select` ignora quando `_current == v`). `disabled` e `readOnly` impedem a escolha.

**Estado e formulário:** `value` controlado quando não nulo (`Object?`, texto ou número). Com `name`, o valor do formulário é o valor da opção; registra `rules` com `required` mesclado e não registra `validator`. Não há controller próprio.

**Acessibilidade e teclado:** cada opção expõe `Semantics(selected, inMutuallyExclusiveGroup: true, enabled, label)`. Espaço escolhe a opção focada; ↓ ou → vão para a próxima e ↑ ou ← para a anterior, em ciclo e pulando as desabilitadas; mover o foco **também escolhe** a opção (`_arrow` chama `_select`). O grupo fica num `SgGroupBox` com `Semantics(container: true)`.

## SgMultiSelect

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgMultiSelect` (mesmo nome).

Campo de selecao multipla no estilo select: trigger com chevron que vira check ao abrir e dropdown com checkboxes que mantem a lista aberta.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/multi/sg_multi_select.dart` (linha 32) · classe `class SgMultiSelect extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_multi_select.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgMultiSelect({...})` com 43 parâmetro(s) nomeado(s), 43 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgMultiSelect

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `options` | `List<SgMultiSelectOption>` | — | sim | React | Lista de opcoes disponiveis. `label` aparece na lista; `chipLabel` (opcional) e' o texto curto do item ja' selecionado (o resumo do campo), ex.: label "3 - Filial Centro" e chipLabel "3". Tipo no React: `SgMultiSelectOption[]`. |
| `value` | `List<SgMultiSelectOptionValue>?` | — | não | React | Array de valores selecionados. Tipo no React: `SgMultiSelectOptionValue[]`. |
| `onChange` | `ValueChanged<List<SgMultiSelectOptionValue>>?` | — | não | React | Callback com o array atualizado de valores. Tipo no React: `((value: SgMultiSelectOptionValue[]) => void)`. |
| `searchable` | `bool` | `false` | não | React | Exibe campo de busca no topo do dropdown. |
| `searchPlaceholder` | `String?` | — | não | React | — |
| `clearable` | `bool` | `false` | não | React | Exibe botao para limpar toda a selecao. |
| `maxSelected` | `num?` | — | não | React | Limite maximo de itens selecionaveis. |
| `emptyText` | `String?` | — | não | React | — |
| `summaryThreshold` | `num` | `2` | não | React | Quantidade de rotulos antes de mostrar 'N selecionadas'. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao focar o campo. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao sair do campo. Tipo no React: `((() => void) & (() => void))`. |
| `borderRadius` | `Object?` | — | não | React | Numero (px) ou texto `'Npx'`. Tipo no React: `string \| number`. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgMultiSelectElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgMultiSelectLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgMultiSelectLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `maxLengthMessage` | `String?` | — | não | React | Aceita por contrato; sem efeito (o campo nao tem `maxLength`). |
| `minLengthMessage` | `String?` | — | não | React | Aceita por contrato; sem efeito (o campo nao tem `minLength`). |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `onClear` | `VoidCallback?` | — | não | React | Aceita por contrato; sem efeito (o campo nao tem botao de limpar do SgInputText; use `clearable`). Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | Texto exibido quando nada esta selecionado. |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgMultiSelectTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O React não foca o campo ao tocar; o Flutter foca.
- A lista ancorada se alinha ao `SgInputText` inteiro; a superfície do dropdown é compartilhada (`SgDropdownHost`) e a lista de opções continua própria.
- `onClear`, `maxLengthMessage` e `minLengthMessage` são aceitos sem efeito (igual ao React); `inputProps` é ignorado (ADR 50); sem `autocorrect` nem `spellCheck`.
- O `onChange` do usuário também roda dentro de formulário (decisão do dono de 2026-10-25).
- Limitações registradas: não testado em IME nem em dispositivo; golden com a fonte de teste.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_multi_select.dart` e `multi_select_core.dart`)
- `onChange(List<Object>)`: com a lista atualizada, a cada marcar/desmarcar, limpar ou remover. Também é chamado dentro de formulário, junto com a gravação do valor (`_handleChange`: `pushToForm` e depois `onChange`).
- `maxSelected`: ao atingir o limite, as opções não marcadas ficam desabilitadas e novas marcações são ignoradas; desmarcar continua possível.

**Estado e formulário**
- `value` controlado quando não nulo; sem ele o estado é interno (`SgMultiSelectController`, não exportado). O campo mostra os rótulos (`chipLabel ?? label`) separados por vírgula até `summaryThreshold` (padrão 2) e, acima disso, o texto de resumo i18n.
- Com `name`, a ligação ao formulário vem do `SgMultiFormBinding` (`multi_form_binding.dart`): grava a lista (inicial `[]`) e registra **somente `rules`**. O comentário do código registra que o `required` do componente **não** vira regra do formulário (fiel ao React); para exigir o campo no envio, use `rules`.
- `searchable` mostra busca no topo (filtro por "contém", sem diferenciar maiúsculas); `clearable` mostra o botão de limpar.

**Acessibilidade e teclado:** os botões de abrir e de limpar têm `Semantics(button, label)` com textos i18n (`components.actions.openList`, `components.actions.clearSelection`); cada opção expõe `Semantics(selected, enabled, button)` e o painel `Semantics(container, explicitChildNodes)`. No campo: Esc fecha; ↓, Enter ou Espaço abrem. Com a lista aberta e sem busca: ↓/↑ movem o item ativo, Enter/Espaço alternam, Tab fecha; com busca, o foco vai para o campo de busca e as mesmas teclas valem sobre a lista (`handleListKey`).

## SgMultiSelectChips

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgMultiSelectChips` (mesmo nome).

Variante do multi-select onde os itens selecionados viram chips removiveis no trigger; o dropdown com checkboxes e a busca sao iguais ao SgMultiSelect.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/multi/sg_multi_select_chips.dart` (linha 17) · classe `class SgMultiSelectChips extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_multi_select_chips.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgMultiSelectChips({...})` com 22 parâmetro(s) nomeado(s), 22 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgMultiSelectChips

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `options` | `List<SgMultiSelectOption>` | — | sim | React | Lista de opcoes disponiveis. `label` aparece na lista; `chipLabel` (opcional) e' o texto curto do item ja' selecionado (o chip), ex.: label "3 - Filial Centro" e chipLabel "3". Tipo no React: `SgMultiSelectOption[]`. |
| `value` | `List<SgMultiSelectOptionValue>?` | — | não | React | Array de valores selecionados. Tipo no React: `SgMultiSelectOptionValue[]`. |
| `onChange` | `ValueChanged<List<SgMultiSelectOptionValue>>?` | — | não | React | Callback com o array atualizado de valores. Tipo no React: `((value: SgMultiSelectOptionValue[]) => void)`. |
| `searchable` | `bool` | `false` | não | React | Exibe campo de busca no topo do dropdown. |
| `searchPlaceholder` | `String?` | — | não | React | — |
| `clearable` | `bool` | `false` | não | React | Exibe botao para limpar toda a selecao. |
| `maxSelected` | `num?` | — | não | React | Limite maximo de itens selecionaveis. |
| `emptyText` | `String?` | — | não | React | — |
| `placeholder` | `String?` | — | não | React | Texto exibido quando nada esta selecionado. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao focar o campo. Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao sair do campo. Tipo no React: `(() => void)`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelText` | `String?` | — | não | React | — |
| `width` | `Object?` | — | não | React | Numero (px) ou texto `'N%'`/`'Npx'`; padrao: largura toda. Tipo no React: `string \| number`. |
| `borderRadius` | `Object?` | — | não | React | Numero (px) ou texto `'Npx'`. Tipo no React: `string \| number`. |
| `disabled` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `name` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `error` | `String?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O item ativo da lista rola até ficar visível (o React não faz isso).
- A superfície do dropdown é compartilhada (`SgDropdownHost`); a lista de opções continua própria.
- `inputProps` é ignorado (ADR 50); sem `autocorrect` nem `spellCheck`.
- O `onChange` do usuário também roda dentro de formulário (decisão do dono de 2026-10-25).
- Limitações registradas: não testado em IME nem em dispositivo; golden com a fonte de teste.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_multi_select_chips.dart`)
- `onChange(List<Object>)`: igual ao `SgMultiSelect` (marcar, remover chip, limpar), inclusive dentro de formulário.
- `onEnter()`: ao o campo ganhar o foco; `onExit()`: ao perdê-lo, **exceto** quando o foco só passa para a lista aberta (`sgMultiSelectFocusMovesToList`).

**Estado e formulário:** mesma base do `SgMultiSelect` (`SgMultiFormBinding`, `SgMultiSelectController`): `value` controlado quando não nulo, `maxSelected`, `searchable`, `clearable`, `required` que **não** vira regra do formulário (use `rules`). Cada item escolhido vira um chip (`chipLabel ?? label`); se há `chipLabel`, o chip mostra um `Tooltip` com o `label` completo. O ✕ do chip remove o item (desabilitado quando `disabled`).

**Acessibilidade e teclado:** o campo é um `Semantics(container, label, expanded, enabled)`; botões de abrir/limpar com `Semantics(button, label)` i18n; o ✕ de cada chip usa o texto i18n `components.inputs.multiSelect.removeChip` com o rótulo do item. Teclas do campo e da lista: as mesmas do `SgMultiSelect` (Esc, ↓/Enter/Espaço, ↑, Tab).

## SgOrderList

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgOrderList` (mesmo nome).

Lista ordenavel para reordenacao manual de itens com selecao e controles de movimento.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/lists/sg_order_list.dart` (linha 70) · classe `class SgOrderList extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_order_list.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgOrderList({...})` com 23 parâmetro(s) nomeado(s), 22 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgOrderList

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `source` | `List<SgOrderListItem>` | — | sim | React | Itens de origem. Tipo no React: `SgOrderListItem[]`. |
| `id` | `String?` | — | não | React | — |
| `title` | `String?` | — | não | React | Titulo do grupo. |
| `value` | `List<SgOrderListItem>?` | — | não | React | Itens na ordem atual. Tipo no React: `SgOrderListItem[]`. |
| `onChange` | `ValueChanged<List<SgOrderListItem>>?` | — | não | React | Callback ao alterar a ordem. Tipo no React: `((items: SgOrderListItem[]) => void)`. |
| `selectedValues` | `List<Object>?` | — | não | React | Tipo no React: `(string \| number)[]`. |
| `onSelectionChange` | `ValueChanged<List<Object>>?` | — | não | React | Tipo no React: `((values: (string \| number)[]) => void)`. |
| `selectionMode` | `SgOrderListSelectionMode` | `SgOrderListSelectionMode.multiple` | não | React | Modo de selecao. Valores: `multiple`, `single`. |
| `showControls` | `bool` | `true` | não | React | Exibe botoes de ordenacao. |
| `controlsPosition` | `SgOrderListControlsPosition` | `SgOrderListControlsPosition.left` | não | React | Valores: `left`, `right`. |
| `draggable` | `bool` | `true` | não | React | Permite arrastar itens. |
| `disabled` | `bool` | `false` | não | React | Desabilita interacao. |
| `readOnly` | `bool` | `false` | não | React | — |
| `emptyMessage` | `String?` | — | não | React | — |
| `itemTemplate` | `Widget Function(SgOrderListItem item, SgOrderListItemState state)?` | — | não | React | Tipo no React: `((item: SgOrderListItem, state: { index: number; selected: boolean; disabled: boolean; }) => React.ReactNode)`. |
| `listClassName` | `String?` | — | não | React | Classe CSS: nao existe no Flutter (ADR 50). Aceita so para cumprir o contrato; sem efeito. |
| `itemClassName` | `String?` | — | não | React | Classe CSS: sem efeito (ADR 50). |
| `groupBoxProps` | `SgListGroupBoxProps?` | `{}` † | não | React | Tipo no React: `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })`. |
| `error` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `controller` | `SgOrderListController?` | — | não | Flutter | `ref` do React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Arrasta por toque longo (`LongPressDraggable`, cerca de 150 ms) no lugar do arrastar nativo do navegador.
- A reinicialização do estado ao trocar `source` compara os itens por identidade.
- Os rótulos Top/Up/Down/Bottom dos botões ficam em inglês, como no React.
- **Não portado:** `listClassName` e `itemClassName` (aceitos sem efeito, ADR 50); `groupBoxProps` vira `SgListGroupBoxProps`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_order_list.dart`)
- `onChange(List<SgOrderListItem>)`: com a nova ordem, ao mover (botões, atalhos, arrastar) ou ao chamar `controller.setItems`.
- `onSelectionChange(List<Object>)`: com os valores selecionados; `selectedValues` torna a seleção controlada.
- `selectionMode`: `single` seleciona um item; `multiple` alterna o clique e aceita Shift+clique para faixa (com Ctrl/Meta soma à seleção atual). Itens `disabled` não são selecionados nem movidos; `disabled`/`readOnly` bloqueiam tudo.

**Controller:** `SgOrderListController` (equivale ao `ref`): `getItems()`, `setItems(...)`, `getSelection()`, `setSelection(...)`, `moveTop()`, `moveUp()`, `moveDown()`, `moveBottom()`, `clearSelection()`. Só funciona depois que o widget está montado (devolve vazio antes).

**Estado e formulário:** `value` (lista de itens) controla a ordem; sem ele o estado parte de `source`. Com `name`, o valor do formulário é a **lista de `SgOrderListItem`** (`_binding.set(next)`); registra apenas `rules` (sem `required`, sem `validator`). `showControls`/`controlsPosition` mostram os botões; `draggable` liga o arrastar.

**Acessibilidade e teclado:** cada item é um `ListEntryTile` com `Semantics(container, selected, button, enabled, label: item.label)` e foco próprio; Espaço/Enter selecionam; **Ctrl/Meta + ↑/↓/Home/End** movem os itens selecionados para cima, baixo, topo e fim (`_onKey`). Os botões de mover têm `Tooltip` e `Semantics(button, label)` (`ListControlButton`).

## SgPickList

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPickList` (mesmo nome).

Lista dual para mover itens entre origem e destino com filtros e selecao.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/lists/sg_pick_list.dart` (linha 107) · classe `class SgPickList extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_pick_list.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPickList({...})` com 34 parâmetro(s) nomeado(s), 33 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgPickList

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `source` | `List<SgPickListItem>` | — | sim | React | Tipo no React: `SgPickListItem[]`. |
| `target` | `List<SgPickListItem>` | — | sim | React | Tipo no React: `SgPickListItem[]`. |
| `id` | `String?` | — | não | React | Identificador unico do componente. |
| `title` | `String?` | — | não | React | — |
| `value` | `SgPickListValue?` | — | não | React | Estado atual das listas. Tipo no React: `SgPickListValue`. |
| `onChange` | `ValueChanged<SgPickListChangeEvent>?` | — | não | React | Callback ao mover itens. Tipo no React: `((event: SgPickListChangeEvent) => void)`. |
| `sourceSelection` | `List<Object>?` | — | não | React | Tipo no React: `(string \| number)[]`. |
| `targetSelection` | `List<Object>?` | — | não | React | Tipo no React: `(string \| number)[]`. |
| `onSourceSelectionChange` | `ValueChanged<List<Object>>?` | — | não | React | Tipo no React: `((values: (string \| number)[]) => void)`. |
| `onTargetSelectionChange` | `ValueChanged<List<Object>>?` | — | não | React | Tipo no React: `((values: (string \| number)[]) => void)`. |
| `selectionMode` | `SgPickListSelectionMode` | `SgPickListSelectionMode.multiple` | não | React | Modo de selecao nas listas. Valores: `multiple`, `single`. |
| `sourceHeader` | `String?` | — | não | React | — |
| `targetHeader` | `String?` | — | não | React | — |
| `showTransferControls` | `bool` | `true` | não | React | — |
| `showSourceControls` | `bool` | `true` | não | React | — |
| `showTargetControls` | `bool` | `true` | não | React | — |
| `showSourceFilter` | `bool` | `false` | não | React | — |
| `showTargetFilter` | `bool` | `false` | não | React | — |
| `sourceFilterPlaceholder` | `String?` | — | não | React | — |
| `targetFilterPlaceholder` | `String?` | — | não | React | — |
| `filterMatchMode` | `SgPickListFilterMatchMode` | `SgPickListFilterMatchMode.contains` | não | React | Valores: `contains`, `startsWith`, `endsWith`. |
| `draggable` | `bool` | `true` | não | React | — |
| `disabled` | `bool` | `false` | não | React | Desabilita interacao. |
| `readOnly` | `bool` | `false` | não | React | — |
| `emptyMessage` | `String?` | — | não | React | — |
| `itemTemplate` | `Widget Function(SgPickListItem item, SgPickListItemState state)?` | — | não | React | Tipo no React: `((item: SgPickListItem, state: { index: number; selected: boolean; disabled: boolean; list: SgPickListListName; }) => React.ReactNode)`. |
| `listClassName` | `String?` | — | não | React | Classe CSS: nao existe no Flutter (ADR 50). Aceita so para cumprir o contrato; sem efeito. |
| `itemClassName` | `String?` | — | não | React | Classe CSS: sem efeito (ADR 50). |
| `groupBoxProps` | `SgListGroupBoxProps?` | `{}` † | não | React | Tipo no React: `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })`. |
| `error` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `controller` | `SgPickListController?` | — | não | Flutter | `ref` do React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Arrasta por toque longo (`LongPressDraggable`, cerca de 150 ms) no lugar do arrastar nativo do navegador; mover pelo duplo toque em até 300 ms.
- A reinicialização do estado ao trocar `source`/`target` compara os itens por identidade.
- Os rótulos Top/Up/Down/Bottom dos botões de ordem ficam em inglês, como no React.
- **Não portado:** `listClassName` e `itemClassName` (aceitos sem efeito, ADR 50); `groupBoxProps` vira `SgListGroupBoxProps`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_pick_list.dart`)
- `onChange(SgPickListChangeEvent)`: objeto com `source`, `target` e `type` (`SgPickListChangeType`: `moveToTarget`, `moveAllToTarget`, `moveToSource`, `moveAllToSource`, `reorderSource`, `reorderTarget`, `dragdrop`). Dispara em qualquer movimentação, inclusive `controller.setValue` (que usa `dragdrop`).
- `onSourceSelectionChange` e `onTargetSelectionChange` (`List<Object>`): seleção de cada lista; `sourceSelection`/`targetSelection` a tornam controlada.
- Duplo toque (até 300 ms) num item o move para a outra lista; `selectionMode` e `filterMatchMode` (`contains` por padrão) definem seleção e filtro (`showSourceFilter`/`showTargetFilter`).

**Controller:** `SgPickListController`: `getValue()` (`SgPickListValue` com `source` e `target`), `setValue(...)`, `moveToTarget()`, `moveAllToTarget()`, `moveToSource()`, `moveAllToSource()`, `clearSelection()`.

**Estado e formulário:** `value` (`SgPickListValue`) controla as duas listas; sem ele o estado parte de `source`/`target`. Com `name`, o valor do formulário é um `SgPickListValue(source, target)` (sem o tipo do evento) e o widget registra apenas `rules`.

**Acessibilidade e teclado:** cada item é um `ListEntryTile` com `Semantics(container, selected, button, enabled, label)`; os botões de transferência têm `Tooltip` e rótulo semântico. **Sem atalhos de teclado próprios:** o `PickList` não passa `onKeyEvent` aos itens (diferente do `SgOrderList`); a seleção e a movimentação por teclado ficam por conta do foco e do toque, não confirmado além disso.

## SgPeriodSelector

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPeriodSelector` (mesmo nome).

Seletor de periodos pre-definidos (Este mes, Ultimo trimestre, etc.) que resolve a regra temporal para um intervalo real de datas.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/period/sg_period_selector.dart` (linha 22) · classe `class SgPeriodSelector extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_period_selector.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPeriodSelector({...})` com 19 parâmetro(s) nomeado(s), 19 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgPeriodSelector

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | `'sg-period-selector'` | não | React | Identificador unico do campo. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `value` | `SgPeriodSelectorValue?` | — | não | React | Preset selecionado (modo controlado). Valores: `ALL`, `CUSTOM`, `TODAY`, `YESTERDAY`, `TOMORROW`, `THIS_WEEK`, `THIS_QUINZENA`, `THIS_MONTH`, `THIS_QUARTER`, `THIS_SEMESTER`, `THIS_YEAR`, `LAST_WEEK`, `LAST_QUINZENA`, `LAST_MONTH`, `LAST_QUARTER`, `LAST_SEMESTER`, `LAST_YEAR`, `NEXT_WEEK`, `NEXT_QUINZENA`, `NEXT_MONTH`, `NEXT_QUARTER`, `NEXT_SEMESTER`, `NEXT_YEAR`. |
| `onChange` | `ValueChanged<ResolvedPeriod>?` | — | não | React | Callback com o preset e intervalo resolvido. Tipo no React: `((period: ResolvedPeriod) => void)`. |
| `permitPast` | `bool` | `true` | não | React | Habilita o grupo de periodos passados. |
| `permitCurrent` | `bool` | `true` | não | React | Habilita o grupo de periodos atuais. |
| `permitFuture` | `bool` | `true` | não | React | Habilita o grupo de periodos futuros. |
| `permitAll` | `bool` | `true` | não | React | Habilita a opcao Todos (sem limites de data). |
| `allowCustomPeriod` | `bool` | `true` | não | React | Habilita a opcao Periodo (intervalo customizado). |
| `locale` | `String` | `'pt-BR'` | não | React | Locale usado nos labels e formatacao. |
| `disabled` | `bool?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `minDate` | `DateTime?` | — | não | React | Limite inferior aplicado como clamp no intervalo. Tipo no React: `Date`. |
| `maxDate` | `DateTime?` | — | não | React | Limite superior aplicado como clamp no intervalo. Tipo no React: `Date`. |
| `referenceDate` | `DateTime?` | — | não | React | Data de referencia para resolver os presets (default: agora). Util em testes. Tipo no React: `Date`. |
| `error` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Integracao react-hook-form (opcional). Tipo no React: `Control<FieldValues>`. |
| `name` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `value` nulo significa "não controlado" (o Combobox interno não distingue `null` de indefinido), mas voltar o `value` para nulo limpa o campo.
- O campo de data do período personalizado é o `SgInputDate`, que segue o locale do i18n global (no React também: a prop `locale` do seletor só troca os rótulos).
- Os rótulos vêm de mapas embutidos sem acento, iguais aos do React (não passam pelo i18n).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_period_selector.dart` e `period_logic.dart`)
- `onChange(ResolvedPeriod)`: ao escolher um período. `ResolvedPeriod` traz `preset` (`SgPeriodSelectorValue`), `label`, `startDate` (00:00:00.000 do primeiro dia) e `endDate` (23:59:59.999 do último dia), ambos `DateTime?` (`all` e `custom` sem preenchimento devolvem datas nulas, segundo o comentário de `ResolvedPeriod`). Em `custom`, cada edição de uma das duas datas emite de novo.
- `referenceDate` (padrão: agora) é a base dos períodos relativos; `minDate`/`maxDate` são repassados ao `resolvePeriod` (`ResolvePeriodOptions`) e aos dois `SgInputDate`; `permitPast`/`permitCurrent`/`permitFuture`/`permitAll` filtram os grupos de opções; `allowCustomPeriod` mostra os dois `SgInputDate`.

**Estado e formulário**
- Por dentro é um `SgCombobox` agrupado com `openOnFocus`. `value` (`SgPeriodSelectorValue?`) é a opção escolhida.
- Com `name`, o valor do formulário é o **texto do preset** (`period.preset.value`, ex.: `THIS_WEEK`), e o widget registra apenas `rules` e `initialValue`. Inferência: `required` é repassado só ao combobox interno, sem `name`, então não é regra do envio.
- Funções públicas relacionadas: `resolvePeriod`, `buildPeriodOptions`, `periodPresetLabel`, `ResolvePeriodOptions` (`period_logic.dart`).

**Acessibilidade e teclado:** herda do `SgCombobox` interno (type-ahead, ↓/↑, Enter/Espaço, Esc, Tab; botão de seta com `tooltip` i18n; `Semantics(selected)` nos itens) e do `SgInputDate` no modo personalizado. O widget não acrescenta `Semantics` próprio. A largura máxima do conjunto é 288 px.

## SgYearPartSelector

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgYearPartSelector` (mesmo nome).

Seletor de recorte de ano: o usuario escolhe ANO + RECORTE (semestre, trimestre ou bimestre) + FATIA, e o componente resolve para um intervalo real e fechado de datas. E' o irmao ABSOLUTO do SgPeriodSelector: aquele resolve presets RELATIVOS a hoje ("este semestre"), este resolve um recorte fixo de um ano civil informado ("o 1o semestre DE 2024"), que nao muda de significado com a passagem do tempo.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/period/sg_year_part_selector.dart` (linha 43) · classe `class SgYearPartSelector extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_year_part_selector.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgYearPartSelector({...})` com 11 parâmetro(s) nomeado(s), 10 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgYearPartSelector

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | `'sg-year-part-selector'` | não | React | Prefixo dos ids dos tres controles internos (ano, recorte, fatia). Nao e' o id de um campo unico: o componente monta tres. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `value` | `YearPartValue?` | — | não | React | Recorte selecionado no modo controlado: { year, kind, part }, com part em base 1 (1..2 no semestre, 1..4 no trimestre, 1..6 no bimestre). Tipo no React: `YearPartValue`. |
| `onChange` | `ValueChanged<ResolvedYearPart>?` | — | não | React | Callback com o recorte ja resolvido: value, label e o intervalo fechado startDate/endDate. As datas NUNCA vem nulas, diferente do ResolvedPeriod do SgPeriodSelector. Tipo no React: `((resolved: ResolvedYearPart) => void)`. |
| `allowedKinds` | `List<YearPartKind>?` | `SEMESTER,QUARTER,BIMESTER` † | não | React | Recortes oferecidos no combo. Reduza a lista quando o dominio so' aceita um deles (fechamento trimestral, por exemplo); com um unico item o combo de recorte deixa de fazer sentido na tela. Tipo no React: `YearPartKind[]`. |
| `minYear` | `int?` | `ano corrente - 30` † | não | React | Primeiro ano oferecido na lista de anos. |
| `maxYear` | `int?` | `ano corrente + 10` † | não | React | Ultimo ano oferecido na lista de anos. |
| `locale` | `String` | `'pt-BR'` | não | React | Locale dos rotulos de recorte e fatia. A sigla entre parenteses acompanha o idioma: Q1..Q4 em pt-BR e en-US, T1..T4 em es, fr e pt-PT; bimestre nao tem sigla e sai sem parenteses. |
| `disabled` | `bool?` | `false` † | não | React | Desabilita os tres combos (ano, recorte e fatia). |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `today` | `DateTime?` | — | não | Flutter | "Hoje" para o estado inicial e para a faixa de anos (padrao: agora). Extra do Flutter, para testes e showcase (no React o componente le `new Date()`). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada na tabela de paridade para este componente.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_year_part_selector.dart` e `year_part.dart`)
- `onChange(ResolvedYearPart)`: ao mudar ano, recorte ou fatia. `ResolvedYearPart` traz `value` (`YearPartValue`: `year`, `kind`, `part` base 1), `label`, `startDate` e `endDate` (último instante do último dia da fatia).

**Estado:** `value` (`YearPartValue?`) é opcional; sem ele o estado inicial é o recorte do dia atual (`today ?? DateTime.now()`) no primeiro tipo permitido. `allowedKinds` limita os recortes (`YearPartKind.semester`, `quarter`, `bimester`; padrão os três; com um só, o seletor de recorte some). `minYear`/`maxYear` (padrão: ano atual - 30 até + 10); `today` é um extra do Flutter para fixar a data de referência. Valor inconsistente é ajustado (`clampYearPart`, recorte fora de `allowedKinds` vira o primeiro permitido).

**Formulário:** **sem ligação a formulário**: o widget não tem `name`, `control` nem `rules`; use o `onChange`.

**Acessibilidade:** são três `SgCombobox` internos (ids `<id>-year`, `<id>-kind`, `<id>-part`), em linha quando a largura é de 640 px ou mais e em coluna abaixo disso (`kSgYearPartRowWidth`). O rótulo `label` é um `Text` simples com ` *` quando `required`; sem `Semantics` próprio. Teclado e semântica dos itens vêm do `SgCombobox`.

## SgToggleSwitch

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgToggleSwitch` (mesmo nome).

Interruptor booleano para ativar ou desativar estados, flags e configuracoes simples.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/choice/sg_toggle_switch.dart` (linha 15) · classe `class SgToggleSwitch extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_toggle_switch.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgToggleSwitch({...})` com 24 parâmetro(s) nomeado(s), 24 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgToggleSwitch

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do componente. |
| `checked` | `bool?` | — | não | React | Valor booleano atual. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `defaultChecked` | `bool?` | — | não | React | — |
| `description` | `String?` | — | não | React | — |
| `disabled` | `bool?` | — | não | React | No React: `enabled` (valor invertido). |
| `error` | `String?` | — | não | React | — |
| `inputProps` | `Object?` | — | não | React | Sem equivalente no Flutter (atributos do <input>); ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `name` | `String?` | — | não | React | — |
| `offIcon` | `Widget?` | — | não | React | — |
| `onChange` | `ValueChanged<bool>?` | — | não | React | Callback de mudanca. Tipo no React: `((checked: boolean) => void)`. |
| `onIcon` | `Widget?` | — | não | React | — |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `readOnly` | `bool?` | `false` † | não | React | Permite visualizacao sem alteracao. |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `switchClassName` | `String?` | — | não | React | React-only (classes CSS); sem efeito no Flutter. |
| `thumbClassName` | `String?` | — | não | React | — |
| `trackClassName` | `String?` | — | não | React | — |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(bool checked)?` | — | não | React | Tipo no React: `((checked: boolean) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `enabled` do React virou `disabled` (ADR 50; valor invertido).
- **Não portado:** `className`/`style`, `inputProps`, `switchClassName`, `thumbClassName` e `trackClassName` (aceitos sem efeito); 3 props omitidas de propósito.
- Os validadores do componente (`required`, `validation`) rodam também no `handleSubmit`/`trigger` (decisão do dono de 2026-10-25).
- Limitações registradas: golden com a fonte de teste do Flutter; não testado em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_toggle_switch.dart`)
- `onChange(bool)`: ao alternar (clique, toque, Espaço ou Enter), com o novo estado. Dentro de formulário o valor também é gravado (`setValue`). `disabled` e `readOnly` impedem alternar.
- `onValidation(String?)`: com a mensagem de erro (ou `null`) a cada validação. `validation(bool)` devolve a mensagem; `validateOnBlur` vale `true` quando omitido.

**Estado e formulário**
- `checked` controlado quando não nulo (mudar `checked` reinicia o estado interno com `checked ?? defaultChecked ?? false`); `defaultChecked` é o inicial.
- Com `name`, o valor do formulário é um `bool` (inicial `defaultChecked ?? false`). É o único do grupo que registra um **`validator` próprio** (`_formValidate`, com `required`, `requiredMessage` e `validation`; campo desabilitado nunca falha), além de `rules` com `required` mesclado. Ao perder o foco chama `markTouched` e `trigger([name])`.
- Fora de formulário, implementa `SgSelfValidating` e se registra no `SgValidationScope` (etapa do `SgWizard`): `validateNow()`.
- `SgSwitch` é um `typedef` para `SgToggleSwitch` (como o alias do React).

**Acessibilidade e teclado:** `Semantics(toggled, enabled, label: label ?? 'components.inputs.toggle.ariaLabel' i18n)`; `Focus` próprio, Espaço/Enter alternam; `required` mostra ` *` no rótulo; `description` aparece abaixo.

## SgRating

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgRating` (mesmo nome).

Controle de avaliacao ordinal para notas, estrelas e feedback rapido do usuario.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/choice/sg_rating.dart` (linha 23) · classe `class SgRating extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_rating.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgRating({...})` com 23 parâmetro(s) nomeado(s), 23 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgRating

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `allowHalf` | `bool` | `false` | não | React | Enable half stars |
| `cancel` | `bool` | `true` | não | React | Show cancel button |
| `cancelIcon` | `Widget?` | — | não | React | Custom icon for cancel button |
| `color` | `String?` | `hsl(var(--primary))` † | não | React | Color for filled stars |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `disabled` | `bool` | `false` | não | React | Desabilita interacao. |
| `emptyColor` | `String?` | `hsl(var(--muted-foreground))` † | não | React | Color for empty stars |
| `error` | `String?` | — | não | React | — |
| `id` | `String?` | — | não | React | Identificador unico do componente. |
| `label` | `String?` | — | não | React | Rotulo do campo. |
| `name` | `String?` | — | não | React | — |
| `offIcon` | `Widget?` | — | não | React | Custom icon for empty state |
| `onChange` | `ValueChanged<num>?` | — | não | React | Callback de mudanca. Tipo no React: `((value: number) => void)`. |
| `onHover` | `ValueChanged<num?>?` | — | não | React | Callback when hovering over stars Tipo no React: `((value: number) => void)`. |
| `onIcon` | `Widget?` | — | não | React | Custom icon for filled state |
| `readOnly` | `bool` | `false` | não | React | Impede alteracao da nota. |
| `required` | `bool` | `false` | não | React | Required field |
| `requiredMessage` | `String?` | — | não | React | Required message |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showTooltip` | `bool` | `false` | não | React | Show tooltips with value |
| `size` | `SgRatingSize` | `SgRatingSize.md` | não | React | Tamanho visual do controle. Valores: `sm`, `md`, `lg`, `xl`. |
| `stars` | `num` | `5` | não | React | Number of stars |
| `value` | `num` | `0` | não | React | Nota atual. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `color` e `emptyColor` aceitam texto (`#hex`, `rgb()`, `hsl(var(--token))`), porque o contrato gerado fixa `String`.
- A tabela de paridade registra "`value` nulo = não controlado"; no código atual `value` é `num` (padrão 0, não anulável), então **não confirmado** como isso se aplica.
- O teclado (setas, Home, End) é um extra do Flutter.
- **Não portado:** `inputProps`, `className`/`style` (3 props omitidas, ADR 50).
- Limitações registradas: golden com a fonte de teste do Flutter; não testado em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_rating.dart`)
- `onChange(num)`: a cada nota nova (clique na estrela, teclado, ou o botão de cancelar que grava `0`). `allowHalf` aceita meia nota ao clicar na metade esquerda da estrela.
- `onHover(num?)`: com a nota sob o ponteiro e `null` ao sair.

**Estado e formulário:** `value` (padrão `0`) é atualizado quando a prop muda; sem formulário o estado é interno. Com `name`, o valor do formulário é a nota (inicial **`null`**, como o React, então `required` falha até haver nota) e o widget registra `rules` com `required` mesclado (mensagem i18n `components.rating.required`). Implementa `SgSelfValidating` (etapa do `SgWizard` fora de formulário). `cancel` (padrão `true`) mostra o botão que zera, com `Tooltip` i18n (`components.rating.cancel`); `showTooltip` mostra dica por estrela.

**Acessibilidade e teclado:** `Semantics(label, value, increasedValue, decreasedValue, onIncrease, onDecrease)` no conjunto, o que permite ajustar a nota por tecnologia assistiva. Teclado (com o foco no conjunto): →/↑ somam um passo (1 ou 0,5), ←/↓ subtraem, Home zera, End vai ao máximo. `disabled`/`readOnly` desligam a interação.

## SgSlider

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgSlider` (mesmo nome).

Controle deslizante para ajuste numerico continuo dentro de um intervalo definido.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/choice/sg_slider.dart` (linha 13) · classe `class SgSlider extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_slider.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgSlider({...})` com 15 parâmetro(s) nomeado(s), 15 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgSlider

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do componente. |
| `minValue` | `num` | — | sim | React | Valor minimo do intervalo. |
| `maxValue` | `num` | — | sim | React | Valor maximo do intervalo. |
| `ariaLabel` | `String?` | — | não | React | Rotulo de acessibilidade (`aria-label`). |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `defaultValue` | `num?` | — | não | React | — |
| `disabled` | `bool` | `false` | não | React | Desabilita interacao. |
| `error` | `String?` | — | não | React | — |
| `inputProps` | `Object?` | — | não | React | Sem equivalente no Flutter (atributos do <input>); ignorado. Tipo no React: `SliderInputProps`. |
| `name` | `String?` | — | não | React | — |
| `onChange` | `ValueChanged<num>?` | — | não | React | Callback de mudanca. Tipo no React: `((value: number) => void)`. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `step` | `num` | `1` | não | React | Passo entre valores. |
| `value` | `num?` | — | não | React | Valor atual controlado. |
| `width` | `Object?` | — | não | React | Largura do componente. Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- É o `Slider` do Material tematizado, não um `CustomPainter` (o React usa o controle nativo do navegador).
- **Não portado:** `inputProps` (aceito e ignorado) e `className`/`style` (2 props omitidas de propósito, ADR 50).
- Limitações registradas: golden com a fonte de teste do Flutter; não testado em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_slider.dart`)
- `onChange(num)`: a cada alteração feita pelo usuário no `Slider` (`onChanged`), com o valor limitado a `minValue..maxValue`; valor inteiro sai como `int`.

**Estado e formulário:** `value` controlado quando não nulo; sem ele o estado interno parte de `defaultValue ?? minValue` (limitado ao intervalo). `step` (padrão 1) define as `divisions` (`range / step`, no mínimo 1); com `minValue == maxValue` o controle fica desabilitado. Com `name`, o valor do formulário é o número (inicial `minValue`); registra apenas `rules` (não há `required` neste componente nem `validator`).

**Acessibilidade e teclado:** `ariaLabel` vira `Semantics(label:)` em volta do `Slider`; o `semanticFormatterCallback` é `null`. Teclas e semântica de valor são as do `Slider` do Material (não verificado neste código). A mensagem de erro aparece em texto abaixo.

## SgStepperInput

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgStepperInput` (mesmo nome).

Campo numerico com botoes de incremento e decremento para ajuste discreto de quantidade.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/number/sg_stepper_input.dart` (linha 26) · classe `class SgStepperInput extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_stepper_input.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgStepperInput({...})` com 16 parâmetro(s) nomeado(s), 16 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgStepperInput

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do componente. |
| `minValue` | `num` | — | sim | React | Valor minimo permitido. |
| `maxValue` | `num` | — | sim | React | Valor maximo permitido. |
| `ariaLabel` | `String?` | — | não | React | Rotulo de acessibilidade (`aria-label`): vira o `Semantics.label` do campo. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `defaultValue` | `num?` | — | não | React | Valor inicial quando nao ha `value` nem formulario. Padrao: `minValue`. |
| `disabled` | `bool?` | `false` † | não | React | Desabilita interacao. |
| `error` | `String?` | — | não | React | — |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (atributos do `<input>`); ignorado. Tipo no React: `StepperInputProps`. |
| `name` | `String?` | — | não | React | — |
| `onChange` | `ValueChanged<num>?` | — | não | React | Callback de mudanca. Tipo no React: `((value: number) => void)`. |
| `readOnly` | `bool?` | `false` † | não | React | Permite visualizacao sem edicao direta. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `step` | `num?` | `1` † | não | React | Incremento e decremento aplicados. |
| `value` | `num?` | — | não | React | Valor atual controlado. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto ('50%', '120px'). Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada na tabela de paridade para este componente.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `sg_stepper_input.dart`)
- `onChange(num)`: a cada mudança, vinda dos botões, das setas ↑/↓ do teclado ou da digitação; o valor é sempre limitado a `minValue..maxValue`. Texto vazio vira `0` (depois limitado); texto que não é número finito é ignorado.

**Estado e formulário:** `value` controlado quando não nulo; sem ele parte de `defaultValue ?? minValue`. `step` (padrão 1) é o passo dos botões e das setas. Com `name`, o valor do formulário é o número (sem formulário preenchido, o campo mostra `minValue`); registra apenas `rules` (sem `required` nem `validator` próprios). Ao perder o foco chama `markTouched` e `trigger([name])`. `readOnly`/`disabled` bloqueiam os botões.

**Acessibilidade e teclado:** os botões de aumentar e diminuir são `Semantics(button, enabled, label)` com textos i18n (`components.inputs.stepper.increase` e `.decrease`) e ficam desabilitados nos limites; `ariaLabel` vira o `Semantics.label` do campo. No campo, ↑ soma e ↓ subtrai um `step`; o teclado de celular é numérico (com sinal quando `minValue < 0`).

