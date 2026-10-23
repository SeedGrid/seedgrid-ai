// Empresas do usuario corrente (`GET /me/companies`) para o seletor de empresa (T5.6). Puro: o
// formato do backend (`MyCompanyDTORes`, que ganha `accessMode` no plano 4.14) vira opcao de
// seletor, marcando o estado e travando a empresa desligada (nao se entra nela).
import {
  companyOptionLabel,
  normalizeAccessMode,
  type CompanyAccessMode,
} from "./company-access";

export type MyCompanyDTO = {
  publicId?: unknown;
  tradeName?: unknown;
  corporateName?: unknown;
  accessMode?: unknown;
  isRoot?: unknown;
  personType?: unknown;
};

export type MyCompany = {
  publicId: string;
  name: string;
  accessMode: CompanyAccessMode;
  /** Tipo de pessoa (PJ/PF) quando a API informa; ausente = nao exibir. */
  personType?: string;
};

export type MyCompanyOption = {
  id: string;
  label: string;
  disabled: boolean;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normaliza a lista do backend; item sem `publicId` e' descartado (nao da' para selecionar). */
export function parseMyCompanies(raw: unknown): MyCompany[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: MyCompany[] = [];
  for (const item of raw as MyCompanyDTO[]) {
    const publicId = text(item?.publicId);
    if (!publicId) continue;
    out.push({
      publicId,
      name: text(item.tradeName) || text(item.corporateName) || publicId,
      accessMode: normalizeAccessMode(item.accessMode),
      ...(text(item.personType) ? { personType: text(item.personType) } : {}),
    });
  }
  return out;
}

export function toCompanyOptions(companies: readonly MyCompany[]): MyCompanyOption[] {
  return companies.map((c) => ({
    id: c.publicId,
    label: companyOptionLabel(c.name, c.accessMode),
    disabled: c.accessMode === "DISABLED",
  }));
}

/** O seletor so' faz sentido com mais de uma empresa. */
export function shouldShowCompanySelector(companies: readonly MyCompany[]): boolean {
  return companies.length > 1;
}
