// Pagina HTML de erro (Cloudflare 502 do tokeninfo...) nunca aparece na tela (P194.F1.T4).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { SERVER_DOWN_MESSAGE, errorBodyForClient, friendlyHttpError, loadErrorDetail } from "./http-error";

const CLOUDFLARE = `<!DOCTYPE html><html lang="en-US"><head><title>tokeninfo.display.seedgrid.com.br | 502: Bad gateway</title></head><body><h1>Bad gateway</h1><p>Error code 502</p></body></html>`;

describe("erro HTML de proxy", () => {
  it("502/503/504 viram a mensagem curta com o codigo pequeno", () => {
    for (const status of [502, 503, 504]) {
      expect(friendlyHttpError(status, "text/html", CLOUDFLARE, "x")).toBe(`${SERVER_DOWN_MESSAGE} (HTTP ${status})`);
    }
  });

  it("o corpo repassado ao tratador: JSON passa intacto, HTML vira a mensagem curta", () => {
    const problem = '{"detail":"Plano invalido","code":"X"}';
    expect(errorBodyForClient(400, "application/problem+json", problem)).toBe(problem);
    const out = errorBodyForClient(502, "text/html", CLOUDFLARE);
    expect(out).toContain(SERVER_DOWN_MESSAGE);
    expect(out).not.toMatch(/<html|<body|DOCTYPE/i);
    expect(errorBodyForClient(502, null, "")).toContain(SERVER_DOWN_MESSAGE);
  });

  it("o detalhe da tela de erro nunca e' HTML", () => {
    expect(loadErrorDetail(CLOUDFLARE)).toBe(SERVER_DOWN_MESSAGE);
    expect(loadErrorDetail(new Error(CLOUDFLARE))).toBe(SERVER_DOWN_MESSAGE);
    expect(loadErrorDetail('{"detail":"Falhou aqui"}')).toBe("Falhou aqui");
    expect(loadErrorDetail("")).toBe("");
  });

  it("a tela de erro tem 'Tentar de novo' e nao imprime HTML", () => {
    const view = readFileSync(new URL("../components/ui/list-load-error.tsx", import.meta.url), "utf8");
    expect(view).toMatch(/loadErrorDetail\(error\)/);
    expect(view).toMatch(/onRetry/);
  });
});
