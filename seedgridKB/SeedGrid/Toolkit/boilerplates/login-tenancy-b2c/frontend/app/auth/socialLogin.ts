// Logica pura do login social (Google, Facebook, ...): lista de provedores, regra do botao com termos,
// URLs de ida e volta, parser do retorno do backend e mensagens. Sem React nem Next, para testar com vitest.
//
// Fluxo: o navegador vai a `/api/auth/social/{provider}/start` (BFF), que redireciona ao backend; o backend
// fala com o provedor e volta ao `returnTo` (`/auth/social/callback`) com `?ticket=` (sucesso, uso unico) ou
// `?status=` (EMAIL_REQUIRED | TERMS_REQUIRED | REJECTED). O front nunca ve token de provedor.

import type { SignupConfig } from "@/lib/ported/portedApi";

export const SOCIAL_PROVIDER_LABELS: Record<string, string> = { google: "Google", facebook: "Facebook" };

/** Mesmo formato aceito pelo backend para o segmento `{provider}` (letras minusculas, digitos e hifen). */
export function isValidProviderId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z][a-z0-9-]{1,29}$/.test(id);
}

export function providerLabel(id: string): string {
  return SOCIAL_PROVIDER_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/** Provedores habilitados no host (`socialProviders` do `/public/signup/config`); ausente = nenhum botao. */
export function enabledProviders(config: Pick<SignupConfig, "socialProviders"> | null | undefined): string[] {
  const raw = config?.socialProviders;
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  for (const item of raw) {
    const id = typeof item === "string" ? item.trim().toLowerCase() : "";
    if (isValidProviderId(id)) {
      seen.add(id);
    }
  }
  return Array.from(seen);
}

/** O botao so habilita com os termos aceitos quando o host os exige. */
export function canStartSocial(config: Pick<SignupConfig, "termsRequired">, termsAccepted: boolean): boolean {
  return !config.termsRequired || termsAccepted;
}

/** Caminho do BFF que inicia o fluxo; a versao dos termos so vai quando exigidos E aceitos. */
export function buildStartPath(
  provider: string,
  config: Pick<SignupConfig, "termsRequired" | "termsVersion">,
  termsAccepted: boolean,
): string {
  const base = `/api/auth/social/${encodeURIComponent(provider)}/start`;
  if (!config.termsRequired || !termsAccepted) {
    return base;
  }
  const params = new URLSearchParams({ acceptedTerms: "true", termsVersion: config.termsVersion });
  return `${base}?${params.toString()}`;
}

/** Caminho da pagina que recebe a volta do backend (o `returnTo` que o BFF informa). */
export const SOCIAL_CALLBACK_PATH = "/auth/social/callback";

interface PublicBaseInput {
  /** `SOCIAL_RETURN_BASE_URL`: base publica fixa (recomendado em producao, atras de proxy). */
  envBase?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  /** `request.nextUrl.origin`. */
  origin: string;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Origem publica do app para montar o `returnTo`. O backend ainda confere `allowed-return-hosts`. */
export function resolvePublicBase(input: PublicBaseInput): string {
  const fixed = input.envBase?.trim();
  if (fixed) {
    return stripTrailingSlash(fixed);
  }
  const host = input.forwardedHost?.split(",")[0]?.trim();
  if (host && /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) {
    const proto = input.forwardedProto?.split(",")[0]?.trim().toLowerCase() === "http" ? "http" : "https";
    return `${proto}://${host}`;
  }
  return stripTrailingSlash(input.origin);
}

/** URL do backend para onde o BFF redireciona o navegador. */
export function buildBackendLoginUrl(
  apiBaseUrl: string,
  provider: string,
  returnBase: string,
  terms: { acceptedTerms: boolean; termsVersion: string | null },
): string {
  const params = new URLSearchParams({ returnTo: `${stripTrailingSlash(returnBase)}${SOCIAL_CALLBACK_PATH}` });
  if (terms.acceptedTerms && terms.termsVersion) {
    params.set("acceptedTerms", "true");
    params.set("termsVersion", terms.termsVersion);
  }
  return `${stripTrailingSlash(apiBaseUrl)}/public/auth/social/${encodeURIComponent(provider)}/login?${params.toString()}`;
}

export type SocialReturn =
  | { kind: "ticket"; ticket: string }
  | { kind: "emailRequired"; pending: string }
  | { kind: "termsRequired"; provider: string | null }
  | { kind: "rejected"; code: string | null }
  | { kind: "invalid" };

interface ParamReader {
  get(name: string): string | null;
}

/** Interpreta a query da volta do backend. Ticket vence qualquer `status`. */
export function parseSocialReturn(params: ParamReader): SocialReturn {
  const ticket = params.get("ticket")?.trim();
  if (ticket) {
    return { kind: "ticket", ticket };
  }
  const status = params.get("status")?.trim().toUpperCase();
  if (status === "EMAIL_REQUIRED") {
    const pending = (params.get("pendingToken") ?? params.get("pending"))?.trim();
    return pending ? { kind: "emailRequired", pending } : { kind: "invalid" };
  }
  if (status === "TERMS_REQUIRED") {
    const provider = params.get("provider")?.trim().toLowerCase();
    return { kind: "termsRequired", provider: isValidProviderId(provider) ? provider : null };
  }
  if (status === "REJECTED") {
    return { kind: "rejected", code: params.get("code")?.trim() || null };
  }
  return { kind: "invalid" };
}

const SOCIAL_ERROR_MESSAGES: Record<string, string> = {
  ACCESS_DENIED: "Você cancelou o acesso no provedor. Tente novamente quando quiser.",
  SOCIAL_PROVIDER_DISABLED: "Este tipo de login não está disponível.",
  SOCIAL_STATE_INVALID: "O login expirou ou foi aberto em outra aba. Comece de novo.",
  SOCIAL_EMAIL_NOT_VERIFIED:
    "O e-mail desta conta não está verificado no provedor. Entre com e-mail e senha ou confirme o e-mail no provedor.",
  SOCIAL_EMAIL_CONFLICT:
    "Já existe uma conta com este e-mail. Entre com e-mail e senha e vincule o login social no seu perfil.",
  SOCIAL_ACCOUNT_DISABLED: "Esta conta está desativada. Fale com o suporte.",
  TERMS_NOT_ACCEPTED: "É preciso aceitar os termos para continuar.",
  TERMS_VERSION_MISMATCH: "Os termos foram atualizados. Aceite a versão vigente para continuar.",
  SIGNUP_TYPE_NOT_ALLOWED: "Este cadastro não está disponível para o seu tipo de conta.",
  LAST_LOGIN_METHOD: "Você não pode remover o último método de entrada.",
  INVALID_EMAIL: "Informe um e-mail válido.",
  PENDING_EXPIRED: "O tempo para confirmar o e-mail acabou. Entre com o login social novamente.",
  INVALID_CODE: "Código inválido. Confira o código enviado ao seu e-mail.",
  TOO_MANY_ATTEMPTS: "Muitas tentativas com código inválido. Entre com o login social novamente.",
  EMAIL_ALREADY_REGISTERED:
    "Já existe uma conta com este e-mail. Entre com e-mail e senha e vincule o login social no seu perfil.",
  IDENTITY_ALREADY_LINKED: "Este login social já está vinculado a outra conta.",
  SOCIAL_SIGNUP_UNAVAILABLE: "O cadastro por login social não está disponível neste momento.",
  INVALID_PROFILE: "O provedor não devolveu os dados necessários para entrar.",
};

const GENERIC_SOCIAL_ERROR = "Não foi possível entrar com o login social. Tente novamente.";

export function socialErrorMessage(code: string | null | undefined): string {
  return (code && SOCIAL_ERROR_MESSAGES[code.trim().toUpperCase()]) || GENERIC_SOCIAL_ERROR;
}

/** Valida o e-mail pedido quando o provedor nao devolve (Facebook nem sempre devolve). */
export function validateSocialEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : "Informe um e-mail válido.";
}

export function buildEmailBody(pending: string, email: string): { pendingToken: string; email: string } {
  return { pendingToken: pending, email: email.trim().toLowerCase() };
}

export const EMAIL_CODE_LENGTH = 6;

/** Mantem so os digitos do codigo (aceita colar "123 456" ou "123-456"), no maximo 6. */
export function normalizeEmailCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, EMAIL_CODE_LENGTH);
}

