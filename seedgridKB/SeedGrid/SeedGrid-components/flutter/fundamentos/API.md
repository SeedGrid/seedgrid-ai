---
description: "API Flutter dos fundamentos: SgForm/SgFormController/SgRules, i18n (SgComponentsI18nProvider e funções), sgNode, enums compartilhados, tema (SeedThemeProvider, SgTheme, utilitários de cor), máscaras, validadores, CEP/CNPJ e SgHttpClient, com o mapa de cada símbolo do React."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, fundamentos, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Fundamentos (Flutter)

> **Plataforma: Flutter.** API Dart de formulário, i18n, props, enums, tema e commons. A API **React** equivalente está em [[SeedGrid/SeedGrid-components/fundamentos/API|API — Fundamentos (React)]], [[SeedGrid/SeedGrid-components/pacotes/fe-theme|@seedgrid/fe-theme]] e [[SeedGrid/SeedGrid-components/pacotes/fe-commons|@seedgrid/fe-commons]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos|Exemplos (Flutter)]].

> **Como ler.** Tudo foi lido no código (commit `e9989b8`); caminhos relativos a `packages/`. **Confirmado** = lido na fonte citada; **Inferência** = deduzido; **Não confirmado** = não verifiquei. Onde há texto de erro ou mensagem, vem do código. Este grupo não tem widget visual próprio (exceto `SgForm`, `SgComponentsI18nProvider`, `SeedThemeProvider` e `SgValidationScope`, que não desenham nada): **acessibilidade** (`Semantics`) não se aplica (busca por `Semantics` em `form/`, `i18n/`, `props/`, `seedgrid_theme/lib` e `seedgrid_commons/lib` não encontrou ocorrência).

## Mapa React → Flutter

Cada símbolo dos grupos React [[SeedGrid/SeedGrid-components/fundamentos/API|fundamentos]] e dos pacotes [[SeedGrid/SeedGrid-components/pacotes/fe-theme|fe-theme]] e [[SeedGrid/SeedGrid-components/pacotes/fe-commons|fe-commons]] e o que há no Dart.

