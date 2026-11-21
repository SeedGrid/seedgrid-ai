// Mensagem longa do StatusBadge quebra linha (QA do 2FA a 390 px, P180): o SgBadge e' nowrap, o app sobrescreve.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const css = read("../app/globals.css");
const badge = read("../app/components/StatusBadge.tsx");

describe("StatusBadge com texto longo", () => {
  it("o badge usa a classe que libera a quebra de linha", () => {
    assert.match(badge, /className="status-badge"/);
  });

  it("o CSS quebra linha, limita a largura ao pai e quebra palavra longa", () => {
    const rule = /\.status-badge\.status-badge \{([^}]*)\}/.exec(css)?.[1] ?? "";
    assert.match(rule, /white-space: normal/);
    assert.match(rule, /max-width: 100%/);
    assert.match(rule, /overflow-wrap: anywhere/);
  });
});
