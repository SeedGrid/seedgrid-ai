---
tags: [seedgrid, front, component, navegacao-e-overlay]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components (sg-dock-menu, sg-popup, sg-dialog, sg-confirmation-dialog, sg-wizard)
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Navegação, overlay e wizard, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — navegação e overlay — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Exemplos — Navegação, overlay e wizard (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Visao-geral|Navegação e overlay]] · API: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|API]]

Todos os exemplos do showcase de cada componente, na ordem e com os títulos do showcase (título em pt-BR, como vem do dicionário de i18n). Cada bloco é cópia 1:1 do arquivo `samples/*.tsx.sample` correspondente, em `apps/showcase/src/app/components/<componente>/samples/` do seedgrid-fe-components `0f304bb`, comparada texto a texto por script em 2026-11-09 (idêntico). Quando o `.sample` é um trecho sem `import`/`export` (como os do `SgDockMenu`), a linha "Fonte" avisa e o bloco é o trecho do showcase, sem completar. Os blocos não foram compilados nesta conferência. O último exemplo do `SgWizard` (helpers puros) é próprio, não vem do showcase.

## SgDockMenu

### 1) Como prender dentro da área

Para ficar dentro do preview, use container com "relative" e no dock passe style={{ position: "absolute" }}.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/como-fixar-dentro-da-area.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="relative h-56 rounded-lg border-2 border-dashed border-border bg-muted/20">
  <SgDockMenu
    id="dock-anchored"
    items={items}
    position="center-bottom"
    style={{ position: "absolute" }}
    zIndex={10}
  />
</div>
```

### 2) Básico

Dock padrão na base central com itens clicáveis.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/basico.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

Nota: `style={{ position: "absolute" }}` prende o dock ao container `relative`.

```tsx
const items: SgDockMenuItem[] = [
  { id: "home", icon: <Home size={24} />, label: "Home" },
  { id: "mail", icon: <Mail size={24} />, label: "Mail", badge: 5 },
  { id: "notifications", icon: <Bell size={24} />, label: "Notifications", badge: 12 },
  { id: "settings", icon: <Settings size={24} />, label: "Settings" },
  { id: "profile", icon: <User size={24} />, label: "Profile" }
];

<div className="relative h-64 rounded-lg border-2 border-dashed border-border bg-muted/20">
  <SgDockMenu id="basic-dock" items={items} position="center-bottom" zIndex={10} style={{ position: "absolute" }} />
</div>
```

### 3) Badge externo

Atualize o badge por estado externo e reflita no dock em tempo real.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/badge-externo.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
const [badges, setBadges] = React.useState({ mail: 5, notifications: 12 });

const items: SgDockMenuItem[] = [
  { id: "home", icon: <Home size={24} />, label: "Home" },
  { id: "mail", icon: <Mail size={24} />, label: "Mail", badge: badges.mail },
  { id: "notifications", icon: <Bell size={24} />, label: "Notifications", badge: badges.notifications }
];

<SgDockMenu id="external-badge-dock" items={items} position="center-bottom" zIndex={10} style={{ position: "absolute" }} />
```

### 4) Todas as posições

Exibe as 8 posições suportadas em uma grade.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/todas-as-posicoes.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="relative h-40 rounded-lg border-2 border-dashed border-border bg-muted/20"><SgDockMenu id="dock-left-top" items={items} position="left-top" itemSize={36} gap={8} zIndex={10} style={{ position: "absolute" }} /></div>
  <div className="relative h-40 rounded-lg border-2 border-dashed border-border bg-muted/20"><SgDockMenu id="dock-center-top" items={items} position="center-top" itemSize={36} gap={8} zIndex={10} style={{ position: "absolute" }} /></div>
  <div className="relative h-40 rounded-lg border-2 border-dashed border-border bg-muted/20"><SgDockMenu id="dock-right-top" items={items} position="right-top" itemSize={36} gap={8} zIndex={10} style={{ position: "absolute" }} /></div>
</div>
```

### 5) Arrastar e soltar

Permite arrastar o dock e salvar a posição.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/drag-and-drop.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

Nota: Com `dragId`, a posição arrastada é salva (`localStorage` ou `SgEnvironmentProvider`) e o clique direito oferece "resetar posição".

```tsx
<div className="relative h-80 rounded-lg border-2 border-dashed border-border bg-muted/20">
  <SgDockMenu
    id="draggable-dock"
    dragId="demo-dockmenu-draggable"
    items={items}
    position="center-bottom"
    enableDragDrop
    zIndex={10}
    style={{ position: "absolute" }}
  />
