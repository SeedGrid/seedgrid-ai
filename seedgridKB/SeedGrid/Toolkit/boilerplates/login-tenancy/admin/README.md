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
