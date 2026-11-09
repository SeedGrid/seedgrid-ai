---
tags: [seedgrid, front, component, buttons]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Botões, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — botões — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/buttons/Exemplos|Exemplos — Botões (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente, na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` correspondente (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` de cada bloco aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles texto a texto; **não foram compilados nesta rodada**. Classes utilitárias (`flex`, `gap-3` etc.) são Tailwind do app de exemplo. O Playground de cada página é interativo e não tem `.sample`, por isso não aparece aqui.

API: [[SeedGrid/SeedGrid-components/buttons/API|API dos botões]] · Visão geral: [[SeedGrid/SeedGrid-components/buttons/Visao-geral|Botões]]. Ícones vêm de `lucide-react` (peer dependency do pacote).

## SgButton

Regras do `onClick` assíncrono (tipo `(event) => unknown`; veja os exemplos 15 a 17 do showcase, «Loading automático com Future», «onClick síncrono x assíncrono» e «Tratando erro no onClick assíncrono»):

1. O `onClick` pode ou não ser `async`; a função síncrona (abrir modal, alternar painel) funciona como sempre.
2. Se a função **devolve** uma `Promise`, o botão entra em loading sozinho (spinner, desabilitado, `aria-busy`), ignora cliques até a operação terminar (inclusive cliques seguidos antes de a tela atualizar) e volta ao normal ao terminar ou falhar. Isso protege contra duplo clique e reenvio, mas **não substitui** a chave de idempotência no servidor.
3. A função precisa **devolver** a `Promise`: `() => { salvar(); }` não protege; `() => salvar()` e `async () => { await salvar(); }` protegem.
4. O botão não engole o erro: sai do loading e relança a falha como rejeição não tratada. Trate com `try/catch` dentro do `onClick` e avise o usuário com `sgWhistle.error`.
5. Use `async` só para ação que pode demorar ou falhar (salvar, enviar, pagar); ação instantânea fica síncrona.
6. `loading` manual vence: o loading efetivo é `loading` ou operação pendente.

### Basico

Clique ativa `loading` por 1,2 s (spinner + botão desabilitado); o segundo botão usa `enabled={false}`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = () => {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgButton onClick={handleClick} loading={isLoading}>
        Submit
      </SgButton>
      <SgButton enabled={false}>Disabled</SgButton>
    </div>
  );
}
```

### Icones

Examples completos com icones para validar appearance/shape/elevation.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/icones.tsx.sample`

```tsx
import React from "react";
import { Check } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium text-muted-foreground">Elevated Buttons</div>
        <div className="flex flex-wrap items-center gap-3">
          {SEVERITIES.map((severity) => (
            <SgButton key={`raised-${severity}`} severity={severity} appearance="solid" elevation="sm" leftIcon={<Check className="size-4" />}>
              {capitalize(severity)}
            </SgButton>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-muted-foreground">Rounded Buttons</div>
        <div className="flex flex-wrap items-center gap-3">
          {SEVERITIES.map((severity) => (
            <SgButton key={`rounded-${severity}`} severity={severity} shape="rounded" leftIcon={<Check className="size-4" />}>
              {capitalize(severity)}
            </SgButton>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-muted-foreground">Ghost Buttons (Flat)</div>
        <div className="flex flex-wrap items-center gap-3">
          {SEVERITIES.map((severity) => (
            <SgButton key={`ghost-${severity}`} severity={severity} appearance="ghost" leftIcon={<Check className="size-4" />}>
              {capitalize(severity)}
            </SgButton>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-muted-foreground">Outlined + Elevation</div>
        <div className="flex flex-wrap items-center gap-3">
          {SEVERITIES.map((severity) => (
            <SgButton key={`outline-elevation-${severity}`} severity={severity} appearance="outline" elevation="sm" leftIcon={<Check className="size-4" />}>
              {capitalize(severity)}
            </SgButton>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-muted-foreground">Outlined Buttons</div>
        <div className="flex flex-wrap items-center gap-3">
          {SEVERITIES.map((severity) => (
            <SgButton key={`outline-${severity}`} severity={severity} appearance="outline" leftIcon={<Check className="size-4" />}>
              {capitalize(severity)}
            </SgButton>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Severities

severity="primary" | "secondary" | "success" | "info" | "warning" | "help" | "danger"

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/severities.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity}>{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Elevated Buttons

appearance="solid" + elevation="sm".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/elevated-buttons.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity} appearance="solid" elevation="sm">{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Rounded Buttons

shape="rounded" para formato pill.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/rounded-buttons.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity} shape="rounded">{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Ghost Buttons (Flat)

appearance="ghost" - sem fundo, apenas texto colorido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/ghost-buttons-flat.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity} appearance="ghost">{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Outlined + Elevation

appearance="outline" + elevation="sm".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/outlined-e-elevation.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity} appearance="outline" elevation="sm">{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Outlined Buttons

appearance="outline" - apenas bordas coloridas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/outlined-buttons.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

const SEVERITIES = ["primary", "secondary", "success", "info", "warning", "help", "danger"] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SEVERITIES.map((severity) => (
        <SgButton key={severity} severity={severity} appearance="outline">{capitalize(severity)}</SgButton>
      ))}
    </div>
  );
}
```

