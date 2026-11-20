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
 * <p>O boilerplate NAO declara contador nenhum (BE-74): o produto declara so' os do SEU dominio. Sem
 * contadores, o produto cobra so' a assinatura e as telas de trial, condicoes comerciais e termos do plano
 * nao mostram bloco de uso. O codigo do contador e' a identidade dele para sempre (vai para o banco e para
 * o meter do Stripe): nao reaproveite o codigo de um contador removido para outro significado.</p>
 *
 * <pre>
 * public static final String CHAMADAS_API = "api-calls";
 * return List.of(new UsageMeterDefinition(CHAMADAS_API, "Chamadas de API"));
 * </pre>
 */
@ApplicationScoped
public class AppUsageMeters implements UsageMeterContributor {

    @Override
    public List<UsageMeterDefinition> meters() {
        return List.of();
    }
}
