---
tags: [seedgrid, versoes, gerado]
gerado-por: scripts/kb-versions.mjs
gerado-em: 2026-10-31
---

# Versões documentadas × atuais

> Nota **gerada por script** a partir dos poms, `package.json`, `Cargo.toml` e do git. Não edite à mão: rode `node scripts/kb-versions.mjs --write`.

## Como usar

- **Documentada**: versão do artefato no commit que as notas da KB declaram descrever (`commit` no frontmatter).
- **Atual**: versão no repositório de origem hoje.
- Compare a **Documentada** com a versão que o seu projeto usa (`pom.xml` / `package.json`). Se forem diferentes, as notas podem não refletir o comportamento do projeto: confirme no código, no jar ou no pacote e avise.
- **Situação** compara o código atual com o commit documentado, ignorando testes, documentação e lockfiles. "Defasada" significa que a nota precisa de revisão; não significa que está errada.
- Em Java, `groupId` é `br.com.seedgrid`; versões são datas (`yyyy.MM.dd`, com sufixo `-N` a partir da segunda publicação do dia) e **não são sincronizadas entre módulos**.

## Java / Quarkus

| Módulo | Artefatos (artifactId) | Documentada | Atual | Situação |
|---|---|---|---|---|
| [[SeedGrid/Extensions/ai-pricing/Visao-geral\|ext-ai-pricing]] | `seedgrid-ai-pricing`, `seedgrid-ai-pricing-integration-tests-no-security`, `seedgrid-ai-pricing-parent` | `2026.10.13` | `2026.10.22` | **defasada**: 35 arquivo(s) de código mudaram em 16 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/apikeys/Visao-geral\|ext-apikeys]] | `seedgrid-apikeys`, `seedgrid-apikeys-parent` | `2026.10.09` | `2026.10.22` | **defasada**: 44 arquivo(s) de código mudaram em 15 commit(s); versão mudou 2026.10.09 → 2026.10.22 |
| [[SeedGrid/Extensions/audit/Visao-geral\|ext-audit]] | `seedgrid-audit`, `seedgrid-audit-core`, `seedgrid-audit-mongodb`, `seedgrid-audit-postgresql` | `2026.09.25` | `2026.10.22` | **defasada**: 52 arquivo(s) de código mudaram em 20 commit(s); versão mudou 2026.09.25 → 2026.10.22 |
| [[SeedGrid/Extensions/backup/Visao-geral\|ext-backup]] | `seedgrid-backup`, `seedgrid-backup-parent` | `2026.10.09` | `2026.10.22` | **defasada**: 39 arquivo(s) de código mudaram em 23 commit(s); versão mudou 2026.10.09 → 2026.10.22 |
| [[SeedGrid/Extensions/billing/Visao-geral\|ext-billing]] | `seedgrid-billing`, `seedgrid-billing-core`, `seedgrid-billing-stripe` | `2026.10.14` | `2026.10.22` | **defasada**: 163 arquivo(s) de código mudaram em 30 commit(s); versão mudou 2026.10.14 → 2026.10.22 |
| [[SeedGrid/Extensions/business-days/Visao-geral\|ext-business-days]] | `seedgrid-business-days`, `seedgrid-business-days-integration-tests-no-security`, `seedgrid-business-days-parent` | — | `2026.10.22` | commit documentado não encontrado |
| [[SeedGrid/Extensions/cities/Visao-geral\|ext-cities]] | `seedgrid-cities`, `seedgrid-cities-integration-tests-no-security`, `seedgrid-cities-parent` | `2026.10.22` | `2026.10.22` | **defasada**: 19 arquivo(s) de código mudaram em 3 commit(s) |
| [[SeedGrid/Extensions/exchange/Visao-geral\|ext-exchange]] | `seedgrid-exchange`, `seedgrid-exchange-integration-tests-no-security`, `seedgrid-exchange-parent` | `2026.10.13` | `2026.10.22` | **defasada**: 33 arquivo(s) de código mudaram em 17 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/filemanagement/Visao-geral\|ext-filemanagement]] | `seedgrid-filemanagement`, `seedgrid-filemanagement-parent` | `2026.07.08` | `2026.10.22` | **defasada**: 59 arquivo(s) de código mudaram em 20 commit(s); versão mudou 2026.07.08 → 2026.10.22 |
| [[SeedGrid/Extensions/login-tenancy/Visao-geral\|ext-login-tenancy]] | `seedgrid-login-tenancy`, `seedgrid-login-tenancy-parent` | `2026.10.14` | `2026.10.22` | **defasada**: 42 arquivo(s) de código mudaram em 29 commit(s); versão mudou 2026.10.14 → 2026.10.22 |
| [[SeedGrid/Extensions/notification/Visao-geral\|ext-notification]] | `seedgrid-notification`, `seedgrid-notification-api`, `seedgrid-notification-integration-tests-no-security`, `seedgrid-notification-parent` | `2026.10.13` | `2026.10.22` | **defasada**: 13 arquivo(s) de código mudaram em 14 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/realtime/Visao-geral\|ext-realtime]] | `seedgrid-realtime`, `seedgrid-realtime-parent` | `2026.10.08` | `2026.10.22` | **defasada**: 4 arquivo(s) de código mudaram em 9 commit(s); versão mudou 2026.10.08 → 2026.10.22 |
| [[SeedGrid/Extensions/resilience/Visao-geral\|ext-resilience]] | `seedgrid-resilience-core`, `seedgrid-resilience-core-parent` | `2026.10.13` | `2026.10.22` | **defasada**: 22 arquivo(s) de código mudaram em 10 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/security/Visao-geral\|ext-security]] | `seedgrid-security`, `seedgrid-security-parent` | `2026.10.13` | `2026.10.22` | **defasada**: 283 arquivo(s) de código mudaram em 58 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral\|ext-subdomain-tenancy]] | `seedgrid-subdomain-tenancy`, `seedgrid-subdomain-tenancy-parent` | `2026.10.14` | `2026.10.22` | **defasada**: 65 arquivo(s) de código mudaram em 33 commit(s); versão mudou 2026.10.14 → 2026.10.22 |
| [[SeedGrid/Extensions/whatsapp/Visao-geral\|ext-whatsapp]] | `seedgrid-whatsapp`, `seedgrid-whatsapp-core`, `seedgrid-whatsapp-core-deployment`, `seedgrid-whatsapp-evolution`, `seedgrid-whatsapp-whatsapp-cloud` | `2026.08.16` | `2026.10.22` | **defasada**: 27 arquivo(s) de código mudaram em 10 commit(s); versão mudou 2026.08.16 → 2026.10.22 |
| [[SeedGrid/Extensions/cache/Visao-geral\|lib-cache]] | `seedgrid-cache`, `seedgrid-cache-core`, `seedgrid-cache-dragonfly`, `seedgrid-cache-redis`, `seedgrid-cache-testkit`, `seedgrid-cache-valkey` | `2026.10.13` | `2026.10.22` | **defasada**: 83 arquivo(s) de código mudaram em 25 commit(s); versão mudou 2026.10.13 → 2026.10.22 |
| [[SeedGrid/Extensions/commons/Visao-geral\|lib-commons]] | `seedgrid-commons` | `2026.10.08` | `2026.10.22` | **defasada**: 40 arquivo(s) de código mudaram em 16 commit(s); versão mudou 2026.10.08 → 2026.10.22 |
| [[SeedGrid/Extensions/privacy/Visao-geral\|lib-privacy]] | `seedgrid-privacy` | `2026.07.27` | `2026.10.22` | **defasada**: 12 arquivo(s) de código mudaram em 5 commit(s); versão mudou 2026.07.27 → 2026.10.22 |

