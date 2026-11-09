---
tags: [seedgrid, front, component, digits]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/digits
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Dígitos animados, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — dígitos animados — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos|Exemplos — Dígitos animados (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente estão abaixo (React, 8 componentes, 65 exemplos), na ordem e com os títulos da página dele em pt-BR (`/components/<slug>`). Cada bloco é cópia 1:1 do arquivo `samples/*.tsx.sample` do exemplo, indicado em `Fonte:` (caminho relativo à raiz do repositório `seedgrid-fe-components`), e é o mesmo código que o showcase renderiza e mostra no bloco de código. Conferência de 2026-11-09 (seedgrid-fe-components 0f304bb): os blocos foram regerados por script a partir dos `.sample` e comparados texto a texto (idênticos). Não foram compilados nem executados no navegador nesta conferência. O texto abaixo de cada título é a descrição que a página mostra (i18n pt-BR do showcase; alguns trechos ainda estão em inglês). A seção Playground de cada página não tem `.sample` e fica de fora. As classes utilitárias (`flex`, `gap-4`…) são Tailwind do app de exemplo. Os tipos e props usados estão descritos em [[SeedGrid/SeedGrid-components/digits/API|API]].

## SgDiscardDigit

Página: `digits/sg-discard-digit/page.tsx` (11 exemplo(s) com código na página; abaixo 11).

### 1) Básico

Click Next to add one card and Previous to remove one card.

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

### 2) Folhas sequenciais

Cada clique descarta uma folha e revela a seguinte.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/folhas-sequenciais.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

const PAGES = ["001", "002", "003", "004", "005"] as const;

export default function Example() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="space-y-3">
      <SgDiscardDigit value={PAGES[index] ?? PAGES[0]} color="#111827" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#fffef7" fontSize={58} />
      <SgButton size="sm" onClick={() => setIndex((prev) => (prev + 1) % PAGES.length)}>Descartar folha</SgButton>
    </div>
  );
}
```

### 3) Variações de papel

Examples with different color + backgroundColor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/variacoes-de-papel.tsx.sample`

```tsx
"use client";

import { SgGrid, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgDiscardDigit value="7" color="#0f172a" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#f8fafc" />
      <SgDiscardDigit value="7" color="#4a2d13" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#fff4d6" />
      <SgDiscardDigit value="7" color="#0b2f50" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#e7f5ff" />
    </SgGrid>
  );
}
```

### 4) Fontes

Comparacao de fontes no mesmo efeito de pilha.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/fontes.tsx.sample`

```tsx
"use client";

import { SgGrid, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={12}>
      <SgDiscardDigit value="42" color="#0f172a" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#f8fafc" fontSize={60} />
      <SgDiscardDigit value="42" color="#1f2937" font={'"Merriweather", "Times New Roman", serif'} backgroundColor="#fffef7" fontSize={60} />
    </SgGrid>
  );
}
```

### 5) Descarte automático

Atualizacao continua para observar a direcao aleatoria da folha descartada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/auto-descarte.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [running, setRunning] = React.useState(false);
  const [counter, setCounter] = React.useState("00");

  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setCounter((prev) => String((Number(prev) + 1) % 100).padStart(2, "0"));
    }, 800);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="space-y-3">
      <SgDiscardDigit value={counter} color="#0f172a" font={'"Inter", "Segoe UI", sans-serif'} backgroundColor="#f8fafc" fontSize={58} />
      <div className="flex gap-2">
        <SgButton size="sm" onClick={() => setRunning(true)}>Iniciar</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setRunning(false)}>Parar</SgButton>
      </div>
    </div>
  );
}
```

### 6) Paginação imperativa (ref)

