import "server-only";
import { headers as requestHeaders } from "next/headers";

export async function backendHost(): Promise<string> {
  const incoming = await requestHeaders();
  const rawHost = incoming.get("host")?.toLowerCase() ?? "";
  const host = rawHost.replace(/:\d+$/, "");
  const domain = process.env.SEEDGRID_TENANCY_DOMAIN?.trim().toLowerCase() || "localhost";
  if (host === domain) return domain;
  const suffix = `.${domain}`;
  if (!host.endsWith(suffix)) throw new Error("Dominio de acesso invalido.");
  const tenant = host.slice(0, -suffix.length);
  if (!/^[a-z0-9_]{5,50}$/.test(tenant) || tenant === "master") {
    throw new Error("Subdominio de acesso invalido.");
  }
  return `${tenant}.${domain}`;
}

export async function backendFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const host = await backendHost();
  headers.set("X-Forwarded-Host", host);
  headers.delete("X-Company-Id");
  const target = new URL(url);
  const domain = process.env.SEEDGRID_TENANCY_DOMAIN?.trim().toLowerCase() || "localhost";
  if (host === domain && !target.pathname.startsWith("/public/tenants")) {
    throw new Error("Informe o subdominio da empresa para acessar.");
  }
  const method = options.method?.toUpperCase();
  // Escritas usam o contrato restrito da extensão Security, separado do CRUD administrativo completo.
  if ((method === "POST" && target.pathname === "/users")
      || (method === "PATCH" && /^\/users\/[^/]+$/.test(target.pathname))) {
    target.pathname = `/app/security${target.pathname}`;
  }
  return fetch(target, { ...options, headers, cache: "no-store" });
}
