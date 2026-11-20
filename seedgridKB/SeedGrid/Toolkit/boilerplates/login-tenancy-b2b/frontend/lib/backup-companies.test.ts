import { describe, expect, it } from "vitest";

import {
  backupCompanyHeader,
  backupCompanyPayload,
  parseBackupCompanies,
  shouldShowBackupCompanySelector,
} from "./backup-companies";

const A = { publicId: "a", name: "Filial A" };
const B = { publicId: "b", name: "Filial B" };

describe("parseBackupCompanies", () => {
  it("le nome fantasia, depois razao social, depois o id; descarta sem publicId e desativada", () => {
    expect(
      parseBackupCompanies([
        { publicId: "a", tradeName: "Filial A" },
        { publicId: "b", corporateName: "B Ltda" },
        { publicId: "c" },
        { tradeName: "sem id" },
        { publicId: "d", tradeName: "Fora", accessMode: "DISABLED" },
        { publicId: "e", tradeName: "Leitura", accessMode: "READ_ONLY" },
        null,
      ]),
    ).toEqual([
      { publicId: "a", name: "Filial A" },
      { publicId: "b", name: "B Ltda" },
      { publicId: "c", name: "c" },
      { publicId: "e", name: "Leitura" },
    ]);
  });

  it("lista invalida vira vazia", () => {
    expect(parseBackupCompanies(null)).toEqual([]);
    expect(parseBackupCompanies({})).toEqual([]);
  });
});

describe("seletor de filiais (FE-38)", () => {
  it("so' aparece com mais de uma empresa", () => {
    expect(shouldShowBackupCompanySelector([])).toBe(false);
    expect(shouldShowBackupCompanySelector([A])).toBe(false);
    expect(shouldShowBackupCompanySelector([A, B])).toBe(true);
  });
});

describe("backupCompanyPayload", () => {
  it("Todas (padrao) nao manda companyPublicIds", () => {
    expect(backupCompanyPayload("ALL", ["a"], [A, B])).toEqual({});
  });

  it("com uma empresa so' nao ha escolha: nao manda nada", () => {
    expect(backupCompanyPayload("SOME", [], [A])).toEqual({});
  });

  it("Algumas manda as marcadas, sem repetir e sem ids que nao sao do usuario", () => {
    expect(backupCompanyPayload("SOME", ["b", "b", "x"], [A, B])).toEqual({ companyPublicIds: ["b"] });
    expect(backupCompanyPayload("SOME", ["a", "b"], [A, B])).toEqual({ companyPublicIds: ["a", "b"] });
  });

  it("Algumas sem nenhuma marcada e' erro", () => {
    expect(backupCompanyPayload("SOME", [], [A, B])).toEqual({
      error: "Escolha ao menos uma filial ou volte para Todas.",
    });
  });
});

describe("backupCompanyHeader", () => {
  it("prefere a corrente, depois a primeira escolhida, depois a primeira do usuario", () => {
    expect(backupCompanyHeader("a", ["b"], [A, B])).toBe("a");
    expect(backupCompanyHeader(null, ["b"], [A, B])).toBe("b");
    expect(backupCompanyHeader(undefined, undefined, [A, B])).toBe("a");
    expect(backupCompanyHeader("", [], [])).toBeNull();
  });
});
