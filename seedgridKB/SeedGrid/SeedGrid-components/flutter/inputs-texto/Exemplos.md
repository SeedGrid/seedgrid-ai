---
description: "Exemplos Dart de Inputs de texto e documentos em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-texto, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Inputs de texto e documentos (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos|Exemplos — Inputs de texto e documentos (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgInputText

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_page.dart` (15 exemplo(s) na página; abaixo 3).

### Básico

Rótulo flutuante, placeholder e botão de limpar.

Região `sgInputTextBasico` em `sg_input_text_page.snippets.g.dart`.

```dart
SgInputText(
  id: 'nome',
  labelText: 'Nome',
  placeholder: 'Digite seu nome',
)
```

### Posição do rótulo

Região `sgInputTextRotulo` em `sg_input_text_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputText(
      id: 'topo',
      labelText: 'Rótulo no topo',
      labelPosition: SgInputTextLabelPosition.top,
    ),
    SizedBox(height: 12),
    SgInputText(
      id: 'esquerda',
      labelText: 'À esquerda',
      labelPosition: SgInputTextLabelPosition.left,
      labelWidth: 110,
    ),
  ],
)
```

### Prefixo, sufixo e contador

O valor entregue a onChange inclui prefixo e sufixo, como no React.

Região `sgInputTextAfixos` em `sg_input_text_page.snippets.g.dart`.

```dart
const SgInputText(
  id: 'valor',
  labelText: 'Valor',
  prefixText: r'R$ ',
  suffixText: ' /mês',
  maxLength: 12,
  showCharCounter: true,
)
```

## SgInputTextArea

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_area_page.dart` (15 exemplo(s) na página; abaixo 3).

### Básico

Rótulo flutuante, 2 linhas por padrão e botão de limpar.

Região `sgInputTextAreaBasico` em `sg_input_text_area_page.snippets.g.dart`.

```dart
const SgInputTextArea(id: 'obs', labelText: 'Observações')
```

### Linhas, altura e posição do rótulo

maxLines define as linhas visíveis; height fixa a altura e o texto rola dentro.

Região `sgInputTextAreaLinhas` em `sg_input_text_area_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputTextArea(
      id: 'linhas',
      labelText: '5 linhas',
      maxLines: 5,
    ),
    SizedBox(height: 12),
    SgInputTextArea(
      id: 'topo',
      labelText: 'Rótulo no topo, 120 px de altura',
      labelPosition: SgInputTextAreaLabelPosition.top,
      hintText: 'Escreva aqui',
      height: 120,
    ),
    SizedBox(height: 12),
    SgInputTextArea(
      id: 'esquerda',
      labelText: 'À esquerda',
      labelPosition: SgInputTextAreaLabelPosition.left,
      labelWidth: 110,
    ),
  ],
)
```

### Limites e contador

maxLength limita a digitação; a validação roda a cada tecla.

Região `sgInputTextAreaLimites` em `sg_input_text_area_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputTextArea(
      id: 'max',
      labelText: 'No máximo 60 caracteres',
      maxLength: 60,
      showCharCounter: true,
    ),
    SizedBox(height: 12),
    SgInputTextArea(
      id: 'palavras',
      labelText: 'Pelo menos 5 palavras',
      minNumberOfWords: 5,
    ),
    SizedBox(height: 12),
    SgInputTextArea(
      id: 'minlinhas',
      labelText: 'Pelo menos 3 linhas',
      minLines: 3,
      maxLines: 4,
    ),
  ],
)
```

## SgInputTextSearch

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_search_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

onSearchChange dispara 350 ms depois da última digitação, com o texto sem espaços nas pontas e só com 3 ou mais caracteres (ou vazio).

Região `sgInputTextSearchBasico` em `sg_input_text_search_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputTextSearch(
      id: 'busca',
      labelText: 'Buscar produto',
      prefixIcon: const Icon(Icons.search),
      onSearchChange: (valor) => setState(() => _busca = valor),
    ),
    const SizedBox(height: 8),
    Text('Última busca: $_busca'),
  ],
)
```

Ajuste: o trecho usa o estado da página do showcase (`setState` de um `State`). Para copiar, declare no `State` do seu widget: `String _busca = '(nenhuma ainda)';`.

### onChange imediato x onSearchChange com debounce

onChange recebe cada digitação com o valor cru; onSearchChange só o valor normalizado e sem repetição.

Região `sgInputTextSearchEventos` em `sg_input_text_search_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputTextSearch(
      id: 'eventos',
      labelText: 'Digite e veja os eventos',
      onChange: (valor) => setState(() => _crua = valor),
      onSearchChange: (valor) => setState(() => _disparos++),
    ),
    const SizedBox(height: 8),
    Text('onChange (cru): "$_crua"'),
    Text('Buscas disparadas: $_disparos'),
  ],
)
```

