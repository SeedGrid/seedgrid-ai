"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { SgButton } from "@seedgrid/fe-components";

import { getSignupConfig, type SignupConfig } from "@/lib/ported/portedApi";
import { PersonalSignupForm } from "../PersonalSignupForm";
import { SocialLoginButtons } from "../SocialLoginButtons";
import { SignupForm } from "../SignupForm";

/**
 * Cadastro (signup).
 *
 * Tela PUBLICA: fica sob `/auth/**`, que o `proxy.ts` deixa passar sem sessao — como as demais
 * paginas de link de e-mail. O backend inteiro (POST /public/signup, /public/signup/personal, confirm-email,
 * resend-email, email-exists, document-status, config) ja' vem da extension `seedgrid-login-tenancy`.
 *
 * Quem pode se cadastrar vem de `GET /public/signup/config`: `B2B` mostra o cadastro de empresa (CNPJ),
 * `B2C` o de pessoa fisica (CPF opcional) e `BOTH` deixa a pessoa escolher.
 *
 * `?stage=confirm` abre direto na etapa de confirmacao — e' o "Nao recebi o e-mail" do login, e tambem o
 * destino depois do cadastro de pessoa fisica (a confirmacao e' a mesma tela).
 */
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}

type Kind = "PF" | "PJ";

function SignupPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const stage = params.get("stage") === "confirm" ? "confirm" : "form";
  const email = params.get("email") ?? "";

  const [config, setConfig] = useState<SignupConfig | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);

  useEffect(() => {
    let alive = true;
    void getSignupConfig().then((loaded) => {
      if (!alive) {
        return;
      }
      setConfig(loaded);
      setKind(loaded.customerType === "B2C" ? "PF" : loaded.customerType === "B2B" ? "PJ" : null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const backToLogin = () => router.push("/login");

  if (stage === "confirm") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <SignupForm initialStage="confirm" initialEmail={email} onBackToLogin={backToLogin} />
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {config.customerType === "BOTH" ? (
        <div className="mb-4 flex justify-center gap-2">
          <SgButton severity="primary" appearance={kind === "PF" ? "solid" : "outline"} onClick={() => setKind("PF")}>
            Sou pessoa física
          </SgButton>
          <SgButton severity="primary" appearance={kind === "PJ" ? "solid" : "outline"} onClick={() => setKind("PJ")}>
            Tenho uma empresa
          </SgButton>
        </div>
      ) : null}
      {kind === "PF" ? (
        <PersonalSignupForm
          config={config}
          onSubmitted={(submittedEmail) =>
            router.push(`/auth/signup?stage=confirm&email=${encodeURIComponent(submittedEmail)}`)
          }
          onBackToLogin={backToLogin}
        />
      ) : null}
      {/* Login social cria conta de PESSOA FISICA: so' aparece no cadastro PF (o cadastro de empresa tem CNPJ). */}
      {kind === "PF" ? (
        <div className="mt-4">
          <SocialLoginButtons config={config} intent="signup" />
        </div>
      ) : null}
      {kind === "PJ" ? (
        <SignupForm initialStage="form" initialEmail="" termsConfig={config} onBackToLogin={backToLogin} />
      ) : null}
    </div>
  );
}