| Símbolo React | Equivalente Flutter | Estado |
|---|---|---|
| `useForm()` / `control` / `handleSubmit` / `watch` / `reset` / `setValue` / `formState` | `SgFormController` (`handleSubmit`, `watch`, `reset`, `setValue`, `errors`, `isValid`, `isDirty`, `isSubmitting`, `submitCount`) | portado, com `register` omitido |
| `register` do RHF | não existe (todo campo é controlado) | não portado de propósito |
| `RegisterOptions` (`rules`) | `SgRules` + `SgRuleValue` | portado |
| `rhf.ts` `RhfFieldProps` (interno) | props `name`, `control`, `rules`, `error` de cada widget | portado como props |
| `resolveFieldError` | `resolveFieldError(a, [b, c])` | portado |
| `mergeRequiredRule` | `mergeRequiredRule(rules, required, message)` | portado |
| `SgComponentsI18nProvider` | `SgComponentsI18nProvider` | portado |
| `useComponentsI18n` | `useComponentsI18n(context)` e `context.sgI18n` | portado |
| `setComponentsI18n`, `getComponentsI18n`, `resolveComponentsI18n` | mesmos nomes | portado |
| `tComponents` | `t(i18n, key, [params])` | portado (nome curto) |
| `formatComponentsMessage` | `formatMessage(template, [params])` | portado (nome curto) |
| `normalizeComponentsLocale`, `getBuiltInComponentsMessages` | mesmos nomes | portado |
| `componentsMessagesPtBr/PtPt/EnUs/En/Es/Fr` | mesmos nomes | portado |
| `SgComponentsLocale`, `SgComponentsMessages`, `SgComponentsI18n`, `SgComponentsI18nInput` | mesmos nomes (`SgComponentsLocale` = `String`) | portado |
| `SgComponentsMessagesByNamespace` | aceito no parâmetro `messages` (mapa com chave `components`) | portado sem tipo próprio |
| `masks.ts` (todas) | `seedgrid_commons`: `onlyDigits`, `maskCpf`, `maskCnpj`, `maskCpfCnpj`, `maskCep`, `maskPostalCodeBR/PT/US/ES/UY/AR/PY`, `maskPhone` | portado |
| `isValidCpf`, `isValidCnpj`, `isValidEmail` | mesmos nomes | portado |
| `isBlockedEmailDomain`, `getBlockedEmailDomains` | mesmos nomes | portado |
| `DEFAULT_BLOCKED_EMAIL_DOMAINS` | `defaultBlockedEmailDomains` (37 itens) | portado |
| `globalThis.__seedgridBlockedEmailDomains` | `runtimeBlockedEmailDomains` (variável mutável) | portado |
| `validatePassword` | `validatePassword` devolve `PasswordValidation`; texto em `passwordValidationMessage`/`validatePasswordMessage` (`seedgrid_components`) | portado com retorno diferente |
| `validateBirthDate` | `validateBirthDate` devolve `BirthDateValidation`; texto em `birthDateValidationMessage`/`validateBirthDateMessage` | portado com retorno diferente |
| `isDateAfter`, `isDateBefore` | mesmos nomes | portado |
| `PasswordPolicy`, `BirthDatePolicy` | mesmos nomes (classes) | portado |
| `ensureSeedgridStylesInjected`, `SEEDGRID_COMPILED_CSS`, `style.css` | nenhum | não aplicável (sem CSS) |
| `ai-meta` (`SgMetaV0`, `*.meta.ts`, manifesto) | `SgPropSpec` (contrato gerado por componente) | parcial (manifesto MCP Flutter em `tools/mcp_manifest/`: não confirmado) |
| `SeedThemeProvider` | `SeedThemeProvider` | parcial (sem `applyTo`, sem persistência) |
| `useSgTheme` | `useSgTheme(context)` | portado |
| `ThemeContextValue` | `SgThemeContextValue` | portado |
| `Mode` | `SgThemeMode` (`light`, `dark`, `auto`) | portado |
| `SeedThemeInput` | `SeedThemeInput` | parcial (sem `persistMode` e `persistenceStrategy`) |
| `ThemeVars` | `ThemeVars` (`Map<String, String>`) | portado |
| `defaultSeedTheme` | `defaultSeedTheme` | portado (sem `persistMode`) |
| `clamp`, `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `hslToHex`, `relativeLuminance`, `pickOnColor`, `toRgbVarValue`, `shiftHue`, `buildScaleFromHex` | mesmos nomes | portado |
| `getSystemMode` | `getSystemMode()` devolve `Brightness` | portado |
| `generateThemeVars`, `generateComponentTokens` | mesmos nomes | portado |
| `ThemeProvider`, `useTheme`, `SeedGridThemeConfig`, `defaultTheme`, `AppShell` (legado, `@deprecated`) | nenhum | não portado de propósito |
| `createHttpClient(opts).request` | `SgHttpClient(HttpClientOptions).request` | portado |
| `HttpClientOptions` | `HttpClientOptions` | portado |
| `buscarCep`, `ViaCepResponse` | mesmos nomes | portado (sem o campo `erro` e sem `signal`) |
| `buscarCnpj`, `PublicaCnpjResponse` | mesmos nomes | parcial (resposta como JSON cru com getters) |
| `CepLookupOptions`, `CnpjLookupOptions` (`signal`) | parâmetro `client:` (`http.Client`) | sem cancelamento |
| `@seedgrid/fe-core` (registry, manifesto de módulo, `createApiClient`, `mergeMessages`) | nenhum no código Dart | não portado (busca por `ApiClient`, `SeedGridRegistry`, `mergeMessages`: sem resultado) |
| persistência (`createLocalStorageStrategy` etc.) | `SgEnvironmentProvider` (grupo [[SeedGrid/SeedGrid-components/flutter/providers/API|Providers]]) | ver o grupo |
| `@seedgrid/fe-playground` (`SgPlayground`) | nenhum pacote; o showcase Flutter tem playground próprio | não portado como pacote |

---

## SgFormController

> Equivale ao `useForm()` + `control` do react-hook-form (ADR 49). Arquivo: `seedgrid_components/lib/src/form/sg_form.dart`. **Confirmado.**

`class SgFormController extends ChangeNotifier`. Construtor: `SgFormController({Map<String, Object?> defaultValues = const {}})`. Notifica ouvintes quando valor, erro ou estado muda: use `ListenableBuilder(listenable: form, ...)` para reagir (equivale ao `watch`).

### Métodos

| Membro | Assinatura | Comportamento |
|---|---|---|
| `getValue` | `Object? getValue(String name)` | `getValues(name)` do RHF. |
| `getValues` | `Map<String, Object?> getValues()` | cópia imutável de todos os valores. |
| `watch` | `Object? watch(String name)` | valor atual (não assina; ouça o controlador). |
| `registerField` | `void registerField(String name, {SgRules? rules, Object? initialValue, SgFieldValidator? validator})` | declara o campo (chamado pelo widget; idempotente). Substitui as `rules` e o `validator` do nome. O valor só é definido se o nome ainda não existir (`initialValue`, que também vira o padrão do `reset`). |
| `unregisterValidator` | `void unregisterValidator(String name, SgFieldValidator validator)` | remove o validador só se ainda for o mesmo (um campo novo com o mesmo nome não é afetado); não notifica. |
| `setValue` | `Future<void> setValue(String name, Object? value, {bool shouldValidate = false, bool shouldTouch = false, bool shouldDirty = true})` | grava o valor, atualiza `dirty` (compara com o padrão), notifica; `shouldValidate` roda `trigger([name])`; sem ele, se o erro atual veio do validador do componente, revalida só esse validador. |
| `markTouched` | `void markTouched(String name)` | marca o campo como tocado. |
| `trigger` | `Future<bool> trigger([List<String>? names])` | valida os campos (todos os que têm `rules` ou validador, se `names` for nulo). Ordem: `rules` primeiro (`validateRules`); o validador do componente só roda se elas passaram. Devolve `true` se todos válidos. |
| `setError` | `void setError(String name, String message, {String type = 'manual'})` | `setError` do RHF. |
| `clearErrors` | `void clearErrors([List<String>? names])` | `clearErrors` do RHF (todos, se nulo). |
| `reset` | `void reset([Map<String, Object?>? values])` | volta aos padrões (ou a `values`, que viram os novos padrões); limpa erros, `touched`, `dirty`, `submitCount`; incrementa `resetCount`. |
| `handleSubmit` | `Future<void> handleSubmit(SgSubmitValid onValid, [SgSubmitInvalid? onInvalid])` | ignora chamadas enquanto `isSubmitting`; incrementa `submitCount`; roda `trigger()`; válido chama `onValid(getValues())`, senão `onInvalid(errors)`. |

### Propriedades de leitura

| Membro | Tipo | Descrição |
|---|---|---|
| `errors` | `Map<String, SgFieldError>` | `formState.errors` (cópia imutável). |
| `errorOf(name)` | `SgFieldError?` | erro de um campo. |
| `isSubmitting` | `bool` | verdadeiro durante `handleSubmit`. |
| `isValid` | `bool` | `errors.isEmpty` (reflete só a última validação; **não** roda `trigger`). |
| `isDirty` | `bool` | algum campo difere do padrão (só quando `setValue` com `shouldDirty`). |
| `submitCount` | `int` | quantos envios. |
| `resetCount` | `int` | quantos `reset`; os campos comparam este número para limpar o erro próprio. |
| `isTouched(name)` | `bool` | campo tocado. |

### Tipos auxiliares

| Tipo | Definição | Nota |
|---|---|---|
| `SgSubmitValid` | `FutureOr<void> Function(Map<String, Object?> values)` | `onSubmit` do `handleSubmit`. |
| `SgSubmitInvalid` | `FutureOr<void> Function(Map<String, SgFieldError> errors)` | `onInvalid`. |
| `SgFieldValidator` | `FutureOr<String?> Function(Object? value)` | validador **próprio do componente** (CPF, CNPJ, e-mail, datas...). Devolve a mensagem ou `null`. Diverge do React por decisão do dono: roda em `trigger`/`handleSubmit` (ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]). |

Em campo: `SgInputText(id: 'email', name: 'email', control: form, rules: SgRules(required: true))`. Comparação linha a linha com o React em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## SgForm

> Widget que expõe um `SgFormController` aos campos e é dono do controlador criado por ele. `class SgForm extends StatefulWidget`. **Confirmado** (`form/sg_form.dart`).

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `controller` | `SgFormController?` | `null` | controlador externo (o `control`); se nulo, o `SgForm` cria um com `defaultValues` e o descarta no `dispose`. |
| `defaultValues` | `Map<String, Object?>` | `const {}` | valores iniciais do controlador criado pelo `SgForm`. |
| `onValid` | `SgSubmitValid?` | `null` | chamado com os valores quando o envio passa na validação. |
| `onInvalid` | `SgSubmitInvalid?` | `null` | chamado com os erros quando o envio falha. |
| `submitOnEnter` | `bool` | `true` | Enter em campo de **uma linha** envia o formulário (envio implícito do HTML), mas só se houver um `SgButton(type: submit)` dentro do `SgForm` ou `onValid`/`onInvalid`. Não vale para `SgInputTextArea`; o botão "concluir" do teclado de tela não é interceptado. |
| `child` | `Widget` | obrigatória | conteúdo. |
| `key` | `Key?` | — | padrão do Flutter. |

Métodos estáticos:

| Método | Retorno | Comportamento |
|---|---|---|
| `SgForm.of(context)` | `SgFormController` | o controlador do `SgForm` mais próximo; em `assert` falha com a mensagem "Nenhum SgForm acima deste widget; passe control: ou envolva em SgForm." |
| `SgForm.maybeOf(context)` | `SgFormController?` | nulo se não houver. |
| `SgForm.registerSubmitButton(context)` | `VoidCallback?` | registra um botão `submit` (habilita o Enter); devolve a função que desfaz. Chamado pelo `SgButton` com `type: SgButtonType.submit`. |
| `SgForm.submitOf(context)` | `VoidCallback?` | dispara o envio do `SgForm` mais próximo (usado pelo `SgButton` submit). |

Comportamento do Enter (Confirmado em `_SgFormState._onKey`): ignora tecla que não seja Enter/Enter numérico; ignora se não há botão submit nem `onValid`/`onInvalid`; só age quando o foco está num `EditableText` de `maxLines == 1`; devolve `KeyEventResult.ignored` para o `onSubmitted` do campo continuar funcionando.

## SgRules, SgRuleValue, SgFieldError

> Arquivo `form/sg_rules.dart`. **Confirmado.**

`SgRules({Object? required, Object? min, Object? max, Object? minLength, Object? maxLength, Object? pattern, SgValidate? validate})`, tudo opcional, `const`.

| Campo | Tipo | Efeito |
|---|---|---|
| `required` | `Object?` (`true`, `false` ou `String` com a mensagem) | falha com `type: 'required'` se o valor for vazio (`null`, `''`, `false`, coleção vazia). |
| `min`, `max` | `Object?` (`num` ou `SgRuleValue<num>`) | só com valor preenchido; comparam o valor (`num` ou texto que vira `num`); `type: 'min'`/`'max'`. |
| `minLength`, `maxLength` | `Object?` (`num` ou `SgRuleValue<num>`) | tamanho de `String` ou coleção; `type: 'minLength'`/`'maxLength'`. |
| `pattern` | `Object?` (`RegExp` ou `SgRuleValue<RegExp>`) | só para `String`; `type: 'pattern'`. |
| `validate` | `SgValidate?` = `FutureOr<Object?> Function(Object? value)` | roda sempre (inclusive com valor vazio, como no RHF): `true`/`null` = ok, `false` = inválido sem mensagem, `String` não vazia = mensagem (`type: 'validate'`). |

- `SgRules.copyWith({Object? required, SgValidate? validate})`: copia mantendo as demais regras.
- `SgRuleValue<T>(T value, [String? message])`: `{ value, message }` do RHF, ex.: `SgRules(maxLength: SgRuleValue(10, 'Muito longo'))`.
- `SgFieldError(String type, [String message = ''])`: `type` com os nomes do RHF (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`, e `manual` em `setError`); `message` pode vir vazio.
- `Future<SgFieldError?> validateRules(SgRules rules, Object? value)`: ordem do RHF (required, min/max, maxLength/minLength, pattern, validate); `null` se válido.
- `SgRules? mergeRequiredRule(SgRules? rules, bool? required, String message)`: se `required == true`, injeta a regra `required` (com `message`) sem sobrescrever uma que já exista.
- `String? resolveFieldError(String? a, [String? b, String? c])`: a primeira mensagem não vazia (após `trim`).

