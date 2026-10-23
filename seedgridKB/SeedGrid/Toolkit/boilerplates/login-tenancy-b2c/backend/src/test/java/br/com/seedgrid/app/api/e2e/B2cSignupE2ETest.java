package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E do cadastro de PESSOA FISICA no b2c (HTTP real): CPF opcional, pendente ate confirmar o e-mail, uma conta = uma
 * pessoa (ADMIN do proprio vinculo), e-mail existente e CPF repetido (409), cadastro de empresa indisponivel, login e
 * assinatura de trial.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2cSignupE2ETest extends E2eBase {

    @Test
    void signupConfigDescribesAB2cProductWithOptionalCpfAndNoSocialByDefault() {
        http().get("/public/signup/config").then().statusCode(200)
                .body("customerType", equalTo("B2C"))
                .body("personalDocumentRequired", equalTo(false))
                .body("termsRequired", equalTo(false))
                .body("socialProviders", hasSize(0));
    }

    @Test
    void signupWithoutCpfIsPendingThenConfirmsIntoAPersonalAccountWithAdminAndTrial() {
        String email = uniqueEmail("pf");
        json().body(personalSignupBody(email, null)).post("/public/signup/personal")
                .then().statusCode(202).body("status", equalTo("PENDING_EMAIL_VERIFICATION"));

        int beforeConfirm = loginRaw(email, PASSWORD).statusCode();
        assertTrue(beforeConfirm == 401 || beforeConfirm == 403, "antes de confirmar nao ha login: " + beforeConfirm);

        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200)
                .then().body("status", equalTo("CONFIRMED"));

        Session s = login(email, PASSWORD);
        Map<?, ?> company = (Map<?, ?>) s.raw().get("currentCompany");
        assertEquals("PF", company.get("personType"));
        assertEquals("ACTIVE", company.get("accessMode"));
        assertEquals("Maria Souza", company.get("name"));
        json(s.token()).get("/me/permissions").then().statusCode(200)
                .body("roles", hasItem("ADMIN")).body("isRoot", equalTo(true));
        json(s.token()).get("/me/companies").then().statusCode(200).body("$", hasSize(1))
                .body("[0].personType", equalTo("PF"));
        json(s.token()).get("/me/subscription").then().statusCode(200)
                .body("status", equalTo("ACTIVE")).body("plan.code", equalTo("TRIAL"))
                .body("plan.isTrial", equalTo(true));
    }

    @Test
    void signupWithCpfRegistersTheDocumentAndBlocksTheSameCpfAfterwards() {
        String email = uniqueEmail("pf-cpf");
        String cpf = cpf();
        json().body(personalSignupBody(email, cpf)).post("/public/signup/personal").then().statusCode(202);
        http().queryParam("cpfCnpj", cpf).get("/public/signup/document-status")
                .then().statusCode(200).body("status", equalTo("PENDING_CONFIRMATION"));
        // outro e-mail com o CPF de um cadastro pendente: conflito
        json().body(personalSignupBody(uniqueEmail("outro"), cpf)).post("/public/signup/personal")
                .then().statusCode(409);

        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
        http().queryParam("cpfCnpj", cpf).get("/public/signup/document-status")
                .then().statusCode(200).body("status", equalTo("REGISTERED"));
        json().body(personalSignupBody(uniqueEmail("outro2"), cpf)).post("/public/signup/personal")
                .then().statusCode(409);
        login(email, PASSWORD);
    }

    @Test
    void invalidCpfAndWeakOrMissingFieldsAreRefused() {
        for (String invalid : List.of("11111111111", "12345678900", "123")) {
            json().body(personalSignupBody(uniqueEmail("inv"), invalid)).post("/public/signup/personal")
                    .then().statusCode(400);
        }
        Map<String, Object> noName = personalSignupBody(uniqueEmail("sn"), null);
        noName.remove("name");
        json().body(noName).post("/public/signup/personal").then().statusCode(400);
        Map<String, Object> weak = personalSignupBody(uniqueEmail("fraca"), null);
        weak.put("password", "abc");
        json().body(weak).post("/public/signup/personal").then().statusCode(400);
    }

    @Test
    void anEmailThatAlreadyHasAnAccountIsConflict() {
        Person p = newPerson("existente", false);
        Response again = json().body(personalSignupBody(p.email(), null)).post("/public/signup/personal");
        assertEquals(409, again.statusCode(), again.asString());
        // e a pessoa nunca ganha uma 2a empresa por vinculacao (B2C = uma conta, uma pessoa)
        json(p.session().token()).get("/me/companies").then().body("$", hasSize(1));
    }

    @Test
    void theSamePendingEmailReusesTheRequest() {
        String email = uniqueEmail("reenvio");
        json().body(personalSignupBody(email, null)).post("/public/signup/personal").then().statusCode(202);
        String first = confirmationToken(email);
        json().body(personalSignupBody(email, null)).post("/public/signup/personal").then().statusCode(202);
        assertEquals(1, signupRequests.findPendingPersonalByEmail(email).stream().count());
        assertTrue(!first.isEmpty());
        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200);
    }

    @Test
    void companySignupByCnpjIsNotAvailableInTheB2cProduct() {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("cpfCnpj", cnpj());
        body.put("corporateName", "Empresa Alfa Ltda");
        body.put("tradeName", "Alfa Comercio");
        body.put("address", Map.of("street", "Rua A", "number", "1", "postalCode", "01001000", "city", "Sao Paulo",
                "state", "SP", "district", "Centro", "phone", "1133334444"));
        body.put("legalRepresentative", Map.of("firstName", "Ana", "lastName", "Silva", "cpf", cpf(),
                "birthDate", "1985-05-05", "phone", "11999998888", "whatsapp", "11999998888"));
        body.put("rootEmail", uniqueEmail("pj"));
        body.put("plainRootPassword", PASSWORD);
        json().body(body).post("/public/signup")
                .then().statusCode(403).body("code", equalTo("SIGNUP_TYPE_NOT_ALLOWED"));
    }

    @Test
    void thePersonCanLogInRefreshAndChangeNothingElseOfThePlatform() {
        Person p = newPerson("sessao", true);
        Session refreshed = refresh(p.session());
        json(refreshed.token()).get("/me/permissions").then().statusCode(200);
        // a pessoa nao e' operadora da plataforma: sem acesso a empresas, contas e planos de administracao
        json(p.session().token()).get("/companies").then().statusCode(403);
        json(p.session().token()).get("/admin/accounts").then().statusCode(403);
        json(p.session().token()).get("/admin/plans").then().statusCode(403);
        loginRaw(p.email(), "Errada@123Aa").then().statusCode(401);
    }
}
