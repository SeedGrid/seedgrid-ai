// Preenchimento do cadastro de empresa a partir das consultas públicas (FE-39, P180).
//
// O `SgInputCNPJ` (validateWithPublicaCnpj) e o `SgInputPostalCode` (validateWithViaCep) só consultam e
// devolvem a resposta crua no callback; quem preenche os campos é a tela. Este módulo concentra o mapeamento
// (puro, sem rede e sem React) para ficar coberto por teste. Mesmo mapeamento do `CompanyEditor` do
// `seedgrid-fe-security`. Regra: o dado da consulta só entra quando veio preenchido; nunca apaga o que a
// pessoa já digitou.
import { normalizeCityText, type CityOption } from "./cities";
import type { CompanyForm } from "./companies";

type LookupPatch = Partial<
  Pick<
    CompanyForm,
    | "corporateName"
    | "tradeName"
    | "addrStreet"
    | "addrNumber"
    | "addrComplement"
    | "addrDistrict"
    | "addrPostalCode"
    | "addrCity"
    | "addrState"
    | "addrPhone"
  >
>;

/** Texto aparado de `value[path...]`, ou null se não for texto ou estiver vazio. */
export function readLookupString(value: unknown, ...path: string[]): string | null {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== "object") {
      return null;
    }
    current = Reflect.get(current, key);
  }
  return typeof current === "string" && current.trim() ? current.trim() : null;
}

/** "01310100" -> "01310-100". */
export function formatPostalCode(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) {
    return null;
  }
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** "11" + "988887777" -> "(11) 98888-7777"; menos de 10 dígitos não vira telefone. */
export function formatBrazilPhone(ddd: string | null, phone: string | null): string | null {
  const digits = `${ddd ?? ""}${phone ?? ""}`.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 10) {
    return null;
  }
  const mobile = digits.length === 11;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, mobile ? 7 : 6)}-${digits.slice(mobile ? 7 : 6)}`;
}

function put<K extends keyof LookupPatch>(patch: LookupPatch, key: K, value: string | null) {
  if (value) {
    patch[key] = value;
  }
}

/** Campos do formulário que a resposta do `publica.cnpj.ws` preenche (só os que vieram). */
export function companyPatchFromPublicaCnpj(data: unknown | null): LookupPatch {
  const patch: LookupPatch = {};
  if (!data) {
    return patch;
  }
  const street = [
    readLookupString(data, "estabelecimento", "tipo_logradouro"),
    readLookupString(data, "estabelecimento", "logradouro"),
  ].filter(Boolean);
  put(patch, "corporateName", readLookupString(data, "razao_social"));
  put(patch, "tradeName", readLookupString(data, "estabelecimento", "nome_fantasia"));
  put(patch, "addrStreet", street.length ? street.join(" ") : null);
  put(patch, "addrNumber", readLookupString(data, "estabelecimento", "numero"));
  put(patch, "addrComplement", readLookupString(data, "estabelecimento", "complemento"));
  put(patch, "addrDistrict", readLookupString(data, "estabelecimento", "bairro"));
  put(patch, "addrPostalCode", formatPostalCode(readLookupString(data, "estabelecimento", "cep")));
  put(patch, "addrCity", readLookupString(data, "estabelecimento", "cidade", "nome"));
  put(patch, "addrState", readLookupString(data, "estabelecimento", "estado", "sigla")?.toUpperCase() ?? null);
  put(
    patch,
    "addrPhone",
    formatBrazilPhone(
      readLookupString(data, "estabelecimento", "ddd1"),
      readLookupString(data, "estabelecimento", "telefone1"),
    ),
  );
  return patch;
}

/** Resposta do ViaCEP (`erro: true` quando o CEP não existe). */
export type ViaCepData = {
  erro?: boolean;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

/** Campos do formulário que o ViaCEP preenche. CEP inexistente não preenche nada. */
export function companyPatchFromViaCep(data: ViaCepData | null): LookupPatch {
  const patch: LookupPatch = {};
  if (!data || data.erro) {
    return patch;
  }
  put(patch, "addrStreet", readLookupString(data, "logradouro"));
  put(patch, "addrComplement", readLookupString(data, "complemento"));
  put(patch, "addrDistrict", readLookupString(data, "bairro"));
  put(patch, "addrCity", readLookupString(data, "localidade"));
  put(patch, "addrState", readLookupString(data, "uf")?.toUpperCase() ?? null);
  return patch;
}

/**
 * Aplica o que a consulta trouxe. Se a UF ou a cidade mudou, a escolha anterior da cidade (FK) deixa de valer:
 * `cityId`/`cityName` voltam a vazio e o texto fica como dica até a tela casar com a lista de cidades.
 */
export function applyLookupPatch(form: CompanyForm, patch: LookupPatch): CompanyForm {
  const next: CompanyForm = { ...form, ...patch };
  const cityChanged =
    ("addrCity" in patch && patch.addrCity !== form.cityName) || ("addrState" in patch && patch.addrState !== form.addrState);
  if (cityChanged) {
    next.cityId = null;
    next.cityName = "";
  }
  return next;
}

/** A cidade da lista (FK) que tem exatamente o nome da consulta, sem diferenciar acento nem maiúsculas; senão null. */
export function matchCityByName(options: readonly CityOption[], name: string): CityOption | null {
  const wanted = normalizeCityText(name);
  if (!wanted) {
    return null;
  }
  const same = options.filter((option) => normalizeCityText(option.label) === wanted);
  return same.length === 1 ? same[0] : null;
}
