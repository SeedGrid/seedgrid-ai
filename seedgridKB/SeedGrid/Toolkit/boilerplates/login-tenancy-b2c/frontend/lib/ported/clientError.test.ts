import { describe, expect, it, vi } from "vitest";

import {
  SESSION_EXPIRED_MESSAGE,
  COMPANY_DISABLED_MESSAGE,
  COMPANY_READ_ONLY_MESSAGE,
  SESSION_REVOKED_MESSAGE,
  isSessionExpiredError,
  notifySessionExpired,
  onSessionExpired,
  readError,
} from "./clientError";

describe("readError", () => {
  it("extracts validation messages from problem details", () => {
    expect(
      readError({
        violations: [{ message: "Campo obrigatorio" }, { message: "Email invalido" }],
      }),
    ).toBe("Campo obrigatorio\nEmail invalido");
  });

  it("normalizes inactive subscription errors", () => {
    expect(readError("Active subscription not found for tenant")).toBe(
      "Sua conta ainda nao possui um plano ativo de solicitacoes. Vincule uma assinatura antes de usar o chat de IA.",
    );
  });

  it("reads detail from serialized problem json", () => {
    expect(readError(JSON.stringify({ detail: "Falha no backend" }))).toBe("Falha no backend");
  });

  it("returns generic fallback for unknown values", () => {
    expect(readError(undefined)).toBe("Erro inesperado.");
  });

  // O jargao do backend nao pode chegar ao usuario final: era exatamente esta string que aparecia
  // (duas vezes) na tela de Meus Relatorios quando a sessao morria.
  it("traduz o jargao de refresh token para a mensagem de sessao expirada", () => {
    expect(readError("Refresh token invalido ou reutilizado")).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("traduz sessao expirada vinda em problem+json", () => {
    expect(readError(JSON.stringify({ detail: "Invalid or reused refresh token" }))).toBe(
      SESSION_EXPIRED_MESSAGE,
    );
  });

  it("traduz a falta de sessao local", () => {
    expect(readError("Sessao autenticada nao encontrada.")).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("e' idempotente: a propria mensagem amigavel continua reconhecida", () => {
    expect(readError(SESSION_EXPIRED_MESSAGE)).toBe(SESSION_EXPIRED_MESSAGE);
  });
});

describe("isSessionExpiredError", () => {
  it("reconhece o erro cru do refresh, com ou sem acento", () => {
    expect(isSessionExpiredError("Refresh token invalido ou reutilizado")).toBe(true);
    expect(isSessionExpiredError("Sua sessão expirou. Entre novamente.")).toBe(true);
    expect(isSessionExpiredError(new Error("REFRESH TOKEN EXPIRED"))).toBe(true);
  });

  it("nao confunde erro comum com sessao morta", () => {
    expect(isSessionExpiredError("Nao foi possivel conectar ao servidor.")).toBe(false);
    expect(isSessionExpiredError("Campo obrigatorio")).toBe(false);
    // TempToken do 2FA: quem trata e' a propria tela de login, nao pode virar deslogue global.
    expect(isSessionExpiredError("Invalid or expired session")).toBe(false);
    expect(isSessionExpiredError(undefined)).toBe(false);
  });
});

describe("onSessionExpired", () => {
  it("avisa os assinantes e permite cancelar a assinatura", () => {
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    notifySessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    notifySessionExpired();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("um assinante que estoura nao impede os demais de rodar", () => {
    const quebrado = vi.fn(() => {
      throw new Error("boom");
    });
    const bom = vi.fn();
    const cancelarQuebrado = onSessionExpired(quebrado);
    const cancelarBom = onSessionExpired(bom);

    expect(() => notifySessionExpired()).not.toThrow();
    expect(bom).toHaveBeenCalledTimes(1);

    cancelarQuebrado();
    cancelarBom();
  });
});

describe("SESSION_REVOKED", () => {
  it("traduz o problem+json com code SESSION_REVOKED para a mensagem de sessao encerrada", () => {
    expect(
      readError({ status: 401, code: "SESSION_REVOKED", detail: "Session revoked by server" }),
    ).toBe(SESSION_REVOKED_MESSAGE);
    expect(readError(JSON.stringify({ status: 401, code: "SESSION_REVOKED" }))).toBe(
      "Sua sessão foi encerrada. Entre novamente.",
    );
  });

  it("trata a sessao revogada como sessao morta (leva ao login)", () => {
    expect(isSessionExpiredError({ code: "SESSION_REVOKED" })).toBe(true);
    expect(isSessionExpiredError("Sua sessão foi encerrada. Entre novamente.")).toBe(true);
  });

  it("nao confunde outros codes com sessao revogada", () => {
    expect(readError({ code: "PASSWORD_CHANGE_REQUIRED", detail: "Troque a senha" })).toBe(
      "Troque a senha",
    );
    expect(isSessionExpiredError({ code: "COMPANY_READ_ONLY", detail: "Somente leitura" })).toBe(
      false,
    );
  });
});

describe("COMPANY_READ_ONLY / COMPANY_DISABLED", () => {
  it("COMPANY_READ_ONLY vira a mensagem de upgrade e NAO derruba a sessao", () => {
    const body = { status: 403, code: "COMPANY_READ_ONLY", companyPublicId: "c1" };
    expect(readError(body)).toBe(COMPANY_READ_ONLY_MESSAGE);
    expect(readError(JSON.stringify(body))).toBe(COMPANY_READ_ONLY_MESSAGE);
    expect(isSessionExpiredError(body)).toBe(false);
  });

  it("COMPANY_DISABLED vira a mensagem de empresa desativada e leva ao login", () => {
    const body = { status: 403, code: "COMPANY_DISABLED" };
    expect(readError(body)).toBe(COMPANY_DISABLED_MESSAGE);
    expect(readError(JSON.stringify(body))).toBe(COMPANY_DISABLED_MESSAGE);
    expect(isSessionExpiredError(body)).toBe(true);
    expect(isSessionExpiredError(COMPANY_DISABLED_MESSAGE)).toBe(true);
  });
});

describe("readError: selecao de empresas (T5.13)", () => {
  it("INVALID_COMPANY_SELECTION vira mensagem amigavel mesmo vindo como problem+json em texto", () => {
    const body = JSON.stringify({ status: 400, code: "INVALID_COMPANY_SELECTION", detail: "contagem errada" });
    expect(readError(body)).toMatch(/não confere/);
  });
});
