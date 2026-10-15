---
tags: [seedgrid, extension, filemanagement, rust, configuracao]
fonte: rust/seedgrid-rust-crate-filemanagent
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# filemanagement — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/filemanagement/Rust|Porte Rust do filemanagement]] · Java: [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração do filemanagement (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Mecanismo | **não lê variáveis de ambiente** nem tem struct de config: cada backend recebe um `HashMap<String, String>` em `FileStorageRegistry::get(tipo, &config)` → `FileStorageFactory::create(&config)` |
| Equivalente Java | idem: `Map<String,String>` passado ao registry; sem `@ConfigMapping` |
| Seleção de backend | pelo `tipo` passado ao registry (`type_identifier`); disponibilidade depende das features Cargo |
| Leitura | na criação do storage (`create`), uma vez por `(tipo, config)` (cache do registry) |
| Verificação | `grep` por `env::var` em `src/` não encontra nada (**Confirmado**); só `tests/minio_smoke.rs` lê env |

Quem fornece o mapa no workspace: `seedgrid-rust-crate-backup` (`BackupConfig::build_storage_config`, ver [[SeedGrid/Extensions/backup/Configuracao-Rust|Configuração Rust do backup]]) e o exemplo `seedgrid-filemanagement-example` (env `MINIO_*`).

## Chaves por backend
A coluna "Leitura" é sempre `create(&config)`. Valores são `trim`ados e vazios contam como ausentes, salvo indicação.

### filesystem (sempre disponível)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `base-path` | String | caminho de diretório | — | Sim | cria o diretório se faltar; valida que é diretório e gravável (arquivo de teste `.seedgrid-write-test-*`) | `FilesystemStorage` | — | `create` | `src/factories.rs` → `FilesystemStorageFactory::create` |

### s3 (feature `s3`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `bucket` | String | nome | — | Sim | bucket alvo | `S3CompatStorage` | — | `create` | `src/providers/s3.rs` → `S3StorageFactory` |
| `region` | String | região AWS | `us-east-1` | Não | sem `endpoint`, precisa ser região válida (`Invalid S3 region`) | idem | `endpoint` | `create` | idem |
| `endpoint` | String | URL | — | Não | se presente: região custom + **path-style** (MinIO/LocalStack) | idem | — | `create` | idem |
| 🔒 `access-key` / 🔒 `secret-key` | String | texto | — | Não | só usadas se **ambas** presentes; senão cadeia default de credenciais do `rust-s3` | idem | — | `create` | `credentials_from` |

Cadeia default: o comentário do código diz "env/perfil/instância, igual ao Java"; os nomes exatos das variáveis vêm da biblioteca `rust-s3` (**Inferência**: variáveis AWS padrão como `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`; não verificado na dependência).

### minio (feature `s3` ou `minio`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `endpoint` | String | URL | — | Sim | sempre path-style | `S3CompatStorage` | — | `create` | `src/providers/s3.rs` → `MinioStorageFactory` |
| 🔒 `access-key` | String | texto | — | Sim | | idem | — | `create` | idem |
| 🔒 `secret-key` | String | texto | — | Sim | | idem | — | `create` | idem |
| `bucket` | String | nome | — | Sim | | idem | — | `create` | idem |
| `region` | String | texto | `us-east-1` | Não | | idem | — | `create` | idem |

### azure-blob (feature `azure`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `container` | String | nome | — | Sim | criado se não existir (`ensure_container`) | `AzureBlobStorage` | — | `create` | `src/providers/azure.rs` → `AzureBlobStorageFactory` |
| 🔒 `connection-string` | String | `AccountName=...;AccountKey=...;[EndpointSuffix=...;DefaultEndpointsProtocol=...]` | — | Condicional: ela **ou** `account-name`+`account-key` | tem precedência; `EndpointSuffix` padrão `core.windows.net`, protocolo padrão `https` | idem | — | `create` | `parse_connection_string` |
| `account-name` | String | texto | — | Condicional | host `https://<conta>.blob.core.windows.net` | idem | `account-key` | `create` | idem |
| 🔒 `account-key` | String | base64 | — | Condicional | assinatura SharedKey | idem | `account-name` | `create` | idem |

### gcs (feature `gcs`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `bucket` | String | nome | — | Sim | | `GcsStorage` | — | `create` | `src/providers/gcs.rs` |
| `project-id` | String | texto | — | Sim | só validado (paridade com o Java) | — | — | `create` | idem |
| `credentials-file` | String | caminho de JSON de service account | — | Condicional: um dos dois | lido do disco; tem precedência | `GoogleTokenProvider` | `credentials-json` | `create` | `src/providers/google_auth.rs` → `from_config` |
| 🔒 `credentials-json` | String | JSON de service account | — | Condicional | usado se não houver `credentials-file` | idem | — | `create` | idem |

### google-drive (feature `google-drive`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `root-folder-id` | String | id da pasta | — | Sim | pasta raiz | `GoogleDriveStorage` | — | `create` | `src/providers/drive.rs` |
| `credentials-file` / 🔒 `credentials-json` | String | idem GCS | — | Condicional (um dos dois) | idem GCS | `GoogleTokenProvider` | — | `create` | `google_auth.rs` |

### onedrive (feature `onedrive`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `client-id` | String | texto | — | Sim | OAuth client-credentials | `OneDriveStorage` | os três juntos | `create` | `src/providers/onedrive.rs` |
| 🔒 `client-secret` | String | texto | — | Sim | | idem | | `create` | idem |
| `tenant-id` | String | texto | — | Sim | | idem | | `create` | idem |
| `root-folder-path` | String | caminho | `/seedgrid/files` | Não | pasta raiz | idem | — | `create` | idem |

## Features Cargo
| Feature | Padrão | Efeito |
|---|---|---|
| (nenhuma) | sim | só `filesystem` |
| `s3` | não | registra `s3` **e** `minio` em `BuiltInStorageFactories::all()` |
| `minio` | não | alias de `s3` |
| `azure` | não | `azure-blob` |
| `gcs` | não | `gcs` (+ `_google-auth`) |
| `google-drive` | não | `google-drive` (+ `_google-auth`) |
| `onedrive` | não | `onedrive` |
| `full` | não | todos |
| `_google-auth` | não | interna (JWT RS256 de service account) |

## Somente testes / exemplos
| Variável | Onde |
|---|---|
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY` 🔒, `MINIO_SECRET_KEY` 🔒, `MINIO_BUCKET` | `examples/seedgrid-filemanagement-example/src/main.rs` (`env_or`) e `tests/minio_smoke.rs` |

## Configuração mínima
```rust
let mut cfg = HashMap::new();
cfg.insert("base-path".into(), "/var/seedgrid/files".into());
let storage = FileStorageRegistry::new(BuiltInStorageFactories::all())?.get("filesystem", &cfg)?;
```

## Receitas
- **MinIO**: compile com `features = ["s3"]`; mapa `endpoint`, `access-key`, `secret-key`, `bucket` (+ `region`).
- **AWS S3 com credenciais da instância**: `features = ["s3"]`; mapa só com `bucket` (+ `region`).
- **Azure**: `features = ["azure"]`; `container` + `connection-string` (`<SEGREDO:azure-connection-string>`).
- **GCS / Drive**: `credentials-file` apontando para o JSON da service account.
