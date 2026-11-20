// Menu do app do cliente (FE-40, P180): grupo "Segurança" sempre, nenhum item de segurança solto na raiz,
// Empresas (quando o modelo tem) como item próprio acima do grupo, e cada folha com a sua página.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { navItems, type NavItem } from "../app/data";

const SECURITY_PREFIXES = ["/security/users", "/security/self-enter", "/security/roles", "/security/apikeys", "/security/audit"];

function leaves(items: readonly NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children?.length ? leaves(item.children) : [item]));
}

describe("menu do app do cliente", () => {
  const group = navItems.find((item) => item.label === "Segurança");

  it("tem o grupo Segurança com Auditoria e API Keys", () => {
    expect(group?.children?.length).toBeGreaterThan(0);
    const hrefs = (group?.children ?? []).map((child) => child.href);
    expect(hrefs).toContain("/security/audit");
    expect(hrefs).toContain("/security/apikeys/apikey_list");
  });

  it("não deixa item de segurança solto na raiz", () => {
    const loose = navItems.filter((item) => !item.children?.length && SECURITY_PREFIXES.some((prefix) => item.href.startsWith(prefix)));
    expect(loose).toEqual([]);
  });

  it("Empresas, quando existe, é item próprio logo acima do grupo", () => {
    const index = navItems.findIndex((item) => item.href === "/security/companies/company_list");
    if (index < 0) {
      return;
    }
    expect(navItems[index].children).toBeUndefined();
    expect(navItems[index + 1]).toBe(group);
    expect(group?.children?.some((child) => child.href.startsWith("/security/companies"))).toBe(false);
  });

  it("toda folha do menu tem permissão e a sua página", () => {
    for (const leaf of leaves(navItems)) {
      expect(leaf.permission, leaf.href).toBeTruthy();
      expect(existsSync(new URL(`../app${leaf.href}/page.tsx`, import.meta.url)), leaf.href).toBe(true);
    }
  });
});
