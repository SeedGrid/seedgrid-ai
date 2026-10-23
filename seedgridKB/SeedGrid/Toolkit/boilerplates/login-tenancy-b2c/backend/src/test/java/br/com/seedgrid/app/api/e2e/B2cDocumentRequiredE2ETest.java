package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E com {@code seedgrid.login-tenancy.signup.personal-document-required=true} (o produto emite nota fiscal): o cadastro
 * de pessoa fisica sem CPF e recusado com 400 {@code PERSONAL_DOCUMENT_REQUIRED}; com CPF valido segue normal.
 */
@QuarkusTest
@QuarkusTestResource(value = B2cDocumentRequiredE2ETest.DocumentRequiredResource.class, restrictToAnnotatedClass = true)
class B2cDocumentRequiredE2ETest extends E2eBase {

    public static class DocumentRequiredResource extends E2ePostgresResource {
        @Override
        protected Map<String, String> extra() {
            return Map.of("seedgrid.login-tenancy.signup.personal-document-required", "true");
        }
    }

    @Test
    void signupConfigTellsTheFrontThatTheCpfIsRequired() {
        http().get("/public/signup/config").then().statusCode(200)
                .body("customerType", equalTo("B2C")).body("personalDocumentRequired", equalTo(true));
    }

    @Test
    void signupWithoutCpfIsRefusedWithPersonalDocumentRequired() {
        Response r = json().body(personalSignupBody(uniqueEmail("sem-cpf"), null)).post("/public/signup/personal");
        assertEquals(400, r.statusCode(), r.asString());
        assertEquals("PERSONAL_DOCUMENT_REQUIRED", r.jsonPath().getString("code"), r.asString());
        // e um CPF em branco conta como ausente
        Map<String, Object> blank = personalSignupBody(uniqueEmail("cpf-branco"), "");
        Response b = json().body(blank).post("/public/signup/personal");
        assertEquals(400, b.statusCode(), b.asString());
    }

    @Test
    void signupWithAValidCpfWorksAndTheAccountKeepsTheDocument() {
        Person p = newPerson("com-cpf", true);
        http().queryParam("cpfCnpj", p.cpf()).get("/public/signup/document-status")
                .then().statusCode(200).body("status", equalTo("REGISTERED"));
        json(p.session().token()).get("/me/permissions").then().statusCode(200);
    }
}
