import { describe, expect, it } from "vitest";

import { parseMyCompanies, shouldShowCompanySelector, toCompanyOptions } from "./my-companies";

describe("parseMyCompanies", () => {
  it("usa o nome fantasia, depois a razao social, depois o id, e normaliza o estado", () => {
    const list = parseMyCompanies([
      { publicId: "a", tradeName: "Loja A", corporateName: "A LTDA", accessMode: "READ_ONLY" },
      { publicId: "b", tradeName: " ", corporateName: "B LTDA" },
      { publicId: "c" },
    ]);
    expect(list).toEqual([
      { publicId: "a", name: "Loja A", accessMode: "READ_ONLY" },
      { publicId: "b", name: "B LTDA", accessMode: "ACTIVE" },
      { publicId: "c", name: "c", accessMode: "ACTIVE" },
    ]);
  });

  it("descarta item sem publicId e entrada que nao e' lista", () => {
    expect(parseMyCompanies([{ tradeName: "X" }, null, {}])).toEqual([]);
    expect(parseMyCompanies({ items: [] })).toEqual([]);
    expect(parseMyCompanies(null)).toEqual([]);
  });
});

describe("toCompanyOptions", () => {
  it("marca o estado no rotulo e trava a empresa desativada", () => {
    const options = toCompanyOptions([
      { publicId: "a", name: "Matriz", accessMode: "ACTIVE" },
      { publicId: "b", name: "Filial", accessMode: "READ_ONLY" },
      { publicId: "c", name: "Antiga", accessMode: "DISABLED" },
    ]);
    expect(options).toEqual([
      { id: "a", label: "Matriz", disabled: false },
      { id: "b", label: "Filial (somente leitura)", disabled: false },
      { id: "c", label: "Antiga (desativada)", disabled: true },
    ]);
  });

  it("so' mostra o seletor com mais de uma empresa", () => {
    const one = [{ publicId: "a", name: "A", accessMode: "ACTIVE" as const }];
    expect(shouldShowCompanySelector(one)).toBe(false);
    expect(shouldShowCompanySelector([...one, { ...one[0], publicId: "b" }])).toBe(true);
  });
});

describe("parseMyCompanies - personType", () => {
  it("carrega o tipo de pessoa so' quando a API informa", () => {
    const list = parseMyCompanies([
      { publicId: "a", tradeName: "A", personType: " PJ " },
      { publicId: "b", tradeName: "B", personType: 3 },
    ]);
    expect(list[0].personType).toBe("PJ");
    expect(list[1]).not.toHaveProperty("personType");
  });
});
