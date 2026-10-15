---
tags: [seedgrid, library, commons, configuracao]
fonte: java/seedgrid-quarkus-lib-commons
branch: main
commit: fa49c344db
analisado-em: 2026-10-14
---

# SeedGrid Commons — Configuração

Voltar: [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]] · [[SeedGrid/Extensions/commons/Exemplos|Exemplos do commons]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos | `seedgrid.app.*`, `seedgrid.web.cors.*`, `seedgrid.show-dev-message`, `app.build.version` (sem prefixo `seedgrid`) |
| Classes de config | Nenhuma `@ConfigMapping`/`@ConfigRoot`. `@ConfigProperty` em beans CDI: `BusinessTimeZone`, `CorsConfig`, `ApiExceptionHandler`, `StartupBannerLogger`. `ConfigProvider` em `ValidEmailValidator` (só lê `quarkus.profile`) |
| Arquivos de config da lib | Nenhum (`src/main/resources` não existe; sem `microprofile-config.properties`) |
| Fase | Runtime — valores injetados na criação de cada bean (`@ApplicationScoped`: na primeira utilização; `StartupBannerLogger`: no `StartupEvent`). Não há releitura posterior |

Investigado: `@ConfigMapping`, `@ConfigRoot`, `@ConfigProperty`, `ConfigProvider`, `System.getenv/getProperty`, `@IfBuildProperty`/`@LookupIfProperty`, resources. Nenhum teste da lib define propriedades (testes unitários instanciam as classes diretamente).

## 2. Propriedades próprias

### 2.1 Fuso de negócio

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.app.business-timezone` | `String` → `ZoneId` | qualquer ID aceito por `ZoneId.of` (ex.: `America/Sao_Paulo`, `UTC`) | `America/Sao_Paulo` | Não | Valor vazio **ou inválido** cai silenciosamente para `America/Sao_Paulo` (sem log) | `BusinessTimeZone#zoneId()` — converter instantes em datas civis (ciclos de cobrança/consumo) | Consumido por extensions que injetam `BusinessTimeZone` (ex.: billing — **Inferência** pelo Javadoc) | Runtime (construtor do bean) | `java/seedgrid-quarkus-lib-commons/src/main/java/br/com/seedgrid/commons/core/time/BusinessTimeZone.java` → construtor + `resolve(String)` |

### 2.2 CORS (`CorsFilter`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.web.cors.allow-origins` | `List<String>` (separada por vírgula) | origens exatas (`esquema://host[:porta]`); comparação por igualdade exata, sem curinga | `http://localhost:3000,http://localhost:4200` | Não (mas em produção o padrão só libera localhost) | Preflight `OPTIONS` de origem fora da lista → **403**; requisição não-preflight de origem fora da lista segue sem headers CORS; origem `"null"` → 403 sempre | `CorsFilter#filter(request)` e `#filter(request, response)` via `CorsConfig#getAllowOrigins()` | Independente de `quarkus.http.cors.*` (interação não verificada) | Runtime | `.../commons/web/cors/CorsConfig.java` → campo `allowOrigins`; consumo `.../web/cors/CorsFilter.java` |
| `seedgrid.web.cors.allow-methods` | `String` | lista de métodos HTTP separada por vírgula (copiada literalmente no header) | `GET,POST,PUT,PATCH,DELETE,OPTIONS` | Não | Valor de `Access-Control-Allow-Methods` na resposta ao preflight; **não** é usado para bloquear métodos | `CorsFilter#filter(request)` (preflight) via `CorsConfig#getAllowMethods()` | — | Runtime | `CorsConfig.java` → campo `allowMethods` |

Headers fixos (não configuráveis): `Access-Control-Allow-Headers`, `Access-Control-Allow-Credentials: true`, `Access-Control-Max-Age: 0`, `Access-Control-Expose-Headers: Location,Link`. **Confirmado.**

### 2.3 Tratamento de exceções

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.show-dev-message` | `boolean` | `true`/`false` | `false` | Não | `true` preenche `devMessage` no Problem Details (mensagem técnica da exceção / violações); `false` devolve `devMessage` vazio. Valor é logado em INFO na criação do handler | `ApiExceptionHandler#resolveDevMessage` (todas as respostas do handler, inclusive via `ConstraintViolationExceptionMapper`) | Recomendado `false` em produção (evita vazar detalhes) — **Inferência** | Runtime | `.../commons/web/exceptions/ApiExceptionHandler.java` → construtor |

### 2.4 Banner de inicialização

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `app.build.version` | `String` | livre | `dev` | Não | Impresso em `System.out` como `Versao: <valor>` após o `banner.txt` do classpath (se existir) | `StartupBannerLogger#onStart(StartupEvent)` | Convenção dos hosts: `app.build.version=${APP_VERSION:dev}` (comentário no código) | Runtime (startup) | `.../commons/core/startup/StartupBannerLogger.java` → campo `buildVersion` |

Variáveis de ambiente pela regra MP (**Inferência**, nomes sem ambiguidade na leitura por nome exato): `SEEDGRID_APP_BUSINESS_TIMEZONE`, `SEEDGRID_WEB_CORS_ALLOW_ORIGINS`, `SEEDGRID_WEB_CORS_ALLOW_METHODS`, `SEEDGRID_SHOW_DEV_MESSAGE`, `APP_BUILD_VERSION`.

## 3. Propriedades de frameworks lidas

| Propriedade | Como é lida | Efeito | Origem |
|---|---|---|---|
| `quarkus.profile` | Ordem: system property `quarkus.profile` → env `QUARKUS_PROFILE` (lida diretamente via `System.getenv`) → `ConfigProvider` | `@ValidEmail` bloqueia domínios descartáveis (lista fixa no código: yopmail, mailinator, 10minutemail etc.) **somente** se `LaunchMode.current() == NORMAL` **e** o perfil for `prod` ou não estiver definido | `.../core/validators/ValidEmailValidator.java` → `shouldBlockDisposableDomains()`, `resolveNormalProfile()` |

A lib também precisa, no host, de Hibernate ORM configurado se usar `BaseEntity`/embeddables, e de `quarkus-rest-jackson` (dependência *optional* aqui) para `CorsFilter`/`ApiExceptionHandler` — **Inferência** pelo escopo `optional` no pom.

## 4. Propriedades só de testes/exemplos

Nenhuma (os testes não usam `application.properties`).

## 5. Aliases, obsoletas, renomeações

Nenhuma encontrada.

## 6. Configuração mínima

Nenhuma propriedade é obrigatória. Para produção, o mínimo sensato:

```properties
seedgrid.web.cors.allow-origins=https://<app.seudominio>
```

## 7. Configuração completa comentada

```properties
# Fuso usado para converter instantes em datas civis (ZoneId válido; inválido volta ao padrão)
seedgrid.app.business-timezone=America/Sao_Paulo

# CORS do CorsFilter da lib (origens exatas, separadas por vírgula)
seedgrid.web.cors.allow-origins=https://<app.seudominio>,https://<admin.seudominio>
seedgrid.web.cors.allow-methods=GET,POST,PUT,PATCH,DELETE,OPTIONS

# Expor detalhes técnicos em devMessage do Problem Details (padrão false)
seedgrid.show-dev-message=false

# Versão exibida no banner de startup (padrão "dev")
app.build.version=${APP_VERSION:dev}
```

## 8. Receitas

- **Front em outro domínio**: liste a origem exata em `seedgrid.web.cors.allow-origins` (inclua porta em dev).
- **Depurar erros 500 em dev**: `%dev.seedgrid.show-dev-message=true` (perfil MP) e mantenha `false` em prod.
- **Operação fora do Brasil**: `seedgrid.app.business-timezone=<ZoneId>`.
- **Aceitar e-mails descartáveis em homologação**: rode com `quarkus.profile` ≠ `prod` (ex.: `QUARKUS_PROFILE=staging`).

## 9. Dúvidas e lacunas

- Valor inválido de `seedgrid.app.business-timezone` é ignorado sem aviso — risco de configuração silenciosa.
- Interação entre `CorsFilter` e `quarkus.http.cors` não documentada/testada.
- A lib depende de `seedgrid-privacy`; as propriedades `seedgrid.privacy.*` afetam `Address`/`Contact`, mas pertencem à lib privacy: [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]].
