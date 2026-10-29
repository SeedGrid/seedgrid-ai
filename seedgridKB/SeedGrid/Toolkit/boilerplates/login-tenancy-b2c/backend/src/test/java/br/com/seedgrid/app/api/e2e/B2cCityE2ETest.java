package br.com.seedgrid.app.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

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
 * Cidade no cadastro de PESSOA FISICA (plano cidade-no-endereco, TCI.9), pilha real do b2c: {@code cityId} opcional
 * (a conta pessoal herda a cidade e a UF dela), PF sem endereco continua valida e {@code cityId} inexistente da 400
 * {@code CITY_NOT_FOUND}.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2cCityE2ETest extends E2eBase {

    @Inject
    CityLookupService cityLookup;

    @Transactional
    Long cityId(String ibge) {
        return cityLookup.findByIbgeCode(ibge).orElseThrow().getId();
    }

    @Test
    void personWithCityIdGetsThePersonalAccountWithTheCityAndTheUf() {
        String email = uniqueEmail("pf-cidade");
        Map<String, Object> body = new HashMap<>(personalSignupBody(email, null));
        body.put("cityId", cityId("2605459")); // Fernando de Noronha (V1204), PE
        expect(json().body(body).post("/public/signup/personal"), 202);
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
        Session s = login(email, PASSWORD);

        Response company = expect(json(platformAdmin().token()).get("/companies/" + s.currentCompanyPublicId()), 200);
        assertEquals("2605459", company.jsonPath().getString("city.ibgeCode"), company.asString());
        assertEquals("PE", company.jsonPath().getString("city.uf"), company.asString());
        assertEquals("PE", company.jsonPath().getString("addrState"), company.asString());
    }

    @Test
    void personWithoutAddressRemainsValidAndHasNoCity() {
        Person p = newPerson("pf-sem-cidade", false);

        Response company = expect(json(platformAdmin().token()).get("/companies/" + p.companyPublicId()), 200);
        assertNull(company.jsonPath().get("city"), company.asString());
        assertNull(company.jsonPath().get("addrState"), company.asString());
    }

    @Test
    void unknownCityIdIsRejectedWithCityNotFound() {
        Map<String, Object> body = new HashMap<>(personalSignupBody(uniqueEmail("pf-inv"), null));
        body.put("cityId", 99999999L);
        Response r = json().body(body).post("/public/signup/personal");
        assertEquals(400, r.statusCode(), r.asString());
        assertEquals("CITY_NOT_FOUND", r.jsonPath().getString("code"), r.asString());
    }
}
