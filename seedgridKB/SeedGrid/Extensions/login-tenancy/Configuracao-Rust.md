---
tags: [seedgrid, extension, login-tenancy, rust, configuracao]
fonte: rust/seedgrid-rust-crate-login-tenancy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# Configuração Rust — `seedgrid-rust-crate-login-tenancy`

Volta para: [[SeedGrid/Extensions/login-tenancy/Rust|Porte Rust do login-tenancy]] · Java: [[SeedGrid/Extensions/login-tenancy/Configuracao|Configuração do login-tenancy (Quarkus)]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Struct | `LoginTenancyConfig` (`app`, `foundation`, `bootstrap`, `modules`), todas com `Default`; fachada `LoginTenancyFoundationConfig`; registry `ModuleRegistry` — `src/config.rs` |
| Prefixo lógico | `seedgrid.login-tenancy` (porte de `@ConfigMapping(prefix = "seedgrid.login-tenancy")`, `LoginTenancyConfig.java`) |
| Mecanismo | `LoginTenancyConfig::from_env()` com `std::env::var("SEEDGRID_LOGIN_TENANCY_*")`; booleans via closure `flag`: `true` (sem caixa) → `true`, **qualquer outro valor → `false`**, ausente → default |
| Leitura | boot — o host chama `from_env()` e passa a `LoginTenancyState::builder(pool, LoginTenancyFoundationConfig::new(cfg))`; ou `orchestrator::assemble_all` faz isso |
| Leituras fora do `from_env` | `src/error.rs` lê `SEEDGRID_SHOW_DEV_MESSAGE` **a cada resposta de erro**; `src/orchestrator.rs` (`assemble_all`) lê `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ`, `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` e testa a existência de `SEEDGRID_SECURITY_ACCOUNT_ASSIGNABLE_PERMISSION_AUDIENCES`; chama também `SecurityConfig::from_env()` e `AuditConfig::from_env()` |
| Regra fechada | não existe `seedgrid.login-tenancy.enabled`; a dependência presente ativa o baseline (comentário de `src/config.rs`) |
| Features Cargo | nenhuma (depende de `seedgrid-billing` com `default-features = false`) |
| Origem | caminhos relativos a `rust/seedgrid-rust-crate-login-tenancy/` |

## 2. Propriedades do crate

### 2.1 Aplicação

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_LOGIN_TENANCY_APP_CODE` → `app.code` | `String` | qualquer (sem trim) | `seedgrid-app` | Não | código da aplicação | `GET /public/login-tenancy/status` (`app.code`) | Java: `seedgrid.login-tenancy.app.code` | boot | `src/config.rs` → `from_env`; consumo `src/routes.rs` → `status_handler` |
| `SEEDGRID_LOGIN_TENANCY_APP_NAME` → `app.name` | `String` | qualquer | `SeedGrid Application` | Não | nome de exibição | status endpoint; e-mail de confirmação do signup (`appName`) | Java: `...app.name` | boot | idem; `src/signup.rs:445` |

### 2.2 Superfície técnica e bootstrap

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_LOGIN_TENANCY_FOUNDATION_STATUS_ENABLED` → `foundation.status_enabled` | `bool` | `true`/outro | `true` | Não | `false` → `GET /public/login-tenancy/status` responde 404 | `src/routes.rs` → `status_handler` | Java: `...foundation.status.enabled` | boot | `src/config.rs` |
| `SEEDGRID_LOGIN_TENANCY_BOOTSTRAP_ENABLED` → `bootstrap.enabled` | `bool` | idem | `true` | Não | só reportado no status (`bootstrap.enabled`); **não** controla o bootstrap do security (que é `LoginTenancyPlatformOverrides.run_security_bootstrap`) | status endpoint | Java: `...bootstrap.enabled` | boot | idem |
| `SEEDGRID_LOGIN_TENANCY_BOOTSTRAP_ADMIN_ENABLED` → `bootstrap.admin_enabled` | `bool` | idem | `true` | Não | `admin_bootstrap_enabled()` = `bootstrap.enabled && admin_enabled`; só reportado no status | status endpoint | Java: `...bootstrap.admin.enabled` | boot | idem |

### 2.3 Módulos de foundation

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_LOGIN_TENANCY_MODULES_BILLING_ENABLED` | `bool` | `true`/outro | `true` | Não | ativação lógica; aparece em `activeModules` do status | `ModuleRegistry::active_modules` → status | Java: `...modules.billing.enabled` | boot | `src/config.rs` |
| `SEEDGRID_LOGIN_TENANCY_MODULES_APIKEYS_ENABLED` | `bool` | idem | `true` | Não | idem | idem | Java: `...modules.apikeys.enabled` | boot | idem |
| `SEEDGRID_LOGIN_TENANCY_MODULES_BACKUP_ENABLED` | `bool` | idem | `true` | Não | idem | idem | Java: `...modules.backup.enabled` | boot | idem |
| `SEEDGRID_LOGIN_TENANCY_MODULES_FILEMANAGEMENT_ENABLED` | `bool` | idem | `true` | Não | idem | idem | Java: `...modules.filemanagement.enabled` | boot | idem |

As flags de módulo **não** ligam/desligam nada além do relatório: `assemble_all` não monta billing/apikeys/backup/filemanagement (Confirmado em `src/orchestrator.rs`).

### 2.4 Erros e leituras cruzadas

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SHOW_DEV_MESSAGE` | `bool` | `true` (sem caixa) liga | `false` | Não | inclui `devMessage` (mensagem da exceção) no corpo RFC 7807 | `src/error.rs` → `show_dev_message_enabled` / `ProblemJson` | Java: `seedgrid.show-dev-message` (env por regra MicroProfile; Confirmado no comentário) | por request | `src/error.rs` |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` (lida aqui) | `String` | CNPJ (só dígitos são mantidos) | — | Condicional: sem ela o `assemble_all` não registra `LoginTenancyAllowedCompaniesResolver` nem `LoginTenancyJwtTokenCustomizer` (audiência `platform`/`client`) e loga warn | super-leitura + audiência JWT | `src/orchestrator.rs` → `assemble_all` | propriedade do security: [[SeedGrid/Extensions/security/Configuracao-Rust\|config Rust do security]] | boot (`assemble_all`) | `src/orchestrator.rs` |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` (lida aqui) | `String` | e-mail | — | Não | alimenta `firstAdminConfigured` do status | `LoginTenancyStateBuilder::first_admin_email` | idem (security) | boot (`assemble_all`) | `src/orchestrator.rs` |
| `SEEDGRID_SECURITY_ACCOUNT_ASSIGNABLE_PERMISSION_AUDIENCES` (existência testada) | — | — | se **ausente**, `assemble_all` força `["client"]` | Não | default do login-tenancy para audiences atribuíveis pela conta | `src/orchestrator.rs` (`std::env::var_os(...).is_none()`) | propriedade do security | boot | `src/orchestrator.rs` |

### 2.5 Seams/struct do host (sem env)

| Propriedade | Tipo | Padrão | Comportamento | Origem |
|---|---|---|---|---|
| `LoginTenancyPlatformOverrides.email` | `Option<Arc<dyn EmailService>>` | `LoggingEmailService` do security (só loga) | transporte do e-mail de signup | `src/orchestrator.rs` |
| `.template` | `Option<Arc<dyn LoginTenancyTemplateProvider>>` | `DefaultLoginTenancyTemplateProvider` | template do e-mail | idem |
| `.signup_confirmed` | `Option<Arc<dyn SignupConfirmedHandler>>` | `None` | pós-processamento de domínio | idem |
| `.password_policy` | `Option<PasswordPolicy>` | `PasswordPolicy::default()` = `min_length 8`, `require_upper/lower/special = false` | política de senha do signup — **independente** da política do security (`SECURITY_PASSWORD_*` não se aplica aqui) | `src/state.rs` |
| `.run_security_bootstrap` | `bool` | `true` | roda `seedgrid_security::bootstrap` | `src/orchestrator.rs` |

## 3. Propriedades de frameworks/bibliotecas

- O `assemble_all` delega ao security (`SecurityConfig::from_env()`, chaves RSA obrigatórias para habilitar) e ao audit (`AuditConfig::from_env()`; auditoria só com `enabled` + estratégia JPA). Ver [[SeedGrid/Extensions/security/Configuracao-Rust|security]] e [[SeedGrid/Extensions/audit/Configuracao-Rust|audit]].
- Rate limits do signup: `config_key` `signup` (10/min), `signup-email-exists` (10/min), `signup-confirm-email` (10/min), `signup-resend-email` (5/h) (`src/ratelimit.rs`). As fábricas existem, mas o `router` do crate **não** aplica a camada — fica com o host (comentário de `src/routes.rs`). O kill-switch citado `seedgrid.ratelimit.<config_key>.enabled` depende do `ConfigSource` que o host der ao `RateLimitService` (crate resilience).

## 4. Propriedades usadas só em testes e exemplos

- `rust/examples/seedgrid-login-tenancy-example`: `DATABASE_URL`, `BIND_ADDR` (lidas no `main.rs`) e, no `.env.example`, envs do security (`SECURITY_JWT_ISSUER`, `SECURITY_JWT_TTL_SECONDS`, `SECURITY_ENCRYPTION_KEY`, `SECURITY_FRONTEND_BASE_URL`, `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ`, `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL`).
- `tests/foundation_it.rs` (Testcontainers) e testes unitários de `src/error.rs` que alteram `SEEDGRID_SHOW_DEV_MESSAGE`.

## 5. Aliases, obsoletas, renomeações

Sem aliases. Nomes `SEEDGRID_LOGIN_TENANCY_*` = regra MicroProfile das propriedades Java. O status endpoint legado `/public/accounttenancy/status` foi removido.

## 6. Configuração mínima

Nenhuma env do próprio crate é obrigatória. Para a foundation funcionar via `assemble_all`: chaves RSA do security e, recomendado, `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` (+ corporate/trade name).

```dotenv
SEEDGRID_SECURITY_JWT_PRIVATE_KEY_LOCATION=./keys/private.pem
SEEDGRID_SECURITY_JWT_PUBLIC_KEY_LOCATION=./keys/public.pem
SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ=<cnpj-da-plataforma>
SEEDGRID_SECURITY_DEFAULT_COMPANY_CORPORATE_NAME=<razao-social>
SEEDGRID_SECURITY_DEFAULT_COMPANY_TRADE_NAME=<nome-fantasia>
```

## 7. Configuração completa comentada

```dotenv
SEEDGRID_LOGIN_TENANCY_APP_CODE=seedgrid-app
SEEDGRID_LOGIN_TENANCY_APP_NAME=SeedGrid Application     # aparece no e-mail de confirmação
SEEDGRID_LOGIN_TENANCY_FOUNDATION_STATUS_ENABLED=true     # false -> status 404
SEEDGRID_LOGIN_TENANCY_BOOTSTRAP_ENABLED=true             # só reportado no status
SEEDGRID_LOGIN_TENANCY_BOOTSTRAP_ADMIN_ENABLED=true       # só reportado no status
SEEDGRID_LOGIN_TENANCY_MODULES_BILLING_ENABLED=true
SEEDGRID_LOGIN_TENANCY_MODULES_APIKEYS_ENABLED=true
SEEDGRID_LOGIN_TENANCY_MODULES_BACKUP_ENABLED=true
SEEDGRID_LOGIN_TENANCY_MODULES_FILEMANAGEMENT_ENABLED=true
SEEDGRID_SHOW_DEV_MESSAGE=false                           # true só em dev
```

## 8. Receitas

- **Esconder o status:** `SEEDGRID_LOGIN_TENANCY_FOUNDATION_STATUS_ENABLED=false`.
- **Audiência `platform`/`client` no JWT:** defina `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` antes de chamar `assemble_all`.
- **Política de senha do signup igual à do security:** passe `LoginTenancyPlatformOverrides { password_policy: Some(PasswordPolicy { .. }), .. }` — não é derivada das envs `SECURITY_PASSWORD_*`.

## 9. Dúvidas e lacunas

- `bootstrap.*` e `modules.*` só afetam o corpo do status endpoint — **Confirmado** por grep.
- Flags booleanas aceitam só `true` (case-insensitive); `1`/`yes` viram `false` — **Confirmado**.
- A `PasswordPolicy` do signup não aplica `prohibit_repeated_sequence` nem histórico (o Java usa `passwordService.validate`) — **Inferência** a partir de `PasswordPolicy` (4 campos) em `src/state.rs`.
