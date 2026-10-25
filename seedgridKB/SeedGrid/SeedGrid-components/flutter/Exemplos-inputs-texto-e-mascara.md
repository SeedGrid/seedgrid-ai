---
description: "Exemplos Flutter de Inputs de texto e máscara copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos]
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Inputs de texto e máscara

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgInputText

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_text_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputTextBasico` em `sg_input_text_page.snippets.g.dart`.

```dart
const SgInputText(
  id: 'nome',
  labelText: 'Nome',
  placeholder: 'Digite seu nome',
)
```

### Prefixo, sufixo e contador

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

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_text_area_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputTextAreaBasico` em `sg_input_text_area_page.snippets.g.dart`.

```dart
const SgInputTextArea(id: 'obs', labelText: 'Observações')
```

### Obrigatório e validação própria

Região `sgInputTextAreaValidacao` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SgInputTextArea(
  id: 'justificativa',
  labelText: 'Justificativa',
  required: true,
  requiredMessage: 'Explique o motivo',
  validation: (v) => v.toLowerCase().contains('urgente')
      ? 'Evite a palavra "urgente"'
      : null,
)
```

## SgInputTextSearch

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_text_search_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

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

### Rótulo, largura e botão de limpar

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

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_email_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputEmailBasico` em `sg_input_email_page.snippets.g.dart`.

```dart
const SgInputEmail(
  id: 'email',
  labelText: 'E-mail',
  placeholder: 'voce@empresa.com',
)
```

### Validação própria

Região `sgInputEmailValidacao` em `sg_input_email_page.snippets.g.dart`.

```dart
SgInputEmail(
  id: 'corporativo',
  labelText: 'E-mail corporativo',
  validation: (v) => v.endsWith('@empresa.com')
      ? null
      : 'Use o e-mail @empresa.com',
)
```

## SgInputPassword

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_password_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputPasswordBasico` em `sg_input_password_page.snippets.g.dart`.

```dart
const SgInputPassword(id: 'senha', labelText: 'Senha')
```

### Gerar senha forte

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

## SgInputCpf

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_cpf_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputCpfBasico` em `sg_input_cpf_page.snippets.g.dart`.

```dart
const SgInputCPF(id: 'cpf', labelText: 'CPF')
```

### Validação própria

Região `sgInputCpfValidacao` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SgInputCPF(
  id: 'cpf-regra',
  labelText: 'CPF (não aceita 000...)',
  validation: (v) =>
      v.startsWith('000') ? 'CPF de teste não permitido' : null,
)
```

## SgInputCnpj

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_cnpj_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

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

## SgInputCpfcnpj

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_cpfcnpj_page.dart` (3 exemplo(s) na página; abaixo 2).

### Básico

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

## SgInputPhone

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_phone_page.dart` (3 exemplo(s) na página; abaixo 2).

### Básico

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

## SgInputPostalCode

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_postal_code_page.dart` (4 exemplo(s) na página; abaixo 2).

### CEP (padrão)

Região `sgInputPostalCodeBasico` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
const SgInputPostalCode(id: 'cep', labelText: 'CEP')
```

### Consulta ao ViaCEP

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

## SgInputBirthDate

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_birth_date_page.dart` (4 exemplo(s) na página; abaixo 2).

### Maior de idade

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

## SgInputDate

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_date_page.dart` (4 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputDateBasico` em `sg_input_date_page.snippets.g.dart`.

```dart
const SgInputDate(id: 'data', labelText: 'Data')
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

## SgInputOtp

Fonte: `apps/seedgrid_showcase/lib/pages/sg_input_otp_page.dart` (6 exemplo(s) na página; abaixo 2).

### Básico

Região `sgInputOtpBasico` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'basico',
      label: 'Código de verificação',
      hintText: 'Enviamos 6 dígitos por SMS.',
      onComplete: (v) => setState(() => _concluido = v),
    ),
    if (_concluido.isNotEmpty) Text('Código completo: $_concluido'),
  ],
)
```

### Validação

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
