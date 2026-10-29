---
tags: [seedgrid, extension, security, configuracao]
fonte: java/seedgrid-quarkus-ext-security
branch: main
commit: 450735386e
analisado-em: 2026-10-14
---

# security — Configuração (Quarkus)

Voltar para [[SeedGrid/Extensions/security/Visao-geral|Visão geral do security]] · [[SeedGrid/Extensions/security/Exemplos|Exemplos]] · [[SeedGrid/Extensions/security/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixo principal | `seedgrid.security.*` |
| Outros prefixos lidos pelo código da extension | `seedgrid.show-dev-message`, `seedgrid.app.email-alert.window`, `seedgrid.ratelimit.<configKey>.*` (chaves declaradas pelo security, lidas pela lib resilience) |
| Mecanismo | `@ConfigMapping` (SmallRye) em interfaces do módulo **runtime** (15 mappings), `@ConfigProperty` (2 chaves), `ConfigProvider.getConfig().getOptionalValue(...)` (1 chave, repetida de um mapping), expressão de propriedade em `@Scheduled(cron = "{...}")` (1 chave, repetida de um mapping) |
| `@ConfigRoot` / `*BuildTimeConfig` | **Não existem.** O módulo `deployment` (`SecurityProcessor`) não lê nenhuma configuração. Nenhum `@IfBuildProperty` / `@LookupIfProperty` / `@UnlessBuildProperty` no security. |
| Fase | **Runtime** para todas as propriedades próprias |
| Defaults embarcados | `java/seedgrid-quarkus-ext-security/runtime/src/main/resources/META-INF/microprofile-config.properties` (ordinal 100). O `application.properties` do host (ordinal 250) e as variáveis de ambiente (ordinal 300) sobrescrevem. **Atenção:** vários valores desse arquivo diferem do `@WithDefault` da interface — o valor efetivo é o do arquivo. A coluna *Padrão* mostra o valor efetivo e, entre parênteses, o `@WithDefault` quando diferente. |

Classes de config (todas em `java/seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/`):

| Classe | Prefixo |
|---|---|
| `configs/SecurityJwtConfig` | `seedgrid.security.jwt` |
| `configs/RefreshTokenConfig` | `seedgrid.security.refresh-token` |
| `configs/SecurityEncryptionConfig` | `seedgrid.security.encryption` |
| `configs/PasswordConfig` | `seedgrid.security.password` |
| `configs/TwoFactorConfig` | `seedgrid.security.2f` |
| `configs/SelfEnterConfig` | `seedgrid.security.self-enter` |
| `configs/SecurityMailerConfig` | `seedgrid.security.mailer` |
| `configs/SecurityFrontendConfig` | `seedgrid.security.frontend` |
| `configs/SecurityBootstrapConfig` | `seedgrid.security.bootstrap` |
| `configs/DefaultCompanyConfig` | `seedgrid.security.default-company` |
| `configs/FirstAdminUserConfig` | `seedgrid.security.first-admin-user` |
| `configs/AvatarConfig` | `seedgrid.security.avatar` |
| `configs/UserAttributesConfig` | `seedgrid.security.user.additional-attributes` |
| `configs/AccountManagementConfig` | `seedgrid.security.account` |
| `services/PermissionResolveService.RbacConfig` (interface aninhada) | `seedgrid.security.rbac` |

Convenções das tabelas:
- `…/security/` = `java/seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/`
- `mp-config` = `java/seedgrid-quarkus-ext-security/runtime/src/main/resources/META-INF/microprofile-config.properties`
- Variáveis de ambiente: o `mp-config` declara expressões `${SEEDGRID_SECURITY_...:default}` — esses nomes são **lidos de fato** (Confirmado). Além disso vale a regra MicroProfile padrão (ex.: `seedgrid.security.jwt.issuer` → `SEEDGRID_SECURITY_JWT_ISSUER`). Onde o nome da expressão difere da regra padrão, isso é indicado.
- Propriedade com valor vazio (`${X:}`) é tratada pelo SmallRye como **ausente** → `Optional.empty()`.
- 🔒 = sensível; nunca versionar valor real.
- Grau de certeza: tudo **Confirmado** no código salvo marcação explícita (*Inferência* / *Não confirmado*).

Validação de startup (*Inferência* baseada no comportamento padrão do SmallRye Config para `@ConfigMapping`): todo método não-`Optional` e sem `@WithDefault` precisa ter valor ao subir; ausência derruba o boot. Como o `mp-config` fornece valor para quase todos, na prática só `seedgrid.security.encryption.key` e os três campos obrigatórios de `default-company` (que no `mp-config` apontam para variáveis de ambiente **sem default**) exigem ação do host.

---

## 2. Propriedades próprias da extension

### 2.1 JWT (`seedgrid.security.jwt.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.jwt.issuer` | String | URL/texto livre | `https://seedgrid.com.br` (mp-config e `@WithDefault`) | Não | Vai no claim `iss` do access token e é comparado com igualdade exata ao validar | Emissão e verificação de JWT | Bridge `mp.jwt.verify.issuer=${seedgrid.security.jwt.issuer}` no mp-config | Runtime | Decl.: `…/security/configs/SecurityJwtConfig#issuer()`; consumo: `services/TokenService` (builder `.issuer`), `services/TokenVerifier#validateIssuer` |
| `seedgrid.security.jwt.kid` | Optional\<String\> | texto | `seedgrid-key` (mp-config; fallback em código `seedgrid-key`) | Não | Header `kid` do JWT RS256 | Emissão | — | Runtime | Decl.: `SecurityJwtConfig#kid()`; consumo: `TokenService` (`jwtConfig.kid().orElse("seedgrid-key")`) |
| `seedgrid.security.jwt.ttl` | Optional\<Duration\> | ISO-8601 (`PT8H`) | `PT8H` (mp-config; fallback em código 8 h) | Não | Expiração (`exp`) do access token | Emissão | Independente do `refresh-token.ttl` | Runtime | Decl.: `SecurityJwtConfig#ttl()`; consumo: `TokenService` (`jwtConfig.ttl().orElse(Duration.ofHours(8))`) |
| `seedgrid.security.jwt.private-key-location` 🔒 | Optional\<String\> | caminho de arquivo (absoluto/relativo) ou recurso de classpath, PEM `PRIVATE KEY` (PKCS#8) | `keys/private.pem` (mp-config; mesmo fallback em código) | Condicional — usada se `private-key-base64` vazio; o arquivo precisa existir | Tenta sistema de arquivos, depois classpath; falha → `IllegalStateException("Erro ao carregar chave privada RSA")` ao inicializar `RsaKeyProvider` | Assinatura RS256 | Alternativa a `private-key-base64` (base64 tem precedência) | Runtime | Decl.: `SecurityJwtConfig#privateKeyLocation()`; consumo: `configs/RsaKeyProvider#loadPrivateKey` |
| `seedgrid.security.jwt.private-key-base64` 🔒 | Optional\<String\> | Base64 do DER PKCS#8 (sem header PEM; espaços removidos) | vazio (= ausente) | Condicional (ver acima) | Se presente e não-branco, tem precedência sobre `private-key-location` | Assinatura RS256 | — | Runtime | Decl.: `SecurityJwtConfig#privateKeyBase64()`; consumo: `RsaKeyProvider#loadPrivateKey` |
| `seedgrid.security.jwt.public-key-location` | Optional\<String\> | caminho/classpath, PEM `PUBLIC KEY` (X.509) | `keys/public.pem` (mp-config; mesmo fallback em código) | Condicional — usada se `public-key-base64` vazio | Igual à privada | Verificação no `TokenVerifier` | Bridge `mp.jwt.verify.publickey.location=${seedgrid.security.jwt.public-key-location}` | Runtime | Decl.: `SecurityJwtConfig#publicKeyLocation()`; consumo: `RsaKeyProvider#loadPublicKey` |
| `seedgrid.security.jwt.public-key-base64` | Optional\<String\> | Base64 do DER X.509 | vazio | Condicional | Precedência sobre `public-key-location` | Verificação | **Não** há bridge para `mp.jwt.verify.publickey` (comentário no mp-config): quem usa base64 deve definir `MP_JWT_VERIFY_PUBLICKEY` diretamente | Runtime | Decl.: `SecurityJwtConfig#publicKeyBase64()`; consumo: `RsaKeyProvider#loadPublicKey` |

### 2.2 Refresh token (`seedgrid.security.refresh-token.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.refresh-token.ttl` | Duration | ISO-8601 | `P30D` | Não | TTL deslizante: cada rotação emite token com nova janela (`expiresAt = now + ttl`) | Emissão/rotação de refresh token | — | Runtime | Decl.: `…/security/configs/RefreshTokenConfig#ttl()`; consumo: `services/RefreshTokenService#buildToken` |
| `seedgrid.security.refresh-token.reuse-grace-window` | Duration | ISO-8601; `PT0S` (ou negativo) desliga | `PT30S` | Não | Dentro da janela, reapresentar um token já rotacionado (não revogado, com `usedAt`) é tratado como corrida concorrente e emite outro token da mesma família, sem revogar; fora dela, reuso revoga a família | Detecção de reuso | Testes usam `PT0S` | Runtime | Decl.: `RefreshTokenConfig#reuseGraceWindow()`; consumo: `RefreshTokenService#isWithinReuseGraceWindow` |

### 2.3 Criptografia de segredos internos (`seedgrid.security.encryption.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.encryption.key` 🔒 | String | Base64 de 32 bytes (AES-256) | — (não está no mp-config) | **Sim** | Chave AES-256-GCM (IV de 12 bytes) para cifrar segredos TOTP e a senha de bootstrap pendente (`pending_bootstrap_password`) | `SecretEncryptionService#encrypt/decrypt` | Independente de `seedgrid.privacy.*` (lib privacy) | Runtime | Decl.: `…/security/configs/SecurityEncryptionConfig#key()`; consumo: `services/SecretEncryptionService` (construtor) |

### 2.4 Política de senha (`seedgrid.security.password.*`)

Nenhuma tem `@WithDefault`. O mp-config fornece valores **permissivos** (comentário original: "lenient for tests"); um host que não os sobrescreva aceita senha de 1 caractere.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.password.min-size` | int | ≥ 0 | `1` (mp-config) | Sim no mapping; satisfeita pelo mp-config | Tamanho mínimo; o gerador de senha usa `max(min-size, nº de categorias exigidas)` | `PasswordService#validate`, `utils/PasswordGenerator#generate` | Senha do 1º admin é validada por esta política | Runtime | Decl.: `…/security/configs/PasswordConfig#minSize()`; consumo: `services/PasswordService`, `utils/PasswordGenerator` |
| `seedgrid.security.password.max-history` | int | ≥ 0; `0` desliga | `0` (mp-config) | idem | Bloqueia reutilizar as últimas N senhas | `PasswordHistoryService#isPasswordInHistory/addToHistory` | — | Runtime | Decl.: `PasswordConfig#maxHistory()`; consumo: `services/PasswordHistoryService` |
| `seedgrid.security.password.upper-case-required` | boolean | `true`/`false` | `false` (mp-config) | idem | Exige `[A-Z]` | Validação e geração | — | Runtime | Decl.: `PasswordConfig#upperCaseRequired()`; consumo: `PasswordService`, `PasswordGenerator` |
| `seedgrid.security.password.lower-case-required` | boolean | `true`/`false` | `false` (mp-config) | idem | Exige `[a-z]` | Validação e geração | — | Runtime | Decl.: `PasswordConfig#lowerCaseRequired()`; consumo: `PasswordService`, `PasswordGenerator` |
| `seedgrid.security.password.special-character-required` | boolean | `true`/`false` | `false` (mp-config) | idem | Exige um de `!@#$%^&*(),.?":{}\|<>` | Validação e geração | — | Runtime | Decl.: `PasswordConfig#specialCharacterRequired()`; consumo: `PasswordService`, `PasswordGenerator` |
| `seedgrid.security.password.prohibits-repeated-characters-in-sequence` | boolean | `true`/`false` | `false` (mp-config) | idem | Rejeita dois caracteres iguais consecutivos | Validação | — | Runtime | Decl.: `PasswordConfig#prohibitsRepeatedCharactersInSequence()`; consumo: `PasswordService#validate` |
| `seedgrid.security.password.expiration-days` | int | ≥ 0; `0` = não expira | `0` (mp-config) | idem | Calcula `passwordExpiresAt = now + N dias` | `PasswordHistoryService#calculatePasswordExpiration` | — | Runtime | Decl.: `PasswordConfig#expirationDays()`; consumo: `PasswordHistoryService` |

### 2.5 2FA (`seedgrid.security.2f.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.2f.enabled` | boolean | `true`/`false` | **`true`** (mp-config; `@WithDefault` `false`) | Não | `false`: `/2f/enable` responde 400 "2FA is disabled" e o login não inicia desafio 2FA | Login e endpoints `/2f/*` | — | Runtime | Decl.: `…/security/configs/TwoFactorConfig#enabled()`; consumo: `services/AuthService` (login), `controllers/TwoFactorController#enable2FA`, `services/TwoFactorService` |
| `seedgrid.security.2f.allowed-methods` | List\<String\> | `EMAIL`, `TOTP`, `WHATSAPP` (códigos das `TwoFactorStrategy` registradas; normalizados `trim().toUpperCase()`; ver [[SeedGrid/Extensions/security/Enums#TwoFactorMethodType\|TwoFactorMethodType]] — `BACKUP_CODE` existe no enum mas não tem estratégia) | `EMAIL,TOTP` | Não | Interseção com as estratégias disponíveis e com `canEnroll(user)` define o que o usuário pode ativar | `TwoFactorController#getAllowedMethods/isAllowedMethod` | `WHATSAPP` exige `whatsapp.channel-id` | Runtime | Decl.: `TwoFactorConfig#allowedMethods()`; consumo: `controllers/TwoFactorController` |
| `seedgrid.security.2f.totp.issuer` | String | texto | `SeedGrid` | Não | Issuer na URL `otpauth://` e no QR | Setup TOTP | — | Runtime | Decl.: `TwoFactorConfig.Totp#issuer()`; consumo: `services/TwoFactorService` |
| `seedgrid.security.2f.totp.digits` | int | ex.: 6 | `6` | Não | Dígitos do código TOTP | Setup e verificação TOTP | — | Runtime | Decl.: `TwoFactorConfig.Totp#digits()`; consumo: `TwoFactorService`, `spi/impl/TotpTwoFactorStrategy` |
| `seedgrid.security.2f.totp.period` | int | segundos | `30` | Não | Período do código | Setup e verificação TOTP | — | Runtime | Decl.: `TwoFactorConfig.Totp#period()`; consumo: idem |
| `seedgrid.security.2f.totp.window` | int | ≥ 0 | `1` | Não | Tolerância de clock skew (períodos antes/depois) | Verificação TOTP | — | Runtime | Decl.: `TwoFactorConfig.Totp#window()`; consumo: `TwoFactorService`, `TotpTwoFactorStrategy` |
| `seedgrid.security.2f.otp-qrcode.branding.enabled` | boolean | `true`/`false` | `false` | Não | Sobrepõe logo no QR code | Setup TOTP com `includeQrImage=true` | Requer `otp-qrcode.logo` | Runtime | Decl.: `TwoFactorConfig.OtpQrCode.Branding#enabled()` (`@WithName("otp-qrcode")`); consumo: `TwoFactorService` → `utils/TotpUtil#generateQrCodeBase64` |
| `seedgrid.security.2f.otp-qrcode.logo` | Optional\<String\> | `classpath:...` ou caminho de arquivo | — | Condicional (só com branding) | Caminho do logo | idem | — | Runtime | Decl.: `TwoFactorConfig.OtpQrCode#logo()`; consumo: `TwoFactorService` |
| `seedgrid.security.2f.otp-qrcode.size` | int | pixels | `256` | Não | Largura/altura da imagem QR | idem | — | Runtime | Decl.: `TwoFactorConfig.OtpQrCode#size()`; consumo: `TwoFactorService`, `TwoFactorController` |
| `seedgrid.security.2f.verify.max-attempts` | int | ≥ 1 | `5` | Não | Ao exceder, a sessão 2FA (tempToken) é removida e a verificação falha | `TwoFactorService` (verify) | Somado ao rate-limit `2fa-verify` | Runtime | Decl.: `TwoFactorConfig.Verify#maxAttempts()`; consumo: `services/TwoFactorService` |
| `seedgrid.security.2f.session.ttl` | Duration | ISO-8601 | `PT5M` | Não | Validade do `tempToken` (sessão 2FA em cache) | `TwoFactorService` | — | Runtime | Decl.: `TwoFactorConfig.Session#ttl()`; consumo: `TwoFactorService` |
| `seedgrid.security.2f.email.code-ttl` | Duration | ISO-8601 | `PT5M` | Não | Validade do código por e-mail | Estratégia EMAIL | — | Runtime | Decl.: `TwoFactorConfig.Email#codeTtl()`; consumo: `spi/impl/EmailTwoFactorStrategy` |
| `seedgrid.security.2f.backup-codes.count` | int | ≥ 1 | `10` | Não | Quantidade de backup codes gerados | `BackupCodeService` | — | Runtime | Decl.: `TwoFactorConfig.BackupCodes#count()`; consumo: `services/BackupCodeService` |
| `seedgrid.security.2f.backup-codes.length` | int | ≥ 1 | `6` | Não | Tamanho de cada backup code | `BackupCodeService` | — | Runtime | Decl.: `TwoFactorConfig.BackupCodes#length()`; consumo: `BackupCodeService` |
| `seedgrid.security.2f.whatsapp.channel-id` | Optional\<String\> | id do canal/instância do provedor WhatsApp | vazio (mp-config `${SEEDGRID_SECURITY_2F_WHATSAPP_CHANNEL_ID:}`) | Condicional — necessário para usar `WHATSAPP` | Sem valor, a ativação de WHATSAPP responde "WHATSAPP 2FA is not configured. Define seedgrid.security.2f.whatsapp.channel-id." | Envio via `WhatsAppApi` | Depende da extension whatsapp (`seedgrid.whatsapp.api`) | Runtime | Decl.: `TwoFactorConfig.Whatsapp#channelId()`; consumo: `spi/impl/WhatsappTwoFactorStrategy`, `TwoFactorController` |
| `seedgrid.security.2f.whatsapp.code-ttl` | Duration | ISO-8601 | `PT5M` | Não | Validade do código por WhatsApp | Estratégia WHATSAPP | — | Runtime | Decl.: `TwoFactorConfig.Whatsapp#codeTtl()`; consumo: `WhatsappTwoFactorStrategy` |

### 2.6 Self-enter — auto-cadastro e convites (`seedgrid.security.self-enter.*`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.self-enter.enabled` | boolean | `true`/`false` | `false` | Não | `false`: `SelfEnterDisabledFilter` (`@PreMatching`) responde 404 para `/self-enter*`, `/public/self-enter*` (também com prefixo `/api`) e `SelfEnterOpenApiFilter` remove as rotas/tag do OpenAPI; o job de limpeza não roda | Todo o módulo self-enter | Pré-condição de `public-enabled`/`invite-enabled`/`cleanup.enabled` | Runtime | Decl.: `…/security/configs/SelfEnterConfig#enabled()`; consumo: `filters/SelfEnterDisabledFilter` e `openapi/SelfEnterOpenApiFilter` (via `ConfigProvider.getOptionalValue`, fallback `false`), `services/SelfEnterService`, `controllers/SelfEnter*Controller`, `jobs/EntryRequestCleanupJob` |
| `seedgrid.security.self-enter.public-enabled` | boolean | `true`/`false` | `true` | Não | Libera o signup público (`POST /public/self-enter/requests` e o link público) | `SelfEnterService`, `SelfEnterController#publicLink`, `SelfEnterPublicController` | Só vale com `enabled=true` | Runtime | Decl.: `SelfEnterConfig#publicEnabled()`; consumo: idem |
| `seedgrid.security.self-enter.invite-enabled` | boolean | `true`/`false` | `true` | Não | Libera convites (`/self-enter/invitations`, `/public/self-enter/invitations/{token}`) | idem | Só vale com `enabled=true` | Runtime | Decl.: `SelfEnterConfig#inviteEnabled()`; consumo: idem |
| `seedgrid.security.self-enter.invite-needs-approval` | boolean | `true`/`false` | `true` | Não | `false`: convite aceito já cria o usuário (quem convidou é aprovador implícito). Não afeta o signup público, que sempre exige aprovação | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig#inviteNeedsApproval()`; consumo: `SelfEnterService` |
| `seedgrid.security.self-enter.request-ttl` | Duration | ISO-8601 | `PT48H` | Não | Validade da solicitação de entrada (confirmar e-mail + aprovação) | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig#requestTtl()`; consumo: `SelfEnterService` |
| `seedgrid.security.self-enter.invite-ttl` | Duration | ISO-8601 | `PT168H` | Não | Validade do convite; também enviada em horas no e-mail | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig#inviteTtl()`; consumo: `SelfEnterService` |
| `seedgrid.security.self-enter.email-token-ttl` | Duration | ISO-8601 | `PT30M` | Não | Validade do código OTP de confirmação de e-mail | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig#emailTokenTtl()`; consumo: `SelfEnterService` |
| `seedgrid.security.self-enter.default-role` | String | nome **exato** (case-sensitive) de uma role **global** (`company_id IS NULL`) | — (sem padrão) | **Sim, quando `self-enter.enabled=true`**: o boot falha (`SelfEnterConfigValidator`, `IllegalStateException`) se estiver ausente ou em branco. Só presença é validada; a existência da role não é checada no boot | Usada **só** quando nem o convite nem a aprovação trazem roles (`SelfEnterService#resolveApprovalRoles`). Busca por `RoleRepository#findByName` (`r.name = :name AND r.companyId IS NULL`): role criada por conta/empresa **não** é encontrada. Role inexistente (ou propriedade ausente) → `InvalidEntryRequestStatusException` (HTTP 422), sem fallback; role de integração → `UserRoleNotAllowedException` (HTTP 403). Em conta cliente isolada (`companyId` presente, mais de uma empresa e não é a plataforma) a default-role **não** passa por `requireAssignableInCompany` (as roles do convite exigem role da própria conta ou global `is_system`) e vira role da membership; fora disso vira role global do usuário. Como não há padrão, quem opera escolhe a role: se for uma role privilegiada, convite sem roles com `invite-needs-approval=false` cria um usuário com esses privilégios automaticamente — prefira uma role de menor privilégio | Aprovação de entry request (manual ou auto-aprovação do convite) | Roles do convite/aprovação (por `publicId`) têm precedência; `invite-needs-approval` | Runtime | Decl.: `SelfEnterConfig#defaultRole()`; consumo: `services/SelfEnterService#resolveApprovalRoles`, `repositories/RoleRepository#findByName` |
| `seedgrid.security.self-enter.cleanup.enabled` | boolean | `true`/`false` | `true` | Não | Liga o job que expira solicitações antigas e purga finalizadas (todos os tenants) | `EntryRequestCleanupJob#cleanup` | Exige `self-enter.enabled=true` | Runtime | Decl.: `SelfEnterConfig.Cleanup#enabled()`; consumo: `jobs/EntryRequestCleanupJob` |
| `seedgrid.security.self-enter.cleanup.cron` | String | cron Quartz (6–7 campos) | `0 */10 * * * ?` | Não | Agenda do job (`@Scheduled(cron = "{seedgrid.security.self-enter.cleanup.cron}")`, execução concorrente `SKIP`) | Scheduler Quarkus | *Inferência*: o default do `@WithDefault` é visível à expressão do `@Scheduled` porque o SmallRye registra defaults de mappings como fonte de config | Runtime (lido ao iniciar o scheduler) | Decl.: `SelfEnterConfig.Cleanup#cron()`; consumo: `EntryRequestCleanupJob` (anotação) |
| `seedgrid.security.self-enter.cleanup.purge-after` | Duration | ISO-8601 | `PT168H` | Não | Idade após a qual solicitações APPROVED/REJECTED/EXPIRED são apagadas | Job de limpeza | — | Runtime | Decl.: `SelfEnterConfig.Cleanup#purgeAfter()`; consumo: `EntryRequestCleanupJob` |
| `seedgrid.security.self-enter.email.confirm-subject` | String | texto | `Confirme seu e-mail` | Não | Assunto do e-mail com código de confirmação | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig.Email#confirmSubject()`; consumo: `SelfEnterService` |
| `seedgrid.security.self-enter.email.invite-subject` | String | texto | `Voce recebeu um convite para cadastro` | Não | Assunto do e-mail de convite | `SelfEnterService` | — | Runtime | Decl.: `SelfEnterConfig.Email#inviteSubject()`; consumo: `SelfEnterService` |

### 2.7 E-mail / SMTP (`seedgrid.security.mailer.*`)

Os e-mails usam o mailer **nomeado** `@MailerName("security")`. As chaves SMTP abaixo só chegam ao Quarkus pelo *bridge* do mp-config (`quarkus.mailer."security".*=${seedgrid.security.mailer.*}`); o código Java só lê `from`.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.mailer.from` | String | e-mail | `noreply@example.com` (mp-config) | Sim no mapping; satisfeita pelo mp-config (sobrescrever em produção) | `From` de todos os e-mails do `DefaultEmailService` | Confirmação, reset, boas-vindas, self-enter, 2FA | Bridge `quarkus.mailer."security".from` | Runtime | Decl.: `…/security/configs/SecurityMailerConfig#from()`; consumo: `spi/impl/DefaultEmailService` |
| `seedgrid.security.mailer.host` | Optional\<String\> | hostname | `smtp.gmail.com` (mp-config) | Não | Efeito só pela ponte (`quarkus.mailer."security".host`) | SMTP | `quarkus.mailer."security".host` | Runtime | Decl.: `SecurityMailerConfig#host()`; consumo: ponte no mp-config (o Java não lê) |
| `seedgrid.security.mailer.port` | Optional\<Integer\> | porta | `587` (mp-config) | Não | idem | SMTP | `quarkus.mailer."security".port` | Runtime | Decl.: `SecurityMailerConfig#port()`; bridge |
| `seedgrid.security.mailer.start-tls` | Optional\<String\> | `DISABLED`/`OPTIONAL`/`REQUIRED` (valores do `quarkus.mailer.start-tls`; o javadoc da interface cita `NEVER`, que não é valor do Quarkus) | `REQUIRED` (mp-config) | Não | idem | SMTP | `quarkus.mailer."security".start-tls` | Runtime | Decl.: `SecurityMailerConfig#startTls()`; bridge |
| `seedgrid.security.mailer.username` 🔒 | Optional\<String\> | texto | vazio | Não | idem | SMTP AUTH | `quarkus.mailer."security".username` | Runtime | Decl.: `SecurityMailerConfig#username()`; bridge |
| `seedgrid.security.mailer.password` 🔒 | Optional\<String\> | texto | vazio | Não | idem | SMTP AUTH | `quarkus.mailer."security".password` | Runtime | Decl.: `SecurityMailerConfig#password()`; bridge |
| `seedgrid.security.mailer.auth-methods` | Optional\<String\> | métodos SASL separados por espaço | `PLAIN LOGIN` (mp-config) | Não | Evita que o Vert.x escolha XOAUTH2 (Gmail) com senha comum | SMTP AUTH | `quarkus.mailer."security".auth-methods` | Runtime | Decl.: `SecurityMailerConfig#authMethods()`; bridge |

Como funciona a ponte: o mp-config define `quarkus.mailer."security".<campo>=${seedgrid.security.mailer.<campo>}` para `from`, `host`, `port`, `start-tls`, `username`, `password` e `auth-methods`. Por isso essas chaves `seedgrid.security.mailer.*` funcionam, mas **só enquanto o host não redefinir** a `quarkus.mailer."security".<campo>` correspondente (que passa a valer no lugar). Usuário/senha vazios resultam em SMTP sem autenticação — a suíte de testes sobe assim, com `quarkus.mailer."security".mock=true`.

### 2.8 URLs do frontend (`seedgrid.security.frontend.*`)

Todas são `String` não-`Optional`; `SecurityLinkBuilder` ainda valida em uso: vazio → `IllegalStateException("Missing required property: …")`, path sem `/` inicial → `IllegalStateException("Property must start with '/': …")`. A barra final de `base-url` é removida.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.frontend.base-url` | String | origem `http(s)://host[:porta]` | `http://localhost:3000` (mp-config) | Sim (satisfeita pelo mp-config; sobrescrever em produção) | Prefixo de todos os links dos e-mails | `SecurityLinkBuilder` | Junta com cada `*-path` | Runtime | Decl.: `…/security/configs/SecurityFrontendConfig#baseUrl()`; consumo: `services/SecurityLinkBuilder#resolveBaseUrl` |
| `seedgrid.security.frontend.login-path` | String | começa com `/` | `/login` | idem | Monta a URL de login em `SecurityLinkBuilder#buildLoginUrl` (bean público; `DefaultEmailService#buildLoginLink` a expõe a subclasses). **Nenhum e-mail embutido usa este link hoje** — só tem efeito se o host/SPI chamar `buildLoginUrl()` | `SecurityLinkBuilder#buildLoginUrl` | — | Runtime | Decl.: `SecurityFrontendConfig#loginPath()` |
| `seedgrid.security.frontend.password-reset-path` | String | começa com `/` | `/auth/forgot-password/confirm` | idem | Link de reset, com `?token=` | `buildPasswordResetUrl` | — | Runtime | Decl.: `SecurityFrontendConfig#passwordResetPath()` |
| `seedgrid.security.frontend.email-confirmation-path` | String | começa com `/` | `/auth/confirm-email` | idem | Link de confirmação de e-mail, com `?token=` | `buildEmailConfirmationUrl` | — | Runtime | Decl.: `SecurityFrontendConfig#emailConfirmationPath()` |
| `seedgrid.security.frontend.welcome-path` | String | começa com `/` | `/auth/welcome` | idem | Link do e-mail de boas-vindas (1º admin / usuários criados), com `?token=` | `buildWelcomeUrl` | — | Runtime | Decl.: `SecurityFrontendConfig#welcomePath()` |
| `seedgrid.security.frontend.self-enter-path` | String | começa com `/` | `/auth/self-enter` (mp-config) | idem | Link do convite de self-enter, com `?token=` | `buildSelfEnterInviteUrl` | Os testes e o README usam `/auth/self-enter/invitation` | Runtime | Decl.: `SecurityFrontendConfig#selfEnterPath()` |

### 2.9 Bootstrap: empresa default e primeiro admin

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.bootstrap.enabled` | boolean | `true`/`false` | `true` | Não | No `StartupEvent`: cria a empresa default (se não existir pelo CNPJ), vincula usuários sem empresa (se só houver 1 empresa) e cria o 1º admin. **Deve ser `false` em host database-per-tenant** (subdomain-tenancy), senão o boot cai | `FirstAdminBootstrapService#onStart` | Controla `default-company.*` e `first-admin-user.*` no boot | Runtime | Decl.: `…/security/configs/SecurityBootstrapConfig#enabled()`; consumo: `services/FirstAdminBootstrapService` |
| `seedgrid.security.default-company.cnpj` | String | CNPJ (pontuação removida) | — (mp-config `${SEEDGRID_SECURITY_DEFAULT_COMPANY_CNPJ}` **sem default**) | **Sim** — mesmo com bootstrap desligado (*Inferência*: validação do mapping; o teste `BootstrapDisabledProfile` também define) | Identifica a "empresa-plataforma": criada no bootstrap; excluída do seletor de empresas do cliente; define quem é usuário de plataforma (`@SgPlatformScope`) | Bootstrap, `AuthService`, `PlatformScopeFilter`, `PlatformCompanyService` | — | Runtime | Decl.: `…/security/configs/DefaultCompanyConfig#cnpj()`; consumo: `FirstAdminBootstrapService#ensureDefaultCompany`, `services/AuthService`, `filters/PlatformScopeFilter`, `services/PlatformCompanyService` |
| `seedgrid.security.default-company.corporate-name` | String | texto | — (env sem default) | **Sim** | Razão social da empresa criada | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#corporateName()`; consumo: `FirstAdminBootstrapService#createDefaultCompany` |
| `seedgrid.security.default-company.trade-name` | String | texto | — (env sem default) | **Sim** | Nome fantasia | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#tradeName()`; consumo: idem |
| `seedgrid.security.default-company.addr-street` | Optional\<String\> | texto | vazio | Não | Endereço da empresa criada (trim → null) | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrStreet()`; consumo: `createDefaultCompany` |
| `seedgrid.security.default-company.addr-number` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrNumber()` |
| `seedgrid.security.default-company.addr-complement` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrComplement()` |
| `seedgrid.security.default-company.addr-postal-code` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrPostalCode()` |
| `seedgrid.security.default-company.addr-city` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrCity()` |
| `seedgrid.security.default-company.addr-state` | Optional\<String\> | sigla de UF; `StateEnum.valueOf(valor.toUpperCase())` — valor inválido lança `IllegalArgumentException` no bootstrap | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrState()` |
| `seedgrid.security.default-company.addr-district` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrDistrict()` |
| `seedgrid.security.default-company.addr-phone` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#addrPhone()` |
| `seedgrid.security.default-company.rep-first-name` | Optional\<String\> | texto | vazio | Não | Representante legal | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repFirstName()` |
| `seedgrid.security.default-company.rep-last-name` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repLastName()` |
| `seedgrid.security.default-company.rep-cpf` | Optional\<String\> | CPF | vazio | Não | idem (PII) | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repCpf()` |
| `seedgrid.security.default-company.rep-birth-date` | Optional\<String\> | data ISO `yyyy-MM-dd` (`LocalDate.parse`) | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repBirthDate()` |
| `seedgrid.security.default-company.rep-phone` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repPhone()` |
| `seedgrid.security.default-company.rep-whatsapp` | Optional\<String\> | texto | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repWhatsapp()` |
| `seedgrid.security.default-company.rep-email` | Optional\<String\> | e-mail | vazio | Não | idem | Bootstrap | — | Runtime | Decl.: `DefaultCompanyConfig#repEmail()` |
| `seedgrid.security.first-admin-user.email` | Optional\<String\> | e-mail (normalizado lower-case) | vazio | Não | Vazio → 1º admin não é criado. Se o usuário já existe e não confirmou o e-mail, reenvia boas-vindas. Só cria se a tabela `sg_users` estiver vazia; recebe role `ADMIN`, `root=true`, troca de senha obrigatória | Bootstrap | Requer `bootstrap.enabled=true`, role `ADMIN` semeada (V204), mailer | Runtime | Decl.: `…/security/configs/FirstAdminUserConfig#email()`; consumo: `FirstAdminBootstrapService#onStart` |
| `seedgrid.security.first-admin-user.name` | Optional\<String\> | texto | vazio (fallback em código: `Administrador`) | Não | Nome do 1º admin | Bootstrap | — | Runtime | Decl.: `FirstAdminUserConfig#name()`; consumo: `FirstAdminBootstrapService#resolveName` |
| `seedgrid.security.first-admin-user.whatsapp` | Optional\<String\> | texto | vazio (→ `""`) | Não | WhatsApp do 1º admin | Bootstrap | — | Runtime | Decl.: `FirstAdminUserConfig#whatsapp()` |
| `seedgrid.security.first-admin-user.initial-password` 🔒 | Optional\<String\> | senha que passe na política | vazio (→ senha gerada por `PasswordGenerator`) | Não | Validada pela política de senha; guardada cifrada (`encryption.key`) até a troca e enviada no e-mail de boas-vindas | Bootstrap | `password.*`, `encryption.key` | Runtime | Decl.: `FirstAdminUserConfig#initialPassword()`; consumo: `FirstAdminBootstrapService#resolvePassword` |

### 2.10 Avatar (`seedgrid.security.avatar.*`)

O mapa por backend é repassado ao `FileStorageRegistry` da lib filemanagement (`fileStorageRegistry.get(storageType, config)`), com as chaves internas `base-path`, `bucket`, `region`, `access-key`, `secret-key`, `endpoint`, `connection-string`, `container`, `account-name`, `account-key`, `root-folder-id`, `credentials-file`, `credentials-json`, `client-id`, `client-secret`, `tenant-id`, `root-folder-path`, `project-id`. Validação de obrigatoriedade por backend fica na filemanagement (não confirmada aqui — ver [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração da filemanagement]]).

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.avatar.storage` | String | `filesystem`, `s3`, `minio`, `azure-blob`, `google-drive`, `onedrive`, `gcs` (case-insensitive); outro → `IllegalArgumentException("Unknown storage type")` | `filesystem` | Não | Backend onde o avatar é gravado | Upload de avatar de usuário e default | Seleciona o grupo de chaves abaixo | Runtime | Decl.: `…/security/configs/AvatarConfig#storage()`; consumo: `services/UserAvatarService` |
| `seedgrid.security.avatar.user-prefix` | String | caminho | `avatars/users` | Não | Prefixo dos avatares de usuário (+ `publicId`) | `UserAvatarService#buildUserPrefix` | — | Runtime | Decl.: `AvatarConfig#userPrefix()` |
| `seedgrid.security.avatar.default-prefix` | String | caminho | `avatars/defaults` | Não | Prefixo dos avatares padrão | `UserAvatarService#buildDefaultPrefix` | — | Runtime | Decl.: `AvatarConfig#defaultPrefix()` |
| `seedgrid.security.avatar.public-read` | boolean | `true`/`false` | `false` | Não | `StorageOptions.publicRead` | Upload | — | Runtime | Decl.: `AvatarConfig#publicRead()` |
| `seedgrid.security.avatar.filesystem.base-path` | String | diretório | `/var/seedgrid/files` | Não | Raiz do storage filesystem | `storage=filesystem` | — | Runtime | Decl.: `AvatarConfig.FilesystemConfig#basePath()`; consumo: `UserAvatarService#buildStorageConfig` |
| `seedgrid.security.avatar.s3.bucket` | Optional\<String\> | texto | vazio | Condicional (`storage=s3`) | — | `storage=s3` | — | Runtime | Decl.: `AvatarConfig.S3Config#bucket()`; consumo: `buildStorageConfig` |
| `seedgrid.security.avatar.s3.region` | Optional\<String\> | região AWS | vazio | Condicional | — | `storage=s3` | — | Runtime | Decl.: `S3Config#region()` |
| `seedgrid.security.avatar.s3.access-key` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=s3` | — | Runtime | Decl.: `S3Config#accessKey()` |
| `seedgrid.security.avatar.s3.secret-key` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=s3` | — | Runtime | Decl.: `S3Config#secretKey()` |
| `seedgrid.security.avatar.s3.endpoint` | Optional\<String\> | URL | vazio | Não | Endpoint customizado | `storage=s3` | — | Runtime | Decl.: `S3Config#endpoint()` |
| `seedgrid.security.avatar.minio.bucket` | Optional\<String\> | texto | vazio | Condicional (`storage=minio`) | — | `storage=minio` | — | Runtime | Decl.: `AvatarConfig.MinioConfig#bucket()` |
| `seedgrid.security.avatar.minio.region` | Optional\<String\> | texto | `us-east-1` (mp-config) | Não | — | `storage=minio` | — | Runtime | Decl.: `MinioConfig#region()` |
| `seedgrid.security.avatar.minio.access-key` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=minio` | — | Runtime | Decl.: `MinioConfig#accessKey()` |
| `seedgrid.security.avatar.minio.secret-key` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=minio` | — | Runtime | Decl.: `MinioConfig#secretKey()` |
| `seedgrid.security.avatar.minio.endpoint` | Optional\<String\> | URL | vazio | Condicional | — | `storage=minio` | — | Runtime | Decl.: `MinioConfig#endpoint()` |
| `seedgrid.security.avatar.azure-blob.connection-string` 🔒 | Optional\<String\> | connection string Azure | vazio | Condicional (`storage=azure-blob`) | — | `storage=azure-blob` | Alternativa a `account-name`+`account-key` (*Inferência*) | Runtime | Decl.: `AvatarConfig.AzureBlobConfig#connectionString()` |
| `seedgrid.security.avatar.azure-blob.container` | Optional\<String\> | texto | vazio | Condicional | — | `storage=azure-blob` | — | Runtime | Decl.: `AzureBlobConfig#container()` |
| `seedgrid.security.avatar.azure-blob.account-name` | Optional\<String\> | texto | vazio | Condicional | — | `storage=azure-blob` | — | Runtime | Decl.: `AzureBlobConfig#accountName()` |
| `seedgrid.security.avatar.azure-blob.account-key` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=azure-blob` | — | Runtime | Decl.: `AzureBlobConfig#accountKey()` |
| `seedgrid.security.avatar.google-drive.root-folder-id` | Optional\<String\> | id de pasta | vazio | Condicional (`storage=google-drive`) | — | `storage=google-drive` | — | Runtime | Decl.: `AvatarConfig.GoogleDriveConfig#rootFolderId()` |
| `seedgrid.security.avatar.google-drive.credentials-file` 🔒 | Optional\<String\> | caminho | vazio | Condicional | — | `storage=google-drive` | Alternativa a `credentials-json` (*Inferência*) | Runtime | Decl.: `GoogleDriveConfig#credentialsFile()` |
| `seedgrid.security.avatar.google-drive.credentials-json` 🔒 | Optional\<String\> | JSON | vazio | Condicional | — | `storage=google-drive` | — | Runtime | Decl.: `GoogleDriveConfig#credentialsJson()` |
| `seedgrid.security.avatar.onedrive.client-id` | Optional\<String\> | texto | vazio | Condicional (`storage=onedrive`) | — | `storage=onedrive` | — | Runtime | Decl.: `AvatarConfig.OnedriveConfig#clientId()` |
| `seedgrid.security.avatar.onedrive.client-secret` 🔒 | Optional\<String\> | texto | vazio | Condicional | — | `storage=onedrive` | — | Runtime | Decl.: `OnedriveConfig#clientSecret()` |
| `seedgrid.security.avatar.onedrive.tenant-id` | Optional\<String\> | texto | vazio | Condicional | — | `storage=onedrive` | — | Runtime | Decl.: `OnedriveConfig#tenantId()` |
| `seedgrid.security.avatar.onedrive.root-folder-path` | String | caminho | `/seedgrid/files` | Não | — | `storage=onedrive` | — | Runtime | Decl.: `OnedriveConfig#rootFolderPath()` |
| `seedgrid.security.avatar.gcs.bucket` | Optional\<String\> | texto | vazio | Condicional (`storage=gcs`) | — | `storage=gcs` | — | Runtime | Decl.: `AvatarConfig.GcsConfig#bucket()` |
| `seedgrid.security.avatar.gcs.project-id` | Optional\<String\> | texto | vazio | Condicional | — | `storage=gcs` | — | Runtime | Decl.: `GcsConfig#projectId()` |
| `seedgrid.security.avatar.gcs.credentials-file` 🔒 | Optional\<String\> | caminho | vazio | Condicional | — | `storage=gcs` | — | Runtime | Decl.: `GcsConfig#credentialsFile()` |
| `seedgrid.security.avatar.gcs.credentials-json` 🔒 | Optional\<String\> | JSON | vazio | Condicional | — | `storage=gcs` | — | Runtime | Decl.: `GcsConfig#credentialsJson()` |

Todas as chaves de avatar têm no mp-config a variável `SEEDGRID_SECURITY_AVATAR_<GRUPO>_<CAMPO>` (ex.: `SEEDGRID_SECURITY_AVATAR_S3_SECRET_KEY`), igual à regra padrão.

### 2.11 Usuário, RBAC e gestão pela conta

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.user.additional-attributes.max-size-bytes` | int | > 0 | `16384` | Não | Tamanho máximo do JSON final (bytes UTF-8) após merge; excedeu → HTTP 400 (`InvalidUserAdditionalAttributesException`) | `POST /users`, `PATCH /users/{publicId}`, `/app/security/users` | env no mp-config: `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_SIZE_BYTES` (difere da regra padrão `SEEDGRID_SECURITY_USER_ADDITIONAL_ATTRIBUTES_MAX_SIZE_BYTES`; ambas funcionam — *Inferência* para a padrão) | Runtime | Decl.: `…/security/configs/UserAttributesConfig#maxSizeBytes()`; consumo: `utils/JsonAttributeLimits#check`, `services/UserService` |
| `seedgrid.security.user.additional-attributes.max-depth` | int | > 0 (raiz = 1) | `5` | Não | Profundidade máxima de aninhamento | idem | env mp-config: `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_DEPTH` | Runtime | Decl.: `UserAttributesConfig#maxDepth()`; consumo: `JsonAttributeLimits` |
| `seedgrid.security.user.additional-attributes.max-keys` | int | > 0 | `100` | Não | Total de chaves em todos os níveis (inclusive dentro de arrays) | idem | env mp-config: `SEEDGRID_SECURITY_USER_ATTRIBUTES_MAX_KEYS` | Runtime | Decl.: `UserAttributesConfig#maxKeys()`; consumo: `JsonAttributeLimits` |
| `seedgrid.security.rbac.cache-ttl` | Duration | ISO-8601 | `PT5M` | Não | TTL do cache roles→permissões efetivas (chave `security:rbac:perm:` + versão RBAC + nonce de boot + audience + empresa) no `SeedGridCacheProvider` | `RbacSecurityIdentityAugmentor` → `PermissionResolveService#resolve` | Backend de cache vem da lib cache ([[SeedGrid/Extensions/cache/Configuracao\|Configuração do cache]]) | Runtime | Decl.: `…/security/services/PermissionResolveService.RbacConfig#cacheTtl()`; consumo: `PermissionResolveService#resolve` |
| `seedgrid.security.account.assignable-permission-audiences` | Optional\<List\<String\>\> | lista separada por vírgula (o host define; login-tenancy usa `client`) | — (vazio = só permissões sem audience) | Não | Audiences de permissão que o admin de uma conta pode atribuir aos perfis da conta em `/me/security/roles`; permissão com outra audience → `PermissionNotAssignableException` | `RoleService#resolveAccountAssignablePermissions` | Coluna `permissions.audience` (V223/V234) | Runtime | Decl.: `…/security/configs/AccountManagementConfig#assignablePermissionAudiences()`; consumo: `services/RoleService#accountAudiences` (via `Instance<…>`) |

### 2.12 Outras chaves lidas pelo security (`@ConfigProperty`)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.show-dev-message` | boolean | `true`/`false` | `false` | Não | Inclui mensagem de desenvolvimento nas respostas RFC 7807 das exceções do security | `commons` (`ApiExceptionHandler`) | Chave do **`commons`**: o handler comum inclui a `devMessage` nos problem+json de todas as extensions (a `SecurityApiExceptionExtension` foi removida) | Runtime | Decl./consumo: `ApiExceptionHandler` do `commons` |
| `seedgrid.app.email-alert.window` | Duration | ISO-8601 | `PT15M` | Não | Anti-flood: só a 1ª falha de envio de e-mail em cada janela publica o evento `platform.email-delivery-failed` no notification (com o total acumulado) | `EmailDeliveryAlertService#emailDeliveryFailed` (chamado pelo `DefaultEmailService`) | Requer `NotificationPublisher` (notification-api) | Runtime | Decl./consumo: `…/security/services/EmailDeliveryAlertService#window` |

### 2.13 Rate-limit dos endpoints (`seedgrid.ratelimit.<configKey>.*`)

Os limites são declarados no security com `@SgRateLimit(configKey=…)` (lib **resilience**). O `RateLimitService` da resilience lê, em runtime, `seedgrid.ratelimit.<configKey>.{enabled,permits,window,min-spacing,burst-capacity,algorithm}` (`java/seedgrid-quarkus-ext-resilience/runtime/src/main/java/br/com/seedgrid/resilience/core/runtime/ratelimiter/services/RateLimitService.java`). Sem a propriedade vale o valor da anotação; `enabled` default `true`. Detalhes de `algorithm`/`burst-capacity`/`min-spacing`: [[SeedGrid/Extensions/resilience/Configuracao|Configuração do resilience]]. Identidade padrão: IP do cliente.

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.ratelimit.login.{enabled,permits,window}` | boolean / long / Duration | — | `true` / `100` / `PT1M` (anotação) | Não | Limite por IP | `POST /public/auth/login` | — | Runtime | `…/security/controllers/AuthController` (anotação); leitura: resilience `RateLimitService` |
| `seedgrid.ratelimit.auth-refresh.{enabled,permits,window}` | idem | — | `true` / `30` / `PT1M` | Não | idem | `POST /public/auth/refresh` | — | Runtime | `AuthController` |
| `seedgrid.ratelimit.auth-confirm-email.{enabled,permits,window}` | idem | — | `true` / `10` / `PT1M` | Não | idem | `GET /public/auth/confirm-email` | — | Runtime | `AuthController` |
| `seedgrid.ratelimit.forgot-password.{enabled,permits,window}` | idem | — | `true` / `5` / `PT1H` | Não | idem | `POST /public/auth/forgot-password` | — | Runtime | `AuthController` |
| `seedgrid.ratelimit.auth-reset-password.{enabled,permits,window}` | idem | — | `true` / `10` / `PT1M` | Não | idem | `GET /public/auth/reset-password` | — | Runtime | `AuthController` |
| `seedgrid.ratelimit.public-companies.{enabled,permits,window}` | idem | — | `true` / `30` / `PT1M` | Não | idem | `GET /public/companies` | — | Runtime | `controllers/CompanyPublicController` |
| `seedgrid.ratelimit.self-enter-request.{enabled,permits,window}` | idem | — | `true` / `5` / `PT1H` | Não | idem | `POST /public/self-enter/requests` | — | Runtime | `controllers/SelfEnterPublicController` |
| `seedgrid.ratelimit.self-enter-confirm.{enabled,permits,window}` | idem | — | `true` / `10` / `PT1M` | Não | idem | `POST /public/self-enter/requests/{id}/confirm-email` | — | Runtime | `SelfEnterPublicController` |
| `seedgrid.ratelimit.self-enter-resend.{enabled,permits,window}` | idem | — | `true` / `3` / `PT1H` | Não | idem | `POST /public/self-enter/requests/{id}/resend-email` | — | Runtime | `SelfEnterPublicController` |
| `seedgrid.ratelimit.self-enter-invitation.{enabled,permits,window}` | idem | — | `true` / `10` / `PT1M` | Não | idem | `GET /public/self-enter/invitations/{token}` | — | Runtime | `SelfEnterPublicController` |
| `seedgrid.ratelimit.self-enter-complete.{enabled,permits,window}` | idem | — | `true` / `5` / `PT1M` | Não | idem | `POST /public/self-enter/invitations/{token}/complete` | — | Runtime | `SelfEnterPublicController` |
| `seedgrid.ratelimit.2fa-verify.{enabled,permits,window}` | idem | — | `true` / `5` / `PT15M` | Não | idem | `POST /public/2f/verify` | Complementa `2f.verify.max-attempts` | Runtime | `controllers/TwoFactorPublicController` |
| `seedgrid.ratelimit.2fa-resend.{enabled,permits,window}` | idem | — | `true` / `3` / `PT1H` | Não | idem | `POST /public/2f/resend` | — | Runtime | `TwoFactorPublicController` |
| `seedgrid.ratelimit.user-activation-resend.{enabled,permits,window}` | idem | — | `true` / `3` / `PT1H` | Não | idem | `POST /me/security/users/{id}/resend-activation` | — | Runtime | `controllers/AccountUserController` |

Para cada `configKey` acima também existem `.min-spacing` (Duration), `.burst-capacity` (long) e `.algorithm` (String) — não usados pelas anotações do security (valores da anotação: algoritmo `FIXED_WINDOW`, burst 0, spacing 0).

Env var: chaves que começam com dígito após o ponto (`2fa-verify`) viram `SEEDGRID_RATELIMIT_2FA_VERIFY_ENABLED` pela regra padrão (*Inferência*, sem ambiguidade aparente).

---

### 2.14 Propriedades do ciclo 2026.10.22 (NÃO PUBLICADAS)

> **Não publicado.** Estas chaves entram com `seedgrid-security` 2026.10.22 (e o módulo `seedgrid-security-social`); não existem nas versões do Maven Central. Explicação e receitas: [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]], [[SeedGrid/Extensions/security/Somente-leitura-e-QUERY|Somente leitura e QUERY]], [[SeedGrid/Extensions/security/Termos-de-uso|Termos de uso]], [[SeedGrid/Extensions/security/Login-social-Google|Login com Google]].

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `seedgrid.security.isolation` | enum | `shared-database`, `dedicated-database` | `shared-database` | Não | Modelo de dados do host; só define os padrões das três chaves abaixo. `login-tenancy` declara `shared-database`, `subdomain-tenancy` declara `dedicated-database`. | Host | Define `account.enabled`, `platform-scope.exempt` e `admin-guard.scope` | Runtime | Insumo Fase 1 (não publicado) |
| `seedgrid.security.account.enabled` | boolean | `true`, `false` | `true` em shared, `false` em dedicated | Não | Liga ou desliga `/me/security/*` (404 quando desligado). | Host | Padrão vem de `isolation` | Runtime | Insumo Fase 1 (não publicado) |
| `seedgrid.security.platform-scope.exempt` | lista | `recurso` ou `recurso:METODO` | vazio em shared; `companies, users, roles, permissions:GET` em dedicated | Não | Recursos isentos do `@SgPlatformScope`. | Host | Padrão vem de `isolation` | Runtime | Insumo Fase 1 (não publicado) |
| `seedgrid.security.admin-guard.scope` | enum | `company`, `database` | `company` em shared, `database` em dedicated | Não | Escopo da invariante "mínimo 1 ADMIN ativo": por empresa, ou no banco todo (mais cada empresa com 1 usuário ativo). | `LastAdminGuard` | Padrão vem de `isolation` | Runtime | Insumo Fase 3 (não publicado) |
| `seedgrid.security.admin-guard.lock-timeout` | Duration | ISO-8601 | `PT5S` | Não | Tempo máximo para obter o lock da invariante "mínimo 1 ADMIN ativo" (vale entre servidores). Estourado, ou deadlock: 503 `ADMIN_GUARD_LOCK_TIMEOUT` com `Retry-After`, sem gravar nada. | `LastAdminGuard` | `admin-guard.scope` | Runtime | `SecurityAdminGuardConfig` |
| `seedgrid.security.terms.required` | boolean | `true`, `false` | `false` | Não | Exige aceite dos termos no cadastro e no login. | `TermsService` | Usa `terms.version` | Runtime | `SecurityTermsConfig` |
| `seedgrid.security.terms.version` | String | texto | `1` | Não | Versão vigente dos termos; subir a versão exige novo aceite. | `TermsService` | — | Runtime | `SecurityTermsConfig` |
| `seedgrid.security.terms.documents.<nome>` | Map&lt;String,String&gt; | URL pública | vazio | Não | Documentos por nome (ex.: `terms`, `privacy`) com a URL pública de cada um. | `GET /public/terms`, `/public/signup/config` | — | Runtime | `SecurityTermsConfig` |
| `seedgrid.security.company-access.cache-ttl` | Duration | ISO-8601 | `PT60S` | Não | TTL do estado da empresa no `seedgrid-cache` (compartilhado entre os nós). A invalidação a cada mudança é explícita; cache fora do ar lê o banco. | `CompanyAccessService` | — | Runtime | Insumo Fase 5 (não publicado) |
| `seedgrid.security.company-access.read-only.allowed-paths` | lista | caminhos; `*` um segmento, `**` qualquer profundidade | `/public/auth/**,/me/select-company,/me/profile,/me/password,/me/terms/accept,/me/identities,/2f,/users/change-password` | Não | Caminhos onde a escrita passa com a empresa em `READ_ONLY`. **Sobrescrever SUBSTITUI o padrão.** | Filtro de acesso | Prefira `contributions.<nome>` | Runtime | `microprofile-config.properties` do security |
| `seedgrid.security.company-access.read-only.contributions.<nome>` | lista | caminhos | vazio | Não | Contribuições **aditivas** (uma chave por contribuinte). O billing traz `...contributions.billing=/me/billing,/me/plans,/me/subscription,/me/usage`. | Filtro de acesso | Soma-se a `allowed-paths` | Runtime | Insumo Fase 5 (não publicado) |
| `seedgrid.security.social.providers` | lista | `google`, `facebook` | vazio (módulo inerte) | Não | Provedores de login social ligados. Id desconhecido ou provedor sem credencial: o boot **falha**. Não há chave "enabled" por provedor. | `seedgrid-security-social` | Exige as chaves `social.<provedor>.*` | Boot | README do módulo |
| `seedgrid.security.social.<provedor>.client-id` | String | id do cliente OAuth | `unset` | Sim, para o provedor listado | Credencial do cliente no provedor. Env: `SEEDGRID_SECURITY_SOCIAL_<PROVEDOR>_CLIENT_ID`. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.client-secret` 🔒 | String | segredo do cliente | placeholder desligado | Sim, para o provedor listado | Segredo do cliente no provedor; só por variável de ambiente. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.state-secret` 🔒 | String | 32 caracteres ou mais | placeholder desligado | Sim, para o provedor listado | Cifra o estado do fluxo; **igual em todas as instâncias**. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.encryption-secret` 🔒 | String | 32 caracteres ou mais | placeholder desligado | Sim, para o provedor listado | Cifra o cookie de sessão do fluxo OIDC; **igual em todas as instâncias**. | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.<provedor>.redirect-uri` | String | caminho ou URL absoluta terminada em `/public/auth/social/<provedor>/callback` | `/public/auth/social/<provedor>/callback` | Sim, em produção | A `redirect_uri` cadastrada no provedor (o Google exige URL exata). | `seedgrid-security-social` | — | Boot | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.allowed-return-hosts` | lista | `host`, `host:porta`, `*.dominio` | host de `frontend.base-url` | Não | Hosts do front permitidos em `returnTo` (anti *open redirect*). | `seedgrid-security-social` | `seedgrid.security.frontend.base-url` | Runtime | README do módulo |
| `seedgrid.security.social.error-url` | String | URL do front | `frontend.base-url` + `frontend.login-path` | Não | Para onde voltar em falha do provedor (ex.: usuário cancelou). | `seedgrid-security-social` | — | Runtime | `microprofile-config.properties` do módulo |
| `seedgrid.security.social.ticket-ttl` | Duration | ISO-8601 | `PT60S` | Não | Validade do ticket de uso único que leva o resultado ao front. | `seedgrid-security-social` | — | Runtime | `microprofile-config.properties` do módulo |
| `seedgrid.security.social-login.*` | — | `pending-ttl`, `code-ttl`, `max-code-attempts` | não confirmado | Não | Fluxo de confirmação do e-mail por código de 6 dígitos (provedor sem e-mail verificado). | `SocialLoginService` | — | Runtime | Insumo Fase 2b (valores padrão não confirmados) |

## 3. Propriedades de frameworks/bibliotecas configuradas pela extension

Definidas no `mp-config` (ordinal 100 — o host pode sobrescrever):

| Propriedade | Valor no mp-config | Para quê |
|---|---|---|
| `quarkus.hibernate-orm.mapping.format.global` | `ignore` | JSONB (`additionalAttributes`) usa o mapper JSON do Hibernate diretamente |
| `quarkus.http.auth.proactive` | `true` | Autenticação proativa (o comentário fala em "apenas rota protegida", mas o valor é `true` — ver §9) |
| `quarkus.smallrye-openapi.security-scheme` | `jwt` | Declara o esquema bearer |
| `quarkus.smallrye-openapi.security-scheme-name` | `bearerAuth` | Nome do esquema |
| `quarkus.smallrye-openapi.auto-add-security` | `false` | Requirements aplicados seletivamente pelo `JwtSecurityOpenApiFilter` (só não-públicos) |
| `quarkus.swagger-ui.path` | `/swagger-ui` | — |
| `quarkus.swagger-ui.always-include` | `true` | Swagger UI também em produção |
| `quarkus.mailer."security".from` / `.host` / `.port` / `.start-tls` / `.username` 🔒 / `.password` 🔒 / `.auth-methods` | `${seedgrid.security.mailer.<mesmo-campo>}` | Bridge para o mailer nomeado `security` |
| `mp.jwt.verify.publickey.location` | `${seedgrid.security.jwt.public-key-location}` | `SecurityIdentity` via quarkus-smallrye-jwt |
| `mp.jwt.verify.issuer` | `${seedgrid.security.jwt.issuer}` | idem |

Chaves de **outra extension** definidas no mp-config do security:

| Propriedade | Valor | Observação |
|---|---|---|
| `seedgrid.whatsapp.api` | `${SEEDGRID_WHATSAPP_API:evolution}` | Seleciona o provedor WhatsApp (`@LookupIfProperty` na extension whatsapp). O `microprofile-config.properties` do `seedgrid-whatsapp-core` também define essa chave (`${SEEDGRID_WHATSAPP_API:default}`) com o mesmo ordinal 100 — qual vence não é determinístico; **defina explicitamente** no host. As demais chaves do provedor são `seedgrid.whatsapp.*` — ver [[SeedGrid/Extensions/whatsapp/Configuracao\|Configuração do whatsapp]]. |

> **Migrations por código (na `main` do `extensions` em 2026-10-27; vale a partir da próxima versão publicada).** A `security` migra a si mesma, como `cities`, `ai-pricing`, `exchange`, `business-days` e `notification`: classe `SecurityMigrations` (`LOCATION`, `HISTORY_TABLE`, `migrate(DataSource[, schema])`), runner no startup e `FlywayConfigurationCustomizer` que migra **antes** do Flyway do host (o host pode ter FK nas tabelas dela). Ela **não define** `quarkus.flyway.table|locations|migrate-at-start|baseline-*`, e o host não lista `db/migration/security` no `quarkus.flyway.locations`. Histórico próprio: `sg_flyway_schema_history_security`; a `flyway_schema_history` do host não muda. A única propriedade é `seedgrid.migrations.host-managed` (padrão `false`; `true` = o host migra chamando `migrate(...)` e o runner não age). Não existe `seedgrid.security.migrations.enabled`.
>
> **Regra obrigatória para o host (quebra de compatibilidade):** aponte `quarkus.flyway.locations` para a pasta do próprio host (ex.: `classpath:db/migration/app`) e **nunca deixe o padrão `db/migration`**. O padrão varre as subpastas das extensions (`db/migration/security`, `/billing`, `/cities`...) e as migra de novo na `flyway_schema_history` do host; a migração da extension então falha com "tabela já existe" ou "ON CONFLICT sem constraint". Host sem migrations próprias também precisa da propriedade (a pasta pode nem existir). Host com migrations soltas em `db/migration/V1__...` deve movê-las para uma subpasta (ex.: `db/migration/app`).
>
> **Ordem:** o Quarkus não ordena os `FlywayConfigurationCustomizer`, então a ordem entre extensions vem de dependência no código: `BillingMigrations.migrate` e `ApiKeysMigrations.migrate` chamam `SecurityMigrations.migrate` antes (idempotente). No startup, os runners (`XxxMigrationRunner`) seguem o `@Priority` do CDI: security 10, audit 20, backup 30, billing 40, apikeys 50, cities 100. Só security, billing e apikeys têm customizer (migram antes do Flyway do host, que pode ter FK nas tabelas delas); audit e backup migram só pelo runner.

>
> **Baseline do Flyway do host:** depois que a extension migra, o schema não está vazio e o host ainda não tem histórico; o Flyway dele recusaria subir. Por isso o customizer liga `baselineOnMigrate=true` com `baselineVersion=0` no Flyway do **host** (sem sobrescrever se o host já definiu): `SecurityMigrations.allowNonEmptySchema(FluentConfiguration)`.
Recomendadas/exigidas para o host (README e `application.properties` de teste):

| Propriedade | Valor | Motivo |
|---|---|---|
| `quarkus.hibernate-orm.physical-naming-strategy` | `org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy` | Nomes de coluna das entidades |
| `quarkus.datasource.*` | PostgreSQL | Migrations e entidades são PostgreSQL (JSONB) |
| `seedgrid.privacy.encryption.enabled`, `seedgrid.privacy.crypto.key` 🔒, `seedgrid.privacy.search.key` 🔒 | opcional | Cifra PII de `User`/`Company`/`EntryRequest` at-rest (lib privacy — ver [[SeedGrid/Extensions/privacy/Configuracao\|Configuração do privacy]]) |

---

## 4. Propriedades usadas só em testes

`java/seedgrid-quarkus-ext-security/runtime/src/test/resources/application.properties` e `QuarkusTestProfile`s em `runtime/src/test/java/br/com/seedgrid/security/`:

| Propriedade | Onde | Valor/uso |
|---|---|---|
| `quarkus.datasource.db-kind`, `quarkus.datasource.devservices.enabled`, `quarkus.hibernate-orm.database.generation`, `quarkus.hibernate-orm.sql-load-script`, `quarkus.flyway.clean-at-start`, `quarkus.index-dependency.seedgrid-filemanagement.*`, `quarkus.arc.exclude-types`, `quarkus.http.test-port`, `quarkus.http.root-path=/api`, `quarkus.log.*` | `application.properties` (teste) | Infra de teste (Postgres via `PostgreSqlTestResourceLifecycleManager`, que injeta `quarkus.datasource.username/password/jdbc.url` e `seedgrid.audit.jpa.*`) |
| `smallrye.jwt.sign.key.location`, `smallrye.jwt.new-token.issuer`, `smallrye.jwt.new-token.lifespan`, `mp.jwt.verify.*` | idem | Chaves de teste `test-privatekey.pem`/`test-publickey.pem` |
| `quarkus.mailer.mock`, `quarkus.mailer."security".mock` | idem | Mailer mock |
| `seedgrid.audit.persistence.strategy=JPA`, `seedgrid.audit.jpa.db-kind` | idem | Audit |
| `seedgrid.security.refresh-token.reuse-grace-window=PT0S` | idem | Janela desligada; religada em `RefreshTokenGraceWindowProfile` |
| `seedgrid.ratelimit.<todas as 14 chaves>.enabled=false` | idem | Evita flakiness da suite |
| `seedgrid.security.account.assignable-permission-audiences=client` | idem | Convenção do login-tenancy |
| `seedgrid.security.self-enter.*`, `seedgrid.security.2f.*`, `seedgrid.security.bootstrap.enabled`, `seedgrid.security.first-admin-user.*`, `seedgrid.security.default-company.*` | Profiles `SelfEnter*Profile`, `BootstrapDisabledProfile`, `FirstAdminBootstrapProfile` | Variações por cenário |
| `seedgrid.privacy.encryption.enabled`, `seedgrid.privacy.crypto.key`, `seedgrid.privacy.search.key` | `EncryptedFieldsSecurityTest` | Teste de PII cifrada |

O exemplo `platform-examples/examples/seedgrid-security-example` (repo próprio, commit `86cfc37`) usa nomes de env diferentes (`SECURITY_JWT_ISSUER`, `SECURITY_MAILER_FROM`…) via expressões no seu `application.properties` — são escolhas do exemplo, não aliases da extension.

---

## 5. Aliases e defaults efetivos

Não há aliases nem nomes alternativos lidos pelo código. Atenção ao default **efetivo**, que vem do mp-config e difere do `@WithDefault` em:

- `seedgrid.security.2f.enabled`: efetivo `true` (`@WithDefault` `false`).
- `seedgrid.security.self-enter.default-role`: **sem valor padrão**; obrigatória com `self-enter.enabled=true`.
- `seedgrid.security.password.*`: valores permissivos do mp-config (`min-size=1`, demais `false`/`0`); a interface não tem `@WithDefault`.

---

## 6. Configuração mínima (`application.properties` do host)

```properties
# Obrigatória sem default em lugar nenhum
seedgrid.security.encryption.key=<SEGREDO:security-encryption-key-base64-32-bytes>

# Empresa-plataforma (o mp-config aponta para env SEM default)
seedgrid.security.default-company.cnpj=<CNPJ-da-plataforma>
seedgrid.security.default-company.corporate-name=<razao-social>
seedgrid.security.default-company.trade-name=<nome-fantasia>

# Chaves RSA (ou deixe os arquivos keys/private.pem e keys/public.pem no classpath/diretório de trabalho)
seedgrid.security.jwt.private-key-location=<caminho>/private.pem
seedgrid.security.jwt.public-key-location=<caminho>/public.pem

# Valores do mp-config que NÃO servem para produção
seedgrid.security.mailer.from=noreply@<seu-dominio>
seedgrid.security.frontend.base-url=https://<app.seu-dominio>
seedgrid.security.password.min-size=8

# Infra
# Migrations: a security migra sozinha (SecurityMigrations); o host aponta o Flyway dele para a pasta dele
quarkus.flyway.locations=classpath:db/migration/app
quarkus.hibernate-orm.physical-naming-strategy=org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy
```

## 7. Configuração completa comentada

Valores abaixo são **escolhas de exemplo válidas**; os padrões reais estão nas tabelas.

```properties
# ---------- JWT ----------
seedgrid.security.jwt.issuer=https://<seu-dominio>
seedgrid.security.jwt.kid=<id-da-chave>
seedgrid.security.jwt.ttl=PT8H
# Opção A: arquivos PEM (filesystem primeiro, depois classpath)
seedgrid.security.jwt.private-key-location=keys/private.pem
seedgrid.security.jwt.public-key-location=keys/public.pem
# Opção B: base64 (precedência sobre location). Defina também MP_JWT_VERIFY_PUBLICKEY.
#seedgrid.security.jwt.private-key-base64=<SEGREDO:jwt-private-key-pkcs8-base64>
#seedgrid.security.jwt.public-key-base64=<jwt-public-key-x509-base64>

# ---------- Refresh token ----------
seedgrid.security.refresh-token.ttl=P30D
seedgrid.security.refresh-token.reuse-grace-window=PT30S

# ---------- Criptografia de segredos internos (TOTP, senha de bootstrap) ----------
seedgrid.security.encryption.key=<SEGREDO:security-encryption-key-base64-32-bytes>

# ---------- Política de senha ----------
seedgrid.security.password.min-size=8
seedgrid.security.password.max-history=5
seedgrid.security.password.upper-case-required=true
seedgrid.security.password.lower-case-required=true
seedgrid.security.password.special-character-required=true
seedgrid.security.password.prohibits-repeated-characters-in-sequence=false
seedgrid.security.password.expiration-days=0

# ---------- 2FA ----------
seedgrid.security.2f.enabled=true
seedgrid.security.2f.allowed-methods=EMAIL,TOTP,WHATSAPP
seedgrid.security.2f.totp.issuer=<NomeDoApp>
seedgrid.security.2f.totp.digits=6
seedgrid.security.2f.totp.period=30
seedgrid.security.2f.totp.window=1
seedgrid.security.2f.otp-qrcode.branding.enabled=false
#seedgrid.security.2f.otp-qrcode.logo=classpath:/images/logo.png
seedgrid.security.2f.otp-qrcode.size=256
seedgrid.security.2f.verify.max-attempts=5
seedgrid.security.2f.session.ttl=PT5M
seedgrid.security.2f.email.code-ttl=PT5M
seedgrid.security.2f.backup-codes.count=10
seedgrid.security.2f.backup-codes.length=6
seedgrid.security.2f.whatsapp.channel-id=<id-do-canal-whatsapp>
seedgrid.security.2f.whatsapp.code-ttl=PT5M

# ---------- Self-enter ----------
seedgrid.security.self-enter.enabled=true
seedgrid.security.self-enter.public-enabled=true
seedgrid.security.self-enter.invite-enabled=true
seedgrid.security.self-enter.invite-needs-approval=true
seedgrid.security.self-enter.request-ttl=PT48H
seedgrid.security.self-enter.invite-ttl=PT168H
seedgrid.security.self-enter.email-token-ttl=PT30M
seedgrid.security.self-enter.default-role=<NOME-DA-ROLE-GLOBAL>   # obrigatória se self-enter.enabled=true
seedgrid.security.self-enter.cleanup.enabled=true
seedgrid.security.self-enter.cleanup.cron=0 */10 * * * ?
seedgrid.security.self-enter.cleanup.purge-after=PT168H
seedgrid.security.self-enter.email.confirm-subject=Confirme seu e-mail
seedgrid.security.self-enter.email.invite-subject=Voce recebeu um convite para cadastro

# ---------- E-mail (mailer nomeado "security") ----------
seedgrid.security.mailer.from=noreply@<seu-dominio>
seedgrid.security.mailer.host=<smtp-host>
seedgrid.security.mailer.port=587
seedgrid.security.mailer.start-tls=REQUIRED
seedgrid.security.mailer.username=<usuario-smtp>
seedgrid.security.mailer.password=<SEGREDO:smtp-password>
seedgrid.security.mailer.auth-methods=PLAIN LOGIN
seedgrid.app.email-alert.window=PT15M

# ---------- Frontend (links dos e-mails) ----------
seedgrid.security.frontend.base-url=https://<app.seu-dominio>
seedgrid.security.frontend.login-path=/login
seedgrid.security.frontend.password-reset-path=/auth/forgot-password/confirm
seedgrid.security.frontend.email-confirmation-path=/auth/confirm-email
seedgrid.security.frontend.welcome-path=/auth/welcome
seedgrid.security.frontend.self-enter-path=/auth/self-enter/invitation

# ---------- Bootstrap ----------
seedgrid.security.bootstrap.enabled=true
seedgrid.security.default-company.cnpj=<CNPJ>
seedgrid.security.default-company.corporate-name=<razao-social>
seedgrid.security.default-company.trade-name=<nome-fantasia>
#seedgrid.security.default-company.addr-street=... (addr-number, addr-complement, addr-postal-code, addr-city, addr-state, addr-district, addr-phone)
#seedgrid.security.default-company.rep-first-name=... (rep-last-name, rep-cpf, rep-birth-date, rep-phone, rep-whatsapp, rep-email)
seedgrid.security.first-admin-user.email=<admin@seu-dominio>
seedgrid.security.first-admin-user.name=<Nome do Admin>
#seedgrid.security.first-admin-user.whatsapp=<+55...>
#seedgrid.security.first-admin-user.initial-password=<SEGREDO:first-admin-initial-password>

# ---------- Avatar ----------
seedgrid.security.avatar.storage=filesystem
seedgrid.security.avatar.user-prefix=avatars/users
seedgrid.security.avatar.default-prefix=avatars/defaults
seedgrid.security.avatar.public-read=false
seedgrid.security.avatar.filesystem.base-path=/var/seedgrid/files
# s3: bucket, region, access-key, secret-key, endpoint | minio: idem | azure-blob: connection-string, container,
# account-name, account-key | google-drive: root-folder-id, credentials-file, credentials-json |
# onedrive: client-id, client-secret, tenant-id, root-folder-path | gcs: bucket, project-id, credentials-file, credentials-json

# ---------- Usuário / RBAC / conta ----------
seedgrid.security.user.additional-attributes.max-size-bytes=16384
seedgrid.security.user.additional-attributes.max-depth=5
seedgrid.security.user.additional-attributes.max-keys=100
seedgrid.security.rbac.cache-ttl=PT5M
#seedgrid.security.account.assignable-permission-audiences=client

# ---------- Erros ----------
seedgrid.show-dev-message=false

# ---------- Rate-limit (lib resilience) ----------
#seedgrid.ratelimit.login.permits=100
#seedgrid.ratelimit.login.window=PT1M
#seedgrid.ratelimit.login.enabled=true
```

## 8. Receitas

**Produção com banco único (padrão).** Configuração mínima (§6) + SMTP real + política de senha forte + `seedgrid.security.first-admin-user.email` para nascer o 1º admin. Se ligar self-enter, `seedgrid.security.self-enter.default-role` é obrigatória (a aplicação não sobe sem ela): informe o nome exato de uma role **global** existente. Convite sem roles auto-aprovado (`invite-needs-approval=false`) cria o usuário com essa role.

**Host database-per-tenant (subdomain-tenancy).** `seedgrid.security.bootstrap.enabled=false` (empresa e admin nascem no provisionamento do tenant). Ainda é preciso definir `default-company.cnpj/corporate-name/trade-name` (mapping obrigatório) — o teste `BootstrapDisabledTest` faz isso.

**Desligar 2FA.** `seedgrid.security.2f.enabled=false` (o mp-config liga por padrão).

**2FA por WhatsApp.** `seedgrid.security.2f.allowed-methods=EMAIL,TOTP,WHATSAPP`, `seedgrid.security.2f.whatsapp.channel-id=<canal>` e configurar a extension whatsapp (`seedgrid.whatsapp.api=evolution|cloud` + chaves `seedgrid.whatsapp.*`).

**Só convites, sem signup público, sem aprovação manual.** `self-enter.enabled=true`, `self-enter.public-enabled=false`, `self-enter.invite-enabled=true`, `self-enter.invite-needs-approval=false` (cenário coberto por `SelfEnterInviteOnlyProfile` + `SelfEnterInviteAutoApproveProfile`).

**Chaves RSA por variável de ambiente (containers).** `SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64`, `SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64` **e** `MP_JWT_VERIFY_PUBLICKEY` (o bridge só cobre `location`).

**Avatares em MinIO.** `seedgrid.security.avatar.storage=minio` + `minio.bucket`, `minio.endpoint`, `minio.access-key`, `minio.secret-key` (região default `us-east-1`).

**Afrouxar/desligar um rate-limit.** `seedgrid.ratelimit.auth-refresh.permits=60` ou `seedgrid.ratelimit.login.enabled=false`.

## 9. Dúvidas e lacunas

- O e-mail de aprovação do self-enter **não é enviado**: `SelfEnterService#sendApprovalEmail` só registra log. Por isso `TemplateSecurityProvider#entryRequestApproved` e o template `entry-request-approved.html` não têm efeito hoje.
- Política de senha com defaults permissivos no mp-config (min-size 1) — sobrescreva no host.
- Validação de obrigatoriedade das chaves de avatar por backend fica na lib filemanagement — não verificada aqui.
