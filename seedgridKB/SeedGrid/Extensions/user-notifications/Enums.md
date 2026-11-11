---
tags: [seedgrid, extension, user-notifications, enum]
fonte: java/seedgrid-quarkus-ext-user-notifications
branch: main
commit: 5b46ff9
analisado-em: 2026-11-11
---

# Enums — user-notifications (Quarkus)

Voltar: [[SeedGrid/Extensions/user-notifications/Visao-geral|Visão geral da user-notifications]] · [[SeedGrid/Extensions/user-notifications/Configuracao|Configuração]] · [[SeedGrid/Extensions/user-notifications/Exemplos|Exemplos]]

A extension tem um único enum público, aninhado no evento de auditoria. Nenhum enum é tipo de propriedade de configuração, nem é persistido ou serializado por esta extension.

## 1. Índice

| Enum | Pacote/arquivo (`runtime/src/main/java/br/com/seedgrid/usernotifications/`) | Usado em | Público? |
|---|---|---|---|
| [[SeedGrid/Extensions/user-notifications/Enums#NotificationAuditEvent.Kind\|NotificationAuditEvent.Kind]] | `events/NotificationAuditEvent.java` | `NotificationAuditEvent.kind()`, `AuditNotificationTrail#toLog` (SPI `NotificationAuditSink`) | Sim |

## NotificationAuditEvent.Kind

Arquivo: `events/NotificationAuditEvent.java` (enum aninhado) — FQN `br.com.seedgrid.usernotifications.events.NotificationAuditEvent.Kind`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `CREATED` | Notificação criada | Criado por `NotificationAuditEvent.created(...)`, disparado em `UserNotifier` depois de gravar. `AuditNotificationTrail` grava `AuditOperationEnum.CREATE` ("User notification created") com `publicId`, `type` e `userPublicId` no estado posterior | **Confirmado**. `actorPublicId` é nulo (quem notifica é código do host); o usuário da trilha é o `SYSTEM_USER` |
| `DELETED` | Notificação excluída pelo próprio dono | `NotificationAuditEvent.deleted(...)`, disparado em `UserNotificationService#delete`. `AuditNotificationTrail` grava `AuditOperationEnum.DELETE` ("User notification deleted by the user") com o estado anterior | **Confirmado** |
| `CLEARED` | Exclusão em lote da caixa | `NotificationAuditEvent.cleared(...)`, disparado em `UserNotificationService#clear` só quando `deleted > 0`. `AuditNotificationTrail` grava `AuditOperationEnum.DELETE` com `onlyRead` e `count`; a descrição distingue "read only" de "all" | **Confirmado**. `publicId` e `type` são nulos |

Sem campos. O evento é observado com `@Observes(during = TransactionPhase.AFTER_SUCCESS)` em `NotificationAuditDispatcher` e entregue ao `NotificationAuditSink`, se houver algum (o adaptador da extension `audit` só é registrado quando ela está na aplicação). O evento leva só identificadores e tipo, nunca `title`, `message` nem `payload`.

## Internos

Nenhum outro enum em `runtime/src/main` (**Confirmado** por busca de `enum`).