/** Mensagem de erro do codigo de 6 digitos ou `null` se esta valido para enviar. */
export function validateEmailCode(raw: string): string | null {
  return normalizeEmailCode(raw).length === EMAIL_CODE_LENGTH ? null : "Digite os 6 dígitos do código enviado ao seu e-mail.";
}

/** Corpo do `POST /public/social/confirm-email`: o pendingToken fica no estado da pagina, nunca na URL. */
export function buildConfirmBody(pending: string, rawCode: string): { pendingToken: string; code: string } {
  return { pendingToken: pending, code: normalizeEmailCode(rawCode) };
}

/** Codigo errado permite tentar de novo; expirou, tentativas esgotadas ou conflito recomecam o login. */
export function isRetryableCodeError(code: string | null | undefined): boolean {
  return code?.trim().toUpperCase() === "INVALID_CODE";
}

/** Resultado de `SocialLoginResponseDTO` (status AUTHENTICATED | EMAIL_REQUIRED | EMAIL_CONFIRMATION_SENT | TERMS_REQUIRED | REJECTED). */
export type SocialOutcome =
  | { kind: "authenticated" }
  | { kind: "twoFactor"; tempToken: string; method: string | null }
  | { kind: "emailRequired"; pending: string }
  | { kind: "confirmationSent" }
  | { kind: "termsRequired" }
  | { kind: "rejected"; code: string | null }
  | { kind: "unknown" };

