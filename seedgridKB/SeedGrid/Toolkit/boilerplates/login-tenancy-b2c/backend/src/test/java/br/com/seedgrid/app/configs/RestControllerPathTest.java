package br.com.seedgrid.app.configs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.lang.reflect.Method;

import org.junit.jupiter.api.Test;

import br.com.seedgrid.app.api.demo.UsageDemoResource;
import jakarta.ws.rs.Path;

/** BE-31: o controller de demo declara os caminhos pelas constantes do {@link RestControllerPath}. */
class RestControllerPathTest {

    @Test
    void usageDemoResourceUsesTheCentralizedPaths() throws Exception {
        assertEquals(RestControllerPath.DEMO, UsageDemoResource.class.getAnnotation(Path.class).value());
        assertEquals(RestControllerPath.DEMO_REQUESTS, pathOf("request"));
        assertEquals(RestControllerPath.DEMO_FILES, pathOf("upload"));
    }

    @Test
    void fullPathsAreBasePlusSubPath() {
        assertEquals("/api/demo/requests", RestControllerPath.DEMO_REQUESTS_FULL);
        assertEquals("/api/demo/files", RestControllerPath.DEMO_FILES_FULL);
    }

    private static String pathOf(String methodName) {
        for (Method m : UsageDemoResource.class.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                Path path = m.getAnnotation(Path.class);
                assertNotNull(path, methodName + " sem @Path");
                return path.value();
            }
        }
        throw new AssertionError("metodo nao encontrado: " + methodName);
    }
}
