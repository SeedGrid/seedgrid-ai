import "server-only";
import { headers as requestHeaders } from "next/headers";
import { resolveTenantHost, tenancyDomain } from "./tenant-host";

export async function backendHost(): Promise<string> {
  const incoming = await requestHeaders();
  return resolveTenantHost(incoming.get("host"));
}

export async function backendFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const host = await backendHost();
  headers.set("X-Forwarded-Host", host);
  headers.delete("X-Company-Id");
  const target = new URL(url);
  const domain = tenancyDomain();
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
