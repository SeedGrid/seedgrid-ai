---
tags: [seedgrid, front, component, layout]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components; front/seedgrid-fe-components/packages/seedgrid-fe-components/src/layout
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
description: "Exemplos TSX (React) de Layout e containers, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — layout — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos|Exemplos — Layout e containers (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

API: [[SeedGrid/SeedGrid-components/layout/API|Layout — API]] · Visão geral: [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout — visão geral]]

Exemplos copiados 1:1 dos arquivos `samples/*.tsx.sample` do showcase (caminhos relativos a `front/seedgrid-fe-components/`), salvo indicação. Todos foram verificados com type-check TypeScript (`strict`) contra `packages/seedgrid-fe-components/src/index.ts` em 2026-10-14 — sem erros. Classes Tailwind e ícones `lucide-react` vêm do showcase; `lucide-react` é peer dependency do pacote.


## SgStack

### column-row

Fonte: `apps/showcase/src/app/components/sg-stack/samples/column-row.tsx.sample`. Coluna com `gap` e linha com `justify="between"` / `align="center"`.

```tsx
import React from "react";
import { SgButton, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgStack gap={8}>
        <SgButton>Save</SgButton>
        <SgButton appearance="outline">Cancelar</SgButton>
      </SgStack>
      <SgStack direction="row" justify="between" align="center">
        <span>Title</span>
        <SgButton size="sm">Confirmar</SgButton>
      </SgStack>
    </>
  );
}
```


## SgGrid

### columns-responsivo

Fonte: `apps/showcase/src/app/components/sg-grid/samples/columns-responsivo.tsx.sample`. Colunas por breakpoint (`base`/`sm`/`lg`/`xl`) e filho `SgPanel` com `span={2}`.

```tsx
import React from "react";
import { SgGrid, SgPanel, SgStack } from "@seedgrid/fe-components";

function Card(props: { title: string; subtitle?: string }) {
  return <SgPanel padding={12} className="rounded-lg"><SgStack gap={8}><p className="font-medium">{props.title}</p><p className="text-xs text-muted-foreground">{props.subtitle ?? "Card padrao"}</p></SgStack></SgPanel>;
}

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={12}>
      <Card title="Card 1" />
      <Card title="Card 2" />
      <SgPanel span={2} padding={12} className="rounded-lg"><SgStack gap={8}><p className="font-medium">Card 3 (span 2)</p><p className="text-xs text-muted-foreground">Ocupa 2 colunas.</p></SgStack></SgPanel>
      <Card title="Card 4" />
      <Card title="Card 5" />
      <Card title="Card 6" />
    </SgGrid>
  );
}
```

### auto-fit-rowspan

Fonte: `apps/showcase/src/app/components/sg-grid/samples/auto-fit-rowspan.tsx.sample`. `minItemWidth` (auto-fit), `rowHeight`, `dense` e filhos com `span`/`rowSpan`.

```tsx
import React from "react";
import { SgGrid, SgPanel, SgStack } from "@seedgrid/fe-components";

function Card(props: { title: string; subtitle?: string }) {
  return <SgPanel padding={12} className="rounded-lg"><SgStack gap={8}><p className="font-medium">{props.title}</p><p className="text-xs text-muted-foreground">{props.subtitle ?? "Card padrao"}</p></SgStack></SgPanel>;
}

export default function Example() {
  return (
    <SgGrid minItemWidth="16rem" gap={12} rowHeight={120} dense>
      <Card title="Card A" />
      <SgPanel rowSpan={2} padding={12} className="rounded-lg"><SgStack gap={8}><p className="font-medium">Card B (rowSpan 2)</p><p className="text-xs text-muted-foreground">Ocupa 2 linhas do grid.</p></SgStack></SgPanel>
      <Card title="Card C" />
      <SgPanel span={2} padding={12} className="rounded-lg"><SgStack gap={8}><p className="font-medium">Card D (span 2)</p><p className="text-xs text-muted-foreground">Ocupa 2 colunas.</p></SgStack></SgPanel>
      <Card title="Card E" />
      <Card title="Card F" />
    </SgGrid>
  );
}
```


## SgPanel

### align-width-height

Fonte: `apps/showcase/src/app/components/sg-panel/samples/align-width-height.tsx.sample`. Docking: painéis filhos com `align` top/left/right/bottom/client; `width`/`height` numéricos são %.