totalNumberPages define o total de folhas. O ref expoe increasePage(), decreasePage() e page().

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
          <SgButton size="sm" enabled={!(page <= 1)} onClick={() => { ref.current?.decreasePage(); setPage((prev) => Math.max(1, prev - 1)); }}>Previous</SgButton>
          <SgButton size="sm" enabled={!(page >= TOTAL_PAGES)} onClick={() => { ref.current?.increasePage(); setPage((prev) => Math.min(TOTAL_PAGES, prev + 1)); }}>Proxima</SgButton>
        </div>
      </div>
    </div>
  );
}
```

### 7) Descarte (padrão)

A folha de cima voa para fora em 640 ms e o valor novo aparece embaixo. O movimento é sorteado a cada troca.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/descarte-padrao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [n, setN] = React.useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgDiscardDigit value={String(n)} />
      <SgButton onClick={() => setN((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

### 8) Entrando por baixo

changeAnimationMode: incoming — a folha nova sobe por baixo e o topo só muda no fim.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/entrando-por-baixo.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [n, setN] = React.useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgDiscardDigit value={String(n)} changeAnimationMode="incoming" />
      <SgButton onClick={() => setN((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

### 9) Páginas de um monte

totalNumberPages faz a pilha encolher a cada increasePage(); decreasePage() traz a folha de volta por baixo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/paginas-de-um-monte.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgDiscardDigit, type SgDiscardDigitHandle } from "@seedgrid/fe-components";

export default function Example() {
  const montoRef = React.useRef<SgDiscardDigitHandle>(null);
  const [montoPagina, setMontoPagina] = React.useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgDiscardDigit ref={montoRef} value={String(montoPagina)} totalNumberPages={8} stackDepth={8} />
      <div>
        <p>Página {montoPagina} de 8</p>
        <div className="mt-2 flex flex-wrap gap-4">
          <SgButton
            severity="secondary"
            onClick={() => {
              montoRef.current?.decreasePage();
              setMontoPagina((p) => Math.max(1, p - 1));
            }}
          >
            Anterior
          </SgButton>
          <SgButton
            onClick={() => {
              montoRef.current?.increasePage();
              setMontoPagina((p) => Math.min(8, p + 1));
            }}
          >
            Próxima
          </SgButton>
        </div>
      </div>
    </div>
  );
}
```

### 10) Sem animação

animateOnChange: false troca o valor na hora.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/sem-animacao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [n, setN] = React.useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgDiscardDigit value={String(n)} animateOnChange={false} />
      <SgButton onClick={() => setN((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

### 11) Aparência

Cores em texto CSS, peso da fonte, tamanho e duração da transição.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-discard-digit/samples/aparencia.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgDiscardDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [n, setN] = React.useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgDiscardDigit value={String(n)} fontSize={48} color="#7c2d12" backgroundColor="#ffedd5" fontWeight="bold" transitionMs={900} stackDepth={10} />
      <SgButton onClick={() => setN((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

## SgFadeDigit

Página: `digits/sg-fade-digit/page.tsx` (9 exemplo(s) com código na página; abaixo 9).

### Básico (0-9)

Troca manual entre digitos numericos.

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

### Letras (A-Z)

Aceita qualquer caractere - letras, simbolos, espacos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/letras-a-z.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgFadeDigit } from "@seedgrid/fe-components";

const ALPHA = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export default function Example() {
  const [letter, setLetter] = React.useState("A");

  return (
    <div className="flex items-center gap-4">
      <SgFadeDigit value={letter} />
      <SgButton
        size="sm"
        onClick={() => {
          const index = ALPHA.indexOf(letter);
          setLetter(ALPHA[(index + 1) % ALPHA.length] ?? "A");
        }}
      >
        Proxima letra
      </SgButton>
    </div>
  );
}
```

### Cores personalizadas

color e backgroundColor sao totalmente livres - qualquer paleta funciona.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/cores-customizadas.tsx.sample`

```tsx
"use client";

import { SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgFadeDigit value="7" color="#edebeb" backgroundColor="#333232" />
      <SgFadeDigit value="7" color="#4ade80" backgroundColor="#052e16" />
      <SgFadeDigit value="7" color="#60a5fa" backgroundColor="#0f172a" />
      <SgFadeDigit value="7" color="#f472b6" backgroundColor="#2d0a1e" />
      <SgFadeDigit value="7" color="#fbbf24" backgroundColor="#1c1007" />
    </div>
  );
}
```

### Incremento automático

Incremento automatico para validar transicoes continuas e rapidas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/auto-increment.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setDigit((prev) => String((Number(prev) + 1) % 10));
    }, 600);
    return () => window.clearInterval(id);
  }, []);

  return <SgFadeDigit value={digit} color="#22d3ee" backgroundColor="#082f49" />;
}
```

### Sequência estilo relógio

Composicao de varios SgFadeDigit em linha - cada digito atualiza de forma independente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/sequencia-estilo-relogio.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgFadeDigit } from "@seedgrid/fe-components";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Example() {
  const [time, setTime] = React.useState(() => ({ h: 12, m: 34, s: 56 }));

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTime((prev) => {
        const total = (prev.h * 3600 + prev.m * 60 + prev.s + 1) % 86400;
        return {
          h: Math.floor(total / 3600),
          m: Math.floor((total % 3600) / 60),
          s: total % 60
        };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {pad(time.h).split("").map((value, index) => <SgFadeDigit key={`h-${index}`} value={value} fontSize={40} />)}
      <span className="text-2xl font-bold">:</span>
      {pad(time.m).split("").map((value, index) => <SgFadeDigit key={`m-${index}`} value={value} fontSize={40} />)}
      <span className="text-2xl font-bold">:</span>
      {pad(time.s).split("").map((value, index) => <SgFadeDigit key={`s-${index}`} value={value} fontSize={40} />)}
    </div>
  );
}
```

