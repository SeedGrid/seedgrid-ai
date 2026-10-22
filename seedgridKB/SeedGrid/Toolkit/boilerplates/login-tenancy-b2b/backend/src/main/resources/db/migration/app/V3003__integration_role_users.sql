-- Exemplo de perfil de INTEGRACAO, para gerar uma API key (admin > Seguranca > API Keys > Nova chave).
--
-- Uma API key sempre aponta para um perfil: quem chama a API com a chave tem exatamente as permissoes
-- dele, nao as de quem criou a chave. Por isso o perfil de integracao deve ser enxuto, so' com o que o
-- sistema externo precisa. Aqui: sincronizar o cadastro de usuarios (consultar, criar e editar). Sem
-- excluir nem trocar senha, de proposito.
--
-- for_integration = true marca o perfil como de uso por sistema (aparece como "Uso para integracao" no
-- editor de perfis). Perfil global (company_id nulo). Ajuste ou remova ao comecar o seu produto.

insert into roles (public_id, name, description, for_integration)
values (gen_random_uuid()::text, 'INTEGRACAO_USUARIOS',
        'Integracao: sincroniza o cadastro de usuarios (consultar, criar e editar)', true)
on conflict (name) where company_id is null do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name in ('USER_READ', 'USER_CREATE', 'USER_UPDATE')
where r.name = 'INTEGRACAO_USUARIOS'
  and r.company_id is null
on conflict do nothing;
