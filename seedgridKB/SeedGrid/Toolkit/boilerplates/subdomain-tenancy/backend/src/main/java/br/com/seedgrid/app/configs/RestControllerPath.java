package br.com.seedgrid.app.configs;

/**
 * Rotas REST do produto (BE-31): o controller usa a base e os sub-paths; os testes de integracao usam os
 * {@code _FULL}. Nenhum controller escreve o caminho como literal.
 */
public final class RestControllerPath {

    private RestControllerPath() {
    }

    /** Demo dos contadores de uso ({@code UsageDemoResource}). */
    public static final String DEMO = "/api/demo";
    public static final String DEMO_REQUESTS = "/requests";
    public static final String DEMO_FILES = "/files";
    /** Demo do PATCH parcial com JsonNullable ({@code ProfileDemoResource}). */
    public static final String DEMO_PROFILE = DEMO + "/profile";
    public static final String DEMO_PROFILE_FULL = DEMO_PROFILE;

    public static final String DEMO_REQUESTS_FULL = DEMO + DEMO_REQUESTS;
    public static final String DEMO_FILES_FULL = DEMO + DEMO_FILES;
}
