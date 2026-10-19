// seedgrid:managed

// Cliente HTTP same-origin para os COMPONENTES CLIENT do fluxo de segurança.
// Aponta para o proxy `/api/security/...` e `/api/me/...` (mesmo host), que repassa o problem+json do
// report-api. Em erro lança `ApiClientError` (com `responseBody`+`status`); na UI use
// `extractApiErrorMessage(error)` para exibir a mensagem.

import { createApiClient } from "@seedgrid/fe-core";

// baseUrl "" -> resolvido contra window.location.origin pelo createApiClient.
// requireAuth desligado: a sessão admin trafega por cookie httpOnly, anexado pelo
// próprio navegador no fetch same-origin (não há Bearer no lado client).
export const adminProxyClient = createApiClient({
  baseUrl: "",
  defaultCache: "no-store",
  getAccessToken: async () => null,
});
