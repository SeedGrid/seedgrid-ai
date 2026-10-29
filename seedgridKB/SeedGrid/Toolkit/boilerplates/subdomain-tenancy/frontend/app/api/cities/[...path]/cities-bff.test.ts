import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWithAdminSession = vi.fn();

vi.mock("@/lib/seedgrid-app-api-server", () => ({
  fetchWithAdminSession: (...args: unknown[]) => fetchWithAdminSession(...args),
  passthroughResponse: async (response: Response) =>
    new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    }),
}));
vi.mock("@/lib/core/problem-response", () => ({
  problemResponse: (error: { status: number; responseBody: unknown }) =>
    new Response(JSON.stringify(error.responseBody), { status: error.status }),
}));

import * as route from "./route";

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });

beforeEach(() => fetchWithAdminSession.mockReset());

describe("BFF /api/cities/**", () => {
  it("repassa para /cities-api/<caminho> com a querystring e a sessao", async () => {
    fetchWithAdminSession.mockResolvedValue(new Response(JSON.stringify({ content: [] }), { status: 200 }));
    const response = await route.GET(
      new Request("http://localhost/api/cities/cities?stateId=35&name=sao&size=20"),
      ctx("cities"),
    );
    expect(fetchWithAdminSession).toHaveBeenCalledWith("/cities-api/cities?stateId=35&name=sao&size=20", { method: "GET" });
    expect(response.status).toBe(200);
  });

  it("repassa a recusa de permissao (403 sem CITY_READ)", async () => {
    fetchWithAdminSession.mockResolvedValue(new Response(JSON.stringify({ status: 403 }), { status: 403 }));
    const response = await route.GET(new Request("http://localhost/api/cities/cities"), ctx("cities"));
    expect(response.status).toBe(403);
  });

  it("recusa .. no caminho sem chamar o backend e e somente leitura", async () => {
    const response = await route.GET(new Request("http://localhost/api/cities/.."), ctx("..", "x"));
    expect(response.status).toBe(400);
    expect(fetchWithAdminSession).not.toHaveBeenCalled();
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) expect(method in route).toBe(false);
  });
});
