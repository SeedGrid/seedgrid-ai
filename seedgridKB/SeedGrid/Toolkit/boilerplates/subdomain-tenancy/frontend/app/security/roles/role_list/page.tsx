"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgDialog,
  SgSkeleton,
  SgStack,
  toast,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
} from "@seedgrid/fe-components";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
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
import { clientPermissionLabel } from "@/lib/client-permission-tree";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { PaginatedResult, RoleEntry } from "@/lib/seedgrid-app-api";

type RoleQueryState = {
  page: number;
  rows: number;
  search: string;
  sortField: string;
  sortOrder: "asc" | "desc";
};

const DEFAULT_QUERY: RoleQueryState = {
  page: 0,
  rows: 8,
  search: "",
  sortField: "name",
  sortOrder: "asc",
};

function isProtectedAdminRole(role: RoleEntry) {
  return role.name.trim().toUpperCase() === "ADMIN";
}

export default function RoleListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <RoleListPageContent />
    </Suspense>
  );
}

function RoleListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canViewRoles = hasPermission(ADMIN_PERMISSIONS.rolesView);
  const canCreateRoles = hasPermission(ADMIN_PERMISSIONS.rolesCreate);
  const canEditRoles = hasPermission(ADMIN_PERMISSIONS.rolesEdit);
  const canDeleteRoles = hasPermission(ADMIN_PERMISSIONS.rolesDelete);

  const [queryState, setQueryState] = useState<RoleQueryState>(DEFAULT_QUERY);
  const [rawSearch, setRawSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rolesPage, setRolesPage] = useState<PaginatedResult<RoleEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_QUERY.rows,
    sortField: DEFAULT_QUERY.sortField,
    sortOrder: DEFAULT_QUERY.sortOrder,
    query: "",
  });
  // `statusMessage` (StatusBadge severity="info") saiu: o unico produtor era a falha de
  // carga, que agora vai para o <ListLoadError> com a severidade certa. Badge `info` de
  // rodape para um erro e' o que o PLAN.md §6.6 proibe — a mensagem tem de PARECER erro.
  // Erro de CARGA da lista, separado do `statusMessage` (que e' aviso de operacao). Erro
  // aqui nunca pode virar tabela vazia com "nenhum registro encontrado" — ver PLAN.md §6.6.
  const [loadError, setLoadError] = useState<unknown>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Visualizacao somente-leitura das permissoes do perfil (acao "olhinho").
  const [roleToView, setRoleToView] = useState<RoleEntry | null>(null);
  const requests$ = useMemo(() => new Subject<RoleQueryState>(), []);

  useSavedToast({ created: "Perfil criado.", updated: "Perfil atualizado." });

  useEffect(() => {
    const subscription = requests$
      .pipe(
        tap(() => {
          setLoading(true);
          setLoadError(null);
        }),
        switchMap((nextQuery) =>
          createRolesRequest(nextQuery).pipe(
            tap((result) => {
              setRolesPage(result);
              setLoading(false);
            }),
            catchError((error: unknown) => {
              setLoading(false);
              // O erro vai INTEIRO para o <ListLoadError>: ele decide o texto (sessao
              // expirada x falha de carga) e mostra o detalhe. Antes virava um
              // `StatusBadge severity="info"` de rodape, com a tabela ao lado dizendo
              // "nenhum perfi encontrado" — erro com cara de vazio.
              setLoadError(error ?? new Error("Falha ao carregar perfis."));
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [requests$]);

  useEffect(() => {
    if (accessLoading || !canViewRoles) {
      return;
    }
    requests$.next(queryState);
  }, [accessLoading, canViewRoles, queryState, requests$]);

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

  async function confirmDeleteRole() {
    const role = roleToDelete;
    if (!role) {
      return;
    }

    setDeleting(true);
    try {
      await adminProxyClient.delete(
        `/api/security/roles/${role.publicId}`,
      );

      toast.success("Perfil excluido.");
      setQueryState((current) => ({
        ...current,
        page:
          rolesPage.items.length === 1 && current.page > 0
            ? current.page - 1
            : current.page,
      }));
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao excluir perfil.");
    } finally {
      setDeleting(false);
      setRoleToDelete(null);
    }
  }

  const columns: SgDatatableColumn<RoleEntry>[] = useMemo(() => [
    {
      columnId: "role-name",
      field: "name",
      header: "Nome",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "role-description",
      field: "description",
      header: "Descricao",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "role-status",
      field: "active",
      header: "Status",
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
      columnId: "role-integration",
      field: "forIntegration",
      header: "Integracao",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => (
        <StatusBadge
          severity={row.forIntegration ? "danger" : "success"}
          value={row.forIntegration ? "SIM" : "NAO"}
        />
      ),
    },
    {
      columnId: "role-created-at",
      field: "createdAt",
      header: "Criada em",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => formatDateTime(row.createdAt),
    },
    {
      columnId: "role-actions",
      header: "Acoes",
      reorderable: true,
      hideable: false,
      body: (row) => (
        <div className="plan-actions-cell">
          <SgButton
            appearance="ghost"
            aria-label={`Ver permissoes de ${row.name}`}
            title="Ver permissoes"
            iconOnly
            leftIcon={<Eye size={16} />}
            onClick={() => setRoleToView(row)}
            severity="secondary"
          />
          {canEditRoles && !isProtectedAdminRole(row) ? (
            <SgButton
              appearance="ghost"
              aria-label={`Editar ${row.name}`}
              title={`Editar ${row.name}`}
              iconOnly
              leftIcon={<Edit3 size={16} />}
              onClick={() =>
                router.push(`/security/roles/role_edit?publicId=${row.publicId}`)
              }
              severity="secondary"
            />
          ) : null}
          {canDeleteRoles && !isProtectedAdminRole(row) ? (
            <SgButton
              appearance="ghost"
              aria-label={`Excluir ${row.name}`}
              title={`Excluir ${row.name}`}
              iconOnly
              leftIcon={<Trash2 size={16} />}
              onClick={() => setRoleToDelete(row)}
              severity="danger"
            />
          ) : null}
        </div>
      ),
    },
  ], [canDeleteRoles, canEditRoles, router]);

  if (!accessLoading && !canViewRoles) {
    return (
      <Shell
        eyebrow="Seguranca"
        title="Perfis"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar perfis."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="Perfis"
      description="Organize os perfis de acesso que podem ser atribuídos aos usuarios."
    >
      <SgCard
        cardStyle="outlined"
        title="Lista de perfis"
        description="Mantenha os perfis de acesso usados no ambiente administrativo."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputTextSearch
                id="roles-search"
                label="Busca por nome"
                placeholder="Digite ao menos 3 caracteres"
                prefixIcon={null}
                onChange={setRawSearch}
                onSearchChange={(search) =>
                  setQueryState((current) => ({ ...current, page: 0, search }))
                }
              />
            </div>

            {canCreateRoles ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/security/roles/role_edit")}
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

          {/* Erro de carga entra ANTES da tabela e no lugar dela: a tabela vazia mentiria. */}
          <ListLoadError error={loadError} onRetry={() => requests$.next(queryState)} />

          {loadError ? null : loading && rolesPage.items.length === 0 ? (
            <DatatableSkeleton
              columns={columns.length}
              rows={Math.min(queryState.rows, 8)}
            />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhum perfil encontrado."
              first={queryState.page * queryState.rows}
              id="roles-table"
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
              totalRecords={rolesPage.totalRecords}
              value={rolesPage.items}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={roleToDelete !== null}
        severity="danger"
        title="Excluir perfil"
        message={
          roleToDelete
            ? `Tem certeza que deseja excluir o perfil "${roleToDelete.name}"? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmButton={{
          label: deleting ? "Excluindo..." : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{ label: "Cancelar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDeleteRole()}
        onCancel={() => setRoleToDelete(null)}
      />

      <SgDialog
        open={roleToView !== null}
        onOpenChange={(open) => {
          if (!open) setRoleToView(null);
        }}
        size="md"
        title={roleToView ? `Permissoes — ${roleToView.name}` : "Permissoes"}
      >
        {roleToView ? (
          <SgStack gap={12}>
            {roleToView.description ? (
              <p style={{ fontSize: 14, color: "var(--sg-muted, #6b7280)" }}>
                {roleToView.description}
              </p>
            ) : null}
            {/* So' as permissoes do menu do cliente: o ADMIN de sistema tem todas, inclusive as da
                plataforma, que nao significam nada aqui. */}
            {roleToView.permissions.every((permission) => clientPermissionLabel(permission.name) == null) ? (
              <StatusBadge severity="info" value="Este perfil nao possui permissoes." />
            ) : (
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 320,
                  overflow: "auto",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {roleToView.permissions
                  .map((permission) => ({ ...permission, label: clientPermissionLabel(permission.name) }))
                  .filter((permission): permission is typeof permission & { label: string } => permission.label != null)
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((permission) => (
                    <li
                      key={permission.publicId}
                      style={{
                        border: "1px solid var(--sg-border, #e5e7eb)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 14,
                      }}
                    >
                      {permission.label}
                    </li>
                  ))}
              </ul>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <SgButton
                appearance="outline"
                label="Fechar"
                onClick={() => setRoleToView(null)}
                severity="secondary"
              />
            </div>
          </SgStack>
        ) : null}
      </SgDialog>
    </Shell>
  );
}

function createRolesRequest(query: RoleQueryState) {
  return new Observable<PaginatedResult<RoleEntry>>((subscriber) => {
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

    fetch(`/api/security/roles?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return (await response.json()) as PaginatedResult<RoleEntry>;
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
