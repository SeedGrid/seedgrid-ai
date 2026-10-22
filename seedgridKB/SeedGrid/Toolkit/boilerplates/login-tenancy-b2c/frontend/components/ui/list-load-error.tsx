"use client";

import { SgButton } from "@seedgrid/fe-components";

import { useLocale } from "@/components/providers/locale-provider";

/**
 * Falha ao CARREGAR uma listagem. Existe para que erro nunca mais seja confundido com vazio.
 *
 * As telas renderizavam `query.data?.items ?? []` e deixavam o `emptyMessage` do datatable falar
 * por elas. Como o cliente lança em qualquer não-2xx, `data` fica `undefined` e a tela dizia
 * "nenhum registro encontrado" — a mesma frase para "está tudo bem, não há nada" e para "não
 * consegui falar com o servidor". Um token vencido apagava a UI inteira sem uma única pista, e
 * foi isso que fez uma queda de conexão inexistente ser investigada por horas: a tela informava
 * zero conexões com a mesma confiança com que informaria zero de verdade.
 *
 * Erro que vira coleção vazia é o modo de falha mais caro que existe, porque some com a própria
 * evidência.
 */
export function ListLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const { t } = useLocale();

  if (!error) {
    return null;
  }

  const detalhe = error instanceof Error ? error.message : String(error);
  // 401 chega aqui só depois de o refresh ter falhado — o cliente já tentou renovar e repetir.
  // Então isto significa sessão realmente encerrada, e o texto tem de dizer o que fazer.
  const sessaoExpirada = /\b401\b|unauthorized|autentica|expirad/i.test(detalhe);

  return (
    // UNICA alteracao em relacao ao original do pulse-ui: as classes de cor.
    // La' era `rgb(var(--sg-danger))`, um alias que existe no tema do Pulse e NAO existe aqui —
    // a caixa sairia com borda invisivel e texto preto, ou seja, o erro deixaria de parecer erro,
    // que e' exatamente o que este componente existe para impedir. `sg-error-*` sao os tokens que
    // o `@seedgrid/fe-theme` injeta neste app (ver `tailwind.config.ts`, `sgPalette("error")`) —
    // os mesmos que o `AuthCard` copiado do report-client ja' usa.
    <div
      role="alert"
      className="mb-3 rounded-sg border border-sg-error-500 bg-sg-error-50 px-4 py-3"
    >
      <p className="text-sm font-medium text-sg-error-700">
        {sessaoExpirada
          ? t("common.error.sessionExpired", "Sua sessao expirou. Entre novamente para continuar.")
          : t("common.error.loadFailed", "Nao foi possivel carregar os dados.")}
      </p>
      {!sessaoExpirada && detalhe ? (
        <p className="mt-1 break-words text-xs opacity-80">{detalhe}</p>
      ) : null}
      {onRetry ? (
        <div className="mt-3">
          <SgButton appearance="outline" onClick={onRetry}>
            {t("common.retry", "Tentar de novo")}
          </SgButton>
        </div>
      ) : null}
    </div>
  );
}
