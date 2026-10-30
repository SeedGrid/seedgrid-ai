---
description: "Tabela de dados em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, datatable]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Tabela de dados — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/datatable/Visao-geral|Tabela de dados — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/datatable/API|API — Tabela de dados (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos|Exemplos — Tabela de dados (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

1 componente(s): **1 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgDatatable` | portado | Tabela com paginação, ordenação, filtros, seleção e gerenciador de colunas. | `pages/sg_datatable_page.dart` |

## Quando usar

- `SgDatatable`: listas de registros que precisam de ordenar, filtrar, paginar, selecionar linhas ou escolher colunas. Use `lazy: true` quando os dados vêm paginados do servidor. Para só alinhar poucos dados estáticos, uma `Column`/`Row` com `SgGrid` ([[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|layout]]) é mais leve; para escolher itens de uma lista pequena, veja `SgPickList`/`SgOrderList` ([[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|inputs de seleção]]).

## O que muda em relação ao React

- Linhas são `Map<String, Object?>` (`SgDatatableRow`); o `ref` do React vira `SgDatatableController`; `className`/`style` não existem (ADR 50).
- `sortField` e `selection` com `null` significam "não controlado".
- O corpo é virtualizado com altura limitada e mais de 100 linhas; com largura menor que 600 px o painel de colunas é um painel de baixo.
- O layout das colunas só é persistido com `SgEnvironmentProvider` e `id`.
- Mais detalhes: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] · [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] (seção da tabela).

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte: [[SeedGrid/SeedGrid-components/datatable/Visao-geral|Tabela de dados — React]]. O grupo React só exporta `SgDatatable` e seus tipos; no Dart os tipos viraram `SgDatatableColumn`, `SgDatatableCellMeta`, `SgDatatablePageEvent`, `SgDatatableSortEvent`, `SgDatatableFilterEvent`, `SgDatatableController` e os enums `SgDatatableFilterMatchMode` e `SgDatatableColumnAlign` (ver tabela abaixo). Nenhum símbolo ficou sem equivalente confirmado.

## Não verificado

- Não executei o showcase nem `flutter test`; o desempenho citado (2.000 linhas, 1,9 s) e os 8.299 pares de ordenação vêm do comentário do código e do `docs/PARIDADE.md`.
- Navegação por teclado e leitores de tela reais não foram verificados.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgDatatableController` | class | Equivale a `SgDatatableRef` do React. | `lib/src/inputs/datatable/sg_datatable.dart` |
| `SgDatatableRow` | typedef | `SgDatatableRow`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableSortOrder` | typedef | `SgDatatableSortOrder`: 1 (crescente), -1 (decrescente) ou 0 (sem ordem). | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableSelection` | typedef | `SgDatatableSelection<T>`: `T \| T[] \| null`. Em `single` e uma linha (ou null); em `multiple`, uma `List<SgDatatableRow>`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableFilterMatchMode` | enum | `SgDatatableFilterMatchMode`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableColumnAlign` | enum | `SgDatatableColumnAlign`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableSortEvent` | class | `SgDatatableSortEvent`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatablePageEvent` | class | `SgDatatablePageEvent`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableFilterEvent` | class | `SgDatatableFilterEvent`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableCellMeta` | class | `SgDatatableCellMeta<T>`: segundo argumento de `body`. | `lib/src/inputs/datatable/datatable_types.dart` |
| `SgDatatableColumn` | class | `SgDatatableColumn<T>`. `className`, `headerClassName` e `bodyClassName` do React nao existem (ADR 50, sem classes CSS); `header` e `footer` aceitam texto, numero ou `Widget`. | `lib/src/inputs/datatable/datatable_types.dart` |

