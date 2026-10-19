"use client";

// PORTADO do `seedgrid-report-client`: src/views/subscription/SubscriptionManageView.tsx
//
// A tela veio LITERAL — JSX, estado, validacao, mensagens e ordem das chamadas sao os mesmos.
// Trocou-se APENAS o transporte:
//   - `invoke("comando_rust")` -> `fetch` para `/api/me/**`, pelo `lib/ported/portedApi.ts`
//   - `@tauri-apps/plugin-opener` (`openUrl`) -> `window.open(url, "_blank", "noopener")`,
//   -   reexportado como `openUrl` no mesmo `portedApi.ts` para a chamada ficar identica.
//
// "use client" no topo porque no Next isto e' componente de cliente (o original ja' era).

import { useCallback, useEffect, useState } from "react";

import { SgButton, SgDialog } from "@seedgrid/fe-components";
import { ChevronDown, ChevronRight, CreditCard, ExternalLink, FileText, RefreshCw, X } from "lucide-react";

import {
  cancelScheduledChange,
  cancelSubscription,
  getUpcomingInvoice,
  listInvoices,
  openBillingPortal,
  openUrl,
  reactivateSubscription,
} from "@/lib/ported/portedApi";
import {
  type InvoiceSummary,
  type SubscriptionResponse,
  type UpcomingInvoice,
} from "@/lib/ported/billingTypes";
import { isConnectionError } from "@/lib/ported/clientError";
import { MeterUsageBar } from "../components/MeterUsageBar";
import { DowngradeUserSelectionDialog } from "./DowngradeUserSelectionDialog";
import { SubscriptionPlansModal } from "./SubscriptionPlansView";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return Number.NaN;
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function formatBRL(value: number | string | null | undefined): string {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? currencyFormatter.format(parsed) : "-";
}

function formatCents(cents: number | null, currency: string | null): string {
  if (cents == null) return "-";
  const code = (currency ?? "brl").toUpperCase();
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}

function formatIsoDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

function formatEpochDate(seconds: number | null): string {
  if (seconds == null) return "-";
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativa",
  TRIALING: "Em teste",
  PAST_DUE: "Inativa",
  CANCELED: "Inativa",
  PAUSED: "Inativa",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: "Paga",
  open: "Em aberto",
  draft: "Rascunho",
  void: "Anulada",
  uncollectible: "Nao recebivel",
};

function subscriptionStatusTone(status: string): string {
  if (status === "ACTIVE") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "TRIALING") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-red-100 text-red-700";
}

interface SubscriptionManageViewProps {
  readonly subscription: SubscriptionResponse | null;
  readonly onRefresh: () => void | Promise<unknown>;
  readonly onClose?: () => void;
}

