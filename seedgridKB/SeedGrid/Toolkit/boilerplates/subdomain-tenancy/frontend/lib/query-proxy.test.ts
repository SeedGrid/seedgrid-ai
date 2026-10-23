import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TOKEN_COOKIE } from "./admin-auth";

// O rewrite de `/api/q/**` tem de mandar ao backend o MESMO `X-Forwarded-Host` que o BFF
// (`backendFetch`) manda; senao a consulta QUERY cairia no tenant errado. Aqui os dois caminhos
// recebem o mesmo Host e o resultado e' comparado.
vi.mock("server-only", () => ({}));
let incomingHost: string | null = null;
vi.mock("next/headers", () => ({
  headers: async () => new Headers(incomingHost ? { host: incomingHost } : {}),
}));

import { backendFetch } from "./backend-fetch";
import { proxyQuery } from "./query-proxy";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function bffForwardedHost(host: string): Promise<string | null> {
  incomingHost = host;
  const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  await backendFetch("http://127.0.0.1:8085/users/search", { method: "POST", headers: { "X-Company-Id": "x" } });
  const init = (fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[1];
  return new Headers(init.headers).get("x-forwarded-host");
}

function rewriteForwardedHost(host: string): string | null {
  const request = new NextRequest("http://localhost:3002/api/q/users/search", {
    method: "QUERY",
    headers: { host, cookie: `${ADMIN_TOKEN_COOKIE}=tok` },
  });
  return proxyQuery(request).headers.get("x-middleware-request-x-forwarded-host");
}

describe("QUERY (rewrite) x BFF: mesmo X-Forwarded-Host", () => {
  it.each(["acmeco.localhost:3002", "Outra_Emp.localhost", "tenant_01.localhost:80"])("host %s", async (host) => {
    const bff = await bffForwardedHost(host);
    expect(bff).not.toBeNull();
    expect(rewriteForwardedHost(host)).toBe(bff);
  });

  it("com SEEDGRID_TENANCY_DOMAIN customizado", async () => {
    vi.stubEnv("SEEDGRID_TENANCY_DOMAIN", "app.exemplo.com.br");
    const bff = await bffForwardedHost("acmeco.app.exemplo.com.br");
    expect(bff).toBe("acmeco.app.exemplo.com.br");
    expect(rewriteForwardedHost("acmeco.app.exemplo.com.br")).toBe(bff);
  });

  it("hosts que o BFF recusa, o rewrite tambem recusa (sem rewrite)", async () => {
    for (const host of ["evil.com", "master.localhost", "abc.localhost", "localhost"]) {
      incomingHost = host;
      vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
      await expect(backendFetch("http://127.0.0.1:8085/users/search")).rejects.toThrow();
      const response = proxyQuery(
        new NextRequest("http://localhost:3002/api/q/users/search", {
          method: "QUERY",
          headers: { host, cookie: `${ADMIN_TOKEN_COOKIE}=tok` },
        }),
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    }
  });
});