```tsx
import React from "react";
import { SgPanel, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgPanel className="h-[430px] rounded-xl bg-muted/30" padding={12}>
      <SgPanel className="h-full w-full rounded-lg bg-background p-3" contentGap={8}>
        <SgPanel align="top" height={12} padding={10} className="rounded-md">
          <SgStack direction="row" justify="between" align="center">
            <span className="text-sm font-medium">Header</span>
            <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">top + height=12%</span>
          </SgStack>
        </SgPanel>
        <SgPanel align="left" width={20} padding={10} className="rounded-md">
          <SgStack gap={6}>
            <span className="text-xs font-medium text-muted-foreground">MENU</span>
            <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Dashboard</SgPanel>
            <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Relatorios</SgPanel>
            <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Clientes</SgPanel>
            <span className="pt-1 text-[11px] text-muted-foreground">left + width=20%</span>
          </SgStack>
        </SgPanel>
        <SgPanel align="right" width="18%" padding={10} className="rounded-md">
          <SgStack gap={6}>
            <span className="text-xs font-medium text-muted-foreground">ACOES</span>
            <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Filtrar</SgPanel>
            <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Exportar</SgPanel>
            <span className="pt-1 text-[11px] text-muted-foreground">right + width=18%</span>
          </SgStack>
        </SgPanel>
        <SgPanel align="bottom" height="10%" padding={10} className="rounded-md">
          <SgStack direction="row" justify="between" align="center">
            <span className="text-sm">Footer</span>
            <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">bottom + height=10%</span>
          </SgStack>
        </SgPanel>
        <SgPanel align="client" padding={10} className="rounded-md">
          <SgStack gap={8}>
            <span className="text-sm font-medium">Area client</span>
            <SgPanel borderStyle="solid" className="h-24 rounded bg-muted/20" />
            <span className="text-xs text-muted-foreground">client ocupa o restante automaticamente.</span>
          </SgStack>
        </SgPanel>
      </SgPanel>
    </SgPanel>
  );
}
```


## SgScreen

### complete-example

Fonte: `apps/showcase/src/app/components/sg-screen/samples/complete-example.tsx.sample`. `SgScreen` não-fullscreen contendo um `SgPanel` com docking.

```tsx
"use client";

import React from "react";
import { SgScreen, SgPanel, SgStack } from "@seedgrid/fe-components";

export default function ExampleSgScreenPage() {
  return (
    <SgPanel className="h-[420px] rounded-xl bg-muted/30" padding={12}>
      <SgScreen fullscreen={false} padding={10} className="rounded-lg bg-zinc-100">
        <SgPanel className="h-full w-full" contentPadding={8} contentGap={8}>
          <SgPanel align="top" height={12} padding={10} className="rounded-md">
            <SgStack direction="row" justify="between" align="center">
              <span className="text-sm font-medium">Header</span>
              <span className="text-xs text-muted-foreground">top + height=12%</span>
            </SgStack>
          </SgPanel>

          <SgPanel align="left" width={20} padding={10} className="rounded-md">
            <SgStack gap={6}>
              <span className="text-xs font-medium text-muted-foreground">MENU</span>
              <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Dashboard</SgPanel>
              <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Relatorios</SgPanel>
              <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Clientes</SgPanel>
            </SgStack>
          </SgPanel>

          <SgPanel align="right" width="18%" padding={10} className="rounded-md">
            <SgStack gap={6}>
              <span className="text-xs font-medium text-muted-foreground">ACOES</span>
              <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Filtrar</SgPanel>
              <SgPanel borderStyle="none" className="rounded bg-muted/40" padding={6}>Exportar</SgPanel>
            </SgStack>
          </SgPanel>

          <SgPanel align="bottom" height="10%" padding={10} className="rounded-md">
            <SgStack direction="row" justify="between" align="center">
              <span className="text-sm">Footer</span>
              <span className="text-xs text-muted-foreground">bottom + height=10%</span>
            </SgStack>
          </SgPanel>

          <SgPanel align="client" padding={10} className="rounded-md">
            <SgStack gap={8}>
              <span className="text-sm font-medium">Area client</span>
              <SgPanel borderStyle="solid" className="h-24 rounded bg-muted/20" />
              <span className="text-xs text-muted-foreground">
                Esta area ocupa todo o espaco restante.
              </span>
            </SgStack>
          </SgPanel>
        </SgPanel>
      </SgScreen>
    </SgPanel>
  );
}
```


## SgGroupBox

