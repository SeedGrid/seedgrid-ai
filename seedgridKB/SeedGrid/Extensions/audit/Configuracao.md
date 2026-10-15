---
tags: [seedgrid, extension, audit, configuracao]
fonte: java/seedgrid-quarkus-ext-audit
branch: main
commit: d5bf32e509
analisado-em: 2026-10-14
---

# SeedGrid Audit — Configuração

Voltar: [[SeedGrid/Extensions/audit/Visao-geral|Visão geral do audit]] · [[SeedGrid/Extensions/audit/Exemplos|Exemplos]] · [[SeedGrid/Extensions/audit/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.audit` |
| Classe de config | `seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/configs/AuditConfig.java` (`@ConfigMapping(prefix = "seedgrid.audit")`) |
| Mecanismo | SmallRye `@ConfigMapping` (interfaces aninhadas `Persistence`, `MongoDb`, `Jpa`, `Jpa.Jdbc`) |
| Fase | Runtime (ConfigMapping em módulo runtime; não há `@ConfigRoot`/`*BuildTimeConfig` nos deployments) |
| Defaults de módulo | `META-INF/microprofile-config.properties` em `seedgrid-quarkus-ext-audit-postgresql/runtime` e `seedgrid-quarkus-ext-audit-mongodb/runtime` (ordinal 100, sobrescrevível pelo `application.properties` do host) |
| Outras leituras | Nenhum `@ConfigProperty`, `ConfigProvider.getConfig()` ou `@IfBuildProperty` no repositório audit. Fora dele, `seedgrid-login-tenancy` lê `seedgrid.audit.mongodb.database` via `@ConfigProperty`. **Confirmado** por grep. |

Variáveis de ambiente lidas explicitamente pelos `microprofile-config.properties` (expressões `${VAR:default}`): `AUDIT_STRATEGY`, `SEEDGRID_AUDIT_DB_USERNAME`, `SEEDGRID_AUDIT_DB_PASSWORD`, `SEEDGRID_AUDIT_DB_URL`, `SEEDGRID_AUDIT_MONGODB_URI`. Além disso vale a regra MicroProfile padrão (ex.: `SEEDGRID_AUDIT_PERSISTENCE_STRATEGY`), sem ambiguidade para essas chaves.

## 2. Propriedades da extension

### 2.1 Geral e strategy

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.audit.persistence.strategy` | enum [[SeedGrid/Extensions/audit/Enums#AuditPersistenceStrategy\|AuditPersistenceStrategy]] | `JPA`, `MONGODB` (conversão case-insensitive, segundo javadoc) | `JPA` (`@WithDefault`); o módulo postgresql define `${AUDIT_STRATEGY:JPA}` e o módulo mongodb `${AUDIT_STRATEGY:MONGODB}` | Não (mas deve corresponder ao módulo de store presente) | Seleciona o `AuditPersistenceProvider` cuja `strategy()` coincide; sem provider correspondente → `IllegalStateException("No audit persistence provider available for strategy ...")` na primeira injeção dos repositórios | `AuditPersistenceRouter#resolveProvider()`; `AuditConfig#isMongo()/isJpa()` | Determina se `seedgrid.audit.jpa.*` ou `seedgrid.audit.mongodb.*` têm efeito (`effective*`) | Runtime | Decl.: `AuditConfig.Persistence#strategy()`; default de módulo: `META-INF/microprofile-config.properties` (postgresql e mongodb) |

### 2.2 JPA / PostgreSQL (`seedgrid.audit.jpa.*`)

Só têm efeito com `strategy=JPA` **e** quando não há `EntityManager` CDI resolvível no host (datasource standalone do audit). Com `EntityManager` do host, estas chaves são ignoradas. **Confirmado** (`PostgreSqlAuditPersistenceProvider`).

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.audit.jpa.jdbc.url` | `Optional<String>` | URL iniciando com `jdbc:postgresql:` | — (módulo: `${SEEDGRID_AUDIT_DB_URL:}` = vazio) | Condicional: obrigatória com `strategy=JPA` sem `EntityManager` CDI | Vazia → `IllegalStateException("Audit JPA strategy configured but seedgrid.audit.jpa.jdbc.url not set")`; outro esquema → `IllegalArgumentException("Unsupported JDBC URL")`. Usada no `PGSimpleDataSource` do PU standalone `audit-pu` | `PostgreSqlAuditPersistenceProvider#getOrCreateEntityManagerFactory()` via `AuditConfig#effectiveJpaJdbcUrl()` | `username`, `password` | Runtime | Decl.: `AuditConfig.Jpa.Jdbc#url()`; default: `seedgrid-quarkus-ext-audit-postgresql/runtime/.../META-INF/microprofile-config.properties` |
| `seedgrid.audit.jpa.username` | `Optional<String>` | texto | — (módulo: `${SEEDGRID_AUDIT_DB_USERNAME:}`) | Condicional (conforme o banco) | Usuário do datasource standalone | idem, via `effectiveJpaUsername()` | `jdbc.url` | Runtime | `AuditConfig.Jpa#username()` |
| 🔒 `seedgrid.audit.jpa.password` | `Optional<String>` | texto | — (módulo: `${SEEDGRID_AUDIT_DB_PASSWORD:}`) | Condicional (conforme o banco) | Senha do datasource standalone | idem, via `effectiveJpaPassword()` | `jdbc.url` | Runtime | `AuditConfig.Jpa#password()` |

### 2.3 MongoDB (`seedgrid.audit.mongodb.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `seedgrid.audit.mongodb.connection-string` | `Optional<String>` | connection string MongoDB | — no mapping; o módulo mongodb define `${SEEDGRID_AUDIT_MONGODB_URI:<URI local com credenciais de desenvolvimento>}` (valor não reproduzido aqui) | Condicional: necessária em produção com `strategy=MONGODB` (senão cai no default de desenvolvimento do módulo) | Não é lida por Java; o módulo faz a ponte `quarkus.mongodb.connection-string=${seedgrid.audit.mongodb.connection-string}` | Ponte em `microprofile-config.properties` | `quarkus.mongodb.connection-string` | Runtime | Decl.: `AuditConfig.MongoDb#connectionString()`; ponte: `seedgrid-quarkus-ext-audit-mongodb/runtime/.../META-INF/microprofile-config.properties` |
| `seedgrid.audit.mongodb.database` | `Optional<String>` | nome de database | — (fallback do producer: `<seedgrid.login-tenancy.app.code>_audit_db`, ou `audit_db`) | Não | Não é lida pelo módulo audit. Só tem efeito quando o `MongoDatabase` vem do `LoginTenancyMongoAuditDatabaseProducer` (seedgrid-login-tenancy, banco único): define o nome do banco de auditoria. Ignorada com `seedgrid-subdomain-tenancy` (`TenantAwareMongoProducer` usa `<product-prefix>_<tenant>_audit_db`) ou com producer próprio da app | `java/seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/configs/LoginTenancyMongoAuditDatabaseProducer.java` → `#resolveDatabaseName()` (`@ConfigProperty`) | `seedgrid.login-tenancy.app.code` | Runtime | Decl.: `AuditConfig.MongoDb#database()`; consumo: `LoginTenancyMongoAuditDatabaseProducer#auditDatabase` |

Total: **6** propriedades com efeito (`persistence.strategy`, `jpa.jdbc.url`, `jpa.username`, `jpa.password`, `mongodb.connection-string`, `mongodb.database`).

## 3. Propriedades de framework definidas/recomendadas

| Propriedade | Valor definido pela extension | Onde | Observação |
|---|---|---|---|
| `quarkus.mongodb.connection-string` | `${seedgrid.audit.mongodb.connection-string}` | módulo mongodb `microprofile-config.properties` | Ponte; o host pode sobrescrever |
| `quarkus.flyway.locations` | `classpath:db/migration/audit` | módulo postgresql | **Atenção (Inferência):** por ser chave global do Flyway default, pode conflitar com as migrations do host se o host não a sobrescrever/compor |
| `quarkus.flyway.table` | `flyway_schema_history_audit` | módulo postgresql | idem |
| `quarkus.flyway.baseline-on-migrate` | `true` | módulo postgresql | — |
| `quarkus.swagger-ui.path` | `/swagger-ui` | módulo postgresql | — |
| `quarkus.swagger-ui.always-include` | `true` | módulo postgresql | — |
| Permissão `LOG_READ` | — | `AuditLogController` | Não é propriedade; o host deve mapear a permissão (ex.: via security) |

## 4. Propriedades de testes

Nenhuma. Os testes (`*IT`, `AuditMaskingTest`) configuram Testcontainers programaticamente; não há `application.properties` de teste. **Confirmado**.

## 5. Aliases, obsoletas, renomeações

- Não há aliases nem renomeações em código.
- Variáveis de ambiente `AUDIT_STRATEGY` e `SEEDGRID_AUDIT_*` funcionam como "aliases" via expressão nos `microprofile-config.properties`.

## 6. Configuração mínima

PostgreSQL usando o datasource/`EntityManager` do host:
```properties
seedgrid.audit.persistence.strategy=JPA
```

PostgreSQL sem `EntityManager` CDI (standalone):
```properties
seedgrid.audit.persistence.strategy=JPA
seedgrid.audit.jpa.jdbc.url=jdbc:postgresql://<host>:5432/<database>
seedgrid.audit.jpa.username=<usuario>
seedgrid.audit.jpa.password=<SEGREDO:audit-db-password>
```

MongoDB:
```properties
seedgrid.audit.persistence.strategy=MONGODB
seedgrid.audit.mongodb.connection-string=<SEGREDO:audit-mongodb-uri>
```

## 7. Configuração completa comentada

```properties
# JPA (padrão) ou MONGODB — deve corresponder ao módulo de store no classpath.
seedgrid.audit.persistence.strategy=JPA

# --- JPA standalone (só usado quando não há EntityManager CDI no host) ---
seedgrid.audit.jpa.jdbc.url=jdbc:postgresql://<host>:5432/<database>
seedgrid.audit.jpa.username=<usuario>
seedgrid.audit.jpa.password=<SEGREDO:audit-db-password>

# --- MongoDB ---
# Repassada para quarkus.mongodb.connection-string pelo módulo mongodb.
#seedgrid.audit.mongodb.connection-string=<SEGREDO:audit-mongodb-uri>
# Só com seedgrid-login-tenancy (producer de banco único): nome do banco de auditoria.
#seedgrid.audit.mongodb.database=<database>

# --- Framework (já definidas pelo módulo postgresql; sobrescreva se o host tiver migrations próprias) ---
#quarkus.flyway.locations=classpath:db/migration/audit
#quarkus.flyway.table=flyway_schema_history_audit
#quarkus.flyway.baseline-on-migrate=true
```

## 8. Receitas

- **Usar o banco do próprio host (JPA):** inclua `seedgrid-audit-postgresql`; mantenha `strategy=JPA`. Com `quarkus-hibernate-orm` ativo o provider usa o `EntityManager` CDI. Garanta que as migrations `db/migration/audit` (V300–V303) sejam aplicadas — revise `quarkus.flyway.locations` para combinar com as do host.
- **Banco de auditoria separado (JPA standalone):** sem `EntityManager` CDI resolvível, informe `seedgrid.audit.jpa.jdbc.url/username/password` (ou `SEEDGRID_AUDIT_DB_URL/USERNAME/PASSWORD`).
- **MongoDB:** inclua `seedgrid-audit-mongodb`, defina `SEEDGRID_AUDIT_MONGODB_URI` (ou a propriedade) e garanta um producer de `MongoDatabase`: a extension não o produz; `seedgrid-login-tenancy` (banco único, nome via `seedgrid.audit.mongodb.database`) e `seedgrid-subdomain-tenancy` (banco por tenant) produzem um `@DefaultBean`.
- **Isolamento de leitura por tenant/company:** não é por propriedade; implemente `AuditReadScopeProvider` (ver [[SeedGrid/Extensions/audit/Exemplos|Exemplos]]).

## 9. Dúvidas e lacunas
- Comportamento quando os dois módulos de store estão no classpath (dois defaults conflitantes para `strategy`). **Não confirmado**.
- Os `quarkus.flyway.*` globais definidos pelo módulo postgresql podem interferir com o Flyway do host. **Inferência**.
