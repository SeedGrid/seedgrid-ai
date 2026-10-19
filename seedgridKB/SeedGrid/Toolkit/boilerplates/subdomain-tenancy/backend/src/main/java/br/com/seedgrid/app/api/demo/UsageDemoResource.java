package br.com.seedgrid.app.api.demo;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import br.com.seedgrid.app.api.billing.AppUsageMeters;
import br.com.seedgrid.billing.annotations.ConsumesUsage;
import br.com.seedgrid.billing.annotations.RequiresPlanFeature;
import br.com.seedgrid.billing.entities.Account;
import br.com.seedgrid.billing.services.UsageService;
import br.com.seedgrid.billing.spis.CurrentAccountResolver;
import io.quarkus.security.Authenticated;
import io.quarkus.security.PermissionsAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * DOMINIO DE EXEMPLO: as duas formas de contar uso. E' codigo para ser lido e copiado; troque pelo trabalho
 * de verdade do seu produto. Guia: {@code docs/contadores-de-uso.md}.
 *
 * <p>Em ambos os casos o billing checa ANTES (o trabalho nem roda se a conta nao pode consumir: 402 com o
 * {@code code} do motivo) e contabiliza DEPOIS, so' se deu certo, dentro da transacao do metodo.</p>
 *
 * <p>Acesso: o perfil precisa de {@code USAGE_DEMO_READ} (marcavel no editor de perfis) E o plano da conta
 * precisa liberar a feature ({@code @RequiresPlanFeature}, editavel no admin). Seed: V3002.</p>
 */
@Path("/api/demo")
@Authenticated
@Tag(name = "Demo - contadores de uso")
@Produces(MediaType.APPLICATION_JSON)
public class UsageDemoResource {

    public static final String USAGE_DEMO_READ = "USAGE_DEMO_READ";
    private static final long BYTES_PER_MB = 1024L * 1024L;

    private final CurrentAccountResolver currentAccountResolver;
    private final UsageService usageService;

    public UsageDemoResource(CurrentAccountResolver currentAccountResolver, UsageService usageService) {
        this.currentAccountResolver = currentAccountResolver;
        this.usageService = usageService;
    }

    /**
     * Forma 1, DECLARATIVA: uma chamada vale uma unidade de {@code requests}. Toda a cobranca e' a anotacao.
     */
    @POST
    @Path("/requests")
    @PermissionsAllowed(USAGE_DEMO_READ)
    @RequiresPlanFeature(USAGE_DEMO_READ)
    @ConsumesUsage(meter = AppUsageMeters.REQUESTS)
    @Operation(summary = "Faz uma requisicao de exemplo (consome 1 requisicao)")
    public Map<String, Object> request() {
        return Map.of("status", "DONE", "at", Instant.now());
    }

    /**
     * Forma 2, PROGRAMATICA: a quantidade ({@code storage-mb}) so' se conhece com o arquivo na mao, entao a
     * anotacao nao resolve. O exemplo nao guarda o arquivo: so' mede e conta.
     */
    @POST
    @Path("/files")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @PermissionsAllowed(USAGE_DEMO_READ)
    @RequiresPlanFeature(USAGE_DEMO_READ)
    @Transactional
    @Operation(summary = "Envia um arquivo de exemplo (consome o tamanho em MB, arredondado para cima)")
    public Map<String, Object> upload(@RestForm("file") FileUpload file) {
        if (file == null || file.size() <= 0) {
            throw new BadRequestException("Envie um arquivo no campo 'file'.");
        }
        int mb = (int) Math.max(1, (file.size() + BYTES_PER_MB - 1) / BYTES_PER_MB);
        Account account = currentAccountResolver.requireCurrentAccount();
        usageService.assertCanConsume(account, AppUsageMeters.STORAGE_MB, mb);
        // ... aqui o produto gravaria o arquivo ...
        usageService.consume(account, AppUsageMeters.STORAGE_MB, mb, "upload-" + UUID.randomUUID());
        return Map.of("status", "STORED", "fileName", file.fileName(), "storedMb", mb);
    }
}
