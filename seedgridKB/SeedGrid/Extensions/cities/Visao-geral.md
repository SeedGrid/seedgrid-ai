---
description: "Visão geral da extension cities: países, estados e municípios do Brasil com código IBGE, semeados por migration, com API Java (BrazilGeo), REST opcional e consulta pública para formulários de cadastro; migrations, permissão, anotações e SPIs."
tags: [seedgrid, extension, cities, ibge, quarkus]
fonte: java/seedgrid-quarkus-ext-cities
branch: main
commit: 80d2593
analisado-em: 2026-10-27
---

# Cities (Quarkus): visão geral

> **Status: NÃO PUBLICADO.** Versão de trabalho **2026.10.22** (nunca publicada; sem compatibilidade com a 2026.10.0).

Países, estados e municípios do Brasil, com código IBGE, semeados por migration (5.571 municípios, 27 estados e 5 países; Fernando de Noronha, `2605459`, entra no `R__cities_seed.sql`). É dado de referência **somente leitura**: o host consulta, não altera. O endereço guarda a cidade por id (`Address.city`, no `commons`): veja [[SeedGrid/Extensions/cities/Cidades-e-cidade-no-endereco|Cidades e a cidade no endereço]].

- Configuração: [[SeedGrid/Extensions/cities/Configuracao|Configuração da cities]]
- Exemplos: [[SeedGrid/Extensions/cities/Exemplos|Exemplos da cities]]
- Cidade no endereço e migração do texto antigo: [[SeedGrid/Extensions/cities/Cidades-e-cidade-no-endereco|Cidades e a cidade no endereço]]

## Módulos e coordenadas

| Módulo | Artefato |
|---|---|
| parent | `br.com.seedgrid:seedgrid-cities-parent:2026.10.22` (parent `seedgrid-parent:2026.07.02`) |
| runtime | `br.com.seedgrid:seedgrid-cities` |
| deployment | `br.com.seedgrid:seedgrid-cities-deployment` |
| integration-tests | não publicado (Testcontainers Postgres) |

A `cities` **não** depende do `commons` nem de `BaseEntity`: é o `commons` que depende dela. Ela traz o `quarkus-security` (usa `@PermissionsAllowed`); torná-lo opcional é decisão do dono em aberto.

## Address e StateEnum (moram aqui)

> **Mudança de 2026-10-28 (BREAKING, sem retrocompatibilidade):** `Address` e `StateEnum` saíram do `commons` e vivem na `cities` (`br.com.seedgrid.cities.embeddables.Address` e `br.com.seedgrid.cities.enums.StateEnum`); `Contact` continua no `commons`. A dependência foi invertida: a `cities` depende do `commons`, e o `commons` não depende mais da `cities`. Quem usa `Address`/`StateEnum` precisa da `cities` no classpath (a `security` já a traz).

- `br.com.seedgrid.cities.embeddables.Address`: `@Embeddable` de endereço com `city` (`@ManyToOne City`), `cityName` legado e `state`. As colunas e as migrations não mudaram.
- `br.com.seedgrid.cities.enums.StateEnum`: as 27 UFs com `sigla`, `nome`, `regiao` e `ibge`.
- Os hosts enxergam o `Address` pelo Hibernate porque a `cities` é indexada pelo `CitiesProcessor`. O IT de host da `cities` precisa de `quarkus-hibernate-orm-panache` no classpath (o `commons` é indexado).
- As exceptions `GeoNotFoundException` (404) e `InvalidGeoArgumentException` (400) herdam `BusinessException` (mesmo `type`/`title` de antes); o `CitiesExceptionMappers` foi apagado.

## Modelo

- Entidades `Country`, `State` e `City` (pacote `br.com.seedgrid.cities.entities`, base `SgReferenceEntity`), nas tabelas `sg_countries`, `sg_states` e `sg_cities`. O nome JPA continua `GeoCountry`, `GeoState` e `GeoCity` (use esse nome em JPQL) para não colidir com entidades do host chamadas `City`, `State` ou `Country`.
- `State.id` é o código IBGE do estado; `City.id` é o id original do produto de cidades; o código IBGE do município está em `ibge_code`.
- `CityRefDTO { id, name, ibgeCode, uf }` é a referência compacta que security e login-tenancy devolvem em `city`.

## Anotações

_Fonte: código de `seedgrid-quarkus-ext-cities` (versão local 2026.10.22, não publicada)._

Nenhuma. A `cities` não define anotações próprias.

## SPIs

_Fonte: código de `seedgrid-quarkus-ext-cities` (versão local 2026.10.22, não publicada)._

Nenhuma. Não há pacote `spis`; o host usa a API concreta abaixo.

## API Java (o que o host injeta)

