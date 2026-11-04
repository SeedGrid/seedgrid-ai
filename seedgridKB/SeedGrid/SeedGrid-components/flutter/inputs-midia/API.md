---
description: "API Flutter de Data e hora, imagem e câmera: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, enums e erros de SgInputDateTime, SgImageUpload e SgCameraCapture."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 00e893c
analisado-em: 2026-11-04
---

# API — Data e hora, imagem e câmera (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/inputs-midia/API|API — Data e hora, imagem e câmera (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|Visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos]].

> **Como ler as tabelas.** Montadas a partir dos construtores Dart (commit `6a35c93`). Os nomes e os padrões são os do React; o contrato gerado fica em `lib/src/generated/sg_input_date_time.g.dart`, `sg_file_upload.g.dart`, `sg_image_upload.g.dart` e `sg_camera_capture.g.dart`. Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`

## SgInputDateTime

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputDateTime` (mesmo nome).

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_date_time.dart` · classe `SgInputDateTime extends StatefulWidget`; lógica pura em `sg_date_time_logic.dart`.
- Aceita as props de texto/rótulo do contrato (`labelText`, `labelPosition`, `placeholder`, `hintText`, `clearButton`, `elevation`, `borderRadius`, `readOnly`, `disabled`, `required`, `rules`, `name`/`control`, `onEnter`, `onExit`, …).

| Parâmetro | Tipo | Padrão | Origem | Descrição |
|---|---|---|---|---|
| `id` | `String` | obrigatório | React | Identificador único. |
| `value` | `Object?` | — | React | Instante controlado: `String` ISO 8601 ou `DateTime`. |
| `defaultValue` | `Object?` | — | React | Instante inicial (não controlado). |
| `onChange` | `void Function(String? value, String local)?` | — | React | Instante ISO 8601 UTC (ou `null`) e o texto local do campo. |
| `minDate` / `maxDate` | `Object?` | — | React | Menor e maior instante permitidos. |
| `timeZone` | `String?` | `local` | React | `local`, `UTC` ou deslocamento fixo (`-03:00`). Nome IANA cai em `local`. |
| `showSeconds` | `bool?` | `false` | React | Mostra e aceita segundos. |
| `minuteStep` | `int?` | — | React | Passo dos minutos. Ignorado com `showSeconds`. |
| `control` / `name` | `SgFormController?` / `String?` | — | React | Ligação com o formulário; `rules` rodam no submit. |
| `alwaysFloat` | `bool?` | — | React | **Sem efeito** no Flutter. |

## SgFileUpload

> **Flutter** · estado de paridade: **portado no Flutter; React pendente (P141.F4)** · é o componente **base** de arquivos; o `SgImageUpload` o compõe.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/files/sg_file_upload.dart`; lógica pura em `sg_file_logic.dart`. Contrato: `tools/gen_props/contratos/P141-file-upload.json` (manual até o React implementar). Vetores compartilhados: `test/widgets/file_upload_vectors`.
- **Sem retrocompatibilidade:** o valor é **sempre uma lista de `SgFile`** (um arquivo = lista de um). `SgImageFile` foi removido.

