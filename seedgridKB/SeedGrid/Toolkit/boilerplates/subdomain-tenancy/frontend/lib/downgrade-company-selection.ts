// Regra do dialogo de downgrade de empresas (T5.5, plano 4.12). PURA (sem rede, sem React): o
// dialogo so desenha; quem decide se a escolha vale e este modulo, coberto por teste unitario.
//
// O plano comporta `maxCompanies` empresas ATIVAS e `maxReadOnlyCompanies` em SOMENTE LEITURA
// (0/nulo = sem limite, como nos usuarios). As empresas PROTEGIDAS (a da plataforma e a do
// responsavel pela conta) nunca mudam de estado: aparecem travadas, ocupam vaga de ativa e nao
// entram na escolha. O cliente distribui as ELEGIVEIS em `keepActive`, `readOnly` e `disable` e
// so confirma com as contagens exatas - o servidor valida de novo (a regra aqui e conforto).
import type { CompanyAccessMode } from "./company-access";

export type DowngradeEligibleCompany = {
  publicId: string;
  name: string;
  /** Estado atual da empresa. */
  accessMode?: CompanyAccessMode | null;
};

export type DowngradeProtectedCompany = {
  publicId: string;
  name: string;
  /** Por que e protegida (ex.: PLATFORM, OWNER); so informativo. */
  reason?: string | null;
};

/** Escolha ja salva (reedicao), no formato do `change-plan`. */
export type CompanySelection = {
  keepActive: string[];
  readOnly: string[];
  disable: string[];
};

/** `GET /me/billing/downgrade-company-selection` (no molde do `downgrade-user-selection`). */
export type DowngradeCompanySelectionState = {
  status: "OK" | "NO_PENDING_CHANGE";
  requiresCompanySelection?: boolean;
  /** Quantas empresas ATIVAS o plano comporta (inclui as protegidas). 0/nulo = sem limite. */
  maxCompanies?: number | null;
  /** Quantas em SOMENTE LEITURA o plano comporta. 0/nulo = sem limite. */
  maxReadOnlyCompanies?: number | null;
  eligibleCompanies?: DowngradeEligibleCompany[];
  protectedCompanies?: DowngradeProtectedCompany[];
  selection?: CompanySelection | null;
};

export type CompanyChoice = "KEEP_ACTIVE" | "READ_ONLY" | "DISABLE";

/** Escolha por empresa; ausente/null = ainda nao decidida. */
export type CompanyChoices = Record<string, CompanyChoice | null | undefined>;

export type CompanyRequiredCounts = {
  /** Quantas elegiveis ficam ativas (ja descontadas as protegidas). */
  keepActive: number;
  /** Quantas ficam em somente leitura; null = plano sem limite de somente leitura (divisao livre). */
  readOnly: number | null;
  /** Quantas sao desligadas; null quando a divisao com somente leitura e livre. */
  disable: number | null;
  /** Elegiveis que nao ficam ativas (somente leitura + desligadas). */
  remaining: number;
};

function limit(value: number | null | undefined): number | null {
  return typeof value === "number" && value > 0 ? value : null;
}

/** Contagens exatas que o plano exige para as empresas ELEGIVEIS. */
export function requiredCounts(state: DowngradeCompanySelectionState): CompanyRequiredCounts {
  const eligible = state.eligibleCompanies?.length ?? 0;
  const protectedCount = state.protectedCompanies?.length ?? 0;
  const maxActive = limit(state.maxCompanies);
  const keepActive =
    maxActive === null ? eligible : Math.min(eligible, Math.max(0, maxActive - protectedCount));
  const remaining = eligible - keepActive;
  const maxReadOnly = limit(state.maxReadOnlyCompanies);
  if (maxReadOnly === null) {
    return { keepActive, readOnly: null, disable: null, remaining };
  }
  const readOnly = Math.min(maxReadOnly, remaining);
  return { keepActive, readOnly, disable: remaining - readOnly, remaining };
}

