---
tags: [seedgrid, extension, backup, configuracao]
fonte: java/seedgrid-quarkus-ext-backup
branch: main
commit: 3bed4075ea
analisado-em: 2026-10-14
---

# Configuração — backup (Quarkus)

Voltar: [[SeedGrid/Extensions/backup/Visao-geral|Visão geral do backup]] · [[SeedGrid/Extensions/backup/Exemplos|Exemplos]] · [[SeedGrid/Extensions/backup/Enums|Enums]] · [[SeedGrid/Extensions/backup/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.backup` |
| Classe de config | `BackupConfig` (`@ConfigMapping(prefix = "seedgrid.backup")`) com grupos `NotificationConfig`, `MailerConfig`, `CsvConfig`, `FilesystemConfig`, `S3Config`, `MinioConfig`, `AzureBlobConfig`, `GoogleDriveConfig`, `OnedriveConfig`, `GcsConfig` |
| Registro | `BackupProcessor#config()` → `ConfigMappingBuildItem(BackupConfig.class, "seedgrid.backup")` |
| Mecanismo | SmallRye `@ConfigMapping` + `@WithDefault`; dois intervalos lidos também por expressão `@Scheduled(every = "{...}")` |
| Fase | **Runtime** (ConfigMapping em módulo runtime; não há `@ConfigRoot` nem `*BuildTimeConfig`) |
| Valores pré-configurados | `runtime/src/main/resources/META-INF/microprofile-config.properties` (ordinal 100) define valores e **aliases de env var** para várias chaves; o `application.properties` do host (ordinal 250) e env vars (ordinal 300) sobrescrevem |
| Outros mecanismos procurados | `@ConfigProperty`, `ConfigProvider.getConfig()`, `getValue/getOptionalValue`, `Config` injetado, `@IfBuildProperty`/`@LookupIfProperty`/`@UnlessBuildProperty`: **nenhum encontrado** no runtime/deployment (Confirmado por grep) |

Abreviações de origem usadas nas tabelas (todas relativas a `seedgrid-platform`):
- **BC** = `java/seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/configs/BackupConfig.java`
- **MP** = `java/seedgrid-quarkus-ext-backup/runtime/src/main/resources/META-INF/microprofile-config.properties`
- **buildStorageConfig** = método privado homônimo duplicado em `services/ExportService`, `controllers/ExportController`, `exporters/CsvZipExporter`, `exporters/SqlDumpZipExporter` (monta o `Map` passado ao `FileStorageRegistry` do filemanagement)

> **Padrão efetivo**: quando o MP define um valor, ele vale como padrão efetivo mesmo que a interface não tenha `@WithDefault` (ex.: `minio.region`, `mailer.*`). Na coluna Padrão indico ambos quando diferem. Valores vazios (`${ENV:}`) resultam em ausência (`Optional.empty()`) — **Inferência** (regra SmallRye: valor vazio = propriedade não definida).

## 2. Propriedades da extensão

### 2.1 Execução, fila e retenção

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.backup.storage` | String | `filesystem`, `s3`, `minio`, `azure-blob`, `google-drive`, `onedrive`, `gcs` (switch com `toLowerCase`) | `filesystem` (`@WithDefault`; MP: `${SEEDGRID_BACKUP_STORAGE:filesystem}`) | Não | Backend onde os ZIPs são gravados; outro valor → `IllegalArgumentException("Unknown storage type")` ao gravar. Na leitura/exclusão o tipo é re-derivado do `storageKey` (URI) do artefato, não desta chave | Gravação de artefatos | Exige o grupo de chaves do backend escolhido (2.5) | Runtime | BC `storage()`; consumo `ExportService#createStorageServiceAdapter`, `CsvZipExporter#storeExport`, `SqlDumpZipExporter` |
| `seedgrid.backup.async-enabled` | boolean | `true`/`false` | `true` | Não | `true`: ao criar o job dispara thread de plataforma daemon `seedgrid-backup-export-<jobId>`. `false`: job fica `QUEUED` até o scheduler de fila | Criação de job | `queue-poll-interval`, `max-concurrent-exports` | Runtime | BC `asyncEnabled()`; consumo `ExportService#createExportJob` |
| `seedgrid.backup.max-concurrent-exports` | int | inteiro ≥ 0 | `1` (BC e MP) | Não | Teto **global** (somando todos os tenants) de jobs `RUNNING` para o scheduler iniciar novos jobs `QUEUED`; slots divididos entre tenants (`max(1, slots/tenants)`). Não limita o caminho assíncrono direto (`async-enabled=true`) — **Confirmado** (só lido no scheduler) | Scheduler de fila | `queue-poll-interval` | Runtime | BC `maxConcurrentExports()`; consumo `BackupSchedulerService#processQueuedExports` |
| `seedgrid.backup.queue-poll-interval` | String (duração do Quarkus Scheduler) | ex.: `30s`, `5m`, `PT30S` | `30s` (BC e MP) | Não | Intervalo do `@Scheduled(every = "{seedgrid.backup.queue-poll-interval}")`. A interface só declara; a leitura efetiva é pela expressão do scheduler | Scheduler de fila | `async-enabled` | Runtime (startup do scheduler) | BC `queuePollInterval()` (sem chamada direta); consumo `BackupSchedulerService#processQueuedExports` (anotação) |
| `seedgrid.backup.retention-days` | int | inteiro (dias) | `7` (BC e MP) | Não | Ao concluir (`DONE`), `expiresAt = agora + N dias`. A limpeza diária (cron fixo `0 1 0 * * ?`) apaga job + artefatos com `expiresAt < agora`. Alterar não afeta jobs já concluídos | Retenção | — | Runtime | BC `retentionDays()`; consumo `ExportService#executeExport`; limpeza `BackupSchedulerService#cleanExpiredExports` |
| `seedgrid.backup.excluded-domain-entity-packages` | `Optional<List<String>>` (lista separada por vírgula) | prefixos de pacote Java | — (vazio) | Não | Entidades JPA cujo pacote começa com algum prefixo são puladas no escopo `DOMAIN` (evita consultar entidades de outra persistence unit, ex. `seedgrid-audit-postgresql` quando a estratégia ativa de auditoria é outra) | Export `DOMAIN` | escopo `DOMAIN` | Runtime | BC `excludedDomainEntityPackages()`; consumo `ExtractDataService` (construtor, `isExcludedFromDomainExport`) |

### 2.2 Notificação

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.backup.notification.enabled` | boolean | `true`/`false` | `true` (BC e MP) | Não | Liga o scheduler de notificação e entra em `EmailExportNotificationService#isEnabled()` | Notificação | `mailer.from`, `mailer.host` | Runtime | BC `NotificationConfig#enabled()`; consumo `NotificationSchedulerService#processNotifications`, `EmailExportNotificationService#isEnabled` |
| `seedgrid.backup.notification.poll-interval` | String (duração do Quarkus Scheduler) | ex.: `5m`, `PT5M` | `5m` (BC e MP) | Não | Intervalo do `@Scheduled(every = "{seedgrid.backup.notification.poll-interval}")` | Notificação | — | Runtime | BC `NotificationConfig#pollInterval()` (sem chamada direta); consumo anotação em `NotificationSchedulerService#processNotifications` |
| `seedgrid.backup.notification.max-retries` | int | inteiro | `3` (BC e MP) | Não | Jobs `DONE` com `notificationAttempts < max-retries` são (re)notificados; sucesso → `DONE_NOTIFIED` | Notificação | `retry-delay` | Runtime | BC `NotificationConfig#maxRetries()`; consumo `NotificationSchedulerService#processTenant` → `ExportJobRepository#findReadyForNotification` |
| `seedgrid.backup.notification.retry-delay` | `java.time.Duration` | ISO-8601 (ex. `PT15M`) ou formato curto SmallRye (Inferência) | `PT15M` (BC e MP) | Não | Espera mínima desde `lastNotificationAttempt` antes de nova tentativa | Notificação | `max-retries` | Runtime | BC `NotificationConfig#retryDelay()`; consumo `NotificationSchedulerService#processTenant` |

### 2.3 Mailer (notificação padrão por e-mail via Vert.x Mail)

O `EmailExportNotificationService` cria um `io.vertx.ext.mail.MailClient` próprio a partir destas chaves (`@PostConstruct init`) **se** `isEnabled()` = `notification.enabled && mailer.from presente && mailer.host presente`.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.backup.mailer.from` | `Optional<String>` | e-mail | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_FROM:noreply@example.com}` | Condicional (necessária para enviar; ausente → notificação desabilitada) | Remetente (From). Sem ela `notifyReady` lança `IllegalStateException` | E-mail | `mailer.host`, `notification.enabled` | Runtime | BC `MailerConfig#from()`; consumo `EmailExportNotificationService#notifyReady`, `#isEnabled` |
| `seedgrid.backup.mailer.host` | `Optional<String>` | hostname SMTP | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_HOST:smtp.gmail.com}` | Condicional (idem) | Host SMTP (`MailConfig#setHostname`) | E-mail | `mailer.port` | Runtime | BC `MailerConfig#host()`; consumo `EmailExportNotificationService#init`, `#isEnabled` |
| `seedgrid.backup.mailer.port` | `Optional<Integer>` | porta | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_PORT:587}` | Não | Porta SMTP | E-mail | `start-tls` | Runtime | BC `MailerConfig#port()`; consumo `EmailExportNotificationService#init` |
| `seedgrid.backup.mailer.start-tls` | `Optional<String>` | `REQUIRED`, `OPTIONAL`, `DISABLED` (case-insensitive; outro valor é ignorado silenciosamente) | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_START_TLS:REQUIRED}` | Não | `MailConfig#setStarttls` | E-mail | `port` | Runtime | BC `MailerConfig#startTls()`; consumo `EmailExportNotificationService#init` |
| `seedgrid.backup.mailer.username` | `Optional<String>` | texto | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_USERNAME:}` (vazio) | Não (depende do SMTP) | Usuário SMTP | E-mail | `password` | Runtime | BC `MailerConfig#username()`; consumo `EmailExportNotificationService#init` |
| 🔒 `seedgrid.backup.mailer.password` | `Optional<String>` | texto | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_PASSWORD:}` (vazio) | Não (depende do SMTP) | Senha SMTP | E-mail | `username` | Runtime | BC `MailerConfig#password()`; consumo `EmailExportNotificationService#init` |
| `seedgrid.backup.mailer.auth-methods` | `Optional<String>` | métodos SMTP AUTH separados por espaço | interface: —; MP: `${SEEDGRID_BACKUP_MAILER_AUTH_METHODS:PLAIN LOGIN}`; código: ausente/branco → `PLAIN LOGIN` | Não | Fixa os métodos de AUTH (evita XOAUTH2 automático do Vert.x com Gmail, que derruba o socket com 535) | E-mail | — | Runtime | BC `MailerConfig#authMethods()`; consumo `EmailExportNotificationService#init` |

