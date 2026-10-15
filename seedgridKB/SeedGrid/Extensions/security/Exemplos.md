---
tags: [seedgrid, extension, security, exemplos]
fonte: java/seedgrid-quarkus-ext-security; java/examples/seedgrid-security-example
branch: main
commit: 450735386e
analisado-em: 2026-10-14
---

# security — Exemplos (Quarkus)

Ver também: [[SeedGrid/Extensions/security/Visao-geral|Visão geral do security]] · [[SeedGrid/Extensions/security/Configuracao|Configuração do security]] · [[SeedGrid/Extensions/security/Rust|Porte Rust]]

Fontes: assinaturas lidas em `java/seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/spi/*.java`; testes em `runtime/src/test/java/br/com/seedgrid/security/`; `README.md` da extension; exemplo `java/examples/seedgrid-security-example` (repo próprio, commit `86cfc37`, depende de `seedgrid-security:2026.09.25`). Exemplos marcados *ilustrativo* combinam a API real com lógica de negócio fictícia.

## 1. Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-security</artifactId>
    <version>2026.10.14</version>
</dependency>
```

Chaves RSA (README):

```bash
openssl genrsa -out src/main/resources/keys/private.pem 2048
openssl rsa -in src/main/resources/keys/private.pem -pubout -out src/main/resources/keys/public.pem
```

> A chave privada lida por `RsaKeyProvider` precisa estar em PKCS#8 (`-----BEGIN PRIVATE KEY-----`). OpenSSL 3 gera PKCS#8 por padrão; com OpenSSL 1.x use `openssl pkcs8 -topk8 -nocrypt` (*Inferência* a partir do `PKCS8EncodedKeySpec` usado no código).

Configuração mínima: [[SeedGrid/Extensions/security/Configuracao|Configuração §6]].

## 2. Proteger endpoints do host

Anotações Quarkus + RBAC do security (README "Proteger endpoints"). As permissões vêm das roles do token via `RbacSecurityIdentityAugmentor`.

```java
import br.com.seedgrid.security.annotations.MonoCompany;
import io.quarkus.security.Authenticated;
import io.quarkus.security.PermissionsAllowed;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;

@Path("/relatorios")            // path sem "/public/" => exige Bearer JWT
public class RelatorioResource {   // ilustrativo

    @GET
    @PermissionsAllowed("USER_READ")          // permissão derivada das roles
    public String listar() { return "ok"; }

    @GET @Path("/admin")
    @RolesAllowed("ADMIN")
    public String admin() { return "ok"; }

    @GET @Path("/sem-empresa")
    @Authenticated
    @MonoCompany                              // CompanyContextFilter ignora
    public String semEmpresa() { return "ok"; }
}
```

Rotas públicas precisam ter `/public/` no path (`JwtAuthenticationFilter#isPublicPath`).

## 3. Fluxo HTTP do cliente

```http
POST /public/auth/login
{ "login": "admin@exemplo.com", "password": "<senha>" }
-> 200 { "token": "<JWT>", "tokenType": "Bearer", "refreshToken": "<opaco>" }
   ou desafio 2FA com tempToken (quando 2f.enabled=true e o usuário ativou 2FA)

POST /public/2f/verify
{ "tempToken": "<tempToken>", "code": "123456" }

POST /me/select-company            (Authorization: Bearer <JWT>)
{ "companyPublicId": "<uuid>" }    -> novo par escopado | 403

POST /public/auth/refresh
{ "refreshToken": "<opaco>" }      -> preserva a empresa do token
```

(README §"Exemplos de rotas".)

## 4. SPIs

Todas as implementações padrão são `@DefaultBean`; um bean `@ApplicationScoped` do host com o mesmo tipo substitui.

### 4.1 `UserAdditionalFieldsValidator` — regras de `additionalAttributes`

Assinatura: `void validate(User user, Map<String, JsonNode> additionalAttributes)`. Exemplo real do teste `RejectingUserAdditionalFieldsValidator`:

```java
import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.exceptions.InvalidUserAdditionalAttributesException;
import br.com.seedgrid.security.spi.UserAdditionalFieldsValidator;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Map;

@ApplicationScoped
public class RejectingUserAdditionalFieldsValidator implements UserAdditionalFieldsValidator {

    public static final String REJECT_KEY = "__reject";

    @Override
    public void validate(User user, Map<String, JsonNode> additionalAttributes) {
        if (additionalAttributes != null && additionalAttributes.containsKey(REJECT_KEY)) {
            throw new InvalidUserAdditionalAttributesException(
                    "Atributo " + REJECT_KEY + " rejeitado pela aplicacao");
        }
    }
}
```

A exceção vira HTTP 400. Os limites de tamanho/profundidade/chaves são aplicados antes, por `seedgrid.security.user.additional-attributes.*`.

### 4.2 `AllowedCompaniesResolver` — visão "todas as empresas"

Assinatura: `AllowedCompanies resolve(User user, List<String> roles)`; `AllowedCompanies.of(List<Long>)` e `AllowedCompanies.seeingAll(List<Long>)`. *Ilustrativo* (adaptado do README — o README usa `getMemberships()`; a entidade expõe `getActiveCompanies()`):

```java
@ApplicationScoped
public class MyAllowedCompaniesResolver implements AllowedCompaniesResolver {
    @Override
    public AllowedCompanies resolve(User user, List<String> roles) {
        List<Long> ids = user.getActiveCompanies().stream().map(Company::getId).toList();
        return roles.contains("PLATFORM_ADMIN") ? AllowedCompanies.seeingAll(ids) : AllowedCompanies.of(ids);
    }
}
```

