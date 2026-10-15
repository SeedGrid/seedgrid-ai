---
tags: [seedgrid, extension, realtime, rust, configuracao]
fonte: rust/seedgrid-rust-crate-realtime
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# realtime — Configuração Rust

Visão do crate: [[SeedGrid/Extensions/realtime/Rust|Porte Rust do realtime]] · Java: [[SeedGrid/Extensions/realtime/Configuracao|Configuração do realtime (Java)]].

## Cabeçalho
| Item | Valor |
|---|---|
| Struct | `RealtimeConfig` — `rust/seedgrid-rust-crate-realtime/src/config.rs` |
| Mecanismo | `RealtimeConfig::from_env()` (= `from_lookup(std::env::var)`), `RealtimePublisher::from_env()`, ou struct do host |
| Prefixo Java | `seedgrid.realtime` (`@ConfigMapping` em `java/seedgrid-quarkus-ext-realtime/runtime/.../configs/RealtimeConfig.java`) |
| Leitura | no boot (`from_env`); o limite por minuto é fixado ao montar `rest::router` |

Regra de leitura (`from_lookup`): valor `trim`ado; vazio = ausente; valor que não parseia → padrão.

## Variáveis de ambiente
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_REALTIME_ENABLED` (Java `seedgrid.realtime.enabled`) | bool | `true` (case-insensitive) liga; qualquer outro valor desliga | `false` | Não | desligado: `connect` responde `{enabled:false}` e avisos são no-op | `RealtimePublisher::new` | exige URL + chave | `from_env()` | `config.rs`; `publisher.rs` → `new` |
| `SEEDGRID_REALTIME_PULSE_BASE_URL` (Java `seedgrid.realtime.pulse.base-url`) | `Option<String>` | URL | — | Condicional: obrigatória se ligado | ligado sem ela → log de erro e realtime desligado | `PulsePublisher::builder` | `PULSE_PROJECT_KEY` | `from_env()` | `publisher.rs` → `new` |
| 🔒 `SEEDGRID_REALTIME_PULSE_PROJECT_KEY` (Java `seedgrid.realtime.pulse.project-key`) | `Option<String>` | chave `project` do Pulse | — | Condicional: obrigatória se ligado | idem | idem | `PULSE_BASE_URL` | `from_env()` | idem |
| `SEEDGRID_REALTIME_TOKEN_TTL` (Java `seedgrid.realtime.token-ttl`) | Duration | ISO `PTnHnMnS`; número = segundos; sufixos via `seedgrid_runtime::parse_duration` (ex.: `5m`, `300s`); `0`/inválido → padrão | `PT5M` (300 s) | Não | janela para **conectar** com o token (`ttl_seconds`, mínimo 1) | `issue_connect_token` | — | `from_env()` | `config.rs` → `parse_duration`; `publisher.rs` |
| `SEEDGRID_REALTIME_CHANNELS` (Java `seedgrid.realtime.channels`) | `Option<Vec<String>>` | lista separada por vírgula | todos os da conta (`None`) | Não | channels que o token deixa assinar; também devolvidos no JSON | `issue_connect_token`, `connect` | — | `from_env()` | `config.rs`; `rest.rs` |
| `SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE` (Java `seedgrid.realtime.connect-rate-per-minute`) | u32 | inteiro ≥ 0; `0` desliga | `30` | Não | pedidos de token por minuto, por usuário, por instância | `ConnectRateLimiter` em `rest::router` | — | `from_env()`; fixado em `router()` | `config.rs`; `rest.rs`; `rate_limit.rs` |

Mapeamento Java ↔ env: **Confirmado** (nomes dos métodos do `RealtimeConfig.java` + regra MicroProfile sem ambiguidade; o teste `reads_the_same_env_as_the_java_extension` usa esses nomes). Padrões iguais ao Java (`false`, `PT5M`, `30`).

## Struct `RealtimeConfig`
| Campo | `Default` |
|---|---|
| `enabled` | `false` |
| `pulse_base_url` | `None` |
| `pulse_project_key` | `None` |
| `token_ttl` | 300 s |
| `channels` | `None` |
| `connect_rate_per_minute` | `30` |

## Features Cargo
Nenhuma.

## Somente testes
| Variável | Onde |
|---|---|
| `REALTIME_E2E_PULSE_URL`, 🔒 `REALTIME_E2E_SERVER_KEY` | `tests/pulse_e2e_it.rs` (`#[ignore]`) |

## Configuração mínima
```dotenv
SEEDGRID_REALTIME_ENABLED=true
SEEDGRID_REALTIME_PULSE_BASE_URL=http://<pulse-host>:<porta>
SEEDGRID_REALTIME_PULSE_PROJECT_KEY=<SEGREDO:pulse-project-key>
```

## Configuração completa comentada
```dotenv
SEEDGRID_REALTIME_ENABLED=true
SEEDGRID_REALTIME_PULSE_BASE_URL=http://<pulse-host>:<porta>   # endereço visto pelo backend
SEEDGRID_REALTIME_PULSE_PROJECT_KEY=<SEGREDO:pulse-project-key>
SEEDGRID_REALTIME_TOKEN_TTL=PT5M                              # ou 300 / 5m
SEEDGRID_REALTIME_CHANNELS=backup,report                      # vazio = todos
SEEDGRID_REALTIME_CONNECT_RATE_PER_MINUTE=30                  # 0 desliga
```

## Receitas
- **Desligado (padrão)**: nada a configurar; o front fica no polling.
- **Avisos do backup**: `RealtimePublisher::from_env()` e passe-o em `BackupOverrides.user_events` ([[SeedGrid/Extensions/backup/Configuracao-Rust|Configuração Rust do backup]]).
