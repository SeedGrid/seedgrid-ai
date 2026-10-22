import type { DowngradeCompanySelectionState } from "../downgrade-company-selection";

// Tipos das duas telas portadas do `seedgrid-report-client` (Signup e Assinatura).
//
// Sao o contrato dos endpoints `/public/signup/**` (login-tenancy) e `/me/{plans,subscription,
// billing/**}` (seedgrid-billing); mexer neles aqui sem mexer no backend quebra a tela em silencio.

/**
 * Campos DESTE produto no term que NAO sao contador de uso (plan_terms.additional_attributes). Franquia e
 * excedente sao de cada contador, em `meters`.
 */
export type PlanTermAttributes = {
  supportLevel?: "standard" | "priority";
  [key: string]: unknown;
};

/**
 * Franquia e excedente de UM contador de uso no plano. Os contadores sao declarados pelo produto no
 * backend (billing/AppUsageMeters.java); guia em docs/contadores-de-uso.md.
 */
export type PlanTermMeter = {
  meter: string;
  label: string;
  declared: boolean;
  includedUnits: number;
  overagePrice: number | string;
  overagePublished: boolean;
};

/** Saldo de UM contador no ciclo. */
export type CycleMeter = {
  meter: string;
  label: string;
  includedUnits: number;
  usedUnits: number;
  overageUnits: number;
  remainingUnits: number;
  /** O plano cobra excedente deste contador: esgotar a franquia NAO bloqueia. */
  overageCharged: boolean;
};

/** Ciclo de cobranca: um saldo por contador de uso que o plano inclui. */
export type SubscriptionCycle = {
  id: string;
  periodStart: string;
  periodEnd: string;
  meters: CycleMeter[];
};

/** O que a conta pode fazer agora (mesmo `code` do 402 que o consumo daria). */
export type UsageAccess = {
  canConsume: boolean;
  code: string | null;
  message: string | null;
};

/**
 * GET /me/usage: saldo de cada contador e, por contador declarado, se 1 unidade passaria agora.
 * `access` e' o da ASSINATURA (vale para todos os contadores).
 */
export type UsageResponse = {
  billingCycle: SubscriptionCycle | null;
  subscriptionStatus: string | null;
  trial: boolean;
  access: UsageAccess;
  meterAccess: Record<string, UsageAccess>;
};

export type SubscriptionResponse = {
  tenantId: string;
  subscriptionId: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  billingDay: number | null;
  plan: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isTrial?: boolean;
    upgradePromptThresholdPercent?: number;
    quotaWarningRemainingPercent?: number;
    quotaCriticalRemainingPercent?: number;
  } | null;
  planTerm: {
    publicId: string;
    monthlyPrice: number | string;
    maxUsers: number | null;
    meters: PlanTermMeter[];
    effectiveFrom: string;
    effectiveTo: string | null;
    featuresJson: string | null;
    published: boolean;
    additionalAttributes: PlanTermAttributes;
  } | null;
  billingCycle: SubscriptionCycle;
  /** Troca de plano agendada (downgrade) que entra em vigor no próximo ciclo. */
  pendingChange: {
    planId: string | null;
    planCode: string | null;
    planName: string | null;
    monthlyPrice: number | string | null;
    meters: PlanTermMeter[] | null;
    additionalAttributes: PlanTermAttributes | null;
    effectiveAt: string | null;
  } | null;
  /**
   * Precisa de selecao de "quem perde acesso" AGORA — cobre o downgrade agendado (pendingChange
   * acima) e tambem o caso sem agendamento: assinar (checkout, trial -> pago) direto num plano
   * com menos vagas do que os usuarios ativos hoje. Ver GET/PUT /me/billing/downgrade-user-selection.
   */
  requiresUserSelection: boolean;
  /** Cancelamento agendado: acesso mantido até cancelEffectiveAt; pode reativar até lá. */
  cancelAtPeriodEnd: boolean;
  cancelEffectiveAt: string | null;
};


// Item do catalogo de planos assinaveis (tela/modal de assinatura).
export type PlanCatalogItem = {
  planId: string;
  planTermId: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number | string;
  additionalAttributes: PlanTermAttributes;
  maxUsers: number | null;
  /** Franquia e excedente de cada contador de uso que o plano inclui. */
  meters: PlanTermMeter[];
  /** Beneficios em JSON array de strings; pode ser livre/legado. */
  featuresJson: string | null;
  /** So permite assinar se houver priceId configurado no provedor. */
  checkoutEnabled: boolean;
  /** Plano da assinatura ativa atual do tenant. */
  current: boolean;
  /** Destino de um downgrade ja agendado: a UI desabilita o botao e mostra "Downgrade agendado". */
  pendingDowngrade?: boolean;
};

export type PlansPendingChange = {
  planId: string;
  planName: string;
  /** ISO date-time em que o downgrade passa a valer (inicio do proximo ciclo). */
  effectiveAt: string | null;
};

export type PlansCatalogResponse = {
  items: PlanCatalogItem[];
  /** Downgrade agendado, se houver (para o banner da tela de planos). */
  pendingChange?: PlansPendingChange | null;
};

export type CheckoutSessionResponse = {
  provider: string | null;
  checkoutUrl: string;
  checkoutSessionId: string | null;
};

// Sessao do customer portal do provedor (extrato, trocar cartao, cancelar pelo painel).
export type PortalSessionResponse = {
  provider: string | null;
  portalUrl: string;
};

