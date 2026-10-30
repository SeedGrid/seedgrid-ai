---
description: "API Flutter de Inputs de texto e documentos: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-texto, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Inputs de texto e documentos (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/inputs-texto/API|API — Inputs de texto e documentos (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgInputText

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputText` (mesmo nome).

Campo textual de uso geral com suporte a react-hook-form, validacao, contador de caracteres e prefixo/sufixo.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/sg_input_text.dart` (linha 22) · classe `class SgInputText extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_text.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputText({...})` com 55 parâmetro(s) nomeado(s), 43 do contrato React e 12 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputText

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputTextElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | No React repassa atributos do `<input>`. No Flutter nao ha equivalente: use as props nomeadas (`type`, `textInputType`, `placeholder`...). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelAlign` | `SgInputTextLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputTextLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%' (fracao da largura). Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | Limite maximo de caracteres. |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | Limite minimo de caracteres. |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Callback com o valor textual atual. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco (nao a tecla Enter; igual ao React). Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Perda de foco. Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | Texto de apoio dentro do input. |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | `false` † | não | React | Impede edicao mantendo foco e leitura. |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputTextTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | `type` do `<input>`: 'text' (padrao) ou 'password'. Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`), com os afixos (`prefixText`/`suffixText`), como o `onChange` os entrega. Nulo = nao controlado (Dart nao distingue null de indefinido). Controlado: o campo sempre mostra `value`; se o pai nao atualizar `value` apos o `onChange`, o texto volta ao valor anterior. Trocar `value` por fora atualiza o texto. Com `name` + formulario (ou `control`), o valor do formulario manda e `value` e ignorado (igual ao React, onde o Controller sobrescreve `inputProps.value`). |
| `inputFormatters` | `List<TextInputFormatter>?` | — | não | Flutter | Lista fechada que substitui `inputProps` do React (ADR 50): formatadores de entrada (mascaras). |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado (o `onKeyDown` com Enter no React); recebe o valor completo. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |
| `onValueSet` | `void Function(String full, bool reset)?` | — | não | Flutter | Interno dos inputs derivados (CPF, e-mail...): chamado quando o texto muda POR FORA (setValue/reset do formulario), nunca ao digitar. `reset` = o formulario voltou aos padroes (o texto pode nao ter mudado). Recebe o texto completo (com afixos) ja formatado. |
| `onExitText` | `ValueChanged<String>?` | — | não | Flutter | Interno dos inputs derivados: chamado na perda de foco, antes de `onExit`, com o texto exibido (sem afixos), que e o que o React le do <input> no `onBlur`. |
| `externalValueNormalizer` | `String Function(String)?` | — | não | Flutter | Interno dos inputs derivados: ajusta o valor que vem de FORA (inicial, `value`, setValue/reset) antes da mascara; ex.: telefone `+5511987654321` sem o DDI. Nao vale para o que o usuario digita. |
| `formValidator` | `FutureOr<String?> Function(String value)?` | — | não | Flutter | Interno dos inputs derivados (CPF, e-mail, telefone...): validador do componente que roda tambem em `trigger`/`handleSubmit` do formulario (decisao do dono). Recebe o texto sem afixos e devolve a mensagem de erro ou `null`. Vence a validacao propria do SgInputText (maxLength etc.), que roda em seguida. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Não portado:** `inputProps` (atributos do `<input>`). A prop existe e é ignorada; use as props nomeadas (`type`, `textInputType`, `placeholder`, `inputFormatters`, `autofillHints`, `textInputAction`). Também não existem `className`, `style` e `register` (3 props do React omitidas de propósito; ADR 50 e ADR 49).
- `value` passa a controlar o texto (nulo = não controlado). Com `name` e formulário, vale o valor do formulário e `value` é ignorado, como no React.
- Os validadores do componente (`required`, `maxLength`, `minLength`, `minNumberOfWords`, `validation`) rodam também em `handleSubmit` e `trigger` (decisão do dono de 2026-10-25; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]).
- A internacionalização cobre só as mensagens de validação.
- `onEnter` dispara ao receber o foco, não na tecla Enter (igual ao React); a tecla Enter é o `onSubmitted`, extra do Flutter.
- Limitações de teste registradas: golden com a fonte de teste do Flutter (sem comparação visual de texto com o React) e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/sg_input_text.dart`, `_SgInputTextState`)
- `onChange: ValueChanged<String>`: a cada digitação do usuário, com o texto completo incluindo `prefixText`/`suffixText` (campo vazio entrega `''`). Também é chamado com o campo ligado a formulário; não é chamado quando o texto muda por fora (`setValue`, `reset`, prop `value`).
- `onEnter: VoidCallback`: foco recebido. `onExit: VoidCallback`: foco perdido, depois da validação. `onSubmitted: ValueChanged<String>`: tecla Enter/ação do teclado, com o valor completo. `onClear: VoidCallback`: botão de limpar (chama antes `onChange('')`). `onValidation: ValueChanged<String?>`: mensagem de erro ou `null` cada vez que a validação própria roda.
- Ordem da validação (`_messageFor`): `required`, `maxLength`, `minLength`, `minNumberOfWords`, `validation`. Mensagens padrão vêm do i18n (`components.inputs.*`) quando não há `*Message`. Roda ao perder o foco (`validateOnBlur` vale `true` se omitido) ou a cada digitação quando `validateOnBlur == false`; depois da primeira interação continua rodando na saída do campo.
- `maxLength` só valida e alimenta o contador (`showCharCounter`); o build não aplica formatador de tamanho, então não limita a digitação. Para limitar, use `inputFormatters`. **Confirmado** no `build`.

**Controller, formulário e estado**
- Não há controller próprio. `focusNode` externo é opcional (sem ele o widget cria e descarta o seu).
- Formulário: o campo fica ligado quando `name != null` e existe um `SgFormController` (`control` ou o `SgForm` mais próximo, `SgForm.maybeOf`). Ele chama `registerField(name, validator: _formValidate, rules: mergeRequiredRule(rules, required, requiredMessage), initialValue:)`. O validador roda em `trigger`/`handleSubmit`; campo desabilitado nunca falha e vazio opcional não falha. Cada digitação faz `setValue(name, textoCompleto, shouldValidate: erro visível || submitCount > 0)`; ao sair do campo faz `markTouched` e `trigger([name])`.
- Valor: `initialValue` (sem formulário) e `value` controlado (se o pai não atualizar `value` depois do `onChange`, o texto volta ao anterior). Mudança por fora revalida um erro já visível; `reset` limpa o erro.
- Etapas de `SgWizard`: o widget implementa `SgSelfValidating` (`validateNow`) para campos fora de formulário.
- Parâmetros marcados como internos no código (`onValueSet`, `onExitText`, `externalValueNormalizer`, `formValidator`) existem para os derivados (CPF, e-mail, telefone etc.); não os use em código de aplicação.

**Acessibilidade**
- O campo é envolvido por `Semantics(label: labelText ?? label, textField: true)`. O erro aparece como `errorText` do `InputDecoration`. Há `autofillHints`, `textInputAction`, `autofocus` e `focusNode` para controlar teclado e foco.
- O botão de limpar é um `IconButton` com `tooltip: null` (sem rótulo próprio). Nenhum atributo de erro para leitor de tela além do `errorText` foi encontrado; **não confirmado** o que o `TextField` do Material anuncia por conta própria.

## SgInputTextArea

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputTextArea` (mesmo nome).

