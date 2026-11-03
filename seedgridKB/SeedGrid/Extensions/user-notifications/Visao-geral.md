---
description: "Visão geral da extension user-notifications: caixa de notificações por usuário (tabela, rotas /user-notifications, UserNotifier, aviso em tempo real, retenção, isolamento entre usuários, conta no login-tenancy); só colocar a dependência já funciona."
tags: [seedgrid, extension, user-notifications, notificacao, quarkus]
fonte: java/seedgrid-quarkus-ext-user-notifications
branch: main
commit: 6a192a3
analisado-em: 2026-11-03
---

# User-notifications (Quarkus): visão geral

> **Status: ainda não publicada.** Versão de trabalho **2026.11.01**, com commits locais (`6a192a3`, sem push). Plano P130 do work. Enquanto não sair no Maven Central, só resolve no `~/.m2` de quem a instalou. Detalhes: [[SeedGrid/Extensions/user-notifications/Configuracao|Configuração]] · [[SeedGrid/Extensions/user-notifications/Exemplos|Exemplos]].

## Para que serve

Guarda no banco as notificações **de cada usuário** ("seu relatório ficou pronto", "backup concluído") e avisa em tempo real que há uma nova. Serve a qualquer aviso ao usuário: a extension **não conhece relatório nem backup**; o `type` é livre (`report.ready`, `backup.finished`, ...). O sino de notificações do front (plano P129) lê esta API.

## Como entra no host

- **Só a dependência** `br.com.seedgrid:seedgrid-user-notifications`. Nenhuma propriedade é obrigatória. **Confirmado** no `UserNotificationsConfig`.
- A migration (V1400, histórico próprio `sg_flyway_schema_history_user_notifications`, pasta `db/migration/user-notifications`) cria `sg_user_notification` sozinha. Faixa **V1400–V1499** (a 1300–1399 é da `filemanagement`; ver a nota `Faixas-de-migrations` da KB de plataforma).
- O `login-tenancy` e o `subdomain-tenancy` **dependem sempre dela**: o host que usa uma das duas já tem a caixa. No `subdomain-tenancy` a V1400 roda em cada banco de tenant (o master não recebe a tabela).
- Sem a `security` no projeto funciona do mesmo jeito (a anotação de login é inerte e o serviço falha fechado sem usuário).

## Quem notifica: `UserNotifier`

Bean `@ApplicationScoped` para outras extensions e para o host.

```java
@Inject UserNotifier notifier;

notifier.notify(userPublicId, "report.ready", "Relatório pronto", "Clique para baixar",
        Map.of("reportId", reportId));
```

- Devolve o `publicId` da notificação; com a extension desligada não grava e devolve `null`.
- `payload` leva **só identificadores** (nunca URL, caminho de arquivo nem dado pessoal), no máximo `max-payload-bytes`. Quem abre a notificação chama a rota da extension dona do recurso (por exemplo, o download do backup).
- Grava na transação do chamador; o aviso só sai depois do commit.
- Fora de uma requisição (job em segundo plano) use a sobrecarga com a conta: `notify(accountPublicId, userPublicId, type, title, message, payload, expiresAt)`.
- Limites: `type` ≤ 100, `title` ≤ 200, `message` ≤ 1000 caracteres; `type` e `title` obrigatórios. Violação lança `InvalidNotificationException`.

## Rotas (`/user-notifications`, só do usuário logado)

| Método e caminho | O que faz |
|---|---|
| `GET /user-notifications?unreadOnly=&type=&page=&size=` | Lista paginada (padrão `page=0`, `size=20`), mais novas primeiro. |
| `GET /user-notifications/unread-count` | `{ "count": n }`. |
| `POST /user-notifications/{id}/read` | Marca como lida (204). |
| `POST /user-notifications/read-all` | Marca todas como lidas (`{ "updated": n }`). |
| `DELETE /user-notifications/{id}` | Exclui uma (204). |
| `DELETE /user-notifications?onlyRead=true` | Limpa todas, ou só as lidas (`{ "deleted": n }`). |

