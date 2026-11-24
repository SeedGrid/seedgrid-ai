import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveTenantHost } from "./tenant-host";
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_FORMAT_MESSAGE,
  SUBDOMAIN_RESERVED_MESSAGE,
  lowerSubdomainWhileTyping,
  normalizeSubdomain,
  subdomainError,
} from "./subdomain-input";

describe("subdominio filtrado ao digitar (P194.T1)", () => {
  it("minusculas, sem acento", () => {
    expect(lowerSubdomainWhileTyping("Infotec")).toBe("infotec");
    expect(lowerSubdomainWhileTyping("Informática")).toBe("informatica");
    expect(lowerSubdomainWhileTyping("AÇÃO-Ü")).toBe("acao-u");
  });

  it("espaco e _ (em sequencia) viram UM hifen; simbolos sao descartados", () => {
    expect(lowerSubdomainWhileTyping("infotec computadores")).toBe("infotec-computadores");
    expect(lowerSubdomainWhileTyping("infotec_computadores")).toBe("infotec-computadores");
    expect(lowerSubdomainWhileTyping("infotec  _ computadores")).toBe("infotec-computadores");
    expect(lowerSubdomainWhileTyping("info@tec!.com#")).toBe("infotec" + "com");
    expect(lowerSubdomainWhileTyping("a/b\c")).toBe("abc");
  });

  it("colar com espacos nas pontas: normalizeSubdomain apara antes de converter", () => {
    expect(normalizeSubdomain("  Infotec Computadores  ")).toBe("infotec-computadores");
    expect(normalizeSubdomain("INFOTEC_01 ")).toBe("infotec-01");
  });

  it("ao digitar NAO apara hifen no fim (o espaco recem-digitado precisa ficar)", () => {
    expect(lowerSubdomainWhileTyping("infotec ")).toBe("infotec-");
  });
});

describe("regra unica do subdominio (SubdomainRules)", () => {
  it("5 a 50 caracteres", () => {
    expect(subdomainError("abcd")).toBe(SUBDOMAIN_FORMAT_MESSAGE);
    expect(subdomainError("abcde")).toBeNull();
    expect(subdomainError("a".repeat(50))).toBeNull();
    expect(subdomainError("a".repeat(51))).toBe(SUBDOMAIN_FORMAT_MESSAGE);
  });

  it("hifen nas pontas e -- nas posicoes 3-4 sao recusados; hifen no meio vale", () => {
    expect(subdomainError("-infotec")).toBe(SUBDOMAIN_FORMAT_MESSAGE);
    expect(subdomainError("infotec-")).toBe(SUBDOMAIN_FORMAT_MESSAGE);
    expect(subdomainError("ab--cdef")).toBe(SUBDOMAIN_FORMAT_MESSAGE);
    expect(subdomainError("abc--def")).toBeNull();
    expect(subdomainError("infotec-computadores")).toBeNull();
  });

  it("infotec-computadores e infotec_computadores resultam em infotec-computadores e valem", () => {
    expect(normalizeSubdomain("infotec-computadores")).toBe("infotec-computadores");
    expect(normalizeSubdomain("infotec_computadores")).toBe("infotec-computadores");
    expect(subdomainError("infotec_computadores")).toBeNull();
  });

  it("reservados sao recusados (inclui master)", () => {
    expect(RESERVED_SUBDOMAINS).toContain("master");
    expect(subdomainError("master")).toBe(SUBDOMAIN_RESERVED_MESSAGE);
    expect(subdomainError("admin")).toBe(SUBDOMAIN_RESERVED_MESSAGE);
  });
});

describe("telas do subdominio", () => {
  const read = (rel: string) => readFileSync(join(__dirname, rel), "utf8");

  it("o cadastro usa a regra unica, filtra ao digitar e limpa o aviso ao mexer no campo", () => {
    const src = read("../app/auth/SignupForm.tsx");
    expect(src).toContain("const subdomain = normalizeSubdomain(values.subdomain);");
    expect(src).toContain("subdomainError(subdomain)");
    expect(src).not.toMatch(/a-z0-9_\]\{5,50\}/);
    expect(src).toContain("subdomain: normalizeSubdomain(form.subdomain)");
    expect(src).toContain('applyValue("subdomain", lower)');
    expect(src).toMatch(/onChange=\{\(value\) => \{[\s\S]*?setError\(null\);[\s\S]*?lowerSubdomainWhileTyping\(value\)/);
  });

  it("'Entrar na sua empresa' filtra ao digitar, limpa o aviso e so aceita [a-z0-9-]", () => {
    const src = read("../app/auth/tenant/page.tsx");
    expect(src).toContain("normalizeSubdomain(subdomain)");
    expect(src).toMatch(/setError\(null\);\s*setSubdomain\(lowerSubdomainWhileTyping\(value\)\)/);
    expect(src).toContain("[a-z0-9-]{1,50}");
  });
});

describe("resolucao do host (tenant-host)", () => {
  const original = process.env.SEEDGRID_TENANCY_DOMAIN;
  it("aceita hifen; recusa _, master, curto, ponto e simbolo", () => {
    process.env.SEEDGRID_TENANCY_DOMAIN = "seedgrid.test";
    try {
      expect(resolveTenantHost("infotec-computadores.seedgrid.test")).toBe("infotec-computadores.seedgrid.test");
      expect(() => resolveTenantHost("infotec_antiga.seedgrid.test:3000")).toThrow();
      expect(resolveTenantHost("seedgrid.test")).toBe("seedgrid.test");
      expect(() => resolveTenantHost("master.seedgrid.test")).toThrow();
      expect(() => resolveTenantHost("abcd.seedgrid.test")).toThrow();
      expect(() => resolveTenantHost("a.b-cdef.seedgrid.test")).toThrow();
      expect(() => resolveTenantHost("infotec$.seedgrid.test")).toThrow();
    } finally {
      if (original === undefined) delete process.env.SEEDGRID_TENANCY_DOMAIN;
      else process.env.SEEDGRID_TENANCY_DOMAIN = original;
    }
  });
});
