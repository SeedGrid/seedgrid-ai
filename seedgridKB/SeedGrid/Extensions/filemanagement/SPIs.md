---
tags: [seedgrid, extension, filemanagement, quarkus, spis]
fonte: java/seedgrid-quarkus-lib-filemanagement
analisado-em: 2026-10-27
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# filemanagement (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-lib-filemanagement` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#FileStorage]] | sem padrão | Precisa de implementação do host. |
| [[#FileStorageFactory]] | sem padrão | Precisa de implementação do host. |

## FileStorage

Backend de armazenamento de arquivos (sistema de arquivos, S3, Azure Blob, MinIO, Google Cloud, Google Drive, OneDrive, Dropbox). Um novo backend entra implementando esta interface, sem mexer no módulo. Cada implementação devolve um identificador de tipo único.

**Pacote:** `br.com.seedgrid.filemanagement.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `S3StorageImpl` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/S3StorageFactory.java`)
- `DropboxStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/spis/FileStorage.java`)
- `AzureBlobStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/AzureBlobStorage.java`) — Armazenamento em Azure Blob Storage.
- `FilesystemStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/FilesystemStorage.java`) — Armazenamento no sistema de arquivos local.
- `GoogleCloudStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/GoogleCloudStorage.java`) — Armazenamento em Google Cloud Storage.
- `GoogleDriveStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/GoogleDriveStorage.java`) — Armazenamento no Google Drive.
- `MinIOStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/MinIOStorage.java`) — Armazenamento em MinIO.
- `OneDriveStorage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/OneDriveStorage.java`) — Armazenamento no Microsoft OneDrive.
- `S3Storage` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/storages/S3Storage.java`) — Armazenamento em AWS S3.

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String typeIdentifier()` | Identificador único deste tipo de armazenamento (minúsculas, kebab-case: `filesystem`, `s3`, `azure-blob`). |
| `StorageKey store(String filename, byte[] content, StorageOptions options) throws StorageException` | Grava o arquivo e devolve a chave de armazenamento. |
| `byte[] retrieve(StorageKey key) throws StorageException` | Lê o conteúdo; lança `StorageNotFoundException` se não existir. |
| `InputStream stream(StorageKey key) throws StorageException` | Lê como stream (arquivos grandes); lança `StorageNotFoundException` se não existir. |
| `void delete(StorageKey key) throws StorageException` | Apaga o arquivo. Onde dá para detectar, lança `StorageNotFoundException` se não existir; backends cuja API de delete é idempotente (S3, MinIO) podem não fazer nada. |
| `boolean exists(StorageKey key)` | Se o arquivo existe. |
| `FileMetadata getMetadata(StorageKey key) throws StorageException` | Metadados (tamanho, content type, data de criação). |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `StorageKey store(String filename, InputStream inputStream, StorageOptions options) throws StorageException` | Grava a partir de um stream (arquivos grandes). Padrão: lê tudo e chama a versão em bytes. |
| `String generateSignedUrl(StorageKey key, Duration ttl) throws StorageException` | URL assinada temporária para download direto (S3, Azure SAS, Google Cloud). Opcional; padrão: `UnsupportedOperationException`. |
| `boolean canHandle(StorageKey key)` | Se este armazenamento atende a chave (por padrão, compara o tipo). |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuFileStorage implements FileStorage {
    @Override
    public String typeIdentifier() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public StorageKey store(String filename, byte[] content, StorageOptions options) throws StorageException {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public byte[] retrieve(StorageKey key) throws StorageException {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public InputStream stream(StorageKey key) throws StorageException {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public void delete(StorageKey key) throws StorageException {
        // implemente
    }

    @Override
    public boolean exists(StorageKey key) {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public FileMetadata getMetadata(StorageKey key) throws StorageException {
        throw new UnsupportedOperationException("implemente");
    }
}
```

## FileStorageFactory

Fábrica de `FileStorage` com criação preguiçosa: o armazenamento só é criado (e a configuração só é validada) quando alguém o usa pela primeira vez. Cada fábrica devolve o mesmo identificador de tipo do armazenamento que cria.

**Pacote:** `br.com.seedgrid.filemanagement.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `AzureBlobStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/AzureBlobStorageFactory.java`)
- `FilesystemStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/FilesystemStorageFactory.java`) — Factory for creating `FilesystemStorage` instances. This factory validates filesystem configuration and creates storage instances on-demand (lazy loading).
- `GoogleCloudStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/GoogleCloudStorageFactory.java`)
- `GoogleDriveStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/GoogleDriveStorageFactory.java`)
- `MinIOStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/MinIOStorageFactory.java`) — Factory for creating `FileStorage` instances backed by MinIO. Required Configuration
- `OneDriveStorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/OneDriveStorageFactory.java`)
- `S3StorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/S3StorageFactory.java`) — Factory for creating `FileStorage` instances for AWS S3. Required Configuration
- `S3StorageFactory` (`seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/spis/FileStorageFactory.java`)

**Métodos que você implementa:**

| Método | O que faz |
|---|---|
| `String typeIdentifier()` | Identificador do tipo que a fábrica cria; deve bater com o do `FileStorage` criado. |
| `FileStorage create(Map<String, String> config)` | Cria o `FileStorage` com a configuração dada; valide-a e lance `StorageConfigurationException` se inválida. |

**Métodos com implementação padrão** (sobrescreva só se precisar):

| Método | O que faz |
|---|---|
| `boolean isAvailable()` | Se o armazenamento pode ser criado com a configuração atual (para armazenamentos opcionais). Padrão: `true`. |

**Esqueleto de implementação** (os métodos acima, sem o corpo; veja as implementações reais listadas):

```java
@ApplicationScoped
public class MeuFileStorageFactory implements FileStorageFactory {
    @Override
    public String typeIdentifier() {
        throw new UnsupportedOperationException("implemente");
    }

    @Override
    public FileStorage create(Map<String, String> config) {
        throw new UnsupportedOperationException("implemente");
    }
}
```
