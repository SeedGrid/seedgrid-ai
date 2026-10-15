---
tags: [seedgrid, extension, apikeys, rust]
fonte: rust/seedgrid-rust-crate-apikeys
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# `seedgrid-rust-crate-apikeys` — porte Rust

Lado Java: [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral do apikeys (Quarkus)]] · [[SeedGrid/Extensions/apikeys/Configuracao|Configuração Java]]
Configuração deste crate: [[SeedGrid/Extensions/apikeys/Configuracao-Rust|Configuração Rust do apikeys]]

## Objetivo

Porte da extensão `seedgrid-quarkus-ext-apikeys`: geração, autenticação e gestão de **API keys** `sgkey_...`, com permissões derivadas da role (habilitada para integração). Crate biblioteca: o host constrói um `ApiKeyState`, monta o `router` e instala o middleware `extract::api_key_auth`. A paridade com o Java é essencialmente 1:1.

## Coordenadas

| Item | Valor |
|---|---|
| Diretório / pacote / lib | `rust/seedgrid-rust-crate-apikeys` / `seedgrid-rust-crate-apikeys` / `seedgrid_apikeys` |
| Versão | `version.workspace = true` → `2026.10.14` |
| Edição / MSRV / licença | 2021 / 1.82 / `LicenseRef-Commercial` |
| Features | nenhuma |
| Dependência SeedGrid | `seedgrid-security` (bcrypt `hash_secret`/`verify_secret`, models e schema) |

## Formato da chave (Confirmado em `src/generator.rs` e README)

```
raw_api_key = "sgkey_" + randomPart
randomPart  = Base64 URL-safe sem padding de key_bytes bytes (OsRng)
prefix      = primeiros prefix_length chars de randomPart (sem "sgkey_")
key_hash    = bcrypt(raw_api_key)   # cobre a chave inteira, inclusive "sgkey_"
masked      = prefix + "..."
```

A chave crua só é devolvida na criação. Geração tenta 5 vezes contra colisão de prefixo.

## API pública

| Símbolo | Papel |
|---|---|
| `ApiKeysConfig` (+ `from_env`) | ver [[SeedGrid/Extensions/apikeys/Configuracao-Rust\|Configuração Rust]] |
| `ApiKeyState::builder(pool, config)` → `.policy(...)`, `.security(SecurityState)`, `.build()`; também `from_parts`, `from_parts_with_security` | estado do módulo |
| `router(ApiKeyState)` | rotas REST |
| `extract::api_key_auth` | middleware: lê `x-api-key` (trim) ou `Authorization: Bearer sgkey_...`; IP por `X-Forwarded-For` → `X-Real-IP`; injeta `ApiKeyIdentity` e registra uso (best-effort) |
| `ApiKeyAuthService`, `ApiKeyManagementService`, `ApiKeyIntrospectionService`, `ApiKeyUsageService` | serviços |
| `ApiKeyGenerator`, `ApiKeyIdentity`/`HumanIdentity`/`ManagementIdentity`/`to_identity` | geração e identidade |
| `ApiKeyActivationPolicy` / `DefaultApiKeyActivationPolicy` | SPI de ativação (auth/gestão) |
| `migrate(&PgPool)` / `MIGRATOR` | migrations `0600..0603`, histórico próprio `_sqlx_migrations_apikeys` |
| `openapi()` | spec utoipa |

Ordem de decisão da autenticação: prefixo inválido / não encontrado / hash errado → silencioso (`Ok(None)`); revogada → 401; expirada → 401; sucesso → principal com permissões da role.

## Endpoints (Confirmado em `src/routes.rs`)

| Método | Path | Permissão |
|---|---|---|
| POST | `/apikeys/role/{roleName}` | `APIKEY_CREATE` (201, única resposta com a chave crua) |
| GET | `/apikeys/role/{roleName}` | `APIKEY_READ` |
| GET | `/apikeys?page&size` | `APIKEY_READ` (lista simples ou paginada) |
| POST | `/apikeys/{publicId}/revoke` | `APIKEY_REVOKE` |
| GET | `/apikeys/me` | só autenticação por API key (introspecção; sem permissão, fora do toggle de gestão, não devolve e-mail do dono) |

