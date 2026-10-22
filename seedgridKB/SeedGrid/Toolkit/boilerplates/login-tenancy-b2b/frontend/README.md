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

## Seletor de empresa

Usuário com mais de uma empresa precisa escolher qual usar. O contrato vem do `ext-security`
(`AuthResponseDTO`): `companySelectionRequired` (`true` quando há mais de uma empresa e nenhuma foi
escolhida) e `currentCompany { publicId, name, accessMode, personType }`.

- **Login** (senha, 2FA e, no login-tenancy, social): o BFF grava a sessão e, se
  `companySelectionRequired`, também o cookie `*_company_selection_pending`. O `proxy.ts` prende o
  usuário em `/auth/select-company` até a escolha; `lib/company-selection.ts#resolvePostLoginPath` decide o
  destino (seleção, depois troca obrigatória de senha, depois `/`).
- **Tela**: `app/components/CompanySelect.tsx` lista `GET /api/me/companies` (nome, PJ/PF se houver, selo do
  `accessMode`), trava as `DISABLED` com a explicação, aceita `READ_ONLY` (com aviso) e chama
  `POST /api/me/select-company`, que regrava o token escopado e apaga o cookie pendente.
- **Trocar depois de logado**: `CompanyAccessBar` (combo "Empresa"), visível só com mais de uma empresa. Falha
  de troca (ex.: `COMPANY_DISABLED`) vira toast e **não** derruba a sessão.
- Lógica pura e testada em `lib/company-selection.ts`; BFF em `app/api/me/select-company`.

## Mapa das rotas de BFF

| Prefixo | Upstream | Sessão |
|---|---|---|
| `/api/auth/**` | `/public/auth/**`, `/public/2f/**` | pública |
| `/api/signup/**` | `/public/signup/**` (+ publica.cnpj.ws) | pública |
| `/api/me/profile/**` | `/me/profile/**` | cookie |
| `/api/me/{subscription,plans,billing/**}` | `/me/**` (billing) | cookie |
| `/api/security/{users,roles,permissions}/**` | `/me/security/**` | cookie |
| `/api/security/audit-logs/**` | `/audit-logs/**` | cookie |

## Consultas com corpo (QUERY)

Consulta que precisa de corpo (filtro grande demais para a URL) usa o metodo HTTP **`QUERY`**, nao
`POST`: e' metodo seguro e passa mesmo com a empresa em modo somente leitura. O backend a declara
com `@QUERY` (`seedgrid-quarkus-lib-commons`). Route Handler do Next responde 400 a `QUERY`, entao o
caminho e' o `proxy.ts`:

```
browser  QUERY /api/q/<caminho-do-backend>?<qs>     (cookie de sessao, corpo JSON)
proxy.ts rewrite -> <SEEDGRID_APP_API_BASE_URL>/<caminho-do-backend>?<qs>
         + Authorization: Bearer <cookie>  (+ X-Company-Id se SEEDGRID_APP_API_COMPANY_ID)
```

Uso (copiar e colar), a partir de um componente client:

```ts
import { query } from "@/lib/query";
import { isCompanyReadOnlyBody } from "@/lib/api-error";
import { extractApiErrorMessage } from "@/lib/core";

// chama QUERY /api/q/audit-logs/search  ->  QUERY <API>/audit-logs/search
// (caminho ilustrativo: hoje nenhuma extension expoe um endpoint @QUERY; use o do seu host)
try {
  const page = await query<{ items: AuditLogEntry[]; totalRecords: number }>("audit-logs/search", {
    entity: "User",
    page: 1,
  });
} catch (error) {
  const message = extractApiErrorMessage(error); // ApiClientError: .status e .responseBody (problem+json)
}
```

- Em **401** (que nao seja `SESSION_REVOKED`/`PASSWORD_CHANGE_REQUIRED`) o `query()` chama
  `POST /api/auth/refresh` e **repete a consulta uma unica vez**; se falhar de novo, lanca
  `ApiClientError`. Sessao revogada nao renova.
- Sem cookie de sessao o proxy responde **401 JSON** (`code: NO_SESSION`), nunca redirect.
- Qualquer metodo que nao seja `QUERY` em `/api/q/**` responde 405: o prefixo nao e' proxy de escrita.
- Nao crie `app/api/q/**`: o proxy atende antes de qualquer rota. Quem **grava, consome cota ou
  publica evento** continua `POST` por uma rota `app/api/**` do BFF.
- Arquivos: `proxy.ts`, `lib/query-proxy.ts` (rewrite), `lib/query.ts` (helper),
  `app/api/auth/refresh/route.ts` (renovacao), `lib/api-base-url.ts` (base da API). Testes: `proxy.test.ts`,
  `lib/query.test.ts`.

## Dias úteis: feriados prontos, móveis e vai trabalhar

Telas em `app/dias-uteis/*`, BFF em `app/api/business-days/[...path]` (repassa GET/POST/PUT/DELETE para
`/business-days/*`; empresa e permissões `BUSINESS_DAY_*` vêm do token) e lógica pura em `lib/business-days.ts`
(testada em `lib/business-days.test.ts`).

| Tela | Rota | O que faz |
|---|---|---|
| Feriados | `holiday_list` / `holiday_edit` | Feriados cadastrados da empresa (os globais são só leitura). |
| Lista de referência | `holiday_reference` | Feriados prontos do ano (`GET /holidays/reference?year=`): data, nome, origem, base legal. Nos **móveis** (Carnaval, Sexta-feira Santa, Corpus Christi) há o marcador "Considerar como feriado" (`PUT /movable-holidays`), a origem do valor (Empresa, Conta, Padrão) e "Voltar a herdar" (`enabled: null`). Exige `BUSINESS_DAY_UPDATE` para alterar; desmarcado aparece esmaecido com "Considerado dia útil". |
| Vai trabalhar | `work_override_list` / `work_override_edit` | Datas concretas em que a empresa trabalha (`/work-overrides`): data, peso opcional (vazio = peso do dia da semana) e motivo. Excecao da conta (tenant) vem com `editable=false` para quem tem empresa. |
| Calendário | `calendar` | Cada feriado mostra nome, selo da origem (Empresa, Conta, Estadual, Nacional, Móvel) e base legal; `worksOnHoliday` aparece como "Feriado trabalhado". |

Pegadinhas: o `PUT /movable-holidays` precisa levar a chave `enabled` mesmo quando `null` (voltar a herdar);
os campos novos do calendário (`holidaySource`, `worksOnHoliday`, `legalBasis`) podem faltar em backend antigo
(`mapDayResponse` assume padrões); a regra "empresa > tenant > padrão" é do backend, o front só exibe.

## Pendências conhecidas

- **PWA**: não feito. `PLAN.md` §5.4 (fase 8), com a regra de `/api/**` network-only.
- **Cookies**: ainda se chamam `sg_admin_*`. Front e admin no mesmo host (portas diferentes) se
  atropelariam — cookie ignora porta. Renomear no `rename.sh` ou antes de subir os dois juntos.
- **Testes de sessão** (`PLAN.md` §7, fase 7): derrubar o access token e provar (a) recuperação
  sozinha, (b) N chamadas concorrentes => **um** refresh, (c) refresh inválido => login.