export function SubscriptionManageView({
  subscription,
  onRefresh,
  onClose,
}: SubscriptionManageViewProps) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  // Reedicao da escolha de quem perde acesso num downgrade ja agendado (a escolha inicial e'
  // feita JUNTO com a confirmacao da troca, no proprio dialog de "Trocar de plano").
  const [userSelectionOpen, setUserSelectionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [reactivateBusy, setReactivateBusy] = useState(false);
  const [cancelDowngradeBusy, setCancelDowngradeBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [upcoming, setUpcoming] = useState<UpcomingInvoice | null>(null);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

  // Busca o estado mais recente sempre que esta tela abre. O polling do checkout (ver
  // SubscriptionPlansView) so' atualiza a assinatura se o modal de planos ficar aberto ate a
  // confirmacao do pagamento — se o usuario navegar para outra tela nesse meio tempo (ex.:
  // conferir Usuarios), o polling morre e esta tela fica com o dado antigo ate reabrir.
  useEffect(() => {
    void onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- so' na abertura desta tela.
  }, []);

  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const result = await listInvoices(12);
      setInvoices(result.invoices);
    } catch (err) {
      setInvoicesError(typeof err === "string" ? err : "Falha ao carregar as faturas.");
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const loadUpcoming = useCallback(async () => {
    setUpcomingLoading(true);
    try {
      const result = await getUpcomingInvoice();
      setUpcoming(result.upcoming);
    } catch {
      setUpcoming(null); // sem proxima fatura (ex.: cancelada) nao e erro de tela
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  // Trial nao tem cliente/assinatura no Stripe ainda - nao ha fatura, portal ou proxima cobranca
  // de verdade pra buscar (e o portal chegaria a dar erro). So busca isso pra assinatura paga.
  const isTrial = Boolean(subscription?.plan?.isTrial);

  useEffect(() => {
    if (isTrial) {
      setInvoicesLoading(false);
      setUpcomingLoading(false);
      return;
    }
    void loadInvoices();
    void loadUpcoming();
  }, [isTrial, loadInvoices, loadUpcoming]);

  // Erro de conexao transitorio (backend reiniciando): tenta de novo em 3s, sem banner vermelho.
  useEffect(() => {
    if (!invoicesError || !isConnectionError(invoicesError)) return;
    const timer = window.setTimeout(() => void loadInvoices(), 3000);
    return () => window.clearTimeout(timer);
  }, [invoicesError, loadInvoices]);

  async function handlePortal() {
    setPortalBusy(true);
    setActionError(null);
    try {
      const portal = await openBillingPortal();
      await openUrl(portal.portalUrl);
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Falha ao abrir o portal de pagamento.");
    } finally {
      setPortalBusy(false);
    }
  }

  async function handleCancel() {
    setCancelBusy(true);
    setActionError(null);
    try {
      await cancelSubscription();
      setCancelOpen(false);
      setActionMessage(
        "Cancelamento agendado. Voce mantem o acesso ate o fim do periodo ja pago.",
      );
      await onRefresh();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Falha ao cancelar a assinatura.");
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleCancelDowngrade() {
    setCancelDowngradeBusy(true);
    setActionError(null);
    try {
      await cancelScheduledChange();
      setActionMessage("Downgrade cancelado. Sua assinatura continua no plano atual.");
      await onRefresh();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Falha ao cancelar o downgrade.");
    } finally {
      setCancelDowngradeBusy(false);
    }
  }

  async function handleReactivate() {
    setReactivateBusy(true);
    setActionError(null);
    try {
      await reactivateSubscription();
      setActionMessage("Assinatura reativada. Ela voltara a renovar normalmente.");
      await onRefresh();
    } catch (err) {
      setActionError(typeof err === "string" ? err : "Falha ao reativar a assinatura.");
    } finally {
      setReactivateBusy(false);
    }
  }

  if (!subscription) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-sm text-sg-muted">
        Nenhuma assinatura ativa.
      </div>
    );
  }

  const plan = subscription.plan;
  const term = subscription.planTerm;
  const cycle = subscription.billingCycle;
  const statusLabel = STATUS_LABELS[subscription.status] ?? "Inativa";
  const nextBilling = cycle?.periodEnd ?? subscription.endsAt ?? null;
  const maxUsers = term?.maxUsers ?? null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex flex-col gap-5 rounded-sg border border-sg-border bg-sg-bg p-6 shadow-sm">
        <header className="flex items-center justify-between gap-2 border-b border-sg-border pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="text-sg-primary" size={20} />
            <h1 className="text-lg font-semibold text-sg-text">Minha assinatura</h1>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              title="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-sg border border-sg-border text-sg-muted transition-colors hover:bg-sg-muted-surface hover:text-sg-text"
            >
              <X size={18} />
            </button>
          ) : null}
        </header>

        {actionMessage ? (
          <div className="rounded-sg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {actionMessage}
          </div>
        ) : null}
        {actionError ? (
          <div className="rounded-sg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}

        {subscription.pendingChange ? (
          <div className="flex flex-col gap-3 rounded-sg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="font-medium">Downgrade agendado.</span> Voce continua no plano atual
              ate o fim do ciclo
              {subscription.pendingChange.effectiveAt
                ? `; em ${formatIsoDate(subscription.pendingChange.effectiveAt)}`
                : ", e entao"}{" "}
              passa para o plano{" "}
              <span className="font-medium">{subscription.pendingChange.planName}</span>
              {subscription.pendingChange.meters && subscription.pendingChange.meters.length > 0
                ? ` (${subscription.pendingChange.meters
                    .map((meter) => `${numberFormatter.format(meter.includedUnits)} ${meter.label}`)
                    .join(", ")})`
                : ""}
              .
            </span>
            <div className="flex shrink-0 gap-2">
              <SgButton
                severity="secondary"
                appearance="outline"
                size="sm"
                onClick={() => setUserSelectionOpen(true)}
              >
                Editar selecao de usuarios
              </SgButton>
              <SgButton
                severity="secondary"
                appearance="outline"
                size="sm"
                loading={cancelDowngradeBusy}
                onClick={() => void handleCancelDowngrade()}
              >
                Cancelar downgrade
              </SgButton>
            </div>
          </div>
        ) : null}

        {/* Sem downgrade agendado (banner acima), mas o plano JA VIGENTE tem menos vagas do que
            os usuarios ativos hoje (ex.: assinou saindo do trial com varios usuarios ativos). */}
        {!subscription.pendingChange && subscription.requiresUserSelection ? (
          <div className="flex flex-col gap-3 rounded-sg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="font-medium">Seu plano tem menos vagas do que os usuários ativos hoje.</span>{" "}
              Escolha quem perde o acesso ao fim do ciclo atual.
            </span>
            <SgButton
              severity="secondary"
              appearance="outline"
              size="sm"
              onClick={() => setUserSelectionOpen(true)}
            >
              Escolher usuários
            </SgButton>
          </div>
        ) : null}

        {subscription.cancelAtPeriodEnd ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>
              <span className="font-medium">Assinatura cancelada.</span> Voce mantem o acesso
              {subscription.cancelEffectiveAt
                ? ` ate ${formatIsoDate(subscription.cancelEffectiveAt)}`
                : " ate o fim do periodo"}{" "}
              e nao ha novas cobrancas. Para voltar atras, reative antes dessa data.
            </span>
            <SgButton
              severity="success"
              appearance="solid"
              size="sm"
              loading={reactivateBusy}
              onClick={() => void handleReactivate()}
            >
              Reativar assinatura
            </SgButton>
          </div>
        ) : null}

        <section className="rounded-sg border border-sg-border bg-sg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl font-semibold text-sg-text">{plan?.name ?? "-"}</div>
              {plan?.description ? (
                <div className="mt-0.5 text-sm text-sg-muted">{plan.description}</div>
              ) : null}
            </div>
            <span
              className={[
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                subscriptionStatusTone(subscription.status),
              ].join(" ")}
            >
              {statusLabel}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {/* No trial nao ha cobranca recorrente: o sufixo "/mes" confundia o cliente. */}
            <Field
              label={isTrial ? "Preco" : "Preco mensal"}
              value={term ? (isTrial ? formatBRL(term.monthlyPrice) : `${formatBRL(term.monthlyPrice)}/mes`) : "-"}
              hint={isTrial ? "Sem cobranca no teste" : undefined}
            />
            {/* Um campo por contador de uso do plano: a franquia e, se houver, o preco do excedente. */}
            {(term?.meters ?? []).map((meter) => (
              <Field
                key={meter.meter}
                label={isTrial ? meter.label : `${meter.label}/mes`}
                value={numberFormatter.format(meter.includedUnits)}
                hint={
                  toNumber(meter.overagePrice) > 0
                    ? `+ ${formatBRL(meter.overagePrice)} por unidade excedente`
                    : "Sem excedente: bloqueia ao esgotar"
                }
              />
            ))}
            <Field
              label="Usuarios"
              value={maxUsers == null ? "Ilimitados" : numberFormatter.format(maxUsers)}
            />
            <Field label="Inicio" value={formatIsoDate(subscription.startsAt)} />
            <Field label={isTrial ? "Fim do teste" : "Proxima cobranca"} value={formatIsoDate(nextBilling)} />
          </dl>

          {cycle && cycle.meters.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 rounded-sg bg-sg-muted-surface px-3 py-2.5 text-sm">
              <span className="text-sg-muted">Consumo no ciclo</span>
              {cycle.meters.map((meter) => (
                <MeterUsageBar key={meter.meter} meter={meter} />
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <SgButton severity="primary" appearance="solid" onClick={() => setChangeOpen(true)}>
              {isTrial ? "Assinar agora" : "Trocar de plano"}
            </SgButton>
            {!isTrial ? (
              <SgButton
                severity="secondary"
                appearance="outline"
                loading={portalBusy}
                onClick={() => void handlePortal()}
              >
                Gerenciar pagamento
              </SgButton>
            ) : null}
            {isTrial ? null : subscription.cancelAtPeriodEnd ? (
              <SgButton
                severity="success"
                appearance="outline"
                loading={reactivateBusy}
                onClick={() => void handleReactivate()}
              >
                Reativar assinatura
              </SgButton>
            ) : (
            <SgButton
              severity="danger"
              appearance="outline"
              onClick={() => {
                setActionError(null);
                setCancelOpen(true);
              }}
            >
              Cancelar assinatura
            </SgButton>
            )}
          </div>
        </section>

        {/* Proxima fatura (preview Stripe): total + expandir para o detalhe (plano + excedente). */}
        {!isTrial && !upcomingLoading && upcoming ? (
          <section className="rounded-sg border border-sg-border bg-sg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-sg-text">
                <CreditCard size={16} /> Proxima fatura
              </h2>
              <div className="text-right">
                {subscription.pendingChange ? (
                  // Com downgrade agendado, o preview do Stripe (gerado pela fase corrente do
                  // schedule) NAO inclui a mensalidade do proximo ciclo e sai ~R$ 0 — enganoso.
                  // Mostramos a mensalidade real do plano que passa a valer.
                  <>
                    <div className="text-lg font-semibold text-sg-text">
                      {formatBRL(subscription.pendingChange.monthlyPrice)}
                    </div>
                    <div className="text-xs text-sg-muted">
                      Plano {subscription.pendingChange.planName}
                      {subscription.pendingChange.effectiveAt
                        ? ` a partir de ${formatIsoDate(subscription.pendingChange.effectiveAt)}`
                        : ""}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-semibold text-sg-text">
                      {formatCents(upcoming.totalCents ?? upcoming.amountDueCents, upcoming.currency)}
                    </div>
                    {upcoming.periodEnd != null ? (
                      <div className="text-xs text-sg-muted">
                        vence em {formatEpochDate(upcoming.periodEnd)}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {upcoming.lines.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setUpcomingExpanded((value) => !value)}
                  className="mt-3 flex items-center gap-1 text-sm text-sg-muted transition-colors hover:text-sg-text"
                >
                  {upcomingExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {upcomingExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                </button>
                {upcomingExpanded ? (
                  <table className="mt-2 w-full text-sm">
                    <tbody>
                      {upcoming.lines.map((line, index) => (
                        <tr key={`${line.description ?? "item"}-${index}`} className="border-t border-sg-border">
                          <td className="py-1.5 pr-3 text-sg-text">{line.description ?? "Item"}</td>
                          <td className="py-1.5 text-right text-sg-text">
                            {formatCents(line.amountCents, upcoming.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

        {isTrial ? null : (
        <section className="rounded-sg border border-sg-border bg-sg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-sg-text">
              <FileText size={16} /> Faturas
            </h2>
            <button
              type="button"
              onClick={() => void loadInvoices()}
              aria-label="Atualizar faturas"
              title="Atualizar"
              className="flex h-8 w-8 items-center justify-center rounded-sg border border-sg-border text-sg-muted transition-colors hover:bg-sg-muted-surface hover:text-sg-text"
            >
              <RefreshCw size={16} className={invoicesLoading ? "animate-spin" : undefined} />
            </button>
          </div>

          {invoicesError ? (
            isConnectionError(invoicesError) ? (
              <div className="flex items-center gap-1.5 rounded-sg border border-sg-border bg-sg-muted-surface px-3 py-2 text-sm text-sg-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Reconectando ao servidor...
              </div>
            ) : (
              <div className="rounded-sg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {invoicesError}
              </div>
            )
          ) : invoicesLoading ? (
            <div className="py-6 text-center text-sm text-sg-muted">Carregando faturas...</div>
          ) : invoices.length === 0 ? (
            <div className="py-6 text-center text-sm text-sg-muted">
              Nenhuma fatura emitida ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sg-border text-left text-xs uppercase tracking-wide text-sg-muted">
                    <th className="py-2 pr-3 font-medium">Data</th>
                    <th className="py-2 pr-3 font-medium">Numero</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 text-right font-medium">Valor</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const link = invoice.hostedInvoiceUrl ?? invoice.pdfUrl;
                    return (
                      <tr key={invoice.id} className="border-b border-sg-border/60 last:border-0">
                        <td className="py-2 pr-3 text-sg-text">{formatEpochDate(invoice.createdAt)}</td>
                        <td className="py-2 pr-3 text-sg-muted">{invoice.number ?? "-"}</td>
                        <td className="py-2 pr-3 text-sg-text">
                          {invoice.status
                            ? INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status
                            : "-"}
                        </td>
                        <td className="py-2 pr-3 text-right font-medium text-sg-text">
                          {formatCents(invoice.amountPaid ?? invoice.amountDue, invoice.currency)}
                        </td>
                        <td className="py-2">
                          {link ? (
                            <button
                              type="button"
                              onClick={() => void openUrl(link)}
                              className="inline-flex items-center gap-1 text-xs text-sg-primary hover:underline"
                            >
                              Ver <ExternalLink size={12} />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </div>

      <SubscriptionPlansModal
        open={changeOpen}
        onOpenChange={setChangeOpen}
        // Em trial nao ha assinatura vinculada ao provedor pra "trocar" — precisa criar a
        // primeira via checkout. So' quem ja tem plano pago troca de fato.
        mode={isTrial ? "checkout" : "change"}
        onSubscriptionActivated={(result) => {
          setChangeOpen(false);
          // Downgrade nao troca na hora: e agendado para o fim do ciclo. A mensagem precisa
          // refletir isso (senao parece que "nao mudou"); o banner acima mostra a data exata.
          setActionMessage(
            result?.kind === "downgrade"
              ? `Downgrade para ${result.planName} agendado. Voce continua no plano atual ate o fim do ciclo — veja os detalhes acima.`
              : result?.kind === "downgrade-canceled"
                ? "Downgrade cancelado. Sua assinatura continua no plano atual."
                : "Plano alterado com sucesso.",
          );
          // A escolha de quem perde acesso (quando o plano novo tem menos vagas) ja foi feita
          // JUNTO com a confirmacao da troca (acao atomica no servidor) — nao ha mais nada a
          // abrir aqui depois.
          void onRefresh();
          void loadInvoices();
        }}
      />

      <DowngradeUserSelectionDialog
        open={userSelectionOpen}
        onOpenChange={setUserSelectionOpen}
        onSaved={() => setActionMessage("Selecao de usuarios salva com sucesso.")}
      />

      <SgDialog open={cancelOpen} onOpenChange={setCancelOpen} size="sm" closeable closeOnEsc>
        <div className="flex flex-col gap-4 p-1">
          <h3 className="text-base font-semibold text-sg-text">Cancelar assinatura?</h3>
          <p className="text-sm text-sg-muted">
            A assinatura sera cancelada ao fim do periodo ja pago. Voce mantem o acesso ate la e
            nao havera novas cobrancas.
          </p>
          {actionError ? (
            <div className="rounded-sg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <SgButton
              severity="secondary"
              appearance="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelBusy}
            >
              Voltar
            </SgButton>
            <SgButton
              severity="danger"
              appearance="solid"
              loading={cancelBusy}
              onClick={() => void handleCancel()}
            >
              Cancelar assinatura
            </SgButton>
          </div>
        </div>
      </SgDialog>
    </div>
  );
}

function Field({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-sg-muted">{label}</dt>
      <dd className="font-medium text-sg-text">{value}</dd>
      {hint ? <dd className="text-xs text-sg-muted">{hint}</dd> : null}
    </div>
  );
}
