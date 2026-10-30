---
tags: [seedgrid, library, filemanagement, exemplos]
fonte: java/seedgrid-quarkus-lib-filemanagement, platform-examples/examples/seedgrid-filemanagement-example
branch: main
commit: 35c89c7cf7
analisado-em: 2026-10-14
---

# SeedGrid File Management — Exemplos

Voltar: [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral do filemanagement]] · [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração do filemanagement]]

## Dependência

```xml
<dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-filemanagement</artifactId>
    <version>2026.07.08</version>
</dependency>
<!-- Para backends de nuvem, declare também o SDK (optional na lib), ex.: software.amazon.awssdk:s3 -->
```

## Fachada com backend configurável (exemplo real)

Fonte: `platform-examples/examples/seedgrid-filemanagement-example/src/main/java/br/com/seedgrid/filemanagementexample/service/DocumentStorageService.java`.

```java
@ApplicationScoped
public class DocumentStorageService {

    @Inject
    FileStorageRegistry registry;

    @ConfigProperty(name = "app.storage.type", defaultValue = "filesystem")
    String storageType;

    @ConfigProperty(name = "app.storage.filesystem.base-path")
    String basePath;

    public FileStorage storage() {
        Map<String, String> config = Map.of("base-path", basePath);
        return registry.get(storageType, config);
    }

    public StorageKey store(String filename, byte[] content, String prefix, String contentType)
            throws StorageException {
        StorageOptions options = StorageOptions.builder()
                .prefix(prefix)
                .contentType(contentType)
                .build();
        return storage().store(filename, content, options);
    }

    public StorageKey keyOf(String relativePath) {
        return StorageKey.of(storageType, relativePath);
    }

    public byte[] retrieve(StorageKey key) throws StorageException { return storage().retrieve(key); }
    public FileMetadata metadata(StorageKey key) throws StorageException { return storage().getMetadata(key); }
    public void delete(StorageKey key) throws StorageException { storage().delete(key); }
}
```

```properties
# application.properties do exemplo (propriedades DO EXEMPLO, não da lib)
app.storage.type=filesystem
app.storage.filesystem.base-path=${STORAGE_BASE_PATH:${java.io.tmpdir}/seedgrid-filemanagement-example}
```

## S3 com credenciais opcionais

Fonte: `README.md` (chaves conferidas em `S3StorageFactory`).

```java
Map<String, String> s3Config = new HashMap<>();
s3Config.put("bucket", "<bucket>");
s3Config.put("region", "us-east-1");
s3Config.put("access-key", System.getenv("AWS_ACCESS_KEY_ID"));     // opcional
s3Config.put("secret-key", System.getenv("AWS_SECRET_ACCESS_KEY")); // opcional

FileStorage storage = registry.get("s3", s3Config);
StorageKey key = storage.store("avatar.png", content, StorageOptions.builder()
        .prefix("users/123/avatars")
        .contentType("image/png")
        .publicRead(true)          // aplica ACL public-read no S3
        .build());
String url = storage.generateSignedUrl(key, Duration.ofMinutes(15));
```

> `HashMap.put` com valor `null` (env ausente) é aceito; o factory ignora credenciais vazias/nulas e usa a cadeia padrão do AWS SDK.

## Mapeando config própria da extension para o mapa (padrão do backup)

Fonte: `java/seedgrid-quarkus-ext-backup/runtime/src/main/java/br/com/seedgrid/backup/services/ExportService.java` → `buildStorageConfig` (trecho).

```java
private Map<String, String> buildStorageConfig(String storageType) {
    Map<String, String> config = new HashMap<>();

    switch (storageType.toLowerCase()) {
        case "filesystem":
            config.put("base-path", backupConfig.filesystem().basePath());
            break;

        case "s3":
            backupConfig.s3().bucket().ifPresent(v -> config.put("bucket", v));
            backupConfig.s3().region().ifPresent(v -> config.put("region", v));
            backupConfig.s3().accessKey().ifPresent(v -> config.put("access-key", v));
            backupConfig.s3().secretKey().ifPresent(v -> config.put("secret-key", v));
            backupConfig.s3().endpoint().ifPresent(v -> config.put("endpoint", v));
            break;

        // ... minio, azure-blob, google-drive, onedrive, gcs (mesmo padrão)

        default:
            throw new IllegalArgumentException("Unknown storage type: " + storageType);
    }

    return config;
}

// uso:
FileStorage storage = fileStorageRegistry.get(storageType, buildStorageConfig(storageType));
```

## Backend customizado

Fonte: `README.md` (contrato conferido em `FileStorageFactory`).

