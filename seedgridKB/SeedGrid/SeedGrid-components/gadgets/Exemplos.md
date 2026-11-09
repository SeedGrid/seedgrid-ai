---
tags: [seedgrid, front, component, gadgets]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Gadgets (relógio, calendário, gauges, QR), validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — gadgets — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos|Exemplos — Gadgets (relógio, calendário, gauges, QR) (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente, na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` correspondente (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` de cada bloco aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles texto a texto; **não foram compilados nesta rodada**. Classes utilitárias (`flex`, `gap-3` etc.) são Tailwind do app de exemplo. O Playground de cada página é interativo e não tem `.sample`, por isso não aparece aqui.

API: [[SeedGrid/SeedGrid-components/gadgets/API|API dos gadgets]] · Visão geral: [[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets — visão geral]]. Rotas do showcase: `/components/gadgets/*`, `/components/providers/*` e `/components/hooks/*`.

## SgCalendar

### Básico (mês atual)

Configuracao inicial com data selecionada e persistencia de posicao no card.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/basico-mes-atual.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCalendar
      locale="pt-BR"
      defaultValue="2026-03-10"
      defaultViewDate="2026-03-01"
      cardTitle="Calendario base"
      cardProps={{ id: "showcase-calendar-basic", dragPersistKey: "showcase-calendar-basic" }}
    />
  );
}
```

### Selecionado controlado + limite de datas

Controle externo de valor, bloqueio de finais de semana e limite minimo/maximo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/selecionado-controlado-limite-de-datas.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  const [selected, setSelected] = React.useState(new Date(2026, 2, 10));
  const minDate = React.useMemo(() => new Date(2026, 2, 5), []);
  const maxDate = React.useMemo(() => new Date(2026, 2, 25), []);

  return (
    <div className="space-y-2">
      <SgCalendar
        value={selected}
        onValueChange={setSelected}
        locale="pt-BR"
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
        cardTitle="Agenda de visitas"
        cardProps={{ id: "showcase-calendar-range", dragPersistKey: "showcase-calendar-range" }}
      />
      <p className="text-sm text-muted-foreground">
        Selecionado: {selected.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
      </p>
    </div>
  );
}
```

### Locale + múltiplos meses

Alterna locale, primeiro dia da semana e quantidade de meses (numberOfMonths, monthsPerLine=3).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/locale-multiplos-meses.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgCalendar, SgGrid } from "@seedgrid/fe-components";

export default function Example() {
  const [locale, setLocale] = React.useState<"pt-BR" | "en-US" | "es">("pt-BR");
  const [weekStartsOn, setWeekStartsOn] = React.useState<0 | 1>(0);
  const [numberOfMonths, setNumberOfMonths] = React.useState(6);

  return (
    <div className="space-y-3">
      <SgGrid columns={{ base: 2, md: 5 }} gap={8}>
        <SgButton appearance={locale === "pt-BR" ? "solid" : "outline"} onClick={() => setLocale("pt-BR")}>pt-BR</SgButton>
        <SgButton appearance={locale === "en-US" ? "solid" : "outline"} onClick={() => setLocale("en-US")}>en-US</SgButton>
        <SgButton appearance={locale === "es" ? "solid" : "outline"} onClick={() => setLocale("es")}>es</SgButton>
        <SgButton appearance={weekStartsOn === 0 ? "solid" : "outline"} onClick={() => setWeekStartsOn(0)}>Sunday first</SgButton>
        <SgButton appearance={weekStartsOn === 1 ? "solid" : "outline"} onClick={() => setWeekStartsOn(1)}>Monday first</SgButton>
      </SgGrid>

      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton appearance={numberOfMonths === 1 ? "solid" : "outline"} onClick={() => setNumberOfMonths(1)}>1 month</SgButton>
        <SgButton appearance={numberOfMonths === 3 ? "solid" : "outline"} onClick={() => setNumberOfMonths(3)}>3 months</SgButton>
        <SgButton appearance={numberOfMonths === 6 ? "solid" : "outline"} onClick={() => setNumberOfMonths(6)}>6 months</SgButton>
        <SgButton appearance={numberOfMonths === 12 ? "solid" : "outline"} onClick={() => setNumberOfMonths(12)}>12 months</SgButton>
      </SgGrid>

      <SgCalendar
        locale={locale}
        weekStartsOn={weekStartsOn}
        numberOfMonths={numberOfMonths}
        monthsPerLine={3}
        defaultValue="2026-03-10"
        defaultViewDate="2026-03-01"
        cardTitle="Calendar i18n + multi month"
        cardProps={{ id: "showcase-calendar-i18n", dragPersistKey: "showcase-calendar-i18n" }}
      />
    </div>
  );
}
```

### Desabilitado (enabled)

Com enabled={false} os dias e os botões de mês e de hoje ficam desabilitados; a data e o mês atuais continuam legíveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/desabilitado-enabled.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function App() {
  return <SgCalendar defaultValue="2026-11-10" defaultViewDate="2026-11-01" enabled={false} />;
}
```

### Básico

Calendário mensal em pt-BR, com o dia de hoje marcado e o atalho para voltar a ele.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/basico.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCalendar onValueChange={(data) => console.log("Escolheu", data)} />
  );
}
```

### Idioma e início da semana

O locale muda os nomes; weekStartsOn escolhe o primeiro dia (0 = domingo, 1 = segunda); weekdayFormat: narrow, short ou long.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/idioma-e-inicio-da-semana.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCalendar locale="en-US" weekStartsOn={1} weekdayFormat="short" defaultValue="2026-07-04" />
  );
}
```

### Limites e dias bloqueados

minDate e maxDate são inclusivos; isDateDisabled bloqueia o que quiser (aqui, fins de semana).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/limites-e-dias-bloqueados.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCalendar
      defaultValue="2026-03-16"
      minDate="2026-03-10"
      maxDate="2026-03-27"
      isDateDisabled={(data) => data.getDay() === 0 || data.getDay() === 6}
    />
  );
}
```

### Vários meses

numberOfMonths mostra de 1 a 12 meses; monthsPerLine define quantos por linha; showAdjacentMonths: false esconde os dias dos meses vizinhos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/varios-meses.tsx.sample`

```tsx
"use client";

import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCalendar numberOfMonths={3} monthsPerLine={2} showAdjacentMonths={false} defaultViewDate="2026-03-01" />
  );
}
```

### Controlado

value e viewDate vêm do estado do pai; o calendário só avisa, e quem muda é você.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-calendar/samples/controlado.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgCalendar } from "@seedgrid/fe-components";

