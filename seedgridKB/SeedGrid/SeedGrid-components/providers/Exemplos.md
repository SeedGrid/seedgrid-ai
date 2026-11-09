---
tags: [seedgrid, front, component, providers]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/providers, front/seedgrid-fe-components/apps/showcase/src/app/components/hooks
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Providers (ambiente/persistência e realtime), validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — providers de ambiente e realtime — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos|Exemplos — Providers (ambiente/persistência e realtime) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente, na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` correspondente (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` de cada bloco aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles texto a texto; **não foram compilados nesta rodada**. Classes utilitárias (`flex`, `gap-3` etc.) são Tailwind do app de exemplo. O Playground de cada página é interativo e não tem `.sample`, por isso não aparece aqui.

API: [[SeedGrid/SeedGrid-components/providers/API|API dos providers]] · Visão geral: [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers — visão geral]]. Rotas do showcase: `/components/providers/*` e `/components/hooks/*`.

## SgEnvironmentProvider

### Default (namespace vazio)

Sem provider, o namespace default retorna string vazia e não persiste.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-environment-provider/samples/default-namespace-vazio.tsx.sample`

```tsx
import { buildSgPersistenceKey, useSgEnvironment } from "@seedgrid/fe-components";

function Example() {
  const env = useSgEnvironment();
  const namespace = env.namespaceProvider.getNamespace();
  const fullKey = buildSgPersistenceKey("fab:theme", namespace, env.persistence.scope);

  return <div>fullKey: {fullKey ?? "null"}</div>;
}

export default Example;
```

### Namespace customizado

Mostra a chave final que os componentes usariam (`sg:u:123:app:crm:fab:theme`).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-environment-provider/samples/namespace-customizado.tsx.sample`

```tsx
import { SgEnvironmentProvider, buildSgPersistenceKey, useSgEnvironment } from "@seedgrid/fe-components";

function EnvInfo() {
  const env = useSgEnvironment();
  const namespace = env.namespaceProvider.getNamespace();
  const fullKey = buildSgPersistenceKey("fab:theme", namespace, env.persistence.scope);
  return <div>fullKey: {fullKey ?? "null"}</div>;
}

export default function Example() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "u:123" },
        persistence: { scope: "app:crm", mode: "fallback", stateVersion: 1 },
      }}
    >
      <EnvInfo />
    </SgEnvironmentProvider>
  );
}
```

### Ler só o namespace (useSgNamespaceProvider)

Atalho para env.namespaceProvider. Quando só o namespace importa — montar a chave de persistência de um usuário ou tenant — evita carregar o objeto de ambiente inteiro.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-environment-provider/samples/namespace-provider-hook.tsx.sample`

```tsx
"use client";

import {
  SgEnvironmentProvider,
  buildSgPersistenceKey,
  useSgNamespaceProvider
} from "@seedgrid/fe-components";

function ChaveDoUsuario() {
  // Atalho para env.namespaceProvider: quando só o namespace importa, este hook
  // evita carregar o objeto de ambiente inteiro.
  const namespaceProvider = useSgNamespaceProvider();
  const namespace = namespaceProvider.getNamespace();

  return (
    <div className="space-y-1 text-sm">
      <div>namespace: {namespace || "(vazio)"}</div>
      <div>chave: {buildSgPersistenceKey("fab:theme", namespace, "app:crm") ?? "null"}</div>
    </div>
  );
}

export default function Example() {
  return (
    <SgEnvironmentProvider value={{ namespaceProvider: { getNamespace: () => "u:123" } }}>
      <ChaveDoUsuario />
    </SgEnvironmentProvider>
  );
}
```

### REST (por usuário)

Exemplo de strategy que persiste em API REST.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-environment-provider/samples/rest-por-usuario.tsx.sample`

```tsx
import { SgEnvironmentProvider } from "@seedgrid/fe-components";

const api = createApiPersistenceStrategy({
  baseUrl: "https://api.seedgrid.com",
  scope: "app:crm",
  stateVersion: 1,
});

const local = createLocalStorageStrategy();
const persistence = createCompositePersistenceStrategy({
  mode: "fallback",
  primary: api,
  secondary: local,
});

export default function Example() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "u:123" },
        persistenceStrategy: persistence,
        persistence: { scope: "app:crm", mode: "fallback", stateVersion: 1 },
      }}
    >
      <div>componentes persistentes</div>
    </SgEnvironmentProvider>
  );
}
```

