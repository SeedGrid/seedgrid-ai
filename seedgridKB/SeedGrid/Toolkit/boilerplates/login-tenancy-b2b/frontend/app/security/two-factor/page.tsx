"use client";

import { Shell } from "../../components/Shell";
import { TwoFactorManager } from "../../components/TwoFactorManager";

// A gestao de 2FA vive agora em "Meu perfil"; esta rota permanece acessivel por URL
// e reusa o mesmo componente.
export default function TwoFactorPage() {
  return (
    <Shell
      eyebrow="Seguranca"
      title="Autenticacao em dois fatores"
      description="Ative ou desative o 2FA da sua conta."
    >
      <TwoFactorManager />
    </Shell>
  );
}