> ⚠️ **Confirmado pelo código + MP**: como `from` e `host` têm fallback no MP, `isEnabled()` é `true` por padrão — o mail client é criado contra `smtp.gmail.com` sem credenciais e o scheduler tentará enviar (e falhar, registrando `notificationError`) até `max-retries`. Para hosts sem SMTP: `seedgrid.backup.notification.enabled=false` ou fornecer um `ExportNotificationService` próprio.

### 2.4 CSV (exporter `CSV_ZIP`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.backup.csv.delimiter` | String | só o 1º caractere é usado no CSV | `,` | Não | Delimitador (`charAt(0)`); string inteira gravada no manifest (`csvOptions.delimiter`) | `CSV_ZIP` | — | Runtime | BC `CsvConfig#delimiter()`; consumo `CsvZipExporter#generateCsv`, `#buildManifest` |
| `seedgrid.backup.csv.quote-char` | String | só o 1º caractere é usado | `"` | Não | Caractere de aspas; também gravado no manifest | `CSV_ZIP` | — | Runtime | BC `CsvConfig#quoteChar()`; consumo `CsvZipExporter#generateCsv`, `#buildManifest` |
| `seedgrid.backup.csv.encoding` | String | nome de charset Java (ex. `UTF-8`, `ISO-8859-1`) | `UTF-8` | Não | Encoding dos bytes de cada `data/<tabela>.csv` | `CSV_ZIP` | — | Runtime | BC `CsvConfig#encoding()`; consumo `CsvZipExporter#generateCsvFiles` |

