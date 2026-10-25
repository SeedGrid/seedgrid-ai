---
description: "Tabela de tradução React → Dart dos componentes SeedGrid, em perguntas e respostas: nomes, props, eventos, enums, formulário (SgForm no lugar do react-hook-form), tabela, diálogo, toast e as divergências deliberadas, cada regra com a origem (ADR, arquivo e símbolo)."
tags: [seedgrid, front, component, flutter, dart, traducao, formulario, perguntas-e-respostas]
fonte: front/seedgrid-fe-flutter/docs/TABELA_DE_TRADUCAO.md
branch: main
commit: 2e33260
analisado-em: 2026-10-25
---

# Tradução React → Dart

> **Status: NÃO PUBLICADO.** Cópia organizada de `docs/TABELA_DE_TRADUCAO.md` do repositório `seedgrid-fe-flutter` (commit `2e33260`); a regra de cada linha cita a origem. Contexto: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]] · API: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]]. As linhas marcadas **(T8.2)** foram acrescentadas depois de portar três telas reais (formulário, tabela com filtro, diálogo) em `apps/seedgrid_showcase/test/familiarity/`. Caminhos abaixo são relativos a `packages/seedgrid_components/lib/src/`.

## Como escrevo em Dart o que escrevo no React?

| React | Dart | Origem |
|---|---|---|
| `<SgButton>`, `<SgInputText>`… | mesmo nome de widget, mesmas props e valores | README; ADR 50 |
| `onChange`, `onSelect`, `onClick` | mesmo nome (`onChange`, **não** `onChanged`) | ADR 50 item 1 |
| `disabled` | `disabled` | ADR 50 item 2 |
| `enabled={x}` (alguns inputs) | `disabled: !x` | ADR 50 item 2 |
| `className`, `style` | não existem; use `width`, `height`, `padding`, `customColors`… | ADR 50 item 5 |
| `width`, `height`, `padding` | mesmos nomes; `num` (px) ou texto `'Npx'`, `'N%'`, `'Nrem'` conforme o componente | ADR 50 item 5; `layout/basic/sg_grid.dart`, `sg_group_box.dart` |
| string literal (`severity="danger"`) | enum (`SgSeverity.danger`) | ADR 50 item 3; `generated/enums.g.dart` |
| `children` | `child` (um filho) ou `children` (lista), conforme o widget | ADR 50 item 4 |
| `React.ReactNode` | `Widget` | ADR 50 item 4; `overlay/sg_confirmation_dialog.dart` |
| `ref` | `controller` (ex.: `SgDatatableController`) ou `GlobalKey` | ADR 50 item 4; `inputs/datatable/sg_datatable.dart` |
| `inputProps` (atributos do `<input>`) | props nomeadas (`keyboardType`, `inputFormatters`, `autofocus`, `textInputAction`, `autofillHints`, `obscureText`); `inputProps` é aceito e ignorado | ADR 50 item 6; `inputs/sg_input_text.dart` |
| `label`, `labelText`, `hintText`, `prefixText`, `suffixText`, `elevation`, `filled`, `clearButton` | mesmos nomes; `label`/`labelText` são `String?` | ADR 50 item 7; `generated/sg_input_text.g.dart` |
| `<SgButton>texto</SgButton>` | `SgButton(child: Text('texto'))` ou `label: Text('texto')`; `child` vence `label` | `buttons/sg_button.dart` |
| `columns={{ base: 1, sm: 2 }}` no `SgGrid` | `columns: {'base': 1, 'sm': 2}` (`Object?`: int ou `Map<String,int>`) | `layout/basic/sg_grid.dart` |
| `<div className="sm:col-span-2">` dentro do `SgGrid` | `SgPanel(span: 2, children: [...])` | `layout/basic/sg_grid.dart` |

## E o formulário (react-hook-form → SgForm)?

Contrato próprio, sem dependência externa: `SgForm` + `SgFormController` + `SgRules`; o campo se liga por `name` + `control` (ADR 49).

