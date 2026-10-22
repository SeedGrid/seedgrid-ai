// Seletor de empresa (T7.2). Tudo aqui e' PURO (sem rede, sem React, sem cookies): decide quando o
// seletor aparece, ordena/trava as empresas, mapeia o erro da troca e monta o corpo que o BFF
// devolve ao navegador. O componente (`app/components/CompanySelect.tsx`) so' desenha.
import { COMPANY_DISABLED_CODE, COMPANY_DISABLED_MESSAGE, extractProblemCode } from "./api-error";
import type { CompanyAccessMode } from "./company-access";
import type { MyCompany } from "./my-companies";

/** Pagina publica (`/auth/**`) que o login usa quando o backend pede a escolha da empresa. */
export const COMPANY_SELECT_PATH = "/auth/select-company";

/** `AuthResponseDTO.companySelectionRequired`: so' `true` literal conta (ausente = backend antigo). */
export function isCompanySelectionRequired(payload: unknown): boolean {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { companySelectionRequired?: unknown }).companySelectionRequired === true
  );
}

/**
 * Para onde ir depois de uma autenticacao bem-sucedida (login, 2FA, login social). A escolha da
 * empresa vem ANTES da troca obrigatoria de senha: o token so' fica escopado depois dela.
 */
export function resolvePostLoginPath(payload: unknown): string {
  if (isCompanySelectionRequired(payload)) {
    return COMPANY_SELECT_PATH;
  }
  const changeRequired =
    typeof payload === "object" &&
    payload !== null &&
    (payload as { changePasswordRequired?: unknown }).changePasswordRequired === true;
  return changeRequired ? "/change-password" : "/";
}

type SessionData = {
  publicId?: unknown;
  changePasswordRequired?: unknown;
  twoFactorEnabled?: unknown;
  companySelectionRequired?: unknown;
};

/** Corpo que o BFF devolve ao navegador apos gravar os cookies (o token nunca vai junto). */
export function buildSessionResponseBody(data: SessionData) {
  return {
    status: "OK" as const,
    changePasswordRequired: data.changePasswordRequired === true,
    twoFactorEnabled: data.twoFactorEnabled === true,
    publicId: typeof data.publicId === "string" ? data.publicId : null,
    companySelectionRequired: data.companySelectionRequired === true,
  };
}

const MODE_ORDER: Record<CompanyAccessMode, number> = { ACTIVE: 0, READ_ONLY: 1, DISABLED: 2 };

/** Ativas primeiro, depois somente leitura, desativadas por ultimo; dentro do grupo, por nome. */
export function sortCompaniesForSelection(companies: readonly MyCompany[]): MyCompany[] {
  return [...companies].sort(
    (a, b) =>
      MODE_ORDER[a.accessMode] - MODE_ORDER[b.accessMode] ||
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );
}

/** Empresa DESATIVADA nao pode ser escolhida (o backend responde 403 COMPANY_DISABLED). */
export function canSelectCompany(company: Pick<MyCompany, "accessMode">): boolean {
  return company.accessMode !== "DISABLED";
}

/** Empresa pre-marcada: a primeira que pode ser escolhida (na ordem recebida); nenhuma = null. */
export function defaultCompanySelection(companies: readonly MyCompany[]): string | null {
  return companies.find(canSelectCompany)?.publicId ?? null;
}

/** "PJ" / "PF" a partir do `personType` do backend; desconhecido ou ausente = null (nao mostra). */
export function personTypeLabel(value: unknown): "PJ" | "PF" | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  if (v === "PJ" || v === "LEGAL" || v === "JURIDICA" || v === "LEGAL_ENTITY" || v === "COMPANY") return "PJ";
  if (v === "PF" || v === "NATURAL" || v === "FISICA" || v === "INDIVIDUAL" || v === "NATURAL_PERSON") return "PF";
  return null;
}

export type AccessBadge = { label: string; tone: "success" | "warning" | "error" };

export function accessModeBadge(mode: CompanyAccessMode): AccessBadge {
  if (mode === "READ_ONLY") return { label: "Somente leitura", tone: "warning" };
  if (mode === "DISABLED") return { label: "Desativada", tone: "error" };
  return { label: "Ativa", tone: "success" };
}

export const DISABLED_COMPANY_HINT =
  "Esta empresa está desativada e não pode ser acessada. Fale com o responsável pela conta.";
export const READ_ONLY_COMPANY_HINT = "Você poderá consultar os dados, mas não alterá-los.";
export const SELECT_COMPANY_SESSION_MESSAGE = "Sua sessão expirou. Entre novamente.";
export const SELECT_COMPANY_FALLBACK_MESSAGE = "Não foi possível selecionar a empresa. Tente novamente.";
export const SELECT_COMPANY_FORBIDDEN_MESSAGE = "Você não tem acesso a esta empresa.";

export type SelectCompanyError = {
  message: string;
  /** `true` quando a sessao nao serve mais e o caminho e' o login (401). */
  sessionLost: boolean;
  /** `true` quando a empresa escolhida esta desativada (a tela marca e trava a opcao). */
  companyDisabled: boolean;
};

/**
 * Traduz a falha de `POST /api/me/select-company`. `COMPANY_READ_ONLY` nao se aplica aqui: escolher
 * empresa READ_ONLY e' permitido (so' a escrita e' recusada depois).
 */
export function mapSelectCompanyError(status: number, body: unknown): SelectCompanyError {
  if (status === 401) {
    return { message: SELECT_COMPANY_SESSION_MESSAGE, sessionLost: true, companyDisabled: false };
  }
  if (extractProblemCode(body) === COMPANY_DISABLED_CODE) {
    return { message: COMPANY_DISABLED_MESSAGE, sessionLost: false, companyDisabled: true };
  }
  if (status === 403) {
    return { message: SELECT_COMPANY_FORBIDDEN_MESSAGE, sessionLost: false, companyDisabled: false };
  }
  const detail =
    typeof body === "object" && body !== null ? (body as { detail?: unknown }).detail : undefined;
  return {
    message: typeof detail === "string" && detail.trim() ? detail : SELECT_COMPANY_FALLBACK_MESSAGE,
    sessionLost: false,
    companyDisabled: false,
  };
}

export type SelectCompanyResult =
  | { ok: true; changePasswordRequired: boolean }
  | ({ ok: false } & SelectCompanyError);

/**
 * Chama o BFF `POST /api/me/select-company`. `fetchImpl` e' injetavel so' para o teste; falha de rede
 * vira erro tratado (nunca lanca).
 */
export async function requestSelectCompany(
  companyPublicId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SelectCompanyResult> {
  let response: Response;
  try {
    response = await fetchImpl("/api/me/select-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyPublicId }),
    });
  } catch {
    return {
      ok: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
      sessionLost: false,
      companyDisabled: false,
    };
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, ...mapSelectCompanyError(response.status, body) };
  }
  return {
    ok: true,
    changePasswordRequired:
      typeof body === "object" &&
      body !== null &&
      (body as { changePasswordRequired?: unknown }).changePasswordRequired === true,
  };
}