### basico

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/basico.tsx.sample`. Agrupamento com título (`fieldset`/`legend`).

```tsx
import { SgGroupBox } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGroupBox
      title="Dados pessoais"
      style={{ boxShadow: "inset 0 0 0 1px rgba(59, 130, 246, 0.2)" }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>Campo 1</div>
        <div>Campo 2</div>
      </div>
    </SgGroupBox>
  );
}
```


## SgCard

### basico

Fonte: `apps/showcase/src/app/components/sg-card/samples/basico.tsx.sample`. Título, descrição, corpo e rodapé.

```tsx
import React from "react";
import { SgCard } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCard
      title="Resumo financeiro"
      description="Visao consolidada do dia"
      footer={
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Atualizado agora</span>
          <span>Ultima sincronizacao</span>
        </div>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Receita</span>
          <span className="font-semibold">R$ 12.400</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pedidos</span>
          <span className="font-semibold">83</span>
        </div>
      </div>
    </SgCard>
  );
}
```

### colapsavel

Fonte: `apps/showcase/src/app/components/sg-card/samples/colapsavel.tsx.sample`. `collapsible` com `defaultOpen` e alinhamento do botão de colapso.

```tsx
import React from "react";
import { SgButton, SgCard } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgCard
        title="Painel recolhido"
        description="Abre sob demanda"
        collapsible
        defaultOpen={false}
        collapseToggleAlign="right"
        collapseIconSize={20}
        footer={<div className="flex justify-end"><SgButton size="sm">Acao</SgButton></div>}
      >
        <div className="text-sm text-muted-foreground">Conteudo recolhivel do card.</div>
      </SgCard>

      <SgCard
        title="Painel aberto"
        description="Comeca expandido"
        collapsible
        defaultOpen
        collapseToggleAlign="right"
        collapseIconSize={20}
        footer={
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>128 itens</span>
            <span>R$ 9.820</span>
          </div>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tickets</span>
            <span className="font-semibold">128</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-semibold">R$ 9.820</span>
          </div>
        </div>
      </SgCard>
    </>
  );
}
```

### draggable-persistence

Fonte: `apps/showcase/src/app/components/sg-card/samples/draggable-persistence.tsx.sample`. Arraste pelo cabeçalho com posição persistida via `SgEnvironmentProvider` (`dragPersistKey`).

```tsx
import React from "react";
import { SgCard, SgEnvironmentProvider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgEnvironmentProvider
      value={{
        namespaceProvider: { getNamespace: () => "showcase" },
        persistence: { scope: "app:showcase", mode: "fallback", stateVersion: 1 }
      }}
    >
      <div className="relative h-[300px] overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/20 p-2">
        <SgCard
          id="sg-card-draggable-demo"
          draggable
          defaultPosition={{ x: 16, y: 16 }}
          dragPersistKey="sg-card-draggable-demo"
          title="Drag me by the title bar"
          description="Try moving and refreshing this page."
          collapsible
          collapseToggleAlign="right"
          collapseIconSize={20}
          bgColor="#ffffff"
          footer={<div className="text-xs text-muted-foreground">Persisted drag position.</div>}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-emerald-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Region</span>
              <span className="font-semibold">Sao Paulo</span>
            </div>
          </div>
        </SgCard>
      </div>
    </SgEnvironmentProvider>
  );
}
```


## SgAccordion

### basico-vertical-single

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/basico-vertical-single.tsx.sample`. Uso mínimo: só `items` (abre o primeiro por padrão).

```tsx
import * as React from "react";
import { SgAccordion, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "personal", title: "Dados pessoais", content: <p className="text-sm">Nome, email e telefone.</p> },
  { id: "address", title: "Endereco", content: <p className="text-sm">Rua, cidade e CEP.</p> },
  { id: "billing", title: "Faturamento", content: <p className="text-sm">Cobranca e historico.</p> }
];

export default function Example() {
  return <SgAccordion items={items} />;
}
```

### controlado-por-estado

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/controlado-por-estado.tsx.sample`. Modo controlado com `activeIndex` + `onActiveIndexChange`.

```tsx
import * as React from "react";
import { SgAccordion, SgButton, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "personal", title: "Dados pessoais", content: <p className="text-sm">Conteudo 1</p> },
  { id: "address", title: "Endereco", content: <p className="text-sm">Conteudo 2</p> },
  { id: "billing", title: "Faturamento", content: <p className="text-sm">Conteudo 3</p> }
];

export default function Example() {
  const [activeIndex, setActiveIndex] = React.useState<number[]>([0]);

  return (
    <div className="space-y-3">
      <SgAccordion items={items} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setActiveIndex([0])}>Abrir 1</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActiveIndex([1])}>Abrir 2</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActiveIndex([2])}>Abrir 3</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActiveIndex([])}>Fechar todos</SgButton>
      </div>
    </div>
  );
}
```


## SgPageControl

### basico

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/basico.tsx.sample`. Abas declaradas com `SgPageControlPage` e página inicial por id.

