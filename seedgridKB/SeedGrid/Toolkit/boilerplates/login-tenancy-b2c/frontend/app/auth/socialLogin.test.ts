import { describe, expect, it } from "vitest";

import type { SignupConfig } from "@/lib/ported/portedApi";
import {
  buildBackendLoginUrl,
  buildEmailBody,
  buildStartPath,
  canStartSocial,
  enabledProviders,
  interpretSocialResponse,
  isValidProviderId,
  parseIdentities,
  parseSocialReturn,
  removeIdentityMessage,
  resolvePublicBase,
  socialErrorMessage,
  validateSocialEmail,
  buildConfirmBody,
  isRetryableCodeError,
  normalizeEmailCode,
  validateEmailCode,
} from "./socialLogin";

const noTerms: Pick<SignupConfig, "termsRequired" | "termsVersion"> = { termsRequired: false, termsVersion: "" };
const withTerms: Pick<SignupConfig, "termsRequired" | "termsVersion"> = { termsRequired: true, termsVersion: "3" };
const params = (query: string) => new URLSearchParams(query);

describe("provedores habilitados", () => {
  it("sem lista nenhum botao aparece", () => {
    expect(enabledProviders(undefined)).toEqual([]);
    expect(enabledProviders({})).toEqual([]);
  });

  it("normaliza, deduplica e descarta ids invalidos", () => {
    expect(enabledProviders({ socialProviders: ["Google", "facebook", "google", "../x", "", "a"] })).toEqual([
      "google",
      "facebook",
    ]);
  });

  it("valida o formato do segmento do provedor", () => {
    expect(isValidProviderId("google")).toBe(true);
    expect(isValidProviderId("github-enterprise")).toBe(true);
    expect(isValidProviderId("Google")).toBe(false);
    expect(isValidProviderId("a/b")).toBe(false);
    expect(isValidProviderId(undefined)).toBe(false);
  });
});

describe("botao com termos", () => {
  it("sem termos exigidos o botao esta sempre habilitado", () => {
    expect(canStartSocial(noTerms, false)).toBe(true);
  });

  it("com termos exigidos so habilita aceito", () => {
    expect(canStartSocial(withTerms, false)).toBe(false);
    expect(canStartSocial(withTerms, true)).toBe(true);
  });

  it("a versao dos termos so vai quando exigidos e aceitos", () => {
    expect(buildStartPath("google", noTerms, true)).toBe("/api/auth/social/google/start");
    expect(buildStartPath("google", withTerms, false)).toBe("/api/auth/social/google/start");
    expect(buildStartPath("facebook", withTerms, true)).toBe(
      "/api/auth/social/facebook/start?acceptedTerms=true&termsVersion=3",
    );
  });
});

