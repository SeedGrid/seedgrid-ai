---
tags: [seedgrid, front, component, providers]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/providers, front/seedgrid-fe-components/apps/showcase/src/app/components/hooks
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — providers de ambiente e realtime

API: [[SeedGrid/SeedGrid-components/providers/API|API dos providers]] · Visão geral: [[SeedGrid/SeedGrid-components/providers/Visao-geral|Providers — visão geral]]

Todos os exemplos abaixo foram copiados 1:1 dos samples do showcase (exceto onde indicado) e passaram em type-check contra `packages/seedgrid-fe-components/src/index.ts` (TypeScript do monorepo, `strict`).

## SgEnvironmentProvider

### Namespace e escopo customizados

Mostra a chave final que os componentes usariam (`sg:u:123:app:crm:fab:theme`).

Fonte: `apps/showcase/src/app/components/providers/sg-environment-provider/samples/namespace-customizado.tsx.sample` (type-check: OK).

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

### Persistência REST por usuário com fallback local

Adaptado do sample `providers/sg-environment-provider/samples/rest-por-usuario.tsx.sample`: o original **não importa** `createApiPersistenceStrategy`, `createLocalStorageStrategy` e `createCompositePersistenceStrategy` e falha no type-check; abaixo, o mesmo código com o import completo (type-check: OK). Em modo `fallback`, se a API lançar erro, a estratégia usa o `localStorage`. A URL é ilustrativa.

```tsx
import {
  SgEnvironmentProvider,
  createApiPersistenceStrategy,
  createCompositePersistenceStrategy,
  createLocalStorageStrategy,
} from "@seedgrid/fe-components";

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

Para espelhar em ambos (`mirror`), troque `mode: "fallback"` por `mode: "mirror"` em `createCompositePersistenceStrategy` (é o que faz o sample `hybrid-local-rest`, com o mesmo problema de import).

## useSgEnvironment

### Lendo o ambiente fornecido

Fonte: `apps/showcase/src/app/components/hooks/use-sg-environment/samples/com-provider.tsx.sample` (type-check: OK).

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

### load / save / clear sob demanda

Sem `SgEnvironmentProvider` o namespace padrão é vazio, portanto a chave é `null` e as três operações não fazem nada; para persistir de fato, envolva com um provider que tenha `namespaceProvider` (ver exemplo anterior).

Fonte: `apps/showcase/src/app/components/hooks/use-sg-persistence/samples/uso-basico.tsx.sample` (type-check: OK).

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

## useSgPersistentState

### Contador persistido

Sem provider, grava em `localStorage["app:counter"]`. `hydrated` indica que o valor salvo já foi carregado.

Fonte: `apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/uso-basico.tsx.sample` (type-check: OK).

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

### Isolamento por namespace (usuário)

Com provider, a chave vira `sg:user:<id>:app:crm:app:counter`.

Fonte: `apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/com-isolamento-por-namespace.tsx.sample` (type-check: OK).

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

### serialize / deserialize customizados

`serialize` só é aplicado quando há provider (sem provider o valor vai por `JSON.stringify`, que também converte `Date` em string ISO).

Fonte: `apps/showcase/src/app/components/hooks/use-sg-persistent-state/samples/serialize-e-deserialize-customizados.tsx.sample` (type-check: OK).

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

## SgRealtimeProvider

### Montagem no layout autenticado (com BFF)

Fonte: `apps/showcase/src/app/components/providers/sg-realtime-provider/samples/layout-com-bff.tsx.sample` (type-check: OK).

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

## useSgRealtimeEvent + useSgRealtimeStatus

### Aviso substitui o polling; polling volta quando não conectado

Fonte: `apps/showcase/src/app/components/providers/sg-realtime-provider/samples/polling-de-reserva.tsx.sample` (type-check: OK).

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

### Indicador de status

Fonte: `apps/showcase/src/app/components/hooks/use-sg-realtime-status/samples/uso-basico.tsx.sample` (type-check: OK).

```tsx
import { useSgRealtimeStatus } from "@seedgrid/fe-components";

export function RealtimeBadge() {
  const { status, connected } = useSgRealtimeStatus();
  // connected === false: desligado, Pulse fora, reconectando ou credencial revogada.
  // E o sinal para a tela voltar ao polling de reserva.
  return <span>{connected ? "Ao vivo" : `Polling (${status})`}</span>;
}
```

### Handler por padrão de evento

Fonte: `apps/showcase/src/app/components/hooks/use-sg-realtime-event/samples/uso-basico.tsx.sample` (type-check: OK).

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

Simulação completa sem rede (WebSocket de demonstração via `connectOptions.webSocketImpl` e `fetchToken` fixo): `apps/showcase/src/app/components/providers/sg-realtime-provider/samples/simulador.tsx.sample` (type-check: OK; não reproduzido aqui pelo tamanho).
