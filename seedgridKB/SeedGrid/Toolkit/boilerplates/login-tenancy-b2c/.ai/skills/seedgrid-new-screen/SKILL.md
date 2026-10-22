---
name: seedgrid-new-screen
description: Registrar uma tela, menu ou permissao nova no boilerplate SeedGrid (app do cliente `frontend/` ou admin da plataforma `admin/`) sem esquecer nenhum dos lugares que precisam ficar sincronizados - migration da permissao, item de menu, icone, item ativo, catalogo do editor de perfis e, se for vendavel por plano, o treeview de features do admin e o `@SgRequiresPlanFeature`. Use ao criar tela nova, acao nova numa tela existente, permissao nova, ou ao mover/renomear item de menu.
---

# Tela nova no SeedGrid (menu + permissoes)

Hoje menu e catalogo de permissoes sao mantidos **a mao, em varios lugares**. Esta skill existe para nenhum ser
esquecido. (Plano futuro para centralizar: `seedgrid-quarkus-ext-security/docs/refactor-permission-catalog.md`.
Nao executar sem o usuario pedir.)

## Antes de comecar, responda

1. **Qual app?** `frontend/` (cliente final, audience `client`) ou `admin/` (plataforma, audience `platform`).
2. **Quais permissoes?** A de abrir a tela (`XXX_READ`) e uma por acao relevante (`XXX_CREATE`, `XXX_DELETE`...).
   Uma tela pode ter varias.
3. **Onde no menu?** Grupo (pai) e posicao. Ou "nao aparece no menu" (permissao sem tela).
4. **So' no app do cliente: e' vendavel por plano?** Se o plano pode ligar/desligar a funcionalidade.

## Passo a passo

Detalhes e exemplos de codigo de cada passo em `references/steps.md`.

1. **Permissao (backend)** - migration nova em `backend/src/main/resources/db/migration/app/`
   (`V3xxx__<assunto>.sql`, nunca editar uma ja aplicada): `insert into permissions` com o `audience` certo,
   vinculo ao perfil `ADMIN`, e - se vendavel - vinculo aos terms dos planos que a liberam.
2. **Endpoint (backend)** - `@PermissionsAllowed("XXX_READ")` (e por acao). Se vendavel:
   `@SgRequiresPlanFeature("XXX_READ")`.
3. **Menu** - item em `<app>/app/data.ts` (`navItems`) com `href`, `label` e `permission`.
4. **Icone** - entrada no `iconByHref` de `<app>/app/components/Shell.tsx` (sem ela o item fica sem icone).
5. **Item ativo** - se a tela tem sub-rotas (ex.: `_edit`), regra em `normalizeMenuPath` do mesmo `Shell.tsx`.
6. **Editor de perfis** - a tela e as acoes no catalogo do app:
   - cliente: `frontend/lib/client-permission-tree.ts`;
   - admin: `admin/lib/permission-tree.ts`.
   Permissao fora do catalogo **nao aparece** no editor de perfis do cliente (some em silencio).
7. **Se vendavel (so' cliente)** - copiar a mesma entrada para `admin/lib/client-permission-tree.ts` (os dois
   `client-permission-tree.ts` sao **identicos**). Se o grupo novo NAO for vendavel, incluir o id dele em
   `NOT_SELLABLE_GROUPS` (`admin/app/plans/plan_terms/page.tsx`).
8. **Na pagina** - botoes de acao checam a propria permissao (`hasPermission("XXX_DELETE")`). O catalogo so'
   declara a acao para o editor de perfis; nao esconde botao.
9. **Os dois boilerplates** - `login-tenancy` e `subdomain-tenancy` tem os mesmos arquivos. Se a tela e' do
   boilerplate (nao de um produto derivado), repetir nos dois.

## Verificacao

Rodar o checklist de `references/checklist.md` antes de encerrar. No minimo:

```bash
# os dois catalogos do cliente iguais (ignorando fim de linha)
diff <(tr -d '\r' < frontend/lib/client-permission-tree.ts) <(tr -d '\r' < admin/lib/client-permission-tree.ts)
# typecheck dos dois apps
(cd frontend && npx tsc --noEmit -p .) && (cd admin && npx tsc --noEmit -p .)
```

E na tela: o item aparece no menu para quem tem a permissao e some para quem nao tem; o editor de perfis mostra
a tela com as acoes; se vendavel, o treeview "features liberadas neste plano" mostra a tela.
