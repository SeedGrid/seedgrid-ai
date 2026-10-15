---
tags: [seedgrid, extension, login-tenancy, rust]
fonte: rust/seedgrid-rust-crate-login-tenancy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# `seedgrid-rust-crate-login-tenancy` — porte Rust

Lado Java: [[SeedGrid/Extensions/login-tenancy/Visao-geral|Visão geral do login-tenancy (Quarkus)]] · [[SeedGrid/Extensions/login-tenancy/Configuracao|Configuração Java]]
Configuração deste crate: [[SeedGrid/Extensions/login-tenancy/Configuracao-Rust|Configuração Rust do login-tenancy]]

## Objetivo

Porte da extensão `seedgrid-quarkus-ext-login-tenancy` (ex-`accounttenancy`): **foundation de banco único** com tenant-por-conta (Company + usuário root por CNPJ), sem subdomínio nem tenant técnico. Oferece:

- **Signup institucional** (`/public/signup*`): pedido com código de 6 dígitos por e-mail, confirmação que cria Company + usuário root (ou vincula e-mail existente), evento `SignupConfirmedEvent`.
- **SPIs de security**: audiência JWT `platform` (empresa-plataforma) / `client` (demais) e super-leitura para membros da empresa-plataforma.
- **SPIs de audit**: isolamento de leitura por `companyPublicId` e carimbo na escrita.
- **Orquestrador `assemble_all`**: migra security → audit → login-tenancy e devolve um `Router` agregado (security + signup/status + `/audit-logs` gateado por `LOG_READ`) e a OpenAPI agregada.
- PII at-rest do `signup_request` via `CryptoProvider` global do `seedgrid-privacy` (bimodal por hash).

## Coordenadas

| Item | Valor |
|---|---|
| Diretório / pacote / lib | `rust/seedgrid-rust-crate-login-tenancy` / `seedgrid-rust-crate-login-tenancy` / `seedgrid_login_tenancy` |
| Versão | `version.workspace = true` → `2026.10.14` |
| Features | nenhuma |
| Dependências SeedGrid | `seedgrid-security`, `seedgrid-privacy`, `seedgrid-audit`, `seedgrid-resilience`, `seedgrid-billing` (`default-features = false`, só domínio/SPI) |

## API pública

| Símbolo | Papel |
|---|---|
| `LoginTenancyConfig` (+ `from_env`), `LoginTenancyFoundationConfig`, `ModuleRegistry`, `FoundationModule` | config/fachada — ver [[SeedGrid/Extensions/login-tenancy/Configuracao-Rust\|Configuração Rust]] |
| `assemble_all(Option<PgPool>, LoginTenancyPlatformOverrides)` → `AssembledLoginTenancy { security, audit, state, router, openapi }` | montagem completa single-DB; sem pool → tudo `None` e router vazio |
| `LoginTenancyState::builder(pool, foundation)` → `.cipher`, `.cipher_from_base64_key`, `.email`, `.template`, `.password_policy`, `.jwt_issuer`, `.first_admin_email`, `.signup_confirmed_handler`, `.company_public_id_resolver`, `.build()` | estado do signup |
| `router(LoginTenancyState)` | rotas abaixo |
| `migrate(&PgPool)` / `MIGRATOR` | `0700`, `0701`, `0703`; histórico `_sqlx_migrations_login_tenancy` |
| `spi_security::{LoginTenancyAllowedCompaniesResolver, LoginTenancyJwtTokenCustomizer}` (`AUDIENCE_PLATFORM`, `AUDIENCE_CLIENT`) | SPIs para o security |
| `spi_audit::{LoginTenancyAuditReadScopeProvider, CompanyAuditMetadataContributor, CachedCompanyPublicIdResolver}` | SPIs para o audit (headers `x-seedgrid-company-id` / `x-seedgrid-all-companies`) |
| `security_gate::{SecurityAuditAuthorizer, FixedAuditStateResolver, inject_trusted_company_scope_middleware}` | auth da leitura de auditoria |
| `ratelimit::signup_*_rate_limit()` | fábricas `SeedGridRateLimit` (o host aplica) |
| `openapi()` | spec utoipa |

## Endpoints (Confirmado em `src/routes.rs`)

| Método | Path | Observação |
|---|---|---|
| POST | `/public/signup` | 202; recusa CNPJ duplicado (409) |
| GET | `/public/signup/email-exists` | — |
| POST | `/public/signup/confirm-email` | cria Company + root |
| POST | `/public/signup/resend-email` | — |
| GET | `/public/signup/cnpj-status` | — |
| GET | `/public/login-tenancy/status` | `{app, activeModules, bootstrap{enabled,admin}, security{jwtIssuer, firstAdminConfigured}}`; 404 se status desligado |

Via `assemble_all` também entram as rotas do security (incl. `/me/security/users` e `/me/security/roles`, servidas pelo security) e a leitura de auditoria `/audit-logs`.

## Exemplo (Confirmado em `rust/examples/seedgrid-login-tenancy-example/src/main.rs`)

