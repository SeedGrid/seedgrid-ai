---
description: "Como o host login-tenancy (B2B e B2C) escopa as próprias tabelas por conta/empresa (bean, tipo do id, padrão de filtro), o que existe e o que NÃO existe para exclusão de conta, e como o export do backup (RAW e DOMAIN) filtra pela empresa do pedido em banco compartilhado (LGPD)."
tags: [seedgrid, extension, login-tenancy, host, escopo, company, lgpd, exclusao-de-conta, export, backup, perguntas-e-respostas]
analisado-em: 2026-11-18
---

# Escopo do domínio do host, exclusão de conta e export (login-tenancy)

> Conferido no código em 2026-11-01 (`security`, `login-tenancy`, `billing`, `backup`, boilerplate `login-tenancy-b2c`). Nada foi executado. O que não pude confirmar está marcado como **não verificado**.

## Como o host sabe "de quem é" a requisição

| Preciso de… | Bean a injetar | Método | Tipo |
|---|---|---|---|
| a empresa corrente (no B2C, a conta da pessoa) | `br.com.seedgrid.security.services.CompanyRequestContext` (`@RequestScoped`) | `getCurrentCompanyId()` | `Long` (id numérico interno) |
| as empresas permitidas ao token | `CompanyRequestContext` | `getAllowedCompanies()` | `List<Long>` |
| se o usuário é root na empresa corrente | `CompanyRequestContext` | `isCurrentCompanyRoot()` | `boolean` |
| se o usuário vê todas as empresas (super-leitura) | `CompanyRequestContext` | `isAllCompanies()` | `boolean` |
| o usuário corrente | `br.com.seedgrid.commons.persistence.spis.CurrentUserProvider` | `getCurrentUserPublicId()` | `String` (`publicId`) |
| a empresa corrente como `publicId` | `br.com.seedgrid.logintenancy.services.CompanyPublicIdResolver` | `publicIdOf(Long companyId)` | `String` (ou `null`); cache em memória, o `publicId` é imutável |
| a conta de cobrança (usuário + conta) | `CurrentAccountResolver` (billing) | `requireCurrentUser()` etc. | ver [[SeedGrid/Extensions/billing/SPIs|billing/SPIs]] |

O `CompanyContextFilter` preenche o `CompanyRequestContext` a cada requisição, a partir da claim `companyId` do token (ou, sem escopo, da única empresa ativa do usuário). **O host nunca lê o escopo de parâmetro, header ou corpo da requisição do cliente.**

No B2C, uma conta é uma pessoa e há uma empresa por conta; então "a conta" do domínio do host é a empresa corrente.

## Qual identificador gravar nas tabelas do host

Todas as entidades SeedGrid herdam de `BaseEntity`: `id` (`Long`, interno) e `publicId` (`String`, único e imutável). A convenção da plataforma é **gravar `publicId`, nunca o id numérico**, quando o dado sai do banco (a auditoria usa `metadata.companyPublicId` pelo mesmo motivo).

Recomendação da doc (não é imposta por código): coluna `company_public_id` (texto) em cada tabela de domínio, preenchida com `CompanyPublicIdResolver#publicIdOf(companyRequestContext.getCurrentCompanyId())`. Se a pessoa, e não a empresa, é a dona do dado (B2C com uma empresa por pessoa dá o mesmo resultado), use `user_public_id` de `CurrentUserProvider`. Escolha **um** e use em todas as tabelas.

## Padrão de filtro: manual, no repositório

**Não existe filtro automático** (nenhum `@Filter`/`@FilterDef` do Hibernate, nem entidade "company-scoped" base). O padrão usado pelas extensions é filtrar à mão na consulta do repositório, com o id lido do contexto. Exemplo real, do `apikeys`:

```java
// ApiKeyRepository
private static final String COMPANY_FILTER =
        "AND (:companyId IS NULL OR a.companyId IS NULL OR a.companyId = :companyId)";
// "SELECT a FROM ApiKey a WHERE a.owner.id = :ownerId " + COMPANY_FILTER + " ORDER BY ..."
// parâmetro: companyRequestContext.getCurrentCompanyId()
```

Atenção para o host: o filtro do `apikeys` aceita `companyId` nulo (chave global). Para dados financeiros de pessoa, **não** copie essa tolerância: sem empresa corrente, recuse a requisição em vez de listar tudo. Todo método de repositório do host (inclusive `findById`, `delete` e agregações) precisa receber e aplicar o escopo; um teste de isolamento (duas contas, cada uma enxergando só o seu) é o guardião natural.

