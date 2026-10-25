# Passos detalhados

Exemplo usado em todos os passos: tela **Relatorios** no app do cliente, com abrir, gerar e excluir, vendavel
por plano.

## 1. Permissao (migration)

`backend/src/main/resources/db/migration/app/V3010__reports_permissions.sql`:

```sql
-- Audience: 'client' = app do cliente (frontend/); 'platform' = admin da plataforma (admin/).
insert into sg_permissions (name, description, public_id, audience) values
    ('REPORT_READ',     'Relatorios',         gen_random_uuid()::text, 'client'),
    ('REPORT_GENERATE', 'Gerar relatorio',    gen_random_uuid()::text, 'client'),
    ('REPORT_DELETE',   'Excluir relatorio',  gen_random_uuid()::text, 'client')
on conflict (name) do update
set description = excluded.description,
    audience    = excluded.audience;

-- O ADMIN tem todas as permissoes (o responsavel pela conta entra com ADMIN no cadastro).
insert into sg_role_permissions (role_id, permission_id)
select r.id, p.id from sg_roles r cross join sg_permissions p
where r.name = 'ADMIN' and p.name in ('REPORT_READ', 'REPORT_GENERATE', 'REPORT_DELETE')
on conflict do nothing;

-- SO' SE VENDAVEL: os planos que liberam a feature (o trial tem public_id fixo ...0000a2).
-- Sem billing (modulo desligado) as tabelas de plano nao existem: o bloco so' pula.
do $$
begin
    if to_regclass('sg_plan_term_permissions') is null then
        return;
    end if;
    insert into sg_plan_term_permissions (plan_term_id, permission_id)
    select t.id, p.id
    from sg_plan_terms t join sg_plans pl on pl.id = t.plan_id cross join sg_permissions p
    where p.name = 'REPORT_READ'
      and (t.public_id = '00000000-0000-0000-0000-0000000000a2' or pl.code in ('PRO'))
    on conflict do nothing;
end $$;
```

- `name` tem no maximo 30 caracteres.
- No subdomain-tenancy as migrations de `db/migration/app` rodam no banco **master**.
- Referencia viva: `V3002__usage_demo_permission.sql`.

## 2. Endpoint

```java
@POST
@Path("/reports")
@PermissionsAllowed("REPORT_GENERATE")
@SgRequiresPlanFeature("REPORT_READ")         // so' se vendavel: 402 FEATURE_NOT_IN_PLAN quando o plano nao libera
public Report generate(...) { ... }
```

## 3. Menu (`<app>/app/data.ts`)

```ts
{ href: "/reports/report_list", label: "Relatorios", permission: "REPORT_READ" },
```

- Grupo = item com `children`; aparece se tiver ao menos um filho visivel.
- Regra implicita do `Shell`: folha **sem** `permission` aparece **so' para ADMIN**. Prefira sempre declarar a
  permissao.

## 4. Icone (`<app>/app/components/Shell.tsx`)

```ts
const iconByHref = {
  ...
  "/reports/report_list": <FileText size={16} />,   // import { FileText } from "lucide-react"
} as const;
```

## 5. Item ativo nas sub-rotas (`normalizeMenuPath`, mesmo arquivo)

```ts
if (pathname.startsWith("/reports/")) {
  return "/reports/report_list";
}
```

## 6. Editor de perfis

Cliente - `frontend/lib/client-permission-tree.ts` (admin: `admin/lib/permission-tree.ts`, mesmo formato):

```ts
{
  id: "relatorios",                       // id do grupo (usado em NOT_SELLABLE_GROUPS)
  label: "Relatorios",
  screens: [
    {
      id: "relatorios/relatorios",
      label: "Relatorios",
      actions: [
        { permission: "REPORT_READ", label: "Abrir a tela" },      // a PRIMEIRA e' sempre a de abrir
        { permission: "REPORT_GENERATE", label: "Gerar relatorio" },
        { permission: "REPORT_DELETE", label: "Excluir relatorio" },
      ],
    },
  ],
},
```

- A ordem dos grupos segue o menu.
- Cada permissao aparece **uma vez** no catalogo (a arvore usa o publicId como id da folha).

## 7. Vendavel (so' cliente)

- Copiar o arquivo inteiro: `frontend/lib/client-permission-tree.ts` -> `admin/lib/client-permission-tree.ts`.
- O treeview "features liberadas neste plano" mostra todos os grupos do catalogo **menos** os de
  `NOT_SELLABLE_GROUPS` (`admin/app/plans/plan_terms/page.tsx`): hoje `seguranca`, `menu-usuario`.
  Grupo novo nao vendavel -> acrescentar o id ali.
- Sem o `@SgRequiresPlanFeature` no endpoint, liberar ou nao no plano nao muda nada.
