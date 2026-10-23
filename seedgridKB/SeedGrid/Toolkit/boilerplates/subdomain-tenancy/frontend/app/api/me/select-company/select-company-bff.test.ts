import { beforeEach, describe, expect, it, vi } from "vitest";

// BFF do seletor de empresa (T7.2): sucesso regrava a sessao e apaga o "escolha pendente"; o 403
// COMPANY_DISABLED da empresa ESCOLHIDA nao pode derrubar a sessao que ja existia.
const jar = new Map<string, string>();
const fetchWithAdminSession = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));
vi.mock("@/lib/seedgrid-app-api-server", () => ({
  fetchWithAdminSession: (...args: unknown[]) => fetchWithAdminSession(...args),
  passthroughResponse: async (response: Response) =>
    new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/problem+json" },
    }),
}));

import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/admin-auth";
import { ADMIN_CURRENT_COMPANY_COOKIE } from "@/lib/company-access";

import { POST } from "./route";

const req = (body: unknown) =>
  new Request("http://localhost/api/me/select-company", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  jar.clear();
  fetchWithAdminSession.mockReset();
});

describe("POST /api/me/select-company", () => {
  it("regrava token, empresa corrente e apaga o pendente; nao devolve o token", async () => {
    jar.set(ADMIN_TOKEN_COOKIE, "tk-velho");
    jar.set(ADMIN_COMPANY_SELECTION_PENDING_COOKIE, "1");
    fetchWithAdminSession.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "OK",
          token: "tk-novo",
          refreshToken: "rf-novo",
          companySelectionRequired: false,
          changePasswordRequired: true,
          currentCompany: { publicId: "c1", name: "Loja", accessMode: "READ_ONLY", personType: "PJ" },
        }),
        { status: 200 },
      ),
    );

    const response = await POST(req({ companyPublicId: "c1" }));
    const body = await response.json();

    expect(fetchWithAdminSession).toHaveBeenCalledWith("/me/select-company", {
      method: "POST",
      body: JSON.stringify({ companyPublicId: "c1" }),
    });
    expect(body).toMatchObject({ status: "OK", changePasswordRequired: true, companySelectionRequired: false });
    expect(JSON.stringify(body)).not.toContain("tk-novo");
    expect(jar.get(ADMIN_TOKEN_COOKIE)).toBe("tk-novo");
    expect(jar.get(ADMIN_REFRESH_TOKEN_COOKIE)).toBe("rf-novo");
    expect(JSON.parse(jar.get(ADMIN_CURRENT_COMPANY_COOKIE) ?? "{}")).toMatchObject({
      publicId: "c1",
      accessMode: "READ_ONLY",
    });
    expect(jar.has(ADMIN_COMPANY_SELECTION_PENDING_COOKIE)).toBe(false);
  });

  it("COMPANY_DISABLED: repassa o 403 e devolve os cookies que a limpeza da sessao levou", async () => {
    jar.set(ADMIN_TOKEN_COOKIE, "tk");
    jar.set(ADMIN_REFRESH_TOKEN_COOKIE, "rf");
    jar.set(ADMIN_COMPANY_SELECTION_PENDING_COOKIE, "1");
    fetchWithAdminSession.mockImplementation(async () => {
      // O que o fetchWithAdminSession real faz no 403 COMPANY_DISABLED.
      jar.clear();
      return new Response(JSON.stringify({ status: 403, code: "COMPANY_DISABLED" }), { status: 403 });
    });

    const response = await POST(req({ companyPublicId: "c9" }));

    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe("COMPANY_DISABLED");
    expect(jar.get(ADMIN_TOKEN_COOKIE)).toBe("tk");
    expect(jar.get(ADMIN_REFRESH_TOKEN_COOKIE)).toBe("rf");
    expect(jar.get(ADMIN_COMPANY_SELECTION_PENDING_COOKIE)).toBe("1");
  });

  it("outros erros so' repassam (sem mexer nos cookies)", async () => {
    jar.set(ADMIN_TOKEN_COOKIE, "tk");
    fetchWithAdminSession.mockResolvedValue(new Response(JSON.stringify({ detail: "nao" }), { status: 400 }));
    const response = await POST(req({ companyPublicId: "x" }));
    expect(response.status).toBe(400);
    expect(jar.get(ADMIN_TOKEN_COOKIE)).toBe("tk");
  });

  it("resposta sem token vira 502", async () => {
    fetchWithAdminSession.mockResolvedValue(new Response(JSON.stringify({ status: "OK" }), { status: 200 }));
    const response = await POST(req({ companyPublicId: "c1" }));
    expect(response.status).toBe(502);
  });
});
