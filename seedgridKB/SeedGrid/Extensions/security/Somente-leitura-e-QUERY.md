---
description: "Como bloquear a escrita de uma empresa sem apagar nada, em perguntas e respostas: estados ACTIVE/READ_ONLY/DISABLED da empresa, quando usar GET, QUERY, @SgReadOnlySafe e a lista de exceções, quais recursos de administração o modo barra (@SgReadOnlyEnforced), os códigos COMPANY_READ_ONLY e COMPANY_DISABLED e como o front e o BFF Next tratam o método QUERY."
tags: [seedgrid, extension, security, read-only, query, company-access, readonlysafe, host, front, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Somente leitura (`READ_ONLY`), `QUERY` e `@SgReadOnlySafe`

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-quarkus-ext-security` e `seedgrid-quarkus-lib-commons` **2026.10.22** ([[SeedGrid/Versoes|Versões]]). Conferido contra `microprofile-config.properties` do security e os guardiões `CompanyAccessGuardianIT` e `ReadOnlyAdminResourcesIT`. Quem muda o estado por inadimplência ou por plano é o billing: [[SeedGrid/Extensions/billing/Inadimplencia-e-limites-do-plano|Inadimplência e limites do plano]]. Resumo por fase: [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]].

## Como bloqueio a escrita de uma empresa sem apagar nada?

Mude o **estado de acesso** dela (`companies.access_mode`):

| Estado | Login | O que a empresa faz |
|---|---|---|
| `ACTIVE` (padrão) | normal | tudo |
| `READ_ONLY` | normal | lê; qualquer escrita recebe **403 `COMPANY_READ_ONLY`** |
| `DISABLED` | recusado: **403 `COMPANY_DISABLED`** (login, `select-company` e `refresh`) | nada; as sessões existentes caem (401 `SESSION_REVOKED`) |

Quem muda (e só a plataforma pode):

```java
companyAccessService.setMode(companyPublicId, CompanyAccessMode.READ_ONLY, "fatura em atraso há 7 dias");
```

ou `PUT /companies/{publicId}/access-mode { "mode": "READ_ONLY", "reason": "..." }`, com a permissão `COMPANY_ACCESS_MODE_UPDATE` (audiência `platform`, **não** vai ao ADMIN do tenant: o host a concede a um perfil da empresa-plataforma). O billing chama `setMode` direto e não precisa da permissão. Toda mudança real revoga as sessões da empresa, audita e dispara `CompanyAccessChangedEvent`. Voltar a `ACTIVE` restaura o acesso, com novo login.

Proteções: a empresa da plataforma nunca muda (409 `COMPANY_ACCESS_PLATFORM_PROTECTED`); a conta nunca fica com todas as empresas `DISABLED` (409 `COMPANY_ACCESS_ALL_DISABLED`); em `dedicated-database`, desligar a empresa que guarda o único ADMIN dá 409 `LAST_ADMIN_PROTECTED`.

## Quando uso `GET`, `QUERY`, `@SgReadOnlySafe` ou a lista de exceções?

| Preciso de… | Use | Passa em `READ_ONLY`? |
|---|---|---|
| Consulta com parâmetros simples | `GET` com query string (**padrão**) | sim |
| Consulta que precisa de **corpo** (filtro grande demais para a URL) | `@QUERY` | sim, sem anotação |
| Um `POST` de consulta que não dá para trocar | `@SgReadOnlySafe` no método ou na classe | sim, só onde estiver anotado |
| Rota de dados do próprio usuário ou do billing (upgrade) | lista de exceções por propriedade | sim, no caminho listado |
| Gravar, consumir cota ou publicar evento | `POST`/`PUT`/`PATCH`/`DELETE` | **não** (403 `COMPANY_READ_ONLY`) |

Em `READ_ONLY` passam `GET`, `HEAD`, `OPTIONS` e `QUERY`. O filtro vale para JWT e API key (a empresa vem do contexto da requisição). **Jobs internos não passam pelo filtro HTTP**: use `CompanyAccessService.isWritable(companyId)` ou `assertWritable(companyId)`.

```java
// POST de consulta que o host não pode trocar por GET ou QUERY (nunca em endpoint que grava ou consome cota)
@SgReadOnlySafe
@POST @Path("/consulta")
public Resultado consultar(Filtro filtro) { ... }

// consulta com corpo: @QUERY (br.com.seedgrid.commons.web.annotations.QUERY) já passa sem anotação
@QUERY @Path("/busca")
public Resultado buscar(Filtro filtro) { ... }
```

## Qual é a lista de exceções e como acrescento um caminho?

Padrão (`seedgrid.security.company-access.read-only.allowed-paths`): `/public/auth/**`, `/me/select-company`, `/me/profile`, `/me/password`, `/me/terms/accept`, `/me/identities`, `/2f`, `/users/change-password`.

- Sem curinga, o caminho vale com tudo abaixo dele (limite de segmento); `*` casa um segmento; `**` qualquer profundidade.
- **Sobrescrever `allowed-paths` SUBSTITUI o padrão.** Para acrescentar sem perder os padrões use as **contribuições aditivas**, uma chave por contribuinte:

```properties
# o billing já traz isto no microprofile-config.properties dele: upgrade e pagamento funcionam em READ_ONLY
seedgrid.security.company-access.read-only.contributions.billing=/me/billing,/me/plans,/me/subscription,/me/usage
# o host acrescenta o dele sem perder os padrões
seedgrid.security.company-access.read-only.contributions.meuapp=/me/preferencias
```

`seedgrid.security.company-access.cache-ttl` (`PT60S`) é o TTL do estado da empresa no `seedgrid-cache` (compartilhado entre os nós); a invalidação a cada mudança é explícita, o TTL é só rede de segurança, e com o cache fora do ar a leitura vai ao banco.

## O que o `READ_ONLY` barra na administração?

Os quatro recursos de administração do security carregam `@SgReadOnlyEnforced` (`UserController`, `RoleController`, `PermissionController` e `CompanyController`): com a empresa **corrente do token** em `READ_ONLY`, `POST`, `PUT`, `PATCH` e `DELETE` dão **403 `COMPANY_READ_ONLY`**; as leituras seguem 200. Livres mesmo assim: os caminhos das listas acima, `@SgReadOnlySafe`, `PUT /companies/{id}/access-mode` e **`PATCH /companies/{id}` somente com `active`** (inativar ou reativar é recuperação). `PATCH /companies/{id}` com qualquer outro campo (ex.: `tradeName`) dá 403. Código do host que escreve por conta própria chama `CompanyAccessService.assertWritable(companyId)`.

Impacto: quem editava usuários, perfis ou empresa com a empresa em somente leitura agora recebe 403; o front precisa tratar `COMPANY_READ_ONLY`.

## Como diferencio os códigos?

| Resposta | Significa | O front faz |
|---|---|---|
| 403 `COMPANY_READ_ONLY` (+ `companyPublicId`) | A empresa não escreve | Faixa "somente leitura – faça upgrade" |
| 403 `COMPANY_DISABLED` | A empresa não entra | Trata como empresa desligada: explica e não deixa entrar |
| 402 `COMPANY_QUOTA_EXCEEDED` | O plano não comporta mais uma empresa | Informa que o plano não comporta mais uma empresa |
| 401 `SESSION_REVOKED` | A sessão foi encerrada | Limpa a sessão, **não** tenta refresh, vai ao login |

O erro vem em `application/problem+json` com o campo `code`. O BFF precisa **repassar o 403 com o `code`** (não trocá-lo por 500). `AuthResponse.currentCompany { publicId, name, accessMode, personType }` e `GET /me/companies` trazem o `accessMode` para o front mostrar a faixa antes de a escrita falhar.

## Como o front chama `QUERY`? (Next.js 16 como BFF)

Navegadores não têm API para `QUERY`, e o Route Handler do Next responde 400 a esse método. A solução é um `proxy.ts` que reescreve o caminho:

```
browser   QUERY /api/q/<caminho-do-backend>?<qs>      cookie httpOnly + corpo JSON
proxy.ts  rewrite -> <SEEDGRID_APP_API_BASE_URL>/<caminho-do-backend>?<qs>
          + Authorization: Bearer <cookie de access token>
backend   QUERY /<caminho-do-backend>
```

Arquivos dos boilerplates `login-tenancy-b2b/frontend` e `admin` (copiar para o produto): `proxy.ts` (primeiro `if (pathname.startsWith("/api/q/")) return proxyQuery(request)`), `lib/query-proxy.ts`, `lib/query-paths.ts`, `lib/query.ts` (helper `query<T>(caminho, corpo?)`), `lib/api-base-url.ts` e `app/api/auth/refresh/route.ts`.

Regras do proxy: só aceita `QUERY` (outro método em `/api/q/**` = **405** com `Allow: QUERY`, para o prefixo nunca virar proxy de escrita); sem cookie de sessão = 401 `NO_SESSION` em JSON (nunca redirect, é um `fetch`); caminho inválido (`//`, `\`, `%2F`, `%5C`) = 400 `QUERY_INVALID_PATH`; descarta `Authorization`, `X-Company-Id` e `Cookie` vindos do navegador. **Não habilite CORS em `/api/q`.**

```ts
import { query } from "@/lib/query";
const page = await query<{ items: unknown[]; totalRecords: number }>("audit-logs/search", { entity: "User", page: 1 });
```

O `query()` renova o token em 401 (chama `POST /api/auth/refresh` e repete **uma** vez), exceto `SESSION_REVOKED` e `PASSWORD_CHANGE_REQUIRED`. Produto que adapta a cópia: nomes dos cookies de `lib/admin-auth.ts`, base da API, rota de renovação (`QUERY_REFRESH_PATH`), cabeçalhos extras do BFF e o matcher do `proxy.ts` (`/api/q/**` não pode estar excluído).

> **Ainda sem consumidor real.** Nenhuma extension expõe hoje um endpoint `@QUERY`: a anotação existe no `lib-commons` e nos testes do security. O caminho de ponta a ponta contra um backend com `@QUERY` não foi exercitado; foi provado só em spike (Next 16.2.11) e em testes de unidade. **[não verificado de ponta a ponta]**

## Guardiões

`CompanyAccessGuardianIT` (13 cenários), `ReadOnlyAdminResourcesIT`, `CompanyAccessAdminInvariantIT`, `QueryMethodGuardianTest`, `CompanyAccessFilterTest`, `ReadOnlyPathMatcherTest`. As classes `*IT` do security não entram no `mvn install` padrão (rode com `-Dtest='*IT'`).
