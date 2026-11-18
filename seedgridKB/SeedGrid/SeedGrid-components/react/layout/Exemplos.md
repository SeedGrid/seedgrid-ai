---
tags: [seedgrid, front, component, layout]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components; front/seedgrid-fe-components/packages/seedgrid-fe-components/src/layout
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Layout e containers, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — layout — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos|Exemplos — Layout e containers (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

API: [[SeedGrid/SeedGrid-components/layout/API|Layout — API]] · Visão geral: [[SeedGrid/SeedGrid-components/layout/Visao-geral|Layout — visão geral]]

Todos os exemplos do showcase de cada componente, na ordem e com os títulos do showcase (título em pt-BR, como vem do dicionário de i18n). Cada bloco é cópia 1:1 do arquivo `samples/*.tsx.sample` correspondente, em `apps/showcase/src/app/components/<componente>/samples/` do seedgrid-fe-components `0f304bb`, comparada texto a texto por script em 2026-11-09 (idêntico). Quando o `.sample` é um trecho sem `import`/`export` (como os do `SgCarousel`), a linha "Fonte" avisa e o bloco é o trecho do showcase, sem completar. Os blocos não foram compilados nesta conferência; classes Tailwind e ícones `lucide-react` vêm do showcase (`lucide-react` é peer dependency do pacote).

## SgStack

### 1) Coluna + Linha

Exemplos de layout comuns com stack.

Fonte: `apps/showcase/src/app/components/sg-stack/samples/column-row.tsx.sample`.

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

### 2) Quebra de linha

wrap: true quebra os filhos em várias linhas; o gap vale nos dois eixos.

Fonte: `apps/showcase/src/app/components/sg-stack/samples/quebra-de-linha.tsx.sample`.

```tsx
"use client";

import React from "react";
import { SgBadge, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack direction="row" wrap gap={8}>
      {["Dart", "Flutter", "React", "Java", "Rust", "Quarkus", "TypeScript"].map((nome) => (
        <SgBadge key={nome} value={nome} />
      ))}
    </SgStack>
  );
}
```

### 3) grow dentro de uma linha

grow faz o SgStack ocupar o espaço restante de um pai flex.

Fonte: `apps/showcase/src/app/components/sg-stack/samples/grow-em-linha.tsx.sample`.

```tsx
"use client";

import React from "react";
import { SgButton, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack direction="row" align="center">
      <SgStack grow>
        <p>Este bloco cresce e empurra o botão para a direita.</p>
      </SgStack>
      <SgButton>OK</SgButton>
    </SgStack>
  );
}
```

## SgGrid

### 1) Colunas responsivas

`columns` com breakpoints e `span` por item.

Fonte: `apps/showcase/src/app/components/sg-grid/samples/columns-responsivo.tsx.sample`.

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

### 2) Auto-Fit + RowSpan

Grid fluido com `minItemWidth`, `dense` e `rowHeight`.

Fonte: `apps/showcase/src/app/components/sg-grid/samples/auto-fit-rowspan.tsx.sample`.

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

### 3) Colunas fixas

columns={3} divide a largura em três colunas iguais; gap separa as células.

Fonte: `apps/showcase/src/app/components/sg-grid/samples/colunas-fixas.tsx.sample`.

```tsx
import { SgGrid, SgPanel } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={3} gap={8}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SgPanel key={i} padding={12} className="rounded-lg">
          <p className="text-sm">Célula {i}</p>
        </SgPanel>
      ))}
    </SgGrid>
  );
}
```

### 4) rowHeight, align e dense

rowHeight fixa as linhas; align posiciona o item na célula; dense preenche buracos.

Fonte: `apps/showcase/src/app/components/sg-grid/samples/linhas-align-dense.tsx.sample`.

```tsx
import { SgGrid, SgPanel } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={3} rowHeight={56} gap={8} dense align="center">
      <SgPanel span={2} padding={12} className="rounded-lg">
        <p className="text-sm">largo</p>
      </SgPanel>
      <SgPanel span={2} padding={12} className="rounded-lg">
        <p className="text-sm">largo</p>
      </SgPanel>
      <p className="text-sm">preenche o buraco</p>
    </SgGrid>
  );
}
```

## SgPanel

### 1) Dock básico em SgPanel

`align` faz dock em relação ao pai e `width`/`height` em número viram porcentagem.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/align-width-height.tsx.sample`.

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

### 2) Composição dentro de SgScreen

Este bloco reproduz o exemplo do `teste/page.tsx`, agora dentro do showcase oficial do componente.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/dock-screen-composition.tsx.sample`.

```tsx
"use client";

import React from "react";
import { SgButton, SgPanel, SgScreen } from "@seedgrid/fe-components";

export default function ExampleSgPanelDockScreenComposition() {
  return (
    <SgPanel className="h-[420px] rounded-xl bg-muted/30" padding={12}>
      <SgScreen fullscreen={false} className="rounded-lg bg-background">
        <SgPanel align="top" height={5} contentPadding={8} minHeightPx={100}>
          <SgPanel
            align="right"
            contentDirection="row"
            contentPadding={8}
            contentAlign="center"
          >
            <SgButton label="TESTE" />
            <SgButton label="TESTE" />
            <SgButton label="TESTE" />
          </SgPanel>
        </SgPanel>

        <SgPanel align="left" width={10} contentPadding={8}>
          <SgButton label="TESTE" />
          <SgButton label="TESTE" />
          <SgButton label="TESTE" />
        </SgPanel>

        <SgPanel align="client" contentPadding={12}>
          client
        </SgPanel>

        <SgPanel align="bottom" height={5} contentPadding={8} minHeightPx={100}>
          <SgPanel align="left" contentDirection="row" contentPadding={8}>
            <SgButton label="TESTE" />
            <SgButton label="TESTE" />
            <SgButton label="TESTE" />
          </SgPanel>
        </SgPanel>
      </SgScreen>
    </SgPanel>
  );
}
```

### 3) span + rowSpan

`span` e `rowSpan` continuam valendo apenas dentro do `SgGrid`.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/span-rowspan.tsx.sample`.

```tsx
import React from "react";
import { SgGrid, SgPanel } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 4 }} gap={8} rowHeight={90} dense>
      <SgPanel padding={10} className="rounded-md">Item 1</SgPanel>
      <SgPanel span={2} padding={10} className="rounded-md">span=2</SgPanel>
      <SgPanel rowSpan={2} padding={10} className="rounded-md">rowSpan=2</SgPanel>
      <SgPanel padding={10} className="rounded-md">Item 4</SgPanel>
      <SgPanel padding={10} className="rounded-md">Item 5</SgPanel>
      <SgPanel span={2} rowSpan={2} padding={10} className="rounded-md">span=2 + rowSpan=2</SgPanel>
    </SgGrid>
  );
}
```

### 4) borderStyle + padding + contentPadding

Diferença entre espaçamento externo do panel e espaçamento interno do conteúdo.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/borderstyle-padding-children.tsx.sample`.

```tsx
import React from "react";
import { SgGrid, SgPanel } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={4}>
      <SgPanel borderStyle="none" padding={12} className="rounded-lg bg-muted/50">children + borderStyle="none"</SgPanel>
      <SgPanel borderStyle="solid" padding={12} className="rounded-lg">children + borderStyle="solid"</SgPanel>
      <SgPanel borderStyle="dashed" padding={12} className="rounded-lg">children + borderStyle="dashed"</SgPanel>
    </SgGrid>
  );
}
```

### 5) scrollable + scrollbarGutter

Scroll explícito apenas quando necessário.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/scrollable-scrollbargutter.tsx.sample`.

```tsx
import React from "react";
import { SgGrid, SgPanel, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={4}>
      <SgPanel scrollable padding={10} className="h-48 rounded-lg">
        <SgStack gap={6}>
          {Array.from({ length: 10 }).map((_, i) => <SgPanel key={i} borderStyle="solid" className="rounded bg-muted/30" padding={8}>scrollable=true - linha {i + 1}</SgPanel>)}
        </SgStack>
      </SgPanel>
      <SgPanel scrollable="auto" padding={10} className="h-48 rounded-lg">
        <SgStack gap={6}>
          {Array.from({ length: 10 }).map((_, i) => <SgPanel key={i} borderStyle="solid" className="rounded bg-muted/30" padding={8}>scrollable="auto" - linha {i + 1}</SgPanel>)}
        </SgStack>
      </SgPanel>
      <SgPanel scrollable="y" padding={10} className="h-48 rounded-lg">
        <SgStack gap={6}>
          {Array.from({ length: 15 }).map((_, i) => <SgPanel key={i} borderStyle="solid" className="rounded bg-muted/30" padding={8}>Item vertical {i + 1}</SgPanel>)}
        </SgStack>
      </SgPanel>
      <SgPanel scrollable="x" scrollbarGutter padding={10} className="h-48 rounded-lg">
        <SgStack direction="row" gap={8} className="w-[960px]">
          {Array.from({ length: 12 }).map((_, i) => <SgPanel key={i} borderStyle="solid" className="h-24 w-24 rounded bg-muted/30"><SgStack className="h-full" justify="center" align="center">Box {i + 1}</SgStack></SgPanel>)}
        </SgStack>
      </SgPanel>
    </SgGrid>
  );
}
```

### 6) Exemplo combinado

Exemplo único misturando dock, mínimos em pixel e grid.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/combined-example.tsx.sample`.

```tsx
import React from "react";
import { SgGrid, SgPanel, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack gap={10}>
      <SgPanel className="h-[260px] rounded-xl bg-muted/30" padding={10}>
        <SgPanel className="h-full rounded-lg bg-background p-3" contentGap={8}>
          <SgPanel align="top" height={10} borderStyle="solid" padding={12}>header</SgPanel>
          <SgPanel align="left" width={18} borderStyle="dashed" padding={8} scrollable="y">menu</SgPanel>
          <SgPanel align="client" borderStyle="none" padding={10} scrollable="auto" scrollbarGutter>conteudo</SgPanel>
        </SgPanel>
      </SgPanel>
      <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
        <SgPanel span={2}>span=2</SgPanel>
        <SgPanel rowSpan={2}>rowSpan=2</SgPanel>
      </SgGrid>
    </SgStack>
  );
}
```

