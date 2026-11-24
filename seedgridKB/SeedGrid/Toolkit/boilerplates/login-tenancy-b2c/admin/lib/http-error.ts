// Mensagem legivel para resposta de erro nas telas que gravam (P180.F3.T2). Antes o admin fazia
// `setStatusMessage(await response.text())` e, quando o proxy (Cloudflare 524, Traefik 502/504) ou o Next
// devolvia uma PAGINA HTML, o HTML cru aparecia na tela. Aqui: status de proxy vira texto fixo, HTML nunca
// e' mostrado, problem+json vira o `detail`, e texto curto passa como veio.

export const SLOW_SERVER_MESSAGE =
  "O servidor demorou demais para responder. Tente de novo em instantes; se persistir, avise o suporte.";
/** 502/503/504: o servidor de origem nao respondeu (proxy/Cloudflare devolve uma pagina HTML; ela nunca e' mostrada). */
export const SERVER_DOWN_MESSAGE = "O servidor não respondeu. Tente novamente em instantes.";
export const REQUEST_TIMEOUT_MS = 60_000;
export const CLIENT_TIMEOUT_MESSAGE =
  "A operação demorou mais de 1 minuto e foi interrompida. Confira se ela foi concluída antes de repetir.";

const SERVER_DOWN_STATUSES = new Set([502, 503, 504]);
const PROXY_TIMEOUT_STATUSES = new Set([502, 503, 504, 520, 522, 524]);
const MAX_PLAIN_LENGTH = 300;

function looksLikeHtml(contentType: string | null | undefined, body: string): boolean {
  if ((contentType ?? "").toLowerCase().includes("text/html")) {
    return true;
  }
  return /^\s*(<!doctype html|<html|<head|<body|<\?xml)/i.test(body);
}

/** Pura: decide a mensagem a partir de status, Content-Type e corpo ja lido. */
export function friendlyHttpError(
  status: number,
  contentType: string | null | undefined,
  body: string,
  fallback: string,
): string {
  if (PROXY_TIMEOUT_STATUSES.has(status) && (looksLikeHtml(contentType, body) || !body.trim())) {
    return `${SERVER_DOWN_STATUSES.has(status) ? SERVER_DOWN_MESSAGE : SLOW_SERVER_MESSAGE} (HTTP ${status})`;
  }
  if (looksLikeHtml(contentType, body)) {
    return `${fallback} (o servidor respondeu uma página de erro, HTTP ${status}).`;
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return fallback;
  }
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { detail?: unknown; message?: unknown; title?: unknown };
      for (const value of [parsed.detail, parsed.message, parsed.title]) {
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }
      return fallback;
    } catch {
      return fallback;
    }
  }
  return trimmed.length > MAX_PLAIN_LENGTH ? `${trimmed.slice(0, MAX_PLAIN_LENGTH)}…` : trimmed;
}

/** Le o corpo de uma resposta de erro e devolve a mensagem legivel. Nunca lanca. */
export async function readHttpError(response: Response, fallback: string): Promise<string> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    // corpo ilegivel: so' o status vale
  }
  return friendlyHttpError(response.status, response.headers.get("Content-Type"), body, fallback);
}

/** fetch com tempo maximo; no estouro lanca `Error` com `CLIENT_TIMEOUT_MESSAGE`. */
export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(CLIENT_TIMEOUT_MESSAGE);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Corpo de erro para quem repassa o texto cru a outro tratador (ex.: `readError` le o problem+json): JSON passa
 * como veio; pagina HTML (Cloudflare/nginx) ou corpo vazio de 5xx de proxy vira a mensagem curta.
 */
export function errorBodyForClient(status: number, contentType: string | null | undefined, body: string): string {
  const trimmed = body.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return body;
  }
  if (looksLikeHtml(contentType, body) || (PROXY_TIMEOUT_STATUSES.has(status) && !trimmed)) {
    return friendlyHttpError(status, contentType, body, `HTTP ${status}`);
  }
  return body || `HTTP ${status}`;
}

/** Texto de detalhe de um erro de carga para a tela: nunca HTML cru; problem+json vira o `detail`. */
export function loadErrorDetail(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : String(error ?? "");
  if (!raw.trim()) {
    return "";
  }
  if (looksLikeHtml(null, raw)) {
    return SERVER_DOWN_MESSAGE;
  }
  return friendlyHttpError(200, null, raw, "");
}
