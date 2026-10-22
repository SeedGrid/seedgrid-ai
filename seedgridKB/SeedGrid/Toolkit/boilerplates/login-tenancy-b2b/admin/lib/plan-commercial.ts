/**
 * Condições comerciais de empresas e inadimplência do PlanTerm (billing).
 *
 * Campos (nomes exatos do backend: PlanTermRequest/Patch/Response):
 * - maxCompanies / maxReadOnlyCompanies: inteiros; nulo ou 0 = sem limite.
 * - pastDueReadOnlyAfterDays / pastDueDisableAfterDays: inteiros; nulo = usa o padrão da propriedade
 *   (seedgrid.billing.past-due.*); 0 = não aplica o passo.
 *
 * Os formulários guardam texto (como os inputs devolvem); estes helpers validam e convertem.
 */

export type CommercialConditions = {
  maxCompanies?: number | null;
  maxReadOnlyCompanies?: number | null;
  pastDueReadOnlyAfterDays?: number | null;
  pastDueDisableAfterDays?: number | null;
};

export type CommercialFields = {
  maxCompanies: string;
  maxReadOnlyCompanies: string;
  pastDueReadOnlyAfterDays: string;
  pastDueDisableAfterDays: string;
};

export type CommercialPayload = {
  maxCompanies: number | null;
  maxReadOnlyCompanies: number | null;
  pastDueReadOnlyAfterDays: number | null;
  pastDueDisableAfterDays: number | null;
};

export const EMPTY_COMMERCIAL_FIELDS: CommercialFields = {
  maxCompanies: "",
  maxReadOnlyCompanies: "",
  pastDueReadOnlyAfterDays: "",
  pastDueDisableAfterDays: "",
};

export const COMPANY_LIMIT_HELP = "Vazio ou 0 = sem limite.";
export const PAST_DUE_HELP = "Vazio = usa o padrão da propriedade; 0 = não aplica este passo.";

/** Texto do formulário para o valor vindo da API (nulo/ausente = vazio). */
function toText(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

export function toCommercialFields(term: CommercialConditions | null | undefined): CommercialFields {
  return {
    maxCompanies: toText(term?.maxCompanies),
    maxReadOnlyCompanies: toText(term?.maxReadOnlyCompanies),
    pastDueReadOnlyAfterDays: toText(term?.pastDueReadOnlyAfterDays),
    pastDueDisableAfterDays: toText(term?.pastDueDisableAfterDays),
  };
}

/** Vazio -> null; inteiro >= 0 -> número; qualquer outra coisa -> NaN (inválido). */
export function parseOptionalNonNegativeInt(text: string | null | undefined): number | null {
  const trimmed = (text ?? "").trim();
  if (trimmed === "") {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return Number.NaN;
  }
  const value = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(value) ? value : Number.NaN;
}

const FIELD_LABELS: Record<keyof CommercialFields, string> = {
  maxCompanies: "Empresas",
  maxReadOnlyCompanies: "Empresas somente leitura",
  pastDueReadOnlyAfterDays: "Dias de atraso para somente leitura",
  pastDueDisableAfterDays: "Dias de atraso para desativar",
};

export type CommercialResult =
  | { payload: CommercialPayload; error: null }
  | { payload: null; error: string };

/** Valida (inteiros >= 0) e monta o trecho do corpo do POST/PATCH. */
export function toCommercialPayload(fields: CommercialFields): CommercialResult {
  const values = {} as CommercialPayload;
  for (const key of Object.keys(FIELD_LABELS) as (keyof CommercialFields)[]) {
    const value = parseOptionalNonNegativeInt(fields[key]);
    if (value !== null && Number.isNaN(value)) {
      return { payload: null, error: `${FIELD_LABELS[key]}: informe um número inteiro maior ou igual a 0.` };
    }
    values[key] = value;
  }
  return { payload: values, error: null };
}

/** Limite de empresas para a listagem: nulo/0 = sem limite. */
export function formatCompanyLimit(value: number | null | undefined): string {
  return value == null || value === 0 ? "Sem limite" : String(value);
}

/** Dias de inadimplência para a listagem: nulo = padrão; 0 = não aplica. */
export function formatPastDueDays(value: number | null | undefined): string {
  if (value == null) {
    return "Padrão";
  }
  return value === 0 ? "Não aplica" : `${value} d`;
}

/** Resumo das empresas: "Ativas: 5 · Somente leitura: Sem limite". */
export function formatCompaniesSummary(term: CommercialConditions): string {
  return `Ativas: ${formatCompanyLimit(term.maxCompanies)} · Somente leitura: ${formatCompanyLimit(term.maxReadOnlyCompanies)}`;
}

/** Resumo da inadimplência: "Somente leitura: 7 d · Desativar: Padrão". */
export function formatPastDueSummary(term: CommercialConditions): string {
  return `Somente leitura: ${formatPastDueDays(term.pastDueReadOnlyAfterDays)} · Desativar: ${formatPastDueDays(term.pastDueDisableAfterDays)}`;
}