Ajuste: o trecho usa o estado da página do showcase. Declare no `State` do seu widget: `String _crua = '';` e `int _disparos = 0;`.

### Rótulo, largura e botão de limpar

Limpar o campo dispara a busca vazia (volta para a lista completa).

Região `sgInputTextSearchAparencia` em `sg_input_text_search_page.snippets.g.dart`.

```dart
SgInputTextSearch(
  id: 'aparencia',
  labelText: 'Cliente',
  labelPosition: SgInputTextSearchLabelPosition.top,
  placeholder: 'Nome ou CPF',
  width: 320,
  filled: true,
  onSearchChange: (valor) {},
)
```

## SgInputEmail

Página: `apps/seedgrid_showcase/lib/pages/sg_input_email_page.dart` (11 exemplo(s) na página; abaixo 3).

### Básico

Valida o formato a cada digitação e ao sair do campo.

Região `sgInputEmailBasico` em `sg_input_email_page.snippets.g.dart`.

```dart
SgInputEmail(
  id: 'email',
  labelText: 'E-mail',
  placeholder: 'voce@empresa.com',
)
```

### Obrigatório e mensagens próprias

Saia do campo vazio para ver a mensagem de obrigatório.

Região `sgInputEmailObrigatorio` em `sg_input_email_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputEmail(
      id: 'obrigatorio',
      labelText: 'Obrigatório',
      required: true,
    ),
    SizedBox(height: 12),
    SgInputEmail(
      id: 'proprias',
      labelText: 'Mensagens próprias',
      required: true,
      requiredMessage: 'Informe o e-mail do responsável',
      invalidMessage: 'Esse e-mail não parece certo',
    ),
  ],
)
```

### E-mails descartáveis

Domínios temporários (yopmail.com, guerrillamail.com...) são bloqueados por padrão; blockFakeMail desliga e blockedEmailDomains acrescenta.

Região `sgInputEmailDescartaveis` em `sg_input_email_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputEmail(
      id: 'padrao',
      labelText: 'Bloqueio padrão (tente a@yopmail.com)',
    ),
    SizedBox(height: 12),
    SgInputEmail(
      id: 'livre',
      labelText: 'blockFakeMail: false',
      blockFakeMail: false,
    ),
    SizedBox(height: 12),
    SgInputEmail(
      id: 'extra',
      labelText: 'Bloqueia @concorrente.com',
      blockedEmailDomains: ['concorrente.com'],
    ),
  ],
)
```

## SgInputPassword

Página: `apps/seedgrid_showcase/lib/pages/sg_input_password_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Política padrão: 8 caracteres, maiúscula, minúscula, número, especial, sem repetição nem sequência. A barra mostra a força.

Região `sgInputPasswordBasico` em `sg_input_password_page.snippets.g.dart`.

```dart
const SgInputPassword(id: 'senha', labelText: 'Senha')
```

### Gerar senha forte

O botão gera uma senha que cumpre a política; newPasswordLength define o tamanho.

Região `sgInputPasswordGerar` em `sg_input_password_page.snippets.g.dart`.

```dart
const SgInputPassword(
  id: 'gerada',
  labelText: 'Senha',
  createNewPasswordButton: true,
  newPasswordLength: 12,
  maxLength: 32,
  hidePassword: false,
)
```

### Política própria

Cada critério liga e desliga; minSize muda o tamanho mínimo e showStrengthBar esconde a barra.

Região `sgInputPasswordPolitica` em `sg_input_password_page.snippets.g.dart`.

```dart
const SgInputPassword(
  id: 'politica',
  labelText: 'PIN alfanumérico',
  minSize: 6,
  upperRequired: false,
  specialCharacterRequired: false,
  prohibitsSequentialAscCharacters: false,
  prohibitsSequentialDescCharacters: false,
  showStrengthBar: false,
  commonPasswordCheck: false,
)
```

## SgInputPhone

Página: `apps/seedgrid_showcase/lib/pages/sg_input_phone_page.dart` (9 exemplo(s) na página; abaixo 3).

### Básico

Fixo (10 dígitos) e celular (11 dígitos) formatam sozinhos.

Região `sgInputPhoneBasico` em `sg_input_phone_page.snippets.g.dart`.

```dart
const SgInputPhone(id: 'telefone', labelText: 'Telefone')
```

### Obrigatório e mensagem própria

Região `sgInputPhoneObrigatorio` em `sg_input_phone_page.snippets.g.dart`.

```dart
const SgInputPhone(
  id: 'telefone-obrigatorio',
  labelText: 'Celular',
  required: true,
  requiredMessage: 'Informe um telefone',
  invalidMessage: 'Telefone incompleto',
)
```

### Variações visuais

filled alterna o fundo preenchido; withBorder remove a borda.

Região `sgInputPhoneVariacoes` em `sg_input_phone_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputPhone(
      id: 'preenchido',
      labelText: 'Preenchido',
      filled: true,
    ),
    SizedBox(height: 12),
    SgInputPhone(
      id: 'vazado',
      labelText: 'Sem preenchimento',
      filled: false,
    ),
    SizedBox(height: 12),
    SgInputPhone(
      id: 'semborda',
      labelText: 'Sem borda',
      withBorder: false,
    ),
  ],
)
```

## SgInputCPF

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpf_page.dart` (10 exemplo(s) na página; abaixo 3).