### 7) Conteúdo em linha

contentDirection, contentGap, contentJustify, contentAlign e contentWrap organizam os filhos soltos.

Fonte: `apps/showcase/src/app/components/sg-panel/samples/conteudo-em-linha.tsx.sample`.

```tsx
"use client";

import { SgButton, SgPanel } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgPanel
      borderStyle="solid"
      contentPadding={8}
      contentDirection="row"
      contentJustify="between"
      contentAlign="center"
    >
      <span>Início</span>
      <SgButton label="Ação" size="sm" />
      <span>Fim</span>
    </SgPanel>
  );
}
```

## SgScreen

### 1) Exemplo completo

Uso com fullscreen=false em área controlada, incluindo layout top/left/right/bottom/client.

Fonte: `apps/showcase/src/app/components/sg-screen/samples/complete-example.tsx.sample`.

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

### 2) Tela com docking

Os filhos SgPanel com align formam cabeçalho, menu lateral e área principal.

Fonte: `apps/showcase/src/app/components/sg-screen/samples/docking.tsx.sample`.

```tsx
"use client";

import { SgPanel, SgScreen } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgScreen fullscreen={false} height={240} padding={8}>
      <SgPanel className="h-full w-full" contentPadding={8} contentGap={8}>
        <SgPanel align="top" height={20} borderStyle="solid">Cabeçalho</SgPanel>
        <SgPanel align="left" width={25} borderStyle="solid">Menu</SgPanel>
        <SgPanel align="client" borderStyle="solid">Conteúdo</SgPanel>
      </SgPanel>
    </SgScreen>
  );
}
```

### 3) Sem tela cheia

fullscreen: false não fixa largura nem altura: o SgScreen tem o tamanho do conteúdo.

Fonte: `apps/showcase/src/app/components/sg-screen/samples/livre.tsx.sample`.

```tsx
"use client";

import { SgScreen } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgScreen fullscreen={false} padding={12}>
      <span>Altura do conteúdo</span>
      <span>Segunda linha</span>
    </SgScreen>
  );
}
```

### 4) width e height

width e height aceitam número (px), "Npx" ou porcentagem e vencem o fullscreen.

Fonte: `apps/showcase/src/app/components/sg-screen/samples/tamanho.tsx.sample`.

```tsx
"use client";

import { SgScreen } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgScreen width="60%" height={120} padding={12}>
      <span>60% da largura, 120 de altura</span>
    </SgScreen>
  );
}
```

## SgGroupBox

### 1) Básico

Uso simples do GroupBox.

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/basico.tsx.sample`.

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

### 2) Formulário

Exemplo com inputs reais dentro do GroupBox.

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/formulario.tsx.sample`.

```tsx
import React from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  SgGroupBox,
  SgInputPostalCode,
  SgInputEmail,
  SgInputPassword,
  SgInputPhone,
  SgInputText,
} from "@seedgrid/fe-components";

export default function Example() {
  const { control, handleSubmit, watch } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cep: "",
      password: ""
    }
  });
  const values = watch();
  const onSubmit = (data: FieldValues) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SgGroupBox title="Formulário">
        <div className="grid gap-4 sm:grid-cols-2">
          <SgInputText id="name" name="name" control={control} label="Nome completo" required />
          <SgInputEmail id="email" name="email" control={control} label="Email" required />
          <SgInputPhone id="phone" name="phone" control={control} label="Telefone" required />
          <SgInputPostalCode id="cep" name="cep" control={control} label="CEP" required />
          <div className="sm:col-span-2">
            <SgInputPassword id="password" name="password" control={control} label="Senha" required />
          </div>
        </div>
      </SgGroupBox>
      <p>Valores: {JSON.stringify(values)}</p>
    </form>
  );
}
```

### 3) Tamanho

Largura e altura customizáveis.

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/tamanho.tsx.sample`.

```tsx
import { SgGroupBox } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgGroupBox title="Width 320" width={320}>
        <div>Conteúdo</div>
      </SgGroupBox>

      <SgGroupBox title="Height 180" height={180}>
        <div>Conteúdo</div>
      </SgGroupBox>
    </>
  );
}
```

### 4) Classe customizada

Use className para ajustar layout externo.

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/class-name.tsx.sample`.

```tsx
import { SgGroupBox } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGroupBox title="className" className="bg-foreground/5 p-2 rounded-xl">
      <div>Conteúdo</div>
    </SgGroupBox>
  );
}
```

### 5) Várias caixas lado a lado

Use o SgGrid para dispor várias caixas lado a lado.

Fonte: `apps/showcase/src/app/components/sg-group-box/samples/lado-a-lado.tsx.sample`.

```tsx
import { SgGrid, SgGroupBox } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid minItemWidth={200} gap={12}>
      <SgGroupBox title="Entrega">
        <p className="text-sm">Rua das Flores, 100</p>
      </SgGroupBox>
      <SgGroupBox title="Cobrança">
        <p className="text-sm">Mesmo endereço</p>
      </SgGroupBox>
    </SgGrid>
  );
}
```

## SgCard

### 1) Básico

Título, descrição, conteúdo e rodapé.

Fonte: `apps/showcase/src/app/components/sg-card/samples/basico.tsx.sample`.

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

### 2) Leading e trailing

leading e trailing ladeiam o título; actions fica à direita do cabeçalho.

Fonte: `apps/showcase/src/app/components/sg-card/samples/leading-e-trailing.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgCard } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCard
      leading={<div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">SG</div>}
      trailing={<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">ativo</span>}
      title="Conta enterprise"
      description="Resumo de performance e uso"
      actions={<SgButton appearance="ghost" size="sm">Acao</SgButton>}
      footer={
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Expira em 12 dias</span>
          <span className="text-emerald-600">+12%</span>
        </div>
      }
    >
      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Receita</span>
          <span className="font-semibold">R$ 128.400</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Crescimento</span>
          <span className="font-semibold">+12%</span>
        </div>
      </div>
    </SgCard>
  );
}
```

### 3) Recolhível

collapsible com o botão à direita; defaultOpen escolhe se começa aberto ou recolhido. Clique no cabeçalho ou no botão.

Fonte: `apps/showcase/src/app/components/sg-card/samples/colapsavel.tsx.sample`.

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

### 4) Variantes e tamanhos

default, elevated, outlined e flat, em tamanhos sm e lg.

Fonte: `apps/showcase/src/app/components/sg-card/samples/variantes.tsx.sample`.

```tsx
import React from "react";
import { SgCard } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SgCard cardStyle="default" title="Default" size="sm"><div className="text-sm text-muted-foreground">size sm</div></SgCard>
      <SgCard cardStyle="elevated" title="Elevated" size="sm"><div className="text-sm text-muted-foreground">size sm</div></SgCard>
      <SgCard cardStyle="outlined" title="Outlined" size="lg"><div className="text-sm text-muted-foreground">size lg</div></SgCard>
      <SgCard cardStyle="flat" title="Flat" size="lg"><div className="text-sm text-muted-foreground">size lg</div></SgCard>
    </div>
  );
}
```

### 5) Cores das áreas

Cabeçalho, corpo e rodapé podem ter fundos independentes.

Fonte: `apps/showcase/src/app/components/sg-card/samples/surface-colors.tsx.sample`.

```tsx
import React from "react";
import { SgCard } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCard
      title="Áreas com fundo próprio"
      description="Cabeçalho e rodapé com cores independentes."
      bgColor="#f8fafc"
      bgColorTitle="#dbeafe"
      bgColorFooter="#e2e8f0"
      footer={
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Atualizado agora</span>
          <span>Área do rodapé</span>
        </div>
      }
    >
      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Receita</span>
          <span className="font-semibold">R$ 24.980</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Pedidos</span>
          <span className="font-semibold">162</span>
        </div>
      </div>
    </SgCard>
  );
}
```

### 6) Arrastável com persistência

Arraste pelo cabeçalho; a posição é lembrada (dragPersistKey) e avisada em onPositionChange.

Fonte: `apps/showcase/src/app/components/sg-card/samples/draggable-persistence.tsx.sample`.

```tsx
import React from "react";
import { SgCard, SgEnvironmentProvider } from "@seedgrid/fe-components";

export default function Example() {
  const [dragPos, setDragPos] = React.useState({ x: 16, y: 16 });

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
          title="Arraste-me pelo cabeçalho"
          onPositionChange={(position) => setDragPos(position)}
          description={`x: ${Math.round(dragPos.x)}  y: ${Math.round(dragPos.y)}`}
          collapsible
          collapseToggleAlign="right"
          collapseIconSize={20}
          bgColor="#ffffff"
          footer={<div className="text-xs text-muted-foreground">Posição persistida.</div>}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-emerald-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Região</span>
              <span className="font-semibold">São Paulo</span>
            </div>
          </div>
        </SgCard>
      </div>
    </SgEnvironmentProvider>
  );
}
```

### 7) Tamanhos e clique

Cada tamanho como cartão clicável; o clique é contado.

Fonte: `apps/showcase/src/app/components/sg-card/samples/tamanhos.tsx.sample`.

```tsx
import React from "react";
import { SgCard } from "@seedgrid/fe-components";

export default function Example() {
  const [clicks, setClicks] = React.useState(0);

  return (
    <div className="grid gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SgCard
          key={size}
          size={size}
          clickable
          onClick={() => setClicks((prev) => prev + 1)}
          title={`Tamanho ${size} (cliques: ${clicks})`}
        >
          <div className="text-sm text-muted-foreground">Cartão clicável</div>
        </SgCard>
      ))}
    </div>
  );
}
```

