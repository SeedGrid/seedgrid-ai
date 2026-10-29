package br.com.seedgrid.app.api.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openapitools.jackson.nullable.JsonNullableModule;

import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.seedgrid.commons.web.patch.JsonNullableValueExtractor;
import br.com.seedgrid.commons.web.patch.PatchNullNotAllowedException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

/**
 * Os tres casos do PATCH parcial no exemplo (BE-33), mais o POST com o grupo Full: ausente nao atualiza; com valor
 * valida (@Size, @Pattern) e atualiza; null explicito zera o opcional e e' 400 no obrigatorio.
 */
class ProfileDemoPatchTest {

    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JsonNullableModule());
    private static Validator validator;

    private final ProfileDemoService service = new ProfileDemoService();

    @BeforeAll
    static void bootstrap() {
        validator = Validation.byDefaultProvider().configure()
                .addValueExtractor(new JsonNullableValueExtractor())
                .messageInterpolator(new org.hibernate.validator.messageinterpolation.ParameterMessageInterpolator())
                .buildValidatorFactory().getValidator();
    }

    private static ProfileDemoRequest body(String json) throws Exception {
        return MAPPER.readValue(json, ProfileDemoRequest.class);
    }

    private ProfileDemo seeded() throws Exception {
        return service.create("u1", body("{\"displayName\":\"Ana\",\"bio\":\"oi\",\"website\":\"https://ana.dev\"}"));
    }

    private static Set<String> invalid(ProfileDemoRequest request, Class<?>... groups) {
        return validator.validate(request, groups).stream().map(ConstraintViolation::getPropertyPath)
                .map(Object::toString).map(p -> p.split("[.<]")[0]).collect(Collectors.toSet());
    }

    @Test
    void absentFieldsDoNotUpdate() throws Exception {
        seeded();
        ProfileDemo p = service.patch("u1", body("{}"));

        assertEquals("Ana", p.getDisplayName());
        assertEquals("oi", p.getBio());
        assertEquals("https://ana.dev", p.getWebsite());
    }

    @Test
    void valueIsValidatedAndUpdates() throws Exception {
        seeded();
        ProfileDemoRequest ok = body("{\"displayName\":\"Bia\",\"website\":\"https://bia.dev\"}");
        assertTrue(invalid(ok).isEmpty());
        ProfileDemo p = service.patch("u1", ok);

        assertEquals("Bia", p.getDisplayName());
        assertEquals("https://bia.dev", p.getWebsite());
        assertEquals("oi", p.getBio());
        assertEquals(Set.of("website", "bio"), invalid(body("{\"website\":\"http://x\",\"bio\":\"" + "x".repeat(61) + "\"}")));
    }

    @Test
    void explicitNullClearsTheOptionalField() throws Exception {
        seeded();
        ProfileDemo p = service.patch("u1", body("{\"bio\":null,\"website\":null}"));

        assertNull(p.getBio());
        assertNull(p.getWebsite());
        assertEquals("Ana", p.getDisplayName());
    }

    @Test
    void explicitNullOnTheRequiredFieldIs400() throws Exception {
        seeded();
        PatchNullNotAllowedException ex = assertThrows(PatchNullNotAllowedException.class,
                () -> service.patch("u1", body("{\"displayName\":null,\"bio\":null}")));

        assertEquals(400, ex.status());
        assertEquals(List.of("displayName"), ex.fields());
        assertEquals("oi", service.find("u1").getBio(), "nada muda quando ha um null proibido");
    }

    @Test
    void postValidatesTheFullGroup() throws Exception {
        assertEquals(Set.of("displayName"), invalid(body("{}"), ProfileDemoRequest.Full.class));
        assertEquals(Set.of("displayName"), invalid(body("{\"displayName\":null}"), ProfileDemoRequest.Full.class));
        assertTrue(invalid(body("{\"displayName\":\"Ana\"}"), ProfileDemoRequest.Full.class).isEmpty());
        // O PATCH (Default) nao exige o nome.
        assertTrue(invalid(body("{}")).isEmpty());
    }
}
