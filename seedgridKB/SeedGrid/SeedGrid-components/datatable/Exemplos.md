---
tags: [seedgrid, component, frontend, react, datatable, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Tabela de dados, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# SgDatatable: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos|Exemplos — Tabela de dados (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase do `SgDatatable` (`/components/sg-datatable`), na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles; **não foram compilados nesta rodada**. Prop a prop: [[SeedGrid/SeedGrid-components/datatable/API|API do SgDatatable]]. O Playground da página é interativo e não tem `.sample`.

Observação (**Inferência** pelas regras do TypeScript, não verificada nesta rodada): alguns samples (`basico`, `templates`) declaram as colunas **sem tipo** (`const BASE_COLUMNS = [{ …, align: "right" }]`). Sem anotação, `"right"` é alargado para `string`, que não é atribuível a `SgDatatableColumnAlign`. Em código próprio, anote as colunas com `SgDatatableColumn<Row>[]`.

## SgDatatable

### Básico com paginação e sort

infiniteScroll={false} mantém o paginador também em tela estreita: abaixo de 600 px o padrão viraria cartões com rolagem infinita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgDatatable } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const BASE_COLUMNS = [
  { field: "code", header: "Code", sortable: true },
  { field: "name", header: "Name", sortable: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right" }
];

export default function BasicDatatableExample() {
  return (
    <SgDatatable
      id="datatable-basic"
      title="Product catalog"
      value={PRODUCT_ROWS}
      columns={BASE_COLUMNS}
      dataKey="id"
      paginator
      infiniteScroll={false}
      rows={5}
      rowsPerPageOptions={[5, 10]}
      stripedRows
      showGridlines
    />
  );
}
```

### Filtro global + filtros por coluna

showGlobalFilter, showColumnFilters, filterMatchMode por coluna e showClearFiltersButton.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/filtros.tsx.sample`

```tsx
import React from "react";
import { SgDatatable } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const FILTER_COLUMNS = [
  { field: "code", header: "Code", sortable: true, filter: true, filterPlaceholder: "Filter code" },
  { field: "name", header: "Name", sortable: true, filter: true, filterPlaceholder: "Filter name" },
  { field: "category", header: "Category", sortable: true, filter: true, filterPlaceholder: "Filter category" },
  { field: "status", header: "Status", sortable: true, filter: true, filterPlaceholder: "Filter status" },
  { field: "price", header: "Price", sortable: true, align: "right" }
];

export default function FilterDatatableExample() {
  return (
    <SgDatatable
      id="datatable-filter"
      title="Search and filter"
      value={PRODUCT_ROWS}
      columns={FILTER_COLUMNS}
      dataKey="id"
      paginator
      rows={6}
      showGlobalFilter
      showColumnFilters
      showClearFiltersButton
    />
  );
}
```

### Seleção de linhas (single e multiple)

selectionMode single ou multiple, com dataKey e onSelectionChange; a seleção é entregue ao pai.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/selecao.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgDatatable, SgGrid, type SgDatatableSelection } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const BASE_COLUMNS = [
  { field: "code", header: "Code", sortable: true },
  { field: "name", header: "Name", sortable: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right" }
];

export default function SelectionDatatableExample() {
  const [selectionMode, setSelectionMode] = React.useState<"single" | "multiple">("single");
  const [selection, setSelection] = React.useState<SgDatatableSelection<ProductRow>>(null);

  const selectionLabel = React.useMemo(() => {
    if (!selection) return "none";
    if (Array.isArray(selection)) {
      return selection.length === 0 ? "none" : selection.map((row) => row.name).join(", ");
    }
    return selection.name;
  }, [selection]);

  return (
    <>
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton appearance={selectionMode === "single" ? "solid" : "outline"} onClick={() => { setSelectionMode("single"); setSelection(null); }}>
          single
        </SgButton>
        <SgButton appearance={selectionMode === "multiple" ? "solid" : "outline"} onClick={() => { setSelectionMode("multiple"); setSelection([]); }}>
          multiple
        </SgButton>
        <SgButton appearance="outline" onClick={() => setSelection(selectionMode === "multiple" ? [] : null)}>
          clear selection
        </SgButton>
      </SgGrid>

      <SgDatatable
        id="datatable-selection"
        title="Selectable table"
        value={PRODUCT_ROWS}
        columns={BASE_COLUMNS}
        dataKey="id"
        paginator
        rows={5}
        selectionMode={selectionMode}
        selection={selection}
        onSelectionChange={setSelection}
      />

      <p className="text-sm text-[rgb(var(--sg-muted))]">
        selected: <strong>{selectionLabel}</strong>
      </p>
    </>
  );
}
```

### Template customizado e footer

body desenha a célula e footer recebe as linhas processadas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/templates.tsx.sample`

```tsx
import React from "react";
import { SgDatatable } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const TEMPLATE_COLUMNS = [
  {
    field: "name",
    header: "Product",
    sortable: true,
    body: (row: ProductRow) => (
      <div className="space-y-0.5">
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.code}</p>
      </div>
    ),
    footer: (rows: ProductRow[]) => <span>Total: {rows.length}</span>
  },
  { field: "category", header: "Category", sortable: true },
  {
    field: "status",
    header: "Status",
    sortable: true,
    body: (row: ProductRow) => (
      <span
        className={
          row.status === "INSTOCK"
            ? "rounded px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700"
            : row.status === "LOWSTOCK"
              ? "rounded px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700"
              : "rounded px-2 py-1 text-xs font-semibold bg-rose-100 text-rose-700"
        }
      >
        {row.status}
      </span>
    )
  },
  {
    field: "price",
    header: "Price",
    sortable: true,
    align: "right",
    body: (row: ProductRow) => <span>{currency.format(row.price)}</span>,
    footer: (rows: ProductRow[]) => {
      const total = rows.reduce((sum, entry) => sum + entry.price, 0);
      return <span>{currency.format(total)}</span>;
    }
  }
];

export default function TemplateDatatableExample() {
  return (
    <SgDatatable
      id="datatable-template"
      title="Custom body and footer"
      value={PRODUCT_ROWS}
      columns={TEMPLATE_COLUMNS}
      dataKey="id"
      paginator
      rows={5}
      showGridlines
    />
  );
}
```

### Gerenciador de colunas, visibilidade e estilos

Mostra o gerenciador de colunas embutido e as props de visibilidade, ordem e estilo por coluna.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/colunas-e-estilos.tsx.sample`

```tsx
import React from "react";
import { SgDatatable, type SgDatatableColumn } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" }
];

