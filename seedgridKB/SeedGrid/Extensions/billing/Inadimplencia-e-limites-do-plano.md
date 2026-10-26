---
description: "Como limitar empresas e usuários por plano e tratar a inadimplência no billing, em perguntas e respostas: campos do PlanTerm (maxCompanies, maxReadOnlyCompanies, maxUsers, pastDue*Days), propriedades seedgrid.billing.past-due.* (padrão 7 e 30 dias), erros 402, escolha de empresas no downgrade e no checkout, eventos para o host avisar o cliente e a tela de condição comercial."
tags: [seedgrid, extension, billing, inadimplencia, plano, planterm, downgrade, cota, host, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Limites do plano e inadimplência (empresas, usuários e prazos)

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-quarkus-ext-billing` (billing-core) **2026.10.22**, com `seedgrid-security` 2026.10.22 e, para tenant por subdomínio, `seedgrid-quarkus-ext-subdomain-tenancy` 2026.10.22 ([[SeedGrid/Versoes|Versões]]). Migrations do billing `V515` e `V516`. Conferido contra as propriedades do código (`BillingPastDueConfig`) e os guardiões do billing. Visão geral do estado de acesso da empresa: [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]], Fase 5; como o `READ_ONLY` bloqueia escrita: [[SeedGrid/Extensions/security/Somente-leitura-e-QUERY|Somente leitura e QUERY]].

## Onde defino quantas empresas e usuários cada plano comporta?

No **`PlanTerm`** (a condição comercial do plano), em quatro campos de empresas e um de usuários:

| Campo | Significa | Nulo ou `0` |
|---|---|---|
| `maxCompanies` | Empresas **ativas** que o plano comporta | sem limite |
| `maxReadOnlyCompanies` | Empresas em **somente leitura** que o plano comporta | sem limite |
| `maxUsers` | Usuários ativos da conta | sem limite |
| `pastDueReadOnlyAfterDays` | Dias em atraso até as empresas virarem somente leitura | nulo usa a propriedade; `0` não aplica o passo |
| `pastDueDisableAfterDays` | Dias em atraso até desligar as empresas | nulo usa a propriedade; `0` não aplica o passo |

- Os campos estão em `PlanTermRequest`, `PlanTermPatch` e `PlanTermResponse`, e também em `PATCH|GET /admin/plans/trial`: o **trial** aceita, grava e devolve os mesmos campos. No PATCH, campo ausente não mexe, `0` grava `0`, negativo dá 400.
- Quem altera é a equipe do produto, no **admin web**, nas telas de condição comercial (`plans/plan_terms` e `plans/plan_trial`, presentes nos boilerplates `login-tenancy-b2b` e `subdomain-tenancy`). O cliente final não altera.

## Quero a cota do plano (ou meu host não cobra por usuário/empresa): o que ligo?

As duas cotas são **opt-in**, ambas com padrão `false` (decisão do dono em 2026-10-26: limite por usuário ou por empresa é regra do host). **BREAKING** (nada publicado; versão local 2026.10.22): antes os validadores eram beans sempre ativos.

| Propriedade | Padrão | Efeito quando `true` |
|---|---|---|
| `seedgrid.billing.quota.users.enabled` | `false` | sobe o `PlanUserQuotaValidator` (aplica `maxUsers`) |
| `seedgrid.billing.quota.companies.enabled` | `false` | sobe o `PlanCompanyQuotaValidator` (aplica `maxCompanies`) |

- Desligada, o bean **não é criado** (`@IfBuildProperty`, resolvida no BUILD: mudar o valor exige rebuild em modo prod) e vale o padrão "sem limite" da security; a extension nem consulta conta ou assinatura nesse cadastro. Os campos do plano (`maxUsers`, `maxCompanies`, `maxReadOnlyCompanies`) continuam existindo e sendo gravados e devolvidos pela API: só o **bloqueio** depende da propriedade.
- **Quero a cota do plano:** `seedgrid.billing.quota.companies.enabled=true` (empresas), `seedgrid.billing.quota.users.enabled=true` (usuários) ou as duas. Os boilerplates `login-tenancy-b2b`, `login-tenancy-b2c` e `subdomain-tenancy` ligam as duas.
- **Meu host não cobra por usuário/empresa:** não configure nada.
- **Meu host tem regra própria:** deixe a propriedade desligada e declare o seu `UserQuotaValidator`/`CompanyQuotaValidator` como bean normal, **sem `@Alternative` nem `@Priority`**. Ligar a propriedade **e** declarar o próprio dá dois beans e o boot falha com `AmbiguousResolutionException`.
- **Atenção ao atualizar:** host que já dependia do limite precisa ligar a propriedade; sem ela o limite some em silêncio (não é erro).

As seções abaixo descrevem o comportamento **com a cota ligada**.

## O que acontece ao passar do limite de empresas?

- Criar empresa (`POST /companies`) ou reativar (`PATCH /companies/{id}` com `active` de `false` para `true`) com as empresas `ACTIVE` da conta já em `maxCompanies` responde **402 `COMPANY_QUOTA_EXCEEDED`**.
- Não ocupam vaga de ativa: empresa inativada pelo administrador (`active=false`), em `READ_ONLY` ou `DISABLED`.
- A empresa da **plataforma** nunca conta nem é limitada. Conta **sem assinatura vigente** = sem limite. Vale também para o trial.
- O **cadastro** (signup) cria a primeira empresa da conta direto e nunca consulta a cota: com `maxCompanies=1` a conta nasce com 1 de 1. A segunda empresa, por `POST /companies`, dá 402.
- Como funciona por baixo: com `seedgrid.billing.quota.companies.enabled=true`, o billing implementa o SPI `CompanyQuotaValidator` da security (`br.com.seedgrid.security.spis`), sem `@DefaultBean`, e vence o padrão "sem limite".

## E o limite de usuários?

Com `seedgrid.billing.quota.users.enabled=true`, o `PlanUserQuotaValidator` implementa o SPI `UserQuotaValidator` e aplica `maxUsers` ao **cadastrar, vincular e reativar** um membro (admin, self-enter e demais fluxos que passam pelo SPI). Passou do limite: **402 `USER_QUOTA_EXCEEDED`** (com o campo `limit`). A conta é a da empresa que recebe o usuário; a empresa da plataforma nunca é limitada; sem assinatura ou `maxUsers` nulo/`0` = sem limite. Para uma regra própria, deixe a propriedade desligada e forneça o seu `UserQuotaValidator` `@ApplicationScoped`, sem `@Alternative`/`@Priority`.

## Como funciona a inadimplência?

Desligada por padrão. Ligue:

```properties
seedgrid.billing.past-due.enabled=true
seedgrid.billing.past-due.read-only-after-days=7
seedgrid.billing.past-due.disable-after-days=30
seedgrid.billing.past-due.interval=1h
```

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.billing.past-due.enabled` | `false` | Liga o ciclo e o agendador. Ligado, **substitui** o bloqueio geral 402 `PAYMENT_PAST_DUE` (`seedgrid.billing.access-gate.block-past-due`); o bloqueio de *consumo* de contador por pagamento pendente continua. |
| `seedgrid.billing.past-due.read-only-after-days` | `7` | Dias `PAST_DUE` até as empresas da conta virarem `READ_ONLY`. `0` = não aplica. |
| `seedgrid.billing.past-due.disable-after-days` | `30` | Dias `PAST_DUE` até as empresas serem desligadas (`DISABLED`). `0` = não aplica. |
| `seedgrid.billing.past-due.interval` | `1h` | Intervalo do agendador. |
| `seedgrid.billing.checkout.selection-ttl` | `48h` | Validade da referência da escolha feita no checkout (abaixo). |

- Com assinatura `PAST_DUE` há 7 dias, as empresas da conta ficam **somente leitura**; com 30, ficam **desligadas** (as sessões caem e o login dá `COMPANY_DISABLED`). Os prazos do `PlanTerm` sobrepõem o padrão.
- **A empresa do responsável nunca é desligada**: fica em somente leitura e ainda alcança `/me/billing`, `/me/plans`, `/me/subscription` e `/me/usage` para pagar (contribuição aditiva do billing em `seedgrid.security.company-access.read-only.contributions.billing`; não use `allowed-paths`, que substitui o padrão).
- Nunca muda a plataforma, nunca deixa a conta toda `DISABLED`, não toca empresa inativada pelo administrador; só **escala** o estado.
- **Pagar** (`PAYMENT_CONFIRMED`, recompra do plano) devolve ao estado de antes **só as empresas que o billing mexeu** (o motivo gravado é `billing-past-due|prev=<estado>`). O que o administrador ou o downgrade mudaram depois não é desfeito.

## O que o cliente faz quando troca para um plano com menos empresas (downgrade)?

Ele escolhe quais empresas ficam **ativas** (lendo e gravando), quais ficam **somente leitura** e quais saem (**desligadas**). A escolha é agendada para a virada do ciclo.

```json
// POST /me/billing/change-plan   (3 empresas -> 1 ativa + 1 somente leitura + 1 desligada)
{ "planId": "<publicId do plano>",
  "companySelection": { "keepActive": ["<empresa do responsável>"], "readOnly": ["<empresa B>"], "disable": ["<empresa C>"] } }
```

| Rota | Para que serve |
|---|---|
| `GET /me/billing/change-preview?planId=` | Diz se precisa escolher (`requiresCompanySelection`) e traz `companySelection` |
| `GET /me/billing/downgrade-company-selection` | `eligibleCompanies`, `protectedCompanies`, `maxCompanies`, `maxReadOnlyCompanies` e a escolha já salva |
| `PUT /me/billing/downgrade-company-selection` | Salva ou reedita a escolha até o ciclo fechar (responde `SELECTION_SAVED`). Plano que já comporta tudo: **409 `COMPANY_SELECTION_NOT_REQUIRED`** |
| `POST /me/billing/change-plan` | Aceita `companySelection` |

- As contagens têm de ser **exatas**: todas as empresas elegíveis classificadas, cada uma numa só lista; ativas = `min(E, max(0, maxCompanies − P))`; somente leitura = `min(maxReadOnlyCompanies, restantes)`; o resto, desligadas. Contagem errada ou empresa de outra conta: **400** e nada muda.
- **Protegidas** (`P`, nunca mudam de estado, ocupam vaga de ativa): a empresa do responsável (`OWNER`) e a que o `LastAdminGuard` não deixa desligar (`LAST_ADMIN`). A empresa da plataforma não aparece nem conta. A conta nunca fica toda desligada.
- Desfazer o downgrade (`/cancel-scheduled-change`) ou fazer upgrade descarta a escolha. Na virada do ciclo ela é aplicada de uma vez, com o motivo `billing-plan-company-limit`.

## E no checkout direto (do trial para um plano pago com menos empresas)?

`GET /me/billing/checkout/preview?planId=` traz os campos de usuários de sempre mais `requiresCompanySelection` e `companySelection`. `POST /me/billing/checkout` aceita `companySelection` (mesmas contagens exatas); faltando ou errada: **400 `INVALID_COMPANY_SELECTION`** e nada vai ao provider de pagamento.

A escolha (de usuários e de empresas) fica **no servidor** (`sg_billing_checkout_selections`); só uma referência curta (`selectionRef`) viaja no metadata do checkout, porque o Stripe limita cada valor a 500 caracteres. É aplicada **na hora** da ativação da assinatura. Se a referência não existir, vencer (`selection-ttl`) ou for de outra conta, o cliente **já pagou**: a assinatura é ativada **sem aplicar nenhuma perda**, o log registra `ERROR` e o billing dispara o evento CDI `CheckoutSelectionEvent` (`reason` = `NOT_FOUND`, `EXPIRED` ou `OTHER_ACCOUNT`). O host observa e avisa o cliente para completar a escolha pelos `PUT /me/billing/downgrade-user-selection` e `PUT /me/billing/downgrade-company-selection` (valem até o fim do ciclo).

## Como aviso o cliente por e-mail?

O billing **não envia e-mail** de empresa. O host observa os eventos (CDI, dentro da transação) e avisa o responsável:

```java
void onCompanyAccess(@Observes(during = TransactionPhase.AFTER_SUCCESS) CompanyAccessEvent e) {
    // e.type(): CHANGE_SCHEDULED | CHANGE_APPLIED | RESTORED
    // e.cause(): PLAN_LIMIT | PAST_DUE | PAYMENT_RESTORED
    // e.companyName(), e.previousMode(), e.newMode(), e.planName(), e.effectiveAt()
}

void onCheckoutSelection(@Observes(during = TransactionPhase.AFTER_SUCCESS) CheckoutSelectionEvent e) {
    // e.accountPublicId(), e.accountName(), e.planName(), e.reason()
}
```

Também há `CompanyAccessChangedEvent` do security (a cada mudança real de estado) e, para jobs do host, `CompanyAccessService.isWritable(companyId)`.

## E para tenant por subdomínio?

O `subdomain-tenancy` traz o `SubdomainAccountCompaniesGateway`: as empresas da conta são as do banco do tenant, o responsável é a primeira empresa do *root* do tenant, e o agendador troca o contexto para o tenant mesmo sem requisição. No login-tenancy o gateway padrão do billing usa a empresa da conta mais as dos membros dela, sem a plataforma.

## O que mudou de compatibilidade?

- Construtores públicos mudaram (injeção CDI não é afetada): `SubscriptionChangeService`, `BillingCycleService`, `SubscriptionActivationService`, `SubscriptionAccessService`. Records `ChangePlanRequest`, `ChangePlanResponse`, `ChangePreviewResponse`, `PlanTermResponse`, `PlanTermSummaryResponse`, `TrialRequest` e `TrialResponse` ganharam componentes (aditivos no JSON). Host que os constrói à mão ajusta.
- Nova dependência `quarkus-scheduler` no runtime do billing.
- Novo método padrão `CurrentAccountResolver#requireAccountForCompany(Long)`.

## Guardiões

`CompanyLimitsTest`, `CompanySelectionCheckoutTest`, `CheckoutSelectionRefTest`, `CompanySelectionLastAdminTest`, `CompanySelectionPlatformTest`, `PastDueSchedulerRealTest`, `SignupCompanyQuotaTest`, `PlanUserQuotaValidatorTest` e, no subdomain-tenancy, `TenantBillingIntegrationTest`. `QuotaValidatorsOffByDefaultTest` (perfil com as duas propriedades `false`) prova que os dois beans não existem e que o `UserQuotaValidator` resolvido é o `DefaultUserQuotaValidator` da security; os testes de cota rodam com as duas ligadas no `application.properties` de teste.

## Limites conhecidos

- No `login-tenancy` cada empresa que acessa o billing tem a própria conta: contas de empresas secundárias criadas por quem seleciona a empresa são contas separadas, cada uma com o próprio trial.
- A sonda `CompanyDisableProbe` (que usa o `LastAdminGuard` com `admin-guard.scope=database`) só foi exercitada de ponta a ponta com uma empresa; os casos de várias empresas estão em teste unitário.