`BrazilGeo` (pacote `services`) é a fachada: `stateByUf`, `stateByIbgeCode`, `statesByRegion`, `citiesOf(uf)`, `cityByIbgeCode`, `cityById`, `capitalOf(uf)`, `searchByPrefix(texto, uf, limite)` e `searchContaining(texto, uf, limite)` (busca **sem acento**), `citiesByDdd`, `timezoneOf(ibgeCode)` (fuso IANA), `isValidUf` e `isValidCityIbgeCode`. Também há `CountriesService`, `StatesService` e `CitiesService`, que devolvem DTOs.

`CityLinker` (pacote `utils`) liga texto de cidade (e UF) já gravado numa tabela do host ao município: `CityLinker.link(connection, tabela, colunaId, colunaCidadeTexto, colunaUf, colunaCityId, "sg_cities")`. É reexecutável e não destrutivo; devolve um `Report` com candidatos, ligados e não casados (até 200 linhas listadas; o resto só na contagem). Homônimos entre estados ficam como não casados.

## REST

Duas superfícies, **ambas desligadas por padrão**:

- **Consulta autenticada** (`seedgrid.cities.rest.enabled=true`, prefixo `/cities-api`): `/countries`, `/countries/{id}`, `/countries/{id}/states`, `/countries/{id}/states/{stateId}/cities`, `/states`, `/states/by-uf/{uf}`, `/states/{id}`, `/states/{id}/cities`, `/cities`, `/cities/{id}`, `/cities/by-ibge-code/{código}`, `/regions` e `/regions/{região}/states`. Todas exigem a permissão `CITY_READ`; desligada, 404 antes da autenticação; sem token, 401.
- **Consulta pública** (`seedgrid.cities.public-rest.enabled=true`): só para o formulário de cadastro, sem login. `GET /public/cities?uf=SP&name=camp` e `GET /public/cities/by-ibge-code/{7 dígitos}`. Corpo mínimo `{id, name, uf, ibgeCode}`, UF obrigatória, termo de 3 a 60 caracteres, teto de 20 resultados sem paginação, limite por IP e limite global, cache de 1 dia com `ETag`. A base completa não sai por aqui. Detalhes em [[SeedGrid/Extensions/cities/Configuracao|Configuração]].

Erros no mesmo JSON do `ProblemDetails` do produto (`CitiesProblem`), sem depender do `commons`.

## Migrations

Faixa **V1200–V1299**, location `db/migration/cities`, histórico `sg_flyway_schema_history_cities`.

- `V1200__create_sg_tables.sql` cria as três tabelas; `R__cities_seed.sql` (**gerado** por `tools/gerar-seed.mjs`, não se edita à mão; correção de dado entra em `CORRECOES` do script) semeia países, estados e cidades (upsert por id, reexecutável); `R__cities_permissions.sql` semeia `CITY_READ` e a liga à role `ADMIN` (só quando as tabelas da security existem). **Compressão (2026-10-27):** as antigas `V1201` a `V1204` viraram esses dois `R__`; banco criado antes deve ser recriado.
- **Sozinha no host:** colocou a dependência, ela migra o datasource default na subida (`CitiesMigrationRunner`, `@Priority` 100 depois do `StartupEvent` das demais). Com `enabled=false`, com `seedgrid.migrations.host-managed=true` ou sem datasource default, o runner não age.
- **Com login-tenancy / subdomain-tenancy:** a tenancy migra (`host-managed=true`), cada banco com o seu dado.
- Para migrar por código: `CitiesMigrations.migrate(DataSource)` ou `migrate(DataSource, schema)`; `CitiesMigrations.seedPermissions(...)` semeia `CITY_READ` depois, se a security chegou tarde.
- Regra do host para o `quarkus.flyway.locations` (nunca o padrão `db/migration`): veja [[SeedGrid/Extensions/security/Configuracao|Configuração da security]].

## Permissões

`CITY_READ` (semeada no `R__cities_permissions.sql`, ligada à role `ADMIN`). Semear é melhor esforço: se a tabela `permissions` do host tiver colunas obrigatórias que a `cities` não conhece, ela pula com aviso e **não derruba** o boot.

## Armadilhas

- Host com `quarkus.hibernate-orm.packages` próprio precisa acrescentar `br.com.seedgrid.cities.entities`; sem isso o boot falha com "Association ... Company.address.city targets the type City which does not belong to the same persistence unit".
- Host com `quarkus.hibernate-orm.database.generation=drop-and-create` recebe as tabelas das entidades (as `unique` de `ibge_code`, `uf` e `code` estão declaradas nelas; sem isso o upsert do `R__cities_seed.sql` quebrava).
- Teste de host sem identidade real (ex.: ITs que carregam o `commons`) precisa de `quarkus-test-security` e `@TestSecurity(permissions = ...)`, porque a `cities` traz o `quarkus-security`.
- `quarkus.hibernate-orm.validate-in-dev-mode` vem `false`: a `cities` migra no `StartupEvent`, depois da validação do Hibernate.
- Ordenação por nome usa `collate "C"` (não depende da collation do banco).

## Crate Rust

O crate `seedgrid-rust-crate-cities` espelha a extension (mesma versão), entregue depois do Java por decisão do dono (exceção RS-06).