### Hybrid (local + REST)

Cache local rápido + sincronização no backend.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-environment-provider/samples/hybrid-local-rest.tsx.sample`

```tsx
import { SgEnvironmentProvider } from "@seedgrid/fe-components";

const api = createApiPersistenceStrategy({
  baseUrl: "https://api.seedgrid.com",
  scope: "app:crm",
  stateVersion: 1,
});

const local = createLocalStorageStrategy();
const persistence = createCompositePersistenceStrategy({
  mode: "mirror",
  primary: api,
  secondary: local,
});

export default function Example() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "u:123" },
        persistenceStrategy: persistence,
        persistence: { scope: "app:crm", mode: "mirror", stateVersion: 1 },
      }}
    >
      <div>componentes persistentes</div>
    </SgEnvironmentProvider>
  );
}
```

## useSgEnvironment

### Padrao (sem provider)

Sem SgEnvironmentProvider, o hook retorna valores padrao: namespace vazio, estrategia localStorage e scope app:unknown.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-environment/samples/default-sem-provider.tsx.sample`

```tsx
import { buildSgPersistenceKey, useSgEnvironment } from "@seedgrid/fe-components";

function Component() {
  const env = useSgEnvironment();
  const namespace = env.namespaceProvider.getNamespace();
  const key = buildSgPersistenceKey("component:state", namespace, env.persistence.scope);

  return <div>Chave resolvida: {key ?? "sem persistencia"}</div>;
}

export default Component;
```

### Com provider

Dentro do SgEnvironmentProvider o hook le o namespace, scope, mode e stateVersion configurados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-environment/samples/com-provider.tsx.sample`

```tsx
import { SgEnvironmentProvider, useSgEnvironment } from "@seedgrid/fe-components";

function Consumer() {
  const env = useSgEnvironment();
  return <div>scope: {env.persistence.scope}</div>;
}

export default function App() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "user:42" },
        persistence: { scope: "app:dashboard", mode: "strict", stateVersion: 3 },
      }}
    >
      <Consumer />
    </SgEnvironmentProvider>
  );
}
```

## useSgPersistence

### Uso basico

Sem `SgEnvironmentProvider` o namespace padrão é vazio, portanto a chave é `null` e as três operações não fazem nada; para persistir de fato, envolva com um provider que tenha `namespaceProvider` (ver exemplo anterior).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistence/samples/uso-basico.tsx.sample`

```tsx
import { useSgPersistence } from "@seedgrid/fe-components";

export default function SaveOnAction() {
  const persistence = useSgPersistence();

  const handleSave = async () => {
    await persistence.save("user:preferences", { theme: "dark", lang: "pt-BR" });
  };

  const handleLoad = async () => {
    const prefs = await persistence.load("user:preferences");
    console.log(prefs);
  };

  const handleClear = async () => {
    await persistence.clear("user:preferences");
  };

  return (
    <div>
      <button onClick={handleSave}>Salvar</button>
      <button onClick={handleLoad}>Carregar</button>
      <button onClick={handleClear}>Limpar</button>
    </div>
  );
}
```

### Quando usar vs useSgPersistentState

Use useSgPersistentState para sincronizacao automatica. Use useSgPersistence quando precisar controlar manualmente quando os dados sao lidos ou gravados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistence/samples/quando-usar-vs-persistent-state.tsx.sample`

```tsx
import { useSgPersistence, useSgPersistentState } from "@seedgrid/fe-components";

const { value, setValue } = useSgPersistentState({ baseKey: "key", defaultValue: 0 });

async function example(formData: unknown) {
  const persistence = useSgPersistence();
  await persistence.save("form:draft", formData);
  await persistence.load("form:draft");
  await persistence.clear("form:draft");
  return { value, setValue };
}

export default example;
```

## useSgPersistentState

### Uso basico

Sem provider, grava em `localStorage["app:counter"]`. `hydrated` indica que o valor salvo já foi carregado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/uso-basico.tsx.sample`

```tsx
import { useSgPersistentState } from "@seedgrid/fe-components";

export default function Counter() {
  const { value, setValue, clear, hydrated } = useSgPersistentState({
    baseKey: "app:counter",
    defaultValue: 0,
  });

  return (
    <div>
      <span>{hydrated ? value : "..."}</span>
      <button onClick={() => setValue((v) => v + 1)}>+1</button>
      <button onClick={() => setValue((v) => v - 1)}>-1</button>
      <button onClick={() => clear()}>Reset</button>
    </div>
  );
}
```

