-- Libera para INTEGRACAO as permissoes do perfil de exemplo INTEGRACAO_USUARIOS (Fase 4 do plano de escopo/acesso).
--
-- `sg_permissions.for_integration` nasce `false` para todas (migration V255 do security): um perfil de integracao so'
-- aceita permissoes liberadas pela software house, nunca pelo cliente. A V255 tambem remove dos perfis de integracao
-- os vinculos com permissoes nao liberadas; por isso o vinculo e' refeito aqui (idempotente) depois da liberacao.
--
-- Ajuste ou remova ao comecar o seu produto.

update sg_permissions set for_integration = true
where name in ('USER_READ', 'USER_CREATE', 'USER_UPDATE');

insert into sg_role_permissions (role_id, permission_id)
select r.id, p.id
from sg_roles r
join sg_permissions p on p.name in ('USER_READ', 'USER_CREATE', 'USER_UPDATE')
where r.name = 'INTEGRACAO_USUARIOS'
  and r.company_id is null
on conflict do nothing;
