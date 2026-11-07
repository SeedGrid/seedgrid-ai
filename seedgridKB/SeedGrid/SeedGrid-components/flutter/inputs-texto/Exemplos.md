---
description: "Exemplos Dart de Inputs de texto e documentos em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-texto, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 8a43f9d
analisado-em: 2026-11-07
---

# Exemplos — Inputs de texto e documentos (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos|Exemplos — Inputs de texto e documentos (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, e `${context.tx('texto')}` dentro de uma string virou `texto`. Conferido em 2026-11-07 por comparação de texto com as constantes `*PageSnippets` do showcase (seedgrid-fe-flutter 8a43f9d): todos os blocos abaixo são cópia 1:1 dessas constantes, com essa única alteração. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis `_x` do estado da página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes na página. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgInputText

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_page.dart` (19 exemplo(s) na página; abaixo 3).

### Básico

Campo ligado a um formulário (SgFormController): name + control; o valor sai no envio.

Região `sgInputTextBasico` em `sg_input_text_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-basic',
        labelText: 'Nome completo',
        name: 'nome',
        control: _form,
      ),
    ),
    const SizedBox(height: 8),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => setState(() => _enviado = '${values['nome']}'),
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor: $_enviado'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: {'nome': '', 'controlled': 'Texto inicial'});`
- `String _enviado = '';`

### Obrigatório

required valida ao sair do campo; requiredMessage troca a mensagem.

Região `sgInputTextObrigatorio` em `sg_input_text_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-required',
        labelText: 'Campo obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        required: true,
        requiredMessage: 'Preencha este campo!',
      ),
    ),
  ],
)
```

### Controlado

O formulário guarda o valor: setValue preenche ou limpa o campo por fora e o valor atual aparece em tempo real.

Região `sgInputTextControlado` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputText(
        id: 'demo-controlled',
        labelText: 'Nome do cliente',
        name: 'controlled',
        control: _form,
      ),
      const SizedBox(height: 12),
      ListenableBuilder(
        listenable: _form,
        builder: (context, _) => Text(
          'Estado atual: "${_form.getValue('controlled') ?? ''}"',
        ),
      ),
      const SizedBox(height: 8),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            label: Text(
              'Simular preenchimento via API',
            ),
            onClick: () => _form.setValue(
              'controlled',
              'Texto vindo da API',
            ),
          ),
          SgButton(
            appearance: SgAppearance.outline,
            label: Text('Setar outro valor'),
            onClick: () => _form.setValue(
              'controlled',
              'Outro valor',
            ),
          ),
          SgButton(
            appearance: SgAppearance.outline,
            severity: SgSeverity.danger,
            label: Text('Limpar campo'),
            onClick: () => _form.setValue('controlled', ''),
          ),
        ],
      ),
    ],
  ),
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: {'nome': '', 'controlled': 'Texto inicial'});`

## SgInputTextArea

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_area_page.dart` (18 exemplo(s) na página; abaixo 3).

### Básico

Textarea com floating label e botão limpar (padrão).

Região `sgInputTextAreaBasico` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextArea(
        id: 'demo-basic',
        labelText: 'Descrição',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida ao perder o foco (validateOnBlur=true por padrão).

Região `sgInputTextAreaObrigatorio` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-required',
        labelText: 'Campo obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        required: true,
        requiredMessage: 'Preencha este campo!',
      ),
    ),
  ],
)
```

### Controlado

Para controlar o valor de fora (setar, limpar, preencher via API), use o formulário: setValue atualiza o campo e o estado atual aparece em tempo real.

Região `sgInputTextAreaControlado` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextArea(
        id: 'demo-controlled',
        labelText: 'Observações',
        name: 'controlled',
        control: _form,
      ),
      const SizedBox(height: 12),
      ListenableBuilder(
        listenable: _form,
        builder: (context, _) => Text(
          'Estado atual: "${_form.getValue('controlled') ?? ''}"',
        ),
      ),
      const SizedBox(height: 8),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text(
              'Simular preenchimento via API',
            ),
            onClick: () => _form.setValue(
              'controlled',
              'Texto preenchido via API.',
            ),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Setar outro valor'),
            onClick: () => _form.setValue(
              'controlled',
              'Outro valor qualquer',
            ),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            severity: SgSeverity.danger,
            label: Text('Limpar campo'),
            onClick: () => _form.setValue('controlled', ''),
          ),
        ],
      ),
    ],
  ),
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: {'controlled': ''});`

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

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _busca = '(nenhuma ainda)';`

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

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _crua = '';`
- `int _disparos = 0;`

