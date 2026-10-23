// `X-Forwarded-Host` que o admin manda ao backend: SEMPRE o dominio master (`SEEDGRID_TENANCY_DOMAIN`,
// default `localhost`); o admin nao e' escopado por subdominio de tenant. Arquivo SEM imports: e'
// usado por `lib/backend-fetch.ts` (BFF) e por `lib/query-proxy.ts` (rewrite de `/api/q/**` no
// `proxy.ts`), que tem de mandar EXATAMENTE o mesmo valor.
export function adminForwardedHost(): string {
  return process.env.SEEDGRID_TENANCY_DOMAIN?.trim() || "localhost";
}
