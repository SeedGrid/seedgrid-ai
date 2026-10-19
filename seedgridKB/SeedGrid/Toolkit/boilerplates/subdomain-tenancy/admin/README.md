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
