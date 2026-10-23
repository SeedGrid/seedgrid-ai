package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.BETA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.HOST_MASTER;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * TE.1 - {@code quarkus.http.auth.proactive=false}: o outro modo de autenticacao. JWT e API key respondem 200/403/401,
 * NUNCA 500, o isolamento entre tenants vale igual e a sessao revogada continua derrubando o token. O modo proativo
 * (padrao do produto) e' o do restante da bateria ({@link E2eProfile}).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProactiveOffProfile.class)
class ProactiveAuthOffE2eTest extends E2eBase {

    static final String HOST_ALFA = host(ALFA);
    static final String HOST_BETA = host(BETA);

    String alfaToken;
    String betaToken;

    @BeforeAll
    void tenants() throws Exception {
        ensureTenant(ALFA);
        ensureTenant(BETA);
        alfaToken = adminToken(ALFA);
        betaToken = adminToken(BETA);
    }

    @Test
    void jwtOnEndpointWithPermissionAnswers200Or403NeverServerError() {
        as(HOST_ALFA, alfaToken).get("/probe/only-alfa").then().statusCode(200).body(equalTo(db(ALFA)));
        as(HOST_BETA, betaToken).get("/probe/only-alfa").then().statusCode(403);
        as(HOST_BETA, betaToken).get("/probe/only-beta").then().statusCode(200).body(equalTo(db(BETA)));
        as(HOST_ALFA, alfaToken).get("/probe/me").then().statusCode(200);
        given().header("Host", HOST_ALFA).get("/probe/only-alfa").then().statusCode(401);
    }

    @Test
    void tokenOfOneTenantIsRejectedOnTheOtherTenantAndOnTheMaster() {
        as(HOST_BETA, alfaToken).get("/probe/me").then().statusCode(401);
        as(HOST_MASTER, alfaToken).get("/probe/me").then().statusCode(401);
    }

    @Test
    void masterAdminTokenWorksOnTheMasterHostWithoutServerError() throws Exception {
        String masterToken = masterToken();
        // com a autenticacao proativa DESLIGADA o token do master responde normalmente (ver o gemeo com proativa ligada
        // em TenantIsolationE2eTest, que registra o 500 desse caso)
        as(HOST_MASTER, masterToken).get("/me/companies").then().statusCode(200);
        as(HOST_ALFA, masterToken).get("/probe/me").then().statusCode(401);
    }

    @Test
    void apiKeyWorksOnItsTenantAndIsRejectedOnTheOthers() {
        Response created = as(HOST_ALFA, alfaToken).body(Map.of("name", "k-" + UUID.randomUUID(), "expiresDays", 30))
                .post("/apikeys/role/PROBE_ROLE");
        assertEquals(201, created.statusCode(), created.body().asString());
        String key = created.jsonPath().getString("apiKey");
        assertNotNull(key);

        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/probe/permission").then().statusCode(200)
                .body(equalTo(db(ALFA)));
        given().header("Host", HOST_BETA).header("x-api-key", key).get("/probe/permission").then().statusCode(401);
        given().header("Host", HOST_MASTER).header("x-api-key", key).get("/probe/permission").then().statusCode(401);
        given().header("Host", HOST_ALFA).header("x-api-key", "sgkey_invalida").get("/probe/permission")
                .then().statusCode(401);
    }

    @Test
    void revokedSessionStillDropsTheToken() throws Exception {
        String company = firstCompanyPublicId(HOST_BETA, betaToken);
        Member member = newMember(BETA, betaToken, company, List.of(), List.of());
        as(HOST_BETA, member.token()).get("/probe/me").then().statusCode(200);
        as(HOST_BETA, betaToken).body(Map.of("active", false)).patch("/users/" + member.publicId())
                .then().statusCode(200);
        as(HOST_BETA, member.token()).get("/probe/me").then().statusCode(401)
                .contentType(containsString("application/problem+json")).body("code", equalTo("SESSION_REVOKED"));
    }
}
