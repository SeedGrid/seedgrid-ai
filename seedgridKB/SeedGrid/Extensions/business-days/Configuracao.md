---
tags: [seedgrid, extension, business-days, quarkus]
fonte: java/seedgrid-quarkus-ext-business-days
branch: (repositório ainda não criado)
commit: —
analisado-em: 2026-10-16
---

# Business days: configuração

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.business-days.enabled` | `true` (env `SEEDGRID_BUSINESS_DAYS_ENABLED`) | Liga/desliga o módulo: desligado = sem migrations e rotas 404 (e fora do OpenAPI). |
| `seedgrid.business-days.persistence-unit` | PU default | PU das tabelas. Vazio ou `<default>` = default. |
| `seedgrid.business-days.max-range-days` | `36600` (env `SEEDGRID_BUSINESS_DAYS_MAX_RANGE_DAYS`) | Teto de dias nas consultas de intervalo. |
| `seedgrid.migrations.host-managed` | `false` | Definido pelas tenancy: o runner da extension não age, a tenancy migra cada banco. |

Mapear `br.com.seedgrid.businessdays.entities` na PU configurada (no subdomain-tenancy, na PU default; sem `packages` explícito o Quarkus já indexa).

## Nas tenancy

| Host | Toggle | Onde migra |
|---|---|---|
| login-tenancy | `seedgrid.login-tenancy.modules.business-days.enabled` (default `true`) | banco único, depois do security |
| subdomain-tenancy | `seedgrid.subdomain-tenancy.modules.business-days.enabled` (default `true`) | master e cada tenant. Tenants já `READY`: mudar `migration.target-version` para aplicar o schema novo |

Host que mantém calendário próprio (ex.: seedgrid-report) desliga: `seedgrid.login-tenancy.modules.business-days.enabled=false`.

## Mínima

Nenhuma propriedade é obrigatória: colocou a extension, ela migra.


## Veja também

[[SeedGrid/Extensions/business-days/Visao-geral|Visão geral]] · [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]] · [[SeedGrid/Extensions/Indice|Índice das extensions]]
