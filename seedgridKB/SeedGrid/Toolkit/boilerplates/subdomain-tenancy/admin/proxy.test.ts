import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NextRequest } from "next/server";

import {
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "./lib/admin-auth.ts";
import { config, proxy } from "./proxy.ts";

// `proxy.ts`: (1) `/api/q/**` -> rewrite para a API com Authorization do cookie, preservando
// metodo/corpo/query string (ADR 28); (2) nao-regressao do comportamento anterior.
// A base da API e' a default (`SEEDGRID_APP_API_BASE_URL` nao definida no teste).
const API = "http://127.0.0.1:8085";

type Init = { method?: string; cookies?: Record<string, string>; headers?: Record<string, string>; body?: string };

function request(path: string, init: Init = {}) {
  const cookie = Object.entries(init.cookies ?? {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`http://localhost:3000${path}`, {
    method: init.method ?? "GET",
    headers: { host: "localhost:3003", ...(cookie ? { cookie } : {}), ...init.headers },
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

    assert.equal(rewriteOf(response), `${API}/audit-logs/search?size=10&page=2`);
    assert.equal(forwarded(response, "authorization"), "Bearer tok-123");
    assert.equal(forwarded(response, "content-type"), "application/json");
    // o proxy so' reescreve: metodo e corpo da requisicao original seguem intactos
    assert.equal(req.method, "QUERY");
    assert.equal(await req.text(), '{"entity":"User"}');
  });

  it("nao repassa Authorization, X-Company-Id nem cookies vindos do browser", () => {
    const response = proxy(
      request("/api/q/users/search", {
        method: "QUERY",
        cookies: session,
        headers: { Authorization: "Bearer forjado", "X-Company-Id": "outra-empresa" },
      }),
    );

    assert.equal(forwarded(response, "authorization"), "Bearer tok-123");
    assert.equal(forwarded(response, "x-company-id"), null);
    assert.equal(forwarded(response, "cookie"), null);
  });

  it("caminho com ponto nao e' tratado como estatico", () => {
    const response = proxy(request("/api/q/files/relatorio.v2/list", { method: "QUERY", cookies: session }));
    assert.equal(rewriteOf(response), `${API}/files/relatorio.v2/list`);
  });

  it("so' com o refresh token: segue SEM Authorization (o query() renova no 401)", () => {
    const response = proxy(
      request("/api/q/users/search", { method: "QUERY", cookies: { [ADMIN_REFRESH_TOKEN_COOKIE]: "ref-456" } }),
    );
    assert.equal(rewriteOf(response), `${API}/users/search`);
    assert.equal(forwarded(response, "authorization"), null);
  });

  it("sem cookie de sessao: 401 JSON, sem redirect para /login", async () => {
    const response = proxy(request("/api/q/users/search", { method: "QUERY" }));

    assert.equal(response.status, 401);
    assert.equal(redirectOf(response), null);
    assert.equal(rewriteOf(response), null);
    assert.match(response.headers.get("content-type") ?? "", /application\/problem\+json/);
    const body = (await response.json()) as { status: number; code: string };
    assert.equal(body.status, 401);
    assert.equal(body.code, "NO_SESSION");
  });

  it("outro metodo que nao QUERY: 405 com Allow: QUERY (nao vira proxy de escrita)", () => {
    for (const method of ["GET", "POST", "DELETE"]) {
      const response = proxy(request("/api/q/users/1", { method, cookies: session }));
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), "QUERY");
      assert.equal(rewriteOf(response), null);
    }
  });

  for (const path of ["/api/q/", "/api/q//evil.com/x", "/api/q/a%2F..%2Fb", "/api/q/a%5Cb"]) {
    it(`caminho invalido ${path}: 400`, () => {
      const response = proxy(request(path, { method: "QUERY", cookies: session }));
      assert.equal(response.status, 400);
      assert.equal(rewriteOf(response), null);
    });
  }

  it("'..' literal ou codificado nunca sai de <base da API>/ (a URL ja normaliza; o proxy confere o resto)", () => {
    for (const path of ["/api/q/a/../b", "/api/q/a/%2e%2e/b", "/api/q/../../x"]) {
      const target = rewriteOf(proxy(request(path, { method: "QUERY", cookies: session })));
      // normalizado para fora de /api/q/ (segue o fluxo normal, sem rewrite) ou dentro da base
      assert.ok(target === null || target.startsWith(`${API}/`), `${path} -> ${target}`);
    }
  });
});

describe("proxy: /api/q/** (tenant por X-Forwarded-Host)", () => {
  it("manda o dominio master em X-Forwarded-Host, como o backendFetch do admin", () => {
    const response = proxy(request("/api/q/users/search", { method: "QUERY", cookies: session }));
    assert.equal(forwarded(response, "x-forwarded-host"), "localhost");
  });

  it("ignora X-Forwarded-Host e Host do browser; nao manda X-Company-Id", () => {
    const response = proxy(
      request("/api/q/users/search", {
        method: "QUERY",
        cookies: session,
        headers: { "x-forwarded-host": "vitima.localhost", host: "outra.exemplo.com", "x-company-id": "x" },
      }),
    );
    assert.equal(forwarded(response, "x-forwarded-host"), "localhost");
    assert.equal(forwarded(response, "x-company-id"), null);
  });

  it("respeita SEEDGRID_TENANCY_DOMAIN (lido a cada requisicao, como o backendFetch)", () => {
    const previous = process.env.SEEDGRID_TENANCY_DOMAIN;
    process.env.SEEDGRID_TENANCY_DOMAIN = " admin.exemplo.com.br ";
    try {
      const response = proxy(request("/api/q/users/search", { method: "QUERY", cookies: session }));
      assert.equal(forwarded(response, "x-forwarded-host"), "admin.exemplo.com.br");
    } finally {
      if (previous === undefined) delete process.env.SEEDGRID_TENANCY_DOMAIN;
      else process.env.SEEDGRID_TENANCY_DOMAIN = previous;
    }
  });
});

describe("proxy: matcher", () => {
  const matches = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

  it("deixa /api/q/** passar pelo proxy e continua fora para o BFF autenticado do admin", () => {
    assert.equal(matches("/api/q/users/search"), true);
    assert.equal(matches("/dashboard"), true);
    assert.equal(matches("/api/admin/plans"), false);
  });
});

describe("proxy: nao-regressao do comportamento anterior", () => {
  it("pagina protegida sem sessao redireciona para /login", () => {
    const response = proxy(request("/dashboard"));
    assert.equal(response.status, 307);
    assert.equal(redirectOf(response), "http://localhost:3000/login");
  });

  it("/login com sessao redireciona para /", () => {
    const response = proxy(request("/login", { cookies: session }));
    assert.equal(redirectOf(response), "http://localhost:3000/");
  });

  it("pagina protegida com sessao segue (next)", () => {
    const response = proxy(request("/dashboard", { cookies: session }));
    assert.equal(redirectOf(response), null);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  });

  it("senha a trocar leva para /change-password", () => {
    const response = proxy(request("/dashboard", { cookies: { ...session, [ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE]: "1" } }));
    assert.equal(redirectOf(response), "http://localhost:3000/change-password");
  });

  it("/api/auth/** (publica) e estaticos passam sem sessao; /api/quarterly nao e' /api/q/", () => {
    for (const p of ["/api/auth/login", "/auth/welcome", "/_next/static/x.js", "/logo.png"]) {
      assert.equal(proxy(request(p)).headers.get("x-middleware-next"), "1");
    }
    assert.equal(redirectOf(proxy(request("/api/quarterly"))), "http://localhost:3000/login");
  });
});
