import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// GET /api/auth/confirm-email: no dominio raiz (sem tenant) o link do administrador da plataforma nao tem
// como ser atendido aqui; a rota orienta em vez de devolver o 503 enganoso "Nao foi possivel conectar".
const backendFetch = vi.fn();
vi.mock("@/lib/backend-fetch", () => ({ backendFetch: (...args: unknown[]) => backendFetch(...args) }));

import { GET } from "./route";

const ROOT = "app.example.test";
const call = (host: string, query = "?token=abc") =>
  GET(new NextRequest(`http://localhost:3000/api/auth/confirm-email${query}`, { headers: { host } }));

const prev = process.env.SEEDGRID_TENANCY_DOMAIN;
beforeEach(() => {
  backendFetch.mockReset();
  process.env.SEEDGRID_TENANCY_DOMAIN = ROOT;
});
afterEach(() => {
  if (prev === undefined) delete process.env.SEEDGRID_TENANCY_DOMAIN;
  else process.env.SEEDGRID_TENANCY_DOMAIN = prev;
});

describe("GET /api/auth/confirm-email", () => {
  it("dominio raiz: 409 com a orientacao do admin, sem chamar o backend", async () => {
    const response = await call(ROOT);
    expect(response.status).toBe(409);
    expect((await response.json()).message).toContain("administrador da plataforma");
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("subdominio de empresa: repassa para o backend", async () => {
    backendFetch.mockResolvedValue(new Response(JSON.stringify({ message: "ok" }), { status: 200 }));
    const response = await call(`acmeco.${ROOT}`);
    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledOnce();
  });

  it("subdominio com o backend fora do ar: segue 503 (a mensagem de conexao so' vale aqui)", async () => {
    backendFetch.mockRejectedValue(new Error("ECONNREFUSED"));
    const response = await call(`acmeco.${ROOT}`);
    expect(response.status).toBe(503);
  });

  it("sem token: 400", async () => {
    const response = await call(`acmeco.${ROOT}`, "");
    expect(response.status).toBe(400);
  });
});
