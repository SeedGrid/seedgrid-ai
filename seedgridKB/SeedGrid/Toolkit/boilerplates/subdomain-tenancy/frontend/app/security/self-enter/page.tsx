"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgDialog,
  SgInputText,
  SgMultiSelectChips,
  SgSkeleton,
  SgStack,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import {
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Save,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { formatDateTime } from "@/lib/format";
import type { RoleSummary } from "@/lib/seedgrid-app-api";
import type {
  EntryRequestResponse,
  EntryRequestStatus,
  InvitationEntry,
  SelfEnterPublicLink,
} from "@/lib/self-enter";

const STATUS_META: Record<
  EntryRequestStatus,
  { label: string; severity: "info" | "success" | "warning" | "danger" | "secondary" }
> = {
  PENDING_EMAIL: { label: "Aguardando e-mail", severity: "warning" },
  PENDING_APPROVAL: { label: "Aguardando aprovacao", severity: "info" },
  APPROVED: { label: "Aprovado", severity: "success" },
  REJECTED: { label: "Reprovado", severity: "danger" },
  EXPIRED: { label: "Expirado", severity: "secondary" },
};

const EMPTY_FORM = { email: "", name: "", roles: [] as string[] };

// Rota publica do cadastro sem convite (app/auth/self-enter sem `token`).
const PUBLIC_SIGNUP_PATH = "/auth/self-enter";


export default function SelfEnterPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canInvite = hasPermission(ADMIN_PERMISSIONS.selfEnterInvite);
  const canApprove = hasPermission(ADMIN_PERMISSIONS.selfEnterApprove);
  const canReject = hasPermission(ADMIN_PERMISSIONS.selfEnterReject);
  const canView = canInvite || canApprove || canReject;

  const [roleOptions, setRoleOptions] = useState<RoleSummary[]>([]);
  const [invitations, setInvitations] = useState<InvitationEntry[]>([]);
  const [approvals, setApprovals] = useState<EntryRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // publicId do registro em ação (aprovar/reprovar/reenviar) — controla spinner/disable.
  const [actingId, setActingId] = useState<string | null>(null);
  const [toReject, setToReject] = useState<EntryRequestResponse | null>(null);
  // Cadastro PUBLICO chega sem perfil e a default-role do backend fica em branco: aprovar sem
  // escolher perfil falharia com 422. Quem aprova escolhe os perfis neste dialogo.
  const [toApprove, setToApprove] = useState<EntryRequestResponse | null>(null);
  const [approveRoles, setApproveRoles] = useState<string[]>([]);
  const [approveError, setApproveError] = useState<string | null>(null);
  // Link publico de cadastro (so' quando `public-enabled` esta ligado no backend).
  const [publicLinkUrl, setPublicLinkUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    // Cada seção carrega de forma independente: uma falha (ex.: 403 nas aprovações) não pode
    // zerar as demais — em especial a lista de perfis do convite.
    const [invRes, apprRes, rolesRes] = await Promise.allSettled([
      canInvite
        ? adminProxyClient.get<InvitationEntry[]>("/api/security/self-enter/invitations")
        : Promise.resolve<InvitationEntry[]>([]),
      canApprove || canReject
        ? adminProxyClient.get<EntryRequestResponse[]>(
            "/api/security/self-enter/requests/to-approve",
          )
        : Promise.resolve<EntryRequestResponse[]>([]),
      // Perfis: o convite usa e a aprovacao de cadastro PUBLICO (que chega sem perfil) tambem.
      canInvite || canApprove
        ? adminProxyClient.get<RoleSummary[]>("/api/security/roles/options")
        : Promise.resolve<RoleSummary[]>([]),
    ]);

    const errors: string[] = [];
    if (invRes.status === "fulfilled") setInvitations(invRes.value);
    else errors.push(extractApiErrorMessage(invRes.reason) ?? "Falha ao carregar convites.");
    if (apprRes.status === "fulfilled") setApprovals(apprRes.value);
    else errors.push(extractApiErrorMessage(apprRes.reason) ?? "Falha ao carregar aprovacoes.");
    if (rolesRes.status === "fulfilled") setRoleOptions(rolesRes.value);
    else errors.push(extractApiErrorMessage(rolesRes.reason) ?? "Falha ao carregar perfis.");

    setStatusMessage(errors.length > 0 ? errors.join(" ") : null);
    setLoading(false);
  }, [canInvite, canApprove, canReject]);

  useEffect(() => {
    if (accessLoading) {
      return;
    }
    if (!canView) {
      setLoading(false);
      return;
    }
    void loadAll();
  }, [accessLoading, canView, loadAll]);

  // Perfil de integracao (so' para API key) nao se atribui a usuario: o backend recusa na
  // aprovacao, entao nem aparece como opcao do convite.
  // O link publico e' independente das listas: falha aqui so' esconde o card, sem mensagem.
  useEffect(() => {
    if (accessLoading || !(canInvite || canApprove)) {
      return;
    }
    void (async () => {
      try {
        const link = await adminProxyClient.get<SelfEnterPublicLink>(
          "/api/security/self-enter/public-link",
        );
        if (!link.publicEnabled) {
          setPublicLinkUrl(null);
          return;
        }
        // Mesmo host desta tela = subdominio da empresa. `?company=` so' quando o backend pede
        // (nulo no tenant por subdominio).
        const query = link.companyPublicId
          ? `?company=${encodeURIComponent(link.companyPublicId)}`
          : "";
        setPublicLinkUrl(`${window.location.origin}${PUBLIC_SIGNUP_PATH}${query}`);
      } catch {
        setPublicLinkUrl(null);
      }
    })();
  }, [accessLoading, canInvite, canApprove]);

  async function copyPublicLink() {
    if (!publicLinkUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(publicLinkUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Nao foi possivel copiar o link.");
    }
  }

  const roleSelectOptions = useMemo(
    () =>
      roleOptions
        .filter((role) => role.forIntegration !== true)
        .map((role) => ({ label: role.name, value: role.publicId })),
    [roleOptions],
  );

  function openInvite() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  }

  async function submitInvitation() {
    const email = form.email.trim();
    const name = form.name.trim();
    if (!email) {
      setFormError("Informe o e-mail do convidado.");
      return;
    }
    // A default-role do backend fica em branco (invite-only): sem ao menos um perfil, a aprovação
    // falharia com 422. Exigimos aqui para o operador não criar um convite que não pode ser aprovado.
    if (form.roles.length === 0) {
      setFormError("Escolha ao menos um perfil para o convidado.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      // Quem já tem conta não pode ser convidado: o self-enter (createInvitation/completeInvitation)
      // barra e-mail existente. Nesse caso o caminho é cadastrar o acesso em Usuarios.
      await adminProxyClient.post("/api/security/self-enter/invitations", {
        body: { email, name, roles: form.roles },
      });
      setDialogOpen(false);
      toast.success(`Convite enviado para ${email}.`);
      await loadAll();
    } catch (error) {
      setFormError(extractApiErrorMessage(error) ?? "Falha ao criar o convite.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendInvitation(requestId: string) {
    setActingId(requestId);
    try {
      await adminProxyClient.post(`/api/security/self-enter/invitations/${requestId}/resend`, {});
      toast.success("Convite reenviado.");
      await loadAll();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao reenviar o convite.");
    } finally {
      setActingId(null);
    }
  }

  // `roles` so' no cadastro PUBLICO: vai no corpo e vence a default-role. Convite (INVITE) segue
  // sem corpo — a aprovacao usa os perfis escolhidos no proprio convite.
  async function approve(request: EntryRequestResponse, roles?: string[]) {
    setActingId(request.id);
    try {
      await adminProxyClient.post(
        `/api/security/self-enter/requests/${request.id}/approve`,
        roles && roles.length > 0 ? { body: { roles } } : {},
      );
      toast.success(`Cadastro de ${request.email} aprovado.`);
      setToApprove(null);
      await loadAll();
    } catch (error) {
      const message = extractApiErrorMessage(error) ?? "Falha ao aprovar o cadastro.";
      if (roles) {
        setApproveError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setActingId(null);
    }
  }

  function startApprove(request: EntryRequestResponse) {
    if (request.origin === "PUBLIC") {
      setApproveRoles([]);
      setApproveError(null);
      setToApprove(request);
      return;
    }
    void approve(request);
  }

  function confirmApprove() {
    const request = toApprove;
    if (!request) {
      return;
    }
    if (approveRoles.length === 0) {
      setApproveError("Escolha ao menos um perfil para o novo usuario.");
      return;
    }
    void approve(request, approveRoles);
  }

  async function confirmReject() {
    const request = toReject;
    if (!request) {
      return;
    }
    setActingId(request.id);
    try {
      await adminProxyClient.post(`/api/security/self-enter/requests/${request.id}/reject`, {});
      toast.success(`Cadastro de ${request.email} reprovado.`);
      await loadAll();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao reprovar o cadastro.");
    } finally {
      setActingId(null);
      setToReject(null);
    }
  }

  const invitationColumns: SgDatatableColumn<InvitationEntry>[] = useMemo(
    () => [
      { columnId: "inv-name", header: "Nome", body: (row) => row.name || "-" },
      { columnId: "inv-email", header: "E-mail", body: (row) => row.email },
      {
        columnId: "inv-status",
        header: "Status",
        body: (row) => (
          <StatusBadge
            severity={STATUS_META[row.status].severity}
            value={STATUS_META[row.status].label}
          />
        ),
      },
      { columnId: "inv-invited-by", header: "Convidado por", body: (row) => row.invitedBy || "-" },
      {
        columnId: "inv-actions",
        header: "Acoes",
        hideable: false,
        body: (row) =>
          canInvite ? (
            <SgButton
              appearance="ghost"
              aria-label="Reenviar convite"
              title="Reenviar convite"
              iconOnly
              leftIcon={<RefreshCw size={16} />}
              loading={actingId === row.id}
              onClick={() => void resendInvitation(row.id)}
              severity="secondary"
            />
          ) : null,
      },
    ],
    [canInvite, actingId],
  );

  const approvalColumns: SgDatatableColumn<EntryRequestResponse>[] = useMemo(
    () => [
      { columnId: "ap-name", header: "Nome", body: (row) => row.name || "-" },
      { columnId: "ap-email", header: "E-mail", body: (row) => row.email },
      {
        columnId: "ap-origin",
        header: "Origem",
        body: (row) => (row.origin === "INVITE" ? "Convite" : "Publico"),
      },
      {
        columnId: "ap-status",
        header: "Status",
        body: (row) => (
          <StatusBadge
            severity={STATUS_META[row.status].severity}
            value={STATUS_META[row.status].label}
          />
        ),
      },
      {
        columnId: "ap-requested",
        header: "Solicitado em",
        body: (row) => formatDateTime(row.requestedAt),
      },
      {
        columnId: "ap-actions",
        header: "Acoes",
        hideable: false,
        body: (row) => {
          const acting = actingId === row.id;
          return (
            <SgStack direction="row" gap={4}>
              {canApprove ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Aprovar cadastro"
                  title="Aprovar cadastro"
                  iconOnly
                  leftIcon={<CheckCircle2 size={16} />}
                  loading={acting}
                  onClick={() => startApprove(row)}
                  severity="primary"
                />
              ) : null}
              {canReject ? (
                <SgButton
                  appearance="ghost"
                  aria-label="Reprovar cadastro"
                  title="Reprovar cadastro"
                  iconOnly
                  leftIcon={<XCircle size={16} />}
                  loading={acting}
                  onClick={() => setToReject(row)}
                  severity="danger"
                />
              ) : null}
            </SgStack>
          );
        },
      },
    ],
    [canApprove, canReject, actingId],
  );

  if (!accessLoading && !canView) {
    return (
      <Shell
        eyebrow="Seguranca"
        title="Convidar usuario externo"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para convidar usuarios externos."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Seguranca"
      title="Convidar usuario externo"
      description="Convide novos usuarios para esta conta e aprove os cadastros pendentes."
    >
      <SgStack gap={16}>
        {statusMessage ? <StatusBadge severity="info" value={statusMessage} /> : null}

        {publicLinkUrl ? (
          <SgCard
            cardStyle="outlined"
            title="Link publico de cadastro"
            description="Quem se cadastrar por este link aguarda a aprovacao nesta tela."
          >
            <SgStack align="center" direction="row" gap={12} wrap>
              <code
                style={{
                  flex: 1,
                  minWidth: 240,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgb(var(--sg-border))",
                  background: "rgb(var(--sg-surface))",
                  color: "rgb(var(--sg-text))",
                  fontSize: 14,
                  wordBreak: "break-all",
                }}
              >
                {publicLinkUrl}
              </code>
              <SgButton
                appearance="outline"
                label={linkCopied ? "Copiado!" : "Copiar"}
                leftIcon={<Copy size={16} />}
                onClick={() => void copyPublicLink()}
                severity="secondary"
              />
            </SgStack>
          </SgCard>
        ) : null}

        {canInvite ? (
          <SgCard
            cardStyle="outlined"
            title="Convites"
            description="Convites de auto-cadastro pendentes de conclusao."
          >
            <SgStack gap={16}>
              <SgStack align="center" direction="row" justify="between" wrap>
                <SgButton
                  appearance="ghost"
                  label="Atualizar"
                  leftIcon={<RefreshCw size={16} />}
                  onClick={() => void loadAll()}
                  severity="secondary"
                />
                <SgButton
                  appearance="outline"
                  label="Novo convite"
                  leftIcon={<Plus size={16} />}
                  onClick={openInvite}
                  severity="secondary"
                  size="md"
                  style={{ height: 44 }}
                />
              </SgStack>

              {loading ? (
                <SgSkeleton borderRadius={16} height={220} shape="rectangle" />
              ) : (
                <SgDatatable
                  columns={invitationColumns}
                  dataKey="id"
                  emptyMessage="Nenhum convite pendente."
                  id="self-enter-invitations"
                  showGridlines
                  stripedRows
                  value={invitations}
                />
              )}
            </SgStack>
          </SgCard>
        ) : null}

        {canApprove || canReject ? (
          <SgCard
            cardStyle="outlined"
            title="Aprovacoes pendentes"
            description="Cadastros que confirmaram o e-mail e aguardam aprovacao."
          >
            {loading ? (
              <SgSkeleton borderRadius={16} height={220} shape="rectangle" />
            ) : (
              <SgDatatable
                columns={approvalColumns}
                dataKey="id"
                emptyMessage="Nenhum cadastro aguardando aprovacao."
                id="self-enter-approvals"
                showGridlines
                stripedRows
                value={approvals}
              />
            )}
          </SgCard>
        ) : null}
      </SgStack>

      <SgDialog
        closeOnOverlayClick
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
          }
        }}
        open={dialogOpen}
        size="md"
        title="Novo convite"
      >
        <SgStack gap={16}>
          <SgInputText
            id="invite-email"
            label="E-mail"
            inputProps={{ value: form.email, type: "email" }}
            onChange={(email) => setForm((current) => ({ ...current, email }))}
          />
          <SgInputText
            id="invite-name"
            label="Nome"
            inputProps={{ value: form.name }}
            onChange={(name) => setForm((current) => ({ ...current, name }))}
          />
          <SgMultiSelectChips
            id="invite-roles"
            label="Perfis"
            required
            searchable
            clearable
            placeholder="Escolha ao menos um perfil"
            options={roleSelectOptions}
            value={form.roles}
            onChange={(value) =>
              setForm((current) => ({ ...current, roles: value.map(String) }))
            }
          />

          {formError ? <StatusBadge severity="danger" value={formError} /> : null}

          <SgButton
            appearance="outline"
            label={submitting ? "Enviando..." : "Enviar convite"}
            leftIcon={<Send size={16} />}
            onClick={() => void submitInvitation()}
            severity="secondary"
          />
        </SgStack>
      </SgDialog>


      <SgDialog
        closeOnOverlayClick
        onOpenChange={(open) => {
          if (!open && actingId === null) {
            setToApprove(null);
          }
        }}
        open={toApprove !== null}
        size="md"
        title="Aprovar cadastro"
      >
        <SgStack gap={16}>
          <StatusBadge
            severity="info"
            value={
              toApprove
                ? `${toApprove.name || toApprove.email} se cadastrou pelo link publico, sem perfil. Escolha os perfis do novo usuario.`
                : ""
            }
          />
          <SgMultiSelectChips
            id="approve-roles"
            label="Perfis"
            required
            searchable
            clearable
            placeholder="Escolha ao menos um perfil"
            options={roleSelectOptions}
            value={approveRoles}
            onChange={(value) => setApproveRoles(value.map(String))}
          />

          {approveError ? <StatusBadge severity="danger" value={approveError} /> : null}

          <SgButton
            appearance="outline"
            label={actingId !== null ? "Aprovando..." : "Aprovar"}
            leftIcon={<CheckCircle2 size={16} />}
            disabled={actingId !== null || approveRoles.length === 0}
            onClick={confirmApprove}
            severity="primary"
          />
        </SgStack>
      </SgDialog>

      <SgConfirmationDialog
        open={toReject !== null}
        severity="danger"
        title="Reprovar cadastro"
        message="Tem certeza que deseja reprovar este cadastro? Esta acao nao pode ser desfeita."
        confirmButton={{
          label: actingId !== null ? "Reprovando..." : "Reprovar",
          severity: "danger",
          disabled: actingId !== null,
        }}
        cancelButton={{ label: "Cancelar", disabled: actingId !== null }}
        closeOnConfirm={false}
        onConfirm={() => void confirmReject()}
        onCancel={() => setToReject(null)}
      />
    </Shell>
  );
}
