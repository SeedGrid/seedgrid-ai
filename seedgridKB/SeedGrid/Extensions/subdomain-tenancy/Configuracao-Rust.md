---
tags: [seedgrid, extension, subdomain-tenancy, rust, configuracao]
fonte: rust/seedgrid-rust-crate-subdomain-tenancy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# Configuração Rust — `seedgrid-rust-crate-subdomain-tenancy`

Volta para: [[SeedGrid/Extensions/subdomain-tenancy/Rust|Porte Rust do subdomain-tenancy]] · Java: [[SeedGrid/Extensions/subdomain-tenancy/Configuracao|Configuração do subdomain-tenancy (Quarkus)]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Struct | `SubdomainTenancyConfig` (`src/config.rs`), `impl Default` com os defaults abaixo |
| Prefixo lógico | `seedgrid.subdomain-tenancy.*` (porte de `SubdomainTenancyConfig.java` + `SubdomainTenancyBridgeConfig.java`) |
| Mecanismo | `SubdomainTenancyConfig::from_env()` (env vars `SEEDGRID_MULTITENANCY_*` + `DOMAIN_SUFFIX`, `PRODUCT_PREFIX`), que no fim chama `apply_datasource_env(None)`. O host pode chamar de novo `apply_datasource_env(Some(master_url))` para derivar o datasource do tenant a partir da URL do master dele |
| Leitura | boot, pelo host. O crate **não** chama `from_env` sozinho: `assemble_all(Arc<SubdomainTenancyConfig>, ...)` e `TenancyPlatform::assemble` recebem a struct pronta |
| Gate global | `domain_suffix = None` → tenancy desligada (`assemble_all` não monta `TenancyPlatform`, auditoria fica single-DB) |
| Features Cargo | `default = ["postgres"]`; `postgres = ["dep:sqlx"]` (backend relacional do master: `tenants`, `tenant_migration_state`, `tenant_validation_tokens`) |
| Outras leituras de env no crate | só `AuditConfig::from_env()` em `src/orchestrator.rs` (envs do audit) e, indiretamente, `SecurityConfig::from_env()` via `SecurityPlatform::assemble` e as do backup/billing via `BackupPlatform`/`BillingPlatform` |
| Origem | caminhos relativos a `rust/seedgrid-rust-crate-subdomain-tenancy/` |

### ⚠️ Nomes de env divergentes do módulo Java atual (Confirmado)

O `microprofile-config.properties` do Java (commit `fe62530`) e o exemplo Java usam **`SEEDGRID_SUBDOMAIN_TENANCY_*`**. O crate Rust lê **`SEEDGRID_MULTITENANCY_*`** (nome antigo, citado no próprio exemplo Java como "nome antigo"). Nenhuma env `SEEDGRID_SUBDOMAIN_TENANCY_*` é lida pelo crate (grep). Consequência: um `dev.env` do Java atual **não** configura o porte Rust.

Parsing: booleanos em geral `v != "false"` (qualquer coisa diferente de `false` literal liga) — exceções: `..._STARTUP_ALL_TENANTS` (`== "true"`). Durações via `parse_ttl_to_secs` (ISO-8601 com `W/D/H/M/S` ou sufixo `48H`/`7D`/`30M`; inválido → **48h**, inclusive para lock-lease e delay do circuit breaker). Pools via `pool_env` (mínimo 1).

## 2. Propriedades do crate

### 2.1 Resolução de tenant

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `DOMAIN_SUFFIX` · fallback `SEEDGRID_MULTITENANCY_DOMAIN_SUFFIX` → `domain_suffix` | `Option<String>` | ex. `crm.seedgrid.com.br` | `None` (tenancy OFF) | Condicional: obrigatória para ligar a tenancy | `{tenant}.{suffix}` → tenant; vazio = ausente | `src/resolver.rs`, `src/orchestrator.rs` (gate) | Java: `seedgrid.subdomain-tenancy.domain-suffix` (env Java `SEEDGRID_SUBDOMAIN_TENANCY_DOMAIN_SUFFIX` **não lida**) | boot | `src/config.rs` → `from_env` |
| `PRODUCT_PREFIX` → `product_prefix` | `Option<String>` | ex. `crm` | `None` | Não | nome do banco por tenant `<prefix>_<tenant>` | `TenantPoolProvider`, provisioning, coordinator | Java: `seedgrid.subdomain-tenancy.product-prefix`; o Java usa a env `PRODUCT_PREFIX` em `database.master.subdomain` | boot | idem |
| `default_tenant` (campo) | `String` | — | `master` | Não | tenant de fallback/escopo plataforma (bypass do gate de migração) | `gate.rs`, `pool_resolver.rs`, `provisioning_routes.rs`, `spi.rs`, `tenant_scoped.rs` | Java: `...default-tenant`; **sem env no Rust** | struct | `SubdomainTenancyConfig::default` |

### 2.2 Datasources (master e tenant)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_MULTITENANCY_MASTER_DB_URL` | URL | `jdbc:postgresql://`, `postgresql://`, `postgres://` | — (fallback: `master_url_fallback` do host) | Não | base para derivar `host:port` (e creds embutidas) do tenant | `apply_datasource_env` | Java: `...master.datasource.jdbc.url` | boot | `src/config.rs` → `apply_datasource_env` |
| `SEEDGRID_MULTITENANCY_MASTER_DB_USERNAME` | `String` | — | — | Não | fallback das creds do tenant | idem | Java: `...master.datasource.username` | boot | idem |
| 🔒 `SEEDGRID_MULTITENANCY_MASTER_DB_PASSWORD` | `String` | — | — | Não | idem | idem | Java: `...master.datasource.password` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_URL` → `tenant_url_pattern` | URL base | URL sem `{tenant}` (anexa `/{tenant}`) ou com `{tenant}` | `jdbc:postgresql://localhost:5439/{tenant}` | Não (recomendada) | precedência: `TENANT_URL_PATTERN` > `TENANT_DB_URL` > host:port do master > default | `TenantPoolProvider`, coordinator | Java: `...tenant.datasource.jdbc.url` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_URL_PATTERN` → `tenant_url_pattern` | `String` | com `{tenant}` | — | Não | legado; tem a última palavra | idem | Java: `...tenant.datasource.jdbc.url-pattern` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_USERNAME` → `tenant_username` | `String` | — | `postgres` | Não | precedência: env tenant > creds do master > default; também vira `OWNER` do `CREATE DATABASE` | provisioning, pools | Java: `...tenant.datasource.username` | boot | idem |
| 🔒 `SEEDGRID_MULTITENANCY_TENANT_DB_PASSWORD` → `tenant_password` | `String` | — | `postgres` | Não (trocar em produção) | idem | pools | Java: `...tenant.datasource.password` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_POOL_MIN` / `_MAX` → `tenant_pool_min/max` | `u32` | ≥ 1 | `1` / `10` | Não | conexões por pool de tenant | `src/orchestrator.rs` (`with_min/max_connections`) | Java: `...tenant.datasource.jdbc.min-size/max-size` (Java: **0 / 5**) | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_MAX_ACTIVE_DATASOURCES` → `tenant_max_active_datasources` | `usize` | `0` = ilimitado | `200` | Não | teto de pools em cache; LRU fecha o menos usado | `src/orchestrator.rs` (`with_max_active`) | Java: `...tenant.datasource.max-active-datasources` | boot | `src/config.rs` |
| `SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_ENABLED` → `tenant_cb_enabled` | `bool` | `false` desliga | `true` | Não | CB em volta da abertura do pool de cada tenant | `src/orchestrator.rs` | **só no Rust** (Java não tem `enabled`) | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_FAILURE_RATIO` | `f64` | 0..1 | `0.5` | Não | convertido para % | idem | Java: `...circuit-breaker.failure-ratio` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_REQUEST_VOLUME_THRESHOLD` | `i32` | inteiro | `6` | Não | mínimo de chamadas | idem | Java: `...request-volume-threshold` | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_DELAY` → `tenant_cb_delay_secs` | `i64` (s) | duração | `30` | Não | tempo aberto; inválido → 48h | idem | Java: `...delay` (PT30S) | boot | idem |
| `SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_SUCCESS_THRESHOLD` | `i32` | inteiro | `2` | Não | chamadas permitidas em half-open | idem | Java: `...success-threshold` | boot | idem |

### 2.3 Signup e trial

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_MULTITENANCY_TRIAL_DAYS` → `trial_days` | `i64` | inteiro | `0` | Não | `> 0` → tenant ativo após validar, com `trial_ends_at`; `0` → billing exigido | `src/service.rs:255,272` | equivalente Java **não encontrado** no commit analisado | boot | `src/config.rs` |
| `SEEDGRID_MULTITENANCY_OTP_EXPIRY_MINUTES` → `otp_expiry_minutes` | `i64` | inteiro | `10` | Não | validade do OTP de validação de e-mail | `src/service.rs:184` | Java: `seedgrid.subdomain-tenancy.otp-expiry-minutes` (`@ConfigProperty`, default 10) | boot | idem |

### 2.4 Migração por tenant

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_MULTITENANCY_MIGRATION_ENABLED` → `migration_enabled` | `bool` | `false` desliga | `true` | Não | liga coordinator e gate | `src/platform.rs` | Java: `...migration.enabled` | boot | `src/config.rs` |
| `SEEDGRID_MULTITENANCY_MIGRATION_TARGET_VERSION` | `String` | — | `v1` | Não | versão-alvo registrada em `tenant_migration_state` | coordinator | Java: `...migration.target-version` | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_MAX_CONCURRENCY` | `usize` | inteiro | `3` | Não | migrations de tenant em paralelo | coordinator | Java: `...migration.max-concurrency` | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_LOCK_LEASE` → `migration_lock_lease_secs` | `i64` (s) | duração | `600` | Não | lease do lock (heartbeat a cada lease/3) | coordinator | Java: `...migration.lock-lease` (PT10M) | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_INSTANCE_ID` | `Option<String>` | — | `None` | Não | id da instância dona do lock | coordinator | Java: `...migration.instance-id` | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_TRIGGER_ON_LOGIN` | `bool` | `false` desliga | `true` | Não | gate dispara/bloqueia login enquanto o tenant migra | `src/gate.rs` | Java: `...migration.trigger-on-login` | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_LOGIN_PATHS` | `Vec<String>` | CSV | `/auth/login` | Não | paths gateados (`starts_with` **ou** `ends_with`) | `src/gate.rs` | Java: `...migration.login-paths` | boot | idem |
| `SEEDGRID_MULTITENANCY_MIGRATION_STARTUP_ALL_TENANTS` · fallback `SEEDGRID_MULTITENANCY_MIGRATION_STARTUP_MIGRATE_ALL_TENANTS` | `bool` | só `"true"` liga | `false` | Não | startup migra todos os tenants (senão só master + lazy no login) | `src/platform.rs` (`migrate_startup`) | Java: `...migration.startup-migrate-all-tenants` | boot | idem |

### 2.5 Schedulers

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_MULTITENANCY_CLEANUP_ENABLED` → `cleanup_enabled` | `bool` | `false` desliga | `true` | Não | gate do spawn do scheduler de cleanup | `src/schedulers.rs:60` | **só no Rust** (Java: `@Scheduled` sempre ativo) | boot | `src/config.rs` |
| `SEEDGRID_MULTITENANCY_CLEANUP_NOT_VALIDATED_TTL` · fallback `SEEDGRID_MULTITENANCY_CLEAN_NOT_VALIDATED_TTL` | `i64` (s) | duração (`48H`, `PT48H`) | `172800` (48h) | Não | expira tenants não validados | `src/schedulers.rs` | Java: `...cleanup.not-validated-ttl` (48H) | boot | idem |
| `SEEDGRID_MULTITENANCY_CLEANUP_NOT_VALIDATED_CRON` · fallback `SEEDGRID_MULTITENANCY_CLEAN_NOT_VALIDATED_CRON` | `String` | cron Quartz 6 campos | `0 0 * * * ?` | Não | cron inválido → scheduler não inicia (warn) | `src/schedulers.rs` | Java: `...cleanup.not-validated-cron` | boot | idem |
| `SEEDGRID_MULTITENANCY_TRIAL_SCHEDULER_ENABLED` | `bool` | `false` desliga | `true` | Não | gate do scheduler de trial | `src/schedulers.rs:155` | só no Rust | boot | idem |
| `SEEDGRID_MULTITENANCY_TRIAL_CRON` → `trial_cron` | `String` | cron Quartz | `0 10 * * * ?` | Não | processamento de trials expirados | `src/schedulers.rs` | equivalente Java não encontrado no commit analisado | boot | idem |

### 2.6 Seams/struct do host (sem env)

| Propriedade | Padrão | Comportamento | Origem |
|---|---|---|---|
| `PlatformOverrides.password_encoder` | `SecurityBcryptPasswordEncoder` (delegando a política ao security) | encoder do signup do tenant | `src/orchestrator.rs` |
| `.business_migrator` | `None` | migrations de negócio por tenant (`TenantBusinessSchemaMigrator`) | idem |
| `.backup_domain_provider` | `EmptyDomainDatasetProvider` | datasets do backup | idem |
| `.backup_require_opt_in` | `true` | exige o opt-in `SEEDGRID_BACKUP_ENABLED` (env lida pelo crate backup) | idem |
| `.run_security_bootstrap` | `true` | bootstrap do primeiro admin no **master** | idem |
| `.billing_event_handler` / `.user_events` | `None` / no-op | eventos | idem |
| `HostOverrides` (`TenancyPlatform::assemble`) | encoder BCrypt do security, `LoggingNotificationService`, `DefaultEmailTemplateProvider`, sem migrator, sem auditor | — | `src/platform.rs` |

## 3. Propriedades de frameworks/bibliotecas

- O crate não lê `quarkus.*`. O pool **master** é aberto pelo host (`assemble_all(config, Some(master_pool), ...)`).
- Envs de módulos orquestrados (não pertencem a este crate): security (`SecurityConfig::from_env`, via `SecurityPlatform::assemble`), audit (`AuditConfig::from_env`), backup (`SEEDGRID_BACKUP_ENABLED` e demais), billing (credenciais Stripe). Ver as notas `Configuracao-Rust` de [[SeedGrid/Extensions/security/Configuracao-Rust|security]], [[SeedGrid/Extensions/audit/Configuracao-Rust|audit]], [[SeedGrid/Extensions/backup/Configuracao-Rust|backup]] e [[SeedGrid/Extensions/billing/Configuracao-Rust|billing]].

## 4. Propriedades usadas só em testes e exemplos

- `rust/examples/seedgrid-subdomain-tenancy-example` (`main.rs` e `.env.example`): `DATABASE_URL`, `TENANT_URL_PATTERN` (default do exemplo `jdbc:postgresql://localhost:5432/{tenant}`), `TENANT_DB_USER`, `TENANT_DB_PASSWORD`, `EXAMPLE_TENANT`. São lidas pelo **exemplo**, não pelo crate; o exemplo monta os serviços à mão (sem `SubdomainTenancyConfig::from_env`).
- `tests/db_it.rs` (Testcontainers) e unitários de `src/config.rs` (parse de duração e datasource).

## 5. Aliases, obsoletas, renomeações

| Primário lido | Fallback | Observação |
|---|---|---|
| `DOMAIN_SUFFIX` | `SEEDGRID_MULTITENANCY_DOMAIN_SUFFIX` | — |
| `SEEDGRID_MULTITENANCY_MIGRATION_STARTUP_ALL_TENANTS` | `..._MIGRATION_STARTUP_MIGRATE_ALL_TENANTS` | legado do crate |
| `SEEDGRID_MULTITENANCY_CLEANUP_NOT_VALIDATED_TTL` / `_CRON` | `..._CLEAN_NOT_VALIDATED_TTL` / `_CRON` | legado do crate |
| `SEEDGRID_MULTITENANCY_TENANT_URL_PATTERN` | — | legado, mas vence `TENANT_DB_URL` |

Renomeação do lado Java (não acompanhada pelo crate): `SEEDGRID_MULTITENANCY_*` → `SEEDGRID_SUBDOMAIN_TENANCY_*`.

## 6. Configuração mínima

```dotenv
DOMAIN_SUFFIX=app.example.com
PRODUCT_PREFIX=crm
SEEDGRID_MULTITENANCY_MASTER_DB_URL=jdbc:postgresql://db-host:5432/crm_master
SEEDGRID_MULTITENANCY_MASTER_DB_USERNAME=<usuario>
SEEDGRID_MULTITENANCY_MASTER_DB_PASSWORD=<SEGREDO:master-db-password>
# + chaves RSA do security (SecurityPlatform::assemble só habilita com elas)
```

## 7. Configuração completa comentada

```dotenv
# --- Resolução ---
DOMAIN_SUFFIX=app.example.com                 # vazio/ausente = tenancy OFF
PRODUCT_PREFIX=crm                             # banco do tenant = crm_<tenant>
# --- Datasources ---
SEEDGRID_MULTITENANCY_MASTER_DB_URL=jdbc:postgresql://db-host:5432/crm_master
SEEDGRID_MULTITENANCY_MASTER_DB_USERNAME=<usuario>
SEEDGRID_MULTITENANCY_MASTER_DB_PASSWORD=<SEGREDO:master-db-password>
SEEDGRID_MULTITENANCY_TENANT_DB_URL=jdbc:postgresql://db-host:5432   # /{tenant} é anexado
SEEDGRID_MULTITENANCY_TENANT_DB_USERNAME=<usuario>
SEEDGRID_MULTITENANCY_TENANT_DB_PASSWORD=<SEGREDO:tenant-db-password>
SEEDGRID_MULTITENANCY_TENANT_DB_POOL_MIN=1
SEEDGRID_MULTITENANCY_TENANT_DB_POOL_MAX=10
SEEDGRID_MULTITENANCY_TENANT_DB_MAX_ACTIVE_DATASOURCES=200
SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_ENABLED=true
SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_FAILURE_RATIO=0.5
SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_REQUEST_VOLUME_THRESHOLD=6
SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_DELAY=PT30S
SEEDGRID_MULTITENANCY_TENANT_DB_CIRCUIT_BREAKER_SUCCESS_THRESHOLD=2
# --- Signup ---
SEEDGRID_MULTITENANCY_TRIAL_DAYS=0
SEEDGRID_MULTITENANCY_OTP_EXPIRY_MINUTES=10
# --- Migração ---
SEEDGRID_MULTITENANCY_MIGRATION_ENABLED=true
SEEDGRID_MULTITENANCY_MIGRATION_TARGET_VERSION=v1
SEEDGRID_MULTITENANCY_MIGRATION_MAX_CONCURRENCY=3
SEEDGRID_MULTITENANCY_MIGRATION_LOCK_LEASE=PT10M
SEEDGRID_MULTITENANCY_MIGRATION_INSTANCE_ID=
SEEDGRID_MULTITENANCY_MIGRATION_TRIGGER_ON_LOGIN=true
SEEDGRID_MULTITENANCY_MIGRATION_LOGIN_PATHS=/auth/login
SEEDGRID_MULTITENANCY_MIGRATION_STARTUP_ALL_TENANTS=false
# --- Schedulers ---
SEEDGRID_MULTITENANCY_CLEANUP_ENABLED=true
SEEDGRID_MULTITENANCY_CLEANUP_NOT_VALIDATED_TTL=48H
SEEDGRID_MULTITENANCY_CLEANUP_NOT_VALIDATED_CRON=0 0 * * * ?
SEEDGRID_MULTITENANCY_TRIAL_SCHEDULER_ENABLED=true
SEEDGRID_MULTITENANCY_TRIAL_CRON=0 10 * * * ?
```

## 8. Receitas

- **Reaproveitar a URL do master do host:** `let mut cfg = SubdomainTenancyConfig::from_env(); cfg.apply_datasource_env(Some(&postgres_url));` — deriva `host:port` e creds do tenant quando não há `..._TENANT_DB_*` (Confirmado no doc-comment e teste `apply_datasource_env_derives_from_master_fallback_when_no_tenant_env`).
- **Login atrás de prefixo de API** (`/api/v1/public/auth/login`): `SEEDGRID_MULTITENANCY_MIGRATION_LOGIN_PATHS=/public/auth/login` funciona por causa do `ends_with`.
- **Migrar todos os tenants no boot:** `SEEDGRID_MULTITENANCY_MIGRATION_STARTUP_ALL_TENANTS=true` (exatamente `true`).
- **Desligar schedulers numa réplica:** `SEEDGRID_MULTITENANCY_CLEANUP_ENABLED=false` e `SEEDGRID_MULTITENANCY_TRIAL_SCHEDULER_ENABLED=false`.

## 9. Dúvidas e lacunas

- Nomes `SEEDGRID_SUBDOMAIN_TENANCY_*` do Java atual não lidos — **Confirmado**.
- Default diferente do Java: pool do tenant (1/10 × 0/5) — **Confirmado**.
- Sem equivalente no crate: `tenant.datasource.jdbc.idle-timeout/acquisition-timeout`, `tenant.datasource.cache.*`, `tenant-header`, `*.migrations.location.additional`, `openapi.master-only-paths`, `master/tenant.entity-packages`, `mailer.*`, `admin-user.*` (admin do master vem de `SEEDGRID_SECURITY_FIRST_ADMIN_USER_*`, ) — **Confirmado** por comparação com o `microprofile-config.properties` Java.
- `trial_days`/`trial_cron`: o Java analisado não tem mais configuração de trial (seção "Trial configuration" vazia) — **Confirmado**; se o trial foi movido ao billing no Java, o crate ainda o mantém — **Inferência**.