## SgValidationScope, SgValidationRegistry, SgSelfValidating

> Arquivo `form/sg_validation_scope.dart`. **Extra do Flutter** (no React o `SgWizard` percorre os `<input>` e conta `[data-sg-error]`). **Confirmado.**

- `abstract interface class SgSelfValidating { bool validateNow(); }`: campo que se valida sob demanda; devolve `true` se não há erro. Implementam (estados privados, Confirmado por busca de `implements SgSelfValidating`): `SgInputText`, `SgInputTextArea`, `SgRating`, `SgToggleSwitch`, `SgInputOTP` e o campo numérico (`inputs/number/numeric_field.dart`, base de `SgInputNumber`/`SgInputCurrency`; essa ligação é Inferência).
- `class SgValidationRegistry` com `add(field)`, `remove(field)` e `bool validateAll()` (valida **todos**, sem parar no primeiro).
- `class SgValidationScope extends InheritedWidget`: `SgValidationScope({Key? key, required SgValidationRegistry registry, required Widget child})` e `static SgValidationRegistry? maybeOf(BuildContext)`. O `SgWizard` cria um por etapa (`feedback/sg_wizard.dart`); uso fora dele é possível mas **não confirmado** em teste.

---

## SgComponentsI18nProvider e funções de i18n

> Porte de `src/i18n/index.ts` do React (mesmos nomes e a mesma interpolação `{param}`). Arquivo: `seedgrid_components/lib/src/i18n/i18n.dart`; mapas gerados em `messages_*.dart` por `tools/export_i18n/export.mjs`. **Confirmado.**

### SgComponentsI18nProvider

`class SgComponentsI18nProvider extends StatelessWidget`. Widgets abaixo leem o idioma com `useComponentsI18n(context)`; trocar `locale` ou `messages` reconstrói quem depende dele.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `locale` | `SgComponentsLocale?` (`String`) | `null` → `en-US` | `'pt-BR'`, `'pt-PT'`, `'en-US'` (`'en'` vira `'en-US'`), `'es'`, `'fr'`; outro texto é aceito, mas cai nas mensagens `en-US`. |
| `messages` | `Map<String, Object?>?` | `null` | sobrescreve chaves. Forma plana ou com a chave `components` (se houver essa chave com um mapa, só ela é usada). |
| `child` | `Widget` | obrigatório | subárvore. |
| `key` | `Key?` | — | padrão do Flutter. |

Diferença de comportamento (Confirmado): o provider monta as mensagens a partir do **idioma embutido + `messages`**; ele **não** herda o que foi gravado por `setComponentsI18n` (a mesclagem com o estado global só existe em `getComponentsI18n`/`resolveComponentsI18n`). Sem provider, `useComponentsI18n` cai no global (`en-US` se nunca configurado).

### Funções e tipos

| Símbolo | Assinatura | Comportamento |
|---|---|---|
| `useComponentsI18n` | `SgComponentsI18n useComponentsI18n(BuildContext context)` | o do provider mais próximo ou, sem provider, o global. |
| `context.sgI18n` | `extension SgComponentsI18nContext on BuildContext { SgComponentsI18n get sgI18n; }` | atalho para o anterior. |
| `setComponentsI18n` | `void setComponentsI18n(SgComponentsI18nInput input)` | grava o estado global; se o idioma não mudou, preserva as mensagens customizadas anteriores. |
| `getComponentsI18n` | `SgComponentsI18n getComponentsI18n()` | o global ou o padrão (`en-US`). |
| `resolveComponentsI18n` | `SgComponentsI18n resolveComponentsI18n([SgComponentsI18nInput? input])` | mescla o global com `input`. |
| `resetComponentsI18n` | `void resetComponentsI18n()` | volta ao estado inicial. **Só existe no Flutter** (isola testes). |
| `t` | `String t(SgComponentsI18n? i18n, String key, [Map<String, Object?>? params])` | busca em `i18n.messages`, depois no idioma embutido, depois em `en-US`, depois devolve a própria chave; aplica `formatMessage`. (`tComponents` no React.) |
| `formatMessage` | `String formatMessage(String template, [Map<String, Object?>? params])` | troca `{nome}` quando o parâmetro existe; senão deixa o texto. (`formatComponentsMessage` no React.) |
| `normalizeComponentsLocale` | `SgComponentsLocale normalizeComponentsLocale([SgComponentsLocale? locale])` | `null`/vazio → `en-US`; `en` → `en-US`. |
| `getBuiltInComponentsMessages` | `SgComponentsMessages getBuiltInComponentsMessages([SgComponentsLocale? locale])` | catálogo embutido (desconhecido → `en-US`). |
| `componentsMessagesPtBr`, `PtPt`, `EnUs`, `Es`, `Fr`, `componentsMessagesEn` | `Map<String, String>` const | catálogos; `componentsMessagesEn` = `EnUs`. |
| `SgComponentsI18n` | `const SgComponentsI18n({required String locale, required Map<String, String> messages})` | valor resolvido. |
| `SgComponentsI18nInput` | `const SgComponentsI18nInput({String? locale, Map<String, Object?>? messages})` | entrada de `setComponentsI18n`/`resolveComponentsI18n`. |
| `SgComponentsLocale`, `SgComponentsMessages` | `typedef` para `String` e `Map<String, String>` | — |

Catálogos: **214 chaves** `components.*` por idioma (Confirmado por contagem de linhas em cada `messages_*.dart`); grupos de chave mais frequentes: `inputs` (45), `textEditor` (30), `actions` (19), `gadgets` (17), `validators` (15), `datatable` (15), `password` (12), `menu` (11). O teste `test/i18n/i18n_test.dart` compara os mapas com os vetores do React.

