---
description: "Como o host login-tenancy (B2B e B2C) escopa as próprias tabelas por conta/empresa (bean, tipo do id, padrão de filtro) e o que existe, e o que NÃO existe, para exclusão de conta e exportação de dados do domínio em banco compartilhado (LGPD)."
tags: [seedgrid, extension, login-tenancy, host, escopo, company, lgpd, exclusao-de-conta, export, backup, perguntas-e-respostas]
analisado-em: 2026-11-01
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

## Export `DOMAIN`: não filtra por conta

- `POST /exports` (permissão `BACKUP_CREATE`; leitura `BACKUP_READ`; download `BACKUP_DOWNLOAD`). O dono do **job** é isolado por `createUserPublicId` (cada usuário só vê os próprios jobs), mas o **conteúdo** não.
- O `ExtractDataService` lê com `SELECT * FROM <schema>.<tabela>` para cada entidade JPA da aplicação (escopo `DOMAIN`) ou cada tabela do schema (`RAW`). **Não há filtro por empresa ou por pessoa.** Em banco compartilhado (login-tenancy), quem tiver `BACKUP_CREATE` exporta **as linhas de todas as contas** em todas as entidades que não estejam excluídas.
- A única válvula é `seedgrid.backup.excluded-domain-entity-packages` (prefixos de pacote Java): entidades nesses pacotes saem do `DOMAIN`.

**Regras para o host (B2B e B2C em banco compartilhado):**
1. Não conceda `BACKUP_CREATE` a usuário de cliente; deixe só ao administrador da plataforma.
2. Ponha os pacotes de entidades do host em `seedgrid.backup.excluded-domain-entity-packages` (ou não use o export `DOMAIN` com dados por-conta) até existir export filtrado por conta.
3. Para "exportar meus dados" (LGPD) o host precisa de endpoint próprio, filtrado pelo escopo acima. Não use `/exports` para isso.

Pedido à plataforma, se o produto precisar: export `DOMAIN` com filtro por empresa corrente e fluxo de exclusão de conta com evento/SPI. **Não verificado:** se o `RAW` ou o `DOMAIN` respeitam algum filtro de tenant em modo subdomain-tenancy (lá cada tenant tem banco próprio, então o problema não se coloca da mesma forma).
