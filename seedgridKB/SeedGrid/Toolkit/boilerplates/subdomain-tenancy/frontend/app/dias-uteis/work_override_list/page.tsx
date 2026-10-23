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
import {
  canEditWorkOverride,
  formatIsoDate,
  workOverrideWeightLabel,
  type WorkOverride,
} from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

const PAGE_SIZE = 12;

export default function WorkOverrideListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <WorkOverrideListPageContent />
    </Suspense>
  );
}

function WorkOverrideListPageContent() {
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
  const [overrides, setOverrides] = useState<WorkOverride[]>([]);
  const [overrideToDelete, setOverrideToDelete] = useState<WorkOverride | null>(null);
  const [deleting, setDeleting] = useState(false);

  useSavedToast({ created: "Excecao criada.", updated: "Excecao atualizada." });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const query = year == null ? "" : `?year=${year}`;
      const result = await adminProxyClient.get<WorkOverride[]>(`/api/business-days/work-overrides${query}`);
      setOverrides([...result].sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      // Erro de carga nunca vira tabela vazia ("nenhuma excecao"): a lista mentiria.
      setLoadError(error ?? new Error("Falha ao carregar as datas em que a empresa vai trabalhar."));
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
    const override = overrideToDelete;
    if (!override) {
      return;
    }

    setDeleting(true);
    try {
      await adminProxyClient.delete(`/api/business-days/work-overrides/${override.id}`);
      toast.success("Excecao excluida.");
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao excluir a excecao.");
    } finally {
      setDeleting(false);
      setOverrideToDelete(null);
    }
  }

  const columns: SgDatatableColumn<WorkOverride>[] = useMemo(
    () => [
      {
        columnId: "override-date",
        field: "date",
        header: "Data",
        sortable: true,
        reorderable: true,
        hideable: false,
        body: (row) => formatIsoDate(row.date),
      },
      {
        columnId: "override-weight",
        header: "Peso",
        reorderable: true,
        hideable: true,
        body: (row) => workOverrideWeightLabel(row.weight),
      },
      {
        columnId: "override-reason",
        header: "Motivo",
        reorderable: true,
        hideable: true,
        body: (row) => row.reason || "-",
      },
      {
        columnId: "override-origin",
        header: "Origem",
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={row.global ? "neutral" : "info"}
            value={row.global ? "CONTA (TENANT)" : "MINHA EMPRESA"}
          />
        ),
      },
      {
        columnId: "override-status",
        field: "active",
        header: "Status",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge severity={row.active ? "success" : "danger"} value={row.active ? "ATIVO" : "INATIVO"} />
        ),
      },
      {
        columnId: "override-actions",
        header: "Acoes",
        reorderable: true,
        hideable: false,
        body: (row) => (
          <div className="plan-actions-cell">
            {canEditWorkOverride(row, canEdit) ? (
              <SgButton
                appearance="ghost"
                aria-label={`Editar ${formatIsoDate(row.date)}`}
                title={`Editar ${formatIsoDate(row.date)}`}
                iconOnly
                leftIcon={<Edit3 size={16} />}
                onClick={() => router.push(`/dias-uteis/work_override_edit?publicId=${row.id}`)}
                severity="secondary"
              />
            ) : null}
            {canEditWorkOverride(row, canDelete) ? (
              <SgButton
                appearance="ghost"
                aria-label={`Excluir ${formatIsoDate(row.date)}`}
                title={`Excluir ${formatIsoDate(row.date)}`}
                iconOnly
                leftIcon={<Trash2 size={16} />}
                onClick={() => setOverrideToDelete(row)}
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
      <Shell eyebrow="Dias uteis" title="Vai trabalhar" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para ver as datas de trabalho." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Dias uteis"
      title="Vai trabalhar"
      description="Datas concretas em que a empresa trabalha mesmo sendo feriado (ou dia fechado na semana de trabalho)."
    >
      <SgCard
        cardStyle="outlined"
        title="Datas em que a empresa vai trabalhar"
        description="As excecoes definidas na conta (tenant) valem para todas as empresas e so podem ser consultadas por quem tem empresa."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputNumber
                id="work-overrides-year"
                label="Ano (vazio = todos)"
                decimals={0}
                minValue={1900}
                inputProps={{ value: yearText }}
                onChange={handleYearChange}
              />
            </div>

            {canCreate ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/dias-uteis/work_override_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          <ListLoadError error={loadError} onRetry={() => void load()} />

          {loadError ? null : loading && overrides.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={Math.min(PAGE_SIZE, 8)} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhuma data cadastrada."
              id="work-overrides-table"
              loading={loading}
              paginator
              rows={PAGE_SIZE}
              rowsPerPageOptions={[12, 24, 48]}
              showColumnManager
              showGridlines
              stripedRows
              value={overrides}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={overrideToDelete !== null}
        severity="danger"
        title="Excluir excecao"
        message={
          overrideToDelete
            ? `Tem certeza que deseja excluir a excecao de ${formatIsoDate(overrideToDelete.date)}? Esta acao nao pode ser desfeita.`
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
        onCancel={() => setOverrideToDelete(null)}
      />
    </Shell>
  );
}
