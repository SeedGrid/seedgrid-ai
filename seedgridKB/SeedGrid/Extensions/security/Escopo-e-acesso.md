---
description: "Mudanças do ciclo escopo/acesso do security e do subdomain-tenancy (isolamento de RBAC entre tenants, propriedades isolation/account/platform-scope/admin-guard, permissões somente leitura, empresa sem DELETE, nome de role, cadastro por publicId, code no ProblemDetails, método QUERY; B2C com pessoa física, cpf_cnpj, signup pessoal e termos de uso). Leia antes de configurar permissões, roles ou cadastro de usuário. AINDA NÃO PUBLICADO."
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

## Fase 1b — B2C: pessoa física, `cpf_cnpj`, cadastro e termos

Cobre security, billing-core, login-tenancy e subdomain-tenancy. B2C vale **só para o `login-tenancy`** (`shared-database`); o `subdomain-tenancy` segue PJ (`tenants.cnpj`).

### Propriedades novas

| Chave | Tipo | Padrão | Efeito |
|---|---|---|---|
| `seedgrid.login-tenancy.signup.customer-type` | `B2B` \| `B2C` \| `BOTH` | `B2B` | Quem pode se cadastrar. Fora do tipo: 403 `SIGNUP_TYPE_NOT_ALLOWED`. |
| `seedgrid.security.terms.required` | boolean | `false` | Exige aceite dos termos no cadastro e no login. |
| `seedgrid.security.terms.version` | string | `1` | Versão vigente; subir a versão exige novo aceite. |
| `seedgrid.security.terms.documents.<nome>` | URL | vazio | Documentos públicos (ex.: `terms`, `privacy`). |

### Contratos e comportamento (quebras de compatibilidade, sem alias)

- **`companies`** (migration V238 do security): `person_type` (`PJ` \| `PF`); `cnpj` virou `cpf_cnpj` e `cnpj_hash` virou `cpf_cnpj_hash`, ambos **anuláveis** (PF pode não ter CPF; dois PF sem documento não colidem). API: `personType` e `cpfCnpj` em `CompanyDTOReq/Patch/Res`; **não existe mais `cnpj`**. PJ exige CNPJ válido (inclui alfanumérico); PF aceita CPF válido ou nenhum. Erro: 400 `COMPANY_DOCUMENT_INVALID`; documento repetido: 409.
- **Empresa-plataforma** continua sendo a `Company` PJ cujo CNPJ é `seedgrid.security.default-company.cnpj` (propriedade inalterada). Empresa PF nunca é plataforma.
- **`accounts`** (billing-core, V514): `cpf_cnpj` anulável e `person_type`; `AccountHolder(companyId, personType, cpfCnpj, ...)`; `GET /admin/accounts?personType=PF|PJ`; `AdminAccountResponse` e `AccountOptionResponse` trazem `personType` e `cpfCnpj` (sem `cnpj`).
- **`signup_request`** (login-tenancy, V704 e V705): `cpf_cnpj`, `person_type`, índice de pendente PF por e-mail; guarda o aceite dos termos até a confirmação do e-mail.
- **Endpoints do login-tenancy:**
  - `POST /public/signup` (empresa): campo `cpfCnpj` (CNPJ) no lugar de `cnpj`.
  - `POST /public/signup/personal` (PF): `name`, `email`, `password`, `whatsapp`, `cpf` (opcional), `acceptedTerms`, `termsVersion`. E-mail que já tem conta: **409** (PF nunca vincula).
  - `GET /public/signup/document-status?cpfCnpj=` substitui `cnpj-status`.
  - `GET /public/signup/config` devolve `{customerType, termsRequired, termsVersion, termsDocuments}` (o front monta PF, PJ ou o seletor).
  - `SignupConfirmedEvent(personType, cpfCnpj, ...)`.
- **Termos** (security, V239): tabela `terms_acceptance` (um registro por usuário e versão, com instante, IP e user-agent); `GET /public/terms`; `POST /me/terms/accept` (`{version}`; versão diferente da vigente: 409 `TERMS_VERSION_MISMATCH`); o login devolve `termsAcceptanceRequired`; cadastro sem aceite da versão vigente: 400 `TERMS_NOT_ACCEPTED`.
- **Login social (decisão para a Fase 2b, 2026-10-19):** o e-mail do provedor é opcional (o Facebook nem sempre devolve); a identidade é `(provider, subject)`, sem coluna por rede; sem e-mail verificado o fluxo pede e confirma o e-mail antes de criar ou vincular; CPF não é pedido no login social. Ainda não implementado.

### Migração do host

- Trocar `cnpj` por `cpfCnpj` em payloads e na leitura de `Company` e `Account`. `Company#getCnpj` virou `getCpfCnpj` e `CompanyRepository.findByCnpj` virou `findByDocument`.
- Host com SQL cru em `companies`, `accounts` ou `signup_request` (ex.: provisionamento do subdomain-tenancy) usa `cpf_cnpj` e `cpf_cnpj_hash`.
- Host que não muda `customer-type` nem `terms.required` continua B2B e sem termos.
- Front: campo de documento com `SgInputCPFCNPJ` (ou `SgInputCPF`/`SgInputCNPJ` quando o tipo é fixo); veja as regras FE-13 e FE-29.

### Guardiões da Fase 1b

`PlatformCompanyNullSafeGuardianIT`, `TermsAcceptanceGuardianIT` (security); `SignupCustomerTypeB2bGuardianIT`, `SignupCustomerTypeB2cGuardianIT`, `SignupTermsGuardianIT` (login-tenancy); `SignupPersonalIT`, `CompanyPersonTypeResourceTest`, `DocumentValidatorTest`, `AdminAccountTest` (filtro PF/PJ) e `LegacyHostSchemaMigrationTest` (V514 sobre banco legado).

## Pendente neste ciclo

- Fase 2b: login social (decisão acima registrada, sem implementação).
- Fase 4 (T4.0): limitação da API key com `quarkus.http.auth.proactive=true`.
- Fases 3, 5 e 7: invariante de ADMIN, boilerplates.
