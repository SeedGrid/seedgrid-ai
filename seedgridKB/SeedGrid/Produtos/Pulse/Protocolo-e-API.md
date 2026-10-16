---
tags: [seedgrid, produto, pulse, protocolo, api, websocket]
fonte: seedgrid-products/seedgrid-pulse (backend/PROTOCOL.md, backend/README.md, src/openapi.rs)
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse — protocolo realtime e API HTTP

Resumo do contrato. Fonte completa: `backend/PROTOCOL.md` (protocolVersion **1**) e a spec OpenAPI gerada pelo servidor. Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]] · credenciais: [[SeedGrid/Produtos/Pulse/Autenticacao-e-chaves|Autenticação]].

## Endereçamento

Uma mensagem tem: `accountId` (da chave), `channel` (obrigatório), `event` (concreto, obrigatório), `group` e `user` (opcionais, independentes), `data`.

| `group` | `user` | entrega para |
|---|---|---|
| — | — | todas as conexões **da conta** no canal |
| G | — | quem assinou G |
| — | U | as conexões do usuário U |
| G | U | as conexões de U **que também assinaram** G |

- `user` vem da **credencial** (subject), nunca do `subscribe`. `group` é **namespace, não autorização**: trate a mensagem como **sinal**, não como conteúdo sensível.
- `group`/`user` não podem ser vazios nem conter `|`. Use `publicId`, nunca e-mail.
- Fronteira = conta; sem destinatário a mensagem fica `pending` até alguém conectar (TTL expira).

## Publicar (REST)

```http
POST /api/v1/messages
x-api-key: <chave project>
```

```json
{
  "channel": "orders",
  "event": "order.updated",
  "user": "usr_7f3a9c1e",
  "deliveryMode": "notification",
  "data": { "orderId": "o-1", "status": "paid" },
  "deliveryPolicy": { "maxAttempts": 5, "ttlSeconds": 3600, "retryBaseMs": 250, "retryMaxMs": 5000, "retryStrategy": "exponential" }
}
```

Resposta: `{ "messageId": "msg_…", "status": "accepted", "createdAt": "…" }`. `deliveryPolicy` é opcional e limitada pelos tetos `*_CAP` do servidor. Erros: 400 inválido · 401 credencial · 403 `ACCOUNT_MISMATCH`/chave `client` · 404/422 conta inexistente ou revogada, endereçamento ou `event` não concreto.

## Delivery modes

| Modo | Fim do ciclo | `ack` | `result` | DLQ |
|---|---|---|---|---|
| `notification` (padrão) | escrita no socket ⇒ `completed` | no-op | erro `result_not_applicable` | nunca |
| `acknowledged` | `ack` do cliente ⇒ `completed` | termina | erro `result_not_applicable` | nunca |
| `processed` | `result: success` ⇒ `completed` | ⇒ `delivered` | `success` / `retryable` / `permanent` | **sim** |

Só o `processed` consome tentativas e chega à DLQ. Offline ou falha de transporte **não** vão à DLQ (a mensagem fica `pending`).

## Conectar (WebSocket)

```text
GET /api/v1/connect?protocolVersion=1
```

Credencial por um de três caminhos (browser não envia header em WebSocket): header `Authorization: Bearer`, query `?access_token=`, ou subprotocolo `bearer, <credencial>` / `pulse.bearer.<credencial>`. Credencial inválida/ausente ⇒ 401 no upgrade.

Fluxo:

```text
servidor → {"type":"connected","protocolVersion":1,"connectionId":"…"}
cliente  → {"type":"subscribe","channels":["orders"],"groups":["loja:15"],"events":["order.*"]}
servidor → {"type":"subscribed","accountId":"…","user":"…","channels":[…],"groups":[…,"user:<u>"],"events":[…]}
servidor → {"type":"message","messageId":"…","channel":"…","event":"…","data":{…},"requiresAck":true,"deliveryMode":"processed"}
cliente  → {"type":"ack","messageId":"…"}
cliente  → {"type":"result","messageId":"…","outcome":"success"|"retryable"|"permanent","reason":"…","retryAfterSecs":30}
```

- `events`: filtro opcional; `*` só como último segmento e casa **um ou mais** segmentos (`order.*` casa `order.item.updated`, não `order`). Um `subscribe` novo **acumula** canais/grupos e **substitui** o filtro de eventos.
- O cliente **não declara identidade**: `userId`/`user` enviados são ignorados.
- Replay: ao assinar, o servidor entrega as pendências da conta que a conexão cobre.
- Entrega é **at-least-once**: o cliente deve **deduplicar por `messageId`**; `result` é idempotente.

Erros realtime: `unsupported_protocol_version`, `invalid_subscribe`, `invalid_ack`, `invalid_result`, `result_not_applicable`, `channel_not_allowed`, `unauthorized`, `internal_error`.

Fechamentos: **`4403`** `credential_revoked` (chave/conta revogada — **não reconectar** com a mesma credencial); `4401` legado (token expirado; os SDKs ainda tratam).

## Estados de uma mensagem

`pending` → `delivered` → `completed` (terminal) · `dead_letter` (falha de execução) · `expired` (TTL) · `trashed` (na lixeira, só vinda de `pending`) · `dlq_removed` (lixeira da DLQ) · `acknowledged` (legado, lido como `delivered`).

## Endpoints principais

| Área | Endpoints |
|---|---|
| Mensagens | `POST/GET /api/v1/messages`, `GET /messages/{id}`, `POST /messages/trash`, `/trash/restore`, `/trash/purge` |
| Pendências | `GET /backlog`, `POST /backlog/discard` |
| DLQ | `POST /dlq/requeue`, `/dlq/clean`, `/dlq/trash/restore`, `/dlq/trash/purge` |
| Conexões / presença / stats | `GET /connections`, `GET /presence/groups/{group}`, `GET /stats/connections`, `GET /stats/messages/aggregates` |
| Token | `POST /connect-tokens` |
| Contas | `GET/POST /accounts`, `/accounts/{id}`, `/activate`, `/revoke`, `/trash`, `/trash/restore`, `/purge`, `GET /accounts/{id}/deletion-summary`; chaves em `/accounts/{id}/keys` |
| Ajustes | `GET /api/v1/admin/settings`; alterar/resetar um ajuste em `/api/v1/admin/settings/{key}` (`POST` altera, `DELETE` volta ao padrão) |
| Operação | `GET /health`, `/ready`, `/meta`, `/metrics`, `/metrics/prometheus` |

Lotes de lixeira: máximo **1000** ids (`400 BATCH_TOO_LARGE`); resposta `{requested, affected, skipped}`. Erros de domínio seguem RFC 7807 (`application/problem+json`).

## Observabilidade por destinatário

`GET /messages/{id}/recipients` e `GET /recipient-deliveries` (filtros `userId`, `groupId`, `messageId`, `connectionId`, `status`, `acknowledged`) mostram quem recebeu cada mensagem — o histórico serve de **prova de entrega**.

## Compatibilidade

Mudanças aditivas (campos opcionais, novos eventos) não mudam `protocolVersion`; mudar semântica de endereçamento, remover `ack` ou alterar o shape de `message` exige incremento. Ordem de rollout quando o protocolo muda: publicar SDKs ⇒ reinstalar agentes ⇒ subir servidor ⇒ UI.