### Com isolamento por namespace

Com provider, a chave vira `sg:user:<id>:app:crm:app:counter`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/com-isolamento-por-namespace.tsx.sample`

```tsx
import { SgEnvironmentProvider, useSgPersistentState } from "@seedgrid/fe-components";

function Counter() {
  const { value, setValue } = useSgPersistentState({
    baseKey: "app:counter",
    defaultValue: 0,
  });
  return <button onClick={() => setValue((v) => v + 1)}>{value}</button>;
}

export default function App({ userId }: { userId: string }) {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => `user:${userId}` },
        persistence: { scope: "app:crm", mode: "fallback", stateVersion: 1 },
      }}
    >
      <Counter />
    </SgEnvironmentProvider>
  );
}
```

### Serialize e deserialize customizados

`serialize` só é aplicado quando há provider (sem provider o valor vai por `JSON.stringify`, que também converte `Date` em string ISO).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/serialize-e-deserialize-customizados.tsx.sample`

```tsx
import { useSgPersistentState } from "@seedgrid/fe-components";

export default function DatePicker() {
  const { value: selectedDate, setValue } = useSgPersistentState<Date | null>({
    baseKey: "app:selected-date",
    defaultValue: null,
    serialize: (date) => date?.toISOString() ?? null,
    deserialize: (raw) => (typeof raw === "string" ? new Date(raw) : null),
  });

  return (
    <input
      type="date"
      value={selectedDate?.toISOString().slice(0, 10) ?? ""}
      onChange={(e) => setValue(e.target.value ? new Date(e.target.value) : null)}
    />
  );
}
```

### Versionamento de estado

Incremente o stateVersion no SgEnvironmentProvider para invalidar dados persistidos anteriores.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/versionamento-de-estado.tsx.sample`

```tsx
import { SgEnvironmentProvider } from "@seedgrid/fe-components";

function MyComponent() {
  return <div>stateVersion novo, dados antigos invalidos</div>;
}

export default function App() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "u:1" },
        persistence: { scope: "app:crm", mode: "fallback", stateVersion: 2 },
      }}
    >
      <MyComponent />
    </SgEnvironmentProvider>
  );
}
```

## SgRealtimeProvider

### Simulador

Um WebSocket de demonstração faz o papel do Pulse. Clique para simular o fim de um backup e veja o aviso chegar ao handler.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-realtime-provider/samples/simulador.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgRealtimeProvider,
  useSgRealtimeEvent,
  useSgRealtimeStatus,
  type SgRealtimeEvent
} from "@seedgrid/fe-components";

// WebSocket de DEMONSTRACAO no papel do SeedGrid Pulse: nao toca a rede.
// Na aplicacao real, sem `connectOptions`: o provider conecta no Pulse de verdade.
class DemoPulseSocket {
  static current: DemoPulseSocket | null = null;
  readyState = 0;
  onopen: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(public url: string) {
    DemoPulseSocket.current = this;
    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.({});
      this.emit({ type: "connected", protocolVersion: 1, connectionId: "demo" });
    }, 300);
  }

  send(data: string) {
    const frame = JSON.parse(data);
    if (frame.type === "subscribe") {
      this.emit({ type: "subscribed", channels: frame.channels, groups: [], accountId: "demo" });
    }
  }

  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000, reason: "" });
  }

  emit(frame: unknown) {
    this.onmessage?.({ data: JSON.stringify(frame) });
  }

  /** O que o backend faz ao terminar o backup: publica para o usuario. */
  backupFinished(ok: boolean) {
    const id = `exp-${Date.now()}`;
    this.emit({
      type: "message",
      messageId: id,
      protocolVersion: 1,
      channel: "backup",
      event: ok ? "backup.finished.success" : "backup.finished.error",
      target: { user: "usuario-demo" },
      data: { exportPublicId: id, status: ok ? "DONE" : "FAILED" },
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      deliveryMode: "notification",
      requiresAck: false
    });
  }
}

// Na aplicacao real o provider chama a BFF (`/api/realtime/connect`); aqui o token e fixo.
const demoToken = async () => ({
  enabled: true,
  token: "pct_demo",
  expiresAt: Math.floor(Date.now() / 1000) + 300,
  connectUrl: "wss://pulse.demo/api/v1/connect"
});

function ExportsScreen() {
  const { status, connected } = useSgRealtimeStatus();
  const [notices, setNotices] = React.useState<SgRealtimeEvent[]>([]);

  useSgRealtimeEvent("backup", "backup.finished.*", (event) => {
    // Na tela real: recarregar a lista de exports pela API de sempre.
    setNotices((previous) => [event, ...previous].slice(0, 5));
  });

  return (
    <div className="space-y-3">
      <div className="text-sm">
        Status: <code>{status}</code> {connected ? "(sem polling)" : "(polling de reserva)"}
      </div>
      <div className="flex gap-2">
        <SgButton enabled={connected} onClick={() => DemoPulseSocket.current?.backupFinished(true)}>
          Simular backup pronto
        </SgButton>
        <SgButton severity="danger" enabled={connected} onClick={() => DemoPulseSocket.current?.backupFinished(false)}>
          Simular backup com falha
        </SgButton>
      </div>
      <ul className="space-y-1 text-sm">
        {notices.map((notice) => (
          <li key={notice.messageId}>
            <code>{notice.event}</code> — {JSON.stringify(notice.data)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RealtimeSimulator() {
  return (
    <SgRealtimeProvider
      channels={["backup"]}
      fetchToken={demoToken}
      connectOptions={{ webSocketImpl: DemoPulseSocket as never }}
    >
      <ExportsScreen />
    </SgRealtimeProvider>
  );
}
```

