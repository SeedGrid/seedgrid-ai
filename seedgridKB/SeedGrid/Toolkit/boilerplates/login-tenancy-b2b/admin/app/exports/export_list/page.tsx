"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgSkeleton,
  SgStack,
  toast,
  useSgRealtimeEvent,
  useSgRealtimeStatus,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { useSavedToast } from "../../components/useSavedToast";
import { DatatableSkeleton } from "../../components/DatatableSkeleton";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { ExportJob, ExportStatus } from "@/lib/seedgrid-app-api";

const ACTIVE_STATUSES: ExportStatus[] = ["REQUESTED", "QUEUED", "RUNNING"];

// Reserva quando o realtime nao esta conectado (desligado, Pulse fora, conexao caida).
const FALLBACK_POLL_MS = 15000;

const FORMAT_LABEL: Record<string, string> = {
  CSV_ZIP: "CSV (portabilidade)",
  SQL_DUMP_ZIP: "SQL dump",
};

const SCOPE_LABEL: Record<string, string> = {
  DOMAIN: "Dados de negocio",
  RAW: "Tabelas brutas",
  CUSTOM: "Personalizado",
};

const STATUS_META: Record<
  ExportStatus,
  { label: string; severity: "success" | "warning" | "danger" | "secondary" | "info" }
> = {
  REQUESTED: { label: "Solicitado", severity: "info" },
  QUEUED: { label: "Na fila", severity: "info" },
  RUNNING: { label: "Processando", severity: "info" },
  DONE: { label: "Pronto", severity: "success" },
  DONE_NOTIFIED: { label: "Pronto", severity: "success" },
  FAILED: { label: "Falhou", severity: "danger" },
  EXPIRED: { label: "Expirado", severity: "secondary" },
  CANCELLED: { label: "Cancelado", severity: "secondary" },
};

function isActive(status: ExportStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) {
    return "-";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function ExportListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <ExportListPageContent />
    </Suspense>
  );
}

function ExportListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.backupView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.backupCreate);
  const canDownload = hasPermission(ADMIN_PERMISSIONS.backupDownload);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.backupDelete);

  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ExportJob | null>(null);
  const [deleting, setDeleting] = useState(false);

  useSavedToast({
    created: "Export solicitado. O arquivo fica disponivel quando o processamento terminar.",
  });

  const load = useCallback(async () => {
    try {
      const data = await adminProxyClient.get<ExportJob[]>("/api/admin/exports?page=0&size=100");
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatusMessage(extractApiErrorMessage(error) ?? "Falha ao carregar exports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessLoading || !canView) {
      return;
    }
    void load();
  }, [accessLoading, canView, load]);

  // O backend avisa pelo Pulse quando um backup DESTE usuario termina. O aviso so' traz o id: a
  // lista e' relida pela API de sempre, que continua checando a permissao.
  const { connected: realtimeConnected } = useSgRealtimeStatus();
  useSgRealtimeEvent("backup", "backup.finished.*", (event) => {
    if (event.event === "backup.finished.success") {
      toast.success("Backup pronto para download.");
    } else {
      toast.error("O backup falhou.");
    }
    void load();
  });

  // Polling so' como reserva: realtime fora do ar e algum job em andamento.
  useEffect(() => {
    if (realtimeConnected || !jobs.some((job) => isActive(job.status))) {
      return;
    }
    const timer = window.setInterval(() => void load(), FALLBACK_POLL_MS);
    return () => window.clearInterval(timer);
  }, [jobs, load, realtimeConnected]);

  async function confirmDelete() {
    const job = toDelete;
    if (!job) {
      return;
    }
    setDeleting(true);
    try {
      await adminProxyClient.delete(`/api/admin/exports/${job.jobId}`);
      toast.success(isActive(job.status) ? "Export cancelado." : "Export excluido.");
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao remover o export.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const columns: SgDatatableColumn<ExportJob>[] = useMemo(() => [
    {
      columnId: "export-created",
      field: "createdAt",
      header: "Criado em",
      body: (row) => formatDateTime(row.createdAt),
    },
    {
      columnId: "export-format",
      field: "format",
      header: "Formato",
      body: (row) => FORMAT_LABEL[row.format] ?? row.format,
    },
    {
      columnId: "export-scope",
      field: "scope",
      header: "Escopo",
      body: (row) => SCOPE_LABEL[row.scope] ?? row.scope,
    },
    {
      columnId: "export-status",
      field: "status",
      header: "Status",
      body: (row) => {
        const meta = STATUS_META[row.status];
        const suffix = row.status === "RUNNING" && row.progress != null ? ` ${row.progress}%` : "";
        return <StatusBadge severity={meta.severity} value={`${meta.label}${suffix}`} />;
      },
    },
    {
      columnId: "export-size",
      field: "totalSizeBytes",
      header: "Tamanho",
      body: (row) => formatBytes(row.totalSizeBytes),
    },
    {
      columnId: "export-expires",
      field: "expiresAt",
      header: "Expira em",
      body: (row) => (row.expiresAt ? formatDateTime(row.expiresAt) : "-"),
    },
    {
      columnId: "export-actions",
      header: "Acoes",
      body: (row) => (
        <div style={{ display: "flex", gap: 4 }}>
          {canDownload && row.downloadable ? (
            <SgButton
              appearance="ghost"
              aria-label="Baixar"
              title="Baixar"
              iconOnly
              leftIcon={<Download size={16} />}
              onClick={() => {
                window.location.href = `/api/admin/exports/${row.jobId}/download`;
              }}
              severity="secondary"
            />
          ) : null}
          {canDelete ? (
            <SgButton
              appearance="ghost"
              aria-label={isActive(row.status) ? "Cancelar" : "Excluir"}
              title={isActive(row.status) ? "Cancelar" : "Excluir"}
              iconOnly
              leftIcon={<Trash2 size={16} />}
              onClick={() => setToDelete(row)}
              severity="danger"
            />
          ) : null}
        </div>
      ),
    },
  ], [canDelete, canDownload]);

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Plataforma" title="Backup / Export" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para visualizar exports." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Plataforma"
      title="Backup / Export"
      description="Exportacao dos dados do tenant (CSV/SQL) para download."
    >
      <SgCard cardStyle="outlined" title="Exports" description="Solicite, acompanhe o processamento e baixe os arquivos.">
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }} />
            {canCreate ? (
              <SgButton
                appearance="outline"
                label="Novo export"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/exports/export_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          {statusMessage ? <StatusBadge severity="info" value={statusMessage} /> : null}

          {loading && jobs.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={6} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="jobId"
              emptyMessage="Nenhum export solicitado."
              id="exports-table"
              paginator
              rows={8}
              rowsPerPageOptions={[8, 16, 24, 48]}
              showGridlines
              stripedRows
              value={jobs}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={toDelete !== null}
        severity="danger"
        title={toDelete && isActive(toDelete.status) ? "Cancelar export" : "Excluir export"}
        message={
          toDelete
            ? isActive(toDelete.status)
              ? "Cancelar este export em andamento?"
              : "Excluir este export e o arquivo gerado? Esta acao nao pode ser desfeita."
            : ""
        }
        confirmButton={{
          label: deleting ? "Processando..." : toDelete && isActive(toDelete.status) ? "Cancelar export" : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{ label: "Voltar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </Shell>
  );
}
