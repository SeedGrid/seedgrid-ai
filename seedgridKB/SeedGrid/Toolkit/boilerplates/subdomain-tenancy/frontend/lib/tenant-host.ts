// Resolucao do tenant a partir do cabecalho Host. Arquivo SEM imports (nem `server-only`, nem
// `next/headers`): e' usado por `lib/backend-fetch.ts` (BFF, via `headers()`) e por
// `lib/query-proxy.ts` (rewrite de `/api/q/**` no `proxy.ts`, via `request.headers`). Os dois tem de
// mandar EXATAMENTE o mesmo `X-Forwarded-Host` ao backend, que resolve o tenant por ele; uma regra
// so' garante isso.

/** Dominio master do tenancy (env `SEEDGRID_TENANCY_DOMAIN`, default `localhost`). */
export function tenancyDomain(): string {
  return process.env.SEEDGRID_TENANCY_DOMAIN?.trim().toLowerCase() || "localhost";
}

/**
 * Valor do `X-Forwarded-Host` para o Host recebido: o proprio dominio master (sem tenant) ou
 * `<tenant>.<dominio>`. Lanca `Error` com host fora do dominio ou subdominio invalido (inclui `master`).
 */
export function resolveTenantHost(rawHostHeader: string | null | undefined): string {
  const host = (rawHostHeader ?? "").toLowerCase().replace(/:\d+$/, "");
  const domain = tenancyDomain();
  if (host === domain) return domain;
  const suffix = `.${domain}`;
  if (!host.endsWith(suffix)) throw new Error("Dominio de acesso invalido.");
  const tenant = host.slice(0, -suffix.length);
  if (!/^[a-z0-9_]{5,50}$/.test(tenant) || tenant === "master") {
    throw new Error("Subdominio de acesso invalido.");
  }
  return `${tenant}.${domain}`;
}
