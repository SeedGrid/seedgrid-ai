import { describe, expect, it } from "vitest";

import {
  EMPTY_COMPANY_FORM,
  buildCompanyPage,
  companyErrorFromThrown,
  companyErrorMessage,
  filterCompanies,
  formFromEntry,
  formatCompanyAddress,
  formatCpfCnpj,
  parseCompanyListQuery,
  sortCompanies,
  toActivePatch,
  toCompanyBody,
  toCompanyEntry,
  validateCompanyForm,
  type CompanyListQuery,
  type SecurityCompany,
} from "./companies";

const base: SecurityCompany[] = [
  {
    publicId: "c1",
    personType: "PJ",
    cpfCnpj: "12345678000195",
    accessMode: "ACTIVE",
    corporateName: "Beta Ltda",
    tradeName: "Beta",
    active: true,
    addrStreet: "Rua A",
    addrNumber: "10",
    addrCity: "Sao Paulo",
    addrState: "sp",
  },
  {
    publicId: "c2",
    personType: "PF",
    cpfCnpj: "12345678909",
    accessMode: "READ_ONLY",
    corporateName: "Alfa Silva",
    tradeName: "Alfa",
    active: true,
  },
  {
    publicId: "c3",
    personType: "PJ",
    cpfCnpj: "98765432000110",
    accessMode: "DISABLED",
    corporateName: "Gama SA",
    tradeName: "Gama",
    active: false,
  },
];

const allQuery: CompanyListQuery = {
  page: 0,
  size: 10,
  q: "",
  sortField: "corporateName",
  sortOrder: "asc",
  accessMode: "ALL",
  active: "ALL",
};

describe("toCompanyEntry", () => {
  it("normaliza campos ausentes (backend antigo sem accessMode/personType)", () => {
    const entry = toCompanyEntry({ publicId: "x" });
    expect(entry.accessMode).toBe("ACTIVE");
    expect(entry.personType).toBe("PJ");
    expect(entry.active).toBe(true);
    expect(entry.corporateName).toBe("");
  });

  it("mantem accessMode valido, ignora o invalido e deixa so digitos no documento", () => {
    expect(toCompanyEntry({ publicId: "x", accessMode: "read_only" }).accessMode).toBe("READ_ONLY");
    expect(toCompanyEntry({ publicId: "x", accessMode: "OUTRO" }).accessMode).toBe("ACTIVE");
    expect(toCompanyEntry({ publicId: "x", cpfCnpj: "12.345.678/0001-95" }).cpfCnpj).toBe("12345678000195");
    expect(toCompanyEntry({ publicId: "x", addrState: "sp" }).addrState).toBe("SP");
  });
});

describe("formatacao", () => {
  it("formata CPF e CNPJ", () => {
    expect(formatCpfCnpj("12345678909")).toBe("123.456.789-09");
    expect(formatCpfCnpj("12345678000195")).toBe("12.345.678/0001-95");
    expect(formatCpfCnpj("123")).toBe("123");
    expect(formatCpfCnpj(null)).toBe("");
  });

  it("monta o endereco so com o que existe", () => {
    expect(formatCompanyAddress(toCompanyEntry(base[0]))).toBe("Rua A, 10 - Sao Paulo/SP");
    expect(formatCompanyAddress(toCompanyEntry(base[1]))).toBe("");
  });

  it("mostra a cidade pelo objeto city devolvido (nao pelo texto)", () => {
    const entry = toCompanyEntry({
      publicId: "x",
      addrStreet: "Rua A",
      addrCity: "texto antigo",
      addrState: "RJ",
      city: { id: 4853, name: "Sao Paulo", ibgeCode: "3550308", uf: "sp" },
    });
    expect(entry.city).toEqual({ id: 4853, name: "Sao Paulo", ibgeCode: "3550308", uf: "SP" });
    expect(formatCompanyAddress(entry)).toBe("Rua A - Sao Paulo/SP");
    expect(toCompanyEntry({ publicId: "y", addrCity: "so texto" }).city).toBeNull();
  });
});