</div>
```

### 6) Variantes visuais

Sem magnify, sem labels e com estilo customizado.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/variantes-visuais.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="space-y-4">
  <div className="relative h-48 rounded-lg border-2 border-dashed border-border bg-muted/20">
    <SgDockMenu id="dock-no-magnify" items={items} position="center-bottom" magnify={false} zIndex={10} style={{ position: "absolute" }} />
  </div>
  <div className="relative h-48 rounded-lg border-2 border-dashed border-border bg-muted/20">
    <SgDockMenu id="dock-no-labels" items={items} position="center-bottom" showLabels={false} zIndex={10} style={{ position: "absolute" }} />
  </div>
</div>
```

### 7) Muitos itens

Exemplo com uma lista maior de itens.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/muitos-items.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
const items: SgDockMenuItem[] = [
  { id: "search", icon: <Search size={22} />, label: "Search" },
  { id: "favorites", icon: <Heart size={22} />, label: "Favorites", badge: 3 },
  { id: "messages", icon: <MessageSquare size={22} />, label: "Messages", badge: "99+" }
];

<div className="relative h-64 rounded-lg border-2 border-dashed border-border bg-muted/20">
  <SgDockMenu id="many-items-dock" items={items} position="center-bottom" itemSize={44} gap={10} zIndex={10} style={{ position: "absolute" }} />
</div>
```

### 8) Callbacks e desabilitado

Logs de clique e item desabilitado no mesmo exemplo.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/callbacks-e-disabled.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
const [eventLog, setEventLog] = React.useState<string[]>([]);
const callbackItems: SgDockMenuItem[] = items.map((item) => ({
  ...item,
  onClick: () => setEventLog((prev) => [`${item.label} clicked`, ...prev].slice(0, 10))
}));

<div className="space-y-4">
  <SgDockMenu id="callback-dock" items={callbackItems} position="center-bottom" zIndex={10} style={{ position: "absolute" }} />
  <div className="h-32 overflow-y-auto rounded border border-border bg-foreground/5 p-2 font-mono text-xs">
    {eventLog.map((entry, idx) => <div key={idx}>{entry}</div>)}
  </div>
</div>
```

### 9) Zoom, elevação e deslocamento

magnifyScale amplia mais o item sob o mouse, elevation ajusta a sombra e offset afasta o dock da borda.

Fonte: `apps/showcase/src/app/components/sg-dock-menu/samples/zoom-elevacao-e-deslocamento.tsx.sample`.

```tsx
"use client";

import * as React from "react";
import { SgDockMenu } from "@seedgrid/fe-components";

import { Bell, Home, Mail } from "lucide-react";

const items = [
  { id: "home", icon: <Home size={24} />, label: "Home" },
  { id: "mail", icon: <Mail size={24} />, label: "Mail", badge: 5 },
  { id: "notifications", icon: <Bell size={24} />, label: "Notifications", badge: 12 }
];

<div className="relative h-60 rounded-lg border-2 border-dashed border-border bg-muted/20">
  <SgDockMenu
    id="dock-zoom"
    items={items}
    position="center-bottom"
    magnifyScale={2}
    elevation="sm"
    offset={{ y: -8 }}
    zIndex={10}
    style={{ position: "absolute" }}
  />
</div>
```

## SgPopup

### 1) Básico

Popup controlado com ações e conteúdo.

Fonte: `apps/showcase/src/app/components/sg-popup/samples/basico.tsx.sample`.

Nota: O consumidor abre pelo botão âncora; o popup fecha por clique fora, `Esc` ou clique numa ação.

```tsx
import React from "react";
import { SgButton, SgPopup } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton ref={btnRef} onClick={() => setOpen(true)}>Abrir popup</SgButton>
      <SgPopup
        title="Configuracao"
        subtitle="Resumo da acao"
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        placement="auto"
        preferPlacement="right"
        align="start"
        actions={[
          { label: "Confirmar" },
          { label: "Cancelar" }
        ]}
      />
    </>
  );
}
```

### 2) Ícone e hint

Ações com ícone e hint (tooltip).

Fonte: `apps/showcase/src/app/components/sg-popup/samples/icone-hint.tsx.sample`.

