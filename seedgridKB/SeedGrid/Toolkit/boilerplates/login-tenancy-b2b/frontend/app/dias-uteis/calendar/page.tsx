"use client";

import { SgButton, SgCard, SgSkeleton, SgStack } from "@seedgrid/fe-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ListLoadError } from "@/components/ui/list-load-error";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  ISO_DAY_BY_NAME,
  MONTH_LABELS,
  WEEKDAY_SHORT_LABELS,
  dayKind,
  dayLabel,
  dayTooltip,
  holidaySourceLabel,
  mapDayResponse,
  type CalendarDay,
  type CalendarMonthResponse,
} from "@/lib/business-days";
import { adminProxyClient } from "@/lib/core";

// Fundos translucidos: leem bem nos temas claro e escuro sem depender de tokens do tema.
const COLORS = {
  business: "rgba(34, 197, 94, 0.16)",
  half: "rgba(245, 158, 11, 0.20)",
  closed: "rgba(148, 163, 184, 0.16)",
  holiday: "rgba(239, 68, 68, 0.18)",
  // Feriado em que a empresa trabalha: roxo, distinto do verde (dia util) e do vermelho (feriado fechado).
  worked: "rgba(139, 92, 246, 0.22)",
} as const;

function cellColor(day: CalendarDay): string {
  switch (dayKind(day)) {
    case "worked-holiday":
      return COLORS.worked;
    case "holiday":
      return COLORS.holiday;
    case "closed":
      return COLORS.closed;
    case "half":
      return COLORS.half;
    default:
      return COLORS.business;
  }
}

export default function BusinessDaysCalendarPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.businessDaysView);

  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await adminProxyClient.get<CalendarMonthResponse>(
        `/api/business-days/calendar?year=${cursor.year}&month=${cursor.month}`,
      );
      setDays(result.days.map(mapDayResponse));
    } catch (error) {
      setLoadError(error ?? new Error("Falha ao carregar o calendario."));
    } finally {
      setLoading(false);
    }
  }, [cursor.month, cursor.year]);

  useEffect(() => {
    if (accessLoading || !canView) {
      return;
    }
    void load();
  }, [accessLoading, canView, load]);

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const index = current.year * 12 + (current.month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });
  }

  const summary = useMemo(() => {
    const businessDays = days.filter((day) => day.businessDay).length;
    const weighted = days.reduce((total, day) => total + day.weight, 0);
    const holidays = days.filter((day) => day.holiday).length;
    return { businessDays, weighted, holidays };
  }, [days]);

  // Segunda-feira e a primeira coluna: o dia 1 cai na coluna (dia da semana ISO - 1).
  const leadingBlanks = days.length > 0 ? (ISO_DAY_BY_NAME[days[0].dayOfWeek] ?? 1) - 1 : 0;

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Dias uteis" title="Calendario" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para ver o calendario." />
        </SgCard>
      </Shell>
    );
  }

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: 6,
  };

  return (
    <Shell
      eyebrow="Dias uteis"
      title="Calendario"
      description="Veja mes a mes quais dias sao uteis, considerando a semana de trabalho e os feriados."
    >
      <SgCard cardStyle="outlined" title={`${MONTH_LABELS[cursor.month - 1]} de ${cursor.year}`}>
        <SgStack gap={16}>
          <SgStack align="center" direction="row" gap={12} justify="between" wrap>
            <SgStack direction="row" gap={8}>
              <SgButton
                appearance="outline"
                aria-label="Mes anterior"
                iconOnly
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => shiftMonth(-1)}
                severity="secondary"
              />
              <SgButton
                appearance="outline"
                aria-label="Proximo mes"
                iconOnly
                leftIcon={<ChevronRight size={16} />}
                onClick={() => shiftMonth(1)}
                severity="secondary"
              />
              <SgButton
                appearance="ghost"
                label="Hoje"
                onClick={() =>
                  setCursor({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
                }
                severity="secondary"
              />
            </SgStack>

            {days.length > 0 ? (
              <StatusBadge
                severity="info"
                value={`${summary.businessDays} dias uteis (${summary.weighted.toLocaleString("pt-BR")} de capacidade) · ${summary.holidays} feriado(s)`}
              />
            ) : null}
          </SgStack>

          <ListLoadError error={loadError} onRetry={() => void load()} />

          {loadError ? null : loading && days.length === 0 ? (
            <SgSkeleton borderRadius={16} height={360} shape="rectangle" />
          ) : (
            <div>
              <div style={{ ...gridStyle, marginBottom: 6 }}>
                {WEEKDAY_SHORT_LABELS.map((label) => (
                  <div
                    key={label}
                    style={{ textAlign: "center", fontSize: 12, fontWeight: 600, opacity: 0.7 }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div style={gridStyle}>
                {Array.from({ length: leadingBlanks }, (_, index) => (
                  <div key={`blank-${index}`} />
                ))}
                {days.map((day) => (
                  <div
                    key={day.date}
                    title={dayTooltip(day)}
                    style={{
                      background: cellColor(day),
                      border: "1px solid var(--sg-border, rgba(148, 163, 184, 0.35))",
                      borderRadius: 8,
                      minHeight: 72,
                      padding: "6px 8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>{Number(day.date.slice(8, 10))}</strong>
                    <span style={{ fontSize: 11, lineHeight: 1.2, opacity: 0.85 }}>{dayLabel(day)}</span>
                    {day.holiday && day.worksOnHoliday && day.holidayName ? (
                      <span style={{ fontSize: 11, lineHeight: 1.2, opacity: 0.7 }}>{day.holidayName}</span>
                    ) : null}
                    {day.holiday && holidaySourceLabel(day.holidaySource) ? (
                      <span style={{ fontSize: 10, lineHeight: 1.2, fontWeight: 600, opacity: 0.8 }}>
                        {holidaySourceLabel(day.holidaySource)}
                      </span>
                    ) : null}
                    {day.holiday && day.legalBasis ? (
                      <span style={{ fontSize: 10, lineHeight: 1.2, opacity: 0.65 }}>{day.legalBasis}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              <SgStack direction="row" gap={16} style={{ marginTop: 16 }} wrap>
                <Legend color={COLORS.business} label="Dia util" />
                <Legend color={COLORS.half} label="Meio periodo" />
                <Legend color={COLORS.closed} label="Fechado" />
                <Legend color={COLORS.holiday} label="Feriado" />
                <Legend color={COLORS.worked} label="Feriado trabalhado" />
              </SgStack>
            </div>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}

function Legend({ color, label }: Readonly<{ color: string; label: string }>) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: color,
          border: "1px solid var(--sg-border, rgba(148, 163, 184, 0.35))",
        }}
      />
      {label}
    </span>
  );
}
