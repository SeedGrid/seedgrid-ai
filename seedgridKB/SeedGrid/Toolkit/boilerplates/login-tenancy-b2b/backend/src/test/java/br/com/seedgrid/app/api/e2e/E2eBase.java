package br.com.seedgrid.app.api.e2e;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import br.com.seedgrid.logintenancy.repositories.SignupRequestRepository;
import br.com.seedgrid.security.entities.Role;
import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.entities.UserCompany;
import br.com.seedgrid.security.repositories.PermissionRepository;
import br.com.seedgrid.security.repositories.RoleRepository;
import br.com.seedgrid.security.repositories.UserRepository;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.common.http.TestHTTPResource;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Base da bateria E2E: tudo passa por HTTP real na porta em que o backend subiu ({@code @TestHTTPResource}); o unico
 * atalho em processo e' ler o codigo de confirmacao de e-mail do cadastro (o e-mail em si e' simulado) e fixtures
 * que nao tem endpoint (relogio, plano do trial).
 */
public abstract class E2eBase {

    public static final String PASSWORD = "Zq!rT7mK#pL9";

    @TestHTTPResource
    protected URL appUrl;

    @Inject
    protected SignupRequestRepository signupRequests;

    @Inject
    protected UserRepository users;

    @Inject
    protected RoleRepository roles;

    @Inject
    protected PermissionRepository permissions;

    /** Requisicao sem token, na porta real. */
    protected RequestSpecification http() {
        return RestAssured.given().baseUri("http://localhost").port(appUrl.getPort());
    }

    protected RequestSpecification http(String token) {
        return http().header("Authorization", "Bearer " + token);
    }

    protected RequestSpecification json(String token) {
        return http(token).contentType(ContentType.JSON);
    }

    protected RequestSpecification json() {
        return http().contentType(ContentType.JSON);
    }

    // ---------------------------------------------------------------- documentos validos

    private static int digit(int[] base, int[] weights) {
        int sum = 0;
        for (int i = 0; i < weights.length; i++) {
            sum += base[i] * weights[i];
        }
        int mod = sum % 11;
        return mod < 2 ? 0 : 11 - mod;
    }

