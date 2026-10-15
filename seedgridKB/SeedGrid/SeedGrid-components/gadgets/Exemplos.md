---
tags: [seedgrid, front, component, gadgets]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Exemplos — gadgets

Exemplos copiados 1:1 dos `samples/*.tsx.sample` do showcase (rotas `/components/gadgets/*`, `/components/providers/*`, `/components/hooks/*`), salvo os marcados como **exemplo próprio**. Todos verificados com type-check TypeScript (`strict`) contra `packages/seedgrid-fe-components/src/index.ts` no commit `ad30fc11de` — sem erros. Classes utilitárias são Tailwind do app de exemplo.

API: [[SeedGrid/SeedGrid-components/gadgets/API|API dos gadgets]] · Visão geral: [[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets — visão geral]]

## SgCalendar

### Básico (não controlado)

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

### Controlado, com limites e fins de semana desabilitados

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

## SgClock

### Digital em três tamanhos, alternando 12h/24h

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

### Analógico com tema inline (sem provider nem registro)

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

### Fusos horários

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

Observação: o tema `seedgrid` usado acima só resolve se os temas embutidos tiverem sido registrados (o showcase registra em `sg-clock-showcase-client.tsx`). Ver o exemplo seguinte.

### Temas embutidos + provider + picker (exemplo próprio)

Os temas de `sgClockThemesBuiltIn` precisam ser registrados; o `SgClockThemePicker` lista os temas do `SgClockThemeProvider`.

```tsx
"use client";

import React from "react";
import {
  SgClock,
  SgClockThemePicker,
  SgClockThemeProvider,
  registerThemes,
  sgClockThemesBuiltIn
} from "@seedgrid/fe-components";

// Os temas embutidos NÃO são registrados automaticamente: registre uma vez no boot do app.
registerThemes(sgClockThemesBuiltIn);

export default function Example() {
  const [themeId, setThemeId] = React.useState("classic");

  return (
    <SgClockThemeProvider value={{ mode: "fallback", fallbackThemeId: "classic" }}>
      <SgClockThemePicker value={themeId} onChange={setThemeId} label="Tema" />
      <SgClock clockStyle="analog" size={240} themeId={themeId} />
    </SgClockThemeProvider>
  );
}
```

## SgTimeProvider / useSgTime

### Uso básico

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

## SgClockThemeProvider / useSgClockThemeResolver

### Resolvedor via hook (modo `fallback`)

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

## SgClockThemePreview

### Galeria dos temas embutidos (exemplo próprio)

```tsx
import { SgClockThemePreview, sgClockThemesBuiltIn } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {sgClockThemesBuiltIn.map((theme) => (
        <SgClockThemePreview key={theme.id} theme={theme} size={72} />
      ))}
    </div>
  );
}
```

## SgLinearGauge

### Horizontal com faixas e ponteiro arrastável

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

### Vertical com múltiplos ponteiros

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

## SgRadialGauge

### Estilo velocímetro com conteúdo central

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

### Ponteiros extras (marker/range) e anotação

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

## SgQRCode

### Interativo com logo e fallback

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

## SgStringAnimator

### `autoStart` ao trocar o alvo

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/gadgets/sg-string-animator/samples/autostart-animacao-automatica.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStringAnimator } from "@seedgrid/fe-components";

const NAMES = ["LUCIANO", "MARTA", "PEDRO", "ANA", "SEEDGRID"];

export default function Example() {
  const [index, setIndex] = React.useState(0);
  const [target, setTarget] = React.useState(NAMES[0] ?? "");

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % NAMES.length;
        setTarget(NAMES[next] ?? "");
        return next;
      });
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return <SgStringAnimator sourceString={NAMES[index] ?? ""} targetString={target} stringAnimatorStyle="roller3d" alignTo="left" fontSize={28} autoStart />;
}
```

### Disparo imperativo via `ref` (números alinhados à direita)

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
