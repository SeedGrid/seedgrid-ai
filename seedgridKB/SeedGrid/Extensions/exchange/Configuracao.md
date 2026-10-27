---
tags: [seedgrid, extension, exchange, quarkus, configuracao]
fonte: java/seedgrid-quarkus-ext-exchange
branch: main
commit: 30f1fd6005
analisado-em: 2026-10-14
---

# Exchange (Quarkus): configuração

Voltar para [[SeedGrid/Extensions/exchange/Visao-geral|Visão geral do exchange]] · [[SeedGrid/Extensions/exchange/Exemplos|Exemplos]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.exchange.*` e `seedgrid.app.business-timezone` (chave compartilhada) |
| Mecanismo | só `@ConfigProperty`. Não há `@ConfigMapping`, `@ConfigRoot` nem `microprofile-config.properties` no runtime. |
| Classes | `ExchangeEntityManager`, `ExchangeTimeZone` |
| Fase | runtime |
| Configuração em banco | tabela `sg_currencies`, uma linha por moeda. Fonte, cron, fuso, retry e caminhos JSON são **cadastro**, não propriedades (seção 2.2). |

Abreviação usada na coluna Origem: `rt/` = `java/seedgrid-quarkus-ext-exchange/runtime/src/main/java/br/com/seedgrid/exchange/`.

Variáveis de ambiente pela regra MP, sem ambiguidade:
- `seedgrid.exchange.persistence-unit` → `SEEDGRID_EXCHANGE_PERSISTENCE_UNIT`
- `seedgrid.app.business-timezone` → `SEEDGRID_APP_BUSINESS_TIMEZONE`

## 2. Propriedades

### 2.1 Propriedades lidas pela extension

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.exchange.persistence-unit` | Optional\<String\> | nome de PU; vazio ou `<default>` = PU default | — (PU default) | Não | Escolhe o `EntityManager` das tabelas `sg_currencies` e `sg_currency_exchange_rates`. | `ExchangeEntityManager` → `CurrencyEntityRepository`, `CurrencyExchangeRateEntityRepository` | O subdomain-tenancy define `master` (**Confirmado** no microprofile-config dele). As entidades `br.com.seedgrid.exchange.entities` devem estar mapeadas nessa PU. | runtime | `rt/repositories/ExchangeEntityManager.java` (construtor) |
| `seedgrid.app.business-timezone` | String (ZoneId) | `ZoneId` válido | `America/Sao_Paulo` | Não | Fuso usado para **apresentar** o horário do próximo retry nos avisos (`exchange.rate-fetch-failed`). Valor vazio ou inválido cai silenciosamente em `America/Sao_Paulo`, sem log. **Não** afeta o cron das moedas, que usa `currencies.time_zone`. | `ExchangeTimeZone#zoneId` → `CurrencyRateFetchService` | **Chave compartilhada**: declarada também em `seedgrid-quarkus-lib-commons` (`commons/core/time/BusinessTimeZone`). Ver [[SeedGrid/Extensions/commons/Configuracao|Configuração do commons]]. | runtime | `rt/config/ExchangeTimeZone.java` (construtor) |

### 2.2 Configuração em banco (`sg_currencies`, por moeda)

| Coluna | Default (entidade/DDL) | Efeito |
|---|---|---|
| `code` | — (único, ex.: `USD-BRL`) | Identifica a moeda. O job se chama `currency-rate-<code>`. |
| `source_url` | — (obrigatória) | URL da cotação do dia. Aceita `{date:FMT}` e `{date-Nd:FMT}`. |
| `fetch_cron` | — (obrigatória) | Cron Quartz do job da moeda. Se for inválido, o admin recebe erro ao salvar. |
| `time_zone` | `America/Sao_Paulo` | Fuso do cron e dos marcadores de data. |
| `retry_offsets_hours` | `4,5,3` | Horas entre tentativas após falha. Vazio desliga o retry. Entradas inválidas são ignoradas. |
| `rate_json_path` | — | Caminho do valor (ex.: `value[0].cotacaoVenda`). Vazio usa a convenção AwesomeAPI (`bid`). |
| `quoted_at_json_path` | — | Caminho da data/hora da cotação. |
| `history_url` | — | URL da série histórica (`{rangeStart:FMT}`, `{date:FMT}`). Vazio faz o gráfico usar só as coletas diárias. |
| `active` | `true` | Moeda inativa não é agendada nem buscada. |

Origem: `rt/entities/CurrencyEntity.java`, `rt/dtos/CurrencyUpsertRequest.java`, `runtime/src/main/resources/db/migration/exchange/V802__seed_currencies.sql`. A seed V802 cria `USD-BRL` com a fonte PTAX/BCB, `cotacaoVenda`, cron às 7h e fuso `America/Sao_Paulo`.

### 2.3 Toggle do módulo

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.exchange.enabled` | `true` | `false`: sem migrations, sem scheduler e as rotas `/admin/exchange-rate`, `/admin/currencies` e `/admin/currency-exchange-rates` respondem 404. Nas tenancy o default vem de `seedgrid.<tenancy>.modules.exchange.enabled`. |
| `seedgrid.migrations.host-managed` | `false` | `true` (definido pelas tenancy): o runner da extension não age; a tenancy migra cada banco. |

A extension **sempre migra** o datasource default na subida (`ExchangeMigrationRunner`, histórico `sg_flyway_schema_history_exchange`). Não existe mais `seedgrid.exchange.migration.enabled`.

## 3. Propriedades de frameworks

A extension não define nenhuma. Recomendações extraídas do `integration-tests` e do README:

| Propriedade | Recomendação |
|---|---|
| `quarkus.hibernate-orm.physical-naming-strategy` | `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy` |
| `quarkus.hibernate-orm.<pu>.packages` | Incluir `br.com.seedgrid.exchange.entities` na PU configurada (no subdomain-tenancy, só master). |
| `quarkus.scheduler.enabled` | Os testes usam `false` para controlar os disparos. Em produção, deixe ligado. |

## 4. Propriedades usadas só em testes

Arquivo `integration-tests/src/test/resources/application.properties`:
- `quarkus.devservices.enabled=false`
- naming strategy
- `quarkus.hibernate-orm.schema-management.strategy=none`
- `quarkus.scheduler.enabled=false`
- `quarkus.http.test-port=0`
- `app.build.version=test`: exigido pelo `StartupBannerLogger` do commons. No host, o valor vem do build.

## 5. Aliases, obsoletas e renomeações
Não encontradas. Atenção: `seedgrid.app.business-timezone` é diferente de `seedgrid.billing.business-timezone` (ver [[SeedGrid/Extensions/billing/Configuracao|Configuração do billing]]).

## 6. Configuração mínima
Nenhuma propriedade é obrigatória: colocou a extension, ela migra.

## 7. Configuração completa comentada

```properties
# PU das tabelas de câmbio. Sem valor ou <default> = PU default. subdomain-tenancy: master.
#seedgrid.exchange.persistence-unit=master

# Fuso de exibição do horário do próximo retry nos avisos (compartilhado com o commons).
# Default America/Sao_Paulo.
seedgrid.app.business-timezone=America/Sao_Paulo

# Liga/desliga o módulo (migrations, scheduler e rotas). Default true.
#seedgrid.exchange.enabled=true
```

## 8. Receitas

| Caso | Como |
|---|---|
| Produto sem câmbio | Não aplicar a faixa 8xx. A app sobe com WARN "Módulo de câmbio inativo". |
| Trocar a fonte de cotação | `PUT /admin/currencies/{id}` com novos `sourceUrl` e `rateJsonPath`. Reagenda sem deploy. |
| Mudar a grade de retry | `retryOffsetsHours: "2,2,4"`. Com `""`, o retry automático fica desligado. |
| Corrigir a cotação de um dia | `PUT /admin/currency-exchange-rates/{id}` com `{ "rate": 5.4321 }`, ou `POST .../{id}/retry`. |
| subdomain-tenancy | `seedgrid.exchange.persistence-unit=master` (já definido pela extension de tenancy). |

## 9. Dúvidas e lacunas
- O intervalo do drain (`every = "10m"`) e os timeouts HTTP (10s/15s) estão fixos em código.
- `history_url` não faz parte de `CurrencyUpsertRequest`: só a seed ou SQL direto definem esse valor.
- `ExchangeTimeZone` engole o fuso inválido sem log, ao contrário do `BusinessTimeZone` do billing, que registra WARN.
