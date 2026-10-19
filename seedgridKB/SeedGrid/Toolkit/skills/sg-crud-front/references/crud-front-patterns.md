# CRUD Page Pattern

Use this structure for every entity CRUD.

## 1. List Page

File pattern:

- `app/<module>/<entity>/<entity>_list/page.tsx`

Responsibilities:

- Load paginated server-side data through `/api/<module>/<entity>`
- Render `SgDatatable`
- Render `SgInputTextSearch`
- Show `ListLoadError` (with retry) instead of the table when the load fails
- Support sort, page, and empty states
- Navigate to `<entity>_edit`
- Gate actions by permission

Expected behavior:

- `Novo` button opens `<entity>_edit`
- edit action opens `<entity>_edit?publicId=...`
- delete action opens an `SgConfirmationDialog` (never `window.confirm`); only on
  confirm does it call `/api/<module>/<entity>/{publicId}`
- success returns to the list with a query flag such as `?saved=created`

Toolbar layout:

- Use `SgStack direction="row" align="end" gap={12} wrap`, not a 50/50 `SgGrid`
- `SgInputTextSearch` grows inside `<div style={{ flex: 1, minWidth: 240 }}>`
- `Novo` button stays compact (`label="Novo"`, `size="md"`) and is height-matched
  to the input with `style={{ height: 44 }}` (input is `h-11`, button `md` is
  `h-10`)

Recommended state shape:

```ts
type QueryState = {
  page: number;
  rows: number;
  search: string;
  sortField: string;
  sortOrder: "asc" | "desc";
};
```

## 2. Edit Page

File pattern:

- `app/<module>/<entity>/<entity>_edit/page.tsx`

Responsibilities:

- Read `publicId` from `searchParams`
- If `publicId` exists, load the entity through `/api/<module>/<entity>/{publicId}`
- If absent, open in create mode
- Save through `POST` or `PUT`
- Redirect back to `<entity>_list`

Expected behavior:

- Dedicated page only, never inline edit inside the list
- Use SeedGrid form controls
- Show skeleton while loading existing data
- Show user-facing save errors (`extractApiErrorMessage` with a generic fallback)
- On success, go back to the list with `?saved=created` / `?saved=updated`; the list shows the toast (`useSavedToast`)

### Input type by data type

Match the input to the field's data type. Do **not** use `SgInputText` for
numbers or money: it accepts letters and only fails at submit.

| Field kind | Component | Key props | Parse on submit |
| --- | --- | --- | --- |
| Money (price, fee, overage, balance) | `SgInputCurrency` | `currency="BRL"`, `decimals={2}`, `minValue={0}` | `parseDecimalInput` |
| Integer count (requests, users, qty, billing day) | `SgInputNumber` | `decimals={0}`, `minValue={...}` | `Number.parseInt(v, 10)` |
| Decimal non-money (rate, factor) | `SgInputNumber` | `decimals={2}` | `parseDecimalInput` |
| Date | `SgInputDate` | `minDate`, `maxDate` | ISO on submit |
| Birth date | `SgInputBirthDate` | `minAge` | ISO on submit |
| CPF / CNPJ / either | `SgInputCPF` / `SgInputCNPJ` / `SgInputCPFCNPJ` | `required` | `onlyDigits` if the API wants digits |
| Phone | `SgInputPhone` | `required` | `onlyDigits` if the API wants digits |
| Postal code | `SgInputPostalCode` | `country`, `validateWithViaCep` (BR, opt-in) | `onlyDigits` if the API wants digits |
| E-mail | `SgInputEmail` | `required` | trim |
| Free text | `SgInputText` | — | trim |

Both numeric inputs are controlled via `inputProps={{ value }}` and emit a string
through `onChange`. Keep form state as the raw string; convert only on submit.

```tsx
// money
<SgInputCurrency
  id="<entity>-price"
  label="Preco mensal"
  currency="BRL"
  decimals={2}
  minValue={0}
  inputProps={{ value: form.price }}
  onChange={(price) => setForm((f) => ({ ...f, price }))}
/>

// integer count
<SgInputNumber
  id="<entity>-requests"
  label="Requests/mes"
  decimals={0}
  minValue={1}
  inputProps={{ value: form.requests }}
  onChange={(requests) => setForm((f) => ({ ...f, requests }))}
/>
```

## 3. Shell Copy

Use business language, not implementation language.

Good:

- `Consulte os planos disponiveis`
- `Atualize as informacoes do usuario`

Bad:

- `listagem administrativa paginada no servidor`
- `debounce, distinct e cancelamento`
- `pagina dedicada`

## 4. Skeleton Pattern

The table loading state must read as a table, not a single grey rectangle. Use a
table-shaped skeleton: one header row plus several body rows of `shape="text"`
skeletons, so the placeholder suggests multiple columns and fields.

Prefer the shared `DatatableSkeleton` helper (in `app/components`) and match the
real column count and page size:

```tsx
{loading ? (
  <DatatableSkeleton columns={columns.length} rows={Math.min(queryState.rows, 8)} />
) : (
  <SgDatatable ... />
)}
```

Underlying structure the helper renders (replicate if a shared helper is not
available):

```tsx
<div className="overflow-hidden rounded-lg border border-border">
  <div className="grid gap-3 border-b border-border p-3" style={{ gridTemplateColumns }}>
    {/* one text skeleton per column = header */}
  </div>
  {/* N rows, each with one text skeleton per column, last:border-b-0 */}
</div>
```

Do not use a single `<SgSkeleton shape="rectangle" />` for table loading. Cap the
row count (e.g. `Math.min(pageSize, 8)`) so large page sizes do not render dozens
of skeleton rows.

Form/edit pages may still use a single rectangular `SgSkeleton` while loading the
entity.

## 5. Status Badge Colors (boolean columns)

Boolean state columns (active, 2FA, integration, etc.) must read at a glance with
strong semantic colors — never a washed-out `secondary` grey for the "off" state.
Use `StatusBadge` with an explicit `severity`:

- The neutral/desirable state is `success` (green).
- The opposite state is `danger` (red).
- Do not use `secondary` or `info` for these two-state columns.

```tsx
// active / enabled
<StatusBadge severity={row.active ? "success" : "danger"} value={row.active ? "ATIVO" : "INATIVO"} />

// 2FA
<StatusBadge severity={row.twoFactorEnabled ? "success" : "danger"} value={row.twoFactorEnabled ? "ATIVO" : "DESATIVADO"} />
```

Pick which boolean value is green by meaning, not by `true`/`false`. For example a
role's "for integration" flag is the exception: a non-integration role is the safe
default (`success`/green) and an integration role is flagged (`danger`/red):

```tsx
<StatusBadge severity={row.forIntegration ? "danger" : "success"} value={row.forIntegration ? "SIM" : "NAO"} />
```
