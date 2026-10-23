package br.com.seedgrid.app.api.e2e;

/** Constantes compartilhadas da bateria E2E (hosts, senhas). Estado vivo fica em {@link E2eBase}. */
public final class E2eWorld {

    /** Sufixo de dominio do produto no teste: {@code <tenant>.crm.seedgrid.com.br}; o sufixo puro e' o MASTER. */
    public static final String SUFFIX = "crm.seedgrid.com.br";
    public static final String HOST_MASTER = SUFFIX;

    public static final String MASTER_EMAIL = "master-admin@e2e.test";
    public static final String MASTER_PASSWORD = "Mst@Pa5k2026x";
    public static final String PASSWORD = "Teste@123456";

    /**
     * Tenants do cenario (um por grupo de testes que muda estado, para um teste nao sujar o outro): alfa (SP) e beta
     * (RJ) para isolamento, sessao e calendario; gama para o estado de acesso; delta para invariante do ADMIN e cadastro
     * de usuario com empresas; epsilon para empresas CRU, limites, downgrade e inadimplencia.
     */
    public static final String ALFA = "empalfa";
    public static final String BETA = "empbeta";
    public static final String GAMA = "empgama";
    public static final String DELTA = "empdelt";
    public static final String EPSILON = "empepsi";

    public static String host(String subdomain) {
        return subdomain + "." + SUFFIX;
    }

    private E2eWorld() {
    }
}
