---
description: "Exemplos Dart de Inputs de texto e documentos em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (todos os exemplos de cada componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-texto, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Inputs de texto e documentos (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos|Exemplos — Inputs de texto e documentos (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Conferência de 2026-11-12 dos exemplos de `SgInputNumber` e `SgInputCurrency` (standalone, validação e valor vazio mudaram com `emptyValueIsNull` e `validation(num?)`): blocos regerados das constantes em `*.snippets.g.dart` do working tree do `fe-flutter` (HEAD local `19f7830`, sem push) e comparados texto a texto. Conferência anterior de 2026-11-09: cada bloco foi regerado a partir da constante correspondente em `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 e comparado texto a texto (idêntico). Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`, `${context.tx('texto')}` dentro de uma string virou `texto` e `context.txf('texto {k}', {'k': v})` virou a interpolação `'texto $v'`. O showcase não usa `setState` de página: o estado dos exemplos fica em `ValueNotifier`/`SgFormController` (campos com `name` + `control`) lidos por `ValueListenableBuilder`/`ListenableBuilder`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam membros `_x` definidos na página trazem uma **Nota** logo abaixo do bloco com as declarações correspondentes. Todos os exemplos de cada componente do showcase estão abaixo, na ordem e com os títulos dele (`apps/seedgrid_showcase`).

## SgInputText

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_page.dart` (19 exemplo(s) na página; abaixo 19).

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
        (values) => _enviado.value = '${values['nome']}',
      ),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) =>
          Text('Valor: $enviado'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'nome': '', 'controlled': 'Texto inicial'});`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'nome': '', 'controlled': 'Texto inicial'});`

### Contador de caracteres

Usa maxLength e showCharCounter para limitar e exibir contagem.

Região `sgInputTextContador` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-counter',
    labelText: 'Máximo 20 caracteres',
    maxLength: 20,
    showCharCounter: true,
  ),
)
```

### Tamanho mínimo

Valida que o texto tem um tamanho mínimo ao perder foco.

Região `sgInputTextTamanhoMinimo` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-minlength',
    labelText: 'Mínimo 5 caracteres',
    minLength: 5,
    showCharCounter: true,
  ),
)
```

### Mínimo de palavras

Valida quantidade mínima de palavras.

Região `sgInputTextPalavras` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-words',
    labelText: 'Mínimo 3 palavras',
    minNumberOfWords: 3,
    minNumberOfWordsMessage: 
      'Digite pelo menos 3 palavras.',
    ,
  ),
)
```

### Validação customizada

validation devolve a mensagem de erro (ou null) e onValidation informa o resultado.

Região `sgInputTextValidacao` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputText(
        id: 'demo-validation',
        labelText: 'Apenas letras',
        validation: (v) =>
            RegExp(r'[^\p{L}\s]', unicode: true).hasMatch(v)
            ? 'Apenas letras são permitidas.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Ícone de prefixo

Ícone posicionado à esquerda do input.

Região `sgInputTextIcone` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-prefix',
    labelText: 'Buscar',
    prefixIcon: const Icon(Icons.search, size: 16),
  ),
)
```

### Prefixo e sufixo

Prefixo/sufixo são apenas visuais. O valor retornado já vem concatenado.

Região `sgInputTextAfixos` em `sg_input_text_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-suffix',
        labelText: 'Email',
        suffixText: '@gmail.com',
        onChange: (v) => _sufixo.value = v,
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _sufixo,
      builder: (context, valor, _) =>
          Text('Valor completo: $valor'),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-prefix-text',
        labelText: 'Website',
        prefixText: 'www.',
        onChange: (v) => _prefixo.value = v,
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _prefixo,
      builder: (context, valor, _) =>
          Text('Valor completo: $valor'),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 384,
      child: SgInputText(
        id: 'demo-both',
        labelText: 'Domínio',
        prefixText: 'www.',
        suffixText: '.seedgrid.com.br',
        onChange: (v) => _ambos.value = v,
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _ambos,
      builder: (context, valor, _) =>
          Text('Valor completo: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _sufixo = ValueNotifier('');`
- `final ValueNotifier<String> _prefixo = ValueNotifier('');`
- `final ValueNotifier<String> _ambos = ValueNotifier('');`

### Botões de ícone

iconButtons recebe uma lista de botões; cada botão tem o onClick que você definir.

Região `sgInputTextBotoes` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    children: [
      SgInputText(
        id: 'demo-iconbtns',
        labelText: 'Texto para copiar',
        iconButtons: [
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.copy),
            onClick: () => _iconLog.value = [
              'Copiado',
              ..._iconLog.value,
            ],
          ),
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.notifications_outlined),
            onClick: () => _iconLog.value = [
              'Alerta disparado!',
              ..._iconLog.value,
            ],
          ),
        ],
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _iconLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Digite algo e clique nos ícones...',
          height: 96,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<String>> _iconLog = ValueNotifier(const []);`

### Variações visuais

Sem borda (withBorder: false) e preenchido (filled: true).

Região `sgInputTextVariacoes` em `sg_input_text_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-filled',
        labelText: 'Preenchido',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputTextSemLimpar` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputTextLargura` em `sg_input_text_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputText(
      id: 'demo-w200',
      labelText: '200px',
      width: 200,
    ),
    SgInputText(
      id: 'demo-w300',
      labelText: '300px arredondado',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado e somente leitura

enabled=false desabilita, readOnly=true impede edição.

Região `sgInputTextEstados` em `sg_input_text_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-disabled',
        labelText: 'Desabilitado',
        initialValue: 'Não editável',
        enabled: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputText(
        id: 'demo-readonly',
        labelText: 'Somente leitura',
        initialValue: 'Apenas leitura',
        readOnly: true,
      ),
    ),
  ],
)
```

### Erro externo

Prop error exibe mensagem de erro vinda do pai (server-side, etc).

Região `sgInputTextErroExterno` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputText(
    id: 'demo-error',
    labelText: 'Com erro externo',
    error: 'Este email já está cadastrado.',
  ),
)
```

### Standalone (form completo)

Sem controlador de formulário: cada campo avisa o valor em onChange e o botão monta o resultado.

Região `sgInputTextStandalone` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputText(
        id: 'standalone-nome',
        labelText: 'Nome',
        onChange: (v) => _standalone['nome'] = v,
      ),
      const SizedBox(height: 12),
      SgInputText(
        id: 'standalone-email',
        labelText: 'E-mail',
        onChange: (v) => _standalone['email'] = v,
      ),
      const SizedBox(height: 12),
      SgInputText(
        id: 'standalone-cpf',
        labelText: 'CPF',
        onChange: (v) => _standalone['cpf'] = v,
      ),
      const SizedBox(height: 12),
      SgButton(
        label: Text('Salvar'),
        onClick: () => _log(
          '[salvar] ${{'nome': _standalone['nome'] ?? '', 'email': _standalone['email'] ?? '', 'cpf': _standalone['cpf'] ?? ''}}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final Map<String, String> _standalone = {};`
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputTextEventos` em `sg_input_text_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputText(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputTextRotulo` em `sg_input_text_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputTextLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-label-top',
        labelText: 'Acima',
        labelPosition: SgInputTextLabelPosition.top,
        elevation: SgInputTextElevation.md,
        withBorder: false,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputText(
        id: 'sg-input-text-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputTextLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputTextLabelAlign.end,
      ),
    ),
  ],
)
```

### Elevação

Compare os níveis de sombra disponíveis no campo.

Região `sgInputTextElevacao` em `sg_input_text_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-elevation-none',
        labelText: 'Elevação none',
        elevation: SgInputTextElevation.none,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-elevation-sm',
        labelText: 'Elevação sm',
        elevation: SgInputTextElevation.sm,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-elevation-md',
        labelText: 'Elevação md',
        elevation: SgInputTextElevation.md,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputText(
        id: 'sg-input-text-elevation-lg',
        labelText: 'Elevação lg',
        elevation: SgInputTextElevation.lg,
      ),
    ),
  ],
)
```

## SgInputTextArea

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_area_page.dart` (18 exemplo(s) na página; abaixo 18).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'controlled': ''});`

### Contador de caracteres

Usa maxLength e showCharCounter para limitar e exibir contagem.

Região `sgInputTextAreaContador` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-counter',
    labelText: 'Máximo 100 caracteres',
    maxLength: 100,
    showCharCounter: true,
  ),
)
```

### Tamanho mínimo

Valida que o texto tem um tamanho mínimo ao perder foco.

