---
tags: [seedgrid, extension, cache, rust]
fonte: rust/seedgrid-rust-crate-cache
branch: main
commit: 7b5b6e1
analisado-em: 2026-11-11
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
- A superfície de configuração é de 6 variáveis: 4 do `CacheConfig` (`HOSTS`, `PASSWORD`, `TIMEOUT`, `IF_PROVIDER_IS_DOWN`) e 2 da memória local (`SEEDGRID_CACHE_MEMORY_MAX_ENTRIES`, `SEEDGRID_CACHE_MEMORY_SWEEP_INTERVAL`); ver [[SeedGrid/Extensions/cache/Configuracao-Rust|Configuração Rust]].

## Enums
Java: [[SeedGrid/Extensions/cache/Enums|Enums do cache (Java)]].

| Enum | Arquivo | Variantes | Java equivalente |
|---|---|---|---|
| `ProviderDownLog` | `src/config.rs` | `Warn`, `Error`, `Failover` | [[SeedGrid/Extensions/cache/Enums#Level\|Level]] (`seedgrid.cache.if-provider-is-down`) |
| `CacheBackend` | `src/factory.rs` | `InMemory`, `Distributed` (com `flavor` e `config`) | seleção por módulo no classpath |
| `DistributedFlavor` | `src/redis_backend.rs` | `Redis`, `Valkey`, `Dragonfly` | módulos `cache-redis`/`-valkey`/`-dragonfly`; **informativo** (mesma implementação) |
| `LockGuard` | `src/provider.rs` | `Local`, `Distributed` (com `lock_key` e `token`) | interno (retorno de `try_acquire_lock`) |
| `CacheError` | `src/error.rs` | `LockBusy`, `Backend`, `InvalidArgument`, `Unsupported`, `Other` | `CacheLockBusyException`, `IllegalArgumentException`, `UnsupportedOperationException` |
| `Kind` | `src/annotations/codec.rs` | `Null`, `EmptyOptional`, `Value`, `PresentOptional` | [[SeedGrid/Extensions/cache/Enums#CacheEnvelope.Kind\|CacheEnvelope.Kind]] |
| `Lookup` | `src/annotations/codec.rs` | `Miss`, `Hit` (com o valor) | — (resultado de leitura do codec) |
| `CacheAnnotation` | `src/annotations/runtime.rs` | `Result`, `Invalidation` | — (descritor coletado pelas macros `#[sg_cache_*]`) |
| `CacheKeyScope` | `src/annotations/scope.rs` | `Default`, `Tenant`, `Company`, `User`, `Global` | [[SeedGrid/Extensions/cache/Enums#CacheKeyScope\|CacheKeyScope]] |
| `State` | `src/failover/cache.rs` | `Normal`, `Failover` | [[SeedGrid/Extensions/cache/Enums#State\|FailoverCache.State]] |

### ProviderDownLog
`Warn` (padrão), `Error`, `Failover`. `from_config_value`: trim, case-insensitive; `ERROR` → `Error`, `FAILOVER` → `Failover`, **qualquer outro valor** → `Warn`. Lido de `SEEDGRID_CACHE_IF_PROVIDER_IS_DOWN` (sem fallback `QUARKUS_REDIS_*`). **Comportamento**: `Warn` e `Error` degradam (fail-soft) e só mudam o nível do log; no Java `ERROR` é fail-closed e relança a exceção. `Failover` troca para memória local ao cair o servidor, mas quem aplica é o `FailoverCache` (fora dele o provider se comporta como `Warn`); `build` o liga com `Failover` ou `SEEDGRID_CACHE_FAILOVER_ENABLED=true` (`src/factory.rs`).

### CacheError
`LockBusy(String)` (lock já com outro dono; equivalente do `CacheLockBusyException`; mensagem "Could not acquire lock: {chave}"), `Backend` (falha do crate `redis`), `InvalidArgument(String)` (argumento inválido do chamador, ex.: prefixo vazio em `delete_by_prefix`), `Unsupported(String)` (operação que o provider não implementa), `Other(String)` (genérico, ex.: configuração inválida ao montar a conexão). Case sobre a variante, nunca sobre a mensagem.

### LockGuard
`Local(LocalLockGuard)`: lock local da instância (memória, ou o lock local usado quando o provider distribuído está fora do ar em `WARN`); `Distributed { lock_key, token }`: lock distribuído (`SET NX PX`, liberação por compare-and-delete via Lua).

### Kind
`Null`, `EmptyOptional`, `Value`, `PresentOptional` (códigos 0 a 3 no 5º byte do envelope). O Rust só grava `Value`; os demais são lidos como miss (`open` aceita-os, `decode` só devolve `Hit` para `Value`). Existe outro `Kind` público em `src/failover/classifier.rs` (`Infrastructure`, `LocalSaturation`, `CallerError`, `LockBusy`, `ExtraNotInfrastructure`), usado pelo `ProviderFailureClassifier`.

### Lookup
`Miss` (ausente ou ilegível) e `Hit(T)` (valor guardado); `is_hit()`.

### CacheAnnotation
`Result(&ResultDesc)` e `Invalidation(&InvalidationDesc)`; coletados com `inventory` pelas macros de annotation.

### CacheKeyScope
`Default` (vale `seedgrid.cache.key-scope`, padrão `Tenant`), `Tenant`, `Company`, `User`, `Global` (sem segmento de escopo na chave). `parse(text)` é case-insensitive e devolve `None` para valor desconhecido.

### State
`Normal` e `Failover`, estado do `FailoverCache`.