| Parâmetro | Tipo | Padrão | Origem | Descrição |
|---|---|---|---|---|
| `id` | `String` | obrigatório | P141 | Identificador único. |
| `label` / `labelText` | `String?` | — | P141 | Rótulo. |
| `value` | `List<SgFile>?` | — | P141 | Arquivos controlados (sempre lista). |
| `defaultValue` | `List<SgFile>?` | — | P141 | Arquivos iniciais (não controlado). `SgFile` com `url` mostra um arquivo já salvo. |
| `onChange` | `ValueChanged<List<SgFile>>?` | — | P141 | Lista de arquivos **válidos** após escolher ou remover. |
| `onError` | `void Function(SgFileError code, String message, String fileName)?` | — | P141 | Arquivo recusado; `message` traduzida. **Por arquivo**: os demais seguem válidos. |
| `mediaType` | `List<SgMediaType>?` | todos | P141 | Tipos aceitos (`image`, `pdf`, `xlsx`…). **Conferido pelo conteúdo** (assinatura), não só pela extensão. |
| `accept` | `String?` | — | P141 | Tipos extras em texto livre (`.pdf`, `image/png`, `image/*`), separados por vírgula. **Soma-se** ao `mediaType`. |
| `maxFiles` | `num?` | `1` | P141 | Quantos arquivos o campo guarda. Com `1`, escolher outro **substitui**; maior que `1` liga a seleção múltipla e a grade. Não há prop `multiple`. |
| `maxSizePerFile` | `Object?` | sem limite | P141 | Tamanho máximo de cada arquivo: **número (bytes)** ou **texto com unidade** (`"500KB"`, `"1.5MB"`, `"1GB"`). |
| `maxSizeTotal` | `Object?` | sem limite | P141 | Tamanho máximo da soma dos arquivos (mesmo formato). |
| `hintText` | `String?` | — | P141 | Texto de ajuda. |
| `required` / `requiredMessage` | `bool?` / `String?` | — | P141 | Obrigatório e a mensagem. |
| `disabled` / `readOnly` | `bool?` | — | P141 | Desabilita / só mostra. |
| `name` / `control` / `rules` | — | — | P141 | Ligação com o formulário (`rules` no submit). |
| `picker` | `SgFilePicker?` | seletor do sistema | **extra do Flutter** | Substitui o seletor (testes ou outra origem). |
| `extraCheck` | `SgFileCheck?` | — | **extra do Flutter** | Regra extra por arquivo (é como o `SgImageUpload` confere dimensão e proporção). |
| `thumbnailBuilder` / `thumbnailSize` | — | `96` px | **extra do Flutter** | Miniatura de cada arquivo. |
| `keyPrefix`, `dropTextKey`, `dropManyTextKey`, `typeNames` | — | — | **extra do Flutter** | Chaves de widget e textos usados pela composição. |

**Tipos:**
- `SgFile({name, bytes?, url?, mimeType?, size?})`: `bytes` para o arquivo escolhido; `url` para um já salvo; `size` é `bytes.length` quando há bytes.
- `SgMediaType`: `image`, `video`, `audio` (**grupos**) e `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `csv`, `txt`, `zip` (**formatos**), mais `all`. Cada valor guarda extensões e MIME.
- `SgFileError { type, size, total, count, dimension, aspect }`: `type` (fora do aceito), `size` (acima de `maxSizePerFile`), `total` (soma acima de `maxSizeTotal`), `count` (acima de `maxFiles`); `dimension` e `aspect` só no `SgImageUpload`.

**Unidades de tamanho (decisão da F1):** `B`, `KB`, `MB`, `GB`, `TB`; **base 1024**; **sem diferenciar maiúscula/minúscula**; aceita decimal (`"1.5MB"`); número puro é bytes; **texto inválido = sem limite**.

**Tipo pelo conteúdo:** sem extensão conhecida, o tipo é deduzido da **assinatura** do arquivo (png, jpeg, gif, webp, bmp, tiff, ico, avif, heic, svg), então `.jfif` e arquivos sem extensão passam (correção do commit `130d184`).

## SgImageUpload

> **Flutter** · estado de paridade: **portado no Flutter; React pendente (P141.F4)** · **composição** do `SgFileUpload` (não herança): mesmas regras, mais as de imagem.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/files/sg_image_upload.dart` (`StatelessWidget` que monta um `SgFileUpload` com `mediaType: [image]`, miniaturas e `extraCheck`).
- Tem as mesmas props de limite e valor do `SgFileUpload` (`value`/`defaultValue`/`onChange` em `List<SgFile>`, `maxFiles` padrão `1`, `maxSizePerFile`, `maxSizeTotal`, `onError` com o nome do arquivo, `picker`, formulário) **e** as de imagem abaixo. **`maxSizeBytes` foi removido** (agora `maxSizePerFile`).

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `accept` | `String?` | — | **Estreita** os formatos de imagem (`.png`, `image/jpeg`). No `SgFileUpload` o `accept` soma; aqui restringe. |
| `minWidth` / `minHeight` | `num?` | — | Dimensão mínima em px (erro `dimension`). |
| `aspect` | `num?` | — | Proporção largura/altura exigida (`1` = quadrada; erro `aspect`). |
| `previewHeight` | `num?` | `160` | Altura da miniatura; na grade (vários), no máximo `120`. |

