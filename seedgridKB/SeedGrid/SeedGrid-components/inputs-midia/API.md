---
tags: [seedgrid, component, frontend, react, inputs-midia, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: 839e245
analisado-em: 2026-11-04
description: "API React de Data e hora, imagem e câmera (@seedgrid/fe-components): props completas de SgInputDateTime, SgImageUpload e SgCameraCapture com tipo e padrão, eventos e códigos de erro. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Data e hora, imagem e câmera: API — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **API do `SgImageUpload` vai mudar (P141, decidido pelo dono em 2026-11-04):** o Flutter já usa a nova (valor sempre `lista`, `maxFiles`, `maxSizePerFile`/`maxSizeTotal` com texto como `"1.5MB"`, e o novo `SgFileUpload` como base); **o React ainda tem a API antiga descrita abaixo** (`File`, `maxSizeBytes`) até a rodada P141.F4, depois da validação do Flutter. Ver [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API Flutter]].

> **Ainda não publicado no npm** (commit local `839e245`, 2026-11-04; ver o aviso na [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Visão geral]]). A API abaixo é a do código commitado.

Import: `import { SgInputDateTime, SgImageUpload, SgCameraCapture } from "@seedgrid/fe-components";`. Contexto: [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos]].

## `SgInputDateTime`

Tipo de props: `SgInputDateTimeProps = Omit<SgInputTextProps, "type" | "onChange"> & { … }`. Além das props abaixo, **herda** as de [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato base SgInputText|SgInputText]] (rótulo, `labelPosition`, `labelWidth`, `labelAlign`, `clearButton`, `elevation`, `borderRadius`, `placeholder`, `disabled`, `readOnly`, `required`, `name`/`control`/`register`/`rules` do react-hook-form, etc.). **Confirmado** em `SgInputDateTime.tsx`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador único do campo. |
| `value` | `string \| Date \| null` | — | Não | Instante controlado: ISO 8601 (com offset ou `Z`) ou `Date`. `null` ou `""` limpa o campo. |
| `defaultValue` | `string \| Date \| null` | — | Não | Instante inicial (não controlado). |
| `onChange` | `(value: string \| null, local: string) => void` | — | Não | A cada alteração: instante ISO 8601 **UTC** (`2026-11-03T17:30:00.000Z`) ou `null` se vazio, incompleto ou inválido; `local` é o texto do campo no fuso do campo (`2026-11-03T14:30`). |
| `minDate` | `string \| Date` | — | Não | Menor instante permitido. |
| `maxDate` | `string \| Date` | — | Não | Maior instante permitido. |
| `timeZone` | `string` | `"local"` | Não | Fuso em que o campo mostra e interpreta a hora: `"local"`, `"UTC"`, deslocamento fixo (`"+03:00"`, `"-03:00"`) ou nome IANA. |
| `showSeconds` | `boolean` | `false` | Não | Mostra e aceita segundos. |
| `minuteStep` | `number` | — | Não | Passo dos minutos (1, 5, 10, 15, 30…). Ignorado com `showSeconds`. |
| `onEnter` | `() => void` | — | Não | Ao receber foco. |
| `onExit` | `() => void` | — | Não | Ao perder o foco, depois da validação. |
| `alwaysFloat` | `boolean` | — | Não | Mantém o rótulo flutuante. |

**Erros de validação** (`DateTimeErrorCode`, de `dateTimeLogic.ts`): `required`, `invalid`, `min`, `max`, `range`. As mensagens usam `components.inputs.datetime.*`.

**Comportamento do valor (Confirmado):** o campo **mostra** a hora no `timeZone` escolhido, mas o `onChange` **sempre entrega UTC**. Com `react-hook-form`, o valor fica com o RHF (a prop `value` não é necessária).

## `SgImageUpload`