### 2.5 Storage (repassado ao `seedgrid-filemanagement`)

Cada chave é copiada para o `Map<String,String>` de config do storage (nome da chave do mapa entre parênteses) em **buildStorageConfig**, somente quando `storage` (ou o tipo do `storageKey`) corresponde ao backend. A validação/uso final é feita pelas factories do filemanagement (`java/seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/*StorageFactory#create`), que lançam `StorageConfigurationException` na primeira gravação/leitura quando falta chave obrigatória — **Confirmado**. Ver [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração do filemanagement]].

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.backup.filesystem.base-path` | String | caminho de diretório | `/var/seedgrid/files` (BC; MP: `${SEEDGRID_BACKUP_FILESYSTEM_BASE:/var/seedgrid/files}`) | Não (tem padrão; vazio → erro) | (`base-path`) diretório raiz, criado se não existir (precisa ser gravável); artefatos vão em `<schema>/exports/` | `storage=filesystem` | `storage` | Runtime | BC `FilesystemConfig#basePath()`; consumo buildStorageConfig |
| `seedgrid.backup.s3.bucket` | `Optional<String>` | nome de bucket | — | Condicional (`storage=s3`) | (`bucket`) | `storage=s3` | `storage` | Runtime | BC `S3Config#bucket()`; consumo buildStorageConfig |
| `seedgrid.backup.s3.region` | `Optional<String>` | região AWS | — (factory: `us-east-1`) | Não | (`region`) | `storage=s3` | — | Runtime | BC `S3Config#region()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.s3.access-key` | `Optional<String>` | texto | — | Não (sem o par access/secret usa a cadeia padrão de credenciais do AWS SDK) | (`access-key`) | `storage=s3` | `secret-key` | Runtime | BC `S3Config#accessKey()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.s3.secret-key` | `Optional<String>` | texto | — | Não (idem) | (`secret-key`) | `storage=s3` | `access-key` | Runtime | BC `S3Config#secretKey()`; consumo buildStorageConfig |
| `seedgrid.backup.s3.endpoint` | `Optional<String>` | URL | — | Não | (`endpoint`) endpoint S3-compatível | `storage=s3` | — | Runtime | BC `S3Config#endpoint()`; consumo buildStorageConfig |
| `seedgrid.backup.minio.bucket` | `Optional<String>` | nome de bucket | — (MP: `${SEEDGRID_BACKUP_MINIO_BUCKET:}`) | Condicional (`storage=minio`) | (`bucket`) | `storage=minio` | `storage` | Runtime | BC `MinioConfig#bucket()`; consumo buildStorageConfig |
| `seedgrid.backup.minio.region` | `Optional<String>` | região | interface: —; MP: `${SEEDGRID_BACKUP_MINIO_REGION:us-east-1}` (factory também usa `us-east-1`) | Não | (`region`) | `storage=minio` | — | Runtime | BC `MinioConfig#region()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.minio.access-key` | `Optional<String>` | texto | — (MP: `${SEEDGRID_BACKUP_MINIO_ACCESS_KEY:}`) | Condicional (`storage=minio`) | (`access-key`) | `storage=minio` | `secret-key` | Runtime | BC `MinioConfig#accessKey()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.minio.secret-key` | `Optional<String>` | texto | — (MP: `${SEEDGRID_BACKUP_MINIO_SECRET_KEY:}`) | Condicional (`storage=minio`) | (`secret-key`) | `storage=minio` | `access-key` | Runtime | BC `MinioConfig#secretKey()`; consumo buildStorageConfig |
| `seedgrid.backup.minio.endpoint` | `Optional<String>` | URL | — (MP: `${SEEDGRID_BACKUP_MINIO_ENDPOINT:}`) | Condicional (`storage=minio`) | (`endpoint`) | `storage=minio` | — | Runtime | BC `MinioConfig#endpoint()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.azure-blob.connection-string` | `Optional<String>` | connection string Azure | — | Condicional (opção 1, alternativa a account-name+key) | (`connection-string`) | `storage=azure-blob` | `account-name`/`account-key` | Runtime | BC `AzureBlobConfig#connectionString()`; consumo buildStorageConfig |
| `seedgrid.backup.azure-blob.container` | `Optional<String>` | nome de container | — | Condicional (`storage=azure-blob`) | (`container`) | `storage=azure-blob` | — | Runtime | BC `AzureBlobConfig#container()`; consumo buildStorageConfig |
| `seedgrid.backup.azure-blob.account-name` | `Optional<String>` | texto | — | Condicional (opção 2) | (`account-name`) | `storage=azure-blob` | `account-key` | Runtime | BC `AzureBlobConfig#accountName()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.azure-blob.account-key` | `Optional<String>` | texto | — | Condicional (opção 2) | (`account-key`) | `storage=azure-blob` | `account-name` | Runtime | BC `AzureBlobConfig#accountKey()`; consumo buildStorageConfig |
| `seedgrid.backup.google-drive.root-folder-id` | `Optional<String>` | ID de pasta | — | Condicional (`storage=google-drive`) | (`root-folder-id`) | `storage=google-drive` | — | Runtime | BC `GoogleDriveConfig#rootFolderId()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.google-drive.credentials-file` | `Optional<String>` | caminho de JSON de service account | — | Condicional (opção 1) | (`credentials-file`) | `storage=google-drive` | `credentials-json` | Runtime | BC `GoogleDriveConfig#credentialsFile()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.google-drive.credentials-json` | `Optional<String>` | JSON | — | Condicional (opção 2) | (`credentials-json`) | `storage=google-drive` | `credentials-file` | Runtime | BC `GoogleDriveConfig#credentialsJson()`; consumo buildStorageConfig |
| `seedgrid.backup.onedrive.client-id` | `Optional<String>` | texto | — | Condicional (`storage=onedrive`) | (`client-id`) | `storage=onedrive` | — | Runtime | BC `OnedriveConfig#clientId()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.onedrive.client-secret` | `Optional<String>` | texto | — | Condicional (`storage=onedrive`) | (`client-secret`) | `storage=onedrive` | — | Runtime | BC `OnedriveConfig#clientSecret()`; consumo buildStorageConfig |
| `seedgrid.backup.onedrive.tenant-id` | `Optional<String>` | tenant Azure AD | — | Condicional (`storage=onedrive`) | (`tenant-id`) | `storage=onedrive` | — | Runtime | BC `OnedriveConfig#tenantId()`; consumo buildStorageConfig |
| `seedgrid.backup.onedrive.root-folder-path` | String | caminho | `/seedgrid/files` | Não | (`root-folder-path`) sempre enviado | `storage=onedrive` | — | Runtime | BC `OnedriveConfig#rootFolderPath()`; consumo buildStorageConfig |
| `seedgrid.backup.gcs.bucket` | `Optional<String>` | bucket | — | Condicional (`storage=gcs`) | (`bucket`) | `storage=gcs` | — | Runtime | BC `GcsConfig#bucket()`; consumo buildStorageConfig |
| `seedgrid.backup.gcs.project-id` | `Optional<String>` | projeto GCP | — | Condicional (`storage=gcs`) | (`project-id`) | `storage=gcs` | — | Runtime | BC `GcsConfig#projectId()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.gcs.credentials-file` | `Optional<String>` | caminho | — | Não (opcional; a factory não exige credenciais) | (`credentials-file`) | `storage=gcs` | `credentials-json` | Runtime | BC `GcsConfig#credentialsFile()`; consumo buildStorageConfig |
| 🔒 `seedgrid.backup.gcs.credentials-json` | `Optional<String>` | JSON | — | Não (opcional, alternativa a `credentials-file`) | (`credentials-json`) | `storage=gcs` | `credentials-file` | Runtime | BC `GcsConfig#credentialsJson()`; consumo buildStorageConfig |