Campo textual multi-linha para descricoes, observacoes e conteudos longos com suporte a contagem e validacao.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/text/sg_input_text_area.dart` (linha 25) · classe `class SgInputTextArea extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_text_area.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputTextArea({...})` com 46 parâmetro(s) nomeado(s), 40 do contrato React e 6 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputTextArea

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo multi-linha. |
| `borderRadius` | `num?` | — | não | React | Numero (px). Padrao: 6. Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputTextAreaElevation?` | — | não | React | Padrao: `sm` (como no React). Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `height` | `Object?` | — | não | React | Numero (px) ou 'N%': altura fixa; o texto rola dentro. Tipo no React: `string \| number`. |
| `hintText` | `String?` | — | não | React | — |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelAlign` | `SgInputTextAreaLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputTextAreaLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou 'N%'. Padrao: 176 (11rem). Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | Limite maximo de caracteres. |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `maxLines` | `num?` | — | não | React | Linhas visiveis (`rows` do <textarea>). Padrao: 2. |
| `minLength` | `num?` | — | não | React | Limite minimo de caracteres. |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minLines` | `num?` | — | não | React | — |
| `minLinesMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Callback com o texto multi-linha atual. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco. Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Perda de foco. Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `textareaProps` | `Object?` | — | não | React | Sem equivalente (ADR 50). Ignorado. Tipo no React: `(React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement>; })`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou 'N%'. Padrao: largura toda. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `String?` | — | não | Flutter | — |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `textareaProps.value`): sem formulario, o campo mostra sempre `value`; trocar por fora atualiza o texto (se o pai nao atualizar apos o `onChange`, o texto volta ao valor anterior). |
| `readOnly` | `bool?` | — | não | Flutter | — |
| `autofocus` | `bool` | `false` | não | Flutter | — |
| `inputFormatters` | `List<TextInputFormatter>?` | — | não | Flutter | — |
| `focusNode` | `FocusNode?` | — | não | Flutter | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Não portado:** `textareaProps` (atributos do `<textarea>`): aceito e ignorado; use `initialValue`, `value`, `readOnly`, `autofocus`, `inputFormatters` e `focusNode`. Não existem `className`, `style` e `register` (3 props omitidas de propósito).
- `value` faz o papel do `textareaProps.value` do React: sem formulário o campo mostra sempre `value`; se o pai não o atualizar após o `onChange`, o texto volta ao anterior.
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/text/sg_input_text_area.dart`)
- `onChange: ValueChanged<String>`: a cada digitação, com o texto (sem afixos; o widget não tem `prefixText`/`suffixText`). Chamado também dentro de formulário; não é chamado em mudança por fora. `onEnter` (foco), `onExit` (perda de foco), `onClear` (botão limpar, depois de `onChange('')`) e `onValidation: ValueChanged<String?>`.
- Ordem da validação (`_messageFor`): `required`, `maxLength`, `minLength`, `minNumberOfWords`, `minLines`, `validation`; mensagens `components.inputs.textarea.*`. O `_onChanged` valida a cada digitação, independentemente de `validateOnBlur`; na saída valida se `validateOnBlur ?? true` ou se já houve interação.
- `maxLength` limita o que se digita ou cola (`SgMaxLengthFormatter`, nunca corta texto que já estava no campo) e também valida. `maxLines` (padrão 2) define as linhas visíveis; com `height` o campo expande para a altura dada. `minLines` é regra de validação (mínimo de linhas digitadas), não altura. **Inferência** sobre a contagem de linhas (`_lines` não foi lida em detalhe).
- Enter insere quebra de linha: o widget não tem `onSubmitted`, `textInputAction` nem `autofillHints`.

**Controller, formulário e estado**
- Sem controller próprio; `focusNode` externo opcional. Liga-se ao formulário como o `SgInputText` (`name` + `control` ou `SgForm` acima; `registerField` com validador próprio e mensagem de obrigatório `components.inputs.textarea.required`). O valor do formulário troca `\r\n` por `\n`.
- `value` controlado e `initialValue` como no `SgInputText`. Implementa `SgSelfValidating` (`validateNow`) para o `SgWizard`.

**Acessibilidade**
- `Semantics(label: labelText ?? label, textField: true, multiline: true)` em volta do campo. O botão de limpar tem `tooltip` do i18n (`components.actions.clear`). O erro é um `Text` abaixo do campo, sem `liveRegion` explícito. **Não confirmado** o que o `TextField` anuncia por conta própria.

## SgInputTextSearch

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputTextSearch` (mesmo nome).

Campo de busca que embrulha o SgInputText com debounce sem dependencia externa: onChange imediato e onSearchChange disparado apos o debounce com o termo normalizado (trim + gate por minChars).

- Arquivo: `packages/seedgrid_components/lib/src/inputs/text/sg_input_text_search.dart` (linha 17) · classe `class SgInputTextSearch extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_text_search.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputTextSearch({...})` com 53 parâmetro(s) nomeado(s), 46 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputTextSearch

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `onSearchChange` | `ValueChanged<String>` | — | sim | React | Disparado apos o debounce, com o termo normalizado. Tipo no React: `(value: string) => void`. |
| `minChars` | `num` | `3` | não | React | Minimo de caracteres (apos trim) para disparar onSearchChange; 0 caracteres tambem dispara (limpar busca). |
| `debounceMs` | `num` | `350` | não | React | Atraso do debounce em milissegundos antes de disparar onSearchChange. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputTextSearchElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (ADR 50). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputTextSearchLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputTextSearchLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | — |
| `onChange` | `ValueChanged<String>?` | — | não | React | Disparado imediatamente a cada digitacao, com o valor cru. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | Texto de apoio dentro do input. |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputTextSearchTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `String?` | — | não | Flutter | — |
| `inputFormatters` | `List<TextInputFormatter>?` | — | não | Flutter | — |
| `autofocus` | `bool` | `false` | não | Flutter | — |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | — |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | — |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | — |
| `focusNode` | `FocusNode?` | — | não | Flutter | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Não portado:** `inputProps` (aceito e ignorado) e `className`/`style`/`register` (3 props omitidas de propósito). A prop `value` (texto controlado) não existe neste widget; use `initialValue`.
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono), herdados do `SgInputText` interno.
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/text/sg_input_text_search.dart`)
- `onSearchChange: void Function(String)` (obrigatório): disparado depois do debounce com o termo normalizado (`trim`). Só dispara se o termo é vazio ou tem `minChars` (padrão 3) ou mais caracteres, e não repete o último termo emitido (`_lastEmitted`).
- `debounceMs` (padrão 350 ms). Mudar `debounceMs` ou `minChars` depois da primeira digitação reinicia o temporizador (como o `useEffect` do React).
- `onChange: ValueChanged<String>`: imediato a cada digitação, com o valor cru completo (com prefixo/sufixo). Os demais callbacks (`onEnter`, `onExit`, `onClear`, `onValidation`, `onSubmitted`) são repassados ao `SgInputText`.

**Controller, formulário e estado**
- Compõe um `SgInputText`: `name` + `control`/`SgForm`, `rules`, validações e `focusNode` funcionam como descrito em `SgInputText`. Não repassa `value`; use `initialValue`.

**Acessibilidade**
- Herdada do `SgInputText` (`Semantics(label, textField: true)`); o widget não acrescenta semântica própria (nenhum `Semantics` encontrado em `inputs/text/sg_input_text_search.dart`).

## SgInputEmail

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputEmail` (mesmo nome).

