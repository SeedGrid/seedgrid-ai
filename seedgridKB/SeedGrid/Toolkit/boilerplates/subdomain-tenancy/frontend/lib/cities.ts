// Cidade do endereco (plano cidade-no-endereco, TCI.8). A cidade do endereco e' FK para `sg_cities`
// (extension seedgrid-cities): o cadastro envia `cityId` e a empresa devolve `city {id,name,ibgeCode,uf}`.
// A escolha e' por UF + busca por nome na REST da cities (`/cities-api`, permissao CITY_READ), servida
// ao navegador pelo BFF `/api/cities/**`. Este modulo concentra o que nao precisa de rede nem de React
// (formato do contrato, caminhos, mapeamento para o autocomplete), para ficar coberto por teste unitario.

/** `city` da empresa (CityRefDTO do backend). */
export type CityRef = {
  id: number;
  name: string;
  ibgeCode: string;
  uf: string;
};

/** Item da REST da cities (`CityRest`): `/cities`, `/cities/{id}`. */
export type CityRest = {
  id: number;
  name: string;
  ibgeCode: string;
  state?: { id: number; uf: string; name?: string } | null;
};

/** Pagina da REST da cities (`PageResult`). */
export type CitiesPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type StateRest = { id: number; uf: string; name: string };

/** Item do SgAutocomplete: `id` e' o `cityId` que o cadastro aceita. */
export type CityOption = { id: number; label: string; value: string; data: CityRef };

export const CITIES_BFF_BASE = "/api/cities";
export const CITY_SEARCH_PAGE_SIZE = 20;
export const CITY_SEARCH_MIN_LENGTH = 2;

/** Normaliza o `city` devolvido pela empresa (ausente = empresa so' com texto legado). */
export function toCityRef(city: Partial<CityRef> | null | undefined): CityRef | null {
  if (!city || typeof city.id !== "number") {
    return null;
  }
  return {
    id: city.id,
    name: city.name ?? "",
    ibgeCode: city.ibgeCode ?? "",
    uf: (city.uf ?? "").toUpperCase(),
  };
}

/** `Sao Paulo/SP` a partir do objeto city; vazio sem city. */
export function formatCityRef(city: CityRef | null | undefined): string {
  if (!city) {
    return "";
  }
  return [city.name, city.uf].filter(Boolean).join("/");
}

export function toCityRefFromRest(city: CityRest): CityRef {
  return { id: city.id, name: city.name, ibgeCode: city.ibgeCode, uf: (city.state?.uf ?? "").toUpperCase() };
}

export function toCityOption(city: CityRest): CityOption {
  const ref = toCityRefFromRest(city);
  return { id: ref.id, label: ref.name, value: String(ref.id), data: ref };
}

export function stateByUfPath(uf: string): string {
  return `${CITIES_BFF_BASE}/states/by-uf/${encodeURIComponent(uf.trim().toUpperCase())}`;
}

export const CITY_PAGE_SIZE = 100;

/** Pagina `page` (0-based) das cidades de uma UF, em ordem de nome (a REST limita a pagina a 100). */
export function stateCitiesPath(stateId: number, page: number): string {
  const params = new URLSearchParams({ page: String(page), size: String(CITY_PAGE_SIZE), sort: "name" });
  return `${CITIES_BFF_BASE}/states/${stateId}/cities?${params.toString()}`;
}

/** Minusculo e sem acento: a REST diferencia acento no filtro `name` (decisao D4 da cities), a tela nao. */
export function normalizeCityText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca de cidades de uma UF por nome (contem, sem acento e sem diferenciar maiusculas). A REST da cities so' filtra
 * `name` com acento, entao a lista da UF (no maximo ~850 cidades, em paginas de 100) e' carregada uma vez e filtrada
 * aqui; os nomes que COMECAM com o texto vem primeiro. Abaixo do minimo de letras, nao consulta.
 */
export type CityFetcher = <T>(path: string) => Promise<T>;

export function createCitySearch(fetcher: CityFetcher) {
  const stateIds = new Map<string, Promise<number>>();
  const citiesByUf = new Map<string, Promise<CityRest[]>>();

  function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
    let found = cache.get(key);
    if (!found) {
      found = load();
      // Falha nao fica em cache: a proxima busca tenta de novo.
      found.catch(() => cache.delete(key));
      cache.set(key, found);
    }
    return found;
  }

  async function loadAll(stateId: number): Promise<CityRest[]> {
    const all: CityRest[] = [];
    for (let page = 0; ; page += 1) {
      const result = await fetcher<CitiesPage<CityRest>>(stateCitiesPath(stateId, page));
      all.push(...result.content);
      if (result.last || result.content.length === 0) {
        return all;
      }
    }
  }

  return async function searchCities(uf: string, query: string): Promise<CityOption[]> {
    const key = uf.trim().toUpperCase();
    const wanted = normalizeCityText(query);
    if (!key || wanted.length < CITY_SEARCH_MIN_LENGTH) {
      return [];
    }
    const stateId = await cached(stateIds, key, () => fetcher<StateRest>(stateByUfPath(key)).then((state) => state.id));
    const all = await cached(citiesByUf, key, () => loadAll(stateId));
    const found = all
      .map((city) => ({ city, text: normalizeCityText(city.name) }))
      .filter((item) => item.text.includes(wanted));
    found.sort((a, b) => Number(!a.text.startsWith(wanted)) - Number(!b.text.startsWith(wanted)));
    return found.slice(0, CITY_SEARCH_PAGE_SIZE).map((item) => toCityOption(item.city));
  };
}