export default function Example() {
  const [escolhida, setEscolhida] = React.useState(new Date(2026, 2, 18));
  const [mes, setMes] = React.useState(new Date(2026, 2, 1));

  return (
    <div className="space-y-2">
      <SgCalendar
        value={escolhida}
        viewDate={mes}
        onValueChange={setEscolhida}
        onViewDateChange={setMes}
      />
      <p className="text-sm text-muted-foreground">
        Escolhida: {escolhida.getDate()}/{escolhida.getMonth() + 1}/{escolhida.getFullYear()}
      </p>
    </div>
  );
}
```

## SgClock

O `digitalStyle` aceita também `custom`: com ele, a prop `digitBuilder` recebe as partes do relógio (`SgClockDigitalParts`: `hour`, `minute`, `second`, `dayPeriod`, `is12h`, `showSeconds`, `size`, `text`, `textWithPeriod`, `sizePx`) e devolve o desenho completo (veja «Desenho do dígito próprio (digitBuilder)»). `registerSgClockDigitalStyle` existe só no Flutter.

### Analógico

Seletor de tema com segundos step/smooth.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/analogico.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock, SgClockThemePicker } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [themeId, setThemeId] = React.useState("seedgrid");
  const [secondMode, setSecondMode] = React.useState<"step" | "smooth">("step");
  const [showSeconds, setShowSeconds] = React.useState(true);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <SgClockThemePicker value={themeId} onChange={setThemeId} label="Tema" />
        <div className="flex flex-wrap gap-2">
          <SgButton onClick={() => setSecondMode((value) => (value === "step" ? "smooth" : "step"))}>
            {secondMode === "step" ? "Segundo em salto" : "Segundo suave"}
          </SgButton>
          <SgButton onClick={() => setShowSeconds((value) => !value)}>
            {showSeconds ? "Segundos ligados" : "Segundos desligados"}
          </SgButton>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
        <SgClock
          clockStyle="analog"
          size={320}
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          themeId={themeId}
          showSeconds={showSeconds}
          secondHandMode={secondMode}
          timezone="America/Sao_Paulo"
        />
      </div>
    </div>
  );
}
```

### Tema inline (sem provider)

Passe um objeto de tema direto no SgClock.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/tema-inline-sem-provider.tsx.sample`

```tsx
import React from "react";
import { SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
      <SgClock
        clockStyle="analog"
        size={260}
        initialServerTime={props.initialServerTime ?? new Date().toISOString()}
        showSeconds
        secondHandMode="smooth"
        theme={{
          id: "inline-theme",
          label: "Inline Theme",
          render: () => (
            <>
              <circle cx="50" cy="50" r="48" className="fill-white dark:fill-neutral-950" />
              <circle cx="50" cy="50" r="47" className="fill-none stroke-neutral-300 dark:stroke-neutral-700" />
              <circle cx="50" cy="50" r="38" className="fill-none stroke-neutral-200 dark:stroke-neutral-800" />
              <circle cx="50" cy="50" r="6" className="fill-neutral-100 dark:fill-neutral-900" />
              <text x="50" y="56" textAnchor="middle" className="fill-neutral-400 text-[8px] font-semibold">
                SeedGrid
              </text>
            </>
          ),
        }}
      />
    </div>
  );
}
```

### Digital

Presets de tamanho com locale/timezone.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/digital.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>
          {format}
        </SgButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SgClock
          clockStyle="digital"
          size="sm"
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          timezone="America/Sao_Paulo"
          format={format}
          digitalStyle="default"
        />
        <SgClock
          clockStyle="digital"
          size="md"
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          timezone="America/Sao_Paulo"
          format={format}
          digitalStyle="default"
        />
        <SgClock
          clockStyle="digital"
          size="lg"
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          timezone="America/Sao_Paulo"
          format={format}
          digitalStyle="default"
        />
      </div>
    </>
  );
}
```

### Roller 3D

Rolos 3D com AM/PM opcional e segundos sob demanda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/roller-3d.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("12h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>
          {format}
        </SgButton>
      </div>

      <SgClock
        clockStyle="digital"
        digitalStyle="roller3d"
        size="lg"
        initialServerTime={props.initialServerTime ?? new Date().toISOString()}
        timezone="America/Sao_Paulo"
        format={format}
        showSeconds={showSeconds}
        style={{ borderRadius: 12, padding: 12, backgroundColor: "rgba(15, 23, 42, 0.04)" }}
      />
    </div>
  );
}
```

### Flip

Flip clock em duas folhas, com segundos e 12/24h.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/flip.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>
          {format}
        </SgButton>
      </div>

      <SgClock
        clockStyle="digital"
        digitalStyle="flip"
        size="lg"
        initialServerTime={props.initialServerTime ?? new Date().toISOString()}
        timezone="America/Sao_Paulo"
        format={format}
        showSeconds={showSeconds}
      />
    </div>
  );
}
```

### Segment

Estilo segmentado com leitura limpa.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/segment.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-center">
          <SgClock
            clockStyle="digital"
            digitalStyle="segment"
            size="md"
            initialServerTime={props.initialServerTime ?? new Date().toISOString()}
            timezone="America/Sao_Paulo"
            format={format}
            showSeconds={showSeconds}
          />
        </div>
      </div>
    </div>
  );
}
```

### Seven Segment

Dígitos de sete segmentos com visual retrô.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/seven-segment.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-center overflow-hidden rounded-lg py-2">
          <SgClock
            clockStyle="digital"
            digitalStyle="sevenSegment"
            size="sm"
            initialServerTime={props.initialServerTime ?? new Date().toISOString()}
            timezone="America/Sao_Paulo"
            format={format}
            showSeconds={showSeconds}
          />
        </div>
      </div>
    </div>
  );
}
```

### Fade

Transição suave entre os dígitos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/fade.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-center">
          <SgClock
            clockStyle="digital"
            digitalStyle="fade"
            size="md"
            initialServerTime={props.initialServerTime ?? new Date().toISOString()}
            timezone="America/Sao_Paulo"
            format={format}
            showSeconds={showSeconds}
          />
        </div>
      </div>
    </div>
  );
}
```

### Matrix

Estilo matriz de pontos para alta densidade visual.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/matrix.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");
  const scale = showSeconds ? (format === "12h" ? 0.84 : 0.9) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-center overflow-hidden rounded-lg py-2">
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
            <SgClock
              clockStyle="digital"
              digitalStyle="matrix"
              size="sm"
              initialServerTime={props.initialServerTime ?? new Date().toISOString()}
              timezone="America/Sao_Paulo"
              format={format}
              showSeconds={showSeconds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Neon

Tema com brilho de painel neon.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/neon.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-center">
          <SgClock
            clockStyle="digital"
            digitalStyle="neon"
            size="md"
            initialServerTime={props.initialServerTime ?? new Date().toISOString()}
            timezone="America/Sao_Paulo"
            format={format}
            showSeconds={showSeconds}
          />
        </div>
      </div>
    </div>
  );
}
```

