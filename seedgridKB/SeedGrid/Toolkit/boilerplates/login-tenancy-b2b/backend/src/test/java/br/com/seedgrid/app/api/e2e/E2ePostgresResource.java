package br.com.seedgrid.app.api.e2e;

import java.util.HashMap;
import java.util.Map;

import org.testcontainers.containers.PostgreSQLContainer;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

/**
 * Postgres real (Testcontainers, porta aleatoria) e configuracao de teste da bateria E2E do boilerplate: administrador
 * da plataforma semeado pelo bootstrap, limites de taxa desligados (a bateria faz dezenas de logins e cadastros em
 * segundos) e e-mail simulado. O restante vem do {@code application.properties} real do produto.
 */
public class E2ePostgresResource implements QuarkusTestResourceLifecycleManager {

    public static final String PLATFORM_ADMIN_EMAIL = "plataforma@e2e.test";
    public static final String PLATFORM_ADMIN_PASSWORD = "Plataforma@Qx7";

    @SuppressWarnings("resource")
    private final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("boilerplate_e2e")
            .withUsername("test")
            .withPassword("test");

    @Override
    public Map<String, String> start() {
        postgres.start();
        Map<String, String> config = new HashMap<>();
        config.put("quarkus.datasource.jdbc.url", postgres.getJdbcUrl());
        config.put("quarkus.datasource.username", postgres.getUsername());
        config.put("quarkus.datasource.password", postgres.getPassword());
        config.put("quarkus.http.test-port", "0");
        config.put("quarkus.scheduler.start-mode", "halted");
        config.put("quarkus.mailer.mock", "true");
        config.put("quarkus.mailer.\"security\".mock", "true");

        config.put("seedgrid.security.first-admin-user.email", PLATFORM_ADMIN_EMAIL);
        config.put("seedgrid.security.first-admin-user.name", "Plataforma E2E");
        config.put("seedgrid.security.first-admin-user.whatsapp", "5511999990000");
        config.put("seedgrid.security.first-admin-user.initial-password", PLATFORM_ADMIN_PASSWORD);

        for (String key : new String[] { "login", "signup", "signup-confirm-email", "signup-document-status",
                "signup-email-exists", "signup-personal", "signup-resend-email", "user-activation-resend",
                "auth-refresh", "auth-confirm-email", "forgot-password", "auth-reset-password", "billing-checkout",
                "billing-portal", "social-confirm-email", "social-email", "self-enter-request" }) {
            config.put("seedgrid.ratelimit." + key + ".enabled", "false");
        }
        config.putAll(extra());
        return config;
    }

    /** Ponto de extensao: o b2c acrescenta suas chaves. */
    protected Map<String, String> extra() {
        return Map.of();
    }

    @Override
    public void stop() {
        postgres.stop();
    }
}
