---
tags: [seedgrid, extension, cache, rust]
fonte: rust/seedgrid-rust-crate-cache
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# cache — porte Rust (`seedgrid-rust-crate-cache`)

Porte da lib Java `seedgrid-quarkus-lib-cache` (módulos `cache-core`, `cache-redis`, `cache-valkey`, `cache-dragonfly`). Lado Java: [[SeedGrid/Extensions/cache/Visao-geral|Visão geral do cache (Java)]] · [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache (Java)]]. Configuração Rust: [[SeedGrid/Extensions/cache/Configuracao-Rust|Configuração Rust do cache]].

Cache independente de provedor: uma API (`SeedGridCacheProvider`) sobre Redis, Valkey ou Dragonfly (todos via protocolo RESP, uma única implementação `RedisCache`) e um backend **in-memory**, que é o padrão. **Confirmado** (`src/lib.rs`, `src/factory.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-cache` (lib `seedgrid_cache`) |
| Versão | workspace `2026.10.14` |
| Dependências SeedGrid | nenhuma |
| Consumidores (Cargo.toml) | runtime, backup, login-tenancy, resilience, security, subdomain-tenancy |

## API pública
| Símbolo | Papel | Fonte |
|---|---|---|
| trait `SeedGridCacheProvider` | `get_string`/`put_string`, `get_bytes`/`put_bytes`, `get_long`/`put_long`, `increment`, `increment_ttl`, `delete`, `acquire_lock`, `release_lock` (TTL opcional) | `src/provider.rs` |
| trait `SeedGridCacheProviderExt` | `with_lock(key, ttl, closure)` (libera o lock mesmo em panic) | `src/provider.rs` |
| `InMemoryCache::new()` | backend local (default) | `src/memory.rs` |
| `RedisCache::connect(&CacheConfig)`, `connect_url(url)`, `from_connection(conn)`, `with_provider_down_log(mode)` | backend RESP; aliases `ValkeyCache`, `DragonflyCache`; enum `DistributedFlavor` (informativo) | `src/redis_backend.rs` |
| `CacheBackend::{InMemory, Distributed{flavor, config}}`, `build(backend)`, `default_cache()` | fábrica | `src/factory.rs` |
| `CacheConfig`, `ProviderDownLog` | config | `src/config.rs` |
| `CacheError`, `CacheResult` | erros | `src/error.rs` |

## Comportamento
- Operações do backend distribuído são **fail-soft**: em falha, devolvem ausência/`0`/no-op e logam em `WARN` ou `ERROR` conforme `ProviderDownLog`. No Java, `ERROR` é fail-closed (relança); no Rust é sempre fail-soft.
- Só o primeiro host de `hosts` é usado.
- O lock in-memory não é reentrante (`tokio::Mutex`), ao contrário do `ReentrantLock` Java (intencional).

## Exemplo (de `rust/examples/seedgrid-cache-example/src/main.rs`)
```rust
let config = CacheConfig::from_env();
let cache = RedisCache::connect(&config).await?;
cache.put_string(&k_str, "olá seedgrid", None).await;
let got = cache.get_string(&k_str).await;
cache.put_string(&k_ttl, "efêmero", Some(Duration::from_secs(1))).await;
let a = cache.increment(&k_ctr).await;
```
Em memória (doc de `src/lib.rs`):
```rust
let cache = InMemoryCache::new();
let hits = cache.increment_ttl("hits:42", Some(Duration::from_secs(60))).await;
let out = cache.with_lock("job:import", Duration::from_secs(30), || async { 42 }).await.unwrap();
```

## Testes
- `tests/in_memory.rs`, `tests/java_behavior_parity.rs`, `tests/redis_backend.rs` (Redis real via `SEEDGRID_CACHE_TEST_URL`, `#[ignore]`); testes de alias em `src/config.rs` (porte de `SeedGridCacheConfigRelocateInterceptorTest`).
- E2E no exemplo: `rust/examples/seedgrid-cache-example/tests/redis_e2e.rs`.
- **Não executados.**

## Notas de comportamento

- `timeout` é aplicado à conexão e à resposta; durações `PTnS` são aceitas.
- Com URL com esquema, a senha é injetada na conexão.
- Operações do backend distribuído são sempre fail-soft (ver `ProviderDownLog`).
- Lock reentrante; o lock é liberado mesmo em panic.
- Com múltiplos hosts, só o primeiro é usado.
- A superfície de configuração é de 4 propriedades.

## Enums
Java: [[SeedGrid/Extensions/cache/Enums|Enums do cache (Java)]].

| Enum | Arquivo | Java equivalente |
|---|---|---|
| `ProviderDownLog` | `src/config.rs` | [[SeedGrid/Extensions/cache/Enums#Level\|Level]] (`seedgrid.cache.if-provider-is-down`) |
| `CacheBackend` (`InMemory`, `Distributed{flavor, config}`) | `src/factory.rs` | seleção por módulo no classpath |
| `DistributedFlavor` (`Redis`, `Valkey`, `Dragonfly`) | `src/redis_backend.rs` | módulos `cache-redis`/`-valkey`/`-dragonfly`; **informativo** (mesma implementação) |
| `LockGuard` (`InMemory`, `Distributed{lock_key, token}`) | `src/provider.rs` | interno (retorno de `acquire_lock`) |
| `CacheError` (`LockNotAcquired`, `Backend`, `Other`) | `src/error.rs` | — |

### ProviderDownLog
`Warn` (padrão), `Error`. `from_config_value`: trim, case-insensitive; `ERROR` → `Error`, **qualquer outro valor** → `Warn`. Lido de `SEEDGRID_CACHE_IF_PROVIDER_IS_DOWN` (sem fallback `QUARKUS_REDIS_*`). **Comportamento**: no Rust os dois valores degradam (fail-soft) e só mudam o nível do log; no Java `ERROR` é fail-closed e relança a exceção.
