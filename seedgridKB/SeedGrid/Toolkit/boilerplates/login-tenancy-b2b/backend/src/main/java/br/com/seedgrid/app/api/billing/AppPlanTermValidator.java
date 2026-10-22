package br.com.seedgrid.app.api.billing;

import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;

import br.com.seedgrid.billing.entities.PlanTerm;
import br.com.seedgrid.billing.exceptions.InvalidPlanTermAdditionalAttributesException;
import br.com.seedgrid.billing.spis.PlanTermAdditionalFieldsValidator;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Campos proprios DESTE produto no term que NAO sao contador de uso. Exemplo: {@code supportLevel}, o nivel
 * de suporte do plano ({@code standard} ou {@code priority}), opcional.
 *
 * <p>Franquia e excedente NAO vao aqui: sao condicao comercial de cada contador, nos {@code meters} do term
 * (ver {@link AppUsageMeters} e {@code docs/contadores-de-uso.md}).</p>
 */
@ApplicationScoped
public class AppPlanTermValidator implements PlanTermAdditionalFieldsValidator {

    public static final String SUPPORT_LEVEL = "supportLevel";
    private static final Set<String> SUPPORT_LEVELS = Set.of("standard", "priority");

    @Override
    public void validate(PlanTerm term, Map<String, JsonNode> attributes) {
        JsonNode supportLevel = attributes.get(SUPPORT_LEVEL);
        if (supportLevel != null && (!supportLevel.isTextual() || !SUPPORT_LEVELS.contains(supportLevel.asText()))) {
            throw new InvalidPlanTermAdditionalAttributesException(
                    SUPPORT_LEVEL + " deve ser um destes: " + SUPPORT_LEVELS + ".");
        }
    }
}
