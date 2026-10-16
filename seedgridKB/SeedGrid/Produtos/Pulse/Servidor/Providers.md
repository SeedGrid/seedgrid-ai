---
tags: [seedgrid, produto, pulse, servidor, broker, redis, valkey, dragonfly, nats, rabbitmq, postgres]
fonte: seedgrid-products/seedgrid-pulse/backend (src/config.rs, src/broker.rs, tests/) + seedgrid-platform/rust/seedgrid-rust-crate-broker
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse (servidor) — providers: broker, presença e store

O Pulse separa três responsabilidades, cada uma com seu provider. Voltar: [[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração do servidor]] · [[SeedGrid/Produtos/Pulse/Servidor/Instalacao|Instalação]].

| Responsabilidade | Variável | Opções | Para quê |
|---|---|---|---|
| **Broker** (pub/sub entre instâncias) | `BROKER_PROVIDER` | `memory`, `redis`, `nats`, `rabbitmq` | levar uma publicação a **todas** as instâncias, para a que tem o WebSocket entregar; e propagar revogação de credencial |
| **Presença** (quem está conectado em quê) | `PRESENCE_BACKEND` | `memory`, `redis` | presença por canal/grupo compartilhada entre instâncias |
| **Store de entregas** (mensagens, estados, DLQ) | `DELIVERY_STORE_BACKEND` | `memory`, `postgres` | durabilidade, replay, histórico |

## Quando precisa de quê

| Cenário | Broker | Presença | Store |
|---|---|---|---|
| Desenvolvimento / uma instância sem persistência | `memory` | `memory` | `memory` |
| **Uma instância em produção** | `memory` | `memory` | `postgres` |
| **Várias réplicas (escala)** | `redis` \| `nats` \| `rabbitmq` | **`redis`** | `postgres` |

- Sem broker compartilhado, uma réplica não entrega o que outra publicou (ver [[SeedGrid/Produtos/Pulse/Servidor/Operacao|Operação — diagnóstico]]).
- **A presença só tem `memory` e `redis`.** Com NATS ou RabbitMQ como broker em várias réplicas, ainda é preciso um servidor Redis-compatível para `PRESENCE_BACKEND=redis` (Confirmado — `config.rs`).
- O estado de entrega vive no **Postgres**; o broker é só o barramento. Por isso um broker sem persistência (NATS core) não perde mensagem do Pulse: o replay a recupera do banco.

## Redis e compatíveis (Valkey, Dragonfly, KeyDB…)

Usa pub/sub do protocolo Redis. Variáveis:

| Variável | Padrão | Descrição |
|---|---|---|
| `BROKER_PROVIDER=redis` | | |
| `BROKER_REDIS_URL` (fallback `REDIS_URL`) | — | `redis://host:6379/0`; use `rediss://` para TLS. 🔒 |
| `BROKER_REDIS_CHANNEL` (fallback `REDIS_PUBSUB_CHANNEL`) | `seedgrid:pulse:events` | canal pub/sub |
| `PRESENCE_BACKEND=redis` | | usa a mesma `BROKER_REDIS_URL` |

Como o Pulse só fala o protocolo Redis (cliente `redis` 0.32), qualquer servidor compatível serve — **basta apontar a URL**. Verificado em 2026-10-16 rodando a suíte `redis_integration` (broker pub/sub, presença com expiração/heartbeat e revogação entre instâncias) contra:

| Servidor | Imagem testada | Resultado |
|---|---|---|
| Redis | `redis:7.2.4` | 5/5 ✅ |
| Valkey | `valkey/valkey:8` | 5/5 ✅ |
| Dragonfly | `docker.dragonflydb.io/dragonflydb/dragonfly:latest` | 5/5 ✅ |

KeyDB e serviços gerenciados (ElastiCache, Memorystore, Upstash…) **não foram testados** aqui; devem funcionar por falarem o mesmo protocolo (Inferência) — rode a suíte antes de adotar.

Para validar outro servidor:

```bash
SG_PULSE_TEST_REDIS_IMAGE=<imagem>:<tag> \
DOCKER_HOST='npipe:////./pipe/podman-machine-default' TESTCONTAINERS_RYUK_DISABLED=true \
cargo test --test redis_integration -- --ignored --test-threads=1
```

