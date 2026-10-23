package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E do cadastro por CNPJ no b2b (HTTP real): pendente, confirmacao, conta com ADMIN e trial, CNPJ repetido,
 * e-mail existente (aqui e' VINCULACAO de nova empresa, nao 409), cadastro de pessoa fisica indisponivel e ausencia do
 * login social.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bSignupE2ETest extends E2eBase {

    @Test
    void signupConfigDescribesAB2bProductWithoutSocial() {
        http().get("/public/signup/config").then().statusCode(200)
                .body("customerType", equalTo("B2B"))
                .body("socialProviders", hasSize(0))
                .body("personalDocumentRequired", equalTo(false))
                .body("termsRequired", equalTo(false));
    }

    @Test
    void signupByCnpjIsPendingUntilTheEmailIsConfirmedThenCreatesAdminAndTrial() {
        String email = uniqueEmail("novo");
        String cnpj = cnpj();
        json().body(companySignupBody(email, cnpj, "Nova")).post("/public/signup")
                .then().statusCode(202).body("status", equalTo("PENDING_EMAIL_VERIFICATION"));

        // pendente: o CNPJ aparece como "aguardando confirmacao" e o login ainda nao existe
        http().queryParam("cpfCnpj", cnpj).get("/public/signup/document-status")
                .then().statusCode(200).body("status", equalTo("PENDING_CONFIRMATION"));
        int beforeConfirm = loginRaw(email, PASSWORD).statusCode();
        assertTrue(beforeConfirm == 401 || beforeConfirm == 403, "antes de confirmar nao ha login: " + beforeConfirm);

        expect(json().body(Map.of("token", confirmationToken(email))).post("/public/signup/confirm-email"), 200)
                .then().body("status", equalTo("CONFIRMED"));

        http().queryParam("cpfCnpj", cnpj).get("/public/signup/document-status")
                .then().statusCode(200).body("status", equalTo("REGISTERED"));

        Session s = login(email, PASSWORD);
        assertEquals("PJ", ((Map<?, ?>) s.raw().get("currentCompany")).get("personType"));
        assertEquals("ACTIVE", ((Map<?, ?>) s.raw().get("currentCompany")).get("accessMode"));
        json(s.token()).get("/me/permissions").then().statusCode(200)
                .body("roles", hasItem("ADMIN")).body("isRoot", equalTo(true));
        json(s.token()).get("/me/companies").then().statusCode(200).body("$", hasSize(1));
        json(s.token()).get("/me/subscription").then().statusCode(200)
                .body("status", equalTo("ACTIVE")).body("plan.code", equalTo("TRIAL"))
                .body("plan.isTrial", equalTo(true));
    }

    @Test
    void repeatedAndInvalidCnpjAreRefused() {
        Account a = newCompanyAccount("Repetida");
        json().body(companySignupBody(uniqueEmail("outro"), a.cnpj(), "Outra")).post("/public/signup")
                .then().statusCode(409);

        for (String invalid : List.of("11111111111111", "12345678000100", "123")) {
            json().body(companySignupBody(uniqueEmail("inv"), invalid, "Invalida")).post("/public/signup")
                    .then().statusCode(400);
        }

        // o CNPJ reservado da empresa da plataforma (99999999000199) nem passa na validacao do documento
        json().body(companySignupBody(uniqueEmail("plat"), "99999999000199", "Plataforma Falsa")).post("/public/signup")
                .then().statusCode(400);
    }

    @Test
    void samePendingCnpjFromAnotherEmailIsRefusedAndKeepsTheOriginalRequest() {
        String owner = uniqueEmail("dono");
        String cnpj = cnpj();
        json().body(companySignupBody(owner, cnpj, "Pendente")).post("/public/signup").then().statusCode(202);
        Response other = json().body(companySignupBody(uniqueEmail("intruso"), cnpj, "Pendente")).post("/public/signup");
        assertEquals(409, other.statusCode(), "outro e-mail para o mesmo CNPJ pendente");
        // a solicitacao original continua valida
        expect(json().body(Map.of("token", confirmationToken(owner))).post("/public/signup/confirm-email"), 200);
    }

    @Test
    void existingEmailLinksANewCompanyToTheSameLogin() {
        Account a = newCompanyAccount("Matriz");
        String filial = linkAnotherCompany(a.email(), "Filial");
        assertNotNull(filial);

        // mesmo login, duas empresas: o login pede a escolha da empresa
        Response r = loginRaw(a.email(), PASSWORD);
        r.then().statusCode(200).body("companySelectionRequired", equalTo(true));
        String token = r.jsonPath().getString("token");
        json(token).get("/me/companies").then().statusCode(200).body("$", hasSize(2))
                .body("publicId", hasItem(a.companyPublicId())).body("publicId", hasItem(filial));
        Session onFilial = selectCompany(sessionOf(r), filial);
        assertEquals(filial, onFilial.currentCompanyPublicId());
    }

    @Test
    void personalSignupIsNotAvailableInTheB2bProduct() {
        json().body(Map.of("name", "Maria Souza", "email", uniqueEmail("pf"), "password", PASSWORD,
                "whatsapp", "11987654321")).post("/public/signup/personal")
                .then().statusCode(403).body("code", equalTo("SIGNUP_TYPE_NOT_ALLOWED"));
    }

    @Test
    void thereIsNoSocialLoginInTheB2bProduct() {
        // sem o modulo seedgrid-security-social nao existe rota de inicio do fluxo (nem para um provedor qualquer)
        for (String provider : List.of("google", "facebook")) {
            Response r = http().redirects().follow(false).get("/public/auth/social/" + provider + "/login");
            assertTrue(r.statusCode() == 404 || r.statusCode() == 405,
                    provider + ": esperado 404/405, veio " + r.statusCode());
        }
        // e o login por senha nao oferece provedor algum
        http().get("/public/signup/config").then().body("socialProviders", hasSize(0));
    }
}
