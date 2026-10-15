---
tags: [seedgrid, extension, security, rust, configuracao]
fonte: rust/seedgrid-rust-crate-security
branch: main
commit: be738a2d1e
analisado-em: 2026-10-14
---

# Configuração Rust — `seedgrid-security`

Volta para: [[SeedGrid/Extensions/security/Rust|Porte Rust do security]] · Java: [[SeedGrid/Extensions/security/Configuracao|Configuração do security (Quarkus)]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Crate / pacote | diretório `rust/seedgrid-rust-crate-security`, pacote Cargo `seedgrid-security`, lib `seedgrid_security` |
| Struct de config | `SecurityConfig` (agrega `JwtConfig`, `RefreshTokenConfig`, `PasswordConfig`, `TwoFactorConfig`, `EncryptionConfig`, `PrivacyConfig`, `SelfEnterConfig`, `FrontendConfig`, `AvatarConfig`, `FirstAdminUserConfig`, `DefaultCompanyConfig`, `MailerConfig`, `UserAttributesConfig`, `AccountManagementConfig`) — `src/config.rs` |
| Mecanismo | variáveis de ambiente lidas com `std::env::var` em `SecurityConfig::from_env()` (no boot, uma vez). O host pode também montar `SecurityConfig::new(JwtConfig)` e alterar campos à mão. Fora do `from_env`, uma única env é lida no `SecurityStateBuilder::build()` (`SEEDGRID_SECURITY_TEMPLATES_DIR`). |
| Quem chama `from_env` | o host; ou `SecurityPlatform::assemble` (`src/platform.rs`); ou os orquestradores `login-tenancy::assemble_all` e `subdomain-tenancy::assemble_all` |
| Falha | `from_env` só devolve `Err` quando **nenhuma** fonte de chave RSA está presente (ou base64 inválido / arquivo ilegível). `SecurityPlatform::assemble` trata esse `Err` como "security desabilitado" (`Ok(None)`). Valores numéricos/durações inválidos são **ignorados silenciosamente** (fica o default). |
| Features Cargo | **nenhuma** (`Cargo.toml` não declara `[features]`). |
| Origem (caminho base) | todas as origens abaixo são relativas a `rust/seedgrid-rust-crate-security/` |

### Convenções de nomes e precedência (Confirmado)

O crate aceita **dois "dialetos"** de env, para que o mesmo `dev.env` funcione no Java e no Rust:

- `SEEDGRID_SECURITY_*` — nomes usados no `META-INF/microprofile-config.properties` do módulo Java (`${SEEDGRID_SECURITY_...:default}`).
- `SECURITY_*` — nomes usados nos `application.properties` dos **exemplos Java** (`java/examples/*/application.properties`, ex.: `seedgrid.security.jwt.issuer=${SECURITY_JWT_ISSUER:...}`) e nomes históricos do crate.

Regra de precedência quando há os dois: **a primeira env listada que existir vence** (`env::var(a).or_else(|_| env::var(b))`). Na maioria dos grupos o nome `SEEDGRID_*` vem primeiro. Exceções importantes:

- **JWT issuer/kid/ttl, refresh, senha, self-enter enabled/public/invite**: só o nome `SECURITY_*` é lido. `SEEDGRID_SECURITY_JWT_ISSUER`, `SEEDGRID_SECURITY_JWT_KID`, `SEEDGRID_SECURITY_JWT_TTL` (nomes do módulo Java) **não** são lidos pelo crate (Confirmado por grep).
- **2FA, default company corporate/trade name, account audiences**: só o nome `SEEDGRID_*` é lido.
- "Existir" difere por grupo: em `fe_env`/`first_env` uma env vazia/branca conta como ausente (passa para o alias); em `env::var(a).or_else(...)` simples (ex.: `SEEDGRID_PRIVACY_CRYPTO_KEY`, mailer password, 2FA enabled) uma env **vazia porém definida** vence e é usada.

Parsing:
- **Booleanos** (`parse_bool`): `true/1/yes/on` (sem caixa) → `true`; qualquer outra coisa → `false`. Exceção: `SECURITY_SELF_ENTER_ENABLED/PUBLIC_ENABLED/INVITE_ENABLED` usam comparação literal `v == "true"` (case-sensitive).
- **Durações** (`parse_duration_to_seconds`): inteiro puro = segundos; ISO-8601 subset `PnDTnHnMnS` (sem semanas/meses/anos); sufixo `8h`/`30m`/`45s`/`30d`. Formato não reconhecido → ignorado (fica o default).
- **CSV** (`parse_csv` / split manual): itens aparados, vazios descartados.

## 2. Propriedades do crate

Colunas: **Leitura** = quando é lida. "boot" = `SecurityConfig::from_env()`; "build" = `SecurityStateBuilder::build()`; "struct" = só campo de struct (sem env), definido pelo host.

### 2.1 JWT (chaves RSA, issuer, TTL)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64` → `jwt.private_key_pem` | `Vec<u8>` | base64 do **DER PKCS#8** (sem header PEM); espaços/quebras ignorados | — | Condicional: uma das 4 fontes da chave privada é obrigatória | 1ª na precedência; DER é reembrulhado em PEM `PRIVATE KEY` (`der_to_pem`). Base64 inválido → `Err` | assina o access token RS256 (`crypto::jwt::JwtKeys::from_rsa_pem`) | Java: `seedgrid.security.jwt.private-key-base64` (Confirmado, mesmo nome de env) | boot | `src/config.rs` → `read_rsa_key`; consumo `src/state.rs` → `SecurityStateBuilder::build` |
| 🔒 `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64` → `jwt.public_key_pem` | `Vec<u8>` | base64 do **DER X.509/SPKI** | — | Condicional: uma das 4 fontes da pública | idem, label `PUBLIC KEY` | valida o access token | Java: `seedgrid.security.jwt.public-key-base64` | boot | idem |
| `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_LOCATION` · alias `SECURITY_PRIVATE_KEY_LOCATION` | caminho | arquivo PEM legível | — | Condicional | 2ª fonte; lê o arquivo inteiro. Arquivo ilegível → `Err` (não cai para a próxima fonte) | idem privada | Java: `seedgrid.security.jwt.private-key-location` (default Java `keys/private.pem`; **Rust não tem default**) | boot | `src/config.rs` → `read_rsa_key` |
| `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_LOCATION` · alias `SECURITY_PUBLIC_KEY_LOCATION` | caminho | arquivo PEM | — | Condicional | idem | idem pública | Java: `seedgrid.security.jwt.public-key-location` | boot | idem |
| 🔒 `SECURITY_JWT_PRIVATE_KEY_PEM` | string | PEM inline | — | Condicional | 3ª fonte (ignorada se branca) | idem | sem equivalente Java confirmado | boot | idem |
| `SECURITY_JWT_PUBLIC_KEY_PEM` | string | PEM inline | — | Condicional | 3ª fonte | idem | — | boot | idem |
| `SECURITY_JWT_PRIVATE_KEY_PEM_FILE` | caminho | arquivo PEM | — | Condicional | 4ª fonte (nome antigo do crate) | idem | — | boot | idem |
| `SECURITY_JWT_PUBLIC_KEY_PEM_FILE` | caminho | arquivo PEM | — | Condicional | 4ª fonte | idem | — | boot | idem |
| `SECURITY_JWT_ISSUER` → `jwt.issuer` | `String` | qualquer | `seedgrid` | Não | claim `iss` | `crypto/jwt.rs`; exposto no status do login-tenancy | Java: `seedgrid.security.jwt.issuer` (default Java `https://seedgrid.com.br`); env do módulo Java `SEEDGRID_SECURITY_JWT_ISSUER` **não é lida** | boot | `src/config.rs` → `from_env` |
| `SECURITY_JWT_KID` → `jwt.kid` | `Option<String>` | string não-branca | `None` (header sem `kid`) | Não | aparado; branco = `None` | `crypto/jwt.rs` (`header.kid`) | Java: `seedgrid.security.jwt.kid` (default Java `seedgrid-key`) | boot | idem |
| `SECURITY_JWT_TTL` → `jwt.ttl_seconds` | `i64` (s) | duração (ISO-8601/sufixo/inteiro) | `28800` (8h) | Não | precede `SECURITY_JWT_TTL_SECONDS` | validade do access token | Java: `seedgrid.security.jwt.ttl` (PT8H) | boot | idem |
| `SECURITY_JWT_TTL_SECONDS` | `i64` | inteiro | `28800` | Não | usado só se `SECURITY_JWT_TTL` ausente/inválida (compat) | idem | — | boot | idem |

### 2.2 Refresh token

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SECURITY_REFRESH_TOKEN_TTL` → `refresh.ttl_days` | `i64` (dias) | duração (`P30D`, `30d`, segundos) | `30` | Não | convertido para dias (`secs/86400`, mínimo 1) | `services/refresh.rs` | Java: `seedgrid.security.refresh-token.ttl` (P30D) | boot | `src/config.rs` → `from_env` |
| `SECURITY_REFRESH_TOKEN_REUSE_GRACE_WINDOW` → `refresh.reuse_grace_window_secs` | `i64` (s) | duração; `PT0S`/`0` desliga | `30` | Não | janela em que a reapresentação concorrente do mesmo refresh não é tratada como reuso | `services/refresh.rs` (`grace_secs`) | Java: `seedgrid.security.refresh-token.reuse-grace-window` (PT30S) — nome Java por regra kebab-case do `reuseGraceWindow()` | boot | idem |
| `refresh.reuse_detection` (campo) | `bool` | — | `true` | Não | reuso detectado revoga a family inteira | `services/refresh.rs:114` | sem env | struct | `src/config.rs` → `RefreshTokenConfig::default` |

### 2.3 Política de senha

> Diferença deliberada (Confirmado, comentário em `PasswordConfig::default`): os defaults do crate são **rígidos**; os do módulo Java (`microprofile-config.properties`) são permissivos (`min-size=1`, `max-history=0`, flags `false`).

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SECURITY_PASSWORD_MIN_SIZE` → `password.min_length` | `usize` | inteiro ≥ 0 | `8` | Não | tamanho mínimo | `services/users.rs` (`validate_password`) | Java: `seedgrid.security.password.min-size` (Java módulo: 1) | boot | `src/config.rs` → `from_env` |
| `SECURITY_PASSWORD_EXPIRATION_DAYS` → `password.expiry_days` | `i64` | inteiro; `0` = nunca | `0` | Não | data de expiração da senha | `services/users.rs` | Java: `...password.expiration-days` | boot | idem |
| `SECURITY_PASSWORD_MAX_HISTORY` → `password.history_size` | `usize` | inteiro | `5` | Não | senhas anteriores proibidas | `services/users.rs` | Java: `...password.max-history` (Java módulo: 0) | boot | idem |
| `SECURITY_PASSWORD_UPPER` → `password.require_upper` | `bool` | `parse_bool` | `true` | Não | exige maiúscula | `services/users.rs` | Java: `...password.upper-case-required` (Java módulo: false) | boot | idem |
| `SECURITY_PASSWORD_LOWER` → `password.require_lower` | `bool` | `parse_bool` | `true` | Não | exige minúscula | idem | Java: `...lower-case-required` | boot | idem |
| `SECURITY_PASSWORD_SPECIAL` → `password.require_special` | `bool` | `parse_bool` | `true` | Não | exige especial de `!@#$%^&*(),.?":{}\|<>` | idem | Java: `...special-character-required` | boot | idem |
| `SECURITY_PASSWORD_NO_REPEAT` → `password.prohibit_repeated_sequence` | `bool` | `parse_bool` | `true` | Não | proíbe 2 caracteres iguais seguidos | idem | Java: `...prohibits-repeated-characters-in-sequence` | boot | idem |

### 2.4 Criptografia (segredo TOTP e PII) e privacidade

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| 🔒 `SEEDGRID_PRIVACY_CRYPTO_KEY` · aliases `SECURITY_ENCRYPTION_KEY`, `SEEDGRID_SECURITY_ENCRYPTION_KEY` → `encryption.key_b64` | `Option<String>` | base64 de 32 bytes (AES-256) | `None` | Condicional: exigida para 2FA TOTP (cifra do segredo) e para cifra de PII com privacy ligado | precedência na ordem listada; chave inválida faz `build()` falhar | `src/state.rs` (`SecretCipher`, `AesGcmCryptoService`); `services/twofactor.rs` (`cipher`) | Java: `seedgrid.privacy.crypto.key` (Confirmado em `CryptoProvider.CRYPTO_KEY_PROPERTY` da lib privacy) e `seedgrid.security.encryption.key` (`SecurityEncryptionConfig#key`) | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED` · alias `SECURITY_PRIVACY_ENABLED` → `privacy.enabled` | `bool` | `parse_bool` | `false` | Não | liga a cifra at-rest de PII (`email`, `whatsApp`, `cnpj`, `rep_*`) e os hashes de busca — só se as chaves existirem | `src/state.rs` (gate de `field_cipher`/`search_hasher`) | Java: `seedgrid.privacy.encryption.enabled` | boot | idem |
| 🔒 `SEEDGRID_PRIVACY_SEARCH_KEY` · alias `SECURITY_PRIVACY_HMAC_KEY` → `privacy.hmac_key_b64` | `Option<String>` | base64 (≥ 32 bytes, segundo README) | `None` | Condicional: necessária para busca por hash com privacy ligado | HMAC-SHA256 dos `*_hash` | `src/state.rs` | Java: `seedgrid.privacy.search.key` | boot | idem |

### 2.5 2FA (`seedgrid.security.2f.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_2F_ENABLED` → `two_factor.enabled` | `bool` | `parse_bool` | `false` | Não | liga o fluxo 2FA no login; `/2f/*` informa `featureEnabled` | `services/auth.rs:130`, `src/routes.rs` | Java: `seedgrid.security.2f.enabled` (`@WithDefault false`, mas o `microprofile-config.properties` do módulo fixa `true` — **default efetivo é `true` no Java**) | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_2F_EMAIL_CODE_TTL` → `two_factor.email_code_ttl_seconds` | `i64` (s) | duração | `300` | Não | validade do código por e-mail | `services/twofactor.rs` | Java: `...2f.email.code-ttl` (PT5M) | boot | idem |
| `SEEDGRID_SECURITY_2F_ALLOWED_METHODS` → `two_factor.allowed_methods` | `Vec<String>` | CSV de `EMAIL`, `TOTP`, `WHATSAPP` | `EMAIL,TOTP` | Não | lista vazia é ignorada | `src/routes.rs` | Java: `...2f.allowed-methods` | boot | idem |
| `SEEDGRID_SECURITY_2F_DEFAULT_METHOD` → `two_factor.default_method` | `String` | `EMAIL`/`TOTP`/`WHATSAPP` | `TOTP` | Não | método default da sessão 2FA | `services/twofactor.rs` | Java: `...2f.default-method` | boot | idem |
| `SEEDGRID_SECURITY_2F_TOTP_ISSUER` → `two_factor.totp_issuer` | `String` | qualquer | `SeedGrid` | Não | issuer do `otpauth://` | `services/twofactor.rs` | Java: `...2f.totp.issuer` | boot | idem |
| `SEEDGRID_SECURITY_2F_TOTP_DIGITS` → `two_factor.totp_digits` | `usize` | inteiro | `6` | Não | dígitos TOTP e dos OTP numéricos | `services/twofactor.rs` | Java: `...2f.totp.digits` | boot | idem |
| `SEEDGRID_SECURITY_2F_TOTP_PERIOD` → `two_factor.totp_period_seconds` | `u64` | inteiro (s) | `30` | Não | período TOTP | `services/twofactor.rs` | Java: `...2f.totp.period` | boot | idem |
| `SEEDGRID_SECURITY_2F_VERIFY_MAX_ATTEMPTS` → `two_factor.verify_max_attempts` | `u32` | inteiro | `5` | Não | tentativas por sessão | `services/twofactor.rs:293` | Java: `...2f.verify.max-attempts` | boot | idem |
| `SEEDGRID_SECURITY_2F_SESSION_TTL` → `two_factor.session_ttl_seconds` | `i64` (s) | duração | `300` | Não | sessão temporária login→verify | `services/twofactor.rs` | Java: `...2f.session.ttl` (PT5M) | boot | idem |
| `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` → `two_factor.whatsapp_channel_id` | `String` | canal/instância | vazio | Condicional: necessário para oferecer WHATSAPP | vazio → WHATSAPP nunca oferecido; preenchido → `build()` cria `WhatsAppCrateSender` com `seedgrid_whatsapp::WhatsAppConfig::from_env()` | `src/state.rs` (`whatsapp_is_configured`) | Java: `...2f.whatsapp.channel-id` (env Java idêntica). Credenciais do provider: ver [[SeedGrid/Extensions/whatsapp/Configuracao-Rust\|config Rust do whatsapp]] | boot | idem |
| `SEEDGRID_SECURITY_2F_BACKUP_CODES_COUNT` → `two_factor.backup_codes_count` | `usize` | inteiro | `10` | Não | nº de backup codes gerados | `services/twofactor.rs:615` | Java: `...2f.backup-codes.count` | boot | idem |

### 2.6 Frontend (links de e-mail)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_FRONTEND_BASE_URL` · aliases `SECURITY_FRONTEND_BASE_URL`, `SECURITY_BASE_URL` → `frontend.base_url` | `String` | URL | `http://localhost:3000` | Não (recomendada em produção) | branco ignorado; `/` final removida no uso | `src/web/links.rs` | Java: `seedgrid.security.frontend.base-url` (env idêntica) | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_FRONTEND_LOGIN_PATH` · alias `SECURITY_FRONTEND_LOGIN_PATH` | `String` | path | `/login` | Não | — | `src/web/links.rs` | Java: `...frontend.login-path` | boot | idem (`fe_env`) |
| `SEEDGRID_SECURITY_FRONTEND_PASSWORD_RESET_PATH` · alias `SECURITY_FRONTEND_PASSWORD_RESET_PATH` | `String` | path | `/auth/forgot-password/confirm` | Não | — | idem | Java: `...password-reset-path` | boot | idem |
| `SEEDGRID_SECURITY_FRONTEND_EMAIL_CONFIRMATION_PATH` · alias `SECURITY_FRONTEND_EMAIL_CONFIRMATION_PATH` | `String` | path | `/auth/confirm-email` | Não | — | idem | Java: `...email-confirmation-path` | boot | idem |
| `SEEDGRID_SECURITY_FRONTEND_WELCOME_PATH` · alias `SECURITY_FRONTEND_WELCOME_PATH` | `String` | path | `/auth/welcome` | Não | — | idem | Java: `...welcome-path` | boot | idem |
| `SEEDGRID_SECURITY_FRONTEND_SELF_ENTER_PATH` · alias `SECURITY_FRONTEND_SELF_ENTER_PATH` | `String` | path | `/auth/self-enter` | Não | — | idem | Java: `...self-enter-path` | boot | idem |

### 2.7 Self-enter (auto-registro e convites)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SECURITY_SELF_ENTER_ENABLED` → `self_enter.enabled` | `bool` | **só** `"true"` literal liga | `false` | Não | desligado → toda rota `/self-enter*` responde 404 (middleware antes da auth) e o cleanup não roda | `src/routes.rs`, `services/selfenter.rs` | Java: `seedgrid.security.self-enter.enabled` | boot | `src/config.rs` → `from_env` |
| `SECURITY_SELF_ENTER_PUBLIC_ENABLED` → `self_enter.public_enabled` | `bool` | `"true"` literal | `true` | Não | `false` = modo só-convite (signup público 404) | `services/selfenter.rs` | Java: `...self-enter.public-enabled` | boot | idem |
| `SECURITY_SELF_ENTER_INVITE_ENABLED` → `self_enter.invite_enabled` | `bool` | `"true"` literal | `true` | Não | `false` = convites 404 | idem | Java: `...self-enter.invite-enabled` | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_REQUEST_TTL` · alias `SECURITY_SELF_ENTER_REQUEST_TTL` → `request_ttl_hours` | `i64` (h) | duração | `48` | Não | convertido para horas (mín. 1) | `services/selfenter.rs` | Java: `...self-enter.request-ttl` (PT48H) | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_INVITE_TTL` · alias `SECURITY_SELF_ENTER_INVITE_TTL` → `invite_ttl_hours` | `i64` (h) | duração | `168` | Não | idem | idem | Java: `...invite-ttl` (PT168H) | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_EMAIL_TOKEN_TTL` · alias `SECURITY_SELF_ENTER_EMAIL_TOKEN_TTL` → `otp_ttl_seconds` | `i64` (s) | duração | `1800` | Não | validade de cada OTP de e-mail | idem | Java: `...email-token-ttl` (PT30M) | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_DEFAULT_ROLE` · alias `SECURITY_SELF_ENTER_DEFAULT_ROLE` → `default_role` | `Option<String>` | nome de role | — (sem padrão) | **Sim, quando `SECURITY_SELF_ENTER_ENABLED=true`**: `SecurityConfig::from_env()` devolve `Err` se ausente/em branco | role atribuída na aprovação quando o convite não traz roles. Busca `SELECT id, for_integration FROM roles WHERE name = $1 AND company_id IS NULL` **antes** de criar o usuário; ausente, inexistente ou de integração → aprovação recusada (`400`, códigos `DEFAULT_ROLE_NOT_CONFIGURED`, `DEFAULT_ROLE_NOT_FOUND`, `ROLE_NOT_ALLOWED`) e nenhum usuário é criado. Roles do convite não encontradas continuam sendo ignoradas | `services/selfenter.rs` (aprovação, `self_enter_default_role`) | Java: `seedgrid.security.self-enter.default-role` (também obrigatória com self-enter ligado). Comportamento equivalente; o Java responde 422/403 onde o Rust responde 400 | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_CLEANUP_ENABLED` · alias `SECURITY_SELF_ENTER_CLEANUP_ENABLED` → `cleanup_enabled` | `bool` | `parse_bool` | `true` | Não | gate do `cleanup_entry_requests` | `services/selfenter.rs:19` | Java: `...cleanup.enabled` | boot | idem |
| `SEEDGRID_SECURITY_SELF_ENTER_CLEANUP_PURGE_AFTER` · alias `SECURITY_SELF_ENTER_CLEANUP_PURGE_AFTER` → `purge_after_hours` | `i64` (h) | duração | `168` | Não | retenção de pedidos finalizados | `services/selfenter.rs:32` | Java: `...cleanup.purge-after` (PT168H) | boot | idem |
| `self_enter.otp_accept_last_n` (campo) | `i64` | — | `4` | Não | aceita os últimos N OTPs válidos | `services/selfenter.rs:210` | sem env | struct | `SelfEnterConfig::default` |

O intervalo do job de limpeza **não é config**: o host passa um `Duration` a `spawn_entry_request_cleanup(state, interval)` (`src/lib.rs`). O Java usa `seedgrid.security.self-enter.cleanup.cron`, sem equivalente no crate.

### 2.8 Avatar

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_AVATAR_USER_PREFIX` · alias `SECURITY_AVATAR_USER_PREFIX` → `avatar.user_prefix` | `String` | prefixo de storage | `avatars/users` | Não | — | `services/avatar.rs:57` | Java: `seedgrid.security.avatar.user-prefix` | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_AVATAR_DEFAULT_PREFIX` · alias `SECURITY_AVATAR_DEFAULT_PREFIX` → `avatar.default_prefix` | `String` | prefixo | `avatars/defaults` | Não | pool compartilhado de avatares default | `services/avatar.rs:216` | Java: `...avatar.default-prefix` | boot | idem |
| `avatar.max_bytes` (campo) | `u64` | bytes; `0` = sem limite | `2097152` via `SecurityConfig::new`/`from_env` (`AvatarConfig::default` = `0`) | Não | rejeita upload maior | `services/avatar.rs:147` | sem env | struct | `SecurityConfig::new` |
| `avatar.allowed_content_types` (campo) | `Vec<String>` | MIME | `image/png`, `image/jpeg`, `image/webp` via `new` (vazio no `Default` = aceita tudo) | Não | — | `services/avatar.rs:153` | sem env | struct | idem |

Backend de storage e credenciais (`seedgrid.security.avatar.storage`, `.filesystem.*`, `.s3.*`, `.minio.*`...) **não** são lidos pelo crate: o host injeta `AvatarStorage` (ex.: `spi::FileManagementStorage`) no builder.

### 2.9 Mailer SMTP

Auto-ligado no `build()` quando `username` não-branco **e** `password` não-vazio; senão `LoggingEmailService` (só loga). Injeção `.email(...)` do host sempre vence.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_MAILER_FROM` · alias `SECURITY_MAILER_FROM` | `String` | e-mail | `noreply@example.com` | Não | remetente | `src/email_smtp.rs` | Java: `seedgrid.security.mailer.from` (env idêntica) | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_MAILER_HOST` · alias `SECURITY_MAILER_HOST` | `String` | host | `smtp.gmail.com` | Não | — | idem | Java: `...mailer.host` | boot | idem |
| `SEEDGRID_SECURITY_MAILER_PORT` · alias `SECURITY_MAILER_PORT` | `u16` | porta | `587` | Não | inválido ignorado | idem | Java: `...mailer.port` | boot | idem |
| `SEEDGRID_SECURITY_MAILER_START_TLS` · alias `SECURITY_MAILER_START_TLS` | `String` | `REQUIRED`/`OPTIONAL`/`DISABLED` | `REQUIRED` | Não | `DISABLED` (sem caixa) desliga STARTTLS | `src/email_smtp.rs:36` | Java: `...mailer.start-tls` | boot | idem |
| `SEEDGRID_SECURITY_MAILER_USERNAME` · alias `SECURITY_MAILER_USERNAME` | `String` | — | vazio | Condicional: necessário para SMTP real | — | `MailerConfig::is_configured` | Java: `...mailer.username` | boot | idem |
| 🔒 `SEEDGRID_SECURITY_MAILER_PASSWORD` · alias `SECURITY_MAILER_PASSWORD` | `String` | — | vazio | Condicional: idem | sem trim; vazio ignorado | idem | Java: `...mailer.password` | boot | idem |

Sem equivalente no crate: `seedgrid.security.mailer.auth-methods` (Java).

### 2.10 Atributos adicionais do usuário

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_SIZE_BYTES` · alias `SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_SIZE_BYTES` | `usize` | inteiro | `16384` | Não | excedeu → 400 `INVALID_USER_ADDITIONAL_ATTRIBUTES` | `services/user_attributes.rs` (`check_limits`) | Java: `seedgrid.security.user.additional-attributes.max-size-bytes`. **Atenção:** o microprofile do módulo Java usa a env `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_SIZE_BYTES` (sem `ADDITIONAL_`), que o crate **não lê**; o nome do crate coincide com a regra automática MicroProfile da propriedade | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_DEPTH` · alias `SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_DEPTH` | `usize` | inteiro (raiz = 1) | `5` | Não | idem | idem | Java: `...max-depth` (env Java `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_DEPTH`) | boot | idem |
| `SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_KEYS` · alias `SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_KEYS` | `usize` | inteiro | `100` | Não | idem | idem | Java: `...max-keys` (env Java `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_KEYS`) | boot | idem |

### 2.11 Bootstrap: primeiro admin e empresa-plataforma

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL` · alias `SECURITY_FIRST_ADMIN_EMAIL` | `Option<String>` | e-mail | `None` | Não | se setado, `bootstrap()` cria/garante o admin | `services/bootstrap.rs` | Java: `seedgrid.security.first-admin-user.email`; também lida diretamente pelo `login-tenancy::assemble_all` | boot | `src/config.rs` → `from_env` (`first_env`) |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_NAME` · alias `SECURITY_FIRST_ADMIN_NAME` | `Option<String>` | — | `None` (bootstrap usa `Administrador`) | Não | — | idem | Java: `...first-admin-user.name` | boot | idem |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_WHATSAPP` · alias `SECURITY_FIRST_ADMIN_WHATSAPP` | `Option<String>` | — | `None` | Não | — | idem | Java: `...first-admin-user.whatsapp` | boot | idem |
| 🔒 `SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD` · alias `SECURITY_FIRST_ADMIN_INITIAL_PASSWORD` | `Option<String>` | — | `None` | Não | senha inicial (com `change_password_required`) | `services/bootstrap.rs:232` | Java: `...first-admin-user.initial-password` | boot | idem |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` · alias `SECURITY_DEFAULT_COMPANY_CNPJ` | `String` | CNPJ (comparado só por dígitos) | vazio | Condicional: sem ele não há empresa-plataforma (bootstrap não cria company; `require_platform_scope` sem referência) | — | `services/bootstrap.rs`, `services/rbac.rs`, `services/session.rs`, `services/auth.rs`, `services/platform_company.rs`; lido também por `login-tenancy::assemble_all` | Java: `seedgrid.security.default-company.cnpj` | boot | idem |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CORPORATE_NAME` | `String` | — | vazio | Condicional: obrigatório quando o CNPJ está setado e a company ainda não existe (senão `bootstrap` retorna erro) | — | `services/bootstrap.rs:32` | Java: `...default-company.corporate-name` | boot | idem |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_TRADE_NAME` | `String` | — | vazio | Condicional: idem | — | `services/bootstrap.rs:33` | Java: `...default-company.trade-name` | boot | idem |
| `SecurityOverrides.run_bootstrap` (campo) | `bool` | — | `true` em `SecurityOverrides::enabled()`; `false` em `Default` (derive) | Não | roda `bootstrap()` no fim do `SecurityPlatform::assemble` | `src/platform.rs` | Java tem `seedgrid.security.bootstrap.enabled` (env `SEEDGRID_SECURITY_BOOTSTRAP_ENABLED`), **não lida** pelo crate | struct | `src/platform.rs` |

### 2.12 Gestão pela conta e templates

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Leitura | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `SEEDGRID_SECURITY_ACCOUNT_ASSIGNABLE_PERMISSION_AUDIENCES` → `account.assignable_permission_audiences` | `Vec<String>` | CSV de audiences | vazio (só permissões sem audience). O `login-tenancy::assemble_all` usa `client` quando a env **não existe** | Não | audiences que o admin da conta pode atribuir em `/me/security/roles` | `services/company_roles.rs` | Java: `seedgrid.security.account.assignable-permission-audiences`. Constante `config::ACCOUNT_ASSIGNABLE_PERMISSION_AUDIENCES_ENV` | boot | `src/config.rs` → `from_env` |
| `SEEDGRID_SECURITY_TEMPLATES_DIR` · alias `SECURITY_TEMPLATES_DIR` | caminho | diretório | `./templates/security` (relativo ao cwd) | Não | overrides `<nome>.html`/`.txt` vencem os templates embutidos; só usado se o host não injetar `.template_provider(...)` | `DefaultTemplateSecurityProvider::with_host_dir` | sem propriedade Java (Java usa recurso de classpath `templates/security/`) | build | `src/state.rs` → `SecurityStateBuilder::build` |

## 3. Propriedades de frameworks/bibliotecas

- O crate **não** lê `quarkus.*`, `mp.*`, `smallrye.*`.
- `seedgrid_whatsapp::WhatsAppConfig::from_env()` é chamado no `build()` quando `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` está preenchido: as envs `SEEDGRID_WHATSAPP_*` pertencem ao crate whatsapp — ver [[SeedGrid/Extensions/whatsapp/Configuracao-Rust|Configuração Rust do whatsapp]].
- Rate limit das rotas públicas: o `RateLimitService` é construído com `EmptyConfigSource` (`src/ratelimit.rs` → `build_service`), ou seja, **não há override por config** dos limites (login 100/min, auth-refresh 30/min, auth-confirm-email 10/min, forgot-password 5/h, auth-reset-password 10/min, 2fa-verify 5/15min). As propriedades Java `seedgrid.security.rate-limit.login.*` não têm equivalente.
- `DATABASE_URL`/pool: responsabilidade do host (o crate recebe um `PgPool`).

## 4. Propriedades usadas só em testes e exemplos

- `tests/common/mod.rs` → `base_config()` monta `SecurityConfig` à mão (chaves de `tests/keys/*.pem`), espelhando a política de senha do `application.properties` de teste Java.
- `README` do crate: `DOCKER_HOST`, `TESTCONTAINERS_RYUK_DISABLED` (execução dos testes de integração com Podman).
- Exemplos `rust/examples/seedgrid-security-apikeys-example` e `seedgrid-login-tenancy-example` (`.env.example`): `DATABASE_URL`, `BIND_ADDR` (lidos pelo `main.rs` do exemplo), `SECURITY_JWT_ISSUER`, `SECURITY_JWT_TTL_SECONDS`, `SECURITY_ENCRYPTION_KEY` e `SECURITY_FRONTEND_BASE_URL`.

## 5. Aliases, obsoletas, renomeações

| Nome atual (primário) | Alias aceito | Observação |
|---|---|---|
| `SEEDGRID_SECURITY_JWT_{PRIVATE,PUBLIC}_KEY_LOCATION` | `SECURITY_{PRIVATE,PUBLIC}_KEY_LOCATION` | alias = nome dos exemplos Java |
| `SECURITY_JWT_{PRIVATE,PUBLIC}_KEY_PEM_FILE` | — | nome antigo do crate, 4ª fonte |
| `SECURITY_JWT_TTL` | `SECURITY_JWT_TTL_SECONDS` | compat; inteiro em segundos |
| `SEEDGRID_PRIVACY_CRYPTO_KEY` | `SECURITY_ENCRYPTION_KEY`, `SEEDGRID_SECURITY_ENCRYPTION_KEY` | — |
| `SEEDGRID_PRIVACY_ENCRYPTION_ENABLED` | `SECURITY_PRIVACY_ENABLED` | — |
| `SEEDGRID_PRIVACY_SEARCH_KEY` | `SECURITY_PRIVACY_HMAC_KEY` | — |
| `SEEDGRID_SECURITY_FRONTEND_BASE_URL` | `SECURITY_FRONTEND_BASE_URL`, `SECURITY_BASE_URL` | — |
| `SEEDGRID_SECURITY_FRONTEND_*`, `_SELF_ENTER_*`, `_AVATAR_*`, `_MAILER_*`, `_USER_ADDITIONAL_ATTRIBUTES_*`, `_TEMPLATES_DIR` | o mesmo nome sem `SEEDGRID_` | — |
| `SEEDGRID_SECURITY_FIRST_ADMIN_USER_{EMAIL,NAME,WHATSAPP,INITIAL_PASSWORD}` | `SECURITY_FIRST_ADMIN_{EMAIL,NAME,WHATSAPP,INITIAL_PASSWORD}` | alias **sem** `_USER` |
| `SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ` | `SECURITY_DEFAULT_COMPANY_CNPJ` | corporate/trade name sem alias |

Defaults diferentes do módulo Java (Confirmado): issuer (`seedgrid` × `https://seedgrid.com.br`), kid (`None` × `seedgrid-key`), política de senha (rígida × permissiva), `2f.enabled` efetivo (`false` × `true`).

## 6. Configuração mínima (`.env`)

```dotenv
# Chaves RSA (obrigatório). Escolha UMA forma por chave.
SEEDGRID_SECURITY_JWT_PRIVATE_KEY_LOCATION=./keys/private.pem
SEEDGRID_SECURITY_JWT_PUBLIC_KEY_LOCATION=./keys/public.pem
# Empresa-plataforma (recomendado; corporate/trade obrigatórios na 1ª criação)
SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ=<cnpj-da-plataforma>
SEEDGRID_SECURITY_DEFAULT_COMPANY_CORPORATE_NAME=<razao-social>
SEEDGRID_SECURITY_DEFAULT_COMPANY_TRADE_NAME=<nome-fantasia>
```

## 7. Configuração completa comentada

```dotenv
# --- JWT ---
# Precedência por chave: *_BASE64 (DER) > *_LOCATION (arquivo) > SECURITY_JWT_*_PEM (inline) > SECURITY_JWT_*_PEM_FILE
SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64=<SEGREDO:jwt-private-key-der-base64>
SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64=<jwt-public-key-der-base64>
SECURITY_JWT_ISSUER=https://auth.example.com      # default do crate: seedgrid
SECURITY_JWT_KID=seedgrid-key                     # default: sem kid
SECURITY_JWT_TTL=PT8H                             # ou SECURITY_JWT_TTL_SECONDS=28800
# --- Refresh ---
SECURITY_REFRESH_TOKEN_TTL=P30D
SECURITY_REFRESH_TOKEN_REUSE_GRACE_WINDOW=PT30S   # PT0S desliga
# --- Senha (defaults do crate: 8 / 0 / 5 / true x4) ---
SECURITY_PASSWORD_MIN_SIZE=8
SECURITY_PASSWORD_EXPIRATION_DAYS=0
SECURITY_PASSWORD_MAX_HISTORY=5
SECURITY_PASSWORD_UPPER=true
SECURITY_PASSWORD_LOWER=true
SECURITY_PASSWORD_SPECIAL=true
SECURITY_PASSWORD_NO_REPEAT=true
# --- Cripto / privacidade ---
SEEDGRID_PRIVACY_CRYPTO_KEY=<SEGREDO:aes256-key-base64>
SEEDGRID_PRIVACY_ENCRYPTION_ENABLED=false
SEEDGRID_PRIVACY_SEARCH_KEY=<SEGREDO:hmac-key-base64>
# --- 2FA ---
SEEDGRID_SECURITY_2F_ENABLED=false
SEEDGRID_SECURITY_2F_ALLOWED_METHODS=EMAIL,TOTP
SEEDGRID_SECURITY_2F_DEFAULT_METHOD=TOTP
SEEDGRID_SECURITY_2F_TOTP_ISSUER=SeedGrid
SEEDGRID_SECURITY_2F_TOTP_DIGITS=6
SEEDGRID_SECURITY_2F_TOTP_PERIOD=30
SEEDGRID_SECURITY_2F_VERIFY_MAX_ATTEMPTS=5
SEEDGRID_SECURITY_2F_SESSION_TTL=PT5M
SEEDGRID_SECURITY_2F_EMAIL_CODE_TTL=PT5M
SEEDGRID_SECURITY_2F_BACKUP_CODES_COUNT=10
SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID=         # preencher liga WHATSAPP (+ SEEDGRID_WHATSAPP_*)
# --- Frontend ---
SEEDGRID_SECURITY_FRONTEND_BASE_URL=https://app.example.com
SEEDGRID_SECURITY_FRONTEND_LOGIN_PATH=/login
SEEDGRID_SECURITY_FRONTEND_PASSWORD_RESET_PATH=/auth/forgot-password/confirm
SEEDGRID_SECURITY_FRONTEND_EMAIL_CONFIRMATION_PATH=/auth/confirm-email
SEEDGRID_SECURITY_FRONTEND_WELCOME_PATH=/auth/welcome
SEEDGRID_SECURITY_FRONTEND_SELF_ENTER_PATH=/auth/self-enter
# --- Self-enter ---
SECURITY_SELF_ENTER_ENABLED=false                 # só "true" literal liga
SECURITY_SELF_ENTER_PUBLIC_ENABLED=true
SECURITY_SELF_ENTER_INVITE_ENABLED=true
SEEDGRID_SECURITY_SELF_ENTER_REQUEST_TTL=PT48H
SEEDGRID_SECURITY_SELF_ENTER_INVITE_TTL=PT168H
SEEDGRID_SECURITY_SELF_ENTER_EMAIL_TOKEN_TTL=PT30M
SEEDGRID_SECURITY_SELF_ENTER_DEFAULT_ROLE=<NOME-DA-ROLE-GLOBAL>   # obrigatória se SECURITY_SELF_ENTER_ENABLED=true
SEEDGRID_SECURITY_SELF_ENTER_CLEANUP_ENABLED=true
SEEDGRID_SECURITY_SELF_ENTER_CLEANUP_PURGE_AFTER=PT168H
# --- Avatar (prefixos; backend via AvatarStorage injetado) ---
SEEDGRID_SECURITY_AVATAR_USER_PREFIX=avatars/users
SEEDGRID_SECURITY_AVATAR_DEFAULT_PREFIX=avatars/defaults
# --- Mailer (SMTP real liga com username+password) ---
SEEDGRID_SECURITY_MAILER_FROM=noreply@example.com
SEEDGRID_SECURITY_MAILER_HOST=smtp.example.com
SEEDGRID_SECURITY_MAILER_PORT=587
SEEDGRID_SECURITY_MAILER_START_TLS=REQUIRED
SEEDGRID_SECURITY_MAILER_USERNAME=<usuario-smtp>
SEEDGRID_SECURITY_MAILER_PASSWORD=<SEGREDO:smtp-password>
# --- additionalAttributes ---
SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_SIZE_BYTES=16384
SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_DEPTH=5
SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_KEYS=100
# --- Bootstrap ---
SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL=admin@example.com
SEEDGRID_SECURITY_FIRST_ADMIN_USER_NAME=Administrador
SEEDGRID_SECURITY_FIRST_ADMIN_USER_WHATSAPP=
SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD=<SEGREDO:first-admin-password>
SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ=<cnpj>
SEEDGRID_SECURITY_DEFAULT_COMPANY_CORPORATE_NAME=<razao-social>
SEEDGRID_SECURITY_DEFAULT_COMPANY_TRADE_NAME=<nome-fantasia>
# --- Conta / templates ---
SEEDGRID_SECURITY_ACCOUNT_ASSIGNABLE_PERMISSION_AUDIENCES=
SEEDGRID_SECURITY_TEMPLATES_DIR=./templates/security
```

## 8. Receitas

- **Chave em uma linha (PaaS):** use `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64`/`_PUBLIC_KEY_BASE64` com o corpo DER (sem `-----BEGIN`). É a mesma env do Java.
- **Mesmo `dev.env` do Java:** os nomes `SEEDGRID_SECURITY_*` do módulo funcionam, **exceto** issuer/kid/ttl do JWT (use `SECURITY_JWT_ISSUER`/`_KID`/`_TTL`) e os limites de `additionalAttributes` (Java usa `..._USER_ATTRIBUTES_...`, crate usa `..._USER_ADDITIONAL_ATTRIBUTES_...`).
- **Política de senha igual à do Java (permissiva):** `SECURITY_PASSWORD_MIN_SIZE=1`, `SECURITY_PASSWORD_MAX_HISTORY=0`, `SECURITY_PASSWORD_UPPER/LOWER/SPECIAL/NO_REPEAT=false`.
- **E-mail real:** defina `SEEDGRID_SECURITY_MAILER_USERNAME` + `_PASSWORD`; sem eles o crate só loga.
- **2FA por WhatsApp:** `SEEDGRID_SECURITY_2F_ALLOWED_METHODS=EMAIL,TOTP,WHATSAPP` + `SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID` + credenciais `SEEDGRID_WHATSAPP_*`.
- **Self-enter só por convite:** `SECURITY_SELF_ENTER_ENABLED=true`, `SECURITY_SELF_ENTER_PUBLIC_ENABLED=false` (o valor tem de ser exatamente `true` para ligar).

## 9. Dúvidas e lacunas

- Nomes JWT do módulo Java (`SEEDGRID_SECURITY_JWT_ISSUER/KID/TTL`) não são aceitos; o comentário de `from_env` diz "alinhado aos nomes do Java", o que vale para os exemplos Java, não para o módulo — **Confirmado**.
- Sem equivalente no crate (Java tem): `seedgrid.security.bootstrap.enabled`, `rate-limit.login.*`, `rbac.cache-ttl` (cache RBAC não implementado), `2f.otp-qrcode.*`, `2f.verify.lockout-duration`, `2f.backup-codes.length`, `2f.whatsapp.code-ttl`, `self-enter.invite-needs-approval`, `self-enter.cleanup.cron`, `self-enter.email.*`, `mailer.auth-methods`, `avatar.storage/public-read/*` (backend) e os campos de endereço/representante de `default-company.*` — **Confirmado** por comparação com `microprofile-config.properties` e `configs/*.java` do Java.
