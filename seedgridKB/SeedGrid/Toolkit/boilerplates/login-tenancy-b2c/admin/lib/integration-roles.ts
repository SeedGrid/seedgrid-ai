// Roles de integracao (Fase 4, plano 4.5): a chave de API so recebe permissoes que a software house
// LIBEROU (`permissions.for_integration`). Logica pura da tela, sem React, para ser testada sozinha.

// Le o `code` de um corpo problem+json (objeto ou texto JSON). Nunca lanca. (Copia local de
// proposito: este modulo nao depende de api-error.ts, que nem todo admin tem.)
function problemCode(body: unknown): string | null {
  let value: unknown = body;
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
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" && code.trim() ? code.trim() : null;
}

export const PERMISSION_NOT_FOR_INTEGRATION_CODE = "PERMISSION_NOT_FOR_INTEGRATION";
export const PERMISSION_NOT_FOR_INTEGRATION_MESSAGE =
  "Este perfil de integracao so aceita permissoes liberadas para integracao pela software house. Remova as demais e tente de novo.";

type Releasable = { forIntegration?: boolean | null };
type Identified = { publicId: string };

/** Permissoes que a software house liberou para integracao. */
export function releasedForIntegration<T extends Releasable>(options: readonly T[]): T[] {
  return options.filter((option) => option.forIntegration === true);
}

/**
 * Permissoes que a tela oferece: perfil de integracao enxerga so as liberadas; perfil comum, todas.
 * (Perfil comum nunca depende do flag: ele so vale para integracao.)
 */
export function selectablePermissions<T extends Releasable>(
  options: readonly T[],
  forIntegration: boolean,
): T[] {
  return forIntegration ? releasedForIntegration(options) : [...options];
}

/** Quantas permissoes ficam de fora do perfil de integracao por nao estarem liberadas. */
export function notReleasedCount<T extends Releasable>(options: readonly T[]): number {
  return options.length - releasedForIntegration(options).length;
}

/** Mantem so os ids que a tela ainda oferece (ao marcar "integracao" as nao liberadas saem da selecao). */
export function pruneToSelectable<T extends Identified>(
  ids: readonly string[],
  selectable: readonly T[],
): string[] {
  const allowed = new Set(selectable.map((option) => option.publicId));
  return ids.filter((id) => allowed.has(id));
}

/** Perfis que podem ser atribuidos a PESSOA: o perfil de integracao so vale para chave de API. */
export function assignableToUsers<T extends Releasable>(roles: readonly T[]): T[] {
  return roles.filter((role) => role.forIntegration !== true);
}

/** O corpo (objeto ou texto problem+json) e' a recusa de permissao nao liberada para integracao? */
export function isNotForIntegrationBody(body: unknown): boolean {
  return problemCode(body) === PERMISSION_NOT_FOR_INTEGRATION_CODE;
}

/**
 * Mensagem amigavel quando o erro de salvar perfil e' PERMISSION_NOT_FOR_INTEGRATION; `null` para
 * qualquer outro erro (o chamador cai na mensagem normal do backend). Aceita o ApiClientError
 * (`responseBody`) ou o proprio corpo.
 */
export function notForIntegrationMessage(error: unknown): string | null {
  const body =
    typeof error === "object" && error !== null && "responseBody" in error
      ? (error as { responseBody?: unknown }).responseBody
      : error;
  return isNotForIntegrationBody(body) ? PERMISSION_NOT_FOR_INTEGRATION_MESSAGE : null;
}
