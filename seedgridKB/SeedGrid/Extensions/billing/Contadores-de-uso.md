---
tags: [seedgrid, extension, billing, quarkus, contadores, guia]
fonte: java/seedgrid-quarkus-ext-billing; seedgrid-products/seedgrid-report (seedgrid-report-api, usage/)
analisado-em: 2026-11-20
---

# Billing: como criar um contador de uso (passo a passo)

Ver também [[SeedGrid/Extensions/billing/Exemplos|Exemplos]], [[SeedGrid/Extensions/billing/Visao-geral|Visão geral]] e [[SeedGrid/Extensions/billing/Configuracao|Configuração]].

O contador que os boilerplates traziam (`requests`) era **só um exemplo** e saiu deles (decisão do dono, P180.F2.T3, 2026-11-20): um produto novo nem sempre cobra por uso, e quem cobra declara os contadores que fazem sentido para ele. Esta nota é a receita para criar um quando o produto precisar.

## O que é um contador

Um contador mede quanto a conta (empresa) consumiu de algo no ciclo de cobrança. O **billing** guarda o saldo, bloqueia com 402 quando a franquia acaba (se o excedente não é cobrado) e cobra o excedente no Stripe. O **produto** só diz o que mede e em que ponto da regra de negócio consome.

Quem define franquia e preço é o **plano**, não o código: cada term do plano tem uma lista de `meters` com `includedUnits` (franquia do ciclo) e `overagePrice` (preço de cada unidade além da franquia).

| Situação | Comportamento |
|---|---|
| `overagePrice > 0` | a unidade além da franquia é cobrada no meter do Stripe |
| `overagePrice = 0` | esgotar a franquia bloqueia o consumo com 402 |

O **código do contador** (`requests`, `storage-mb`...) é identidade permanente: usa só `[a-z0-9-]`, até 40 caracteres, vai para o banco e para o meter do Stripe (o meter do Stripe se chama `overage_<produto>_<codigo>`) e **nunca é reaproveitado**.

## Passo 1: declarar o contador

Crie um bean `UsageMeterContributor` no host. Vários beans são somados. Fonte: `ReportUsageMeters` do report.

```java
@ApplicationScoped
public class ReportUsageMeters implements UsageMeterContributor {

    public static final String REQUESTS = "requests";

    @Override
    public List<UsageMeterDefinition> meters() {
        return List.of(new UsageMeterDefinition(REQUESTS, "Requisicoes de IA"));
    }
}
```

## Passo 2: consumir no ponto certo

Há três formas. Escolha pela quantidade ser fixa ou só conhecida na hora, e por precisar de extrato.

### A. Por requisição, por anotação (1 unidade por chamada)

Mais simples. Só contabiliza se o método retornar sem erro. `units` é opcional (padrão `1`). Fonte: `ProductController` dos testes de integração do billing.

```java
@POST
@Path("/work")
@SgConsumesUsage(meter = ProductUsageMeters.REQUESTS)
public Map<String, String> work() {
    return Map.of("status", "done");
}
```

### B. Programático, com quantidade conhecida só em runtime

Use `assertCanConsume` antes (recusa com 402 se a conta não pode) e `consume` depois. O terceiro argumento é a quantidade; o último é uma chave que identifica a operação (os exemplos usam `"store-" + UUID` e `"ai-request-" + publicId`).

```java
@POST
@Path("/store")
@Transactional
public Map<String, Object> store(@QueryParam("mb") int mb) {
    Account account = currentAccountResolver.requireCurrentAccount();
    usageService.assertCanConsume(account, ProductUsageMeters.STORAGE, mb);
    usageService.consume(account, ProductUsageMeters.STORAGE, mb, "store-" + UUID.randomUUID());
    return Map.of("storedMb", mb);
}
```

### C. Por requisição com extrato e alertas (o caso do report)

