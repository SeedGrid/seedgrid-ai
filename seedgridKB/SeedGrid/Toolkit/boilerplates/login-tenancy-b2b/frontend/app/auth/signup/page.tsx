"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getSignupConfig, type SignupConfig } from "@/lib/ported/portedApi";
import { SignupForm } from "../SignupForm";

/**
 * Cadastro (signup) de EMPRESA (B2B, CNPJ).
 *
 * Tela PUBLICA: fica sob `/auth/**`, que o `proxy.ts` deixa passar sem sessao - como as demais
 * paginas de link de e-mail. O backend inteiro (POST /public/signup, confirm-email, resend-email,
 * email-exists, document-status, config) ja' vem da extension `seedgrid-login-tenancy`, com
 * `seedgrid.login-tenancy.signup.customer-type=B2B` (padrao). Cadastro de pessoa fisica e login
 * social ficam no boilerplate `login-tenancy-b2c`.
 *
 * `?stage=confirm` abre direto na etapa de confirmacao - e' o "Nao recebi o e-mail" do login.
 */
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}

function SignupPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const stage = params.get("stage") === "confirm" ? "confirm" : "form";
  const email = params.get("email") ?? "";

  // Termos vigentes (GET /public/signup/config); em falha assume "sem termos".
  const [config, setConfig] = useState<SignupConfig | null>(null);

  useEffect(() => {
    let alive = true;
    void getSignupConfig().then((loaded) => {
      if (alive) {
        setConfig(loaded);
      }
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
      <SignupForm initialStage="form" initialEmail="" termsConfig={config} onBackToLogin={backToLogin} />
    </div>
  );
}
