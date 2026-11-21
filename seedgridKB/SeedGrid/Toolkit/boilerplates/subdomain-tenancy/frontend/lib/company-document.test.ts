import { describe, expect, it, vi } from "vitest";

import { checkCompanyDocumentExists, documentExistsPath } from "./company-document";

// "Empresa ja cadastrada." junto ao CNPJ (P180.F2.T16): a rota do BFF e' dublada; o que se prova e' o que a tela pergunta
// e como ela reage (so o booleano; qualquer falha e' silenciosa).
describe("documentExistsPath", () => {
  it("manda so os digitos e o excludePublicId na edicao", () => {
    expect(documentExistsPath("12.345.678/0001-95")).toBe("/api/security/companies/document-exists?document=12345678000195");
    expect(documentExistsPath("12.345.678/0001-95", "co-1")).toBe(
      "/api/security/companies/document-exists?document=12345678000195&excludePublicId=co-1",
    );
    expect(documentExistsPath("12345678000195", null)).not.toContain("excludePublicId");
  });
});

describe("checkCompanyDocumentExists", () => {
  it("exists=true -> true; exists=false -> false", async () => {
    expect(await checkCompanyDocumentExists(async () => ({ exists: true }), "12.345.678/0001-95")).toBe(true);
    expect(await checkCompanyDocumentExists(async () => ({ exists: false }), "12.345.678/0001-95")).toBe(false);
  });

  it("na edicao passa o excludePublicId para a propria empresa nao contar", async () => {
    const fetcher = vi.fn(async () => ({ exists: false }));
    await checkCompanyDocumentExists(fetcher, "12345678000195", "co-9");
    expect(fetcher).toHaveBeenCalledWith("/api/security/companies/document-exists?document=12345678000195&excludePublicId=co-9");
  });

  it("documento incompleto ou em branco nem chama a rota", async () => {
    const fetcher = vi.fn(async () => ({ exists: true }));
    expect(await checkCompanyDocumentExists(fetcher, "")).toBe(false);
    expect(await checkCompanyDocumentExists(fetcher, "123.456")).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("404 (rota ainda nao existe), erro de rede ou resposta estranha falham em silencio (false, sem lancar)", async () => {
    const failing = async () => {
      throw Object.assign(new Error("Not Found"), { status: 404 });
    };
    expect(await checkCompanyDocumentExists(failing, "12345678000195")).toBe(false);
    expect(await checkCompanyDocumentExists(async () => null, "12345678000195")).toBe(false);
    expect(await checkCompanyDocumentExists(async () => ({}), "12345678000195")).toBe(false);
    expect(await checkCompanyDocumentExists(async () => ({ exists: "true" as unknown as boolean }), "12345678000195")).toBe(false);
  });
});
