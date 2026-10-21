---
tags: [seedgrid, extension, backup, exemplos]
fonte: java/seedgrid-quarkus-ext-backup
branch: main
commit: 3bed4075ea
analisado-em: 2026-10-14
---

# Exemplos — backup (Quarkus)

Voltar: [[SeedGrid/Extensions/backup/Visao-geral|Visão geral do backup]] · Propriedades: [[SeedGrid/Extensions/backup/Configuracao|Configuração do backup]]

Todos os exemplos usam tipos e assinaturas reais do runtime (`br.com.seedgrid.backup.*`). Fonte indicada em cada um.

## 1. Dependência Maven

Fonte: `runtime/pom.xml` (coordenadas reais).

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-backup</artifactId>
    <version>2026.10.09</version>
</dependency>
```

O host também precisa de: datasource PostgreSQL, um bean `CurrentUserProvider` (commons), um `UserContactProvider` (para o e-mail) e, para `@SgAudit` persistir, um provider de auditoria (ex. `seedgrid-audit-postgresql`) — ver [[SeedGrid/Extensions/audit/Visao-geral|audit]].

## 2. Fluxo REST

Fonte: `ExportController`, `ExportRequest`, `ExportResponse`, `README.md` (seção "Endpoints REST").

```bash
# Criar (BACKUP_CREATE) -> 201
curl -X POST https://<host>/exports \
  -H "Authorization: Bearer <SEGREDO:token>" \
  -H "Content-Type: application/json" \
  -d '{ "format": "CSV_ZIP", "scope": "DOMAIN" }'

# Listar jobs do usuário corrente (BACKUP_READ)
curl "https://<host>/exports?page=0&size=20" -H "Authorization: Bearer <SEGREDO:token>"

# Status (BACKUP_READ) -> 200 / 404
curl https://<host>/exports/<jobId> -H "Authorization: Bearer <SEGREDO:token>"

# Download (BACKUP_DOWNLOAD) -> 200 application/zip / 404 não pronto / 410 expirado ou falho
curl -OJ https://<host>/exports/<jobId>/download -H "Authorization: Bearer <SEGREDO:token>"

# Cancelar ou excluir (BACKUP_DELETE) -> 204 / 404
curl -X DELETE https://<host>/exports/<jobId> -H "Authorization: Bearer <SEGREDO:token>"
```

Valores aceitos: `format` = `CSV_ZIP` | `SQL_DUMP_ZIP`; `scope` = `DOMAIN` | `RAW`. Resposta de criação: `ExportResponse` com `status = QUEUED`, `progress = 0`.

Conteúdo do ZIP `CSV_ZIP` (fonte: `CsvZipExporter#createZipArchive`): `data/<tabela-ou-entidade>.csv`, `manifest.json`, `checksums.txt`; nome `export_<schema>_<timestamp>.zip`, gravado sob o prefixo `<schema>/exports` do storage.

## 3. Exporter customizado (SPI `BackupExporter`)

Fonte: `spi/BackupExporter.java`, `spi/ExportContext.java`, `spi/ExportResult.java`; adaptado do `README.md` ("Implementar um BackupExporter"). Atenção: a extensão já registra exporters para `CSV_ZIP` e `SQL_DUMP_ZIP`; o `BackupExporterRegistry` lança `IllegalStateException` no startup se houver dois beans para o mesmo `BackupFormat`. Portanto um exporter próprio só pode coexistir se o default do mesmo formato for removido (ex. `quarkus.arc.exclude-types`) — **Inferência**; não há novos valores de `BackupFormat` além dos dois existentes.

```java
import java.util.List;

import br.com.seedgrid.backup.domains.BackupFormat;
import br.com.seedgrid.backup.domains.ExportScope;
import br.com.seedgrid.backup.spi.BackupExporter;
import br.com.seedgrid.backup.spi.ExportContext;
import br.com.seedgrid.backup.spi.ExportException;
import br.com.seedgrid.backup.spi.ExportResult;
import br.com.seedgrid.backup.spi.ExportValidationException;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MySqlDumpExporter implements BackupExporter {

    @Override
    public BackupFormat format() {
        return BackupFormat.SQL_DUMP_ZIP;
    }

    @Override
    public void validate(ExportContext ctx) throws ExportValidationException {
        if (ctx.getScope() != ExportScope.RAW) {
            throw new ExportValidationException("só RAW é suportado");
        }
    }

    @Override
    public ExportResult export(ExportContext ctx) throws ExportException {
        ctx.updateProgress(10, "extraindo dados");
        byte[] zipBytes = buildZip(ctx);                       // sua lógica
        String key = ctx.getStorageService().store("export.zip", zipBytes);
        ctx.updateProgress(100, "concluído");

        return ExportResult.builder()
                .artifacts(List.of(ExportResult.ArtifactData.builder()
                        .type(ExportResult.ArtifactType.ZIP)
                        .storageKey(key)
                        .filename("export.zip")
                        .sizeBytes(zipBytes.length)
                        .mimeType("application/zip")
                        .build()))
                .totalSizeBytes(zipBytes.length)
                .build();
    }

    private byte[] buildZip(ExportContext ctx) {
        throw new UnsupportedOperationException("implementar");
    }
}
```

