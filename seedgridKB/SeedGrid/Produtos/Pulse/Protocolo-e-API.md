---
tags: [seedgrid, produto, pulse, protocolo, api, websocket]
fonte: seedgrid-products/seedgrid-pulse (backend/PROTOCOL.md, backend/README.md, src/openapi.rs)
branch: main
commit: 9dcbdad
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

Resposta: `{ "messageId": "msg_…", "status": "accepted", "createdAt": "…" }`. `deliveryPolicy` é opcional e limitada pelos tetos `*_CAP` do servidor (campo a campo em [[SeedGrid/Produtos/Pulse/Protocolo-e-API#deliveryPolicy: campo a campo|deliveryPolicy]]). Erros: 400 requisição malformada · 422 `deliveryPolicy`/endereçamento inválido · 401 credencial · 403 `ACCOUNT_MISMATCH`/chave `client` · 404/422 conta inexistente ou revogada, endereçamento ou `event` não concreto.

## Delivery modes

| Modo | Fim do ciclo | `ack` | `result` | DLQ |
|---|---|---|---|---|
| `notification` (padrão) | escrita no socket ⇒ `completed` | no-op | erro `result_not_applicable` | nunca |
| `acknowledged` | `ack` do cliente ⇒ `completed` | termina | erro `result_not_applicable` | nunca |
| `processed` | `result: success` ⇒ `completed` | ⇒ `delivered` | `success` / `retryable` / `permanent` | **sim** |

Só o `processed` consome tentativas e chega à DLQ. Offline ou falha de transporte **não** vão à DLQ (a mensagem fica `pending`).

## deliveryPolicy: campo a campo

Opcional, por mensagem. Diz **como insistir**, não para quem entregar. Todo campo é opcional: ausente ⇒ vale o padrão do servidor. Uso nos SDKs: [[SeedGrid/Produtos/Pulse/SDKs|SDKs]].

| Campo | Tipo | Padrão do servidor | O que faz |
|---|---|---|---|
| `maxAttempts` | inteiro > 0 | `20` (`DELIVERY_MAX_ATTEMPTS`) | Quantas falhas de **execução** (`result: retryable`) a mensagem aguenta. Só vale em `processed`. A cada `retryable` o contador sobe; quando passa de `maxAttempts` (ou seja, na falha de número `maxAttempts + 1`) a mensagem vai à **DLQ**. Falha de transporte (cliente offline, escrita no socket) **não** consome tentativa. `result: permanent` vai à DLQ na hora, independentemente deste valor. |
| `ttlSeconds` | inteiro > 0 | `86400` = 1 dia (`DELIVERY_TTL_SECONDS`) | Validade da mensagem, contada a partir da publicação. Se ao fim do prazo ela ainda estiver `pending` (ninguém a recebeu), o estado vira `expired` e ela não é mais entregue. Vale para **todos** os modos. Expirar **não** manda para a DLQ nem consome tentativa. Veja [[SeedGrid/Produtos/Pulse/Protocolo-e-API#Como o TTL é aplicado|Como o TTL é aplicado]]. |
| `resultTimeoutSeconds` | inteiro > 0 (s) | `0` = **sem prazo** (`DELIVERY_RESULT_TIMEOUT_SECONDS`) | **Prazo de execução**, só em `processed`: segundos entre o `ack` e o `result`. Estourado sem `result`, vale como um `result: retryable` com motivo `result_timeout` (consome tentativa; esgotadas, vai à **DLQ**). Detalhes em [[SeedGrid/Produtos/Pulse/Protocolo-e-API#Prazo de execução (resultTimeoutSeconds)|Prazo de execução]]. |
| `retryBaseMs` | inteiro > 0 (ms) | `300` (`DELIVERY_RETRY_BASE_MS`) | Atraso antes da próxima tentativa. Na estratégia `exponential` é o atraso inicial; em `fixed` é o atraso de toda tentativa. |
| `retryMaxMs` | inteiro > 0 (ms), `>= retryBaseMs` | `5000` (`DELIVERY_RETRY_MAX_MS`) | Teto do atraso entre tentativas. |
| `retryStrategy` | `"fixed"` \| `"exponential"` | `exponential` (`DELIVERY_RETRY_STRATEGY`) | Como o atraso cresce. |

**Cálculo do atraso** (Confirmado, `DeliveryPolicy::next_delay` no servidor), com *n* = número da tentativa que falhou:

- `exponential`: `min(retryBaseMs × 2^(n−1), retryMaxMs)`. Com base 200 e teto 2000: 200, 400, 800, 1600, 2000, 2000…
- `fixed`: `min(retryBaseMs, retryMaxMs)`, sempre o mesmo atraso.
- No `result: retryable`, se o cliente mandar `retryAfterSecs`, **ele vale no lugar** do cálculo acima.
- O mesmo atraso espaça as tentativas de transporte quando o destinatário está offline ou a escrita no socket falha (a mensagem fica `pending` até o TTL).

**Validação** (rejeita com **422** `INVALID_MESSAGE_REQUEST`): qualquer campo numérico igual a `0` (inclusive `resultTimeoutSeconds`); `retryMaxMs < retryBaseMs` quando os dois vêm; `retryStrategy` diferente de `fixed`/`exponential` (minúsculas).

**Tetos do servidor.** O que o publisher manda **nunca passa** do teto configurado (`DELIVERY_MAX_ATTEMPTS_CAP`, `DELIVERY_TTL_SECONDS_CAP`, `DELIVERY_RETRY_BASE_MS_CAP`, `DELIVERY_RETRY_MAX_MS_CAP`, `DELIVERY_RESULT_TIMEOUT_SECONDS_CAP`): acima dele o valor é **reduzido em silêncio**, sem erro. Como cada teto, quando não definido, é igual ao padrão, **por padrão uma mensagem só consegue pedir menos que o padrão**: `maxAttempts: 50` vira `20`, `ttlSeconds: 604800` vira `86400`. Para permitir mais, suba o `*_CAP` no servidor ([[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração do servidor]]). Dentro dos tetos, `retryMaxMs` nunca fica abaixo do `retryBaseMs` efetivo. Exceção: o teto do prazo de execução tem padrão `86400` (e não o valor do padrão, que é `0`), então o publisher consegue pedir até 1 dia mesmo com o recurso desligado por padrão; `DELIVERY_RESULT_TIMEOUT_SECONDS_CAP=0` **proíbe** o prazo de execução.

**Quando usar.** Em `notification` e `acknowledged` só o `ttlSeconds` (e o espaçamento das tentativas de transporte) importa; `maxAttempts` e a DLQ só entram em `processed`. Exemplo para um job que pode ser reentregue algumas vezes e deve morrer em 5 minutos:

```json
"deliveryMode": "processed",
"deliveryPolicy": { "maxAttempts": 5, "ttlSeconds": 300, "resultTimeoutSeconds": 120, "retryBaseMs": 200, "retryMaxMs": 2000, "retryStrategy": "exponential" }
```

### Como o TTL é aplicado

- **Quando é verificado.** A cada tentativa de entrega e por um verificador periódico que roda a cada `ceil(DELIVERY_RETRY_BASE_MS / 1000)` segundos, no mínimo 1 s (com o padrão de 300 ms, **a cada 1 s**). Na prática a mensagem expira com até ~1 s de atraso depois do prazo. Esse verificador usa o valor **do servidor**, não o `retryBaseMs` da mensagem. Ele **não** tem relação com o intervalo de limpeza (`DELIVERY_CLEANUP_INTERVAL_SECONDS`), que cuida só de retenção e lixeira.
- **Só vale para `pending`.** O TTL mede quanto tempo a mensagem espera por um destinatário. Depois que o `ack` chega, uma mensagem `processed` fica `delivered`, e a partir daí o TTL **não a expira mais**. Quem cobre essa fase é o prazo de execução (`resultTimeoutSeconds`, veja abaixo). Sem esse prazo (o padrão é `0` = sem prazo), uma tarefa que o consumidor recebeu e nunca respondeu fica `delivered` até o `result` chegar ou até um operador descartar.
- **Descarte manual antecipa o TTL.** Em Pendências, "descartar" (`POST /backlog/discard`) leva `pending` **e** `delivered` sem resultado para `expired` na hora. A mensagem continua visível em "Mensagens" e só é apagada pela retenção (`DELIVERY_CLEANUP_RETENTION_DAYS`).
- **Lixeira.** Mensagem na lixeira não expira por TTL.
- **Não confunda com o token.** `ttlSeconds` também existe em `issueConnectToken`, mas ali é a janela do token curto para **conectar** (padrão 300 s, teto 900 s). Os dois nomes são iguais e não têm relação entre si.
- **O publisher não é avisado.** O publish responde `202 accepted` e pronto. Que a mensagem expirou aparece na UI (Mensagens, filtro `expired`), na métrica `delivery_expired_total` e no log de tentativas da mensagem (`outcome: expired`, `message_ttl_exceeded`).

### Prazo de execução (resultTimeoutSeconds)

Disponível a partir do Pulse **0.3.0** (Confirmado no commit `9dcbdad`). Cobre o caso da tarefa que o consumidor recebeu e travou.

- **Só `processed`.** Em `notification` e `acknowledged` não há `result`, então o campo não tem efeito.
- **Conta do `ack` até o `result`** (`delivered_at`). Cada nova entrega confirmada reinicia a contagem.
- **Estourou sem `result`:** o servidor aplica o mesmo tratamento de um `result: retryable`: soma 1 à tentativa, devolve a mensagem a `pending` com o backoff da `deliveryPolicy` e a reentrega. Se `attemptCount > maxAttempts`, vai à DLQ com `lastExecutionError = "result_timeout"`. No log de tentativas aparece como `execution_retryable` com detalhe `result_timeout` (não existe outcome separado).
- **Quando é verificado:** pelo mesmo verificador periódico do retry (a cada ~1 s com o padrão), então o estouro é detectado com até ~1 s de atraso.
- **Padrão `0` = sem prazo** (`DELIVERY_RESULT_TIMEOUT_SECONDS`), para não mudar o comportamento de quem já usa o Pulse. Peça o prazo por mensagem, ou o operador define um padrão em Configurações. `0` **enviado** no `deliveryPolicy` é inválido (422); para não ter prazo, omita o campo.
- **Teto:** `DELIVERY_RESULT_TIMEOUT_SECONDS_CAP` (padrão `86400`; `0` proíbe). Acima do teto, o valor é reduzido em silêncio, como nos outros campos.
- **`result` tardio é ignorado.** Se o `result` da tentativa antiga chegar depois do estouro, enquanto a mensagem espera a nova tentativa (`pending` com `lastExecutionError = "result_timeout"`), o servidor o ignora (sem erro de protocolo e sem alterar o estado). Depois que a nova tentativa é entregue e confirmada, o `result` volta a valer. **Limitação:** não há identificador de tentativa; um `result` antigo que chegue *depois* da reentrega ser confirmada é aceito.
- **Mensagens antigas:** as `delivered` que já existiam antes da migration (`0013`) ficam **sem prazo**; o descarte manual em Pendências continua sendo a saída para elas.
- **Cuidado (a tarefa pode rodar duas vezes).** Um prazo curto reentrega uma tarefa que ainda está em execução. Escolha um prazo **maior que o pior caso** da tarefa e torne o consumidor **idempotente** (deduplicando por `messageId`).
- **Observabilidade:** motivo `result_timeout` na UI (tela de detalhes da mensagem: "Último erro de execução" e detalhe das tentativas; as telas de DLQ não mostram esse campo) e o campo opcional "Prazo de execução (s)" na tela Publicar e a métrica `seedgrid_pulse_delivery_result_timeout_total`. O endpoint `/meta` expõe o padrão e o teto (`deliveryPolicyDefaults.resultTimeoutSeconds` e `deliveryPolicyCaps.resultTimeoutSeconds`).

## DLQ: quando uma mensagem vai para lá

A DLQ (fila de mensagens mortas) guarda **tarefas** que desistiram de executar. Só entra nela mensagem em `processed`, por um destes dois caminhos:

| Situação | Vai à DLQ? |
|---|---|
| Subscriber responde `result: permanent` | **Sim, na hora**, sem olhar as tentativas que sobram |
| Subscriber responde `result: retryable` e as tentativas esgotam (`attemptCount > maxAttempts`) | **Sim** |
| Subscriber responde `result: retryable` e ainda há tentativas | Não: volta a `pending` e é reentregue após o atraso do backoff (ou do `retryAfterSecs`) |
| Tarefa `delivered` e o prazo de execução (`resultTimeoutSeconds`) estoura sem `result` | Conta como `retryable` com motivo `result_timeout`: volta a `pending` com backoff; **se as tentativas esgotam, sim**, com `lastExecutionError = "result_timeout"` |
| Subscriber responde `result: success` | Não: `completed` |

**Nunca vai à DLQ:**

- `notification` e `acknowledged`, mesmo que o destinatário nunca receba (não há execução para falhar; `result` nesses modos é recusado com `result_not_applicable`).
- Destinatário offline, ou falha ao escrever no socket: a mensagem fica `pending`, tenta de novo e não consome tentativa.
- TTL vencido: vira `expired`.
- Tarefa que o consumidor recebeu (`delivered`) e nunca respondeu, **quando não há prazo de execução** (`resultTimeoutSeconds` ausente e padrão `0`): não cai sozinha na DLQ; só o descarte manual a tira dali.

**O que fazer com o que está na DLQ** (UI: Falhas, ou API `/dlq/*`, com as permissões `PULSE_DLQ_READ`, `PULSE_DLQ_REPLAY`, `PULSE_DLQ_CLEAN`):

- **Reprocessar** (`POST /dlq/requeue`): a mensagem volta a `pending` com o contador de tentativas **zerado**, o erro anterior apagado e a **data de publicação reiniciada**, então o TTL também recomeça.
- **Limpar** (`/dlq/clean`): vai para a lixeira da DLQ (`dlq_removed`); dá para restaurar (`/dlq/trash/restore`) ou apagar de vez (`/dlq/trash/purge`).
- O motivo da última falha fica registrado (`reason` do `result`).

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
