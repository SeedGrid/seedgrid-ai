---
tags: [seedgrid, front, component, feedback-e-exibicao]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — feedback e exibição

Copiados 1:1 dos `samples/*.tsx.sample` do showcase e verificados com type-check (TypeScript `strict`) contra `packages/seedgrid-fe-components/src/index.ts` em 2026-10-14 — todos sem erros. API: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API|API de feedback e exibição]] · Visão geral: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Visao-geral|Feedback e exibição]].

## SgAvatar e SgAvatarGroup

### Básico

Iniciais (`label`), ícone e imagem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/basico.tsx.sample`

```tsx
import React from "react";
import { User } from "lucide-react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar label="P" />
      <SgAvatar icon={<User />} severity="secondary" />
      <SgAvatar src="https://i.pravatar.cc/150?img=32" alt="Amy Elsner" />
    </div>
  );
}
```

### Grupo com excedentes

O segundo grupo mostra 3 avatares e `+3` (`total={6}`), com o contador em `moreSeverity="secondary"`. Note que `size="sm"` é repetido em cada filho porque o grupo só o aplica ao contador.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/avatar-group.tsx.sample`

```tsx
import React from "react";
import { Users } from "lucide-react";
import { SgAvatar, SgAvatarGroup } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <SgAvatarGroup>
        <SgAvatar src="https://i.pravatar.cc/150?img=32" />
        <SgAvatar src="https://i.pravatar.cc/150?img=47" />
        <SgAvatar src="https://i.pravatar.cc/150?img=12" />
        <SgAvatar src="https://i.pravatar.cc/150?img=56" />
      </SgAvatarGroup>
      <SgAvatarGroup max={3} total={6} size="sm" moreSeverity="secondary">
        <SgAvatar icon={<Users />} severity="info" size="sm" />
        <SgAvatar label="AL" severity="success" size="sm" />
        <SgAvatar label="BK" severity="warning" size="sm" />
        <SgAvatar label="CM" severity="danger" size="sm" />
      </SgAvatarGroup>
    </div>
  );
}
```

## SgBadge

### Contador e ponto

`max` gera `99+`; `dot` com `pulse`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/counter.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadge value={3} severity="danger" />
      <SgBadge value={120} max={99} severity="danger" />
      <SgBadge dot severity="success" />
      <SgBadge dot severity="success" pulse />
    </>
  );
}
```

### Remoção

`autoRemove` oculta o badge sozinho; sem ele, o pai controla a visibilidade em `onRemove`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/actions.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  const [visible, setVisible] = React.useState(true);
  return (
    <>
      <SgBadge value="Remover auto" removable autoRemove onRemove={() => alert("onRemove")} />
      {visible ? (
        <SgBadge
          value="Remover manual"
          removable
          autoRemove={false}
          onRemove={() => {
            alert("onRemove");
            setVisible(false);
          }}
        />
      ) : null}
    </>
  );
}
```

## SgBadgeOverlay

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgBadge, SgBadgeOverlay } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadgeOverlay badge={<SgBadge value={7} severity="danger" size="xs" />} style={{ borderRadius: 12, padding: 2 }}>
        <span className="inline-flex size-10 items-center justify-center rounded-lg border">Bell</span>
      </SgBadgeOverlay>
      <SgBadgeOverlay badge={<SgBadge dot severity="success" />}>
        <span className="inline-flex size-10 items-center justify-center rounded-lg border">Check</span>
      </SgBadgeOverlay>
    </>
  );
}
```

## SgSkeleton

### Placeholder de card

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/card-placeholder.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border p-4">
      <SgSkeleton shape="rounded" height={160} />
      <div className="mt-4 space-y-2">
        <SgSkeleton shape="text" width="60%" />
        <SgSkeleton shape="text" />
        <SgSkeleton shape="text" width="82%" />
      </div>
    </div>
  );
}
```

## SgToaster e `toast`

### Configuração base

Monte um `SgToaster` e dispare com `toast.*`; `toast.dismiss()` fecha todos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/base-setup.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Mensagem básica")}>toast.message</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Sucesso!")}>
          toast.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.dismiss()}>
          toast.dismiss
        </SgButton>
      </div>
    </div>
  );
}
```

### Opções por toast

`description`, `duration`, `closeButton`, `className` e `style` por chamada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/options-per-toast.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <SgButton
        onClick={() =>
          toast.info("Toast com opções", {
            description: "10s de duração, sem closeButton e com estilo customizado.",
            duration: 10000,
            closeButton: false,
            className: "border-[#c56a2d]",
            style: {
              background: "#fff7f1",
              color: "#5b3b23"
            }
          })
        }
      >
        Trigger toast with options
      </SgButton>
    </div>
  );
}
```

### `toast.promise`