Total de propriedades públicas: **46** (6 execução + 4 notificação + 7 mailer + 3 CSV + 26 storage).

### 2.6 Variáveis de ambiente

| Fonte | Variável | Propriedade |
|---|---|---|
| Alias explícito no MP (Confirmado) | `SEEDGRID_BACKUP_STORAGE` | `seedgrid.backup.storage` |
| Alias explícito no MP (Confirmado) | `SEEDGRID_BACKUP_FILESYSTEM_BASE` (**sem** `_PATH`) | `seedgrid.backup.filesystem.base-path` |
| Alias explícito no MP (Confirmado) | `SEEDGRID_BACKUP_MINIO_BUCKET`, `_REGION`, `_ACCESS_KEY`, `_SECRET_KEY`, `_ENDPOINT` | `seedgrid.backup.minio.*` |
| Alias explícito no MP (Confirmado) | `SEEDGRID_BACKUP_MAILER_FROM`, `_HOST`, `_PORT`, `_START_TLS`, `_USERNAME`, `_PASSWORD`, `_AUTH_METHODS` | `seedgrid.backup.mailer.*` |
| Regra MicroProfile (Inferência) | ex.: `SEEDGRID_BACKUP_RETENTION_DAYS`, `SEEDGRID_BACKUP_MAX_CONCURRENT_EXPORTS`, `SEEDGRID_BACKUP_ASYNC_ENABLED` | chaves de um único segmento após o prefixo |

