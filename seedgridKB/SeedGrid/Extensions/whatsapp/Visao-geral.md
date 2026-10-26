---
tags: [seedgrid, extension, whatsapp]
fonte: java/seedgrid-quarkus-ext-whatsapp
branch: main
commit: d8454f6313
analisado-em: 2026-10-14
---

# seedgrid-whatsapp (Quarkus) — Visão geral

Links: [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Exemplos|Exemplos do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Rust|Porte Rust]] · [[SeedGrid/Extensions/whatsapp/Enums|Enums]]

## Objetivo

Biblioteca/extension Quarkus para enviar mensagens WhatsApp por uma interface comum (`WhatsAppApi`), com troca de provider por configuração (`seedgrid.whatsapp.api`), e expor operações específicas da Evolution API (instâncias, grupos, labels, chat, perfil, mensagens interativas). Providers:

- **Evolution API** (self-hosted, Baileys) — módulo `seedgrid-whatsapp-evolution`.
- **WhatsApp Cloud API** (Meta Graph API) — módulo `seedgrid-whatsapp-whatsapp-cloud`.
- **Default** — `DefaultWhatsAppApi`, fallback que só registra WARNING e devolve resultado vazio.

## Módulos e coordenadas (Confirmado — poms)

| Módulo | artifactId | Papel |
|---|---|---|
| raiz (pom) | `br.com.seedgrid:seedgrid-whatsapp:2026.08.16` | Agregador; parent `br.com.seedgrid:seedgrid-parent:2026.07.02` |
| runtime | `seedgrid-whatsapp-core` | Contratos (`WhatsAppApi` e interfaces da Evolution), DTOs, enums, config, producer, fallback. Usa `quarkus-extension-maven-plugin` (descriptor de extension) |
| deployment | `seedgrid-whatsapp-core-deployment` | `WhatsAppCoreProcessor`: feature `seedgrid-whatsapp-core`, indexa os jars dos providers, registra `DefaultWhatsAppApi` e `WhatsAppApiProducer` como unremovable |
| provider | `seedgrid-whatsapp-evolution` | `EvolutionRestClient` + `EvolutionWhatsAppApi` (jar comum com Jandex, não é extension própria) |
| provider | `seedgrid-whatsapp-whatsapp-cloud` | `CloudRestClient` + `OfficialCloudWhatsAppApi` (jar comum com Jandex) |

Todos com `groupId` `br.com.seedgrid` e versão `2026.08.16`.

## Dependências SeedGrid

- `br.com.seedgrid:seedgrid-commons:2026.08.16` (core) — usado por `WhatsAppExceptionExtension implements ApiExceptionExtension`, que converte `WhatsAppException` em HTTP **422** com `ProblemDetails` (título `WhatsApp Error`).
- Providers dependem de `quarkus-rest-client-jackson`.
- **Observação (Não confirmado o motivo):** o pom do deployment declara `quarkus-hibernate-orm-deployment`, `quarkus-agroal-deployment`, `quarkus-datasource-deployment`, `quarkus-narayana-jta-deployment` etc., embora o core não use persistência; provavelmente herdados das necessidades do `seedgrid-commons`.

## Arquitetura e fluxo

```mermaid
flowchart LR
  App[Código do app] -->|@Inject WhatsAppApi| P[WhatsAppApiProducer#produce]
  P -->|api=default ou desconhecido| D[DefaultWhatsAppApi - só log]
  P -->|api=evolution e bean resolvível| E[EvolutionWhatsAppApi]
  P -->|api=whatsapp-cloud e bean resolvível| C[OfficialCloudWhatsAppApi]
  E --> ERC[EvolutionRestClient configKey=evolution] -->|header apikey| EVO[(Evolution API)]
  C --> CRC[CloudRestClient configKey=cloud] -->|Authorization: Bearer| META[(graph.facebook.com)]
```

- `WhatsAppApiProducer` (`@ApplicationScoped`, método `@Produces WhatsAppApi produce()`) recebe `@EvolutionProvider Instance<WhatsAppApi>`, `@OfficialProvider Instance<WhatsAppApi>`, `DefaultWhatsAppApi` e `WhatsAppConfig`; se o provider pedido não for resolvível, devolve o Default (**Confirmado**).
- Os beans de provider têm `@LookupIfProperty(name = "seedgrid.whatsapp.api", stringValue = "evolution" | "whatsapp-cloud")` e qualificadores `@EvolutionProvider` / `@OfficialProvider`.
- Normalização de números (BR): aceita 11 dígitos (DDD + número) ou 13 começando com `55`; qualquer outro tamanho → `WhatsAppException("Phone number invalido...")`. Evolution envia `+55XXXXXXXXXXX`; Cloud envia `55XXXXXXXXXXX` (**Confirmado** — `normalizeBrNumberToEvolution` / `normalizeBrNumberToCloud`). Números fora do Brasil não são suportados por essa normalização.
- `channelId`: na Evolution é o nome da instância (path `{name}`); na Cloud é o `phoneNumberId`. Vazio → `WhatsAppException("channelId is required")`.

## APIs públicas