### No layout, com a BFF

Monte uma vez onde já há usuário logado. O token vem de /api/realtime/connect (a BFF), que repassa ao backend: ele emite o token para o usuário da sessão.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-realtime-provider/samples/layout-com-bff.tsx.sample`

```tsx
// app/(private)/layout.tsx — monte UMA vez, onde ja ha usuario logado.
"use client";

import { SgRealtimeProvider } from "@seedgrid/fe-components";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Pede o token a /api/realtime/connect (a BFF, mesma origem: vai o cookie da sessao),
  // que repassa ao backend (POST /realtime/connect da seedgrid-quarkus-ext-realtime).
  // O backend emite o token para o usuario DA SESSAO; o front conecta direto no Pulse.
  return <SgRealtimeProvider channels={["backup"]}>{children}</SgRealtimeProvider>;
}

// app/api/realtime/connect/route.ts — a BFF so repassa, com o token da sessao.
//
// export async function POST() {
//   const response = await backendFetch("/realtime/connect", { method: "POST" });
//   return new Response(await response.text(), {
//     status: response.status,
//     headers: { "Content-Type": "application/json" },
//   });
// }
```

### Polling de reserva

O aviso substitui o polling. Quando o realtime não está conectado e há job em andamento, a tela volta a consultar, mais espaçado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-realtime-provider/samples/polling-de-reserva.tsx.sample`

```tsx
import * as React from "react";
import { useSgRealtimeEvent, useSgRealtimeStatus } from "@seedgrid/fe-components";

// Tela de exports: o aviso do Pulse substitui o polling; o polling so volta quando o realtime
// nao esta conectado (desligado, Pulse fora, credencial revogada) E ha job em andamento.
export function ExportList({ jobs, reload }: { jobs: { status: string }[]; reload: () => void }) {
  const { connected } = useSgRealtimeStatus();
  const running = jobs.some((job) => job.status === "QUEUED" || job.status === "RUNNING");

  useSgRealtimeEvent("backup", "backup.finished.*", () => reload());

  React.useEffect(() => {
    if (connected || !running) return undefined;
    const timer = setInterval(reload, 15_000);
    return () => clearInterval(timer);
  }, [connected, running, reload]);

  return null;
}
```

### Canais e padrões de evento

Cada ouvinte escolhe canal e padrão (nome exato, lista, prefixo.* ou *).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-realtime-provider/samples/canais-e-padroes.tsx.sample`

```tsx
import * as React from "react";
import {
  SgButton,
  SgRealtimeProvider,
  useSgRealtimeEvent,
  useSgRealtimeStatus
} from "@seedgrid/fe-components";

