---
tags: [seedgrid, component, frontend, react, inputs-midia, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Data e hora, arquivo, imagem e câmera, copiados dos samples do showcase do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Data e hora, imagem e câmera: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **Publicado no npm em 2026.11.2** (`@seedgrid/fe-components`; versões anteriores, até 2026.11.1, não têm `SgFileUpload`). Os trechos abaixo são todos os exemplos do showcase, na ordem e com os títulos do showcase (pt-BR), cada um cópia 1:1 do `*.tsx.sample` (comparada por script em 2026-11-09, seedgrid-fe-components `0f304bb`), em `apps/showcase/src/app/components/sg-input-date-time/samples/`, `sg-file-upload/samples/`, `sg-image-upload/samples/` e `sg-camera-capture/samples/`. API: [[SeedGrid/SeedGrid-components/inputs-midia/API|API de data e hora, imagem e câmera]].

## SgInputDateTime

### 1) Básico

O onChange entrega o instante em ISO 8601 UTC (ou null se o campo estiver incompleto).

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/basico.tsx.sample`.

```tsx
import * as React from "react";
import { SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [instant, setInstant] = React.useState<string | null>(null);

  return (
    <div className="w-80">
      <SgInputDateTime id="demo-basic" label="Quando" onChange={(value) => setInstant(value)} />
      <p className="mt-2 text-xs text-muted-foreground">Valor: {instant ?? "-"}</p>
    </div>
  );
}
```

### 2) Fusos horários

O mesmo instante exibido em UTC, -03:00 e +05:30; editar um campo atualiza os outros.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/fuso.tsx.sample`.

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
      <p className="text-xs text-muted-foreground">Valor: {instant || "-"}</p>
    </div>
  );
}
```

### 3) Limites e passo de minutos

minDate/maxDate validam o intervalo e minuteStep arredonda os minutos ao sair do campo.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/limites.tsx.sample`.

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

### 4) Com segundos

showSeconds mostra e aceita os segundos.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/segundos.tsx.sample`.

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

### 5) Eventos

onChange (instante ou null), onEnter (foco) e onExit (saída) informam o que o usuário fez.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/eventos.tsx.sample`.

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

### 6) Dentro de um formulário

O formulário guarda o instante ISO 8601 UTC.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/dentro-de-um-formulario.tsx.sample`.

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ appointment: string }>({ defaultValues: { appointment: "" } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.appointment))}>
      <SgInputDateTime
        id="demo-form"
        name="appointment"
        control={control}
        label="Agendamento"
        timeZone="-03:00"
        required
        requiredMessage="Informe a data e a hora"
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

### 7) Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/posicao-do-rotulo.tsx.sample`.

```tsx
import * as React from "react";
import { SgGrid, SgInputDateTime } from "@seedgrid/fe-components";

export default function App() {
  return (
    <SgGrid columns={{ base: 1, md: 3 }} gap={8} className="w-full">
      <SgInputDateTime id="sg-input-date-time-label-float" label="Flutuante" labelPosition="float" />
      <SgInputDateTime id="sg-input-date-time-label-top" label="Acima" labelPosition="top" />
      <SgInputDateTime
        id="sg-input-date-time-label-left"
        label="Esquerda"
        labelPosition="left"
        labelWidth={140}
        labelAlign="end"
      />
    </SgGrid>
  );
}
```

### 8) Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.datetime.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Fonte: `apps/showcase/src/app/components/sg-input-date-time/samples/idioma.tsx.sample`.

```tsx
import * as React from "react";
import { SgInputDateTime, SgComponentsI18nProvider } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgComponentsI18nProvider locale="fr" messages={{ "components.inputs.datetime.min": "Escolha uma data a partir de {min}." }}>
        <SgInputDateTime
          id="demo-i18n"
          label="Agendamento"
          timeZone="UTC"
          minDate="2026-11-01T08:00:00Z"
          defaultValue="2026-10-01T10:00:00Z"
          required
        />
      </SgComponentsI18nProvider>
    </div>
  );
}
```

## SgFileUpload

### 1) Básico

Um arquivo de qualquer tipo. O onChange entrega a lista (de um); o envio ao servidor é do host.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/basico.tsx.sample`.

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

### 2) Vários arquivos

maxFiles maior que 1 liga a seleção múltipla; os escolhidos se somam até o limite. Cada recusa é por arquivo.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/varios.tsx.sample`.

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

### 3) Tipos aceitos

mediaType aceita grupos (image, video, audio) e formatos (pdf, xls, xlsx...). O tipo é conferido pelo conteúdo do arquivo, não só pela extensão.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/tipos.tsx.sample`.

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

### 4) Limites de tamanho

maxSizePerFile e maxSizeTotal aceitam bytes ou texto com unidade ("500KB", "1.5MB", "1GB").

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/limites.tsx.sample`.

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

### 5) Desabilitado

Não permite escolher nem remover.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/desabilitado.tsx.sample`.

```tsx
import * as React from "react";
import { SgFileUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgFileUpload
        id="demo-disabled"
        label="Anexo"
        enabled={false}
        defaultValue={[{ name: "contrato.pdf", url: "/contrato.pdf", size: 482304 }]}
      />
    </div>
  );
}
```

### 6) Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.fileupload.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/idioma.tsx.sample`.

