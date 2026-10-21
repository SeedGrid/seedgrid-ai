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

## StorageKey e URIs

```java
StorageKey k1 = StorageKey.filesystem("exports/2024/report.pdf");
String uri = k1.toUri();                     // "filesystem://exports/2024/report.pdf"
StorageKey k2 = StorageKey.fromUri(uri);     // bucket="exports", path="2024/report.pdf"
```

O `FilesystemStorage` resolve `basePath/bucket/path`, então o round-trip acima funciona no filesystem; no S3 a chave volta sem bucket — ver limitações em [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral do filemanagement]].