Região `sgInputTextAreaTamanhoMinimo` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-minlength',
    labelText: 'Mínimo 10 caracteres',
    minLength: 10,
    showCharCounter: true,
  ),
)
```

### Mínimo de palavras

Valida quantidade mínima de palavras.

Região `sgInputTextAreaPalavras` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-words',
    labelText: 'Mínimo 5 palavras',
    minNumberOfWords: 5,
    minNumberOfWordsMessage: 
      'Digite pelo menos 5 palavras.',
    ,
  ),
)
```

### Mínimo de linhas

Valida que o texto tem um número mínimo de linhas (quebras de linha). Exclusivo do TextArea.

Região `sgInputTextAreaLinhasMinimo` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-minlines',
    labelText: 'Mínimo 3 linhas',
    minLines: 3,
    minLinesMessage: 'Escreva pelo menos 3 linhas.',
  ),
)
```

### Validação customizada

Função de validação retorna mensagem de erro ou null.

Região `sgInputTextAreaValidacao` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextArea(
        id: 'demo-validation',
        labelText: 'Sem números',
        validation: (v) => RegExp(r'\d').hasMatch(v)
            ? 'Números não são permitidos.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Altura e linhas visíveis

height controla a altura do container. maxLines define as linhas visíveis do campo.

Região `sgInputTextAreaLinhas` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-height-small',
        labelText: 'Altura 100px, 2 rows',
        height: 100,
        maxLines: 2,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-height-large',
        labelText: 'Altura 250px, 8 rows',
        height: 250,
        maxLines: 8,
      ),
    ),
  ],
)
```

### Ícone de prefixo

Ícone posicionado no canto superior esquerdo do textarea.

Região `sgInputTextAreaIcone` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-prefix',
    labelText: 'Observações',
    prefixIcon: const Icon(Icons.notes, size: 16),
  ),
)
```

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputTextAreaVariacoes` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-filled',
        labelText: 'Preenchido',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputTextAreaSemLimpar` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputTextAreaLargura` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputTextArea(
      id: 'demo-w250',
      labelText: '250px',
      width: 250,
    ),
    SgInputTextArea(
      id: 'demo-w350',
      labelText: '350px arredondado',
      width: 350,
      borderRadius: 16,
    ),
  ],
)
```

### Desabilitado e somente leitura

enabled=false desabilita o campo; readOnly impede a edição, mas deixa copiar.

Região `sgInputTextAreaEstados` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-disabled',
        labelText: 'Desabilitado',
        enabled: false,
        initialValue: 'Não editável',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 384,
      child: SgInputTextArea(
        id: 'demo-readonly',
        labelText: 'Somente leitura',
        readOnly: true,
        initialValue: 'Apenas leitura',
      ),
    ),
  ],
)
```

### Erro externo

Prop error exibe mensagem de erro vinda do pai (server-side, etc).

