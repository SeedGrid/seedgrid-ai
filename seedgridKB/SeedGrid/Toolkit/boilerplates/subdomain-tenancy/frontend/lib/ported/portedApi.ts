"use client";

// ---------------------------------------------------------------------------
// O SEAM DO PORT — e o UNICO lugar onde a cópia literal nao foi possivel.
//
// No `seedgrid-report-client` as telas chamam `invoke<T>("comando_rust")`: o HTTP vive em Rust
// (`src-tauri/src/infra/http.rs` + `comandos/{auth,billing}.rs`). Aqui elas chamam `fetch` para uma
// rota do BFF do proprio Next. TROCOU-SE O TRANSPORTE, E SO' ELE: cada funcao abaixo tem o MESMO
// nome, a MESMA assinatura e o MESMO tipo de retorno da funcao homonima em
// `seedgrid-report-client/src/api.ts`, para que o corpo das telas portadas fique intacto.
//
// Convencao de erro tambem preservada: o `invoke` do Tauri REJEITA COM STRING (o `map_err(to_message)`
// do Rust), e as telas fazem `typeof err === "string" ? err : "Falha ao ..."`. Por isso `request()`
// rejeita com string — a mensagem que o `readError` (lib/ported/clientError.ts) sabe normalizar.
// Rejeitar com `Error` aqui faria toda tela cair no texto generico e perder a mensagem do backend.
//
// Sessao: NAO ha token neste arquivo. O cookie httpOnly viaja sozinho no fetch same-origin e quem
// renova no 401 e' o `lib/seedgrid-app-api-server.ts`, server-side. UM UNICO cliente HTTP por app
// (PLAN.md §6.1) — nada de `renovarUmaVezSo` client-side aqui.
// ---------------------------------------------------------------------------

import {
  buildChangePlanBody,
  buildCheckoutBody,
  buildSaveCompanySelectionBody,
  type CompanySelection,
  type DowngradeCompanySelectionState,
} from "../downgrade-company-selection";
import type {
  ChangePreview,
  CheckoutPreview,
  CheckoutSessionResponse,
  CnpjStatusResult,
  DowngradeUserSelectionState,
  InvoicesResponse,
  PlansCatalogResponse,
  PortalSessionResponse,
  SignupResult,
  SubscriptionResponse,
  UpcomingInvoiceResponse,
} from "./billingTypes";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { cache: "no-store", ...init });
  } catch {
    // Equivalente do `ClientError` de rede do Rust; o texto e' um dos
    // CONNECTION_ERROR_HINTS, entao a tela mostra "Reconectando..." em vez de banner vermelho.
    return Promise.reject("Nao foi possivel conectar ao servidor. Tente novamente.");
  }

  const text = await response.text();

  if (!response.ok) {
    // O corpo cru (problem+json do backend, repassado pelo BFF) vai como string: o `readError`
    // parseia e extrai `violations`/`detail`/`title`. Era exatamente o que o Rust fazia.
    return Promise.reject(text || `HTTP ${response.status}`);
  }

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function postJson<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

// ===========================================================================
// SIGNUP — comandos/auth.rs
// ===========================================================================

// Cadastro rico de empresa (tenant). Espelha o SignupRequest da API (sem subdomain).
export interface SignupPayload {
  subdomain: string;
  cnpj: string;
  corporateName: string;
  tradeName: string;
  rootEmail: string;
  plainRootPassword: string;
  address: {
    street: string;
    number: string;
    complement: string;
    postalCode: string;
    city: string;
    state: string;
    district: string;
    phone: string;
  };
  legalRepresentative: {
    firstName: string;
    lastName: string;
    cpf: string;
    birthDate: string;
    phone: string;
    whatsapp: string;
  };
}

/** `invoke("sign_up")` -> POST /public/signup */
export function signUp(payload: SignupPayload) {
  return postJson<SignupResult>("/api/signup", payload);
}

// Consulta publica de CNPJ para autopreencher o signup. Retorna o JSON cru da publica.cnpj.ws,
// ou null se nao encontrado. Usado como publicaCnpjFetch do SgInputCNPJ.
/** `invoke("lookup_cnpj")` -> GET https://publica.cnpj.ws/cnpj/{cnpj}, via BFF (CORS) */
export function lookupCnpj(cnpj: string): Promise<unknown> {
  return request<unknown>(`/api/signup/cnpj-lookup?cnpj=${encodeURIComponent(cnpj)}`);
}

/** `invoke("confirm_signup_email")` -> POST /public/signup/confirm-email */
export function confirmSignupEmail(subdomain: string, code: string) {
  return postJson<SignupResult>("/api/signup/confirm-email", { subdomain, code });
}

/** `invoke("resend_signup_email")` -> POST /public/signup/resend-email */
export function resendSignupEmail(subdomain: string) {
  return postJson<SignupResult>("/api/signup/resend-email", { subdomain });
}

// ===========================================================================
// BILLING / ASSINATURA — comandos/billing.rs
// ===========================================================================

/**
 * `invoke("refresh_subscription")` -> GET /me/subscription
 *
 * Billing e' OPCIONAL: sem plano (404) ou sem permissao (403) o Rust devolvia None, nunca erro
 * (`optional_billing` em infra/http.rs). Quem reproduz isso agora e' a rota de BFF, que devolve
 * `null` nesses dois status — a tela continua lendo `SubscriptionResponse | null`.
 */
