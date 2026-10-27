---
description: "Exemplos de uso da cities: consultar municípios por UF, código IBGE e nome sem acento, ligar texto de cidade ao município com CityLinker, ligar a consulta pública no cadastro e migrar por código."
tags: [seedgrid, extension, cities, exemplos]
fonte: java/seedgrid-quarkus-ext-cities
branch: main
commit: bad4c48
analisado-em: 2026-10-27
---

# Cities: exemplos

> **Status: NÃO PUBLICADO.** Versão de trabalho **2026.10.22**. Os nomes de classes e métodos vêm do código da extension.

## Consultar municípios em código

```java
@Inject BrazilGeo geo;

Optional<CityDto> campinas = geo.cityByIbgeCode("3509502");
List<CityDto> doEstado = geo.citiesOf("SP");
List<CityDto> busca = geo.searchByPrefix("sao jo", "SP", 10);   // sem acento
Optional<CityDto> capital = geo.capitalOf("PE");
boolean ok = geo.isValidUf("SP") && geo.isValidCityIbgeCode("3509502");
```

A busca ignora acento e caixa: `searchByPrefix("sao jo", ...)` encontra "São José".

## Guardar a cidade do endereço

`Address.city` é um `@ManyToOne` para a `City` (ver [[SeedGrid/Extensions/cities/Cidades-e-cidade-no-endereco|Cidades e a cidade no endereço]]):

```java
address.setCity(cityEntity);
```

Em JPQL use o nome JPA `GeoCity`: `select c from GeoCity c where c.ibgeCode = :code`.

## Ligar o texto antigo ao município

```java
try (Connection connection = dataSource.getConnection()) {
    CityLinker.Report report = CityLinker.link(
            connection, "clients", "id", "city_text", "uf", "city_id", "sg_cities");
    log.infof("ligados=%d, sem par=%d", report.linked(), report.unmatchedCount());
}
```

É reexecutável e não destrutivo; homônimos entre estados e nomes sem par ficam em `report.unmatched()` (até 200 linhas) para revisão.

## Cadastro com a consulta pública

No backend do host:

```properties
seedgrid.cities.public-rest.enabled=true
seedgrid.cities.public-rest.client-ip-header=X-Forwarded-For
```

No formulário (sem login):

```text
GET /public/cities?uf=SP&name=camp
GET /public/cities/by-ibge-code/3509502
```

A resposta traz sempre só `id`, `name`, `uf` e `ibgeCode`; o formulário envia o `id` como `address.cityId`. Se a consulta falhar, o formulário cai no texto (o `cityId` é opcional). Use `X-Forwarded-For` só se o proxy sobrescreve o cabeçalho.

## Consulta autenticada

```properties
seedgrid.cities.rest.enabled=true
```

```text
GET /cities-api/states/by-uf/SP
GET /cities-api/cities?name=Campinas&stateId=35&page=0&size=20
```

Exige o token com a permissão `CITY_READ` (semeada na role `ADMIN`).

## Migrar por código (host com vários bancos)

```java
CitiesMigrations.migrate(dataSource);              // schema padrão da conexão
CitiesMigrations.migrate(dataSource, "tenant_a");  // schema específico
```

Com `seedgrid.migrations.host-managed=true` o runner da extension não age e o host chama isso em cada banco.

## Back falso (Mockoon) para o front

Quem faz o front sem subir o back usa o Mockoon: o `seedgrid-cities-example` traz o serviço `mockoon` (perfil `mock`, porta `3100`) no `infra/compose.yml` dos exemplos, servindo as 13 rotas de `/cities-api` com dados de amostra:

```text
podman compose --profile mock up -d mockoon
GET http://localhost:3100/cities-api/states
```

O mock vive no host: a fonte é `mocks/cities.mockoon.json` no repositório de exemplos. A extension não mantém mock (existe uma cópia antiga lá, sem manutenção) e não há sincronização automática. Sem o perfil `mock`, o compose sobe os mesmos serviços de antes.

## Veja também

- [[SeedGrid/Extensions/cities/Visao-geral|Visão geral da cities]]
- [[SeedGrid/Extensions/cities/Configuracao|Configuração da cities]]
