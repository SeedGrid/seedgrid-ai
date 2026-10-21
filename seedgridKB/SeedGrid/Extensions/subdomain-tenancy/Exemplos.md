---
tags: [seedgrid, extension, subdomain-tenancy, exemplos]
fonte: java/seedgrid-quarkus-ext-subdomain-tenancy, platform-examples/examples/seedgrid-subdomain-tenancy-example
branch: main
commit: fe62530a29
analisado-em: 2026-10-14
---

# subdomain-tenancy — Exemplos (Quarkus)

Visão geral: [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral|Visão geral do subdomain-tenancy]] · Catálogo de propriedades: [[SeedGrid/Extensions/subdomain-tenancy/Configuracao|Configuração do subdomain-tenancy]] · [[SeedGrid/Extensions/subdomain-tenancy/Rust|Porte Rust]]

Fontes: app de exemplo `platform-examples/examples/seedgrid-subdomain-tenancy-example` (repositório git próprio, commit `cd83edd` — fora da tabela de commits da análise), `README.md` da extension e o código do runtime (commit `fe62530a29`).

## 1. Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-subdomain-tenancy</artifactId>
    <version>2026.10.14-1</version>
</dependency>
```

O exemplo usa a propriedade `seedgrid.subdomain-tenancy.version` (`2026.10.13` no pom dele) e importa o parent da extension como BOM para não pinar commons/security/billing… à mão (comentário no `pom.xml` do exemplo).

## 2. Configuração do host (trecho real do exemplo)

`platform-examples/examples/seedgrid-subdomain-tenancy-example/src/main/resources/application.properties` — segredos substituídos por placeholders e só com as chaves que têm efeito:

```properties
# Entidades do app somadas às da lib (reaproveita as chaves da extension)
quarkus.hibernate-orm.packages=${seedgrid.subdomain-tenancy.tenant.entity-packages},br.com.seedgrid.security.entities,br.com.seedgrid.backup.entities,br.com.seedgrid.apikeys.entities
quarkus.hibernate-orm.master.packages=${seedgrid.subdomain-tenancy.master.entity-packages},br.com.seedgrid.subdomaintenancy.entities

seedgrid.subdomain-tenancy.product-prefix=${PRODUCT_PREFIX:kb}

