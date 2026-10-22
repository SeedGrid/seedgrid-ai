import { describe, expect, it } from "vitest";

import {
  SESSION_REVOKED_MESSAGE,
  extractProblemCode,
  isCompanyDisabledBody,
  isCompanyDisabledResponse,
  isCompanyDisabledSessionResponse,
  isCompanyReadOnlyBody,
  isSessionRevokedBody,
  isSessionRevokedResponse,
  readCompanyAccessCode,
} from "./api-error";

describe("extractProblemCode", () => {
  it("le o code de um objeto e de um texto JSON", () => {
    expect(extractProblemCode({ code: "SESSION_REVOKED" })).toBe("SESSION_REVOKED");
    expect(extractProblemCode('{"status":401,"code":"SESSION_REVOKED"}')).toBe("SESSION_REVOKED");
  });

  it("devolve null para corpo sem code, vazio ou que nao e JSON", () => {
    expect(extractProblemCode('{"status":401}')).toBeNull();
    expect(extractProblemCode("")).toBeNull();
    expect(extractProblemCode("Unauthorized")).toBeNull();
    expect(extractProblemCode("{quebrado")).toBeNull();
    expect(extractProblemCode(null)).toBeNull();
    expect(extractProblemCode({ code: 401 })).toBeNull();
  });
});

describe("SESSION_REVOKED", () => {
  it("a mensagem e a combinada com o usuario", () => {
    expect(SESSION_REVOKED_MESSAGE).toBe("Sua sessão foi encerrada. Entre novamente.");
  });

  it("reconhece so o code SESSION_REVOKED", () => {
    expect(isSessionRevokedBody('{"code":"SESSION_REVOKED"}')).toBe(true);
    expect(isSessionRevokedBody('{"code":"PASSWORD_CHANGE_REQUIRED"}')).toBe(false);
  });

  it("isSessionRevokedResponse so vale para 401 e nao consome o corpo original", async () => {
    const body = JSON.stringify({ status: 401, code: "SESSION_REVOKED" });
    const revoked = new Response(body, { status: 401 });
    expect(await isSessionRevokedResponse(revoked)).toBe(true);
    expect(await revoked.text()).toBe(body);

    expect(await isSessionRevokedResponse(new Response(body, { status: 403 }))).toBe(false);
    expect(await isSessionRevokedResponse(new Response("expired", { status: 401 }))).toBe(false);
  });
});

describe("COMPANY_READ_ONLY / COMPANY_DISABLED", () => {
  it("reconhece cada codigo no corpo problem+json (objeto ou texto)", () => {
    expect(isCompanyReadOnlyBody('{"status":403,"code":"COMPANY_READ_ONLY"}')).toBe(true);
    expect(isCompanyReadOnlyBody({ code: "COMPANY_DISABLED" })).toBe(false);
    expect(isCompanyDisabledBody({ code: "COMPANY_DISABLED" })).toBe(true);
    expect(isCompanyDisabledBody('{"code":"SESSION_REVOKED"}')).toBe(false);
    expect(isCompanyDisabledBody("Forbidden")).toBe(false);
  });

  it("readCompanyAccessCode so vale para 403, devolve o codigo e nao consome o corpo", async () => {
    const body = JSON.stringify({ status: 403, code: "COMPANY_READ_ONLY", companyPublicId: "c1" });
    const readOnly = new Response(body, { status: 403 });
    expect(await readCompanyAccessCode(readOnly)).toBe("COMPANY_READ_ONLY");
    expect(await readOnly.text()).toBe(body);

    expect(await readCompanyAccessCode(new Response(body, { status: 401 }))).toBeNull();
    expect(await readCompanyAccessCode(new Response("Forbidden", { status: 403 }))).toBeNull();
    expect(
      await readCompanyAccessCode(new Response('{"code":"ACCESS_DENIED"}', { status: 403 })),
    ).toBeNull();
  });

  it("isCompanyDisabledSessionResponse reconhece o 401 que o /api/auth/me devolve", async () => {
    const body = '{"message":"Sessao invalida","code":"COMPANY_DISABLED"}';
    expect(await isCompanyDisabledSessionResponse(new Response(body, { status: 401 }))).toBe(true);
    expect(await isCompanyDisabledSessionResponse(new Response(body, { status: 403 }))).toBe(false);
    expect(
      await isCompanyDisabledSessionResponse(new Response('{"code":"SESSION_REVOKED"}', { status: 401 })),
    ).toBe(false);
  });

  it("isCompanyDisabledResponse separa DISABLED de READ_ONLY", async () => {
    const disabled = new Response('{"code":"COMPANY_DISABLED"}', { status: 403 });
    const readOnly = new Response('{"code":"COMPANY_READ_ONLY"}', { status: 403 });
    expect(await isCompanyDisabledResponse(disabled)).toBe(true);
    expect(await isCompanyDisabledResponse(readOnly)).toBe(false);
  });
});
