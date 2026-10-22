"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgStack,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { useSavedToast } from "../../../components/useSavedToast";
import { DatatableSkeleton } from "../../../components/DatatableSkeleton";
import { StatusBadge } from "../../../components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import type { AiModelEntry } from "@/lib/seedgrid-app-api";

function priceLabel(value: number | null, currency: string) {
  if (value == null) {
    return "-";
  }
  return `${formatCurrency(value, currency)} /1M`;
}

export default function AiModelListPage() {
  return (
    <Suspense fallback={null}>
      <AiModelListPageContent />
    </Suspense>
  );
}

function AiModelListPageContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModelEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<AiModelEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useSavedToast({ created: "Modelo cadastrado.", updated: "Modelo atualizado." });

  async function loadModels() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/models", { cache: "no-store" });
      if (!response.ok) {
        setStatusMessage("Falha ao carregar modelos.");
        return;
      }
      const result = (await response.json()) as { models: AiModelEntry[] };
      setModels(result.models ?? []);
    } catch {
      setStatusMessage("Falha ao carregar modelos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadModels();
  }, []);

  async function confirmDelete() {
    const model = modelToDelete;
    if (!model) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/ai/models/${model.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao excluir modelo.");
        return;
      }
      toast.success("Modelo excluido.");
      await loadModels();
    } finally {
      setDeleting(false);
      setModelToDelete(null);
    }
  }

  const columns: SgDatatableColumn<AiModelEntry>[] = useMemo(() => [
    {
      columnId: "model-provider",
      field: "provider",
      header: "Provedor",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => row.provider ?? "-",
    },
    {
      columnId: "model-id",
      field: "model",
      header: "Modelo",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "model-label",
      field: "label",
      header: "Rotulo",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => row.label ?? "-",
    },
    {
      columnId: "model-input-price",
      header: "Preco entrada",
      align: "right",
      reorderable: true,
      hideable: true,
      body: (row) => priceLabel(row.inputPricePerMillion, row.currency),
    },
    {
      columnId: "model-output-price",
      header: "Preco saida",
      align: "right",
      reorderable: true,
      hideable: true,
      body: (row) => priceLabel(row.outputPricePerMillion, row.currency),
    },
    {
      columnId: "model-currency",
      field: "currency",
      header: "Moeda",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "model-active",
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
      columnId: "model-actions",
      header: "Acoes",
      reorderable: true,
      hideable: false,
      body: (row) => (
        <SgStack direction="row" gap={4}>
          <SgButton
            appearance="ghost"
            aria-label={`Editar ${row.model}`}
            title={`Editar ${row.model}`}
            iconOnly
            leftIcon={<Edit3 size={16} />}
            onClick={() =>
              router.push(`/ai/models/model_edit?publicId=${row.id}`)
            }
            severity="secondary"
          />
          <SgButton
            appearance="ghost"
            aria-label={`Excluir ${row.model}`}
            title={`Excluir ${row.model}`}
            iconOnly
            leftIcon={<Trash2 size={16} />}
            onClick={() => setModelToDelete(row)}
            severity="danger"
          />
        </SgStack>
      ),
    },
  ], [router]);

  return (
    <Shell
      eyebrow="Inteligencia Artificial"
      title="Modelos de IA"
      description="Cadastre os modelos de linguagem e a precificacao por milhao de tokens (entrada e saida)."
    >
      <SgCard
        cardStyle="outlined"
        title="Catalogo de modelos"
        description="Os modelos cadastrados aqui ficam disponiveis para uso nas fases do pipeline e servem de base para o custo estimado."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap justify="end">
            <SgButton
              appearance="outline"
              label="Novo"
              leftIcon={<Plus size={16} />}
              onClick={() => router.push("/ai/models/model_edit")}
              severity="secondary"
              size="md"
              style={{ height: 44 }}
            />
          </SgStack>

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading && models.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={4} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhum modelo cadastrado."
              id="ai-models-table"
              paginator={models.length > 8}
              removableSort={false}
              rows={8}
              rowsPerPageOptions={[8, 16, 24]}
              showColumnManager
              showGridlines
              stripedRows
              loading={loading}
              value={models}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={modelToDelete !== null}
        severity="danger"
        title="Excluir modelo"
        message={
          modelToDelete
            ? `Tem certeza que deseja excluir o modelo "${modelToDelete.model}"? Esta acao nao pode ser desfeita.`
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
        onCancel={() => setModelToDelete(null)}
      />
    </Shell>
  );
}
