package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;


import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * SEM contorno: o backend do b2c como esta no repositorio (com {@code seedgrid-security-social} e, por tabela,
 * {@code quarkus-oidc}). Um login por senha valido tem de produzir um bearer que a API reconhece. Hoje NAO reconhece:
 * o {@code OidcJsonWebTokenProducer} do quarkus-oidc ocupa o lugar do {@code JsonWebToken} do smallrye-jwt, o principal
 * fica anonimo e quase toda rota autenticada falha (ver COBERTURA.md, "Defeito encontrado").
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2cBearerAuthWithSocialModuleE2ETest extends E2eBase {

    @Test
    void aPasswordLoginTokenIsRecognizedByTheApi() {
        Person p = newPerson("bearer", false);
        Response perms = json(p.session().token()).get("/me/permissions");
        assertEquals(200, perms.statusCode(), "GET /me/permissions com o token do login: " + perms.asString());
        perms.then().body("roles", hasItem("ADMIN"));
        Response calendar = json(p.session().token()).get("/business-days/check?date=2026-12-30");
        assertEquals(200, calendar.statusCode(), "GET /business-days/check: " + calendar.asString());
    }
}
