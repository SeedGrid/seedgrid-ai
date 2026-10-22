"use client";

import {
  SgButton,
  SgCard,
  SgDatatable,
  SgInputNumber,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { DatatableSkeleton } from "../../components/DatatableSkeleton";
import { ListLoadError } from "@/components/ui/list-load-error";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  buildMovablePayload,
  canEditMovable,
  canInheritMovable,
  formatIsoDate,
  holidaySourceLabel,
  isMovableCode,
  isReferenceRowDimmed,
  movableOriginLabel,
  sortReferenceHolidays,
  type MovableHoliday,
  type MovableHolidayCode,
  type ReferenceHoliday,
} from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

const PAGE_SIZE = 24;
// `dataKey` precisa ser unico: o mesmo codigo/data pode repetir em UFs diferentes.
type ReferenceRow = ReferenceHoliday & { rowKey: string };

const DIMMED: CSSProperties = { opacity: 0.5 };

export default function HolidayReferencePage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.businessDaysView);
  const canUpdate = canEditMovable(hasPermission(ADMIN_PERMISSIONS.businessDaysEdit));

  const currentYear = new Date().getFullYear();
  const [yearText, setYearText] = useState(String(currentYear));
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [rows, setRows] = useState<ReferenceRow[]>([]);
  const [movables, setMovables] = useState<MovableHoliday[]>([]);
  const [savingCode, setSavingCode] = useState<MovableHolidayCode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [reference, movable] = await Promise.all([
        adminProxyClient.get<ReferenceHoliday[]>(`/api/business-days/holidays/reference?year=${year}`),
        adminProxyClient.get<MovableHoliday[]>("/api/business-days/movable-holidays"),
      ]);
      setRows(
        sortReferenceHolidays(reference).map((row) => ({ ...row, rowKey: `${row.code}|${row.date}|${row.uf ?? ""}` })),
      );
      setMovables(movable);
    } catch (error) {
      // Erro de carga nunca vira tabela vazia ("nenhum feriado"): a lista mentiria.
      setLoadError(error ?? new Error("Falha ao carregar a lista de referencia."));
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (accessLoading || !canView) {
      return;
    }
    void load();
  }, [accessLoading, canView, load]);

  function handleYearChange(value: string) {
    setYearText(value);
    const digits = value.trim();
    if (/^\d{4}$/.test(digits)) {
      setYear(Number.parseInt(digits, 10));
    }
  }

  // `enabled: null` = voltar a herdar. O PUT responde a lista atualizada; a de referencia e' recarregada
  // porque a data e o `enabled` das linhas dependem do valor efetivo.
  const saveMovable = useCallback(async (code: MovableHolidayCode, enabled: boolean | null) => {
    setSavingCode(code);
    try {
      const updated = await adminProxyClient.put<MovableHoliday[]>("/api/business-days/movable-holidays", {
        body: buildMovablePayload(code, enabled),
      });
      if (Array.isArray(updated)) {
        setMovables(updated);
      }
      toast.success(enabled === null ? "Feriado movel voltou a herdar o padrao." : "Feriado movel atualizado.");
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Nao foi possivel atualizar o feriado movel.");
    } finally {
      setSavingCode(null);
    }
  }, [load]);

  const movableByCode = useMemo(() => new Map(movables.map((movable) => [movable.code, movable])), [movables]);

  const columns: SgDatatableColumn<ReferenceRow>[] = useMemo(
    () => [
      {
        columnId: "reference-date",
        header: "Data",
        reorderable: true,
        hideable: false,
        body: (row) => <span style={isReferenceRowDimmed(row) ? DIMMED : undefined}>{formatIsoDate(row.date)}</span>,
      },
      {
        columnId: "reference-name",
        field: "name",
        header: "Feriado",
        reorderable: true,
        hideable: false,
        body: (row) => (
          <div style={isReferenceRowDimmed(row) ? DIMMED : undefined}>
            <div>{row.name}</div>
            {isReferenceRowDimmed(row) ? (
              <div style={{ fontSize: 12 }}>
                <strong>Considerado dia util</strong>
              </div>
            ) : null}
          </div>
        ),
      },
      {
        columnId: "reference-source",
        header: "Origem",
        reorderable: true,
        hideable: true,
        body: (row) => (
          <span style={isReferenceRowDimmed(row) ? DIMMED : undefined}>
            <StatusBadge
              severity={row.source === "MOVABLE" ? "warning" : "info"}
              value={`${holidaySourceLabel(row.source) ?? row.source}${row.uf ? ` (${row.uf})` : ""}`.toUpperCase()}
            />
          </span>
        ),
      },
      {
        columnId: "reference-legal-basis",
        header: "Base legal",
        reorderable: true,
        hideable: true,
        body: (row) => (
          <span style={isReferenceRowDimmed(row) ? DIMMED : undefined}>{row.legalBasis ?? "-"}</span>
        ),
      },
      {
        columnId: "reference-consider",
        header: "Considerar como feriado",
        reorderable: true,
        hideable: false,
        body: (row) => {
          if (row.source !== "MOVABLE" || !isMovableCode(row.code)) {
            return <span style={{ opacity: 0.5 }}>-</span>;
          }
          const code = row.code;
          const movable = movableByCode.get(code);
          const busy = savingCode === code;
          return (
            <SgStack align="center" direction="row" gap={8} wrap>
              <SgToggleSwitch
                id={`movable-${code}-${row.date}`}
                checked={row.enabled}
                enabled={canUpdate && !busy}
                label=""
                onChange={(checked) => void saveMovable(code, checked)}
              />
              <span style={{ fontSize: 12 }}>
                Valor definido por: <strong>{movableOriginLabel(movable?.origin)}</strong>
              </span>
              {canUpdate && movable && canInheritMovable(movable) ? (
                <SgButton
                  appearance="ghost"
                  disabled={busy}
                  label="Voltar a herdar"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={() => void saveMovable(code, null)}
                  severity="secondary"
                  size="sm"
                />
              ) : null}
            </SgStack>
          );
        },
      },
    ],
    [canUpdate, movableByCode, saveMovable, savingCode],
  );

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Dias uteis" title="Lista de referencia" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para ver a lista de referencia." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Dias uteis"
      title="Lista de referencia"
      description="Feriados prontos (nacionais, estaduais e moveis) do ano. Carnaval, Sexta-feira Santa e Corpus Christi sao feriado por padrao; desmarque para a sua empresa tratar como dia util."
    >
      <SgCard
        cardStyle="outlined"
        title={`Feriados de ${year}`}
        description="Lista somente leitura. Os moveis podem ser desmarcados de forma permanente: vale todo ano, ate voltar a herdar."
      >
        <SgStack gap={16}>
          <div style={{ maxWidth: 240 }}>
            <SgInputNumber
              id="reference-year"
              label="Ano"
              decimals={0}
              minValue={1900}
              inputProps={{ value: yearText }}
              onChange={handleYearChange}
            />
          </div>

          {canUpdate ? null : (
            <StatusBadge
              severity="neutral"
              value="Voce pode consultar, mas nao alterar os feriados moveis (falta a permissao de edicao)."
            />
          )}

          <ListLoadError error={loadError} onRetry={() => void load()} />

          {loadError ? null : loading && rows.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={8} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="rowKey"
              emptyMessage="Nenhum feriado de referencia para o ano."
              id="holiday-reference-table"
              loading={loading}
              paginator
              rows={PAGE_SIZE}
              rowsPerPageOptions={[12, 24, 48]}
              showColumnManager
              showGridlines
              stripedRows
              value={rows}
            />
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
