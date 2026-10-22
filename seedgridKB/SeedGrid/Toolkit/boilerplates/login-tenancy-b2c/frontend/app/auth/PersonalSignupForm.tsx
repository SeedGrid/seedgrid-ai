"use client";

// Cadastro de PESSOA FISICA (B2C): nome, e-mail, senha, WhatsApp, CPF opcional e o aceite dos termos.
// A logica (validacao e payload) mora em `personalSignup.ts`, testada com vitest.
// Depois do envio o usuario segue para a confirmacao do e-mail, que e' a mesma tela do cadastro de empresa.

import { useState } from "react";

import {
  SgButton,
  SgInputCPF,
  SgInputEmail,
  SgInputPassword,
  SgInputPhone,
  SgInputText,
  SgStack,
  SgToggleSwitch,
} from "@seedgrid/fe-components";

import { signUpPersonal, type SignupConfig } from "@/lib/ported/portedApi";
import { readError } from "@/lib/ported/clientError";
import { AuthCard, AuthMessage } from "./AuthCard";
import {
  buildPersonalPayload,
  EMPTY_PERSONAL_VALUES,
  validatePersonal,
  type PersonalSignupValues,
} from "./personalSignup";

interface PersonalSignupFormProps {
  readonly config: SignupConfig;
  readonly onSubmitted: (email: string) => void;
  readonly onBackToLogin: () => void;
}

const TERMS_LABELS: Record<string, string> = { terms: "Termos de uso", privacy: "Política de privacidade" };

export function PersonalSignupForm({ config, onSubmitted, onBackToLogin }: PersonalSignupFormProps) {
  const [values, setValues] = useState<PersonalSignupValues>(EMPTY_PERSONAL_VALUES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PersonalSignupValues>(key: K, value: PersonalSignupValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function handleSubmit() {
    const problem = validatePersonal(values, config);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = buildPersonalPayload(values, config);
      await signUpPersonal(payload);
      onSubmitted(payload.email);
    } catch (err) {
      setError(readError(err));
    } finally {
      setBusy(false);
    }
  }

  const documents = Object.entries(config.termsDocuments);

  return (
    <AuthCard title="Criar conta">
      <SgStack gap={12}>
        <SgInputText id="personal-name" label="Nome" required minLength={2} maxLength={120}
          onChange={(value) => set("name", value)} />
        <SgInputEmail id="personal-email" label="E-mail" required onChange={(value) => set("email", value)} />
        <SgInputPassword id="personal-password" label="Senha" required onChange={(value) => set("password", value)} />
        <SgInputPhone id="personal-whatsapp" label="WhatsApp" required onChange={(value) => set("whatsapp", value)} />
        <SgInputCPF id="personal-cpf" label="CPF (opcional)" onChange={(value) => set("cpf", value)} />
        {config.termsRequired ? (
          <>
            <SgToggleSwitch id="personal-terms" label="Li e aceito os termos" checked={values.acceptedTerms}
              onChange={(checked) => set("acceptedTerms", checked)} />
            {documents.length > 0 ? (
              <p className="text-sm text-sg-muted">
                {documents.map(([name, url], index) => (
                  <span key={name}>
                    {index > 0 ? " · " : ""}
                    <a href={url} target="_blank" rel="noreferrer" className="underline">
                      {TERMS_LABELS[name] ?? name}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </>
        ) : null}
      </SgStack>
      <SgButton severity="primary" appearance="solid" loading={busy} onClick={() => void handleSubmit()}
        className="mt-4 w-full">
        Criar conta
      </SgButton>
      <div className="mt-2 flex justify-center">
        <SgButton severity="primary" appearance="ghost" onClick={onBackToLogin}>
          Ir para login
        </SgButton>
      </div>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
    </AuthCard>
  );
}
