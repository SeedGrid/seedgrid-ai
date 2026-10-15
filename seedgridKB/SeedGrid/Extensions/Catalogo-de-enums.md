---
tags: [seedgrid, enum, catalogo]
analisado-em: 2026-10-14
gerado-por: scripts/kb-catalogs.mjs --only enums
gerado-de: notas Enums (Java) e seção Enums das notas Rust/Visao-geral desta vault
---

# Catálogo de enums

Todos os enums públicos documentados, por extension. Cada linha leva à seção do enum na nota `Enums` (Java) ou `Rust`/`Visao-geral` (seção "Enums"), com significado de cada valor, onde é tratado, serialização (JSON, config, banco) e divergências Java × Rust. Valores que existem no enum mas nenhum código trata estão marcados nas notas.

Como ler: **Quarkus** = enum Java; **Rust** = enum do crate equivalente (variantes e grafia de serde podem diferir — veja a nota). Esta nota é **gerada** (`node scripts/kb-catalogs.mjs --only enums --write`) a partir das próprias notas; "—" em Valores = a nota não lista as variantes.

| Enum | Plataforma | Extension | Valores | Usado em | Nota |
|---|---|---|---|---|---|
| `ApiKeyAuthType` | Quarkus | apikeys | API_KEY | ApiKeyPrincipal#getAuthType(), atributo apikey.authType da SecurityIdentity | [[SeedGrid/Extensions/apikeys/Enums#ApiKeyAuthType\|apikeys/ApiKeyAuthType]] |
| `ApiKeyAuthType` | Rust | apikeys | ApiKey | ApiKeyPrincipal; atributo apikey.authType da identity | [[SeedGrid/Extensions/apikeys/Rust#ApiKeyAuthType\|apikeys/ApiKeyAuthType]] |
| `ApiKeyError` | Rust | apikeys | Unauthorized, AuthenticationFailed, Expired, Revoked, NotFound, RoleNotFound, OwnerNotFound, ManagementDisabled, RoleNotAllowed, Forbidden, BadRequest, Generation, Database, Internal | erro de serviços/handlers, resposta RFC 7807 | [[SeedGrid/Extensions/apikeys/Rust#ApiKeyError\|apikeys/ApiKeyError]] |
| `ManagementIdentity` | Rust | apikeys | ApiKey, Human | credencial aceita pelas rotas de gestão | [[SeedGrid/Extensions/apikeys/Rust#ManagementIdentity\|apikeys/ManagementIdentity]] |
| `AuditOperationEnum` | Quarkus | audit | CREATE, UPDATE, DELETE, READ, OTHER | @Audit(operation), AuditLog.operation, query param operation de GET /audit-logs, coluna audit_log.operation, campo Mongo operation | [[SeedGrid/Extensions/audit/Enums#AuditOperationEnum\|audit/AuditOperationEnum]] |
| `AuditPersistenceStrategy` | Quarkus | audit | MONGODB, JPA | propriedade seedgrid.audit.persistence.strategy, SPI AuditPersistenceProvider#strategy() | [[SeedGrid/Extensions/audit/Enums#AuditPersistenceStrategy\|audit/AuditPersistenceStrategy]] |
| `AuditError` | Rust | audit | NotFound, OutOfScope, Forbidden, Config, Json, Internal, Database, Mongo | definido em src/error.rs | [[SeedGrid/Extensions/audit/Rust#AuditError\|audit/AuditError]] |
| `AuditOperation` | Rust | audit | Create, Update, Delete, Read, Other | definido em src/models.rs | [[SeedGrid/Extensions/audit/Rust#AuditOperation\|audit/AuditOperation]] |
| `AuditPersistenceStrategy` | Rust | audit | Jpa, Mongodb | definido em src/config.rs | [[SeedGrid/Extensions/audit/Rust#AuditPersistenceStrategy\|audit/AuditPersistenceStrategy]] |
| `BackupFormat` | Quarkus | backup | CSV_ZIP, SQL_DUMP_ZIP | ExportRequest.format, ExportResponse.format, ExportJob.format (export_jobs.format), SPI BackupExporter#format() | [[SeedGrid/Extensions/backup/Enums#BackupFormat\|backup/BackupFormat]] |
| `ExportArtifact.ArtifactType` | Quarkus | backup | ZIP, MANIFEST, CHECKSUMS, LOG | ExportArtifact.artifactType (export_artifacts.artifact_type), ExportResponse.artifacts[].type | [[SeedGrid/Extensions/backup/Enums#ExportArtifact.ArtifactType\|backup/ExportArtifact.ArtifactType]] |
| `ExportScope` | Quarkus | backup | DOMAIN, RAW, CUSTOM | ExportRequest.scope, ExportResponse.scope, ExportJob.scope (export_jobs.scope), ExportContext.getScope() (SPI) | [[SeedGrid/Extensions/backup/Enums#ExportScope\|backup/ExportScope]] |
| `ExportStatus` | Quarkus | backup | REQUESTED, QUEUED, RUNNING, DONE, DONE_NOTIFIED, FAILED, EXPIRED, CANCELLED | ExportJob.status (coluna export_jobs.status), ExportResponse.status, ExportJobRepository | [[SeedGrid/Extensions/backup/Enums#ExportStatus\|backup/ExportStatus]] |
| `ArtifactType` | Rust | backup | Zip, Manifest, Checksums, Log | definido em src/enums.rs | [[SeedGrid/Extensions/backup/Rust#ArtifactType\|backup/ArtifactType]] |
| `BackupFormat` | Rust | backup | CsvZip, SqlDumpZip | definido em src/enums.rs | [[SeedGrid/Extensions/backup/Rust#BackupFormat\|backup/BackupFormat]] |
| `ExportError` | Rust | backup | Export, Validation, Retrieval, Checksum, Storage, Database, Serde, Io | definido em src/error.rs | [[SeedGrid/Extensions/backup/Rust#ExportError\|backup/ExportError]] |
| `ExportScope` | Rust | backup | Domain, Raw, Custom | definido em src/enums.rs | [[SeedGrid/Extensions/backup/Rust#ExportScope\|backup/ExportScope]] |
| `ExportStatus` | Rust | backup | Requested, Queued, Running, Done, DoneNotified, Failed, Expired, Cancelled | definido em src/enums.rs | [[SeedGrid/Extensions/backup/Rust#ExportStatus\|backup/ExportStatus]] |
| `AccountHistoryType` | Quarkus | billing | ACTIVATED, UPGRADED, DOWNGRADE_SCHEDULED, DOWNGRADE_CANCELED, CANCELLATION_REQUESTED, CANCELED, REACTIVATED, PAST_DUE, TRIAL_ENDED, UNITS_GRANTED, TRIAL_EXTENDED | billing_account_history.type; AccountHistoryResponse.type (String) | [[SeedGrid/Extensions/billing/Enums#AccountHistoryType\|billing/AccountHistoryType]] |
| `AccountStatus` | Quarkus | billing | PENDING_EMAIL_VERIFICATION, ACTIVE, SUSPENDED | accounts.status | [[SeedGrid/Extensions/billing/Enums#AccountStatus\|billing/AccountStatus]] |
| `AggregationFormula` | Quarkus | billing | SUM, COUNT, LAST | CreateMeterRequest.aggregation | [[SeedGrid/Extensions/billing/Enums#AggregationFormula\|billing/AggregationFormula]] |
| `BillingEventType` | Quarkus | billing | CHECKOUT_COMPLETED, PAYMENT_CONFIRMED, PAYMENT_FAILED, SUBSCRIPTION_CREATED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_CANCELED, REFUND_CREATED, DISPUTE_OPENED | BillingEvent.type (SPIs), billing_events.type | [[SeedGrid/Extensions/billing/Enums#BillingEventType\|billing/BillingEventType]] |
| `PurchaseStatus` | Quarkus | billing | PENDING, PAID, FAILED, REFUNDED | billing_purchases.status | [[SeedGrid/Extensions/billing/Enums#PurchaseStatus\|billing/PurchaseStatus]] |
| `RecurringInterval` | Quarkus | billing | DAY, WEEK, MONTH, YEAR | CreatePriceRequest, CreateMeteredPriceRequest, PriceInfo | [[SeedGrid/Extensions/billing/Enums#RecurringInterval\|billing/RecurringInterval]] |
| `SubscriptionLifecycleEvent.Type` | Quarkus | billing | ACTIVATED, UPGRADED, DOWNGRADE_SCHEDULED, DOWNGRADE_CANCELED, CANCELLATION_REQUESTED, CANCELED, REACTIVATED, PAST_DUE, TRIAL_ENDED | evento CDI e códigos billing.* | [[SeedGrid/Extensions/billing/Enums#SubscriptionLifecycleEvent.Type\|billing/SubscriptionLifecycleEvent.Type]] |
| `SubscriptionStatus` | Quarkus | billing | ACTIVE, PAST_DUE, INACTIVE, CANCELED | tenant_subscriptions.status, AdminSubscriptionRequest.status | [[SeedGrid/Extensions/billing/Enums#SubscriptionStatus\|billing/SubscriptionStatus]] |
| `TiersMode` | Quarkus | billing | GRADUATED, VOLUME | CreateMeteredPriceRequest.tiersMode | [[SeedGrid/Extensions/billing/Enums#TiersMode\|billing/TiersMode]] |
| `UserAccessEvent.Type` | Quarkus | billing | LOSS_SCHEDULED, LOSS_APPLIED, RESTORED | evento CDI e e-mails de acesso | [[SeedGrid/Extensions/billing/Enums#UserAccessEvent.Type\|billing/UserAccessEvent.Type]] |
| `AggregationFormula` | Rust | billing | SUM, COUNT, LAST | definido em src/dtos.rs | [[SeedGrid/Extensions/billing/Rust#RecurringInterval / AggregationFormula / TiersMode\|billing/AggregationFormula]] |
| `BillingError` | Rust | billing | Unsupported, InvalidWebhook, UnsupportedEvent, Provider, Forbidden, Config, Json, Database, Internal | definido em src/error.rs | [[SeedGrid/Extensions/billing/Rust#BillingError\|billing/BillingError]] |
| `BillingEventType` | Rust | billing | CheckoutCompleted, PaymentConfirmed, PaymentFailed, SubscriptionCreated, SubscriptionUpdated, SubscriptionCanceled, RefundCreated, DisputeOpened | definido em src/domain.rs | [[SeedGrid/Extensions/billing/Rust#BillingEventType\|billing/BillingEventType]] |
| `HttpMethod` | Rust | billing | Get, Post, Delete | definido em src/stripe/transport.rs | [[SeedGrid/Extensions/billing/Rust#Enums\|billing/HttpMethod]] |
| `RecurringInterval` | Rust | billing | DAY, WEEK, MONTH, YEAR | definido em src/dtos.rs | [[SeedGrid/Extensions/billing/Rust#RecurringInterval / AggregationFormula / TiersMode\|billing/RecurringInterval]] |
| `TiersMode` | Rust | billing | GRADUATED, VOLUME | definido em src/dtos.rs | [[SeedGrid/Extensions/billing/Rust#RecurringInterval / AggregationFormula / TiersMode\|billing/TiersMode]] |
| `BackendKind` | Rust | broker | Memory, Redis, Nats, RabbitMq | definido em crates/seedgrid-broker-spi/src/lib.rs | [[SeedGrid/Extensions/broker/Visao-geral#Enums\|broker/BackendKind]] |
| `CacheProviderFailSoft.Level` | Quarkus | cache | WARN, ERROR | tipo lógico da propriedade seedgrid.cache.if-provider-is-down | [[SeedGrid/Extensions/cache/Enums#Level\|cache/CacheProviderFailSoft.Level]] |
| `CacheBackend` | Rust | cache | InMemory, Distributed | definido em src/factory.rs | [[SeedGrid/Extensions/cache/Rust#Enums\|cache/CacheBackend]] |
| `CacheError` | Rust | cache | LockNotAcquired, Backend, Other | definido em src/error.rs | [[SeedGrid/Extensions/cache/Rust#Enums\|cache/CacheError]] |
| `DistributedFlavor` | Rust | cache | Redis, Valkey, Dragonfly | definido em src/redis_backend.rs | [[SeedGrid/Extensions/cache/Rust#Enums\|cache/DistributedFlavor]] |
| `LockGuard` | Rust | cache | InMemory, Distributed | definido em src/provider.rs | [[SeedGrid/Extensions/cache/Rust#Enums\|cache/LockGuard]] |
| `ProviderDownLog` | Rust | cache | Warn, Error | definido em src/config.rs | [[SeedGrid/Extensions/cache/Rust#ProviderDownLog\|cache/ProviderDownLog]] |
| `ProblemType` | Quarkus | commons | DADOS_INVALIDOS, ERRO_DE_SISTEMA, PARAMETRO_INVALIDO, MENSAGEM_INCOMPREENSIVEL, RECURSO_NAO_ENCONTRADO, ENTIDADE_EM_USO, ERRO_NEGOCIO, OBRIGATORIO_TROCA_DE_SENHA, ACESSO_NEGADO, ERRO_AO_ENVIAR_O_EMAIL, OPERACAO_NAO_PERMITIDA, AUTENTICACAO_NEGADA, SISTEMA_INDISPONIVEL, RECURSO_NAO_SUPORTADO | campo type do Problem Details | [[SeedGrid/Extensions/commons/Enums#ProblemType\|commons/ProblemType]] |
| `StateEnum` | Quarkus | commons | AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO | Address.state (coluna), DTOs de cadastro de outras extensions | [[SeedGrid/Extensions/commons/Enums#StateEnum\|commons/StateEnum]] |
| `StateEnum.Regiao` | Quarkus | commons | NORTE, NORDESTE, CENTRO_OESTE, SUDESTE, SUL | atributo regiao de StateEnum | [[SeedGrid/Extensions/commons/Enums#StateEnum.Regiao\|commons/StateEnum.Regiao]] |
| `CurrencyExchangeRateStatus` | Quarkus | exchange | SUCCESS, FAILED, MANUAL | coluna currency_exchange_rates.status; respostas de /admin/currency-exchange-rates | [[SeedGrid/Extensions/exchange/Enums#CurrencyExchangeRateStatus\|exchange/CurrencyExchangeRateStatus]] |
| `CnpjSignupStatus` | Quarkus | login-tenancy | AVAILABLE, REGISTERED, PENDING_CONFIRMATION | resposta de GET /public/signup/cnpj-status | [[SeedGrid/Extensions/login-tenancy/Enums#CnpjSignupStatus\|login-tenancy/CnpjSignupStatus]] |
| `FoundationModule` | Quarkus | login-tenancy | BILLING, APIKEYS, BACKUP, FILEMANAGEMENT | LoginTenancyModuleRegistry (bean público), activeModules do status | [[SeedGrid/Extensions/login-tenancy/Enums#FoundationModule\|login-tenancy/FoundationModule]] |
| `SignupRequestStatus` | Quarkus | login-tenancy | PENDING_EMAIL_VERIFICATION, CONFIRMED | coluna signup_request.status; respostas de POST /public/signup, /resend-email, /confirm-email | [[SeedGrid/Extensions/login-tenancy/Enums#SignupRequestStatus\|login-tenancy/SignupRequestStatus]] |
| `CnpjSignupStatus` | Rust | login-tenancy | Available, Registered, PendingConfirmation | GET /public/signup/cnpj-status | [[SeedGrid/Extensions/login-tenancy/Rust#CnpjSignupStatus\|login-tenancy/CnpjSignupStatus]] |
| `FoundationModule` | Rust | login-tenancy | Billing, Apikeys, Backup, Filemanagement | ModuleRegistry; activeModules do status | [[SeedGrid/Extensions/login-tenancy/Rust#FoundationModule\|login-tenancy/FoundationModule]] |
| `LoginTenancyError` | Rust | login-tenancy | CompanyAlreadyExists, SignupRequestPending, SignupRequestNotFound, BadRequest, RequiredRoleMissing, TemplateProcessing, Crypto, Database, Internal | erro dos serviços, resposta RFC 7807 | [[SeedGrid/Extensions/login-tenancy/Rust#LoginTenancyError\|login-tenancy/LoginTenancyError]] |
| `SignupRequestStatus` | Rust | login-tenancy | PendingEmailVerification, Confirmed | coluna signup_request.status; respostas do signup | [[SeedGrid/Extensions/login-tenancy/Rust#SignupRequestStatus\|login-tenancy/SignupRequestStatus]] |
| `StateEnum` | Rust | login-tenancy | AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO | state do AddressDto do signup | [[SeedGrid/Extensions/login-tenancy/Rust#StateEnum\|login-tenancy/StateEnum]] |
| `Channel` | Quarkus | notification | EMAIL, WHATSAPP | NotificationRule#channels, ConditionalRecipient#channel, corpo do PUT /admin/notifications/events/{code}, resposta do GET… | [[SeedGrid/Extensions/notification/Enums#Channel\|notification/Channel]] |
| `CryptoAlgorithm` | Quarkus | privacy | AES_256_GCM | @EncryptedField.cryptoAlgorithm | [[SeedGrid/Extensions/privacy/Enums#CryptoAlgorithm\|privacy/CryptoAlgorithm]] |
| `MaskingStrategy` | Quarkus | privacy | FULL, FORMAT, PARTIAL, HASH, TEMPLATE, REMOVE | @PersonalData.type, @MaskRule.type, PersonalDataMasker.mask, PersonalDataSanitizer | [[SeedGrid/Extensions/privacy/Enums#MaskingStrategy\|privacy/MaskingStrategy]] |
| `SearchAlgorithm` | Quarkus | privacy | HMAC_SHA256 | @EncryptedField.searchAlgorithm | [[SeedGrid/Extensions/privacy/Enums#SearchAlgorithm\|privacy/SearchAlgorithm]] |
| `SearchNormalization` | Quarkus | privacy | NONE, CANONICAL, EMAIL | @EncryptedField.normalize, EncryptedFieldSearch.hashForSearch | [[SeedGrid/Extensions/privacy/Enums#SearchNormalization\|privacy/SearchNormalization]] |
| `CryptoError` | Rust | privacy | — | definido em src/crypto.rs, src/field.rs | [[SeedGrid/Extensions/privacy/Rust#Enums\|privacy/CryptoError]] |
| `FieldError` | Rust | privacy | — | definido em src/crypto.rs, src/field.rs | [[SeedGrid/Extensions/privacy/Rust#Enums\|privacy/FieldError]] |
| `MaskingStrategy` | Rust | privacy | Full, Format, Partial, Hash, Template, Remove | definido em src/masking.rs | [[SeedGrid/Extensions/privacy/Rust#MaskingStrategy\|privacy/MaskingStrategy]] |
| `SearchNormalization` | Rust | privacy | None, Canonical, Email | definido em src/search.rs | [[SeedGrid/Extensions/privacy/Rust#SearchNormalization\|privacy/SearchNormalization]] |
| `CircuitState` | Quarkus | resilience | CLOSED, OPEN, HALF_OPEN | CircuitDecision#state() (retorno do SPI CircuitBreakerStore#allowCall), estado persistido no cache | [[SeedGrid/Extensions/resilience/Enums#CircuitState\|resilience/CircuitState]] |
| `KeyScope` | Quarkus | resilience | METHOD, CLASS, GROUP | @SeedGridRateLimit#scope | [[SeedGrid/Extensions/resilience/Enums#KeyScope\|resilience/KeyScope]] |
| `RateLimitAlgorithm` | Quarkus | resilience | FIXED_WINDOW, TOKEN_BUCKET, SLIDING_WINDOW | @SeedGridRateLimit#algorithm, propriedade seedgrid.ratelimit.{configKey}.algorithm | [[SeedGrid/Extensions/resilience/Enums#RateLimitAlgorithm\|resilience/RateLimitAlgorithm]] |
| `SlidingWindowType` | Quarkus | resilience | COUNT_BASED, TIME_BASED | @SeedGridCircuitBreaker#windowType, CircuitBreakerConfig, propriedade seedgrid.circuitbreaker.{name}.window-type | [[SeedGrid/Extensions/resilience/Enums#SlidingWindowType\|resilience/SlidingWindowType]] |
| `CircuitBreakerError` | Rust | resilience | Open, Inner | definido em src/circuitbreaker/guard.rs | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/CircuitBreakerError]] |
| `CircuitState` | Rust | resilience | Closed, Open, HalfOpen | definido em src/circuitbreaker/enums.rs | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/CircuitState]] |
| `ConfigValue` | Rust | resilience | Bool, Long, Int, Double, Duration, Str | definido em src/config.rs | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/ConfigValue]] |
| `KeyScope` | Rust | resilience | Method, Class, Group | @SeedGridRateLimit#scope | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/KeyScope]] |
| `RateLimitAlgorithm` | Rust | resilience | FixedWindow, TokenBucket, SlidingWindow | definido em src/ratelimiter/enums.rs | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/RateLimitAlgorithm]] |
| `SlidingWindowType` | Rust | resilience | CountBased, TimeBased | @SeedGridCircuitBreaker#windowType, CircuitBreakerConfig, propriedade seedgrid.circuitbreaker.{name}.window-type | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/SlidingWindowType]] |
| `TimeUnit` | Rust | resilience | Millis, Seconds, Minutes, Hours | — | [[SeedGrid/Extensions/resilience/Rust#Enums\|resilience/TimeUnit]] |
| `RunSchedule` | Rust | runtime | Interval, Cron | definido em seedgrid-runtime/src/scheduler.rs | [[SeedGrid/Extensions/runtime/Visao-geral#Enums\|runtime/RunSchedule]] |
| `ScheduleSpec` | Rust | runtime | Cron, Every | definido em seedgrid-runtime/src/registry.rs | [[SeedGrid/Extensions/runtime/Visao-geral#Enums\|runtime/ScheduleSpec]] |
| `EntryRequestOrigin` | Quarkus | security | PUBLIC, INVITE | Coluna entry_requests.origin, self-enter | [[SeedGrid/Extensions/security/Enums#EntryRequestOrigin\|security/EntryRequestOrigin]] |
| `EntryRequestStatus` | Quarkus | security | PENDING_EMAIL, PENDING_APPROVAL, APPROVED, REJECTED, EXPIRED | Coluna entry_requests.status, self-enter, job de limpeza | [[SeedGrid/Extensions/security/Enums#EntryRequestStatus\|security/EntryRequestStatus]] |
| `TwoFactorMethodType` | Quarkus | security | EMAIL, WHATSAPP, TOTP, BACKUP_CODE | Corpo de POST /2f/enable e POST /2f/setup/confirm, resposta de enable, estratégias 2FA, config 2f.allowed-methods (por código textual) | [[SeedGrid/Extensions/security/Enums#TwoFactorMethodType\|security/TwoFactorMethodType]] |
| `UserCreateOptions.Delivery` | Quarkus | security | SECURITY_WELCOME_EMAIL, NONE, CALLBACK | API Java para quem cria usuário por fluxo próprio (UserService#createUser) | [[SeedGrid/Extensions/security/Enums#UserCreateOptions.Delivery\|security/UserCreateOptions.Delivery]] |
| `CredentialDelivery` | Rust | security | SecurityWelcomeEmail, None, Callback | UserCreateOptions.delivery (API de serviço para o host) | [[SeedGrid/Extensions/security/Rust#CredentialDelivery\|security/CredentialDelivery]] |
| `EntryRequestOrigin` | Rust | security | Public, Invite | coluna entry_requests.origin | [[SeedGrid/Extensions/security/Rust#EntryRequestOrigin\|security/EntryRequestOrigin]] |
| `EntryRequestStatus` | Rust | security | PendingEmail, PendingApproval, Approved, Rejected, Expired | coluna entry_requests.status; fluxo de self-enter | [[SeedGrid/Extensions/security/Rust#EntryRequestStatus\|security/EntryRequestStatus]] |
| `SecurityError` | Rust | security | InvalidCredentials, Unauthorized, TokenValidation, Forbidden, NotFound, Conflict, Validation, BadRequest, TwoFactorRequired, Database, Internal | erro de serviços/handlers; corpo RFC 7807 | [[SeedGrid/Extensions/security/Rust#SecurityError\|security/SecurityError]] |
| `TemplateError` | Rust | security | NotFound, CantLoad | retorno de TemplateSecurityProvider | [[SeedGrid/Extensions/security/Rust#TemplateError\|security/TemplateError]] |
| `SignupOutcome` | Quarkus | subdomain-tenancy | CREATED, UPDATED_PENDING | JSON de POST /public/tenants | [[SeedGrid/Extensions/subdomain-tenancy/Enums#SignupOutcome\|subdomain-tenancy/SignupOutcome]] |
| `TenantHealthCode` | Quarkus | subdomain-tenancy | OK, INVALID_TENANT, TENANT_NOT_FOUND, TENANT_INACTIVE, DATABASE_UNREACHABLE, MIGRATION_PENDING, MIGRATION_RUNNING, MIGRATION_FAILED | idem | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantHealthCode\|subdomain-tenancy/TenantHealthCode]] |
| `TenantHealthStatus` | Quarkus | subdomain-tenancy | UP, DOWN, OUT_OF_SERVICE | JSON de GET /internal/health/tenants/{id} | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantHealthStatus\|subdomain-tenancy/TenantHealthStatus]] |
| `TenantMigrationDecision` | Quarkus | subdomain-tenancy | READY, IN_PROGRESS, FAILED | retorno de TenantMigrationCoordinator; JSON de POST /internal/migrations/tenants/{id}/trigger | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantMigrationDecision\|subdomain-tenancy/TenantMigrationDecision]] |
| `TenantMigrationStatus` | Quarkus | subdomain-tenancy | PENDING, READY, MIGRATING, FAILED | coluna tenant_migration_state.status; JSON de /internal/migrations, /internal/health; resposta 503 do gate de login | [[SeedGrid/Extensions/subdomain-tenancy/Enums#TenantMigrationStatus\|subdomain-tenancy/TenantMigrationStatus]] |
| `AssemblyError` | Rust | subdomain-tenancy | Migration | erros | [[SeedGrid/Extensions/subdomain-tenancy/Rust#Enums\|subdomain-tenancy/AssemblyError]] |
| `ProvisioningError` | Rust | subdomain-tenancy | Locked, Db | erros | [[SeedGrid/Extensions/subdomain-tenancy/Rust#Enums\|subdomain-tenancy/ProvisioningError]] |
| `SignupOutcome` | Rust | subdomain-tenancy | Created, UpdatedPending | resposta de POST /public/tenants | [[SeedGrid/Extensions/subdomain-tenancy/Rust#SignupOutcome\|subdomain-tenancy/SignupOutcome]] |
| `StateEnum` | Rust | subdomain-tenancy | AC, …, TO | state do endereço do signup e do tenant | [[SeedGrid/Extensions/subdomain-tenancy/Rust#StateEnum (subdomain-tenancy)\|subdomain-tenancy/StateEnum]] |
| `TenantAccess` | Rust | subdomain-tenancy | Master, Active, Rejected | resultado do gate de tenant no middleware | [[SeedGrid/Extensions/subdomain-tenancy/Rust#TenantAccess\|subdomain-tenancy/TenantAccess]] |
| `TenantHealthCode` | Rust | subdomain-tenancy | Ok, InvalidTenant, TenantNotFound, TenantInactive, DatabaseUnreachable, MigrationPending, MigrationRunning, MigrationFailed | idem | [[SeedGrid/Extensions/subdomain-tenancy/Rust#TenantHealthStatus e TenantHealthCode\|subdomain-tenancy/TenantHealthCode]] |
| `TenantHealthStatus` | Rust | subdomain-tenancy | Up, Down, OutOfService | corpo de GET /internal/health/tenants/{tenantId} | [[SeedGrid/Extensions/subdomain-tenancy/Rust#TenantHealthStatus e TenantHealthCode\|subdomain-tenancy/TenantHealthStatus]] |
| `TenantMigrationDecision` | Rust | subdomain-tenancy | Ready, InProgress, Failed | TenantMigrationOutcome; gate de login | [[SeedGrid/Extensions/subdomain-tenancy/Rust#TenantMigrationDecision\|subdomain-tenancy/TenantMigrationDecision]] |
| `TenantMigrationStatus` | Rust | subdomain-tenancy | Pending, Ready, Migrating, Failed | coluna tenant_migration_state.status; corpo de /internal/migrations/... | [[SeedGrid/Extensions/subdomain-tenancy/Rust#TenantMigrationStatus\|subdomain-tenancy/TenantMigrationStatus]] |
| `TenantServiceError` | Rust | subdomain-tenancy | SubdomainAlreadyExists, CnpjAlreadyExists, TenantNotFound, TenantAlreadyActive, ValidationCodeExpired, Db, OtpGeneration, Provisioning, WeakPassword | erros | [[SeedGrid/Extensions/subdomain-tenancy/Rust#Enums\|subdomain-tenancy/TenantServiceError]] |
| `WhatsAppBlockAction` | Quarkus | whatsapp | BLOCK, UNBLOCK | WhatsAppChatApi#updateBlockStatus | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppBlockAction\|whatsapp/WhatsAppBlockAction]] |
| `WhatsAppEphemeralExpiration` | Quarkus | whatsapp | OFF, ONE_DAY, SEVEN_DAYS, NINETY_DAYS | WhatsAppGroupApi#toggleEphemeral | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppEphemeralExpiration\|whatsapp/WhatsAppEphemeralExpiration]] |
| `WhatsAppGroupAddPrivacyValue` | Quarkus | whatsapp | ALL, CONTACTS, CONTACT_BLACKLIST | WhatsAppPrivacySettings.groupadd | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupAddPrivacyValue\|whatsapp/WhatsAppGroupAddPrivacyValue]] |
| `WhatsAppGroupParticipantAction` | Quarkus | whatsapp | ADD, REMOVE, PROMOTE, DEMOTE | WhatsAppGroupApi#updateParticipants | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupParticipantAction\|whatsapp/WhatsAppGroupParticipantAction]] |
| `WhatsAppGroupSetting` | Quarkus | whatsapp | ANNOUNCEMENT, NOT_ANNOUNCEMENT, LOCKED, UNLOCKED | WhatsAppGroupApi#updateGroupSetting | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupSetting\|whatsapp/WhatsAppGroupSetting]] |
| `WhatsAppLabelAction` | Quarkus | whatsapp | ADD, REMOVE | WhatsAppLabelApi#handleLabel | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppLabelAction\|whatsapp/WhatsAppLabelAction]] |
| `WhatsAppMediaType` | Quarkus | whatsapp | NONE, IMAGE, VIDEO, AUDIO, DOCUMENT | WhatsAppMediaMessageFileDTO, WhatsAppMediaMessageURLDTO | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppMediaType\|whatsapp/WhatsAppMediaType]] |
| `WhatsAppOnlinePrivacyValue` | Quarkus | whatsapp | ALL, MATCH_LAST_SEEN | WhatsAppPrivacySettings.online | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppOnlinePrivacyValue\|whatsapp/WhatsAppOnlinePrivacyValue]] |
| `WhatsAppPresence` | Quarkus | whatsapp | UNAVAILABLE, AVAILABLE, COMPOSING, RECORDING, PAUSED | WhatsAppInstanceManagementApi#setPresence, WhatsAppChatApi#sendPresence | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppPresence\|whatsapp/WhatsAppPresence]] |
| `WhatsAppPrivacyValue` | Quarkus | whatsapp | ALL, CONTACTS, CONTACT_BLACKLIST, NONE | WhatsAppPrivacySettings.profile/status/last | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppPrivacyValue\|whatsapp/WhatsAppPrivacyValue]] |
| `WhatsAppProvider` | Quarkus | whatsapp | DEFAULT, EVOLUTION, OFFICIAL | propriedade seedgrid.whatsapp.api | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppProvider\|whatsapp/WhatsAppProvider]] |
| `WhatsAppReadReceiptsValue` | Quarkus | whatsapp | ALL, NONE | WhatsAppPrivacySettings.readreceipts | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppReadReceiptsValue\|whatsapp/WhatsAppReadReceiptsValue]] |
| `WhatsAppBlockAction` | Rust | whatsapp | Block, Unblock | WhatsAppChatApi#updateBlockStatus | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppBlockAction]] |
| `WhatsAppEphemeralExpiration` | Rust | whatsapp | Off, OneDay, SevenDays, NinetyDays | WhatsAppGroupApi#toggleEphemeral | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppEphemeralExpiration]] |
| `WhatsAppError` | Rust | whatsapp | WhatsApp, IllegalState, Unsupported | — | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppError]] |
| `WhatsAppGroupAddPrivacyValue` | Rust | whatsapp | All, Contacts, ContactBlacklist | WhatsAppPrivacySettings.groupadd | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppGroupAddPrivacyValue]] |
| `WhatsAppGroupParticipantAction` | Rust | whatsapp | Add, Remove, Promote, Demote | WhatsAppGroupApi#updateParticipants | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppGroupParticipantAction]] |
| `WhatsAppGroupSetting` | Rust | whatsapp | Announcement, NotAnnouncement, Locked, Unlocked | WhatsAppGroupApi#updateGroupSetting | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppGroupSetting]] |
| `WhatsAppLabelAction` | Rust | whatsapp | Add, Remove | WhatsAppLabelApi#handleLabel | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppLabelAction]] |
| `WhatsAppMediaType` | Rust | whatsapp | None, Image, Video, Audio, Document | WhatsAppMediaMessageFileDTO, WhatsAppMediaMessageURLDTO | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppMediaType]] |
| `WhatsAppOnlinePrivacyValue` | Rust | whatsapp | All, MatchLastSeen | WhatsAppPrivacySettings.online | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppOnlinePrivacyValue]] |
| `WhatsAppPresence` | Rust | whatsapp | Unavailable, Available, Composing, Recording, Paused | WhatsAppInstanceManagementApi#setPresence, WhatsAppChatApi#sendPresence | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppPresence]] |
| `WhatsAppPrivacyValue` | Rust | whatsapp | All, Contacts, ContactBlacklist, None | WhatsAppPrivacySettings.profile/status/last | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppPrivacyValue]] |
| `WhatsAppProvider` | Rust | whatsapp | Default, Evolution, Official | propriedade seedgrid.whatsapp.api | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppProvider]] |
| `WhatsAppReadReceiptsValue` | Rust | whatsapp | All, None | WhatsAppPrivacySettings.readreceipts | [[SeedGrid/Extensions/whatsapp/Rust#Enums\|whatsapp/WhatsAppReadReceiptsValue]] |

## Contagem por extension

| Extension | Enums |
|---|---|
| apikeys | 4 |
| audit | 5 |
| backup | 9 |
| billing | 16 |
| broker | 1 |
| cache | 6 |
| commons | 3 |
| exchange | 1 |
| login-tenancy | 8 |
| notification | 1 |
| privacy | 8 |
| resilience | 11 |
| runtime | 2 |
| security | 9 |
| subdomain-tenancy | 15 |
| whatsapp | 25 |
| **Total** | **124** |