### Rounded Icon Buttons

Sem `children`/`label` e com `leftIcon`, o modo somente-ícone é inferido. Em produção, acrescente `aria-label` (o componente não gera um).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/rounded-icon-buttons.tsx.sample`

```tsx
import React from "react";
import { Bookmark, Search, Users, Bell, Heart, X, Check } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

const ICON_MAP = [
  { severity: "primary", icon: <Bookmark className="size-4" /> },
  { severity: "secondary", icon: <Search className="size-4" /> },
  { severity: "success", icon: <Users className="size-4" /> },
  { severity: "info", icon: <Bell className="size-4" /> },
  { severity: "help", icon: <Heart className="size-4" /> },
  { severity: "danger", icon: <X className="size-4" /> },
  { severity: "warning", icon: <Check className="size-4" /> },
] as const;

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {ICON_MAP.map(({ severity, icon }) => (
        <SgButton key={severity} severity={severity} shape="rounded" leftIcon={icon} />
      ))}
    </div>
  );
}
```

### Rounded Text Icon Buttons

shape="rounded" + icon only + appearance="ghost"

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/rounded-text-icon-buttons.tsx.sample`

```tsx
import React from "react";
import { Bookmark, Search, Users, Bell, Heart, X, Check } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

const ICON_MAP = [
  { severity: "primary", icon: <Bookmark className="size-4" /> },
  { severity: "secondary", icon: <Search className="size-4" /> },
  { severity: "success", icon: <Users className="size-4" /> },
  { severity: "info", icon: <Bell className="size-4" /> },
  { severity: "help", icon: <Heart className="size-4" /> },
  { severity: "danger", icon: <X className="size-4" /> },
  { severity: "warning", icon: <Check className="size-4" /> },
] as const;

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {ICON_MAP.map(({ severity, icon }) => (
        <SgButton key={severity} severity={severity} shape="rounded" appearance="ghost" leftIcon={icon} />
      ))}
    </div>
  );
}
```

### Rounded and Outlined Icon Buttons

shape="rounded" + icon only + appearance="outline"

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/rounded-and-outlined-icon-buttons.tsx.sample`

```tsx
import React from "react";
import { Bookmark, Search, Users, Bell, Heart, X, Check } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

const ICON_MAP = [
  { severity: "primary", icon: <Bookmark className="size-4" /> },
  { severity: "secondary", icon: <Search className="size-4" /> },
  { severity: "success", icon: <Users className="size-4" /> },
  { severity: "info", icon: <Bell className="size-4" /> },
  { severity: "help", icon: <Heart className="size-4" /> },
  { severity: "danger", icon: <X className="size-4" /> },
  { severity: "warning", icon: <Check className="size-4" /> },
] as const;

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {ICON_MAP.map(({ severity, icon }) => (
        <SgButton key={severity} severity={severity} shape="rounded" appearance="outline" leftIcon={icon} />
      ))}
    </div>
  );
}
```

### Sizes

size="sm" | "md" | "lg"

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/sizes.tsx.sample`