### minChars e debounceMs

Dispara a partir de 1 caractere e com 100 ms de espera.

Região `sgInputTextSearchAjuste` em `sg_input_text_search_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputTextSearch(
      id: 'ajuste',
      labelText: 'Resposta rápida',
      minChars: 1,
      debounceMs: 100,
      onSearchChange: (valor) => setState(() => _rapida = valor),
    ),
    const SizedBox(height: 8),
    Text('Última busca: $_rapida'),
  ],
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _rapida = '(nenhuma ainda)';`

## SgInputEmail

Página: `apps/seedgrid_showcase/lib/pages/sg_input_email_page.dart` (13 exemplo(s) na página; abaixo 3).

### Básico

Email com label e hint.

Região `sgInputEmailBasico` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputEmail(
        id: 'demo-basic',
        labelText: 'Email',
        hintText: 'exemplo@dominio.com',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputEmailObrigatorio` em `sg_input_email_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-required',
        labelText: 'Email obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o email.',
      ),
    ),
  ],
)
```

### Mensagem inválida

Personaliza mensagem de email inválido.

Região `sgInputEmailInvalido` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputEmail(
    id: 'demo-invalid',
    labelText: 'Email',
    hintText: 'exemplo@dominio.com',
    invalidMessage: 'Email inválido.',
  ),
)
```

## SgInputPassword

Página: `apps/seedgrid_showcase/lib/pages/sg_input_password_page.dart` (8 exemplo(s) na página; abaixo 3).

### Básico

Senha com label, hint e toggle de visibilidade.

Região `sgInputPasswordBasico` em `sg_input_password_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPassword(
        id: 'demo-basic',
        labelText: 'Senha',
        hintText: 'Digite sua senha',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputPasswordObrigatorio` em `sg_input_password_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPassword(
    id: 'demo-required',
    labelText: 'Senha obrigatória',
    hintText: 'Obrigatório',
    required: true,
  ),
)
```

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputPasswordValidacao` em `sg_input_password_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPassword(
        id: 'demo-validation',
        labelText: 'Mínimo 8',
        hintText: 'Mínimo 8 caracteres',
        validation: (value) => value.length < 8
            ? 'Senha precisa ter no mínimo 8 caracteres.'
            : null,
        onValidation: (msg) => setState(() => _validationMsg = msg),
      ),
      const SizedBox(height: 8),
      Text(
        'onValidation: ${_validationMsg ?? 'válido'}',
      ),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String? _validationMsg;`

## SgInputPhone

Página: `apps/seedgrid_showcase/lib/pages/sg_input_phone_page.dart` (10 exemplo(s) na página; abaixo 3).

### Básico

Telefone com label e hint.

Região `sgInputPhoneBasico` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPhone(
        id: 'demo-basic',
        labelText: 'Telefone',
        hintText: '(00) 00000-0000',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: "$_basico"'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputPhoneObrigatorio` em `sg_input_phone_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPhone(
        id: 'demo-required',
        labelText: 'Telefone obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPhone(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o telefone.',
      ),
    ),
  ],
)
```

### Mensagem inválida

Personaliza mensagem de telefone inválido.

Região `sgInputPhoneInvalida` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPhone(
    id: 'demo-invalid',
    labelText: 'Telefone',
    hintText: '(00) 00000-0000',
    invalidMessage: 'Telefone inválido.',
  ),
)
```

## SgInputCPF

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpf_page.dart` (11 exemplo(s) na página; abaixo 3).

### Básico

CPF com label e hint.

Região `sgInputCpfBasico` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPF(
        id: 'demo-basic',
        labelText: 'CPF',
        hintText: '000.000.000-00',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputCpfObrigatorio` em `sg_input_cpf_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCPF(
        id: 'demo-required',
        labelText: 'CPF obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCPF(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o CPF.',
      ),
    ),
  ],
)
```

### Mensagem de tamanho

Personaliza mensagem quando CPF não tem 11 dígitos.

Região `sgInputCpfTamanho` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPF(
    id: 'demo-length',
    labelText: 'CPF',
    hintText: '000.000.000-00',
    lengthMessage: 'CPF deve ter 11 dígitos.',
  ),
)
```

## SgInputCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cnpj_page.dart` (14 exemplo(s) na página; abaixo 3).

### Básico

CNPJ com label e hint.

