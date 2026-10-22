import { ApiClientError } from "./core";
import { extractProblemCode, SESSION_REVOKED_CODE } from "./api-error";
import { QUERY_PROXY_PREFIX, QUERY_REFRESH_PATH } from "./query-paths";

// Consulta com corpo pelo metodo HTTP QUERY (ADR 28): `query<T>("me/reports/search", { ... })`.
//
//   browser -> QUERY /api/q/<caminho> -> proxy.ts (rewrite + Authorization do cookie) -> backend
//
// O QUERY e' metodo SEGURO: passa mesmo com a empresa em modo somente leitura. Use no lugar de um
// POST que so' consulta. Quem grava/consome cota continua POST (pelas rotas `/api/**` do BFF).
//
// Fluxo do 401: o proxy nao renova token. Em 401 que NAO seja sessao revogada, o helper chama
// `POST /api/auth/refresh` (BFF; rotaciona o refresh token e regrava os cookies) e REPETE A
// CONSULTA UMA UNICA VEZ. Se a renovacao falhar, ou o 2o envio tambem der erro, lanca
// `ApiClientError` com `status` e `responseBody` (problem+json) do ultimo envio.
//
// O `ApiClientError` pode ser lido com os parsers de `lib/api-error.ts`:
//   isCompanyReadOnlyBody / isCompanyDisabledBody / isSessionRevokedBody (sobre `error.responseBody`)
// e a mensagem de tela com `extractApiErrorMessage(error)` (de `lib/core`).

export type QueryOptions = {
  signal?: AbortSignal;
  /** Cabecalhos extras. `Authorization`, `X-Company-Id` e cookies sao descartados pelo proxy. */
  headers?: Record<string, string>;
};

// 401 em que renovar nao adianta: a sessao foi revogada (T2.4) ou a troca de senha esta pendente
// (o backend recusa tudo ate trocar). Repetir so' repetiria o erro.
const NO_RENEW_CODES: ReadonlySet<string> = new Set([SESSION_REVOKED_CODE, "PASSWORD_CHANGE_REQUIRED"]);

// Renovacao em voo: varias consultas que tomam 401 juntas esperam a MESMA chamada (o servidor
// tambem deduplica por refresh token; aqui poupamos as idas e voltas).
let renewing: Promise<boolean> | null = null;

function renewSession(): Promise<boolean> {
  if (!renewing) {
    renewing = fetch(QUERY_REFRESH_PATH, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        renewing = null;
      });
  }
  return renewing;
}

function send(path: string, body: unknown, options: QueryOptions): Promise<Response> {
  const hasBody = body !== undefined;
  return fetch(QUERY_PROXY_PREFIX + path.replace(/^\/+/, ""), {
    method: "QUERY",
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal,
  });
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * @param path  caminho do backend SEM o prefixo `/api/q/` (ex.: `"audit-logs/search"`; barra inicial
 *              e' ignorada). Pode levar query string.
 * @param body  corpo da consulta; serializado como JSON. Omitido = QUERY sem corpo.
 */
export async function query<T = unknown>(
  path: string,
  body?: unknown,
  options: QueryOptions = {},
): Promise<T> {
  let response = await send(path, body, options);
  let responseBody: unknown;

  if (response.status === 401) {
    responseBody = await readBody(response);
    const code = extractProblemCode(responseBody);
    if (!(code && NO_RENEW_CODES.has(code)) && (await renewSession())) {
      response = await send(path, body, options);
      responseBody = undefined;
    }
  }

  if (!response.ok) {
    throw new ApiClientError(
      `API request failed with status ${response.status}`,
      response.status,
      responseBody === undefined ? await readBody(response) : responseBody,
    );
  }

  if (response.status === 204) {
    return null as T;
  }
  return (await response.json()) as T;
}
