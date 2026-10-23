import { beforeEach, describe, expect, it, vi } from "vitest";

// BFF de empresas (T5.3): prova o contrato com o backend sem rede. O `fetchWithAdminSession` e o
// `apiFetchSecurity` sao trocados por dublês; o que se confere e' o que o BFF ENVIA e o que expoe.
const fetchWithAdminSession = vi.fn();
const apiFetchSecurity = vi.fn();

vi.mock("@/lib/seedgrid-app-api-server", () => ({
  fetchWithAdminSession: (...args: unknown[]) => fetchWithAdminSession(...args),
  apiFetchSecurity: (...args: unknown[]) => apiFetchSecurity(...args),
  passthroughResponse: async (response: Response) =>
    new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    }),
}));

// O `@seedgrid/fe-core` nao carrega em Node puro (imports sem extensao); o problemResponse real so
// serializa `responseBody`+`status`, e e isso que o dublê faz.
vi.mock("@/lib/core/problem-response", () => ({
  problemResponse: (error: { status: number; responseBody: unknown }) =>
    new Response(JSON.stringify(error.responseBody), {
      status: error.status,
      headers: { "Content-Type": "application/problem+json" },
    }),
}));

import * as listRoute from "./route";
import * as itemRoute from "./[publicId]/route";

const context = (publicId = "co-1") => ({ params: Promise.resolve({ publicId }) });
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const req = (method: string, body?: unknown, url = "http://localhost/api/security/companies") =>
  new Request(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });

beforeEach(() => {
  fetchWithAdminSession.mockReset();
  apiFetchSecurity.mockReset();
});

describe("BFF /api/security/companies", () => {
  it("nao expoe DELETE em nenhuma rota (empresa nunca e apagada)", () => {
    expect("DELETE" in listRoute).toBe(false);
    expect("DELETE" in itemRoute).toBe(false);
  });

  it("GET filtra por estado e situacao e devolve accessMode/personType/cpfCnpj", async () => {
    apiFetchSecurity.mockResolvedValue([
      { publicId: "a", corporateName: "A", personType: "PJ", cpfCnpj: "12345678000195", accessMode: "ACTIVE", active: true },
      { publicId: "b", corporateName: "B", personType: "PF", cpfCnpj: "", accessMode: "READ_ONLY", active: true },
      { publicId: "c", corporateName: "C", accessMode: "DISABLED", active: false },
    ]);
    const response = await listRoute.GET(
      req("GET", undefined, "http://localhost/api/security/companies?accessMode=READ_ONLY&active=ACTIVE"),
    );
    const page = await response.json();
    expect(apiFetchSecurity).toHaveBeenCalledWith("/companies");
    expect(page.totalRecords).toBe(1);
    expect(page.items[0]).toMatchObject({ publicId: "b", accessMode: "READ_ONLY", personType: "PF" });
  });

  it("GET repassa o problem+json do backend", async () => {
    apiFetchSecurity.mockRejectedValue({ status: 403, responseBody: { status: 403, code: "COMPANY_DISABLED" } });
    const response = await listRoute.GET(req("GET"));
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe("COMPANY_DISABLED");
  });

  it("POST cria sem active e sem accessMode e repassa COMPANY_QUOTA_EXCEEDED (402)", async () => {
    fetchWithAdminSession.mockResolvedValue(
      json({ status: 402, code: "COMPANY_QUOTA_EXCEEDED", detail: "limite" }, 402),
    );
    const response = await listRoute.POST(
      req("POST", { personType: "PJ", cpfCnpj: "12.345.678/0001-95", corporateName: "A", tradeName: "A", active: true }),
    );
    const [path, init] = fetchWithAdminSession.mock.calls[0];
    expect(path).toBe("/companies");
    expect(init.method).toBe("POST");
    const sent = JSON.parse(init.body);
    expect(sent).not.toHaveProperty("active");
    expect(sent).not.toHaveProperty("accessMode");
    expect(sent.cpfCnpj).toBe("12345678000195");
    expect(response.status).toBe(402);
    expect((await response.json()).code).toBe("COMPANY_QUOTA_EXCEEDED");
  });
});

describe("BFF /api/security/companies/[publicId]", () => {
  it("PATCH inativar manda so { active: false } ao PATCH do backend", async () => {
    fetchWithAdminSession.mockResolvedValue(json({ publicId: "co-1", active: false }));
    const response = await itemRoute.PATCH(req("PATCH", { active: false }), context());
    const [path, init] = fetchWithAdminSession.mock.calls[0];
    expect(path).toBe("/companies/co-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ active: false });
    expect((await response.json()).active).toBe(false);
  });

  it("PATCH recusa corpo sem active booleano (400) sem chamar o backend", async () => {
    const response = await itemRoute.PATCH(req("PATCH", { active: "sim" }), context());
    expect(response.status).toBe(400);
    expect(fetchWithAdminSession).not.toHaveBeenCalled();
  });

  it("PATCH repassa LAST_ADMIN_PROTECTED (409)", async () => {
    fetchWithAdminSession.mockResolvedValue(json({ status: 409, code: "LAST_ADMIN_PROTECTED" }, 409));
    const response = await itemRoute.PATCH(req("PATCH", { active: false }), context());
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("LAST_ADMIN_PROTECTED");
  });

  it("PATCH reativar repassa COMPANY_QUOTA_EXCEEDED (402)", async () => {
    fetchWithAdminSession.mockResolvedValue(json({ status: 402, code: "COMPANY_QUOTA_EXCEEDED" }, 402));
    const response = await itemRoute.PATCH(req("PATCH", { active: true }), context());
    expect(response.status).toBe(402);
  });

  it("PUT edita os dados pelo PATCH do backend e nao altera active", async () => {
    fetchWithAdminSession.mockResolvedValue(json({ publicId: "co-1", corporateName: "Novo" }));
    await itemRoute.PUT(
      req("PUT", { personType: "PJ", cpfCnpj: "12345678000195", corporateName: "Novo", tradeName: "N", active: false }),
      context(),
    );
    const [path, init] = fetchWithAdminSession.mock.calls[0];
    expect(path).toBe("/companies/co-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).not.toHaveProperty("active");
  });

  it("GET devolve a empresa normalizada por publicId", async () => {
    apiFetchSecurity.mockResolvedValue({ publicId: "co-1", accessMode: "READ_ONLY", cpfCnpj: "123.456.789-09", personType: "PF" });
    const response = await itemRoute.GET(req("GET"), context());
    expect(apiFetchSecurity).toHaveBeenCalledWith("/companies/co-1");
    expect(await response.json()).toMatchObject({ accessMode: "READ_ONLY", cpfCnpj: "12345678909", personType: "PF" });
  });
});
