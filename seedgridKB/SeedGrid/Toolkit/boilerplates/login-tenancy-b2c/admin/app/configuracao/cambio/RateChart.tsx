"use client";

import { SgCard, SgSkeleton } from "@seedgrid/fe-components";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SeriesPoint = { date: string; rate: number };

type SeriesResponse = {
  code: string;
  name?: string;
  days: number;
  points: SeriesPoint[];
};

/**
 * Faixas oferecidas. Em dias CORRIDOS (nao pregoes) porque e' assim que a pessoa pensa o periodo —
 * "1 mes" e' o mes, nao 21 dias uteis; quantos pontos existem la dentro e' problema da fonte.
 */
const RANGES = [
  { label: "5D", days: 5 },
  { label: "15D", days: 15 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "1A", days: 365 },
  { label: "5A", days: 1825 },
] as const;

/** Rotulo do eixo X: em periodo curto o dia importa; em periodo longo, so' mes/ano cabe. */
function formatAxisDate(iso: string, days: number): string {
  const [year, month, day] = iso.split("-");
  if (days <= 30) return `${day}/${month}`;
  if (days <= 365) return `${month}/${year.slice(2)}`;
  return `${month}/${year.slice(2)}`;
}

/** "2026-08-14" -> "14/08/2026". */
function formatIsoDate(iso: string): string {
  return iso.split("-").reverse().join("/");
}

function formatRate(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

/**
 * Serie historica da moeda seguindo o filtro da tela.
 *
 * <p>Os pontos vem do BANCO (o que o sistema realmente aplicou pra converter custo em cobranca);
 * a primeira abertura de uma faixa maior importa o que falta da fonte — por isso a troca de faixa
 * pode demorar alguns segundos uma unica vez.</p>
 */
export function RateChart({ currencyCode }: { readonly currencyCode: string }) {
  const [days, setDays] = useState<number>(365);
  const [data, setData] = useState<SeriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const query = new URLSearchParams({ days: String(days) });
        if (currencyCode) query.set("currencyCode", currencyCode);
        const response = await fetch(`/api/admin/currency-exchange-rates/series?${query}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const json = (await response.json()) as SeriesResponse;
        // Resposta de uma faixa que o usuario ja trocou nao pode sobrescrever a atual: import de
        // 5 anos demora mais que o de 5 dias e chegaria depois, pintando o grafico errado.
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar o historico.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currencyCode, days]);

  const points = useMemo(
    () => (data?.points ?? []).map((point) => ({ ...point, rate: Number(point.rate) })),
    [data],
  );

  const [min, max] = useMemo(() => {
    if (points.length === 0) return [0, 1];
    const values = points.map((point) => point.rate);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    // Uma folga de 8% da amplitude evita a curva encostar nas bordas; amplitude zero (um unico
    // ponto, ou serie constante) usaria 0 e o grafico viraria uma linha colada no eixo.
    const padding = (hi - lo || hi * 0.01 || 0.01) * 0.08;
    return [lo - padding, hi + padding];
  }, [points]);

  const last = points.at(-1);

  return (
    <SgCard cardStyle="outlined" title="Histórico" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        {last ? (
          <>
            <strong style={{ fontSize: 24 }}>{formatRate(last.rate)}</strong>
            <span style={{ opacity: 0.7, fontSize: 13 }}>
              {data?.code} · último ponto em {formatIsoDate(last.date)}
            </span>
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 4, margin: "12px 0", flexWrap: "wrap" }}>
        {RANGES.map((range) => {
          const active = range.days === days;
          return (
            <button
              key={range.label}
              type="button"
              onClick={() => setDays(range.days)}
              aria-pressed={active}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                border: "1px solid var(--sg-border, #d4d4d8)",
                background: active ? "var(--sg-primary, #16a34a)" : "transparent",
                color: active ? "#fff" : "inherit",
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SgSkeleton height={260} />
      ) : error ? (
        <p style={{ fontSize: 13, opacity: 0.8 }}>{error}</p>
      ) : points.length === 0 ? (
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Sem cotações neste período. O robô grava uma por dia; períodos longos são importados da
          fonte na primeira abertura.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sg-primary, #16a34a)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--sg-primary, #16a34a)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatAxisDate(value, days)}
              minTickGap={40}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[min, max]}
              tickFormatter={(value: number) => value.toFixed(2)}
              width={52}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              // Os tipos do recharts entregam ReactNode/ValueType (o mesmo Tooltip serve a
              // grafico de barra, pizza, etc.), entao a conversao acontece aqui, uma vez.
              formatter={(value) => [formatRate(Number(value)), "Cotação"]}
              labelFormatter={(label) => formatIsoDate(String(label))}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="var(--sg-primary, #16a34a)"
              strokeWidth={2}
              fill="url(#rate-fill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </SgCard>
  );
}
