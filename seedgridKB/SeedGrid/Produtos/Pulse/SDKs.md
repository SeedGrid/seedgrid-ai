---
tags: [seedgrid, produto, pulse, sdk, publisher, subscriber]
fonte: seedgrid-products/seedgrid-pulse/components
branch: main
commit: 9dcbdad
analisado-em: 2026-10-16
---

# Pulse — SDKs

Dois lados independentes, cada um com sua credencial e seu transporte. Copie/instale **só o lado que precisa**. Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]] · exemplos prontos: [[SeedGrid/Produtos/Pulse/Exemplos|Exemplos]].

| | **Publisher** | **Subscriber** |
|---|---|---|
| Papel | publicar mensagens e emitir token curto | conectar, assinar, receber, `ack`/`result` |
| Roda em | backend confiável (API, worker, job) | navegador, app, agente |
| Credencial | chave **`project`** (`x-api-key`) 🔒 | token curto (`getToken`) **ou** chave `client` (agente) |
| Transporte | REST `POST /api/v1/messages` | WebSocket (reconecta sozinho) |
| Regra de ouro | a chave **nunca** vai ao cliente | **nenhuma** chave no navegador/app |

## Publishers (`components/publishers/`)

| Linguagem | Pacote / coordenada | Versão (manifesto) | Entrada |
|---|---|---|---|
| Java 17+ | `br.com.seedgrid:seedgrid-pulse-publisher` (Maven Central) | `2026.10.0` | `PulsePublisher.builder().baseUrl().projectKey().build()` |
| Next.js (server-only) | `@seedgrid/pulse-publisher-next` | `2026.09.0` | `createPulsePublisher({ baseUrl, projectKey })` |
| Dart | `seedgrid_pulse_publisher` | `2026.9.1` | `PulsePublisher.create(baseUrl:, projectKey:)` |
| PHP | `seedgrid/pulse-publisher` (Composer) | — | `HttpPulsePublisher::create(baseUrl:, projectKey:)` |
| Rust | `seedgrid-pulse-publisher-rust` | `0.2.0` | `PulsePublisher::builder(url, key).build()?` |
| Delphi | fonte em `src/` (XE6+/FPC) | — | `NewPulsePublisher(url, key)` |

Todos oferecem: `publish(...)` com helpers de destino (`toUser`, `toGroup`, `toAccount`, e grupo+usuário), `deliveryMode`, `deliveryPolicy`, `metadata` e `issueConnectToken(...)`.

Java:

```java
PulsePublisher publisher = PulsePublisher.builder()
    .baseUrl(System.getenv("PULSE_BASE_URL"))
    .projectKey(System.getenv("PULSE_PROJECT_KEY"))
    .build();

publisher.publish(PublishMessageInput.toUser(
    "orders", "order.updated", "usr_7f3a9c1e", Map.of("orderId", "o-1")));

// rota autenticada do SEU backend, para o navegador:
ConnectToken token = publisher.issueConnectToken(
    new IssueConnectTokenInput(sessao.publicId(), Duration.ofMinutes(5), List.of("orders")));
```

Next.js:

```ts
import "server-only";
import { createPulsePublisher, message } from "@seedgrid/pulse-publisher-next";

export const pulse = createPulsePublisher({
  baseUrl: process.env.PULSE_BASE_URL!,
  projectKey: process.env.PULSE_PROJECT_KEY!, // nunca NEXT_PUBLIC_*
});

await pulse.publish(message.toUser("orders", "order.updated", usuario.publicId, { orderId }));
const token = await pulse.issueConnectToken({ subject: usuario.publicId, ttlSeconds: 300 });
```

PHP:

```php
$publisher = HttpPulsePublisher::create(baseUrl: getenv('PULSE_BASE_URL'), projectKey: getenv('PULSE_PROJECT_KEY'));
$publisher->publish(PublishMessageInput::toUser('orders', 'order.updated', 'usr_7f3a9c1e', ['orderId' => 'o-1']));
```

Dart:

```dart
final publisher = PulsePublisher.create(
  baseUrl: Platform.environment['PULSE_BASE_URL']!,
  projectKey: Platform.environment['PULSE_PROJECT_KEY']!,
);
final result = await publisher.publish(
  PublishMessageInput.toUser('orders', 'order.updated', 'usr_7f3a9c1e', {'orderId': 'o-1'}),
);
print(result.messageId);
publisher.close();
```

Rust:

```rust
let publisher = PulsePublisher::builder(base_url, project_key).build()?;
let result = publisher
    .publish(PublishMessageInput::to_user("orders", "order.updated", "usr_7f3a9c1e", json!({ "orderId": "o-1" })))
    .await?;
println!("{}", result.message_id);
```

Delphi:

```pascal
Config := TPulsePublisherConfig.Create(GetEnvironmentVariable('PULSE_BASE_URL'), GetEnvironmentVariable('PULSE_PROJECT_KEY'));
Publisher := TPulsePublisher.Create(Config, TIndyPulseHttpTransport.Create); // Delphi moderno: transporte NetHttp
R := Publisher.Publish(TPublishMessageInput.ToUser('orders', 'order.updated', 'usr_7f3a9c1e', '{"orderId":"o-1"}'));
Writeln(R.MessageId);
```

