package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
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
 * TE.1 - roles de integracao (API keys): so' aceitam permissoes LIBERADAS pela software house
 * ({@code permissions.for_integration}, no boilerplate: USER_READ/CREATE/UPDATE pela migration V3004/V3102); quem monta
 * a role nao concede permissao que nao tem; revogar a liberacao tira a permissao da role e a chave perde o acesso.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class IntegrationRolesE2eTest extends E2eBase {

    String sub;
    String host;
    String admin;
    String company;

    @BeforeAll
    void tenant() throws Exception {
        sub = freshTenant("integ");
        host = host(sub);
        admin = adminToken(sub);
        company = firstCompanyPublicId(host, admin);
    }

    private String permissionId(String name) throws Exception {
        return text(db(sub), "SELECT public_id FROM permissions WHERE name = '" + name + "'");
    }

    private Response createRole(String token, String name, boolean forIntegration, String... permissionNames)
            throws Exception {
        List<String> ids = new ArrayList<>();
        for (String p : permissionNames) {
            ids.add(permissionId(p));
        }
        return as(host, token).body(Map.of("name", name, "description", "perfil de teste e2e", "permissionPublicIds", ids,
                "forIntegration", forIntegration)).post("/roles");
    }

    @Test
    void onlyThePermissionsReleasedForIntegrationBuildAnIntegrationRole() throws Exception {
        assertEquals("true", text(db(sub), "SELECT for_integration::text FROM permissions WHERE name = 'USER_READ'"));
        assertEquals("false", text(db(sub), "SELECT for_integration::text FROM permissions WHERE name = 'USER_DELETE'"));

        Response ok = createRole(admin, "INTEGRA_LEITURA", true, "USER_READ");
        assertEquals(201, ok.statusCode(), ok.body().asString());
        Response notReleased = createRole(admin, "INTEGRA_APAGA", true, "USER_READ", "USER_DELETE");
        assertEquals(422, notReleased.statusCode(), notReleased.body().asString());
        assertEquals("PERMISSION_NOT_FOR_INTEGRATION", notReleased.jsonPath().getString("code"));
        // a mesma permissao nao liberada vale numa role COMUM (o flag so' restringe role de integracao)
        assertEquals(201, createRole(admin, "COMUM_APAGA", false, "USER_DELETE").statusCode());

        as(host, admin).get("/apikeys/roles").then().statusCode(200).body("name", hasItem("INTEGRA_LEITURA"));
    }

    @Test
    void whoBuildsTheRoleCannotGrantAPermissionTheyDoNotHold() throws Exception {
        // gestor de perfis que NAO tem USER_CREATE (liberada para integracao, mas ele nao a possui)
        exec(db(sub), "INSERT INTO roles (name, description, public_id, for_integration) VALUES ('E2E_GESTOR_PERFIL', 'g', '"
                + UUID.randomUUID() + "', FALSE) ON CONFLICT DO NOTHING");
        exec(db(sub), "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'E2E_GESTOR_PERFIL' AND r.company_id IS NULL AND p.name IN ('ROLE_CREATE', 'ROLE_READ', 'USER_READ') "
                + "ON CONFLICT DO NOTHING");
        Member manager = newMember(sub, admin, company, List.of(globalRoleId(sub, "E2E_GESTOR_PERFIL")), List.of());

        Response own = createRole(manager.token(), "INTEGRA_GESTOR_BOM", true, "USER_READ");
        assertEquals(201, own.statusCode(), own.body().asString());
        Response notHeld = createRole(manager.token(), "INTEGRA_GESTOR_NEGA", true, "USER_CREATE");
        assertEquals(403, notHeld.statusCode(), notHeld.body().asString());
        assertEquals("INTEGRATION_PERMISSION_NOT_HELD", notHeld.jsonPath().getString("code"));
    }

    @Test
    void revokingTheReleaseTakesThePermissionOutOfTheRoleAndTheKeyLosesAccess() throws Exception {
        Response key = as(host, admin).body(Map.of("name", "k-" + UUID.randomUUID(), "expiresDays", 30))
                .post("/apikeys/role/INTEGRACAO_USUARIOS");
        assertEquals(201, key.statusCode(), key.body().asString());
        String apiKey = key.jsonPath().getString("apiKey");
        assertNotNull(apiKey);
        given().header("Host", host).header("x-api-key", apiKey).get("/users").then().statusCode(200);

        exec(db(sub), "UPDATE permissions SET for_integration = FALSE WHERE name = 'USER_READ'");
        try {
            given().header("Host", host).header("x-api-key", apiKey).get("/users").then().statusCode(403);
            assertEquals("0", text(db(sub), "SELECT count(*) FROM role_permissions rp JOIN roles r ON r.id = rp.role_id "
                    + "JOIN permissions p ON p.id = rp.permission_id WHERE r.name = 'INTEGRACAO_USUARIOS' AND p.name = 'USER_READ'"));
        } finally {
            exec(db(sub), "UPDATE permissions SET for_integration = TRUE WHERE name = 'USER_READ'");
            exec(db(sub), "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                    + "WHERE r.name = 'INTEGRACAO_USUARIOS' AND r.company_id IS NULL AND p.name = 'USER_READ' ON CONFLICT DO NOTHING");
        }
        given().header("Host", host).header("x-api-key", apiKey).get("/users").then().statusCode(200);
    }

    @Test
    void anIntegrationRoleCannotBeGivenToAPersonAsAUserRole() throws Exception {
        Response r = as(host, admin).body(Map.of(
                "email", "pessoa-" + UUID.randomUUID().toString().substring(0, 6) + "@integ.test",
                "name", "Pessoa Com Integracao", "whatsApp", "11999997777", "password", PASSWORD,
                "emailPreConfirmed", true, "changePasswordRequired", false,
                "rolePublicIds", List.of(globalRoleId(sub, "INTEGRACAO_USUARIOS")),
                "memberships", List.of(Map.of("companyPublicId", company, "rolePublicIds", List.of()))))
                .post("/users");
        assertTrue(r.statusCode() >= 400 && r.statusCode() < 500,
                "pessoa com role de integracao respondeu " + r.statusCode() + " " + r.body().asString());
    }
}
