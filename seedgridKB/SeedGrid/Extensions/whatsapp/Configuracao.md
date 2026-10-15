---
tags: [seedgrid, extension, whatsapp, configuracao]
fonte: java/seedgrid-quarkus-ext-whatsapp
branch: main
commit: d8454f6313
analisado-em: 2026-10-14
---

# Configuração — seedgrid-whatsapp (Quarkus)

Voltar: [[SeedGrid/Extensions/whatsapp/Visao-geral|Visão geral do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Exemplos|Exemplos do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Configuracao-Rust|Configuração do porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.whatsapp` |
| Classes de config | `WhatsAppConfig` (só `api`) e `WhatsAppProviderConfig` (`evolution`, `cloud`, `rest-client`) — **duas** interfaces `@ConfigMapping` com o **mesmo** prefixo |
| Mecanismo | `@ConfigMapping` (SmallRye) + `@ConfigRoot(phase = ConfigPhase.RUN_TIME)` |
| Fase | Runtime (todas) |
| Defaults embutidos | `seedgrid-whatsapp-core/src/main/resources/META-INF/microprofile-config.properties` (ordinal 100; o `application.properties` do app sobrescreve) |
| Ponte para o Rest Client | `application.properties` dentro dos jars `seedgrid-whatsapp-evolution` e `seedgrid-whatsapp-whatsapp-cloud` mapeiam `quarkus.rest-client.<configKey>.url` para as propriedades `seedgrid.whatsapp.rest-client.*` |
| Seleção de bean | `@LookupIfProperty(name = "seedgrid.whatsapp.api", stringValue = ...)` em `EvolutionWhatsAppApi` e `OfficialCloudWhatsAppApi` + `WhatsAppApiProducer#produce()` |

Arquivos de declaração (caminhos relativos a `seedgrid-platform`):
- `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/java/br/com/seedgrid/whatsapp/configs/WhatsAppConfig.java`
- `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/java/br/com/seedgrid/whatsapp/configs/WhatsAppProviderConfig.java`
- `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/resources/META-INF/microprofile-config.properties`

Não há `*BuildTimeConfig` no deployment (`WhatsAppCoreProcessor` não lê config) nem `@ConfigProperty`/`ConfigProvider` no código de produção (**Confirmado** por busca).

## 2. Propriedades da extension

Abreviações de origem: `core/…` = `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/…`; `evo/…` = `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-evolution/src/main/…`; `cloud/…` = `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-whatsapp-cloud/src/main/…`.

### 2.1 Seleção do provider

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.whatsapp.api` | `String` | `default`, `evolution`, `whatsapp-cloud` (enum [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppProvider\|WhatsAppProvider]]: `DEFAULT`, `EVOLUTION`, `OFFICIAL`) | `default` (`@WithDefault("default")`; também `${SEEDGRID_WHATSAPP_API:default}` no `microprofile-config.properties`) | Não | `WhatsAppProvider.fromConfig` faz `trim().toLowerCase()`; valor vazio ou desconhecido vira `DEFAULT`. `DEFAULT` → `DefaultWhatsAppApi` (só registra WARNING e devolve resultado vazio). `evolution`/`whatsapp-cloud` → bean do provider **se** resolvível via `Instance` (módulo no classpath e `@LookupIfProperty` casando); senão cai no `DefaultWhatsAppApi` silenciosamente (**Confirmado**). | Escolher o provider injetado em `WhatsAppApi` | Ativa `@LookupIfProperty` de `EvolutionWhatsAppApi` (`evolution`) e `OfficialCloudWhatsAppApi` (`whatsapp-cloud`). **Inferência:** `@LookupIfProperty` compara o texto exato, então `Evolution`/` evolution ` seria aceito pelo `fromConfig` mas não pelo lookup → fallback para Default. | Runtime | Decl.: `core/java/.../configs/WhatsAppConfig.java` → `WhatsAppConfig#api()`; consumo: `core/java/.../services/WhatsAppApiProducer.java` → `produce()`, `core/java/.../enums/WhatsAppProvider.java` → `fromConfig`, `evo/java/.../services/EvolutionWhatsAppApi.java` (`@LookupIfProperty`), `cloud/java/.../services/OfficialCloudWhatsAppApi.java` (`@LookupIfProperty`) |

### 2.2 Provider Evolution API

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.whatsapp.evolution.api-key` 🔒 | `Optional<String>` | texto não vazio | — (no `microprofile-config.properties`: `${SEEDGRID_WHATSAPP_EVOLUTION_API_KEY:}`, ou seja vazio) | Condicional: obrigatória quando `api=evolution` | Lida a cada chamada por `requireApiKey()`; vazia/ausente → `IllegalStateException("Missing required config 'seedgrid.whatsapp.evolution.api-key' for provider 'evolution'.")` no momento da chamada (não no boot). Enviada no header HTTP `apikey`. | Autenticação na Evolution API | Só tem efeito com `seedgrid.whatsapp.api=evolution` (ou injeção direta de `EvolutionWhatsAppApi`) | Runtime | Decl.: `core/java/.../configs/WhatsAppProviderConfig.java` → `Evolution#apiKey()`; consumo: `evo/java/.../services/EvolutionWhatsAppApi.java` → `requireApiKey()`; header em `evo/java/.../clients/EvolutionRestClient.java` (`@HeaderParam("apikey")`) |
| `seedgrid.whatsapp.rest-client.evolution.url` | `Optional<String>` | URL base da Evolution (ex.: `https://<host-evolution>`) | — (no `microprofile-config.properties`: `${SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL:}`, vazio) | Condicional: obrigatória quando `api=evolution` | Funciona via ponte: é consumida pela expressão `quarkus.rest-client.evolution.url=${seedgrid.whatsapp.rest-client.evolution.url:}` do `application.properties` do jar evolution, que define a base do `EvolutionRestClient` (`configKey = "evolution"`). **Inferência:** sem URL, o Rest Client falha ao ser criado/usado (mensagem do Quarkus sobre base URL ausente). | URL base do `EvolutionRestClient` | Alimenta `quarkus.rest-client.evolution.url` (ver seção 3) | Runtime | Decl.: `core/java/.../configs/WhatsAppProviderConfig.java` → `RestClient.EvolutionRest#url()`; ponte: `evo/resources/application.properties`; consumo: `evo/java/.../clients/EvolutionRestClient.java` (`@RegisterRestClient(configKey = "evolution")`) |

### 2.3 Provider WhatsApp Cloud API (Meta Graph API)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.whatsapp.cloud.access-token` 🔒 | `Optional<String>` | token de acesso da Graph API | — (no `microprofile-config.properties`: `${SEEDGRID_WHATSAPP_CLOUD_ACCESS_TOKEN:}`, vazio) | Condicional: obrigatória quando `api=whatsapp-cloud` | Lida a cada chamada por `bearer()`; vazia/ausente → `IllegalStateException("Missing required config 'seedgrid.whatsapp.cloud.access-token' for provider 'whatsapp-cloud'.")`. Enviada como `Authorization: Bearer <token>`. | Autenticação na Graph API | Só com `seedgrid.whatsapp.api=whatsapp-cloud` | Runtime | Decl.: `core/java/.../configs/WhatsAppProviderConfig.java` → `Cloud#accessToken()`; consumo: `cloud/java/.../clients/services/OfficialCloudWhatsAppApi.java` → `bearer()`; header em `cloud/java/.../clients/CloudRestClient.java` (`@HeaderParam("Authorization")`) |
| `seedgrid.whatsapp.rest-client.cloud.url` | `String` | URL base da Graph API com versão | `https://graph.facebook.com/v21.0` (`@WithDefault` e `${SEEDGRID_WHATSAPP_REST_CLIENT_CLOUD_URL:https://graph.facebook.com/v21.0}`) | Não | Funciona via ponte: é consumida por `quarkus.rest-client.cloud.url=${seedgrid.whatsapp.rest-client.cloud.url:}` no jar cloud. Endpoints usados: `POST /{phoneNumberId}/messages` e `POST /{phoneNumberId}/media`. | URL base do `CloudRestClient` | Alimenta `quarkus.rest-client.cloud.url` (ver seção 3) | Runtime | Decl.: `core/java/.../configs/WhatsAppProviderConfig.java` → `RestClient.CloudRest#url()`; ponte: `cloud/resources/application.properties`; consumo: `cloud/java/.../clients/CloudRestClient.java` (`@RegisterRestClient(configKey = "cloud")`) |

### Variáveis de ambiente

O `microprofile-config.properties` do core lê explicitamente estas variáveis (via expressão `${ENV:padrão}`) — **Confirmado**:

| Propriedade | Variável lida |
|---|---|
| `seedgrid.whatsapp.api` | `SEEDGRID_WHATSAPP_API` |
| `seedgrid.whatsapp.rest-client.evolution.url` | `SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL` |
| `seedgrid.whatsapp.evolution.api-key` 🔒 | `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY` |
| `seedgrid.whatsapp.rest-client.cloud.url` | `SEEDGRID_WHATSAPP_REST_CLIENT_CLOUD_URL` |
| `seedgrid.whatsapp.cloud.access-token` 🔒 | `SEEDGRID_WHATSAPP_CLOUD_ACCESS_TOKEN` |

Os mesmos nomes também resultam da regra MicroProfile (env source, ordinal 300). Um `application.properties` do app (ordinal 250) que defina a propriedade explicitamente vence a expressão do `microprofile-config.properties` (ordinal 100), mas perde para a env var pela regra padrão.

## 3. Propriedades de framework (quarkus.*)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `quarkus.rest-client.evolution.url` | `String` | URL | `${seedgrid.whatsapp.rest-client.evolution.url:}` (definido pela lib) | Condicional (provider evolution) | Base URL do `EvolutionRestClient`. A lib define a ponte; o app pode sobrescrever diretamente. | Rest Client Evolution | Derivada de `seedgrid.whatsapp.rest-client.evolution.url` | Runtime | `evo/resources/application.properties`; `EvolutionRestClient` |
| `quarkus.rest-client.cloud.url` | `String` | URL | `${seedgrid.whatsapp.rest-client.cloud.url:}` (definido pela lib) | Não (herda default `https://graph.facebook.com/v21.0`) | Base URL do `CloudRestClient`. | Rest Client Cloud | Derivada de `seedgrid.whatsapp.rest-client.cloud.url` | Runtime | `cloud/resources/application.properties`; `CloudRestClient` |

Observações:
- **Inferência:** a ponte depende de o Quarkus carregar `application.properties` presentes em jars de dependência (o SmallRye carrega todos os recursos `application.properties` do classpath com ordinal 250). Se o app também tiver `quarkus.rest-client.evolution.url`, há duas fontes com o mesmo ordinal — prefira definir `seedgrid.whatsapp.rest-client.*` e não a chave `quarkus.*` diretamente, ou defina ambas com o mesmo valor. Não confirmado em execução.
- Demais chaves `quarkus.rest-client.evolution.*` / `quarkus.rest-client.cloud.*` (timeouts, `scope`, proxy etc.) são do Quarkus e não são definidas pela lib; o teste usa `quarkus.rest-client.evolution.scope=jakarta.inject.Singleton` (seção 4).
- O deployment (`WhatsAppCoreProcessor`) apenas registra a feature `seedgrid-whatsapp-core`, indexa `seedgrid-whatsapp-evolution` e `seedgrid-whatsapp-whatsapp-cloud` e registra `DefaultWhatsAppApi`/`WhatsAppApiProducer` como beans não removíveis — não lê config.

## 4. Propriedades usadas só em testes

Fonte: `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-evolution/src/test/resources/application.properties` e testes em `seedgrid-whatsapp-evolution/src/test/java`. Valores reais (URL do servidor, chave, instância) existem commitados no repositório e **não** são reproduzidos aqui.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `evolution.api.key` 🔒 | `String` | chave | — | Sim (nos ITs) | Injetada por `@ConfigProperty` | `EvolutionRestClientIT` chama o Rest Client diretamente com a chave | Duplicada de `seedgrid.whatsapp.evolution.api-key` | Runtime (teste) | `src/test/.../clients/EvolutionRestClientIT.java` |
| `evolution.instance.name` | `String` | nome de instância | — | Sim (nos ITs) | Injetada por `@ConfigProperty` | Instância alvo dos ITs | — | Runtime (teste) | `EvolutionRestClientIT`, `src/test/.../services/EvolutionWhatsAppApiIT.java` |
| `evolution.live` (system property) | `boolean` | `true` | — | Condicional | `@EnabledIfSystemProperty(named = "evolution.live", matches = "true")` habilita `EvolutionRestClientIT` | Liga testes contra servidor real | — | Execução de teste | `EvolutionRestClientIT` |
| `quarkus.rest-client.evolution.scope` | `String` | escopo CDI | — | Não | Define `jakarta.inject.Singleton` para o client nos testes | — | — | Runtime (teste) | `src/test/resources/application.properties` |
| `quarkus.log.level` | `String` | nível de log | — | Não | `INFO` nos testes | — | — | Runtime (teste) | idem |
| `quarkus.log.category."br.com.seedgrid.whatsapp".level` | `String` | nível de log | — | Não | `DEBUG` nos testes | — | — | Runtime (teste) | idem |

O mesmo arquivo de teste também define `seedgrid.whatsapp.api=evolution`, `seedgrid.whatsapp.rest-client.evolution.url` e `seedgrid.whatsapp.evolution.api-key` (propriedades públicas da seção 2). `EvolutionWhatsAppApiIT` lê `quarkus.rest-client.evolution.url` via `@ConfigProperty` e **não** tem guarda `@EnabledIf…`; como o surefire usa os includes padrão (`*Test`, `Test*`, `*Tests`, `*TestCase`), classes `*IT` não rodam em `mvn test` sem `-Dtest=...` (**Inferência** — o pom não customiza includes).

## 5. Aliases, obsoletas, renomeações

- Nenhum alias declarado (sem `@WithName` alternativo nem fallback de chave).

## 6. Configuração mínima

Evolution:
```properties
seedgrid.whatsapp.api=evolution
seedgrid.whatsapp.rest-client.evolution.url=<URL-DA-EVOLUTION-API>
seedgrid.whatsapp.evolution.api-key=<SEGREDO:evolution-api-key>
```

WhatsApp Cloud (Meta):
```properties
seedgrid.whatsapp.api=whatsapp-cloud
seedgrid.whatsapp.cloud.access-token=<SEGREDO:whatsapp-cloud-access-token>
# seedgrid.whatsapp.rest-client.cloud.url já tem padrão https://graph.facebook.com/v21.0
```

## 7. Configuração completa comentada

```properties
# Provider usado por WhatsAppApi: default | evolution | whatsapp-cloud
# default (padrão) = DefaultWhatsAppApi, que só loga WARNING e não envia nada.
seedgrid.whatsapp.api=evolution

# --- Evolution API (necessário o jar seedgrid-whatsapp-evolution) ---
# URL base; repassada para quarkus.rest-client.evolution.url pela própria lib. Sem padrão.
seedgrid.whatsapp.rest-client.evolution.url=<URL-DA-EVOLUTION-API>
# Enviada no header "apikey". Sem padrão; ausente => IllegalStateException na chamada.
seedgrid.whatsapp.evolution.api-key=<SEGREDO:evolution-api-key>

# --- WhatsApp Cloud API (necessário o jar seedgrid-whatsapp-whatsapp-cloud) ---
# URL base da Graph API. Padrão: https://graph.facebook.com/v21.0
seedgrid.whatsapp.rest-client.cloud.url=https://graph.facebook.com/v21.0
# Enviado como "Authorization: Bearer ...". Sem padrão; ausente => IllegalStateException na chamada.
seedgrid.whatsapp.cloud.access-token=<SEGREDO:whatsapp-cloud-access-token>

# --- Opcional: ajustes do Quarkus Rest Client (chaves do framework) ---
# quarkus.rest-client.evolution.scope=jakarta.inject.Singleton
```

## 8. Receitas

- **Desligar envio (dev/local):** não defina `seedgrid.whatsapp.api` (ou use `default`). Toda chamada de `WhatsAppApi` loga `DefaultWhatsAppApi invoked: ... Configure seedgrid.whatsapp.api to enable a provider.` e retorna `WhatsAppSendMessageResultDTO.empty()`.
- **Evolution self-hosted:** dependências `seedgrid-whatsapp-core` + `seedgrid-whatsapp-evolution`; configuração mínima Evolution acima. Use `channelId` = nome da instância Evolution. Gestão de instância/grupos/labels/chat via interfaces específicas (ver [[SeedGrid/Extensions/whatsapp/Exemplos|Exemplos]]).
- **Meta Cloud API:** dependências `seedgrid-whatsapp-core` + `seedgrid-whatsapp-whatsapp-cloud`; `channelId` = `PHONE_NUMBER_ID` (README). Para fixar outra versão da Graph API, altere `seedgrid.whatsapp.rest-client.cloud.url` (ex.: `https://graph.facebook.com/v<versão>`).
- **Segredos por ambiente:** exporte `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY` / `SEEDGRID_WHATSAPP_CLOUD_ACCESS_TOKEN` em vez de gravar no `application.properties`.

## 9. Dúvidas e lacunas

- As URLs `seedgrid.whatsapp.rest-client.*` chegam ao Rest Client exclusivamente pela ponte no `application.properties` dos jars de provider (o Quarkus carrega `application.properties` de todo o classpath; o próprio `EvolutionRestClientIT` configura só a chave `seedgrid.whatsapp.*`). Para sobrescrever, o host pode definir a chave `seedgrid.whatsapp.rest-client.*` ou diretamente `quarkus.rest-client.<configKey>.url`.
- Valores com maiúsculas/espaços em `seedgrid.whatsapp.api` são normalizados pelo producer mas não pelo `@LookupIfProperty` (Inferência) → fallback silencioso para `DefaultWhatsAppApi`.
- Não há validação no boot: credenciais ausentes só falham na primeira chamada (`IllegalStateException`).
- Mapeamento para o crate Rust: ver [[SeedGrid/Extensions/whatsapp/Configuracao-Rust|Configuração do porte Rust]].
