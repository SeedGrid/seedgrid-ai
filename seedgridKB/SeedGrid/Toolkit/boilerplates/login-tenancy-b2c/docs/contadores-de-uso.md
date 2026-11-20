# Contadores de uso: como cobrar por uso

Um **contador de uso** é o que o produto cobra por consumo: requisições, MB armazenados, notas emitidas,
relatórios gerados. Este boilerplate **não declara contador nenhum** (regra BE-74): o produto declara só os do **seu**
domínio. Os exemplos deste guia (`requests`, `storage-mb`) são ilustrativos e não existem no código.

| | O produto (este boilerplate) | O `seedgrid-billing` |
|---|---|---|
| Quais contadores existem | **declara** (`AppUsageMeters`) | junta e valida no startup |
| O que é 1 unidade e quando contar | **conta** (`@SgConsumesUsage` ou `UsageService.consume`) | — |
| Franquia e preço do excedente de cada contador, por plano | — | guarda (`meters` do term) |
| Saldo do ciclo, bloqueio 402, excedente no Stripe | — | faz tudo |

Nada disso é configuração: franquia e excedente são condição comercial **do plano**, editada nas telas do
admin.

## O que vem pronto

`AppUsageMeters` devolve lista vazia: o produto novo cobra só a assinatura, e as telas de trial, condições
comerciais e termos do plano não mostram bloco de uso. Os planos de demonstração (`V3001`) têm só preço e
permissões. Billing, trial e planos funcionam sem contador declarado (coberto por teste).

> Os termos de Básico e Pro são criados por SQL, então **nascem sem preço no Stripe**. Antes do primeiro
> checkout, abra cada plano em **Comercial > Planos > Condições comerciais** e clique em **Publicar**. Um
> termo criado pela tela já nasce publicado.

### Produto já gerado de uma versão anterior do boilerplate

Versões antigas semeavam o contador `requests`, a permissão `USAGE_DEMO_READ` e o `UsageDemoResource`.
Migration de produto só **acrescenta** (BE-73): não edite a `V3001`/`V3002` já aplicadas. Apague o
`UsageDemoResource` e crie uma migration nova (próximo número livre de `db/migration/app/`) que remove a
permissão:

```sql
delete from sg_plan_term_permissions
 where permission_id in (select id from sg_permissions where name = 'USAGE_DEMO_READ');
delete from sg_role_permissions
 where permission_id in (select id from sg_permissions where name = 'USAGE_DEMO_READ');
delete from sg_permissions where name = 'USAGE_DEMO_READ';
```

No `subdomain-tenancy`, repita o `delete` de `sg_role_permissions` e `sg_permissions` numa migration de
`db/migration/app-tenant/` (o banco de cada tenant). Se o seu produto não usa o contador `requests`, remova também a
linha dele de `sg_plan_term_meters` (`where meter = 'requests'`) e da lista de `AppUsageMeters`.

## Passo a passo para o seu produto

### 1. Declare os contadores

[`backend/.../billing/AppUsageMeters.java`](../backend/src/main/java/br/com/seedgrid/app/api/billing/AppUsageMeters.java):

```java
@ApplicationScoped
public class AppUsageMeters implements UsageMeterContributor {
    public static final String REQUESTS = "requests";
    public static final String STORAGE_MB = "storage-mb";

    @Override
    public List<UsageMeterDefinition> meters() {
        return List.of(
                new UsageMeterDefinition(REQUESTS, "Requisicoes"),
                new UsageMeterDefinition(STORAGE_MB, "MB armazenados"));
    }
}
```

- **Código** (`[a-z0-9-]`, até 40 caracteres): é a identidade do contador **para sempre**. Vai para o banco
  (`plan_term_meters`, `billing_cycle_meters`), para o `@SgConsumesUsage` e para o nome do meter no Stripe
  (`overage_<produto>_<código>`). Não reaproveite o código de um contador removido para outro significado,
  porque isso misturaria o histórico de cobrança dos dois.
- **Label**: o nome nas telas e nas mensagens de erro ("Seu plano não inclui MB armazenados").
- Código inválido, repetido ou sem label **derruba o startup**.

### 2. Conte

Quando **uma chamada vale uma quantidade fixa**, anote o método
(exemplo ilustrativo):

```java
@POST
@Path("/requests")
@SgConsumesUsage(meter = AppUsageMeters.REQUESTS)   // units = 1 por padrão; units = 5 se valer 5
public Map<String, Object> request() { ... }
```

- O `meter` é **obrigatório**: esquecer não compila.
- Um código que nenhum `UsageMeterContributor` declara (ex.: `"reqeusts"`) **derruba o startup**, com o
  método na mensagem. O erro aparece no primeiro `run.sh`, não na requisição de um cliente.
