---
description: "Exemplos Dart de Tabela de dados em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, datatable, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Tabela de dados (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/datatable/Exemplos|Exemplos — Tabela de dados (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/datatable/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que dependem de campos do estado local da página (por exemplo `ValueNotifier`) trazem um "Ajuste" logo abaixo; nenhum usa `setState` de página (ADR 63). Em geral 3 exemplos por componente (mais os exemplos novos de cada componente, quando a seção os traz); o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgDatatable

Página: `apps/seedgrid_showcase/lib/pages/sg_datatable_page.dart` (13 exemplo(s) na página; abaixo 3).

### Básico com paginação e sort

infiniteScroll={false} mantém o paginador também em tela estreita: abaixo de 600 px o padrão viraria cartões com rolagem infinita.

Região `sgDatatableBasico` em `sg_datatable_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgDatatable(
      id: 'datatable-basic',
      title: 'Pessoas',
      value: _pessoas,
      columns: _colunas,
      dataKey: 'id',
      paginator: true,
      infiniteScroll: false,
      rows: 5,
      rowsPerPageOptions: const [5, 10],
      stripedRows: true,
      showGridlines: true,
      onPage: (e) => _pagina.value =
          'página ${e.page} de ${e.pageCount} (first ${e.first})',
    ),
    ValueListenableBuilder<String>(
      valueListenable: _pagina,
      builder: (context, evento, _) =>
          Text('${'Último onPage'}: $evento'),
    ),
  ],
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_colunas`: `List<SgDatatableColumn>` (constante do arquivo da página); `_pagina`: `ValueNotifier<String>`, valor inicial `'nenhum evento ainda'`; `_pessoas`: `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario` (constante do arquivo da página). Declare-os no seu widget. Quem guarda o valor é o `ValueNotifier` e o `ValueListenableBuilder` do próprio trecho reconstrói só o que depende dele: nada de `setState` de página (ADR 63).

### Filtro global + filtros por coluna

showGlobalFilter, showColumnFilters, filterMatchMode por coluna e showClearFiltersButton.

Região `sgDatatableFiltros` em `sg_datatable_page.snippets.g.dart`.

```dart
SgDatatable(
  value: _pessoas,
  columns: [
    SgDatatableColumn(
      field: 'nome',
      header: 'Nome',
      filter: true,
    ),
    SgDatatableColumn(
      field: 'cidade',
      header: 'Cidade',
      filter: true,
      filterMatchMode: SgDatatableFilterMatchMode.startsWith,
    ),
    SgDatatableColumn(
      field: 'salario',
      header: 'Salário',
      excludeGlobalFilter: true,
    ),
  ],
  paginator: true,
  infiniteScroll: false,
  rows: 5,
  showGlobalFilter: true,
  showColumnFilters: true,
  showClearFiltersButton: true,
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_pessoas`: `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario` (constante do arquivo da página). Declare-os no seu widget.

### Template customizado e footer

body desenha a célula e footer recebe as linhas processadas.

Região `sgDatatableColunas` em `sg_datatable_page.snippets.g.dart`.

```dart
SgDatatable(
  id: 'pessoas-colunas',
  value: _pessoas.take(8).toList(),
  columns: [
    SgDatatableColumn(
      field: 'nome',
      header: 'Nome',
      footer: 'Total',
    ),
    SgDatatableColumn(
      field: 'salario',
      header: 'Salário',
      sortable: true,
      align: SgDatatableColumnAlign.right,
      body: (row, meta) =>
          Text('R\$ ${(row['salario'] as num).toStringAsFixed(2)}'),
      footer: (List<SgDatatableRow> rows) =>
          'R\$ ${rows.fold<num>(0, (a, r) => a + (r['salario'] as num)).toStringAsFixed(2)}',
    ),
    SgDatatableColumn(
      field: 'cidade',
      header: 'Cidade',
    ),
  ],
  showColumnManager: false,
)
```

Ajuste: o trecho usa membros que não vêm nele, do estado local da página do showcase (não da biblioteca): `_pessoas`: `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario` (constante do arquivo da página). Declare-os no seu widget.

