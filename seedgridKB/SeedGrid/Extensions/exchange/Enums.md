---
tags: [seedgrid, extension, exchange, quarkus, enum]
fonte: java/seedgrid-quarkus-ext-exchange
branch: main
commit: 30f1fd6005
analisado-em: 2026-10-14
---

# Exchange (Quarkus): enums

Voltar para [[SeedGrid/Extensions/exchange/Visao-geral|Visão geral]] · [[SeedGrid/Extensions/exchange/Configuracao|Configuração]].

| Enum | Arquivo | Usado em | Público? |
|---|---|---|---|
| `CurrencyExchangeRateStatus` | `runtime/src/main/java/br/com/seedgrid/exchange/entities/CurrencyExchangeRateStatus.java` | coluna `sg_currency_exchange_rates.status`; respostas de `/admin/currency-exchange-rates` | sim |

## CurrencyExchangeRateStatus
FQN `br.com.seedgrid.exchange.entities.CurrencyExchangeRateStatus`. Sem campos nem métodos. Persistido com `@Enumerated(EnumType.STRING)` em `status varchar(16) not null` (V800), **sem CHECK constraint**. Não é tipo de propriedade de configuração. No JSON aparece pelo nome da constante (sem `@JsonValue`).

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `SUCCESS` | Cotação obtida da fonte. | `CurrencyRateFetchService` grava ao aplicar uma busca bem-sucedida. A importação de histórico (`insertImportedIfMissing`) também insere com `SUCCESS`. | Confirmado. |
| `FAILED` | Busca falhou. | Gravado em falha, com `errorMessage`, `attemptCount` incrementado e `next_retry_at` pela grade `retryOffsetsHours` da moeda. Elegível ao retry automático e manual. | Confirmado. |
| `MANUAL` | Valor digitado pelo admin. | `PUT /admin/currency-exchange-rates/{id}`. | Confirmado. |

A cotação "mais recente válida" (`latestGoodFor`, usada por `/admin/exchange-rate`) **não filtra por status**: seleciona a linha de maior `reference_date` com `rate` não nulo. Como `FAILED` não tem `rate`, fica de fora, e `MANUAL` conta. **Confirmado** em `CurrencyExchangeRateEntityRepository#latestGoodFor`.

## Internos
Nenhum.