```tsx
import * as React from "react";
import { SgFileUpload, SgComponentsI18nProvider } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgComponentsI18nProvider locale="fr" messages={{ "components.inputs.fileupload.drop": "Arraste o contrato aqui" }}>
        <SgFileUpload
          id="demo-i18n"
          label="Anexo"
        />
      </SgComponentsI18nProvider>
    </div>
  );
}
```

### 7) Dentro de um formulário

O formulário guarda a lista de arquivos e valida o obrigatório.

Fonte: `apps/showcase/src/app/components/sg-file-upload/samples/dentro-de-um-formulario.tsx.sample`.

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgFileUpload } from "@seedgrid/fe-components";

export default function Example() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ comprovantes: Array<{ name: string }> }>({ defaultValues: { comprovantes: [] } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(`${values.comprovantes.length} arquivo(s)`))}>
      <SgFileUpload
        id="comprovantes"
        name="comprovantes"
        control={control}
        label="Comprovantes"
        maxFiles={3}
        required
        requiredMessage="Anexe ao menos um arquivo"
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgImageUpload

### 1) Básico

O onChange entrega a lista de imagens (de uma); o envio ao servidor é do host. O tipo é conferido pelo conteúdo do arquivo.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/basico.tsx.sample`.

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

### 2) Várias imagens

maxFiles maior que 1 liga a seleção múltipla e mostra a grade de miniaturas. As imagens recusadas não derrubam as demais.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/varias.tsx.sample`.

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

### 3) Regras de validação

accept, maxSizePerFile, minWidth/minHeight e aspect recusam a imagem com uma mensagem e disparam onError.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/regras.tsx.sample`.

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

### 4) Imagem já salva

Um item com url ({ name, url }) é uma imagem existente no servidor e já aparece na pré-visualização.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/valor-salvo.tsx.sample`.

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

### 5) Desabilitado

Não permite escolher nem remover.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/desabilitado.tsx.sample`.

```tsx
import * as React from "react";
import { SgImageUpload } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgImageUpload id="demo-disabled" label="Foto" enabled={false} />
    </div>
  );
}
```

### 6) Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.imageupload.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/idioma.tsx.sample`.

```tsx
import * as React from "react";
import { SgImageUpload, SgComponentsI18nProvider } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgComponentsI18nProvider locale="fr" messages={{ "components.inputs.imageupload.drop": "Arraste a foto aqui" }}>
        <SgImageUpload
          id="demo-i18n"
          label="Foto"
        />
      </SgComponentsI18nProvider>
    </div>
  );
}
```

### 7) Dentro de um formulário

O formulário guarda a lista de imagens e valida o obrigatório.

Fonte: `apps/showcase/src/app/components/sg-image-upload/samples/dentro-de-um-formulario.tsx.sample`.

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgImageUpload } from "@seedgrid/fe-components";

export default function Example() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ documento: Array<{ name: string }> }>({ defaultValues: { documento: [] } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.documento[0]?.name ?? "-"))}>
      <SgImageUpload
        id="documento"
        name="documento"
        control={control}
        label="Foto do documento"
        required
        requiredMessage="Escolha uma imagem"
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgCameraCapture

### 1) Básico

O onCapture entrega a imagem JPEG (Blob); o envio ao servidor é do host. Exige HTTPS e a permissão do navegador.

Fonte: `apps/showcase/src/app/components/sg-camera-capture/samples/basico.tsx.sample`.

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

### 2) Guia oval (selfie)

guide="oval" com a câmera frontal ajuda a centralizar o rosto.

Fonte: `apps/showcase/src/app/components/sg-camera-capture/samples/guia-oval.tsx.sample`.

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

### 3) Guia retangular (documento)

guide="rect" com a câmera traseira e resolução alta, para documentos.

Fonte: `apps/showcase/src/app/components/sg-camera-capture/samples/guia-retangular.tsx.sample`.

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

### 4) Erros de câmera

Sem permissão, sem câmera ou falha: o componente mostra o estado e chama onError com o código.

Fonte: `apps/showcase/src/app/components/sg-camera-capture/samples/erros.tsx.sample`.

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

### 5) Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.camera.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Fonte: `apps/showcase/src/app/components/sg-camera-capture/samples/idioma.tsx.sample`.

```tsx
import * as React from "react";
import { SgCameraCapture, SgComponentsI18nProvider } from "@seedgrid/fe-components";

export default function App() {
  return (
    <div className="w-80">
      <SgComponentsI18nProvider locale="fr" messages={{ "components.inputs.camera.capture": "Tirar foto agora" }}>
        <SgCameraCapture
          id="demo-i18n"
          label="Foto"
        />
      </SgComponentsI18nProvider>
    </div>
  );
}
```

### Câmera e galeria juntas (composição, exemplo próprio)

Receita **sugerida** pelos `compositionHints` dos metas (**Inferência**, não é um sample do showcase): `SgCameraCapture` para tirar na hora e `SgImageUpload` para escolher da galeria; em ambos, o envio fica com o host (use o `File` ou o `Blob` recebido no serviço de arquivos do projeto).
