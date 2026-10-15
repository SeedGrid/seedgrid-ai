# Delivery Checklist

Before finishing a CRUD task, verify:

- Menu entry exists only if the user has view permission
- `SgMenu` and `SgBreadcrumb` navigate to valid routes
- There are two pages, `*_list` and `*_edit`, plus a `page.tsx` that redirects to the list
- `SgInputTextSearch` is used for remote search when the list is searchable
- Search uses min 3 chars and cancels in-flight requests
- `SgInputTextSearch` keeps its RxJS subscription stable: callbacks live in a `useRef`, never in the subscription effect's deps (otherwise per-keystroke re-subscribes cancel the debounce and search stops firing)
- Typing in the search field actually triggers requests (verify incremental search end-to-end, not just that it renders)
- Backend `LIKE` filters bind `term + "%"` (prefix), never `"%" + term + "%"`
- `SgDatatable` is server-paginated and sortable
- Column layout persistence uses the project environment pattern when available
- Edit and delete actions are permission-gated
- Delete uses a controlled `SgConfirmationDialog` (`severity="danger"`), never `window.confirm`; request runs in `onConfirm` with `closeOnConfirm={false}` and a busy/disabled confirm button
- List toolbar uses `SgStack` row with the search growing (`flex: 1`) and a compact `Novo` button, height-matched to the input (`style={{ height: 44 }}`), not a 50/50 `SgGrid`
- `publicId` is used in the edit URL and in the detail/update/delete proxy routes
- Edit page uses SeedGrid form components
- Numeric and monetary fields use the right input type, never `SgInputText`: `SgInputCurrency` (`currency="BRL"`, `decimals={2}`) for money; `SgInputNumber` (`decimals={0}`) for integer counts. Verify the field rejects letters at type-time, not only at submit
- Copy is user-facing, not technical
- Table loading uses a table-shaped skeleton (`DatatableSkeleton`: header + body rows, column count matching the table), not a single rectangle; row count is capped (e.g. `Math.min(pageSize, 8)`). Edit/form pages may still use a rectangular `SgSkeleton`
- A list load failure shows `ListLoadError` (with retry) instead of the table, never an empty list
- Proxy routes return the real error status as `problem+json` for invalid session and connection failure, without crashing the page
- TypeScript passes

Recommended verification command, in the folder of the Next.js app (`frontend/` in the boilerplate):

```bash
npx tsc --noEmit --pretty false
```
