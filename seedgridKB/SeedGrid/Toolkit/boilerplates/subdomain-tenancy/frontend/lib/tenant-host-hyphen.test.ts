// P194 hotfix: dominio com hifen (cadastro novo) resolve;  `_` e recusado; invalido vira 400, nao 503.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { backendUnavailableResponse } from "./backend-unavailable";
import { TenantHostError, resolveTenantHost } from "./tenant-host";

const before = process.env.SEEDGRID_TENANCY_DOMAIN;
beforeEach(() => {
  process.env.SEEDGRID_TENANCY_DOMAIN = "seedgrid.test";
});
afterEach(() => {
  if (before === undefined) delete process.env.SEEDGRID_TENANCY_DOMAIN;
  else process.env.SEEDGRID_TENANCY_DOMAIN = before;
});

describe("resolveTenantHost", () => {
  it("aceita hifen, maiuscula no Host e porta", () => {
    expect(resolveTenantHost("infotec-computadores.seedgrid.test")).toBe("infotec-computadores.seedgrid.test");
    expect(resolveTenantHost("Infotec-X1.seedgrid.test:443")).toBe("infotec-x1.seedgrid.test");
    expect(resolveTenantHost("seedgrid.test")).toBe("seedgrid.test");
  });

  it("recusa master, _, curto, longo, simbolo e host de outro dominio com TenantHostError", () => {
    for (const host of [
      "master.seedgrid.test",
      "infotec_computadores.seedgrid.test",
      "infotec_computadores.seedgrid.test",
      "abcd.seedgrid.test",
      `${"a".repeat(51)}.seedgrid.test`,
      "info.tec.seedgrid.test",
      "infotec.outro.com.br",
    ]) {
      expect(() => resolveTenantHost(host), host).toThrow(TenantHostError);
    }
  });
});

describe("backendUnavailableResponse", () => {
  it("host invalido = 400 com mensagem clara; outro erro = 503", async () => {
    const bad = backendUnavailableResponse(new TenantHostError("x"));
    expect(bad.status).toBe(400);
    expect((await bad.json()).message).toMatch(/Domínio de acesso inválido/);
    expect(backendUnavailableResponse(new Error("ECONNREFUSED")).status).toBe(503);
  });

  it("nenhuma rota do BFF de auth/signup mascara erro de host como 503", () => {
    const dir = fileURLToPath(new URL("../app/api", import.meta.url));
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : n === "route.ts" ? [join(d, n)] : []));
    const bad = walk(dir).filter((f) => /Nao foi possivel conectar ao servidor/.test(readFileSync(f, "utf8")));
    expect(bad).toEqual([]);
  });
});
