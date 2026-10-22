---
tags: [seedgrid, extension, audit, rust]
fonte: rust/seedgrid-rust-crate-audit
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# audit — porte Rust (`seedgrid-rust-crate-audit`)

Porte da extensão Quarkus `seedgrid-quarkus-ext-audit` (módulos `audit-core`, `audit-postgresql`, `audit-mongodb`). Lado Java: [[SeedGrid/Extensions/audit/Visao-geral|Visão geral do audit (Java)]] · [[SeedGrid/Extensions/audit/Configuracao|Configuração do audit (Java)]]. Configuração Rust: [[SeedGrid/Extensions/audit/Configuracao-Rust|Configuração Rust do audit]].

Trilha de auditoria (snapshot *before/after*) com mascaramento de PII, backends PostgreSQL (sqlx) e MongoDB e um router Axum de leitura. **Confirmado** (`rust/seedgrid-rust-crate-audit/src/lib.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-audit` (lib `seedgrid_audit`) |
| Versão | herdada do workspace: `2026.10.14` (`rust/Cargo.toml` → `[workspace.package]`). |
| Edição / MSRV | 2021 / 1.82 |
| Features | `postgres` (default, `sqlx`), `mongodb` (`mongodb` + `bson`) |
| Dependência SeedGrid | `seedgrid-rust-crate-privacy` (motor de mascaramento; o módulo `masking` re-exporta `seedgrid_privacy::masking`) |
| Consumidores no workspace | security, backup, login-tenancy, subdomain-tenancy |

## Arquitetura (diferença em relação ao Java)
No Java a captura vem do interceptor CDI `@SgAudit`. Em Rust **não há interceptor**: o consumidor monta um `AuditEvent` e chama `Auditor::record`. A crate então: (1) deriva `entity` = nome simples do FQCN; (2) mascara `before_state`/`after_state` com as `MaskRule`s do evento; (3) preenche usuário, timestamp, origin, IP, user-agent e metadata pelos SPIs; (4) faz *upsert* dos índices `entities`/`users`; (5) persiste. Escritas são best-effort: erros são logados e engolidos. **Confirmado** (`src/lib.rs`, `src/state.rs`).

As validações build-time do `AuditProcessor` do Quarkus (`@SgAudit(entityFqcn=...)`, `lookupMethod`/`lookups`) não existem em Rust; estão só como doc comments em `src/lib.rs`.

## API pública principal
| Símbolo | Papel | Fonte |
|---|---|---|
| `AuditConfig`, `AuditPersistenceStrategy`, `default_strategy()` | Config (ver [[SeedGrid/Extensions/audit/Configuracao-Rust\|Configuração Rust]]) | `src/config.rs` |
| `AuditState::postgres(pool, cfg)` / `AuditState::mongodb(db, cfg)` | Construtores; retornam `Result` e validam que `cfg.strategy` casa com o backend (`validate_strategy`) | `src/state.rs` |
| `AuditState::builder(config, repo, entities_repo, users_repo)` → `AuditStateBuilder` | Montagem com repositórios arbitrários; `.request_context(..)`, `.metadata_contributor(..)`, `.read_scope(..)`, `.read_authorizer(..)`, `.build()` | `src/state.rs` |
| trait `Auditor` (`record(event, ctx)`) | Seam de escrita | `src/state.rs` |
| `AuditEvent` (`new`, `description`, `before_state`, `after_state`, `mask_rule(s)`, `tech_operation`) | Evento montado pelo consumidor | `src/models.rs` |
| `AuditContext` (`user`, `request`, `metadata`) | Contexto da escrita; `metadata` direta vence os contribuidores (adição do Rust, D8) | `src/state.rs` |
| `AuditFilter`, `PageReq`, `PageResult` (serializa `items`) | Leitura/paginação | `src/models.rs` |
| `migrate(&PgPool)` / `MIGRATOR` | Migrations `0300`–`0302`, histórico isolado `_sqlx_migrations_audit` | `src/lib.rs`, `src/migrations.rs` |
| `router(state)` / `router_with_resolver(resolver, authorizer)` | Router Axum (único ou resolvido por tenant) | `src/routes.rs` |
| `openapi()` | Spec utoipa da crate | `src/apidoc.rs` |
| `AuditPlatform::assemble(Option<&PgPool>)` | Montagem "estilo CDI" a partir do ambiente (só com feature `postgres`) | `src/platform.rs` |
| Repositórios `PgAuditLog*Repository`, `MongoAuditLog*Repository`; traits `AuditLogRepository`, `AuditLogEntitiesRepository`, `AuditLogUsersRepository` | Persistência | `src/postgres.rs`, `src/mongodb.rs`, `src/repo.rs` |

### SPIs (todos com default, substituíveis no builder)
| Trait | Default | Observação |
|---|---|---|
| `AuditRequestContextProvider` | `HttpAuditRequestContextProvider` | origin = `Origin` → `Referer` → `Host`; IP = 1º hop de `X-Forwarded-For` |
| `AuditMetadataContributor` | nenhum | falhas ignoradas |
| `AuditReadScopeProvider` | `DefaultAuditReadScopeProvider` (irrestrito) | pode forçar `metaKey`/`metaValue` (isolamento por company) |
| `AuditReadAuthorizer` | **`DenyAllAuditReadAuthorizer`** (403) | porta `@PermissionsAllowed("LOG_READ")`; `AllowAllAuditReadAuthorizer` é opt-in inseguro |
| `AuditStateResolver` | — | resolve o `AuditState` do tenant corrente; `None` → 503 |

**Confirmado** (`src/spi.rs`).

## Endpoints (router Axum)
| Método | Path | Descrição |
|---|---|---|
| GET | `/audit-logs` | lista; com `page` ou `size` → `PageResult` (`{items,total,page,size}`); filtros `idFrom, idTo, entity, operation, description, operationDateFrom, operationDateTo, userName, metaKey, metaValue` |
| GET | `/audit-logs/{id}` | 404 se fora do escopo de leitura |
| GET | `/audit-logs/entities` | entidades distintas |
| GET | `/audit-logs/users` | usuários distintos |

Fonte: `src/routes.rs` → `router`, `router_with_resolver`.

## Persistência
- Postgres: migrations `migrations/0300_create_audit_tables.sql`, `0301_add_tech_operation.sql`, `0302_add_metadata.sql` (portadas de V300–V302); metadata em EAV `audit_log_metadata`.
- Mongo: coleções `audit_logs`, `audit_log_entities`, `audit_log_users`; `sequentialId` via contador `counters` (`_id="audit_log_sequence"`).

## Exemplo (de `rust/examples/seedgrid-audit-example/src/main.rs`)
```rust
use seedgrid_audit::{AuditConfig, AuditContext, AuditEvent, AuditOperation, Auditor, MaskRule};

seedgrid_audit::migrate(&pool).await?;
let state = seedgrid_audit::AuditState::postgres(pool.clone(), AuditConfig::from_env())?;

let event = AuditEvent::new("br.com.seedgrid.example.Cliente", AuditOperation::Create)
    .description("cadastro de cliente")
    .after_state(serde_json::json!({ "cpf": "12345678900", "nome": "Joao Silva" }))
    .mask_rule(MaskRule::format("cpf", "***.***.***-**"));
state
    .record(event, AuditContext::new().user("maria").metadata("companyPublicId", company))
    .await; // best-effort: não retorna erro
```
Para expor a leitura: `axum::Router::new().merge(seedgrid_audit::router(state))` — lembrando que, sem `read_authorizer`, toda leitura responde 403.

## Testes
- Unitários em `src/*` (mascaramento, filtros, enum, `config` — default de estratégia por feature).
- `tests/pg_metadata_it.rs` e `tests/mongo_metadata_it.rs`: `#[ignore]`, só rodam com `AUDIT_IT_PG_URL` / `AUDIT_IT_MONGO_URI`.
- E2E Testcontainers no exemplo: `rust/examples/seedgrid-audit-example/tests/audit_e2e.rs`.
- **Não executados** nesta análise.

## Notas de comportamento

- `enabled=false` faz `Auditor::record` virar no-op.
- Leitura é deny-by-default.
- O consumidor preenche `AuditEvent::tech_operation`.
- A estratégia padrão deriva da feature Cargo; não há router dinâmico entre dois backends.

## Lacunas
- No modo JPA a conexão vem do `PgPool` do host; `SEEDGRID_AUDIT_DB_URL` só é usada por `AuditConfig::pg_connection_url()`, que nenhuma crate do workspace chama.

## Enums
Equivalentes Java e comparação detalhada: [[SeedGrid/Extensions/audit/Enums|Enums do audit (Java)]].

| Enum | Arquivo | Java equivalente |
|---|---|---|
| `AuditOperation` | `src/models.rs` | [[SeedGrid/Extensions/audit/Enums#AuditOperationEnum\|AuditOperationEnum]] |
| `AuditPersistenceStrategy` | `src/config.rs` | [[SeedGrid/Extensions/audit/Enums#AuditPersistenceStrategy\|AuditPersistenceStrategy]] |
| `AuditError` | `src/error.rs` | exceções do audit (sem enum Java) |

### AuditOperation
Variantes: `Create`, `Update`, `Delete`, `Read`, `Other`. `#[serde(rename_all = "UPPERCASE")]` → JSON `"CREATE"`…`"OTHER"`. `name()`/`Display` devolvem o nome em maiúsculas (usado como `description` padrão); `FromStr` aceita qualquer caixa e erra com `AuditOperation invalida: X`. Persistida como `VARCHAR(50)` com o nome (sem CHECK constraint em `migrations/0300`); valor desconhecido lido do banco falha. Valores **iguais** ao Java (`@Enumerated(STRING)`).

### AuditPersistenceStrategy
Variantes: `Jpa` (padrão do enum), `Mongodb`. Sem serde. `parse(&str)` (trim, case-insensitive): `JPA`/`POSTGRES`/`POSTGRESQL` → `Jpa`; `MONGODB`/`MONGO` → `Mongodb`; outro → `None` (cai no default da feature). Lido de `AUDIT_STRATEGY` ([[SeedGrid/Extensions/audit/Configuracao-Rust|Configuração Rust]]). Nota: o Java só tem `JPA` e `MONGODB`; os aliases `POSTGRES`/`POSTGRESQL`/`MONGO` existem só no Rust. O default depende da feature compilada (`default_strategy()`).

### AuditError
`NotFound(i64)` e `OutOfScope` → 404; `Forbidden(String)` → 403; `Config`, `Json`, `Internal`, `Database` (feature `postgres`), `Mongo` (feature `mongodb`) → 500 (`AuditError::status`).
