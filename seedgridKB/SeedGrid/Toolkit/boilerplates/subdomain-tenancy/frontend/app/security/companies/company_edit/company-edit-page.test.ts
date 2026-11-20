// Teste da tela de cadastro de empresa (FE-39, P180): sem componente de renderização no projeto, o que a tela
// promete é conferido no código da página: só pessoa jurídica e cada campo com o componente certo.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

/** Cada `<SgInputText ... id="x" ...>` da página, para checar o id usado com o componente genérico. */
function textInputIds(): string[] {
  return [...source.matchAll(/<SgInputText\b[^>]*?\bid="([^"]+)"/g)].map((match) => match[1]);
}

describe("company_edit: empresa é sempre pessoa jurídica", () => {
  it("não tem seletor de tipo de pessoa nem CPF opcional", () => {
    expect(source).not.toMatch(/Tipo de pessoa/i);
    expect(source).not.toMatch(/person-type|PERSON_TYPE|isPf/);
    expect(source).not.toMatch(/CPF \(opcional\)/);
  });

  it("documento, CEP, telefone, WhatsApp, CPF e e-mail usam o componente próprio", () => {
    expect(source).toMatch(/<SgInputCNPJ[\s\S]*?id="company-cnpj"/);
    expect(source).toMatch(/<SgInputPostalCode[\s\S]*?id="company-postal-code"/);
    expect(source).toMatch(/<SgInputPhone[\s\S]*?id="company-address-phone"/);
    expect(source).toMatch(/<SgInputPhone[\s\S]*?id="company-rep-phone"/);
    expect(source).toMatch(/<SgInputPhone[\s\S]*?id="company-rep-whatsapp"/);
    expect(source).toMatch(/<SgInputCPF[\s\S]*?id="company-rep-cpf"/);
    expect(source).toMatch(/<SgInputEmail[\s\S]*?id="company-rep-email"/);
  });

  it("nenhum SgInputText para documento, telefone, CEP ou e-mail", () => {
    const forbidden = /cnpj|cpf|phone|whatsapp|postal|cep|email|mail/i;
    expect(textInputIds().filter((id) => forbidden.test(id))).toEqual([]);
    expect(textInputIds().length).toBeGreaterThan(0);
  });

  it("liga a busca por CNPJ e por CEP e preenche a tela com o resultado", () => {
    expect(source).toMatch(/validateWithPublicaCnpj/);
    expect(source).toMatch(/onPublicaCnpjResult=\{[^}]*companyPatchFromPublicaCnpj/);
    expect(source).toMatch(/validateWithViaCep/);
    expect(source).toMatch(/onViaCepResult=\{[^}]*companyPatchFromViaCep/);
  });
});
