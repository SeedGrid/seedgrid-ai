import { describe, expect, it } from "vitest";

import {
  toSecurityUserCreate,
  toSecurityUserPatch,
  toUserEntry,
  type SecurityUser,
} from "./security-admin";

const form = {
  email: "a@b.com",
  name: "Fulano de Tal",
  password: "Senha#123",
  rolePublicIds: ["r-global"],
  memberships: [
    { companyPublicId: "c1", rolePublicIds: ["r1"] },
    { companyPublicId: "c2", rolePublicIds: [] },
  ],
};

describe("toSecurityUserCreate", () => {
  it("envia perfis globais e vinculos por publicId (sem ids Long, sem isRoot)", () => {
    const body = toSecurityUserCreate(form);
    expect(body.rolePublicIds).toEqual(["r-global"]);
    expect(body.memberships).toEqual(form.memberships);
    expect(body).not.toHaveProperty("roleIds");
    expect(body).not.toHaveProperty("companyIds");
    expect(JSON.stringify(body)).not.toContain("isRoot");
  });

  it("sem vinculos manda lista vazia (so' os perfis globais)", () => {
    const body = toSecurityUserCreate({ ...form, memberships: undefined, rolePublicIds: undefined });
    expect(body.memberships).toEqual([]);
    expect(body.rolePublicIds).toEqual([]);
  });
});

describe("toSecurityUserPatch", () => {
  it("inclui memberships quando informado", () => {
    expect(toSecurityUserPatch(form).memberships).toEqual(form.memberships);
  });

  it("sem memberships a chave nem vai no corpo (vinculos intactos)", () => {
    const patch = toSecurityUserPatch({ ...form, memberships: undefined });
    expect("memberships" in patch).toBe(false);
    expect(patch.rolePublicIds).toEqual(["r-global"]);
  });

  it("senha em branco nao vai", () => {
    expect("password" in toSecurityUserPatch({ ...form, password: "  " })).toBe(false);
  });
});

describe("toUserEntry", () => {
  const base: SecurityUser = {
    publicId: "u1",
    email: "a@b.com",
    name: "Fulano de Tal",
    whatsApp: "",
    active: true,
    root: false,
    changePasswordRequired: false,
    passwordExpiresAt: null,
    twoFactorEnabled: false,
    emailConfirmed: true,
    companiesCount: 2,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  };

  it("mapeia os vinculos quando o backend os devolve", () => {
    const entry = toUserEntry({
      ...base,
      memberships: [{ companyPublicId: "c1", rolePublicIds: ["r1"] }],
    });
    expect(entry.memberships).toEqual([{ companyPublicId: "c1", rolePublicIds: ["r1"] }]);
  });

  it("sem vinculos na resposta o campo fica indefinido (tela nao inventa)", () => {
    expect(toUserEntry(base).memberships).toBeUndefined();
  });
});
