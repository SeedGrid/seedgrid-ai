package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E dos termos de uso no cadastro de pessoa fisica: com {@code seedgrid.security.terms.required=true} o cadastro exige o
 * aceite da versao VIGENTE (senao 400 {@code TERMS_NOT_ACCEPTED}); o aceite fica gravado e o login nao pede de novo.
 */
@QuarkusTest
@QuarkusTestResource(value = B2cTermsE2ETest.TermsResource.class, restrictToAnnotatedClass = true)
class B2cTermsE2ETest extends E2eBase {

    public static class TermsResource extends E2ePostgresResource {
        @Override
        protected Map<String, String> extra() {
            return Map.of("seedgrid.security.terms.required", "true",
                    "seedgrid.security.terms.version", "2",
                    "seedgrid.security.terms.documents.terms", "https://example.test/termos",
                    "seedgrid.security.terms.documents.privacy", "https://example.test/privacidade");
        }
    }

    private Map<String, Object> body(String email, Boolean accepted, String version) {
        Map<String, Object> body = personalSignupBody(email, null);
        if (accepted != null) {
            body.put("acceptedTerms", accepted);
        }
        if (version != null) {
            body.put("termsVersion", version);
        }
        return body;
    }

    @Test
    void publicTermsAndSignupConfigExposeTheCurrentVersionAndLinks() {
        http().get("/public/terms").then().statusCode(200)
                .body("required", equalTo(true)).body("version", equalTo("2"))
                .body("documents.terms", equalTo("https://example.test/termos"))
                .body("documents.privacy", equalTo("https://example.test/privacidade"));
        http().get("/public/signup/config").then().statusCode(200)
                .body("termsRequired", equalTo(true)).body("termsVersion", equalTo("2"))
                .body("termsDocuments.privacy", equalTo("https://example.test/privacidade"));
    }

    @Test
    void signupWithoutAcceptingTheCurrentVersionIsRefused() {
        for (Map<String, Object> b : List.of(
                body(uniqueEmail("t1"), null, null),
                body(uniqueEmail("t2"), false, "2"),
                body(uniqueEmail("t3"), true, "1"),
                body(uniqueEmail("t4"), true, null))) {
            Response r = json().body(b).post("/public/signup/personal");
            assertEquals(400, r.statusCode(), r.asString());
            assertEquals("TERMS_NOT_ACCEPTED", r.jsonPath().getString("code"), r.asString());
        }
    }

    @Test
    void acceptedTermsAreRecordedAndTheLoginDoesNotAskAgain() {
        String email = uniqueEmail("aceite");
        json().body(body(email, true, "2")).post("/public/signup/personal").then().statusCode(202);
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);

        Response login = loginRaw(email, PASSWORD);
        login.then().statusCode(200).body("termsAcceptanceRequired", equalTo(false));
        String token = login.jsonPath().getString("token");
        json(token).body(Map.of("version", "2")).post("/me/terms/accept").then().statusCode(204);
        Response wrong = json(token).body(Map.of("version", "1")).post("/me/terms/accept");
        assertEquals(409, wrong.statusCode(), wrong.asString());
        assertEquals("TERMS_VERSION_MISMATCH", wrong.jsonPath().getString("code"));
    }
}
