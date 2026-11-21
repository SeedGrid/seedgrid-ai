// FE-46 (P190.F1.T1): clique seguido NAO duplica o registro. O SgButton so entra em loading sozinho (desabilitado,
// aria-busy, ignora cliques seguidos) quando o onClick DEVOLVE a Promise; `onClick={() => void x()}` a descarta.
// Esta guarda reprova `void` no handler de JSX (onClick, onSubmit, onConfirm, onComplete...) e nas acoes que gravam.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const APP_DIR = new URL("../app/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...sources(full));
    else if (/\.tsx$/.test(name)) out.push(full);
  }
  return out;
}

function offendersFor(test: (line: string) => boolean): string[] {
  const found: string[] = [];
  for (const file of sources(APP_DIR)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        const code = line.trim();
        if (code.startsWith("//") || code.startsWith("*") || code.startsWith("{/*")) return;
        if (test(line)) found.push(`${file.slice(APP_DIR.length)}:${i + 1}: ${code}`);
      });
  }
  return found;
}

// Acoes que gravam/enviam/confirmam: nunca descartar a Promise.
const WRITE_NAMES =
  "(?:submit|save|handle(?:Create|Save|Confirm|Cancel|Reactivate|Subscribe|Publish|Enable|Disable|Resend|CancelDowngrade|Portal)|confirm|approve|create|delete|remove|resend|reactivate|publish|enable|disable|verify|revoke|reject|archive|grant|launch|reset|set)";

describe("FE-46: clique seguido nao duplica o registro (nada de void na acao)", () => {
  it("nenhum handler de JSX (on*=) descarta a Promise com void", () => {
    const offenders = offendersFor((line) => /\bon[A-Z][A-Za-z]*=\{.*\bvoid [A-Za-z_]/.test(line) || /\?\s*void [A-Za-z_]/.test(line));
    expect(offenders).toEqual([]);
  });

  it("nenhuma acao que grava usa `void fn()` como instrucao dentro de handler", () => {
    const offenders = offendersFor((line) => new RegExp(`^\\s+void ${WRITE_NAMES}[A-Za-z]*\\(`).test(line) && !line.includes("THEME_STORAGE_KEY"));
    expect(offenders).toEqual([]);
  });

  // Gravacao SEMPRE passa pelo botao (SgButton com onClick devolvendo a Promise, onde mora a idempotencia). O <form>
  // existe so para o gerenciador de senhas/Enter: o onSubmit e' apenas preventDefault, e o Enter aciona o botao submit.
  // Vale para TODO <form> (login, esqueci a senha, troca de senha, perfil, 2FA): nenhum onSubmit com funcao externa.
  it("onSubmit de <form> so faz preventDefault: a acao passa pelo botao (SgButton com onClick devolvendo a Promise)", () => {
    const offenders: string[] = [];
    for (const file of sources(APP_DIR)) {
      const rel = file.slice(APP_DIR.length);
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/<form[^>]*?onSubmit={((?:[^{}]|{[^{}]*})*)}/g)) {
        const handler = match[1].replace(/s+/g, " ").trim();
        const parts = /^((w+)) => (w+).preventDefault()$/.exec(handler);
        const onlyPrevent = parts !== null && parts[1] === parts[2];
        if (!onlyPrevent) offenders.push(`${rel}: onSubmit={${handler}}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
