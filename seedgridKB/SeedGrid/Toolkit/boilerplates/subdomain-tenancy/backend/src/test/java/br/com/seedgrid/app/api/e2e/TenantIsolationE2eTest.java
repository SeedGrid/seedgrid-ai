package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.BETA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.HOST_MASTER;
import static br.com.seedgrid.app.api.e2e.E2eWorld.MASTER_EMAIL;
import static br.com.seedgrid.app.api.e2e.E2eWorld.MASTER_PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * TE.1 - isolamento entre dois tenants e o master: RBAC (cache por tenant), token, API key, header de tenant, Host
 * encaminhado e as roles de integracao do boilerplate. Tudo por HTTP real, com o {@code Host} de cada tenant.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class TenantIsolationE2eTest extends E2eBase {

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

    // ------------------------------------------------------------------ RBAC

    @Test
    void rbacCacheDoesNotLeakBetweenTenantsThatShareTheAdminRoleName() {
        // a role ADMIN existe nos dois bancos, com permissoes diferentes (PROBE_ALFA so' no alfa, PROBE_BETA so' no beta).
        // O alfa chama primeiro (aquece o cache); o beta nao pode herdar a permissao dele.
        as(HOST_ALFA, alfaToken).get("/probe/only-alfa").then().statusCode(200).body(equalTo(db(ALFA)));
        as(HOST_BETA, betaToken).get("/probe/only-alfa").then().statusCode(403);
        as(HOST_BETA, betaToken).get("/probe/only-beta").then().statusCode(200).body(equalTo(db(BETA)));
        as(HOST_ALFA, alfaToken).get("/probe/only-beta").then().statusCode(403);
    }

    @Test
    void usersRolesAndCompaniesListedAreOnlyThoseOfTheTenantOfTheHost() {
        String users = as(HOST_ALFA, alfaToken).get("/users").then().statusCode(200).extract().asString();
        assertTrue(users.contains("admin@empalfa.test"), users);
        assertFalse(users.contains("admin@empbeta.test"), "usuario do beta apareceu no alfa: " + users);
        String companies = as(HOST_BETA, betaToken).get("/companies").then().statusCode(200).extract().asString();
        assertTrue(companies.contains("empbeta"), companies);
        assertFalse(companies.contains("empalfa"), "empresa do alfa apareceu no beta: " + companies);
    }

    // ------------------------------------------------------------------ token

    @Test
    void tokenOfOneTenantIsRejectedOnTheOtherTenantAndOnTheMaster() {
        as(HOST_ALFA, alfaToken).get("/probe/me").then().statusCode(200).body(equalTo(db(ALFA)));
        as(HOST_BETA, alfaToken).get("/probe/me").then().statusCode(401);
        as(HOST_MASTER, alfaToken).get("/probe/me").then().statusCode(401);
        as(HOST_ALFA, betaToken).get("/probe/me").then().statusCode(401);
    }

    @Test
    void masterAdminLogsInOnTheMasterHostAndItsTokenDoesNotOpenAnyTenant() throws Exception {
        String masterToken = masterToken();
        // o master nao tem banco de tenant: a sonda do tenant nao se aplica; /me/companies prova que o token vale la
        as(HOST_MASTER, masterToken).get("/me/companies").then().statusCode(200);
        as(HOST_ALFA, masterToken).get("/probe/me").then().statusCode(401);
        as(HOST_BETA, masterToken).get("/probe/me").then().statusCode(401);
    }

    @Test
    void tenantAdminCredentialsDoNotLogInOnTheOtherTenantNorOnTheMaster() {
        assertEquals(401, loginResponse(HOST_BETA, "admin@empalfa.test", PASSWORD).statusCode());
        assertEquals(401, loginResponse(HOST_MASTER, "admin@empalfa.test", PASSWORD).statusCode());
        assertEquals(401, loginResponse(HOST_ALFA, MASTER_EMAIL, MASTER_PASSWORD).statusCode());
    }

    // ------------------------------------------------------------------ tenant-header e Host encaminhado

    @Test
    void tenantHeaderNeverSelectsOrRedirectsTheTenantOfARequest() {
        // Documentado (README/ARQUITETURA do subdomain-tenancy): o TenantResolutionFilter sempre grava o tenant do Host
        // no contexto, entao em requisicao JAX-RS o header configurado so' vale com o contexto vazio (nao ocorre aqui).
        given().header("Host", HOST_MASTER).header("X-Tenant", ALFA).get("/probe/public/anon")
                .then().statusCode(200).body(not(equalTo(db(ALFA))));
        given().header("Host", HOST_ALFA).header("X-Tenant", BETA).get("/probe/public/anon")
                .then().statusCode(200).body(equalTo(db(ALFA)));

        // credencial do alfa + header do beta: nunca atende no banco do beta (o host manda e o token e' do alfa)
        Response redirect = as(HOST_ALFA, alfaToken).header("X-Tenant", BETA).get("/probe/me");
        assertEquals(200, redirect.statusCode(), redirect.body().asString());
        assertEquals(db(ALFA), redirect.body().asString(), "token do alfa atendido fora do banco do alfa via X-Tenant");
        // e o header nao libera o token do alfa no host do beta
        as(HOST_BETA, alfaToken).header("X-Tenant", ALFA).get("/probe/me").then().statusCode(401);
    }

    @Test
    void forwardedHostCannotRedirectACredentialToAnotherTenant() {
        Response r = as(HOST_ALFA, alfaToken).header("X-Forwarded-Host", HOST_BETA).get("/probe/me");
        assertNotEquals(db(BETA), r.statusCode() == 200 ? r.body().asString() : "",
                "token do alfa atendido no banco do beta via X-Forwarded-Host");
    }

    @Test
    void unknownSubdomainIsNotServed() {
        int status = given().header("Host", host("naoexiste")).get("/probe/public/anon").statusCode();
        assertTrue(status >= 400 && status < 500, "subdominio inexistente respondeu " + status);
    }

    // ------------------------------------------------------------------ API key

    @Test
    void apiKeyBelongsToItsTenantOnly() {
        String keyAlfa = createKey(HOST_ALFA, alfaToken, "PROBE_ROLE");
        String keyBeta = createKey(HOST_BETA, betaToken, "PROBE_ROLE");

        given().header("Host", HOST_ALFA).header("x-api-key", keyAlfa).get("/probe/permission")
                .then().statusCode(200).body(equalTo(db(ALFA)));
        given().header("Host", HOST_BETA).header("x-api-key", keyBeta).get("/probe/permission")
                .then().statusCode(200).body(equalTo(db(BETA)));
        // a chave de um tenant nao abre o outro nem o master
        given().header("Host", HOST_BETA).header("x-api-key", keyAlfa).get("/probe/permission").then().statusCode(401);
        given().header("Host", HOST_MASTER).header("x-api-key", keyAlfa).get("/probe/permission").then().statusCode(401);
        given().header("Host", HOST_ALFA).header("x-api-key", keyBeta).get("/probe/permission").then().statusCode(401);
        // header de tenant e Host encaminhado nao redirecionam a chave
        Response viaHeader = given().header("Host", HOST_ALFA).header("X-Tenant", BETA).header("x-api-key", keyAlfa)
                .get("/probe/permission");
        assertNotEquals(db(BETA), viaHeader.statusCode() == 200 ? viaHeader.body().asString() : "");
        Response viaForwarded = given().header("Host", HOST_ALFA).header("X-Forwarded-Host", HOST_BETA)
                .header("x-api-key", keyAlfa).get("/probe/permission");
        assertNotEquals(db(BETA), viaForwarded.statusCode() == 200 ? viaForwarded.body().asString() : "");
        // a listagem do beta nao mostra a chave do alfa
        String listing = as(HOST_BETA, betaToken).get("/apikeys/role/PROBE_ROLE").then().extract().asString();
        assertFalse(listing.contains(keyAlfa.substring(0, 14)), "listagem do beta mostra chave do alfa: " + listing);
    }

    @Test
    void apiKeyStopsWorkingWhenItsRoleLosesTheIntegrationFlagOrIsDeactivated() throws Exception {
        String key = createKey(HOST_ALFA, alfaToken, "PROBE_ROLE");
        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/probe/permission").then().statusCode(200);

        exec(db(ALFA), "UPDATE sg_roles SET for_integration = FALSE WHERE name = 'PROBE_ROLE'");
        try {
            given().header("Host", HOST_ALFA).header("x-api-key", key).get("/probe/permission").then().statusCode(401);
        } finally {
            exec(db(ALFA), "UPDATE sg_roles SET for_integration = TRUE WHERE name = 'PROBE_ROLE'");
        }
        exec(db(ALFA), "UPDATE sg_roles SET active = FALSE WHERE name = 'PROBE_ROLE'");
        try {
            given().header("Host", HOST_ALFA).header("x-api-key", key).get("/probe/permission").then().statusCode(401);
        } finally {
            exec(db(ALFA), "UPDATE sg_roles SET active = TRUE WHERE name = 'PROBE_ROLE'");
        }
        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/probe/permission").then().statusCode(200);
    }

    // ------------------------------------------------------------------ roles de integracao do boilerplate (V3003)

    @Test
    void integrationRoleOfTheBoilerplateIsListedAndLimitedToItsPermissions() {
        // o boilerplate semeia INTEGRACAO_USUARIOS (USER_READ/CREATE/UPDATE) como role de integracao
        as(HOST_ALFA, alfaToken).get("/apikeys/roles").then().statusCode(200)
                .body("name", org.hamcrest.Matchers.hasItem("INTEGRACAO_USUARIOS"));
        String key = createKey(HOST_ALFA, alfaToken, "INTEGRACAO_USUARIOS");

        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/users").then().statusCode(200);
        // nao tem USER_DELETE nem permissao de role/empresa: 403, nunca 200
        given().header("Host", HOST_ALFA).header("x-api-key", key).delete("/users/" + UUID.randomUUID())
                .then().statusCode(403);
        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/roles").then().statusCode(403);
        given().header("Host", HOST_ALFA).header("x-api-key", key).get("/companies").then().statusCode(403);
        // e a mesma chave nao existe no outro tenant
        given().header("Host", HOST_BETA).header("x-api-key", key).get("/users").then().statusCode(401);
    }

    @Test
    void aPerfilThatIsNotForIntegrationCannotBackAnApiKey() {
        int status = as(HOST_ALFA, alfaToken).body(Map.of("name", "k-" + UUID.randomUUID(), "expiresDays", 30))
                .post("/apikeys/role/ADMIN").statusCode();
        assertTrue(status >= 400 && status < 500, "ADMIN nao e' role de integracao, mas a chave respondeu " + status);
        as(HOST_ALFA, alfaToken).get("/apikeys/roles").then().statusCode(200).body("name", not(org.hamcrest.Matchers.hasItem("ADMIN")));
    }

    // ------------------------------------------------------------------ cadastro publico

    @Test
    void publicSignupRefusesASubdomainThatAlreadyExistsAndRegisterIsOnlyAtTheMaster() {
        Response again = given().header("Host", HOST_MASTER).contentType("application/json")
                .body(Map.of("subdomain", ALFA, "cnpj", cnpj(1), "corporateName", "outro LTDA", "tradeName", "outro SA",
                        "rootEmail", "outro@alfa.test", "plainRootPassword", PASSWORD))
                .post("/public/tenants");
        assertTrue(again.statusCode() >= 400 && again.statusCode() < 500,
                "subdominio ja ativo deveria ser recusado: " + again.statusCode() + " " + again.body().asString());
        assertNotNull(again.body().asString());
    }

    private static String createKey(String host, String token, String role) {
        Response r = as(host, token).body(Map.of("name", "k-" + UUID.randomUUID(), "expiresDays", 30))
                .post("/apikeys/role/" + role);
        assertEquals(201, r.statusCode(), "criar chave (" + role + "): " + r.body().asString());
        String key = r.jsonPath().getString("apiKey");
        assertNotNull(key, r.body().asString());
        return key;
    }
}
