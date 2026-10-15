---
tags: [seedgrid, extension, security, rust]
fonte: rust/seedgrid-rust-crate-security
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# `seedgrid-security` — porte Rust

Lado Java: [[SeedGrid/Extensions/security/Visao-geral|Visão geral do security (Quarkus)]] · [[SeedGrid/Extensions/security/Configuracao|Configuração Java]]
Configuração deste crate: [[SeedGrid/Extensions/security/Configuracao-Rust|Configuração Rust do security]]

## Objetivo

Porte em Rust da extensão `seedgrid-quarkus-ext-security`, distribuído como **crate biblioteca** (Axum 0.8 + sqlx/Postgres). O host constrói um `SecurityState` e monta o `router` no servidor Axum dele. Funcionalidades (Confirmado em `src/lib.rs`, `README.md`, `src/routes.rs`):

- Autenticação **JWT RS256** (claims `sub/upn/userName/whatsapp/groups/allowedCompanies/companyId/companyRoot/allCompanies` + claims via SPI).
- **Refresh tokens** rotativos com *family*, detecção de reuso e janela de graça para rotação concorrente.
- Senha **BCrypt** sobre `publicId + senha` (emite `$2a$10$`, compatível com o jBCrypt do Java).
- **RBAC** (roles + permissões com `audience`/`is_default`), empresas, memberships por conta (`is_root`, roles por conta, desativação por conta), gestão pela plataforma e pela própria conta (`/me/security/*`).
- **2FA** TOTP / e-mail / WhatsApp + backup codes; segredo TOTP cifrado (AES-256-GCM).
- **Self-enter** (auto-registro com OTP + aprovação, convites).
- **Avatar** via crate `seedgrid-filemanagement`; **auditoria** via `seedgrid-audit`; **rate limit** via `seedgrid-resilience` + `seedgrid-cache`; **PII at-rest** via `seedgrid-privacy`; SMTP real via `lettre`.
- Erros RFC 7807 (`application/problem+json`); OpenAPI própria via `utoipa` (`seedgrid_security::openapi()`).

## Coordenadas

| Item | Valor |
|---|---|
| Diretório | `rust/seedgrid-rust-crate-security` |
| Pacote Cargo / lib | `seedgrid-security` / `seedgrid_security` |
| Versão | `version.workspace = true` → `2026.10.14` (`rust/Cargo.toml`, `[workspace.package]`). |
| Edição / MSRV | `edition = "2021"`, `rust-version = "1.82"` |
| Licença declarada | `LicenseRef-Commercial` |
| Features Cargo | nenhuma |
| Dependências SeedGrid | `seedgrid-rust-crate-filemanagent` (como `seedgrid-filemanagement`), `-audit`, `-resilience`, `-cache`, `-whatsapp`, `-privacy` (path deps). Reexporta `seedgrid_audit`, `seedgrid_cache`, `seedgrid_resilience`, `seedgrid_whatsapp`. |

## API pública (principais símbolos)

| Símbolo | Papel |
|---|---|
| `SecurityConfig` (+ `from_env`, `new`) | configuração agregada — ver [[SeedGrid/Extensions/security/Configuracao-Rust\|Configuração Rust]] |
| `migrate(&PgPool)` / `MIGRATOR` | aplica `migrations/0199..0230` em tabela de histórico própria `_sqlx_migrations_security` (`src/migrations.rs`) |
| `SecurityState::builder(pool, config)` → `SecurityStateBuilder` | seams: `.email`, `.whatsapp`, `.storage`, `.scope_resolver`, `.jwt_customizer`, `.jwt_validator`, `.login_scope_resolver`, `.allowed_companies`, `.user_quota_validator`, `.user_additional_fields_validator`, `.auditor`, `.cache`, `.template_provider`, `.two_factor_template_provider`, `.pool_resolver`, `.account_user_activation_mailer`; `.build()` |
| `router(SecurityState)` | `axum::Router` com todas as rotas abaixo |
| `bootstrap(&SecurityState)` | garante a empresa-plataforma e o primeiro admin |
| `cleanup_entry_requests` / `spawn_entry_request_cleanup(state, interval)` | limpeza de pedidos de self-enter (job tokio) |
| `SecurityPlatform::assemble(Option<&PgPool>, SecurityOverrides)` | "autostart" estilo Quarkus: habilita só com Postgres **e** chaves RSA; roda `migrate`, `build` e (opcional) `bootstrap`; retorna `Ok(None)` se desabilitado |
| `SmtpEmailService`, `DefaultTemplateSecurityProvider`, `DefaultTwoFactorEmailTemplateProvider`, `TemplateSecurityProvider`, `TwoFactorEmailTemplateProvider` | e-mail e templates |
| `spi::*` | `PoolResolver`, `AllowedCompaniesResolver`, `LoginScopeResolver`, `UserQuotaValidator`, `UserAdditionalFieldsValidator`, `JwtTokenCustomizer`, `JwtTokenValidator`, `ScopeResolver`, `EmailService`, `WhatsappSender`, `AvatarStorage` (todos com default embutido) |
| `services::users`, `services::rbac`, `services::company_users`, `services::company_roles`... | serviços reutilizados pelos crates de tenancy/apikeys (ex.: `users::create_user_with_options`, `rbac::resolve_for_company`, `rbac::require_platform_scope`) |