    /** CNPJ valido (digitos verificadores) e aleatorio, so' numeros. */
    public static String cnpj() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int[] d = new int[14];
        for (int i = 0; i < 8; i++) {
            d[i] = r.nextInt(10);
        }
        d[8] = 0;
        d[9] = 0;
        d[10] = 0;
        d[11] = 1;
        d[12] = digit(d, new int[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 });
        d[13] = digit(d, new int[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 });
        StringBuilder sb = new StringBuilder();
        for (int x : d) {
            sb.append(x);
        }
        return sb.toString();
    }

    /** CPF valido e aleatorio, so' numeros. */
    public static String cpf() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        while (true) {
            int[] d = new int[11];
            for (int i = 0; i < 9; i++) {
                d[i] = r.nextInt(10);
            }
            boolean allEqual = true;
            for (int i = 1; i < 9; i++) {
                allEqual &= d[i] == d[0];
            }
            if (allEqual) {
                continue;
            }
            d[9] = digit(d, new int[] { 10, 9, 8, 7, 6, 5, 4, 3, 2 });
            d[10] = digit(d, new int[] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 });
            StringBuilder sb = new StringBuilder();
            for (int x : d) {
                sb.append(x);
            }
            return sb.toString();
        }
    }

    public static String uniqueEmail(String prefix) {
        return prefix + "-" + Long.toString(ThreadLocalRandom.current().nextLong(1L << 40), 36) + "@e2e.test";
    }

    // ---------------------------------------------------------------- sessao

    /** Resultado de um login/refresh/select-company. */
    public record Session(String token, String refreshToken, String publicId, Map<String, Object> raw) {
        @SuppressWarnings("unchecked")
        public String currentCompanyPublicId() {
            Object c = raw.get("currentCompany");
            return c instanceof Map<?, ?> m ? String.valueOf(((Map<String, Object>) m).get("publicId")) : null;
        }
    }

    protected Response loginRaw(String email, String password) {
        Map<String, Object> body = new HashMap<>();
        body.put("login", email);
        body.put("password", password);
        return json().body(body).post("/public/auth/login");
    }

    /** Confere o status e, se divergir, mostra o corpo da resposta (a mensagem do Rest-Assured nao mostra). */
    protected static Response expect(Response r, int status) {
        if (r.statusCode() != status) {
            throw new AssertionError("esperado HTTP " + status + " mas veio " + r.statusCode() + " em "
                    + r.getHeader("Content-Type") + ": " + r.asString());
        }
        return r;
    }

    protected Session login(String email, String password) {
        Response r = loginRaw(email, password);
        expect(r, 200);
        Map<String, Object> raw = r.jsonPath().getMap("$");
        return new Session(r.jsonPath().getString("token"), r.jsonPath().getString("refreshToken"),
                r.jsonPath().getString("publicId"), raw);
    }

    protected Session sessionOf(Response r) {
        expect(r, 200);
        return new Session(r.jsonPath().getString("token"), r.jsonPath().getString("refreshToken"),
                r.jsonPath().getString("publicId"), r.jsonPath().getMap("$"));
    }

    protected Session selectCompany(Session s, String companyPublicId) {
        return sessionOf(json(s.token()).body(Map.of("companyPublicId", companyPublicId))
                .post("/me/select-company"));
    }

    protected Session refresh(Session s) {
        return sessionOf(json().body(Map.of("refreshToken", s.refreshToken())).post("/public/auth/refresh"));
    }

    private static volatile String platformPassword;

    /**
     * Administrador da plataforma (semeado pelo bootstrap): confirma o e-mail pelo endpoint publico, troca a senha
     * inicial (troca obrigatoria) e devolve a sessao.
     */
    protected synchronized Session platformAdmin() {
        if (platformPassword == null) {
            String token = platformAdminEmailToken();
            expect(http().queryParam("token", token).get("/public/auth/confirm-email"), 200);
            Session first = login(E2ePostgresResource.PLATFORM_ADMIN_EMAIL, E2ePostgresResource.PLATFORM_ADMIN_PASSWORD);
            expect(json(first.token())
                    .body(Map.of("currentPassword", E2ePostgresResource.PLATFORM_ADMIN_PASSWORD, "newPassword", PASSWORD))
                    .put("/users/change-password"), 200);
            platformPassword = PASSWORD;
            afterRevocation(); // a troca de senha revoga as sessoes do usuario
        }
        return login(E2ePostgresResource.PLATFORM_ADMIN_EMAIL, platformPassword);
    }

    @Transactional
    protected String platformAdminEmailToken() {
        return users.findByEmail(E2ePostgresResource.PLATFORM_ADMIN_EMAIL).orElseThrow().getEmailConfirmationToken();
    }

    /** O marcador de revogacao tem resolucao de ms e o iat do JWT de 1 s: um login no mesmo segundo cairia. */
    protected static void afterRevocation() {
        try {
            Thread.sleep(1200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /** Uma conta de cliente criada pelo cadastro publico. */
    public record Account(String email, String cnpj, String companyPublicId, Session session) {
    }

    protected Map<String, Object> companySignupBody(String email, String cnpj, String name) {
        Map<String, Object> body = new HashMap<>();
        body.put("cpfCnpj", cnpj);
        body.put("corporateName", name + " Ltda");
        body.put("tradeName", name + " Comercio");
        body.put("address", Map.of("street", "Rua A", "number", "1", "postalCode", "01001000", "city", "Sao Paulo",
                "state", "SP", "district", "Centro", "phone", "1133334444"));
        body.put("legalRepresentative", Map.of("firstName", "Ana", "lastName", "Silva", "cpf", cpf(),
                "birthDate", "1985-05-05", "phone", "11999998888", "whatsapp", "11999998888"));
        body.put("rootEmail", email);
        body.put("plainRootPassword", PASSWORD);
        return body;
    }

    /** Cadastro + confirmacao de e-mail + login, tudo por HTTP. */
    protected Account newCompanyAccount(String name) {
        String email = uniqueEmail(name.toLowerCase());
        String cnpj = cnpj();
        expect(json().body(companySignupBody(email, cnpj, name)).post("/public/signup"), 202);
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
        Session s = login(email, PASSWORD);
        return new Account(email, cnpj, s.currentCompanyPublicId(), s);
    }

    /**
     * Operador da plataforma: o administrador semeado + um perfil global com {@code COMPANY_ACCESS_MODE_UPDATE}.
     * Essa permissao NAO vai no ADMIN e o ADMIN nao a delega (por desenho: so' a software house concede, por migration
     * ou banco); por isso a concessao e' a unica fixture em processo, e nao ha caminho HTTP para ela.
     */
    protected Session platformOperator() {
        grantOperatorRoleOnce();
        return platformAdmin();
    }

    private synchronized void grantOperatorRoleOnce() {
        platformAdmin(); // garante e-mail confirmado e senha trocada
        QuarkusTransaction.requiringNew().run(() -> {
            User u = users.findByEmail(E2ePostgresResource.PLATFORM_ADMIN_EMAIL).orElseThrow();
            boolean has = u.getRoles().stream().anyMatch(r -> "OPERADOR_PLATAFORMA".equals(r.getName()));
            if (has) {
                return;
            }
            Role role = roles.findByName("OPERADOR_PLATAFORMA").orElse(null);
            if (role == null) {
                role = new Role();
                role.setName("OPERADOR_PLATAFORMA");
                role.setDescription("Operador da plataforma (E2E)");
                role.setSystem(false);
                role.setPermissions(new java.util.ArrayList<>(java.util.List.of(
                        permissions.findByName("COMPANY_ACCESS_MODE_UPDATE").orElseThrow())));
                roles.persist(role);
            }
            u.getRoles().add(role);
            for (UserCompany m : u.getMemberships()) {
                if (!m.getRoles().isEmpty()) {
                    m.getRoles().add(role);
                }
            }
        });
        afterRevocation();
    }

    /** publicId do perfil (global ou da conta) com este nome, visto pela sessao da conta. */
    protected String roleId(Session s, String name) {
        List<Map<String, Object>> items = expect(json(s.token()).get("/me/security/roles"), 200)
                .jsonPath().getList("items");
        return items.stream().filter(r -> name.equals(r.get("name"))).map(r -> String.valueOf(r.get("publicId")))
                .findFirst().orElseThrow(() -> new AssertionError("perfil nao encontrado: " + name));
    }

    /** publicId de uma permissao pelo nome, visto pela sessao da conta (lista de permissoes atribuiveis). */
    protected String permissionId(Session s, String name) {
        List<Map<String, Object>> items = expect(json(s.token()).get("/me/security/roles/permissions"), 200)
                .jsonPath().getList("items");
        return items.stream().filter(r -> name.equals(r.get("name"))).map(r -> String.valueOf(r.get("publicId")))
                .findFirst().orElseThrow(() -> new AssertionError("permissao nao encontrada: " + name));
    }

    /** O administrador da conta cadastra um membro com estes perfis; devolve o publicId. */
    protected String addMember(Session admin, String email, List<String> rolePublicIds) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("name", "Maria Souza");
        body.put("whatsApp", "11987654321");
        body.put("password", PASSWORD);
        body.put("active", true);
        body.put("rolePublicIds", rolePublicIds);
        return expect(json(admin.token()).body(body).post("/me/security/users"), 201).jsonPath().getString("publicId");
    }

    /** Confirma o e-mail de um usuario criado por um administrador (o link do e-mail e' simulado). */
    protected void confirmEmail(String email) {
        String token = emailToken(email);
        expect(http().queryParam("token", token).get("/public/auth/confirm-email"), 200);
    }

    @Transactional
    protected String emailToken(String email) {
        return users.findByEmail(email).orElseThrow().getEmailConfirmationToken();
    }

    public static final String MEMBER_PASSWORD = "Xk#9vQ!tR4zL";

    /**
     * Ativa um membro cadastrado por um administrador: confirma o e-mail e troca a senha inicial (troca obrigatoria).
     * Devolve a sessao ja' com a senha {@link #MEMBER_PASSWORD}.
     */
    protected Session activateMember(String email) {
        confirmEmail(email);
        Session first = login(email, PASSWORD);
        if (Boolean.TRUE.equals(first.raw().get("changePasswordRequired"))) {
            expect(json(first.token()).body(Map.of("currentPassword", PASSWORD, "newPassword", MEMBER_PASSWORD))
                    .put("/users/change-password"), 200);
            afterRevocation();
            return login(email, MEMBER_PASSWORD);
        }
        return first;
    }

    /** Membro pronto para logar: cadastrado, com e-mail confirmado e senha trocada. */
    protected Session newMemberSession(Session admin, List<String> rolePublicIds) {
        String email = uniqueEmail("membro");
        addMember(admin, email, rolePublicIds);
        return activateMember(email);
    }

    /** Claim do JWT (sem validar a assinatura: o servidor ja validou). */
    protected static Object claim(String jwt, String name) {
        String payload = new String(java.util.Base64.getUrlDecoder().decode(jwt.split("[.]")[1]),
                java.nio.charset.StandardCharsets.UTF_8);
        return io.restassured.path.json.JsonPath.from(payload).get(name);
    }

    /** Cadastra uma 2a empresa para o MESMO e-mail (vinculacao) e confirma; devolve o publicId da nova empresa. */
    protected String linkAnotherCompany(String email, String name) {
        expect(json().body(companySignupBody(email, cnpj(), name)).post("/public/signup"), 202);
        return expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200)
                .jsonPath().getString("companyId");
    }

    @Transactional
    protected String confirmationToken(String email) {
        return signupRequests.findByEmail(email).orElseThrow().verificationToken;
    }
}