Campo especializado para email com validacao de formato, bloqueio opcional de dominios temporarios e integracao com formularios.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/text/sg_input_email.dart` (linha 16) · classe `class SgInputEmail extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_email.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputEmail({...})` com 53 parâmetro(s) nomeado(s), 45 do contrato React e 8 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputEmail

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `blockedEmailDomains` | `List<String>?` | — | não | React | Lista customizada de dominios bloqueados. Tipo no React: `string[]`. |
| `blockFakeMail` | `bool?` | `true` † | não | React | Bloqueia dominios temporarios conhecidos. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputEmailElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (ADR 50). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `invalidMessage` | `String?` | — | não | React | Mensagem para email invalido. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputEmailLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputEmailLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco (como no SgInputText). Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado quando o campo perde o foco (apos a validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputEmailTextInputType?` | — | não | React | Padrao: `email`. Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `String?` | — | não | Flutter | — |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); trocar por fora atualiza o campo. |
| `inputFormatters` | `List<TextInputFormatter>?` | — | não | Flutter | — |
| `autofocus` | `bool` | `false` | não | Flutter | — |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | — |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | — |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | — |
| `focusNode` | `FocusNode?` | — | não | Flutter | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Não portado:** `inputProps` (aceito e ignorado) e `className`/`style`/`register` (3 props omitidas de propósito).
- Os validadores do componente (formato, domínios bloqueados, `validation`) rodam também em `handleSubmit` e `trigger` (decisão do dono).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/text/sg_input_email.dart`)
- `onChange: ValueChanged<String>`: a cada digitação, com o texto completo (com afixos). O widget valida a cada digitação (`_onChange` chama `_validate`), mesmo com `validateOnBlur: false`; na saída valida se `validateOnBlur ?? true` ou se já houve interação.
- Ordem da validação (`_messageFor`): vazio opcional passa; vazio obrigatório devolve `requiredMessage`; `validation` do usuário; formato (`isValidEmail`, mensagem `invalidMessage` ou `components.inputs.email.invalid`); domínio bloqueado quando `blockFakeMail` (padrão `true`) e o domínio está na lista padrão ou em `blockedEmailDomains` (mensagem fixa do i18n `components.inputs.email.tempInvalid`, sem prop para trocá-la).
- `onClear` limpa o erro interno e chama `onValidation(null)` antes do `onClear` do usuário. `onEnter`, `onExit`, `onValidation`, `onSubmitted` como no `SgInputText`.

**Controller, formulário e estado**
- Compõe `SgInputText` com `type: 'email'` (remove espaços das pontas do texto) e teclado `email` por padrão. O validador `_messageFor` é entregue como `formValidator`, então roda em `trigger`/`handleSubmit`. `value` controlado: trocar por fora revalida um erro já visível; `reset` limpa o erro.

**Acessibilidade**
- Herdada do `SgInputText`; nenhum `Semantics` próprio em `inputs/text/sg_input_email.dart`. Sem `autofillHints` padrão (passe `autofillHints: [AutofillHints.email]` se quiser).

## SgInputPassword

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputPassword` (mesmo nome).

Campo especializado para senha com validacoes de politica, alternancia de visibilidade e indicacao de forca.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/text/sg_input_password.dart` (linha 42) · classe `class SgInputPassword extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_password.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputPassword({...})` com 65 parâmetro(s) nomeado(s), 57 do contrato React e 8 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputPassword

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `commonPasswordCheck` | `bool` | `true` | não | React | Bloqueia senhas comuns. |
| `commonPasswordList` | `List<String>?` | — | não | React | Sem efeito (defeito herdado do React: o limite de 1000 da base descarta os extras). Tipo no React: `string[]`. |
| `commonPasswordMessage` | `String?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `createNewPasswordButton` | `bool` | `false` | não | React | Exibe um botao para gerar automaticamente uma senha forte aleatoria (respeita as regras de politica). |
| `elevation` | `SgInputPasswordElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hidePassword` | `bool?` | `true` † | não | React | Oculta a senha inicialmente. |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (ADR 50). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputPasswordLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputPasswordLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `lowerRequired` | `bool` | `true` | não | React | — |
| `maxLength` | `num?` | — | não | React | Padrao: 15 (como no React). |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `minSize` | `num` | `8` | não | React | Tamanho minimo esperado da senha. |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `newPasswordLength` | `num?` | — | não | React | Comprimento da senha gerada pelo `createNewPasswordButton`. Default: `minSize`.  NAO derive isto de `maxLength`: `maxLength` existe para nao truncar o que o usuario digita (frase-senha), e costuma ser folgado (128, 512). Usar o teto como alvo fazia o botao gerar uma senha de 128 caracteres. |
| `numberRequired` | `bool` | `true` | não | React | — |
| `onChange` | `ValueChanged<String>?` | — | não | React | Valor sem prefixo/sufixo, a cada digitacao e ao gerar senha. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `prohibitsRepeatedCharactersInSequence` | `bool` | `true` | não | React | — |
| `prohibitsSequentialAscCharacters` | `bool` | `true` | não | React | — |
| `prohibitsSequentialDescCharacters` | `bool` | `true` | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `showStrengthBar` | `bool` | `true` | não | React | Exibe barra de forca da senha. |
| `specialCharacterRequired` | `bool` | `true` | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputPasswordTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `upperRequired` | `bool` | `true` | não | React | — |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `String?` | — | não | Flutter | — |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); trocar por fora atualiza o campo. |
| `inputFormatters` | `List<TextInputFormatter>?` | — | não | Flutter | — |
| `autofocus` | `bool` | `false` | não | Flutter | — |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | — |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | — |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | — |
| `focusNode` | `FocusNode?` | — | não | Flutter | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Não portado:** `inputProps` (aceito e ignorado) e `className`/`style`/`register` (3 props omitidas de propósito). `commonPasswordList` não tem efeito (igual ao React: o limite de 1000 senhas comuns da base já está cheio; `inputs/text/common_passwords.dart`).
- Diferença de propósito: a barra de força fica neutra (0 segmentos) com o campo vazio; no React ela começava toda verde (decisão do dono de 2026-10-26; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]).
- `maxLength` tem padrão 15 (herdado do React) e só valida; `onChange` recebe o valor sem prefixo e sem sufixo.
- Os validadores do componente (política de senha, senha comum, `validation`) rodam também em `handleSubmit` e `trigger` (decisão do dono).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/text/sg_input_password.dart`)
- `onChange: ValueChanged<String>`: a cada digitação, com o valor **sem** `prefixText`/`suffixText`. `onValidation: ValueChanged<String?>`: primeira mensagem de erro ou `null`. `onClear`, `onEnter`, `onExit`, `onSubmitted` como no `SgInputText`.
- Validação (`_evaluate`): vazio obrigatório devolve `requiredMessage`; depois acumula requisitos não atendidos: `minSize` (padrão 8), `upperRequired`, `lowerRequired`, `numberRequired`, `specialCharacterRequired` (todos `true` por padrão), `prohibitsRepeatedCharactersInSequence`, `prohibitsSequentialAscCharacters`, `prohibitsSequentialDescCharacters` (padrão `true`; sequências de 3), senha comum quando `commonPasswordCheck` (padrão `true`) e, por fim, `validation`. O erro exibido é o primeiro; a lista dos demais requisitos aparece abaixo do campo.
- Barra de força de 5 segmentos (`showStrengthBar`, padrão `true`): pontuação = critérios ativos menos requisitos não atendidos; sem texto, 0.
- `createNewPasswordButton` (padrão `false`) mostra um botão que gera uma senha forte com `Random.secure`, respeitando os requisitos ligados, `newPasswordLength`/`minSize` e o teto de `maxLength`.

**Controller, formulário e estado**
- Compõe `SgInputText`; `hidePassword` (omitido = oculta) controla o botão de mostrar/ocultar (`type: 'password'` ou `'text'`). Liga-se ao formulário por `name` + `control`/`SgForm`; o validador `_evaluate` é entregue como `formValidator`. `value` controlado e `initialValue` como no `SgInputText`.

**Acessibilidade**
- O botão de mostrar/ocultar usa `Semantics(label: i18n components.password.show/hide, button: true)`; o botão de gerar senha tem `tooltip` do i18n (`components.password.generate`). A barra de força e a lista de requisitos não têm `Semantics` próprio (só `ValueKey`); **não confirmado** se leitores de tela leem a lista, que é um `Text` comum.

## SgInputPhone

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputPhone` (mesmo nome).

Campo especializado para telefone com mascara, validacao de comprimento e integracao com formularios.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_phone.dart` (linha 17) · classe `class SgInputPhone extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_phone.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputPhone({...})` com 52 parâmetro(s) nomeado(s), 45 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputPhone

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputPhoneElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Props nativos do input. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputPhoneLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputPhoneLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputPhoneTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `invalidMessage` | `String?` | — | não | React | Mensagem para telefone invalido. |
| `lengthMessage` | `String?` | — | não | React | Mensagem para telefone com tamanho invalido. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); aparece mascarado e trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- Nenhuma ressalva registrada na tabela de paridade.
- **Confirmado no código:** um número do Brasil com DDI (`+55 11 98765-4321`, `5511987654321`) perde o `55` ao entrar por valor inicial, `value`, `setValue` ou colar (`sgPhoneStripDdi`); o React mostraria outro telefone (decisão de valor programático D6; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]). O campo exibe sempre o valor mascarado.
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono, aceita como paridade).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_phone.dart`, núcleo em `inputs/masked/masked_core.dart`)
- `onChange: ValueChanged<String>`: a cada digitação, com o texto **mascarado**; é também o valor guardado no formulário. A validação roda a cada digitação e na saída (`SgMaskedBlurRule.optionOrInteracted`: se `validateOnBlur ?? true` ou se o usuário já digitou).
- Validação: vazio obrigatório devolve `requiredMessage`; `validation` do usuário; valor com 10 ou 11 dígitos é válido, senão `lengthMessage ?? invalidMessage ?? components.inputs.phone.invalid`. Extras do contrato: `invalidMessage`, `lengthMessage`.
- `onValidation`, `onClear`, `onEnter`, `onExit`, `onSubmitted` como no `SgInputText`.

