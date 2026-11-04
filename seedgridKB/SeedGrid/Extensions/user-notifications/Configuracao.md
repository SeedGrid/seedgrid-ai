---
description: "Propriedades seedgrid.user-notifications.* (enabled, persistence-unit, retention, max-per-user, max-payload-bytes, cleanup.cron), padrões e exemplos de application.properties; nenhuma é obrigatória."
tags: [seedgrid, extension, user-notifications, configuracao]
fonte: java/seedgrid-quarkus-ext-user-notifications
branch: main
commit: 1b3bf83
analisado-em: 2026-11-04
---

# User-notifications: configuração

> **Status: publicada no Maven Central** (2026.11.01 e 2026.11.02 em 2026-11-03; **2026.11.03 em 2026-11-04**, com a ETag/304 nas leituras e o teto padrão de 100 por usuário). Os padrões vêm do `@ConfigMapping` `UserNotificationsConfig`. **Nenhuma propriedade é obrigatória**: colocou a dependência, funciona. Visão geral: [[SeedGrid/Extensions/user-notifications/Visao-geral|Visão geral]].

## Propriedades

| Propriedade | Padrão | Comportamento |
|---|---|---|
| `seedgrid.user-notifications.enabled` | `true` | Liga/desliga a extension. Desligada: rotas 404, sem migration e o `UserNotifier` não grava nada (devolve `null`). |
| `seedgrid.user-notifications.persistence-unit` | unidade default | Unidade de persistência da tabela `sg_user_notification`. Vazio = default. |
| `seedgrid.user-notifications.retention` | `P30D` | Notificações mais velhas que isto são apagadas (duração ISO-8601). |
| `seedgrid.user-notifications.max-per-user` | `100` | Máximo por usuário; ao passar saem as mais antigas (as lidas primeiro). **O padrão era 200 até a 2026.11.02 e passou a 100 na 2026.11.03** (decisão do dono, P129.F0.D4: o sino mostra até 100 numa página só). Quem quiser outro valor define a propriedade. |
| `seedgrid.user-notifications.max-payload-bytes` | `4096` | Tamanho máximo do payload JSON, em bytes; maior que isso lança `InvalidNotificationException`. |
| `seedgrid.user-notifications.cleanup.cron` | `0 30 3 * * ?` (03:30 todo dia) | Cron do Quarkus Scheduler (6 campos) da varredura diária que apaga as vencidas de **todos** os usuários. `off` desliga. Só roda se o host tem o `quarkus-scheduler` (simples, sem Quartz); sem ele a extension sobe normalmente. |
| `seedgrid.migrations.host-managed` | `false` | Definido pelas tenancy: o runner da extension não age, a tenancy migra cada banco. |

Variáveis de ambiente seguem a regra do MicroProfile (por exemplo `SEEDGRID_USER_NOTIFICATIONS_RETENTION`). **Inferência**, pela regra geral do Quarkus; não há mapeamento explícito.

**Confirmado** no `UserNotificationsConfig` (commit `1b3bf83`: `@WithDefault("100")` em `maxPerUser`).

## Exemplos de `application.properties`

```properties
# Nada é obrigatório: só a dependência já funciona.

# Guardar por 90 dias, até 500 por usuário
seedgrid.user-notifications.retention=P90D
seedgrid.user-notifications.max-per-user=500

# Payload de até 8 KB
seedgrid.user-notifications.max-payload-bytes=8192

# Varredura às 02:00 em vez de 03:30
seedgrid.user-notifications.cleanup.cron=0 0 2 * * ?

# Sem varredura diária (a limpeza por usuário a cada notificação nova continua)
seedgrid.user-notifications.cleanup.cron=off

# Tabela em outra unidade de persistência
seedgrid.user-notifications.persistence-unit=notifications

# Desligar a extension
seedgrid.user-notifications.enabled=false
```

## Em relação a outras extensions

- **`realtime`:** se o host preenche `seedgrid.realtime.channels` (os canais que o token do Pulse permite), inclua `user-notifications`; vazio = sem restrição.
- **Migrations:** faixa V1400–V1499, `db/migration/user-notifications`, histórico `sg_flyway_schema_history_user_notifications`. Só mudança de estrutura; nunca edite migrations antigas.
- **ETag/304 (P129, 2026.11.03):** sem propriedade nova; é comportamento fixo das duas rotas de leitura (veja [[SeedGrid/Extensions/user-notifications/Visao-geral|Visão geral]], seção "Leituras condicionais"). **Ao subir de 2026.11.02 para 2026.11.03:** o padrão de `max-per-user` cai de 200 para 100; um host que dependia do 200 deve declarar `seedgrid.user-notifications.max-per-user=200`. Quem já tinha mais de 100 por usuário perde as mais antigas na próxima limpeza ou no próximo `notify`.
- **Audit (P136, 2026.11.02):** sem propriedade nova. Se o host tem a extension `audit` (`seedgrid-audit-postgresql` ou `seedgrid-audit-mongodb`), a criação e a exclusão de notificações passam a ir para a trilha; sem ela, nada muda. O `seedgrid-audit-core` é `provided`, então **não vem transitivo**: o host que quer a trilha adiciona o provider da `audit`. Ver [[SeedGrid/Extensions/user-notifications/Visao-geral|Visão geral]], seção Auditoria.
- **Security:** sem propriedade e sem permissão; as rotas pedem apenas usuário logado.
