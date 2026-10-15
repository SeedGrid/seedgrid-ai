---
tags: [seedgrid, extension, ai-pricing, quarkus, enum]
fonte: java/seedgrid-quarkus-ext-ai-pricing
branch: main
commit: 0608ca66b5
analisado-em: 2026-10-14
---

# AI Pricing (Quarkus): enums

Voltar para [[SeedGrid/Extensions/ai-pricing/Visao-geral|Visão geral]] · [[SeedGrid/Extensions/ai-pricing/Configuracao|Configuração]].

A extension **não define nenhum `enum` Java**. Há dois conjuntos de valores fixos, ambos como `String`, documentados aqui porque fazem parte do contrato observável. Nenhum é tipo de propriedade de configuração.

| Conjunto | Onde | Usado em |
|---|---|---|
| status da proposta | constantes `STATUS_*` em `runtime/src/main/java/br/com/seedgrid/aipricing/entities/AiModelPriceToApproveEntity.java` | coluna `ai_model_prices_to_approve.status varchar(16) default 'PENDING'` (V900), sem CHECK |
| status do resultado da checagem | literais em `services/AiPricingCheckService.java` (`CheckOutcome`) | resposta de `POST /admin/ai/price-approvals/check` |

## Status da proposta (`AiModelPriceToApproveEntity.STATUS_*`)
Campo `String status`; nem a entidade nem o banco validam os valores.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `PENDING` | Proposta (ou erro) aguardando decisão. | Default da coluna e da entidade; criada por `AiPricingCheckService`. Enquanto existir uma `PENDING`, `runCheck` retorna `SKIPPED`. `AiPriceApprovalService` só aprova ou rejeita linhas `PENDING`. | Confirmado. |
| `APPROVED` | Aprovada. | `AiPriceApprovalService#approve` aplica os preços e marca. | Confirmado. |
| `REJECTED` | Recusada ou dispensada. | `AiPriceApprovalService#reject`. | Confirmado. |

## Status do resultado da checagem (`CheckOutcome.status`)
Não persistido; devolvido no campo `status` da resposta de `POST /admin/ai/price-approvals/check`.

| Valor | Significado | Quando |
|---|---|---|
| `SKIPPED` | Nada foi feito. | Sem `AiPriceExtractor` configurado, ou já existe proposta/erro pendente. |
| `ERROR` | Falhou. | Página inacessível, extração falhou ou nenhuma tabela reconhecível. Registra uma linha pendente e publica `ai-pricing.check-failed`. |
| `NO_CHANGE` | Preços lidos, sem diferença com o catálogo. | Nenhuma proposta criada. |
| `CHANGES` | Há mudanças de preço. | Cria a proposta `PENDING` e publica `ai-pricing.approval-pending`. |

## Internos
Nenhum.
