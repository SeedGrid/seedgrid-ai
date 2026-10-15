---
tags: [seedgrid, extension, apikeys, enum]
fonte: java/seedgrid-quarkus-ext-apikeys
branch: main
commit: bfc9c25877
analisado-em: 2026-10-14
---

# API Keys (Quarkus) — enums

Voltar: [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral do apikeys]] · [[SeedGrid/Extensions/apikeys/Configuracao|Configuração]]

## Índice

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| [[#ApiKeyAuthType]] | `br.com.seedgrid.apikeys.utils` — `runtime/src/main/java/br/com/seedgrid/apikeys/utils/ApiKeyAuthType.java` | `ApiKeyPrincipal#getAuthType()`, atributo `apikey.authType` da `SecurityIdentity` | Sim (tipo de retorno público) |

## ApiKeyAuthType

FQN: `br.com.seedgrid.apikeys.utils.ApiKeyAuthType`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `API_KEY` | Identidade autenticada por API key (única constante) | Atribuída fixamente no construtor de `ApiKeyPrincipal`; gravada pelo `ApiKeyIdentityProvider` como atributo `apikey.authType` = `"API_KEY"`; o `RbacSecurityIdentityAugmentor` do security compara esse atributo com a string `"API_KEY"` para **pular** a resolução RBAC (as permissões já vêm como `StringPermission`) | Confirmado |

- Não tem campos nem métodos. O enum tem um único valor e é sempre o mesmo: serve de marcador de tipo de credencial.
- **Serialização**: o atributo da identidade guarda `name()` (string `API_KEY`); não aparece em JSON de endpoint nem é persistido. O contrato com o security é a **string** `"API_KEY"` (sem dependência de classe): renomear a constante quebraria a detecção.
- Usado em: `ApiKeyPrincipal`, `ApiKeyIdentityProvider`; sem relação com propriedades de [[SeedGrid/Extensions/apikeys/Configuracao|Configuração]].

## Internos

Nenhum.
