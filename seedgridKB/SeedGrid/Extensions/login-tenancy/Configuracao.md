---
tags: [seedgrid, extension, login-tenancy, configuracao]
fonte: java/seedgrid-quarkus-ext-login-tenancy
branch: main
commit: c67581bda9
analisado-em: 2026-10-14
---

# Login-tenancy (Quarkus) — configuração

Voltar: [[SeedGrid/Extensions/login-tenancy/Visao-geral|Visão geral do login-tenancy]] · [[SeedGrid/Extensions/login-tenancy/Exemplos|Exemplos]] · [[SeedGrid/Extensions/login-tenancy/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo próprio | `seedgrid.login-tenancy` (não existe `seedgrid.login-tenancy.enabled`) |
| Classe de config | `java/seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/configs/LoginTenancyConfig.java` → `LoginTenancyConfig` (grupos `App`, `Database`, `Foundation.Status`, `Foundation.Health`, `Bootstrap`, `Bootstrap.Admin`, `Modules.Billing/Apikeys/Backup/Filemanagement`) |
| Fachada | `LoginTenancyFoundationConfig` (bean CDI que os demais componentes consomem) |
| Mecanismo | SmallRye `@ConfigMapping(prefix = "seedgrid.login-tenancy")` (registrado automaticamente; sem `ConfigMappingBuildItem`). Também: `@ConfigProperty` em `LoginTenancyMongoAuditDatabaseProducer`, `LoginTenancyMigrationService`, `LoginTenancyBootstrapService`, `LoginTenancySecurityBridge`, `LoginTenancyApiExceptionExtension`; `@SgRateLimit(configKey=...)` no `LoginTenancySignupController`; defaults em `runtime/src/main/resources/META-INF/microprofile-config.properties` e `RunTimeConfigurationDefaultBuildItem` em `LoginTenancyProcessor`. |
| Fase | Runtime (todas as propriedades `seedgrid.login-tenancy.*`). Os defaults `quarkus.*` do `microprofile-config.properties` incluem chaves build-time do Quarkus. |

Variáveis de ambiente: regra MicroProfile, ex.: `seedgrid.login-tenancy.app.code` → `SEEDGRID_LOGIN_TENANCY_APP_CODE` (o hífen vira `_`; o SmallRye resolve para a propriedade conhecida do mapping). O código não lê env diretamente.

## 2. Propriedades da extension (`seedgrid.login-tenancy.*`)

### Identidade da aplicação

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.app.code` | `String` | texto | `seedgrid-app` | Não | Código curto da aplicação; exibido no status e no log do bootstrap; base do nome do banco Mongo de auditoria (`<code>_audit_db`) quando não há `seedgrid.audit.mongodb.database`. | Identificar o produto | Lido também por `@ConfigProperty` (Optional) no producer Mongo: se vier vazio lá, o banco vira `audit_db`; se o `@WithDefault("seedgrid-app")` do mapping é visível para esse `@ConfigProperty` é Não confirmado (ver §9) | Runtime | Decl.: `LoginTenancyConfig.App#code()`; `LoginTenancyMongoAuditDatabaseProducer#appCode`. Consumo: `LoginTenancyFoundationConfig#appCode()` → `LoginTenancyStatusController`, `LoginTenancyBootstrapService`; `LoginTenancyMongoAuditDatabaseProducer#resolveDatabaseName` |
| `seedgrid.login-tenancy.app.name` | `String` | texto | `SeedGrid Application` | Não | Nome de exibição: usado nos e-mails (assunto e template `{appName}`) de confirmação, boas-vindas e ativação de usuário, e no status. | Branding dos e-mails | — | Runtime | Decl.: `LoginTenancyConfig.App#name()`. Consumo: `LoginTenancySignupController#sendConfirmationEmail`/`#sendWelcomeEmail`, `LoginTenancyAccountUserActivationMailer#deliver`, `LoginTenancyStatusController` |

### Banco / migrations

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.database.migrate-at-start` | `boolean` | `true`/`false` | `true` | Não | `false`: pula **todas** as migrations orquestradas (foundation + app). | Controlar migração no boot | O Flyway nativo fica desligado (`quarkus.flyway.enabled=false`), então com `false` ninguém migra | Runtime | Decl.: `LoginTenancyConfig.Database#migrateAtStart()`. Consumo: `LoginTenancyMigrationService#onStart` |
| `seedgrid.login-tenancy.database.baseline-on-migrate` | `boolean` | `true`/`false` | `true` | Não | Passado ao `Flyway.configure().baselineOnMigrate(...)` de cada módulo. | Bancos pré-existentes | — | Runtime | Decl.: `LoginTenancyConfig.Database#baselineOnMigrate()`. Consumo: `LoginTenancyMigrations#migrateModule` |
| `seedgrid.login-tenancy.database.locations` | `String` | location Flyway (ex.: `classpath:db/migration/app`) | `classpath:db/migration/app` | Não | Location das migrations da **aplicação**, executadas por último com a tabela `flyway_schema_history`. | Migrations do host | Não use `classpath:db/migration` (scan recursivo pegaria as subpastas de foundation — javadoc). Um único valor `String` (não lista). | Runtime | Decl.: `LoginTenancyConfig.Database#locations()`. Consumo: `LoginTenancyMigrationService#onStart` via `applicationMigrationsLocation()` |

### Superfície técnica

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.foundation.status.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: `GET /public/login-tenancy/status` responde 404. | Expor status técnico | — | Runtime | Decl.: `LoginTenancyConfig.Foundation.Status#enabled()`. Consumo: `LoginTenancyStatusController#status` |
| `seedgrid.login-tenancy.foundation.health.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: o readiness `login-tenancy-foundation` reporta UP sem tocar o banco. | Readiness do datasource | — | Runtime | Decl.: `LoginTenancyConfig.Foundation.Health#enabled()`. Consumo: `LoginTenancyReadinessCheck#call` |

### Bootstrap

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.bootstrap.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: o `LoginTenancyBootstrapService` só loga que está desligado. Não impede o bootstrap do security nem as migrations. Também aparece no status. | Coordenação/log do bootstrap | `bootstrap.admin.enabled` só vale se este for `true` | Runtime | Decl.: `LoginTenancyConfig.Bootstrap#enabled()`. Consumo: `LoginTenancyBootstrapService#onStart`, `LoginTenancyFoundationConfig#adminBootstrapEnabled`, status |
| `seedgrid.login-tenancy.bootstrap.admin.enabled` | `boolean` | `true`/`false` | `true` | Não | Intenção de criar o primeiro admin. É **só coordenação**: quem cria é o security, a partir de `seedgrid.security.first-admin-user.email`. Se `false` e o e-mail estiver preenchido, emite WARN e o admin é criado mesmo assim. | Sinalização/status | Efetivo = `bootstrap.enabled && bootstrap.admin.enabled` | Runtime | Decl.: `LoginTenancyConfig.Bootstrap.Admin#enabled()`. Consumo: `LoginTenancyBootstrapService#coordinateAdminBootstrap`, status |

### Ativação lógica dos módulos

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.modules.billing.enabled` | `boolean` (um por constante de [[SeedGrid/Extensions/login-tenancy/Enums#FoundationModule|FoundationModule]]) | `true`/`false` | `true` | Não | `false`: não roda as migrations de billing, não provisiona conta/trial no signup confirmado e (via default do `microprofile-config.properties`) desliga `seedgrid.billing.api.enabled`. | Desligar billing | Default de `seedgrid.billing.api.enabled=${seedgrid.login-tenancy.modules.billing.enabled:true}` | Runtime | Decl.: `LoginTenancyConfig.Modules.Billing#enabled()`. Consumo: `LoginTenancyModuleRegistry` → `LoginTenancyMigrationService`, `LoginTenancyBillingProvisioner`, status; `META-INF/microprofile-config.properties` |
| `seedgrid.login-tenancy.modules.apikeys.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: não roda as migrations de apikeys; some de `activeModules`. Beans/endpoints do apikeys continuam presentes. | Desligar migrations de apikeys | — | Runtime | Decl.: `LoginTenancyConfig.Modules.Apikeys#enabled()`. Consumo: `LoginTenancyMigrationService`, status |
| `seedgrid.login-tenancy.modules.backup.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: não roda as migrations de backup; some de `activeModules`. Beans do backup continuam. | Desligar migrations de backup | — | Runtime | Decl.: `LoginTenancyConfig.Modules.Backup#enabled()`. Consumo: `LoginTenancyMigrationService`, status |
| `seedgrid.login-tenancy.modules.filemanagement.enabled` | `boolean` | `true`/`false` | `true` | Não | Só afeta `activeModules` (status/log); filemanagement não tem migrations no baseline. | Informativo | — | Runtime | Decl.: `LoginTenancyConfig.Modules.Filemanagement#enabled()`. Consumo: `LoginTenancyModuleRegistry#activeModules` (status e log do bootstrap) |

Total `seedgrid.login-tenancy.*`: **13 propriedades**.

### Propriedades de outros prefixos `seedgrid.*` **lidas** pela login-tenancy

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.audit.mongodb.database` | `Optional<String>` | nome de banco Mongo | — (deriva `<app.code>_audit_db`, ou `audit_db`) | Não | Override do banco Mongo de auditoria produzido pela foundation (banco único). | Audit MongoDB | Só existe bean se o Mongo estiver no classpath; conexão via `seedgrid.audit.mongodb.connection-string` (módulo audit — ver [[SeedGrid/Extensions/audit/Configuracao|audit]]) | Runtime | `LoginTenancyMongoAuditDatabaseProducer#auditDatabase` |
| `seedgrid.audit.persistence.strategy` | `Optional<String>` | `jpa` (case-insensitive) habilita | — | Condicional (sem `jpa`, a migration de audit é pulada) | Decide se as migrations `db/migration/audit` rodam. | Orquestração | Chave do módulo audit | Runtime | `LoginTenancyMigrationService#isAuditJpa` |
| `seedgrid.security.first-admin-user.email` | `Optional<String>` | e-mail | — | Não | Só lida para decidir logs/WARN e `firstAdminConfigured` no status. | Coordenação | Ver [[SeedGrid/Extensions/security/Configuracao|security]] | Runtime | `LoginTenancyBootstrapService`, `LoginTenancySecurityBridge` |
| `seedgrid.security.jwt.issuer` | `Optional<String>` | URL/issuer | — | Não | Exibido em `security.jwtIssuer` no status. | Informativo | security | Runtime | `LoginTenancySecurityBridge` |
| `seedgrid.show-dev-message` | `boolean` | `true`/`false` | `false` | Não | Inclui `devMessage` nos problem+json das exceções da login-tenancy. | Depuração | Mesma chave usada por security e billing | Runtime | `LoginTenancyApiExceptionExtension` (construtor) |

### Rate limit dos endpoints de signup (`seedgrid.ratelimit.<configKey>.*`, lido pelo `seedgrid-resilience`)

A login-tenancy define os `configKey`; o mecanismo (`RateLimitService`) lê `enabled` (padrão `true`), `permits` e `window` (padrão = valores da anotação) e também `min-spacing`, `burst-capacity`, `algorithm` (ver [[SeedGrid/Extensions/resilience/Configuracao|resilience]]). O README afirma que o limite é por IP (Não confirmado aqui).

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.ratelimit.signup.enabled` | `boolean` | `true`/`false` | `true` | Não | `false` desliga o limite do `POST /public/signup` | Anti-flood | — | Runtime | `@SgRateLimit(configKey="signup")` em `LoginTenancySignupController#signup`; leitura em `RateLimitService#isEnabled` |
| `seedgrid.ratelimit.signup.permits` | `long` | ≥ 1 | `10` | Não | Pedidos por janela | Anti-flood | com `window` | Runtime | idem (`#resolvePermits`) |
| `seedgrid.ratelimit.signup.window` | `Duration` | ISO-8601 | `PT1M` | Não | Janela | Anti-flood | com `permits` | Runtime | idem (`#resolveWindowMs`) |
| `seedgrid.ratelimit.signup-email-exists.enabled` | `boolean` | `true`/`false` | `true` | Não | Limite de `GET /public/signup/email-exists` | Anti-enumeração | — | Runtime | `LoginTenancySignupController#emailExists` |
| `seedgrid.ratelimit.signup-email-exists.permits` | `long` | ≥ 1 | `10` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-email-exists.window` | `Duration` | ISO-8601 | `PT1M` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-cnpj-status.enabled` | `boolean` | `true`/`false` | `true` | Não | Limite de `GET /public/signup/cnpj-status` | Anti-enumeração | — | Runtime | `LoginTenancySignupController#cnpjStatus` |
| `seedgrid.ratelimit.signup-cnpj-status.permits` | `long` | ≥ 1 | `10` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-cnpj-status.window` | `Duration` | ISO-8601 | `PT1M` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-confirm-email.enabled` | `boolean` | `true`/`false` | `true` | Não | Limite de `POST /public/signup/confirm-email` | Anti brute-force do código | — | Runtime | `LoginTenancySignupController#confirmEmail` |
| `seedgrid.ratelimit.signup-confirm-email.permits` | `long` | ≥ 1 | `10` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-confirm-email.window` | `Duration` | ISO-8601 | `PT1M` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-resend-email.enabled` | `boolean` | `true`/`false` | `true` | Não | Limite de `POST /public/signup/resend-email` | Anti-spam | — | Runtime | `LoginTenancySignupController#resendEmail` |
| `seedgrid.ratelimit.signup-resend-email.permits` | `long` | ≥ 1 | `5` | Não | idem | — | — | Runtime | idem |
| `seedgrid.ratelimit.signup-resend-email.window` | `Duration` | ISO-8601 | `PT1H` | Não | idem | — | — | Runtime | idem |

### Defaults que a extension define para outros módulos SeedGrid (sobrescrevíveis)

| Propriedade | Valor default | Onde | Efeito |
|---|---|---|---|
| `seedgrid.billing.api.enabled` | `${seedgrid.login-tenancy.modules.billing.enabled:true}` | `microprofile-config.properties` | Endpoints do billing somem com o módulo desligado |
| `seedgrid.security.account.assignable-permission-audiences` | `client` | `microprofile-config.properties` | Perfis de conta-cliente recebem permissões de audience `client` (e sem audience) |
| `seedgrid.filemanagement.filesystem.base-path` | `./data/files` | `LoginTenancyProcessor#registerOptionalModuleDefaults` | Storage local padrão |

### Obrigatórias de outros contratos (segundo javadoc de `LoginTenancyConfig` e `docs/configuration.md`)

`quarkus.datasource.jdbc.url`, `quarkus.datasource.username`, 🔒 `quarkus.datasource.password`, `seedgrid.security.jwt.private-key-location`, `seedgrid.security.jwt.public-key-location`; mínimos de `seedgrid.billing.*`/`seedgrid.filemanagement.*` se ativos. Além disso o host precisa de um `BillingProvider`.

### Cadastro B2B, B2C e calendário (ciclo 2026.10.22, NÃO PUBLICADO)

> **Não publicado.** Entram com `seedgrid-login-tenancy` 2026.10.22. Receitas: [[SeedGrid/Extensions/login-tenancy/Cadastro-b2b-b2c-e-seletor-de-empresa|Cadastro B2B, B2C e seletor de empresa]].

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.login-tenancy.signup.customer-type` | enum | `B2B`, `B2C`, `BOTH` | `B2B` | Não | Quem pode se cadastrar; fora do tipo: 403 `SIGNUP_TYPE_NOT_ALLOWED`. Só faz sentido em `shared-database`. Em `B2C` ou `BOTH` o login social cria conta pessoal. | Signup | `seedgrid.security.isolation` | Runtime | Insumo Fase 1b e 7 (não publicado) |
| `seedgrid.login-tenancy.signup.personal-document-required` | boolean | `true`, `false` | `false` | Não | `true`: `POST /public/signup/personal` sem CPF responde 400 `PERSONAL_DOCUMENT_REQUIRED`. Ligue só se o produto emitir nota. Não vale para login social. | Signup pessoal | — | Runtime | Insumo Fase 7 (não publicado) |
| `seedgrid.login-tenancy.modules.business-days.company-required` | boolean | `true`, `false` | `true` | Não | Alimenta `seedgrid.business-days.company-required`: ligado, sem empresa corrente toda rota `/business-days/**` responde 403 `COMPANY_REQUIRED`. Chave do `microprofile-config.properties`, não do `@ConfigMapping`. | Calendário | `seedgrid.business-days.company-required` | Runtime | Insumo Fase 7 (não publicado) |

## 3. Propriedades de frameworks definidas pela extension

| Propriedade | Valor | Onde | Fase Quarkus |
|---|---|---|---|
| `quarkus.flyway.enabled` | `false` (crítico: migrations são do `LoginTenancyMigrationService`) | `microprofile-config.properties` | build time |
| `quarkus.datasource.db-kind` | `postgresql` | `microprofile-config.properties` | build time |
| `quarkus.hibernate-orm.schema-management.strategy` | `none` | `microprofile-config.properties` | — |
| `quarkus.hibernate-orm.physical-naming-strategy` | `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy` | `microprofile-config.properties` | build time |

## 4. Propriedades usadas só em testes

`runtime/src/test/resources/application.properties` (valores sensíveis não copiados):

| Grupo | Propriedades |
|---|---|
| Quarkus | `quarkus.datasource.db-kind`, `quarkus.hibernate-orm.schema-management.strategy`, `quarkus.hibernate-orm.sql-load-script=no-file`, `quarkus.index-dependency.seedgrid-filemanagement.group-id/artifact-id`, `quarkus.arc.exclude-types` (storages de nuvem do filemanagement), `quarkus.mailer.mock`, `quarkus.mailer."security".mock`, `quarkus.http.test-port=0` |
| JWT | `seedgrid.security.jwt.issuer`, `.kid`, `.private-key-location`, `.public-key-location`; `mp.jwt.verify.publickey.location`, `mp.jwt.verify.issuer`, `smallrye.jwt.sign.key.location`, `smallrye.jwt.new-token.issuer`, `smallrye.jwt.new-token.lifespan` (chaves PEM de teste) |
| Security | 🔒 `seedgrid.security.encryption.key` (`<SEGREDO:security-encryption-key>`), `seedgrid.security.mailer.from`, `seedgrid.security.frontend.*` (base-url e paths), `seedgrid.security.default-company.*`, `seedgrid.security.first-admin-user.*` (🔒 `initial-password`), `seedgrid.security.password.*` |
| Audit | `seedgrid.audit.persistence.strategy=JPA`, `seedgrid.audit.jpa.db-kind=postgresql` |
| Login-tenancy | `seedgrid.login-tenancy.app.code=login-tenancy-it`, `seedgrid.login-tenancy.app.name=LoginTenancy IT` |
| Rate limit | `seedgrid.ratelimit.signup.enabled`, `signup-email-exists.enabled`, `signup-confirm-email.enabled`, `signup-resend-email.enabled`, `user-activation-resend.enabled` = `false` (o último é `configKey` de outro módulo) |

## 5. Aliases, obsoletas, renomeações

- Não existe `seedgrid.login-tenancy.enabled` (regra fechada).

## 6. Configuração mínima

```properties
quarkus.datasource.jdbc.url=jdbc:postgresql://<HOST>:5432/<BANCO>
quarkus.datasource.username=<USUARIO>
quarkus.datasource.password=<SEGREDO:db-password>
seedgrid.security.jwt.private-key-location=<CAMINHO-CHAVE-PRIVADA>
seedgrid.security.jwt.public-key-location=<CAMINHO-CHAVE-PUBLICA>
seedgrid.login-tenancy.app.code=<codigo-do-produto>
seedgrid.login-tenancy.app.name=<Nome do Produto>
```

Mais as configurações obrigatórias do [[SeedGrid/Extensions/security/Configuracao|security]] (company default, e-mail etc.) e um `BillingProvider` no classpath.

## 7. Configuração completa comentada

```properties
# Identidade
seedgrid.login-tenancy.app.code=seedgrid-app
seedgrid.login-tenancy.app.name=SeedGrid Application
# Migrations orquestradas (Flyway nativo fica desligado)
seedgrid.login-tenancy.database.migrate-at-start=true
seedgrid.login-tenancy.database.baseline-on-migrate=true
seedgrid.login-tenancy.database.locations=classpath:db/migration/app
# Superfície técnica
seedgrid.login-tenancy.foundation.status.enabled=true
seedgrid.login-tenancy.foundation.health.enabled=true
# Bootstrap (coordenação; o admin é criado pelo security)
seedgrid.login-tenancy.bootstrap.enabled=true
seedgrid.login-tenancy.bootstrap.admin.enabled=true
# Módulos (ativação lógica)
seedgrid.login-tenancy.modules.billing.enabled=true
seedgrid.login-tenancy.modules.apikeys.enabled=true
seedgrid.login-tenancy.modules.backup.enabled=true
seedgrid.login-tenancy.modules.filemanagement.enabled=true
# Modulos de produto (default true): desligado = nao migra e as rotas respondem 404
seedgrid.login-tenancy.modules.ai-pricing.enabled=true
seedgrid.login-tenancy.modules.exchange.enabled=true
seedgrid.login-tenancy.modules.business-days.enabled=true
# Auditoria
seedgrid.audit.persistence.strategy=jpa
#seedgrid.audit.mongodb.database=<banco-de-auditoria>
# Rate limit do signup (exemplo: apertar o confirm-email)
seedgrid.ratelimit.signup-confirm-email.permits=5
seedgrid.ratelimit.signup-confirm-email.window=PT5M
```

## 8. Receitas

- **Produto sem cobrança**: `seedgrid.login-tenancy.modules.billing.enabled=false` (sem migrations de billing, sem trial no signup e `seedgrid.billing.api.enabled=false` por default). O `BillingProvider` ainda é exigido pelo `billing-core` (README) — Não confirmado se continua obrigatório com o módulo desligado.
- **Migrations aplicadas por pipeline externo**: `seedgrid.login-tenancy.database.migrate-at-start=false`.
- **Não criar admin**: deixe `seedgrid.security.first-admin-user.email` vazio (o flag `bootstrap.admin.enabled` sozinho não basta).
- **Auditoria em MongoDB**: dependência `seedgrid-audit-mongodb`, `seedgrid.audit.persistence.strategy=MONGODB`; o banco vira `<app.code>_audit_db` ou `seedgrid.audit.mongodb.database`.
- **Testes de integração**: desligue os rate limits (`seedgrid.ratelimit.<configKey>.enabled=false`), como faz o `application.properties` de teste.

## 9. Dúvidas e lacunas

- Se o `@ConfigProperty(name="seedgrid.login-tenancy.app.code") Optional<String>` do producer Mongo enxerga o `@WithDefault` do mapping: o SmallRye normalmente registra os defaults de mappings como valores default da config, o que daria `seedgrid-app_audit_db` sem `app.code` explícito; caso contrário, `audit_db`. Não confirmado/não testado.
