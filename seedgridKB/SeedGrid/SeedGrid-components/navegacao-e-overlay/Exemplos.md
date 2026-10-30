---
tags: [seedgrid, front, component, navegacao-e-overlay]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components (sg-dock-menu, sg-popup, sg-dialog, sg-confirmation-dialog, sg-wizard)
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "Exemplos TSX (React) de Navegação, overlay e wizard, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — navegação e overlay — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Exemplos — Navegação, overlay e wizard (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Visão geral: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Visao-geral|Navegação e overlay]] · API: [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|API]]

Todos os exemplos abaixo foram verificados com type-check TypeScript (`strict`) contra `packages/seedgrid-fe-components/src/index.ts` no commit `ad30fc11de` (resultado: OK). Os marcados "1:1" são cópias exatas dos arquivos `samples/*.tsx.sample` do showcase. Os do `SgDockMenu` foram **completados** (imports e componente) porque os samples do showcase desse componente são trechos sem `import`/`export` — o JSX e os dados são os do sample citado.

## SgDockMenu

### Dock básico ancorado num container
Baseado em `apps/showcase/src/app/components/sg-dock-menu/samples/basico.tsx.sample` (completado com imports). `style={{ position: "absolute" }}` prende o dock ao container `relative`.

```tsx
import React from "react";
import { Bell, Home, Mail, Settings, User } from "lucide-react";
import { SgDockMenu, type SgDockMenuItem } from "@seedgrid/fe-components";

const items: SgDockMenuItem[] = [
  { id: "home", icon: <Home size={24} />, label: "Home" },
  { id: "mail", icon: <Mail size={24} />, label: "Mail", badge: 5 },
  { id: "notifications", icon: <Bell size={24} />, label: "Notifications", badge: 12 },
  { id: "settings", icon: <Settings size={24} />, label: "Settings" },
  { id: "profile", icon: <User size={24} />, label: "Profile" }
];

export default function Example() {
  return (
    <div className="relative h-64 rounded-lg border-2 border-dashed border-border bg-muted/20">
      <SgDockMenu id="basic-dock" items={items} position="center-bottom" zIndex={10} style={{ position: "absolute" }} />
    </div>
  );
}
```

### Arraste com posição persistida + callbacks e item desabilitado
Combina `samples/drag-and-drop.tsx.sample` e `samples/callbacks-e-disabled.tsx.sample` (completado). Com `dragId`, a posição arrastada é salva (`localStorage` ou `SgEnvironmentProvider`) e o clique direito oferece "resetar posição".

```tsx
import React from "react";
import { Home, Mail, Settings } from "lucide-react";
import { SgDockMenu, type SgDockMenuItem } from "@seedgrid/fe-components";

const items: SgDockMenuItem[] = [
  { id: "home", icon: <Home size={24} />, label: "Home" },
  { id: "mail", icon: <Mail size={24} />, label: "Mail", badge: 5 },
  { id: "settings", icon: <Settings size={24} />, label: "Settings", disabled: true }
];

export default function Example() {
  const [eventLog, setEventLog] = React.useState<string[]>([]);
  const callbackItems: SgDockMenuItem[] = items.map((item) => ({
    ...item,
    onClick: () => setEventLog((prev) => [`${item.label} clicked`, ...prev].slice(0, 10))
  }));

  return (
    <div className="space-y-4">
      <div className="relative h-80 rounded-lg border-2 border-dashed border-border bg-muted/20">
        <SgDockMenu
          id="draggable-dock"
          dragId="demo-dockmenu-draggable"
          items={callbackItems}
          position="center-bottom"
          enableDragDrop
          zIndex={10}
          style={{ position: "absolute" }}
        />
      </div>
      <div className="h-32 overflow-y-auto rounded border border-border bg-foreground/5 p-2 font-mono text-xs">
        {eventLog.map((entry, idx) => <div key={idx}>{entry}</div>)}
      </div>
    </div>
  );
}
```

## SgPopup

### Popup com ações (1:1)
`apps/showcase/src/app/components/sg-popup/samples/basico.tsx.sample` — o consumidor abre pelo botão âncora; o popup fecha por clique fora, `Esc` ou clique numa ação.

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

### Ações com ícone e hint (1:1)
`apps/showcase/src/app/components/sg-popup/samples/icone-hint.tsx.sample`

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

## SgDialog

### Dialog com cabeçalho, rodapé e foco inicial (1:1)
`apps/showcase/src/app/components/sg-dialog/samples/basico.tsx.sample` — usa `leading`/`trailing`, `customColor`, `elevation` como `box-shadow` literal e `data-sg-dialog-initial-focus`.

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

### Modo estrito (1:1)
`apps/showcase/src/app/components/sg-dialog/samples/strict.tsx.sample` — sem X, sem fechar por overlay/Esc. Atenção: com `closeOnEsc={false}` o *focus trap* de `Tab` também fica desligado (ver [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API#SgDialog|API › SgDialog]]).

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

### Auto-fechamento (1:1)
`apps/showcase/src/app/components/sg-dialog/samples/auto-close.tsx.sample`

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

## SgConfirmationDialog

### Confirmação básica (1:1)
`apps/showcase/src/app/components/sg-confirmation-dialog/samples/basico.tsx.sample` — `onCancel` também dispara ao dispensar pelo overlay/Esc.

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

### Botões customizados (1:1)
`apps/showcase/src/app/components/sg-confirmation-dialog/samples/botoes-customizados.tsx.sample`

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

## SgWizard / SgWizardPage

### Stepper numerado (1:1)
`apps/showcase/src/app/components/sg-wizard/samples/stepper-numerado.tsx.sample`

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

### Validação por etapa com `validateStep` (1:1)
`apps/showcase/src/app/components/sg-wizard/samples/validatestep.tsx.sample`

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

### Guarda assíncrona e conclusão assíncrona (1:1)
`apps/showcase/src/app/components/sg-wizard/samples/onbeforenext-async.tsx.sample`

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

### Bloqueio declarativo com `nextDisabled` (1:1)
`apps/showcase/src/app/components/sg-wizard/samples/nextdisabled.tsx.sample`

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
