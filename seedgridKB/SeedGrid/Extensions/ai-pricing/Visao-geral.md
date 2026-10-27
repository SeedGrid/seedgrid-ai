---
tags: [seedgrid, extension, ai-pricing, quarkus]
fonte: java/seedgrid-quarkus-ext-ai-pricing
branch: main
commit: 0608ca66b5
analisado-em: 2026-10-14
---

# AI Pricing (Quarkus): visão geral

Mantém o catálogo de modelos de LLM e o histórico de preços por 1M de tokens (input, cached input e output). Um robô agendado lê a página de preços do provedor e propõe mudanças. As mudanças só entram em vigor depois de **aprovação humana**. Não há crate Rust equivalente.

- Configuração: [[SeedGrid/Extensions/ai-pricing/Configuracao|Configuração do ai-pricing]]
- Exemplos: [[SeedGrid/Extensions/ai-pricing/Exemplos|Exemplos do ai-pricing]]
- Enums: [[SeedGrid/Extensions/ai-pricing/Enums|Enums do ai-pricing]]

## Módulos e coordenadas

| Módulo | Artefato |
|---|---|
| parent | `br.com.seedgrid:seedgrid-ai-pricing-parent:2026.10.16` (parent `seedgrid-parent:2026.07.02`) |
| runtime | `br.com.seedgrid:seedgrid-ai-pricing` |
| deployment | `br.com.seedgrid:seedgrid-ai-pricing-deployment` |
| integration-tests | não publicado |

A feature Quarkus é `seedgrid-ai-pricing` (`SeedgridAiPricingProcessor`). O processor registra como *unremovable* os services, o scheduler, os resources e os SPIs default.

> Usa Java 21 e Quarkus **3.30.6**: o `pom.xml` do módulo sobrescreve `quarkus.platform.version` (o `seedgrid-parent` usa 3.30.8). O `runtime/src/main/resources/META-INF/quarkus-extension.properties` declara `deployment-artifact=...:1.0.0-SNAPSHOT`, valor fixo e não `${project.version}`. **Confirmado** nos arquivos; o impacto do valor fixo não foi verificado.

### Dependências
- SeedGrid: `seedgrid-commons` 2026.10.08 (`BaseEntity`, `BusinessException`), `seedgrid-security` 2026.10.08 (`@PermissionsAllowed`, `@SgMonoCompany`), `seedgrid-audit-core` 2026.09.25 (`@SgAudit`) e `seedgrid-notification-api`.
- Quarkus: `arc`, `rest-jackson`, `hibernate-orm` (JPA puro, sem Panache), `scheduler`, `security` e `hibernate-validator`.
- O motor `seedgrid-notification` é opcional no runtime e só entra como dependência de teste.

## Arquitetura

```mermaid
flowchart LR
    SCH[AiPricingScheduler<br/>cron vindo do banco] --> CHK[AiPricingCheckService.runCheck]
    ADM[POST /admin/ai/price-approvals/check] --> CHK
    CHK -->|HttpClient GET| PAGE((página de preços))
    CHK -->|regex determinística, senão| EXT{{AiPriceExtractor SPI}}
    CHK --> PEND[(sg_ai_model_prices_to_approve)]
    CHK -. ai-pricing.approval-pending / check-failed .-> NOTIF[notification-api]
    APR[approve/reject] --> PRICES[(sg_ai_model_prices)]
```

- `AiPricingScheduler` agenda o job `ai-pricing-daily-check` pela API programática do `Scheduler`. Usa `enabled` e `cron` da tabela `sg_ai_pricing_config` e o fuso de `seedgrid.app.ai-pricing.timezone`. Reagenda ao salvar a config, sem restart. Se a tabela não existir no startup, registra um WARN e não derruba o boot (`ModuloDesligadoTest`).
- `AiPricingCheckService#runCheck`:
  - Sem extrator configurado, retorna `SKIPPED`.
  - Com proposta pendente, também retorna `SKIPPED`.
  - Caso contrário, baixa a página (connect timeout de 20s, request de 30s) e tenta uma extração determinística por regex. Para página não estruturada, delega ao `AiPriceExtractor` com retry (backoff de 1,5s e 3s).
  - Compara só os modelos **ativos** do catálogo e cria a proposta pendente.
  - Erros também viram uma linha pendente, e o evento é publicado.
- O prompt do extrator está no classpath em `/ai-pricing/prompts/pricing-extract.md`.

## APIs públicas

### SPIs

Detalhes de cada SPI (assinaturas, o que o padrão faz, implementações reais e exemplos): [[SeedGrid/Extensions/ai-pricing/SPIs|SPIs]].

_Fonte: código de `seedgrid-quarkus-ext-ai-pricing` (versão local 2026.10.22, não publicada)._

