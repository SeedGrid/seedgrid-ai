---
tags: [seedgrid, library, cache, enum]
fonte: java/seedgrid-quarkus-lib-cache
branch: main
commit: 648243a
analisado-em: 2026-11-11
---

# SeedGrid Cache — Enums

Voltar: [[SeedGrid/Extensions/cache/Visao-geral|Visão geral do cache]] · [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache]]

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| `CacheProviderFailSoft.Level` | `br.com.seedgrid.cache.core.commons.spis.CacheProviderFailSoft` | tipo lógico da propriedade `seedgrid.cache.if-provider-is-down` | Sim (enum aninhado `public`) |
| `FailoverCache.State` | `br.com.seedgrid.cache.core.failover.FailoverCache` | `FailoverCache#state()`, `CacheFailoverStatus` | Sim (enum aninhado `public`) |
| `ProviderFailureClassifier.Kind` | `br.com.seedgrid.cache.core.failover.ProviderFailureClassifier` | retorno de `ProviderFailureClassifier#classify` | Sim (enum aninhado `public`) |
| `CacheKeyScope` | `br.com.seedgrid.cache.core.keyscope.CacheKeyScope` | membro `scope` de `@SgCacheResult`, `@SgCacheInvalidate`, `@SgCacheInvalidateAll`; propriedade `seedgrid.cache.key-scope` | Sim |
| `CacheEnvelope.Kind` | `br.com.seedgrid.cache.core.serialization.CacheEnvelope` | cabeçalho (5º byte) do envelope gravado no cache | Sim (enum aninhado `public`) |
| `CacheContainer.Kind` | `br.com.seedgrid.cache.testkit.CacheContainer` (módulo `seedgrid-cache-testkit`) | escolha do servidor/imagem nos testes de integração | Sim (enum aninhado `public`) |

## Level

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/commons/spis/CacheProviderFailSoft.java` — FQN `br.com.seedgrid.cache.core.commons.spis.CacheProviderFailSoft.Level`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `WARN` | Fail-soft: o backend distribuído falhou, a request continua. | `CacheProviderFailSoft#onFailure` loga WARN e retorna; `get` devolve o `fallback` (`Optional.empty()`, `0L`) e `run` vira no-op. **Confirmado.** | Padrão. Valor desconhecido ou ausente também resulta em `WARN`. |
| `ERROR` | Fail-closed: a request falha junto com o backend. | `onFailure` loga ERROR e relança a `RuntimeException` original. **Confirmado.** | Sem equivalente no Rust (lá `Error` só muda o nível do log e degrada). |
| `FAILOVER` | Troca para memória local na primeira falha, com journal e sondagem. | `FailoverConfig` liga o `FailoverCache` quando `failoverLevelSelected()` (equivale a `seedgrid.cache.failover.enabled=true`). Fora do `FailoverCache` comporta-se como `WARN` (`onFailure` só trata `ERROR` de forma diferente). **Confirmado.** | Rust: `ProviderDownLog::Failover`. |

**Atributos/métodos:** sem campos; `static Level parse(String v)` — `null`/vazio/desconhecido → `WARN`; `"ERROR"` e `"FAILOVER"` (trim, case-insensitive) → `ERROR` e `FAILOVER`.

**Leitura da configuração:** a propriedade é lida como `String` (`ConfigProvider.getConfig().getOptionalValue(PROP, String.class)`) e convertida por `Level.parse`, **não** pelo conversor de enum do SmallRye. Logo é **case-insensitive** e **valores inválidos não geram erro** (viram `WARN`). Relida a cada falha.

**Persistência / JSON:** não é persistido nem serializado.

**Onde é usado:** [[SeedGrid/Extensions/cache/Configuracao|seedgrid.cache.if-provider-is-down]]; consumido por `SeedGridCacheRedis`, `SeedGridCacheValkey` e `SeedGridCacheDragonfly` via `CacheProviderFailSoft.get/run`. Não se aplica ao `withLock` nem ao `DefaultSeedGridCache`.

