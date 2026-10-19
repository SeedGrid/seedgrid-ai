---
description: "Mudanças do ciclo escopo/acesso do security e do subdomain-tenancy (isolamento de RBAC entre tenants, propriedades isolation/account/platform-scope/admin-guard, permissões somente leitura, empresa sem DELETE, nome de role, cadastro por publicId, code no ProblemDetails, método QUERY; B2C com pessoa física, cpf_cnpj, signup pessoal e termos de uso; revogação imediata de sessão SESSION_REVOKED e failover do cache; invariante de mínimo 1 ADMIN ativo, 409 LAST_ADMIN_PROTECTED e LastAdminGuard; roles de integração com for_integration, V255 e API key com auth proativa). Leia antes de configurar permissões, roles ou cadastro de usuário. AINDA NÃO PUBLICADO."
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

## Fase 2 — revogação imediata de sessão e failover do cache

Cobre `security`, `lib-cache` (core, redis, valkey, dragonfly) e os fronts. Sem migration nova (faixa V245–V249 intacta).

### Marcador de revogação de sessão (security)

- Depois de revogar, todo token emitido **antes** do marcador responde **401** `application/problem+json` com `code: SESSION_REVOKED`. Token novo (login depois da revogação) funciona. **API keys ignoram o marcador** (não têm `iat` de sessão).
- Escopos, em 3 chaves no cache: usuário, usuário+empresa e empresa. Chaves `sg:session-revoked:{escopo}:{user}`, `…:{user}:{company}` e `…:company:{company}`. Valor = epoch em ms; TTL = o do access token (`seedgrid.security.jwt.ttl`, padrão 8 h). `{escopo}` é a claim `subdomain` (subdomain-tenancy) ou `default`.
- **Falha fechada:** erro ao ler o cache, ou token sem `sub`/`iat` havendo marcador, resulta em 401.
- Quem grava o marcador: desativar/excluir usuário; trocar senha (própria, reset por admin e `reset-password`); desativar/remover vínculo; inativar empresa (`PATCH /companies` com `active=false`). Ganchos prontos e sem chamador: mudança de estado da empresa (Fase 5, `revokeCompany`) e desvincular identidade social (Fase 2b, `revokeUser`).
- O `iat` tem resolução de segundo: login no mesmo segundo da revogação também recebe 401 (lado seguro). A claim `companyPublicId` passou a ser emitida no token. Token sem empresa escopada não cai ao remover vínculo com empresa que ele não escopa.

### Quebras de compatibilidade

- O token de um membro desativado deixa de funcionar (antes: 200 com `active=false`).
- `JwtAuthenticationFilter` e `TokenService` ganharam parâmetros de construtor; afeta só quem os instancia à mão.

