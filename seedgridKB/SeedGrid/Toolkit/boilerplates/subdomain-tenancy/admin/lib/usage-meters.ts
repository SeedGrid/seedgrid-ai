/**
 * Contadores de uso: o que o produto cobra por uso (requisicoes, MB armazenados...). O PRODUTO declara os
 * contadores no backend (billing/AppUsageMeters.java); o billing guarda, por plano e por contador, a
 * franquia e o preco do excedente. Estas telas so' mostram e editam isso, uma linha por contador.
 * Guia: docs/contadores-de-uso.md.
 */

import { formatCurrency, parseDecimalInput } from "./format";

/** Contador declarado pelo produto (GET /admin/billing/meters). */
export type UsageMeter = {
  code: string;
  label: string;
};

/** Franquia e excedente de um contador no plano (term). */
export type PlanTermMeter = {
  meter: string;
  label: string;
  /** `false` = o produto nao declara mais o contador: historico, nao aceita consumo. */
  declared: boolean;
  includedUnits: number;
  overagePrice: number | string;
  overagePublished: boolean;
};

/** Saldo de um contador no ciclo. */
export type CycleMeter = {
  meter: string;
  label: string;
  includedUnits: number;
  usedUnits: number;
  overageUnits: number;
  remainingUnits: number;
  /** O plano cobra excedente deste contador (esgotar nao bloqueia). */
  overageCharged: boolean;
};

/** Uma linha do editor de contadores (valores como texto, como os inputs devolvem). */
export type MeterQuotaRow = {
  meter: string;
  label: string;
  declared: boolean;
  included: boolean;
  includedUnits: string;
  overagePrice: string;
};

/** Corpo de um contador no POST/PATCH do term ou do trial. */
export type MeterQuotaPayload = {
  meter: string;
  includedUnits: number;
  overagePrice: number;
};

/** Uma linha por contador declarado, preenchida com o que o plano ja tem; o que sobrou e' historico. */
export function toMeterRows(declared: UsageMeter[], termMeters: PlanTermMeter[] | null | undefined): MeterQuotaRow[] {
  const byCode = new Map((termMeters ?? []).map((meter) => [meter.meter, meter]));
  const rows: MeterQuotaRow[] = declared.map((meter) => {
    const current = byCode.get(meter.code);
    byCode.delete(meter.code);
    return {
      meter: meter.code,
      label: meter.label,
      declared: true,
      included: current != null,
      includedUnits: current ? String(current.includedUnits) : "",
      overagePrice: current ? String(current.overagePrice) : "",
    };
  });
  for (const orphan of byCode.values()) {
    rows.push({
      meter: orphan.meter,
      label: orphan.label,
      declared: false,
      included: true,
      includedUnits: String(orphan.includedUnits),
      overagePrice: String(orphan.overagePrice),
    });
  }
  return rows;
}

/**
 * Linhas -> corpo da API. So' entram os contadores marcados E declarados (um contador que o produto nao
 * declara mais seria recusado com 400). Devolve a mensagem de erro, se houver.
 */
export function toMeterPayload(
  rows: MeterQuotaRow[],
  allowOverage: boolean,
): { meters: MeterQuotaPayload[]; error: string | null } {
  const meters: MeterQuotaPayload[] = [];
  for (const row of rows) {
    if (!row.included || !row.declared) {
      continue;
    }
    const includedUnits = Number.parseInt(row.includedUnits, 10);
    if (!Number.isFinite(includedUnits) || includedUnits < 0) {
      return { meters, error: `Informe a franquia de ${row.label} (0 ou mais).` };
    }
    const overagePrice = !allowOverage || row.overagePrice.trim() === "" ? 0 : parseDecimalInput(row.overagePrice);
    if (overagePrice == null || overagePrice < 0) {
      return { meters, error: `Informe um preco de excedente valido para ${row.label}.` };
    }
    meters.push({ meter: row.meter, includedUnits, overagePrice });
  }
  return { meters, error: null };
}

/** "Requisicoes: 1.000 + R$ 0,10 · MB armazenados: 500" — para as colunas dos grids. */
export function formatTermMeters(meters: PlanTermMeter[] | null | undefined): string {
  if (!meters || meters.length === 0) {
    return "-";
  }
  return meters
    .map((meter) => {
      const overage = Number(meter.overagePrice) > 0 ? ` + ${formatCurrency(meter.overagePrice)}` : "";
      return `${meter.label}: ${meter.includedUnits.toLocaleString("pt-BR")}${overage}`;
    })
    .join(" · ");
}

/** "Requisicoes 30/100 · MB armazenados 12/50 (+3)" — consumo do ciclo. */
export function formatCycleMeters(meters: CycleMeter[] | null | undefined): string {
  if (!meters || meters.length === 0) {
    return "-";
  }
  return meters
    .map((meter) => {
      const overage = meter.overageUnits > 0 ? ` (+${meter.overageUnits.toLocaleString("pt-BR")})` : "";
      return `${meter.label} ${meter.usedUnits.toLocaleString("pt-BR")}/${meter.includedUnits.toLocaleString("pt-BR")}${overage}`;
    })
    .join(" · ");
}

/** Total de unidades excedentes do ciclo, somando todos os contadores. */
export function totalOverageUnits(meters: CycleMeter[] | null | undefined): number {
  return (meters ?? []).reduce((sum, meter) => sum + meter.overageUnits, 0);
}
