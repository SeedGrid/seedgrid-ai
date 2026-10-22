"use client";

import {
  SgButton,
  SgCard,
  SgScreen,
  SgStack,
} from "@seedgrid/fe-components";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function ForgotPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordConfirmContent />
    </Suspense>
  );
}

function ForgotPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token")?.trim();
    if (!token) {
      setErrorMessage("Link de confirmacao invalido ou incompleto.");
      return;
    }

    let active = true;
    void (async () => {
      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        if (!active) {
          return;
        }
        if (!response.ok) {
          const text = await response.text();
          setErrorMessage(text || "Nao foi possivel confirmar a troca de senha.");
          return;
        }
        router.replace("/auth/forgot-password/success");
      } catch {
        if (active) {
          setErrorMessage("Nao foi possivel conectar ao servidor. Tente novamente.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title="Confirmando a troca de senha"
          description="Aguarde enquanto validamos o seu link."
        >
          {errorMessage ? (
            <SgStack gap={16}>
              <div className="login-error">{errorMessage}</div>
              <SgButton
                label="Solicitar novo link"
                onClick={() => router.push("/auth/forgot-password")}
              />
              <SgButton
                appearance="ghost"
                label="Voltar para o login"
                onClick={() => router.push("/login")}
                severity="secondary"
              />
            </SgStack>
          ) : (
            <div className="login-info">Validando...</div>
          )}
        </SgCard>
      </div>
    </SgScreen>
  );
}
