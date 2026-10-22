import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_TOKEN_COOKIE } from "./lib/admin-auth";
import { config, proxy } from "./proxy";

// `proxy.ts`: (1) `/api/q/**` -> rewrite para a API com Authorization do cookie, preservando
// metodo/corpo/query string (ADR 28); (2) nao-regressao do comportamento anterior.
const API = "http://127.0.0.1:8080";

type Init = { method?: string; cookies?: Record<string, string>; headers?: Record<string, string>; body?: string };

function request(path: string, init: Init = {}) {
  const cookie = Object.entries(init.cookies ?? {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`http://localhost:3000${path}`, {
    method: init.method ?? "GET",
    headers: { ...(cookie ? { cookie } : {}), ...init.headers },
    body: init.body,
  });
}

const forwarded = (response: Response, name: string) => response.headers.get(`x-middleware-request-${name}`);
const rewriteOf = (response: Response) => response.headers.get("x-middleware-rewrite");
const redirectOf = (response: Response) => response.headers.get("location");

const session = { [ADMIN_TOKEN_COOKIE]: "tok-123", [ADMIN_REFRESH_TOKEN_COOKIE]: "ref-456" };

describe("proxy: /api/q/** (QUERY)", () => {
  it("QUERY com sessao: rewrite para a API, com Authorization e metodo/corpo preservados", async () => {
    const req = request("/api/q/audit-logs/search?size=10&page=2", {
      method: "QUERY",
      cookies: session,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "User" }),
    });

    const response = proxy(req);

    expect(rewriteOf(response)).toBe(`${API}/audit-logs/search?size=10&page=2`);
    expect(forwarded(response, "authorization")).toBe("Bearer tok-123");
    expect(forwarded(response, "content-type")).toBe("application/json");
    // o proxy so' reescreve: metodo e corpo da requisicao original seguem intactos
    expect(req.method).toBe("QUERY");
    expect(await req.text()).toBe('{"entity":"User"}');
  });

  it("nao repassa Authorization, X-Company-Id nem cookies vindos do browser", () => {
    const response = proxy(
      request("/api/q/users/search", {
        method: "QUERY",
        cookies: session,
        headers: { Authorization: "Bearer forjado", "X-Company-Id": "outra-empresa" },
      }),
    );

    expect(forwarded(response, "authorization")).toBe("Bearer tok-123");
    expect(forwarded(response, "x-company-id")).toBeNull();
    expect(forwarded(response, "cookie")).toBeNull();
  });

  it("caminho com ponto nao e' tratado como estatico", () => {
    const response = proxy(request("/api/q/files/relatorio.v2/list", { method: "QUERY", cookies: session }));
    expect(rewriteOf(response)).toBe(`${API}/files/relatorio.v2/list`);
  });

  it("so' com o refresh token: segue SEM Authorization (o query() renova no 401)", () => {
    const response = proxy(
      request("/api/q/users/search", { method: "QUERY", cookies: { [ADMIN_REFRESH_TOKEN_COOKIE]: "ref-456" } }),
    );
    expect(rewriteOf(response)).toBe(`${API}/users/search`);
    expect(forwarded(response, "authorization")).toBeNull();
  });

  it("sem cookie de sessao: 401 JSON, sem redirect para /login", async () => {
    const response = proxy(request("/api/q/users/search", { method: "QUERY" }));

    expect(response.status).toBe(401);
    expect(redirectOf(response)).toBeNull();
    expect(rewriteOf(response)).toBeNull();
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect(await response.json()).toMatchObject({ status: 401, code: "NO_SESSION" });
  });

  it("outro metodo que nao QUERY: 405 com Allow: QUERY (nao vira proxy de escrita)", () => {
    for (const method of ["GET", "POST", "DELETE"]) {
      const response = proxy(request("/api/q/users/1", { method, cookies: session }));
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("QUERY");
      expect(rewriteOf(response)).toBeNull();
    }
  });

  it.each(["/api/q/", "/api/q//evil.com/x", "/api/q/a%2F..%2Fb", "/api/q/a%5Cb"])(
    "caminho invalido %s: 400",
    (path) => {
      const response = proxy(request(path, { method: "QUERY", cookies: session }));
      expect(response.status).toBe(400);
      expect(rewriteOf(response)).toBeNull();
    },
  );

  it("'..' literal ou codificado nunca sai de <base da API>/ (a URL ja normaliza; o proxy confere o resto)", () => {
    for (const path of ["/api/q/a/../b", "/api/q/a/%2e%2e/b", "/api/q/../../x"]) {
      const target = rewriteOf(proxy(request(path, { method: "QUERY", cookies: session })));
      // normalizado para fora de /api/q/ (segue o fluxo normal, sem rewrite) ou dentro da base
      expect(target === null || target.startsWith(`${API}/`)).toBe(true);
    }
  });

  it("usa SEEDGRID_APP_API_BASE_URL (sem barra final) e injeta SEEDGRID_APP_API_COMPANY_ID quando definido", async () => {
    vi.stubEnv("SEEDGRID_APP_API_BASE_URL", "https://api.exemplo.com/");
    vi.stubEnv("SEEDGRID_APP_API_COMPANY_ID", "company-9");
    vi.resetModules();
    try {
      const fresh = await import("./proxy");
      const response = fresh.proxy(request("/api/q/users/search?x=1", { method: "QUERY", cookies: session }));

      expect(rewriteOf(response)).toBe("https://api.exemplo.com/users/search?x=1");
      expect(forwarded(response, "x-company-id")).toBe("company-9");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});

describe("proxy: matcher", () => {
  const matches = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

  it("deixa /api/q/** passar pelo proxy e continua fora para o BFF autenticado", () => {
    expect(matches("/api/q/users/search")).toBe(true);
    expect(matches("/dashboard")).toBe(true);
    expect(matches("/api/security/users")).toBe(false);
    expect(matches("/api/me/profile")).toBe(false);
  });
});

describe("proxy: nao-regressao do comportamento anterior", () => {
  it("pagina protegida sem sessao redireciona para /login", () => {
    const response = proxy(request("/dashboard"));
    expect(response.status).toBe(307);
    expect(redirectOf(response)).toBe("http://localhost:3000/login");
  });

  it("/login com sessao redireciona para /", () => {
    const response = proxy(request("/login", { cookies: session }));
    expect(redirectOf(response)).toBe("http://localhost:3000/");
  });

  it("pagina protegida com sessao segue (next)", () => {
    const response = proxy(request("/dashboard", { cookies: session }));
    expect(redirectOf(response)).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("senha a trocar leva para /change-password", () => {
    const response = proxy(request("/dashboard", { cookies: { ...session, [ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE]: "1" } }));
    expect(redirectOf(response)).toBe("http://localhost:3000/change-password");
  });

  it("/api/auth/** (publica) e estaticos passam sem sessao; /api/quarterly nao e' /api/q/", () => {
    for (const p of ["/api/auth/login", "/auth/welcome", "/_next/static/x.js", "/logo.png"]) {
      expect(proxy(request(p)).headers.get("x-middleware-next")).toBe("1");
    }
    expect(redirectOf(proxy(request("/api/quarterly")))).toBe("http://localhost:3000/login");
  });
});
