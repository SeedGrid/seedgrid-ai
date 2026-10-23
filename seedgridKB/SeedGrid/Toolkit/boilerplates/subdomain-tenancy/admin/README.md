# Admin

Backoffice copiado de `login-tenancy/admin`, com as mesmas versões e lockfile.
O BFF usa o domínio master configurado em `SEEDGRID_TENANCY_DOMAIN` em todas as
chamadas, inclusive login, 2FA e refresh. Não aceita selecionar um banco de cliente.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Abra `http://localhost:3003`. O administrador inicial é criado pela extensão no
banco master, a partir das variáveis `SEEDGRID_SUBDOMAIN_TENANCY_ADMIN_*` do backend.
Troque a senha no primeiro acesso. Cookies de sessão são HttpOnly e exclusivos
deste admin; tokens não são expostos ao navegador.

```bash
pnpm exec tsc --noEmit
pnpm build
```

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
         + Authorization: Bearer <cookie>
         + X-Forwarded-Host: <SEEDGRID_TENANCY_DOMAIN>   (mesmo valor que o `backendFetch` manda)
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

- **Tenant**: o admin atua no dominio master (nao ha subdominio de tenant). O rewrite manda
  `X-Forwarded-Host = SEEDGRID_TENANCY_DOMAIN` (default `localhost`), igual ao `backendFetch`
  (`lib/tenant-host.ts` e' a fonte unica dos dois) e descarta o `X-Forwarded-Host` do navegador. Nao se
  envia `X-Company-Id` (o `backendFetch` o remove). Coberto por `proxy.test.ts`.
- Em **401** (que nao seja `SESSION_REVOKED`/`PASSWORD_CHANGE_REQUIRED`) o `query()` chama
  `POST /api/auth/refresh` (que usa `refreshAdminSessionOnce`, rotaciona o refresh token e regrava os
  cookies `sg_subdomain_admin_*`) e **repete a consulta uma unica vez**; se falhar de novo, lanca
  `ApiClientError`. Sessao revogada nao renova.
- Sem cookie de sessao o proxy responde **401 JSON** (`code: NO_SESSION`), nunca redirect.
- Qualquer metodo que nao seja `QUERY` em `/api/q/**` responde 405: o prefixo nao e' proxy de escrita.
- Nao crie `app/api/q/**`: o proxy atende antes de qualquer rota. Quem **grava, consome cota ou
  publica evento** continua `POST` por uma rota `app/api/**` do BFF.
- Arquivos: `proxy.ts`, `lib/query-proxy.ts` (rewrite), `lib/query.ts` (helper), `lib/tenant-host.ts` (tenant),
  `app/api/auth/refresh/route.ts` (renovacao), `lib/api-base-url.ts` (base da API). Testes: `proxy.test.ts`,
  `lib/query.test.ts` (`npm test`, com o hook `scripts/test-loader.mjs`).
