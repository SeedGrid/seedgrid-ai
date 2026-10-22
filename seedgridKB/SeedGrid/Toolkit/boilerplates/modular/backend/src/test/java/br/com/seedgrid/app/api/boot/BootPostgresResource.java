package br.com.seedgrid.app.api.boot;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.testcontainers.containers.PostgreSQLContainer;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

/**
 * Postgres real (Testcontainers, porta aleatoria) e um par RSA gerado na hora para o teste que prova que o backend
 * sobe. As chaves JWT nao sao versionadas (cada clone gera o seu par); aqui elas vivem so numa pasta temporaria.
 */
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

        KeyPair rsa = generateRsa();
        Path dir = createTempDirectory();
        config.put("seedgrid.security.jwt.private-key-location",
                write(dir.resolve("private.pem"), "PRIVATE KEY", rsa.getPrivate().getEncoded()));
        config.put("seedgrid.security.jwt.public-key-location",
                write(dir.resolve("public.pem"), "PUBLIC KEY", rsa.getPublic().getEncoded()));
        return config;
    }

    private static Path createTempDirectory() {
        try {
            return Files.createTempDirectory("modular-boot-keys");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String write(Path file, String type, byte[] der) {
        String body = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.US_ASCII)).encodeToString(der);
        try {
            Files.writeString(file, "-----BEGIN " + type + "-----\n" + body + "\n-----END " + type + "-----\n");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        file.toFile().deleteOnExit();
        return file.toAbsolutePath().toString();
    }

    private static KeyPair generateRsa() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public void stop() {
        postgres.stop();
    }
}