**Controller, formulário e estado**
- `StatelessWidget` que usa `SgMaskedInput` (um `SgInputText` com `SgMaskFormatter`, que preserva o cursor). `maxLength` padrão 18; teclado numérico por padrão. Repassa `required`/`requiredMessage` ao `SgInputText` (`forwardRequired: true`).
- Formulário: `name` + `control`/`SgForm`; o mesmo validador roda em `trigger`/`handleSubmit`. `value` controlado (aparece mascarado) e `initialValue`; mudar por fora revalida um erro já visível, `reset` limpa. `focusNode` externo opcional.

**Acessibilidade**
- Herdada do `SgInputText` (`Semantics(label, textField: true)`); nenhum `Semantics` próprio no arquivo. Sem `autofillHints` padrão.

## SgInputCPF

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputCPF` (mesmo nome).

Campo especializado para CPF com mascara, validacao de digitos e integracao com fluxos de cadastro de pessoa fisica.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_cpf.dart` (linha 17) · classe `class SgInputCPF extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_cpf.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputCPF({...})` com 52 parâmetro(s) nomeado(s), 45 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputCPF

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputCPFElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputCPFLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputCPFLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | Mensagem para ausencia de valor. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputCPFTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `invalidMessage` | `String?` | — | não | React | Mensagem para CPF invalido. |
| `lengthMessage` | `String?` | — | não | React | Mensagem para tamanho invalido. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); aparece mascarado e trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- Nenhuma ressalva registrada na tabela de paridade.
- **Confirmado no código:** não repassa `required` ao `SgInputText` (como no React: o rótulo não ganha `*`; a validação própria trata o obrigatório). Valor inicial, `value` e `setValue` aparecem sempre mascarados (decisão do dono D1 de valor programático; ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]).
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono, aceita como paridade): um CPF inválido não passa no envio.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_cpf.dart`, núcleo em `inputs/masked/masked_core.dart`)
- `onChange: ValueChanged<String>`: a cada digitação, com o texto **mascarado** (`000.000.000-00`), que também é o valor guardado no formulário. A validação roda a cada digitação e, na saída, se `validateOnBlur ?? true` (`SgMaskedBlurRule.option`).
- Validação: vazio obrigatório devolve `requiredMessage`; `validation` do usuário; menos ou mais de 11 dígitos devolve `lengthMessage` (`components.inputs.cpf.length`); dígitos verificadores inválidos (`isValidCpf`, de `seedgrid_commons`) devolvem `invalidMessage` (`components.inputs.cpf.invalid`).
- `onValidation`, `onClear`, `onEnter`, `onExit`, `onSubmitted` como no `SgInputText`.

**Controller, formulário e estado**
- `StatelessWidget` sobre `SgMaskedInput`; `maxLength` padrão 18; teclado numérico por padrão. `name` + `control`/`SgForm` ligam ao formulário; o validador roda também em `trigger`/`handleSubmit`. `value`/`initialValue` como no `SgInputPhone`.

**Acessibilidade**
- Herdada do `SgInputText`; nenhum `Semantics` próprio no arquivo. Sem `autofillHints` padrão.

## SgInputCNPJ

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputCNPJ` (mesmo nome).

Campo especializado para CNPJ com mascara, validacao de digitos e suporte opcional a consulta externa.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_cnpj.dart` (linha 18) · classe `class SgInputCNPJ extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_cnpj.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputCNPJ({...})` com 57 parâmetro(s) nomeado(s), 50 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputCNPJ

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputCNPJElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputCNPJLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputCNPJLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputCNPJTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `invalidMessage` | `String?` | — | não | React | Mensagem para CNPJ invalido. |
| `lengthMessage` | `String?` | — | não | React | — |
| `validateWithPublicaCnpj` | `bool?` | `false` † | não | React | Ativa validacao externa opcional. |
| `publicaCnpjErrorMessage` | `String?` | — | não | React | Mensagem para falha na consulta externa. |
| `publicaCnpjFetch` | `Future<Object?> Function(String cnpj)?` | — | não | React | Consulta injetavel (testes sem rede). Padrao: https://publica.cnpj.ws. Tipo no React: `((cnpj: string) => Promise<unknown>)`. |
| `onPublicaCnpjResult` | `ValueChanged<Object?>?` | — | não | React | Tipo no React: `((data: unknown) => void)`. |
| `onPublicaCnpjError` | `ValueChanged<Object>?` | — | não | React | Tipo no React: `((error: unknown) => void)`. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); aparece mascarado e trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- Consulta de rede injetável: `publicaCnpjFetch` (padrão: `SgHttpClient` contra `https://publica.cnpj.ws`) e, no CEP, `SgViaCepResult` no lugar do `ViaCepResponse` do `seedgrid_commons`, que lança em vez de devolver `erro`.
- **Não portado:** o placeholder por país do React (nunca é usado lá) não foi portado; `inputProps` é aceito e ignorado e `className`/`style`/`register` não existem (3 props omitidas de propósito).
- **Confirmado no código:** respostas 429 e 5xx da consulta pública não significam "CNPJ inexistente": propagam para `onPublicaCnpjError` e a validação passa. O React trata qualquer resposta não 2xx como "não achou" (`sgDefaultPublicaCnpjFetch`).
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono); com `validateWithPublicaCnpj` ligado, o envio dispara a consulta (memorizada pelo último CNPJ).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_cnpj.dart`, consulta em `inputs/masked/masked_fetch.dart`)
- `onChange: ValueChanged<String>`: texto **mascarado** (`00.000.000/0000-00`), a cada digitação; é o valor do formulário. Validação a cada digitação e, na saída, se `validateOnBlur ?? true`.
- Validação: vazio obrigatório; `validation` do usuário; 14 caracteres alfanuméricos (CNPJ numérico ou alfanumérico) senão `lengthMessage`; dígitos verificadores (`isValidCnpj`) senão `invalidMessage`.
- Consulta pública (`validateWithPublicaCnpj`, padrão desligado): só para CNPJ sem letras com 14 dígitos. `onPublicaCnpjResult: ValueChanged<Object?>` recebe os dados (ou `null` se não achou), `onPublicaCnpjError: ValueChanged<Object>` recebe a falha de rede. Não achou: erro `publicaCnpjErrorMessage ?? invalidMessage ?? components.inputs.cnpj.invalid`. O último CNPJ consultado fica em memória (`ctx.memo`); `onClear` limpa essa memória.
- Cliente injetável: `publicaCnpjFetch: Future<Object?> Function(String cnpj)` (testes sem rede). Padrão `sgDefaultPublicaCnpjFetch`: `GET https://publica.cnpj.ws/cnpj/<14 dígitos>`; 4xx (menos 429) vira `null` (não achou).

**Controller, formulário e estado**
- `StatelessWidget` sobre `SgMaskedInput`; `maxLength` padrão 18; teclado de texto por padrão (aceita letras). Formulário e `value`/`initialValue` como no `SgInputCPF`. Não repassa `required` ao `SgInputText`.

**Acessibilidade**
- Herdada do `SgInputText`; nenhum `Semantics` próprio no arquivo. Sem `autofillHints` padrão.

