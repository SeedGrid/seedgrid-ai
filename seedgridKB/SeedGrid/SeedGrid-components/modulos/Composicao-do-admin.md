---
description: "Como o admin e o front de um produto SeedGrid são montados por módulos: o que já vem padrão (shell, menu, temas, login) e, por módulo fe-*, o pacote, as rotas, o menu, as variáveis e o que acrescentar ou remover quando o módulo for usado ou dispensado. Leia antes de ligar ou desligar um módulo no front."
tags: [seedgrid, front, modulo, admin, produto-novo]
analisado-em: 2026-10-20
---

# Composição do front e do admin (adicionar e remover módulos)

Os módulos `@seedgrid/fe-*` são copiados para o app pela CLI SeedGrid ("scaffold", modelo shadcn): a lógica fica no pacote npm e as telas, menus e route handlers viram arquivos do app. Detalhes do contrato: [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos front]].

## Estado real dos boilerplates (confirmado em 2026-10-20)

Os front e admin dos boilerplates `login-tenancy` e `subdomain-tenancy` **não dependem dos pacotes `@seedgrid/fe-*` por módulo**: no `package.json` há só `@seedgrid/fe-components`, `fe-core` e `fe-theme`. Os módulos do quadro abaixo estão como **código copiado** na pasta `app/` de cada app (por exemplo `app/security/self-enter`, `app/apikeys`, `app/ai`, `app/configuracao/cambio`), com o menu em `app/data.ts` (`navItems`) e os ícones em `app/components/Shell.tsx`. Onde o quadro cita o pacote, leia "a pasta do módulo no app"; a coluna "Para remover" vale como está (apagar pastas e linhas do menu).

O `sg-new-product` remove as telas de um módulo com **receitas provadas** (cada uma com `pnpm build` verde nos dois boilerplates, front e admin): `self-enter` (front e admin), `api-keys` (front e admin), `audit` (front e admin), `backup` (admin), `ai-pricing` (admin) e `exchange` (admin). A receita apaga as pastas da rota e dos proxies da API e as linhas do menu em `app/data.ts`; o que fica (lib, permissões, traduções, ícones) é inofensivo. O painel inicial do admin continua consultando auditoria e cotação e mostra a seção vazia ou "indisponível" sem o módulo. **Sem receita:** `billing-user`, `billing-platform`, `realtime` e `whatsapp` (entrelaçados em contas, painel inicial, menu do usuário, provider global e telas de 2FA): para esses, só o backend se liga e desliga; remover a tela é trabalho de código. Remover a tela **não** desliga o backend do módulo.

Lacuna para a plataforma: a CLI SeedGrid não tem comando de "remover módulo", e os pacotes `fe-*` por módulo não são usados pelos boilerplates (a decisão de modularizar fica registrada como ideia no work da plataforma).
## O que já vem padrão (não é módulo opcional)

O módulo **`fe-security`** é a base e vem sempre: shell do app, menu lateral por seções, login e recuperação de senha (`/auth/login`), dashboard (`/`), gestão de usuários, empresas e roles, tema e mensagens (i18n). Todos os outros módulos **exigem** `security`. Um dos módulos de `tenancy` (login-tenancy ou subdomain-tenancy) é escolhido pelo modelo de projeto e nunca os dois (`variantGroup: tenancy`). Ver [[SeedGrid/SeedGrid-components/modulos/fe-security|fe-security]].

## Quadro por módulo