Tipo de props: `SgImageUploadProps = RhfFieldProps & { … }` (`name`/`control` do react-hook-form; ver [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato RhfFieldProps (react-hook-form)|Contrato RhfFieldProps]]).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador único do campo. |
| `label` / `labelText` | `string` | — | Não | Rótulo acima da área. |
| `value` | `File \| string \| null` | — | Não | Imagem controlada: `File` escolhido, **URL** de uma imagem já salva ou `null`. |
| `defaultValue` | `File \| string \| null` | — | Não | Imagem inicial (não controlada); aceita a URL de uma imagem salva. |
| `onChange` | `(file: File \| null) => void` | — | Não | Arquivo **válido** escolhido, ou `null` ao remover. O envio ao servidor é do host. |
| `onError` | `(code: ImageErrorCode, message: string) => void` | — | Não | Arquivo recusado. `message` já vem traduzida. |
| `accept` | `string` | `"image/*"` | Não | Tipos aceitos separados por vírgula: `image/*`, `image/png`, `.png`. |
| `maxSizeBytes` | `number` | — | Não | Tamanho máximo em bytes. |
| `minWidth` | `number` | — | Não | Largura mínima em px. |
| `minHeight` | `number` | — | Não | Altura mínima em px. |
| `aspect` | `number` | — | Não | Proporção largura/altura exigida (`1` = quadrada, `16 / 9`). |
| `previewHeight` | `number` | `160` | Não | Altura da área de pré-visualização em px. |
| `hintText` | `string` | — | Não | Texto de ajuda sob a área. |
| `required` | `boolean` | `false` | Não | Campo obrigatório. |
| `requiredMessage` | `string` | — | Não | Mensagem do erro de obrigatório. |
| `disabled` | `boolean` | `false` | Não | Desabilita a escolha e a remoção. |
| `readOnly` | `boolean` | `false` | Não | Só mostra a imagem; sem trocar nem remover. |
| `className` | `string` | — | Não | Classe CSS do contêiner. |
| `onEnter` / `onExit` | `() => void` | — | Não | Foco entrou/saiu. |

**Códigos de erro** (`ImageErrorCode`): `type` (fora de `accept`), `size` (acima de `maxSizeBytes`), `dimension` (menor que `minWidth`×`minHeight`), `aspect` (proporção diferente de `aspect`, com tolerância de 2%). A ordem de verificação é a de `validateImage` (`imageUploadLogic.ts`). Sem recorte e sem compressão. **Confirmado**.

## `SgCameraCapture`

Tipo de props: `SgCameraCaptureProps` (não usa `RhfFieldProps`).

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador único do componente. |
| `label` / `labelText` | `string` | — | Não | Rótulo acima da pré-visualização. |
| `facing` | `"user" \| "environment"` | `"user"` | Não | Câmera inicial: frontal (`user`) ou traseira (`environment`). |
| `guide` | `"none" \| "oval" \| "rect"` | `"none"` | Não | Guia de enquadramento sobre a pré-visualização. |
| `resolution` | `"low" \| "medium" \| "high"` | `"medium"` | Não | Resolução pedida: `low` 640×480, `medium` 1280×720, `high` 1920×1080. |
| `onCapture` | `(image: Blob) => void` | — | Não | Imagem **JPEG** capturada. O envio ao servidor é do host. |
| `onError` | `(code: CameraErrorCode, message: string) => void` | — | Não | Câmera indisponível. `message` já vem traduzida. |
| `allowSwitch` | `boolean` | `true` | Não | Mostra o botão de alternar frontal/traseira. |
| `previewHeight` | `number` | `320` | Não | Altura da pré-visualização em px. |
| `hintText` | `string` | — | Não | Texto de ajuda. |
| `disabled` | `boolean` | `false` | Não | Não abre a câmera nem permite capturar. |
| `className` | `string` | — | Não | Classe CSS do contêiner. |

**Códigos de erro** (`CameraErrorCode`): `permission` (permissão negada), `noCamera` (nenhuma câmera), `failed` (qualquer outra falha); a classificação do erro do navegador é `classifyCameraError` (`cameraLogic.ts`). A trilha da câmera é **liberada ao desmontar** o componente. **Confirmado**; `onFrame` não existe na versão 1.

## Internacionalização

Chaves em `src/i18n/*.ts` (cinco idiomas: `pt-BR`, `pt-PT`, `en-US`, `es`, `fr`), resolvidas pelo `SgComponentsI18nProvider`:

| Grupo | Chaves |
|---|---|
| `SgInputDateTime` | `components.inputs.datetime.invalid`, `.range`, `.min`, `.max` |
| `SgImageUpload` | `components.inputs.imageupload.drop`, `.change`, `.remove`, `.loading`, `.type`, `.size`, `.dimension`, `.aspect` |
| `SgCameraCapture` | `components.inputs.camera.capture`, `.switch`, `.starting`, `.permission`, `.noCamera`, `.failed`, `.retry` |

## Manifesto de IA e MCP

Cada componente tem `*.meta.ts` (`componentId` `form.input.datetime`, `form.input.image-upload`, `form.input.camera-capture`; `rendererType` SDUI `field.datetime`, `field.image`, `field.camera`). O `seedgrid-components-mcp` foi sincronizado com **107 componentes React** e **92 Flutter** (commit local `8830909`, sem push; o push dispara o deploy do MCP).