describe("returnTo e URL do backend", () => {
  it("a base fixa vence qualquer header", () => {
    expect(resolvePublicBase({ envBase: "https://app.exemplo.com.br/", forwardedHost: "evil.test", origin: "http://x" })).toBe(
      "https://app.exemplo.com.br",
    );
  });

  it("usa o host encaminhado quando ele tem formato de host", () => {
    expect(resolvePublicBase({ forwardedHost: "app.exemplo.com.br", forwardedProto: "https", origin: "http://localhost:3001" })).toBe(
      "https://app.exemplo.com.br",
    );
    expect(resolvePublicBase({ forwardedHost: "localhost:3001", forwardedProto: "http", origin: "http://x" })).toBe(
      "http://localhost:3001",
    );
  });

  it("ignora host encaminhado malformado e cai na origem", () => {
    expect(resolvePublicBase({ forwardedHost: "evil.test/path?x", origin: "http://localhost:3001/" })).toBe(
      "http://localhost:3001",
    );
  });

  it("monta a URL do backend com returnTo e, se aceitos, os termos", () => {
    const url = buildBackendLoginUrl("http://api:8080/", "google", "https://app.test", {
      acceptedTerms: true,
      termsVersion: "3",
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("http://api:8080/public/auth/social/google/login");
    expect(parsed.searchParams.get("returnTo")).toBe("https://app.test/auth/social/callback");
    expect(parsed.searchParams.get("acceptedTerms")).toBe("true");
    expect(parsed.searchParams.get("termsVersion")).toBe("3");
  });

  it("sem termos aceitos nao envia termsVersion", () => {
    const url = new URL(
      buildBackendLoginUrl("http://api", "facebook", "https://app.test", { acceptedTerms: false, termsVersion: "3" }),
    );
    expect(url.searchParams.has("acceptedTerms")).toBe(false);
    expect(url.searchParams.has("termsVersion")).toBe(false);
  });
});

describe("retorno do backend", () => {
  it("ticket vence qualquer status", () => {
    expect(parseSocialReturn(params("ticket=abc&status=REJECTED"))).toEqual({ kind: "ticket", ticket: "abc" });
  });

  it("EMAIL_REQUIRED exige o pending", () => {
    expect(parseSocialReturn(params("status=email_required&pending=tok"))).toEqual({ kind: "emailRequired", pending: "tok" });
    expect(parseSocialReturn(params("status=EMAIL_REQUIRED"))).toEqual({ kind: "invalid" });
  });

  it("aceita pendingToken como nome do parametro do token pendente", () => {
    expect(parseSocialReturn(params("status=EMAIL_REQUIRED&pendingToken=tok2"))).toEqual({
      kind: "emailRequired",
      pending: "tok2",
    });
  });

  it("TERMS_REQUIRED carrega o provedor valido", () => {
    expect(parseSocialReturn(params("status=TERMS_REQUIRED&provider=facebook"))).toEqual({
      kind: "termsRequired",
      provider: "facebook",
    });
    expect(parseSocialReturn(params("status=TERMS_REQUIRED&provider=../x"))).toEqual({ kind: "termsRequired", provider: null });
  });

  it("REJECTED carrega o codigo", () => {
    expect(parseSocialReturn(params("status=REJECTED&code=ACCESS_DENIED"))).toEqual({ kind: "rejected", code: "ACCESS_DENIED" });
    expect(parseSocialReturn(params("status=REJECTED"))).toEqual({ kind: "rejected", code: null });
  });

  it("qualquer outra coisa e invalida", () => {
    expect(parseSocialReturn(params(""))).toEqual({ kind: "invalid" });
    expect(parseSocialReturn(params("status=OUTRO"))).toEqual({ kind: "invalid" });
  });
});

describe("mensagens", () => {
  it("codigos conhecidos tem texto proprio e os demais caem no generico", () => {
    expect(socialErrorMessage("access_denied")).toContain("cancelou");
    expect(socialErrorMessage("SOCIAL_EMAIL_NOT_VERIFIED")).toContain("verificado");
    expect(socialErrorMessage("QUALQUER")).toBe(socialErrorMessage(null));
  });

  it("LAST_LOGIN_METHOD mostra a mensagem do ultimo metodo; outros usam o fallback", () => {
    expect(removeIdentityMessage("LAST_LOGIN_METHOD", "x")).toBe("Você não pode remover o último método de entrada.");
    expect(removeIdentityMessage("OUTRO", "falha do backend")).toBe("falha do backend");
    expect(removeIdentityMessage(null, "falha do backend")).toBe("falha do backend");
  });

  it("valida e normaliza o e-mail pedido ao usuario", () => {
    expect(validateSocialEmail("maria@exemplo.com")).toBeNull();
    expect(validateSocialEmail("maria@")).not.toBeNull();
    expect(buildEmailBody("tok", "  Maria@Exemplo.com ")).toEqual({ pendingToken: "tok", email: "maria@exemplo.com" });
  });
});

describe("identidades da conta", () => {
  it("aceita lista pura ou items e descarta linhas incompletas", () => {
    const rows = [
      {
        publicId: "a",
        provider: "Google",
        displayName: "Maria",
        email: "m@x.com",
        pictureUrl: "https://p/x.png",
        linkedAt: "2026-10-19T10:00:00Z",
        lastLoginAt: "2026-10-19T11:00:00Z",
      },
      { publicId: "b", provider: "facebook" },
      { provider: "google" },
      null,
    ];
    const expected = [
      {
        publicId: "a",
        provider: "google",
        displayName: "Maria",
        email: "m@x.com",
        pictureUrl: "https://p/x.png",
        linkedAt: "2026-10-19T10:00:00Z",
        lastLoginAt: "2026-10-19T11:00:00Z",
      },
      { publicId: "b", provider: "facebook", displayName: null, email: null, pictureUrl: null, linkedAt: null, lastLoginAt: null },
    ];
    expect(parseIdentities(rows)).toEqual(expected);
    expect(parseIdentities({ items: rows })).toEqual(expected);
    expect(parseIdentities(null)).toEqual([]);
  });
});

describe("resposta do backend (SocialLoginResponseDTO)", () => {
  it("o status manda, nao o HTTP: REJECTED vem com 200 e carrega o code", () => {
    expect(interpretSocialResponse({ status: "REJECTED", code: "SOCIAL_EMAIL_NOT_VERIFIED" })).toEqual({
      kind: "rejected",
      code: "SOCIAL_EMAIL_NOT_VERIFIED",
    });
    expect(interpretSocialResponse({ status: "REJECTED" })).toEqual({ kind: "rejected", code: null });
  });

  it("AUTHENTICATED e OK (sessao gravada pelo BFF) entram", () => {
    expect(interpretSocialResponse({ status: "AUTHENTICATED" })).toEqual({ kind: "authenticated" });
    expect(interpretSocialResponse({ status: "OK", changePasswordRequired: false })).toEqual({ kind: "authenticated" });
  });

  it("2F_REQUIRED exige o tempToken", () => {
    expect(interpretSocialResponse({ status: "2F_REQUIRED", tempToken: "t", method: "TOTP" })).toEqual({
      kind: "twoFactor",
      tempToken: "t",
      method: "TOTP",
    });
    expect(interpretSocialResponse({ status: "2F_REQUIRED" })).toEqual({ kind: "unknown" });
  });

  it("EMAIL_REQUIRED, EMAIL_CONFIRMATION_SENT e TERMS_REQUIRED", () => {
    expect(interpretSocialResponse({ status: "EMAIL_REQUIRED", pendingToken: "p" })).toEqual({ kind: "emailRequired", pending: "p" });
    expect(interpretSocialResponse({ status: "EMAIL_REQUIRED" })).toEqual({ kind: "unknown" });
    expect(interpretSocialResponse({ status: "email_confirmation_sent" })).toEqual({ kind: "confirmationSent" });
    expect(interpretSocialResponse({ status: "TERMS_REQUIRED", termsVersion: "3" })).toEqual({ kind: "termsRequired" });
  });

  it("corpo vazio ou desconhecido nao autentica", () => {
    expect(interpretSocialResponse(null)).toEqual({ kind: "unknown" });
    expect(interpretSocialResponse("x")).toEqual({ kind: "unknown" });
    expect(interpretSocialResponse({ status: "QUALQUER" })).toEqual({ kind: "unknown" });
  });
});

describe("codigo de 6 digitos do e-mail", () => {
  it("normaliza: so digitos, no maximo 6", () => {
    expect(normalizeEmailCode("123 456")).toBe("123456");
    expect(normalizeEmailCode("123-456")).toBe("123456");
    expect(normalizeEmailCode("12345678")).toBe("123456");
    expect(normalizeEmailCode("abc")).toBe("");
  });

  it("valida exatamente 6 digitos", () => {
    expect(validateEmailCode("123456")).toBeNull();
    expect(validateEmailCode("123 456")).toBeNull();
    expect(validateEmailCode("12345")).toMatch(/6 dígitos/);
    expect(validateEmailCode("")).toMatch(/6 dígitos/);
  });

  it("corpo do confirm-email leva pendingToken e code, nunca token", () => {
    const body = buildConfirmBody("pend-1", "123 456");
    expect(body).toEqual({ pendingToken: "pend-1", code: "123456" });
    expect(Object.keys(body)).not.toContain("token");
  });

  it("so codigo invalido permite tentar de novo", () => {
    expect(isRetryableCodeError("INVALID_CODE")).toBe(true);
    expect(isRetryableCodeError(" invalid_code ")).toBe(true);
    expect(isRetryableCodeError("TOO_MANY_ATTEMPTS")).toBe(false);
    expect(isRetryableCodeError("PENDING_EXPIRED")).toBe(false);
    expect(isRetryableCodeError(null)).toBe(false);
  });

  it("mensagens do contrato: codigo invalido, expirado e tentativas esgotadas", () => {
    expect(socialErrorMessage("INVALID_CODE")).toMatch(/inválido/);
    expect(socialErrorMessage("PENDING_EXPIRED")).toMatch(/tempo/);
    expect(socialErrorMessage("TOO_MANY_ATTEMPTS")).toMatch(/tentativas/);
    expect(socialErrorMessage("EMAIL_ALREADY_REGISTERED")).toMatch(/Já existe uma conta/);
  });

  it("REJECTED com INVALID_CODE vem como 200 e e' interpretado pelo status", () => {
    expect(interpretSocialResponse({ status: "REJECTED", code: "INVALID_CODE" })).toEqual({ kind: "rejected", code: "INVALID_CODE" });
  });
});
