package br.com.seedgrid.app.api.e2e;

import java.util.Map;

import io.quarkus.test.junit.QuarkusTestProfile;

/**
 * Perfil padrao da bateria: o padrao do produto (auth proativa ligada) mais o header de tenant e os termos exigidos.
 * O perfil {@link E2eProactiveOffProfile} repete as provas de JWT/API key com a autenticacao proativa desligada.
 */
public class E2eProfile implements QuarkusTestProfile {

    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
                "seedgrid.subdomain-tenancy.domain-suffix", E2eWorld.SUFFIX,
                // o header, quando configurado, VENCE o Host na escolha do banco (QuarkusTenantResolver)
                "seedgrid.subdomain-tenancy.tenant-header", "X-Tenant",
                "quarkus.http.auth.proactive", "true",
                "seedgrid.security.terms.required", "true",
                "seedgrid.security.terms.version", "2026-10",
                "seedgrid.security.terms.documents.terms", "https://example.test/termos",
                "seedgrid.security.terms.documents.privacy", "https://example.test/privacidade");
    }
}
