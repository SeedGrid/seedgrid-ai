---
tags: [seedgrid, extension, login-tenancy, exemplos]
fonte: java/seedgrid-quarkus-ext-login-tenancy
branch: main
commit: c67581bda9
analisado-em: 2026-10-14
---

# Login-tenancy (Quarkus) — exemplos

Voltar: [[SeedGrid/Extensions/login-tenancy/Visao-geral|Visão geral do login-tenancy]] · [[SeedGrid/Extensions/login-tenancy/Configuracao|Configuração]]

## 1. Dependências do host

Fonte: `README.md`, `docs/example-consumo.md` e `pom.xml`.

```xml
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-login-tenancy</artifactId>
  <version>2026.10.14-1</version>
</dependency>
<!-- Provider concreto de billing: o login-tenancy só traz o billing-core -->
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-billing-stripe</artifactId>
  <version>2026.10.14-1</version>
</dependency>
```

## 2. `application.properties` mínimo

Fonte: `docs/example-consumo.md` (placeholders no lugar de valores).

```properties
quarkus.datasource.jdbc.url=${SEEDGRID_DB_URL}
quarkus.datasource.username=${SEEDGRID_DB_USERNAME}
quarkus.datasource.password=${SEEDGRID_DB_PASSWORD}

seedgrid.security.jwt.private-key-location=<CAMINHO-CHAVE-PRIVADA>
seedgrid.security.jwt.public-key-location=<CAMINHO-CHAVE-PUBLICA>
seedgrid.security.jwt.issuer=<ISSUER>

# Bootstrap inicial (opcional — executado pelo seedgrid-security)
seedgrid.security.first-admin-user.email=${FIRST_ADMIN_EMAIL:}
seedgrid.security.first-admin-user.initial-password=<SEGREDO:first-admin-password>
seedgrid.security.default-company.cnpj=<CNPJ-DA-EMPRESA-DONA-DO-PRODUTO>

seedgrid.login-tenancy.app.code=minha-app
seedgrid.login-tenancy.app.name=Minha App
```

Migrations do domínio em `src/main/resources/db/migration/app/`.

## 3. Pós-processar o cadastro confirmado

Fonte: `SignupConfirmedEvent` (record com `cnpj`, `companyPublicId`, `corporateName`, `tradeName`, `rootEmail`, `representativeName`) e o padrão usado por `LoginTenancyBillingProvisioner`.

```java
import br.com.seedgrid.logintenancy.dtos.SignupConfirmedEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MeuOnboarding {

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    void onSignupConfirmed(@Observes(during = TransactionPhase.AFTER_SUCCESS) SignupConfirmedEvent event) {
        // ex.: criar dados iniciais do domínio para event.companyPublicId()
    }
}
```

A conta de billing com trial já é criada pela própria extension quando `seedgrid.login-tenancy.modules.billing.enabled=true`.

## 4. Sobrescrever os templates de e-mail

Fonte: `LoginTenancyTemplateProvider`, `DefaultLoginTenancyTemplateProvider`.

**Por arquivo** — coloque no host (placeholders `{name}`, `{token}`, `{appName}`, `{companyName}`, `{email}`, `{link}`, `{password}`):

```
src/main/resources/templates/logintenancy/signup-confirmation.html
src/main/resources/templates/logintenancy/signup-welcome.html
src/main/resources/templates/logintenancy/user-activation.html
```

**Por bean** — o default é `@DefaultBean`, então um bean do host vence:

```java
import br.com.seedgrid.logintenancy.spis.LoginTenancyTemplateProvider;

@ApplicationScoped
public class MeusTemplates implements LoginTenancyTemplateProvider {
    @Override public String signupConfirmation(String recipientName, String confirmationToken, String appName) { ... }
    @Override public String signupWelcome(String recipientName, String companyName, String appName) { ... }
    @Override public String userActivation(String recipientName, String email, String confirmationUrl,
            String initialPassword, String appName) { ... }
}
```

## 5. Fluxo de signup (HTTP)

Fonte: `LoginTenancySignupController`, `InstitutionalSignupRequest`.

```http
GET /public/signup/cnpj-status?cnpj=12345678000199
→ { "status": "AVAILABLE", "pendingEmailMasked": null }

POST /public/signup
{
  "cnpj": "12345678000199",
  "corporateName": "Acme Tecnologia LTDA",
  "tradeName": "Acme Labs",
  "address": { "street": "...", "number": "1000", "complement": "...", "postalCode": "01310100",
               "city": "São Paulo", "state": "SP", "district": "...", "phone": "1133334444" },
  "legalRepresentative": { "firstName": "Maria", "lastName": "Silva", "cpf": "<CPF>",
                           "birthDate": "1990-05-20", "phone": "...", "whatsapp": "..." },
  "rootEmail": "maria@acme.com",
  "plainRootPassword": "<SEGREDO:senha>"
}
→ 202 { "status": "PENDING_EMAIL_VERIFICATION", "signupRequestId": "<publicId>", "emailDelivered": true }

POST /public/signup/confirm-email
{ "token": "123-456" }
→ 200 { "status": "CONFIRMED", "companyId": "<companyPublicId>", "signupRequestId": "<publicId>" }
```

## 6. Status técnico

```http
GET /public/login-tenancy/status
→ { "app": {"code": "...", "name": "..."}, "activeModules": ["billing","apikeys","backup","filemanagement"],
    "bootstrap": {"enabled": true, "admin": true},
    "security": {"jwtIssuer": "...", "firstAdminConfigured": true} }
```

## 7. Desligar rate limit em testes

Fonte: `runtime/src/test/resources/application.properties`.

```properties
seedgrid.ratelimit.signup.enabled=false
seedgrid.ratelimit.signup-email-exists.enabled=false
seedgrid.ratelimit.signup-confirm-email.enabled=false
seedgrid.ratelimit.signup-resend-email.enabled=false
```
