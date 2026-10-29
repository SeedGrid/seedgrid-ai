---
tags: [seedgrid, extension, whatsapp, rust]
fonte: rust/seedgrid-rust-crate-whatsapp
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# whatsapp — porte Rust (`seedgrid-rust-crate-whatsapp`)

Porte da extensão Quarkus `seedgrid-quarkus-ext-whatsapp`. Lado Java: [[SeedGrid/Extensions/whatsapp/Visao-geral|Visão geral do whatsapp (Java)]] · [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp (Java)]]. Configuração Rust: [[SeedGrid/Extensions/whatsapp/Configuracao-Rust|Configuração Rust do whatsapp]].

Biblioteca **só de saída** (sem webhooks de entrada) para enviar mensagens WhatsApp por vários provedores, escolhidos por configuração. **Confirmado** (`src/lib.rs`).

| Provider (`seedgrid.whatsapp.api`) | Implementação | Capacidades |
|---|---|---|
| `default` (ou vazio/desconhecido) | `DefaultWhatsAppApi` | no-op: só loga WARNING; `is_configured()` sempre `false` |
| `evolution` | `EvolutionWhatsAppApi` | Evolution API (Baileys): envio + mensagens Evolution + grupos, chat, labels, gestão de instâncias |
| `whatsapp-cloud` | `OfficialCloudWhatsAppApi` | WhatsApp Cloud oficial (Meta Graph API): só envio |

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-whatsapp` (lib `seedgrid_whatsapp`) |
| Versão | workspace `2026.10.14` |
| Features | nenhuma (todos os providers sempre compilados) |
| Dependências SeedGrid | nenhuma |
| Consumidor | security (2FA por WhatsApp: `rust/seedgrid-rust-crate-security/src/state.rs` chama `WhatsAppConfig::from_env()`) |

## API pública
| Símbolo | Papel | Fonte |
|---|---|---|
| `WhatsAppConfig` (`from_env`, `Default`), `DEFAULT_CLOUD_URL` | config | `src/config.rs` |
| `create_whatsapp_api(&WhatsAppConfig) -> Arc<dyn WhatsAppApi>` | fábrica por provider (`WhatsAppProvider::from_config`: `trim` + minúsculas) | `src/factory.rs`, `src/enums.rs` |
| trait `WhatsAppApi` | `send_text_message`, `send_media_file/url`, `send_audio_file/url`, `send_location`, `send_contact`, `send_reaction`, `send_sticker`, `send_template`…, `provider()`, `is_configured()` | `src/api.rs` |
| traits `WhatsAppEvolutionMessaging` (`send_ptv`, `send_poll`, `send_list`, `send_buttons`, `send_status`, `offer_call`), `WhatsAppLabels`, `WhatsAppGroups`, `WhatsAppChat`, `WhatsAppInstanceManagement` (`create_instance`, `delete_instance`, `get_instances`, `connect_instance`, `get_connection_state`, `restart_instance`, `set_webhook`, `get_webhook`) | capacidades Evolution | `src/api.rs` |
| DTOs (`WhatsAppTextMessage`, `WhatsAppMedia*`, `WhatsAppSendMessageResult`, `WhatsAppInstance`, `WebhookConfig`…) e enums | modelo | `src/dtos.rs`, `src/enums.rs` |
| `WhatsAppError` (`IllegalState` quando falta credencial), `Result` | erros | `src/error.rs` |

As credenciais não são validadas na construção: a falta de `api-key`/`access-token` vira `WhatsAppError::IllegalState` na primeira chamada que precisa dela (`require_api_key` em `src/evolution.rs`; header Bearer em `src/cloud.rs`), como no Java.

## Exemplo (doc de `src/lib.rs`)
```rust
use seedgrid_whatsapp::{WhatsAppConfig, create_whatsapp_api, WhatsAppTextMessage};

let config = WhatsAppConfig::from_env();
let api = create_whatsapp_api(&config);
let res = api
    .send_text_message("meu-channel-id", WhatsAppTextMessage::new("11999999999", "Seu codigo: 1234"))
    .await?;
