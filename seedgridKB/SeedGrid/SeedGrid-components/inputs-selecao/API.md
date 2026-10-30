---
tags: [seedgrid, component, frontend, react, inputs-selecao, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Inputs de seleção e valores (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Inputs de seleção: API — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API — Inputs de seleção e valores (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Pacote `@seedgrid/fe-components` v`2026.7.1`. Contexto: [[SeedGrid/SeedGrid-components/inputs-selecao/Visao-geral|Visão geral dos inputs de seleção]]. Exemplos: [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos|Exemplos dos inputs de seleção]].

As tabelas seguem a metodologia descrita em [[SeedGrid/SeedGrid-components/inputs-texto/API#Como as tabelas foram montadas|Como as tabelas foram montadas]]:
- tipos e obrigatoriedade vêm do type checker;
- padrões e descrições foram lidos no código;
- elas são completas.

Props `name`/`control`/`register`/`rules`/`error` seguem o [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato RhfFieldProps (react-hook-form)|contrato RhfFieldProps]]. Desvios desse contrato estão anotados na descrição de cada prop. `SgAutocomplete`, `SgCombobox` e `SgMultiSelect` herdam do [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato base SgInputText|contrato base SgInputText]].

## Importação e exportação pública

`import { … } from "@seedgrid/fe-components"`. Não existe outro subpath, só `"."` e `"./style.css"`. **Confirmado**.

| Componente | Exportado | Tipos/valores públicos associados |
|---|---|---|
| `SgAutocomplete` | sim | `SgAutocompleteProps`, `SgAutocompleteItem` (`SgAutocompleteSource` **não** é reexportado) |
| `SgCombobox` | sim | `SgComboboxProps`, `SgComboboxSource` |
| `SgCheckboxGroup` | sim | `SgCheckboxGroupProps`, `SgCheckboxGroupOption`, `SgCheckboxGroupOrientation`, `SgCheckboxGroupSelectionStyle`, `SgCheckboxGroupRef` |
| `SgRadioGroup` | sim | `SgRadioGroupProps`, `SgRadioGroupOption`, `SgRadioGroupOrientation`, `SgRadioGroupSelectionStyle` |
| `SgMultiSelect` | sim | `SgMultiSelectProps`, `SgMultiSelectOption`, `SgMultiSelectOptionValue` |
| `SgMultiSelectChips` | sim | `SgMultiSelectChipsProps` |
| `SgMultiSelectDropdown` | **não** (interno) | Dropdown compartilhado; `SgMultiSelectDropdownProps` não exportado |
| `useSgMultiSelect` | **não** (interno) | Hook compartilhado por `SgMultiSelect`/`SgMultiSelectChips` |
| `SgOrderList` | sim | `SgOrderListProps`, `SgOrderListItem`, `SgOrderListSelectionMode`, `SgOrderListControlsPosition`, `SgOrderListRef` |
| `SgPickList` | sim | `SgPickListProps`, `SgPickListItem`, `SgPickListListName`, `SgPickListSelectionMode`, `SgPickListFilterMatchMode`, `SgPickListChangeType`, `SgPickListValue`, `SgPickListChangeEvent`, `SgPickListRef` |
| `SgPeriodSelector` | sim | `SgPeriodSelectorProps`, `ResolvedPeriod`, `ResolvePeriodOptions`; valores `PeriodPreset` (enum), `resolvePeriod`, `periodPresetLabel`, `buildPeriodOptions` |
| `SgYearPartSelector` | sim | `SgYearPartSelectorProps`; de `yearPart.ts`: enum `YearPartKind`, tipos `YearPartValue`, `ResolvedYearPart`, funções `resolveYearPart`, `yearPartOptions`, `yearPartLabel`, `yearPartKindLabel`, `yearPartCount`, `yearPartMonths`, `isValidYearPart`, `clampYearPart`, `yearPartOf` |
| `SgToggleSwitch` | sim | `SgToggleSwitchProps`. O arquivo também define os aliases `SgSwitch`/`SgSwitchProps`, que **não** são reexportados pelo `index.ts`. |
| `SgRating` | sim | `SgRatingProps`, `SgRatingSize` |
| `SgSlider` | sim | `SgSliderProps` |
| `SgStepperInput` | sim | `SgStepperInputProps` |

## Tipos de item

| Tipo | Forma | Fonte |
|---|---|---|
| `SgAutocompleteItem` | `{ id: string \| number; label: string; value?: string; group?: string; disabled?: boolean; data?: unknown }` | `SgAutocomplete.tsx` |
| `SgComboboxSource<T>` | `T[] \| ((query: string) => Promise<T[]> \| T[])` | `SgCombobox.tsx` |
| `SgCheckboxGroupOption` | `{ label: string; value: string \| number; checked?: boolean; icon?: ReactNode; disabled?: boolean }` | `SgCheckboxGroup.tsx` |
| `SgRadioGroupOption` | `{ label: string; value: string \| number; icon?: ReactNode; disabled?: boolean }` | `SgRadioGroup.tsx` |
| `SgMultiSelectOption` | `{ label: string; value: string \| number; chipLabel?: string; disabled?: boolean }` | `useSgMultiSelect.ts` |
| `SgOrderListItem` / `SgPickListItem` | `{ label: string; value: string \| number; disabled?: boolean; icon?: ReactNode; data?: unknown }` | `SgOrderList.tsx` / `SgPickList.tsx` |
| `SgPickListChangeType` | `"moveToTarget" \| "moveAllToTarget" \| "moveToSource" \| "moveAllToSource" \| "reorderSource" \| "reorderTarget" \| "dragdrop"` | `SgPickList.tsx` |
| `ResolvedPeriod` | `{ preset: PeriodPreset; label: string; startDate: Date \| null; endDate: Date \| null }` | `SgPeriodSelector.tsx` |
| `YearPartValue` / `ResolvedYearPart` | `{ year; kind: YearPartKind; part }` / `{ value; label; startDate: Date; endDate: Date }` | `yearPart.ts` |

## SgAutocomplete

Fonte: `src/inputs/SgAutocomplete.tsx`. É um componente genérico, `SgAutocomplete<T = SgAutocompleteItem>`. O input é um `SgInputText`, e a lista é renderizada por portal em `document.body` (`position: fixed`, `z-[1100]`).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `value` | `string` | — | Não | Texto exibido (controlado). |
| `onChange` | `((value: string) => void)` | — | Não | Texto confirmado: label (ou `formatSelection`) ao selecionar; durante digitação emite `""` (ou o texto, se `allowCustomValue`). |
| `source` | `SgAutocompleteSource<T>` | — | Sim | `(query) => T[] \| Promise<T[]>`. |
| `mapItem` | `((raw: T) => SgAutocompleteItem)` | identidade | Não | Converte o item cru `T` em `SgAutocompleteItem` (`{id, label, value?, group?, disabled?, data?}`). |
| `minLengthForSearch` | `number` | `2` | Não | Caracteres mínimos para buscar. |
| `delay` | `number` | `300` | Não | Debounce da busca em ms. |
| `maxResult` | `number` | `50` | Não | Máximo de itens exibidos. |
| `cacheEnabled` | `boolean` | `true` | Não | Cache em memória por query. |
| `cacheTTL` | `number` | `300000` (5 min) | Não | Validade do cache em ms. |
| `showDropDownButton` | `boolean` | `false` | Não | Botão chevron que lista o catálogo inteiro. |
| `openOnFocus` | `boolean` | `false` | Não | Abre a lista já no primeiro caractere digitado, sem esperar `minLengthForSearch`. |
| `clearOnSelect` | `boolean` | `false` | Não | Limpa o texto após selecionar (emite `""`). |
| `allowCustomValue` | `boolean` | `false` | Não | Aceita texto livre; se `false`, texto não selecionado é revertido para a última seleção (ou `""`) ao sair. |
| `grouped` | `boolean` | `false` | Não | Agrupa por `item.group`. |
| `groupped` | `boolean` | `false` | Não | Alias legado (grafia antiga) de `grouped`. |
| `placeholderEmpty` | `string` | i18n `components.autocomplete.empty` | Não | Texto de lista vazia. |
| `loadingText` | `string` | i18n `components.autocomplete.loading` | Não | Texto de carregamento. |
| `onSelect` | `((item: SgAutocompleteItem) => void)` | — | Não | Recebe o `SgAutocompleteItem` selecionado. |
| `onSearch` | `((query: string) => void)` | — | Não | Recebe a query pesquisada. |
| `onOpenChange` | `((open: boolean) => void)` | — | Não | Abertura/fechamento da lista. |
| `renderItem` | `((item: SgAutocompleteItem, isActive: boolean) => ReactNode)` | — | Não | Render customizado do item. |
| `renderGroupHeader` | `((group: string) => ReactNode)` | — | Não | Render do cabeçalho de grupo. |
| `renderFooter` | `((query: string, hasResults: boolean) => ReactNode)` | — | Não | Rodapé da lista `(query, hasResults)`. |
| `renderEmpty` | `((query: string) => ReactNode)` | — | Não | Render de lista vazia. |
| `formatSelection` | `((item: SgAutocompleteItem) => string)` | `item.label` | Não | Texto colocado no input ao selecionar. |
| `renderValue` | `((item: SgAutocompleteItem \| null) => ReactNode)` | — | Não | Render sobreposto do item selecionado (texto do input fica transparente). |
| `itemTooltip` | `((item: SgAutocompleteItem) => ReactNode)` | — | Não | Tooltip à direita do item no hover. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (45):** `required`, `maxLength`, `minLength`, `name`, `control`, `register`, `rules`, `error`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onEnter`, `onExit`, `onClear`, `withBorder`, `borderRadius`, `requiredMessage`, `showCharCounter`, `iconButtons`, `readOnly`, `validation`, `validateOnBlur`, `onValidation`.

**Removidas do contrato base:** nenhuma.

- **Valor:** é **texto**, não id. O `onChange` e o campo RHF recebem o label selecionado, ou o retorno de `formatSelection`. Para obter o objeto, use `onSelect(item)`. **Confirmado**.
- **RHF:**
  - `control`: usa `Controller`, com `value = field.value ?? ""` e `mergeRequiredRule`.
  - `register`: repassa `name`/`register`/`rules` ao `SgInputText`, que registra o input de texto.
  - O teste `tests/rhf-components-contract.test.mjs` cobre os dois caminhos.
- **Teclado:** ↓/↑ navegam, Enter seleciona e Esc fecha, mas só com a lista aberta. Fora da lista não há atalhos.
- **Acessibilidade:**
  - O botão dropdown tem `aria-label` = i18n `components.actions.openList`.
  - Não há `role="combobox"`/`listbox`/`option` nem `aria-activedescendant`.
- **Testes DOM:**
  - texto digitado preservado;
  - texto arbitrário não confirmado sem `allowCustomValue`;
  - botão dropdown lista tudo após uma seleção;
  - botão dropdown mantém o filtro digitado.

**Confirmado**.

## SgCombobox

Fonte: `src/inputs/SgCombobox.tsx`. É um componente genérico, `SgCombobox<T = SgAutocompleteItem>`. Funciona como um select: o `SgInputText` fica sempre `readOnly`, com `clearButton={false}` e um chevron.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `source` | `SgComboboxSource<T>` | — | Sim | Array de `T` ou função `(query) => T[] \| Promise<T[]>` (chamada com `""`). |
| `value` | `ComboboxValue` | — | Não | `id` selecionado (`string \| number \| null`); controlado quando definido. |
| `onValueChange` | `((value: ComboboxValue) => void)` | — | Não | Recebe o `id` do item selecionado. |
| `mapItem` | `((raw: T) => SgAutocompleteItem)` | mapeador padrão | Não | Padrão: strings/números viram `{id,label}`; objetos usam `id ?? value ?? key ?? label` e `label ?? name ?? description ?? title`. |
| `grouped` | `boolean` | `false` | Não | Agrupa por `group`. |
| `groupped` | `boolean` | `false` | Não | Alias legado de `grouped`. |
| `loadingText` | `string` | i18n `components.autocomplete.loading` | Não | Texto de carregamento. |
| `emptyText` | `string` | i18n `components.autocomplete.empty` | Não | Texto de lista vazia. |
| `onSelect` | `((value: T) => void)` | — | Não | Recebe o item CRU `T` selecionado (inclusive por type-ahead). |
| `renderItem` | `((item: SgAutocompleteItem, isActive: boolean) => ReactNode)` | — | Não | Render do item. |
| `renderValue` | `((item: SgAutocompleteItem \| null) => ReactNode)` | — | Não | Render sobreposto do valor. |
| `renderGroupHeader` | `((group: string) => ReactNode)` | — | Não | Render de cabeçalho de grupo. |
| `renderFooter` | `((query: string, hasResults: boolean) => ReactNode)` | — | Não | Rodapé (`query` sempre `""`). |
| `itemTooltip` | `((item: SgAutocompleteItem) => ReactNode)` | — | Não | Tooltip do item. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>` (somente leitura) interno. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (39):** `required`, `maxLength`, `minLength`, `name`, `control`, `rules`, `error`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `filled`, `enabled`, `textInputType`, `onEnter`, `onExit`, `onClear`, `withBorder`, `borderRadius`, `requiredMessage`, `showCharCounter`, `validation`, `validateOnBlur`, `onValidation`.

**Removidas do contrato base (`Omit`) (5):** `type`, `clearButton`, `onChange`, `iconButtons`, `readOnly`.

- **Valor:** é o **`id`** do item (`string | number | null`). `onSelect` entrega o objeto cru `T`. **Confirmado**.
- **Type-ahead:** com o campo focado, digitar seleciona o primeiro label que começa com o texto acumulado. O buffer zera depois de 700 ms (`TYPEAHEAD_RESET_MS`). **Confirmado**.
- **Teclado:**
  - ↓/↑ abrem a lista ou navegam nela.
  - Enter/Espaço abrem a lista ou selecionam.
  - Esc e Tab fecham.

  **Confirmado** (`onKeyDown` em `SgCombobox.tsx`).
- **RHF:**
  - Só `control`+`name` integram. O `field.value` é o id.
  - `rules` são repassadas **sem** `mergeRequiredRule`: `required` não vira regra automaticamente.
  - Para formulário, use `control` + `name`.

  **Confirmado**.
- **Acessibilidade:** o chevron tem `aria-label` traduzido. Não há roles ARIA de combobox/listbox.

## SgCheckboxGroup

Fonte: `src/inputs/SgCheckboxGroup.tsx`. O grupo é renderizado dentro de um `SgGroupBox`. Usa `forwardRef<SgCheckboxGroupRef>`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Usado como `name` dos checkboxes quando `name` ausente. |
| `title` | `string` | — | Não | Título do `SgGroupBox` (ganha ` *` se `required`). |
| `source` | `SgCheckboxGroupOption[]` | — | Sim | Opções `{label, value, checked?, icon?, disabled?}`; `checked` define o valor inicial não controlado. |
| `value` | `(string \| number)[]` | — | Não | Valores marcados (controlado). |
| `orientation` | `SgCheckboxGroupOrientation` | `"vertical"` | Não | `vertical` ou `horizontal`. |
| `selectionStyle` | `SgCheckboxGroupSelectionStyle` | `"checkbox"` | Não | `checkbox` ou `highlight` (lista com destaque). |
| `iconOnly` | `boolean` | `false` | Não | Mostra só o ícone. |
| `disabled` | `boolean` | `false` | Não | Desabilita tudo. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `required` | `boolean` | `false` | Não | Asterisco no título, `aria-required` e regra `required` no RHF. |
| `onChange` | `((value: (string \| number)[]) => void)` | — | Não | Recebe o array de valores marcados. |
| `showCheckAll` | `boolean` | `false` | Não | Mostra "selecionar todos" (só opções habilitadas). |
| `checkAllLabel` | `string` | i18n `components.checkboxgroup.checkAll` | Não | Rótulo do selecionar todos. |
| `checkAllIcon` | `ReactNode` | — | Não | Ícone do selecionar todos. |
| `className` | `string` | `""` | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo do wrapper. |
| `optionClassName` | `string` | `""` | Não | Classes de cada opção. |
| `groupBoxProps` | `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })` | `{}` | Não | Props repassadas ao `SgGroupBox` (`title` aqui tem precedência sobre `title`). |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro exibido abaixo do grupo (com `control`, combinado com `fieldState.error`). |

**Ref (`SgCheckboxGroupRef`)**:

| Método | Efeito |
|---|---|
| `getChecked(): (string \| number)[]` | Valores marcados. |
| `setChecked(values)` | Define os marcados e dispara `onChange`. |
| `checkAll()` | Marca todas as opções habilitadas. |
| `clearAll()` | Desmarca tudo. |

- **RHF:** `control` tem precedência sobre `register` e usa `mergeRequiredRule`.
  - **No caminho `control`, o ref imperativo não é ligado**: o componente base é chamado com `imperativeRef` `undefined`.
  - Com `register`, cada `<input type="checkbox">` recebe o `registration`.

  **Confirmado**.
- **Acessibilidade:** container com `role="group"`, mais `aria-disabled`, `aria-readonly` e `aria-required`, sobre inputs nativos.

## SgRadioGroup

Fonte: `src/inputs/SgRadioGroup.tsx`. Usa `SgGroupBox` e **não** tem ref.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Usado como `name` dos radios quando `name` ausente. |
| `title` | `string` | — | Não | Título do `SgGroupBox` (` *` se `required`). |
| `source` | `SgRadioGroupOption[]` | — | Sim | Opções `{label, value, icon?, disabled?}`. |
| `value` | `string \| number` | — | Não | Valor selecionado (controlado). |
| `orientation` | `SgRadioGroupOrientation` | `"vertical"` | Não | `vertical` ou `horizontal`. |
| `selectionStyle` | `SgRadioGroupSelectionStyle` | `"radio"` | Não | `radio` ou `highlight`. |
| `iconOnly` | `boolean` | `false` | Não | Só ícone. |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `required` | `boolean` | `false` | Não | Asterisco, `aria-required` e regra `required` no RHF. |
| `onChange` | `((value: string \| number \| null) => void)` | — | Não | Recebe o valor selecionado (`string \| number \| null`). |
| `className` | `string` | `""` | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo do wrapper. |
| `optionClassName` | `string` | `""` | Não | Classes de cada opção. |
| `groupBoxProps` | `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })` | `{}` | Não | Props do `SgGroupBox`. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro exibido abaixo do grupo. |

- **RHF:** `control` tem precedência, com `mergeRequiredRule`. Com `register`, os `<input type="radio">` recebem o `registration`.
- **Acessibilidade:** `role="radiogroup"`, `aria-disabled`, `aria-readonly`, `aria-required`.

**Confirmado**.

## SgMultiSelect

Fonte: `src/inputs/SgMultiSelect.tsx`, `useSgMultiSelect.ts` e `SgMultiSelectDropdown.tsx`. O gatilho é um `SgInputText` `readOnly`. O texto exibido junta os rótulos selecionados até `summaryThreshold`; acima disso mostra o resumo i18n `components.inputs.multiSelect.summary`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `onExit` | `() => void` | — | Não | Disparado no blur, exceto quando o foco vai para o dropdown/wrapper. |
| `options` | `SgMultiSelectOption[]` | — | Sim | `{label, value, chipLabel?, disabled?}`. |
| `value` | `SgMultiSelectOptionValue[]` | — | Não | Valores selecionados (controlado). |
| `onChange` | `((value: SgMultiSelectOptionValue[]) => void)` | — | Não | Recebe o array de valores selecionados. |
| `searchable` | `boolean` | `false` | Não | Campo de busca no dropdown. |
| `searchPlaceholder` | `string` | — | Não | Placeholder da busca. |
| `clearable` | `boolean` | `false` | Não | Botão limpar seleção. |
| `maxSelected` | `number` | — | Não | Limite de seleção (opções extras ficam bloqueadas). |
| `emptyText` | `string` | i18n `components.autocomplete.empty` | Não | Texto sem opções. |
| `summaryThreshold` | `number` | `2` | Não | Quantos rótulos exibir antes do resumo "N selecionadas" (`components.inputs.multiSelect.summary`). |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (34):** `required`, `name`, `control`, `rules`, `error`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `requiredMessage`, `validation`, `validateOnBlur`, `onValidation`.

**Removidas do contrato base (`Omit`) (8):** `type`, `inputProps`, `maxLength`, `minLength`, `clearButton`, `showCharCounter`, `iconButtons`, `readOnly`.

- **Valor:** `(string | number)[]`. Comparação por `String(a) === String(b)`.
- **RHF:** via `control`+`name`, com `field.value ?? []`. `rules` sem `mergeRequiredRule`.
- **Teclado:**
  - No gatilho: Esc fecha; ↓/Enter/Espaço abrem ou navegam.
  - No dropdown (`useSgMultiSelect`): Esc, Tab, ↑/↓, Enter/Espaço alternam a seleção.
- **Acessibilidade:**
  - Gatilho com `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`.
  - Dropdown com `role="listbox"` e `aria-multiselectable`; opções com `role="option"` e `aria-selected`.
- **Testes DOM:**
  - abre no clique;
  - mantém aberto ao alternar;
  - busca;
  - limpar;
  - `chipLabel` no resumo.

**Confirmado**.

## SgMultiSelectChips

Fonte: `src/inputs/SgMultiSelectChips.tsx`. Mesma lógica e dropdown do `SgMultiSelect`, mas mostra um chip removível por seleção. **Não** herda de `SgInputText`: o tipo é próprio, com `RhfFieldProps`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro abaixo do campo. |
| `id` | `string` | — | Sim | `id` do gatilho. |
| `label` | `string` | — | Não | Rótulo. |
| `labelText` | `string` | — | Não | Rótulo; precedência sobre `label`. |
| `className` | `string` | — | Não | Classes do wrapper. |
| `labelClassName` | `string` | — | Não | Classes do rótulo. |
| `width` | `string \| number` | — | Não | Largura. |
| `borderRadius` | `string \| number` | — | Não | Raio da borda. |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` desabilita. |
| `required` | `boolean` | — | Não | Exibe `*` (não injeta regra RHF). |
| `options` | `SgMultiSelectOption[]` | — | Sim | `{label, value, chipLabel?, disabled?}`; o chip mostra `chipLabel ?? label`. |
| `value` | `SgMultiSelectOptionValue[]` | — | Não | Valores selecionados (controlado). |
| `onChange` | `((value: SgMultiSelectOptionValue[]) => void)` | — | Não | Recebe o array de valores. |
| `searchable` | `boolean` | `false` | Não | Busca no dropdown. |
| `searchPlaceholder` | `string` | — | Não | Placeholder da busca. |
| `clearable` | `boolean` | `false` | Não | Botão limpar seleção. |
| `maxSelected` | `number` | — | Não | Limite de seleção. |
| `emptyText` | `string` | i18n `components.autocomplete.empty` | Não | Texto sem opções. |
| `placeholder` | `string` | i18n `components.inputs.select.placeholder` | Não | Texto sem seleção. |
| `onEnter` | `(() => void)` | — | Não | Chamado ao receber foco. |
| `onExit` | `(() => void)` | — | Não | Chamado ao perder o foco (após a validação). |

- **Acessibilidade:**
  - Gatilho com `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`.
  - Remover chip tem `aria-label` = i18n `components.inputs.multiSelect.removeChip`.
  - Limpar e abrir usam as chaves `components.actions.*`.
- **Testes DOM:** chip por seleção, remoção, limpar, busca, `chipLabel` no chip e `label` no `title`, abertura pelo chevron.

**Confirmado**.

## SgOrderList

Fonte: `src/inputs/SgOrderList.tsx`. Lista reordenável por botões, por teclado ou por arrastar e soltar. Usa `forwardRef<SgOrderListRef>`. Os botões são `SgButton`, dentro de um `SgGroupBox`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `error` | `string` | — | Não | Erro exibido acima da lista. |
| `id` | `string` | — | Não | Identificador. |
| `title` | `string` | — | Não | Título do `SgGroupBox`. |
| `source` | `SgOrderListItem[]` | — | Sim | Itens `{label, value, disabled?, icon?, data?}` (estado inicial e ressincronizado quando não controlado). |
| `value` | `SgOrderListItem[]` | — | Não | Ordem controlada. |
| `onChange` | `((items: SgOrderListItem[]) => void)` | — | Não | Recebe o array reordenado. |
| `selectedValues` | `(string \| number)[]` | — | Não | Seleção controlada (valores). |
| `onSelectionChange` | `((values: (string \| number)[]) => void)` | — | Não | Recebe os valores selecionados. |
| `selectionMode` | `SgOrderListSelectionMode` | `"multiple"` | Não | `single` ou `multiple`. |
| `showControls` | `boolean` | `true` | Não | Botões Topo/Subir/Descer/Base. |
| `controlsPosition` | `SgOrderListControlsPosition` | `"left"` | Não | `left` ou `right`. |
| `draggable` | `boolean` | `true` | Não | Arrastar e soltar. |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `emptyMessage` | `string` | i18n `components.orderlist.empty` | Não | Texto de lista vazia. |
| `itemTemplate` | `((item: SgOrderListItem, state: { index: number; selected: boolean; disabled: boolean; }) => ReactNode)` | — | Não | Render do item `(item, {index, selected, disabled})`. |
| `className` | `string` | `""` | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo do wrapper. |
| `listClassName` | `string` | `""` | Não | Classes da lista. |
| `itemClassName` | `string` | `""` | Não | Classes do item. |
| `groupBoxProps` | `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })` | `{}` | Não | Props do `SgGroupBox`. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

**Ref (`SgOrderListRef`)**: `getItems()`, `setItems(items)`, `getSelection()`, `setSelection(values)`, `moveTop()`, `moveUp()`, `moveDown()`, `moveBottom()`, `clearSelection()`.

- **Teclado no item:**
  - Espaço/Enter selecionam.
  - Ctrl/⌘+↑/↓ sobem ou descem.
  - Ctrl/⌘+Home/End levam ao topo ou à base.
- **Acessibilidade:** `role="listbox"`, `aria-multiselectable`, itens `<button role="option" aria-selected>`, botões com `aria-label` i18n `components.orderlist.move*`.
- **RHF:** só `control`+`name`. O campo guarda o **array de itens**, não os valores.

**Confirmado**.

## SgPickList

Fonte: `src/inputs/SgPickList.tsx`. Duas listas, origem e destino, com transferência, reordenação, filtro e arrastar e soltar. Usa `forwardRef<SgPickListRef>`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `error` | `string` | — | Não | Erro exibido. |
| `id` | `string` | — | Não | Identificador. |
| `title` | `string` | — | Não | Título do `SgGroupBox`. |
| `source` | `SgPickListItem[]` | — | Sim | Itens da lista de origem (estado inicial não controlado). |
| `target` | `SgPickListItem[]` | — | Sim | Itens da lista de destino. |
| `value` | `SgPickListValue` | — | Não | `{source, target}` controlado. |
| `onChange` | `((event: SgPickListChangeEvent) => void)` | — | Não | Recebe `SgPickListChangeEvent` = `{source, target, type}`. |
| `sourceSelection` | `(string \| number)[]` | — | Não | Seleção controlada da origem. |
| `targetSelection` | `(string \| number)[]` | — | Não | Seleção controlada do destino. |
| `onSourceSelectionChange` | `((values: (string \| number)[]) => void)` | — | Não | Seleção da origem mudou. |
| `onTargetSelectionChange` | `((values: (string \| number)[]) => void)` | — | Não | Seleção do destino mudou. |
| `selectionMode` | `SgPickListSelectionMode` | `"multiple"` | Não | `single` ou `multiple`. |
| `sourceHeader` | `string` | i18n `components.picklist.sourceHeader` | Não | Cabeçalho da origem. |
| `targetHeader` | `string` | i18n `components.picklist.targetHeader` | Não | Cabeçalho do destino. |
| `showTransferControls` | `boolean` | `true` | Não | Botões de transferência. |
| `showSourceControls` | `boolean` | `true` | Não | Botões de ordenação da origem. |
| `showTargetControls` | `boolean` | `true` | Não | Botões de ordenação do destino. |
| `showSourceFilter` | `boolean` | `false` | Não | Filtro na origem. |
| `showTargetFilter` | `boolean` | `false` | Não | Filtro no destino. |
| `sourceFilterPlaceholder` | `string` | i18n `components.picklist.sourceFilterPlaceholder` | Não | Placeholder do filtro de origem. |
| `targetFilterPlaceholder` | `string` | i18n `components.picklist.targetFilterPlaceholder` | Não | Placeholder do filtro de destino. |
| `filterMatchMode` | `SgPickListFilterMatchMode` | `"contains"` | Não | `contains`, `startsWith`, `endsWith`. |
| `draggable` | `boolean` | `true` | Não | Arrastar e soltar entre/dentro das listas. |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `emptyMessage` | `string` | i18n `components.picklist.empty` | Não | Texto de lista vazia. |
| `itemTemplate` | `((item: SgPickListItem, state: { index: number; selected: boolean; disabled: boolean; list: SgPickListListName; }) => ReactNode)` | — | Não | Render `(item, {index, selected, disabled, list})`. |
| `className` | `string` | `""` | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo. |
| `listClassName` | `string` | `""` | Não | Classes das listas. |
| `itemClassName` | `string` | `""` | Não | Classes dos itens. |
| `groupBoxProps` | `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })` | `{}` | Não | Props do `SgGroupBox`. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

- **Ref (`SgPickListRef`):** `getValue()`, `setValue(value)` (emite `onChange` com `type: "dragdrop"`), `moveToTarget()`, `moveAllToTarget()`, `moveToSource()`, `moveAllToSource()`, `clearSelection()`.
- **Evento:** `onChange({ source, target, type })`. No RHF, `field.onChange({ source, target })`, sem o `type`.
- **Acessibilidade:** cada lista tem `role="listbox"`; itens `<button role="option" aria-selected>`. Os botões têm `aria-label` traduzido (`components.picklist.*`, `components.orderlist.*`). Não há atalhos de teclado além do clique nativo nos botões.

**Confirmado**.

## SgPeriodSelector

Fonte: `src/inputs/SgPeriodSelector.tsx`. É um `SgCombobox` agrupado com presets temporais. Com `CUSTOM` aparecem dois `SgInputDate`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | `"sg-period-selector"` | Não | Id do combo; datas customizadas usam `<id>-custom-start`/`-end`. |
| `label` | `string` | — | Não | Rótulo. |
| `value` | `PeriodPreset` | — | Não | Preset selecionado (`PeriodPreset`), controlado. |
| `onChange` | `((period: ResolvedPeriod) => void)` | — | Não | Recebe `ResolvedPeriod` `{preset, label, startDate, endDate}`. Não dispara na montagem. |
| `permitPast` | `boolean` | `true` | Não | Grupo LAST_*. |
| `permitCurrent` | `boolean` | `true` | Não | Grupo THIS_*, TODAY, YESTERDAY. |
| `permitFuture` | `boolean` | `true` | Não | Grupo TOMORROW, NEXT_*. |
| `permitAll` | `boolean` | `true` | Não | Opção ALL (datas nulas). |
| `allowCustomPeriod` | `boolean` | `true` | Não | Opção CUSTOM com dois `SgInputDate`. |
| `locale` | `string` | `"pt-BR"` | Não | Locale dos rótulos (independe do provider i18n). |
| `disabled` | `boolean` | — | Não | Desabilita. |
| `required` | `boolean` | — | Não | Repassado ao `SgCombobox` (asterisco). |
| `minDate` | `Date` | — | Não | Clamp do início do intervalo. |
| `maxDate` | `Date` | — | Não | Clamp do fim do intervalo. |
| `referenceDate` | `Date` | `new Date()` | Não | Data de referência dos presets. |
| `className` | `string` | — | Não | Classes do wrapper (`max-w-[18rem]`). |
| `error` | `string` | — | Não | Erro. |
| `control` | `Control<FieldValues>` | — | Não | RHF: o campo guarda o `preset` (string), não o intervalo. |
| `name` | `string` | — | Não | Nome RHF. |
| `rules` | `RegisterOptions` | — | Não | Regras RHF. |

**Presets (`PeriodPreset`)**:
- `ALL`, `CUSTOM`;
- `TODAY`, `YESTERDAY`, `TOMORROW`;
- `THIS_` / `LAST_` / `NEXT_` combinados com `WEEK`, `QUINZENA`, `MONTH`, `QUARTER`, `SEMESTER` e `YEAR`.

Convenções do `resolvePeriod` (cobertas por `tests/period-resolver.test.mjs`; **Confirmado**):
- A semana começa na **segunda-feira**.
- A quinzena é de calendário: dias 1–15 e 16–fim do mês.
- `startDate` = 00:00:00.000 local; `endDate` = 23:59:59.999 local.
- `ALL`/`CUSTOM` devolvem datas `null`.
- `minDate`/`maxDate` fazem clamp.

Mais detalhes:
- **i18n:** os rótulos têm tabela própria, em ASCII e sem o provider: `pt-BR`, `en-US`, `es`, `pt-PT`, `fr`.
- **RHF:** só `control`. O campo guarda o **`PeriodPreset`**; o intervalo resolvido sai em `onChange`.
- **CUSTOM:** emite um novo `ResolvedPeriod` a cada mudança nas datas. Datas incompletas (ano < 1000) viram `null`.

**Confirmado**.

## SgYearPartSelector

Fonte: `src/inputs/SgYearPartSelector.tsx` + `yearPart.ts`. Tem três `SgCombobox` (ano, recorte, fatia) e responde a "o 1º semestre de 2024", enquanto o `SgPeriodSelector` responde a "este semestre". **Sem integração RHF**: o tipo não tem `control`/`name`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | `"sg-year-part-selector"` | Não | Prefixo dos ids dos três combos (`-year`, `-kind`, `-part`). |
| `label` | `string` | — | Não | Rótulo do grupo. |
| `value` | `YearPartValue` | — | Não | `YearPartValue` `{year, kind, part}` controlado. |
| `onChange` | `((resolved: ResolvedYearPart) => void)` | — | Não | Recebe `ResolvedYearPart` `{value, label, startDate, endDate}` (datas nunca nulas). Não dispara na montagem. |
| `allowedKinds` | `YearPartKind[]` | os três (`SEMESTER`, `QUARTER`, `BIMESTER`) | Não | Recortes oferecidos; com um só, o combo de recorte some. Array vazio → padrão. |
| `minYear` | `number` | ano atual − 30 | Não | Primeiro ano da lista. |
| `maxYear` | `number` | ano atual + 10 | Não | Último ano. |
| `locale` | `string` | `"pt-BR"` | Não | Locale dos rótulos. |
| `disabled` | `boolean` | — | Não | Desabilita os três combos. |
| `required` | `boolean` | — | Não | Asterisco no rótulo e nos combos. |
| `className` | `string` | — | Não | Classes do wrapper. |

- **Estado inicial:** ano corrente, primeiro recorte permitido, fatia de hoje.
- **Normalização:** um `value` controlado inconsistente é ajustado com `clampYearPart`, e um recorte fora de `allowedKinds` vira o primeiro permitido.
- **Testes:** `tests/year-part-resolver.test.mjs` cobre fatias, ano bissexto, clamp, rótulos por locale e `yearPartOf`.

**Confirmado**.

## SgToggleSwitch

Fonte: `src/inputs/SgToggleSwitch.tsx`. É um `<input type="checkbox" role="switch">` estilizado.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro (ligado a `aria-describedby`). |
| `id` | `string` | — | Sim | `id` do `<input type="checkbox" role="switch">`. |
| `label` | `string` | — | Não | Rótulo visível; sem ele usa `aria-label` i18n `components.inputs.toggle.ariaLabel`. |
| `description` | `string` | — | Não | Texto secundário abaixo do rótulo. |
| `className` | `string` | — | Não | Classes do wrapper. |
| `labelClassName` | `string` | — | Não | Classes do rótulo. |
| `switchClassName` | `string` | — | Não | Classes do container do switch. |
| `trackClassName` | `string` | — | Não | Classes do trilho. |
| `thumbClassName` | `string` | — | Não | Classes do botão deslizante. |
| `onIcon` | `ReactNode` | — | Não | Ícone ligado. |
| `offIcon` | `ReactNode` | — | Não | Ícone desligado. |
| `checked` | `boolean` | — | Não | Controlado. |
| `defaultChecked` | `boolean` | `false` | Não | Valor inicial não controlado. |
| `width` | `string \| number` | — | Não | Largura do wrapper. |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` desabilita. |
| `readOnly` | `boolean` | — | Não | Impede alteração. |
| `required` | `boolean` | `false` | Não | Exige ligado (`true`); injeta `required` nas rules RHF. |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `validation` | `((checked: boolean) => string \| null)` | — | Não | `(checked) => string \| null`. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `onChange` | `((checked: boolean) => void)` | — | Não | Recebe `checked: boolean`. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>` (aceita `checked`/`defaultChecked` como alternativa). |

- **Valor:** `boolean`. O valor do RHF é convertido por `toBoolean`, que aceita `"true"`, `"1"`, `"on"`, `"yes"` e números ≠ 0.
- **RHF:** `register` ou `control`, com `mergeRequiredRule`.
- **Acessibilidade:** `role="switch"`, `aria-invalid`, `aria-describedby` apontando para `<id>-error`. Sem rótulo visível, usa o `aria-label` traduzido (coberto por `tests/inputs-i18n.test.mjs`).

**Confirmado**.

## SgRating

Fonte: `src/inputs/SgRating.tsx`. Estrelas em SVG, com meia estrela opcional.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `label` | `string` | — | Não | Rótulo. |
| `value` | `number` | `0` | Não | Valor (sincroniza o estado interno quando muda). |
| `stars` | `number` | `5` | Não | Quantidade de estrelas. |
| `allowHalf` | `boolean` | `false` | Não | Meia estrela. |
| `cancel` | `boolean` | `true` | Não | Botão para zerar. |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `size` | `SgRatingSize` | `"md"` | Não | `sm`=16, `md`=24, `lg`=32, `xl`=40 px. |
| `className` | `string` | `""` | Não | Classes. |
| `style` | `CSSProperties` | — | Não | Estilo. |
| `onIcon` | `ReactNode` | — | Não | Ícone cheio. |
| `offIcon` | `ReactNode` | — | Não | Ícone vazio. |
| `cancelIcon` | `ReactNode` | — | Não | Ícone do cancelar. |
| `color` | `string` | `hsl(var(--primary))` | Não | Cor cheia. |
| `emptyColor` | `string` | `hsl(var(--muted-foreground))` | Não | Cor vazia. |
| `showTooltip` | `boolean` | `false` | Não | Tooltip com o valor no hover. |
| `onChange` | `((value: number) => void)` | — | Não | Recebe o número (0 ao cancelar). |
| `onHover` | `((value: number \| null) => void)` | — | Não | Recebe o valor em hover ou `null`. |
| `required` | `boolean` | `false` | Não | Valida 0 após interação (`components.rating.required`) e injeta regra RHF. |
| `requiredMessage` | `string` | i18n `components.rating.required` | Não | Mensagem. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro. |

- **RHF:** via `control` + `name`, com `mergeRequiredRule`.
- **Validação:** a regra de obrigatório interna só é avaliada em clique ou cancelamento.
- **Acessibilidade:**
  - O botão cancelar tem `title` traduzido (`components.rating.cancel`).
  - As estrelas são `div` clicáveis, sem `role`, `tabIndex` ou teclado, ou seja, não são acessíveis por teclado.

**Confirmado** pela ausência no código.

## SgSlider

Fonte: `src/inputs/SgSlider.tsx`. É um `<input type="range">` nativo.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | `id` do `<input type="range">`. |
| `minValue` | `number` | — | Sim | Mínimo (não finito → 0). |
| `maxValue` | `number` | — | Sim | Máximo (ajustado para ≥ min). |
| `value` | `number` | — | Não | Controlado (clamp em min..max). |
| `defaultValue` | `number` | `minValue` | Não | Inicial não controlado. |
| `step` | `number` | `1` | Não | Passo (≤ 0 → 1). |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `onChange` | `((value: number) => void)` | — | Não | Recebe o número (clamp). |
| `ariaLabel` | `string` | — | Não | `aria-label` do range. |
| `className` | `string` | — | Não | Classes do `<input>`. |
| `width` | `string \| number` | — | Não | Largura do wrapper. |
| `error` | `string` | — | Não | Erro (`aria-invalid`). |
| `inputProps` | `SliderInputProps` | — | Não | Atributos do `<input>` (sem `type/id/min/max/step/value/defaultValue/disabled/aria-label`). Espalhados por último: um `onChange` aqui SUBSTITUI o handler interno (Inferência; afeta o caminho `register`). |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

- **RHF:** `register` ou `control`, sem `mergeRequiredRule` (o tipo não tem `required`). Com `control`, `value = field.value`, convertido para número.
- **Possível defeito (Inferência pela ordem do JSX):** `{...inputProps}` vem depois do `onChange` interno.
  - No caminho `register`, o `inputProps.onChange` (que chama `reg.onChange`) substitui o handler interno.
  - Nesse caso o estado interno e a prop `onChange` deixam de ser atualizados, e o range controlado pode não se mover.
  - Não verificado em runtime.
- **Acessibilidade:** `aria-label` via `ariaLabel`, `aria-invalid` com erro.

## SgStepperInput

Fonte: `src/inputs/SgStepperInput.tsx`. Usa `<input type="number">` e dois botões, aumentar e diminuir.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | `id` do `<input type="number">`. |
| `minValue` | `number` | — | Sim | Mínimo. |
| `maxValue` | `number` | — | Sim | Máximo. |
| `step` | `number` | `1` | Não | Passo dos botões. |
| `value` | `number` | — | Não | Controlado. |
| `defaultValue` | `number` | `minValue` | Não | Inicial não controlado. |
| `disabled` | `boolean` | `false` | Não | Desabilita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura (botões desativados). |
| `onChange` | `((value: number) => void)` | — | Não | Recebe o número (clamp). |
| `ariaLabel` | `string` | — | Não | `aria-label` do input. |
| `className` | `string` | — | Não | Classes do container. |
| `inputClassName` | `string` | — | Não | Classes do `<input>`. |
| `width` | `string \| number` | — | Não | Largura. |
| `error` | `string` | — | Não | Erro (`aria-invalid`, borda vermelha). |
| `inputProps` | `StepperInputProps` | — | Não | Atributos do `<input>`; espalhados por último (um `onChange` aqui substitui o interno — Inferência). |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

- **RHF:** `register` ou `control`.
- **Ressalva com `register` (Inferência):**
  - Os botões chamam só `onChange` (a prop), não o `register`.
  - O `{...inputProps}` espalhado por último sobrescreve o `onChange` interno do `<input>`.
- **Acessibilidade:** botões com `aria-label` i18n `components.inputs.stepper.increase` e `components.inputs.stepper.decrease`; `aria-invalid` no input.

## Fontes

- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/{SgAutocomplete,SgCombobox,SgCheckboxGroup,SgRadioGroup,SgMultiSelect,SgMultiSelectChips,SgMultiSelectDropdown,SgOrderList,SgPickList,SgPeriodSelector,SgYearPartSelector,SgToggleSwitch,SgRating,SgSlider,SgStepperInput}.tsx`, `useSgMultiSelect.ts`, `yearPart.ts`
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/index.ts` (exportações)
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/tests/{inputs-dom,inputs-i18n,rhf-components-contract,period-resolver,year-part-resolver}.test.mjs` (lidos; **não executados**)
