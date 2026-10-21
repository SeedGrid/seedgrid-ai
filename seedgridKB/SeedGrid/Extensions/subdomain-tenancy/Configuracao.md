---
tags: [seedgrid, extension, subdomain-tenancy, configuracao]
fonte: java/seedgrid-quarkus-ext-subdomain-tenancy
branch: main
commit: fe62530a29
analisado-em: 2026-10-14
---

# subdomain-tenancy — Configuração (Quarkus)

Visão geral: [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral|Visão geral do subdomain-tenancy]] · Exemplos: [[SeedGrid/Extensions/subdomain-tenancy/Exemplos|Exemplos do subdomain-tenancy]] · Porte Rust: [[SeedGrid/Extensions/subdomain-tenancy/Rust|Porte Rust]]

> [!info] Fonte da verdade
> Tudo abaixo foi lido no código (commit `fe62530a29`). Só estão listadas as chaves que têm efeito. O `README.md` e os `docs/` da extension foram revisados contra o código em 2026-10-14; os relatórios de auditoria na raiz do repositório são históricos.

## 1. Cabeçalho

**Abreviações usadas na coluna Origem** (todas relativas a `seedgrid-platform`):
- `RT/` = `java/seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/`
- `MPC` = `java/seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/resources/META-INF/microprofile-config.properties`
- `PROC` = `java/seedgrid-quarkus-ext-subdomain-tenancy/deployment/src/main/java/br/com/seedgrid/subdomaintenancy/deployment/SubdomainTenancyProcessor.java`

| Item | Valor |
|---|---|
| Prefixo principal | `seedgrid.subdomain-tenancy` |
| Prefixos secundários | `seedgrid.subdomain-tenancy.admin-user`, `seedgrid.subdomain-tenancy.mailer`, `database.master` |
| Classes `@ConfigMapping` | `RT/configs/SubdomainTenancyBridgeConfig` (prefixo `seedgrid.subdomain-tenancy`, cobre quase tudo), `RT/configs/SubdomainTenancyAdminUserConfig` (`…admin-user`). As chaves `…mailer.*` e `database.master.*` têm efeito só via expansão de config (ver 2.2 e 2.7) |
| `@ConfigProperty` | `RT/configs/SubdomainTenancyConfig` (bean `@ApplicationScoped` com campos públicos) e injeção direta em construtores: `TenantConnectionResolverImpl`, `TenantMigrationCoordinator`, `TenantMigrationGateFilter`, `MigrationService`, `Migrations`, `TenantService`, `TenantProvisioningService`, `TenantOpenApiController`, `TenantAuditScopeProvider`, `TenantAwareMongoProducer` |
| Leitura programática | `Config#getOptionalValue` em `RT/resolvers/TenantConnectionResolverImpl#getTenantUsername/#getTenantPassword` e `RT/mongodb/MongoTenantResolverImpl` (construtor) |
| Defaults publicados | `MPC` (ordinal 100 — o `application.properties` do host vence) e `RunTimeConfigurationDefaultBuildItem` em `PROC#registerDatasourceDefaults` |
| `@ConfigRoot` / `*BuildTimeConfig` | **Não existem** (o `deployment` não declara config própria) |
| `@IfBuildProperty` / `@LookupIfProperty` / `@UnlessBuildProperty` | **Não usados** (o comentário em `RT/flyway/MigrationService` explica que a decisão é em runtime) |
| Fase | Todas as propriedades próprias são **runtime**, exceto `master.entity-packages` e `tenant.entity-packages`, que só são consumidas por expansão em `quarkus.hibernate-orm[.master].packages` (config de **build** do Hibernate ORM — Inferência baseada no comportamento do Quarkus) |

**Dupla declaração.** Muitas chaves aparecem ao mesmo tempo no `SubdomainTenancyBridgeConfig` (que, segundo o Javadoc, existe para "evitar avisos de chaves desconhecidas") **e** num `@ConfigProperty` com `defaultValue` próprio. Quando o consumidor real é o `@ConfigProperty`, o padrão efetivo é o do `MPC` (se houver) ou o do `defaultValue`; o `@WithDefault` do mapping só importa onde o mapping é lido. Os valores coincidem em todos os casos verificados.

**Variáveis de ambiente.** O `MPC` define a maioria das chaves como `${SEEDGRID_SUBDOMAIN_TENANCY_…:padrão}` — esses nomes de env var são lidos **explicitamente** (Confirmado) e aparecem na coluna Comportamento. Nomes curtos como `…_MASTER_DB_URL` **não** seguem a regra automática do MicroProfile; a regra automática (`SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DATASOURCE_JDBC_URL`) também funciona, porque env var (ordinal 300) vence o `MPC`.

## 2. Propriedades da extension

