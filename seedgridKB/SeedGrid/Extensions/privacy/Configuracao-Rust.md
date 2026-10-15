---
tags: [seedgrid, extension, privacy, rust, configuracao]
fonte: rust/seedgrid-rust-crate-privacy
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# privacy — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/privacy/Rust|Porte Rust do privacy]] · Java: [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Mecanismo | estado global `CryptoProvider` (`rust/seedgrid-rust-crate-privacy/src/field.rs`); propriedades lidas do ambiente por `config_env(property)` |
| Conversão de nome | `env_of`: maiúsculas e `.`/`-` → `_` (`seedgrid.privacy.crypto.key` → `SEEDGRID_PRIVACY_CRYPTO_KEY`) |
| Prefixo Java | `seedgrid.privacy` (constantes em `CryptoProvider.java`) |
| Precedência | configuração programática (`CryptoProvider::configure*`, `set_encryption_enabled_for_tests`) > variável de ambiente > padrão |
| Leitura | `ENCRYPTION_ENABLED` a **cada** chamada de `is_encryption_enabled()` (sem cache); chaves na primeira chamada de `get_*_service()` e depois em cache |
| Struct de config | não há |

`config_env` trata valor vazio/brancos como ausente (não faz `trim` no valor retornado).

## Variáveis de ambiente
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED` (Java `seedgrid.privacy.encryption.enabled`) | bool | `true`, `1`, `yes`, `on` (case-insensitive) = ligado; qualquer outro = desligado | `false` | Não | ligado: `EncryptedFieldConverter::from_provider` cifra na escrita e o listener gera hash; desligado: grava cru e não gera hash | `CryptoProvider::is_encryption_enabled` → `EncryptedFieldConverter::resolve_for_write`, `apply_search_hashes_via_provider` | exige as duas chaves quando ligado | a cada chamada | `field.rs` → `ENCRYPTION_ENABLED_PROPERTY`, `parse_bool` |
| 🔒 `SEEDGRID_PRIVACY_CRYPTO_KEY` (Java `seedgrid.privacy.crypto.key`) | String | Base64 (com ou sem prefixo `base64:`) que decodifica para **exatamente 32 bytes** | — | Condicional: com cripto ligada e para **ler** valores `v1:...` | cria `AesGcmCryptoService`; ausente/inválida → serviço `None` (ver nota) | `CryptoProvider::get_crypto_service` | ignorada se `configure`/`configure_with_key` foi chamado | 1ª chamada, depois cache | `field.rs`; `crypto.rs` → `from_key_spec`, `decode_key`, `from_raw_key` |
| 🔒 `SEEDGRID_PRIVACY_SEARCH_KEY` (Java `seedgrid.privacy.search.key`) | String | Base64 (com ou sem `base64:`) com **≥ 32 bytes** | — | Condicional: para gerar/consultar hash de busca | cria `HmacSha256SearchHashService` | `get_search_hash_service`, `get_secure_search`, listener | ignorada se `configure_search_*` foi chamado | 1ª chamada, depois cache | `field.rs`; `search.rs` → `from_key_spec` |

Nota sobre chave ausente/inválida: com cripto ligada e sem serviço de cifra válido, `EncryptedFieldConverter::convert_to_database_column` devolve `Err(CryptoError::InvalidKey("seedgrid.privacy.crypto.key"))` (fail-closed, como o Java): o valor **não** é gravado em claro. Com cripto desligada o valor é gravado cru e nenhuma chave é exigida. Da mesma forma, `apply_search_hashes_via_provider` devolve erro (`seedgrid.privacy.search.key`) quando a cifra está ligada, a entidade tem campo com hash de busca e não há chave de busca. A leitura de um valor `v1:...` sem chave falha com `CryptoError::InvalidKey`. (**Confirmado** em `field.rs`: `resolve_for_write`, `apply_search_hashes_via_provider`, testes `cifra_ligada_sem_chave_falha_em_vez_de_gravar_em_claro` e `cifra_desligada_sem_chave_grava_cru`.)

Mapeamento Java ↔ env: **Confirmado** — mesmos nomes de propriedade em `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/CryptoProvider.java`; a conversão é a regra MicroProfile sem ambiguidade.

## Configuração programática (sem env)
| API | Efeito |
|---|---|
| `CryptoProvider::configure(Arc<dyn CryptoService>)` / `configure_with_key(&str)` | define o serviço de cifra (vence a env) |
| `CryptoProvider::configure_search_hash_service(..)` / `configure_search_with_key(&str)` | define o serviço de hash (vence a env) |
| `CryptoProvider::configure_normalizer(..)` | troca o normalizador (padrão `DefaultValueNormalizer`) |
| `CryptoProvider::set_encryption_enabled_for_tests(bool)` | override do flag (vence a env) |
| `CryptoProvider::reset_for_tests()` | limpa tudo |
| `#[personal_data(search = "...", normalize = "none\|canonical\|email")]` | por campo, via derive; `normalize` padrão `canonical` (comentário do teste) |

## Features Cargo
Nenhuma.

## Somente testes
Nenhuma variável de ambiente lida em `tests/`.

## Aliases / obsoletos

## Configuração mínima (cripto ligada)
```dotenv
SEEDGRID_PRIVACY_ENCRYPTION_ENABLED=true
SEEDGRID_PRIVACY_CRYPTO_KEY=base64:<SEGREDO:privacy-aes-256-key-32-bytes>
SEEDGRID_PRIVACY_SEARCH_KEY=base64:<SEGREDO:privacy-hmac-key-32-bytes>
```

## Receitas
- **Só mascaramento**: nenhuma configuração.
- **Cifra at-rest**: as três variáveis acima, ou `CryptoProvider::configure_with_key(...)` + `configure_search_with_key(...)` no boot.
- **Dados legados em claro**: podem coexistir; a leitura segue o dado (`v1:` decifra, cru volta cru).

## Dúvidas e lacunas
- **Chave ausente ou inválida com a cifra ligada**: a gravação falha com erro (fail-closed), igual ao Java; nada é gravado em claro. A chave só é lida no primeiro uso — para falhar mais cedo, chame `CryptoProvider::configure_with_key` no boot do host e trate o erro.
