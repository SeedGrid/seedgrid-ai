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
  type SgDatatablePageEvent,
  type SgDatatableSortEvent,
} from "@seedgrid/fe-components";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EMPTY, Observable, Subject } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Shell } from "../../../components/Shell";
import { useSavedToast } from "../../../components/useSavedToast";
import { DatatableSkeleton } from "../../../components/DatatableSkeleton";
import { SgInputTextSearch } from "../../../components/SgInputTextSearch";
import { StatusBadge } from "../../../components/StatusBadge";
import { useAdminAccess } from "../../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { PaginatedResult, UserEntry } from "@/lib/seedgrid-app-api";
import { isProtectedUser } from "@/lib/security-admin";

type UserQueryState = {
  page: number;
  rows: number;
  search: string;
  sortField: string;
  sortOrder: "asc" | "desc";
};

const DEFAULT_QUERY: UserQueryState = {
  page: 0,
  rows: 8,
  search: "",
  sortField: "name",
  sortOrder: "asc",
};

export default function UserListPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={320} shape="rectangle" />}>
      <UserListPageContent />
    </Suspense>
  );
}

function UserListPageContent() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canViewUsers = hasPermission(ADMIN_PERMISSIONS.usersView);
  const canCreateUsers = hasPermission(ADMIN_PERMISSIONS.usersCreate);
  const canEditUsers = hasPermission(ADMIN_PERMISSIONS.usersEdit);
  const canDeleteUsers = hasPermission(ADMIN_PERMISSIONS.usersDelete);

  const [queryState, setQueryState] = useState<UserQueryState>(DEFAULT_QUERY);
  const [rawSearch, setRawSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState<PaginatedResult<UserEntry>>({
    items: [],
    totalRecords: 0,
    page: 0,
    size: DEFAULT_QUERY.rows,
    sortField: DEFAULT_QUERY.sortField,
    sortOrder: DEFAULT_QUERY.sortOrder,
    query: "",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requests$ = useMemo(() => new Subject<UserQueryState>(), []);

  useSavedToast({ created: "Usuario criado.", updated: "Usuario atualizado." });

  useEffect(() => {
    const subscription = requests$
      .pipe(
        tap(() => setLoading(true)),
        switchMap((nextQuery) =>
          createUsersRequest(nextQuery).pipe(
            tap((result) => {
              setUsersPage(result);
              setLoading(false);
            }),
            catchError(() => {
              setLoading(false);
              setStatusMessage("Falha ao carregar usuarios.");
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [requests$]);

  useEffect(() => {
    if (accessLoading || !canViewUsers) {
      return;
    }
    requests$.next(queryState);
  }, [accessLoading, canViewUsers, queryState, requests$]);

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

  async function confirmDeleteUser() {
    const user = userToDelete;
    if (!user) {
      return;
    }

    setDeleting(true);
    try {
      await adminProxyClient.delete(
        `/api/admin/security/users/${user.publicId}`,
      );

      toast.success("Usuario excluido.");
      setQueryState((current) => ({
        ...current,
        page:
          usersPage.items.length === 1 && current.page > 0
            ? current.page - 1
            : current.page,
      }));
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao excluir usuario.");
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  }

  const columns: SgDatatableColumn<UserEntry>[] = useMemo(() => [
    {
      columnId: "user-id",
      field: "id",
      header: "ID",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "user-name",
      field: "name",
      header: "Nome",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "user-cargo",
      header: "Cargo",
      reorderable: true,
      hideable: true,
      body: (row) => typeof row.additionalAttributes?.cargo === "string" && row.additionalAttributes.cargo.trim()
        ? row.additionalAttributes.cargo : "-",
    },
    {
      columnId: "user-email",
      field: "email",
      header: "E-mail",
      sortable: true,
      reorderable: true,
      hideable: true,
    },
    {
      columnId: "user-roles",
      header: "Perfis",
      reorderable: true,
      hideable: true,
      body: (row) =>
        row.roles.length > 0 ? row.roles.map((role) => role.name).join(", ") : "-",
    },
    {
      columnId: "user-status",
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
      columnId: "user-2fa",
      field: "twoFactorEnabled",
      header: "2FA",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => (
        <StatusBadge
          severity={row.twoFactorEnabled ? "success" : "danger"}
          value={row.twoFactorEnabled ? "ATIVO" : "DESATIVADO"}
        />
      ),
    },
    {
      columnId: "user-created-at",
      field: "createdAt",
      header: "Criado em",
      sortable: true,
      reorderable: true,
      hideable: true,
      body: (row) => formatDateTime(row.createdAt),
    },
    {
      columnId: "user-actions",
      header: "Acoes",
      reorderable: true,
      hideable: false,
      body: (row) => (
        <div className="plan-actions-cell">
          {canEditUsers ? (
            <SgButton
              appearance="ghost"
              aria-label={`Editar ${row.name}`}
              title={`Editar ${row.name}`}
              iconOnly
              leftIcon={<Edit3 size={16} />}
              onClick={() =>
                router.push(`/security/users/user_edit?publicId=${row.publicId}`)
              }
              severity="secondary"
            />
          ) : null}
          {/* O usuario protegido (root da plataforma) nao se exclui: sem lixeira. */}
          {canDeleteUsers && !isProtectedUser(row) ? (
            <SgButton
              appearance="ghost"
              aria-label={`Excluir ${row.name}`}
              title={`Excluir ${row.name}`}
              iconOnly
              leftIcon={<Trash2 size={16} />}
              onClick={() => setUserToDelete(row)}
              severity="danger"
            />
          ) : null}
        </div>
      ),
    },
  ], [canDeleteUsers, canEditUsers, router]);

  if (!accessLoading && !canViewUsers) {
    return (
      <Shell
        eyebrow="Seguranca"
        title="Usuarios"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar usuarios."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="Usuarios"
      description="Consulte os acessos cadastrados e ajuste as atribuicoes quando necessario."
    >
      <SgCard
        cardStyle="outlined"
        title="Lista de usuarios"
        description="Encontre rapidamente quem pode acessar o ambiente administrativo."
      >
        <SgStack gap={16}>
          <SgStack align="end" direction="row" gap={12} wrap>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SgInputTextSearch
                id="users-search"
                label="Busca por nome"
                placeholder="Digite ao menos 3 caracteres"
                prefixIcon={null}
                onChange={setRawSearch}
                onSearchChange={(search) =>
                  setQueryState((current) => ({ ...current, page: 0, search }))
                }
              />
            </div>

            {canCreateUsers ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={() => router.push("/security/users/user_edit")}
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

          {loading && usersPage.items.length === 0 ? (
            <DatatableSkeleton
              columns={columns.length}
              rows={Math.min(queryState.rows, 8)}
            />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhum usuario encontrado."
              first={queryState.page * queryState.rows}
              id="users-table"
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
              totalRecords={usersPage.totalRecords}
              value={usersPage.items}
            />
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={userToDelete !== null}
        severity="danger"
        title="Excluir usuario"
        message={
          userToDelete
            ? `Tem certeza que deseja excluir o usuario "${userToDelete.name}"? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmButton={{
          label: deleting ? "Excluindo..." : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{ label: "Cancelar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDeleteUser()}
        onCancel={() => setUserToDelete(null)}
      />
    </Shell>
  );
}

function createUsersRequest(query: UserQueryState) {
  return new Observable<PaginatedResult<UserEntry>>((subscriber) => {
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

    fetch(`/api/admin/security/users?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return (await response.json()) as PaginatedResult<UserEntry>;
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