O report cobra uma unidade de `requests` por relatório gerado ou refinado pela IA. Ele **verifica antes** de gastar com o LLM e **consome só se deu certo**, na mesma transação que grava o extrato (uma linha por requisição, em `ai_request_usages`) e os alertas de 50, 80, 90 e 100% do ciclo. Se a transação voltar, consumo e extrato voltam juntos e o excedente não é reportado ao Stripe. Fonte: `ReportUsageService`.

```java
// antes de gastar com o LLM: 402 se a conta não pode consumir
public void assertCanConsume(Account account) {
    usageService.assertCanConsume(account, ReportUsageMeters.REQUESTS, 1);
}

// depois que deu certo, na transação de quem chamou
@Transactional(Transactional.TxType.MANDATORY)
public AiRequestConsumption recordSuccessfulAiRequest(Account account, AiReportRequestEntity request, ...) {
    UsageConsumedEvent consumed = usageService.consume(
            account, ReportUsageMeters.REQUESTS, 1, "ai-request-" + request.getPublicId());
    // consumed.cycle(), balanceBefore(), balanceAfter(), units(), overageUnits(), overageUnitPrice()
    // ... grava a linha do extrato com esses valores e dispara os alertas de limite
}
```

O saldo do ciclo se lê em `BillingCycleMeter` (`usedUnits`, `includedUnits`, `overageUnits`) pelo ciclo e pelo código do contador.

Para guardar detalhe do produto no mesmo instante do consumo, observe o evento (na mesma transação):

```java
void aoConsumir(@Observes UsageConsumedEvent event) {
    // event.meter(), event.units(), event.overageUnits(), event.balanceAfter()
}
```

## Passo 3: dar franquia e preço no plano

No admin, na tela do term do plano (o `MeterQuotaEditor` lista os contadores que o produto declara; sem contadores ele mostra "O produto nao declara contadores de uso"), ou pela API:

```http
POST /admin/plans/{planId}/terms
{ "monthlyPrice": 149.90, "maxUsers": 3,
  "meters": [
    { "meter": "requests",   "includedUnits": 1000, "overagePrice": 0.10 },
    { "meter": "storage-mb", "includedUnits": 500,  "overagePrice": 0 } ] }
```

Um term sem `effectiveFrom` vale desde hoje 00:00 e não pode mais ser editado (409). Agende com `effectiveFrom` para poder ajustar. Detalhes em [[SeedGrid/Extensions/billing/Exemplos|Exemplos]], seção 7.

## Passo 4: o meter do Stripe (como o excedente é cobrado)

Você **não cria o meter à mão no Stripe**: o billing cria ao publicar o term. Fonte: `PlanPublicationService` e `UsageService` (billing-core).

**Pré-requisito:** o produto do Stripe configurado em `seedgrid.billing.stripe.product` (ou `seedgrid.billing.catalog.product-id`) e a chave/webhook do Stripe (configuração mínima em [[SeedGrid/Extensions/billing/Exemplos|Exemplos]], seção 8). Sem o produto, a publicação falha (`ProviderProductNotConfiguredException`): o term fica salvo mas **não publicado**, e a API devolve a mensagem de erro.

**Ao salvar um term com um contador cujo `overagePrice > 0`**, o billing, de forma idempotente por etapa (repetir só cria o que falta):

1. cria o preço mensal do term no Stripe;
2. para cada contador com excedente ainda não publicado, cria um **meter** no Stripe (`ensureMeter`) com:
   - nome: o nome do meter de excedente da configuração + " - " + o rótulo do contador (o `label` do `UsageMeterDefinition`);
   - `event_name`: `overage_<produto>_<codigo>` (exemplo: `overage_prod_x_requests`): um por produto **e** por contador, para nada colidir;
   - fórmula `SUM` sobre o campo `value`, agrupando pelo cliente (`stripe_customer_id`);
