"use client";

// PORTADO do `seedgrid-report-client`: src/views/subscription/SubscriptionPlansView.tsx
//
// A tela veio LITERAL — JSX, estado, validacao, mensagens e ordem das chamadas sao os mesmos.
// Trocou-se APENAS o transporte:
//   - `invoke("comando_rust")` -> `fetch` para `/api/me/**`, pelo `lib/ported/portedApi.ts`
//   - `@tauri-apps/plugin-opener` (`openUrl`) -> `window.open(url, "_blank", "noopener")`,
//   -   reexportado como `openUrl` no mesmo `portedApi.ts` para a chamada ficar identica.
//
// "use client" no topo porque no Next isto e' componente de cliente (o original ja' era).

import { useCallback, useEffect, useMemo, useState } from "react";

import { SgButton, SgDialog } from "@seedgrid/fe-components";
import { Check, Clock, ShieldCheck, Sparkles } from "lucide-react";

import {
  cancelScheduledChange,
  changePlan,
  getChangePreview,
  getCheckoutPreview,
  listPlans,
  openUrl,
  startCheckout,
} from "@/lib/ported/portedApi";
import { UserSelectionChecklist } from "@/components/ported/UserSelectionChecklist";
import {
  INVALID_COMPANY_SELECTION_CODE,
  needsAnySelection,
  type CompanySelection,
} from "@/lib/downgrade-company-selection";
import { extractProblemCode } from "@/lib/api-error";
import { readError } from "@/lib/ported/clientError";
import { DowngradeCompanySelectionDialog } from "./DowngradeCompanySelectionDialog";
import {
  type ChangePreview,
  type CheckoutPreview,
  type PlanCatalogItem,
  type PlansPendingChange,
} from "@/lib/ported/billingTypes";

function formatPlanDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("pt-BR");
}

function formatCents(cents: number, currency: string | null): string {
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

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number.parseFloat(value);
}

function formatCurrency(value: number | string): string {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? currencyFormatter.format(parsed) : "-";
}

// Beneficios sao guardados em featuresJson como um array JSON de strings. Aceita
// tambem texto livre/legado (uma linha por beneficio) como fallback.
function parseBenefits(featuresJson: string | null): string[] {
  if (!featuresJson || !featuresJson.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(featuresJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).filter((item) => item.trim().length > 0);
    }
  } catch {
    // Não é JSON: trata como linhas.
  }
  return featuresJson
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Resultado de uma troca de plano, passado ao pai para ele exibir a mensagem certa.
 * `undefined` (sem argumento) = ativação via checkout/polling — tratada como upgrade/ativação.
 */
export interface PlanChangeResult {
  /** "upgrade" troca na hora; "downgrade" agenda p/ fim do ciclo; "downgrade-canceled" desfaz o agendamento. */
  readonly kind: "upgrade" | "downgrade" | "downgrade-canceled";
  /** Nome do plano de destino (quando aplicável). */
  readonly planName?: string;
}

interface SubscriptionPlansProps {
  /**
   * Chamado quando o plano comprado fica ativo (detectado por polling, após o pagamento
   * ser confirmado pelo webhook) OU quando uma troca de plano é concluída. O pai deve
   * fechar o modal e atualizar a assinatura, usando o resultado para a mensagem.
   */
  readonly onSubscriptionActivated?: (result?: PlanChangeResult) => void;
  /**
   * Chamado quando o polling de confirmação do checkout desiste (~3 min sem o webhook
   * ativar o plano) — recebe o nome do plano comprado. O pai deve avisar o cliente (o
   * pagamento pode ainda estar em processamento) e fechar o modal, assim como faz em
   * {@link onSubscriptionActivated}.
   */
  readonly onCheckoutTimeout?: (planName: string) => void;
  /** Aviso opcional exibido no topo (ex.: fim do trial). */
  readonly notice?: string;
  /**
   * "checkout" (padrão): 1ª assinatura via Stripe Checkout no browser; mostra só planos
   * superiores (upgrade). "change": troca de plano da assinatura EXISTENTE (upgrade OU
   * downgrade) via change-plan com rateio, sem sair do app; mostra todos os outros planos.
   */
  readonly mode?: "checkout" | "change";
}

/**
 * Landing de planos: catálogo assinável (de /me/plans) em formato de pricing page,
 * com o plano mais caro destacado como "Melhor valor" (anchoring para Enterprise) e um botão de assinar por plano
 * (abre a checkoutUrl do provedor no browser). Serve como conteúdo da tela e do modal.
 */
