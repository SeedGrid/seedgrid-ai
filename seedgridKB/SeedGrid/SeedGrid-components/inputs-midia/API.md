---
tags: [seedgrid, component, frontend, react, inputs-midia, api]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: bb0ad1f
analisado-em: 2026-11-04
description: "API React de Data e hora, imagem e câmera (@seedgrid/fe-components): props completas de SgInputDateTime, SgFileUpload, SgImageUpload e SgCameraCapture com tipo e padrão, eventos e códigos de erro. Plataforma React; a API Flutter equivalente está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Data e hora, imagem e câmera: API — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **Nova API do upload (P141, validada pelo dono no Flutter em 2026-11-04):** `SgFileUpload` é o componente base de arquivos e `SgImageUpload` é composição dele. O valor é **sempre uma lista**, `maxFiles` (padrão `1`) substitui o `multiple`, `maxSizePerFile`/`maxSizeTotal` aceitam bytes ou texto como `"1.5MB"`, e o tipo é conferido pelo conteúdo. **Sem retrocompatibilidade**: `maxSizeBytes` e o valor `File | string | null` do `SgImageUpload` deixaram de existir. Código no commit local `bb0ad1f` do `fe-components`. Ver [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API Flutter]] (a mesma API).

> **Publicado no npm em 2026.11.2** (`@seedgrid/fe-components`, a partir do commit `9552636`, 2026-11-04; ver o aviso na [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Visão geral]]). A API abaixo é a do código commitado.

Import: `import { SgInputDateTime, SgFileUpload, SgImageUpload, SgCameraCapture } from "@seedgrid/fe-components";`. Contexto: [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos]].

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

## `SgFileUpload`

