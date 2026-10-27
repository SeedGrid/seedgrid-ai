---
tags: [seedgrid, extension, exchange, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-exchange
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# exchange (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/exchange/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-exchange` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#ExchangeAuditSink]] | `NoOpExchangeAuditSink` | Default: nao audita. Ver `ExchangeAuditSink` para por que o silencio e aceitavel aqui. |

## ExchangeAuditSink

Registra acao administrativa sobre cambio: cotacao lancada a mao, moeda criada, editada ou removida. A extension nao sabe COMO o host audita — ela so conta o que aconteceu. No mundo login-tenancy a implementacao delega para o `AdminAuditService` do produto; no subdomain-tenancy, para o `TenantAuditLogger`.

**Pacote:** `br.com.seedgrid.exchange.spis`

**Padrão (`@DefaultBean`):**

- `NoOpExchangeAuditSink` — Default: nao audita. Ver `ExchangeAuditSink` para por que o silencio e aceitavel aqui.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void record(String actionType, String targetType, String targetId, String summary, Map<String, Object> details)` | Registra a ação administrativa. `details` chega como mapa (não como JSON já serializado): quem implementa decide o formato e persiste. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuExchangeAuditSink implements ExchangeAuditSink {

    @Inject
    AdminAuditService audit; // a auditoria administrativa do seu produto

    @Override
    public void record(String actionType, String targetType, String targetId, String summary,
            Map<String, Object> details) {
        audit.log(actionType, targetType, targetId, summary, details);
    }
}
```
