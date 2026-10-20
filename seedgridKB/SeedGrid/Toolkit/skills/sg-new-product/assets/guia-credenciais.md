# Como obter as credenciais de cada provider de armazenamento

> **Procedimento do fornecedor, não da KB SeedGrid.** A KB diz quais chaves cada provider lê, não como obtê-las. Os passos abaixo resumem o caminho usual em cada console; as telas mudam, então **confira sempre a documentação oficial** (links ao fim de cada seção). Nunca cole credencial no chat, no plano, em ADR ou em commit: elas vão só para `backend/dev.env` (que o git ignora) e, em produção, para os segredos do EasyPanel.

Use esta página quando o usuário perguntar "como obtenho isso?" para uma pendência de armazenamento. O produto grava o **avatar** e o **backup**, cada um no seu destino (`produto.json`: `armazenamentoAvatar` e `armazenamentoBackup`).

## filesystem
Nada a obter. Os arquivos ficam em `./data/avatars` e `./data/arquivos` (pasta ignorada pelo git). Em produção, monte um volume persistente nesse caminho.

## minio
Sem credencial externa em desenvolvimento: o `docker-compose.yml` sobe o MinIO e o usuário (`admin`) e a senha são gerados em `.env` e `backend/dev.env`. Interface: `http://localhost:9001`.

## s3 (Amazon S3, ou compatível)
1. Crie o bucket (o nome sugerido já está no `dev.env`).
2. No IAM, crie um usuário (ou papel) com permissão de leitura e escrita só nesse bucket e gere uma **chave de acesso**: `access-key` e `secret-key`.
3. Cole nos campos `..._S3_ACCESS_KEY` e `..._S3_SECRET_KEY` do `backend/dev.env`. Sem o par, o SDK usa a cadeia padrão de credenciais da AWS (variáveis de ambiente, perfil, papel da máquina).
4. S3 compatível (Wasabi, Backblaze, R2): acrescente também `..._S3_ENDPOINT` com a URL do serviço.
- Documentação: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

## azure-blob
1. Crie uma conta de armazenamento e um container (o nome sugerido já está no `dev.env`).
2. Em "Chaves de acesso" da conta, copie a **connection string**.
3. Cole em `..._AZURE_BLOB_CONNECTION_STRING`. Alternativa: `..._ACCOUNT_NAME` e `..._ACCOUNT_KEY`.
- Documentação: https://learn.microsoft.com/azure/storage/common/storage-account-keys-manage

## gcs (Google Cloud Storage)
1. No Google Cloud, crie o bucket e anote o **ID do projeto** (`..._GCS_PROJECT_ID`).
2. Crie uma **conta de serviço** com o papel "Storage Object Admin" no bucket e gere uma chave JSON.
3. Guarde o JSON fora do repositório e aponte `..._GCS_CREDENTIALS_FILE` para o caminho dele (ou use `..._CREDENTIALS_JSON` com o conteúdo).
- Documentação: https://cloud.google.com/iam/docs/keys-create-delete

## google-drive
O provider usa **conta de serviço** (não o login da sua conta Google) e uma pasta compartilhada com ela.
1. No Google Cloud, ative a **Google Drive API** no projeto.
2. Crie uma conta de serviço e gere uma chave JSON (como no GCS). Anote o e-mail da conta de serviço.
3. No Google Drive, crie a pasta raiz dos arquivos e **compartilhe com o e-mail da conta de serviço** (permissão de editor).
4. O `root-folder-id` é o trecho final da URL da pasta (`.../folders/<ID>`): `..._GOOGLE_DRIVE_ROOT_FOLDER_ID`. O JSON vai em `..._CREDENTIALS_FILE`.
5. Atenção: o provider torna o arquivo **público** ao gerar o link (a KB avisa). Para avatar isso pesa; avalie antes.
- Um "app password" do Google serve para SMTP, **não** para o Drive. O fluxo de "conceder permissão" na tela do Google (OAuth do usuário) não existe neste provider.
- Documentação: https://developers.google.com/workspace/guides/create-credentials

## onedrive
1. No portal do Microsoft Entra, registre um aplicativo e anote o **ID do aplicativo** (`client-id`) e o **ID do diretório** (`tenant-id`).
2. Crie um **segredo do cliente** (`client-secret`).
3. Em permissões de API, conceda ao aplicativo a permissão de aplicativo (não delegada) de arquivos do Microsoft Graph e dê o consentimento do administrador.
4. Preencha `..._ONEDRIVE_CLIENT_ID`, `..._CLIENT_SECRET` e `..._TENANT_ID`. A pasta raiz padrão é `/seedgrid/files`.
- Documentação: https://learn.microsoft.com/entra/identity-platform/quickstart-register-app