// WebSocket de DEMONSTRACAO no papel do SeedGrid Pulse: nao toca a rede.
class DemoPulseSocket {
  static current: DemoPulseSocket | null = null;
  readyState = 0;
  onopen: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(public url: string) {
    DemoPulseSocket.current = this;
    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.({});
      this.emit({ type: "connected", protocolVersion: 1, connectionId: "demo" });
    }, 300);
  }

  send(data: string) {
    const frame = JSON.parse(data);
    if (frame.type === "subscribe") {
      this.emit({ type: "subscribed", channels: frame.channels, groups: [], accountId: "demo" });
    }
  }

  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000, reason: "" });
  }

  emit(frame: unknown) {
    this.onmessage?.({ data: JSON.stringify(frame) });
  }

  /** O que o backend faz: publica um aviso no canal. */
  publish(channel: string, event: string) {
    const id = `msg-${Date.now()}`;
    this.emit({
      type: "message",
      messageId: id,
      protocolVersion: 1,
      channel,
      event,
      target: { user: "usuario-demo" },
      data: { id },
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      deliveryMode: "notification",
      requiresAck: false
    });
  }
}

const demoToken = async () => ({
  enabled: true,
  token: "pct_demo",
  expiresAt: Math.floor(Date.now() / 1000) + 300,
  connectUrl: "wss://pulse.demo/api/v1/connect"
});

function Listeners() {
  const { connected } = useSgRealtimeStatus();
  const [backups, setBackups] = React.useState(0);
  const [audits, setAudits] = React.useState(0);

  // Nome exato, lista e prefixo.* no canal "backup"; "*" no canal "audit".
  useSgRealtimeEvent("backup", ["backup.started", "backup.finished.*"], () => setBackups((n) => n + 1));
  useSgRealtimeEvent("audit", "*", () => setAudits((n) => n + 1));

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <SgButton enabled={connected} onClick={() => DemoPulseSocket.current?.publish("backup", "backup.finished.error")}>
        backup.finished.error
      </SgButton>
      <SgButton enabled={connected} onClick={() => DemoPulseSocket.current?.publish("backup", "backup.other")}>
        backup.other
      </SgButton>
      <SgButton enabled={connected} onClick={() => DemoPulseSocket.current?.publish("audit", "audit.login")}>
        audit.login
      </SgButton>
      <span>
        backup: {backups} | audit: {audits}
      </span>
    </div>
  );
}

export default function RealtimePatterns() {
  return (
    <SgRealtimeProvider
      channels={["backup", "audit"]}
      fetchToken={demoToken}
      connectOptions={{ webSocketImpl: DemoPulseSocket as never }}
    >
      <Listeners />
    </SgRealtimeProvider>
  );
}
```

### Desligado

Com enabled: false (ex.: enquanto não há usuário logado) não pede token nem conecta.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-realtime-provider/samples/desligado.tsx.sample`

```tsx
import { SgRealtimeProvider, useSgRealtimeStatus } from "@seedgrid/fe-components";

function StatusText() {
  return <span>Estado: {useSgRealtimeStatus().status}</span>;
}

export default function Example() {
  return (
    <SgRealtimeProvider channels={["backup"]} enabled={false}>
      <StatusText />
    </SgRealtimeProvider>
  );
}
```

## useSgRealtimeEvent + useSgRealtimeStatus

Página do showcase: `/components/hooks/use-sg-realtime-event`.

### Uso basico

Recarregue a tela quando o backup terminar. O aviso so traz identificadores: busque o registro pela API de sempre.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-realtime-event/samples/uso-basico.tsx.sample`

```tsx
import { useSgRealtimeEvent } from "@seedgrid/fe-components";

// Dentro de um SgRealtimeProvider com channels={["backup"]}.
export function ExportsNotices({ reload }: { reload: () => void }) {
  // "backup.finished.*" casa backup.finished.success e backup.finished.error.
  useSgRealtimeEvent("backup", "backup.finished.*", (event) => {
    // event.data so traz identificadores ({ exportPublicId, status }):
    // busque o registro pela API de sempre, onde a permissao e checada.
    reload();
  });
  return null;
}
```

Página do showcase: `/components/hooks/use-sg-realtime-status`.

### Uso basico

Mostre se os avisos estao chegando ao vivo ou se a tela esta no polling.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-realtime-status/samples/uso-basico.tsx.sample`

```tsx
import { useSgRealtimeStatus } from "@seedgrid/fe-components";

export function RealtimeBadge() {
  const { status, connected } = useSgRealtimeStatus();
  // connected === false: desligado, Pulse fora, reconectando ou credencial revogada.
  // E o sinal para a tela voltar ao polling de reserva.
  return <span>{connected ? "Ao vivo" : `Polling (${status})`}</span>;
}
```
