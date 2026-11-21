// Tempo limite do BFF (P192.F2.T1): mensagem fixa, erro 504, signal combinado; e as rotas de export pedem 30 s.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  EXPORT_BFF_TIMEOUT_MS,
  REQUEST_TIMEOUT_CODE,
  UpstreamTimeoutError,
  isTimeoutAbort,
  signalWithTimeout,
  timeoutMessage,
} from "./bff-timeout";

const server = readFileSync(new URL("./seedgrid-app-api-server.ts", import.meta.url), "utf8");

describe("tempo limite do BFF", () => {
  it("mensagem fixa em minutos cheios ou segundos", () => {
    expect(timeoutMessage(60_000)).toBe("A operação demorou mais de 1 minuto e foi interrompida. Confira se ela foi concluída antes de repetir.");
    expect(timeoutMessage(120_000)).toMatch(/mais de 2 minutos/);
    expect(timeoutMessage(EXPORT_BFF_TIMEOUT_MS)).toMatch(/mais de 30 segundos/);
  });

  it("UpstreamTimeoutError: 504 e code estavel", () => {
    const error = new UpstreamTimeoutError(30_000);
    expect(error.status).toBe(504);
    expect(error.code).toBe(REQUEST_TIMEOUT_CODE);
    expect(error.timeoutMs).toBe(30_000);
    expect(error instanceof Error, "e um Error").toBe(true);
  });

  it("signalWithTimeout: sem limite devolve o do chamador; com limite aborta e acompanha o do chamador", async () => {
    expect(signalWithTimeout(undefined, 0)).toBe(undefined);
    const caller = new AbortController();
    expect(signalWithTimeout(caller.signal, 0)).toBe(caller.signal);
    const timed = signalWithTimeout(undefined, 20) as AbortSignal;
    expect(timed.aborted === false, "ainda nao").toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(timed.aborted, "estourou o limite").toBe(true);
    const both = signalWithTimeout(caller.signal, 60_000) as AbortSignal;
    caller.abort();
    expect(both.aborted, "o do chamador tambem aborta").toBe(true);
  });

  it("isTimeoutAbort so reconhece TimeoutError (nao AbortError do chamador nem falha de rede)", () => {
    const timeout = Object.assign(new Error("t"), { name: "TimeoutError" });
    expect(isTimeoutAbort(timeout), "timeout").toBe(true);
    expect(!isTimeoutAbort(Object.assign(new Error('a'), { name: 'AbortError' })), "abort do chamador").toBe(true);
    expect(!isTimeoutAbort(new TypeError('fetch failed')), "rede").toBe(true);
  });

  it("o safeFetch do servidor usa o limite pedido e traduz o estouro em UpstreamTimeoutError", () => {
    expect(server).toMatch(/const \{ timeoutMs, \.\.\.init \} = options;/);
    expect(server).toMatch(/signal: signalWithTimeout\(init\.signal, timeoutMs\)/);
    expect(server).toMatch(/isTimeoutAbort\(error\)[\s\S]*?throw new UpstreamTimeoutError\(timeoutMs\)/);
  });
});
