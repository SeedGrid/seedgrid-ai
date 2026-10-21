---
tags: [seedgrid, library, privacy, configuracao]
fonte: java/seedgrid-quarkus-lib-privacy
branch: main
commit: 79f8b03eeb
analisado-em: 2026-10-14
---

# SeedGrid Privacy — Configuração

Voltar: [[SeedGrid/Extensions/privacy/Visao-geral|Visão geral do privacy]] · [[SeedGrid/Extensions/privacy/Exemplos|Exemplos do privacy]] · [[SeedGrid/Extensions/privacy/Rust|Porte Rust]]

## 1. Cabeçalho

| Item                      | Valor                                                                                                                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prefixo                   | `seedgrid.privacy.*`                                                                                                                                                                                                                                                                               |
| Classes de config         | Nenhuma `@ConfigMapping`/`@ConfigRoot`/`@ConfigProperty`. Nomes como constantes em `CryptoProvider` (`ENCRYPTION_ENABLED_PROPERTY`, `CRYPTO_KEY_PROPERTY`, `SEARCH_KEY_PROPERTY`); leitura via `ConfigProvider.getConfig().getOptionalValue(...)`; POJO `CryptoProperties` só transporta as chaves |
| Arquivos de config da lib | Nenhum (`src/main/resources` inexistente)                                                                                                                                                                                                                                                          |
| Fase                      | Runtime. `encryption.enabled` é relido **a cada** escrita/hash (`isEncryptionEnabled()` sem cache). As chaves são lidas no startup (`CryptoBootstrap`, `@Singleton @Startup`) e/ou lazy no primeiro uso; depois ficam em campos estáticos (mudança posterior não tem efeito sem restart)           |
| Masking                   | Não tem configuração (não usa chave)                                                                                                                                                                                                                                                               |

Investigado: `@ConfigMapping`, `@ConfigRoot`, `@ConfigProperty`, `ConfigProvider`, `System.getenv`, resources, testes. Fora de contexto MicroProfile (`IllegalStateException` do `ConfigProvider`), `isEncryptionEnabled()` → `false` e `loadConfiguredProperties()` → vazio.

## 2. Propriedades próprias

### 2.1 Secure Fields

| Propriedade                           | Tipo                                          | Valores aceitos                                                                                     | Padrão  | Obrigatória                                                                                                                                                                              | Comportamento                                                                                                                                                                             | Uso                                                                                                                                                                       | Relações                                                                                                                                                                                  | Fase                                                                                                | Origem                                                                                                                                                             |
| ------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `seedgrid.privacy.encryption.enabled` | `Boolean`                                     | `true`/`false`                                                                                      | `false` | Não                                                                                                                                                                                      | `false`: `@SgEncryptedField` grava valor cru e o campo de hash fica sem preencher; `true`: cifra na escrita e preenche o hash                                                               | `EncryptedFieldAttributeConverter#resolveForWrite`, `EncryptedFieldListener#applyEncryptedField`; exposto em `CryptoProvider.isEncryptionEnabled()` para queries bimodais | Ligado exige `crypto.key` e `search.key`. A **leitura** não depende do flag (valor `v1:` sempre exige `crypto.key`). Override programático: `CryptoProvider.setEncryptionEnabledForTests` | Runtime (relido a cada chamada)                                                                     | Declaração: `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/CryptoProvider.java` → `ENCRYPTION_ENABLED_PROPERTY`, `isEncryptionEnabled()` |
| `seedgrid.privacy.crypto.key` 🔒      | `String` (Base64, prefixo `base64:` opcional) | Base64 válido que decodifique para **32 bytes** (mínimo validado: 32; AES aceita 16/24/32 — use 32) | —       | Condicional: obrigatória com `encryption.enabled=true` **e** para ler qualquer valor já cifrado (`v1:...`) mesmo com o flag desligado                                                    | Ausente quando necessária → `IllegalStateException("Propriedade obrigatoria ausente para secure fields: ...")` no 1º uso; inválida → `IllegalArgumentException` (no startup, se presente) | `AesGcmCryptoService` (AES/GCM/NoPadding, IV 12 bytes, tag 128 bits)                                                                                                      | Deve ser diferente de `search.key` (README)                                                                                                                                               | Runtime: startup (`CryptoBootstrap`) se presente; senão lazy em `CryptoProvider#getCryptoService()` | `CryptoProvider` → `CRYPTO_KEY_PROPERTY`, `loadConfiguredProperties()`, `getRequiredConfig()`; `KeyDecoder#decode(..., 32, ...)`; `AesGcmCryptoService(String)`    |
| `seedgrid.privacy.search.key` 🔒      | `String` (Base64, prefixo `base64:` opcional) | Base64 válido com **≥ 32 bytes**                                                                    | —       | Condicional: obrigatória com `encryption.enabled=true` (listener com `searchField`) e sempre que se usar `EncryptedFieldSearch()`/`CryptoProvider.getSecureSearch()` (independe do flag) | Ausente quando necessária → `IllegalStateException`; inválida → `IllegalArgumentException` (no startup, se presente)                                                                      | `HmacSha256SearchHashService` (hash hex lowercase)                                                                                                                        | Trocar a chave invalida todos os hashes já gravados (**Inferência**)                                                                                                                      | Runtime: startup se presente; senão lazy em `getSearchHashService()`                                | `CryptoProvider` → `SEARCH_KEY_PROPERTY`; `HmacSha256SearchHashService(String)`                                                                                    |

