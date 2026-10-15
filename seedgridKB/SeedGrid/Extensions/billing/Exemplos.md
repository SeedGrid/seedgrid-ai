---
tags: [seedgrid, extension, billing, quarkus, exemplos]
fonte: java/seedgrid-quarkus-ext-billing
branch: main
commit: ba38efc347
analisado-em: 2026-10-14
---

# Billing (Quarkus): exemplos

Ver também [[SeedGrid/Extensions/billing/Visao-geral|Visão geral]] e [[SeedGrid/Extensions/billing/Configuracao|Configuração]].

Os exemplos usam a API real do código. A fonte de cada um está indicada.

## 1. Dependências

Fonte: `README.md` (raiz). Versão alinhada ao pom `2026.10.14-1`.

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-billing-core</artifactId>
    <version>2026.10.14-1</version>
</dependency>
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-billing-stripe</artifactId>
    <version>2026.10.14-1</version>
</dependency>
```

Com `seedgrid-login-tenancy`, o core já vem da foundation. Declare só o `seedgrid-billing-stripe` (README do Stripe).

## 2. Declarar os contadores de uso

Fonte: `seedgrid-billing-core/integration-tests/src/test/java/br/com/seedgrid/billing/it/ProductUsageMeters.java`.

```java
@ApplicationScoped
public class ProductUsageMeters implements UsageMeterContributor {

    public static final String REQUESTS = "requests";
    public static final String STORAGE = "storage-mb";

    @Override
    public List<UsageMeterDefinition> meters() {
        return List.of(
                new UsageMeterDefinition(REQUESTS, "Requisicoes"),
                new UsageMeterDefinition(STORAGE, "MB armazenados"));
    }
}
```

Regras do README:
- O código usa `[a-z0-9-]`, com até 40 caracteres, e é uma identidade permanente: não reaproveite.
- Vários beans `UsageMeterContributor` são somados.

## 3. Consumo por anotação, consumo programático e gate por plano

Fonte: `integration-tests/.../ProductController.java`.

```java
@Path("/it/product")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
public class ProductController {

    private final CurrentAccountResolver currentAccountResolver;
    private final UsageService usageService;

    public ProductController(CurrentAccountResolver currentAccountResolver, UsageService usageService) {
        this.currentAccountResolver = currentAccountResolver;
        this.usageService = usageService;
    }

    // 1 unidade de "requests"; só contabiliza se o método retornar
    @POST
    @Path("/work")
    @ConsumesUsage(meter = ProductUsageMeters.REQUESTS)
    public Map<String, String> work() {
        return Map.of("status", "done");
    }

    // quantidade conhecida só em runtime
    @POST
    @Path("/store")
    @Transactional
    public Map<String, Object> store(@QueryParam("mb") int mb) {
        Account account = currentAccountResolver.requireCurrentAccount();
        usageService.assertCanConsume(account, ProductUsageMeters.STORAGE, mb);
        usageService.consume(account, ProductUsageMeters.STORAGE, mb, "store-" + UUID.randomUUID());
        return Map.of("storedMb", mb);
    }

    // o plano vigente precisa liberar a permissão; senão 402 FEATURE_NOT_IN_PLAN
    @POST
    @Path("/premium")
    @RequiresPlanFeature("IT_PREMIUM_REPORT")
    public Map<String, String> premium() {
        return Map.of("status", "premium");
    }
}
```

`@ConsumesUsage` também aceita `units` (padrão `1`). `@RequiresPlanFeature` aceita `message` para personalizar o `detail` do 402.

## 4. Validar `additionalAttributes` do term

Fonte: `integration-tests/.../ProductPlanTermValidator.java`.

```java
@ApplicationScoped
public class ProductPlanTermValidator implements PlanTermAdditionalFieldsValidator {

    @Override
    public void validate(PlanTerm term, Map<String, JsonNode> additionalAttributes) {
        JsonNode quota = additionalAttributes.get("monthlyRequests");
        if (quota != null && (!quota.canConvertToInt() || !quota.isIntegralNumber() || quota.asInt() <= 0)) {
            throw new InvalidPlanTermAdditionalAttributesException("monthlyRequests deve ser inteiro positivo");
        }
    }
}
```

## 5. Restringir as contas visíveis no admin

Fonte: `seedgrid-billing-core/BILLING_INTEGRATION_GUIDE.md`. O `PartnerService` é do host.

```java
@RequestScoped
public class PartnerBillingAccountScope implements BillingAccountScope {
    @Inject PartnerService partners;

    @Override
    public Optional<Set<Long>> visibleCompanyIds() {
        return partners.currentPartner().map(p -> partners.companyIdsOf(p)); // empty() = operador da casa
    }
}
```

## 6. Observar eventos

Fonte: README do Stripe, seção 9, e javadoc de `SubscriptionLifecycleEvent`.

```java
void aoMudar(@Observes(during = TransactionPhase.AFTER_SUCCESS) SubscriptionLifecycleEvent event) {
    // event.type(): ACTIVATED, UPGRADED, DOWNGRADE_SCHEDULED, CANCELED, PAST_DUE, TRIAL_ENDED...
    // event.accountPublicId(), event.toPlanName(), event.effectiveAt(), event.reason()
}

void aoConsumir(@Observes UsageConsumedEvent event) {
    // mesma transação do consumo: grave o detalhe do produto
    // event.meter(), event.units(), event.overageUnits(), event.balanceAfter()
}
```

## 7. Criar um term com contadores (REST)

Fonte: README da raiz.

```http
POST /admin/plans/{planId}/terms
Content-Type: application/json

{ "monthlyPrice": 149.90, "maxUsers": 3,
  "meters": [
    { "meter": "requests",   "includedUnits": 1000, "overagePrice": 0.10 },
    { "meter": "storage-mb", "includedUnits": 500,  "overagePrice": 0 } ],
  "additionalAttributes": { "supportLevel": "priority" } }
```

- `overagePrice > 0`: cada unidade além da franquia é cobrada no meter do contador.
- `overagePrice = 0`: esgotar a franquia bloqueia com 402.

## 8. Configuração mínima com Stripe

Fonte: `BILLING_INTEGRATION_GUIDE.md`, passo 2. Ver também a [[SeedGrid/Extensions/billing/Configuracao|tabela completa]].

```properties
seedgrid.billing.stripe.apiKey=${STRIPE_API_KEY}               # <SEGREDO:stripe-api-key>
seedgrid.billing.stripe.webhookSecret=${STRIPE_WEBHOOK_SECRET} # <SEGREDO:stripe-webhook-secret>
seedgrid.billing.stripe.product=meu-produto
seedgrid.billing.checkout.success-url=https://app.exemplo.com/assinatura?ok=1
seedgrid.billing.checkout.cancel-url=https://app.exemplo.com/assinatura
seedgrid.billing.portal.return-url=https://app.exemplo.com/assinatura
seedgrid.billing.feature-gate.exempt-company-ids=1
```

Em desenvolvimento local, segundo o README do Stripe:

```bash
stripe login
stripe listen --forward-to localhost:8080/public/billing/webhook
# copie o whsec_... impresso para SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET e reinicie a app
```

## 9. Personalizar os e-mails de acesso

Fonte: `BILLING_INTEGRATION_GUIDE.md`, passo 5, e `UserAccessEmails`.

Coloque arquivos no host em `src/main/resources/templates/billing/{html,txt}/`:
- `user-access-loss.html` e `user-access-loss.txt`
- `user-access-restored.html` e `user-access-restored.txt`

Os placeholders disponíveis são `{name}`, `{plan}`, `{explanation}` e `{notice}`.
