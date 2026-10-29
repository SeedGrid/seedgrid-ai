package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.HOST_MASTER;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

/**
 * Cidade no endereco no subdomain-tenancy (plano cidade-no-endereco, TCI.9), pilha real: a cities migrada no MASTER e em
 * CADA banco de tenant; o cadastro do tenant aceita {@code address.cityId} (o tenant guarda a cidade no master e a
 * empresa do tenant aponta para a {@code sg_cities} do banco do tenant); o CRUD de empresas aceita {@code cityId}; o
 * calendario por UF segue a UF da cidade.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class CompanyCityE2eTest extends E2eBase {

    static final String NINE_JULY = "2026-07-09";
    static final String SAO_PAULO = "3550308";
    static final String RIO = "3304557";

    String sub;
    String host;
    String admin;

    @BeforeAll
    void tenant() throws Exception {
        ensureTenant(ALFA);
        sub = freshTenant("cidade");
        host = host(sub);
        admin = adminToken(sub);
    }

    private long cityId(String ibge) throws Exception {
        return Long.parseLong(text(db(sub), "select id from sg_cities where ibge_code = '" + ibge + "'"));
    }

    private Response createCompany(String cnpj, String name, Map<String, Object> addressFields) {
        Map<String, Object> body = new HashMap<>();
        body.put("personType", "PJ");
        body.put("cpfCnpj", cnpj);
        body.put("corporateName", name + " LTDA");
        body.put("tradeName", name + " SA");
        body.putAll(addressFields);
        return as(host, admin).body(body).post("/companies");
    }

    private boolean isStateHoliday(String token) {
        Response r = as(host, token).queryParam("date", NINE_JULY).get("/business-days/check");
        assertEquals(200, r.statusCode(), r.body().asString());
        return r.jsonPath().getBoolean("holiday") && "STATE".equals(r.jsonPath().getString("holidaySource"));
    }

    @Test
    void citiesIsMigratedInTheMasterAndInTheTenantDatabase() throws Exception {
        assertEquals("5571", masterText("select count(*) from sg_cities"));
        assertEquals("5571", text(db(sub), "select count(*) from sg_cities"));
        assertEquals("sg_cities", text(db(sub),
                "select confrelid::regclass::text from pg_constraint where conname = 'fk_sg_companies_addr_city'"));
        assertEquals("sg_cities", masterText(
                "select confrelid::regclass::text from pg_constraint where conname = 'fk_sg_tenants_addr_city'"));
    }

    @Test
    void citiesRestOfTheTenantAnswersTheIdThatTheCompanyCrudAcceptsAsCityId() throws Exception {
        Response city = as(host, admin).get("/cities-api/cities/by-ibge-code/" + SAO_PAULO);
        assertEquals(200, city.statusCode(), city.body().asString());
        assertEquals(cityId(SAO_PAULO), city.jsonPath().getLong("id"), city.body().asString());
    }

    @Test
    void companyCreatedWithCityIdHasTheCityTheDerivedUfAndTheCalendarOfThatUf() throws Exception {
        Map<String, Object> address = new HashMap<>();
        address.put("cityId", cityId(SAO_PAULO));
        address.put("addrState", "RJ"); // ignorada: a cidade manda
        address.put("addrCity", "Texto Qualquer");
        Response created = createCompany(cnpj(71), "Paulista", address);
        assertEquals(201, created.statusCode(), created.body().asString());
        assertEquals(SAO_PAULO, created.jsonPath().getString("city.ibgeCode"), created.body().asString());
        assertEquals("SP", created.jsonPath().getString("city.uf"), created.body().asString());
        assertEquals("SP", created.jsonPath().getString("addrState"), created.body().asString());

        String token = selectCompany(host, admin, created.jsonPath().getString("publicId"));
        assertTrue(isStateHoliday(token), "9/7 e' feriado estadual para uma empresa com cidade de SP");

        Map<String, Object> rio = new HashMap<>();
        rio.put("cityId", cityId(RIO));
        rio.put("addrState", "SP"); // ignorada
        Response other = createCompany(cnpj(72), "Carioca", rio);
        assertEquals(201, other.statusCode(), other.body().asString());
        String tokenRio = selectCompany(host, admin, other.jsonPath().getString("publicId"));
        assertFalse(isStateHoliday(tokenRio), "uma empresa com cidade do RJ nao tem o feriado de SP");
        assertTrue(isStateHoliday(token), "e o resultado da empresa de SP nao muda");
    }

    @Test
    void unknownCityIdIs400CityNotFoundAndNoCityKeepsTheText() throws Exception {
        Response invalid = createCompany(cnpj(73), "Invalida", Map.of("cityId", 99999999L));
        assertEquals(400, invalid.statusCode(), invalid.body().asString());
        assertEquals("CITY_NOT_FOUND", invalid.jsonPath().getString("code"), invalid.body().asString());

        Response legacy = createCompany(cnpj(74), "Legada",
                Map.of("addrCity", "Cidade Teste", "addrState", "MG"));
        assertEquals(201, legacy.statusCode(), legacy.body().asString());
        assertNull(legacy.jsonPath().get("city"), legacy.body().asString());
        assertEquals("MG", legacy.jsonPath().getString("addrState"), legacy.body().asString());
    }

    @Test
    @Timeout(180)
    void tenantSignupWithCityIdKeepsTheCityInTheMasterAndOnTheCompanyOfTheTenant() throws Exception {
        String subdomain = "cidadesig" + (System.nanoTime() % 100000);
        String masterCityId = masterText("select id from sg_cities where ibge_code = '" + RIO + "'");
        Map<String, Object> address = new HashMap<>();
        address.put("street", "Rua Teste");
        address.put("number", "123");
        address.put("postalCode", "01234567");
        address.put("district", "Centro");
        address.put("phone", "1133334444");
        address.put("cityId", Long.parseLong(masterCityId));
        address.put("city", "Texto");
        address.put("state", "SP"); // ignorada: a cidade manda
        Map<String, Object> body = Map.of(
                "subdomain", subdomain,
                "cnpj", cnpj(80),
                "corporateName", subdomain + " LTDA",
                "tradeName", subdomain + " SA",
                "address", address,
                "legalRepresentative", Map.of("firstName", "Admin", "lastName", "Cidade", "cpf", "52998224725",
                        "birthDate", "1990-01-01", "phone", "11999998888", "whatsapp", "11999998888"),
                "rootEmail", adminEmail(subdomain),
                "plainRootPassword", PASSWORD);
        Response signup = given().header("Host", HOST_MASTER).contentType(ContentType.JSON).body(body)
                .post("/public/tenants");
        assertEquals(201, signup.statusCode(), signup.body().asString());

        assertEquals(RIO, masterText("select c.ibge_code from sg_tenants t join sg_cities c on c.id = t.addr_city_id "
                + "where t.subdomain = '" + subdomain + "'"));
        assertEquals("RJ", masterText("select addr_state from sg_tenants where subdomain = '" + subdomain + "'"));

        String code = masterText("select t.code from sg_tenant_validation_tokens t join sg_tenants x on x.id = t.tenant_id "
                + "where x.subdomain = '" + subdomain + "' order by t.id desc limit 1");
        assertNotNull(code);
        Response validate = given().header("Host", HOST_MASTER).contentType(ContentType.JSON)
                .body(Map.of("subdomain", subdomain, "code", code)).post("/public/tenants/validate-email");
        assertEquals(200, validate.statusCode(), validate.body().asString());

        assertEquals(RIO, text(db(subdomain), "select c.ibge_code from sg_companies co join sg_cities c "
                + "on c.id = co.addr_city_id order by co.id limit 1"));
        assertEquals("RJ", text(db(subdomain), "select addr_state from sg_companies order by id limit 1"));
    }
}
