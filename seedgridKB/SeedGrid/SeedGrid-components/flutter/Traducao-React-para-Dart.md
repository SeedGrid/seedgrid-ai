---
description: "Tabela de tradução React → Dart dos componentes SeedGrid, em perguntas e respostas: nomes, props, eventos, enums, formulário (SgForm no lugar do react-hook-form), tabela, diálogo, toast e as divergências deliberadas, cada regra com a origem (ADR, arquivo e símbolo)."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, traducao, formulario, perguntas-e-respostas]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/docs/TABELA_DE_TRADUCAO.md
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Tradução React → Dart

> **Plataforma: Flutter (traduzindo do React).** **Status: NÃO PUBLICADO** no pub.dev. Cópia organizada de `docs/TABELA_DE_TRADUCAO.md` do repositório `seedgrid-fe-flutter` (commit `e9989b8`; o arquivo não mudou desde `314cb5a`, e conferi no código desse commit que os arquivos e símbolos citados abaixo ainda existem: `sg_form.dart`, `sg_toast.dart`, `datatable_types.dart`, `SgToastOptions`, `dismissSgToast`, `SgFieldValidator`, `SgSubmitValid`, `submitOnEnter`, `mergeRequiredRule`, `resolveFieldError`) e de `docs/DIVERGENCIAS_DO_REACT.md`; a regra de cada linha cita a origem. Escolha entre as plataformas: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]]. Contexto: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]] · API: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]]. As linhas marcadas **(T8.2)** foram acrescentadas depois de portar três telas reais (formulário, tabela com filtro, diálogo) em `apps/seedgrid_showcase/test/familiarity/`; os "ajustes T8.2" (texto como `String` ou `Widget`, Enter envia o `SgForm`, `SgToaster` solto) mudaram a API depois disso e as linhas abaixo já refletem o estado atual. Caminhos abaixo são relativos a `packages/seedgrid_components/lib/src/`.

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
| `React.ReactNode` | `Widget`. Nas props de **texto** o tipo é `Object?` e aceita `String` **ou** `Widget` (`title: 'Delete'` ou `title: Text('Delete')`): `SgButton.label`/`child`, `SgDialog.title`/`subtitle`, `SgConfirmationDialog.title`/`message`/`subtitle`, `SgConfirmationDialogButtonConfig.label`, `SgCard.title`/`description`. Conversão por `sgNode` (`String`/`num` viram `Text`; outro tipo lança `ArgumentError`) **(ajuste T8.2)** | ADR 50 item 4; `props/sg_node.dart`; `tools/gen_props/emit.mjs` (`TEXT_OR_WIDGET`: `SgButton.label`, `SgCard`, `SgConfirmationDialog`, `SgDialog`); `buttons/sg_button.dart` (`child`); `overlay/sg_confirmation_dialog.dart` |
| `ref` | `controller` (ex.: `SgDatatableController`) ou `GlobalKey` | ADR 50 item 4; `inputs/datatable/sg_datatable.dart` |
| `inputProps` (atributos do `<input>`) | props nomeadas (`keyboardType`, `inputFormatters`, `autofocus`, `textInputAction`, `autofillHints`, `obscureText`); `inputProps` é aceito e ignorado | ADR 50 item 6; `inputs/sg_input_text.dart` |
| `label`, `labelText`, `hintText`, `prefixText`, `suffixText`, `elevation`, `filled`, `clearButton` | mesmos nomes; `label`/`labelText` são `String?` | ADR 50 item 7; `generated/sg_input_text.g.dart` |
| `<SgButton>texto</SgButton>` | `SgButton(child: 'texto')` ou `label: 'texto'` (String ou Widget); `child` vence `label` **(ajuste T8.2)** | `buttons/sg_button.dart` (`sgNode(w.child) ?? sgNode(w.label)`); `apps/seedgrid_showcase/test/familiarity/palpites_corrigidos_test.dart` |
| `columns={{ base: 1, sm: 2 }}` no `SgGrid` | `columns: {'base': 1, 'sm': 2}` (`Object?`: int ou `Map<String,int>`) | `layout/basic/sg_grid.dart` |
| `<div className="sm:col-span-2">` dentro do `SgGrid` | `SgPanel(span: 2, borderStyle: SgPanelBorderStyle.none, children: [...])`; o estouro de 20 px com erro de validação no filho foi corrigido no `SgGrid` (linhas automáticas só usam `minHeight`, não altura tight) | `layout/basic/sg_grid.dart` (`SgPanel.span`); `generated/enums.g.dart` (`SgPanelBorderStyle`) |

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
| botão `type="submit"` fora de um `<form>` | `SgButton(type: SgButtonType.submit)` sem `SgForm` ancestral lança `FlutterError` ("precisa estar dentro de um SgForm"); antes não fazia nada **(ajuste T8.2)** | `buttons/sg_button.dart` (usa `SgForm.submitOf`); `form/sg_form.dart` (`submitOf`) |
| Enter num `<input>` dentro do `<form>` envia | `SgForm` envia no Enter de campo de uma linha (`EditableText` com `maxLines == 1`) quando há `SgButton(type: submit)` dentro dele ou `onValid`/`onInvalid`; `SgInputTextArea` (multilinha) não; `submitOnEnter: false` desliga. Só a tecla Enter/numpad Enter (o "concluir" do teclado de tela não é interceptado por este código) **(ajuste T8.2)** | `form/sg_form.dart` (`submitOnEnter`, `_onKey`); `packages/seedgrid_components/test/widgets/sg_familiarity_fixes_test.dart` |
| validador próprio de um campo customizado | `form.registerField('x', rules: ..., initialValue: ..., validator: (value) => 'mensagem' ou null)`; `typedef SgFieldValidator = FutureOr<String?> Function(Object? value)`; `form.unregisterValidator('x', validator)` no `dispose` (só remove se ainda for o mesmo validador). Não existe no react-hook-form | `form/sg_form.dart` (`registerField`, `unregisterValidator`, `SgFieldValidator`); `docs/DIVERGENCIAS_DO_REACT.md` decisão 2 |
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
| `<SgConfirmationDialog open onOpenChange title="x" message="y">` | mesmos nomes e `title: 'x'`, `message: 'y'` (String ou Widget; `Text('x')` também vale) **(ajuste T8.2)** | `overlay/sg_confirmation_dialog.dart`; `generated/sg_confirmation_dialog.g.dart` |
| `severity="danger"` no diálogo | `SgDialogSeverity.danger` (enum próprio, tem `plain`; **não** é o `SgSeverity` do botão) **(T8.2)** | `generated/enums.g.dart` |
| `confirmButton={{ label, icon, severity }}` | `SgConfirmationDialogButtonConfig(label: 'Delete', icon: Icon(..), severity: SgSeverity.danger)` (`label` é `Object?`: String ou Widget; `icon` é `Widget?`) | `overlay/sg_confirmation_dialog.dart` (`SgConfirmationDialogButtonConfig`) |
| `toast.success("x")`, `toast.message`, `toast.dismiss()` | iguais (`toast` global); opções: `toast.success('x', SgToastOptions(description: 'y'))` | `feedback/sg_toast.dart` |
| `<SgToaster />` (fixo na janela) | `SgToaster()` em qualquer lugar: em área limitada (filho de `Stack`) preenche o pai (`SizedBox.expand`); em área ilimitada (`Column`, `ListView`) não ocupa espaço e desenha no `Overlay` da rota **(ajuste T8.2; antes dava "infinite height")**; ou um `SgToastHost` global | `feedback/sg_toaster.dart` (`_SgToasterOverlayLayer`); `apps/seedgrid_showcase/lib/main.dart` (`SgToastHost`) |