### Tamanhos

Scale adjustment via fontSize prop - card width and height are proportional.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/tamanhos.tsx.sample`

```tsx
"use client";

import { SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex items-end gap-4">
      <SgFadeDigit value="5" fontSize={18} />
      <SgFadeDigit value="5" fontSize={36} />
      <SgFadeDigit value="5" fontSize={60} />
    </div>
  );
}
```

### Cartão com fade

O cartão tem as mesmas proporções do SgFlipDigit: 88% x 138% do fontSize.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/cartao-com-fade.tsx.sample`

```tsx
"use client";

import { SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <SgFadeDigit value="1" />
      <SgFadeDigit value="4" />
      <SgFadeDigit value="0" />
      <SgFadeDigit value="7" />
    </div>
  );
}
```

### Cores e tamanhos

color, backgroundColor, fontSize e font.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/cores-e-tamanhos.tsx.sample`

```tsx
"use client";

import { SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <SgFadeDigit value="2" color="#111827" backgroundColor="#fde68a" />
      <SgFadeDigit value="9" fontSize={40} color="#22c55e" backgroundColor="#052e16" />
      <SgFadeDigit value="0" fontSize={100} />
      <SgFadeDigit value="1" fontSize={24} font="monospace" />
    </div>
  );
}
```

### Troca de valor

O dígito atual apaga (200 ms), o novo entra invisível e acende (200 ms).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-fade-digit/samples/troca-de-valor.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgFadeDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [valor, setValor] = React.useState(0);

  return (
    <div className="flex items-center gap-6">
      <SgFadeDigit value={String(valor)} />
      <SgButton onClick={() => setValor((v) => (v + 1) % 10)}>Próximo</SgButton>
    </div>
  );
}
```

## SgFlipDigit

Página: `digits/sg-flip-digit/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### Básico (0-9)

Incremento, decremento e valor aleatorio.

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

### Letras (A-Z)

Tambem aceita caracteres alfabeticos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/letras-a-z.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [letter, setLetter] = React.useState("A");
  const nextLetter = () => {
    const current = letter.charCodeAt(0);
    const next = current >= 90 ? 65 : current + 1;
    setLetter(String.fromCharCode(next));
  };

  return (
    <div className="flex items-center gap-4">
      <SgFlipDigit value={letter} />
      <SgButton onClick={nextLetter} size="sm">Proxima letra</SgButton>
    </div>
  );
}
```

### Variações de tamanho

Ajuste de width, height e fontSize.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/variacoes-de-tamanho.tsx.sample`

```tsx
import * as React from "react";
import { SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const digit = "5";

  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className="mb-2 text-xs text-muted-foreground">Small</p>
        <SgFlipDigit value={digit} width={50} height={75} fontSize={45} />
      </div>
      <div className="text-center">
        <p className="mb-2 text-xs text-muted-foreground">Medium</p>
        <SgFlipDigit value={digit} />
      </div>
      <div className="text-center">
        <p className="mb-2 text-xs text-muted-foreground">Large</p>
        <SgFlipDigit value={digit} width={120} height={180} fontSize={120} />
      </div>
    </div>
  );
}
```

### Sequência estilo relógio

Composition of multiple SgFlipDigit in a row.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/sequencia-estilo-relogio.tsx.sample`

