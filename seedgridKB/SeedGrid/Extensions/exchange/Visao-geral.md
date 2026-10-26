---
tags: [seedgrid, extension, exchange, quarkus]
fonte: java/seedgrid-quarkus-ext-exchange
branch: main
commit: 30f1fd6005
analisado-em: 2026-10-14
---

# Exchange (Quarkus): visão geral

Câmbio para hosts Quarkus. Mantém moedas e cotações diárias, com histórico e série para gráfico. As fontes de cotação são configuráveis por cadastro (URL com marcadores de data e caminho JSON do valor). Há retry automático (grade de horas por moeda) e manual. A seed padrão é USD-BRL via PTAX do Banco Central. Não há crate Rust equivalente.

- Configuração: [[SeedGrid/Extensions/exchange/Configuracao|Configuração do exchange]]
- Exemplos: [[SeedGrid/Extensions/exchange/Exemplos|Exemplos do exchange]]
- Enums: [[SeedGrid/Extensions/exchange/Enums|Enums do exchange]]

## Módulos e coordenadas

| Módulo | Artefato |
|---|---|
| parent | `br.com.seedgrid:seedgrid-exchange-parent:2026.10.16` (parent `seedgrid-parent:2026.07.02`) |
| runtime | `br.com.seedgrid:seedgrid-exchange` |
| deployment | `br.com.seedgrid:seedgrid-exchange-deployment` |
| integration-tests | não publicado |

A feature Quarkus é `seedgrid-exchange` (`SeedgridExchangeProcessor`). O processor registra services, scheduler, resources e `NoOpExchangeAuditSink` como *unremovable*.

> Usa Java 21 e Quarkus **3.30.6**: o `pom.xml` do módulo sobrescreve `quarkus.platform.version` (o `seedgrid-parent` usa 3.30.8). O `runtime/src/main/resources/META-INF/quarkus-extension.properties` declara `deployment-artifact=...:1.0.0-SNAPSHOT` como valor fixo. **Confirmado** nos arquivos.

### Dependências
- SeedGrid: `seedgrid-commons` 2026.10.08, `seedgrid-security` 2026.10.09, `seedgrid-audit-core` 2026.09.25 e `seedgrid-notification-api`.
- Quarkus: `arc`, `rest-jackson`, `hibernate-orm` (JPA puro), `scheduler`, `security` e `hibernate-validator`.

## Arquitetura

```mermaid
flowchart LR
    BOOT[StartupEvent] --> SCH[CurrencyRateScheduler]
    SCH -->|1 job por moeda ativa: cron + fuso da linha| FETCH[CurrencyRateFetchService.fetchToday]
    SCH -->|every 10m| DRAIN[drainPendingRetries]
    DRAIN --> FETCH
    FETCH -->|HttpClient, URL resolvida| SRC((fonte: PTAX/AwesomeAPI...))
    FETCH --> DB[(sg_currency_exchange_rates)]
    FETCH -. exchange.rate-fetch-failed .-> NOTIF[notification-api]
```

### Scheduler

Componente: `CurrencyRateScheduler`.

- Cria **um job por moeda ativa** (`currency-rate-<code>`), com `fetch_cron` e `time_zone` da própria linha em `sg_currencies`.
- No startup, para cada moeda ativa sem cotação do dia, dispara a busca na hora.
- Se a tabela não existir, registra WARN e sai sem derrubar o boot (`ModuloDesligadoTest`).
- `@Scheduled(every = "10m")` drena os retries vencidos. O estado do retry fica no banco (`next_retry_at`).
- Retry vencido de um dia anterior é descartado, nunca gravado com a cotação de hoje.
- Ao criar, editar, renomear ou excluir uma moeda, o job é reagendado sem restart.

### Resolução da fonte

Componente: `CurrencySourceResolver`.

- Marcadores aceitos na URL: `{date:FMT}`, `{date-Nd:FMT}` e `{rangeStart:FMT}`.
- O caminho JSON do valor segue o formato `value[0].cotacaoVenda`.
- Com o caminho vazio, vale a convenção AwesomeAPI: campo `bid` do único objeto raiz.

### Busca HTTP

Componente: `CurrencyRateFetchService`. Usa connect timeout de 10s e request de 15s.

## APIs públicas

