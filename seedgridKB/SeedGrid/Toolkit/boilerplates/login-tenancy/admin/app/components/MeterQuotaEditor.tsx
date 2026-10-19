"use client";

import { SgInputCurrency, SgInputNumber, SgStack, SgToggleSwitch } from "@seedgrid/fe-components";
import { useEffect, useState } from "react";

import type { MeterQuotaRow, UsageMeter } from "@/lib/usage-meters";

/** Contadores declarados pelo produto (GET /api/admin/billing/meters), carregados uma vez por tela. */
export function useUsageMeters(enabled = true) {
  const [meters, setMeters] = useState<UsageMeter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/admin/billing/meters", { cache: "no-store" });
        if (response.ok && !cancelled) {
          setMeters((await response.json()) as UsageMeter[]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { meters, loading };
}

type MeterQuotaEditorProps = {
  idPrefix: string;
  rows: MeterQuotaRow[];
  onChange: (rows: MeterQuotaRow[]) => void;
  /** `false` no trial: avaliacao gratuita nao cobra excedente. */
  allowOverage: boolean;
  enabled?: boolean;
};

/**
 * Uma linha por contador de uso: incluido no plano? franquia (unidades por ciclo) e, fora do trial, o preco
 * de cada unidade alem dela. Contador desligado = fora do plano (consumir da 402 METER_NOT_IN_PLAN).
 */
export function MeterQuotaEditor({ idPrefix, rows, onChange, allowOverage, enabled = true }: MeterQuotaEditorProps) {
  function update(meter: string, patch: Partial<MeterQuotaRow>) {
    onChange(rows.map((row) => (row.meter === meter ? { ...row, ...patch } : row)));
  }

  if (rows.length === 0) {
    return (
      <p style={{ fontSize: 13, margin: 0, opacity: 0.75 }}>
        O produto nao declara contadores de uso (billing/AppUsageMeters.java).
      </p>
    );
  }

  return (
    <SgStack gap={12}>
      {rows.map((row) => (
        <div
          key={row.meter}
          style={{ border: "1px solid rgba(127,127,127,0.25)", borderRadius: 12, padding: 12 }}
        >
          <SgStack gap={8}>
            <SgToggleSwitch
              id={`${idPrefix}-${row.meter}-included`}
              checked={row.included}
              enabled={enabled && row.declared}
              label={row.declared ? `${row.label} incluido no plano` : `${row.label} (contador nao declarado)`}
              onChange={(checked) => update(row.meter, { included: checked })}
            />
            {!row.declared ? (
              <p style={{ fontSize: 12, margin: 0, color: "#dc2626" }}>
                O produto nao declara mais este contador: ele sai do plano ao salvar.
              </p>
            ) : null}
            {row.included && row.declared ? (
              <>
                <SgInputNumber
                  id={`${idPrefix}-${row.meter}-units`}
                  label={`${row.label} por ciclo (franquia)`}
                  enabled={enabled}
                  decimals={0}
                  minValue={0}
                  inputProps={{ value: row.includedUnits }}
                  onChange={(includedUnits) => update(row.meter, { includedUnits })}
                />
                {allowOverage ? (
                  <div>
                    <SgInputCurrency
                      id={`${idPrefix}-${row.meter}-overage`}
                      label={`Excedente (por unidade de ${row.label})`}
                      currency="BRL"
                      decimals={2}
                      minValue={0}
                      enabled={enabled}
                      inputProps={{ value: row.overagePrice }}
                      onChange={(overagePrice) => update(row.meter, { overagePrice })}
                    />
                    <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#dc2626" }}>
                      * zero nao cobra excedente - esgotou a franquia, bloqueia
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
          </SgStack>
        </div>
      ))}
    </SgStack>
  );
}
