"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgStack,
  toast,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
} from "@seedgrid/fe-components";
import { DollarSign, Edit3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EMPTY, Observable, Subject } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { useSavedToast } from "../../components/useSavedToast";
import { DatatableSkeleton } from "../../components/DatatableSkeleton";
import { SgInputTextSearch } from "../../components/SgInputTextSearch";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaginatedResult, PlanEntry } from "@/lib/seedgrid-app-api";
import { formatTermMeters } from "@/lib/usage-meters";

type PlanQueryState = {
  page: number;
  rows: number;
  search: string;
  sortField: string;
  sortOrder: "asc" | "desc";
};

const DEFAULT_QUERY: PlanQueryState = {
  page: 0,
  rows: 8,
  search: "",
  sortField: "name",
  sortOrder: "asc",
};

export default function PlanListPage() {
  return (
    <Suspense fallback={null}>
      <PlanListPageContent />
    </Suspense>
  );
}

function PlanListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canViewPlans = hasPermission(ADMIN_PERMISSIONS.plansView);
  const canCreatePlans = hasPermission(ADMIN_PERMISSIONS.plansCreate);
  const canEditPlans = hasPermission(ADMIN_PERMISSIONS.plansEdit);
  const canDeletePlans = hasPermission(ADMIN_PERMISSIONS.plansDelete);
  const canViewPlanTerms = hasPermission(ADMIN_PERMISSIONS.planTermsView);

  const [queryState, setQueryState] = useState<PlanQueryState>(DEFAULT_QUERY);
  const [rawSearch, setRawSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [plansPage, setPlansPage] = useState<PaginatedResult<PlanEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_QUERY.rows,
    sortField: DEFAULT_QUERY.sortField,
    sortOrder: DEFAULT_QUERY.sortOrder,
    query: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requests$ = useMemo(() => new Subject<PlanQueryState>(), []);

  useSavedToast({ created: "Plano criado.", updated: "Plano atualizado." });

  useEffect(() => {
    const subscription = requests$
      .pipe(
        tap(() => {
          setLoading(true);
        }),
        switchMap((nextQuery) =>
          createPlansRequest(nextQuery).pipe(
            tap((result) => {
              setPlansPage(result);
              setLoading(false);
            }),
            catchError(() => {
              setLoading(false);
              setStatusMessage("Falha ao carregar planos.");
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [requests$]);

  useEffect(() => {
    if (accessLoading || !canViewPlans) {
      return;
    }
    requests$.next(queryState);
  }, [accessLoading, canViewPlans, queryState, requests$]);

  function handlePage(event: SgDatatablePageEvent) {
    setQueryState((current) => ({
      ...current,
      // event.page e 1-based; o backend usa 0-based.
      page: event.page - 1,
      rows: event.rows,
    }));
  }

  function handleSort(event: SgDatatableSortEvent) {
    setQueryState((current) => ({
      ...current,
      page: 0,
      sortField: event.sortField ?? "name",
      sortOrder: event.sortOrder === -1 ? "desc" : "asc",
    }));
  }

  function handleSearchChange(nextSearch: string) {
    setQueryState((current) => ({
      ...current,
      page: 0,
      search: nextSearch,
    }));
  }

  async function confirmDeletePlan() {
    const plan = planToDelete;
    if (!plan) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/plans/${plan.publicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao excluir plano.");
        return;
      }

      toast.success("Plano excluido.");
      setQueryState((current) => ({
        ...current,
        page:
          plansPage.items.length === 1 && current.page > 0
            ? current.page - 1
            : current.page,
      }));
    } finally {
      setDeleting(false);
      setPlanToDelete(null);
    }
  }

  const columns: SgDatatableColumn<PlanEntry>[] = useMemo(() => [
    {
      columnId: "plan-code",
      field: "code",
      header: "Codigo",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "plan-name",
      field: "name",
      header: "Nome",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "plan-description",
      field: "description",
      header: "Descricao",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => row.description ?? "-",
    },
    {
      columnId: "plan-current-price",
      header: "Preco mensal",
      align: "right",
      reorderable: true,
      hideable: true,
      body: (row) =>
        row.currentTerm ? formatCurrency(row.currentTerm.monthlyPrice) : "-",
    },
    {
      columnId: "plan-current-meters",
      header: "Contadores (franquia + excedente)",
      reorderable: true,
      hideable: true,
      body: (row) => formatTermMeters(row.currentTerm?.meters),
    },
    {
      columnId: "plan-current-users",
      header: "Usuarios",
      align: "right",
      reorderable: true,
      hideable: true,
      body: (row) =>
        row.currentTerm?.maxUsers == null
          ? "-"
          : String(row.currentTerm.maxUsers),
    },
    {
      columnId: "plan-active",
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
      columnId: "plan-created-at",
      field: "createdAt",
      header: "Criado em",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => formatDateTime(row.createdAt),
    },
    {
      columnId: "plan-actions",
      header: "Acoes",
      reorderable: true,
      hideable: false,
      body: (row) => (
        <div className="plan-actions-cell">
          {canViewPlanTerms ? (
            <SgButton
              appearance="ghost"
              aria-label={`Condicoes comerciais de ${row.name}`}
              title={`Condicoes comerciais de ${row.name}`}
              iconOnly
              leftIcon={<DollarSign size={16} />}
              onClick={() =>
                router.push(`/plans/plan_terms?planPublicId=${row.publicId}`)
              }
              severity="secondary"
            />
          ) : null}
          {canEditPlans ? (
            <SgButton
              appearance="ghost"
              aria-label={`Editar ${row.name}`}
              title={`Editar ${row.name}`}
              iconOnly
              leftIcon={<Edit3 size={16} />}
              onClick={() => router.push(`/plans/plan_edit?publicId=${row.publicId}`)}
              severity="secondary"
            />
          ) : null}
          {canDeletePlans ? (
            <SgButton
              appearance="ghost"
              aria-label={`Excluir ${row.name}`}
              title={`Excluir ${row.name}`}
              iconOnly
              leftIcon={<Trash2 size={16} />}
              onClick={() => setPlanToDelete(row)}
              severity="danger"
            />
          ) : null}
        </div>
      ),
    },
  ], [canDeletePlans, canEditPlans, canViewPlanTerms, router]);

  if (!accessLoading && !canViewPlans) {
    return (
      <Shell
        eyebrow="Comercial"
        title="Planos"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar planos."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Comercial"
      title="Planos"
      description="Consulte, pesquise e organize os planos disponiveis para comercializacao."
    >
      <SgCard
        cardStyle="outlined"
        title="Lista de planos"
        description="Acompanhe os planos cadastrados e encontre rapidamente o que precisa."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputTextSearch
                id="plans-search"
                label="Busca por descricao"
                placeholder="Digite ao menos 3 caracteres"
                prefixIcon={null}
                onChange={setRawSearch}
                onSearchChange={handleSearchChange}
              />
            </div>

            {canCreatePlans ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/plans/plan_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          {rawSearch.trim().length > 0 && rawSearch.trim().length < 3 ? (
            <StatusBadge
              severity="info"
              value="Digite pelo menos 3 caracteres para pesquisar."
            />
          ) : null}

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {loading && plansPage.items.length === 0 ? (
            <DatatableSkeleton
              columns={columns.length}
              rows={Math.min(queryState.rows, 8)}
            />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="publicId"
              emptyMessage="Nenhum plano encontrado."
              first={queryState.page * queryState.rows}
              id="plans-table"
              lazy
              loading={loading}
              onPage={handlePage}
              onSort={handleSort}
              paginator
              removableSort={false}
              rows={queryState.rows}
              rowsPerPageOptions={[8, 16, 24, 48]}
              showColumnManager
              showGridlines
              sortField={queryState.sortField}
              sortOrder={queryState.sortOrder === "desc" ? -1 : 1}
              stripedRows
              totalRecords={plansPage.totalRecords}
              value={plansPage.items}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={planToDelete !== null}
        severity="danger"
        title="Excluir plano"
        message={
          planToDelete
            ? `Tem certeza que deseja excluir o plano "${planToDelete.name}"? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmButton={{
          label: deleting ? "Excluindo..." : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: deleting,
        }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDeletePlan()}
        onCancel={() => setPlanToDelete(null)}
      />
    </Shell>
  );
}

function createPlansRequest(query: PlanQueryState) {
  return new Observable<PaginatedResult<PlanEntry>>((subscriber) => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(query.page),
      size: String(query.rows),
      sortField: query.sortField,
      sortOrder: query.sortOrder,
    });

    if (query.search.trim().length >= 3) {
      params.set("q", query.search.trim());
    }

    fetch(`/api/admin/plans?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return (await response.json()) as PaginatedResult<PlanEntry>;
      })
      .then((result) => {
        subscriber.next(result);
        subscriber.complete();
      })
      .catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name: string }).name === "AbortError"
        ) {
          return;
        }
        subscriber.error(error);
      });

    return () => {
      controller.abort();
    };
  });
}