### Failover do cache (lib-cache)

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.cache.failover.enabled` | `false` | Liga o modo FAILOVER (equivale a `seedgrid.cache.if-provider-is-down=FAILOVER`) |

- Primeira falha do Redis/Valkey/Dragonfly troca para memória local (a operação que falhou já é atendida). Um journal limitado (última escrita por chave, máximo de entradas e TTL) é reaplicado na volta com o TTL restante. A sondagem periódica só roda com provider distribuído e caído.
- Alertas por mudança de estado via `seedgrid-notification-api`: eventos `platform.cache-provider-down` e `platform.cache-provider-recovered`, janela anti-flood de 15 min com oscilações acumuladas e lembrete a cada 6 h durante a queda. Sem o `ext-notification` presente, o alerta não tem efeito.
- O `lib-cache` passa a depender de `seedgrid-notification-api` (só a API).

### Front

401 com `code: SESSION_REVOKED` limpa a sessão, **não tenta refresh** e vai ao login com "Sua sessão foi encerrada. Entre novamente." O parser puro (`extractProblemCode`/`isSessionRevokedBody`) está nos boilerplates (frontend e admin), no `lckfiscal`, no Pulse e no cliente do report.

### Guardiões da Fase 2

`SessionRevocationGuardianIT` (um no exemplo `login-tenancy`, outro no `subdomain-tenancy`), `SessionRevocationTest`, `JwtAuthenticationFilterRevocationTest`, `SessionRevocationServiceTest` (security); `FailoverCacheTest` e `SeedGridCacheRedisFailoverIT` (lib-cache, com Redis real parando e subindo).

## Fase 3 — invariante "mínimo 1 ADMIN ativo"

Cobre `security` e `billing` (billing-core). Sem migration nova (faixa V250–V254 intacta).

### Regra

- **No mínimo 1 ADMIN ativo** (não exatamente 1) por empresa. ADMIN é a role de **sistema**, global e ativa (`is_system`, `company_id` nulo), nunca só pelo nome. "Ativo" = `active = true` no usuário e no vínculo. A autoridade segue `User.effectiveRoles` (roles do vínculo; se vazias, as globais).
- Escopo por `seedgrid.security.admin-guard.scope` (padrão do `isolation`): `company` (shared-database: cada empresa mantém ≥ 1 ADMIN ativo) ou `database` (dedicated-database: o banco mantém ≥ 1 ADMIN em empresa ativa, e ADMIN global sem vínculo também conta, **e** cada empresa mantém ≥ 1 usuário ativo com acesso).
- Erro: HTTP **409** `code: LAST_ADMIN_PROTECTED`; a mensagem lista as empresas (publicIds) que impedem.
- Caminhos cobertos: excluir/desativar usuário (a operação global confere todas as empresas do usuário), desativar/remover vínculo, trocar roles do vínculo, remover empresa do `user_companies` e inativar empresa (no escopo `database` só recusa se a empresa guarda o único ADMIN do banco; no `company` continua 200). A role `ADMIN` segue imutável (403 `RoleProtectedException`).
- Sucessão: atribui-se ADMIN a outro e depois se inativa o antigo. Plataforma e conta PF seguem a mesma regra.
- Concorrência: verificação na mesma transação com `SELECT … FOR UPDATE` nas empresas envolvidas (todas, no escopo `database`), em ordem de id. O lock só protege se o chamador estiver na mesma transação da mudança.

### Quebras de compatibilidade

- O **422** de "último root" vira **409** `LAST_ADMIN_PROTECTED`; `LastRootUserDeletionException` e `LastRootUserDemotionException` foram removidas. Clientes que tratavam o 422 devem tratar o 409.
- `is_root` deixou de proteger contra remoção: um root sem a role ADMIN pode ser removido.
- O `billing` passa a exigir a versão do `security` que traz o `LastAdminGuard`.

### API para hosts (`br.com.seedgrid.security.services.LastAdminGuard`)

- `checkDeactivation(Long companyId, Collection<Long> userIds)`: lança `LastAdminProtectedException` (409) se desativar ou remover esses usuários violar a regra.
- `Set<Long> protectedUsers(Long companyId, Collection<Long> userIds)`: quais não podem sair. Se o conjunto inteiro violaria, devolve todos os ADMIN do conjunto; quem decide qual manter é o chamador.
- Qualquer código de host que altere vínculo, role ou `active` de usuário fora de `UserService`/`CompanyService` **deve chamar o guard**.

### Billing (downgrade por cota de assentos)

- `SeatService` usa o `LastAdminGuard`. O preview traz `protectedUserPublicIds` (campo novo em `SeatSelectionResponse`, também em `ChangePreviewResponse.seatSelection` e no preview de checkout). Os protegidos saem de `eligibleUsers` mas continuam ocupando vaga. Confirmar a desativação do último ADMIN devolve 409 `LAST_ADMIN_PROTECTED`. As viradas automáticas (ciclo e ativação) pulam os protegidos e registram aviso no log.
- Conta sem `companyId` (gateway customizado, ex.: subdomain-tenancy) **falha fechado**: o gateway informa os ADMIN ativos em `AccountMembersGateway#activeAdminPublicIds` (novo; padrão vazio). Responsável ADMIN: nada protegido; senão todo candidato ADMIN fica protegido. Gateway que não responde protege todos os candidatos. O `SubdomainAccountMembersGateway` consulta o banco do tenant.

### Auditoria: corrida na criação do usuário auditado (ext-audit)

Duas primeiras operações auditadas do mesmo principal ao mesmo tempo davam 500 (`duplicate key audit_log_users_user_name_key`). Corrigido com `INSERT … ON CONFLICT (user_name) DO NOTHING` seguido de releitura (postgresql); no mongodb a duplicidade é ignorada. O contrato não muda. **Só chega aos hosts com o bump do `ext-audit` e de `seedgrid.audit.version` nos consumidores.**

### Telas de admin

O 409 `LAST_ADMIN_PROTECTED` já aparece no toast com a lista de empresas. As telas ainda travam o root por conservadorismo; a regra de negócio é do backend.

### Guardiões da Fase 3

