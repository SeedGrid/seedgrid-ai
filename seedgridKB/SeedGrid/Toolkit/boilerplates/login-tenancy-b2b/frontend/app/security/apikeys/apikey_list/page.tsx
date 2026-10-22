"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgSkeleton,
  SgStack,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { useSavedToast } from "../../../components/useSavedToast";
import { DatatableSkeleton } from "../../../components/DatatableSkeleton";
import { SgInputTextSearch } from "../../../components/SgInputTextSearch";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { ApiKeyListItem, PaginatedResult } from "@/lib/seedgrid-app-api";

const DEFAULT_ROWS = 8;
// A listagem retorna apenas as chaves do proprio usuario NA EMPRESA CORRENTE (o backend ja filtra
// pela empresa do token; conjunto pequeno). Buscamos tudo de uma vez e filtramos/paginamos no
// cliente — o backend (ext seedgrid-apikeys) nao expoe filtro por nome. O teto e folgado para
// qualquer caso realista.
const FETCH_SIZE = 500;

type KeyStatus = {
  label: string;
  severity: "success" | "warning" | "danger" | "secondary";
};

function statusOf(row: ApiKeyListItem): KeyStatus {
  if (row.revokedAt) {
    return { label: "REVOGADA", severity: "danger" };
  }
  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    return { label: "EXPIRADA", severity: "secondary" };
  }
  return { label: "ATIVA", severity: "success" };
}

export default function ApiKeyListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <ApiKeyListPageContent />
    </Suspense>
  );
}

function ApiKeyListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.apiKeysView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.apiKeysCreate);
  const canRevoke = hasPermission(ADMIN_PERMISSIONS.apiKeysRevoke);

  const [items, setItems] = useState<ApiKeyListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [toRevoke, setToRevoke] = useState<ApiKeyListItem | null>(null);
  const [revoking, setRevoking] = useState(false);

  useSavedToast({ created: "API key criada." });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminProxyClient.get<PaginatedResult<ApiKeyListItem>>(
        `/api/security/apikeys?page=0&size=${FETCH_SIZE}`,
      );
      setItems(data.items);
    } catch (error) {
      setStatusMessage(extractApiErrorMessage(error) ?? "Falha ao carregar API keys.");
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

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, search]);

  async function confirmRevoke() {
    const key = toRevoke;
    if (!key) {
      return;
    }
    setRevoking(true);
    try {
      await adminProxyClient.post(`/api/security/apikeys/${key.publicId}/revoke`, {});
      toast.success("API key revogada.");
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao revogar API key.");
    } finally {
      setRevoking(false);
      setToRevoke(null);
    }
  }

  const columns: SgDatatableColumn<ApiKeyListItem>[] = useMemo(() => [
    { columnId: "apikey-name", field: "name", header: "Nome" },
    {
      columnId: "apikey-masked",
      field: "masked",
      header: "Chave",
      body: (row) => <code>{row.masked}</code>,
    },
    { columnId: "apikey-role", field: "roleName", header: "Perfil" },
    {
      columnId: "apikey-created",
      field: "createdAt",
      header: "Criada em",
      body: (row) => formatDateTime(row.createdAt),
    },
    {
      columnId: "apikey-expires",
      field: "expiresAt",
      header: "Expira em",
      body: (row) => (row.expiresAt ? formatDateTime(row.expiresAt) : "Nunca"),
    },
    {
      columnId: "apikey-lastused",
      field: "lastUsedAt",
      header: "Ultimo uso",
      body: (row) => (row.lastUsedAt ? formatDateTime(row.lastUsedAt) : "Nunca"),
    },
    {
      columnId: "apikey-status",
      header: "Status",
      body: (row) => {
        const status = statusOf(row);
        return <StatusBadge severity={status.severity} value={status.label} />;
      },
    },
    {
      columnId: "apikey-actions",
      header: "Acoes",
      body: (row) =>
        canRevoke && !row.revokedAt ? (
          <SgButton
            appearance="ghost"
            aria-label={`Revogar ${row.name}`}
            title="Revogar"
            iconOnly
            leftIcon={<Trash2 size={16} />}
            onClick={() => setToRevoke(row)}
            severity="danger"
          />
        ) : null,
    },
  ], [canRevoke]);

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Seguranca" title="API Keys" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar API keys."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="API Keys"
      description="Chaves de API para integrar outros sistemas a esta empresa."
    >
      <SgCard
        cardStyle="outlined"
        title="Suas API keys"
        description="Crie, acompanhe o uso e revogue chaves de API."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputTextSearch
                id="apikeys-search"
                label="Busca por nome"
                placeholder="Digite o nome da chave"
                prefixIcon={null}
                minChars={1}
                onSearchChange={setSearch}
              />
            </div>

            {canCreate ? (
              <SgButton
                appearance="outline"
                label="Nova"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/security/apikeys/apikey_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          {statusMessage ? <StatusBadge severity="info" value={statusMessage} /> : null}

          {loading && items.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={Math.min(DEFAULT_ROWS, 8)} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="publicId"
              emptyMessage="Nenhuma API key encontrada."
              id="apikeys-table"
              loading={loading}
              paginator
              rows={DEFAULT_ROWS}
              rowsPerPageOptions={[8, 16, 24, 48]}
              showGridlines
              stripedRows
              value={filteredItems}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={toRevoke !== null}
        severity="danger"
        title="Revogar API key"
        message={
          toRevoke
            ? `Revogar a chave "${toRevoke.name}"? Aplicacoes que a utilizam perderao acesso imediatamente. Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmButton={{
          label: revoking ? "Revogando..." : "Revogar",
          severity: "danger",
          disabled: revoking,
        }}
        cancelButton={{ label: "Cancelar", disabled: revoking }}
        closeOnConfirm={false}
        onConfirm={() => void confirmRevoke()}
        onCancel={() => setToRevoke(null)}
      />
    </Shell>
  );
}
