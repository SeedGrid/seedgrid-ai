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

## Exceções de negócio → Problem Details

```java
throw new BusinessException("Nao foi possivel concluir", "detalhe tecnico para devMessage");
// -> 400, type https://seedgrid.com.br/erro-negocio, application/problem+json
```

`BusinessException` aceita um status 4xx (`Response.Status`, padrão e nulo = 400; status fora de 4xx lança `IllegalArgumentException`). `EntityNotFoundException` responde **404** (`RECURSO_NAO_ENCONTRADO`) e `EntityInUseException` **409** (`ENTIDADE_EM_USO`) — *não publicado, versão local 2026.10.22; antes eram 400*:

```java
throw new EntityNotFoundException("Cidade nao encontrada.");                       // 404
throw new BusinessException("Limite atingido", "detalhe", Response.Status.PAYMENT_REQUIRED); // 402
```

Para um status que o `Response.Status` não tem (por exemplo 422), use `ApiExceptionExtension`:

```java
@ApplicationScoped
public class MyCustomExceptionExtension implements ApiExceptionExtension {
    @Override
    public Response tryHandle(Throwable ex) {
        // atenção: BusinessException e subclasses são tratadas ANTES das extensions,
        // então este ponto só recebe exceções que o handler não reconhece.
        if (ex instanceof MyCustomException) {
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
