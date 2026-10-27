---
tags: [seedgrid, extension, ai-pricing, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-ai-pricing
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# ai-pricing (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/ai-pricing/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-ai-pricing` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#AiPriceExtractor]] | `NoOpAiPriceExtractor` | Sem LLM ligado: `isConfigured()` devolve `false` e o robô de preços fica inerte, avisando que o extrator não está configurado. |
| [[#AiPricingAuditSink]] | `NoOpAiPricingAuditSink` | Default: nao audita. |

## AiPriceExtractor

Seam entre o robo de precos e um LLM. Por que isto existe. No `seedgrid-report-api`, de onde este boilerplate veio, o `br.com.seedgrid.app.api.ai.pricing.AiPricingCheckService` chamava direto o `AiLlmAdapter` do produto.

**Pacote:** `br.com.seedgrid.aipricing.spis`

**Padrão (`@DefaultBean`):**

- `NoOpAiPriceExtractor` — Sem LLM ligado: `isConfigured()` devolve `false` e o robô de preços fica inerte, avisando que o extrator não está configurado.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String extract(String pricingPageContent) throws Exception` | Normaliza a tabela de precos para JSON. O crawler nao e' seu. |
| `boolean isConfigured()` | `false` quando nao ha LLM ligado. O robo consulta isto ANTES de baixar a pagina, para poder dizer "extrator nao configurado" em vez de devolver "nenhum preco encontrado" — que seria indistinguivel de um dia em que o provedor realmente nao mudou nada. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuAiPriceExtractor implements AiPriceExtractor {

    @Inject
    MeuClienteLlm llm; // o cliente de LLM do seu produto

    @Override
    public String extract(String pricingPageContent) throws Exception {
        // o prompt que produz o contrato viaja dentro da extension
        String prompt = new String(getClass()
                .getResourceAsStream("/ai-pricing/prompts/pricing-extract.md").readAllBytes(), StandardCharsets.UTF_8);
        // deve devolver o array JSON (um objeto por card), sem markdown; nao engula excecao de rede
        return llm.complete(prompt, pricingPageContent);
    }

    @Override
    public boolean isConfigured() {
        return llm.isReady(); // false = o robo diz "extrator nao configurado"
    }
}
```

## AiPricingAuditSink

Registra acao administrativa sobre precos: modelo criado/editado/removido, preco aprovado ou rejeitado. Mesmo contrato do `ExchangeAuditSink` da extension de cambio, de proposito: quem implementa um implementa o outro do mesmo jeito. Se um dia a fundacao expuser um sink de auditoria administrativa unico, os dois somem em favor dele.

**Pacote:** `br.com.seedgrid.aipricing.spis`

**Padrão (`@DefaultBean`):**

- `NoOpAiPricingAuditSink` — Default: nao audita.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void record(String actionType, String targetType, String targetId, String summary, Map<String, Object> details)` | Registra a ação administrativa. `details` chega como mapa (não como JSON já serializado): quem implementa decide o formato e persiste. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuAiPricingAuditSink implements AiPricingAuditSink {

    @Inject
    AdminAuditService audit; // a auditoria administrativa do seu produto

    @Override
    public void record(String actionType, String targetType, String targetId, String summary,
            Map<String, Object> details) {
        audit.log(actionType, targetType, targetId, summary, details);
    }
}
```
