---
tags: [seedgrid, extension, cities, enum]
fonte: java/seedgrid-quarkus-ext-cities
branch: main
commit: 2fbadd7
analisado-em: 2026-11-11
---

# Cities (Quarkus): enums

Voltar: [[SeedGrid/Extensions/cities/Visao-geral|Visão geral da cities]] · [[SeedGrid/Extensions/cities/Configuracao|Configuração]]

## Índice

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| [[#StateEnum.Regiao]] | `br.com.seedgrid.cities.enums.StateEnum.Regiao` (`runtime/src/main/java/br/com/seedgrid/cities/enums/StateEnum.java`) | campo `regiao` de cada `StateEnum` | Sim |
| [[#CitiesService.SearchMode]] | `br.com.seedgrid.cities.services.CitiesService.SearchMode` (`runtime/src/main/java/br/com/seedgrid/cities/services/CitiesService.java`) | modo da busca de cidades por nome | Sim |

## StateEnum.Regiao

Região do país de cada UF (enum aninhado em `StateEnum`, sem campos próprios).

| Valor | Significado |
|---|---|
| `NORTE` | Região Norte |
| `NORDESTE` | Região Nordeste |
| `CENTRO_OESTE` | Região Centro-Oeste |
| `SUDESTE` | Região Sudeste |
| `SUL` | Região Sul |

## CitiesService.SearchMode

Como casar o nome na busca.

| Valor | Significado |
|---|---|
| `PREFIX` | O nome começa com o texto. |
| `CONTAINS` | O nome contém o texto. |
