-- PLANOS DE DEMONSTRACAO dos contadores de uso (billing/AppUsageMeters.java). Cada um mostra um
-- comportamento do billing de proposito; troque pelos planos do SEU produto. Guia: docs/contadores-de-uso.md.
--
--   | Plano  | requests                 | storage-mb               | O que demonstra                          |
--   |--------|--------------------------|--------------------------|------------------------------------------|
--   | Trial  | 20, sem excedente        | FORA do plano            | 402 METER_NOT_IN_PLAN no upload          |
--   | Basico | 100, sem excedente       | 50 MB, sem excedente     | 402 QUOTA_EXCEEDED quando a franquia acaba |
--   | Pro    | 1.000 + R$ 0,10 cada a+  | 500 MB + R$ 0,05 cada a+ | excedente cobrado no Stripe, 1 linha por contador |
--
-- PUBLICAR NO STRIPE: term criado por SQL nasce SEM preco no provider. Antes do checkout, abra o plano na
-- tela "Condicoes comerciais" do admin e clique em "Publicar" (cria o preco fixo e um preco de excedente
-- por contador com excedente). Term criado pela tela ja' nasce publicado.
--
-- Idempotente: `on conflict do nothing` em tudo. Depois do primeiro boot, ajuste pelas telas.
--
-- Roda no banco MASTER, junto com as tabelas do billing (seedgrid.subdomain-tenancy.master.migrations).
-- Com o billing DESLIGADO as tabelas dele nao existem: o bloco so' avisa e sai, para o produto sem
-- cobranca subir.

do $$
begin
    if to_regclass('plan_term_meters') is null then
        raise notice 'V3001: billing desligado (sem plan_term_meters); planos de demonstracao ignorados.';
        return;
    end if;

    -- Trial: so' requisicoes. O term TRIAL e' semeado pelo billing (billing/V505); aqui so' entra a franquia.
    insert into plan_term_meters (public_id, plan_term_id, meter, included_units, overage_price)
    select gen_random_uuid()::text, pt.id, 'requests', 20, 0
    from plan_terms pt
    where pt.public_id = '00000000-0000-0000-0000-0000000000a2'
    on conflict (plan_term_id, meter) do nothing;

    insert into plans (public_id, code, name, description, active)
    values
        (gen_random_uuid()::text, 'BASICO', 'Basico', 'Requisicoes e armazenamento com franquia fixa', true),
        (gen_random_uuid()::text, 'PRO', 'Pro', 'Franquia maior e excedente cobrado por uso', true)
    on conflict (code) do nothing;

    -- Um term vigente desde hoje para cada plano (so' se o plano ainda nao tiver nenhum).
    insert into plan_terms (public_id, plan_id, monthly_price, effective_from)
    select gen_random_uuid()::text, p.id, v.price, date_trunc('day', current_timestamp)
    from plans p
    join (values ('BASICO', 49.90), ('PRO', 149.90)) as v(code, price) on v.code = p.code
    where not exists (select 1 from plan_terms t where t.plan_id = p.id);

    insert into plan_term_meters (public_id, plan_term_id, meter, included_units, overage_price)
    select gen_random_uuid()::text, t.id, v.meter, v.included, v.overage
    from plan_terms t
    join plans p on p.id = t.plan_id
    join (values
            ('BASICO', 'requests', 100, 0.00),
            ('BASICO', 'storage-mb', 50, 0.00),
            ('PRO', 'requests', 1000, 0.10),
            ('PRO', 'storage-mb', 500, 0.05)
         ) as v(code, meter, included, overage) on v.code = p.code
    on conflict (plan_term_id, meter) do nothing;

    -- O acesso e' a INTERSECAO entre a permissao da role e a do plano: term sem permissoes nao libera nada.
    -- Os planos de demonstracao liberam o mesmo que o trial: as permissoes de audience 'client'.
    insert into plan_term_permissions (plan_term_id, permission_id)
    select t.id, perm.id
    from plan_terms t
    join plans p on p.id = t.plan_id
    cross join permissions perm
    where p.code in ('BASICO', 'PRO')
      and perm.audience = 'client'
    on conflict do nothing;
end $$;
