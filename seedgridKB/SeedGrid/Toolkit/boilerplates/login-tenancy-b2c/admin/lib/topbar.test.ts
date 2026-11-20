// Barra superior fixa e menu como gaveta no celular (FE-43 e FE-44, P180). Sem renderizador de componentes no
// projeto, o que a tela promete é conferido no código: a barra, o que sai do menu do usuário e o CSS do celular.
import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
    assert.match(shell, /<TopBar[^>]*title=\{title\}/);
    assert.match(shell, /onOpenMenu=\{/);
  });

  it("a barra tem tema, modo escuro e o sino, e NAO tem seletor de idioma (P180.F2.T12: so no P183)", () => {
    assert.match(bar, /aria-label="Tema"/);
    assert.match(bar, /Modo escuro/);
    assert.ok(bar.includes("{notifications}"));
    assert.doesNotMatch(bar, /aria-label="Idioma"/);
    assert.doesNotMatch(bar, /LocaleFlag|topbar-flags|topbar-lang-select/);
    assert.doesNotMatch(shell, /useLocale|TopBarLanguage|language=/);
    assert.equal(existsSync(new URL("../app/components/LocaleFlag.tsx", import.meta.url)), false);
  });

  it("tema e modo escuro saem do menu do usuário (ficam só na barra)", () => {
    assert.doesNotMatch(shell, /id: "themes"/);
    assert.doesNotMatch(shell, /label: "Temas"/);
  });

  it("a barra é fixa no topo e o conteúdo desce a altura dela", () => {
    assert.match(css, /\.topbar \{[^}]*position: fixed/);
    assert.match(css, /body:has\(\.topbar\)\s*\{[^}]*padding-top/);
  });
});

describe("menu como gaveta no celular (FE-44)", () => {
  it("abaixo de 800 px a coluna do menu sai do fluxo e o conteúdo ocupa a largura toda", () => {
    const mobile = mobileBlock();
    assert.match(mobile, /\.shell-sidebar \{[^}]*position: fixed/);
    assert.match(mobile, /\.shell-sidebar \{[^}]*translateX\(-/);
    assert.match(mobile, /\.shell-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
    assert.match(mobile, /\.shell-grid\.drawer-open \.shell-sidebar/);
  });

  it("não sobra a regra antiga que deixava a coluna de ícones no topo empurrando o conteúdo", () => {
    assert.doesNotMatch(css, /\.shell-sidebar \{[^}]*position: static/);
  });

  it("no celular o menu abre expandido (sem a coluna de ícones) e fecha ao navegar", () => {
    assert.match(shell, /collapsed=\{isNarrow \? false : sidebarCollapsed\}/);
    assert.match(shell, /showCollapseButton=\{!isNarrow\}/);
    assert.match(shell, /setDrawerOpen\(false\)/);
  });
});

describe("cartão das telas de auth (P180.F2.T9)", () => {
  it("o limite de 420 px está em max-width (o w-full do SgCard vencia o width)", () => {
    assert.match(css, /\.login-shell > \* \{[^}]*max-width: 420px/);
  });
});

describe("sino de notificacoes na barra (P180.F2.T7)", () => {
  const route = read("../app/api/user-notifications/[[...path]]/route.ts");

  it("a Shell liga o SgNotificationBell no slot da barra, so' com sessao valida", () => {
    assert.ok(shell.includes("<SgNotificationBell />"));
    assert.match(shell, /notifications=\{me !== null && !sessionExpired \?/);
  });

  it("o BFF repassa /api/user-notifications para /user-notifications (listar, ler, ler todas, excluir)", () => {
    assert.ok(route.includes("`/user-notifications${"));
    assert.match(route, /export function GET/);
    assert.match(route, /export function POST/);
    assert.match(route, /export function DELETE/);
  });

  it("o BFF repassa a ETag (If-None-Match -> 304 sem corpo) e recusa . e ..", () => {
    assert.ok(route.includes('request.headers.get("If-None-Match")'));
    assert.ok(route.includes('["ETag", "Cache-Control", "Vary"]'));
    assert.ok(route.includes('segment === ".."'));
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
    assert.match(title, /min-width: 0/);
    assert.match(title, /overflow: hidden/);
    assert.match(title, /text-overflow: ellipsis/);
    assert.match(title, /white-space: nowrap/);
  });

  it("o lado esquerdo cede espaco e o grupo da direita (sino, tema, modo escuro) nunca encolhe", () => {
    assert.match(rule(".topbar-left"), /min-width: 0/);
    assert.match(rule(".topbar-left"), /flex: 1 1 0/);
    assert.match(rule(".topbar-right"), /flex: 0 0 auto/);
  });
});
