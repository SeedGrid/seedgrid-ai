---
tags: [seedgrid, component, frontend, react, inputs-midia, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 839e245
analisado-em: 2026-11-04
description: "Exemplos TSX (React) de Data e hora, imagem e câmera, copiados dos samples do showcase do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Data e hora, imagem e câmera: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **Ainda não publicado no npm** (commit local `839e245`): os exemplos só compilam depois da publicação do pacote. Os trechos abaixo são os `*.tsx.sample` do showcase (copy/paste 1:1), em `apps/showcase/src/app/components/sg-input-date-time/samples/`, `sg-image-upload/samples/` e `sg-camera-capture/samples/`. API: [[SeedGrid/SeedGrid-components/inputs-midia/API|API de data e hora, imagem e câmera]].

## SgInputDateTime: básico (instante UTC)

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [instant, setInstant] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgInputDateTime id="demo-basic" label="Quando" onChange={(value) => setInstant(value)} />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {instant ?? "-"}</p>
    </div>
  );
}
```

## SgInputDateTime: fusos (mesmo instante, três horas diferentes)

O valor continua sendo o mesmo instante UTC; só a hora exibida muda com o `timeZone`.

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [instant, setInstant] = React.useState("2026-11-03T17:30:00.000Z");

  return (
    <div className="w-80 space-y-4">
      <SgInputDateTime id="demo-zone-utc" label="UTC" timeZone="UTC" value={instant} onChange={(value) => setInstant(value ?? "")} />
      <SgInputDateTime id="demo-zone-sp" label="-03:00" timeZone="-03:00" value={instant} onChange={(value) => setInstant(value ?? "")} />
      <SgInputDateTime id="demo-zone-in" label="+05:30" timeZone="+05:30" value={instant} onChange={(value) => setInstant(value ?? "")} />
      <p className="text-xs text-muted-foreground">Valor atual: {instant || "-"}</p>
    </div>
  );
}
```

## SgInputDateTime: limites, passo de minutos e obrigatório

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputDateTime
        id="demo-limits"
        label="Agendamento"
        timeZone="UTC"
        minDate="2026-11-01T08:00:00Z"
        maxDate="2026-11-30T18:00:00Z"
        minuteStep={15}
        required
      />
    </div>
  );
}
```

## SgInputDateTime: com segundos

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgInputDateTime id="demo-seconds" label="Evento" timeZone="UTC" defaultValue="2026-11-03T17:30:45Z" showSeconds />
    </div>
  );
}
```

## SgImageUpload: básico

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  const [fileInfo, setFileInfo] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgImageUpload
        id="demo-basic"
        label="Foto"
        onChange={(file) => setFileInfo(file ? `${file.name} (${file.size} bytes)` : null)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {fileInfo ?? "-"}</p>
    </div>
  );
}
```

## SgImageUpload: regras (tipo, tamanho, dimensão e proporção)

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgImageUpload
        id="demo-rules"
        label="Avatar"
        accept="image/png,image/jpeg"
        maxSizeBytes={2 * 1024 * 1024}
        minWidth={200}
        minHeight={200}
        aspect={1}
        hintText="PNG ou JPEG, até 2 MB, quadrada, mínimo 200 × 200 px."
      />
    </div>
  );
}
```

## SgImageUpload: valor já salvo (URL)

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgImageUpload id="demo-saved" label="Logotipo" defaultValue="/favicon.ico" previewHeight={96} />
    </div>
  );
}
```

## SgCameraCapture: básico

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  const [captured, setCaptured] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgCameraCapture
        id="demo-basic"
        label="Foto"
        onCapture={(image) => setCaptured(`${image.type} (${image.size} bytes)`)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {captured ?? "-"}</p>
    </div>
  );
}
```

## SgCameraCapture: guia oval (selfie)

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgCameraCapture id="demo-oval" label="Selfie" facing="user" guide="oval" />
    </div>
  );
}
```

## SgCameraCapture: guia retangular (documento, câmera traseira, alta resolução)

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgCameraCapture
        id="demo-rect"
        label="Documento"
        facing="environment"
        guide="rect"
        resolution="high"
        previewHeight={240}
      />
    </div>
  );
}
```

## SgCameraCapture: tratar erros da câmera

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgCameraCapture
        id="demo-errors"
        label="Foto"
        onError={(code, message) => setCameraError(`${code}: ${message}`)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {cameraError ?? "-"}</p>
    </div>
  );
}
```

## Câmera e galeria juntas (composição)

Receita **sugerida** pelos `compositionHints` dos metas (**Inferência**, não é um sample do showcase): `SgCameraCapture` para tirar na hora e `SgImageUpload` para escolher da galeria; em ambos, o envio fica com o host (use o `File` ou o `Blob` recebido no serviço de arquivos do projeto).