### Mensagens dos validadores (`validator_messages.dart`)

| Função | Assinatura | Retorno |
|---|---|---|
| `passwordValidationMessage` | `String? passwordValidationMessage(PasswordValidation result, [SgComponentsI18n? i18n])` | `null` se válida; vazia → `components.validators.password.empty`; senão `components.validators.password.invalid` com `{reasons}` = motivos (`components.validators.password.<problema>`) unidos por `; `. |
| `validatePasswordMessage` | `String? validatePasswordMessage(String value, [PasswordPolicy policy = const PasswordPolicy(), SgComponentsI18n? i18n])` | valida e traduz de uma vez. |
| `birthDateValidationMessage` | `String? birthDateValidationMessage(BirthDateValidation result, [SgComponentsI18n? i18n])` | `null` se ok; senão `components.validators.birthdate.<problema>` com `{min}`/`{max}`. |
| `validateBirthDateMessage` | `String? validateBirthDateMessage(String value, BirthDatePolicy policy, {SgComponentsI18n? i18n, DateTime? today})` | valida e traduz. |

---

## Props e texto: sgNode, sgNodeText, SgPropSpec

| Símbolo | Assinatura | Comportamento |
|---|---|---|
| `sgNode` | `Widget? sgNode(Object? value)` | `null` → `null`; `Widget` passa; `String` → `Text`; `num` → `Text('$value')`; outro tipo lança `ArgumentError` ("Esperado String, num ou Widget (equivalente a React.ReactNode), recebido ..."). Arquivo `props/sg_node.dart`. |
| `sgNodeText` | `String? sgNodeText(Object? value)` | texto de `String`, `num` ou `Text` com `data`; senão `null`. |
| `SgPropSpec` | `const SgPropSpec({required name, required reactName, required type, required tsType, required required, defaultValue, description, values, exact = true})` | descrição de uma prop pública gerada do React (`tools/gen_props`); alimenta a "Referência de Props" e o playground do showcase. `exact == false` quando o tipo Dart do contrato é genérico. |

As props de texto do contrato são `Object?` e passam por `sgNode` (lista em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]).

## Enums compartilhados e por componente

> Arquivo gerado `seedgrid_components/lib/src/generated/enums.g.dart` (de `@seedgrid/fe-components` 2026.7.1). **Confirmado** (179 enums). Regra: alias TS compartilhado entre componentes vira enum compartilhado; união inline de um componente vira `Sg<Componente><Prop>`. Todo enum tem `final String value` (o texto do React) e `static T? fromValue(String?)`. Nomes Dart que colidem com palavra reservada ganham sufixo (`defaultValue` para `default`, `nullValue` para `null`) e valores com hífen viram camelCase (`top-left` → `topLeft`).

Compartilhados (usados por vários componentes):

| Enum | Valores | Usado em (Confirmado nos contratos) |
|---|---|---|
| `SgSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help` | `SgButton`, `SgSplitButton` |
| `SgAppearance` | `solid`, `outline`, `ghost` | `SgButton`, `SgSplitButton` |
| `SgSize` | `sm`, `md`, `lg` | `SgButton`, `SgSplitButton` |
| `SgElevation` | `none`, `sm`, `md` | `SgButton`, `SgSplitButton` |

Tabela completa (inclusive os compartilhados acima):

