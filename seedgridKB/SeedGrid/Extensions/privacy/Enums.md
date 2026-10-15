---
tags: [seedgrid, library, privacy, enum]
fonte: java/seedgrid-quarkus-lib-privacy
branch: main
commit: 79f8b03eeb
analisado-em: 2026-10-14
---

# SeedGrid Privacy — Enums

Voltar: [[SeedGrid/Extensions/privacy/Visao-geral|Visão geral do privacy]] · [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]] · [[SeedGrid/Extensions/privacy/Rust|Porte Rust]]

Nenhum destes enums é tipo de propriedade de configuração nem é persistido: são atributos de anotações públicas e parâmetros de API.

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| `MaskingStrategy` | `br.com.seedgrid.privacy.masking.MaskingStrategy` | `@PersonalData.type`, `@MaskRule.type`, `PersonalDataMasker.mask`, `PersonalDataSanitizer` | Sim |
| `SearchNormalization` | `br.com.seedgrid.privacy.SearchNormalization` | `@EncryptedField.normalize`, `EncryptedFieldSearch.hashForSearch` | Sim |
| `CryptoAlgorithm` | `br.com.seedgrid.privacy.CryptoAlgorithm` | `@EncryptedField.cryptoAlgorithm` | Sim |
| `SearchAlgorithm` | `br.com.seedgrid.privacy.SearchAlgorithm` | `@EncryptedField.searchAlgorithm` | Sim |

## MaskingStrategy

Arquivo: `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/masking/MaskingStrategy.java`.

Cada constante implementa `String maskValue(String value, String param)`; `param` vem de `@PersonalData.maskWith` / `@MaskRule.maskWith` (padrão da anotação: `"***"`).

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `FULL` | Substitui todo o valor por um texto fixo | `param` não vazio → `param`; senão `"***"` | Padrão de `@PersonalData.type` e `@MaskRule.type`. **Confirmado.** |
| `FORMAT` | Máscara pronta que preserva o formato | `param` não vazio → `param`; senão `"***"` | Comportamento idêntico a `FULL`; a diferença é só semântica (`param` é a máscara completa). O valor original é ignorado. |
| `PARTIAL` | Revela só os últimos N caracteres | `param` = N (inteiro; ausente ou inválido → 2). Valor mais curto ou igual a N volta inteiro, sem máscara; valor `null` → `null` | Ex.: `"12345678900"`, N=3 → `"********900"`. |
| `HASH` | SHA-256 hexadecimal minúsculo | `Sha256.hex(value)`; `null` é tratado como string vazia | Irreversível; `param` ignorado. |
| `TEMPLATE` | Gabarito posicional | `#` revela o caractere da mesma posição (espaço se o valor for menor), `*` mascara, outro caractere é literal; valor ou `param` `null` → `"***"` | O tamanho do resultado é o do gabarito, não o do valor. |
| `REMOVE` | Remove o campo | `maskValue` devolve `null`; `isRemoval()` é `true`. `PersonalDataSanitizer` remove a chave do JSON; `PersonalDataMasker.mask` devolve `null` | Também usado quando `@MaskRule.remove=true`, que sobrepõe o `type`. |

**Atributos/métodos:** sem campos; `abstract maskValue(String, String)`, `isRemoval()`.

**Serialização:** não é serializado nem persistido; só aparece em anotações (valor da constante em tempo de compilação). Um `strategy` `null` em `PersonalDataMasker.mask` devolve o valor inalterado.

**Onde é usado:** `@PersonalData` / `@MaskRule` (resolvidos por `PersonalDataResolver`, aplicados por `PersonalDataSanitizer`, com precedência override › payload › modelo); `PersonalDataMasker.mask`; embeddables `Address` e `Contact` do commons — ver [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]]. O masking não tem propriedades de configuração.

## SearchNormalization

Arquivo: `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/SearchNormalization.java`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `NONE` | Sem normalização: hash do valor exato | `apply` devolve o valor como está | Padrão de `@EncryptedField.normalize`. Case-sensitive. |
| `CANONICAL` | Forma canônica: `trim`, remove acentos (NFD), minúsculas, mantém só `[a-z0-9]` | `apply` delega ao `ValueNormalizer` (`DefaultValueNormalizer`, substituível via `CryptoProvider.configureNormalizer`) | Para CPF, CNPJ, telefone e CEP. `hashForSearch(valor)` sem 2º argumento usa este modo. |
| `EMAIL` | `trim` + minúsculas, preservando `@ . - _` | `apply` faz `value.trim().toLowerCase(Locale.ROOT)` | Para e-mail; `CANONICAL` faria e-mails diferentes colidirem. |

**Métodos:** `String apply(String value, ValueNormalizer canonicalNormalizer)` — `null` → `null`; o normalizador só é usado por `CANONICAL`.

**Regra importante:** a mesma normalização deve ser usada na gravação (`EncryptedFieldListener`, a partir de `@EncryptedField.normalize`) e na consulta (`EncryptedFieldSearch.hashForSearch(valor, normalização)`); senão a busca não encontra o registro. A normalização só afeta o hash de busca, nunca o valor cifrado.

**Serialização/persistência:** nenhuma (só atributo de anotação e parâmetro de método).

**Onde é usado:** `@EncryptedField.normalize`; `EncryptedFieldListener`; `EncryptedFieldSearch`; embeddables `Address` (telefone) e `Contact` (cpf, telefone, whatsapp: `CANONICAL`; email: `EMAIL`). Só tem efeito com `seedgrid.privacy.encryption.enabled=true` — ver [[SeedGrid/Extensions/privacy/Configuracao|Configuração do privacy]].

## CryptoAlgorithm

Arquivo: `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/CryptoAlgorithm.java`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `AES_256_GCM` | Cifra AES-256 em modo GCM | **Nenhum código lê** `@EncryptedField.cryptoAlgorithm()`; a cifra é sempre `AesGcmCryptoService` (AES/GCM/NoPadding) | Único valor e padrão do atributo. Escolher outro algoritmo não é possível. |

## SearchAlgorithm

Arquivo: `java/seedgrid-quarkus-lib-privacy/src/main/java/br/com/seedgrid/privacy/SearchAlgorithm.java`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `HMAC_SHA256` | HMAC-SHA256 para o hash de busca | **Nenhum código lê** `@EncryptedField.searchAlgorithm()`; o hash é sempre `HmacSha256SearchHashService` | Único valor e padrão do atributo. |

## Internos

Nenhum.