Região `sgInputCnpjBasico` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCNPJ(
        id: 'demo-basic',
        labelText: 'CNPJ',
        hintText: '00.000.000/0000-00',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### CNPJ alfanumérico

Exemplo com letras (A-Z) no corpo e DVs numéricos.

Região `sgInputCnpjAlfanumerico` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCNPJ(
    id: 'demo-alnum',
    labelText: 'CNPJ alfanumérico',
    hintText: '00.000.000/E08G-12',
    initialValue: '00.000.000/E08G-12',
  ),
)
```

### Exemplos válidos (alfanumérico)

Lista de CNPJs alfanuméricos válidos.

Região `sgInputCnpjListaAlfanumerica` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
const SelectableText(
  '// Exemplos válidos\n'
  '00.000.000/E08G-12  (raw: 00000000E08G12)\n'
  'GK.IPC.PIK/0001-52  (raw: GKIPCPIK000152)\n'
  'AB.12C.345/D6E7-99  (raw: AB12C345D6E799)\n'
  '12.ABC.345/DE67-34  (raw: 12ABC345DE6734)\n'
  'A1.B2C.3D4/E5F6-68  (raw: A1B2C3D4E5F668)\n'
  'ZX.CVB.NM1/2345-84  (raw: ZXCVBNM1234584)',
  style: TextStyle(fontFamily: 'monospace', fontSize: 12),
)
```

## SgInputCPFCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpfcnpj_page.dart` (13 exemplo(s) na página; abaixo 3).

### Básico

CPF/CNPJ com label e hint.

Região `sgInputCpfCnpjBasico` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPFCNPJ(
        id: 'demo-basic',
        labelText: 'Documento',
        hintText: 'CPF ou CNPJ',
        onChange: (v) => setState(() => _basico = v),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_basico'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _basico = '';`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputCpfCnpjObrigatorio` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCPFCNPJ(
        id: 'demo-required',
        labelText: 'Documento obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCPFCNPJ(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o CPF/CNPJ.',
      ),
    ),
  ],
)
```

### Mensagem inválida

Personaliza mensagem de documento inválido.

Região `sgInputCpfCnpjInvalida` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPFCNPJ(
    id: 'demo-invalid',
    labelText: 'Documento',
    hintText: 'CPF ou CNPJ',
    invalidMessage: 'Documento inválido.',
  ),
)
```

## SgInputPostalCode

Página: `apps/seedgrid_showcase/lib/pages/sg_input_postal_code_page.dart` (16 exemplo(s) na página; abaixo 3).

### Básico

Código postal com label e hint (padrão: Brasil).

