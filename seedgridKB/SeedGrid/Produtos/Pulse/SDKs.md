---
tags: [seedgrid, produto, pulse, sdk, publisher, subscriber]
fonte: seedgrid-products/seedgrid-pulse/components
branch: main
commit: 862d936
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

Dart / Rust / Delphi seguem o mesmo desenho (ver o README de cada SDK). Variáveis recomendadas no backend: `PULSE_BASE_URL`, `PULSE_PROJECT_KEY` 🔒.

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
