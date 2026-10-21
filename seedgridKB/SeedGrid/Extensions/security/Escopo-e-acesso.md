---
description: "Mudanças do ciclo escopo/acesso do security e do subdomain-tenancy (isolamento de RBAC entre tenants, propriedades isolation/account/platform-scope/admin-guard, permissões somente leitura, empresa sem DELETE, nome de role, cadastro por publicId, code no ProblemDetails, método QUERY; B2C com pessoa física, cpf_cnpj, signup pessoal e termos de uso; revogação imediata de sessão SESSION_REVOKED e failover do cache; estado de acesso da empresa (READ_ONLY, DISABLED, COMPANY_ACCESS_MODE_UPDATE, cota de empresas, inadimplência no billing); login social Google e Facebook (módulo security-social, V270); invariante de mínimo 1 ADMIN ativo, 409 LAST_ADMIN_PROTECTED e LastAdminGuard; roles de integração com for_integration, V255 e API key com auth proativa). Leia antes de configurar permissões, roles ou cadastro de usuário. AINDA NÃO PUBLICADO."
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
| `seedgrid.security.platform-scope.exempt` | lista | vazio em shared; `companies, users, roles, permissions:GET` em dedicated | Recursos isentos do `@SgPlatformScope` (entrada `recurso` ou `recurso:METODO`). |
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
- **Login social (decisão para a Fase 2b, 2026-10-19):** o e-mail do provedor é opcional (o Facebook nem sempre devolve); a identidade é `(provider, subject)`, sem coluna por rede; sem e-mail verificado o fluxo pede e confirma o e-mail antes de criar ou vincular; CPF não é pedido no login social. Implementado na Fase 2b abaixo.

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
- **Falha fechada na leitura do marcador (correção E12):** token sem `sub`/`iat` havendo marcador resulta em 401. A leitura do marcador roda em **modo estrito**: erro do provider de cache resulta em **401 `SESSION_REVOKED`** com `seedgrid.cache.if-provider-is-down` em `WARN` **ou** `ERROR` (antes, em `WARN`, o token revogado voltava a valer).
- **Com failover do cache:** a leitura cai na memória local, que não tem os marcadores gravados antes da queda. Enquanto o cache estiver em failover, **todo token emitido antes do início da queda responde 401** (o usuário entra de novo); o emitido depois é conferido contra a memória, e os marcadores gravados durante a queda voltam ao provider pelo journal. O início da queda vem de `CacheFailoverStatus.failoverSinceMillis()` (lib-cache). Coberto por testes unitários e pelo `SessionRevocationGuardianIT`; **ainda não há teste de ponta a ponta com Redis real caindo no meio de uma requisição**. Não publicado.
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

## Fase 2b — login social (Google e Facebook)

Cobre `security`, `login-tenancy` e o **módulo novo e opcional** `seedgrid-quarkus-ext-security-social` (usa `quarkus-oidc`; host que não o adiciona não carrega OIDC). Migration nova do security: **V270** (`user_identity`, `social_login_pending`, `users.password` anulável). **Verificado com servidor OIDC falso:** o login com Google e Facebook reais ainda não foi testado (fica para a fase E2E, manual do dono).

### Como funciona

- Cada provedor é um tenant OIDC `web-app` escolhido por caminho (`/public/auth/social/{provider}/**`). O callback termina no `SocialLoginService` do security, que aplica a política e emite o token SeedGrid (o mesmo `AuthResponse` do login por senha).
- Convive com e-mail e senha: a mesma conta pode ter os dois métodos; desvincular um mantém o outro. Remover o último método devolve **409** `LAST_LOGIN_METHOD`.

### Propriedades

| Chave | Efeito |
|---|---|
| `seedgrid.security.social.providers` | Lista (`google,facebook`; use `google`, **não** `gmail`). Ausente ou vazia: nenhum provedor (módulo inerte). Id desconhecido ou provedor sem credencial: **o boot falha** com mensagem clara. Provedor desligado: 404 `SOCIAL_PROVIDER_DISABLED` |
| `seedgrid.security.social.<provedor>.*` | `client-id`, segredo, `redirect-uri` (por ambiente) e segredos de estado e de cookie (≥ 32 caracteres, **os mesmos em todos os pods**) |
| `seedgrid.security.social.allowed-return-hosts` | Hosts permitidos em `returnTo` (anti open-redirect) |
| `seedgrid.security.social-login.*` | `pending-ttl`, `code-ttl`, `max-code-attempts` (fluxo de e-mail) |