const MANAGER_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  {
    field: "code",
    header: "Code",
    sortable: true,
    hideable: false,
    reorderable: false,
    width: 120,
    headerClassName: "uppercase tracking-[0.18em] text-[11px]"
  },
  {
    field: "name",
    header: "Product",
    sortable: true,
    minWidth: 220,
    body: (row) => (
      <div className="space-y-0.5">
        <div className="font-medium">{row.name}</div>
        <div className="text-xs text-muted-foreground">{row.category}</div>
      </div>
    ),
    bodyClassName: (row) => (row.status === "OUTOFSTOCK" ? "opacity-70" : undefined)
  },
  {
    field: "category",
    header: "Category",
    sortable: true,
    filter: true,
    filterPlaceholder: "Filter category",
    hidden: true
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    filter: true,
    filterPlaceholder: "Filter status"
  },
  {
    field: "stock",
    header: "Stock",
    sortable: true,
    align: "right",
    bodyClassName: (row) => (row.stock < 10 ? "font-semibold text-[rgb(var(--sg-warning-900))]" : undefined)
  }
];

export default function ColumnManagerDatatableExample() {
  return (
    <SgDatatable
      id="datatable-column-manager"
      title="Column manager and styled rows"
      value={PRODUCT_ROWS}
      columns={MANAGER_COLUMNS}
      dataKey="id"
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10]}
      showGlobalFilter
      showColumnFilters
      showClearFiltersButton
      showColumnManager
      columnManagerLabel="Manage columns"
      columnManagerMaxHeight={220}
      removableSort={false}
      rowClassName={(row) =>
        row.status === "OUTOFSTOCK"
          ? "bg-rose-500/15"
          : row.status === "LOWSTOCK"
            ? "bg-amber-500/15"
            : undefined
      }
    />
  );
}
```

### Coluna de ações com ícones

body desenha qualquer widget na célula; aqui, botões de ícone que usam a linha da própria célula.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/acoes.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgConfirmationDialog, SgDatatable, SgGrid, type SgDatatableColumn } from "@seedgrid/fe-components";
import { Pencil, Trash2 } from "lucide-react";

type PermissionRow = {
  id: number;
  name: string;
  description: string;
};

const PERMISSION_ROWS: PermissionRow[] = [
  { id: 1, name: "PERMIT_GET_ALL_SECRETS", description: "Permission to retrieve all secrets." },
  { id: 2, name: "PERMIT_GET_SECRET_BY_ID", description: "Permission to retrieve a secret by its ID." },
  { id: 3, name: "PERMIT_GET_SECRET_BY_NAME", description: "Permission to retrieve a secret by its name." },
  { id: 4, name: "PERMIT_CREATE_NEW_SECRET", description: "Permission to create a new secret." },
  { id: 5, name: "PERMIT_UPDATE_SECRET", description: "Permission to update an existing secret." },
  { id: 6, name: "PERMIT_DELETE_SECRET", description: "Permission to delete a secret." },
  { id: 7, name: "PERMIT_GET_ALL_USERS", description: "Permission to retrieve all users." },
  { id: 8, name: "PERMIT_GET_USER_BY_ID", description: "Permission to retrieve a user by ID." },
  { id: 9, name: "PERMIT_GET_USER_BY_NAME", description: "Permission to retrieve a user by name." },
  { id: 10, name: "PERMIT_GET_USER_BY_EMAIL", description: "Permission to retrieve a user by email." },
  { id: 11, name: "PERMIT_CREATE_USER", description: "Permission to create a user." },
  { id: 12, name: "PERMIT_DISABLE_USER", description: "Permission to disable a user account." }
];

export default function ActionsDatatableExample() {
  const [permissionRows, setPermissionRows] = React.useState<PermissionRow[]>(PERMISSION_ROWS);
  const [lastPermissionAction, setLastPermissionAction] = React.useState("none");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<PermissionRow | null>(null);

  const permissionColumns = React.useMemo<SgDatatableColumn<PermissionRow>[]>(() => [
    { field: "id", header: "ID", sortable: true, align: "left", width: 80 },
    { field: "name", header: "Name", sortable: true },
    { field: "description", header: "Description", sortable: true },
    {
      header: "Actions",
      align: "center",
      width: 120,
      body: (row) => (
        <SgGrid columns={2} gap={6} className="mx-auto max-w-[76px]">
          <SgButton size="sm" appearance="ghost" severity="secondary" iconOnly leftIcon={<Pencil className="size-4" />} aria-label={`Edit ${row.name}`} title={`Edit ${row.name}`} onClick={() => setLastPermissionAction(`edit: ${row.name}`)} />
          <SgButton
            size="sm"
            appearance="ghost"
            severity="danger"
            iconOnly
            leftIcon={<Trash2 className="size-4" />}
            aria-label={`Delete ${row.name}`}
            title={`Delete ${row.name}`}
            onClick={() => {
              setPendingDelete(row);
              setConfirmDeleteOpen(true);
            }}
          />
        </SgGrid>
      )
    }
  ], []);

  return (
    <>
      <SgDatatable
        id="datatable-actions"
        title="Permissions with row actions"
        value={permissionRows}
        columns={permissionColumns}
        dataKey="id"
        paginator
        rows={4}
        rowsPerPageOptions={[4, 8]}
        showGridlines
      />
      <SgConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        closeOnOverlayClick={false}
        severity="danger"
        title="Delete permission"
        message={pendingDelete ? `Confirm delete ${pendingDelete.name}?` : "Confirm delete?"}
        confirmButton={{ label: "Delete", icon: <Trash2 className="size-4" />, severity: "danger" }}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={() => {
          if (!pendingDelete) return;
          setPermissionRows((prev) => prev.filter((item) => item.id !== pendingDelete.id));
          setLastPermissionAction(`delete: ${pendingDelete.name}`);
          setConfirmDeleteOpen(false);
          setPendingDelete(null);
        }}
      />
      <p className="text-xs text-muted-foreground">last action: {lastPermissionAction}</p>
    </>
  );
}
```

