package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.ALFA;
import static br.com.seedgrid.app.api.e2e.E2eWorld.HOST_MASTER;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;

/**
 * P180.F2.T7: a caixa de notificacoes (seedgrid-user-notifications) funciona no tenant: a tabela existe no banco do tenant,
 * a entidade esta mapeada na unidade do tenant e as rotas da caixa respondem para o usuario logado.
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class UserNotificationsE2eTest extends E2eBase {

    static final String HOST_ALFA = host(ALFA);
    String admin;

    @BeforeAll
    void tenant() throws Exception {
        ensureTenant(ALFA);
        admin = adminToken(ALFA);
    }

    @Test
    void tabelaDaCaixaExisteNoBancoDoTenant() throws Exception {
        assertNotNull(text(db(ALFA), "select to_regclass('sg_user_notification')::text"));
    }

    @Test
    void listaEContagemDeNaoLidasRespondem200() {
        as(HOST_ALFA, admin).get("/user-notifications").then().statusCode(200);
        as(HOST_ALFA, admin).get("/user-notifications/unread-count").then().statusCode(200)
                .body("count", greaterThanOrEqualTo(0));
    }

    /** O admin da plataforma (banco master) tambem tem a caixa: e' ele quem pede os backups da plataforma. */
    @Test
    void caixaDoAdminDaPlataformaNoMasterResponde200() throws Exception {
        String master = masterToken();
        // o admin do bootstrap entra com troca de senha obrigatoria; a caixa nao e' o que se testa aqui
        masterExec("update sg_users set change_password_required = false where email = '" + E2eWorld.MASTER_EMAIL + "'");
        master = login(HOST_MASTER, E2eWorld.MASTER_EMAIL, E2eWorld.MASTER_PASSWORD);
        as(HOST_MASTER, master).get("/user-notifications").then().statusCode(200);
        as(HOST_MASTER, master).get("/user-notifications/unread-count").then().statusCode(200);
    }

    @Test
    void masterETenantTemATabelaDaCaixa() throws Exception {
        org.junit.jupiter.api.Assertions.assertNotNull(masterText("select to_regclass('sg_user_notification')::text"));
        assertNotNull(text(db(ALFA), "select to_regclass('sg_user_notification')::text"));
    }

    /** Com a entidade mapeada na unidade default, o export DOMAIN do master le a tabela: tem de terminar DONE. */
    @Test
    void exportDomainDoMasterTerminaDone() throws Exception {
        masterToken();
        masterExec("update sg_users set change_password_required = false where email = '" + E2eWorld.MASTER_EMAIL + "'");
        String master = login(HOST_MASTER, E2eWorld.MASTER_EMAIL, E2eWorld.MASTER_PASSWORD);
        String jobId = as(HOST_MASTER, master).contentType("application/json")
                .body(java.util.Map.of("format", "CSV_ZIP", "scope", "DOMAIN"))
                .post("/exports").then().statusCode(201).extract().path("jobId");
        String status = "";
        for (int i = 0; i < 60 && !status.equals("DONE") && !status.equals("FAILED"); i++) {
            Thread.sleep(500);
            status = as(HOST_MASTER, master).get("/exports/" + jobId).then().statusCode(200).extract().path("status");
        }
        org.junit.jupiter.api.Assertions.assertEquals("DONE", status, () -> {
            try {
                return masterText("select error_message from sg_export_jobs where public_id = '" + jobId + "'");
            } catch (Exception e) {
                return e.toString();
            }
        });
    }
}