## Front-end (npm)

| Pacote | Documentada | Atual | Situação |
|---|---|---|---|
| `@seedgrid/fe-apikeys` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-audit` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-backup` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-billing-platform` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-billing-user` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-login-tenancy` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-security` | `2026.7.3` | `2026.7.3` | em dia |
| `@seedgrid/fe-self-enter` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-subdomain-tenancy` | `2026.7.0` | `2026.7.0` | em dia |
| `@seedgrid/fe-commons` | `0.2.0` | `0.2.0` | em dia |
| `@seedgrid/fe-components` | `2026.7.1` | `2026.7.1` | **defasada**: 35 arquivo(s) de código mudaram em 5 commit(s) |
| `@seedgrid/fe-core` | `2026.7.1` | `2026.7.1` | em dia |
| `@seedgrid/fe-playground` | `0.1.0` | `0.1.0` | em dia |
| `@seedgrid/fe-theme` | `0.3.0` | `0.3.0` | em dia |

## Rust

| Crates | Documentada | Atual | Situação |
|---|---|---|---|
| seedgrid-rust-crate-* (workspace) | `2026.7.27` | `2026.10.17` | **defasada**: 205 arquivo(s) de código mudaram em 51 commit(s); versão mudou 2026.7.27 → 2026.10.17 |
