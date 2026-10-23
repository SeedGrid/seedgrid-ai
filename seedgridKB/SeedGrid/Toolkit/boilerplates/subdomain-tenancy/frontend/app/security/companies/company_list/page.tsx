"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgConfirmationDialog,
  SgDatatable,
  SgSkeleton,
  SgStack,
  toast,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
} from "@seedgrid/fe-components";
import { Ban, Edit3, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { EMPTY, Observable, Subject } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { useSavedToast } from "../../../components/useSavedToast";
import { ListLoadError } from "@/components/ui/list-load-error";
import { DatatableSkeleton } from "../../../components/DatatableSkeleton";
import { SgInputTextSearch } from "../../../components/SgInputTextSearch";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  COMPANY_ACCESS_MODES,
  COMPANY_ACCESS_MODE_LABELS,
  COMPANY_PERSON_TYPE_LABELS,
  companyErrorFromThrown,
  documentLabel,
  formatCompanyAddress,
  formatCpfCnpj,
  toActivePatch,
  type CompanyAccessMode,
  type CompanyActiveFilter,
  type CompanyEntry,
} from "@/lib/companies";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { PaginatedResult } from "@/lib/seedgrid-app-api";

type CompanyQueryState = {
  page: number;
  rows: number;
  search: string;
  sortField: string;
  sortOrder: "asc" | "desc";
  accessMode: CompanyAccessMode | "ALL";
  active: CompanyActiveFilter;
};

const DEFAULT_QUERY: CompanyQueryState = {
  page: 0,
  rows: 8,
  search: "",
  sortField: "corporateName",
  sortOrder: "asc",
  accessMode: "ALL",
  active: "ALL",
};

const ACCESS_MODE_ITEMS = [
  { id: "ALL", label: "Todos os estados", value: "ALL" },
  ...COMPANY_ACCESS_MODES.map((mode) => ({
    id: mode,
    label: COMPANY_ACCESS_MODE_LABELS[mode],
    value: mode,
  })),
];

const ACTIVE_ITEMS = [
  { id: "ALL", label: "Todas", value: "ALL" },
  { id: "ACTIVE", label: "Ativas", value: "ACTIVE" },
  { id: "INACTIVE", label: "Inativas", value: "INACTIVE" },
];

function accessModeSeverity(mode: CompanyAccessMode) {
  if (mode === "ACTIVE") return "success" as const;
  if (mode === "READ_ONLY") return "warning" as const;
  return "danger" as const;
}

export default function CompanyListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <CompanyListPageContent />
    </Suspense>
  );
}

function CompanyListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canViewCompanies = hasPermission(ADMIN_PERMISSIONS.companiesView);
  const canCreateCompanies = hasPermission(ADMIN_PERMISSIONS.companiesCreate);
  // Inativar/Reativar e o PATCH com `active`: mesma permissao da edicao. NAO existe excluir.
  const canEditCompanies = hasPermission(ADMIN_PERMISSIONS.companiesEdit);

  const [queryState, setQueryState] = useState<CompanyQueryState>(DEFAULT_QUERY);
  const [rawSearch, setRawSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [companiesPage, setCompaniesPage] = useState<PaginatedResult<CompanyEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_QUERY.rows,
    sortField: DEFAULT_QUERY.sortField,
    sortOrder: DEFAULT_QUERY.sortOrder,
    query: "",
  });
  // Erro de CARGA separado do aviso de operacao: erro nunca vira tabela vazia (PLAN.md 6.6).
  const [loadError, setLoadError] = useState<unknown>(null);
  const [companyToToggle, setCompanyToToggle] = useState<CompanyEntry | null>(null);
  const [toggling, setToggling] = useState(false);
  const requests$ = useMemo(() => new Subject<CompanyQueryState>(), []);

  useSavedToast({ created: "Empresa criada.", updated: "Empresa atualizada." });

  useEffect(() => {
    const subscription = requests$
      .pipe(
        tap(() => {
          setLoading(true);
          setLoadError(null);
        }),
        switchMap((nextQuery) =>
          createCompaniesRequest(nextQuery).pipe(
            tap((result) => {
              setCompaniesPage(result);
              setLoading(false);
            }),
            catchError((error: unknown) => {
              setLoading(false);
              setLoadError(error ?? new Error("Falha ao carregar empresas."));
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [requests$]);

  useEffect(() => {
    if (accessLoading || !canViewCompanies) {
      return;
    }
    requests$.next(queryState);
  }, [accessLoading, canViewCompanies, queryState, requests$]);

  function handlePage(event: SgDatatablePageEvent) {
    setQueryState((current) => ({ ...current, page: event.page - 1, rows: event.rows }));
  }

  function handleSort(event: SgDatatableSortEvent) {
    setQueryState((current) => ({
      ...current,
      page: 0,
      sortField: event.sortField ?? "corporateName",
      sortOrder: event.sortOrder === -1 ? "desc" : "asc",
    }));
  }

  async function confirmToggleActive() {
    const company = companyToToggle;
    if (!company) {
      return;
    }

    const nextActive = !company.active;
    setToggling(true);
    try {
      await adminProxyClient.patch(`/api/security/companies/${company.publicId}`, {
        body: toActivePatch(nextActive),
      });
      toast.success(nextActive ? "Empresa reativada." : "Empresa inativada.");
      requests$.next(queryState);
    } catch (error) {
      // LAST_ADMIN_PROTECTED (409) e COMPANY_QUOTA_EXCEEDED (402) viram texto para o usuario.
      toast.error(
        companyErrorFromThrown(
          error,
          extractApiErrorMessage,
          nextActive ? "Falha ao reativar empresa." : "Falha ao inativar empresa.",
        ),
      );
    } finally {
      setToggling(false);
      setCompanyToToggle(null);
    }
  }

  const columns: SgDatatableColumn<CompanyEntry>[] = useMemo(
    () => [
      {
        columnId: "company-name",
        field: "corporateName",
        header: "Razao social",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => (
          <div>
            <strong>{row.corporateName}</strong>
            {row.tradeName ? <div style={{ fontSize: 12, opacity: 0.7 }}>{row.tradeName}</div> : null}
          </div>
        ),
      },
      {
        columnId: "company-person-type",
        field: "personType",
        header: "Tipo",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => COMPANY_PERSON_TYPE_LABELS[row.personType],
      },
      {
        columnId: "company-document",
        field: "cpfCnpj",
        header: "CPF/CNPJ",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) =>
          row.cpfCnpj ? `${documentLabel(row.personType)} ${formatCpfCnpj(row.cpfCnpj)}` : "-",
      },
      {
        columnId: "company-address",
        field: "addrState",
        header: "UF / Endereco",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => formatCompanyAddress(row) || "-",
      },
      {
        columnId: "company-access-mode",
        field: "accessMode",
        header: "Estado",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={accessModeSeverity(row.accessMode)}
            value={COMPANY_ACCESS_MODE_LABELS[row.accessMode]}
          />
        ),
      },
      {
        columnId: "company-status",
        field: "active",
        header: "Situacao",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => (
          <StatusBadge
            severity={row.active ? "success" : "danger"}
            value={row.active ? "ATIVA" : "INATIVA"}
          />
        ),
      },
      {
        columnId: "company-created-at",
        field: "createdAt",
        header: "Criada em",
        sortable: true,
        reorderable: true,
        hideable: true,
        body: (row) => formatDateTime(row.createdAt),
      },
      {
        columnId: "company-actions",
        header: "Acoes",
        reorderable: true,
        hideable: false,
        body: (row) =>
          canEditCompanies ? (
            <div className="plan-actions-cell">
              <SgButton
                appearance="ghost"
                aria-label={`Editar ${row.corporateName}`}
                title={`Editar ${row.corporateName}`}
                iconOnly
                leftIcon={<Edit3 size={16} />}
                onClick={() => router.push(`/security/companies/company_edit?publicId=${row.publicId}`)}
                severity="secondary"
              />
              <SgButton
                appearance="ghost"
                aria-label={`${row.active ? "Inativar" : "Reativar"} ${row.corporateName}`}
                title={row.active ? "Inativar" : "Reativar"}
                iconOnly
                leftIcon={row.active ? <Ban size={16} /> : <RotateCcw size={16} />}
                onClick={() => setCompanyToToggle(row)}
                severity={row.active ? "danger" : "secondary"}
              />
            </div>
          ) : null,
      },
    ],
    [canEditCompanies, router],
  );

  if (!accessLoading && !canViewCompanies) {
    return (
      <Shell eyebrow="Seguranca" title="Empresas" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para visualizar empresas." />
        </SgCard>
      </Shell>
    );
  }

  const toggleToInactive = companyToToggle?.active ?? true;

  return (
    <Shell
      eyebrow="Seguranca"
      title="Empresas"
      description="Cadastre as empresas da conta. Empresas nao sao excluidas: apenas inativadas e reativadas."
    >
      <SgCard
        cardStyle="outlined"
        title="Lista de empresas"
        description="Filtre por estado de acesso (ativa, somente leitura, desligada) e por situacao (ativa ou inativa)."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputTextSearch
                id="companies-search"
                label="Busca por nome ou documento"
                placeholder="Digite ao menos 3 caracteres"
                prefixIcon={null}
                onChange={setRawSearch}
                onSearchChange={(search) => setQueryState((current) => ({ ...current, page: 0, search }))}
              />
            </div>
            <div style={{ minWidth: 200 }}>
              <SgCombobox
                id="companies-filter-access-mode"
                label="Estado"
                source={ACCESS_MODE_ITEMS}
                value={queryState.accessMode}
                onValueChange={(value) =>
                  setQueryState((current) => ({
                    ...current,
                    page: 0,
                    accessMode: (value ? String(value) : "ALL") as CompanyQueryState["accessMode"],
                  }))
                }
              />
            </div>
            <div style={{ minWidth: 160 }}>
              <SgCombobox
                id="companies-filter-active"
                label="Situacao"
                source={ACTIVE_ITEMS}
                value={queryState.active}
                onValueChange={(value) =>
                  setQueryState((current) => ({
                    ...current,
                    page: 0,
                    active: (value ? String(value) : "ALL") as CompanyActiveFilter,
                  }))
                }
              />
            </div>

            {canCreateCompanies ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/security/companies/company_edit")}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          {rawSearch.trim().length > 0 && rawSearch.trim().length < 3 ? (
            <StatusBadge severity="info" value="Digite pelo menos 3 caracteres para pesquisar." />
          ) : null}

          <ListLoadError error={loadError} onRetry={() => requests$.next(queryState)} />

          {loadError ? null : loading && companiesPage.items.length === 0 ? (
            <DatatableSkeleton columns={columns.length} rows={Math.min(queryState.rows, 8)} />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="publicId"
              emptyMessage="Nenhuma empresa encontrada."
              first={queryState.page * queryState.rows}
              id="companies-table"
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
              totalRecords={companiesPage.totalRecords}
              value={companiesPage.items}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={companyToToggle !== null}
        severity={toggleToInactive ? "danger" : "info"}
        title={toggleToInactive ? "Inativar empresa" : "Reativar empresa"}
        message={
          companyToToggle
            ? toggleToInactive
              ? `Inativar a empresa "${companyToToggle.corporateName}"? Ela deixa de fazer login e as sessoes dela sao encerradas. Voce pode reativa-la depois.`
              : `Reativar a empresa "${companyToToggle.corporateName}"? A reativacao respeita o limite de empresas do plano.`
            : ""
        }
        confirmButton={{
          label: toggling ? "Processando..." : toggleToInactive ? "Inativar" : "Reativar",
          severity: toggleToInactive ? "danger" : "secondary",
          disabled: toggling,
        }}
        cancelButton={{ label: "Cancelar", disabled: toggling }}
        closeOnConfirm={false}
        onConfirm={() => void confirmToggleActive()}
        onCancel={() => setCompanyToToggle(null)}
      />
    </Shell>
  );
}

function createCompaniesRequest(query: CompanyQueryState) {
  return new Observable<PaginatedResult<CompanyEntry>>((subscriber) => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(query.page),
      size: String(query.rows),
      sortField: query.sortField,
      sortOrder: query.sortOrder,
      accessMode: query.accessMode,
      active: query.active,
    });

    if (query.search.trim().length >= 3) {
      params.set("q", query.search.trim());
    }

    fetch(`/api/security/companies?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return (await response.json()) as PaginatedResult<CompanyEntry>;
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

    return () => controller.abort();
  });
}
