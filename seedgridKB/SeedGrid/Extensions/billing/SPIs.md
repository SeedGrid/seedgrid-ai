---
tags: [seedgrid, extension, billing, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-billing
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# billing (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/billing/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-billing` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#AccountCompaniesGateway]] | `CompanyAccountCompaniesGateway` | A conta e' de uma `Company` da security no mesmo banco (`Account.companyId`). "Suas empresas" = essa empresa mais as demais empresas dos usuarios que sao membros dela, sem a empresa da plataforma e sem os usuarios que tambem pertencem a plataforma (o admin da plataforma nao une todas as contas): a MESMA definicao de conta do `CompanyAccessService`. |
| [[#AccountMembersGateway]] | `CompanyAccountMembersGateway` | A conta e' de uma `Company` da security no mesmo banco (`Account.companyId`). Vaga = membership ativa de usuario ativo, a mesma regra da cota da security. |
| [[#BillingAccountScope]] | `UnrestrictedBillingAccountScope` | Sem restricao: quem passa no `@SgPlatformScope` ve todas as contas. |
| [[#BillingCatalogProvider]] | sem padrão | Precisa de implementação do host. |
| [[#BillingEventHandler]] | `SubscriptionBillingEventHandler` | Handler padrao do webhook: mantem as assinaturas em dia com o provider sem nenhum codigo no host. Notificacao e' do host, pelos `SubscriptionLifecycleEvent`. |
| [[#BillingProvider]] | sem padrão | Precisa de implementação do host. |
| [[#BillingUsageProvider]] | sem padrão | Precisa de implementação do host. |
| [[#CurrentAccountResolver]] | `DefaultCurrentAccountResolver` | Usuario autenticado (security) + empresa corrente resolvida pelo `CompanyContextFilter` (claim `companyId` do token ou, sem escopo, a unica empresa ativa do usuario). |
| [[#PlanTermAdditionalFieldsValidator]] | `DefaultPlanTermAdditionalFieldsValidator` | Sem regras de produto: aceita qualquer mapa que passe nos limites da extension. |
| [[#PlanTermUsageChecker]] | `DefaultPlanTermUsageChecker` | Nenhum uso alem das assinaturas. |
| [[#UsageMeterContributor]] | sem padrão | Precisa de implementação do host. |

## AccountCompaniesGateway

As empresas de uma conta de billing, no banco onde elas moram. E' por aqui que o limite de empresas do plano (`maxCompanies`, `maxReadOnlyCompanies`) e o ciclo de inadimplencia leem e mudam o estado de acesso (`CompanyAccessMode`) de cada empresa. No molde do `AccountMembersGateway`.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `CompanyAccountCompaniesGateway` — A conta e' de uma `Company` da security no mesmo banco (`Account.companyId`). "Suas empresas" = essa empresa mais as demais empresas dos usuarios que sao membros dela, sem a empresa da plataforma e sem os usuarios que tambem pertencem a plataforma (o admin da plataforma nao une todas as contas): a MESMA definicao de conta do `CompanyAccessService`.

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainAccountCompaniesGateway` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainAccountCompaniesGateway.java`) — As empresas de uma conta, no subdomain-tenancy, moram no banco DO TENANT (o billing mora no master): o banco do tenant inteiro e' a conta.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `List<AccountCompany> companies(Account account)` | Todas as empresas da conta, a da plataforma incluida (marcada em `platform`) se fizer parte dela. |
| `void setMode(Account account, String companyPublicId, CompanyAccessMode mode, String reason)` | Muda o estado de acesso da empresa SO' desta conta (`CompanyAccessService.setMode`: revoga as sessoes da empresa, audita e dispara o evento da security). |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `Set<String> disableBlockedPublicIds(Account account)` | Empresas (publicIds) que NAO podem ser desligadas sem violar a invariante "minimo 1 ADMIN ativo" (decisao do `LastAdminGuard` da security). O default devolve vazio. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuAccountCompaniesGateway implements AccountCompaniesGateway {
    @Override
    public List<AccountCompany> companies(Account account) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void setMode(Account account, String companyPublicId, CompanyAccessMode mode, String reason) {
        // implemente
    }
}
```

## AccountMembersGateway

Os usuarios de uma conta de billing, no banco onde eles moram. E' por aqui que o limite de usuarios do plano (`maxUsers`) conta quem ocupa vaga e tira o acesso de quem foi escolhido. O default usa a security do MESMO banco do billing (login-tenancy: a conta e' de uma `Company`).

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `CompanyAccountMembersGateway` — A conta e' de uma `Company` da security no mesmo banco (`Account.companyId`). Vaga = membership ativa de usuario ativo, a mesma regra da cota da security.

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainAccountMembersGateway` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainAccountMembersGateway.java`) — Os usuarios de uma conta, no subdomain-tenancy, moram no banco DO TENANT (o billing mora no master). Cada operacao troca o contexto para o tenant da conta e roda em transacao propria, com sessao aberta ja' no banco certo, inclusive quando a chamada vem do webhook (host do master).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `List<User> activeUsers(Account account)` | Quem ocupa vaga na conta: usuario ativo com acesso ativo a ela. Inclui o responsavel. |
| `boolean isResponsible(Account account, User user)` | O responsavel pela conta: ocupa vaga e nunca pode ser escolhido para perder acesso. |
| `void deactivate(Account account, String userPublicId, String reason)` | Tira o acesso do usuario SO' a esta conta (nas outras que ele participa, segue normal). |
| `List<User> findByPublicIds(Account account, List<String> userPublicIds)` | Usuarios pelos publicIds; os que nao existem mais sao ignorados. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `Optional<Set<String>> activeAdminPublicIds(Account account)` | PublicIds dos usuarios ATIVOS da conta que sao ADMIN (role de sistema ADMIN, global e ativa, pelo vinculo ou pelo baseline global). So' e' consultado quando a conta NAO tem `companyId` (o `LastAdminGuard` da security precisa de uma empresa): e' o que permite ao billing nunca eliminar o ultimo ADMIN. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuAccountMembersGateway implements AccountMembersGateway {
    @Override
    public List<User> activeUsers(Account account) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public boolean isResponsible(Account account, User user) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void deactivate(Account account, String userPublicId, String reason) {
        // implemente
    }

    @Override
    public List<User> findByPublicIds(Account account, List<String> userPublicIds) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## BillingAccountScope

Implementado pelo host para restringir as contas que o usuario logado enxerga nas telas administrativas (`/admin/accounts`, `/admin/subscriptions` e os agregados de `/admin/billing/overview`). Ex.: o operador de um parceiro (revenda) e' usuario da plataforma, mas so' ve as empresas do parceiro dele. O default nao restringe nada.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `UnrestrictedBillingAccountScope` — Sem restricao: quem passa no `@SgPlatformScope` ve todas as contas.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `Optional<Set<Long>> visibleCompanyIds()` | Empresas (`company_id` da conta) visiveis; `Optional.empty()` = sem restricao. |

**Exemplo de implementação:**

```java
@RequestScoped
public class PorParceiroBillingAccountScope implements BillingAccountScope {

    @Inject
    ParceiroLogado parceiro; // quem e' o operador logado no seu produto

    @Override
    public Optional<Set<Long>> visibleCompanyIds() {
        if (parceiro.isOperadorDaPlataforma()) {
            return Optional.empty(); // sem restricao
        }
        return Optional.of(parceiro.idsDasEmpresas()); // so as empresas do parceiro
    }
}
```

## BillingCatalogProvider

Capacidade OPCIONAL de gestão de catálogo (produtos/preços) no provider. É uma interface separada do `BillingProvider` de propósito: nem todo provider gerencia catálogo, então quem não suporta simplesmente não a implementa (sem stubs). O host descobre a capacidade via `instanceof`/`BillingService.catalog()` e mantém-se agnóstico — programa contra estas interfaces, nunca contra a classe concreta do provider.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `StripeBillingProvider` (`seedgrid-quarkus-ext-billing/seedgrid-billing-stripe/runtime/src/main/java/br/com/seedgrid/billing/stripe/spis/impl/StripeBillingProvider.java`) — Implementação do BillingProvider para Stripe. Implementa também as capacidades opcionais de catálogo (produtos/preços) e de uso (meters), para o host gerenciar tudo pelo sistema.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String createProduct(CreateProductRequest request)` | Cria um produto e retorna seu id. |
| `String ensureProduct(String productId, String name)` | Garante (idempotente) que existe um produto com o `productId` informado: se já existir, retorna; senão cria com esse id e nome. Usado no bootstrap para o host não precisar criar o produto manualmente no provider. |
| `ProductInfo getProduct(String productId)` | Lê um produto pelo id. |
| `String createPrice(CreatePriceRequest request)` | Cria um preço recorrente de valor fixo e retorna seu id. |
| `void archivePrice(String priceId)` | Arquiva um preço (active=false): impede NOVAS vendas; assinaturas atuais seguem. |
| `void setPriceActive(String priceId, boolean active)` | Liga/desliga um preço para novas vendas. |
| `PriceInfo getPrice(String priceId)` | Lê um preço pelo id (para validar valor/estado). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuBillingCatalogProvider implements BillingCatalogProvider {
    @Override
    public String createProduct(CreateProductRequest request) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String ensureProduct(String productId, String name) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public ProductInfo getProduct(String productId) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String createPrice(CreatePriceRequest request) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void archivePrice(String priceId) {
        // implemente
    }

    @Override
    public void setPriceActive(String priceId, boolean active) {
        // implemente
    }

    @Override
    public PriceInfo getPrice(String priceId) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## BillingEventHandler

SPI que o host/aplicação deve implementar para processar eventos de billing. O core apenas entrega o evento canônico normalizado. O handler decide o que fazer (provisionar tenant, enviar email, etc).

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `SubscriptionBillingEventHandler` — Handler padrao do webhook: mantem as assinaturas em dia com o provider sem nenhum codigo no host. Notificacao e' do host, pelos `SubscriptionLifecycleEvent`.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void handle(BillingEvent event)` | Processa um evento de billing normalizado. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuBillingEventHandler implements BillingEventHandler {

    @Override
    public void handle(BillingEvent event) {
        switch (event.type()) {
            case PAYMENT_CONFIRMED -> liberarAcesso(event.reference());
            case PAYMENT_FAILED -> avisarFalhaDePagamento(event.reference());
            case SUBSCRIPTION_CANCELED -> encerrarAcesso(event.reference());
            default -> { /* os demais tipos nao interessam a este produto */ }
        }
    }
}
```

## BillingProvider

SPI principal que cada provider de billing deve implementar. Responsabilidades: - Checkout/Portal: iniciar fluxos no provider e retornar URL - Webhook: validar assinatura/autenticidade + traduzir para evento canônico

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `StripeBillingProvider` (`seedgrid-quarkus-ext-billing/seedgrid-billing-stripe/runtime/src/main/java/br/com/seedgrid/billing/stripe/spis/impl/StripeBillingProvider.java`) — Implementação do BillingProvider para Stripe. Implementa também as capacidades opcionais de catálogo (produtos/preços) e de uso (meters), para o host gerenciar tudo pelo sistema.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String providerId()` | Identificador único do provider (ex: "stripe", "pagseguro"). |
| `CheckoutResponse createCheckout(CheckoutRequest req)` | Cria uma sessão de checkout e retorna a URL de redirecionamento. |
| `PortalResponse createPortal(PortalRequest req)` | Cria uma sessão de customer portal e retorna a URL. |
| `BillingEvent parseAndVerifyWebhook(RawWebhookRequest req) throws InvalidWebhookException, UnsupportedEventException` | Valida e parseia um webhook bruto, traduzindo para evento canônico. |
| `void changeSubscriptionPlan(String subscriptionId, String newPriceId, List<String> newMeteredPriceIds)` | Troca o plano de uma assinatura EXISTENTE para outro preço (upgrade ou downgrade), atualizando a assinatura no provider com rateio (proration) — NÃO cria uma nova assinatura. Use isto para mudanças de plano; o checkout é só para a 1ª assinatura. |
| `void scheduleSubscriptionPlanChangeAtPeriodEnd( String subscriptionId, String newPriceId, List<String> newMeteredPriceIds)` | Agenda a troca de preço da assinatura para o FIM do período vigente (sem rateio): o cliente continua no preço atual até o fim do ciclo já pago e só então passa para o novo. Usado para downgrades (o cliente não perde a cota que já pagou no ciclo corrente). |
| `void cancelScheduledPlanChange(String subscriptionId)` | Cancela uma troca de plano AGENDADA (ex.: downgrade marcado para o fim do ciclo), mantendo a assinatura no plano atual. Idempotente: se não houver troca agendada, não faz nada. |
| `void cancelSubscription(String subscriptionId)` | Cancela uma assinatura ao FIM do período vigente (o cliente mantém acesso até lá). |
| `void cancelSubscriptionImmediately(String subscriptionId)` | Cancela uma assinatura IMEDIATAMENTE (encerra agora, sem esperar o fim do período). Use ao SUBSTITUIR uma assinatura por outra (ex.: o tenant trocou de assinatura e a anterior precisa parar de cobrar na hora) — diferente de `cancelSubscription(String)`, que agenda o cancelamento para o fim do ciclo. |
| `void reactivateSubscription(String subscriptionId)` | Reverte um cancelamento agendado: a assinatura volta a renovar normalmente (no Stripe, `cancel_at_period_end = false`). Só faz sentido enquanto a assinatura ainda está vigente (antes do fim do período). |
| `void pauseSubscription(String subscriptionId)` | Pausa a cobrança de uma assinatura (não gera novas cobranças enquanto pausada). |
| `void resumeSubscription(String subscriptionId)` | Retoma uma assinatura previamente pausada. |
| `List<InvoiceSummary> listInvoices(String customerId, int limit)` | Lista as faturas/cobranças de um cliente, mais recentes primeiro. |
| `UpcomingInvoice getUpcomingInvoice(String customerId, String subscriptionId)` | Prévia da PRÓXIMA fatura de uma assinatura (Stripe upcoming invoice). Inclui o preço fixo do próximo ciclo + o excedente metered acumulado até agora. |
| `ProviderSubscription getSubscription(String subscriptionId)` | Estado atual da assinatura no provider (status, fim do período, cancel_at_period_end, itens). Para reconciliar o estado local com a verdade do provider. |
| `List<ProviderSubscription> findActiveSubscriptionsByEmail(String email)` | Lista as assinaturas ATIVAS de todos os clientes com o `email` informado. Serve para RECONCILIAR quando o webhook falhou e a assinatura existe no provider sem registro local — o email (usado no checkout) é o único elo. |
| `ProrationPreview previewPlanChange(String subscriptionId, String newPriceId, List<String> newMeteredPriceIds)` | Prévia do rateio (proration) de uma troca de plano aplicada AGORA: quanto o cliente pagaria neste instante. Não altera a assinatura — só simula. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuBillingProvider implements BillingProvider {
    @Override
    public String providerId() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public CheckoutResponse createCheckout(CheckoutRequest req) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public PortalResponse createPortal(PortalRequest req) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public BillingEvent parseAndVerifyWebhook(RawWebhookRequest req) throws InvalidWebhookException, UnsupportedEventException {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void changeSubscriptionPlan(String subscriptionId, String newPriceId, List<String> newMeteredPriceIds) {
        // implemente
    }

    @Override
    public void scheduleSubscriptionPlanChangeAtPeriodEnd( String subscriptionId, String newPriceId, List<String> newMeteredPriceIds) {
        // implemente
    }

    @Override
    public void cancelScheduledPlanChange(String subscriptionId) {
        // implemente
    }

    @Override
    public void cancelSubscription(String subscriptionId) {
        // implemente
    }

    @Override
    public void cancelSubscriptionImmediately(String subscriptionId) {
        // implemente
    }

    @Override
    public void reactivateSubscription(String subscriptionId) {
        // implemente
    }

    @Override
    public void pauseSubscription(String subscriptionId) {
        // implemente
    }

    @Override
    public void resumeSubscription(String subscriptionId) {
        // implemente
    }

    @Override
    public List<InvoiceSummary> listInvoices(String customerId, int limit) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public UpcomingInvoice getUpcomingInvoice(String customerId, String subscriptionId) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public ProviderSubscription getSubscription(String subscriptionId) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public List<ProviderSubscription> findActiveSubscriptionsByEmail(String email) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public ProrationPreview previewPlanChange(String subscriptionId, String newPriceId, List<String> newMeteredPriceIds) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## BillingUsageProvider

Capacidade OPCIONAL de cobrança por uso (meters/metered prices) no provider. Separada do `BillingProvider` pelo mesmo motivo do `BillingCatalogProvider`: cobrança por uso é uma capacidade que nem todo provider tem. Permite o modelo "Stripe calcula o excedente": cria-se um meter + um preço metered, e o runtime reporta uso via `reportUsage(UsageEventRequest)` a cada transação; o provider fatura no fim do ciclo.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `StripeBillingProvider` (`seedgrid-quarkus-ext-billing/seedgrid-billing-stripe/runtime/src/main/java/br/com/seedgrid/billing/stripe/spis/impl/StripeBillingProvider.java`) — Implementação do BillingProvider para Stripe. Implementa também as capacidades opcionais de catálogo (produtos/preços) e de uso (meters), para o host gerenciar tudo pelo sistema.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String createMeter(CreateMeterRequest request)` | Cria um meter (medidor de uso) e retorna seu id. |
| `void deactivateMeter(String meterId)` | Desativa um meter (para de aceitar eventos novos). |
| `MeterInfo getMeter(String meterId)` | Lê um meter pelo id. |
| `MeterInfo findMeterByEventName(String eventName)` | Acha um meter ATIVO pelo seu `event_name` (único entre meters ativos no provider). Permite reaproveitar um meter já existente em vez de tentar criar outro com o mesmo event_name (que o provider rejeitaria) — ex.: após o banco do host ser recriado. |
| `String createMeteredPrice(CreateMeteredPriceRequest request)` | Cria um preço POR USO ligado a um meter (o preço do excedente) e retorna seu id. |
| `void reportUsage(UsageEventRequest request)` | Reporta um evento de uso ao meter. Idempotente via `idempotencyKey` — reenviar com a mesma chave não duplica a cobrança. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `String ensureMeter(CreateMeterRequest request)` | Find-or-create de meter por event_name: reaproveita um meter ATIVO ja existente com esse event_name (sobrevive a recriacao do banco do host) e so cria um novo se nao houver. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuBillingUsageProvider implements BillingUsageProvider {
    @Override
    public String createMeter(CreateMeterRequest request) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void deactivateMeter(String meterId) {
        // implemente
    }

    @Override
    public MeterInfo getMeter(String meterId) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public MeterInfo findMeterByEventName(String eventName) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String createMeteredPrice(CreateMeteredPriceRequest request) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void reportUsage(UsageEventRequest request) {
        // implemente
    }
}
```

## CurrentAccountResolver

Quem esta chamando: usuario, empresa e conta de billing da requisicao corrente. O default usa o usuario autenticado da security e a empresa escopada no token; um host com outra nocao de tenant substitui este bean.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `DefaultCurrentAccountResolver` — Usuario autenticado (security) + empresa corrente resolvida pelo `CompanyContextFilter` (claim `companyId` do token ou, sem escopo, a unica empresa ativa do usuario).

**Outras implementações no repositório** (para consultar como exemplo):

- `SubdomainCurrentAccountResolver` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/spis/impl/SubdomainCurrentAccountResolver.java`) — Conta de billing da requisicao no subdomain-tenancy: o tenant do host (subdominio) → a conta dele no master. O usuario e' o do security DO TENANT.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `User requireCurrentUser()` | Usuário autenticado da requisição corrente. |
| `Account requireCurrentAccount()` | Conta de billing da empresa corrente, criada (com trial) se ainda nao existir. |
| `String billingContactEmail()` | E-mail para reconciliar com o provider: o do RESPONSAVEL pela empresa (root efetivo), nao o do usuario logado. O customer do provider nasce com o e-mail de quem fez o checkout (normalmente o root); buscar pelo e-mail de um usuario comum nao acha a assinatura real. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `Account requireAccountForCompany(Long companyId)` | Conta de billing de uma empresa ESPECIFICA (ex.: a empresa corrente do token, quando o filtro de contexto de empresa nao agiu). Usada pela cota de empresas. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuCurrentAccountResolver implements CurrentAccountResolver {
    @Override
    public User requireCurrentUser() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public Account requireCurrentAccount() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public String billingContactEmail() {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## PlanTermAdditionalFieldsValidator

Regras do PRODUTO sobre os `additionalAttributes` de um term (ex.: `monthlyRequests` inteiro positivo). E' o unico SPI que um host costuma implementar: basta um bean `@ApplicationScoped` desta interface, que substitui o default (sem regras). Recebe sempre o mapa FINAL: na criacao, o enviado; no PATCH, o resultado do merge.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `DefaultPlanTermAdditionalFieldsValidator` — Sem regras de produto: aceita qualquer mapa que passe nos limites da extension.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void validate(PlanTerm term, Map<String, JsonNode> additionalAttributes)` | Valida o mapa final dos atributos adicionais do term; lance `InvalidPlanTermAdditionalAttributesException` para rejeitar (HTTP 400, nada é gravado). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuPlanTermValidator implements PlanTermAdditionalFieldsValidator {

    @Override
    public void validate(PlanTerm term, Map<String, JsonNode> additionalAttributes) {
        JsonNode requests = additionalAttributes.get("monthlyRequests");
        if (requests == null || !requests.canConvertToInt() || requests.asInt() <= 0) {
            // vira HTTP 400 e nada e' gravado
            throw new InvalidPlanTermAdditionalAttributesException("monthlyRequests deve ser um inteiro positivo");
        }
    }
}
```

## PlanTermUsageChecker

"Este plano tem movimento?" alem das assinaturas, que o billing ja conta sozinho. Um plano com movimento nao pode ser excluido. O host que registra uso proprio por term (ex.: consumo de IA no report) responde aqui; o default diz que nao ha.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão (`@DefaultBean`):**

- `DefaultPlanTermUsageChecker` — Nenhum uso alem das assinaturas.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `boolean isInUse(Collection<Long> planTermIds)` | Se algum dos terms tem movimento próprio do host; `true` impede excluir o plano. O padrão diz que não há. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class ConsumoDeIaUsageChecker implements PlanTermUsageChecker {

    @Inject
    ConsumoRepository consumo; // o uso proprio que o seu produto registra por term

    @Override
    public boolean isInUse(Collection<Long> planTermIds) {
        return consumo.existsByPlanTermIdIn(planTermIds); // true impede excluir o plano
    }
}
```

## UsageMeterContributor

Os CONTADORES de uso do produto (requisicoes, MB armazenados, notas emitidas...). O host declara quais existem; o billing guarda, por term e por contador, a franquia e o preco do excedente, e faz ciclo, bloqueio e cobranca para qualquer um deles sem conhecer nenhum de antemao. O que conta como UMA unidade, e quando contar, continua sendo do host: `@SgConsumesUsage(meter = "requests")` no metodo, ou `UsageService.consume(account, "storage-mb", n, key)` quando a quantidade so' se conhece em runtime.

**Pacote:** `br.com.seedgrid.billing.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `List<UsageMeterDefinition> meters()` | Contadores de uso que este host declara (código estável e rótulo). |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeusContadores implements UsageMeterContributor {

    @Override
    public List<UsageMeterDefinition> meters() {
        // o codigo e' a identidade do contador para sempre: [a-z0-9-], ate 40 caracteres
        return List.of(
                new UsageMeterDefinition("requests", "Requisicoes"),
                new UsageMeterDefinition("storage-mb", "MB armazenados"));
    }
}
```
