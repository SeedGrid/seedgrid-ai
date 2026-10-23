package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;

/**
 * E2E do estado de acesso da empresa (ACTIVE / READ_ONLY / DISABLED), mudado pelo operador da plataforma por HTTP:
 * sessoes caem na hora, READ_ONLY deixa ler e bloqueia gravar (COMPANY_READ_ONLY), DISABLED recusa login/selecao/refresh
 * (COMPANY_DISABLED) e derruba chaves de API; a outra empresa nao e afetada; a conta nunca fica com todas desligadas; a
 * empresa da plataforma nao muda; e o cliente nao tem acesso ao endpoint.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bAccessStateE2ETest extends E2eBase {

    private Response setMode(Session operator, String companyPublicId, String mode) {
        return json(operator.token()).body(Map.of("mode", mode, "reason", "E2E " + mode))
                .put("/companies/" + companyPublicId + "/access-mode");
    }

    @Test
    void theCustomerCannotChangeItsOwnAccessMode() {
        Account a = newCompanyAccount("Alfa");
        json(a.session().token()).body(Map.of("mode", "READ_ONLY")).put("/companies/" + a.companyPublicId()
                + "/access-mode").then().statusCode(403);
        json(a.session().token()).get("/me/permissions").then().statusCode(200); // e a sessao segue intacta
    }

    @Test
    void readOnlyLetsTheAccountReadAndBlocksWritesWithoutTouchingTheOtherCompany() {
        Account a = newCompanyAccount("Alfa");
        Account b = newCompanyAccount("Beta");
        Session operator = platformOperator();

        expect(setMode(operator, a.companyPublicId(), "READ_ONLY"), 200)
                .then().body("accessMode", equalTo("READ_ONLY"));

        // a sessao antiga cai na hora; um novo login entra
        Response old = json(a.session().token()).get("/me/permissions");
        assertEquals(401, old.statusCode(), old.asString());
        assertEquals("SESSION_REVOKED", old.jsonPath().getString("code"));
        afterRevocation();
        Session s = login(a.email(), PASSWORD);
        assertEquals("READ_ONLY", ((Map<?, ?>) s.raw().get("currentCompany")).get("accessMode"));
        json(s.token()).get("/me/companies").then().statusCode(200).body("[0].accessMode", equalTo("READ_ONLY"));

        // ler pode; gravar nao (em dois modulos diferentes)
        json(s.token()).get("/me/security/users").then().statusCode(200);
        json(s.token()).get("/business-days/calendar?year=2026&month=12").then().statusCode(200);
        Response write = json(s.token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides");
        assertEquals(403, write.statusCode(), write.asString());
        assertEquals("COMPANY_READ_ONLY", write.jsonPath().getString("code"), write.asString());
        Response writeUser = json(s.token()).body(Map.of("email", uniqueEmail("x"), "name", "Maria Souza",
                "password", PASSWORD, "rolePublicIds", List.of(roleId(s, "ADMIN")))).post("/me/security/users");
        assertEquals(403, writeUser.statusCode(), writeUser.asString());
        assertEquals("COMPANY_READ_ONLY", writeUser.jsonPath().getString("code"), writeUser.asString());

        // a plataforma ve o estado e o motivo
        json(operator.token()).get("/companies/" + a.companyPublicId()).then().statusCode(200)
                .body("accessMode", equalTo("READ_ONLY")).body("accessModeReason", equalTo("E2E READ_ONLY"));

        // a outra empresa grava normalmente
        json(b.session().token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides").then().statusCode(201);

        // volta ao normal: novo login grava de novo
        expect(setMode(operator, a.companyPublicId(), "ACTIVE"), 200);
        afterRevocation();
        Session back = login(a.email(), PASSWORD);
        json(back.token()).body(Map.of("date", "2027-03-07", "weight", 1))
                .post("/business-days/work-overrides").then().statusCode(201);
    }

    @Test
    void disablingACompanyOfAMultiCompanyAccountCutsOnlyThatCompany() {
        Account a = newCompanyAccount("Matriz");
        String filial = linkAnotherCompany(a.email(), "Filial");
        Session operator = platformOperator();

        Session beforeLogin = sessionOf(loginRaw(a.email(), PASSWORD));
        Session onFilial = selectCompany(beforeLogin, filial);
        Response keyOnFilial = expect(json(onFilial.token()).body(Map.of("name", "chave da filial", "expiresDays", 30))
                .post("/apikeys/role/INTEGRACAO_USUARIOS"), 201);
        String apiKey = keyOnFilial.jsonPath().getString("apiKey");
        http().header("x-api-key", apiKey).get("/me/security/users").then().statusCode(200);

        expect(setMode(operator, filial, "DISABLED"), 200).then().body("accessMode", equalTo("DISABLED"));

        // sessao da filial cai; a chave de API dela tambem deixa de valer
        Response old = json(onFilial.token()).get("/me/permissions");
        assertEquals(401, old.statusCode(), old.asString());
        int keyStatus = http().header("x-api-key", apiKey).get("/me/security/users").statusCode();
        assertTrue(keyStatus == 401 || keyStatus == 403, "chave de empresa desligada: " + keyStatus);

        afterRevocation();
        Response relogin = loginRaw(a.email(), PASSWORD);
        Session unscoped = sessionOf(relogin);
        json(unscoped.token()).get("/me/companies").then().statusCode(200)
                .body("find { it.publicId == '" + filial + "' }.accessMode", equalTo("DISABLED"))
                .body("find { it.publicId == '" + a.companyPublicId() + "' }.accessMode", equalTo("ACTIVE"));

        // selecionar a desligada e recusado (COMPANY_DISABLED); a matriz segue
        Response pick = json(unscoped.token()).body(Map.of("companyPublicId", filial)).post("/me/select-company");
        assertEquals(403, pick.statusCode(), pick.asString());
        assertEquals("COMPANY_DISABLED", pick.jsonPath().getString("code"), pick.asString());
        Session matriz = selectCompany(unscoped, a.companyPublicId());
        json(matriz.token()).get("/me/security/users").then().statusCode(200);

        // refresh de uma sessao escopada na desligada e recusado
        Response refresh = json().body(Map.of("refreshToken", onFilial.refreshToken())).post("/public/auth/refresh");
        assertTrue(refresh.statusCode() == 401 || refresh.statusCode() == 403, "refresh: " + refresh.statusCode());

        // reativar devolve o acesso
        expect(setMode(operator, filial, "ACTIVE"), 200);
        afterRevocation();
        Session again = selectCompany(sessionOf(loginRaw(a.email(), PASSWORD)), filial);
        json(again.token()).get("/me/security/users").then().statusCode(200);
    }

    @Test
    void theAccountNeverEndsUpWithEveryCompanyDisabled() {
        Account a = newCompanyAccount("Unica");
        Session operator = platformOperator();

        // empresa unica: desligar deixaria a conta sem nenhuma ativa
        Response only = setMode(operator, a.companyPublicId(), "DISABLED");
        assertEquals(409, only.statusCode(), only.asString());
        json(a.session().token()).get("/me/permissions").then().statusCode(200); // nada mudou, sessao intacta

        // duas empresas: a segunda pode, a ultima nao
        String filial = linkAnotherCompany(a.email(), "Filial");
        expect(setMode(operator, filial, "DISABLED"), 200);
        Response last = setMode(operator, a.companyPublicId(), "DISABLED");
        assertEquals(409, last.statusCode(), last.asString());
        // somente leitura da ultima ativa e' permitido
        expect(setMode(operator, a.companyPublicId(), "READ_ONLY"), 200);
    }

    @Test
    void thePlatformCompanyItselfNeverChangesMode() {
        Session operator = platformOperator();
        String platformCompany = operator.currentCompanyPublicId();
        for (String mode : List.of("READ_ONLY", "DISABLED")) {
            int status = setMode(operator, platformCompany, mode).statusCode();
            assertTrue(status >= 400 && status < 500, "empresa da plataforma em " + mode + ": " + status);
        }
        json(operator.token()).get("/me/permissions").then().statusCode(200);
        json(operator.token()).get("/companies/" + platformCompany).then().body("accessMode", equalTo("ACTIVE"));
    }

    @Test
    void accessModeShowsUpInThePlatformCompanyList() {
        Account a = newCompanyAccount("Listada");
        Session operator = platformOperator();
        expect(setMode(operator, a.companyPublicId(), "READ_ONLY"), 200);
        json(operator.token()).get("/companies").then().statusCode(200)
                .body("find { it.publicId == '" + a.companyPublicId() + "' }.accessMode", equalTo("READ_ONLY"));
        expect(setMode(operator, a.companyPublicId(), "ACTIVE"), 200);
        json(operator.token()).get("/companies").then().body("accessMode", hasItem("ACTIVE"));
    }
}
