---
tags: [seedgrid, library, commons, enum]
fonte: java/seedgrid-quarkus-lib-commons
branch: main
commit: fa49c344db
analisado-em: 2026-10-14
---

# SeedGrid Commons — Enums

Voltar: [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]] · [[SeedGrid/Extensions/commons/Configuracao|Configuração do commons]]

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| `StateEnum` | `br.com.seedgrid.commons.core.enums.StateEnum` | `Address.state` (coluna), DTOs de cadastro de outras extensions | Sim |
| `StateEnum.Regiao` | aninhado em `StateEnum.java` | atributo `regiao` de `StateEnum` | Sim |
| `ProblemType` | `br.com.seedgrid.commons.web.exceptions.ProblemType` | campo `type` do Problem Details | Sim |

## StateEnum

Arquivo: `java/seedgrid-quarkus-lib-commons/src/main/java/br/com/seedgrid/commons/core/enums/StateEnum.java`.

Os 27 valores são as UFs; cada um tem `sigla` (igual ao nome da constante), `nome`, `regiao` e `ibge` (código IBGE). **Confirmado** (código).

| Valor | Nome | Região | IBGE |
|---|---|---|---|
| `AC` | Acre | NORTE | 12 |
| `AL` | Alagoas | NORDESTE | 27 |
| `AP` | Amapá | NORTE | 16 |
| `AM` | Amazonas | NORTE | 13 |
| `BA` | Bahia | NORDESTE | 29 |
| `CE` | Ceará | NORDESTE | 23 |
| `DF` | Distrito Federal | CENTRO_OESTE | 53 |
| `ES` | Espírito Santo | SUDESTE | 32 |
| `GO` | Goiás | CENTRO_OESTE | 52 |
| `MA` | Maranhão | NORDESTE | 21 |
| `MT` | Mato Grosso | CENTRO_OESTE | 51 |
| `MS` | Mato Grosso do Sul | CENTRO_OESTE | 50 |
| `MG` | Minas Gerais | SUDESTE | 31 |
| `PA` | Pará | NORTE | 15 |
| `PB` | Paraíba | NORDESTE | 25 |
| `PR` | Paraná | SUL | 41 |
| `PE` | Pernambuco | NORDESTE | 26 |
| `PI` | Piauí | NORDESTE | 22 |
| `RJ` | Rio de Janeiro | SUDESTE | 33 |
| `RN` | Rio Grande do Norte | NORDESTE | 24 |
| `RS` | Rio Grande do Sul | SUL | 43 |
| `RO` | Rondônia | NORTE | 11 |
| `RR` | Roraima | NORTE | 14 |
| `SC` | Santa Catarina | SUL | 42 |
| `SP` | São Paulo | SUDESTE | 35 |
| `SE` | Sergipe | NORDESTE | 28 |
| `TO` | Tocantins | NORTE | 17 |

**Métodos:** `getSigla()`, `getNome()`, `getRegiao()`, `getIbge()`; `fromSigla(String)` (trim + maiúsculas; `Optional`); `fromNome(String)` (trim, ignora caixa; `Optional`); `toJson()`; `fromJson(String)` (tenta sigla, depois nome; `null` → `null`; desconhecido → `IllegalArgumentException("UF inválida: ...")`).

**Serialização:**
- **JSON:** `@JsonValue toJson()` → sempre a **sigla** (`"SP"`). Entrada via `@JsonCreator fromJson` aceita sigla (qualquer caixa) **ou** nome por extenso (`"São Paulo"`). **Confirmado.**
- **Persistência:** em `Address.state` é `@Enumerated(EnumType.STRING)` (grava o nome da constante, igual à sigla). A lib não traz migrations nem `CHECK`; a coluna e seus valores aceitos são do host. **Confirmado.**
- **Conversão fora do Jackson:** `valueOf(String)` aceita só a sigla exata (maiúscula); extensions que leem estado de config usam `StateEnum.valueOf(state.toUpperCase())` (security `CompanyService#parseState`, `FirstAdminBootstrapService#parseState`). Nome por extenso **não** funciona nesses pontos.

**Onde é usado:** `Address.state` (embeddable do commons); `InstitutionalSignupRequest.state` (login-tenancy); `TenantSignupRequest` (subdomain-tenancy); security (`CompanyService`, `FirstAdminBootstrapService`).

