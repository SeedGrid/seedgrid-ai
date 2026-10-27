---
tags: [seedgrid, extension, ai-pricing, quarkus, configuracao]
fonte: java/seedgrid-quarkus-ext-ai-pricing
branch: main
commit: 0608ca66b5
analisado-em: 2026-10-14
---

# AI Pricing (Quarkus): configuração

Voltar para [[SeedGrid/Extensions/ai-pricing/Visao-geral|Visão geral do ai-pricing]] · [[SeedGrid/Extensions/ai-pricing/Exemplos|Exemplos]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.ai-pricing.*` e `seedgrid.app.ai-pricing.*` (**dois prefixos**, por herança do produto de origem) |
| Mecanismo | só `@ConfigProperty`. Não há `@ConfigMapping`, `@ConfigRoot` nem `microprofile-config.properties` no runtime. |
| Classes | `AiPricingEntityManager`, `AiPricingScheduler`, `AiPricingCheckService` |
| Fase | runtime (todas) |
| Configuração em banco | `sg_ai_pricing_config` (`enabled`, `cron`, `source_url`), editável em `PUT /admin/ai/price-approvals/config`. **Não são propriedades**: ver a seção 2.2. |

Abreviação usada na coluna Origem: `rt/` = `java/seedgrid-quarkus-ext-ai-pricing/runtime/src/main/java/br/com/seedgrid/aipricing/`.

Variáveis de ambiente pela regra MP, sem ambiguidade:
- `seedgrid.ai-pricing.persistence-unit` → `SEEDGRID_AI_PRICING_PERSISTENCE_UNIT`
- `seedgrid.app.ai-pricing.timezone` → `SEEDGRID_APP_AI_PRICING_TIMEZONE`
- `seedgrid.app.ai-pricing.source-url` → `SEEDGRID_APP_AI_PRICING_SOURCE_URL`

## 2. Propriedades próprias

### 2.1 Propriedades

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.ai-pricing.persistence-unit` | Optional\<String\> | nome de PU; vazio ou `<default>` = PU default | — (PU default) | Não | Escolhe o `EntityManager` de todas as tabelas do ai-pricing (repositories). | `AiPricingEntityManager` → `Ai*Repository` | O subdomain-tenancy define `master` no microprofile-config dele (**Confirmado**). As entidades `br.com.seedgrid.aipricing.entities` devem estar mapeadas na mesma PU. | runtime | `rt/repositories/AiPricingEntityManager.java` (construtor) |
| `seedgrid.app.ai-pricing.timezone` | String (ZoneId) | `ZoneId` válido | `America/Sao_Paulo` | Não | Fuso em que o cron do robô (vindo do banco) é interpretado. **Inferência:** um fuso inválido faz o `schedule()` lançar exceção. No startup isso vira WARN; no `PUT config`, vira erro ao admin ("Expressão de cron inválida", mensagem enganosa). | `AiPricingScheduler#applySchedule` | Trabalha com `sg_ai_pricing_config.cron`. | runtime | `rt/schedulers/AiPricingScheduler.java` (campo `timeZone`) |
| `seedgrid.app.ai-pricing.source-url` | String (URL) | URL HTTP(S) da página de preços | `https://developers.openai.com/api/docs/pricing` | Não | URL usada **só** quando `sg_ai_pricing_config.source_url` está nula ou vazia. O banco é a fonte de verdade. | `AiPricingCheckService#resolveSourceUrl` | Sobreposta por `sg_ai_pricing_config.source_url`. | runtime | `rt/services/AiPricingCheckService.java` (campo `defaultSourceUrl`) |

### 2.2 Configuração em banco (`sg_ai_pricing_config`, linha única)

| Campo | Default na entidade | Seed V902 | Edição | Efeito |
|---|---|---|---|---|
| `enabled` | `false` (boolean Java) | `true` | `PUT /admin/ai/price-approvals/config` `{enabled}` | Com `false` (ou cron vazio), o job não é agendado. |
| `cron` | `0 0 6 * * ?` | `0 0 6 * * ?` | `{cron}` | Cron Quartz do robô. Se for inválido, faz rollback e retorna erro ao admin. |
| `source_url` | `https://openai.com/api/pricing` | `https://developers.openai.com/api/docs/pricing` | `{sourceUrl}` | Página lida pelo robô. |

Origem: `rt/entities/AiPricingConfigEntity.java`, `runtime/src/main/resources/db/migration/ai-pricing/V902__seed_ai_models_and_pricing_config.sql`, `rt/controllers/AdminAiPriceApprovalResource#saveConfig`.

### 2.3 Toggle do módulo

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.ai-pricing.enabled` | `true` | `false`: sem migrations, sem robô e as rotas `/admin/ai/**` respondem 404. Nas tenancy o default vem de `seedgrid.<tenancy>.modules.ai-pricing.enabled`. |
| `seedgrid.migrations.host-managed` | `false` | `true` (definido pelas tenancy): o runner da extension não age; a tenancy migra cada banco. |

A extension **sempre migra** o datasource default na subida (`AiPricingMigrationRunner`, histórico `sg_flyway_schema_history_ai_pricing`). Não existe mais `seedgrid.ai-pricing.migration.enabled`.

## 3. Propriedades de frameworks

A extension não define nenhuma propriedade de framework: não há `microprofile-config.properties` no runtime. As recomendações abaixo saem do `integration-tests` e do README.

| Propriedade | Recomendação |
|---|---|
| `quarkus.hibernate-orm.physical-naming-strategy` | `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy` (as entidades são camelCase e as colunas snake_case). |
| `quarkus.hibernate-orm.<pu>.packages` | Mapear `br.com.seedgrid.aipricing.entities` na PU configurada. No subdomain-tenancy, só em master (README). |

## 4. Propriedades usadas só em testes

Arquivo `integration-tests/src/test/resources/application.properties`:
- `quarkus.devservices.enabled=false`
- naming strategy
- `quarkus.hibernate-orm.schema-management.strategy=none`
- `quarkus.scheduler.enabled=false`
- `quarkus.http.test-port=0`

Sem Flyway nativo: a própria extension migra. O `ModuloDesligadoTest` usa `seedgrid.ai-pricing.enabled=false` via `QuarkusTestProfile`.

## 5. Aliases, obsoletas e renomeações
Não encontradas. O prefixo duplo (`seedgrid.ai-pricing` contra `seedgrid.app.ai-pricing`) é uma inconsistência, não um alias.

## 6. Configuração mínima
Nenhuma propriedade é obrigatória: colocou a extension, ela migra.

O robô só funciona com um bean `AiPriceExtractor` do host (ver [[SeedGrid/Extensions/ai-pricing/Exemplos|Exemplos]]).

## 7. Configuração completa comentada

```properties
# PU das tabelas do ai-pricing. Sem valor ou <default> = PU default. subdomain-tenancy: master.
#seedgrid.ai-pricing.persistence-unit=master

# Fuso do cron do robô (o cron vem de sg_ai_pricing_config). Default America/Sao_Paulo.
seedgrid.app.ai-pricing.timezone=America/Sao_Paulo

# URL usada apenas se sg_ai_pricing_config.source_url estiver vazia.
# Default https://developers.openai.com/api/docs/pricing
#seedgrid.app.ai-pricing.source-url=https://<pagina-de-precos>

# Liga/desliga o módulo (migrations, robô e rotas). Default true.
#seedgrid.ai-pricing.enabled=true
```

## 8. Receitas

| Caso | Como |
|---|---|
| Produto sem IA (padrão) | Nada a configurar. Sem migration, a app sobe com WARN, e o robô retorna `SKIPPED`. |
| Ligar o robô | Aplicar as migrations, implementar `AiPriceExtractor` e deixar `enabled=true` em `sg_ai_pricing_config` (o seed já liga). |
| Mudar horário ou fonte | `PUT /admin/ai/price-approvals/config` com `{ "cron": "0 0 5 * * ?", "sourceUrl": "https://..." }`. Reagenda na hora. |
| Fuso diferente | `seedgrid.app.ai-pricing.timezone=UTC` |
| subdomain-tenancy | `seedgrid.ai-pricing.persistence-unit=master` (já default da extension de tenancy) |

## 9. Dúvidas e lacunas
- O default da URL de origem diverge: a entidade usa `https://openai.com/api/pricing`, enquanto a propriedade e o seed V902 usam `https://developers.openai.com/api/docs/pricing`. Uma linha criada via `PUT config` sem linha prévia herda o valor da entidade.
- O default `enabled=false` da entidade, somado ao seed `true`, significa que, se a linha for criada pelo `PUT` antes do seed, o robô nasce desligado.
- O fuso inválido gera uma mensagem de "cron inválido" (**Inferência**).
