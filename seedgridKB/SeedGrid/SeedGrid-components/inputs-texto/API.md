---
tags: [seedgrid, component, frontend, react, inputs-texto, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Inputs de texto e documentos (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Inputs de texto: API — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API — Inputs de texto e documentos (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Pacote `@seedgrid/fe-components` versão `2026.7.1` (`packages/seedgrid-fe-components/package.json`). Visão geral: [[SeedGrid/SeedGrid-components/inputs-texto/Visao-geral|Visão geral dos inputs de texto]]. Exemplos: [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos|Exemplos dos inputs de texto]].

## Como as tabelas foram montadas

- **Tipo** e **Obrigatória** vêm do tipo TypeScript `<Componente>Props`, lido com o type checker do próprio pacote (mesma técnica de `scripts/extract-props.mjs`, só que **sem** a lista `IGNORED_PROPS` daquele script). Por isso as tabelas incluem `control`, `register`, `rules`, `inputProps`, `className`, `labelClassName`, `elevation` e `borderRadius`, que o `src/ai-meta/generated-props.json` deixa de fora de propósito. **Confirmado**.
- **Padrão** e **Descrição** foram lidos no corpo de cada componente (desestruturação com default, `??` e uso). **Confirmado**, a menos que a célula diga outra coisa.
- Nenhum `*Props` estende `HTMLAttributes`: atributos DOM só entram por `inputProps`/`textareaProps`. **Confirmado** (contagem de props por tipo: 25 a 72, nunca as centenas de um `HTMLAttributes`).
- Componentes que embrulham o `SgInputText` só listam na tabela as props que **declaram ou redeclaram**. As demais aparecem na linha "Herdadas", que é completa, e seguem o [[#Contrato base SgInputText]].
- `\|` dentro das células é um `|` escapado.

## Importação e exportação pública

Entrada única: `import { … } from "@seedgrid/fe-components"`. O `exports` do `package.json` só expõe `"."` (`dist/index.js` + `dist/index.d.ts`) e `"./style.css"`. Não há subpath por componente. **Confirmado**.

| Componente | Exportado em `src/index.ts` | Tipos públicos exportados |
|---|---|---|
| `SgInputText` | sim | `SgInputTextProps` |
| `SgInputTextArea` | sim | `SgInputTextAreaProps` |
| `SgInputTextSearch` | sim | `SgInputTextSearchProps` |
| `SgInputEmail` | sim | nenhum (`SgInputEmailProps` existe no arquivo mas não é reexportado) |
| `SgInputPassword` | sim | nenhum (`SgInputPasswordProps` não reexportado) |
| `SgInputPhone` | sim | `SgInputPhoneProps` |
| `SgInputCPF` | sim | `SgInputCPFProps` |
| `SgInputCNPJ` | sim | `SgInputCNPJProps` |
| `SgInputCPFCNPJ` | sim | `SgInputCPFCNPJProps` |
| `SgInputPostalCode` | sim | `SgInputPostalCodeProps`, `PostalCodeCountry`, `ViaCepResponse` |
| `SgInputBirthDate` | sim | nenhum (`SgInputBirthDateProps` não reexportado; `BirthDatePolicy` sim, via `validators`) |
| `SgInputDate` | sim | nenhum (`SgInputDateProps` não reexportado) |
| `SgInputNumber` | sim | `SgInputNumberProps` |
| `SgInputCurrency` | sim | `SgInputCurrencyProps` |
| `SgInputOTP` | sim | `SgInputOTPProps`, `SgInputOTPRef` |

Para obter o tipo de props que não é reexportado, use `React.ComponentProps<typeof SgInputEmail>`. Isso é **Inferência** (TypeScript padrão), não um padrão documentado pelo pacote.

Utilitários puros relacionados, também exportados: `onlyDigits`, `maskCpf`, `maskCnpj`, `maskCpfCnpj`, `maskCep`, `maskPostalCodeBR/PT/US/ES/UY/AR/PY`, `maskPhone` (`src/masks.ts`), além de `isValidCpf`, `isValidCnpj`, `isValidEmail`, `isBlockedEmailDomain`, `getBlockedEmailDomains`, `DEFAULT_BLOCKED_EMAIL_DOMAINS`, `validatePassword`, `validateBirthDate`, `isDateAfter`, `isDateBefore` e os tipos `PasswordPolicy`/`BirthDatePolicy` (`src/validators.ts`). **Confirmado** em `src/index.ts`.

## Contrato RhfFieldProps (react-hook-form)

Origem: `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/rhf.ts`, tipo `RhfFieldProps`. Ele é misturado (`&` ou `extends`) nos props de quase todos os inputs, inclusive nos dos grupos [[SeedGrid/SeedGrid-components/inputs-selecao/API|inputs de seleção]] e [[SeedGrid/SeedGrid-components/editor/API|editor]].

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no formulário. Sozinho não faz nada. |
| `control` | `any` | — | Não | `control` do `useForm()`. Com `name`, o componente se envolve em `<Controller>`. Tipado como `any` de propósito, para aceitar o `Control` de qualquer formulário tipado (comentário no próprio arquivo). |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`. Com `name`, chama `register(name, rules)` e liga `onChange`/`onBlur`/`ref` ao elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras do RHF. |
| `error` | `string` | — | Não | Erro externo exibido pelo componente. |

Regras comuns, todas **Confirmado** no código de cada componente:
- **Precedência:** quando `name` + `register` **e** `control` são passados juntos, o `register` vence em `SgInputText`, `SgInputTextArea`, `SgInputNumber`, `SgInputCurrency` e `SgInputOTP` (o `if (name && register)` vem antes).
- **`mergeRequiredRule(rules, required, message)`:** com `required={true}`, injeta `required: <mensagem i18n>` nas `rules`, a menos que já exista uma regra `required` explícita. É usado por `SgInputText`, `SgInputTextArea`, `SgInputNumber`, `SgInputCurrency` e `SgInputOTP` (e, no outro grupo, por `SgAutocomplete`, `SgCheckboxGroup`, `SgRadioGroup`, `SgToggleSwitch` e `SgRating`).
- **`resolveFieldError(...erros)`:** devolve o primeiro erro não vazio. No caminho `control`, a ordem é `error` (prop) e depois `fieldState.error.message`.
- **Valor gravado no formulário:**
  - `SgInputText` e derivados gravam a string do input, já com `prefixText`/`suffixText`.
  - `SgInputNumber`/`SgInputCurrency` gravam a string canônica (`"1234.50"`).
  - `SgInputOTP` grava o valor **bruto** (sem separadores da máscara).
- Os wrappers que não fazem a integração sozinhos (Email, Password, Phone, CPF, CNPJ, CPFCNPJ, PostalCode, Date, BirthDate, TextSearch) repassam `name`/`control`/`register`/`rules` ao `SgInputText`, que faz a ligação. Exceção: o `SgInputPassword` também repassa, mas não está coberto por teste de RHF.

## Contrato base SgInputText

Fonte: `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgInputText.tsx` → `SgInputText`, `SgInputTextBase`. Import: `import { SgInputText, type SgInputTextProps } from "@seedgrid/fe-components";`. São 46 props, incluindo as 5 do contrato RHF.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro externo; tem precedência sobre o erro interno (com `control`, combinado com `fieldState.error` via `resolveFieldError`). |
| `id` | `string` | — | Sim | `id` do `<input>`; também usado no `htmlFor` do rótulo. |
| `label` | `string` | — | Não | Rótulo (usado quando `labelText` não é informado). |
| `labelText` | `string` | — | Não | Rótulo; precedência sobre `label`. |
| `labelPosition` | `"float" \| "top" \| "left"` | `"float"` | Não | Rótulo flutuante dentro do campo, acima (`top`) ou à esquerda (`left`, grid a partir de `sm`). |
| `labelWidth` | `string \| number` | `"11rem"` | Não | Largura da coluna do rótulo com `labelPosition="left"` (número = px). |
| `labelAlign` | `"start" \| "center" \| "end"` | `"start"` | Não | Alinhamento do texto do rótulo com `labelPosition="left"`. |
| `elevation` | `"none" \| "sm" \| "md" \| "lg"` | sombra `sm` | Não | Sombra: `none`, `md`, `lg`; qualquer outro valor (inclusive ausente) aplica `shadow-sm`. |
| `hintText` | `string` | — | Não | Placeholder alternativo (usado quando `placeholder` está ausente). |
| `prefixText` | `string` | — | Não | Afixo fixo à esquerda. O valor emitido (`onChange`/RHF) é `prefixText + digitado + suffixText`; ao exibir, o afixo é removido. |
| `suffixText` | `string` | — | Não | Afixo fixo à direita (mesma regra de `prefixText`). |
| `type` | `HTMLInputTypeAttribute` | `"text"` | Não | Atributo `type` do `<input>`. |
| `placeholder` | `string` | rótulo (float) / `""` | Não | Placeholder. Com rótulo flutuante: `placeholder ?? hintText ?? rótulo` (fica transparente); senão `placeholder ?? hintText ?? ""`. |
| `className` | `string` | classes internas | Não | SUBSTITUI toda a classe padrão do `<input>` (não concatena). |
| `labelClassName` | `string` | — | Não | Classes extras no `<label>`. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>` nativo, espalhados depois dos atributos calculados (podem sobrescrevê-los). `ref`, `onChange` e `onBlur` são encadeados; `onFocus` de `inputProps` não é chamado (use `onEnter`). `value` torna o campo controlado. |
| `maxLength` | `number` | — | Não | Atributo `maxLength` e validação (`components.inputs.maxLength`). |
| `maxLengthMessage` | `string` | i18n | Não | Mensagem de `maxLength`. |
| `minLength` | `number` | — | Não | Validação de tamanho mínimo (`components.inputs.minLength`). |
| `minLengthMessage` | `string` | i18n | Não | Mensagem de `minLength`. |
| `minNumberOfWords` | `number` | — | Não | Mínimo de palavras (separadas por espaço) (`components.inputs.minWords`). |
| `minNumberOfWordsMessage` | `string` | i18n | Não | Mensagem de `minNumberOfWords`. |
| `prefixIcon` | `ReactNode` | — | Não | Ícone à esquerda dentro do campo. |
| `width` | `string \| number` | `"100%"` | Não | Largura do wrapper (`style.width`). |
| `clearButton` | `boolean` | `true` | Não | Exibe botão limpar (X); oculto com `enabled={false}` ou `readOnly`. |
| `filled` | `boolean` | `false` | Não | Fundo preenchido (`bg-muted/40`). |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` desabilita o `<input>` (`disabled`). |
| `textInputType` | `"none" \| "email" \| "search" \| "tel" \| "text" \| "url" \| "numeric" \| "decimal"` | — | Não | `inputMode` do `<input>` (precedência sobre `inputProps.inputMode`). |
| `onEnter` | `(() => void)` | — | Não | Chamado ao receber foco. |
| `onExit` | `(() => void)` | — | Não | Chamado ao perder o foco (após a validação). |
| `onChange` | `((value: string) => void)` | — | Não | `(value: string) => void` a cada alteração; valor inclui afixos; `""` ao limpar. |
| `onClear` | `(() => void)` | — | Não | Chamado ao clicar no botão limpar. |
| `withBorder` | `boolean` | `true` | Não | Exibe borda; com erro a borda vermelha aparece mesmo com `false`. |
| `borderRadius` | `string \| number` | — | Não | Raio da borda (número = px). |
| `required` | `boolean` | `false` | Não | Valida vazio, exibe `*` e injeta `required` nas `rules` do RHF (`mergeRequiredRule`). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `showCharCounter` | `boolean` | `false` | Não | Contador `n` ou `n/maxLength` abaixo do campo. |
| `iconButtons` | `ReactNode[]` | — | Não | Nós extras à direita (após o X). |
| `readOnly` | `boolean` | `false` | Não | Somente leitura (também oculta o X). |
| `validation` | `((value: string) => string \| null)` | — | Não | Validador executado por último (após required/maxLength/minLength/minNumberOfWords); retorna mensagem ou `null`. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |

**Ordem de validação interna** (`runValidation`): `required` → `maxLength` → `minLength` → `minNumberOfWords` → `validation`. A primeira falha vira o erro interno e é enviada a `onValidation`. A validação roda no blur (padrão) ou a cada alteração com `validateOnBlur={false}`. **Confirmado**.

**Eventos**: `onChange(value: string)` (valor completo com afixos), `onEnter()` no foco, `onExit()` no blur, `onClear()` no botão X e `onValidation(msg | null)`. Não há `ref`/`forwardRef` no componente: para acessar o `<input>`, use `inputProps.ref`, que é mesclado com o ref do RHF. **Confirmado**.

**Controlado vs. não controlado**: o modo é controlado quando há `inputProps.value` ou `control`. Sem eles, o campo é não controlado (DOM). O teste `tests/inputs-dom.test.mjs` cobre o modo controlado ("keeps the typed value when controlled through inputProps.value / react-hook-form"). **Confirmado**.

**Acessibilidade comprovável**:
- `<label htmlFor={id}>` em todas as posições de rótulo.
- O botão limpar tem `aria-label` = i18n `components.actions.clear` e `tabIndex={-1}`.
- O asterisco de obrigatório usa `aria-hidden`.

Não há `aria-invalid` nem `aria-describedby` ligando o erro ao input: o erro é um `<p data-sg-error>`. **Confirmado** pela ausência no código.

**Ponto de atenção**: `inputProps.onFocus` é sobrescrito pelo handler interno `onFocus={handleFocus}`, que vem depois do spread no JSX. Para reagir ao foco, use `onEnter`. **Confirmado** pela ordem dos atributos.

## SgInputTextArea

Fonte: `src/inputs/SgInputTextArea.tsx` → `SgInputTextArea`. Não deriva do `SgInputText`: é uma implementação paralela sobre `<textarea>`, com o mesmo estilo de props. Import: `import { SgInputTextArea } from "@seedgrid/fe-components";`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | `id` do `<textarea>`. |
| `label` | `string` | — | Não | Rótulo (fallback de `labelText`). |
| `labelText` | `string` | — | Não | Rótulo; precedência sobre `label`. |
| `labelPosition` | `"float" \| "top" \| "left"` | `"float"` | Não | `float`, `top` ou `left`. |
| `labelWidth` | `string \| number` | `"11rem"` | Não | Largura do rótulo em `left` (número = px). |
| `labelAlign` | `"start" \| "center" \| "end"` | `"start"` | Não | Alinhamento do rótulo em `left`. |
| `elevation` | `"none" \| "sm" \| "md" \| "lg"` | sombra `sm` | Não | `none`, `md`, `lg`; demais valores → `shadow-sm`. |
| `hintText` | `string` | — | Não | Placeholder (em float, fallback para o rótulo). |
| `error` | `string` | — | Não | Mensagem de erro externa exibida abaixo do campo. |
| `className` | `string` | classes internas | Não | Substitui a classe padrão do `<textarea>`. |
| `labelClassName` | `string` | — | Não | Classes extras no rótulo. |
| `textareaProps` | `(TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement>; })` | — | Não | Atributos do `<textarea>` nativo (inclui `ref`, `value`, `onChange`, `onBlur`). |
| `maxLength` | `number` | — | Não | Atributo e validação (`components.inputs.textarea.maxLength`). |
| `maxLengthMessage` | `string` | i18n | Não | Mensagem de `maxLength`. |
| `maxLines` | `number` | `2` (rows) | Não | Usado como atributo `rows` do `<textarea>` (não limita linhas digitadas). |
| `minLines` | `number` | — | Não | Mínimo de linhas (`components.inputs.textarea.minLines`). |
| `minLinesMessage` | `string` | i18n | Não | Mensagem de `minLines`. |
| `minLength` | `number` | — | Não | Tamanho mínimo (`components.inputs.textarea.minLength`). |
| `minLengthMessage` | `string` | i18n | Não | Mensagem de `minLength`. |
| `minNumberOfWords` | `number` | — | Não | Mínimo de palavras (`components.inputs.textarea.minWords`). |
| `minNumberOfWordsMessage` | `string` | i18n | Não | Mensagem de `minNumberOfWords`. |
| `required` | `boolean` | `false` | Não | Valida vazio (`components.inputs.textarea.required`) e injeta `required` nas rules RHF. |
| `requiredMessage` | `string` | i18n `components.inputs.textarea.required` | Não | Mensagem de obrigatório. |
| `prefixIcon` | `ReactNode` | — | Não | Ícone à esquerda. |
| `width` | `string \| number` | `"100%"` | Não | Largura do wrapper. |
| `height` | `string \| number` | — | Não | Altura do `<textarea>` (número = px). |
| `clearButton` | `boolean` | `true` | Não | Botão limpar (oculto quando desabilitado/readOnly). |
| `filled` | `boolean` | `false` | Não | Fundo preenchido. |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` → `disabled` + `readOnly`. |
| `showCharCounter` | `boolean` | `false` | Não | Contador de caracteres. |
| `onEnter` | `(() => void)` | — | Não | Chamado ao receber foco. |
| `onExit` | `(() => void)` | — | Não | Chamado ao perder o foco (após a validação). |
| `onChange` | `((value: string) => void)` | — | Não | `(value: string) => void` a cada alteração; `""` ao limpar. |
| `onClear` | `(() => void)` | — | Não | Chamado ao limpar. |
| `withBorder` | `boolean` | `true` | Não | Exibe borda (forçada em erro). |
| `borderRadius` | `string \| number` | — | Não | Raio da borda. |
| `validation` | `((value: string) => string \| null)` | — | Não | Validador final; mensagem ou `null`. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |

- **Validação:** `required` → `maxLength` → `minLength` → `minNumberOfWords` → `minLines` → `validation`. Usa chaves i18n próprias (`components.inputs.textarea.*`).
- **RHF:** `register` ou `control`, com `mergeRequiredRule` (o teste `tests/rhf-components-contract.test.mjs` verifica que ambos os caminhos existem).
- **Ref:** sem `forwardRef`; use `textareaProps.ref`.
- `maxLines` só define `rows`.

Tudo **Confirmado**.

## SgInputTextSearch

Fonte: `src/inputs/SgInputTextSearch.tsx`. Envolve o `SgInputText` e acrescenta um debounce feito com `setTimeout` (o comentário do arquivo diz que substitui a versão antiga, que usava rxjs).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `minChars` | `number` | `3` | Não | Tamanho mínimo (após `trim`) para emitir `onSearchChange`; string vazia sempre é emitida. |
| `debounceMs` | `number` | `350` | Não | Atraso do debounce em ms. |
| `onChange` | `((value: string) => void)` | — | Não | Disparado imediatamente a cada digitação, com o valor cru. |
| `onSearchChange` | `(value: string) => void` | — | Sim | Disparado após o debounce com o valor normalizado (`trim`), respeitando `minChars` e sem repetir o último valor emitido (distinct). Não dispara na montagem. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (45):** `required`, `maxLength`, `minLength`, `name`, `control`, `register`, `rules`, `error`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onEnter`, `onExit`, `onClear`, `withBorder`, `borderRadius`, `requiredMessage`, `showCharCounter`, `iconButtons`, `readOnly`, `validation`, `validateOnBlur`, `onValidation`.

**Removidas do contrato base:** nenhuma.

- O valor exibido é estado interno: o componente injeta `inputProps.value`, então um `inputProps.value` externo é sobrescrito. **Confirmado**.
- O teste `tests/inputs-dom.test.mjs` cobre: `onChange` imediato, `onSearchChange` só depois do debounce, `minChars` padrão 3 com `trim`, a regra "distinct" (não repete o último valor) e o debounce de digitação rápida. **Confirmado**.

## SgInputEmail

Fonte: `src/inputs/SgInputEmail.tsx`. Fixa `type="email"` e usa `textInputType` padrão `"email"`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida campo vazio e exibe `*` no rótulo. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `iconButtons` | `ReactNode[]` | — | Não | Nós extras à direita. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado; roda ANTES da checagem de formato. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `invalidMessage` | `string` | i18n `components.inputs.email.invalid` | Não | Mensagem de formato inválido (regex `/.+@.+\..+/`). |
| `blockFakeMail` | `boolean` | `true` | Não | Rejeita domínios de e-mail temporário (mensagem fixa i18n `components.inputs.email.tempInvalid`). |
| `blockedEmailDomains` | `string[]` | — | Não | Domínios extras a bloquear; somados à lista padrão `DEFAULT_BLOCKED_EMAIL_DOMAINS` e a `globalThis.__seedgridBlockedEmailDomains`. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `placeholder`, `className`, `labelClassName`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onEnter`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `readOnly`.

**Removidas do contrato base (`Omit`) (1):** `type`.

- **Ordem de validação:** `required` → `validation` → formato (`isValidEmail`) → domínio bloqueado (`isBlockedEmailDomain`, quando `blockFakeMail` está ligado).
- Chaves i18n: `components.inputs.required`, `components.inputs.email.invalid`, `components.inputs.email.tempInvalid`.

**Confirmado**.

## SgInputPassword

Fonte: `src/inputs/SgInputPassword.tsx`. Usa `type="password"` ou `"text"` conforme o botão de olho, e inclui barra de força, lista de requisitos e gerador de senha.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `maxLength` | `number` | `15` | Não | Repassado ao `SgInputText` como `maxLength` (padrão 15 — atenção para frases-senha); também teto da senha gerada. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a 1ª regra não atendida (ou `null`). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `required` | `boolean` | `false` | Não | Valida campo vazio e exibe `*` no rótulo. |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `hidePassword` | `boolean` | `true` | Não | Estado inicial do olho (senha oculta). Há botão para alternar. |
| `validation` | `((value: string) => string \| null)` | — | Não | Regra extra; a mensagem entra na lista de requisitos não atendidos. |
| `createNewPasswordButton` | `boolean` | `false` | Não | Mostra botão que gera senha aleatória (via `crypto.getRandomValues`) respeitando a política. |
| `newPasswordLength` | `number` | `minSize` | Não | Tamanho da senha gerada (limitado por `maxLength`). |
| `showStrengthBar` | `boolean` | `true` | Não | Barra de força (5 segmentos). |
| `commonPasswordCheck` | `boolean` | `true` | Não | Rejeita senhas comuns (lista interna, limitada a 1000 entradas). |
| `commonPasswordMessage` | `string` | i18n `components.password.common` | Não | Mensagem de senha comum. |
| `commonPasswordList` | `string[]` | — | Não | Senhas comuns extras, acrescentadas ao fim da lista interna (o conjunto é truncado em 1000 itens). |
| `upperRequired` | `boolean` | `true` | Não | Exige maiúscula. |
| `lowerRequired` | `boolean` | `true` | Não | Exige minúscula. |
| `numberRequired` | `boolean` | `true` | Não | Exige dígito. |
| `specialCharacterRequired` | `boolean` | `true` | Não | Exige caractere especial do conjunto ``!@#$%^&*()_+-=[]{};':"\|,.<>/?``. |
| `prohibitsRepeatedCharactersInSequence` | `boolean` | `true` | Não | Proíbe dois caracteres iguais seguidos (`/(.)\1/`). |
| `prohibitsSequentialAscCharacters` | `boolean` | `true` | Não | Proíbe sequência crescente de 3 (`abc`, `123`). |
| `prohibitsSequentialDescCharacters` | `boolean` | `true` | Não | Proíbe sequência decrescente de 3 (`cba`, `321`). |
| `minSize` | `number` | `8` | Não | Tamanho mínimo. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (36):** `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `placeholder`, `className`, `labelClassName`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base (`Omit`) (1):** `type`.

- **`onChange(value)`:** declarado no `SgInputText` e consumido aqui. É chamado a cada digitação e também quando a senha é gerada. O teste "SgInputPassword calls the top-level onChange(value) while typing" cobre isso. **Confirmado**.
- **Senha gerada:**
  - Tamanho: `max(minSize, newPasswordLength ?? minSize, nº de grupos exigidos)`, limitado por `maxLength`.
  - Tenta até 50 vezes até cumprir a política.
  - Os testes "generates a password with minSize length, not maxLength" e "honours newPasswordLength" cobrem isso.

  **Confirmado**.
- **Força:** número de regras ativas menos o número de regras não cumpridas, mostrado em 5 segmentos.
- **i18n:** `components.password.{minSize,upper,lower,number,special,noRepeat,noSeqAsc,noSeqDesc,common,show,hide,generate}`.
- **Acessibilidade:** os botões de olho e de gerar têm `aria-label` traduzido. O ícone de revelar nativo do Edge é escondido via `[data-sg-password]::-ms-reveal`.

**Confirmado**.

## SgInputPhone

Fonte: `src/inputs/SgInputPhone.tsx`. Aplica a máscara `maskPhone` a cada digitação e aceita 10 ou 11 dígitos (BR). Usa `textInputType="numeric"` como padrão.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida campo vazio e exibe `*` no rótulo. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado, roda antes da checagem de dígitos. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `inputMode` padrão `numeric`. `onChange`/`onBlur` são encadeados após a máscara/validação. |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `lengthMessage` | `string` | i18n `components.inputs.phone.invalid` | Não | Mensagem quando não há 10 ou 11 dígitos. |
| `invalidMessage` | `string` | i18n `components.inputs.phone.invalid` | Não | Fallback de `lengthMessage`. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base:** nenhuma.

Teste: "SgInputPhone shows the required asterisk when required is true". **Confirmado**.

## SgInputCPF

Fonte: `src/inputs/SgInputCPF.tsx`. Aplica `maskCpf`, exige 11 dígitos e valida com `isValidCpf`. Particularidade: o `maxLength` passado ao `SgInputText` tem padrão **`18`**, embora o CPF mascarado tenha 14 caracteres. **Confirmado** (`maxLength={rest.maxLength ?? 18}`).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida vazio (validação interna do wrapper). **Não** é repassado ao `SgInputText`: o rótulo não mostra `*` e nenhuma regra `required` é injetada no RHF. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado, roda antes das checagens de tamanho/dígito. |
| `validateOnBlur` | `boolean` | `true` | Não | Valida no blur. A validação também roda a cada digitação (no `onChange` mascarado). |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `inputMode` padrão `numeric`. |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `lengthMessage` | `string` | i18n `components.inputs.cpf.length` | Não | Mensagem quando não há 11 dígitos. |
| `invalidMessage` | `string` | i18n `components.inputs.cpf.invalid` | Não | Mensagem de dígito verificador inválido (`isValidCpf`). |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base:** nenhuma.

O valor emitido em `onChange` e no RHF é a string **mascarada** (`000.000.000-00`). **Confirmado**: a máscara é aplicada ao `event.target.value` antes de propagar.

## SgInputCNPJ

Fonte: `src/inputs/SgInputCNPJ.tsx`. Aplica `maskCnpj` e aceita CNPJ **alfanumérico**: 14 caracteres `[0-9A-Z]`, em maiúsculas. Valida com `isValidCnpj`. O `maxLength` padrão é `18`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida vazio (validação interna do wrapper). **Não** é repassado ao `SgInputText`: o rótulo não mostra `*` e nenhuma regra `required` é injetada no RHF. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado, roda antes das checagens. |
| `validateOnBlur` | `boolean` | `true` | Não | Valida no blur; também valida a cada digitação. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `inputMode` padrão `text` (CNPJ alfanumérico). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `lengthMessage` | `string` | i18n `components.inputs.cnpj.length` | Não | Mensagem quando não há 14 caracteres alfanuméricos. |
| `invalidMessage` | `string` | i18n `components.inputs.cnpj.invalid` | Não | Mensagem de CNPJ inválido (`isValidCnpj`). |
| `validateWithPublicaCnpj` | `boolean` | `false` (falsy) | Não | Consulta o CNPJ (somente numérico) em serviço externo; sem dados → erro. Resultado cacheado para o último CNPJ. |
| `publicaCnpjErrorMessage` | `string` | `invalidMessage` / i18n | Não | Mensagem quando a consulta não retorna dados. |
| `publicaCnpjFetch` | `((cnpj: string) => Promise<unknown>)` | `fetch("https://publica.cnpj.ws/cnpj/<cnpj>")` | Não | Função de consulta substituível; retorna dados ou `null`. |
| `onPublicaCnpjResult` | `((data: unknown) => void)` | — | Não | Recebe o retorno da consulta (ou `null`). |
| `onPublicaCnpjError` | `((error: unknown) => void)` | — | Não | Recebe exceções da consulta (a validação então passa). |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base:** nenhuma.

- A consulta externa só acontece para CNPJ totalmente numérico (`!/[A-Z]/.test(raw)`). É uma chamada de rede ao vivo para `https://publica.cnpj.ws/cnpj/<cnpj>`, salvo quando `publicaCnpjFetch` é passado.
- A validação é `async`. O erro é atualizado quando a promise resolve.

**Confirmado**.

## SgInputCPFCNPJ

Fonte: `src/inputs/SgInputCPFCNPJ.tsx`. Aplica `maskCpfCnpj`. Trata o valor como CNPJ quando há letra ou mais de 11 caracteres; caso contrário, como CPF. O `maxLength` padrão é `18`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida vazio (validação interna do wrapper). **Não** é repassado ao `SgInputText`: o rótulo não mostra `*` e nenhuma regra `required` é injetada no RHF. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado, roda antes das checagens. |
| `validateOnBlur` | `boolean` | `true` | Não | Valida no blur; também valida a cada digitação. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `inputMode` padrão `text`. |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `lengthMessage` | `string` | i18n (`cpf.length` / `cnpj.length`) | Não | Mensagem de tamanho (vale para os dois tipos). |
| `invalidMessage` | `string` | i18n (`cpf.invalid` / `cnpj.invalid`) | Não | Mensagem de inválido (vale para os dois tipos). |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base:** nenhuma.

## SgInputPostalCode

Fonte: `src/inputs/SgInputPostalCode.tsx` → `COUNTRY_CONFIGS`. A máscara, o tamanho e o `inputMode` dependem de `country`.

| País | Máscara | Tamanho bruto aceito | `maxLength` padrão | `inputMode` |
|---|---|---|---|---|
| BR | `maskPostalCodeBR` | 8 | 10 | numeric |
| PT | `maskPostalCodePT` | 7 | 8 | numeric |
| US | `maskPostalCodeUS` | 5 ou 9 | 10 | numeric |
| ES | `maskPostalCodeES` | 5 | 5 | numeric |
| UY | `maskPostalCodeUY` | 5 | 5 | numeric |
| AR | `maskPostalCodeAR` | 4 ou 8 (alfanumérico) | 8 | text |
| PY | `maskPostalCodePY` | 6 | 6 | numeric |

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida vazio (validação interna do wrapper). **Não** é repassado ao `SgInputText`: o rótulo não mostra `*` e nenhuma regra `required` é injetada no RHF. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `(value: string) => string \| null` | — | Não | Validador customizado, roda antes da checagem de tamanho. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `inputMode` padrão por país. |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `country` | `PostalCodeCountry` | `"BR"` | Não | País da máscara/validação: `BR`, `PT`, `US`, `ES`, `UY`, `AR`, `PY`. |
| `lengthMessage` | `string` | i18n `components.inputs.postalCode.<país>.length` | Não | Mensagem de tamanho. Tamanhos: BR 8, PT 7, US 5 ou 9, ES 5, UY 5, AR 4 ou 8 (alfanumérico), PY 6. |
| `invalidMessage` | `string` | i18n `components.inputs.postalCode.<país>.invalid` | Não | Mensagem de CEP inexistente (só usada com ViaCEP). |
| `validateWithViaCep` | `boolean` | `false` (falsy) | Não | Só para `country="BR"`: consulta o CEP; `erro: true` → inválido. Último CEP consultado é cacheado. |
| `viaCepErrorMessage` | `string` | `invalidMessage` / i18n | Não | Mensagem para CEP não encontrado. |
| `viaCepFetch` | `((cep: string) => Promise<ViaCepResponse>)` | `fetch("https://viacep.com.br/ws/<cep>/json/")` | Não | Função de consulta substituível. |
| `onViaCepResult` | `((data: ViaCepResponse) => void)` | — | Não | Recebe o `ViaCepResponse`. |
| `onViaCepError` | `((error: unknown) => void)` | — | Não | Recebe exceções da consulta (a validação passa). |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `hintText`, `prefixText`, `suffixText`, `type`, `placeholder`, `className`, `labelClassName`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `filled`, `enabled`, `textInputType`, `onClear`, `withBorder`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`.

**Removidas do contrato base:** nenhuma.

- `ViaCepResponse` (exportado) tem os campos `{cep?, logradouro?, complemento?, bairro?, localidade?, uf?, ibge?, gia?, ddd?, siafi?, erro?}`.
- A configuração de cada país tem um campo `placeholder` (por exemplo `"00000-000"`), mas ele **não é usado** na renderização: uso não encontrado.

**Confirmado**.

## SgInputDate

Fonte: `src/inputs/SgInputDate.tsx`. Envolve um `SgInputText` com `type="date"` (widget nativo do navegador).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `minDate` | `string \| Date` | — | Não | Data mínima (`"yyyy-MM-dd"` ou `Date`): atributo `min` e validação (`components.inputs.date.min`/`range`). |
| `maxDate` | `string \| Date` | — (atributo HTML `9999-12-31`) | Não | Data máxima: atributo `max` e validação. Sem valor, só o atributo recebe `9999-12-31` para conter o ano em 4 dígitos. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (37):** `required`, `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `error`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `prefixText`, `suffixText`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `enabled`, `textInputType`, `onClear`, `borderRadius`, `requiredMessage`, `showCharCounter`, `iconButtons`, `readOnly`, `validation`, `validateOnBlur`, `onValidation`.

**Removidas do contrato base (`Omit`) (1):** `type`.

- O rótulo é sempre estático, no topo da borda. O rótulo interno do `SgInputText` vira `sr-only`.
- O estilo do input é calculado pelo próprio `SgInputDate`. Para trocar a classe do `<input>`, use `inputProps.className`.
- `required` e `onValidation` **não** são repassados ao `SgInputText`: não aparece `*` e não há `required` automático nas regras do RHF.
- O valor é a string ISO do input nativo (`yyyy-MM-dd`).
- O tema claro/escuro do picker vem de `color-scheme`, via `useDarkFlag()`.
- **Mensagens de erro:**
  - Chaves: `components.inputs.date.{invalid,min,max,range}`.
  - As datas aparecem como `dd/MM/yyyy`, exceto no locale `en-US`, que mantém o ISO.

**Confirmado**.

## SgInputBirthDate

Fonte: `src/inputs/SgInputBirthDate.tsx`. Envolve o `SgInputDate` e acrescenta a política de idade (`BirthDatePolicy` de `src/validators.ts`).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `required` | `boolean` | `false` | Não | Valida vazio (`components.inputs.birthdate.required`). Não é repassado ao `SgInputText` (sem `*` e sem regra RHF automática). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `onEnter` | `() => void` | — | Não | Chamado ao receber foco. |
| `onExit` | `() => void` | — | Não | Chamado ao perder o foco (após a validação). |
| `requiredMessage` | `string` | i18n `components.inputs.birthdate.required` | Não | Mensagem de obrigatório. |
| `validateOnBlur` | `boolean` | `true` | Não | Valida idade no blur. |
| `onValidation` | `(message: string \| null) => void` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `minAge` | `number` | — | Não | Idade mínima: deriva `maxDate` (hoje − minAge anos) e valida via `validateBirthDate`. |
| `maxAge` | `number` | — | Não | Idade máxima: deriva `minDate` (hoje − maxAge anos). **Sem `minAge` nem `maxAge`, qualquer data preenchida gera o erro `components.validators.birthdate.configMissing`.** |
| `maxDate` | `string \| Date` | minAge derivado ou hoje | Não | Sobrescreve a data máxima derivada. |
| `minDate` | `string \| Date` | maxAge derivado | Não | Sobrescreve a data mínima derivada. |

**Herdadas de `SgInputText` (tipo inalterado; ver contrato base) (32):** `maxLength`, `minLength`, `onChange`, `name`, `control`, `register`, `rules`, `id`, `label`, `labelText`, `labelPosition`, `labelWidth`, `labelAlign`, `elevation`, `prefixText`, `suffixText`, `inputProps`, `maxLengthMessage`, `minLengthMessage`, `minNumberOfWords`, `minNumberOfWordsMessage`, `prefixIcon`, `width`, `clearButton`, `enabled`, `textInputType`, `onClear`, `borderRadius`, `showCharCounter`, `iconButtons`, `readOnly`, `validation`.

**Removidas do contrato base (`Omit`) (1):** `type`.

Pegadinha (**Confirmado** em `validateBirthDate`): sem `minAge` nem `maxAge`, ao preencher qualquer data o componente mostra "Configuração inválida: informe minAge e/ou maxAge." (`components.validators.birthdate.configMissing`). Os exemplos do showcase sempre passam `minAge`/`maxAge`.

## SgInputNumber

Fonte: `src/inputs/SgInputNumber.tsx`. Implementação própria, não deriva do `SgInputText`. A digitação é tratada tecla a tecla, em estado `{negative, intDigits, decDigits, hasDecimal}`. Os separadores vêm de `Intl.NumberFormat(i18n.locale)`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `id` | `string` | — | Sim | `id` do `<input>`. |
| `label` | `string` | — | Não | Rótulo. |
| `labelText` | `string` | — | Não | Rótulo; precedência sobre `label`. |
| `labelPosition` | `"float" \| "top" \| "left"` | `"float"` | Não | `float`, `top` ou `left`. |
| `labelWidth` | `string \| number` | `"11rem"` | Não | Largura do rótulo em `left`. |
| `labelAlign` | `"start" \| "center" \| "end"` | `"start"` | Não | Alinhamento do rótulo em `left`. |
| `elevation` | `"none" \| "sm" \| "md" \| "lg"` | sombra `sm` | Não | `none`, `md`, `lg`; demais → `shadow-sm`. |
| `hintText` | `string` | — | Não | Placeholder alternativo. |
| `prefixText` | `string` | — | Não | Afixo visual à esquerda (não entra no valor emitido). |
| `suffixText` | `string` | — | Não | Afixo visual à direita. |
| `decimals` | `number` | `2` | Não | Casas decimais (0 = inteiro). |
| `allowNegative` | `boolean` | `true` | Não | Permite negativo (tecla `-` alterna o sinal). |
| `emptyValue` | `"null" \| "zero"` | `"zero"` | Não | Valor ao apagar tudo/limpar: `"zero"` → `0`, `"null"` → string vazia. |
| `type` | `HTMLInputTypeAttribute` | `"text"` | Não | Atributo `type`. |
| `placeholder` | `string` | rótulo (float) | Não | Placeholder. |
| `className` | `string` | classes internas | Não | Substitui a classe padrão do `<input>`. |
| `labelClassName` | `string` | — | Não | Classes do rótulo. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `value`/`defaultValue` de `inputProps` servem como valor externo/inicial; `onChange` recebe evento sintético com o valor canônico. |
| `maxValue` | `number` | — | Não | Máximo (`components.inputs.number.max`). |
| `minValue` | `number` | — | Não | Mínimo (`components.inputs.number.min`). |
| `minValueMessage` | `string` | i18n | Não | Mensagem de mínimo. |
| `maxValueMessage` | `string` | i18n | Não | Mensagem de máximo. |
| `prefixIcon` | `ReactNode` | — | Não | Ícone à esquerda. |
| `width` | `string \| number` | `"100%"` | Não | Largura do wrapper. |
| `clearButton` | `boolean` | `true` | Não | Botão limpar (aplica `emptyValue`). |
| `filled` | `boolean` | `false` | Não | Fundo preenchido. |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` desabilita. |
| `textInputType` | `"none" \| "email" \| "search" \| "tel" \| "text" \| "url" \| "numeric" \| "decimal"` | `"decimal"` | Não | `inputMode` do `<input>`. |
| `onEnter` | `(() => void)` | — | Não | Chamado ao receber foco. |
| `onExit` | `(() => void)` | — | Não | Chamado ao perder o foco (após a validação). |
| `onChange` | `((value: string) => void)` | — | Não | Valor canônico string: ponto decimal, sem separador de milhar, decimais completas (ex.: `"1234.50"`, `"-3.00"`); `""` quando vazio com `emptyValue="null"`. |
| `onClear` | `(() => void)` | — | Não | Chamado ao limpar. |
| `withBorder` | `boolean` | `true` | Não | Exibe borda. |
| `borderRadius` | `string \| number` | — | Não | Raio da borda. |
| `required` | `boolean` | `false` | Não | Valida vazio e injeta `required` nas rules RHF. |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `iconButtons` | `ReactNode[]` | — | Não | Nós extras à direita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura (ignora teclas/cola). |
| `validation` | `((value: string) => string \| null)` | — | Não | Validador final; recebe o valor canônico. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |

- **Valor:** string canônica, ou `""` com `emptyValue="null"`. Para obter número, faça `Number(valor)`.
- **Teclas:**
  - `-` ou `_` alternam o sinal.
  - `.`, `,` e o separador do locale abrem a parte decimal.
  - Backspace/Delete apagam da direita para a esquerda.
  - Ctrl/Meta/Alt e as teclas de navegação passam direto.
- **Colar:** o texto colado é normalizado.
- **RHF:** com `register`, o valor é enviado como evento sintético `{target: {name, value}}`; com `control`, por `field.onChange(valor)`.

**Confirmado**.

## SgInputCurrency

Fonte: `src/inputs/SgInputCurrency.tsx`. Mesma mecânica do `SgInputNumber`. O símbolo, a posição dele e os separadores vêm de `Intl.NumberFormat(locale, {style: "currency", currency})`. **Diferença**: não tem `labelPosition`, `labelWidth`, `labelAlign` nem `elevation`, então o rótulo é sempre flutuante. **Confirmado** pelo tipo.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `id` | `string` | — | Sim | `id` do `<input>`. |
| `label` | `string` | — | Não | Rótulo. |
| `labelText` | `string` | — | Não | Rótulo; precedência sobre `label`. |
| `hintText` | `string` | — | Não | Placeholder alternativo. |
| `prefixText` | `string` | — | Não | Afixo visual extra, combinado com o símbolo quando este fica à esquerda. |
| `suffixText` | `string` | — | Não | Afixo visual extra, combinado com o símbolo quando este fica à direita. |
| `decimals` | `number` | casas da moeda (`Intl`) | Não | Casas decimais; padrão = `maximumFractionDigits` da moeda (BRL 2, JPY 0). |
| `allowNegative` | `boolean` | `true` | Não | Permite negativo (tecla `-` alterna o sinal). |
| `emptyValue` | `"null" \| "zero"` | `"zero"` | Não | Valor ao apagar tudo/limpar: `"zero"` → `0`, `"null"` → string vazia. |
| `currency` | `string` | `"BRL"` | Não | Código ISO 4217 (convertido para maiúsculas). |
| `locale` | `string` | locale do i18n | Não | Locale para separadores/posição do símbolo. |
| `currencyDisplay` | `"symbol" \| "name" \| "narrowSymbol" \| "code"` | `"symbol"` | Não | `symbol`, `narrowSymbol`, `code`, `name` (`Intl.NumberFormat`). |
| `currencySymbolOverride` | `string` | — | Não | Símbolo customizado. |
| `currencySymbolPlacement` | `"auto" \| "prefix" \| "suffix"` | `"auto"` | Não | `auto` (pelo locale), `prefix`, `suffix`. |
| `showCurrencySymbol` | `boolean` | `true` | Não | Exibe o símbolo. |
| `useGrouping` | `boolean` | `true` | Não | Separador de milhar. |
| `type` | `HTMLInputTypeAttribute` | `"text"` | Não | Atributo `type`. |
| `placeholder` | `string` | rótulo (float) | Não | Placeholder. |
| `className` | `string` | classes internas | Não | Substitui a classe padrão do `<input>`. |
| `labelClassName` | `string` | — | Não | Classes do rótulo. |
| `inputProps` | `(InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos do `<input>`; `value`/`defaultValue` de `inputProps` servem como valor externo/inicial; `onChange` recebe evento sintético com o valor canônico. |
| `maxValue` | `number` | — | Não | Máximo (`components.inputs.number.max`). |
| `minValue` | `number` | — | Não | Mínimo (`components.inputs.number.min`). |
| `minValueMessage` | `string` | i18n | Não | Mensagem de mínimo. |
| `maxValueMessage` | `string` | i18n | Não | Mensagem de máximo. |
| `prefixIcon` | `ReactNode` | — | Não | Ícone à esquerda. |
| `width` | `string \| number` | `"100%"` | Não | Largura do wrapper. |
| `clearButton` | `boolean` | `true` | Não | Botão limpar (aplica `emptyValue`). |
| `filled` | `boolean` | `false` | Não | Fundo preenchido. |
| `enabled` | `boolean` | `true` (efetivo) | Não | `false` desabilita. |
| `textInputType` | `"none" \| "email" \| "search" \| "tel" \| "text" \| "url" \| "numeric" \| "decimal"` | `"decimal"` | Não | `inputMode` do `<input>`. |
| `onEnter` | `(() => void)` | — | Não | Chamado ao receber foco. |
| `onExit` | `(() => void)` | — | Não | Chamado ao perder o foco (após a validação). |
| `onChange` | `((value: string) => void)` | — | Não | Valor canônico string (ex.: `"1234.56"`), sem símbolo nem separador de milhar. |
| `onClear` | `(() => void)` | — | Não | Chamado ao limpar. |
| `withBorder` | `boolean` | `true` | Não | Exibe borda. |
| `borderRadius` | `string \| number` | — | Não | Raio da borda. |
| `required` | `boolean` | `false` | Não | Valida vazio e injeta `required` nas rules RHF. |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `iconButtons` | `ReactNode[]` | — | Não | Nós extras à direita. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura (ignora teclas/cola). |
| `validation` | `((value: string) => string \| null)` | — | Não | Validador final; recebe o valor canônico. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida no blur (e na digitação após interação); `false`: valida a cada alteração. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |

## SgInputOTP

Fonte: `src/inputs/SgInputOTP.tsx`. Usa um `<input>` por slot e um `<input type="hidden" name>` com o valor bruto, que serve para formulários nativos e para o `register`. É o único do grupo com `forwardRef`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `name` | `string` | — | Não | Nome do campo no react-hook-form. Só tem efeito junto com `control` ou `register` (ver contrato RHF). |
| `control` | `any` | — | Não | `Control` do `useForm()`; com `name`, envolve o componente em `<Controller>`. |
| `register` | `UseFormRegister<any>` | — | Não | `register` do `useForm()`; com `name`, registra o elemento nativo. |
| `rules` | `RegisterOptions<any>` | — | Não | Regras de validação do RHF (`RegisterOptions`). |
| `error` | `string` | — | Não | Erro externo; precedência sobre o interno. |
| `id` | `string` | — | Sim | Base dos ids dos slots. |
| `label` | `string` | — | Não | Rótulo; também prefixo do `aria-label` de cada slot. |
| `hintText` | `string` | — | Não | Texto de ajuda abaixo dos slots. |
| `mask` | `string` | `"999999"` | Não | Máscara: `9` = dígito, `#` = alfanumérico, qualquer outro caractere = separador fixo. Máscara sem slots cai no padrão. |
| `value` | `string` | — | Não | Valor controlado (bruto ou mascarado; caracteres são distribuídos nos slots). |
| `defaultValue` | `string` | — | Não | Valor inicial não controlado. |
| `className` | `string` | — | Não | Classes do wrapper externo. |
| `groupClassName` | `string` | — | Não | Classes do grupo de slots (`role="group"`). |
| `slotClassName` | `string` | — | Não | Classes de cada slot. |
| `separatorClassName` | `string` | — | Não | Classes dos separadores. |
| `inputProps` | `(Omit<InputHTMLAttributes<HTMLInputElement>, "value" \| "defaultValue"> & { ref?: Ref<HTMLInputElement>; })` | — | Não | Atributos aplicados aos `<input>` de slot (exceto `value`/`defaultValue`); `autoComplete` padrão `one-time-code` no 1º slot. |
| `width` | `string \| number` | `fit-content` | Não | Largura do wrapper (número = px). |
| `enabled` | `boolean` | `true` | Não | `false` desabilita os slots. |
| `readOnly` | `boolean` | `false` | Não | Somente leitura. |
| `required` | `boolean` | `false` | Não | Valida vazio e injeta `required` nas rules RHF. |
| `requiredMessage` | `string` | i18n `components.inputs.required` | Não | Mensagem para campo obrigatório vazio. |
| `validation` | `((rawValue: string, maskedValue: string) => string \| null)` | — | Não | `(rawValue, maskedValue) => string \| null`. |
| `validateOnBlur` | `boolean` | `true` | Não | `true`: valida ao sair do grupo; `false`: valida a cada alteração. |
| `onValidation` | `((message: string \| null) => void)` | — | Não | Recebe a mensagem de erro corrente ou `null` a cada validação. |
| `onChange` | `((maskedValue: string) => void)` | — | Não | Valor MASCARADO a cada alteração (ex.: `"AB1-2C3-45"`). |
| `onRawChange` | `((rawValue: string) => void)` | — | Não | Valor BRUTO (só os caracteres dos slots). |
| `onComplete` | `((value: string) => void)` | — | Não | Disparado quando todos os slots estão preenchidos; recebe o valor mascarado. |
| `onEnter` | `(() => void)` | — | Não | Foco entra no grupo de slots. |
| `onExit` | `(() => void)` | — | Não | Foco sai do grupo de slots. |
| `onClear` | `(() => void)` | — | Não | Chamado quando o valor passa de não vazio para vazio. |

**Ref (`SgInputOTPRef`, exportado)**:

| Método | Assinatura | Efeito |
|---|---|---|
| `focus` | `(slotIndex?: number) => void` | Foca e seleciona o slot. O padrão é `0`. |
| `clear` | `() => void` | Esvazia os slots e foca o primeiro. |
| `getRawValue` | `() => string` | Valor bruto. |
| `getMaskedValue` | `() => string` | Valor com separadores. |

- **Acessibilidade:**
  - O container tem `role="group"`, com `aria-label` igual ao rótulo ou ao i18n `components.inputs.otp.group`, e `aria-invalid` quando há erro.
  - Cada slot tem `aria-label` = `"<rótulo> N"` ou i18n `components.inputs.otp.slot`.
  - O primeiro slot usa `autoComplete="one-time-code"`.
  - O teste `tests/inputs-i18n.test.mjs` cobre os rótulos traduzidos.
- **Comportamento:** colar distribui os caracteres aceitos a partir do slot atual. Caracteres que não combinam com o tipo do slot são ignorados.

**Confirmado**.

## Fontes

- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/*.tsx` (componentes) e `*.meta.ts` (metadados de IA)
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/rhf.ts`, `src/validators.ts`, `src/masks.ts`, `src/i18n/*.ts`
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/tests/inputs-dom.test.mjs`, `inputs-i18n.test.mjs`, `rhf.test.mjs`, `rhf-components-contract.test.mjs` (lidos; **não executados**)
