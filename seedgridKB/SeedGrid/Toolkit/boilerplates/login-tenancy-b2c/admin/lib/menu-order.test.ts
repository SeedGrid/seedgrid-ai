// Ordem do menu lateral e gancho de Configuracoes no menu do usuario (FE-44 e FE-45, P180.F2.T18).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { navItems } from "../app/data.ts";
import { PRODUCT_SETTINGS_LABEL, PRODUCT_SETTINGS_PATH } from "./product-settings.ts";

const shell = readFileSync(new URL("../app/components/Shell.tsx", import.meta.url), "utf8");

describe("ordem do menu lateral (FE-44)", () => {
  const labels = navItems.map((item) => item.label);

  it("Segurança é sempre a última opção", () => {
    assert.equal(labels.at(-1), "Segurança");
  });

  it("Empresas, quando existe, vem logo antes de Segurança (as duas últimas, nessa ordem)", () => {
    const empresas = labels.indexOf("Empresas");
    if (empresas < 0) return;
    assert.equal(empresas, labels.length - 2);
  });
});

describe("Configurações no menu do usuário (FE-45)", () => {
  it("o gancho existe e, sem tela própria, é null (o menu do usuário não ganha entrada)", () => {
    assert.equal(PRODUCT_SETTINGS_PATH, null);
    assert.equal(PRODUCT_SETTINGS_LABEL, "Configurações");
  });

  it("a Shell põe Configurações no sgUserMenu, antes de Sair, só quando o produto aponta a tela", () => {
    assert.ok(/PRODUCT_SETTINGS_PATH\s*\?/.test(shell), "entrada condicional");
    assert.ok(shell.includes("label: PRODUCT_SETTINGS_LABEL"), "rotulo");
    assert.ok(shell.indexOf("...(PRODUCT_SETTINGS_PATH") < shell.indexOf('id: "logout"'));
  });

  it("Configurações não vai para o menu lateral", () => {
    assert.ok(!navItems.some((item) => item.label === "Configurações"), "sem Configuracoes no menu lateral");
  });
});
