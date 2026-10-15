---
tags: [seedgrid, extension, backup, rust, configuracao]
fonte: rust/seedgrid-rust-crate-backup
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# backup — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/backup/Rust|Porte Rust do backup]] · Java: [[SeedGrid/Extensions/backup/Configuracao|Configuração do backup (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `BackupConfig` (+ `NotificationConfig`, `MailerConfig`, `CsvConfig`, `FilesystemConfig`, `S3Config`, `MinioConfig`, `AzureBlobConfig`, `GoogleDriveConfig`, `OnedriveConfig`, `GcsConfig`) — `rust/seedgrid-rust-crate-backup/src/config.rs` |
| Mecanismo | `BackupConfig::from_env()` parte de `BackupConfig::default()` e sobrescreve com env; ou struct montada pelo host |
| Prefixo Java | `seedgrid.backup` (`BackupConfig.java`, `@ConfigMapping`) |
| Quem chama `from_env` | `BackupPlatform::assemble` (`src/platform.rs`) |
| Leitura | no boot, uma vez |

Regras de leitura (`src/config.rs` → `env_any`): lista de nomes em ordem; vence o **primeiro nome com valor não vazio após `trim`**. Valor que não parseia (número, bool, duração) é ignorado e o default permanece. Booleanos (`env_bool_any`): `true/1/yes` e `false/0/no` (case-insensitive). Durações (`parse_duration`): `500ms`, `30s`, `5m`, `2h`, `1d` ou ISO-8601 `PT15M`, `P30D`, `P1DT2H` (sem anos/meses/semanas).

## Habilitação (fora do `BackupConfig`)
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_BACKUP_ENABLED` / alias `BACKUP_ENABLED` | bool | `1`, `true`, `yes`, `on` (case-insensitive); qualquer outro = falso | falso (ausente) | Condicional: obrigatória `true` quando `BackupOverrides.require_opt_in` (default `true`) | sem opt-in, `BackupPlatform::assemble` devolve `Ok(None)` (backup desligado). Precedência: primeiro nome **definido** (mesmo vazio) | `BackupPlatform::assemble` | requer também `PgPool` | `assemble()` | `src/platform.rs` → `backup_opt_in` |

Equivalente Java: não há `seedgrid.backup.enabled` no `BackupConfig.java` (**Confirmado** — o Java liga a extensão por presença no classpath).

## Geral
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `BACKUP_RETENTION_DAYS` / alias `SEEDGRID_BACKUP_RETENTION_DAYS` (Java `seedgrid.backup.retention-days`) | i64 | inteiro | `7` | Não | `expires_at = agora + N dias` | `ExportService` (`src/service.rs`) | limpeza no scheduler | `from_env()` | `config.rs`; consumo `service.rs` |
| `BACKUP_MAX_CONCURRENT_EXPORTS` / `SEEDGRID_BACKUP_MAX_CONCURRENT_EXPORTS` (Java `max-concurrent-exports`) | i64 | inteiro | `1` | Não | limite de exports simultâneos | `BackupScheduler::process_queued_exports` | — | `from_env()` | `scheduler.rs` |
| `BACKUP_STORAGE` / `SEEDGRID_BACKUP_STORAGE` (Java `storage`, `${SEEDGRID_BACKUP_STORAGE:filesystem}`) | String | `filesystem`, `s3`, `minio`, `azure-blob`, `google-drive`, `onedrive`, `gcs` (case-insensitive) | `filesystem` | Não | outro valor → erro `Unknown storage type` em `build_storage_config` | `exporter.rs`, `storage.rs` | escolhe o bloco de storage | `from_env()` | `config.rs` → `build_storage_config` |
| `BACKUP_QUEUE_POLL_INTERVAL` / `SEEDGRID_BACKUP_QUEUE_POLL_INTERVAL` (Java `queue-poll-interval`) | Duration | ver durações | `30s` | Não | intervalo do loop de fila | `BackupScheduler::spawn` | — | `from_env()` | `scheduler.rs` |
| `BACKUP_ASYNC_ENABLED` / `SEEDGRID_BACKUP_ASYNC_ENABLED` (Java `async-enabled`) | bool | `true/1/yes`, `false/0/no` | `true` | Não | dispara worker assíncrono após criar o job | `ExportService::create_export_job` | — | `from_env()` | `service.rs` |

## Notificação
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `BACKUP_NOTIFICATION_ENABLED` / `SEEDGRID_BACKUP_NOTIFICATION_ENABLED` (Java `notification.enabled`) | bool | idem | `true` | Não | desliga o loop de notificação e `is_enabled()` | `scheduler.rs`, `notification.rs` | exige `mailer.from` e `mailer.host` | `from_env()` | `config.rs` |
| `BACKUP_NOTIFICATION_POLL_INTERVAL` / `SEEDGRID_BACKUP_NOTIFICATION_POLL_INTERVAL` (Java `notification.poll-interval`) | Duration | idem | `5m` | Não | intervalo do loop | `BackupScheduler::spawn` | — | `from_env()` | `scheduler.rs` |
| `BACKUP_NOTIFICATION_MAX_RETRIES` / `SEEDGRID_BACKUP_NOTIFICATION_MAX_RETRIES` (Java `notification.max-retries`) | i32 (lido como i64) | inteiro | `3` | Não | máx. tentativas de e-mail | `process_notifications` | — | `from_env()` | `scheduler.rs`, `repo.rs` |
| `BACKUP_NOTIFICATION_RETRY_DELAY` / `SEEDGRID_BACKUP_NOTIFICATION_RETRY_DELAY` (Java `notification.retry-delay`) | Duration | idem | `PT15M` | Não | atraso mínimo entre tentativas | `process_notifications` | — | `from_env()` | `scheduler.rs` |

## Mailer (SMTP)
Precedência invertida: **`SEEDGRID_BACKUP_MAILER_*` primeiro**, `BACKUP_MAILER_*` como alias (igual às `${...}` do `microprofile-config.properties` Java — **Confirmado**). Só sobrescreve o default quando a env existe e não é vazia.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_BACKUP_MAILER_FROM` / `BACKUP_MAILER_FROM` (Java `mailer.from`) | `Option<String>` | e-mail | `noreply@example.com` | Não | remetente; ausente → erro no envio | `notification.rs` | entra em `is_enabled()` | `from_env()` | `config.rs`, `notification.rs` |
| `SEEDGRID_BACKUP_MAILER_HOST` / `BACKUP_MAILER_HOST` (Java `mailer.host`) | `Option<String>` | host | `smtp.gmail.com` | Não | host SMTP | `SmtpMailer::from_config`, `is_enabled()` | — | `from_env()` | `email_smtp.rs` |
| `SEEDGRID_BACKUP_MAILER_PORT` / `BACKUP_MAILER_PORT` (Java `mailer.port`) | `Option<u16>` | 1–65535 | `587` | Não | `465` → TLS implícito; senão STARTTLS | `SmtpMailer::from_config` | `start_tls` | `from_env()` | `email_smtp.rs` |
| `SEEDGRID_BACKUP_MAILER_START_TLS` / `BACKUP_MAILER_START_TLS` (Java `mailer.start-tls`) | `Option<String>` | `REQUIRED`, `OPTIONAL`, `DISABLED` | `REQUIRED` | Não | só `DISABLED` muda o comportamento (texto puro) | `SmtpMailer::from_config` | — | `from_env()` | `email_smtp.rs` |
| `SEEDGRID_BACKUP_MAILER_USERNAME` / `BACKUP_MAILER_USERNAME` (Java `mailer.username`) | `Option<String>` | texto | — | Condicional (para `MailerConfig::is_configured()`) | credencial SMTP | `SmtpMailer::from_config` | — | `from_env()` | `email_smtp.rs` |
| 🔒 `SEEDGRID_BACKUP_MAILER_PASSWORD` / `BACKUP_MAILER_PASSWORD` (Java `mailer.password`) | `Option<String>` | texto | — | Condicional (idem) | credencial SMTP | `SmtpMailer::from_config` | — | `from_env()` | `email_smtp.rs` |

