package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.BETA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * GUARDIAO DO CALENDARIO POR UF (pilha real, sem {@code TestRegionProvider} e sem header {@code X-Uf}): prova que o
 * {@code SecurityBusinessDaysRegionProvider} (registrado pelo processor da extension porque o seedgrid-security esta no
 * indice) le o {@code Company.address.state} da empresa CORRENTE DO TOKEN, em HTTP real, e que o resultado nao vaza
 * entre empresas/tenants nem fica velho quando o endereco muda.
 *
 * <p>Datas fixas de 2026 (Pascoa 5/4/2026): Carnaval 17/2, Sexta-feira Santa 3/4, Corpus Christi 4/6; 9/7 (SP_REVOLUCAO_1932)
 * cai numa quinta-feira. Cenarios: SP, RJ, empresa sem endereco, alternancia entre empresas e tenants, endereco alterado
 * RJ-SP-RJ e "vai trabalhar" sobre o feriado estadual. O 403 {@code COMPANY_REQUIRED} nao se aplica ao subdomain-tenancy
 * ({@code company-required} desligado aqui); e' provado no login-tenancy-b2b ({@code B2bCompanyRegionE2ETest}).</p>
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class BusinessDaysRegionE2eTest extends E2eBase {

    static final String STATE_CODE = "SP_REVOLUCAO_1932";
    static final String NINE_JULY = "2026-07-09";
    static final List<String> NATIONAL_2026 = List.of("2026-01-01", "2026-04-21", "2026-05-01", "2026-09-07", "2026-10-12",
            "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25");
    static final Map<String, String> MOVABLE_2026 = Map.of("2026-02-17", "CARNIVAL", "2026-04-03", "GOOD_FRIDAY",
            "2026-06-04", "CORPUS_CHRISTI");
    static final String BY_NINE_JULY = "days.find { it.date == '" + NINE_JULY + "' }";

    String sub;
    String host;
    String admin;
    String companySp;
    String companyRj;
    String companyNoAddress;
    String tokenSp;
    String tokenRj;
    String tokenNoAddress;

    @BeforeAll
    void tenant() throws Exception {
        ensureTenant(ALFA);
        ensureTenant(BETA);
        sub = freshTenant("regio");
        host = host(sub);
        admin = adminToken(sub);
        companySp = firstCompanyPublicId(host, admin); // o cadastro do tenant e' em SP
        companyRj = createCompany(sub, admin, cnpj(61), "filial rio", "RJ");
        companyNoAddress = createCompanyWithoutAddress(host, admin, cnpj(62));
        tokenSp = selectCompany(host, admin, companySp);
        tokenRj = selectCompany(host, admin, companyRj);
        tokenNoAddress = selectCompany(host, admin, companyNoAddress);
    }

    /** Empresa sem nenhum campo de endereco (sem UF). */
    private static String createCompanyWithoutAddress(String h, String adminToken, String doc) {
        Response r = as(h, adminToken)
                .body(Map.of("personType", "PJ", "cpfCnpj", doc, "corporateName", "Sem Endereco LTDA",
                        "tradeName", "Sem Endereco SA"))
                .post("/companies");
        assertEquals(201, r.statusCode(), "criar empresa sem endereco: " + r.body().asString());
        return r.jsonPath().getString("publicId");
    }

    // ------------------------------------------------------------------ helpers

    private static Response check(String h, String token, String date) {
        Response r = as(h, token).queryParam("date", date).get("/business-days/check");
        assertEquals(200, r.statusCode(), date + ": " + r.body().asString());
        return r;
    }

    /** O dia e' feriado ESTADUAL e nao e' dia util. */
    private static void assertStateHoliday(String h, String token, String date) {
        Response r = check(h, token, date);
        assertTrue(r.jsonPath().getBoolean("holiday"), date + " deveria ser feriado: " + r.body().asString());
        assertEquals("STATE", r.jsonPath().getString("holidaySource"), r.body().asString());
        assertFalse(r.jsonPath().getBoolean("businessDay"), r.body().asString());
    }

    /** O dia e' dia util comum (sem feriado de nenhuma fonte). */
    private static void assertPlainBusinessDay(String h, String token, String date) {
        Response r = check(h, token, date);
        assertFalse(r.jsonPath().getBoolean("holiday"), date + " nao deveria ser feriado: " + r.body().asString());
        assertTrue(r.jsonPath().getBoolean("businessDay"), r.body().asString());
    }

    private static List<String> referenceCodes(String h, String token, int year) {
        Response r = as(h, token).queryParam("year", year).get("/business-days/holidays/reference");
        assertEquals(200, r.statusCode(), r.body().asString());
        return r.jsonPath().getList("code");
    }

    private void assertNationalAndMovableHolidays(String token) {
        for (String date : NATIONAL_2026) {
            Response r = check(host, token, date);
            assertTrue(r.jsonPath().getBoolean("holiday"), date + ": " + r.body().asString());
            assertEquals("NATIONAL", r.jsonPath().getString("holidaySource"), date);
            assertFalse(r.jsonPath().getBoolean("businessDay"), date);
        }
        MOVABLE_2026.forEach((date, code) -> {
            Response r = check(host, token, date);
            assertTrue(r.jsonPath().getBoolean("holiday"), date + " (" + code + "): " + r.body().asString());
            assertEquals("MOVABLE", r.jsonPath().getString("holidaySource"), date);
            assertFalse(r.jsonPath().getBoolean("businessDay"), date);
        });
    }

    private static int businessDaysBetween(String h, String token, String from, String to) {
        Response r = as(h, token).queryParam("from", from).queryParam("to", to).get("/business-days/count");
        assertEquals(200, r.statusCode(), r.body().asString());
        return r.jsonPath().getInt("businessDays");
    }

    private static String addBusinessDays(String h, String token, String from, int days) {
        Response r = as(h, token).queryParam("from", from).queryParam("days", days).get("/business-days/add");
        assertEquals(200, r.statusCode(), r.body().asString());
        return r.jsonPath().getString("result");
    }

    // ------------------------------------------------------------------ 1) SP

    @Test
    void companyInSaoPauloHasTheNineOfJulyStateHolidayInEveryRouteThatListsOrChecksHolidays() {
        assertStateHoliday(host, tokenSp, NINE_JULY);

        // lista de referencia do ano: 2026 e o ano corrente do relogio
        for (int year : new int[] { 2026, LocalDate.now().getYear() }) {
            Response ref = as(host, tokenSp).queryParam("year", year).get("/business-days/holidays/reference");
            assertEquals(200, ref.statusCode(), ref.body().asString());
            String item = "find { it.code == '" + STATE_CODE + "' }";
            assertEquals(year + "-07-09", ref.jsonPath().getString(item + ".date"), "referencia " + year + ": " + ref.body().asString());
            assertEquals("STATE", ref.jsonPath().getString(item + ".source"));
            assertEquals("SP", ref.jsonPath().getString(item + ".uf"));
        }

        // calendario de julho
        Response july = as(host, tokenSp).queryParam("year", 2026).queryParam("month", 7).get("/business-days/calendar");
        assertEquals(200, july.statusCode(), july.body().asString());
        assertTrue(july.jsonPath().getBoolean(BY_NINE_JULY + ".holiday"), july.body().asString());
        assertEquals("STATE", july.jsonPath().getString(BY_NINE_JULY + ".holidaySource"));

        // 6 a 10/7 (segunda a sexta) menos o 9/7; quarta 8/7 + 1 dia util pula o 9/7 e cai na sexta 10/7
        assertEquals(4, businessDaysBetween(host, tokenSp, "2026-07-06", "2026-07-10"));
        assertEquals("2026-07-10", addBusinessDays(host, tokenSp, "2026-07-08", 1));

        assertNationalAndMovableHolidays(tokenSp);
    }

    // ------------------------------------------------------------------ 2) outra UF

    @Test
    void companyInRioDoesNotHaveTheNineOfJulyButKeepsNationalAndMovableHolidays() {
        assertPlainBusinessDay(host, tokenRj, NINE_JULY);
        assertFalse(referenceCodes(host, tokenRj, 2026).contains(STATE_CODE), "RJ nao tem o feriado de SP na referencia");
        assertFalse(referenceCodes(host, tokenRj, LocalDate.now().getYear()).contains(STATE_CODE));

        Response july = as(host, tokenRj).queryParam("year", 2026).queryParam("month", 7).get("/business-days/calendar");
        assertFalse(july.jsonPath().getBoolean(BY_NINE_JULY + ".holiday"), july.body().asString());
        assertEquals(5, businessDaysBetween(host, tokenRj, "2026-07-06", "2026-07-10"));
        assertEquals("2026-07-09", addBusinessDays(host, tokenRj, "2026-07-08", 1));

        assertNationalAndMovableHolidays(tokenRj);
        List<String> codes = referenceCodes(host, tokenRj, 2026);
        assertTrue(codes.containsAll(List.of("CARNIVAL", "GOOD_FRIDAY", "CORPUS_CHRISTI")), codes.toString());
    }

    // ------------------------------------------------------------------ 3) sem endereco

    @Test
    void companyWithoutAddressHasNoStateHolidayButKeepsNationalAndMovableOnes() {
        assertPlainBusinessDay(host, tokenNoAddress, NINE_JULY);
        assertFalse(referenceCodes(host, tokenNoAddress, 2026).contains(STATE_CODE));
        assertNationalAndMovableHolidays(tokenNoAddress);
        Response ref = as(host, tokenNoAddress).queryParam("year", 2026).get("/business-days/holidays/reference");
        assertFalse(ref.jsonPath().getList("source").contains("STATE"), ref.body().asString());
        assertEquals(5, businessDaysBetween(host, tokenNoAddress, "2026-07-06", "2026-07-10"));
    }

    // ------------------------------------------------------------------ 4) sem vazamento

    @Test
    void ufOfOneCompanyNeverLeaksToAnotherWhenTheSameDateIsQueriedInSequenceAndAlternating() {
        for (int i = 0; i < 4; i++) {
            assertStateHoliday(host, tokenSp, NINE_JULY);
            assertPlainBusinessDay(host, tokenRj, NINE_JULY);
            assertPlainBusinessDay(host, tokenNoAddress, NINE_JULY);
        }
        for (int i = 0; i < 3; i++) {
            assertPlainBusinessDay(host, tokenNoAddress, NINE_JULY);
            assertStateHoliday(host, tokenSp, NINE_JULY);
            assertPlainBusinessDay(host, tokenRj, NINE_JULY);
            assertFalse(referenceCodes(host, tokenRj, 2026).contains(STATE_CODE));
            assertTrue(referenceCodes(host, tokenSp, 2026).contains(STATE_CODE));
        }
    }

    @Test
    void twoTenantsWithDifferentUfsDoNotLeakIntoEachOther() {
        String alfaAdmin = adminToken(ALFA); // cadastrada em SP
        String betaAdmin = adminToken(BETA); // cadastrada no RJ
        for (int i = 0; i < 3; i++) {
            assertStateHoliday(host(ALFA), alfaAdmin, NINE_JULY);
            assertPlainBusinessDay(host(BETA), betaAdmin, NINE_JULY);
            assertPlainBusinessDay(host, tokenRj, NINE_JULY);
            assertStateHoliday(host, tokenSp, NINE_JULY);
        }
        assertTrue(referenceCodes(host(ALFA), alfaAdmin, 2026).contains(STATE_CODE));
        assertFalse(referenceCodes(host(BETA), betaAdmin, 2026).contains(STATE_CODE));
    }

    // ------------------------------------------------------------------ 5) autenticacao

    @Test
    void withoutTokenTheCalendarIs401() {
        anon(host).queryParam("date", NINE_JULY).get("/business-days/check").then().statusCode(401);
        anon(host).queryParam("year", 2026).get("/business-days/holidays/reference").then().statusCode(401);
    }

    // ------------------------------------------------------------------ 6) endereco alterado

    @Test
    void changingTheAddressStateOfTheCompanyChangesTheResultAtOnceWithNoStaleCache() throws Exception {
        String sub2 = freshTenant("mudan");
        String host2 = host(sub2);
        String admin2 = adminToken(sub2);
        String rio = createCompany(sub2, admin2, cnpj(63), "filial rio", "RJ");
        String tokenRio = selectCompany(host2, admin2, rio);

        assertPlainBusinessDay(host2, tokenRio, NINE_JULY);
        assertFalse(referenceCodes(host2, tokenRio, 2026).contains(STATE_CODE));

        // RJ -> SP: o MESMO token (mesma empresa) passa a ver o feriado paulista
        Response patch = as(host2, admin2).body(Map.of("addrState", "SP")).patch("/companies/" + rio);
        assertEquals(200, patch.statusCode(), patch.body().asString());
        assertStateHoliday(host2, tokenRio, NINE_JULY);
        assertTrue(referenceCodes(host2, tokenRio, 2026).contains(STATE_CODE));
        assertEquals(4, businessDaysBetween(host2, tokenRio, "2026-07-06", "2026-07-10"));

        // SP -> RJ de volta: o feriado some
        patch = as(host2, admin2).body(Map.of("addrState", "RJ")).patch("/companies/" + rio);
        assertEquals(200, patch.statusCode(), patch.body().asString());
        assertPlainBusinessDay(host2, tokenRio, NINE_JULY);
        assertFalse(referenceCodes(host2, tokenRio, 2026).contains(STATE_CODE));
        assertEquals(5, businessDaysBetween(host2, tokenRio, "2026-07-06", "2026-07-10"));

        // a empresa original de SP do tenant nunca mudou de UF
        assertStateHoliday(host2, selectCompany(host2, admin2, firstCompanyPublicId(host2, admin2)), NINE_JULY);

        // alteracao feita direto no banco (fora da API) tambem vale na proxima consulta
        exec(db(sub2), "UPDATE sg_companies SET addr_state = 'SP' WHERE public_id = '" + rio + "'");
        assertStateHoliday(host2, tokenRio, NINE_JULY);
        exec(db(sub2), "UPDATE sg_companies SET addr_state = 'RJ' WHERE public_id = '" + rio + "'");
        assertPlainBusinessDay(host2, tokenRio, NINE_JULY);
    }

    // ------------------------------------------------------------------ 7) "vai trabalhar" sobre o estadual

    @Test
    void workOverrideOnTheStateHolidayMakesItAWorkingDayOnlyForTheCompanyThatAskedForIt() {
        Response created = as(host, tokenSp).body(Map.of("date", NINE_JULY, "reason", "plantao no feriado paulista"))
                .post("/business-days/work-overrides");
        assertEquals(201, created.statusCode(), created.body().asString());
        try {
            Response sp = check(host, tokenSp, NINE_JULY);
            assertTrue(sp.jsonPath().getBoolean("businessDay"), sp.body().asString());
            assertTrue(sp.jsonPath().getBoolean("worksOnHoliday"), sp.body().asString());
            assertTrue(sp.jsonPath().getBoolean("holiday"), "o feriado estadual continua marcado: " + sp.body().asString());
            assertEquals("STATE", sp.jsonPath().getString("holidaySource"));
            // a outra empresa do tenant (RJ) segue com dia util comum, sem a excecao
            Response rj = check(host, tokenRj, NINE_JULY);
            assertFalse(rj.jsonPath().getBoolean("worksOnHoliday"), rj.body().asString());
            assertTrue(rj.jsonPath().getBoolean("businessDay"));
        } finally {
            as(host, tokenSp).delete("/business-days/work-overrides/" + created.jsonPath().getString("id"))
                    .then().statusCode(204);
        }
        assertStateHoliday(host, tokenSp, NINE_JULY);
    }
}
