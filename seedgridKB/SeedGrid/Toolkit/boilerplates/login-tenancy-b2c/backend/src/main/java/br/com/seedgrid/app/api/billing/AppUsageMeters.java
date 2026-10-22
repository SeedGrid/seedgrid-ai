package br.com.seedgrid.app.api.billing;

import java.util.List;

import br.com.seedgrid.billing.spis.UsageMeterContributor;
import br.com.seedgrid.billing.spis.UsageMeterDefinition;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * O QUE ESTE PRODUTO COBRA POR USO. E' o unico lugar em que o produto declara contadores: o billing guarda,
 * por plano e por contador, a franquia e o preco do excedente, e faz ciclo, bloqueio (402) e cobranca no
 * Stripe sozinho. Guia: {@code docs/contadores-de-uso.md}.
 *
 * <p>Os dois contadores sao EXEMPLOS, um para cada forma de contar (ver {@code UsageDemoResource}):</p>
 * <ul>
 *   <li>{@code requests}: uma chamada vale uma unidade, contada pela anotacao
 *       {@code @SgConsumesUsage(meter = AppUsageMeters.REQUESTS)};</li>
 *   <li>{@code storage-mb}: a quantidade so' se conhece em runtime (o tamanho do arquivo), contada pelo
 *       codigo com {@code UsageService.consume(...)}.</li>
 * </ul>
 *
 * <p>Troque pelos contadores do SEU produto. O codigo e' a identidade do contador para sempre (vai para o
 * banco e para o meter do Stripe): nao reaproveite o codigo de um contador removido para outro
 * significado.</p>
 */
@ApplicationScoped
public class AppUsageMeters implements UsageMeterContributor {

    public static final String REQUESTS = "requests";
    public static final String STORAGE_MB = "storage-mb";

    @Override
    public List<UsageMeterDefinition> meters() {
        return List.of(
                new UsageMeterDefinition(REQUESTS, "Requisicoes"),
                new UsageMeterDefinition(STORAGE_MB, "MB armazenados"));
    }
}
