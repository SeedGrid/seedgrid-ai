---
tags: [seedgrid, extension, security, enum]
fonte: java/seedgrid-quarkus-ext-security
branch: main
commit: 98572be20a
analisado-em: 2026-11-11
---

# security — Enums (Quarkus)

Voltar para [[SeedGrid/Extensions/security/Visao-geral|Visão geral do security]] · [[SeedGrid/Extensions/security/Configuracao|Configuração]] · [[SeedGrid/Extensions/security/Rust|Porte Rust]]

Caminho-base: `java/seedgrid-quarkus-ext-security/runtime/src/main/java/br/com/seedgrid/security/`. Os módulos `deployment` e testes não declaram enums de contrato.

## Índice

| Enum | Pacote/arquivo | Usado em | Público? |
|---|---|---|---|
| [[SeedGrid/Extensions/security/Enums#TwoFactorMethodType\|TwoFactorMethodType]] | `twofactors/TwoFactorMethodType.java` | Corpo de `POST /2f/enable` e `POST /2f/setup/confirm`, resposta de enable, estratégias 2FA, config `2f.allowed-methods` (por código textual) | Sim |
| [[SeedGrid/Extensions/security/Enums#EntryRequestStatus\|EntryRequestStatus]] | `entities/EntryRequestStatus.java` | Coluna `sg_entry_requests.status`, self-enter, job de limpeza | Sim (persistido) |
| [[SeedGrid/Extensions/security/Enums#EntryRequestOrigin\|EntryRequestOrigin]] | `entities/EntryRequestOrigin.java` | Coluna `sg_entry_requests.origin`, self-enter | Sim (persistido) |
| [[SeedGrid/Extensions/security/Enums#UserCreateOptions.Delivery\|UserCreateOptions.Delivery]] | `services/UserCreateOptions.java` (enum aninhado) | API Java para quem cria usuário por fluxo próprio (`UserService#createUser`) | Sim (API de bean) |
| [[SeedGrid/Extensions/security/Enums#AdminGuardScope\|AdminGuardScope]] | `configs/AdminGuardScope.java` | `admin-guard.scope` (config), `SecurityIsolationPolicy`, `LastAdminGuard` | Sim (valor de config) |
| [[SeedGrid/Extensions/security/Enums#IsolationMode\|IsolationMode]] | `configs/IsolationMode.java` | `seedgrid.security.isolation` (config), `SecurityIsolationPolicy`, `RoleService` | Sim (valor de config) |
| [[SeedGrid/Extensions/security/Enums#CompanyAccessMode\|CompanyAccessMode]] | `entities/CompanyAccessMode.java` | Coluna `sg_companies.access_mode`, `CompanyAccessService`, `CompanyAccessFilter`, `AuthService` | Sim (persistido) |
| [[SeedGrid/Extensions/security/Enums#PersonType\|PersonType]] | `entities/PersonType.java` | Coluna `sg_companies.person_type`, `CompanyDTOReq`/`CompanyDTOPatch`, `DocumentValidator` | Sim (persistido) |

## TwoFactorMethodType

Arquivo: `…/security/twofactors/TwoFactorMethodType.java` — FQN `br.com.seedgrid.security.twofactors.TwoFactorMethodType`. Javadoc: helper de tipo para os métodos 2FA padrão; o código do método é guardado como **String** no banco para permitir implementações custom.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `EMAIL` | Código de uso único por e-mail | `EmailTwoFactorStrategy#getMethodCode`; `TwoFactorController` exige e-mail confirmado para ativar | Confirmado |
| `WHATSAPP` | Código de uso único por WhatsApp | `WhatsappTwoFactorStrategy#getMethodCode`; ativação exige WhatsApp do usuário e `2f.whatsapp.channel-id`; `MeProfileController` compara com o método primário | Confirmado |
| `TOTP` | Código de app autenticador | `TotpTwoFactorStrategy#getMethodCode`; `TwoFactorController` (setup/confirm e disable); `TwoFactorService` grava como método primário ao confirmar | Confirmado |
| `BACKUP_CODE` | Código de backup | Existe no enum, mas **nenhum código o referencia** (não há estratégia com esse código; o fallback por backup code em `TwoFactorService` usa `BackupCodeService` direto). Enviá-lo em `method` passa na desserialização, mas não há estratégia registrada para ele | Confirmado (busca por referências) |

- **Campos/métodos:** `getCode()` (igual ao nome da constante) e `static fromCode(String)` — comparação `equalsIgnoreCase`, retorna `null` se não achar. `fromCode` não é chamado em lugar nenhum do módulo.
- **JSON:** sem `@JsonValue`/`@JsonCreator`; o Jackson usa o **nome exato** (maiúsculas, case-sensitive) em `Enable2FADTO.method`, `SetupConfirmDTO.method` e `Enable2FAResponseDTO.method`. Valor desconhecido → erro de desserialização (400).
- **Persistência:** o enum **não** é persistido; `users.two_factor_primary_method` é `VARCHAR(32)` com o código textual (`User#enableTwoFactor(String)`). Não há CHECK constraint (`V200__security_ddl.sql`), então estratégias custom (ex.: `SMS`) podem ser gravadas.
- **Config:** `seedgrid.security.2f.allowed-methods` é `List<String>` (não usa o enum); os valores são normalizados com `trim().toUpperCase()` e cruzados com as estratégias registradas. Ver [[SeedGrid/Extensions/security/Configuracao|Configuração §2.5]].
- **Observação:** como o DTO usa o enum, um método custom (`SMS`) não pode ser ativado por `POST /2f/enable` (o corpo é rejeitado) mesmo estando em `allowed-methods`. *Inferência* a partir do tipo do campo `method`.

## EntryRequestStatus

Arquivo: `…/security/entities/EntryRequestStatus.java` — FQN `br.com.seedgrid.security.entities.EntryRequestStatus`. Sem Javadoc; significados deduzidos do tratamento.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `PENDING_EMAIL` | Aguardando confirmação do e-mail (OTP no signup público; aceite do convite) | Estado inicial de `requestAccess` e do convite (`SelfEnterService`); `confirmEmail`/`resendEmail` exigem este estado; o job expira registros neste estado | Confirmado |
| `PENDING_APPROVAL` | Aguardando aprovação administrativa | `EntryRequest#markEmailConfirmed` e `#markInvitationAccepted` levam a este estado; `approve`/`reject` só aceitam este estado; listagem "to-approve" | Confirmado |
| `APPROVED` | Aprovada; usuário criado | `EntryRequest#approve`; elegível a purga | Confirmado |
| `REJECTED` | Rejeitada por um administrador | `EntryRequest#reject`; elegível a purga | Confirmado |
| `EXPIRED` | Expirada | `EntryRequest#expire` (ao aprovar/confirmar uma solicitação vencida) e `EntryRequestRepository#expireOldRequests` (PENDING_EMAIL/PENDING_APPROVAL com `expiresAt` vencido); elegível a purga | Confirmado |

- **Persistência:** `@Enumerated(EnumType.STRING)` em `sg_entry_requests.status` (`VARCHAR(30)`). **CHECK** `chk_entry_request_status` (`V200__security_ddl.sql`) aceita exatamente `PENDING_EMAIL, PENDING_APPROVAL, APPROVED, REJECTED, EXPIRED` — igual às constantes.
- **JSON:** `EntryRequestDTORes.status` é do tipo `EntryRequestStatus`, serializado pelo nome da constante (sem `@JsonValue`).
- **Purga:** `EntryRequestCleanupJob` apaga `APPROVED/REJECTED/EXPIRED` mais antigos que `self-enter.cleanup.purge-after` ([[SeedGrid/Extensions/security/Configuracao|Configuração]]).

```mermaid
stateDiagram-v2
  [*] --> PENDING_EMAIL: requestAccess / convite
  PENDING_EMAIL --> PENDING_APPROVAL: confirmEmail / aceite do convite
  PENDING_APPROVAL --> APPROVED: approve
  PENDING_APPROVAL --> REJECTED: reject
  PENDING_EMAIL --> EXPIRED: expira
  PENDING_APPROVAL --> EXPIRED: expira
```

Convite com `invite-needs-approval=false` chama `approve` logo após o aceite (vai direto a `APPROVED`).

## EntryRequestOrigin

Arquivo: `…/security/entities/EntryRequestOrigin.java` — FQN `br.com.seedgrid.security.entities.EntryRequestOrigin`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `PUBLIC` | Pedido criado pelo signup público | `SelfEnterService#requestAccess`; confirmação/reenvio de e-mail exigem esta origem; também é o default em `@PrePersist` quando nulo e o `DEFAULT 'PUBLIC'` da coluna | Confirmado |
| `INVITE` | Pedido criado por convite administrativo | `SelfEnterService` (convite); aceite/complete/reenvio de convite exigem esta origem; repositório consulta convites pendentes | Confirmado |

- **Persistência:** `@Enumerated(EnumType.STRING)`, coluna `origin VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'` (`V200__security_ddl.sql`). **Não há CHECK constraint** para `origin` (diferente de `status`).
- Relações: `public-enabled` rege `PUBLIC`; `invite-enabled` rege `INVITE` — [[SeedGrid/Extensions/security/Configuracao|Configuração §2.6]].

## UserCreateOptions.Delivery

Arquivo: `…/security/services/UserCreateOptions.java` — FQN `br.com.seedgrid.security.services.UserCreateOptions.Delivery` (enum aninhado no record `UserCreateOptions`). Define como as credenciais iniciais chegam ao usuário criado por `UserService#createUser(dto, options)`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `SECURITY_WELCOME_EMAIL` | E-mail de boas-vindas do security | `UserService#deliverInitialCredentials` chama `EmailServiceInterface#sendWelcomeEmail`; é o default (`UserCreateOptions.defaults()` e quando `delivery` é nulo) | Confirmado |
| `NONE` | Nenhum envio | Sem ação; `createUser` lança `BadRequestException("Senha obrigatoria…")` se a senha teria de ser gerada | Confirmado |
| `CALLBACK` | Envio feito pelo host via `ActivationMailer` | Exige `activationMailer` não nulo (senão `IllegalArgumentException`); falha do envio só é logada com `mailerBestEffort=true` | Confirmado |

- Não é persistido nem serializado em JSON; é parâmetro Java. Construtores de conveniência no record criam as variantes `NONE` e `CALLBACK`.

## AdminGuardScope

Arquivo: `…/security/configs/AdminGuardScope.java` — FQN `br.com.seedgrid.security.configs.AdminGuardScope`. Javadoc: escopo da invariante "mínimo 1 ADMIN ativo".

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `COMPANY` | Por empresa (banco compartilhado) | Padrão quando `isolation=shared-database` (`SecurityIsolationPolicy`); `LastAdminGuard` aplica a invariante dentro de cada empresa | Confirmado |
| `DATABASE` | Por banco (banco dedicado) | Padrão quando `isolation=dedicated-database`; `LastAdminGuard` compara `scope() == DATABASE` para contar ADMIN no banco todo | Confirmado |

- **Config:** `seedgrid.security.admin-guard.scope` (`Optional<AdminGuardScope>` em `SecurityAdminGuardConfig`); valores textuais `company` / `database` ([[SeedGrid/Extensions/security/Configuracao|Configuração §2.14]]). Sem valor, vale o padrão do modo de isolamento.
- Não é persistido nem serializado em JSON.

## IsolationMode

Arquivo: `…/security/configs/IsolationMode.java` — FQN `br.com.seedgrid.security.configs.IsolationMode`. Javadoc: modelo de dados do host, um banco compartilhado entre empresas ou um banco dedicado por tenant.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `SHARED_DATABASE` | Um banco compartilhado entre empresas | Padrão (`@ConfigProperty(name = "seedgrid.security.isolation", defaultValue = "shared-database")` em `SecurityIsolationPolicy`); `RoleService` impede perfil com o nome reservado de ADMIN neste modo | Confirmado |
| `DEDICATED_DATABASE` | Um banco dedicado por tenant | `SecurityIsolationPolicy` passa a `dedicated`: `account.enabled` e `platform-scope.exempt` e `admin-guard.scope` ganham os padrões do modo dedicado (`admin-guard.scope=DATABASE`) | Confirmado |

- **Config:** `seedgrid.security.isolation` com `shared-database` ou `dedicated-database`. Não é persistido.

## CompanyAccessMode

Arquivo: `…/security/entities/CompanyAccessMode.java` — FQN `br.com.seedgrid.security.entities.CompanyAccessMode`. O security aplica o estado num filtro central; quem decide quando ele muda é o billing ou o host, por `CompanyAccessService#setMode`.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `ACTIVE` | Normal: tudo permitido | Padrão do campo `Company.accessMode`; `CompanyAccessFilter` deixa passar | Confirmado |
| `READ_ONLY` | Login normal; escrita bloqueada | `CompanyAccessFilter`: requisições que alteram dados recebem 403 `COMPANY_READ_ONLY`, salvo caminhos liberados (`company-access.read-only.*`) e `@SgReadOnlySafe` | Confirmado |
| `DISABLED` | Sem login; sessões existentes caem | `AuthService` recusa login e seleção de empresa (403 `COMPANY_DISABLED`); o filtro responde o mesmo como rede de segurança | Confirmado |

- **Método:** `countsForAdminInvariant()` retorna `this != DISABLED` (ACTIVE e READ_ONLY contam para a invariante do ADMIN; DISABLED não).
- **Persistência:** `@Enumerated(EnumType.STRING)` em `sg_companies.access_mode` (`VARCHAR(16)`), `CHECK ck_company_access_mode` (`V200__security_ddl.sql`) aceita exatamente `ACTIVE, READ_ONLY, DISABLED`. JSON: nome da constante (`CompanyAccessModeDTOReq`, `AuthService`).

## PersonType

Arquivo: `…/security/entities/PersonType.java` — FQN `br.com.seedgrid.security.entities.PersonType`. Javadoc: natureza do titular da empresa.

| Valor | Significado | Efeito / onde é tratado | Observações |
|---|---|---|---|
| `PJ` | Pessoa jurídica (documento = CNPJ, obrigatório) | Padrão (`Company.personType`, `CompanyService` quando o DTO não informa); `DocumentValidator.isValidFor`; empresa-plataforma só é PJ (`AuthService`, `PlatformScopeFilter`) | Confirmado |
| `PF` | Pessoa física (documento = CPF, opcional) | `DocumentValidator.isValidFor(PF, …)` valida CPF | Confirmado |

- **Persistência:** `@Enumerated(EnumType.STRING)` em `sg_companies.person_type` (`VARCHAR(2) NOT NULL DEFAULT 'PJ'`), `CHECK ck_company_person_type` aceita `PJ, PF`. JSON: nome da constante em `CompanyDTOReq`/`CompanyDTOPatch`.

## Internos

Nenhum enum interno encontrado no `runtime` além dos listados.
