# Checklist - tela nova

## Backend

- [ ] Migration NOVA (nao editar uma aplicada) com as permissoes, `audience` certo (`client` | `platform`), nome
      com ate 30 caracteres.
- [ ] Permissoes vinculadas ao perfil `ADMIN`.
- [ ] Endpoints com `@PermissionsAllowed` por acao.
- [ ] Vendavel: `@SgRequiresPlanFeature` no endpoint + vinculo aos terms (trial e planos) na migration.

## Front (`frontend/` ou `admin/`)

- [ ] Item em `app/data.ts` com `permission`.
- [ ] Icone em `iconByHref` (`app/components/Shell.tsx`).
- [ ] Sub-rotas em `normalizeMenuPath` (mesmo arquivo), se houver.
- [ ] Tela e acoes no catalogo: `frontend/lib/client-permission-tree.ts` ou `admin/lib/permission-tree.ts`.
- [ ] Botoes da pagina checam a propria permissao.
- [ ] Vendavel: `admin/lib/client-permission-tree.ts` identico ao do frontend; grupo nao vendavel em
      `NOT_SELLABLE_GROUPS`.

## Boilerplates

- [ ] Repetido em `login-tenancy` e `subdomain-tenancy` (se a tela for do boilerplate).

## Verificacao

- [ ] `diff` dos dois `client-permission-tree.ts` vazio (ignorando `\r`).
- [ ] `npx tsc --noEmit -p .` no `frontend/` e no `admin/`.
- [ ] Banco recriado (ou migration aplicada) e backend reiniciado.
- [ ] Usuario COM a permissao ve o item; usuario SEM nao ve.
- [ ] Editor de perfis mostra a tela e as acoes; o "olhinho" da lista de perfis lista as permissoes da tela.
- [ ] Vendavel: o treeview do plano mostra a tela; plano sem a feature -> 402 `FEATURE_NOT_IN_PLAN`.
