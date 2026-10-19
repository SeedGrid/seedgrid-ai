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
import type { PlatformAccessLookup, RoleSummary } from "@/lib/seedgrid-app-api";
import {
  buildSelfEnterPublicLink,
  SELF_ENTER_PAGE_PATH,
  type EntryRequestResponse,
  type EntryRequestStatus,
  type InvitationEntry,
  type SelfEnterPublicLink,
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

type ExistingAccount = Extract<PlatformAccessLookup, { exists: true }>;

// Resposta do BFF `/api/admin/self-enter/public-link`: o do backend + a base do app do cliente.
type AdminPublicLink = SelfEnterPublicLink & { clientAppBaseUrl: string | null };

/**
 * Link publico de cadastro. O formulario mora no APP DO CLIENTE (`frontend`, /auth/self-enter) — o
 * `seedgrid.security.frontend.base-url` e' um so' e aponta para ele —, entao o origin deste admin
 * nao serve. Com `SEEDGRID_CLIENT_APP_BASE_URL` definida o link sai completo; sem ela, so' o caminho.
 */
function resolvePublicLink(link: AdminPublicLink): { url: string; complete: boolean } {
  if (link.clientAppBaseUrl) {
    return { url: buildSelfEnterPublicLink(link.clientAppBaseUrl, link.companyPublicId), complete: true };
  }
  const query = link.companyPublicId ? `?company=${encodeURIComponent(link.companyPublicId)}` : "";
  return { url: `${SELF_ENTER_PAGE_PATH}${query}`, complete: false };
}

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
  // Pedido PUBLICO em aprovacao: nao traz perfil (e a default-role deste deploy e' a sentinela
  // NO_DEFAULT_ROLE), entao quem aprova escolhe aqui os perfis, enviados como `roles` no approve.
  const [toApprove, setToApprove] = useState<EntryRequestResponse | null>(null);
  const [approveRoles, setApproveRoles] = useState<string[]>([]);
  // E-mail do convite já tem conta no produto: em vez do convite (que o self-enter barra), a ação
  // passa a ser conceder acesso à plataforma ao usuário existente.
  const [existingAccount, setExistingAccount] = useState<ExistingAccount | null>(null);
  // Link do cadastro publico (sem convite); null quando o cadastro publico esta desligado.
  const [publicLink, setPublicLink] = useState<{ url: string; complete: boolean } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    // Cada seção carrega de forma independente: uma falha (ex.: 403 nas aprovações) não pode
    // zerar as demais — em especial a lista de perfis do convite.
    const [invRes, apprRes, rolesRes, linkRes] = await Promise.allSettled([
      canInvite
        ? adminProxyClient.get<InvitationEntry[]>("/api/admin/self-enter/invitations")
        : Promise.resolve<InvitationEntry[]>([]),
      canApprove || canReject
        ? adminProxyClient.get<EntryRequestResponse[]>(
            "/api/admin/self-enter/requests/to-approve",
          )
        : Promise.resolve<EntryRequestResponse[]>([]),
      // Perfis servem ao convite E a aprovacao de pedido publico (que nao traz perfil).
      canInvite || canApprove
        ? adminProxyClient.get<RoleSummary[]>(
            "/api/admin/security/roles/options?audience=platform",
          )
        : Promise.resolve<RoleSummary[]>([]),
      adminProxyClient.get<AdminPublicLink>("/api/admin/self-enter/public-link"),
    ]);

    const errors: string[] = [];
    if (invRes.status === "fulfilled") setInvitations(invRes.value);
    else errors.push(extractApiErrorMessage(invRes.reason) ?? "Falha ao carregar convites.");
    if (apprRes.status === "fulfilled") setApprovals(apprRes.value);
    else errors.push(extractApiErrorMessage(apprRes.reason) ?? "Falha ao carregar aprovacoes.");
    if (rolesRes.status === "fulfilled") setRoleOptions(rolesRes.value);
    else errors.push(extractApiErrorMessage(rolesRes.reason) ?? "Falha ao carregar perfis.");
    // Link publico e' complemento: se falhar, o card so' nao aparece (sem poluir a mensagem de erro).
    setPublicLink(
      linkRes.status === "fulfilled" && linkRes.value.publicEnabled
        ? resolvePublicLink(linkRes.value)
        : null,
    );

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

  const roleSelectOptions = useMemo(
    () => roleOptions.map((role) => ({ label: role.name, value: role.publicId })),
    [roleOptions],
  );

  async function copyPublicLink() {
    if (!publicLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(publicLink.url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Nao foi possivel copiar. Selecione o link e copie manualmente.");
    }
  }

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
      // barra e-mail existente e o convidado fica preso na tela "Concluir cadastro" com
      // "Usuario ja existe com email". Nesse caso o caminho é conceder acesso à plataforma.
      const existing = await lookupExistingAccount(email);
      if (existing) {
        setExistingAccount(existing);
        return;
      }

      await adminProxyClient.post("/api/admin/self-enter/invitations", {
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

  /**
   * Consulta se o e-mail já tem conta. Best-effort: se a consulta falhar, devolve null e o fluxo
   * segue no convite normal — uma falha aqui não pode impedir de convidar (o backend ainda valida).
   */
  async function lookupExistingAccount(email: string): Promise<ExistingAccount | null> {
    try {
      const lookup = await adminProxyClient.get<PlatformAccessLookup>(
        `/api/admin/platform-access?email=${encodeURIComponent(email)}`,
      );
      return lookup.exists ? lookup : null;
    } catch {
      return null;
    }
  }

  async function confirmGrantPlatformAccess() {
    const account = existingAccount;
    if (!account) {
      return;
    }
    setSubmitting(true);
    try {
      await adminProxyClient.post("/api/admin/platform-access", {
        body: { email: account.email, rolePublicIds: form.roles },
      });
      setExistingAccount(null);
      setDialogOpen(false);
      toast.success(
        `Acesso a plataforma concedido para ${account.email}. Ele entra com a senha que ja usa. ` +
          "Se ele representa um parceiro, atribua o parceiro em Seguranca > Usuarios.",
      );
      await loadAll();
    } catch (error) {
      setExistingAccount(null);
      setFormError(extractApiErrorMessage(error) ?? "Falha ao conceder o acesso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendInvitation(requestId: string) {
    setActingId(requestId);
    try {
      await adminProxyClient.post(`/api/admin/self-enter/invitations/${requestId}/resend`, {});
      toast.success("Convite reenviado.");
      await loadAll();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao reenviar o convite.");
    } finally {
      setActingId(null);
    }
  }

  function approve(request: EntryRequestResponse) {
    // Convite ja' carrega os perfis escolhidos ao convidar: aprova direto, sem body.
    if (request.origin !== "PUBLIC") {
      void submitApproval(request);
      return;
    }
    setApproveRoles([]);
    setToApprove(request);
  }

  async function submitApproval(request: EntryRequestResponse, roles?: string[]) {
    setActingId(request.id);
    try {
      await adminProxyClient.post(
        `/api/admin/self-enter/requests/${request.id}/approve`,
        roles ? { body: { roles } } : {},
      );
      setToApprove(null);
      toast.success(`Cadastro de ${request.email} aprovado.`);
      await loadAll();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Falha ao aprovar o cadastro.");
    } finally {
      setActingId(null);
    }
  }

  async function confirmReject() {
    const request = toReject;
    if (!request) {
      return;
    }
    setActingId(request.id);
    try {
      await adminProxyClient.post(`/api/admin/self-enter/requests/${request.id}/reject`, {});
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
                  onClick={() => void approve(row)}
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

  const grantMessage = !existingAccount
    ? ""
    : existingAccount.hasPlatformAccess
      ? `${existingAccount.name} ja tem acesso a plataforma (perfis atuais: ${
          existingAccount.platformRoles.join(", ") || "nenhum"
        }). Substituir pelos perfis selecionados?`
      : `${existingAccount.name} ja tem conta no SeedGrid App com este e-mail, entao nao cabe um novo cadastro. Conceder acesso a plataforma com os perfis selecionados? A senha atual dele nao muda.`;

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
      title="Auto-cadastro"
      description="Convide novos usuarios e aprove os cadastros pendentes."
    >
      <SgStack gap={16}>
        {statusMessage ? <StatusBadge severity="info" value={statusMessage} /> : null}

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

        {publicLink ? (
          <SgCard
            cardStyle="outlined"
            title="Link publico de cadastro"
            description="Compartilhe para que novas pessoas pecam acesso sem convite."
          >
            <SgStack gap={12}>
              <code
                style={{
                  display: "block",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgb(var(--sg-border))",
                  background: "rgb(var(--sg-surface))",
                  color: "rgb(var(--sg-text))",
                  fontSize: 14,
                  wordBreak: "break-all",
                }}
              >
                {publicLink.url}
              </code>
              <SgStack direction="row" gap={12} wrap>
                <SgButton
                  appearance="outline"
                  label={linkCopied ? "Copiado!" : publicLink.complete ? "Copiar link" : "Copiar caminho"}
                  leftIcon={<Copy size={16} />}
                  onClick={() => void copyPublicLink()}
                  severity="secondary"
                />
              </SgStack>
              {publicLink.complete ? null : (
                <StatusBadge
                  severity="info"
                  value="O formulario publico fica no app do cliente: prefixe este caminho com o endereco dele (defina SEEDGRID_CLIENT_APP_BASE_URL no admin para o link sair completo)."
                />
              )}
              <p style={{ fontSize: 14, color: "var(--sg-muted, #6b7280)", margin: 0 }}>
                Quem se cadastrar por este link confirma o e-mail e fica aguardando aprovacao nesta
                tela, em &quot;Aprovacoes pendentes&quot;.
              </p>
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

      <SgConfirmationDialog
        open={existingAccount !== null}
        severity="info"
        title="E-mail ja cadastrado"
        message={grantMessage}
        confirmButton={{
          label: submitting ? "Concedendo..." : "Conceder acesso",
          severity: "primary",
          disabled: submitting,
        }}
        cancelButton={{ label: "Cancelar", disabled: submitting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmGrantPlatformAccess()}
        onCancel={() => setExistingAccount(null)}
      />

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
                ? `${toApprove.name || toApprove.email} se cadastrou pelo link publico, sem perfil. Escolha os perfis que ele recebe ao ser aprovado.`
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
          <SgButton
            appearance="outline"
            label={actingId !== null ? "Aprovando..." : "Aprovar"}
            leftIcon={<CheckCircle2 size={16} />}
            disabled={approveRoles.length === 0 || actingId !== null}
            onClick={() => {
              if (toApprove) {
                void submitApproval(toApprove, approveRoles);
              }
            }}
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