describe("filtros por estado, situacao e busca", () => {
  const entries = base.map(toCompanyEntry);

  it("filtra por accessMode", () => {
    expect(filterCompanies(entries, { ...allQuery, accessMode: "READ_ONLY" }).map((c) => c.publicId)).toEqual(["c2"]);
    expect(filterCompanies(entries, { ...allQuery, accessMode: "DISABLED" }).map((c) => c.publicId)).toEqual(["c3"]);
    expect(filterCompanies(entries, allQuery)).toHaveLength(3);
  });

  it("filtra por ativo/inativo", () => {
    expect(filterCompanies(entries, { ...allQuery, active: "ACTIVE" })).toHaveLength(2);
    expect(filterCompanies(entries, { ...allQuery, active: "INACTIVE" }).map((c) => c.publicId)).toEqual(["c3"]);
  });

  it("busca por nome e por documento (com ou sem mascara)", () => {
    expect(filterCompanies(entries, { ...allQuery, q: "alfa" }).map((c) => c.publicId)).toEqual(["c2"]);
    expect(filterCompanies(entries, { ...allQuery, q: "12.345.678/0001-95" }).map((c) => c.publicId)).toEqual(["c1"]);
    expect(filterCompanies(entries, { ...allQuery, q: "zzz" })).toHaveLength(0);
  });

  it("combina os filtros", () => {
    expect(filterCompanies(entries, { ...allQuery, accessMode: "DISABLED", active: "ACTIVE" })).toHaveLength(0);
  });
});

describe("ordenacao e paginacao", () => {
  it("ordena asc/desc e cai na razao social se o campo for desconhecido", () => {
    const entries = base.map(toCompanyEntry);
    expect(sortCompanies(entries, "corporateName", "asc").map((c) => c.publicId)).toEqual(["c2", "c1", "c3"]);
    expect(sortCompanies(entries, "corporateName", "desc").map((c) => c.publicId)).toEqual(["c3", "c1", "c2"]);
    expect(sortCompanies(entries, "campo_que_nao_existe", "asc").map((c) => c.publicId)).toEqual(["c2", "c1", "c3"]);
    expect(sortCompanies(entries, "active", "asc")[0].publicId).toBe("c3");
  });

  it("pagina depois de filtrar e informa o total filtrado", () => {
    const page = buildCompanyPage(base, { ...allQuery, size: 2, page: 1 });
    expect(page.totalRecords).toBe(3);
    expect(page.items.map((c) => c.publicId)).toEqual(["c3"]);
    const filtered = buildCompanyPage(base, { ...allQuery, accessMode: "READ_ONLY" });
    expect(filtered.totalRecords).toBe(1);
  });

  it("parseCompanyListQuery aplica padroes e limites seguros", () => {
    const parsed = parseCompanyListQuery(new URLSearchParams("page=-3&size=9999&accessMode=disabled&active=foo&sortOrder=desc"));
    expect(parsed.page).toBe(0);
    expect(parsed.size).toBe(200);
    expect(parsed.accessMode).toBe("DISABLED");
    expect(parsed.active).toBe("ALL");
    expect(parsed.sortOrder).toBe("desc");
    expect(parseCompanyListQuery(new URLSearchParams("accessMode=xx")).accessMode).toBe("ALL");
  });
});

