import type { CycleMeter } from "@/lib/ported/billingTypes";

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * Barra de consumo de UM contador de uso no ciclo: usado / incluido e, quando o plano cobra, o excedente.
 * Esgotada: ambar se o plano cobra excedente (continua funcionando, cobrando), vermelho se bloqueia.
 */
export function MeterUsageBar({ meter }: { readonly meter: CycleMeter }) {
  const percent =
    meter.includedUnits > 0 ? Math.min(100, Math.round((meter.usedUnits / meter.includedUnits) * 100)) : 100;
  const exhausted = meter.remainingUnits <= 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sg-text">{meter.label}</span>
        <span className="font-medium text-sg-text">
          {numberFormatter.format(meter.usedUnits)} / {numberFormatter.format(meter.includedUnits)}
          {meter.overageUnits > 0 ? ` (+${numberFormatter.format(meter.overageUnits)} excedente)` : ""}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-sg-border">
        <div
          className={`h-full ${exhausted ? (meter.overageCharged ? "bg-amber-500" : "bg-red-500") : "bg-sg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {exhausted ? (
        <span className="text-xs text-sg-muted">
          {meter.overageCharged
            ? "Franquia esgotada: o que passar e' cobrado como excedente."
            : "Franquia esgotada: aguarde o proximo ciclo ou troque de plano."}
        </span>
      ) : null}
    </div>
  );
}