/**
 * Interpreta o corpo devolvido pelo BFF. O backend responde 200 tambem para REJECTED (com `code`), entao o
 * `status` manda, nao o HTTP. `2F_REQUIRED` vem do BFF quando o `auth` do backend pede segundo fator.
 */
export function interpretSocialResponse(payload: unknown): SocialOutcome {
  if (!payload || typeof payload !== "object") {
    return { kind: "unknown" };
  }
  const body = payload as Record<string, unknown>;
  const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
  switch (status) {
    case "AUTHENTICATED":
    case "OK":
      return { kind: "authenticated" };
    case "2F_REQUIRED":
      return typeof body.tempToken === "string"
        ? { kind: "twoFactor", tempToken: body.tempToken, method: typeof body.method === "string" ? body.method : null }
        : { kind: "unknown" };
    case "EMAIL_REQUIRED": {
      const pending = body.pendingToken ?? body.pending;
      return typeof pending === "string" && pending ? { kind: "emailRequired", pending } : { kind: "unknown" };
    }
    case "EMAIL_CONFIRMATION_SENT":
      return { kind: "confirmationSent" };
    case "TERMS_REQUIRED":
      return { kind: "termsRequired" };
    case "REJECTED":
      return { kind: "rejected", code: typeof body.code === "string" ? body.code : null };
    default:
      return { kind: "unknown" };
  }
}

/** Metodo de entrada vinculado (GET /me/identities). Nunca traz token do provedor. */
export interface LoginIdentity {
  publicId: string;
  provider: string;
  displayName: string | null;
  email: string | null;
  pictureUrl: string | null;
  linkedAt: string | null;
  lastLoginAt: string | null;
}

/** Aceita a lista pura ou `{items:[...]}`; descarta o que nao tem `publicId` e `provider`. */
export function parseIdentities(payload: unknown): LoginIdentity[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
      ? ((payload as { items: unknown[] }).items)
      : [];
  const out: LoginIdentity[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    if (typeof row.publicId !== "string" || typeof row.provider !== "string") {
      continue;
    }
    out.push({
      publicId: row.publicId,
      provider: row.provider.toLowerCase(),
      displayName: typeof row.displayName === "string" ? row.displayName : null,
      email: typeof row.email === "string" ? row.email : null,
      pictureUrl: typeof row.pictureUrl === "string" ? row.pictureUrl : null,
      linkedAt: typeof row.linkedAt === "string" ? row.linkedAt : null,
      lastLoginAt: typeof row.lastLoginAt === "string" ? row.lastLoginAt : null,
    });
  }
  return out;
}

/** Mensagem ao desvincular: 409 LAST_LOGIN_METHOD tem texto proprio; o resto usa o do backend. */
export function removeIdentityMessage(code: string | null | undefined, fallback: string): string {
  const key = code?.trim().toUpperCase();
  return key && SOCIAL_ERROR_MESSAGES[key] ? SOCIAL_ERROR_MESSAGES[key] : fallback;
}