```rust
use std::sync::Arc;
use seedgrid_login_tenancy::{assemble_all, LoginTenancyPlatformOverrides};

async fn boot(pool: sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    let overrides = LoginTenancyPlatformOverrides {
        signup_confirmed: Some(Arc::new(MeuHandler)), // impl SignupConfirmedHandler
        ..Default::default()
    };
    let assembled = assemble_all(Some(pool), overrides)
        .await
        .map_err(|e| format!("assemble_all falhou: {e}"))?;
    let app = axum::Router::new().nest("/api/v1", assembled.router);
    let _ = app;
    Ok(())
}
```

(`MeuHandler` é ilustrativo; o exemplo usa `LoggingSignupConfirmed`. O exemplo serve o router sem `nest`.)

## Migrations

`0700_signup_request.sql`, `0701_privacy_search_hashes.sql`, `0703_signup_request_pending_unique_by_cnpj.sql` (não há `0702`). Rodar depois do security.

## Testes

Unitários em `src/**` (config, error, dtos, SPIs) e `tests/foundation_it.rs` (Postgres via Testcontainers). **Não executados** nesta análise.

## Notas de comportamento

- A orquestração de migrations e os serviços de lifecycle Quarkus (`AccountTenancyBootstrapService`, readiness) ficam com o host; as flags `bootstrap.*`/`modules.*` só aparecem no status.
- `assemble_all` não monta billing/apikeys/backup/filemanagement apesar das flags de módulo.
- O signup usa `PasswordPolicy` própria (não a do security).

## Enums

Equivalentes Java em [[SeedGrid/Extensions/login-tenancy/Enums|Enums (Quarkus)]].

| Enum | Arquivo | Usado em | Equivalente Java |
|---|---|---|---|
| `SignupRequestStatus` | `src/models.rs` | coluna `signup_request.status`; respostas do signup | [[SeedGrid/Extensions/login-tenancy/Enums#SignupRequestStatus\|SignupRequestStatus]] |
| `CnpjSignupStatus` | `src/dtos.rs` | `GET /public/signup/cnpj-status` | [[SeedGrid/Extensions/login-tenancy/Enums#CnpjSignupStatus\|CnpjSignupStatus]] |
| `FoundationModule` | `src/config.rs` | `ModuleRegistry`; `activeModules` do status | [[SeedGrid/Extensions/login-tenancy/Enums#FoundationModule\|FoundationModule]] |
| `StateEnum` | `src/dtos.rs` | `state` do `AddressDto` do signup | `StateEnum` da lib commons (`br.com.seedgrid.commons.core.enums`) |
| `LoginTenancyError` | `src/error.rs` | erro dos serviços, resposta RFC 7807 | exceções do Java (sem enum) |

### SignupRequestStatus

| Variante | Valor | Observação |
|---|---|---|
| `PendingEmailVerification` | `PENDING_EMAIL_VERIFICATION` | gravado no signup e no reenvio |
| `Confirmed` | `CONFIRMED` | gravado em `confirm-email` |

Serde `SCREAMING_SNAKE_CASE` (Serialize e Deserialize); `as_db_str()` / `from_db_str()`. **`from_db_str` é tolerante**: qualquer string diferente de `CONFIRMED` vira `PendingEmailVerification`. Coluna `status varchar(64) not null`, sem CHECK (`migrations/0700_signup_request.sql`). Java: mesmos 2 valores.

### CnpjSignupStatus

`Available` → `AVAILABLE`, `Registered` → `REGISTERED`, `PendingConfirmation` → `PENDING_CONFIRMATION` (serde `SCREAMING_SNAKE_CASE`, só `Serialize`; não persistido). `pendingEmailMasked` só vem em `PENDING_CONFIRMATION`. Java: mesmos 3 valores.

### FoundationModule

`Billing`, `Apikeys`, `Backup`, `Filemanagement` (ordem de `FoundationModule::ALL`). `name_lower()` devolve `billing` / `apikeys` / `backup` / `filemanagement`, usado em `activeModules`. Controlado pelas envs `SEEDGRID_LOGIN_TENANCY_MODULES_<MOD>_ENABLED` ([[SeedGrid/Extensions/login-tenancy/Configuracao-Rust|Configuração Rust]]). Não é serializado nem persistido. Java: `BILLING`, `APIKEYS`, `BACKUP`, `FILEMANAGEMENT`, os mesmos 4 valores.

### StateEnum

27 UFs na ordem do Java (`AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO`); as variantes Rust são `Ac`, `Al`, ... Serializa como **sigla**; desserializa sigla (sem diferenciar caixa) **ou nome completo** do estado (`from_json`). Valor inválido gera erro de bind, respondido como 400 `Dados invalidos`. `signup.rs` grava `sigla()` em `addr_state`. Mesmo conjunto e ordem do `StateEnum` Java.

### LoginTenancyError

| Variante | HTTP |
|---|---|
| `CompanyAlreadyExists`, `SignupRequestPending` | 409 |
| `SignupRequestNotFound` | 404 |
| `BadRequest` | 400 |
| `RequiredRoleMissing`, `TemplateProcessing`, `Crypto`, `Database`, `Internal` | 500 |

`type` e `title` do corpo seguem o `ProblemType` do Java (`src/error.rs`).
