---
tags: [seedgrid, extension, cache, quarkus, spis]
fonte: java/seedgrid-quarkus-lib-cache
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# cache (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/cache/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-lib-cache` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#SeedGridCacheProvider]] | `DefaultSeedGridCache` | Cache em memória (local à instância/JVM): não há consistência entre instâncias e `withLock` só protege dentro da JVM. Pensado para produção de instância única, desenvolvimento e como memória do modo FAILOVER. |

## SeedGridCacheProvider

SPI do cache (memória, Redis, Valkey, Dragonfly e o decorador de failover). Contrato de TTL (igual nos providers)

**Pacote:** `br.com.seedgrid.cache.core.commons.spis`

**Padrão (`@DefaultBean`):**

- `DefaultSeedGridCache` — Cache em memória (local à instância/JVM): não há consistência entre instâncias e `withLock` só protege dentro da JVM. Pensado para produção de instância única, desenvolvimento e como memória do modo FAILOVER.

**Outras implementações no repositório** (para consultar como exemplo):

- `CacheFailoverDecorator` (`seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/failover/CacheFailoverDecorator.java`) — Liga o `FailoverCache` ao provider configurado quando o modo FAILOVER está ativo (`seedgrid.cache.failover.enabled=true` ou `seedgrid.cache.if-provider-is-down=FAILOVER`). Com o modo desligado (padrão) repassa tudo ao provider, sem nenhum efeito.
- `FailoverCache` (`seedgrid-quarkus-lib-cache/seedgrid-cache-core/src/main/java/br/com/seedgrid/cache/core/failover/FailoverCache.java`) — Modo FAILOVER do seedgrid-cache (plano 4.2).
- `SeedGridCacheDragonfly` (`seedgrid-quarkus-lib-cache/seedgrid-cache-dragonfly/src/main/java/br/com/seedgrid/cache/dragonfly/commons/spis/SeedGridCacheDragonfly.java`) — Implementação de cache baseada no Dragonfly (https://www.dragonflydb.io/). Dragonfly é um datastore in-memory compatível com a API do Redis (protocolo RESP), portanto reutiliza o mesmo `quarkus-redis-client`.
- `SeedGridCacheRedis` (`seedgrid-quarkus-lib-cache/seedgrid-cache-redis/src/main/java/br/com/seedgrid/cache/redis/commons/spis/SeedGridCacheRedis.java`) — Provider de cache em Redis.
- `SeedGridCacheValkey` (`seedgrid-quarkus-lib-cache/seedgrid-cache-valkey/src/main/java/br/com/seedgrid/cache/valkey/commons/spis/SeedGridCacheValkey.java`) — Implementação de cache baseada no Valkey (https://valkey.io/). Valkey é um fork do Redis mantido pela Linux Foundation e mantém total compatibilidade com o protocolo RESP, portanto reutiliza o mesmo `quarkus-redis-client`.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Optional<String> getString(String key)` | Lê um texto; vazio se ausente ou expirado. |
| `void putString(String key, String value, Duration ttl)` | Grava um texto com TTL (nulo ou ≤ 0 = sem expiração). |
| `Optional<byte[]> getBytes(String key)` | Lê bytes; vazio se ausente ou expirado. |
| `void putBytes(String key, byte[] value, Duration ttl)` | Grava bytes com TTL; `value == null` equivale a `delete`. |
| `OptionalLong getLong(String key)` | Lê um número inteiro longo. |
| `void putLong(String key, long value, Duration ttl)` | Grava um número inteiro longo com TTL. |
| `long increment(String key)` | Incrementa atomicamente e devolve o novo valor. |
| `long increment(String key, Duration ttl)` | Incrementa atomicamente em janela fixa : o vencimento é definido uma única vez, quando a chave é criada (valor 1), expirou ou existia sem TTL; as chamadas seguintes dentro da janela não o prorrogam, então a chave expira `ttl` depois do primeiro incremento da janela, mesmo sob tráfego. |
| `void delete(String key)` | Remove a chave. |
| `<T> T tryWithLock(String key, Duration ttl, Duration espera, Supplier<T> fn)` | Executa `fn` sob lock exclusivo por `key`. Unico metodo de lock da SPI (o antigo `withLock` foi removido: espera sem limite na memoria e falha imediata nos servidores era a mesma chamada com dois comportamentos). |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `void deleteByPrefix(String prefix)` | Remove TODAS as chaves de valor (string, bytes e long) cujo nome COMECA com `prefix`. E' a invalidacao "de um grupo inteiro" (por exemplo, todas as entradas de um cache nomeado), sem listar as chaves uma a uma. |
| `CacheValueSerializer valueSerializer()` | Serializador dos valores tipados (`get(String, Type)` / `put(String, Object, Duration)`). Os providers devolvem o `CacheValueSerializer` injetado (Jackson quando o host tem um `ObjectMapper` gerenciado; senao so' tipos simples). |
| `<T> Optional<T> get(String key, Type type)` | Le o valor tipado de `key`. O formato gravado e' o mesmo do `@SgCacheResult` (envelope versionado), entao as duas formas leem a mesma chave. |
| `<T> Optional<T> get(String key, Class<T> type)` | Igual a `get(String, Type)` para tipos sem generics. |
| `void put(String key, Object value, Duration ttl)` | Grava `value` serializado, com o TTL do contrato desta interface. `value == null` apaga a chave (igual a `putBytes(String, byte[], Duration)`). |
| `void put(String key, Object value, Type type, Duration ttl)` | Grava `value` declarando o tipo (por exemplo `List`). |
| `boolean isLocalMemory()` | `true` para providers em memória local (não distribuídos). O failover usa isto para nunca sondar um provider que não pode "cair". |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuSeedGridCacheProvider implements SeedGridCacheProvider {
    @Override
    public Optional<String> getString(String key) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void putString(String key, String value, Duration ttl) {
        // implemente
    }

    @Override
    public Optional<byte[]> getBytes(String key) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void putBytes(String key, byte[] value, Duration ttl) {
        // implemente
    }

    @Override
    public OptionalLong getLong(String key) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void putLong(String key, long value, Duration ttl) {
        // implemente
    }

    @Override
    public long increment(String key) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public long increment(String key, Duration ttl) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void delete(String key) {
        // implemente
    }

    @Override
    public <T> T tryWithLock(String key, Duration ttl, Duration espera, Supplier<T> fn) {
        throw new UnsupportedOperationException("implemente");
    }
}
```
