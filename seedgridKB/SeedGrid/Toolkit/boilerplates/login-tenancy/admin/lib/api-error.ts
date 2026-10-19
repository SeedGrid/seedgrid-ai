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