```tsx
import React from "react";
import { Check, X } from "lucide-react";
import { SgButton, SgPopup } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton ref={btnRef} onClick={() => setOpen(true)}>Abrir popup com icones</SgButton>
      <SgPopup
        title="Aprovacao"
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        placement="auto"
        preferPlacement="right"
        align="start"
        actions={[
          {
            label: "Aprovar",
            hint: "Aprova a acao atual",
            icon: <Check className="h-4 w-4" />
          },
          {
            label: "Rejeitar",
            hint: "Cancela a acao atual",
            icon: <X className="h-4 w-4" />
          }
        ]}
      />
    </>
  );
}
```

### 3) Conteúdo custom

Use children para renderizar qualquer conteúdo.

Fonte: `apps/showcase/src/app/components/sg-popup/samples/custom.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgInputText, SgPopup } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton ref={btnRef} onClick={() => setOpen(true)}>Abrir popup custom</SgButton>
      <SgPopup
        title="Configuração"
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        placement="auto"
      >
        <SgInputText id="popup-mode" label="Modo" />
      </SgPopup>
    </>
  );
}
```

### 4) Ações

Cada ação tem ícone, dica, severidade e pode manter o popup aberto.

Fonte: `apps/showcase/src/app/components/sg-popup/samples/acoes.tsx.sample`.

```tsx
import React from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { SgButton, SgPopup } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [lastAction, setLastAction] = React.useState("");

  return (
    <>
      <SgButton ref={btnRef} appearance="outline" onClick={() => setOpen(true)}>Ações</SgButton>
      {lastAction ? <span className="text-sm">Última ação: {lastAction}</span> : null}
      <SgPopup
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        actions={[
          { label: "Editar", icon: <Pencil className="h-4 w-4" />, hint: "Abre o editor", onClick: () => setLastAction("editar") },
          { label: "Duplicar (não fecha)", icon: <Copy className="h-4 w-4" />, closeOnClick: false, onClick: () => setLastAction("duplicar") },
          { label: "Indisponível", enabled: false },
          { label: "Excluir", icon: <Trash2 className="h-4 w-4" />, severity: "danger", onClick: () => setLastAction("excluir") }
        ]}
      />
    </>
  );
}
```

### 5) Posicionamento

placement e align; no modo auto o popup escolhe o lado que cabe na tela.

Fonte: `apps/showcase/src/app/components/sg-popup/samples/posicionamento.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgPopup, type SgPopupAlign, type SgPopupPlacement } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<SgPopupPlacement>("bottom");
  const [align, setAlign] = React.useState<SgPopupAlign>("start");

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["auto", "top", "right", "bottom", "left"] as const).map((p) => (
          <SgButton key={p} size="sm" appearance={placement === p ? "solid" : "outline"} onClick={() => setPlacement(p)}>
            {p}
          </SgButton>
        ))}
        {(["start", "center", "end"] as const).map((a) => (
          <SgButton key={a} size="sm" appearance={align === a ? "solid" : "outline"} onClick={() => setAlign(a)}>
            {`align ${a}`}
          </SgButton>
        ))}
      </div>
      <SgButton ref={btnRef} onClick={() => setOpen(true)}>Abrir</SgButton>
      <SgPopup
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        placement={placement}
        align={align}
      >
        <span className="text-sm">{`${placement} / ${align}`}</span>
      </SgPopup>
    </div>
  );
}
```

### 6) Fechamento

Sem fechar por clique fora nem por Esc: só o botão do próprio popup fecha.

Fonte: `apps/showcase/src/app/components/sg-popup/samples/fechamento.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgPopup } from "@seedgrid/fe-components";

export default function Example() {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton ref={btnRef} onClick={() => setOpen(true)}>Abrir fixo</SgButton>
      <SgPopup
        title="Fixo"
        open={open}
        onOpenChange={setOpen}
        anchorRef={btnRef as React.RefObject<HTMLElement>}
        closeOnOutsideClick={false}
        closeOnEscape={false}
        actions={[{ label: "Fechar" }]}
      />
    </>
  );
}
```

## SgDialog

### 1) Básico

