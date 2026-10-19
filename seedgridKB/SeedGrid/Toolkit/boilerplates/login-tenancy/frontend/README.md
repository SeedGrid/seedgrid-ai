# SeedGrid App — front do cliente

App que o CLIENTE usa: signup, login (com 2FA), perfil, temas, i18n, assinatura e as telas de
segurança da própria conta (usuários, perfis, auditoria).

Copiado — não reescrito — do `seedgrid-report-admin` (esqueleto Next.js + BFF) com as telas
exclusivas portadas do `seedgrid-report-client`. Ver `../PLAN.md` §0 e §5.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- `@seedgrid/fe-components` · `@seedgrid/fe-theme` · `@seedgrid/fe-core`
- **Não** usa os módulos `@seedgrid/fe-*` restantes (decisão do dono, `PLAN.md` §2.2). Os paths do
  `fe-security` estão copiados em `lib/security-paths.ts`.

## Arquitetura de sessão — a regra que não se afrouxa

O browser fala **só** com `/api/**` deste Next. Quem fala com a API Quarkus é o servidor
(`lib/seedgrid-app-api-server.ts`). Consequências:

- o token **nunca** chega ao browser: fica em cookie `httpOnly`;
- existe **um único** ponto de refresh, server-side (`fetchWithAdminSession` + `refreshInFlight`);
- **não** há refresh client-side, e não deve haver. O `renovarUmaVezSo` do `seedgrid-pulse-ui` é a
  solução do *outro* modelo (token no browser). Implementar os dois cria o segundo cliente HTTP —
  exatamente o bug do Pulse, em que só um dos dois consultava o refresh (`PLAN.md` §6).

**Um único cliente HTTP por app.** Rota nova de BFF usa `apiFetchSecurity`/`fetchWithAdminSession`;
componente client novo usa `adminProxyClient` (`lib/core`) ou o `lib/ported/portedApi.ts`.

## Erro nunca vira lista vazia

`data?.items ?? []` sem tratar o erro é proibido. Toda tela de lista usa
`components/ui/list-load-error.tsx` (copiado do `seedgrid-pulse-ui`), e as rotas de BFF devolvem o
problem+json com o status real em vez de uma página vazia com HTTP 200. `emptyMessage` responde só
por vazio de verdade. Isso já custou uma tarde de investigação (`PLAN.md` §6.6 e §8.2).

## i18n

`components/providers/locale-provider.tsx` (5 idiomas), copiado do `seedgrid-pulse-ui` e registrado
em `app/layout.tsx`. Ele lê o `localStorage` por `useSyncExternalStore` — ler no inicializador do
`useState` causava `React #418` em toda tela. Não trocar.

## Integracao com a API

A URL da API vem da env **`SEEDGRID_APP_API_BASE_URL`**. Sem ela, aponta para
`http://127.0.0.1:8080` -- a API local, que e o default seguro. Ver `lib/seedgrid-app-api.ts`.

Nao existe mais `DEBUG_MODE` aqui. Ele escolhia entre a API local e o dominio de PRODUCAO do
`seedgrid-report`, hardcoded; num boilerplate isso faz cada produto clonado apontar, por default,
para a API de OUTRO produto -- e o sintoma nao e erro de conexao, e autenticar contra o backend
errado.

E `127.0.0.1`, nao `localhost`: a API sobe so na interface IPv4 e no Windows `localhost` resolve
::1 primeiro, custando ~200ms por conexao nova.

Variaveis uteis (auth servico-a-servico, opcionais):

- `SEEDGRID_APP_API_TOKEN`
- `SEEDGRID_APP_API_COMPANY_ID`

## Mapa das rotas de BFF

| Prefixo | Upstream | Sessão |
|---|---|---|
| `/api/auth/**` | `/public/auth/**`, `/public/2f/**` | pública |
| `/api/signup/**` | `/public/signup/**` (+ publica.cnpj.ws) | pública |
| `/api/me/profile/**` | `/me/profile/**` | cookie |
| `/api/me/{subscription,plans,billing/**}` | `/me/**` (billing) | cookie |
| `/api/security/{users,roles,permissions}/**` | `/me/security/**` | cookie |
| `/api/security/audit-logs/**` | `/audit-logs/**` | cookie |

## Pendências conhecidas

- **PWA**: não feito. `PLAN.md` §5.4 (fase 8), com a regra de `/api/**` network-only.
- **Cookies**: ainda se chamam `sg_admin_*`. Front e admin no mesmo host (portas diferentes) se
  atropelariam — cookie ignora porta. Renomear no `rename.sh` ou antes de subir os dois juntos.
- **Testes de sessão** (`PLAN.md` §7, fase 7): derrubar o access token e provar (a) recuperação
  sozinha, (b) N chamadas concorrentes => **um** refresh, (c) refresh inválido => login.
