---
description: "Propriedades seedgrid.security.social.* do módulo opcional seedgrid-security-social (login com Google, Facebook e Apple sobre o quarkus-oidc): provedores, credenciais, hosts de retorno, URL de erro e TTL do ticket, mais as chaves seedgrid.security.frontend.* que o módulo lê."
tags: [seedgrid, extension, security-social, login-social, configuracao]
fonte: java/seedgrid-quarkus-ext-security-social
branch: main
commit: d7482cf197
analisado-em: 2026-11-11
---

# security-social — Configuração (Quarkus)

Voltar para [[SeedGrid/Extensions/security/Visao-geral|Visão geral do security]] · [[SeedGrid/Extensions/security/Login-social-Google|Login com Google]] · [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]] · [[SeedGrid/Extensions/security-social/Configuracao-Rust|Configuração Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Módulo | `java/seedgrid-quarkus-ext-security-social` (pacote `br.com.seedgrid.security.socialoidc`), módulo **opcional** sobre o `quarkus-oidc`; nasce **inerte** (nenhum provedor ligado) |
| Prefixos | `seedgrid.security.social.*` (próprio) e `seedgrid.security.frontend.{base-url,login-path}` (do security, lidos aqui) |
| Mecanismo | `@ConfigProperty` (`social.error-url`, `social.ticket-ttl`, `frontend.base-url`, `frontend.login-path`), `getOptionalValue(...)` (`social.providers`, `social.allowed-return-hosts`, `frontend.base-url`, chaves por provedor no `SocialConfigValidator`) e um `ConfigSourceInterceptor` (`SocialProvidersConfigInterceptor`) que liga o tenant `quarkus.oidc.social-<id>` só para os ids listados em `social.providers`. Não há `@ConfigMapping` nem `@ConfigRoot` |
| Defaults embarcados | `runtime/src/main/resources/META-INF/microprofile-config.properties` do módulo |
| Fase | **Runtime**, exceto as chaves por provedor, que o `SocialConfigValidator` confere no boot (provedor listado sem credencial ou id desconhecido: o boot **falha**) |

## 2. Propriedades próprias do módulo

### 2.1 Provedores e credenciais (`seedgrid.security.social.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.social.providers` | lista | `google`, `facebook`, `apple` | vazio (módulo inerte) | Não | Provedores de login social ligados. Id desconhecido ou provedor sem credencial: o boot **falha**. Não há chave "enabled" por provedor. | `seedgrid-security-social` | Exige as chaves `social.<provedor>.*` | Boot | README do módulo |
| `seedgrid.security.social.<provedor>.client-id` | String | id do cliente OAuth | `unset` | Sim, para o provedor listado | Credencial do cliente no provedor. Env: `SEEDGRID_SECURITY_SOCIAL_<PROVEDOR>_CLIENT_ID`. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.client-secret` 🔒 | String | segredo do cliente | placeholder desligado | Sim, para o provedor listado | Segredo do cliente no provedor; só por variável de ambiente. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.state-secret` 🔒 | String | 32 caracteres ou mais | placeholder desligado | Sim, para o provedor listado | Cifra o estado do fluxo; **igual em todas as instâncias**. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.encryption-secret` 🔒 | String | 32 caracteres ou mais | placeholder desligado | Sim, para o provedor listado | Cifra o cookie de sessão do fluxo OIDC; **igual em todas as instâncias**. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.redirect-uri` | String | caminho ou URL absoluta terminada em `/public/auth/social/<provedor>/callback` | `/public/auth/social/<provedor>/callback` | Sim, em produção | A `redirect_uri` cadastrada no provedor (o Google exige URL exata). | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |

### 2.2 Apple (`seedgrid.security.social.apple.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.social.apple.team-id` | String | Team ID da conta Apple | `unset` | Sim, para `apple` | Emissor (`iss`) do client secret JWT da Apple. Env: `SEEDGRID_SECURITY_SOCIAL_APPLE_TEAM_ID`. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.apple.key-id` | String | Key ID da chave `.p8` | `unset` | Sim, para `apple` | Identifica a chave que assina o client secret. Env: `SEEDGRID_SECURITY_SOCIAL_APPLE_KEY_ID`. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.apple.private-key-file` 🔒 / `.private-key` 🔒 | String | caminho do `.p8` ou o conteúdo da chave | vazio | Sim, uma das duas, para `apple` | Chave privada que assina o client secret (a Apple não tem segredo fixo). Só por variável de ambiente ou arquivo montado. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.apple.client-secret-lifespan` | int (segundos) | 1 ou mais | `300` | Não | Validade do client secret JWT gerado. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |

### 2.3 Retorno ao front (`allowed-return-hosts`, `error-url`, `ticket-ttl`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.social.allowed-return-hosts` | lista | `host`, `host:porta`, `*.dominio` | host de `frontend.base-url` | Não | Hosts do front permitidos em `returnTo` (anti *open redirect*). | `seedgrid-security-social` | `seedgrid.security.frontend.base-url` | Runtime | `getOptionalValue` em `…/socialoidc/services/SocialReturnUrlPolicy`; comentário no `microprofile-config.properties` do módulo |
| `seedgrid.security.social.error-url` | String | URL do front | `frontend.base-url` + `frontend.login-path` | Não | Para onde voltar em falha do provedor (ex.: usuário cancelou). | `seedgrid-security-social` | — | Runtime | `@ConfigProperty` (`Optional<String>`) em `…/socialoidc/controllers/SocialAuthController`; comentário no `microprofile-config.properties` do módulo |
| `seedgrid.security.social.ticket-ttl` | Duration | ISO-8601 | `PT60S` | Não | Validade do ticket de uso único que leva o resultado ao front. | `seedgrid-security-social` | — | Runtime | `@ConfigProperty(defaultValue = "PT60S")` em `…/socialoidc/services/SocialTicketService`; comentário no `microprofile-config.properties` do módulo |

### 2.4 Chaves do security lidas pelo módulo (`seedgrid.security.frontend.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.frontend.base-url` | String | origem `http(s)://host[:porta]` | `http://localhost:3000` | Não | Base do front: de onde saem o destino padrão de falha (`error-url`) e, sem `allowed-return-hosts`, o único host aceito em `returnTo`. Chave **do security** (§2.8 da [[SeedGrid/Extensions/security/Configuracao\|Configuração do security]]), lida também por este módulo | `SocialAuthController`, `SocialReturnUrlPolicy` | `social.error-url`, `social.allowed-return-hosts` | Runtime | `@ConfigProperty` em `…/socialoidc/controllers/SocialAuthController` (padrão `http://localhost:3000`); `SocialReturnUrlPolicy` lê via `getOptionalValue` (sem padrão próprio); mp-config do security |
| `seedgrid.security.frontend.login-path` | String | começa com `/` | `/login` | Não | Caminho de login no front; somado a `frontend.base-url` forma o destino padrão de `social.error-url`. Chave **do security**, lida também por este módulo | `SocialAuthController` | `frontend.base-url`, `social.error-url` | Runtime | `@ConfigProperty` em `SocialAuthController` (padrão `/login`); mp-config do security |

## 3. Propriedades de frameworks/bibliotecas configuradas pelo módulo

O `microprofile-config.properties` do módulo fixa (Confirmado no arquivo):

- `quarkus.oidc.tenant-enabled=false` e `quarkus.keycloak.devservices.enabled=false`: o tenant padrão do `quarkus-oidc` fica desligado (o Bearer próprio do SeedGrid segue valendo) e o Keycloak de dev services não sobe.
- `quarkus.oidc.social-<google|facebook|apple>.*`: um tenant por provedor (provider, client-id, segredos, `redirect-path`, `cookie-path=/public/auth/social/<id>`, PKCE obrigatório, `error-path`), ligado só se o id estiver em `social.providers`. No Facebook o segredo vai no corpo (`credentials.client-secret.method=post`) e o emissor do ID token é fixo. Na Apple o cookie de estado usa `cookie-same-site=none` com `cookie-force-secure=true` e o client secret é um JWT assinado com a chave `.p8`.
- `quarkus.http.auth.permission.seedgrid-social-authorize`: `paths=/public/auth/social/*/authorize`, `policy=authenticated`.

## 4. Variáveis de ambiente

Os padrões do `microprofile-config.properties` usam `${SEEDGRID_SECURITY_SOCIAL_<PROVEDOR>_<CAMPO>:padrão}` para `client-id`, `client-secret`, `state-secret`, `encryption-secret`, `redirect-uri` e, na Apple, `team-id`, `key-id`, `private-key-file`, `private-key` e `client-secret-lifespan`. `providers`, `allowed-return-hosts`, `error-url` e `ticket-ttl` não têm expressão de ambiente no arquivo: valem pela regra MicroProfile (`SEEDGRID_SECURITY_SOCIAL_PROVIDERS` etc.).

Porte Rust (variáveis `SEEDGRID_SECURITY_SOCIAL_*` do crate): [[SeedGrid/Extensions/security-social/Configuracao-Rust|Configuração Rust do security-social]].
