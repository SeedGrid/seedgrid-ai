---
tags: [seedgrid, extension, cache, rust, configuracao]
fonte: rust/seedgrid-rust-crate-cache
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# cache — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/cache/Rust|Porte Rust do cache]] · Java: [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `CacheConfig` (+ enum `ProviderDownLog`) — `rust/seedgrid-rust-crate-cache/src/config.rs` |
| Mecanismo | `CacheConfig::from_env()`, `CacheConfig::new(hosts)` ou literal; passada a `RedisCache::connect` / `CacheBackend::Distributed` |
| Prefixo Java | `seedgrid.cache.*` (fachada que faz alias de `quarkus.redis.*` via `RelocateConfigSourceInterceptor`) |
| Precedência | `SEEDGRID_CACHE_<X>` > `QUARKUS_REDIS_<X>` (exceto `IF_PROVIDER_IS_DOWN`, sem fallback) — `alias_resolve` |
| Leitura | quando o host chama `from_env()`; no workspace, só o exemplo `seedgrid-cache-example` chama |
| Backend in-memory | sem configuração |

Valores são `trim`ados; vazio conta como ausente (`alias_resolve`).

## Variáveis de ambiente
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_CACHE_HOSTS` / fallback `QUARKUS_REDIS_HOSTS` (Java `seedgrid.cache.hosts` / `quarkus.redis.hosts`) | String | `host:porta`, `redis://...`, `rediss://...`; lista por vírgula (só o 1º é usado) | `localhost:6379` | Não | montado em URL por `redis_url()` (prefixa `redis://` se faltar esquema) | `RedisCache::connect` | `password` | `from_env()` | `config.rs` → `from_env`, `redis_url`; `redis_backend.rs` → `connect` |
| 🔒 `SEEDGRID_CACHE_PASSWORD` / `QUARKUS_REDIS_PASSWORD` | `Option<String>` | texto | — | Não | injetada como `:<senha>@` na URL se ela ainda não tiver `@` | `redis_url()` | `hosts` | `from_env()` | `config.rs` |
| `SEEDGRID_CACHE_TIMEOUT` / `QUARKUS_REDIS_TIMEOUT` | `Option<Duration>` | número = segundos; `Nms`, `Ns`, `Nm`; `PTnS`/`PTnM` | — | Não | timeout de conexão **e** de resposta; inválido → ignorado | `RedisCache::connect` | — | `from_env()` | `config.rs` → `parse_duration`; `redis_backend.rs` |
| `SEEDGRID_CACHE_IF_PROVIDER_IS_DOWN` (Java `seedgrid.cache.if-provider-is-down`) | `ProviderDownLog` | `WARN`, `ERROR` (case-insensitive); outro → `WARN` | `WARN` | Não | só muda o nível do log; Rust sempre degrada (Java `ERROR` relança) | `RedisCache` (`on_provider_down`) | sem fallback `QUARKUS_REDIS_*` | `from_env()` | `config.rs`; `redis_backend.rs` |

Mapeamento Java: **Confirmado** — o nome `seedgrid.cache.if-provider-is-down` está em `java/seedgrid-quarkus-lib-cache/.../CacheProviderFailSoft.java` (`PROP`); a relação `seedgrid.cache.*` ↔ `quarkus.redis.*` está no interceptor Java (comentários lidos). A conversão para env segue a regra MicroProfile sem ambiguidade.

## Struct `CacheConfig`
| Campo | Tipo | `Default` |
|---|---|---|
| `hosts` | String | `localhost:6379` |
| `password` | `Option<String>` | `None` |
| `timeout` | `Option<Duration>` | `None` |
| `if_provider_is_down` | `ProviderDownLog` | `Warn` |

`RedisCache::connect_url` e `from_connection` ignoram `CacheConfig` e usam `Warn`; `with_provider_down_log` sobrescreve.

## Features Cargo
| Feature | Padrão | Efeito |
|---|---|---|

## Somente testes / exemplos
| Variável | Onde |
|---|---|
| `SEEDGRID_CACHE_TEST_URL` | `tests/redis_backend.rs` (default `redis://localhost:6379`) |
| `RUST_LOG` | exemplo |

## Configuração mínima
```dotenv
SEEDGRID_CACHE_HOSTS=localhost:6379
```

## Configuração completa comentada
```dotenv
SEEDGRID_CACHE_HOSTS=redis://<host>:6379     # ou host:porta; rediss:// para TLS
SEEDGRID_CACHE_PASSWORD=<SEGREDO:redis-password>
SEEDGRID_CACHE_TIMEOUT=5s                    # 5 | 5s | 500ms | PT5S
SEEDGRID_CACHE_IF_PROVIDER_IS_DOWN=WARN      # WARN|ERROR (apenas nível de log)
# Fallback se SEEDGRID_CACHE_* faltar:
# QUARKUS_REDIS_HOSTS=redis://<host>:6379
```

## Receitas
- **Dev/single-node**: não configure nada e use `default_cache()` / `InMemoryCache::new()`.
- **Redis/Valkey/Dragonfly**: `SEEDGRID_CACHE_HOSTS` + `build(CacheBackend::Distributed { flavor, config: CacheConfig::from_env() })`.
- **Reaproveitar env de um host Quarkus**: `QUARKUS_REDIS_HOSTS`/`QUARKUS_REDIS_PASSWORD` funcionam como fallback.
