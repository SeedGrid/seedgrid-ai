package br.com.seedgrid.app.api.boot;

import java.util.Map;

/**
 * Mesmo ambiente do {@link BootPostgresResource}, mas com o SDK do OpenTelemetry LIGADO (o padrao do build): e' o que o
 * {@link BackendJarStartsWithOtelIT} precisa para provar que o jar empacotado sobe com OTel.
 */
public class BootPostgresOtelOnResource extends BootPostgresResource {

    @Override
    public Map<String, String> start() {
        Map<String, String> config = super.start();
        config.put("quarkus.otel.sdk.disabled", "false");
        // sem coletor local: a exportacao falha em silencio, nao derruba a subida
        config.put("quarkus.otel.exporter.otlp.endpoint", "http://127.0.0.1:1");
        return config;
    }
}
