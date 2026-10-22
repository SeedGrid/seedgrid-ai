import { beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/auth/refresh: a renovacao que o `query()` aciona ao receber 401 (ADR 28).
const refreshAdminSessionOnce = vi.fn();
class FakeConnectionError extends Error {}

vi.mock("@/lib/seedgrid-app-api-server", () => ({
  refreshAdminSessionOnce: () => refreshAdminSessionOnce(),
  isApiConnectionError: (error: unknown) => error instanceof FakeConnectionError,
}));

import { POST } from "./route";

beforeEach(() => {
  refreshAdminSessionOnce.mockReset();
});

describe("POST /api/auth/refresh", () => {
  it("sessao renovada: 204 sem corpo", async () => {
    refreshAdminSessionOnce.mockResolvedValue(true);
    const response = await POST();
    expect(response.status).toBe(204);
  });

  it("refresh recusado ou ausente: 401", async () => {
    refreshAdminSessionOnce.mockResolvedValue(false);
    const response = await POST();
    expect(response.status).toBe(401);
  });

  it("API fora do ar: 503 (cookies mantidos pelo BFF)", async () => {
    refreshAdminSessionOnce.mockRejectedValue(new FakeConnectionError("down"));
    const response = await POST();
    expect(response.status).toBe(503);
  });

  it("erro inesperado nao e' engolido", async () => {
    refreshAdminSessionOnce.mockRejectedValue(new Error("bug"));
    await expect(POST()).rejects.toThrow("bug");
  });
});
