package br.com.seedgrid.app.api.demo;

import java.util.LinkedHashMap;
import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import br.com.seedgrid.app.configs.RestControllerPath;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.groups.ConvertGroup;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * DOMINIO DE EXEMPLO do PATCH parcial com {@code JsonNullable} (BE-33). E' codigo para ser lido e copiado.
 *
 * <p>Um DTO de entrada so ({@link ProfileDemoRequest}): o POST valida com o grupo {@code Full}
 * ({@code @Valid @ConvertGroup(to = Full.class)}) e o PATCH com {@code @Valid} simples (so o que veio).</p>
 */
@Path(RestControllerPath.DEMO_PROFILE)
@Authenticated
@Tag(name = "Demo - PATCH parcial")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ProfileDemoResource {

    private final ProfileDemoService service;
    private final SecurityIdentity identity;

    public ProfileDemoResource(ProfileDemoService service, SecurityIdentity identity) {
        this.service = service;
        this.identity = identity;
    }

    @POST
    @Operation(summary = "Cria o perfil de exemplo (valida o grupo Full: o nome e' obrigatorio)")
    public Map<String, Object> create(@Valid @ConvertGroup(to = ProfileDemoRequest.Full.class) ProfileDemoRequest request) {
        return view(service.create(identity.getPrincipal().getName(), request));
    }

    @PATCH
    @Operation(summary = "Altera so o que veio: ausente nao muda, null limpa o opcional (400 no obrigatorio)")
    public Map<String, Object> patch(@Valid ProfileDemoRequest request) {
        return view(service.patch(identity.getPrincipal().getName(), request));
    }

    @GET
    @Operation(summary = "Le o perfil de exemplo")
    public Map<String, Object> get() {
        return view(service.find(identity.getPrincipal().getName()));
    }

    private static Map<String, Object> view(ProfileDemo profile) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("displayName", profile.getDisplayName());
        out.put("bio", profile.getBio());
        out.put("website", profile.getWebsite());
        return out;
    }
}
