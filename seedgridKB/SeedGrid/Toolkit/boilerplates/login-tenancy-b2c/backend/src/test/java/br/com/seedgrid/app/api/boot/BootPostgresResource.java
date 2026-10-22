package br.com.seedgrid.app.api.boot;

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
        config.put("quarkus.http.test-port", "0");
        config.put("quarkus.scheduler.start-mode", "halted");
        return config;
    }

    @Override
    public void stop() {
        postgres.stop();
    }
}