### Controle externo de página e ordenação

A página e a ordenação são controladas por fora do componente, sem depender só da interação do usuário.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/controlado.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgDatatable, SgGrid, type SgDatatablePageEvent, type SgDatatableSortEvent, type SgDatatableSortOrder } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const BASE_COLUMNS = [
  { field: "code", header: "Code", sortable: true },
  { field: "name", header: "Name", sortable: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right" }
];

export default function ControlledDatatableExample() {
  const [controlledSort, setControlledSort] = React.useState<{ sortField: string | null; sortOrder: SgDatatableSortOrder }>({ sortField: "name", sortOrder: 1 });
  const [controlledPage, setControlledPage] = React.useState<{ first: number; rows: number }>({ first: 0, rows: 4 });

  return (
    <>
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => { setControlledSort({ sortField: "price", sortOrder: -1 }); setControlledPage({ first: 0, rows: controlledPage.rows }); }}>
          sort by price desc
        </SgButton>
        <SgButton appearance="outline" onClick={() => setControlledPage((prev) => ({ ...prev, first: Math.max(0, prev.first - prev.rows) }))}>
          prev page
        </SgButton>
        <SgButton appearance="outline" onClick={() => setControlledPage((prev) => ({ ...prev, first: prev.first + prev.rows }))}>
          next page
        </SgButton>
      </SgGrid>

      <SgDatatable
        id="datatable-controlled"
        title="Controlled state"
        value={PRODUCT_ROWS}
        columns={BASE_COLUMNS}
        dataKey="id"
        paginator
        rows={controlledPage.rows}
        first={controlledPage.first}
        sortField={controlledSort.sortField}
        sortOrder={controlledSort.sortOrder}
        onSort={(event: SgDatatableSortEvent) => setControlledSort({ sortField: event.sortField, sortOrder: event.sortOrder })}
        onPage={(event: SgDatatablePageEvent) => setControlledPage({ first: event.first, rows: event.rows })}
      />

      <p className="text-xs text-muted-foreground">
        sort: {controlledSort.sortField ?? "none"} ({controlledSort.sortOrder}) | first: {controlledPage.first} | rows: {controlledPage.rows}
      </p>
    </>
  );
}
```

### Server-side paginator (lazy)

lazy não filtra nem ordena: você entrega só a página atual em value e o total em totalRecords; onPage pede a próxima.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/server-side.tsx.sample`

