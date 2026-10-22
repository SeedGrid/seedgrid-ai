import { describe, expect, it } from "vitest";

import type { SignupConfig } from "@/lib/ported/portedApi";
import {
  buildPersonalPayload,
  EMPTY_PERSONAL_VALUES,
  isValidCpf,
  validatePersonal,
  type PersonalSignupValues,
} from "./personalSignup";

const noTerms: SignupConfig = { customerType: "B2C", termsRequired: false, termsVersion: "", termsDocuments: {} };
const withTerms: SignupConfig = {
  customerType: "BOTH",
  termsRequired: true,
  termsVersion: "3",
  termsDocuments: { terms: "https://example.test/termos" },
};

const valid: PersonalSignupValues = {
  name: "Maria Souza",
  email: "Maria@Example.com",
  password: "Senha@12345",
  whatsapp: "(11) 98765-4321",
  cpf: "",
  acceptedTerms: true,
};

describe("isValidCpf", () => {
  it("aceita CPF com digitos verificadores corretos, com ou sem mascara", () => {
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });
  it("recusa digitos errados, repetidos e tamanho errado", () => {
    expect(isValidCpf("52998224726")).toBe(false);
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
});

describe("validatePersonal", () => {
  it("aceita o cadastro curto sem CPF", () => {
    expect(validatePersonal(valid, noTerms)).toBeNull();
  });
  it("CPF e opcional, mas se vier precisa ser valido", () => {
    expect(validatePersonal({ ...valid, cpf: "52998224725" }, noTerms)).toBeNull();
    expect(validatePersonal({ ...valid, cpf: "52998224726" }, noTerms)).toBe("CPF inválido.");
  });
  it("exige nome, e-mail, senha e WhatsApp", () => {
    expect(validatePersonal({ ...valid, name: " " }, noTerms)).toMatch(/nome/);
    expect(validatePersonal({ ...valid, email: "x" }, noTerms)).toMatch(/e-mail/);
    expect(validatePersonal({ ...valid, password: "" }, noTerms)).toMatch(/senha/);
    expect(validatePersonal({ ...valid, whatsapp: "123" }, noTerms)).toMatch(/WhatsApp/);
  });
  it("com termos exigidos, o aceite e obrigatorio", () => {
    expect(validatePersonal({ ...valid, acceptedTerms: false }, withTerms)).toMatch(/termos/);
    expect(validatePersonal(valid, withTerms)).toBeNull();
  });
  it("formulario vazio nao passa", () => {
    expect(validatePersonal(EMPTY_PERSONAL_VALUES, noTerms)).not.toBeNull();
  });
});

describe("buildPersonalPayload", () => {
  it("normaliza e-mail e WhatsApp e omite CPF e termos quando nao se aplicam", () => {
    expect(buildPersonalPayload(valid, noTerms)).toEqual({
      name: "Maria Souza",
      email: "maria@example.com",
      password: "Senha@12345",
      whatsapp: "11987654321",
    });
  });
  it("envia CPF so com digitos e a versao dos termos vigentes", () => {
    expect(buildPersonalPayload({ ...valid, cpf: "529.982.247-25" }, withTerms)).toMatchObject({
      cpf: "52998224725",
      acceptedTerms: true,
      termsVersion: "3",
    });
  });
});
