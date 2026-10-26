---
tags: [seedgrid, extension, resilience, rust, configuracao]
fonte: rust/seedgrid-rust-crate-resilience
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# resilience — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/resilience/Rust|Porte Rust do resilience]] · Java: [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Mecanismo | (1) structs-"anotação" `SeedGridCircuitBreaker` e `SgRateLimit` com `Default` (= defaults das anotações Java); (2) overrides por nome lidos de uma `ConfigSource` injetada (`src/config.rs`) |
| Variáveis de ambiente | **nenhuma** — `grep` por `env::var` em `src/` não encontra nada (**Confirmado**) |
| `ConfigSource` disponíveis | `EmptyConfigSource` (nenhuma chave) e `MapConfigSource` (mapa tipado). **Não existe** implementação baseada em ambiente no workspace |
| Uso real no workspace | security (`src/ratelimit.rs`) e `seedgrid-runtime` (exemplo/teste) usam `EmptyConfigSource` → os overrides abaixo **não têm efeito** a menos que o host implemente `ConfigSource` |
| Leitura | a cada `try_acquire` / `resolve` (sem cache) |
| Equivalente Java | `Config#getOptionalValue` em `RateLimitService.java` e `CircuitBreakerConfigResolver.java`; mesmas chaves |

Os overrides só são consultados quando a "anotação" tem `config_key` (rate limit) ou `name` (circuit breaker) não vazio.

## Overrides de rate limit — `seedgrid.ratelimit.{configKey}.*`
| Propriedade | Tipo (`ConfigValue`) | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.ratelimit.{configKey}.enabled` | `Bool` | `true`/`false` | `true` | Não | `false` libera sem tocar o cache (kill switch) | `RateLimitService::try_acquire` | — | por chamada | `src/ratelimiter/service.rs` → `is_enabled` |
| `seedgrid.ratelimit.{configKey}.permits` | `Long` | > 0 | `SgRateLimit.permits` (5) | Não | permits por janela; ≤ 0 → panic | `resolve_permits` | `burst-capacity` | por chamada | idem |
| `seedgrid.ratelimit.{configKey}.window` | `Duration` | > 0 | `window` × `window_unit` (30 s) | Não | tamanho da janela | `resolve_window_ms` | — | por chamada | idem |
| `seedgrid.ratelimit.{configKey}.min-spacing` | `Duration` | ≥ 0 | `min_spacing` × `min_spacing_unit` (0) | Não | espaçamento mínimo entre chamadas | `resolve_min_spacing_ms` | — | por chamada | idem |
| `seedgrid.ratelimit.{configKey}.burst-capacity` | `Long` | ≥ 0 (0 = usa `permits`) | `burst_capacity` (0) | Não | capacidade do token bucket | `resolve_burst_capacity` | `algorithm` | por chamada | idem |
| `seedgrid.ratelimit.{configKey}.algorithm` | `Str` | `FIXED_WINDOW`, `SLIDING_WINDOW`, `TOKEN_BUCKET` (`trim`, maiúsculas, `-`→`_`); outro → **panic** | `algorithm` (`FIXED_WINDOW`) | Não | escolhe a estratégia | `resolve_algorithm` / `parse_algorithm` | — | por chamada | idem |

`configKey`s usados no workspace (fixos em código): `export-create` (backup, 10/hora), `billing-checkout` (30/min), `billing-portal` (30/min), `billing-webhook` (300/min); a security define os seus em `rust/seedgrid-rust-crate-security/src/ratelimit.rs` (fora deste escopo).

## Overrides de circuit breaker — `seedgrid.circuitbreaker.{name}.*`
| Propriedade | Tipo | Valores aceitos | Padrão (`SeedGridCircuitBreaker::default`) | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.circuitbreaker.{name}.enabled` | `Bool` | bool | `true` | Não | `false` desliga o circuito | `CircuitBreakerConfigResolver::is_enabled` | — | por chamada | `src/circuitbreaker/config_resolver.rs` |
| `.sliding-window-size` | `Int` | inteiro | `100` | Não | slots da janela (em `TIME_BASED`, segundos) | `resolve` | `window-type` | idem | idem |
| `.window-type` | `Str` | `COUNT_BASED`, `TIME_BASED` (normalizado); outro → **panic** | `COUNT_BASED` | Não | tipo de janela | `resolve` / `parse_window_type` | — | idem | idem |
| `.failure-rate-threshold` | `Double` | % | `50.0` | Não | abre ao atingir a taxa de falha | `resolve` | `minimum-number-of-calls` | idem | idem |
| `.slow-call-duration` | `Duration` | duração (→ ms) | `0` (desligado) | Não | limiar de chamada lenta | `resolve` | `slow-call-rate-threshold` | idem | idem |
| `.slow-call-rate-threshold` | `Double` | % | `100.0` | Não | abre pela taxa de lentidão | `resolve` | — | idem | idem |
| `.minimum-number-of-calls` | `Int` | inteiro | `20` | Não | mínimo antes de avaliar | `resolve` | — | idem | idem |
| `.open-state-duration` | `Duration` | duração (→ ms) | `30000` ms | Não | tempo em OPEN antes de HALF_OPEN | `resolve` | — | idem | idem |
| `.permitted-calls-in-half-open` | `Int` | inteiro | `10` | Não | sondagens em HALF_OPEN | `resolve` | — | idem | idem |

`record_exceptions` (padrão `["Exception"]`), `ignore_exceptions` e `fallback_method` existem só na struct (referências de código).

## Defaults de `SgRateLimit`
`permits=5`, `window=30`, `window_unit=Seconds`, `algorithm=FixedWindow`, `burst_capacity=0`, `min_spacing=0`, `min_spacing_unit=Millis`, `identity=IpIdentityResolver`, `group=""`, `scope=Method`, `emit_headers=true`, `config_key=""` (`src/ratelimiter/config.rs`).

## Features Cargo
Nenhuma.

## Configuração mínima (programática)
```rust
let source = MapConfigSource::new()
    .with("seedgrid.ratelimit.billing-checkout.permits", ConfigValue::Long(60))
    .with("seedgrid.ratelimit.billing-checkout.window", ConfigValue::Duration(Duration::from_secs(60)));
let service = RateLimitService::new(cache, Arc::new(source));
```

## Receitas
- **Desligar um rate limit em produção**: `seedgrid.ratelimit.<configKey>.enabled = Bool(false)` numa `ConfigSource` do host.
- **Ler overrides do ambiente**: implementar `ConfigSource` no host (ex.: mapear `SEEDGRID_RATELIMIT_<KEY>_PERMITS`) — não fornecido pela crate.
