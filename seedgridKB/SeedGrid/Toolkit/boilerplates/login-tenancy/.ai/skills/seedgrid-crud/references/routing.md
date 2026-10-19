# Routing And Proxy Standard

## Public Admin URLs

Always prefer `publicId` in URLs:

- list action to edit:
  - `/<entity>/<entity>_edit?publicId=<uuid>`
- proxy detail route:
  - `/api/admin/<entity>/{publicId}`

Do not expose numeric database `id` in the route when a `publicId` exists.

## Next Route Convention

Use Next API routes as server-side proxies:

- `app/api/admin/<entity>/route.ts`
- `app/api/admin/<entity>/[id]/route.ts`

What they do:

- forward headers/session to the backend
- normalize connection/session failures
- return controlled responses to the frontend

## Backend Convention

Administrative resources should:

- return both `id` and `publicId` in payloads when useful
- resolve detail/update/delete by `publicId`
- keep numeric `id` only for internal persistence and joins

## Breadcrumb And Menu

- Menu item should point to the real list route
- Breadcrumb items must use valid `href` values
- Parent sections like `/security` or `/comercial` must resolve to a real child route if there is no standalone page