## SgInputCPFCNPJ

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputCPFCNPJ` (mesmo nome).

Campo hibrido para CPF ou CNPJ com mascara e validacao automatica conforme o documento informado.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_cpfcnpj.dart` (linha 18) · classe `class SgInputCPFCNPJ extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_cpfcnpj.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputCPFCNPJ({...})` com 57 parâmetro(s) nomeado(s), 50 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputCPFCNPJ

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputCPFCNPJElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputCPFCNPJLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputCPFCNPJLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputCPFCNPJTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String value)?` | — | não | React | Validacao customizada adicional. Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `invalidMessage` | `String?` | — | não | React | Mensagem para documento invalido. |
| `lengthMessage` | `String?` | — | não | React | Mensagem para comprimento invalido. |
| `validateWithPublicaCnpj` | `bool?` | `false` † | não | React | Confirma na base publica que o CNPJ numerico existe. |
| `publicaCnpjErrorMessage` | `String?` | — | não | React | Mensagem quando a base publica nao encontra o CNPJ. |
| `publicaCnpjFetch` | `Future<Object?> Function(String cnpj)?` | — | não | React | Consulta injetavel (padrao publica.cnpj.ws). Tipo no React: `((cnpj: string) => Promise<unknown>)`. |
| `onPublicaCnpjResult` | `ValueChanged<Object?>?` | — | não | React | Recebe o resultado da consulta. Tipo no React: `((data: unknown) => void)`. |
| `onPublicaCnpjError` | `ValueChanged<Object>?` | — | não | React | Chamado quando a consulta falha. Tipo no React: `((error: unknown) => void)`. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); aparece mascarado e trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- Nenhuma ressalva registrada na tabela de paridade.
- **Confirmado no código:** tem a mesma consulta pública opcional do `SgInputCNPJ` (`validateWithPublicaCnpj`, `publicaCnpjFetch`), com a diferença de 429 e 5xx descrita lá. Não repassa `required` ao `SgInputText`.
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono, aceita como paridade).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_cpfcnpj.dart`)
- `onChange: ValueChanged<String>`: texto mascarado (`maskCpfCnpj`), a cada digitação; é o valor do formulário. Validação a cada digitação e, na saída, se `validateOnBlur ?? true`.
- Detecção: é tratado como CNPJ quando há letra ou mais de 11 caracteres alfanuméricos; senão é CPF. CPF: 11 dígitos (`components.inputs.cpf.length`) e dígitos verificadores (`isValidCpf`). CNPJ: 14 caracteres (`components.inputs.cnpj.length`) e `isValidCnpj`. `lengthMessage` e `invalidMessage` valem para os dois.
- Consulta pública do CNPJ: igual ao `SgInputCNPJ` (`validateWithPublicaCnpj`, `publicaCnpjErrorMessage`, `publicaCnpjFetch`, `onPublicaCnpjResult`, `onPublicaCnpjError`).

**Controller, formulário e estado**
- `StatelessWidget` sobre `SgMaskedInput`; `maxLength` padrão 18; teclado de texto. Formulário, `value` e `initialValue` como no `SgInputCPF`.

**Acessibilidade**
- Herdada do `SgInputText`; nenhum `Semantics` próprio no arquivo.

## SgInputPostalCode

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputPostalCode` (mesmo nome).

Campo especializado para CEP e codigos postais com suporte a multiplos paises, mascaras e consulta opcional ao ViaCEP.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_postal_code.dart` (linha 17) · classe `class SgInputPostalCode extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_postal_code.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputPostalCode({...})` com 58 parâmetro(s) nomeado(s), 51 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputPostalCode

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputPostalCodeElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputPostalCodeLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputPostalCodeLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputPostalCodeTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `String?` | — | não | React | Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `(((value: string) => string) & ((value: string) => string))`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `country` | `SgInputPostalCodeCountry?` | `BR` † | não | React | Pais usado para mascara e validacao. Valores: `BR`, `PT`, `US`, `ES`, `UY`, `AR`, `PY`. |
| `invalidMessage` | `String?` | — | não | React | Mensagem para codigo invalido. |
| `lengthMessage` | `String?` | — | não | React | Mensagem para tamanho invalido. |
| `validateWithViaCep` | `bool?` | `false` † | não | React | Ativa consulta ao ViaCEP para BR. |
| `viaCepErrorMessage` | `String?` | — | não | React | — |
| `viaCepFetch` | `Future<SgViaCepResult> Function(String cep)?` | — | não | React | Consulta injetavel (testes sem rede). Padrao: https://viacep.com.br. Tipo no React: `((cep: string) => Promise<ViaCepResponse>)`. |
| `onViaCepResult` | `ValueChanged<SgViaCepResult>?` | — | não | React | Callback com resposta da consulta ViaCEP. Tipo no React: `((data: ViaCepResponse) => void)`. |
| `onViaCepError` | `ValueChanged<Object>?` | — | não | React | Tipo no React: `((error: unknown) => void)`. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`); aparece mascarado e trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- Consulta de rede injetável: `viaCepFetch` devolve `SgViaCepResult` (no lugar do `ViaCepResponse` do `seedgrid_commons`, que lança erro em vez de devolver `erro`).
- **Não portado:** o placeholder por país do React (nunca é usado lá) não foi portado; `inputProps` é aceito e ignorado e `className`/`style`/`register` não existem (3 props omitidas de propósito).
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono); com `validateWithViaCep` ligado, o envio dispara a consulta (memorizada pelo último CEP).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_postal_code.dart`, país e consulta em `inputs/masked/masked_fetch.dart`)
- `onChange: ValueChanged<String>`: texto **mascarado** segundo o país, a cada digitação; é o valor do formulário. Validação a cada digitação e, na saída, se `validateOnBlur ?? true` ou se o usuário já digitou (`optionOrInteracted`).
- `country` (`SgInputPostalCodeCountry`): `br` (padrão), `pt`, `us`, `es`, `uy`, `ar`, `py`; define máscara, tamanho e mensagens (`components.inputs.postalCode.<PAÍS>.length/invalid`). Tamanho aceito: BR 8, PT 7, ES 5, EUA 5 ou 9, AR 4 ou 8; UY e PY seguem `SgPostalConfig` (`sgPostalConfigOf`).
- ViaCEP (`validateWithViaCep`, padrão desligado): só vale para `br`. `onViaCepResult: ValueChanged<SgViaCepResult>` recebe a resposta; `onViaCepError: ValueChanged<Object>` recebe a falha de rede (a validação passa). Resposta com `erro` devolve `viaCepErrorMessage ?? invalidMessage ?? components.inputs.postalCode.BR.invalid`. O último CEP consultado fica em memória.
- Cliente injetável: `viaCepFetch: Future<SgViaCepResult> Function(String cep)`. Padrão `sgDefaultViaCepFetch`: usa `buscarCep` de `seedgrid_commons`; "CEP não encontrado." vira `SgViaCepResult(erro: true)`, outras falhas propagam.

**Controller, formulário e estado**
- `StatelessWidget` sobre `SgMaskedInput`; `maxLength` e teclado numérico vêm do país. Formulário, `value` e `initialValue` como no `SgInputCPF`. Não repassa `required` ao `SgInputText`.

**Acessibilidade**
- Herdada do `SgInputText`; nenhum `Semantics` próprio no arquivo.

