import { describe, expect, it } from "vitest";

import type { MyCompany } from "./my-companies";
import {
  editorMemberships,
  membershipCompanyLabel,
  offerableCompanies,
  parseMemberships,
  setMembershipCompanies,
  setMembershipRoles,
  toMembershipsPayload,
} from "./user-memberships";

describe("parseMemberships", () => {
  it("le rolePublicIds e o formato roles[{publicId}], sem repeticao", () => {
    expect(
      parseMemberships([
        { companyPublicId: "c1", rolePublicIds: ["r1", "r1", "r2"] },
        { companyPublicId: "c2", roles: [{ publicId: "r3" }, { publicId: "r3" }] },
        { companyPublicId: "c1", rolePublicIds: ["x"] },
      ]),
    ).toEqual([
      { companyPublicId: "c1", rolePublicIds: ["r1", "r2"] },
      { companyPublicId: "c2", rolePublicIds: ["r3"] },
    ]);
  });

  it("ignora lixo", () => {
    expect(parseMemberships(undefined)).toEqual([]);
    expect(parseMemberships([null, 1, {}, { companyPublicId: " " }])).toEqual([]);
  });
});

describe("setMembershipCompanies / setMembershipRoles", () => {
  it("marcar cria o vinculo sem perfis; desmarcar remove; os perfis ja escolhidos sobrevivem", () => {
    let drafts = setMembershipCompanies([], ["c1"]);
    expect(drafts).toEqual([{ companyPublicId: "c1", rolePublicIds: [] }]);
    drafts = setMembershipRoles(drafts, "c1", ["r1", "r1"]);
    drafts = setMembershipCompanies(drafts, ["c1", "c2"]);
    expect(drafts).toEqual([
      { companyPublicId: "c1", rolePublicIds: ["r1"] },
      { companyPublicId: "c2", rolePublicIds: [] },
    ]);
    expect(setMembershipCompanies(drafts, ["c2"])).toEqual([
      { companyPublicId: "c2", rolePublicIds: [] },
    ]);
  });

  it("trocar perfis de uma empresa nao mexe nas outras", () => {
    const drafts = setMembershipCompanies([], ["c1", "c2"]);
    expect(setMembershipRoles(drafts, "c2", ["r9"])).toEqual([
      { companyPublicId: "c1", rolePublicIds: [] },
      { companyPublicId: "c2", rolePublicIds: ["r9"] },
    ]);
  });
});

describe("toMembershipsPayload", () => {
  it("descarta empresa fora das do chamador e perfil desconhecido; nao repete", () => {
    const drafts = [
      { companyPublicId: "c1", rolePublicIds: ["r1", "integracao", "r1"] },
      { companyPublicId: "alheia", rolePublicIds: ["r1"] },
      { companyPublicId: "c1", rolePublicIds: ["r2"] },
      { companyPublicId: "c2", rolePublicIds: [] },
    ];
    expect(toMembershipsPayload(drafts, ["c1", "c2"], ["r1", "r2"])).toEqual([
      { companyPublicId: "c1", rolePublicIds: ["r1"] },
      { companyPublicId: "c2", rolePublicIds: [] },
    ]);
  });

  it("sem lista de perfis conhecidos mantem os informados; sem rascunhos, lista vazia", () => {
    expect(toMembershipsPayload([{ companyPublicId: "c1", rolePublicIds: ["x"] }], ["c1"])).toEqual([
      { companyPublicId: "c1", rolePublicIds: ["x"] },
    ]);
    expect(toMembershipsPayload([], ["c1"])).toEqual([]);
  });
});

describe("offerableCompanies", () => {
  it("nao oferece empresa desativada, mas oferece a somente leitura", () => {
    const mine: MyCompany[] = [
      { publicId: "a", name: "A", accessMode: "ACTIVE" },
      { publicId: "b", name: "B", accessMode: "READ_ONLY" },
      { publicId: "c", name: "C", accessMode: "DISABLED" },
    ];
    expect(offerableCompanies(mine).map((c) => c.publicId)).toEqual(["a", "b"]);
  });
});

describe("memberships do UserDTORes (T5.13)", () => {
  it("le o contrato de leitura: companyName e roles[{publicId,name}]", () => {
    expect(
      parseMemberships([
        { companyPublicId: "c1", companyName: " Matriz ", roles: [{ publicId: "r1", name: "ADMIN" }] },
      ]),
    ).toEqual([{ companyPublicId: "c1", rolePublicIds: ["r1"], companyName: "Matriz" }]);
  });

  it("toMembershipsPayload nao devolve companyName (so o formato de escrita)", () => {
    const drafts = parseMemberships([{ companyPublicId: "c1", companyName: "Matriz", roles: [{ publicId: "r1" }] }]);
    expect(toMembershipsPayload(drafts, ["c1"])).toEqual([{ companyPublicId: "c1", rolePublicIds: ["r1"] }]);
  });

  it("editorMemberships: sem memberships no usuario (backend antigo) = desconhecido", () => {
    expect(editorMemberships(undefined)).toEqual({ memberships: [], known: false });
    expect(editorMemberships([])).toEqual({ memberships: [], known: true });
    const drafts = [{ companyPublicId: "c1", rolePublicIds: ["r1"] }];
    expect(editorMemberships(drafts)).toEqual({ memberships: drafts, known: true });
  });

  it("membershipCompanyLabel: nome da lista do chamador, senao o do usuario, senao o publicId", () => {
    const mine: MyCompany[] = [{ publicId: "c1", name: "Filial", accessMode: "ACTIVE" }];
    expect(membershipCompanyLabel({ companyPublicId: "c1", rolePublicIds: [], companyName: "X" }, mine)).toBe("Filial");
    expect(membershipCompanyLabel({ companyPublicId: "c9", rolePublicIds: [], companyName: "Outra" }, mine)).toBe("Outra");
    expect(membershipCompanyLabel({ companyPublicId: "c9", rolePublicIds: [] }, mine)).toBe("c9");
  });
});
