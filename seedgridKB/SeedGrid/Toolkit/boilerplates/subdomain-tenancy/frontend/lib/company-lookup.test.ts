import { describe, expect, it } from "vitest";

import { EMPTY_COMPANY_FORM } from "./companies";
import {
  applyLookupPatch,
  companyPatchFromPublicaCnpj,
  companyPatchFromViaCep,
  formatBrazilPhone,
  formatPostalCode,
  matchCityByName,
  readLookupString,
} from "./company-lookup";

const publica = {
  razao_social: "  ACME LTDA ",
  estabelecimento: {
    nome_fantasia: "Acme",
    tipo_logradouro: "AVENIDA",
    logradouro: "PAULISTA",
    numero: "1000",
    complemento: "",
    bairro: "BELA VISTA",
    cep: "01310100",
    cidade: { nome: "São Paulo" },
    estado: { sigla: "sp" },
    ddd1: "11",
    telefone1: "988887777",
  },
};

describe("busca por CNPJ preenche a empresa", () => {
  it("mapeia razão social, fantasia, endereço e telefone", () => {
    expect(companyPatchFromPublicaCnpj(publica)).toEqual({
      corporateName: "ACME LTDA",
      tradeName: "Acme",
      addrStreet: "AVENIDA PAULISTA",
      addrNumber: "1000",
      addrDistrict: "BELA VISTA",
      addrPostalCode: "01310-100",
      addrCity: "São Paulo",
      addrState: "SP",
      addrPhone: "(11) 98888-7777",
    });
  });

  it("campo ausente ou vazio não entra (não apaga o que a pessoa digitou)", () => {
    expect(companyPatchFromPublicaCnpj(null)).toEqual({});
    expect(companyPatchFromPublicaCnpj({ razao_social: "X", estabelecimento: { numero: "  " } })).toEqual({ corporateName: "X" });
  });
});

describe("busca por CEP preenche o endereço", () => {
  it("mapeia logradouro, bairro, cidade e UF", () => {
    expect(
      companyPatchFromViaCep({ logradouro: "Rua A", complemento: "", bairro: "Centro", localidade: "Campinas", uf: "sp" }),
    ).toEqual({ addrStreet: "Rua A", addrDistrict: "Centro", addrCity: "Campinas", addrState: "SP" });
  });

  it("CEP inexistente não preenche nada", () => {
    expect(companyPatchFromViaCep({ erro: true, logradouro: "Rua A" })).toEqual({});
    expect(companyPatchFromViaCep(null)).toEqual({});
  });
});

describe("aplicar a consulta ao formulário", () => {
  const base = { ...EMPTY_COMPANY_FORM, addrState: "SP", cityId: 5, cityName: "Campinas", addrCity: "Campinas", addrNumber: "7" };

  it("cidade nova desfaz a escolha da cidade anterior (FK)", () => {
    const next = applyLookupPatch(base, { addrCity: "Santos", addrState: "SP" });
    expect(next).toMatchObject({ addrCity: "Santos", cityId: null, cityName: "" });
    expect(next.addrNumber).toBe("7");
  });

  it("mesma cidade e mesma UF mantém a escolha", () => {
    expect(applyLookupPatch(base, { addrCity: "Campinas", addrState: "SP", addrStreet: "Rua B" })).toMatchObject({
      cityId: 5,
      cityName: "Campinas",
      addrStreet: "Rua B",
    });
  });
});

describe("formatos", () => {
  it("CEP e telefone", () => {
    expect(formatPostalCode("1310100")).toBe("13101-00");
    expect(formatPostalCode("")).toBeNull();
    expect(formatBrazilPhone("11", "32221111")).toBe("(11) 3222-1111");
    expect(formatBrazilPhone("11", "123")).toBeNull();
  });

  it("readLookupString segue o caminho e apara", () => {
    expect(readLookupString({ a: { b: " x " } }, "a", "b")).toBe("x");
    expect(readLookupString({ a: 1 }, "a")).toBeNull();
    expect(readLookupString(null, "a")).toBeNull();
  });
});

describe("casar a cidade da consulta com a lista de cidades", () => {
  const option = (id: number, name: string) => ({ id, label: name, value: String(id), data: { id, name, ibgeCode: "", uf: "SP" } });

  it("nome igual (sem acento) escolhe a cidade; ambíguo ou ausente não escolhe", () => {
    const list = [option(1, "São Paulo"), option(2, "São Paulo do Norte")];
    expect(matchCityByName(list, "SAO PAULO")?.id).toBe(1);
    expect(matchCityByName(list, "Santos")).toBeNull();
    expect(matchCityByName([option(1, "Rio"), option(2, "rio")], "Rio")).toBeNull();
    expect(matchCityByName(list, "")).toBeNull();
  });
});