## SgInputDate

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputDate` (mesmo nome).

Campo de data com validacao de intervalo e suporte a selecao temporal para eventos, prazos e datas de referencia.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_date.dart` (linha 78) · classe `class SgInputDate extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_date.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputDate({...})` com 55 parâmetro(s) nomeado(s), 45 do contrato React e 10 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputDate

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo de data. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputDateElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelAlign` | `SgInputDateLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputDateLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Callback com a data selecionada ou digitada. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | Texto de apoio para orientar o preenchimento da data. |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | `false` † | não | React | Impede edicao mantendo leitura e foco. |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputDateTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `alwaysFloat` | `bool?` | — | não | React | Sem efeito: o rotulo do campo de data e sempre estatico (igual ao React, que ignora a prop). |
| `maxDate` | `Object?` | — | não | React | Data maxima permitida. Tipo no React: `string \| Date`. |
| `minDate` | `Object?` | — | não | React | Data minima permitida. Tipo no React: `string \| Date`. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`): data ISO `yyyy-MM-dd` (ver [sgNormalizeDateValue] para os outros formatos aceitos). Trocar por fora atualiza o campo. Com `name` + formulario, o formulario manda. |
| `onValueSet` | `void Function(String iso, bool reset)?` | — | não | Flutter | Interno do SgInputBirthDate: chamado quando o valor muda por fora, com a data ISO ('' se nao e data). |
| `onExitIso` | `ValueChanged<String>?` | — | não | Flutter | Interno do SgInputBirthDate: chamado na perda de foco, com a data ISO do campo ('' se incompleta). |
| `formValidator` | `String? Function(String iso)?` | — | não | Flutter | Interno do SgInputBirthDate: validador extra (limite de idade) que roda tambem em `trigger`/`handleSubmit` do formulario. Recebe a data ISO ('' se vazia) e devolve a mensagem de erro ou `null`. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Diferença de plataforma:** o React usa o `<input type="date">` nativo; o Flutter usa um `SgInputText` com máscara por idioma (`dd/MM/yyyy`; `MM/dd/yyyy` em `en-US`) e um calendário próprio (botão `Icons.calendar_month`). O valor continua sendo a data ISO `yyyy-MM-dd`, ou `''` enquanto a data está incompleta ou inválida.
- Data impossível (31/02) mostra "Data inválida"; no campo nativo o valor viraria vazio.
- `alwaysFloat` não tem efeito (o rótulo é estático, igual ao React). Sem `labelPosition`, o rótulo fica no topo.
- Recriar o widget por `key` perde o foco (registrado na tabela de paridade; é preciso um controller externo no `SgInputText`).
- Aceita também ISO com hora e o texto do idioma atual como valor de fora (decisão D10); o React só entende ISO.
- Os validadores do componente (data válida, `minDate`/`maxDate`, `validation`) rodam também em `handleSubmit` e `trigger` (decisão do dono).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_date.dart`, calendário em `inputs/masked/sg_date_picker.dart`)
- `onChange: ValueChanged<String>`: data ISO `yyyy-MM-dd`, ou `''` enquanto incompleta; chamado ao digitar e ao escolher no calendário. `onSubmitted` recebe também a data ISO. `onEnter`, `onExit`, `onClear`, `onValidation` como no `SgInputText`.
- Validação (`_messageFor`): vazio ou incompleto passa (ou devolve `requiredMessage` se `required`); data completa impossível devolve `components.inputs.date.invalid`; `validation(iso)` do usuário; `minDate`/`maxDate` (`String` ISO ou `DateTime`) devolvem `components.inputs.date.range/min/max`. Roda na saída do campo (`validateOnBlur ?? true` ou após interação); com `validateOnBlur == false` ou erro visível, roda a cada mudança.
- O calendário (`showSgDatePicker`, exportado) devolve a data escolhida ou `null`; o botão some se o campo está `disabled` ou `readOnly`.

**Controller, formulário e estado**
- Liga-se ao formulário por `name` + `control`/`SgForm`, guardando a data ISO; o validador (`_formValidate`) roda em `trigger`/`handleSubmit`. `value` (`String` com a data ISO) e `initialValue` controlam; trocar por fora atualiza o texto, revalida um erro visível, e `reset` limpa o erro. Ganchos internos para o `SgInputBirthDate`: `onValueSet`, `onExitIso`, `formValidator`.

**Acessibilidade**
- O texto é um `SgInputText` (`Semantics(label, textField: true)`). O botão do calendário é um `IconButton` sem `tooltip` nem `Semantics` próprio, e nenhum `Semantics`/`Tooltip` foi encontrado em `sg_date_picker.dart`. **Não confirmado** o que o diálogo do calendário anuncia a leitores de tela. O `placeholder` padrão é `dd/mm/aaaa` (ou `mm/dd/yyyy` em `en-US`).

## SgInputBirthDate

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputBirthDate` (mesmo nome).

Campo especializado para data de nascimento com validacao de idade minima e maxima sobre a base de SgInputDate.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_birth_date.dart` (linha 18) · classe `class SgInputBirthDate extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_birth_date.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputBirthDate({...})` com 54 parâmetro(s) nomeado(s), 47 do contrato React e 7 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputBirthDate

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `borderRadius` | `num?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `elevation` | `SgInputBirthDateElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter (use as props nomeadas). Ignorado. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `labelAlign` | `SgInputBirthDateLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputBirthDateLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. Tipo no React: `((() => void) & (() => void) & (() => void))`. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. Tipo no React: `((() => void) & (() => void) & (() => void))`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `(((message: string) => void) & ((message: string) => void))`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCharCounter` | `bool?` | — | não | React | — |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputBirthDateTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `alwaysFloat` | `bool?` | — | não | React | Padrao `true` (igual ao React); sem efeito visual aqui, o rotulo e estatico. |
| `maxAge` | `num?` | — | não | React | Idade maxima permitida. |
| `maxDate` | `Object?` | — | não | React | Data maxima permitida. Tipo no React: `string \| Date`. |
| `minAge` | `num?` | — | não | React | Idade minima permitida. |
| `minDate` | `Object?` | — | não | React | Data minima permitida. Tipo no React: `string \| Date`. |
| `initialValue` | `String?` | — | não | Flutter | Valor inicial quando nao ha `control` (no React, `inputProps.defaultValue`). |
| `value` | `String?` | — | não | Flutter | Valor controlado (no React, `inputProps.value`): data ISO `yyyy-MM-dd`. Trocar por fora atualiza o campo. |
| `autofocus` | `bool` | `false` | não | Flutter | `autoFocus` do <input>. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `autoComplete` do <input>. |
| `textInputAction` | `TextInputAction?` | — | não | Flutter | `enterKeyHint` do <input>. |
| `onSubmitted` | `ValueChanged<String>?` | — | não | Flutter | Tecla Enter / acao do teclado; recebe o valor. |
| `focusNode` | `FocusNode?` | — | não | Flutter | Foco externo (`ref` do <input> no React). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Diferença de plataforma:** o mesmo do `SgInputDate` (campo com máscara por idioma e calendário próprio no lugar do `<input type="date">`; data impossível mostra "Data inválida"; `alwaysFloat` sem efeito).
- A "pegadinha de fuso" do `validateBirthDate` do React (data ISO lida em UTC, idade calculada no fuso local) foi mantida de propósito (paridade).
- Fiel ao React: `required`, `requiredMessage`, `validateOnBlur` e `onValidation` valem só para a validação de idade, e `validation` não é repassado ao `SgInputDate` (comentário do arquivo `inputs/masked/sg_input_birth_date.dart`).
- Os validadores do componente (idade mínima e máxima) rodam também em `handleSubmit` e `trigger` (decisão do dono).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/masked/sg_input_birth_date.dart`)
- `onChange`, `onEnter`, `onExit`, `onClear`, `onSubmitted`: como no `SgInputDate` (data ISO). `onValidation: ValueChanged<String?>` recebe a mensagem da validação de idade.
- Idade: `minAge` e `maxAge` (anos, `num`) derivam `maxDate` (hoje menos `minAge` anos) e `minDate` (hoje menos `maxAge` anos); `maxDate` explícito vence a derivação e, sem nenhum, o teto é hoje. A mensagem vem de `validateBirthDateMessage` com `BirthDatePolicy(minAge, maxAge)` (`i18n/validator_messages.dart`); vazio obrigatório usa `components.inputs.birthdate.required`. Pelo comentário do arquivo, sem `minAge` nem `maxAge` a validação devolve a mensagem de configuração inválida para qualquer data preenchida (igual ao React); **não confirmado** executando.

**Controller, formulário e estado**
- Compõe `SgInputDate` (mesmos `name`, `control`, `value`, `initialValue`, `focusNode`); entrega a validação de idade como `formValidator`, então roda em `trigger`/`handleSubmit`. Não repassa `required` ao campo interno.

**Acessibilidade**
- Igual ao `SgInputDate`: texto com `Semantics` do `SgInputText`; botão de calendário sem `tooltip`/`Semantics` próprio.

## SgInputNumber

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputNumber` (mesmo nome).

