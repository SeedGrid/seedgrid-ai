// Salvar so habilita quando pode (P194.T2): criacao com o obrigatorio valido; edicao so depois de alterar.
// Sem enabled={!submitting}/useRef/guarda sobre o SgButton (FE-46): o loading e' do proprio botao pela Promise.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../app", import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const SCREENS: Array<[string, RegExp]> = [
  ["security/apikeys/apikey_edit/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => handleCreate\(\)\}/],
  ["perfil/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => saveData\(\)\}/],
];
const EDIT_SCREENS = ["perfil/page.tsx"];

describe("Salvar so habilita quando pode", () => {
  for (const [rel, click] of SCREENS) {
    it(rel, () => {
      const src = read(rel);
      expect(src).toMatch(click);
      expect(src).toMatch(/const saveReady =|const saveReady = useDirty\(/);
    });
  }

  it("telas de edicao usam useDirty", () => {
    for (const rel of EDIT_SCREENS) {
      expect(read(rel), rel).toMatch(/useDirty\(/);
    }
  });

  it("a tela de cadastro nao trava o botao por enabled={!submitting}", () => {
    for (const [rel] of SCREENS) {
      expect(read(rel), rel).not.toMatch(/enabled=\{!submitting\}/);
    }
  });

  it("useDirty: a base e' o valor quando o formulario termina de carregar", () => {
    const src = readFileSync(fileURLToPath(new URL("./use-dirty.ts", import.meta.url)), "utf8");
    expect(src).toMatch(/if \(ready && baseline === null\) setBaseline\(serialized\)/);
  });
});
