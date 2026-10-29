# Bateria E2E do backend (TE.1) - cobertura item a item

Local: `boilerplate/subdomain-tenancy/backend/src/test/java/br/com/seedgrid/app/api/e2e/`.
HTTP real (porta real do app, `Host` de cada tenant), `@QuarkusTest` + RestAssured, Postgres via Testcontainers
(`E2ePostgresResource`, mesmo padrao do `BootPostgresResource`). Os tenants nascem pelo fluxo publico
(`POST /public/tenants` + `POST /public/tenants/validate-email`, com o codigo lido do master). Nenhum teste esta
`@Disabled`. A sonda `E2eProbeResource` e' so' de teste (alvo para permissao, escrita, `QUERY`, `@SgReadOnlySafe`).

Cenario: `empalfa` (SP) e `empbeta` (RJ) para isolamento/sessao/calendario; `empgama` para estado de acesso; tenants
novos por teste para o que destroi estado (invariante do ADMIN, limites, downgrade, inadimplencia); o master e' o `Host`
sem subdominio (`crm.seedgrid.com.br`).

| Item da TE.1 | Teste | Obs. |
|---|---|---|
| Isolamento de RBAC entre tenants | `TenantIsolationE2eTest.rbacCacheDoesNotLeakBetweenTenantsThatShareTheAdminRoleName`, `usersRolesAndCompaniesListedAreOnlyThoseOfTheTenantOfTheHost`, `ProactiveAuthOffE2eTest.jwtOnEndpointWithPermissionAnswers200Or403NeverServerError` | |
| Isolamento de token | `TenantIsolationE2eTest.tokenOfOneTenantIsRejectedOnTheOtherTenantAndOnTheMaster`, `tenantAdminCredentialsDoNotLogInOnTheOtherTenantNorOnTheMaster`, `masterAdminLogsInOnTheMasterHostAndItsTokenDoesNotOpenAnyTenant` | o do master esta VERMELHO: BUG-1 |
| Isolamento de API key | `TenantIsolationE2eTest.apiKeyBelongsToItsTenantOnly`, `apiKeyStopsWorkingWhenItsRoleLosesTheIntegrationFlagOrIsDeactivated`, `ProactiveAuthOffE2eTest.apiKeyWorksOnItsTenantAndIsRejectedOnTheOthers` | |
| `tenant-header` | `TenantIsolationE2eTest.tenantHeaderNeverSelectsOrRedirectsTheTenantOfARequest`, `forwardedHostCannotRedirectACredentialToAnotherTenant` | por desenho (README/ARQUITETURA da extension) o header so' vale com o contexto vazio, o que nao ocorre em requisicao JAX-RS: o teste trava "o header nao muda o tenant" |
| `auth.proactive` nos dois modos | `E2eProfile` (`true`, padrao do produto) rodando todas as classes; `ProactiveAuthOffE2eTest` (`false`, perfil `E2eProactiveOffProfile`) | |
| Sessao revogada: vinculo, usuario, empresa, senha | `SessionRevocationE2eTest` (6 testes: desativar usuario, remover vinculo, senha propria, senha pelo admin, inativar empresa, editar nome nao revoga); `ProactiveAuthOffE2eTest.revokedSessionStillDropsTheToken`; `CompanyAccessE2eTest.disabledCompany...` (DISABLED derruba as sessoes) | o teste de empresa inativa tem uma asserção VERMELHA: BUG-3 |
| Invariante do ADMIN | `AdminInvariantE2eTest` (8 testes, um tenant novo por teste) | 2 vermelhos: BUG-2 e BUG-4 |
| Roles de integracao | `IntegrationRolesE2eTest` (4), `TenantIsolationE2eTest.integrationRoleOfTheBoilerplateIsListedAndLimitedToItsPermissions`, `aPerfilThatIsNotForIntegrationCannotBackAnApiKey` | usa a role `INTEGRACAO_USUARIOS` semeada pelo boilerplate (V3003/V3102) |
| Cadastro de usuario com empresas | `UsersCompaniesAndTermsE2eTest.userIsRegisteredWithTwoCompaniesAndADifferentProfilePerCompany`, `registrationIsRefusedForUnknownCompanyDuplicateEmailAndMissingProfile`, `aUserOfAnotherTenantIsNeitherVisibleNorEditableHere` | |
| `@SgPlatformScope` isento | `UsersCompaniesAndTermsE2eTest.tenantAdminWithTwoCompaniesStillAdministersTheTenantBecauseThePlatformScopeIsExempt` | |
| `READ_ONLY` / `DISABLED` | `CompanyAccessE2eTest` (8 testes: escrita 403 `COMPANY_READ_ONLY`, leitura/`QUERY`/`@SgReadOnlySafe` passam, login/refresh devolvem o estado, API key obedece, `DISABLED` nao loga nem seleciona e derruba sessoes, nunca toda desligada, so' a plataforma muda o estado) | DIVERGENCIA-1 documentada em teste |
| Limites de empresas | `CompanyLimitsE2eTest.companyQuotaRefusesCreationAtTheLimitWith402AndOnlyActiveCompaniesCount`, `theFirstCompanyOfANewTenantNeverExceedsAOneCompanyPlan` | |
| Limite de usuarios (`maxUsers`) no cadastro de membros | `CompanyLimitsE2eTest.userQuotaRefusesNewMembersAtTheLimitWith402AndRaisingItFrees` | 402 `USER_QUOTA_EXCEEDED` (`PlanUserQuotaValidator` do billing) |
| Downgrade 3 para 1 (1 ativa + 1 somente leitura + 1 desligada) | `CompanyLimitsE2eTest.downgradeFromThreeCompaniesKeepsOneActiveOneReadOnlyAndSwitchesOffTheOther` | preview e checkout (400 `INVALID_COMPANY_SELECTION`) por HTTP; a CONFIRMACAO do pagamento (webhook do Stripe) e' simulada chamando `CompanySeatService.apply` dentro do app, que e' o que a ativacao da assinatura chama. Nao ha Stripe no teste (chave de teste) |
| Reedicao da escolha (`PUT /me/billing/downgrade-company-selection`) | so' o caso de recusa em `CompanyLimitsE2eTest.downgrade...` | NAO exercivel aqui: exige assinatura paga com troca de plano agendada no provider (Stripe). Coberto pelo `CompanySelectionCheckoutTest` do billing (TE.4 reexecuta) |
| Inadimplencia com relogio injetavel | `CompanyLimitsE2eTest.pastDueCycleMovesCompaniesToReadOnlyThenDisabledAndPayingRestoresThem`, `pastDueCycleOfOneTenantNeverTouchesAnotherTenantOrAnAdministratorDecision` | o "agora" e' o parametro de `PastDueScheduler.run(Instant)`; o `@Scheduled` REAL fica parado no perfil de teste (`quarkus.scheduler.start-mode=halted`, necessario para os outros agendadores, como cotacao e pricing, nao baterem na internet). O tick real e' do `PastDueSchedulerRealTest` do billing (TE.4) |
| Empresas CRU (nunca excluir) | `CompanyLimitsE2eTest.companiesAreCreatedReadEditedInactivatedAndReactivatedButNeverDeleted`, `companyCrudIsIsolatedBetweenTenants` | |
| Calendario | `BusinessDaysE2eTest` (10): nacionais, SP 9/7 pela UF da empresa, moveis (Carnaval, Sexta-feira Santa, Corpus Christi) desmarcaveis por escopo, "vai trabalhar", feriado proprio, contagens, permissao, isolamento entre tenants e entre empresas | so' SP tem feriado estadual semeado (README da extension); RJ nao tem |
| Calendario por UF da empresa (provider REAL) | `BusinessDaysRegionE2eTest` (8, guardiao): SP (9/7 `SP_REVOLUCAO_1932` em `check`, `holidays/reference` de 2026 e do ano corrente, `calendar`, `count`, `add`), RJ (9/7 dia util; nacionais e moveis seguem), empresa sem endereco (sem estadual), alternancia SP/RJ/sem endereco e entre tenants, 401 sem token, UF alterada RJ-SP-RJ (por API e por banco) sem cache velho, "vai trabalhar" sobre o feriado estadual | sem `TestRegionProvider` e sem `X-Uf`: o `SecurityBusinessDaysRegionProvider` le `Company.address.state` da empresa do token. Mutacao feita: provider devolvendo sempre vazio derruba 5 dos 8. Nao ha cache a invalidar na extension. |
| `QUERY` | `CompanyAccessE2eTest.queryMethodCarriesABodyIsSafeAndTheOtherMethodsOnTheSamePathAreNotAllowed` e o caso de `READ_ONLY` | o boilerplate nao tem endpoint `@QUERY` de negocio: a prova usa a sonda de teste |
| Termos | `UsersCompaniesAndTermsE2eTest.currentTermsArePublicAndTheLoginAsksForAcceptanceUntilTheCurrentVersionIsAccepted` | o cadastro do TENANT (`/public/tenants`) nao tem termos; o aceite de termos no signup (senha/PF/social) e' do `login-tenancy` (TE.2/TB.3) |
| `company-required` (calendario) | nao se aplica ao subdomain-tenancy (config desligada; o admin sempre tem empresa corrente) | provado no `login-tenancy-b2b` (`B2bCompanyRequiredE2ETest`, `B2bCompanyRegionE2ETest.withoutCompanyIs403CompanyRequiredAndWithoutTokenIs401`) |

## Bugs achados e corrigidos (2026-10-22)

A bateria achou 4 defeitos reais; todos foram corrigidos nas extensions e os testes ficaram verdes (suite do boilerplate: 76 testes, 0 falhas (84 com o `BusinessDaysRegionE2eTest`, 2026-10-23), 4 pulados do `DomainAuditTest`).

- **BUG-1 (resolvido)** - token do admin da plataforma (master) dava 500: `SubdomainTenancySecurityScopeResolver` agora usa o tenant default quando o token nao tem `subdomain` e vem com `audience=platform` (subdomain-tenancy e6bf437).
- **BUG-2 (resolvido)** - invariante do ADMIN sob concorrencia: `LastAdminGuard` serializa por JVM/tenant quando a conexao esta em autocommit (`AdminGuardMutex`, security 26807b9).
- **BUG-3 (resolvido)** - empresa inativada nao permite mais login: `User.getActiveCompanies()` exige `company.active`; so' ficam ENABLED e READ_ONLY (security 26807b9).
- **BUG-4 (decisao do dono: manter)** - o unico ADMIN que perde o perfil ADMIN por `PATCH /users/{id}` com `rolePublicIds` recebe 409 `LAST_ADMIN_PROTECTED`.
- Sobrou do BUG-2: `AuditLogEntitiesService.insertEntityIfNotFound` dava 500 por chave duplicada na 1a gravacao concorrente; corrigido em definitivo no audit (1605546) e o contorno do teste foi removido.

## Decisao do dono aplicada

- **DIVERGENCIA-1 (resolvida) - `READ_ONLY` agora barra a administracao da security.** `/users`, `/roles`, `/companies`,
  `/permissions` continuam `@SgMonoCompany`, mas levam `@SgReadOnlyEnforced`: com a empresa corrente em somente leitura a
  escrita responde 403 `COMPANY_READ_ONLY` (inativar/reativar empresa, `PUT .../access-mode`, troca de empresa e `/me/billing*`
  seguem livres). `CompanyAccessE2eTest.adminResourcesOfTheExtensionAreRefusedInReadOnlyWhileReadsStayOk` trava o 403.

## Como rodar

```
cd boilerplate/subdomain-tenancy/backend
flock /d/tmp/infra.lock "$HOME/.sdkman/candidates/maven/current/bin/mvn.cmd" -o -Dgpg.skip=true \
  -Dtest='br.com.seedgrid.app.api.e2e.*Test' test
```

(Docker/Testcontainers sobe um Postgres por perfil; um `mvn` por vez.)
