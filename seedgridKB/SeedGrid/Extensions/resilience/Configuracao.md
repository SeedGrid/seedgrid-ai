---
tags: [seedgrid, extension, resilience, configuracao]
fonte: java/seedgrid-quarkus-ext-resilience
branch: main
commit: eff41304f8
analisado-em: 2026-10-14
---

# Configuração — SeedGrid Resilience (Quarkus)

Voltar: [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral do resilience]] · [[SeedGrid/Extensions/resilience/Exemplos|Exemplos]] · [[SeedGrid/Extensions/resilience/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.ratelimit.{configKey}.*` e `seedgrid.circuitbreaker.{name}.*` (segmento dinâmico vindo da anotação) |
| Classes que leem config | `runtime/.../ratelimiter/services/RateLimitService.java` (`CONFIG_PREFIX = "seedgrid.ratelimit."`) e `runtime/.../circuitbreaker/configs/CircuitBreakerConfigResolver.java` (`CONFIG_PREFIX = "seedgrid.circuitbreaker."`) |
| Mecanismo | `org.eclipse.microprofile.config.Config` injetado por construtor + `config.getOptionalValue(prefixo + chave, Tipo.class)` com chave montada por concatenação. **Não há** `@ConfigMapping`, `@ConfigRoot`, `@ConfigProperty`, `ConfigProvider.getConfig()`, `META-INF/microprofile-config.properties` nem `application.properties` em `src/main` do runtime. O deployment (`SeedgridResilienceCoreProcessor`) só registra a feature; não há `*BuildTimeConfig`/`*RuntimeConfig` nem `@IfBuildProperty`/`@LookupIfProperty`. **Confirmado** (grep + leitura de todos os `.java`). |
| Fase | **Runtime**. Lidas **a cada invocação** do método anotado (sem cache local). **Inferência**: alterações em uma fonte de config dinâmica seriam percebidas sem reinício; com `application.properties` estático, valem do boot em diante. |
| Precedência | Atributo da anotação = padrão; property (quando a anotação tem `configKey`/`name` não vazio) = override. Sem `configKey`/`name`, **nenhuma** property é lida. |
| MicroProfile Fault Tolerance | Não usado; chaves `<classe>/<método>/<Anotação>/<param>` não têm efeito nesta extension. |

**Variáveis de ambiente (Inferência)**: as leituras são por nome exato via `Config#getOptionalValue`; a fonte de env do SmallRye procura o nome exato, depois com não alfanuméricos trocados por `_`, depois em maiúsculas. Logo `seedgrid.ratelimit.login.permits` ↔ `SEEDGRID_RATELIMIT_LOGIN_PERMITS` e `seedgrid.ratelimit.forgot-password.enabled` ↔ `SEEDGRID_RATELIMIT_FORGOT_PASSWORD_ENABLED`. Como a busca parte do nome (não da env), não há ambiguidade na leitura; mas `configKey` `forgot-password` e `forgot.password` colidiriam na mesma env. Não testado no repositório.

Legenda da coluna *Padrão*: "atributo X da anotação" significa que, sem a property, vale o valor informado na anotação; entre parênteses o default declarado na própria anotação.

## 2. Propriedades da extension

### 2.1 Rate limit — `seedgrid.ratelimit.{configKey}.*`

`{configKey}` = `SeedGridRateLimit#configKey()` (texto livre; cada valor é um limiter independente no que diz respeito à config — o contador no cache é definido pela chave `rl:...`, ver [[SeedGrid/Extensions/resilience/Visao-geral|Visão geral]]).

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.ratelimit.{configKey}.enabled` | `Boolean` | `true` \| `false` | `true` (fixo no código) | Não | `false` desliga o limiter: `tryAcquire` retorna `allow` sem tocar no cache (headers ainda emitidos com `permits`/janela da anotação se `emitHeaders=true`) | Kill switch por limiter | Só lida se `configKey` não vazio | Runtime (por chamada) | Declaração/consumo: `RateLimitService#isEnabled(String)` chamado em `#tryAcquire` |
| `seedgrid.ratelimit.{configKey}.permits` | `Long` | inteiro `> 0` (senão `IllegalArgumentException("permits must be > 0")` na chamada) | atributo `permits` da anotação (`5`) | Não | Requisições permitidas por janela; no token bucket é a taxa de reposição por janela e a capacidade quando `burst-capacity` = 0 | Ajustar limite sem recompilar | `window`; `burst-capacity` | Runtime | `RateLimitService#resolvePermits` / `#validateConfig` |
| `seedgrid.ratelimit.{configKey}.window` | `java.time.Duration` | ISO-8601 (`PT30S`, `PT1M`, `PT1H`) — confirmado pelo README e teste; outros formatos (ex.: `30s`) **não confirmado**. Deve resultar em `> 0` ms | atributo `window` × `windowUnit` (`30` × `SECONDS`) | Não | Tamanho da janela (substitui `window`+`windowUnit`); também TTL das chaves no cache | Ajustar janela | `permits` | Runtime | `RateLimitService#resolveWindowMs` |
| `seedgrid.ratelimit.{configKey}.algorithm` | `String` → `RateLimitAlgorithm` | `fixed-window`, `sliding-window`, `token-bucket` ou os nomes do enum (`FIXED_WINDOW`, `SLIDING_WINDOW`, `TOKEN_BUCKET`) — [[SeedGrid/Extensions/resilience/Enums#RateLimitAlgorithm|RateLimitAlgorithm]]; case-insensitive, `-`→`_`. Valor inválido → `IllegalArgumentException` na chamada | atributo `algorithm` (`FIXED_WINDOW`) | Não | Seleciona estratégia `FixedWindowAlgorithm` / `SlidingWindowAlgorithm` / `TokenBucketAlgorithm` | Trocar algoritmo em produção | `burst-capacity` só afeta token bucket; `min-spacing` não afeta fixed window | Runtime | `RateLimitService#resolveAlgorithm` / `#resolveStrategy` |
| `seedgrid.ratelimit.{configKey}.burst-capacity` | `Long` | `>= 0` (negativo → `IllegalArgumentException`) | atributo `burstCapacity` (`0`) | Não | Capacidade do bucket; `0` = usa `permits` | Permitir rajadas | Efetivo só com `token-bucket` | Runtime | `RateLimitService#resolveBurstCapacity`; consumo em `TokenBucketAlgorithm#doAcquire` |
| `seedgrid.ratelimit.{configKey}.min-spacing` | `java.time.Duration` | ISO-8601 (`PT1S`, `PT0.2S`); `>= 0` | atributo `minSpacing` × `minSpacingUnit` (`0` × `MILLIS`; se `minSpacing>0` mas < 1 ms, vira 1 ms) | Não | Intervalo mínimo entre chamadas permitidas da mesma chave | Anti-martelada | **Ignorado** por `FIXED_WINDOW`; aplicado por `SLIDING_WINDOW` e `TOKEN_BUCKET` | Runtime | `RateLimitService#resolveMinSpacingMs`; consumo em `SlidingWindowAlgorithm`/`TokenBucketAlgorithm` |

Atributos **somente na anotação** (sem property): `identity`, `group`, `scope`, `emitHeaders`, `configKey`, `windowUnit`, `minSpacingUnit`. **Confirmado** (`RateLimitService` não lê outras chaves).

### 2.2 Circuit breaker — `seedgrid.circuitbreaker.{name}.*`

`{name}` = `SeedGridCircuitBreaker#name()`. Sem `name`, o circuito usa a assinatura do método como nome e **nenhuma** property é lida.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.circuitbreaker.{name}.enabled` | `Boolean` | `true` \| `false` | `true` (fixo no código) | Não | `false`: interceptor chama o método direto, sem estado nem fallback | Kill switch por circuito | Só lida se `name` não vazio | Runtime (por chamada) | `CircuitBreakerConfigResolver#isEnabled`; consumo `CircuitBreakerInterceptor#around` |
| `seedgrid.circuitbreaker.{name}.sliding-window-size` | `Integer` | inteiro `> 0` (**Inferência**: 0/negativo quebraria o ring buffer; sem validação explícita) | atributo `slidingWindowSize` (`100`) | Não | Tamanho do ring buffer; em `TIME_BASED` também é a duração da janela **em segundos**. Mudar o valor descarta o estado salvo | Ajustar janela de métricas | `window-type`, `minimum-number-of-calls` | Runtime | `CircuitBreakerConfigResolver#resolve`; consumo `CacheBackedCircuitBreakerStore#addToRing/#evaluateThresholds/#deserialize` |
| `seedgrid.circuitbreaker.{name}.window-type` | `String` → `SlidingWindowType` | `count-based`, `time-based` (ou `COUNT_BASED`/`TIME_BASED`) — [[SeedGrid/Extensions/resilience/Enums#SlidingWindowType|SlidingWindowType]]; case-insensitive, `-`→`_` | atributo `windowType` (`COUNT_BASED`) | Não | Janela por contagem ou por tempo | Escolher semântica da janela | `sliding-window-size` | Runtime | `CircuitBreakerConfigResolver#resolve`; consumo `CacheBackedCircuitBreakerStore#evaluateThresholds` |
| `seedgrid.circuitbreaker.{name}.failure-rate-threshold` | `Double` | percentual (0–100; sem validação) | atributo `failureRateThreshold` (`50.0`) | Não | Abre quando `falhas*100/total >= valor` | Sensibilidade a falhas | `minimum-number-of-calls` | Runtime | `CircuitBreakerConfigResolver#resolve`; `CacheBackedCircuitBreakerStore#evaluateThresholds` |
| `seedgrid.circuitbreaker.{name}.slow-call-duration` | `java.time.Duration` | ISO-8601 (`PT2S`) | atributo `slowCallDurationThresholdMs` (`0` = desligado) | Não | Chamada com duração `>=` valor conta como lenta; `0` desativa a regra de lentidão | Detectar degradação | Necessária (>0) para `slow-call-rate-threshold` ter efeito | Runtime | `CircuitBreakerConfigResolver#resolve` (→ `slowCallDurationThresholdMs`); `CacheBackedCircuitBreakerStore#doRecord/#evaluateThresholds` |
| `seedgrid.circuitbreaker.{name}.slow-call-rate-threshold` | `Double` | percentual (0–100) | atributo `slowCallRateThreshold` (`100.0`) | Condicional (só tem efeito se `slow-call-duration` > 0) | Abre quando `lentas*100/total >= valor` | Abrir por lentidão | `slow-call-duration` | Runtime | `CircuitBreakerConfigResolver#resolve`; `CacheBackedCircuitBreakerStore#evaluateThresholds` |
| `seedgrid.circuitbreaker.{name}.minimum-number-of-calls` | `Integer` | inteiro `>= 0` | atributo `minimumNumberOfCalls` (`20`) | Não | Mínimo de chamadas na janela antes de avaliar thresholds | Evitar abrir com amostra pequena | Se > `sliding-window-size`, o circuito nunca abre (**Inferência**: `totalFilled` ≤ tamanho do buffer) | Runtime | `CircuitBreakerConfigResolver#resolve`; `CacheBackedCircuitBreakerStore#evaluateThresholds` |
| `seedgrid.circuitbreaker.{name}.open-state-duration` | `java.time.Duration` | ISO-8601 (`PT30S`) | atributo `openStateDurationMs` (`30000` ms) | Não | Tempo em `OPEN` antes de ir a `HALF_OPEN`; base do `retryAfterMs`; TTL do estado = `max(2×valor, 1h)` | Tempo de recuperação | `permitted-calls-in-half-open` | Runtime | `CircuitBreakerConfigResolver#resolve`; `CacheBackedCircuitBreakerStore#doAllowCall/#save` |
| `seedgrid.circuitbreaker.{name}.permitted-calls-in-half-open` | `Integer` | inteiro `> 0` | atributo `permittedCallsInHalfOpen` (`10`) | Não | Nº de sondas em `HALF_OPEN`; todas precisam ter sucesso para fechar | Recuperação gradual | `open-state-duration` | Runtime | `CircuitBreakerConfigResolver#resolve`; `CacheBackedCircuitBreakerStore#doAllowCall/#doRecord` |

Atributos **somente na anotação**: `recordExceptions` (default `{Exception.class}`), `ignoreExceptions` (default `{}`), `fallbackMethod` (default `""`), `name`. **Confirmado** (Javadoc de `CircuitBreakerConfigResolver` e código).

Total de propriedades públicas da extension: **15** (6 rate limit + 9 circuit breaker), todas com segmento dinâmico.

## 3. Propriedades de frameworks/bibliotecas

| Propriedade | Situação | Observação | Origem |
|---|---|---|---|
| `quarkus.redis.hosts` | Recomendada (quando usar `seedgrid-cache-redis`) | Conexão do Redis usado pelo provider de cache | `README.adoc` § "Configuração do Redis" |
| `quarkus.redis.password` 🔒 | Recomendada (se o Redis exigir) | Use `<SEGREDO:redis-password>` | `README.adoc` |
| `quarkus.redis.timeout` | Opcional | Exemplo no README: `PT5S` | `README.adoc` |
| `quarkus.redis.max-pool-size` | Opcional | Exemplo no README: `10` | `README.adoc` |

A extension não define nem exige nenhuma propriedade `quarkus.*`/`mp.*`/`smallrye.*` em código. A seleção/configuração do provider de cache (Redis/Valkey/Dragonfly) pertence à lib cache — ver [[SeedGrid/Extensions/cache/Configuracao|Configuração do cache]].

## 4. Propriedades usadas só em testes

Nenhum `application.properties` com conteúdo (o de `integration-tests/src/main/resources` está vazio). Os testes unitários mockam `Config` com estas chaves (instâncias das propriedades da seção 2):

| Chave | Teste |
|---|---|
| `seedgrid.ratelimit.checkout.permits`, `.enabled`, `.window`, `.algorithm` (`token-bucket`), `.burst-capacity` | `runtime/src/test/.../RateLimitServiceConfigOverrideTest` |
| `seedgrid.circuitbreaker.payments.enabled`, `.sliding-window-size`, `.window-type` (`time-based`), `.failure-rate-threshold`, `.slow-call-duration`, `.slow-call-rate-threshold`, `.minimum-number-of-calls`, `.open-state-duration`, `.permitted-calls-in-half-open` | `runtime/src/test/.../CircuitBreakerConfigResolverTest` |

Os ITs (`RedisTestBase`) montam o Redis via Testcontainers programaticamente (sem properties).

## 5. Aliases, obsoletas, renomeações

- `algorithm` e `window-type` aceitam tanto kebab-case quanto o nome do enum (normalização `trim().toUpperCase().replace('-', '_')`). **Confirmado**.
- `window`/`min-spacing`/`slow-call-duration`/`open-state-duration` substituem pares da anotação (`window`+`windowUnit`, `minSpacing`+`minSpacingUnit`, `slowCallDurationThresholdMs`, `openStateDurationMs`) — nomes diferentes entre anotação e property.
- Nenhuma propriedade obsoleta encontrada.

## 6. Configuração mínima

Nenhuma property é obrigatória: as anotações já trazem os valores. Para estado compartilhado entre instâncias, adicione um provider de cache distribuído e sua conexão:

```properties
# Provider seedgrid-cache-redis no classpath
quarkus.redis.hosts=redis://<host>:6379
quarkus.redis.password=<SEGREDO:redis-password>
```

## 7. Configuração completa comentada

```properties
# ===== Rate limit: um bloco por configKey usado em @SeedGridRateLimit(configKey = "...") =====
# liga/desliga o limiter (padrão true)
seedgrid.ratelimit.<configKey>.enabled=true
# requisições por janela (> 0)
seedgrid.ratelimit.<configKey>.permits=<n>
# janela ISO-8601 (> 0), ex.: PT1M
seedgrid.ratelimit.<configKey>.window=<duration>
# fixed-window | sliding-window | token-bucket
seedgrid.ratelimit.<configKey>.algorithm=<algoritmo>
# capacidade do bucket (>= 0; 0 = usa permits) — só token-bucket
seedgrid.ratelimit.<configKey>.burst-capacity=<n>
# intervalo mínimo entre chamadas (ISO-8601) — ignorado em fixed-window
seedgrid.ratelimit.<configKey>.min-spacing=<duration>

# ===== Circuit breaker: um bloco por name usado em @SeedGridCircuitBreaker(name = "...") =====
# liga/desliga o circuito (padrão true)
seedgrid.circuitbreaker.<name>.enabled=true
# tamanho da janela (nº de chamadas; em time-based também = segundos)
seedgrid.circuitbreaker.<name>.sliding-window-size=<n>
# count-based | time-based
seedgrid.circuitbreaker.<name>.window-type=<tipo>
# % de falhas para abrir
seedgrid.circuitbreaker.<name>.failure-rate-threshold=<percentual>
# duração a partir da qual a chamada é lenta (ISO-8601); omitir/0 desliga
seedgrid.circuitbreaker.<name>.slow-call-duration=<duration>
# % de chamadas lentas para abrir (exige slow-call-duration > 0)
seedgrid.circuitbreaker.<name>.slow-call-rate-threshold=<percentual>
# mínimo de chamadas antes de avaliar
seedgrid.circuitbreaker.<name>.minimum-number-of-calls=<n>
# tempo aberto antes do half-open (ISO-8601)
seedgrid.circuitbreaker.<name>.open-state-duration=<duration>
# sondas no half-open
seedgrid.circuitbreaker.<name>.permitted-calls-in-half-open=<n>

# ===== Cache distribuído (lib seedgrid-cache-redis) =====
quarkus.redis.hosts=redis://<host>:6379
quarkus.redis.password=<SEGREDO:redis-password>
```

## 8. Receitas

**Desligar um limiter em produção** (método com `configKey = "forgot-password"`):
```properties
seedgrid.ratelimit.forgot-password.enabled=false
```

**Afrouxar o login temporariamente** (`configKey = "login"`):
```properties
seedgrid.ratelimit.login.permits=200
seedgrid.ratelimit.login.window=PT30S
```

**Trocar para token bucket com rajada e espaçamento** (`configKey = "export-create"`):
```properties
seedgrid.ratelimit.export-create.algorithm=token-bucket
seedgrid.ratelimit.export-create.burst-capacity=3
seedgrid.ratelimit.export-create.min-spacing=PT1S
```

**Circuito mais sensível, com detecção de lentidão** (`name = "payments"`):
```properties
seedgrid.circuitbreaker.payments.failure-rate-threshold=25
seedgrid.circuitbreaker.payments.minimum-number-of-calls=5
seedgrid.circuitbreaker.payments.slow-call-duration=PT2S
seedgrid.circuitbreaker.payments.slow-call-rate-threshold=80
seedgrid.circuitbreaker.payments.open-state-duration=PT10S
```

**Janela por tempo de 20 s**:
```properties
seedgrid.circuitbreaker.payments.window-type=time-based
seedgrid.circuitbreaker.payments.sliding-window-size=20
```

## 9. Dúvidas e lacunas

- Formatos de `Duration` além de ISO-8601 (ex.: `30s`): dependem do conversor registrado no Quarkus; **não confirmado** nesta extension.
- Variáveis de ambiente: mapeamento descrito é **Inferência** (regra SmallRye), sem teste no repositório.
- Sem validação no boot: chaves com erro de digitação são silenciosamente ignoradas; valores inválidos (`algorithm`, `window-type`, `permits<=0`) só falham na chamada.
- `sliding-window-size` e `permitted-calls-in-half-open` não têm validação de positivo.
- Não há propriedade global (ex.: desligar todos os limiters ou escolher store) — apenas por `configKey`/`name`.