## SgAccordion

### 1) Básico vertical (único)

Comportamento padrão em coluna, abrindo um painel por vez.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/basico-vertical-single.tsx.sample`.

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

### 2) Vários abertos + recolhível

Abra vários painéis ao mesmo tempo e controle o estado ativo externamente.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/multiple-collapsible.tsx.sample`.

```tsx
import * as React from "react";
import { SgAccordion, SgButton, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "personal", title: "Dados pessoais", content: <p className="text-sm">Conteudo 1</p> },
  { id: "address", title: "Endereco", content: <p className="text-sm">Conteudo 2</p> },
  { id: "billing", title: "Faturamento", content: <p className="text-sm">Conteudo 3</p> }
];

export default function Example() {
  const [open, setOpen] = React.useState<number[]>([0, 2]);

  return (
    <div className="space-y-3">
      <SgAccordion items={items} multiple collapsible activeIndex={open} onActiveIndexChange={setOpen} />
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setOpen([0])}>Apenas 1</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setOpen([1, 2])}>2 e 3</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setOpen([0, 1, 2])}>Todos</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setOpen([])}>None</SgButton>
      </div>
    </div>
  );
}
```

### 3) Horizontal

Cabeçalhos em trilho lateral e conteúdo expandindo horizontalmente.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/horizontal.tsx.sample`.

```tsx
import * as React from "react";
import { SgAccordion, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "overview", title: "Visao geral", content: <p className="text-sm">Indicadores principais.</p> },
  { id: "security", title: "Seguranca", content: <p className="text-sm">MFA e politicas.</p> },
  { id: "integrations", title: "Integracoes", content: <p className="text-sm">APIs e webhooks.</p> }
];

export default function Example() {
  return <SgAccordion items={items} orientation="horizontal" defaultActiveIndex={1} horizontalHeaderWidth={56} horizontalMinHeight={220} />;
}
```

### 4) Controlado por estado

Use activeIndex/onActiveIndexChange para abrir/fechar via botoes externos.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/controlado-por-estado.tsx.sample`.

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

### 5) Itens personalizados + fundo do cabeçalho

O fundo do título usa primary-50 por padrão e pode ser customizado globalmente ou por item.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/custom-items-header-background.tsx.sample`.

```tsx
import * as React from "react";
import { Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { SgAccordion, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  {
    id: "mail",
    title: "Email",
    icon: <Mail size={14} />,
    end: <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">novo</span>,
    headerBackgroundColor: "rgb(var(--sg-info-100, 224 242 254))",
    content: <p className="text-sm">Configuracoes de SMTP, remetente padrao e templates.</p>
  },
  {
    id: "lock",
    title: "Permissoes",
    icon: <ShieldCheck size={14} />,
    content: <p className="text-sm">Controle de perfis, papeis e trilhas de auditoria.</p>
  },
  {
    id: "blocked",
    title: "Modulo indisponivel",
    icon: <TriangleAlert size={14} />,
    enabled: false,
    content: <p className="text-sm">Conteudo bloqueado.</p>
  }
];

export default function Example() {
  return <SgAccordion items={items} defaultActiveIndex={0} headerBackgroundColor="rgb(var(--sg-primary-50, 239 246 255))" />;
}
```

### 6) Exemplo de personalização de cores

Personalize a cor global do cabeçalho e veja o override por item no último painel.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/color-customization-example.tsx.sample`.

```tsx
import * as React from "react";
import { SgAccordion, type SgAccordionItem } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "general", title: "Geral", content: <p className="text-sm">Configuracoes gerais do modulo.</p> },
  { id: "security", title: "Seguranca", content: <p className="text-sm">Politicas e regras de acesso.</p> },
  { id: "billing", title: "Faturamento (override por item)", headerBackgroundColor: "rgb(var(--sg-warning-100, 254 249 195))", content: <p className="text-sm">Este item ignora a cor global do header.</p> }
];

export default function Example() {
  const [headerColor, setHeaderColor] = React.useState("rgb(var(--sg-primary-50, 239 246 255))");

  return (
    <div className="space-y-3">
      <input value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} className="w-full rounded border border-border px-3 py-2 text-sm" />
      <SgAccordion items={items} defaultActiveIndex={0} headerBackgroundColor={headerColor} />
    </div>
  );
}
```

### 7) Sempre um aberto (collapsible: false)

Com collapsible: false, o painel aberto não pode ser recolhido; sempre resta um aberto.

Fonte: `apps/showcase/src/app/components/sg-accordion/samples/sempre-um-aberto.tsx.sample`.

```tsx
"use client";

import * as React from "react";
import { SgAccordion } from "@seedgrid/fe-components";

const items: SgAccordionItem[] = [
  { id: "personal", title: "Dados pessoais", content: <p className="text-sm">Conteudo 1</p> },
  { id: "address", title: "Endereco", content: <p className="text-sm">Conteudo 2</p> },
  { id: "billing", title: "Faturamento", content: <p className="text-sm">Conteudo 3</p> }
];

export default function Example() {
  return <SgAccordion items={items} collapsible={false} />;
}
```

## SgPageControl

### 1) Básico

Cada página define icon e title no SgPageControlPage.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/basico.tsx.sample`.

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

### 2) Controle Externo

Use activePageId + onActivePageIdChange para setar a aba ativa.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/controle-externo.tsx.sample`.

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

### 3) Ocultar Página Externamente

hiddenPageIds permite esconder tabs sem apagar a declaração.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/ocultar-pagina-externamente.tsx.sample`.

```tsx
import React from "react";
import { Receipt, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  const [activePageId, setActivePageId] = React.useState("registration");
  const [hiddenPageIds] = React.useState<string[]>(["integrations"]);

  return (
    <SgPageControl
      activePageId={activePageId}
      onActivePageIdChange={(pageId) => setActivePageId(pageId)}
      hiddenPageIds={hiddenPageIds}
      keepMounted
    >
      <SgPageControlPage id="registration" title="Registration" icon={<UserRound className="size-4" />}>Registration content</SgPageControlPage>
      <SgPageControlPage id="fiscal" title="Fiscal" icon={<Receipt className="size-4" />}>Fiscal content</SgPageControlPage>
      <SgPageControlPage id="access" title="Access" icon={<ShieldCheck className="size-4" />}>Access content</SgPageControlPage>
      <SgPageControlPage id="integrations" title="Integrations" icon={<Wrench className="size-4" />}>Integrations content</SgPageControlPage>
    </SgPageControl>
  );
}
```

### 4) Com Hint nas Abas

Passe o mouse sobre a aba para ver o hint.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/com-hint-nas-abas.tsx.sample`.

```tsx
import React from "react";
import { Receipt, ShieldCheck, UserRound } from "lucide-react";
import { SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgPageControl defaultActivePageId="registration">
      <SgPageControlPage
        id="registration"
        title="Registration"
        hint="Create and edit registration data."
        icon={<UserRound className="size-4" />}
      >
        Registration content
      </SgPageControlPage>
      <SgPageControlPage
        id="fiscal"
        title="Fiscal"
        hint="Review tax and fiscal settings."
        icon={<Receipt className="size-4" />}
      >
        Fiscal content
      </SgPageControlPage>
      <SgPageControlPage
        id="access"
        title="Access"
        hint="Manage users, roles and permissions."
        icon={<ShieldCheck className="size-4" />}
      >
        Access content
      </SgPageControlPage>
    </SgPageControl>
  );
}
```

### 5) Responsividade

Desktop e tablet mantêm as abas na mesma linha; no celular a lista rola na horizontal e a aba ativa entra em cena sozinha. mobilePageControl="select" troca as abas por um select nativo abaixo de 768px.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/responsividade.tsx.sample`.

```tsx
import React from "react";
import { Boxes, FolderKanban, Receipt, ShieldCheck, Truck, UserRound, Wrench } from "lucide-react";
import { SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-6">
      {/* Larguras iguais a partir do tablet. No celular as abas mantem a largura
          natural e a lista rola — abas iguais numa tela estreita espremem os rotulos. */}
      <SgPageControl fullWidthTabs>
        <SgPageControlPage id="registration" title="Registration" icon={<UserRound className="size-4" />}>
          Registration content
        </SgPageControlPage>
        <SgPageControlPage id="fiscal" title="Fiscal" icon={<Receipt className="size-4" />}>
          Fiscal content
        </SgPageControlPage>
        <SgPageControlPage id="access" title="Access" icon={<ShieldCheck className="size-4" />}>
          Access content
        </SgPageControlPage>
        <SgPageControlPage id="products" title="Products" icon={<Boxes className="size-4" />}>
          Products content
        </SgPageControlPage>
        <SgPageControlPage id="shipping" title="Shipping" icon={<Truck className="size-4" />}>
          Shipping content
        </SgPageControlPage>
        <SgPageControlPage id="integrations" title="Integrations" icon={<FolderKanban className="size-4" />}>
          Integrations content
        </SgPageControlPage>
        <SgPageControlPage id="preferences" title="Preferences" icon={<Wrench className="size-4" />}>
          Preferences content
        </SgPageControlPage>
      </SgPageControl>

      {/* Alternativa do celular: abaixo de 768px as abas viram um select nativo.
          Tablet e desktop continuam com as abas. */}
      <SgPageControl mobilePageControl="select">
        <SgPageControlPage id="registration" title="Registration" icon={<UserRound className="size-4" />}>
          Registration content
        </SgPageControlPage>
        <SgPageControlPage id="fiscal" title="Fiscal" icon={<Receipt className="size-4" />}>
          Fiscal content
        </SgPageControlPage>
        <SgPageControlPage id="access" title="Access" icon={<ShieldCheck className="size-4" />}>
          Access content
        </SgPageControlPage>
        <SgPageControlPage id="products" title="Products" icon={<Boxes className="size-4" />}>
          Products content
        </SgPageControlPage>
        <SgPageControlPage id="shipping" title="Shipping" icon={<Truck className="size-4" />}>
          Shipping content
        </SgPageControlPage>
        <SgPageControlPage id="integrations" title="Integrations" icon={<FolderKanban className="size-4" />}>
          Integrations content
        </SgPageControlPage>
        <SgPageControlPage id="preferences" title="Preferences" icon={<Wrench className="size-4" />}>
          Preferences content
        </SgPageControlPage>
      </SgPageControl>
    </div>
  );
}
```

### 6) Tamanho e aba desabilitada

size controla a densidade das abas; enabled: false bloqueia uma página, que continua visível mas não pode ser aberta.

Fonte: `apps/showcase/src/app/components/sg-page-control/samples/tamanho-e-aba-desabilitada.tsx.sample`.

```tsx
import { SgPageControl, SgPageControlPage } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgPageControl size="sm" defaultActivePageId="registration">
      <SgPageControlPage id="registration" title="Registration">
        Registration content
      </SgPageControlPage>
      <SgPageControlPage id="fiscal" title="Fiscal">
        Fiscal content
      </SgPageControlPage>
      <SgPageControlPage id="access" title="Access" enabled={false}>
        Access content
      </SgPageControlPage>
    </SgPageControl>
  );
}
```

## SgExpandablePanel

### 1) Inline Controlado + Resize

Demonstra open/onOpenChange, size, resizable e onSizeChange.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/inline-controlado-resize.tsx.sample`.

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
          <h3 className="text-base font-semibold">Área principal</h3>
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
          footer={<div className="text-xs text-muted-foreground">Rodapé inline</div>}
        >
          <div className="space-y-3 text-sm">
            <p>Conteúdo do inspector.</p>
            <p>Props: open, onOpenChange, size, resizable, onSizeChange.</p>
          </div>
        </SgExpandablePanel>
      </div>
    </div>
  );
}
```

### 2) Overlay + Comportamento

Demonstra placement, closeOnEsc, closeOnOutsideClick, trapFocus, showBackdrop e handle.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/overlay-comportamento.tsx.sample`.

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