### 2.1 Resolução de tenant e rotas

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.domain-suffix` | `Optional<String>` | sufixo DNS sem ponto inicial, ex. `crm.seedgrid.com.br` | `—` (MPC: `${SEEDGRID_SUBDOMAIN_TENANCY_DOMAIN_SUFFIX:}` → vazio = ausente) | Condicional: sem ela **todo** request cai no tenant default (`master`) | `TenantHostExtractor` remove porta, põe em minúsculas, exige `host.endsWith(suffix)`, retira o sufixo e o ponto; o prefixo precisa casar `^[a-z0-9-]+$`, senão retorna `null` | Resolução do tenant por host (`X-Forwarded-Host` > `Host`), claim `subdomain` do JWT, validação do JWT contra o host, filtragem do OpenAPI | `default-tenant`; regex do signup (`^[a-z0-9_]{5,50}$`) é **diferente** — ver Dúvidas | runtime | Decl.: `RT/configs/SubdomainTenancyConfig#domainSuffix`, `SubdomainTenancyBridgeConfig#domainSuffix()`, `MPC`. Consumo: `RT/resolvers/TenantHostExtractor#extractTenantFromHost` |
| `seedgrid.subdomain-tenancy.tenant-header` | `Optional<String>` | nome de header HTTP | `—` | Não | Se presente e o header vier preenchido, `QuarkusTenantResolver` usa seu valor como tenant — mas só quando o `TenantContext` está vazio. Em requests JAX-RS o `TenantResolutionFilter` sempre grava um tenant (o do host ou `master`), então o header **não** tem efeito nelas; vale apenas para requests HTTP que não passam por esse filtro. Gate de migração, OpenAPI filtrado e JWT ignoram o header | `TenantResolver` do Hibernate (PU default) | Não declarada no `SubdomainTenancyBridgeConfig` (ciclo em andamento: passa a entrar no mapping, ver [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]]) | runtime | Decl.: `RT/configs/SubdomainTenancyConfig#tenantHeader`. Consumo: `RT/resolvers/QuarkusTenantResolver#resolveTenantId` |
| `seedgrid.subdomain-tenancy.default-tenant` | `String` | id de tenant | `master` | Não | Tenant devolvido quando nada é resolvido; também decide "contexto master" no OpenAPI e a claim `audience` (`platform` × `client`) do JWT | `QuarkusTenantResolver#getDefaultTenantId`, `TenantOpenApiController`, `SubdomainTenancyJwtTokenCustomizer#isPlatformTenant`, `MongoTenantResolverImpl` | Vários componentes usam o literal `"master"` fixo (`TenantResolutionFilter`, `TenantConnectionResolverImpl`, `TenantMigrationCoordinator`, controllers internos) — trocar o valor gera comportamento inconsistente (**Inferência**) | runtime | Decl.: `RT/configs/SubdomainTenancyConfig#defaultTenant` (`defaultValue="master"`), `SubdomainTenancyBridgeConfig#defaultTenant()`. Consumo: ver Uso |
| `seedgrid.subdomain-tenancy.product-prefix` | `Optional<String>` | identificador curto, ex. `kb` | `—` | Não (recomendada) | Nome do banco do tenant = `<prefix>_<tenant>` (sem prefixo: `<tenant>`). Também prefixa a chave de auditoria (`<prefix>/<tenant>`) e os bancos Mongo | `Utils#buildTenantDatabaseName` (resolver, provisionamento, coordinator), `TenantAuditScopeProvider#tenantKey`, `TenantAwareMongoProducer`, `MongoTenantResolverImpl` | Mudar depois de haver tenants provisionados aponta para outros bancos (**Inferência**) | runtime | Decl.: `SubdomainTenancyConfig#productPrefix`, `SubdomainTenancyBridgeConfig#productPrefix()`, `@ConfigProperty` em `TenantConnectionResolverImpl`, `TenantProvisioningService`, `TenantAuditScopeProvider`, `TenantAwareMongoProducer`; `getOptionalValue` em `MongoTenantResolverImpl` |
| `seedgrid.subdomain-tenancy.openapi.master-only-paths` | `List<String>` (CSV) | prefixos de path | `/admin` (MPC: `${SEEDGRID_SUBDOMAIN_TENANCY_OPENAPI_MASTER_ONLY_PATHS:/admin}`) | Não | Em contexto de tenant, `GET /public/tenant-openapi` remove os paths com esses prefixos (barra final removida), além das operações com tag `master-only` | `TenantOpenApiController#filterSpec` | Tags `master-only`/`tenant-only` (`@MasterOnly`/`@TenantOnly`) | runtime | Decl.: `SubdomainTenancyBridgeConfig.OpenApi#masterOnlyPaths()`, `@ConfigProperty` em `RT/controllers/TenantOpenApiController` (construtor), `MPC` |

