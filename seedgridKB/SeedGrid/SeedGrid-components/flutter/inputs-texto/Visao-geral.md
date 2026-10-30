---
description: "Inputs de texto e documentos em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-texto]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Inputs de texto e documentos — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/inputs-texto/Visao-geral|Inputs de texto e documentos — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API — Inputs de texto e documentos (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos|Exemplos — Inputs de texto e documentos (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

15 componente(s): **15 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgInputText` | portado | Campo de texto de uso geral; base de quase todos os outros. | `pages/sg_input_text_page.dart` |
| `SgInputTextArea` | portado | Texto longo em várias linhas, com limites de caracteres, palavras e linhas. | `pages/sg_input_text_area_page.dart` |
| `SgInputTextSearch` | portado | Campo de busca que dispara onSearchChange depois de um debounce. | `pages/sg_input_text_search_page.dart` |
| `SgInputEmail` | portado | E-mail com validação de formato e bloqueio de domínios descartáveis. | `pages/sg_input_email_page.dart` |
| `SgInputPassword` | portado | Senha com política configurável, barra de força, olho e gerador. | `pages/sg_input_password_page.dart` |
| `SgInputPhone` | portado | Telefone brasileiro (10 ou 11 dígitos) com máscara e remoção do DDI. | `pages/sg_input_phone_page.dart` |
| `SgInputCPF` | portado | CPF com máscara e validação dos dígitos verificadores. | `pages/sg_input_cpf_page.dart` |
| `SgInputCNPJ` | portado | CNPJ numérico ou alfanumérico, com consulta pública opcional. | `pages/sg_input_cnpj_page.dart` |
| `SgInputCPFCNPJ` | portado | Campo único que aceita CPF ou CNPJ e detecta qual foi digitado. | `pages/sg_input_cpfcnpj_page.dart` |
| `SgInputPostalCode` | portado | CEP e códigos postais de 7 países, com consulta opcional ao ViaCEP. | `pages/sg_input_postal_code_page.dart` |
| `SgInputDate` | portado | Data em texto com máscara e calendário próprio; valor ISO. | `pages/sg_input_date_page.dart` |
| `SgInputBirthDate` | portado | Data de nascimento com idade mínima e máxima. | `pages/sg_input_birth_date_page.dart` |
| `SgInputNumber` | portado | Número decimal formatado pelo idioma, com limites mínimo e máximo. | `pages/sg_input_number_page.dart` |
| `SgInputCurrency` | portado | Valor monetário com símbolo, moeda e separadores do idioma. | `pages/sg_input_currency_page.dart` |
| `SgInputOTP` | portado | Código de uso único em slots, com máscara, colagem e controller. | `pages/sg_input_otp_page.dart` |

## Quando usar

| Componente | Escolha quando | Em vez disso |
|---|---|---|
| `SgInputText` | texto curto livre (nome, título, código) | combo ou lista para escolha fechada: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|inputs de seleção (Flutter)]] |
| `SgInputTextArea` | texto longo em várias linhas | `SgTextEditor` para texto rico: [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral|editor (Flutter)]] |
| `SgInputTextSearch` | caixa de busca que não deve consultar a cada tecla | `SgInputText` quando não precisa de debounce |
| `SgInputEmail` | e-mail com formato e domínios descartáveis validados | `SgInputText` com `validation` para regra própria |
| `SgInputPassword` | senha nova (política, força, gerador) ou senha de login | `SgInputText(type: 'password')` para um campo simples sem regras |
| `SgInputPhone` | telefone do Brasil (10 ou 11 dígitos) | `SgInputText` com `inputFormatters` para outros formatos |
| `SgInputCPF` / `SgInputCNPJ` | só pessoa física / só pessoa jurídica | `SgInputCPFCNPJ` quando o usuário pode informar qualquer um |
| `SgInputPostalCode` | CEP (BR, com ViaCEP opcional) ou código postal de PT, US, ES, UY, AR, PY | `SgInputText` para outros países |
| `SgInputDate` | data qualquer, com `minDate`/`maxDate` | `SgInputBirthDate` para nascimento com idade mínima/máxima; `SgCalendar` para um calendário solto ([[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|gadgets]]) |
| `SgInputNumber` | número com decimais e limites | `SgStepperInput` ([[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|seleção]]) para +/- ou `SgSlider` para faixa |
| `SgInputCurrency` | valor monetário (padrão BRL) | `SgInputNumber` quando não há moeda |
| `SgInputOTP` | código de verificação de poucos dígitos | `SgInputText` para códigos longos ou livres |

## O que muda em relação ao React

Os 15 componentes estão **portados** (`docs/paridade.json`, commit `e9989b8`), com o mesmo nome, as mesmas props e os mesmos valores de enum (como `SgInputTextElevation.sm` no lugar de `"sm"`). Em resumo (detalhes por componente na seção "Diferenças do React" de [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API]]):
- Não existem `inputProps`/`textareaProps` (aceitos e ignorados), `className`, `style` nem `register`; use as props nomeadas e o `SgFormController` (`name` + `control` ou um `SgForm` acima).
- Props extras do Flutter: `initialValue`, `value` (controlado), `inputFormatters`, `autofocus`, `autofillHints`, `textInputAction`, `onSubmitted`, `focusNode` (nem todo componente tem todas; ver a tabela de cada um).
- Em formulário, o `onChange` do usuário sempre roda, e os validadores do componente rodam também em `handleSubmit`/`trigger` (decisões do dono de 2026-10-25). Ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].
- Campos com valor inicial mostram sempre o valor mascarado; telefone com DDI perde o `55`.
- `SgInputDate` e `SgInputBirthDate` usam máscara por idioma e calendário próprio, não o `<input type="date">`; o valor continua ISO.
- `SgInputNumber` e `SgInputCurrency` não usam `Intl`: tabelas geradas (30 locales latinos, 162 moedas).
- `SgInputPassword`: barra de força neutra com o campo vazio.
- Consultas de rede (ViaCEP, CNPJ público) são injetáveis (`viaCepFetch`, `publicaCnpjFetch`).

## Símbolos do React do mesmo grupo sem componente equivalente

O grupo React exporta só os 15 componentes e tipos de props (nenhum hook ou função auxiliar; o `Indice` do React conta 0 outros símbolos).
- `SgInputOTPRef` (ref imperativo do OTP): equivalente `SgInputOTPController` (`controller:`).
- Tipos `Sg*Props`: equivalem às interfaces geradas `Sg*Props` em `generated/*.g.dart` (exportadas pelo pacote).
- Utilitários internos do React (`maskPhone`, `maskCpf`, validadores): no Flutter vêm de `seedgrid_commons` (`maskCpf`, `maskPhone`, `isValidCpf`, `isValidCnpj`, `isValidEmail` são os usados por este grupo); a lista completa fica em [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral|Fundamentos (Flutter)]].
- Sem pendência: nenhum componente deste grupo do React está sem equivalente Flutter.

## Não verificado

- Não executei `flutter test`, o showcase nem as consultas de rede (ViaCEP, `publica.cnpj.ws`); o comportamento descrito vem da leitura do código no commit `e9989b8`.
- A semântica de acessibilidade foi lida no código (`Semantics`, `Tooltip`); o que o `TextField` do Material anuncia por conta própria **não foi confirmado**.
- `validateBirthDateMessage` (`i18n/validator_messages.dart`) não foi aberto: a mensagem de configuração inválida sem `minAge`/`maxAge` vem do comentário do arquivo do `SgInputBirthDate`.
- As mensagens do i18n foram citadas pela chave; o texto em cada idioma não foi conferido.


## Símbolos públicos do grupo (além dos widgets)

Extraído por script e **filtrado à mão** pelo que os barris `masked_inputs.dart`, `number_inputs.dart`, `text_inputs.dart` e `otp_inputs.dart` realmente exportam (respeitando os `show`). Descrição = comentário `///` do código, quando existe. Os auxiliares internos (`SgInputCommon`, `SgMaskedInput`, `NumericField`, `SgMaxLengthFormatter`, `SgPostalConfig`…) não são públicos.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgMaskFormatter` | class | Aplica [mask] a cada edicao e posiciona o cursor depois do mesmo trecho significativo (digitos/letras) que ficava antes dele: editar no meio nao joga o cursor para o fim. Apagar um separador (ponto, traco, parentese) apaga tambem o caractere significativo anterior, senao a mascara recolocaria o separador e o backspace pareceria nao fazer nada. | `lib/src/inputs/masked/masked_core.dart` |
| `sgPhoneStripDdi` | função | Telefone brasileiro com DDI (`+55 11 98765-4321`, `5511987654321`): tira o `55`. Numero do Brasil tem 10 ou 11 digitos, entao 12 ou 13 digitos comecados em `55` so podem ser DDI + numero. A mascara do React (`maskPhone`) ficaria com os 11 primeiros digitos e mostraria outro telefone (`(55) 11987-6543`). Fora disso devolve o texto como veio. | `lib/src/inputs/masked/masked_core.dart` |
| `SgViaCepResult` | class | Resposta do ViaCEP (o `ViaCepResponse` do React, com `erro`). O `ViaCepResponse` de seedgrid_commons lanca em vez de devolver `erro`, entao este tipo existe so para o input. | `lib/src/inputs/masked/masked_fetch.dart` |
| `sgIso` | função | — | `lib/src/inputs/masked/sg_date_picker.dart` |
| `sgParseIso` | função | Data ISO `yyyy-MM-dd` -> DateTime (dia, sem hora); `null` se invalida ou inexistente (ex.: 2026-02-31). | `lib/src/inputs/masked/sg_date_picker.dart` |
| `showSgDatePicker` | função | Abre o calendario e devolve a data escolhida (`yyyy-MM-dd`) ou `null` se cancelado. | `lib/src/inputs/masked/sg_date_picker.dart` |
| `SgDatePickerDialog` | class | — | `lib/src/inputs/masked/sg_date_picker.dart` |
| `sgToDateValue` | função | `toDateValue` do React: `String` passa como esta; `DateTime` vira a data ISO em UTC. | `lib/src/inputs/masked/sg_input_date.dart` |
| `sgFormatDateDisplay` | função | `formatDateDisplay` do React (usado nas mensagens de intervalo): ISO em en-US, dd/MM/yyyy nos demais. | `lib/src/inputs/masked/sg_input_date.dart` |
| `sgDisplayDate` | função | Texto do campo para uma data ISO (dd/MM/yyyy; MM/dd/yyyy em en-US). '' se invalida. | `lib/src/inputs/masked/sg_input_date.dart` |
| `sgDateMask` | função | Máscara de data: só dígitos, no máximo 8, com barras. | `lib/src/inputs/masked/sg_input_date.dart` |
| `sgIsoFromDisplay` | função | Texto -> ISO. '' se incompleto ou data inexistente (como o valor do <input type="date">). | `lib/src/inputs/masked/sg_input_date.dart` |
| `sgNormalizeDateValue` | função | Valor recebido de fora (setValue, `value`, valor inicial) -> data ISO `yyyy-MM-dd`; '' se nao for uma data. O `<input type="date">` do React so aceita ISO e mostra vazio para qualquer outro texto; aqui tambem valem a data ISO com hora (`2020-01-31T10:20:30Z`, a parte da data) e o texto do proprio campo no idioma atual (`31/01/2020`, ou `01/31/2020` em en-US), que sao as formas em que dados salvos costumam chegar. Data que nao existe (2020-02-30) ou outro formato (`20200131`) fica vazia, como no React. | `lib/src/inputs/masked/sg_input_date.dart` |
| `SgNumberSeparators` | class | Separadores usados pelo `SgInputNumber` (React: `getSeparators`). | `lib/src/inputs/number/number_locale.dart` |
| `SgCurrencyMeta` | class | Metadados da moeda (React: `CurrencyMeta`). | `lib/src/inputs/number/number_locale.dart` |
| `resolveNumberLocale` | função | Acha o locale da tabela: troca `_` por `-`, tenta exato, depois pelo idioma, senao `en-US`. | `lib/src/inputs/number/number_locale.dart` |
| `numberSeparators` | função | Equivale a `getSeparators(locale)` do React, INCLUINDO a esquisitice dele: em es e pt-PT o ICU nao agrupa 1000.1 (minimo de 2 digitos), a parte `group` some e o React cai em `","`, que colide com o decimal `","` (sai "12,345,00"). Mantido por paridade; ver o relatorio de defeitos. | `lib/src/inputs/number/number_locale.dart` |
| `resolveCurrencyMeta` | função | Equivale a `resolveCurrencyMeta` do React. [currency] ja em maiusculas. | `lib/src/inputs/number/number_locale.dart` |
| `SgNumberState` | class | Estado digitado: sinal, parte inteira, parte decimal e se o separador decimal ja foi digitado. | `lib/src/inputs/number/number_state.dart` |
| `OtpSlotKind` | enum | — | `lib/src/inputs/otp/otp_mask.dart` |
| `OtpMask` | class | — | `lib/src/inputs/otp/otp_mask.dart` |
| `parseOtpMask` | função | Mascara vazia ou sem nenhum slot cai em `999999` (igual ao React). | `lib/src/inputs/otp/otp_mask.dart` |
| `textToSlotValues` | função | Distribui [text] nos slots, pulando caracteres que o slot da vez nao aceita. | `lib/src/inputs/otp/otp_mask.dart` |
| `slotValuesToRaw` | função | — | `lib/src/inputs/otp/otp_mask.dart` |
| `slotValuesToMasked` | função | Valor com separadores: so escreve separador entre slots ja preenchidos (nunca no inicio nem no fim). | `lib/src/inputs/otp/otp_mask.dart` |
| `SgInputOTPController` | class | Equivale ao `SgInputOTPRef` do React. Passe em `SgInputOTP(controller: ...)`. | `lib/src/inputs/otp/sg_input_otp.dart` |
| `kSgWidgetMaxDate` | constante | Teto de ano de 4 dígitos do campo (o `WIDGET_MAX_DATE` do React); só vale para o calendário. | `lib/src/inputs/masked/sg_input_date.dart` |

