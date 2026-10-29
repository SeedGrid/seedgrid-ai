// Cidade do endereco no cadastro PUBLICO (plano cidade-no-endereco, TCI.13). O cadastro nao tem token, entao ele nao
// usa a REST autenticada da cities (`/cities-api`, CITY_READ). Usa a consulta publica minima
// (`/public/cities/by-ibge-code/{codigo}`, ligada por `seedgrid.cities.public-rest.enabled=true` no backend), servida
// ao navegador pelo BFF `/api/signup/city/{codigo}`. O ViaCEP (e a consulta de CNPJ) trazem o codigo IBGE do municipio,
// entao o formulario resolve o `cityId` sem o usuario digitar nada. Qualquer falha devolve null e o cadastro segue
// com a cidade em TEXTO (`cityId` e' opcional no backend).

/** Resposta minima da consulta publica (nada alem destes 4 campos). */
export type PublicCity = {
  id: number;
  name: string;
  uf: string;
  ibgeCode: string;
};

export const PUBLIC_CITY_BFF_BASE = "/api/signup/city";

/** Codigo IBGE de municipio: exatamente 7 digitos (aceita numero ou texto com mascara). */
export function normalizeIbgeCode(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const digits = String(value).replace(/\D/g, "");
  return /^\d{7}$/.test(digits) ? digits : null;
}

/** Valida o corpo da consulta publica; qualquer coisa fora do formato vira null. */
export function toPublicCity(raw: unknown): PublicCity | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "number" || !Number.isFinite(value.id)) {
    return null;
  }
  return {
    id: value.id,
    name: typeof value.name === "string" ? value.name : "",
    uf: typeof value.uf === "string" ? value.uf.toUpperCase() : "",
    ibgeCode: typeof value.ibgeCode === "string" ? value.ibgeCode : "",
  };
}

/** Resolve o municipio pelo codigo IBGE. Nunca lanca: sem codigo valido, erro de rede ou resposta ruim = null. */
export async function lookupCityByIbge(
  ibge: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<PublicCity | null> {
  const code = normalizeIbgeCode(ibge);
  if (!code) {
    return null;
  }
  try {
    const response = await fetchImpl(`${PUBLIC_CITY_BFF_BASE}/${code}`, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return null;
    }
    return toPublicCity(await response.json());
  } catch {
    return null;
  }
}

/**
 * `cityId` para o payload do cadastro: so' quando a cidade resolvida combina com a UF do formulario (guarda contra
 * um resultado antigo depois de o CEP/CNPJ mudar). Sem combinacao, o cadastro segue em texto.
 */
export function cityIdForSignup(city: PublicCity | null, stateText: string): number | undefined {
  if (!city) {
    return undefined;
  }
  return city.uf === stateText.trim().toUpperCase() ? city.id : undefined;
}
