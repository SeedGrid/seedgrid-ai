import { Suspense } from "react";

import { SelfEnterView } from "../SelfEnterView";

// Link do convite do ext-security: {frontend.base-url}/auth/self-enter?token=...
// Sem `token`, a mesma rota e' o cadastro PUBLICO: /auth/self-enter?company=<publicId> (o link que a
// tela "Convidar usuario externo" mostra).
//
// O `seedgrid.security.frontend.base-url` (env SEEDGRID_SECURITY_FRONTEND_BASE_URL) e' UM so' para
// a instalacao inteira e aponta para ESTE app (porta 3000 no dev.env). Por isso a pagina precisa
// existir aqui: todo convite cai nela — o criado pelo cliente e tambem o criado pelo admin.
// `SelfEnterView` e' copia literal do admin.
export default function SelfEnterPage() {
  return (
    <Suspense fallback={null}>
      <SelfEnterView />
    </Suspense>
  );
}