### StateEnum.Regiao

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `NORTE` | Região Norte | atributo informativo (`getRegiao()`) | nenhum código da lib decide por região |
| `NORDESTE` | Região Nordeste | idem | — |
| `CENTRO_OESTE` | Região Centro-Oeste | idem | — |
| `SUDESTE` | Região Sudeste | idem | — |
| `SUL` | Região Sul | idem | — |

Não é serializado isoladamente (o JSON de `StateEnum` é só a sigla).

## ProblemType

Arquivo: `java/seedgrid-quarkus-lib-commons/src/main/java/br/com/seedgrid/commons/web/exceptions/ProblemType.java`.

**Atributos (Lombok `@Getter`):** `uri` = `https://seedgrid.com.br` + caminho e `title`. Só `getUri()` é usado nas respostas (campo `type` do Problem Details); `getTitle()` não é lido por nenhum código do monorepo. O enum em si **não** é serializado.

| Valor | URI (`type`) | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|---|
| `DADOS_INVALIDOS` | `/dados-invalidos` | Dados de entrada inválidos | `ApiExceptionHandler`: `ConstraintViolationException` (400) e fallback de `WebApplicationException` sem outro mapeamento; usado também por billing e security | — |
| `ERRO_DE_SISTEMA` | `/erro-de-sistema` | Erro interno | `ApiExceptionHandler`: status ≥ 500 (inclui o 500 de exceção não tratada) | — |
| `PARAMETRO_INVALIDO` | `/parametro-invalido` | Parâmetro inválido | Nenhum código do monorepo usa este valor | Existe no enum; pode ser usado por hosts |
| `MENSAGEM_INCOMPREENSIVEL` | `/mensagem-incompreensivel` | Corpo ilegível/não processável | `ApiExceptionHandler`: `WebApplicationException` com 415 ou 422 | — |
| `RECURSO_NAO_ENCONTRADO` | `/recurso-nao-encontrado` | Recurso inexistente | `ApiExceptionHandler`: `NotFoundException` e status 404; usado por billing, security e login-tenancy | — |
| `ENTIDADE_EM_USO` | `/entidade-em-uso` | Conflito: entidade em uso | `ApiExceptionHandler`: status 409 de `WebApplicationException`; usado por billing (`PlanInUseException`) e security | `EntityInUseException` usa este tipo (409) só na versão local 2026.10.22, não publicada; até a 2026.10.21 era `ERRO_NEGOCIO` (400) |
| `ERRO_NEGOCIO` | `/erro-negocio` | Violação de regra de negócio | `ApiExceptionHandler`: `BusinessException` e subclasses com status 400 (o padrão) | — |
| `OBRIGATORIO_TROCA_DE_SENHA` | `/obrigatorio-troca-de-senha` | Troca de senha obrigatória | Nenhum código do monorepo usa este valor | Existe no enum; pode ser usado por hosts |
| `ACESSO_NEGADO` | `/acesso-negado` | Sem permissão (403) | `ApiExceptionHandler`: status 403; usado por security | — |
| `ERRO_AO_ENVIAR_O_EMAIL` | `/erro-ao-enviar-o-email` | Falha ao enviar e-mail | Nenhum código do monorepo usa este valor | Existe no enum; pode ser usado por hosts |
| `OPERACAO_NAO_PERMITIDA` | `/operacao-nao-permitida` | Operação bloqueada por regra | Usado por billing (exceções de plano/assinatura/quota) e security; não pelo handler do commons | — |
| `AUTENTICACAO_NEGADA` | `/autenticacao-negada` | Não autenticado (401) | `ApiExceptionHandler`: status 401; usado por security e billing | — |
| `SISTEMA_INDISPONIVEL` | `/sistema-indisponivel` | Serviço/provedor indisponível | Usado por billing (`ProviderOperationException`) e security | — |
| `RECURSO_NAO_SUPORTADO` | `/recurso-nao-suportado` | Recurso não suportado | Usado por billing (`CatalogNotSupportedException`, `UsageNotSupportedException`) | — |

Mapeamento por status no handler (`resolveProblemType`): 404→`RECURSO_NAO_ENCONTRADO`, 401→`AUTENTICACAO_NEGADA`, 403→`ACESSO_NEGADO`, 409→`ENTIDADE_EM_USO`, 415/422→`MENSAGEM_INCOMPREENSIVEL`, ≥500→`ERRO_DE_SISTEMA`, demais→`DADOS_INVALIDOS`. **Confirmado.**

**Onde é usado:** campo `type` das respostas `application/problem+json` — ver [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]] e as `ApiExceptionExtension` das demais extensions.

## Internos

Nenhum.