## Exclusão de conta: o que existe

- **Não existe fluxo de "excluir minha conta".** Os endpoints `DELETE` em `security`, `login-tenancy` e `billing` são administrativos ou parciais: usuário por `publicId` (`USER_DELETE`), vínculo com empresa, role, avatar próprio (`/me/profile/avatar`), método de entrada social (`/me/identities`), plano. Nenhum apaga a pessoa, a empresa e os dados do domínio de uma vez, e **nenhum evento ou SPI de "conta excluída"** foi encontrado para o host enlaçar as tabelas dele.
- O boilerplate `login-tenancy-b2c` **não tem** tela de LGPD: nas páginas do front (`perfil`, `security`, `assinatura`, `auth`, etc.) não há exportar nem excluir meus dados. A frase "termos e LGPD (exportar e excluir meus dados)" que a KB trazia estava errada e foi corrigida. O que existe é o **aceite de termos** (`TermsService`).
- Consequência para o host: a exclusão de dados do domínio e da pessoa é **trabalho do host** hoje. Peça à plataforma o fluxo se o produto precisar (demanda à plataforma, HO-08); até lá não prometa "exclusão pronta".

## Export `RAW` e `DOMAIN`: filtram pela empresa do pedido

> Conferido pelos testes do P169 em 2026-11-18 (`ExportCompanyIsolationIT`, Postgres real, duas empresas). Vale a partir de backup 2026.11.6 e login-tenancy 2026.11.9, **ainda não publicados**. Antes disso o comportamento era o oposto, descrito abaixo em "Versões anteriores".

- `POST /exports` exige `BACKUP_CREATE` (leitura `BACKUP_READ`; download `BACKUP_DOWNLOAD`). As permissões `BACKUP_*` têm `audience=platform`: o `ADMIN` de uma empresa-cliente (token `client`) recebe **403** no `POST /exports`; só o administrador da plataforma exporta.
- A empresa do pedido vem do SPI `ExportCompanyScopeProvider`, que o `login-tenancy` implementa (`LoginTenancyExportCompanyScopeProvider`) a partir do `CompanyRequestContext`. Ela é gravada no job e levada ao worker assíncrono.
- **Com uma empresa no contexto**, `RAW` e `DOMAIN` filtram `WHERE <coluna> = <empresa>` e **não trazem nada de outra empresa**. A coluna é reconhecida por `seedgrid.backup.company-column-names` (padrão `company_public_id,company_id`).
- **Falha fechada:** tabela ou entidade sem coluna de empresa não sai. Ficam de fora `sg_users`, `sg_companies`, `sg_permissions` e `sg_export_jobs`.
- **Super-leitura** (`allCompanies`, administrador da plataforma) exporta tudo, sem filtro. **Sem empresa resolvida**, o provider devolve um escopo que não casa com nada: nunca exporta sem filtro.
- `seedgrid.backup.excluded-domain-entity-packages` agora vale também no `RAW`.

**Regras para o host (B2B e B2C em banco compartilhado):**
1. As tabelas de domínio do host precisam de uma coluna de empresa reconhecida (`company_public_id`, como na seção "Qual identificador gravar"); sem ela a tabela **não sai** no export, nem para a própria empresa.
2. Não conceda `BACKUP_CREATE` a usuário de cliente; o padrão agora é só a plataforma.
3. Para "exportar meus dados" (LGPD) o host continua precisando de endpoint próprio, filtrado pelo escopo acima; `/exports` é um backup administrativo, não um fluxo de titular.

**Não verificado:** o HTTP fim a fim com o `ADMIN` real em login-tenancy (o teste chama o serviço de extração com o contexto da empresa; o 403 do `POST` foi testado só aqui); nenhum host de produto foi regerado com os jars novos.

**Versões anteriores (antes de backup 2026.11.6):** o `ExtractDataService` lia `SELECT * FROM <schema>.<tabela>` sem filtro. O `RAW` ignorava a exclusão e entregava ao `ADMIN` de uma empresa-cliente as linhas de **todas** as empresas (incluindo `sg_users`); o `DOMAIN` respeitava só a exclusão por pacote. Quem usa essa versão: não conceda `BACKUP_CREATE` a usuário de cliente e exclua os pacotes do host.
