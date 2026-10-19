package br.com.seedgrid.app.api.security;

import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;

import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.exceptions.InvalidUserAdditionalAttributesException;
import br.com.seedgrid.security.spi.UserAdditionalFieldsValidator;
import jakarta.enterprise.context.ApplicationScoped;

/** Exemplo de atributo do produto, persistido no JSONB de User pela extensão Security. */
@ApplicationScoped
public class AppUserAdditionalFieldsValidator implements UserAdditionalFieldsValidator {

    public static final String CARGO = "cargo";
    public static final int CARGO_MAX_LENGTH = 100;

    @Override
    public void validate(User user, Map<String, JsonNode> additionalAttributes) {
        JsonNode cargo = additionalAttributes == null ? null : additionalAttributes.get(CARGO);
        // Campo opcional: usuários existentes e criação sem cargo continuam válidos.
        if (cargo == null || cargo.isNull()) {
            return;
        }
        if (!cargo.isTextual()) {
            throw new InvalidUserAdditionalAttributesException("Cargo deve ser um texto.");
        }
        if (cargo.textValue().length() > CARGO_MAX_LENGTH) {
            throw new InvalidUserAdditionalAttributesException("Cargo deve ter no máximo 100 caracteres.");
        }
    }
}
