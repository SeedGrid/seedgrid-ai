---
tags: [seedgrid, extension, whatsapp, exemplos]
fonte: java/seedgrid-quarkus-ext-whatsapp
branch: main
commit: d8454f6313
analisado-em: 2026-10-14
---

# Exemplos — seedgrid-whatsapp (Quarkus)

Links: [[SeedGrid/Extensions/whatsapp/Visao-geral|Visão geral do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp]]

Assinaturas conferidas no código (`seedgrid-whatsapp-core/src/main/java/br/com/seedgrid/whatsapp/...`). Os métodos de envio retornam `WhatsAppSendMessageResultDTO`.

## 1. Dependências (Maven)

```xml
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-whatsapp-core</artifactId>
  <version>2026.08.16</version>
</dependency>
<!-- um (ou os dois) providers -->
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-whatsapp-evolution</artifactId>
  <version>2026.08.16</version>
</dependency>
<dependency>
  <groupId>br.com.seedgrid</groupId>
  <artifactId>seedgrid-whatsapp-whatsapp-cloud</artifactId>
  <version>2026.08.16</version>
</dependency>
```

Configuração: ver [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp]] (seções 6 e 7).

## 2. Enviar texto pela interface comum (fonte: README + `WhatsAppApi`)

```java
import br.com.seedgrid.whatsapp.dtos.WhatsAppSendMessageResultDTO;
import br.com.seedgrid.whatsapp.dtos.WhatsAppTextMessageDTO;
import br.com.seedgrid.whatsapp.services.WhatsAppApi;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NotificadorWhatsApp {

    private final WhatsAppApi api; // produzido por WhatsAppApiProducer conforme seedgrid.whatsapp.api

    public NotificadorWhatsApp(WhatsAppApi api) {
        this.api = api;
    }

    public String avisar(String canal, String telefone, String texto) {
        // canal: nome da instância (Evolution) ou PHONE_NUMBER_ID (Cloud)
        WhatsAppSendMessageResultDTO r =
                api.sendTextMessage(canal, new WhatsAppTextMessageDTO(telefone, texto));
        return r.messageId();
    }
}
```

`telefone` aceita formatos BR com 11 dígitos após remover não-dígitos (ex.: `"(11) 99999-9999"`) ou 13 começando com `55`.

## 3. Opções de mensagem (resposta, preview, atraso)

```java
import br.com.seedgrid.whatsapp.dtos.WhatsAppMessageOptionsDTO;
import br.com.seedgrid.whatsapp.dtos.WhatsAppTextMessageDTO;

// responder citando uma mensagem
api.sendTextMessage(canal, new WhatsAppTextMessageDTO(
        "11999999999", "Recebido!", WhatsAppMessageOptionsDTO.quoting("<id-da-mensagem>")));

// desligar preview de link (na Cloud o padrão de preview_url é true)
api.sendTextMessage(canal, new WhatsAppTextMessageDTO(
        "11999999999", "Veja https://exemplo.com", WhatsAppMessageOptionsDTO.linkPreview(false)));
```

## 4. Mídia, áudio, localização, template

```java
import br.com.seedgrid.whatsapp.dtos.*;
import br.com.seedgrid.whatsapp.enums.WhatsAppMediaType;
import java.util.List;

api.sendMediaUrl(canal, new WhatsAppMediaMessageURLDTO(
        "11999999999", WhatsAppMediaType.DOCUMENT,
        "https://exemplo.com/contrato.pdf", "contrato.pdf", "Segue o contrato"));

api.sendMediaFile(canal, new WhatsAppMediaMessageFileDTO(
        "11999999999", WhatsAppMediaType.IMAGE,
        "<conteudo-base64>", "foto.jpg", "foto.jpg", "Legenda"));

api.sendAudioUrl(canal, new WhatsAppAudioMessageURLDTO("11999999999", "https://exemplo.com/audio.mp3"));
api.sendAudioFile(canal, new WhatsAppAudioMessageFileDTO("11999999999", "/caminho/local/audio.ogg")); // lido do disco

api.sendLocation(canal, new WhatsAppLocationMessageDTO(
        "11999999999", -23.5505, -46.6333, "Escritório", "Av. Exemplo, 100"));

api.sendTemplate(canal, new WhatsAppTemplateMessageDTO(
        "11999999999", "<nome-do-template>", "pt_BR", List.of()));
```

