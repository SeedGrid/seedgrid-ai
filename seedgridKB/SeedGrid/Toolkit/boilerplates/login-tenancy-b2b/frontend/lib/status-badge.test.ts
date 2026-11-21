// Mensagem longa do StatusBadge quebra linha (QA do 2FA a 390 px, P180): o SgBadge e' nowrap, o app sobrescreve.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const css = read("../app/globals.css");
const badge = read("../app/components/StatusBadge.tsx");

describe("StatusBadge com texto longo", () => {
  it("o badge usa a classe que libera a quebra de linha", () => {
    expect(badge).toMatch(/className="status-badge"/);
  });

  it("o CSS quebra linha, limita a largura ao pai e quebra palavra longa", () => {
    const rule = /\.status-badge\.status-badge \{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/white-space: normal/);
    expect(rule).toMatch(/max-width: 100%/);
    expect(rule).toMatch(/overflow-wrap: anywhere/);
  });
});
