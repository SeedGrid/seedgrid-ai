---
tags: [seedgrid, extension, resilience, rust]
fonte: rust/seedgrid-rust-crate-resilience
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# resilience — porte Rust (`seedgrid-rust-crate-resilience`)

Porte da extensão Quarkus `seedgrid-quarkus-ext-resilience`. Lado Java: [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral do resilience (Java)]] · [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience (Java)]]. Configuração Rust: [[SeedGrid/Extensions/resilience/Configuracao-Rust|Configuração Rust do resilience]].

Entrega **apenas** Circuit Breaker e Rate Limiter, ambos guardando estado num `SeedGridCacheProvider` (in-memory ou distribuído). Não há retry, timeout nem bulkhead. **Confirmado** (`src/lib.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-resilience` (lib `seedgrid_resilience`) |
| Versão | workspace `2026.10.14` |
| Features | nenhuma |
| Dependência SeedGrid | `seedgrid-rust-crate-cache` |
| Consumidores | security (`src/ratelimit.rs`), backup e billing (seams de rate limit), `seedgrid-runtime` (macros `#[rate_limit]`/`#[circuit_breaker]`) |

## Arquitetura
No Java, CB e rate limit são interceptors CDI (`@SeedGridCircuitBreaker`, `@SeedGridRateLimit`). Em Rust:
- **Circuit Breaker**: `circuit_breaker(name, CircuitBreakerConfig, cache)` devolve uma guarda `CircuitBreaker` com `call(fut)` / `call_with_fallback(fut, fallback)`; estado em `CacheBackedCircuitBreakerStore` (chave `cb:<name>`). Config efetiva por `CircuitBreakerConfigResolver::resolve(&SeedGridCircuitBreaker, nome)`.
- **Rate Limiter**: `RateLimitService::new(cache, Arc<dyn ConfigSource>)` + `try_acquire(&SeedGridRateLimit, &InvocationInfo, ctx)`; algoritmos `FIXED_WINDOW`, `SLIDING_WINDOW`, `TOKEN_BUCKET`; chave `rl:<tenant>[:<operação>]:<escopo>:<identidade>`. Para Axum: `ServiceRateLimiter` + `rate_limit_middleware` (429 + headers `X-RateLimit-*`).
- Ordem: rate limit é a camada mais externa (prioridade Java 1000), circuit breaker por dentro (1010).
- As macros de `seedgrid-runtime` (`#[rate_limit]`, `#[circuit_breaker]`) geram essa fiação — ver [[SeedGrid/Extensions/runtime/Visao-geral|Visão geral do runtime]].

## API pública
| Módulo | Símbolos |
|---|---|
| `config` | `ConfigSource` (trait tipada: `get_bool/long/int/double/duration/string`), `EmptyConfigSource`, `MapConfigSource`, `ConfigValue` |
| `circuitbreaker` | `SeedGridCircuitBreaker`, `CircuitBreakerConfig` (+ builder), `CircuitBreakerConfigResolver`, `CircuitBreakerStore`, `CacheBackedCircuitBreakerStore`, `circuit_breaker`, `CircuitBreaker`, `AsErrorClass`, `ErrorClass`, `CircuitBreakerOpenException`, `SlidingWindowType` |
| `ratelimiter` | `SeedGridRateLimit`, `InvocationInfo`, `RateLimitService`, `Clock`, `RateLimiter`, `ServiceRateLimiter`, `rate_limit_middleware`, `apply_rate_limit_headers`, `IdentityResolver` (`IpIdentityResolver` — usa `X-Forwarded-For`/`X-Real-IP`; `AnonymousIdentityResolver`), `SeedGridInvocationContext`, `MapInvocationContext`, `RateLimitExceededException`, `RateLimitAlgorithm`, `KeyScope` (`Method`, `Class`, `Group`), `TimeUnit` |

## Exemplos
Circuit breaker (doc de `src/circuitbreaker/guard.rs`):
```rust
let cache = Arc::new(InMemoryCache::new());
let cfg = CircuitBreakerConfig::builder().name("backup-upload").build();
let cb = circuit_breaker("backup-upload", cfg, cache);
let r: Result<u8, _> = cb.call(async { Ok::<u8, MinhaFalha>(1) }).await;
```
Rate limit numa rota Axum (padrão usado por backup/billing; seams `export_create_rate_limit`, `checkout_rate_limit`…):
```rust
let service = Arc::new(RateLimitService::new(cache, Arc::new(EmptyConfigSource)));
let limiter: Arc<dyn RateLimiter> = Arc::new(ServiceRateLimiter::new(
    service, seedgrid_billing::routes::checkout_rate_limit(), InvocationInfo::new("POST /billing/checkout", "billing")));
let route = route.layer(axum::middleware::from_fn_with_state(limiter, rate_limit_middleware));
```
(O segundo bloco é **Inferência** montada a partir das assinaturas de `ServiceRateLimiter::new` e do doc de `rate_limit_middleware`; não há esse trecho literal no repositório.) Exemplo executável com macros: `rust/seedgrid-runtime/examples/resilience_audit.rs`.

## Testes
`tests/circuit_breaker_config_resolver.rs`, `circuit_breaker_store.rs`, `http_headers.rs`, `identity_resolver.rs`, `rate_limit_algorithms.rs`, `rate_limit_service_config_override.rs` (+ unitários). **Não executados.** Sem app em `rust/examples/`.

## Notas de comportamento

Valores inválidos de `algorithm`/`window-type` e config inválida (`permits <= 0`, `window <= 0`) causam **panic**.

## Enums
Java: [[SeedGrid/Extensions/resilience/Enums|Enums do resilience (Java)]].

| Enum | Arquivo | Java equivalente |
|---|---|---|
| `RateLimitAlgorithm` | `src/ratelimiter/enums.rs` | [[SeedGrid/Extensions/resilience/Enums#RateLimitAlgorithm\|RateLimitAlgorithm]] |
| `KeyScope` | idem | [[SeedGrid/Extensions/resilience/Enums#KeyScope\|KeyScope]] |
| `TimeUnit` | idem | `java.time.temporal.ChronoUnit` (subconjunto) |
| `CircuitState` | `src/circuitbreaker/enums.rs` | [[SeedGrid/Extensions/resilience/Enums#CircuitState\|CircuitState]] |
| `SlidingWindowType` | idem | [[SeedGrid/Extensions/resilience/Enums#SlidingWindowType\|SlidingWindowType]] |
| `CircuitBreakerError<E>` (`Open`, `Inner`) | `src/circuitbreaker/guard.rs` | exceções do circuito |
| `ConfigValue` (`Bool`, `Long`, `Int`, `Double`, `Duration`, `Str`) | `src/config.rs` | tipo do valor numa `MapConfigSource` |

Nenhum tem serde. Os nomes em texto vêm da `ConfigSource` (normalizados por trim, maiúsculas, `-` → `_`).
- **RateLimitAlgorithm**: `FixedWindow` (`FIXED_WINDOW`, padrão), `TokenBucket` (`TOKEN_BUCKET`), `SlidingWindow` (`SLIDING_WINDOW`). Valor desconhecido na config → *panic*. Iguais ao Java.
- **KeyScope**: `Method` (padrão), `Class`, `Group` (cai na assinatura do método se `group` vazio). Só definido em código (não há override por config).
- **TimeUnit**: `Millis`, `Seconds`, `Minutes`, `Hours`. Nota: o Java aceita qualquer `ChronoUnit`; o Rust só estes 4.
- **CircuitState**: `Closed` (0), `Open` (1), `HalfOpen` (2). Os ordinais entram na serialização binária do estado no cache (`ordinal`/`from_ordinal`; ordinal inválido → `Closed`). Iguais ao Java.
- **SlidingWindowType**: `CountBased` (padrão), `TimeBased` (o tamanho da janela vira segundos). A config `window-type` aceita `COUNT_BASED`/`TIME_BASED` (inválido → *panic*).