### 3) defaultOpen + Estilização

Demonstra defaultOpen, elevation, border, rounded, classes por área e style.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/default-open-estilizacao.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [panelKey, setPanelKey] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          size="sm"
          appearance="outline"
          onClick={() => {
            setIsOpen(true);
            setPanelKey((v) => v + 1);
          }}
        >
          Remontar defaultOpen
        </SgButton>
        <span className="text-xs text-muted-foreground">Estado reportado: {isOpen ? "aberto" : "fechado"}</span>
      </div>

      <SgExpandablePanel
        key={panelKey}
        mode="inline"
        expandTo="bottom"
        defaultOpen
        onOpenChange={setIsOpen}
        size={{ default: 160, min: 100, max: 240 }}
        animation={{ type: "slide", durationMs: 220 }}
        elevation="lg"
        border={false}
        rounded="xl"
        className="bg-slate-900 text-slate-100"
        contentClassName="ring-1 ring-white/20"
        headerClassName="border-b border-slate-700 bg-slate-800/80"
        bodyClassName="bg-slate-900/90"
        footerClassName="border-t border-slate-700 bg-slate-800/60"
        style={{ boxShadow: "0 20px 60px rgba(15, 23, 42, 0.5)" }}
        header={<div className="font-medium">Painel estilizado</div>}
        footer={<div className="text-xs text-slate-300">Rodapé do painel estilizado.</div>}
      >
        <div className="space-y-2 text-sm text-slate-100">
          <p>Props visuais: elevation, border, rounded, classes e style.</p>
          <p>Prop de estado: defaultOpen.</p>
        </div>
      </SgExpandablePanel>
    </>
  );
}
```

### 4) Acessibilidade + Fade

Demonstra role, ariaLabel, overlayClassName, animation fade e closeOnOutsideClick=false.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/acessibilidade-fade.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => setOpen(true)}>Abrir painel com fade</SgButton>
      </div>

      <SgExpandablePanel
        mode="overlay"
        expandTo="top"
        placement="center"
        open={open}
        onOpenChange={setOpen}
        role="dialog"
        ariaLabel="Painel de notificações"
        overlayClassName="bg-black/70"
        animation={{ type: "fade", durationMs: 260 }}
        closeOnOutsideClick={false}
        trapFocus
        size={{ default: 280, min: 180, max: 420 }}
        header={<div className="font-medium">Notificações</div>}
        footer={
          <div className="flex justify-end">
            <SgButton size="sm" onClick={() => setOpen(false)}>Fechar</SgButton>
          </div>
        }
      >
        <div className="text-sm">Props: role, ariaLabel, overlayClassName, animation fade e closeOnOutsideClick=false.</div>
      </SgExpandablePanel>
    </>
  );
}
```

### 5) Sem Backdrop + Animation none

Demonstra showBackdrop=false, closeOnOutsideClick=false, closeOnEsc e animation none.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/sem-backdrop-animation-none.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <SgButton appearance="outline" onClick={() => setOpen(true)}>Abrir sem backdrop</SgButton>
      </div>

      <SgExpandablePanel
        mode="overlay"
        expandTo="bottom"
        open={open}
        onOpenChange={setOpen}
        showBackdrop={false}
        closeOnOutsideClick={false}
        closeOnEsc
        animation={{ type: "none", durationMs: 0 }}
        size={{ default: 220, min: 160, max: 360 }}
        header={<div className="font-medium">Sem backdrop</div>}
        footer={
          <div className="flex justify-end">
            <SgButton size="sm" onClick={() => setOpen(false)}>Fechar</SgButton>
          </div>
        }
      >
        <div className="text-sm">Props: showBackdrop=false e animation type none.</div>
      </SgExpandablePanel>
    </>
  );
}
```

### 6) Redimensionável na altura

Com expandTo bottom a borda de baixo muda a altura (min 60, max 260). Arraste a borda e acompanhe o valor.

Fonte: `apps/showcase/src/app/components/sg-expandable-panel/samples/redimensionavel-altura.tsx.sample`.

```tsx
import React from "react";
import { SgExpandablePanel } from "@seedgrid/fe-components";

export default function Example() {
  const [size, setSize] = React.useState<number | string>(200);

  return (
    <div className="flex h-[300px] flex-col overflow-hidden rounded-lg border border-border">
      <p className="p-2 text-xs text-muted-foreground">Altura atual: {String(size)}px</p>
      <SgExpandablePanel
        mode="inline"
        expandTo="bottom"
        defaultOpen
        resizable
        size={{ default: 200, min: 60, max: 260 }}
        onSizeChange={setSize}
      >
        <div className="text-sm">Arraste a borda de baixo</div>
      </SgExpandablePanel>
    </div>
  );
}
```

## SgCarousel

### sectionTitle(1)

sectionDescription(1)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/basico-horizontal.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems()}
    numVisible={1}
    orientation="horizontal"
    height="100%"
    style={{ borderRadius: 12, overflow: "hidden" }}
  />
</div>
```

### sectionTitle(2)

sectionDescription(2)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/multiplos-items-visiveis.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems()}
    numVisible={3}
    numScroll={1}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(3)

sectionDescription(3)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/auto-play.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems(sampleImages.slice(0, 6))}
    numVisible={1}
    autoPlay
    autoPlayInterval={2000}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(4)

sectionDescription(4)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/orientacao-vertical.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<SgGrid columns={1} justify="center">
  <div className="h-96 w-80">
    <SgCarousel
      items={createCarouselItems(sampleImages.slice(0, 6))}
      numVisible={1}
      orientation="vertical"
      height="100%"
    />
  </div>
</SgGrid>
```

### sectionTitle(5)

sectionDescription(5)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/vertical-multiplos-items.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<SgGrid columns={1} justify="center">
  <div className="h-96 w-80">
    <SgCarousel
      items={createCarouselItems()}
      numVisible={3}
      numScroll={1}
      orientation="vertical"
      height="100%"
      gap={8}
    />
  </div>
</SgGrid>
```

### sectionTitle(6)

sectionDescription(6)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/sem-modo-circular.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems(sampleImages.slice(0, 6))}
    numVisible={1}
    circular={false}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(7)

sectionDescription(7)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/sem-indicadores.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems(sampleImages.slice(0, 6))}
    numVisible={1}
    showIndicators={false}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(8)

sectionDescription(8)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/sem-navegadores.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems(sampleImages.slice(0, 6))}
    numVisible={1}
    showNavigators={false}
    autoPlay
    autoPlayInterval={2500}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(9)

sectionDescription(9)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/gap-customizado.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems()}
    numVisible={3}
    numScroll={1}
    gap={32}
    orientation="horizontal"
    height="100%"
  />
</div>
```

### sectionTitle(10)

sectionDescription(10)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/com-callbacks.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
const [activeIndex, setActiveIndex] = React.useState(0);
const [eventLog, setEventLog] = React.useState<string[]>([]);

const log = (message: string) => {
  setEventLog((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10));
};

<div className="space-y-4">
  <div className="rounded bg-muted/40 p-3">
    <p className="text-sm">
      <span className="font-semibold">Índice Ativo:</span>{" "}
      <code className="rounded bg-background px-2 py-1">{activeIndex}</code>
    </p>
  </div>
  <div className="h-64">
    <SgCarousel
      items={createCarouselItems()}
      numVisible={2}
      numScroll={1}
      orientation="horizontal"
      height="100%"
      onIndexChange={(index) => {
        setActiveIndex(index);
        log(`Índice mudou para: ${index}`);
      }}
    />
  </div>
</div>
```

### sectionTitle(11)

sectionDescription(11)

Fonte: `apps/showcase/src/app/components/sg-carousel/samples/exemplo-responsivo.tsx.sample`. Trecho do showcase sem `import`/`export` (copiado como está).

