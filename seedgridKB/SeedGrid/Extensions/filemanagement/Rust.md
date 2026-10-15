---
tags: [seedgrid, extension, filemanagement, rust]
fonte: rust/seedgrid-rust-crate-filemanagent
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# filemanagement — porte Rust (`seedgrid-rust-crate-filemanagent`)

Porte da lib Java `seedgrid-quarkus-lib-filemanagement`. O nome do pacote Rust tem a grafia `filemanagent` (sem "m"); os crates consumidores o renomeiam para `seedgrid_filemanagement` via `package = ...` (ex.: `rust/seedgrid-rust-crate-backup/Cargo.toml`). Lado Java: [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral do filemanagement (Java)]] · [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração do filemanagement (Java)]]. Configuração Rust: [[SeedGrid/Extensions/filemanagement/Configuracao-Rust|Configuração Rust do filemanagement]].

Abstração de armazenamento de arquivos com registro extensível de backends: `filesystem` (sempre presente) e, por feature Cargo, `s3`, `minio`, `azure-blob`, `gcs`, `google-drive`, `onedrive`. **Confirmado** (`src/lib.rs`, `src/factories.rs`).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-filemanagent` (lib `seedgrid_rust_crate_filemanagent`, nome padrão; usado assim em `tests/minio_smoke.rs`) |
| Versão | workspace `2026.10.14` |
| Features | `s3`, `minio` (= `s3`), `azure`, `gcs`, `google-drive`, `onedrive`, `full`; padrão: nenhuma (só filesystem) |
| Dependências SeedGrid | nenhuma |
| Consumidores | backup (e o exemplo `seedgrid-filemanagement-example`) |
| I/O | síncrono (S3/MinIO via `rust-s3` blocking; REST via `reqwest::blocking`) |

## API pública
| Símbolo | Papel | Fonte |
|---|---|---|
| trait `FileStorage` | `store`, `store_stream`, `store_reader` (extra do Rust), `retrieve`, `stream`, `delete`, `exists`, `get_metadata`, `generate_signed_url`, `can_handle`; aliases camelCase (`getMetadata`, `generateSignedUrl`, `canHandle`) | `src/storage.rs` |
| trait `FileStorageFactory` | `type_identifier`, `create(&HashMap<String,String>)`, `is_available` | `src/storage.rs` |
| `FileStorageRegistry::new(Vec<Box<dyn FileStorageFactory>>)` | `get(tipo, &config)` com cache por `(tipo, config)`, `get_for_key`, `has`, `get_available_types` | `src/registry.rs` |
| `BuiltInStorageFactories::all()` | factories disponíveis conforme features | `src/factories.rs` |
| `FilesystemStorageFactory`, `FilesystemStorage` | backend local | `src/factories.rs`, `src/storages.rs` |
| `S3StorageFactory`, `MinioStorageFactory`, `S3CompatStorage` | feature `s3` | `src/providers/s3.rs` |
| `AzureBlobStorageFactory`/`AzureBlobStorage`, `GoogleCloudStorageFactory`/`GcsStorage`, `GoogleDriveStorageFactory`/`GoogleDriveStorage`, `OneDriveStorageFactory`/`OneDriveStorage` | features respectivas | `src/providers/*.rs` |
| `StorageKey` (`to_uri`, `from_uri`, construtores `filesystem`, `s3`…), `StorageOptions` (+ builder: `prefix`, `content_type`, `ttl`, `encrypt`, `public_read`, `metadata`), `FileMetadata` | domínio | `src/domains.rs` |
| `StorageError` (`not_found`, `is_not_found`), `StorageConfigurationError`, `StorageNotFoundError`, `DuplicateStorageError`, `StorageInitializationError`, `RegistryError` | erros | `src/error.rs`, `src/registry.rs` |

## Exemplo (de `rust/examples/seedgrid-filemanagement-example/src/main.rs`)
```rust
let mut config = HashMap::new();
config.insert("endpoint".into(), env_or("MINIO_ENDPOINT", "http://localhost:9000"));
config.insert("access-key".into(), env_or("MINIO_ACCESS_KEY", "<valor-dev>"));
config.insert("secret-key".into(), env_or("MINIO_SECRET_KEY", "<valor-dev>"));
config.insert("bucket".into(), env_or("MINIO_BUCKET", "sg-example"));

let registry = FileStorageRegistry::new(vec![
    Box::new(MinioStorageFactory) as Box<dyn FileStorageFactory>,
])?;
let storage = registry.get("minio", &config)?;
let options = StorageOptions::builder().prefix("example").content_type("text/plain").build();
let key = storage.store("hello.txt", &payload, &options)?;
let fetched = storage.retrieve(&key)?;
let meta = storage.get_metadata(&key)?;
storage.delete(&key)?;
```
(Os valores default de credencial do exemplo foram substituídos por `<valor-dev>`.)

## Testes
- `tests/filesystem_storage_test.rs`, `registry_test.rs`, `storage_key_test.rs`, `storage_options_test.rs`.
- `tests/minio_smoke.rs` (feature `s3`, `#[ignore]`, MinIO real).
- E2E no exemplo: `rust/examples/seedgrid-filemanagement-example/tests/minio_e2e.rs`.
- **Não executados.** Só S3/MinIO foram validados E2E; Azure/GCS/Drive/OneDrive compilam mas não foram testados contra a nuvem.

## Limitações

- `generate_signed_url` só funciona em S3/MinIO; nos backends REST devolve "not supported".
- Não há parser manual de `from_uri`, aliases camelCase nem `store_reader`.

## Enums
Sem enums de domínio (o backend é escolhido pelo texto `type_identifier`: `filesystem`, `s3`, `minio`, `azure-blob`, `gcs`, `google-drive`, `onedrive`). Enum público de erro: `RegistryError` (`src/registry.rs`) com `NotFound(StorageNotFoundError)` (tipo não registrado; a mensagem lista os tipos disponíveis) e `Configuration(StorageConfigurationError)` (falha em `factory.create`). Ver [[SeedGrid/Extensions/filemanagement/Configuracao-Rust|Configuração Rust]] para os tipos e chaves.
