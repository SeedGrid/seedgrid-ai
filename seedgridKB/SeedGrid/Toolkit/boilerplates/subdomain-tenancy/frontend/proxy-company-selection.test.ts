import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "./lib/admin-auth";
import { proxy } from "./proxy";

// Escolha de empresa pendente (T7.2): enquanto o cookie existir, so' a tela de selecao e as rotas
// de BFF abrem; o resto do app redireciona para ela.
function req(path: string, cookies: Record<string, string>) {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`http://localhost${path}`, { headers: cookie ? { cookie } : {} });
}

const pending = {
  [ADMIN_TOKEN_COOKIE]: "t",
  [ADMIN_COMPANY_SELECTION_PENDING_COOKIE]: "1",
};

describe("proxy - escolha de empresa pendente", () => {
  it.each(["/", "/perfil", "/login"])("%s redireciona para /auth/select-company", (path) => {
    const response = proxy(req(path, pending));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/auth/select-company");
  });

  it("a propria tela e o logout passam (/api/me/** ja fica fora pelo matcher)", () => {
    for (const path of ["/auth/select-company", "/api/auth/logout"]) {
      const response = proxy(req(path, pending));
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("a escolha vem antes da troca obrigatoria de senha", () => {
    const response = proxy(req("/", { ...pending, [ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE]: "1" }));
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/auth/select-company");
  });

  it("sem o cookie pendente nada muda", () => {
    const response = proxy(req("/", { [ADMIN_TOKEN_COOKIE]: "t" }));
    expect(response.headers.get("location")).toBeNull();
  });
});
