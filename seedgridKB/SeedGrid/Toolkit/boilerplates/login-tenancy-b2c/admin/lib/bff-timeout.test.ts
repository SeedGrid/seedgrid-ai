// Tempo limite do BFF (P192.F2.T1): mensagem fixa, erro 504, signal combinado; e as rotas de export pedem 30 s.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  EXPORT_BFF_TIMEOUT_MS,
  REQUEST_TIMEOUT_CODE,
  UpstreamTimeoutError,
  isTimeoutAbort,
  signalWithTimeout,
  timeoutMessage,
} from "./bff-timeout.ts";

const server = readFileSync(new URL("./seedgrid-app-api-server.ts", import.meta.url), "utf8");

describe("tempo limite do BFF", () => {
  it("mensagem fixa em minutos cheios ou segundos", () => {
    assert.equal(timeoutMessage(60_000), "A operação demorou mais de 1 minuto e foi interrompida. Confira se ela foi concluída antes de repetir.");
    assert.match(timeoutMessage(120_000), /mais de 2 minutos/);
    assert.match(timeoutMessage(EXPORT_BFF_TIMEOUT_MS), /mais de 30 segundos/);
  });

  it("UpstreamTimeoutError: 504 e code estavel", () => {
    const error = new UpstreamTimeoutError(30_000);
    assert.equal(error.status, 504);
    assert.equal(error.code, REQUEST_TIMEOUT_CODE);
    assert.equal(error.timeoutMs, 30_000);
    assert.ok(error instanceof Error, "e um Error");
  });

  it("signalWithTimeout: sem limite devolve o do chamador; com limite aborta e acompanha o do chamador", async () => {
    assert.equal(signalWithTimeout(undefined, 0), undefined);
    const caller = new AbortController();
    assert.equal(signalWithTimeout(caller.signal, 0), caller.signal);
    const timed = signalWithTimeout(undefined, 20) as AbortSignal;
    assert.ok(timed.aborted === false, "ainda nao");
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.ok(timed.aborted, "estourou o limite");
    const both = signalWithTimeout(caller.signal, 60_000) as AbortSignal;
    caller.abort();
    assert.ok(both.aborted, "o do chamador tambem aborta");
  });

  it("isTimeoutAbort so reconhece TimeoutError (nao AbortError do chamador nem falha de rede)", () => {
    const timeout = Object.assign(new Error("t"), { name: "TimeoutError" });
    assert.ok(isTimeoutAbort(timeout), "timeout");
    assert.ok(!isTimeoutAbort(Object.assign(new Error('a'), { name: 'AbortError' })), "abort do chamador");
    assert.ok(!isTimeoutAbort(new TypeError('fetch failed')), "rede");
  });

  it("o safeFetch do servidor usa o limite pedido e traduz o estouro em UpstreamTimeoutError", () => {
    assert.match(server, /const \{ timeoutMs, \.\.\.init \} = options;/);
    assert.match(server, /signal: signalWithTimeout\(init\.signal, timeoutMs\)/);
    assert.match(server, /isTimeoutAbort\(error\)[\s\S]*?throw new UpstreamTimeoutError\(timeoutMs\)/);
  });
});