```tsx
import * as React from "react";
import { SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const digit = "2";

  return (
    <div className="flex items-center gap-2">
      <SgFlipDigit value={digit} />
      <SgFlipDigit value={String((Number(digit) + 1) % 10)} />
      <span className="mx-2 text-4xl font-bold">:</span>
      <SgFlipDigit value={String((Number(digit) + 2) % 10)} />
      <SgFlipDigit value={String((Number(digit) + 3) % 10)} />
    </div>
  );
}
```

### Incremento automático

Atualizacao automatica para validar transicao continua.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/auto-increment.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [running, setRunning] = React.useState(false);
  const [autoDigit, setAutoDigit] = React.useState("0");

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setAutoDigit((prev) => String((Number(prev) + 1) % 10));
    }, 1300);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <div className="flex items-center gap-4">
      <SgFlipDigit value={autoDigit} />
      <SgButton onClick={() => setRunning((prev) => !prev)}>{running ? "Parar" : "Iniciar"}</SgButton>
    </div>
  );
}
```

### Contador

Cada troca de valor vira uma carta que gira em 800 ms com ease-out-bounce (o padrão do @pqina/flip).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/contador.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [counter, setCounter] = React.useState(0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgFlipDigit value={String(counter % 10)} fontSize={56} />
      <SgButton size="sm" onClick={() => setCounter((v) => v + 1)}>+1</SgButton>
      <SgButton size="sm" severity="secondary" onClick={() => setCounter(0)}>Zerar</SgButton>
    </div>
  );
}
```

### Tamanhos

fontSize controla a escala do conjunto: as medidas vêm de múltiplos dele.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/tamanhos-fontsize.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [counter, setCounter] = React.useState(0);

  return (
    <div className="flex flex-wrap items-end gap-6">
      <SgFlipDigit value={String(counter % 10)} fontSize={28} />
      <SgFlipDigit value={String(counter % 10)} fontSize={48} />
      <SgFlipDigit value={String(counter % 10)} fontSize={72} />
    </div>
  );
}
```

### Vários dígitos

Um dígito por caractere, como num relógio de cartas. Só gira quem mudou.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-flip-digit/samples/varios-digitos.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgFlipDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [clockValue, setClockValue] = React.useState(1234);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {String(clockValue).padStart(4, "0").split("").map((ch, index) => (
        <SgFlipDigit key={index} value={ch} fontSize={44} />
      ))}
      <SgButton size="sm" onClick={() => setClockValue((v) => (v + 111) % 10000)}>Somar 111</SgButton>
    </div>
  );
}
```

## SgMatrixDigit

Página: `digits/sg-matrix-digit/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### 1) Básico (0-9)

Troca de digitos com botoes de controle.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/basico-0-9.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  return (
    <div className="flex items-center gap-4">
      <SgMatrixDigit value={digit} color="#22d3ee" backgroundColor="#0b1220" />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>Next (+1)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>Previous (-1)</SgButton>
        <SgButton size="sm" severity="info" onClick={() => setDigit(String(Math.floor(Math.random() * 10)))}>Random</SgButton>
      </div>
    </div>
  );
}
```

### 2) Texto matricial

Exibicao de texto com letras, numeros e simbolos.

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

### 3) Variações de color/backgroundColor

Visual theme examples.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/variacoes-de-color-backgroundcolor.tsx.sample`

```tsx
"use client";

import { SgGrid, SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgMatrixDigit value="2026" color="#22d3ee" backgroundColor="#0b1220" />
      <SgMatrixDigit value="HELLO" color="#a3e635" backgroundColor="#05070b" />
      <SgMatrixDigit value="SG" color="#fb923c" backgroundColor="#101826" />
    </SgGrid>
  );
}
```

### 4) Escala da matriz

Ajuste de dotSize, gap e charGap.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/escala-da-matriz.tsx.sample`

```tsx
"use client";

import { SgGrid, SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgMatrixDigit value="123" dotSize={6} gap={2} charGap={4} />
      <SgMatrixDigit value="123" dotSize={9} gap={3} charGap={7} />
      <SgMatrixDigit value="123" dotSize={13} gap={4} charGap={10} />
    </SgGrid>
  );
}
```

### 5) Texto em matriz de pontos

Letras, números e símbolos comuns em grade 5 x 7; minúsculas viram maiúsculas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/texto-em-matriz-de-pontos.tsx.sample`

```tsx
"use client";

import { SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgMatrixDigit value="Seed Grid 2026" />
  );
}
```

### 6) Cores e brilho

color, offColor e backgroundColor; glow desliga o brilho dos pontos acesos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/cores-e-brilho.tsx.sample`

```tsx
"use client";

import { SgGrid, SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgMatrixDigit
        value="12:34"
        color="#22c55e"
        backgroundColor="#04120a"
        offColor="rgba(34, 197, 94, 0.15)"
      />
      <SgMatrixDigit
        value="OK"
        color="#f97316"
        backgroundColor="#1a0b02"
        offColor="rgba(249, 115, 22, 0.15)"
      />
      <SgMatrixDigit value="OFF" glow={false} />
    </SgGrid>
  );
}
```

### 7) Medidas

dotSize, gap, charGap, padding e rounded em pixels.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/medidas.tsx.sample`

```tsx
"use client";

import { SgGrid, SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 4 }} gap={12}>
      <SgMatrixDigit value="AB" dotSize={5} gap={1} charGap={4} />
      <SgMatrixDigit value="AB" />
      <SgMatrixDigit value="AB" dotSize={13} gap={4} charGap={12} padding={14} rounded={24} />
      <SgMatrixDigit value="AB" gap={0} padding={0} rounded={0} />
    </SgGrid>
  );
}
```

### 8) Símbolos e caractere desconhecido

Pontuação comum tem glifo; qualquer outro caractere usa o glifo de reserva.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-matrix-digit/samples/simbolos-e-caractere-desconhecido.tsx.sample`

```tsx
"use client";

import { SgMatrixDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgMatrixDigit value="-_.:/?! @#" />
  );
}
```

## SgNeonDigit

Página: `digits/sg-neon-digit/page.tsx` (9 exemplo(s) com código na página; abaixo 9).

### 1) Básico

Controle simples de digito em estilo neon.

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

### 2) Texto em neon

Troca de palavras com o mesmo componente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/texto-em-neon.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgNeonDigit } from "@seedgrid/fe-components";

const WORDS = ["teste", "seedgrid", "your text"] as const;

export default function Example() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="space-y-3">
      <SgNeonDigit value={WORDS[index] ?? WORDS[0]} color="#e2f6ff" backgroundColor="#101934" shadowColor="#47d1ff" />
      <SgButton size="sm" onClick={() => setIndex((prev) => (prev + 1) % WORDS.length)}>Change text</SgButton>
    </div>
  );
}
```

### 3) Neon script (referência visual)

Visual inspirado nas imagens azul e laranja.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/neon-script-referencia-visual.tsx.sample`

```tsx
"use client";

import { SgGrid, SgNeonDigit } from "@seedgrid/fe-components";

const SCRIPT_FONT = "\"Brush Script MT\", \"Segoe Script\", \"Lucida Handwriting\", cursive";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={12}>
      <SgNeonDigit value="Your Text" color="#e4fbff" backgroundColor="#090f22" shadowColor="#47d1ff" font={SCRIPT_FONT} fontWeight={500} fontSize={62} padding={18} shadowStrength={1.25} />
      <SgNeonDigit value="Your Text" color="#fff7e5" backgroundColor="#1c120b" shadowColor="#ffae1a" font={SCRIPT_FONT} fontWeight={500} fontSize={62} padding={18} shadowStrength={1.25} />
    </SgGrid>
  );
}
```

### 4) Variações de color/background/shadow

Themes neon para contextos diferentes.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/variacoes-de-color-background-shadow.tsx.sample`

```tsx
"use client";

import { SgGrid, SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgNeonDigit value="teste" color="#e2f6ff" backgroundColor="#0b1130" shadowColor="#38bdf8" />
      <SgNeonDigit value="teste" color="#f5e9ff" backgroundColor="#170f2b" shadowColor="#a855f7" />
      <SgNeonDigit value="teste" color="#fff7e8" backgroundColor="#2a1a14" shadowColor="#fb923c" />
    </SgGrid>
  );
}
```

### 5) Escala e leitura

Variacao de tamanho para diferentes cenarios.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/escala-e-leitura.tsx.sample`

```tsx
"use client";

import { SgGrid, SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgNeonDigit value="5" fontSize={24} padding={10} />
      <SgNeonDigit value="5" fontSize={44} padding={14} />
      <SgNeonDigit value="5" fontSize={72} padding={18} />
    </SgGrid>
  );
}
```

