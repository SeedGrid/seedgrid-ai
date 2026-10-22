// Logica pura do cadastro de pessoa fisica (B2C): validacao e montagem do payload. Sem React, para testar com vitest.

import type { PersonalSignupPayload, SignupConfig } from "@/lib/ported/portedApi";

export interface PersonalSignupValues {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  cpf: string;
  acceptedTerms: boolean;
}

export const EMPTY_PERSONAL_VALUES: PersonalSignupValues = {
  name: "",
  email: "",
  password: "",
  whatsapp: "",
  cpf: "",
  acceptedTerms: false,
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** CPF valido pelos digitos verificadores (vazio nao e validado aqui: o CPF e opcional). */
export function isValidCpf(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += Number(cpf[i]) * (len + 1 - i);
    }
    const digit = ((sum * 10) % 11) % 10;
    if (digit !== Number(cpf[len])) {
      return false;
    }
  }
  return true;
}

/** Primeiro erro do formulario, ou null se estiver pronto para enviar. */
export function validatePersonal(values: PersonalSignupValues, config: SignupConfig): string | null {
  if (values.name.trim().length < 2) {
    return "Informe seu nome.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return "Informe um e-mail válido.";
  }
  if (values.password.length === 0) {
    return "Informe uma senha.";
  }
  const phone = onlyDigits(values.whatsapp);
  if (phone.length < 10 || phone.length > 13) {
    return "Informe o WhatsApp com DDD.";
  }
  if (onlyDigits(values.cpf).length > 0 && !isValidCpf(values.cpf)) {
    return "CPF inválido.";
  }
  if (config.termsRequired && !values.acceptedTerms) {
    return "É preciso aceitar os termos para criar a conta.";
  }
  return null;
}

/** Payload do POST /public/signup/personal: CPF so vai se preenchido; termos so quando exigidos. */
export function buildPersonalPayload(values: PersonalSignupValues, config: SignupConfig): PersonalSignupPayload {
  const cpf = onlyDigits(values.cpf);
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    whatsapp: onlyDigits(values.whatsapp),
    ...(cpf ? { cpf } : {}),
    ...(config.termsRequired ? { acceptedTerms: values.acceptedTerms, termsVersion: config.termsVersion } : {}),
  };
}