### Contrato

- `GET /public/auth/social/{provider}/login?returnTo=&acceptedTerms=&termsVersion=` inicia o fluxo e volta em `returnTo` com `?ticket=` (sucesso) ou `?status=EMAIL_REQUIRED&pendingToken=`, `TERMS_REQUIRED` ou `REJECTED&code=`.
- `POST /public/auth/social/exchange {ticket}` devolve o `AuthResponse` (ticket de uso único, TTL 60 s). O 2FA ativo continua valendo.
- Provedor sem e-mail (Facebook): `POST /public/social/email {pendingToken,email}` envia um **código de 6 dígitos** e `POST /public/social/confirm-email {pendingToken,code}` cria ou vincula e autentica. Não existe confirmação só por link (o código evita sessão por link aberto em outro navegador). A segunda entrada com o mesmo `(provider, sub)` entra direto.
- `GET /me/identities`, `DELETE /me/identities/{publicId}` (204 ou 409 `LAST_LOGIN_METHOD`) e `POST /me/password` (primeira senha de conta social).
- `GET /public/signup/config` traz `socialProviders` (lista habilitada; o front só mostra os botões dela).

### Política de segurança

Identidade = `(provider, subject)`, nunca o e-mail. Vincular a usuário existente só com e-mail verificado (a senha anterior é invalidada se o e-mail dele não estava confirmado). Login por senha de conta sem senha dá o mesmo 401 genérico. 2FA mantido. O último método não sai. "Esqueci a senha" exige e-mail confirmado (403). Desvincular e trocar senha revogam sessões. CPF não é pedido no login social. O aceite de termos é exigido na criação quando `seedgrid.security.terms.required`. B2C só no login-tenancy (`SocialAccountCreator` ligado com `customer-type` B2C ou BOTH).

### Facebook (spike, quarkus-oidc 3.30.8, sem conta real)

Preset `provider=facebook` é OIDC com ID token: sem discovery e sem PKCE; o ID token vem sem `email`/`email_verified`; o preset aceitou `iss` errado (fixado `token.issuer`); segredo do cliente por `post`; access token opaco exige `verify-access-token=false`. **A confirmar na conta real (E2E):** `id_token` com escopo `openid`, `iss`/`aud`, versão da Graph API e exigências da Meta (política de privacidade e exclusão de dados).

### Cookie de sessão OIDC

O `quarkus-oidc` autentica **qualquer** caminho que receba o cookie `q_session_*`. Mitigações: `cookie-path` restrito, cookie apagado no callback, `SocialIdentityPathGuard` (401 fora do fluxo) e o `RbacSecurityIdentityAugmentor` ignora identidade com `tenant-id`.

### Quebras de compatibilidade

- Login por senha de conta só-social: o mesmo 401 genérico.
- "Esqueci a senha" exige e-mail confirmado (403).
- `users.password` aceita NULL: SQL cru que assuma NOT NULL deve ser revisado.

### Guardiões da Fase 2b

`SocialLoginPolicyGuardianIT`, `SocialLoginNoEmailGuardianIT`, `SocialLoginSameAccountGuardianIT`, `SocialLoginTermsGuardianIT`, `PasswordServiceNullSafeTest` (security); `SocialLoginFlowGuardianIT`, `SocialFacebookNoEmailEndToEndGuardianIT`, `SocialLoginChainGuardianIT`, `SocialNoTenantBootGuardianIT`, `SocialMultiPodA/B/CIT` (módulo social); `SocialAccountCreatorIT` (login-tenancy).

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

## Fase 5 — estado de acesso da empresa, somente leitura e cota de empresas

### Estado da empresa (security)