### 6) Brilho neon

Cinco camadas de brilho no texto e duas no contorno, todas em torno da cor do texto.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/brilho-neon.tsx.sample`

```tsx
"use client";

import { SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <SgNeonDigit value="24" />
      <SgNeonDigit value="59" color="#ff7ad9" shadowColor="#ff00aa" backgroundColor="#1a0612" />
      <SgNeonDigit value="GO" color="#7dd3fc" shadowColor="#0ea5e9" backgroundColor="#04121c" />
    </div>
  );
}
```

### 7) Intensidade, fonte e espaçamento

shadowStrength (mínimo 0,2), fontSize, fontWeight (número ou texto), letterSpacing, padding e rounded.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/intensidade-fonte-e-espacamento.tsx.sample`

```tsx
"use client";

import { SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <SgNeonDigit value="8" shadowStrength={0.3} fontSize={36} />
      <SgNeonDigit value="8" shadowStrength={2} fontSize={36} />
      <SgNeonDigit value="OK" fontWeight="bold" letterSpacing={6} padding={20} rounded={28} />
      <SgNeonDigit value="7" fontWeight={300} fontSize={64} />
    </div>
  );
}
```

### 8) Troca de valor com apagar e acender

Ao trocar o valor, o texto apaga, muda na metade de transitionMs e acende de novo (animateOnChange).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/troca-de-valor-com-apagar-e-acender.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [swapValue, setSwapValue] = React.useState(1);

  return (
    <div className="flex items-center gap-6">
      <SgNeonDigit value={String(swapValue)} transitionMs={400} />
      <SgButton size="sm" onClick={() => setSwapValue((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

### 9) Sem animação

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-neon-digit/samples/sem-animacao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgNeonDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [staticValue, setStaticValue] = React.useState(1);

  return (
    <div className="flex items-center gap-6">
      <SgNeonDigit value={String(staticValue)} animateOnChange={false} />
      <SgButton size="sm" onClick={() => setStaticValue((v) => (v % 9) + 1)}>Próximo</SgButton>
    </div>
  );
}
```

## SgRoller3DDigit

Página: `digits/sg-roller3d-digit/page.tsx` (6 exemplo(s) com código na página; abaixo 6).

### Básico (0-9)

Rola entre digitos simples.

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

### Valor com 2 dígitos

Items customizados: 00 a 59 (minutos/segundos).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/2-digit-padded-value.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgRoller3DDigit } from "@seedgrid/fe-components";

const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export default function Example() {
  const [value, setValue] = React.useState("00");

  return (
    <div className="flex items-center gap-4">
      <SgRoller3DDigit value={value} items={MINUTES} fontSize={22} />
      <SgButton size="sm" onClick={() => setValue((prev) => String((Number(prev) + 1) % 60).padStart(2, "0"))}>
        +1 minuto
      </SgButton>
    </div>
  );
}
```

### Letras (A-Z)

Qualquer conjunto de caracteres pode ser usado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/letras-a-z.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgRoller3DDigit } from "@seedgrid/fe-components";

const ALPHA = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export default function Example() {
  const [letter, setLetter] = React.useState("A");

  return (
    <div className="flex items-center gap-4">
      <SgRoller3DDigit value={letter} items={ALPHA} fontSize={32} />
      <SgButton size="sm" onClick={() => setLetter(ALPHA[(ALPHA.indexOf(letter) + 1) % ALPHA.length] ?? "A")}>
        Proxima letra
      </SgButton>
    </div>
  );
}
```

### Animação de nomes

Composicao de varios SgRoller3DDigit para animar texto - exemplo: "LUCIANO" -> "MARTA".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/animacao-de-nomes.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgRoller3DDigit } from "@seedgrid/fe-components";

const NAMES = ["LUCIANO", "MARTA", "SEEDGRID"];
const ITEMS = [" ", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export default function Example() {
  const [nameIndex, setNameIndex] = React.useState(0);
  const current = (NAMES[nameIndex] ?? "").padEnd(8, " ");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {current.split("").map((value, index) => (
          <SgRoller3DDigit key={index} value={value} items={ITEMS} fontSize={28} transitionMs={110} />
        ))}
      </div>
      <SgButton size="sm" onClick={() => setNameIndex((prev) => (prev + 1) % NAMES.length)}>Animar nome</SgButton>
    </div>
  );
}
```

### Variações de tamanho

Ajuste de escala via prop fontSize.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/variacoes-de-tamanho.tsx.sample`

```tsx
"use client";

import { SgRoller3DDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex items-end gap-4">
      <SgRoller3DDigit value="5" fontSize={16} />
      <SgRoller3DDigit value="5" fontSize={32} />
      <SgRoller3DDigit value="5" fontSize={56} />
    </div>
  );
}
```

### Duração da transição

transitionMs: 150 ms contra 1500 ms, lado a lado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-roller3d-digit/samples/duracao-da-transicao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgRoller3DDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [slowMode, setSlowMode] = React.useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgRoller3DDigit value={slowMode ? "9" : "0"} transitionMs={150} fontSize={28} />
      <SgRoller3DDigit value={slowMode ? "9" : "0"} transitionMs={1500} fontSize={28} />
      <SgButton size="sm" onClick={() => setSlowMode((v) => !v)}>Alternar 0 e 9</SgButton>
    </div>
  );
}
```

## SgSegmentDigit

Página: `digits/sg-segment-digit/page.tsx` (5 exemplo(s) com código na página; abaixo 5).

### 1) Básico (0-9)

Troca manual de digitos com controles.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-segment-digit/samples/basico-0-9.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [digit, setDigit] = React.useState("0");

  return (
    <div className="flex items-center gap-4">
      <SgSegmentDigit value={digit} size={64} />
      <div className="flex flex-col gap-2">
        <SgButton size="sm" onClick={() => setDigit((prev) => String((Number(prev) + 1) % 10))}>Next (+1)</SgButton>
        <SgButton size="sm" severity="secondary" onClick={() => setDigit((prev) => String((Number(prev) - 1 + 10) % 10))}>Previous (-1)</SgButton>
        <SgButton size="sm" severity="info" onClick={() => setDigit(String(Math.floor(Math.random() * 10)))}>Random</SgButton>
      </div>
    </div>
  );
}
```

### 2) Composição estilo relógio

Composicao HH:MM:SS com separador ':' usando o proprio componente.

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

### 3) Tamanhos

Escala visual ajustando apenas a prop size.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-segment-digit/samples/tamanhos.tsx.sample`