Dialog com title, subtitle, leading e trailing.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/basico.tsx.sample`.

Nota: Usa `leading`/`trailing`, `customColor`, `elevation` como `box-shadow` literal e `data-sg-dialog-initial-focus`.

```tsx
import React from "react";
import { SgButton, SgDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton onClick={() => setOpen(true)}>Abrir dialog</SgButton>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirmar acao"
        subtitle="Exemplo basico"
        customColor="#fff7ed"
        elevation="0 0 0 1px rgba(234, 88, 12, 0.22), 0 24px 56px rgba(234, 88, 12, 0.28)"
        style={{ border: "1px solid rgba(59, 130, 246, 0.25)" }}
        leading={<span>O</span>}
        trailing={<span>ID: 428</span>}
        footer={
          <>
            <SgButton appearance="ghost" onClick={() => setOpen(false)}>Cancelar</SgButton>
            <SgButton onClick={() => setOpen(false)}>Confirmar</SgButton>
          </>
        }
      >
        <div className="space-y-2 text-sm">
          <p>Conteudo principal do dialog.</p>
          <input
            data-sg-dialog-initial-focus="true"
            className="h-10 w-full rounded-lg border border-border bg-background px-3"
            placeholder="Digite algo"
          />
        </div>
      </SgDialog>
    </>
  );
}
```

### 2) Severidade

Cada severidade tinge o fundo e a faixa do topo do diálogo, como no SgWhistler.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/severity.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgDialog, type SgDialogProps } from "@seedgrid/fe-components";

type SgDialogSeverity = Exclude<NonNullable<SgDialogProps["severity"]>, "plain">;
const SEVERITIES: SgDialogSeverity[] = ["primary", "secondary", "success", "info", "warning", "help", "danger"];

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState<SgDialogSeverity>("primary");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s) => (
          <SgButton
            key={s}
            severity={s}
            onClick={() => {
              setSeverity(s);
              setOpen(true);
            }}
          >
            {s}
          </SgButton>
        ))}
      </div>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        severity={severity}
        title={`Severidade: ${severity}`}
        footer={
          <>
            <SgButton appearance="ghost" onClick={() => setOpen(false)}>Cancelar</SgButton>
            <SgButton severity={severity} onClick={() => setOpen(false)}>Confirmar</SgButton>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">O fundo e a faixa do topo seguem a severidade escolhida.</div>
      </SgDialog>
    </>
  );
}
```

### 3) Sem closeable

Exemplo sem botão de fechar no header.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/no-close.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>Abrir sem botao de fechar</SgButton>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        closeable={false}
        title="Fluxo guiado"
        subtitle="Sem icone de fechar"
        footer={
          <>
            <SgButton appearance="ghost" onClick={() => setOpen(false)}>Cancelar</SgButton>
            <SgButton onClick={() => setOpen(false)}>Confirmar</SgButton>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">O fechamento fica concentrado nas acoes do rodape.</div>
      </SgDialog>
    </>
  );
}
```

### 4) Sem overlay e ESC

Fechamento apenas pelos botões do footer.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/strict.tsx.sample`.

Nota: Sem X, sem fechar por overlay/Esc. Atenção: com `closeOnEsc={false}` o *focus trap* de `Tab` também fica desligado (ver [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API#SgDialog|API › SgDialog]]).

```tsx
import React from "react";
import { SgButton, SgDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>Abrir modo estrito</SgButton>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        closeable={false}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        title="Confirmacao obrigatoria"
        subtitle="Nao fecha por ESC nem overlay"
        footer={
          <>
            <SgButton appearance="ghost" onClick={() => setOpen(false)}>Cancelar</SgButton>
            <SgButton onClick={() => setOpen(false)}>Confirmar</SgButton>
          </>
        }
      >
        <div className="text-sm text-muted-foreground">Use este modo quando o usuario precisa tomar uma decisao explicita.</div>
      </SgDialog>
    </>
  );
}
```

### 5) Fechamento automático

Fecha automaticamente após alguns segundos.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/auto-close.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>Abrir com auto close</SgButton>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        autoCloseMs={3000}
        title="Sincronizacao concluida"
        subtitle="O dialog fecha em 3 segundos"
      >
        <div className="text-sm text-muted-foreground">Esse exemplo mostra o uso de autoCloseMs.</div>
      </SgDialog>
    </>
  );
}
```

### 6) Animações

animation escolhe como o diálogo entra e sai (fade, zoom ou slideUp) e transitionMs define a duração.

Fonte: `apps/showcase/src/app/components/sg-dialog/samples/animation.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgDialog, type SgDialogProps } from "@seedgrid/fe-components";