Não existe rota de criação: `POST` ou `PUT` na coleção dão 405. **Só código do host ou de outra extension cria notificação**, chamando o `UserNotifier`. **Confirmado** no `UserNotificationController` e nos testes do `dev-2`.

## Acesso: basta estar logado, sem permissões

As rotas usam `@Authenticated`: **não há permissões** (`USER_NOTIFICATION_*`), **nem seed** de permissão. É decisão do dono (P130.F0.D7): quem está logado vê as próprias notificações. Regra geral para extension "só do próprio usuário": use `@Authenticated` e não semeie permissão.

## Isolamento entre usuários

Um usuário **nunca** vê, lê, marca nem apaga a notificação de outro, e o usuário vem **sempre do token** (`userPublicId` por query ou cabeçalho é ignorado). Notificação alheia dá 404. No `subdomain-tenancy` o isolamento vale também entre tenants (o id do tenant alfa dá 404 no beta). Testado: `UserNotificationsUserIsolationIT` (extension), `UserNotificationsTenantGuardianIT` (subdomain-tenancy-example), `UserNotificationsAccountGuardianIT` (login-tenancy-example) e `BackupInboxNotificationTest` (backup-example, com tokens de dois usuários). **Confirmado** (relato do `dev-2`, plano P130.F2.T5).

## Conta (BE-72)

A extension é agnóstica: quem sabe o que é "conta" é o SPI `NotificationAccountProvider` (padrão: sem conta). O `login-tenancy` traz a implementação (`LoginTenancyNotificationAccountProvider`: a conta é a empresa do token). No `subdomain-tenancy` a conta é nula (o banco do tenant já isola).

## Aviso em tempo real

Depois de gravar, a extension dispara `SgUserEvent` no canal `user-notifications`, evento `user-notification.created` (e `user-notification.changed` ao ler ou excluir), com **só identificadores** (`notificationPublicId`, `type`). A extension `realtime` repassa ao Pulse com `publishToUser` **só ao dono** (nunca broadcast). O front busca o conteúdo pela API. Usuário desconectado: ver [[SeedGrid/Extensions/realtime/Visao-geral|realtime]] (o Pulse guarda e entrega na volta, e a leitura inicial da lista já traz tudo). Hosts que preenchem `seedgrid.realtime.channels` devem **incluir o canal `user-notifications`**.

## Retenção

- Padrão 30 dias e 200 por usuário. Ao passar do teto saem as mais antigas, **as lidas primeiro** (com só não lidas, a mais antiga não lida).
- Limpeza por usuário a cada nova notificação, mais uma **varredura diária** (cron configurável, desligável) que apaga as vencidas de todos. Não precisa ser exata no dia; o usuário também exclui à mão. Detalhes em [[SeedGrid/Extensions/user-notifications/Configuracao|Configuração]].
- Exclusão **física** (sem lixeira).

## Quem usa hoje

- **`backup`**: ao terminar o export, sucesso ou erro, notifica quem pediu (`backup.finished` e `backup.failed`, `payload` só `{exportPublicId}`). Dependência `provided` no backup: sem a user-notifications ele funciona igual (SPI `ExportInboxNotifier`). A conta de quem pediu é gravada na linha do job (`sg_export_jobs`, coluna `inbox_account_public_id`, V401), então sobrevive a reinício do servidor.
- **`reports`** (plano P128, futuro): relatório pronto.

## Lacunas e pontos de atenção

- **Boolean de query nativa:** nos testes de integração um `Boolean` nativo volta `"true"` via `EntityManager` e `"t"` via JDBC. **Confirmado** (relato do `dev-2`).
- O processor de uma extension **não roda** nos testes do próprio módulo `runtime`; registro condicional só se prova num host (exemplo).
- Para aparecer no índice combinado a extension precisa de `IndexDependencyBuildItem` (a `user-notifications` tem desde `58743b0`).
- `POST` sem corpo com `@Consumes(JSON)` responde 415 (a extension não declara `@Consumes` nos POST sem corpo).
- Crate Rust equivalente: plano P131 (ainda não feito).