Região `sgInputTextAreaErroExterno` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: SgInputTextArea(
    id: 'demo-error',
    labelText: 'Com erro externo',
    error: 'Descrição muito curta.',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputTextAreaEventos` em `sg_input_text_area_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextArea(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        required: true,
        onChange: (v) =>
            _log('onChange: "${v.replaceAll('\n', r'\n')}"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o textarea...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputTextAreaRotulo` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputTextAreaLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-label-top',
        labelText: 'Acima',
        labelPosition: SgInputTextAreaLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputTextArea(
        id: 'sg-input-text-area-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputTextAreaLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputTextAreaLabelAlign.end,
      ),
    ),
  ],
)
```

### Elevação

Compare os níveis de sombra disponíveis no campo.

Região `sgInputTextAreaElevacao` em `sg_input_text_area_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-elevation-none',
        labelText: 'Elevação none',
        elevation: SgInputTextAreaElevation.none,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-elevation-sm',
        labelText: 'Elevação sm',
        elevation: SgInputTextAreaElevation.sm,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-elevation-md',
        labelText: 'Elevação md',
        elevation: SgInputTextAreaElevation.md,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputTextArea(
        id: 'sg-input-text-area-elevation-lg',
        labelText: 'Elevação lg',
        elevation: SgInputTextAreaElevation.lg,
      ),
    ),
  ],
)
```

## SgInputTextSearch

Página: `apps/seedgrid_showcase/lib/pages/sg_input_text_search_page.dart` (4 exemplo(s) na página; abaixo 4).

### Básico (minChars 3, debounce 350ms)

Digite e observe: o valor imediato muda a cada tecla, o termo de busca só atualiza após parar de digitar e com 3+ caracteres.

Região `sgInputTextSearchBasico` em `sg_input_text_search_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextSearch(
        id: 'search-basic',
        labelText: 'Busca',
        placeholder: 'Digite para buscar',
        onChange: (valor) => _imediato.value = valor,
        onSearchChange: (valor) => _busca.value = valor,
      ),
      const SizedBox(height: 8),
      ListenableBuilder(
        listenable: Listenable.merge([_imediato, _busca]),
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Valor imediato (onChange): ${_imediato.value.isEmpty ? '(vazio)' : _imediato.value}',
            ),
            Text(
              'Termo de busca (onSearchChange): ${_busca.value.isEmpty ? '(vazio)' : _busca.value}',
            ),
          ],
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _imediato = ValueNotifier('');`
- `final ValueNotifier<String> _busca = ValueNotifier('');`

### minChars 1 e debounce 800ms

Dispara com 1 caractere, mas com um debounce mais longo.

Região `sgInputTextSearchAjuste` em `sg_input_text_search_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextSearch(
        id: 'search-tuned',
        labelText: 'Busca',
        placeholder: 'Digite para buscar',
        minChars: 1,
        debounceMs: 800,
        onChange: (valor) => _imediato2.value = valor,
        onSearchChange: (valor) => _busca2.value = valor,
      ),
      const SizedBox(height: 8),
      ListenableBuilder(
        listenable: Listenable.merge([_imediato2, _busca2]),
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Valor imediato (onChange): ${_imediato2.value.isEmpty ? '(vazio)' : _imediato2.value}',
            ),
            Text(
              'Termo de busca (onSearchChange): ${_busca2.value.isEmpty ? '(vazio)' : _busca2.value}',
            ),
          ],
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _imediato2 = ValueNotifier('');`
- `final ValueNotifier<String> _busca2 = ValueNotifier('');`

### onChange imediato x onSearchChange com debounce

onChange recebe cada digitação com o valor cru; onSearchChange só o valor normalizado e sem repetição.

Região `sgInputTextSearchEventos` em `sg_input_text_search_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputTextSearch(
        id: 'search-events',
        labelText: 'Digite e veja os eventos',
        onChange: (valor) => _crua.value = valor,
        onSearchChange: (valor) => _disparos.value++,
      ),
      const SizedBox(height: 8),
      ListenableBuilder(
        listenable: Listenable.merge([_crua, _disparos]),
        builder: (context, _) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('onChange (cru): "${_crua.value}"'),
            Text(
              'Buscas disparadas: ${_disparos.value}',
            ),
          ],
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _crua = ValueNotifier('');`
- `final ValueNotifier<int> _disparos = ValueNotifier(0);`

### Rótulo, largura e botão de limpar

Limpar o campo dispara a busca vazia (volta para a lista completa).

Região `sgInputTextSearchAparencia` em `sg_input_text_search_page.snippets.g.dart`.

```dart
SgInputTextSearch(
  id: 'search-appearance',
  labelText: 'Cliente',
  labelPosition: SgInputTextSearchLabelPosition.top,
  placeholder: 'Nome ou CPF',
  width: 320,
  filled: true,
  onSearchChange: (valor) {},
)
```

## SgInputEmail

Página: `apps/seedgrid_showcase/lib/pages/sg_input_email_page.dart` (13 exemplo(s) na página; abaixo 13).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

### Bloqueio de email temporário

blockFakeMail=true (padrão) bloqueia domínios descartáveis.

Região `sgInputEmailBloqueio` em `sg_input_email_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-blocked',
        labelText: 'Email',
        hintText: 'exemplo@dominio.com',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-blocked-off',
        labelText: 'Sem bloqueio',
        hintText: 'exemplo@dominio.com',
        blockFakeMail: false,
      ),
    ),
  ],
)
```

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputEmailValidacao` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputEmail(
        id: 'demo-validation',
        labelText: 'Somente domínio .com',
        hintText: 'seu@dominio.com',
        validation: (v) => v.endsWith('.com')
            ? null
            : 'Use domínio .com.',
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Lista bloqueada padrão

Domínios bloqueados por default.

Região `sgInputEmailLista` em `sg_input_email_page.snippets.g.dart`.

```dart
Container(
  width: double.infinity,
  padding: const EdgeInsets.all(12),
  decoration: BoxDecoration(
    color: Theme.of(
      context,
    ).colorScheme.onSurface.withValues(alpha: 0.05),
    border: Border.all(color: Theme.of(context).dividerColor),
    borderRadius: BorderRadius.circular(4),
  ),
  child: Text(
    defaultBlockedEmailDomains.join(', '),
    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
  ),
)
```

### Config JSON

A aplicação host pode carregar um JSON e adicionar domínios em runtime.

Região `sgInputEmailJson` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputEmail(
    id: 'demo-json',
    labelText: 'Email',
    hintText: 'exemplo@dominio.com',
    blockedEmailDomains:
        ((jsonDecode('{"blockedEmailDomains": ["concorrente.com"]}')
                    as Map<String, dynamic>)['blockedEmailDomains']
                as List)
            .cast<String>(),
  ),
)
```

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputEmailVariacoes` em `sg_input_email_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: 'Email',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputEmail(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: 'Email',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputEmailSemLimpar` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputEmail(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: 'Email',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputEmailLargura` em `sg_input_email_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputEmail(
      id: 'demo-w200',
      labelText: '200px',
      hintText: 'Email',
      width: 200,
    ),
    SgInputEmail(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: 'Email',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado

enabled=false desabilita.

Região `sgInputEmailDesabilitado` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputEmail(
    id: 'demo-disabled',
    labelText: 'Desabilitado',
    hintText: 'Email',
    enabled: false,
    initialValue: 'Não editável',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputEmailEventos` em `sg_input_email_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputEmail(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        hintText: 'Email',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputEmailRotulo` em `sg_input_email_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputEmail(
        id: 'sg-input-email-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputEmailLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputEmail(
        id: 'sg-input-email-label-top',
        labelText: 'Acima',
        labelPosition: SgInputEmailLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputEmail(
        id: 'sg-input-email-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputEmailLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputEmailLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputPassword

Página: `apps/seedgrid_showcase/lib/pages/sg_input_password_page.dart` (8 exemplo(s) na página; abaixo 8).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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
            ? 
                'Senha precisa ter no mínimo 8 caracteres.',
              
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) =>
            Text('onValidation: ${msg ?? 'válido'}'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputPasswordVariacoes` em `sg_input_password_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPassword(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPassword(
        id: 'demo-filled',
        labelText: 'Preenchido',
        filled: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPassword(
        id: 'demo-noclear',
        labelText: 'Sem limpar',
        clearButton: false,
      ),
    ),
  ],
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputPasswordEventos` em `sg_input_password_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPassword(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        required: true,
        onChange: (value) => _log('onChange: "$value"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputPasswordRotulo` em `sg_input_password_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputPassword(
        id: 'sg-input-password-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputPasswordLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputPassword(
        id: 'sg-input-password-label-top',
        labelText: 'Acima',
        labelPosition: SgInputPasswordLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputPassword(
        id: 'sg-input-password-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputPasswordLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputPasswordLabelAlign.end,
      ),
    ),
  ],
)
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

Página: `apps/seedgrid_showcase/lib/pages/sg_input_phone_page.dart` (10 exemplo(s) na página; abaixo 10).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: "$valor"'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputPhoneValidacao` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPhone(
        id: 'demo-validation',
        labelText: 'Telefone',
        hintText: '(00) 00000-0000',
        validation: (v) => v.startsWith('(00)')
            ? 'DDD inválido.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputPhoneVariacoes` em `sg_input_phone_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPhone(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: 'Telefone',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPhone(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: 'Telefone',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputPhoneSemLimpar` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPhone(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: 'Telefone',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputPhoneLargura` em `sg_input_phone_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputPhone(
      id: 'demo-w200',
      labelText: '200px',
      hintText: 'Telefone',
      width: 200,
    ),
    SgInputPhone(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: 'Telefone',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado

enabled=false desabilita.

Região `sgInputPhoneDesabilitado` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPhone(
    id: 'demo-disabled',
    labelText: 'Desabilitado',
    hintText: 'Telefone',
    enabled: false,
    initialValue: '(11) 99999-0000',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputPhoneEventos` em `sg_input_phone_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPhone(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        hintText: 'Telefone',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputPhoneRotulo` em `sg_input_phone_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputPhone(
        id: 'sg-input-phone-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputPhoneLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputPhone(
        id: 'sg-input-phone-label-top',
        labelText: 'Acima',
        labelPosition: SgInputPhoneLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputPhone(
        id: 'sg-input-phone-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputPhoneLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputPhoneLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputCPF

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpf_page.dart` (11 exemplo(s) na página; abaixo 11).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

### Mensagem inválida

Personaliza mensagem de CPF inválido.

Região `sgInputCpfInvalida` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPF(
    id: 'demo-invalid',
    labelText: 'CPF',
    hintText: '000.000.000-00',
    invalidMessage: 'CPF inválido.',
  ),
)
```

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputCpfValidacao` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPF(
        id: 'demo-validation',
        labelText: 'CPF',
        hintText: '000.000.000-00',
        validation: (v) => v.startsWith('123')
            ? 'CPF não pode iniciar com 123.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputCpfVariacoes` em `sg_input_cpf_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCPF(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: 'CPF',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCPF(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: 'CPF',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputCpfSemLimpar` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPF(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: 'CPF',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputCpfLargura` em `sg_input_cpf_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputCPF(
      id: 'demo-w200',
      labelText: '200px',
      hintText: 'CPF',
      width: 200,
    ),
    SgInputCPF(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: 'CPF',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado

enabled=false desabilita.

Região `sgInputCpfDesabilitado` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPF(
    id: 'demo-disabled',
    labelText: 'Desabilitado',
    hintText: 'CPF',
    enabled: false,
    initialValue: '000.000.000-00',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputCpfEventos` em `sg_input_cpf_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPF(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        hintText: 'CPF',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputCpfRotulo` em `sg_input_cpf_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputCPF(
        id: 'sg-input-cpf-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputCPFLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputCPF(
        id: 'sg-input-cpf-label-top',
        labelText: 'Acima',
        labelPosition: SgInputCPFLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputCPF(
        id: 'sg-input-cpf-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputCPFLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputCPFLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cnpj_page.dart` (14 exemplo(s) na página; abaixo 14).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

### Validação Pública CNPJ

Consulta publica.cnpj.ws para verificar se o CNPJ existe.

Região `sgInputCnpjConsulta` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputCNPJ(
        id: 'demo-publica',
        labelText: 'CNPJ',
        hintText: '00.000.000/0000-00',
        validateWithPublicaCnpj: true,
        publicaCnpjErrorMessage: 'CNPJ não encontrado.',
        onPublicaCnpjResult: (data) {
          _publicaResultado.value = data;
          _publicaErro.value = null;
        },
        onPublicaCnpjError: (_) => _publicaErro.value = 
          'Falha ao consultar API.',
        ,
      ),
    ),
    ListenableBuilder(
      listenable: Listenable.merge([
        _publicaResultado,
        _publicaErro,
      ]),
      builder: (context, _) {
        final resultado = _publicaResultado.value;
        final erro = _publicaErro.value;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (resultado != null) ...[
              const SizedBox(height: 8),
              Text('Resultado Publica CNPJ'),
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 240),
                child: SingleChildScrollView(
                  child: SelectableText(
                    const JsonEncoder.withIndent(
                      '  ',
                    ).convert(resultado),
                  ),
                ),
              ),
            ],
            if (erro != null) Text(erro),
          ],
        );
      },
    ),
    const SizedBox(height: 8),
    Text(
      
        'Se a API estiver fora do ar, o componente não bloqueia o usuário.',
      ,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _publicaResultado = ValueNotifier(null);`
- `final ValueNotifier<String?> _publicaErro = ValueNotifier(null);`

### Obrigatório

Valida se está vazio e mostra mensagem customizada.

Região `sgInputCnpjObrigatorio` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCNPJ(
        id: 'demo-required',
        labelText: 'CNPJ obrigatório',
        hintText: 'Obrigatório',
        required: true,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCNPJ(
        id: 'demo-required-custom',
        labelText: 'Mensagem customizada',
        hintText: 'Obrigatório',
        required: true,
        requiredMessage: 'Informe o CNPJ.',
      ),
    ),
  ],
)
```

### Mensagem de tamanho

Personaliza mensagem quando CNPJ não tem 14 dígitos.

Região `sgInputCnpjTamanho` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCNPJ(
    id: 'demo-length',
    labelText: 'CNPJ',
    hintText: '00.000.000/0000-00',
    lengthMessage: 'CNPJ deve ter 14 dígitos.',
  ),
)
```

### Mensagem inválida

Personaliza mensagem de CNPJ inválido.

Região `sgInputCnpjInvalida` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCNPJ(
    id: 'demo-invalid',
    labelText: 'CNPJ',
    hintText: '00.000.000/0000-00',
    invalidMessage: 'CNPJ inválido.',
  ),
)
```

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputCnpjValidacao` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCNPJ(
        id: 'demo-validation',
        labelText: 'CNPJ',
        hintText: '00.000.000/0000-00',
        validation: (v) => v.startsWith('00')
            ? 'CNPJ não pode iniciar com 00.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputCnpjVariacoes` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCNPJ(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: 'CNPJ',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCNPJ(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: 'CNPJ',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputCnpjSemLimpar` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCNPJ(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: 'CNPJ',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputCnpjLargura` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputCNPJ(
      id: 'demo-w200',
      labelText: '200px',
      hintText: 'CNPJ',
      width: 200,
    ),
    SgInputCNPJ(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: 'CNPJ',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado

enabled=false desabilita.

Região `sgInputCnpjDesabilitado` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCNPJ(
    id: 'demo-disabled',
    labelText: 'Desabilitado',
    hintText: 'CNPJ',
    enabled: false,
    initialValue: '00.000.000/0000-00',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputCnpjEventos` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCNPJ(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        hintText: 'CNPJ',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputCnpjRotulo` em `sg_input_cnpj_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputCNPJ(
        id: 'sg-input-cnpj-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputCNPJLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputCNPJ(
        id: 'sg-input-cnpj-label-top',
        labelText: 'Acima',
        labelPosition: SgInputCNPJLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputCNPJ(
        id: 'sg-input-cnpj-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputCNPJLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputCNPJLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputCPFCNPJ

Página: `apps/seedgrid_showcase/lib/pages/sg_input_cpfcnpj_page.dart` (13 exemplo(s) na página; abaixo 13).

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
        onChange: (v) => _basico.value = v,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _basico,
        builder: (context, valor, _) =>
            Text('Valor: $valor'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _basico = ValueNotifier('');`

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

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputCpfCnpjValidacao` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPFCNPJ(
        id: 'demo-validation',
        labelText: 'Documento',
        hintText: 'CPF ou CNPJ',
        validation: (v) => v.startsWith('00')
            ? 'Documento não pode iniciar com 00.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Exemplo CNPJ alfanumérico

Aceita letras (A-Z) no corpo do CNPJ.

Região `sgInputCpfCnpjAlfanumerico` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPFCNPJ(
    id: 'demo-alnum',
    labelText: 'CNPJ alfanumérico',
    hintText: '00.000.000/E08G-12',
    initialValue: '00.000.000/E08G-12',
  ),
)
```

### Exemplos válidos (alfanumérico)

Lista de CNPJs alfanuméricos válidos.

Região `sgInputCpfCnpjListaAlfanumerica` em `sg_input_cpfcnpj_page.snippets.g.dart`.

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

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputCpfCnpjVariacoes` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCPFCNPJ(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: 'Documento',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCPFCNPJ(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: 'Documento',
        filled: true,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputCpfCnpjSemLimpar` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPFCNPJ(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: 'Documento',
    clearButton: false,
  ),
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputCpfCnpjLargura` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputCPFCNPJ(
      id: 'demo-w200',
      labelText: '200px',
      hintText: 'Documento',
      width: 200,
    ),
    SgInputCPFCNPJ(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: 'Documento',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado

enabled=false desabilita.

Região `sgInputCpfCnpjDesabilitado` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCPFCNPJ(
    id: 'demo-disabled',
    labelText: 'Desabilitado',
    hintText: 'Documento',
    enabled: false,
    initialValue: '00.000.000/0000-00',
  ),
)
```

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputCpfCnpjEventos` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCPFCNPJ(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        hintText: 'Documento',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputCpfCnpjRotulo` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputCPFCNPJ(
        id: 'sg-input-cpf-cnpj-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputCPFCNPJLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputCPFCNPJ(
        id: 'sg-input-cpf-cnpj-label-top',
        labelText: 'Acima',
        labelPosition: SgInputCPFCNPJLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputCPFCNPJ(
        id: 'sg-input-cpf-cnpj-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputCPFCNPJLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputCPFCNPJLabelAlign.end,
      ),
    ),
  ],
)
```

### Consulta na base pública

Quando o documento é um CNPJ numérico válido, consulta publica.cnpj.ws para confirmar que ele existe.

Região `sgInputCpfCnpjConsulta` em `sg_input_cpfcnpj_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputCPFCNPJ(
        id: 'demo-publica',
        labelText: 'Documento',
        hintText: 'CPF ou CNPJ',
        validateWithPublicaCnpj: true,
        publicaCnpjErrorMessage: 'CNPJ não encontrado.',
        onPublicaCnpjResult: (data) {
          _publicaResultado.value = data;
          _publicaErro.value = null;
        },
        onPublicaCnpjError: (_) => _publicaErro.value = 
          'Falha ao consultar a API.',
        ,
      ),
    ),
    ListenableBuilder(
      listenable: Listenable.merge([
        _publicaResultado,
        _publicaErro,
      ]),
      builder: (context, _) {
        final resultado = _publicaResultado.value;
        final erro = _publicaErro.value;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (resultado != null) ...[
              const SizedBox(height: 8),
              Text('Resultado da consulta'),
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 240),
                child: SingleChildScrollView(
                  child: SelectableText(
                    const JsonEncoder.withIndent(
                      '  ',
                    ).convert(resultado),
                  ),
                ),
              ),
            ],
            if (erro != null) Text(erro),
          ],
        );
      },
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<Object?> _publicaResultado = ValueNotifier(null);`
- `final ValueNotifier<String?> _publicaErro = ValueNotifier(null);`

## SgInputPostalCode

Página: `apps/seedgrid_showcase/lib/pages/sg_input_postal_code_page.dart` (16 exemplo(s) na página; abaixo 16).

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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
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

### Controlado (setValue)

Use quando precisa do valor em tempo real e de setValue externos.

Região `sgInputPostalCodeControlado` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPostalCode(
        id: 'demo-controlled',
        labelText: 'CEP do cliente',
        hintText: '00000-000',
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
            label: Text('Setar via API'),
            onClick: () =>
                _form.setValue('controlled', '04538-132'),
          ),
          SgButton(
            appearance: SgAppearance.outline,
            label: Text('Outro valor'),
            onClick: () =>
                _form.setValue('controlled', '20040-020'),
          ),
          SgButton(
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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'cep': '', 'controlled': ''});`

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputPostalCodeValidacao` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPostalCode(
        id: 'demo-validation',
        labelText: 'CEP (Brasil)',
        hintText: '00000-000',
        validation: (v) => v.startsWith('00')
            ? 'CEP não pode iniciar com 00.'
            : null,
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Validação ViaCEP (somente BR)

Consulta ViaCEP para verificar se o CEP existe. Disponível apenas para country="BR".

Região `sgInputPostalCodeViacep` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-viacep',
        labelText: 'CEP (Brasil)',
        hintText: '00000-000',
        country: SgInputPostalCodeCountry.br,
        validateWithViaCep: true,
        viaCepErrorMessage: 'CEP inválido.',
        onViaCepResult: (data) => _viaCepResult.value = data,
      ),
    ),
    ValueListenableBuilder<SgViaCepResult?>(
      valueListenable: _viaCepResult,
      builder: (context, resultado, _) => resultado == null
          ? const SizedBox.shrink()
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text('Resultado ViaCEP'),
                SelectableText(
                  const JsonEncoder.withIndent('  ').convert({
                    'cep': resultado.cep,
                    'logradouro': resultado.logradouro,
                    'bairro': resultado.bairro,
                    'localidade': resultado.localidade,
                    'uf': resultado.uf,
                  }),
                ),
              ],
            ),
    ),
    const SizedBox(height: 8),
    Text(
      
        'Se a API estiver fora do ar, o componente não bloqueia o usuário.',
      ,
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<SgViaCepResult?> _viaCepResult = ValueNotifier(null);`

### Ícone de prefixo

Ícone posicionado à esquerda do input.

Região `sgInputPostalCodeIcone` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPostalCode(
    id: 'demo-prefix-icon',
    labelText: 'Buscar CEP',
    hintText: '00000-000',
    prefixIcon: const Icon(Icons.search, size: 16),
  ),
)
```

### Prefixo e sufixo

Prefixo/sufixo são apenas visuais.

Região `sgInputPostalCodeAfixos` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-prefix-text',
        labelText: 'Com prefixo',
        hintText: '00000-000',
        prefixText: 'CEP:',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-suffix-text',
        labelText: 'Com sufixo',
        hintText: '00000-000',
        suffixText: 'BR',
      ),
    ),
  ],
)
```

### Botões de ícone

iconButtons recebe uma lista de botões; cada botão tem o onClick que você definir.

Região `sgInputPostalCodeBotoes` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    children: [
      SgInputPostalCode(
        id: 'demo-iconbtns',
        labelText: 'Copiar CEP',
        hintText: '00000-000',
        iconButtons: [
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.copy),
            onClick: () => _iconLog.value = [
              'Copiado',
              ..._iconLog.value,
            ],
          ),
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.notifications_outlined),
            onClick: () => _iconLog.value = [
              'Alerta disparado!',
              ..._iconLog.value,
            ],
          ),
        ],
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _iconLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Clique nos ícones para testar...',
          height: 96,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<String>> _iconLog = ValueNotifier(const []);`

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputPostalCodeVariacoes` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        hintText: '00000-000',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-filled',
        labelText: 'Preenchido',
        hintText: '00000-000',
        filled: true,
      ),
    ),
  ],
)
```

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputPostalCodeLargura` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputPostalCode(
      id: 'demo-w200',
      labelText: '200px',
      hintText: '00000-000',
      width: 200,
    ),
    SgInputPostalCode(
      id: 'demo-w300',
      labelText: '300px arredondado',
      hintText: '00000-000',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

### Desabilitado e somente leitura

enabled=false desabilita, readOnly impede edição.

Região `sgInputPostalCodeEstados` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-disabled',
        labelText: 'Desabilitado',
        hintText: '00000-000',
        enabled: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputPostalCode(
        id: 'demo-readonly',
        labelText: 'Somente leitura',
        hintText: '00000-000',
        readOnly: true,
      ),
    ),
  ],
)
```

### Standalone (sem RHF)

Sem controlador de formulário: cada campo avisa o valor em onChange.

Região `sgInputPostalCodeStandalone` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPostalCode(
        id: 'standalone-a',
        labelText: 'CEP de entrega',
        hintText: '00000-000',
        onChange: (v) => _standalone['entrega'] = v,
      ),
      const SizedBox(height: 12),
      SgInputPostalCode(
        id: 'standalone-b',
        labelText: 'CEP de cobrança',
        hintText: '00000-000',
        onChange: (v) => _standalone['cobranca'] = v,
      ),
      const SizedBox(height: 12),
      SgInputPostalCode(
        id: 'standalone-c',
        labelText: 'CEP comercial',
        hintText: '00000-000',
        onChange: (v) => _standalone['comercial'] = v,
      ),
      const SizedBox(height: 12),
      SgButton(
        label: Text('Salvar'),
        onClick: () => _standaloneResult.value = jsonEncode({
          'entrega': _standalone['entrega'] ?? '',
          'cobranca': _standalone['cobranca'] ?? '',
          'comercial': _standalone['comercial'] ?? '',
        }),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _standaloneResult,
        builder: (context, resultado, _) => Text(
          'Resultado: ${resultado.isEmpty ? '-' : resultado}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final Map<String, String> _standalone = {};`