const ANIMATIONS: NonNullable<SgDialogProps["animation"]>[] = ["fade", "zoom", "slideUp"];

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [animation, setAnimation] = React.useState<NonNullable<SgDialogProps["animation"]>>("zoom");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ANIMATIONS.map((a) => (
          <SgButton
            key={a}
            appearance="outline"
            size="sm"
            onClick={() => {
              setAnimation(a);
              setOpen(true);
            }}
          >
            {a}
          </SgButton>
        ))}
      </div>
      <SgDialog
        open={open}
        onOpenChange={setOpen}
        animation={animation}
        transitionMs={300}
        title={`Animação ${animation}`}
      >
        <div className="text-sm text-muted-foreground">
          A animação define como o diálogo entra e sai.
        </div>
      </SgDialog>
    </>
  );
}
```

## SgConfirmationDialog

### sectionTitles[0] ?? ""

sectionDescriptions[0]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/basico.tsx.sample`.

Nota: `onCancel` também dispara ao dispensar pelo overlay/Esc.

```tsx
import React from "react";
import { SgButton, SgConfirmationDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState("none");

  return (
    <>
      <SgButton onClick={() => setOpen(true)}>delete permission</SgButton>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete permission"
        message="Confirm delete?"
        severity="danger"
        onCancel={() => setResult("cancel")}
        onConfirm={() => setResult("confirm")}
      />
      <p className="text-xs text-muted-foreground">result: {result}</p>
    </>
  );
}
```

### sectionTitles[1] ?? ""

sectionDescriptions[1]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/severity.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgConfirmationDialog, type SgConfirmationDialogProps } from "@seedgrid/fe-components";

type SgDialogSeverity = Exclude<NonNullable<SgConfirmationDialogProps["severity"]>, "plain">;
const SEVERITIES: SgDialogSeverity[] = ["primary", "secondary", "success", "info", "warning", "help", "danger"];

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState<SgDialogSeverity>("primary");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s) => (
          <SgButton
            key={s}
            severity={s}
            onClick={() => {
              setSeverity(s);
              setOpen(true);
            }}
          >
            {s}
          </SgButton>
        ))}
      </div>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={`Severidade: ${severity}`}
        message="Veja o ícone, o fundo e o botão de confirmar."
        severity={severity}
        showSeverityAccent
      />
    </>
  );
}
```

### sectionTitles[2] ?? ""

sectionDescriptions[2]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/icone-a-esquerda.tsx.sample`.

```tsx
import React from "react";
import { AlertTriangle } from "lucide-react";
import { SgButton, SgConfirmationDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>open warning</SgButton>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Unsaved changes"
        message="You have pending updates. Do you want to continue without saving?"
        icon={<AlertTriangle className="size-5 text-amber-600" />}
        iconPlacement="left"
        severity="warning"
      />
    </>
  );
}
```

### sectionTitles[3] ?? ""

sectionDescriptions[3]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/icone-no-topo.tsx.sample`.

```tsx
import React from "react";
import { ShieldAlert } from "lucide-react";
import { SgButton, SgConfirmationDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>open top icon</SgButton>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Sensitive action"
        message="This operation affects all users in the selected group."
        icon={<ShieldAlert className="size-6 text-rose-600" />}
        iconPlacement="top"
        severity="danger"
        closeable
      />
    </>
  );
}
```

### sectionTitles[4] ?? ""

sectionDescriptions[4]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/botoes-customizados.tsx.sample`.

```tsx
import React from "react";
import { Trash2, X } from "lucide-react";
import { SgButton, SgConfirmationDialog, type SgConfirmationDialogButtonConfig } from "@seedgrid/fe-components";

const cancelButton: SgConfirmationDialogButtonConfig = {
  label: "No, keep it",
  icon: <X className="size-4" />,
  severity: "secondary",
  appearance: "ghost"
};

const confirmButton: SgConfirmationDialogButtonConfig = {
  label: "Yes, delete",
  icon: <Trash2 className="size-4" />,
  severity: "danger"
};

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [log, setLog] = React.useState("none");

  return (
    <>
      <SgButton severity="danger" onClick={() => setOpen(true)}>delete row</SgButton>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete permission"
        message="Confirm delete?"
        severity="danger"
        cancelButton={cancelButton}
        confirmButton={confirmButton}
        onCancel={() => setLog("cancel")}
        onConfirm={() => setLog("confirm")}
      />
      <p className="text-xs text-muted-foreground">last action: {log}</p>
    </>
  );
}
```