Loading → sucesso/erro no mesmo toast; o erro é relançado (por isso o `try/catch`).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/toast-promise.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  async function runDemo() {
    const task = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (Math.random() < 0.35) {
        throw new Error("Erro aleatório da demo");
      }
      return { id: "ORD-2026-001" };
    };

    try {
      await toast.promise(task, {
        loading: "Salvando pedido...",
        success: (value) => `Pedido salvo: ${value.id}`,
        error: (error) => `Falha: ${error instanceof Error ? error.message : "erro"}`
      });
    } catch {
      // a notificação já foi tratada pelo helper
    }
  }

  return (
    <div className="space-y-3">
      <SgToaster />
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
    </div>
  );
}
```

### Assinando o store

O retorno de `subscribeSgToasts` é a função de limpeza do efeito.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/subscribe-effect.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgToaster, subscribeSgToasts, toast } from "@seedgrid/fe-components";

export default function Example() {
  const [total, setTotal] = React.useState(0);

  // O retorno de subscribeSgToasts e' a propria funcao de limpeza, entao ele pode ser
  // devolvido direto do efeito: a inscricao morre junto com o componente.
  React.useEffect(() => subscribeSgToasts((toasts) => setTotal(toasts.length)), []);

  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => toast.message("Mais um", { duration: 0 })}>Abrir toast</SgButton>
        <span className="text-sm text-muted-foreground">{total} toast(s) abertos</span>
      </div>
    </div>
  );
}
```

## SgToastHost

### Prioridade entre hosts

Dois hosts montados: o mais profundo/último montado (`bottom-right`) renderiza os toasts.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/prioridade-layout-vs-pagina.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border p-4">
        <div className="text-sm font-semibold">Layout host</div>
        <SgToastHost position="top-right" />
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-4">
        <div className="text-sm font-semibold">Page host</div>
        <p className="mb-3 text-sm text-muted-foreground">
          Enquanto este host estiver montado, ele tem prioridade sobre o host do layout.
        </p>
        <SgToastHost position="bottom-right" />
        <SgButton onClick={() => toast.info("Toast renderizado pelo host mais profundo")}>
          Disparar toast
        </SgButton>
      </div>
    </div>
  );
}
```

## SgWhistler e `sgWhistle`

### Configuração base

O `SgWhistler` fica no fluxo, dentro do container tracejado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/base-setup.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>

      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() =>
            sgWhistle.show({
              title: "Base example",
              message: "A default whistle rendered inside the host."
            })
          }
        >
          sgWhistle.show
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            sgWhistle.success({
              title: "Saved",
              message: "The feedback remained inside the layout flow."
            })
          }
        >
          sgWhistle.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => sgWhistle.dismiss()}>
          Clear
        </SgButton>
      </div>
    </div>
  );
}
```

### Atualização por id

`sgWhistle.loading` retorna o id; `sgWhistle.update` reaproveita o mesmo aviso.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/update-by-id.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle, type SgWhistleId } from "@seedgrid/fe-components";

export default function Example() {
  const [id, setId] = React.useState<SgWhistleId | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          onClick={() =>
            setId(
              sgWhistle.loading({
                title: "Synchronizing",
                message: "This whistle will be updated in place.",
                dismissible: false
              })
            )
          }
        >
          Start loading
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            id &&
            sgWhistle.update(id, {
              severity: "success",
              title: "Sync complete",
              message: "The existing whistle id was reused.",
              dismissible: true
            })
          }
        >
          Finish success
        </SgButton>
        <SgButton severity="danger" appearance="outline" onClick={() => id && sgWhistle.dismiss(id)}>
          Dismiss active
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### `sgWhistle.promise`

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/promise.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const runDemo = React.useCallback(async () => {
    try {
      await sgWhistle.promise(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (Math.random() < 0.35) throw new Error("simulated network error");
          return { protocol: "SG-2026-031" };
        },
        {
          loading: { title: "Submitting report", message: "Waiting for the server..." },
          success: (value) => ({ title: "Report sent", message: `Protocol ${value.protocol} generated.` }),
          error: (error) => ({
            title: "Submission failed",
            message: error instanceof Error ? error.message : "Unknown error"
          })
        }
      );
    } catch {
      // represented by sgWhistle.promise
    }
  }, []);

  return (
    <div className="space-y-4">
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

## SgWhistleHost

### Renderer customizado e cores por severidade

`sgWhistle.custom` com JSX livre; `customColors` no host.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/custom-renderer-and-colors.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

const warmColors = {
  default: { bg: "#fff7ed", fg: "#7c2d12", border: "#fdba74" },
  success: { bg: "#ecfdf5", fg: "#065f46", border: "#34d399" },
  info: { bg: "#eff6ff", fg: "#1d4ed8", border: "#60a5fa" },
  warning: { bg: "#fffbeb", fg: "#92400e", border: "#f59e0b" },
  error: { bg: "#fef2f2", fg: "#b91c1c", border: "#f87171" },
  loading: { bg: "#f5f3ff", fg: "#6d28d9", border: "#a78bfa" }
};

export default function Example() {
  return (
    <div className="space-y-4">
      <SgButton
        onClick={() =>
          sgWhistle.custom(
            (id) => (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Custom renderer</div>
                <p className="text-sm opacity-90">Free-form JSX rendered by sgWhistle.custom(...).</p>
                <SgButton size="sm" onClick={() => sgWhistle.dismiss(id)}>Close</SgButton>
              </div>
            ),
            {
              message: "custom",
              duration: 0,
              dismissible: false,
              borderStyle: "full-accent"
            }
          )
        }
      >
        Custom whistle
      </SgButton>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost customColors={warmColors} />
      </div>
    </div>
  );
}
```