| Enum | Valores (nome Dart; entre parênteses o texto do React quando difere) |
|---|---|
| `SgAccordionOrientation` | `vertical`, `horizontal` |
| `SgAppearance` | `solid`, `outline`, `ghost` |
| `SgAutocompleteElevation` | `none`, `sm`, `md`, `lg` |
| `SgAutocompleteLabelAlign` | `start`, `center`, `end` |
| `SgAutocompleteLabelPosition` | `float`, `top`, `left` |
| `SgAutocompleteTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgAvatarGroupOverlap` | `none`, `sm`, `md`, `lg` |
| `SgAvatarSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `custom` |
| `SgAvatarShape` | `circle`, `square` |
| `SgAvatarSize` | `sm`, `md`, `lg`, `xs`, `xl` |
| `SgBadgeBadgeStyle` | `solid`, `soft`, `outline`, `ghost` |
| `SgBadgeOverlayPlacement` | `top`, `left`, `topLeft` (`top-left`), `topRight` (`top-right`), `bottomLeft` (`bottom-left`), `bottomRight` (`bottom-right`), `right`, `bottom` |
| `SgBadgeSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `custom` |
| `SgBadgeSize` | `sm`, `md`, `lg`, `xs` |
| `SgBreadcrumbOverflowBehavior` | `collapse`, `scroll` |
| `SgBreadcrumbSize` | `sm`, `md`, `lg` |
| `SgBreadcrumbVariant` | `primary`, `defaultValue` (`default`), `subtle` |
| `SgButtonShape` | `circle`, `square`, `rounded`, `defaultValue` (`default`) |
| `SgCalendarWeekdayFormat` | `narrow`, `short`, `long` |
| `SgCardCardStyle` | `defaultValue` (`default`), `outlined`, `flat`, `elevated` |
| `SgCardCollapseToggleAlign` | `left`, `right` |
| `SgCardSize` | `sm`, `md`, `lg` |
| `SgCarouselOrientation` | `vertical`, `horizontal` |
| `SgCheckboxGroupOrientation` | `vertical`, `horizontal` |
| `SgCheckboxGroupSelectionStyle` | `checkbox`, `highlight` |
| `SgClockClockStyle` | `digital`, `analog` |
| `SgClockDigitalStyle` | `defaultValue` (`default`), `segment`, `sevenSegment`, `roller3d`, `flip`, `fade`, `matrix`, `neon`, `discard` |
| `SgClockFormat` | `v12h` (`12h`), `v24h` (`24h`) |
| `SgClockSecondHandMode` | `step`, `smooth` |
| `SgComboboxElevation` | `none`, `sm`, `md`, `lg` |
| `SgComboboxLabelAlign` | `start`, `center`, `end` |
| `SgComboboxLabelPosition` | `float`, `top`, `left` |
| `SgComboboxTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgConfirmationDialogIconPlacement` | `top`, `left` |
| `SgDatatableSelectionMode` | `multiple`, `single` |
| `SgDialogAnimation` | `fade`, `zoom`, `slideUp` |
| `SgDialogSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain` |
| `SgDialogSize` | `sm`, `md`, `lg`, `xl`, `full` |
| `SgDiscardDigitChangeAnimationMode` | `discard`, `incoming` |
| `SgDockMenuElevation` | `none`, `sm`, `md`, `lg` |
| `SgDockMenuPosition` | `leftTop` (`left-top`), `leftCenter` (`left-center`), `leftBottom` (`left-bottom`), `centerTop` (`center-top`), `centerBottom` (`center-bottom`), `rightTop` (`right-top`), `rightCenter` (`right-center`), `rightBottom` (`right-bottom`) |
| `SgDockZoneId` | `top`, `left`, `right`, `bottom`, `free` |
| `SgElevation` | `none`, `sm`, `md` |
| `SgExpandablePanelElevation` | `none`, `sm`, `md`, `lg` |
| `SgExpandablePanelExpandTo` | `top`, `left`, `right`, `bottom` |
| `SgExpandablePanelMode` | `inline`, `overlay` |
| `SgExpandablePanelPlacement` | `start`, `center`, `end` |
| `SgExpandablePanelRole` | `dialog`, `region` |
| `SgExpandablePanelRounded` | `none`, `md`, `lg`, `xl` |
| `SgFloatActionButtonAnimation` | `none`, `pulse`, `fade`, `scale`, `slide`, `rotate` |
| `SgFloatActionButtonAnimationOn` | `mount`, `hover`, `click` |
| `SgFloatActionButtonDirection` | `left`, `right`, `down`, `up` |
| `SgFloatActionButtonElevation` | `none`, `sm`, `md`, `lg` |
| `SgFloatActionButtonFloatActionButtonStyle` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain` |
| `SgFloatActionButtonHideDirection` | `down`, `up` |
| `SgFloatActionButtonHintPosition` | `top`, `left`, `right`, `bottom` |
| `SgFloatActionButtonPosition` | `leftTop` (`left-top`), `leftCenter` (`left-center`), `leftBottom` (`left-bottom`), `centerTop` (`center-top`), `centerBottom` (`center-bottom`), `rightTop` (`right-top`), `rightCenter` (`right-center`), `rightBottom` (`right-bottom`) |
| `SgFloatActionButtonSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain` |
| `SgFloatActionButtonShape` | `circle`, `square`, `rounded` |
| `SgFloatActionButtonSize` | `sm`, `md`, `lg` |
| `SgFloatActionButtonType` | `circle`, `linear`, `semiCircle` (`semi-circle`), `quarterCircle` (`quarter-circle`) |
| `SgGridAlign` | `start`, `center`, `end`, `stretch` |
| `SgGridJustify` | `start`, `center`, `end`, `stretch`, `between`, `around`, `evenly` |
| `SgInputBirthDateElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputBirthDateLabelAlign` | `start`, `center`, `end` |
| `SgInputBirthDateLabelPosition` | `float`, `top`, `left` |
| `SgInputBirthDateTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputCNPJElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputCNPJLabelAlign` | `start`, `center`, `end` |
| `SgInputCNPJLabelPosition` | `float`, `top`, `left` |
| `SgInputCNPJTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputCPFCNPJElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputCPFCNPJLabelAlign` | `start`, `center`, `end` |
| `SgInputCPFCNPJLabelPosition` | `float`, `top`, `left` |
| `SgInputCPFCNPJTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputCPFElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputCPFLabelAlign` | `start`, `center`, `end` |
| `SgInputCPFLabelPosition` | `float`, `top`, `left` |
| `SgInputCPFTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputCurrencyCurrencyDisplay` | `symbol`, `name`, `narrowSymbol`, `code` |
| `SgInputCurrencyCurrencySymbolPlacement` | `prefix`, `auto`, `suffix` |
| `SgInputCurrencyEmptyValue` | `nullValue` (`null`), `zero` |
| `SgInputCurrencyTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputDateElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputDateLabelAlign` | `start`, `center`, `end` |
| `SgInputDateLabelPosition` | `float`, `top`, `left` |
| `SgInputDateTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputEmailElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputEmailLabelAlign` | `start`, `center`, `end` |
| `SgInputEmailLabelPosition` | `float`, `top`, `left` |
| `SgInputEmailTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputNumberElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputNumberEmptyValue` | `nullValue` (`null`), `zero` |
| `SgInputNumberLabelAlign` | `start`, `center`, `end` |
| `SgInputNumberLabelPosition` | `float`, `top`, `left` |
| `SgInputNumberTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputPasswordElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputPasswordLabelAlign` | `start`, `center`, `end` |
| `SgInputPasswordLabelPosition` | `float`, `top`, `left` |
| `SgInputPasswordTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputPhoneElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputPhoneLabelAlign` | `start`, `center`, `end` |
| `SgInputPhoneLabelPosition` | `float`, `top`, `left` |
| `SgInputPhoneTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputPostalCodeCountry` | `br` (`BR`), `pt` (`PT`), `us` (`US`), `es` (`ES`), `uy` (`UY`), `ar` (`AR`), `py` (`PY`) |
| `SgInputPostalCodeElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputPostalCodeLabelAlign` | `start`, `center`, `end` |
| `SgInputPostalCodeLabelPosition` | `float`, `top`, `left` |
| `SgInputPostalCodeTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputTextAreaElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputTextAreaLabelAlign` | `start`, `center`, `end` |
| `SgInputTextAreaLabelPosition` | `float`, `top`, `left` |
| `SgInputTextElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputTextLabelAlign` | `start`, `center`, `end` |
| `SgInputTextLabelPosition` | `float`, `top`, `left` |
| `SgInputTextSearchElevation` | `none`, `sm`, `md`, `lg` |
| `SgInputTextSearchLabelAlign` | `start`, `center`, `end` |
| `SgInputTextSearchLabelPosition` | `float`, `top`, `left` |
| `SgInputTextSearchTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgInputTextTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgLinearGaugeOrientation` | `vertical`, `horizontal` |
| `SgLinearGaugePrimaryPointerShape` | `circle`, `triangle`, `invertedTriangle` (`inverted-triangle`), `diamond`, `rect` |
| `SgMenuDensity` | `compact`, `comfortable` |
| `SgMenuElevation` | `none`, `sm`, `md` |
| `SgMenuMenuStyle` | `inline`, `sidebar`, `drawer`, `hybrid` |
| `SgMenuMenuVariantStyle` | `panel`, `tiered`, `megaHorizontal` (`mega-horizontal`), `megaVertical` (`mega-vertical`), `panelMenu` (`PanelMenu`), `tiered2` (`Tiered`), `megaMenuHorizontal` (`MegaMenuHorizontal`), `megaMenuVertical` (`MegaMenuVertical`) |
| `SgMenuMode` | `multiple`, `accordion` |
| `SgMenuOrientationDirection` | `horizontalLeft` (`horizontal-left`), `horizontalRight` (`horizontal-right`), `verticalUp` (`vertical-up`), `verticalTop` (`vertical-top`), `verticalDown` (`vertical-down`) |
| `SgMenuPosition` | `left`, `right` |
| `SgMultiSelectElevation` | `none`, `sm`, `md`, `lg` |
| `SgMultiSelectLabelAlign` | `start`, `center`, `end` |
| `SgMultiSelectLabelPosition` | `float`, `top`, `left` |
| `SgMultiSelectTextInputType` | `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal` |
| `SgOrderListControlsPosition` | `left`, `right` |
| `SgOrderListSelectionMode` | `multiple`, `single` |
| `SgPageControlMobilePageControl` | `scroll`, `select` |
| `SgPageControlPageControlStyle` | `underline`, `pills` |
| `SgPageControlSize` | `sm`, `md`, `lg` |
| `SgPanelAlign` | `top`, `left`, `right`, `bottom`, `client` |
| `SgPanelBorderStyle` | `none`, `solid`, `dashed` |
| `SgPanelContentAlign` | `start`, `center`, `end`, `stretch` |
| `SgPanelContentDirection` | `row`, `column` |
| `SgPanelContentJustify` | `start`, `center`, `end`, `between`, `around`, `evenly` |
| `SgPeriodSelectorValue` | `all` (`ALL`), `custom` (`CUSTOM`), `today` (`TODAY`), `yesterday` (`YESTERDAY`), `tomorrow` (`TOMORROW`), `thisWeek` (`THIS_WEEK`), `thisQuinzena` (`THIS_QUINZENA`), `thisMonth` (`THIS_MONTH`), `thisQuarter` (`THIS_QUARTER`), `thisSemester` (`THIS_SEMESTER`), `thisYear` (`THIS_YEAR`), `lastWeek` (`LAST_WEEK`), `lastQuinzena` (`LAST_QUINZENA`), `lastMonth` (`LAST_MONTH`), `lastQuarter` (`LAST_QUARTER`), `lastSemester` (`LAST_SEMESTER`), `lastYear` (`LAST_YEAR`), `nextWeek` (`NEXT_WEEK`), `nextQuinzena` (`NEXT_QUINZENA`), `nextMonth` (`NEXT_MONTH`), `nextQuarter` (`NEXT_QUARTER`), `nextSemester` (`NEXT_SEMESTER`), `nextYear` (`NEXT_YEAR`) |
| `SgPickListFilterMatchMode` | `contains`, `startsWith`, `endsWith` |
| `SgPickListSelectionMode` | `multiple`, `single` |
| `SgPopupAlign` | `start`, `center`, `end` |
| `SgPopupPlacement` | `top`, `left`, `right`, `bottom`, `auto` |
| `SgPopupPreferPlacement` | `top`, `left`, `right`, `bottom` |
| `SgQRCodeErrorCorrectionLevel` | `l` (`L`), `m` (`M`), `q` (`Q`), `h` (`H`) |
| `SgRadialGaugePrimaryPointerShape` | `circle`, `square`, `triangle`, `diamond` |
| `SgRadialGaugePrimaryPointerType` | `range`, `needle`, `marker` |
| `SgRadioGroupOrientation` | `vertical`, `horizontal` |
| `SgRadioGroupSelectionStyle` | `radio`, `highlight` |
| `SgRatingSize` | `sm`, `md`, `lg`, `xl` |
| `SgSevenSegmentDigitPalette` | `blue`, `green`, `red`, `white`, `yellow` |
| `SgSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help` |
| `SgSize` | `sm`, `md`, `lg` |
| `SgSkeletonAnimation` | `none`, `pulse`, `wave` |
| `SgSkeletonShape` | `text`, `circle`, `square`, `rounded`, `rectangle` |
| `SgSplitButtonShape` | `square`, `rounded`, `defaultValue` (`default`) |
| `SgStackAlign` | `start`, `center`, `end`, `stretch` |
| `SgStackDirection` | `row`, `column` |
| `SgStackJustify` | `start`, `center`, `end`, `between`, `around`, `evenly` |
| `SgStringAnimatorAlignTo` | `left`, `right` |
| `SgStringAnimatorStringAnimatorStyle` | `roller3d`, `flip`, `fade`, `matrix`, `neon`, `discard` |
| `SgToasterPosition` | `topLeft` (`top-left`), `topRight` (`top-right`), `bottomLeft` (`bottom-left`), `bottomRight` (`bottom-right`), `topCenter` (`top-center`), `bottomCenter` (`bottom-center`) |
| `SgToolBarDockZone` | `top`, `left`, `right`, `bottom`, `free` |
| `SgToolBarOrientationDirection` | `horizontalLeft` (`horizontal-left`), `horizontalRight` (`horizontal-right`), `verticalUp` (`vertical-up`), `verticalDown` (`vertical-down`) |
| `SgToolbarIconButtonSeverity` | `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain` |
| `SgTreeViewBranchLabelBehavior` | `none`, `toggle` |
| `SgTreeViewCheckMode` | `live`, `confirm` |
| `SgTreeViewConfirmSelection` | `all`, `leafOnly` |
| `SgTreeViewDensity` | `compact`, `comfortable`, `normal` |
| `SgTreeViewIconTone` | `primary`, `defaultValue` (`default`) |
| `SgTreeViewSize` | `sm`, `md`, `lg` |
| `SgTreeViewTone` | `defaultValue` (`default`), `muted` |
| `SgWizardStepNavigation` | `none`, `previous`, `previousAndNext` (`previous-and-next`) |
| `SgWizardStepper` | `none`, `numbered`, `icons` |


---

## Tema (`seedgrid_theme`)

> Porte de `@seedgrid/fe-theme` (caminho `SeedThemeProvider`). Barril `seedgrid_theme/lib/seedgrid_theme.dart`; reexportado por `seedgrid_components` (com `hide relativeLuminance`, para não colidir). **Confirmado.**

### SeedThemeProvider e useSgTheme

`class SeedThemeProvider extends StatefulWidget`: `const SeedThemeProvider({Key? key, SeedThemeInput? initialTheme, required Widget child})`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `initialTheme` | `SeedThemeInput?` | `defaultSeedTheme` | entrada inicial (só lida no `initState`: mudar a prop depois não troca o tema; use `setTheme`). |
| `child` | `Widget` | obrigatório | subárvore, envolvida num `Theme` cujo `ThemeData` vem de `SgTheme.toThemeData(Theme.of(context))`. |

Comportamento: regenera o `SgTheme` a cada `build` a partir de `SeedThemeInput` + `Brightness`; com `mode: auto` ouve `didChangePlatformBrightness` e acompanha o sistema. **Não portados** (comentários do código): `applyTo` (`html`/`wrapper`), `persistMode`/`persistenceStrategy` e as chaves `sg:theme:*`.

`SgThemeContextValue useSgTheme(BuildContext context)`: lança `StateError('useSgTheme must be used within SeedThemeProvider')` fora do provider.

`class SgThemeContextValue`:

| Membro | Tipo | Descrição |
|---|---|---|
| `theme` | `SgTheme` | o tema atual. |
| `vars` | `ThemeVars` | `theme.vars`. |
| `setTheme` | `void Function({String? seed, SgThemeMode? mode, num? radius, String? warning, String? error, String? info, String? success, Map<String, String>? customVars})` | troca partes da entrada; `null` = não mudar; `mode: auto` volta a seguir o sistema. |
| `setMode` | `void Function(Brightness mode)` | troca claro/escuro sem mexer no resto. |
| `currentMode` | `Brightness` | modo resolvido (nunca `auto`). |
| `currentTheme` | `SeedThemeInput` | entrada atual. |

### SeedThemeInput, SgThemeMode, defaultSeedTheme, ThemeVars

| Símbolo | Definição |
|---|---|
| `SgThemeMode` | `enum { light, dark, auto }` (o `Mode` do React). |
| `SeedThemeInput` | `const SeedThemeInput({required String seed, SgThemeMode? mode, num? radius, String? warning, String? error, String? info, String? success, Map<String, String>? customVars})` e `copyWith(...)` com os mesmos nomes. |
| `defaultSeedTheme` | `SeedThemeInput(seed: '#16803D', mode: SgThemeMode.light, radius: 12)` (verde SeedGrid). |
| `ThemeVars` | `typedef Map<String, String>`: nome da variável CSS (`--sg-primary-600`) para o valor em texto. |

Campos de `SeedThemeInput`:

| Campo | Tipo | Padrão efetivo | Descrição |
|---|---|---|---|
| `seed` | `String` (`#RRGGBB`) | obrigatório | base da paleta primária; secundária = `shiftHue(seed, 35, 72, ...)`, terciária = `shiftHue(seed, 210, 62, ...)`. |
| `mode` | `SgThemeMode?` | `light` | claro, escuro ou `auto`. |
| `radius` | `num?` | `12` | raio em px (`--radius` e `--sg-radius`). |
| `warning`, `error`, `info`, `success` | `String?` (hex) | matizes fixos 45, 5, 210 e 145 | cores semânticas diretas. |
| `customVars` | `Map<String, String>?` | — | variáveis aplicadas por último (substituem as geradas). |