## 5. Reação (alvo é a mensagem, não um número)

```java
api.sendReaction(canal, new WhatsAppReactionMessageDTO(
        "<id-da-mensagem>", "5511999999999@s.whatsapp.net", false, "👍"));
```

## 6. Recursos exclusivos da Evolution

Inferência (CDI): o bean `EvolutionWhatsAppApi` tem qualificador `@EvolutionProvider`, então as interfaces específicas são injetadas com esse qualificador.

```java
import br.com.seedgrid.whatsapp.qualifiers.EvolutionProvider;
import br.com.seedgrid.whatsapp.services.*;
import br.com.seedgrid.whatsapp.dtos.WhatsAppPollMessageDTO;
import br.com.seedgrid.whatsapp.enums.WhatsAppPresence;
import jakarta.inject.Inject;
import java.util.List;

@Inject @EvolutionProvider WhatsAppInstanceManagementApi instancias;
@Inject @EvolutionProvider WhatsAppEvolutionMessagingApi mensagensEvolution;
@Inject @EvolutionProvider WhatsAppChatApi chat;
@Inject @EvolutionProvider WhatsAppGroupApi grupos;

void exemplo() {
    String instanceId = instancias.createInstance("cliente-abc");
    String qrBase64 = instancias.connectInstance("cliente-abc");   // PNG em base64 sem prefixo data:
    String estado = instancias.getConnectionState("cliente-abc");

    // webhook (fonte: README)
    WebhookConfig cfg = new WebhookConfig();
    cfg.enabled = true;
    cfg.url = "https://meu-servidor.example/webhook";
    cfg.byEvents = true;
    cfg.base64 = false;
    cfg.events = List.of("MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE");
    instancias.setWebHook("cliente-abc", cfg);

    mensagensEvolution.sendPoll("cliente-abc", new WhatsAppPollMessageDTO(
            "11999999999", "Melhor horário?", 1, List.of("Manhã", "Tarde")));

    List<WhatsAppNumberCheck> existentes = chat.whatsappNumbers("cliente-abc", List.of("11999999999"));
    chat.sendPresence("cliente-abc", "11999999999", WhatsAppPresence.COMPOSING, 1500);
    Object contatos = chat.findContacts("cliente-abc", WhatsAppQuery.all());

    WhatsAppGroup g = grupos.createGroup("cliente-abc", "Equipe", List.of("11999999999"), "Grupo da equipe", false);
}
```

## 7. Tratamento de erros

```java
import br.com.seedgrid.whatsapp.exceptions.WhatsAppException;

try {
    api.sendTextMessage(canal, new WhatsAppTextMessageDTO("123", "Teste"));
} catch (WhatsAppException e) {
    // número inválido, channelId vazio, falha lendo arquivo...
    // em endpoints REST, o seedgrid-commons converte para HTTP 422 (a exception carrega o status); falha do provedor é WhatsAppProviderException (502)
} catch (IllegalStateException e) {
    // credencial do provider ausente (api-key / access-token)
}
```

## 8. Testes como referência

- `seedgrid-whatsapp-evolution/src/test/java/br/com/seedgrid/whatsapp/services/EvolutionWhatsAppApiTest.java` — payloads esperados para cada operação (Mockito sobre `EvolutionRestClient`).
- `seedgrid-whatsapp-whatsapp-cloud/src/test/java/br/com/seedgrid/whatsapp/services/OfficialCloudWhatsAppApiTest.java` — payloads da Graph API e upload multipart.
