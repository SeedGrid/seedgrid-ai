---
tags: [seedgrid, library, commons]
fonte: java/seedgrid-quarkus-lib-commons
branch: main
commit: fa49c344db
analisado-em: 2026-10-14
---

# SeedGrid Commons — Visão geral

> [!info] Library, não extension Quarkus
> `seedgrid-quarkus-lib-commons` é uma **library Java** (um único jar com índice Jandex), **não** uma extension Quarkus com `runtime`/`deployment`. Não há `@ConfigRoot`, build steps nem processors. Documentada nesta estrutura por uniformidade. Não existe porte Rust desta lib.

Configuração: [[SeedGrid/Extensions/commons/Configuracao|Configuração do commons]] · Enums: [[SeedGrid/Extensions/commons/Enums|Enums do commons]] · Exemplos: [[SeedGrid/Extensions/commons/Exemplos|Exemplos do commons]]

## Objetivo

Biblioteca compartilhada pelo ecossistema SeedGrid com utilitários, validadores Bean Validation, entidades JPA base com auditoria de usuário, SPIs de tenant/usuário/contato, evento CDI de aviso ao usuário, filtro CORS e mapeamento global de exceções em Problem Details (`application/problem+json`). **Confirmado** (`README.md`, código).

## Coordenadas e dependências

| Item | Valor |
|---|---|
| groupId:artifactId | `br.com.seedgrid:seedgrid-commons` |
| Versão (pom) | `2026.10.08` |
| Parent | `br.com.seedgrid:seedgrid-parent:2026.07.02`; importa `quarkus-bom` 3.30.8 |
| Packaging | `jar` (com `jandex-maven-plugin`) |
| Dependências Quarkus | `quarkus-arc`, `quarkus-hibernate-orm`, `quarkus-hibernate-orm-panache`, `quarkus-hibernate-validator`, `quarkus-rest-jackson` (**optional**) |
| Dependência SeedGrid | `br.com.seedgrid:seedgrid-privacy:2026.07.27` — ver [[SeedGrid/Extensions/privacy/Visao-geral|Visão geral do privacy]] |
| Outras | Lombok (provided) |

Fonte: `java/seedgrid-quarkus-lib-commons/pom.xml`. **Confirmado.**

## Componentes e APIs públicas

### Core (`br.com.seedgrid.commons.core`)

| Símbolo | Tipo | Resumo |
|---|---|---|
| `time.BusinessTimeZone` | bean `@ApplicationScoped` | `zoneId()`; lê `seedgrid.app.business-timezone` (padrão `America/Sao_Paulo`) |
| `startup.StartupBannerLogger` | bean `@ApplicationScoped`, observa `StartupEvent` | imprime `banner.txt` (do classpath do host) e `app.build.version` em `System.out` |
| `utils.UUIDv7` | utilitário | `UUID generate()` (time-ordered) |
| `utils.HashUtils` | utilitário | `sha256Hex(String)` |
| `utils.JsonAttributeLimits` / `JsonAttributeLimitsSpec` | utilitário + record | `findViolation(Map<String, JsonNode>, spec)` — limites de tamanho (bytes), profundidade e nº de chaves |
| `utils.JsonAttributeMerger` | utilitário | `merge(target, patch)`, `copyWithoutNulls(source)` |
| `enums.StateEnum` | enum | UFs com `sigla`, `nome`, `regiao`, `ibge`; `fromSigla`, `fromNome`, `fromJson` |
| `exceptions.BusinessException` | `RuntimeException` | `userMessage` + `devMessage` |
| `exceptions.EntityNotFoundException`, `EntityInUseException` | estendem `BusinessException` | — |
| `exceptions.ThrowableUtils` | utilitário | `hasException(Throwable, Class)` |
| `pagination.PageReq` (record), `PageResult<T>` | DTOs | paginação simples |
| `validators.@ValidBirthDate(minAge, maxAge)` | Bean Validation | `-1` desabilita cada limite |
| `validators.@ValidName(quantidadePalavras)` | Bean Validation | `quantidadePalavras` **sem default** (obrigatório na anotação) |
| `validators.@ValidPassword(...)` | Bean Validation | defaults no código: `minSize=8` e **todas** as regras `true` (`upper/lower/number/specialCharacterRequired`, `prohibitsRepeatedCharactersInSequence`) |
| `validators.@ValidEmail` | Bean Validation | regex + bloqueio de domínios descartáveis em produção (ver config) |
| `validators.@ValidPhone` | Bean Validation | aceita só dígitos ou formato mascarado |

### Persistência (`br.com.seedgrid.commons.persistence`)

