---
tags: [seedgrid, component, frontend, react, inputs-midia, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: bb0ad1f
analisado-em: 2026-11-04
description: "Exemplos TSX (React) de Data e hora, arquivo, imagem e câmera, copiados dos samples do showcase do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Data e hora, imagem e câmera: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **Ainda não publicado no npm** (commits locais `839e245` e `bb0ad1f`): os exemplos só compilam depois da publicação do pacote. Os trechos abaixo são os `*.tsx.sample` do showcase (copy/paste 1:1), em `apps/showcase/src/app/components/sg-input-date-time/samples/`, `sg-image-upload/samples/` e `sg-camera-capture/samples/`. API: [[SeedGrid/SeedGrid-components/inputs-midia/API|API de data e hora, imagem e câmera]].


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

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [instant, setInstant] = React.useState("2026-11-03T17:30:00.000Z");

  return (
    <div className="w-80 space-y-4">
      <SgInputDateTime id="demo-zone-utc" label="UTC" timeZone="UTC" value={instant} onChange={(value) => value !== null && setInstant(value)} />
      <SgInputDateTime id="demo-zone-sp" label="-03:00" timeZone="-03:00" value={instant} onChange={(value) => value !== null && setInstant(value)} />
      <SgInputDateTime id="demo-zone-in" label="+05:30" timeZone="+05:30" value={instant} onChange={(value) => value !== null && setInstant(value)} />
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

## SgInputDateTime: posição do rótulo

```tsx
import * as React from "react";
import { SgGrid, SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputDateTime id="sg-input-date-time-label-float" label="Label float" labelPosition="float" />
      <SgInputDateTime id="sg-input-date-time-label-top" label="Label top" labelPosition="top" />
      <SgInputDateTime id="sg-input-date-time-label-left" label="Label left" labelPosition="left" labelWidth={140} labelAlign="end" />
    </SgGrid>
  );
}
```

## SgInputDateTime: eventos (`onEnter` e `onExit`)

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [lastEvent, setLastEvent] = React.useState("-");

  return (
    <div className="w-80">
      <SgInputDateTime
        id="demo-events"
        label="Quando"
        onChange={(value, local) => setLastEvent(`onChange: ${value ?? local}`)}
        onEnter={() => setLastEvent("onEnter")}
        onExit={() => setLastEvent("onExit")}
      />
      <p className="mt-2 text-xs text-muted-foreground">Último evento: {lastEvent}</p>
    </div>
  );
}
```

## SgFileUpload: básico (a lista de arquivos)

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  const [names, setNames] = React.useState<string[]>([]);

  return (
    <div className="w-80">
      <SgFileUpload
        id="demo-basic"
        label="Anexo"
        onChange={(files) => setNames(files.map((file) => file.name))}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {names.length > 0 ? names.join(", ") : "-"}</p>
    </div>
  );
}
```

## SgFileUpload: vários arquivos e erro por arquivo

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  const [count, setCount] = React.useState(0);
  const [lastError, setLastError] = React.useState("-");

  return (
    <div className="w-80">
      <SgFileUpload
        id="demo-many"
        label="Anexos"
        maxFiles={3}
        hintText="Até 3 arquivos."
        onChange={(files) => setCount(files.length)}
        onError={(code, message, fileName) => setLastError(`${fileName}: ${code}`)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Arquivos: {count}</p>
      <p className="text-xs text-muted-foreground">Última recusa: {lastError}</p>
    </div>
  );
}
```

## SgFileUpload: limites de quantidade e de tamanho (texto com unidade)

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgFileUpload
        id="demo-limits"
        label="Documentos"
        maxFiles={5}
        maxSizePerFile="2MB"
        maxSizeTotal="5MB"
        hintText="Até 5 arquivos, 2 MB cada e 5 MB no total."
      />
    </div>
  );
}
```

## SgFileUpload: tipos aceitos (PDF e planilhas)

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgFileUpload id="demo-types" label="Planilha ou PDF" mediaType={["pdf", "xls", "xlsx"]} maxFiles={2} />
    </div>
  );
}
```

## SgFileUpload: desabilitado, com arquivo já salvo

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgFileUpload
        id="demo-disabled"
        label="Anexo"
        disabled
        defaultValue={[{ name: "contrato.pdf", url: "/contrato.pdf", size: 482304 }]}
      />
    </div>
  );
}
```

## SgImageUpload: básico (valor é uma lista)

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  const [info, setInfo] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgImageUpload
        id="demo-basic"
        label="Foto"
        onChange={(files) => setInfo(files.length > 0 ? `${files[0].name} (${files[0].size} bytes)` : null)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {info ?? "-"}</p>
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
        maxSizePerFile="2MB"
        minWidth={200}
        minHeight={200}
        aspect={1}
        hintText="PNG ou JPEG, até 2 MB, quadrada, mínimo 200 × 200 px."
      />
    </div>
  );
}
```

## SgImageUpload: várias imagens (grade)

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="w-80">
      <SgImageUpload
        id="demo-gallery"
        label="Galeria"
        maxFiles={4}
        maxSizePerFile="2MB"
        maxSizeTotal="6MB"
        hintText="Até 4 imagens, 2 MB cada e 6 MB no total."
        onChange={(files) => setCount(files.length)}
      />
      <p className="mt-2 text-xs text-muted-foreground">Imagens: {count}</p>
    </div>
  );
}
```

## SgImageUpload: imagem já salva (`{ name, url }`)

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgImageUpload
        id="demo-saved"
        label="Logotipo"
        defaultValue={[{ name: "logo.ico", url: "/favicon.ico" }]}
        previewHeight={96}
      />
    </div>
  );
}
```

## SgImageUpload: desabilitado

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgImageUpload id="demo-disabled" label="Foto" disabled />
    </div>
  );
}
```

## SgCameraCapture: básico

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  const [photo, setPhoto] = React.useState<{ url: string; label: string } | null>(null);

  // A foto capturada vira uma URL de objeto; ela e liberada ao trocar de foto e ao desmontar.
  React.useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  return (
    <div className="w-80">
      <SgCameraCapture
        id="demo-basic"
        label="Foto"
        onCapture={(image) => setPhoto({ url: URL.createObjectURL(image), label: `${image.type} (${image.size} bytes)` })}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor atual: {photo?.label ?? "-"}</p>
      {photo ? <img src={photo.url} alt="Foto capturada" className="mt-2 h-40 rounded-md border border-border" /> : null}
    </div>
  );
}
```

## SgCameraCapture: guia oval (selfie)

```tsx
import * as React from "react";
import { SgCameraCapture } from "@seedgrid/fe-components";

export default function App() {
  const [selfie, setSelfie] = React.useState<string | null>(null);

  // A foto capturada vira uma URL de objeto; ela e liberada ao trocar de foto e ao desmontar.
  React.useEffect(() => () => { if (selfie) URL.revokeObjectURL(selfie); }, [selfie]);

  return (
    <div className="w-80">
      <SgCameraCapture
        id="demo-oval"
        label="Selfie"
        facing="user"
        guide="oval"
        onCapture={(image) => setSelfie(URL.createObjectURL(image))}
      />
      {selfie ? <img src={selfie} alt="Foto capturada" className="mt-2 h-40 rounded-md border border-border" /> : null}
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
