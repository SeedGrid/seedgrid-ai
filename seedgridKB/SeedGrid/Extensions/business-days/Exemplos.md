---
tags: [seedgrid, extension, business-days, quarkus]
fonte: java/seedgrid-quarkus-ext-business-days
branch: (repositório ainda não criado)
commit: —
analisado-em: 2026-10-16
---

# Business days: exemplos

## Usar o cálculo em código

```java
@Inject BusinessDayService service;

boolean util = service.isBusinessDay(LocalDate.of(2026, 12, 25));
LocalDate vencimento = service.addBusinessDays(LocalDate.of(2026, 10, 1), 5);
```

`BusinessCalendar` (pacote `utils`) é imutável e sem CDI/JPA: dá para montá-lo e testar sem Quarkus.

## Cadastrar um feriado da empresa

`POST /business-days/holidays` com `{ "name": "Aniversário da cidade", "month": 3, "day": 19, "year": null, "active": true }`. Com `year` preenchido o feriado vale só naquele ano (ex.: ponte).

## Semana de trabalho

`PUT /business-days/week-profile` com os sete dias, peso `1`, `0.5` ou `0`. `DELETE` volta ao padrão herdado (global ou segunda a sexta).

## Host sem tenancy

Basta a dependência `br.com.seedgrid:seedgrid-business-days`; a extension migra o datasource default e expõe as rotas.


## Veja também

[[SeedGrid/Extensions/business-days/Visao-geral|Visão geral]] · [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]] · [[SeedGrid/Extensions/Indice|Índice das extensions]]
