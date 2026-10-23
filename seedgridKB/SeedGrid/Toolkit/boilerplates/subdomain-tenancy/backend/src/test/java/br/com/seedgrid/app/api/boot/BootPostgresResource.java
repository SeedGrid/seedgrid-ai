package br.com.seedgrid.app.api.boot;

import java.security.KeyPairGenerator;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.testcontainers.containers.PostgreSQLContainer;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

/** Postgres real (Testcontainers, porta aleatoria) para o teste que prova que o backend sobe. */
public class BootPostgresResource implements QuarkusTestResourceLifecycleManager {

    @SuppressWarnings("resource")
    private final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("boilerplate_boot")
            .withUsername("test")
            .withPassword("test");

    @Override
    public Map<String, String> start() {
        postgres.start();
        Map<String, String> config = new HashMap<>();
        config.put("quarkus.datasource.jdbc.url", postgres.getJdbcUrl());
        config.put("quarkus.datasource.username", postgres.getUsername());
        config.put("quarkus.datasource.password", postgres.getPassword());
        String base = "jdbc:postgresql://" + postgres.getHost() + ":" + postgres.getFirstMappedPort();
        config.put("seedgrid.subdomain-tenancy.master.datasource.jdbc.url", postgres.getJdbcUrl());
        config.put("seedgrid.subdomain-tenancy.master.datasource.username", postgres.getUsername());
        config.put("seedgrid.subdomain-tenancy.master.datasource.password", postgres.getPassword());
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url", base);
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.username", postgres.getUsername());
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.password", postgres.getPassword());
        // Segredos sem valor padrao no application.properties (falha rapida de proposito): o teste os fornece.
        try {
            var generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            var pair = generator.generateKeyPair();
            String pub = Base64.getEncoder().encodeToString(pair.getPublic().getEncoded());
            config.put("seedgrid.security.jwt.private-key-base64",
                    Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded()));
            config.put("seedgrid.security.jwt.public-key-base64", pub);
            config.put("mp.jwt.verify.publickey", "-----BEGIN PUBLIC KEY-----\n" + pub + "\n-----END PUBLIC KEY-----");
        } catch (Exception e) {
            throw new IllegalStateException("Nao foi possivel gerar as chaves JWT de teste", e);
        }
        config.put("seedgrid.security.encryption.key", Base64.getEncoder().encodeToString(new byte[32]));
        config.put("seedgrid.subdomain-tenancy.product-prefix", "boottest");
        config.put("seedgrid.subdomain-tenancy.admin-user.name", "Boot Test");
        config.put("seedgrid.subdomain-tenancy.admin-user.email", "boot-test@example.invalid");
        config.put("seedgrid.subdomain-tenancy.admin-user.initial-password", "Qx7!mZ2026-Lp");
        config.put("seedgrid.whatsapp.api", "default");
        config.put("seedgrid.billing.stripe.product", "");
        config.put("seedgrid.security.bootstrap.enabled", "false");
        config.put("seedgrid.app.email-alert.enabled", "false");
        config.put("quarkus.otel.sdk.disabled", "true");
        config.put("quarkus.http.test-port", "0");
        config.put("quarkus.scheduler.start-mode", "halted");
        return config;
    }

    @Override
    public void stop() {
        postgres.stop();
    }
}