### 4.3 `JwtTokenCustomizer` — claims extras (ex.: `audience`)

Assinatura **atual**: `Map<String, Object> customizeClaims(User user, List<String> roles, String hostHeader, Long scopedCompanyId)` (o README mostra uma versão antiga com 3 parâmetros). O claim `audience` é o que o `RbacSecurityIdentityAugmentor` usa para filtrar permissões por audience. *Ilustrativo*:

```java
@ApplicationScoped
public class AudienceTokenCustomizer implements JwtTokenCustomizer {
    @Override
    public Map<String, Object> customizeClaims(User user, List<String> roles, String hostHeader, Long scopedCompanyId) {
        return scopedCompanyId == null ? Map.of() : Map.of("audience", "client");
    }
}
```

Combine com `seedgrid.security.account.assignable-permission-audiences=client` para que admins de conta possam atribuir permissões `client`.

### 4.4 `JwtTokenValidator`

`void validateCustomClaims(JWTClaimsSet claims, String hostHeader)` (Nimbus `JWTClaimsSet`) — chamado por `TokenVerifier` depois de assinatura, issuer e expiração. Use para validar claims próprios (ex.: subdomínio).

### 4.5 `TwoFactorStrategy` — novo método 2FA

```java
public interface TwoFactorStrategy {
    String getMethodCode();
    boolean canInitiate(User user);
    default boolean canEnroll(User user) { return canInitiate(user); }
    TwoFactorInitResult initiate(User user, TwoFactorContext context);
    TwoFactorVerifyResult verify(User user, String code, TwoFactorContext context);
}
```

O código retornado por `getMethodCode()` precisa constar em `seedgrid.security.2f.allowed-methods` para aparecer ao usuário (`TwoFactorController#getAllowedMethods`).

### 4.6 E-mail e templates

- `EmailServiceInterface`: `sendEmailConfirmation`, `sendPasswordReset`, `generateToken`, `sendHtmlEmail(to, subject, htmlBody, textBody)`, `sendWelcomeEmail(user, temporaryPassword, confirmationToken)`. Os testes trocam a implementação com `@Alternative @Priority(1)` (`TestEmailService`), usando `TemplateSecurityProvider` + `SecurityLinkBuilder`.
- `TemplateSecurityProvider`: `emailConfirmation`, `passwordReset`, `entryRequestConfirmation`, `entryRequestApproved`, `welcomeEmail`, `twoFactorCode` (abstratos) e `entryRequestConfirmationCode`, `entryRequestInvitation`, `twoFactorWhatsappText` (default). `entryRequestApproved` precisa ser implementado, mas hoje não é chamado (o e-mail de aprovação do self-enter não é enviado). Templates padrão: `runtime/src/main/resources/templates/security-default/html/*.html` e `txt/two-factor-code-whatsapp.txt`.
- `TwoFactorEmailTemplateProvider#buildCodeEmail(User, String code, int expiresInMinutes)` → `EmailTemplate(subject, htmlBody, textBody)`.

### 4.7 Outras SPIs

| SPI | Método |
|---|---|
| `LoginScopeResolver` | `Long resolveLoginScope(User user, String requestedScope)` |
| `SecurityScopeResolverProvider` | `String currentScope()` |
| `UserQuotaValidator` | `void assertCanAddUser(Company company)` |
| `AccountUserActivationMailer` | `void deliver(User user, ActivationCredentials credentials)` |

## 5. Configuração por cenário (testes)

Profiles reais de teste mostram combinações válidas:

```java
// SelfEnterInviteOnlyProfile
Map.of(
    "seedgrid.security.self-enter.enabled", "true",
    "seedgrid.security.self-enter.public-enabled", "false",
    "seedgrid.security.self-enter.invite-enabled", "true");
```

Outros: `SelfEnterInviteAutoApproveProfile` (`invite-needs-approval=false`), `SelfEnterNoDefaultRoleProfile` (`default-role` inexistente → aprovação falha), `BootstrapDisabledProfile` (`bootstrap.enabled=false`), `RefreshTokenGraceWindowProfile` (`refresh-token.reuse-grace-window`).

## 6. Trecho de `application.properties` do exemplo

De `java/examples/seedgrid-security-example/src/main/resources/application.properties` (segredos substituídos por placeholders):

```properties
seedgrid.security.2f.enabled=true
seedgrid.security.2f.allowed-methods=EMAIL,TOTP,WHATSAPP
seedgrid.security.2f.totp.issuer=SeedGrid.CRM
seedgrid.security.2f.otp-qrcode.branding.enabled=true
seedgrid.security.2f.otp-qrcode.logo=classpath:/images/logo-qrcode-otp.png
seedgrid.security.2f.otp-qrcode.size=350
seedgrid.security.rbac.cache-ttl=${SECURITY_RBAC_CACHE_TTL:PT5M}
seedgrid.security.encryption.key=<SEGREDO:security-encryption-key-base64-32-bytes>
seedgrid.security.self-enter.enabled=true
seedgrid.security.self-enter.request-ttl=PT2M
seedgrid.security.self-enter.email-token-ttl=PT10M
seedgrid.security.self-enter.cleanup.purge-after=PT10M
seedgrid.security.self-enter.cleanup.cron=0 */5 * * * ?
```

Observação: o exemplo não define `seedgrid.security.frontend.self-enter-path` (cai no default do mp-config) e usa TTLs curtos de demonstração.
