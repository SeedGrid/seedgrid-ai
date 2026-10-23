package br.com.seedgrid.app.api.e2e;

import static br.com.seedgrid.app.api.e2e.E2eWorld.host;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.response.Response;

/**
 * TE.1 - invariante do ADMIN: o tenant (banco dedicado, {@code admin-guard.scope=database}) nunca fica sem ADMIN ativo.
 * Todos os caminhos que tirariam o ultimo ADMIN respondem 409 {@code LAST_ADMIN_PROTECTED}; quem nao e' ADMIN nunca e'
 * bloqueado; a sucessao (promover outro, depois sair) funciona; duas remocoes simultaneas nao deixam zero.
 *
 * <p>Cada teste usa um TENANT NOVO (estes testes destroem o estado que protegem; compartilhar tenant faria um teste
 * mudar o resultado do outro).</p>
 */
@QuarkusTest
@QuarkusTestResource(value = E2ePostgresResource.class, restrictToAnnotatedClass = true)
@TestProfile(E2eProfile.class)
class AdminInvariantE2eTest extends E2eBase {

    static final String CODE = "LAST_ADMIN_PROTECTED";

    String sub;
    String host;
    String admin;
    String adminPublicId;
    String company;
    String adminRole;
    String readerRole;
    String manager; // gestor que NAO e' ADMIN (USER_READ/UPDATE/DELETE): opera sem ser parte da invariante
    Member managerMember;

    @BeforeEach
    void freshTenantForThisTest() throws Exception {
        sub = freshTenant("invar");
        host = host(sub);
        admin = adminToken(sub);
        company = firstCompanyPublicId(host, admin);
        adminRole = globalRoleId(sub, "ADMIN");
        readerRole = globalRoleId(sub, "E2E_LEITOR");
        adminPublicId = text(db(sub), "SELECT public_id FROM users WHERE email = '" + adminEmail(sub) + "'");
        exec(db(sub), "INSERT INTO roles (name, description, public_id, for_integration) VALUES ('E2E_GESTOR', 'gestor de teste', '"
                + UUID.randomUUID() + "', FALSE) ON CONFLICT DO NOTHING");
        exec(db(sub), "INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p "
                + "WHERE r.name = 'E2E_GESTOR' AND r.company_id IS NULL AND p.name IN ('USER_READ', 'USER_UPDATE', 'USER_DELETE') "
                + "ON CONFLICT DO NOTHING");
        managerMember = newMember(sub, admin, company, List.of(globalRoleId(sub, "E2E_GESTOR")), List.of());
        manager = managerMember.token();
    }

    private static void refused(Response r, String path) {
        assertEquals(409, r.statusCode(), path + " -> " + r.statusCode() + " " + r.body().asString());
        assertEquals(CODE, r.jsonPath().getString("code"), path + ": " + r.body().asString());
    }

    @Test
    void theOnlyAdminCannotBeStrippedByAnyPath() throws Exception {
        String user = "/users/" + adminPublicId;
        refused(as(host, manager).body(Map.of("active", false)).patch(user), "PATCH active=false");
        refused(as(host, manager).delete(user), "DELETE usuario");
        refused(as(host, manager).delete(user + "/memberships/" + company), "DELETE vinculo");
        refused(as(host, admin).body(Map.of("active", false)).patch(user), "ADMIN se desativando");

        // nada mudou: segue ativo, com vinculo, e entra
        assertEquals("true", text(db(sub), "SELECT active::text FROM users WHERE public_id = '" + adminPublicId + "'"));
        assertEquals("1", text(db(sub), "SELECT count(*) FROM user_companies uc JOIN users u ON u.id = uc.user_id "
                + "WHERE u.public_id = '" + adminPublicId + "'"));
        as(host, admin).get("/me/companies").then().statusCode(200);
    }

    /** Caminho separado: se ele falhar, nao deve esconder os demais (e a mudanca de roles altera o estado do tenant). */
    @Test
    void theOnlyAdminCannotLoseTheAdminRoleByReplacingTheGlobalRoles() {
        String user = "/users/" + adminPublicId;
        refused(as(host, manager).body(Map.of("rolePublicIds", List.of(readerRole))).patch(user), "PATCH roles sem ADMIN");
    }

    @Test
    void theOnlyAdminCannotLoseTheAdminRoleByReplacingTheMembershipRoles() {
        String user = "/users/" + adminPublicId;
        refused(as(host, manager).body(Map.of("rolePublicIds", List.of(readerRole))).put(user + "/memberships/" + company),
                "PUT roles do vinculo");
    }

    @Test
    void theOnlyActiveCompanyOfTheTenantCannotBeInactivated() throws Exception {
        Response r = as(host, admin).body(Map.of("active", false)).patch("/companies/" + company);
        assertTrue(r.statusCode() == 409 || r.statusCode() == 422, r.statusCode() + " " + r.body().asString());
        assertEquals("true", text(db(sub), "SELECT active::text FROM companies WHERE public_id = '" + company + "'"));
    }

