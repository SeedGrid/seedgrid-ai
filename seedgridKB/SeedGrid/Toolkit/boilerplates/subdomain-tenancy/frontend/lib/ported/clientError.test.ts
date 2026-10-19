import { describe, expect, it, vi } from "vitest";

import {
  SESSION_EXPIRED_MESSAGE,
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