```tsx
<div className="h-64">
  <SgCarousel
    items={createCarouselItems()}
    numVisible={4}
    numScroll={2}
    orientation="horizontal"
    height="100%"
    className="hidden lg:block"
  />
  <SgCarousel
    items={createCarouselItems()}
    numVisible={2}
    numScroll={1}
    orientation="horizontal"
    height="100%"
    className="hidden md:block lg:hidden"
  />
  <SgCarousel
    items={createCarouselItems()}
    numVisible={1}
    numScroll={1}
    orientation="horizontal"
    height="100%"
    className="block md:hidden"
  />
</div>
```

## SgBreadcrumb

### 1) Básico

Com ícones e item atual não clicável no final.

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/basico.tsx.sample`.

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

### 2) Caminho externo

Troca do caminho renderizado por estado externo.

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/caminho-externo.tsx.sample`.

```tsx
import React from "react";
import { Box, Building2, FilePenLine, Layers3, Receipt, Settings } from "lucide-react";
import { SgBreadcrumb, SgButton, type SgBreadcrumbItem } from "@seedgrid/fe-components";

const ROUTES = {
  registration: [
    { id: "erp", label: "ERP", href: "/erp", icon: <Layers3 className="size-4" /> },
    { id: "registrations", label: "Registrations", href: "/erp/registrations", icon: <Building2 className="size-4" /> },
    { id: "customers", label: "Customers", icon: <Receipt className="size-4" /> }
  ],
  fiscal: [
    { id: "erp", label: "ERP", href: "/erp", icon: <Layers3 className="size-4" /> },
    { id: "fiscal", label: "Fiscal", href: "/erp/fiscal", icon: <Receipt className="size-4" /> },
    { id: "access", label: "Access", icon: <FilePenLine className="size-4" /> }
  ],
  integration: [
    { id: "erp", label: "ERP", href: "/erp", icon: <Layers3 className="size-4" /> },
    { id: "integration", label: "Integration", href: "/erp/integration", icon: <Settings className="size-4" /> },
    { id: "connectors", label: "Connectors", icon: <Building2 className="size-4" /> }
  ]
} satisfies Record<"registration" | "fiscal" | "integration", SgBreadcrumbItem[]>;

export default function Example() {
  const [routeKey, setRouteKey] = React.useState<keyof typeof ROUTES>("registration");
  const [lastNavigate, setLastNavigate] = React.useState("-");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setRouteKey("registration")}>Go to Registration</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setRouteKey("fiscal")}>Go to Fiscal</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setRouteKey("integration")}>Go to Integration</SgButton>
      </div>
      <SgBreadcrumb items={ROUTES[routeKey]} separator="arrow" variant="subtle" onNavigate={(item) => setLastNavigate(item.id)} />
      <p>active route: {routeKey} | last click: {lastNavigate}</p>
    </div>
  );
}
```

### 3) Excedente

Colapso com dropdown ou scroll horizontal em telas pequenas.

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/overflow.tsx.sample`.

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

### 4) Início, ícones e separadores

Ícone de início automático e os quatro separadores.

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/separadores.tsx.sample`.

```tsx
import React from "react";
import { Folder } from "lucide-react";
import { SgBreadcrumb } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-2">
      {(["slash", "chevron", "dot", "arrow"] as const).map((separator) => (
        <SgBreadcrumb
          key={separator}
          showHomeIcon
          separator={separator}
          items={[
            { id: "a", label: "Pasta", href: "/p", icon: <Folder className="size-4" /> },
            { id: "b", label: separator }
          ]}
        />
      ))}
    </div>
  );
}
```

### 5) Tamanhos e variantes

Tamanhos sm e lg e as variantes subtle e primary.

Fonte: `apps/showcase/src/app/components/sg-breadcrumb/samples/variantes.tsx.sample`.

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
    <div className="space-y-2">
      <SgBreadcrumb items={longItems.slice(0, 3)} size="sm" />
      <SgBreadcrumb items={longItems.slice(0, 3)} variant="subtle" />
      <SgBreadcrumb items={longItems.slice(0, 3)} variant="primary" size="lg" />
    </div>
  );
}
```

## SgMenu

### 1) Sidebar fixa

Menu lateral com grupos colapsáveis e botão de colapso.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/sidebar-fixa.tsx.sample`.

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

### 2) Drawer móvel

Abre em overlay e pode ser fixado por pin.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/drawer-mobile.tsx.sample`.

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

### 3) PanelMenu

Exemplo isolado para visualizar apenas o estilo painel.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/panel-menu.tsx.sample`.

```tsx
import React from "react";
import { ClipboardList, Home, LayoutGrid, Search, Settings, Users } from "lucide-react";
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const MENU: SgMenuNode[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: <Home className="size-4" /> },
  { id: "customers", label: "Customers", icon: <Users className="size-4" />, children: [{ id: "customers-new", label: "New", icon: <LayoutGrid className="size-4" /> }, { id: "customers-reports", label: "Reports", icon: <ClipboardList className="size-4" /> }] }
];

export default function Example() {
  const [activeId, setActiveId] = React.useState("dashboard");
  return <div className="rounded-lg border border-border p-3"><div className="h-[320px] overflow-auto rounded-md border border-border"><SgMenu menu={MENU} selection={{ activeId }} menuStyle="inline" menuVariantStyle="PanelMenu" onNavigate={(node) => setActiveId(node.id)} /></div></div>;
}
```

### 4) Em níveis

Exemplo isolado para visualizar apenas o estilo em níveis.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/tiered.tsx.sample`.

```tsx
import React from "react";
import { ClipboardList, Home, LayoutGrid, Users } from "lucide-react";
import { SgMenu, toast, type SgMenuNode } from "@seedgrid/fe-components";

const MENU: SgMenuNode[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: <Home className="size-4" />, onClick: () => toast.message("Dashboard") },
  {
    id: "customers",
    label: "Customers",
    icon: <Users className="size-4" />,
    children: [
      {
        id: "customers-new",
        label: "New",
        icon: <LayoutGrid className="size-4" />,
        children: [
          { id: "customer-create", label: "Customer", url: "/customers/new/customer", onClick: () => toast.message("Customer") },
          { id: "customer-duplicate", label: "Duplicate", url: "/customers/new/duplicate", onClick: () => toast.message("Duplicate") }
        ]
      },
      {
        id: "customers-reports",
        label: "Reports",
        icon: <ClipboardList className="size-4" />,
        children: [
          { id: "customers-cohort", label: "Cohort", url: "/customers/reports/cohort", onClick: () => toast.message("Cohort") },
          { id: "customers-churn", label: "Churn", url: "/customers/reports/churn", onClick: () => toast.message("Churn") }
        ]
      }
    ]
  }
];

export default function Example() {
  const [activeId, setActiveId] = React.useState("dashboard");

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="h-[320px] overflow-visible rounded-md border border-border p-2">
        <SgMenu
          menu={MENU}
          selection={{ activeId }}
          menuStyle="inline"
          menuVariantStyle="Tiered"
          onNavigate={(node) => setActiveId(node.id)}
          onItemClick={(node) => setActiveId(node.id)}
        />
      </div>
    </div>
  );
}
```

### 5) MegaMenu horizontal

Exemplo isolado para visualizar apenas o MegaMenu horizontal.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/mega-menu-horizontal.tsx.sample`.

```tsx
import React from "react";
import { Settings, Users } from "lucide-react";
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const MEGA_MENU: SgMenuNode[] = [
  { id: "fashion", label: "Fashion", icon: <Users className="size-4" />, children: [{ id: "fashion-woman", label: "Woman", children: [{ id: "w1", label: "Woman Casual", url: "/fashion/woman/1" }] }] },
  { id: "electronics", label: "Electronics", icon: <Settings className="size-4" />, children: [{ id: "electronics-computer", label: "Computer", children: [{ id: "c1", label: "Laptop", url: "/electronics/computer/1" }] }] }
];

export default function Example() {
  return <div className="rounded-lg border border-border p-3"><SgMenu menu={MEGA_MENU} selection={{ activeId: "fashion" }} menuStyle="inline" menuVariantStyle="MegaMenuHorizontal" /></div>;
}
```

### 6) MegaMenu vertical

Exemplo isolado para visualizar apenas o MegaMenu vertical.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/mega-menu-vertical.tsx.sample`.

```tsx
import React from "react";
import { Settings, Users } from "lucide-react";
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const MEGA_MENU: SgMenuNode[] = [
  { id: "fashion", label: "Fashion", icon: <Users className="size-4" />, children: [{ id: "fashion-woman", label: "Woman", children: [{ id: "w1", label: "Woman Casual", url: "/fashion/woman/1" }] }] },
  { id: "electronics", label: "Electronics", icon: <Settings className="size-4" />, children: [{ id: "electronics-computer", label: "Computer", children: [{ id: "c1", label: "Laptop", url: "/electronics/computer/1" }] }] }
];

export default function Example() {
  return <div className="rounded-lg border border-border p-3"><SgMenu menu={MEGA_MENU} selection={{ activeId: "fashion" }} menuStyle="inline" menuVariantStyle="MegaMenuVertical" /></div>;
}
```

### 7) Sidebar acoplável

SgMenu dockable com menu completo, brand, userMenu, SgToolBar integrada e identidade visual do showcase.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/sidebar-dockable.tsx.sample`.

