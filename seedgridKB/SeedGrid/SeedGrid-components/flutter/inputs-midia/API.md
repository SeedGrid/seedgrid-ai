---
description: "API Flutter de Data e hora, imagem e câmera: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, enums e erros de SgInputDateTime, SgImageUpload e SgCameraCapture."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 6a35c93
analisado-em: 2026-11-04
---

# API — Data e hora, imagem e câmera (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/inputs-midia/API|API — Data e hora, imagem e câmera (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|Visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos]].

> **Como ler as tabelas.** Montadas a partir dos construtores Dart (commit `6a35c93`). Os nomes e os padrões são os do React; o contrato gerado fica em `lib/src/generated/sg_input_date_time.g.dart`, `sg_image_upload.g.dart` e `sg_camera_capture.g.dart`. Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`

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

## SgImageUpload

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgImageUpload` (mesmo nome).

- Arquivo: `packages/seedgrid_components/lib/src/inputs/files/sg_image_upload.dart`; lógica pura em `sg_image_upload_logic.dart`.

| Parâmetro | Tipo | Padrão | Origem | Descrição |
|---|---|---|---|---|
| `id` | `String` | obrigatório | React | Identificador único. |
| `label` / `labelText` | `String?` | — | React | Rótulo acima da área. |
| `value` | `Object?` | — | React | Imagem controlada: `SgImageFile` ou URL em texto. |
| `defaultValue` | `Object?` | — | React | Imagem inicial (não controlada): `SgImageFile` ou URL em texto. |
| `onChange` | `ValueChanged<SgImageFile?>?` | — | React | Imagem **válida** escolhida, ou `null` ao remover. |
| `onError` | `void Function(SgImageError code, String message)?` | — | React | Imagem recusada; `message` já traduzida. |
| `accept` | `String?` | `image/*` | React | Tipos aceitos separados por vírgula. |
| `maxSizeBytes` | `num?` | — | React | Tamanho máximo em bytes. |
| `minWidth` / `minHeight` | `num?` | — | React | Dimensão mínima em px. |
| `aspect` | `num?` | — | React | Proporção largura/altura exigida. |
| `previewHeight` | `num?` | `160` | React | Altura da pré-visualização. |
| `hintText` | `String?` | — | React | Texto de ajuda. |
| `required` / `requiredMessage` | `bool?` / `String?` | — | React | Obrigatório e a mensagem. |
| `disabled` / `readOnly` | `bool?` | — | React | Desabilita / só mostra. |
| `name` / `control` / `rules` | — | — | React | Ligação com o formulário. |
| `picker` | `SgImagePicker?` (`Future<SgImageFile?> Function(String? accept)`) | `file_picker` | **extra do Flutter** | Substitui o seletor (testes ou outra origem); devolve `null` se o usuário cancelar. |

**Tipos:** `SgImageFile({name, bytes, mimeType})` com `size` = `bytes.length`; enum `SgImageError { type, size, dimension, aspect }`. Sem arrastar e soltar, sem recorte e sem compressão.

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

**Tipos:** `SgCameraError { permission, noCamera, failed }`; `SgCameraBackend` (`list()` e `open(camera, resolution)` devolvendo um `SgCameraSession` com `buildPreview()`, `capture()` e `dispose()`); `SgCameraException(code, [message])`. A classificação do erro da plataforma é `sgClassifyCameraError`. O pacote `camera` (`^0.12.0+2`) é dependência do `seedgrid_components`.

## Internacionalização

Mesmas chaves do React (`components.inputs.datetime.*`, `components.inputs.imageupload.*`, `components.inputs.camera.*`) nos cinco idiomas (`messages_pt_br.dart`, `messages_pt_pt.dart`, `messages_en_us.dart`, `messages_es.dart`, `messages_fr.dart`). Os textos do showcase dos três componentes têm tradução em `tools/showcase_i18n/traducoes/`.

## Não verificado

- Não executei o showcase nem `flutter test`; os números (3757 testes do pacote, 825 do showcase) vêm do relato da `front` antes do commit.
- A câmera **não foi testada em dispositivo real**; só com `SgCameraBackend` simulado.