```tsx
import React from "react";
import {
  SgDatatable,
  type SgDatatableColumn,
  type SgDatatableFilterEvent,
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
  type SgDatatableSortOrder,
} from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

type ServerQuery = {
  first: number;
  rows: number;
  sortField: string | null;
  sortOrder: SgDatatableSortOrder;
  globalFilter: string;
  filters: Record<string, string>;
};

type ServerResult = {
  data: ProductRow[];
  totalRecords: number;
};

const SERVER_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  { field: "code", header: "Code", sortable: true, filter: true, filterPlaceholder: "Filter code" },
  { field: "name", header: "Name", sortable: true, filter: true, filterPlaceholder: "Filter name" },
  { field: "category", header: "Category", sortable: true, filter: true, filterPlaceholder: "Filter category" },
  { field: "status", header: "Status", sortable: true, filter: true, filterPlaceholder: "Filter status" },
  { field: "price", header: "Price", sortable: true, align: "right" }
];

const SERVER_DATASET: ProductRow[] = Array.from({ length: 48 }, (_, index) => {
  const base = PRODUCT_ROWS[index % PRODUCT_ROWS.length]!;
  return {
    ...base,
    id: 1000 + index,
    code: `SRV-${String(index + 1).padStart(4, "0")}`,
    name: `${base.name} ${Math.floor(index / PRODUCT_ROWS.length) + 1}`,
    price: base.price + (index % 7) * 5,
    stock: Math.max(0, base.stock + (index % 9) - 4)
  };
});

function normalizeComparable(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function compareComparable(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
}

async function simulateProductsApi(query: ServerQuery): Promise<ServerResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  let filtered = [...SERVER_DATASET];
  const globalTerm = query.globalFilter.trim().toLowerCase();

  if (globalTerm) {
    filtered = filtered.filter((row) =>
      [row.code, row.name, row.category, row.status].some((value) =>
        normalizeComparable(value).includes(globalTerm)
      )
    );
  }

  for (const [field, term] of Object.entries(query.filters)) {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) continue;
    filtered = filtered.filter((row) => {
      const value = row[field as keyof ProductRow];
      return normalizeComparable(value).includes(normalizedTerm);
    });
  }

  if (query.sortField && query.sortOrder !== 0) {
    const factor = query.sortOrder === -1 ? -1 : 1;
    filtered.sort((rowA, rowB) => {
      const left = rowA[query.sortField as keyof ProductRow];
      const right = rowB[query.sortField as keyof ProductRow];
      return compareComparable(left, right) * factor;
    });
  }

  const totalRecords = filtered.length;
  const data = filtered.slice(query.first, query.first + query.rows);
  return { data, totalRecords };
}

export default function ServerSideDatatableExample() {
  const [serverQuery, setServerQuery] = React.useState<ServerQuery>({
    first: 0,
    rows: 4,
    sortField: "name",
    sortOrder: 1,
    globalFilter: "",
    filters: {}
  });
  const [serverRows, setServerRows] = React.useState<ProductRow[]>([]);
  const [serverTotalRecords, setServerTotalRecords] = React.useState(0);
  const [serverLoading, setServerLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setServerLoading(true);
      try {
        const response = await simulateProductsApi(serverQuery);
        if (cancelled) return;
        setServerRows(response.data);
        setServerTotalRecords(response.totalRecords);
      } finally {
        if (!cancelled) setServerLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [serverQuery]);

  return (
    <>
      <SgDatatable
        id="datatable-server"
        title="Server-side pagination"
        value={serverRows}
        columns={SERVER_COLUMNS}
        dataKey="id"
        lazy
        totalRecords={serverTotalRecords}
        paginator
        rows={serverQuery.rows}
        first={serverQuery.first}
        rowsPerPageOptions={[4, 8, 12]}
        sortField={serverQuery.sortField}
        sortOrder={serverQuery.sortOrder}
        onSort={(event: SgDatatableSortEvent) => setServerQuery((prev) => ({ ...prev, first: 0, sortField: event.sortField, sortOrder: event.sortOrder }))}
        showGlobalFilter
        globalFilter={serverQuery.globalFilter}
        showColumnFilters
        filters={serverQuery.filters}
        onFilter={(event: SgDatatableFilterEvent) => setServerQuery((prev) => ({ ...prev, first: 0, globalFilter: event.globalFilter, filters: event.filters }))}
        onPage={(event: SgDatatablePageEvent) => setServerQuery((prev) => ({ ...prev, first: event.first, rows: event.rows }))}
        loading={serverLoading}
        showClearFiltersButton
        stripedRows
        showGridlines
      />

      <p className="text-xs text-muted-foreground">
        current page rows: {serverRows.length} | total records: {serverTotalRecords}
      </p>
    </>
  );
}
```