export type CompanyChoiceCounts = {
  keepActive: number;
  readOnly: number;
  disable: number;
  undecided: number;
};

export function countChoices(
  state: DowngradeCompanySelectionState,
  choices: CompanyChoices,
): CompanyChoiceCounts {
  const counts: CompanyChoiceCounts = { keepActive: 0, readOnly: 0, disable: 0, undecided: 0 };
  for (const company of state.eligibleCompanies ?? []) {
    const choice = choices[company.publicId];
    if (choice === "KEEP_ACTIVE") counts.keepActive += 1;
    else if (choice === "READ_ONLY") counts.readOnly += 1;
    else if (choice === "DISABLE") counts.disable += 1;
    else counts.undecided += 1;
  }
  return counts;
}

/** A escolha atual bate com as contagens exatas do plano? (so entao o dialogo confirma) */
export function choicesMatch(
  state: DowngradeCompanySelectionState,
  choices: CompanyChoices,
): boolean {
  const need = requiredCounts(state);
  const have = countChoices(state, choices);
  if (have.undecided > 0) return false;
  if (have.keepActive !== need.keepActive) return false;
  if (need.readOnly !== null && have.readOnly !== need.readOnly) return false;
  if (need.disable !== null && have.disable !== need.disable) return false;
  return true;
}

/** Mensagem do que falta para a escolha valer (null quando ja vale). */
export function mismatchMessage(
  state: DowngradeCompanySelectionState,
  choices: CompanyChoices,
): string | null {
  if (choicesMatch(state, choices)) return null;
  const need = requiredCounts(state);
  const have = countChoices(state, choices);
  const parts: string[] = [];
  if (have.undecided > 0) parts.push(`${have.undecided} empresa(s) sem escolha`);
  if (have.keepActive !== need.keepActive) {
    parts.push(`manter ativa: ${have.keepActive} de ${need.keepActive}`);
  }
  if (need.readOnly !== null && have.readOnly !== need.readOnly) {
    parts.push(`somente leitura: ${have.readOnly} de ${need.readOnly}`);
  }
  if (need.disable !== null && have.disable !== need.disable) {
    parts.push(`desligar: ${have.disable} de ${need.disable}`);
  }
  return `Ajuste a escolha para continuar (${parts.join("; ")}).`;
}

/** Escolhas iniciais: as da selecao salva (reedicao); sem selecao salva, tudo em aberto. */
export function initialChoices(state: DowngradeCompanySelectionState): CompanyChoices {
  const choices: CompanyChoices = {};
  const eligible = new Set((state.eligibleCompanies ?? []).map((c) => c.publicId));
  const saved = state.selection;
  if (!saved) return choices;
  for (const id of saved.keepActive ?? []) if (eligible.has(id)) choices[id] = "KEEP_ACTIVE";
  for (const id of saved.readOnly ?? []) if (eligible.has(id)) choices[id] = "READ_ONLY";
  for (const id of saved.disable ?? []) if (eligible.has(id)) choices[id] = "DISABLE";
  return choices;
}

/**
 * Corpo `companySelection` do `change-plan`. As PROTEGIDAS entram em `keepActive` (ocupam vaga de
 * ativa e o servidor as conta la); as elegiveis seguem a escolha. Devolve null se nao fecha.
 */
export function toCompanySelection(
  state: DowngradeCompanySelectionState,
  choices: CompanyChoices,
): CompanySelection | null {
  if (!choicesMatch(state, choices)) return null;
  const selection: CompanySelection = {
    keepActive: (state.protectedCompanies ?? []).map((c) => c.publicId),
    readOnly: [],
    disable: [],
  };
  for (const company of state.eligibleCompanies ?? []) {
    const choice = choices[company.publicId];
    if (choice === "KEEP_ACTIVE") selection.keepActive.push(company.publicId);
    else if (choice === "READ_ONLY") selection.readOnly.push(company.publicId);
    else if (choice === "DISABLE") selection.disable.push(company.publicId);
  }
  return selection;
}

