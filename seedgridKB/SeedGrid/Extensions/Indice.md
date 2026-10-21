---
tags: [seedgrid, extension, indice]
analisado-em: 2026-10-14
---

# Índice das extensions

Extensions Quarkus, libraries Java e crates Rust equivalentes. Commits analisados: [[SeedGrid/Mapa-dos-repositorios|Mapa dos repositórios]]. Todas as propriedades em uma tabela: [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]].

Contagens de propriedades por extension e plataforma: [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]]. Enums: [[SeedGrid/Extensions/Catalogo-de-enums|Catálogo de enums]].

## Auth, identidade e tenancy

| Extension | Para que serve | Java | Rust |
|---|---|---|---|
| security | JWT RS256, RBAC aditivo, token escopado por empresa, 2FA (TOTP/e-mail/WhatsApp), self-enter, gestão de usuários/roles/empresas. Base das demais. | [[SeedGrid/Extensions/security/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/security/Configuracao\|Config]] · [[SeedGrid/Extensions/security/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/security/Enums|Enums]] | [[SeedGrid/Extensions/security/Rust\|Rust]] · [[SeedGrid/Extensions/security/Configuracao-Rust\|Config]] |
| apikeys | API keys `sgkey_` com permissões derivadas da role (máquina-a-máquina). | [[SeedGrid/Extensions/apikeys/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/apikeys/Configuracao\|Config]] · [[SeedGrid/Extensions/apikeys/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/apikeys/Enums|Enums]] | [[SeedGrid/Extensions/apikeys/Rust\|Rust]] · [[SeedGrid/Extensions/apikeys/Configuracao-Rust\|Config]] |
| login-tenancy | Fundação single-database multi-empresa (POOLED): orquestra módulos, signup institucional, isolamento por company. | [[SeedGrid/Extensions/login-tenancy/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/login-tenancy/Configuracao\|Config]] · [[SeedGrid/Extensions/login-tenancy/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/login-tenancy/Enums|Enums]] | [[SeedGrid/Extensions/login-tenancy/Rust\|Rust]] · [[SeedGrid/Extensions/login-tenancy/Configuracao-Rust\|Config]] |
| subdomain-tenancy | Multitenancy por subdomínio com banco por tenant: resolução por host, provisionamento, migrations por tenant. | [[SeedGrid/Extensions/subdomain-tenancy/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/subdomain-tenancy/Configuracao\|Config]] · [[SeedGrid/Extensions/subdomain-tenancy/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/subdomain-tenancy/Enums|Enums]] | [[SeedGrid/Extensions/subdomain-tenancy/Rust\|Rust]] · [[SeedGrid/Extensions/subdomain-tenancy/Configuracao-Rust\|Config]] |

## Billing e preços

| Extension | Para que serve | Java | Rust |
|---|---|---|---|
| billing | Assinaturas: planos, uso, checkout, portal, webhooks; provider Stripe. | [[SeedGrid/Extensions/billing/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/billing/Configuracao\|Config]] · [[SeedGrid/Extensions/billing/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/billing/Enums|Enums]] | [[SeedGrid/Extensions/billing/Rust\|Rust]] · [[SeedGrid/Extensions/billing/Configuracao-Rust\|Config]] |
| ai-pricing | Catálogo de modelos LLM e histórico de preços por 1M tokens; robô agendado propõe mudanças com aprovação humana (só Java). | [[SeedGrid/Extensions/ai-pricing/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/ai-pricing/Configuracao\|Config]] · [[SeedGrid/Extensions/ai-pricing/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/ai-pricing/Enums|Enums]] | — |
| exchange | Moedas e cotações diárias com histórico; fontes configuráveis por cadastro, retry; seed USD-BRL PTAX (só Java). | [[SeedGrid/Extensions/exchange/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/exchange/Configuracao\|Config]] · [[SeedGrid/Extensions/exchange/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/exchange/Enums|Enums]] | — |
| business-days | Calendário de dias úteis: feriados (recorrentes ou de um ano), semana de trabalho (peso 0/0,5/1) e cálculo de dias úteis; escopo por empresa (JPA puro). | [[SeedGrid/Extensions/business-days/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/business-days/Configuracao\|Configuração]] · [[SeedGrid/Extensions/business-days/Exemplos\|Exemplos]] |

## Dados, auditoria e compliance

| Extension | Para que serve | Java | Rust |
|---|---|---|---|
| audit | Trilha de auditoria before/after com `@SgAudit`; stores PostgreSQL e MongoDB. | [[SeedGrid/Extensions/audit/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/audit/Configuracao\|Config]] · [[SeedGrid/Extensions/audit/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/audit/Enums|Enums]] | [[SeedGrid/Extensions/audit/Rust\|Rust]] · [[SeedGrid/Extensions/audit/Configuracao-Rust\|Config]] |
| backup | Export de dados por tenant/usuário (ZIP), jobs assíncronos, storage plugável, notificação por e-mail. | [[SeedGrid/Extensions/backup/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/backup/Configuracao\|Config]] · [[SeedGrid/Extensions/backup/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/backup/Enums|Enums]] | [[SeedGrid/Extensions/backup/Rust\|Rust]] · [[SeedGrid/Extensions/backup/Configuracao-Rust\|Config]] |
| privacy *(library)* | Criptografia de campo AES-256-GCM + hash de busca HMAC-SHA256 (LGPD). | [[SeedGrid/Extensions/privacy/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/privacy/Configuracao\|Config]] · [[SeedGrid/Extensions/privacy/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/privacy/Enums|Enums]] | [[SeedGrid/Extensions/privacy/Rust\|Rust]] · [[SeedGrid/Extensions/privacy/Configuracao-Rust\|Config]] |