### sectionTitles[5] ?? ""

sectionDescriptions[5]

Fonte: `apps/showcase/src/app/components/sg-confirmation-dialog/samples/surface-customizada.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgConfirmationDialog } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <SgButton appearance="outline" onClick={() => setOpen(true)}>open custom surface</SgButton>
      <SgConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete permission"
        message="Confirm delete?"
        severity="danger"
        customColor="#fff7ed"
        elevation="0 0 0 1px rgba(234, 88, 12, 0.22), 0 24px 56px rgba(234, 88, 12, 0.28)"
      />
    </>
  );
}
```

## SgWizard / SgWizardPage

### Validação automática

O wizard valida automaticamente os inputs da página antes de avançar. Por padrão, as etapas anteriores e o próximo passo imediato também podem ser clicados no stepper, com a mesma validação do botão Continuar.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/validacao-automatica.tsx.sample`.

```tsx
import React from "react";
import {
  SgInputEmail,
  SgInputPhone,
  SgInputText,
  SgWizard,
  SgWizardPage,
} from "@seedgrid/fe-components";

export default function Example() {
  const [submitted, setSubmitted] = React.useState<Record<string, string> | null>(null);
  const [formValues, setFormValues] = React.useState({
    name: "",
    email: "",
    phone: "",
  });

  return (
    <>
      <SgWizard
        stepper="numbered"
        stepNavigation="previous-and-next"
        onFinish={async () => {
          setSubmitted(null);
          await new Promise((resolve) => setTimeout(resolve, 800));
          setSubmitted({ ...formValues });
        }}
      >
        <SgWizardPage title="Identificacao">
          <div className="grid gap-3 sm:grid-cols-2">
            <SgInputText
              id="wizard-name"
              label="Nome"
              required
              requiredMessage="Nome obrigatorio"
              inputProps={{
                value: formValues.name,
                onChange: (event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value })),
              }}
            />
            <SgInputEmail
              id="wizard-email"
              label="Email"
              required
              requiredMessage="Email obrigatorio"
              invalidMessage="Email invalido"
              inputProps={{
                value: formValues.email,
                onChange: (event) =>
                  setFormValues((prev) => ({ ...prev, email: event.target.value })),
              }}
            />
          </div>
        </SgWizardPage>
        <SgWizardPage title="Contato">
          <SgInputPhone
            id="wizard-phone"
            label="Telefone"
            required
            requiredMessage="Telefone obrigatorio"
            lengthMessage="Telefone invalido"
            inputProps={{
              value: formValues.phone,
              onChange: (event) =>
                setFormValues((prev) => ({ ...prev, phone: event.target.value })),
            }}
          />
        </SgWizardPage>
        <SgWizardPage title="Resumo">
          <div className="rounded border border-border bg-background p-3 text-sm">
            <div>Nome: {formValues.name || "-"}</div>
            <div>Email: {formValues.email || "-"}</div>
            <div>Telefone: {formValues.phone || "-"}</div>
          </div>
        </SgWizardPage>
      </SgWizard>

      {submitted ? (
        <pre className="mt-4 rounded border border-border bg-foreground/5 p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </>
  );
}
```

### stepNavigation

Use stepNavigation para limitar o clique nas etapas. O padrão é previous-and-next; neste exemplo apenas as etapas anteriores aceitam clique.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/stepnavigation.tsx.sample`.

```tsx
import React from "react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgWizard stepper="numbered" initialStep={2} stepNavigation="previous" onFinish={() => {}}>
      <SgWizardPage title="Introducao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">1. Introducao</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Somente etapas anteriores podem ser clicadas.
          </p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Detalhes">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">2. Detalhes</div>
          <p className="mt-1 text-sm text-muted-foreground">
            O usuario pode voltar clicando no stepper.
          </p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Revisao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">3. Revisao</div>
          <p className="mt-1 text-sm text-muted-foreground">O step atual nao fica clicavel.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Confirmacao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">4. Confirmacao</div>
          <p className="mt-1 text-sm text-muted-foreground">Passos futuros continuam bloqueados.</p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Stepper com ícones

stepper="icons" + icon em cada SgWizardPage: exibe o ícone no círculo em vez do número.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/stepper-com-icones.tsx.sample`.

