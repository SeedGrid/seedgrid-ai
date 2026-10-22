// Estado de acesso da empresa da sessao (T5.6, plano 4.12). Tudo aqui e' PURO (sem rede, sem React):
// o BFF guarda a empresa corrente num cookie, o `/api/auth/me` a devolve, e a tela decide o que
// mostrar e o que esconder. Quem APLICA o estado e' o `security` (filtro central); o front so'
// reflete — esconder botao e' conforto, o 403 `COMPANY_READ_ONLY` e' a garantia.
import { ADMIN_TOKEN_COOKIE } from "./admin-auth";

export type CompanyAccessMode = "ACTIVE" | "READ_ONLY" | "DISABLED";

/** `AuthResponse.currentCompany` (plano 4.14). */
export type CurrentCompany = {
  publicId: string;
  name: string;
  accessMode: CompanyAccessMode;
  personType?: string | null;
  /**
   * `false` = o login/refresh NAO informou o estado (backend antigo): `accessMode` e' so' o padrao
   * ACTIVE e vale buscar o estado real em `/me/companies` (ver `resolveAccessModeFallback`). Ausente
   * = informado pelo backend.
   */
  accessModeKnown?: false;
};

// Nome derivado do cookie de sessao do app: cada app tem o seu (cookie e' por dominio, nao por porta),
// e assim o arquivo e' igual em todos eles.
export const ADMIN_CURRENT_COMPANY_COOKIE = `${ADMIN_TOKEN_COOKIE}_company`;

/** Valor desconhecido/ausente vira ACTIVE (backend antigo sem o campo = comportamento de hoje). */
export function normalizeAccessMode(value: unknown): CompanyAccessMode {
  return value === "READ_ONLY" || value === "DISABLED" ? value : "ACTIVE";
}

/** Le a empresa corrente de um objeto ou de um texto JSON (cookie). Nunca lanca; invalido = null. */
export function parseCurrentCompany(raw: unknown): CurrentCompany | null {
  let value: unknown = raw;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{")) {
      return null;
    }
    try {
      value = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.publicId !== "string" || !obj.publicId.trim()) {
    return null;
  }
  const known = isKnownAccessMode(obj.accessMode);
  return {
    publicId: obj.publicId,
    name: typeof obj.name === "string" ? obj.name : "",
    accessMode: normalizeAccessMode(obj.accessMode),
    personType: typeof obj.personType === "string" ? obj.personType : null,
    ...(known ? {} : { accessModeKnown: false as const }),
  };
}

function isKnownAccessMode(value: unknown): boolean {
  return value === "ACTIVE" || value === "READ_ONLY" || value === "DISABLED";
}

export function serializeCurrentCompany(company: CurrentCompany): string {
  return JSON.stringify({
    publicId: company.publicId,
    name: company.name,
    // Estado desconhecido vai como null (e volta como "nao informado" no parse): o round-trip do
    // cookie nao transforma um "nao sei" em ACTIVE.
    accessMode: company.accessModeKnown === false ? null : company.accessMode,
    personType: company.personType ?? null,
  });
}

/**
 * Fallback do estado de acesso (T5.13): o login/refresh/troca de empresa devolve
 * `currentCompany.accessMode`; quando nao devolve (backend antigo), o estado vem de `GET /me/companies`
 * (a empresa de mesmo `publicId`). Estado informado pelo backend NUNCA e' sobrescrito.
 */
export function resolveAccessModeFallback(
  current: CurrentCompany | null,
  companies: ReadonlyArray<{ publicId: string; accessMode: CompanyAccessMode }>,
): CurrentCompany | null {
  if (!current || current.accessModeKnown !== false) {
    return current;
  }
  const match = companies.find((company) => company.publicId === current.publicId);
  if (!match) {
    return current;
  }
  const { accessModeKnown: _unknown, ...rest } = current;
  void _unknown;
  return { ...rest, accessMode: match.accessMode };
}

export function isReadOnlyMode(mode: CompanyAccessMode | null | undefined): boolean {
  return mode === "READ_ONLY";
}

// Sufixos das permissoes que ALTERAM dados (`USER_CREATE`, `PESSOA_UPDATE`, `APIKEY_REVOKE`, ...).
// As telas ja escondem os botoes de escrita pela permissao; em READ_ONLY o `hasPermission` passa
// a negar estas, e todas as telas CRUD (existentes e futuras) escondem os botoes sem mudar nada.
// Leitura (`_READ`, `_VIEW`, `_LIST`) segue liberada. A lista e' fechada de proposito: permissao
// desconhecida continua valendo (esconder a mais quebra tela; deixar passar so' ganha um 403).
const WRITE_PERMISSION_SUFFIXES = [
  "_CREATE",
  "_UPDATE",
  "_DELETE",
  "_WRITE",
  "_EDIT",
  "_REVOKE",
  "_INVITE",
  "_APPROVE",
  "_REJECT",
  "_IMPORT",
  "_MANAGE",
];

export function isWritePermission(permission: string): boolean {
  const upper = permission.toUpperCase();
  return WRITE_PERMISSION_SUFFIXES.some((suffix) => upper.endsWith(suffix));
}

/** Rotulo de uma empresa em listas/seletores, marcando o estado (so' quando nao e' ACTIVE). */
export function companyOptionLabel(name: string, mode: CompanyAccessMode): string {
  if (mode === "READ_ONLY") return `${name} (somente leitura)`;
  if (mode === "DISABLED") return `${name} (desativada)`;
  return name;
}

export const READ_ONLY_BANNER_TEXT =
  "Esta empresa está em modo somente leitura: você pode consultar os dados, mas não alterá-los.";
