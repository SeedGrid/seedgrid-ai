import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { ApiClientError } from "./core/index.ts";
import { isCompanyReadOnlyBody, isSessionRevokedBody } from "./api-error.ts";
import { query } from "./query.ts";

// `query()` e' o helper client das consultas QUERY (ADR 28). O fetch e' substituido por um fake que
// responde por rota: `/api/q/**` (consulta) e `/api/auth/refresh` (renovacao).
type Call = { url: string; init: RequestInit };

const realFetch = globalThis.fetch;
let calls: Call[];
let queryReplies: Array<Response | Error>;
let refreshReplies: Array<Response | Error>;

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const queryCalls = () => calls.filter((c) => c.url.startsWith("/api/q/"));
const refreshCalls = () => calls.filter((c) => c.url === "/api/auth/refresh");

beforeEach(() => {
  calls = [];
  queryReplies = [];
  refreshReplies = [];
  globalThis.fetch = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    const queue = url === "/api/auth/refresh" ? refreshReplies : queryReplies;
    const next = queue.shift();
    if (!next) {
      throw new Error(`resposta nao programada para ${url}`);
    }
    if (next instanceof Error) {
      throw next;
    }
    return next;
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("query()", () => {
  it("envia QUERY em /api/q/<caminho> com corpo JSON e devolve o JSON", async () => {
    queryReplies.push(json(200, { items: [1, 2] }));

    const result = await query<{ items: number[] }>("audit-logs/search", { entity: "User", page: 1 });

    assert.deepEqual(result, { items: [1, 2] });
    assert.equal(calls.length, 1);
    const { url, init } = calls[0];
    assert.equal(url, "/api/q/audit-logs/search");
    assert.equal(init.method, "QUERY");
    assert.equal(init.credentials, "same-origin");
    assert.equal(init.body, JSON.stringify({ entity: "User", page: 1 }));
    assert.equal((init.headers as Record<string, string>)["Content-Type"], "application/json");
  });

  it("ignora a barra inicial, mantem a query string e nao manda corpo quando omitido", async () => {
    queryReplies.push(json(200, {}));

    await query("/users/search?size=10");

    assert.equal(calls[0].url, "/api/q/users/search?size=10");
    assert.equal(calls[0].init.body, undefined);
    assert.equal("Content-Type" in (calls[0].init.headers as object), false);
  });

  it("204 devolve null", async () => {
    queryReplies.push(new Response(null, { status: 204 }));
    assert.equal(await query("x"), null);
  });

  it("401 -> renova -> repete a MESMA consulta -> sucesso", async () => {
    queryReplies.push(json(401, { status: 401, title: "Unauthorized" }), json(200, { ok: true }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const result = await query("users/search", { q: "ana" });

    assert.deepEqual(result, { ok: true });
    assert.deepEqual(
      calls.map((c) => c.url),
      ["/api/q/users/search", "/api/auth/refresh", "/api/q/users/search"],
    );
    assert.equal(refreshCalls()[0].init.method, "POST");
    assert.equal(queryCalls()[1].init.method, "QUERY");
    assert.equal(queryCalls()[1].init.body, queryCalls()[0].init.body);
  });

  it("401 -> renovacao recusada -> lanca ApiClientError 401 sem repetir", async () => {
    queryReplies.push(json(401, { status: 401, title: "Unauthorized" }));
    refreshReplies.push(json(401, { message: "Sessao invalida" }));

    const error = await query("users/search", {}).catch((e: unknown) => e);

    assert.ok(error instanceof ApiClientError);
    assert.equal(error.status, 401);
    assert.equal(queryCalls().length, 1);
    assert.equal(refreshCalls().length, 1);
  });

  it("renovacao com rede caida -> lanca o 401 original", async () => {
    queryReplies.push(json(401, { title: "Unauthorized" }));
    refreshReplies.push(new TypeError("Failed to fetch"));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    assert.equal(error.status, 401);
    assert.deepEqual(error.responseBody, { title: "Unauthorized" });
    assert.equal(queryCalls().length, 1);
  });

  it("401 duas vezes -> so' UMA repeticao e UMA renovacao", async () => {
    queryReplies.push(json(401, { title: "a" }), json(401, { title: "b" }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    assert.equal(error.status, 401);
    assert.deepEqual(error.responseBody, { title: "b" });
    assert.equal(queryCalls().length, 2);
    assert.equal(refreshCalls().length, 1);
  });

  it("SESSION_REVOKED nao renova nem repete", async () => {
    queryReplies.push(json(401, { status: 401, code: "SESSION_REVOKED" }));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    assert.ok(error instanceof ApiClientError);
    assert.equal(error.status, 401);
    assert.equal(isSessionRevokedBody(error.responseBody), true);
    assert.equal(refreshCalls().length, 0);
    assert.equal(queryCalls().length, 1);
  });

  it("PASSWORD_CHANGE_REQUIRED nao renova", async () => {
    queryReplies.push(json(401, { code: "PASSWORD_CHANGE_REQUIRED" }));

    await assert.rejects(query("users/search", {}), ApiClientError);
    assert.equal(refreshCalls().length, 0);
  });

  it("COMPANY_READ_ONLY (403) vira ApiClientError legivel pelos parsers do app, sem renovar", async () => {
    queryReplies.push(json(403, { status: 403, code: "COMPANY_READ_ONLY" }));

    const error = (await query("x", {}).catch((e: unknown) => e)) as ApiClientError;

    assert.equal(error.status, 403);
    assert.equal(isCompanyReadOnlyBody(error.responseBody), true);
    assert.equal(refreshCalls().length, 0);
  });

  it("erro com corpo de texto guarda o texto", async () => {
    queryReplies.push(new Response("boom", { status: 500 }));

    const error = (await query("x", {}).catch((e: unknown) => e)) as ApiClientError;

    assert.equal(error.status, 500);
    assert.equal(error.responseBody, "boom");
  });

  it("consultas concorrentes que tomam 401 compartilham UMA renovacao", async () => {
    queryReplies.push(json(401, {}), json(401, {}), json(200, { n: 1 }), json(200, { n: 2 }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const [a, b] = await Promise.all([query("a", {}), query("b", {})]);

    assert.deepEqual([a, b], [{ n: 1 }, { n: 2 }]);
    assert.equal(refreshCalls().length, 1);
  });
});
