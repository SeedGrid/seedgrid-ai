package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.PASSWORD;
import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import br.com.seedgrid.billing.dtos.CompanySelection;
import br.com.seedgrid.billing.entities.Account;
import br.com.seedgrid.billing.repositories.AccountRepository;
import br.com.seedgrid.billing.services.CompanySeatService;
import br.com.seedgrid.billing.services.PastDueScheduler;
import br.com.seedgrid.billing.services.PastDueService;
import br.com.seedgrid.subdomaintenancy.configs.TenantContext;
import br.com.seedgrid.subdomaintenancy.repositories.TenantRepository;
import io.quarkus.hibernate.orm.PersistenceUnit;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import jakarta.inject.Inject;

import io.restassured.response.Response;

/**
 * TE.1 - empresas (CRU, nunca excluir), limite de empresas do plano, downgrade 3 para 1 (1 ativa + 1 somente leitura +
 * 1 desligada) e inadimplencia (somente leitura, depois desligada, pagar restaura). Tudo pelo HTTP; so' os passos que
 * dependem do provider de cobranca (confirmacao do pagamento do Stripe, o relogio do agendador) sao feitos chamando o
 * servico do billing dentro do app: {@link CompanySeatService#apply} (o que a ativacao da assinatura chama) e
 * {@link PastDueScheduler#run(Instant)} (o proprio "agora" injetavel). O {@code @Scheduled} real fica parado no
 * perfil de teste (ver COBERTURA.md).
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class CompanyLimitsE2eTest extends E2eBase {

    static final String TRIAL_TERM = "00000000-0000-0000-0000-0000000000a2";

    @Inject
    @PersistenceUnit("master")
    TenantRepository tenantRepository;
    @Inject
    AccountRepository accountRepository;
    @Inject
    CompanySeatService seatService;
    @Inject
    PastDueScheduler pastDueScheduler;
    @Inject
    PastDueService pastDueService;
    @Inject
    TenantContext tenantContext;

    @AfterEach
    void restoreCatalog() throws Exception {
        tenantContext.setCurrentTenant("master");
        masterExec("UPDATE plan_terms SET max_companies = NULL, max_read_only_companies = NULL WHERE public_id = '" + TRIAL_TERM + "'");
        masterExec("UPDATE plan_terms SET max_companies = NULL, max_read_only_companies = NULL, provider_price_id = NULL "
                + "WHERE plan_id IN (SELECT id FROM plans WHERE code = 'BASICO')");
    }

    private Account accountOf(String subdomain) {
        return QuarkusTransaction.requiringNew().call(() -> {
            String publicId = tenantRepository.findBySubdomain(subdomain).orElseThrow().getBillingAccountPublicId();
            return accountRepository.findByPublicId(publicId).orElseThrow();
        });
    }

    private static void limitTrialTo(Integer maxCompanies) throws Exception {
        masterExec("UPDATE plan_terms SET max_companies = " + maxCompanies + " WHERE public_id = '" + TRIAL_TERM + "'");
    }

    // ------------------------------------------------------------------ empresas CRU

    @Test
    void companiesAreCreatedReadEditedInactivatedAndReactivatedButNeverDeleted() throws Exception {
        String sub = freshTenant("crudc");
        String host = host(sub);
        String admin = adminToken(sub);

        String branch = createCompany(sub, admin, cnpj(71), "filial crud");
        as(host, admin).get("/companies/" + branch).then().statusCode(200)
                .body("publicId", equalTo(branch)).body("active", equalTo(true)).body("accessMode", equalTo("ACTIVE"))
                .body("addrState", equalTo("SP"));
        as(host, admin).get("/companies").then().statusCode(200).body("publicId", org.hamcrest.Matchers.hasItem(branch));

        as(host, admin).body(Map.of("tradeName", "Filial Renomeada", "addrState", "MG")).patch("/companies/" + branch)
                .then().statusCode(200).body("tradeName", equalTo("Filial Renomeada")).body("addrState", equalTo("MG"));

        as(host, admin).body(Map.of("active", false)).patch("/companies/" + branch).then().statusCode(200)
                .body("active", equalTo(false));
        as(host, admin).body(Map.of("active", true)).patch("/companies/" + branch).then().statusCode(200)
                .body("active", equalTo(true));

        // excluir nao existe: 404/405 e a linha continua la
        int delete = as(host, admin).delete("/companies/" + branch).statusCode();
        assertTrue(delete == 404 || delete == 405, "DELETE /companies/{id} respondeu " + delete);
        assertEquals("1", text(db(sub), "SELECT count(*) FROM companies WHERE public_id = '" + branch + "'"));

        // documento invalido e duplicado
        Response invalid = as(host, admin).body(Map.of("personType", "PJ", "cpfCnpj", "11111111111111",
                "corporateName", "Invalida LTDA", "tradeName", "Invalida SA")).post("/companies");
        assertTrue(invalid.statusCode() == 400 || invalid.statusCode() == 422, invalid.statusCode() + " " + invalid.body().asString());
        Response duplicate = as(host, admin).body(Map.of("personType", "PJ", "cpfCnpj", cnpj(71),
                "corporateName", "Duplicada LTDA", "tradeName", "Duplicada SA")).post("/companies");
        assertTrue(duplicate.statusCode() == 409 || duplicate.statusCode() == 400 || duplicate.statusCode() == 422,
                duplicate.statusCode() + " " + duplicate.body().asString());
    }

    @Test
    void companyCrudIsIsolatedBetweenTenants() throws Exception {
        String subA = freshTenant("isoca");
        String subB = freshTenant("isocb");
        String adminA = adminToken(subA);
        String adminB = adminToken(subB);
        String companyOfA = createCompany(subA, adminA, cnpj(72), "so do a");

        as(host(subB), adminB).get("/companies/" + companyOfA).then().statusCode(404);
        as(host(subB), adminB).body(Map.of("tradeName", "Invasor")).patch("/companies/" + companyOfA)
                .then().statusCode(404);
        as(host(subA), adminA).get("/companies/" + companyOfA).then().statusCode(200);
    }

    // ------------------------------------------------------------------ limite de empresas (cota)

    @Test
    void companyQuotaRefusesCreationAtTheLimitWith402AndOnlyActiveCompaniesCount() throws Exception {
        String sub = freshTenant("quota");
        String host = host(sub);
        String admin = adminToken(sub);
        limitTrialTo(2);

        String second = createCompany(sub, admin, cnpj(73), "segunda quota"); // 2 de 2
        Response refused = as(host, admin).body(newCompanyBody(cnpj(74))).post("/companies");
        assertEquals(402, refused.statusCode(), refused.body().asString());
        assertEquals("COMPANY_QUOTA_EXCEEDED", refused.jsonPath().getString("code"), refused.body().asString());
        assertEquals("2", text(db(sub), "SELECT count(*) FROM companies"));

        // inativar libera a vaga (so' contam as ativas) ...
        as(host, admin).body(Map.of("active", false)).patch("/companies/" + second).then().statusCode(200);
        String third = createCompany(sub, admin, cnpj(74), "terceira quota");
        // ... e REATIVAR tambem consulta a cota: a segunda nao volta com 2 ativas
        Response reactivate = as(host, admin).body(Map.of("active", true)).patch("/companies/" + second);
        assertEquals(402, reactivate.statusCode(), reactivate.body().asString());
        assertEquals("COMPANY_QUOTA_EXCEEDED", reactivate.jsonPath().getString("code"));

        // empresa somente leitura nao ocupa vaga de ativa
        setMode(sub, third, "READ_ONLY");
        as(host, admin).body(Map.of("active", true)).patch("/companies/" + second).then().statusCode(200);

        // sem limite (nulo/0) libera
        limitTrialTo(null);
        createCompany(sub, admin, cnpj(75), "sem limite");
    }

    @Test
    void theFirstCompanyOfANewTenantNeverExceedsAOneCompanyPlan() throws Exception {
        limitTrialTo(1);
        String sub = freshTenant("umaem"); // o cadastro cria a empresa antes da conta: nasce 1 de 1
        String admin = adminToken(sub);
        assertEquals("1", text(db(sub), "SELECT count(*) FROM companies"));
        as(host(sub), admin).body(newCompanyBody(cnpj(76))).post("/companies").then().statusCode(402);
    }

    // ------------------------------------------------------------------ limite de usuarios (cota)

    @Test
    void userQuotaRefusesNewMembersAtTheLimitWith402AndRaisingItFrees() throws Exception {
        String sub = freshTenant("uquota");
        String host = host(sub);
        String admin = adminToken(sub);
        String owner = firstCompanyPublicId(host, admin);
        masterExec("UPDATE plan_terms SET max_users = 2 WHERE public_id = '" + TRIAL_TERM + "'");
        try {
            newMember(sub, admin, owner, List.of(), List.of()); // 2 de 2 (o administrador ocupa a primeira vaga)

            Response refused = as(host, admin)
                    .body(Map.of("email", "excedente-" + sub + "@" + sub + ".test", "name", "Membro Excedente", "whatsApp", "11999997777",
                            "password", PASSWORD, "emailPreConfirmed", true, "changePasswordRequired", false,
                            "sendWelcomeEmail", false, "rolePublicIds", List.of(globalRoleId(sub, "E2E_LEITOR")),
                            "memberships", List.of(Map.of("companyPublicId", owner, "rolePublicIds", List.of()))))
                    .post("/users");
            assertEquals(402, refused.statusCode(), refused.body().asString());
            assertEquals("USER_QUOTA_EXCEEDED", refused.jsonPath().getString("code"), refused.body().asString());

            masterExec("UPDATE plan_terms SET max_users = 3 WHERE public_id = '" + TRIAL_TERM + "'");
            newMember(sub, admin, owner, List.of(), List.of());
        } finally {
            masterExec("UPDATE plan_terms SET max_users = NULL WHERE public_id = '" + TRIAL_TERM + "'");
        }
    }

    private static Map<String, Object> newCompanyBody(String cnpj) {
        return Map.of("personType", "PJ", "cpfCnpj", cnpj, "corporateName", "Nova Empresa LTDA", "tradeName", "Nova Empresa SA");
    }

    // ------------------------------------------------------------------ downgrade 3 -> 1 (+1 somente leitura)

    @Test
    void downgradeFromThreeCompaniesKeepsOneActiveOneReadOnlyAndSwitchesOffTheOther() throws Exception {
        String sub = freshTenant("downg");
        String host = host(sub);
        String admin = adminToken(sub);
        String owner = firstCompanyPublicId(host, admin);
        String b = createCompany(sub, admin, cnpj(81), "segunda down");
        String c = createCompany(sub, admin, cnpj(82), "terceira down");
        Member onlyB = newMember(sub, admin, b, List.of(), List.of());
        Member onlyC = newMember(sub, admin, c, List.of(), List.of());

        // plano de destino: 1 ativa + 1 somente leitura
        // (term criado por SQL nasce sem preco no provider: o "Publicar" da tela poe o id do preco; aqui um id de teste)
        masterExec("UPDATE plan_terms SET max_companies = 1, max_read_only_companies = 1, provider_price_id = 'price_e2e_basico' "
                + "WHERE plan_id IN (SELECT id FROM plans WHERE code = 'BASICO')");
        String planId = masterText("SELECT public_id FROM plans WHERE code = 'BASICO'");

        // o cliente ve que precisa escolher: protegida = a do responsavel; elegiveis = as outras duas
        Response preview = as(host, admin).queryParam("planId", planId).get("/me/billing/checkout/preview");
        assertEquals(200, preview.statusCode(), "preview do checkout: " + preview.body().asString());
        preview.then().body("requiresCompanySelection", equalTo(true))
                .body("companySelection.maxCompanies", equalTo(1)).body("companySelection.maxReadOnlyCompanies", equalTo(1))
                .body("companySelection.eligibleCompanies.publicId", containsInAnyOrder(b, c))
                .body("companySelection.protectedCompanies.publicId", containsInAnyOrder(owner));

        // checkout sem a escolha, ou com escolha errada, e' recusado ANTES de falar com o provider
        as(host, admin).body(Map.of("planId", planId)).post("/me/billing/checkout")
                .then().statusCode(400).body("code", equalTo("INVALID_COMPANY_SELECTION"));
        as(host, admin).body(Map.of("planId", planId, "companySelection",
                Map.of("keepActive", List.of(owner, b), "readOnly", List.of(c), "disable", List.of())))
                .post("/me/billing/checkout").then().statusCode(400).body("code", equalTo("INVALID_COMPANY_SELECTION"));
        as(host, admin).body(Map.of("planId", planId, "companySelection",
                Map.of("keepActive", List.of(owner), "readOnly", List.of(b), "disable", List.of("nao-e-da-conta"))))
                .post("/me/billing/checkout").then().statusCode(400).body("code", equalTo("INVALID_COMPANY_SELECTION"));
        assertEquals("ACTIVE", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + c + "'"));

        // a confirmacao do pagamento aplica a escolha (o que o webhook do provider faz): B somente leitura, C desligada
        Account account = accountOf(sub);
        CompanySelection chosen = seatService.resolveSelection(account, 1, 1,
                new CompanySelection(List.of(owner), List.of(b), List.of(c)));
        assertNotNull(chosen);
        seatService.apply(account, chosen, "Basico");

        assertEquals("ACTIVE", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + owner + "'"));
        assertEquals("READ_ONLY", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + b + "'"));
        assertEquals("DISABLED", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + c + "'"));
        assertEquals("billing-plan-company-limit",
                text(db(sub), "SELECT access_mode_reason FROM companies WHERE public_id = '" + c + "'"));

        // efeito para o cliente, de ponta a ponta: a somente leitura le mas nao grava; a desligada nao entra
        pauseForIatResolution();
        String tokenB = login(host, onlyB.email(), PASSWORD);
        as(host, tokenB).get("/probe/permission").then().statusCode(200);
        as(host, tokenB).post("/probe/write").then().statusCode(403).body("code", equalTo("COMPANY_READ_ONLY"));
        loginResponse(host, onlyC.email(), PASSWORD).then().statusCode(403).body("code", equalTo("COMPANY_DISABLED"));
        as(host, onlyC.token()).get("/probe/me").then().statusCode(401).body("code", equalTo("SESSION_REVOKED"));
        String adminAfter = adminToken(sub);
        String inOwner = selectCompany(host, adminAfter, owner);
        as(host, inOwner).post("/probe/write").then().statusCode(200);
        // o seletor mostra o estado de cada uma
        as(host, adminAfter).get("/me/companies").then().statusCode(200)
                .body("find { it.publicId == '" + b + "' }.accessMode", equalTo("READ_ONLY"))
                .body("find { it.publicId == '" + c + "' }.accessMode", equalTo("DISABLED"));
        // sem troca de plano agendada nao ha escolha a reeditar: recusado (nunca 200/500)
        Response edit = as(host, adminAfter)
                .body(Map.of("keepActive", List.of(), "readOnly", List.of(b), "disable", List.of(c)))
                .put("/me/billing/downgrade-company-selection");
        assertTrue(edit.statusCode() == 400 || edit.statusCode() == 409, edit.statusCode() + " " + edit.body().asString());
    }

    private static void assertNotNull(Object value) {
        org.junit.jupiter.api.Assertions.assertNotNull(value);
    }

    // ------------------------------------------------------------------ inadimplencia

    @Test
    void pastDueCycleMovesCompaniesToReadOnlyThenDisabledAndPayingRestoresThem() throws Exception {
        String sub = freshTenant("pastd");
        String host = host(sub);
        String admin = adminToken(sub);
        String owner = firstCompanyPublicId(host, admin);
        String b = createCompany(sub, admin, cnpj(91), "segunda atraso");
        String c = createCompany(sub, admin, cnpj(92), "terceira atraso");
        Member onlyB = newMember(sub, admin, b, List.of(), List.of());
        Account account = accountOf(sub);

        masterExec("UPDATE tenant_subscriptions SET status = 'PAST_DUE', past_due_since = NULL WHERE tenant_id = "
                + "(SELECT id FROM accounts WHERE public_id = '" + account.getPublicId() + "')");

        Instant now = Instant.now();
        assertEquals(0, pastDueScheduler.run(now), "a primeira rodada so' marca o inicio da inadimplencia");
        assertEquals(0, pastDueScheduler.run(now.plus(6, ChronoUnit.DAYS)), "6 dias: ainda dentro da tolerancia");
        assertEquals("ACTIVE", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + c + "'"));

        assertEquals(1, pastDueScheduler.run(now.plus(8, ChronoUnit.DAYS)), "passou dos 7 dias: somente leitura");
        for (String company : List.of(owner, b, c)) {
            assertEquals("READ_ONLY", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + company + "'"));
            assertEquals("billing-past-due|prev=ACTIVE",
                    text(db(sub), "SELECT access_mode_reason FROM companies WHERE public_id = '" + company + "'"));
        }
        pauseForIatResolution();
        String tokenB = login(host, onlyB.email(), PASSWORD);
        as(host, tokenB).post("/probe/write").then().statusCode(403).body("code", equalTo("COMPANY_READ_ONLY"));
        // rodar de novo no mesmo instante nao muda nada (idempotente)
        assertEquals(0, pastDueScheduler.run(now.plus(8, ChronoUnit.DAYS)));

        // 30 dias: as demais saem do ar, mas a conta nunca fica toda desligada (a do responsavel segue lendo e consegue pagar)
        pastDueScheduler.run(now.plus(31, ChronoUnit.DAYS));
        String ownerMode = text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + owner + "'");
        assertNotEquals("DISABLED", ownerMode, "a empresa do responsavel nunca e' desligada pelo ciclo");
        assertEquals("DISABLED", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + c + "'"));
        loginResponse(host, onlyB.email(), PASSWORD).then().statusCode(403).body("code", equalTo("COMPANY_DISABLED"));
        as(host, tokenB).get("/probe/me").then().statusCode(401).body("code", equalTo("SESSION_REVOKED"));

        // pagar volta cada empresa ao estado de antes
        QuarkusTransaction.requiringNew().run(() -> pastDueService.restoreCompanies(accountOf(sub)));
        for (String company : List.of(owner, b, c)) {
            assertEquals("ACTIVE", text(db(sub), "SELECT access_mode FROM companies WHERE public_id = '" + company + "'"), company);
        }
        pauseForIatResolution();
        String back = login(host, onlyB.email(), PASSWORD);
        as(host, back).post("/probe/write").then().statusCode(200);
    }

    @Test
    void pastDueCycleOfOneTenantNeverTouchesAnotherTenantOrAnAdministratorDecision() throws Exception {
        String subA = freshTenant("pdia");
        String subB = freshTenant("pdib");
        String adminA = adminToken(subA);
        String adminB = adminToken(subB);
        String ownerA = firstCompanyPublicId(host(subA), adminA);
        String ownerB = firstCompanyPublicId(host(subB), adminB);
        String extraA = createCompany(subA, adminA, cnpj(93), "extra a");
        Account accountA = accountOf(subA);
        masterExec("UPDATE tenant_subscriptions SET status = 'PAST_DUE', past_due_since = NULL WHERE tenant_id = "
                + "(SELECT id FROM accounts WHERE public_id = '" + accountA.getPublicId() + "')");

        // o administrador ja tinha posto a extraA em somente leitura por conta propria (motivo "e2e")
        setMode(subA, extraA, "READ_ONLY");
        Instant now = Instant.now();
        pastDueScheduler.run(now);
        pastDueScheduler.run(now.plus(8, ChronoUnit.DAYS));
        pastDueScheduler.run(now.plus(31, ChronoUnit.DAYS));
        QuarkusTransaction.requiringNew().run(() -> pastDueService.restoreCompanies(accountOf(subA)));

        // pagar NAO desfaz o que o administrador fez (so' o que o ciclo de inadimplencia mexeu)
        assertEquals("READ_ONLY", text(db(subA), "SELECT access_mode FROM companies WHERE public_id = '" + extraA + "'"));
        assertEquals("ACTIVE", text(db(subA), "SELECT access_mode FROM companies WHERE public_id = '" + ownerA + "'"));
        // o outro tenant nunca saiu de ACTIVE
        assertEquals("ACTIVE", text(db(subB), "SELECT access_mode FROM companies WHERE public_id = '" + ownerB + "'"));
    }
}