Região `sgInputPostalCodeBasico` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPostalCode(
        id: 'demo-basic',
        labelText: 'CEP (Brasil)',
        hintText: '00000-000',
        name: 'cep',
        control: _form,
      ),
      const SizedBox(height: 8),
      ListenableBuilder(
        listenable: _form,
        builder: (context, _) => Text(
          'Valor: "${_form.getValue('cep') ?? ''}"',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: {'cep': '', 'controlled': ''});`

### Países

Cada país tem máscara, tamanho e validação específicos.

Região `sgInputPostalCodePaises` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    for (final (country, label, hint) in [
      (
        SgInputPostalCodeCountry.br,
        'CEP (Brasil)',
        '00000-000',
      ),
      (
        SgInputPostalCodeCountry.pt,
        'Código postal (Portugal)',
        '0000-000',
      ),
      (
        SgInputPostalCodeCountry.us,
        'ZIP code (EUA)',
        '00000',
      ),
      (
        SgInputPostalCodeCountry.es,
        'Código postal (Espanha)',
        '00000',
      ),
      (
        SgInputPostalCodeCountry.uy,
        'Código postal (Uruguai)',
        '00000',
      ),
      (
        SgInputPostalCodeCountry.ar,
        'Código postal (Argentina)',
        'A0000AAA',
      ),
      (
        SgInputPostalCodeCountry.py,
        'Código postal (Paraguai)',
        '000000',
      ),
    ])
      SizedBox(
        width: 280,
        child: SgInputPostalCode(
          id: 'demo-${country.name}',
          country: country,
          labelText: label,
          hintText: hint,
        ),
      ),
  ],
)
```

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputPostalCodeObrigatorio` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-required',
        labelText: 'Código postal obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o código postal.',
      ),
    ),
  ],
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

Página: `apps/seedgrid_showcase/lib/pages/sg_input_number_page.dart` (16 exemplo(s) na página; abaixo 3).

### Básico

Campo ligado a um formulário (SgFormController): name + control; o valor sai no envio.

Região `sgInputNumberBasico` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputNumber(
        id: 'demo-basic',
        labelText: 'Valor',
        name: 'valor',
        control: _form,
        decimals: 2,
      ),
      const SizedBox(height: 8),
      SgButton(
        size: SgSize.sm,
        appearance: SgAppearance.outline,
        label: Text('Enviar'),
        onClick: () => _form.handleSubmit(
          (values) =>
              setState(() => _enviado = '${values['valor']}'),
        ),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_enviado'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: { 'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': '', });`
- `String _enviado = '';`

### Obrigatório

Valida ao perder o foco (validateOnBlur=true por padrão).

Região `sgInputNumberObrigatorio` em `sg_input_number_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-required',
        labelText: 'Campo obrigatório',
        required: true,
        decimals: 2,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        required: true,
        requiredMessage: 'Informe um valor.',
        decimals: 2,
      ),
    ),
  ],
)
```

### Controlado

Use quando precisa do valor em tempo real e de setValue externos.

Região `sgInputNumberControlado` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputNumber(
        id: 'demo-controlled',
        labelText: 'Valor controlado',
        name: 'controlled',
        control: _form,
        decimals: 2,
      ),
      const SizedBox(height: 12),
      ListenableBuilder(
        listenable: _form,
        builder: (context, _) => Text(
          'Estado atual: "${_form.getValue('controlled') ?? ''}"',
        ),
      ),
      const SizedBox(height: 8),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Setar via API'),
            onClick: () => _form.setValue('controlled', '12345.00'),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Resetar'),
            onClick: () => _form.setValue('controlled', '0.00'),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            severity: SgSeverity.danger,
            label: Text('Limpar'),
            onClick: () => _form.setValue('controlled', ''),
          ),
        ],
      ),
    ],
  ),
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: { 'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': '', });`

## SgInputCurrency

Página: `apps/seedgrid_showcase/lib/pages/sg_input_currency_page.dart` (15 exemplo(s) na página; abaixo 3).

### Básico

Campo ligado a um formulário (SgFormController): name + control; o valor sai no envio.

Região `sgInputCurrencyBasico` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCurrency(
        id: 'demo-basic',
        currency: 'BRL',
        labelText: 'Valor',
        name: 'valor',
        control: _form,
      ),
      const SizedBox(height: 8),
      SgButton(
        size: SgSize.sm,
        appearance: SgAppearance.outline,
        label: Text('Enviar'),
        onClick: () => _form.handleSubmit(
          (values) =>
              setState(() => _enviado = '${values['valor']}'),
        ),
      ),
      const SizedBox(height: 8),
      Text('Valor: $_enviado'),
    ],
  ),
)
```

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: { 'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': '', });`
- `String _enviado = '';`

### Obrigatório

Valida ao perder o foco (validateOnBlur=true por padrão).

Região `sgInputCurrencyObrigatorio` em `sg_input_currency_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-required',
        currency: 'BRL',
        labelText: 'Campo obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-required-custom',
        currency: 'BRL',
        labelText: 'Mensagem customizada',
        required: true,
        requiredMessage: 'Informe um valor.',
      ),
    ),
  ],
)
```

### Controlado

Use quando precisa do valor em tempo real e de setValue externos.

Região `sgInputCurrencyControlado` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCurrency(
        id: 'demo-controlled',
        currency: 'BRL',
        labelText: 'Valor controlado',
        name: 'controlled',
        control: _form,
      ),
      const SizedBox(height: 12),
      ListenableBuilder(
        listenable: _form,
        builder: (context, _) => Text(
          'Estado atual: "${_form.getValue('controlled') ?? ''}"',
        ),
      ),
      const SizedBox(height: 8),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Setar via API'),
            onClick: () => _form.setValue('controlled', '12345.00'),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            label: Text('Resetar'),
            onClick: () => _form.setValue('controlled', '0.00'),
          ),
          SgButton(
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            severity: SgSeverity.danger,
            label: Text('Limpar'),
            onClick: () => _form.setValue('controlled', ''),
          ),
        ],
      ),
    ],
  ),
)
```

Nota: este trecho usa estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `final SgFormController _form = SgFormController(defaultValues: { 'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': '', });`

## SgInputOTP

Página: `apps/seedgrid_showcase/lib/pages/sg_input_otp_page.dart` (6 exemplo(s) na página; abaixo 3).

### Básico

Seis dígitos. Digitar avança, Backspace volta, setas movem, e colar o código inteiro distribui nos campos.

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

Nota: este trecho usa `setState` e estado da página do showcase (`State` de um `StatefulWidget`); para copiar, declare no seu `State`:
- `String _concluido = '';`

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

