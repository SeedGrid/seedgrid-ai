// Resolucao do tenant a partir do cabecalho Host. Arquivo SEM imports (nem `server-only`, nem
// `next/headers`): e' usado por `lib/backend-fetch.ts` (BFF, via `headers()`) e por
// `lib/query-proxy.ts` (rewrite de `/api/q/**` no `proxy.ts`, via `request.headers`). Os dois tem de
// mandar EXATAMENTE o mesmo `X-Forwarded-Host` ao backend, que resolve o tenant por ele; uma regra
// so' garante isso.

/** Dominio master do tenancy (env `SEEDGRID_TENANCY_DOMAIN`, default `localhost`). */
export function tenancyDomain(): string {
  return process.env.SEEDGRID_TENANCY_DOMAIN?.trim().toLowerCase() || "localhost";
}

/** Host de acesso invalido (fora do dominio ou subdominio fora da regra): o BFF responde 400, nao 503. */
export class TenantHostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantHostError";
  }
}

/**
 * Valor do `X-Forwarded-Host` para o Host recebido: o proprio dominio master (sem tenant) ou
 * `<tenant>.<dominio>`. Lanca `TenantHostError` com host fora do dominio ou subdominio invalido (inclui `master`).
 */
export function resolveTenantHost(rawHostHeader: string | null | undefined): string {
  const host = (rawHostHeader ?? "").toLowerCase().replace(/:\d+$/, "");
  const domain = tenancyDomain();
  if (host === domain) return domain;
  const suffix = `.${domain}`;
  if (!host.endsWith(suffix)) throw new TenantHostError("Dominio de acesso invalido.");
  const tenant = host.slice(0, -suffix.length);
  // So letras minusculas, numeros e hifen (RFC 1123), 5 a 50; `_` nunca e aceito no host (o backend recusa).
  if (!/^[a-z0-9-]{5,50}$/.test(tenant) || tenant === "master") {
    throw new TenantHostError("Subdominio de acesso invalido.");
  }
  return `${tenant}.${domain}`;
}