```tsx
import React from "react";
import { Download, Home, Plus, Printer, Save, Settings, Trash2, Users } from "lucide-react";
import { SgDockLayout, SgDockZone, SgMenu, SgRadioGroup, SgToolBar, SgToolbarIconButton, type SgMenuNode, type SgRadioGroupOption } from "@seedgrid/fe-components";

const DOCKABLE_MENU: SgMenuNode[] = [{ id: "dk-dashboard", label: "Dashboard", url: "/dashboard", icon: <Home className="size-4" /> }, { id: "dk-clientes", label: "Customers", icon: <Users className="size-4" /> }, { id: "dk-configuracoes", label: "Settings", icon: <Settings className="size-4" /> }];
const DOCKABLE_USER_MENU: SgMenuNode[] = [{ id: "dk-meu-perfil", label: "My Profile", onClick: () => {} }, { id: "dk-logout", label: "Sign out", onClick: () => {} }];
const DOCKABLE_MENU_STYLE_OPTIONS: SgRadioGroupOption[] = [{ label: "PanelMenu", value: "PanelMenu" }, { label: "Tiered Menu", value: "Tiered" }];
const DOCKABLE_SHELL_STYLE = { "--primary": "27 62% 47%", "--primary-foreground": "0 0% 100%", "--muted": "35 55% 94%", "--muted-foreground": "28 30% 36%", "--border": "32 42% 83%", "--ring": "27 62% 47%", "--background": "40 33% 97%", "--card": "40 33% 97%" } as React.CSSProperties;

export default function Example() {
  const [dockActiveId, setDockActiveId] = React.useState("dk-dashboard");
  const [dockMenuStyle, setDockMenuStyle] = React.useState<"PanelMenu" | "Tiered">("PanelMenu");
  return (
    <div className="space-y-3">
      <SgRadioGroup title="Menu Style" source={DOCKABLE_MENU_STYLE_OPTIONS} value={dockMenuStyle} orientation="horizontal" onChange={(value) => { if (value === "PanelMenu" || value === "Tiered") setDockMenuStyle(value); }} />
      <div className="relative min-h-[520px] overflow-visible rounded-lg border border-[#e2cebc] bg-[#f0ebe4]" style={DOCKABLE_SHELL_STYLE}>
        <SgDockLayout id="showcase-menu-dock-v2" className="grid min-h-[520px] grid-cols-[auto_1fr_auto] grid-rows-[3.5rem_1fr_auto]">
          <SgDockZone zone="top" /><SgDockZone zone="left" /><SgDockZone zone="right" /><SgDockZone zone="bottom" /><SgDockZone zone="free"><div className="pointer-events-none text-sm text-[#7e5f46]">Free center area</div></SgDockZone>
          <SgMenu id="menu-dock-sidebar-v2" menu={DOCKABLE_MENU} selection={{ activeId: dockActiveId }} menuStyle="sidebar" menuVariantStyle={dockMenuStyle} mode="accordion" dockable dockZone="left" draggable showCollapseButton search={{ enabled: true, placeholder: "Search module..." }} brand={{ title: "SeedGrid ERP" }} user={{ name: "Lucia Souza", subtitle: "Finance" }} userMenu={DOCKABLE_USER_MENU} onNavigate={(node) => setDockActiveId(node.id)} />
          <SgToolBar id="toolbar-dock-v1" dockZone="top" orientationDirection="horizontal-left" title="Tools" draggable collapsible={false}>
            <SgToolbarIconButton icon={<Plus className="size-4" />} hint="New record" severity="primary" />
            <SgToolbarIconButton icon={<Save className="size-4" />} hint="Save" />
            <SgToolbarIconButton icon={<Printer className="size-4" />} hint="Print" />
            <SgToolbarIconButton icon={<Download className="size-4" />} hint="Export" />
            <SgToolbarIconButton icon={<Trash2 className="size-4" />} hint="Delete" severity="danger" />
          </SgToolBar>
        </SgDockLayout>
      </div>
    </div>
  );
}
```

### 8) Acordeão, seleção e expansão inicial

mode accordion mantém um grupo aberto por vez; selection destaca o item ativo e abre o caminho até ele.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/acordeao-selecao-e-expansao-inicial.tsx.sample`.

```tsx
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const ACCORDION_MENU: SgMenuNode[] = [
  {
    id: "relatorios",
    label: "Relatórios",
    children: [
      { id: "relatorio-mensal", label: "Mensal" },
      { id: "relatorio-anual", label: "Anual" }
    ]
  },
  {
    id: "cadastros",
    label: "Cadastros",
    children: [
      { id: "produtos", label: "Produtos" },
      { id: "fornecedores", label: "Fornecedores" }
    ]
  }
];

export default function Example() {
  return (
    <div className="h-[360px] overflow-auto rounded-md border border-border">
      <SgMenu
        menu={ACCORDION_MENU}
        selection={{ activeId: "relatorio-mensal" }}
        menuStyle="inline"
        mode="accordion"
        indent={20}
      />
    </div>
  );
}
```

### 9) Usuário e menu do usuário (SgMenuUser)

user mostra nome, subtítulo e avatar no rodapé do menu; clicar no bloco chama onClick, e userMenu abre as ações do usuário.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/usuario-e-menu-do-usuario.tsx.sample`.

```tsx
import React from "react";
import { DollarSign, Home } from "lucide-react";
import { SgMenu, type SgMenuNode } from "@seedgrid/fe-components";

const SIMPLE_MENU: SgMenuNode[] = [
  { id: "painel", label: "Painel", icon: <Home className="size-4" /> },
  { id: "financeiro", label: "Financeiro", icon: <DollarSign className="size-4" /> }
];

const USER_ACTIONS_MENU: SgMenuNode[] = [
  { id: "perfil", label: "Meu perfil" },
  { id: "preferencias", label: "Preferências" },
  { id: "sair", label: "Sair" }
];

export default function Example() {
  const [userAction, setUserAction] = React.useState("-");

  return (
    <div className="space-y-3">
      <div className="h-[460px] overflow-hidden rounded-lg border border-border">
        <div className="flex h-full">
          <SgMenu
            menu={SIMPLE_MENU}
            menuStyle="sidebar"
            brand={{ title: "SeedGrid ERP" }}
            user={{
              name: "Lúcia Souza",
              subtitle: "Financeiro",
              onClick: () => setUserAction("user-block")
            }}
            userMenu={USER_ACTIONS_MENU.map((item) => ({ ...item, onClick: () => setUserAction(item.id) }))}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Última ação: <span className="font-medium text-foreground">{userAction}</span>
      </p>
    </div>
  );
}
```

### 10) Submenu ao passar o mouse

Na variante tiered, openSubmenuOnHover abre os submenus ao passar o mouse; ariaLabel nomeia a navegação para leitores de tela.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/submenu-ao-passar-o-mouse.tsx.sample`.

```tsx
"use client";

import { SgMenu } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="h-[320px] overflow-visible rounded-md border border-border p-2">
      <SgMenu
        ariaLabel="Navegação principal"
        menuStyle="inline"
        menuVariantStyle="Tiered"
        openSubmenuOnHover
        menu={[
          {
            id: "arquivo",
            label: "Arquivo",
            children: [
              { id: "novo", label: "Novo" },
              {
                id: "exportar",
                label: "Exportar",
                children: [
                  { id: "pdf", label: "PDF" },
                  { id: "csv", label: "CSV" }
                ]
              }
            ]
          },
          { id: "editar", label: "Editar" }
        ]}
      />
    </div>
  );
}
```

### 11) Rodapé e avatar do usuário

footer coloca um conteúdo fixo no fim do menu; o avatar do SgMenuUser personaliza a imagem do usuário.

Fonte: `apps/showcase/src/app/components/sg-menu/samples/rodape-e-avatar-do-usuario.tsx.sample`.

```tsx
"use client";

import { SgAvatar, SgMenu } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="h-[320px] overflow-hidden rounded-lg border border-border">
      <div className="flex h-full">
        <SgMenu
          menuStyle="sidebar"
          brand={{ title: "SeedGrid ERP" }}
          user={{
            name: "Lúcia Souza",
            subtitle: "Financeiro",
            avatar: <SgAvatar size="sm" label="LS" />
          }}
          footer={<span className="text-xs">v1.0</span>}
          menu={[
            { id: "painel", label: "Painel" },
            { id: "financeiro", label: "Financeiro" }
          ]}
        />
      </div>
    </div>
  );
}
```

## SgTreeView

### 1) Básico

Árvore pesquisável com check e clique apenas em leaf.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/basico.tsx.sample`.

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

### 2) Tom dos ícones

Altere a cor dos ícones para primary.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/icon-tone.tsx.sample`.

```tsx
import React from "react";
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "root",
    label: "Admin",
    children: [
      {
        id: "users",
        label: "Users",
        children: [
          { id: "users.list", label: "List users" },
          { id: "users.create", label: "Create user" }
        ]
      }
    ]
  }
];

export default function Example() {
  return <SgTreeView nodes={nodes} iconTone="primary" searchable searchPlaceholder="Search..." />;
}
```

### 3) Modo confirmação

Confirme os itens selecionados no rodapé.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/confirm.tsx.sample`.

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

### 4) Tamanho e densidade

Compacto, normal e confortável.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/size.tsx.sample`.

```tsx
import React from "react";
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "root",
    label: "Admin",
    children: [
      {
        id: "users",
        label: "Users",
        children: [
          { id: "users.list", label: "List users" },
          { id: "users.create", label: "Create user" }
        ]
      }
    ]
  }
];

export default function Example() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SgTreeView nodes={nodes} size="sm" density="compact" />
      <SgTreeView nodes={nodes} size="md" density="normal" />
      <SgTreeView nodes={nodes} size="lg" density="comfortable" />
    </div>
  );
}
```

### 5) Expandido por padrão

Use defaultExpandedIds para iniciar aberto.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/expanded.tsx.sample`.

```tsx
import React from "react";
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "root",
    label: "Admin",
    children: [
      {
        id: "users",
        label: "Users",
        children: [
          { id: "users.list", label: "List users" },
          { id: "users.create", label: "Create user" }
        ]
      },
      {
        id: "reports",
        label: "Reports",
        children: [
          { id: "reports.sales", label: "Sales report" },
          { id: "reports.financial", label: "Financial report" }
        ]
      }
    ]
  }
];

export default function Example() {
  return <SgTreeView nodes={nodes} searchable searchPlaceholder="Search..." defaultExpandedIds={["root", "users"]} />;
}
```

### 6) JSON com checked

