---
tags: [seedgrid, extension, audit, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-audit
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# audit (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/audit/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-audit` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#AuditPersistenceProvider]] | sem padrão | Precisa de implementação do host. |
| [[#AuditReadScopeProvider]] | `DefaultAuditReadScopeProvider` | Default IRRESTRITO: o audit-core e agnostico de company/tenant, entao por padrao nao restringe nada (le como hoje). Hosts que precisam de isolamento fornecem outra impl de `AuditReadScopeProvider` (sem `@DefaultBean`), que vence esta. |

## AuditPersistenceProvider

Ponte entre o audit-core e um backend de persistência (PostgreSQL por JPA ou MongoDB). Cada módulo de persistência registra uma implementação. O `AuditPersistenceRouter` escolhe a que declara a mesma `AuditPersistenceStrategy` configurada em `seedgrid.audit.persistence.strategy` e expõe os repositórios dela como beans.

**Pacote:** `br.com.seedgrid.audit.core.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `MongoAuditPersistenceProvider` (`seedgrid-quarkus-ext-audit/seedgrid-quarkus-ext-audit-mongodb/runtime/src/main/java/br/com/seedgrid/audit/mongodb/configs/MongoAuditPersistenceProvider.java`)
- `PostgreSqlAuditPersistenceProvider` (`seedgrid-quarkus-ext-audit/seedgrid-quarkus-ext-audit-postgresql/runtime/src/main/java/br/com/seedgrid/audit/postgresql/configs/PostgreSqlAuditPersistenceProvider.java`)

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `AuditPersistenceStrategy strategy()` | Estratégia que esta implementação atende (`JPA` ou `MONGODB`). |
| `AuditLogRepository auditLogRepository()` | Repositório dos registros de auditoria (o log principal). |
| `AuditLogUsersRepository auditLogUsersRepository()` | Repositório dos usuários que aparecem na auditoria, usado para filtros de consulta. |
| `AuditLogEntitiesRepository auditLogEntitiesRepository()` | Repositório das entidades que aparecem na auditoria, usado para filtros de consulta. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuAuditPersistenceProvider implements AuditPersistenceProvider {
    @Override
    public AuditPersistenceStrategy strategy() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public AuditLogRepository auditLogRepository() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public AuditLogUsersRepository auditLogUsersRepository() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public AuditLogEntitiesRepository auditLogEntitiesRepository() {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## AuditReadScopeProvider

SPI para o host FORCAR o escopo de leitura do audit (server-side), sem acoplar o audit-core a company/tenant. O `AuditLogController` consulta esta SPI e, se o escopo for restrito, sobrescreve o filtro de metadata — assim o cliente nao ve logs fora do seu escopo, mesmo manipulando a query. Default (`DefaultAuditReadScopeProvider`): IRRESTRITO (le como hoje).

**Pacote:** `br.com.seedgrid.audit.core.spis`

**Padrão (`@DefaultBean`):**

- `DefaultAuditReadScopeProvider` — Default IRRESTRITO: o audit-core e agnostico de company/tenant, entao por padrao nao restringe nada (le como hoje). Hosts que precisam de isolamento fornecem outra impl de `AuditReadScopeProvider` (sem `@DefaultBean`), que vence esta.

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancyAuditReadScopeProvider` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/LoginTenancyAuditReadScopeProvider.java`) — Enforce de leitura do audit no modelo login-tenancy (base compartilhada, logs separados por `companyId` na metadata). Vence o `DefaultAuditReadScopeProvider` do audit-core.
- `TenantAuditScopeProvider` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/audit/TenantAuditScopeProvider.java`) — Acrescenta o tenant ao metadata da auditoria e escopa a leitura no audit compartilhado.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `AuditReadScope resolveReadScope()` | Escopo a forçar na leitura, ou `AuditReadScope.unrestricted()` para não restringir. |

**Exemplo de implementação:**

```java
@RequestScoped
public class PorEmpresaAuditReadScopeProvider implements AuditReadScopeProvider {

    @Inject
    CompanyRequestContext company;

    @Override
    public AuditReadScope resolveReadScope() {
        if (company.isPlatform()) {
            return AuditReadScope.unrestricted();
        }
        // o cliente so ve logs cujo metadata companyId e' o da sua empresa
        return AuditReadScope.of("companyId", String.valueOf(company.currentId()));
    }
}
```