```tsx
import React from "react";
import { MapPin, Send, Tag } from "lucide-react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgWizard
      stepper="icons"
      onFinish={() => {}}
      style={{ border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 14, padding: 12 }}
    >
      <SgWizardPage
        title="Posicao"
        icon={<MapPin className="size-5" />}
        style={{ backgroundColor: "rgba(59, 130, 246, 0.06)" }}
      >
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Passo 1 - Posicao</div>
          <p className="mt-1 text-sm text-muted-foreground">Select the desired position.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Categoria" icon={<Tag className="size-5" />}>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Passo 2 - Categoria</div>
          <p className="mt-1 text-sm text-muted-foreground">Choose the category.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Enviar" icon={<Send className="size-5" />}>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Passo 3 - Enviar</div>
          <p className="mt-1 text-sm text-muted-foreground">Revise e envie.</p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Stepper numerado

stepper="numbered": círculos numerados com o título de cada passo.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/stepper-numerado.tsx.sample`.

```tsx
import React from "react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgWizard stepper="numbered" onFinish={() => {}}>
      <SgWizardPage title="Introducao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">1. Introducao</div>
          <p className="mt-1 text-sm text-muted-foreground">Conteudo introdutorio.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Detalhes">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">2. Detalhes</div>
          <p className="mt-1 text-sm text-muted-foreground">Preencha os detalhes.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Revisao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">3. Revisao</div>
          <p className="mt-1 text-sm text-muted-foreground">Revise as informacoes.</p>
        </div>
      </SgWizardPage>
      <SgWizardPage title="Confirmacao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">4. Confirmacao</div>
          <p className="mt-1 text-sm text-muted-foreground">Confirme e finalize.</p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Labels customizados

Personalize os textos dos botões.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/labels-customizados.tsx.sample`.

```tsx
import React from "react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgWizard
      labels={{ next: "Avancar", previous: "Voltar", finish: "Concluir" }}
      onFinish={() => {}}
    >
      <SgWizardPage>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Primeiro passo customizado</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Exemplo com labels sobrescritos.
          </p>
        </div>
      </SgWizardPage>
      <SgWizardPage>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Segundo passo customizado</div>
          <p className="mt-1 text-sm text-muted-foreground">
            O botao final tambem pode ser renomeado.
          </p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### onBeforeNext async

Validação assíncrona antes de avançar (ex.: consultar uma API).

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/onbeforenext-async.tsx.sample`.

```tsx
import React from "react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgWizard
      onBeforeNext={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return true;
      }}
      onFinish={async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }}
    >
      <SgWizardPage>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Validacao assicrona</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Antes de avancar, o wizard aguarda uma promise.
          </p>
        </div>
      </SgWizardPage>
      <SgWizardPage>
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Segunda etapa</div>
          <p className="mt-1 text-sm text-muted-foreground">
            O submit final tambem pode ser assicrono.
          </p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### validateStep

Validação customizada por etapa, além da validação automática dos inputs.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/validatestep.tsx.sample`.

```tsx
import React from "react";
import { SgInputEmail, SgInputText, SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function Example() {
  const [formValues, setFormValues] = React.useState({ name: "", email: "" });

  return (
    <SgWizard
      validateStep={(index) => {
        if (index === 0) {
          return Boolean(formValues.name.trim()) && Boolean(formValues.email.trim());
        }
        return true;
      }}
      onFinish={() => {}}
    >
      <SgWizardPage title="Campos obrigatorios">
        <div className="grid gap-3 sm:grid-cols-2">
          <SgInputText
            id="validate-step-name"
            label="Nome"
            inputProps={{
              value: formValues.name,
              onChange: (event) =>
                setFormValues((prev) => ({ ...prev, name: event.target.value })),
            }}
          />
          <SgInputEmail
            id="validate-step-email"
            label="Email"
            inputProps={{
              value: formValues.email,
              onChange: (event) =>
                setFormValues((prev) => ({ ...prev, email: event.target.value })),
            }}
          />
        </div>
      </SgWizardPage>
      <SgWizardPage title="Etapa liberada">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Etapa seguinte</div>
          <p className="mt-1 text-sm text-muted-foreground">
            So abre quando nome e email foram preenchidos.
          </p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Avanço bloqueado (nextDisabled)

onBeforeNext só age no clique: o botão continua com aparência de habilitado e, quando ele recusa, nada acontece na tela. Quando o bloqueio já é conhecido (o resultado de uma checagem assíncrona que já terminou), nextDisabled deixa isso visível.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/nextdisabled.tsx.sample`.

