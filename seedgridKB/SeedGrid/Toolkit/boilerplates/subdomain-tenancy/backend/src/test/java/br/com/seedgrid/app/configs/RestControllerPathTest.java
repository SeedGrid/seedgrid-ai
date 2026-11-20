package br.com.seedgrid.app.configs;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import br.com.seedgrid.app.api.demo.ProfileDemoResource;
import jakarta.ws.rs.Path;

/** BE-31: o controller de demo declara os caminhos pelas constantes do {@link RestControllerPath}. */
class RestControllerPathTest {

    @Test
    void profileDemoResourceUsesTheCentralizedPath() {
        assertEquals(RestControllerPath.DEMO_PROFILE, ProfileDemoResource.class.getAnnotation(Path.class).value());
    }

    @Test
    void fullPathIsBasePlusSubPath() {
        assertEquals("/api/demo/profile", RestControllerPath.DEMO_PROFILE_FULL);
    }
}
