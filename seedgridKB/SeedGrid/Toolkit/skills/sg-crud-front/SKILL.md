---
name: sg-crud-front
description: Create or refactor SeedGrid CRUD flows in a Next.js app built on the SeedGrid boilerplate, using the project standard of separate `*_list` and `*_edit` pages, `publicId` routing, Next API proxy routes, and SeedGrid components. Use when you need to build or standardize an entity CRUD (users, roles, plans, API keys, audit screens, etc.) with `SgDatatable`, `SgInputTextSearch`, permissions, user-facing copy, and menu/breadcrumb integration.
---

# SeedGrid CRUD

Build SeedGrid CRUDs with the structure of the boilerplate's `users` and `roles` screens
(`app/security/users/user_list`, `user_edit`; `app/security/roles/role_list`, `role_edit`). Keep the
pages user-facing, consistent, and navigable through `SgMenu` and `SgBreadcrumb`.

Read the existing screens of the project before writing a new one and copy their conventions (imports,
hooks, helpers). The names below (`Shell`, `useSavedToast`, `ListLoadError`, `adminProxyClient`, ...)
are the boilerplate's own; if the project names them differently, use the project's equivalents.

To register the menu item, icon and permission of a new screen, use the `sg-new-screen` skill.

## Workflow

1. Identify the entity, its permissions, and the backend endpoints that already exist (do not invent
   endpoints; check the backend or the SeedGrid knowledge base in `.ai/brain/`).
2. Create the pages under `app/<module>/<entity>/`:
   - `<entity>_list/page.tsx`: table, search, pagination, sort and actions
   - `<entity>_edit/page.tsx`: create/update in a dedicated page
   - `page.tsx`: `redirect("/<module>/<entity>/<entity>_list")`
3. Prefer `publicId` in URLs and route params. Keep the numeric `id` internal only.
4. Use Next API routes in `app/api/<module>/<entity>/` as server-side proxies to the backend.
5. Use SeedGrid components for the whole UI structure.
6. Write user-facing labels and descriptions. Do not expose technical implementation details in the UI.
7. Validate navigation, permission gates, and loading/error states.

## Required Patterns

- Use the list/edit split described in `references/patterns.md`.
- Use `publicId` routing and proxy conventions from `references/routing.md`.
- Use `SgInputTextSearch` as the standard remote-search input.
- Use the checklist in `references/checklist.md` before closing the task.

## Required UI Components

- Layout/navigation: `Shell`, `SgMenu`, `SgBreadcrumb`, `SgCard`, `SgStack`, `SgGrid`
- Listing: `SgDatatable`, `DatatableSkeleton` (table-shaped loading), `StatusBadge`, `ListLoadError`
- Search: `SgInputTextSearch`
- Destructive confirmation: `SgConfirmationDialog`
- Feedback: `toast` from `@seedgrid/fe-components`
- Edit: `SgInputText`, `SgInputNumber`, `SgInputCurrency`, `SgInputPassword`, `SgInputDate`, `SgToggleSwitch`, `SgButton` as applicable

## Input Type Standard

Never use `SgInputText` (or a raw text input with `inputMode`) for numeric or
monetary fields — it lets the user type letters and the value only fails at
submit. Match the input component to the data type:

- **Monetary value** (price, fee, overage, balance) → `SgInputCurrency`
  with `currency="BRL"`, `decimals={2}`, `minValue={0}` (or `allowNegative`
  when negatives are valid). Read it back with `parseDecimalInput` from
  `@/lib/format` (handles the pt-BR comma).
- **Integer count** (requests, users, quantity, day-of-month) → `SgInputNumber`
  with `decimals={0}` and an appropriate `minValue`. Parse with
  `Number.parseInt(value, 10)`.
- **Decimal non-money** (rates, factors) → `SgInputNumber` with the needed
  `decimals` and `parseDecimalInput`.
- **Date** → `SgInputDate`. **Free text** → `SgInputText`.

Both `SgInputCurrency` and `SgInputNumber` are controlled via
`inputProps={{ value }}` and report back a string through `onChange`. Keep the
form state as the raw string and convert only on submit.

## Search Standard

For searchable lists:

- Use `SgInputTextSearch` by name, not an ad-hoc input.
- Apply minimum 3 characters.
- Use debounce and distinct semantics.
- Cancel in-flight requests when the query changes (an RxJS `Subject` + `switchMap`, with an
  `AbortController` aborted on unsubscribe).
- Keep the request server-side paginated and sortable.

### Server-side `LIKE` must be a PREFIX match

The backend that feeds the `SgDatatable` binds the search term as `term + "%"`, never
`"%" + term + "%"`. A leading wildcard makes the database unable to use the column index, so every
keystroke turns the list query into a full table scan — the cost grows with the table, exactly where
it hurts most.

```java
// CORRECT — uses the index
queryObj.setParameter("term", query + "%");
// WRONG — scans the whole table
queryObj.setParameter("term", "%" + query + "%");
```

The JPQL/Panache clause itself does not change (`lower(u.name) LIKE :term`); only the bound value
does. Trade-off accepted deliberately: the user finds "AVENTAL IMPERIO" by typing `avental`, not by
typing `imperio`.

Equality (`= :param`) stays the right call for codes/IDs and for closed option lists (the filter fed
by a `DISTINCT`, rendered as `SgCombobox`/`SgAutocomplete`), where no `LIKE` is needed at all.