```tsx
import React from "react";
import { Receipt, ShieldCheck, UserRound } from "lucide-react";
import { SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgPageControl
      defaultActivePageId="registration"
      style={{ border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 12 }}
    >
      <SgPageControlPage
        id="registration"
        title="Registration"
        icon={<UserRound className="size-4" />}
        style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
      >
        Registration content
      </SgPageControlPage>
      <SgPageControlPage id="fiscal" title="Fiscal" icon={<Receipt className="size-4" />}>
        Fiscal content
      </SgPageControlPage>
      <SgPageControlPage id="access" title="Access" icon={<ShieldCheck className="size-4" />}>
        Access content
      </SgPageControlPage>
    </SgPageControl>
  );
}
```

### controle-externo

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/controle-externo.tsx.sample`. Controle externo por `activePageId` e estilo `pills`.

```tsx
import React from "react";
import { FolderKanban, Receipt, ShieldCheck, UserRound } from "lucide-react";
import { SgButton, SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  const [activePageId, setActivePageId] = React.useState("registration");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setActivePageId("registration")}>Go to Registration</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActivePageId("fiscal")}>Go to Fiscal</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActivePageId("access")}>Go to Access</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setActivePageId("integrations")}>Go to Integrations</SgButton>
      </div>

      <SgPageControl activePageId={activePageId} onActivePageIdChange={(pageId) => setActivePageId(pageId)} pageControlStyle="pills">
        <SgPageControlPage id="registration" title="Registration" icon={<UserRound className="size-4" />}>Registration content</SgPageControlPage>
        <SgPageControlPage id="fiscal" title="Fiscal" icon={<Receipt className="size-4" />}>Fiscal content</SgPageControlPage>
        <SgPageControlPage id="access" title="Access" icon={<ShieldCheck className="size-4" />}>Access content</SgPageControlPage>
        <SgPageControlPage id="integrations" title="Integrations" icon={<FolderKanban className="size-4" />}>Integrations content</SgPageControlPage>
      </SgPageControl>
    </div>
  );
}
```


## SgExpandablePanel

### overlay-comportamento

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/overlay-comportamento.tsx.sample`. Overlay com foco preso, Esc, clique fora, backdrop e resize.

```tsx
import React from "react";
import { SgButton, SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => setOpen(true)}>Abrir drawer</SgButton>
      </div>

      <SgExpandablePanel
        mode="overlay"
        expandTo="left"
        placement="center"
        open={open}
        onOpenChange={setOpen}
        size={{ default: 360, min: 260, max: 640 }}
        resizable
        closeOnEsc
        closeOnOutsideClick
        trapFocus
        showBackdrop
        handle={<div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/35" />}
        header={<div className="font-medium">Drawer com foco preso</div>}
        footer={
          <div className="flex justify-end">
            <SgButton size="sm" onClick={() => setOpen(false)}>Fechar</SgButton>
          </div>
        }
      >
        <div className="space-y-2 text-sm">
          <p>Props: placement, closeOnEsc, closeOnOutsideClick, trapFocus e showBackdrop.</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span>Somente ativos</span>
          </label>
        </div>
      </SgExpandablePanel>
    </>
  );
}
```

### inline-controlado-resize

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/inline-controlado-resize.tsx.sample`. Inline controlado com `onSizeChange`.

```tsx
import React from "react";
import { SgButton, SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(true);
  const [size, setSize] = React.useState<number | string>(320);

  return (
    <div className="h-[360px] overflow-hidden rounded-lg border border-border">
      <div className="flex h-full">
        <div className="flex-1 space-y-3 p-4">
          <h3 className="text-base font-semibold">Area principal</h3>
          <p className="text-sm text-muted-foreground">Exemplo inline controlado com resize.</p>
          <div className="flex flex-wrap gap-2">
            <SgButton size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? "Fechar inspector" : "Abrir inspector"}
            </SgButton>
          </div>
          <p className="text-xs text-muted-foreground">Largura atual: {String(size)}px</p>
        </div>

        <SgExpandablePanel
          mode="inline"
          expandTo="left"
          open={open}
          onOpenChange={setOpen}
          size={{ default: 320, min: 240, max: 560 }}
          resizable
          onSizeChange={setSize}
          header={<div className="font-medium">Inspector</div>}
          footer={<div className="text-xs text-muted-foreground">Rodape inline</div>}
        >
          <div className="space-y-3 text-sm">
            <p>Conteudo do inspector.</p>
            <p>Props: open, onOpenChange, size, resizable, onSizeChange.</p>
          </div>
        </SgExpandablePanel>
      </div>
    </div>
  );
}
```


## SgCarousel

### layout-carousel-autoplay

Autoplay com `onIndexChange`. **Composto** a partir de `apps/showcase/src/app/components/sg-carousel/samples/auto-play.tsx.sample` e `com-callbacks.tsx.sample` (que no showcase são fragmentos JSX) mais a função `createCarouselItems` de `sg-carousel/page.tsx` (3 imagens em vez de 6).

```tsx
import React from "react";
import { SgCarousel, SgGrid } from "@seedgrid/fe-components";

