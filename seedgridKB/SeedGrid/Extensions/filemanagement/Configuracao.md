---
tags: [seedgrid, library, filemanagement, configuracao]
fonte: java/seedgrid-quarkus-lib-filemanagement
branch: main
commit: 35c89c7cf7
analisado-em: 2026-10-14
---

# SeedGrid File Management — Configuração

Voltar: [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral do filemanagement]] · [[SeedGrid/Extensions/filemanagement/Exemplos|Exemplos do filemanagement]] · [[SeedGrid/Extensions/filemanagement/Rust|Porte Rust]]

## 1. Cabeçalho

| Item | Valor |
|---|---|
| Prefixos MicroProfile Config | **Nenhum.** A lib não lê `application.properties`/env |
| Mecanismo | **Mapa de configuração por chamada**: `FileStorageRegistry#get(String type, Map<String,String> config)` → `FileStorageFactory#create(config)`. Cada factory lê chaves fixas do mapa com `config.get(...)`/`getOrDefault(...)` |
| Quem preenche o mapa | O host/extension consumidora, a partir de onde quiser (MP Config, env, banco, Vault). Ex.: backup mapeia `seedgrid.backup.<tipo>.*`; o exemplo usa `app.storage.*` |
| Fase | Runtime, **lazy**: validado no primeiro `get(type, config)` com aquele conteúdo de mapa; instâncias cacheadas por (tipo + conteúdo do mapa) |
| Arquivos de config da lib | `src/main/resources/application.properties` existe e está **vazio** |

Investigação (**Confirmado**): nenhum `@ConfigMapping`, `@ConfigRoot`, `@ConfigProperty`, `ConfigProvider`, `System.getenv`/`getProperty` em `src/main`. As únicas leituras de config são `config.get/getOrDefault` nos factories em `java/seedgrid-quarkus-lib-filemanagement/src/main/java/br/com/seedgrid/filemanagement/factories/`.

Como os nomes abaixo são **chaves do mapa**, não propriedades MP, não existem variáveis de ambiente associadas pela lib. A coluna "Propriedade" usa a notação `<type>` → `<chave>`.

## 2. Chaves do mapa por backend

### 2.1 `filesystem`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `filesystem` → `base-path` | `String` (caminho) | diretório gravável | — | Sim | Cria o diretório se não existir; falha se não for diretório ou não for gravável (`StorageConfigurationException`) | Raiz de todos os arquivos; `prefix` vira subpasta | — | Runtime (lazy) | `FilesystemStorageFactory#create` → `FilesystemStorage(basePath)` |

### 2.2 `s3`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `s3` → `bucket` | `String` | nome de bucket | — | Sim | Ausente/vazio → `StorageConfigurationException` | Todas as operações | — | Runtime (lazy) | `S3StorageFactory#create` |
| `s3` → `region` | `String` | região AWS (`Region.of`) | `us-east-1` | Não | Região do `S3Client` e do `S3Presigner` | Cliente/presigner | — | Runtime (lazy) | `S3StorageFactory#create` (`getOrDefault`) |
| `s3` → `access-key` 🔒 | `String` | — | — | Condicional: só é usada se `secret-key` também vier | Com ambas, usa `StaticCredentialsProvider`; sem, usa a cadeia padrão do AWS SDK | Credenciais | par com `secret-key` | Runtime (lazy) | `S3StorageFactory.S3StorageImpl` (construtor) |
| `s3` → `secret-key` 🔒 | `String` | — | — | Condicional (par com `access-key`) | idem | Credenciais | par com `access-key` | Runtime (lazy) | idem |
| `s3` → `endpoint` | `String` (URI) | URL de serviço S3-compatível (MinIO, LocalStack) | — | Não | `endpointOverride` no cliente e no presigner | Cliente/presigner | — | Runtime (lazy) | idem |

### 2.3 `minio`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `minio` → `endpoint` | `String` (URL) | ex.: `http://<host>:9000` | — | Sim | Ausente → `StorageConfigurationException` | `MinioClient` | — | Runtime (lazy) | `MinIOStorageFactory#create` |
| `minio` → `access-key` 🔒 | `String` | — | — | Sim | idem | Credenciais | — | Runtime (lazy) | idem |
| `minio` → `secret-key` 🔒 | `String` | — | — | Sim | idem | Credenciais | — | Runtime (lazy) | idem |
| `minio` → `bucket` | `String` | — | — | Sim | idem | Bucket alvo | — | Runtime (lazy) | idem |
| `minio` → `region` | `String` | — | `us-east-1` | Não | Repassado ao `MinIOStorage` | Cliente | — | Runtime (lazy) | idem (`getOrDefault`) |

