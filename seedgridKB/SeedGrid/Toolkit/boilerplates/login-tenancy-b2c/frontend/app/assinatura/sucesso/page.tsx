"use client";

import { SgCard, SgScreen } from "@seedgrid/fe-components";
import { PRODUCT_NAME } from "@/lib/brand";

// Landing de SUCESSO do checkout do Stripe (success_url). O Stripe redireciona o browser
// para ca apos o pagamento. Pagina PUBLICA (liberada no middleware) — quem assina e um
// usuario de empresa vindo do client, nao um admin, entao nao ha sessao admin aqui.
//
// IMPORTANTE: esta pagina e apenas informativa. A ATIVACAO da assinatura e feita pelo
// webhook (checkout.session.completed), nao por este redirect. O client detecta o estado
// ACTIVE por conta propria e fecha o modal.
export default function CheckoutSuccessPage() {
  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard cardStyle="elevated" title={`🎉 Bem-vindo(a) ao ${PRODUCT_NAME}!`}>
          <div className="login-info">
            Sua assinatura foi confirmada com sucesso.
          </div>
          <p className="lede">
            Estamos muito felizes em ter você como cliente. Volte para o app {PRODUCT_NAME} —
            se o plano ainda aparecer como inativo, saia e entre novamente para atualizar.
          </p>
        </SgCard>
      </div>
    </SgScreen>
  );
}
