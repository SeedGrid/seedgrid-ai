---
description: "API Flutter de Tabela de dados: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, datatable, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# API — Tabela de dados (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/datatable/API|API — Tabela de dados (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgDatatable

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDatatable` (mesmo nome).

Tabela de dados interativa com colunas configuraveis, paginacao, ordenacao, filtro, selecao e persistencia de layout de colunas.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/datatable/sg_datatable.dart` (linha 98) · classe `class SgDatatable extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_datatable.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDatatable({...})` com 39 parâmetro(s) nomeado(s), 38 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgDatatable

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `List<SgDatatableRow>` | — | sim | React | Tipo no React: `T[]`. |
| `columns` | `List<SgDatatableColumn>` | — | sim | React | Definicao das colunas da tabela. Tipo no React: `SgDatatableColumn<T>[]`. |
| `id` | `String?` | — | não | React | Identificador da tabela usado para DOM e persistencia do layout de colunas. |
| `title` | `String?` | — | não | React | — |
| `dataKey` | `String?` | — | não | React | — |
| `lazy` | `bool` | `false` | não | React | — |
| `totalRecords` | `num?` | — | não | React | — |
| `paginator` | `bool` | `false` | não | React | Ativa paginacao. |
| `rows` | `num` | `10` | não | React | Linhas por pagina quando a paginacao esta ativa (os dados vao em value). |
| `first` | `num?` | — | não | React | — |
| `rowsPerPageOptions` | `List<num>?` | — | não | React | Tipo no React: `number[]`. |
| `onPage` | `ValueChanged<SgDatatablePageEvent>?` | — | não | React | Callback de paginacao. Tipo no React: `((event: SgDatatablePageEvent) => void)`. |
| `sortField` | `String?` | — | não | React | — |
| `sortOrder` | `int?` | — | não | React | 1, -1 ou 0 (`SgDatatableSortOrder`). Tipo no React: `SgDatatableSortOrder`. |
| `onSort` | `ValueChanged<SgDatatableSortEvent>?` | — | não | React | Callback de ordenacao. Tipo no React: `((event: SgDatatableSortEvent) => void)`. |
| `removableSort` | `bool` | `true` | não | React | — |
| `selectionMode` | `SgDatatableSelectionMode?` | — | não | React | Modo de selecao de linhas. Valores: `multiple`, `single`. |
| `selection` | `Object?` | — | não | React | `single`: uma linha (ou null); `multiple`: `List<SgDatatableRow>`. Tipo no React: `SgDatatableSelection<T>`. |
| `onSelectionChange` | `ValueChanged<Object?>?` | — | não | React | Tipo no React: `((selection: SgDatatableSelection<T>) => void)`. |
| `showGlobalFilter` | `bool` | `false` | não | React | — |
| `globalFilter` | `String?` | — | não | React | — |
| `globalFilterPlaceholder` | `String?` | — | não | React | — |
| `onGlobalFilterChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((value: string) => void)`. |
| `showColumnFilters` | `bool` | `false` | não | React | — |
| `filters` | `Map<String, String>?` | — | não | React | Tipo no React: `Record<string, string>`. |
| `onFilter` | `ValueChanged<SgDatatableFilterEvent>?` | — | não | React | Tipo no React: `((event: SgDatatableFilterEvent) => void)`. |
| `showClearFiltersButton` | `bool` | `false` | não | React | — |
| `stripedRows` | `bool` | `false` | não | React | — |
| `showGridlines` | `bool` | `false` | não | React | — |
| `hoverableRows` | `bool` | `true` | não | React | — |
| `loading` | `bool` | `false` | não | React | Indica estado de carregamento. |
| `emptyMessage` | `String?` | — | não | React | — |
| `tableClassName` | `String?` | `''` | não | React | Classe CSS: nao existe no Flutter (ADR 50). Aceita so para cumprir o contrato; sem efeito. |
| `rowClassName` | `Object?` | — | não | React | Classe CSS por linha: sem efeito (ADR 50). Tipo no React: `string \| ((rowData: T, rowIndex: number) => string)`. |
| `groupBoxProps` | `SgListGroupBoxProps?` | `{}` † | não | React | Tipo no React: `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })`. |
| `showColumnManager` | `bool` | `true` | não | React | — |
| `columnManagerLabel` | `String?` | — | não | React | — |
| `mobileMode` | `SgDatatableMobileMode?` | — | não | React | Omitido (`null`, sem valor `auto`; modo automático): abaixo de 600 px (`kDatatableMobileBreakpoint`) de largura do contêiner vira cartões com rolagem infinita; acima, tabela. `cards` força cartões em qualquer largura; `scroll` força a tabela. Na `main` do `fe-flutter` (commit `5188e9e`); pacote Flutter ainda não publicado. Ver [[#Modo cartões no celular]]. |
| `infiniteScroll` | `bool?` | — | não | React | Omitido (`null`): `true` nos cartões e `false` na tabela. Rolagem infinita no lugar do paginador; exige `paginator` (`rows` é o tamanho da página). `infiniteScroll: false` mantém o paginador em tela estreita. Na `main` do `fe-flutter` (commit `5188e9e`); pacote Flutter ainda não publicado. |
| `onLoadMore` | `ValueChanged<SgDatatablePageEvent>?` | — | não | React | Chamado a cada página extra pedida pela rolagem infinita, além de `onPage`. Na `main` do `fe-flutter` (commit `5188e9e`); pacote Flutter ainda não publicado. |
| `columnManagerMaxHeight` | `Object?` | `320` | não | React | Numero (px) ou 'Npx'/'Nrem'. Tipo no React: `string \| number`. |
| `controller` | `SgDatatableController?` | — | não | Flutter | `ref` do React. |
| `enabled` | `bool?` | `true` † | não | React | Quando false, bloqueia as acoes que mudam estado: ordenacao, selecao de linhas, filtros (global e por coluna), limpar filtros e gerenciador de colunas. Paginacao, rolagem e carga de mais linhas continuam funcionando. Aparencia de desabilitado e aria-disabled. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- Tabela própria, sem dependência nova: o `two_dimensional_scrollables` (`TableView`) foi avaliado e descartado porque exige altura de linha conhecida e não mede o conteúdo.
- Sem altura limitada pelo pai, todas as linhas da página são montadas, como no React (2.000 linhas sem paginador levam cerca de 1,9 s de build em teste); com altura limitada e mais de 100 linhas (`kDatatableVirtualizeThreshold`) o corpo é virtualizado.
- A ordenação de texto aproxima a colação ICU do `localeCompare`; os vetores do React batem em 8.299 pares, mas locales exóticos podem divergir.
- `sortField` e `selection` nulos significam "não controlado" (o Dart não separa `undefined` de `null`).
- `groupBoxProps` vira `SgListGroupBoxProps` (`title`, `width`, `height`); `ref` vira `controller`.
- Reordenar colunas arrastando a alça também funciona por toque; com largura menor que 600 px o painel de colunas vira painel de baixo (ADR 51).
- Golden e teste em dispositivo não feitos.
- **Modo cartões:** `mobileMode: SgDatatableMobileMode.cards` reaproveita o corte de 600 px (`kDatatableMobileBreakpoint`, medido no contêiner pelo `LayoutBuilder`). Mesmo comportamento do React (título `cardTitle`, `cardHidden`, ordenação em "Ordenar por", filtros em painel, rodapé, paginação ou rolagem infinita), com os 51 casos `cardCases` dos vetores compartilhados. Ver ADR 58 da KB de plataforma.
- **Não portado:** `className`, `style`, `tableClassName`, `rowClassName`, `bodyClassName`, `headerClassName` e o `className` de coluna (ADR 50). `tableClassName` e `rowClassName` são aceitos só para cumprir o contrato e não têm efeito.

### Modo cartões no celular

- **Na `main` do `fe-flutter` (commit `5188e9e`); pacote Flutter ainda não publicado.** `mobileMode` omitido = automático: abaixo de 600 px de largura do contêiner cada linha vira um cartão "rótulo: valor", com seleção, ações e rodapé preservados e **rolagem infinita** (sem paginador, se houver `paginator`). `SgDatatableMobileMode.cards` força cartões em qualquer largura; `SgDatatableMobileMode.scroll` força a tabela com rolagem horizontal.
- **Mudança de comportamento:** com `paginator` em contêiner abaixo de 600 px o paginador some; use `infiniteScroll: false` para mantê-lo. Nas versões anteriores o padrão era `scroll`.
- **Rolagem infinita:** efetivo = `paginator && (infiniteScroll ?? exibido como cartões)`. O sentinela fica na posição do `Scrollable` vertical ancestral (80 px do fim) e avança a página chamando `onPage` e `onLoadMore`; mostra "Carregando mais..." e "Fim da lista." (i18n `components.datatable.loadingMore` e `endOfList`). Sem `lazy` a janela é ampliada; com `lazy` o pai acrescenta a página ao `value`. Ordenar, filtrar ou mudar `rows` volta à primeira página. 51 casos `cardCases` compartilhados com o React.
- Colunas: `cardTitle: true` (a primeira marcada vira título) e `cardHidden: true` (some do cartão e do rodapé do cartão; continua na tabela larga).
- Código (commit `4da4e3c` do repositório Flutter): `sg_datatable.dart`, `datatable_types.dart`, enum em `generated/enums.g.dart`. **Confirmado**; sem golden nem teste em dispositivo.

### Eventos, controllers e acessibilidade

**Dados e colunas** (`inputs/datatable/datatable_types.dart`)
- `SgDatatableRow` é `Map<String, Object?>`; campos aninhados usam notação com ponto (`owner.name`).
- `SgDatatableColumn`: `header` (obrigatório; `String`, `num` ou `Widget`), `columnId`, `field`, `body` (`Widget Function(SgDatatableRow, SgDatatableCellMeta)`), `footer` (texto, `Widget` ou função que recebe as linhas processadas de todas as páginas), `sortable`, `sortField`, `sortFunction` (comparador próprio; o sinal é invertido em ordem decrescente), `filter`, `filterField`, `filterPlaceholder`, `filterMatchMode` (`SgDatatableFilterMatchMode`: `contains`, `startsWith`, `endsWith`, `equals`), `excludeGlobalFilter`, `align` (`SgDatatableColumnAlign`), `width`, `minWidth` (px, `'Npx'`, `'Nrem'` ou `'N%'`), `hidden`, `hideable`, `reorderable`, `cardTitle` (modo cartões: vira o título do cartão) e `cardHidden` (modo cartões: não aparece no cartão).
- `SgDatatableCellMeta`: `rowIndex` (absoluto, considera a página), `field`, `value`, `rowData`.

**Eventos e callbacks** (`sg_datatable.dart`, métodos `_commit*`)
- `onPage: ValueChanged<SgDatatablePageEvent>?`: ao mudar de página ou de linhas por página, e também ao filtrar (volta à primeira página) e quando a página atual fica fora do alcance. O evento traz `first`, `rows`, `page`, `pageCount`, `totalRecords`.
- `onSort: ValueChanged<SgDatatableSortEvent>?`: `sortField` + `sortOrder` (1, -1 ou 0). Com `removableSort: true` (padrão) o terceiro clique remove a ordem.
- `onSelectionChange: ValueChanged<Object?>?`: em `single` recebe a linha ou `null` (tocar na linha já selecionada desmarca); em `multiple`, a `List<SgDatatableRow>`. As linhas são comparadas por `dataKey` quando informado.
- `onGlobalFilterChange: ValueChanged<String>?` e `onFilter: ValueChanged<SgDatatableFilterEvent>?`: a cada mudança de filtro (`filters` + `globalFilter`).

**Controller** (`SgDatatableController`, equivale ao `ref` do React): `getProcessedRows()`, `getPagedRows()`, `clearFilters()`, `clearSelection()`, `resetSort()`, `resetPage()`, `goToPage(int page)` (página começa em 1). Sem o widget montado devolve listas vazias e os métodos não fazem nada.

**Controlado × não controlado**: `first`, `sortField`, `sortOrder`, `selection`, `globalFilter` e `filters` controlam o estado quando informados; quando `null`, o estado é interno (`_internal*`) e os callbacks continuam sendo chamados.

**Carga sob demanda (`lazy: true`)**: o widget não filtra nem ordena (`_sortedRows = widget.value`) e não corta a página; você entrega em `value` só a página atual e informa `totalRecords` (sem ele, usa `value.length`). Reaja a `onPage`, `onSort` e `onFilter` para buscar os dados.

**Persistência do layout das colunas**: com `id` informado **e** um `SgEnvironmentProvider` na árvore, ordem e visibilidade das colunas são salvas via `SgPersistence` na chave `datatable:<id>:columns` (`{version: 1, columnOrder, hiddenColumnsMap}`). Sem `SgEnvironmentProvider` ou sem `id`, o estado fica só em memória. Erros de persistência são ignorados. Ver [[SeedGrid/SeedGrid-components/flutter/providers/API|API dos providers (Flutter)]].

**Acessibilidade** (confirmado em `sg_datatable.dart`)
- `id` vira `Semantics(container: true, identifier: id)` na raiz.
- Paginador: `Semantics(container: true, label: i18n 'components.datatable.pagination')`; cada botão de página tem `Semantics(button, selected, label)` e `Tooltip` quando é só ícone.
- Linhas: `Semantics(selected, container: true)`; botões do gerenciador de colunas com `Tooltip`, `label` e `expanded`.
- Não encontrei navegação por teclado nas linhas (nenhum `Focus`/`LogicalKeyboardKey` no arquivo): **não confirmado** se a seleção ou a ordenação funcionam só com teclado.