`maxFiles > 1` mostra a **grade de miniaturas**. Sem recorte e sem compressão. Dimensão e proporção são lidas só quando há `minWidth`, `minHeight` ou `aspect`.

## SgCameraCapture

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCameraCapture` (mesmo nome).

- Arquivo: `packages/seedgrid_components/lib/src/inputs/camera/sg_camera_capture.dart`; lógica pura em `sg_camera_logic.dart`.

| Parâmetro | Tipo | Padrão | Origem | Descrição |
|---|---|---|---|---|
| `id` | `String` | obrigatório | React | Identificador único. |
| `label` / `labelText` | `String?` | — | React | Rótulo acima da pré-visualização. |
| `facing` | `SgCameraCaptureFacing?` | `user` | React | `user` (frontal) ou `environment` (traseira). |
| `guide` | `SgCameraCaptureGuide?` | `none` | React | `none`, `oval` ou `rect`. |
| `resolution` | `SgCameraCaptureResolution?` | `medium` | React | `low`, `medium` ou `high`. |
| `onCapture` | `ValueChanged<Uint8List>?` | — | React | Imagem **JPEG** capturada (bytes). |
| `onError` | `void Function(SgCameraError code, String message)?` | — | React | Câmera indisponível; `message` já traduzida. |
| `allowSwitch` | `bool?` | `true` | React | Botão de alternar frontal/traseira. |
| `previewHeight` | `num?` | `320` | React | Altura da pré-visualização. |
| `hintText` | `String?` | — | React | Texto de ajuda. |
| `disabled` | `bool?` | — | React | Não abre a câmera. |
| `backend` | `SgCameraBackend` | `SgSystemCameraBackend()` (pacote `camera`) | **extra do Flutter** | Origem da câmera, injetável nos testes. |

**Web:** a prévia da câmera frontal é espelhada e a foto capturada **não** é; no Flutter web a câmera usa `getUserMedia` próprio (o `camera_web` falhava com câmeras virtuais paradas).

**Tipos:** `SgCameraError { permission, noCamera, failed }`; `SgCameraBackend` (`list()` e `open(camera, resolution)` devolvendo um `SgCameraSession` com `buildPreview()`, `capture()` e `dispose()`); `SgCameraException(code, [message])`. A classificação do erro da plataforma é `sgClassifyCameraError`. O pacote `camera` (`^0.12.0+2`) é dependência do `seedgrid_components`.

## Internacionalização

Chaves `components.inputs.datetime.*`, `components.inputs.fileupload.*` (`drop`, `dropMany`, `remove`, `loading`, `type`, `size`, `total`, `count`, `file`), `components.inputs.imageupload.*` e `components.inputs.camera.*` nos cinco idiomas (`messages_pt_br.dart`, `messages_pt_pt.dart`, `messages_en_us.dart`, `messages_es.dart`, `messages_fr.dart`). Os textos do showcase dos quatro componentes têm tradução em `tools/showcase_i18n/traducoes/`.

## Não verificado

- Não executei o showcase nem `flutter test`; os números (3757 testes do pacote, 825 do showcase) vêm do relato da `front` antes do commit.
- A câmera **não foi testada em dispositivo real**; só com `SgCameraBackend` simulado.
