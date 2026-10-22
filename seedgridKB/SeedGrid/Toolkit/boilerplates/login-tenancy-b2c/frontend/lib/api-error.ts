// O report-api devolve erros em application/problem+json (ver ReportApiExceptionExtension) —
// {type, title, status, detail} (as vezes + "code"). "detail" carrega a mensagem real lancada
// pelo service (ex.: "Informe a descricao do template antes de publicar..."), nao um texto
// generico. Le o body de uma Response de erro e devolve essa mensagem, com fallback pro caller.
export async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string; title?: string; message?: string };
    return body.detail || body.message || body.title || fallback;
  } catch {
    return fallback;
  }
}

// SESSION_REVOKED (T2.4): o backend revoga a sessao de imediato (usuario desativado, senha trocada,
// vinculo removido) e responde 401 application/problem+json com `code` = "SESSION_REVOKED".
// Diferente do 401 de token vencido, refresh NAO resolve revogacao: o front limpa a sessao e vai
// ao login com esta mensagem, sem tentar renovar (e sem loop).
export const SESSION_REVOKED_CODE = "SESSION_REVOKED";
export const SESSION_REVOKED_MESSAGE = "Sua sessão foi encerrada. Entre novamente.";

// Le o campo `code` de um corpo problem+json (objeto ou texto JSON). Nunca lanca.
export function extractProblemCode(body: unknown): string | null {
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

export function isSessionRevokedBody(body: unknown): boolean {
  return extractProblemCode(body) === SESSION_REVOKED_CODE;
}

// Nao consome o corpo da resposta original (le um clone).
export async function isSessionRevokedResponse(response: Response): Promise<boolean> {
  if (response.status !== 401) {
    return false;
  }
  try {
    return isSessionRevokedBody(await response.clone().text());
  } catch {
    return false;
  }
}

// Estado de acesso da empresa (T5.6, plano 4.12). O `security` responde 403 problem+json com `code`
// estavel quando a empresa da sessao esta em modo somente leitura (escrita recusada) ou desligada.
// A sessao NAO morre em READ_ONLY (so' a escrita e' recusada); em DISABLED o BFF limpa a sessao e o
// front vai ao login com a mensagem abaixo.
export const COMPANY_READ_ONLY_CODE = "COMPANY_READ_ONLY";
export const COMPANY_DISABLED_CODE = "COMPANY_DISABLED";
export const COMPANY_READ_ONLY_MESSAGE =
  "Sua conta está em modo somente leitura. Faça o upgrade do plano para alterar dados.";
export const COMPANY_DISABLED_MESSAGE =
  "O acesso desta empresa foi desativado. Entre em contato com o responsável pela conta.";

export function isCompanyReadOnlyBody(body: unknown): boolean {
  return extractProblemCode(body) === COMPANY_READ_ONLY_CODE;
}

export function isCompanyDisabledBody(body: unknown): boolean {
  return extractProblemCode(body) === COMPANY_DISABLED_CODE;
}

// Nao consome o corpo da resposta original (le um clone). So' 403 carrega esses codigos.
export async function readCompanyAccessCode(
  response: Response,
): Promise<typeof COMPANY_READ_ONLY_CODE | typeof COMPANY_DISABLED_CODE | null> {
  if (response.status !== 403) {
    return null;
  }
  try {
    const code = extractProblemCode(await response.clone().text());
    return code === COMPANY_READ_ONLY_CODE || code === COMPANY_DISABLED_CODE ? code : null;
  } catch {
    return null;
  }
}

// Resposta 401 do `/api/auth/me` quando a empresa foi desligada: o BFF traduz o 403 COMPANY_DISABLED
// do backend em 401 + code, que o provider de acesso reconhece para ir ao login com a mensagem certa.
export async function isCompanyDisabledSessionResponse(response: Response): Promise<boolean> {
  if (response.status !== 401) {
    return false;
  }
  try {
    return isCompanyDisabledBody(await response.clone().text());
  } catch {
    return false;
  }
}

export async function isCompanyDisabledResponse(response: Response): Promise<boolean> {
  return (await readCompanyAccessCode(response)) === COMPANY_DISABLED_CODE;
}
