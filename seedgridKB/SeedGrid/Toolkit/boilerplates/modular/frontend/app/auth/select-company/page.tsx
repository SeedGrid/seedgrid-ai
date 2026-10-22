"use client";

import { SgCard, SgScreen } from "@seedgrid/fe-components";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { CompanySelect } from "../../components/CompanySelect";

/**
 * Escolha da empresa no login (T7.2). Publica (`/auth/**`), mas so' faz sentido com o cookie de
 * sessao do login que pediu a escolha (`companySelectionRequired`): sem sessao a lista volta 401 e
 * a tela manda para o login. O `proxy.ts` prende o usuario aqui enquanto a escolha esta pendente.
 */
export default function SelectCompanyPage() {
  const router = useRouter();

  const goToLogin = useCallback(() => {
    router.replace("/login?expired=1");
    router.refresh();
  }, [router]);

  async function cancel() {
    // Desiste do login: apaga a sessao ainda sem empresa (senao o proxy devolveria para ca).
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard cardStyle="elevated" title="Selecione a empresa">
          <CompanySelect
            onSelected={({ changePasswordRequired }) => {
              router.replace(changePasswordRequired ? "/change-password" : "/");
              router.refresh();
            }}
            onCancel={() => void cancel()}
            onSessionLost={goToLogin}
          />
        </SgCard>
      </div>
    </SgScreen>
  );
}