- `final ValueNotifier<String> _standaloneResult = ValueNotifier('');`

### Eventos

onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputPostalCodeEventos` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputPostalCode(
        id: 'demo-events',
        labelText: 'Com eventos',
        hintText: '00000-000',
        required: true,
        onChange: (v) => _log('onChange: "$v"'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputPostalCodeRotulo` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputPostalCode(
        id: 'sg-input-postal-code-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputPostalCodeLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputPostalCode(
        id: 'sg-input-postal-code-label-top',
        labelText: 'Acima',
        labelPosition: SgInputPostalCodeLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputPostalCode(
        id: 'sg-input-postal-code-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputPostalCodeLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputPostalCodeLabelAlign.end,
      ),
    ),
  ],
)
```

### Sem botão de limpar

clearButton=false remove o X do input.

Região `sgInputPostalCodeSemLimpar` em `sg_input_postal_code_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputPostalCode(
    id: 'demo-noclear',
    labelText: 'Sem limpar',
    hintText: '00000-000',
    clearButton: false,
  ),
)
```

## SgInputDate

Página: `apps/seedgrid_showcase/lib/pages/sg_input_date_page.dart` (5 exemplo(s) na página; abaixo 5).

### Básico

Digite ou abra o calendário; o valor entregue é a data ISO.

Região `sgInputDateBasico` em `sg_input_date_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDate(
      id: 'demo-basic',
      labelText: 'Data',
      hintText: 'Selecione uma data',
      onChange: (value) => _valor.value = value,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _valor,
      builder: (context, valor, _) =>
          Text('Valor: $valor'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _valor = ValueNotifier<String>('');`

### Limites de data

Fora do intervalo aparece a mensagem; no calendário os dias ficam desabilitados.

Região `sgInputDateLimites` em `sg_input_date_page.snippets.g.dart`.

```dart
SgInputDate(
  id: 'demo-range',
  labelText: 'Período',
  minDate: '2020-01-01',
  maxDate: '2030-12-31',
)
```

### Obrigatório

Valida campo vazio.

Região `sgInputDateObrigatorio` em `sg_input_date_page.snippets.g.dart`.

```dart
SgInputDate(
  id: 'demo-required',
  labelText: 'Data da consulta',
  required: true,
  requiredMessage: 'Escolha uma data',
)
```

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputDateRotulo` em `sg_input_date_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputDate(
        id: 'sg-input-date-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputDateLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputDate(
        id: 'sg-input-date-label-top',
        labelText: 'Acima',
        labelPosition: SgInputDateLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputDate(
        id: 'sg-input-date-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputDateLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputDateLabelAlign.end,
      ),
    ),
  ],
)
```

### Dentro de um formulário

O formulário guarda a data ISO.

Região `sgInputDateFormulario` em `sg_input_date_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDate(
      id: 'campo',
      name: 'campo',
      control: _form,
      labelText: 'Data',
      required: true,
      requiredMessage: 'Escolha uma data',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['campo']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text(
              'Enviado: $enviado',
            ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

## SgInputBirthDate

Página: `apps/seedgrid_showcase/lib/pages/sg_input_birth_date_page.dart` (5 exemplo(s) na página; abaixo 5).

### Básico

minAge: 18 limita a data máxima e valida a idade.

Região `sgInputBirthDateBasico` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputBirthDate(
      id: 'demo-basic',
      labelText: 'Data de nascimento',
      minAge: 18,
      onValidation: (msg) => _validacao.value = msg,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String?>(
      valueListenable: _validacao,
      builder: (context, msg, _) =>
          Text('onValidation: ${msg ?? 'válido'}'),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validacao = ValueNotifier<String?>(null);`

### Obrigatório

Valida campo vazio.

Região `sgInputBirthDateObrigatorio` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
SgInputBirthDate(
  id: 'demo-required',
  labelText: 'Data de nascimento',
  minAge: 18,
  required: true,
  requiredMessage: 'Informe a data de nascimento.',
)
```

### Faixa customizada

minAge e maxAge configuráveis.

Região `sgInputBirthDateFaixa` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
SgInputBirthDate(
  id: 'demo-range',
  labelText: 'Data de nascimento',
  minAge: 12,
  maxAge: 80,
)
```

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputBirthDateRotulo` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputBirthDate(
        id: 'sg-input-birth-date-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputBirthDateLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputBirthDate(
        id: 'sg-input-birth-date-label-top',
        labelText: 'Acima',
        labelPosition: SgInputBirthDateLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputBirthDate(
        id: 'sg-input-birth-date-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputBirthDateLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputBirthDateLabelAlign.end,
      ),
    ),
  ],
)
```

### Dentro de um formulário

O formulário guarda a data de nascimento.

Região `sgInputBirthDateFormulario` em `sg_input_birth_date_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputBirthDate(
      id: 'campo',
      name: 'campo',
      control: _form,
      labelText: 'Data de nascimento',
      minAge: 18,
      required: true,
      requiredMessage: 'Informe a data de nascimento.',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['campo']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text(
              'Enviado: $enviado',
            ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _enviado = ValueNotifier<String>('');`

## SgInputNumber

Página: `apps/seedgrid_showcase/lib/pages/sg_input_number_page.dart` (16 exemplo(s) na página; abaixo 16).

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
          (values) => _enviado.value = '${values['valor']}',
        ),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _enviado,
        builder: (context, enviado, _) =>
            Text('Valor: $enviado'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': ''});`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': ''});`

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputNumberValidacao` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputNumber(
        id: 'demo-validation',
        labelText: 'Apenas número par',
        decimals: 0,
        validation: (v) {
          return v != null && v % 2 == 0
              ? null
              : 'Use um número par.';
        },
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Ícone de prefixo

Ícone posicionado à esquerda do input.

Região `sgInputNumberIcone` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputNumber(
    id: 'demo-prefix-icon',
    labelText: 'Buscar valor',
    decimals: 2,
    prefixIcon: const Icon(Icons.search, size: 16),
  ),
)
```

### Prefixo e sufixo

Prefixo/sufixo são apenas visuais.

Região `sgInputNumberAfixos` em `sg_input_number_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-prefix-text',
        labelText: 'Preço',
        prefixText: r'R$',
        name: 'prefix',
        control: _form,
        decimals: 2,
      ),
    ),
    ListenableBuilder(
      listenable: _form,
      builder: (context, _) => Text(
        'Valor: ${_form.getValue('prefix') ?? ''}',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-suffix-text',
        labelText: 'Peso',
        suffixText: 'kg',
        name: 'suffix',
        control: _form,
        decimals: 2,
      ),
    ),
    ListenableBuilder(
      listenable: _form,
      builder: (context, _) => Text(
        'Valor: ${_form.getValue('suffix') ?? ''}',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-both',
        labelText: 'Valor total',
        prefixText: r'R$',
        suffixText: 'm',
        name: 'both',
        control: _form,
        decimals: 2,
      ),
    ),
    ListenableBuilder(
      listenable: _form,
      builder: (context, _) => Text(
        'Valor: ${_form.getValue('both') ?? ''}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': ''});`

### Botões de ícone

iconButtons recebe uma lista de widgets.

Região `sgInputNumberBotoes` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    children: [
      SgInputNumber(
        id: 'demo-iconbtns',
        labelText: 'Número para copiar',
        decimals: 2,
        iconButtons: [
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.copy),
            onClick: () => _iconLog.value = [
              'Copiado',
              ..._iconLog.value,
            ],
          ),
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.notifications_outlined),
            onClick: () => _iconLog.value = [
              'Alerta disparado!',
              ..._iconLog.value,
            ],
          ),
        ],
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _iconLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Digite algo e clique nos ícones...',
          height: 96,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<String>> _iconLog = ValueNotifier(const []);`

