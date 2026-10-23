package br.com.seedgrid.app.api.e2e;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.spis.EmailServiceInterface;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;

/**
 * E-mail dos testes E2E: nao envia nada (sem SMTP) e GUARDA o HTML de cada mensagem enviada por {@code sendHtmlEmail}, para
 * o teste ler o codigo de confirmacao que o usuario receberia. Prioridade acima do {@code @Mock} da auditoria
 * ({@code AuditTestEmailService}, prioridade 1), que e' um no-op.
 */
@Alternative
@Priority(2)
@ApplicationScoped
public class E2eRecordingEmailService implements EmailServiceInterface {

    private static final Map<String, List<String>> HTML_BY_RECIPIENT = new ConcurrentHashMap<>();

    /** HTML dos e-mails enviados a este endereco, do mais antigo ao mais novo. */
    public static List<String> htmlSentTo(String email) {
        return HTML_BY_RECIPIENT.getOrDefault(email.toLowerCase(), List.of());
    }

    @Override
    public String generateToken() {
        return UUID.randomUUID().toString();
    }

    @Override
    public void sendEmailConfirmation(User user, String token) {
    }

    @Override
    public void sendPasswordReset(User user, String token) {
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String html, String text) {
        HTML_BY_RECIPIENT.computeIfAbsent(to.toLowerCase(), k -> new CopyOnWriteArrayList<>()).add(html);
    }

    @Override
    public void sendWelcomeEmail(User user, String password, String token) {
    }
}
