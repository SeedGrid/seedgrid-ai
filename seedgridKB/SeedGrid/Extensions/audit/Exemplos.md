---
tags: [seedgrid, extension, audit, exemplos]
fonte: java/seedgrid-quarkus-ext-audit
branch: main
commit: d5bf32e509
analisado-em: 2026-10-14
---

# SeedGrid Audit — Exemplos

Voltar: [[SeedGrid/Extensions/audit/Visao-geral|Visão geral do audit]] · [[SeedGrid/Extensions/audit/Configuracao|Configuração do audit]]

Fontes: `java/seedgrid-quarkus-ext-audit/README.md` (seção "Como usar"), assinaturas em `seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/**`. Configuração de propriedades: ver a nota de Configuração (não repetida aqui).

## 1. Dependência Maven (strategy JPA)

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-audit-postgresql</artifactId>
    <version>2026.09.25</version>
</dependency>
```
Para MongoDB troque por `seedgrid-audit-mongodb`. Versão conforme pom no commit analisado.

## 2. Auditar CREATE/UPDATE (README)

```java
import br.com.seedgrid.audit.core.annotations.SgAudit;
import br.com.seedgrid.audit.core.enums.AuditOperationEnum;

@ApplicationScoped
public class UserService {

    @Transactional
    @SgAudit(entityFqcn = "br.com.seuapp.entities.User",
           operation = AuditOperationEnum.CREATE,
           description = "Cria novo usuário")
    public User createUser(User user) {
        return user; // estado "depois" capturado após proceed()
    }

    @Transactional
    @SgAudit(entityFqcn = "br.com.seuapp.entities.User",
           operation = AuditOperationEnum.UPDATE,
           description = "Atualiza usuário")
    public User updateUser(Long id, User user) { // antes (lookup por @Id Long) + depois
        return user;
    }
}
```
O repository usado no lookup é derivado: `br.com.seuapp.entities.User` → `br.com.seuapp.repositories.UserRepository` (precisa expor `findByIdOptional`, ou `find(String, Object...)` para lookups por campo).

## 3. Lookup explícito

```java
// Por método do repository
@SgAudit(entityFqcn = "br.com.seuapp.entities.LegacyPerson",
       operation = AuditOperationEnum.READ,
       lookupMethod = "findByDocument")
public LegacyPerson findByDocument(String document) { ... }

// Por campos, na ordem dos argumentos: "tenantId = ?1 and publicId = ?2"
@SgAudit(entityFqcn = "br.com.seuapp.entities.Customer",
       operation = AuditOperationEnum.UPDATE,
       lookups = { @SgAuditLookup(field = "tenantId"), @SgAuditLookup(field = "publicId") })
public Customer update(String tenantId, String publicId, Customer input) { ... }
```
Usar `lookupMethod` e `lookups` juntos falha o build (`AuditProcessor`).

## 4. Mascaramento (delegado ao seedgrid-privacy)

```java
import br.com.seedgrid.privacy.masking.SgMaskRule;
import br.com.seedgrid.privacy.masking.MaskingStrategy;
import br.com.seedgrid.privacy.masking.SgPersonalData;

public class User {
    @SgPersonalData(type = MaskingStrategy.PARTIAL, maskWith = "2")
    private String cpf;
}

@SgAudit(entityFqcn = "br.com.seuapp.entities.User",
       operation = AuditOperationEnum.UPDATE,
       options = { @SgMaskRule(field = "password", remove = true) })
public User update(Long id, User u) { ... }
```
Fonte: README e `AuditMaskingTest`. Detalhes das estratégias: [[SeedGrid/Extensions/privacy/Visao-geral|privacy]].

## 5. Auditoria programática

```java
import br.com.seedgrid.audit.core.entities.AuditLog;
import br.com.seedgrid.audit.core.enums.AuditOperationEnum;
import br.com.seedgrid.audit.core.services.AuditEmitter;

AuditLog log = new AuditLog();
log.setOperation(AuditOperationEnum.OTHER);
log.setEntity("Report");
log.setDescription("Exportação de relatório");
log.setUserName("job-scheduler");
log.setOperationDateTime(java.time.Instant.now());
AuditEmitter.emit(log); // best-effort: nunca lança; usa AuditGateway (enriquece + persiste)
```
Alternativa: injetar `AuditGateway` e chamar `persist(log)`. Fonte: `AuditEmitter`, `AuditGatewayImpl`, setters de `AuditLog`.

## 6. Contribuir metadata (SPI)

```java
import br.com.seedgrid.audit.core.services.AuditMetadataContributor;

@RequestScoped
public class CompanyAuditMetadata implements AuditMetadataContributor {
    @Inject JsonWebToken jwt;

    @Override
    public Map<String, String> contribute() {
        String company = jwt.getClaim("companyPublicId"); // nome do claim é do host
        return company == null ? Map.of() : Map.of("companyPublicId", company);
    }
}
```
Todas as implementações são mescladas (`AuditEnricher`); contribuidor que lança é ignorado. Filtro: `GET /audit-logs?metaKey=companyPublicId&metaValue=<uuid>`.

## 7. Forçar escopo de leitura (SPI)

```java
import br.com.seedgrid.audit.core.spi.AuditReadScope;
import br.com.seedgrid.audit.core.spi.AuditReadScopeProvider;

@ApplicationScoped // sem @DefaultBean: vence DefaultAuditReadScopeProvider
public class TenantAuditReadScope implements AuditReadScopeProvider {
    @Override
    public AuditReadScope resolveReadScope() {
        String company = /* obter do contexto de segurança */ null;
        return company == null ? AuditReadScope.unrestricted()
                               : AuditReadScope.of("companyPublicId", company);
    }
}
```
Com escopo restrito, `AuditLogController` sobrescreve `metaKey/metaValue` do cliente e responde 404 em `/audit-logs/{id}` fora do escopo.

## 8. Leitura REST

```http
GET /audit-logs?entity=User&operation=UPDATE&operationDateFrom=2026-06-01&page=0&size=20
GET /audit-logs/42
GET /audit-logs/entities
GET /audit-logs/users
```
Exige permissão `LOG_READ`.
