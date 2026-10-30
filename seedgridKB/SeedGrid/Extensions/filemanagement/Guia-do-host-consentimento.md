---
tags: [seedgrid, extension, filemanagement, consentimento, oauth, host]
fonte: java/seedgrid-quarkus-ext-filemanagement
analisado-em: 2026-10-30
gerado-por: plano 111 do work (decisões D1 a D6, 2026-10-30) e leitura do código da lib; passos nos consoles dos provedores escritos de memória e a confirmar na documentação atual de cada um
---

# Guia do host: consentimento do usuário no armazenamento

Como um host (um produto SeedGrid) faz o usuário conceder acesso ao **próprio** Google Drive, OneDrive ou Dropbox e passa a gravar arquivos nele. A lib `filemanagement` só grava e renova o token; **o fluxo de consentimento é do host**. Ver [[SeedGrid/Extensions/filemanagement/Visao-geral|Visão geral]], [[SeedGrid/Extensions/filemanagement/SPIs|SPIs]] (`StorageCredentialSource`) e [[SeedGrid/Extensions/filemanagement/Configuracao|Configuração]] (seção 3.2). Decisão: ADR 57 da KB de plataforma.

## Quem faz o quê

| Quem | O que faz |
|---|---|
| **Lançador do produto** | Cria **um** aplicativo OAuth por provedor no console dele e cadastra **uma** URL de retorno fixa do produto (uma vez, na criação do produto). Guarda o `client-id` e o `client-secret` (ou `app-key` e `app-secret`) na configuração do produto. |
| **Usuário final** | Clica em "Conectar", concede no provedor e volta ao produto. Não cadastra nada. |
| **Host (back)** | Inicia o fluxo, recebe o retorno, guarda o refresh token **cifrado** e implementa `StorageCredentialSource`. |
| **Host (front)** | Botão de conectar, página de retorno e estado da conexão. |
| **`filemanagement`** | Grava no armazenamento do usuário e renova o token de acesso. **Não conhece usuário, tenant nem permission.** |

## A URL de retorno é fixa, não é a do tenant

O provedor só aceita URLs de retorno cadastradas antes e compara de forma exata; por isso não existe uma URL por tenant (`cliente1.crm.seedgrid.com.br`). Use **uma URL fixa por produto**, por exemplo `https://crm.seedgrid.com.br/public/storage/callback/{provider}`, cadastrada uma vez no console. O tenant viaja dentro do `state`, e depois do retorno a API **redireciona o navegador para o subdomínio do tenant**.

## O fluxo (página inteira, sem popup)

1. **Front → API:** o usuário clica em "Conectar Google Drive". O front chama `POST /me/storage/connect/{provider}` (exige a permission de conectar).
2. **API:** gera o `state`, monta a `authorizationUrl` do provedor e a devolve em `{ "authorizationUrl": "..." }`.
3. **Front:** redireciona a **página inteira** para a `authorizationUrl` (`window.location`).
4. **Provedor:** o usuário concede e o provedor volta para a URL fixa com `code` e `state`: `GET /public/storage/callback/{provider}?code=...&state=...`.
5. **API (retorno):** valida o `state` (assinatura, uso único, validade curta), troca o `code` por tokens no endpoint do provedor, **cifra e guarda o refresh token** associado ao `ownerKey` e redireciona o navegador para o subdomínio do tenant, numa página do produto que mostra "conectado" (ou o erro).
6. **Daí em diante:** o host monta o storage com `auth-mode=consent` e `owner-key=<ownerKey>`; a lib pede a credencial à `StorageCredentialSource`, renova o token de acesso quando precisa e avisa pelo `renewed(...)` se o provedor rotacionou o refresh token.

### Contrato dos endpoints do host (referência)

| Endpoint | Para quê |
|---|---|
| `POST /me/storage/connect/{provider}` | Devolve `{ authorizationUrl }`. Exige a permission de conectar. |
| `GET /public/storage/callback/{provider}?code&state` | Retorno do provedor (público, validado só pelo `state`). Redireciona ao subdomínio do tenant. |
| `GET /me/storage/connection` | Estado da conexão: `conectado`, `expirado`, `revogado` ou `nao-conectado`. |
| `DELETE /me/storage/connection` | Desconecta (apaga o refresh token e, se o provedor permitir, revoga). |

