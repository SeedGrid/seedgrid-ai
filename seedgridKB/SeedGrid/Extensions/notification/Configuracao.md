---
tags: [seedgrid, extension, notification, configuracao]
fonte: java/seedgrid-quarkus-ext-notification
branch: main
commit: b989a6248a
analisado-em: 2026-10-14
---

# Notification (Quarkus) — configuração

Voltar: [[SeedGrid/Extensions/notification/Visao-geral|Visão geral do notification]] · [[SeedGrid/Extensions/notification/Exemplos|Exemplos]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.notification` |
| Classe de config | `java/seedgrid-quarkus-ext-notification/runtime/src/main/java/br/com/seedgrid/notification/config/NotificationConfig.java` → `NotificationConfig` |
| Mecanismo | SmallRye `@ConfigMapping(prefix = "seedgrid.notification")` (sem `ConfigMappingBuildItem` no processor; descoberto pelo índice Jandex do runtime) + expressão `${seedgrid.notification.poll-interval:10s}` em `@Scheduled` |
| Fase | Runtime |
| Validação | `NotificationStartup#initialize` (StartupEvent, `@Priority(APPLICATION + 1)`) lança `IllegalArgumentException("Configuracao seedgrid.notification invalida")` se: `scope` em branco ou > 120 caracteres; `max-attempts` fora de 1–20; `batch-size` fora de 1–1000; `lease` ≤ 0; `retry-delay` ≤ 0. A aplicação **não sobe**. |

Variáveis de ambiente: a regra MicroProfile se aplica sem ambiguidade (ex.: `SEEDGRID_NOTIFICATION_MAX_ATTEMPTS`). Não há env lida diretamente no código.

## 2. Propriedades da extension

### Ativação e escopo

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.notification.enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: o subscriber ignora eventos (não cria marcador nem entregas — mas código de evento desconhecido ainda lança erro, pois `catalog.require` vem antes) e o dispatcher não envia. Startup/migrations continuam rodando. | Pausar publicação e envio | Sobrepõe `dispatch-enabled` | Runtime | Decl.: `NotificationConfig#enabled()`. Consumo: `NotificationSubscriber#observe`, `NotificationDispatcher#drain` |
| `seedgrid.notification.dispatch-enabled` | `boolean` | `true`/`false` | `true` | Não | `false`: só o worker para; eventos continuam sendo enfileirados (fila preservada). | Pausar só o envio | Só vale com `enabled=true` | Runtime | Decl.: `NotificationConfig#dispatchEnabled()`. Consumo: `NotificationDispatcher#drain` |
| `seedgrid.notification.scope` | `String` | não vazio, ≤ 120 caracteres | `platform` | Não | Namespace fixo da instalação: separa regras, deduplicação, histórico e workers de instalações que compartilham o banco. Nunca vem do navegador. **Não** é company/tenant. | Isolamento entre instalações | Mudar o valor "esconde" regras e histórico gravados com o scope anterior (Inferência: todas as consultas filtram por scope) | Runtime | Decl.: `NotificationConfig#scope()`. Consumo: `NotificationRules`, `NotificationSubscriber`, `NotificationQueue`, `NotificationResource#deliveries`, validação em `NotificationStartup` |
| `seedgrid.notification.datasource-name` | `Optional<String>` | nome de datasource Agroal existente | — | Não | Se informado (após `trim`), as migrations usam esse datasource; se não resolver, o startup falha com `IllegalStateException`. Ausente: usa o datasource `master` se existir, senão o default. | Escolher onde rodar as migrations da notification | **Não** muda a persistence unit das entidades, que é decidida no build (`master` se houver datasource com esse nome, senão `<default>`) — ver `NotificationProcessor#registerEntities` (Inferência sobre o risco de inconsistência) | Runtime | Decl.: `NotificationConfig#datasourceName()`. Consumo: `NotificationStartup#resolveDataSource` |

### Worker / entrega

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.notification.poll-interval` | `String` (expressão `every` do Quarkus Scheduler) | duração do scheduler (`10s`, `PT10S`...) | `10s` | Não | Intervalo do `NotificationDispatcher#drain` (`concurrentExecution = SKIP`). | Frequência do worker | Cada execução processa até `batch-size` claims | Runtime (resolvido pelo scheduler na subida) | Decl./consumo: `NotificationDispatcher#drain` — `@Scheduled(every = "${seedgrid.notification.poll-interval:10s}")`. Não está em `NotificationConfig`. |
| `seedgrid.notification.batch-size` | `int` | 1–1000 | `20` | Não | Máximo de claims por execução do worker. | Vazão | — | Runtime | Decl.: `NotificationConfig#batchSize()`. Consumo: `NotificationDispatcher#drain`; validação em `NotificationStartup` |
| `seedgrid.notification.max-attempts` | `int` | 1–20 | `5` | Não | Tentativas por entrega; ao atingir, status `FAILED` (`ATTEMPTS_EXHAUSTED` no claim ou `TRANSPORT_FAILED` na última falha). | Limite de retry | Com `retry-delay` define a janela total de retry | Runtime | Decl.: `NotificationConfig#maxAttempts()`. Consumo: `NotificationQueue#claim`, `#complete` |
| `seedgrid.notification.retry-delay` | `Duration` | > 0 | `PT30S` | Não | Base do backoff exponencial: próxima tentativa = agora + `retry-delay × 2^min(tentativas-1, 10)`. | Espaçamento entre tentativas | — | Runtime | Decl.: `NotificationConfig#retryDelay()`. Consumo: `NotificationQueue#complete` |
| `seedgrid.notification.lease` | `Duration` | > 0 | `PT5M` | Não | Prazo de posse de uma entrega em `SENDING`; depois dele outro worker pode retomá-la. | Recuperação após queda do worker | Deve exceder o timeout máximo do transporte (SMTP/WhatsApp) com margem, senão há risco de envio duplicado (`docs/ARCHITECTURE.md`) | Runtime | Decl.: `NotificationConfig#lease()`. Consumo: `NotificationQueue#claim` |

Total: **9 propriedades públicas** (8 em `NotificationConfig` + `poll-interval`).

## 3. Propriedades de frameworks/bibliotecas usadas pela extension

| Propriedade | Por quê | Fonte |
|---|---|---|
| `quarkus.mailer.security.*` (`from`, `host`, `port`, `mock`, `timeout`, `start-tls`, credenciais/TLS) | O transporte de e-mail injeta `@MailerName("security") Mailer`. Produção precisa de `mock=false` e timeouts finitos. | `NotificationTransport`; README; `docs/ARCHITECTURE.md` |
| `seedgrid.whatsapp.api` e a configuração do provider (URL/credencial) | Envio WhatsApp via `WhatsAppApi` da extensão WhatsApp; a instância (`whatsappChannelId`) vem da regra. Ver [[SeedGrid/Extensions/whatsapp/Configuracao|configuração do whatsapp]]. | README; `integration-tests/.../application.properties` |
| `quarkus.datasource.*` / `quarkus.datasource."master".*` | Datasource das migrations e da PU (`master` preferido). | `NotificationStartup`, `NotificationProcessor` |
| `quarkus.scheduler.*` | O worker é um `@Scheduled`; nos ITs `quarkus.scheduler.start-mode=halted`. | `NotificationDispatcher` |

A extension não registra defaults de framework (sem `microprofile-config.properties`).

## 4. Propriedades usadas só em testes

`integration-tests/src/main/resources/application.properties` e `NotificationContainers`:

| Propriedade | Valor/observação |
|---|---|
| `quarkus.datasource.db-kind` | `postgresql` |
| `quarkus.datasource.devservices.enabled` | `false` (containers próprios) |
| `quarkus.hibernate-orm.schema-management.strategy` | `none` |
| `quarkus.mailer.security.from` / `.mock` / `.start-tls` / `.timeout` | `notification@example.invalid`, `false`, `DISABLED`, `5S` |
| `quarkus.mailer.security.host` / `.port` | injetados pelo `NotificationContainers` (MailHog) |
| `quarkus.datasource.jdbc.url` / `.username` / `.password` | injetados pelo `NotificationContainers` |
| `quarkus.scheduler.start-mode` | `halted` |
| `quarkus.http.test-port` | `0` |
| `seedgrid.notification.scope` | `notification-it` |
| `seedgrid.notification.max-attempts` | `2` |
| `seedgrid.whatsapp.api` | `evolution` |
| 🔒 `seedgrid.whatsapp.evolution.api-key` | `<SEGREDO:evolution-api-key>` (valor local de teste não copiado) |
| `quarkus.rest-client.evolution.url` / `.connect-timeout` / `.read-timeout` | URL do servidor simulado; `2000` / `2000` |
| `test.mail.url` | lida por `@ConfigProperty` em `NotificationIT` (URL do MailHog) |

## 5. Aliases, obsoletas, renomeações

- Nenhum alias. O CHANGELOG `2026.10.13` registra que a escolha da persistence unit passou a ser feita no build "sem chave de configuração que possa divergir".
- A migration antiga `V950` foi substituída por `V1000` antes da adoção (README).

## 6. Configuração mínima

Nada em `seedgrid.notification.*` é obrigatório. É preciso configurar o transporte:

```properties
quarkus.mailer.security.from=<REMETENTE>
quarkus.mailer.security.host=<SMTP-HOST>
quarkus.mailer.security.port=<SMTP-PORTA>
quarkus.mailer.security.mock=false
# WhatsApp (opcional): ver configuração do seedgrid-whatsapp
seedgrid.whatsapp.api=<evolution|...>
```

## 7. Configuração completa comentada

```properties
# Namespace fixo da instalação (padrão: platform; não vazio, até 120 caracteres)
seedgrid.notification.scope=platform
# Liga enfileiramento e envio (padrão: true)
seedgrid.notification.enabled=true
# Liga só o worker de envio (padrão: true)
seedgrid.notification.dispatch-enabled=true
# Datasource das migrations (padrão: master se existir, senão o default)
#seedgrid.notification.datasource-name=master
# Intervalo do worker (padrão: 10s)
seedgrid.notification.poll-interval=10s
# Claims por execução (padrão: 20; 1-1000)
seedgrid.notification.batch-size=20
# Tentativas por entrega (padrão: 5; 1-20)
seedgrid.notification.max-attempts=5
# Base do backoff exponencial (padrão: PT30S; > 0)
seedgrid.notification.retry-delay=PT30S
# Posse de uma entrega pelo worker (padrão: PT5M; > 0; maior que o timeout do transporte)
seedgrid.notification.lease=PT5M

# Transporte de e-mail (mailer nomeado do security)
quarkus.mailer.security.from=<REMETENTE>
quarkus.mailer.security.host=<SMTP-HOST>
quarkus.mailer.security.port=<SMTP-PORTA>
quarkus.mailer.security.username=<USUARIO-SMTP>
quarkus.mailer.security.password=<SEGREDO:smtp-password>
quarkus.mailer.security.mock=false
quarkus.mailer.security.timeout=30S
```

## 8. Receitas

- **Manutenção do SMTP sem perder avisos**: `seedgrid.notification.dispatch-enabled=false` — a fila cresce; ao religar, o worker drena.
- **Desligar notificações totalmente**: `seedgrid.notification.enabled=false` (eventos publicados nesse período não são enfileirados).
- **Duas instalações no mesmo banco**: um `scope` distinto em cada uma.
- **Transporte lento**: aumente `lease` acima do timeout do transporte; ajuste `retry-delay`/`max-attempts` (com padrão 5 tentativas e 30 s, as esperas são 30 s, 60 s, 120 s, 240 s).
- **Host multi-datasource (subdomain-tenancy)**: a extension usa o datasource `master` automaticamente; `datasource-name` só se precisar de outro para as migrations.

## 9. Dúvidas e lacunas

- `poll-interval` aceita o formato de `every` do Quarkus Scheduler; se valores como `off`/`disabled` desligam o worker depende da versão do Quarkus (Não confirmado neste repositório).
- Possível inconsistência entre `datasource-name` (migrations) e a PU escolhida no build (entidades) — Inferência, não testada.
