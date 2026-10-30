---
description: "Exemplos Dart de Tabela de dados em Flutter, copiados 1:1 das regiões do showcase do seedgrid-fe-flutter (até 3 por componente) com a página de origem."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, datatable, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Tabela de dados (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/datatable/Exemplos|Exemplos — Tabela de dados (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/datatable/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral|Visão geral (Flutter)]].

> **Origem e validação.** Cada trecho é o conteúdo da região `// #region`…`// #endregion` da página do showcase (constantes `*PageSnippets`, geradas por `tools/showcase_snippets/extract.mjs`), ou seja, o código que o showcase renderiza; quem garante que compila é o `flutter test` do repositório (`test/all_pages_test.dart`), **que não executei para esta nota**. Única alteração: `context.tx('texto')` (i18n do showcase, não faz parte da biblioteca) virou o literal `'texto'`. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';` e vão dentro de um `build`/`Scaffold`; trechos que usam `setState` ou variáveis de estado da página dizem isso na própria linha de origem. Até 3 exemplos por componente; o conjunto completo está no showcase (`apps/seedgrid_showcase`).

## SgDatatable

Página: `apps/seedgrid_showcase/lib/pages/sg_datatable_page.dart` (10 exemplo(s) na página; abaixo 3).

### Básico

value (as linhas) e columns (field, header, align, width). Sem paginator, todas as linhas aparecem.

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

Ajuste: `_pessoas` (uma `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario`) e `_colunas` (uma `List<SgDatatableColumn>`) são constantes do arquivo da página do showcase, não da biblioteca; substitua pelos seus dados e colunas.

### Filtros

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
  rows: 5,
  showGlobalFilter: true,
  showColumnFilters: true,
  showClearFiltersButton: true,
)
```

Ajuste: `_pessoas` (uma `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario`) e `_colunas` (uma `List<SgDatatableColumn>`) são constantes do arquivo da página do showcase, não da biblioteca; substitua pelos seus dados e colunas.

### Colunas personalizadas e rodapé

body desenha a célula, footer recebe as linhas processadas, hidden/hideable/reorderable e o gerenciador de colunas.

Região `sgDatatableColunas` em `sg_datatable_page.snippets.g.dart`.

```dart
SgDatatable(
  id: 'pessoas-colunas',
  value: _pessoas.take(8).toList(),
  columns: [
    SgDatatableColumn(
      field: 'nome',
      header: 'Nome',
      hideable: false,
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
      hidden: true,
    ),
  ],
  columnManagerLabel: 'Colunas visíveis',
)
```

Ajuste: `_pessoas` (uma `List<SgDatatableRow>` com as chaves `id`, `nome`, `cidade`, `idade` e `salario`) e `_colunas` (uma `List<SgDatatableColumn>`) são constantes do arquivo da página do showcase, não da biblioteca; substitua pelos seus dados e colunas.