// Fatura/cobranca do provedor. Valores monetarios em centavos (menor unidade da moeda).
export type InvoiceSummary = {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number | null;
  amountPaid: number | null;
  currency: string | null;
  /** Epoch em segundos (Stripe). */
  createdAt: number | null;
  periodStart: number | null;
  periodEnd: number | null;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
};

export type InvoicesResponse = {
  invoices: InvoiceSummary[];
};

// Prévia da próxima fatura (preço fixo do próximo ciclo + excedente acumulado). Centavos / epoch s.
export type UpcomingInvoiceLine = {
  description: string | null;
  amountCents: number | null;
  quantity: number | null;
};

export type UpcomingInvoice = {
  amountDueCents: number | null;
  totalCents: number | null;
  currency: string | null;
  nextPaymentAttempt: number | null;
  periodStart: number | null;
  periodEnd: number | null;
  lines: UpcomingInvoiceLine[];
};

export type UpcomingInvoiceResponse = {
  upcoming: UpcomingInvoice | null;
};

// Usuario ativo elegivel para ser escolhido na tela de "quem perde acesso" (downgrade agendado).
export type DowngradeEligibleUser = {
  publicId: string;
  name: string;
  email: string;
};

// Previa da troca de plano: upgrade cobra o rateio agora (immediate); downgrade e agendado.
// Downgrade cujo plano novo tem menos vagas de usuario do que os ativos hoje traz tambem os
// campos de selecao (requiresUserSelection etc.) — o cliente escolhe quem perde acesso JA na
// tela de confirmacao, e manda tudo junto no POST /change-plan (acao atomica: ou faz o downgrade
// com a selecao, ou nao faz nada). O billing devolve esses campos em `seatSelection`; o BFF
// (app/api/me/billing/change-preview) os traz para o nivel de cima, que e' como a tela os le.
export type ChangePreview = {
  downgrade: boolean;
  immediate: boolean;
  amountDue: number | null;
  currency: string | null;
  requiresUserSelection?: boolean;
  maxUsers?: number | null;
  currentActiveUsers?: number;
  requiredCount?: number;
  eligibleUsers?: DowngradeEligibleUser[];
  // Responsavel pelo cadastro: sempre ativo, exposto pra tela mostra-lo marcado/travado na
  // selecao (ele tambem ocupa 1 vaga do plano — sem isso a conta visual nao bate).
  alwaysActiveUsers?: DowngradeEligibleUser[];
  // Escolha de EMPRESAS (T5.5): quando o plano novo comporta menos empresas que as ativas hoje, a
  // previa traz o mesmo conteudo do `GET /me/billing/downgrade-company-selection` e a tela o abre
  // no `DowngradeCompanySelectionDialog`; a escolha vai no `companySelection` do POST /change-plan.
  requiresCompanySelection?: boolean;
  companySelection?: DowngradeCompanySelectionState;
};

// Previa ANTES de assinar (checkout, trial -> pago): se o plano tem menos vagas de usuario do
// que os ativos hoje, o cliente escolhe quem perde acesso JA na tela de confirmacao, antes de
// abrir o checkout no navegador — vai junto no POST /me/billing/checkout (acao atomica, ver
// BillingCheckoutResource#createCheckout: ou assina com a selecao, ou nao assina).
export type CheckoutPreview = {
  requiresUserSelection: boolean;
  maxUsers: number | null;
  currentActiveUsers: number;
  requiredCount: number;
  eligibleUsers: DowngradeEligibleUser[];
  alwaysActiveUsers?: DowngradeEligibleUser[];
  // Escolha de EMPRESAS no checkout (T5.13): quando o plano comporta menos empresas que as ativas
  // hoje, o preview traz `requiresCompanySelection` + `companySelection` (mesmo formato do GET
  // downgrade-company-selection). A escolha vai no `companySelection` do POST /me/billing/checkout.
  requiresCompanySelection?: boolean;
  companySelection?: DowngradeCompanySelectionState;
};

// Estado da selecao de "quem perde acesso" quando um downgrade agendado precisa dela (o plano
// novo tem menos vagas de usuario do que os ativos hoje). Ver MeBillingResource no report-api.
export type DowngradeUserSelectionState = {
  status: "OK" | "NO_PENDING_CHANGE";
  requiresUserSelection?: boolean;
  maxUsers?: number | null;
  currentActiveUsers?: number;
  requiredCount?: number;
  eligibleUsers?: DowngradeEligibleUser[];
  alwaysActiveUsers?: DowngradeEligibleUser[];
  selectedUserPublicIds?: string[];
};


export type SignupResult = {
  status: string;
  signupRequestId: string;
  verificationToken: string | null;
  accountId: string | null;
  // Se o e-mail de confirmacao SAIU. `null` = a resposta nao fala sobre entrega (confirm-email).
  // Falha de envio nao desfaz o cadastro: o codigo continua valido e o caminho e o reenvio —
  // mas a tela precisa avisar, em vez de mandar procurar na caixa de entrada e no spam.
  emailDelivered: boolean | null;
};

export type CnpjSignupStatus = "AVAILABLE" | "REGISTERED" | "PENDING_CONFIRMATION";

export type CnpjStatusResult = {
  status: CnpjSignupStatus;
  // So vem em PENDING_CONFIRMATION, e mascarado (ex.: lu****@gmail.com): o dono reconhece o
  // proprio cadastro sem que quem digitou um CNPJ descubra e-mail de terceiro.
  pendingEmailMasked: string | null;
};

