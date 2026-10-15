---
tags: [seedgrid, extension, subdomain-tenancy, rust]
fonte: rust/seedgrid-rust-crate-subdomain-tenancy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# `seedgrid-rust-crate-subdomain-tenancy` — porte Rust

Lado Java: [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral|Visão geral do subdomain-tenancy (Quarkus)]] · [[SeedGrid/Extensions/subdomain-tenancy/Configuracao|Configuração Java]]
Configuração deste crate: [[SeedGrid/Extensions/subdomain-tenancy/Configuracao-Rust|Configuração Rust do subdomain-tenancy]]

## Objetivo

Porte da extensão `seedgrid-quarkus-ext-subdomain-tenancy` (antiga *multitenancy*): multitenancy **por subdomínio**, modelo **SILO** (um banco Postgres por tenant). Principais capacidades (Confirmado em `README.md`, `src/lib.rs`, `src/orchestrator.rs`):

- Resolução do tenant pelo host `{tenant}.{domain-suffix}` (prioriza `X-Forwarded-Host`; fallback `master`).
- Registro de tenants no banco **master** (`tenants`, `tenant_validation_tokens`, `tenant_migration_state`).
- Signup público de tenant com OTP por e-mail, validação e **provisionamento** (`CREATE DATABASE` + migrations security/tenant/audit/backup/apikeys + admin root).
- **Coordenação de migrations por tenant** (lock com lease/fencing token, heartbeat, concorrência limitada) e **gate de login** enquanto o tenant migra.
- Pools por tenant com LRU (`max-active-datasources`) e circuit breaker; middleware que devolve 404 para tenant inexistente/inativo.
- Schedulers de cleanup de tenants não validados e de trial.
- Orquestrador `assemble_all`: monta tenancy + security + billing + audit + backup, injeta os hooks de tenancy no security e devolve `Router` e OpenAPI agregados.
- PII at-rest do `Tenant` via `CryptoProvider` global do `seedgrid-privacy`; auditoria de criação de tenant.

## Coordenadas

| Item | Valor |
|---|---|
| Diretório / pacote / lib | `rust/seedgrid-rust-crate-subdomain-tenancy` / `seedgrid-rust-crate-subdomain-tenancy` / `seedgrid_subdomain_tenancy` |
| Versão | `version.workspace = true` → `2026.10.14` |
| Features | `default = ["postgres"]`, `postgres = ["dep:sqlx"]` |
| Reexporta | `seedgrid_apikeys`, `seedgrid_audit`, `seedgrid_backup`, `seedgrid_billing`, `seedgrid_cache`, `seedgrid_privacy`, `seedgrid_resilience`, `seedgrid_security` (usa também `seedgrid_runtime::events`) |

## API pública (principais)

| Símbolo | Papel |
|---|---|
| `SubdomainTenancyConfig` (+ `from_env`, `apply_datasource_env`) | ver [[SeedGrid/Extensions/subdomain-tenancy/Configuracao-Rust\|Configuração Rust]] |
| `assemble_all(Arc<SubdomainTenancyConfig>, Option<PgPool>, PlatformOverrides)` → `AssembledPlatform { tenancy, security, billing, audit_scoped, backup_scoped, router, openapi }` | "CDI" do host |
| `TenancyPlatform::assemble(...)` → `AssembledTenancy` (`provisioning_router()`, `shutdown_schedulers()`), `HostOverrides` | montagem só da tenancy |
| `TenantService`, `TenantProvisioner`, `TenantProvisioningService`, `TenantRepository`, `TenantValidationTokenRepository` | signup/validação/provisionamento |
| `TenantMigrationCoordinator` (em `migration`), `PgTenantMigrationStore`, `DefaultTenantSchemaMigrator`, `TenantBusinessSchemaMigrator` | migração por tenant |
| `TenantPoolProvider`, `TenantConnectionResolver`, `TenantScoped`/`TenantStateFactory`, `TenantContext` | roteamento de pools/estado por tenant |
| `tenant_migration_gate` / `TenantMigrationGateState`, `tenant_middleware::*` | middlewares |
| `TenantJwtTokenCustomizer`, `TenantScopeResolver` (`spi`) | hooks para o security |
| `TenantHealthService`, `TenantHealthReport` | health por tenant |
| `extract_tenant_from_host`, `resolve_host_header`, `resolve_tenant` | resolução |
| `spawn_backup_scheduler`, `schedulers::*` | jobs |
| `migrate(&PgPool)` / `migrate_startup(...)` / `MIGRATOR` | migrations do master `0100..0109` |
| `router(SubdomainTenancyState)`, `provisioning_router(TenantProvisioningApiState)`, `openapi()` | rotas |

