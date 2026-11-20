// Faixa de estado da empresa (P180.F2.T7, decisao do dono): sem troca de empresa pela faixa nem pelo menu do
// usuario; fica so o aviso "Somente leitura / Fazer upgrade". A escolha de empresa do login (CompanySelect) segue.
// Sem renderizador de componentes no projeto, o que a tela promete e conferido no codigo.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const bar = read("../app/components/CompanyAccessBar.tsx");
const shell = read("../app/components/Shell.tsx");
const select = read("../app/components/CompanySelect.tsx");

describe("faixa de estado da empresa sem seletor (P180.F2.T7)", () => {
  it("mantem o aviso de somente leitura e o botao de upgrade", () => {
    expect(bar).toContain("Somente leitura");
    expect(bar).toContain("Fazer upgrade");
    expect(bar).toContain("READ_ONLY_BANNER_TEXT");
  });

  it("nao tem mais o seletor de empresa nem chama a troca", () => {
    expect(bar).not.toContain("SgCombobox");
    expect(bar).not.toContain("company-selector");
    expect(bar).not.toContain("requestSelectCompany");
    expect(bar).not.toContain("/api/me/companies");
  });

  it("o menu do usuario tambem nao tem troca de empresa", () => {
    expect(shell).not.toMatch(/Trocar de empresa/i);
  });

  it("a escolha de empresa do login continua usando select-company", () => {
    expect(select).toContain("requestSelectCompany");
  });
});
