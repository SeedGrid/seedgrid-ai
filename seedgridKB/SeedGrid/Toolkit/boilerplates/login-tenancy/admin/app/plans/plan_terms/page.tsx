"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgDialog,
  SgInputCurrency,
  SgInputDate,
  SgInputNumber,
  SgInputText,
  SgInputTextArea,
  SgSkeleton,
  SgStack,
  SgTreeView,
  toast,
  type SgDatatableColumn,
  type SgDatatablePageEvent,
  type SgTreeNode,
} from "@seedgrid/fe-components";
import { Archive, ArrowLeft, ChevronsDownUp, ChevronsUpDown, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { SgInputTextSearch } from "../../components/SgInputTextSearch";
import { MeterQuotaEditor, useUsageMeters } from "../../components/MeterQuotaEditor";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { CLIENT_PERMISSION_MENU_TREE } from "@/lib/client-permission-tree";

/**
 * Grupos do menu do cliente que NAO se vendem por plano: administracao basica da propria conta
 * (usuarios, perfis, auditoria) e a propria assinatura. So' o resto vira "feature do plano".
 */
const NOT_SELLABLE_GROUPS = new Set(["seguranca", "menu-usuario", "train-ai", "extrato"]);

/** Nomes das permissoes vendaveis por plano (as que a arvore de features mostra). */
const SELLABLE_PERMISSION_NAMES = new Set(
  CLIENT_PERMISSION_MENU_TREE.filter((group) => !NOT_SELLABLE_GROUPS.has(group.id)).flatMap((group) =>
    group.screens.flatMap((screen) => screen.actions.map((action) => action.permission)),
  ),
);
import { formatCurrency, formatDateTime, parseDecimalInput } from "@/lib/format";
import { branchIds, filterTree } from "@/lib/permission-tree";
import {
  type PaginatedResult,
  type PermissionOption,
  type PlanEntry,
  type PlanTermEntry,
  type PlanTermStatus,
} from "@/lib/seedgrid-app-api";
import { formatTermMeters, toMeterPayload, toMeterRows, type MeterQuotaRow } from "@/lib/usage-meters";

const PAGE_SIZE = 8;

type TermFormState = {
  monthlyPrice: string;
  maxUsers: string;
  // Franquia e excedente de cada contador de uso declarado pelo produto (billing/AppUsageMeters.java).
  meterRows: MeterQuotaRow[];
  // Beneficios do plano, um por linha; serializados como JSON array em featuresJson.
  benefits: string;
  effectiveFrom: string;
  // publicIds de Permission (audience client) que este term libera -- gate de features por
  // plano (PlanTerm <-> Permission). Vazio ao criar: o admin precisa marcar explicitamente.
  permissionPublicIds: string[];
};

const EMPTY_FORM: TermFormState = {
  monthlyPrice: "",
  maxUsers: "",
  meterRows: [],
  benefits: "",
  effectiveFrom: "",
  permissionPublicIds: [],
};

// Beneficios sao guardados em featuresJson como um array JSON de strings. Estes
// helpers convertem entre esse formato e o textarea (um beneficio por linha).
function featuresJsonToBenefitsText(featuresJson: string | null | undefined): string {
  if (!featuresJson) {
    return "";
  }
  try {
    const parsed = JSON.parse(featuresJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).join("\n");
    }
  } catch {
    // featuresJson legado/livre: mostra como veio.
    return featuresJson;
  }
  return featuresJson;
}

function benefitsTextToFeaturesJson(benefits: string): string | null {
  const lines = benefits
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.length > 0 ? JSON.stringify(lines) : null;
}

const STATUS_META: Record<
  PlanTermStatus,
  { label: string; severity: "info" | "success" | "secondary" }
> = {
  SCHEDULED: { label: "Agendado", severity: "info" },
  CURRENT: { label: "Vigente", severity: "success" },
  ENDED: { label: "Encerrado", severity: "secondary" },
};

export default function PlanTermsPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <PlanTermsPageContent />
    </Suspense>
  );
}

function PlanTermsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planPublicId = searchParams.get("planPublicId");

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.planTermsView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.planTermsCreate);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.planTermsEdit);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.planTermsDelete);
  const { meters: declaredMeters } = useUsageMeters(!accessLoading && canView);
  const canPublish = hasPermission(ADMIN_PERMISSIONS.planTermsPublish);
  const canArchive = hasPermission(ADMIN_PERMISSIONS.planTermsArchive);

  const [planName, setPlanName] = useState<string | null>(null);
  const [terms, setTerms] = useState<PlanTermEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlanTermEntry | null>(null);
  const [form, setForm] = useState<TermFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Catalogo de permissoes CLIENT (o que o gate de features por plano restringe) -- carregado
  // uma vez, independente do term em edicao.
  const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [termToDelete, setTermToDelete] = useState<PlanTermEntry | null>(null);
  const [termToArchive, setTermToArchive] = useState<PlanTermEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  // publicId do term em ação (publicar/aposentar) — para o spinner/disable do botão.
  const [actingTermId, setActingTermId] = useState<string | null>(null);

  // Paginacao lazy server-side: cada pagina vem ja ordenada por vigencia desc do
  // backend; nunca carregamos a lista inteira no cliente.
  const loadTerms = useCallback(async () => {
    if (!planPublicId) {
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(rows),
      });
      const response = await fetch(
        `/api/admin/plans/${planPublicId}/terms?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        setTerms([]);
        setTotalRecords(0);
        setStatusMessage("Falha ao carregar condicoes comerciais.");
        return;
      }
      const result = (await response.json()) as PaginatedResult<PlanTermEntry>;
      setTerms(result.items);
      setTotalRecords(result.totalRecords);
    } finally {
      setLoading(false);
    }
  }, [planPublicId, page, rows]);

  function handlePage(event: SgDatatablePageEvent) {
    // event.page e 1-based; o backend usa 0-based.
    setPage(event.page - 1);
    setRows(event.rows);
  }

  useEffect(() => {
    if (accessLoading || !canView || !planPublicId) {
      return;
    }
    void loadTerms();
  }, [accessLoading, canView, planPublicId, loadTerms]);

  // Carrega o nome do plano para exibir como contexto acima da tabela.
  useEffect(() => {
    if (accessLoading || !canView || !planPublicId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/admin/plans/${planPublicId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const plan = (await response.json()) as PlanEntry;
        if (!cancelled) {
          setPlanName(plan.name);
        }
      } catch {
        // Sem nome do plano a tela ainda funciona; apenas nao exibe o titulo.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessLoading, canView, planPublicId]);

  // Catalogo de permissoes CLIENT pro treeview -- carregado uma vez (independe de qual term
  // esta sendo editado), so quando a tela tem permissao pra criar ou editar condicoes.
  useEffect(() => {
    if (accessLoading || (!canCreate && !canEdit)) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/admin/security/permissions?audience=client", {
          cache: "no-store",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const options = (await response.json()) as PermissionOption[];
        if (!cancelled) {
          setPermissionOptions(options);
        }
      } catch {
        // Sem catalogo, o treeview so fica vazio -- o resto da tela segue funcionando.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessLoading, canCreate, canEdit]);

  function openCreate() {
    setEditing(null);
    // Nasce com TUDO marcado -- e' mais facil desmarcar o que NAO entra no plano do que marcar
    // uma por uma (pedido do usuario). So risca do gate de features: um plano novo criado sem
    // ninguem mexer no treeview ainda libera tudo, nunca bloqueia por esquecimento.
    setForm({
      ...EMPTY_FORM,
      meterRows: toMeterRows(declaredMeters, []),
      permissionPublicIds: permissionOptions
        .filter((option) => SELLABLE_PERMISSION_NAMES.has(option.name))
        .map((option) => option.publicId),
    });
    setPermissionSearch("");
    setStatusMessage(null);
    setDialogOpen(true);
  }

  function openEdit(term: PlanTermEntry) {
    setEditing(term);
    setForm({
      monthlyPrice: String(term.monthlyPrice),
      maxUsers: term.maxUsers == null ? "" : String(term.maxUsers),
      meterRows: toMeterRows(declaredMeters, term.meters),
      benefits: featuresJsonToBenefitsText(term.featuresJson),
      effectiveFrom: term.effectiveFrom?.slice(0, 10) ?? "",
      permissionPublicIds: term.permissionPublicIds ?? [],
    });
    setPermissionSearch("");
    setStatusMessage(null);
    setDialogOpen(true);
  }

  async function submitTerm() {
    if (!planPublicId) {
      return;
    }

    const monthlyPrice = parseDecimalInput(form.monthlyPrice);
    const maxUsers = form.maxUsers.trim() ? Number.parseInt(form.maxUsers, 10) : null;
    const { meters, error: metersError } = toMeterPayload(form.meterRows, true);

    if (monthlyPrice == null) {
      setStatusMessage("Informe um preco mensal valido.");
      return;
    }
    if (metersError) {
      setStatusMessage(metersError);
      return;
    }
    if (!form.effectiveFrom) {
      setStatusMessage("Informe o inicio da vigencia.");
      return;
    }

    // Franquia e excedente vao por contador em `meters` (presente = substitui a lista: contador desligado
    // sai do plano). Os additionalAttributes do term nao sao tocados aqui.
    const payload = {
      monthlyPrice,
      meters,
      maxUsers,
      featuresJson: benefitsTextToFeaturesJson(form.benefits),
      // Meia-noite LOCAL da data escolhida, com o offset local — assim o backend
      // (.toLocalDateTime()) grava 00:00 do dia certo, sem deslocar para UTC (que
      // empurraria para 03:00 e poderia adiantar o dia).
      effectiveFrom: toLocalMidnightIso(form.effectiveFrom),
      permissionPublicIds: form.permissionPublicIds,
    };

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const response = await fetch(
        editing
          ? `/api/admin/plans/${planPublicId}/terms/${editing.publicId}`
          : `/api/admin/plans/${planPublicId}/terms`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        setStatusMessage(text || "Falha ao salvar condicao comercial.");
        return;
      }

      // Salvar JA publica no Stripe. Se a publicacao falhar, o term fica salvo (nao publicado)
      // e o admin retenta pelo botao "Publicar" no grid — avisamos sem bloquear.
      const wasEditing = editing !== null;
      if (!wasEditing) {
        const created = (await response.json().catch(() => null)) as
          | { published?: boolean; publishError?: string | null }
          | null;
        if (created && created.published === false) {
          // Toast, nao statusMessage: o dialog fecha logo abaixo, e o statusMessage so
          // renderiza DENTRO do dialog - a mensagem se perderia no fechamento.
          toast.error(
            `Condicao salva, mas a publicacao no Stripe falhou${created.publishError ? `: ${created.publishError}` : ""}. Use "Publicar" no grid para retentar.`,
          );
        } else {
          toast.success("Condicao comercial criada e publicada no Stripe.");
        }
      } else {
        toast.success("Condicao comercial atualizada.");
      }

      setDialogOpen(false);
      setEditing(null);
      // Ao criar, volta para a 1a pagina (ordem desc -> a nova aparece no topo).
      // Se ja estamos na 1a pagina, recarrega manualmente.
      if (!wasEditing && page !== 0) {
        setPage(0);
      } else {
        await loadTerms();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    const term = termToDelete;
    if (!term || !planPublicId) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/plans/${planPublicId}/terms/${term.publicId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao excluir condicao comercial.");
        return;
      }
      toast.success("Condicao comercial excluida.");
      await loadTerms();
    } finally {
      setDeleting(false);
      setTermToDelete(null);
    }
  }

  // Publica a condicao no Stripe (cria o Price + grava o providerPriceId). Retry idempotente.
  async function handlePublish(term: PlanTermEntry) {
    if (!planPublicId) {
      return;
    }
    setActingTermId(term.publicId);
    try {
      const response = await fetch(
        `/api/admin/plans/${planPublicId}/terms/${term.publicId}/publish`,
        { method: "POST" },
      );
      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao publicar no Stripe.");
        return;
      }
      toast.success("Condicao publicada no Stripe.");
      await loadTerms();
    } finally {
      setActingTermId(null);
    }
  }

  // Confirmacao da aposentadoria (operacao critica): so arquiva apos o usuario confirmar no dialog.
  async function confirmArchive() {
    const term = termToArchive;
    if (!term) {
      return;
    }
    await handleArchive(term);
    setTermToArchive(null);
  }

  // Aposenta a condicao: arquiva o Price no Stripe e fecha a vigencia (nao vende mais).
  async function handleArchive(term: PlanTermEntry) {
    if (!planPublicId) {
      return;
    }
    setActingTermId(term.publicId);
    try {
      const response = await fetch(
        `/api/admin/plans/${planPublicId}/terms/${term.publicId}/archive`,
        { method: "POST" },
      );
      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao aposentar a condicao.");
        return;
      }
      toast.success("Condicao aposentada.");
      await loadTerms();
    } finally {
      setActingTermId(null);
    }
  }

  const checkedPermissionSet = useMemo(
    () => new Set(form.permissionPublicIds),
    [form.permissionPublicIds],
  );

  /**
   * Arvore de permissoes CLIENT que este term pode liberar, na hierarquia do menu do client
   * (lib/client-permission-tree.ts) — mesmo padrao de montagem do treeview de role
   * (role_edit/page.tsx), so que aqui "marcado" significa "o plano libera esta feature", nao
   * "o usuario tem esta permissao".
   */
  const fullPermissionTree = useMemo<SgTreeNode[]>(() => {
    const byName = new Map(permissionOptions.map((option) => [option.name, option]));
    const label = (text: string, checked: number, total: number) =>
      checked > 0 ? `${text} — ${checked} de ${total}` : text;

    const nodes: SgTreeNode[] = [];
    for (const group of CLIENT_PERMISSION_MENU_TREE) {
      // "Treinar IA" e' modo debug; "Seguranca"/"Menu do usuario" sao administracao basica da
      // propria conta; "Extrato de solicitacoes" e' so' consulta de uso, nao uma feature em si --
      // nenhum dos tres e' vendavel por plano, entao nem aparecem aqui pro admin marcar (pedido do
      // usuario, 2026-09-03).
      if (NOT_SELLABLE_GROUPS.has(group.id)) {
        continue;
      }
      const screenNodes: SgTreeNode[] = [];
      let groupChecked = 0;
      let groupTotal = 0;

      for (const screen of group.screens) {
        const leaves: SgTreeNode[] = [];
        let screenChecked = 0;
        for (const action of screen.actions) {
          const option = byName.get(action.permission);
          if (!option) {
            continue;
          }
          leaves.push({ id: option.publicId, label: `${action.label} (${action.permission})` });
          if (checkedPermissionSet.has(option.publicId)) {
            screenChecked += 1;
          }
        }
        if (!leaves.length) {
          continue;
        }
        screenNodes.push({
          id: screen.id,
          label: label(screen.label, screenChecked, leaves.length),
          children: leaves,
        });
        groupChecked += screenChecked;
        groupTotal += leaves.length;
      }

      if (screenNodes.length) {
        nodes.push({
          id: group.id,
          label: label(group.label, groupChecked, groupTotal),
          children: screenNodes,
        });
      }
    }

    // Sem no "Outras permissoes" aqui (ao contrario do treeview de role): uma Permission orfa do
    // catalogo de menu nao tem contexto pro admin decidir se ela deveria ser uma feature vendavel
    // -- fica de fora ate ganhar uma entrada de verdade em client-permission-tree.ts.
    return nodes;
  }, [permissionOptions, checkedPermissionSet]);

  // A contagem e' das features que a arvore mostra; permissao antiga fora do catalogo nao entra no numero.
  const sellableCheckedCount = useMemo(
    () =>
      permissionOptions.filter(
        (option) => SELLABLE_PERMISSION_NAMES.has(option.name) && checkedPermissionSet.has(option.publicId),
      ).length,
    [permissionOptions, checkedPermissionSet],
  );

  const searchingPermissions = permissionSearch.trim().length > 0;
  const visiblePermissionTree = useMemo(
    () => filterTree(fullPermissionTree, permissionSearch),
    [fullPermissionTree, permissionSearch],
  );
  const effectivePermissionExpandedIds = useMemo(
    () => (searchingPermissions ? branchIds(visiblePermissionTree) : expandedIds),
    [searchingPermissions, visiblePermissionTree, expandedIds],
  );
  const allPermissionsExpanded =
    !searchingPermissions && expandedIds.length >= branchIds(fullPermissionTree).length;

  /** So os ids que sao permissao de verdade: a arvore devolve os galhos marcados junto. */
  function applyCheckedPermissionIds(ids: string[]) {
    const validIds = new Set(permissionOptions.map((option) => option.publicId));
    setForm((current) => ({
      ...current,
      permissionPublicIds: ids.filter((id) => validIds.has(id)),
    }));
  }

  const columns: SgDatatableColumn<PlanTermEntry>[] = useMemo(
    () => [
      {
        columnId: "term-price",
        header: "Preco mensal",
        align: "right",
        body: (row) => formatCurrency(row.monthlyPrice),
      },
      {
        columnId: "term-meters",
        header: "Contadores (franquia + excedente)",
        body: (row) => formatTermMeters(row.meters),
      },
      {
        columnId: "term-users",
        header: "Usuarios",
        align: "right",
        body: (row) => (row.maxUsers == null ? "-" : String(row.maxUsers)),
      },
      {
        columnId: "term-stripe-price",
        header: "Stripe price ID",
        body: (row) => row.providerPriceId?.trim() || "(nao publicado)",
      },
      {
        columnId: "term-effective",
        header: "Vigencia",
        body: (row) =>
          row.status === "CURRENT"
            ? `${formatDateTime(row.effectiveFrom)} - atual`
            : formatDateTime(row.effectiveFrom),
      },
      {
        columnId: "term-status",
        header: "Status",
        body: (row) => (
          <StatusBadge
            severity={STATUS_META[row.status].severity}
            value={STATUS_META[row.status].label}
          />
        ),
      },
      {
        columnId: "term-actions",
        header: "Acoes",
        hideable: false,
        body: (row) => {
          const published = row.published;
          const ended = row.status === "ENDED";
          const acting = actingTermId === row.publicId;
          return (
            <SgStack direction="row" gap={4}>
              {canEdit && row.status === "SCHEDULED" ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Editar condicao"
                  title="Editar condicao"
                  iconOnly
                  leftIcon={<Pencil size={16} />}
                  onClick={() => openEdit(row)}
                  severity="secondary"
                />
              ) : null}
              {/* Publicar: quando ainda nao foi pro Stripe (retry do save). */}
              {canPublish && !published && !ended ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Publicar no Stripe"
                  title="Publicar no Stripe"
                  iconOnly
                  leftIcon={<Upload size={16} />}
                  loading={acting}
                  onClick={() => void handlePublish(row)}
                  severity="primary"
                />
              ) : null}
              {/* Aposentar: arquiva o Price e fecha a vigencia (abre confirmacao — operacao critica). */}
              {canArchive && published && !ended ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Aposentar condicao"
                  title="Aposentar condicao (arquiva no Stripe e encerra a vigencia)"
                  iconOnly
                  leftIcon={<Archive size={16} />}
                  loading={acting}
                  onClick={() => setTermToArchive(row)}
                  severity="secondary"
                />
              ) : null}
              {canDelete && row.status === "SCHEDULED" ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Excluir condicao"
                  title="Excluir condicao"
                  iconOnly
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => setTermToDelete(row)}
                  severity="danger"
                />
              ) : null}
            </SgStack>
          );
        },
      },
    ],
    [canEdit, canDelete, canPublish, canArchive, actingTermId],
  );

  if (!accessLoading && !canView) {
    return (
      <Shell
        eyebrow="Comercial"
        title="Condicoes comerciais"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar condicoes comerciais."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Comercial"
      title="Condicoes comerciais"
      description="Historico de precos e franquias vigentes deste plano."
    >
      <SgCard
        cardStyle="outlined"
        title="Condicoes do plano"
        description="A condicao mais recente ja em vigor e a vigente; datas futuras ficam agendadas."
      >
        <SgStack gap={16}>
          <SgStack align="center" direction="row" justify="between" wrap>
            <SgButton
              appearance="ghost"
              label="Voltar para planos"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.push("/plans/plan_list")}
              severity="secondary"
            />
            {canCreate ? (
              <SgButton
                appearance="outline"
                label="Novo"
                leftIcon={<Plus size={16} />}
                onClick={openCreate}
                severity="secondary"
                size="md"
                style={{ height: 44 }}
              />
            ) : null}
          </SgStack>

          {statusMessage ? (
            <StatusBadge severity="info" value={statusMessage} />
          ) : null}

          {planName ? (
            <SgStack gap={2}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--sg-color-text-muted, #6b7280)",
                }}
              >
                Plano
              </span>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{planName}</span>
            </SgStack>
          ) : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={280} shape="rectangle" />
          ) : (
            <SgDatatable
              columns={columns}
              dataKey="publicId"
              emptyMessage="Nenhuma condicao comercial cadastrada."
              first={page * rows}
              id="plan-terms-table"
              lazy
              loading={loading}
              onPage={handlePage}
              paginator
              rows={rows}
              rowsPerPageOptions={[8, 16, 24, 48]}
              showGridlines
              stripedRows
              totalRecords={totalRecords}
              value={terms}
            />
          )}
        </SgStack>
      </SgCard>

      <SgDialog
        closeOnOverlayClick
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditing(null);
          }
        }}
        open={dialogOpen}
        size="md"
        title={editing ? "Editar condicao agendada" : "Nova condicao comercial"}
      >
        <SgStack gap={16}>
          <SgInputCurrency
            id="term-monthly-price"
            label="Preco mensal"
            currency="BRL"
            decimals={2}
            minValue={0}
            inputProps={{ value: form.monthlyPrice }}
            onChange={(monthlyPrice) =>
              setForm((current) => ({ ...current, monthlyPrice }))
            }
          />
          <div>
            <SgInputNumber
              id="term-max-users"
              label="Usuarios"
              decimals={0}
              minValue={0}
              inputProps={{ value: form.maxUsers }}
              onChange={(maxUsers) => setForm((current) => ({ ...current, maxUsers }))}
            />
            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#dc2626" }}>
              * zero nao limita o numero de usuarios
            </p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Contadores de uso</p>
            <MeterQuotaEditor
              idPrefix="term-meter"
              rows={form.meterRows}
              onChange={(meterRows) => setForm((current) => ({ ...current, meterRows }))}
              allowOverage
            />
          </div>
          {/* Stripe price ID nao e mais digitado: salvar JA cria o Price no Stripe (publish). */}
          <SgInputTextArea
            id="term-benefits"
            label="Beneficios (um por linha)"
            hintText="Cada linha vira um item de beneficio exibido na tela de planos do cliente."
            maxLines={5}
            textareaProps={{ value: form.benefits }}
            onChange={(benefits) =>
              setForm((current) => ({ ...current, benefits }))
            }
          />
          <SgInputDate
            id="term-effective-from"
            label="Inicio da vigencia"
            inputProps={{ value: form.effectiveFrom }}
            onChange={(effectiveFrom) =>
              setForm((current) => ({ ...current, effectiveFrom }))
            }
          />

          <SgStack gap={8}>
            <SgInputTextSearch
              id="term-permissions-search"
              label="Features deste plano"
              hintText="Marque as telas/acoes que este plano libera. Mesmo com permissao de usuario, o que nao estiver marcado aqui fica bloqueado pra quem estiver neste plano."
              minChars={1}
              placeholder="Por tela, botao ou permissao (ex.: dashboard, DASHBOARD_READ)"
              prefixIcon={null}
              onChange={setPermissionSearch}
              onSearchChange={setPermissionSearch}
            />
            <SgStack align="center" direction="row" gap={12} justify="between" wrap>
              <StatusBadge
                severity={form.permissionPublicIds.length > 0 ? "info" : "neutral"}
                value={`${sellableCheckedCount} feature(s) liberada(s) neste plano`}
              />
              <SgButton
                appearance="ghost"
                label={allPermissionsExpanded ? "Recolher tudo" : "Expandir tudo"}
                leftIcon={
                  allPermissionsExpanded ? (
                    <ChevronsDownUp size={16} />
                  ) : (
                    <ChevronsUpDown size={16} />
                  )
                }
                onClick={() =>
                  setExpandedIds(allPermissionsExpanded ? [] : branchIds(fullPermissionTree))
                }
                severity="secondary"
                disabled={searchingPermissions}
              />
            </SgStack>
            <SgTreeView
              nodes={visiblePermissionTree}
              checkable
              checkedIds={form.permissionPublicIds}
              onCheckedChange={applyCheckedPermissionIds}
              expandedIds={effectivePermissionExpandedIds}
              onExpandedChange={(ids) => {
                if (!searchingPermissions) {
                  setExpandedIds(ids);
                }
              }}
              branchLabelBehavior="toggle"
              emptyText="Nenhuma permissao para esse filtro."
              maxHeightClassName="max-h-[320px]"
              size="sm"
            />
          </SgStack>

          {statusMessage ? (
            <StatusBadge severity="danger" value={statusMessage} />
          ) : null}

          <SgButton
            appearance="outline"
            label={submitting ? "Salvando..." : editing ? "Salvar" : "Salvar e publicar"}
            leftIcon={<Save size={16} />}
            onClick={() => void submitTerm()}
            severity="secondary"
          />
        </SgStack>
      </SgDialog>

      <SgConfirmationDialog
        open={termToDelete !== null}
        severity="danger"
        title="Excluir condicao comercial"
        message="Tem certeza que deseja excluir esta condicao agendada? Esta acao nao pode ser desfeita."
        confirmButton={{
          label: deleting ? "Excluindo..." : "Excluir",
          severity: "danger",
          disabled: deleting,
        }}
        cancelButton={{ label: "Cancelar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setTermToDelete(null)}
      />

      <SgConfirmationDialog
        open={termToArchive !== null}
        severity="danger"
        title="Aposentar condicao comercial"
        message="Tem certeza que deseja aposentar esta condicao? O preco sera arquivado no Stripe e a vigencia encerrada — o plano deixa de ser vendido por esta condicao. Esta acao nao pode ser desfeita."
        confirmButton={{
          label: actingTermId !== null ? "Aposentando..." : "Aposentar",
          severity: "danger",
          disabled: actingTermId !== null,
        }}
        cancelButton={{ label: "Cancelar", disabled: actingTermId !== null }}
        closeOnConfirm={false}
        onConfirm={() => void confirmArchive()}
        onCancel={() => setTermToArchive(null)}
      />
    </Shell>
  );
}

// Converte a data (YYYY-MM-DD) do SgInputDate em um ISO de meia-noite LOCAL com o
// offset do navegador (ex.: 2026-06-21T00:00:00-03:00). Diferente de
// new Date(...).toISOString(), que normaliza para UTC e empurraria o horario (e ate
// o dia) para frente. O backend recebe OffsetDateTime e faz toLocalDateTime(),
// preservando 00:00 do dia escolhido.
function toLocalMidnightIso(date: string): string {
  const offsetMinutes = new Date(`${date}T00:00:00`).getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${date}T00:00:00${sign}${hh}:${mm}`;
}
