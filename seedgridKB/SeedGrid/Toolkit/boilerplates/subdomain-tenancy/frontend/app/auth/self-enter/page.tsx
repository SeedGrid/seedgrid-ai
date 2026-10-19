import { Suspense } from "react";

import { SelfEnterView } from "../SelfEnterView";

// Link do convite do ext-security: {frontend.base-url}/auth/self-enter?token=... com o host trocado
// para o subdominio do tenant pelo TenantSecurityLinks (ext subdomain-tenancy), ou seja,
// {tenant}.{host-raiz}:{porta}/auth/self-enter?token=... — cai neste app, no subdominio da empresa
// que convidou. O proxy publico /api/self-enter/[token] repassa o host (X-Forwarded-Host) ao backend.
//
// Sem `token` e' o LINK PUBLICO de cadastro (self-enter sem convite, se `public-enabled` estiver
// ligado no backend): {tenant}.{host-raiz}:{porta}/auth/self-enter[?company=<publicId>].
export default function SelfEnterPage() {
  return (
    <Suspense fallback={null}>
      <SelfEnterView />
    </Suspense>
  );
}
