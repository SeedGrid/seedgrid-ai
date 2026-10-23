package br.com.seedgrid.app.api.e2e;

import java.util.Map;

import io.quarkus.test.junit.QuarkusTestProfile;

/** Mesmo cenario, com {@code quarkus.http.auth.proactive=false} (modo legado que alguns hosts ainda usam) e sem header de tenant. */
public class E2eProactiveOffProfile implements QuarkusTestProfile {

    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
                "seedgrid.subdomain-tenancy.domain-suffix", E2eWorld.SUFFIX,
                "quarkus.http.auth.proactive", "false");
    }
}