Exemplo de troca (compose): no serviço `redis`, use a imagem `valkey/valkey:8` (ou Dragonfly) e mantenha `BROKER_REDIS_URL=redis://redis:6379/0`; nenhuma outra variável muda.

## NATS

Pub/sub **core** do NATS em um `subject`; cada instância assina o mesmo subject e recebe tudo (fan-out).

| Variável | Padrão | Descrição |
|---|---|---|
| `BROKER_PROVIDER=nats` | | |
| `BROKER_NATS_URL` (fallback `NATS_URL`) | — | `nats://host:4222`. **Obrigatória.** 🔒 |
| `BROKER_NATS_SUBJECT` | `seedgrid.pulse.events` | sem espaços nem curingas `*`/`>` |
| `PRESENCE_BACKEND` | `memory` | `redis` em multi-réplica |

- Entrega **at-most-once**, sem persistência (NATS core). Aceitável porque o estado de entrega está no Postgres e volta pelo replay.
- Sem reconexão automática do stream do broker (igual ao Redis): se a conexão cair, o stream termina com `warn`. Mantenha supervisão/restart do serviço.

Exemplo:

```env
BROKER_PROVIDER=nats
BROKER_NATS_URL=nats://nats:4222
PRESENCE_BACKEND=redis
BROKER_REDIS_URL=redis://redis:6379/0
DELIVERY_STORE_BACKEND=postgres
POSTGRES_URL=postgres://<user>:<senha>@<host>:5432/<db>
```

## RabbitMQ

Exchange **fanout** durável declarada no boot; cada instância cria a **própria fila exclusiva e auto-delete**, ligada ao exchange (fan-out entre instâncias).

| Variável | Padrão | Descrição |
|---|---|---|
| `BROKER_PROVIDER=rabbitmq` | | |
| `BROKER_RABBITMQ_URL` (fallbacks `RABBITMQ_URL`, `AMQP_URL`) | — | `amqp://user:senha@host:5672/%2f` (vhost codificado). **Obrigatória.** 🔒 |
| `BROKER_RABBITMQ_EXCHANGE` | `seedgrid.pulse.events` | nome do exchange fanout |
| `PRESENCE_BACKEND` | `memory` | `redis` em multi-réplica |

- `amqps://` (TLS) está habilitado na crate mas **não foi testado**.
- Sem reconexão automática do broker; filas exclusivas somem quando a instância cai (comportamento desejado no fan-out).

## Memória

`BROKER_PROVIDER=memory` (padrão; valor desconhecido também cai nele): barramento em processo. Só serve para **uma instância**.

## Readiness

`GET /ready` testa store, broker e presença e responde 200 `READY` ou 503 `NOT_READY` com o detalhe por componente. Para NATS e RabbitMQ a sonda é um `ping` com timeout de 5 s.

## Postgres (store de entregas e plataforma)

`POSTGRES_URL` é o interruptor da plataforma (login, audit, apikeys) e `DELIVERY_STORE_BACKEND=postgres` liga a persistência de entregas. As migrations rodam no boot (`POSTGRES_RUN_MIGRATIONS=true`); cada módulo usa a própria tabela de histórico (`_sqlx_migrations_*`). Qualquer Postgres gerenciado serve. Banco único, separação lógica por `company_id`.

## Como foi verificado

| Item | Evidência |
|---|---|
| Redis / Valkey / Dragonfly | `tests/redis_integration.rs`, 5/5 por servidor (Podman, testcontainers) |
| NATS e RabbitMQ | testes de container nas crates `seedgrid-broker-nats`/`-rabbitmq` (fan-out para 3 subscribers em 2 instâncias, payload malformado sem derrubar o stream, `ping`) e `tests/broker_providers_integration.rs` no Pulse (`build_broker` entrega a todos; `/ready` UP) |
| Postgres | `tests/postgres_integration.rs` |

Código-fonte dos brokers: `seedgrid-platform/rust/seedgrid-rust-crate-broker` (crates `-spi`, `-memory`, `-redis`, `-nats`, `-rabbitmq`); README da crate descreve o contrato `Broker` (`publish`/`subscribe`).