# Ponte do datasource dos TENANTS com env vars curtas (criadas pelo exemplo, não pela lib)
seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url=${SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_URL:jdbc:postgresql://localhost:5439}
seedgrid.subdomain-tenancy.tenant.datasource.username=${SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_USERNAME:postgres}
seedgrid.subdomain-tenancy.tenant.datasource.password=<SEGREDO:tenant-db-password>

# Bootstrap de startup do security desligado (pressupõe banco único)
seedgrid.security.bootstrap.enabled=false
```

Observação (**Confirmado** no código da extension): `domain-suffix`, `master.datasource.*`, `mailer.*`, `admin-user.*`, `cleanup.*` vêm do `microprofile-config.properties` da extension e são ajustadas por env vars `SEEDGRID_SUBDOMAIN_TENANCY_*` (lista em [[SeedGrid/Extensions/subdomain-tenancy/Configuracao|Configuração]]).

## 3. Entidades e repositórios: master × tenant

PU default = banco do tenant (resolvido pelo host). PU `master` = banco global. Exemplo real (`repository/PaymentPlanRepository.java`):

```java
@ApplicationScoped
@PersistenceUnit("master")
public class PaymentPlanRepository implements PanacheRepository<PaymentPlan> {

    public List<PaymentPlan> findByDescription(String description) {
        return list("LOWER(description) LIKE LOWER(?1)", "%" + description + "%");
    }
}
```

O `PersonRepository` (entidade `entity/tenant/Person`) não usa `@PersistenceUnit` e, portanto, opera no banco do tenant corrente.

## 4. Recurso visível só em tenants (`@TenantOnly`)

Trecho real de `resource/PersonResource.java`:

```java
@Path("/api/persons")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Persons", description = "Person management (TENANT)")
@Tag(name = "tenant-only", description = "Endpoints disponíveis apenas no contexto de tenant")
@SecurityRequirement(name = "bearerAuth")
@TenantOnly
@Blocking
public class PersonResource {

    final PersonService service;
    public PersonResource(PersonService service) {
        this.service = service;
    }

    @GET
    @Operation(summary = "List all persons")
    @Tag(name = "tenant-only")
    public List<PersonDTO> listAll() {
        return service.findAll();
    }
}
```

`@TenantOnly`/`@MasterOnly` só afetam o spec servido em `GET /public/tenant-openapi`; não bloqueiam acesso. O exemplo repete `@Tag(name = "tenant-only")` nos métodos — o filtro (`TenantOpenApiController#copyIfAllowed`) trabalha por operação, então a repetição garante que a tag chegue em cada operação do spec (**Inferência**: não foi verificado se a meta-anotação na classe é propagada pelo SmallRye OpenAPI).

## 5. Sobrescrevendo uma SPI (PasswordEncoder)

Exemplo real (`multitenancy/CustomPasswordEncoder.java`). Um bean normal vence o `BCryptPasswordEncoder` `@DefaultBean` da extension:

```java
@ApplicationScoped
public class CustomPasswordEncoder implements PasswordEncoder {

    private static final int SALT_ROUNDS = 12;

    @Override
    public String encode(String plainPassword) {
        if (plainPassword == null) {
            throw new IllegalArgumentException("Password cannot be null");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(SALT_ROUNDS));
    }
}
```

## 6. Canal próprio para o OTP (SubdomainTenancyNotificationService)

Assinaturas reais: `void sendValidationNotification(TenantValidationNotification notification)`; o record tem `recipient`, `recipientName`, `tradeName`, `validationCode`, `expiryMinutes`, `subject`, `htmlContent`, `channelHint` (o `TenantService` envia `channelHint="email"`). Esboço (o corpo é do host):

```java
@ApplicationScoped
public class WhatsAppValidationNotifier implements SubdomainTenancyNotificationService {

    @Override
    public void sendValidationNotification(TenantValidationNotification n) {
        // enviar n.validationCode() para n.recipient(), válido por n.expiryMinutes() minutos
    }
}
```

Por ser bean normal, substitui o `MailerNotificationService` (`@DefaultBean`). Se `sendValidationNotification` lançar `RuntimeException`, o `TenantService` não desfaz o cadastro: a resposta do signup vem com `emailDelivered=false`.

Para só trocar o HTML do e-mail padrão, coloque um template Qute em `src/main/resources/templates/subdomain-tenancy/confirmation.html` (ou `subdomain-tenancy/html/confirmation.html`) — o `DefaultTemplateSubdomainTenancyProvider` tenta esses caminhos antes do template embutido. Os dados passados ao template não foram detalhados aqui (ver `spi/impl/DefaultTemplateSubdomainTenancyProvider`).

## 7. Migrations do host

Estrutura real do exemplo:

```text
src/main/resources/db/migration/
├── master/   V2000__create_payment_plans_table.sql, V2001__seed_payment_plans_permissions.sql, V2002__create_role_teste_apikey.sql
└── tenant/   V1__create_persons_table.sql
```

`master/` roda no boot (history `flyway_schema_history_master`); `tenant/` roda no provisionamento e nas migrações por tenant (history `flyway_schema_history_tenant`). Para pastas extras use `seedgrid.subdomain-tenancy.{master,tenant}.migrations.location.additional` com versões que não colidam com a base.

## 8. Ciclo de vida de um tenant (HTTP)

Body conforme `TenantSignupRequest` (`subdomain` `^[a-z0-9_]{5,50}$`, `cnpj` com `@CNPJ`, `rootEmail` `@Email`, representante legal com nome/sobrenome/telefone obrigatórios). Fonte: README da extension, conferido com o DTO.

```bash
# 1) signup (público, 100/min por IP)
curl -X POST https://crm.example.com/public/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "clientea",
    "cnpj": "<cnpj>",
    "corporateName": "Cliente A Ltda",
    "tradeName": "Cliente A",
    "rootEmail": "admin@clientea.example",
    "plainRootPassword": "<SEGREDO:senha-root>",
    "address": { "street": "Rua X", "number": "100", "city": "São Paulo", "state": "SP", "postalCode": "01000-000", "district": "Centro" },
    "legalRepresentative": { "firstName": "Maria", "lastName": "Silva", "cpf": "<cpf>", "birthDate": "1990-01-01", "phone": "11999990000" }
  }'
# -> 201 {"status":"CREATED","emailDelivered":true,"result":"Email de confirmacao enviado para ..."}

# 2) validar OTP (aceita 123456 ou 123-456) -> cria banco crm_clientea, migra, cria root, conta de billing
curl -X POST https://crm.example.com/public/tenants/validate-email \
  -H "Content-Type: application/json" -d '{"subdomain":"clientea","code":"123-456"}'

# 3) reenviar OTP (5/h por IP)
curl -X POST "https://crm.example.com/public/tenants/resend-email?subdomain=clientea"

# 4) a partir daqui, o tenant é resolvido pelo host
curl https://clientea.crm.example.com/api/persons -H "Authorization: Bearer <token>"
```

> Atenção: com `domain-suffix=crm.example.com`, um subdomínio com `_` passa no signup mas não é extraído do host (o extractor aceita só `[a-z0-9-]`). Prefira nomes sem `_`.

## 9. Operação (contexto master)

```bash
# Forçar migração de um tenant
curl -X POST "https://crm.example.com/internal/migrations/tenants/clientea/trigger?force=true" -H "Authorization: Bearer <token-master>"
# Estado da migração
curl https://crm.example.com/internal/migrations/tenants/clientea/status -H "Authorization: Bearer <token-master>"
# Health do tenant (status HTTP derivado do código: OK, TENANT_INACTIVE, DATABASE_UNREACHABLE, MIGRATION_*...)
curl https://crm.example.com/internal/health/tenants/clientea -H "Authorization: Bearer <token-master>"
```

Chamados a partir de um host de tenant, esses endpoints respondem `403 {"error":"master_scope_required"}`. Durante uma migração disparada pelo login, `POST /auth/login` no tenant recebe `503` com `Retry-After: 15` e `{"error":"tenant_migration_in_progress", ...}`.

## 10. Lendo o tenant corrente no código do host

`TenantContext` é `@RequestScoped` e preenchido pelo `TenantResolutionFilter`:

```java
@Inject
TenantContext tenantContext;

String tenant = tenantContext.getCurrentTenant(); // "master" quando o host não traz subdomínio
```

O `QuarkusTenantResolver` dá prioridade ao valor já gravado no `TenantContext`; portanto `setCurrentTenant("outro")` dentro da request muda o banco usado pelas **próximas** sessões Hibernate da PU default (**Inferência** a partir de `QuarkusTenantResolver#resolveTenantId`; não há exemplo/teste do host fazendo isso). `TenantScopedExecutor#call(Supplier<T>)` apenas abre uma transação `REQUIRES_NEW`.