### SPI
| SPI | Default | Assinatura |
|---|---|---|
| `ExchangeAuditSink` | `NoOpExchangeAuditSink` | `record(String actionType, String targetType, String targetId, String summary, Map<String,Object> details)`. O README o chama de legado: a auditoria é feita via `@SgAudit`. |

### Endpoints REST (`RestControllerPath`)
Todos os resources são `@SgMonoCompany @Authenticated`.

| Método | Caminho | Permissão |
|---|---|---|
| GET | `/admin/currencies` | `CURRENCY_READ` |
| GET | `/admin/currencies/{id}` | `CURRENCY_READ` |
| POST | `/admin/currencies` | `CURRENCY_CREATE` |
| PUT | `/admin/currencies/{id}` | `CURRENCY_UPDATE` |
| DELETE | `/admin/currencies/{id}` | `CURRENCY_DELETE` |
| GET | `/admin/currency-exchange-rates?currencyCode&from&to&page=0&size=30` | `CURRENCY_RATE_READ` |
| GET | `/admin/currency-exchange-rates/series?currencyCode&days=30` | `CURRENCY_RATE_READ` |
| POST | `/admin/currency-exchange-rates/{id}/retry` | `CURRENCY_RATE_UPDATE` |
| PUT | `/admin/currency-exchange-rates/{id}` (`{rate}`, edição manual) | `CURRENCY_RATE_UPDATE` |
| GET | `/admin/exchange-rate` (última USD-BRL válida: `rate`, `updatedAt`, `source`) | só autenticado |

Os `{id}` são `publicId`. **Confirmado** nos resources.

### Evento de notificação
`exchange.rate-fetch-failed` (`ExchangeNotificationCatalog`), publicado após o commit da tentativa. O evento inclui a variável `reason`, com o horário do próximo retry no fuso `seedgrid.app.business-timezone`.

## Anotações

_Fonte: código de `seedgrid-quarkus-ext-exchange` (versão local 2026.10.22, não publicada)._

Nenhuma.

## SPIs

_Fonte: código de `seedgrid-quarkus-ext-exchange` (versão local 2026.10.22, não publicada)._

| SPI | Pacote | Implementação padrão (`@DefaultBean`) | Para que serve |
|---|---|---|---|
| `ExchangeAuditSink` | `br.com.seedgrid.exchange.spis` | `NoOpExchangeAuditSink` | Registra acao administrativa sobre cambio: cotacao lancada a mao, moeda criada, editada ou removida. |

**Como substituir:** declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`; a implementação padrão (`@DefaultBean`) cede. SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar.

```java
@ApplicationScoped
public class MeuExchangeAuditSink implements ExchangeAuditSink {
    // implemente os métodos da interface
}
```

## Migrations
`db/migration/exchange`, de **V800 a V804**. Histórico em `flyway_schema_history_exchange`.

| Versão | Conteúdo |
|---|---|
| V800 | tabelas |
| V801 | permissões `CURRENCY_*`, audience `platform`, vinculadas a `ADMIN` |
| V802 | seed USD-BRL: PTAX, cron às 7h, São Paulo |
| V803 | histórico PTAX sem `$select` |
| V804 | `sg_currency_exchange_rates.active` |

A extension migra sozinha o datasource default na subida (sem flag). Nas tenancy, quem migra é a tenancy (master do subdomain-tenancy; banco único do login-tenancy), com o toggle `modules.exchange.enabled` (default `true`).

## Testes (não executados)
- `runtime/src/test`: `CurrencyRateNotificationTest`, `CurrencySourceResolverTest` e `ExchangeNotificationCatalogTest`.
- `integration-tests`: `ExchangePermissionMigrationTest`, `ExchangeSchemaAndPersistenceTest`, `ModuloDesligadoTest`, `CurrencyRateSchedulerTest`, `CurrencyRateFetchServiceTest` e `CurrencyRateHistoryTest`. Usam a migration de teste `V899__test_remove_moeda_semeada`.

## Limitações
- `/admin/exchange-rate` é um atalho fixo para `USD-BRL`.
- O drain de retry é fixo em 10 minutos, sem propriedade para mudar.
- O fuso padrão `America/Sao_Paulo` está repetido em código: em `ExchangeTimeZone`, como default do `applySchedule` e como default da coluna.