### Critical RxJS pitfall (incremental search must keep working)

The debounce in `SgInputTextSearch` lives inside an `useEffect` subscription. Do
**not** put the `onSearchChange`/`onChange` callbacks in that effect's dependency
array. Parent pages recreate those callbacks on every render (and each keystroke
triggers a parent re-render via `setRawSearch`), so a callback-dependent effect
tears down and re-subscribes on every keystroke. The cleanup `unsubscribe()`
cancels the pending `debounceTime` timer, so the debounced value never reaches
`onSearchChange` and the search silently never fires.

Correct pattern: hold the latest callback in a `useRef`, keep the subscription
effect dependencies limited to stable values (`changes$`, `debounceMs`,
`minChars`), and call `onSearchChangeRef.current(...)` inside the subscriber.

```ts
const onSearchChangeRef = useRef(onSearchChange);
onSearchChangeRef.current = onSearchChange;

useEffect(() => {
  const subscription = changes$
    .pipe(map((raw) => raw.trim()), debounceTime(debounceMs), distinctUntilChanged())
    .subscribe((next) => {
      if (next.length === 0 || next.length >= minChars) {
        onSearchChangeRef.current(next);
      }
    });
  return () => subscription.unsubscribe();
}, [changes$, debounceMs, minChars]); // never include the callbacks here
```

The parent does not need `useCallback` for this to work — the component must be
robust to recreated callbacks on its own.

## List Toolbar Layout Standard

The list header (search + `Novo` action) must not split the row into two equal
halves. The search is the primary control and should dominate the width.

- Lay the toolbar out with `SgStack direction="row" align="end" gap={12} wrap`
  (not a 50/50 `SgGrid`).
- Wrap `SgInputTextSearch` in a growing container so it takes the remaining
  space: `<div style={{ flex: 1, minWidth: 240 }}>`.
- Keep the create button compact: short label (`Novo`, not `Novo usuario`) and
  `size="md"`.
- The button is shorter than the input by default. `SgInputText` is `h-11`
  (44px); `SgButton size="md"` is `h-10` (40px). Match them with
  `style={{ height: 44 }}` so the button lines up with the field.
- `align="end"` keeps the button aligned to the input's baseline (the input has
  a label above it).
- `wrap` lets them stack on narrow viewports.

```tsx
<SgStack align="end" direction="row" gap={12} wrap>
  <div style={{ flex: 1, minWidth: 240 }}>
    <SgInputTextSearch id="<entity>-search" label="Busca por nome" ... />
  </div>
  {canCreate ? (
    <SgButton
      appearance="outline"
      label="Novo"
      leftIcon={<Plus size={16} />}
      severity="secondary"
      size="md"
      style={{ height: 44 }}
      onClick={() => router.push("/<module>/<entity>/<entity>_edit")}
    />
  ) : null}
</SgStack>
```

## Destructive Action Standard

Delete (and any irreversible action) must use `SgConfirmationDialog`, never the
native `window.confirm`. The native dialog is the wrong, inconsistent popup.

- Drive the dialog with controlled state: a single `entityToDelete` state opens
  it (`open={entityToDelete !== null}`).
- The row action only sets state (`onClick={() => setEntityToDelete(row)}`); it
  does not perform the delete.
- Run the request in `onConfirm`. Keep the dialog open during the async call
  with `closeOnConfirm={false}`, show progress on the confirm button
  (`label: deleting ? "Excluindo..." : "Excluir"`, `disabled: deleting`), and
  clear the state in a `finally` to close it.
- Use `severity="danger"`, a user-facing title and message that names the entity
  and warns the action cannot be undone.
- After deleting the last row on a page, step `page` back by one (mirror the
  existing list paging logic).

```tsx
<SgConfirmationDialog
  open={entityToDelete !== null}
  severity="danger"
  title="Excluir <entity>"
  message={entityToDelete ? `Tem certeza que deseja excluir "${entityToDelete.name}"? Esta acao nao pode ser desfeita.` : ""}
  confirmButton={{ label: deleting ? "Excluindo..." : "Excluir", severity: "danger", disabled: deleting }}
  cancelButton={{ label: "Cancelar", disabled: deleting }}
  closeOnConfirm={false}
  onConfirm={() => void confirmDelete()}
  onCancel={() => setEntityToDelete(null)}
/>
```

## Permission Standard

- Hide menu entries if the user lacks view permission.
- Hide create/edit/delete actions if the user lacks the corresponding permission.
- If the page is opened without permission, render a proper blocked state (a `Shell` with a
  "Sem permissao" card) instead of failing.
- Permissions are checked in the UI **and** enforced by the backend; the UI gate is only for
  usability.

## Error And Fallback Standard

- A load failure must never look like an empty list. Keep the error in its own state and render
  `ListLoadError` (with a retry) **instead of** the table; do not fall through to "Nenhum registro
  encontrado".
- If the backend is unavailable or the session is invalid, proxy routes return the real error status
  as `problem+json` (use the project's `problemResponse`), never a `200` with an empty page.
- Show the message from the backend with `extractApiErrorMessage`, falling back to a generic
  user-facing text.
- Avoid uncaught runtime failures: every request has a `catch` that ends in a visible state.
