-- PLANOS DE DEMONSTRACAO (so' preco e permissoes; sem contador de uso). Cada um mostra um
-- comportamento do billing de proposito; troque pelos planos do SEU produto. Guia: docs/contadores-de-uso.md.
--
-- O boilerplate NAO traz contador de uso (BE-74): os planos abaixo so' tem preco e permissoes. Declare os
-- contadores do SEU dominio em billing/AppUsageMeters.java e semeie a franquia de cada um por plano em
-- sg_plan_term_meters (ou pela tela "Condicoes comerciais"), no formato do exemplo de docs/contadores-de-uso.md.
--
-- PUBLICAR NO STRIPE: term criado por SQL nasce SEM preco no provider. Antes do checkout, abra o plano na
-- tela "Condicoes comerciais" do admin e clique em "Publicar" (cria o preco fixo e um preco de excedente
-- por contador com excedente). Term criado pela tela ja' nasce publicado.
--
-- Idempotente: `on conflict do nothing` em tudo. Depois do primeiro boot, ajuste pelas telas.
--
-- Com o billing DESLIGADO (seedgrid.login-tenancy.modules.billing.enabled=false) as tabelas do billing nao
-- existem: o bloco so' avisa e sai, para o produto sem cobranca subir.

do $$
begin
    if to_regclass('sg_plan_terms') is null then
        raise notice 'V3001: billing desligado (sem sg_plan_terms); planos de demonstracao ignorados.';
        return;
    end if;

    insert into sg_plans (public_id, code, name, description, active)
    values
        (gen_random_uuid()::text, 'BASICO', 'Basico', 'Plano de demonstracao com preco fixo', true),
        (gen_random_uuid()::text, 'PRO', 'Pro', 'Plano de demonstracao de preco maior', true)
    on conflict (code) do nothing;

    -- Um term vigente desde hoje para cada plano (so' se o plano ainda nao tiver nenhum).
    insert into sg_plan_terms (public_id, plan_id, monthly_price, effective_from)
    select gen_random_uuid()::text, p.id, v.price, date_trunc('day', current_timestamp)
    from sg_plans p
    join (values ('BASICO', 49.90), ('PRO', 149.90)) as v(code, price) on v.code = p.code
    where not exists (select 1 from sg_plan_terms t where t.plan_id = p.id);

    -- O acesso e' a INTERSECAO entre a permissao da role e a do plano: term sem permissoes nao libera nada.
    -- Os planos de demonstracao liberam o mesmo que o trial: as permissoes de audience 'client'.
    insert into sg_plan_term_permissions (plan_term_id, permission_id)
    select t.id, perm.id
    from sg_plan_terms t
    join sg_plans p on p.id = t.plan_id
    cross join sg_permissions perm
    where p.code in ('BASICO', 'PRO')
      and perm.audience = 'client'
    on conflict do nothing;
end $$;
