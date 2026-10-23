package br.com.seedgrid.app.api.e2e;

import java.util.Map;

import br.com.seedgrid.commons.web.annotations.QUERY;
import br.com.seedgrid.security.annotations.SgReadOnlySafe;
import br.com.seedgrid.security.entities.CompanyAccessMode;
import br.com.seedgrid.security.services.CompanyAccessService;
import io.quarkus.security.Authenticated;
import io.quarkus.security.PermissionsAllowed;
import io.smallrye.common.annotation.Blocking;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * Recurso SO DE TESTE da bateria E2E (vive em src/test, nao vai para o produto). O boilerplate nao tem endpoint de
 * negocio proprio com permissao, metodo de escrita, {@code QUERY} ou {@code @SgReadOnlySafe}; esta sonda da' um alvo
 * a cada regra da plataforma e devolve o NOME DO BANCO que atendeu a requisicao (prova de qual tenant respondeu).
 */
@Path("/probe")
@Blocking
public class E2eProbeResource {

    @Inject
    EntityManager em;

    @Inject
    CompanyAccessService companyAccess;

    /**
     * Muda o estado de acesso da empresa NO TENANT do Host, como o billing faria (o servico precisa de uma requisicao
     * real para o tenant ser resolvido). Rota publica de proposito: so' existe em teste.
     */
    @POST
    @Path("/public/access-mode/{companyPublicId}/{mode}")
    @PermitAll
    @Produces(MediaType.TEXT_PLAIN)
    public String setAccessMode(@PathParam("companyPublicId") String companyPublicId,
            @PathParam("mode") CompanyAccessMode mode) {
        companyAccess.setMode(companyPublicId, mode, "e2e");
        return mode.name();
    }

    /** Qualquer credencial valida (JWT ou API key). */
    @GET
    @Path("/me")
    @Authenticated
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String authenticated() {
        return currentDatabase();
    }

    /** Sem autenticacao: mostra qual banco a resolucao de tenant escolheu. */
    @GET
    @Path("/public/anon")
    @PermitAll
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String anonymous() {
        return currentDatabase();
    }

    /** Permissao que so' a role ADMIN do tenant alfa recebe (vazamento do cache de RBAC entre tenants). */
    @GET
    @Path("/only-alfa")
    @PermissionsAllowed("PROBE_ALFA")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String onlyAlfa() {
        return currentDatabase();
    }

    /** Permissao que so' a role ADMIN do tenant beta recebe. */
    @GET
    @Path("/only-beta")
    @PermissionsAllowed("PROBE_BETA")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String onlyBeta() {
        return currentDatabase();
    }

    /** Leitura com a permissao da role de integracao de teste. */
    @GET
    @Path("/permission")
    @PermissionsAllowed("PROBE_READ")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String withPermission() {
        return currentDatabase();
    }

    /** Escrita (POST/PUT/DELETE): READ_ONLY barra, ACTIVE passa. */
    @POST
    @Path("/write")
    @PermissionsAllowed("PROBE_READ")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String write() {
        return currentDatabase();
    }

    @PUT
    @Path("/write")
    @PermissionsAllowed("PROBE_READ")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String put() {
        return currentDatabase();
    }

    @DELETE
    @Path("/write")
    @PermissionsAllowed("PROBE_READ")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String delete() {
        return currentDatabase();
    }

    /** POST que o autor declarou seguro: passa mesmo com a empresa em somente leitura. */
    @POST
    @Path("/safe")
    @SgReadOnlySafe
    @PermissionsAllowed("PROBE_READ")
    @Transactional
    @Produces(MediaType.TEXT_PLAIN)
    public String safe() {
        return currentDatabase();
    }

    /** QUERY (leitura com corpo): metodo seguro, passa em somente leitura sem anotacao. */
    @QUERY
    @Path("/search")
    @PermissionsAllowed("PROBE_READ")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Object> search(Map<String, Object> filter) {
        return Map.of("method", "QUERY", "echo", filter == null ? Map.of() : filter);
    }

    private String currentDatabase() {
        return (String) em.createNativeQuery("select current_database()").getSingleResult();
    }
}