export function refreshSubscription() {
  return request<SubscriptionResponse | null>("/api/me/subscription");
}

/** `invoke("list_plans")` -> GET /me/plans */
export function listPlans() {
  return request<PlansCatalogResponse>("/api/me/plans");
}

/** `invoke("get_checkout_preview")` -> GET /me/billing/checkout/preview?planId= */
export function getCheckoutPreview(planId: string) {
  return request<CheckoutPreview>(
    `/api/me/billing/checkout/preview?planId=${encodeURIComponent(planId)}`,
  );
}

// userPublicIdsToDeactivate: obrigatorio quando o checkout exige selecao de quem perde acesso
// (ver CheckoutPreview.requiresUserSelection) — o servidor valida ANTES de criar a sessao no
// provedor, entao assinar e a selecao acontecem juntas ou nao acontece nenhuma das duas.
/** `invoke("start_checkout")` -> POST /me/billing/checkout */
export function startCheckout(
  planId: string,
  userPublicIdsToDeactivate?: string[],
  companySelection?: CompanySelection | null,
) {
  return postJson<CheckoutSessionResponse>(
    "/api/me/billing/checkout",
    buildCheckoutBody(planId, userPublicIdsToDeactivate, companySelection),
  );
}

/** `invoke("get_change_preview")` -> GET /me/billing/change-preview?planId= */
export function getChangePreview(planId: string) {
  return request<ChangePreview>(
    `/api/me/billing/change-preview?planId=${encodeURIComponent(planId)}`,
  );
}

// Troca o plano da assinatura EXISTENTE (upgrade/downgrade) com rateio, sem novo checkout.
/** `invoke("change_plan")` -> POST /me/billing/change-plan */
export function changePlan(
  planId: string,
  userPublicIdsToDeactivate?: string[],
  companySelection?: CompanySelection | null,
) {
  return postJson<unknown>(
    "/api/me/billing/change-plan",
    buildChangePlanBody(planId, userPublicIdsToDeactivate, companySelection),
  );
}

/** `invoke("open_billing_portal")` -> POST /me/billing/portal */
export function openBillingPortal() {
  return postJson<PortalSessionResponse>("/api/me/billing/portal");
}

/** `invoke("cancel_subscription")` -> POST /me/billing/cancel */
export function cancelSubscription() {
  return postJson<unknown>("/api/me/billing/cancel");
}

/** `invoke("cancel_scheduled_change")` -> POST /me/billing/cancel-scheduled-change */
export function cancelScheduledChange() {
  return postJson<unknown>("/api/me/billing/cancel-scheduled-change");
}

/** `invoke("reactivate_subscription")` -> POST /me/billing/reactivate */
export function reactivateSubscription() {
  return postJson<unknown>("/api/me/billing/reactivate");
}

/** `invoke("get_downgrade_user_selection")` -> GET /me/billing/downgrade-user-selection */
export function getDowngradeUserSelection() {
  return request<DowngradeUserSelectionState>("/api/me/billing/downgrade-user-selection");
}

/** `invoke("save_downgrade_user_selection")` -> PUT /me/billing/downgrade-user-selection */
export function saveDowngradeUserSelection(userPublicIds: string[]) {
  return request<unknown>("/api/me/billing/downgrade-user-selection", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPublicIds }),
  });
}

/** GET /me/billing/downgrade-company-selection (T5.5): empresas elegiveis/protegidas do downgrade. */
export function getDowngradeCompanySelection() {
  return request<DowngradeCompanySelectionState>("/api/me/billing/downgrade-company-selection");
}

/**
 * PUT /me/billing/downgrade-company-selection (T5.13): reedita a escolha de empresas de um downgrade
 * ja agendado, enquanto o ciclo nao fecha. Erros: INVALID_COMPANY_SELECTION, COMPANY_SELECTION_NOT_REQUIRED.
 */
export function saveDowngradeCompanySelection(selection: CompanySelection) {
  return request<{ status: string }>("/api/me/billing/downgrade-company-selection", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildSaveCompanySelectionBody(selection)),
  });
}

/** `invoke("list_invoices")` -> GET /me/billing/invoices?limit= */
export function listInvoices(limit?: number) {
  return request<InvoicesResponse>(`/api/me/billing/invoices?limit=${limit ?? 12}`);
}

/** `invoke("get_upcoming_invoice")` -> GET /me/billing/upcoming */
export function getUpcomingInvoice() {
  return request<UpcomingInvoiceResponse>("/api/me/billing/upcoming");
}

/**
 * `@tauri-apps/plugin-opener` -> `window.open`.
 *
 * As telas chamavam `await openUrl(checkout.checkoutUrl)` para abrir o checkout/portal/fatura no
 * navegador do sistema. Na web isso e' uma aba nova. `noopener` porque a pagina de destino nao
 * pode ganhar handle da nossa (`window.opener`) — e' pagina de pagamento de terceiro.
 */
export async function openUrl(url: string): Promise<void> {
  window.open(url, "_blank", "noopener,noreferrer");
}
