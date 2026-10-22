"use client";

import {
  SgAutocomplete,
  SgCard,
  SgCombobox,
  SgDatatable,
  SgGrid,
  SgSkeleton,
  SgStack,
  type SgAutocompleteItem,
  type SgComboboxSource,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
} from "@seedgrid/fe-components";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { AdminAccount, PaginatedResult, SubscriptionEntry } from "@/lib/seedgrid-app-api";
import { formatCycleMeters } from "@/lib/usage-meters";

const DEFAULT_ROWS = 8;

const STATUS_OPTIONS: SgComboboxSource = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Ativas" },
  { id: "inactive", label: "Inativas" },
];

export default function SubscriptionsPage() {
  const [result, setResult] = useState<PaginatedResult<SubscriptionEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_ROWS,
    sortField: "",
    sortOrder: "asc",
    query: "",
  });
  const [pageState, setPageState] = useState({ page: 0, rows: DEFAULT_ROWS });
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [accountText, setAccountText] = useState("");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const accountItems: SgAutocompleteItem[] = useMemo(
    () =>
      accounts.map((account) => ({
        id: account.publicId,
        value: account.publicId,
        label: account.tradeName || account.legalName,
      })),
    [accounts],
  );

  // Busca local (typeahead) sobre os clientes ja carregados.
  function searchAccounts(query: string): SgAutocompleteItem[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      return accountItems;
    }
    return accountItems.filter((item) => item.label.toLowerCase().includes(term));
  }

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageState.page),
        size: String(pageState.rows),
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (accountIdFilter) {
        params.set("accountId", accountIdFilter);
      }
      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setResult((current) => ({ ...current, items: [], totalRecords: 0 }));
        return;
      }
      setResult((await response.json()) as PaginatedResult<SubscriptionEntry>);
    } finally {
      setLoading(false);
    }
  }, [pageState, statusFilter, accountIdFilter]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/accounts", { cache: "no-store" });
        const data = (await response.json()) as { items: AdminAccount[] };
        setAccounts(Array.isArray(data.items) ? data.items : []);
      } catch {
        setAccounts([]);
      }
    })();
  }, []);

  function handlePage(event: SgDatatablePageEvent) {
    // event.page e 1-based; o backend (Pageable) e o state usam 0-based.
    setPageState({ page: event.page - 1, rows: event.rows });
  }

  const columns: SgDatatableColumn<SubscriptionEntry>[] = useMemo(() => [
    {
      field: "tenantName",
      header: "Tenant",
      body: (row) => row.tenantName ?? row.tenantId,
      sortable: true,
    },
    {
      field: "plan",
      header: "Plano",
      body: (row) => row.plan?.name ?? "-",
      sortable: true,
    },
    {
      field: "planTerm",
      header: "Mensalidade",
      align: "right",
      body: (row) => (row.planTerm ? formatCurrency(row.planTerm.monthlyPrice) : "-"),
    },
    {
      field: "status",
      header: "Status",
      body: (row) => <StatusBadge value={row.status} />,
    },
    {
      field: "billingCycle",
      header: "Uso do ciclo (por contador)",
      body: (row) => formatCycleMeters(row.billingCycle?.meters),
    },
    {
      field: "startsAt",
      header: "Inicio",
      body: (row) => formatDateTime(row.startsAt),
    },
  ], []);

  return (
    <Shell
      eyebrow="Operacao"
      title="Assinaturas"
      description="Vinculo entre tenant e versao de plano, com ciclo inicial aberto pela API."
    >
      {result.planSummary && result.planSummary.length > 0 ? (
        <SgGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={16}>
          {result.planSummary.map((entry) => (
            <SgCard
              cardStyle="elevated"
              description={`${entry.count} assinatura${entry.count === 1 ? "" : "s"}`}
              key={entry.planCode ?? entry.planName}
              title={entry.planName}
            >
              <strong className="stat-value">{formatCurrency(entry.totalValue)}</strong>
            </SgCard>
          ))}
        </SgGrid>
      ) : null}

      <SgCard cardStyle="outlined" title="Assinaturas" description="Lista real de subscriptions da API.">
        <SgStack direction="row" gap={16} wrap style={{ marginBottom: 16 }}>
          <div style={{ minWidth: 240 }}>
            <SgAutocomplete
              id="subscriptions-filter-account"
              label="Cliente"
              placeholder="Todos os clientes"
              openOnFocus
              showDropDownButton
              minLengthForSearch={0}
              value={accountText}
              source={searchAccounts}
              onChange={(text) => {
                setAccountText(text);
                if (!text.trim()) {
                  setAccountIdFilter("");
                }
              }}
              onSelect={(item) => {
                setAccountIdFilter(String(item.id));
                setAccountText(item.label);
                setPageState((current) => ({ ...current, page: 0 }));
              }}
            />
          </div>
          <SgCombobox
            id="subscriptions-filter-status"
            label="Status"
            source={STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ? String(value) : "all");
              setPageState((current) => ({ ...current, page: 0 }));
            }}
          />
        </SgStack>

        {loading && result.items.length === 0 ? (
          <SgSkeleton height={240} />
        ) : (
          <SgDatatable
            columns={columns}
            dataKey="id"
            emptyMessage="Nenhuma assinatura encontrada."
            first={pageState.page * pageState.rows}
            id="subscriptions-table"
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
    </Shell>
  );
}