3. cria um **preço metered** mensal ligado a esse meter, com o `overagePrice` do contador em centavos, e grava o id no term. Mudar o preço do excedente em um term agendado publica de novo (o preço entra na chave de idempotência).

**Na hora de consumir:** a franquia é controlada pelo próprio billing (`includedUnits`); **só as unidades já excedentes** vão ao Stripe, como evento do meter, **depois do commit** da transação do consumo (cliente = o cliente Stripe da assinatura, chave de idempotência = a que você passou ao `consume`). Se a transação voltar, nada é reportado.

**Quando não cobra (sem erro):** assinatura criada fora do checkout (sem cliente no Stripe) ou produto não configurado: o excedente é contado mas não vai ao Stripe. **Falha ao reportar ao Stripe** é só registrada em log (melhor esforço): no pior caso aquele excedente não é cobrado.

**Checklist para criar um contador novo:** (1) escolher o código (`[a-z0-9-]`, ≤ 40, definitivo); (2) declarar no `UsageMeterContributor`; (3) consumir no ponto de negócio (A, B ou C); (4) dar franquia e `overagePrice` no term do plano; (5) confirmar no Stripe o meter `overage_<produto>_<codigo>` e o preço metered; (6) testar o ciclo: consumir até esgotar a franquia, ver o 402 (preço 0) ou o evento no Stripe (preço > 0).

## Ideias de contadores (modelagem, não existem no código)

Estas são sugestões de como medir, escolhidas pelo que o produto vende. Nenhuma está implementada nos boilerplates.

| O produto vende | Código sugerido | Quando consumir | Forma |
|---|---|---|---|
| Chamadas de IA ou de API | `requests` | a cada chamada que deu certo | A ou C |
| Espaço de arquivos | `storage-mb` | no upload, com o tamanho em MB | B |
| Documentos emitidos (notas, contratos, relatórios) | `documents` | ao emitir com sucesso | A |
| Mensagens (e-mail, WhatsApp, SMS) | `messages` | ao enviar, com a quantidade de destinatários | B |
| Exportações pesadas | `exports` | ao concluir o export (`DONE`) | A |

Regras de ouro: consuma **depois** do sucesso, dentro da mesma transação que grava o resultado; chame `assertCanConsume` **antes** de gastar algo caro (LLM, envio, armazenamento); use uma chave que identifique a operação (como o `publicId` da requisição), como fazem os exemplos; e não renomeie o código de um contador em uso.

## Remover um contador que já foi usado (linhas órfãs)

Fonte: `UsageMeterCatalog`, `PlanTermMetersService`, `BillingResponseMapper` (billing-core).

- **O startup não falha** por causa de linha órfã em `sg_plan_term_meters`: o catálogo só recusa, no startup, um `@SgConsumesUsage` que aponte para contador não declarado.
- **A leitura continua:** um contador não declarado (histórico de um removido) aparece pelo próprio código no lugar do rótulo.
- **Gravar um term que ainda lista o contador removido é recusado** ("Contador de uso nao declarado: ..."): a lista de `meters` enviada **substitui** a do term, então basta reenviar sem o código removido para limpar.
- **Consumir** um contador não declarado falha (`UndeclaredUsageMeterException`), e um term sem aquele contador recusa o consumo (`MeterNotInPlanException`).
- **Stripe:** o meter e o preço metered já publicados continuam no Stripe; arquive no Stripe se quiser. O billing não apaga por você.

Resumo: remover o contador do código é seguro para subir e ler; o que sobra é limpar as linhas dos terms (reenviando-os sem o contador) e o que foi publicado no Stripe.

## Armadilhas

- O código é permanente: trocar o código cria outro contador e deixa o histórico e o meter do Stripe órfãos.
- `overagePrice = 0` bloqueia com 402: avise o usuário na tela, não só no log.
- A permissão e o menu "consumo" do produto não vêm do boilerplate (a página de exemplo foi removida): crie a tela e a permissão do seu produto.
