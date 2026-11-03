---
description: "Exemplos da extension user-notifications: notificar com o UserNotifier (host e job em segundo plano), chamar as rotas, ler o aviso em tempo real e o padrão do backup; formatos de resposta."
tags: [seedgrid, extension, user-notifications, exemplos]
fonte: java/seedgrid-quarkus-ext-user-notifications
branch: main
commit: 6a192a3
analisado-em: 2026-11-03
---

# User-notifications: exemplos

> **Status: publicada no Maven Central em 2026-11-03** (2026.11.01). Exemplos executáveis no repositório `seedgrid-platform-examples`: `seedgrid-user-notifications-example` (host mínimo), `backup-example`, `login-tenancy-example` e `subdomain-tenancy-example`. Visão geral: [[SeedGrid/Extensions/user-notifications/Visao-geral|Visão geral]] · [[SeedGrid/Extensions/user-notifications/Configuracao|Configuração]].

## 1. Notificar dentro de uma requisição

O host só injeta o `UserNotifier`. A conta, se houver, vem do adaptador (`login-tenancy`).

```java
@Path("/demo")
public class NotifyDemoResource {

    @Inject UserNotifier notifier;

    @POST
    @Path("/notify")
    @Authenticated
    public Response notifyMe(@Context SecurityContext security) {
        String userPublicId = security.getUserPrincipal().getName();
        String id = notifier.notify(userPublicId, "demo.hello", "Olá", "Mensagem de teste",
                Map.of("orderId", "42"));
        return Response.ok(Map.of("notificationPublicId", id)).build();
    }
}
```

Este é o `NotifyDemoResource` do `seedgrid-user-notifications-example`; o endereço do usuário vem do token no exemplo, mas o `UserNotifier` aceita qualquer `userPublicId` (por isso só código do servidor o chama).

## 2. Notificar de um job em segundo plano

Fora de uma requisição não há conta corrente: guarde a conta na thread do pedido e passe na sobrecarga com conta.

```java
// na thread do pedido
String account = accountProvider.currentAccountPublicId().orElse(null);
// ... no job
notifier.notify(account, userPublicId, "backup.finished", "Backup concluído",
        "Seu backup está pronto", Map.of("exportPublicId", exportPublicId), null);
```

O `backup` grava a conta na linha do job (`sg_export_jobs.inbox_account_public_id`), para o aviso sobreviver a um reinício do servidor.

## 3. Chamar as rotas (usuário logado)

```bash
# lista não lidas, 20 por página
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/user-notifications?unreadOnly=true&size=20"
```

```json
{
  "items": [
    {
      "publicId": "0b6f...",
      "type": "backup.finished",
      "title": "Backup concluído",
      "message": "Seu backup está pronto",
      "payload": { "exportPublicId": "9c1d..." },
      "read": false,
      "readAt": null,
      "createdAt": "2026-11-03T14:05:11Z",
      "expiresAt": null
    }
  ],
  "page": 0, "size": 20, "total": 1
}
```

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/user-notifications/unread-count   # {"count":1}
curl -X POST   -H "Authorization: Bearer $TOKEN" http://localhost:8080/user-notifications/0b6f.../read          # 204
curl -X POST   -H "Authorization: Bearer $TOKEN" http://localhost:8080/user-notifications/read-all              # {"updated":n}
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/user-notifications/0b6f...              # 204
curl -X DELETE -H "Authorization: Bearer $TOKEN" "http://localhost:8080/user-notifications?onlyRead=true"       # {"deleted":n}
```

Notificação de outro usuário dá 404; sem token dá 401 (com a `security` no projeto).

## 4. Aviso em tempo real

Cada notificação nova dispara, no canal `user-notifications`, o evento `user-notification.created` com `{ "notificationPublicId", "type" }` (só identificadores). O front (`SgRealtimeProvider`) recebe, busca a lista pela API e anima o sino. Sem Pulse ligado o sino usa polling. Ver [[SeedGrid/Extensions/realtime/Visao-geral|realtime]].

```properties
# só se o host restringe os canais do token do Pulse
seedgrid.realtime.channels=user-notifications
```

## 5. Padrão para uma extension que notifica sem depender da user-notifications

Como o `backup`: dependência `provided`, SPI próprio e registro condicional.

```java
public interface ExportInboxNotifier {
    void finished(String account, String userPublicId, String exportPublicId);
    void failed(String account, String userPublicId, String exportPublicId);
}
// injetado por Instance<ExportInboxNotifier>; a implementação só vira bean quando o UserNotifier está no índice
```

Sem a `user-notifications` no projeto o backup funciona igual; falha da caixa só vira log e nunca derruba o job. **Confirmado** (plano P130.F2.T4).

## 6. Consultar a trilha (com a `audit` no projeto; P136, ainda não publicada)

O usuário diz que o relatório não chegou. Procure o que aconteceu com as notificações dele:

```bash
# criações e exclusões de notificações (entidade UserNotification)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/audit-logs?entity=UserNotification&page=0&size=20"
# só exclusões
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/audit-logs?entity=UserNotification&operation=DELETE"
```

Como ler:

- Há `CREATE` do `type` esperado (por exemplo `backup.finished`) para o `userPublicId`, e depois um `DELETE` com o mesmo `publicId` feito pelo próprio usuário: **o aviso chegou e ele o excluiu** (`DELETE` em lote traz só `count` e `onlyRead`, sem `publicId`).
- **Não há `CREATE`**: o aviso nunca foi criado; o problema está no job (backup/relatório) ou na extension que notifica, não na caixa.
- Não há registro de poda automática nem da varredura diária (decisão do dono); sumiço por limite de 200 por usuário não aparece.

A trilha leva só `publicId`, `type`, `userPublicId` (e `onlyRead`/`count` no lote), nunca `title`, `message` nem `payload`.
