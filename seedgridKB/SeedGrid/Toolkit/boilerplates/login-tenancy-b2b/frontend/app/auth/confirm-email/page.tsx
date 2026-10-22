import { Suspense } from "react";

import { ConfirmEmailView } from "../ConfirmEmailView";

// Link de confirmacao de e-mail usado SO' pela ativacao de "novo usuario" do report-CLIENT
// (MeUserResource#sendActivationEmail via SecurityLinkBuilder.buildEmailConfirmationUrl) — esse
// usuario nao tem acesso ao admin-web, so' ao app desktop (afterSuccess="desktop-app").
export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailView title="Confirmar e-mail" afterSuccess="desktop-app" />
    </Suspense>
  );
}
