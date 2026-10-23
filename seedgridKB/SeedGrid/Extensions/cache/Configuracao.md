---
tags: [seedgrid, library, cache, configuracao]
fonte: java/seedgrid-quarkus-lib-cache
branch: main
commit: 14bd916a09
analisado-em: 2026-10-14
---

# SeedGrid Cache — Configuração

Voltar: [[SeedGrid/Extensions/cache/Visao-geral|Visão geral do cache]] · [[SeedGrid/Extensions/cache/Exemplos|Exemplos do cache]] · [[SeedGrid/Extensions/cache/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.cache.*` (próprio + fachada/alias de `quarkus.redis.*`) |
| Classes de config | Nenhuma `@ConfigMapping`/`@ConfigRoot`. Leitura direta via `ConfigProvider` em `CacheProviderFailSoft`; alias via `SeedGridCacheConfigRelocateInterceptor` (SmallRye `RelocateConfigSourceInterceptor`) |
| Default embutido | `seedgrid-cache-core/src/main/resources/META-INF/microprofile-config.properties` (ordinal MP padrão 100 → `application.properties` do host, ordinal 250, sobrescreve) |
| Fase | Runtime. `if-provider-is-down` é relido **a cada falha** do backend (sem cache), logo mudanças de fonte dinâmica valem na hora. O alias vale para qualquer fase em que o interceptor esteja carregado (ver dúvidas) |
| Seleção de backend | **Não há propriedade**: o provider ativo é o que estiver no classpath (`seedgrid-cache-redis`/`-valkey`/`-dragonfly`); sem nenhum, usa `DefaultSeedGridCache` in-memory |

Mecanismo de leitura investigado: `@ConfigMapping`, `@ConfigRoot`, `@ConfigProperty`, `ConfigProvider`, `microprofile-config.properties`, `META-INF/services`, `application.properties` de testes. Só `CacheProviderFailSoft#level()` lê config diretamente.

## 2. Propriedades próprias

### 2.1 Política de falha do backend

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.cache.if-provider-is-down` | `String` (parse para enum `CacheProviderFailSoft.Level`) | `WARN`, `ERROR` (case-insensitive; qualquer outro valor ou ausência → `WARN`) — ver [[SeedGrid/Extensions/cache/Enums#Level|Level]] | `WARN` (no `microprofile-config.properties` da lib e no `orElse("WARN")` do código) | Não | `WARN`: loga WARN e degrada (`get*` → vazio, `increment` → `0`, `put`/`delete` → no-op); a request continua. `ERROR`: loga ERROR e relança a `RuntimeException` do backend | Lida em toda falha de `getString/getBytes/getLong/putString/putBytes/putLong/increment/delete` dos providers RESP. **Não** afeta `withLock` nem o `DefaultSeedGridCache` | Não é relocada para `quarkus.redis.*` (o relocate só mexe em nomes que começam com `quarkus.redis.`). Equivalente no crate Rust é sempre fail-soft | Runtime (relida a cada falha) | Declaração: `seedgrid-cache-core/.../commons/spi/CacheProviderFailSoft.java` → `PROP`, `level()`; default: `seedgrid-cache-core/src/main/resources/META-INF/microprofile-config.properties`. Consumo: `SeedGridCacheRedis`, `SeedGridCacheValkey`, `SeedGridCacheDragonfly` via `CacheProviderFailSoft.get/run` |

Variável de ambiente: `SEEDGRID_CACHE_IF_PROVIDER_IS_DOWN` — **Inferência** (regra MP; a lib lê o nome exato via `ConfigProvider`, então a regra de conversão do `EnvConfigSource` se aplica sem ambiguidade).

### 2.2 Fachada `seedgrid.cache.*` → `quarkus.redis.*` (alias)

Mecanismo (**Confirmado** em `SeedGridCacheConfigRelocateInterceptor#relocate` e `SeedGridCacheConfigRelocateInterceptorTest`): quando qualquer código pede `quarkus.redis.<sufixo>`, o interceptor procura primeiro `seedgrid.cache.<sufixo>`; se não houver valor, usa `quarkus.redis.<sufixo>`. Portanto **qualquer** propriedade do `quarkus-redis-client` pode ser escrita com o prefixo `seedgrid.cache.`, e `seedgrid.cache.*` tem precedência sobre `quarkus.redis.*` quando ambas existem.

Tipos, valores aceitos e padrões são os do `quarkus-redis-client` (Quarkus 3.30.8) — **não definidos pela SeedGrid**; consulte a documentação do Quarkus. As chaves abaixo são as citadas no código/testes/README da lib:

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.cache.<sufixo>` | conforme `quarkus.redis.<sufixo>` | conforme Quarkus | conforme Quarkus | Não | Alias de `quarkus.redis.<sufixo>`; vence o nome nativo | `quarkus-redis-client` (consumido pelo `RedisDataSource` injetado nos providers) | Fallback: `quarkus.redis.<sufixo>` | A da propriedade Quarkus correspondente | `seedgrid-cache-core/.../config/SeedGridCacheConfigRelocateInterceptor.java` → `relocate(String)`; registro: `META-INF/services/io.smallrye.config.ConfigSourceInterceptor` |
| `seedgrid.cache.hosts` | conforme `quarkus.redis.hosts` (URIs `redis://host:porta`) | conforme Quarkus | conforme Quarkus (sem valor, o client padrão do Quarkus é usado; dev services podem subir um servidor) | Condicional — necessária em produção quando um provider RESP está no classpath (sem ela o client não aponta para o servidor real). **Inferência** | Endereço do servidor Redis/Valkey/Dragonfly | `RedisDataSource` default | Alias de `quarkus.redis.hosts` | Runtime (Quarkus) | Testes: `SeedGridCacheConfigRelocateInterceptorTest`, `RedisAliasTestResource#start()`, `ValkeyAliasTestResource`, `DragonflyAliasTestResource`; README |
| `seedgrid.cache.password` 🔒 | conforme `quarkus.redis.password` | — | — | Condicional (servidor com AUTH) | Senha do servidor | `RedisDataSource` | Alias de `quarkus.redis.password` | Runtime (Quarkus) | `SeedGridCacheConfigRelocateInterceptorTest`; `README.md` (`${CACHE_PASSWORD:}`) |
| `seedgrid.cache.timeout` | conforme `quarkus.redis.timeout` (`Duration`, ex.: `PT5S`) | conforme Quarkus | conforme Quarkus | Não | Timeout do client | `RedisDataSource` | Alias de `quarkus.redis.timeout` | Runtime (Quarkus) | `SeedGridCacheConfigRelocateInterceptorTest`; `README.adoc` |
| `seedgrid.cache.max-pool-size` | conforme `quarkus.redis.max-pool-size` (int) | conforme Quarkus | conforme Quarkus | Não | Tamanho do pool | `RedisDataSource` | Alias de `quarkus.redis.max-pool-size` | Runtime (Quarkus) | `SeedGridCacheConfigRelocateInterceptorTest`; `README.md`, `README.adoc` |
| `seedgrid.cache.max-pool-waiting` | conforme `quarkus.redis.max-pool-waiting` (int) | conforme Quarkus | conforme Quarkus | Não | Fila de espera do pool | `RedisDataSource` | Alias de `quarkus.redis.max-pool-waiting` | Runtime (Quarkus) | `README.adoc` (sem teste) |

Variáveis de ambiente para o alias (ex.: `SEEDGRID_CACHE_HOSTS`): **Inferência** — o interceptor pede o nome exato `seedgrid.cache.hosts`, que o `EnvConfigSource` resolve pela regra MP. `QUARKUS_REDIS_HOSTS` continua funcionando como fallback. Não testado.

### 2.3 Propriedades do ciclo 2026.10.22 (NÃO PUBLICADAS)

> **Não publicado.** Entram com `seedgrid-cache` 2026.10.22. Contexto e quebras (`withLock` removido): [[SeedGrid/Extensions/cache/Ciclo-2026-10-22|Cache: ciclo 2026.10.22]].

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.cache.memory.max-entries` | int | maior que 0 | `100000` | Não | Teto de entradas da memória local (string + bytes + long). Sempre ativo: ausente ou `<= 0` volta ao padrão. Ao passar, remove expiradas e depois as menos recentemente usadas. | `DefaultSeedGridCache` | Vale também para a memória do FAILOVER | Runtime | Insumo C1 (não publicado) |
| `seedgrid.cache.memory.sweep-interval` | Duration | ISO-8601 | `PT60S` | Não | Intervalo da varredura de expirados (um agendador daemon compartilhado). | `DefaultSeedGridCache` | — | Runtime | Insumo C1 (não publicado) |
| `seedgrid.cache.failover.enabled` | boolean | `true`, `false` | `false` | Não | Liga o modo FAILOVER (equivale a `seedgrid.cache.if-provider-is-down=FAILOVER`). | `FailoverCache` | `if-provider-is-down` | Runtime | Insumo Fase 2 (não publicado) |
| `seedgrid.cache.failover.failure-threshold` | int | 1 ou mais | `1` | Não | Falhas de infraestrutura consecutivas para entrar em FAILOVER; um sucesso zera. Menor que 1 falha o boot. | `FailoverCache` | — | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.recovery-probes` | int | 1 ou mais | `3` | Não | Sondagens OK consecutivas para voltar ao provider; uma falha zera. Menor que 1 falha o boot. | `FailoverCache` | `probe-interval` | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.probe-interval` | Duration | ISO-8601 | `PT30S` | Não | Intervalo da sondagem (só com provider distribuído caído). | `FailoverCache` | — | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.journal-max-entries` | int | 1 ou mais | `10000` | Não | Máximo de entradas do journal reaplicado na volta. | `FailoverCache` | `journal-ttl` | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.journal-ttl` | Duration | ISO-8601 | `PT8H` | Não | Validade das entradas do journal. | `FailoverCache` | — | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.alert-window` | Duration | ISO-8601 | `PT15M` | Não | Janela anti-flood dos alertas de entrada e saída do FAILOVER. | `FailoverCache` | `seedgrid-notification-api` | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.failover.reminder-interval` | Duration | ISO-8601 | `PT6H` | Não | Lembrete a cada intervalo durante a queda. | `FailoverCache` | `seedgrid-notification-api` | Runtime | Insumo C2 (não publicado) |
| `seedgrid.cache.annotations.default-ttl` | Duration | `PT10M`, `500ms`, `30s`, `10m`, `2h`, `1d` | — | Sim, se uma annotation não declarar o `ttl` | TTL padrão dos caches anotados com `@SgCacheResult`. Sem TTL em nenhum nível a aplicação não sobe. | `SgCacheTtl` | `annotations.ttl.<cache>`, membro `ttl` | Boot | `SgCacheTtl` |
| `seedgrid.cache.annotations.ttl.<cache>` | Duration | idem | — | Não | TTL de um cache anotado, por nome (vence o padrão, perde para o membro `ttl`). | `SgCacheTtl` | — | Boot | `SgCacheTtl` |
| `seedgrid.cache.annotations.strict[.<cache>]` | boolean | `true`, `false` | `false` | Não | Invalidação perdida lança `CacheInvalidationFailedException` (senão só loga `ERROR`). | Interceptores `Sg` | membro `strict` | Runtime | Insumo C4 (não publicado) |
| `seedgrid.cache.key-scope` | enum | `TENANT`, `COMPANY`, `USER`, `GLOBAL` | `TENANT` | Não | Escopo padrão da chave dos caches anotados. | Interceptores `Sg` | `SecurityCacheKeyContextProvider` | Runtime | Insumo C4 (não publicado) |

## 3. Propriedades de frameworks usadas/recomendadas

| Propriedade | Situação | Origem |
|---|---|---|
| `quarkus.redis.*` | Continua aceita como fallback do alias (compatibilidade) | `SeedGridCacheConfigRelocateInterceptor` |
| `quarkus.arc.selected-alternatives` | Usada nos testes para habilitar o provider (`...SeedGridCacheRedis` etc.). Em apps normais os providers já são alternativas habilitadas por `@Priority(1)` — **Inferência** | `seedgrid-cache-*/src/test/resources/application.properties` |
| `quarkus.redis.devservices.enabled` | Desligada nos testes para provar o relocate. Também poderia ser escrita como `seedgrid.cache.devservices.enabled` pelo alias — **Inferência** (propriedade build-time; depende de o interceptor estar ativo no build, não testado) | idem |
| `quarkus.index-dependency.*` | **Não** necessária: `seedgrid-cache-core` empacota `META-INF/jandex.idx` (`jandex-maven-plugin` nos poms) | `pom.xml`; comentário em `platform-examples/examples/seedgrid-cache-example/src/main/resources/application.properties` |

## 4. Propriedades só de testes/exemplos

| Propriedade | Onde | Observação |
|---|---|---|
| `quarkus.redis.devservices.enabled=false` | `seedgrid-cache-{redis,valkey,dragonfly}/src/test/resources/application.properties` | garante que só `seedgrid.cache.hosts` configure o client |
| `quarkus.arc.selected-alternatives=<provider>` | idem | habilita o provider testado |
| `seedgrid.cache.hosts` (dinâmica, URL do container) | `*AliasTestResource#start()` | injetada pelo test resource |
| `seedgrid.cache.example.item-ttl` (`Duration`, default `PT30S` no `@ConfigProperty`) | `platform-examples/examples/seedgrid-cache-example` → `CatalogService` | **propriedade do exemplo, não da lib** (apesar do prefixo); não é relocada |

## 5. Aliases, obsoletas, renomeações

- `seedgrid.cache.<x>` ↔ `quarkus.redis.<x>` (alias, precedência para `seedgrid.cache.*`). **Confirmado.**
- Clientes nomeados: pelo código, `quarkus.redis.<nome>.hosts` também é procurado como `seedgrid.cache.<nome>.hosts` (o relocate é por prefixo). Ambos os prefixos funcionam; os providers SeedGrid usam só o client `@Default`. **Inferência** (sem teste).
- Nenhuma propriedade obsoleta encontrada.

## 6. Configuração mínima

```properties
# Com um provider RESP no classpath (seedgrid-cache-redis | -valkey | -dragonfly):
seedgrid.cache.hosts=redis://<host>:6379
```

Sem provider no classpath não é necessária nenhuma propriedade (cache in-memory).

## 7. Configuração completa comentada

```properties
# Reação a falha do backend distribuído: WARN (fail-soft, padrão) | ERROR (fail-closed, relança)
seedgrid.cache.if-provider-is-down=WARN

# --- Fachada de quarkus.redis.* (qualquer chave do quarkus-redis-client vale com este prefixo) ---
seedgrid.cache.hosts=redis://<host>:6379
seedgrid.cache.password=<SEGREDO:cache-password>
seedgrid.cache.timeout=PT5S          # exemplo de Duration ISO-8601; padrão é o do Quarkus
seedgrid.cache.max-pool-size=16      # exemplo; padrão é o do Quarkus
seedgrid.cache.max-pool-waiting=100  # exemplo; padrão é o do Quarkus
```

Os valores numéricos/Duration acima são exemplos de formato, não padrões.

## 8. Receitas

- **Dev local / instância única sem servidor**: dependa só de `seedgrid-cache-core`; nada a configurar (`DefaultSeedGridCache`).
- **Produção multi-instância com Redis**: adicione `seedgrid-cache-redis` + `seedgrid.cache.hosts` (+ `password` se houver AUTH). Trocar para Valkey/Dragonfly = trocar o artifact; a config continua a mesma.
- **Cache crítico (não pode servir dado "degradado")**: `seedgrid.cache.if-provider-is-down=ERROR` — operações relançam a exceção do backend.
- **Migração de config legada**: `quarkus.redis.*` existente continua funcionando; migre para `seedgrid.cache.*` quando quiser (o novo vence).

## 9. Dúvidas e lacunas

- **Não confirmado**: se o interceptor (registrado via `ServiceLoader`) é aplicado também na fase de build do Quarkus — relevante para chaves build-time como `devservices.*`. Os ITs só provam runtime (`hosts`).
- **Não confirmado**: comportamento de `withLock` quando o backend cai (não é envolvido por `CacheProviderFailSoft`; a exceção propaga).
- Equivalência exata com a config do crate Rust: ver [[SeedGrid/Extensions/cache/Configuracao-Rust|Configuração Rust do cache]].