| SPI | Pacote | Implementação padrão (`@DefaultBean`) | Para que serve |
|---|---|---|---|
| `AiPriceExtractor` | `br.com.seedgrid.aipricing.spis` | `NoOpAiPriceExtractor` | Seam entre o robo de precos e um LLM. |
| `AiPricingAuditSink` | `br.com.seedgrid.aipricing.spis` | `NoOpAiPricingAuditSink` | Registra acao administrativa sobre precos: modelo criado/editado/removido, preco aprovado ou rejeitado. |

**Como substituir:** declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`; a implementação padrão (`@DefaultBean`) cede. SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar.

```java
@ApplicationScoped
public class MeuAiPriceExtractor implements AiPriceExtractor {
    // implemente os métodos da interface
}
```

**Detalhes já documentados:**

| SPI | Default | Assinatura |
|---|---|---|
| `AiPriceExtractor` | `NoOpAiPriceExtractor` (`@DefaultBean`, `isConfigured()=false`) | `String extract(String pricingPageContent) throws Exception`; `boolean isConfigured()` |
| `AiPricingAuditSink` | `NoOpAiPricingAuditSink` | `record(String actionType, String targetType, String targetId, String summary, Map<String,Object> details)`. O README o chama de legado: a auditoria é feita via `@SgAudit`. |

### Endpoints REST (`RestControllerPath`)
Todos os resources são `@SgMonoCompany`.

| Método | Caminho | Permissão |
|---|---|---|
| GET | `/admin/ai/models` | `AI_MODEL_READ` |
| POST | `/admin/ai/models` | `AI_MODEL_CREATE` |
| PUT/DELETE | `/admin/ai/models/{publicId}` | `AI_MODEL_UPDATE` / `AI_MODEL_DELETE` |
| GET | `/admin/ai/models/{publicId}/prices` | `AI_MODEL_READ` |
| POST | `/admin/ai/models/{publicId}/prices` | `AI_MODEL_PRICE_CREATE` |
| GET | `/admin/ai/price-approvals` | `AI_PRICE_APPROVE` |
| GET/PUT | `/admin/ai/price-approvals/config` | `AI_PRICE_APPROVE` |
| POST | `/admin/ai/price-approvals/{id}/approve`, `/{id}/reject` | `AI_PRICE_APPROVE` |
| POST | `/admin/ai/price-approvals/check` | `AI_PRICE_APPROVE` |

**Confirmado** (`AdminModelResource`, `AdminAiPriceApprovalResource`). As respostas de `/admin/ai/models` incluem `currentPriceValidFrom` (README).

### Eventos de notificação
Declarados em `AiPricingNotificationCatalog`:
- `ai-pricing.approval-pending`, com variáveis `proposalId` e `quantity`.
- `ai-pricing.check-failed`, com variáveis `proposalId` e `failureKind`.

## Anotações

_Fonte: código de `seedgrid-quarkus-ext-ai-pricing` (versão local 2026.10.22, não publicada)._

Nenhuma.

## Migrations
`db/migration/ai-pricing`, de **V900 a V903**. Histórico em `sg_flyway_schema_history_ai_pricing`.

| Versão | Conteúdo |
|---|---|
| V900 | tabelas `sg_ai_models`, `sg_ai_model_prices`, `sg_ai_model_prices_to_approve`, `sg_ai_pricing_config` |
| V901 | permissões `AI_MODEL_READ/CREATE/UPDATE/DELETE`, `AI_MODEL_PRICE_CREATE` e `AI_PRICE_APPROVE` (audience `platform`, vinculadas a `ADMIN`) |
| V902 | seed de modelos OpenAI (`gpt-4.1-nano`, `gpt-4.1-mini`, `gpt-5.1`) e da config do robô (ligado, cron `0 0 6 * * ?`, `source_url` = página de preços da OpenAI) |
| V903 | coluna `active` |

A extension migra sozinha o datasource default na subida (sem flag). Nas tenancy, quem migra é a tenancy (master do subdomain-tenancy; banco único do login-tenancy), com o toggle `modules.ai-pricing.enabled` (default `true`). Ver [[SeedGrid/Extensions/ai-pricing/Configuracao|Configuração]].

## Testes (não executados)
- `runtime/src/test`:
  - `AiPricingRobotTest`: robô com extrator falso.
  - `AiPricingRulesTest`.
  - `AiPricingAuditContractTest`.
  - `AiPricingNotificationCatalogTest`.
- `integration-tests` (PostgreSQL via Testcontainers):
  - `AiPricingNotificationTest`.
  - `AiPricingPermissionMigrationTest`.
  - `ModuloDesligadoTest`: app sobe sem as tabelas.
  - `PersistedChangesTest`.
  - `PriceApprovalGateTest`.

## Limitações
- Sem um bean `AiPriceExtractor`, o robô fica inerte e só retorna `SKIPPED`. Esse é o estado normal de um produto sem IA.
- Com proposta ou erro pendente, novas checagens são puladas até o admin agir.
