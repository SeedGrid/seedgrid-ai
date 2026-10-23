"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgInputNumber,
  SgSkeleton,
  SgStack,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { useSavedToast } from "../../components/useSavedToast";
import { ListLoadError } from "@/components/ui/list-load-error";
import { DatatableSkeleton } from "../../components/DatatableSkeleton";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { formatHolidayDate, type HolidayEntry } from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

const PAGE_SIZE = 12;

export default function HolidayListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <HolidayListPageContent />
    </Suspense>
  );
}

function HolidayListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.businessDaysView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.businessDaysCreate);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.businessDaysEdit);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.businessDaysDelete);

  // Ano em edicao no campo (texto) e o ano efetivamente consultado: so' consulta com 4 digitos ou vazio.
  const [yearText, setYearText] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useSavedToast({ created: "Feriado criado.", updated: "Feriado atualizado." });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const query = year == null ? "" : `?year=${year}`;
      setHolidays(await adminProxyClient.get<HolidayEntry[]>(`/api/business-days/holidays${query}`));
    } catch (error) {
      // Erro de carga nunca vira tabela vazia ("nenhum feriado"): a lista mentiria.
      setLoadError(error ?? new Error("Falha ao carregar feriados."));
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
    if (digits === "") {
      setYear(null);
    } else if (/^\d{4}$/.test(digits)) {
      setYear(Number.parseInt(digits, 10));
    }
  }

  async function confirmDelete() {
    const holiday = holidayToDelete;
    if (!holiday) {
      return;
    }

    setDeleting(true);
    try {
      await adminProxyClient.delete(`/api/business-days/holidays/${holiday.id}`);
      toast.success("Feriado excluido.");
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao excluir feriado.");
    } finally {
      setDeleting(false);
      setHolidayToDelete(null);
    }
  }

  const columns: SgDatatableColumn<HolidayEntry>[] = useMemo(
    () => [
      {
        columnId: "holiday-name",
        field: "name",
        header: "Feriado",
        sortable: true,
        reorderable: true,
        hideable: false,
      },
      {
        columnId: "holiday-date",
        header: "Data",
        reorderable: true,
        hideable: true,
        body: (row) => formatHolidayDate(row),
      },
      {
        columnId: "holiday-kind",
        header: "Vale para",
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={row.recurring ? "info" : "neutral"}
            value={row.recurring ? "TODO ANO" : `SO EM ${row.year}`}
          />
        ),
      },
      {
        columnId: "holiday-origin",
        header: "Origem",
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={row.global ? "neutral" : "info"}
            value={row.global ? "PADRAO DA INSTALACAO" : "MINHA EMPRESA"}
          />
        ),
      },
      {
        columnId: "holiday-status",
        field: "active",
        header: "Status",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={row.active ? "success" : "danger"}
            value={row.active ? "ATIVO" : "INATIVO"}
          />
        ),
      },
      {
        columnId: "holiday-actions",
        header: "Acoes",
        reorderable: true,
        hideable: false,
        body: (row) => (
          <div className="plan-actions-cell">
            {canEdit && row.editable ? (
              <SgButton
                appearance="ghost"
                aria-label={`Editar ${row.name}`}
                title={`Editar ${row.name}`}
                iconOnly
                leftIcon={<Edit3 size={16} />}
                onClick={() => router.push(`/dias-uteis/holiday_edit?publicId=${row.id}`)}
                severity="secondary"
              />
            ) : null}
            {canDelete && row.editable ? (
              <SgButton
                appearance="ghost"
                aria-label={`Excluir ${row.name}`}
                title={`Excluir ${row.name}`}
                iconOnly
                leftIcon={<Trash2 size={16} />}
                onClick={() => setHolidayToDelete(row)}
                severity="danger"
              />
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canEdit, router],
  );

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Dias uteis" title="Feriados" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para visualizar feriados." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Dias uteis"
      title="Feriados"
      description="Cadastre os feriados da sua empresa. Nesses dias nao ha expediente, mesmo que a semana de trabalho preveja."
    >
      <SgCard
        cardStyle="outlined"
        title="Lista de feriados"
        description="Os feriados do padrao da instalacao valem para todas as empresas e so podem ser consultados."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputNumber
                id="holidays-year"
                label="Ano (vazio = todos)"
                decimals={0}
                minValue={1900}
                hintText="Mostra os feriados de todo ano e os especificos desse ano"
                inputProps={{ value: yearText }}
                onChange={handleYearChange}
              />
            </div>

            {canCreate ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/dias-uteis/holiday_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          <ListLoadError error={loadError} onRetry={() => void load()} />

          {loadError ? null : loading && holidays.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={Math.min(PAGE_SIZE, 8)} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhum feriado cadastrado."
              id="holidays-table"
              loading={loading}
              paginator
              rows={PAGE_SIZE}
              rowsPerPageOptions={[12, 24, 48]}
              showColumnManager
              showGridlines
              stripedRows
              value={holidays}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={holidayToDelete !== null}
        severity="danger"
        title="Excluir feriado"
        message={
          holidayToDelete
            ? `Tem certeza que deseja excluir o feriado "${holidayToDelete.name}"? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmButton={{
          label: deleting ? "Excluindo..." : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{ label: "Cancelar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setHolidayToDelete(null)}
      />
    </Shell>
  );
}
