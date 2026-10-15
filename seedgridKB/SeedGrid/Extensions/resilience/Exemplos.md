---
tags: [seedgrid, extension, resilience, exemplos]
fonte: java/seedgrid-quarkus-ext-resilience
branch: main
commit: eff41304f8
analisado-em: 2026-10-14
---

# Exemplos — SeedGrid Resilience (Quarkus)

Voltar: [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral do resilience]] · Propriedades: [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience]]

Pacote base: `br.com.seedgrid.resilience.core.runtime`. Exemplos baseados em `README.md`, `README.adoc` e nas assinaturas reais das anotações/SPIs.

## Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-resilience-core</artifactId>
    <version>2026.10.13</version>
</dependency>
<!-- estado distribuído: um provider de cache (ex.: Redis) -->
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-cache-redis</artifactId>
    <version>2026.10.13</version>
</dependency>
```

Versão `2026.10.13` = pom atual de `seedgrid-quarkus-ext-resilience` e de `seedgrid-quarkus-lib-cache`. **Confirmado**.

## 1. Rate limit básico (por IP)

Fonte: `README.md`.

```java
import java.time.temporal.ChronoUnit;
import br.com.seedgrid.resilience.core.runtime.ratelimiter.annotations.SeedGridRateLimit;

@Path("/auth")
public class SignupResource {

    @POST
    @Path("/signup")
    @SeedGridRateLimit(permits = 5, window = 1, windowUnit = ChronoUnit.MINUTES)
    public Response signup(SignupRequest req) { ... }   // 5 req/min por IP
}
```

Ao estourar: HTTP 429 com `X-RateLimit-Limit`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Reset` e `Retry-After` (via `RateLimitExceptionMapper`).

## 2. Limiters independentes ajustáveis por properties

Fonte: `README.md`.

```java
@SeedGridRateLimit(configKey = "login", permits = 100, window = 1, windowUnit = ChronoUnit.MINUTES)
public AuthResponseDTO login(LoginDTO dto) { ... }

@SeedGridRateLimit(configKey = "export-create", permits = 10, window = 1, windowUnit = ChronoUnit.HOURS)
public Response createExport(ExportRequest req) { ... }
```

```properties
seedgrid.ratelimit.login.permits=200
seedgrid.ratelimit.login.window=PT30S
seedgrid.ratelimit.export-create.algorithm=token-bucket
seedgrid.ratelimit.export-create.burst-capacity=3
```

## 3. Token bucket com rajada e espaçamento mínimo

Fonte: `README.adoc` § "Exemplo de Token Bucket".

```java
import br.com.seedgrid.resilience.core.runtime.ratelimiter.enums.RateLimitAlgorithm;

@SeedGridRateLimit(
    permits = 10,
    window = 1,
    windowUnit = ChronoUnit.MINUTES,
    algorithm = RateLimitAlgorithm.TOKEN_BUCKET,
    burstCapacity = 20,
    minSpacing = 200,
    minSpacingUnit = ChronoUnit.MILLIS)
public void syncProducts() { ... }
```

`minSpacing` não tem efeito com `FIXED_WINDOW` (ver [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral]]).

## 4. Cota compartilhada entre métodos (`GROUP`)

Fonte: `README.adoc` § "Compartilhando cota com GROUP". Observe que `KeyScope` fica no pacote `circuitbreaker.enums`.

```java
import br.com.seedgrid.resilience.core.runtime.circuitbreaker.enums.KeyScope;

@SeedGridRateLimit(permits = 300, window = 1, windowUnit = ChronoUnit.MINUTES,
                   group = "email-provider", scope = KeyScope.GROUP)
public void sendWelcomeEmail(...) { ... }

@SeedGridRateLimit(permits = 300, window = 1, windowUnit = ChronoUnit.MINUTES,
                   group = "email-provider", scope = KeyScope.GROUP)
public void sendResetEmail(...) { ... }
```

## 5. Contexto sem HTTP (jobs, consumers)

Fonte: Javadoc de `SeedGridRateLimit#identity` e `README.adoc`.

```java
import br.com.seedgrid.resilience.core.runtime.ratelimiter.spi.AnonymousIdentityResolver;

@SeedGridRateLimit(permits = 10, window = 1, windowUnit = ChronoUnit.MINUTES,
                   identity = AnonymousIdentityResolver.class)
public void consume(Message msg) { ... }
```

## 6. Identidade customizada (SPI `IdentityResolver`)

Fonte: `README.md`. Assinatura real: `String resolve(SeedGridInvocationContext ctx)`; nunca retornar `null`.

