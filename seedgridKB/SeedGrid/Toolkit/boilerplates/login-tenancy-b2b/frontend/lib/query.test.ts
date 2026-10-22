import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "./core";
import { isCompanyReadOnlyBody, isSessionRevokedBody } from "./api-error";
import { query } from "./query";

// `query()` e' o helper client das consultas QUERY (ADR 28). O fetch e' substituido por um fake que
// responde por rota: `/api/q/**` (consulta) e `/api/auth/refresh` (renovacao).
type Call = { url: string; init: RequestInit };

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
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
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
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("query()", () => {
  it("envia QUERY em /api/q/<caminho> com corpo JSON e devolve o JSON", async () => {
    queryReplies.push(json(200, { items: [1, 2] }));

    const result = await query<{ items: number[] }>("audit-logs/search", { entity: "User", page: 1 });

    expect(result).toEqual({ items: [1, 2] });
    expect(calls).toHaveLength(1);
    const { url, init } = calls[0];
    expect(url).toBe("/api/q/audit-logs/search");
    expect(init.method).toBe("QUERY");
    expect(init.credentials).toBe("same-origin");
    expect(init.body).toBe(JSON.stringify({ entity: "User", page: 1 }));
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("ignora a barra inicial, mantem a query string e nao manda corpo quando omitido", async () => {
    queryReplies.push(json(200, {}));

    await query("/users/search?size=10");

    expect(calls[0].url).toBe("/api/q/users/search?size=10");
    expect(calls[0].init.body).toBeUndefined();
    expect(calls[0].init.headers).not.toHaveProperty("Content-Type");
  });

  it("204 devolve null", async () => {
    queryReplies.push(new Response(null, { status: 204 }));
    expect(await query("x")).toBeNull();
  });

  it("401 -> renova -> repete a MESMA consulta -> sucesso", async () => {
    queryReplies.push(json(401, { status: 401, title: "Unauthorized" }), json(200, { ok: true }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const result = await query("users/search", { q: "ana" });

    expect(result).toEqual({ ok: true });
    expect(calls.map((c) => c.url)).toEqual(["/api/q/users/search", "/api/auth/refresh", "/api/q/users/search"]);
    expect(refreshCalls()[0].init.method).toBe("POST");
    expect(queryCalls()[1].init.method).toBe("QUERY");
    expect(queryCalls()[1].init.body).toBe(queryCalls()[0].init.body);
  });

  it("401 -> renovacao recusada -> lanca ApiClientError 401 sem repetir", async () => {
    queryReplies.push(json(401, { status: 401, title: "Unauthorized" }));
    refreshReplies.push(json(401, { message: "Sessao invalida" }));

    const error = await query("users/search", {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).status).toBe(401);
    expect(queryCalls()).toHaveLength(1);
    expect(refreshCalls()).toHaveLength(1);
  });

  it("renovacao com rede caida -> lanca o 401 original", async () => {
    queryReplies.push(json(401, { title: "Unauthorized" }));
    refreshReplies.push(new TypeError("Failed to fetch"));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    expect(error.status).toBe(401);
    expect(error.responseBody).toEqual({ title: "Unauthorized" });
    expect(queryCalls()).toHaveLength(1);
  });

  it("401 duas vezes -> so' UMA repeticao e UMA renovacao", async () => {
    queryReplies.push(json(401, { title: "a" }), json(401, { title: "b" }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    expect(error.status).toBe(401);
    expect(error.responseBody).toEqual({ title: "b" });
    expect(queryCalls()).toHaveLength(2);
    expect(refreshCalls()).toHaveLength(1);
  });

  it("SESSION_REVOKED nao renova nem repete", async () => {
    queryReplies.push(json(401, { status: 401, code: "SESSION_REVOKED" }));

    const error = (await query("users/search", {}).catch((e: unknown) => e)) as ApiClientError;

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.status).toBe(401);
    expect(isSessionRevokedBody(error.responseBody)).toBe(true);
    expect(refreshCalls()).toHaveLength(0);
    expect(queryCalls()).toHaveLength(1);
  });

  it("PASSWORD_CHANGE_REQUIRED nao renova", async () => {
    queryReplies.push(json(401, { code: "PASSWORD_CHANGE_REQUIRED" }));

    await expect(query("users/search", {})).rejects.toBeInstanceOf(ApiClientError);
    expect(refreshCalls()).toHaveLength(0);
  });

  it("COMPANY_READ_ONLY (403) vira ApiClientError legivel pelos parsers do app, sem renovar", async () => {
    queryReplies.push(json(403, { status: 403, code: "COMPANY_READ_ONLY" }));

    const error = (await query("x", {}).catch((e: unknown) => e)) as ApiClientError;

    expect(error.status).toBe(403);
    expect(isCompanyReadOnlyBody(error.responseBody)).toBe(true);
    expect(refreshCalls()).toHaveLength(0);
  });

  it("erro com corpo de texto guarda o texto", async () => {
    queryReplies.push(new Response("boom", { status: 500 }));

    const error = (await query("x", {}).catch((e: unknown) => e)) as ApiClientError;

    expect(error.status).toBe(500);
    expect(error.responseBody).toBe("boom");
  });

  it("consultas concorrentes que tomam 401 compartilham UMA renovacao", async () => {
    queryReplies.push(json(401, {}), json(401, {}), json(200, { n: 1 }), json(200, { n: 2 }));
    refreshReplies.push(new Response(null, { status: 204 }));

    const [a, b] = await Promise.all([query("a", {}), query("b", {})]);

    expect([a, b]).toEqual([{ n: 1 }, { n: 2 }]);
    expect(refreshCalls()).toHaveLength(1);
  });
});
