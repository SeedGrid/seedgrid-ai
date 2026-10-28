---
tags: [seedgrid, library, commons, exemplos]
fonte: java/seedgrid-quarkus-lib-commons
branch: main
commit: fa49c344db
analisado-em: 2026-10-14
---

# SeedGrid Commons — Exemplos

Voltar: [[SeedGrid/Extensions/commons/Visao-geral|Visão geral do commons]] · [[SeedGrid/Extensions/commons/Configuracao|Configuração do commons]]

Não há projeto em `platform-examples` para o commons; os exemplos abaixo seguem o `README.md` e as assinaturas reais do código.

## Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-commons</artifactId>
    <version>2026.10.08</version>
</dependency>
```

## Entidade base com auditoria de usuário

```java
@Entity
public class Product extends BaseEntity {
    private String name;
}
// @PrePersist gera publicId (UUIDv7) e garante active=true;
// createdAt/updatedAt (Instant) via @CreationTimestamp/@UpdateTimestamp;
// createUserPublicId/updateUserPublicId preenchidos pelo BaseEntityAuditListener.
```

Fornecendo o usuário corrente (substitui o `DefaultCurrentUserProvider`, que é `@DefaultBean`):

```java
@ApplicationScoped
public class MyCurrentUserProvider implements CurrentUserProvider {
    @Override public String getCurrentUserPublicId() { return /* publicId do usuário autenticado */ null; }
    @Override public String getCurrentUserEmail()    { return null; }
    @Override public String getCurrentUserName()     { return null; }
    @Override public String getCurrentUserWhatsapp() { return null; }
}
```

## Validadores

```java
public class SignupRequest {
    @ValidName(quantidadePalavras = 2)   // atributo obrigatório (sem default)
    String fullName;

    @ValidEmail                          // bloqueia domínios descartáveis só em prod
    String email;

    @ValidPhone
    String phone;

    @ValidBirthDate(minAge = 18)
    LocalDate birthDate;

    // Defaults reais: minSize=8 e TODAS as regras true
    @ValidPassword(prohibitsRepeatedCharactersInSequence = false)
    String password;
}
```

## Exceções → Problem Details

Cada exception é **específica** e declara o status nela; o `ApiExceptionHandler` monta o `problem+json` (*não publicado, versão local 2026.10.22*):

```java
// 4xx: erro do cliente
public class QuotaExceededException extends BusinessException {
    public QuotaExceededException() {
        super("Cota esgotada.", "empresa 123 estourou o medidor reports", 422);
    }

    @Override public String code() { return "QUOTA_EXCEEDED"; }
    @Override public Map<String, Object> extensions() { return Map.of("meter", "reports"); }
    @Override public Map<String, String> headers() { return Map.of("Retry-After", "30"); }
}

// 404 e 409: estenda as bases do commons
public class CidadeNotFoundException extends EntityNotFoundException {
    public CidadeNotFoundException() { super("Cidade nao encontrada."); }
}

// 5xx: erro nosso; a mensagem ao cliente é sempre genérica
public class ProviderUnavailableException extends SystemSeedGridException {
    public ProviderUnavailableException(Throwable cause) { super("provedor de pagamento fora do ar", 503, cause); }
}
```

`status()` é `int` (400-499 na `BusinessException`, 500-599 na `SystemSeedGridException`); `problemType()` e `title()` têm padrão pelo status. `new BusinessException("msg", "detalhe")` solta responde 400 `ERRO_NEGOCIO`. Os campos de `extensions()` não sobrescrevem `type`, `title`, `status`, `detail`, `devMessage`, `instance`, `code` nem `violations`. Dado pessoal e id interno só na `devMessage`.

## Exception de terceiros → `ApiExceptionExtension`

Para uma exception que você **não controla** (JDBC, Jackson...) ou como saída de emergência, use `ApiExceptionExtension`. As nossas (que estendem `SeedGridException`) são tratadas **antes** das extensions:

```java
@ApplicationScoped
public class MyThirdPartyExceptionExtension implements ApiExceptionExtension {
    @Override
    public Response tryHandle(Throwable ex) {
        if (ex instanceof SomeVendorException) {
            return Response.status(422)
                .entity(ProblemDetails.builder()
                    .type(ProblemType.MENSAGEM_INCOMPREENSIVEL.getUri())
                    .title("Unprocessable Entity")
                    .status(422)
                    .detail("Revise os dados enviados e tente novamente.")
                    .devMessage(ex.getMessage())
                    .instance("")
                    .build())
                .type("application/problem+json")
                .build();
        }
        return null;
    }
}
```

Fonte: `README.md` (exemplo de extensão) + ordem de tratamento em `ApiExceptionHandler#toResponse`.

## Fuso de negócio

```java
@Inject BusinessTimeZone businessTimeZone;

LocalDate dataDeNegocio = instante.atZone(businessTimeZone.zoneId()).toLocalDate();
```

## Evento para o usuário (`SgUserEvent`)

```java
@Inject Event<SgUserEvent> userEvents;

@Transactional
public void finish(Export export) {
    // ... grava o resultado
    userEvents.fire(new SgUserEvent(userPublicId, "backup", "backup.finished.success",
            Map.of("exportPublicId", export.getPublicId())));
}

// Quem escuta (ex.: realtime) usa:
void on(@Observes(during = TransactionPhase.AFTER_SUCCESS) SgUserEvent e) { /* ... */ }
```

Fonte: Javadoc de `SgUserEvent` (dispare dentro da transação; `data` só com identificadores).

## Configuração típica

```properties
seedgrid.web.cors.allow-origins=https://<app.seudominio>
seedgrid.show-dev-message=false
app.build.version=${APP_VERSION:dev}
```

Ver [[SeedGrid/Extensions/commons/Configuracao|Configuração do commons]].