println!("message_id = {}", res.message_id);
```
Não há app em `rust/examples/` para whatsapp.

## Testes
Unitários extensos em `src/evolution.rs`, `src/cloud.rs`, `src/factory.rs`; `tests/http_integration_test.rs` (servidor falso `wiremock`, valida path/header/corpo). **Não executados.**

## Notas de comportamento

- O mapeamento HTTP dos erros (422 e as exceptions específicas do Java) não existe no crate; o host mapeia os erros.
- O trait tem `provider()` e `is_configured()` extras.
- A fábrica não tem fallback `isResolvable`.

## Enums
Java: [[SeedGrid/Extensions/whatsapp/Enums|Enums do whatsapp (Java)]]. Todos em `src/enums.rs`; cada um tem `value()` (texto) e `from_value()` (erro `WhatsAppError::WhatsApp("Unexpected value '…'")` se desconhecido) e `Serialize`/`Deserialize` manuais pelo texto (como o `@JsonValue`/`@JsonCreator` do Java). Variantes e textos **iguais** aos do Java.

| Enum | Variantes → texto | Java equivalente |
|---|---|---|
| `WhatsAppProvider` | `Default` → `default`, `Evolution` → `evolution`, `Official` → `whatsapp-cloud` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppProvider\|WhatsAppProvider]] |
| `WhatsAppMediaType` | `None`, `Image`, `Video`, `Audio`, `Document` → minúsculas | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppMediaType\|WhatsAppMediaType]] |
| `WhatsAppPresence` | `Unavailable`, `Available`, `Composing`, `Recording`, `Paused` → minúsculas | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppPresence\|WhatsAppPresence]] |
| `WhatsAppLabelAction` | `Add`, `Remove` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppLabelAction\|WhatsAppLabelAction]] |
| `WhatsAppGroupParticipantAction` | `Add`, `Remove`, `Promote`, `Demote` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupParticipantAction\|WhatsAppGroupParticipantAction]] |
| `WhatsAppGroupSetting` | `Announcement`, `NotAnnouncement` → `not_announcement`, `Locked`, `Unlocked` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupSetting\|WhatsAppGroupSetting]] |
| `WhatsAppEphemeralExpiration` | `Off` 0, `OneDay` 86400, `SevenDays` 604800, `NinetyDays` 7776000 (segundos, sem texto) | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppEphemeralExpiration\|WhatsAppEphemeralExpiration]] |
| `WhatsAppBlockAction` | `Block`, `Unblock` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppBlockAction\|WhatsAppBlockAction]] |
| `WhatsAppPrivacyValue` | `All`, `Contacts`, `ContactBlacklist` → `contact_blacklist`, `None` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppPrivacyValue\|WhatsAppPrivacyValue]] |
| `WhatsAppReadReceiptsValue` | `All`, `None` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppReadReceiptsValue\|WhatsAppReadReceiptsValue]] |
| `WhatsAppOnlinePrivacyValue` | `All`, `MatchLastSeen` → `match_last_seen` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppOnlinePrivacyValue\|WhatsAppOnlinePrivacyValue]] |
| `WhatsAppGroupAddPrivacyValue` | `All`, `Contacts`, `ContactBlacklist` | [[SeedGrid/Extensions/whatsapp/Enums#WhatsAppGroupAddPrivacyValue\|WhatsAppGroupAddPrivacyValue]] |
| `WhatsAppError` | `WhatsApp`, `IllegalState` (credencial ausente), `Unsupported` | exceções do módulo |

`WhatsAppProvider::from_config` (config `seedgrid.whatsapp.api`): vazio, `default` ou valor desconhecido → `Default`; trim + minúsculas; `evolution` → `Evolution`; `whatsapp-cloud` → `Official` ([[SeedGrid/Extensions/whatsapp/Configuracao-Rust|Configuração Rust]]).
