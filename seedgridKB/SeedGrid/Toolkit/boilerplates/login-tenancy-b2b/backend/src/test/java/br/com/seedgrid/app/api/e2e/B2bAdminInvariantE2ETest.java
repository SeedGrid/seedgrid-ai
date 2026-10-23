package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E da invariante "toda empresa mantem pelo menos 1 ADMIN ativo" (por EMPRESA, nao por banco): a plataforma nao
 * consegue desativar, desvincular nem excluir o ultimo ADMIN de uma empresa, mesmo que outra empresa tenha varios; com
 * um segundo ADMIN a troca (sucessao) funciona; e o ADMIN de outra empresa nao conta.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bAdminInvariantE2ETest extends E2eBase {

    private static final String PROTECTED = "LAST_ADMIN_PROTECTED";

    @Test
    void theOnlyAdminOfACompanyCannotBeDeactivatedUnlinkedOrDeleted() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        // a B tem varios ADMIN: nao ajuda a A
        addMember(b.session(), uniqueEmail("b2"), List.of(roleId(b.session(), "ADMIN")));
        addMember(b.session(), uniqueEmail("b3"), List.of(roleId(b.session(), "ADMIN")));

        Session platform = platformAdmin();
        String adminA = a.session().publicId();

        Response deactivate = json(platform.token()).body(Map.of("active", false)).patch("/users/" + adminA);
        assertEquals(409, deactivate.statusCode(), deactivate.asString());
        assertEquals(PROTECTED, deactivate.jsonPath().getString("code"), deactivate.asString());

        Response unlink = json(platform.token()).delete("/users/" + adminA + "/memberships/" + a.companyPublicId());
        assertEquals(409, unlink.statusCode(), unlink.asString());
        assertEquals(PROTECTED, unlink.jsonPath().getString("code"), unlink.asString());

        Response delete = json(platform.token()).delete("/users/" + adminA);
        assertEquals(409, delete.statusCode(), delete.asString());
        assertEquals(PROTECTED, delete.jsonPath().getString("code"), delete.asString());

        // nada mudou: o ADMIN da A continua ativo e logando
        json(a.session().token()).get("/me/permissions").then().statusCode(200).body("active", equalTo(true));
    }

    @Test
    void takingTheAdminRoleAwayFromTheOnlyAdminIsRefusedToo() {
        Account a = newCompanyAccount("Alfa");
        Session platform = platformAdmin();
        // um perfil sem poder administrativo
        String readOnlyRole = expect(json(a.session().token()).body(Map.of("name", "LEITOR",
                "description", "So le", "permissionPublicIds", List.of(permissionId(a.session(), "BUSINESS_DAY_READ"))))
                .post("/me/security/roles"), 201).jsonPath().getString("publicId");

        // o perfil efetivo na empresa e' o do VINCULO: trocar o ADMIN do vinculo zeraria os ADMIN da empresa
        Response r = json(platform.token()).body(Map.of("rolePublicIds", List.of(readOnlyRole)))
                .put("/users/" + a.session().publicId() + "/memberships/" + a.companyPublicId());
        assertEquals(409, r.statusCode(), r.asString());
        assertEquals(PROTECTED, r.jsonPath().getString("code"), r.asString());
    }

    @Test
    void successionWorksAdminCanLeaveOnlyAfterAnotherAdminExists() {
        Account a = newCompanyAccount("Alfa");
        String successorEmail = uniqueEmail("sucessor");
        String successor = addMember(a.session(), successorEmail, List.of(roleId(a.session(), "ADMIN")));
        activateMember(successorEmail);
        Session platform = platformAdmin();

        // agora ha dois ADMIN: o primeiro pode sair
        json(platform.token()).body(Map.of("active", false)).patch("/users/" + a.session().publicId())
                .then().statusCode(200);
        // ... mas o sucessor passa a ser o ultimo
        Response last = json(platform.token()).body(Map.of("active", false)).patch("/users/" + successor);
        assertEquals(409, last.statusCode(), last.asString());
        assertEquals(PROTECTED, last.jsonPath().getString("code"), last.asString());

        // o sucessor segue operando a conta
        Session s = login(successorEmail, MEMBER_PASSWORD);
        json(s.token()).get("/me/security/users").then().statusCode(200);
    }

    @Test
    void anAccountAdminCannotRemoveTheRootAdminOfItsOwnCompany() {
        Account a = newCompanyAccount("Alfa");
        String secondEmail = uniqueEmail("segundo");
        addMember(a.session(), secondEmail, List.of(roleId(a.session(), "ADMIN")));
        Session second = activateMember(secondEmail);

        // o titular (root) nao e' removido; desativar/trocar perfis dele e' ignorado (a resposta e' 200 mas nada muda)
        int delete = json(second.token()).delete("/me/security/users/" + a.session().publicId()).statusCode();
        org.junit.jupiter.api.Assertions.assertTrue(delete >= 400 && delete < 500, "excluir o root: " + delete);
        String leitor = expect(json(a.session().token()).body(Map.of("name", "LEITOR", "description", "So le",
                "permissionPublicIds", List.of(permissionId(a.session(), "BUSINESS_DAY_READ"))))
                .post("/me/security/roles"), 201).jsonPath().getString("publicId");
        json(second.token()).body(Map.of("email", a.email(), "name", "Ana Silva", "active", false,
                "rolePublicIds", List.of(leitor))).put("/me/security/users/" + a.session().publicId());

        json(second.token()).get("/me/security/users/" + a.session().publicId()).then().statusCode(200)
                .body("active", equalTo(true)).body("isRoot", equalTo(true)).body("roles.name", hasItem("ADMIN"));
        // e o titular continua logando e administrando
        Session root = login(a.email(), PASSWORD);
        json(root.token()).get("/me/security/users").then().statusCode(200);
    }
}
