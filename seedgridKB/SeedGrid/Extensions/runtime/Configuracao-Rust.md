---
tags: [seedgrid, extension, runtime, rust, configuracao]
fonte: rust/seedgrid-runtime, rust/seedgrid-macros
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# runtime — Configuração Rust

Visão geral: [[SeedGrid/Extensions/runtime/Visao-geral|Visão geral do runtime]]. Não há equivalente Java (o análogo é o comportamento do container Quarkus).

## Cabeçalho
| Item | Valor |
|---|---|
| Mecanismos | (1) `BootstrapOptions` em runtime; (2) **atributos das macros** (fixados em compilação); (3) uma leitura de ambiente: `default_gate(key)` |
| Variáveis de ambiente | **nenhum nome fixo**: `default_gate` lê a variável cujo nome é o valor de `#[scheduled(enabled_if = "...")]` (`rust/seedgrid-runtime/src/bootstrap.rs` → `default_gate`) |
| Features Cargo | nenhuma (nas duas crates) |

## Runtime: `BootstrapOptions` e gate
| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `BootstrapOptions.fail_fast` | bool | — | `true` | Não | primeiro erro de `#[startup]` aborta o boot (`Err` com contexto); `false` loga e segue | `run_startups` | — | `bootstrap_with` | `src/bootstrap.rs` |
| `BootstrapOptions.run_startup` | bool | — | `true` | Não | roda as `#[startup]` | `bootstrap_with` | — | idem | idem |
| `BootstrapOptions.run_scheduled` | bool | — | `true` | Não | spawna as `#[scheduled]` | `bootstrap_with` | — | idem | idem |
| `BootstrapOptions.gate` (`with_gate`) | `Fn(&str) -> bool` | — | `default_gate` | Não | decide se cada `enabled_if` está ligado | `spawn_all_scheduled` | `enabled_if` | idem | idem |
| `<valor de enabled_if>` (env var dinâmica) | bool | `true`, `1`, `yes`, `on` (case-insensitive, `trim`); ausente/outro = desligado | desligado | Condicional: só para tasks com `enabled_if` | task não é spawnada quando falso (log `info`) | `default_gate` | substituível por `with_gate` | no `bootstrap` | `src/bootstrap.rs` → `default_gate` |

No workspace, nenhuma crate de plataforma declara `enabled_if`; só aparecem `FEATURE_REPORTS` (teste `tests/macros.rs`) e `REPORTS_ENABLED` (doc) como exemplos.

## Macros (configuração em compilação)

### `#[startup]`
| Atributo | Tipo | Padrão | Observação |
|---|---|---|---|
| `priority` | i32 | `100` (neutra; `seedgrid-macros/src/lib.rs` → `startup`) | menor roda antes |

### `#[scheduled]` (exatamente um de `cron`/`every`)
| Atributo | Tipo | Padrão | Observação |
|---|---|---|---|
| `cron` | String | — | quartz de 6 campos (`seg min hora dia-mes mes dia-semana`); inválido → task não iniciada (log de erro) |
| `every` | String | — | `Nms`, `Ns`, `Nm`, `Nh`, `Nd`; zero/inválido → não iniciada |
| `enabled_if` | String | — (sempre ligada) | nome da env var do gate |
| `concurrent` | bool | `false` (SKIP) | `true` = PROCEED |
| `delay` | String | — | atraso inicial, mesmo formato de `every` |

### `#[default_provider]`
`spi` (obrigatório), `provider`, `priority` (padrão `0`; maior vence em `resolve_spi`).

### `#[rate_limit]` (→ `seedgrid-resilience`)
| Atributo | Padrão | Observação |
|---|---|---|
| `config_key` | `""` | habilita overrides `seedgrid.ratelimit.<key>.*` da `ConfigSource` do `RateLimitService` ([[SeedGrid/Extensions/resilience/Configuracao-Rust\|Configuração Rust do resilience]]) |
| `permits` | `5` | |
| `window` | `"30s"` | |
| `algorithm` | `"fixed_window"` | `fixed_window`, `sliding_window`, `token_bucket` |
| `service` | — | **obrigatório**: caminho de função que devolve `Arc<RateLimitService>` |
| `context` | `EmptySeedGridInvocationContext` | expressão de contexto (limite global por método se omitido) |

Retorno exigido: `Result<T, E>` com `E: From<RateLimitExceededException>`.

### `#[circuit_breaker]` (→ `seedgrid-resilience`)
| Atributo | Padrão | Observação |
|---|---|---|
| `name` | — | **obrigatório** |
| `failure_rate_threshold` | `50.0` | |
| `open_state_duration` | `"30s"` | |
| `minimum_number_of_calls` | `20` | |
| `sliding_window_size` | `100` | |
| `cache` | — | **obrigatório**: provider de `Arc<InMemoryCache>` ou `Arc<dyn SeedGridCacheProvider>` |
| `fallback` | — | função sem argumentos com o mesmo `Result<T, E>` |

### `#[audited]` (→ `seedgrid-audit`)
`entity` (FQCN, obrigatório), `operation` (`CREATE`, `UPDATE`, `DELETE`, `READ`, `OTHER`; obrigatório), `description`, `auditor` (obrigatório; provider de `impl Auditor`), `user` (expr), `context` (expr `AuditContext`, vence `user`), `before` (expr avaliada antes do corpo), `mask_rules` (expr `Vec<MaskRule>`), `capture_return` (padrão `true` em CREATE/UPDATE; serializa `Ok(T)`, exige `T: Serialize`). Audita só no sucesso.

### `#[derive(PersonalData)]` (→ `seedgrid-privacy`)
Atributo de campo `#[personal_data(...)]` (alias `#[encrypted(...)]`): `search = "campo_hash"`, `normalize = "email" | "canonical" | "none"` (padrão `canonical`), `nested` (desce em struct que também deriva `PersonalData`). Ver [[SeedGrid/Extensions/privacy/Configuracao-Rust|Configuração Rust do privacy]].

Fonte de todos os atributos: `rust/seedgrid-macros/src/lib.rs` (parsers `meta.path.is_ident(...)`) e README do runtime. Padrões de `#[startup]` e `#[rate_limit]` conferidos nos parsers; os de `#[circuit_breaker]` são `Option` no parser e o valor efetivo vem dos defaults de `SeedGridCircuitBreaker` (README; **Inferência** coerente com `config_resolver.rs`); os de `#[audited]` vêm do README.

## Somente exemplos/testes
| Variável | Onde |
|---|---|
| `FEATURE_REPORTS` | `tests/macros.rs` (gate de teste) |
| `RUST_LOG` | não usado; os exemplos fixam o nível em código |

## Receitas
- **Ligar uma rotina só em produção**: `#[scheduled(cron = "0 0 3 * * ?", enabled_if = "NIGHTLY_JOB_ENABLED")]` + `NIGHTLY_JOB_ENABLED=true` no ambiente.
- **Gate a partir de outra fonte (ex.: arquivo de config)**: `bootstrap_with(BootstrapOptions::new().with_gate(|k| minha_config.flag(k)))`.
- **Boot tolerante a falhas**: `BootstrapOptions { fail_fast: false, ..Default::default() }`.