## Endpoints (Confirmado em `src/routes.rs`)

| Grupo | Método + path |
|---|---|
| Auth pública | `POST /public/auth/login`, `POST /public/auth/refresh`, `GET /public/auth/confirm-email`, `POST /public/auth/forgot-password`, `GET /public/auth/reset-password` |
| 2FA pública | `POST /public/2f/verify`, `POST /public/2f/resend` |
| Self-enter público | `POST /public/self-enter/requests`, `POST /public/self-enter/requests/{id}/confirm-email`, `POST /public/self-enter/requests/{id}/resend-email`, `GET /public/self-enter/invitations/{token}`, `POST /public/self-enter/invitations/{token}/complete` |
| Outras públicas | `GET /public/companies` |
| Usuário logado | `GET /me/permissions`, `GET /me/companies`, `POST /me/select-company`, `GET\|PUT /me/profile`, `PUT /me/profile/password`, `POST\|GET\|DELETE /me/profile/avatar` |
| Gestão pela conta | `GET\|POST /me/security/roles`, `GET /me/security/roles/permissions`, `GET\|PUT\|DELETE /me/security/roles/{id}`, `GET\|POST /me/security/users`, `GET\|PUT\|DELETE /me/security/users/{id}`, `POST /me/security/users/{id}/resend-activation` |
| Usuários (plataforma) | `GET\|POST /users`, `GET\|PATCH\|DELETE /users/{public_id}`, `POST /users/avatars/defaults`, `POST\|GET\|DELETE /users/{public_id}/avatar`, `PUT /users/change-password`, `PUT /users/{public_id}/memberships`, `PUT\|DELETE /users/{public_id}/memberships/{company_public_id}` |
| Roles / permissões | `GET\|POST /roles`, `GET /roles/integration`, `GET\|PATCH\|DELETE /roles/{public_id}`, `GET /permissions`, `GET /permissions/{public_id}` |
| Empresas | `GET\|POST /companies`, `GET\|PATCH\|DELETE /companies/{public_id}` |
| 2FA autenticado | `POST /2f/setup`, `/2f/confirm`, `/2f/disable`, `/2f/backup-codes`, `/2f/enable`, `/2f/setup/confirm`, `/2f/totp/confirm`; `GET /2f/status` |
| Self-enter admin | `GET /self-enter/requests/to-approve`, `GET\|POST /self-enter/invitations`, `POST /self-enter/invitations/{id}/resend`, `POST /self-enter/requests/{id}/approve`, `POST /self-enter/requests/{id}/reject` |

Rotas de plataforma (`/users`, `/roles`, `/permissions`, `/companies`) exigem, além da permissão, root global ou membro ativo da empresa-plataforma (`rbac::require_platform_scope`). Rotas `/self-enter*` respondem 404 antes da autenticação quando o self-enter está desligado. Rotas públicas têm rate limit por IP (`src/ratelimit.rs`).

## Exemplos

Uso básico (Confirmado em `src/lib.rs` doc-test e `README.md`):

```rust
use seedgrid_security::{router, SecurityConfig, SecurityState};

async fn boot(pool: sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    let config = SecurityConfig::from_env()?;
    seedgrid_security::migrate(&pool).await?;
    let state = SecurityState::builder(pool, config).build()?;
    let app = axum::Router::new().merge(router(state));
    let _ = app;
    Ok(())
}
```

Montagem "estilo Quarkus" (Confirmado em `src/platform.rs`):

