// 2FA, desativar com senha errada: o erro do backend fica visivel no proprio formulario (nao so em toast, que some).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../app/components/TwoFactorManager.tsx", import.meta.url), "utf8");
const handleDisable = source.slice(source.indexOf("async function handleDisable()"), source.indexOf("function downloadBackupCodes()"));

describe("2FA desativar: erro persistente no formulario", () => {
  it("falha do backend e validacao vao para disableError, nao para toast", () => {
    expect(/setDisableError\(extractError\(data\)\)/.test(handleDisable), "erro do backend em disableError").toBe(true);
    expect(!/toast\.error/.test(handleDisable), "sem toast.error no desativar").toBe(true);
    expect(/setDisableError\(\s*requiresTotp/.test(handleDisable), "validacao em disableError").toBe(true);
  });

  it("o erro some ao tentar de novo e e exibido acima do botao", () => {
    expect(/setPending\(true\);[\s\S]*?setDisableError\(null\)/.test(handleDisable), "limpa ao reenviar").toBe(true);
    expect(/\{disableError \? \(\s*<StatusBadge severity="danger" value=\{disableError\} \/>[\s\S]*?label=\{pending \? "Desativando\.\.\."/.test(source), "badge antes do botao").toBe(true);
  });
});