```tsx
import React from "react";
import { Check } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SgButton size="sm">Small</SgButton>
        <SgButton size="md">Medium</SgButton>
        <SgButton size="lg">Large</SgButton>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SgButton size="sm" shape="rounded" leftIcon={<Check className="size-4" />} />
        <SgButton size="md" shape="rounded" leftIcon={<Check className="size-4" />} />
        <SgButton size="lg" shape="rounded" leftIcon={<Check className="size-4" />} />
      </div>
    </div>
  );
}
```

### Loading

loading=true exibe spinner e desabilita o botao.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/loading.tsx.sample`

```tsx
import React from "react";
import { Check, X } from "lucide-react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgButton loading>Processing...</SgButton>
      <SgButton severity="success" loading>Saving...</SgButton>
      <SgButton severity="danger" loading leftIcon={<X className="size-4" />}>Deleting...</SgButton>
      <SgButton shape="rounded" loading leftIcon={<Check className="size-4" />} />
    </div>
  );
}
```

### Custom Colors

`customColors` sobrescreve fundo, texto, borda, hover e anel de foco (inclusive com `appearance="outline"`).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/custom-colors.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgButton
        customColors={{
          bg: "#0f172a",
          fg: "#ffffff",
          hoverBg: "#020617",
          ring: "rgba(15,23,42,.35)"
        }}
      >
        Brand Dark
      </SgButton>
      <SgButton
        customColors={{
          bg: "#ec4899",
          fg: "#ffffff",
          border: "#db2777",
          hoverBg: "#db2777",
          ring: "rgba(236,72,153,.35)"
        }}
      >
        Pink
      </SgButton>
      <SgButton
        appearance="outline"
        customColors={{
          bg: "#8b5cf6",
          fg: "#8b5cf6",
          border: "#8b5cf6",
          ring: "rgba(139,92,246,.35)"
        }}
      >
        Violet Outline
      </SgButton>
    </div>
  );
}
```

### Loading automático com Future

Se o onClick devolve uma operação assíncrona (Promise no React, Future no Flutter), o botão entra em loading sozinho: mostra o spinner, fica desabilitado e ignora cliques, inclusive cliques seguidos antes de a tela atualizar, até a operação terminar. Ao terminar ou falhar, volta ao normal. Isso evita duplo clique e reenvio e ajuda na idempotência da ação na tela, mas não substitui a chave de idempotência no servidor. A prop loading manual continua valendo e vence: o loading efetivo é loading ou operação pendente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/loading-automatico-com-future.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const [status, setStatus] = React.useState("Idle");

  const save = async () => {
    setStatus("Saving...");
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setStatus("Done");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgButton onClick={save}>Submit</SgButton>
      <span className="text-sm text-muted-foreground">{status}</span>
    </div>
  );
}
```

### onClick síncrono x assíncrono

O onClick pode ou não ser assíncrono. Função síncrona (abrir um modal, alternar um painel) funciona como sempre e nada muda. Para o botão proteger a ação, o onClick precisa DEVOLVER a operação assíncrona: no React, async () => { await salvar(); } ou () => salvar(); no Flutter, async () { ... } sempre devolve um Future. Chamar salvar() sem devolver o resultado (no React, chaves sem return; no Flutter, função que não é async) não protege. Use async só quando a ação puder demorar ou falhar (salvar, enviar, pagar); ações instantâneas ficam síncronas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/onclick-sincrono-x-assincrono.tsx.sample`

```tsx
import React from "react";
import { SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const [panel, setPanel] = React.useState("Closed");
  const [status, setStatus] = React.useState("Idle");

  const toggle = () => setPanel(panel === "Open" ? "Closed" : "Open");

  const save = async () => {
    setStatus("Saving...");
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setStatus("Saved");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgButton appearance="outline" onClick={toggle}>Toggle panel</SgButton>
      <span className="text-sm text-muted-foreground">{panel}</span>
      <SgButton onClick={save}>Save</SgButton>
      <span className="text-sm text-muted-foreground">{status}</span>
    </div>
  );
}
```

### Tratando erro no onClick assíncrono