| Módulo (`id`) | Pacote | Rotas que traz | Menu | Variáveis de ambiente | Para **remover** (não usar) | Para **acrescentar** (usar) |
|---|---|---|---|---|---|---|
| `security` (base) | `@seedgrid/fe-security` | `/`, `/auth/login`, usuários, empresas, roles (19 páginas e 6 route handlers) | seção `application` → `access-management` (`users`, `companies`, `roles`; `api-keys` se habilitado) | `NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED`, cookies `SEEDGRID_SECURITY_ACCESS_COOKIE_NAME` e `_REFRESH_COOKIE_NAME` | não se remove | já vem |
| `self-enter` | `@seedgrid/fe-self-enter` | `/auth/self-enter` (público; `?token=` é o modo convite), `/self-enter/invitations`, `/self-enter/requests/to-approve` | itens de self-enter no menu do security, quando `security_self_enter_enabled` | `NEXT_PUBLIC_SECURITY_SELF_ENTER_ENABLED` | desligar a flag; apagar `src/app/auth/self-enter`, `src/app/self-enter` e `src/modules/self-enter`; tirar o item de menu e a dependência do `package.json` | CLI com o módulo; flag `true`; backend com `seedgrid.security.self-enter.enabled=true` |
| `api-keys` | `@seedgrid/fe-apikeys` | `/security/api-keys` (permissões `APIKEY_READ`, `APIKEY_CREATE`, `APIKEY_REVOKE`) | item `api-keys` e atalho no dashboard, condicionados a `security_api_keys_enabled` (vivem no scaffold do security) | nenhuma | apagar `src/app/security/api-keys` e `src/modules/api-keys`; tirar o item de `useSecurityAppShellSections` e o atalho de `SecurityDashboard` | CLI com o módulo e a variável de template `security_api_keys_enabled` |
| `audit` | `@seedgrid/fe-audit` | **nenhuma tela** (só cliente da API de auditoria) | — | nenhuma | tirar a dependência `@seedgrid/fe-audit`; nada a apagar | tela de auditoria é do produto (lacuna: o módulo não entrega página) |
| `backup` | `@seedgrid/fe-backup` | `/backup/exports`, `/backup/exports/new`, `GET /api/backup/exports/[jobId]/download` | seção `backup` (ordem 50) → `backup-management` → `backup-exports` (permissão `JOB_READ`) | nenhuma | apagar `src/app/backup`, `src/app/api/backup` e `src/modules/backup`; tirar a dependência | CLI com o módulo; backend com `backup` |
| `billing-platform` | `@seedgrid/fe-billing-platform` | `/platform/plans` (lista, novo, editar), `/platform/plans/trial`, `/api/platform/plans/**` | seção `platform` (40) → `platform-billing` → `platform-plans`, `platform-trial` | cookies do security | apagar `src/app/platform/plans`, `src/app/api/platform/plans` e `src/modules/billing-platform` | CLI com o módulo; só no **admin** da plataforma |
| `billing-user` | `@seedgrid/fe-billing-user` | `/billing`, `/billing/plans`, `/billing/invoices`, `/api/billing/**` (checkout, portal, troca de plano, cancelar) | seção `billing` (30) → `billing-user` (`BILLING_READ`) | cookies do security | apagar `src/app/billing`, `src/app/api/billing` e `src/modules/billing-user` | CLI com o módulo; backend com `billing` e provider |
| `login-tenancy` | `@seedgrid/fe-login-tenancy` | `/signup` (wizard institucional), `/auth/select-company`, `/api/login-tenancy/**` | — | cookies do security | não se remove isoladamente: trocar de modelo é trocar de módulo | modelo 1 ou 2 da matriz |
| `subdomain-tenancy` | `@seedgrid/fe-subdomain-tenancy` | `/signup` (wizard com subdomínio), `/api/locations/states`, `/api/locations/cities`, server actions de tenant | — | `SEEDGRID_TENANCY_DOMAIN`, `SEEDGRID_APP_API_BASE_URL`, `SEEDGRID_CITIES_API_USERNAME`, `SEEDGRID_CITIES_API_KEY` (UF e cidade) | idem | modelo 3 da matriz |

## Extensions sem módulo de front

Não existe pacote `fe-*` para: `notification`, `ai-pricing`, `exchange`, `business-days`, `whatsapp`, `realtime`, `cache`, `resilience`, `privacy`, `filemanagement`. Se o produto usa uma delas e precisa de tela, a tela é do produto (e a falta vira demanda para a plataforma, nunca alteração da extension).

## Ao adicionar ou remover um módulo

1. Ajustar o manifesto do app (módulos instalados) e a dependência no `package.json`.
2. Apagar ou copiar as pastas da coluna correspondente.
3. Conferir o menu de `useSecurityAppShellSections` e o dashboard (itens de `api-keys` e `self-enter` moram ali).
4. Alinhar a variável de ambiente e a propriedade do backend que liga o recurso.
5. Rodar o build do front e conferir que não há rota ou import apontando para o módulo removido.

Lacuna: o procedimento acima descreve o efeito do scaffold; a CLI ainda não tem um comando de "remover módulo". Registrar como demanda para a plataforma.
