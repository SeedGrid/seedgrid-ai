import { Suspense } from "react";

import { ConfirmEmailView } from "../ConfirmEmailView";

// Link do e-mail de boas-vindas do ext-security: {frontend.base-url}/auth/welcome?token=...
export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailView title="Bem-vindo ao Admin Web" />
    </Suspense>
  );
}
