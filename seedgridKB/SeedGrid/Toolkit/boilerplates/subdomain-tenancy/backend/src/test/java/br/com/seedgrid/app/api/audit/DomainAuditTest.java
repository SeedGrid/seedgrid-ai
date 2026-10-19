package br.com.seedgrid.app.api.audit;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import br.com.seedgrid.exchange.services.AdminCurrencyService;
import br.com.seedgrid.exchange.schedulers.CurrencyRateScheduler;
import br.com.seedgrid.exchange.dtos.CurrencyUpsertRequest;
import br.com.seedgrid.exchange.services.CurrencyRateFetchService;
import br.com.seedgrid.exchange.entities.CurrencyExchangeRateStatus;
import br.com.seedgrid.exchange.entities.CurrencyEntity;
import br.com.seedgrid.exchange.entities.CurrencyExchangeRateEntity;
import br.com.seedgrid.aipricing.entities.AiModelEntity;
import br.com.seedgrid.aipricing.entities.AiModelPriceToApproveEntity;
import br.com.seedgrid.aipricing.repositories.AiModelEntityRepository;
import br.com.seedgrid.aipricing.repositories.AiModelPriceEntityRepository;
import br.com.seedgrid.aipricing.repositories.AiModelPriceToApproveEntityRepository;
import br.com.seedgrid.exchange.repositories.CurrencyEntityRepository;
import br.com.seedgrid.exchange.repositories.CurrencyExchangeRateEntityRepository;
import br.com.seedgrid.aipricing.services.AiModelPriceService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import io.quarkus.narayana.jta.QuarkusTransaction;
import br.com.seedgrid.audit.core.dtos.AuditFilter;
import br.com.seedgrid.audit.core.enums.AuditOperationEnum;
import br.com.seedgrid.audit.core.services.AuditLogService;
import br.com.seedgrid.subdomaintenancy.configs.TenantContext;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.InjectMock;
import io.quarkus.test.security.TestSecurity;
import jakarta.enterprise.context.control.ActivateRequestContext;
import jakarta.inject.Inject;

@QuarkusTest
@QuarkusTestResource(AuditDatabaseResource.class)
@EnabledIfSystemProperty(named = "audit.integration", matches = "true")
class DomainAuditTest {
    @Inject AdminCurrencyService currencies;
    @Inject AuditLogService audit;
    @Inject AiModelPriceService prices;
    @Inject br.com.seedgrid.aipricing.services.AiPriceApprovalService approvals;
    @Inject CurrencyRateFetchService rates;
    @Inject br.com.seedgrid.exchange.controllers.AdminCurrencyExchangeRateResource rateResource;
    @Inject TenantContext tenantContext;
    @InjectMock CurrencyRateScheduler scheduler;
    @Inject AiModelEntityRepository models;
    @Inject AiModelPriceEntityRepository modelPrices;
    @Inject AiModelPriceToApproveEntityRepository proposals;
    @Inject CurrencyEntityRepository currencyRows;
    @Inject CurrencyExchangeRateEntityRepository rateRows;

    @Test
    @ActivateRequestContext
    @TestSecurity(user = "audit-test", roles = "ADMIN")
    void auditsCurrencyLifecycleWithSnapshotsAndWithoutSourceCredentials() {
        tenantContext.setCurrentTenant("master");
        var currency = currencies.create(request("Antes"));
        String publicId = currency.getPublicId();
        currencies.update(publicId, request("Depois"));
        currencies.delete(publicId);

        var filter = new AuditFilter();
        filter.setEntity("CurrencyEntity");
        var logs = audit.getAllAuditLogs(filter);
        assertEquals(3, logs.size());
        var created = logs.stream().filter(log -> log.getOperation() == AuditOperationEnum.CREATE).findFirst().orElseThrow();
        var updated = logs.stream().filter(log -> log.getOperation() == AuditOperationEnum.UPDATE).findFirst().orElseThrow();
        var deleted = logs.stream().filter(log -> log.getOperation() == AuditOperationEnum.DELETE).findFirst().orElseThrow();
        assertNull(created.getBeforeState());
        assertTrue(created.getAfterState().contains(publicId));
        assertTrue(updated.getBeforeState().contains("Antes"));
        assertTrue(updated.getAfterState().contains("Depois"));
        assertTrue(deleted.getBeforeState().contains("Depois"));
        assertNull(deleted.getAfterState());
        for (var log : logs) {
            assertEquals("audit-test", log.getUserName());
            assertFalse(String.valueOf(log.getBeforeState()).contains("credential-canary"));
            assertFalse(String.valueOf(log.getAfterState()).contains("credential-canary"));
        }
        assertThrows(RuntimeException.class, () -> currencies.update("missing", request("Invalida")));
        assertEquals(3, audit.getAllAuditLogs(filter).size(), "Falha de dominio nao deve produzir evento de sucesso");
    }

    private static CurrencyUpsertRequest request(String name) {
        return new CurrencyUpsertRequest("AUDIT-TEST", name, "https://example.invalid/rate?token=credential-canary",
                "0 0 6 * * ?", "UTC", "", null, null, false);
    }