Variáveis de ambiente pela regra MP (**Inferência**, leitura por nome exato): `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED`, `SEEDGRID_PRIVACY_CRYPTO_KEY`, `SEEDGRID_PRIVACY_SEARCH_KEY`. O exemplo e o README usam **outras** env vars via expansão no `application.properties` (`SEEDGRID_CRYPTO_KEY`, `SEEDGRID_SEARCH_KEY`, `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED`) — convenção do host, não lida pela lib.

## 3. Propriedades de frameworks recomendadas

| Propriedade | Situação | Origem |
|---|---|---|
| `quarkus.hibernate-orm.packages` incluindo `br.com.seedgrid.privacy` | Usada no exemplo, com o comentário de que o pacote da lib contém o converter e o listener referenciados por `@Convert`/`@EntityListeners`. Necessidade só quando o host restringe `packages` — **Inferência** | `platform-examples/examples/seedgrid-privacy-example/src/main/resources/application.properties` |
| `quarkus.datasource.*`, `quarkus.flyway.*` | Do host (a lib não traz migrations; colunas cifradas precisam comportar `v1:iv:ciphertext`, o exemplo usa `length = 512`; hash `length = 64`) | exemplo `Customer` + `V1000__create_customers.sql` |

## 4. Propriedades só de testes/exemplos

| Propriedade | Onde | Observação |
|---|---|---|
| `seedgrid.privacy.encryption.enabled=true`, `seedgrid.privacy.crypto.key`, `seedgrid.privacy.search.key` | `platform-examples/examples/seedgrid-privacy-example/src/{main,test}/resources/application.properties` | O exemplo define as três propriedades (com valores default fictícios na expansão `${SEEDGRID_CRYPTO_KEY:...}`) |
| (nenhuma) | testes da própria lib | usam `CryptoProvider.setEncryptionEnabledForTests`/`resetForTests` e construtores package-private com serviços injetados |

## 5. Aliases, obsoletas, renomeações

Nenhuma propriedade renomeada. Renomeações de API (não de config): `@SgPersonalData` ← antiga `@AuditSensitive`; `@SgMaskRule` ← `@AuditFieldRule`; `PersonalDataSanitizer` ← `AuditSanitizerService`; `PersonalDataResolver` ← `AuditSensitiveRuleResolverService` (Javadocs).

## 6. Configuração mínima

Modo agnóstico (padrão): **nenhuma** propriedade. Para cifrar:

```properties
seedgrid.privacy.encryption.enabled=true
seedgrid.privacy.crypto.key=${SEEDGRID_PRIVACY_CRYPTO_KEY}
seedgrid.privacy.search.key=${SEEDGRID_PRIVACY_SEARCH_KEY}
```

## 7. Configuração completa comentada

```properties
# Liga a cifra at-rest dos @SgEncryptedField (padrão false = grava cru, sem exigir chave)
seedgrid.privacy.encryption.enabled=true

# AES-256-GCM: Base64 (ou "base64:<...>") de exatamente 32 bytes. Guardar em secret.
seedgrid.privacy.crypto.key=<SEGREDO:privacy-crypto-key>

# HMAC-SHA256 do hash de busca: Base64 de >= 32 bytes, DIFERENTE da crypto.key.
seedgrid.privacy.search.key=<SEGREDO:privacy-search-key>

# Se o host restringe os pacotes do Hibernate, inclua o da lib (converter/listener):
quarkus.hibernate-orm.packages=<pacote.das.suas.entidades>,br.com.seedgrid.privacy
```

Gerar uma chave de 32 bytes (ex.): `openssl rand -base64 32`.

## 8. Receitas

- **App sem gestão de chaves**: não configure nada; `@SgEncryptedField` grava cru e a busca usa o campo normal (`if (CryptoProvider.isEncryptionEnabled()) ... else ...`). O masking continua ativo.
- **App com cifra e busca por CPF/e-mail**: ligue o flag + as duas chaves; anote `@SgEncryptedField(searchField="cpfHash", normalize=CANONICAL)` e `@SgEncryptedField(searchField="emailHash", normalize=EMAIL)`; busque com `hashForSearch(valor, mesmaNormalização)`.
- **Banco legado em claro → cifrado**: ligar o flag não recifra registros antigos (sem backfill automático); planeje migração.
- **Desligar com dados cifrados**: mantenha `crypto.key` configurada, senão a leitura de valores `v1:` falha.

## 9. Dúvidas e lacunas

- A falha "fail-closed" com flag ligado e chave ausente ocorre no **primeiro uso**, não no boot.
- Não há rotação de chave nem versionamento de chave além do prefixo `v1`.
- Mapeamento com o crate Rust: [[SeedGrid/Extensions/privacy/Configuracao-Rust|Configuração Rust do privacy]].