### Sem negativo

Bloqueia o sinal de menos.

Região `sgInputNumberSemNegativo` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputNumber(
    id: 'demo-no-negative',
    labelText: 'Apenas positivo',
    allowNegative: false,
    decimals: 2,
  ),
)
```

### Sem decimais

decimals=0 (apenas inteiro com separador de milhar).

Região `sgInputNumberSemDecimais` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputNumber(
    id: 'demo-no-decimals',
    labelText: 'Quantidade',
    decimals: 0,
  ),
)
```

### Min/Max

Valida intervalo numérico.

Região `sgInputNumberMinmax` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputNumber(
    id: 'demo-minmax',
    labelText: 'Entre 10 e 100',
    minValue: 10,
    maxValue: 100,
    decimals: 2,
  ),
)
```

### Valor vazio

emptyValueIsNull permite limpar totalmente (o valor passa a ser null em vez de 0).

Região `sgInputNumberVazio` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputNumber(
    id: 'demo-empty',
    labelText: 'Pode ficar vazio',
    emptyValueIsNull: true,
    decimals: 2,
  ),
)
```

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputNumberVariacoes` em `sg_input_number_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-noborder',
        labelText: 'Sem borda',
        withBorder: false,
        decimals: 2,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputNumber(
        id: 'demo-filled',
        labelText: 'Preenchido',
        filled: true,
        decimals: 2,
      ),
    ),
  ],
)
```

### Standalone (form completo)

Exemplo 100% standalone com default no load e botão salvar.

Região `sgInputNumberStandalone` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputNumber(
        id: 'standalone-a',
        labelText: 'Entrada 1',
        decimals: 2,
        onChange: (v) => _standalone['a'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgInputNumber(
        id: 'standalone-b',
        labelText: 'Entrada 2',
        decimals: 2,
        onChange: (v) => _standalone['b'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgInputNumber(
        id: 'standalone-c',
        labelText: 'Entrada 3',
        decimals: 2,
        onChange: (v) => _standalone['c'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgButton(
        size: SgSize.sm,
        appearance: SgAppearance.outline,
        label: Text('Salvar'),
        onClick: () => _standaloneResult.value = jsonEncode({
          'a': _standalone['a'] ?? '',
          'b': _standalone['b'] ?? '',
          'c': _standalone['c'] ?? '',
        }),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _standaloneResult,
        builder: (context, resultado, _) => Text(
          'Resultado: ${resultado.isEmpty ? '-' : resultado}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final Map<String, String> _standalone = {};`
