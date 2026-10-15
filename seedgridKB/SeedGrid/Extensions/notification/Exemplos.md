---
tags: [seedgrid, extension, notification, exemplos]
fonte: java/seedgrid-quarkus-ext-notification
branch: main
commit: b989a6248a
analisado-em: 2026-10-14
---

# Notification (Quarkus) — exemplos

Voltar: [[SeedGrid/Extensions/notification/Visao-geral|Visão geral do notification]] · [[SeedGrid/Extensions/notification/Configuracao|Configuração]]

## 1. Dependências

Fonte: `README.md` / poms.

```xml
<!-- Extensão produtora: só o contrato -->
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-notification-api</artifactId>
    <version>2026.10.15</version>
</dependency>

<!-- Produto que quer catálogo, API administrativa e entrega -->
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-notification</artifactId>
    <version>2026.10.15</version>
</dependency>
```

## 2. Declarar eventos (extensão produtora)

Fonte: `README.md`; assinatura de `EventDefinition(code, group, label, description, variables, subjectTemplate, bodyTemplate)`.

```java
import br.com.seedgrid.notification.api.EventDefinition;
import br.com.seedgrid.notification.api.NotificationCatalogContributor;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class PricingNotifications implements NotificationCatalogContributor {
    @Override
    public Collection<EventDefinition> events() {
        return List.of(new EventDefinition(
            "ai-pricing.approval-pending", "Preços de IA", "Aprovação pendente",
            "Novos preços aguardam revisão", Set.of("quantity"),
            "Preços aguardando aprovação", "Há {quantity} preços para revisar."));
    }
}
```

## 3. Publicar dentro da transação de negócio

Fonte: `README.md`; `NotificationPublisher#publish(NotificationEvent)`; `NotificationEvent(id, code, variables)`.

```java
import br.com.seedgrid.notification.api.NotificationEvent;
import br.com.seedgrid.notification.api.NotificationPublisher;

@Inject NotificationPublisher notifications;

@Transactional
public void proporPrecos(...) {
    // ... grava a proposta ...
    // id estável da ocorrência (não gerar UUID novo a cada retry)
    notifications.publish(new NotificationEvent(
        proposalPublicId, "ai-pricing.approval-pending", Map.of("quantity", "3")));
}
```

Evento operacional embutido (publicável por qualquer host): código `platform.email-delivery-failed`, variáveis `recipient`, `subject`, `cause`, `accumulated` (`OperationalNotificationCatalog`).

## 4. Configurar uma regra (admin)

Fonte: `docs/API.md`, `README.md`.

```http
PUT /admin/notifications/events/ai-pricing.approval-pending
Content-Type: application/json
Authorization: Bearer <JWT-COM-NOTIFICATION_UPDATE>

{
  "enabled": true,
  "channels": ["EMAIL", "WHATSAPP"],
  "emails": ["financeiro@example.com"],
  "phones": ["+5511999999999"],
  "whatsappChannelId": "administrativo",
  "conditionalRecipients": [
    {"channel": "WHATSAPP", "address": "+5511911111111", "attribute": "partnerPublicId", "value": "8f1c..."},
    {"channel": "WHATSAPP", "address": "+5511922222222", "attribute": "partnerPublicId", "value": null}
  ]
}
```

E-mails são normalizados (trim, minúsculas, dedup); telefones em E.164; até 50 destinatários por canal (incondicionais + condicionais); WhatsApp exige `whatsappChannelId`.

## 5. Destinatários condicionais: enricher do host

Fonte: `README.md`; interface `NotificationEventEnricher` e `RoutingAttribute`.

```java
import br.com.seedgrid.notification.api.NotificationEvent;
import br.com.seedgrid.notification.api.NotificationEventEnricher;
import br.com.seedgrid.notification.api.RoutingAttribute;

@ApplicationScoped
public class PartnerRouting implements NotificationEventEnricher {
    @Override
    public Map<String, String> attributes(NotificationEvent event) {
        String account = event.variables().get("accountPublicId");
        String partner = account == null ? null : partners.partnerOf(account);
        return partner == null ? Map.of() : Map.of("partnerPublicId", partner);
    }

    @Override
    public List<RoutingAttribute> describe() {
        return List.of(new RoutingAttribute("partnerPublicId", "Parceiro",
                partners.list().stream()
                        .map(p -> new RoutingAttribute.Option(p.publicId(), p.name())).toList()));
    }
}
```

Não anote o enricher com `@Transactional` (uma exceção marcaria a transação de negócio para rollback); exceções do enricher são logadas e ignoradas.

## 6. Consultar histórico

```http
GET /admin/notifications/deliveries?page=0&size=30
```

Resposta: `{ items: [{id, eventCode, channel, status, attempts, createdAt, sentAt, lastError}], totalRecords, page, size }`.

## 7. Configuração

Ver [[SeedGrid/Extensions/notification/Configuracao|Configuração]] (mailer `quarkus.mailer.security.*`, `seedgrid.notification.*`).