## Em que o Dart diverge de propósito?

Decisões do dono de 2026-10-25 (`docs/DIVERGENCIAS_DO_REACT.md`, ADR 52) e demais divergências.

| Assunto | Dart | Origem |
|---|---|---|
| `onChange`/`onValueChange` do usuário dentro de formulário | sempre chamado, esteja o campo ligado ao formulário ou não (o React o troca pelo `field.onChange`: Combobox, Autocomplete, MultiSelect, Slider...). Mudar o valor por fora (`setValue`, `reset`, prop `value`) continua sem chamar `onChange`, como no React. Na varredura só `SgMultiSelect` e `SgMultiSelectChips` ainda engoliam o callback e foram corrigidos | `docs/DIVERGENCIAS_DO_REACT.md` decisão 1; ADR 52 item 2; `test/widgets/sg_multi_select_test.dart` |
| validadores do componente (CPF, CNPJ, e-mail, telefone, CEP, datas, senha, número, OTP...) | `handleSubmit` e `trigger` rodam também o validador do componente, o mesmo do blur; as `rules` rodam primeiro e vencem (erro do validador tem `type: 'validate'`); `trigger()` sem nomes cobre campos com `rules` e com validador; campo desabilitado nunca falha; vazio e não obrigatório não falha; `reset()` limpa os erros. Mecanismo: `SgFormController.registerField(name, validator:)` e `unregisterValidator` | `docs/DIVERGENCIAS_DO_REACT.md` decisão 2; ADR 52 item 3; `form/sg_form.dart`; `test/form/sg_form_component_validators_test.dart` |
| `required` em CPF, CNPJ, CPF/CNPJ, CEP e data de nascimento | o React não repassa `required` ao input interno; no Dart o validador do componente também confere o obrigatório, então "obrigatório e vazio" falha no envio | `docs/DIVERGENCIAS_DO_REACT.md` decisão 2 |
| validação com `validateWithViaCep` / `validateWithPublicaCnpj` ligados | o envio dispara a consulta de rede (memorizada pelo último valor) se o campo ainda não foi validado; validadores assíncronos são aguardados em sequência | `docs/DIVERGENCIAS_DO_REACT.md` ("Riscos conhecidos") |
| campo com valor inicial/`setValue` | mostra sempre o valor mascarado | `docs/VALOR_PROGRAMATICO.md` (D1) |
| valor do campo no `watch()`/`getValues()` | o `Map` guarda o valor **mascarado** (`"(11) 98765-4321"`, `"01310-100"`), como no React (`SgInputPhone` aplica `maskPhone` antes de o RHF ler); a moeda guarda a string numérica (`"0.00"`) via `onExternalChange` (D14, T8.2) | `SgInputPhone.tsx`; `SgInputCurrency.tsx` (conforme `docs/TABELA_DE_TRADUCAO.md`) |
| textos padrão de validação e de ações (`Required field.`, `Search in all columns`, `Clear filters`, `Cancel`/`Confirm`) | idênticos ao React em en-US (D13); o idioma vem do provider de i18n | `src/i18n/en-US.ts` do React |
| `SgInputPassword required` rejeita `Abcdef1!xyz` por sequência crescente | mesmo padrão do React (`prohibitsSequentialAscCharacters` etc. são `true` por padrão lá também, D16); a diferença é só quando roda | `SgInputPassword.tsx` |
| `SgInputText` com `value` | controla o texto (nulo = não controlado); com `name` + formulário o valor do formulário manda e `value` é ignorado, como no React (onde o Controller sobrescreve `inputProps.value`). Se o pai não atualizar `value` após o `onChange`, o texto volta ao anterior | `inputs/sg_input_text.dart` (prop `value`) |
| breakpoints do `SgGrid` | medem a janela (`MediaQuery`), como o `@media` | `layout/basic/sg_grid.dart` |