Para chaves com hífen em grupo (`azure-blob.*`, `google-drive.*`) a forma env (`SEEDGRID_BACKUP_AZURE_BLOB_ACCOUNT_KEY`) é ambígua entre `.` e `-`; a resolução depende do SmallRye casar com o nome do mapping — **Não confirmado**. O MP sugere (comentado) env vars de terceiros como `AWS_ACCESS_KEY_ID`, `AZURE_STORAGE_CONNECTION_STRING`, `GOOGLE_DRIVE_CREDENTIALS_JSON`, `ONEDRIVE_CLIENT_SECRET`, `GCS_CREDENTIALS_JSON`; elas **só valem se o host copiar** essas linhas (estão comentadas).

## 3. Propriedades de frameworks / outras extensões

### 3.1 Definidas pela extensão no `microprofile-config.properties` (ordinal 100 — o host pode sobrescrever)

> **Migrations por código (na `main` do `extensions` em 2026-10-27; vale a partir da próxima versão publicada).** A `backup` migra a si mesma, como `cities`, `ai-pricing`, `exchange`, `business-days` e `notification`: classe `BackupMigrations` (`LOCATION`, `HISTORY_TABLE`, `migrate(DataSource[, schema])`), runner no startup (sem customizer: migra só pelo runner). Ela **não define** `quarkus.flyway.table|locations|migrate-at-start|baseline-*`, e o host não lista `db/migration/backup` no `quarkus.flyway.locations`. Histórico próprio: `sg_flyway_schema_history_backup`; a `flyway_schema_history` do host não muda. A única propriedade é `seedgrid.migrations.host-managed` (padrão `false`; `true` = o host migra chamando `migrate(...)` e o runner não age). Não existe `seedgrid.backup.migrations.enabled`.
>
> **Regra obrigatória para o host (quebra de compatibilidade):** aponte `quarkus.flyway.locations` para a pasta do próprio host (ex.: `classpath:db/migration/app`) e **nunca deixe o padrão `db/migration`**. O padrão varre as subpastas das extensions (`db/migration/security`, `/billing`, `/cities`...) e as migra de novo na `flyway_schema_history` do host; a migração da extension então falha com "tabela já existe" ou "ON CONFLICT sem constraint". Host sem migrations próprias também precisa da propriedade (a pasta pode nem existir). Host com migrations soltas em `db/migration/V1__...` deve movê-las para uma subpasta (ex.: `db/migration/app`).
>
> **Ordem:** o Quarkus não ordena os `FlywayConfigurationCustomizer`, então a ordem entre extensions vem de dependência no código: `BillingMigrations.migrate` e `ApiKeysMigrations.migrate` chamam `SecurityMigrations.migrate` antes (idempotente). No startup, os runners (`XxxMigrationRunner`) seguem o `@Priority` do CDI: security 10, audit 20, backup 30, billing 40, apikeys 50, cities 100. Só security, billing e apikeys têm customizer (migram antes do Flyway do host, que pode ter FK nas tabelas delas); audit e backup migram só pelo runner. A `backup` não depende da `security` por artefato, mas a migration o seed `R__backup_seed.sql` usa `sg_permissions`: o host precisa da `security`.