`MailerConfig::is_configured()` = host + from + username + password presentes; usado por hosts para decidir `SmtpMailer` vs `LoggingMailer` (comentário em `src/email_smtp.rs`; o auto-wire fica no subdomain-tenancy — **Não confirmado** nesta análise).

## CSV e filesystem
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `BACKUP_CSV_DELIMITER` / `SEEDGRID_BACKUP_CSV_DELIMITER` (Java `csv.delimiter`) | String | 1º byte é usado | `,` | Não | delimitador do CSV e do manifest | `exporter.rs` | — | `from_env()` | `exporter.rs` |
| `BACKUP_CSV_QUOTE_CHAR` / `SEEDGRID_BACKUP_CSV_QUOTE_CHAR` (Java `csv.quote-char`) | String | 1º byte é usado | `"` | Não | aspas do CSV | `exporter.rs` | — | `from_env()` | `exporter.rs` |
| `BACKUP_FILESYSTEM_BASE` / `SEEDGRID_BACKUP_FILESYSTEM_BASE_PATH` (Java `filesystem.base-path`) | String | caminho | `/var/seedgrid/files` | Não | `base-path` do storage filesystem | `build_storage_config("filesystem")` | — | `from_env()` | `config.rs` |

## MinIO
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `BACKUP_MINIO_BUCKET` / `SEEDGRID_BACKUP_MINIO_BUCKET` (Java `minio.bucket`) | `Option<String>` | nome | — | Condicional (`storage=minio`) | chave `bucket` | `build_storage_config("minio")` | validação no filemanagement | `from_env()` | `config.rs` |
| `BACKUP_MINIO_REGION` / `SEEDGRID_BACKUP_MINIO_REGION` (Java `minio.region`) | `Option<String>` | região | — (Java: `us-east-1`) | Não | chave `region` | idem | — | `from_env()` | `config.rs` |
| 🔒 `BACKUP_MINIO_ACCESS_KEY` / `SEEDGRID_BACKUP_MINIO_ACCESS_KEY` | `Option<String>` | texto | — | Condicional | chave `access-key` | idem | — | `from_env()` | `config.rs` |
| 🔒 `BACKUP_MINIO_SECRET_KEY` / `SEEDGRID_BACKUP_MINIO_SECRET_KEY` | `Option<String>` | texto | — | Condicional | chave `secret-key` | idem | — | `from_env()` | `config.rs` |
| `BACKUP_MINIO_ENDPOINT` / `SEEDGRID_BACKUP_MINIO_ENDPOINT` | `Option<String>` | URL | — | Condicional | chave `endpoint` | idem | — | `from_env()` | `config.rs` |

