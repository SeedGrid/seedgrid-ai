"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgDatatable,
  SgDialog,
  SgInputDate,
  SgInputNumber,
  SgInputText,
  SgStack,
  type SgAutocompleteItem,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
} from "@seedgrid/fe-components";
import { Copy, Eraser, Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DatatableSkeleton } from "../../components/DatatableSkeleton";
import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import {
  AUDIT_LOG_OPERATIONS,
  type AuditLogEntry,
  type AuditLogFilters,
  type PaginatedResult,
} from "@/lib/seedgrid-app-api";

const EMPTY_FILTERS: AuditLogFilters = {
  idFrom: "",
  idTo: "",
  entity: "",
  operation: "",
  description: "",
  operationDateFrom: "",
  operationDateTo: "",
  userName: "",
};

const DEFAULT_ROWS = 8;

// Valor sentinela do item "Todos": como o placeholder so aparece com o filtro vazio, sem um item
// explicito na lista nao da para REselecionar "todos" depois de escolher um valor. Este item zera
// o filtro (mapeado de volta para "" no onValueChange).
const ALL_VALUE = "__all__";
const ALL_OPTION: SgAutocompleteItem = { id: ALL_VALUE, label: "Todos", value: ALL_VALUE };

/** Prefixa a lista com a opcao "Todos" para permitir limpar o filtro pelo proprio combobox. */
function withAllOption(source: SgAutocompleteItem[]): SgAutocompleteItem[] {
  return [ALL_OPTION, ...source];
}

/** Converte o valor emitido pelo combobox em filtro: "Todos"/vazio -> "". */
function filterValue(value: unknown): string {
  return value && String(value) !== ALL_VALUE ? String(value) : "";
}

const OPERATION_SOURCE: SgAutocompleteItem[] = withAllOption(
  AUDIT_LOG_OPERATIONS.map((operation) => ({
    id: operation,
    label: operation,
    value: operation,
  })),
);

type PageState = {
  page: number;
  rows: number;
};

function operationSeverity(operation: string) {
  switch (operation.toUpperCase()) {
    case "CREATE":
      return "success" as const;
    case "UPDATE":
      return "info" as const;
    case "DELETE":
      return "danger" as const;
    case "READ":
      return "secondary" as const;
    default:
      return "warning" as const;
  }
}

