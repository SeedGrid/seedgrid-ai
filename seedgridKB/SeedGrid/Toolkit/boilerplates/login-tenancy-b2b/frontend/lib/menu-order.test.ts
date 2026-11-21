// Ordem do menu lateral e gancho de Configuracoes no menu do usuario (FE-44 e FE-45, P180.F2.T18).
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { navItems } from "../app/data";
import { PRODUCT_SETTINGS_LABEL, PRODUCT_SETTINGS_PATH } from "./product-settings";

const shell = readFileSync(new URL("../app/components/Shell.tsx", import.meta.url), "utf8");

describe("ordem do menu lateral (FE-44)", () => {
  const labels = navItems.map((item) => item.label);

  it("Segurança é sempre a última opção", () => {
    expect(labels.at(-1)).toBe("Segurança");
  });

  it("Empresas, quando existe, vem logo antes de Segurança (as duas últimas, nessa ordem)", () => {
    const empresas = labels.indexOf("Empresas");
    if (empresas < 0) return;
    expect(empresas).toBe(labels.length - 2);
  });
});

describe("Configurações no menu do usuário (FE-45)", () => {
  it("o gancho existe e, sem tela própria, é null (o menu do usuário não ganha entrada)", () => {
    expect(PRODUCT_SETTINGS_PATH).toBe(null);
    expect(PRODUCT_SETTINGS_LABEL).toBe("Configurações");
  });

  it("a Shell põe Configurações no sgUserMenu, antes de Sair, só quando o produto aponta a tela", () => {
    expect(/PRODUCT_SETTINGS_PATH\s*\?/.test(shell), "entrada condicional").toBe(true);
    expect(shell.includes("label: PRODUCT_SETTINGS_LABEL"), "rotulo").toBe(true);
    expect(shell.indexOf("...(PRODUCT_SETTINGS_PATH")).toBeLessThan(shell.indexOf('id: "logout"'));
  });

  it("Configurações não vai para o menu lateral", () => {
    expect(!navItems.some((item) => item.label === "Configurações"), "sem Configuracoes no menu lateral").toBe(true);
  });
});