O botão não engole o erro: se a operação falhar, ele sai do loading e relança o erro como rejeição não tratada. Por isso, trate a falha com try/catch dentro do onClick e avise o usuário (por exemplo, com sgWhistle.error). Neste exemplo a operação sempre falha e o aviso aparece na caixa abaixo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-button/samples/tratando-erro-no-onclick-assincrono.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const save = async () => {
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      throw new Error("Network error");
    } catch {
      sgWhistle.error({
        title: "Could not save",
        message: "Check your connection and try again."
      });
    }
  };

  return (
    <div className="space-y-3">
      <SgButton severity="danger" onClick={save}>Save (fails)</SgButton>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

## SgSplitButton

### Basico

Ação principal `Save` e três ações secundárias no menu.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/basico.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Save, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return <SgSplitButton label="Save" leftIcon={<Save className="size-4" />} onClick={() => {}} items={items} style={{ minWidth: 180 }} />;
}
```

### Severidades

severity="primary" | "secondary" | "success" | "info" | "warning" | "help" | "danger".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/severidades.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return <SgSplitButton label="Primary" severity="primary" onClick={() => {}} items={items} />;
}
```

### Outlined

appearance="outline": bordas coloridas sem preenchimento.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/outlined.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return <SgSplitButton label="Primary" severity="primary" appearance="outline" onClick={() => {}} items={items} />;
}
```

### Ghost

appearance="ghost": sem fundo, apenas texto colorido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/ghost.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return <SgSplitButton label="Primary" severity="primary" appearance="ghost" onClick={() => {}} items={items} />;
}
```

### Elevated

appearance="solid" + elevation="sm".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/elevated.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return <SgSplitButton label="Primary" severity="primary" appearance="solid" elevation="sm" onClick={() => {}} items={items} />;
}
```

### Tamanhos

size="sm" | "md" | "lg".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/tamanhos.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Save, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return (
    <>
      <SgSplitButton label="Small" size="sm" leftIcon={<Save className="size-4" />} onClick={() => {}} items={items} />
      <SgSplitButton label="Medium" size="md" leftIcon={<Save className="size-4" />} onClick={() => {}} items={items} />
      <SgSplitButton label="Large" size="lg" leftIcon={<Save className="size-4" />} onClick={() => {}} items={items} />
    </>
  );
}
```

### Com icones

leftIcon na acao principal e icon nos itens do menu.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/com-icones.tsx.sample`

```tsx
import React from "react";
import { Copy, Download, FileText, Home, Mail, Plus, Printer, RefreshCw, Save, Share2, Trash2, Upload } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const basicItems = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

const fileItems = [
  { label: "Copy", icon: <Copy className="size-4" />, onClick: () => {} },
  { label: "Print", icon: <Printer className="size-4" />, onClick: () => {} },
  { separator: true, label: "Export as PDF", icon: <FileText className="size-4" />, onClick: () => {} },
  { label: "Share via email", icon: <Mail className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return (
    <>
      <SgSplitButton label="Save" leftIcon={<Save className="size-4" />} severity="primary" onClick={() => {}} items={basicItems} />
      <SgSplitButton
        label="New"
        leftIcon={<Plus className="size-4" />}
        severity="success"
        onClick={() => {}}
        items={[
          { label: "Import", icon: <Upload className="size-4" />, onClick: () => {} },
          { label: "Download template", icon: <Download className="size-4" />, onClick: () => {} }
        ]}
      />
      <SgSplitButton label="Share" leftIcon={<Share2 className="size-4" />} severity="info" onClick={() => {}} items={fileItems} />
    </>
  );
}
```

### Separadores de menu

`separator: true` desenha uma divisória antes do item.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/separadores-de-menu.tsx.sample`

```tsx
import React from "react";
import { FileText } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

export default function Example() {
  return <SgSplitButton label="File" leftIcon={<FileText className="size-4" />} items={[{ label: "Copy" }, { separator: true, label: "Export as PDF" }]} onClick={() => {}} />;
}
```

### Disabled

disabled=true desabilita o split button inteiro.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/disabled.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Save, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return (
    <>
      <SgSplitButton label="Save" leftIcon={<Save className="size-4" />} enabled={false} onClick={() => {}} items={items} />
      <SgSplitButton label="Disabled outline" severity="danger" appearance="outline" enabled={false} onClick={() => {}} items={items} />
    </>
  );
}
```

### Loading

loading=true exibe spinner na acao principal e desabilita o menu.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/loading.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Save, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

const items = [
  { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
  { label: "Delete", icon: <Trash2 className="size-4" />, onClick: () => {} },
  { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
];

export default function Example() {
  return (
    <>
      <SgSplitButton label="Saving..." leftIcon={<Save className="size-4" />} loading onClick={() => {}} items={items} />
      <SgSplitButton label="Processing..." severity="success" loading onClick={() => {}} items={items} />
    </>
  );
}
```

