import { describe, expect, it } from "vitest";

import {
  buildChangePlanBody,
  buildCheckoutBody,
  buildSaveCompanySelectionBody,
  canReeditCompanySelection,
  choicesMatch,
  companySelectionErrorMessage,
  needsAnySelection,
  countChoices,
  initialChoices,
  mismatchMessage,
  requiredCounts,
  toCompanySelection,
  type CompanyChoices,
  type DowngradeCompanySelectionState,
} from "./downgrade-company-selection";

const company = (id: string) => ({ publicId: id, name: `Empresa ${id}`, accessMode: "ACTIVE" as const });

// Plano: 3 ativas (a plataforma ocupa 1), 2 em somente leitura; 6 elegiveis.
const state: DowngradeCompanySelectionState = {
  status: "OK",
  requiresCompanySelection: true,
  maxCompanies: 3,
  maxReadOnlyCompanies: 2,
  eligibleCompanies: ["a", "b", "c", "d", "e", "f"].map(company),
  protectedCompanies: [{ publicId: "plat", name: "Plataforma", reason: "PLATFORM" }],
};

const exact: CompanyChoices = {
  a: "KEEP_ACTIVE",
  b: "KEEP_ACTIVE",
  c: "READ_ONLY",
  d: "READ_ONLY",
  e: "DISABLE",
  f: "DISABLE",
};

describe("requiredCounts", () => {
  it("desconta as protegidas das ativas e aplica o limite de somente leitura", () => {
    expect(requiredCounts(state)).toEqual({ keepActive: 2, readOnly: 2, disable: 2, remaining: 4 });
  });

  it("somente leitura sem limite deixa a divisao livre (null)", () => {
    expect(requiredCounts({ ...state, maxReadOnlyCompanies: 0 })).toEqual({
      keepActive: 2,
      readOnly: null,
      disable: null,
      remaining: 4,
    });
  });

  it("sem limite de ativas ninguem precisa sair", () => {
    expect(requiredCounts({ ...state, maxCompanies: null })).toEqual({
      keepActive: 6,
      readOnly: 0,
      disable: 0,
      remaining: 0,
    });
  });

  it("protegidas que ja enchem o plano deixam 0 ativas para as elegiveis", () => {
    const full = { ...state, maxCompanies: 1, maxReadOnlyCompanies: 1 };
    expect(requiredCounts(full)).toEqual({ keepActive: 0, readOnly: 1, disable: 5, remaining: 6 });
  });

  it("somente leitura maior que o resto nao gera desligadas negativas", () => {
    const wide = { ...state, maxReadOnlyCompanies: 10 };
    expect(requiredCounts(wide)).toEqual({ keepActive: 2, readOnly: 4, disable: 0, remaining: 4 });
  });
});

describe("choicesMatch / mismatchMessage", () => {
  it("so confirma com as contagens exatas", () => {
    expect(choicesMatch(state, exact)).toBe(true);
    expect(mismatchMessage(state, exact)).toBeNull();
  });

  it("recusa empresa sem escolha", () => {
    const missing: CompanyChoices = { ...exact, f: null };
    expect(choicesMatch(state, missing)).toBe(false);
    expect(mismatchMessage(state, missing)).toContain("1 empresa(s) sem escolha");
  });

  it("recusa contagem a mais ou a menos em qualquer balde", () => {
    expect(choicesMatch(state, { ...exact, e: "KEEP_ACTIVE" })).toBe(false);
    expect(choicesMatch(state, { ...exact, c: "DISABLE" })).toBe(false);
    expect(mismatchMessage(state, { ...exact, e: "KEEP_ACTIVE" })).toContain("manter ativa: 3 de 2");
  });

  it("com somente leitura livre aceita qualquer divisao do resto", () => {
    const free = { ...state, maxReadOnlyCompanies: null };
    expect(choicesMatch(free, { ...exact, c: "DISABLE", d: "DISABLE" })).toBe(true);
    expect(choicesMatch(free, { ...exact, e: "READ_ONLY", f: "READ_ONLY" })).toBe(true);
    expect(choicesMatch(free, { ...exact, e: "KEEP_ACTIVE" })).toBe(false);
  });

  it("countChoices conta as indecisas", () => {
    expect(countChoices(state, { a: "KEEP_ACTIVE" })).toEqual({
      keepActive: 1,
      readOnly: 0,
      disable: 0,
      undecided: 5,
    });
  });
});

