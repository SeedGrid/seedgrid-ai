package br.com.seedgrid.app.api.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.exceptions.InvalidUserAdditionalAttributesException;

class AppUserAdditionalFieldsValidatorTest {
    private final AppUserAdditionalFieldsValidator validator = new AppUserAdditionalFieldsValidator();
    private final JsonNodeFactory json = JsonNodeFactory.instance;
    private final User user = new User();

    @Test
    void acceptsMissingNullAndEmptyCargo() {
        assertDoesNotThrow(() -> validator.validate(user, null));
        assertDoesNotThrow(() -> validator.validate(user, Map.of()));
        assertDoesNotThrow(() -> validator.validate(user, Map.of("cargo", json.nullNode())));
        assertDoesNotThrow(() -> validator.validate(user, Map.of("cargo", json.textNode(""))));
    }

    @Test
    void acceptsTextUpToTheLimitAndOtherProductAttributes() {
        assertDoesNotThrow(() -> validator.validate(user, Map.of("cargo", json.textNode("Gerente de operações"))));
        assertDoesNotThrow(() -> validator.validate(user, Map.of(
                "cargo", json.textNode("a".repeat(100)), "outroCampo", json.objectNode())));
    }

    @Test
    void rejectsCargoOverTheLimit() {
        assertThrows(InvalidUserAdditionalAttributesException.class,
                () -> validator.validate(user, Map.of("cargo", json.textNode("a".repeat(101)))));
    }

    @Test
    void rejectsNonTextValues() {
        for (JsonNode value : new JsonNode[] {
                json.numberNode(123), json.booleanNode(true), json.objectNode(), json.arrayNode() }) {
            assertThrows(InvalidUserAdditionalAttributesException.class,
                    () -> validator.validate(user, Map.of("cargo", value)));
        }
    }
}
