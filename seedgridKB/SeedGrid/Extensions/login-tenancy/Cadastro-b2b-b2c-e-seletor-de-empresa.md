---
description: "Como configurar o cadastro B2B, B2C ou os dois no login-tenancy (2026.10.22, não publicado), em perguntas e respostas: signup.customer-type, CPF opcional, login social, planos de demonstração do b2c, o seletor de empresa dos boilerplates (companySelectionRequired, accessMode, cookies e armadilhas) e o Mailpit no lugar do Mailhog."
tags: [seedgrid, extension, login-tenancy, b2b, b2c, signup, seletor-de-empresa, boilerplate, host, perguntas-e-respostas]
analisado-em: 2026-10-23
---

# Cadastro B2B e B2C, seletor de empresa e e-mail local

> **Status: NÃO PUBLICADO.** Vale para `seedgrid-quarkus-ext-login-tenancy` **2026.10.22** (com `security` e `business-days` 2026.10.22) e para os boilerplates `login-tenancy-b2b` e `login-tenancy-b2c`. O b2c segue **indisponível** na matriz do `sg-new-product` até a subida ser provada. Veja também [[SeedGrid/Extensions/login-tenancy/Visao-geral|Visão geral]], [[SeedGrid/Extensions/login-tenancy/Configuracao|Configuração]] e [[SeedGrid/Extensions/security/Escopo-e-acesso|Escopo e acesso]].

## Qual boilerplate eu escolho?

| Quero vender para… | Modelo |
|---|---|
| Empresas, com vários usuários por conta (equipe, convites, perfis) | `login-tenancy-b2b` |
| Pessoa física (uma conta = uma pessoa) | `login-tenancy-b2c` |
| Empresas, um tenant por subdomínio | `subdomain-tenancy` (nunca terá versão pessoa física) |

A extension `seedgrid-quarkus-ext-login-tenancy` é **uma só**, compartilhada por B2B e B2C. A diferença está na configuração e nas telas. O b2b é o antigo `login-tenancy`; as pastas antigas não existem mais, e caminhos na KB e em guardiões devem apontar para `-b2b` ou `-b2c`.

## Como configuro quem pode se cadastrar?

```properties
seedgrid.login-tenancy.signup.customer-type=B2C
seedgrid.login-tenancy.signup.personal-document-required=false
```

| Propriedade | Tipo | Padrão | Efeito |
|---|---|---|---|
| `seedgrid.login-tenancy.signup.customer-type` | `B2B` \| `B2C` \| `BOTH` | `B2B` | Quem pode se cadastrar. Fora do tipo: 403 `SIGNUP_TYPE_NOT_ALLOWED`. Só faz sentido em `shared-database`. Em `B2C` ou `BOTH` o login social cria conta pessoal (`LoginTenancySocialAccountCreator`); em `B2B` esse criador fica inativo. |
| `seedgrid.login-tenancy.signup.personal-document-required` | boolean | `false` | `true` = `POST /public/signup/personal` sem CPF responde **400 `PERSONAL_DOCUMENT_REQUIRED`**. Ligue **só se o produto emitir nota**. Não vale para login social (que não pede CPF). Env: `SEEDGRID_SIGNUP_PERSONAL_DOCUMENT_REQUIRED`. |
| `seedgrid.login-tenancy.modules.business-days.company-required` | boolean | `true` | Exige empresa corrente no calendário ([[SeedGrid/Extensions/business-days/Calendario-em-camadas|Calendário em camadas]]). |
| `seedgrid.login-tenancy.modules.<módulo>.enabled` | boolean | `true` | `billing`, `apikeys`, `backup`, `filemanagement`, `ai-pricing`, `exchange`, `business-days`. |
| `seedgrid.security.isolation` | enum | `shared-database` (declarado pela extension) | Contrato explícito; sem mudança de comportamento. |

## Quais são as rotas de cadastro?

