# Frontend

App do cliente copiado de `login-tenancy/frontend`, preservando versões e lockfile.
O domínio identifica o tenant; o BFF o valida e encaminha em `X-Forwarded-Host`.
Cookies HttpOnly ficam no host do cliente, sem compartilhamento entre subdomínios.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Cadastre a empresa em `http://localhost:3002/auth/signup`, incluindo seu subdomínio.
Confirme o código recebido por e-mail. Após o provisionamento, acesse
`http://cliente.localhost:3002/login` (substitua `cliente` pelo nome cadastrado).
Caso o navegador não resolva `*.localhost`, adicione o host do cliente ao arquivo
hosts apontando para `127.0.0.1`.

No deploy, configure `SEEDGRID_TENANCY_DOMAIN` com o mesmo sufixo do backend e faça
o proxy preservar o `Host` original. O BFF ignora `X-Forwarded-Host` enviado pelo navegador.

```bash
pnpm exec tsc --noEmit
pnpm build
```

## Seletor de empresa

Usuário com mais de uma empresa precisa escolher qual usar. O contrato vem do `ext-security`
(`AuthResponseDTO`): `companySelectionRequired` (`true` quando há mais de uma empresa e nenhuma foi
escolhida) e `currentCompany { publicId, name, accessMode, personType }`.

- **Login** (senha e 2FA): o BFF grava a sessão e, se `companySelectionRequired`, também o cookie
  `sg_subdomain_client_company_selection_pending`. O `proxy.ts` prende o usuário em `/auth/select-company`
  até a escolha; `lib/company-selection.ts#resolvePostLoginPath` decide o destino (seleção, depois troca
  obrigatória de senha, depois `/`). As chamadas seguem o tenant do subdomínio (`backendFetch`).
- **Tela**: `app/components/CompanySelect.tsx` lista `GET /api/me/companies` (nome, PJ/PF se houver, selo do
  `accessMode`), trava as `DISABLED` com a explicação, aceita `READ_ONLY` (com aviso) e chama
  `POST /api/me/select-company`, que regrava o token escopado e apaga o cookie pendente.
- **Trocar depois de logado**: `CompanyAccessBar` (combo "Empresa"), visível só com mais de uma empresa. Falha
  de troca (ex.: `COMPANY_DISABLED`) vira toast e **não** derruba a sessão.
- Lógica pura e testada em `lib/company-selection.ts`; BFF em `app/api/me/select-company`.

## Consultas com corpo (QUERY)

Consulta que precisa de corpo (filtro grande demais para a URL) usa o metodo HTTP **`QUERY`**, nao
`POST`: e' metodo seguro e passa mesmo com a empresa em modo somente leitura. O backend a declara
com `@QUERY` (`seedgrid-quarkus-lib-commons`). Route Handler do Next responde 400 a `QUERY`, entao o
caminho e' o `proxy.ts`:

```
browser  QUERY /api/q/<caminho-do-backend>?<qs>     (cookie de sessao, corpo JSON; Host = <tenant>.<dominio>)
proxy.ts rewrite -> <SEEDGRID_APP_API_BASE_URL>/<caminho-do-backend>?<qs>
         + Authorization: Bearer <cookie>
         + X-Forwarded-Host: <tenant>.<dominio>   (mesmo valor que o `backendFetch` manda)
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

- **Tenant**: o backend resolve o tenant pelo `X-Forwarded-Host`. O rewrite nao passa pelo `backendFetch`,
  entao `lib/query-proxy.ts` o calcula do `Host` com a mesma regra do BFF (`lib/tenant-host.ts`, usada tambem
  por `lib/backend-fetch.ts`) e **descarta** o `X-Forwarded-Host` vindo do navegador. Host fora do dominio,
  subdominio invalido ou dominio master sem tenant: `400` (`QUERY_INVALID_HOST` / `QUERY_TENANT_REQUIRED`),
  como o `backendFetch` que recusa os mesmos casos. Nao se envia `X-Company-Id` (o `backendFetch` o remove).
  Provado em `lib/query-proxy.test.ts` (rewrite x `backendFetch` com o mesmo Host) e `proxy.test.ts`.
- Em **401** (que nao seja `SESSION_REVOKED`/`PASSWORD_CHANGE_REQUIRED`) o `query()` chama
  `POST /api/auth/refresh` (que usa `refreshAdminSessionOnce`, rotaciona o refresh token e regrava os
  cookies `sg_subdomain_client_*`) e **repete a consulta uma unica vez**; se falhar de novo, lanca
  `ApiClientError`. Sessao revogada nao renova.
- Sem cookie de sessao o proxy responde **401 JSON** (`code: NO_SESSION`), nunca redirect (nem para `/auth/select-company`).
- Qualquer metodo que nao seja `QUERY` em `/api/q/**` responde 405: o prefixo nao e' proxy de escrita.
- Nao crie `app/api/q/**`: o proxy atende antes de qualquer rota. Quem **grava, consome cota ou
  publica evento** continua `POST` por uma rota `app/api/**` do BFF.
- Arquivos: `proxy.ts`, `lib/query-proxy.ts` (rewrite), `lib/query.ts` (helper), `lib/tenant-host.ts` (tenant),
  `app/api/auth/refresh/route.ts` (renovacao), `lib/api-base-url.ts` (base da API). Testes: `proxy.test.ts`,
  `lib/query.test.ts`, `lib/query-proxy.test.ts`, `app/api/auth/refresh/refresh-bff.test.ts`.

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
