---
tags: [seedgrid, library, cache, enum]
fonte: java/seedgrid-quarkus-lib-cache
branch: main
commit: 14bd916a09
analisado-em: 2026-10-14
---

# SeedGrid Cache — Enums

Voltar: [[SeedGrid/Extensions/cache/Visao-geral|Visão geral do cache]] · [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache]]

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| `CacheProviderFailSoft.Level` | `br.com.seedgrid.cache.core.commons.spi.CacheProviderFailSoft` | tipo lógico da propriedade `seedgrid.cache.if-provider-is-down` | Sim (enum aninhado `public`) |

## Level

Arquivo: `java/seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/commons/spi/CacheProviderFailSoft.java` — FQN `br.com.seedgrid.cache.core.commons.spi.CacheProviderFailSoft.Level`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `WARN` | Fail-soft: o backend distribuído falhou, a request continua. | `CacheProviderFailSoft#onFailure` loga WARN e retorna; `get` devolve o `fallback` (`Optional.empty()`, `0L`) e `run` vira no-op. **Confirmado.** | Padrão. Valor desconhecido ou ausente também resulta em `WARN`. |
| `ERROR` | Fail-closed: a request falha junto com o backend. | `onFailure` loga ERROR e relança a `RuntimeException` original. **Confirmado.** | Sem equivalente no Rust (lá ambos os níveis degradam). |

**Atributos/métodos:** sem campos; `static Level parse(String v)` — `null`/vazio/desconhecido → `WARN`; só `"ERROR"` (trim, case-insensitive) → `ERROR`.

**Leitura da configuração:** a propriedade é lida como `String` (`ConfigProvider.getConfig().getOptionalValue(PROP, String.class)`) e convertida por `Level.parse`, **não** pelo conversor de enum do SmallRye. Logo é **case-insensitive** e **valores inválidos não geram erro** (viram `WARN`). Relida a cada falha.

**Persistência / JSON:** não é persistido nem serializado.

**Onde é usado:** [[SeedGrid/Extensions/cache/Configuracao|seedgrid.cache.if-provider-is-down]]; consumido por `SeedGridCacheRedis`, `SeedGridCacheValkey` e `SeedGridCacheDragonfly` via `CacheProviderFailSoft.get/run`. Não se aplica ao `withLock` nem ao `DefaultSeedGridCache`.

## Internos

Nenhum.
