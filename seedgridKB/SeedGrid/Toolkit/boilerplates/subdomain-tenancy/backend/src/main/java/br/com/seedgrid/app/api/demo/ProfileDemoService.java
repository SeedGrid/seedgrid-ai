package br.com.seedgrid.app.api.demo;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import br.com.seedgrid.commons.core.exceptions.EntityNotFoundException;
import br.com.seedgrid.commons.web.patch.PatchApplier;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * DOMINIO DE EXEMPLO do PATCH parcial. O ponto e' o {@code PatchApplier}: o service nao tem um {@code if} por campo.
 * Um perfil por usuario, guardado em memoria.
 */
@ApplicationScoped
public class ProfileDemoService {

    private final Map<String, ProfileDemo> profiles = new ConcurrentHashMap<>();

    /** POST: o controller ja validou o grupo Full (nome obrigatorio presente). */
    public ProfileDemo create(String userId, ProfileDemoRequest request) {
        ProfileDemo profile = new ProfileDemo();
        PatchApplier.apply(request, profile);
        profiles.put(userId, profile);
        return profile;
    }

    /** PATCH: ausente nao muda; com valor atualiza; null limpa o opcional e responde 400 no obrigatorio. */
    public ProfileDemo patch(String userId, ProfileDemoRequest request) {
        ProfileDemo profile = find(userId);
        PatchApplier.apply(request, profile);
        return profile;
    }

    public ProfileDemo find(String userId) {
        ProfileDemo profile = profiles.get(userId);
        if (profile == null) {
            throw new EntityNotFoundException("Perfil de exemplo nao encontrado: crie com POST antes.");
        }
        return profile;
    }
}