| React | Dart | Origem |
|---|---|---|
| `useForm({ defaultValues })` | `SgFormController(defaultValues: {...})` | ADR 49; `form/sg_form.dart` |
| `control={control}` e `name="x"` | `control: form`, `name: 'x'` | ADR 49 item 3 |
| `register={register}` | **não existe** (todo campo é controlado) | ADR 49 item 4 |
| `rules={{ required: 'msg', maxLength: {value: 10, message: 'm'} }}` | `rules: SgRules(required: 'msg', maxLength: SgRuleValue(10, 'm'))` | ADR 49 item 2; `form/sg_rules.dart` |
| `required` no componente | `required: true` (+ `requiredMessage`); vira a regra com mensagem i18n | ADR 49 item 5; `mergeRequiredRule` |
| `watch("x")` | `form.watch('x')` (só lê); para redesenhar use `ListenableBuilder(listenable: form, ...)` | `form/sg_form.dart` |
| `watch()` / `getValues()` | `form.getValues()` (mapa imutável) | `form/sg_form.dart` |
| `setValue`, `reset`, `trigger`, `setError`, `clearErrors` | mesmos nomes; `setValue` e `trigger` devolvem `Future` | `form/sg_form.dart` |
| `formState.errors` / `isSubmitting` / `isValid` / `isDirty` | `form.errors` / `form.isSubmitting` / `form.isValid` / `form.isDirty` | `form/sg_form.dart` |
| `<form onSubmit={handleSubmit(onSubmit)}>` + `<button type="submit">` | `SgForm(controller: form, onValid: onSubmit, child: ...)` + `SgButton(type: SgButtonType.submit)` | `form/sg_form.dart`; `buttons/sg_button.dart` |
| `handleSubmit(onValid, onInvalid)` | `form.handleSubmit(onValid, onInvalid)` **executa na hora** e devolve `Future<void>` (não devolve callback); num botão: `onClick: () => form.handleSubmit(cb)` **(T8.2)** | `form/sg_form.dart`; `test/familiarity/formulario_screen.dart` |
| `onSubmit(data)` recebe objeto | recebe `Map<String, Object?>` | `form/sg_form.dart` (`SgSubmitValid`) |

## E a tabela (SgDatatable)?

| React | Dart | Origem |
|---|---|---|
| linhas `T[]` | `List<Map<String, Object?>>` (`SgDatatableRow`); **não é genérico**, não aceita classes | `inputs/datatable/datatable_types.dart` |
| coluna `{ field, header, sortable, filter }` | `SgDatatableColumn(field:, header:, sortable:, filter:)` (const) | `datatable_types.dart` |
| `align: "right"` | `align: SgDatatableColumnAlign.right` | `datatable_types.dart` |
| `body: (row) => <.../>` | `body: (row, meta) => Widget`; o 2º argumento (`SgDatatableCellMeta`) é obrigatório na assinatura; campo: `row['name']` | `datatable_types.dart` |
| `header` (ReactNode) | `Object`: `String`, `num` ou `Widget` | `datatable_types.dart` |
| campo aninhado `owner.name` | igual, com ponto | `datatable_types.dart` |
| `rowsPerPageOptions={[4, 8]}` | `rowsPerPageOptions: [4, 8]` | `inputs/datatable/sg_datatable.dart` |

## E diálogo e toast?

| React | Dart | Origem |
|---|---|---|
| `<SgConfirmationDialog open onOpenChange title="x" message="y">` | mesmos nomes, mas `title` e `message` são `Widget?`: `title: Text('x')` **(T8.2)** | `overlay/sg_confirmation_dialog.dart` |
| `severity="danger"` no diálogo | `SgDialogSeverity.danger` (enum próprio, tem `plain`; **não** é o `SgSeverity` do botão) **(T8.2)** | `generated/enums.g.dart` |
| `confirmButton={{ label, icon, severity }}` | `SgConfirmationDialogButtonConfig(label: Text(..), icon: Icon(..), severity: SgSeverity.danger)` | `overlay/sg_confirmation_dialog.dart` |
| `toast.success("x")`, `toast.message`, `toast.dismiss()` | iguais (`toast` global); opções: `toast.success('x', SgToastOptions(description: 'y'))` | `feedback/sg_toast.dart` |
| `<SgToaster />` | `SgToaster()` na árvore | `feedback/sg_toaster.dart` |

## Em que o Dart diverge de propósito?

| Assunto | Dart | Origem |
|---|---|---|
| `onChange`/`onValueChange` do usuário dentro de formulário | sempre chamado (o React engole em Combobox, Autocomplete, MultiSelect, Slider) | ADR 52 item 2 |
| validadores do componente (CPF, CNPJ, e-mail, telefone, CEP, datas) | rodam também em `handleSubmit`/`trigger` (no React só no blur) | ADR 52 item 3 |
| campo com valor inicial/`setValue` | mostra sempre o valor mascarado | `docs/VALOR_PROGRAMATICO.md` (D1) |
| breakpoints do `SgGrid` | medem a janela (`MediaQuery`), como o `@media` | `layout/basic/sg_grid.dart` |

## O que a tabela ainda não cobre?

Lacunas registradas no próprio documento de origem (sem regra escrita):
- `useState`/`setState`, `useMemo`, `useEffect`.
- Qual enum usar para cada string literal (compartilhado `SgSeverity`/`SgAppearance`/`SgSize`, ou do componente, como `SgDialogSeverity`, `SgInputTextElevation`): só se descobre em `generated/enums.g.dart`.
- Ícones `lucide-react` → `Icon(Icons.x)`.

O relatório que as discute fica em `seedgrid-platform-work/relatorios/seedgrid-fe-components/2026-10-25-teste-de-familiaridade-flutter.md` (não lido para esta nota).

## Não verificado

- Não conferi cada linha contra o código-fonte Dart; a origem citada é a do `docs/TABELA_DE_TRADUCAO.md`.
- As ADR 49, 50 e 52 foram lidas só por intermédio dessa tabela.