### Itens desabilitados

Itens individuais do menu podem ser desabilitados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-split-button/samples/itens-desabilitados.tsx.sample`

```tsx
import React from "react";
import { Home, RefreshCw, Trash2 } from "lucide-react";
import { SgSplitButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgSplitButton
      label="Actions"
      severity="primary"
      onClick={() => {}}
      items={[
        { label: "Update", icon: <RefreshCw className="size-4" />, onClick: () => {} },
        { label: "Delete (disabled)", icon: <Trash2 className="size-4" />, onClick: () => {}, enabled: false },
        { label: "Homepage", icon: <Home className="size-4" />, onClick: () => {} }
      ]}
    />
  );
}
```

## SgFloatActionButton

### Posicoes

O FAB pode ser posicionado em 8 pontos da tela usando a prop position.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/positions.tsx.sample`

```tsx
import React from "react";
import { Pencil } from "lucide-react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode }) {
  return <div className="relative h-72 w-full rounded-md border border-dashed border-border bg-muted/20 pt-10">{props.children}</div>;
}

export default function Example() {
  return (
    <DemoBox>
      <SgFloatActionButton absolute position="left-top" size="sm" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="center-top" size="sm" severity="secondary" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="right-top" size="sm" severity="success" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="left-center" size="sm" severity="warning" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="right-center" size="sm" severity="danger" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="left-bottom" size="sm" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="center-bottom" size="sm" severity="secondary" icon={<Pencil className="size-4" />} onClick={() => {}} />
      <SgFloatActionButton absolute position="right-bottom" size="sm" severity="success" icon={<Pencil className="size-4" />} onClick={() => {}} />
    </DemoBox>
  );
}
```

### Severidades

Cores do tema: primary, secondary, success, info, warning, help, danger e plain.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/variants.tsx.sample`

```tsx
import React from "react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      {(["primary", "secondary", "success", "info", "warning", "help", "danger", "plain"] as const).map((value) => (
        <div key={value} className="flex flex-col items-center gap-2">
          <SgFloatActionButton absolute={false} severity={value} onClick={() => {}} style={{ position: "relative" }} />
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}
```

### Formas e Tamanhos

Combine shape (circle, rounded, square) com size (sm, md, lg).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/shapes-sizes.tsx.sample`

```tsx
import React from "react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="grid grid-cols-3 gap-6 w-full">
      {(["circle", "rounded", "square"] as const).map((shape) => (
        <div key={shape} className="flex flex-col items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground">{shape}</span>
          <div className="flex gap-4 items-center">
            {(["sm", "md", "lg"] as const).map((size) => (
              <SgFloatActionButton key={size} shape={shape} size={size} onClick={() => {}} style={{ position: "relative" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Elevacao

Controle a sombra com elevation: none, sm, md ou lg.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/elevation.tsx.sample`

```tsx
import React from "react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      {(["none", "sm", "md", "lg"] as const).map((elevation) => (
        <div key={elevation} className="flex flex-col items-center gap-2">
          <SgFloatActionButton elevation={elevation} onClick={() => {}} style={{ position: "relative" }} />
          <span className="text-xs text-muted-foreground">{elevation}</span>
        </div>
      ))}
    </div>
  );
}
```

### Dica (Tooltip)

