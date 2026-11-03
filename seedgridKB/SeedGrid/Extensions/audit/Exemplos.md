---
tags: [seedgrid, extension, audit, exemplos]
fonte: java/seedgrid-quarkus-ext-audit
branch: main
commit: b55e97c
analisado-em: 2026-11-02
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

**Como o lookup realmente funciona (Confirmado em `AuditInterceptor#resolveLookupPlan`, `#executeLookupPlan`, `#resolveLookupMethod`, `#invokeFieldLookup`):**
- O repository é sempre o derivado de `entityFqcn` (`...entities.X` → `...repositories.XRepository`) e precisa ser um bean CDI. Não há como apontar outro repository. Se o pacote da entidade não tem `.entities`, não há repository derivado.
- `lookupMethod`: método **público** do repository, com esse nome, que **devolve `Optional<Entidade>`**. Os argumentos são os **primeiros N argumentos do método anotado, por posição e tipo** (N = número de parâmetros do método do repository; se houver sobrecargas, vale a de maior N cujos tipos casam). Não é por nome de parâmetro.
- `lookups`: `field` é o nome de um **campo da entidade** (não do parâmetro); os valores também são os primeiros argumentos do método anotado, por posição. Com **um** campo, tenta antes `findBy<Campo>(valor)` no repository (ex.: `findByPublicId(String)`, devolvendo `Optional`); se não houver, ou com mais de um campo, chama `find("campo1 = ?1 and campo2 = ?2", valores).firstResultOptional()`, que só existe em repository Panache. **Repository sem `find(String, Object...)` e sem o `findBy<Campo>` não acha nada.**
- Sem `lookupMethod` nem `lookups`: entidade que herda `BaseEntity`/`BaseEntityPanache` usa `publicId` com o 1º argumento; senão tenta o `@Id` (`findByIdOptional`) se o 1º argumento tiver o tipo da chave.
- **Falha é silenciosa:** se não acha (método inexistente, tipos que não casam, argumento `null`, `Optional.empty()`), o registro é gravado mesmo assim, com `beforeState` vazio. Só exceção dentro do lookup gera log (`warn`/`debug`).
- `beforeState` é buscado só em `UPDATE` e `DELETE`, **antes** do método. `afterState` só em `CREATE` e `UPDATE`, depois: se o método **retorna a própria entidade**, usa o retorno; senão repete o lookup; se ainda assim não acha, grava o **retorno do método** (ex.: um DTO) mesmo que não seja a entidade. `DELETE` nunca tem `afterState`. `READ` e `OTHER` não têm nenhum dos dois.
- O log só é gravado se o método **terminar sem exceção**; falha no método = nenhum registro.

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
Alternativa: injetar `AuditGateway` e chamar `persist(log)`. Fonte: `AuditEmitter`, `AuditGatewayImpl`, setters de `AuditLog`. Não existe uma chamada pronta do tipo `Audit.log(...)`: a auditoria manual é montar o `AuditLog` e entregá-lo; veja a seção 9 para antes/depois, usuário e mascaramento.

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
import br.com.seedgrid.audit.core.spis.AuditReadScope;
import br.com.seedgrid.audit.core.spis.AuditReadScopeProvider;

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

## 9. Repositório por conta (sem `findById`/`findAll`) e auditoria manual

Fonte: `AuditInterceptor`, `AuditEmitter`, `AuditGatewayImpl`, `AuditEnricher`, `AuditLogService`, `PersonalDataSanitizer` (privacy), `TenantAuditLogger` (subdomain-tenancy). A pergunta veio do Finanças (P1.F3.DEM1): o lookup automático não acha a entidade quando o repository filtra por conta e não expõe `findByIdOptional`/`find(String, Object...)`.

**9.1 O `lookupMethod` resolve isso**, desde que o método do repository devolva `Optional<Entidade>` e receba **os primeiros argumentos do método de serviço, na mesma ordem e tipo**:

```java
// br.com.seuapp.repositories.LancamentoRepository  (@ApplicationScoped)
public Optional<Lancamento> findByPublicIdAndAccount(String publicId, String accountPublicId) {
    // filtro manual por account_public_id; outra conta = Optional.empty()
}

// service: os dois primeiros parametros casam com os do repository, por posicao
@Transactional
@SgAudit(entityFqcn = "br.com.seuapp.entities.Lancamento",
         operation = AuditOperationEnum.UPDATE, description = "Altera lançamento",
         lookupMethod = "findByPublicIdAndAccount")
public Lancamento update(String publicId, String accountPublicId, LancamentoRequest req) { ... }
```

Se a conta **não** é parâmetro do serviço (vem do contexto autenticado), o método do repository pode receber só o `publicId` e aplicar a conta do contexto por dentro (o repository é um bean e pode injetar o contexto): `lookupMethod = "findScopedByPublicId"` com `Optional<Lancamento> findScopedByPublicId(String publicId)`. **Inferência** a partir de `resolveLookupMethod` (aceita método com menos parâmetros que os argumentos; não há exemplo no repositório). O que importa: o método do repository nunca devolve entidade de outra conta, e o log do "antes" respeita o mesmo isolamento do restante do repositório.

**9.2 Auditoria totalmente manual**, quando o lookup não serve (ex.: o repository fica em pacote sem `.entities`, ou o estado vem de vários registros). Monte o `AuditLog` dentro do método do serviço e entregue ao `AuditGateway`:

```java
@Inject AuditGateway auditGateway;
@Inject PersonalDataSanitizer sanitizer;   // br.com.seedgrid.privacy.masking
@Inject SecurityIdentity identity;

String antes = sanitizer.sanitizeToJson(lancamento, Lancamento.class, new SgMaskRule[0]);
// ... altera e persiste ...
String depois = sanitizer.sanitizeToJson(lancamento, Lancamento.class, new SgMaskRule[0]);

AuditLog log = new AuditLog();
log.setOperation(AuditOperationEnum.UPDATE);
log.setEntity("Lancamento");                       // o nome simples da entidade, como o interceptor grava
log.setDescription("Altera lançamento");
log.setTechOperation(getClass().getName() + ".update");
log.setUserName(identity.getPrincipal().getName()); // o interceptor usa "anonymous" sem identidade
log.setOperationDateTime(Instant.now());
log.setBeforeState(antes);
log.setAfterState(depois);
auditGateway.persist(log);   // enriquece (origin/IP/UA + metadata) e grava em REQUIRES_NEW
```

O que a gravação manual **não** faz por você (Confirmado): preencher usuário, data e `techOperation` (o `AuditEnricher` só põe origin, IP, User-Agent e a metadata dos `AuditMetadataContributor`); mascarar dados pessoais (só o `PersonalDataSanitizer` mascara, e só se você o chamar; sem ele o JSON sai em claro); registrar a entidade e o usuário nas tabelas auxiliares que o interceptor alimenta com `AuditLogEntitiesService#insertEntityIfNotFound(String)` e `AuditLogUsersService#insertUserIfNotFound(String)` (ambos públicos; **não verifiquei** se os combos `/audit-logs/entities` e `/users` dependem dessas tabelas). `AuditEmitter.emit` engole qualquer erro; `AuditGateway.persist` propaga o erro do `persist`. O mesmo vale para chamar `AuditLogService#persist` direto.

**Quando preferir a gravação manual ao `@SgAudit`** (relato do `dev-2` ao fazer a P136 da `user-notifications`; reconfirmar no código da `audit`): o interceptor grava o **estado inteiro** da entidade (antes/depois), o que vaza campos que não deveriam ir para a trilha (por exemplo texto livre e `payload`), e uma falha da `audit` não é capturada no interceptor. Quando o fato auditável deve levar só identificadores, monte o `AuditLog` você mesmo e chame `auditGateway.persist` **depois do commit**, capturando a falha para só registrar em log. Exemplo real: `AuditNotificationTrail` na [[SeedGrid/Extensions/user-notifications/Visao-geral|user-notifications]].