    @Test
    @ActivateRequestContext
    @TestSecurity(user = "audit-test", roles = "ADMIN")
    void auditsPriceLaunchThroughTheExistingService() {
        tenantContext.setCurrentTenant("master");
        var model = QuarkusTransaction.requiringNew().call(() -> {
            var entity = new AiModelEntity();
            entity.setModel("audit-test-model");
            models.persist(entity);
            return entity;
        });
        var price = prices.launch(model, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.TEN,
                "https://example.invalid?token=credential-canary", "audit-test");
        var filter = new AuditFilter();
        filter.setEntity("AiModelPriceEntity");
        var logs = audit.getAllAuditLogs(filter).stream()
                .filter(log -> String.valueOf(log.getAfterState()).contains(price.getPublicId())).toList();
        assertEquals(1, logs.size(), "Um lancamento nao deve duplicar o registro de auditoria");
        var log = logs.getFirst();
        assertEquals(AuditOperationEnum.CREATE, log.getOperation());
        assertTrue(log.getAfterState().contains(price.getPublicId()));
        assertFalse(log.getAfterState().contains("credential-canary"));
        assertEquals("audit-test", log.getUserName());
    }

    @Test
    @ActivateRequestContext
    @TestSecurity(user = "audit-test", roles = "ADMIN", permissions = "CURRENCY_RATE_READ")
    void auditsManualRateBeforeAndAfterInTheDomainPersistenceUnit() {
        tenantContext.setCurrentTenant("master");
        var row = QuarkusTransaction.requiringNew().call(() -> {
            var currency = new CurrencyEntity();
            currency.setCode("AUDIT-RATE");
            currency.setName("Teste");
            currency.setSourceUrl("https://example.invalid");
            currency.setFetchCron("0 0 6 * * ?");
            currency.setActive(false);
            currencyRows.persist(currency);
            var entity = new CurrencyExchangeRateEntity();
            entity.setCurrencyId(currency.getId());
            entity.setReferenceDate(LocalDate.now());
            entity.setRate(BigDecimal.ONE);
            entity.setStatus(CurrencyExchangeRateStatus.SUCCESS);
            entity.setNextRetryAt(Instant.now().plusSeconds(3600));
            entity.setFetchedAt(Instant.now());
            rateRows.persist(entity);
            return entity;
        });
        var edited = rates.applyManualRate(row.getPublicId(), BigDecimal.TEN);
        assertNull(edited.getNextRetryAt(), "Ajuste manual cancela o retry automatico");
        @SuppressWarnings("unchecked")
        var result = (java.util.Map<String, Object>) rateResource.search("AUDIT-RATE", null, null, 0, 30);
        assertEquals(1L, result.get("totalRecords"), "Pesquisa deve usar a PU da entidade, inclusive master");
        var items = (java.util.List<?>) result.get("items");
        assertTrue(items.toString().contains(row.getPublicId()));
        var filter = new AuditFilter();
        filter.setEntity("CurrencyExchangeRateEntity");
        var logs = audit.getAllAuditLogs(filter);
        assertEquals(1, logs.size());
        assertEquals(AuditOperationEnum.UPDATE, logs.getFirst().getOperation());
        assertTrue(logs.getFirst().getBeforeState().contains("SUCCESS"));
        assertTrue(logs.getFirst().getAfterState().contains("MANUAL"));
        assertTrue(logs.getFirst().getAfterState().contains(row.getPublicId()));
    }
    @Test
    @ActivateRequestContext
    @TestSecurity(user = "audit-test", roles = "ADMIN")
    void extensionApprovesAndRejectsWithAuditAndPreservesPriceHistory() {
        tenantContext.setCurrentTenant("master");
        var model = QuarkusTransaction.requiringNew().call(() -> {
            var entity = new AiModelEntity();
            entity.setModel("pricing-adoption-model");
            models.persist(entity);
            return entity;
        });
        var oldPrice = prices.launch(model, BigDecimal.ONE, null, BigDecimal.ONE, null, "audit-test");
        var pending = proposal("[{\"model\":\"pricing-adoption-model\",\"inputPricePerMillion\":2,\"outputPricePerMillion\":3}]");
        var approved = approvals.approve(pending.getPublicId(), "audit-test");
        assertEquals("APPROVED", approved.getStatus());
        QuarkusTransaction.requiringNew().run(() -> {
            var current = modelPrices.current(model.getId());
            assertEquals(0, new BigDecimal("2").compareTo(current.getInputPricePerMillion()));
            assertNotEquals(oldPrice.getPublicId(), current.getPublicId());
            assertEquals(2, modelPrices.listByModel(model.getId()).size());
        });
        assertThrows(jakarta.ws.rs.ClientErrorException.class,
                () -> approvals.approve(pending.getPublicId(), "audit-test"));
        var rejected = proposal("[]");
        assertEquals("REJECTED", approvals.reject(rejected.getPublicId(), "audit-test").getStatus());
        var filter = new AuditFilter();
        filter.setEntity("AiModelPriceToApproveEntity");
        var logs = audit.getAllAuditLogs(filter);
        assertEquals(2, logs.size(), "Revisao repetida nao deve produzir evento de sucesso");
        for (var log : logs) {
            assertTrue(log.getBeforeState().contains("PENDING"));
            assertTrue(log.getAfterState().contains("audit-test"));
            assertFalse(log.getBeforeState().contains("credential-canary"));
            assertFalse(log.getAfterState().contains("credential-canary"));
        }
    }

    private AiModelPriceToApproveEntity proposal(String json) {
        return QuarkusTransaction.requiringNew().call(() -> {
            var row = new AiModelPriceToApproveEntity();
            row.setCheckedAt(Instant.now());
            row.setSourceUrl("https://example.invalid?token=credential-canary");
            row.setDetectedChangesJson(json);
            proposals.persist(row);
            return row;
        });
    }

}