Exibe um tooltip ao passar o mouse sobre o FAB.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/hint.tsx.sample`

```tsx
import React from "react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-8 items-center flex-wrap py-4">
      {(["top", "right", "bottom", "left"] as const).map((hintPosition) => (
        <div key={hintPosition} className="flex flex-col items-center gap-2">
          <SgFloatActionButton
            hint="Add new"
            hintPosition={hintPosition}
            hintDelay={0}
            onClick={() => {}}
            style={{ position: "relative" }}
          />
          <span className="text-xs text-muted-foreground">hintPosition="{hintPosition}"</span>
        </div>
      ))}
    </div>
  );
}
```

### Acoes (Speed Dial)

`absolute` posiciona o FAB dentro do container `relative`; `direction` define para onde as ações se abrem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/actions-linear-layout.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode; className?: string; height?: string }) {
  return <div className={`relative w-full rounded-md border border-dashed border-border bg-muted/20 pt-10 ${props.height ?? "h-48"} ${props.className ?? ""}`}>{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} }
];

const actionsNoLabel: SgFABAction[] = actions.map(({ label: _, ...rest }) => rest);

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-8 w-full">
      <DemoBox height="h-72" className="flex items-end justify-center">
        <SgFloatActionButton absolute position="center-bottom" actions={actions} type="linear" direction="up" />
      </DemoBox>
      <DemoBox height="h-72" className="flex items-start justify-center">
        <SgFloatActionButton absolute position="center-top" actions={actions} type="linear" direction="down" />
      </DemoBox>
      <DemoBox height="h-24" className="flex items-center justify-end pt-14">
        <SgFloatActionButton absolute position="right-center" actions={actionsNoLabel} type="linear" direction="left" />
      </DemoBox>
      <DemoBox height="h-24" className="flex items-center justify-start pt-14">
        <SgFloatActionButton absolute position="left-center" actions={actionsNoLabel} type="linear" direction="right" />
      </DemoBox>
    </div>
  );
}
```

### Circle Layout

`type="circle"` com `radius` explícito.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/circle-layout.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus, Pencil } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode }) {
  return <div className="relative h-96 w-full rounded-md border border-dashed border-border bg-muted/20">{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} },
  { icon: <Pencil className="size-4" />, label: "Edit", onClick: () => {} }
];

export default function Example() {
  return (
    <DemoBox>
      <SgFloatActionButton absolute position="center-top" actions={[...actions, ...actions]} type="circle" radius={120} severity="secondary" />
    </DemoBox>
  );
}
```

### Semi-Circle Layout

Actions arranged in a semi-circle (180°) in different directions

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/semi-circle-layout.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode; className?: string; height?: string }) {
  return <div className={`relative w-full rounded-md border border-dashed border-border bg-muted/20 pt-10 ${props.height ?? "h-48"} ${props.className ?? ""}`}>{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} }
];
const actionsNoLabel: SgFABAction[] = actions.map(({ label: _, ...rest }) => rest);

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-8 w-full">
      <DemoBox height="h-72" className="flex items-end justify-center">
        <SgFloatActionButton absolute position="center-bottom" actions={actions} type="semi-circle" direction="up" severity="success" />
      </DemoBox>
      <DemoBox height="h-72" className="flex items-start justify-center">
        <SgFloatActionButton absolute position="center-top" actions={actions} type="semi-circle" direction="down" severity="warning" />
      </DemoBox>
      <DemoBox height="h-48" className="flex items-center justify-end">
        <SgFloatActionButton absolute position="right-center" actions={actionsNoLabel} type="semi-circle" direction="left" severity="danger" />
      </DemoBox>
      <DemoBox height="h-48" className="flex items-center justify-start">
        <SgFloatActionButton absolute position="left-center" actions={actionsNoLabel} type="semi-circle" direction="right" />
      </DemoBox>
    </div>
  );
}
```

### Quarter-Circle Layout

Actions arranged in a quarter circle (90°) in different directions

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/quarter-circle-layout.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode; className?: string; height?: string }) {
  return <div className={`relative w-full rounded-md border border-dashed border-border bg-muted/20 pt-10 ${props.height ?? "h-48"} ${props.className ?? ""}`}>{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} }
];
const actionsNoLabel: SgFABAction[] = actions.map(({ label: _, ...rest }) => rest);

