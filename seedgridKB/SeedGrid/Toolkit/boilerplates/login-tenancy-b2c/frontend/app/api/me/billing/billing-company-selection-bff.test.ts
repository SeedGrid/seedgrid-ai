import { beforeEach, describe, expect, it, vi } from "vitest";

// BFF da selecao de empresas no billing (T5.13): checkout repassa `companySelection`, o PUT de
// reedicao chega ao caminho certo e erros do servidor passam como problem+json.
const apiFetchSecurity = vi.fn();

vi.mock("@/lib/seedgrid-app-api-server", () => ({
  apiFetchSecurity: (...args: unknown[]) => apiFetchSecurity(...args),
}));
vi.mock("@/lib/core/problem-response", () => ({
  problemResponse: (error: { status: number; responseBody: unknown }) =>
    new Response(JSON.stringify(error.responseBody), {
      status: error.status,
      headers: { "Content-Type": "application/problem+json" },
    }),
}));

import * as checkoutRoute from "./checkout/route";
import * as selectionRoute from "./downgrade-company-selection/route";

const req = (method: string, body?: unknown) =>
  new Request("http://localhost/api/me/billing/x", {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  apiFetchSecurity.mockReset();
});

describe("POST /api/me/billing/checkout", () => {
  it("repassa planId, usuarios e companySelection sem mexer no corpo", async () => {
    apiFetchSecurity.mockResolvedValue({ checkoutUrl: "https://pay/x" });
    const body = {
      planId: "p1",
      userPublicIdsToDeactivate: ["u1"],
      companySelection: { keepActive: ["a"], readOnly: ["b"], disable: ["c"] },
    };
    const response = await checkoutRoute.POST(req("POST", body));
    expect(response.status).toBe(200);
    expect(apiFetchSecurity).toHaveBeenCalledTimes(1);
    const [path, init] = apiFetchSecurity.mock.calls[0];
    expect(path).toBe("/me/billing/checkout");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(body);
  });

  it("devolve INVALID_COMPANY_SELECTION (400) com o code", async () => {
    apiFetchSecurity.mockImplementation(async () => {
      throw {
        status: 400,
        responseBody: { status: 400, code: "INVALID_COMPANY_SELECTION", detail: "contagem errada" },
      };
    });
    const response = await checkoutRoute.POST(req("POST", { planId: "p1" }));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_COMPANY_SELECTION");
  });
});

describe("/api/me/billing/downgrade-company-selection", () => {
  it("PUT envia {keepActive, readOnly, disable} ao backend e devolve SELECTION_SAVED", async () => {
    apiFetchSecurity.mockResolvedValue({ status: "SELECTION_SAVED" });
    const body = { keepActive: ["a"], readOnly: [], disable: ["b"] };
    const response = await selectionRoute.PUT(req("PUT", body));
    expect(await response.json()).toEqual({ status: "SELECTION_SAVED" });
    const [path, init] = apiFetchSecurity.mock.calls[0];
    expect(path).toBe("/me/billing/downgrade-company-selection");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual(body);
  });

  it("PUT repassa COMPANY_SELECTION_NOT_REQUIRED", async () => {
    apiFetchSecurity.mockImplementation(async () => {
      throw { status: 409, responseBody: { status: 409, code: "COMPANY_SELECTION_NOT_REQUIRED" } };
    });
    const response = await selectionRoute.PUT(req("PUT", { keepActive: [], readOnly: [], disable: [] }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("COMPANY_SELECTION_NOT_REQUIRED");
  });

  it("GET continua devolvendo o estado (com a selecao salva)", async () => {
    apiFetchSecurity.mockResolvedValue({ status: "OK", selection: { keepActive: ["a"], readOnly: [], disable: [] } });
    const response = await selectionRoute.GET();
    expect((await response.json()).selection.keepActive).toEqual(["a"]);
    expect(apiFetchSecurity).toHaveBeenCalledWith("/me/billing/downgrade-company-selection");
  });
});
