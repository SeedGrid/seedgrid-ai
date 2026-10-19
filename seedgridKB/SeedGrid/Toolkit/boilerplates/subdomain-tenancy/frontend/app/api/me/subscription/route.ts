import { NextResponse } from "next/server";

import { ApiClientError } from "@/lib/core";
import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

/**
 * Comando Rust `refresh_subscription` (comandos/billing.rs) -> GET /me/subscription.
 *
 * REPRODUZ O `optional_billing` do Rust (src-tauri/src/infra/http.rs), e isto NAO e' liberdade de
 * port: billing e' opcional no login — ENTRAR nao exige plano, so' CONSUMIR exige. Sem assinatura
 * a API responde 404; sem a permissao de billing, 403. Nos dois casos o certo e' `null`
 * ("nao tem plano"), nunca erro — senao a tela de assinatura abriria em banner vermelho para todo
 * cliente que ainda nao assinou.
 *
 * Note a diferenca para o §6.6 (erro nao vira lista vazia): aqui 404/403 NAO sao falha de leitura,
 * sao a resposta correta para "nao ha assinatura". Qualquer OUTRO status continua subindo como
 * erro, com o problem+json intacto.
 */
export async function GET() {
  try {
    const data = await apiFetchSecurity<unknown>("/me/subscription");
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 404 || error.status === 403)) {
      return NextResponse.json(null);
    }
    return problemResponse(error);
  }
}
