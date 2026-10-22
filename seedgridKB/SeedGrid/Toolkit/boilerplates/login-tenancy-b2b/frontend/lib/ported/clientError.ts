// COPIADO, LITERAL, de seedgrid-report-client/src/clientError.ts.
//
// E' o normalizador de erro que as telas portadas (SignupForm, Assinatura) usam via `readError`.
// Nao foi reescrito: as regras aqui (traduzir "Refresh token invalido ou reutilizado" para uma
// frase de gente, ler `violations`/`detail`/`title` do problem+json, reconhecer o restart do
// Quarkus em dev) sao exatamente as que essas telas esperam nos `catch`.
//
// O QUE E' INERTE NESTE APP: `onSessionExpired`/`notifySessionExpired`. No report-client o token
// vive no processo Rust e cada tela precisava avisar o dono da sessao. Aqui a sessao e' cookie
// httpOnly e quem trata o 401 e' o BFF (`lib/seedgrid-app-api-server.ts`) + o
// `AdminAccessProvider`. As funcoes ficam porque `readError` as usa no mesmo arquivo e porque
// apagar metade de um arquivo testado e' justamente o que este boilerplate nao faz; ninguem as
// assina.

import { companySelectionErrorMessage } from "../downgrade-company-selection";

/**
 * Normalizacao de erro do client + deteccao de "a sessao morreu".
 *
 * Fonte unica: `useClientSession` mantinha uma COPIA deste `readError` (que era a versao de fato
 * usada pelas telas, porque ninguem importava daqui). Duas copias divergiram — regras novas eram
 * escritas so' numa delas. Agora a logica vive aqui e o hook apenas reexporta.
 */

/**
 * Unica mensagem de sessao expirada mostrada ao usuario final.
 *
 * O backend responde coisas como "Refresh token invalido ou reutilizado": jargao de servidor que
 * nao diz nada pra quem esta' na frente da tela. Toda mensagem de sessao morta e' traduzida para
 * esta, em qualquer caminho que ainda chegue a exibir texto.
 */
export const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Entre novamente.";

/**
 * Sessao REVOGADA pelo servidor (T2.4): o backend responde 401 problem+json com
 * `code` = "SESSION_REVOKED". Refresh nao resolve; o usuario so' precisa entrar de novo.
 */
export const SESSION_REVOKED_CODE = "SESSION_REVOKED";
export const SESSION_REVOKED_MESSAGE = "Sua sessão foi encerrada. Entre novamente.";

/**
 * Estado de acesso da empresa (T5.6): 403 problem+json com `code` COMPANY_READ_ONLY (escrita recusada;
 * a sessao segue viva) ou COMPANY_DISABLED (empresa desligada: a sessao morreu, vai ao login).
 */
export const COMPANY_READ_ONLY_CODE = "COMPANY_READ_ONLY";
export const COMPANY_DISABLED_CODE = "COMPANY_DISABLED";
export const COMPANY_READ_ONLY_MESSAGE =
  "A empresa está em modo somente leitura. Faça o upgrade do plano para alterar dados.";
export const COMPANY_DISABLED_MESSAGE =
  "O acesso desta empresa foi desativado. Entre em contato com o responsável pela conta.";

/**
 * Trechos que identificam uma sessao IRRECUPERAVEL (nao adianta tentar de novo: so' logando).
 *
 * Comparados sem acento e em minusculas (ver `foldForMatch`), entao basta a forma ASCII.
 * Deliberadamente curta: um falso positivo aqui desloga alguem no meio do trabalho. Em especial,
 * "invalid or expired session" (tempToken do 2FA) NAO entra — quem trata aquilo e' o AuthScreen,
 * que ja' esta' no fluxo de login.
 */
const SESSION_EXPIRED_HINTS = [
  // Vem do backend quando o refresh token expirou ou foi revogado por reuse detection.
  "refresh token",
  // Mensagem amigavel do Rust (e a nossa propria, ja' normalizada) — a deteccao e' idempotente.
  "sessao expirou",
  "sessao foi encerrada",
  // Empresa desligada (COMPANY_DISABLED): a sessao nao volta, so' trocando de empresa/entrando de novo.
  "acesso desta empresa foi desativado",
  "session expired",
  // O state local ficou sem access token: nao ha sessao pra recuperar.
  "sessao autenticada nao encontrada",
];

/** Minusculas e sem acento, para comparar mensagem do servidor com os trechos acima. */
function foldForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** A mensagem (ja' normalizada por `readError`) indica sessao morta? */
export function isSessionExpiredMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const folded = foldForMatch(message);
  return SESSION_EXPIRED_HINTS.some((hint) => folded.includes(hint));
}

/** O erro cru (de um comando Tauri, do fetch, etc.) e' de sessao morta? */
export function isSessionExpiredError(error: unknown): boolean {
  return isSessionExpiredMessage(readError(error));
}

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