```tsx
import React from "react";
import { SgInputText, SgWizard, SgWizardPage } from "@seedgrid/fe-components";

/**
 * `nextDisabled` — bloqueio JA conhecido.
 *
 * `onBeforeNext` e `validateStep` so agem no clique: o botao continua com aparencia de habilitado
 * e, quando eles recusam, nada acontece na tela. Quando o consumidor JA sabe que a etapa nao pode
 * avancar — tipicamente o resultado de uma checagem assincrona que ja terminou —, `nextDisabled`
 * deixa isso visivel: botao opaco, cursor de bloqueio e stepper sem oferecer as proximas etapas.
 */
export default function Example() {
  const [codigo, setCodigo] = React.useState("");
  const [checando, setChecando] = React.useState(false);
  const [jaUsado, setJaUsado] = React.useState(false);

  // Simula a consulta ao servidor ao sair do campo.
  async function verificarCodigo() {
    if (!codigo.trim()) return;
    setChecando(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setJaUsado(codigo.trim().toUpperCase() === "SG-123");
    setChecando(false);
  }

  return (
    <SgWizard
      // Durante a consulta o wizard ja desabilita sozinho enquanto aguarda onBeforeNext; aqui o
      // bloqueio PERMANECE depois que a resposta chegou.
      nextDisabled={jaUsado}
      onFinish={() => undefined}
    >
      <SgWizardPage title="Convite">
        <SgInputText
          id="wizard-codigo-convite"
          label="Codigo do convite"
          error={jaUsado ? "Este codigo ja foi utilizado." : undefined}
          onChange={(value) => {
            setCodigo(value);
            setJaUsado(false); // digitou de novo: reabre o avanco ate a proxima checagem
          }}
          onExit={() => void verificarCodigo()}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {checando
            ? "Verificando o codigo..."
            : 'Digite "SG-123" e saia do campo: o botao Proximo fica desabilitado.'}
        </p>
      </SgWizardPage>
      <SgWizardPage title="Conclusao">
        <div className="rounded border border-border bg-foreground/5 p-4">
          <div className="text-sm font-semibold">Codigo aceito</div>
          <p className="mt-1 text-sm text-muted-foreground">
            So se chega aqui com um codigo que a checagem liberou.
          </p>
        </div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Desabilitado (enabled)

Com enabled={false} o wizard inteiro fica desabilitado: Anterior, Próximo, Concluir e os passos do stepper não respondem; a etapa atual continua visível.

Fonte: `apps/showcase/src/app/components/sg-wizard/samples/enabled.tsx.sample`.

```tsx
import * as React from "react";
import { SgWizard, SgWizardPage } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgWizard stepper="numbered" initialStep={1} enabled={false} onFinish={() => {}}>
      <SgWizardPage title="Dados">
        <div className="rounded border border-border bg-foreground/5 p-4">Primeira etapa</div>
      </SgWizardPage>
      <SgWizardPage title="Revisão">
        <div className="rounded border border-border bg-foreground/5 p-4">Segunda etapa</div>
      </SgWizardPage>
      <SgWizardPage title="Confirmação">
        <div className="rounded border border-border bg-foreground/5 p-4">Terceira etapa</div>
      </SgWizardPage>
    </SgWizard>
  );
}
```

### Helpers puros do wizard
Exemplo próprio (não vem do showcase), baseado nas assinaturas de `src/wizard/logic.ts` e nos casos de `tests/wizard-logic.test.mjs`.

```tsx
import { canNavigateToWizardStep, canProceedWizardAction, clampWizardStep } from "@seedgrid/fe-components";

export async function demo(): Promise<boolean> {
  const step = clampWizardStep(5, 3); // 2
  const canGoBack = canNavigateToWizardStep({ currentStep: step, targetStep: 0, pageCount: 3, stepNavigation: "previous" });
  const ok = await canProceedWizardAction({
    validateCurrentPage: () => true,
    validateStep: async (index) => index >= 0,
    step
  });
  return canGoBack && ok;
}
```
