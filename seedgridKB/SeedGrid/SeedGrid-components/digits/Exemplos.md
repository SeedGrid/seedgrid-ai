---
tags: [seedgrid, front, component, digits]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/digits
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — dígitos animados

Exemplos copiados 1:1 dos arquivos `samples/*.tsx.sample` do showcase (rotas `/components/digits/<slug>`). Todos foram verificados com type-check TypeScript (`strict`) contra `packages/seedgrid-fe-components/src/index.ts` no commit `ad30fc11de` — sem erros. As classes utilitárias (`flex`, `gap-4`…) são Tailwind do app de exemplo.

API: [[SeedGrid/SeedGrid-components/digits/API|API dos dígitos]] · Visão geral: [[SeedGrid/SeedGrid-components/digits/Visao-geral|Dígitos — visão geral]]

## SgDiscardDigit

### Pilha com profundidade variável
`stackDepth` controla quantas folhas aparecem (2–30).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/basico.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [stackDepth, setStackDepth] = React.useState(8);

  return (
    <div className="flex items-center gap-4">
      <SgDiscardDigit value="7" color="#0f172a" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#f8fafc" stackDepth={stackDepth} />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setStackDepth((prev) => Math.min(30, prev + 1))}>Next (+1 folha)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setStackDepth((prev) => Math.max(2, prev - 1))}>Previous (-1 folha)</SgButton>
      </div>
    </div>
  );
}
```

### Paginação imperativa via `ref`
`totalNumberPages` + `SgDiscardDigitHandle.increasePage()/decreasePage()`; a pilha encolhe a cada página. Note que `value` é atualizado separadamente pelo estado do exemplo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/paginacao-imperativa-ref.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgDiscardDigit, type SgDiscardDigitHandle } from "@seedgrid/fe-components";

const TOTAL_PAGES = 10;

export default function Example() {
  const ref = React.useRef<SgDiscardDigitHandle>(null);
  const [page, setPage] = React.useState(1);

  return (
    <div className="flex flex-wrap items-end gap-8">
      <SgDiscardDigit ref={ref} value={String(page)} totalNumberPages={TOTAL_PAGES} fontSize={64} />
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Pagina <strong>{page}</strong> de {TOTAL_PAGES}</p>
        <div className="flex gap-2">
          <SgButton size="sm" disabled={page <= 1} onClick={() => { ref.current?.decreasePage(); setPage((prev) => Math.max(1, prev - 1)); }}>Previous</SgButton>
          <SgButton size="sm" disabled={page >= TOTAL_PAGES} onClick={() => { ref.current?.increasePage(); setPage((prev) => Math.min(TOTAL_PAGES, prev + 1)); }}>Proxima</SgButton>
        </div>
      </div>
    </div>
  );
}
```

## SgFadeDigit

### Básico 0–9

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/basico-0-9.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  return (
    <div className="flex items-center gap-4">
      <SgFadeDigit value={digit} />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>
          Next (+1)
        </SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>
          Previous (-1)
        </SgButton>
        <SgButton size="sm" severity="info" onClick={() => setDigit(String(Math.floor(Math.random() * 10)))}>
          Random
        </SgButton>
      </div>
    </div>
  );
}
```

## SgFlipDigit

### Básico

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");
  const nextDigit = () => setDigit((prev) => String((Number(prev) + 1) % 10));
  const prevDigit = () => setDigit((prev) => String((Number(prev) - 1 + 10) % 10));
  const randomDigit = () => setDigit(String(Math.floor(Math.random() * 10)));

  return (
    <div className="flex items-center gap-4">
      <SgFlipDigit value={digit} />
      <div className="flex flex-col gap-2">
        <SgButton onClick={nextDigit} size="sm">Next (+1)</SgButton>
        <SgButton onClick={prevDigit} size="sm" severity="secondary">Previous (-1)</SgButton>
        <SgButton onClick={randomDigit} size="sm" severity="info">Random</SgButton>
      </div>
    </div>
  );
}
```

## SgMatrixDigit

### Texto matricial
Vários caracteres por instância, com ajuste de `dotSize`, `gap` e `charGap`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/texto-matricial.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgMatrixDigit } from "@seedgrid/fe-components";

const MESSAGES = ["SEEDGRID", "MATRIX 2026", "ABC-123"] as const;

export default function Example() {
  const [index, setIndex] = React.useState(0);
  const value = MESSAGES[index] ?? MESSAGES[0];

  return (
    <div className="space-y-3">
      <SgMatrixDigit value={value} color="#a3e635" backgroundColor="#06090f" dotSize={8} gap={2} charGap={6} />
      <SgButton size="sm" onClick={() => setIndex((prev) => (prev + 1) % MESSAGES.length)}>Change text</SgButton>
    </div>
  );
}
```

## SgNeonDigit

### Básico com cor de brilho

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/basico.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  return (
    <div className="flex items-center gap-4">
      <SgNeonDigit value={digit} color="#f8fafc" backgroundColor="#120f2b" shadowColor="#8b5cf6" />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>Next (+1)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>Previous (-1)</SgButton>
      </div>
    </div>
  );
}
```

## SgRoller3DDigit

### Básico 0–9 (usa `items` padrão)

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/basico-0-9.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgRoller3DDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  return (
    <div className="flex items-center gap-4">
      <SgRoller3DDigit value={digit} fontSize={32} />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>Next (+1)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>Previous (-1)</SgButton>
      </div>
    </div>
  );
}
```

## SgSegmentDigit

### Composição estilo relógio (`HH:MM:SS`)
Um componente por caractere, incluindo `:`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-segment-digit/samples/composicao-estilo-relogio.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgSegmentDigit } from "@seedgrid/fe-components";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Example() {
  const [seconds, setSeconds] = React.useState(0);
  const total = seconds % 86400;
  const hh = pad(Math.floor(total / 3600));
  const mm = pad(Math.floor((total % 3600) / 60));
  const ss = pad(total % 60);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1">
        {[...hh, ":", ...mm, ":", ...ss].map((value, index) => (
          <SgSegmentDigit key={index} value={value} size={36} />
        ))}
      </div>
      <SgButton size="sm" onClick={() => setSeconds((prev) => prev + 1)}>+1 second</SgButton>
    </div>
  );
}
```

## SgSevenSegmentDigit

### Básico com troca de paleta

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/basico-0-9.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");
  const [palette, setPalette] = React.useState<"red" | "blue" | "yellow" | "green" | "white">("red");
  const palettes: typeof palette[] = ["red", "blue", "yellow", "green", "white"];

  return (
    <div className="flex items-center gap-4">
      <SgSevenSegmentDigit value={digit} palette={palette} />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>Next (+1)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>Previous (-1)</SgButton>
        <div className="flex flex-wrap gap-2">
          {palettes.map((item) => (
            <SgButton key={item} size="sm" appearance={palette === item ? "solid" : "outline"} onClick={() => setPalette(item)}>{item}</SgButton>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Paletas lado a lado

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/temas-de-cor.tsx.sample`

```tsx
"use client";

import { SgGrid, SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 5 }} gap={12}>
      <SgSevenSegmentDigit value="8" palette="red" />
      <SgSevenSegmentDigit value="8" palette="blue" />
      <SgSevenSegmentDigit value="8" palette="yellow" />
      <SgSevenSegmentDigit value="8" palette="green" />
      <SgSevenSegmentDigit value="8" palette="white" />
    </SgGrid>
  );
}
```
