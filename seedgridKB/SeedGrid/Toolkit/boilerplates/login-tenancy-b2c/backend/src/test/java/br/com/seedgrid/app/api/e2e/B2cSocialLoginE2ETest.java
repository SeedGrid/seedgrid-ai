package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.oidc.server.OidcWiremockTestResource;
import io.restassured.RestAssured;
import io.restassured.response.Response;

/**
 * E2E do login social no b2c com um PROVEDOR OIDC SIMULADO (servidor falso do {@code quarkus-test-oidc-server}) no lugar
 * do Google: o tenant {@code social-google} do modulo aponta para o servidor falso, que devolve um ID token SEM e-mail
 * (so {@code sub}). O fluxo e percorrido por HTTP sem navegador: login -> authorize -> callback -> retorno ao front, e
 * a conta pessoal nasce depois de o usuario informar e CONFIRMAR o e-mail por codigo.
 */
@QuarkusTest
@QuarkusTestResource(value = B2cSocialLoginE2ETest.SocialResource.class, restrictToAnnotatedClass = true)
class B2cSocialLoginE2ETest extends E2eBase {

    private static final String BASE = "/public/auth/social";
    private static final String RETURN_TO = "http://localhost:3000/auth/social/done";
    private static final Pattern CODE = Pattern.compile("(?<![0-9])([0-9]{6})(?![0-9])");

    /** Postgres + servidor OIDC falso; so o provedor {@code google} fica ligado e aponta para o servidor falso. */
    public static class SocialResource extends E2ePostgresResource {
        private final OidcWiremockTestResource oidc = new OidcWiremockTestResource();

        @Override
        protected Map<String, String> extra() {
            Map<String, String> fake = oidc.start();
            String issuer = fake.get("keycloak.url") + "/realms/quarkus";
            Map<String, String> m = new HashMap<>(fake);
            m.put("seedgrid.security.social.providers", "google");
            m.put("seedgrid.security.social.google.client-id", "quarkus-web-app");
            m.put("seedgrid.security.social.google.client-secret", "secret");
            m.put("seedgrid.security.social.google.state-secret", "0123456789abcdef0123456789abcdef");
            m.put("seedgrid.security.social.google.encryption-secret", "fedcba9876543210fedcba9876543210");
            m.put("seedgrid.security.social.allowed-return-hosts", "localhost:3000");
            m.put("quarkus.oidc.social-google.auth-server-url", issuer + "/");
            m.put("quarkus.oidc.social-google.authentication.force-redirect-https-scheme", "false");
            return m;
        }

        @Override
        public void stop() {
            oidc.stop();
            super.stop();
        }
    }

    // ---------------------------------------------------------------- passos do fluxo (sem navegador)

    private static String enc(String v) {
        return URLEncoder.encode(v, StandardCharsets.UTF_8);
    }

    private static String pathAndQuery(String location) {
        URI u = URI.create(location);
        return u.getRawPath() + (u.getRawQuery() == null ? "" : "?" + u.getRawQuery());
    }

    private static Map<String, String> query(String url) {
        Map<String, String> q = new LinkedHashMap<>();
        String raw = URI.create(url).getRawQuery();
        if (raw != null) {
            for (String kv : raw.split("&")) {
                String[] p = kv.split("=", 2);
                q.put(p[0], URLDecoder.decode(p.length > 1 ? p[1] : "", StandardCharsets.UTF_8));
            }
        }
        return q;
    }

    private static Map<String, String> cookies(Response r, String prefix) {
        Map<String, String> c = new HashMap<>();
        r.detailedCookies().forEach(x -> {
            if (x.getName().startsWith(prefix) && !x.getValue().isEmpty()) {
                c.put(x.getName(), x.getValue());
            }
        });
        return c;
    }

    private Response get(String urlOrPath, Map<String, String> cookies) {
        var spec = RestAssured.given().baseUri("http://localhost").port(appUrl.getPort()).urlEncodingEnabled(false)
                .redirects().follow(false);
        if (cookies != null && !cookies.isEmpty()) {
            spec = spec.cookies(cookies);
        }
        return spec.get(urlOrPath);
    }