Os paths seguem o EXT-15 (constantes em `RestControllerPath`). **Não há implementação de referência nos boilerplates ainda** (decisão do dono, D6, fica para depois); o exemplo da lib mostra uma `StorageCredentialSource` com servidor OAuth falso.

### O `state`

Assinado (HMAC ou equivalente), de **uso único**, com **validade curta** (minutos), e carrega o tenant e o `ownerKey`. Sem `state` válido, o retorno é recusado. Nunca confie em tenant ou dono vindos do corpo ou da query (EXT-08): só o que está no `state` assinado.

### A permission

Conectar o armazenamento é uma **permission a mais do host** (nome no padrão `<DOMINIO>_<ACAO>` do EXT-12, escolhido pelo host). A lib não a conhece.

### Guardar o refresh token

- **Cifrado** em repouso; a chave de cifra não fica no banco.
- Uma linha por (provider, `ownerKey`). O `ownerKey` é opaco para a lib: o host decide se é tenant, empresa ou usuário (um Drive por empresa é o mais simples).
- No `renewed(...)`, **grave o refresh token novo no lugar do antigo** (alguns provedores rotacionam).
- Nunca registre token em log, ProblemDetails, auditoria ou resposta de API.

## Estados da conexão e como o front reage

| Estado | Quando | O que o front mostra |
|---|---|---|
| `nao-conectado` | Nunca concedeu ou desconectou | Botão "Conectar" |
| `conectado` | A credencial existe e a renovação funciona | "Conectado" e botão "Desconectar" |
| `expirado` / `revogado` | A lib lançou `StorageConsentRequiredException` (o provedor recusou a renovação) | "Reconectar" (repete o fluxo) |
| erro de configuração | `StorageCredentialSourceMissingException` | Erro do host, não do usuário: avise o suporte |

O host mapeia as exceções da lib (`StorageConsentException` e filhas) para o seu `ProblemDetails`.

## Passo a passo do lançador do produto, em cada provedor

> Estes passos foram escritos de memória e **precisam ser conferidos na documentação atual de cada provedor** antes de virar rotina; nomes de menus mudam. O que é do SeedGrid (URL fixa, `state`, acesso offline) não muda.

Em todos: criar **um aplicativo por produto**, cadastrar **a URL de retorno fixa** do produto, pedir o **mínimo de escopos** e guardar as credenciais na configuração do produto, nunca em repositório.

- **Google Drive:** console do Google Cloud → projeto do produto → ativar a API do Google Drive → tela de consentimento OAuth → credencial "ID do cliente OAuth" do tipo aplicativo web, com a URL de retorno fixa. Escopo mínimo: acesso aos arquivos criados pelo app (`drive.file`). Peça acesso **offline** para receber o refresh token (`access_type=offline`, `prompt=consent`). Um app que pede escopos sensíveis precisa de **verificação do Google** antes de servir usuários externos; o escopo `drive.file` evita a verificação mais pesada. Chaves da lib: `client-id`, `client-secret`.
- **OneDrive:** portal do Azure → Registros de aplicativo → novo registro (contas de qualquer diretório e pessoais, se o produto atender os dois) → URI de redirecionamento do tipo web com a URL fixa → segredo do cliente. Permissões delegadas do Microsoft Graph: `Files.ReadWrite` e `offline_access`. Chaves da lib: `client-id`, `client-secret` e, se o app não for multi-diretório, `tenant-id` (padrão `common`).
- **Dropbox:** Dropbox App Console → criar app com acesso "Scoped access" → permissões de arquivos (`files.content.write`, `files.content.read`, `files.metadata.read`) → URL de retorno fixa. Use o fluxo com `token_access_type=offline` para receber refresh token. Chaves da lib: `app-key`, `app-secret`.

## Checklist do host

1. Aplicativo OAuth criado em cada provedor e URL de retorno fixa cadastrada (lançador do produto).
2. Segredos do cliente OAuth na configuração do produto (nunca no repositório).
3. `StorageCredentialSource` implementada, com refresh token cifrado e o `renewed(...)` gravando o novo.
4. Endpoints de início, retorno, estado e desconexão, com `state` assinado e de uso único.
5. Permission de conectar semeada e checada no início do fluxo.
6. Front: botão, página de retorno, estados (`nao-conectado`, `conectado`, `expirado`) e "Desconectar".
7. Storage montado com `auth-mode=consent` e `owner-key`; o modo `credentials` continua valendo para quem não usa consentimento.
8. Arquivo **não** fica público no modo `consent` (a lib não cria link público).
