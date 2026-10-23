package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E de planos, limites e downgrade no b2b: planos de demonstracao semeados e trial na assinatura; limite de usuarios
 * da condicao comercial (maxUsers) vale no cadastro de membros; o cliente nao cria empresa (so a plataforma), entao o
 * limite de empresas so aparece na selecao de downgrade; troca de plano exige vinculo com o provedor (sem Stripe real,
 * recusada com 422). O que nao da para exercitar por HTTP esta em COBERTURA.md.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bBillingLimitsE2ETest extends E2eBase {

    private static String letters(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append((char) ('A' + ThreadLocalRandom.current().nextInt(26)));
        }
        return sb.toString();
    }

    /** Plano proprio do teste, com condicao comercial vigente e as mesmas permissoes do plano PRO de demonstracao. */
    private String planTermWithLimits(Session platform, Integer maxUsers, Integer maxCompanies) {
        List<Map<String, Object>> plans = expect(json(platform.token()).get("/admin/plans"), 200)
                .jsonPath().getList("items");
        String proPlan = plans.stream().filter(p -> "PRO".equals(p.get("code"))).map(p -> (String) p.get("publicId"))
                .findFirst().orElseThrow();
        List<String> permissions = expect(json(platform.token()).get("/admin/plans/" + proPlan + "/terms"), 200)
                .jsonPath().getList("items[0].permissionPublicIds");
        assertFalse(permissions.isEmpty(), "o PRO de demonstracao libera permissoes");

        String planId = expect(json(platform.token()).body(Map.of("code", "E2E" + letters(8), "name", "Plano E2E"))
                .post("/admin/plans"), 201).jsonPath().getString("publicId");
        Map<String, Object> term = new HashMap<>();
        term.put("monthlyPrice", new BigDecimal("10.00"));
        term.put("maxUsers", maxUsers);
        term.put("maxCompanies", maxCompanies);
        term.put("maxReadOnlyCompanies", 1);
        term.put("permissionPublicIds", permissions);
        term.put("meters", List.of(Map.of("meter", "requests", "includedUnits", 100, "overagePrice", 0)));
        return expect(json(platform.token()).body(term).post("/admin/plans/" + planId + "/terms"), 201)
                .jsonPath().getString("publicId");
    }

    private void courtesySubscription(Session platform, Account account, String planTermId) {
        String accountId = expect(json(platform.token()).get("/admin/accounts?size=100"), 200)
                .jsonPath().getString("items.find { it.cpfCnpj == '" + account.cnpj() + "' }.publicId");
        assertNotNull(accountId, "conta de cobranca da empresa");
        expect(json(platform.token()).body(Map.of("accountId", accountId, "planTermId", planTermId))
                .post("/admin/subscriptions"), 201);
    }

    @Test
    void demoPlansAreSeededAndEveryNewAccountStartsOnTheTrial() {
        Account a = newCompanyAccount("Alfa");
        json(a.session().token()).get("/me/plans").then().statusCode(200)
                .body("items.code", hasItem("BASICO")).body("items.code", hasItem("PRO"));
        json(a.session().token()).get("/me/subscription").then().statusCode(200)
                .body("status", equalTo("ACTIVE")).body("plan.code", equalTo("TRIAL"))
                .body("plan.isTrial", equalTo(true));
        json(a.session().token()).get("/me/usage").then().statusCode(200).body("trial", equalTo(true));
    }

    /** {@code maxUsers} da condicao comercial limita o cadastro de membros (402 {@code USER_QUOTA_EXCEEDED}). */
    @Test
    void theUserLimitOfTheCommercialTermIsEnforcedWhenAddingMembers() {
        Account a = newCompanyAccount("Alfa");
        Session platform = platformAdmin();
        courtesySubscription(platform, a, planTermWithLimits(platform, 2, 2));
        afterRevocation();
        Session s = login(a.email(), PASSWORD);
        addMember(s, uniqueEmail("segundo"), List.of(roleId(s, "ADMIN")));
        Map<String, Object> third = Map.of("email", uniqueEmail("terceiro"), "name", "Maria Souza",
                "password", PASSWORD, "rolePublicIds", List.of(roleId(s, "ADMIN")));
        Response refused = json(s.token()).body(third).post("/me/security/users");
        assertEquals(402, refused.statusCode(), refused.asString());
        assertEquals("USER_QUOTA_EXCEEDED", refused.jsonPath().getString("code"), refused.asString());
    }

    @Test
    void theCommercialTermLimitsAreVisibleToTheAccountAndFeedTheSeatSelection() {
        Account a = newCompanyAccount("Alfa");
        Session platform = platformAdmin();
        courtesySubscription(platform, a, planTermWithLimits(platform, 2, 2));
        afterRevocation();
        Session s = login(a.email(), PASSWORD);
        json(s.token()).get("/me/subscription").then().statusCode(200)
                .body("planTerm.maxUsers", equalTo(2)).body("planTerm.maxCompanies", equalTo(2))
                .body("planTerm.maxReadOnlyCompanies", equalTo(1)).body("plan.isTrial", equalTo(false));

        String second = addMember(s, uniqueEmail("segundo"), List.of(roleId(s, "ADMIN")));
        json(s.token()).get("/me/billing/downgrade-user-selection").then().statusCode(200)
                .body("currentActiveUsers", equalTo(2))
                .body("alwaysActiveUsers.email", hasItem(a.email()))
                .body("eligibleUsers.publicId", hasItem(second));
    }

    @Test
    void theCustomerCannotCreateCompaniesSoTheCompanyLimitOnlyShowsInTheDowngradeSelection() {
        Account a = newCompanyAccount("Matriz");
        String filial = linkAnotherCompany(a.email(), "Filial");
        Session unscoped = sessionOf(loginRaw(a.email(), PASSWORD));
        Session matriz = selectCompany(unscoped, a.companyPublicId());

        // criar empresa e' coisa da plataforma
        json(matriz.token()).body(Map.of("corporateName", "Nova Empresa", "tradeName", "Nova Empresa",
                "cpfCnpj", cnpj(), "personType", "PJ")).post("/companies").then().statusCode(403);

        // a selecao de downgrade enxerga a outra empresa da conta e protege a do titular
        json(matriz.token()).get("/me/billing/downgrade-company-selection").then().statusCode(200)
                .body("eligibleCompanies.publicId", hasItem(filial))
                .body("protectedCompanies.publicId", hasItem(a.companyPublicId()));
    }

    @Test
    void changingPlanNeedsALinkWithThePaymentProvider() {
        Account a = newCompanyAccount("Alfa");
        String basic = json(a.session().token()).get("/me/plans").jsonPath()
                .getString("items.find { it.code == 'BASICO' }.planId");
        Response r = json(a.session().token()).body(Map.of("planId", basic)).post("/me/billing/change-plan");
        assertEquals(422, r.statusCode(), r.asString());
        // sem Stripe configurado o checkout nao esta habilitado nos planos de demonstracao
        json(a.session().token()).get("/me/plans").then().body("items.checkoutEnabled", hasItem(false));
    }
}