`LastAdminGuardianIT`, `LastAdminDatabaseScopeGuardianIT`, `LastAdminGuardTest` (security); `SeatServiceTest` e `SubscriptionFlowTest` (`downgradeNuncaEliminaOUltimoAdminDaEmpresa`, `checkoutEmPlanoComMenosVagasRecusaDesativarOUltimoAdmin`, `empresaComUmUnicoUsuarioAtivoNaoExigeSelecaoNemPerdeOAdmin`) no billing; `JpaAuditLogUsersConcurrencyIT` (ext-audit).

## Fase 4 — roles de integração e `apikeys`

Cobre `security`, `apikeys` e `subdomain-tenancy`. Migration nova do security: **V255**.

### Regra

- `permissions.for_integration` = "pode ser concedida a integrações". `roles.for_integration` = "é role de integração" (nunca atribuída a usuário; só via API key).
- Toda permissão nasce `for_integration = false`. **A software house libera por migration do host:** `UPDATE permissions SET for_integration = true WHERE name IN (...)`. O cliente nunca libera.
- Role de integração só aceita permissões liberadas: **422** `PERMISSION_NOT_FOR_INTEGRATION` (criar, alterar ou transformar role comum em integração; rota da conta `/me/security/roles` e a global `/roles`).
- Quem monta a role não concede permissão que não tem: **403** `INTEGRATION_PERMISSION_NOT_HELD` (só o acréscimo é conferido; fora de requisição autenticada não se aplica).
- O dono altera e exclui as próprias roles de integração (antes: `RoleProtectedException`); só as de **sistema** seguem protegidas.
- Excluir role que tem API key, mesmo revogada: **409** `RoleInUseException` (SPI `RoleUsageChecker`, implementado pelo `apikeys`), no lugar de 500 por FK.
- `PermissionDTORes.forIntegration` (também em `/me/security/roles/permissions`). `GET /apikeys/roles` lista as roles de integração ativas com `permissions` (só as liberadas). `requireRole` casa o nome exato.

### V255

- Coluna `permissions.for_integration BOOLEAN NOT NULL DEFAULT FALSE`.
- Remove de `role_permissions` os vínculos não liberados **só das roles de integração**; as demais roles não se relacionam com o flag.
- Trigger `trg_permission_revoke_integration`: se o host faz `UPDATE permissions SET for_integration = FALSE`, a permissão sai das roles de integração.

### Migração do host

- **Antes de criar role de integração, o host precisa liberar a permissão.**
- Roles de integração existentes perdem na V255 os vínculos não liberados: o host **libera as permissões e refaz o vínculo** em migration própria e idempotente. Exemplos: boilerplates (`V3004`, e `V3102` no `app-tenant`; `INTEGRACAO_USUARIOS` com `USER_READ/CREATE/UPDATE`) e report (`V3003`; `AGENTE_REPORT` com `AGENTE_CAMBIO_READ` e `AGENTE_PULSE_CREDENTIAL`).
- Role criada por `em.persist` ou SQL direto, sem liberar a permissão, não quebra testes, mas **ainda pode violar a invariante**: a garantia está no `RoleService` e na V255.
- Front (boilerplates e report-admin): `role_edit` com "Uso para integração" mostra só as permissões liberadas; `apikey_edit` mostra as liberadas da role escolhida.

### API key com `quarkus.http.auth.proactive=true` (subdomain-tenancy)

- Com `proactive=true` a autenticação roda antes do filtro de tenant e sem contexto CDI; a chave dava 500. Novo SPI `ApiKeyScopeRunner` (`apikeys`; padrão só executa) e `SubdomainApiKeyScopeRunner` (`subdomain-tenancy`): o tenant vem do `X-Forwarded-Host` ou do `Host`, senão `master`. `X-Tenant` e `X-Company-Id` não participam. Sem container CDI, falha fechada.
- `ApiKeyAuthenticationRequest` ganhou `host` e `forwardedHost` (o construtor antigo foi mantido).

### Guardiões da Fase 4

`IntegrationRoleGuardianIT`, `PermissionForIntegrationMigrationIT`, `AccessRuleBookTest` (invertido), `ApiKeyIsolationGuardianIT` (no subdomain-tenancy, com `proactive=true`, e no login-tenancy), `ApiKeyRoleSelectionTest`, `ApiKeyRoleInUseTest`, `SubdomainApiKeyScopeRunnerTest`, `RoleDeIntegracaoDoAgenteTest` (report).

## Pendente neste ciclo

- Fase 2b: login social (decisão acima registrada, sem implementação).
- Fases 5 e 7: estado de empresa, boilerplates.