### Discard

Cartões empilhados com virada de dígito.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/discard.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [showSeconds, setShowSeconds] = React.useState(true);
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");
  const scale =
    showSeconds ? (format === "12h" ? 0.98 : 1.05) : format === "12h" ? 1.14 : 1.22;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => setShowSeconds((value) => !value)}>
          {showSeconds ? "Segundos: ON" : "Segundos: OFF"}
        </SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>{format}</SgButton>
      </div>
      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex min-h-[170px] items-center justify-center overflow-visible py-2">
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
            <SgClock
              clockStyle="digital"
              digitalStyle="discard"
              size="lg"
              initialServerTime={props.initialServerTime ?? new Date().toISOString()}
              timezone="America/Sao_Paulo"
              format={format}
              showSeconds={showSeconds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Timezone

Troca rápida de timezone e formato 12h/24h.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/timezone.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  const [timezone, setTimezone] = React.useState("America/Sao_Paulo");
  const [format, setFormat] = React.useState<"12h" | "24h">("24h");

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => setTimezone("America/Sao_Paulo")}>Sao Paulo</SgButton>
        <SgButton onClick={() => setTimezone("Europe/Lisbon")}>Lisboa</SgButton>
        <SgButton onClick={() => setTimezone("America/New_York")}>New York</SgButton>
        <SgButton onClick={() => setTimezone("Asia/Tokyo")}>Tokyo</SgButton>
        <SgButton onClick={() => setFormat((value) => (value === "24h" ? "12h" : "24h"))}>
          {format}
        </SgButton>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SgClock
          clockStyle="digital"
          size="lg"
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          timezone={timezone}
          format={format}
          showSeconds
        />
        <SgClock
          clockStyle="analog"
          size={220}
          initialServerTime={props.initialServerTime ?? new Date().toISOString()}
          themeId="seedgrid"
          timezone={timezone}
          showSeconds={false}
        />
      </div>
    </>
  );
}
```

### Conteúdo no centro e sem segundos

centerOverlay ocupa uma caixa de 30% do relógio no centro; showSeconds: false esconde o ponteiro dos segundos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/conteudo-no-centro.tsx.sample`

```tsx
import { Leaf } from "lucide-react";
import { SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-background p-6">
      <SgClock
        clockStyle="analog"
        size={220}
        initialServerTime={props.initialServerTime ?? new Date().toISOString()}
        themeId="seedgrid"
        showSeconds={false}
        centerOverlay={<Leaf size={20} />}
      />
    </div>
  );
}
```

### Cartão

O relógio vem num SgCard recolhível e arrastável. cardTitle troca o título; cardProps ajusta o cartão.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/cartao.tsx.sample`

```tsx
import { SgClock } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  return (
    <SgClock
      clockStyle="digital"
      initialServerTime={props.initialServerTime ?? new Date().toISOString()}
      timezone="America/Sao_Paulo"
      cardTitle="Hora de Brasília"
      cardProps={{ id: "brasilia", draggable: false, collapsible: false }}
    />
  );
}
```

### Desenho do dígito próprio (digitBuilder)

Com digitalStyle custom, o digitBuilder recebe as partes do relógio e devolve o desenho de cada dígito; sem ele, o relógio cai no estilo default.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock/samples/digit-builder.tsx.sample`

```tsx
import * as React from "react";
import { SgClock, SgStack } from "@seedgrid/fe-components";

export default function Example(props: { initialServerTime?: string }) {
  return (
    <SgClock
      digitalStyle="custom"
      initialServerTime={props.initialServerTime ?? new Date().toISOString()}
      timezone="America/Sao_Paulo"
      digitBuilder={(parts) => (
        <SgStack direction="row" gap={4} align="center">
          {parts.text.split("").map((ch, index) =>
            ch === ":" ? (
              <span key={index} className="text-center">{ch}</span>
            ) : (
              <span
                key={index}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                {ch}
              </span>
            )
          )}
        </SgStack>
      )}
    />
  );
}
```

## SgTimeProvider / useSgTime

Página do showcase: `/components/providers/sg-time-provider`.

### Uso básico

Envolva o app com SgTimeProvider e consuma useSgTime para obter a hora sincronizada com o servidor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-time-provider/samples/uso-basico.tsx.sample`

```tsx
import { SgTimeProvider, useSgTime } from "@seedgrid/fe-components";

function LiveClock() {
  const time = useSgTime();
  const date = new Date(time.nowMs());
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span>
      {pad(date.getHours())}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
    </span>
  );
}

export default function App() {
  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      <LiveClock />
    </SgTimeProvider>
  );
}
```

### Sem provedor (fallback)

useSgTime funciona sem o provider usando Date.now() como fallback. Sem sincronização com o servidor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-time-provider/samples/sem-provedor-fallback.tsx.sample`

```tsx
import { useSgTime } from "@seedgrid/fe-components";

function LiveClock() {
  const time = useSgTime();
  const date = new Date(time.nowMs());
  return <span>{date.toLocaleTimeString()}</span>;
}

export default LiveClock;
```

### Integração com Next.js

Padrão recomendado: inicializar o SgTimeProvider no layout raiz com um timestamp do servidor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-time-provider/samples/integracao-com-nextjs.tsx.sample`

```tsx
import { SgTimeProvider } from "@seedgrid/fe-components";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      {children}
    </SgTimeProvider>
  );
}
```

### Lendo o contexto de tempo

useSgTime devolve serverStartMs, tick e nowMs. O tick sobe a cada segundo e atualiza quem o lê.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-time-provider/samples/contexto-de-tempo.tsx.sample`

```tsx
import { SgTimeProvider, useSgTime } from "@seedgrid/fe-components";

function TimeInfo() {
  const time = useSgTime();
  return (
    <span>
      tick {time.tick}, agora (UTC) {new Date(time.nowMs()).toISOString()}
    </span>
  );
}

export default function App() {
  return (
    <SgTimeProvider initialServerTime="2026-06-15T09:41:07Z">
      <TimeInfo />
    </SgTimeProvider>
  );
}
```

### Hora do servidor diferente da do aparelho

