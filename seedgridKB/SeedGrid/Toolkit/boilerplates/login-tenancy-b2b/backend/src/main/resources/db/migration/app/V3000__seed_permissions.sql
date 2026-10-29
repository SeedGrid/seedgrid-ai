-- Permissoes proprias do host. As tabelas permissions/role_permissions e as permissoes
-- fornecidas pelas extensions sao responsabilidade das respectivas extensions.
-- Cada extension deve criar suas permissoes com audience correto e fazer seus vinculos de role.

insert into sg_permissions (name, description, public_id, audience) values
    ('ACCOUNT_UPDATE',    'Editar conta', gen_random_uuid()::text, 'platform'),
    ('ADMIN_HEALTH_READ', 'Visao Geral', gen_random_uuid()::text, 'platform')
on conflict (name) do update
set description = excluded.description,
    audience    = excluded.audience;

insert into sg_role_permissions (role_id, permission_id)
select (select id from sg_roles where name = 'ADMIN'), p.id
from sg_permissions p
where p.name in ('ACCOUNT_UPDATE', 'ADMIN_HEALTH_READ')
on conflict do nothing;
