---
tags: [seedgrid, extension, commons, quarkus, spis]
fonte: java/seedgrid-quarkus-lib-commons
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# commons (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/commons/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-lib-commons` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#ApiExceptionExtension]] | `DefaultApiExceptionExtension` | Não trata nada: `tryHandle` devolve `null`, e o handler segue para o tratamento padrão. |
| [[#CurrentUserProvider]] | `DefaultCurrentUserProvider` | Usuário fixo "sem segurança": publicId zerado, e-mail `no.security@seedgrid.com`, nome `no-security`, WhatsApp vazio. |
| [[#TenantProvider]] | `SingleTenantProvider` | Devolve sempre um único tenant `default` e não faz nada ao definir ou limpar o tenant. |
| [[#UserContactProvider]] | `DefaultUserContactProvider` | Devolve sempre um contato vazio (e-mail, nome e WhatsApp em branco). |

## ApiExceptionExtension

Gancho para uma extension ensinar o `ApiExceptionHandler` a responder por exceções dela. O handler do commons consulta todos os beans deste tipo antes do seu tratamento padrão. Cada extension devolve a `Response` (status, código e mensagem) para as exceções que conhece, e `null` para as demais. **Uso restrito (decisão de 2026-10-27):** é para exception de **terceiros** e saída de emergência; as exceptions nossas estendem `BusinessException` (4xx) ou `SystemSeedGridException` (5xx), declaram o status na classe e **não** precisam de SPI (BE-11, EXT-05). A lista de implementações abaixo encolhe à medida que cada extension é migrada.

**Pacote:** `br.com.seedgrid.commons.web.exceptions.spis`

**Padrão (`@DefaultBean`):**

- `DefaultApiExceptionExtension` — Não trata nada: `tryHandle` devolve `null`, e o handler segue para o tratamento padrão.

O padrão usa `@Default` (não `@DefaultBean`) e não trata nada; as extensions registram as suas implementações e o handler consulta todas, em ordem, até uma devolver uma `Response`.

**Outras implementações no repositório** (para consultar como exemplo):

- `ApiKeyApiExceptionExtension` (`seedgrid-quarkus-ext-apikeys/runtime/src/main/java/br/com/seedgrid/apikeys/exceptions/ApiKeyApiExceptionExtension.java`) — Traduz as exceções desta extension em respostas HTTP.
- `AuditLogNotFoundExceptionExtension` (`seedgrid-quarkus-ext-audit/seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/exceptions/AuditLogNotFoundExceptionExtension.java`) — Traduz as exceções desta extension em respostas HTTP.
- `BackupExceptionExtension` (`seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/exceptions/BackupExceptionExtension.java`) — API exception handler for SeedGrid Backup exceptions.
- `BillingApiExceptionExtension` (`seedgrid-quarkus-ext-billing/seedgrid-billing-core/runtime/src/main/java/br/com/seedgrid/billing/exceptions/BillingApiExceptionExtension.java`) — Traduz as exceptions do billing em problem+json, sempre pelo `BillingProblemBody`.
- `BusinessDaysApiExceptionExtension` (`seedgrid-quarkus-ext-business-days/runtime/src/main/java/br/com/seedgrid/businessdays/exceptions/BusinessDaysApiExceptionExtension.java`) — Traduz as exceções desta extension em respostas HTTP.
- `LoginTenancyApiExceptionExtension` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/exceptions/LoginTenancyApiExceptionExtension.java`) — Handler global das exceptions tipadas da foundation login-tenancy (SPI `ApiExceptionExtension` do seedgrid-commons). Mantem o mapeamento HTTP num so lugar, como o `SecurityApiExceptionExtension` faz no ext-security.
- `SecurityApiExceptionExtension` (`seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/exceptions/SecurityApiExceptionExtension.java`) — Traduz as exceções desta extension em respostas HTTP.
- `SubdomainTenancyExceptionExtension` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/exceptions/extensions/SubdomainTenancyExceptionExtension.java`) — Exception handler extension for SubdomainTenancy-specific exceptions. Implements the ApiExceptionExtension SPI from seedgrid-commons.
- `WhatsAppExceptionExtension` (`seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/java/br/com/seedgrid/whatsapp/exceptions/WhatsAppExceptionExtension.java`) — Traduz as exceções desta extension em respostas HTTP.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Response tryHandle(Throwable ex)` | Retorna Response se conseguir tratar; caso contrário retorna null. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MinhaApiExceptionExtension implements ApiExceptionExtension {

    @Override
    public Response tryHandle(Throwable ex) {
        if (ex instanceof PedidoNaoEncontradoException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("code", "PEDIDO_NAO_ENCONTRADO", "message", e.getMessage()))
                    .build();
        }
        return null; // nao e' desta extension: o handler segue para o tratamento padrao
    }
}
```

## CurrentUserProvider

Quem é o usuário corrente, para preenchimento de auditoria e de campos de autoria. A implementação padrão (`DefaultCurrentUserProvider`, `@DefaultBean`) devolve um usuário fixo "sem segurança" (publicId zerado, e-mail `no.security@seedgrid.com`, nome `no-security`), para a aplicação funcionar sem a extension security. Com a security presente, ela fornece a implementação real e vence o padrão.

**Pacote:** `br.com.seedgrid.commons.persistence.spis`

**Padrão (`@DefaultBean`):**

- `DefaultCurrentUserProvider` — Usuário fixo "sem segurança": publicId zerado, e-mail `no.security@seedgrid.com`, nome `no-security`, WhatsApp vazio.

**Outras implementações no repositório** (para consultar como exemplo):

- `ApiKeyAwareCurrentUserProvider` (`seedgrid-quarkus-ext-apikeys/runtime/src/main/java/br/com/seedgrid/apikeys/security/ApiKeyAwareCurrentUserProvider.java`) — Usuário a partir do JWT ou, numa chamada por API key, do dono da chave.
- `JwtCurrentUserProvider` (`seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/spis/impl/JwtCurrentUserProvider.java`) — Extrai o usuário do JWT.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String getCurrentUserPublicId()` | publicId (UUID) do usuário corrente. |
| `String getCurrentUserEmail()` | E-mail do usuário corrente. |
| `String getCurrentUserName()` | Nome de exibição do usuário corrente. |
| `String getCurrentUserWhatsapp()` | WhatsApp do usuário corrente (vazio quando não há). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class JwtCurrentUserProvider implements CurrentUserProvider {

    @Inject
    JsonWebToken jwt;

    @Override
    public String getCurrentUserPublicId() {
        return jwt.getSubject();
    }

    @Override
    public String getCurrentUserEmail() {
        return jwt.getClaim("email");
    }

    @Override
    public String getCurrentUserName() {
        return jwt.getName();
    }

    @Override
    public String getCurrentUserWhatsapp() {
        return ""; // vazio quando nao ha
    }
}
```

## TenantProvider

Gerência de tenant para os módulos que funcionam em ambiente single-tenant e multi-tenant (backup, security, audit) sem saber em qual estão. Cada módulo traz um provider single-tenant como padrão; a tenancy fornece o que lista os tenants ativos.

**Pacote:** `br.com.seedgrid.commons.spis`

**Padrão (`@DefaultBean`):**

- `SingleTenantProvider` — Devolve sempre um único tenant `default` e não faz nada ao definir ou limpar o tenant.

**Outras implementações no repositório** (para consultar como exemplo):

- `MultiTenantProvider` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/MultiTenantProvider.java`) — Lista os tenants ativos no banco.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `List<String> getAllTenants()` | Identificadores de todos os tenants (um só em single-tenant). |
| `void setCurrentTenant(String tenantId)` | Define o tenant da thread/requisição corrente. |
| `void clearCurrentTenant()` | Limpa o tenant corrente. |
| `String getCurrentTenant()` | Identificador do tenant corrente, ou `null` se não houver. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuTenantProvider implements TenantProvider {

    private static final ThreadLocal<String> ATUAL = new ThreadLocal<>();

    @Inject
    TenantRepository tenants;

    @Override
    public List<String> getAllTenants() {
        return tenants.listarIdentificadoresAtivos();
    }

    @Override
    public void setCurrentTenant(String tenantId) {
        ATUAL.set(tenantId);
    }

    @Override
    public void clearCurrentTenant() {
        ATUAL.remove();
    }

    @Override
    public String getCurrentTenant() {
        return ATUAL.get(); // null quando nao ha tenant corrente
    }
}
```

## UserContactProvider

Resolve o contato (e-mail, nome, WhatsApp) de um usuário a partir do publicId gravado. Usado para avisar quem aparece num registro (por exemplo o autor de uma operação).

**Pacote:** `br.com.seedgrid.commons.spis`

**Padrão (`@DefaultBean`):**

- `DefaultUserContactProvider` — Devolve sempre um contato vazio (e-mail, nome e WhatsApp em branco).

**Outras implementações no repositório** (para consultar como exemplo):

- `RepositoryUserContactProvider` (`seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/spis/impl/RepositoryUserContactProvider.java`) — Lê e-mail, nome e WhatsApp do usuário no repositório da security.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Optional<UserContact> provideByPublicId(String userPublicId)` | Contato do usuário pelo publicId; vazio se não o encontrar. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuUserContactProvider implements UserContactProvider {

    @Inject
    UsuarioRepository usuarios;

    @Override
    public Optional<UserContact> provideByPublicId(String userPublicId) {
        return usuarios.findByPublicId(userPublicId)
                .map(u -> new UserContact(u.getEmail(), u.getNome(), u.getWhatsapp()));
    }
}
```