É o uso típico: o servidor manda a hora certa e a tela segue por ela, sem depender do relógio do aparelho.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-time-provider/samples/hora-do-servidor.tsx.sample`

```tsx
import { SgClock, SgTimeProvider } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgTimeProvider initialServerTime="2030-01-01T23:59:55Z">
      <SgClock timezone="UTC" cardTitle="Hora do servidor" />
    </SgTimeProvider>
  );
}
```

Página do showcase: `/components/hooks/use-sg-time`.

### Uso basico

Use nowMs() para obter o timestamp atual e tick para disparar re-renders a cada segundo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-time/samples/uso-basico.tsx.sample`

```tsx
import { SgTimeProvider, useSgTime } from "@seedgrid/fe-components";

function DigitalClock() {
  const time = useSgTime();
  const date = new Date(time.nowMs());
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span>
      {pad(date.getHours())}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
    </span>
  );
}

export default function App() {
  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      <DigitalClock />
    </SgTimeProvider>
  );
}
```

### Sem provider (fallback)

Sem SgTimeProvider, o hook usa Date.now() como fallback. Os componentes funcionam mas sem sincronizacao com o servidor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-time/samples/sem-provider-fallback.tsx.sample`

```tsx
import { useSgTime } from "@seedgrid/fe-components";

function Clock() {
  const time = useSgTime();
  return <span>{new Date(time.nowMs()).toLocaleTimeString()}</span>;
}

export default Clock;
```

### Usando tick para re-renders

O tick incrementa a cada segundo. Use-o em arrays de dependencia para disparar efeitos ou valores derivados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/hooks/use-sg-time/samples/usando-tick-para-rerenders.tsx.sample`

```tsx
import { useSgTime } from "@seedgrid/fe-components";

function Uptime() {
  const { tick, serverStartMs } = useSgTime();
  const seconds = Math.floor((Date.now() - serverStartMs) / 1000);

  return <span>uptime: {seconds}s (tick: {tick})</span>;
}

export default Uptime;
```

## SgClockThemeProvider / useSgClockThemeResolver

### Uso básico

Envolva SgClock e SgClockThemePicker com SgClockThemeProvider para compartilhar a resolução de temas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-clock-theme-provider/samples/uso-basico.tsx.sample`

```tsx
import React from "react";
import {
  SgClock,
  SgClockThemePicker,
  SgClockThemeProvider,
  SgTimeProvider,
} from "@seedgrid/fe-components";

export default function App() {
  const [themeId, setThemeId] = React.useState("classic");

  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      <SgClockThemeProvider>
        <SgClock themeId={themeId} />
        <SgClockThemePicker value={themeId} onChange={setThemeId} />
      </SgClockThemeProvider>
    </SgTimeProvider>
  );
}
```

### Tema local customizado

Passe um array themes para o provider para injetar temas locais sem registro global.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-clock-theme-provider/samples/tema-local-customizado.tsx.sample`

```tsx
import { SgClock, SgClockThemeProvider, SgTimeProvider, type SgClockTheme } from "@seedgrid/fe-components";

const myTheme: SgClockTheme = {
  id: "neon-green",
  label: "Neon Green",
  order: 100,
  render: ({ now }) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    return (
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 48,
          color: "#00ff41",
          textShadow: "0 0 10px #00ff41",
          background: "#000",
          padding: "16px 24px",
          borderRadius: 8,
        }}
      >
        {h}:{m}:{s}
      </div>
    );
  },
};

export default function App() {
  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      <SgClockThemeProvider value={{ themes: [myTheme] }}>
        <SgClock themeId="neon-green" />
      </SgClockThemeProvider>
    </SgTimeProvider>
  );
}
```

### Registro global

Use registerTheme para registrar temas globalmente. Eles ficam disponíveis para todas as instâncias de SgClockThemeProvider.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-clock-theme-provider/samples/registro-global.tsx.sample`

```tsx
import { registerTheme, type SgClockTheme } from "@seedgrid/fe-components";

const myTheme: SgClockTheme = {
  id: "my-theme",
  label: "My Theme",
  order: 50,
  render: ({ now }) => <div>{now.toLocaleTimeString()}</div>,
};

registerTheme(myTheme);

export default myTheme;
```

### Resolver temas na árvore (useSgClockThemeResolver)

Só há temas a listar/resolver se algum tiver sido registrado (`registerThemes`) ou passado em `value.themes`; caso contrário `resolve("classic")` retorna `null`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-clock-theme-provider/samples/resolver-hook.tsx.sample`

```tsx
"use client";

import { SgClockThemeProvider, useSgClockThemeResolver } from "@seedgrid/fe-components";

function TemasDisponiveis() {
  // Fora de um SgClockThemeProvider o hook devolve null: sem provider nao ha
  // resolvedor, e nao existe fallback implicito.
  const resolver = useSgClockThemeResolver();
  if (!resolver) return <div>Sem SgClockThemeProvider na arvore.</div>;

  const classic = resolver.resolve("classic");
  const inexistente = resolver.resolve("nao-existe");

  return (
    <div className="space-y-1 text-sm">
      <div>temas visíveis: {resolver.list().map((theme) => theme.id).join(", ")}</div>
      <div>resolve("classic"): {classic?.id ?? "null"}</div>
      {/* modo "fallback" (padrão) cai no fallbackThemeId; em "strict" isto seria null */}
      <div>resolve("nao-existe"): {inexistente?.id ?? "null"}</div>
    </div>
  );
}

export default function Example() {
  return (
    <SgClockThemeProvider value={{ mode: "fallback", fallbackThemeId: "classic" }}>
      <TemasDisponiveis />
    </SgClockThemeProvider>
  );
}
```

### Tema de recuo

Com mode fallback (padrão), um id desconhecido cai em fallbackThemeId (padrão: classic).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/providers/sg-clock-theme-provider/samples/tema-de-recuo.tsx.sample`

```tsx
"use client";

import { SgClock, SgClockThemeProvider, SgTimeProvider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgTimeProvider initialServerTime={new Date().toISOString()}>
      <SgClockThemeProvider value={{ mode: "fallback", fallbackThemeId: "roman-classic" }}>
        <SgClock clockStyle="analog" size={160} themeId="nao-existe" />
      </SgClockThemeProvider>
    </SgTimeProvider>
  );
}
```

## SgClockThemePicker

### Uso básico

Escolha de tema visual com preview imediato aplicado ao relógio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-picker/samples/uso-basico.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgClock, SgClockThemePicker, SgClockThemeProvider, SgTimeProvider } from "@seedgrid/fe-components";

export default function Example() {
  const [themeId, setThemeId] = React.useState("classic");
  const now = new Date().toISOString();

  return (
    <SgTimeProvider initialServerTime={now}>
      <SgClockThemeProvider>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-4">
          <SgClock themeId={themeId} />
          <div className="w-full max-w-md">
            <SgClockThemePicker value={themeId} onChange={setThemeId} />
          </div>
        </div>
      </SgClockThemeProvider>
    </SgTimeProvider>
  );
}
```

