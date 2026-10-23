package br.com.seedgrid.app.api.boot;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import java.net.URL;

import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusIntegrationTest;

/**
 * GUARDIAO DA SUBIDA DO JAR EMPACOTADO COM OPENTELEMETRY LIGADO - NAO ALTERAR, ENFRAQUECER NEM DESABILITAR sem decisao
 * explicita do dono.
 *
 * <p><b>O que protege:</b> o {@code target/quarkus-app/quarkus-run.jar} (build PADRAO, sem
 * {@code -Dquarkus.otel.enabled=false}) sobe com o SDK do OpenTelemetry ligado e responde {@code /q/health/live} com
 * {@code UP} (liveness: o readiness inclui o Mongo da auditoria, que nao existe neste teste). Roda na fase {@code verify} (failsafe), contra o jar de verdade.</p>
 * <p><b>Por que existe:</b> o jar abortava com "GlobalOpenTelemetry.set has already been called" (inicializador estatico de
 * {@code TenantMigrationCoordinator} chamava {@code GlobalOpenTelemetry.getTracer} antes de o Quarkus registrar o SDK).
 * O {@link BackendStartsGuardianTest} ({@code @QuarkusTest}) nao pega: no modo de teste a ordem muda (achado pelo E2E de
 * navegador, BUG-3).</p>
 * <p><b>Dano se quebrar:</b> o produto nao sobe em producao com a observabilidade ligada.</p>
 * Rodar: {@code mvn verify} (precisa do Docker/Podman para o Postgres).
 */
@QuarkusIntegrationTest
@QuarkusTestResource(value = BootPostgresOtelOnResource.class, restrictToAnnotatedClass = true)
class BackendJarStartsWithOtelIT {

    @TestHTTPResource
    URL appUrl;

    @Test
    void packagedJarBootsWithOpenTelemetryOnAndHealthIsUp() {
        given().baseUri("http://localhost").port(appUrl.getPort())
                .when().get("/q/health/live")
                .then().statusCode(200)
                .body("status", equalTo("UP"));
    }
}
