---
description: "Porte Rust do módulo opcional de login social OIDC (seedgrid-security-social): coordenadas, configuração e enums públicos (SameSite)."
tags: [seedgrid, extension, security-social, rust, login-social]
fonte: rust/seedgrid-rust-crate-security-social
branch: main
commit: 7b5b6e15cd
analisado-em: 2026-11-11
---

# `seedgrid-security-social` — porte Rust

Porte do módulo Java `seedgrid-quarkus-ext-security-social` (pacote `socialoidc`): login social OIDC (Google, Facebook, Apple e provedores customizados) sobre o crate `seedgrid-security`, com router Axum montável. Fonte: `Cargo.toml` e `src/lib.rs` do crate.

## Coordenadas

| Item | Valor |
|---|---|
| Diretório | `rust/seedgrid-rust-crate-security-social` |
| Pacote Cargo / lib | `seedgrid-security-social` / `seedgrid_security_social` |
| Versão | `2026.10.22` |
| Dependências SeedGrid | `seedgrid-security` (SPIs, `SocialLoginService`, `SecurityError`) e `seedgrid-rust-crate-cache` (tickets) |

Configuração: [[SeedGrid/Extensions/security-social/Configuracao-Rust|Configuração Rust do security-social]]. Java: [[SeedGrid/Extensions/security-social/Configuracao|Configuração do security-social (Quarkus)]] e [[SeedGrid/Extensions/security/Login-social-Google|Login com Google]].

## Enums

Enums públicos do crate (`rust/seedgrid-rust-crate-security-social/src`). O Java não tem enum equivalente (o `quarkus-oidc` configura o `SameSite` por texto).

| Enum | Arquivo | Usado em | Equivalente Java |
|---|---|---|---|
| `SameSite` (`Lax`, `None`) | `src/config.rs` | `ProviderConfig.cookie_same_site`; `web.rs` grava o atributo `SameSite` dos cookies do fluxo | `quarkus.oidc.social-<id>.authentication.cookie-same-site` (texto) |

### SameSite

| Variante | Valor no cookie | Onde é tratado |
|---|---|---|
| `Lax` | `SameSite=Lax` | padrão de `ProviderConfig::blank` e dos presets google e facebook |
| `None` | `SameSite=None` | preset da Apple (`presets.rs`): o callback é um POST cross-site (`form_post`), por isso também `cookie_force_secure = true` |

- `web.rs` → `same_site(SameSite)` converte para o texto do atributo. Sem serde; derives `Debug, Clone, Copy, PartialEq, Eq`.
- Não há variável de ambiente para `cookie_same_site`: só struct.