### Filtrando os temas

filter recebe o tema e devolve se ele entra na lista (aqui, só os romanos e o classic).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-picker/samples/filtrando-temas.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgClockThemePicker, SgClockThemeProvider } from "@seedgrid/fe-components";

export default function Example() {
  const [themeId, setThemeId] = React.useState("roman-classic");

  return (
    <SgClockThemeProvider>
      <div className="w-full max-w-md">
        <SgClockThemePicker
          value={themeId}
          onChange={setThemeId}
          label="Tema romano"
          filter={(theme) => theme.id.startsWith("roman") || theme.id === "classic"}
        />
      </div>
    </SgClockThemeProvider>
  );
}
```

### Sem busca, aberto e com miniatura grande

searchable: false esconde o campo de busca; defaultOpen abre o painel; previewSize muda a miniatura do botão.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-picker/samples/sem-busca-aberto.tsx.sample`

```tsx
"use client";

import { SgClockThemePicker, SgClockThemeProvider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgClockThemeProvider>
      <div className="h-[440px] w-full max-w-md">
        <SgClockThemePicker value="music" onChange={() => {}} searchable={false} defaultOpen previewSize={72} />
      </div>
    </SgClockThemeProvider>
  );
}
```

### Tema de recuo e texto do botão

Valor desconhecido mostra o fallbackThemeId; placeholder aparece quando nenhum tema é resolvido (aqui, sem provider).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-picker/samples/tema-de-recuo.tsx.sample`

```tsx
"use client";

import { SgClockThemePicker, SgClockThemeProvider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-72">
        <SgClockThemeProvider>
          <SgClockThemePicker value="nao-existe" onChange={() => {}} fallbackThemeId="dark" />
        </SgClockThemeProvider>
      </div>
      <div className="w-72">
        <SgClockThemePicker value="classic" onChange={() => {}} placeholder="Nenhum tema registrado" />
      </div>
    </div>
  );
}
```

## SgClockThemePreview

### Galeria de temas

Previews compactos de temas embutidos para comparação visual.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-preview/samples/galeria-de-temas.tsx.sample`

```tsx
"use client";

import { SgClockThemePreview, sgClockThemesBuiltIn } from "@seedgrid/fe-components";

export default function Example() {
  const themes = sgClockThemesBuiltIn.slice(0, 8);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {themes.map((theme) => (
        <div key={theme.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-center rounded-md bg-foreground/5 p-4 text-foreground">
            <SgClockThemePreview theme={theme} size={72} />
          </div>
          <p className="mt-3 text-sm font-medium">{theme.label ?? theme.id}</p>
          <p className="text-xs text-muted-foreground">{theme.id}</p>
        </div>
      ))}
    </div>
  );
}
```

### Um tema

Miniatura com ponteiros fixos (hora 305°, minuto 60°, segundo 180°), na cor do texto.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-preview/samples/um-tema.tsx.sample`

```tsx
"use client";

import { SgClockThemePreview, sgClockThemesBuiltIn } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex items-center rounded-md bg-foreground/5 p-4 text-foreground">
      <SgClockThemePreview theme={sgClockThemesBuiltIn[0]!} />
    </div>
  );
}
```

### Tamanhos

size define o lado do quadrado da miniatura (padrão: 64).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-preview/samples/tamanhos.tsx.sample`

```tsx
"use client";

import { SgClockThemePreview, sgClockThemesBuiltIn } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-foreground">
      <SgClockThemePreview theme={sgClockThemesBuiltIn[7]!} size={32} />
      <SgClockThemePreview theme={sgClockThemesBuiltIn[7]!} />
      <SgClockThemePreview theme={sgClockThemesBuiltIn[7]!} size={128} />
    </div>
  );
}
```

### Tema próprio

Um tema é uma lista de figuras no espaço 100×100 (formato JSON sg-clock-theme/1) ou um desenho livre com paint.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-clock-theme-preview/samples/tema-proprio.tsx.sample`

```tsx
"use client";

import { SgClockThemePreview, type SgClockTheme } from "@seedgrid/fe-components";

const dotTheme: SgClockTheme = {
  id: "ponto",
  label: "Ponto",
  render: () => (
    <>
      <circle cx="50" cy="50" r="48" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
      <circle cx="50" cy="12" r="3" fill="#F97316" />
    </>
  )
};

export default function Example() {
  return <SgClockThemePreview theme={dotTheme} size={96} />;
}
```

## SgLinearGauge

### Padrão (Horizontal)

Faixas coloridas com um ponteiro primário controlável.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/default-horizontal.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgLinearGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(64);

  return (
    <SgLinearGauge
      min={0}
      max={100}
      value={value}
      onValueChange={setValue}
      ranges={[
        { start: 0, end: 30, color: "#22c55e" },
        { start: 30, end: 70, color: "#f59e0b" },
        { start: 70, end: 100, color: "#ef4444" }
      ]}
      showTicks
      showLabels
      majorTickCount={5}
      barPointer
      primaryPointerDraggable
    />
  );
}
```

### Vertical + múltiplos ponteiros

Orientação vertical com dois ponteiros arrastáveis.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/vertical-multi-pointers.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgLinearGauge, type SgLinearGaugePointer } from "@seedgrid/fe-components";

export default function Example() {
  const [temperature, setTemperature] = React.useState(28);
  const [target, setTarget] = React.useState(72);
  const pointers = React.useMemo<SgLinearGaugePointer[]>(
    () => [
      { id: "target", value: target, color: "hsl(var(--secondary))", shape: "diamond", size: 11, draggable: true },
      { id: "temp", value: temperature, color: "hsl(var(--destructive))", shape: "circle", size: 10, draggable: true }
    ],
    [target, temperature]
  );

  return (
    <SgLinearGauge
      min={-10}
      max={50}
      value={temperature}
      onValueChange={setTemperature}
      orientation="vertical"
      width={140}
      height={360}
      primaryPointerColor="#2563eb"
      primaryPointerShape="triangle"
      primaryPointerSize={12}
      primaryPointerDraggable
      pointers={pointers}
      onPointerValueChange={(pointerId, next) => {
        if (pointerId === "target") setTarget(next);
        if (pointerId === "temp") setTemperature(next);
      }}
      ranges={[
        { start: -10, end: 15, color: "#38bdf8" },
        { start: 15, end: 30, color: "#22c55e" },
        { start: 30, end: 50, color: "#ef4444" }
      ]}
      majorTickCount={6}
      minorTicksPerInterval={1}
      labelFormatter={(value) => `${Math.round(value)}°`}
    />
  );
}
```

### Barra horizontal

Eixo com barra de progresso, ponteiro triangular e marcas automáticas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/barra-horizontal.tsx.sample`

