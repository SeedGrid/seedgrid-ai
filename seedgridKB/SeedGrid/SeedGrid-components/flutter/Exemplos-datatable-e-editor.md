---
description: "Flutter (nota anterior, commit 314cb5a): exemplos Flutter de Tabela de dados e editor copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (um ou dois por componente), com a página de origem; o conjunto completo está no showcase."
tags: [seedgrid, front, component, flutter, dart, exemplos, plataforma-flutter]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Exemplos Flutter: Tabela de dados e editor

> **Plataforma: Flutter.** Nota anterior, por tema, mantida como estava no commit `314cb5a` (não foi revista contra o commit `e9989b8`). Os exemplos **atuais e completos por grupo** estão em: [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos|Tabela de dados]] · [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos|Editor]].

> **Status: NÃO PUBLICADO.** Trechos extraídos por script das constantes `*PageSnippets` (geradas por `tools/showcase_snippets/extract.mjs` a partir do trecho entre `// #region` e `// #endregion` de cada página), ou seja, o mesmo código que o showcase renderiza. Nada foi reescrito. Eles **não foram compilados nem executados** para esta nota; quem garante que compilam é o `flutter test` do repositório (`test/all_pages_test.dart`). Todos supõem `import 'package:seedgrid_components/seedgrid_components.dart';`. Mapa dos widgets: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]].

## SgDatatable

Fonte: `apps/seedgrid_showcase/lib/pages/sg_datatable_page.dart` (8 exemplo(s) na página; abaixo 2).

### Básico

Região `sgDatatableBasico` em `sg_datatable_page.snippets.g.dart`.

```dart
SgDatatable(
  title: 'Pessoas',
  value: _pessoas.take(6).toList(),
  columns: _colunas,
  stripedRows: true,
  showGridlines: true,
)
```

### Carga sob demanda (lazy)

Região `sgDatatableLazy` em `sg_datatable_page.snippets.g.dart`.

```dart
SgDatatable(
  value: _paginaLazy,
  columns: _colunas,
  lazy: true,
  paginator: true,
  rows: 5,
  first: _first,
  totalRecords: _pessoas.length,
  onPage: _carregar,
)
```

## SgTextEditor

Fonte: `apps/seedgrid_showcase/lib/pages/sg_text_editor_page.dart` (5 exemplo(s) na página; abaixo 2).

### Básico

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