## Comunicação e tempo real

| Extension | Para que serve | Java | Rust |
|---|---|---|---|
| notification | Notificações administrativas por e-mail/WhatsApp com catálogo de eventos, outbox transacional e worker com retry; módulo `api` separado (só Java). | [[SeedGrid/Extensions/notification/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/notification/Configuracao\|Config]] · [[SeedGrid/Extensions/notification/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/notification/Enums|Enums]] | — |
| whatsapp | Envio de WhatsApp via Evolution API e Meta Cloud API; provider trocável. | [[SeedGrid/Extensions/whatsapp/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/whatsapp/Configuracao\|Config]] · [[SeedGrid/Extensions/whatsapp/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/whatsapp/Enums|Enums]] | [[SeedGrid/Extensions/whatsapp/Rust\|Rust]] · [[SeedGrid/Extensions/whatsapp/Configuracao-Rust\|Config]] |
| realtime | Avisos em tempo real ao usuário logado via SeedGrid Pulse (token de conexão + repasse de `SgUserEvent`). | [[SeedGrid/Extensions/realtime/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/realtime/Configuracao\|Config]] · [[SeedGrid/Extensions/realtime/Exemplos\|Exemplos]] | [[SeedGrid/Extensions/realtime/Rust\|Rust]] · [[SeedGrid/Extensions/realtime/Configuracao-Rust\|Config]] |
| broker | Mensageria com SPI e backends memory/redis/nats/rabbitmq (só Rust). | — | [[SeedGrid/Extensions/broker/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/broker/Configuracao-Rust\|Config]] |

## Infraestrutura

| Extension | Para que serve | Java | Rust |
|---|---|---|---|
| resilience | Rate limiting e circuit breaker declarativos (`@SgRateLimit`, `@SgCircuitBreaker`), cache-backed. | [[SeedGrid/Extensions/resilience/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/resilience/Configuracao\|Config]] · [[SeedGrid/Extensions/resilience/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/resilience/Enums|Enums]] | [[SeedGrid/Extensions/resilience/Rust\|Rust]] · [[SeedGrid/Extensions/resilience/Configuracao-Rust\|Config]] |
| cache *(library)* | API única sobre Redis/Valkey/Dragonfly. | [[SeedGrid/Extensions/cache/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/cache/Configuracao\|Config]] · [[SeedGrid/Extensions/cache/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/cache/Enums|Enums]] | [[SeedGrid/Extensions/cache/Rust\|Rust]] · [[SeedGrid/Extensions/cache/Configuracao-Rust\|Config]] |
| filemanagement *(library)* | Storage de arquivos: filesystem, S3, MinIO, Azure Blob, GCS, Google Drive, OneDrive (config por mapa passado pelo chamador). | [[SeedGrid/Extensions/filemanagement/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/filemanagement/Configuracao\|Config]] · [[SeedGrid/Extensions/filemanagement/Exemplos\|Exemplos]] | [[SeedGrid/Extensions/filemanagement/Rust\|Rust]] · [[SeedGrid/Extensions/filemanagement/Configuracao-Rust\|Config]] |
| commons *(library)* | Utilitários, validadores, entidades base, CORS, timezone de negócio. | [[SeedGrid/Extensions/commons/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/commons/Configuracao\|Config]] · [[SeedGrid/Extensions/commons/Exemplos\|Exemplos]] · [[SeedGrid/Extensions/commons/Enums|Enums]] | — |
| runtime | `seedgrid-runtime` + `seedgrid-macros`: auto-wiring `#[startup]`/`#[scheduled]` (só Rust). | — | [[SeedGrid/Extensions/runtime/Visao-geral\|Visão geral]] · [[SeedGrid/Extensions/runtime/Configuracao-Rust\|Config]] |

## Montar um produto

- [[SeedGrid/Extensions/Propriedades-para-subir|Propriedades para subir]]: o que o `dev.env` precisa e como gerar cada segredo.
- [[SeedGrid/Extensions/Servicos-de-apoio|Serviços de apoio]]: imagem, porta e variáveis de cada serviço do `docker-compose.yml`.
- [[SeedGrid/Extensions/Mailpit-uso|Usar o Mailpit]]: ver o e-mail do produto, apontar o SMTP, consultar a API em teste (Awaitility) e diagnosticar e-mail que não chega.

## Totais

- 17 módulos Java documentados (13 extensions + 4 libraries) e 15 unidades Rust (13 crates de porte + broker + runtime/macros).
- Contagens de propriedades e enums: ver [[SeedGrid/Extensions/Catalogo-de-propriedades|Catálogo de propriedades]] e [[SeedGrid/Extensions/Catalogo-de-enums|Catálogo de enums]].

## Não documentados como extension

`seedgrid-parent` (POM pai), `seedgrid-cli`, `seedgrid-components-mcp` e `platform-examples/examples/*`: ver [[SeedGrid/Mapa-dos-repositorios|Mapa dos repositórios]].
