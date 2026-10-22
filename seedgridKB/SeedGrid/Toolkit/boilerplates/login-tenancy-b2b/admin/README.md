# SeedGrid App Admin Web

Backoffice inicial da plataforma `SeedGrid App`.

## Stack

- Next.js
- React
- TypeScript

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

## Direcao de UI

Este modulo foi preparado para usar os componentes do ecossistema SeedGrid em:

- `https://components.seedgrid.com.br/`

O scaffold inicial deixa a aplicacao pronta para crescer em cima dessa stack.

## Auditoria

A tela de auditoria e os eventos recentes do dashboard usam `/audit-logs` da extensao,
com paginacao e `LOG_READ`. O total vem da mesma consulta e do mesmo escopo; sem permissao,
o contador fica indisponivel. Falha de consulta retorna erro e nao uma lista vazia.
O antigo BFF `/api/admin/audit` foi removido. O historico da tabela antiga permanece no
banco, conforme o [README do backend](../backend/README.md#auditoria-das-operacoes-administrativas).


## AI pricing

As telas de modelos, historico e aprovacao usam os endpoints da extensao
`seedgrid-ai-pricing` pelo BFF existente. Paths, DTOs e permissoes foram preservados;
o admin nao implementa regras de precificacao.


## Cambio

As telas de moedas e cotacoes usam `seedgrid-exchange` pelo BFF existente, com
os mesmos paths, DTOs e permissoes. Regras de busca, retry e edicao ficam na extensao.

## Condições comerciais: empresas e inadimplência

As telas `plans/plan_terms` (condição comercial do plano) e `plans/plan_trial` (trial) editam, além dos
usuários e contadores de uso, os campos do `PlanTerm`:

| Campo | Significado |
|---|---|
| `maxCompanies` | Empresas ativas da conta. Vazio ou 0 = sem limite. |
| `maxReadOnlyCompanies` | Empresas em somente leitura. Vazio ou 0 = sem limite. |
| `pastDueReadOnlyAfterDays` | Dias de atraso para passar a somente leitura. Vazio = padrão da propriedade `seedgrid.billing.past-due.read-only-after-days`; 0 = não aplica o passo. |
| `pastDueDisableAfterDays` | Dias de atraso para desativar. Vazio = padrão da propriedade `seedgrid.billing.past-due.disable-after-days`; 0 = não aplica o passo. |

Validação (inteiros >= 0), mapeamento e rótulos da listagem ficam em `lib/plan-commercial.ts`
(testes: `npm test`). O BFF repassa o corpo sem alterações. `plans/plan_edit` edita só o plano
(nome, alertas), sem condição comercial, e não muda.

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
