-- Perfil de INTEGRACAO de exemplo no banco de CADA TENANT: o cliente gera a propria API key no app dele
-- (Seguranca > API Keys) para um sistema externo sincronizar o cadastro de usuarios da conta.
--
-- Mesmo perfil da V3003 do master, mas aqui ele vale para o tenant: a chave nasce escopada na empresa do
-- tenant e so' enxerga a conta dele. Permissoes: consultar, criar e editar usuarios (sem excluir nem
-- trocar senha, de proposito). Global no banco do tenant (company_id nulo): o tenant tem uma empresa so'.
-- Ajuste ou remova ao comecar o seu produto.

insert into sg_roles (public_id, name, description, for_integration)
values (gen_random_uuid()::text, 'INTEGRACAO_USUARIOS',
        'Integracao: sincroniza o cadastro de usuarios (consultar, criar e editar)', true)
on conflict (name) where company_id is null do nothing;

insert into sg_role_permissions (role_id, permission_id)
select r.id, p.id
from sg_roles r
join sg_permissions p on p.name in ('USER_READ', 'USER_CREATE', 'USER_UPDATE')
where r.name = 'INTEGRACAO_USUARIOS'
  and r.company_id is null
on conflict do nothing;
