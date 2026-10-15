---
tags: [seedgrid, front, component, buttons]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — botões

Copiados 1:1 dos `samples/*.tsx.sample` do showcase e verificados com type-check (TypeScript `strict`) contra `packages/seedgrid-fe-components/src/index.ts` em 2026-10-14 — todos sem erros. Ícones vêm de `lucide-react` (peer dependency do pacote). API: [[SeedGrid/SeedGrid-components/buttons/API|API dos botões]] · Visão geral: [[SeedGrid/SeedGrid-components/buttons/Visao-geral|Botões]].

## SgButton

### Básico com loading

Clique ativa `loading` por 1,2 s (spinner + botão desabilitado); o segundo botão usa `disabled`.

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
      <SgButton disabled>Disabled</SgButton>
    </div>
  );
}
```

### Cores customizadas

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

### Somente ícone

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

## SgSplitButton

### Básico

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

### Separador no menu

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

## SgFloatActionButton

### Layout linear com direções

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

### Layout circular

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

### Arrastar e soltar com posição persistida

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

### Tooltip (hint)

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
