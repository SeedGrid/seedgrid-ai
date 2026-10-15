---
tags: [seedgrid, extension, broker, rust, configuracao]
fonte: rust/seedgrid-rust-crate-broker
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# broker — Configuração Rust

Visão geral: [[SeedGrid/Extensions/broker/Visao-geral|Visão geral do broker]]. Não há equivalente Java.

## Cabeçalho
| Item | Valor |
|---|---|
| Mecanismo | **argumentos de construtor e structs** passados pelo host; as crates **não leem variáveis de ambiente** (`grep` por `env::var` em `crates/` sem resultado — **Confirmado**) |
| Seleção de backend | feita pelo host (ex.: `BROKER_PROVIDER` no `seedgrid-pulse` e no exemplo) |
| Leitura | na construção do broker |
| Features Cargo | nenhuma em nenhuma das 5 crates |

## Parâmetros por backend
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `MemoryBroker::new(capacity)` | usize | ≥ 1 (0 vira 1) | `512` (`Default`) | Não | capacidade do `broadcast`; assinante atrasado além disso deixa de receber | `MemoryBroker` | buffer do `mpsc` por assinante é fixo em 512 | construtor | `crates/seedgrid-broker-memory/src/lib.rs` |
| `RedisBroker::connect(url, _)` | &str | URL `redis://` / `rediss://` aceita pelo crate `redis` | — | Sim | conecta e faz `PING` (falha → erro) | `RedisBroker` | — | construtor | `crates/seedgrid-broker-redis/src/lib.rs` |
| `RedisBroker::connect(_, channel)` | &str | nome de canal | — | Sim | canal único de PUBLISH/SUBSCRIBE; vazio só é rejeitado pela função livre `connect` | idem | — | construtor | idem |
| `NatsConfig.url` / `NatsConfig.subject` | String | — | sem `Default` | Sim (struct) | apenas armazenados (scaffold) | uso não encontrado | — | `NatsBroker::connect` | `crates/seedgrid-broker-nats/src/lib.rs` |
| `RabbitMqConfig.url` / `.exchange` / `.routing_key` | String | — | sem `Default` | Sim (struct) | apenas armazenados (scaffold) | uso não encontrado | — | `RabbitMqBroker::connect` | `crates/seedgrid-broker-rabbitmq/src/lib.rs` |

## Variáveis de ambiente do host/exemplo (não lidas pelas crates)
| Variável | Valores | Padrão no exemplo | Onde |
|---|---|---|---|
| `BROKER_PROVIDER` | `memory`, `redis` (outro → erro) | `memory` | `rust/examples/seedgrid-broker-example/src/main.rs` → `build_broker` |
| `BROKER_REDIS_URL` | URL Redis | `redis://localhost:6379` | idem |
| `BROKER_REDIS_CHANNEL` | nome de canal | `seedgrid` | idem |
| `RUST_LOG` | filtro `tracing` | — | idem |

## Receitas
- **Testes/dev**: `Arc::new(MemoryBroker::default())`.
- **Produção (várias instâncias)**: `RedisBroker::connect("redis://<host>:6379", "<canal>")`; todas as instâncias devem usar o mesmo canal.
