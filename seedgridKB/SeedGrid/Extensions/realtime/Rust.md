---
tags: [seedgrid, extension, realtime, rust]
fonte: rust/seedgrid-rust-crate-realtime
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# realtime — porte Rust (`seedgrid-rust-crate-realtime`)

Porte da extensão Quarkus `seedgrid-quarkus-ext-realtime` ("mesmo env, mesma rota, mesmo JSON"). Lado Java: [[SeedGrid/Extensions/realtime/Visao-geral|Visão geral do realtime (Java)]] · [[SeedGrid/Extensions/realtime/Configuracao|Configuração do realtime (Java)]]. Configuração Rust: [[SeedGrid/Extensions/realtime/Configuracao-Rust|Configuração Rust do realtime]].

Avisos em tempo real ao **usuário logado** via SeedGrid Pulse: entrega ao front um token curto de conexão (`POST /realtime/connect`) e publica os `SgUserEvent` da plataforma. **Confirmado** (`src/lib.rs`, README).

## Identificação
| Item | Valor |
|---|---|
| Pacote Cargo | `seedgrid-rust-crate-realtime` (lib `seedgrid_realtime`) |
| Versão | workspace `2026.10.14` |
| Features | nenhuma |
| Dependências SeedGrid | `seedgrid-runtime` (eventos `SgUserEvent`/`UserEventSink`, `parse_duration`); `seedgrid-pulse-publisher-rust` (path `../../../seedgrid-products/seedgrid-pulse/components/publishers/seedgrid-pulse-publisher-rust`, **fora** do `seedgrid-platform`) |
| Dev-deps | `seedgrid-pulse-subscriber-rust` (também fora do repo), `wiremock` |

Observação: o crate só compila com o repositório `seedgrid-products` presente ao lado de `seedgrid-platform` (**Confirmado** pelo `Cargo.toml`; o caminho existe nesta máquina em `seedgrid-products/...`).

## API pública
| Símbolo | Papel | Fonte |
|---|---|---|
| `RealtimeConfig` (`from_env`, `from_lookup`, `Default`), `config::parse_duration` | config | `src/config.rs` |
| `RealtimePublisher::new(config)` / `from_env()` | cliente do Pulse; ligado sem URL ou chave → loga erro e fica desligado (a app sobe) | `src/publisher.rs` |
| `RealtimePublisher::is_enabled`, `config`, `publish_to_user(channel, event, user_public_id, data)`, `issue_connect_token(user_public_id)` | publicação (nunca propaga erro) e emissão de token | `src/publisher.rs` |
| `impl UserEventSink for RealtimePublisher` | publica `SgUserEvent` numa task própria (par do `@Observes(during = AFTER_SUCCESS)` Java) | `src/publisher.rs` |
| `IssueError::{Disabled, Pulse}` | erro de emissão | `src/publisher.rs` |
| `rest::router(publisher, Arc<dyn RealtimeIdentityResolver>)` | rota `POST /realtime/connect` | `src/rest.rs` |
| trait `RealtimeIdentityResolver` | o host informa o usuário da sessão (ex.: `sub` do JWT) | `src/rest.rs` |
| `RealtimeConnectResponse` | JSON de resposta (`enabled`, `token`, `expiresAt`, `connectUrl`, `channels`) | `src/rest.rs` |
| `rate_limit::ConnectRateLimiter` | janela fixa de 1 min por usuário, em memória, por instância | `src/rate_limit.rs` |

## Endpoint `POST /realtime/connect`
| Status | Quando |
|---|---|
| 401 | sem usuário (vale mesmo com realtime desligado) |
| 200 `{enabled:false}` | desligado ou não configurado |
| 429 + `Retry-After` | limite `connect_rate_per_minute` excedido |
| 200 `{enabled:true, token, expiresAt, connectUrl, channels}` | token emitido |
| 503 | Pulse não respondeu/recusou |

Fonte: `src/rest.rs` → `connect`.

## Exemplo (doc de `src/lib.rs`)
```rust
use seedgrid_realtime::RealtimePublisher;
use seedgrid_runtime::events::UserEventSink;

let realtime = RealtimePublisher::from_env();
let api = seedgrid_realtime::rest::router(realtime.clone(), identity);
let user_events: Arc<dyn UserEventSink> = Arc::new(realtime.clone());
// avisos do backup:
let overrides = BackupOverrides { user_events: Arc::new(realtime), ..Default::default() };
```
Não há app em `rust/examples/` para realtime.

## Testes
- Unitários (`src/config.rs`: durações, mesmo env do Java, padrão desligado) e `tests/realtime_it.rs` (router contra Pulse simulado com `wiremock`: 401, 429, 503, desligado, publicação).
- `tests/pulse_e2e_it.rs` (`#[ignore]`) contra Pulse real com `REALTIME_E2E_PULSE_URL` e `REALTIME_E2E_SERVER_KEY`.
- **Não executados.**

## Enums
Sem enums de domínio. Enum público de erro: `IssueError` (`src/publisher.rs`) — `Disabled` (realtime desligado; `POST /realtime/connect` responde `{enabled:false}`) e `Pulse(PulseError)` (Pulse recusou ou não respondeu; vira HTTP 503).
