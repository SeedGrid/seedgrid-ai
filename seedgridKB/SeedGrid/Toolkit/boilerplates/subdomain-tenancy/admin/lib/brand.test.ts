// Nome do produto numa constante so (P180.F2.T17). A guarda varre o codigo: nenhuma tela escreve o nome fixo.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { DEFAULT_PRODUCT_NAME, PRODUCT_NAME, resolveProductName } from "./brand.ts";

const APP_DIR = new URL("../app/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const LIB_DIR = new URL("./", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...sources(full));
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

describe("nome do produto (P180.F2.T17)", () => {
  it("sem variavel, vale o nome padrao; com variavel, vale a variavel (sem espacos)", () => {
    assert.equal(resolveProductName(undefined), DEFAULT_PRODUCT_NAME);
    assert.equal(resolveProductName("   "), DEFAULT_PRODUCT_NAME);
    assert.equal(resolveProductName("  Meu Produto "), "Meu Produto");
    assert.ok(typeof PRODUCT_NAME === "string" && PRODUCT_NAME.length > 0, "PRODUCT_NAME vazio");
  });

  it("nenhuma tela ou metadado escreve o nome do produto fixo (so brand.ts e os logos)", () => {
    const offenders: string[] = [];
    for (const file of [...sources(APP_DIR), ...sources(LIB_DIR)]) {
      if (/SeedGridLogo|[\\/]brand\.ts$/.test(file)) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          const code = line.trim();
          if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*")) return;
          if (/SeedGrid (Report|App)\b/.test(line)) offenders.push(`${file}:${i + 1}: ${code}`);
        });
    }
    assert.deepEqual(offenders, []);
  });

  it("brand.ts existe e e a unica fonte do nome", () => {
    assert.ok(existsSync(join(LIB_DIR, "brand.ts")), "lib/brand.ts");
  });
});