## Storages só por struct (sem env)
`s3` (`bucket`, `region`, `access_key` 🔒, `secret_key` 🔒, `endpoint`), `azure_blob` (`connection_string` 🔒, `container`, `account_name`, `account_key` 🔒), `google_drive` (`root_folder_id`, `credentials_file`, `credentials_json` 🔒), `onedrive` (`client_id`, `client_secret` 🔒, `tenant_id`, `root_folder_path` = `/seedgrid/files`), `gcs` (`bucket`, `project_id`, `credentials_file`, `credentials_json` 🔒). Todos `None` por padrão; `from_env()` **não** os lê (**Confirmado**). Viram mapa `kebab-case` em `build_storage_config` para a crate filemanagement.

## Features Cargo
Nenhuma.

## Somente testes / exemplos
| Variável | Onde |
|---|---|
| `BACKUP_TEST_DATABASE_URL` | `tests/common/mod.rs` (ITs `#[ignore]`) |
| `DATABASE_URL`, `RUST_LOG` | `examples/seedgrid-backup-example` (lidas pelo exemplo) |

## Aliases de nome

- O Rust lê `BACKUP_*` primeiro e `SEEDGRID_BACKUP_*` como alias (exceto mailer).
- Base do filesystem: aceita `BACKUP_FILESYSTEM_BASE` e `SEEDGRID_BACKUP_FILESYSTEM_BASE_PATH`, **não** `SEEDGRID_BACKUP_FILESYSTEM_BASE`.
- `minio.region` não tem default no Rust.
- Sem equivalente no Rust: `seedgrid.backup.excluded-domain-entity-packages` e `seedgrid.backup.mailer.auth-methods` (`SEEDGRID_BACKUP_MAILER_AUTH_METHODS`).

## Configuração mínima
```dotenv
SEEDGRID_BACKUP_ENABLED=true          # opt-in exigido por BackupPlatform::assemble
```

## Configuração completa comentada
```dotenv
SEEDGRID_BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=7
BACKUP_MAX_CONCURRENT_EXPORTS=1
BACKUP_STORAGE=filesystem                 # filesystem|minio (s3/azure/gcs/drive/onedrive só via struct)
BACKUP_QUEUE_POLL_INTERVAL=30s
BACKUP_ASYNC_ENABLED=true
BACKUP_FILESYSTEM_BASE=/var/seedgrid/files
BACKUP_CSV_DELIMITER=,
BACKUP_CSV_QUOTE_CHAR='"'
BACKUP_NOTIFICATION_ENABLED=true
BACKUP_NOTIFICATION_POLL_INTERVAL=5m
BACKUP_NOTIFICATION_MAX_RETRIES=3
BACKUP_NOTIFICATION_RETRY_DELAY=PT15M
SEEDGRID_BACKUP_MAILER_FROM=<remetente@dominio>
SEEDGRID_BACKUP_MAILER_HOST=<smtp-host>
SEEDGRID_BACKUP_MAILER_PORT=587
SEEDGRID_BACKUP_MAILER_START_TLS=REQUIRED
SEEDGRID_BACKUP_MAILER_USERNAME=<usuario>
SEEDGRID_BACKUP_MAILER_PASSWORD=<SEGREDO:backup-smtp-password>
# MinIO (BACKUP_STORAGE=minio)
BACKUP_MINIO_ENDPOINT=http://<host>:9000
BACKUP_MINIO_BUCKET=<bucket>
BACKUP_MINIO_REGION=us-east-1
BACKUP_MINIO_ACCESS_KEY=<SEGREDO:minio-access-key>
BACKUP_MINIO_SECRET_KEY=<SEGREDO:minio-secret-key>
```

## Receitas
- **Filesystem local**: só `SEEDGRID_BACKUP_ENABLED=true` (+ `BACKUP_FILESYSTEM_BASE`).
- **MinIO**: `BACKUP_STORAGE=minio` + bloco `BACKUP_MINIO_*`.
- **S3/Azure/GCS/Drive/OneDrive**: montar `BackupConfig` no host preenchendo o sub-struct (não há env).
- **Sem e-mail**: `BACKUP_NOTIFICATION_ENABLED=false`.
- **Sem opt-in**: `BackupOverrides { require_opt_in: false, ..Default::default() }`.
