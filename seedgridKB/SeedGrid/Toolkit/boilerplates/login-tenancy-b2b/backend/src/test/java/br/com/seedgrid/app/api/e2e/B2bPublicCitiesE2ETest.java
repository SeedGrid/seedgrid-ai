package br.com.seedgrid.app.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * Consulta PUBLICA de cidade para o signup (plano cidade-no-endereco, TCI.13), pilha real do B2b: ligada no
 * application.properties do boilerplate, atende SEM token e devolve SO' {id, name, uf, ibgeCode}; a busca exige UF; a REST
 * autenticada (/cities-api) segue exigindo token.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bPublicCitiesE2ETest extends E2eBase {

    private static final Set<String> MINIMUM = Set.of("id", "name", "uf", "ibgeCode");

    @Test
    void anonymousResolvesACityByIbgeCodeWithOnlyTheMinimumFields() {
        Response r = http().get("/public/cities/by-ibge-code/3550308");
        assertEquals(200, r.statusCode(), r.asString());
        Map<String, Object> city = r.jsonPath().getMap("$");
        assertEquals(MINIMUM, city.keySet());
        assertEquals("São Paulo", city.get("name"));
        assertEquals("SP", city.get("uf"));
        assertEquals("3550308", city.get("ibgeCode"));
    }

    @Test
    void anonymousSearchNeedsUfAndReturnsOnlyTheMinimumFields() {
        assertEquals(400, http().queryParam("name", "campinas").get("/public/cities").statusCode());
        Response r = http().queryParam("uf", "SP").queryParam("name", "campinas").get("/public/cities");
        assertEquals(200, r.statusCode(), r.asString());
        List<Map<String, Object>> content = r.jsonPath().getList("$");
        assertTrue(content.stream().anyMatch(c -> "3509502".equals(c.get("ibgeCode"))), r.asString());
        content.forEach(c -> assertEquals(MINIMUM, c.keySet()));
    }

    @Test
    void authenticatedRestStillNeedsAToken() {
        assertEquals(401, http().get("/cities-api/cities?name=Sao").statusCode());
    }
}
