package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.GAMA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * TE.1 - estado de acesso da empresa ({@code ACTIVE}/{@code READ_ONLY}/{@code DISABLED}) por HTTP: escrita em somente
 * leitura responde 403 {@code COMPANY_READ_ONLY} (leitura, {@code QUERY} e {@code @SgReadOnlySafe} passam), desligada nao
 * loga e derruba as sessoes, a API key obedece a empresa dela, a conta nunca fica toda desligada e so' quem tem a
 * permissao muda o estado. A empresa B do mesmo tenant segue ativa o tempo todo (o estado e' por empresa).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class CompanyAccessE2eTest extends E2eBase {

    static final String HOST = host(GAMA);

    String admin;
    String companyA;
    String companyB;

    @BeforeAll
    void tenant() throws Exception {
        ensureTenant(GAMA);
        admin = adminToken(GAMA);
        companyA = firstCompanyPublicId(HOST, admin);
        companyB = createCompany(GAMA, admin, cnpj(61), "filial gama");
    }

    /** Mudar o estado de uma empresa grava o marcador de sessao: cada teste comeca com um token emitido depois dele. */
    @BeforeEach
    void freshAdminSession() {
        pauseForIatResolution();
        admin = adminToken(GAMA);
    }

    @AfterEach
    void everythingBackToActive() {
        setMode(GAMA, companyA, "ACTIVE");
        setMode(GAMA, companyB, "ACTIVE");
    }

    private String readerRoleId() {
        try {
            return globalRoleId(GAMA, "E2E_LEITOR");
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    /** Membro comum so' da empresa A (E2E_LEITOR tem PROBE_READ: alcanca a sonda). */
    private Member memberOfA() throws Exception {
        return newMember(GAMA, admin, companyA, List.of(), List.of());
    }

    // ------------------------------------------------------------------ READ_ONLY

    @Test
    void writesInReadOnlyAre403WithTheStableCodeAndReadsQueryAndSafeMethodsPass() throws Exception {
        Member member = memberOfA();
        setMode(GAMA, companyA, "READ_ONLY");
        pauseForIatResolution();
        String token = login(HOST, member.email(), PASSWORD);

        for (String method : List.of("POST", "PUT", "DELETE")) {
            as(HOST, token).request(method, "/probe/write").then().statusCode(403)
                    .contentType(containsString("application/problem+json"))
                    .body("code", equalTo("COMPANY_READ_ONLY"))
                    .body("companyPublicId", equalTo(companyA));
        }
        as(HOST, token).get("/probe/permission").then().statusCode(200);
        as(HOST, token).body(Map.of("q", "x")).request("QUERY", "/probe/search").then().statusCode(200)
                .body("method", equalTo("QUERY")).body("echo.q", equalTo("x"));
        as(HOST, token).post("/probe/safe").then().statusCode(200);
        as(HOST, token).get("/me/companies").then().statusCode(200)
                .body("find { it.publicId == '" + companyA + "' }.accessMode", equalTo("READ_ONLY"));
        // o admin (A e B) ve os dois estados no seletor
        as(HOST, admin).get("/me/companies").then().statusCode(200)
                .body("find { it.publicId == '" + companyB + "' }.accessMode", equalTo("ACTIVE"));
    }

    /**
     * Decisao do dono: os controllers de ADMINISTRACAO da security ({@code /users}, {@code /roles}, {@code /companies},
     * {@code /permissions}) sao {@code @SgMonoCompany}, mas respeitam o estado da empresa CORRENTE do token
     * ({@code @SgReadOnlyEnforced}): em somente leitura a escrita responde 403 {@code COMPANY_READ_ONLY}; leitura e a
     * troca de empresa seguem livres.
     */
    @Test
    void adminResourcesOfTheExtensionAreRefusedInReadOnlyWhileReadsStayOk() {
        setMode(GAMA, companyA, "READ_ONLY"); // grava o marcador de sessao: o token novo ja vem com o estado
        pauseForIatResolution();
        admin = adminToken(GAMA);
        String inA = selectCompany(HOST, admin, companyA);

        as(HOST, inA).get("/users").then().statusCode(200);
        // negocio (tem empresa corrente): barrado
        as(HOST, inA).post("/probe/write").then().statusCode(403).body("code", equalTo("COMPANY_READ_ONLY"));
        // administracao (@SgMonoCompany + @SgReadOnlyEnforced): tambem barrada
        Response create = as(HOST, inA).body(Map.of("email", "livre-" + UUID.randomUUID().toString().substring(0, 6)
                + "@gama.test", "name", "Usuario Criado", "whatsApp", "11999997777", "password", PASSWORD,
                "emailPreConfirmed", true, "changePasswordRequired", false, "rolePublicIds", List.of(readerRoleId()),
                "memberships", List.of(Map.of("companyPublicId", companyA, "rolePublicIds", List.of()))))
                .post("/users");
        assertEquals(403, create.statusCode(), "POST /users em somente leitura: " + create.body().asString());
        assertEquals("COMPANY_READ_ONLY", create.jsonPath().getString("code"));
        as(HOST, inA).body(Map.of("tradeName", "Gama Renomeada")).patch("/companies/" + companyA)
                .then().statusCode(403).body("code", equalTo("COMPANY_READ_ONLY"));
        // trocar de empresa segue livre (e' como o cliente sai da leitura) e a B, ativa, escreve no mesmo tenant
        String inB = selectCompany(HOST, inA, companyB);
        as(HOST, inB).post("/probe/write").then().statusCode(200);
    }

    @Test
    void loginAndRefreshReturnTheAccessModeOfTheCurrentCompany() throws Exception {
        Member member = memberOfA();
        Response active = loginResponse(HOST, member.email(), PASSWORD);
        assertEquals("ACTIVE", active.jsonPath().getString("currentCompany.accessMode"));

        setMode(GAMA, companyA, "READ_ONLY");
        pauseForIatResolution();
        Response readOnly = loginResponse(HOST, member.email(), PASSWORD);
        assertEquals("READ_ONLY", readOnly.jsonPath().getString("currentCompany.accessMode"));
        assertEquals(companyA, readOnly.jsonPath().getString("currentCompany.publicId"));
        given().header("Host", HOST).contentType("application/json")
                .body(Map.of("refreshToken", readOnly.jsonPath().getString("refreshToken")))
                .post("/public/auth/refresh").then().statusCode(200)
                .body("currentCompany.accessMode", equalTo("READ_ONLY"));
    }

    // ------------------------------------------------------------------ API key

    @Test
    void anApiKeyObeysTheStateOfItsCompany() {
        String inA = selectCompany(HOST, admin, companyA);
        Response created = as(HOST, inA).body(Map.of("name", "k-" + UUID.randomUUID(), "expiresDays", 30))
                .post("/apikeys/role/PROBE_ROLE");
        assertEquals(201, created.statusCode(), created.body().asString());
        String key = created.jsonPath().getString("apiKey");
        assertNotNull(key);

        given().header("Host", HOST).header("x-api-key", key).post("/probe/write").then().statusCode(200);

        setMode(GAMA, companyA, "READ_ONLY");
        given().header("Host", HOST).header("x-api-key", key).post("/probe/write").then().statusCode(403)
                .body("code", equalTo("COMPANY_READ_ONLY")).body("companyPublicId", equalTo(companyA));
        given().header("Host", HOST).header("x-api-key", key).get("/probe/permission").then().statusCode(200);
        given().header("Host", HOST).header("x-api-key", key).post("/probe/safe").then().statusCode(200);

        setMode(GAMA, companyA, "DISABLED");
        given().header("Host", HOST).header("x-api-key", key).get("/probe/permission").then().statusCode(403)
                .body("code", equalTo("COMPANY_DISABLED"));
    }

    // ------------------------------------------------------------------ DISABLED

    @Test
    void disabledCompanyCannotLoginOrBeSelectedAndOldSessionsFallWithSessionRevoked() throws Exception {
        Member onlyA = memberOfA();
        String adminInA = selectCompany(HOST, admin, companyA);
        as(HOST, onlyA.token()).get("/probe/me").then().statusCode(200);

        setMode(GAMA, companyA, "DISABLED");

        // sessoes antigas caem pelo marcador
        for (String old : List.of(onlyA.token(), adminInA)) {
            as(HOST, old).get("/probe/me").then().statusCode(401).body("code", equalTo("SESSION_REVOKED"));
        }
        // quem so tem a empresa desligada nao entra
        loginResponse(HOST, onlyA.email(), PASSWORD).then().statusCode(403).body("code", equalTo("COMPANY_DISABLED"))
                .body("companyPublicId", equalTo(companyA));

        // o admin tem tambem a B: entra, nao seleciona a A e o seletor a marca
        pauseForIatResolution();
        Response relogin = loginResponse(HOST, adminEmail(GAMA), PASSWORD);
        assertEquals(200, relogin.statusCode(), relogin.body().asString());
        assertEquals(companyB, relogin.jsonPath().getString("currentCompany.publicId"));
        String adminToken = relogin.jsonPath().getString("token");
        as(HOST, adminToken).body(Map.of("companyPublicId", companyA)).post("/me/select-company")
                .then().statusCode(403).body("code", equalTo("COMPANY_DISABLED"));
        as(HOST, adminToken).get("/me/companies").then().statusCode(200)
                .body("find { it.publicId == '" + companyA + "' }.accessMode", equalTo("DISABLED"))
                .body("find { it.publicId == '" + companyB + "' }.accessMode", equalTo("ACTIVE"));

        // de volta a ACTIVE: login e escrita voltam
        setMode(GAMA, companyA, "ACTIVE");
        pauseForIatResolution();
        String back = login(HOST, onlyA.email(), PASSWORD);
        as(HOST, back).post("/probe/write").then().statusCode(200);
    }

    @Test
    void theAccountNeverEndsWithEveryCompanyDisabled() {
        setMode(GAMA, companyA, "DISABLED"); // B segue ativa: passa
        Response last = given().header("Host", HOST).post("/probe/public/access-mode/" + companyB + "/DISABLED");
        assertEquals(409, last.statusCode(), last.body().asString());
        assertEquals("COMPANY_ACCESS_ALL_DISABLED", last.jsonPath().getString("code"), last.body().asString());
        // somente leitura da ultima e' permitido (o responsavel segue lendo e consegue pagar)
        setMode(GAMA, companyB, "READ_ONLY");
    }

    // ------------------------------------------------------------------ permissao e protecao

    @Test
    void theTenantCannotChangeTheStateOfItsCompaniesOnlyThePlatformCan() throws Exception {
        // o ADMIN do tenant NAO tem COMPANY_ACCESS_MODE_UPDATE (so' a plataforma/billing mudam o estado)
        as(HOST, admin).body(Map.of("mode", "READ_ONLY")).put("/companies/" + companyB + "/access-mode")
                .then().statusCode(403);
        assertEquals("ACTIVE", text(db(GAMA), "SELECT access_mode FROM sg_companies WHERE public_id = '" + companyB + "'"));

        // a permissao e' de audiencia "platform": mesmo um perfil do tenant que a receba (por SQL; o ADMIN nem consegue
        // delegar, ROLE_NOT_DELEGABLE) fica sem ela, porque o plano do tenant so' libera permissoes "client"
        assertEquals("platform", text(db(GAMA), "SELECT audience FROM sg_permissions WHERE name = 'COMPANY_ACCESS_MODE_UPDATE'"));
        exec(db(GAMA), "INSERT INTO sg_roles (name, description, public_id, for_integration) VALUES ('E2E_ACESSO', 'muda estado', '"
                + UUID.randomUUID() + "', FALSE) ON CONFLICT DO NOTHING");
        exec(db(GAMA), "INSERT INTO sg_role_permissions (role_id, permission_id) SELECT r.id, p.id FROM sg_roles r, sg_permissions p "
                + "WHERE r.name = 'E2E_ACESSO' AND r.company_id IS NULL AND p.name = 'COMPANY_ACCESS_MODE_UPDATE' ON CONFLICT DO NOTHING");
        Member holder = newMember(GAMA, admin, companyA, List.of(), List.of());
        exec(db(GAMA), "INSERT INTO sg_user_roles (user_id, role_id) SELECT u.id, r.id FROM sg_users u, sg_roles r "
                + "WHERE u.public_id = '" + holder.publicId() + "' AND r.name = 'E2E_ACESSO' AND r.company_id IS NULL");
        String holderToken = login(HOST, holder.email(), PASSWORD);
        as(HOST, holderToken).body(Map.of("mode", "READ_ONLY", "reason", "plano"))
                .put("/companies/" + companyB + "/access-mode").then().statusCode(403);
        assertEquals("ACTIVE", text(db(GAMA), "SELECT access_mode FROM sg_companies WHERE public_id = '" + companyB + "'"));
    }

    // ------------------------------------------------------------------ QUERY

    @Test
    void queryMethodCarriesABodyIsSafeAndTheOtherMethodsOnTheSamePathAreNotAllowed() throws Exception {
        Member member = memberOfA();
        // QUERY com corpo responde 200 e devolve o filtro
        as(HOST, member.token()).body(Map.of("name", "alfa", "limit", 5)).request("QUERY", "/probe/search")
                .then().statusCode(200).body("method", equalTo("QUERY")).body("echo.name", equalTo("alfa"))
                .body("echo.limit", equalTo(5));
        // GET e POST no mesmo caminho nao respondem como a consulta
        as(HOST, member.token()).get("/probe/search").then().statusCode(405);
        as(HOST, member.token()).body(Map.of()).post("/probe/search").then().statusCode(405);
        // continua autenticado e com permissao
        anon(HOST).body(Map.of()).request("QUERY", "/probe/search").then().statusCode(401);
        // e o OpenAPI continua sendo gerado com um endpoint QUERY presente
        given().header("Host", HOST).get("/q/openapi").then().statusCode(200);
    }
}