```tsx
"use client";

import { SgGrid, SgSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgSegmentDigit value="8" size={18} />
      <SgSegmentDigit value="8" size={32} />
      <SgSegmentDigit value="8" size={52} />
    </SgGrid>
  );
}
```

### 4) Cores

Exemplos de color por digito.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-segment-digit/samples/cores.tsx.sample`

```tsx
"use client";

import { SgGrid, SgSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 5 }} gap={12}>
      <SgSegmentDigit value="8" size={42} />
      <SgSegmentDigit value="8" size={42} color="#3b82f6" />
      <SgSegmentDigit value="8" size={42} color="#eab308" />
      <SgSegmentDigit value="8" size={42} color="#22c55e" />
      <div className="inline-block rounded bg-neutral-900 p-1">
        <SgSegmentDigit value="8" size={42} color="#f8fafc" />
      </div>
    </SgGrid>
  );
}
```

### 5) Algarismos, sinal e dois pontos

Cada glifo é um conjunto de retângulos numa grade de 6 x 10 (dois pontos: 4 x 10).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-segment-digit/samples/algarismos-sinal-e-dois-pontos.tsx.sample`

```tsx
"use client";

import { SgGrid, SgSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 6, md: 12 }} gap={8}>
      {"0123456789-:".split("").map((c) => (
        <SgSegmentDigit key={c} value={c} size={48} />
      ))}
    </SgGrid>
  );
}
```

## SgSevenSegmentDigit

Página: `digits/sg-seven-segment-digit/page.tsx` (9 exemplo(s) com código na página; abaixo 9).

### 1) Básico (0-9)

Troca manual de digitos com controles.

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

### 2) Hexadecimal (0-9 A-F)

Suporte a caracteres comuns de display 7 segmentos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/hexadecimal-0-9-a-f.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgSevenSegmentDigit } from "@seedgrid/fe-components";

const HEX = Array.from("0123456789ABCDEF");

