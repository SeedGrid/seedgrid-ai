# Routing And Proxy Standard

## Public URLs

Always prefer `publicId` in URLs:

- list action to edit:
  - `/<module>/<entity>/<entity>_edit?publicId=<uuid>`
- proxy detail route:
  - `/api/<module>/<entity>/{publicId}`

Do not expose the numeric database `id` in the route when a `publicId` exists.

## Pages

- `app/<module>/<entity>/page.tsx`: only `redirect("/<module>/<entity>/<entity>_list")`
- `app/<module>/<entity>/<entity>_list/page.tsx`
- `app/<module>/<entity>/<entity>_edit/page.tsx`

## Next Route Convention

Use Next API routes as server-side proxies:

- `app/api/<module>/<entity>/route.ts` (`GET` list, `POST` create)
- `app/api/<module>/<entity>/[id]/route.ts` (`GET`, `PUT`, `DELETE`; the `[id]` segment carries the
  `publicId`)

What they do:

- forward the session to the backend through the project's session-aware fetch helper
- keep the backend paths in one place (a `*Paths` helper in `lib/`), not scattered as strings
- return the backend response untouched on writes (passthrough helper)
- on reads, turn failures into `problem+json` with the **real status** (`problemResponse`); a session
  that expired or a backend that is down must never become an empty `200` page

```ts
export async function GET(request: Request) {
  const params = new URLSearchParams(new URL(request.url).searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  try {
    return NextResponse.json(await apiFetch<PaginatedResult<Entity>>(`${Paths.entity.base}${suffix}`));
  } catch (error) {
    return problemResponse(error);
  }
}
```

The client calls these routes with the project's HTTP client (`adminProxyClient` in the boilerplate)
and reads errors with `extractApiErrorMessage`.

## Backend Convention

Resources behind a CRUD should:

- return both `id` and `publicId` in payloads when useful
- resolve detail/update/delete by `publicId`
- keep numeric `id` only for internal persistence and joins
- paginate server-side (`page` 0-based, `size`, `sortField`, `sortOrder`) and answer
  `{ items, totalRecords, page, size, sortField, sortOrder, query }`

## Breadcrumb And Menu

- Menu item should point to the real list route
- Breadcrumb items must use valid `href` values
- Parent sections like `/security` must resolve to a real child route if there is no standalone page
- Registering the menu item, icon and permission is covered by the `sg-new-screen` skill
