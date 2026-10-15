---
tags: [seedgrid, extension, apikeys, configuracao]
fonte: java/seedgrid-quarkus-ext-apikeys
branch: main
commit: bfc9c25877
analisado-em: 2026-10-14
---

# API Keys (Quarkus) — configuração

Voltar: [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral do apikeys]] · [[SeedGrid/Extensions/apikeys/Exemplos|Exemplos]] · [[SeedGrid/Extensions/apikeys/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo | `seedgrid.apikeys` |
| Classe de config | `java/seedgrid-quarkus-ext-apikeys/runtime/src/main/java/br/com/seedgrid/apikeys/configs/ApiKeysConfig.java` → `ApiKeysConfig` |
| Mecanismo | SmallRye `@ConfigMapping(prefix = "seedgrid.apikeys")` + `@StaticInitSafe`; registrado em `SeedgridApikeysProcessor#config()` (`ConfigMappingBuildItem`) |
| Fase | Runtime |
| Outras fontes | Nenhum `@ConfigProperty`, `ConfigProvider` ou `microprofile-config.properties` no runtime (verificado por busca). |

Ligar/desligar autenticação e gestão **não** é por propriedade: é pelo bean SPI `ApiKeyActivationPolicy` (ver [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral]]).

## 2. Propriedades da extension

### Geração da chave

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.apikeys.prefix-length` (env `SEEDGRID_APIKEYS_PREFIX_LENGTH`) | `int` | inteiro positivo (sem validação explícita) | `8` | Não | Nº de caracteres da parte aleatória guardados como `prefix` (busca no banco e máscara `prefix...`). Na autenticação, a chave cuja parte após `sgkey_` for menor que isso é rejeitada. | Localizar a chave pelo prefixo antes de comparar o hash | **Mudar com chaves já emitidas quebra a autenticação delas**: o prefixo extraído na autenticação usa o valor atual, e as chaves antigas foram gravadas com o anterior (Inferência a partir de `ApiKeyGeneratorService#extractPrefix` + `ApiKeyRepository#findByPrefix`). Deve ser ≤ comprimento da parte aleatória (gerado a partir de `key-bytes`). | Runtime | Decl.: `ApiKeysConfig#prefixLength()`. Consumo: `ApiKeyGeneratorService#extractPrefix`, `#extractPrefixFromRandomPart` |
| `seedgrid.apikeys.key-bytes` (env `SEEDGRID_APIKEYS_KEY_BYTES`) | `int` | inteiro positivo (sem validação explícita) | `32` | Não | Bytes aleatórios (`SecureRandom`) codificados em Base64 URL-safe sem padding para formar a chave `sgkey_<...>`. | Entropia da chave | Com 32 bytes a parte aleatória tem 43 caracteres; se ficar menor que `prefix-length`, o prefixo vira a parte inteira (Confirmado em `extractPrefixFromRandomPart`). Afeta só chaves novas. | Runtime | Decl.: `ApiKeysConfig#keyBytes()`. Consumo: `ApiKeyGeneratorService#generateRandomPart` |

Total: **2 propriedades públicas**.

## 3. Propriedades de frameworks/bibliotecas

A extension não registra defaults de `quarkus.*`. Ela depende, na prática, da configuração do `seedgrid-security` e do Quarkus (datasource, JWT) no host. O comentário do `integration-tests/src/main/resources/application.properties` registra que o security fixa `quarkus.http.auth.proactive=true` e que, por isso, o smallrye-jwt precisa de chave pública configurada mesmo em requests por API key (senão 500 `SRJWT02002`). (Confirmado como comentário; comportamento do security não verificado aqui.)

## 4. Propriedades usadas só em testes

`integration-tests/src/main/resources/application.properties` (fica em `src/main` porque o `@QuarkusIntegrationTest` roda o JAR empacotado):

| Propriedade | Observação |
|---|---|
| `quarkus.http.test-port`, `quarkus.http.test-ssl-port` | `0` |
| `quarkus.hibernate-orm.database.generation` | `drop-and-create` (schema pelo Hibernate nos testes) |
| `quarkus.flyway.migrate-at-start` | `false` |
| `quarkus.datasource.devservices.image-name` | `postgres:16-alpine` |
| `seedgrid.audit.persistence.strategy` | `JPA` (exigido pelo security transitivo) |
| `seedgrid.security.default-company.cnpj` / `.corporate-name` / `.trade-name` | dados fictícios |
| 🔒 `seedgrid.security.encryption.key` | `<SEGREDO:security-encryption-key>` (valor de teste não copiado) |
| `quarkus.arc.exclude-types` | exclui `FirstAdminBootstrapService` |

Nenhuma propriedade `seedgrid.apikeys.*` é definida nos testes (usam os padrões).

## 5. Aliases, obsoletas, renomeações

- Nenhum alias. O header (`x-api-key`) e o prefixo das chaves (`sgkey_`) são constantes em `ApiKeyConstants`, não propriedades.

## 6. Configuração mínima

Nenhuma propriedade própria é obrigatória. O host precisa da configuração do [[SeedGrid/Extensions/security/Configuracao|security]] (JWT, datasource etc.) e de executar as migrations `classpath:db/migration/apikeys`.

```properties
# nada obrigatório em seedgrid.apikeys.*
```

## 7. Configuração completa comentada

```properties
# Caracteres da parte aleatória usados como prefixo de busca (padrão 8).
# Não altere com chaves já emitidas.
seedgrid.apikeys.prefix-length=8
# Bytes aleatórios do corpo da chave (padrão 32 → 43 caracteres Base64 URL-safe).
seedgrid.apikeys.key-bytes=32
```

## 8. Receitas

- **Chaves mais longas**: aumente `seedgrid.apikeys.key-bytes` (afeta só chaves novas; o prefixo continua com `prefix-length` caracteres).
- **Desligar a gestão de chaves mas manter a autenticação**: forneça um bean `ApiKeyActivationPolicy` com `isApiKeyManagementEnabled()=false` (não há propriedade). Ver [[SeedGrid/Extensions/apikeys/Exemplos|Exemplos]].
- **Desligar a autenticação por API key**: o mesmo bean com `isApiKeyAuthEnabled()=false`.

## 9. Dúvidas e lacunas

- Não há validação de faixa para `prefix-length`/`key-bytes` (valores ≤ 0 não tratados) — Não confirmado o comportamento.
- Mudança de `prefix-length` com chaves existentes: Inferência de quebra (ver tabela), não testado.