- `final ValueNotifier<String> _standaloneResult = ValueNotifier('');`

### Eventos

Exemplo sem formulário com onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputNumberEventos` em `sg_input_number_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputNumber(
        id: 'demo-events',
        labelText: 'Digite e observe o log',
        required: true,
        decimals: 2,
        onChange: (v) => _log('onChange: $v'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputNumberLargura` em `sg_input_number_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputNumber(
      id: 'demo-w200',
      labelText: '200px',
      width: 200,
      decimals: 2,
    ),
    SgInputNumber(
      id: 'demo-w300',
      labelText: '300px arredondado',
      width: 300,
      borderRadius: 20,
      decimals: 2,
    ),
  ],
)
```

### Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputNumberRotulo` em `sg_input_number_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputNumber(
        id: 'sg-input-number-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputNumberLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputNumber(
        id: 'sg-input-number-label-top',
        labelText: 'Acima',
        labelPosition: SgInputNumberLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputNumber(
        id: 'sg-input-number-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputNumberLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputNumberLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputCurrency

Página: `apps/seedgrid_showcase/lib/pages/sg_input_currency_page.dart` (15 exemplo(s) na página; abaixo 15).

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
          (values) => _enviado.value = '${values['valor']}',
        ),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _enviado,
        builder: (context, enviado, _) =>
            Text('Valor: $enviado'),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': ''});`
- `final ValueNotifier<String> _enviado = ValueNotifier('');`

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

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController(defaultValues: {'valor': '', 'controlled': '', 'prefix': '', 'suffix': '', 'both': ''});`

### Validação customizada

Função de validação retorna mensagem ou null.

Região `sgInputCurrencyValidacao` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCurrency(
        id: 'demo-validation',
        labelText: 'Valor mínimo (>= 1000)',
        currency: 'BRL',
        validation: (v) {
          return v != null && v >= 1000
              ? null
              : 'Valor deve ser ≥ 1000.';
        },
        onValidation: (msg) => _validationMsg.value = msg,
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String?>(
        valueListenable: _validationMsg,
        builder: (context, msg, _) => Text(
          'onValidation: ${msg == null ? 'válido' : '"$msg"'}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String?> _validationMsg = ValueNotifier(null);`

### Moeda e locale

O display muda conforme currency + locale.

Região `sgInputCurrencyMoeda` em `sg_input_currency_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-brl',
        labelText: 'Preço (BRL)',
        currency: 'BRL',
        locale: 'pt-BR',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-usd',
        labelText: 'Price (USD)',
        currency: 'USD',
        locale: 'en-US',
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-eur',
        labelText: 'Preço (EUR)',
        currency: 'EUR',
        locale: 'pt-PT',
      ),
    ),
  ],
)
```

### Símbolo e posicionamento

Mostre/oculte símbolo e altere o posicionamento.

Região `sgInputCurrencySimbolo` em `sg_input_currency_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-no-symbol',
        labelText: 'Sem símbolo',
        currency: 'BRL',
        showCurrencySymbol: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-code',
        labelText: 'USD no sufixo',
        currency: 'USD',
        currencyDisplay: SgInputCurrencyCurrencyDisplay.code,
        currencySymbolPlacement:
            SgInputCurrencyCurrencySymbolPlacement.suffix,
      ),
    ),
  ],
)
```

### Botões de ícone

iconButtons recebe uma lista de widgets.

