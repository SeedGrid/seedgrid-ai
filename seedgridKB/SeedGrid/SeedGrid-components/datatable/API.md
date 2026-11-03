---
tags: [seedgrid, component, frontend, react, datatable, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgDatatable.tsx
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "API React de Tabela de dados (@seedgrid/fe-components): props completas com tipo e padrão, eventos e acessibilidade. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# SgDatatable: API — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/datatable/API|API — Tabela de dados (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Import: `import { SgDatatable, type SgDatatableColumn } from "@seedgrid/fe-components";` (pacote v`2026.7.1`). Contexto: [[SeedGrid/SeedGrid-components/datatable/Visao-geral|Visão geral do SgDatatable]]. Exemplos: [[SeedGrid/SeedGrid-components/datatable/Exemplos|Exemplos do SgDatatable]]. A metodologia das tabelas está em [[SeedGrid/SeedGrid-components/inputs-texto/API#Como as tabelas foram montadas|Como as tabelas foram montadas]].

O componente é genérico: `SgDatatable<T extends SgDatatableRow = SgDatatableRow>`, com `SgDatatableRow = Record<string, unknown>`. É declarado com `React.forwardRef` e recebe `ref?: React.Ref<SgDatatableRef<T>>`. **Não** usa `RhfFieldProps`, então não há integração com react-hook-form. **Confirmado**.

## Tipos exportados

`SgDatatableProps`, `SgDatatableMobileMode`, `SgDatatableRow`, `SgDatatableColumn`, `SgDatatableColumnAlign`, `SgDatatableCellMeta`, `SgDatatableFilterEvent`, `SgDatatableFilterMatchMode`, `SgDatatablePageEvent`, `SgDatatableRef`, `SgDatatableSelection`, `SgDatatableSelectionMode`, `SgDatatableSortEvent`, `SgDatatableSortOrder`. **Confirmado** em `src/index.ts`.

## Props de `SgDatatable` (41)

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Não | Também chave de persistência das colunas (`datatable:<id>:columns`) quando há `SgEnvironmentProvider`. |
| `title` | `string` | — | Não | Título do `SgGroupBox`. |
| `value` | `T[]` | — | Sim | Linhas (`Record<string, unknown>[]`). |
| `columns` | `SgDatatableColumn<T>[]` | — | Sim | `SgDatatableColumn<T>[]`. |
| `dataKey` | `string` | — | Não | Campo identidade da linha (seleção e `key`). |
| `lazy` | `boolean` | `false` | Não | Server-side: não filtra, ordena nem pagina localmente. |
| `totalRecords` | `number` | `value.length` | Não | Total em modo `lazy`. |
| `paginator` | `boolean` | `false` | Não | Exibe paginação. |
| `rows` | `number` | `10` | Não | Linhas por página (valor inicial). |
| `first` | `number` | `0` | Não | Índice da 1ª linha (controlado quando definido). |
| `rowsPerPageOptions` | `number[]` | — | Não | Opções de linhas por página. |
| `onPage` | `((event: SgDatatablePageEvent) => void)` | — | Não | `{first, rows, page (base 1), pageCount, totalRecords}`. |
| `sortField` | `string \| null` | — | Não | Campo ordenado (controlado). |
| `sortOrder` | `SgDatatableSortOrder` | `0` | Não | `1` asc, `-1` desc, `0` sem ordem (controlado). |
| `onSort` | `((event: SgDatatableSortEvent) => void)` | — | Não | `{sortField, sortOrder}`. |
| `removableSort` | `boolean` | `true` | Não | Ciclo asc → desc → sem ordem (senão volta a asc). |
| `selectionMode` | `SgDatatableSelectionMode` | — | Não | `single` ou `multiple` (clique na linha). |
| `selection` | `SgDatatableSelection<T>` | — | Não | Seleção controlada (`T`, `T[]` ou `null`). |
| `onSelectionChange` | `((selection: SgDatatableSelection<T>) => void)` | — | Não | Recebe a nova seleção. |
| `showGlobalFilter` | `boolean` | `false` | Não | Campo de filtro global (match `contains`). |
| `globalFilter` | `string` | — | Não | Filtro global controlado. |
| `globalFilterPlaceholder` | `string` | i18n `components.datatable.globalFilterPlaceholder` | Não | Placeholder. |
| `onGlobalFilterChange` | `((value: string) => void)` | — | Não | Recebe o texto do filtro global. |
| `showColumnFilters` | `boolean` | `false` | Não | Filtros por coluna (colunas com `filter`). |
| `filters` | `Record<string, string>` | — | Não | Filtros por coluna controlados (`{campo: texto}`). |
| `onFilter` | `((event: SgDatatableFilterEvent) => void)` | — | Não | `{filters, globalFilter}`. |
| `showClearFiltersButton` | `boolean` | `false` | Não | Botão limpar filtros. |
| `stripedRows` | `boolean` | `false` | Não | Zebrado. |
| `showGridlines` | `boolean` | `false` | Não | Linhas de grade. |
| `hoverableRows` | `boolean` | `true` | Não | Destaque no hover. |
| `loading` | `boolean` | `false` | Não | Linha de carregamento (i18n `components.datatable.loading`). |
| `emptyMessage` | `string` | i18n `components.datatable.empty` | Não | Texto sem linhas. |
| `className` | `string` | `""` | Não | Classes do wrapper. |
| `style` | `CSSProperties` | — | Não | Estilo do wrapper. |
| `tableClassName` | `string` | `""` | Não | Classes do `<table>`. |
| `rowClassName` | `string \| ((rowData: T, rowIndex: number) => string)` | — | Não | Classe fixa ou função `(row, index)`. |
| `groupBoxProps` | `(Omit<Partial<SgGroupBoxProps>, "title" \| "children"> & { title?: string; })` | `{}` | Não | Props do `SgGroupBox`. |
| `showColumnManager` | `boolean` | `true` | Não | Gerenciador de colunas (ocultar/reordenar). |
| `columnManagerLabel` | `string` | i18n `components.datatable.columns` (fallback "Colunas") | Não | Rótulo do gerenciador. |
| `columnManagerMaxHeight` | `string \| number` | `320` | Não | Altura máxima do painel. |
| `mobileMode` | `"scroll" \| "cards"` | automático (sem valor `auto`) | Não | Omitido: abaixo de 600 px de contêiner (`SG_DATATABLE_MOBILE_BREAKPOINT`) vira cartões com rolagem infinita; acima, tabela. `"cards"` **força** cartões em qualquer largura; `"scroll"` **força** a tabela com rolagem horizontal. Ver [[#Modo cartões no celular (`mobileMode`)]]. |
| `infiniteScroll` | `boolean` | `true` quando a lista aparece como cartões, `false` na tabela | Não | Rolagem infinita no lugar do paginador. **Exige `paginator`** (`rows` vira o tamanho de cada página). Use `infiniteScroll={false}` para manter o paginador em tela estreita. Ver [[#Rolagem infinita (`infiniteScroll`)]]. |
| `onLoadMore` | `(event: SgDatatablePageEvent) => void` | — | Não | Chamado a cada página extra pedida pela rolagem infinita (junto com `onPage`). |

## `SgDatatableColumn<T>` (24 campos)

| Campo | Tipo | Padrão | Obrigatório | Descrição |
|---|---|---|---|---|
| `columnId` | `string` | — | Não | Chave estável da coluna, usada na persistência e na reordenação. A chave final segue a ordem `columnId` → `field` → índice. |
| `field` | `string` | — | Não | Campo da linha. Aceita caminho com ponto, como `"cliente.nome"` (`getFieldValue`). |
| `header` | `ReactNode` | — | **Sim** | Cabeçalho. |
| `body` | `(rowData: T, meta: SgDatatableCellMeta<T>) => ReactNode` | valor do campo | Não | Render da célula. `meta = {rowIndex, field, value, rowData}`. |
| `footer` | `ReactNode \| ((rows: T[]) => ReactNode)` | — | Não | Rodapé. A função recebe as linhas filtradas e ordenadas, **todas**, não só a página. |
| `sortable` | `boolean` | — | Não | Habilita ordenação pelo cabeçalho. |
| `sortField` | `string` | `field` | Não | Campo usado para ordenar. |
| `sortFunction` | `(rowA: T, rowB: T) => number` | `compareValues` | Não | Comparador próprio. A direção é aplicada por cima. |
| `filter` | `boolean` | — | Não | Mostra filtro na coluna (requer `showColumnFilters`). |
| `filterField` | `string` | `field` | Não | Campo filtrado. |
| `filterPlaceholder` | `string` | i18n `components.datatable.columnFilterPlaceholder` | Não | Placeholder do filtro. |
| `filterMatchMode` | `SgDatatableFilterMatchMode` | `"contains"` | Não | `contains`, `startsWith`, `endsWith` ou `equals`. |
| `excludeGlobalFilter` | `boolean` | — | Não | Tira a coluna do filtro global. |
| `align` | `SgDatatableColumnAlign` | — | Não | `left`, `center` ou `right`. |
| `width` | `number \| string` | — | Não | Largura (número = px). |
| `minWidth` | `number \| string` | — | Não | Largura mínima. |
| `hidden` | `boolean` | `false` | Não | Começa oculta. O gerenciador de colunas pode mudar isso. |
| `hideable` | `boolean` | `true` (efetivo) | Não | `false` impede ocultar pelo gerenciador. |
| `reorderable` | `boolean` | `true` (efetivo) | Não | `false` impede reordenar pelo gerenciador. |
| `className` | `string` | — | Não | Classe aplicada ao `<th>`, às células e ao rodapé da coluna. |
| `headerClassName` | `string` | — | Não | Classe do `<th>`. |
| `bodyClassName` | `string \| ((rowData: T, rowIndex: number) => string \| undefined)` | — | Não | Classe da célula, fixa ou calculada. |
| `cardTitle` | `boolean` | — | Não | Só no modo `cards`: a primeira coluna visível marcada vira o título do cartão. |
| `cardHidden` | `boolean` | — | Não | Só no modo `cards`: não mostra a coluna no cartão (nem no rodapé do cartão); continua na tabela larga. |

Fonte: `SgDatatable.tsx` → tipo `SgDatatableColumn` e usos em `SgDatatableBase`. **Confirmado**, exceto onde a célula indica outra coisa.

## Eventos e formatos

| Evento | Payload | Quando |
|---|---|---|
| `onPage` | `SgDatatablePageEvent` = `{ first, rows, page, pageCount, totalRecords }` (`page` começa em **1**) | Troca de página, de linhas por página e `resetPage`/`goToPage` |
| `onSort` | `SgDatatableSortEvent` = `{ sortField: string \| null, sortOrder: 1 \| -1 \| 0 }` | Clique em cabeçalho ordenável |
| `onFilter` | `SgDatatableFilterEvent` = `{ filters: Record<string,string>, globalFilter: string }` | Mudança de filtro global ou de coluna |
| `onGlobalFilterChange` | `string` | Mudança do filtro global |
| `onSelectionChange` | `SgDatatableSelection<T>` = `T \| T[] \| null` | Clique na linha. Em `single`, clicar de novo na linha selecionada desmarca (`null`). Em `multiple`, alterna a linha no array. |

**Seleção por clique:** o clique é ignorado quando o alvo está dentro de `button`, `a`, `input`, `select`, `textarea`, `label` ou de um elemento com `data-sg-stop-row-select="true"`. Por isso os botões de ação na célula não selecionam a linha. **Confirmado**.

**Ordenação:** o clique em uma coluna nova ordena asc. Na mesma coluna, a sequência é asc → desc → sem ordem com `removableSort` (padrão); sem ele, desc → asc. **Confirmado**.

## Ref (`SgDatatableRef<T>`)

| Método | Retorno/efeito |
|---|---|
| `getProcessedRows()` | Linhas filtradas e ordenadas (`T[]`). Em `lazy`, devolve o próprio `value`. |
| `getPagedRows()` | Linhas da página atual. |
| `clearFilters()` | Limpa os filtros global e de coluna. |
| `clearSelection()` | Limpa a seleção. |
| `resetSort()` | Remove a ordenação. |
| `resetPage()` | Volta para a primeira página. |
| `goToPage(page)` | Vai para a página indicada. |

**Confirmado** (`useImperativeHandle` em `SgDatatableBase`).

## Modos controlado e não controlado

Cada estado é controlado só quando a prop correspondente é passada (`!== undefined`):
- `first`;
- `sortField`;
- `sortOrder`;
- `selection`;
- `globalFilter`;
- `filters`.

Quando não é passada, o componente guarda o estado internamente. `rows` é **só valor inicial**: o estado interno `internalRows` muda pelo seletor de linhas por página. **Confirmado**.

## Modo `lazy` (server-side)

- Com `lazy`, as linhas de `value` são exibidas como chegam: sem filtro, sem ordenação e sem fatiar por página.
- O total vem de `totalRecords`.
- A aplicação busca os dados em `onPage`, `onSort` e `onFilter`.
- Testes em `tests/datatable-dom.test.mjs`: "lazy: nao ordena localmente", "lazy: nao pagina localmente". **Confirmado** (testes lidos, não executados).

## Persistência de colunas

- **Quando:** só com `SgEnvironmentProvider` presente (`useHasSgEnvironmentProvider()`) e `id` não vazio.
- **O que é salvo:** `{version: 1, columnOrder, hiddenColumnsMap}`, via `useSgPersistence()`, na chave `datatable:<id>:columns`.
- **Ao carregar:** colunas novas entram no fim; colunas que deixaram de existir são descartadas.
- **Falhas:** erros de persistência são ignorados.
- **Testes:** `tests/datatable-dom.test.mjs` garante que re-renders do pai com `columns` instável não regravam a persistência.

**Confirmado**.

## Modo cartões no celular (`mobileMode`)

> **Ainda não publicada (P127 + P137):** o comportamento abaixo está no working tree do repositório de componentes (sem commit nem publicação). Vale na versão que sair depois dessa publicação; o Playground do showcase usa o `latest` publicado.

- **Regra (decisão do dono, P127.D e P137.D1):** `mobileMode` omitido = **automático**. O corte é 600 px medido no **contêiner** (`SG_DATATABLE_MOBILE_BREAKPOINT`, exportada pelo pacote; 599 vira cartões, 600 continua tabela), pelo hook `useSgContainerWidth` (ResizeObserver no próprio contêiner), então vale também para tabela em coluna estreita no desktop. Antes da primeira medida a tabela larga é a que aparece.
  - `mobileMode="cards"` explícito: cartões em **qualquer** largura.
  - `mobileMode="scroll"` explícito: tabela com rolagem horizontal em **qualquer** largura (o jeito de recusar os cartões).
  - Não existe o valor `auto`: omitir a prop é o automático.
- **Mudança de comportamento:** quem usava `mobileMode="scroll"` como padrão e não escrevia nada passa a ver cartões abaixo de 600 px. Para manter a tabela, escreva `mobileMode="scroll"`.
- Cada linha vira um cartão: título (coluna `cardTitle`) e os demais campos como "rótulo: valor". Mantém seleção por clique (botões e links dentro do cartão não selecionam), `rowClassName`, ações de coluna sem `field`, rodapé (bloco "rótulo: total", sem as colunas `cardHidden`) e `lazy`.
- Ordenação: o cabeçalho some; aparece o seletor "Ordenar por" (colunas `sortable`) e o botão de inverter a direção. Filtros: `showColumnFilters` e `filter` das colunas passam a um painel "Filtros" aberto por botão; o filtro global continua visível.
- O gerenciador de colunas continua valendo (colunas ocultas não entram no cartão).
- Paridade: os mesmos 51 casos (`cardCases`, em `datatable_vectors/vectors.json`, 10 deles de rolagem infinita) são testados no React e no Flutter.
- Fonte: `SgDatatable.tsx`, `useSgContainerWidth.ts`; relato da `front` (P137, 2026-11-03), código só no working tree. **Confirmado** pelos testes relatados (React 93/93, Playwright em navegador real); não visto em celular real.

## Rolagem infinita (`infiniteScroll`)

> **Ainda não publicada (P127 + P137):** o comportamento abaixo está no working tree do repositório de componentes (sem commit nem publicação). Vale na versão que sair depois dessa publicação; o Playground do showcase usa o `latest` publicado.

- **Efetivo** = `paginator && (infiniteScroll ?? lista exibida como cartões)`. Nos cartões o padrão é ligado (por isso a lista de celular não mostra paginador); na tabela, desligado.
- **Exige `paginator`**: `rows` é o tamanho de cada página. Sem `paginator`, a prop não faz nada.
- **Como funciona:** um sentinela no fim da lista (`IntersectionObserver`, margem de 200 px) avança a página e chama `onPage` e `onLoadMore` com `{ first, rows, page, pageCount, totalRecords }`. As linhas já exibidas continuam na tela. No fim aparece "Fim da lista."; durante `loading` com linhas já exibidas, "Carregando mais...".
- **Sem `lazy`:** o componente amplia a janela sozinho (`first` fica 0).
- **Com `lazy`:** o pai **acrescenta** a página seguinte ao `value` (o pedido sai uma vez por tamanho de `value`); o fim é `value.length >= totalRecords`.
- **Ordenar, filtrar ou mudar `rows`** volta à primeira página.
- **Mudança de comportamento:** tabela com `paginator` em contêiner abaixo de 600 px deixa de mostrar paginador e vira cartões com rolagem infinita. Para manter o paginador em tela estreita, escreva `infiniteScroll={false}` (os exemplos do showcase que demonstram o paginador fazem isso).
- Fonte: relato da `front` (P137.F1.T1 e F1.T2), código no working tree. **Confirmado** pelos testes relatados (`datatable-infinite-scroll.test.mjs`, vetores `cardCases`, Playwright: 4 → 8 → 12 cartões e "Fim da lista."); não visto em celular real.

## Internacionalização

Todos os textos visíveis vêm de `components.datatable.*`:
- `empty`, `loading`;
- `globalFilterPlaceholder`, `columnFilterPlaceholder`, `clearFilters`;
- `columns`, `restoreColumns`, `showAllColumns`, `dragToReorder`;
- `first`, `prev`, `next`, `last`, `jumpBackward`, `jumpForward`;
- `rowsPerPage`, `pageReport`, `page`, `pagination`;
- modo cartões: `filters` ("Filtros"), `sortBy` ("Ordenar por"), `sortNone` ("Sem ordem"), `sortDirection` (inverter a direção).
- rolagem infinita (não publicada): `loadingMore` ("Carregando mais...") e `endOfList` ("Fim da lista.").

`columns` e `restoreColumns` têm fallback fixo em pt-BR ("Colunas", "Restaurar padrão") caso a chave não exista. **Confirmado**.

## Acessibilidade comprovável

- Linhas com `aria-selected` quando selecionadas.
- Paginação com `aria-label` (`components.datatable.pagination`). Os botões têm `aria-label` próprio, e a página atual tem `aria-current="page"`.
- O botão do gerenciador de colunas tem `aria-label`.
- Não há `aria-sort` nos cabeçalhos ordenáveis. A seleção de linha é feita só por clique (o `<tr>` não tem `tabIndex`).

**Confirmado** pela presença ou ausência no código.

## Fontes

- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs/SgDatatable.tsx` (`SgDatatableBase`, tipos, `buildDatatableColumnsPersistenceKey`)
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/src/environment/SgEnvironmentProvider.tsx` (`useHasSgEnvironmentProvider`, `useSgPersistence`)
- `front/seedgrid-fe-components/packages/seedgrid-fe-components/tests/datatable-dom.test.mjs`
