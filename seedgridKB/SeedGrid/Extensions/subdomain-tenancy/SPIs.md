---
tags: [seedgrid, extension, subdomain-tenancy, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-subdomain-tenancy
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# subdomain-tenancy (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-subdomain-tenancy` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#EmailTemplateProvider]] | sem padrão | Precisa de implementação do host. |
| [[#PasswordEncoder]] | `BCryptPasswordEncoder` | Hash BCrypt com 12 rounds de salt. |
| [[#SubdomainTenancyNotificationService]] | `MailerNotificationService` | Envia o e-mail de validação com o Quarkus Mailer e templates Qute; o host troca o bean ou os templates. |
| [[#TemplateSubdomainTenancyProvider]] | `DefaultTemplateSubdomainTenancyProvider` | Tenta `templates/subdomain-tenancy/confirmation.html` do host e cai no template `subdomaintenancy-default` do módulo. |

## EmailTemplateProvider

Renderiza o e-mail de confirmação do tenant. O padrão usa um template de texto simples; o host pode usar Freemarker, Qute, Thymeleaf etc.

**Pacote:** `br.com.seedgrid.subdomaintenancy.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String buildConfirmationEmailHtml(String tenantName, String email, String validationCode, String validationLink)` | HTML do e-mail de confirmação do tenant. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `String getConfirmationEmailSubject(String tenantName)` | Assunto do e-mail de confirmação. Padrão: `Confirme seu email - <tenant>`. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuEmailTemplateProvider implements EmailTemplateProvider {
    @Override
    public String buildConfirmationEmailHtml(String tenantName, String email, String validationCode, String validationLink) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## PasswordEncoder

Codifica a senha em texto puro (hash) antes de gravá-la. O padrão usa BCrypt; o host pode trocar por Argon2 ou outro.

**Pacote:** `br.com.seedgrid.subdomaintenancy.spis`

**Padrão (`@DefaultBean`):**

- `BCryptPasswordEncoder` — Hash BCrypt com 12 rounds de salt.

**Outras implementações no repositório** (para consultar como exemplo):

- `BCryptPasswordEncoder` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/PasswordEncoder.java`) — Hash BCrypt com 12 rounds de salt.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String encode(String plainPassword)` | Devolve a senha codificada (hash). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class BCryptPasswordEncoder implements PasswordEncoder {

    @Override
    public String encode(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt());
    }
}
```

## SubdomainTenancyNotificationService

Envia a notificação de validação do tenant ao representante legal, pelo canal que o host escolher (e-mail, SMS, WhatsApp).

**Pacote:** `br.com.seedgrid.subdomaintenancy.spis`

**Padrão (`@DefaultBean`):**

- `MailerNotificationService` — Envia o e-mail de validação com o Quarkus Mailer e templates Qute; o host troca o bean ou os templates.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void sendValidationNotification(TenantValidationNotification notification)` | Envia a notificação de validação; o canal sai do `channelHint` do payload (e-mail, SMS, WhatsApp...). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuNotificationService implements SubdomainTenancyNotificationService {

    @Override
    public void sendValidationNotification(TenantValidationNotification notification) {
        // escolha o canal pelo channelHint (email, sms, whatsapp...); validationCode e' o OTP de 6 digitos
        meuEnvio.enviar(notification.channelHint(), notification.recipient(),
                "Seu codigo: " + notification.validationCode()
                        + " (expira em " + notification.expiryMinutes() + " min)");
    }
}
```

## TemplateSubdomainTenancyProvider

SPI para renderizar templates de e-mail do módulo subdomain-tenancy.

**Pacote:** `br.com.seedgrid.subdomaintenancy.spis`

**Padrão (`@DefaultBean`):**

- `DefaultTemplateSubdomainTenancyProvider` — Tenta `templates/subdomain-tenancy/confirmation.html` do host e cai no template `subdomaintenancy-default` do módulo.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String buildValidationEmail(String recipientName, String tradeName, String validationCode, int expiryMinutes)` | Constrói o corpo HTML do e-mail de validação de tenant (OTP). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuTemplateSubdomainTenancyProvider implements TemplateSubdomainTenancyProvider {
    @Override
    public String buildValidationEmail(String recipientName, String tradeName, String validationCode, int expiryMinutes) {
        throw new UnsupportedOperationException("implemente");
    }
}
```
