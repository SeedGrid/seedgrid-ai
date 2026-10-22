"use client";

// COPIADO, LITERAL, de seedgrid-report-client/src/components/Carregando.tsx.
// Sem alteracao nenhuma alem do "use client" (exigencia do App Router).

/**
 * Indicador de carregamento com movimento.
 *
 * Existe porque um "Carregando..." em texto pequeno e apagado não convence: o usuário olhava a
 * tela parada e concluía que nada estava acontecendo. O que comunica trabalho em curso é o
 * MOVIMENTO, não a palavra — por isso o disco girando vem primeiro e é ele que carrega o
 * recado; o texto só nomeia o que está acontecendo.
 */
export function Carregando({
  texto = "Carregando...",
  className = "",
}: {
  texto?: string;
  className?: string;
}) {
  return (
    // `role="status"` + `aria-live`: leitor de tela anuncia sozinho quando isto aparece, sem
    // precisar que o foco passe por aqui.
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 text-sm text-sg-muted ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-sg-border border-t-sg-primary"
      />
      <span>{texto}</span>
    </div>
  );
}
