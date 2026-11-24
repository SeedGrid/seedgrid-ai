// Salvar so habilita quando pode (P194.T2): criacao com o obrigatorio valido; edicao so depois de alterar.
// Sem enabled={!submitting}/useRef/guarda sobre o SgButton (FE-46): o loading e' do proprio botao pela Promise.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = fileURLToPath(new URL("../app", import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const SCREENS: Array<[string, RegExp]> = [
  ["security/users/user_edit/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => submitUser\(\)\}/],
  ["security/roles/role_edit/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => submitRole\(\)\}/],
  ["apikeys/apikey_edit/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => handleCreate\(\)\}/],
  ["perfil/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => saveData\(\)\}/],
  ["plans/plan_edit/page.tsx", /enabled=\{saveReady\}\s+onClick=\{onSubmit\}/],
  ["plans/plan_trial/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => submit\(\)\}/],
  ["plans/plan_terms/page.tsx", /enabled=\{saveReady\}\s+onClick=\{\(\) => submitTerm\(\)\}/],
];
const EDIT_SCREENS = ["security/users/user_edit/page.tsx", "security/roles/role_edit/page.tsx", "perfil/page.tsx", "plans/plan_edit/page.tsx", "plans/plan_trial/page.tsx", "plans/plan_terms/page.tsx"];

describe("Salvar so habilita quando pode", () => {
  for (const [rel, click] of SCREENS) {
    it(rel, () => {
      const src = read(rel);
      assert.match(src, click);
      assert.match(src, /const saveReady =|const saveReady = useDirty\(/);
    });
  }

  it("telas de edicao usam useDirty", () => {
    for (const rel of EDIT_SCREENS) {
      assert.match(read(rel), /useDirty\(/, rel);
    }
  });

  it("a tela de cadastro nao trava o botao por enabled={!submitting}", () => {
    for (const [rel] of SCREENS) {
      assert.doesNotMatch(read(rel), /enabled=\{!submitting\}/, rel);
    }
  });

  it("useDirty: a base e' o valor quando o formulario termina de carregar", () => {
    const src = readFileSync(fileURLToPath(new URL("./use-dirty.ts", import.meta.url)), "utf8");
    assert.match(src, /if \(ready && baseline === null\) setBaseline\(serialized\)/);
  });
});