const sampleImages = [
  { id: 1, title: "Item 1", url: "https://picsum.photos/1200/700?random=101" },
  { id: 2, title: "Item 2", url: "https://picsum.photos/1200/700?random=102" },
  { id: 3, title: "Item 3", url: "https://picsum.photos/1200/700?random=103" }
];

const createCarouselItems = (items = sampleImages) =>
  items.map((item) => (
    <div key={item.id} className="relative h-full overflow-hidden rounded-lg text-white shadow-lg">
      <img src={item.url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-black/35" />
      <SgGrid columns={1} justify="center" align="center" className="absolute inset-0">
        <div className="text-center">
          <h3 className="text-3xl font-bold">{item.title}</h3>
          <p className="mt-2 text-sm opacity-90">Slide {item.id}</p>
        </div>
      </SgGrid>
    </div>
  ));

export default function Example() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  return (
    <div className="space-y-2">
      <div className="h-64">
        <SgCarousel
          items={createCarouselItems()}
          numVisible={1}
          autoPlay
          autoPlayInterval={2000}
          orientation="horizontal"
          height="100%"
          onIndexChange={setActiveIndex}
        />
      </div>
      <p className="text-sm">Índice ativo: {activeIndex}</p>
    </div>
  );
}
```


## SgBreadcrumb

### basico

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/basico.tsx.sample`. Itens com ícone, separador `chevron` e ícone de início.

```tsx
import React from "react";
import { Box, Building2, FilePenLine, Layers3 } from "lucide-react";
import { SgBreadcrumb, type SgBreadcrumbItem } from "@seedgrid/fe-components";

const items: SgBreadcrumbItem[] = [
  { id: "modules", label: "Modules", href: "/modules", icon: <Layers3 className="size-4" /> },
  { id: "registrations", label: "Registrations", href: "/modules/registrations", icon: <Building2 className="size-4" /> },
  { id: "products", label: "Products", href: "/modules/registrations/products", icon: <Box className="size-4" /> },
  { id: "edit", label: "Edit", icon: <FilePenLine className="size-4" /> }
];

export default function Example() {
  return <SgBreadcrumb items={items} separator="chevron" showHomeIcon />;
}
```

### overflow

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/overflow.tsx.sample`. `maxItems` com colapso e `overflowBehavior="scroll"`.

```tsx
import React from "react";
import { SgBreadcrumb, type SgBreadcrumbItem } from "@seedgrid/fe-components";

const longItems: SgBreadcrumbItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "admin", label: "Admin", href: "/admin" },
  { id: "tenant", label: "Multi Tenancy", href: "/admin/tenant" },
  { id: "billing", label: "Billing", href: "/admin/tenant/billing" },
  { id: "plans", label: "Subscription", href: "/admin/tenant/billing/subscription" },
  { id: "edit", label: "Edit plan" }
];

export default function Example() {
  return (
    <div className="space-y-4">
      <SgBreadcrumb items={longItems} maxItems={4} overflowBehavior="collapse" separator="slash" />
      <div className="max-w-[360px] rounded-lg border border-border p-2">
        <SgBreadcrumb items={longItems} overflowBehavior="scroll" separator="dot" />
      </div>
    </div>
  );
}
```


## SgMenu

### sidebar-fixa

Fonte: `apps/showcase/src/app/components/sg-menu/samples/sidebar-fixa.tsx.sample`. Sidebar recolhível controlada, busca, marca, usuário e `onNavigate`.

```tsx
import React from "react";
import { ClipboardList, Home, LayoutGrid, Search, Settings, Users } from "lucide-react";
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const MENU: SgMenuNode[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: <Home className="size-4" /> },
  { id: "customers", label: "Customers", icon: <Users className="size-4" />, children: [{ id: "customers-new", label: "New", icon: <LayoutGrid className="size-4" /> }, { id: "customers-reports", label: "Reports", icon: <ClipboardList className="size-4" /> }] },
  { id: "orders", label: "Orders", icon: <LayoutGrid className="size-4" />, children: [{ id: "orders-sales", label: "Sales", icon: <Search className="size-4" /> }] },
  { id: "profile", label: "Profile", url: "/profile", icon: <Settings className="size-4" /> }
];