## State

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/failover/FailoverCache.java` — FQN `br.com.seedgrid.cache.core.failover.FailoverCache.State`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `NORMAL` | O provider distribuído responde; as operações vão a ele. | Estado inicial (`private volatile State state = State.NORMAL`); volta a ele no cutover, depois do replay do journal. **Confirmado.** | — |
| `FAILOVER` | O provider caiu; as operações usam a memória local e gravam o journal. | Atribuído na primeira falha de infraestrutura; enquanto durar, a sondagem (`PROBE_KEY`) tenta recuperar. **Confirmado.** | `CacheFailoverStatus` devolve `NORMAL` quando não há `FailoverCache`. |

Sem campos. Não é persistido nem serializado.

## ProviderFailureClassifier.Kind

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/failover/ProviderFailureClassifier.java` — FQN `br.com.seedgrid.cache.core.failover.ProviderFailureClassifier.Kind`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `INFRASTRUCTURE` | Falha de infraestrutura do provider. | Conta como queda do provider (precedência 2 e 4: desconhecido = infra). **Confirmado.** | — |
| `LOCAL_SATURATION` | Saturação local (pool/fila de espera). | Não é queda do provider. **Confirmado.** | — |
| `CALLER_ERROR` | Erro de lógica do chamador. | Não é queda do provider (precedência 3). **Confirmado.** | — |
| `USER_FUNCTION` | Falha da função do usuário. | Não é queda do provider. **Confirmado.** | — |
| `LOCK_BUSY` | `CacheLockBusyException`. | Não é queda do provider. **Confirmado.** | — |
| `EXTRA_NOT_INFRASTRUCTURE` | Casou um predicado extra de `notInfrastructure(...)`. | Não é queda do provider. **Confirmado.** | — |

## CacheKeyScope

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/keyscope/CacheKeyScope.java` — FQN `br.com.seedgrid.cache.core.keyscope.CacheKeyScope`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `DEFAULT` | O membro `scope` não foi informado. | `CacheKeyScopes` o resolve para a propriedade `seedgrid.cache.key-scope` (padrão `TENANT`). **Confirmado.** | Padrão do membro `scope()` nas três annotations. |
| `TENANT` | Uma entrada por tenant (conta). | Escopo entra na chave. **Confirmado.** | Padrão efetivo. |
| `COMPANY` | Uma entrada por empresa (dentro do tenant). | idem | — |
| `USER` | Uma entrada por usuário autenticado (dentro do tenant). | idem | — |
| `GLOBAL` | Uma entrada para todos (catálogos compartilhados). | Sem segmento de escopo na chave (`Optional.of("")`). **Confirmado.** | — |

Sem campos. Não é persistido; é membro de `@SgCacheResult`, `@SgCacheInvalidate` e `@SgCacheInvalidateAll` e valor da propriedade `seedgrid.cache.key-scope`.

## CacheEnvelope.Kind

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/serialization/CacheEnvelope.java` — FQN `br.com.seedgrid.cache.core.serialization.CacheEnvelope.Kind`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `NULL` | O método devolveu `null` (sem payload). | código `0` no cabeçalho. **Confirmado.** | — |
| `EMPTY_OPTIONAL` | O método devolveu `Optional.empty()` (sem payload). | código `1`. **Confirmado.** | — |
| `VALUE` | Valor comum (payload = valor serializado). | código `2`. **Confirmado.** | — |
| `PRESENT_OPTIONAL` | `Optional.of(valor)` (payload = o valor, sem o `Optional`). | código `3`. **Confirmado.** | — |

Campo privado `code` (byte); `Kind.of(byte)` devolve `null` para código desconhecido. Gravado no 5º byte do cabeçalho do envelope; é o enum que o Rust espelha em `Kind` (`src/annotations/codec.rs`).

## CacheContainer.Kind

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-testkit/src/main/java/br/com/seedgrid/cache/testkit/CacheContainer.java` — FQN `br.com.seedgrid.cache.testkit.CacheContainer.Kind`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `REDIS` | Servidor Redis. | imagem `redis:7-alpine`. **Confirmado.** | — |
| `VALKEY` | Servidor Valkey. | imagem `valkey/valkey:8-alpine`. **Confirmado.** | — |
| `DRAGONFLY` | Servidor Dragonfly. | imagem `docker.dragonflydb.io/dragonflydb/dragonfly:latest`. **Confirmado.** | — |

Campo `image()` (nome da imagem Docker). Só para testes; não é persistido.

## Internos

`FailoverCache.Kind` (`STRING`, `BYTES`, `LONG`, `DELETE`, `PREFIX_DELETE`) é `private` (tipo de entrada do journal) e não faz parte da API pública.
