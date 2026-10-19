"use client";

import { SgButton, SgCard, SgScreen, SgStack } from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";

export default function ForgotPasswordSuccessPage() {
  const router = useRouter();

  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard
          cardStyle="elevated"
          title="Senha alterada"
          description="Sua nova senha ja esta ativa. Faca login para continuar."
        >
          <SgStack gap={16}>
            <SgButton label="Ir para o login" onClick={() => router.push("/login")} />
          </SgStack>
        </SgCard>
      </div>
    </SgScreen>
  );
}
