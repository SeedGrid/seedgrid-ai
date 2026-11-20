package br.com.seedgrid.app.api.e2e;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;

/**
 * P180.F2.T7: a caixa de notificacoes (seedgrid-user-notifications) esta instalada e mapeada no produto: as rotas da caixa
 * respondem para o usuario logado (entidade na unidade de persistencia e tabela migrada).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
class B2bUserNotificationsE2ETest extends E2eBase {

    @Test
    void listaEContagemDeNaoLidasRespondem200() {
        Account a = newCompanyAccount("Alfa");
        json(a.session().token()).get("/user-notifications").then().statusCode(200);
        json(a.session().token()).get("/user-notifications/unread-count").then().statusCode(200)
                .body("count", greaterThanOrEqualTo(0));
    }
}