```java
@ApplicationScoped
public class DropboxStorageFactory implements FileStorageFactory {
    @Override public String typeIdentifier() { return "dropbox"; }

    @Override
    public FileStorage create(Map<String, String> config) {
        String token = config.get("token");
        if (token == null || token.isBlank()) {
            throw new StorageConfigurationException("Dropbox token missing");
        }
        return new DropboxStorage(token); // sua implementação de FileStorage
    }
}
```

`DropboxStorage` é hipotética (do README); um segundo factory com o mesmo `typeIdentifier` derruba o boot com `DuplicateStorageException`.

## Anexos ligados (plano 111, 2026.10.22)

Fonte: `platform-examples/examples/seedgrid-filemanagement-example` (`application.properties`, `AttachmentService`, `AttachmentFlowTest`). Com o recurso ligado, o `store` continua devolvendo o `StorageKey` de sempre e a lib grava uma linha em `sg_attachments`; quem usa guarda o **id do anexo**.

```properties
# 1) liga o registro (lido em BUILD para escolher o bean; coloque no application.properties)
seedgrid.filemanagement.registry-table.enabled=true
# 2) mapeia a entidade que a lib deixa fora do indice (NAO use quarkus.index-dependency: nao funciona, achado A8)
quarkus.hibernate-orm.mapping-files=META-INF/filemanagement-orm.xml
quarkus.hibernate-orm.packages=br.com.seedgrid.commons.persistence,br.com.seedgrid.filemanagement.domains
```

O `META-INF/filemanagement-orm.xml` tem uma linha de entidade:

```xml
<entity-mappings xmlns="https://jakarta.ee/xml/ns/persistence/orm" version="3.0">
    <entity class="br.com.seedgrid.filemanagement.domains.Attachment"/>
</entity-mappings>
```

A migration `V1300` é aplicada pelo *runner* da lib na subida, com histórico próprio. O host com o Flyway do Quarkus lista as próprias `locations`, senão a `V1300` aparece como pendente mesmo com o recurso desligado (achado A4).

```java
// o anexo nasce sozinho; "owner-key" identifica o dono (tenant, empresa ou usuario, decisao do host)
FileStorage storage = registry.get("filesystem", Map.of("base-path", basePath, "owner-key", "empresa-1"));
StorageKey key = storage.store("nota.txt", bytes, StorageOptions.builder().prefix("anexos").build());
```

## Consentimento: gravar no armazenamento do próprio usuário

Fonte: `ExampleCredentialSource`, `ConsentResource` e `FakeProviderResource` do mesmo exemplo (servidor OAuth e provedores **falsos**, sem chave real). O host entrega a credencial; a lib renova o token. O fluxo completo está em [[SeedGrid/Extensions/filemanagement/Guia-do-host-consentimento|Guia do host: consentimento]].

```java
@ApplicationScoped
public class ExampleCredentialSource implements StorageCredentialSource {
    private final Map<String, String> refreshTokens = new ConcurrentHashMap<>(); // num produto: banco, CIFRADO

    @Override
    public Optional<StorageCredential> resolve(String provider, String ownerKey) {
        return Optional.ofNullable(refreshTokens.get(provider + "|" + ownerKey)).map(StorageCredential::ofRefreshToken);
    }

    @Override // o provedor rotaciona o refresh token: o novo substitui o antigo
    public void renewed(String provider, String ownerKey, StorageCredential credential) {
        if (credential.hasRefreshToken()) {
            refreshTokens.put(provider + "|" + ownerKey, credential.refreshToken());
        }
    }
}
```

Depois da concessão, monte o storage com `auth-mode=consent` e o dono:

```java
FileStorage drive = registry.get("google-drive", Map.of(
    "auth-mode", "consent", "owner-key", "empresa-1",
    "client-id", clientId, "client-secret", clientSecret));
```

Sem uma `StorageCredentialSource` no host, o modo `consent` falha fechado (`StorageCredentialSourceMissingException`); se o usuário revogar o acesso, a lib lança `StorageConsentRequiredException` e o host leva o usuário a conceder de novo.

## StorageKey e URIs

```java
StorageKey k1 = StorageKey.filesystem("exports/2024/report.pdf");
String uri = k1.toUri();                     // "filesystem://exports/2024/report.pdf"
StorageKey k2 = StorageKey.fromUri(uri);     // bucket="exports", path="2024/report.pdf"
```

O `FilesystemStorage` resolve `basePath/bucket/path`, então o round-trip acima funciona no filesystem; no S3 a chave volta sem bucket — ver limitações em [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral do filemanagement]].