## Endpoints (Confirmado em `src/routes.rs` e `src/provisioning_routes.rs`)

| Método | Path |
|---|---|
| POST | `/public/tenants` (signup) |
| POST | `/public/tenants/validate-email` |
| POST | `/public/tenants/resend-email` |
| GET | `/internal/health/tenants/{tenantId}` |
| POST | `/internal/migrations/tenants/{tenantId}/trigger` |
| GET | `/internal/migrations/tenants/{tenantId}/status` |
| POST | `/internal/tenants/{tenantId}/provision` (`provisioning_router`) |
| GET | `/tenants`, `/tenants/{subdomain}` (`provisioning_router`; resumo do registro master) |

Rotas restritas ao contexto master respondem 403 `master_scope_required` quando chamadas sob outro tenant (`src/routes.rs`).

O `router` agregado do `assemble_all` inclui ainda security, billing, `/audit-logs` e `/exports` (backup), com middleware de resolução de tenant, gate de migração e auth admin via security.

## Exemplos

Montagem completa (Inferência a partir das assinaturas de `assemble_all` e `SubdomainTenancyConfig`; não há exemplo no repositório usando `assemble_all`):

```rust
use std::sync::Arc;
use seedgrid_subdomain_tenancy::{assemble_all, PlatformOverrides, SubdomainTenancyConfig};

async fn boot(master_url: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut cfg = SubdomainTenancyConfig::from_env();
    cfg.apply_datasource_env(Some(master_url));
    let master_pool = sqlx::PgPool::connect(master_url).await?;
    let assembled = assemble_all(Arc::new(cfg), Some(master_pool), PlatformOverrides::default())
        .await
        .map_err(|e| e.to_string())?;
    let app = axum::Router::new().nest("/api/v1", assembled.router);
    let _ = app;
    Ok(())
}
```

Exemplo executável (Confirmado): `rust/examples/seedgrid-subdomain-tenancy-example/src/main.rs` — monta à mão `TenantPoolProvider`, `DefaultTenantSchemaMigrator`, `TenantMigrationCoordinator`, `TenantProvisioningService` e `TenantService` (trial 14 dias, OTP 10 min, `NoopPasswordEncoder` só para dev) e percorre signup → validação → provisionamento. Usa envs próprias do exemplo (`DATABASE_URL`, `TENANT_URL_PATTERN`, `TENANT_DB_USER`, `TENANT_DB_PASSWORD`, `EXAMPLE_TENANT`).

## Migrations (master)

`0100_create_tenants_table.sql` … `0109_privacy_search_hashes.sql` (10 arquivos): tenants, root user, trial, snapshot de usuário, `tenant_migration_state` (+ fencing token), índices, `tenant_validation_tokens` (+ base entity), hashes de privacidade. Os bancos de tenant recebem as migrations de security/audit/backup/apikeys + negócio via `DefaultTenantSchemaMigrator`.

## Testes

Unitários em `src/**` (config, resolver, gate, service...) e `tests/db_it.rs` (Testcontainers). **Não executados** nesta análise.

## Notas de comportamento

- O crate lê `SEEDGRID_MULTITENANCY_*` (o módulo Java usa `SEEDGRID_SUBDOMAIN_TENANCY_*`) — ver [[SeedGrid/Extensions/subdomain-tenancy/Configuracao-Rust|Configuração Rust]].
- Gate de login mais permissivo (`ends_with` e bypass do `default_tenant`).
- `validate_tenant` provisiona antes de marcar tokens usados.
- O admin do master é semeado pelo bootstrap do security (envs `SEEDGRID_SECURITY_FIRST_ADMIN_USER_*`), não por `subdomain-tenancy.admin-user.*`.

## Enums

Equivalentes Java em [[SeedGrid/Extensions/subdomain-tenancy/Enums|Enums (Quarkus)]].

