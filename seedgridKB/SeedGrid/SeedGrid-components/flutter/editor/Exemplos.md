---
description: "Exemplos Dart de Editor de texto rico em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, editor, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Editor de texto rico (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/editor/Exemplos|Exemplos — Editor de texto rico (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/editor/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgTextEditor

Página: `apps/seedgrid_showcase/lib/pages/sg_text_editor_page.dart` (5 exemplo(s) na página; abaixo 3).

### Básico

Barra de ferramentas completa; onChangeHtml recebe o HTML do corpo a cada edição.

Região `sgTextEditorBasico` em `sg_text_editor_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgTextEditor(
      id: 'editor-basico',
      height: 220,
      placeholder: 'Escreva aqui',
      defaultValueHtml: '<p>Texto <strong>inicial</strong></p>',
      onChangeHtml: (html) => setState(() => _html = html),
    ),
    const SizedBox(height: 8),
    Text('HTML: $_html'),
  ],
)
```

Ajuste: `_html` é um campo `String` do `State` da página e `setState` exige um `StatefulWidget`.

### Valor controlado

valueHtml troca o conteúdo; mudar o valor por fora não dispara onChangeHtml.

Região `sgTextEditorControlado` em `sg_text_editor_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgTextEditor(
      id: 'editor-controlado',
      height: 180,
      valueHtml: _valor,
      onChangeHtml: (html) => setState(() => _valor = html),
    ),
    const SizedBox(height: 8),
    SgButton(
      label: Text('Trocar o conteúdo'),
      severity: SgSeverity.secondary,
      onClick: () => setState(
        () =>
            _valor = '<h2>Título</h2><ul><li><p>Item</p></li></ul>',
      ),
    ),
  ],
)
```

Ajuste: `_valor` é um campo `String` do `State` da página (valor inicial qualquer HTML); `setState` exige que o trecho esteja dentro de um `StatefulWidget`.

### Desabilitado, erro e cantos

Região `sgTextEditorEstados` em `sg_text_editor_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgTextEditor(
      id: 'editor-desabilitado',
      height: 120,
      disabled: true,
      defaultValueHtml: '<p>Somente leitura</p>',
    ),
    SizedBox(height: 16),
    SgTextEditor(
      id: 'editor-erro',
      height: 120,
      borderRadius: 20,
      error: 'Conteúdo obrigatório',
    ),
  ],
)
```

