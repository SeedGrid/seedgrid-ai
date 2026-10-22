import { describe, expect, it } from "vitest";

import {
  companyOptionLabel,
  isReadOnlyMode,
  isWritePermission,
  normalizeAccessMode,
  parseCurrentCompany,
  resolveAccessModeFallback,
  serializeCurrentCompany,
} from "./company-access";

describe("normalizeAccessMode", () => {
  it("aceita os tres estados e trata o resto como ACTIVE", () => {
    expect(normalizeAccessMode("READ_ONLY")).toBe("READ_ONLY");
    expect(normalizeAccessMode("DISABLED")).toBe("DISABLED");
    expect(normalizeAccessMode("ACTIVE")).toBe("ACTIVE");
    expect(normalizeAccessMode(undefined)).toBe("ACTIVE");
    expect(normalizeAccessMode("read_only")).toBe("ACTIVE");
  });
});

describe("parseCurrentCompany / serializeCurrentCompany", () => {
  it("le objeto e texto JSON e faz o round-trip", () => {
    const company = parseCurrentCompany({
      publicId: "c1",
      name: "Matriz",
      accessMode: "READ_ONLY",
      personType: "PJ",
    });
    expect(company).toEqual({ publicId: "c1", name: "Matriz", accessMode: "READ_ONLY", personType: "PJ" });
    expect(parseCurrentCompany(serializeCurrentCompany(company!))).toEqual(company);
  });

  it("sem accessMode cai em ACTIVE; sem publicId ou lixo vira null", () => {
    expect(parseCurrentCompany({ publicId: "c1", name: "A" })?.accessMode).toBe("ACTIVE");
    expect(parseCurrentCompany({ name: "A" })).toBeNull();
    expect(parseCurrentCompany("{quebrado")).toBeNull();
    expect(parseCurrentCompany("texto")).toBeNull();
    expect(parseCurrentCompany(null)).toBeNull();
  });
});

describe("isWritePermission", () => {
  it("reconhece as permissoes de escrita das telas CRUD", () => {
    for (const p of ["USER_CREATE", "USER_UPDATE", "ROLE_DELETE", "APIKEY_REVOKE", "SELFENTER_INVITE", "PESSOA_UPDATE"]) {
      expect(isWritePermission(p)).toBe(true);
    }
  });

  it("deixa a leitura passar", () => {
    for (const p of ["USER_READ", "ROLE_READ", "LOG_READ", "APIKEY_READ", "PESSOA_READ", "ADMIN_HEALTH_READ"]) {
      expect(isWritePermission(p)).toBe(false);
    }
  });
});

describe("rotulos", () => {
  it("marca o estado so' quando nao e' ACTIVE", () => {
    expect(companyOptionLabel("Filial", "ACTIVE")).toBe("Filial");
    expect(companyOptionLabel("Filial", "READ_ONLY")).toBe("Filial (somente leitura)");
    expect(companyOptionLabel("Filial", "DISABLED")).toBe("Filial (desativada)");
    expect(isReadOnlyMode("READ_ONLY")).toBe(true);
    expect(isReadOnlyMode("ACTIVE")).toBe(false);
    expect(isReadOnlyMode(null)).toBe(false);
  });
});

describe("estado de acesso do login/refresh e fallback (T5.13)", () => {
  it("accessMode informado pelo login e respeitado e nao marca desconhecido", () => {
    const company = parseCurrentCompany({ publicId: "c1", name: "A", accessMode: "READ_ONLY" });
    expect(company?.accessMode).toBe("READ_ONLY");
    expect(company?.accessModeKnown).toBeUndefined();
  });

  it("sem accessMode marca desconhecido e o round-trip do cookie preserva isso", () => {
    const company = parseCurrentCompany({ publicId: "c1", name: "A" });
    expect(company).toMatchObject({ accessMode: "ACTIVE", accessModeKnown: false });
    expect(JSON.parse(serializeCurrentCompany(company!)).accessMode).toBeNull();
    expect(parseCurrentCompany(serializeCurrentCompany(company!))?.accessModeKnown).toBe(false);
  });

  it("resolveAccessModeFallback usa /me/companies so quando o login nao informou", () => {
    const unknown = parseCurrentCompany({ publicId: "c1", name: "A" });
    const mine = [
      { publicId: "c1", accessMode: "READ_ONLY" as const },
      { publicId: "c2", accessMode: "ACTIVE" as const },
    ];
    const resolved = resolveAccessModeFallback(unknown, mine);
    expect(resolved?.accessMode).toBe("READ_ONLY");
    expect(resolved?.accessModeKnown).toBeUndefined();
    expect(resolveAccessModeFallback(unknown, [{ publicId: "x", accessMode: "DISABLED" }])).toBe(unknown);
    const known = parseCurrentCompany({ publicId: "c1", name: "A", accessMode: "ACTIVE" });
    expect(resolveAccessModeFallback(known, mine)?.accessMode).toBe("ACTIVE");
    expect(resolveAccessModeFallback(null, mine)).toBeNull();
  });
});
