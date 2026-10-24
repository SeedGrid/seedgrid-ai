---
description: "Como usar países, estados e cidades (com código IBGE) no produto e guardar a cidade do endereço como id de município (Address.city é @ManyToOne para a cities), em perguntas e respostas: dependência, pacotes do Hibernate, API de empresa e cadastro (cityId), migração do texto antigo, REST e armadilhas (2026.10.22, não publicado)."
tags: [seedgrid, extension, cities, endereco, ibge, commons, security, host, perguntas-e-respostas]
analisado-em: 2026-10-24
---

# Cidades e a cidade no endereço

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-cities`, `seedgrid-commons`, `seedgrid-security`, `seedgrid-business-days`, `seedgrid-login-tenancy` e `seedgrid-subdomain-tenancy` na versão de trabalho **2026.10.22**, sem compatibilidade com a 2026.10.0. Fonte: insumos do time de plataforma, que informou testes verdes (Postgres real). Conferi no código só os códigos de erro e as propriedades da REST; o resto está em "Não verificado". Veja também [[SeedGrid/Extensions/business-days/Calendario-em-camadas|Calendário em camadas]] e [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]].

## O que a extension `cities` entrega?

Países, estados e municípios do Brasil com código IBGE (5.571 municípios, incluindo Fernando de Noronha, `2605459`), semeados por migration. Entidades `Country`, `State` e `City` no pacote `br.com.seedgrid.cities.entities`, em tabelas **`sg_countries`, `sg_states`, `sg_cities`**.

- Elas **não** estendem `BaseEntity` e a `cities` **não** depende do `commons`; é o `commons` que depende dela.
- O nome JPA continua `GeoCountry`, `GeoState`, `GeoCity`, para não colidir com entidades do seu host chamadas `City`, `State` ou `Country`. Em JPQL use `select c from GeoCity c`.
- `CityRefDTO { id, name, ibgeCode, uf }` é a referência compacta que as APIs devolvem em `city`.

## Como adiciono ao produto?

- Dependência: `br.com.seedgrid:seedgrid-cities:2026.10.22`; vem transitiva pelo `seedgrid-commons` e pelo `security`.
- **Host que define `quarkus.hibernate-orm.packages` próprio** (ou `.master.packages`) precisa acrescentar `br.com.seedgrid.cities.entities`. Sem isso o boot falha com "Association ... Company.address.city targets the type City which does not belong to the same persistence unit".
- **Extension nova** cujo runtime depende do `commons` precisa do `seedgrid-cities-deployment` no próprio `deployment`.
- Multi-banco: a `cities` migra em cada banco (as tenancies já fazem); `seedgrid.cities.persistence-unit` escolhe a unidade dos serviços (`master` no subdomain-tenancy).
- `quarkus.hibernate-orm.validate-in-dev-mode=false` é o padrão, porque a `cities` migra no `StartupEvent`, depois da validação do Hibernate.

## Como o endereço guarda a cidade?

`Address` (embeddable do `commons`) tem `city` como `@ManyToOne City` (EAGER). `cityName` é o texto **legado** (coluna `addr_city`) e `state` (UF) continua.

- `Address.setCity(city)` **deriva** a UF e o nome: a cidade manda, e texto e UF ficam coerentes para o calendário e para integrações que leem texto. `setCity(null)` mantém texto e UF.
- No `Builder`, `city(String)` virou `cityName(String)`; `city(City)` define a cidade.
- Cada dono do embeddable mapeia a coluna da FK com `@AssociationOverride(name = "city", joinColumns = @JoinColumn(name = "addr_city_id"), ...)` e `@AttributeOverride(name = "cityName", ...)`. Tabelas: `companies.addr_city_id` (security), `signup_request.addr_city_id` (login-tenancy) e `tenants.addr_city_id` (subdomain-tenancy, no master). A FK aponta para `sg_cities.id`.

## O que mudou nas APIs?

| Rota | Campo | Regra |
|---|---|---|
| `POST/PATCH /companies` | `cityId` (opcional) | Com `cityId`, `addrState`/`addrCity` enviados são ignorados. `cityId` inexistente: **400 `CITY_NOT_FOUND`**. No PATCH, `addrCity` em texto **sem** `cityId` desfaz a ligação. A resposta traz `city {id, name, ibgeCode, uf}` (nulo se só há texto) e mantém `addrCity`/`addrState`. |
| `POST /public/signup` (empresa) | `address.cityId` (opcional) | `address.city` e `address.state` só são exigidos sem `cityId`; senão **400 `ADDRESS_CITY_REQUIRED`**. |
| `POST /public/signup/personal` | `cityId` (opcional) | Endereço só com a cidade; PF sem endereço segue válida. |
| `POST /public/tenants` | `address.cityId` (opcional) | O tenant guarda a cidade no master e a empresa do tenant grava `addr_city_id` (o id é o mesmo em todos os bancos: seed determinístico). |

No código, o bean `CityLookupService` (security) tem `requireById(id)` e `findByIbgeCode(ibge)`.

**Calendário:** o provedor de região do `business-days` lê a UF da **cidade** do endereço; sem cidade usa o estado em texto; sem endereço, só feriados nacionais e móveis.

## E a REST de consulta de cidades?

Opcional e **desligada por padrão**: exige `seedgrid.cities.enabled=true` (padrão) e `seedgrid.cities.rest.enabled=true` (prefixo `/cities-api`; ligada nos boilerplates). Exemplos: `GET /cities-api/cities/by-ibge-code/{code}` e `/cities?name=...&stateId=...`. O `id` devolvido é o `cityId` aceito pelas APIs acima. Exige a permissão `CITY_READ` (role `ADMIN`).

> **Pendência conhecida:** a REST exige token, então o formulário de cadastro **público** ainda não consegue consultá-la. O time dos fronts está verificando; não prometa seletor de cidade no cadastro público.

## Como migro os dados que já tenho em texto?

- **Orquestradores (login-tenancy e subdomain-tenancy):** migram a `cities` como primeiro passo (master e cada banco de tenant), depois a security (a FK é criada porque `sg_cities` já existe), semeiam `CITY_READ` e ligam o texto existente aos municípios.
- **Host com Flyway nativo (security sozinha):** o Flyway do host roda a migration de empresas antes da `cities` (sem FK); a `cities` migra no `StartupEvent` e a `CompanyCityStartup` cria a FK e liga o texto. Desligável com `seedgrid.migrations.host-managed=true`; quem desliga chama `CompanyCityMigration.apply(ds)` por banco.
- **Ligação do texto:** o `CityLinker` casa `addr_city` + `addr_state` com o nome do município sem acento nem caixa. Sem UF, só casa se o nome existir em **uma única** UF; "Cidade - SP" é entendido. É reexecutável e não destrutivo (o texto fica); os não casados voltam num `Report` (até 200 linhas) e no log (WARN) para revisão manual.
- **Bancos de desenvolvimento** que rodaram a V1200 antiga (tabelas `geo_*`): recrie, porque o checksum do Flyway diverge.

## Armadilhas

- **O seed de `CITY_READ` é de melhor esforço.** Se a tabela `permissions` do host tem outras colunas `NOT NULL` sem default que a `cities` não conhece (por exemplo, gerada por entidade), ele pula com aviso e **não derruba o boot**; a permissão fica sem semear.
- **A `cities` traz o `quarkus-security`** (usa `@PermissionsAllowed`) para todo host que usa o `commons`. O que era anotação inerte num host sem security passa a valer: teste de host sem identidade real precisa de `quarkus-test-security` e `@TestSecurity(permissions = ...)`. Tornar essa dependência opcional é **decisão do dono, em aberto**.
- Host com `database.generation=drop-and-create` funciona: as entidades declaram as `unique` da migration (`ibge_code`, `uf`, `code`).
- O prefixo `sg_` segue a regra de tabelas de extension (a `cities` e a `notification` são as únicas que já a cumprem; as demais ainda não, em plano próprio).

## Não verificado

- O código e os testes (98 da `cities`, mais os de empresa, cadastro e tenant): vêm dos insumos do time de plataforma.
- A consulta de cidade no cadastro público (pendência acima).
- Versões ainda não publicadas no Maven Central: produto gerado só compila onde as extensions estão instaladas localmente.
