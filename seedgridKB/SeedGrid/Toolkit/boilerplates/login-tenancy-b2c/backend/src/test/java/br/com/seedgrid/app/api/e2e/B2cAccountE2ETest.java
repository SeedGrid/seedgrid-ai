package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E da conta de pessoa fisica: planos GRATIS/PREMIUM semeados, isolamento entre DUAS pessoas (empresa pessoal,
 * calendario, chave de API) e ausencia dos endpoints de equipe/convite (uma conta = uma pessoa).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2cAccountE2ETest extends E2eBase {

    @Test
    void personalDemoPlansAreSeededAndTheAccountStartsOnTheTrial() {
        Person p = newPerson("pf", false);
        json(p.session().token()).get("/me/plans").then().statusCode(200)
                .body("items.code", hasItem("GRATIS")).body("items.code", hasItem("PREMIUM"))
                .body("items.code", not(hasItem("BASICO"))).body("items.code", not(hasItem("PRO")));
        json(p.session().token()).get("/me/subscription").then().statusCode(200)
                .body("plan.code", equalTo("TRIAL")).body("planTerm.maxCompanies", equalTo(null));
        // plano gratis: sem preco; premium: com preco e excedente
        json(p.session().token()).get("/me/plans").then()
                .body("items.find { it.code == 'GRATIS' }.monthlyPrice", equalTo(0.0f))
                .body("items.find { it.code == 'PREMIUM' }.monthlyPrice", equalTo(29.9f));
    }

    @Test
    void twoPeopleNeverSeeEachOthersCompanyCalendarOrKeys() {
        Person a = newPerson("pf-a", false);
        Person b = newPerson("pf-b", true);

        json(a.session().token()).get("/me/companies").then().body("$", hasSize(1))
                .body("[0].publicId", equalTo(a.companyPublicId()));
        json(b.session().token()).get("/me/companies").then().body("$", hasSize(1))
                .body("[0].publicId", equalTo(b.companyPublicId()));
        int select = json(a.session().token()).body(Map.of("companyPublicId", b.companyPublicId()))
                .post("/me/select-company").statusCode();
        assertTrue(select == 403 || select == 404, "select-company de conta alheia: " + select);

        // calendario: "vai trabalhar" e' de cada pessoa
        String date = "2027-01-03";
        json(a.session().token()).body(Map.of("date", date, "weight", 1, "reason", "Plantao"))
                .post("/business-days/work-overrides").then().statusCode(201);
        json(a.session().token()).get("/business-days/check?date=" + date).then().body("businessDay", equalTo(true));
        json(b.session().token()).get("/business-days/check?date=" + date).then().body("businessDay", equalTo(false));
        json(b.session().token()).get("/business-days/work-overrides").then().body("date", not(hasItem(date)));

        // chave de API: cada uma so' abre a conta que a criou
        Response keyA = expect(json(a.session().token()).body(Map.of("name", "chave A", "expiresDays", 30))
                .post("/apikeys/role/INTEGRACAO_USUARIOS"), 201);
        String apiKeyA = keyA.jsonPath().getString("apiKey");
        String keyAId = keyA.jsonPath().getString("publicId");
        http().header("x-api-key", apiKeyA).get("/apikeys/me").then().statusCode(200)
                .body("roleName", equalTo("INTEGRACAO_USUARIOS")).body("ownerPublicId", equalTo(a.session().publicId()));
        json(b.session().token()).get("/apikeys").then().statusCode(200).body("publicId", not(hasItem(keyAId)));
        int revokeByB = json(b.session().token()).post("/apikeys/" + keyAId + "/revoke").statusCode();
        assertTrue(revokeByB == 403 || revokeByB == 404, "revogar chave alheia: " + revokeByB);
        json(a.session().token()).post("/apikeys/" + keyAId + "/revoke").then().statusCode(200);
        http().header("x-api-key", apiKeyA).get("/apikeys/me").then().statusCode(401);
    }

    /**
     * CONTRATO do produto B2C ("uma conta = uma pessoa; menu sem Usuarios/Convites/Perfis"): a API tambem nao deve
     * oferecer equipe nem convite. O b2c desliga
     * {@code seedgrid.security.self-enter.enabled/invite-enabled} e {@code seedgrid.security.account.enabled}
     * ({@code /me/security/*}) no {@code application.properties}. Ver COBERTURA.md.
     */
    @Test
    void teamAndInviteEndpointsAreAbsentInThePersonalProduct() {
        Person p = newPerson("pf", false);
        String token = p.session().token();
        Map<String, Integer> statuses = new java.util.LinkedHashMap<>();
        statuses.put("GET /me/security/users", json(token).get("/me/security/users").statusCode());
        statuses.put("GET /me/security/roles", json(token).get("/me/security/roles").statusCode());
        statuses.put("GET /self-enter/requests/to-approve", json(token).get("/self-enter/requests/to-approve").statusCode());
        statuses.put("POST /self-enter/invitations", json(token).body(Map.of("email", uniqueEmail("conv")))
                .post("/self-enter/invitations").statusCode());
        statuses.values().forEach(s -> assertEquals(404, s.intValue(), "esperado 404 (rota ausente): " + statuses));
    }
}