## Exemplo (Confirmado em `src/lib.rs` e README)

```rust
use seedgrid_apikeys::{router, ApiKeysConfig, ApiKeyState};
use seedgrid_apikeys::extract::api_key_auth;

async fn boot(pool: sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
    seedgrid_security::migrate(&pool).await?;   // primeiro (dependência de dados)
    seedgrid_apikeys::migrate(&pool).await?;
    let state = ApiKeyState::builder(pool, ApiKeysConfig::from_env()).build();
    let app = axum::Router::new()
        .merge(router(state.clone()))
        .layer(axum::middleware::from_fn_with_state(state, api_key_auth));
    let _ = app;
    Ok(())
}
```

Exemplo executável: `rust/examples/seedgrid-security-apikeys-example`.

## Migrations

`0600_create_apikeys_table.sql`, `0601_add_user_snapshot_fields.sql`, `0602_add_permissions.sql` (semeia `APIKEY_CREATE/READ/REVOKE` e vincula à role `ADMIN`, com `ON CONFLICT` extra em relação ao Java), `0603_add_active_to_api_keys_table.sql`. Rodar **depois** de `seedgrid_security::migrate`.

> O código usa tabela de histórico própria `_sqlx_migrations_apikeys` (`src/migrations.rs`, `HISTORY_TABLE`). A ordem continua necessária pela dependência de dados.

## Testes

`tests/auth_ordering.rs`, `tests/human_auth_management.rs`, `tests/introspection.rs` (sem banco) e `tests/db_flow.rs` (`#[ignore]`, Testcontainers). **Não executados** nesta análise.

## Notas de comportamento

- Datas serializadas como `NaiveDateTime` (sem `Z`), não `Instant` como no Java.
- O registro de uso da chave é best-effort (não bloqueia a requisição).
- `@ApiKeyAllowed` e `ApiKeySecurityContext` (JAX-RS) não existem; use `ApiKeyIdentity`.

## Enums

Equivalentes Java em [[SeedGrid/Extensions/apikeys/Enums|Enums (Quarkus)]].

| Enum | Arquivo | Usado em | Equivalente Java |
|---|---|---|---|
| `ApiKeyAuthType` | `src/models.rs` | `ApiKeyPrincipal`; atributo `apikey.authType` da identity | [[SeedGrid/Extensions/apikeys/Enums#ApiKeyAuthType\|ApiKeyAuthType]] |
| `ApiKeyError` | `src/error.rs` | erro de serviços/handlers, resposta RFC 7807 | exceções `ApiKey*Exception` (sem enum) |
| `ManagementIdentity` | `src/identity.rs` | credencial aceita pelas rotas de gestão | sem equivalente (específico do Rust) |

### ApiKeyAuthType

| Variante | `name()` | Observação |
|---|---|---|
| `ApiKey` | `API_KEY` | única variante; é o valor do atributo `apikey.authType` da `ApiKeyIdentity`. Não é persistido nem serializado em JSON |

Java: `API_KEY`, idêntico (também com um único valor).

### ApiKeyError

Mapeamento HTTP (Confirmado em `src/error.rs`): `Unauthorized`, `AuthenticationFailed`, `Expired`, `Revoked` → 401; `NotFound`, `RoleNotFound`, `OwnerNotFound`, `ManagementDisabled` → 404; `RoleNotAllowed`, `Forbidden` → 403; `BadRequest` → 400; `Generation`, `Database`, `Internal` → 500. Mensagens iguais às do Java.

### ManagementIdentity

Enum com dados: `ApiKey(ApiKeyIdentity)` ou `Human(HumanIdentity)`. Permite que as rotas `/apikeys*` aceitem API key **ou** JWT humano; expõe `check_permission` e `principal_name`. No Java o `SecurityContext` abstrai a credencial, então não há enum equivalente.
