---
description: "Roteiro para atualizar um host SeedGrid existente para as versões 2026.10.22, em perguntas e respostas: propriedade seedgrid.security.isolation (shared-database x dedicated-database) e o que ela muda, o rename dos pacotes spi para spis, cnpj para cpf_cnpj, roleIds para rolePublicIds, 422 de último root para 409 LAST_ADMIN_PROTECTED, BaseEntity.createdAt como Instant, permissões de integração e a ordem das migrations."
tags: [seedgrid, extension, security, isolation, spis, cpf-cnpj, migracao, breaking, host, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Atualizar um host existente: isolation, `spis`, `cpf_cnpj` e demais quebras

> **Status: NÃO PUBLICADO.** Todas as extensions e libs foram alinhadas em **2026.10.22** (`notification` em 2026.10.15, sem mudança de código) e ainda não estão no Maven Central ([[SeedGrid/Versoes|Versões]]); a última versão publicada de cada uma segue valendo. Vem dos insumos das Fases R, 1, 1b, 2, 3, 4 e 5 e do addendum do E2E. Os itens marcados **[não verificado]** não passaram por teste. Faça a atualização primeiro numa cópia do banco.

## Meu import de SPI parou de compilar. O que mudou?

Todo pacote `...spi` virou **`...spis`** e `...spi.impl` virou `...spis.impl`. É corte seco: **não há alias, `@Deprecated` nem o pacote antigo.** Muda só o nome do pacote; nomes de classe, assinaturas e comportamento são os mesmos. Propriedades `seedgrid.*`, endpoints, tabelas e migrations não mudam.

Exemplo: `br.com.seedgrid.security.spi.UserQuotaValidator` → `br.com.seedgrid.security.spis.UserQuotaValidator`.

Troque `.spi.` por `.spis.` e `.spi.impl.` por `.spis.impl.` em todo lugar que cita a classe por nome completo: `import`, `META-INF/services`, `@Alternative`/`@IfBuildProperty` por classe, `quarkus.arc.selected-alternatives`, `application.properties` e `beans.xml`.

```bash
# conferir o que ainda cita o pacote antigo (rode antes e depois da troca)
grep -rnE "br\.com\.seedgrid\.[a-z.]*\.spi(\.|;|$)" src/ --include=*.java --include=*.properties --include=*.xml
```

| Repositório | Pacotes `spis` |
|---|---|
| lib-commons | `commons.spis`, `commons.persistence.spis` (+ `.impl`), `commons.web.exceptions.spis` (+ `.impl`) |
| lib-cache | `cache.core.commons.spis` (+ `.impl`), `cache.redis.commons.spis`, `cache.valkey.commons.spis`, `cache.dragonfly.commons.spis` |
| lib-filemanagement | `filemanagement.spis` |
| security | `security.spis` (+ `.impl`) |
| subdomain-tenancy | `subdomaintenancy.spis` (+ `.impl`) |
| login-tenancy | `logintenancy.spis` (+ `.impl`) |
| billing | `billing.spis` (+ `.impl`), `billing.stripe.spis` |
| apikeys | `apikeys.spis` |
| audit | `audit.core.spis` |
| backup | `backup.spis` (+ `.impl`) |
| business-days | `businessdays.spis` (+ `.impl`) |
| exchange | `exchange.spis` (+ `.impl`) |
| ai-pricing | `aipricing.spis` (+ `.impl`) |
| resilience | `resilience.core.runtime.circuitbreaker.spis`, `resilience.core.runtime.ratelimiter.spis` |

Todos sob o prefixo `br.com.seedgrid.`. O guardião `SpiPackageNamingGuardianTest` falha o build se existir um pacote `spi` no singular; o host que quiser a mesma proteção pode copiar o teste. A lib-commons 2026.10.09 já publicada ainda tem `spi`: quem sobe para a 2026.10.22 troca os imports de uma vez.

## O que é `seedgrid.security.isolation`?

Declara o **modelo de dados** do host e só define os **padrões** das propriedades abaixo. `login-tenancy` declara `shared-database`; `subdomain-tenancy` declara `dedicated-database`. Host que não define nada não muda de comportamento (fora as quebras de contrato desta nota).

| Propriedade | `shared-database` | `dedicated-database` | Efeito |
|---|---|---|---|
| `seedgrid.security.isolation` | padrão | | Modelo de dados. |
| `seedgrid.security.account.enabled` | `true` | `false` | Liga ou desliga `/me/security/*` (404 desligado). |
| `seedgrid.security.platform-scope.exempt` | vazio | `companies, users, roles, permissions:GET` | Recursos isentos do `@SgPlatformScope` (entrada `recurso` ou `recurso:METODO`). |
| `seedgrid.security.admin-guard.scope` | `company` | `database` | Escopo do "mínimo 1 ADMIN ativo": por empresa, ou no banco todo (mais cada empresa com 1 usuário ativo). |

No `dedicated-database`, o ADMIN de um tenant com 2 ou mais empresas usa `/users`, `/roles` e `/companies` e **lê** `/permissions` (antes recebia 403).

## Por que `cnpj` virou `cpf_cnpj`?

Para aceitar **pessoa física** (B2C). Sem alias:

- `sg_companies` (security, migration `V238`): `person_type` (`PJ` ou `PF`); `cnpj` → `cpf_cnpj` e `cnpj_hash` → `cpf_cnpj_hash`, **anuláveis** (uma PF pode não ter CPF; duas PF sem documento não colidem). PJ exige CNPJ válido (inclusive alfanumérico); PF aceita CPF válido ou nenhum. Erro: 400 `COMPANY_DOCUMENT_INVALID`; documento repetido: 409.
- `sg_accounts` (billing-core, `V514`): `cpf_cnpj` anulável e `person_type`; `GET /admin/accounts?personType=PF|PJ`.
- `sg_signup_request` (login-tenancy, `V704`/`V705`): `cpf_cnpj` e `person_type`.
- API: `personType` e `cpfCnpj` em `CompanyDTOReq/Patch/Res`; **não existe mais `cnpj`**. `GET /public/signup/document-status?cpfCnpj=` substitui `cnpj-status`. `Company#getCnpj` virou `getCpfCnpj`; `CompanyRepository.findByCnpj` virou `findByDocument`.
- A empresa-plataforma continua sendo a `Company` PJ cujo CNPJ é `seedgrid.security.default-company.cnpj` (propriedade **inalterada**); empresa PF nunca é plataforma.
- Host com SQL cru em `sg_companies`, `sg_accounts` ou `sg_signup_request` (ex.: provisionamento do subdomain-tenancy) usa `cpf_cnpj` e `cpf_cnpj_hash`.

## Roteiro de migração, na ordem

1. **Versões.** Suba todas as extensions e libs para `2026.10.22` de uma vez (`notification` 2026.10.15). Faça a atualização do `seedgrid.audit.version` nos consumidores para receber a correção de concorrência do audit.
2. **Imports.** Troque `spi` por `spis` (acima) e compile.
3. **Contratos que mudaram** (vale para todo host, com ou sem `isolation`):

| Era | Passa a ser |
|---|---|
| `roleIds`, `companyIds` (Long), `root`/`isRoot` no cadastro de usuário | `rolePublicIds` e `memberships: [{companyPublicId, rolePublicIds}]`; `root` não existe na API. `/me/security/users`: `roleIds` virou `rolePublicIds` |
| 422 de "último root" | **409 `LAST_ADMIN_PROTECTED`** (`is_root` deixou de proteger contra remoção) |
| `DELETE /companies/{publicId}` e `COMPANY_DELETE` | removidos (`V237`); inativar é `PATCH {active:false}` |
| `PERMISSION_CREATE/UPDATE/DELETE` | removidas (`V236`); só `GET /permissions` |
| Nome de role livre | só `^[A-Z_]+$`, 5 a 30 caracteres, único: 400 `ROLE_NAME_INVALID`; `ADMIN` reservado em `shared-database`: 409 `ROLE_NAME_RESERVED` |
| Role com permissões de mais de uma audiência | 400 `ROLE_MIXED_AUDIENCE` |
| Token de membro desativado seguia valendo | **401 `SESSION_REVOKED`** |
| Empresa inativada ainda aparecia no login | some do login; quem só tem empresas inativadas recebe 403 `COMPANY_DISABLED` |
| Cadastro com `cnpj` | `cpfCnpj` (acima) |
| Erro sem `code` | `ProblemDetails` ganhou o campo opcional `code` |

4. **Permissões de integração.** A `V255` zera os vínculos não liberados das roles de integração. A software house **libera por migration do host**, idempotente: `UPDATE sg_permissions SET for_integration = true WHERE name IN (...)`, e refaz o vínculo da role de integração (exemplo: `INTEGRACAO_USUARIOS` com `USER_READ`, `USER_CREATE`, `USER_UPDATE`). Sem isso não se cria chave de API. O cliente nunca libera. Detalhes: [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]], Fase 4.
5. **Banco.** As migrations das extensions rodam sozinhas. Números que entram, por módulo: security `V236`, `V237`, `V238`, `V239` (termos), `V255` (integração), `V260` e `V261` (estado de acesso), `V270` (login social); billing `V514`, `V515`, `V516`; login-tenancy `V704`, `V705`; business-days `V1102` a `V1104` (a `V1100` não foi reescrita, para preservar o checksum). As migrations do **host** devem evitar estes números (as faixas são reservadas às extensions).
6. **`BaseEntity.createdAt` e `updatedAt`** passaram de `LocalDateTime` para **`java.time.Instant`** (coluna `timestamptz`; no JSON saem com `Z`). Quem usava `getCreatedAt()` como `LocalDateTime` ajusta (ex.: `LocalDateTime.ofInstant(i, ZoneId.of("America/Sao_Paulo"))`). No Postgres converta as colunas **com o `USING`**:

