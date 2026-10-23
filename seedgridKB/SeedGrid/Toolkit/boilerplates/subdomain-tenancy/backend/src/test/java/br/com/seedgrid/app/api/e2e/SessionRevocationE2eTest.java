package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.BETA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;

/**
 * TE.1 - sessao revogada: o JWT (que nao consulta o banco) deixa de valer NA HORA em que o acesso e' cortado. Vinculo
 * removido, usuario desativado, empresa inativada e senha trocada (pelo proprio usuario ou pelo admin) respondem
 * 401 {@code SESSION_REVOKED}; o marcador de um tenant nao derruba o token de outro e o login novo segue valendo.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class SessionRevocationE2eTest extends E2eBase {

    static final String HOST_ALFA = host(ALFA);
    static final String HOST_BETA = host(BETA);
    static final String PROBE = "/probe/me";

    String alfaAdmin;
    String betaAdmin;
    String alfaCompany;
    String betaCompany;

    @BeforeAll
    void tenants() throws Exception {
        ensureTenant(ALFA);
        ensureTenant(BETA);
        alfaAdmin = adminToken(ALFA);
        betaAdmin = adminToken(BETA);
        alfaCompany = firstCompanyPublicId(HOST_ALFA, alfaAdmin);
        betaCompany = firstCompanyPublicId(HOST_BETA, betaAdmin);
    }

    @Test
    void deactivatingTheUserRevokesTheOldTokenAtOnceAndOtherTenantsAreUntouched() throws Exception {
        Member member = newMember(BETA, betaAdmin, betaCompany, List.of(), List.of());
        as(HOST_BETA, member.token()).get(PROBE).then().statusCode(200);

        as(HOST_BETA, betaAdmin).body(Map.of("active", false)).patch("/users/" + member.publicId())
                .then().statusCode(200);

        assertRevoked(HOST_BETA, member.token());
        // o usuario desativado nao entra de novo
        assertTrue(loginResponse(HOST_BETA, member.email(), PASSWORD).statusCode() >= 400);
        // o admin do mesmo tenant e o admin do OUTRO tenant seguem valendo
        as(HOST_BETA, betaAdmin).get(PROBE).then().statusCode(200);
        as(HOST_ALFA, alfaAdmin).get(PROBE).then().statusCode(200);
    }

    @Test
    void removingTheMembershipRevokesTheOldToken() throws Exception {
        Member member = newMember(ALFA, alfaAdmin, alfaCompany, List.of(), List.of());
        as(HOST_ALFA, member.token()).get(PROBE).then().statusCode(200);

        int status = as(HOST_ALFA, alfaAdmin).delete("/users/" + member.publicId() + "/memberships/" + alfaCompany)
                .statusCode();
        assertTrue(status < 300, "remover vinculo respondeu " + status);

        assertRevoked(HOST_ALFA, member.token());
        as(HOST_ALFA, alfaAdmin).get(PROBE).then().statusCode(200);
    }

    @Test
    void userChangingTheOwnPasswordRevokesTheOldTokenAndTheNewLoginWorks() throws Exception {
        Member member = newMember(ALFA, alfaAdmin, alfaCompany, List.of(), List.of());

        as(HOST_ALFA, member.token()).body(Map.of("currentPassword", PASSWORD, "newPassword", "Nova@Senha859"))
                .put("/users/change-password").then().statusCode(200);

        assertRevoked(HOST_ALFA, member.token());
        assertTrue(loginResponse(HOST_ALFA, member.email(), PASSWORD).statusCode() >= 400, "a senha antiga nao vale mais");
        pauseForIatResolution(); // o iat do JWT tem resolucao de segundo
        String fresh = login(HOST_ALFA, member.email(), "Nova@Senha859");
        as(HOST_ALFA, fresh).get(PROBE).then().statusCode(200);
    }

    @Test
    void adminResettingAUserPasswordRevokesThatUsersToken() throws Exception {
        Member member = newMember(BETA, betaAdmin, betaCompany, List.of(), List.of());

        as(HOST_BETA, betaAdmin).body(Map.of("password", "Outra@Senha859", "changePasswordRequired", false))
                .patch("/users/" + member.publicId()).then().statusCode(200);

        assertRevoked(HOST_BETA, member.token());
        pauseForIatResolution();
        as(HOST_BETA, login(HOST_BETA, member.email(), "Outra@Senha859")).get(PROBE).then().statusCode(200);
    }

    @Test
    void inactivatingTheCompanyRevokesTheTokensOfItsMembersAndReactivatingLetsThemBackIn() throws Exception {
        String branch = createCompany(BETA, betaAdmin, cnpj(31), "filial sessao");
        Member member = newMember(BETA, betaAdmin, branch, List.of(), List.of());
        as(HOST_BETA, member.token()).get(PROBE).then().statusCode(200);

        as(HOST_BETA, betaAdmin).body(Map.of("active", false)).patch("/companies/" + branch).then().statusCode(200);

        assertRevoked(HOST_BETA, member.token());
        // novo login: ou e' recusado, ou entra SEM a empresa inativa como corrente (login sem empresa)
        io.restassured.response.Response relogin = loginResponse(HOST_BETA, member.email(), PASSWORD);
        if (relogin.statusCode() == 200) {
            org.junit.jupiter.api.Assertions.assertNotEquals(branch, relogin.jsonPath().getString("currentCompany.publicId"),
                    "a empresa inativa nao pode ser a empresa corrente: " + relogin.body().asString());
        }
        // a empresa principal do tenant segue de pe
        as(HOST_BETA, betaAdmin).get(PROBE).then().statusCode(200);

        as(HOST_BETA, betaAdmin).body(Map.of("active", true)).patch("/companies/" + branch).then().statusCode(200);
        pauseForIatResolution();
        as(HOST_BETA, login(HOST_BETA, member.email(), PASSWORD)).get(PROBE).then().statusCode(200);
    }

    @Test
    void editingOnlyTheNameDoesNotRevokeTheSession() throws Exception {
        Member member = newMember(ALFA, alfaAdmin, alfaCompany, List.of(), List.of());
        as(HOST_ALFA, alfaAdmin).body(Map.of("name", "Membro Renomeado")).patch("/users/" + member.publicId())
                .then().statusCode(200);
        // editar o nome nao revoga (so' corte de acesso revoga)
        as(HOST_ALFA, member.token()).get(PROBE).then().statusCode(200);
        assertEquals(200, loginResponse(HOST_ALFA, member.email(), PASSWORD).statusCode());
    }

    private static void assertRevoked(String host, String token) {
        as(host, token).get(PROBE).then().statusCode(401)
                .contentType(containsString("application/problem+json"))
                .body("code", equalTo("SESSION_REVOKED"));
    }
}