/** Corpo do `POST /me/billing/change-plan` (usuarios + empresas; ambos opcionais). */
export function buildChangePlanBody(
  planId: string,
  userPublicIdsToDeactivate?: string[],
  companySelection?: CompanySelection | null,
) {
  return {
    planId,
    userPublicIdsToDeactivate: userPublicIdsToDeactivate ?? null,
    companySelection: companySelection ?? null,
  };
}

// ---------------------------------------------------------------------------
// T5.13: checkout com selecao de empresas e reedicao (PUT).
// ---------------------------------------------------------------------------

/** 400 do `POST /me/billing/checkout` e do `PUT downgrade-company-selection`: contagem/empresa invalidas. */
export const INVALID_COMPANY_SELECTION_CODE = "INVALID_COMPANY_SELECTION";
/** Erro do `PUT downgrade-company-selection` quando o plano comporta todas as empresas (nada a escolher). */
export const COMPANY_SELECTION_NOT_REQUIRED_CODE = "COMPANY_SELECTION_NOT_REQUIRED";

export const INVALID_COMPANY_SELECTION_MESSAGE =
  "A escolha de empresas não confere com o limite do plano (ou o conjunto de empresas mudou). Revise a escolha e tente de novo.";
export const COMPANY_SELECTION_NOT_REQUIRED_MESSAGE =
  "Não há empresas a escolher: o plano contratado comporta todas as empresas da conta.";

/** Mensagem amigavel para o `code` de erro da selecao de empresas; null = nao e' um destes. */
export function companySelectionErrorMessage(code: unknown): string | null {
  if (code === INVALID_COMPANY_SELECTION_CODE) return INVALID_COMPANY_SELECTION_MESSAGE;
  if (code === COMPANY_SELECTION_NOT_REQUIRED_CODE) return COMPANY_SELECTION_NOT_REQUIRED_MESSAGE;
  return null;
}

type SelectionRequirement = {
  requiresUserSelection?: boolean | null;
  requiresCompanySelection?: boolean | null;
};

/** A previa (troca ou checkout) exige alguma escolha antes de seguir? */
export function needsAnySelection(preview: SelectionRequirement | null | undefined): boolean {
  return preview?.requiresUserSelection === true || preview?.requiresCompanySelection === true;
}

/** Copia defensiva (sem repeticao) das tres listas, no formato que o servidor aceita. */
export function normalizeCompanySelection(selection: CompanySelection): CompanySelection {
  const uniq = (ids: readonly string[] | null | undefined) => [...new Set(ids ?? [])];
  return {
    keepActive: uniq(selection.keepActive),
    readOnly: uniq(selection.readOnly),
    disable: uniq(selection.disable),
  };
}

/** Corpo do `POST /me/billing/checkout`: plano + usuarios a desativar + escolha de empresas (opcionais). */
export function buildCheckoutBody(
  planId: string,
  userPublicIdsToDeactivate?: string[] | null,
  companySelection?: CompanySelection | null,
) {
  return {
    planId,
    userPublicIdsToDeactivate: userPublicIdsToDeactivate ?? null,
    companySelection: companySelection ? normalizeCompanySelection(companySelection) : null,
  };
}

/** Corpo do `PUT /me/billing/downgrade-company-selection` (reedicao enquanto o ciclo nao fecha). */
export function buildSaveCompanySelectionBody(selection: CompanySelection): CompanySelection {
  return normalizeCompanySelection(selection);
}

/**
 * Da' para reeditar a escolha de empresas agora? So' quando ha troca de plano pendente e o servidor
 * diz que ha o que escolher (senao o PUT responde COMPANY_SELECTION_NOT_REQUIRED).
 */
export function canReeditCompanySelection(
  state: DowngradeCompanySelectionState | null | undefined,
): boolean {
  return state != null && state.status !== "NO_PENDING_CHANGE" && state.requiresCompanySelection === true;
}
