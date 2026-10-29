# Cobertura da bateria E2E do backend (login-tenancy-b2b)

Tarefa TE.2 do plano de escopo/acesso. HTTP real na porta em que o backend sobe (`@QuarkusTest` +
`@TestHTTPResource` + RestAssured), Postgres 16 via Testcontainers, e-mail simulado, limites de taxa desligados.
Tudo o que um cliente faz passa por HTTP; so ha duas fixtures em processo, ambas sem caminho HTTP por desenho:

- ler o codigo de confirmacao do cadastro (o e-mail em si e simulado) e o token de confirmacao de e-mail do
  administrador semeado/de membros criados por admin;
- conceder ao administrador da plataforma o perfil global `OPERADOR_PLATAFORMA` com `COMPANY_ACCESS_MODE_UPDATE`:
  essa permissao nao vai no ADMIN e o ADMIN nao a delega (`RoleDelegationGuard`), so a software house a concede.

Comando (um `mvn` por vez, com a trava de infra):

```
cd backend
flock /d/tmp/infra.lock ~/.sdkman/candidates/maven/current/bin/mvn.cmd -o -Dgpg.skip=true test '-Dtest=B2b*E2ETest'
```

## Item -> teste ou motivo

| Item | Teste / motivo |
|---|---|
| Cadastro por CNPJ (pendente, confirma, ADMIN + trial) | `B2bSignupE2ETest.signupByCnpjIsPendingUntil...` |
| CNPJ repetido (409), invalido (400), pendente de outro e-mail (409) | `B2bSignupE2ETest.repeatedAndInvalidCnpjAreRefused`, `samePendingCnpjFromAnotherEmailIsRefused...` |
| E-mail existente | No b2b NAO e 409: e **vinculacao** de nova empresa ao mesmo login (por desenho, ver `LoginTenancySignupController`). `B2bSignupE2ETest.existingEmailLinksANewCompanyToTheSameLogin`. O 409 de e-mail existente e do cadastro de pessoa fisica (testado no b2c). |
| Sem cadastro de pessoa fisica / sem social | `B2bSignupE2ETest.personalSignupIsNotAvailableInTheB2bProduct`, `thereIsNoSocialLoginInTheB2bProduct`, `signupConfigDescribes...` |
| Termos (exigencia, versao, aceite gravado, versao errada) | `B2bTermsE2ETest` (3) |
| Isolamento de tokens/contas (usuarios, empresas, ids alheios = 404) | `B2bIsolationE2ETest.eachAccountSeesOnlyItsOwnCompanyAndMembers`, `aTokenCannotSelectOrBorrowTheOtherCompany` |
| Isolamento de perfis da conta | `B2bIsolationE2ETest.accountRolesAreInvisibleAndUntouchableByTheOtherAccount` |
| Isolamento de chaves de API (escopo da empresa, perfil de integracao, revogar a alheia, revogada cai) | `B2bIsolationE2ETest.anApiKeyOnlyWorksForTheCompanyThatCreatedIt...` |
| Isolamento do calendario ("vai trabalhar") | `B2bIsolationE2ETest.theBusinessCalendarOfOneCompanyIsInvisibleToTheOther` |
| Sessao revogada so do usuario afetado (troca de senha) | `B2bIsolationE2ETest.revokingOneUserSessionsDoesNotTouchAnotherUserOrAnotherCompany` |
| Role global sem atraso (edicao vale na hora, nos dois sentidos) | `B2bIsolationE2ETest.editingAGlobalRoleReachesTheAccountsImmediately` |
| Invariante do ADMIN por empresa (desativar, desvincular, excluir, trocar perfil do vinculo; sucessao; ADMIN de outra empresa nao conta; root da conta) | `B2bAdminInvariantE2ETest` (4). A variante "por banco" (`admin-guard.scope=database`) nao se aplica: o boilerplate usa o escopo por empresa. |
| `company-required` do calendario | `B2bCompanyRequiredE2ETest` (4, verde: o `BusinessDaysCompanyRequiredDeferFilter` faz o 403 `COMPANY_REQUIRED` chegar; o defeito 1 abaixo esta resolvido) |
| Calendario por UF da empresa logada (provider REAL, sem `X-Uf`) | `B2bCompanyRegionE2ETest` (4): contas SP e RJ sem vazamento, login com 2 empresas de UFs diferentes segue a escolhida, UF alterada SP/RJ muda na hora, 403 `COMPANY_REQUIRED` em `check`/`reference`/`calendar` e 401 sem token. Sem endereco nao se aplica (UF obrigatoria no cadastro): coberto no subdomain-tenancy (`BusinessDaysRegionE2eTest`) |
| Estado de acesso READ_ONLY / DISABLED / ACTIVE (sessao cai, COMPANY_READ_ONLY, COMPANY_DISABLED, chave de API, outra empresa intacta, nunca todas desligadas, empresa da plataforma imutavel, cliente sem acesso ao endpoint, motivo visivel) | `B2bAccessStateE2ETest` (6) |
| Planos de demonstracao semeados, trial na assinatura | `B2bBillingLimitsE2ETest.demoPlansAreSeededAndEveryNewAccountStartsOnTheTrial` |
| Limites da condicao comercial visiveis; selecao de usuarios do downgrade | `B2bBillingLimitsE2ETest.theCommercialTermLimitsAreVisible...` |
| Limite de empresas (`maxCompanies`) | O cliente nao cria empresa por HTTP (`POST /companies` e da plataforma: 403, provado em `theCustomerCannotCreateCompanies...`), e o `PlanCompanyQuotaValidator` nao limita ator da plataforma. Sem caminho HTTP: coberto pelos testes do billing e do security (`PlanCompanyQuotaValidator`, `LimitingQuotaValidator` do security) e pelo E2E do `subdomain-tenancy` (TE.1). A selecao de empresas do downgrade e consultada em `GET /me/billing/downgrade-company-selection` (mesmo teste). |
| Limite de usuarios (`maxUsers`) no cadastro de membros (402 `USER_QUOTA_EXCEEDED`) | `B2bBillingLimitsE2ETest.theUserLimitOfTheCommercialTermIsEnforcedWhenAddingMembers` (o billing fornece `PlanUserQuotaValidator`) |
| Downgrade (3 -> 1 ativa + 1 somente leitura), aplicacao no fim do ciclo, inadimplencia (`PastDueService`) | Nao exercitavel por HTTP aqui: `POST /me/billing/change-plan` exige assinatura com vinculo no provedor (Stripe), recusa 422 sem ele (`changingPlanNeedsALinkWithThePaymentProvider`); a aplicacao no fim do ciclo e a inadimplencia dependem do relogio injetavel e do agendador (`quarkus.scheduler.start-mode=halted`). Coberto pelos testes do billing (`PastDueService` com relogio) e entra na regressao TE.4. |
| Social | Fora do b2b (ver b2c). |

## Defeitos / lacunas encontrados (nao corrigidos aqui)

1. **(RESOLVIDO, teste verde em 2026-10-23)** ~~`company-required` nunca devolve 403 `COMPANY_REQUIRED` para quem tem mais de uma empresa e ainda nao escolheu:**
   o `CompanyContextFilter` do security (prioridade `AUTHORIZATION - 10`) responde `400 "Header X-Company-Id obrigatorio
   para usuarios com multiplas companies"` antes do `BusinessDaysCompanyRequiredFilter` (`AUTHORIZATION - 5`). Nao
   vaza dado (continua recusado), mas o contrato da extension (403 `COMPANY_REQUIRED`) fica inalcancavel no
   login-tenancy. Teste: `B2bCompanyRequiredE2ETest.multiCompanyLoginMustPickACompanyBeforeUsingTheCalendar` (vermelho de proposito).
2. ~~`maxUsers` nao e aplicado ao cadastrar membro~~ (resolvida: o billing passou a fornecer `PlanUserQuotaValidator`; teste habilitado).