- `GET /public/signup/config` → `{ customerType, termsRequired, termsVersion, termsDocuments, socialProviders[], personalDocumentRequired }`. O front escolhe o fluxo (PF, PJ ou seletor), mostra o CPF como obrigatório por `personalDocumentRequired` e só exibe os botões de `socialProviders` (vazia sem o módulo `seedgrid-security-social`).
- `POST /public/signup` (empresa): campo `cpfCnpj` no lugar de `cnpj`.
- `POST /public/signup/personal` (pessoa física): `name` (2 a 120), `email`, `password`, `whatsapp` (10 a 20), `cpf` (opcional, validado), `acceptedTerms`, `termsVersion`. **E-mail que já tem conta: 409** (pessoa física nunca vincula a conta existente).
- `GET /public/signup/document-status?cpfCnpj=` → `{ status: AVAILABLE | REGISTERED | PENDING_CONFIRMATION, pendingEmailMasked }` (substitui `cnpj-status`, removido).
- Termos: [[SeedGrid/Extensions/security/Termos-de-uso|Termos de uso]]. Login social: [[SeedGrid/Extensions/security/Login-social-Google|Login com Google]].
- Quebras: `SignupStatus` virou `DocumentSignupStatus`; `SignupConfirmedEvent(personType, cpfCnpj, ...)` e `InstitutionalSignupRequest` ganharam campos (tipo de pessoa, termos). Host que observa o evento ou chama o signup institucional ajusta. Migrations `V704` e `V705`.

## O que o boilerplate b2c tem e não tem?

- **Tem:** perfil, segurança (senha, 2FA, métodos de entrada), assinatura, termos e LGPD (exportar e excluir meus dados), temas, dias úteis, API keys e o admin web da equipe do produto.
- **Não tem, de propósito:** telas de usuários, convites ("Convidar usuário externo"), perfis e permissões, `select-company` e a rota `/api/self-enter`. Os textos dizem "conta" e "você", não "empresa".
- **Planos de demonstração** (migration `V3001` do b2c): trial (20 requisições, sem armazenamento; por dias ou consumo), `GRATIS` (R$ 0, 100 requisições e 50 MB, sem excedente) e `PREMIUM` (R$ 29,90, 1.000 requisições e 500 MB, excedente cobrado). Não há limite de empresas.
- **Login social:** `seedgrid.security.social.providers` (env `SEEDGRID_SOCIAL_PROVIDERS`; vazio = inerte). Provedor listado sem credenciais **derruba o boot**. O módulo exige Quarkus com `quarkus-oidc` (o b2c usa 3.30.8).
- **Armadilhas:** o front compila com `next build --webpack` (o Turbopack não aceita a junção de `node_modules`); **não copie** peças pessoa física (`PersonalSignupForm`, `SocialLoginButtons`, rotas `/api/auth/social/*`) para o b2b; as chaves JWT de desenvolvimento (`backend/src/main/resources/keys/*.pem`) são ignoradas pelo git, e sem elas o `BackendStartsGuardianTest` falha com `MalformedURLException`.
- **Conta-cliente e empresas:** no `login-tenancy` a conta-cliente **não administra empresas por API** (`/companies` é `@SgPlatformScope`, isento só em `dedicated-database`): recebe 403, e a administração de empresas é da plataforma. Uma empresa por conta; a segunda é a da plataforma. O cadastro de empresas com limite de plano existe no `subdomain-tenancy` ([[SeedGrid/Extensions/billing/Inadimplencia-e-limites-do-plano|Limites do plano]]).

## Como o front trata quem tem mais de uma empresa? (seletor de empresa)

Aplica-se aos frontends Next.js dos boilerplates `login-tenancy-b2b`, `login-tenancy-b2c` e `subdomain-tenancy`. Sem rota nova de backend.

Contrato do security: `AuthResponseDTO` (login, refresh e `select-company`) traz `companySelectionRequired` (só o `true` literal conta; ausente = backend antigo) e `currentCompany { publicId, name, accessMode, personType }` (nulo se a sessão não tem empresa). `GET /me/companies` lista as empresas com `accessMode`, **inclusive as `DISABLED`** (o seletor marca o estado; elas não são selecionáveis). `POST /me/select-company { companyPublicId }` troca a empresa e devolve novo token; empresa `DISABLED` responde 403 `COMPANY_DISABLED`.

