-- Permissao da tela "Exemplo de consumo" (frontend/app/exemplo-consumo, backend demo/UsageDemoResource.java).
--
-- Com ela a tela entra no catalogo do app do cliente (lib/client-permission-tree.ts): da' para marcar no
-- perfil e, no admin, liberar ou nao por plano ("features liberadas"). Audience 'client': e' funcionalidade
-- do cliente final, nao da plataforma. Remova junto com o dominio de exemplo ao comecar o seu produto.

insert into sg_permissions (name, description, public_id, audience)
values ('USAGE_DEMO_READ', 'Exemplo de consumo', gen_random_uuid()::text, 'client')
on conflict (name) do update
set description = excluded.description,
    audience    = excluded.audience;

-- O ADMIN tem todas as permissoes (inclusive o responsavel pela conta, que entra com ADMIN no cadastro).
insert into sg_role_permissions (role_id, permission_id)
select r.id, p.id
from sg_roles r
cross join sg_permissions p
where r.name = 'ADMIN'
  and p.name = 'USAGE_DEMO_READ'
on conflict do nothing;

-- O endpoint tambem exige a feature NO PLANO (@RequiresPlanFeature): o trial e os planos de demonstracao
-- (V3001) a liberam. Sem billing (modulo desligado) as tabelas de plano nao existem: so' pula.
do $$
begin
    if to_regclass('sg_plan_term_permissions') is null then
        raise notice 'V3002: billing desligado; feature de plano ignorada.';
        return;
    end if;

    insert into sg_plan_term_permissions (plan_term_id, permission_id)
    select t.id, p.id
    from sg_plan_terms t
    join sg_plans pl on pl.id = t.plan_id
    cross join sg_permissions p
    where p.name = 'USAGE_DEMO_READ'
      and (t.public_id = '00000000-0000-0000-0000-0000000000a2' or pl.code in ('BASICO', 'PRO'))
    on conflict do nothing;
end $$;
