"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SignupForm } from "../SignupForm";

/**
 * Cadastro da empresa (signup institucional).
 *
 * Tela PUBLICA: fica sob `/auth/**`, que o `proxy.ts` deixa passar sem sessao — como as demais
 * paginas de link de e-mail. O backend inteiro (POST /public/signup, confirm-email, resend-email,
 * email-exists, cnpj-status) ja' vem da extension `seedgrid-login-tenancy`; nada disso foi escrito
 * aqui.
 *
 * `?stage=confirm` abre direto na etapa de confirmacao — e' o "Nao recebi o e-mail" do login, com o
 * mesmo contrato do `initialStage` que o SignupForm ja' tinha no report-client.
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <SignupForm
        initialStage={stage}
        initialEmail={email}
        initialSubdomain={params.get("subdomain") ?? ""}
        onBackToLogin={() => router.push("/login")}
      />
    </div>
  );
}
