package br.com.seedgrid.app.api.boot;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import java.net.URL;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;

/**
 * GUARDIAO DA SUBIDA DO BACKEND DO BOILERPLATE - NAO ALTERAR, ENFRAQUECER NEM DESABILITAR sem decisao explicita do dono.
 *
 * <p><b>O que protege:</b> o backend do boilerplate {@code login-tenancy} sobe de verdade (contexto CDI completo, Flyway
 * nas migrations de todas as extensions, Postgres real via Testcontainers) e responde {@code /q/health} com
 * {@code UP}.</p>
 * <p><b>Por que existe:</b> o {@code sg-new-product} gera produtos a partir deste backend. Os testes anteriores eram
 * unitarios ou {@code @EnabledIfSystemProperty} (ficavam {@code Skipped}) e nao provavam a subida: faltar um bean
 * (ex.: {@code SeedGridCacheProvider}, {@code CurrentUserProvider}, {@code UserContactProvider}) so aparecia ao rodar
 * o produto gerado (T7.6, reportado em 2026-10-20).</p>
 * <p><b>Dano se quebrar:</b> todo produto novo nasce com um backend que nao inicia.</p>
 */
@QuarkusTest
@QuarkusTestResource(value = BootPostgresResource.class, restrictToAnnotatedClass = true)
class BackendStartsGuardianTest {

    @TestHTTPResource
    URL appUrl;

    @Test
    void backendBootsAndHealthIsUp() {
        given().baseUri("http://localhost").port(appUrl.getPort())
                .when().get("/q/health")
                .then().statusCode(200)
                .body("status", equalTo("UP"));
    }
}
