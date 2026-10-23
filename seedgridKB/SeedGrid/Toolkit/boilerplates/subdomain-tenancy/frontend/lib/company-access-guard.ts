// Guarda global de fetch (T5.6): os clientes de API do front (`adminProxyClient`, `portedApi`, fetch
// direto das telas) falam todos com o BFF same-origin (`/api/**`). Em vez de ensinar cada um a
// reconhecer o 403 de estado de acesso, UM wrapper do `fetch` olha as respostas e avisa a casca:
//   - COMPANY_READ_ONLY -> a empresa virou somente leitura (faixa + botoes de escrita somem);
//   - COMPANY_DISABLED  -> a sessao caiu (o BFF ja limpou os cookies): vai ao login com a mensagem.
// O corpo original nao e' consumido (le um clone), entao quem chamou segue lendo a resposta.
import { readCompanyAccessCode } from "./api-error";

export type CompanyAccessHandlers = {
  onReadOnly: () => void;
  onDisabled: () => void;
};

type FetchHost = { fetch: typeof fetch };

const INSTALLED = Symbol.for("seedgrid.companyAccessGuard");

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.pathname;
  return input.url;
}

/** So' as chamadas ao BFF (`/api/...`, relativas ou da mesma origem) entram na guarda. */
export function isBffUrl(url: string): boolean {
  if (url.startsWith("/api/")) return true;
  try {
    return new URL(url).pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

/**
 * Instala a guarda uma vez por host (idempotente). Devolve a funcao que desfaz. `handlers` pode
 * ser trocado depois por uma nova chamada: a mais recente vale.
 */
export function installCompanyAccessFetchGuard(
  host: FetchHost,
  handlers: CompanyAccessHandlers,
): () => void {
  const tagged = host as FetchHost & { [INSTALLED]?: { original: typeof fetch; current: CompanyAccessHandlers } };
  if (tagged[INSTALLED]) {
    tagged[INSTALLED].current = handlers;
    return () => uninstall(tagged);
  }

  const original = host.fetch.bind(host);
  const state = { original: host.fetch, current: handlers };
  tagged[INSTALLED] = state;

  host.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await original(input, init);
    if (response.status === 403 && isBffUrl(urlOf(input))) {
      const code = await readCompanyAccessCode(response);
      if (code === "COMPANY_READ_ONLY") state.current.onReadOnly();
      else if (code === "COMPANY_DISABLED") state.current.onDisabled();
    }
    return response;
  }) as typeof fetch;

  return () => uninstall(tagged);
}

function uninstall(
  tagged: FetchHost & { [INSTALLED]?: { original: typeof fetch; current: CompanyAccessHandlers } },
) {
  const state = tagged[INSTALLED];
  if (!state) return;
  tagged.fetch = state.original;
  delete tagged[INSTALLED];
}
