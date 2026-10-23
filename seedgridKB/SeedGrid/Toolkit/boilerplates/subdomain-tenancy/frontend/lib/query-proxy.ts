import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_TOKEN_COOKIE } from "./admin-auth";
import { apiBaseUrl } from "./api-base-url";
import { QUERY_PROXY_PREFIX } from "./query-paths";
import { resolveTenantHost, tenancyDomain } from "./tenant-host";

// Consultas com corpo (metodo HTTP QUERY). Route Handler do Next responde 400 a QUERY, mas o
// `proxy.ts` consegue fazer `rewrite` para fora preservando metodo, query string e corpo, e injetar
// o `Authorization` a partir do cookie httpOnly (que o JS do browser nao le). Este arquivo e' a
// logica desse rewrite; o `proxy.ts` so' o chama para os caminhos `/api/q/**`.
//
//   browser:  QUERY /api/q/<caminho>?<qs>   (cookie de sessao, corpo JSON)
//   backend:  QUERY <SEEDGRID_APP_API_BASE_URL>/<caminho>?<qs>
//             (Authorization: Bearer <cookie> + X-Forwarded-Host = tenant, igual ao `backendFetch`)
//
// TENANT: o backend do subdomain-tenancy resolve o tenant pelo `X-Forwarded-Host`, e o BFF o poe em
// `lib/backend-fetch.ts`. O rewrite NAO passa pelo `backendFetch`, entao replica o mesmo cabecalho a
// partir de `lib/tenant-host.ts` (regra unica). Sem ele a consulta cairia no tenant errado.
// O `backendFetch` tambem descarta `X-Company-Id`; o rewrite faz o mesmo (nada de empresa por env).
//
// O proxy NAO renova token: se o backend responder 401, a resposta passa como esta e quem repete
// e' o helper `query()` (`lib/query.ts`), depois de chamar `/api/auth/refresh`.

function problem(status: number, title: string, code: string, headers?: Record<string, string>) {
  return NextResponse.json(
    { status, title, code },
    { status, headers: { "Content-Type": "application/problem+json", ...headers } },
  );
}

/**
 * Caminho do backend a partir de `/api/q/<resto>`, ou `null` se for invalido. Recusa vazio, `//`,
 * segmentos `.`/`..` (inclusive codificados) e barra invertida: o rewrite nao pode sair de
 * `<base da API>/` nem virar outro host.
 */
function backendPath(pathname: string): string | null {
  const rest = pathname.slice(QUERY_PROXY_PREFIX.length);
  if (!rest || rest.startsWith("/") || rest.includes("\\")) {
    return null;
  }
  for (const segment of rest.split("/")) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return null;
    }
    if (decoded === "." || decoded === ".." || decoded.includes("/") || decoded.includes("\\")) {
      return null;
    }
  }
  return rest;
}

export function proxyQuery(request: NextRequest): NextResponse {
  // So' QUERY: o metodo e' seguro (leitura) e passa no modo somente leitura da empresa. Aceitar
  // POST/DELETE aqui transformaria `/api/q/**` num proxy autenticado de escrita, fora do BFF.
  if (request.method !== "QUERY") {
    return problem(405, "Method Not Allowed", "QUERY_METHOD_REQUIRED", { Allow: "QUERY" });
  }

  const path = backendPath(request.nextUrl.pathname);
  if (!path) {
    return problem(400, "Bad Request", "QUERY_INVALID_PATH");
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  // Sem sessao nenhuma: 401 JSON (e' um fetch; redirect para /login estouraria o `.json()` do
  // client). Com so' o refresh token (access vencido/ausente) segue SEM Authorization: o backend
  // responde 401 e o `query()` renova e repete.
  if (!token && !refreshToken) {
    return problem(401, "Unauthorized", "NO_SESSION");
  }

  // Tenant pelo Host, como o BFF (`backendHost`). Host fora do dominio / subdominio invalido: 400.
  // Dominio master puro (sem tenant): o `backendFetch` so' o aceita em /public/tenants; consulta
  // autenticada nao tem tenant para resolver.
  let forwardedHost: string;
  try {
    forwardedHost = resolveTenantHost(request.headers.get("host"));
  } catch {
    return problem(400, "Bad Request", "QUERY_INVALID_HOST");
  }
  if (forwardedHost === tenancyDomain()) {
    return problem(400, "Bad Request", "QUERY_TENANT_REQUIRED");
  }

  const headers = new Headers(request.headers);
  // Nada do que o browser mandou de credencial/identidade/tenant vai ao backend: o BFF decide.
  headers.delete("authorization");
  headers.delete("x-company-id");
  headers.delete("cookie");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("X-Forwarded-Host", forwardedHost);

  const target = new URL(`${apiBaseUrl.replace(/\/+$/, "")}/${path}${request.nextUrl.search}`);
  return NextResponse.rewrite(target, { request: { headers } });
}
