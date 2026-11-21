// Erro ao salvar usuario fica VISIVEL na tela (QA P180: 400 "Whatsapp invalido" e 422 "pelo menos uma role" sem aviso).
// O toast some sozinho; a mensagem do backend (detail) tambem fica num aviso fixo acima do Salvar.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../app/security/users/user_edit/page.tsx", import.meta.url), "utf8");
const submit = source.slice(source.indexOf("async function submitUser()"), source.indexOf("if (!accessLoading && !canAccessPage)"));

describe("user_edit: erro de salvar visivel", () => {
  it("toda falha do submitUser passa por showSaveError (toast + aviso fixo), nenhum toast.error solto", () => {
    expect(submit).not.toMatch(/toast\.error\(/);
    expect(source).toMatch(/function showSaveError\(message: string\)[\s\S]*?setSaveError\(message\)[\s\S]*?toast\.error\(message\)/);
  });

  it("o erro do backend usa o detail (extractApiErrorMessage) e cai num texto legivel", () => {
    expect(submit).toMatch(/showSaveError\(extractApiErrorMessage\(error\) \?\? "Falha ao salvar usuario\."\)/);
  });

  it("o aviso fixo e limpo ao tentar salvar de novo e aparece como perigo antes do botao Salvar", () => {
    expect(submit).toMatch(/setSaveError\(null\)/);
    expect(source).toMatch(/\{saveError \? \(\s*<StatusBadge severity="danger" value=\{saveError\} \/>\s*\) : null\}[\s\S]*?label=\{submitting \? "Salvando\.\.\." : "Salvar"\}/);
  });
});
