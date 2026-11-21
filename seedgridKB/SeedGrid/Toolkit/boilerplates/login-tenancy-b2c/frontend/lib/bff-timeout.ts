// Tempo limite das chamadas do BFF ao backend (P192.F2.T1). O fe-core ja limita as chamadas do NAVEGADOR (createApiClient,
// 60 s); aqui e' o lado servidor: sem isto um backend pendurado prende a requisicao do BFF para sempre. So vale quando a
// rota PEDE (`timeoutMs` nas opcoes do apiFetchSecurity): download de ZIP em stream NAO leva limite (cortaria o arquivo).

export const REQUEST_TIMEOUT_CODE = "REQUEST_TIMEOUT";

/** Operacoes de export (criar, listar, status, excluir): respondem logo; 30 s sem resposta e' backend pendurado. */
export const EXPORT_BFF_TIMEOUT_MS = 30_000;

/** A mesma mensagem fixa do ApiTimeoutError do fe-core (o BFF e o client dizem a mesma coisa ao usuario). */
export function timeoutMessage(timeoutMs: number): string {
  const seconds = Math.round(timeoutMs / 1000);
  const span =
    seconds >= 60 && seconds % 60 === 0
      ? `${seconds / 60} ${seconds === 60 ? "minuto" : "minutos"}`
      : `${seconds} ${seconds === 1 ? "segundo" : "segundos"}`;
  return `A operação demorou mais de ${span} e foi interrompida. Confira se ela foi concluída antes de repetir.`;
}

/** O backend nao respondeu dentro de `timeoutMs`. Vira 504 (problem+json com code REQUEST_TIMEOUT) no BFF. */
export class UpstreamTimeoutError extends Error {
  readonly code = REQUEST_TIMEOUT_CODE;
  readonly status = 504;
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(timeoutMessage(timeoutMs));
    this.name = "UpstreamTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/** Signal que aborta apos `timeoutMs` e tambem quando o `signal` do chamador abortar. Sem limite (0/undefined): o do chamador. */
export function signalWithTimeout(
  signal: AbortSignal | null | undefined,
  timeoutMs: number | undefined,
): AbortSignal | undefined {
  if (!timeoutMs || timeoutMs <= 0) {
    return signal ?? undefined;
  }
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

/** O fetch abortou pelo `AbortSignal.timeout` (e nao por falha de conexao nem pelo chamador). */
export function isTimeoutAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "TimeoutError";
}
