---
tags: [seedgrid, extension, whatsapp, rust, configuracao]
fonte: rust/seedgrid-rust-crate-whatsapp
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# whatsapp — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/whatsapp/Rust|Porte Rust do whatsapp]] · Java: [[SeedGrid/Extensions/whatsapp/Configuracao|Configuração do whatsapp (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `WhatsAppConfig` — `rust/seedgrid-rust-crate-whatsapp/src/config.rs` |
| Mecanismo | `WhatsAppConfig::from_env()` (`std::env::var`) ou struct do host |
| Prefixo Java | `seedgrid.whatsapp` |
| Quem chama `from_env` | security (`src/state.rs`, para o canal 2FA WhatsApp) |
| Leitura | quando `from_env()` é chamado (boot); sem recarga |

Os nomes de env são exatamente os das expressões `${...}` de `java/seedgrid-quarkus-ext-whatsapp/seedgrid-whatsapp-core/src/main/resources/META-INF/microprofile-config.properties` (**Confirmado**), com os mesmos padrões.

## Variáveis de ambiente
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_WHATSAPP_API` (Java `seedgrid.whatsapp.api`) | String | `default`, `evolution`, `whatsapp-cloud` (case-insensitive, com `trim`); vazio/desconhecido → `default` | `default` | Não | escolhe o provider em `create_whatsapp_api` | `factory.rs`; `enums.rs` → `WhatsAppProvider::from_config` | define quais variáveis abaixo importam | `from_env()` | `config.rs` → `from_env` |
| `SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL` (Java `seedgrid.whatsapp.rest-client.evolution.url`) | `Option<String>` | URL base da Evolution API | — (vira `""` no transporte) | Condicional: `api=evolution` | base das requisições | `EvolutionWhatsAppApi::new` | `EVOLUTION_API_KEY` | `from_env()` | `evolution.rs` |
| 🔒 `SEEDGRID_WHATSAPP_EVOLUTION_API_KEY` (Java `seedgrid.whatsapp.evolution.api-key`) | `Option<String>` | texto | — | Condicional: `api=evolution` | ausente/branco → `is_configured() = false` e `IllegalState` na chamada | `EvolutionWhatsAppApi::require_api_key` | — | `from_env()` | `evolution.rs` |
| `SEEDGRID_WHATSAPP_REST_CLIENT_CLOUD_URL` (Java `seedgrid.whatsapp.rest-client.cloud.url`) | String | URL | `https://graph.facebook.com/v21.0` (`DEFAULT_CLOUD_URL`; vazio → padrão) | Não | base da Graph API | `OfficialCloudWhatsAppApi::new` | — | `from_env()` | `config.rs`, `cloud.rs` |
| 🔒 `SEEDGRID_WHATSAPP_CLOUD_ACCESS_TOKEN` (Java `seedgrid.whatsapp.cloud.access-token`) | `Option<String>` | token Meta | — | Condicional: `api=whatsapp-cloud` | `Authorization: Bearer`; ausente → `is_configured() = false` e `IllegalState` na chamada | `cloud.rs` | — | `from_env()` | `cloud.rs` |

Valores em branco contam como ausentes (`opt_env`), exceto `SEEDGRID_WHATSAPP_API`, que é lido cru (o branco cai em `default` pela fábrica).

## Struct `WhatsAppConfig`
| Campo | `Default` |
|---|---|
| `api` | `"default"` |
| `evolution_api_key` | `None` |
| `cloud_access_token` | `None` |
| `evolution_url` | `None` |
| `cloud_url` | `DEFAULT_CLOUD_URL` |

## Features Cargo
Nenhuma.

## Relação com a security
O canal 2FA por WhatsApp na security usa também `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` (citado em `rust/seedgrid-rust-crate-security/src/state.rs`); essa variável pertence à configuração da security, fora desta nota.

## Somente testes
Nenhuma variável de ambiente lida em `tests/`.

## Configuração mínima
```dotenv
# Evolution
SEEDGRID_WHATSAPP_API=evolution
SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL=https://<evolution-host>
SEEDGRID_WHATSAPP_EVOLUTION_API_KEY=<SEGREDO:evolution-api-key>
```

## Configuração completa comentada
```dotenv
SEEDGRID_WHATSAPP_API=whatsapp-cloud            # default | evolution | whatsapp-cloud
# Evolution
SEEDGRID_WHATSAPP_REST_CLIENT_EVOLUTION_URL=https://<evolution-host>
SEEDGRID_WHATSAPP_EVOLUTION_API_KEY=<SEGREDO:evolution-api-key>
# Cloud oficial
SEEDGRID_WHATSAPP_REST_CLIENT_CLOUD_URL=https://graph.facebook.com/v21.0
SEEDGRID_WHATSAPP_CLOUD_ACCESS_TOKEN=<SEGREDO:meta-access-token>
```

## Receitas
- **Desligado/dev**: não definir nada → `default` (no-op que loga; `is_configured()` falso).
- **Evolution**: três variáveis do bloco Evolution.
- **Cloud oficial**: `SEEDGRID_WHATSAPP_API=whatsapp-cloud` + access token.