### Loading e estado vazio

loading mostra a mensagem de carga; sem linhas, emptyMessage (ou o texto padrão do idioma).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/loading-e-vazio.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgDatatable, SgGrid } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const BASE_COLUMNS = [
  { field: "code", header: "Code", sortable: true },
  { field: "name", header: "Name", sortable: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right" }
];

export default function LoadingDatatableExample() {
  const [loading, setLoading] = React.useState(false);
  const [showEmpty, setShowEmpty] = React.useState(false);

  return (
    <>
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton appearance={loading ? "solid" : "outline"} onClick={() => setLoading((value) => !value)}>
          toggle loading
        </SgButton>
        <SgButton appearance={showEmpty ? "solid" : "outline"} onClick={() => setShowEmpty((value) => !value)}>
          toggle empty
        </SgButton>
      </SgGrid>

      <SgDatatable
        id="datatable-loading"
        title="Loading and empty"
        value={showEmpty ? [] : PRODUCT_ROWS}
        columns={BASE_COLUMNS}
        dataKey="id"
        loading={loading}
        emptyMessage="No products available."
      />
    </>
  );
}
```

### Modo cartões no celular (mobileMode)

Por padrão (mobileMode omitido) a tabela vira cartões "coluna: valor" quando o container tem menos de 600 px; mobileMode: cards força os cartões e scroll força a tabela, em qualquer largura. cardTitle usa a coluna como título do cartão e cardHidden a deixa de fora. Ordenação vira um seletor, os filtros vão para um painel aberto por botão; seleção, ações, rodapé e paginação continuam.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/modo-cartoes.tsx.sample`

```tsx
import React from "react";
import { SgDatatable, SgGrid, SgRadioGroup, type SgDatatableColumn } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const CARD_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  { field: "name", header: "Name", sortable: true, filter: true, cardTitle: true },
  { field: "code", header: "Code", sortable: true, filter: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right", footer: (rows) => rows.reduce((total, row) => total + row.stock, 0) },
  { field: "status", header: "Status", cardHidden: true }
];

export default function CardsDatatableExample() {
  const [mobileMode, setMobileMode] = React.useState<"cards" | "scroll">("cards");

  return (
    <SgGrid columns={1} gap={12}>
      <SgRadioGroup
        id="datatable-cards-mode"
        title="mobileMode"
        orientation="horizontal"
        source={[
          { label: "cards", value: "cards" },
          { label: "scroll", value: "scroll" }
        ]}
        value={mobileMode}
        onChange={(next) => setMobileMode(next === "scroll" ? "scroll" : "cards")}
      />
      <div className="mx-auto w-full max-w-[420px]">
        <SgDatatable
          id="datatable-cards"
          title="Product catalog (cards)"
          value={PRODUCT_ROWS}
          columns={CARD_COLUMNS}
          dataKey="id"
          mobileMode={mobileMode}
          selectionMode="single"
          showColumnFilters
          paginator
          rows={4}
        />
      </div>
    </SgGrid>
  );
}
```

### Rolagem infinita (infiniteScroll)

Sem paginador: ao rolar até perto do fim (toque, roda do mouse ou barra de rolagem) a tabela avança a página (rows) e acrescenta os próximos registros, com indicador de carregando e de fim da lista. Padrão ligado nos cartões e desligado na tabela; exige paginator. Com lazy, quem usa acrescenta a próxima página em value (first/rows/page em onPage/onLoadMore).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/rolagem-infinita.tsx.sample`

```tsx
import React from "react";
import { SgDatatable, SgGrid, SgRadioGroup, type SgDatatableColumn } from "@seedgrid/fe-components";

type ProductRow = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const PRODUCT_ROWS: ProductRow[] = [
  { id: 1, code: "P-1000", name: "Notebook Pro 14", category: "Computers", price: 1899, stock: 22, status: "INSTOCK" },
  { id: 2, code: "P-1001", name: "Mechanical Keyboard", category: "Accessories", price: 149, stock: 64, status: "INSTOCK" },
  { id: 3, code: "P-1002", name: "Ergonomic Mouse", category: "Accessories", price: 89, stock: 48, status: "INSTOCK" },
  { id: 4, code: "P-1003", name: "4K Monitor 27", category: "Monitors", price: 499, stock: 8, status: "LOWSTOCK" },
  { id: 5, code: "P-1004", name: "USB-C Dock", category: "Accessories", price: 219, stock: 11, status: "LOWSTOCK" },
  { id: 6, code: "P-1005", name: "Noise Cancelling Headset", category: "Audio", price: 329, stock: 31, status: "INSTOCK" },
  { id: 7, code: "P-1006", name: "Webcam 4K", category: "Video", price: 179, stock: 0, status: "OUTOFSTOCK" },
  { id: 8, code: "P-1007", name: "Portable SSD 2TB", category: "Storage", price: 259, stock: 19, status: "INSTOCK" },
  { id: 9, code: "P-1008", name: "Wi-Fi Router AX", category: "Networking", price: 199, stock: 5, status: "LOWSTOCK" },
  { id: 10, code: "P-1009", name: "Graphics Tablet", category: "Creative", price: 399, stock: 13, status: "INSTOCK" },
  { id: 11, code: "P-1010", name: "Studio Microphone", category: "Audio", price: 249, stock: 7, status: "LOWSTOCK" },
  { id: 12, code: "P-1011", name: "Smart Light Bar", category: "Home Office", price: 99, stock: 0, status: "OUTOFSTOCK" }
];

const CARD_COLUMNS: SgDatatableColumn<ProductRow>[] = [
  { field: "name", header: "Name", sortable: true, filter: true, cardTitle: true },
  { field: "code", header: "Code", sortable: true, filter: true },
  { field: "category", header: "Category", sortable: true },
  { field: "price", header: "Price", sortable: true, align: "right" },
  { field: "stock", header: "Stock", sortable: true, align: "right", footer: (rows) => rows.reduce((total, row) => total + row.stock, 0) },
  { field: "status", header: "Status", cardHidden: true }
];

export default function InfiniteScrollDatatableExample() {
  const [infiniteScroll, setInfiniteScroll] = React.useState(true);

  return (
    <SgGrid columns={1} gap={12}>
      <SgRadioGroup
        id="datatable-infinite-mode"
        title="infiniteScroll"
        orientation="horizontal"
        source={[
          { label: "true", value: "true" },
          { label: "false", value: "false" }
        ]}
        value={String(infiniteScroll)}
        onChange={(next) => setInfiniteScroll(next !== "false")}
      />
      <div className="mx-auto h-[360px] w-full max-w-[420px] overflow-auto rounded-md border border-border">
        <SgDatatable
          id="datatable-infinite"
          title="Product catalog (infinite scroll)"
          value={PRODUCT_ROWS}
          columns={CARD_COLUMNS}
          dataKey="id"
          mobileMode="cards"
          infiniteScroll={infiniteScroll}
          paginator
          rows={4}
        />
      </div>
    </SgGrid>
  );
}
```

### Idioma e textos (i18n)

Os textos internos vêm do dicionário components.datatable.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave. As props de texto (emptyMessage, columnManagerLabel, globalFilterPlaceholder e column.filterPlaceholder) vencem o dicionário; sem elas, vale components.datatable.*.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/idioma.tsx.sample`

```tsx
import React from "react";
import { SgDatatable, SgComponentsI18nProvider } from "@seedgrid/fe-components";

const COLUMNS = [
  { field: "code", header: "Código", filter: true, filterPlaceholder: "Digite o código" },
  { field: "name", header: "Nome", filter: true }
];

export default function App() {
  return (
    <SgComponentsI18nProvider
      locale="fr"
      messages={{ "components.datatable.empty": "Texto do dicionário (não aparece)" }}
    >
      <SgDatatable
        id="datatable-i18n"
        title="Produtos"
        value={[]}
        columns={COLUMNS}
        dataKey="code"
        showGlobalFilter
        showColumnFilters
        globalFilterPlaceholder="Buscar produtos"
        emptyMessage="Nenhum produto cadastrado."
      />
    </SgComponentsI18nProvider>
  );
}
```

### Desabilitado (enabled)

Com enabled={false} ordenação, seleção de linhas, filtros e gerenciador de colunas ficam bloqueados; paginação e rolagem continuam funcionando.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-datatable/samples/enabled.tsx.sample`

```tsx
import React from "react";
import { SgDatatable } from "@seedgrid/fe-components";

const ROWS = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Bruno" },
  { id: 3, name: "Carla" }
];

export default function App() {
  return (
    <SgDatatable
      id="datatable-enabled"
      title="Pessoas"
      value={ROWS}
      columns={[
        { field: "id", header: "ID", sortable: true },
        { field: "name", header: "Nome", sortable: true, filter: true }
      ]}
      dataKey="id"
      selectionMode="single"
      showGlobalFilter
      showColumnFilters
      enabled={false}
    />
  );
}
```

## Variação fora do showcase: ref imperativo

Não existe `.sample` para este caso; o bloco abaixo é uma variação escrita à mão, **não copiada do showcase** (compilada em rodada anterior, contra o código de então).

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