```sql
-- as colunas foram gravadas em UTC; sem o USING o Postgres assume o TimeZone da SESSÃO e desloca o histórico inteiro em silêncio
ALTER TABLE <tabela> ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
ALTER TABLE <tabela> ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
```

MongoDB não precisa migrar dados. **Atenção à origem:** a mudança é do commit `2d9c2df` (2026-08-16), anterior ao ciclo 2026.10, e **não consta no CHANGELOG da lib-commons**; foi exposta pelo E2E. Não há teste guardião próprio. **[não verificado: data e ausência de CHANGELOG]**

7. **Front e BFF.** Tratar `COMPANY_READ_ONLY`, `COMPANY_DISABLED` e `SESSION_REVOKED` ([[SeedGrid/Extensions/security/Somente-leitura-e-QUERY|Somente leitura e QUERY]]); trocar `cnpj` por `cpfCnpj`; mandar `rolePublicIds` e `memberships`. Quem tinha `quarkus.http.auth.proactive=false` só por causa do 500 com o subdomain-tenancy pode remover o override (a autenticação proativa passou a funcionar).
8. **Teste de host que cria role de integração por `em.persist` ou SQL** sem liberar a permissão não quebra (a garantia está no `RoleService` e na `V255`), mas SQL direto ainda pode violar a invariante.

## Quais são os guardiões desta nota?

`SpiPackageNamingGuardianTest`, `PermissionsReadOnlyGuardianTest`, `CompanyNeverDeletedGuardianTest`, `NoSgPermissionAllowedGuardianTest`, `MigrationNumberingGuardianTest`, `AccountManagementDedicatedDatabaseGuardianTest`, `PlatformScopeDedicatedDatabaseGuardianTest`, `QueryMethodGuardianTest`, `PlatformCompanyNullSafeGuardianIT`, `TermsAcceptanceGuardianIT`, `RbacTenantIsolationGuardianIT`, `SessionRevocationGuardianIT`, `LastAdminGuardianIT`, `IntegrationRoleGuardianIT`, `AccessRuleBookTest`.

## O que não foi verificado

- `seedgrid-report` e `seedgrid-platform-examples` não foram conferidos contra os pacotes novos (repositórios de terceiros ou espelhos de versões publicadas). **[não verificado]**
- O `lckfiscal` foi ajustado (pacotes e `migration.target-version` v3 → v4) e não usa a extension `business-days`.
