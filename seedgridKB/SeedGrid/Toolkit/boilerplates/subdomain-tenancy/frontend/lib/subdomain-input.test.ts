import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { lowerSubdomainWhileTyping, normalizeSubdomain } from "./subdomain-input";

describe("subdominio sempre minusculo (P180.F2.T10)", () => {
  it("converte para minusculas e apara espacos, sem recusar", () => {
    expect(normalizeSubdomain("Infotec")).toBe("infotec");
    expect(normalizeSubdomain("  INFOTEC_01 ")).toBe("infotec_01");
    expect(normalizeSubdomain("infotec")).toBe("infotec");
  });

  it("ao digitar so' converte a caixa (nao mexe no resto)", () => {
    expect(lowerSubdomainWhileTyping("InfoT ")).toBe("infot ");
  });

  it("o cadastro valida o valor ja normalizado (antes recusava 'Infotec')", () => {
    const src = readFileSync(join(__dirname, "../app/auth/SignupForm.tsx"), "utf8");
    expect(src).toContain("const subdomain = normalizeSubdomain(values.subdomain);");
    expect(src).toMatch(/\.test\(subdomain\)/);
    expect(src).not.toMatch(/\.test\(values\.subdomain/);
    expect(src).toContain("subdomain: normalizeSubdomain(form.subdomain)");
    expect(src).toContain('applyValue("subdomain", lower)');
  });

  it("a tela 'Entrar na sua empresa' tambem normaliza ao digitar e ao enviar", () => {
    const src = readFileSync(join(__dirname, "../app/auth/tenant/page.tsx"), "utf8");
    expect(src).toContain("normalizeSubdomain(subdomain)");
    expect(src).toContain("lowerSubdomainWhileTyping(value)");
  });
});