export default function SecurityAuditPage() {
  // Filtros sendo editados na tela.
  const [draft, setDraft] = useState<AuditLogFilters>(EMPTY_FILTERS);
  // Filtros efetivamente aplicados (so mudam ao clicar em Pesquisar).
  const [applied, setApplied] = useState<AuditLogFilters>(EMPTY_FILTERS);
  const [pageState, setPageState] = useState<PageState>({ page: 0, rows: DEFAULT_ROWS });

  const [result, setResult] = useState<PaginatedResult<AuditLogEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_ROWS,
    sortField: "id",
    sortOrder: "desc",
    query: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);
  const [entityOptions, setEntityOptions] = useState<SgAutocompleteItem[]>([]);
  const [userOptions, setUserOptions] = useState<SgAutocompleteItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAudit() {
      setLoading(true);
      setLoadError(null);
      const params = new URLSearchParams({
        page: String(pageState.page),
        size: String(pageState.rows),
      });
      for (const [key, value] of Object.entries(applied)) {
        if (value.trim() !== "") {
          params.set(key, value.trim());
        }
      }

      try {
        const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Nao foi possivel carregar a auditoria (HTTP ${response.status}).`);
        }
        setResult((await response.json()) as PaginatedResult<AuditLogEntry>);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(error instanceof Error ? error.message : "Nao foi possivel carregar a auditoria.");
      } finally {
        setLoading(false);
      }
    }

    void loadAudit();
    return () => controller.abort();
  }, [applied, pageState]);

  // Entidades e usuarios ja auditados sao listas fechadas (em branco = todos),
  // entao carregamos uma vez e usamos comboboxes.
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const [entities, users] = await Promise.all([
        fetchOptions("/api/admin/audit-logs/entities"),
        fetchOptions("/api/admin/audit-logs/users"),
      ]);
      if (!cancelled) {
        setEntityOptions(entities);
        setUserOptions(users);
      }
    }

    void loadOptions().catch(() => {
      if (!cancelled) setOptionsError("Nao foi possivel carregar os filtros de auditoria.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateDraft<K extends keyof AuditLogFilters>(
    key: K,
    value: AuditLogFilters[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSearch() {
    setPageState((current) => ({ ...current, page: 0 }));
    setApplied(draft);
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPageState({ page: 0, rows: DEFAULT_ROWS });
  }

  function handlePage(event: SgDatatablePageEvent) {
    // event.page e 1-based; o backend (Pageable) e o state usam 0-based.
    setPageState({ page: event.page - 1, rows: event.rows });
  }

  const columns: SgDatatableColumn<AuditLogEntry>[] = useMemo(
    () => [
      { columnId: "audit-id", field: "id", header: "ID", sortable: false },
      { columnId: "audit-entity", field: "entity", header: "Entidade" },
      {
        columnId: "audit-operation",
        field: "operation",
        header: "Operacao",
        body: (row) => (
          <StatusBadge severity={operationSeverity(row.operation)} value={row.operation} />
        ),
      },
      {
        columnId: "audit-description",
        field: "description",
        header: "Descricao",
        body: (row) => row.description ?? "-",
      },
      {
        columnId: "audit-date",
        field: "operationDateTime",
        header: "Data/Hora",
        body: (row) => formatDateTime(row.operationDateTime),
      },
      {
        columnId: "audit-user",
        field: "userName",
        header: "Usuario",
        body: (row) => row.userName ?? "-",
      },
      {
        columnId: "audit-actions",
        header: "Acoes",
        hideable: false,
        body: (row) => (
          <SgButton
            appearance="ghost"
            aria-label={`Detalhes do registro ${row.id}`}
            title={`Detalhes do registro ${row.id}`}
            iconOnly
            leftIcon={<Eye size={16} />}
            onClick={() => setSelected(row)}
            severity="secondary"
          />
        ),
      },
    ],
    [],
  );

  return (
    <Shell
      eyebrow="Seguranca"
      title="Registros de Auditoria"
      description="Filtre e inspecione as acoes registradas pela API."
    >
      <SgCard cardStyle="outlined" title="Filtros">
        <SgStack gap={16}>
          <SgStack direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgInputNumber
                id="audit-id-from"
                label="ID de"
                decimals={0}
                minValue={0}
                inputProps={{ value: draft.idFrom }}
                onChange={(value) => updateDraft("idFrom", value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgInputNumber
                id="audit-id-to"
                label="ID ate"
                decimals={0}
                minValue={0}
                inputProps={{ value: draft.idTo }}
                onChange={(value) => updateDraft("idTo", value)}
              />
            </div>
          </SgStack>

          <SgStack direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgCombobox
                id="audit-entity"
                label="Entidade"
                placeholder="Todos"
                source={withAllOption(entityOptions)}
                value={draft.entity || ALL_VALUE}
                onValueChange={(value) => updateDraft("entity", filterValue(value))}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgCombobox
                id="audit-operation"
                label="Operacao"
                placeholder="Todos"
                source={OPERATION_SOURCE}
                value={draft.operation || ALL_VALUE}
                onValueChange={(value) => updateDraft("operation", filterValue(value))}
              />
            </div>
          </SgStack>

          <SgInputText
            id="audit-description"
            label="Descricao"
            inputProps={{ value: draft.description }}
            onChange={(value) => updateDraft("description", value)}
          />
        </SgStack>
      </SgCard>

      <SgCard cardStyle="outlined" title="Periodo">
        <SgStack gap={16}>
          <SgStack direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgInputDate
                id="audit-date-from"
                label="Data de"
                inputProps={{ value: draft.operationDateFrom }}
                onChange={(value) => updateDraft("operationDateFrom", value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <SgInputDate
                id="audit-date-to"
                label="Data ate"
                inputProps={{ value: draft.operationDateTo }}
                onChange={(value) => updateDraft("operationDateTo", value)}
              />
            </div>
          </SgStack>

          <SgCombobox
            id="audit-username"
            label="Username"
            placeholder="Todos"
            source={withAllOption(userOptions)}
            value={draft.userName || ALL_VALUE}
            onValueChange={(value) => updateDraft("userName", filterValue(value))}
          />
        </SgStack>
      </SgCard>

      <SgStack align="center" direction="row" gap={12} justify="end">
        <SgButton
          appearance="ghost"
          label="Limpar"
          leftIcon={<Eraser size={16} />}
          onClick={handleClear}
          severity="secondary"
        />
        <SgButton
          appearance="outline"
          label="Pesquisar"
          leftIcon={<Search size={16} />}
          onClick={handleSearch}
          severity="secondary"
        />
      </SgStack>

      {optionsError ? <div role="alert"><StatusBadge severity="danger" value={optionsError} /></div> : null}
      <SgCard cardStyle="outlined">
        {loading ? (
          <DatatableSkeleton columns={columns.length} rows={Math.min(pageState.rows, 8)} />
        ) : loadError ? (
          <div role="alert"><StatusBadge severity="danger" value={loadError} /></div>
        ) : (
          <SgDatatable
            columns={columns}
            dataKey="id"
            emptyMessage="Nenhum registro de auditoria encontrado."
            first={pageState.page * pageState.rows}
            id="audit-logs-table"
            lazy
            loading={loading}
            onPage={handlePage}
            paginator
            rows={pageState.rows}
            rowsPerPageOptions={[8, 16, 24, 48]}
            showGridlines
            stripedRows
            totalRecords={result.totalRecords}
            value={result.items}
          />
        )}
      </SgCard>

      <SgDialog
        bodyClassName="report-dialog-body"
        closeOnOverlayClick
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
        open={selected !== null}
        size="xl"
        title={selected ? `Registro de Auditoria #${selected.id}` : "Registro de Auditoria"}
      >
        {selected ? <AuditDetail entry={selected} /> : null}
      </SgDialog>
    </Shell>
  );
}