| Símbolo | Resumo |
|---|---|
| `BaseEntity` (`@MappedSuperclass`) | `id` (IDENTITY), `publicId` (UUIDv7 no `@PrePersist`), `active`, `createdAt`/`updatedAt` (`Instant` → `timestamptz`), `createUserPublicId`, `updateUserPublicId`; `@EntityListeners(BaseEntityAuditListener)` |
| `BaseEntityPanache` | idem estendendo `PanacheEntityBase` (sem `active`) |
| `BaseEntityAuditListener` / `BaseEntityPanacheAuditListener` | preenchem `create/updateUserPublicId` via `CurrentUserProvider`; em erro (sem contexto) gravam `null` |
| `spi.CurrentUserProvider` + `spi.impl.DefaultCurrentUserProvider` (`@DefaultBean`) | default devolve publicId zero (`00000000-...`), e-mail/nome placeholders |
| `embeddables.Address`, `embeddables.Contact` (`@Embeddable`) | campos com `@PersonalData` e, em `phone`/`cpf`/`whatsapp`/`email`, `@EncryptedField` + `@Convert(EncryptedFieldAttributeConverter)` com campo `*Hash` irmão (lib privacy) |
| `SchemaUtils.schemaReady(EntityManager, historyTable)` | verifica se a última migração Flyway registrada teve sucesso (`to_regclass('public.<tabela>')`) |

Colunas usadas por `BaseEntity`: `public_id`, `active`, `created_at`, `updated_at`, `create_user_public_id`, `update_user_public_id`. A lib **não** traz migrations; cada host/extension cria as colunas. **Confirmado.**

### SPIs gerais (`br.com.seedgrid.commons.spi`) e eventos

| Símbolo | Resumo |
|---|---|
| `TenantProvider` + `SingleTenantProvider` (`@DefaultBean`) | default single-tenant: tenant `"default"`, set/clear no-op |
| `UserContactProvider` (+ record `UserContact`) + `DefaultUserContactProvider` (`@DefaultBean`) | default devolve `UserContact.empty()` |
| `events.SgUserEvent(userPublicId, channel, event, data)` | evento CDI neutro "algo aconteceu para um usuário" (consumido p.ex. pela extension realtime — ver [[SeedGrid/Extensions/realtime/Visao-geral|Visão geral do realtime]]) |

### Web (`br.com.seedgrid.commons.web`)

| Símbolo | Resumo |
|---|---|
| `cors.CorsFilter` (`@Provider @PreMatching`, prioridade `AUTHENTICATION - 100`) + `cors.CorsConfig` | responde preflight `OPTIONS` (200 com headers, ou 403 para origem não permitida); origem `"null"` → 403; adiciona `Access-Control-*` nas respostas para origens permitidas; `Allow-Credentials: true`, `Allow-Headers: Accept,Authorization,Content-Type,X-Requested-With`, `Expose-Headers: Location,Link`, `Max-Age: 0` |
| `exceptions.ApiExceptionHandler` (`ExceptionMapper<Throwable>`) | Problem Details: `NotFoundException`→404; `WebApplicationException`→status da exceção; `ConstraintViolationException`→400 com `violations[]`; `BusinessException` (inclui `EntityNotFoundException`/`EntityInUseException`)→**400** `ERRO_NEGOCIO`; senão tenta `ApiExceptionExtension`s; fallback 500 |
| `exceptions.ConstraintViolationExceptionMapper` (`@Priority(1)`) | sobrepõe o mapper built-in do Quarkus e delega ao handler |
| `exceptions.spi.ApiExceptionExtension` + `DefaultApiExceptionExtension` | ponto de extensão (`tryHandle` devolve `Response` ou `null`) |
| `exceptions.ProblemType` | URIs `https://seedgrid.com.br/<path>` |

Não há endpoints REST próprios.

## Testes existentes (não executados)

`src/test/java/...`: `StateEnumTest`, `BusinessTimeZoneTest`, `HashUtilsTest`, `JsonAttributeLimitsTest`, `JsonAttributeMergerTest`, `UUIDv7Test`, `Valid{BirthDate,Email,Name,Password,Phone}ValidatorTest`, `CorsConfigTest`, `CorsFilterTest`, `ApiExceptionHandlerTest` — todos unitários (nenhum `@QuarkusTest`; ~115 anotações `@Test` por grep). **Não executados.**

## Limitações

- `EntityNotFoundException` e `EntityInUseException` resultam em **400** (caem no ramo `BusinessException`); para 404/409 é preciso lançar `WebApplicationException`/`NotFoundException`. **Confirmado** (`ApiExceptionHandler#toResponse`).
- `@ValidBirthDate` tem mensagem default `{br.com.seedgrid.subdomaintenancy.validation.BirthDateIsValid.message}` — chave de bundle de outra extension; não há `ValidationMessages.properties` nesta lib. **Confirmado** (busca de resources vazia).
- `Address`/`Contact` dependem do modo de criptografia da lib privacy (`seedgrid.privacy.*`) — ver [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]].
- `CorsFilter` é próprio e convive com o CORS nativo do Quarkus (`quarkus.http.cors.*`); interação não documentada — **Não confirmado**.
