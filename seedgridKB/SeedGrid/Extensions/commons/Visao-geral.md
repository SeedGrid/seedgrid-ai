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
| `exceptions.SeedGridException` | `RuntimeException` abstrata | base única: `status()` (`int`), `problemType()`/`title()` (padrão pelo status), `code()`, `extensions()` (campos extras no corpo), `headers()`, `userMessage` e `devMessage` (não publicado, 2026.10.22) |
| `exceptions.BusinessException` | `SeedGridException` | erro do cliente, `status()` 400-499 (padrão 400 `ERRO_NEGOCIO`); construtores com `Response.Status` ou `int` (não publicado, 2026.10.22) |
| `exceptions.SystemSeedGridException` | `SeedGridException` | erro nosso, `status()` 500-599 (padrão 500); `userMessage` sempre genérica, detalhe só na `devMessage` com `seedgrid.show-dev-message` (não publicado, 2026.10.22) |
| `exceptions.EntityNotFoundException`, `EntityInUseException` | estendem `BusinessException` | 404 e 409; bases das exceptions específicas (`ClienteNotFoundException`); antes eram 400 (não publicado) |
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
| `embeddables.Address`, `embeddables.Contact` (`@Embeddable`) | campos com `@SgPersonalData` e, em `phone`/`cpf`/`whatsapp`/`email`, `@SgEncryptedField` + `@Convert(EncryptedFieldAttributeConverter)` com campo `*Hash` irmão (lib privacy) |
| `SchemaUtils.schemaReady(EntityManager, historyTable)` | verifica se a última migração Flyway registrada teve sucesso (`to_regclass('public.<tabela>')`) |

Colunas usadas por `BaseEntity`: `public_id`, `active`, `created_at`, `updated_at`, `create_user_public_id`, `update_user_public_id`. A lib **não** traz migrations; cada host/extension cria as colunas. **Confirmado.**

### SPIs

Detalhes de cada SPI (assinaturas, o que o padrão faz, implementações reais e exemplos): [[SeedGrid/Extensions/commons/SPIs|SPIs]].

_Fonte: código de `seedgrid-quarkus-lib-commons` (versão local 2026.10.22, não publicada)._

| SPI | Pacote | Implementação padrão (`@DefaultBean`) | Para que serve |
|---|---|---|---|
| `ApiExceptionExtension` | `br.com.seedgrid.commons.web.exceptions.spis` | `DefaultApiExceptionExtension` (`@Default`; não trata nada) | Gancho para uma extension ensinar o `ApiExceptionHandler` a responder por exceções dela. |
| `CurrentUserProvider` | `br.com.seedgrid.commons.persistence.spis` | `DefaultCurrentUserProvider` | Quem é o usuário corrente, para preenchimento de auditoria e de campos de autoria. |
| `TenantProvider` | `br.com.seedgrid.commons.spis` | `SingleTenantProvider` | Service Provider Interface for tenant management. |
| `UserContactProvider` | `br.com.seedgrid.commons.spis` | `DefaultUserContactProvider` | Provides user contact data from a persisted publicId. |

**Como substituir:** declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`; a implementação padrão (`@DefaultBean`) cede. SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar.

```java
@ApplicationScoped
public class MeuApiExceptionExtension implements ApiExceptionExtension {
    // implemente os métodos da interface
}
```

**Detalhes já documentados:**

| Símbolo | Resumo |
|---|---|
| `TenantProvider` + `SingleTenantProvider` (`@DefaultBean`) | default single-tenant: tenant `"default"`, set/clear no-op |
| `UserContactProvider` (+ record `UserContact`) + `DefaultUserContactProvider` (`@DefaultBean`) | default devolve `UserContact.empty()` |
| `events.SgUserEvent(userPublicId, channel, event, data)` | evento CDI neutro "algo aconteceu para um usuário" (consumido p.ex. pela extension realtime — ver [[SeedGrid/Extensions/realtime/Visao-geral|Visão geral do realtime]]) |

### Web (`br.com.seedgrid.commons.web`)

| Símbolo | Resumo |
|---|---|
| `cors.CorsFilter` (`@Provider @PreMatching`, prioridade `AUTHENTICATION - 100`) + `cors.CorsConfig` | responde preflight `OPTIONS` (200 com headers, ou 403 para origem não permitida); origem `"null"` → 403; adiciona `Access-Control-*` nas respostas para origens permitidas; `Allow-Credentials: true`, `Allow-Headers: Accept,Authorization,Content-Type,X-Requested-With`, `Expose-Headers: Location,Link`, `Max-Age: 0` |
| `exceptions.ApiExceptionHandler` (`ExceptionMapper<Throwable>`) | Problem Details: `NotFoundException`→404; `WebApplicationException`→status da exceção; `ConstraintViolationException`→400 com `violations[]`; `SeedGridException` (`BusinessException` 4xx e `SystemSeedGridException` 5xx)→o `status()`, `code()`, `headers()` e `extensions()` dela (padrão **400** `ERRO_NEGOCIO`; `EntityNotFoundException`→404 `RECURSO_NAO_ENCONTRADO`, `EntityInUseException`→409 `ENTIDADE_EM_USO`; 5xx com mensagem genérica; não publicado, versão local 2026.10.22); senão tenta `ApiExceptionExtension`s; fallback 500 |
| `exceptions.ConstraintViolationExceptionMapper` (`@Priority(1)`) | sobrepõe o mapper built-in do Quarkus e delega ao handler |
| `exceptions.spi.ApiExceptionExtension` + `DefaultApiExceptionExtension` | ponto de extensão (`tryHandle` devolve `Response` ou `null`) |
| `exceptions.ProblemType` | URIs `https://seedgrid.com.br/<path>` |