| Enum | Arquivo | Usado em | Equivalente Java |
|---|---|---|---|
| `TenantMigrationStatus` | `src/migration/mod.rs` | coluna `tenant_migration_state.status`; corpo de `/internal/migrations/...` | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantMigrationStatus\|TenantMigrationStatus]] |
| `TenantMigrationDecision` | `src/migration/mod.rs` | `TenantMigrationOutcome`; gate de login | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantMigrationDecision\|TenantMigrationDecision]] |
| `TenantHealthStatus` | `src/health.rs` | corpo de `GET /internal/health/tenants/{tenantId}` | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantHealthStatus\|TenantHealthStatus]] |
| `TenantHealthCode` | `src/health.rs` | idem | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantHealthCode\|TenantHealthCode]] |
| `SignupOutcome` | `src/service.rs` | resposta de `POST /public/tenants` | [[SeedGrid/Extensions/subdomain-tenancy/Enums#SignupOutcome\|SignupOutcome]] |
| `StateEnum` | `src/models/embeddables.rs` | `state` do endereço do signup e do tenant | `StateEnum` da lib commons |
| `TenantAccess` | `src/pool_resolver.rs` | resultado do gate de tenant no middleware | sem equivalente (específico do Rust) |
| `TenantServiceError`, `ProvisioningError`, `AssemblyError` | `service.rs`, `provisioning.rs`, `platform.rs` | erros | exceções do Java |

### TenantMigrationStatus

`Pending` → `PENDING`, `Ready` → `READY`, `Migrating` → `MIGRATING`, `Failed` → `FAILED` (via `name()`). Coluna `status VARCHAR(20) NOT NULL DEFAULT 'PENDING'`, sem CHECK (`migrations/0104_create_tenant_migration_state.sql`). `parse(Option<&str>)` é tolerante: apara, ignora caixa e transforma qualquer valor desconhecido ou ausente em `Pending`. Java: mesmos 4 valores na mesma ordem.

### TenantMigrationDecision

`Ready` → `READY`, `InProgress` → `IN_PROGRESS`, `Failed` → `FAILED`. Não é persistido. No gate de login, `Ready` deixa passar; qualquer outra decisão responde **503** com `Retry-After: 15` e `error` = `tenant_migration_in_progress` ou `tenant_migration_failed`. Java: mesmos 3 valores.

### TenantHealthStatus e TenantHealthCode

- `TenantHealthStatus`: `Up` (`UP`), `Down` (`DOWN`), `OutOfService` (`OUT_OF_SERVICE`).
- `TenantHealthCode`: `Ok`, `InvalidTenant`, `TenantNotFound`, `TenantInactive`, `DatabaseUnreachable`, `MigrationPending`, `MigrationRunning`, `MigrationFailed`. O `name()` sai em SCREAMING_SNAKE (`OK`, `INVALID_TENANT`, ...).
- HTTP do health (`resolve_health_status`): `UP` → 200; `INVALID_TENANT` → 400; `TENANT_NOT_FOUND` → 404; os demais → 503.
- Java: mesmos valores e mesma ordem nos dois enums. Não são persistidos; o corpo JSON usa `name()`.

### SignupOutcome

`Created` → `CREATED` e `UpdatedPending` → `UPDATED_PENDING`, com resposta 201 e 200, respectivamente, em `POST /public/tenants`. Java: `CREATED`, `UPDATED_PENDING`, idêntico.

### StateEnum (subdomain-tenancy)

27 UFs com variantes em maiúsculas (`AC` ... `TO`), com `Serialize`/`Deserialize` por derive: serializa e desserializa **somente a sigla exata em maiúsculas**. **Atenção:** o `StateEnum` do login-tenancy Rust também aceita minúsculas e o nome completo do estado (como o `fromJson` do Java); este aqui não.

### TenantAccess

`Master` (escopo master, segue no pool master), `Active` (tenant existente e ativo, pool aquecido) e `Rejected` (inexistente ou inativo: o middleware responde 404, fail-closed). Sem equivalente Java.

### Erros

- `TenantServiceError`: `SubdomainAlreadyExists`, `CnpjAlreadyExists`, `TenantNotFound`, `TenantAlreadyActive`, `ValidationCodeExpired`, `Db`, `OtpGeneration`, `Provisioning`, `WeakPassword(Vec<String>)`.
- `ProvisioningError`: `Locked(String)` (lock de provisionamento já tomado) e `Db(String)`.
- `AssemblyError`: `Migration(MigrateError)`.

### Internos

| Enum | Arquivo |
|---|---|
| `SchedulerStep` (`Cleanup`, `Queue`, `Notify`) | `src/backup_scheduler.rs` |
