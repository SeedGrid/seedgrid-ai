---
tags: [seedgrid, extension, audit, enum]
fonte: java/seedgrid-quarkus-ext-audit
branch: main
commit: d5bf32e509
analisado-em: 2026-10-14
---

# SeedGrid Audit — Enums

Voltar: [[SeedGrid/Extensions/audit/Visao-geral|Visão geral do audit]] · [[SeedGrid/Extensions/audit/Configuracao|Configuração]] · [[SeedGrid/Extensions/audit/Rust|Porte Rust]]

## Índice

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| [[#AuditOperationEnum]] | `seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/enums/AuditOperationEnum.java` | `@SgAudit(operation)`, `AuditLog.operation`, query param `operation` de `GET /audit-logs`, coluna `audit_log.operation`, campo Mongo `operation` | Sim |
| [[#AuditPersistenceStrategy]] | `seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/configs/AuditPersistenceStrategy.java` | propriedade `seedgrid.audit.persistence.strategy`, SPI `AuditPersistenceProvider#strategy()` | Sim |

## AuditOperationEnum

FQN: `br.com.seedgrid.audit.core.enums.AuditOperationEnum`. Sem campos, construtor ou métodos próprios.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `CREATE` | Criação de entidade | `AuditInterceptor#around`: captura só o estado **depois** (`afterState`), a partir do retorno ou de um novo lookup. **Confirmado** | — |
| `UPDATE` | Alteração de entidade | Captura **antes** (lookup antes de `proceed()`) e **depois**. **Confirmado** | — |
| `DELETE` | Exclusão de entidade | Captura só o estado **antes**. **Confirmado** | — |
| `READ` | Leitura/consulta | Nenhum tratamento específico: registra o evento sem before/after. **Confirmado** | — |
| `OTHER` | Operação genérica | Igual a `READ` (sem before/after). É o **padrão** de `@SgAudit(operation)`. **Confirmado** | — |

Comportamento comum: quando `@SgAudit(description)` está vazia, a descrição gravada é `operation.name()` (ex.: `UPDATE`). **Confirmado** (`AuditInterceptor#around`).

Serialização:
- JSON (respostas de `/audit-logs`): nome da constante (Jackson padrão; sem `@JsonValue`). **Inferência** (nenhuma anotação Jackson no enum).
- Query param `operation` em `GET /audit-logs`: convertido pelo JAX-RS pelo nome exato (`valueOf`), portanto case-sensitive; valor inválido falha a conversão do parâmetro. **Inferência** (comportamento padrão do JAX-RS; sem `ParamConverter` próprio).
- PostgreSQL: `@Enumerated(EnumType.STRING)` em `AuditLogEntity#operation`; coluna `operation VARCHAR(50)` (V300) **sem CHECK constraint** — o banco aceita qualquer texto, mas a aplicação só grava as 5 constantes. **Confirmado**.
- MongoDB: campo `operation` do documento `MongoAuditLogDocument` (coleção `audit_logs`), gravado pelo codec POJO como o nome da constante. **Inferência** (sem codec próprio no módulo).

Onde é usado: anotação `@SgAudit` ([[SeedGrid/Extensions/audit/Exemplos|Exemplos]]), filtro `AuditFilter#operation` (JPQL/Criteria em `JpaAuditRepositoryImpl`, filtro Mongo em `MongoAuditLogRepositoryImpl`), índice `idx_audit_log_operation_date`.

## AuditPersistenceStrategy

FQN: `br.com.seedgrid.audit.core.configs.AuditPersistenceStrategy`. Sem campos/métodos próprios; `AuditConfig#isMongo()/isJpa()` comparam com as constantes.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `MONGODB` | Persistência documental no MongoDB | `AuditPersistenceRouter#resolveProvider()` escolhe o provider com `strategy() == MONGODB` (`MongoAuditPersistenceProvider`, módulo `seedgrid-audit-mongodb`). **Confirmado** | Default do módulo mongodb: `${AUDIT_STRATEGY:MONGODB}` |
| `JPA` | Persistência relacional (PostgreSQL) via Hibernate/JPA | Escolhe `PostgreSqlAuditPersistenceProvider` (módulo `seedgrid-audit-postgresql`); habilita `seedgrid.audit.jpa.*` (`AuditConfig#effectiveJpa*`). **Confirmado** | `@WithDefault("JPA")`; default do módulo postgresql: `${AUDIT_STRATEGY:JPA}` |

Se nenhum `AuditPersistenceProvider` do classpath retornar o valor configurado → `IllegalStateException("No audit persistence provider available for strategy ...")` na primeira injeção dos repositórios. **Confirmado**.

Leitura da config: conversor de enum do SmallRye Config; o javadoc do código afirma que é case-insensitive (`jpa` aceito), com constantes canônicas `JPA` e `MONGODB`. **Confirmado** (javadoc de `AuditConfig.Persistence#strategy` e do enum). Não é persistido nem serializado em JSON.

Onde é usado: [[SeedGrid/Extensions/audit/Configuracao|`seedgrid.audit.persistence.strategy`]]; SPI `AuditPersistenceProvider#strategy()`.

## Internos

| Enum | Arquivo |
|---|---|
| `AuditInterceptor.LookupType` (`NONE`, `BY_METHOD`, `BY_FIELDS`, `BY_ID`) | `seedgrid-quarkus-ext-audit-core/runtime/src/main/java/br/com/seedgrid/audit/core/interceptors/AuditInterceptor.java` |

## Comparação com o porte Rust (informativo)

- `AuditOperationEnum` ↔ `AuditOperation` (`rust/seedgrid-rust-crate-audit/src/models.rs`, `#[serde(rename_all = "UPPERCASE")]`): mesmos 5 valores, mesma grafia.
- `AuditPersistenceStrategy` ↔ `AuditPersistenceStrategy` (`rust/seedgrid-rust-crate-audit/src/config.rs`, variantes `Jpa`/`Mongodb`): o `parse` do Rust também aceita os aliases `POSTGRES`, `POSTGRESQL` e `MONGO`, que o Java não aceita.
