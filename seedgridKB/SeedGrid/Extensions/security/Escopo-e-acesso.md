---
description: "Mudanças do ciclo escopo/acesso do security e do subdomain-tenancy (isolamento de RBAC entre tenants, propriedades isolation/account/platform-scope/admin-guard, permissões somente leitura, empresa sem DELETE, nome de role, cadastro por publicId, code no ProblemDetails, método QUERY). Leia antes de configurar permissões, roles ou cadastro de usuário. AINDA NÃO PUBLICADO."
tags: [seedgrid, extension, security, subdomain-tenancy, login-tenancy, rbac, escopo]
---

# security — Escopo e acesso (ciclo em andamento)

> **Status: NÃO PUBLICADO.** O ciclo ainda está aberto; as extensions só serão publicadas quando ele terminar. Até lá, estas mudanças **não existem** nas versões do Maven Central (`Versoes.md`). Não use nada daqui em um host que dependa das versões atuais. Quando a publicação sair, esta nota recebe a versão e seu conteúdo passa para a [[SeedGrid/Extensions/security/Configuracao|Configuração]] e a [[SeedGrid/Extensions/security/Visao-geral|Visão geral]].

Cobre `seedgrid-quarkus-ext-security`, `-login-tenancy`, `-subdomain-tenancy` e `-lib-commons`. Cada item tem `CHANGELOG.md` no repositório da extension.

## Fase 0 — isolamento de RBAC entre tenants

- **subdomain-tenancy:** o cache de permissões (RBAC) é particionado pelo tenant lido da claim `subdomain` do JWT. Antes, a mesma role (ex.: `ADMIN`) existente em dois tenants com permissões diferentes vazava permissões de um tenant para o outro. Sem tenant determinável o escopo **falha fechado**.
- **security:** editar permissões de uma role GLOBAL vale na hora para todas as contas e empresas (antes: até o TTL, 5 min). Alterar role de uma empresa invalida só o escopo dela.
- **Autenticação proativa:** `quarkus.http.auth.proactive=true` (padrão do security) funciona com o subdomain-tenancy. Hosts que desligavam a opção só por causa do 500 (`ContextNotActiveException`) podem remover o override (ex.: `lckfiscal`).
- **`seedgrid.subdomain-tenancy.tenant-header`** (`Optional<String>`) agora entra no mapping: definir por propriedade ou por variável de ambiente (`SEEDGRID_SUBDOMAIN_TENANCY_TENANT_HEADER`) não aborta o boot (antes: `SRCFG00050`). O header **nunca** redireciona para outro tenant: host e claim prevalecem.
- **SPI `SecurityScopeResolverProvider`:** novos métodos `default` `scopeFor(SecurityIdentity)` e `runInScope(identity, Supplier)`. Implementações antigas (só `currentScope()`) continuam válidas.
- **Guardiões:** `RbacTenantIsolationGuardianIT`, `ProactiveAuthGuardianIT` (proativo ligado), `ProactiveAuthDisabledGuardianIT` (desligado), `AccessRuleBookTest.editingAGlobalRoleReachesAccountsImmediately`.
- Compatibilidade: sem quebra para o host. Internamente as chaves de cache de RBAC mudaram de formato (entradas antigas expiram sozinhas).

## Fase 1 — configuração, limpeza e regras do security

### Propriedades novas

| Chave | Tipo | Padrão | Efeito |
|---|---|---|---|
| `seedgrid.security.isolation` | `shared-database` \| `dedicated-database` | `shared-database` | Modelo de dados do host; só define os padrões das propriedades abaixo. `login-tenancy` declara `shared-database`, `subdomain-tenancy` declara `dedicated-database`. |
| `seedgrid.security.account.enabled` | boolean | `true` em shared, `false` em dedicated | Liga/desliga `/me/security/*` (404 quando desligado). |
| `seedgrid.security.platform-scope.exempt` | lista | vazio em shared; `companies, users, roles, permissions:GET` em dedicated | Recursos isentos do `@PlatformScope` (entrada `recurso` ou `recurso:METODO`). |
| `seedgrid.security.admin-guard.scope` | `company` \| `database` | `company` em shared, `database` em dedicated | Escopo da invariante "mínimo 1 ADMIN ativo" (consumida na Fase 3 do ciclo). |