| Propriedade | Valor definido | Observação |
|---|---|---|
| `quarkus.hibernate-orm.database.generation` | `none` | |

### 3.2 Exigidas/relacionadas

| Propriedade | Motivo |
|---|---|
| `quarkus.datasource.*` (PostgreSQL) | entidades `ExportJob`/`ExportArtifact`, `information_schema`; obrigatória no host |
| `seedgrid.ratelimit.export-create.enabled` / `.permits` / `.window` / `.min-spacing` (e demais chaves do rate limiter) | override do `@SgRateLimit(configKey = "export-create", permits = 10, window = 1h)` do `POST /exports`; lidas por `RateLimitService` da extensão resilience — ver [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience]] |
| `seedgrid.filemanagement.*` | config do storage subjacente (o teste define `seedgrid.filemanagement.filesystem.base-path`) — ver [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração do filemanagement]] |

## 4. Propriedades usadas só em testes

`runtime/src/test/resources/application.properties` e `ExportAsyncFlowIT.AsyncEnabledProfile#getConfigOverrides`:

| Propriedade | Valor | Finalidade |
|---|---|---|
| `quarkus.datasource.db-kind` | `postgresql` | DevServices |
| `quarkus.datasource.devservices.enabled` | `true` | |
| `quarkus.datasource.devservices.image-name` | `postgres:16-alpine` | |
| `quarkus.datasource.devservices.db-name` | `seedgrid_backup` | |
| `quarkus.datasource.username` / `password` | `<SEGREDO:test-db-credentials>` | credenciais locais de teste |
| `quarkus.hibernate-orm.database.generation` | `none` | |
| `quarkus.flyway.schemas` | `public` | |
| `quarkus.http.test-port` | `0` | |
| `quarkus.log.category."br.com.seedgrid".level` | `INFO` | |
| `seedgrid.filemanagement.filesystem.base-path` | `${java.io.tmpdir}/seedgrid-backup-tests` | |
| `seedgrid.backup.storage` | `filesystem` | |
| `seedgrid.backup.filesystem.base-path` | `${java.io.tmpdir}/seedgrid-backup-tests` | |
| `seedgrid.backup.async-enabled` | `false` (override `true` em `ExportAsyncFlowIT`) | execução determinística |
| `quarkus.index-dependency.seedgrid-filemanagement.group-id` / `.artifact-id` | `br.com.seedgrid` / `seedgrid-filemanagement` | indexar beans do filemanagement |
| `quarkus.arc.exclude-types` | storages cloud do filemanagement (+ `TestTenantProvider` em `ExportAsyncFlowIT`) | evitar dependências cloud |

