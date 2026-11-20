// Planos assinaveis no app do cliente (FE-42, P180).
//
// O plano sem preco configurado no provedor de pagamento (`checkoutEnabled = false`) NAO e' assinavel:
// o cliente ve o texto de negocio abaixo e nenhum botao. A instrucao de configurar o preco no
// provedor e' do administrador e so' existe no admin (tela de planos), nunca aqui.
import type { PlanCatalogItem } from "./ported/billingTypes";

export const PLAN_UNAVAILABLE_MESSAGE = "Este plano ainda não está disponível para assinatura.";

export const PLANS_SUBTITLE = "Escolha o plano que melhor atende à sua empresa. Você pode trocar de plano quando precisar.";

/** O plano pode ser assinado (ou trocado para ele) agora: tem preço no provedor de pagamento. */
export function isPlanSubscribable(plan: Pick<PlanCatalogItem, "checkoutEnabled">): boolean {
  return plan.checkoutEnabled === true;
}
