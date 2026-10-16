---
tags: [seedgrid, produto, pulse, autenticacao, chaves, seguranca]
fonte: seedgrid-products/seedgrid-pulse (backend/env.md, backend/PROTOCOL.md, migrations)
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse — autenticação, chaves e permissions

O Pulse tem **credenciais distintas para atores distintos**. Elas nunca se substituem; mandar a errada é o erro mais comum de integração.

Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]]

## Quem usa o quê

| Ator | Credencial | Como envia | Serve para |
|---|---|---|---|
| **Backend de produto** (publica) | chave de conta **`project`** (`pulsek_…`) 🔒 | `x-api-key` ou `Authorization: Bearer` | publicar **só na conta da chave** e emitir token curto. **Não conecta** no WebSocket |
| **Navegador / app** (recebe) | **token curto** `pct_…` | `?access_token=` ou subprotocolo | conectar como **um usuário** (`subject`) da conta |
| **Agente instalado / serviço** (recebe) | chave de conta **`client`** 🔒 (com ou sem `subject`) | header, `?access_token=` ou subprotocolo | conectar como a conta (e, com `subject`, como um usuário). **Não publica** (403) |
| **Operação do Pulse** | `SEEDGRID_PULSE_SERVER_KEY` 🔒 | `x-api-key` | gerenciar contas/chaves e métricas. **Não publica** (403) |
| **Operador humano** (UI) | JWT do `security` | `Authorization: Bearer` | telas por **permission**; publica em qualquer conta com `PULSE_MESSAGE_PUBLISH` informando `accountId` |

Regras que mordem:

- O `kind` da chave (`project` \| `client`) é **obrigatório na emissão** e preservado na rotação. Chave `project` não tem `subject` (422).
- Quem publica é decidido pelo **`kind`**, não pelo `subject`.
- A chave de servidor **não vai para produto nenhum**.
- Chave `project` **nunca no navegador** nem em app distribuído.

## Contas e chaves

- **Conta** = fronteira de isolamento (entrega e replay nunca cruzam contas). Um produto ↔ uma ou mais contas.
- Criar chave: UI **Contas → conta → Chaves → Nova chave**, ou `POST /api/v1/accounts/{id}/keys` com `{ "name", "kind", "subject"? }`.
- O **segredo aparece uma vez** (UI com botão de copiar; API no campo `secret`). Depois só resta o prefixo (`keyPrefix`). Perdeu → **rotacionar** (`POST /accounts/{id}/keys/{keyId}/rotate`).
- A chave vive no banco (por conta, revogável, rotacionável); o banco guarda hash + prefixo. Revogar/rotacionar uma chave `client` ou revogar a conta derruba as conexões dela **na hora**, em todas as instâncias (fecha com `4403`).
- **Revogar** é conceito da **chave**. A **conta** não se revoga: vai para a **lixeira de contas** e depois é apagada (ver [[SeedGrid/Produtos/Pulse/Servidor/Operacao|Operação]]).

### O `subject` da chave

Definido na emissão e **imutável** (rotação preserva). É o `user` do protocolo. Use um id estável e não-PII (`usr_7f3a9c1e`, `agent:<uuid>`): nunca e-mail nem hostname. Sem `subject` = credencial de serviço (sem `user`, sem grupo implícito).

## Token curto de conexão (cliente sem segredo)

O cliente nunca recebe chave. O **backend do produto**, com a chave `project`, pede um token para o usuário **da sessão** e devolve só o token:

```http
POST /api/v1/connect-tokens
x-api-key: <chave project>

{ "subject": "<publicId da sessão>", "ttlSeconds": 300, "channels": ["orders"] }
```

```json
{ "token": "pct_…", "expiresAt": 1791205500, "connectUrl": "wss://…/api/v1/connect" }
```

- `subject`: **da sessão, nunca de parâmetro do request** (senão um usuário pede token em nome de outro).
- `ttlSeconds` (padrão 300, teto 900): janela para **conectar**. A conexão aberta segue depois do vencimento até cair ou a credencial ser revogada.
- `channels` (opcional): restringe o que pode assinar (`channel_not_allowed` fora disso).
- `connectUrl` só vem se `SEEDGRID_PULSE_PUBLIC_WS_URL` estiver configurada.
- Erros: 401 chave inválida · 403 chave `client`/de servidor · 422 validação · 429 limite (com `Retry-After`) · 503 sem `SEEDGRID_PULSE_CONNECT_TOKEN_SECRET`.
- O token é assinado (HMAC-SHA256). Revogar a chave `project` que o emitiu ou a conta o invalida.
- Os SDKs subscriber pedem token a **cada (re)conexão** via `getToken`.

## Operador humano: JWT e permissions

Login pelo `security` (JWT RS256, 2FA opcional). Cada endpoint administrativo exige uma **permission** (ou a chave de servidor, para automação). O papel `ADMIN` herda as da migration; outros perfis são configurados em **Segurança → Perfis**.

| Grupo | Permissions |
|---|---|
| Mensagens | `PULSE_MESSAGE_READ`, `PULSE_MESSAGE_PUBLISH`, `PULSE_MESSAGE_DELETE`, `PULSE_MESSAGE_PURGE` |
| Pendências / DLQ | `PULSE_BACKLOG_READ`, `PULSE_BACKLOG_DISCARD`, `PULSE_DLQ_READ`, `PULSE_DLQ_REPLAY`, `PULSE_DLQ_CLEAN` |
| Conexões / métricas / ajustes | `PULSE_CONNECTION_READ`, `PULSE_METRIC_READ`, `PULSE_SETTINGS_READ`, `PULSE_SETTINGS_UPDATE` |
| Contas | `PULSE_ACCOUNT_READ`, `_CREATE`, `_UPDATE`, `_REVOKE`, `PULSE_ACCOUNT_DELETE`, `PULSE_ACCOUNT_PURGE` |
| Chaves | `PULSE_KEY_READ`, `_CREATE`, `_ROTATE`, `_REVOKE`, `_PURGE` |
| Segurança | `PULSE_SECURITY_READ`, `_ADMIN`, `_USER_MANAGE`, `_ROLE_MANAGE` |

(Confirmado nas migrations `backend/migrations/tenant/`. As quatro de lixeira vêm da `0012`, concedidas só ao ADMIN; `DELETE` e `PURGE` são separadas de propósito.)

**Operações destrutivas**: exigem JWT humano (a chave de servidor recebe 401, pois toda exclusão precisa de autor) e gravam **audit** (quem, o quê, quantos).

## Boas práticas

- Chave `project` em variável de ambiente/secret do backend; rotacione ao suspeitar de vazamento.
- Um `subject` por pessoa (id estável), nunca compartilhado entre pessoas.
- Cliente de navegador/mobile: **sempre** token curto, nunca chave.
- Exemplos de demo nos repositórios de exemplo usam chaves de demonstração; não as use fora de dev.
