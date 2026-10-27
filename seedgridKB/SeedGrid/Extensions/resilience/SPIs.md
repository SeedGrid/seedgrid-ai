---
tags: [seedgrid, extension, resilience, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-resilience
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# resilience (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-resilience` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#CircuitBreakerStore]] | sem padrão | Precisa de implementação do host. |
| [[#IdentityResolver]] | sem padrão | Precisa de implementação do host. |

## CircuitBreakerStore

Guarda o estado dos circuit breakers e decide, a cada chamada, se ela pode acontecer. A chave `key` identifica o circuito (nome do `@SgCircuitBreaker` ou método). A implementação do módulo (`CacheBackedCircuitBreakerStore`) guarda o estado no cache da aplicação, de modo que as instâncias que compartilham o cache compartilhem o circuito.

**Pacote:** `br.com.seedgrid.resilience.core.runtime.circuitbreaker.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

A implementação do módulo (`CacheBackedCircuitBreakerStore`) não é `@DefaultBean`: para trocar o armazenamento, declare o seu bean como `@Alternative` com `@Priority`.

**Outras implementações no repositório** (para consultar como exemplo):

- `CacheBackedCircuitBreakerStore` (`seedgrid-quarkus-ext-resilience/runtime/src/main/java/br/com/seedgrid/resilience/core/runtime/circuitbreaker/store/CacheBackedCircuitBreakerStore.java`) — Guarda o estado do circuito no cache da aplicação.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `CircuitDecision allowCall(String key, CircuitBreakerConfig config)` | Decide se a chamada pode acontecer agora. |
| `void onSuccess(String key, CircuitBreakerConfig config, long durationMs)` | Notifica sucesso. |
| `void onError(String key, CircuitBreakerConfig config, long durationMs, Throwable error)` | Notifica erro. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuCircuitBreakerStore implements CircuitBreakerStore {
    @Override
    public CircuitDecision allowCall(String key, CircuitBreakerConfig config) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void onSuccess(String key, CircuitBreakerConfig config, long durationMs) {
        // implemente
    }

    @Override
    public void onError(String key, CircuitBreakerConfig config, long durationMs, Throwable error) {
        // implemente
    }
}
```

## IdentityResolver

Resolve a identidade (ex.: ip, apiKey, tenantId, userId) para compor a chave do rate limit. Implementações devem ser stateless.

**Pacote:** `br.com.seedgrid.resilience.core.runtime.ratelimiter.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `AnonymousIdentityResolver` (`seedgrid-quarkus-ext-resilience/runtime/src/main/java/br/com/seedgrid/resilience/core/runtime/ratelimiter/spis/AnonymousIdentityResolver.java`) — Identidade fixa `anonymous`: para contextos sem HTTP (jobs, consumers).
- `IpIdentityResolver` (`seedgrid-quarkus-ext-resilience/runtime/src/main/java/br/com/seedgrid/resilience/core/runtime/ratelimiter/spis/IpIdentityResolver.java`) — IP do cliente: `X-Forwarded-For`, depois `X-Real-IP`, depois o endereço remoto; sem camada HTTP devolve `anonymous`.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String resolve(SeedGridInvocationContext ctx)` | Retorna a identidade usada no rate limit. Nunca retorne null (use "anonymous" como fallback). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class ApiKeyIdentityResolver implements IdentityResolver {

    @Override
    public String resolve(SeedGridInvocationContext ctx) {
        // stateless; nunca devolva null
        return ctx.header("X-Api-Key").map(k -> "key:" + k).orElse("anonymous");
    }
}
// uso: @SgRateLimit(permits = 100, window = 1, windowUnit = ChronoUnit.MINUTES, identity = ApiKeyIdentityResolver.class)
```
