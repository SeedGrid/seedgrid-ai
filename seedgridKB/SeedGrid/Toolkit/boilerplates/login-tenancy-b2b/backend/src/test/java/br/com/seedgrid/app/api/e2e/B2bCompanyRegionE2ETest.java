package br.com.seedgrid.app.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * GUARDIAO DO CALENDARIO POR UF no b2b (pilha real, sem {@code TestRegionProvider} e sem header {@code X-Uf}): a UF do
 * {@code Company.address.state} da empresa LOGADA decide o feriado estadual (9/7 = SP_REVOLUCAO_1932, quinta-feira em 2026),
 * contas de UFs diferentes nao vazam entre si, mudar a UF da empresa muda o resultado na hora e sem empresa corrente a
 * rota responde 403 {@code COMPANY_REQUIRED}. A prova detalhada (RJ, sem endereco, alternancia, banco) esta no
 * {@code BusinessDaysRegionE2eTest} do subdomain-tenancy; aqui fica a que depende do {@code company-required} do login-tenancy.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bCompanyRegionE2ETest extends E2eBase {

    private static final String NINE_JULY = "2026-07-09";
    private static final String STATE_CODE = "SP_REVOLUCAO_1932";

    /** Cadastro de uma conta com a UF pedida, confirmacao de e-mail e login. */
    private Account accountIn(String name, String state) {
        String email = uniqueEmail(name.toLowerCase());
        String cnpj = cnpj();
        Map<String, Object> body = companySignupBody(email, cnpj, name);
        Map<String, Object> address = new HashMap<>(Map.of("street", "Rua A", "number", "1", "postalCode", "01001000",
                "city", "Cidade", "state", state, "district", "Centro", "phone", "1133334444"));
        body.put("address", address);
        expect(json().body(body).post("/public/signup"), 202);
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
        Session s = login(email, PASSWORD);
        return new Account(email, cnpj, s.currentCompanyPublicId(), s);
    }

    private Response check(String token, String date) {
        Response r = json(token).queryParam("date", date).get("/business-days/check");
        assertEquals(200, r.statusCode(), date + ": " + r.asString());
        return r;
    }

    private void assertStateHoliday(String token) {
        Response r = check(token, NINE_JULY);
        assertTrue(r.jsonPath().getBoolean("holiday"), r.asString());
        assertEquals("STATE", r.jsonPath().getString("holidaySource"), r.asString());
        assertFalse(r.jsonPath().getBoolean("businessDay"), r.asString());
    }

    private void assertPlainBusinessDay(String token) {
        Response r = check(token, NINE_JULY);
        assertFalse(r.jsonPath().getBoolean("holiday"), r.asString());
        assertTrue(r.jsonPath().getBoolean("businessDay"), r.asString());
    }

    private boolean hasStateHolidayInReference(String token) {
        Response r = json(token).queryParam("year", 2026).get("/business-days/holidays/reference");
        assertEquals(200, r.statusCode(), r.asString());
        return r.jsonPath().getList("code").contains(STATE_CODE);
    }

    @Test
    void eachAccountFollowsTheUfOfItsOwnCompanyAndNeverLeaksToTheOther() {
        Account sp = accountIn("Paulista", "SP");
        Account rj = accountIn("Carioca", "RJ");
        for (int i = 0; i < 3; i++) {
            assertStateHoliday(sp.session().token());
            assertPlainBusinessDay(rj.session().token());
            assertTrue(hasStateHolidayInReference(sp.session().token()));
            assertFalse(hasStateHolidayInReference(rj.session().token()));
        }
        // nacionais e moveis valem nas duas UFs
        for (String date : new String[] { "2026-09-07", "2026-12-25", "2026-02-17", "2026-04-03", "2026-06-04" }) {
            assertTrue(check(sp.session().token(), date).jsonPath().getBoolean("holiday"), date);
            assertTrue(check(rj.session().token(), date).jsonPath().getBoolean("holiday"), date);
        }
    }

    @Test
    void loginWithTwoCompaniesOfDifferentUfsFollowsTheCompanyPickedAtEachSelection() {
        Account sp = accountIn("Paulista", "SP");
        // 2a empresa do mesmo login, cadastrada no RJ
        String email = sp.email();
        Map<String, Object> body = companySignupBody(email, cnpj(), "Fluminense");
        body.put("address", Map.of("street", "Rua B", "number", "2", "postalCode", "20000000", "city", "Rio",
                "state", "RJ", "district", "Centro", "phone", "2133334444"));
        expect(json().body(body).post("/public/signup"), 202);
        String rio = expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200)
                .jsonPath().getString("companyId");

        Session unscoped = sessionOf(loginRaw(email, PASSWORD));
        Session onSp = selectCompany(unscoped, sp.companyPublicId());
        Session onRj = selectCompany(unscoped, rio);
        for (int i = 0; i < 3; i++) {
            assertStateHoliday(onSp.token());
            assertPlainBusinessDay(onRj.token());
        }
    }

    @Test
    void changingTheUfOfTheCompanyChangesTheResultAtOnce() {
        Account rj = accountIn("Mudou", "RJ");
        Session platform = platformAdmin();
        String token = rj.session().token();
        assertPlainBusinessDay(token);
        assertFalse(hasStateHolidayInReference(token));

        expect(json(platform.token()).body(Map.of("addrState", "SP")).patch("/companies/" + rj.companyPublicId()), 200);
        assertStateHoliday(token);
        assertTrue(hasStateHolidayInReference(token));

        expect(json(platform.token()).body(Map.of("addrState", "RJ")).patch("/companies/" + rj.companyPublicId()), 200);
        assertPlainBusinessDay(token);
        assertFalse(hasStateHolidayInReference(token));
    }

    @Test
    void withoutCompanyIs403CompanyRequiredAndWithoutTokenIs401() {
        http().queryParam("date", NINE_JULY).get("/business-days/check").then().statusCode(401);

        Account a = accountIn("Duas", "SP");
        linkAnotherCompany(a.email(), "DuasB");
        Session unscoped = sessionOf(loginRaw(a.email(), PASSWORD));
        for (String path : new String[] { "/business-days/check?date=" + NINE_JULY,
                "/business-days/holidays/reference?year=2026", "/business-days/calendar?year=2026&month=7" }) {
            Response r = json(unscoped.token()).get(path);
            assertEquals(403, r.statusCode(), path + ": " + r.asString());
            assertEquals("COMPANY_REQUIRED", r.jsonPath().getString("code"), r.asString());
        }
    }
}
