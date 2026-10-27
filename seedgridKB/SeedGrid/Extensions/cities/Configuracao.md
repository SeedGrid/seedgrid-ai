---
description: "Propriedades seedgrid.cities.* (módulo, unidade de persistência, REST autenticada e consulta pública com limites), padrões, variáveis de ambiente e configuração mínima da extension cities."
tags: [seedgrid, extension, cities, configuracao]
fonte: java/seedgrid-quarkus-ext-cities
branch: main
commit: bad4c48
analisado-em: 2026-10-27
---

# Cities: configuração

> **Status: NÃO PUBLICADO.** Versão de trabalho **2026.10.22**. Os padrões vêm do `microprofile-config.properties` e do `@ConfigMapping` `CitiesConfig` da extension.

## Propriedades

| Propriedade | Padrão | Comportamento |
|---|---|---|
| `seedgrid.cities.enabled` | `true` (env `SEEDGRID_CITIES_ENABLED`) | Liga/desliga o módulo: desligado = sem migrations e rotas 404. |
| `seedgrid.cities.persistence-unit` | unidade default | Unidade de persistência das tabelas `sg_*`. Vazio = default (`master` na subdomain-tenancy). |
| `seedgrid.cities.max-search-results` | `50` (env `SEEDGRID_CITIES_MAX_SEARCH_RESULTS`) | Teto de linhas da busca de cidades por nome. |
| `seedgrid.cities.rest.enabled` | `false` (env `SEEDGRID_CITIES_REST_ENABLED`) | Liga a REST autenticada (exige `CITY_READ`). Desligada: 404. |
| `seedgrid.cities.rest.prefix` | `/cities-api` (env `SEEDGRID_CITIES_REST_PREFIX`) | Prefixo das rotas, sem barra no fim. |
| `seedgrid.migrations.host-managed` | `false` | Definido pelas tenancy: o runner da extension não age, a tenancy migra cada banco. |
| `quarkus.hibernate-orm.validate-in-dev-mode` | `false` (definido pela extension) | A `cities` migra no `StartupEvent`, depois da validação do Hibernate. O host pode religar. |

## Consulta pública (`seedgrid.cities.public-rest.*`)

Para o formulário de cadastro sem login. **Desligada por padrão**; `seedgrid.cities.rest.enabled` **não** liga esta. Desligada, 404 até para quem tem `CITY_READ`.

| Propriedade | Padrão | Comportamento |
|---|---|---|
| `seedgrid.cities.public-rest.enabled` | `false` (env `SEEDGRID_CITIES_PUBLIC_REST_ENABLED`) | Liga `/public/cities` e `/public/cities/by-ibge-code/{código}` (rotas fixas, sem prefixo configurável). |
| `seedgrid.cities.public-rest.min-name-length` | `3` | Mínimo de caracteres do termo (depois de tirar acento e espaços). Abaixo disso, 400. |
| `seedgrid.cities.public-rest.max-results` | `20` | Teto de cidades por busca; **não há paginação** (`page`, `size` e `limit` são ignorados). |
| `seedgrid.cities.public-rest.rate-permits` / `.rate-window-seconds` | `30` / `60` | Pedidos por IP por janela. Estourou: 429 com `Retry-After`. |
| `seedgrid.cities.public-rest.global-permits` | `600` | Pedidos por janela somando todos os IPs (contra quem varia o IP). |
| `seedgrid.cities.public-rest.client-ip-header` | vazio | Cabeçalho com o IP real (ex.: `X-Forwarded-For`). Vazio = endereço da conexão, que não é forjável. |
| `seedgrid.cities.public-rest.cache-seconds` | `86400` | `Cache-Control: public, max-age`; também há `ETag` (304 com `If-None-Match`). |

Regras fixas, não configuráveis: UF obrigatória e válida (400); termo com no máximo 60 caracteres; `%`, `_` e a barra invertida digitados são escapados; o nome iniciado pelo termo vem primeiro; o corpo traz **só** `{id, name, uf, ibgeCode}`.

**Atrás de BFF ou proxy:** use `client-ip-header=X-Forwarded-For` somente se o proxy **sobrescreve** o cabeçalho e o backend não está exposto direto; senão o IP é forjável (o teto global limita o estrago). Os limites são **em memória, por nó**.

## Mínima

Nenhuma propriedade é obrigatória: colocou a dependência, ela migra. Para o formulário de cadastro ler as cidades, ligue `seedgrid.cities.public-rest.enabled=true`; para consulta autenticada, `seedgrid.cities.rest.enabled=true`.

Host que define `quarkus.hibernate-orm.packages` próprio acrescenta `br.com.seedgrid.cities.entities`.

## Nas tenancy

As tenancy migram a `cities` em cada banco (`seedgrid.migrations.host-managed=true`). **Não existe** o toggle `modules.cities.enabled`: como `Address.city` é obrigatório, a `cities` migra sempre.

- **login-tenancy:** o banco da aplicação recebe 5 países, 27 estados e 5.571 cidades, e a consulta de cidade do cadastro acha o município (`CitiesSeedHostManagedIT`).
- **subdomain-tenancy:** o master e cada banco de tenant recém-provisionado recebem o seed; os serviços da `cities` leem do master (`seedgrid.cities.persistence-unit=master`) (`CitiesSeedPerDatabaseIT`).
- **Sozinha** (sem tenancy): migra o datasource default (`CitiesMigrationIT`).

Os testes provam o banco que atendeu (`current_database()`), não só o status HTTP.

## Veja também

- [[SeedGrid/Extensions/cities/Visao-geral|Visão geral da cities]]
- [[SeedGrid/Extensions/cities/Exemplos|Exemplos da cities]]
- [[SeedGrid/Extensions/cities/Cidades-e-cidade-no-endereco|Cidades e a cidade no endereço]]
