---
tags: [seedgrid, extension, filemanagement, quarkus, spis]
fonte: java/seedgrid-quarkus-ext-filemanagement
analisado-em: 2026-10-30
gerado-por: leitura do código (interfaces `spis`), com exemplos escritos a mão
---

# filemanagement (Quarkus): SPIs

Ver também [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral]]. _Fonte: código de `seedgrid-quarkus-ext-filemanagement` (versão local 2026.10.22, não publicada)._

Cada SPI é um ponto de extensão. Para trocar o comportamento padrão, declare um bean CDI (`@ApplicationScoped`) que implemente a interface, **sem** `@Alternative` nem `@Priority`: a implementação padrão (`@DefaultBean`) cede. Uma SPI "sem padrão" precisa de uma implementação do host (ou de outro módulo) para o recurso funcionar. Os exemplos abaixo são **ilustrativos** e omitem os imports; tipos marcados como "do seu produto" (por exemplo `AdminAuditService`, `TenantContext`) não existem na extension.

| SPI | Implementação padrão | O que o padrão faz |
|---|---|---|
| [[#FileStorage]] | sem padrão | Precisa de implementação do host. |
| [[#FileStorageFactory]] | sem padrão | Precisa de implementação do host. |
| [[#AttachmentRegistry]] | `JpaAttachmentRegistry` (só com `seedgrid.filemanagement.registry-table.enabled=true`) ou `NoopAttachmentRegistry` | Grava e apaga a linha de anexo (`sg_attachments`); desligado por padrão, não faz nada. |
| [[#StorageCredentialSource]] | sem padrão | Só para `auth-mode=consent`: o host entrega a credencial do dono; sem ela a lib falha fechada. |

## FileStorage

Backend de armazenamento de arquivos (sistema de arquivos, S3, Azure Blob, MinIO, Google Cloud, Google Drive, OneDrive, Dropbox). Um novo backend entra implementando esta interface, sem mexer no módulo. Cada implementação devolve um identificador de tipo único.

**Pacote:** `br.com.seedgrid.filemanagement.spis`

**Padrão:** nenhum. O recurso que usa esta SPI precisa de uma implementação do host (ou de outro módulo).

**Outras implementações no repositório** (para consultar como exemplo):

- `S3StorageImpl` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/S3StorageFactory.java`)
- `DropboxStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/spis/FileStorage.java`)
- `AzureBlobStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/AzureBlobStorage.java`) — Armazenamento em Azure Blob Storage.
- `FilesystemStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/FilesystemStorage.java`) — Armazenamento no sistema de arquivos local.
- `GoogleCloudStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/GoogleCloudStorage.java`) — Armazenamento em Google Cloud Storage.
- `GoogleDriveStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/GoogleDriveStorage.java`) — Armazenamento no Google Drive.
- `MinIOStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/MinIOStorage.java`) — Armazenamento em MinIO.
- `OneDriveStorage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/OneDriveStorage.java`) — Armazenamento no Microsoft OneDrive.
- `S3Storage` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/storages/S3Storage.java`) — Armazenamento em AWS S3.

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

- `AzureBlobStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/AzureBlobStorageFactory.java`)
- `FilesystemStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/FilesystemStorageFactory.java`) — Factory for creating `FilesystemStorage` instances. This factory validates filesystem configuration and creates storage instances on-demand (lazy loading).
- `GoogleCloudStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/GoogleCloudStorageFactory.java`)
- `GoogleDriveStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/GoogleDriveStorageFactory.java`)
- `MinIOStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/MinIOStorageFactory.java`) — Factory for creating `FileStorage` instances backed by MinIO. Required Configuration
- `OneDriveStorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/OneDriveStorageFactory.java`)
- `S3StorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/factories/S3StorageFactory.java`) — Factory for creating `FileStorage` instances for AWS S3. Required Configuration
- `S3StorageFactory` (`seedgrid-quarkus-ext-filemanagement/runtime/src/main/java/br/com/seedgrid/filemanagement/spis/FileStorageFactory.java`)

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

## AttachmentRegistry

Registro dos anexos: grava e apaga a linha da tabela `sg_attachments` que liga um arquivo ao seu dono. Existe para quem usa a lib guardar o **id do anexo** em vez do caminho do arquivo.

**Pacote:** `br.com.seedgrid.filemanagement.spis`

**Métodos:**

- `Optional<Long> record(AttachmentRecord attachment)`: registra o anexo e devolve o id (vazio quando o registro está desligado).
- `int remove(StorageKey key)`: apaga a(s) linha(s) do arquivo indicado e devolve quantas removeu.
- `default boolean enabled()`: diz se o registro age de verdade; o `FileStorageRegistry` só decora o `FileStorage` (para acompanhar `store` e `delete`) quando é `true`. Desligado, devolve o storage puro, o mesmo objeto de antes.

