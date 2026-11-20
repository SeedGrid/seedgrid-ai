// Barra superior fixa e menu como gaveta no celular (FE-43 e FE-44, P180). Sem renderizador de componentes no
// projeto, o que a tela promete é conferido no código: a barra, o que sai do menu do usuário e o CSS do celular.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const shell = read("../app/components/Shell.tsx");
const bar = read("../app/components/TopBar.tsx");
const css = read("../app/globals.css");

// Bloco "@media (max-width: 800px) { ... }" do CSS (o último, o do celular).
function mobileBlock(): string {
  const start = css.indexOf("@media (max-width: 800px)");
  return start < 0 ? "" : css.slice(start);
}

describe("barra superior fixa (FE-43)", () => {
  it("a Shell monta a barra com o título da página e o botão que abre o menu", () => {
    expect(shell).toMatch(/<TopBar[^>]*title=\{title\}/);
    expect(shell).toMatch(/onOpenMenu=\{/);
  });

  it("a barra tem tema, modo escuro e o sino, e NAO tem seletor de idioma (P180.F2.T12: so no P183)", () => {
    expect(bar).toMatch(/aria-label="Tema"/);
    expect(bar).toMatch(/Modo escuro/);
    expect(bar).toContain("{notifications}");
    expect(bar).not.toMatch(/aria-label="Idioma"/);
    expect(bar).not.toMatch(/LocaleFlag|topbar-flags|topbar-lang-select/);
    expect(shell).not.toMatch(/useLocale|TopBarLanguage|language=/);
    expect(existsSync(new URL("../app/components/LocaleFlag.tsx", import.meta.url))).toBe(false);
  });

  it("tema e modo escuro saem do menu do usuário (ficam só na barra)", () => {
    expect(shell).not.toMatch(/id: "themes"/);
    expect(shell).not.toMatch(/label: "Temas"/);
  });

  it("a barra é fixa no topo e o conteúdo desce a altura dela", () => {
    expect(css).toMatch(/\.topbar \{[^}]*position: fixed/);
    expect(css).toMatch(/body:has\(\.topbar\)\s*\{[^}]*padding-top/);
  });
});

describe("menu como gaveta no celular (FE-44)", () => {
  it("abaixo de 800 px a coluna do menu sai do fluxo e o conteúdo ocupa a largura toda", () => {
    const mobile = mobileBlock();
    expect(mobile).toMatch(/\.shell-sidebar \{[^}]*position: fixed/);
    expect(mobile).toMatch(/\.shell-sidebar \{[^}]*translateX\(-/);
    expect(mobile).toMatch(/\.shell-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
    expect(mobile).toMatch(/\.shell-grid\.drawer-open \.shell-sidebar/);
  });

  it("não sobra a regra antiga que deixava a coluna de ícones no topo empurrando o conteúdo", () => {
    expect(css).not.toMatch(/\.shell-sidebar \{[^}]*position: static/);
  });

  it("no celular o menu abre expandido (sem a coluna de ícones) e fecha ao navegar", () => {
    expect(shell).toMatch(/collapsed=\{isNarrow \? false : sidebarCollapsed\}/);
    expect(shell).toMatch(/showCollapseButton=\{!isNarrow\}/);
    expect(shell).toMatch(/setDrawerOpen\(false\)/);
  });
});

describe("cartão das telas de auth (P180.F2.T9)", () => {
  it("o limite de 420 px está em max-width (o w-full do SgCard vencia o width)", () => {
    expect(css).toMatch(/\.login-shell > \* \{[^}]*max-width: 420px/);
  });
});

describe("sino de notificacoes na barra (P180.F2.T7)", () => {
  const route = read("../app/api/user-notifications/[[...path]]/route.ts");

  it("a Shell liga o SgNotificationBell no slot da barra, so' com sessao valida", () => {
    expect(shell).toContain("<SgNotificationBell />");
    expect(shell).toMatch(/notifications=\{me !== null && !sessionExpired \?/);
  });

  it("o BFF repassa /api/user-notifications para /user-notifications (listar, ler, ler todas, excluir)", () => {
    expect(route).toContain("`/user-notifications${");
    expect(route).toMatch(/export function GET/);
    expect(route).toMatch(/export function POST/);
    expect(route).toMatch(/export function DELETE/);
  });

  it("o BFF repassa a ETag (If-None-Match -> 304 sem corpo) e recusa . e ..", () => {
    expect(route).toContain('request.headers.get("If-None-Match")');
    expect(route).toContain('["ETag", "Cache-Control", "Vary"]');
    expect(route).toContain('segment === ".."');
  });
});

describe("titulo longo nao empurra o grupo da direita para fora a 390 px (P180.F2.T11)", () => {
  // Corpo de todas as regras do seletor, inclusive quando ele aparece numa regra agrupada
  // (".topbar-left,\n.topbar-right { ... }").
  function rule(selector: string): string {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const all = new RegExp("(?:^|\\n)(?:[^{}]*,\\n)?" + escaped + "(?:,\\n[^{}]*)? \\{([^}]*)\\}", "g");
    return [...css.matchAll(all)].map((m) => m[1]).join("\n");
  }

  it("o titulo encolhe com reticencias (min-width 0 + overflow hidden + ellipsis + nowrap)", () => {
    const title = rule(".topbar-title");
    expect(title).toMatch(/min-width: 0/);
    expect(title).toMatch(/overflow: hidden/);
    expect(title).toMatch(/text-overflow: ellipsis/);
    expect(title).toMatch(/white-space: nowrap/);
  });

  it("o lado esquerdo cede espaco e o grupo da direita (sino, tema, modo escuro) nunca encolhe", () => {
    expect(rule(".topbar-left")).toMatch(/min-width: 0/);
    expect(rule(".topbar-left")).toMatch(/flex: 1 1 0/);
    expect(rule(".topbar-right")).toMatch(/flex: 0 0 auto/);
  });
});