### Básico

A máscara é aplicada a cada dígito; a validação aparece ao digitar e ao sair do campo.

Região `sgInputCpfBasico` em `sg_input_cpf_page.snippets.g.dart`.

```dart
const SgInputCPF(id: 'cpf', labelText: 'CPF')
```

### Obrigatório e mensagens próprias

Região `sgInputCpfObrigatorio` em `sg_input_cpf_page.snippets.g.dart`.

```dart
const SgInputCPF(
  id: 'cpf-obrigatorio',
  labelText: 'CPF do titular',
  required: true,
  requiredMessage: 'Informe o CPF',
  lengthMessage: 'O CPF tem 11 dígitos',
  invalidMessage: 'Esse CPF não existe',
)
```

### Validação própria

A função recebe o valor mascarado e devolve a mensagem ou null.

Região `sgInputCpfValidacao` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SgInputCPF(
  id: 'cpf-regra',
  labelText: 'CPF (não aceita 000...)',
  validation: (v) =>
      v.startsWith('000') ? 'CPF de teste não permitido' : null,
)
```

## SgInputCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cnpj_page.dart` (10 exemplo(s) na página; abaixo 3).

### Básico

Aceita o CNPJ numérico e o alfanumérico (letras viram maiúsculas).

Região `sgInputCnpjBasico` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
const SgInputCNPJ(id: 'cnpj', labelText: 'CNPJ')
```

### Obrigatório e mensagens próprias

Região `sgInputCnpjObrigatorio` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
const SgInputCNPJ(
  id: 'cnpj-obrigatorio',
  labelText: 'CNPJ da empresa',
  required: true,
  requiredMessage: 'Informe o CNPJ',
  invalidMessage: 'CNPJ inválido, confira os dígitos',
)
```

### Variações visuais

filled alterna o fundo preenchido; withBorder remove a borda.

Região `sgInputCnpjVariacoes` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputCNPJ(
      id: 'preenchido',
      labelText: 'Preenchido',
      filled: true,
    ),
    SizedBox(height: 12),
    SgInputCNPJ(
      id: 'vazado',
      labelText: 'Sem preenchimento',
      filled: false,
    ),
    SizedBox(height: 12),
    SgInputCNPJ(
      id: 'semborda',
      labelText: 'Sem borda',
      withBorder: false,
    ),
  ],
)
```

## SgInputCPFCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpfcnpj_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Até 11 dígitos é CPF; passando disso, ou com letra, é CNPJ.

Região `sgInputCpfcnpjBasico` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
const SgInputCPFCNPJ(id: 'documento', labelText: 'CPF ou CNPJ')
```

### Obrigatório e mensagens

Região `sgInputCpfcnpjObrigatorio` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
const SgInputCPFCNPJ(
  id: 'documento-obrigatorio',
  labelText: 'Documento',
  required: true,
  requiredMessage: 'Informe o documento',
  lengthMessage: 'Documento incompleto',
)
```

### Dentro de um formulário

Região `sgInputCpfcnpjFormulario` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputCPFCNPJ(
      id: 'campo',
      name: 'campo',
      control: _form,
      labelText: 'Campo',
      rules: const SgRules(required: 'Preencha o campo'),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => setState(() => _enviado = '${values['campo']}'),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

Ajuste: o trecho usa o estado da página do showcase. Declare no `State` do seu widget: `final SgFormController _form = SgFormController();` (com `_form.dispose()` no `dispose`) e `String _enviado = '';`.

## SgInputPostalCode

Página: `apps/seedgrid_showcase/lib/pages/sg_input_postal_code_page.dart` (10 exemplo(s) na página; abaixo 3).

### CEP (padrão)

Região `sgInputPostalCodeBasico` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
const SgInputPostalCode(id: 'cep', labelText: 'CEP')
```