- `companies.access_mode`: `ACTIVE` (padrão), `READ_ONLY` ou `DISABLED`, com data e motivo da última mudança. Quem muda é o billing ou o host, por `CompanyAccessService.setMode(companyPublicId, mode, reason)` ou `PUT /companies/{publicId}/access-mode`; o security só aplica.
- `READ_ONLY`: o login funciona; `GET`, `HEAD`, `OPTIONS` e `QUERY` passam; qualquer outro método dá **403 `COMPANY_READ_ONLY`**, salvo caminho da lista de exceções ou método com `@SgReadOnlySafe`. Vale para JWT e API key. Job interno não passa pelo filtro: use `CompanyAccessService.isWritable(companyId)`.
- `DISABLED`: login, `select-company` e `refresh` nessa empresa dão **403 `COMPANY_DISABLED`**; as sessões existentes caem (401 `SESSION_REVOKED`). Voltar a `ACTIVE` exige novo login.
- Toda mudança real revoga as sessões da empresa, audita e dispara `CompanyAccessChangedEvent` (síncrono, na transação; para e-mail use `@Observes(during = TransactionPhase.AFTER_SUCCESS)`).
- Proteções: a empresa da plataforma nunca muda (409 `COMPANY_ACCESS_PLATFORM_PROTECTED`); a conta nunca fica com todas as empresas `DISABLED` (409 `COMPANY_ACCESS_ALL_DISABLED`); em `dedicated-database`, desligar a empresa do único ADMIN dá 409 `LAST_ADMIN_PROTECTED`.
- Front: `AuthResponse.currentCompany { publicId, name, accessMode, personType }`; `GET /me/companies` traz `accessMode` e `personType`. O BFF repassa o 403 com o `code`; o front trata `COMPANY_READ_ONLY` e `COMPANY_DISABLED`.
- **Permissão `COMPANY_ACCESS_MODE_UPDATE`** (V261, audiência `platform`): **não é concedida ao ADMIN do tenant**, para não quebrar a delegação de papéis. O host cria um perfil da plataforma com ela e o atribui aos operadores da empresa-plataforma. O billing não precisa dela (chama `setMode` direto).
- Propriedades: `seedgrid.security.company-access.cache-ttl` (`PT60S`; cache fora do ar lê o banco), `...read-only.allowed-paths` (**sobrescrever substitui o padrão**) e `...read-only.contributions.<nome>` (aditiva; prefira esta).
- **Cota de empresas**: SPI `CompanyQuotaValidator`, chamado ao criar e ao reativar empresa; padrão sem limite; a implementação do host lança `CompanyQuotaExceededException` (**402 `COMPANY_QUOTA_EXCEEDED`**). Migrations V260 e V261.

### Billing (cota, downgrade e inadimplência)

- `PlanTerm`: `maxCompanies`, `maxReadOnlyCompanies`, `pastDueReadOnlyAfterDays`, `pastDueDisableAfterDays` (nos limites, nulo ou `0` = sem limite; nos prazos, nulo usa a propriedade e `0` não aplica o passo). O billing implementa o SPI de cota (402 ao criar ou reativar além do limite).
- Downgrade: `change-plan` aceita `companySelection { keepActive, readOnly, disable }` com contagens exatas (erro = 400 e nada muda); a escolha é agendada para a virada do ciclo. A empresa do responsável e a que o `LastAdminGuard` protege nunca mudam.
- Evento `CompanyAccessEvent` (`CHANGE_SCHEDULED`, `CHANGE_APPLIED`, `RESTORED`); o billing não envia e-mail, o host observa e avisa.
- Inadimplência **desligada por padrão** (`seedgrid.billing.past-due.enabled=false`; `read-only-after-days=7`, `disable-after-days=30`). Ligada, substitui o bloqueio geral 402 `PAYMENT_PAST_DUE`; pagar devolve só as empresas que o billing mexeu. O subdomain-tenancy traz o gateway por tenant.
- Limites: o teste de API key imita o filtro real; inativar empresa ainda conta as `DISABLED` ao proteger a "última ativa".
- Guardiões: `CompanyAccessGuardianIT`, `CompanyAccessAdminInvariantIT`, `CompanyAccessFilterTest`, `ReadOnlyPathMatcherTest`, `CompanyAccessProblemMappingTest`. As classes `*IT` do security não entram no `mvn install` padrão.

## Pendente neste ciclo

- Fase 7: boilerplates.