    /** login -> authorize (vai ao provedor) -> callback -> authorize restaurado (volta ao returnTo). */
    private Response runFlow(String provider, boolean acceptedTerms) {
        Response login = get(BASE + "/" + provider + "/login?returnTo=" + enc(RETURN_TO) + "&acceptedTerms=" + acceptedTerms, null);
        assertEquals(302, login.statusCode(), login.asString());
        String authorize = pathAndQuery(login.header("Location"));
        Response start = get(authorize, null);
        assertEquals(302, start.statusCode(), start.asString());
        Map<String, String> authCookies = cookies(start, "q_auth_");
        String state = query(start.header("Location")).get("state");
        assertNotNull(state, "state do provedor");
        Response callback = RestAssured.given().baseUri("http://localhost").port(appUrl.getPort())
                .redirects().follow(false).cookies(authCookies)
                .queryParam("code", "abc").queryParam("state", state)
                .get(BASE + "/" + provider + "/callback");
        assertEquals(302, callback.statusCode(), callback.asString());
        Map<String, String> session = cookies(callback, "q_session");
        assertFalse(session.isEmpty(), "cookie de sessao do provedor");
        Response finish = get(pathAndQuery(callback.header("Location")), session);
        assertEquals(302, finish.statusCode(), finish.asString());
        return finish;
    }

    private String codeSentTo(String email) {
        List<String> sent = E2eRecordingEmailService.htmlSentTo(email);
        assertFalse(sent.isEmpty(), "nenhum e-mail enviado a " + email);
        Matcher m = CODE.matcher(sent.get(sent.size() - 1));
        assertTrue(m.find(), "e-mail sem codigo de 6 digitos");
        return m.group(1);
    }

    // ---------------------------------------------------------------- testes

    @Test
    void theConfiguredProviderIsAdvertisedToTheFrontAndTheOthersAreOff() {
        http().get("/public/signup/config").then().statusCode(200)
                .body("customerType", equalTo("B2C")).body("socialProviders", hasItem("google"));
        http().get(BASE + "/providers").then().statusCode(200);
        Response facebook = get(BASE + "/facebook/login?returnTo=" + enc(RETURN_TO), null);
        assertEquals(404, facebook.statusCode(), facebook.asString());
        assertEquals("SOCIAL_PROVIDER_DISABLED", facebook.jsonPath().getString("code"), facebook.asString());
    }

    @Test
    void aReturnUrlOutsideTheAllowedHostsIsRefused() {
        Response r = get(BASE + "/google/login?returnTo=" + enc("https://evil.example/steal"), null);
        assertEquals(400, r.statusCode(), r.asString());
        assertEquals("SOCIAL_RETURN_URL_NOT_ALLOWED", r.jsonPath().getString("code"), r.asString());
    }

    @Test
    void aProviderWithoutEmailCreatesThePersonalAccountOnlyAfterTheEmailIsConfirmedByCode() {
        Response finish = runFlow("google", true);
        Map<String, String> back = query(finish.header("Location"));
        // o servidor falso devolve so' o sub: sem e-mail, o fluxo pede e confirma o e-mail
        assertEquals("EMAIL_REQUIRED", back.get("status"), finish.header("Location"));
        String pending = back.get("pendingToken");
        assertNotNull(pending);

        String email = uniqueEmail("social");
        json().body(Map.of("pendingToken", pending, "email", email)).post("/public/social/email")
                .then().statusCode(200).body("status", equalTo("EMAIL_CONFIRMATION_SENT"));
        assertEquals(0, signupRequests.findPendingPersonalByEmail(email).stream().count());
        assertTrue(users.findByEmail(email).isEmpty(), "nada e criado antes de confirmar o e-mail");

        Response done = json().body(Map.of("pendingToken", pending, "code", codeSentTo(email)))
                .post("/public/social/confirm-email");
        done.then().statusCode(200).body("status", equalTo("AUTHENTICATED")).body("auth.token", notNullValue());
        String token = done.jsonPath().getString("auth.token");

        // conta pessoal (PF), titular ADMIN, sem CPF e sem senha
        json(token).get("/me/permissions").then().statusCode(200)
                .body("roles", hasItem("ADMIN")).body("isRoot", equalTo(true));
        json(token).get("/me/companies").then().statusCode(200).body("[0].personType", equalTo("PF"));
        json(token).get("/me/identities").then().statusCode(200);
        int passwordLogin = loginRaw(email, PASSWORD).statusCode();
        assertTrue(passwordLogin == 401 || passwordLogin == 403, "conta social nao tem senha: " + passwordLogin);

        // proximo login com o mesmo provedor: a identidade ja existe, volta autenticado com ticket de uso unico
        Response again = runFlow("google", true);
        Map<String, String> second = query(again.header("Location"));
        String ticket = second.get("ticket");
        assertNotNull(ticket, again.header("Location"));
        Response exchange = json().body(Map.of("ticket", ticket)).post(BASE + "/exchange");
        exchange.then().statusCode(200).body("status", equalTo("OK")).body("token", notNullValue());
        assertEquals(done.jsonPath().getString("auth.publicId"), exchange.jsonPath().getString("publicId"));
        // ticket de uso unico
        json().body(Map.of("ticket", ticket)).post(BASE + "/exchange").then().statusCode(404)
                .body("code", equalTo("SOCIAL_TICKET_INVALID"));
    }
}