const USER_MENU: SgMenuNode[] = [{ id: "perfil", label: "My profile", onClick: () => {} }, { id: "logout", label: "Sign out", onClick: () => {} }];

export default function Example() {
  const [activeId, setActiveId] = React.useState("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="h-[460px] overflow-hidden rounded-lg border border-border">
      <div className="flex h-full">
        <SgMenu menu={MENU} selection={{ activeId }} menuStyle="sidebar" mode="accordion" collapsed={collapsed} onCollapsedChange={setCollapsed} showCollapseButton search={{ enabled: true, placeholder: "Search module..." }} brand={{ title: "SeedGrid ERP" }} user={{ name: "Lucia Souza", subtitle: "Finance" }} userMenu={USER_MENU} onNavigate={(node) => setActiveId(node.id)} />
        <div className="flex-1 space-y-3 p-4"><h3 className="text-base font-semibold">Main content</h3><p className="text-sm text-muted-foreground">Active item: <span className="font-medium text-foreground">{activeId}</span></p></div>
      </div>
    </div>
  );
}
```

### drawer-mobile

Fonte: `apps/showcase/src/app/components/sg-menu/samples/drawer-mobile.tsx.sample`. Drawer controlado (`open`/`onOpenChange`) com pin.

```tsx
import React from "react";
import { ClipboardList, Home, LayoutGrid, Search, Settings, Users } from "lucide-react";
import { SgButton, SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const MENU: SgMenuNode[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: <Home className="size-4" /> },
  { id: "customers", label: "Customers", icon: <Users className="size-4" />, children: [{ id: "customers-new", label: "New", icon: <LayoutGrid className="size-4" /> }, { id: "customers-reports", label: "Reports", icon: <ClipboardList className="size-4" /> }] },
  { id: "orders", label: "Orders", icon: <LayoutGrid className="size-4" />, children: [{ id: "orders-sales", label: "Sales", icon: <Search className="size-4" /> }] },
  { id: "profile", label: "Profile", url: "/profile", icon: <Settings className="size-4" /> }
];

export default function Example() {
  const [activeId, setActiveId] = React.useState("dashboard");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerPinned, setDrawerPinned] = React.useState(false);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => setDrawerOpen(true)}>Open mobile menu</SgButton>
        <SgButton appearance="outline" onClick={() => setDrawerPinned((v) => !v)}>{drawerPinned ? "Unpin drawer" : "Pin drawer"}</SgButton>
      </div>
      <SgMenu menu={MENU} selection={{ activeId }} menuStyle="drawer" open={drawerOpen} onOpenChange={setDrawerOpen} pinned={drawerPinned} onPinnedChange={setDrawerPinned} showPinButton closeOnNavigate search={{ enabled: true, placeholder: "Search..." }} brand={{ title: "SeedGrid ERP" }} onNavigate={(node) => setActiveId(node.id)} />
    </>
  );
}
```


## SgTreeView

### basico

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/basico.tsx.sample`. Checkboxes controlados, busca e leitura via `SgTreeViewRef`.

```tsx
import React from "react";
import { BarChart3, FileText, Shield, Users } from "lucide-react";
import { SgCard, SgTreeView, type SgTreeNode, type SgTreeViewRef } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "root",
    label: "Admin",
    icon: <Shield className="h-4 w-4" />,
    children: [
      {
        id: "users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        children: [
          { id: "users.list", label: "List users", icon: <FileText className="h-4 w-4" /> },
          { id: "users.create", label: "Create user", icon: <FileText className="h-4 w-4" /> }
        ]
      },
      {
        id: "reports",
        label: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
          { id: "reports.sales", label: "Sales report", icon: <FileText className="h-4 w-4" /> },
          { id: "reports.financial", label: "Financial report", icon: <FileText className="h-4 w-4" /> }
        ]
      }
    ]
  }
];

export default function Example() {
  const [checkedIds, setCheckedIds] = React.useState<string[]>([]);
  const [readAll, setReadAll] = React.useState<string[]>([]);
  const [readLeafs, setReadLeafs] = React.useState<string[]>([]);
  const treeRef = React.useRef<SgTreeViewRef>(null);

  return (
    <>
      <SgCard title="Permissions">
        <SgTreeView
          ref={treeRef}
          nodes={nodes}
          searchable
          searchPlaceholder="Search..."
          checkable
          checkedIds={checkedIds}
          onCheckedChange={setCheckedIds}
          onLeafClick={(id) => console.log(id)}
          style={{ border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12, padding: 8 }}
        />
      </SgCard>

      <div className="mt-3 flex gap-2">
        <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => setReadAll(treeRef.current?.getCheckedIds() ?? [])}>
          Ler todos os checkeds
        </button>
        <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => setReadLeafs(treeRef.current?.getCheckedLeafIds() ?? [])}>
          Ler apenas leafs
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
        <div>checkedIds: {readAll.join(", ") || "-"}</div>
        <div>leafIds: {readLeafs.join(", ") || "-"}</div>
      </div>
    </>
  );
}
```