### 2.2 Datasource master

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.master.datasource.jdbc.url` | `Optional<String>` | URL JDBC PostgreSQL | MPC: `jdbc:postgresql://localhost:5432/master` (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_URL`) | Sim em produção (o padrão aponta para localhost) | Copiada para `quarkus.datasource.master.jdbc.url`; usada para abrir um `SimpleDriverDataSource` próprio nas migrations do master e na listagem de tenants ativos. Se ausente no mapping, o código cai em `jdbc://postgress:localhost:5432/xxx_master` (URL inválida) | Datasource nomeado `master`, `MigrationService#masterMigrate`, `#listActiveTenantIdsPage` | `PROC` também registra default runtime `${seedgrid.subdomain-tenancy.master.datasource.jdbc.url:jdbc:postgresql://localhost:5432/master}` | runtime | Decl.: `SubdomainTenancyBridgeConfig.MasterJdbc#url()`, `MPC`. Consumo: `RT/flyway/MigrationService`, ponte `quarkus.datasource.master.jdbc.url` |
| `seedgrid.subdomain-tenancy.master.datasource.username` | `Optional<String>` | usuário do banco | MPC: `postgres` (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_USERNAME`) | Sim em produção | Ponte para `quarkus.datasource.master.username`; fallback `postgres` no código | idem | — | runtime | Decl.: `SubdomainTenancyBridgeConfig.MasterDatasource#username()`, `MPC`. Consumo: `MigrationService` |
| 🔒 `seedgrid.subdomain-tenancy.master.datasource.password` | `Optional<String>` | segredo | MPC: `postgres` (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_PASSWORD`) — valor de desenvolvimento | Sim em produção | Ponte para `quarkus.datasource.master.password`; fallback `postgres` no código | idem | — | runtime | Decl.: `SubdomainTenancyBridgeConfig.MasterDatasource#password()`, `MPC`. Consumo: `MigrationService` |
| `seedgrid.subdomain-tenancy.master.datasource.jdbc.min-size` | `Optional<Integer>` | ≥ 0 | MPC: `1` (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_POOL_MIN`) | Não | Só é lida via ponte `quarkus.datasource.master.jdbc.min-size` | Pool Agroal do master | — | runtime | Decl.: `SubdomainTenancyBridgeConfig.MasterJdbc#minSize()`, `MPC` |
| `seedgrid.subdomain-tenancy.master.datasource.jdbc.max-size` | `Optional<Integer>` | ≥ 1 | MPC: `10` (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_POOL_MAX`) | Não | Ponte `quarkus.datasource.master.jdbc.max-size` | Pool Agroal do master | — | runtime | Decl.: `SubdomainTenancyBridgeConfig.MasterJdbc#maxSize()`, `MPC` |
| `seedgrid.subdomain-tenancy.master.entity-packages` | `Optional<String>` | pacotes Java (CSV) | MPC: vazio (env `SEEDGRID_SUBDOMAIN_TENANCY_MASTER_ENTITY_PACKAGES`) | Não | Prefixada em `quarkus.hibernate-orm.master.packages=${…master.entity-packages},br.com.seedgrid.subdomaintenancy.entities,br.com.seedgrid.billing.entities,br.com.seedgrid.security.entities` | PU `master` | Se o host redefinir `quarkus.hibernate-orm.master.packages` (como o exemplo), esta chave só vale se ele a reutilizar | build (via expansão — Inferência) | Decl.: `SubdomainTenancyBridgeConfig.Master#entityPackages()`, `MPC` |
| `seedgrid.subdomain-tenancy.master.migrations.location.additional` | `Optional<String>` (CSV) | locations Flyway, ex. `classpath:db/migration/master-extra` | MPC: vazio | Não | Anexadas à base `classpath:db/migration/master` no mesmo history `flyway_schema_history_master`; versões precisam ser distintas da base | `Migrations#migrateMasterSchema` (startup) | Mesmo history → colisão de versão falha o Flyway | runtime | Decl.: `SubdomainTenancyBridgeConfig.Migrations#locationAdditional()` (`@WithName("location.additional")`), `SubdomainTenancyConfig#masterMigrationsLocationAdditional`, `MPC`. Consumo: `RT/flyway/Migrations` (construtor) |
| `database.master.subdomain` | `Optional<String>` | texto | MPC: `${PRODUCT_PREFIX:app}` | Não | Nenhum código da extension a lê (`DatabaseMasterConfig` não é injetado); é um valor auxiliar publicado para o host referenciar em expressões | Expressões `${database.master.subdomain}` no host | Lê a env `PRODUCT_PREFIX`; base de `database.master.name` | runtime | Decl.: `RT/configs/DatabaseMasterConfig#subdomain()`, `MPC` |
| `database.master.name` | `Optional<String>` | texto | MPC: `${database.master.subdomain}_master` | Não | Valor auxiliar para expressões do host; ex.: `…master.datasource.jdbc.url=${SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_URL:jdbc:postgresql://localhost:5439/${database.master.name}}` | Expressões do host | `database.master.subdomain` | runtime | Decl.: `RT/configs/DatabaseMasterConfig#name()`, `MPC` |

### 2.3 Datasource dos tenants (pool, cache e limite)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url` | `Optional<String>` | URL JDBC base **sem** banco, ex. `jdbc:postgresql://host:5432` | `—` (sem `url` nem `url-pattern`: `jdbc:postgresql://localhost:5439/{tenant}`) | Condicional: uma entre `url` e `url-pattern` em produção | `getEffectiveUrlPattern()` remove `/` final e acrescenta `/{tenant}`; `{tenant}` vira o nome do banco (`<prefix>_<tenant>`) | `TenantConnectionResolverImpl`, `TenantProvisioningService#createTenantWithAdmin`, `TenantMigrationCoordinator` | `url-pattern` tem precedência; `product-prefix` | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantJdbc#url()`/`#getEffectiveUrlPattern()` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url-pattern` | `Optional<String>` | URL com placeholder `{tenant}` | `—` | Condicional (ver acima) | Se não-vazia, usada como está (Javadoc: compatibilidade/legado) | idem | Vence `jdbc.url` | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantJdbc#urlPattern()` |
| `seedgrid.subdomain-tenancy.tenant.datasource.username` | `Optional<String>` | usuário do banco | `—` no MPC; fallback `postgres` no código | Sim em produção | Usuário de todos os bancos de tenant; também usado como `OWNER` no `CREATE DATABASE` (provisionamento) | Resolver (via `getOptionalValue`, vazio → `postgres`), provisionamento e coordinator (via mapping) | Precisa de permissão `CREATE DATABASE` | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantDatasource#username()`. Consumo: `TenantConnectionResolverImpl#getTenantUsername`, `TenantProvisioningService`, `TenantMigrationCoordinator` |
| 🔒 `seedgrid.subdomain-tenancy.tenant.datasource.password` | `Optional<String>` | segredo | `—` no MPC; fallback `postgres` no código | Sim em produção | idem | idem | — | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantDatasource#password()`. Consumo: `TenantConnectionResolverImpl#getTenantPassword`, `TenantProvisioningService`, `TenantMigrationCoordinator` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.driver` | `String` | FQCN de driver JDBC | `org.postgresql.Driver` | Não | `Class.forName(driver)` antes de criar o pool do tenant | `TenantConnectionResolverImpl#createDataSourceForTenant` | Provisionamento/coordinator não usam esta chave | runtime | Decl.: `@ConfigProperty` em `TenantConnectionResolverImpl` (construtor), `SubdomainTenancyBridgeConfig.TenantJdbc#driver()` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.min-size` | `Optional<Integer>` | ≥ 0 | MPC: `0` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_POOL_MIN`) | Não | Pool mínimo por tenant (`Math.max(0, v)`) | `TenantConnectionResolverImpl` | Também copiada para `quarkus.datasource.jdbc.min-size` (datasource default) | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantJdbc#minSize()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.max-size` | `Optional<Integer>` | ≥ 1 | MPC: `5` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_POOL_MAX`) | Não | Pool máximo por tenant (`Math.max(1, v)`) | `TenantConnectionResolverImpl` | Também em `quarkus.datasource.jdbc.max-size`; conexões totais ≈ `max-size × max-active-datasources` (Inferência) | runtime | Decl.: `SubdomainTenancyBridgeConfig.TenantJdbc#maxSize()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.idle-timeout` | `Duration` | ISO-8601, ex. `PT30M` | `PT30M` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_IDLE_TIMEOUT`) | Não | Idle timeout das conexões do pool do tenant | `SimpleDriverDataSource` criado pelo resolver | — | runtime | Decl.: `@ConfigProperty` em `TenantConnectionResolverImpl`, `SubdomainTenancyBridgeConfig.TenantJdbc#idleTimeout()` (`String`), `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.acquisition-timeout` | `Duration` | ISO-8601 | `PT30S` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_ACQUISITION_TIMEOUT`) | Não | Timeout para obter conexão do pool | idem | — | runtime | idem (`#acquisitionTimeout()`) |
| `seedgrid.subdomain-tenancy.tenant.datasource.max-active-datasources` | `int` | ≥ 1 (menor vira 1) | `200` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_MAX_ACTIVE_DATASOURCES`) | Não | Teto de pools de tenant em cache por instância. No teto, evicta o pool ocioso menos usado (LRU, só sem conexões ativas); sem candidato lança `TenantProvisioningException("Maximum active tenant datasources reached …")` | `TenantConnectionResolverImpl#getOrCreateTenantDataSource` | Métrica `seedgrid.subdomain-tenancy.tenant.datasource.evictions{reason=lru}` | runtime | Decl.: `@ConfigProperty` em `TenantConnectionResolverImpl`, `SubdomainTenancyBridgeConfig.TenantDatasource#maxActiveDatasources()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.cache.idle-eviction` | `Duration` | ISO-8601 > 0 | `PT30M` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DS_CACHE_IDLE_EVICTION`) | Não | Pool sem acesso há esse tempo e sem conexões ativas é fechado (TTL). Valor ≤ 0 vira 30 min; mínimo efetivo 1 s | `TenantConnectionResolverImpl#evictExpiredIdleDataSourcesLocked` | `cleanup-interval`; métrica `…evictions{reason=ttl}` | runtime | Decl.: `@ConfigProperty` em `TenantConnectionResolverImpl`, `SubdomainTenancyBridgeConfig.Cache#idleEviction()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.cache.cleanup-interval` | `Duration` | ISO-8601 > 0 | `PT1M` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DS_CACHE_CLEANUP_INTERVAL`) | Não | Período da thread daemon `tenant-datasource-cache-evictor`. ≤ 0 vira 1 min; mínimo efetivo 1 s | idem (construtor) | `idle-eviction` | runtime | Decl.: idem (`Cache#cleanupInterval()`) |
| `seedgrid.subdomain-tenancy.tenant.entity-packages` | `Optional<String>` | pacotes Java (CSV) | MPC: vazio (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_ENTITY_PACKAGES`) | Não | Prefixada em `quarkus.hibernate-orm.packages=${…tenant.entity-packages},br.com.seedgrid.security.entities,br.com.seedgrid.backup.entities,br.com.seedgrid.audit.entities` | PU default (multitenant) | O exemplo redefine `quarkus.hibernate-orm.packages` reaproveitando esta chave | build (via expansão — Inferência) | Decl.: `SubdomainTenancyBridgeConfig.Tenant#entityPackages()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.migrations.location.additional` | `Optional<String>` (CSV) | locations Flyway | MPC: vazio | Não | Anexadas à base `classpath:db/migration/tenant` no history `flyway_schema_history_tenant` | `Migrations#migrateTenantSchema` (provisionamento e migração por tenant) | Rodam **depois** do schema security no banco do tenant | runtime | Decl.: `SubdomainTenancyBridgeConfig.Migrations#locationAdditional()`, `SubdomainTenancyConfig#tenantMigrationsLocationAdditional`, `MPC`. Consumo: `RT/flyway/Migrations` |

### 2.4 Circuit breaker das conexões de tenant

Um `io.smallrye.faulttolerance.api.Guard` por tenant (`tenant-datasource-<tenant>`), `failOn(SQLException)`. Circuito aberto → `SQLTransientConnectionException` e métrica `seedgrid.subdomain-tenancy.tenant.datasource.connection.circuit.open`.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.failure-ratio` | `double` | (0, 1]; ≤ 0 vira `0.5`, ≥ 1 vira `1.0` | `0.5` (env `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_CB_FAILURE_RATIO`) | Não | Razão de falhas que abre o circuito | `TenantConnectionResolverImpl#buildTenantConnectionCircuitBreaker` | `request-volume-threshold` | runtime | Decl.: `@ConfigProperty` em `TenantConnectionResolverImpl`, `SubdomainTenancyBridgeConfig.CircuitBreaker#failureRatio()`, `MPC` |
| `seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.request-volume-threshold` | `int` | ≥ 2 (menor vira 2) | `6` (env `…_TENANT_DB_CB_REQUEST_VOLUME_THRESHOLD`) | Não | Janela mínima de chamadas para avaliar a razão | idem | — | runtime | idem (`#requestVolumeThreshold()`) |
| `seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.delay` | `Duration` | ISO-8601 > 0 (≤ 0 vira 30 s) | `PT30S` (env `…_TENANT_DB_CB_DELAY`) | Não | Tempo aberto antes de half-open | idem | — | runtime | idem (`#delay()`, `String` no mapping) |
| `seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.success-threshold` | `int` | ≥ 1 | `2` (env `…_TENANT_DB_CB_SUCCESS_THRESHOLD`) | Não | Sucessos em half-open para fechar | idem | — | runtime | idem (`#successThreshold()`) |

### 2.5 Orquestração de migrations por tenant

Estado em `tenant_migration_state` (master), lock com fencing token e heartbeat. Ordem no banco do tenant: security → tenant (+ additional) → audit (se `seedgrid.audit.persistence.strategy=jpa`) → backup → apikeys.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.migration.enabled` | `boolean` | `true`/`false` | `true` (env `SEEDGRID_SUBDOMAIN_TENANCY_MIGRATION_ENABLED`) | Não | `false`: o gate de login não age e o coordinator devolve "Migration bypassed" (READY) | `TenantMigrationCoordinator`, `TenantMigrationGateFilter` | Não afeta as migrations do master no startup | runtime | Decl.: `@ConfigProperty` em ambos os construtores, `SubdomainTenancyBridgeConfig.Migration#enabled()`, `MPC` |
| `seedgrid.subdomain-tenancy.migration.trigger-on-login` | `boolean` | `true`/`false` | `true` (env `…_MIGRATION_TRIGGER_ON_LOGIN`) | Não | Em request (não-`OPTIONS`) cujo path começa com um `login-paths`, para tenant ≠ master, garante a migração; se não estiver READY responde `503` + `Retry-After: 15` (`tenant_migration_in_progress`/`tenant_migration_failed`) | `TenantMigrationGateFilter#filter` | `enabled`, `login-paths` | runtime | Decl.: `@ConfigProperty` em `RT/filters/TenantMigrationGateFilter`, `Migration#triggerOnLogin()`, `MPC` |
| `seedgrid.subdomain-tenancy.migration.login-paths` | `String` (CSV) | prefixos de path | `/auth/login` (env `…_MIGRATION_LOGIN_PATHS`) | Não | Separado por vírgula, `trim`, match por `startsWith` | `TenantMigrationGateFilter` | `trigger-on-login` | runtime | idem (`Migration#loginPaths()`) |
| `seedgrid.subdomain-tenancy.migration.startup-migrate-all-tenants` | `boolean` | `true`/`false` | `false` (env `…_MIGRATION_STARTUP_ALL_TENANTS`) | Não | `true`: após migrar o master, enfileira (assíncrono) a migração de todos os tenants ativos, em páginas de 200 | `MigrationService#onStart` | `max-concurrency` | runtime | Decl.: `@ConfigProperty` em `RT/flyway/MigrationService`, `Migration#startupMigrateAllTenants()`, `MPC` |
| `seedgrid.subdomain-tenancy.migration.target-version` | `String` | rótulo livre | `v1` (env `…_MIGRATION_TARGET_VERSION`) | Não | Tenant só é "pronto" se `status=READY` e `targetVersion == currentVersion == target-version`; mudar o valor força nova migração no próximo gatilho | `TenantMigrationCoordinator#isAlreadyReady` | — | runtime | Decl.: `@ConfigProperty` em `TenantMigrationCoordinator`, `Migration#targetVersion()`, `MPC` |
| `seedgrid.subdomain-tenancy.migration.max-concurrency` | `int` | ≥ 1 | `3` (env `…_MIGRATION_MAX_CONCURRENCY`) | Não | Tamanho do pool `tenant-migration-login` e do semáforo; sem vaga devolve "Migration capacity reached" | `TenantMigrationCoordinator` | — | runtime | idem (`Migration#maxConcurrency()`) |
| `seedgrid.subdomain-tenancy.migration.lock-lease` | `Duration` | ISO-8601 | `PT10M` (env `…_MIGRATION_LOCK_LEASE`) | Não | Validade do lock; heartbeat a cada `lease/3` (mínimo 5 s) | `TenantMigrationCoordinator` | `instance-id` | runtime | Decl.: `@ConfigProperty` (`Duration`), `Migration#lockLease()` (`String`), `MPC` |
| `seedgrid.subdomain-tenancy.migration.instance-id` | `Optional<String>` | texto | `—` (MPC: `${…_MIGRATION_INSTANCE_ID:}` → vazio = ausente) | Não | Dono do lock; vazio → `instance-<UUID aleatório>` a cada boot | `TenantMigrationCoordinator` | — | runtime | Decl.: `@ConfigProperty` em `TenantMigrationCoordinator`, `Migration#instanceId()`, `MPC` |

### 2.6 Bootstrap do admin global (banco master)

Executado por `MigrationService#masterMigrate` → `AdminUserBootstrapService#seedAdminUserIfNeeded` **somente** se a tabela `users` do master existir e estiver vazia.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.admin-user.name` | `Optional<String>` | texto | MPC: vazio (env `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_NAME`) | Condicional: obrigatória quando `users` do master está vazia — senão `IllegalStateException("Missing required property: …")` derruba o startup | Nome do admin global | `AdminUserBootstrapService#seedAdminUserIfNeeded` | `email` | runtime | Decl.: `RT/configs/SubdomainTenancyAdminUserConfig#name()`, `SubdomainTenancyBridgeConfig.AdminUser#name()`, `MPC` |
| `seedgrid.subdomain-tenancy.admin-user.email` | `Optional<String>` | e-mail | MPC: vazio (env `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_EMAIL`) | Condicional (idem) | Normalizado (`trim().toLowerCase()`) | idem | — | runtime | idem (`#email()`) |
| 🔒 `seedgrid.subdomain-tenancy.admin-user.initial-password` | `Optional<String>` | senha que passe em `PasswordService#validate` (security) | MPC: vazio (env `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_INITIAL_PASSWORD`) | Não | Vazia → senha gerada por `PasswordGenerator` e enviada por e-mail de boas-vindas (se o e-mail falhar, o admin fica sem a senha) | `AdminUserBootstrapService#resolvePassword` | Política de senha do `seedgrid-security` | runtime | idem (`#initialPassword()`) |

### 2.7 E-mail (mailer nomeado `subdomaintenancy`)

As chaves têm efeito via ponte do `MPC` para o mailer nomeado `quarkus.mailer."subdomaintenancy".*`, usado por `RT/spi/impl/MailerNotificationService` (`@MailerName("subdomaintenancy")`, `@DefaultBean`) para enviar o OTP. Nenhum código lê as chaves `seedgrid.subdomain-tenancy.mailer.*` diretamente.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.mailer.from` | `Optional<String>` | e-mail | MPC: `noreply@example.com` (env `SEEDGRID_SUBDOMAIN_TENANCY_MAILER_FROM`) | Condicional (para envio real) | → `quarkus.mailer."subdomaintenancy".from` | Envio do OTP de validação | — | runtime | Decl.: `SubdomainTenancyMailerConfig#from()`, `SubdomainTenancyBridgeConfig.Mailer#from()`, `MPC` |
| `seedgrid.subdomain-tenancy.mailer.host` | `Optional<String>` | host SMTP | MPC: `smtp.gmail.com` (env `…_MAILER_HOST`) | Condicional | → `…".host` | idem | — | runtime | idem (`#host()`) |
| `seedgrid.subdomain-tenancy.mailer.port` | `Optional<Integer>` | porta | MPC: `587` (env `…_MAILER_PORT`) | Não | → `…".port` | idem | — | runtime | idem (`#port()`) |
| `seedgrid.subdomain-tenancy.mailer.start-tls` | `Optional<String>` | `DISABLED`/`OPTIONAL`/`REQUIRED` (valores do Quarkus Mailer) | MPC: `REQUIRED` (env `…_MAILER_START_TLS`) | Não | → `…".start-tls` | idem | — | runtime | idem (`#startTls()`) |
| `seedgrid.subdomain-tenancy.mailer.username` | `Optional<String>` | usuário SMTP | MPC: vazio (env `…_MAILER_USERNAME`) | Condicional (SMTP autenticado) | → `…".username` | idem | — | runtime | idem (`#username()`) |
| 🔒 `seedgrid.subdomain-tenancy.mailer.password` | `Optional<String>` | segredo | MPC: vazio (env `…_MAILER_PASSWORD`) | Condicional | → `…".password` | idem | — | runtime | idem (`#password()`) |
| `seedgrid.subdomain-tenancy.mailer.auth-methods` | `Optional<String>` | métodos SMTP AUTH separados por espaço | MPC: `PLAIN LOGIN` (env `…_MAILER_AUTH_METHODS`) | Não | → `…".auth-methods`; evita XOAUTH2 automático do Vert.x (Gmail) | idem | — | runtime | idem (`#authMethods()`) |

### 2.8 Signup, OTP e limpeza

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.subdomain-tenancy.otp-expiry-minutes` | `int` | minutos > 0 | `10` | Não | Validade do código OTP de 6 dígitos (`TenantValidationToken.expiresAt`) e valor passado no `TenantValidationNotification.expiryMinutes` | `TenantService#sendValidationEmail` | Não declarada no `SubdomainTenancyBridgeConfig` (ciclo em andamento: passa a entrar no mapping, ver [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]]) | runtime | Decl./consumo: `@ConfigProperty` em `RT/services/TenantService` (construtor) |
| `seedgrid.subdomain-tenancy.cleanup.not-validated-ttl` | `String` | `48H`, `30M`, `7D`, `PT…` | `48H` (env `SEEDGRID_SUBDOMAIN_TENANCY_CLEANUP_NOT_VALIDATED_TTL`) | Não | Tenants não validados criados antes de `now - ttl` têm o registro removido do master. Parser próprio; erro → 48 h com warning | `TenantCleanupScheduler` (construtor) | O formato combinado `2D12H` citado no Javadoc vira `PT2D12H`, inválido para `Duration.parse` → cai em 48 h (**Inferência** pela gramática ISO-8601) | runtime | Decl.: `SubdomainTenancyBridgeConfig.Cleanup#notValidatedTtl()`, `MPC`. Consumo: `RT/schedulers/TenantCleanupScheduler#parseDuration` |
| `seedgrid.subdomain-tenancy.cleanup.not-validated-cron` | `String` | cron Quartz do Quarkus Scheduler | `0 0 * * * ?` (env `…_CLEANUP_NOT_VALIDATED_CRON`) | Não | Agenda `cleanupExpiredTenants` (só roda se `flyway_schema_history_subdomain_tenancy` existir) | `@Scheduled(cron = "{seedgrid.subdomain-tenancy.cleanup.not-validated-cron}")` | `not-validated-ttl` | runtime | Decl.: `SubdomainTenancyBridgeConfig.Cleanup#notValidatedCron()`, `MPC`. Consumo: `TenantCleanupScheduler#cleanupExpiredTenants` |

> O cleanup chama `TenantProvisioningService#deleteTenantConfigById`, que só remove a linha de `tenants`; **não** há `DROP DATABASE` nesse caminho (o Javadoc do scheduler diz "including their databases" — **Confirmado** que o código não faz isso).

## 3. Propriedades de frameworks e de outras extensions

### 3.1 Definidas pela extension no `MPC` (o host pode sobrescrever)

| Propriedade | Valor publicado | Observação |
|---|---|---|
| `quarkus.datasource.master.db-kind` | `postgresql` | Também `PROC` (runtime default) |
| `quarkus.datasource.master.jdbc.url` / `.username` / `.password` / `.jdbc.min-size` / `.jdbc.max-size` | `${seedgrid.subdomain-tenancy.master.datasource.…}` | Ponte do master; `PROC` registra url/username/password com fallback |
| `quarkus.datasource.db-kind` | `postgresql` | Datasource default (tenants); obrigatório com datasources nomeados (Quarkus 3.18+) |
| `quarkus.datasource.jdbc.min-size` / `.max-size` | `${seedgrid.subdomain-tenancy.tenant.datasource.jdbc.min-size/max-size}` | — |
| `quarkus.hibernate-orm.database.generation` | `none` | Também `PROC` |
| `quarkus.hibernate-orm.multitenant` | `DATABASE` | Também `PROC` |
| `quarkus.hibernate-orm.physical-naming-strategy` | `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy` | idem para `.master.` |
| `quarkus.hibernate-orm.dialect` | `org.hibernate.dialect.PostgreSQLDialect` | — |
| `quarkus.hibernate-orm.log.sql` | `false` | — |
| `quarkus.hibernate-orm.packages` | `${…tenant.entity-packages},br.com.seedgrid.security.entities,br.com.seedgrid.backup.entities,br.com.seedgrid.audit.entities` | build time |
| `quarkus.hibernate-orm.master.datasource` / `.database.generation` / `.multitenant` | `master` / `none` / `NONE` | Também `PROC` |
| `quarkus.hibernate-orm.master.packages` | `${…master.entity-packages},br.com.seedgrid.subdomaintenancy.entities,br.com.seedgrid.billing.entities,br.com.seedgrid.security.entities` | build time |
| `quarkus.hibernate-orm.validate-in-dev-mode` / `.master.validate-in-dev-mode` | `false` | — |
| `quarkus.flyway.enabled` / `quarkus.flyway.migrate-at-start` | `false` / `false` | Flyway default desligado |
| `quarkus.flyway.master.migrate-at-start` / `.baseline-on-migrate` / `.out-of-order` / `.validate-on-migrate` | `true` / `true` / `false` / `true` | As migrations reais rodam por Flyway programático (`Migrations`) |
| `quarkus.mailer."subdomaintenancy".from/host/port/start-tls/username/password/auth-methods` | `${seedgrid.subdomain-tenancy.mailer.…}` | Ponte do mailer |
| `quarkus.swagger-ui.urls.default` | `/public/tenant-openapi` | Swagger aponta para o spec filtrado |
| `quarkus.swagger-ui.always-include` / `quarkus.swagger-ui.path` | `false` / `/swagger-ui` | — |
| `quarkus.http.auth.permission.tenant-openapi.paths` / `.policy` / `.methods` | `/public/tenant-openapi` / `permit` / `GET` | Endpoint do spec liberado |
| `quarkus.otel.enabled` / `quarkus.otel.traces.exporter` | `${SEEDGRID_SUBDOMAIN_TENANCY_OTEL_ENABLED:true}` / `${SEEDGRID_SUBDOMAIN_TENANCY_OTEL_TRACES_EXPORTER:none}` | Spans com `tenant_id` |
| `quarkus.micrometer.enabled` / `.export.prometheus.enabled` / `.binder.http-server.enabled` | `${SEEDGRID_SUBDOMAIN_TENANCY_METRICS_ENABLED:true}` / `${…_PROMETHEUS_ENABLED:true}` / `${…_HTTP_METRICS_ENABLED:true}` | Métricas de pool/evicção/circuito/migração |
| `seedgrid.billing.persistence-unit` | `master` | Billing mora no master |
| `seedgrid.ai-pricing.persistence-unit` / `seedgrid.exchange.persistence-unit` | `master` / `master` | Catálogos globais no master |

### 3.2 Lidas pela extension, pertencentes a outras extensions/frameworks

| Propriedade | Padrão no consumo | Efeito aqui | Origem |
|---|---|---|---|
| `seedgrid.audit.persistence.strategy` | `—` | Só com `jpa` (case-insensitive) roda `db/migration/audit` no master e nos tenants | `RT/flyway/Migrations#migrateAuditSchema` |
| `seedgrid.subdomain-tenancy.modules.ai-pricing.enabled` | `true` | Migra `db/migration/ai-pricing` no master; desligado = não migra e as rotas respondem 404 | `RT/flyway/Migrations` |
| `seedgrid.subdomain-tenancy.modules.exchange.enabled` | `true` | Idem para `db/migration/exchange` (master) | `RT/flyway/Migrations` |
| `seedgrid.subdomain-tenancy.modules.business-days.enabled` | `true` | Migra `db/migration/business-days` no master **e em cada tenant** (cada um com o seu calendário) | `RT/flyway/Migrations` |
| `quarkus.mongodb.database` | `default_db` | Sufixo dos bancos Mongo por tenant no `MongoTenantResolverImpl` | `RT/mongodb/MongoTenantResolverImpl` |
| `seedgrid.ratelimit.{tenant-signup\|tenant-validate-email\|tenant-resend-email}.{permits\|window\|enabled}` | anotação: 100/1 min, 10/1 min, 5/1 h; `enabled=true` | Overrides do `@SeedGridRateLimit` nos endpoints públicos (resilience) | `RT/controllers/TenantSignupController`; `java/seedgrid-quarkus-ext-resilience/.../SeedGridRateLimit.java` (Javadoc) |
| `seedgrid.security.frontend.base-url` | (do security) | Base dos links de e-mail; `TenantSecurityLinks` insere `<tenant>.` no host em contexto de tenant | `RT/security/TenantSecurityLinks` (via `SecurityFrontendConfig`) |
| `seedgrid.security.default-company.*` | (do security) | Empresa vinculada ao admin global no bootstrap | `RT/services/AdminUserBootstrapService` (via `DefaultCompanyConfig`) |
| `seedgrid.privacy.encryption.enabled`, `seedgrid.privacy.crypto.key` 🔒, `seedgrid.privacy.search.key` 🔒 | (do privacy) | Criptografia at-rest dos campos PII do `Tenant` (master) | ver [[SeedGrid/Extensions/privacy/Configuracao\|Configuração do privacy]] |

## 4. Propriedades usadas só em testes / exemplos

`java/seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/test/resources/application.properties`, `…/testsupport/SubdomainTenancyPostgresTestResource.java` e `TenantEncryptedFieldsTest.EncryptionOnProfile`:

| Propriedade | Valor/fonte no teste | Observação |
|---|---|---|
| `seedgrid.subdomain-tenancy.domain-suffix` | `test.com` | — |
| `seedgrid.subdomain-tenancy.default-tenant` | `master` | — |
| `seedgrid.subdomain-tenancy.admin-user.name` / `.email` / `.initial-password` 🔒 | valores de teste | — |
| `seedgrid.subdomain-tenancy.master.datasource.jdbc.url/username/password` 🔒 | Testcontainers | via `SubdomainTenancyPostgresTestResource` |
| `seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url-pattern/username/password` 🔒 | Testcontainers | idem; `TenantRegisterResourceIntegrationTest` lê também `product-prefix` |
| `quarkus.datasource.master.*`, `quarkus.hibernate-orm.*`, `quarkus.hibernate-orm.master.*` | ver arquivo | Pacotes de entidades reduzidos |
| `quarkus.flyway.enabled=true`, `quarkus.flyway.master.locations` | security, billing, subdomain-tenancy | — |
| `quarkus.arc.exclude-types` | `…flyway.MigrationService,…security.services.FirstAdminBootstrapService` | Desliga o startup de migrations e o bootstrap do security |
| `quarkus.mailer.mock`, `quarkus.mailer."subdomaintenancy".mock` | `true` | — |
| `mp.jwt.verify.publickey.location` | `classpath:keys/public.pem` | — |
| `quarkus.http.test-port`, `quarkus.http.test-ssl-port` | `0` | — |
| `quarkus.log.level`, `quarkus.log.category."br.com.seedgrid".level` | `INFO` / `DEBUG` | — |
| `seedgrid.ratelimit.tenant-signup/tenant-validate-email/tenant-resend-email.enabled` | `false` | — |
| `seedgrid.security.encryption.key` 🔒, `seedgrid.security.default-company.cnpj/corporate-name/trade-name` | valores de teste | Exigidos pelo security |
| `seedgrid.privacy.encryption.enabled`, `seedgrid.privacy.crypto.key` 🔒, `seedgrid.privacy.search.key` 🔒 | perfil `EncryptionOnProfile` | — |

O app de exemplo (`platform-examples/examples/seedgrid-subdomain-tenancy-example`) usa, além das acima, `product-prefix=${PRODUCT_PREFIX:kb}`, `tenant.datasource.jdbc.url/username/password` via `SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_*` (env vars **criadas pelo exemplo**, não pela lib) e `seedgrid.security.bootstrap.enabled=false`.

## 5. Aliases, obsoletas e renomeações

Não há aliases ativos. A única forma alternativa é `…tenant.datasource.jdbc.url-pattern`, que vence `…jdbc.url` (Javadoc de `TenantJdbc#urlPattern()`: compatibilidade/legado; preferir `…jdbc.url`).


## 6. Configuração mínima (`application.properties`)

```properties
# Resolução por subdomínio: <tenant>.crm.example.com
seedgrid.subdomain-tenancy.domain-suffix=crm.example.com
seedgrid.subdomain-tenancy.product-prefix=crm

# Banco MASTER (catálogo de tenants, security, billing...)
seedgrid.subdomain-tenancy.master.datasource.jdbc.url=jdbc:postgresql://db.example.com:5432/crm_master
seedgrid.subdomain-tenancy.master.datasource.username=<usuario-master>
seedgrid.subdomain-tenancy.master.datasource.password=<SEGREDO:master-db-password>

# Bancos dos tenants (o nome do banco é acrescentado: /crm_<tenant>)
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url=jdbc:postgresql://db.example.com:5432
seedgrid.subdomain-tenancy.tenant.datasource.username=<usuario-com-CREATE-DATABASE>
seedgrid.subdomain-tenancy.tenant.datasource.password=<SEGREDO:tenant-db-password>

# Admin global (obrigatório no 1º boot, quando a tabela users do master está vazia)
seedgrid.subdomain-tenancy.admin-user.name=<nome-admin>
seedgrid.subdomain-tenancy.admin-user.email=<email-admin>

# SMTP do OTP de validação
seedgrid.subdomain-tenancy.mailer.from=<remetente>
seedgrid.subdomain-tenancy.mailer.host=<smtp-host>
seedgrid.subdomain-tenancy.mailer.username=<smtp-user>
seedgrid.subdomain-tenancy.mailer.password=<SEGREDO:smtp-password>
```

Além disso, o `seedgrid-security` exige as suas próprias chaves (JWT, `encryption.key`, `default-company.*`) — ver [[SeedGrid/Extensions/security/Configuracao|Configuração do security]].

## 7. Configuração completa comentada

Valores abaixo são **exemplos válidos**, não padrões. Os padrões estão nas tabelas da seção 2.

```properties
# --- Resolução de tenant ---
seedgrid.subdomain-tenancy.domain-suffix=crm.example.com
#seedgrid.subdomain-tenancy.tenant-header=X-Tenant          # opcional; ver ressalva na tabela 2.1
seedgrid.subdomain-tenancy.default-tenant=master             # manter "master" (literal fixo em vários pontos)
seedgrid.subdomain-tenancy.product-prefix=crm
seedgrid.subdomain-tenancy.openapi.master-only-paths=/admin,/backoffice

# --- Master ---
seedgrid.subdomain-tenancy.master.datasource.jdbc.url=jdbc:postgresql://db:5432/crm_master
seedgrid.subdomain-tenancy.master.datasource.username=<usuario-master>
seedgrid.subdomain-tenancy.master.datasource.password=<SEGREDO:master-db-password>
seedgrid.subdomain-tenancy.master.datasource.jdbc.min-size=1
seedgrid.subdomain-tenancy.master.datasource.jdbc.max-size=20
seedgrid.subdomain-tenancy.master.entity-packages=com.acme.crm.master.entities
seedgrid.subdomain-tenancy.master.migrations.location.additional=classpath:db/migration/master-extra

# --- Tenants: conexão ---
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url=jdbc:postgresql://db:5432
#seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url-pattern=jdbc:postgresql://db:5432/{tenant}?sslmode=require
seedgrid.subdomain-tenancy.tenant.datasource.username=<usuario-tenants>
seedgrid.subdomain-tenancy.tenant.datasource.password=<SEGREDO:tenant-db-password>
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.driver=org.postgresql.Driver
seedgrid.subdomain-tenancy.tenant.entity-packages=com.acme.crm.tenant.entities
seedgrid.subdomain-tenancy.tenant.migrations.location.additional=classpath:db/migration/tenant-extra

# --- Tenants: pool por tenant ---
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.min-size=0
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.max-size=5
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.idle-timeout=PT15M
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.acquisition-timeout=PT10S

# --- Tenants: cache de pools ---
seedgrid.subdomain-tenancy.tenant.datasource.max-active-datasources=100
seedgrid.subdomain-tenancy.tenant.datasource.cache.idle-eviction=PT20M
seedgrid.subdomain-tenancy.tenant.datasource.cache.cleanup-interval=PT1M

# --- Tenants: circuit breaker ---
seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.failure-ratio=0.5
seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.request-volume-threshold=10
seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.delay=PT20S
seedgrid.subdomain-tenancy.tenant.datasource.circuit-breaker.success-threshold=2

# --- Migrations por tenant ---
seedgrid.subdomain-tenancy.migration.enabled=true
seedgrid.subdomain-tenancy.migration.trigger-on-login=true
seedgrid.subdomain-tenancy.migration.login-paths=/auth/login,/auth/2f
seedgrid.subdomain-tenancy.migration.startup-migrate-all-tenants=false
seedgrid.subdomain-tenancy.migration.target-version=v2
seedgrid.subdomain-tenancy.migration.max-concurrency=3
seedgrid.subdomain-tenancy.migration.lock-lease=PT10M
seedgrid.subdomain-tenancy.migration.instance-id=${HOSTNAME}

# --- Admin global ---
seedgrid.subdomain-tenancy.admin-user.name=<nome-admin>
seedgrid.subdomain-tenancy.admin-user.email=<email-admin>
#seedgrid.subdomain-tenancy.admin-user.initial-password=<SEGREDO:admin-initial-password>   # vazio = gerada

# --- E-mail ---
seedgrid.subdomain-tenancy.mailer.from=<remetente>
seedgrid.subdomain-tenancy.mailer.host=<smtp-host>
seedgrid.subdomain-tenancy.mailer.port=587
seedgrid.subdomain-tenancy.mailer.start-tls=REQUIRED
seedgrid.subdomain-tenancy.mailer.username=<smtp-user>
seedgrid.subdomain-tenancy.mailer.password=<SEGREDO:smtp-password>
seedgrid.subdomain-tenancy.mailer.auth-methods=PLAIN LOGIN

# --- Signup / limpeza ---
seedgrid.subdomain-tenancy.otp-expiry-minutes=15
seedgrid.subdomain-tenancy.cleanup.not-validated-ttl=72H
seedgrid.subdomain-tenancy.cleanup.not-validated-cron=0 0 * * * ?

# --- Rate limit dos endpoints públicos (seedgrid-resilience) ---
seedgrid.ratelimit.tenant-signup.permits=50
seedgrid.ratelimit.tenant-signup.window=PT1M
```

## 8. Receitas

- **Desenvolvimento local com `*.localhost`**: `domain-suffix=localhost` (o extractor exige que o host termine no sufixo e que o prefixo case `^[a-z0-9-]+$`). Atrás de proxy, garanta `X-Forwarded-Host`.
- **Escalar muitos tenants por instância**: ajuste `max-active-datasources` × `jdbc.max-size` ao `max_connections` do Postgres; reduza `cache.idle-eviction` para liberar pools ociosos mais cedo.
- **Liberar nova versão de schema de tenant**: publique as migrations em `db/migration/tenant` (ou em `tenant.migrations.location.additional`) e troque `migration.target-version` (ex.: `v1` → `v2`). Os tenants migram no próximo login (`503` + `Retry-After` enquanto migram) ou manualmente via `POST /internal/migrations/tenants/{tenantId}/trigger?force=true`. Para migrar tudo no boot: `migration.startup-migrate-all-tenants=true`.
- **Desligar o gate de login** (ex.: migrações feitas por pipeline): `migration.trigger-on-login=false` ou `migration.enabled=false`.
- **Várias réplicas**: defina `migration.instance-id` estável por pod para facilitar diagnóstico do lock (sem ela, cada boot gera `instance-<UUID>`).
- **Esconder APIs administrativas do Swagger dos tenants**: acrescente prefixos em `openapi.master-only-paths` ou marque recursos com `@MasterOnly`.
- **Afrouxar/apertar rate limit do signup**: `seedgrid.ratelimit.tenant-signup.permits`/`.window`/`.enabled` (ver [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience]]).

## 9. Dúvidas e lacunas

1. **Regex de subdomínio divergente** (Confirmado): signup aceita `^[a-z0-9_]{5,50}$` (`TenantSignupRequest`) e `TenantSecurityLinks` exige `[a-z0-9_]{5,50}`, mas `TenantHostExtractor` só aceita `^[a-z0-9-]+$` (o teste `shouldReturnNullForInvalidTenantFormat` confirma que `_` é rejeitado). Um tenant com `_` no nome não é resolvido pelo host e cai em `master`.
2. `tenant-header` e `otp-expiry-minutes` não estão no `SubdomainTenancyBridgeConfig`, cujo Javadoc diz existir para evitar avisos de chave desconhecida. Se o Quarkus emite aviso para essas chaves **não foi confirmado**.
3. `default-tenant` diferente de `master` não é suportado de forma consistente (literais `"master"` espalhados) — Inferência.
4. Fallback de URL do master no `MigrationService` (`jdbc://postgress:localhost:5432/xxx_master`) é inválido; na prática o `MPC` sempre preenche a chave.
5. `cleanup.not-validated-ttl` em formato `2D12H` (citado no Javadoc) cai no padrão de 48 h — Inferência pela gramática do `java.time.Duration`.
6. `TenantCleanupScheduler` não apaga o banco do tenant, apesar do Javadoc.
7. `quarkus.hibernate-orm.*packages` ser build-time (fase das chaves `entity-packages`) é Inferência baseada no Quarkus 3.30, não verificada nesta extension.
