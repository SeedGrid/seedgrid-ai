import { backendFetch } from "@/lib/backend-fetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { ApiClientError } from "@/lib/core";
import { isAdminLoginSuccess, type AdminLoginResponse } from "./admin-auth";
import {
  ADMIN_COMPANY_SELECTION_PENDING_COOKIE,
  ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "./admin-auth";
import { applyAdminSessionCookies } from "./admin-session-cookies";
import {
  ADMIN_CURRENT_COMPANY_COOKIE,
  parseCurrentCompany,
  serializeCurrentCompany,
} from "./company-access";
import {
  COMPANY_DISABLED_CODE,
  COMPANY_READ_ONLY_CODE,
  isSessionRevokedResponse,
  readCompanyAccessCode,
} from "./api-error";
import { apiBaseUrl } from "./seedgrid-app-api";

const apiCompanyId = process.env.SEEDGRID_APP_API_COMPANY_ID;

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(body || `API request failed: ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

export class ApiConnectionError extends Error {
  readonly path: string;

  constructor(path: string, cause?: unknown) {
    super(`Nao foi possivel conectar a API administrativa em ${path}.`);
    this.name = "ApiConnectionError";
    this.path = path;
    this.cause = cause;
  }
}

// Sessao expirada NAO pode virar sessao de servico. O fallback para o
// `SEEDGRID_APP_API_TOKEN` ficava aqui e disparava sempre que o cookie sumia (refresh
// falhou, logout, cookie limpo): em vez de 401, a chamada seguia autenticada como a
// identidade de maquina, e telas como /perfil respondiam com os dados de OUTRO usuario.
// Quem precisa de auth servico-a-servico usa o `apiFetch` de `seedgrid-report-api.ts`,
// que nao carrega sessao de usuario nenhuma.
export async function buildServerApiHeaders(
  headers?: HeadersInit,
): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  return {
    ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    ...(apiCompanyId ? { "X-Company-Id": apiCompanyId } : {}),
    ...headers,
  };
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export async function apiFetchServer<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await fetchWithAdminSession(path, options);

  if (!response.ok) {
    const text = await response.text();
    if (isInvalidAdminSessionResponse(response.status, text)) {
      await clearAdminAuthCookies();
    }
    throw new ApiRequestError(response.status, text);
  }

  return (await response.json()) as T;
}

// Variante canônica do httpclient para o FLUXO DE SEGURANÇA: reusa a sessão admin
// (cookie + refresh) do `fetchWithAdminSession`, mas em erro lança um `ApiClientError`
// (com `responseBody` parseado + `status`), do mesmo tipo que o `createApiClient`
// produz. Assim o route handler chama `problemResponse(error)` e o problem+json do
// report-api chega íntegro ao client, onde `extractApiErrorMessage` lê a mensagem.
export async function apiFetchSecurity<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await fetchWithAdminSession(path, options);

  if (!response.ok) {
    const text = await response.text();
    if (isInvalidAdminSessionResponse(response.status, text)) {
      await clearAdminAuthCookies();
    }
    throw new ApiClientError(
      `API request failed with status ${response.status}`,
      response.status,
      parseResponseBody(text),
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

// Mantém o problem+json como objeto (para `problemResponse`/`extractApiErrorMessage`);
// texto não-JSON volta como string crua (também aceita pelos extratores).
function parseResponseBody(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return text;
  }
}

// 204/205/304 nao podem carregar corpo: `new NextResponse("", { status: 204 })` lanca
// TypeError ("Invalid response status code 204") e o route handler devolve 500 mesmo com o
// report-api tendo respondido certo — era o caso do DELETE de template, que apagava o registro
// e ainda assim mostrava "falha ao excluir" na tela. Este helper repassa status/corpo do
// report-api pro browser respeitando essa regra.
// `bodyText` serve pros handlers que ja consumiram o corpo (ex.: pra logar o erro).
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

export async function passthroughResponse(
  response: Response,
  bodyText?: string,
): Promise<NextResponse> {
  if (NULL_BODY_STATUSES.has(response.status)) {
    return new NextResponse(null, { status: response.status });
  }

  const text = bodyText ?? (await response.text());

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
  });
}

// Erro do `apiFetchServer` (que LANCA em resposta nao-2xx) virando resposta JSON. Sem isso o
// erro escapa do route handler, o Next devolve a pagina de erro dele em HTML e o `.json()` do
// lado client estoura SyntaxError — o que transforma uma falha de LEITURA na mensagem de falha
// da acao que estava em curso (era o caso de "Falha ao salvar a spec" com a versao ja gravada).
export function upstreamProblemResponse(error: unknown): NextResponse {
  if (error instanceof ApiRequestError) {
    const body = error.body || JSON.stringify({ status: error.status, title: error.message });
    return new NextResponse(body, {
      status: error.status,
      headers: { "Content-Type": "application/problem+json" },
    });
  }

  const detail =
    error instanceof Error ? error.message : "Nao foi possivel consultar a API administrativa.";

  return NextResponse.json(
    { status: 502, title: "Bad Gateway", detail },
    { status: 502, headers: { "Content-Type": "application/problem+json" } },
  );
}

export function isInvalidAdminSessionResponse(status: number, body: string): boolean {
  // Apenas 401 = sessao invalida/expirada (limpa cookies e manda pro login). 403 NAO:
  // significa autenticado SEM permissao (sessao valida) — nesse caso a tela so deve
  // mostrar "Acesso negado", nunca deslogar. Tratar 403 como sessao invalida fazia
  // clicar num item proibido (ex.: Seguranca sem ROLE_READ) jogar o usuario pro /login.
  if (status === 401) {
    return true;
  }

  const normalized = body.toLocaleLowerCase("pt-BR");
  return (
    normalized.includes("usuario nao encontrado") ||
    normalized.includes("usuário não encontrado") ||
    normalized.includes("usu\u00e1rio n\u00e3o encontrado")
  );
}

export function isApiConnectionError(error: unknown): error is ApiConnectionError {
  return error instanceof ApiConnectionError;
}

export async function fetchWithAdminSession(
  path: string,
  options: FetchOptions = {},
): Promise<Response> {
  let response = await safeFetch(path, options);

  // Estado de acesso da empresa (403 com `code`, T5.6). Nao e' refresh nem "sem permissao":
  //  - COMPANY_DISABLED: a empresa foi desligada; limpa a sessao e repassa o 403 (o front vai ao login);
  //  - COMPANY_READ_ONLY: a sessao segue viva; so' registra o estado no cookie e repassa o 403.
  if (response.status === 403) {
    const accessCode = await readCompanyAccessCode(response);
    if (accessCode === COMPANY_DISABLED_CODE) {
      await clearAdminAuthCookies();
    } else if (accessCode === COMPANY_READ_ONLY_CODE) {
      await markCompanyReadOnly();
    }
    return response;
  }

  if (response.status !== 401) {
    return response;
  }

  // SESSION_REVOKED: refresh nao resolve revogacao. Limpa a sessao e devolve o 401 como esta
  // (sem renovar e sem repetir a chamada), para o front ir ao login com a mensagem certa.
  if (await isSessionRevokedResponse(response)) {
    await clearAdminAuthCookies();
    return response;
  }

  const refreshed = await refreshAdminSessionOnce();
  if (!refreshed) {
    return response;
  }

  response = await safeFetch(path, options);

  return response;
}

export async function clearAdminAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_PASSWORD_CHANGE_REQUIRED_COOKIE);
  cookieStore.delete(ADMIN_CURRENT_COMPANY_COOKIE);
  cookieStore.delete(ADMIN_COMPANY_SELECTION_PENDING_COOKIE);
}

// Registra no cookie da empresa corrente que ela esta em READ_ONLY (o 403 e' a prova), para um
// reload da pagina ja subir com a faixa. Fora de route handler o `cookies()` nao grava: ignora.
async function markCompanyReadOnly() {
  try {
    const cookieStore = await cookies();
    const current = parseCurrentCompany(cookieStore.get(ADMIN_CURRENT_COMPANY_COOKIE)?.value);
    if (!current || current.accessMode === "READ_ONLY") {
      return;
    }
    cookieStore.set(
      ADMIN_CURRENT_COMPANY_COOKIE,
      serializeCurrentCompany({ ...current, accessMode: "READ_ONLY", accessModeKnown: undefined }),
      { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    );
  } catch {
    // Contexto sem escrita de cookie (server component): o estado chega no proximo login/refresh.
  }
}

type RefreshOutcome =
  | { status: "ok"; session: Extract<AdminLoginResponse, { status: "OK" }> }
  | { status: "invalid" }
  | { status: "unreachable"; cause: unknown };

// Refreshes EM VOO, indexados pelo refresh token que os originou.
//
// Uma tela dispara varios recursos de uma vez; quando o access token vence, todos tomam 401
// juntos e todos tentariam renovar com o MESMO refresh token. O refresh token do ext-security
// rotaciona e tem deteccao de reuso: a segunda chamada era lida como reuso e revogava a familia
// inteira — o usuario era deslogado sem ter feito nada (menu vazio, 401 espalhado pela tela).
// Aqui a primeira chamada faz a rotacao e as concorrentes esperam o MESMO resultado.
//
// Cada requisicao ainda grava os cookies no proprio `cookies()` (o store e' por requisicao, e o
// retry precisa enxergar o access token novo). A entrada some no `finally`, entao o mapa nao
// acumula — e o valor so' vive enquanto a chamada dura.
const refreshInFlight = new Map<string, Promise<RefreshOutcome>>();

export async function refreshAdminSessionOnce(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    await clearAdminAuthCookies();
    return false;
  }

  let pending = refreshInFlight.get(refreshToken);
  if (!pending) {
    pending = rotateAdminSession(refreshToken).finally(() => {
      refreshInFlight.delete(refreshToken);
    });
    refreshInFlight.set(refreshToken, pending);
  }

  const outcome = await pending;

  if (outcome.status === "unreachable") {
    // API fora do ar (deploy, restart) NAO e' sessao invalida: manter os cookies deixa a
    // proxima tentativa reaproveitar a sessao. Quem trata a indisponibilidade e o chamador
    // (o /api/auth/me devolve 503 e o AdminAccessProvider tenta de novo).
    throw new ApiConnectionError(SecurityPaths.auth.refresh, outcome.cause);
  }

  if (outcome.status === "invalid") {
    await clearAdminAuthCookies();
    return false;
  }

  await applyAdminSessionCookies(outcome.session);

  return true;
}

// Nunca rejeita: o resultado e' compartilhado entre requisicoes concorrentes e cada uma decide o
// que fazer com os proprios cookies.
async function rotateAdminSession(refreshToken: string): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await backendFetch(`${apiBaseUrl}${SecurityPaths.auth.refresh}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch (cause) {
    return { status: "unreachable", cause };
  }

  if (!response.ok) {
    return { status: "invalid" };
  }

  let payload: AdminLoginResponse;
  try {
    payload = (await response.json()) as AdminLoginResponse;
  } catch {
    return { status: "invalid" };
  }

  if (!isAdminLoginSuccess(payload)) {
    return { status: "invalid" };
  }

  return { status: "ok", session: payload };
}

async function safeFetch(
  path: string,
  options: FetchOptions = {},
): Promise<Response> {
  try {
    return await backendFetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: await buildServerApiHeaders({
        "Content-Type": "application/json",
        ...options.headers,
      }),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiConnectionError(path, error);
  }
}