```rust
use seedgrid_security::{SecurityOverrides, SecurityPlatform};

async fn boot(pool: Option<sqlx::PgPool>) -> Result<(), String> {
    if let Some(state) = SecurityPlatform::assemble(pool.as_ref(), SecurityOverrides::enabled()).await? {
        let app = axum::Router::new().merge(seedgrid_security::router(state));
        let _ = app;
    }
    Ok(())
}
```

> `SecurityOverrides::default()` deixa `run_bootstrap = false` (derive `Default`); `SecurityOverrides::enabled()` liga o bootstrap.

Validador de `additionalAttributes` e override de templates: ver `README.md` do crate (`UserAdditionalFieldsValidator`, `DefaultTemplateSecurityProvider::with_host_dir`).

Exemplo executável: `rust/examples/seedgrid-security-apikeys-example/src/main.rs` (security + apikeys; migra security antes de apikeys, `from_env`, `bootstrap`, merge dos routers e middleware `api_key_auth`).

## Migrations

`migrations/0199_enable_extensions.sql` a `0230_user_company_active.sql` (32 arquivos), porte das V200..V233 do Flyway Java. Tabela de histórico isolada `_sqlx_migrations_security`. Precisam rodar **antes** das de apikeys/login-tenancy/backup (dependência de dados: `users`, `roles`, `permissions`, `companies`).

## Testes

- Unitários em `src/**` (`cargo test --lib`), ex.: `config::tests` (durações, base64 DER→PEM, bool).
- Integração em `tests/` com Postgres real via Testcontainers: `integration.rs`, `rate_limit.rs`, `email_templates.rs` e ~30 arquivos `java_parity_*.rs` (port dos testes Java: auth, refresh grace window, 2FA, self-enter, RBAC, memberships, cripto de campos, bootstrap do primeiro admin, gestão de conta/plataforma etc.).
- **Não executados** nesta análise.

## Limitações conhecidas

- Sem cache RBAC (resolução direta no banco).
- Status HTTP 422 do módulo Java viram 400 em várias regras.
- Política de senha com defaults mais rígidos que o módulo Java.
- Backend de storage do avatar é seam do host (não lido de config).
- Tolerância TOTP fixa em ±1 janela (sem config); nomes JWT `SEEDGRID_SECURITY_JWT_ISSUER/KID/TTL` não lidos — ver [[SeedGrid/Extensions/security/Configuracao-Rust|Configuração Rust]] §9.
- `is_effective_root` segue modelo de união (Java: override).
- Self-enter: `default_role` é obrigatória com self-enter ligado (`from_env` falha sem ela); se a role não existe, a aprovação é recusada antes de criar o usuário, como no Java — ver [[SeedGrid/Extensions/security/Configuracao-Rust|Configuração Rust]] §2.7.

## Enums

Enums públicos do crate (`rust/seedgrid-rust-crate-security/src`). Equivalentes Java em [[SeedGrid/Extensions/security/Enums|Enums (Quarkus)]].

