---
tags: [seedgrid, extension, business-days, quarkus]
fonte: java/seedgrid-quarkus-ext-business-days
branch: (repositório ainda não criado)
commit: —
analisado-em: 2026-10-16
---

# Business days (Quarkus): visão geral

Calendário de dias úteis para hosts Quarkus: **feriados** (recorrentes ou de um ano específico), **semana de trabalho** (peso 0 / 0,5 / 1 por dia da semana) e cálculo de dias úteis (é dia útil?, contar, somar pesos, andar N dias úteis). Tabelas próprias (`business_day_*`), JPA puro (sem Panache).

- Configuração: [[SeedGrid/Extensions/business-days/Configuracao|Configuração do business-days]]
- Exemplos: [[SeedGrid/Extensions/business-days/Exemplos|Exemplos do business-days]]

## Módulos e coordenadas

| Módulo | Artefato |
|---|---|
| parent | `br.com.seedgrid:seedgrid-business-days-parent:2026.10.15` (parent `seedgrid-parent:2026.07.02`) |
| runtime | `br.com.seedgrid:seedgrid-business-days` |
| deployment | `br.com.seedgrid:seedgrid-business-days-deployment` |
| integration-tests | não publicado (Testcontainers Postgres) |

`seedgrid-security` é dependência **`provided`**: a extension funciona sozinha. Com a security no classpath o escopo é a **empresa corrente do token** (`SecurityBusinessDaysScopeProvider`, registrado pelo deployment só nesse caso); sem ela vale um calendário **global** (`GlobalBusinessDaysScopeProvider`). Para outro escopo, o host fornece a sua `BusinessDaysScopeProvider`.

## Modelo

- Dia útil = peso do dia da semana > 0 e não ser feriado (feriado zera o dia).
- Feriado com `year` nulo repete todo ano; com `year` vale só naquele ano.
- `company_id` nulo = feriado/perfil **global** (não é FK, a extension não depende da security). A empresa vê globais + os dela, mas só altera os dela.
- Perfil da semana: COMPANY > GLOBAL > DEFAULT (segunda a sexta).

## Anotações

_Fonte: código de `seedgrid-quarkus-ext-business-days` (versão local 2026.10.22, não publicada)._

Nenhuma.

## SPIs

Detalhes de cada SPI (assinaturas, o que o padrão faz, implementações reais e exemplos): [[SeedGrid/Extensions/business-days/SPIs|SPIs]].

_Fonte: código de `seedgrid-quarkus-ext-business-days` (versão local 2026.10.22, não publicada)._

| SPI | Pacote | Implementação padrão (`@DefaultBean`) | Para que serve |
|---|---|---|---|
| `BusinessDaysRegionProvider` | `br.com.seedgrid.businessdays.spis` | `GlobalBusinessDaysRegionProvider` | Diz de QUAL UF e' o calendario, para os feriados ESTADUAIS. |
| `BusinessDaysScopeProvider` | `br.com.seedgrid.businessdays.spis` | `GlobalBusinessDaysScopeProvider` | Diz de QUEM e' o calendario da requisicao corrente. |

**Como substituir:** declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`; a implementação padrão (`@DefaultBean`) cede. SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar.

```java
@ApplicationScoped
public class MeuBusinessDaysRegionProvider implements BusinessDaysRegionProvider {
    // implemente os métodos da interface
}
```

## Migrations

Faixa V1100–V1199, location `db/migration/business-days`, histórico `sg_flyway_schema_history_business_days`.

- **Sozinha no host**: colocou a dependência, ela migra o datasource default na subida (`BusinessDaysMigrationRunner`). Sem flag.
- **Com login-tenancy / subdomain-tenancy**: a tenancy migra (`seedgrid.migrations.host-managed=true` faz o runner não agir). login-tenancy: banco único. subdomain-tenancy: **master e cada tenant**, cada um com o seu calendário (a PU default aponta para o master no domínio do admin e para o tenant nos demais).
- Toggle: `seedgrid.business-days.enabled` (default `true`); nas tenancy vem de `modules.business-days.enabled`. Desligado = não migra e `/business-days/**` responde 404.

## API

`/business-days/holidays` (CRUD), `/business-days/week-profile` (GET/PUT/DELETE), `/business-days/calendar?year&month`, `/check?date`, `/count?from&to`, `/add?from&days`. Permissões `BUSINESS_DAY_READ/CREATE/UPDATE/DELETE` (sem audience, vinculadas ao ADMIN pela V1101).

## Front nos boilerplates

Menu **Dias úteis** (`/dias-uteis/*`): feriados (lista e edição), semana de trabalho e calendário; proxy em `app/api/business-days/[...path]`.
