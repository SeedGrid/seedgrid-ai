---
tags: [seedgrid, extension, ai-pricing, quarkus, exemplos]
fonte: java/seedgrid-quarkus-ext-ai-pricing
branch: main
commit: 0608ca66b5
analisado-em: 2026-10-14
---

# AI Pricing (Quarkus): exemplos

Ver [[SeedGrid/Extensions/ai-pricing/Visao-geral|Visão geral]] e [[SeedGrid/Extensions/ai-pricing/Configuracao|Configuração]].

## 1. Dependência

Fonte: README.

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-ai-pricing</artifactId>
    <version>2026.10.14</version>
</dependency>
```

Security e audit-core vêm do host.

## 2. Ligar o robô: implementar `AiPriceExtractor`

O contrato vem do javadoc de `runtime/.../spi/AiPriceExtractor.java`, e a forma da implementação segue o `ExtratorFalso` de `AiPricingRobotTest`. O cliente de LLM (`MeuClienteLlm`) é do host e meramente ilustrativo: a extension não fornece cliente.

```java
@ApplicationScoped
public class LlmAiPriceExtractor implements AiPriceExtractor {

    @Inject
    MeuClienteLlm llm; // do host

    @Override
    public String extract(String pricingPageContent) throws Exception {
        String prompt;
        try (InputStream in = getClass().getResourceAsStream("/ai-pricing/prompts/pricing-extract.md")) {
            prompt = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        // Deve devolver um array JSON: [{"model":..., "inputPricePerMillion":..., 
        //   "cachedInputPricePerMillion":..., "outputPricePerMillion":...}] ou "[]".
        // Não engula exceções de rede/timeout: o robô faz retry com backoff.
        return llm.complete(prompt, pricingPageContent);
    }

    @Override
    public boolean isConfigured() {
        return true;
    }
}
```

O bean do host vence o `NoOpAiPriceExtractor` (`@DefaultBean`) sem configuração extra.

## 3. Configurar o robô pelo admin (REST)

Fonte: `AdminAiPriceApprovalResource`. Requer `AI_PRICE_APPROVE`.

```http
PUT /admin/ai/price-approvals/config
Content-Type: application/json

{ "enabled": true, "cron": "0 0 6 * * ?", "sourceUrl": "https://developers.openai.com/api/docs/pricing" }
```

```http
POST /admin/ai/price-approvals/check          # roda agora; devolve status/extractedCount/changedCount/message
POST /admin/ai/price-approvals/{id}/approve
POST /admin/ai/price-approvals/{id}/reject
```

## 4. Lançar preço manual de um modelo

Fonte: `AdminModelResource.LaunchPriceRequest`. Requer `AI_MODEL_PRICE_CREATE`. Valores por 1M de tokens.

```http
POST /admin/ai/models/{publicId}/prices
Content-Type: application/json

{ "inputPricePerMillion": 0.25, "cachedInputPricePerMillion": 0.03,
  "outputPricePerMillion": 2.00, "sourceUrl": "https://developers.openai.com/api/docs/pricing" }
```

Para cadastrar um modelo, `POST /admin/ai/models` recebe `{ "provider": "openai", "model": "gpt-5.1", "label": "GPT-5.1", "currency": "USD", "active": true }` (`ModelRequest`). Esse corpo não leva preço.

## 5. Configuração por tenancy

```properties
# login-tenancy / subdomain-tenancy: aplicar V900–V903
seedgrid.ai-pricing.migration.enabled=true
# subdomain-tenancy já define:
# seedgrid.ai-pricing.persistence-unit=master
```
