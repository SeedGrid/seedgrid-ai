"use client";

import { SgButton, SgCard, SgScreen } from "@seedgrid/fe-components";

// Landing de CANCELAMENTO do checkout do Stripe (cancel_url). O Stripe redireciona para ca
// quando o usuario abandona/cancela o checkout. Pagina PUBLICA (liberada no middleware):
// nenhuma cobranca foi feita e nenhuma assinatura foi criada.
export default function CheckoutCanceledPage() {
  return (
    <SgScreen className="login-screen" fullscreen={false} padding={0}>
      <div className="login-shell">
        <SgCard cardStyle="elevated" title="Checkout cancelado">
          <div className="login-info">
            Voce cancelou o checkout e <strong>nenhuma cobranca foi feita</strong>.
          </div>
          <p className="lede">
            Volte ao app SeedGrid App para escolher um plano quando quiser.
          </p>
          <SgButton label="Fechar esta janela" onClick={() => window.close()} />
        </SgCard>
      </div>
    </SgScreen>
  );
}