export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-8 w-full">
      <DemoBox height="h-64" className="flex items-end justify-center">
        <SgFloatActionButton absolute position="center-bottom" actions={actions} type="quarter-circle" direction="up" severity="secondary" />
      </DemoBox>
      <DemoBox height="h-64" className="flex items-start justify-center">
        <SgFloatActionButton absolute position="center-top" actions={actions} type="quarter-circle" direction="down" severity="success" />
      </DemoBox>
      <DemoBox height="h-48" className="flex items-center justify-end">
        <SgFloatActionButton absolute position="right-center" actions={actionsNoLabel} type="quarter-circle" direction="left" severity="warning" />
      </DemoBox>
      <DemoBox height="h-48" className="flex items-center justify-start">
        <SgFloatActionButton absolute position="left-center" actions={actionsNoLabel} type="quarter-circle" direction="right" severity="danger" />
      </DemoBox>
    </div>
  );
}
```

### Active Icon

Show a different icon when the menu is open

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/active-icon.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus, Settings } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode }) {
  return <div className="relative h-72 w-full rounded-md border border-dashed border-border bg-muted/20">{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} }
];

export default function Example() {
  return (
    <DemoBox>
      <SgFloatActionButton absolute position="center-bottom" actions={actions} type="semi-circle" direction="up" activeIcon={<Settings className="size-4" />} severity="secondary" />
    </DemoBox>
  );
}
```

### Animacoes

Diferentes tipos de animacao na montagem: scale, fade, rotate, slide e pulse.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/animations.tsx.sample`

```tsx
import React from "react";
import { Heart } from "lucide-react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      {(["scale", "fade", "rotate", "slide", "pulse", "none"] as const).map((animation) => (
        <div key={animation} className="flex flex-col items-center gap-2">
          <SgFloatActionButton
            animation={animation}
            animationOn="hover"
            icon={<Heart className="size-4" />}
            severity="danger"
            size="sm"
            onClick={() => {}}
            style={{ position: "relative" }}
          />
          <span className="text-xs text-muted-foreground">{animation}</span>
        </div>
      ))}
    </div>
  );
}
```

### Cor Customizada

Use a prop color para definir uma cor personalizada (hex, rgb, hsl ou CSS variable).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/custom-color.tsx.sample`

```tsx
import React from "react";
import { Heart, Settings, Star } from "lucide-react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-6 items-center flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <SgFloatActionButton color="#8b5cf6" icon={<Star className="size-4" />} onClick={() => {}} style={{ position: "relative" }} />
        <span className="text-xs text-muted-foreground">#8b5cf6</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SgFloatActionButton color="#ec4899" icon={<Heart className="size-4" />} onClick={() => {}} style={{ position: "relative" }} />
        <span className="text-xs text-muted-foreground">#ec4899</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SgFloatActionButton color="#f97316" icon={<Settings className="size-4" />} onClick={() => {}} style={{ position: "relative" }} />
        <span className="text-xs text-muted-foreground">#f97316</span>
      </div>
    </div>
  );
}
```

### Loading e Desabilitado

Estados loading e disabled.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/disabled-loading.tsx.sample`

```tsx
import React from "react";
import { SgFloatActionButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex gap-6 items-center">
      <div className="flex flex-col items-center gap-2">
        <SgFloatActionButton enabled={false} onClick={() => {}} style={{ position: "relative" }} />
        <span className="text-xs text-muted-foreground">disabled</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SgFloatActionButton loading onClick={() => {}} style={{ position: "relative" }} />
        <span className="text-xs text-muted-foreground">loading</span>
      </div>
    </div>
  );
}
```

### Arrastar e soltar

`enableDragDrop` + `dragId` salvam a posição (via `SgEnvironmentProvider`, se houver, ou `localStorage`). Botão direito no FAB oferece redefinir a posição.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-float-action-button/samples/drag-drop.tsx.sample`

```tsx
import React from "react";
import { UserPlus, FilePlus, FolderPlus } from "lucide-react";
import { SgFloatActionButton, type SgFABAction } from "@seedgrid/fe-components";

function DemoBox(props: { children: React.ReactNode }) {
  return <div className="relative h-64 w-full rounded-md border border-dashed border-border bg-muted/20">{props.children}</div>;
}

const actions: SgFABAction[] = [
  { icon: <UserPlus className="size-4" />, label: "New user", onClick: () => {} },
  { icon: <FilePlus className="size-4" />, label: "New file", onClick: () => {} },
  { icon: <FolderPlus className="size-4" />, label: "New folder", onClick: () => {} }
];

export default function Example() {
  return (
    <DemoBox>
      <SgFloatActionButton
        enableDragDrop
        dragId="showcase-fab-drag"
        actions={actions}
        type="linear"
        direction="up"
        severity="info"
        absolute
        position="right-bottom"
      />
    </DemoBox>
  );
}
```