### Contratos e comportamento (quebras de compatibilidade)

- **Permissões somente leitura:** `PERMISSION_CREATE/UPDATE/DELETE` removidas (migration `V236`). Só `GET /permissions`.
- **Empresa só CRU:** sem `DELETE /companies/{publicId}`; `COMPANY_DELETE` removida (migration `V237`). Inativar/reativar = `PATCH /companies/{publicId}` com `active=false|true`; a última empresa ativa não se inativa.
- **Nome de role:** função única (trim, sem acento, espaço vira `_`, maiúsculas, `^[A-Z_]+$`, 5 a 30). Dígito/ponto/hífen/nome curto: 400 `ROLE_NAME_INVALID`. `ADMIN` é reservado em `shared-database`: 409 `ROLE_NAME_RESERVED`.
- **Audience:** role com permissões de mais de uma audience não-nula: 400 `ROLE_MIXED_AUDIENCE` (curinga entra em qualquer role).
- **Delegação por perfis:** quem cadastra usuários escolhe o perfil sem ter as permissões dele, exceto perfil com `USER_*`/`ROLE_*`/`COMPANY_*` que o chamador não tenha: 403 `ROLE_NOT_DELEGABLE`.
- **Cadastro de usuário só por `publicId`:** `POST/PATCH /users` usam `rolePublicIds` (roles globais) e `memberships: [{companyPublicId, rolePublicIds}]`. `roleIds`/`companyIds` (Long) e `root`/`isRoot` não existem na API (ignorados). `PUT /users/{publicId}/memberships/{companyPublicId}` recebe `{rolePublicIds}` (sem `isRoot`; root não é atribuível). Em `/me/security/users`, `roleIds` virou `rolePublicIds`. As empresas de destino precisam estar entre as do chamador, com a permissão em cada uma (plataforma não é restringida): 403 caso contrário.
- **Erros com `code`:** `ProblemDetails` (lib-commons) ganhou o campo opcional `code`.
- **Método HTTP `QUERY`:** anotação `@QUERY` no lib-commons (corpo na consulta; seguro como o GET). Navegadores não têm API para ele: o front chama pelo BFF/proxy.
- **subdomain-tenancy (`dedicated-database`):** `/me/security/*` responde 404; o ADMIN de um tenant com 2+ empresas usa `/users`, `/roles`, `/companies` e lê `/permissions` (antes 403).

### Migração do host

- Front/BFF que enviam `roleIds`, `companyIds` ou `isRoot` no cadastro de usuário devem trocar para `rolePublicIds`/`memberships`. A atualização dos boilerplates faz parte do ciclo.
- Hosts que não definem `isolation` não mudam de comportamento, exceto pelas quebras de contrato acima, que valem para todos.

### Guardiões da Fase 1

`PermissionsReadOnlyGuardianTest`, `CompanyNeverDeletedGuardianTest`, `NoSgPermissionAllowedGuardianTest`, `MigrationNumberingGuardianTest`, `AccountManagementDedicatedDatabaseGuardianTest`, `PlatformScopeDedicatedDatabaseGuardianTest`, `QueryMethodGuardianTest`, `AccessRuleBookTest` (nome de role, audience, delegação, empresa só CRU, contrato por publicId), exemplo `TenantAdminTwoCompaniesGuardianIT`.

## Pendente neste ciclo

- Fase 1b (B2C, `cpf_cnpj`): o insumo ainda não chegou.
- Fase 4 (T4.0): limitação da API key com `quarkus.http.auth.proactive=true`.
- Fases 3, 5 e 7: invariante de ADMIN, boilerplates.
