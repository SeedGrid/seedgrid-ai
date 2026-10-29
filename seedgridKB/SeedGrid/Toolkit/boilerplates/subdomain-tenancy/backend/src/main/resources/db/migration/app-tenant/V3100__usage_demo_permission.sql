-- Permissao da tela "Exemplo de consumo" no banco de CADA TENANT.
--
-- A V3002 (db/migration/app) roda so' no master: la' ela alimenta o catalogo de planos do admin
-- ("features liberadas"). Mas o editor de perfis do cliente e o token do usuario leem o banco do
-- tenant — sem a permissao aqui ela nao aparece para marcar no perfil. Roda depois do security
-- (permissions/roles ja existem). Remova junto com o dominio de exemplo ao comecar o seu produto.

insert into sg_permissions (name, description, public_id, audience)
values ('USAGE_DEMO_READ', 'Exemplo de consumo', gen_random_uuid()::text, 'client')
on conflict (name) do update
set description = excluded.description,
    audience    = excluded.audience;

-- O ADMIN (dono da conta, criado no provisionamento) tem todas as permissoes.
insert into sg_role_permissions (role_id, permission_id)
select r.id, p.id
from sg_roles r
cross join sg_permissions p
where r.name = 'ADMIN'
  and p.name = 'USAGE_DEMO_READ'
on conflict do nothing;
