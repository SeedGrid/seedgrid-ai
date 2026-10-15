---
tags: [seedgrid, extension, realtime, exemplos]
fonte: java/seedgrid-quarkus-ext-realtime
branch: main
commit: 8f13639b3c
analisado-em: 2026-10-14
---

# Realtime (Quarkus) — exemplos

Voltar: [[SeedGrid/Extensions/realtime/Visao-geral|Visão geral do realtime]] · [[SeedGrid/Extensions/realtime/Configuracao|Configuração]]

## 1. Dependência

Fonte: `README.md`.

```xml
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-realtime</artifactId>
  <version>2026.10.08</version>
</dependency>
```

## 2. Avisar um usuário pelo evento neutro (preferido)

Fonte: `README.md` e `RealtimeEnabledTest#userEventIsPublishedToThatUser`. O processo não depende desta extension — só do `SgUserEvent` do `seedgrid-commons`. Construtor: `SgUserEvent(userPublicId, channel, event, data)`.

```java
import br.com.seedgrid.commons.events.SgUserEvent;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import java.util.Map;

@Inject Event<SgUserEvent> userEvents;

// Dentro da transação que grava o resultado: o aviso sai depois do commit (AFTER_SUCCESS).
userEvents.fire(new SgUserEvent(userPublicId, "report", "report.finished.success",
        Map.of("reportPublicId", report.getPublicId())));
```

`data` leva apenas identificadores; a tela busca o registro pela API normal.

## 3. Avisar diretamente com o `RealtimePublisher`

Fonte: assinatura de `RealtimePublisher#publishToUser(String, String, String, Map<String,Object>)`.

```java
import br.com.seedgrid.realtime.services.RealtimePublisher;

@Inject RealtimePublisher realtime;

// Assíncrono; nunca propaga erro. Desligado = no-op.
realtime.publishToUser("backup", "backup.finished.success", userPublicId,
        Map.of("exportPublicId", exportPublicId, "status", "DONE"));
```

## 4. Front pedindo o token

Fonte: `RealtimeController` e tabela do `README.md`.

```http
POST /realtime/connect
Authorization: Bearer <JWT-DO-USUARIO>
```

Respostas possíveis:

```json
{ "enabled": false }
```

```json
{ "enabled": true, "token": "pct_...", "expiresAt": 1791119100, "connectUrl": "wss://...", "channels": ["backup"] }
```

`401` (sem usuário), `429` com `Retry-After`, `503` (Pulse indisponível → manter polling).

## 5. Configuração por ambiente

Fonte: `RealtimeConfig` e `README.md`. Detalhes em [[SeedGrid/Extensions/realtime/Configuracao|Configuração]].

```bash
SEEDGRID_REALTIME_ENABLED=true
SEEDGRID_REALTIME_PULSE_BASE_URL=<URL-DO-PULSE>
SEEDGRID_REALTIME_PULSE_PROJECT_KEY=<SEGREDO:pulse-project-key>
SEEDGRID_REALTIME_TOKEN_TTL=PT5M
```

## 6. Testando com Pulse fingido

Fonte: `runtime/src/test/java/br/com/seedgrid/realtime/FakePulse.java` — um `QuarkusTestResourceLifecycleManager` que sobe WireMock e devolve `seedgrid.realtime.pulse.base-url` apontando para ele.

```java
@QuarkusTest
@QuarkusTestResource(FakePulse.class)
class MeuTeste {
    @Test
    @TestSecurity(user = "7f3a9c1e-0000-4000-8000-000000000001")
    void conecta() {
        given().when().post("/realtime/connect").then().statusCode(200);
    }
}
```