| Interface (core, pacote `br.com.seedgrid.whatsapp.services`) | Implementada por | Conteúdo |
|---|---|---|
| `WhatsAppApi` | Evolution, Cloud, Default | `sendTextMessage`, `sendMediaFile`, `sendMediaUrl`, `sendAudioFile`, `sendAudioUrl`, `sendLocation`, `sendContact`, `sendReaction`, `sendSticker`, `sendTemplate` — todos `(String channelId, <DTO>)` → `WhatsAppSendMessageResultDTO` |
| `WhatsAppEvolutionMessagingApi` | Evolution | `sendPtv`, `sendPoll`, `sendList`, `sendButtons`, `sendStatus`, `offerCall` |
| `WhatsAppInstanceManagementApi` | Evolution | `createInstance`, `deleteInstance`, `getInstances`, `connectInstance` (QR base64), `getConnectionState`, `restartInstance`, `setWebHook`/`getWebHook` (`WebhookConfig`), `logoutInstance`, `setPresence`, `setSettings`/`getSettings` |
| `WhatsAppGroupApi` | Evolution | criar/consultar grupos, participantes, assunto/descrição/foto, convites, settings, mensagens efêmeras, sair |
| `WhatsAppLabelApi` | Evolution | `findLabels`, `handleLabel` |
| `WhatsAppChatApi` | Evolution | `whatsappNumbers`, leitura/arquivamento/edição/remoção de mensagens, presença, bloqueio, buscas (`WhatsAppQuery`), perfil e privacidade |

- Qualificadores CDI: `@EvolutionProvider`, `@OfficialProvider` (`br.com.seedgrid.whatsapp.qualifiers`).
- **Inferência (CDI):** como `EvolutionWhatsAppApi` declara o qualificador `@EvolutionProvider`, ele não tem `@Default`; para injetar as interfaces exclusivas da Evolution use `@EvolutionProvider WhatsAppInstanceManagementApi` (ou injete a classe `EvolutionWhatsAppApi`, como faz `EvolutionWhatsAppApiIT`). `@LookupIfProperty` só filtra lookup programático (`Instance`), não injeção direta.
- DTOs (`br.com.seedgrid.whatsapp.dtos`): records Java com construtor curto e campo opcional `WhatsAppMessageOptionsDTO options` (`quotedMessageId`, `linkPreview`, `delayMillis`, `mentioned`, `mentionEveryone`; fábricas `quoting`, `linkPreview`, `delay`). Resultado: `WhatsAppSendMessageResultDTO(messageId, status, recipient, timestamp, providerResponse)`.
- Exceção: `WhatsAppException` (RuntimeException) → 422 via `WhatsAppExceptionExtension`. Credenciais ausentes → `IllegalStateException`.
- Endpoints REST **expostos**: nenhum (a lib só consome APIs externas). Endpoints **consumidos**:
  - Evolution (`EvolutionRestClient`, `@Path("/")`): `/instance/*`, `/message/send*/{name}`, `/call/offer/{name}`, `/webhook/set|find/{name}`, `/settings/set|find/{name}`, `/group/*/{name}`, `/label/*/{name}`, `/chat/*/{name}` — ~65 métodos.
  - Cloud (`CloudRestClient`): `POST /{phoneNumberId}/messages`, `POST /{phoneNumberId}/media` (upload multipart montado por `CloudMultipart`; arquivos de mídia/áudio são subidos e depois enviados por id).
- Arquivos locais: `sendAudioFile` lê `fullFileName` do disco (`Files.readAllBytes`) em ambos os providers; `sendMediaFile` usa `mediaBase64`.

## Anotações

_Fonte: código de `seedgrid-quarkus-ext-whatsapp` (versão local 2026.10.22, não publicada)._

| Anotação | Pacote | Onde se aplica | Atributos (padrão) | Para que serve |
|---|---|---|---|---|
| `@EvolutionProvider` | `br.com.seedgrid.whatsapp.qualifiers` | `TYPE`, `METHOD`, `FIELD`, `PARAMETER` | — | [não verificado] |
| `@OfficialProvider` | `br.com.seedgrid.whatsapp.qualifiers` | `TYPE`, `METHOD`, `FIELD`, `PARAMETER` | — | [não verificado] |

## SPIs

_Fonte: código de `seedgrid-quarkus-ext-whatsapp` (versão local 2026.10.22, não publicada)._

Nenhuma.

## Migrations

Nenhuma (sem persistência).

## Testes (não executados)

| Teste | Tipo | Cobertura |
|---|---|---|
| `seedgrid-whatsapp-evolution/src/test/java/.../services/EvolutionWhatsAppApiTest.java` | Unitário, Mockito (59 `@Test`) | Payloads de todos os tipos de mensagem, presença, labels, grupos, chat, valores dos enums |
| `seedgrid-whatsapp-evolution/src/test/java/.../evolution/services/EvolutionPayloadsTest.java` | Unitário (10) | `applyOptions`, `media`, `deriveMimeType`, `toResult` |
| `seedgrid-whatsapp-whatsapp-cloud/src/test/java/.../services/OfficialCloudWhatsAppApiTest.java` | Unitário, Mockito (14) | Payloads Graph API, upload multipart, áudio |
| `seedgrid-whatsapp-evolution/src/test/java/.../clients/EvolutionRestClientIT.java` | `@QuarkusTest` contra servidor real (11), só com `-Devolution.live=true` | Instância, envio, webhook, restart |
| `seedgrid-whatsapp-evolution/src/test/java/.../services/EvolutionWhatsAppApiIT.java` | `@QuarkusTest` contra servidor real (1), **sem guarda** | Envia texto real |

Não há testes no core nem no deployment.

## Limitações

- Seleção de provider com fallback silencioso para `DefaultWhatsAppApi` (só WARNING por chamada).
- Normalização de telefone restrita a números brasileiros.
- Cloud implementa só `WhatsAppApi`; recursos de instância/grupo/label/chat existem apenas na Evolution.
- Credenciais validadas apenas no momento da chamada.

Detalhes de propriedades: [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp]].
