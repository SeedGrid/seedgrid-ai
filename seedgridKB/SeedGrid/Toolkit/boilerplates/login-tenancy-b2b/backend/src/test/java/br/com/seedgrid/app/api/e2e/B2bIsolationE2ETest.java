package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E de isolamento entre DUAS contas (empresas) no b2b, tudo por HTTP: quem esta logado na conta A nunca le nem altera
 * dados da B (usuarios, perfis, chaves de API, calendario); uma chave de API vale so para a empresa que a criou; e a
 * edicao de um perfil global vale na hora para as contas (sem esperar o cache de RBAC).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bIsolationE2ETest extends E2eBase {

    private static String letters(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append((char) ('A' + ThreadLocalRandom.current().nextInt(26)));
        }
        return sb.toString();
    }

    @Test
    void eachAccountSeesOnlyItsOwnCompanyAndMembers() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        String memberOfB = uniqueEmail("membro-b");
        addMember(b.session(), memberOfB, List.of(roleId(b.session(), "ADMIN")));

        json(a.session().token()).get("/me/companies").then().statusCode(200)
                .body("$", hasSize(1)).body("[0].publicId", equalTo(a.companyPublicId()));
        json(a.session().token()).get("/me/security/users").then().statusCode(200)
                .body("items.email", hasItem(a.email()))
                .body("items.email", not(hasItem(b.email())))
                .body("items.email", not(hasItem(memberOfB)));
        json(b.session().token()).get("/me/security/users").then().statusCode(200)
                .body("items.email", hasItem(memberOfB)).body("items.email", not(hasItem(a.email())));

        // por id: o usuario da B nao existe para a A (404, nao 403: nem a existencia vaza)
        String bUser = b.session().publicId();
        json(a.session().token()).get("/me/security/users/" + bUser).then().statusCode(404);
        json(a.session().token()).body(Map.of("email", b.email(), "name", "Invasor Total", "rolePublicIds",
                List.of(roleId(a.session(), "ADMIN")))).put("/me/security/users/" + bUser).then().statusCode(404);
        json(a.session().token()).delete("/me/security/users/" + bUser).then().statusCode(404);
        // e o usuario da B continua inteiro
        json(b.session().token()).get("/me/security/users/" + bUser).then().statusCode(200)
                .body("email", equalTo(b.email())).body("active", equalTo(true));
    }

    @Test
    void aTokenCannotSelectOrBorrowTheOtherCompany() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");

        int select = json(a.session().token()).body(Map.of("companyPublicId", b.companyPublicId()))
                .post("/me/select-company").statusCode();
        assertTrue(select == 403 || select == 404, "select-company de empresa alheia: " + select);

        // o cabecalho legado X-Company-Id nao redireciona um token ja escopado para a outra empresa
        Number bCompanyId = (Number) claim(b.session().token(), "companyId");
        assertNotNull(bCompanyId);
        Response r = json(a.session().token()).header("X-Company-Id", bCompanyId.toString())
                .get("/me/security/users");
        assertTrue(r.statusCode() == 200 || r.statusCode() == 403, "status " + r.statusCode());
        assertFalse(r.asString().contains(b.email()), "o cabecalho nao pode trazer dados da B");
    }

    @Test
    void accountRolesAreInvisibleAndUntouchableByTheOtherAccount() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        String roleName = "PERFIL" + letters(8);
        String readUsers = permissionId(a.session(), "USER_READ");
        String created = expect(json(a.session().token()).body(Map.of("name", roleName,
                "description", "Perfil so da conta A", "permissionPublicIds", List.of(readUsers)))
                .post("/me/security/roles"), 201).jsonPath().getString("publicId");

        json(a.session().token()).get("/me/security/roles").then().body("items.name", hasItem(roleName));
        json(b.session().token()).get("/me/security/roles").then().statusCode(200)
                .body("items.name", not(hasItem(roleName)));
        json(b.session().token()).get("/me/security/roles/" + created).then().statusCode(404);
        json(b.session().token()).body(Map.of("name", roleName, "description", "invadido",
                "permissionPublicIds", List.of(readUsers))).put("/me/security/roles/" + created).then().statusCode(404);
        json(b.session().token()).delete("/me/security/roles/" + created).then().statusCode(404);
        // a B nao consegue usar o perfil da A num membro dela
        Map<String, Object> body = Map.of("email", uniqueEmail("x"), "name", "Maria Souza", "password", PASSWORD,
                "rolePublicIds", List.of(created));
        int status = json(b.session().token()).body(body).post("/me/security/users").statusCode();
        assertTrue(status >= 400 && status < 500, "perfil de outra conta num membro: " + status);
    }

    @Test
    void anApiKeyOnlyWorksForTheCompanyThatCreatedItAndStaysInsideItsRole() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        addMember(b.session(), uniqueEmail("so-da-b"), List.of(roleId(b.session(), "ADMIN")));

        Response keyA = expect(json(a.session().token()).body(Map.of("name", "chave A", "expiresDays", 30))
                .post("/apikeys/role/INTEGRACAO_USUARIOS"), 201);
        String keyAValue = keyA.jsonPath().getString("apiKey");
        String keyAId = keyA.jsonPath().getString("publicId");
        String keyBValue = expect(json(b.session().token()).body(Map.of("name", "chave B", "expiresDays", 30))
                .post("/apikeys/role/INTEGRACAO_USUARIOS"), 201).jsonPath().getString("apiKey");
        assertNotNull(keyAValue);

        // a chave A enxerga so os usuarios da empresa A; a chave B, so os da B
        http().header("x-api-key", keyAValue).get("/me/security/users").then().statusCode(200)
                .body("items.email", hasItem(a.email())).body("items.email", not(hasItem(b.email())));
        http().header("x-api-key", keyBValue).get("/me/security/users").then().statusCode(200)
                .body("items.email", hasItem(b.email())).body("items.email", not(hasItem(a.email())));

        // a introspeccao mostra o perfil e as permissoes da chave: so o do perfil de integracao
        http().header("x-api-key", keyAValue).get("/apikeys/me").then().statusCode(200)
                .body("roleName", equalTo("INTEGRACAO_USUARIOS"))
                .body("permissions", hasItem("USER_READ"))
                .body("permissions", not(hasItem("BUSINESS_DAY_UPDATE")));
        // fora do perfil: nada de calendario, de perfis nem de chaves
        http().header("x-api-key", keyAValue).get("/business-days/calendar?year=2026&month=12").then().statusCode(403);
        http().header("x-api-key", keyAValue).get("/me/security/roles").then().statusCode(403);

        // a B nao ve nem revoga a chave da A
        json(b.session().token()).get("/apikeys").then().statusCode(200)
                .body("publicId", not(hasItem(keyAId)));
        int revokeByB = json(b.session().token()).post("/apikeys/" + keyAId + "/revoke").statusCode();
        assertTrue(revokeByB == 403 || revokeByB == 404, "revogar chave alheia: " + revokeByB);
        http().header("x-api-key", keyAValue).get("/me/security/users").then().statusCode(200);

        // a A revoga a propria: a chave deixa de valer na hora
        json(a.session().token()).post("/apikeys/" + keyAId + "/revoke").then().statusCode(200);
        http().header("x-api-key", keyAValue).get("/me/security/users").then().statusCode(401);
        http().header("x-api-key", keyBValue).get("/me/security/users").then().statusCode(200);
    }

    @Test
    void theBusinessCalendarOfOneCompanyIsInvisibleToTheOther() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        // 2027-01-03 e domingo: so a A "vai trabalhar" neste dia
        String date = "2027-01-03";
        json(a.session().token()).body(Map.of("date", date, "weight", 1, "reason", "Inventario"))
                .post("/business-days/work-overrides").then().statusCode(201);

        json(a.session().token()).get("/business-days/check?date=" + date).then().statusCode(200)
                .body("businessDay", equalTo(true));
        json(b.session().token()).get("/business-days/check?date=" + date).then().statusCode(200)
                .body("businessDay", equalTo(false));
        json(a.session().token()).get("/business-days/work-overrides").then().statusCode(200)
                .body("date", hasItem(date));
        json(b.session().token()).get("/business-days/work-overrides").then().statusCode(200)
                .body("date", not(hasItem(date)));
    }

    @Test
    void editingAGlobalRoleReachesTheAccountsImmediately() {
        Account a = newCompanyAccount("Alfa");
        Session operator = platformAdmin();
        String roleName = "GLOBAL" + letters(8);
        String userRead = permissionId(a.session(), "USER_READ");
        String roleRead = permissionId(a.session(), "ROLE_READ");
        String businessRead = permissionId(a.session(), "BUSINESS_DAY_READ");
        String globalRole = expect(json(operator.token()).body(Map.of("name", roleName,
                "description", "Perfil global de teste", "permissionPublicIds", List.of(userRead, roleRead)))
                .post("/roles"), 201).jsonPath().getString("publicId");

        // o membro nasce ADMIN da conta; a plataforma passa o vinculo dele para o perfil global
        String email = uniqueEmail("membro");
        String memberId = addMember(a.session(), email, List.of(roleId(a.session(), "ADMIN")));
        activateMember(email);
        expect(json(operator.token()).body(Map.of("rolePublicIds", List.of(globalRole)))
                .put("/users/" + memberId + "/memberships/" + a.companyPublicId()), 200);
        afterRevocation();
        Session member = login(email, MEMBER_PASSWORD);
        json(member.token()).get("/me/security/users").then().statusCode(200);

        // a plataforma tira USER_READ do perfil global: a mesma sessao perde o acesso JA na proxima chamada
        expect(json(operator.token()).body(Map.of("permissionPublicIds", List.of(businessRead)))
                .patch("/roles/" + globalRole), 200);
        json(member.token()).get("/me/security/users").then().statusCode(403);
        json(member.token()).get("/business-days/check?date=2026-12-30").then().statusCode(200);

        // e devolver a permissao tambem vale na hora
        expect(json(operator.token()).body(Map.of("permissionPublicIds", List.of(userRead)))
                .patch("/roles/" + globalRole), 200);
        json(member.token()).get("/me/security/users").then().statusCode(200);
    }

    @Test
    void revokingOneUserSessionsDoesNotTouchAnotherUserOrAnotherCompany() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        String email = uniqueEmail("troca");
        addMember(a.session(), email, List.of(roleId(a.session(), "ADMIN")));
        confirmEmail(email);
        Session first = login(email, PASSWORD);
        assertEquals(true, first.raw().get("changePasswordRequired"));

        // a troca de senha derruba as sessoes de quem trocou...
        expect(json(first.token()).body(Map.of("currentPassword", PASSWORD, "newPassword", MEMBER_PASSWORD))
                .put("/users/change-password"), 200);
        Response old = json(first.token()).get("/me/permissions");
        assertEquals(401, old.statusCode(), old.asString());
        assertEquals("SESSION_REVOKED", old.jsonPath().getString("code"));
        // ... e so' dele: o titular da mesma empresa e a outra empresa seguem com a sessao
        json(a.session().token()).get("/me/permissions").then().statusCode(200);
        json(b.session().token()).get("/me/permissions").then().statusCode(200);
        // o refresh token antigo tambem morreu
        int refresh = json().body(Map.of("refreshToken", first.refreshToken())).post("/public/auth/refresh").statusCode();
        assertTrue(refresh == 401 || refresh == 403, "refresh apos troca de senha: " + refresh);
    }
}
