import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  CLIENT_TIMEOUT_MESSAGE,
  SERVER_DOWN_MESSAGE,
  SLOW_SERVER_MESSAGE,
  errorBodyForClient,
  loadErrorDetail,
  fetchWithTimeout,
  friendlyHttpError,
  readHttpError,
} from "./http-error.ts";

const CLOUDFLARE_524 =
  '<!DOCTYPE html><html lang="en-US"><head><title>display-admin.seedgrid.com.br | 524: A timeout occurred</title></head><body>...</body></html>';

describe("friendlyHttpError", () => {
  it("524 do Cloudflare (HTML) vira texto de lentidao, nunca o HTML", () => {
    const text = friendlyHttpError(524, "text/html; charset=UTF-8", CLOUDFLARE_524, "Falha ao salvar.");
    assert.ok(text.includes(SLOW_SERVER_MESSAGE));
    assert.ok(text.includes("524"));
    assert.ok(!text.includes("<"));
  });

  it("502 e 504 sem corpo tambem", () => {
    assert.ok(friendlyHttpError(502, null, "", "x").includes(SERVER_DOWN_MESSAGE));
    assert.ok(friendlyHttpError(504, "text/plain", "   ", "x").includes(SERVER_DOWN_MESSAGE));
  });

  it("outra pagina HTML (500 do Next) usa o fallback e nao mostra o HTML", () => {
    const text = friendlyHttpError(500, "text/html", "<html><body>erro</body></html>", "Falha ao salvar.");
    assert.ok(text.includes("Falha ao salvar."));
    assert.ok(!text.includes("<"));
  });

  it("HTML com Content-Type errado tambem e' detectado pelo corpo", () => {
    assert.ok(!friendlyHttpError(500, "text/plain", "<!doctype html><p>x</p>", "Falha.").includes("<"));
  });

  it("problem+json: devolve detail, depois message, depois title", () => {
    assert.equal(friendlyHttpError(400, "application/problem+json", '{"title":"Ruim","detail":"Valor invalido"}', "x"), "Valor invalido");
    assert.equal(friendlyHttpError(400, "application/json", '{"message":"So mensagem"}', "x"), "So mensagem");
    assert.equal(friendlyHttpError(400, "application/json", '{"title":"So titulo"}', "x"), "So titulo");
    assert.equal(friendlyHttpError(400, "application/json", "{}", "Falha."), "Falha.");
  });

  it("texto curto passa, texto longo e' cortado, vazio usa o fallback", () => {
    assert.equal(friendlyHttpError(409, "text/plain", "Conflito", "x"), "Conflito");
    assert.ok(friendlyHttpError(409, "text/plain", "a".repeat(500), "x").length < 310);
    assert.equal(friendlyHttpError(409, "text/plain", "", "Falha."), "Falha.");
  });
});

describe("readHttpError", () => {
  it("le o corpo da Response", async () => {
    const response = new Response(CLOUDFLARE_524, { status: 524, headers: { "Content-Type": "text/html" } });
    assert.ok((await readHttpError(response, "Falha")).includes(SLOW_SERVER_MESSAGE));
  });
});

describe("fetchWithTimeout", () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it("pendurado alem do limite: aborta e lanca a mensagem de tempo", async () => {
    globalThis.fetch = ((_: unknown, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      })) as typeof fetch;
    await assert.rejects(fetchWithTimeout("/x", {}, 50), { message: CLIENT_TIMEOUT_MESSAGE });
  });

  it("resposta rapida passa direto", async () => {
    globalThis.fetch = (async () => new Response("ok", { status: 200 })) as typeof fetch;
    const response = await fetchWithTimeout("/x", {}, 1000);
    assert.equal(response.status, 200);
  });
});

describe("pagina HTML do Cloudflare (502) nunca aparece (P194.F1.T4)", () => {
  const html = '<!DOCTYPE html><html><head><title>tokeninfo | 502: Bad gateway</title></head><body>Error code 502</body></html>';
  it("502/503/504 viram a mensagem curta", () => {
    for (const status of [502, 503, 504]) {
      assert.equal(friendlyHttpError(status, "text/html", html, "x"), `${SERVER_DOWN_MESSAGE} (HTTP ${status})`);
    }
  });
  it("corpo repassado e detalhe de tela: JSON intacto, HTML vira a mensagem curta", () => {
    assert.equal(errorBodyForClient(400, "application/json", '{"detail":"x"}'), '{"detail":"x"}');
    assert.ok(errorBodyForClient(502, "text/html", html).includes(SERVER_DOWN_MESSAGE));
    assert.equal(loadErrorDetail(new Error(html)), SERVER_DOWN_MESSAGE);
    assert.equal(loadErrorDetail('{"detail":"Falhou"}'), "Falhou");
  });
});