### SgTheme

`class SgTheme extends ThemeExtension<SgTheme>`. O mapa de variáveis do React vive em `vars`, com os **mesmos nomes** (`--sg-btn-primary-bg`).

| Membro | Assinatura | Comportamento |
|---|---|---|
| construtor | `const SgTheme({required ThemeVars vars, required Brightness mode})` | — |
| `SgTheme.fromInput` | `factory SgTheme.fromInput(SeedThemeInput input, Brightness mode)` | `generateThemeVars` + `generateComponentTokens` (os de componente vencem em caso de nome repetido). |
| `vars`, `mode` | `ThemeVars`, `Brightness` | — |
| `value` | `String value(String name)` | texto cru; lança `StateError('Token de tema inexistente: ...')`. |
| `color` | `Color color(String name)` | cor de um token (`'--sg-primary-600'`); entende `r g b`, `rgb(r g b)`, `transparent` e `H S% L%` dos aliases legados. |
| `radius` | `double get radius` | `--sg-radius` em px. |
| `copyWith` | `SgTheme copyWith({ThemeVars? vars, Brightness? mode})` | — |
| `lerp` | `SgTheme lerp(ThemeExtension<SgTheme>? other, double t)` | não interpola: troca de uma vez em `t >= 0.5`. |
| `toThemeData` | `ThemeData toThemeData([ThemeData? base])` | `ThemeData` Material 3 coerente (esquema de cores, `canvas`, `card`, `textTheme`, `scaffoldBackgroundColor`, `dividerColor`), com `SgTheme` registrado como extensão. |