`ExportContext` expõe (Lombok `@Data`): `getJobId()`, `getFormat()`, `getScope()`, `getDatabaseSchema()`, `getOptions()`, `getOption(key, default)` (mapa `options` do pedido; os exporters embutidos não o leem), `updateProgress(int, String)`, `getStorageService()` (`store`/`retrieve`/`delete`) e `getExportJob()` (pode ser `null` — o pipeline não o preenche mais).

## 4. `TenantProvider` para host multitenant

Fonte: `spi/TenantProvider.java`; default `configs/SingleTenantBackupProvider` (`@DefaultBean`, tenant `"public"`). O valor do tenant é usado como **schema PostgreSQL** (filtro de `information_schema`) e como prefixo do storage. Schedulers iteram `getAllTenants()` e não fazem nada se a lista vier vazia.

```java
import java.util.List;
import java.util.Optional;

import br.com.seedgrid.backup.spi.TenantProvider;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MyTenantBackupProvider implements TenantProvider {

    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    @Override
    public Optional<String> getCurrentTenant() {
        return Optional.ofNullable(CURRENT.get());   // ou resolver do contexto da requisição
    }

    @Override
    public void setCurrentTenant(String tenantId) {
        CURRENT.set(tenantId);
    }

    @Override
    public void clearCurrentTenant() {
        CURRENT.remove();
    }

    @Override
    public List<String> getAllTenants() {
        return List.of("tenant_a", "tenant_b");      // schemas existentes
    }
}
```

O teste `TestTenantProvider` usa o mesmo padrão com `@Alternative @Priority(1)`; a extensão `seedgrid-subdomain-tenancy` fornece um `MultiTenantBackupProvider` (`java/seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/backup/MultiTenantBackupProvider.java`).

## 5. Reagir ao fim do export (`SgUserEvent`)

Fonte: `ExportService#notifyRequester` e teste `services/ExportUserEventIT` (observer `AFTER_SUCCESS`).

```java
import br.com.seedgrid.commons.events.SgUserEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;

@ApplicationScoped
public class BackupFinishedListener {

    void on(@Observes(during = TransactionPhase.AFTER_SUCCESS) SgUserEvent event) {
        if (!"backup".equals(event.channel())) {
            return;
        }
        // event.event(): "backup.finished.success" ou "backup.finished.error"
        String jobId = (String) event.data().get("exportPublicId");
        String status = (String) event.data().get("status");    // "DONE" ou "FAILED"
        String user = event.userPublicId();
        // ex.: empurrar notificação realtime ao usuário
    }
}
```

## 6. Trocar o canal de notificação (`ExportNotificationService`)

Fonte: `spi/ExportNotificationService.java`; default `EmailExportNotificationService` é `@DefaultBean`, então basta declarar outro bean. O `NotificationSchedulerService` só chama `notifyReady` quando `isEnabled()` e `seedgrid.backup.notification.enabled` são `true`; exceção → `notificationError` gravado e nova tentativa após `retry-delay`, até `max-retries`.

```java
import br.com.seedgrid.backup.entities.ExportJob;
import br.com.seedgrid.backup.spi.ExportNotificationService;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class WebhookExportNotificationService implements ExportNotificationService {

    @Override
    public void notifyReady(ExportJob job) throws Exception {
        String jobId = job.getPublicId();
        String requester = job.getCreateUserPublicId();
        // enviar para o canal desejado; lançar exceção para provocar retry
    }
}
```

## 7. Template do e-mail

Fonte: `spi/impl/DefaultTemplateBackupProvider.java`. Sem código: coloque no classpath do host `templates/backup/ready-notification.html` (tem prioridade sobre `templates/backup-default/html/ready-notification.html`). Placeholders substituídos por `String.replace`: `{{jobId}}`, `{{format}}`, `{{scope}}`, `{{sizeBytes}}`, `{{finishedAt}}`.

Ou implemente `TemplateBackupProvider#readyNotification(ExportJob)` em um bean próprio.

## 8. Configuração

Exemplos de `application.properties` (mínimo, completo e receitas) estão em [[SeedGrid/Extensions/backup/Configuracao|Configuração do backup]].