### 2.4 `azure-blob`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `azure-blob` → `container` | `String` | nome de container | — | Sim | Ausente → `StorageConfigurationException`; criado no init se não existir | Container alvo | — | Runtime (lazy) | `AzureBlobStorageFactory#create`; `AzureBlobStorage#initialize` |
| `azure-blob` → `connection-string` 🔒 | `String` | connection string Azure | — | Condicional: ela **ou** `account-name`+`account-key` | Tem prioridade sobre nome+chave | Autenticação | alternativa a `account-name`/`account-key` | Runtime (lazy) | idem |
| `azure-blob` → `account-name` | `String` | — | — | Condicional (sem `connection-string`) | Endpoint `https://<account-name>.blob.core.windows.net` + `StorageSharedKeyCredential` | Autenticação | par com `account-key` | Runtime (lazy) | idem |
| `azure-blob` → `account-key` 🔒 | `String` | — | — | Condicional (sem `connection-string`) | idem | Autenticação | par com `account-name` | Runtime (lazy) | idem |

### 2.5 `gcs` (Google Cloud Storage)

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `gcs` → `bucket` | `String` | — | — | Sim | Ausente → `StorageConfigurationException`; bucket inexistente → `StorageInitializationException` no init | Bucket alvo | — | Runtime (lazy) | `GoogleCloudStorageFactory#create`; `GoogleCloudStorage#initialize` |
| `gcs` → `project-id` | `String` | — | — | Sim | Ausente → `StorageConfigurationException` | `StorageOptions.setProjectId` | — | Runtime (lazy) | idem |
| `gcs` → `credentials-file` 🔒 | `String` (caminho de JSON de service account) | — | — | Condicional: ela **ou** `credentials-json` (o factory não valida, mas o init lança `StorageInitializationException` sem nenhuma) | Tem prioridade sobre `credentials-json` | `ServiceAccountCredentials.fromStream` | alternativa a `credentials-json` | Runtime (lazy) | `GoogleCloudStorage#initialize` |
| `gcs` → `credentials-json` 🔒 | `String` (conteúdo JSON) | — | — | Condicional (ver acima) | Usada se não houver `credentials-file` | idem | alternativa | Runtime (lazy) | idem |

### 2.6 `google-drive`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `google-drive` → `root-folder-id` | `String` | ID de pasta do Drive | — | Sim | Ausente → `StorageConfigurationException`; vira o `bucket` da `StorageKey` | Pasta raiz dos uploads | — | Runtime (lazy) | `GoogleDriveStorageFactory#create` |
| `google-drive` → `credentials-file` 🔒 | `String` (caminho) | JSON de service account | — | Condicional: ela **ou** `credentials-json` (validado no factory) | Prioridade sobre `credentials-json`; escopo `drive.file` | Autenticação | alternativa | Runtime (lazy) | `GoogleDriveStorageFactory#create`; `GoogleDriveStorage` (construtor) |
| `google-drive` → `credentials-json` 🔒 | `String` (conteúdo JSON) | — | — | Condicional | idem | Autenticação | alternativa | Runtime (lazy) | idem |

**Modo consentimento (`auth-mode=consent`):** o token é do usuário, vindo da `StorageCredentialSource` do host (seção 3.2). Passam a valer `client-id` e `client-secret` do **cliente OAuth do produto**; `root-folder-id` vira opcional (padrão: a raiz do Drive do usuário) e `credentials-file`/`credentials-json` não se aplicam. Nenhum arquivo vira público (`generateSignedUrl` lança `UnsupportedOperationException`).

### 2.7 `onedrive`

| Propriedade | Tipo | Valores aceitos | Padrão | Obrigatória | Comportamento | Uso | Relações | Fase | Origem |
|---|---|---|---|---|---|---|---|---|---|
| `onedrive` → `client-id` | `String` | App registration Azure AD | — | Sim | Qualquer das três ausente → `StorageConfigurationException` | `ClientSecretCredential` | com `client-secret`, `tenant-id` | Runtime (lazy) | `OneDriveStorageFactory#create`; `OneDriveStorage` (construtor) |
| `onedrive` → `client-secret` 🔒 | `String` | — | — | Sim | idem | idem | idem | Runtime (lazy) | idem |
| `onedrive` → `tenant-id` | `String` | tenant Azure AD (não é tenant da aplicação) | — | Sim | idem | idem | idem | Runtime (lazy) | idem |
| `onedrive` → `root-folder-path` | `String` | caminho no drive | `/seedgrid/files` | Não | Pasta raiz; vira o `bucket` da `StorageKey` | Uploads | — | Runtime (lazy) | `OneDriveStorageFactory#create` (`getOrDefault`) |