Funções soltas: `Color parseThemeColor(String text)` (lança `FormatException('Valor de token nao e cor: ...')`) e `Color colorFromHex(String hex)`.

**Getters tipados** (`extension SgThemeTokens on SgTheme`, gerada, 193 getters): regra de nome = tira `--sg-` e vira camelCase (`--sg-btn-primary-bg` → `btnPrimaryBg`; `--sg-primary-600` → `primary600`). Tokens legados (`--background`, `--primary`...) só por `theme.color('--background')`. Grupos (Confirmado em `sg_theme_tokens.g.dart`): neutros (`bg`, `surface`, `mutedSurface`, `border`, `ring`, `text`, `muted`, `disabled`, `onDisabled`, `link`, `linkHover`, `badge`, `onBadge`, `tooltip`, `onTooltip`); `on*` (`onPrimary`, `onSecondary`, `onTertiary`, `onWarning`, `onError`, `onInfo`, `onSuccess`); escalas `primary|secondary|tertiary|warning|error|info|success` de `50` a `900` (10 degraus) mais `*Hover`/`*Active`; botões `btn{Primary,Secondary,Success,Info,Warning,Danger,Help,Plain}{Bg,Fg,Border,HoverBg,ActiveBg,Ring}`; `input*`, `card*`, `alert{Info,Success,Warning,Error}{Bg,Fg,Border}`, `badgeBg/Fg`, `tooltipBg/Fg`, `modal*`, `menu*`, `table*`.

`SgTheme sgThemeOf(BuildContext context)` (`seedgrid_components/lib/src/theme_access.dart`): o `SgTheme` do `Theme`; sem ele, gera `SgTheme.fromInput(defaultSeedTheme, theme.brightness)`.

### Geradores e utilitários de cor

| Símbolo | Assinatura | Comportamento |
|---|---|---|
| `generateThemeVars` | `ThemeVars generateThemeVars(SeedThemeInput input, Brightness resolvedMode)` | mesmas chaves e valores em texto do React: `--sg-*` (neutros, `on*`, escalas, hover/active), aliases legados (`--background`, `--primary`, ...), `--radius`/`--sg-radius`; `customVars` por último. |
| `generateComponentTokens` | `ThemeVars generateComponentTokens(ThemeVars baseVars)` | aliases por componente (`--sg-btn-*`, `--sg-input-*`, `--sg-card-*`, `--sg-alert-*`, `--sg-badge-*`, `--sg-tooltip-*`, `--sg-modal-*`, `--sg-menu-*`, `--sg-table-*`) como `rgb(r g b)`. |
| `getSystemMode` | `Brightness getSystemMode()` | `platformBrightness` do `WidgetsBinding`. |
| `clamp` | `double clamp(double n, double a, double b)` | — |
| `hexToRgb` | `({int r, int g, int b}) hexToRgb(String hex)` | aceita 6 dígitos com ou sem `#`; lança `FormatException('Invalid hex: ...')`. |
| `rgbToHex` | `String rgbToHex(double r, double g, double b)` | `#rrggbb` minúsculo. |
| `rgbToHsl` | `({double h, double s, double l}) rgbToHsl(num r, num g, num b)` | `s` e `l` em 0 a 100. |
| `hslToRgb` | `({double r, double g, double b}) hslToRgb(double h, double s, double l)` | — |
| `hslToHex` | `String hslToHex(double h, double s, double l)` | — |
| `relativeLuminance` | `double relativeLuminance(String hex)` | luminância relativa; **ocultado** no reexport de `seedgrid_components` (importe `seedgrid_theme` direto). |
| `pickOnColor` | `String pickOnColor(String bgHex)` | `#0B0B0C` se a luminância > 0,5, senão `#FFFFFF`. |
| `toRgbVarValue` | `String toRgbVarValue(String hex)` | `"r g b"`. |
| `shiftHue` | `String shiftHue(String hex, double dh, [double? targetS, double? targetL])` | gira o matiz e fixa saturação/luminosidade (0 a 100). |
| `buildScaleFromHex` | `Map<int, String> buildScaleFromHex(String baseHex, Brightness resolvedMode, {double? boostS, double? biasL})` | escala 50 a 900 por HSL (luminosidade por degrau, diferente no claro e no escuro). |

---

## Máscaras (`seedgrid_commons`)

> Porte de `masks.ts`; arquivo `seedgrid_commons/lib/src/masks.dart`. Todas `String f(String value)`; mesmos nomes do React. **Confirmado.**

| Função | Resultado |
|---|---|
| `onlyDigits` | só dígitos (também reexportada por `validators.dart`). |
| `maskCpf` | até 11 dígitos, `000.000.000-00` progressivo. |
| `maskCnpj` | até 14 alfanuméricos maiúsculos, `AA.AAA.AAA/AAAA-00` progressivo (CNPJ alfanumérico). |
| `maskCpfCnpj` | com letra → `maskCnpj`; senão até 11 dígitos → `maskCpf`, acima → `maskCnpj`. |
| `maskCep` | alias de `maskPostalCodeBR`. |
| `maskPostalCodeBR` | 8 dígitos, `00000-000`. |
| `maskPostalCodePT` | 7 dígitos, `0000-000`. |
| `maskPostalCodeUS` | até 9 dígitos, `00000` ou `00000-0000`. |
| `maskPostalCodeES`, `maskPostalCodeUY` | 5 dígitos, sem separador. |
| `maskPostalCodeAR` | até 8 alfanuméricos maiúsculos, sem separador. |
| `maskPostalCodePY` | 6 dígitos. |
| `maskPhone` | até 11 dígitos, `(DD) 0000-0000` ou `(DD) 00000-0000` progressivo. |

## Validadores (`seedgrid_commons`)

> Porte de `validators.ts`; arquivo `seedgrid_commons/lib/src/validators.dart`. **Diferença deliberada:** `validatePassword` e `validateBirthDate` devolvem o **resultado**, não o texto (o pacote fica sem i18n; a mensagem vem de `validator_messages.dart`). **Confirmado.**