function AuditDetail({ entry }: { entry: AuditLogEntry }) {
  return (
    <SgStack gap={16}>
      <SgStack gap={4}>
        <DetailRow label="Entity" value={entry.entity} />
        <DetailRow label="Operation" value={entry.operation} />
        <DetailRow label="Description" value={entry.description ?? "-"} />
        <DetailRow label="Date/Time" value={formatDateTime(entry.operationDateTime)} />
        <DetailRow label="User" value={entry.userName ?? "-"} />
      </SgStack>

      <StateBlock label="Estado Anterior" value={entry.beforeState} />
      <StateBlock label="Estado Posterior" value={entry.afterState} />
    </SgStack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <SgStack direction="row" gap={12}>
      <span style={{ minWidth: 110, fontWeight: 600 }}>{label}:</span>
      <span>{value}</span>
    </SgStack>
  );
}

function StateBlock({ label, value }: { label: string; value: string | null }) {
  const content = formatState(value);

  function copy() {
    if (content) {
      void navigator.clipboard?.writeText(content);
    }
  }

  return (
    <SgStack gap={4}>
      <SgStack align="center" direction="row" justify="between">
        <span style={{ fontWeight: 600 }}>{label}:</span>
        {content ? (
          <SgButton
            appearance="ghost"
            aria-label={`Copiar ${label}`}
            title={`Copiar ${label}`}
            iconOnly
            leftIcon={<Copy size={16} />}
            onClick={copy}
            severity="secondary"
          />
        ) : null}
      </SgStack>
      <pre
        style={{
          margin: 0,
          padding: 12,
          borderRadius: 12,
          background: "var(--sg-color-surface-muted, #f1f1f4)",
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content ?? "-"}
      </pre>
    </SgStack>
  );
}

/** Tenta exibir o JSON formatado; cai para o texto cru se nao for JSON. */
function formatState(value: string | null): string | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

async function fetchOptions(url: string): Promise<SgAutocompleteItem[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Falha ao carregar filtros de auditoria (HTTP ${response.status}).`);
  const values = (await response.json()) as string[];
  return values.map((value) => ({ id: value, label: value, value }));
}