### Outros países

Cada país tem a sua máscara e o seu tamanho.

Região `sgInputPostalCodePaises` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputPostalCode(
      id: 'cp-pt',
      labelText: 'Portugal',
      country: SgInputPostalCodeCountry.pt,
    ),
    SizedBox(height: 12),
    SgInputPostalCode(
      id: 'cp-us',
      labelText: 'Estados Unidos',
      country: SgInputPostalCodeCountry.us,
    ),
    SizedBox(height: 12),
    SgInputPostalCode(
      id: 'cp-ar',
      labelText: 'Argentina',
      country: SgInputPostalCodeCountry.ar,
    ),
  ],
)
```

### Consulta ao ViaCEP

Aqui a consulta é simulada (viaCepFetch); só vale para o Brasil.

Região `sgInputPostalCodeViacep` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SgInputPostalCode(
  id: 'cep-consulta',
  labelText: 'CEP com consulta',
  validateWithViaCep: true,
  viaCepErrorMessage: 'CEP inexistente',
  viaCepFetch: (cep) async => cep.startsWith('99')
      ? const SgViaCepResult(erro: true)
      : SgViaCepResult(cep: cep, uf: 'SP'),
)
```

## SgInputDate

Página: `apps/seedgrid_showcase/lib/pages/sg_input_date_page.dart` (4 exemplo(s) na página; abaixo 3).

### Básico

Digite ou abra o calendário; o valor entregue é a data ISO.

Região `sgInputDateBasico` em `sg_input_date_page.snippets.g.dart`.

```dart
const SgInputDate(id: 'data', labelText: 'Data')
```

### Limites de data

Fora do intervalo aparece a mensagem; no calendário os dias ficam desabilitados.

Região `sgInputDateLimites` em `sg_input_date_page.snippets.g.dart`.

```dart
const SgInputDate(
  id: 'data-limites',
  labelText: 'Dentro de 2026',
  minDate: '2026-01-01',
  maxDate: '2026-12-31',
  initialValue: '2026-06-15',
)
```

### Obrigatório

Região `sgInputDateObrigatorio` em `sg_input_date_page.snippets.g.dart`.

```dart
const SgInputDate(
  id: 'data-obrigatoria',
  labelText: 'Data da consulta',
  required: true,
  requiredMessage: 'Escolha uma data',
)
```

## SgInputBirthDate

Página: `apps/seedgrid_showcase/lib/pages/sg_input_birth_date_page.dart` (4 exemplo(s) na página; abaixo 3).

### Maior de idade

minAge: 18 limita a data máxima e valida a idade.

Região `sgInputBirthDateMaior` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
const SgInputBirthDate(
  id: 'nascimento',
  labelText: 'Data de nascimento',
  minAge: 18,
)
```

### Faixa de idade

Região `sgInputBirthDateFaixa` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
const SgInputBirthDate(
  id: 'nascimento-faixa',
  labelText: 'Entre 18 e 65 anos',
  minAge: 18,
  maxAge: 65,
)
```

### Obrigatório