## Não aplicado de propósito (T8.2, segunda rodada)

O relatório da T8.2 propôs estes ajustes; ficaram de fora e o dev React precisa saber da diferença.

| React | Dart (o que fazer) | Por que não mudou |
|---|---|---|
| `rows: T[]` com classes e `body: (row) => row.name` | `List<Map<String, Object?>>` e `body: (row, meta) => ... row['name']` (os dois parâmetros são obrigatórios) | tornar `SgDatatable` genérico mudaria o contrato gerado e ~20 pontos do componente; aceitar `body` com 1 ou 2 argumentos exigiria `Function` e perderia a checagem do analisador |
| `appearance="outline"`, `size="sm"` em qualquer componente | enum compartilhado quando o alias TS é compartilhado (`SgAppearance`, `SgSeverity`, `SgSize`, `SgElevation`); `Sg<Componente><Prop>` quando a união é inline (`SgInputTextElevation`, `SgDatatableColumnAlign`, `SgPanelBorderStyle`); regra no cabeçalho de `enums.g.dart` | unificar apagaria diferenças reais (ex.: `plain` só existe no diálogo) |
| `severity="danger"` no diálogo | `SgDialogSeverity.danger` (tem `plain`), não `SgSeverity` | o React também tem dois tipos |
| `<form onSubmit={handleSubmit(onSubmit)}>` | `SgForm(controller: form, onValid: onSubmit)` ou `onClick: () => form.handleSubmit(cb)` | `handleSubmit` devolvendo `VoidCallback` mudaria a semântica de quem já usa o `Future` |
| `watch()` / `watch("x")` redesenham sozinhos | `ListenableBuilder(listenable: form, builder: ...)`; `watch('x')` só lê | redesenho automático exigiria o controlador conhecer o `BuildContext`; `SgFormWatch` fica como evolução |
| `columns`, `gap`, `padding`, `width` com string livre | `Object?` (int, `Map` ou texto `'16px'`): erro de digitação não é acusado pelo analisador | o contrato do React é uma união de strings |
| `useState`, `useMemo`, `useEffect` | `setState` e campos do `State`; `initState`/`didUpdateWidget` | é Flutter geral, não API do SeedGrid |
| `lucide-react` (`<Pencil />`) | `Icon(Icons.edit)` (Material Icons) | não há mapa 1:1 de nomes |
| estado global do `toast` entre testes | chame `dismissSgToast()` no fim do teste | o `toast` é módulo global também no React |

## O que a tabela ainda não cobre?

A seção "Lacunas" do `docs/TABELA_DE_TRADUCAO.md` agora só cita a escolha do enum por prop, que continua sendo lida do tipo do `<Comp>Props` (regra no cabeçalho de `generated/enums.g.dart`). O relatório de origem fica em `seedgrid-platform-work/relatorios/seedgrid-fe-components/2026-10-25-teste-de-familiaridade-flutter.md` (não lido para esta nota).

## Não verificado

- Conferi contra o código Dart: `registerField(validator:)`, `unregisterValidator`, `SgFieldValidator`, `submitOnEnter`/`_onKey`, `SgSubmitValid`, `sgNode`, o erro do submit sem `SgForm`, o prop `value` do `SgInputText`, o `SgToaster` no `Overlay`, `child`/`label` do `SgButton` e `TEXT_OR_WIDGET`. As demais linhas seguem a origem citada no `docs/TABELA_DE_TRADUCAO.md`.
- As ADR 49, 50, 52 e as decisões 1 e 2 foram lidas só por intermédio de `docs/TABELA_DE_TRADUCAO.md` e `docs/DIVERGENCIAS_DO_REACT.md`; não rodei os testes citados.