**Modo consentimento (`auth-mode=consent`):** `client-id` e `client-secret` do cliente OAuth do produto; `tenant-id` é opcional (padrão `common`); o token vem da `StorageCredentialSource`.

### 2.8 `dropbox`

| Propriedade | Tipo | Padrão | Obrigatória | Comportamento |
|---|---|---|---|---|
| `dropbox` → `auth-mode` | `String` | `credentials` | Não | `credentials` ou `consent` |
| `dropbox` → `access-token` 🔒 | `String` | — | Condicional (`credentials`) | Token fixo da conta do app; **ou** `refresh-token` + `app-key` + `app-secret` |
| `dropbox` → `refresh-token` 🔒, `app-key`, `app-secret` 🔒 | `String` | — | Condicional (`credentials`) | Renovação do token da conta do app |
| `dropbox` → `app-key`, `app-secret` 🔒 | `String` | — | Sim em `consent` | App do produto no console do Dropbox; o token do usuário vem da `StorageCredentialSource` |
| `dropbox` → `root-folder-path` | `String` | — | Não | Pasta raiz; vira o `bucket` da `StorageKey` |
| `dropbox` → `api-url`, `content-url`, `token-url` | `String` | endpoints oficiais | Não | Proxy e teste |

Usa a API HTTP v2 por `java.net.http`, **sem dependência nova**.

## 3.1 Anexos (tabela `sg_attachments`)

| Propriedade | Padrão | Efeito |
|---|---|---|
| `seedgrid.filemanagement.registry-table.enabled` | `false` | Liga o registro de anexos. Desligado: sem migration, sem tabela e sem gravação (o comportamento de sempre). Ligado: o runner migra a `V1300` e `store`/`delete` gravam e apagam a linha. **Lida em BUILD para escolher o bean**; coloque no `application.properties`. |
| `seedgrid.migrations.host-managed` | `false` | Quando `true`, o host migra o banco e o runner da lib não age (use nas tenancies). |
| `owner-key` (chave do mapa de qualquer backend) | vazio | Dono do anexo, opaco; gravado em `sg_attachments.owner_key`. |

Migration: `V1300__filemanagement_ddl.sql` na pasta `db/migration/filemanagement`, faixa 1300–1399, histórico `sg_flyway_schema_history_filemanagement`. **Atenção:** um host com o Flyway no padrão e `migrate-at-start=true` varre `db/migration` e enxerga a `V1300` como pendente mesmo com o recurso desligado; liste as `locations` do Flyway do host explicitamente. Para o host mapear a entidade, use `quarkus.hibernate-orm.mapping-files=META-INF/filemanagement-orm.xml` (um XML de uma linha, `<entity class="br.com.seedgrid.filemanagement.domains.Attachment"/>`) e inclua `br.com.seedgrid.commons.persistence` em `quarkus.hibernate-orm.packages`; a classe `Attachment` fica fora do índice da lib de propósito. **Não use `quarkus.index-dependency` para isso: não funciona** (o Quarkus usa o `jandex.idx` que o jar já traz e não reindexa; achado A8 do plano 111, provado no exemplo da lib).

## 3.2 Consentimento (`auth-mode` e `owner-key`)

| Chave do mapa | Padrão | Efeito |
|---|---|---|
| `auth-mode` | `credentials` | `credentials` (o de sempre, inalterado) ou `consent` (token do usuário). Vale em `google-drive`, `onedrive` e `dropbox`. |
| `owner-key` | vazio | Chave **opaca** do dono do token (tenant, empresa ou usuário, quem decide é o host); obrigatória em `consent`. Também é gravada em `sg_attachments.owner_key`. |

O cache do registry considera o dono: tokens de donos diferentes não compartilham instância, e quando o token renova a instância antiga é descartada. Veja o [[SeedGrid/Extensions/filemanagement/Guia-do-host-consentimento|Guia do host: consentimento]].

## 3. Propriedades de frameworks