Carregue itens marcados a partir do JSON (ex.: permissões do usuário).

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/json-checked.tsx.sample`.

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

### 7) Trilhas (colunas extras por linha)

Uma coluna por trilha, cada uma com seu cabeçalho (label) e largura (width). As trilhas boolean e enum têm cascata pai→filhos própria e independente; a trilha custom não tem estado: a árvore só cede a célula e a tela desenha o que quiser. O adornment põe conteúdo livre ao lado do controle (aqui, uma estrela em 'List users').

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/tracks.tsx.sample`.

```tsx
import React from "react";
import { BarChart3, FileText, Shield, Star, Users } from "lucide-react";
import { SgCard, SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

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
  const [priorityIds, setPriorityIds] = React.useState<string[]>([]);
  const [accountTypeByNode, setAccountTypeByNode] = React.useState<Record<string, string | undefined>>({});

  return (
    <SgCard title="Ativo + Prioridade + Tipo + coluna livre">
      <SgTreeView
        nodes={nodes}
        checkable
        checkableLabel="Ativo"
        checkedIds={checkedIds}
        onCheckedChange={setCheckedIds}
        defaultExpandedIds={["root", "users", "reports"]}
        tracks={[
          {
            id: "priority",
            kind: "boolean",
            label: "Prioridade",
            checkedIds: priorityIds,
            onCheckedChange: setPriorityIds,
            // Conteudo livre ao lado do controle DESTA coluna. O componente nao sabe o que ele
            // significa -- icone, badge, contador: quem da' o significado e' a tela.
            adornment: (node) =>
              node.id === "users.list" ? (
                <Star className="h-3.5 w-3.5 text-amber-500" aria-label="Destaque" />
              ) : null
          },
          {
            id: "accountType",
            kind: "enum",
            label: "Tipo de conta",
            // Rotulos longos precisam de coluna mais larga que o default (110px).
            width: "150px",
            placeholder: "—",
            mixedLabel: "— misto —",
            options: [
              { value: "fixo", label: "Custo fixo" },
              { value: "variavel", label: "Custo variável" },
              { value: "despesa", label: "Despesa variável" },
              { value: "investimento", label: "Investimento" }
            ],
            valueByNodeId: accountTypeByNode,
            onChange: setAccountTypeByNode
          },
          {
            id: "acao",
            kind: "custom",
            label: "Coluna livre",
            width: "130px",
            // Sem estado e sem cascata: a arvore so' cede a celula (largura, alinhamento,
            // cabecalho) e a tela desenha o que precisar.
            render: (node) =>
              node.children?.length ? null : (
                <button
                  type="button"
                  className="cursor-pointer border-none bg-transparent text-xs text-sg-muted underline"
                  onClick={() => setAccountTypeByNode((prev) => ({ ...prev, [node.id]: "fixo" }))}
                >
                  marcar fixo
                </button>
              )
          }
        ]}
      />
    </SgCard>
  );
}
```

### 8) Busca com valor inicial

defaultSearchValue abre a árvore já filtrada: só os achados e seus ancestrais aparecem, e expandMatchesOnSearch (padrão true) abre os ancestrais.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/search-initial.tsx.sample`.

```tsx
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "vegetables",
    label: "Vegetables",
    children: [
      { id: "lettuce", label: "Lettuce" },
      { id: "kale", label: "Kale" }
    ]
  },
  {
    id: "roots",
    label: "Roots",
    children: [{ id: "carrot", label: "Carrot" }]
  }
];

export default function Example() {
  return (
    <SgTreeView
      nodes={nodes}
      searchable
      searchPlaceholder="Search..."
      defaultSearchValue="kale"
      expandMatchesOnSearch
    />
  );
}
```

### 9) Tom dos rótulos (muted)

tone: muted suaviza a cor dos rótulos; o padrão é default. Compare as duas árvores.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/tone-muted.tsx.sample`.

```tsx
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "docs",
    label: "Documents",
    children: [
      { id: "contract", label: "Contract" },
      { id: "invoice", label: "Invoice" }
    ]
  }
];

export default function Example() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SgTreeView nodes={nodes} tone="default" defaultExpandedIds={["docs"]} />
      <SgTreeView nodes={nodes} tone="muted" defaultExpandedIds={["docs"]} />
    </div>
  );
}
```

### 10) Nó desabilitado

enabled: false deixa o nó visível, mas sem resposta a clique, expansão ou marcação.

Fonte: `apps/showcase/src/app/components/sg-tree-view/samples/disabled-node.tsx.sample`.

```tsx
import { SgTreeView, type SgTreeNode } from "@seedgrid/fe-components";

const nodes: SgTreeNode[] = [
  {
    id: "docs",
    label: "Documents",
    children: [
      { id: "contract", label: "Contract" },
      { id: "locked", label: "Locked", enabled: false }
    ]
  }
];

export default function Example() {
  return <SgTreeView nodes={nodes} checkable defaultExpandedIds={["docs"]} />;
}
```

## SgDockLayout + SgDockZone

### 1) Básico

Quatro zonas (top/bottom/left/right) com toolbars arrastáveis.

Fonte: `apps/showcase/src/app/components/sg-dock-layout/samples/basico.tsx.sample`.

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
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para início" />
            <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar registros" />
          </SgToolBar>
          <SgToolBar id="tb-top-extra-basic-v9" dockZone="top" orientationDirection="horizontal-left" title="Acoes" draggable>
            <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
            <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Relatório" hint="Abrir relatórios" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="left" className="col-start-1 row-start-2 items-start border-r border-white/20">
          <SgToolBar id="tb-left-basic-v9" dockZone="left" orientationDirection="vertical-down" title="Navegacao" collapsible draggable>
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Config" hint="Abrir configurações" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="right" className="col-start-3 row-start-2 items-start border-l border-white/20">
          <SgToolBar id="tb-right-basic-v9" dockZone="right" orientationDirection="vertical-down" title="Equipe" collapsible draggable>
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuários" hint="Gerenciar usuários" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Ajustes" hint="Abrir ajustes" />
          </SgToolBar>
        </SgDockZone>

        <SgDockZone zone="bottom" className="col-span-3 row-start-3 items-end border-t border-white/20">
          <SgToolBar id="tb-bottom-a-basic-v9" dockZone="bottom" orientationDirection="horizontal-left" title="Rodape A" draggable>
            <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
            <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar no rodapé" />
          </SgToolBar>
          <SgToolBar id="tb-bottom-b-basic-v9" dockZone="bottom" orientationDirection="horizontal-left" title="Rodape B" draggable>
            <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Tarefas" hint="Abrir tarefas" />
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Voltar ao início" />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```

### 2) Estado das toolbars (defaultState)

Cada toolbar tem zona, ordem e recolhimento; o defaultState define o estado inicial.

Fonte: `apps/showcase/src/app/components/sg-dock-layout/samples/estado.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Home, Search, Settings, Users } from "lucide-react";

export default function Example() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-xl border border-border bg-black">
      <SgDockLayout
        id="showcase-dock-state-v1"
        className="grid h-full grid-cols-[9rem_1fr] grid-rows-[auto_1fr]"
        defaultState={{
          version: 1,
          toolbars: {
            ferramentas: { id: "ferramentas", zone: "top", order: 0 },
            navegacao: { id: "navegacao", zone: "left", order: 0 }
          }
        }}
      >
        <SgDockZone zone="top" className="col-span-2 row-start-1 items-start border-b border-white/20">
          <SgToolBar id="ferramentas" dockZone="top" orientationDirection="horizontal-left" title="Ferramentas" draggable>
            <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para início" />
            <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar registros" />
          </SgToolBar>
        </SgDockZone>
        <SgDockZone zone="left" className="col-start-1 row-start-2 items-start border-r border-white/20">
          <SgToolBar id="navegacao" dockZone="left" orientationDirection="vertical-down" title="Navegação" collapsible draggable>
            <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
            <SgToolbarIconButton icon={<Settings className="size-4" />} label="Config" hint="Abrir configurações" />
          </SgToolBar>
        </SgDockZone>
        <SgDockZone zone="free" className="col-start-2 row-start-2 items-center justify-center">
          <div className="pointer-events-none text-sm text-white/60">Zona livre</div>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```

### 3) Prévia de soltura

Ao arrastar uma toolbar as zonas mostram onde ela pode cair. Soltar o ponteiro encerra a prévia.

Fonte: `apps/showcase/src/app/components/sg-dock-layout/samples/previa.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { ClipboardList, LayoutGrid } from "lucide-react";

export default function Example() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-xl border border-border bg-black">
      <SgDockLayout
        id="showcase-dock-preview-v1"
        className="grid h-full grid-cols-[1fr_1fr] grid-rows-[auto_1fr]"
      >
        <SgDockZone zone="top" className="col-span-2 row-start-1 items-start border-b border-white/20">
          <SgToolBar id="ferramentas-previa" dockZone="top" orientationDirection="horizontal-left" title="Ferramentas" draggable>
            <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
            <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Relatório" hint="Abrir relatórios" />
          </SgToolBar>
        </SgDockZone>
        <SgDockZone zone="left" className="col-start-1 row-start-2 items-start border-r border-white/20">
          <div className="pointer-events-none text-sm text-white/60">Arraste as toolbars entre as zonas.</div>
        </SgDockZone>
        <SgDockZone zone="free" className="col-start-2 row-start-2 items-center justify-center">
          <div className="pointer-events-none text-sm text-white/60">Zona livre</div>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```

## SgDockScreen

### 1) Básico

Uso direto do SgDockScreen com quatro dock zones e área livre central, sem posicionamento manual.

