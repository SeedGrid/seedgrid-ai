"use client";

import { useCallback, useEffect, useState } from "react";

import { ListLoadError } from "@/components/ui/list-load-error";
import { Carregando } from "@/components/ported/Carregando";
import { refreshSubscription } from "@/lib/ported/portedApi";
import type { SubscriptionResponse } from "@/lib/ported/billingTypes";
import { Shell } from "../components/Shell";
import { SubscriptionManageView } from "./SubscriptionManageView";
import { SubscriptionPlans } from "./SubscriptionPlansView";

/**
 * "Minha assinatura" — o item do `sgUserMenu`.
 *
 * A casca e' nova (Shell + carga da assinatura); o MIOLO sao as telas portadas do report-client:
 * `SubscriptionManageView` quando ha assinatura, e a landing de planos (`SubscriptionPlans`)
 * quando nao ha. No client isso era o `App.tsx` decidindo qual view montar; aqui e' esta pagina,
 * com a mesma regra.
 *
 * `refreshSubscription()` devolve `null` sem erro quando a conta ainda nao tem plano (a rota de
 * BFF reproduz o `optional_billing` do Rust) — por isso "sem assinatura" NAO passa pelo
 * <ListLoadError>: nao e' falha de leitura. Falha de verdade passa.
 */
export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  /**
   * `silent`: atualiza os dados SEM trocar a tela pelo "Carregando". E' o caso do refresh que o proprio
   * SubscriptionManageView pede ao abrir e depois de cada acao: com o spinner, o view desmontava, montava de
   * novo, pedia outro refresh — e a tela entrava em loop infinito de requisicoes.
   */
  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setLoadError(null);
    try {
      setSubscription(await refreshSubscription());
    } catch (error) {
      // Erro de carga NAO pode virar "nenhuma assinatura ativa": e' a mesma familia do erro que
      // vira lista vazia (PLAN.md §6.6), e aqui custaria o cliente achar que perdeu o plano.
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Shell
      eyebrow="Conta"
      title="Minha assinatura"
      description="Seu plano, o consumo do ciclo, as faturas e a forma de pagamento."
    >
      <ListLoadError error={loadError} onRetry={() => void load()} />

      {loadError ? null : loading ? (
        <Carregando className="justify-center py-10" texto="Carregando assinatura..." />
      ) : subscription ? (
        <SubscriptionManageView subscription={subscription} onRefresh={() => load(true)} />
      ) : (
        // Sem assinatura: a landing de planos em modo checkout (1a assinatura), exatamente como o
        // report-client fazia para quem ainda nao assinou.
        <SubscriptionPlans mode="checkout" onSubscriptionActivated={() => void load()} />
      )}
    </Shell>
  );
}
