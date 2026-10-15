---
tags: [seedgrid, library, cache, exemplos]
fonte: java/seedgrid-quarkus-lib-cache, java/examples/seedgrid-cache-example
branch: main
commit: 14bd916a09
analisado-em: 2026-10-14
---

# SeedGrid Cache — Exemplos

Voltar: [[SeedGrid/Extensions/cache/Visao-geral|Visão geral do cache]] · [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache]]

## Dependências (core + no máximo um provider)

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-cache-core</artifactId>
    <version>2026.10.13</version>
</dependency>
<!-- opcional, escolha UM: seedgrid-cache-redis | seedgrid-cache-valkey | seedgrid-cache-dragonfly -->
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-cache-redis</artifactId>
    <version>2026.10.13</version>
</dependency>
```

Fonte: `pom.xml` dos módulos (versão atual) + `README.md` (padrão de instalação).

## API básica

Fonte: `README.md` e assinaturas de `SeedGridCacheProvider`.

```java
@Inject
SeedGridCacheProvider cache;

cache.putString("user:42:name", "João", Duration.ofMinutes(10));
Optional<String> name = cache.getString("user:42:name");

cache.putBytes("img:42", bytes, Duration.ofHours(1));
Optional<byte[]> img = cache.getBytes("img:42");

cache.putLong("quota:42", 100L, null);   // ttl null/zero/negativo = sem expiração
OptionalLong quota = cache.getLong("quota:42");

long hits = cache.increment("hits:42", Duration.ofMinutes(1)); // TTL só na 1ª chamada (janela)
cache.delete("user:42:name");

// Lock exclusivo por chave (distribuído nos providers RESP; JVM-local no default)
String result = cache.withLock("job:import", Duration.ofSeconds(30), () -> {
    // seção crítica
    return "ok";
});
```

`withLock` lança `IllegalStateException` se o lock já estiver tomado (providers RESP) — não há espera.

## Cache-aside (exemplo real)

Fonte: `java/examples/seedgrid-cache-example/src/main/java/br/com/seedgrid/cacheexample/service/CatalogService.java` (trecho).

```java
@ApplicationScoped
public class CatalogService {
    private static final String KEY_PREFIX = "catalog:item:";
    private final SeedGridCacheProvider cache;
    private final Duration ttl;

    @Inject
    public CatalogService(
            SeedGridCacheProvider cache,
            @ConfigProperty(name = "seedgrid.cache.example.item-ttl", defaultValue = "PT30S") Duration ttl) {
        this.cache = cache;
        this.ttl = ttl;
    }

    public ItemLookup get(String id) {
        String key = KEY_PREFIX + id;
        Optional<String> cached = cache.getString(key);
        if (cached.isPresent()) {
            return new ItemLookup(id, cached.get(), true, realExecutions.get());
        }
        String value = expensiveLookup(id);
        cache.putString(key, value, ttl);
        return new ItemLookup(id, value, false, realExecutions.get());
    }

    public void evict(String id) {
        cache.delete(KEY_PREFIX + id);
    }
}
```

O exemplo roda só com `seedgrid-cache-core` (in-memory). `seedgrid.cache.example.item-ttl` é propriedade **do exemplo**.

## Configuração por cenário

```properties
# Redis/Valkey/Dragonfly (mesmo esquema redis://)
seedgrid.cache.hosts=redis://<host>:6379
seedgrid.cache.password=<SEGREDO:cache-password>

# Falhar a request quando o backend cair, em vez de degradar
seedgrid.cache.if-provider-is-down=ERROR
```

Detalhes e padrões: [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache]].

## Teste com Testcontainers só via alias

Fonte: `seedgrid-cache-redis/src/test/java/.../RedisAliasTestResource.java` e `SeedGridCacheRedisConfigAliasIT.java`.

```java
public class RedisAliasTestResource implements QuarkusTestResourceLifecycleManager {
    private final GenericContainer<?> redis =
        new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Override
    public Map<String, String> start() {
        redis.start();
        String hosts = "redis://" + redis.getHost() + ":" + redis.getMappedPort(6379);
        return Map.of("seedgrid.cache.hosts", hosts);
    }

    @Override
    public void stop() { redis.stop(); }
}

@QuarkusTest
@QuarkusTestResource(RedisAliasTestResource.class)
class SeedGridCacheRedisConfigAliasIT {
    @Inject SeedGridCacheRedis cache;

    @Test
    void providerWorksThroughAliasConfiguredDataSource() {
        cache.putString("k", "via-alias", Duration.ofSeconds(30));
        assertEquals("via-alias", cache.getString("k").orElseThrow());
    }
}
```

Com `src/test/resources/application.properties`:

```properties
quarkus.redis.devservices.enabled=false
quarkus.arc.selected-alternatives=br.com.seedgrid.cache.redis.commons.spi.SeedGridCacheRedis
```