## 5. Aliases, obsoletas, renomeações

- Alias de env `SEEDGRID_BACKUP_FILESYSTEM_BASE` (nome diferente do padrão MicroProfile `..._BASE_PATH`). **Confirmado** (MP).
- Nenhuma propriedade obsoleta/renomeada encontrada.

## 6. Configuração mínima (`application.properties`)

```properties
# Datasource PostgreSQL do host (obrigatório)
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=jdbc:postgresql://<host>:5432/<db>
quarkus.datasource.username=<usuario>
quarkus.datasource.password=<SEGREDO:db-password>

# Storage local (padrão filesystem)
seedgrid.backup.filesystem.base-path=/var/seedgrid/files

# Sem SMTP configurado: desligue a notificação para não tentar smtp.gmail.com
seedgrid.backup.notification.enabled=false
```

## 7. Configuração completa comentada

```properties
# ---------- Execução ----------
# filesystem | s3 | minio | azure-blob | google-drive | onedrive | gcs
seedgrid.backup.storage=filesystem
# true: thread daemon por job; false: só o scheduler de fila executa
seedgrid.backup.async-enabled=true
# teto global de jobs RUNNING usado pelo scheduler de fila
seedgrid.backup.max-concurrent-exports=1
# intervalo do scheduler de fila (Quarkus Scheduler: 30s, 5m, PT30S...)
seedgrid.backup.queue-poll-interval=30s
# dias até expirar o artefato (limpeza diária às 00:01)
seedgrid.backup.retention-days=7
# prefixos de pacote de entidades fora do export DOMAIN (lista separada por vírgula)
seedgrid.backup.excluded-domain-entity-packages=<pacote.a>,<pacote.b>

# ---------- Notificação ----------
seedgrid.backup.notification.enabled=true
seedgrid.backup.notification.poll-interval=5m
seedgrid.backup.notification.max-retries=3
seedgrid.backup.notification.retry-delay=PT15M

# ---------- Mailer (Vert.x Mail) ----------
seedgrid.backup.mailer.from=<remetente@dominio>
seedgrid.backup.mailer.host=<smtp.host>
seedgrid.backup.mailer.port=587
# REQUIRED | OPTIONAL | DISABLED
seedgrid.backup.mailer.start-tls=REQUIRED
seedgrid.backup.mailer.username=<usuario-smtp>
seedgrid.backup.mailer.password=<SEGREDO:smtp-password>
seedgrid.backup.mailer.auth-methods=PLAIN LOGIN

# ---------- CSV ----------
seedgrid.backup.csv.delimiter=,
seedgrid.backup.csv.quote-char="
seedgrid.backup.csv.encoding=UTF-8

# ---------- Storage: filesystem ----------
seedgrid.backup.filesystem.base-path=/var/seedgrid/files

# ---------- Storage: s3 ----------
seedgrid.backup.s3.bucket=<bucket>
seedgrid.backup.s3.region=<regiao>
seedgrid.backup.s3.access-key=<SEGREDO:s3-access-key>
seedgrid.backup.s3.secret-key=<SEGREDO:s3-secret-key>
seedgrid.backup.s3.endpoint=<url-opcional>

# ---------- Storage: minio ----------
seedgrid.backup.minio.bucket=<bucket>
seedgrid.backup.minio.region=us-east-1
seedgrid.backup.minio.access-key=<SEGREDO:minio-access-key>
seedgrid.backup.minio.secret-key=<SEGREDO:minio-secret-key>
seedgrid.backup.minio.endpoint=<url-minio>

# ---------- Storage: azure-blob (connection-string OU account-name+account-key) ----------
seedgrid.backup.azure-blob.connection-string=<SEGREDO:azure-connection-string>
seedgrid.backup.azure-blob.container=<container>
seedgrid.backup.azure-blob.account-name=<conta>
seedgrid.backup.azure-blob.account-key=<SEGREDO:azure-account-key>

# ---------- Storage: google-drive (credentials-file OU credentials-json) ----------
seedgrid.backup.google-drive.root-folder-id=<folder-id>
seedgrid.backup.google-drive.credentials-file=<caminho/service-account.json>
seedgrid.backup.google-drive.credentials-json=<SEGREDO:google-drive-credentials-json>

# ---------- Storage: onedrive ----------
seedgrid.backup.onedrive.client-id=<client-id>
seedgrid.backup.onedrive.client-secret=<SEGREDO:onedrive-client-secret>
seedgrid.backup.onedrive.tenant-id=<tenant-id>
seedgrid.backup.onedrive.root-folder-path=/seedgrid/files

# ---------- Storage: gcs (credentials-file OU credentials-json) ----------
seedgrid.backup.gcs.bucket=<bucket>
seedgrid.backup.gcs.project-id=<projeto>
seedgrid.backup.gcs.credentials-file=<caminho/service-account.json>
seedgrid.backup.gcs.credentials-json=<SEGREDO:gcs-credentials-json>

# ---------- Rate limit do POST /exports (extensão resilience) ----------
seedgrid.ratelimit.export-create.permits=10
seedgrid.ratelimit.export-create.window=PT1H
```