Para os SPIs e as fábricas, nenhuma exigida e não é necessário `quarkus.index-dependency.*`: o jar empacota `META-INF/jandex.idx` (`jandex-maven-plugin` no pom; confirmado também em comentário de `platform-examples/examples/seedgrid-filemanagement-example/src/main/resources/application.properties`).

## 4. Propriedades só de testes/exemplos

| Propriedade | Onde | Observação |
|---|---|---|
| `quarkus.log.level`, `quarkus.log.category."br.com.seedgrid".level` | idem | logging de teste |
| `app.storage.type` (default `filesystem` no `@ConfigProperty`), `app.storage.filesystem.base-path` | `platform-examples/examples/seedgrid-filemanagement-example` → `DocumentStorageService` | propriedades **do exemplo**, que montam o mapa `Map.of("base-path", basePath)` |

## 5. Aliases, obsoletas, renomeações

Nenhuma propriedade da lib (ela não lê MicroProfile Config).

- Mapeamentos feitos por consumidores (não pertencem a esta lib): backup `seedgrid.backup.<tipo>.*` → chaves acima (`ExportService#buildStorageConfig`); security (avatar) em `UserAvatarService#buildStorageConfig`. Detalhes nas notas de cada extension: [[SeedGrid/Extensions/backup/Configuracao|Configuração do backup]], [[SeedGrid/Extensions/security/Configuracao|Configuração do security]].

## 6. Configuração mínima

Não há `application.properties` da lib. Mínimo no código do host:

```java
FileStorage storage = registry.get("filesystem", Map.of("base-path", "/var/data/files"));
```

## 7. Configuração completa comentada (mapas por backend)

```java
// filesystem
Map.of("base-path", "/var/data/files");

// s3 (credenciais opcionais: sem elas usa a cadeia padrão do AWS SDK)
Map<String, String> s3 = new HashMap<>();
s3.put("bucket", "<bucket>");
s3.put("region", "us-east-1");                     // padrão us-east-1
s3.put("access-key", "<SEGREDO:aws-access-key>");
s3.put("secret-key", "<SEGREDO:aws-secret-key>");
s3.put("endpoint", "http://<host>:9000");          // opcional (S3-compatível)

// minio (todas obrigatórias, exceto region)
Map.of("endpoint", "http://<host>:9000", "access-key", "<SEGREDO:minio-access-key>",
       "secret-key", "<SEGREDO:minio-secret-key>", "bucket", "<bucket>");

// azure-blob: container + (connection-string OU account-name + account-key)
Map.of("container", "<container>", "connection-string", "<SEGREDO:azure-connection-string>");

// gcs: bucket + project-id + (credentials-file OU credentials-json)
Map.of("bucket", "<bucket>", "project-id", "<project>", "credentials-file", "/etc/<sa>.json");

// google-drive: root-folder-id + (credentials-file OU credentials-json)
Map.of("root-folder-id", "<folder-id>", "credentials-json", "<SEGREDO:google-sa-json>");

// onedrive
Map.of("client-id", "<client-id>", "client-secret", "<SEGREDO:onedrive-client-secret>",
       "tenant-id", "<azure-tenant-id>", "root-folder-path", "/seedgrid/files");
```

## 8. Receitas

- **Guardar a config em `application.properties` do host**: declare propriedades próprias (ex.: `app.storage.*`) com `@ConfigProperty` e monte o mapa — padrão do exemplo `DocumentStorageService`.
- **Vários buckets do mesmo tipo**: chame `registry.get("s3", configA)` e `registry.get("s3", configB)`; o cache separa por conteúdo do mapa.
- **Trocar de backend sem mudar código de negócio**: parametrize o `type` (ex.: `app.storage.type`) e monte o mapa por tipo, como faz `ExportService#buildStorageConfig` no backup.
- **Backend novo**: implemente `FileStorageFactory` (`@ApplicationScoped`) com `typeIdentifier` único e valide as chaves em `create`.

## 9. Dúvidas e lacunas

- Para usar um backend de nuvem o host precisa declarar o SDK (dependências `optional` no pom). **Confirmado** (2026-10-21): `mvn dependency:tree` de um produto com `seedgrid-filemanagement` não traz nenhum SDK de nuvem; o `quarkus:build` passou a incluir o SDK declarado sem conflito. Sem o SDK, `create` deve falhar com `NoClassDefFoundError` (**Inferência**, não executado).
- Equivalência com a config do crate Rust: [[SeedGrid/Extensions/filemanagement/Configuracao-Rust|Configuração Rust do filemanagement]].
