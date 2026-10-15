---
tags: [seedgrid, extension, audit, rust, configuracao]
fonte: rust/seedgrid-rust-crate-audit
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# audit — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/audit/Rust|Porte Rust do audit]] · Java: [[SeedGrid/Extensions/audit/Configuracao|Configuração do audit (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `AuditConfig` (+ `MongoConfig`, `JpaConfig`, enum `AuditPersistenceStrategy`) — `rust/seedgrid-rust-crate-audit/src/config.rs` |
| Mecanismo | `AuditConfig::from_env()` lê `std::env::var`; ou struct construída pelo host (`AuditConfig::default()` / literal) |
| Prefixo Java equivalente | `seedgrid.audit` (`@ConfigMapping` em `AuditConfig.java`) |
| Quem chama `from_env` | `AuditPlatform::assemble` (`src/platform.rs`) e o host (ex.: exemplo `seedgrid-audit-example`) |
| Leitura | uma vez, quando `from_env()` é chamado (no boot do host); sem recarga |

Regras gerais do helper `opt(name)` (`src/config.rs`): valor é `trim()`ado e string vazia vale como ausente. `SEEDGRID_AUDIT_ENABLED` e `AUDIT_STRATEGY` não passam por `opt` (sem trim no `enabled`).

## Variáveis de ambiente

### Ativação e estratégia
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_AUDIT_ENABLED` | bool | `true`/`false` (parse `bool` do Rust, sensível a maiúsculas) | `true` | Não | `false` torna `Auditor::record` no-op e faz `AuditPlatform::assemble` devolver `Ok(None)`. Valor inválido → `true` | liga/desliga auditoria | — | `from_env()` | decl.: `config.rs` → `AuditConfig::from_env`; consumo: `state.rs` (`if !self.config.enabled`), `platform.rs` → `AuditPlatform::assemble` |
| `AUDIT_STRATEGY` (Java: `seedgrid.audit.persistence.strategy`, via `${AUDIT_STRATEGY:...}`) | enum `AuditPersistenceStrategy` | `JPA`, `POSTGRES`, `POSTGRESQL` → `Jpa`; `MONGODB`, `MONGO` → `Mongodb` (case-insensitive, trim) | derivado da feature: `Jpa` com `postgres` (também quando ambas ou nenhuma); `Mongodb` só com `mongodb` sem `postgres` | Não | valor desconhecido → default da feature. `AuditState::postgres/mongodb` falham (`AuditError::Config`) se a estratégia não casar com o backend | escolhe backend no `AuditPlatform`; valida construtor | `MONGODB` sem a feature `mongodb` → `assemble` loga erro e devolve `Ok(None)` | `from_env()` | `config.rs` → `default_strategy`, `AuditPersistenceStrategy::parse`; `state.rs` → `validate_strategy`; `platform.rs` |

### Relacional (JPA/Postgres)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_AUDIT_DB_URL` (Java: `seedgrid.audit.jpa.jdbc.url`) | `Option<String>` | `jdbc:postgresql:...`, `postgres://...`, `postgresql://...` | — | Condicional: só se o host usar `pg_connection_url()` | `AuditConfig::pg_connection_url()` remove `jdbc:`; outro formato → `AuditError::Config` | método público; nenhum chamador no workspace | `AuditPlatform` usa o `PgPool` recebido do host | `from_env()` | `config.rs` → `pg_connection_url` |

### MongoDB
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `SEEDGRID_AUDIT_MONGODB_URI` (Java: `seedgrid.audit.mongodb.connection-string`, via `${SEEDGRID_AUDIT_MONGODB_URI:...}`) | `Option<String>` (sempre `Some` após `from_env`) | URI MongoDB | `DEFAULT_MONGODB_URI` = `mongodb://<usuario>:<SEGREDO:mongo-dev>@localhost:27017` (credenciais de dev embutidas, redigidas aqui) | Condicional: estratégia `Mongodb` | URI usada por `effective_mongo_uri()`; falha de conexão → auditoria no-op (`Ok(None)`) | `AuditPlatform::assemble_mongo` | requer feature `mongodb` | `from_env()` | `config.rs` → `DEFAULT_MONGODB_URI`, `effective_mongo_uri`; `platform.rs` |
| `SEEDGRID_AUDIT_MONGODB_DATABASE` (Java: `seedgrid.audit.mongodb.database`) | `Option<String>` | nome de banco | sem padrão no config; `AuditPlatform` usa `seedgrid_audit` quando ausente | Não | nome do banco Mongo | `AuditPlatform::assemble_mongo` | — | `from_env()` | `config.rs`; `platform.rs` |