Região `sgInputCurrencyBotoes` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    children: [
      SgInputCurrency(
        id: 'demo-iconbtns',
        currency: 'BRL',
        labelText: 'Valor para copiar',
        iconButtons: [
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.copy),
            onClick: () => _iconLog.value = [
              'Copiado',
              ..._iconLog.value,
            ],
          ),
          SgButton(
            iconOnly: true,
            size: SgSize.sm,
            appearance: SgAppearance.outline,
            leftIcon: const Icon(Icons.notifications_outlined),
            onClick: () => _iconLog.value = [
              'Alerta disparado!',
              ..._iconLog.value,
            ],
          ),
        ],
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _iconLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Digite algo e clique nos ícones...',
          height: 96,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<List<String>> _iconLog = ValueNotifier(const []);`

### Sem negativo

Bloqueia o sinal de menos.

Região `sgInputCurrencySemNegativo` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCurrency(
    id: 'demo-no-negative',
    currency: 'BRL',
    labelText: 'Apenas positivo',
    allowNegative: false,
  ),
)
```

### Sem decimais

decimals=0 (apenas inteiro com separador de milhar).

Região `sgInputCurrencySemDecimais` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCurrency(
    id: 'demo-no-decimals',
    currency: 'BRL',
    labelText: 'Quantidade',
    decimals: 0,
  ),
)
```

### Min/Max

Valida intervalo numérico.

Região `sgInputCurrencyMinmax` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCurrency(
    id: 'demo-minmax',
    currency: 'BRL',
    labelText: 'Entre 10 e 100',
    minValue: 10,
    maxValue: 100,
  ),
)
```

### Valor vazio

emptyValueIsNull permite limpar totalmente (o valor passa a ser null em vez de 0).

Região `sgInputCurrencyVazio` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: SgInputCurrency(
    id: 'demo-empty',
    currency: 'BRL',
    labelText: 'Pode ficar vazio',
    emptyValueIsNull: true,
  ),
)
```

### Variações visuais

Sem borda (withBorder=false) e preenchido (filled=true).

Região `sgInputCurrencyVariacoes` em `sg_input_currency_page.snippets.g.dart`.

```dart
Column(
  children: [
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-noborder',
        currency: 'BRL',
        labelText: 'Sem borda',
        withBorder: false,
      ),
    ),
    const SizedBox(height: 12),
    SizedBox(
      width: 320,
      child: SgInputCurrency(
        id: 'demo-filled',
        currency: 'BRL',
        labelText: 'Preenchido',
        filled: true,
      ),
    ),
  ],
)
```

### Standalone (form completo)

Exemplo 100% standalone com default no load e botão salvar.

Região `sgInputCurrencyStandalone` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 384,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCurrency(
        id: 'standalone-a',
        currency: 'BRL',
        labelText: 'Entrada 1',
        onChange: (v) => _standalone['a'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgInputCurrency(
        id: 'standalone-b',
        currency: 'BRL',
        labelText: 'Entrada 2',
        onChange: (v) => _standalone['b'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgInputCurrency(
        id: 'standalone-c',
        currency: 'BRL',
        labelText: 'Entrada 3',
        onChange: (v) => _standalone['c'] = '${v ?? ''}',
      ),
      const SizedBox(height: 12),
      SgButton(
        size: SgSize.sm,
        appearance: SgAppearance.outline,
        label: Text('Salvar'),
        onClick: () => _standaloneResult.value = jsonEncode({
          'a': _standalone['a'] ?? '',
          'b': _standalone['b'] ?? '',
          'c': _standalone['c'] ?? '',
        }),
      ),
      const SizedBox(height: 8),
      ValueListenableBuilder<String>(
        valueListenable: _standaloneResult,
        builder: (context, resultado, _) => Text(
          'Resultado: ${resultado.isEmpty ? '-' : resultado}',
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final Map<String, String> _standalone = {};`
- `final ValueNotifier<String> _standaloneResult = ValueNotifier('');`

### Eventos

Exemplo sem formulário com onEnter, onExit, onChange, onClear, onValidation.

Região `sgInputCurrencyEventos` em `sg_input_currency_page.snippets.g.dart`.

```dart
SizedBox(
  width: 320,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputCurrency(
        id: 'demo-events',
        currency: 'BRL',
        labelText: 'Digite e observe o log',
        required: true,
        onChange: (v) => _log('onChange: $v'),
        onEnter: () => _log('onEnter (focus)'),
        onExit: () => _log('onExit (blur)'),
        onClear: () => _log('onClear'),
        onValidation: (msg) =>
            _log('onValidation: ${msg ?? 'válido'}'),
      ),
      const SizedBox(height: 12),
      ValueListenableBuilder<List<String>>(
        valueListenable: _eventLog,
        builder: (context, entries, _) => ShowcaseLogBox(
          entries: entries,
          hint: 'Interaja com o input...',
          height: 160,
        ),
      ),
    ],
  ),
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `void _log(String entry) => _eventLog.value = [entry, ..._eventLog.value];`
- `final ValueNotifier<List<String>> _eventLog = ValueNotifier(const []);`

### Largura e borda

width e borderRadius customizáveis.

Região `sgInputCurrencyLargura` em `sg_input_currency_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SgInputCurrency(
      id: 'demo-w200',
      currency: 'BRL',
      labelText: '200px',
      width: 200,
    ),
    SgInputCurrency(
      id: 'demo-w300',
      currency: 'BRL',
      labelText: '300px arredondado',
      width: 300,
      borderRadius: 20,
    ),
  ],
)
```

## CRUD com valores da API (número, moeda e data/hora)

Exemplo da KB (não é do showcase: o do showcase é da sessão `front` e ainda não existe). Ciclo carregar da API, editar e salvar com `SgFormController` (`name` + `control`). O código **passa no `flutter analyze`** contra o `seedgrid_components` local (2026-11-12, `19f7830`); **não foi executado**.

- **Carregar:** `_form.reset(registro)` entrega os valores ao formulário e vira o novo valor inicial (`isDirty` volta a `false`). Número aceita número ou texto (`12.5` ou `"12,5"`); `SgInputDateTime` aceita `local`, `utc` ou `offset`. Atribua **número** nos campos numéricos: o formulário guarda o que foi atribuído e só a edição grava número. `initialValue` do número/moeda em formulário entra como texto (`'${initialValue}'`); para CRUD use `reset`.
- **Editar:** `quantidade` e `preco` voltam como `double` (`preco` é `null` com `emptyValueIsNull` e campo vazio); `entregaEm` volta como `Instant` em UTC (`2026-01-15T13:30:00Z`, `valueMode: SgInputDateTimeValueMode.utc` com `timeZone: 'America/Sao_Paulo'`, o usuário vê 10:30).
- **`validation` recebe `num?`:** em `quantidade` (vazio chega como `0`) e em `preco` (vazio chega como `null`, serve de "obrigatório").
- **Salvar:** `handleSubmit` valida todos os campos (os validadores do componente rodam no submit) e entrega o `Map` com os tipos certos. No Java, `entregaEm` lê com `Instant.parse(...)`.
- **Sem `setState`:** o `State` só cria e descarta o controlador; a tela reage por `ListenableBuilder`.

```dart
import 'package:flutter/material.dart';
import 'package:seedgrid_components/seedgrid_components.dart';

class PedidoPage extends StatefulWidget {
  const PedidoPage({super.key});

  @override
  State<PedidoPage> createState() => _PedidoPageState();
}

class _PedidoPageState extends State<PedidoPage> {
  final SgFormController _form = SgFormController();

  // API simulada (troque por http): o JSON traz número como número e a data/hora como Instant em UTC.
  Future<Map<String, Object?>> _carregarPedido() async => {
    'descricao': 'Cadeira de escritório',
    'quantidade': 12.5,
    'preco': 1234.56,
    'entregaEm': '2026-01-15T13:30:00Z',
  };

  Future<void> _salvarPedido(Map<String, Object?> pedido) async {
    debugPrint('PUT /pedidos/1 $pedido');
  }

