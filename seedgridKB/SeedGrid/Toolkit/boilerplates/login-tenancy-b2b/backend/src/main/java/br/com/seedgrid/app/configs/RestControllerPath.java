package br.com.seedgrid.app.configs;

/**
 * Rotas REST do produto (BE-31): o controller usa a base e os sub-paths; os testes de integracao usam os
 * {@code _FULL}. Nenhum controller escreve o caminho como literal.
 */
public final class RestControllerPath {

    private RestControllerPath() {
    }

    /** Base dos recursos de demonstracao. */
    public static final String DEMO = "/api/demo";
    /** Demo do PATCH parcial com JsonNullable ({@code ProfileDemoResource}). */
    public static final String DEMO_PROFILE = DEMO + "/profile";
    public static final String DEMO_PROFILE_FULL = DEMO_PROFILE;

}