```tsx
"use client";

import { SgLinearGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgLinearGauge value={62} />
  );
}
```

### Faixas e ponteiro extra

ranges coloridas sobre o eixo e um ponteiro adicional com rótulo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/faixas-e-ponteiro-extra.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgLinearGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgLinearGauge
      value={35}
      ranges={[
        { start: 0, end: 40, color: "#22c55e" },
        { start: 40, end: 100, color: "#ef4444" }
      ]}
      pointers={[{ value: 80, shape: "diamond", label: "meta" }]}
      primaryPointerShape="inverted-triangle"
    />
  );
}
```

### Vertical

orientation vertical usa o eixo y; isAxisInversed põe o mínimo no topo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/vertical.tsx.sample`

```tsx
"use client";

import { SgGrid, SgLinearGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 2 }} gap={24}>
      <SgLinearGauge value={70} orientation="vertical" />
      <SgLinearGauge value={70} orientation="vertical" isAxisInversed barColor="#8b5cf6" />
    </SgGrid>
  );
}
```

### Arrastar o ponteiro

primaryPointerDraggable permite mudar o valor tocando e arrastando; onValueChange o devolve.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-linear-gauge/samples/arrastar-o-ponteiro.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgGrid, SgLinearGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [volume, setVolume] = React.useState(35);

  return (
    <SgGrid columns={{ base: 1 }} gap={8}>
      <SgLinearGauge
        value={volume}
        primaryPointerDraggable
        onValueChange={setVolume}
        labelFormatter={(v) => `${Math.round(v)}%`}
      />
      <p>Volume: {Math.round(volume)}%</p>
    </SgGrid>
  );
}
```

## SgRadialGauge

### Estilo velocímetro

Ponteiro de agulha primário com faixas de alerta.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/speedometer-style.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [rpm, setRpm] = React.useState(62);

  return (
    <SgRadialGauge
      min={0}
      max={100}
      value={rpm}
      onValueChange={setRpm}
      startAngle={140}
      endAngle={40}
      ranges={[
        { start: 0, end: 40, color: "#22c55e", width: 14 },
        { start: 40, end: 75, color: "#f59e0b", width: 14 },
        { start: 75, end: 100, color: "#ef4444", width: 14 }
      ]}
      showTicks
      showLabels
      majorTickCount={5}
      minorTicksPerInterval={2}
      primaryPointerDraggable
      primaryPointerType="needle"
      primaryPointerColor="#2563eb"
      centerContent={<div className="text-center"><div className="text-xs uppercase text-muted-foreground">RPM</div><div className="text-xl font-semibold">{Math.round(rpm)}</div></div>}
    />
  );
}
```

### Anel mais espesso (ringThickness)

Exemplo com anel espesso e sem corte visual usando ringThickness={36}.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/thicker-ring-ringthickness.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(72);

  return (
    <SgRadialGauge
      min={0}
      max={120}
      value={value}
      onValueChange={setValue}
      startAngle={150}
      endAngle={30}
      ringThickness={36}
      radiusFactor={1}
      axisColor="#e2e8f0"
      showTicks={false}
      showLabels
      majorTickCount={6}
      labelFormatter={(entry) => String(Math.round(entry))}
      ranges={[
        { start: 0, end: 40, color: "#22c55e" },
        { start: 40, end: 85, color: "#f59e0b" },
        { start: 85, end: 120, color: "#ef4444" }
      ]}
      primaryPointerType="marker"
      primaryPointerShape="circle"
      primaryPointerSize={14}
      primaryPointerColor="#0f172a"
      primaryPointerDraggable
    />
  );
}
```

### Eixo Invertido + Ângulos Customizados

Com isAxisInversed, ângulos customizados e animate={false}.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/axis-inversed-angulos-custom.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(24);
  return (
    <SgRadialGauge
      min={0}
      max={100}
      value={value}
      onValueChange={setValue}
      startAngle={220}
      endAngle={-40}
      isAxisInversed
      ringThickness={18}
      showTicks
      showLabels
      majorTickCount={8}
      minorTicksPerInterval={0}
      animate={false}
      primaryPointerType="marker"
      primaryPointerShape="triangle"
      primaryPointerSize={14}
      primaryPointerColor="#7c3aed"
      ranges={[
        { start: 0, end: 35, color: "#0ea5e9", width: 14 },
        { start: 35, end: 70, color: "#22c55e", width: 14 },
        { start: 70, end: 100, color: "#f97316", width: 14 }
      ]}
    />
  );
}
```

### Múltiplos ponteiros + anotação

Combina marcador, ponteiro de faixa e anotação baseada em valor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/multi-pointers-annotation.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgRadialGauge, type SgRadialGaugePointer } from "@seedgrid/fe-components";

export default function Example() {
  const [rpm, setRpm] = React.useState(62);
  const [target, setTarget] = React.useState(70);
  const [consumption, setConsumption] = React.useState(44);
  const pointers = React.useMemo<SgRadialGaugePointer[]>(
    () => [
      { id: "target", type: "marker", value: target, color: "#8b5cf6", size: 13, shape: "diamond", draggable: true, label: String(Math.round(target)) },
      { id: "consumption", type: "range", value: consumption, color: "#14b8a6", width: 10, draggable: true }
    ],
    [consumption, target]
  );

  return (
    <SgRadialGauge
      min={0}
      max={120}
      value={rpm}
      onValueChange={setRpm}
      startAngle={135}
      endAngle={45}
      radiusFactor={0.95}
      ranges={[
        { start: 0, end: 60, color: "#60a5fa", width: 12, opacity: 0.45 },
        { start: 60, end: 90, color: "#f59e0b", width: 12, opacity: 0.45 },
        { start: 90, end: 120, color: "#ef4444", width: 12, opacity: 0.45 }
      ]}
      pointers={pointers}
      onPointerValueChange={(id, next) => {
        if (id === "target") setTarget(next);
        if (id === "consumption") setConsumption(next);
      }}
      annotations={[{ id: "target-label", value: target, radiusFactor: 0.8, content: <span className="rounded bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white">target</span> }]}
      primaryPointerDraggable
    />
  );
}
```

### Ponteiro de Faixa (Donut)

Visual tipo donut usando ponteiro do tipo range.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/range-pointer-donut.tsx.sample`

