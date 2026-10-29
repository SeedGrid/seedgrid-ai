import { describe, expect, it, vi } from "vitest";

import {
  normalizeCityText,
  createCitySearch,
  formatCityRef,
  stateByUfPath,
  stateCitiesPath,
  toCityOption,
  toCityRef,
  type CityRest,
} from "./cities";

const saoPaulo: CityRest = {
  id: 4853,
  name: "Sao Paulo",
  ibgeCode: "3550308",
  state: { id: 35, uf: "SP", name: "Sao Paulo" },
};

describe("city ref", () => {
  it("normaliza o city da empresa e ignora a empresa so com texto", () => {
    expect(toCityRef({ id: 1, name: "X", ibgeCode: "1", uf: "sp" })).toEqual({ id: 1, name: "X", ibgeCode: "1", uf: "SP" });
    expect(toCityRef(null)).toBeNull();
    expect(toCityRef({ name: "sem id" })).toBeNull();
  });

  it("formata Cidade/UF", () => {
    expect(formatCityRef({ id: 1, name: "Recife", ibgeCode: "2611606", uf: "PE" })).toBe("Recife/PE");
    expect(formatCityRef(null)).toBe("");
  });

  it("o item do autocomplete tem como id o cityId da REST", () => {
    expect(toCityOption(saoPaulo)).toMatchObject({ id: 4853, label: "Sao Paulo", data: { uf: "SP", ibgeCode: "3550308" } });
  });
});

describe("busca de cidades por UF", () => {
  const santos: CityRest = { id: 5000, name: "Santos", ibgeCode: "3548500", state: { id: 35, uf: "SP", name: "Sao Paulo" } };
  const niteroi: CityRest = { id: 6000, name: "Niterói", ibgeCode: "3303302", state: { id: 33, uf: "RJ", name: "Rio" } };
  const saoSebastiao: CityRest = { id: 4900, name: "São Sebastião", ibgeCode: "3550704", state: { id: 35, uf: "SP", name: "Sao Paulo" } };
  const paulinia: CityRest = { id: 4950, name: "Paulínia", ibgeCode: "3536505", state: { id: 35, uf: "SP", name: "Sao Paulo" } };
  const sp = { ...saoPaulo, name: "São Paulo" };

  function pageOf(content: CityRest[], page: number, last: boolean) {
    return { content, page, size: 100, totalElements: content.length, totalPages: 2, last };
  }

  it("monta os caminhos do BFF", () => {
    expect(stateByUfPath("sp")).toBe("/api/cities/states/by-uf/SP");
    expect(stateCitiesPath(35, 1)).toBe("/api/cities/states/35/cities?page=1&size=100&sort=name");
    expect(normalizeCityText(" São Paulo ")).toBe("sao paulo");
  });

  it("carrega a UF uma vez (todas as paginas) e filtra sem acento e sem diferenciar caixa", async () => {
    const fetcher = vi.fn(async (path: string) => {
      if (path.startsWith("/api/cities/states/by-uf/")) return { id: 35, uf: "SP", name: "Sao Paulo" };
      if (path.includes("page=0")) return pageOf([paulinia, sp], 0, false);
      return pageOf([santos, saoSebastiao], 1, true);
    });
    const search = createCitySearch(fetcher as never);
    expect((await search("SP", "sao paulo")).map((c) => c.label)).toEqual(["São Paulo"]);
    // "pau": Paulínia e "Sao Paulo"; o que COMECA com o texto vem primeiro
    expect((await search("sp", "PAU")).map((c) => c.label)).toEqual(["Paulínia", "São Paulo"]);
    expect((await search("SP", "sao")).map((c) => c.id)).toEqual([4853, 4900]);
    expect(fetcher.mock.calls.filter(([p]) => String(p).includes("by-uf")).length).toBe(1);
    expect(fetcher.mock.calls.filter(([p]) => String(p).includes("/cities?")).length).toBe(2);
  });

  it("o item e' a cidade da UF pedida (id = cityId)", async () => {
    const fetcher = vi.fn(async (path: string) => {
      if (path.includes("by-uf")) return { id: 33, uf: "RJ", name: "Rio" };
      return pageOf([niteroi], 0, true);
    });
    const [item] = await createCitySearch(fetcher as never)("RJ", "niteroi");
    expect(item).toMatchObject({ id: 6000, label: "Niterói", data: { uf: "RJ", ibgeCode: "3303302" } });
  });

  it("nao consulta sem UF ou com menos de 2 letras", async () => {
    const fetcher = vi.fn();
    const search = createCitySearch(fetcher as never);
    expect(await search("", "sao")).toEqual([]);
    expect(await search("SP", "s")).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("falha ao carregar nao fica em cache", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("403"))
      .mockResolvedValueOnce({ id: 35, uf: "SP", name: "x" })
      .mockResolvedValueOnce(pageOf([sp], 0, true));
    const search = createCitySearch(fetcher as never);
    await expect(search("SP", "sao")).rejects.toThrow("403");
    expect((await search("SP", "sao")).length).toBe(1);
  });
});
