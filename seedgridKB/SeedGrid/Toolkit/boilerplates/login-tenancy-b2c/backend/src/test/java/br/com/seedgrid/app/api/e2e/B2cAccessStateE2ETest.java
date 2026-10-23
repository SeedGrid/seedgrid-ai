package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E do estado de acesso da conta de pessoa fisica, mudado pelo operador da plataforma por HTTP: READ_ONLY deixa ler e
 * bloqueia gravar (COMPANY_READ_ONLY) sem afetar outra pessoa; volta ao normal com ACTIVE; a conta pessoal e a unica
 * empresa da pessoa, entao DISABLED e recusado (a conta nunca fica com todas desligadas) e o titular, ultimo ADMIN,
 * tambem nao e desativado (LAST_ADMIN_PROTECTED).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2cAccessStateE2ETest extends E2eBase {

    private Response setMode(Session operator, String companyPublicId, String mode) {
        return json(operator.token()).body(Map.of("mode", mode, "reason", "E2E " + mode))
                .put("/companies/" + companyPublicId + "/access-mode");
    }

    @Test
    void thePersonCannotChangeItsOwnAccessMode() {
        Person p = newPerson("pf", false);
        json(p.session().token()).body(Map.of("mode", "READ_ONLY")).put("/companies/" + p.companyPublicId()
                + "/access-mode").then().statusCode(403);
        json(p.session().token()).get("/me/permissions").then().statusCode(200);
    }

    @Test
    void readOnlyLetsThePersonReadAndBlocksWritesWithoutTouchingAnotherPerson() {
        Person p = newPerson("pf", false);
        Person other = newPerson("pf-outra", false);
        Session operator = platformOperator();

        expect(setMode(operator, p.companyPublicId(), "READ_ONLY"), 200)
                .then().body("accessMode", equalTo("READ_ONLY")).body("personType", equalTo("PF"));

        Response old = json(p.session().token()).get("/me/permissions");
        assertEquals(401, old.statusCode(), old.asString());
        assertEquals("SESSION_REVOKED", old.jsonPath().getString("code"));
        afterRevocation();
        Session s = login(p.email(), PASSWORD);
        assertEquals("READ_ONLY", ((Map<?, ?>) s.raw().get("currentCompany")).get("accessMode"));

        json(s.token()).get("/business-days/calendar?year=2026&month=12").then().statusCode(200);
        json(s.token()).get("/me/subscription").then().statusCode(200);
        Response write = json(s.token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides");
        assertEquals(403, write.statusCode(), write.asString());
        assertEquals("COMPANY_READ_ONLY", write.jsonPath().getString("code"), write.asString());

        // outra pessoa grava normalmente
        json(other.session().token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides").then().statusCode(201);

        expect(setMode(operator, p.companyPublicId(), "ACTIVE"), 200);
        afterRevocation();
        Session back = login(p.email(), PASSWORD);
        json(back.token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides").then().statusCode(201);
    }

    @Test
    void aPersonalAccountCannotBeDisabledNorItsOwnerDeactivated() {
        Person p = newPerson("pf", false);
        Session operator = platformOperator();

        Response disable = setMode(operator, p.companyPublicId(), "DISABLED");
        assertEquals(409, disable.statusCode(), disable.asString());

        Response deactivate = json(operator.token()).body(Map.of("active", false))
                .patch("/users/" + p.session().publicId());
        assertEquals(409, deactivate.statusCode(), deactivate.asString());
        assertEquals("LAST_ADMIN_PROTECTED", deactivate.jsonPath().getString("code"), deactivate.asString());

        json(p.session().token()).get("/me/permissions").then().statusCode(200); // nada mudou
    }
}