```java
import br.com.seedgrid.resilience.core.runtime.core.SeedGridInvocationContext;
import br.com.seedgrid.resilience.core.runtime.ratelimiter.spi.IdentityResolver;

@ApplicationScoped
public class TenantIdentityResolver implements IdentityResolver {
    @Override
    public String resolve(SeedGridInvocationContext ctx) {
        return ctx.tenantId().orElse("anonymous");
    }
}

@SeedGridRateLimit(permits = 1000, window = 1, windowUnit = ChronoUnit.HOURS,
                   identity = TenantIdentityResolver.class)
public Report generate(...) { ... }
```

O `RateLimitService` busca o resolver via `CDI.current().select(classe)`; se não for bean resolvível, instancia pelo construtor sem argumentos.

## 7. Publicando tenant/operação no contexto

A chave do rate limit inclui os atributos `tenantId` e `operation` do `SeedGridInvocationContext` corrente. A extension não preenche esse contexto; o host pode usar `ThreadLocalSeedGridInvocationContext` (API real: `set`, `clear`, `runWith`, `callWith`). Implementação ilustrativa do contexto (a interface exige `header`, `method`, `path`, `remoteIp`, `attribute`, `tags`):

```java
import java.util.Map;
import java.util.Optional;
import br.com.seedgrid.resilience.core.runtime.core.SeedGridInvocationContext;
import br.com.seedgrid.resilience.core.runtime.core.ThreadLocalSeedGridInvocationContext;

record JobContext(Map<String, Object> attrs) implements SeedGridInvocationContext {
    public Optional<String> header(String name) { return Optional.empty(); }
    public Optional<String> method() { return Optional.empty(); }
    public Optional<String> path() { return Optional.empty(); }
    public Optional<String> remoteIp() { return Optional.empty(); }
    public Optional<Object> attribute(String name) { return Optional.ofNullable(attrs.get(name)); }
    public Optional<Map<String, String>> tags() { return Optional.empty(); }
}

ThreadLocalSeedGridInvocationContext.runWith(
    new JobContext(Map.of("tenantId", "acme", "operation", "sync-products")),
    () -> productSync.syncProducts());
// chave resultante: rl:acme:sync-products:<escopo>:<identidade>
```

## 8. Circuit breaker com fallback

Fonte: `README.md`.

```java
import br.com.seedgrid.resilience.core.runtime.circuitbreaker.annotations.SeedGridCircuitBreaker;

@ApplicationScoped
public class PaymentGateway {

    @SeedGridCircuitBreaker(
        name = "payments",
        failureRateThreshold = 50.0,
        minimumNumberOfCalls = 20,
        openStateDurationMs = 30_000,
        permittedCallsInHalfOpen = 10,
        fallbackMethod = "paymentsFallback")
    public PaymentResult charge(Order order) { ... }

    // precisa ser público; procurado como (params..., Exceção), (params...) ou ()
    public PaymentResult paymentsFallback(Order order, Exception cause) { ... }
}
```

Sem fallback, circuito aberto lança `CircuitBreakerOpenException` (`circuitName()`, `retryAfterMs()`), que **não** tem `ExceptionMapper` na extension. Exemplo de mapper no host (usa só a API pública da exceção):

```java
import br.com.seedgrid.resilience.core.runtime.circuitbreaker.exceptions.CircuitBreakerOpenException;

@Provider
public class CircuitOpenMapper implements ExceptionMapper<CircuitBreakerOpenException> {
    @Override
    public Response toResponse(CircuitBreakerOpenException ex) {
        return Response.status(503)
                .header("Retry-After", (ex.retryAfterMs() + 999) / 1000)
                .build();
    }
}
```

## 9. Circuit breaker com slow calls e exceções filtradas

```java
import br.com.seedgrid.resilience.core.runtime.circuitbreaker.enums.SlidingWindowType;

@SeedGridCircuitBreaker(
    name = "erp",
    windowType = SlidingWindowType.TIME_BASED,
    slidingWindowSize = 60,                 // em TIME_BASED: 60 segundos (e até 60 registros)
    slowCallDurationThresholdMs = 2_000,
    slowCallRateThreshold = 80.0,
    recordExceptions = { java.io.IOException.class },
    ignoreExceptions = { IllegalArgumentException.class })
public ErpResponse fetch(String id) { ... }
```

Override em produção:

```properties
seedgrid.circuitbreaker.erp.slow-call-duration=PT3S
seedgrid.circuitbreaker.erp.enabled=false   # kill switch
```
