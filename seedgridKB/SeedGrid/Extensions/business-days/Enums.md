---
tags: [seedgrid, extension, business-days, enum]
fonte: java/seedgrid-quarkus-ext-business-days
branch: main
commit: eb23a73
analisado-em: 2026-11-11
---

# Business days (Quarkus): enums

Voltar: [[SeedGrid/Extensions/business-days/Visao-geral|Visão geral do business-days]] · [[SeedGrid/Extensions/business-days/Configuracao|Configuração]] · [[SeedGrid/Extensions/business-days/Calendario-em-camadas|Calendário em camadas]]

Caminho base: `runtime/src/main/java/br/com/seedgrid/businessdays/`.

## Índice

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| [[#HolidaySource]] | `br.com.seedgrid.businessdays.utils.HolidaySource` (`utils/HolidaySource.java`) | origem do feriado de um dia | Sim |
| [[#MovableHoliday]] | `br.com.seedgrid.businessdays.utils.MovableHoliday` (`utils/MovableHoliday.java`) | feriados móveis calculados a partir da Páscoa | Sim |
| [[#MovableHolidayService.Origin]] | `br.com.seedgrid.businessdays.services.MovableHolidayService.Origin` (`services/MovableHolidayService.java`) | `Effective.origin` | Sim |
| [[#WeekProfileService.Source]] | `br.com.seedgrid.businessdays.services.WeekProfileService.Source` (`services/WeekProfileService.java`) | `ResolvedProfile.source` | Sim |

## HolidaySource

De onde vem o feriado de um dia. Ordem de resolução, do mais específico ao mais geral: a primeira regra que casar vale.

| Valor | Significado |
|---|---|
| `COMPANY` | Feriado cadastrado pela empresa. |
| `TENANT` | Feriado cadastrado no tenant (sem empresa). |
| `STATE` | Estadual semeado, da UF da empresa. |
| `NATIONAL` | Nacional fixo semeado. |
| `MOVABLE` | Móvel calculado (Carnaval, Sexta-feira Santa, Corpus Christi). |

## MovableHoliday

Feriados móveis: dependem da Páscoa, então são calculados em código. O SeedGrid os trata como feriado por padrão e o tenant ou a empresa pode desmarcar cada um (tabela `sg_business_day_movable_settings`). Cada constante tem nome exibido, dias a partir da Páscoa e base legal (construtor com 3 argumentos).

| Valor | Nome exibido | Dias a partir da Páscoa | Base legal (texto do código) |
|---|---|---|---|
| `CARNIVAL` | Carnaval | -47 (terça-feira de Carnaval) | Sem lei federal; costume nacional, padrão do SeedGrid |
| `GOOD_FRIDAY` | Sexta-feira Santa | -2 | Lei 9.093/1995, art. 2º (feriado religioso por lei municipal); padrão nacional no SeedGrid |
| `CORPUS_CHRISTI` | Corpus Christi | 60 | Lei 9.093/1995, art. 2º (feriado religioso por lei local); padrão nacional no SeedGrid |

Métodos: `displayName()`, `legalBasis()`, `date(int year)` e o estático `easter(int year)` (algoritmo de Meeus/Jones/Butcher).

## MovableHolidayService.Origin

De onde veio o valor efetivo de um feriado móvel.

| Valor | Significado |
|---|---|
| `COMPANY` | Ajuste da empresa. |
| `TENANT` | Ajuste do tenant. |
| `DEFAULT` | Padrão do SeedGrid (nenhum ajuste gravado). |

## WeekProfileService.Source

De onde veio o perfil de pesos da semana (`ResolvedProfile`).

| Valor | Significado |
|---|---|
| `COMPANY` | Perfil da empresa. |
| `GLOBAL` | Perfil global. |
| `DEFAULT` | Perfil padrão. |