export function SubscriptionPlans({
  onSubscriptionActivated,
  onCheckoutTimeout,
  notice,
  mode = "checkout",
}: SubscriptionPlansProps) {
  const isChange = mode === "change";
  const [plans, setPlans] = useState<PlanCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [changeConfirm, setChangeConfirm] = useState<{ plan: PlanCatalogItem; preview: ChangePreview } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  // Selecao de "quem perde acesso", quando o downgrade exige (changeConfirm.preview.requiresUserSelection).
  // Faz parte da MESMA confirmacao — vai junto no POST /change-plan (acao atomica no servidor).
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  // Selecao de EMPRESAS (ativa / somente leitura / desligar), quando o plano novo comporta menos
  // empresas que as ativas hoje (changeConfirm.preview.requiresCompanySelection). Mesma regra: faz
  // parte da confirmacao e vai junto no POST /change-plan (`companySelection`).
  const [companySelection, setCompanySelection] = useState<CompanySelection | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  // Mesma escolha de empresas, agora no CHECKOUT (T5.13): plano menor que as empresas ativas hoje.
  const [checkoutCompanyDialogOpen, setCheckoutCompanyDialogOpen] = useState(false);
  // Plano cujo pagamento estamos aguardando confirmar (apos abrir o checkout no browser).
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  // Checkout (trial -> pago) num plano com menos vagas do que os usuarios ativos hoje: confirma
  // a escolha de quem perde acesso AQUI, antes de abrir o checkout no navegador — nao da' pra
  // pedir isso depois (o checkout roda fora do app, a ativacao chega assincrona via webhook).
  const [checkoutConfirm, setCheckoutConfirm] = useState<{
    plan: PlanCatalogItem;
    preview: CheckoutPreview;
  } | null>(null);
  const [checkoutConfirmBusy, setCheckoutConfirmBusy] = useState(false);
  // Downgrade agendado (vindo do catalogo): alimenta o banner do topo.
  const [pendingChange, setPendingChange] = useState<PlansPendingChange | null>(null);
  const [cancelingDowngrade, setCancelingDowngrade] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPlans();
      setPlans(result.items);
      setPendingChange(result.pendingChange ?? null);
    } catch (err) {
      setError(typeof err === "string" ? err : "Falha ao carregar os planos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Apos abrir o checkout, o pagamento ocorre no browser externo — o app nao tem callback.
  // Entao fazemos polling do catalogo: quando o plano comprado vira `current` (o webhook
  // ativou a assinatura no backend), avisamos o pai para fechar o modal e atualizar. Se
  // desistir (timeout), avisa o pai tambem — em vez de so voltar pra lista de planos sem
  // explicar nada (o pagamento pode ainda estar em processamento do lado do provedor).
  useEffect(() => {
    if (!pendingPlanId) return;
    const purchasedPlanName = displayed.find((p) => p.planId === pendingPlanId)?.name ?? "escolhido";
    let active = true;
    const deadline = Date.now() + 3 * 60 * 1000; // desiste apos ~3 min
    const timer = window.setInterval(async () => {
      try {
        const result = await listPlans();
        if (!active) return;
        setPlans(result.items);
        setPendingChange(result.pendingChange ?? null);
        const activated = result.items.find((p) => p.planId === pendingPlanId)?.current === true;
        if (activated) {
          setPendingPlanId(null);
          // A escolha de quem perde acesso (quando o plano tem menos vagas) ja foi feita ANTES
          // de abrir o checkout (ver handleSubscribe/checkoutConfirm) — nada a fazer aqui.
          onSubscriptionActivated?.();
        } else if (Date.now() > deadline) {
          setPendingPlanId(null);
          onCheckoutTimeout?.(purchasedPlanName);
        }
      } catch {
        // ignora; tenta de novo no proximo tick
      }
    }, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `displayed` so' e' lido na 1a
    // renderizacao do efeito (nome do plano comprado), nao deve reiniciar o polling ao mudar.
  }, [pendingPlanId, onSubscriptionActivated, onCheckoutTimeout]);

  // Ordena do mais barato ao mais caro (convenção de pricing).
  const ordered = useMemo(
    () => [...plans].sort((a, b) => toNumber(a.monthlyPrice) - toNumber(b.monthlyPrice)),
    [plans],
  );
  const currentPlan = useMemo(() => ordered.find((p) => p.current) ?? null, [ordered]);

  // Acao EFETIVA (fonte de verdade = catalogo ja reconciliado no backend): se ha um plano atual, o
  // cliente TEM assinatura paga ativa -> qualquer outro plano e uma TROCA in-place (rateio), NUNCA
  // um checkout novo (que duplicaria a assinatura no provedor e cobraria 2x). So sem plano atual
  // (trial/nenhum) e que e checkout (1a assinatura). Independe do prop `mode`, que pode vir
  // defasado se o webhook nao tiver atualizado o estado local ainda.
  const effectiveChange = isChange || currentPlan != null;

  // Quais cards exibir:
  //  - aguardando pagamento: SÓ o card comprado (evita reclique / trocar de plano no meio);
  //  - caso geral: TODOS os planos. O plano atual aparece desabilitado e marcado ("Plano
  //    assinado"); sumir com ele confundia ("ja troquei ou nao?"). A troca cuida de up/downgrade.
  const displayed = useMemo(() => {
    if (pendingPlanId) {
      return ordered.filter((p) => p.planId === pendingPlanId);
    }
    return ordered;
  }, [ordered, pendingPlanId]);

  // Destaca sempre o plano mais caro (ultimo, ja que `ordered` e' crescente por preco) -
  // estrategia de anchoring para levar mais assinantes ao Enterprise.
  const recommendedIndex = displayed.length >= 3 ? displayed.length - 1 : -1;
  const single = displayed.length === 1;
  // Grade responsiva: ate 3 planos -> 1 linha; mais que 3 -> no maximo 3 colunas (quebra em 2
  // linhas, cabendo ate 6). minmax(0,1fr) permite encolher para caber no modal.
  const gridColumns = Math.min(displayed.length, 3);
  // Largura maxima do bloco de cards proporcional ao nº de colunas (mantem cards num tamanho bom
  // quando ha 1 ou 2 planos, em vez de estica-los).
  const gridMaxWidth = `${gridColumns * 21}rem`;

  async function handleSubscribe(plan: PlanCatalogItem) {
    if (!plan.checkoutEnabled) {
      setError(
        `O plano "${plan.name}" ainda nao tem pagamento configurado. Cadastre o ID de preco do Stripe nesse plano pelo admin para habilitar a assinatura.`,
      );
      return;
    }
    setError(null);
    setCheckoutPlanId(plan.planId);
    try {
      if (effectiveChange) {
        // Troca: busca a previa do rateio (e, se downgrade, tambem quem e' elegivel pra perder
        // acesso) e abre a confirmacao antes de aplicar.
        const preview = await getChangePreview(plan.planId);
        setSelectedUserIds([]);
        setCompanySelection(null);
        setChangeConfirm({ plan, preview });
        return;
      }
      // Checkout (1a assinatura): se o plano tem menos vagas do que os usuarios ativos hoje
      // (ex.: varios usuarios cadastrados durante o trial), confirma quem perde acesso ANTES de
      // abrir o checkout — nao da' pra pedir isso depois.
      const preview = await getCheckoutPreview(plan.planId);
      if (needsAnySelection(preview)) {
        setSelectedUserIds([]);
        setCompanySelection(null);
        setCheckoutConfirm({ plan, preview });
        return;
      }
      const checkout = await startCheckout(plan.planId);
      await openUrl(checkout.checkoutUrl);
      // Passa a aguardar a confirmacao do pagamento (polling no useEffect acima).
      setPendingPlanId(plan.planId);
    } catch (err) {
      const message = typeof err === "string" ? err : "Falha ao processar o plano.";
      // O backend reconcilia com o Stripe ANTES de criar o checkout: se ja existe assinatura ativa
      // (ex.: o webhook falhou e a assinatura acabou de ser importada), ele bloqueia com essa
      // mensagem. Nesse caso o estado local JA foi corrigido — atualiza a UI em vez de so mostrar
      // erro (fecha o modal/atualiza a assinatura, ou ao menos recarrega o catalogo).
      if (message.toLowerCase().includes("assinatura ativa")) {
        if (onSubscriptionActivated) {
          onSubscriptionActivated();
        } else {
          await load();
          setError(message);
        }
        return;
      }
      setError(message);
    } finally {
      setCheckoutPlanId(null);
    }
  }

  // `selectedUserIds` guarda quem FICA ativo (framing aditivo — mais intuitivo que "quem
  // perde": o admin ja aparece marcado/travado, ver UserSelectionChecklist). O backend espera o
  // inverso (quem perde acesso), entao inverte so' na hora de mandar (deactivateIdsFor abaixo).
  // requiredCount aditivo = quantos NAO-root cabem no plano = elegiveis - quantos precisam sair.
  function stayingRequiredCount(preview: {
    eligibleUsers?: { publicId: string }[];
    requiredCount?: number;
  }): number {
    const eligibleCount = preview.eligibleUsers?.length ?? 0;
    return Math.max(0, eligibleCount - (preview.requiredCount ?? 0));
  }

  function deactivateIdsFor(
    preview: { eligibleUsers?: { publicId: string }[] },
    staying: string[],
  ): string[] {
    const stayingSet = new Set(staying);
    return (preview.eligibleUsers ?? [])
      .map((u) => u.publicId)
      .filter((id) => !stayingSet.has(id));
  }

  const requiredUserSelectionCount = changeConfirm ? stayingRequiredCount(changeConfirm.preview) : 0;
  const userSelectionMatches = selectedUserIds.length === requiredUserSelectionCount;
  // Bloqueia "Confirmar troca" ate' a selecao obrigatoria estar completa — a escolha de quem
  // fica ativo faz parte da MESMA confirmacao (nunca uma tela separada que poderia ficar pra
  // tras se o cliente fechasse no meio do caminho). Plano de 1 usuario (so' o admin cabe) nao
  // tem nada pra escolher — requiredUserSelectionCount fica 0 e ja libera direto.
  const usersOk =
    !changeConfirm?.preview.requiresUserSelection ||
    requiredUserSelectionCount === 0 ||
    userSelectionMatches;
  // Empresas: so' confirma com a escolha completa (as contagens exatas sao garantidas pelo dialogo).
  const companiesOk = !changeConfirm?.preview.requiresCompanySelection || companySelection !== null;
  const canConfirmChange = usersOk && companiesOk;

  async function confirmChange() {
    if (!changeConfirm || !canConfirmChange) {
      return;
    }
    setConfirmBusy(true);
    setError(null);
    try {
      await changePlan(
        changeConfirm.plan.planId,
        changeConfirm.preview.requiresUserSelection
          ? deactivateIdsFor(changeConfirm.preview, selectedUserIds)
          : undefined,
        changeConfirm.preview.requiresCompanySelection ? companySelection : undefined,
      );
      const downgrade = changeConfirm.preview.downgrade;
      const planName = changeConfirm.plan.name;
      setChangeConfirm(null);
      onSubscriptionActivated?.({ kind: downgrade ? "downgrade" : "upgrade", planName });
    } catch (err) {
      setError(typeof err === "string" ? readError(err) : "Falha ao trocar de plano.");
      if (typeof err === "string" && extractProblemCode(err) === INVALID_COMPANY_SELECTION_CODE) {
        setCompanySelection(null);
      }
    } finally {
      setConfirmBusy(false);
    }
  }

  const checkoutRequiredCount = checkoutConfirm ? stayingRequiredCount(checkoutConfirm.preview) : 0;
  const checkoutSelectionMatches = selectedUserIds.length === checkoutRequiredCount;
  const checkoutUsersOk =
    !checkoutConfirm?.preview.requiresUserSelection ||
    checkoutRequiredCount === 0 ||
    checkoutSelectionMatches;
  const checkoutCompaniesOk =
    !checkoutConfirm?.preview.requiresCompanySelection || companySelection !== null;
  const canConfirmCheckout = checkoutUsersOk && checkoutCompaniesOk;

  async function confirmCheckoutWithSelection() {
    if (!checkoutConfirm || !canConfirmCheckout) {
      return;
    }
    setCheckoutConfirmBusy(true);
    setError(null);
    try {
      const { preview, plan } = checkoutConfirm;
      const deactivateIds = preview.requiresUserSelection
        ? deactivateIdsFor(preview, selectedUserIds)
        : undefined;
      const checkout = await startCheckout(
        plan.planId,
        deactivateIds,
        preview.requiresCompanySelection ? companySelection : undefined,
      );
      await openUrl(checkout.checkoutUrl);
      setPendingPlanId(plan.planId);
      setCheckoutConfirm(null);
    } catch (err) {
      setError(typeof err === "string" ? readError(err) : "Falha ao iniciar o checkout.");
      // INVALID_COMPANY_SELECTION: as empresas mudaram desde a previa. Recarrega a previa e zera a
      // escolha para o usuario refazer com os dados atuais (nada foi cobrado nem agendado).
      if (typeof err === "string" && extractProblemCode(err) === INVALID_COMPANY_SELECTION_CODE) {
        setCompanySelection(null);
        try {
          const fresh = await getCheckoutPreview(checkoutConfirm.plan.planId);
          setCheckoutConfirm({ plan: checkoutConfirm.plan, preview: fresh });
        } catch {
          // Sem a previa nova a tela segue com a antiga; o servidor valida de novo.
        }
      }
    } finally {
      setCheckoutConfirmBusy(false);
    }
  }

  async function cancelDowngrade() {
    setCancelingDowngrade(true);
    setError(null);
    try {
      await cancelScheduledChange();
      // Se houver pai (modal), ele fecha e exibe a confirmacao + atualiza a assinatura.
      // Standalone: atualiza o proprio catalogo (some o banner/selo agendado).
      if (onSubscriptionActivated) {
        onSubscriptionActivated({ kind: "downgrade-canceled" });
      } else {
        await load();
      }
    } catch (err) {
      setError(typeof err === "string" ? err : "Falha ao cancelar o downgrade.");
    } finally {
      setCancelingDowngrade(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-sg-muted">Carregando planos...</div>;
  }

  if (error && plans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="rounded-sg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
        <SgButton appearance="outline" severity="secondary" size="sm" onClick={() => void load()}>
          Tentar novamente
        </SgButton>
      </div>
    );
  }

  if (ordered.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-sg-muted">
        Nenhum plano disponível para assinatura no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {notice ? (
        <div className="rounded-sg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </div>
      ) : null}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-sg-text">
          {pendingPlanId
            ? "Concluindo sua assinatura"
            : effectiveChange
              ? "Trocar de plano"
              : "Escolha o plano ideal para você"}
        </h2>
        <p className="mt-1 text-sm text-sg-muted">
          {pendingPlanId
            ? "Finalize o pagamento na aba do navegador. Esta tela atualiza sozinha."
            : effectiveChange
              ? `Você está no plano ${currentPlan?.name ?? "atual"}. Upgrade entra na hora (com rateio); downgrade vale a partir do próximo ciclo.`
              : "Mais solicitações de IA, mais relatórios. Faça upgrade quando precisar."}
        </p>
      </div>

      {pendingChange ? (
        <div className="flex flex-col gap-3 rounded-sg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-medium">Downgrade agendado.</span> Você continua no plano atual
              até o fim do ciclo
              {formatPlanDate(pendingChange.effectiveAt)
                ? `; em ${formatPlanDate(pendingChange.effectiveAt)}`
                : ", e então"}{" "}
              passa para o plano <span className="font-medium">{pendingChange.planName}</span>.
            </span>
          </span>
          <SgButton
            severity="secondary"
            appearance="outline"
            size="sm"
            loading={cancelingDowngrade}
            onClick={() => void cancelDowngrade()}
          >
            Cancelar downgrade
          </SgButton>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-sg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {displayed.length === 0 ? (
        <div className="rounded-sg border border-sg-border bg-sg-muted-surface px-4 py-6 text-center text-sm text-sg-muted">
          {isChange
            ? "Não há outros planos disponíveis para troca no momento."
            : `Você já está no plano mais alto disponível${currentPlan ? ` (${currentPlan.name})` : ""}. Não há upgrade no momento.`}
        </div>
      ) : (
      <div
        className="mx-auto grid w-full items-stretch gap-5"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          maxWidth: gridMaxWidth,
        }}
      >
        {displayed.map((plan, index) => {
          const benefits = parseBenefits(plan.featuresJson);
          const busy = checkoutPlanId === plan.planId;
          const isPending = pendingPlanId === plan.planId;
          // Destino de um downgrade ja agendado: card marcado e botao desabilitado.
          const isScheduledDowngrade = plan.pendingDowngrade === true;
          // Nao destaca como "Melhor valor" um card nao acionavel (atual ou agendado).
          const recommended =
            !single && index === recommendedIndex && !plan.current && !isScheduledDowngrade;
          return (
            <div
              key={plan.planId}
              className={`relative flex w-full flex-col gap-4 rounded-sg border bg-sg-surface p-5 shadow-sm transition ${
                recommended
                  ? "border-sg-primary ring-2 ring-sg-primary md:-translate-y-1 md:shadow-md"
                  : isScheduledDowngrade
                    ? "border-amber-300 bg-amber-50/40"
                    : plan.current
                      ? "border-sg-border bg-sg-muted-surface/40 opacity-75"
                      : "border-sg-border"
              }`}
            >
              {recommended ? (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-sg-primary px-3 py-0.5 text-[11px] font-semibold text-sg-on-primary shadow">
                  <Sparkles size={12} /> Melhor valor
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-2">
                <div className="text-lg font-semibold text-sg-text">{plan.name}</div>
                {plan.current ? (
                  <span className="rounded-full bg-sg-muted-surface px-2 py-0.5 text-xs font-medium text-sg-muted">
                    Plano atual
                  </span>
                ) : isScheduledDowngrade ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Agendado
                  </span>
                ) : null}
              </div>

              {plan.description ? (
                <div className="-mt-2 text-xs text-sg-muted">{plan.description}</div>
              ) : null}

              <div className="flex items-baseline gap-1">
                <span className="text-xs text-sg-muted">Preço mensal</span>
              </div>
              <div className="-mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-sg-text">
                  {formatCurrency(plan.monthlyPrice)}
                </span>
                <span className="text-sm text-sg-muted">/mês</span>
              </div>

              {/* Atributos estruturados do plano (do plan_term cadastrado). */}
              <dl className="flex flex-col gap-1.5 rounded-sg bg-sg-muted-surface px-3 py-2.5 text-sm">
                {/* Um item por contador de uso do plano: franquia e, se houver, o preco do excedente. */}
                {plan.meters.map((meter) => (
                  <div key={meter.meter} className="flex items-center justify-between gap-2">
                    <dt className="text-sg-muted">{meter.label}/mês</dt>
                    <dd className="text-right font-medium text-sg-text">
                      {numberFormatter.format(meter.includedUnits)}
                      {toNumber(meter.overagePrice) > 0 ? (
                        <span className="block text-xs font-normal text-sg-muted">
                          + {formatCurrency(meter.overagePrice)} por unidade excedente
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
                {plan.maxUsers !== 0 ? (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-sg-muted">Usuários</dt>
                    <dd className="font-medium text-sg-text">
                      {plan.maxUsers == null
                        ? "Ilimitados"
                        : numberFormatter.format(plan.maxUsers)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {benefits.length > 0 ? (
                <ul className="flex flex-1 flex-col gap-2">
                  {benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-start gap-2 text-sm text-sg-text"
                    >
                      <Check className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1" />
              )}

              {plan.current ? (
                <div className="flex w-full items-center justify-center gap-1.5 rounded-sg border border-sg-border bg-sg-muted-surface px-3 py-2 text-sm font-medium text-sg-muted">
                  <Check size={15} className="shrink-0" /> Plano assinado
                </div>
              ) : isScheduledDowngrade ? (
                <div className="flex w-full items-center justify-center gap-1.5 rounded-sg border border-amber-300 bg-amber-100/70 px-3 py-2 text-sm font-medium text-amber-800">
                  <Clock size={15} className="shrink-0" /> Downgrade agendado para o fim do ciclo
                </div>
              ) : (
                <SgButton
                  severity="primary"
                  appearance="solid"
                  style={{ width: "100%" }}
                  loading={busy || isPending}
                  disabled={plan.current || busy || isPending}
                  onClick={() => void handleSubscribe(plan)}
                >
                  {plan.current
                    ? "Plano atual"
                    : isPending
                      ? "Aguardando pagamento..."
                      : effectiveChange
                        ? busy
                          ? "Alterando..."
                          : "Mudar para este plano"
                        : busy
                          ? "Abrindo checkout..."
                          : "Assinar"}
                </SgButton>
              )}
            </div>
          );
        })}
      </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-sg-muted">
        <ShieldCheck size={14} /> Pagamento seguro via Stripe · Cancele quando quiser
      </div>

      <SgDialog
        open={changeConfirm != null}
        onOpenChange={(value) => {
          // Enquanto a troca esta em andamento (confirmBusy), ignora qualquer tentativa de
          // fechar (X, clique fora, ESC) — clicar fora nao deveria "abandonar" a tela no meio
          // de uma requisicao que pode demorar (ex.: downgrade calcula usuarios ativos, chama o
          // Stripe), deixando o cliente sem saber se a troca aconteceu ou nao.
          if (confirmBusy) return;
          if (!value) setChangeConfirm(null);
        }}
        size={
          changeConfirm?.preview.requiresUserSelection || changeConfirm?.preview.requiresCompanySelection
            ? "md"
            : "sm"
        }
        closeable={!confirmBusy}
        closeOnOverlayClick={!confirmBusy}
        closeOnEsc={!confirmBusy}
      >
        {changeConfirm ? (
          <div className="flex flex-col gap-4 p-1">
            <h3 className="text-lg font-semibold text-sg-text">
              Trocar para {changeConfirm.plan.name}
            </h3>
            {changeConfirm.preview.downgrade ? (
              <p className="text-sm text-sg-muted">
                É um downgrade: passa a valer no <span className="font-medium text-sg-text">próximo ciclo</span>,
                sem cobrança agora. Você mantém a cota atual até lá.
              </p>
            ) : (
              <p className="text-sm text-sg-muted">
                Upgrade entra na hora. Cobramos agora{" "}
                <span className="font-medium text-sg-text">apenas a diferença proporcional</span>{" "}
                pelo restante do ciclo:{" "}
                <span className="font-semibold text-sg-text">
                  {changeConfirm.preview.amountDue == null
                    ? "—"
                    : formatCents(changeConfirm.preview.amountDue, changeConfirm.preview.currency)}
                </span>
                . Na renovação, o valor cheio do novo plano.
              </p>
            )}

            {changeConfirm.preview.requiresUserSelection ? (
              <div className="flex flex-col gap-2 rounded-sg border border-amber-200 bg-amber-50 p-3">
                {requiredUserSelectionCount === 0 ? (
                  <p className="text-sm text-amber-900">
                    Este plano só permite que o administrador fique ativo. Os demais{" "}
                    {(changeConfirm.preview.eligibleUsers ?? []).length} usuário(s) perderão o
                    acesso quando o downgrade se efetivar (dá para reeditar depois, a qualquer
                    momento).
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-amber-900">
                      Este plano permite que você tenha{" "}
                      <span className="font-medium">{changeConfirm.preview.maxUsers}</span>{" "}
                      usuário(s) ativo(s). Selecione mais{" "}
                      <span className="font-medium">{requiredUserSelectionCount}</span> usuário(s)
                      para compor o seu plano (dá para reeditar depois, a qualquer momento).
                    </p>
                    <UserSelectionChecklist
                      id="change-plan-user-selection"
                      users={changeConfirm.preview.eligibleUsers ?? []}
                      lockedUsers={changeConfirm.preview.alwaysActiveUsers ?? []}
                      requiredCount={requiredUserSelectionCount}
                      selected={selectedUserIds}
                      onChange={setSelectedUserIds}
                      countLabel="Ficam ativos"
                      mismatchMessage={`Selecione exatamente ${requiredUserSelectionCount} usuário(s) para confirmar.`}
                    />
                  </>
                )}
              </div>
            ) : null}

            {changeConfirm.preview.requiresCompanySelection ? (
              <div className="flex flex-col gap-2 rounded-sg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  Este plano comporta menos empresas do que as ativas hoje. Escolha quais ficam
                  ativas, quais passam para somente leitura e quais são desligadas.
                </p>
                <div className="flex items-center gap-3">
                  <SgButton
                    appearance="outline"
                    severity="secondary"
                    disabled={confirmBusy}
                    onClick={() => setCompanyDialogOpen(true)}
                  >
                    {companySelection ? "Rever escolha de empresas" : "Escolher empresas"}
                  </SgButton>
                  <span className="text-xs text-amber-900">
                    {companySelection ? "Escolha concluída." : "Escolha pendente."}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <SgButton
                appearance="outline"
                severity="secondary"
                disabled={confirmBusy}
                onClick={() => setChangeConfirm(null)}
              >
                Cancelar
              </SgButton>
              <SgButton
                appearance="solid"
                severity="primary"
                disabled={!canConfirmChange}
                loading={confirmBusy}
                onClick={() => void confirmChange()}
              >
                Confirmar troca
              </SgButton>
            </div>
          </div>
        ) : null}
      </SgDialog>

      <DowngradeCompanySelectionDialog
        open={companyDialogOpen && changeConfirm?.preview.requiresCompanySelection === true}
        onOpenChange={setCompanyDialogOpen}
        initialState={changeConfirm?.preview.companySelection ?? null}
        previousSelection={companySelection}
        onConfirm={setCompanySelection}
      />

      <SgDialog
        open={checkoutConfirm != null}
        onOpenChange={(value) => {
          // Mesmo padrao do dialog de troca: nao fecha sozinho enquanto a requisicao esta em
          // andamento.
          if (checkoutConfirmBusy) return;
          if (!value) setCheckoutConfirm(null);
        }}
        size="md"
        closeable={!checkoutConfirmBusy}
        closeOnOverlayClick={!checkoutConfirmBusy}
        closeOnEsc={!checkoutConfirmBusy}
      >
        {checkoutConfirm ? (
          <div className="flex flex-col gap-4 p-1">
            <h3 className="text-lg font-semibold text-sg-text">
              Assinar {checkoutConfirm.plan.name}
            </h3>
            {checkoutConfirm.preview.requiresUserSelection ? (
            <div className="flex flex-col gap-2 rounded-sg border border-amber-200 bg-amber-50 p-3">
              {checkoutRequiredCount === 0 ? (
                <p className="text-sm text-amber-900">
                  Este plano só permite que o administrador fique ativo. Os demais{" "}
                  {checkoutConfirm.preview.eligibleUsers.length} usuário(s) (cadastrados durante o
                  teste) perderão o acesso quando o 1º ciclo terminar (dá para reeditar depois, a
                  qualquer momento).
                </p>
              ) : (
                <>
                  <p className="text-sm text-amber-900">
                    Este plano permite que você tenha{" "}
                    <span className="font-medium">{checkoutConfirm.preview.maxUsers}</span>{" "}
                    usuário(s) ativo(s). Selecione mais{" "}
                    <span className="font-medium">{checkoutRequiredCount}</span> usuário(s) para
                    compor o seu plano (dá para reeditar depois, a qualquer momento).
                  </p>
                  <UserSelectionChecklist
                    id="checkout-user-selection"
                    users={checkoutConfirm.preview.eligibleUsers}
                    lockedUsers={checkoutConfirm.preview.alwaysActiveUsers ?? []}
                    requiredCount={checkoutRequiredCount}
                    selected={selectedUserIds}
                    onChange={setSelectedUserIds}
                    countLabel="Ficam ativos"
                    mismatchMessage={`Selecione exatamente ${checkoutRequiredCount} usuário(s) para continuar.`}
                  />
                </>
              )}
            </div>
            ) : null}

            {checkoutConfirm.preview.requiresCompanySelection ? (
              <div className="flex flex-col gap-2 rounded-sg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  Este plano comporta menos empresas do que as ativas hoje. Escolha quais ficam
                  ativas, quais passam para somente leitura e quais são desligadas (dá para
                  reeditar depois, até o fim do ciclo).
                </p>
                <div className="flex items-center gap-3">
                  <SgButton
                    appearance="outline"
                    severity="secondary"
                    disabled={checkoutConfirmBusy}
                    onClick={() => setCheckoutCompanyDialogOpen(true)}
                  >
                    {companySelection ? "Rever escolha de empresas" : "Escolher empresas"}
                  </SgButton>
                  <span className="text-xs text-amber-900">
                    {companySelection ? "Escolha concluída." : "Escolha pendente."}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <SgButton
                appearance="outline"
                severity="secondary"
                disabled={checkoutConfirmBusy}
                onClick={() => setCheckoutConfirm(null)}
              >
                Cancelar
              </SgButton>
              <SgButton
                appearance="solid"
                severity="primary"
                disabled={!canConfirmCheckout}
                loading={checkoutConfirmBusy}
                onClick={() => void confirmCheckoutWithSelection()}
              >
                Continuar para pagamento
              </SgButton>
            </div>
          </div>
        ) : null}
      </SgDialog>

      <DowngradeCompanySelectionDialog
        open={checkoutCompanyDialogOpen && checkoutConfirm?.preview.requiresCompanySelection === true}
        onOpenChange={setCheckoutCompanyDialogOpen}
        initialState={checkoutConfirm?.preview.companySelection ?? null}
        previousSelection={companySelection}
        onConfirm={setCompanySelection}
      />
    </div>
  );
}

interface SubscriptionPlansModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Aviso opcional no topo (ex.: fim do trial). */
  readonly notice?: string;
  /** Chamado quando o plano comprado fica ativo ou trocado (o pai fecha o modal e atualiza). */
  readonly onSubscriptionActivated?: (result?: PlanChangeResult) => void;
  /** Chamado quando o polling de confirmação do checkout desiste (~3 min) — ver {@link SubscriptionPlansProps.onCheckoutTimeout}. */
  readonly onCheckoutTimeout?: (planName: string) => void;
  /** "checkout" (1ª assinatura) ou "change" (troca de plano da assinatura existente). */
  readonly mode?: "checkout" | "change";
}

/**
 * Modal de assinatura reutilizável: uma única tela (sem título de chrome separado,
 * só o botão de fechar do dialog) com a landing de planos dentro. Sempre fechável —
 * a cobrança do trial é garantida no backend, então fechar só dispensa o aviso.
 */
export function SubscriptionPlansModal({
  open,
  onOpenChange,
  notice,
  onSubscriptionActivated,
  onCheckoutTimeout,
  mode = "checkout",
}: SubscriptionPlansModalProps) {
  return (
    <SgDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      closeable
      closeOnOverlayClick
      closeOnEsc
    >
      <SubscriptionPlans
        notice={notice}
        onSubscriptionActivated={onSubscriptionActivated}
        onCheckoutTimeout={onCheckoutTimeout}
        mode={mode}
      />
    </SgDialog>
  );
}