## 8. Receitas

**Execução só pela fila (sem threads ad hoc), 2 jobs simultâneos no máximo**
```properties
seedgrid.backup.async-enabled=false
seedgrid.backup.max-concurrent-exports=2
seedgrid.backup.queue-poll-interval=15s
```

**MinIO via variáveis de ambiente (aliases do MP)**
```
SEEDGRID_BACKUP_STORAGE=minio
SEEDGRID_BACKUP_MINIO_ENDPOINT=<url-minio>
SEEDGRID_BACKUP_MINIO_BUCKET=<bucket>
SEEDGRID_BACKUP_MINIO_ACCESS_KEY=<SEGREDO:minio-access-key>
SEEDGRID_BACKUP_MINIO_SECRET_KEY=<SEGREDO:minio-secret-key>
```

**E-mail de "backup pronto" via SMTP corporativo**
```properties
seedgrid.backup.mailer.from=<backup@dominio>
seedgrid.backup.mailer.host=<smtp.dominio>
seedgrid.backup.mailer.port=587
seedgrid.backup.mailer.start-tls=REQUIRED
seedgrid.backup.mailer.username=<usuario>
seedgrid.backup.mailer.password=<SEGREDO:smtp-password>
```

**Auditoria em MongoDB, entidades JPA do audit-postgresql no classpath**
```properties
seedgrid.backup.excluded-domain-entity-packages=br.com.seedgrid.audit.postgresql.entities
```
(pacote das entidades JPA do módulo `seedgrid-audit-postgresql`: `AuditLogEntity`, `AuditLogEntitiesEntity`, `AuditLogUsersEntity`)

**Retenção de 30 dias e CSV para Excel pt-BR**
```properties
seedgrid.backup.retention-days=30
seedgrid.backup.csv.delimiter=;
seedgrid.backup.csv.encoding=ISO-8859-1
```

## 9. Dúvidas e lacunas

- `queue-poll-interval`/`notification.poll-interval` são `String` sem validação na interface; formatos aceitos são os do Quarkus Scheduler (`every`). Aceitação de `off`/`disabled` para desligar o trigger: **Não confirmado** nesta versão.
- `max-concurrent-exports` não limita jobs disparados diretamente com `async-enabled=true` (Confirmado pela leitura; impacto em carga não testado).
- O MP da extensão define `quarkus.flyway.*` para a datasource default — interação com hosts que usam várias extensões SeedGrid com Flyway não verificada.