Região `sgInputBirthDateObrigatorio` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
const SgInputBirthDate(
  id: 'nascimento-obrigatorio',
  labelText: 'Nascimento',
  minAge: 0,
  required: true,
  requiredMessage: 'Informe quando nasceu',
)
```

## SgInputNumber

Página: `apps/seedgrid_showcase/lib/pages/sg_input_number_page.dart` (5 exemplo(s) na página; abaixo 3).

### Casas decimais e sinal

decimals muda as casas (0 a n); allowNegative: false ignora o sinal de menos.

Região `sgInputNumberDecimais` em `sg_input_number_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputNumber(
      id: 'inteiro',
      labelText: 'Inteiro (decimals: 0)',
      decimals: 0,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'tres',
      labelText: 'Três casas (decimals: 3)',
      decimals: 3,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'positivo',
      labelText: 'Só positivo',
      allowNegative: false,
    ),
  ],
)
```

### Rótulo, afixos e vazio

labelPosition, prefixText/suffixText e emptyValue: nullValue (o campo começa vazio em vez de 0,00).

Região `sgInputNumberAfixos` em `sg_input_number_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputNumber(
      id: 'peso',
      labelText: 'Peso',
      labelPosition: SgInputNumberLabelPosition.top,
      suffixText: 'kg',
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'distancia',
      labelText: 'Distância',
      labelPosition: SgInputNumberLabelPosition.left,
      labelWidth: 110,
      suffixText: 'km',
      emptyValue: SgInputNumberEmptyValue.nullValue,
      hintText: 'digite',
    ),
  ],
)
```

### Validação

required (zero conta como vazio), minValue e maxValue com mensagens do idioma; a mensagem aparece ao sair do campo.

Região `sgInputNumberValidacao` em `sg_input_number_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputNumber(
      id: 'obrigatorio',
      labelText: 'Obrigatório',
      required: true,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'faixa',
      labelText: 'Entre 10 e 20',
      minValue: 10,
      maxValue: 20,
    ),
    SizedBox(height: 12),
    SgInputNumber(
      id: 'mensagem',
      labelText: 'Mínimo 5',
      minValue: 5,
      minValueMessage: 'Muito pouco',
    ),
  ],
)
```

## SgInputCurrency

Página: `apps/seedgrid_showcase/lib/pages/sg_input_currency_page.dart` (5 exemplo(s) na página; abaixo 3).

### Moedas e locales

currency e locale escolhem símbolo, posição e separadores (Intl). JPY não tem casas decimais.

Região `sgInputCurrencyMoedas` em `sg_input_currency_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputCurrency(
      id: 'usd',
      labelText: 'Dólar (en-US)',
      currency: 'USD',
      locale: 'en-US',
      initialValue: '1234.5',
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'eur',
      labelText: 'Euro (fr)',
      currency: 'EUR',
      locale: 'fr',
      initialValue: '1234.5',
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'jpy',
      labelText: 'Iene (sem casas)',
      currency: 'JPY',
      initialValue: '1234',
    ),
  ],
)
```

### Símbolo e agrupamento

currencyDisplay, currencySymbolPlacement, currencySymbolOverride, showCurrencySymbol e useGrouping.

Região `sgInputCurrencySimbolo` em `sg_input_currency_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputCurrency(
      id: 'codigo',
      labelText: 'Código no fim',
      currencyDisplay: SgInputCurrencyCurrencyDisplay.code,
      currencySymbolPlacement:
          SgInputCurrencyCurrencySymbolPlacement.suffix,
      initialValue: '1234.5',
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'pontos',
      labelText: 'Símbolo próprio',
      currencySymbolOverride: 'pts',
      initialValue: '10',
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'semsimbolo',
      labelText: 'Sem símbolo nem milhar',
      showCurrencySymbol: false,
      useGrouping: false,
      initialValue: '1234567.8',
    ),
  ],
)
```

### Validação

required (zero conta como vazio), minValue e maxValue; mensagens do idioma ou próprias.

Região `sgInputCurrencyValidacao` em `sg_input_currency_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgInputCurrency(
      id: 'obrigatorio',
      labelText: 'Obrigatório',
      required: true,
    ),
    SizedBox(height: 12),
    SgInputCurrency(
      id: 'faixa',
      labelText: 'Entre 10 e 500',
      minValue: 10,
      maxValue: 500,
      maxValueMessage: 'Acima do limite',
    ),
  ],
)
```

## SgInputOTP

Página: `apps/seedgrid_showcase/lib/pages/sg_input_otp_page.dart` (6 exemplo(s) na página; abaixo 3).

### Máscara com separador

9 = dígito, # = letra ou dígito, qualquer outro caractere é separador. onChange recebe o valor com separador e onRawChange, sem.

Região `sgInputOtpMascara` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'sep',
      label: 'Dígitos',
      mask: '999-999',
    ),
    SizedBox(height: 16),
    SgInputOTP(
      id: 'alfa',
      label: 'Alfanumérico',
      mask: '##-##-##',
    ),
  ],
)
```

### Validação

Obrigatório e validação própria (recebe o valor sem e com separador). A mensagem aparece ao sair do campo.

Região `sgInputOtpValidacao` em `sg_input_otp_page.snippets.g.dart`.

```dart
SgInputOTP(
  id: 'validacao',
  label: 'Código de convite',
  mask: '99-99',
  required: true,
  requiredMessage: 'Informe o código.',
  validation: (raw, masked) =>
      raw.length < 4 ? 'O código tem 4 dígitos.' : null,
)
```

### Estados

Região `sgInputOtpEstados` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'erro',
      label: 'Com erro',
      mask: '9999',
      defaultValue: '1234',
      error: 'Código expirado.',
    ),
    SizedBox(height: 16),
    SgInputOTP(
      id: 'desab',
      label: 'Desabilitado',
      mask: '9999',
      defaultValue: '12',
      disabled: true,
    ),
    SizedBox(height: 16),
    SgInputOTP(
      id: 'leitura',
      label: 'Somente leitura',
      mask: '9999',
      defaultValue: '9876',
      readOnly: true,
    ),
  ],
)
```