Campo numerico com suporte a valores inteiros e decimais, validacao de limites e integracao com react-hook-form.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/number/sg_input_number.dart` (linha 15) · classe `class SgInputNumber extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_number.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputNumber({...})` com 45 parâmetro(s) nomeado(s), 43 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputNumber

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo numerico. |
| `allowNegative` | `bool?` | — | não | React | Padrao `true`. |
| `borderRadius` | `Object?` | — | não | React | Numero (px) ou texto ('8px', '50%'). Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | Padrao `true`. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `decimals` | `num?` | — | não | React | Quantidade de casas decimais permitidas. |
| `elevation` | `SgInputNumberElevation?` | — | não | React | Padrao `sm` (sombra leve), como no React. Valores: `none`, `sm`, `md`, `lg`. |
| `emptyValue` | `SgInputNumberEmptyValue?` | — | não | React | `zero` (padrao: o campo mostra 0,00) ou `nullValue` ('null' no React: o campo comeca vazio). Valores: `null`, `zero`. |
| `disabled` | `bool?` | — | não | React | No React a prop e `enabled` (valor invertido). |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (atributos do `<input>`); ignorado. Use `initialValue`/`value`. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelAlign` | `SgInputNumberLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputNumberLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | Numero (px) ou texto ('11rem', '120px', '30%'). Padrao 11rem (176 px). Tipo no React: `string \| number`. |
| `maxValue` | `num?` | — | não | React | — |
| `maxValueMessage` | `String?` | — | não | React | — |
| `minValue` | `num?` | — | não | React | — |
| `minValueMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Callback com o valor numerico atual. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco (nao a tecla Enter; igual ao React). Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Perda de foco. Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | `false` † | não | React | Impede edicao mantendo leitura e foco. |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputNumberTextInputType?` | — | não | React | Padrao `decimal` (teclado numerico com virgula). Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `Object?` | — | não | React | `type` do `<input>`; sem efeito no Flutter. Tipo no React: `React.HTMLInputTypeAttribute`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto ('50%'). Padrao: largura toda. Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `Object?` | — | não | Flutter | Valor inicial sem formulario (no React, `inputProps.defaultValue`): "1234.5", "12,5"... |
| `value` | `Object?` | — | não | Flutter | Valor controlado de fora (no React, `inputProps.value`); mudar atualiza o campo. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Diferença de plataforma:** sem `Intl` no Dart. Separadores vêm de uma tabela gerada a partir do Node (30 locales latinos); fora da tabela cai no idioma e depois em `en-US`. O React trata cada tecla e o Flutter recebe a diferença de texto (um formatador a converte).
- **Não portado:** `inputProps` (aceito e ignorado), `className`/`style`/`register` (3 props omitidas de propósito). `type` não tem efeito. Não há `focusNode` nem `autofocus` neste widget.
- O valor (em `onChange` e no formulário) é a string canônica com ponto (`"1234.50"`), como no React; o campo mostra o número formatado pelo idioma do `SgComponentsI18nProvider`.
- Os validadores do componente (`required`, `minValue`, `maxValue`, `validation`) rodam também em `handleSubmit` e `trigger` (decisão do dono).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/number/sg_input_number.dart`, motor em `inputs/number/numeric_field.dart`)
- `onChange: ValueChanged<String>`: valor canônico (`"1234.50"`) a cada edição do usuário; também dentro de formulário. `onClear` (botão limpar volta ao zero ou a vazio, conforme `emptyValue`), `onEnter` (foco), `onExit`, `onValidation`.
- Validação (`_messageFor`): vazio (ou zero quando `emptyValue` não é `null`) devolve `requiredMessage` se `required`; `minValue` e `maxValue` devolvem `minValueMessage`/`maxValueMessage` (padrão `components.inputs.number.min/max`); por fim `validation(valorCanônico)`. Roda na saída (`validateOnBlur ?? true` ou após interação) e a cada edição se `validateOnBlur == false`.
- Padrões: `decimals` 2, `allowNegative` `true`, `emptyValue` `zero` (o campo mostra 0,00; com `null` começa vazio), `elevation` `sm`, `textInputType` `decimal`.

**Controller, formulário e estado**
- Sem controller. Formulário: `name` + `control`/`SgForm`; `registerField(validator: _formValidate)` roda em `trigger`/`handleSubmit`. `initialValue`/`value` são `Object?` (`"1234.5"`, `"12,5"`, números); `value` nulo sem formulário mantém o estado interno. O campo tem `FocusNode` interno, não exposto.
- Implementa `SgSelfValidating` (`validateNow`) para o `SgWizard`.

**Acessibilidade**
- `Semantics(label: labelText ?? label, textField: true)` em volta do campo. O botão de limpar tem `Tooltip` do i18n (`components.actions.clear`).

