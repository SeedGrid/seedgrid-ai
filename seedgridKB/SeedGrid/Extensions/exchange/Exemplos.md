---
tags: [seedgrid, extension, exchange, quarkus, exemplos]
fonte: java/seedgrid-quarkus-ext-exchange
branch: main
commit: 30f1fd6005
analisado-em: 2026-10-14
---

# Exchange (Quarkus): exemplos

Ver [[SeedGrid/Extensions/exchange/Visao-geral|Visão geral]] e [[SeedGrid/Extensions/exchange/Configuracao|Configuração]].

## 1. Dependência

Fonte: README.

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-exchange</artifactId>
    <version>2026.10.14</version>
</dependency>
```

Security e audit-core vêm do host. Nos tenancies, ligue também `seedgrid.exchange.migration.enabled=true`.

## 2. Cadastrar uma moeda com fonte PTAX

Fontes: `CurrencyUpsertRequest` e seed `V802__seed_currencies.sql`. Requer `CURRENCY_CREATE`.

```http
POST /admin/currencies
Content-Type: application/json

{
  "code": "USD-BRL",
  "name": "Dolar americano / Real",
  "sourceUrl": "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='{date-10d:MM-dd-yyyy}'&@dataFinalCotacao='{date:MM-dd-yyyy}'&$format=json&$orderby=dataHoraCotacao%20desc&$top=1",
  "fetchCron": "0 0 7 * * ?",
  "timeZone": "America/Sao_Paulo",
  "retryOffsetsHours": "4,5,3",
  "rateJsonPath": "value[0].cotacaoVenda",
  "quotedAtJsonPath": "value[0].dataHoraCotacao",
  "active": true
}
```

Os valores acima são os mesmos da seed V802. A seed também grava `history_url`, mas `CurrencyUpsertRequest` **não tem** esse campo: pela API REST não dá para definir `historyUrl`. **Confirmado** pela leitura do record.

- `code`, `name`, `sourceUrl` e `fetchCron` são obrigatórios (`@NotBlank`).
- No `PUT`, `retryOffsetsHours`, `rateJsonPath` e `quotedAtJsonPath` com `null` mantêm o valor gravado.

## 3. Consultar cotações

Fonte: `AdminCurrencyExchangeRateResource`, `AdminExchangeRateResource`.

```http
GET /admin/currency-exchange-rates?currencyCode=USD-BRL&from=2026-10-01&to=2026-10-14&page=0&size=30
GET /admin/currency-exchange-rates/series?currencyCode=USD-BRL&days=30
GET /admin/exchange-rate        # { "rate": ..., "updatedAt": ..., "source": ... } (última USD-BRL válida)
```

## 4. Corrigir manualmente ou reprocessar

Fonte: `ManualRateRequest(@NotNull @Positive BigDecimal rate)`. Requer `CURRENCY_RATE_UPDATE`.

```http
PUT  /admin/currency-exchange-rates/{publicId}
Content-Type: application/json

{ "rate": 5.4321 }

POST /admin/currency-exchange-rates/{publicId}/retry
```

## 5. Configuração (properties)

```properties
seedgrid.exchange.migration.enabled=true          # tenancies
#seedgrid.exchange.persistence-unit=master        # subdomain-tenancy já define
seedgrid.app.business-timezone=America/Sao_Paulo  # fuso dos avisos
```
