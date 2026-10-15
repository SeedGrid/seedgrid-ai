---
tags: [seedgrid, extension, apikeys, exemplos]
fonte: java/seedgrid-quarkus-ext-apikeys
branch: main
commit: bfc9c25877
analisado-em: 2026-10-14
---

# API Keys (Quarkus) — exemplos

Voltar: [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral do apikeys]] · [[SeedGrid/Extensions/apikeys/Configuracao|Configuração]]

## 1. Dependência

Fonte: `runtime/pom.xml` e `README.md`.

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-apikeys</artifactId>
    <version>2026.10.14</version>
</dependency>
```

## 2. Proteger um endpoint

Fonte: `ApiKeyIdentityProvider` adiciona cada permissão da role como `StringPermission`, então o `@PermissionsAllowed` nativo do Quarkus funciona; é o que o `README.md` usa.

```java
import io.quarkus.security.PermissionsAllowed;

@GET
@Path("/financas/recebiveis")
@PermissionsAllowed("FINANCAS_LISTAR_RECEBIVEIS")
public Response listRecebiveis() {
    ...
}
```

## 3. Criar, usar, revogar (HTTP)

Fonte: `ApiKeyManagementController`, `README.md`.

```bash
# Criar (JWT do usuário, permissão APIKEY_CREATE); a role precisa ser de integração
curl -X POST "http://localhost:8080/apikeys/role/ROTAS_INTEGRACAO" \
  -H "Authorization: Bearer <JWT_DO_USUARIO>" -H "Content-Type: application/json" \
  -d '{"name": "Integracao ERP", "expiresDays": 90}'
# → 201 { publicId, name, prefix, masked, apiKey: "sgkey_...", expiresAt, createdAt }

# Usar (prefira x-api-key)
curl "http://localhost:8080/financas/recebiveis" -H "x-api-key: <SEGREDO:api-key>"

# Roles elegíveis para o combo da tela
curl "http://localhost:8080/apikeys/roles" -H "Authorization: Bearer <JWT_DO_USUARIO>"

# Revogar
curl -X POST "http://localhost:8080/apikeys/<publicId>/revoke" -H "Authorization: Bearer <JWT_DO_USUARIO>"
```

`name` é obrigatório (máx. 120); `expiresDays` ≥ 1 ou ausente (sem expiração) — `ApiKeyCreateRequest`.

## 4. Introspecção por serviço externo

Fonte: `ApiKeyIntrospectionController`, `README.md` §1.5.

```bash
curl "https://<tenant>.<sufixo>/apikeys/me" -H "x-api-key: <SEGREDO:api-key>"
```

```json
{
  "publicId": "apk_123", "name": "chave-do-gateway", "prefix": "A1B2C3D4",
  "roleName": "ROTAS_INTEGRACAO", "ownerPublicId": "usr_456",
  "permissions": ["ROTAS_CALCULAR"], "expiresAt": "2026-12-31T23:59:59Z"
}
```

`200` = chave válida agora. Quem cacheia deve usar o hash da chave como chave de cache e cachear também negativos (recomendação do README).

## 5. Ler a identidade da API key no código

Fonte: `ApiKeyIdentityProvider` (atributos) e `ApiKeyPrincipal`.

```java
import br.com.seedgrid.apikeys.utils.ApiKeyPrincipal;
import io.quarkus.security.identity.SecurityIdentity;

@Inject SecurityIdentity identity;

if (identity.getPrincipal() instanceof ApiKeyPrincipal key) {
    String keyPublicId = key.getApiKeyPublicId();
    String ownerPublicId = key.getOwnerPublicId();
    Long companyId = key.getCompanyId(); // null = chave sem escopo
}
String authType = identity.getAttribute("apikey.authType");
```

## 6. Desligar a gestão de chaves (SPI)

Fonte: `ApiKeyActivationPolicy` / `DefaultApiKeyActivationPolicy` (`@DefaultBean`). Um bean do host substitui o padrão.

```java
import br.com.seedgrid.apikeys.spis.ApiKeyActivationPolicy;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MinhaPoliticaApiKey implements ApiKeyActivationPolicy {
    @Override public boolean isApiKeyAuthEnabled() { return true; }
    @Override public boolean isApiKeyManagementEnabled() { return false; } // gestão → ApiKeyManagementDisabledException
}
```

## 7. Configuração

```properties
seedgrid.apikeys.prefix-length=8
seedgrid.apikeys.key-bytes=32
```

Detalhes em [[SeedGrid/Extensions/apikeys/Configuracao|Configuração]].