## SgInputCurrency

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputCurrency` (mesmo nome).

Campo monetario com formatacao de moeda, simbolo e validacao para precos, valores financeiros e totais.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/number/sg_input_currency.dart` (linha 25) · classe `class SgInputCurrency extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_currency.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputCurrency({...})` com 48 parâmetro(s) nomeado(s), 46 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgInputCurrency

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do campo monetario. |
| `allowNegative` | `bool?` | — | não | React | — |
| `borderRadius` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `currency` | `String?` | — | não | React | Codigo ou configuracao de moeda usada na formatacao. |
| `currencyDisplay` | `SgInputCurrencyCurrencyDisplay?` | — | não | React | Padrao `symbol`. Valores: `symbol`, `name`, `narrowSymbol`, `code`. |
| `currencySymbolOverride` | `String?` | — | não | React | — |
| `currencySymbolPlacement` | `SgInputCurrencyCurrencySymbolPlacement?` | — | não | React | Padrao `auto` (a posicao do idioma). Valores: `prefix`, `auto`, `suffix`. |
| `decimals` | `num?` | — | não | React | Padrao: as casas da moeda (BRL 2, JPY 0...). |
| `emptyValue` | `SgInputCurrencyEmptyValue?` | — | não | React | Valores: `null`, `zero`. |
| `disabled` | `bool?` | — | não | React | No React a prop e `enabled` (valor invertido). |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | Tipo no React: `React.ReactNode[]`. |
| `inputProps` | `Object?` | — | não | React | Sem equivalente (atributos do `<input>`); ignorado. Use `initialValue`/`value`. Tipo no React: `(React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelText` | `String?` | — | não | React | — |
| `locale` | `String?` | — | não | React | Padrao: o idioma do SgComponentsI18nProvider. |
| `maxValue` | `num?` | — | não | React | — |
| `maxValueMessage` | `String?` | — | não | React | — |
| `minValue` | `num?` | — | não | React | — |
| `minValueMessage` | `String?` | — | não | React | — |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Callback com o valor monetario normalizado. Tipo no React: `((value: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco (nao a tecla Enter; igual ao React). Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Perda de foco. Tipo no React: `(() => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Tipo no React: `((message: string) => void)`. |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCurrencySymbol` | `bool?` | — | não | React | Padrao `true`. |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputCurrencyTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `type` | `Object?` | — | não | React | `type` do `<input>`; sem efeito no Flutter. Tipo no React: `React.HTMLInputTypeAttribute`. |
| `useGrouping` | `bool?` | — | não | React | Padrao `true`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String value)?` | — | não | React | Tipo no React: `((value: string) => string)`. |
| `width` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `withBorder` | `bool?` | — | não | React | — |
| `initialValue` | `Object?` | — | não | Flutter | Valor inicial sem formulario (no React, `inputProps.defaultValue`): "1234.56". |
| `value` | `Object?` | — | não | Flutter | Valor controlado de fora (no React, `inputProps.value`). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Diferença de plataforma:** sem `Intl` no Dart. Símbolo, posição e separadores vêm de tabela gerada do Node (30 locales latinos; 162 moedas); locale sem dados cai no idioma e depois em `en-US`. O React trata cada tecla e o Flutter recebe a diferença de texto.
- **Não portado:** `inputProps` (aceito e ignorado), `className`/`style`/`register` (3 props omitidas de propósito). O widget não tem `elevation`, `labelPosition`, `labelAlign` nem `labelWidth` (o rótulo só flutua; o React também não tem `labelPosition` aqui) nem `focusNode`.
- O valor entregue é a string canônica com ponto (`"1234.56"`).
- Os validadores do componente rodam também em `handleSubmit` e `trigger` (decisão do dono).
- Limitações de teste registradas: golden com a fonte de teste do Flutter e sem teste em IME nem em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/number/sg_input_currency.dart`, motor em `inputs/number/numeric_field.dart`)
- Mesmos callbacks do `SgInputNumber` (`onChange` com a string canônica `"1234.56"`, `onClear`, `onEnter`, `onExit`, `onValidation`) e a mesma validação (`required`, `minValue`, `maxValue`, `validation`).
- Moeda: `currency` (ISO 4217, padrão `BRL`), `locale` (padrão: o do `SgComponentsI18nProvider`), `currencyDisplay` (padrão `symbol`), `currencySymbolOverride`, `currencySymbolPlacement` (padrão `auto`), `showCurrencySymbol` (padrão `true`), `useGrouping` (padrão `true`). O símbolo vira prefixo ou sufixo, combinado com `prefixText`/`suffixText` (`combineAffix`). `decimals` omitido usa as casas da moeda (`meta.minorUnit`).

**Controller, formulário e estado**
- Igual ao `SgInputNumber` (mesmo `NumericField`): `name` + `control`/`SgForm`, `initialValue`/`value` como `Object?`, `FocusNode` interno não exposto, `SgSelfValidating` para o `SgWizard`.

**Acessibilidade**
- Igual ao `SgInputNumber`: `Semantics(label, textField: true)` e botão de limpar com `Tooltip` do i18n.

## SgInputOTP

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputOTP` (mesmo nome).

Campo OTP multi-slot para codigos de verificacao com suporte a mascara, colagem, eventos de conclusao e acesso por ref.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/otp/sg_input_otp.dart` (linha 47) · classe `class SgInputOTP extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_input_otp.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgInputOTP({...})` com 31 parâmetro(s) nomeado(s), 28 do contrato React e 3 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgInputOTP

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do componente. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `defaultValue` | `String?` | — | não | React | — |
| `disabled` | `bool?` | `true` † | não | React | No React: `enabled` (valor invertido). |
| `error` | `String?` | — | não | React | — |
| `groupClassName` | `String?` | — | não | React | React-only (classe CSS); sem efeito. |
| `hintText` | `String?` | — | não | React | — |
| `inputProps` | `Object?` | — | não | React | Sem equivalente no Flutter; ignorado. Veja `autofocus` e `autofillHints`. Tipo no React: `(Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" \| "value"> & { ref?: React.Ref<HTMLInputElement>; })`. |
| `label` | `String?` | — | não | React | Rotulo exibido ao usuario. |
| `mask` | `String?` | `999999` † | não | React | Mascara de slots para o codigo. |
| `name` | `String?` | — | não | React | Nome do campo em formularios. |
| `onChange` | `ValueChanged<String>?` | — | não | React | Recebe o valor COM separadores. Tipo no React: `((maskedValue: string) => void)`. |
| `onClear` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onComplete` | `ValueChanged<String>?` | — | não | React | Callback disparado ao completar o codigo. Tipo no React: `((value: string) => void)`. |
| `onEnter` | `VoidCallback?` | — | não | React | Foco entrou no grupo (nao a tecla Enter; igual ao React). Tipo no React: `(() => void)`. |
| `onExit` | `VoidCallback?` | — | não | React | Foco saiu do grupo. Tipo no React: `(() => void)`. |
| `onRawChange` | `ValueChanged<String>?` | — | não | React | Callback com o valor bruto do codigo. Tipo no React: `((rawValue: string) => void)`. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | Callback para estado de validacao. Tipo no React: `((message: string) => void)`. |
| `readOnly` | `bool?` | `false` † | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `separatorClassName` | `String?` | — | não | React | React-only (classe CSS); sem efeito. |
| `slotClassName` | `String?` | — | não | React | React-only (classe CSS); sem efeito. |
| `validateOnBlur` | `bool?` | `true` † | não | React | Executa validacao no blur. |
| `validation` | `String? Function(String rawValue, String maskedValue)?` | — | não | React | Recebe (valor sem separadores, valor com separadores) e devolve a mensagem de erro ou nulo. Tipo no React: `((rawValue: string, maskedValue: string) => string)`. |
| `value` | `String?` | — | não | React | Controlado: a cada mudanca de `value` os slots sao refeitos a partir dele. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto 'N%'/'Npx'. Sem valor, a largura do conteudo (fit-content). Tipo no React: `string \| number`. |
| `controller` | `SgInputOTPController?` | — | não | Flutter | Equivale ao `ref` (SgInputOTPRef) do React. |
| `autofocus` | `bool` | `false` | não | Flutter | `inputProps.autoFocus` do primeiro slot. |
| `autofillHints` | `Iterable<String>?` | — | não | Flutter | `inputProps.autoComplete` do primeiro slot; padrao `[AutofillHints.oneTimeCode]` (React: one-time-code). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` e `docs/DIVERGENCIAS_DO_REACT.md` do repositório Flutter; itens marcados como confirmados no código foram conferidos no widget.

- **Diferença de plataforma:** o `ref` imperativo (`SgInputOTPRef`) virou `SgInputOTPController` (parâmetro `controller`), com `focus([slot])`, `clear()`, `getRawValue()` e `getMaskedValue()`. Cada slot é um `TextField`; num slot vazio o texto interno é um caractere invisível (U+200B), para o teclado virtual avisar o Backspace.
- Colar 1 caractere num slot cheio é tratado como digitar (o React limparia os seguintes).
- **Não portado:** `inputProps` e as props de classe CSS (`groupClassName`, `slotClassName`, `separatorClassName`) são aceitas sem efeito; o que `inputProps` fazia (`autoFocus`, `autoComplete` do primeiro slot) virou `autofocus` e `autofillHints` (padrão `[AutofillHints.oneTimeCode]`). `register` não existe (2 props omitidas de propósito).
- Os validadores do componente (`required`, `validation(raw, masked)`) rodam também em `handleSubmit` e `trigger` (decisão do dono).
- Limitações de teste registradas: sem teste em IME nem em dispositivo; golden com fonte de teste.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (`inputs/otp/sg_input_otp.dart`, máscara em `inputs/otp/otp_mask.dart`)
- `onChange: ValueChanged<String>`: valor **com** separadores. `onRawChange: ValueChanged<String>`: valor **sem** separadores. `onComplete: ValueChanged<String>`: todos os slots preenchidos (valor com separadores). `onClear`: chamado quando havia valor e passou a vazio. `onEnter`/`onExit`: foco entrou/saiu do grupo de slots (não a tecla Enter). `onValidation: ValueChanged<String?>`.
- `mask`: `9` = dígito, `#` = alfanumérico, outro caractere = separador; padrão `999999` (máscara vazia ou sem slot cai nele).
- `validation: String? Function(String rawValue, String maskedValue)`. Roda na saída do grupo (`validateOnBlur` padrão `true`) ou a cada mudança quando `false`.

**Controller, formulário e estado**
- `SgInputOTPController` (`controller:`): `focus([índice])`, `clear()`, `getRawValue()`, `getMaskedValue()` (vazios se o controller não está ligado a um widget).
- Formulário: `name` + `control`/`SgForm`; o valor guardado no formulário é o **sem separadores** (`setValue(name, raw)`); `registerField` com validador `_formValidate`, que roda em `trigger`/`handleSubmit`. `value` controlado refaz os slots a cada mudança; `defaultValue` é o valor inicial. Implementa `SgSelfValidating` para o `SgWizard`. `width` omitido = largura do conteúdo.

**Acessibilidade**
- Grupo com `Semantics(container: true, label: labelText ou i18n components.inputs.otp.group)` e cada slot com `Semantics(label: "<rótulo> N" ou i18n components.inputs.otp.slot, textField: true)`; separadores usam `ExcludeSemantics`. Teclado: setas esquerda/direita movem o foco, Backspace e Delete apagam e voltam o foco (`_onKey`). O primeiro slot declara `autofillHints` padrão `oneTimeCode`.

