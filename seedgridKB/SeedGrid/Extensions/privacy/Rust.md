---
tags: [seedgrid, extension, privacy, rust]
fonte: rust/seedgrid-rust-crate-privacy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# privacy — porte Rust (`seedgrid-rust-crate-privacy`)

Porte da lib Java `seedgrid-quarkus-lib-privacy`. Lado Java: [[SeedGrid/Extensions/privacy/Visao-geral|Visão geral do privacy (Java)]] · [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy (Java)]]. Configuração Rust: [[SeedGrid/Extensions/privacy/Configuracao-Rust|Configuração Rust do privacy]].

Base de privacidade LGPD/PII com duas capacidades: (1) **mascaramento** de dados pessoais em JSON/objetos; (2) **criptografia de campo at-rest** AES-256-GCM com **hash de busca** determinístico HMAC-SHA256. Crate puro (sem Axum/DB). **Confirmado** (`src/lib.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-privacy` (lib `seedgrid_privacy`) |
| Versão | workspace `2026.10.14` |
| Features | nenhuma |
| Dependência SeedGrid | `seedgrid-macros` (derive `PersonalData`) |
| Consumidores (Cargo.toml) | audit (reexporta `masking`), login-tenancy, security, subdomain-tenancy |

## API pública
| Módulo / símbolo | Papel |
|---|---|
| `masking`: `MaskingStrategy` (`Full`, `Format`, `Partial`, `Hash`, `Template`, `Remove`), `MaskRule` (`format`, `hash`, `remove`…), `mask_json`, `PersonalDataResolver`, `PersonalDataSanitizer`, `ResolvedRule`, `masker::{cpf, cnpj, cep}`, `sha256_hex` | mascaramento; caminhos `a.b`, `lista[].campo`; regra repetida segue a ordem de inserção do `LinkedHashMap` Java |
| `crypto`: `CryptoService`, `AesGcmCryptoService::from_key_spec` / `from_raw_key`, `looks_encrypted`, `VERSION_PREFIX` (`v1`), `CryptoError` | cifra; formato `v1:BASE64(iv):BASE64(ct‖tag)` igual ao Java |
| `search`: `SearchHashService`, `HmacSha256SearchHashService::from_key_spec`, `SearchNormalization` (`None`, `Canonical`, `Email`), `ValueNormalizer`, `DefaultValueNormalizer`, `SecureSearch`, `EncryptedFieldSearch` | hash de busca |
| `field`: `CryptoProvider` (estado global), `EncryptedFieldConverter` (`from_provider`, `with_service`), `EncryptedFieldListener`, `SecureFieldsCarrier`, `SecureFieldDescriptor`, `apply_search_hashes_via_provider`, `FieldError`; constantes `ENCRYPTION_ENABLED_PROPERTY`, `CRYPTO_KEY_PROPERTY`, `SEARCH_KEY_PROPERTY` | integração com entidades (sem reflexão/JPA) |
| `#[derive(PersonalData)]` (de `seedgrid-macros`) | gera `SecureFieldsCarrier` + `encrypt_personal_data`/`decrypt_personal_data` a partir de `#[personal_data(search = "...", normalize = "...")]` |

### `CryptoProvider` (global)
- `is_encryption_enabled()`: override programático (`set_encryption_enabled_for_tests`) vence; senão lê `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED`; padrão `false`.
- `get_crypto_service()` / `get_search_hash_service()`: o serviço configurado (`configure`, `configure_with_key`, `configure_search_hash_service`, `configure_search_with_key`) vence; senão é construído **sob demanda** a partir de `SEEDGRID_PRIVACY_CRYPTO_KEY` / `SEEDGRID_PRIVACY_SEARCH_KEY` e guardado em cache. Chave inválida → `None`.
- `get_secure_search()`, `configure_normalizer`, `get_normalizer`, `reset_for_tests`.

Fonte: `src/field.rs` → `impl CryptoProvider`. Detalhes em [[SeedGrid/Extensions/privacy/Configuracao-Rust|Configuração Rust]].

## Exemplos
Mascaramento:
```rust
use seedgrid_privacy::{mask_json, MaskRule, masker};
use serde_json::json;

let v = json!({ "cpf": "12345678900", "nome": "Joao", "email": "joao@x.com" });
let out = mask_json(&v, &[
    MaskRule::format("cpf", "***.***.***-**"),
    MaskRule::hash("email"),
    MaskRule::remove("nome"),
]);
assert_eq!(masker::cpf(Some("12345678900")), "***.***.***-00");
```
Derive (de `tests/personal_data_derive.rs`):
```rust
use seedgrid_privacy::{CryptoProvider, PersonalData, SecureFieldsCarrier};

#[derive(PersonalData, Default)]
struct User {
    #[personal_data(search = "email_hash", normalize = "email")]
    email: String,
    email_hash: Option<String>,
    #[personal_data(search = "whats_app_hash")] // normalize padrão = canonical
    whats_app: Option<String>,
    whats_app_hash: Option<String>,
    #[personal_data] // cifra sem gerar hash
    cnpj: Option<String>,
}
```

## Testes
Unitários em `src/*` (vetores portados do Java, ex.: `SHA-256("abc")`) e `tests/personal_data_derive.rs`. **Não executados.** Sem exemplo em `rust/examples/` (o `seedgrid-login-tenancy-example` usa a crate indiretamente).

## Notas de comportamento

- **Chave ausente/inválida com cifra ligada**: falha (fail-closed); o Rust devolve `CryptoError::InvalidKey` em vez de gravar em claro (`EncryptedFieldConverter::resolve_for_write`). Chave AES > 32 bytes é rejeitada (sem truncar).
- As mensagens de erro de chave inválida citam `seedgrid.crypto.key` / `seedgrid.search.key` (`src/crypto.rs`, `src/search.rs` → `decode_key`); a propriedade Java é `seedgrid.privacy.crypto.key`.
- `PARTIAL` com parâmetro negativo cai no padrão 2; `PARTIAL`/`TEMPLATE` contam caracteres Unicode (Java conta UTF-16).
- Os enums `CryptoAlgorithm`/`SearchAlgorithm` não existem no Rust.

## Enums
Java: [[SeedGrid/Extensions/privacy/Enums|Enums do privacy (Java)]].

| Enum | Arquivo | Java equivalente |
|---|---|---|
| `MaskingStrategy` | `src/masking.rs` | [[SeedGrid/Extensions/privacy/Enums#MaskingStrategy\|MaskingStrategy]] |
| `SearchNormalization` | `src/search.rs` | [[SeedGrid/Extensions/privacy/Enums#SearchNormalization\|SearchNormalization]] |
| `CryptoError`, `FieldError` | `src/crypto.rs`, `src/field.rs` | exceções |

### MaskingStrategy
Variantes: `Full`, `Format`, `Partial`, `Hash`, `Template`, `Remove` (os 6 valores que o Java tinha antes do `EMAIL`). **O `EMAIL` do Java (commit `916e289`, 2026-10-27) ainda não existe no crate**: o espelho Rust vem depois que o Java fechar. Sem serde; as regras são montadas por código (`MaskRule::format/hash/remove…`).

| Valor | Efeito (`mask_value`) |
|---|---|
| `Full` | valor fixo = `param` ou `***` |
| `Format` | `param` como máscara pronta (vazio → `***`) |
| `Partial` | só os últimos N caracteres visíveis (`param` = N, padrão 2; negativo cai em 2 — o Java estoura) |
| `Hash` | SHA-256 hex minúsculo |
| `Template` | `#` revela, `*` mascara, outro char é literal |
| `Remove` | estrutural: remove o campo (`is_removal()`; `mask_value` devolve `None`) |

Conta caracteres Unicode (o Java conta unidades UTF-16).

### SearchNormalization
`None` (padrão), `Canonical`, `Email` — iguais ao Java (`NONE`, `CANONICAL`, `EMAIL`). `None` = valor exato; `Canonical` = trim + NFD sem acentos + minúsculas + só `[a-z0-9]`; `Email` = trim + minúsculas. No derive: `normalize = "none"|"canonical"|"email"` (padrão `canonical`). Sem serde.

`CryptoAlgorithm` (`AES_256_GCM`) e `SearchAlgorithm` (`HMAC_SHA256`) do Java **não existem** no Rust (o algoritmo é fixo).
