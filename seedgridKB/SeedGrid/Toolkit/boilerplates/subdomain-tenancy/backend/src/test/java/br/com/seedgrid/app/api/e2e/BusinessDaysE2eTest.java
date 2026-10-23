package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.BETA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * TE.1 - calendario de dias uteis: feriados nacionais, estaduais pela UF da empresa (SP 9/7; so' SP tem estadual semeado), moveis
 * (Carnaval, Sexta-feira Santa, Corpus Christi) desmarcaveis por escopo, excecao "vai trabalhar", feriado proprio e
 * isolamento (entre tenants e entre empresas do mesmo tenant). Datas de 2026 (Pascoa em 5/4/2026).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class BusinessDaysE2eTest extends E2eBase {

    static final String HOST_ALFA = host(ALFA);
    static final String HOST_BETA = host(BETA);

    String alfaAdmin;
    String betaAdmin;

    /** Tenant com duas empresas de UF diferente: A (SP, a do cadastro) e B (RJ). */
    String calSub;
    String calHost;
    String calAdmin;
    String companySp;
    String companyRj;
    String tokenSp;
    String tokenRj;

    @BeforeAll
    void tenants() throws Exception {
        ensureTenant(ALFA);
        ensureTenant(BETA);
        alfaAdmin = adminToken(ALFA);
        betaAdmin = adminToken(BETA);

        calSub = freshTenant("calen");
        calHost = host(calSub);
        calAdmin = adminToken(calSub);
        companySp = firstCompanyPublicId(calHost, calAdmin);
        companyRj = createCompany(calSub, calAdmin, cnpj(51), "filial rio", "RJ");
        tokenSp = selectCompany(calHost, calAdmin, companySp);
        tokenRj = selectCompany(calHost, calAdmin, companyRj);
    }

    private static Response check(String host, String token, String date) {
        return as(host, token).queryParam("date", date).get("/business-days/check");
    }

    private static void assertBusinessDay(String host, String token, String date, boolean expected) {
        Response r = check(host, token, date);
        assertEquals(200, r.statusCode(), date + ": " + r.body().asString());
        assertEquals(expected, r.jsonPath().getBoolean("businessDay"), date + ": " + r.body().asString());
    }

    // ------------------------------------------------------------------ nacional e estadual

    @Test
    void nationalHolidaysAndWeekendsAreNotBusinessDays() {
        for (String holiday : List.of("2026-01-01", "2026-04-21", "2026-05-01", "2026-09-07", "2026-10-12", "2026-11-02",
                "2026-11-15", "2026-11-20", "2026-12-25")) {
            Response r = check(HOST_ALFA, alfaAdmin, holiday);
            assertEquals(200, r.statusCode(), holiday + ": " + r.body().asString());
            assertTrue(r.jsonPath().getBoolean("holiday"), holiday + " deveria ser feriado nacional: " + r.body().asString());
            assertEquals(false, r.jsonPath().getBoolean("businessDay"), holiday);
            assertEquals("NATIONAL", r.jsonPath().getString("holidaySource"), holiday);
        }
        assertBusinessDay(HOST_ALFA, alfaAdmin, "2026-12-26", false); // sabado
        assertBusinessDay(HOST_ALFA, alfaAdmin, "2026-12-27", false); // domingo
        assertBusinessDay(HOST_ALFA, alfaAdmin, "2026-12-23", true);
    }

    @Test
    void stateHolidaysFollowTheUfOfTheCompanyNineOfJulyIsSaoPauloOnly() {
        // 9 de julho: feriado de SP, dia util no RJ - no MESMO tenant, so' a empresa corrente muda
        Response sp = check(calHost, tokenSp, "2026-07-09");
        assertEquals(200, sp.statusCode(), sp.body().asString());
        assertTrue(sp.jsonPath().getBoolean("holiday"), "9/7 deveria ser feriado em SP: " + sp.body().asString());
        assertEquals("STATE", sp.jsonPath().getString("holidaySource"));
        assertEquals(false, sp.jsonPath().getBoolean("businessDay"));
        assertBusinessDay(calHost, tokenRj, "2026-07-09", true);

        // o catalogo semeado so' traz o estadual de SP (README da extension): o RJ nao tem estadual semeado
        assertBusinessDay(calHost, tokenSp, "2026-04-23", true);
        assertBusinessDay(calHost, tokenRj, "2026-04-23", true);

        // o tenant alfa (cadastrado em SP) e o beta (cadastrado no RJ) seguem o estado do proprio cadastro
        assertBusinessDay(HOST_ALFA, alfaAdmin, "2026-07-09", false);
        assertBusinessDay(HOST_BETA, betaAdmin, "2026-07-09", true);
    }

    @Test
    void referenceListShowsNationalStateAndMovableHolidaysOfTheYear() {
        as(calHost, tokenSp).queryParam("year", 2026).get("/business-days/holidays/reference").then().statusCode(200)
                .body("code", hasItem("CARNIVAL")).body("code", hasItem("GOOD_FRIDAY"))
                .body("code", hasItem("CORPUS_CHRISTI"))
                .body("source", hasItem("NATIONAL")).body("source", hasItem("STATE")).body("source", hasItem("MOVABLE"));
    }

    // ------------------------------------------------------------------ moveis

    @Test
    void movableHolidaysAreHolidaysByDefaultAndCanBeUnmarkedPerScope() {
        String carnival = "2026-02-17";
        String goodFriday = "2026-04-03";
        String corpus = "2026-06-04";
        for (String date : List.of(carnival, goodFriday, corpus)) {
            assertBusinessDay(calHost, tokenSp, date, false);
            assertBusinessDay(calHost, tokenRj, date, false);
            assertEquals("MOVABLE", check(calHost, tokenSp, date).jsonPath().getString("holidaySource"), date);
        }
        as(calHost, tokenSp).get("/business-days/movable-holidays").then().statusCode(200)
                .body("code", hasItem("CARNIVAL")).body("find { it.code == 'CARNIVAL' }.enabled", equalTo(true))
                .body("find { it.code == 'CARNIVAL' }.origin", equalTo("DEFAULT"));

        // a empresa SP desmarca o Carnaval e a Sexta-feira Santa; a RJ nao mexe
        as(calHost, tokenSp).body(Map.of("code", "CARNIVAL", "enabled", false)).put("/business-days/movable-holidays")
                .then().statusCode(200).body("find { it.code == 'CARNIVAL' }.enabled", equalTo(false))
                .body("find { it.code == 'CARNIVAL' }.origin", equalTo("COMPANY"));
        as(calHost, tokenSp).body(Map.of("code", "GOOD_FRIDAY", "enabled", false)).put("/business-days/movable-holidays")
                .then().statusCode(200);
        try {
            assertBusinessDay(calHost, tokenSp, carnival, true);
            assertBusinessDay(calHost, tokenSp, goodFriday, true);
            assertBusinessDay(calHost, tokenSp, corpus, false);
            // outra empresa do mesmo tenant e outro tenant nao mudam
            assertBusinessDay(calHost, tokenRj, carnival, false);
            assertBusinessDay(HOST_ALFA, alfaAdmin, carnival, false);
            // a lista de referencia marca o desmarcado
            as(calHost, tokenSp).queryParam("year", 2026).get("/business-days/holidays/reference").then().statusCode(200)
                    .body("find { it.code == 'CARNIVAL' }.enabled", equalTo(false));
        } finally {
            as(calHost, tokenSp).body(mapWithNull("CARNIVAL")).put("/business-days/movable-holidays").then().statusCode(200);
            as(calHost, tokenSp).body(mapWithNull("GOOD_FRIDAY")).put("/business-days/movable-holidays").then().statusCode(200);
        }
        // voltou a herdar o padrao (ligado)
        assertBusinessDay(calHost, tokenSp, carnival, false);
        as(calHost, tokenSp).get("/business-days/movable-holidays").then().statusCode(200)
                .body("find { it.code == 'CARNIVAL' }.origin", equalTo("DEFAULT"));
    }

    @Test
    void unknownMovableHolidayCodeIsRefused() {
        int status = as(calHost, tokenSp).body(Map.of("code", "NATAL", "enabled", false))
                .put("/business-days/movable-holidays").statusCode();
        assertTrue(status >= 400 && status < 500, "codigo desconhecido respondeu " + status);
    }

    private static Map<String, Object> mapWithNull(String code) {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("code", code);
        m.put("enabled", null);
        return m;
    }

    // ------------------------------------------------------------------ "vai trabalhar"

    @Test
    void workOverrideMakesAHolidayAWorkingDayOnlyInItsScope() {
        String natal = "2026-12-25";
        assertBusinessDay(calHost, tokenSp, natal, false);

        Response created = as(calHost, tokenSp).body(Map.of("date", natal, "reason", "plantao de fim de ano"))
                .post("/business-days/work-overrides");
        assertEquals(201, created.statusCode(), created.body().asString());
        String id = created.jsonPath().getString("id");
        try {
            Response day = check(calHost, tokenSp, natal);
            assertTrue(day.jsonPath().getBoolean("businessDay"), "vai trabalhar: " + day.body().asString());
            assertTrue(day.jsonPath().getBoolean("worksOnHoliday"), day.body().asString());
            assertTrue(day.jsonPath().getBoolean("holiday"), "o feriado continua marcado: " + day.body().asString());
            as(calHost, tokenSp).get("/business-days/work-overrides").then().statusCode(200).body("date", hasItem(natal));
            // outra empresa do tenant e outros tenants seguem sem trabalhar
            assertBusinessDay(calHost, tokenRj, natal, false);
            as(calHost, tokenRj).get("/business-days/work-overrides").then().statusCode(200).body("date", not(hasItem(natal)));
            assertBusinessDay(HOST_ALFA, alfaAdmin, natal, false);
            // duplicada na mesma data e' recusada
            int dup = as(calHost, tokenSp).body(Map.of("date", natal)).post("/business-days/work-overrides").statusCode();
            assertEquals(409, dup);
        } finally {
            as(calHost, tokenSp).delete("/business-days/work-overrides/" + id).then().statusCode(204);
        }
        assertBusinessDay(calHost, tokenSp, natal, false);
    }

    @Test
    void workOverrideOnAWeekendWithPartialWeight() {
        String saturday = "2026-12-12";
        assertBusinessDay(calHost, tokenSp, saturday, false);
        Response created = as(calHost, tokenSp)
                .body(Map.of("date", saturday, "weight", 0.5, "reason", "sabado de inventario"))
                .post("/business-days/work-overrides");
        assertEquals(201, created.statusCode(), created.body().asString());
        try {
            Response day = check(calHost, tokenSp, saturday);
            assertTrue(day.jsonPath().getBoolean("businessDay"), day.body().asString());
            assertEquals(0.5f, day.jsonPath().getFloat("weight"), 0.0001, day.body().asString());
            Response count = as(calHost, tokenSp).queryParam("from", "2026-12-12").queryParam("to", "2026-12-12")
                    .get("/business-days/count");
            assertEquals(0.5f, count.jsonPath().getFloat("weightedDays"), 0.0001, count.body().asString());
        } finally {
            as(calHost, tokenSp).delete("/business-days/work-overrides/" + created.jsonPath().getString("id"));
        }
    }

    // ------------------------------------------------------------------ feriado proprio

    @Test
    void ownHolidayBelongsToTheCompanyThatCreatedItAndTheTenantIsolationHolds() {
        String date = "2026-03-10";
        assertBusinessDay(calHost, tokenSp, date, true);
        Response created = as(calHost, tokenSp)
                .body(Map.of("name", "Aniversario da empresa", "month", 3, "day", 10, "year", 2026))
                .post("/business-days/holidays");
        assertEquals(201, created.statusCode(), created.body().asString());
        String id = created.jsonPath().getString("id");
        try {
            Response day = check(calHost, tokenSp, date);
            assertEquals(false, day.jsonPath().getBoolean("businessDay"), day.body().asString());
            assertEquals("Aniversario da empresa", day.jsonPath().getString("holidayName"));
            assertBusinessDay(calHost, tokenRj, date, true);
            assertBusinessDay(HOST_ALFA, alfaAdmin, date, true);
            assertBusinessDay(HOST_BETA, betaAdmin, date, true);
            as(calHost, tokenRj).get("/business-days/holidays").then().statusCode(200)
                    .body("name", not(hasItem("Aniversario da empresa")));
        } finally {
            as(calHost, tokenSp).delete("/business-days/holidays/" + id).then().statusCode(204);
        }
        assertBusinessDay(calHost, tokenSp, date, true);
    }

    // ------------------------------------------------------------------ calculos

    @Test
    void countAddAndCalendarFollowTheEffectiveCalendar() {
        // 21 a 27/12/2026: segunda a quinta uteis (4); sexta e' Natal; sabado e domingo
        as(HOST_ALFA, alfaAdmin).queryParam("from", "2026-12-21").queryParam("to", "2026-12-27")
                .get("/business-days/count").then().statusCode(200).body("businessDays", equalTo(4));
        // quinta 24/12 + 1 dia util = segunda 28/12 (pula Natal e o fim de semana)
        as(HOST_ALFA, alfaAdmin).queryParam("from", "2026-12-24").queryParam("days", 1)
                .get("/business-days/add").then().statusCode(200).body("result", equalTo("2026-12-28"));
        as(HOST_ALFA, alfaAdmin).queryParam("year", 2026).queryParam("month", 12)
                .get("/business-days/calendar").then().statusCode(200)
                .body("days.size()", equalTo(31)).body("days.find { it.date == '2026-12-25' }.holiday", equalTo(true));
        // entradas invalidas: 400, nunca 500
        as(HOST_ALFA, alfaAdmin).get("/business-days/check").then().statusCode(400);
        as(HOST_ALFA, alfaAdmin).queryParam("from", "2026-12-27").queryParam("to", "2026-12-21")
                .get("/business-days/count").then().statusCode(org.hamcrest.Matchers.lessThan(500));
    }

    @Test
    void permissionsAndAuthenticationApply() throws Exception {
        Member plain = newMember(ALFA, alfaAdmin, firstCompanyPublicId(HOST_ALFA, alfaAdmin),
                List.of(), List.of());
        // E2E_LEITOR nao tem BUSINESS_DAY_READ
        check(HOST_ALFA, plain.token(), "2026-12-25").then().statusCode(403);
        anon(HOST_ALFA).queryParam("date", "2026-12-25").get("/business-days/check").then().statusCode(401);
    }
}
