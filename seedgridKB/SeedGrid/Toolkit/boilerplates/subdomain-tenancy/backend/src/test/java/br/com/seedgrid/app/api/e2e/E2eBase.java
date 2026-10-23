package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.HOST_MASTER;
import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.eclipse.microprofile.config.ConfigProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;

import io.quarkus.test.common.http.TestHTTPResource;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

/**
 * Base da bateria E2E do backend do boilerplate: HTTP real na porta real do app (nunca na porta padrao do RestAssured,
 * que pode ser um servidor de dev), Postgres do Testcontainers e tenants criados pelo FLUXO PUBLICO real
 * ({@code POST /public/tenants} + {@code POST /public/tenants/validate-email}), com o codigo lido do master.
 *
 * <p>O estado dos tenants e' estatico e guardado por URL do master: classes de teste que reaproveitam o mesmo app
 * (mesmo perfil) reaproveitam os tenants; se o Quarkus reiniciar com outro container, os tenants nascem de novo.</p>
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class E2eBase {

    private static final Set<String> PROVISIONED = new HashSet<>();
    private static final java.util.concurrent.atomic.AtomicInteger FRESH = new java.util.concurrent.atomic.AtomicInteger();

    @TestHTTPResource
    URL appUrl;

    @BeforeAll
    void bindRestAssuredToTheRealPort() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = appUrl.getPort();
    }

    // ------------------------------------------------------------------ tenants

    /** Cria o tenant (idempotente por container): cadastro publico, codigo do master, validacao, perfis de teste. */
    protected synchronized void ensureTenant(String subdomain) throws Exception {
        String key = cfg("seedgrid.subdomain-tenancy.master.datasource.jdbc.url") + "|" + subdomain;
        if (!PROVISIONED.add(key)) {
            return;
        }
        int n = switch (subdomain) {
            case E2eWorld.ALFA -> 1;
            case E2eWorld.BETA -> 2;
            case E2eWorld.GAMA -> 3;
            case E2eWorld.DELTA -> 4;
            case E2eWorld.EPSILON -> 5;
            default -> 100 + FRESH.incrementAndGet();
        };
        String[] cpfs = { "", "12345678909", "11144477735", "52998224725", "39053344705", "93541134780" };
        // o estado da empresa define o calendario estadual (alfa SP, beta RJ)
        String state = E2eWorld.BETA.equals(subdomain) ? "RJ" : "SP";
        Map<String, Object> body = Map.of(
                "subdomain", subdomain,
                "cnpj", cnpj(n),
                "corporateName", subdomain + " LTDA",
                "tradeName", subdomain + " SA",
                "address", Map.of("street", "Rua Teste", "number", "123", "city", "Cidade Teste", "state", state,
                        "postalCode", "01234567", "district", "Centro", "phone", "1133334444"),
                "legalRepresentative", Map.of("firstName", "Admin", "lastName", subdomain,
                        "cpf", n < cpfs.length ? cpfs[n] : "25345768102", "birthDate", "1990-01-01", "phone", "11999998888",
                        "whatsapp", "11999998888"),
                "rootEmail", adminEmail(subdomain),
                "plainRootPassword", PASSWORD);
        Response signup = given().header("Host", HOST_MASTER).contentType(ContentType.JSON).body(body)
                .post("/public/tenants");
        assertEquals(201, signup.statusCode(), "cadastro do tenant " + subdomain + ": " + signup.body().asString());
        String code = masterText("select t.code from tenant_validation_tokens t join tenants x on x.id = t.tenant_id "
                + "where x.subdomain = '" + subdomain + "' order by t.id desc limit 1");
        assertNotNull(code, "o cadastro deveria gerar o codigo de validacao no master");
        Response validate = given().header("Host", HOST_MASTER).contentType(ContentType.JSON)
                .body(Map.of("subdomain", subdomain, "code", code)).post("/public/tenants/validate-email");
        assertEquals(200, validate.statusCode(), "validar tenant " + subdomain + ": " + validate.body().asString());
        seedProbePermissions(subdomain);
    }

    /**
     * Tenant novo e exclusivo de UM teste (para testes que destroem o estado, como a invariante do ADMIN): subdominio
     * unico, mesmo cadastro publico, mesmos perfis de teste. Devolve o subdominio.
     */
    protected String freshTenant(String prefix) throws Exception {
        String subdomain = prefix + (FRESH.get() + 1);
        ensureTenant(subdomain);
        return subdomain;
    }

    protected static String adminEmail(String subdomain) {
        return "admin@" + subdomain + ".test";
    }

    protected static String db(String subdomain) {
        return "e2e_" + subdomain;
    }

    /** Permissoes/perfil de teste: um alvo por regra (ver {@link E2eProbeResource}); alfa e beta com permissoes DIFERENTES na mesma role ADMIN. */
    private void seedProbePermissions(String subdomain) throws Exception {
        String db = db(subdomain);
        for (String permission : List.of("PROBE_READ", "PROBE_ALFA", "PROBE_BETA")) {
            exec(db, "INSERT INTO permissions (name, description, public_id) VALUES ('" + permission + "', 'probe', '"
                    + UUID.randomUUID() + "') ON CONFLICT DO NOTHING");
        }
        exec(db, "INSERT INTO roles (name, description, public_id, for_integration) VALUES ('PROBE_ROLE', 'probe', '"
                + UUID.randomUUID() + "', TRUE) ON CONFLICT DO NOTHING");
        exec(db, "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'PROBE_ROLE' AND p.name = 'PROBE_READ' ON CONFLICT DO NOTHING");
        // perfil comum (nao e' ADMIN nem de integracao): todo usuario precisa de ao menos uma role
        exec(db, "INSERT INTO roles (name, description, public_id, for_integration) VALUES ('E2E_LEITOR', 'leitor de teste', '"
                + UUID.randomUUID() + "', FALSE) ON CONFLICT DO NOTHING");
        exec(db, "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'E2E_LEITOR' AND r.company_id IS NULL AND p.name = 'PROBE_READ' ON CONFLICT DO NOTHING");
        grantToAdmin(db, "PROBE_READ");
        if (E2eWorld.ALFA.equals(subdomain)) {
            grantToAdmin(db, "PROBE_ALFA");
        }
        if (E2eWorld.BETA.equals(subdomain)) {
            grantToAdmin(db, "PROBE_BETA");
        }
    }

    private void grantToAdmin(String db, String permission) throws Exception {
        exec(db, "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'ADMIN' AND r.company_id IS NULL AND p.name = '" + permission + "' ON CONFLICT DO NOTHING");
    }

    // ------------------------------------------------------------------ HTTP

    protected static Response loginResponse(String host, String email, String password) {
        return given().header("Host", host).contentType(ContentType.JSON)
                .body(Map.of("login", email, "password", password)).post("/public/auth/login");
    }

    protected static String login(String host, String email, String password) {
        Response r = loginResponse(host, email, password);
        assertEquals(200, r.statusCode(), "login " + email + " em " + host + ": " + r.body().asString());
        String token = r.jsonPath().getString("token");
        assertNotNull(token, "login sem token: " + r.body().asString());
        return token;
    }

    /**
     * Token do admin da plataforma (master). O bootstrap cria o usuario com o e-mail por confirmar (o link vai no
     * e-mail de boas-vindas); aqui o link e' seguido pela API, com o token lido do master, e so' depois entra.
     */
    protected static String masterToken() throws Exception {
        String confirmation = masterText("select email_confirmation_token from users where email = '"
                + E2eWorld.MASTER_EMAIL + "' and email_confirmation_token is not null");
        if (confirmation != null) {
            Response confirm = given().header("Host", HOST_MASTER).queryParam("token", confirmation)
                    .get("/public/auth/confirm-email");
            assertEquals(200, confirm.statusCode(), "confirmar e-mail do master: " + confirm.body().asString());
        }
        return login(HOST_MASTER, E2eWorld.MASTER_EMAIL, E2eWorld.MASTER_PASSWORD);
    }

    protected static String adminToken(String subdomain) {
        return login(E2eWorld.host(subdomain), adminEmail(subdomain), PASSWORD);
    }

    /** Requisicao autenticada com o Host do tenant. */
    protected static RequestSpecification as(String host, String token) {
        return given().header("Host", host).auth().oauth2(token).contentType(ContentType.JSON);
    }

    protected static RequestSpecification anon(String host) {
        return given().header("Host", host).contentType(ContentType.JSON);
    }

    protected static String firstCompanyPublicId(String host, String token) {
        return as(host, token).get("/me/companies").then().statusCode(200).extract().jsonPath()
                .getString("[0].publicId");
    }

    // ------------------------------------------------------------------ usuarios, empresas, estado

    protected record Member(String email, String publicId, String token) {
    }

    /** PublicId de uma role GLOBAL do tenant (ex.: ADMIN). */
    protected static String globalRoleId(String subdomain, String name) throws Exception {
        return text(db(subdomain), "SELECT public_id FROM roles WHERE name = '" + name + "' AND company_id IS NULL");
    }

    /** Cria um usuario pela API (admin do tenant), com e-mail ja confirmado, vinculado a empresa, e faz o login dele. */
    protected static Member newMember(String subdomain, String adminToken, String companyPublicId,
            List<String> globalRoles, List<String> membershipRoles) throws Exception {
        String host = E2eWorld.host(subdomain);
        if (globalRoles.isEmpty()) {
            globalRoles = List.of(globalRoleId(subdomain, "E2E_LEITOR"));
        }
        String email = "membro-" + UUID.randomUUID().toString().substring(0, 8) + "@" + subdomain + ".test";
        Response created = as(host, adminToken)
                .body(Map.of("email", email, "name", "Membro Teste", "whatsApp", "11999997777", "password", PASSWORD,
                        "emailPreConfirmed", true, "changePasswordRequired", false, "sendWelcomeEmail", false,
                        "rolePublicIds", globalRoles,
                        "memberships", List.of(Map.of("companyPublicId", companyPublicId,
                                "rolePublicIds", membershipRoles))))
                .post("/users");
        assertEquals(201, created.statusCode(), "criar usuario: " + created.body().asString());
        return new Member(email, created.jsonPath().getString("publicId"), login(host, email, PASSWORD));
    }

    /** Cria uma empresa pelo CRUD do tenant (POST /companies) e devolve o publicId. */
    protected static String createCompany(String subdomain, String adminToken, String cnpj, String name) {
        return createCompany(subdomain, adminToken, cnpj, name, "SP");
    }

    protected static String createCompany(String subdomain, String adminToken, String cnpj, String name, String state) {
        Response r = as(E2eWorld.host(subdomain), adminToken)
                .body(Map.ofEntries(Map.entry("personType", "PJ"), Map.entry("cpfCnpj", cnpj),
                        Map.entry("corporateName", name + " LTDA"), Map.entry("tradeName", name + " SA"),
                        Map.entry("addrStreet", "Rua Filial"), Map.entry("addrNumber", "10"),
                        Map.entry("addrPostalCode", "01234567"), Map.entry("addrCity", "Cidade Teste"),
                        Map.entry("addrState", state), Map.entry("addrDistrict", "Centro"),
                        Map.entry("addrPhone", "1133334444")))
                .post("/companies");
        assertEquals(201, r.statusCode(), "criar empresa " + name + ": " + r.body().asString());
        return r.jsonPath().getString("publicId");
    }

    /** Troca a empresa corrente do usuario ({@code POST /me/select-company}) e devolve o token novo. */
    protected static String selectCompany(String host, String token, String companyPublicId) {
        Response r = as(host, token).body(Map.of("companyPublicId", companyPublicId)).post("/me/select-company");
        assertEquals(200, r.statusCode(), "selecionar empresa: " + r.body().asString());
        String fresh = r.jsonPath().getString("token");
        assertNotNull(fresh, r.body().asString());
        return fresh;
    }

    /** Muda o estado de acesso da empresa NO tenant (como o billing faria), pela sonda de teste. */
    protected static void setMode(String subdomain, String companyPublicId, String mode) {
        given().header("Host", E2eWorld.host(subdomain)).post("/probe/public/access-mode/" + companyPublicId + "/" + mode)
                .then().statusCode(200);
    }

    // ------------------------------------------------------------------ banco

    protected static String cfg(String name) {
        return ConfigProvider.getConfig().getValue(name, String.class);
    }

    private static Connection tenantConnection(String db) throws Exception {
        return DriverManager.getConnection(cfg("seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url") + "/" + db,
                cfg("seedgrid.subdomain-tenancy.tenant.datasource.username"),
                cfg("seedgrid.subdomain-tenancy.tenant.datasource.password"));
    }

    private static Connection masterConnection() throws Exception {
        return DriverManager.getConnection(cfg("seedgrid.subdomain-tenancy.master.datasource.jdbc.url"),
                cfg("seedgrid.subdomain-tenancy.master.datasource.username"),
                cfg("seedgrid.subdomain-tenancy.master.datasource.password"));
    }

    protected static void exec(String db, String sql) throws Exception {
        try (Connection c = tenantConnection(db); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    protected static String text(String db, String sql) throws Exception {
        try (Connection c = tenantConnection(db); PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getString(1) : null;
        }
    }

    protected static List<String> texts(String db, String sql) throws Exception {
        List<String> out = new ArrayList<>();
        try (Connection c = tenantConnection(db); PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                out.add(rs.getString(1));
            }
        }
        return out;
    }

    protected static void masterExec(String sql) throws Exception {
        try (Connection c = masterConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    protected static String masterText(String sql) throws Exception {
        try (Connection c = masterConnection(); PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getString(1) : null;
        }
    }

    // ------------------------------------------------------------------ utilitarios

    /** CNPJ valido de 14 digitos a partir de um numero (base de 8 digitos + filial 0001 + digitos verificadores). */
    protected static String cnpj(int n) {
        String base = String.format("%08d0001", 11222300 + n * 37);
        int[] w1 = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] w2 = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        String d1 = String.valueOf(digit(base, w1));
        String d2 = String.valueOf(digit(base + d1, w2));
        return base + d1 + d2;
    }

    private static int digit(String digits, int[] weights) {
        int sum = 0;
        for (int i = 0; i < weights.length; i++) {
            sum += (digits.charAt(i) - '0') * weights[i];
        }
        int rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    }

    /** O {@code iat} do JWT tem resolucao de segundo: um login logo depois da revogacao precisa esperar a virada. */
    protected static void pauseForIatResolution() {
        try {
            Thread.sleep(1100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