### confirm

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/confirm.tsx.sample`. `checkMode="confirm"` com `confirmBar`.

```tsx
import React from "react";
import { BarChart3, FileText, Shield, Users } from "lucide-react";
import { SgCard, SgTreeView, type SgTreeNode, type SgTreeViewRef } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "root",
    label: "Admin",
    icon: <Shield className="h-4 w-4" />,
    children: [
      {
        id: "users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        children: [
          { id: "users.list", label: "List users", icon: <FileText className="h-4 w-4" /> },
          { id: "users.create", label: "Create user", icon: <FileText className="h-4 w-4" /> }
        ]
      },
      {
        id: "reports",
        label: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        children: [
          { id: "reports.sales", label: "Sales report", icon: <FileText className="h-4 w-4" /> },
          { id: "reports.financial", label: "Financial report", icon: <FileText className="h-4 w-4" /> }
        ]
      }
    ]
  }
];

export default function Example() {
  const [confirmed, setConfirmed] = React.useState<string[]>([]);
  const treeRef = React.useRef<SgTreeViewRef>(null);

  return (
    <>
      <SgCard title="Confirm selection">
        <SgTreeView
          ref={treeRef}
          nodes={nodes}
          searchable
          searchPlaceholder="Search..."
          checkable
          checkMode="confirm"
          confirmSelection="leafOnly"
          confirmBar={{
            label: "Confirmar",
            showCancel: true,
            cancelLabel: "Limpar",
            onConfirm: (ids) => setConfirmed(ids),
            onCancel: () => treeRef.current?.clearChecked()
          }}
        />
      </SgCard>
      <div className="mt-3 text-xs text-muted-foreground">confirmIds: {confirmed.join(", ") || "-"}</div>
    </>
  );
}
```

### json-checked

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/json-checked.tsx.sample`. Montagem a partir de JSON com `sgTreeFromJsonWithChecked`.

```tsx
import React from "react";
import { SgTreeView, sgTreeFromJsonWithChecked } from "@seedgrid/fe-components";

const json = [
  {
    id: "root",
    label: "Admin",
    children: [
      {
        id: "users",
        label: "Users",
        children: [
          { id: "users.list", label: "List users", checked: true },
          { id: "users.create", label: "Create user" }
        ]
      },
      {
        id: "reports",
        label: "Reports",
        children: [
          { id: "reports.sales", label: "Sales report", checked: true },
          { id: "reports.financial", label: "Financial report" }
        ]
      }
    ]
  }
];

export default function Example() {
  const { nodes, checkedIds } = sgTreeFromJsonWithChecked(json);

  return (
    <SgTreeView
      nodes={nodes}
      checkable
      defaultCheckedIds={checkedIds}
      defaultExpandedIds={["root", "users"]}
    />
  );
}
```


## SgDockLayout + SgDockZone

### basico

Fonte: `apps/showcase/src/app/components/sg-dock-layout/samples/basico.tsx.sample`. Layout com quatro zonas e toolbars arrastáveis (estado persistido em `dock-layout:<id>`).

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { ClipboardList, Home, LayoutGrid, Search, Settings, Users } from "lucide-react";

export default function Example() {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border border-border bg-black">
      <SgDockLayout
        id="showcase-dock-basic-v9"
        className="grid h-full grid-cols-[8rem_1fr_8rem] grid-rows-[auto_1fr_auto]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)" }}
      >
        <SgDockZone
          zone="top"
          className="col-span-3 row-start-1 items-start border-b border-white/20"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
        >
          <SgToolBar id="tb-main-basic-v9" dockZone="top" orientationDirection="horizontal-left" title="Topo" draggable>
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para inicio" />
            <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar registros" />
          </SgToolBar>
          <SgToolBar id="tb-top-extra-basic-v9" dockZone="top" orientationDirection="horizontal-left" title="Acoes" draggable>
            <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
            <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Relatorio" hint="Abrir relatorios" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="left" className="col-start-1 row-start-2 items-start border-r border-white/20">
          <SgToolBar id="tb-left-basic-v9" dockZone="left" orientationDirection="vertical-down" title="Navegacao" collapsible draggable>
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Config" hint="Abrir configuracoes" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="right" className="col-start-3 row-start-2 items-start border-l border-white/20">
          <SgToolBar id="tb-right-basic-v9" dockZone="right" orientationDirection="vertical-down" title="Equipe" collapsible draggable>
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuarios" hint="Gerenciar usuarios" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Ajustes" hint="Abrir ajustes" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="bottom" className="col-span-3 row-start-3 items-end border-t border-white/20">
          <SgToolBar id="tb-bottom-a-basic-v9" dockZone="bottom" orientationDirection="horizontal-left" title="Rodape A" draggable>
            <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
            <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar no rodape" />
          </SgToolBar>
          <SgToolBar id="tb-bottom-b-basic-v9" dockZone="bottom" orientationDirection="horizontal-left" title="Rodape B" draggable>
            <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Tarefas" hint="Abrir tarefas" />
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Voltar ao inicio" />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```