| Símbolo | Assinatura | Comportamento |
|---|---|---|
| `isValidCpf` | `bool isValidCpf(String value)` | 11 dígitos, rejeita todos iguais, confere os 2 dígitos verificadores. |
| `isValidCnpj` | `bool isValidCnpj(String value)` | 14 alfanuméricos; valor do caractere = código ASCII − 48; dígitos verificadores numéricos; rejeita `00000000000000`. |
| `isValidEmail` | `bool isValidEmail(String value)` | `RegExp(r'.+@.+\..+')` após `trim`. |
| `isBlockedEmailDomain` | `bool isBlockedEmailDomain(String email, [List<String>? extra])` | domínio após o último `@`, comparado em minúsculas com `getBlockedEmailDomains(extra)`. |
| `getBlockedEmailDomains` | `List<String> getBlockedEmailDomains([List<String>? extra])` | união deduplicada (trim + minúsculas) de `defaultBlockedEmailDomains`, `runtimeBlockedEmailDomains` e `extra`. |
| `defaultBlockedEmailDomains` | `const List<String>` | 37 domínios descartáveis (`blocked_email_domains.dart`, gerado do React 2026.7.1). |
| `runtimeBlockedEmailDomains` | `List<String>` (mutável, inicia vazia) | lista global em tempo de execução (o `globalThis.__seedgridBlockedEmailDomains` do React). |
| `validatePassword` | `PasswordValidation validatePassword(String value, [PasswordPolicy policy = const PasswordPolicy()])` | vazia (após `trim`) → `[PasswordProblem.empty]`; senão acumula problemas. |
| `validateBirthDate` | `BirthDateValidation validateBirthDate(String value, BirthDatePolicy policy, {DateTime? today})` | exige `minAge` ou `maxAge`; vazio → ok; `today` injetável para teste. |
| `isDateAfter` | `bool isDateAfter(String value, [String? minDate])` | `true` se algum argumento vazio; compara instantes com `>=`; data inválida → `false`. |
| `isDateBefore` | `bool isDateBefore(String value, [String? maxDate])` | idem com `<=`. |

Limite (comentário do código): só ISO 8601 é entendido (`"March 7, 2021"` não); data pura vale em UTC, data e hora sem fuso vale no fuso local.

`PasswordPolicy({int? minSize, bool? upper, bool? lower, bool? number, bool? special, bool? noRepeat, int? expirationDays, int? maxHistory})`, `const`:

| Campo | Padrão efetivo em `validatePassword` | Efeito |
|---|---|---|
| `minSize` | `8` (mínimo forçado `1`) | tamanho mínimo. |
| `upper`, `lower`, `number`, `special` | `true` | exige maiúscula, minúscula, dígito, caractere não alfanumérico. |
| `noRepeat` | `true` | proíbe sequência asc/desc de 3 (`abc`, `321`) e repetição (`aaa`, `a-a-a-a`). |
| `expirationDays`, `maxHistory` | — | existem na forma, **não são lidos** por `validatePassword` (comentário do código). |

`enum PasswordProblem { empty, minSize, upper, lower, number, special, sequence, repeated }` (iguais às chaves `components.validators.password.<problema>`). `PasswordValidation(List<PasswordProblem> problems, {int? minSize})` com `bool get ok`.

`BirthDatePolicy({int? minAge, int? maxAge})`; `enum BirthDateProblem { configMissing, configRange, invalidDate, ageBetween, ageMin, ageMax }`; `BirthDateValidation(BirthDateProblem? problem, {int? min, int? max})` e `const BirthDateValidation.ok()`, com `bool get ok`. Idade calculada com a data local (`today ?? DateTime.now()`); em fusos negativos a data ISO pura pode recuar um dia, como no JavaScript (mantido de propósito, comentário do código).

## CEP, CNPJ e HTTP (`seedgrid_commons`)

| Símbolo | Assinatura | Comportamento |
|---|---|---|
| `buscarCep` | `Future<ViaCepResponse> buscarCep(String cep, {http.Client? client})` | normaliza para dígitos; ≠ 8 lança `Exception('CEP deve ter 8 dígitos.')`; `GET https://viacep.com.br/ws/<cep>/json/`; não 2xx lança `Exception('Falha ao consultar CEP (<status>).')`; `erro: true` lança `Exception('CEP não encontrado.')`. |
| `ViaCepResponse` | `const ViaCepResponse({cep, logradouro, complemento, bairro, localidade, uf, ibge, gia, ddd, siafi})` (todos `String` obrigatórios) e `ViaCepResponse.fromJson` | campos ausentes viram `''`. |
| `buscarCnpj` | `Future<PublicaCnpjResponse?> buscarCnpj(String cnpj, {http.Client? client})` | ≠ 14 dígitos lança `Exception('CNPJ deve ter 14 dígitos.')`; `GET https://publica.cnpj.ws/cnpj/<cnpj>`; não 2xx **ou** erro de rede devolve `null`. Remove tudo que não é dígito, então **não suporta CNPJ alfanumérico** (como no React). |
| `PublicaCnpjResponse` | `const PublicaCnpjResponse(Map<String, dynamic> json)` | `json` cru (nomes `snake_case` da API) e getters `cnpjRaiz`, `razaoSocial`, `capitalSocial`, `estabelecimento`, `nomeFantasia`, `situacaoCadastral`. Os demais campos (sócios, simples...) só por `json`. |
| `HttpClientOptions` | `const HttpClientOptions({required String baseUrl, String? Function()? getAccessToken})` | — |
| `SgHttpClient` | `SgHttpClient(HttpClientOptions options, {http.Client? client})` | cliente injetável (testes sem rede). |
| `SgHttpClient.request` | `Future<dynamic> request(String path, {String method = 'GET', Map<String, String>? headers, Object? body})` | URL = `baseUrl + path`; `Content-Type: application/json` se ausente; `Authorization: Bearer <token>` se `getAccessToken()` devolver valor; `body` `String` vai cru, outro tipo vai por `jsonEncode`; não 2xx lança `SgHttpException`; 204 devolve `null`; senão o JSON decodificado. |
| `SgHttpClient.close` | `void close()` | fecha o `http.Client`. |
| `SgHttpException` | `SgHttpException(int status, String? reason, String body)` | `toString()`: `HTTP <status> <reason>: <body>`. |

Serviços externos fixos (ViaCEP e publica.cnpj.ws), sem configuração de URL. Dependência: `package:http` (`^1.2.0`, `pubspec.yaml` de `seedgrid_commons`).

## Interno (não exportado)

`seedgrid_components/lib/src/commons/commons_colors.dart` (`tokenChain`, `SeverityColors`, `severityColors`) resolve as cores das severidades de `SgBadge` e `SgAvatar` pela mesma cadeia de fallback do React; **não é exportado** (o barril `commons/commons.dart` só exporta `sg_avatar`, `sg_badge`, `sg_badge_overlay` e `sg_skeleton`). Documentado aqui só para quem lê o código.

## Não verificado

- Os valores dos catálogos `messages_*.dart` (texto de cada chave) e a igualdade com o React (`test/i18n`).
- A paridade numérica das funções de cor e de tema com o React (`test/parity`): citada nos comentários do código, não executada.
- Comportamento em dispositivo e web do `SgForm.submitOnEnter` (o comentário do código só diz que o botão "concluir" do teclado de tela não é interceptado).
