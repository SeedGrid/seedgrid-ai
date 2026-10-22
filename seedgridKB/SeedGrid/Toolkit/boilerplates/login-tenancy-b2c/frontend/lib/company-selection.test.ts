import { describe, expect, it, vi } from "vitest";

import {
  COMPANY_SELECT_PATH,
  SELECT_COMPANY_FALLBACK_MESSAGE,
  SELECT_COMPANY_FORBIDDEN_MESSAGE,
  SELECT_COMPANY_SESSION_MESSAGE,
  accessModeBadge,
  buildSessionResponseBody,
  canSelectCompany,
  defaultCompanySelection,
  isCompanySelectionRequired,
  mapSelectCompanyError,
  personTypeLabel,
  requestSelectCompany,
  resolvePostLoginPath,
  sortCompaniesForSelection,
} from "./company-selection";
import { COMPANY_DISABLED_MESSAGE } from "./api-error";
import type { MyCompany } from "./my-companies";

const company = (publicId: string, name: string, accessMode: MyCompany["accessMode"]): MyCompany => ({
  publicId,
  name,
  accessMode,
});

describe("isCompanySelectionRequired / resolvePostLoginPath", () => {
  it("so' o true literal pede a escolha (ausente = backend antigo)", () => {
    expect(isCompanySelectionRequired({ companySelectionRequired: true })).toBe(true);
    expect(isCompanySelectionRequired({ companySelectionRequired: "true" })).toBe(false);
    expect(isCompanySelectionRequired({})).toBe(false);
    expect(isCompanySelectionRequired(null)).toBe(false);
  });

  it("escolha da empresa vem antes da troca obrigatoria de senha", () => {
    expect(resolvePostLoginPath({ companySelectionRequired: true, changePasswordRequired: true })).toBe(
      COMPANY_SELECT_PATH,
    );
    expect(resolvePostLoginPath({ changePasswordRequired: true })).toBe("/change-password");
    expect(resolvePostLoginPath({ status: "OK" })).toBe("/");
    expect(resolvePostLoginPath(null)).toBe("/");
  });
});

describe("buildSessionResponseBody", () => {
  it("nunca leva o token e normaliza as flags", () => {
    const body = buildSessionResponseBody({
      token: "segredo",
      publicId: "u1",
      changePasswordRequired: true,
      companySelectionRequired: true,
    } as never);
    expect(body).toEqual({
      status: "OK",
      changePasswordRequired: true,
      twoFactorEnabled: false,
      publicId: "u1",
      companySelectionRequired: true,
    });
    expect(JSON.stringify(body)).not.toContain("segredo");
  });

  it("campos ausentes viram false/null", () => {
    expect(buildSessionResponseBody({})).toEqual({
      status: "OK",
      changePasswordRequired: false,
      twoFactorEnabled: false,
      publicId: null,
      companySelectionRequired: false,
    });
  });
});

describe("ordenacao e escolha", () => {
  const list = [
    company("d", "Zeta", "DISABLED"),
    company("r", "beta", "READ_ONLY"),
    company("a2", "Ágata", "ACTIVE"),
    company("a1", "Alfa", "ACTIVE"),
  ];

  it("ativas primeiro, depois somente leitura, desativadas por ultimo; nome sem diferenciar acento/caixa", () => {
    expect(sortCompaniesForSelection(list).map((c) => c.publicId)).toEqual(["a2", "a1", "r", "d"]);
  });

  it("nao altera a lista original", () => {
    const copy = [...list];
    sortCompaniesForSelection(list);
    expect(list).toEqual(copy);
  });

  it("desativada nao pode ser escolhida; somente leitura pode", () => {
    expect(canSelectCompany({ accessMode: "DISABLED" })).toBe(false);
    expect(canSelectCompany({ accessMode: "READ_ONLY" })).toBe(true);
    expect(canSelectCompany({ accessMode: "ACTIVE" })).toBe(true);
  });

  it("pre-seleciona a primeira escolhivel; so' desativadas = nenhuma", () => {
    expect(defaultCompanySelection(sortCompaniesForSelection(list))).toBe("a2");
    expect(defaultCompanySelection([company("d", "X", "DISABLED"), company("r", "Y", "READ_ONLY")])).toBe("r");
    expect(defaultCompanySelection([company("d", "X", "DISABLED")])).toBeNull();
    expect(defaultCompanySelection([])).toBeNull();
  });
});

describe("rotulos", () => {
  it("personType vira PJ/PF; desconhecido nao aparece", () => {
    expect(personTypeLabel("PJ")).toBe("PJ");
    expect(personTypeLabel(" legal ")).toBe("PJ");
    expect(personTypeLabel("NATURAL")).toBe("PF");
    expect(personTypeLabel("pf")).toBe("PF");
    expect(personTypeLabel("OUTRO")).toBeNull();
    expect(personTypeLabel(undefined)).toBeNull();
  });

  it("selo por accessMode", () => {
    expect(accessModeBadge("ACTIVE").tone).toBe("success");
    expect(accessModeBadge("READ_ONLY")).toEqual({ label: "Somente leitura", tone: "warning" });
    expect(accessModeBadge("DISABLED")).toEqual({ label: "Desativada", tone: "error" });
  });
});

describe("mapSelectCompanyError", () => {
  it("COMPANY_DISABLED (403) marca a empresa desativada e nao perde a sessao", () => {
    expect(mapSelectCompanyError(403, { code: "COMPANY_DISABLED", detail: "x" })).toEqual({
      message: COMPANY_DISABLED_MESSAGE,
      sessionLost: false,
      companyDisabled: true,
    });
  });

  it("COMPANY_READ_ONLY nao se aplica a selecao: cai no 403 generico", () => {
    const result = mapSelectCompanyError(403, { code: "COMPANY_READ_ONLY" });
    expect(result.message).toBe(SELECT_COMPANY_FORBIDDEN_MESSAGE);
    expect(result.companyDisabled).toBe(false);
  });

  it("401 manda para o login", () => {
    expect(mapSelectCompanyError(401, null)).toEqual({
      message: SELECT_COMPANY_SESSION_MESSAGE,
      sessionLost: true,
      companyDisabled: false,
    });
  });

  it("usa o detail do problem+json ou o fallback", () => {
    expect(mapSelectCompanyError(400, { detail: "Empresa invalida." }).message).toBe("Empresa invalida.");
    expect(mapSelectCompanyError(500, { detail: "  " }).message).toBe(SELECT_COMPANY_FALLBACK_MESSAGE);
    expect(mapSelectCompanyError(502, "texto").message).toBe(SELECT_COMPANY_FALLBACK_MESSAGE);
  });
});

describe("requestSelectCompany", () => {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  it("posta {companyPublicId} no BFF e devolve changePasswordRequired", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, { status: "OK", changePasswordRequired: true }));
    const result = await requestSelectCompany("c1", fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ ok: true, changePasswordRequired: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/me/select-company");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ companyPublicId: "c1" });
  });

  it("erro do backend vira erro tratado", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(403, { code: "COMPANY_DISABLED" }));
    const result = await requestSelectCompany("c1", fetchImpl as unknown as typeof fetch);
    expect(result).toMatchObject({ ok: false, companyDisabled: true, sessionLost: false });
  });

  it("falha de rede nao lanca", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await requestSelectCompany("c1", fetchImpl as unknown as typeof fetch);
    expect(result).toMatchObject({ ok: false, sessionLost: false, companyDisabled: false });
  });
});