## SgDockScreen

### basico

Fonte: `apps/showcase/src/app/components/sg-dock-screen/samples/basico.tsx.sample`. Mesma composição com a grade pronta do `SgDockScreen` (zonas sem `className`).

```tsx
import React from "react";
import { SgDockScreen, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { ClipboardList, Home, LayoutGrid, Search, Settings, Users } from "lucide-react";

export default function Example() {
  return (
    <SgDockScreen
      id="showcase-dock-screen-basic-v1"
      fullscreen={false}
      height={420}
      className="overflow-hidden rounded-xl border border-border bg-background"
    >
      <SgDockZone zone="top">
        <SgToolBar id="tb-top-dock-screen-v1" dockZone="top" orientationDirection="horizontal-left" title="Topo" draggable>
          <SgToolbarIconButton icon={<Home className="size-4" />} label="Inicio" hint="Ir para inicio" />
          <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar dados" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="bottom">
        <SgToolBar id="tb-bottom-dock-screen-v1" dockZone="bottom" orientationDirection="horizontal-left" title="Base" draggable>
          <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
          <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Relatorio" hint="Abrir relatorios" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="left">
        <SgToolBar id="tb-left-dock-screen-v1" dockZone="left" orientationDirection="vertical-down" title="Navegacao" collapsible draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
          <SgToolbarIconButton icon={<Settings className="size-4" />} label="Config" hint="Abrir configuracoes" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="right">
        <SgToolBar id="tb-right-dock-screen-v1" dockZone="right" orientationDirection="vertical-down" title="Equipe" collapsible draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuarios" hint="Gerenciar usuarios" />
          <SgToolbarIconButton icon={<Settings className="size-4" />} label="Ajustes" hint="Abrir ajustes" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="free">
        <div className="pointer-events-none text-sm text-muted-foreground">Area central livre</div>
      </SgDockZone>
    </SgDockScreen>
  );
}
```


## SgToolBar + SgToolbarIconButton

### basico

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/basico.tsx.sample`. Toolbar vertical numa zona `free`, botões com `hint` e `severity`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Home, Settings, Users } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full">
      <SgDockLayout id="tb-layout-basic" className="grid grid-cols-1 grid-rows-1">
        <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
          <SgToolBar id="tb-basic" title="Navegacao" orientationDirection="vertical-down">
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para Home" severity="primary" className="ring-1 ring-primary/30" style={{ minWidth: 132 }} />
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuarios" hint="Abrir lista de usuarios" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Configuracoes" hint="Abrir configuracoes" />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```

### onclick-assincrono-com-toast

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/onclick-assincrono-com-toast.tsx.sample`. `onClick` assíncrono: o botão entra em loading até a Promise resolver.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton, toast } from "@seedgrid/fe-components";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full">
      <SgDockLayout id="tb-layout-async" className="grid grid-cols-1 grid-rows-1">
        <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
          <SgToolBar id="tb-async" title="Acoes rapidas" orientationDirection="horizontal-left" collapsible>
            <SgToolbarIconButton
              icon={<Plus className="size-4" />}
              label="Criar"
              hint="Criar novo registro"
              severity="success"
              onClick={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                toast.success("Acao Criar concluida");
              }}
            />
            <SgToolbarIconButton
              icon={<Pencil className="size-4" />}
              label="Editar"
              hint="Editar registro selecionado"
              severity="info"
              onClick={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                toast.info("Acao Editar concluida");
              }}
            />
            <SgToolbarIconButton
              icon={<Trash2 className="size-4" />}
              label="Excluir"
              hint="Excluir registro selecionado"
              severity="danger"
              onClick={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                toast.warning("Acao Excluir concluida");
              }}
            />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```