- A anotação vale no método ou na classe (todos os métodos da classe).

Quando **a quantidade só se conhece em runtime**, conte pelo código:

```java
Account account = currentAccountResolver.requireCurrentAccount();
usageService.assertCanConsume(account, AppUsageMeters.STORAGE_MB, mb);    // 402 se não puder
// ... grava o arquivo ...
usageService.consume(account, AppUsageMeters.STORAGE_MB, mb, "upload-" + fileId);
```

Nas duas formas, o billing:

1. checa **antes**: sem assinatura, trial vencido, pagamento pendente, contador fora do plano ou franquia
   esgotada (num plano sem excedente dele) dá 402, e o trabalho nem roda;
2. contabiliza **depois**, só se o método retornou, **dentro da transação** dele (um rollback desfaz o
   consumo);
3. reporta o excedente ao Stripe **depois do commit**, no meter do contador, com a chave idempotente.

Para guardar o detalhe de cada consumo (ex.: uma linha por chamada de IA, ligada ao ciclo), observe o
`UsageConsumedEvent` com `@Observes`. Ele é disparado dentro da mesma transação e traz o `meter`, as unidades
e quanto virou excedente.

### 3. Defina a franquia e o excedente por plano

Em **Comercial > Planos > Condições comerciais**, cada condição tem uma linha por contador declarado:

- **incluído no plano**: desligado significa fora do plano (402 `METER_NOT_IN_PLAN` ao consumir);
- **franquia**: unidades por ciclo;
- **excedente**: preço de cada unidade além da franquia. `0` = sem excedente: esgotou, bloqueia.

Ao salvar, o billing publica no Stripe o preço fixo e **um preço de excedente por contador com excedente**.
Na troca de plano, a assinatura no Stripe fica com exatamente os itens de uso do plano novo: o do mesmo
contador é trocado, o novo entra e o que o plano novo não cobra sai.

A cota do trial fica em **Comercial > Trial**. O trial não tem excedente.

Pela API, o mesmo vai em `meters`:

```json
POST /admin/plans/{planId}/terms
{
  "monthlyPrice": 149.90,
  "meters": [
    { "meter": "requests",   "includedUnits": 1000, "overagePrice": 0.10 },
    { "meter": "storage-mb", "includedUnits": 500,  "overagePrice": 0.05 }
  ]
}
```

Um contador que o produto não declara é recusado com 400 `INVALID_PLAN_TERM_METER`.

### 4. Mostre o consumo

`GET /me/usage` traz:

- `billingCycle.meters[]`: o saldo de cada contador (incluído, consumido, excedente, restante, e se o plano
  cobra excedente dele). A tela de assinatura desenha uma barra por contador (`MeterUsageBar`).
- `meterAccess.<contador>`: se 1 unidade passaria agora, com o mesmo `code` do 402 que o consumo daria. A
  tela explica o bloqueio **antes** de o cliente tentar.
- `access`: se a **assinatura** permite consumir. Vale para todos os contadores; uma franquia esgotada não
  aparece aqui, só no `meterAccess` do contador.

| `code` do 402 | Quando |
|---|---|
| `NO_ACTIVE_SUBSCRIPTION` / `TRIAL_EXPIRED` | a conta não tem assinatura vigente |
| `PAYMENT_PAST_DUE` | pagamento pendente |
| `METER_NOT_IN_PLAN` | o plano não inclui o contador (`meter` e `label` no corpo) |
| `QUOTA_EXCEEDED` / `TRIAL_QUOTA_EXCEEDED` | franquia do contador esgotada num plano sem excedente dele (`meter` e `label` no corpo) |

### 5. Sem contadores

Se o produto não conta nada, deixe `AppUsageMeters.meters()` vazio. Não há exemplo para remover: o
boilerplate não traz contador, recurso de demonstração nem permissão `USAGE_DEMO_*`.

## Onde está cada coisa

| | |
|---|---|
| Declaração dos contadores | `backend/src/main/java/br/com/seedgrid/app/api/billing/AppUsageMeters.java` |
| Planos de demonstração (preço e permissões, sem contador) | `backend/src/main/resources/db/migration/app/V3001__seed_usage_meter_plans.sql` |
| Editor de franquia/excedente (admin) | `admin/app/components/MeterQuotaEditor.tsx`, `admin/lib/usage-meters.ts` |
| Telas do admin | `admin/app/plans/plan_terms`, `plan_trial`, `accounts` (concessão por contador), `billing`, `subscriptions` |
| Barras de consumo (cliente) | `frontend/app/components/MeterUsageBar.tsx`, `frontend/app/assinatura` |
| A extensão | `seedgrid-quarkus-ext-billing`, plano em `seedgrid-platform-work/planos/billing/2026-10-02-contadores-de-uso-declarados-pelo-host.md` |