describe("toCompanySelection / initialChoices", () => {
  it("monta o companySelection com as protegidas em keepActive", () => {
    expect(toCompanySelection(state, exact)).toEqual({
      keepActive: ["plat", "a", "b"],
      readOnly: ["c", "d"],
      disable: ["e", "f"],
    });
  });

  it("nao monta enquanto a contagem nao bate", () => {
    expect(toCompanySelection(state, { ...exact, f: "READ_ONLY" })).toBeNull();
  });

  it("reedicao parte da selecao salva e ignora ids que nao sao elegiveis", () => {
    const saved = {
      ...state,
      selection: { keepActive: ["plat", "a"], readOnly: ["c"], disable: ["e", "fantasma"] },
    };
    expect(initialChoices(saved)).toEqual({ a: "KEEP_ACTIVE", c: "READ_ONLY", e: "DISABLE" });
    expect(initialChoices(state)).toEqual({});
  });
});

describe("buildChangePlanBody", () => {
  it("leva companySelection ao lado de userPublicIdsToDeactivate", () => {
    const selection = { keepActive: ["a"], readOnly: ["b"], disable: ["c"] };
    expect(buildChangePlanBody("p1", ["u1"], selection)).toEqual({
      planId: "p1",
      userPublicIdsToDeactivate: ["u1"],
      companySelection: selection,
    });
    expect(buildChangePlanBody("p1")).toEqual({
      planId: "p1",
      userPublicIdsToDeactivate: null,
      companySelection: null,
    });
  });
});

describe("checkout com selecao de empresas (T5.13)", () => {
  const selection = { keepActive: ["a", "a"], readOnly: ["b"], disable: ["c"] };

  it("buildCheckoutBody manda companySelection sem repeticao, ao lado de planId e usuarios", () => {
    expect(buildCheckoutBody("p1", ["u1"], selection)).toEqual({
      planId: "p1",
      userPublicIdsToDeactivate: ["u1"],
      companySelection: { keepActive: ["a"], readOnly: ["b"], disable: ["c"] },
    });
    expect(buildCheckoutBody("p1")).toEqual({
      planId: "p1",
      userPublicIdsToDeactivate: null,
      companySelection: null,
    });
  });

  it("buildSaveCompanySelectionBody e o corpo do PUT: so as tres listas", () => {
    expect(buildSaveCompanySelectionBody(selection)).toEqual({
      keepActive: ["a"],
      readOnly: ["b"],
      disable: ["c"],
    });
  });

  it("needsAnySelection: usuarios OU empresas", () => {
    expect(needsAnySelection({ requiresUserSelection: true })).toBe(true);
    expect(needsAnySelection({ requiresCompanySelection: true })).toBe(true);
    expect(needsAnySelection({ requiresUserSelection: false, requiresCompanySelection: false })).toBe(false);
    expect(needsAnySelection(null)).toBe(false);
  });

  it("canReeditCompanySelection: so com troca pendente e algo a escolher", () => {
    expect(canReeditCompanySelection({ status: "OK", requiresCompanySelection: true })).toBe(true);
    expect(canReeditCompanySelection({ status: "OK", requiresCompanySelection: false })).toBe(false);
    expect(canReeditCompanySelection({ status: "NO_PENDING_CHANGE", requiresCompanySelection: true })).toBe(false);
    expect(canReeditCompanySelection(null)).toBe(false);
  });

  it("traduz INVALID_COMPANY_SELECTION e COMPANY_SELECTION_NOT_REQUIRED", () => {
    expect(companySelectionErrorMessage("INVALID_COMPANY_SELECTION")).toMatch(/não confere/);
    expect(companySelectionErrorMessage("COMPANY_SELECTION_NOT_REQUIRED")).toMatch(/Não há empresas/);
    expect(companySelectionErrorMessage("OUTRO")).toBeNull();
  });
});