Tipo de props: `SgFileUploadProps = RhfFieldProps & { … }` (`name`/`control` do react-hook-form; ver [[SeedGrid/SeedGrid-components/inputs-texto/API#Contrato RhfFieldProps (react-hook-form)|Contrato RhfFieldProps]]). É o componente **base** de arquivos: o `SgImageUpload` é uma **composição** dele (não herança de classe). **Sem retrocompatibilidade** (decisão do dono, P141): o valor é **sempre uma lista**.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| `id` | `string` | — | Sim | Identificador único do campo. |
| `label` / `labelText` | `string` | — | Não | Rótulo acima da área. |
| `value` | `SgFileValue[] \| null` | — | Não | Arquivos controlados (sempre lista; um arquivo = lista de um). |
| `defaultValue` | `SgFileValue[]` | — | Não | Arquivos iniciais (não controlado). |
| `onChange` | `(files: SgFileValue[]) => void` | — | Não | Lista de arquivos **válidos** após escolher ou remover. O envio ao servidor é do host. |
| `onError` | `(code: FileErrorCode, message: string, fileName: string) => void` | — | Não | Arquivo recusado: código, mensagem já traduzida e nome do arquivo. **Por arquivo**: os demais seguem válidos. |
| `mediaType` | `MediaType[]` | todos | Não | Tipos aceitos (`image`, `pdf`, `xlsx`…). O tipo é conferido **pelo conteúdo** do arquivo (assinatura), não só pela extensão. |
| `accept` | `string` | — | Não | Tipos extras em texto livre (`.pdf`, `image/png`, `image/*`), separados por vírgula. **Soma-se** ao `mediaType`. |
| `maxFiles` | `number` | `1` | Não | Quantos arquivos o campo guarda. Com `1`, escolher outro **substitui** o atual; maior que `1` liga a seleção múltipla. Não existe `multiple`. |
| `maxSizePerFile` | `SizeLimit` | sem limite | Não | Tamanho máximo de cada arquivo: **número (bytes)** ou **texto com unidade** (`"500KB"`, `"1.5MB"`, `"1GB"`). |
| `maxSizeTotal` | `SizeLimit` | sem limite | Não | Tamanho máximo da soma dos arquivos (mesmo formato). |
| `hintText` | `string` | — | Não | Texto de ajuda sob a área. |
| `required` / `requiredMessage` | `boolean` / `string` | — | Não | Obrigatório e a mensagem. |
| `disabled` / `readOnly` | `boolean` | `false` | Não | Desabilita a escolha e a remoção / só mostra. |
| `error` | `string` | — | Não | Mensagem de erro externa. |
| `onEnter` / `onExit` | `() => void` | — | Não | Foco entrou/saiu. |
| `pickerAccept` | `string` | derivado de `mediaType`/`accept` | Não | **Só no React:** valor do atributo `accept` do seletor do navegador. |
| `extraCheck` | `(file: File, info: { mime: string }) => Promise<SgFileRejection \| null>` | — | Não | Regra extra, assíncrona, por arquivo, depois da conferência de tipo (é como o `SgImageUpload` confere dimensão e proporção). |
| `thumbnailBuilder` | `(file: SgFileValue, size: number) => ReactNode` | ícone do tipo | Não | Miniatura de cada arquivo. |
| `thumbnailSize` | `number` | `96` | Não | Lado da miniatura em px. |
| `keyPrefix` | `string` | — | Não | Prefixo do `data-sg` dos elementos internos (`sg-file`, `sg-image`). |
| `dropTextKey` / `dropManyTextKey` | `string` | — | Não | Chaves de i18n do texto da área vazia (um arquivo / vários). |
| `typeNames` | `string` | derivado | Não | Texto dos tipos aceitos na mensagem de tipo recusado. |

**Tipos (Confirmado em `SgFileUpload.tsx` e `fileUploadLogic.ts`):**

- `SgFileValue = File | SgSavedFile`; `SgSavedFile = { name: string; url: string; size?: number; type?: string }`. Um arquivo **já salvo** no servidor entra como `{ name, url }` (sem bytes).
- `MediaType`: `image`, `video`, `audio` (**grupos**, `image/*` etc.) e `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `csv`, `txt`, `zip` (**formatos**), mais `all`. Cada valor tem extensões e MIME próprios.
- `SizeLimit = number | string`.
- `FileErrorCode`: `type` (fora do aceito), `size` (acima de `maxSizePerFile`), `count` (acima de `maxFiles`), `total` (soma acima de `maxSizeTotal`), `dimension` e `aspect` (só vêm de regra extra, como a do `SgImageUpload`).

**Unidades de tamanho:** `B`, `KB`, `MB`, `GB`, `TB`; **base 1024**; maiúscula ou minúscula; decimal com ponto (`"1.5MB"`); espaço opcional; **número puro = bytes**; texto inválido, vazio ou negativo = **sem limite** (`parseSize`).

**Ordem das regras por arquivo** (`planAdd`): tipo, tamanho por arquivo, quantidade, tamanho total; a regra extra (`extraCheck`) vem depois do tipo. Cada recusa fica no seu arquivo.

**Tipo pelo conteúdo:** o MIME declarado pelo navegador e a extensão são conferidos com a **assinatura** do arquivo (`resolveMime`, `sniffMime`), então um `.jfif` ou um arquivo sem extensão reconhecida é aceito como imagem quando o conteúdo é imagem.

**Arrastar e soltar:** a área aceita arrastar arquivos (`onDrop`) além do clique. **Só no React**: o Flutter não tem arrastar e soltar.

## `SgImageUpload`

Tipo de props: `SgImageUploadProps = Omit<SgFileUploadProps, "mediaType" | "extraCheck" | "thumbnailBuilder" | "thumbnailSize" | "dropTextKey" | "dropManyTextKey" | "typeNames" | "pickerAccept" | "keyPrefix"> & { … }`. É uma **composição** do `SgFileUpload` com `mediaType: ["image"]`, miniatura da imagem e as regras que só existem para imagem. **Funciona igual ao `SgFileUpload`** (decisão do dono): valor sempre lista, `maxFiles` (padrão `1`), `maxSizePerFile`/`maxSizeTotal`, `onError` com o nome do arquivo, `value`/`defaultValue`/`onChange` com `SgFileValue[]`, formulário. **Removidos** (sem retrocompatibilidade): o valor `File \| string \| null` e `maxSizeBytes`.

| Prop | Tipo | Padrão | Obrigatória | Descrição |
|---|---|---|---|---|
| (as do `SgFileUpload` acima, menos as omitidas) | — | — | — | `id`, `label`, `value`, `defaultValue`, `onChange`, `onError`, `maxFiles`, `maxSizePerFile`, `maxSizeTotal`, `hintText`, `required`, `requiredMessage`, `disabled`, `readOnly`, `error`, `onEnter`, `onExit`, `name`/`control`. |
| `accept` | `string` | `"image/*"` | Não | **Estreita** os formatos de imagem (`image/png,image/jpeg`, `.png`). No `SgFileUpload` o `accept` soma; aqui restringe. |
| `minWidth` | `number` | — | Não | Largura mínima em px. |
| `minHeight` | `number` | — | Não | Altura mínima em px. |
| `aspect` | `number` | — | Não | Proporção largura/altura exigida (`1` = quadrada, `16 / 9`; tolerância de 2%). |
| `previewHeight` | `number` | `160` | Não | Altura da miniatura em px (na grade de vários, no máximo `120`). |

**Códigos de erro:** os do `SgFileUpload` (`type`, `size`, `count`, `total`) mais `dimension` (menor que `minWidth`×`minHeight`) e `aspect` (proporção diferente de `aspect`). A leitura de largura e altura só roda quando há `minWidth`, `minHeight` ou `aspect`. Sem recorte e sem compressão. **Confirmado** em `SgImageUpload.tsx` e `imageUploadLogic.ts`.

**Várias imagens:** com `maxFiles` maior que `1` a pré-visualização vira **grade**; com `1`, miniatura maior de um arquivo.

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
| `SgFileUpload` | `components.inputs.fileupload.drop`, `.dropMany`, `.file`, `.remove`, `.loading`, `.type`, `.size`, `.total`, `.count` |
| `SgImageUpload` | `components.inputs.imageupload.drop`, `.dropMany`, `.change`, `.remove`, `.loading`, `.type`, `.size`, `.dimension`, `.aspect` |
| `SgCameraCapture` | `components.inputs.camera.capture`, `.switch`, `.starting`, `.permission`, `.noCamera`, `.failed`, `.retry` |

## Manifesto de IA e MCP

Cada componente tem `*.meta.ts` (`componentId` `form.input.datetime`, `form.input.file-upload`, `form.input.image-upload`, `form.input.camera-capture`; `rendererType` SDUI `field.datetime`, `field.file`, `field.image`, `field.camera`). O `seedgrid-components-mcp` foi sincronizado com o `SgFileUpload` e o `SgImageUpload` refeito (commit local `d3f5f64`, sem push; o push dispara o deploy do MCP); a descrição do `SgFileUpload` no manifesto lista `thumbnailBuilder` e as props extras.
