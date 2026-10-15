---
tags: [seedgrid, extension, apikeys, rust, configuracao]
fonte: rust/seedgrid-rust-crate-apikeys
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# Configuração Rust — `seedgrid-rust-crate-apikeys`

Volta para: [[SeedGrid/Extensions/apikeys/Rust|Porte Rust do apikeys]] · Java: [[SeedGrid/Extensions/apikeys/Configuracao|Configuração do apikeys (Quarkus)]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Struct | `ApiKeysConfig` (`src/config.rs`), com `impl Default` |
| Prefixo lógico | `seedgrid.apikeys` (porte do `@ConfigMapping(prefix = "seedgrid.apikeys")` de `ApiKeysConfig.java`) |
| Mecanismo | `ApiKeysConfig::from_env()` lê 2 env vars com `std::env::var` (helper `env_usize`); valor ausente ou não-numérico → default |
| Leitura | no boot, quando o host chama `from_env()` e passa o resultado a `ApiKeyState::builder(pool, config)` |
| Features Cargo | nenhuma |
| Outras fontes | nenhuma leitura de env fora de `src/config.rs` (Confirmado por grep em `src/` e `tests/`) |

## 2. Propriedades do crate

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_APIKEYS_PREFIX_LENGTH` → `prefix_length` | `usize` | inteiro ≥ 0 (aparado) | `8` | Não | nº de caracteres da parte aleatória persistidos como prefixo (sem `sgkey_`); `extract_prefix` exige ao menos esse tamanho | `src/generator.rs` (`ApiKeyGenerator::generate`, `extract_prefix`) | Java: `seedgrid.apikeys.prefix-length` (`ApiKeysConfig#prefixLength`), mesma env e default (Confirmado no código) | boot (`from_env`) ou struct | `src/config.rs` → `ApiKeysConfig::from_env` / `env_usize`; consumo `src/generator.rs` |
| `SEEDGRID_APIKEYS_KEY_BYTES` → `key_bytes` | `usize` | inteiro ≥ 0 | `32` | Não | nº de bytes aleatórios (OsRng) codificados em Base64 URL-safe sem padding | `src/generator.rs:67` | Java: `seedgrid.apikeys.key-bytes` (`ApiKeysConfig#keyBytes`) | boot ou struct | idem |

Policy de ativação (não é config, é SPI): `ApiKeyActivationPolicy` (`src/spi.rs`) com `is_api_key_auth_enabled()` e `is_api_key_management_enabled()`; default `DefaultApiKeyActivationPolicy` = ambos `true`. Troca via `ApiKeyState::builder(...).policy(Arc<dyn ApiKeyActivationPolicy>)`.

Constantes fixas (não configuráveis, `src/constants.rs`): header `x-api-key`, prefixo literal `sgkey_`.

## 3. Propriedades de frameworks/bibliotecas

Nenhuma lida pelo crate. Depende do `seedgrid-security` (bcrypt e schema `users`/`roles`/`permissions`); a config do security é independente — ver [[SeedGrid/Extensions/security/Configuracao-Rust|Configuração Rust do security]].

## 4. Propriedades usadas só em testes e exemplos

- `rust/examples/seedgrid-security-apikeys-example/.env.example` lista `SEEDGRID_APIKEYS_PREFIX_LENGTH` e `SEEDGRID_APIKEYS_KEY_BYTES` comentadas, além de `DATABASE_URL`/`BIND_ADDR` (lidas pelo `main.rs` do exemplo) e envs do security.
- README: `DOCKER_HOST` para os testes `#[ignore]` com Testcontainers/Podman.

## 5. Aliases, obsoletas, renomeações

Nenhum alias. Nomes de env idênticos ao Java.

## 6. Configuração mínima

Nenhuma variável é obrigatória (defaults 8/32).

## 7. Configuração completa comentada

```dotenv
# Tamanho do prefixo persistido (sem "sgkey_"). Default 8.
SEEDGRID_APIKEYS_PREFIX_LENGTH=8
# Bytes aleatórios da chave (Base64 URL-safe sem padding). Default 32.
SEEDGRID_APIKEYS_KEY_BYTES=32
```

## 8. Receitas

- **Chave mais longa:** `SEEDGRID_APIKEYS_KEY_BYTES=48`. Chaves já emitidas continuam válidas (o hash cobre a chave crua completa).
- **Desligar gestão REST mantendo autenticação:** implementar `ApiKeyActivationPolicy` com `is_api_key_management_enabled() = false` (endpoints de gestão → 404 `Api key management is disabled`; `GET /apikeys/me` continua).

## 9. Dúvidas e lacunas

- Mudar `prefix_length` depois de emitir chaves altera o prefixo extraído na autenticação; chaves antigas com prefixo de outro tamanho deixariam de ser encontradas — **Inferência** (o lookup é por prefixo de `prefix_length` chars, `src/generator.rs` + `services/auth.rs`).
- Valores `0` não são validados (ex.: `KEY_BYTES=0` gera parte aleatória vazia) — **Inferência** pela ausência de validação em `from_env`.
