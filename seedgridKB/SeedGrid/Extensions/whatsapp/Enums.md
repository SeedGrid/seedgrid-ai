---
tags: [seedgrid, extension, whatsapp, enum]
fonte: java/seedgrid-quarkus-ext-whatsapp
branch: main
commit: d8454f6313
analisado-em: 2026-10-14
---

# Enums — seedgrid-whatsapp (Quarkus)

Voltar: [[SeedGrid/Extensions/whatsapp/Visao-geral|Visão geral do whatsapp]] · [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração]] · [[SeedGrid/Extensions/whatsapp/Rust|Porte Rust]]

Todos os enums ficam em `seedgrid-whatsapp-core/src/main/java/br/com/seedgrid/whatsapp/enums/` (pacote `br.com.seedgrid.whatsapp.enums`). São 12, todos públicos. Nenhum é persistido (a extension não tem entidades nem migrations) e só `WhatsAppProvider` é lido de config.

## Índice

| Enum | Arquivo | Usado em | Público? |
|---|---|---|---|
| [[#WhatsAppProvider]] | `WhatsAppProvider.java` | propriedade `seedgrid.whatsapp.api` | Sim |
| [[#WhatsAppMediaType]] | `WhatsAppMediaType.java` | `WhatsAppMediaMessageFileDTO`, `WhatsAppMediaMessageURLDTO` | Sim |
| [[#WhatsAppPresence]] | `WhatsAppPresence.java` | `WhatsAppInstanceManagementApi#setPresence`, `WhatsAppChatApi#sendPresence` | Sim |
| [[#WhatsAppBlockAction]] | `WhatsAppBlockAction.java` | `WhatsAppChatApi#updateBlockStatus` | Sim |
| [[#WhatsAppLabelAction]] | `WhatsAppLabelAction.java` | `WhatsAppLabelApi#handleLabel` | Sim |
| [[#WhatsAppGroupParticipantAction]] | `WhatsAppGroupParticipantAction.java` | `WhatsAppGroupApi#updateParticipants` | Sim |
| [[#WhatsAppGroupSetting]] | `WhatsAppGroupSetting.java` | `WhatsAppGroupApi#updateGroupSetting` | Sim |
| [[#WhatsAppEphemeralExpiration]] | `WhatsAppEphemeralExpiration.java` | `WhatsAppGroupApi#toggleEphemeral` | Sim |
| [[#WhatsAppPrivacyValue]] | `WhatsAppPrivacyValue.java` | `WhatsAppPrivacySettings.profile/status/last` | Sim |
| [[#WhatsAppReadReceiptsValue]] | `WhatsAppReadReceiptsValue.java` | `WhatsAppPrivacySettings.readreceipts` | Sim |
| [[#WhatsAppOnlinePrivacyValue]] | `WhatsAppOnlinePrivacyValue.java` | `WhatsAppPrivacySettings.online` | Sim |
| [[#WhatsAppGroupAddPrivacyValue]] | `WhatsAppGroupAddPrivacyValue.java` | `WhatsAppPrivacySettings.groupadd` | Sim |

Padrão comum: cada constante guarda um texto (`value`/`configValue`) e há um `fromValue`/`fromConfig` com busca linear **case-sensitive** que lança `WhatsAppException("Unexpected value '<v>'")` quando não acha (exceto `WhatsAppProvider`, que cai em `DEFAULT`). Os enums de ação **não** têm `@JsonValue`: quem os serializa é a `EvolutionWhatsAppApi`, que põe `getValue()` no `Map` do payload.

## WhatsAppProvider

`seedgrid-whatsapp-core/.../enums/WhatsAppProvider.java` · `br.com.seedgrid.whatsapp.enums.WhatsAppProvider`

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `DEFAULT` (`default`) | Provider no-op | `WhatsAppApiProducer#produce()` devolve `DefaultWhatsAppApi` | Também é o resultado para config vazia/desconhecida (**Confirmado**) |
| `EVOLUTION` (`evolution`) | Evolution API | `produce()` devolve o bean `@EvolutionProvider` se `Instance.isResolvable()`, senão `DefaultWhatsAppApi` | **Confirmado** |
| `OFFICIAL` (`whatsapp-cloud`) | WhatsApp Cloud (Meta) | `produce()` devolve o bean `@OfficialProvider` se resolvível, senão `DefaultWhatsAppApi` | O texto de config é `whatsapp-cloud`, **não** `official` (**Confirmado**) |

- Campo `configValue` (`getConfigValue()`); `static fromConfig(String)`: `null`/em branco → `DEFAULT`; senão `trim().toLowerCase()` e compara; sem match → `DEFAULT` (nunca lança).
- Config: lido de `seedgrid.whatsapp.api` (tipo `String` em `WhatsAppConfig`, convertido manualmente por `fromConfig`, logo tolerante a caixa e espaços). Sem JSON, sem persistência.
- `@LookupIfProperty` dos beans compara o texto exato; `Evolution` passa no `fromConfig` mas pode não casar o lookup e cair em Default (**Inferência**, ver [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração]]).
- Usado em: [[SeedGrid/Extensions/whatsapp/Configuracao|seedgrid.whatsapp.api]].

## WhatsAppMediaType

`.../enums/WhatsAppMediaType.java` · `br.com.seedgrid.whatsapp.enums.WhatsAppMediaType`

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `NONE` (`none`) | Sem mídia | Nenhum código o trata de forma especial; `getValue()` = `"none"` segue para o payload | Existe no enum, mas nenhum código trata esse valor. Enviado como `mediatype: "none"` (Evolution) / `type: "none"` (Cloud); provavelmente recusado pelo provider (**Inferência**) |
| `IMAGE` (`image`) | Imagem | `getValue()` vai em `EvolutionPayloads.media(...)` (`mediatype`) e em `OfficialCloudWhatsAppApi` (`type`) | **Confirmado** |
| `VIDEO` (`video`) | Vídeo | idem | **Confirmado** |
| `AUDIO` (`audio`) | Áudio | idem | **Confirmado** |
| `DOCUMENT` (`document`) | Documento | idem | **Confirmado** |

- Campo `value` (não-final), `getValue()`, `static fromValue(String)`.
- Serialização: **sem** `@JsonValue`/`@JsonCreator`. Se a aplicação serializar os DTOs (records) com Jackson, o JSON usa o nome da constante (`IMAGE`), não `image` (**Inferência**). A extension só usa `getValue()` ao montar payloads. `mediaType` nulo causa `NullPointerException` em `sendMediaFile`/`sendMediaUrl` (sem validação, **Confirmado**).
- Usado em: `WhatsAppMediaMessageFileDTO#mediaType`, `WhatsAppMediaMessageURLDTO#mediaType`; `EvolutionWhatsAppApi#sendMediaFile/sendMediaUrl`; `OfficialCloudWhatsAppApi`.

## WhatsAppPresence

`.../enums/WhatsAppPresence.java`

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `UNAVAILABLE` (`unavailable`) | Offline | Enviado como `presence` | Valores fechados pelo `presenceOnlySchema` da Evolution (Javadoc) |
| `AVAILABLE` (`available`) | Online | idem | |
| `COMPOSING` (`composing`) | "Digitando…" | idem | Mais útil em `sendPresence` (chat) |
| `RECORDING` (`recording`) | "Gravando áudio…" | idem | idem |
| `PAUSED` (`paused`) | Parou de digitar/gravar | idem | idem |

- `getValue()`, `fromValue(String)` (lança se desconhecido). Sem anotações Jackson.
- Tratado em `EvolutionWhatsAppApi#setPresence` (`Map.of("presence", ...)`) e `#sendPresence` (`presence` + `delay` opcional). `null` → `WhatsAppException("presence is required")`. Não há `switch`: todos os valores seguem o mesmo caminho (**Confirmado**). O módulo cloud não referencia presença (**Inferência**: provider Cloud não a implementa).

## WhatsAppBlockAction

`.../enums/WhatsAppBlockAction.java`

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `BLOCK` (`block`) | Bloquear contato | `payload.status = "block"` em `updateBlockStatus` | **Confirmado** |
| `UNBLOCK` (`unblock`) | Desbloquear | `payload.status = "unblock"` | **Confirmado** |

- `getValue()`, `fromValue`. `null` → `"status is required"`. O campo do payload chama-se `status`, não `action`.

## WhatsAppLabelAction

`.../enums/WhatsAppLabelAction.java`

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `ADD` (`add`) | Aplica etiqueta ao contato | `payload.action = "add"` em `handleLabel` | **Confirmado** |
| `REMOVE` (`remove`) | Remove etiqueta | `payload.action = "remove"` | **Confirmado** |

- `getValue()`, `fromValue`. `null` → `"action is required"`.

## WhatsAppGroupParticipantAction

`.../enums/WhatsAppGroupParticipantAction.java`

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `ADD` (`add`) | Adiciona participantes | `payload.action` em `updateParticipants` | **Confirmado** |
| `REMOVE` (`remove`) | Remove participantes | idem | |
| `PROMOTE` (`promote`) | Promove a admin | idem | |
| `DEMOTE` (`demote`) | Rebaixa de admin | idem | |

- `getValue()`, `fromValue`. `null` → `"action is required"`; lista de participantes vazia → `"participants is required"`.

## WhatsAppGroupSetting

`.../enums/WhatsAppGroupSetting.java`

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `ANNOUNCEMENT` (`announcement`) | Só administradores enviam mensagens | `payload.action` em `updateGroupSetting` | Javadoc |
| `NOT_ANNOUNCEMENT` (`not_announcement`) | Todos enviam | idem | Javadoc |
| `LOCKED` (`locked`) | Só administradores editam dados do grupo | idem | Javadoc |
| `UNLOCKED` (`unlocked`) | Todos editam | idem | Javadoc |

- `getValue()`, `fromValue`. `null` → mensagem `"action is required"`.

## WhatsAppEphemeralExpiration

`.../enums/WhatsAppEphemeralExpiration.java`

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `OFF` (0) | Desliga mensagens temporárias | `payload.expiration = 0` | |
| `ONE_DAY` (86 400) | 24 h | `payload.expiration = 86400` | |
| `SEVEN_DAYS` (604 800) | 7 dias | idem | |
| `NINETY_DAYS` (7 776 000) | 90 dias | idem | |

- Campo `seconds` (`int`), `getSeconds()`, `static fromSeconds(int)` (lança se não for um dos 4). Único enum com valor **numérico** no payload. Javadoc: a Evolution só aceita estes 4 valores.
- Tratado em `EvolutionWhatsAppApi#toggleEphemeral`; `null` → `"expiration is required"`.

## WhatsAppPrivacyValue

`.../enums/WhatsAppPrivacyValue.java` · espelha `WAPrivacyValue` do Baileys.

| Valor | Significado | Efeito | Observações |
|---|---|---|---|
| `ALL` (`all`) | Todos | Serializado/lido no JSON de `WhatsAppPrivacySettings` | Javadoc |
| `CONTACTS` (`contacts`) | Apenas contatos | idem | |
| `CONTACT_BLACKLIST` (`contact_blacklist`) | Contatos, exceto os selecionados | idem | |
| `NONE` (`none`) | Ninguém | idem | |

- Serialização: `@JsonValue getValue()` e `@JsonCreator fromValue(String)`; o JSON usa o texto (`"contacts"`). Valor desconhecido vindo da Evolution lança `WhatsAppException` na desserialização (`@JsonIgnoreProperties(ignoreUnknown)` cobre propriedades, não valores; **Inferência**).
- Usado em: `WhatsAppPrivacySettings.profile`, `.status`, `.last`; `fetchPrivacySettings`/`updatePrivacySettings`.

## WhatsAppReadReceiptsValue

| Valor | Significado | Observações |
|---|---|---|
| `ALL` (`all`) | Confirmação de leitura ligada | |
| `NONE` (`none`) | Desligada | `contacts` **não** é aceito aqui |

- `@JsonValue`/`@JsonCreator`. Usado em `WhatsAppPrivacySettings.readreceipts`.

## WhatsAppOnlinePrivacyValue

| Valor | Significado | Observações |
|---|---|---|
| `ALL` (`all`) | Todos veem o "online" | |
| `MATCH_LAST_SEEN` (`match_last_seen`) | Segue a regra do "visto por último" | |

- `@JsonValue`/`@JsonCreator`. Usado em `WhatsAppPrivacySettings.online`.

## WhatsAppGroupAddPrivacyValue

| Valor | Significado | Observações |
|---|---|---|
| `ALL` (`all`) | Qualquer um adiciona | |
| `CONTACTS` (`contacts`) | Só contatos | |
| `CONTACT_BLACKLIST` (`contact_blacklist`) | Contatos, exceto selecionados | Não existe `none` aqui |

- `@JsonValue`/`@JsonCreator`. Usado em `WhatsAppPrivacySettings.groupadd`.

## Persistência

Nenhum enum é persistido: a extension não tem entidades JPA, `@Enumerated`, converters nem migrations (ver [[SeedGrid/Extensions/whatsapp/Visao-geral|Visão geral]]). Não há CHECK constraints a comparar.

## Notas Rust

Os 12 enums existem no crate Rust (`src/enums.rs`/`src/dtos.rs`) com as mesmas constantes e textos de wire.
- Nomes em PascalCase (`Official`, `ContactBlacklist`...), mesmos textos.
- `from_seconds`/`seconds()` usam `i64`.
- `WhatsAppMediaType`, `WhatsAppPresence` e `WhatsAppEphemeralExpiration` são serializados por serde manual (texto/número do wire).
- `WhatsAppMediaType` (`None`), os 4 de privacidade (`All`) e `EphemeralExpiration` (`Off`) têm `Default`; `WhatsAppPrivacySettings` usa campos não opcionais com `#[serde(default)]`.

## Internos

Nenhum enum interno ou privado em `src/main`.
