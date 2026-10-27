---
tags: [seedgrid, extension, login-tenancy, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-login-tenancy
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# login-tenancy (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/login-tenancy/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-login-tenancy` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#LoginTenancyTemplateProvider]] | `DefaultLoginTenancyTemplateProvider` | Implementacao default dos templates da login-tenancy. Carrega de `templates/logintenancy/` (override do host) e cai para o fallback `templates/logintenancy-default/html/` (bundle da extension), exatamente como o `DefaultTemplateSecurityProvider` do ext-security. |

## LoginTenancyTemplateProvider

SPI de templates da foundation login-tenancy. Espelha o padrao do `TemplateSecurityProvider` do ext-security: a extension traz uma implementacao default (`DefaultLoginTenancyTemplateProvider`) e o host pode sobrescrever de duas formas:

**Pacote:** `br.com.seedgrid.logintenancy.spis`

**Padrão (`@DefaultBean`):**

- `DefaultLoginTenancyTemplateProvider` — Implementacao default dos templates da login-tenancy. Carrega de `templates/logintenancy/` (override do host) e cai para o fallback `templates/logintenancy-default/html/` (bundle da extension), exatamente como o `DefaultTemplateSecurityProvider` do ext-security.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String signupConfirmation(String recipientName, String confirmationToken, String appName)` | Corpo HTML do e-mail de confirmacao de cadastro institucional. |
| `String signupWelcome(String recipientName, String companyName, String appName)` | Corpo HTML do e-mail de boas-vindas, enviado logo apos o cadastro institucional ser confirmado (Company + usuario root ja criados). |
| `String userActivation(String recipientName, String email, String confirmationUrl, String initialPassword, String appName)` | Corpo HTML do e-mail de ativacao enviado quando um admin de empresa cria um NOVO usuario da propria equipe (`POST /me/security/users`): carrega a senha inicial (escolhida pelo admin no formulario) e o link de confirmacao de e-mail, pois o usuario final so' consegue logar apos validar (o login do security exige `isEmailConfirmed`). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuLoginTenancyTemplateProvider implements LoginTenancyTemplateProvider {
    @Override
    public String signupConfirmation(String recipientName, String confirmationToken, String appName) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String signupWelcome(String recipientName, String companyName, String appName) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String userActivation(String recipientName, String email, String confirmationUrl, String initialPassword, String appName) {
        throw new UnsupportedOperationException("implemente");
    }
}
```
