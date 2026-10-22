package br.com.seedgrid.app.api.audit;

import java.security.KeyPairGenerator;
import java.sql.DriverManager;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

/** Usa PostgreSQL ja iniciado. Cria e remove somente o banco aleatorio desta execucao. */
public class AuditDatabaseResource implements QuarkusTestResourceLifecycleManager {
    private String database;
    private String baseUrl;
    private String username;
    private String password;

    @Override
    public Map<String, String> start() {
        baseUrl = System.getProperty("audit.test.jdbc.base", "jdbc:postgresql://localhost:5441");
        username = System.getProperty("audit.test.jdbc.username", "postgres");
        password = System.getProperty("audit.test.jdbc.password", "postgres");
        String prefix = "audittest" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        database = prefix + "_master";
        try {
            execute("CREATE DATABASE " + database);
            var generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            var pair = generator.generateKeyPair();
            Map<String, String> config = new HashMap<>();
            config.put("quarkus.datasource.jdbc.url", baseUrl + "/" + database);
            config.put("quarkus.datasource.username", username);
            config.put("quarkus.datasource.password", password);
            config.put("seedgrid.security.jwt.private-key-base64", Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded()));
            config.put("seedgrid.security.jwt.public-key-base64", Base64.getEncoder().encodeToString(pair.getPublic().getEncoded()));
            config.put("mp.jwt.verify.publickey", "-----BEGIN PUBLIC KEY-----\n"
                    + Base64.getEncoder().encodeToString(pair.getPublic().getEncoded()) + "\n-----END PUBLIC KEY-----");
            config.put("seedgrid.security.encryption.key", Base64.getEncoder().encodeToString(new byte[32]));
            config.put("seedgrid.audit.persistence.strategy", "jpa");
            config.put("seedgrid.whatsapp.api", "default");
            config.put("seedgrid.billing.stripe.product", "");
            config.put("quarkus.scheduler.start-mode", "halted");
            config.put("quarkus.http.test-port", "0");
            config.put("seedgrid.security.bootstrap.enabled", "false");
            config.put("seedgrid.app.email-alert.enabled", "false");
            config.put("quarkus.otel.sdk.disabled", "true");
            return config;
        } catch (Exception e) {
            stop();
            throw new IllegalStateException("Nao foi possivel preparar o banco isolado de teste de auditoria", e);
        }
    }

    @Override
    public void stop() {
        if (database != null && database.matches("audittest[a-f0-9]{12}_master")) {
            try {
                execute("DROP DATABASE IF EXISTS " + database + " WITH (FORCE)");
            } catch (Exception e) {
                throw new IllegalStateException("Falha ao remover o banco de teste " + database, e);
            }
            database = null;
        }
    }

    private void execute(String sql) throws Exception {
        try (var connection = DriverManager.getConnection(baseUrl + "/postgres", username, password);
                var statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }
}
