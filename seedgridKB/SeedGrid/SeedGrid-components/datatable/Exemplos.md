---
tags: [seedgrid, component, frontend, react, datatable, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# SgDatatable: exemplos

Os exemplos foram conferidos contra [[SeedGrid/SeedGrid-components/datatable/API|API do SgDatatable]]. As fontes são relativas a `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/`. Não foram compilados nem executados.

Os samples `basico` e `templates` do showcase declaram as colunas **sem tipo** (`const BASE_COLUMNS = [{ …, align: "right" }]`). Sem anotação, o TypeScript alarga `"right"` para `string`, que não é atribuível a `SgDatatableColumnAlign`. Por isso, abaixo, as colunas são anotadas com `SgDatatableColumn<Row>[]`. Isso é **Inferência** pelas regras do TS: os `.sample` não passam pelo `typecheck` do pacote.

## Básico: paginação, zebra e grade

Adaptado de `basico.tsx.sample`, com menos linhas e colunas tipadas.

```tsx
import React from "react";
import { SgDatatable, type SgDatatableColumn } from "@seedgrid/fe-components";

type ProductRow = { id: number; code: string; name: string; category: string; price: number; stock: number };

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22 },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64 },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48 }
];

const BASE_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  { field: "code", header: "Code", sortable: true },
  { field: "name", header: "Name", sortable: true, filter: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right" }
];

export default function BasicDatatableExample() {
  return (
    <SgDatatable<ProductRow>
      id="datatable-basic"
      title="Product catalog"
      value={PRODUCT_ROWS}
      columns={BASE_COLUMNS}
      dataKey="id"
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10]}
      showGlobalFilter
      showColumnFilters
      stripedRows
      showGridlines
    />
  );
}
```

## Templates de célula e rodapé

Adaptado de `templates.tsx.sample`. O `footer` recebe **todas** as linhas processadas (filtradas e ordenadas), não só a página atual.

```tsx
import React from "react";
import { SgDatatable, type SgDatatableColumn } from "@seedgrid/fe-components";

type ProductRow = { id: number; code: string; name: string; price: number };

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const TEMPLATE_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  {
    field: "name",
    header: "Produto",
    sortable: true,
    body: (row) => (
      <div className="space-y-0.5">
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.code}</p>
      </div>
    ),
    footer: (rows) => <span>Total: {rows.length}</span>
  },
  {
    field: "price",
    header: "Preço",
    align: "right",
    body: (row) => <span>{currency.format(row.price)}</span>,
    footer: (rows) => <span>{currency.format(rows.reduce((sum, r) => sum + r.price, 0))}</span>
  }
];

export default function TemplateDatatableExample({ rows }: { rows: ProductRow[] }) {
  return <SgDatatable<ProductRow> id="datatable-template" title="Custom body and footer" value={rows} columns={TEMPLATE_COLUMNS} dataKey="id" paginator rows={5} showGridlines />;
}
```

## Ações por linha sem disparar a seleção

Baseado em `acoes.tsx.sample`. Botões dentro da célula não selecionam a linha (`button`, `a` e outros são ignorados pelo `onClick` do `<tr>`).

```tsx
import React from "react";
import { Pencil } from "lucide-react";
import { SgButton, SgDatatable, type SgDatatableColumn, type SgDatatableSelection } from "@seedgrid/fe-components";

type PermissionRow = { id: number; name: string; description: string };

export default function ActionsDatatableExample({ rows }: { rows: PermissionRow[] }) {
  const [selection, setSelection] = React.useState<SgDatatableSelection<PermissionRow>>(null);

  const columns = React.useMemo<SgDatatableColumn<PermissionRow>[]>(() => [
    { field: "id", header: "ID", sortable: true, width: 80 },
    { field: "name", header: "Name", sortable: true },
    {
      header: "Actions",
      align: "center",
      width: 120,
      body: (row) => (
        <SgButton
          size="sm"
          appearance="ghost"
          severity="secondary"
          iconOnly
          leftIcon={<Pencil className="size-4" />}
          aria-label={`Edit ${row.name}`}
          onClick={() => console.log("edit", row.id)}
        />
      )
    }
  ], []);

  return (
    <SgDatatable<PermissionRow>
      id="datatable-actions"
      title="Permissions"
      value={rows}
      columns={columns}
      dataKey="id"
      selectionMode="single"
      selection={selection}
      onSelectionChange={setSelection}
      paginator
      rows={4}
    />
  );
}
```

## Server-side (`lazy`)

Resumo de `server-side.tsx.sample`, que traz também uma API simulada completa. O componente só emite eventos: a aplicação busca os dados e devolve `value` + `totalRecords`.

```tsx
import React from "react";
import {
  SgDatatable,
  type SgDatatableColumn,
  type SgDatatableFilterEvent,
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
  type SgDatatableSortOrder
} from "@seedgrid/fe-components";

type ProductRow = { id: number; code: string; name: string };
type ServerQuery = { first: number; rows: number; sortField: string | null; sortOrder: SgDatatableSortOrder; globalFilter: string; filters: Record<string, string> };

const COLUMNS: SgDatatableColumn<ProductRow>[] = [
  { field: "code", header: "Code", sortable: true, filter: true },
  { field: "name", header: "Name", sortable: true, filter: true }
];

export default function ServerSideDatatableExample({ fetchPage }: { fetchPage: (q: ServerQuery) => Promise<{ data: ProductRow[]; totalRecords: number }> }) {
  const [query, setQuery] = React.useState<ServerQuery>({ first: 0, rows: 10, sortField: "name", sortOrder: 1, globalFilter: "", filters: {} });
  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPage(query)
      .then((r) => { if (!cancelled) { setRows(r.data); setTotal(r.totalRecords); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query, fetchPage]);

  return (
    <SgDatatable<ProductRow>
      id="datatable-server"
      value={rows}
      columns={COLUMNS}
      dataKey="id"
      lazy
      totalRecords={total}
      paginator
      rows={query.rows}
      first={query.first}
      rowsPerPageOptions={[10, 20, 50]}
      sortField={query.sortField}
      sortOrder={query.sortOrder}
      onSort={(e: SgDatatableSortEvent) => setQuery((p) => ({ ...p, first: 0, sortField: e.sortField, sortOrder: e.sortOrder }))}
      showGlobalFilter
      globalFilter={query.globalFilter}
      showColumnFilters
      filters={query.filters}
      onFilter={(e: SgDatatableFilterEvent) => setQuery((p) => ({ ...p, first: 0, globalFilter: e.globalFilter, filters: e.filters }))}
      onPage={(e: SgDatatablePageEvent) => setQuery((p) => ({ ...p, first: e.first, rows: e.rows }))}
      loading={loading}
    />
  );
}
```

## Ref imperativo

```tsx
import React from "react";
import { SgButton, SgDatatable, type SgDatatableColumn, type SgDatatableRef } from "@seedgrid/fe-components";

type Row = { id: number; name: string };
const COLUMNS: SgDatatableColumn<Row>[] = [{ field: "name", header: "Nome", sortable: true, filter: true }];

export default function RefExample({ rows }: { rows: Row[] }) {
  const tableRef = React.useRef<SgDatatableRef<Row>>(null);
  return (
    <>
      <SgDatatable<Row> ref={tableRef} id="tbl-ref" value={rows} columns={COLUMNS} dataKey="id" paginator showColumnFilters />
      <SgButton onClick={() => tableRef.current?.clearFilters()}>Limpar filtros</SgButton>
      <SgButton onClick={() => console.log(tableRef.current?.getProcessedRows())}>Exportar visíveis</SgButton>
    </>
  );
}
```

Os métodos estão confirmados em `SgDatatableRef`. A tipagem com `ref` vem do cast de `React.forwardRef(SgDatatableBase)` para uma função genérica com `ref?: React.Ref<SgDatatableRef<T>>`.