  // Carregar: reset(registro) vira o novo valor inicial; número ou texto ("12,5") e a data/hora em qualquer formato.
  Future<void> _carregar() async {
    final pedido = await _carregarPedido();
    if (!mounted) return;
    _form.reset(pedido);
  }

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _form.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 360,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgInputText(
            id: 'crud-descricao',
            labelText: 'Descrição',
            name: 'descricao',
            control: _form,
            required: true,
          ),
          const SizedBox(height: 12),
          SgInputNumber(
            id: 'crud-quantidade',
            labelText: 'Quantidade',
            name: 'quantidade',
            control: _form,
            decimals: 1,
            validation: (value) => value != null && value > 0
                ? null
                : 'A quantidade deve ser maior que zero',
          ),
          const SizedBox(height: 12),
          SgInputCurrency(
            id: 'crud-preco',
            labelText: 'Preço',
            name: 'preco',
            control: _form,
            currency: 'BRL',
            emptyValueIsNull: true,
            validation: (value) => value == null ? 'Informe o preço' : null,
          ),
          const SizedBox(height: 12),
          SgInputDateTime(
            id: 'crud-entrega',
            labelText: 'Entrega',
            name: 'entregaEm',
            control: _form,
            timeZone: 'America/Sao_Paulo',
            valueMode: SgInputDateTimeValueMode.utc,
            required: true,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('Salvar'),
                onClick: () => _form.handleSubmit((values) async {
                  await _salvarPedido(values);
                  _form.reset(values);
                }),
              ),
              const SizedBox(width: 8),
              SgButton(
                size: SgSize.sm,
                appearance: SgAppearance.outline,
                label: const Text('Recarregar'),
                onClick: _carregar,
              ),
            ],
          ),
          const SizedBox(height: 8),
          ListenableBuilder(
            listenable: _form,
            builder: (context, _) => Text(
              'Alterado: ${_form.isDirty ? 'sim' : 'não'}\n${_form.getValues()}',
            ),
          ),
        ],
      ),
    );
  }
}
```

Equivalente em React: [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos#CRUD com valores da API (número, moeda e data/hora)|CRUD no React]]. Props: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API#SgInputNumber|SgInputNumber]], [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API#SgInputCurrency|SgInputCurrency]] e [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API#SgInputDateTime|SgInputDateTime]].

## SgInputOTP

Página: `apps/seedgrid_showcase/lib/pages/sg_input_otp_page.dart` (7 exemplo(s) na página; abaixo 7).

### Básico

Seis dígitos. Digitar avança, Backspace volta, setas movem, e colar o código inteiro distribui nos campos.

Região `sgInputOtpBasico` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-basic',
      label: 'Código OTP',
      hintText: 'Digite os 6 dígitos',
      onChange: (value) => _mascara1.value = value,
      onRawChange: (value) => _bruto1.value = value,
    ),
    const SizedBox(height: 12),
    ListenableBuilder(
      listenable: Listenable.merge([_mascara1, _bruto1]),
      builder: (context, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'masked: ${_mascara1.value.isEmpty ? '(vazio)' : _mascara1.value}',
          ),
          Text(
            'raw: ${_bruto1.value.isEmpty ? '(vazio)' : _bruto1.value}',
          ),
        ],
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _mascara1 = ValueNotifier<String>('');`
- `final ValueNotifier<String> _bruto1 = ValueNotifier<String>('');`

### Máscara customizada

9 = dígito, # = letra ou dígito, qualquer outro caractere é separador. onChange recebe o valor com separador e onRawChange, sem.

Região `sgInputOtpMascara` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-mask',
      label: 'Token de acesso',
      hintText: 'Formato: ###-###-99',
      mask: '###-###-99',
      onChange: (value) => _mascara2.value = value,
      onRawChange: (value) => _bruto2.value = value,
    ),
    const SizedBox(height: 12),
    ListenableBuilder(
      listenable: Listenable.merge([_mascara2, _bruto2]),
      builder: (context, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'masked: ${_mascara2.value.isEmpty ? '(vazio)' : _mascara2.value}',
          ),
          Text(
            'raw: ${_bruto2.value.isEmpty ? '(vazio)' : _bruto2.value}',
          ),
        ],
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _mascara2 = ValueNotifier<String>('');`
- `final ValueNotifier<String> _bruto2 = ValueNotifier<String>('');`

### Colagem + onComplete

Cole um OTP e receba callback ao completar.

Região `sgInputOtpColagem` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-paste',
      label: 'Cole o código',
      hintText: 'Teste colando: "AB1-CD2-34"',
      mask: '###-###-99',
      onChange: (value) => _mascara3.value = value,
      onRawChange: (value) => _bruto3.value = value,
      onComplete: (value) => _completo.value = value,
    ),
    const SizedBox(height: 12),
    ListenableBuilder(
      listenable: Listenable.merge([_mascara3, _bruto3, _completo]),
      builder: (context, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'masked: ${_mascara3.value.isEmpty ? '(vazio)' : _mascara3.value}',
          ),
          Text(
            'raw: ${_bruto3.value.isEmpty ? '(vazio)' : _bruto3.value}',
          ),
          Text(
            'onComplete: ${_completo.value.isEmpty ? '(aguardando)' : _completo.value}',
          ),
        ],
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final ValueNotifier<String> _mascara3 = ValueNotifier<String>('');`
- `final ValueNotifier<String> _bruto3 = ValueNotifier<String>('');`
- `final ValueNotifier<String> _completo = ValueNotifier<String>('');`

### Acesso por ref ou controller

O SgInputOTPController faz o papel do ref do React: focus, clear, getRawValue e getMaskedValue.

Região `sgInputOtpController` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-ref',
      label: 'OTP por controle',
      hintText: 'Use os botões abaixo',
      mask: '###-###-99',
      controller: _controller,
    ),
    const SizedBox(height: 12),
    Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        SgButton(
          label: Text('Focar'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          onClick: _controller.focus,
        ),
        SgButton(
          label: Text('Limpar'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          onClick: _controller.clear,
        ),
        SgButton(
          label: Text('Ler conteúdo'),
          size: SgSize.sm,
          appearance: SgAppearance.outline,
          onClick: () {
            final masked = _controller.getMaskedValue();
            final raw = _controller.getRawValue();
            _leitura.value =
                'masked="${masked.isEmpty ? '(vazio)' : masked}" | raw="${raw.isEmpty ? '(vazio)' : raw}"';
          },
        ),
      ],
    ),
    const SizedBox(height: 12),
    ValueListenableBuilder<String?>(
      valueListenable: _leitura,
      builder: (context, leitura, _) => Text(
        'saída: ${leitura ?? 'Clique em "Ler conteúdo".'}',
      ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgInputOTPController _controller = SgInputOTPController();`
- `final ValueNotifier<String?> _leitura = ValueNotifier<String?>(null);`

### Validação

Obrigatório e validação própria (recebe o valor sem e com separador). A mensagem aparece ao sair do campo.

Região `sgInputOtpValidacao` em `sg_input_otp_page.snippets.g.dart`.

```dart
SgInputOTP(
  id: 'otp-validation',
  label: 'Código de convite',
  mask: '99-99',
  required: true,
  requiredMessage: 'Informe o código.',
  validation: (raw, masked) => raw.length < 4
      ? 'O código tem 4 dígitos.'
      : null,
)
```

### Dentro de um formulário

O formulário guarda o valor sem separador.

Região `sgInputOtpFormulario` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-form',
      name: 'codigo',
      control: _form,
      label: 'Código',
      mask: '9999',
      required: true,
      requiredMessage: 'Informe o código.',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Confirmar'),
      onClick: () => _form.handleSubmit(
        (values) => _confirmado.value = '${values['codigo']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _confirmado,
      builder: (context, confirmado, _) => confirmado.isEmpty
          ? const SizedBox.shrink()
          : Text(
              context.txf('Confirmado: {valor}', {
                'valor': confirmado,
              }),
            ),
    ),
  ],
)
```

Nota: este trecho usa membros definidos fora dele na página do showcase (estado em `ValueNotifier`/`SgFormController`, lido por `ValueListenableBuilder`/`ListenableBuilder`); para copiar, declare no seu widget:
- `final SgFormController _form = SgFormController();`
- `final ValueNotifier<String> _confirmado = ValueNotifier<String>('');`

### Estados

Erro externo, desabilitado e somente leitura.

Região `sgInputOtpEstados` em `sg_input_otp_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputOTP(
      id: 'otp-error',
      label: 'Com erro',
      mask: '9999',
      defaultValue: '1234',
      error: 'Código expirado.',
    ),
    const SizedBox(height: 16),
    SgInputOTP(
      id: 'otp-disabled',
      label: 'Desabilitado',
      mask: '9999',
      defaultValue: '12',
      enabled: false,
    ),
    const SizedBox(height: 16),
    SgInputOTP(
      id: 'otp-readonly',
      label: 'Somente leitura',
      mask: '9999',
      defaultValue: '9876',
      readOnly: true,
    ),
  ],
)
```

