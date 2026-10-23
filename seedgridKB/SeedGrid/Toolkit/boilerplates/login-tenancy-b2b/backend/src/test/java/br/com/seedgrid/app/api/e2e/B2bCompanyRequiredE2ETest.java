package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E do {@code company-required} do calendario de dias uteis no login-tenancy: toda rota {@code /business-days/**}
 * exige empresa corrente (o calendario e sempre o da empresa logada). Sem token: 401. Com uma empresa so (escopada no
 * login): 200. Login com DUAS empresas sem escolher uma: nao pode ler o calendario; depois do select-company: 200.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bCompanyRequiredE2ETest extends E2eBase {

    private static final String CALENDAR = "/business-days/calendar?year=2026&month=12";

    @Test
    void withoutTokenIsStill401() {
        http().get(CALENDAR).then().statusCode(401);
    }

    @Test
    void singleCompanyLoginIsScopedAndReadsItsCalendar() {
        Account a = newCompanyAccount("Alfa");
        json(a.session().token()).get(CALENDAR).then().statusCode(200).body("year", equalTo(2026));
    }

    @Test
    void multiCompanyLoginMustPickACompanyBeforeUsingTheCalendar() {
        Account a = newCompanyAccount("Alfa");
        String other = linkAnotherCompany(a.email(), "AlfaDois");
        Response login = loginRaw(a.email(), PASSWORD);
        login.then().statusCode(200).body("companySelectionRequired", equalTo(true));
        Session unscoped = sessionOf(login);

        // CONTRATO (plano de escopo/acesso, T-business-days company-required): sem empresa corrente, toda rota
        // /business-days/** responde 403 COMPANY_REQUIRED. Hoje o filtro do security (CompanyContextFilter) responde 400
        // "Header X-Company-Id obrigatorio" ANTES do filtro do business-days, e o 403 nao chega a existir.
        Response r = json(unscoped.token()).get(CALENDAR);
        assertEquals(403, r.statusCode(), "esperado 403 COMPANY_REQUIRED, veio " + r.statusCode() + ": " + r.asString());
        assertEquals("COMPANY_REQUIRED", r.jsonPath().getString("code"), r.asString());
    }

    @Test
    void multiCompanyLoginThatPicksACompanyReadsOnlyThatCompanyCalendar() {
        Account a = newCompanyAccount("Alfa");
        String other = linkAnotherCompany(a.email(), "AlfaDois");
        Session unscoped = sessionOf(loginRaw(a.email(), PASSWORD));

        Session onFirst = selectCompany(unscoped, a.companyPublicId());
        Session onOther = selectCompany(unscoped, other);
        json(onFirst.token()).get(CALENDAR).then().statusCode(200);
        json(onOther.token()).get(CALENDAR).then().statusCode(200);

        // uma excecao "vai trabalhar" criada numa empresa nao aparece na outra do mesmo login
        json(onFirst.token()).body(java.util.Map.of("date", "2027-02-07", "weight", 1, "reason", "Balanco"))
                .post("/business-days/work-overrides").then().statusCode(201);
        json(onFirst.token()).get("/business-days/work-overrides").then().statusCode(200).body("$", hasSize(1));
        json(onOther.token()).get("/business-days/work-overrides").then().statusCode(200).body("$", hasSize(0));
    }
}