export default function Example() {
  const [index, setIndex] = React.useState(10);

  return (
    <div className="flex items-center gap-4">
      <SgSevenSegmentDigit value={HEX[index] ?? "A"} color="#f97316" backgroundColor="#180b05" offColor="rgba(124,45,18,0.24)" />
      <SgButton size="sm" onClick={() => setIndex((prev) => (prev + 1) % HEX.length)}>Next char</SgButton>
    </div>
  );
}
```

### 3) Temas de cor

Exemplos com paletas red, blue, yellow, green e white.

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

### 4) Tamanho e espessura

Escala do display via size e thickness.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/tamanho-e-espessura.tsx.sample`

```tsx
"use client";

import { SgGrid, SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={12}>
      <SgSevenSegmentDigit value="5" size={72} thickness={10} />
      <SgSevenSegmentDigit value="5" size={108} thickness={14} />
      <SgSevenSegmentDigit value="5" size={148} thickness={18} />
    </SgGrid>
  );
}
```

### 5) Composição estilo relógio

Composicao de varios digitos para HH:MM:SS.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/composicao-estilo-relogio.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgSevenSegmentDigit } from "@seedgrid/fe-components";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function ColonDots() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-1">
      <span className="size-2 rounded-full bg-red-500/80" />
      <span className="size-2 rounded-full bg-red-500/80" />
    </div>
  );
}

export default function Example() {
  const [seconds, setSeconds] = React.useState(0);
  const total = seconds % 86400;
  const hh = pad(Math.floor(total / 3600));
  const mm = pad(Math.floor((total % 3600) / 60));
  const ss = pad(total % 60);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {hh.split("").map((value, index) => <SgSevenSegmentDigit key={`h-${index}`} value={value} size={86} />)}
        <ColonDots />
        {mm.split("").map((value, index) => <SgSevenSegmentDigit key={`m-${index}`} value={value} size={86} />)}
        <ColonDots />
        {ss.split("").map((value, index) => <SgSevenSegmentDigit key={`s-${index}`} value={value} size={86} />)}
      </div>
      <SgButton size="sm" onClick={() => setSeconds((prev) => prev + 1)}>+1 second</SgButton>
    </div>
  );
}
```

### 6) Algarismos e letras

Cada caractere acende os segmentos da tabela do display; sem glifo, apaga tudo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/algarismos-e-letras.tsx.sample`

```tsx
"use client";

import { SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      {"0123456789-AbCdEFHJLPUY".split("").map((c) => (
        <SgSevenSegmentDigit key={c} value={c} size={72} thickness={8} padding={8} />
      ))}
    </div>
  );
}
```

### 7) Paletas

red (padrão), blue, yellow, green e white; color, backgroundColor e offColor vencem a paleta.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/paletas.tsx.sample`

```tsx
"use client";

import { SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      {(["red", "blue", "yellow", "green", "white"] as const).map((p) => (
        <SgSevenSegmentDigit key={p} value="8" palette={p} size={72} thickness={8} padding={8} />
      ))}
      <SgSevenSegmentDigit
        value="8"
        size={72}
        thickness={8}
        padding={8}
        color="#ff00aa"
        offColor="rgba(255, 0, 170, 0.15)"
        backgroundColor="#14000d"
      />
    </div>
  );
}
```

### 8) Tamanho, espessura, inclinação e brilho

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/tamanho-espessura-inclinacao-e-brilho.tsx.sample`

```tsx
"use client";

import { SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <SgSevenSegmentDigit value="4" size={48} thickness={5} />
      <SgSevenSegmentDigit value="2" size={108} />
      <SgSevenSegmentDigit value="7" size={108} thickness={8} width={80} />
      <SgSevenSegmentDigit value="5" size={108} thickness={8} skew={0} rounded={0} />
      <SgSevenSegmentDigit value="3" size={108} thickness={8} skew={15} glow={false} />
    </div>
  );
}
```

### 9) Contador com transição

Ao trocar o valor, cada segmento acende e apaga em transitionMs (200 ms aqui).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/digits/sg-seven-segment-digit/samples/contador-com-transicao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgSevenSegmentDigit } from "@seedgrid/fe-components";

export default function Example() {
  const [contador, setContador] = React.useState(0);

  return (
    <div className="flex items-center gap-4">
      <SgSevenSegmentDigit value={String(contador)} size={72} thickness={8} padding={8} transitionMs={200} />
      <SgButton onClick={() => setContador((v) => (v + 1) % 10)}>Próximo</SgButton>
    </div>
  );
}
```