    @Test
    void inactivatingTheCompanyThatHoldsTheOnlyAdminIsRefusedUnlessAnotherCompanyKeepsAnAdmin() throws Exception {
        // B ativa, so' com um membro comum; o unico ADMIN do banco esta em A
        String branch = createCompany(sub, admin, cnpj(41), "filial invariante");
        // quem cria a empresa (root) recebe vinculo nela automaticamente: tira, para o unico ADMIN ficar so' em A
        exec(db(sub), "DELETE FROM user_companies WHERE company_id = (SELECT id FROM companies WHERE public_id = '" + branch + "')");
        newMember(sub, admin, branch, List.of(readerRole), List.of());

        refused(as(host, admin).body(Map.of("active", false)).patch("/companies/" + company),
                "inativar a empresa do unico ADMIN");
        assertEquals("true", text(db(sub), "SELECT active::text FROM companies WHERE public_id = '" + company + "'"));

        // dar o ADMIN a alguem de B: agora A pode ser inativada (o banco segue com ADMIN em empresa ativa)
        newMember(sub, admin, branch, List.of(adminRole), List.of());
        as(host, admin).body(Map.of("active", false)).patch("/companies/" + company).then().statusCode(200);
    }

    @Test
    void whoIsNotAdminIsNeverBlocked() throws Exception {
        Member plain = newMember(sub, admin, company, List.of(readerRole), List.of());
        as(host, manager).body(Map.of("active", false)).patch("/users/" + plain.publicId()).then().statusCode(200);
        as(host, manager).body(Map.of("active", true)).patch("/users/" + plain.publicId()).then().statusCode(200);
        as(host, manager).delete("/users/" + plain.publicId() + "/memberships/" + company).then().statusCode(204);
        as(host, manager).delete("/users/" + plain.publicId()).then().statusCode(204);
    }

    @Test
    void successionWorksPromoteAnotherAdminAndOnlyThenTheOldOneMayLeave() throws Exception {
        Member second = newMember(sub, admin, company, List.of(adminRole), List.of());

        // com dois ADMIN ativos o primeiro pode sair ...
        as(host, manager).body(Map.of("active", false)).patch("/users/" + adminPublicId).then().statusCode(200);
        // ... e o segundo vira o ultimo: protegido em todos os caminhos
        refused(as(host, manager).body(Map.of("active", false)).patch("/users/" + second.publicId()), "segundo desativado");
        refused(as(host, manager).delete("/users/" + second.publicId()), "segundo excluido");
        refused(as(host, manager).delete("/users/" + second.publicId() + "/memberships/" + company), "segundo sem vinculo");

        // volta o primeiro e o segundo pode sair
        as(host, manager).body(Map.of("active", true)).patch("/users/" + adminPublicId).then().statusCode(200);
        as(host, manager).body(Map.of("active", false)).patch("/users/" + second.publicId()).then().statusCode(200);
        // o admin original voltou a ser o unico ADMIN ativo e esta protegido de novo
        refused(as(host, manager).body(Map.of("active", false)).patch("/users/" + adminPublicId), "original de novo protegido");
    }

    @Test
    void twoSimultaneousRemovalsOfTwoAdminsNeverLeaveZero() throws Exception {
        // aquece a auditoria e os caches (a primeira chamada de cada caminho e' mais lenta e mascara a corrida)
        as(host, manager).body(Map.of("name", "Gestor Aquecido")).patch("/users/" + managerMember.publicId())
                .then().statusCode(200);
        StringBuilder log = new StringBuilder();
        for (int round = 0; round < 4; round++) {
            Member x = newMember(sub, admin, company, List.of(adminRole), List.of());
            Member y = newMember(sub, admin, company, List.of(adminRole), List.of());
            // so' x e y sao ADMIN ativos nesta rodada (o original e os das rodadas anteriores saem por SQL)
            exec(db(sub), "UPDATE users SET active = FALSE WHERE public_id NOT IN ('" + x.publicId() + "', '"
                    + y.publicId() + "', '" + managerMember.publicId() + "')");
            CountDownLatch go = new CountDownLatch(1);
            ExecutorService pool = Executors.newFixedThreadPool(2);
            try {
                Future<Integer> fx = pool.submit(deactivate(go, x.publicId()));
                Future<Integer> fy = pool.submit(deactivate(go, y.publicId()));
                go.countDown();
                int sx = fx.get();
                int sy = fy.get();
                String remaining = text(db(sub), "SELECT count(*) FROM users u JOIN user_roles ur ON ur.user_id = u.id "
                        + "JOIN roles r ON r.id = ur.role_id WHERE r.name = 'ADMIN' AND r.company_id IS NULL AND u.active");
                log.append("rodada ").append(round).append(": ").append(sx).append("/").append(sy)
                        .append(" ADMIN ativos=").append(remaining).append("; ");
                assertTrue(!"0".equals(remaining), "o tenant ficou SEM ADMIN ativo (" + log + ")");
                assertTrue((sx == 200 && sy == 409) || (sx == 409 && sy == 200),
                        "exatamente uma remocao deveria passar e a outra levar 409 (" + log + ")");
            } finally {
                pool.shutdownNow();
            }
        }
    }

    private Callable<Integer> deactivate(CountDownLatch go, String publicId) {
        return () -> {
            go.await();
            return as(host, manager).body(Map.of("active", false)).patch("/users/" + publicId).statusCode();
        };
    }
}