```tsx
"use client";

import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgRadialGauge
      min={0}
      max={100}
      showPrimaryPointer={false}
      pointers={[{ id: "donut-progress", type: "range", value: 50, color: "#8b5cf6", width: 14 }]}
      startAngle={135}
      endAngle={45}
      axisColor="#d4d4d8"
      axisWidth={14}
      showTicks={false}
      showLabels={false}
      centerContent={<div className="text-lg font-semibold text-slate-700">50 / 100</div>}
    />
  );
}
```

### Outras props (tamanho, rótulos e acessibilidade)

Exemplo com width/height, axisWidth, animationDuration, primaryPointerLabel, labelFormatter e ariaLabel.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/other-props-size-labels-accessibility.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(35);
  return (
    <SgRadialGauge
      min={0}
      max={100}
      value={value}
      onValueChange={setValue}
      width={220}
      height={220}
      axisWidth={10}
      ringThickness={16}
      animationDuration={900}
      primaryPointerType="needle"
      primaryPointerLabel={`${Math.round(value)}%`}
      labelFormatter={(entry) => `${Math.round(entry)}%`}
      majorTickCount={5}
      minorTicksPerInterval={0}
      ariaLabel="Gauge de eficiência"
      style={{ filter: "drop-shadow(0 4px 10px rgb(0 0 0 / 0.12))" }}
      ranges={[
        { start: 0, end: 40, color: "#22c55e", width: 12 },
        { start: 40, end: 70, color: "#f59e0b", width: 12 },
        { start: 70, end: 100, color: "#ef4444", width: 12 }
      ]}
    />
  );
}
```

### Ponteiro simples

Agulha sobre um arco de 270 graus, com marcas e rótulos automáticos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/ponteiro-simples.tsx.sample`

```tsx
"use client";

import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgRadialGauge value={62} />
  );
}
```

### Faixas coloridas e anotação

ranges pintam trechos da escala; annotations e centerContent colocam widgets sobre o arco.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/faixas-coloridas-e-anotacao.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgRadialGauge
      value={72}
      width={280}
      height={280}
      ranges={[
        { start: 0, end: 40, color: "#22c55e" },
        { start: 40, end: 75, color: "#eab308" },
        { start: 75, end: 100, color: "#ef4444" }
      ]}
      annotations={[{ value: 50, radiusFactor: 0.55, content: <span>média</span> }]}
      centerContent={<span className="text-[28px] font-bold">72%</span>}
    />
  );
}
```

### Anel de progresso e ponteiros extras

primaryPointerType range preenche o anel; pointers adiciona marcadores e agulhas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/anel-de-progresso-e-ponteiros-extras.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgRadialGauge
      value={55}
      primaryPointerType="range"
      ringThickness={16}
      pointers={[
        { id: "meta", type: "marker", value: 80, shape: "diamond", color: "#ef4444", label: "meta" }
      ]}
    />
  );
}
```

### Arrastar o ponteiro

Com primaryPointerDraggable o ponteiro segue o dedo; onValueChange devolve o valor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/arrastar-o-ponteiro.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgGrid, SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  const [velocidade, setVelocidade] = React.useState(40);

  return (
    <SgGrid columns={{ base: 1 }} gap={8}>
      <SgRadialGauge
        value={velocidade}
        primaryPointerDraggable
        onValueChange={setVelocidade}
        labelFormatter={(v) => String(Math.round(v))}
      />
      <p>Velocidade: {Math.round(velocidade)} km/h</p>
    </SgGrid>
  );
}
```

### Meio arco invertido

startAngle, endAngle e isAxisInversed redefinem a geometria; showTicks e showLabels escondem a escala.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-radial-gauge/samples/meio-arco-invertido.tsx.sample`

```tsx
"use client";

import { SgRadialGauge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgRadialGauge
      value={30}
      startAngle={180}
      endAngle={0}
      isAxisInversed
      width={300}
      height={180}
      showLabels={false}
      animate={false}
    />
  );
}
```

## SgQRCode

### Exemplo interativo

Altere o valor do QR Code, o logo central e o tamanho.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-qr-code/samples/interactive-example.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgQRCode } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState("https://seedgrid.com.br");
  const [logoSrc, setLogoSrc] = React.useState("/logo-seedgrid.svg");
  const [size, setSize] = React.useState(220);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Valor do QR Code</span>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Digite texto, URL ou payload PIX"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Logo central (URL)</span>
          <input
            type="text"
            value={logoSrc}
            onChange={(event) => setLogoSrc(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="https://exemplo.com/logo.png"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Tamanho: {size}px</span>
          <input type="range" min={140} max={360} step={4} value={size} onChange={(event) => setSize(Number(event.target.value))} className="w-full" />
        </label>

        <div className="flex flex-wrap gap-2">
          <SgButton onClick={() => setValue("https://seedgrid.com.br")}>URL</SgButton>
          <SgButton severity="secondary" onClick={() => setValue("00020126580014BR.GOV.BCB.PIX0136contato@seedgrid.com.br5204000053039865802BR5922SEEDGRID TECNOLOGIA6009SAO PAULO62140510SEEDGRID1236304ABCD")}>
            Exemplo PIX
          </SgButton>
          <SgButton severity="warning" onClick={() => setLogoSrc("")}>Sem logo</SgButton>
        </div>
      </div>

      <div className="inline-flex h-fit rounded-xl border border-border bg-background p-4 shadow-sm">
        <SgQRCode
          value={value}
          size={size}
          logoSrc={logoSrc || undefined}
          logoAlt="Logo SeedGrid"
          emptyFallback={<span className="text-sm text-muted-foreground">Informe um valor</span>}
        />
      </div>
    </div>
  );
}
```

### QR Code básico

Gera a matriz do texto (nível de correção H por padrão) e a desenha sem suavização.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-qr-code/samples/qr-code-basico.tsx.sample`

```tsx
"use client";

import { SgQRCode } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgQRCode value="https://seedgrid.com.br" />
  );
}
```

### Cores, tamanho e margem

fgColor e bgColor aceitam hex, rgb e tokens do tema; size é o lado em px e margin conta módulos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-qr-code/samples/cores-tamanho-e-margem.tsx.sample`

```tsx
"use client";

import { SgQRCode } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgQRCode
      value="seedgrid"
      size={160}
      margin={1}
      fgColor="#1d4ed8"
      bgColor="#e0f2fe"
      errorCorrectionLevel="M"
    />
  );
}
```

### Logo no centro

O logo central tem tamanho, respiro e cantos configuráveis (logoSize, logoPadding e logoBorderRadius).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-qr-code/samples/logo-no-centro.tsx.sample`

