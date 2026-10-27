---
tags: [seedgrid, extension, security, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-security
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# security (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/security/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-security` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#AccountUserActivationMailer]] | `DefaultAccountUserActivationMailer` | Default: o e-mail de boas-vindas do security (senha inicial + link de confirmacao). |
| [[#AllowedCompaniesResolver]] | `DefaultAllowedCompaniesResolver` | Impl padrao (agnostica): o usuario ve apenas as companies as quais pertence. Quem quiser liberar "ver todas" (ex.: app administrativo via seedgrid-login-tenancy) fornece outra impl de `AllowedCompaniesResolver` (sem @DefaultBean), que vence esta. |
| [[#CompanyQuotaValidator]] | `DefaultCompanyQuotaValidator` | Impl padrao (agnostica) do `CompanyQuotaValidator`: nunca bloqueia (sem limite). Quem quiser aplicar limite de empresas por plano (billing/host) fornece outra impl `@ApplicationScoped` sem `@DefaultBean`, que vence esta. |
| [[#EmailServiceInterface]] | `DefaultEmailService` | Implementação padrão do EmailServiceInterface. |
| [[#JwtTokenCustomizer]] | `DefaultJwtTokenCustomizer` | Não acrescenta claim algum. |
| [[#JwtTokenValidator]] | `DefaultJwtTokenValidator` | Não faz validação extra. |
| [[#LoginScopeResolver]] | `DefaultLoginScopeResolver` | Impl padrao (agnostica) do `LoginScopeResolver`: IGNORA o `requestedScope` e devolve `null` ("sem opiniao"), preservando o comportamento historico do login — o `AuthService` aplica a politica padrao de escopo. |
| [[#RoleUsageChecker]] | sem padrão | Precisa de implementação do host. |
| [[#SecurityScopeResolverProvider]] | `DefaultSecurityScopeResolver` | Escopo padrao de `SecurityScopeResolverProvider`: usa o claim `companyId` do token, quando presente, para particionar o cache de permissoes (ver `PermissionResolveService`) por EMPRESA — a mesma claim que `br.com.seedgrid.security.services.TokenService` ja grava no token (modelo T1, empresa escopada) e que `br.com.seedgrid.security.filters.CompanyContextFilter` ja le de volta em `br.com.seedgrid.security.services.CompanyRequestContext`. |
| [[#SocialAccountCreator]] | `DefaultSocialAccountCreator` | Padrao: o security nao cria conta pessoal sozinho (quem sabe e' o host/extension). |
| [[#SocialIdentityProvider]] | sem padrão | Precisa de implementação do host. |
| [[#SocialProviderCatalog]] | `DefaultSocialProviderCatalog` | Padrao: sem o modulo social, nenhum provedor habilitado. |
| [[#TemplateSecurityProvider]] | `DefaultTemplateSecurityProvider` | Carrega de `templates/security/` se existir; senão cai nos templates `security-default` (HTML e texto) do módulo. |
| [[#TwoFactorEmailTemplateProvider]] | `DefaultTwoFactorEmailTemplateProvider` | Template padrão do e-mail do código 2FA. |
| [[#TwoFactorStrategy]] | `EmailTwoFactorStrategy`, `TotpTwoFactorStrategy`, `WhatsappTwoFactorStrategy` | 2FA por e-mail: gera um código de 6 dígitos, guarda o hash no cache e envia por e-mail; a verificação compara o código informado com o hash. |
| [[#UserAdditionalFieldsValidator]] | `DefaultUserAdditionalFieldsValidator` | Não impõe regra alguma. |
| [[#UserQuotaValidator]] | `DefaultUserQuotaValidator` | Impl padrao (agnostica) do `UserQuotaValidator`: nunca bloqueia (sem limite). Quem quiser aplicar limite de usuarios por plano (ex.: report-api) fornece outra impl `@ApplicationScoped` sem `@DefaultBean`, que vence esta. |

## AccountUserActivationMailer

Entrega o convite de ativacao de um usuario criado (ou reenviado) pelo admin de uma CONTA em `/me/security/users`. O default usa o e-mail de boas-vindas do security; o host troca o template (nome da aplicacao, link) fornecendo o seu bean. Falhas devem ser propagadas: na criacao o security trata como best-effort (o usuario fica criado e o admin reenvia); no reenvio a transacao volta atras, para ninguem ficar com uma senha que nao recebeu.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultAccountUserActivationMailer` — Default: o e-mail de boas-vindas do security (senha inicial + link de confirmacao).

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancyAccountUserActivationMailer` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/LoginTenancyAccountUserActivationMailer.java`) — Convite de ativacao de quem o admin da conta cria (ou reenvia) em `/me/security/users` - o endpoint e' do seedgrid-security; o e-mail e' o do produto: template do `LoginTenancyTemplateProvider`, nome da aplicacao e botao para a pagina de confirmacao do FRONTEND (`SecurityLinkBuilder`), que chama a API por baixo.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void deliver(User user, ActivationCredentials credentials)` | Entrega o convite de ativação (token de confirmação e senha inicial) ao usuário criado ou reenviado pelo admin da conta. Propague falhas. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuAccountUserActivationMailer implements AccountUserActivationMailer {

    @Override
    public void deliver(User user, ActivationCredentials credentials) {
        // propague a falha: na criacao e' best-effort; no reenvio a transacao volta atras
        // credentials traz confirmationToken e plainPassword para montar o convite
        meuEmail.enviar(user.getEmail(), "Ative sua conta", credentials.confirmationToken());
    }
}
```

## AllowedCompaniesResolver

SPI que resolve quais companies entram no JWT do usuario. O security e AGNOSTICO de regras de negocio multi-tenant: o `DefaultAllowedCompaniesResolver` devolve apenas as companies do proprio usuario. Modulos como o seedgrid-login-tenancy podem prover outra impl (que vence o default) para liberar "ver todas" (flag `AllowedCompaniesallCompanies()`) em apps administrativos.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultAllowedCompaniesResolver` — Impl padrao (agnostica): o usuario ve apenas as companies as quais pertence. Quem quiser liberar "ver todas" (ex.: app administrativo via seedgrid-login-tenancy) fornece outra impl de `AllowedCompaniesResolver` (sem @DefaultBean), que vence esta.

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancyAllowedCompaniesResolver` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/LoginTenancyAllowedCompaniesResolver.java`) — Impl login-tenancy do `AllowedCompaniesResolver`. Modelo: base compartilhada, a DEFAULT COMPANY (dona do produto) e o admin que ve TUDO; as demais companies sao clientes que veem so o seu.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `AllowedCompanies resolve(User user, List<String> roles)` | Companies que entram no JWT do usuário (`AllowedCompanies.of(...)`), ou o flag de super-leitura (`AllowedCompanies.seeingAll(...)`). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuAllowedCompaniesResolver implements AllowedCompaniesResolver {

    @Inject
    MembershipRepository memberships;

    @Override
    public AllowedCompanies resolve(User user, List<String> roles) {
        List<Long> companies = memberships.companyIdsOf(user.getId());
        // flag de super-leitura: ve TODAS as empresas (so o enforcement de leitura do audit a usa)
        return roles.contains("PLATFORM_ADMIN")
                ? AllowedCompanies.seeingAll(companies)
                : AllowedCompanies.of(companies);
    }
}
```

## CompanyQuotaValidator

SPI que valida se a conta pode ter mais uma empresa, chamada ANTES de uma empresa ser criada (`POST /companies`) ou reativada (`active` de false para true), no molde do `UserQuotaValidator`.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultCompanyQuotaValidator` — Impl padrao (agnostica) do `CompanyQuotaValidator`: nunca bloqueia (sem limite). Quem quiser aplicar limite de empresas por plano (billing/host) fornece outra impl `@ApplicationScoped` sem `@DefaultBean`, que vence esta.

**Outras implementações no repositório** (para consultar como exemplo):

- `PlanCompanyQuotaValidator` (`seedgrid-quarkus-ext-billing/seedgrid-billing-core/runtime/src/main/java/br/com/seedgrid/billing/spis/impl/PlanCompanyQuotaValidator.java`) — Implementacao do SPI `CompanyQuotaValidator` da security: aplica o limite de empresas ATIVAS do plano da conta (`PlanTerm.maxCompanies`) ao CRIAR e ao REATIVAR empresa. Sem `@DefaultBean`, entao vence a implementacao default da security (sem limite).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void assertCanCreateCompany(Context context)` | Verifica se a conta pode ter mais uma empresa. Nao faz nada se pode prosseguir; lanca excecao se o limite contratado ja foi atingido. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class PorPlanoCompanyQuotaValidator implements CompanyQuotaValidator {

    @Inject
    PlanoService planos;

    @Override
    public void assertCanCreateCompany(Context context) {
        if (context.platformActor()) {
            return; // a empresa da plataforma nunca conta no limite
        }
        int limite = planos.limiteDeEmpresas(context.currentCompanyId());
        if (planos.empresasAtivas(context.currentCompanyId()) >= limite) {
            throw new CompanyQuotaExceededException(limite); // HTTP 402, COMPANY_QUOTA_EXCEEDED
        }
    }
}
```

## EmailServiceInterface

Envio de e-mails da security (confirmação de cadastro, redefinição de senha, boas-vindas e e-mail HTML livre). O host o implementa para trocar o provedor (SendGrid, SES, ...), os templates ou as URLs.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultEmailService` — Implementação padrão do EmailServiceInterface.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void sendEmailConfirmation(User user, String confirmationToken)` | Envia o e-mail de confirmação de cadastro. |
| `void sendPasswordReset(User user, String resetToken)` | Envia o e-mail de redefinição de senha. |
| `String generateToken()` | Gera o token único de confirmação ou redefinição (UUID por padrão). |
| `void sendHtmlEmail(String to, String subject, String htmlBody, String textBody)` | Envia um e-mail HTML livre, com corpo em texto como alternativa. |
| `void sendWelcomeEmail(User user, String temporaryPassword, String confirmationToken)` | Envia o e-mail de boas-vindas com a senha temporária e o link de confirmação. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuEmailServiceInterface implements EmailServiceInterface {
    @Override
    public void sendEmailConfirmation(User user, String confirmationToken) {
        // implemente
    }

    @Override
    public void sendPasswordReset(User user, String resetToken) {
        // implemente
    }

    @Override
    public String generateToken() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody, String textBody) {
        // implemente
    }

    @Override
    public void sendWelcomeEmail(User user, String temporaryPassword, String confirmationToken) {
        // implemente
    }
}
```

## JwtTokenCustomizer

Acrescenta claims próprios ao JWT na geração do token (por exemplo `subdomain`, `audience`). Sem implementação do host, nenhum claim extra é gravado.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultJwtTokenCustomizer` — Não acrescenta claim algum.

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancyJwtTokenCustomizer` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/LoginTenancyJwtTokenCustomizer.java`) — Impl login-tenancy do `JwtTokenCustomizer`: define a `audience` do token (modelo de particao platform/client) a partir da CONTA que o token esta escopando (T1) — automaticamente, sem cada host precisar reimplementar.
- `SubdomainTenancyJwtTokenCustomizer` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainTenancyJwtTokenCustomizer.java`) — Customização do JWT no modelo SILO (banco-por-tenant). Adiciona:

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Map<String, Object> customizeClaims(User user, List<String> roles, String hostHeader, Long scopedCompanyId)` | Claims extras a gravar no token (nunca `null`; vazio = nenhum). `scopedCompanyId` é a empresa em que o token está escopado, ou `null`. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class SubdominioJwtTokenCustomizer implements JwtTokenCustomizer {

    @Override
    public Map<String, Object> customizeClaims(User user, List<String> roles, String hostHeader, Long scopedCompanyId) {
        Map<String, Object> claims = new HashMap<>();
        if (hostHeader != null) {
            claims.put("subdomain", hostHeader.split("\\.")[0]);
        }
        return claims; // nunca null; vazio = sem claims extras
    }
}
```

## JwtTokenValidator

Valida claims próprios do JWT a cada requisição (por exemplo, que `subdomain` bate com o host). Sem implementação do host, nenhuma validação extra é feita.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultJwtTokenValidator` — Não faz validação extra.

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainTenancyJwtTokenValidator` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainTenancyJwtTokenValidator.java`) — Validação customizada do JWT para verificar se o subdomain do token corresponde ao tenant da requisição.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void validateCustomClaims(JWTClaimsSet claims, String hostHeader)` | Valida os claims próprios; lança `TokenValidationException` se inválido. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class SubdominioJwtTokenValidator implements JwtTokenValidator {

    @Override
    public void validateCustomClaims(JWTClaimsSet claims, String hostHeader) {
        Object subdomain = claims.getClaim("subdomain");
        if (subdomain != null && hostHeader != null && !hostHeader.startsWith(subdomain + ".")) {
            throw new TokenValidationException("Token emitido para outro subdominio");
        }
    }
}
```

## LoginScopeResolver

SPI que decide em QUAL company a sessao nasce escopada (T1) a partir de um `requestedScope` OPACO enviado pelo app no login. O security e AGNOSTICO: ele apenas repassa a string do request para esta SPI e usa o id devolvido. Nao existe aqui nenhuma nocao de "platform"/"client" — essa politica vive no modulo que a define (ex.: seedgrid-login-tenancy), do mesmo jeito que a `audience` do token e definida pelo `JwtTokenCustomizer`.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultLoginScopeResolver` — Impl padrao (agnostica) do `LoginScopeResolver`: IGNORA o `requestedScope` e devolve `null` ("sem opiniao"), preservando o comportamento historico do login — o `AuthService` aplica a politica padrao de escopo.

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancyLoginScopeResolver` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/LoginTenancyLoginScopeResolver.java`) — Impl login-tenancy do `LoginScopeResolver`: traduz o escopo OPACO pedido no login para uma company, no mesmo modelo de particao platform/client do `LoginTenancyJwtTokenCustomizer`. Existe porque o app precisa DECLARAR de que lado esta entrando.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Long resolveLoginScope(User user, String requestedScope)` | Resolve a company da sessao no login. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuLoginScopeResolver implements LoginScopeResolver {

    @Inject
    MembershipRepository memberships;

    @Override
    public Long resolveLoginScope(User user, String requestedScope) {
        if (requestedScope == null) {
            return null; // sem opiniao: o AuthService aplica a politica padrao
        }
        // requestedScope vem do app e NAO e confiavel: valide o vinculo antes de escopar
        Long companyId = memberships.companyIdByScope(user.getId(), requestedScope)
                .orElseThrow(() -> new ForbiddenException("Escopo nao permitido"));
        return companyId;
    }
}
```

## RoleUsageChecker

Extensao: outros modulos informam quantos registros deles ainda dependem de uma role (ex.: API keys do ext-apikeys), para o `RoleService` recusar a exclusao com 409 em vez de estourar a FK.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `ApiKeyRoleUsageChecker` (`seedgrid-quarkus-ext-apikeys/runtime/src/main/java/br/com/seedgrid/apikeys/services/ApiKeyRoleUsageChecker.java`) — Role com API key (mesmo revogada, a FK `fk_api_keys_role` e' RESTRICT) nao e' excluida: 409 em vez de 500.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `long countUsages(Long roleId)` | Quantidade de registros que usam a role (0 = livre). |
| `String usageLabel()` | Nome curto do que usa a role, para a mensagem (ex.: "API key"). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class PedidoRoleUsageChecker implements RoleUsageChecker {

    @Inject
    PedidoRepository pedidos;

    @Override
    public long countUsages(Long roleId) {
        return pedidos.countByRoleId(roleId); // 0 = livre para excluir
    }

    @Override
    public String usageLabel() {
        return "pedido"; // aparece na mensagem de 409
    }
}
```

## SecurityScopeResolverProvider

Define a partição dos dados de permissão (RBAC): o "escopo" em que o cache de permissões é guardado e consultado. A implementação padrão (`DefaultSecurityScopeResolver`, `@DefaultBean`) usa o claim `companyId` do token (`company:`) e, sem ele, o escopo `"default"`. Um host que particiona por tenant (como o subdomain-tenancy) fornece outra implementação, que vence o padrão.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultSecurityScopeResolver` — Escopo padrao de `SecurityScopeResolverProvider`: usa o claim `companyId` do token, quando presente, para particionar o cache de permissoes (ver `PermissionResolveService`) por EMPRESA — a mesma claim que `br.com.seedgrid.security.services.TokenService` ja grava no token (modelo T1, empresa escopada) e que `br.com.seedgrid.security.filters.CompanyContextFilter` ja le de volta em `br.com.seedgrid.security.services.CompanyRequestContext`.

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainTenancySecurityScopeResolver` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainTenancySecurityScopeResolver.java`) — SubdomainTenancy implementation of SecurityScopeResolverProvider. O escopo e' o tenant.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String currentScope()` | Escopo da requisição corrente (por exemplo `company:42` ou `default`). |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `String scopeFor(SecurityIdentity identity)` | Escopo das permissoes para a identidade que esta sendo aumentada. |
| `<T> T runInScope(SecurityIdentity identity, Supplier<T> work)` | Executa a resolucao de permissoes (que consulta o banco) no contexto da identidade. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class PorTenantSecurityScopeResolver implements SecurityScopeResolverProvider {

    @Override
    public String currentScope() {
        return TenantContext.current(); // escopo da requisicao corrente
    }

    @Override
    public String scopeFor(SecurityIdentity identity) {
        // o augmentor roda antes dos filtros: leia o escopo da propria identidade (claim do token)
        Object tenant = identity.getAttribute("tenant");
        if (tenant == null) {
            throw new IllegalStateException("identidade sem tenant"); // falha fechada
        }
        return "tenant:" + tenant;
    }
}
```

## SocialAccountCreator

SPI que CRIA a conta pessoal (PF) de quem entra pela primeira vez por login social. O security sabe vincular e abrir sessao, mas quem conhece o modelo de conta do produto e' o host/extension (B2C so' existe no `login-tenancy`): Company PF + membership root com ADMIN, conforme `customer-type`. Sem implementacao o login social NAO cria conta (`Rejected("SOCIAL_SIGNUP_UNAVAILABLE")`); quem ja tem identidade vinculada ou e-mail verificado de conta existente continua entrando.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultSocialAccountCreator` — Padrao: o security nao cria conta pessoal sozinho (quem sabe e' o host/extension).

**Outras implementações no repositório** (para consultar como exemplo):

- `LoginTenancySocialAccountCreator` (`seedgrid-quarkus-ext-login-tenancy/runtime/src/main/java/br/com/seedgrid/logintenancy/spis/impl/LoginTenancySocialAccountCreator.java`) — Cria a conta pessoal (PF) de quem entra pela primeira vez por login social: Company PF sem documento (o CPF nao e pedido no login social), usuario SEM senha com e-mail confirmado e membership root com ADMIN, e dispara o mesmo `SignupConfirmedEvent` do cadastro por senha (o host cria a conta de cobranca etc.).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `User createPersonalAccount(SocialProfile profile, String email)` | Cria e persiste o usuario (SEM senha, e-mail ja confirmado) e a conta pessoal dele. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `boolean enabled()` | Esta implementacao realmente cria contas? (a padrao devolve `false`). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuSocialAccountCreator implements SocialAccountCreator {
    @Override
    public User createPersonalAccount(SocialProfile profile, String email) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## SocialIdentityProvider

SPI de um provedor de login social. Implementada pelo modulo `seedgrid-security-social`, UMA por provedor (Google, Facebook, ...): normaliza o que o provedor devolve (claims do ID token ou resposta do endpoint de informacoes) para o `SocialProfile` unico e esconde o provedor do `SocialLoginService`.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `AppleSocialIdentityProvider` (`seedgrid-quarkus-ext-security-social/runtime/src/main/java/br/com/seedgrid/security/socialoidc/providers/AppleSocialIdentityProvider.java`) — Sign in with Apple (OIDC; preset `quarkus.oidc.provider=apple`). Diferencas para o Google:
- `FacebookSocialIdentityProvider` (`seedgrid-quarkus-ext-security-social/runtime/src/main/java/br/com/seedgrid/security/socialoidc/providers/FacebookSocialIdentityProvider.java`) — Facebook. Diferencas para o Google, provadas no spike (D:/tmp/spike-facebook.md):
- `GoogleSocialIdentityProvider` (`seedgrid-quarkus-ext-security-social/runtime/src/main/java/br/com/seedgrid/security/socialoidc/providers/GoogleSocialIdentityProvider.java`) — Google (OIDC puro). A identidade e' o `sub`; o e-mail so' e' verificado quando o proprio Google afirma `email_verified=true` (plano 4.10 B5: nunca se vincula por e-mail nao verificado).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String id()` | Id estavel em minusculas (ex.: `google`); e' o `provider` gravado em `user_identity`. |
| `SocialProfile normalize(Map<String, Object> claims)` | Converte os claims do provedor. O `subject` e' obrigatorio; e-mail, nome e foto sao opcionais; `emailVerified` so' e' `true` quando o PROVEDOR afirma a verificacao. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuSocialIdentityProvider implements SocialIdentityProvider {

    @Override
    public String id() {
        return "meuprovedor"; // estavel, em minusculas
    }

    @Override
    public SocialProfile normalize(Map<String, Object> claims) {
        // subject e' obrigatorio; emailVerified so e' true quando o PROVEDOR afirma
        return new SocialProfile(id(), (String) claims.get("sub"), (String) claims.get("email"),
                Boolean.TRUE.equals(claims.get("email_verified")), (String) claims.get("name"),
                (String) claims.get("picture"));
    }
}
```

## SocialProviderCatalog

Quais provedores de login social estao HABILITADOS neste host (ex.: `google`, `facebook`), para o front montar os botoes. Quem implementa e o modulo `seedgrid-security-social`; sem ele a lista e vazia - o security e as extensions de cadastro consultam esta SPI sem depender de OIDC.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultSocialProviderCatalog` — Padrao: sem o modulo social, nenhum provedor habilitado.

**Outras implementações no repositório** (para consultar como exemplo):

- `SocialProviderRegistry` (`seedgrid-quarkus-ext-security-social/runtime/src/main/java/br/com/seedgrid/security/socialoidc/services/SocialProviderRegistry.java`) — Quais provedores sociais estao ligados: EXATAMENTE os listados em `seedgrid.security.social.providers` (ex.: `google,facebook`). Ausente ou vazia = nenhum (modulo inerte).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `List<String> enabledProviders()` | Ids dos provedores habilitados, em ordem de exibicao; vazia quando nao ha login social. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuSocialProviderCatalog implements SocialProviderCatalog {

    @Override
    public List<String> enabledProviders() {
        return List.of("google", "facebook"); // ordem de exibicao dos botoes
    }
}
```

## TemplateSecurityProvider

SPI para fornecer templates de email do modulo security. Hosts podem sobrescrever esta interface para renderizar os templates de onde quiserem (classpath proprio, base de dados, storage, etc).

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultTemplateSecurityProvider` — Carrega de `templates/security/` se existir; senão cai nos templates `security-default` (HTML e texto) do módulo.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String emailConfirmation(User user, String confirmationLink)` | Corpo HTML do email de confirmacao de email. |
| `String passwordReset(User user, String resetLink)` | Corpo HTML do email de redefinicao de senha. |
| `String entryRequestConfirmation(User user, String confirmationLink)` | Corpo HTML da solicitacao de entrada (criacao de conta) para confirmacao. |
| `String entryRequestApproved(User user, String loginLink)` | Corpo HTML da aprovacao de solicitacao de entrada. |
| `String welcomeEmail(User user, String temporaryPassword, String confirmationLink)` | Corpo HTML do email de boas-vindas com senha temporaria e link de confirmacao. |
| `String twoFactorCode(User user, String code, int expiresInMinutes)` | Corpo HTML do email de codigo de verificacao 2FA. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `String entryRequestConfirmationCode(User user, String code, int expiresInMinutes)` | Corpo HTML da solicitacao de entrada (criacao de conta) usando codigo OTP. Por padrao reutiliza o template de codigo 2FA para nao quebrar implementacoes existentes. |
| `String entryRequestInvitation(User user, String invitationLink, int expiresInHours, String invitedBy)` | Corpo HTML do convite para self-enter. |
| `String twoFactorWhatsappText(User user, String code, int expiresInMinutes)` | Corpo texto da mensagem de codigo de verificacao 2FA via WhatsApp. Por padrao reutiliza o mesmo conteudo do codigo 2FA, permitindo override no host. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuTemplateSecurityProvider implements TemplateSecurityProvider {
    @Override
    public String emailConfirmation(User user, String confirmationLink) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String passwordReset(User user, String resetLink) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String entryRequestConfirmation(User user, String confirmationLink) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String entryRequestApproved(User user, String loginLink) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String welcomeEmail(User user, String temporaryPassword, String confirmationLink) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String twoFactorCode(User user, String code, int expiresInMinutes) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## TwoFactorEmailTemplateProvider

Template do e-mail do código 2FA. O host fornece o seu para trocar assunto e HTML.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultTwoFactorEmailTemplateProvider` — Template padrão do e-mail do código 2FA.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `EmailTemplate buildCodeEmail(User user, String code, int expiresInMinutes)` | Monta o e-mail do código 2FA (assunto, HTML e texto). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuTwoFactorEmailTemplateProvider implements TwoFactorEmailTemplateProvider {
    @Override
    public EmailTemplate buildCodeEmail(User user, String code, int expiresInMinutes) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## TwoFactorStrategy

Estratégia de um método de 2FA (e-mail, TOTP, WhatsApp, SMS, ...). Todas as implementações CDI são descobertas e registradas; o host acrescenta métodos novos implementando esta interface.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `EmailTwoFactorStrategy` — 2FA por e-mail: gera um código de 6 dígitos, guarda o hash no cache e envia por e-mail; a verificação compara o código informado com o hash.
- `TotpTwoFactorStrategy` — 2FA por TOTP (aplicativo autenticador).
- `WhatsappTwoFactorStrategy` — 2FA por WhatsApp: gera um código de 6 dígitos, guarda o hash no cache e envia pelo WhatsApp.

**Outras implementações no repositório** (para consultar como exemplo):

- `WhatsAppTwoFactorStrategy` (`seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/spis/TwoFactorStrategy.java`)

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String getMethodCode()` | Código único do método (`EMAIL`, `TOTP`, `WHATSAPP`...), gravado no usuário, usado em `seedgrid.security.2f.allowed-methods` e devolvido pela API. |
| `boolean canInitiate(User user)` | Se o método pode ser iniciado para o usuário (pré-requisitos do desafio de login). |
| `TwoFactorInitResult initiate(User user, TwoFactorContext context)` | Inicia a verificação (gera e envia o código, ou confere que o TOTP está configurado). |
| `TwoFactorVerifyResult verify(User user, String code, TwoFactorContext context)` | Verifica o código informado: validade, expiração, limite de tentativas; limpa os dados temporários no sucesso. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `boolean canEnroll(User user)` | Se o usuário pode começar a habilitar o método. Padrão: igual a `canInitiate`. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuTwoFactorStrategy implements TwoFactorStrategy {
    @Override
    public String getMethodCode() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public boolean canInitiate(User user) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public TwoFactorInitResult initiate(User user, TwoFactorContext context) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public TwoFactorVerifyResult verify(User user, String code, TwoFactorContext context) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## UserAdditionalFieldsValidator

Validates application-specific user attributes before they are persisted.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultUserAdditionalFieldsValidator` — Não impõe regra alguma.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void validate(User user, Map<String, JsonNode> additionalAttributes)` | Valida os atributos adicionais do usuário antes de gravar; lance exceção para rejeitar. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuUserAdditionalFieldsValidator implements UserAdditionalFieldsValidator {

    @Override
    public void validate(User user, Map<String, JsonNode> additionalAttributes) {
        JsonNode cpf = additionalAttributes.get("cpf");
        if (cpf == null || !CpfValidator.isValid(cpf.asText())) {
            throw new BadRequestException("cpf invalido");
        }
    }
}
```

## UserQuotaValidator

SPI que valida se uma company pode receber mais um usuario, chamada ANTES do `User` ser persistido (aprovacao de self-enter, criacao direta via admin). O security e AGNOSTICO: nao sabe o que e "plano"/"assinatura"/"limite contratado" - so pergunta "pode adicionar mais um usuario nessa company?" e deixa a implementacao lancar a excecao que fizer sentido pro host quando a resposta for nao.

**Pacote:** `br.com.seedgrid.security.spis`

**Padrão (`@DefaultBean`):**

- `DefaultUserQuotaValidator` — Impl padrao (agnostica) do `UserQuotaValidator`: nunca bloqueia (sem limite). Quem quiser aplicar limite de usuarios por plano (ex.: report-api) fornece outra impl `@ApplicationScoped` sem `@DefaultBean`, que vence esta.

**Outras implementações no repositório** (para consultar como exemplo):

- `PlanUserQuotaValidator` (`seedgrid-quarkus-ext-billing/seedgrid-billing-core/runtime/src/main/java/br/com/seedgrid/billing/spis/impl/PlanUserQuotaValidator.java`) — Implementacao do SPI `UserQuotaValidator` da security: aplica o limite de usuarios do plano da conta (`PlanTerm.maxUsers`) ao cadastrar, vincular e reativar membro. Sem `@DefaultBean`, entao vence a implementacao default da security (sem limite).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void assertCanAddUser(Company company)` | Verifica se a company pode receber mais um usuario. Nao faz nada se pode prosseguir; lanca excecao (tipicamente `jakarta.ws.rs.WebApplicationException`) se o limite contratado ja foi atingido. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class PorPlanoUserQuotaValidator implements UserQuotaValidator {

    @Inject
    PlanoService planos;

    @Override
    public void assertCanAddUser(Company company) {
        if (planos.usuariosAtivos(company) >= planos.limiteDeUsuarios(company)) {
            throw new WebApplicationException("Limite de usuarios do plano atingido", 402);
        }
    }
}
```
