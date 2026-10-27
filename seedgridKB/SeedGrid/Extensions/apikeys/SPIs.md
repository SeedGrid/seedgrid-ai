---
tags: [seedgrid, extension, apikeys, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-apikeys
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# apikeys (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/apikeys/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-apikeys` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#ApiKeyActivationPolicy]] | `DefaultApiKeyActivationPolicy` | Deixa a autenticação por API key e o gerenciamento das chaves ligados. |
| [[#ApiKeyScopeRunner]] | `DefaultApiKeyScopeRunner` | Executa o trabalho direto, sem escopo (host de banco único). |

## ApiKeyActivationPolicy

Política do host para ligar e desligar a API key. A autenticação por chave e o gerenciamento das chaves (criar, listar, revogar) são ligados separadamente. A implementação padrão (`DefaultApiKeyActivationPolicy`, `@DefaultBean`) deixa os dois ligados.

**Pacote:** `br.com.seedgrid.apikeys.spis`

**Padrão (`@DefaultBean`):**

- `DefaultApiKeyActivationPolicy` — Deixa a autenticação por API key e o gerenciamento das chaves ligados.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `boolean isApiKeyAuthEnabled()` | `false` faz o mecanismo de autenticação não tentar autenticar a requisição por API key: a chamada segue como se não houvesse essa credencial. |
| `boolean isApiKeyManagementEnabled()` | `false` faz as rotas de gerenciamento de chaves recusarem a operação com `ApiKeyManagementDisabledException`. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class PorConfigApiKeyActivationPolicy implements ApiKeyActivationPolicy {

    @ConfigProperty(name = "meuapp.api-key.auth", defaultValue = "true")
    boolean auth;

    @ConfigProperty(name = "meuapp.api-key.management", defaultValue = "true")
    boolean management;

    @Override
    public boolean isApiKeyAuthEnabled() {
        return auth;
    }

    @Override
    public boolean isApiKeyManagementEnabled() {
        return management;
    }
}
```

## ApiKeyScopeRunner

Executa a consulta da chave no ESCOPO de dados da requisicao (ex.: o banco do tenant). Com `quarkus.http.auth.proactive=true` a autenticacao roda ANTES dos filtros do JAX-RS e sem contexto de requisicao CDI ativo; entao o escopo que o resto da aplicacao monta nos filtros ainda nao existe e a chave seria buscada no banco errado (ou nem seria buscada).

**Pacote:** `br.com.seedgrid.apikeys.spis`

**Padrão (`@DefaultBean`):**

- `DefaultApiKeyScopeRunner` — Executa o trabalho direto, sem escopo (host de banco único).

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainApiKeyScopeRunner` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainApiKeyScopeRunner.java`) — Abre o escopo do tenant para a consulta da API key. Com `quarkus.http.auth.proactive=true` a autenticacao roda antes do `TenantResolutionFilter` e sem contexto de requisicao CDI; sem este runner o `TenantContext` (request-scoped) nao existe e a chave nao teria em qual banco ser buscada.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `<T> T runInScope(ApiKeyAuthenticationRequest request, Supplier<T> work)` | Executa `work` dentro do escopo de dados da requisição (por exemplo, o banco do tenant) e devolve o resultado. Resolva o escopo por `request.getHost()` e `request.getForwardedHost()`, nunca por header livre do cliente. Padrão: executa direto, sem escopo. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class TenantApiKeyScopeRunner implements ApiKeyScopeRunner {

    @Inject
    TenantContext tenantContext; // o contexto de tenant do seu host

    @Override
    public <T> T runInScope(ApiKeyAuthenticationRequest request, Supplier<T> work) {
        // resolva o tenant pelos MESMOS dados que o seu filtro usa, nunca por header livre do cliente
        String tenant = tenantContext.fromHost(request.getHost(), request.getForwardedHost());
        return tenantContext.runAs(tenant, work);
    }
}
```
