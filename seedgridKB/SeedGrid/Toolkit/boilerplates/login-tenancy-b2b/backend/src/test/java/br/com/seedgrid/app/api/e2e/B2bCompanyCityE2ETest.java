package br.com.seedgrid.app.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import br.com.seedgrid.security.services.CityLookupService;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Cidade no endereco da empresa (plano cidade-no-endereco, TCI.9), pilha real do b2b: o cadastro aceita {@code cityId}
 * (a cidade manda: UF e nome em texto derivados), a empresa devolve {@code city {id,name,ibgeCode,uf}}, o calendario
 * por UF (9/7 = feriado estadual de SP) segue a UF DA CIDADE e nao o texto, {@code cityId} inexistente da 400
 * {@code CITY_NOT_FOUND} e o cadastro so com texto (legado) continua valendo.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bCompanyCityE2ETest extends E2eBase {

    private static final String NINE_JULY = "2026-07-09";
    private static final String SAO_PAULO = "3550308";
    private static final String RIO = "3304557";

    @Inject
    CityLookupService cityLookup;

    @Transactional
    Long cityId(String ibge) {
        return cityLookup.findByIbgeCode(ibge).orElseThrow().getId();
    }

    private Map<String, Object> signupBody(String email, String cnpj, String name, Map<String, Object> addressChanges) {
        Map<String, Object> body = companySignupBody(email, cnpj, name);
        Map<String, Object> address = new HashMap<>();
        address.put("street", "Rua A");
        address.put("number", "1");
        address.put("postalCode", "01001000");
        address.put("district", "Centro");
        address.put("phone", "1133334444");
        address.putAll(addressChanges);
        body.put("address", address);
        return body;
    }

    private Account signUpWithCity(String name, String ibge, String textState) {
        String email = uniqueEmail(name.toLowerCase());
        String cnpj = cnpj();
        Map<String, Object> changes = new HashMap<>();
        changes.put("cityId", cityId(ibge));
        changes.put("city", "texto que a cidade sobrepoe");
        changes.put("state", textState);
        expect(json().body(signupBody(email, cnpj, name, changes)).post("/public/signup"), 202);
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
        Session s = login(email, PASSWORD);
        return new Account(email, cnpj, s.currentCompanyPublicId(), s);
    }

    private boolean isStateHoliday(String token) {
        Response r = json(token).queryParam("date", NINE_JULY).get("/business-days/check");
        assertEquals(200, r.statusCode(), r.asString());
        return r.jsonPath().getBoolean("holiday") && "STATE".equals(r.jsonPath().getString("holidaySource"));
    }

    @Test
    void signupWithCityIdCreatesACompanyWithTheCityAndTheDerivedUf() {
        Account sp = signUpWithCity("Paulistana", SAO_PAULO, "RJ"); // o texto diz RJ, a cidade diz SP
        Session platform = platformAdmin();

        Response company = expect(json(platform.token()).get("/companies/" + sp.companyPublicId()), 200);
        assertEquals(SAO_PAULO, company.jsonPath().getString("city.ibgeCode"), company.asString());
        assertEquals("SP", company.jsonPath().getString("city.uf"), company.asString());
        assertEquals("SP", company.jsonPath().getString("addrState"), company.asString());
        assertEquals("São Paulo", company.jsonPath().getString("city.name"), company.asString());
        assertEquals("São Paulo", company.jsonPath().getString("addrCity"), company.asString());
    }

    @Test
    void citiesRestAnswersTheIdThatTheSignupAcceptsAsCityId() {
        Response city = expect(json(platformAdmin().token()).get("/cities-api/cities/by-ibge-code/" + SAO_PAULO), 200);
        assertEquals(cityId(SAO_PAULO).longValue(), city.jsonPath().getLong("id"), city.asString());
        assertEquals("São Paulo", city.jsonPath().getString("name"), city.asString());
        assertEquals(401, http().get("/cities-api/cities/by-ibge-code/" + SAO_PAULO).statusCode());
    }

    @Test
    void theCalendarFollowsTheUfOfTheCityAndNotTheLegacyText() {
        Account sp = signUpWithCity("Paulista", SAO_PAULO, "RJ");
        Account rj = signUpWithCity("Carioca", RIO, "SP");
        for (int i = 0; i < 3; i++) {
            assertTrue(isStateHoliday(sp.session().token()));
            assertFalse(isStateHoliday(rj.session().token()));
        }
    }

    @Test
    void changingTheCityChangesTheCalendarAtOnce() {
        Account acc = signUpWithCity("Mudou", RIO, "RJ");
        Session platform = platformAdmin();
        String token = acc.session().token();
        assertFalse(isStateHoliday(token));

        Response patched = expect(json(platform.token()).body(Map.of("cityId", cityId(SAO_PAULO)))
                .patch("/companies/" + acc.companyPublicId()), 200);
        assertEquals("SP", patched.jsonPath().getString("addrState"), patched.asString());
        assertTrue(isStateHoliday(token));

        expect(json(platform.token()).body(Map.of("cityId", cityId(RIO)))
                .patch("/companies/" + acc.companyPublicId()), 200);
        assertFalse(isStateHoliday(token));
    }

    @Test
    void unknownCityIdIsRejectedWithCityNotFound() {
        String email = uniqueEmail("inv");
        Map<String, Object> changes = new HashMap<>();
        changes.put("cityId", 99999999L);
        Response r = json().body(signupBody(email, cnpj(), "Invalida", changes)).post("/public/signup");
        assertEquals(400, r.statusCode(), r.asString());
        assertEquals("CITY_NOT_FOUND", r.jsonPath().getString("code"), r.asString());
    }

    @Test
    void addressWithoutCityIdNorTextIsRejected() {
        Response r = json().body(signupBody(uniqueEmail("sem"), cnpj(), "SemCidade", Map.of()))
                .post("/public/signup");
        assertEquals(400, r.statusCode(), r.asString());
        assertEquals("ADDRESS_CITY_REQUIRED", r.jsonPath().getString("code"), r.asString());
    }

    @Test
    void legacyTextOnlySignupStillWorksAndHasNoCityObject() {
        Account legacy = newCompanyAccount("Legado");
        Session platform = platformAdmin();

        Response company = expect(json(platform.token()).get("/companies/" + legacy.companyPublicId()), 200);
        assertNull(company.jsonPath().get("city"), company.asString());
        assertEquals("Sao Paulo", company.jsonPath().getString("addrCity"), company.asString());
        assertEquals("SP", company.jsonPath().getString("addrState"), company.asString());
        assertTrue(isStateHoliday(legacy.session().token()));
    }
}