Mapeamento Java ↔ env: **Confirmado** para `AUDIT_STRATEGY`, `SEEDGRID_AUDIT_DB_URL` e `SEEDGRID_AUDIT_MONGODB_URI` (expressões `${...}` em `java/seedgrid-quarkus-ext-audit/*/runtime/src/main/resources/META-INF/microprofile-config.properties`). `SEEDGRID_AUDIT_MONGODB_DATABASE` corresponde à conversão padrão MicroProfile de `seedgrid.audit.mongodb.database` (**Confirmado** pela regra, sem hífen ambíguo). `SEEDGRID_AUDIT_ENABLED` é uma opção só do Rust.

## Structs (construção pelo host)
| Campo | Tipo | `Default` | Notas |
|---|---|---|---|
| `AuditConfig.enabled` | `bool` | `true` | |
| `AuditConfig.strategy` | `AuditPersistenceStrategy` | `default_strategy()` | `#[default]` do enum é `Jpa`, mas `AuditConfig::default()` usa `default_strategy()` |
| `AuditConfig.mongodb` | `MongoConfig { database, connection_string }` | ambos `None` | com `None`, `effective_mongo_uri()` cai no `DEFAULT_MONGODB_URI` |
| `AuditConfig.jpa.jdbc_url` | `Option<String>` | `None` | usado só por `pg_connection_url()` |

## Features Cargo
| Feature | Padrão | Efeito |
|---|---|---|
| `postgres` | sim | habilita `sqlx`, `postgres.rs`, `migrate`, `MIGRATOR`, `AuditPlatform`, `AuditState::postgres`; muda `default_strategy()` para `Jpa` |
| `mongodb` | não | habilita `mongodb`/`bson`, `mongodb.rs`, `AuditState::mongodb`; sem `postgres`, `default_strategy()` vira `Mongodb` |

## Configuração não-env (código)
- Autorização de leitura: `AuditStateBuilder::read_authorizer(...)` — default `DenyAllAuditReadAuthorizer` (403). Não há variável de ambiente.
- Escopo de leitura, request context e contribuidores: via builder (`src/state.rs`).

## Somente testes / exemplos
| Variável | Onde | Finalidade |
|---|---|---|
| `AUDIT_IT_PG_URL` | `tests/pg_metadata_it.rs` | Postgres para IT `#[ignore]` |
| `AUDIT_IT_MONGO_URI` | `tests/mongo_metadata_it.rs` | Mongo para IT `#[ignore]` |
| `DATABASE_URL` | `examples/seedgrid-audit-example/src/main.rs` | conexão do exemplo (lida pelo exemplo, não pela crate) |
| `DOCKER_HOST`, `TESTCONTAINERS_RYUK_DISABLED` | `.env.example` do exemplo | Testcontainers/Podman |

## Configuração mínima (`.env`)
```dotenv
# Postgres (feature default): a conexão é do host; a crate só precisa disto se quiser desligar
SEEDGRID_AUDIT_ENABLED=true
```

## Configuração completa comentada
```dotenv
SEEDGRID_AUDIT_ENABLED=true            # false => Auditor no-op
AUDIT_STRATEGY=JPA                     # JPA|POSTGRES|POSTGRESQL|MONGODB|MONGO
SEEDGRID_AUDIT_DB_URL=jdbc:postgresql://<host>:5432/<db>   # só via pg_connection_url()
# Mongo (feature mongodb + AUDIT_STRATEGY=MONGODB)
SEEDGRID_AUDIT_MONGODB_URI=mongodb://<usuario>:<SEGREDO:audit-mongo>@<host>:27017
SEEDGRID_AUDIT_MONGODB_DATABASE=seedgrid_audit
```

## Receitas
- **Postgres (padrão)**: compile com a feature default, crie o `PgPool`, `seedgrid_audit::migrate(&pool)`, `AuditState::postgres(pool, AuditConfig::from_env())?`, registre um `AuditReadAuthorizer` que valide `LOG_READ`.
- **MongoDB**: `default-features = false, features = ["mongodb"]`, `AUDIT_STRATEGY=MONGODB` (ou deixe o default da feature), `SEEDGRID_AUDIT_MONGODB_URI` e `SEEDGRID_AUDIT_MONGODB_DATABASE`.
- **Desligar**: `SEEDGRID_AUDIT_ENABLED=false`.

## Dúvidas e lacunas
- `SEEDGRID_AUDIT_DB_URL` só tem efeito se o host chamar `pg_connection_url()`; `AuditPlatform` e os construtores usam o `PgPool` do host.