Fonte: `apps/showcase/src/app/components/sg-dock-screen/samples/basico.tsx.sample`.

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
          <SgToolbarIconButton icon={<Home className="size-4" />} label="Início" hint="Ir para início" />
          <SgToolbarIconButton icon={<Search className="size-4" />} label="Buscar" hint="Pesquisar dados" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="bottom">
        <SgToolBar id="tb-bottom-dock-screen-v1" dockZone="bottom" orientationDirection="horizontal-left" title="Base" draggable>
          <SgToolbarIconButton icon={<LayoutGrid className="size-4" />} label="Painel" hint="Abrir painel" />
          <SgToolbarIconButton icon={<ClipboardList className="size-4" />} label="Relatório" hint="Abrir relatórios" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="left">
        <SgToolBar id="tb-left-dock-screen-v1" dockZone="left" orientationDirection="vertical-down" title="Navegacao" collapsible draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
          <SgToolbarIconButton icon={<Settings className="size-4" />} label="Config" hint="Abrir configurações" />
        </SgToolBar>
      </SgDockZone>

      <SgDockZone zone="right">
        <SgToolBar id="tb-right-dock-screen-v1" dockZone="right" orientationDirection="vertical-down" title="Equipe" collapsible draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuários" hint="Gerenciar usuários" />
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

### 2) Largura, altura e padding

width e height aceitam número (px) ou texto como "520px"; padding afasta a grade da borda.

Fonte: `apps/showcase/src/app/components/sg-dock-screen/samples/tamanho.tsx.sample`.

```tsx
import React from "react";
import { SgDockScreen, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Home, Users } from "lucide-react";

export default function Example() {
  return (
    <SgDockScreen
      id="showcase-dock-screen-size-v1"
      fullscreen={false}
      width="520px"
      height={220}
      padding={12}
      className="overflow-hidden rounded-xl border border-border bg-background"
    >
      <SgDockZone zone="top">
        <SgToolBar id="tb-top-dock-screen-size-v1" dockZone="top" orientationDirection="horizontal-left" title="Topo" draggable>
          <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para início" />
        </SgToolBar>
      </SgDockZone>
      <SgDockZone zone="left">
        <SgToolBar id="tb-left-dock-screen-size-v1" dockZone="left" orientationDirection="vertical-down" title="Esquerda" draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
        </SgToolBar>
      </SgDockZone>
      <SgDockZone zone="free">
        <div className="pointer-events-none text-sm text-muted-foreground">Centro</div>
      </SgDockZone>
    </SgDockScreen>
  );
}
```

### 3) Conteúdo no centro

O conteúdo fica na célula central, entre as zonas laterais.

Fonte: `apps/showcase/src/app/components/sg-dock-screen/samples/conteudo-no-centro.tsx.sample`.

```tsx
import React from "react";
import { SgDockScreen, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Users } from "lucide-react";

export default function Example() {
  return (
    <SgDockScreen
      id="showcase-dock-screen-center-v1"
      fullscreen={false}
      height={200}
      className="overflow-hidden rounded-xl border border-border bg-background"
    >
      <SgDockZone zone="left">
        <SgToolBar id="tb-left-dock-screen-center-v1" dockZone="left" orientationDirection="vertical-down" title="Esquerda" draggable>
          <SgToolbarIconButton icon={<Users className="size-4" />} label="Clientes" hint="Abrir clientes" />
        </SgToolBar>
      </SgDockZone>
      <SgDockZone zone="free">
        <div className="pointer-events-none text-sm text-muted-foreground">Centro</div>
      </SgDockZone>
    </SgDockScreen>
  );
}
```

## SgToolBar + SgToolbarIconButton

### 1) Básico

Exemplo vertical simples com botões de navegação.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/basico.tsx.sample`.

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

### 2) onClick assíncrono com toast

Quando onClick retorna Promise, o botão mostra loading até concluir.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/onclick-assincrono-com-toast.tsx.sample`.

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

### 3) Orientação e quebra

Comparação entre horizontal-left e vertical-down com buttonsPerDirection.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/orientacao-e-quebra.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgGrid, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Filter, Home, Pencil, Plus, RefreshCcw, Settings, Trash2, Users } from "lucide-react";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, lg: 2 }} gap={12}>
      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">orientationDirection="horizontal-left" + buttonsPerDirection=3</p>
        <SgDockLayout id="tb-layout-horizontal" className="grid grid-cols-1 grid-rows-1">
          <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
            <SgToolBar id="tb-horizontal" title="Acoes rapidas" orientationDirection="horizontal-left" buttonsPerDirection={3} collapsible>
              <SgToolbarIconButton icon={<Plus className="size-4" />} label="Criar" hint="Criar novo registro" severity="success" />
              <SgToolbarIconButton icon={<Pencil className="size-4" />} label="Editar" hint="Editar registro selecionado" severity="info" />
              <SgToolbarIconButton icon={<Trash2 className="size-4" />} label="Excluir" hint="Excluir registro selecionado" severity="danger" />
              <SgToolbarIconButton icon={<Filter className="size-4" />} label="Filtro" hint="Filtrar resultados" />
              <SgToolbarIconButton icon={<RefreshCcw className="size-4" />} label="Atualizar" hint="Atualizar dados" />
            </SgToolBar>
          </SgDockZone>
        </SgDockLayout>
      </div>

      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">orientationDirection="vertical-down" + buttonsPerDirection=2</p>
        <SgDockLayout id="tb-layout-vertical" className="grid grid-cols-1 grid-rows-1">
          <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
            <SgToolBar id="tb-vertical" title="Navegacao" orientationDirection="vertical-down" buttonsPerDirection={2} collapsible>
              <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para Home" severity="primary" />
              <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuarios" hint="Abrir usuarios" />
              <SgToolbarIconButton icon={<Settings className="size-4" />} label="Configuracoes" hint="Abrir configuracoes" />
              <SgToolbarIconButton icon={<Filter className="size-4" />} label="Filtro" hint="Filtrar resultados" />
              <SgToolbarIconButton icon={<RefreshCcw className="size-4" />} label="Atualizar" hint="Atualizar dados" />
            </SgToolBar>
          </SgDockZone>
        </SgDockLayout>
      </div>
    </SgGrid>
  );
}
```

### 4) Cores de fundo

Uso de bgColor e bgColorTitle para destacar a toolbar.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/cores-de-fundo.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgGrid, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Filter, Home, Pencil, RefreshCcw, Settings, Users } from "lucide-react";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={12}>
      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">bgColor</p>
        <SgDockLayout id="tb-layout-style-a" className="grid grid-cols-1 grid-rows-1">
          <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
            <SgToolBar id="tb-style-a" title="Cor no corpo" orientationDirection="vertical-down" collapsible bgColor="hsl(var(--muted))">
              <SgToolbarIconButton icon={<Home className="size-4" />} label="Home" hint="Ir para Home" severity="primary" />
              <SgToolbarIconButton icon={<Users className="size-4" />} label="Usuarios" hint="Abrir usuarios" />
              <SgToolbarIconButton icon={<Settings className="size-4" />} label="Configuracoes" hint="Abrir configuracoes" />
            </SgToolBar>
          </SgDockZone>
        </SgDockLayout>
      </div>

      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">bgColor + bgColorTitle</p>
        <SgDockLayout id="tb-layout-style-b" className="grid grid-cols-1 grid-rows-1">
          <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
            <SgToolBar id="tb-style-b" title="Titulo destacado" orientationDirection="vertical-down" collapsible bgColor="hsl(var(--secondary))" bgColorTitle="hsl(var(--border))">
              <SgToolbarIconButton icon={<Filter className="size-4" />} label="Filtro" hint="Filtrar resultados" />
              <SgToolbarIconButton icon={<RefreshCcw className="size-4" />} label="Atualizar" hint="Atualizar dados" />
              <SgToolbarIconButton icon={<Pencil className="size-4" />} label="Editar" hint="Editar registro" severity="info" />
            </SgToolBar>
          </SgDockZone>
        </SgDockLayout>
      </div>
    </SgGrid>
  );
}
```

### 5) Arrastar livremente

Com freeDrag e draggable, arraste pelo cabeçalho; a posição fica limitada à área e é guardada.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/arrastar-livremente.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Share2, Star } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full">
      <SgDockLayout id="tb-layout-drag" className="grid h-[220px] grid-cols-1 grid-rows-1">
        <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
          <SgToolBar id="tb-drag" title="Arraste-me" freeDrag draggable defaultPosition={{ x: 24, y: 24 }}>
            <SgToolbarIconButton icon={<Star className="size-4" />} label="Favorito" />
            <SgToolbarIconButton icon={<Share2 className="size-4" />} label="Compartilhar" />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```

### 6) Overflow: itens que não cabem vão para o menu "…"

Com overflow, os botões que não cabem na largura vão para um menu "…" (SgMenu); abaixo de 600 de largura ele abre como painel inferior.

Fonte: `apps/showcase/src/app/components/sg-toolbar/samples/overflow-itens-que-nao-cabem-vao-para-o-menu.tsx.sample`.

```tsx
import React from "react";
import { SgDockLayout, SgDockZone, SgToolBar, SgToolbarIconButton } from "@seedgrid/fe-components";
import { Copy, Pencil, Plus, Printer, Share2 } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full">
      <SgDockLayout id="tb-layout-overflow" className="grid grid-cols-1 grid-rows-1">
        <SgDockZone zone="free" className="col-start-1 row-start-1 !items-start !justify-start !p-0">
          <SgToolBar id="tb-overflow" title="Estreita" orientationDirection="horizontal-left" overflow size={{ w: 260 }}>
            <SgToolbarIconButton icon={<Plus className="size-4" />} label="Novo" />
            <SgToolbarIconButton icon={<Pencil className="size-4" />} label="Editar" />
            <SgToolbarIconButton icon={<Copy className="size-4" />} label="Copiar" />
            <SgToolbarIconButton icon={<Printer className="size-4" />} label="Imprimir" />
            <SgToolbarIconButton icon={<Share2 className="size-4" />} label="Compartilhar" />
          </SgToolBar>
        </SgDockZone>
      </SgDockLayout>
    </div>
  );
}
```
