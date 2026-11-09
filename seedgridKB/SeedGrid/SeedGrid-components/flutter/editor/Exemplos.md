---
description: "Exemplos Dart de Editor de texto rico em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, editor, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Editor de texto rico (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/editor/Exemplos|Exemplos — Editor de texto rico (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/editor/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgTextEditor

Página: `apps/seedgrid_showcase/lib/pages/sg_text_editor_page.dart` (8 exemplo(s) na página; abaixo 3).

### Básico

Exemplo com CSS embutido e download do HTML.

Região `sgTextEditorBasico` em `sg_text_editor_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  align: SgStackAlign.start,
  children: [
    ListenableBuilder(
      listenable: Listenable.merge([_html, _css]),
      builder: (context, _) => SgTextEditor(
        id: 'sg-text-editor',
        height: 220,
        valueHtml: _html.value,
        onChangeHtml: (html) => _html.value = html,
        cssText: _css.value,
        onCssTextChange: (css) => _css.value = css,
        showCssEditor: true,
        onSave: (file, meta) =>
            _baixado.value = '${file.name}: ${file.bytes.length} bytes',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _baixado,
      builder: (context, v, _) =>
          v.isEmpty ? const SizedBox.shrink() : Text(v),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_baixado`: `ValueNotifier<String>`, valor inicial `''`; `_css`: `ValueNotifier<String>`, valor inicial `'body { font-family: Arial; }'`; `_html`: `ValueNotifier<String>`, valor inicial `'<p><strong>SeedGrid</strong> editor</p>'`. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Valor controlado

valueHtml troca o conteúdo; mudar o valor por fora não dispara onChangeHtml.

Região `sgTextEditorControlado` em `sg_text_editor_page.snippets.g.dart`.

```dart
SgStack(
  gap: 8,
  align: SgStackAlign.start,
  children: [
    ValueListenableBuilder<String>(
      valueListenable: _valor,
      builder: (context, v, _) => SgTextEditor(
        id: 'sg-text-editor-controlled',
        height: 180,
        valueHtml: v,
        onChangeHtml: (html) => _valor.value = html,
      ),
    ),
    SgButton(
      label: Text('Trocar o conteúdo'),
      appearance: SgAppearance.outline,
      onClick: () => _valor.value =
          '<h2>Título</h2><ul><li><p>Item</p></li></ul>',
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_valor`: `ValueNotifier<String>`, valor inicial um HTML qualquer. Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Desabilitado, erro e cantos

Região `sgTextEditorEstados` em `sg_text_editor_page.snippets.g.dart`.

```dart
const Column(
  children: [
    SgTextEditor(
      id: 'editor-desabilitado',
      height: 120,
      enabled: false,
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