describe("corpo enviado ao backend", () => {
  it("nunca leva accessMode e limpa documento/CEP/UF", () => {
    const body = toCompanyBody({
      ...EMPTY_COMPANY_FORM,
      cpfCnpj: "12.345.678/0001-95",
      corporateName: " Beta ",
      tradeName: " B ",
      addrPostalCode: "01310-100",
      addrState: "sp",
    });
    expect(body).not.toHaveProperty("accessMode");
    expect(body.cpfCnpj).toBe("12345678000195");
    expect(body.corporateName).toBe("Beta");
    expect(body.addrPostalCode).toBe("01310100");
    expect(body.addrState).toBe("SP");
    expect(body).toHaveProperty("repEmail");
  });

  it("com cityId envia a FK e NAO envia o texto da cidade nem a UF (a cidade manda)", () => {
    const body = toCompanyBody({
      ...EMPTY_COMPANY_FORM,
      corporateName: "A",
      tradeName: "A",
      cityId: 4853,
      cityName: "Sao Paulo",
      addrCity: "Sao Paulo",
      addrState: "RJ",
    });
    expect(body.cityId).toBe(4853);
    expect(body).not.toHaveProperty("addrCity");
    expect(body).not.toHaveProperty("addrState");
    expect(body).not.toHaveProperty("cityName");
  });

  it("sem cityId (empresa legada) segue com o texto da cidade e a UF", () => {
    const body = toCompanyBody({ ...EMPTY_COMPANY_FORM, corporateName: "A", tradeName: "A", addrCity: " Campinas ", addrState: "sp" });
    expect(body).not.toHaveProperty("cityId");
    expect(body.addrCity).toBe("Campinas");
    expect(body.addrState).toBe("SP");
  });

  it("a edicao carrega cityId/cityName da empresa e a UF vem da cidade", () => {
    const form = formFromEntry(
      toCompanyEntry({
        publicId: "x",
        addrCity: "Sao Paulo",
        addrState: "RJ",
        city: { id: 4853, name: "Sao Paulo", ibgeCode: "3550308", uf: "SP" },
      }),
    );
    expect(form).toMatchObject({ cityId: 4853, cityName: "Sao Paulo", addrState: "SP" });
    expect(formFromEntry(toCompanyEntry({ publicId: "y", addrCity: "Campinas", addrState: "SP" }))).toMatchObject({
      cityId: null,
      cityName: "",
      addrCity: "Campinas",
    });
  });

  it("pessoa fisica nao envia representante legal", () => {
    const body = toCompanyBody({ ...EMPTY_COMPANY_FORM, personType: "PF", corporateName: "Maria", tradeName: "Maria" });
    expect(body).not.toHaveProperty("repFirstName");
    expect(body.personType).toBe("PF");
  });

  it("inativar/reativar manda so active", () => {
    expect(toActivePatch(false)).toEqual({ active: false });
    expect(toActivePatch(true)).toEqual({ active: true });
  });
});

describe("validacao do formulario", () => {
  const ok = { ...EMPTY_COMPANY_FORM, corporateName: "A", tradeName: "A", cpfCnpj: "12345678000195" };

  it("aceita PJ com CNPJ e PF com CPF ou sem documento", () => {
    expect(validateCompanyForm(ok)).toBeNull();
    expect(validateCompanyForm({ ...ok, personType: "PF", cpfCnpj: "" })).toBeNull();
    expect(validateCompanyForm({ ...ok, personType: "PF", cpfCnpj: "12345678909" })).toBeNull();
  });

  it("recusa o que o backend recusaria", () => {
    expect(validateCompanyForm({ ...ok, corporateName: " " })).toMatch(/razao social/i);
    expect(validateCompanyForm({ ...ok, tradeName: "" })).toMatch(/fantasia/i);
    expect(validateCompanyForm({ ...ok, cpfCnpj: "123" })).toMatch(/CNPJ/);
    expect(validateCompanyForm({ ...ok, personType: "PF", cpfCnpj: "123" })).toMatch(/CPF/);
    expect(validateCompanyForm({ ...ok, addrState: "XX" })).toMatch(/UF/);
  });
});

describe("erros do backend (plano 4.14)", () => {
  it("LAST_ADMIN_PROTECTED (409) vira mensagem para o usuario", () => {
    const message = companyErrorMessage({ status: 409, code: "LAST_ADMIN_PROTECTED", detail: "x" }, "x");
    expect(message).toMatch(/ao menos uma empresa ativa/);
  });

  it("COMPANY_QUOTA_EXCEEDED (402) vira mensagem de limite do plano", () => {
    const message = companyErrorMessage('{"status":402,"code":"COMPANY_QUOTA_EXCEEDED"}', null);
    expect(message).toMatch(/limite de empresas/);
  });

  it("codigo desconhecido usa o detail; sem nada, mensagem generica", () => {
    expect(companyErrorMessage({ code: "OUTRO" }, "detalhe do servidor")).toBe("detalhe do servidor");
    expect(companyErrorMessage(null, "")).toBe("Nao foi possivel concluir a operacao.");
  });

  it("companyErrorFromThrown le o responseBody do ApiClientError", () => {
    const thrown = Object.assign(new Error("falhou"), {
      status: 402,
      responseBody: { code: "COMPANY_QUOTA_EXCEEDED" },
    });
    expect(companyErrorFromThrown(thrown, () => "texto", "fallback")).toMatch(/limite de empresas/);
    expect(companyErrorFromThrown(new Error("rede"), () => null, "fallback")).toBe("fallback");
  });
});