```tsx
"use client";

import { SgQRCode } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgQRCode
      value="https://seedgrid.com.br/logo"
      size={200}
      logoSrc="/logo-seedgrid.svg"
      logoSize={56}
      logoPadding={4}
      logoBorderRadius={8}
    />
  );
}
```

### Vazio e erro

Texto vazio mostra emptyFallback; texto grande demais chama onGenerateError.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-qr-code/samples/vazio-e-erro.tsx.sample`

```tsx
"use client";

import { SgQRCode } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgQRCode
      value=""
      size={120}
      emptyFallback={<span className="text-sm text-muted-foreground">Informe um texto</span>}
    />
  );
}
```

## SgStringAnimator

### Roller 3D - nomes (alinhado à esquerda)

Anima "LUCIANO" até "MARTA". Posições extras preenchidas com espaço à direita (alignTo="left").

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/roller-3d-nomes-left-aligned.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);

  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="roller3d" alignTo="left" fontSize={28} />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Roller 3D - números (alinhado à direita)

Anima "42" até "1337". Espaços são inseridos à esquerda (alignTo="right") e os dígitos animam da direita para a esquerda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/roller-3d-numeros-right-aligned.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);

  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="42" targetString="1337" stringAnimatorStyle="roller3d" alignTo="right" fontSize={28} />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Estilo Flip

Animação de nomes usando SgFlipDigit (flip card).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/estilo-flip.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);
  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="flip" alignTo="left" fontSize={28} />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Estilo Neon

Cada caractere usa SgNeonDigit com efeito de brilho neon. Use color e backgroundColor para personalizar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/estilo-neon.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);
  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="neon" alignTo="left" fontSize={28} color="#e4fbff" backgroundColor="#090f22" />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Estilo Fade

Cada caractere usa SgFadeDigit: apaga o dígito atual e acende o novo (efeito bulbo/display).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/estilo-fade.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);
  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="fade" alignTo="left" fontSize={28} />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Estilo Discard

Cada caractere usa SgDiscardDigit: a folha com o valor antigo é descartada voando para fora.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/estilo-discard.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);
  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="discard" alignTo="left" fontSize={28} />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### Estilo Matrix

Cada caractere usa SgMatrixDigit: renderizado em pontos de LED 5x7. Ideal para placares e painéis digitais.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/estilo-matrix.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const animRef = React.useRef<SgStringAnimatorRef>(null);
  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator ref={animRef} sourceString="LUCIANO" targetString="MARTA" stringAnimatorStyle="matrix" alignTo="left" fontSize={28} color="#22d3ee" backgroundColor="#0b1220" />
      <SgButton size="sm" onClick={() => animRef.current?.startAnimation()}>Animar</SgButton>
    </div>
  );
}
```

### autoStart - animação automática

Com autoStart=true, a animação é iniciada automaticamente sempre que targetString mudar. Funciona com todos os estilos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/autostart-animacao-automatica.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgStringAnimator, SgButton } from "@seedgrid/fe-components";

const NAMES = ["LUCIANO", "MARTA", "PEDRO", "ANA", "SEEDGRID"];

export default function Example() {
  const [idx, setIdx] = React.useState(0);
  const [target, setTarget] = React.useState(NAMES[0] ?? "");

  const next = () => {
    const nextIdx = (idx + 1) % NAMES.length;
    const nextName = NAMES[nextIdx] ?? NAMES[0] ?? "";
    setIdx(nextIdx);
    setTarget(nextName);
  };

  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator
        sourceString={NAMES[(idx - 1 + NAMES.length) % NAMES.length] ?? target}
        targetString={target}
        stringAnimatorStyle="roller3d"
        alignTo="left"
        fontSize={28}
        autoStart
        velocity={60}
      />
      <SgButton size="sm" onClick={next}>
        Próximo nome
      </SgButton>
    </div>
  );
}
```

### Velocidades

Comparação de velocity=10, 50 e 90 na mesma animação.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/velocidades.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton, SgGrid } from "@seedgrid/fe-components";

const VELOCITY_CASES = [
  { label: "Lento (velocity=10)", velocity: 10 },
  { label: "Médio (velocity=50)", velocity: 50 },
  { label: "Rápido (velocity=90)", velocity: 90 },
] as const;

export default function Example() {
  const refs = [
    React.useRef<SgStringAnimatorRef>(null),
    React.useRef<SgStringAnimatorRef>(null),
    React.useRef<SgStringAnimatorRef>(null),
  ] as const;

  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={24}>
      {VELOCITY_CASES.map(({ label, velocity }, i) => {
        const ref = refs[i] ?? refs[0];
        return (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <SgStringAnimator
              ref={ref}
              sourceString="ORIGEM"
              targetString="DESTINO"
              stringAnimatorStyle="roller3d"
              alignTo="left"
              fontSize={22}
              velocity={velocity}
            />
            <SgButton size="sm" onClick={() => ref.current?.startAnimation()}>
              Animar
            </SgButton>
          </div>
        );
      })}
    </SgGrid>
  );
}
```

### Charset e caractere de preenchimento

charset limita o tambor aos caracteres informados; emptyChar completa strings de tamanhos diferentes (aqui, "0" à esquerda dos números e "." à direita das letras).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/charset-e-caractere-de-preenchimento.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgStringAnimator, type SgStringAnimatorRef, SgButton } from "@seedgrid/fe-components";

const DIGITS_CHARSET = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function Example() {
  const numerosRef = React.useRef<SgStringAnimatorRef>(null);
  const letrasRef = React.useRef<SgStringAnimatorRef>(null);

  return (
    <div className="flex flex-col gap-4">
      <SgStringAnimator
        ref={numerosRef}
        sourceString="7"
        targetString="2048"
        stringAnimatorStyle="roller3d"
        alignTo="right"
        emptyChar="0"
        charset={DIGITS_CHARSET}
        fontSize={28}
        velocity={90}
      />
      <SgStringAnimator
        ref={letrasRef}
        sourceString="ABCDEFG"
        targetString="XY"
        stringAnimatorStyle="flip"
        alignTo="left"
        emptyChar="."
        fontSize={22}
        velocity={100}
      />
      <div>
        <SgButton
          size="sm"
          onClick={() => {
            numerosRef.current?.startAnimation();
            letrasRef.current?.startAnimation();
          }}
        >
          Animar
        </SgButton>
      </div>
    </div>
  );
}
```