Não há endpoints REST próprios.

## Anotações

_Fonte: código de `seedgrid-quarkus-lib-commons` (versão local 2026.10.22, não publicada)._

| Anotação | Pacote | Onde se aplica | Atributos (padrão) | Para que serve |
|---|---|---|---|---|
| `@QUERY` | `br.com.seedgrid.commons.web.annotations` | `METHOD` | — | Metodo HTTP `QUERY` (IETF "The HTTP QUERY Method"): como o `GET`, e SEGURO e idempotente (nao muda estado), mas aceita CORPO na requisicao - para consultas com filtros grandes ou complexos que nao cabem na URL. |
| `@ValidBirthDate` | `br.com.seedgrid.commons.core.validators` | `FIELD`, `METHOD`, `PARAMETER`, `ANNOTATION_TYPE`, `TYPE_USE` | `message` (`"{br.com.seedgrid.subdomaintenancy.validation.BirthDateIsValid.message}"`), `groups` (`{}`), `payload` (`{}`), `minAge` (`-1`), `maxAge` (`-1`), `value` | A data de nascimento deve resultar numa idade dentro de `#minAge()` e `#maxAge()`. |
| `@ValidEmail` | `br.com.seedgrid.commons.core.validators` | `FIELD`, `METHOD`, `PARAMETER`, `ANNOTATION_TYPE` | `message` (`"Email invalido"`), `groups` (`{}`), `payload` (`{}`) | O texto deve ser um e-mail bem formado e de um domínio aceito. |
| `@ValidName` | `br.com.seedgrid.commons.core.validators` | `FIELD`, `METHOD`, `PARAMETER` | `message` (`"O texto deve conter pelo menos {quantidadePalavras} palavras."`), `groups` (`{}`), `payload` (`{}`), `quantidadePalavras` | O texto deve ter ao menos `#quantidadePalavras()` palavras (separadas por espaço), para exigir nome e sobrenome, por exemplo. |
| `@ValidPassword` | `br.com.seedgrid.commons.core.validators` | `FIELD`, `PARAMETER`, `ANNOTATION_TYPE` | `message` (`"Senha inválida"`), `groups` (`{}`), `payload` (`{}`), `upperRequired` (`true`), `lowerRequired` (`true`), `numberRequired` (`true`), `specialCharacterRequired` (`true`), `prohibitsRepeatedCharactersInSequence` (`true`), `minSize` (`8`) | A senha deve cumprir as regras de complexidade configuradas. |
| `@ValidPhone` | `br.com.seedgrid.commons.core.validators` | `FIELD`, `METHOD`, `PARAMETER`, `ANNOTATION_TYPE` | `message` (`"Telefone invalido"`), `groups` (`{}`), `payload` (`{}`) | O texto deve ser um telefone brasileiro válido, com DDD: 10 dígitos (fixo) ou 11 (celular), só dígitos ou na máscara `(11) 91234-5678`. |

## Testes existentes (não executados)

`src/test/java/...`: `StateEnumTest`, `BusinessTimeZoneTest`, `HashUtilsTest`, `JsonAttributeLimitsTest`, `JsonAttributeMergerTest`, `UUIDv7Test`, `Valid{BirthDate,Email,Name,Password,Phone}ValidatorTest`, `CorsConfigTest`, `CorsFilterTest`, `ApiExceptionHandlerTest` — todos unitários (nenhum `@QuarkusTest`; ~115 anotações `@Test` por grep). **Não executados.**

## Limitações

- Nas versões publicadas até hoje, `EntityNotFoundException` e `EntityInUseException` resultam em **400**; a versão local 2026.10.22 (não publicada) passa a 404 e 409 e traz `SeedGridException`/`SystemSeedGridException`. O status é `int` (o 422 cabe na própria exception; não precisa de `ApiExceptionExtension`). **Confirmado** (`ApiExceptionHandlerEndToEndTest`, `SeedGridExceptionTest`).
- `@ValidBirthDate` tem mensagem default `{br.com.seedgrid.subdomaintenancy.validation.BirthDateIsValid.message}` — chave de bundle de outra extension; não há `ValidationMessages.properties` nesta lib. **Confirmado** (busca de resources vazia).
- `Address`/`Contact` dependem do modo de criptografia da lib privacy (`seedgrid.privacy.*`) — ver [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]].
- `CorsFilter` é próprio e convive com o CORS nativo do Quarkus (`quarkus.http.cors.*`); interação não documentada — **Não confirmado**.
