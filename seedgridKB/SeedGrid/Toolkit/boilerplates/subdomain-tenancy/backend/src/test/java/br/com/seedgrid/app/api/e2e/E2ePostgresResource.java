package br.com.seedgrid.app.api.e2e;

import java.security.KeyPairGenerator;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.testcontainers.containers.PostgreSQLContainer;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

/**
 * Postgres real (Testcontainers, porta aleatoria) da bateria E2E. Mesmo padrao do {@code BootPostgresResource}
 * (master e bancos dos tenants no mesmo container; chaves JWT geradas na hora; segredos que nao tem valor padrao),
 * mais os mailers mockados (o cadastro do tenant envia e-mail).
 */
public class E2ePostgresResource implements QuarkusTestResourceLifecycleManager {

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
        String base = "jdbc:postgresql://" + postgres.getHost() + ":" + postgres.getFirstMappedPort();
        config.put("seedgrid.subdomain-tenancy.master.datasource.jdbc.url", postgres.getJdbcUrl());
        config.put("seedgrid.subdomain-tenancy.master.datasource.username", postgres.getUsername());
        config.put("seedgrid.subdomain-tenancy.master.datasource.password", postgres.getPassword());
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.jdbc.url", base);
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.username", postgres.getUsername());
        config.put("seedgrid.subdomain-tenancy.tenant.datasource.password", postgres.getPassword());
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
        config.put("seedgrid.subdomain-tenancy.product-prefix", "e2e");
        config.put("seedgrid.subdomain-tenancy.admin-user.name", "Master Admin");
        config.put("seedgrid.subdomain-tenancy.admin-user.email", E2eWorld.MASTER_EMAIL);
        config.put("seedgrid.subdomain-tenancy.admin-user.initial-password", E2eWorld.MASTER_PASSWORD);
        config.put("seedgrid.whatsapp.api", "default");
        config.put("seedgrid.billing.stripe.product", "");
        config.put("seedgrid.security.bootstrap.enabled", "false");
        config.put("seedgrid.app.email-alert.enabled", "false");
        config.put("quarkus.otel.sdk.disabled", "true");
        config.put("quarkus.http.test-port", "0");
        // os agendadores reais (inadimplencia, cotacao, pricing) ficam parados: a bateria chama o ciclo a mao
        config.put("quarkus.scheduler.start-mode", "halted");
        config.put("quarkus.mailer.mock", "true");
        config.put("quarkus.mailer.\"subdomaintenancy\".mock", "true");
        config.put("quarkus.mailer.\"security\".mock", "true");
        config.put("quarkus.mailer.\"billing\".mock", "true");
        return config;
    }

    @Override
    public void stop() {
        postgres.stop();
    }
}
