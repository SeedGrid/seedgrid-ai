package br.com.seedgrid.app.api.audit;

import java.util.UUID;
import br.com.seedgrid.security.entities.User;
import br.com.seedgrid.security.spis.EmailServiceInterface;
import io.quarkus.test.Mock;
import jakarta.enterprise.context.ApplicationScoped;

/** Os testes de auditoria nao enviam mensagens nem dependem de SMTP. */
@Mock
@ApplicationScoped
public class AuditTestEmailService implements EmailServiceInterface {
    public String generateToken() { return UUID.randomUUID().toString(); }
    public void sendEmailConfirmation(User user, String token) { }
    public void sendPasswordReset(User user, String token) { }
    public void sendHtmlEmail(String to, String subject, String html, String text) { }
    public void sendWelcomeEmail(User user, String password, String token) { }
}