/**
 * Assina o sinal de "a sessao morreu". Quem escuta e' o dono do estado de sessao
 * (`useClientSession`), que limpa tudo e devolve o app pro login.
 *
 * Existe porque o erro pode nascer em QUALQUER tela (cada uma pega o erro no seu proprio
 * `catch` e pinta o proprio banner). Sem um sinal global, cada tela precisaria saber deslogar —
 * era exatamente por isso que o usuario ficava preso na tela com a faixa vermelha.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

/** Dispara o sinal. Um listener que estoure nao pode impedir os demais de rodar. */
export function notifySessionExpired(): void {
  for (const listener of [...sessionExpiredListeners]) {
    try {
      listener();
    } catch {
      // Um listener quebrado nao pode engolir o deslogue dos outros.
    }
  }
}

export function readError(error: unknown): string {
  const normalizeInfraMessage = (message: string): string => {
    const normalized = message.trim();
    // Sessao morta vem antes de tudo: nao interessa qual endpoint reclamou, o usuario so'
    // precisa saber que tem de entrar de novo.
    if (foldForMatch(normalized).includes("sessao foi encerrada")) {
      return SESSION_REVOKED_MESSAGE;
    }
    if (foldForMatch(normalized).includes("acesso desta empresa foi desativado")) {
      return COMPANY_DISABLED_MESSAGE;
    }
    if (isSessionExpiredMessage(normalized)) {
      return SESSION_EXPIRED_MESSAGE;
    }
    if (normalized.includes("Active subscription not found")) {
      return "Sua conta ainda nao possui um plano ativo de solicitacoes. Vincule uma assinatura antes de usar o chat de IA.";
    }
    if (normalized.includes("Invalid 2FA code")) {
      return "Cod. invalido ou ja utilizado.";
    }
    if (
      normalized.includes("Error restarting Quarkus") ||
      normalized.includes("ArC container not initialized") ||
      normalized.includes("JWTAuthContextInfoProvider.alwaysCheckAuthorization")
    ) {
      return "O backend Quarkus estava reiniciando em modo de desenvolvimento. Aguarde o restart terminar e tente novamente.";
    }
    return normalized;
  };

  const fromProblem = (value: unknown): string | null => {
    if (typeof value !== "object" || value === null) return null;
    const obj = value as Record<string, unknown>;
    if (obj.code === SESSION_REVOKED_CODE) return SESSION_REVOKED_MESSAGE;
    if (obj.code === COMPANY_DISABLED_CODE) return COMPANY_DISABLED_MESSAGE;
    if (obj.code === COMPANY_READ_ONLY_CODE) return COMPANY_READ_ONLY_MESSAGE;
    const selectionMessage = companySelectionErrorMessage(obj.code);
    if (selectionMessage) return selectionMessage;
    const violations = obj.violations;
    if (Array.isArray(violations) && violations.length > 0) {
      const messages = violations
        .map((v) => (typeof v === "object" && v !== null ? (v as Record<string, unknown>).message : null))
        .filter((m): m is string => typeof m === "string");
      if (messages.length > 0) return messages.join("\n");
    }
    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail;
    if (typeof obj.details === "string" && obj.details.trim()) return obj.details;
    if (typeof obj.title === "string" && obj.title.trim()) return obj.title;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    return null;
  };

  if (typeof error === "string") {
    // O Rust pode ter repassado o corpo problem+json como string — tenta parsear.
    const trimmed = error.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = fromProblem(JSON.parse(trimmed));
        if (parsed) return normalizeInfraMessage(parsed);
      } catch {
        // não era JSON — usa a string como está
      }
    }
    return normalizeInfraMessage(error);
  }
  if (error instanceof Error) {
    const parsed = fromProblem(error);
    return normalizeInfraMessage(parsed ?? error.message);
  }
  const parsed = fromProblem(error);
  if (parsed) return normalizeInfraMessage(parsed);
  if (typeof error === "object" && error !== null) return normalizeInfraMessage(JSON.stringify(error));
  return "Erro inesperado.";
}

/**
 * COPIADO de seedgrid-report-client/src/useClientSession.ts (linhas 95-113).
 *
 * Mora aqui, e nao la', porque o `useClientSession` inteiro e' do modelo Tauri (estado de sessao
 * no Rust) e nao atravessa para o BFF. A funcao em si e' independente disso: so' olha o texto.
 */
// Erro TRANSITORIO de conexao (backend fora/reiniciando): a tela mostra "Reconectando..." e tenta
// de novo, em vez de um banner vermelho (que ali seria mentira — nao ha nada errado com o dado).
const CONNECTION_ERROR_HINTS = [
  "conectar ao servidor",
  "servidor esta indisponivel",
  "servidor está indisponível",
  "estava reiniciando",
  "error sending request",
  "eof while parsing",
  // Acrescentado no port: no BFF a indisponibilidade chega como o 502 do `problemResponse`.
  "bad gateway",
];

export function isConnectionError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return CONNECTION_ERROR_HINTS.some((hint) => lower.includes(hint));
}
