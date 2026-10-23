package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
 * TE.1 - cadastro de usuario com empresas e perfis por empresa (memberships), {@code @SgPlatformScope} isento no tenant
 * (o ADMIN de um tenant com 2+ empresas administra o proprio tenant) e termos de uso (versao vigente, aceite, reaceite).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class UsersCompaniesAndTermsE2eTest extends E2eBase {

    String sub;
    String host;
    String admin;
    String companyA;
    String companyB;
    String readerRole;
    String managerRole;

    @BeforeAll
    void tenant() throws Exception {
        sub = freshTenant("usrco");
        host = host(sub);
        admin = adminToken(sub);
        companyA = firstCompanyPublicId(host, admin);
        companyB = createCompany(sub, admin, cnpj(95), "filial usuarios");
        readerRole = globalRoleId(sub, "E2E_LEITOR");
        exec(db(sub), "INSERT INTO roles (name, description, public_id, for_integration) VALUES ('E2E_GESTOR', 'gestor de teste', '"
                + UUID.randomUUID() + "', FALSE) ON CONFLICT DO NOTHING");
        exec(db(sub), "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'E2E_GESTOR' AND r.company_id IS NULL AND p.name IN ('USER_READ', 'PROBE_READ') ON CONFLICT DO NOTHING");
        managerRole = globalRoleId(sub, "E2E_GESTOR");
    }

    // ------------------------------------------------------------------ cadastro de usuario com empresas

    @Test
    void userIsRegisteredWithTwoCompaniesAndADifferentProfilePerCompany() {
        String email = "dois-" + UUID.randomUUID().toString().substring(0, 6) + "@usrco.test";
        Response created = as(host, admin).body(Map.of("email", email, "name", "Usuario Duas Empresas",
                "whatsApp", "11999997777", "password", PASSWORD, "emailPreConfirmed", true, "changePasswordRequired", false,
                "sendWelcomeEmail", false, "rolePublicIds", List.of(readerRole),
                "memberships", List.of(
                        Map.of("companyPublicId", companyA, "rolePublicIds", List.of()),
                        Map.of("companyPublicId", companyB, "rolePublicIds", List.of(managerRole)))))
                .post("/users");
        assertEquals(201, created.statusCode(), created.body().asString());
        String publicId = created.jsonPath().getString("publicId");

        // GET /users/{id} devolve as empresas e os perfis de cada vinculo
        as(host, admin).get("/users/" + publicId).then().statusCode(200)
                .body("memberships", hasSize(2))
                .body("memberships.companyPublicId", containsInAnyOrder(companyA, companyB))
                .body("memberships.find { it.companyPublicId == '" + companyB + "' }.roles.name", hasItem("E2E_GESTOR"))
                .body("memberships.find { it.companyPublicId == '" + companyA + "' }.active", equalTo(true));

        // o proprio usuario enxerga as duas empresas e o perfil muda conforme a empresa corrente
        String token = login(host, email, PASSWORD);
        as(host, token).get("/me/companies").then().statusCode(200)
                .body("publicId", containsInAnyOrder(companyA, companyB));
        String inA = selectCompany(host, token, companyA);
        String inB = selectCompany(host, token, companyB);
        as(host, inA).get("/users").then().statusCode(403); // em A so' tem o perfil comum (sem USER_READ)
        as(host, inB).get("/users").then().statusCode(200); // em B o perfil do vinculo concede USER_READ
    }

    @Test
    void registrationIsRefusedForUnknownCompanyDuplicateEmailAndMissingProfile() {
        Map<String, Object> base = Map.of("name", "Usuario Invalido", "whatsApp", "11999997777", "password", PASSWORD,
                "emailPreConfirmed", true, "changePasswordRequired", false, "rolePublicIds", List.of(readerRole));
        // empresa que nao e' deste tenant (nem existe aqui)
        Response unknownCompany = as(host, admin).body(merge(base, "email", "x1-" + UUID.randomUUID() + "@usrco.test",
                "memberships", List.of(Map.of("companyPublicId", UUID.randomUUID().toString(), "rolePublicIds", List.of()))))
                .post("/users");
        assertTrue(unknownCompany.statusCode() >= 400 && unknownCompany.statusCode() < 500,
                "empresa desconhecida respondeu " + unknownCompany.statusCode() + " " + unknownCompany.body().asString());
        // e-mail ja cadastrado
        Response duplicate = as(host, admin).body(merge(base, "email", adminEmail(sub),
                "memberships", List.of(Map.of("companyPublicId", companyA, "rolePublicIds", List.of()))))
                .post("/users");
        assertEquals(409, duplicate.statusCode(), duplicate.body().asString());
        // sem nenhum perfil
        Response noRole = as(host, admin).body(merge(base, "email", "x2-" + UUID.randomUUID() + "@usrco.test",
                "rolePublicIds", List.of(), "memberships", List.of(Map.of("companyPublicId", companyA, "rolePublicIds", List.of()))))
                .post("/users");
        assertEquals(422, noRole.statusCode(), noRole.body().asString());
    }

    @Test
    void aUserOfAnotherTenantIsNeitherVisibleNorEditableHere() throws Exception {
        ensureTenant(ALFA);
        String alfaAdmin = adminToken(ALFA);
        String alfaAdminId = text(db(ALFA), "SELECT public_id FROM users WHERE email = '" + adminEmail(ALFA) + "'");
        as(host, admin).get("/users/" + alfaAdminId).then().statusCode(404);
        as(host, admin).body(Map.of("name", "Invasor Do Outro")).patch("/users/" + alfaAdminId).then().statusCode(404);
        // e o mesmo e-mail pode existir nos dois tenants (os bancos sao separados)
        Response same = as(host(ALFA), alfaAdmin).get("/users");
        assertEquals(200, same.statusCode());
    }

    // ------------------------------------------------------------------ @SgPlatformScope isento no tenant

    @Test
    void tenantAdminWithTwoCompaniesStillAdministersTheTenantBecauseThePlatformScopeIsExempt() {
        // o tenant tem 2 empresas (A e B): a trava de plataforma (pensada para banco compartilhado) nao se aplica
        for (String path : List.of("/users", "/roles", "/companies", "/permissions")) {
            assertEquals(200, as(host, admin).get(path).statusCode(), "GET " + path + " com 2 empresas no tenant");
        }
        // vale so' a permissao do endpoint: quem nao tem USER_READ continua levando 403 (isento nao e' liberado)
        as(host, admin).get("/me/companies").then().statusCode(200);
        Member plain = memberWithoutAdminPermissions();
        as(host, plain.token()).get("/users").then().statusCode(403);
        as(host, plain.token()).get("/companies").then().statusCode(403);
    }

    private Member memberWithoutAdminPermissions() {
        try {
            return newMember(sub, admin, companyA, List.of(readerRole), List.of());
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    // ------------------------------------------------------------------ termos

    @Test
    void currentTermsArePublicAndTheLoginAsksForAcceptanceUntilTheCurrentVersionIsAccepted() throws Exception {
        // publico, sem token e em qualquer Host
        anon(host).get("/public/terms").then().statusCode(200)
                .body("required", equalTo(true)).body("version", equalTo("2026-10"))
                .body("documents.terms", equalTo("https://example.test/termos"))
                .body("documents.privacy", equalTo("https://example.test/privacidade"));

        Member member = newMember(sub, admin, companyA, List.of(readerRole), List.of());
        Response login = loginResponse(host, member.email(), PASSWORD);
        assertEquals(true, login.jsonPath().getBoolean("termsAcceptanceRequired"), login.body().asString());

        // versao errada e' recusada; a vigente e' aceita (idempotente) e o login deixa de pedir
        String token = login.jsonPath().getString("token");
        int wrong = as(host, token).body(Map.of("version", "1999-01")).post("/me/terms/accept").statusCode();
        assertTrue(wrong >= 400 && wrong < 500, "versao antiga respondeu " + wrong);
        as(host, token).body(Map.of("version", "2026-10")).post("/me/terms/accept").then().statusCode(204);
        as(host, token).body(Map.of("version", "2026-10")).post("/me/terms/accept").then().statusCode(204);
        assertEquals("1", text(db(sub), "SELECT count(*) FROM terms_acceptance ta JOIN users u ON u.id = ta.user_id "
                + "WHERE u.public_id = '" + member.publicId() + "' AND ta.terms_version = '2026-10'"));
        Response again = loginResponse(host, member.email(), PASSWORD);
        assertTrue(again.jsonPath().getObject("termsAcceptanceRequired", Boolean.class) == null
                || !again.jsonPath().getBoolean("termsAcceptanceRequired"), again.body().asString());

        // o aceite e' do usuario DESTE tenant: outro usuario (mesmo tenant) continua pendente
        Member other = newMember(sub, admin, companyA, List.of(readerRole), List.of());
        assertEquals(true, loginResponse(host, other.email(), PASSWORD).jsonPath().getBoolean("termsAcceptanceRequired"));
        // sem token nao aceita
        anon(host).body(Map.of("version", "2026-10")).post("/me/terms/accept").then().statusCode(401);
        as(host, admin).get("/users/" + member.publicId()).then().statusCode(200).body("email", not(equalTo(null)));
    }

    private static Map<String, Object> merge(Map<String, Object> base, Object... overrides) {
        Map<String, Object> m = new java.util.HashMap<>(base);
        for (int i = 0; i < overrides.length; i += 2) {
            m.put((String) overrides[i], overrides[i + 1]);
        }
        return m;
    }
}