| `accessMode` | No seletor | Ao escolher |
|---|---|---|
| `ACTIVE` | normal | entra |
| `READ_ONLY` | selo "Somente leitura" e aviso | entra; a faixa `CompanyAccessBar` aparece e a escrita é recusada com `COMPANY_READ_ONLY` |
| `DISABLED` | selo "Desativada", opção travada | não dá para escolher |

Fluxo: o BFF grava os cookies de sessão (httpOnly) e devolve ao navegador só `{ status, changePasswordRequired, twoFactorEnabled, publicId, companySelectionRequired }`; **o token nunca vai ao navegador**. Com `companySelectionRequired`, o BFF grava também o cookie `<prefixo>_company_selection_pending` (`sg_app_...` no login-tenancy, `sg_subdomain_client_...` no subdomain-tenancy) e `resolvePostLoginPath` manda para `/auth/select-company` (a escolha vem **antes** da troca de senha, porque o token ainda não está escopado). O `proxy.ts` prende o usuário nessa tela enquanto o cookie existir. Depois de logado, a troca é pelo combo "Empresa" da `CompanyAccessBar` (visível só com mais de uma empresa). Código: `lib/company-selection.ts`, `app/components/CompanySelect.tsx`, `app/auth/select-company/page.tsx`, `app/api/me/select-company/route.ts`, `proxy.ts`.

Armadilhas:
- **403 `COMPANY_DISABLED` derrubava a sessão.** O `fetchWithAdminSession` trata esse 403 como "a empresa da sessão foi desligada" e limpa os cookies; no `select-company` o 403 é da empresa **escolhida**, então o BFF tira um snapshot dos cookies e os restaura nesse caso.
- O cookie pendente sobrevive ao fechar a aba (cookie de sessão do navegador): o usuário volta e cai direto na seleção.
- Existe um token sem empresa entre o login e a escolha. O que ele pode chamar depende do backend; o front só o prende na tela (não é barreira de segurança).
- Cookie é por domínio, não por porta: por isso cada app tem prefixo próprio.
- A lista pode ficar velha (empresa desativada depois de listada): a tela marca a opção como desativada e mostra o erro.
- O `subdomain-tenancy` passa `X-Forwarded-Host` com o tenant nas chamadas ao backend; não há login social lá.

## E o e-mail de desenvolvimento? (Mailpit no lugar do Mailhog)

Os três composes dos boilerplates sobem `axllent/mailpit:v1.21`: SMTP **1025** e interface/API **8025** nos dois `login-tenancy`; no `subdomain-tenancy` o compose publica **1026 → 1025** e **8026 → 8025**, para não colidir. Os testes E2E leem o e-mail pela API v1 do Mailpit. Quem apontava SMTP ou interface para o Mailhog troca a imagem e a URL. Uso: [[SeedGrid/Extensions/Mailpit-uso|Usar o Mailpit]].

## O backend dos boilerplates sobe de verdade?

O `BackendStartsGuardianTest`, com Postgres real, confere `/q/health` = UP. Causas corrigidas na 2026.10.22: `seedgrid.whatsapp.api=${SEEDGRID_WHATSAPP_API:}` sem default derrubava o boot (agora tem default vazio); o `subdomain-tenancy` ganhou `quarkus-smallrye-health`; o `@QuarkusTestResource` do `DomainAuditTest` ficou restrito à própria classe; `quarkus.hibernate-orm.packages` do exemplo inclui `br.com.seedgrid.billing.entities` (some o aviso de persistence unit). O E2E dos boilerplates (backend + Playwright) foi executado em 2026-10-23.

## Não verificado

- A renderização das telas no navegador pelo dono (o E2E Playwright cobre).
- O fim a fim do `COMPANY_REQUIRED` com um host real de várias empresas sem seleção.
- `seedgrid-report`, `seedgrid-report-admin` e o Pulse (fora do escopo; repositórios de terceiros).
