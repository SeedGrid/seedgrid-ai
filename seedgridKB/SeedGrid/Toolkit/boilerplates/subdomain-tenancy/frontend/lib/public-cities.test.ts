import { describe, expect, it, vi } from "vitest";

import { cityIdForSignup, lookupCityByIbge, normalizeIbgeCode, toPublicCity } from "./public-cities";

const campinas = { id: 2365, name: "Campinas", uf: "SP", ibgeCode: "3509502" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("normalizeIbgeCode", () => {
  it("aceita 7 digitos, com mascara ou numero", () => {
    expect(normalizeIbgeCode("3509502")).toBe("3509502");
    expect(normalizeIbgeCode(3509502)).toBe("3509502");
    expect(normalizeIbgeCode(" 35.09502 ")).toBe("3509502");
  });

  it("recusa o que nao tem 7 digitos", () => {
    expect(normalizeIbgeCode("")).toBeNull();
    expect(normalizeIbgeCode(null)).toBeNull();
    expect(normalizeIbgeCode(undefined)).toBeNull();
    expect(normalizeIbgeCode("350950")).toBeNull();
    expect(normalizeIbgeCode("35095022")).toBeNull();
  });
});

describe("toPublicCity", () => {
  it("le o corpo minimo e ignora o resto", () => {
    expect(toPublicCity({ ...campinas, uf: "sp", latitude: -22.9 })).toEqual(campinas);
  });

  it("recusa corpo sem id", () => {
    expect(toPublicCity(null)).toBeNull();
    expect(toPublicCity({ name: "x" })).toBeNull();
    expect(toPublicCity("x")).toBeNull();
  });
});

describe("lookupCityByIbge", () => {
  it("consulta o BFF publico pelo codigo", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(campinas));
    await expect(lookupCityByIbge("3509502", fetchImpl)).resolves.toEqual(campinas);
    expect(fetchImpl.mock.calls[0][0]).toBe("/api/signup/city/3509502");
  });

  it("nao consulta com codigo invalido", async () => {
    const fetchImpl = vi.fn();
    await expect(lookupCityByIbge("123", fetchImpl)).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("cai em null com 404, 429, corpo que nao e JSON ou erro de rede (cadastro segue com texto)", async () => {
    await expect(lookupCityByIbge("3509502", vi.fn().mockResolvedValue(jsonResponse({}, 404)))).resolves.toBeNull();
    await expect(lookupCityByIbge("3509502", vi.fn().mockResolvedValue(jsonResponse({}, 429)))).resolves.toBeNull();
    await expect(lookupCityByIbge("3509502", vi.fn().mockRejectedValue(new Error("rede")))).resolves.toBeNull();
    await expect(lookupCityByIbge("3509502", vi.fn().mockResolvedValue(new Response("nao e json")))).resolves.toBeNull();
  });
});

describe("cityIdForSignup", () => {
  it("envia o id quando a UF combina", () => {
    expect(cityIdForSignup(campinas, " sp ")).toBe(2365);
  });

  it("nao envia sem cidade ou com UF diferente", () => {
    expect(cityIdForSignup(null, "SP")).toBeUndefined();
    expect(cityIdForSignup(campinas, "RJ")).toBeUndefined();
    expect(cityIdForSignup(campinas, "")).toBeUndefined();
  });
});