Variáveis recomendadas no backend: `PULSE_BASE_URL`, `PULSE_PROJECT_KEY` 🔒. Os exemplos completos de cada SDK ficam em `examples/` (ou `example/`) da pasta do pacote.

### Publicar com modo e política de entrega

`deliveryMode` escolhe o ciclo de vida da mensagem e `deliveryPolicy` diz **como insistir** (tentativas, validade, espaçamento). Os dois são opcionais e independentes; o significado campo a campo está em [[SeedGrid/Produtos/Pulse/Protocolo-e-API#deliveryPolicy: campo a campo|Protocolo e API]]. Omitidos, vale `notification` e os padrões do servidor. Um job que o consumidor precisa **executar** usa `processed` (único modo com `result`, retry de execução e DLQ):

Java:

```java
publisher.publish(PublishMessageInput.builder()
    .channel("render").event("render.requested").toUser("agent:render-node-7")
    .data(Map.of("jobId", "job_9f2"))
    .deliveryMode(DeliveryMode.PROCESSED)
    .deliveryPolicy(DeliveryPolicy.builder()
        .maxAttempts(5).ttlSeconds(300).resultTimeoutSeconds(120)
        .retryBaseMs(200).retryMaxMs(2000)
        .retryStrategy(RetryStrategy.EXPONENTIAL)
        .build())
    .build());
```

Next.js:

```ts
await pulse.publish({
  channel: "render",
  event: "render.requested",
  target: { user: "agent:render-node-7" },
  data: { jobId: "job_9f2" },
  deliveryMode: "processed",
  deliveryPolicy: { maxAttempts: 5, ttlSeconds: 300, resultTimeoutSeconds: 120, retryBaseMs: 200, retryMaxMs: 2000, retryStrategy: "exponential" },
  metadata: { correlationId: "report-4471", source: "report-api" },
});
```

PHP:

```php
$input = PublishMessageInput::toUser('render', 'render.requested', 'agent:render-node-7', ['jobId' => 'job_9f2'])
    ->withDeliveryMode(DeliveryMode::Processed)
    ->withDeliveryPolicy(new DeliveryPolicy(
        maxAttempts: 5, ttlSeconds: 300, retryBaseMs: 200, retryMaxMs: 2000,
        retryStrategy: RetryStrategy::Exponential,
        resultTimeoutSeconds: 120, // último parâmetro do construtor
    ))
    ->withMetadata(new Metadata(correlationId: 'report-4471', source: 'report-api'));
$publisher->publish($input);
```

Dart:

```dart
await publisher.publish(
  PublishMessageInput.toUser('render', 'render.requested', 'agent:render-node-7', {'jobId': 'job_9f2'})
      .withDeliveryMode(DeliveryMode.processed)
      .withDeliveryPolicy(const DeliveryPolicy(
        maxAttempts: 5, ttlSeconds: 300, retryBaseMs: 200, retryMaxMs: 2000,
        retryStrategy: RetryStrategy.exponential,
        resultTimeoutSeconds: 120,
      ))
      .withCorrelationId('report-4471'),
);
```

Rust:

```rust
publisher.publish(
    PublishMessageInput::to_user("render", "render.requested", "agent:render-node-7", json!({ "jobId": "job_9f2" }))
        .with_delivery_mode(DeliveryMode::Processed)
        .with_delivery_policy(DeliveryPolicy {
            max_attempts: Some(5),
            ttl_seconds: Some(300),
            result_timeout_seconds: Some(120),
            retry_base_ms: Some(200),
            retry_max_ms: Some(2000),
            retry_strategy: Some(RetryStrategy::Exponential),
        }),
).await?;
```

Delphi (campo `0`/`rsUnset` = omitir):

```pascal
Policy := TDeliveryPolicy.Empty;
Policy.MaxAttempts := 5;
Policy.TtlSeconds := 300;
Policy.ResultTimeoutSeconds := 120;
Policy.RetryBaseMs := 200;
Policy.RetryMaxMs := 2000;
Policy.RetryStrategy := rsExponential;
R := Publisher.Publish(TPublishMessageInput.ToUser('render', 'render.requested', 'agent:render-node-7', '{"jobId":"job_9f2"}')
  .WithDeliveryMode(dmProcessed)
  .WithDeliveryPolicy(Policy));
```

Valores inválidos (`0`, `retryMaxMs < retryBaseMs`, estratégia desconhecida) voltam como **422** `INVALID_MESSAGE_REQUEST` e viram a exceção de validação do SDK (por exemplo `PulseValidationException`). Valores acima dos tetos do servidor **não** dão erro: são reduzidos ao teto.

`resultTimeoutSeconds` (SDKs a partir do Pulse 0.3.0) é o prazo, em segundos, para o consumidor devolver o `result` depois do `ack`; só vale com `processed`. Omitido, vale o padrão do servidor (`0` = sem prazo). Cuidado: um prazo curto reentrega a tarefa ainda em execução, então use um valor maior que o pior caso e deduplique por `messageId`. Os SDKs não validam o valor (o servidor responde 422 para `0`). Notas por linguagem: PHP recebe o parâmetro **no fim** do construtor de `DeliveryPolicy`; no Rust, literais de `DeliveryPolicy` precisam do campo (ou `..Default::default()`); no Delphi, `ResultTimeoutSeconds = 0` omite o campo; no Java o construtor antigo continua existindo. Semântica completa: [[SeedGrid/Produtos/Pulse/Protocolo-e-API#Prazo de execução (resultTimeoutSeconds)|Prazo de execução]].

## Subscribers (`components/subscribers/`)

| Plataforma | Pacote | Versão | Camada de framework |
|---|---|---|---|
| React / JS | `@seedgrid/pulse-subscriber-react` (npm) | `3.0.0` | hook `usePulseSubscriber` + core `PulseSubscriberClient` |
| Angular 17+ | `@seedgrid/pulse-subscriber-angular` | `2.0.0` | `PulseSubscriberService` (Observables) + `providePulseSubscriber()` |
| Flutter / Dart | `seedgrid_pulse_subscriber` | `2.0.0` | streams `states`, `messages` |
| Rust | `seedgrid-pulse-subscriber-rust` | `0.2.0` | callbacks `on_message`, `on_state_change` |
| Delphi | fonte em `src/` (Indy) | — | `IPulseSubscriber` (`NewPulseSubscriberIndy`) |

Capacidades comuns: autenticação **só no handshake**; reconexão automática (backoff com jitter); **replay** do backlog ao reconectar (a assinatura é reenviada); `ack` (recebimento) e `reportResult` (execução); deduplicação por `messageId` opcional; `auth-error` ao receber `4403` (sem reconectar).

> **Paridade (Confirmado — comparação dos SDKs em 2026-10):** `unsubscribe`, listas `subscribedChannels/Groups` e `autoAck` existem em React, Flutter e Delphi. O **Angular ainda não os tem** (guarda só a última assinatura); o exemplo Angular contorna isso.

### React

```tsx
const { messages, connectionState, ack } = usePulseSubscriber({
  getToken: async () => (await fetch("/api/realtime/connect", { method: "POST" })).json(),
  subscription: { channels: ["orders"], groups: ["tenant:15"] },
});
```

### Angular

```ts
providePulseSubscriber(() => {
  const http = inject(HttpClient);
  return {
    getToken: () => firstValueFrom(http.post<PulseConnectToken>("/api/realtime/connect", {})),
    subscription: { channels: ["orders"] },
  };
});
// componente: inject(PulseSubscriberService).messages$ / state$ / ack({ messageId })
```

### Flutter

```dart
final subscriber = PulseSubscriber();
subscriber.messages.listen((m) async { if (m.requiresAck) await subscriber.ack(AckInput(m.messageId)); });
await subscriber.connect(ConnectInput(getToken: () async => PulseConnectToken.fromJson(await meuBackend.post('/api/realtime/connect'))));
await subscriber.subscribe(const SubscribeInput(channels: ['orders']));
```

### Rust (agente, chave `client`)

```rust
let subscriber = PulseSubscriber::new();
subscriber.on_message(|m| println!("{} em {}", m.event, m.channel));
subscriber.connect(ConnectInput::new("http://localhost:18080", "<chave client>")).await?;
subscriber.subscribe(SubscribeInput::channels(["orders"])).await?;
```

### Delphi

```pascal
FSub := NewPulseSubscriberIndy;
FSub.UseAutoAck(True);
FSub.OnMessage(App.OnMsg);
FSub.Connect(TConnectInput.CreateWithToken(App.BuscarToken)); // ou TConnectInput.Create(url, chaveClient)
FSub.Subscribe(TSubscribeInput.ForChannels(['orders']));
```

## Fluxo de ponta a ponta (navegador)

```text
 navegador ──(sessão)──▶ POST /api/realtime/connect   [rota do SEU backend]
                                   │ issueConnectToken(subject = usuário da sessão)  [chave project]
                                   ▼
 navegador ◀── { token, expiresAt, connectUrl }
 navegador ──WebSocket (access_token=pct_…)──▶ Pulse ──▶ message / ack / result
```

## Ack × result

- `ack` confirma o **recebimento**; `result` informa o **resultado de execução** (`success`/`retryable`/`permanent`).
- Só mensagens `processed` esperam `result`; em `notification`/`acknowledged` o servidor o recusa com `result_not_applicable`. Com `autoAck`/auto-ack nos SDKs que o têm, o SDK envia `ack` e, para `processed`, `result:success` depois que o seu handler retorna sem erro.
- Entrega é at-least-once: **deduplique por `messageId`**.

## Instalação a partir do fonte

Nem todos os SDKs estão em registro público (Confirmado nos commits: Java em Maven Central, React no npm). Para os demais use dependência por caminho/cópia do fonte, como fazem os [[SeedGrid/Produtos/Pulse/Exemplos|exemplos]] (ex.: Flutter com `path: sdk/subscriber`). Cada SDK traz `INSTALLATION.md`, `CONFIGURATION.md`, `SECURITY.md`, `TROUBLESHOOTING.md` e `TESTING.md`.