`AttachmentRecord` (pacote `domains`): `storageKey` (tipo, bucket e caminho, exatamente o que o `store` devolveu), `providerFileId` (id no Drive, OneDrive ou Dropbox; o decorador de anexos o preenche nos três provedores de nuvem, e com ele a chave se reconstrói só com `StorageKey.of(tipo, id)`), `fileName`, `contentType` (opcional), `sizeBytes` e `ownerKey` (chave opaca do dono; o host decide se é tenant, empresa ou usuário e a passa na chave `owner-key` da configuração do storage). Falhas de validação e de gravação lançam `AttachmentRegistryException` (não verificada).

**Padrão:** duas implementações em `spis/impl`, ambas `@DefaultBean`: `JpaAttachmentRegistry` (JPA puro, `@Transactional`), que só existe com `seedgrid.filemanagement.registry-table.enabled=true`, e `NoopAttachmentRegistry`, que não faz nada. **A escolha é feita em BUILD**: a propriedade precisa estar no `application.properties` no build do host (só o runner de migrations a lê em runtime). Ligar sem Hibernate falha na subida, de propósito.

**Falha ao gravar a linha:** o `store` grava o arquivo **primeiro** e só registra a linha se a gravação deu certo; se o registro falhar, a lib lança `AttachmentRecordException` (pacote `exceptions`, é uma `StorageException`, sem HTTP) com a `StorageKey` do arquivo já gravado (`getKey()`) e a causa, para o host decidir o que fazer. A lib **não apaga o arquivo sozinha**. O `delete` apaga o arquivo e depois remove a linha, com a mesma exceção se a remoção da linha falhar. O log `ERROR` com o marcador `ATTACHMENT_RECORD_FAILED` (ou `ATTACHMENT_REMOVE_FAILED`) continua, junto com a exceção. Se o `delete` do arquivo falha, a linha não é tocada.

**Substituir:** declare um bean CDI que implemente `AttachmentRegistry`, sem `@Alternative` nem `@Priority`; o padrão cede.

```java
@ApplicationScoped
public class MeuAttachmentRegistry implements AttachmentRegistry {
    @Override public Optional<Long> record(AttachmentRecord attachment) { /* grave onde quiser */ return Optional.of(1L); }
    @Override public int remove(StorageKey key) { return 0; }
}
```

## StorageCredentialSource

SPI que o **host** implementa para entregar a credencial que o usuário concedeu (`auth-mode=consent`). A lib não conhece usuário, tenant nem permission (EXT-07): ela só pergunta pela credencial de um `ownerKey` opaco, o mesmo valor da chave `owner-key` da configuração do storage.

**Pacote:** `br.com.seedgrid.filemanagement.spis`

**Métodos:**

- `Optional<StorageCredential> resolve(String provider, String ownerKey)`: devolve a credencial do dono (`google-drive`, `onedrive` ou `dropbox`), ou vazio se ele ainda não concedeu ou desconectou.
- `default void renewed(String provider, String ownerKey, StorageCredential credential)`: chamado quando a lib renovou a credencial; se o provedor **rotacionou o refresh token**, o host deve gravar o novo no lugar do antigo. Padrão: não faz nada.

`StorageCredential` (pacote `domains`): `refreshToken` (obrigatório para renovar), `accessToken` e `accessTokenExpiresAt` (opcionais; a lib os renova sozinha). O `toString()` nunca mostra os tokens.

**Padrão:** nenhum. Sem um bean do host, `auth-mode=consent` falha fechado com `StorageCredentialSourceMissingException` (erro de configuração do host), e nunca cai no modo de credenciais.

**Exceções** (todas não verificadas, base `StorageConsentException`; as mensagens nunca trazem token): `StorageConsentRequiredException` (o dono não concedeu, desconectou ou o provedor revogou: leve o usuário a conceder de novo) e `StorageCredentialSourceMissingException` (sem fonte de credencial, sem `owner-key` ou provider sem suporte a consentimento). O host as mapeia para o seu `ProblemDetails`.

`TokenRefresher` (interface funcional) é de cada provider: troca o refresh token por um token de acesso novo; a lib decide **quando** renovar (com folga de 60 s antes de vencer).

```java
@ApplicationScoped
public class MinhaFonteDeCredencial implements StorageCredentialSource {
    @Override public Optional<StorageCredential> resolve(String provider, String ownerKey) {
        // leia do seu banco o refresh token cifrado do dono e decifre
        return repo.find(provider, ownerKey).map(c -> StorageCredential.ofRefreshToken(cripto.decifrar(c.refreshToken())));
    }
    @Override public void renewed(String provider, String ownerKey, StorageCredential cred) {
        repo.atualizarRefreshToken(provider, ownerKey, cripto.cifrar(cred.refreshToken()));
    }
}
```
