import assert from "node:assert/strict";
// Pagina HTML de erro do proxy (Cloudflare 502) nunca aparece na tela (P194): as telas leem o erro por readHttpError,
// nunca `response.text()` cru. Os BFFs (app/api) repassam o corpo e ficam de fora.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const base = fileURLToPath(new URL("..", import.meta.url));

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "api") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...sources(full));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

describe("erro de resposta nunca mostra o corpo cru", () => {
  it("nenhuma tela usa response.text() direto", () => {
    const offenders: string[] = [];
    for (const dir of ["app", "components"]) {
      let files: string[] = [];
      try {
        files = sources(join(base, dir));
      } catch {
        continue;
      }
      for (const file of files) {
        readFileSync(file, "utf8")
          .split("\n")
          .forEach((line, i) => {
            if (/await (response|res)\.text\(\)/.test(line)) offenders.push(`${file.slice(base.length)}:${i + 1}: ${line.trim()}`);
          });
      }
    }
    assert.deepEqual(offenders, []);
  });
});