| Enum | Arquivo | Usado em | Equivalente Java |
|---|---|---|---|
| `EntryRequestStatus` | `models/entry_request.rs` | coluna `entry_requests.status`; fluxo de self-enter | [[SeedGrid/Extensions/security/Enums#EntryRequestStatus\|EntryRequestStatus]] |
| `EntryRequestOrigin` | `models/entry_request.rs` | coluna `entry_requests.origin` | [[SeedGrid/Extensions/security/Enums#EntryRequestOrigin\|EntryRequestOrigin]] |
| `CredentialDelivery` | `services/users.rs` | `UserCreateOptions.delivery` (API de serviço para o host) | [[SeedGrid/Extensions/security/Enums#Delivery\|Delivery]] |
| `SecurityError` | `error.rs` | erro de serviços/handlers; corpo RFC 7807 | exceções do Java (sem enum equivalente) |
| `TemplateError` | `templates.rs` | retorno de `TemplateSecurityProvider` | `TemplateNotFoundException` / `TemplateCantLoadException` |

### EntryRequestStatus

Estado do pedido de self-enter. Coluna `status VARCHAR(30)` com `CHECK chk_entry_request_status` (`migrations/0201_create_entry_requests_table.sql`) que aceita exatamente os 5 valores abaixo.

| Variante | Valor | Onde é tratado |
|---|---|---|
| `PendingEmail` | `PENDING_EMAIL` | estado inicial do pedido público e do convite (`services/selfenter.rs`); expira por `expires_at` |
| `PendingApproval` | `PENDING_APPROVAL` | depois de confirmar o OTP de e-mail; só nesse estado a aprovação é aceita (senão erro `INVALID_STATUS`) |
| `Approved` | `APPROVED` | a aprovação cria o usuário e grava `approved_at`/`approved_by` |
| `Rejected` | `REJECTED` | a rejeição grava `rejected_at`/`rejected_by` |
| `Expired` | `EXPIRED` | o job de limpeza marca pendentes vencidos; depois de `purge_after` o registro é purgado junto com APPROVED/REJECTED |

- Serde: `rename_all = "SCREAMING_SNAKE_CASE"` (apenas `Serialize`). Conversões: `as_str()` e `parse(&str) -> Option<Self>` (sensível a caixa). A struct `EntryRequest` guarda `status` como `String` e as queries comparam literais SQL.
- Java: mesmos 5 valores na mesma ordem. Igual (Confirmado).

### EntryRequestOrigin

| Variante | Valor | Onde é tratado |
|---|---|---|
| `Public` | `PUBLIC` | pedido do link público; default da coluna `origin` |
| `Invite` | `INVITE` | convite criado por admin; as consultas de convites filtram `origin = 'INVITE'` |

- Coluna `origin VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'` (migration `0217`), sem CHECK. Serde `rename_all = "UPPERCASE"`; `as_str()` / `parse()`.
- Java: `PUBLIC`, `INVITE`: idêntico.

### CredentialDelivery

Enum com dados, não serializável: `SecurityWelcomeEmail` (e-mail de boas-vindas do security), `None` (nada é enviado; exige senha informada) e `Callback { mailer: Arc<dyn ActivationMailer>, best_effort: bool }` (envio do host; `best_effort` faz a falha só logar). No Java, `Delivery` tem `SECURITY_WELCOME_EMAIL`, `NONE`, `CALLBACK`, e o mailer e o best-effort são campos separados do record `UserCreateOptions`. Mesmos 3 casos; muda só o formato.

### SecurityError

Cada variante tem status HTTP e `code` estável no corpo `application/problem+json` (`error.rs`).

| Variante | HTTP | `code` |
|---|---|---|
| `InvalidCredentials` | 401 | `INVALID_CREDENTIALS` |
| `Unauthorized` | 401 | `UNAUTHORIZED` |
| `TokenValidation` | 401 | `TOKEN_VALIDATION` |
| `Forbidden` | 403 | `FORBIDDEN` |
| `NotFound` | 404 | o `code` informado |
| `Conflict` | 409 | o `code` informado |
| `Validation` | 400 | `VALIDATION_ERROR` (com `violations`) |
| `BadRequest` | 400 | o `code` informado (ex.: `INVALID_USER_ADDITIONAL_ATTRIBUTES`) |
| `TwoFactorRequired` | 202 | `TWO_FACTOR_REQUIRED` (com `session_token` e `primary_method`) |
| `Database` | 500 | `DATABASE_ERROR` |
| `Internal` | 500 | `INTERNAL_ERROR` |

Convenção do crate: regras que o Java responde 422 viram 400.

### TemplateError

`NotFound(String)` e `CantLoad(String)`. O provider default só os usa internamente (cai para o template embutido); ficam expostos para providers do host.

### Métodos de 2FA (sem enum)

O Java tem `TwoFactorMethodType` (`EMAIL`, `WHATSAPP`, `TOTP`, `BACKUP_CODE`, com `fromCode` sem diferenciar caixa). O Rust **não tem enum**: o método é `String` em `users.two_factor_primary_method` e em `two_factor.allowed_methods` / `default_method`. Valores executáveis: `SUPPORTED_METHODS = ["TOTP","EMAIL","WHATSAPP"]` (`services/twofactor.rs`); os itens de `allowed_methods` são aparados e passados para maiúsculas, mas o que estiver fora dessa lista nunca é oferecido. `BACKUP_CODE` não é um método no Rust: o código de backup é um campo à parte (`backupCode`) verificado por `consume_backup_code`. Ver [[SeedGrid/Extensions/security/Enums#TwoFactorMethodType|TwoFactorMethodType]].

### Internos

| Enum | Arquivo |
|---|---|
| `UsersListResponse`, `RolesListResponse`, `EntryListResponse` (respostas lista simples ou página) | `routes.rs` |
| `PlatformRolesTarget` | `services/users.rs` |
