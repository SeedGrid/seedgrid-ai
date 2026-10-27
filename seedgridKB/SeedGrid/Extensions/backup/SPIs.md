---
tags: [seedgrid, extension, backup, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-backup
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# backup (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/backup/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-backup` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#BackupExporter]] | sem padrão | Precisa de implementação do host. |
| [[#ExportNotificationService]] | `EmailExportNotificationService` | Avisa por e-mail (cliente de e-mail do Vert.x), com a configuração `seedgrid.backup.mailer.*`. |
| [[#TemplateBackupProvider]] | `DefaultTemplateBackupProvider` | Usa os templates `templates/backup-default/html/`; o host sobrescreve colocando os seus em `templates/backup/`. |
| [[#TenantProvider]] | `SingleTenantBackupProvider` | Default single-tenant TenantProvider. |

## BackupExporter

Exportador de backup: gera os artefatos de um formato (CSV em ZIP, dump SQL em ZIP, ...). Novos formatos entram implementando esta interface, sem mexer no módulo. Cada implementação devolve um `BackupFormat` único.

**Pacote:** `br.com.seedgrid.backup.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `CsvZipExporter` (`seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/exporters/CsvZipExporter.java`) — Exportador CSV em ZIP (portabilidade e LGPD).
- `SqlDumpZipExporter` (`seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/exporters/SqlDumpZipExporter.java`) — SQL dump + ZIP exporter (restauracao tecnica). Gera, por dataset, um arquivo `data/.sql` com statements `INSERT INTO` — um por linha — mais `manifest.json` e `checksums.txt`, tudo compactado em ZIP.
- `CsvZipExporter` (`seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/spis/BackupExporter.java`) — Exportador CSV em ZIP (portabilidade e LGPD).

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `BackupFormat format()` | Formato que este exportador atende; deve ser único entre as implementações. |
| `ExportResult export(ExportContext context) throws ExportException` | Executa a exportação: extrai os dados (respeitando escopo e tenant), gera os arquivos e o manifesto, compacta, grava o artefato e informa o progresso por `context.updateProgress(...)`. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `void validate(ExportContext context) throws ExportValidationException` | Recusa configurações incompatíveis antes de exportar (por exemplo, dump SQL exige certo banco). Padrão: não valida. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuBackupExporter implements BackupExporter {
    @Override
    public BackupFormat format() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public ExportResult export(ExportContext context) throws ExportException {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## ExportNotificationService

Avisa o usuário de que a exportação ficou pronta. O padrão envia e-mail; o host pode trocar o canal.

**Pacote:** `br.com.seedgrid.backup.spis`

**Padrão (`@DefaultBean`):**

- `EmailExportNotificationService` — Avisa por e-mail (cliente de e-mail do Vert.x), com a configuração `seedgrid.backup.mailer.*`.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `void notifyReady(ExportJob job) throws Exception` | Avisa que a exportação ficou pronta. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `boolean isEnabled()` | Se este notificador está ligado e configurado. Padrão: `true`. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuExportNotificationService implements ExportNotificationService {

    @Override
    public void notifyReady(ExportJob job) throws Exception {
        meuEnvio.avisar(job); // o job tem o que o usuario precisa para baixar o arquivo
    }

    @Override
    public boolean isEnabled() {
        return true; // false desliga o aviso
    }
}
```

## TemplateBackupProvider

Renderiza os templates de notificação do backup (hoje, o HTML do aviso de exportação pronta).

**Pacote:** `br.com.seedgrid.backup.spis`

**Padrão (`@DefaultBean`):**

- `DefaultTemplateBackupProvider` — Usa os templates `templates/backup-default/html/`; o host sobrescreve colocando os seus em `templates/backup/`.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String readyNotification(ExportJob job)` | Constrói o corpo HTML da notificação de exportação pronta. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuTemplateBackupProvider implements TemplateBackupProvider {
    @Override
    public String readyNotification(ExportJob job) {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## TenantProvider

Contexto de tenant para o backup, opcional: o módulo é agnóstico a multitenancy. Um host multi-tenant o implementa para o backup resolver o tenant corrente, propagá-lo aos workers assíncronos e percorrer todos os tenants nos jobs agendados.

**Pacote:** `br.com.seedgrid.backup.spis`

**Padrão (`@DefaultBean`):**

- `SingleTenantBackupProvider` — Default single-tenant TenantProvider.

**Outras implementações no repositório** (para consultar como exemplo):

- `MultiTenantBackupProvider` (`seedgrid-quarkus-ext-subdomain-tenancy/runtime/src/main/java/br/com/seedgrid/subdomaintenancy/backup/MultiTenantBackupProvider.java`) — Multitenant implementation of TenantProvider backed by TenantContext and the master tenant repository. This bean overrides the default single-tenant provider from seedgrid-backup when subdomain-tenancy is present.

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `Optional<String> getCurrentTenant()` | Identificador do tenant corrente, se houver. Padrão: vazio. |
| `void setCurrentTenant(String tenantId)` | Define o tenant corrente (usado ao propagar o contexto para workers assíncronos). Padrão: não faz nada. |
| `void clearCurrentTenant()` | Limpa o tenant corrente. Padrão: não faz nada. |
| `List<String> getAllTenants()` | Todos os tenants, para os jobs agendados (limpeza por retenção, fila) percorrerem. Padrão: lista vazia; app single-tenant devolve um só id ou vazio. |

**Exemplo de implementação:**

```java
@ApplicationScoped
public class MeuBackupTenantProvider implements br.com.seedgrid.backup.spis.TenantProvider {

    @Inject
    TenantRepository tenants;

    // so getAllTenants e' obrigatorio para jobs agendados percorrerem os tenants;
    // os demais metodos tem implementacao padrao (single-tenant)
    @Override
    public List<String> getAllTenants() {
        return tenants.listarIdentificadoresAtivos();
    }
}
```
