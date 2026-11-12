---
description: "API Flutter de Data e hora, arquivo, imagem, câmera e seletor de cor: construtor, props com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, enums e erros de SgInputDateTime, SgFileUpload, SgImageUpload, SgCameraCapture e SgColorPicker."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 8a43f9d
analisado-em: 2026-11-07
---

# API — Data e hora, arquivo, imagem, câmera e cor (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/inputs-midia/API|API — Data e hora, imagem e câmera (React)]] (o `SgColorPicker` só existe no Flutter). Visão geral: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|Visão geral]]. Exemplos: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos]].

> **Como ler as tabelas.** Montadas a partir do manifesto do Flutter e dos construtores Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome igual ao do React) ou `Flutter` (extra do Dart, como `picker`, `backend`). O contrato gerado fica em `lib/src/generated/sg_input_date_time.g.dart`, `sg_file_upload.g.dart`, `sg_image_upload.g.dart` e `sg_camera_capture.g.dart`; o `SgColorPicker` não tem contrato gerado (props escritas à mão em `sg_color_picker_props.dart`). Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`

> **Validação por props diretas.** Não existem mais `SgRules` nem a prop `rules` no Flutter (removidos na P153.F2.T3): a validação usa props como `required`, `requiredMessage` e `validation`. A inversão `disabled` foi substituída por `enabled` (P149), igual ao React.

## SgInputDateTime

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgInputDateTime` (mesmo nome).

Campo de data e hora com o texto no idioma ativo e a hora no fuso escolhido; entrega e recebe o valor em `local` (padrão), `utc` ou `offset` (`valueMode`).

> **Atualização de 2026-11-12 (P155.F3.T9).** Seção conferida contra o código Dart local do `fe-flutter` (commit local `f914390`, sem push; árvore em `19f7830`), com arquivo e linha. **Mudança que quebra:** o padrão do valor passa a ser `local` (`2026-01-15T10:30`); antes era o instante UTC com milissegundos (`...T17:30:00.000Z`). Para manter o instante use `valueMode: SgInputDateTimeValueMode.utc`. O Flutter agora entende nome IANA (tabela do `SgClock`, 2019 a 2045); a antiga limitação "IANA cai em `local`" saiu (nome desconhecido ainda cai em `local`).

- Arquivo: `packages/seedgrid_components/lib/src/inputs/masked/sg_input_date_time.dart` · classe `class SgInputDateTime extends StatefulWidget implements SgInputDateTimeProps`; lógica pura em `sg_date_time_logic.dart`.
- Construtor: `const SgInputDateTime({...})` com 52 parâmetros nomeados, 50 do contrato React e 2 extras do Flutter (`autofocus`, `focusNode`).

### Props de SgInputDateTime

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `alwaysFloat` | `bool?` | — | não | React | Sem efeito: o rotulo do campo de data e hora e sempre estatico (igual ao React). |
| `borderRadius` | `num?` | — | não | React | — |
| `clearButton` | `bool?` | — | não | React | — |
| `control` | `SgFormController?` | — | não | React | — |
| `defaultValue` | `Object?` | — | não | React | Valor inicial (não controlado), em qualquer formato: `String` (local sem fuso, ISO com `Z` ou deslocamento) ou `DateTime`. Não existe `initialValue` neste componente. |
| `elevation` | `SgInputDateTimeElevation?` | — | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `enabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `filled` | `bool?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `iconButtons` | `List<Widget>?` | — | não | React | — |
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `inputProps` | `Object?` | — | não | React | Atributos do <input> do React: sem equivalente em Flutter. Ignorado. |
| `label` | `String?` | — | não | React | Rotulo principal exibido ao usuario. |
| `labelAlign` | `SgInputDateTimeLabelAlign?` | — | não | React | Valores: `start`, `center`, `end`. |
| `labelPosition` | `SgInputDateTimeLabelPosition?` | — | não | React | Valores: `float`, `top`, `left`. |
| `labelText` | `String?` | — | não | React | — |
| `labelWidth` | `Object?` | — | não | React | — |
| `maxDate` | `Object?` | — | não | React | Maior instante permitido. |
| `maxLength` | `num?` | — | não | React | — |
| `maxLengthMessage` | `String?` | — | não | React | — |
| `minDate` | `Object?` | — | não | React | Menor instante permitido. |
| `minLength` | `num?` | — | não | React | — |
| `minLengthMessage` | `String?` | — | não | React | — |
| `minNumberOfWords` | `num?` | — | não | React | — |
| `minNumberOfWordsMessage` | `String?` | — | não | React | — |
| `minuteStep` | `num?` | — | não | React | Passo dos minutos (5, 10, 15, 30). |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `void Function(String? value, String local)?` | — | não | React | Valor no formato de `valueMode` (ou `null` se incompleto/inválido) e o texto local do campo (`YYYY-MM-DDTHH:mm[:ss]`). |
| `onClear` | `VoidCallback?` | — | não | React | — |
| `onEnter` | `VoidCallback?` | — | não | React | Disparado ao receber foco — padrao seedgrid. |
| `onExit` | `VoidCallback?` | — | não | React | Disparado ao perder o foco (apos validacao) — padrao seedgrid. |
| `onValidation` | `ValueChanged<String?>?` | — | não | React | — |
| `placeholder` | `String?` | — | não | React | — |
| `prefixIcon` | `Widget?` | — | não | React | — |
| `prefixText` | `String?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | `false` † | não | React | Marca o campo como obrigatorio. |
| `requiredMessage` | `String?` | — | não | React | — |
| `showCharCounter` | `bool?` | — | não | React | — |
| `showSeconds` | `bool?` | `false` † | não | React | Mostra e aceita segundos. |
| `suffixText` | `String?` | — | não | React | — |
| `textInputType` | `SgInputDateTimeTextInputType?` | — | não | React | Valores: `none`, `email`, `search`, `tel`, `text`, `url`, `numeric`, `decimal`. |
| `timeZone` | `String?` | `local` † | não | React | Fuso do campo: `local` (dispositivo), `UTC`, deslocamento (`+03:00`) ou nome IANA (`America/Sao_Paulo`); nome desconhecido cai em `local`. Também define o deslocamento de `utc` e `offset`. |
| `validateOnBlur` | `bool?` | — | não | React | — |
| `validation` | `String? Function(String local)?` | — | não | React | — |
| `value` | `Object?` | — | não | React | Valor controlado, em qualquer formato (`String` local sem fuso, ISO com `Z` ou deslocamento, ou `DateTime`); trocar por fora atualiza o campo. |
| `valueMode` | `SgInputDateTimeValueMode?` | `local` † | não | React | Formato do valor que sai (`onChange` e formulário) e que o formulário aceita: `local` (`2026-01-15T10:30`), `utc` (`2026-01-15T13:30:00Z`) ou `offset` (`2026-01-15T10:30:00-03:00`). Valores: `local`, `utc`, `offset`. |
| `width` | `Object?` | — | não | React | — |
| `withBorder` | `bool?` | — | não | React | — |
| `autofocus` | `bool` | `false` | não | Flutter | — |
| `focusNode` | `FocusNode?` | — | não | Flutter | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Eventos, formulário e comportamento

- `onChange(String? value, String local)`: o valor no formato de `valueMode` (ou `null`) e o texto local do campo. `value`/`defaultValue`/`minDate`/`maxDate` aceitam `String` ISO 8601 ou `DateTime`. `timeZone` é `local`, `UTC`, deslocamento fixo (`-03:00`) ou nome IANA. `minuteStep` é ignorado com `showSeconds`. `alwaysFloat` não tem efeito (o rótulo é sempre estático, como no React).
- **Formato do valor (`valueMode`)** (`sg_input_date_time.dart:269-271`, `319-323` e `_emit`, linha 493; `sg_date_time_logic.dart`, `sgFormatDateTimeValue`): exemplo com `timeZone: 'America/Sao_Paulo'` e o usuário digitando 15/01/2026 10:30.

| `valueMode` | Valor que sai | Como o host Java lê (**Inferência**: `java.time` padrão) |
|---|---|---|
| `local` (padrão) | `2026-01-15T10:30` (com `showSeconds`, `...T10:30:15`): relógio do campo, sem fuso | `LocalDateTime.parse(valor)`; `Instant` não lê |
| `utc` | `2026-01-15T13:30:00Z`: instante em UTC, sempre com segundos e sem milissegundos | `Instant.parse(valor)` |
| `offset` | `2026-01-15T10:30:00-03:00`: relógio do campo com o deslocamento do `timeZone`, sempre com segundos | `OffsetDateTime.parse(valor)` |

- **Vazio, incompleto ou inválido:** `onChange` recebe `null` e o formulário grava `''` (`_emit`, linha 499).
- **O que o campo aceita** (`value`, `defaultValue`, `SgFormController` com `reset`/`setValue`): qualquer um dos três formatos ou `DateTime`; texto **sem fuso** é o relógio do próprio campo e não é convertido (`sgParseDateTimeValue`). O Flutter só liga ao formulário por `name` + `control`/`SgForm` (não há `register`), então o valor atribuído e o digitado seguem o `valueMode`; o formulário guarda o atribuído como foi atribuído até a primeira edição.
- **Formulário:** com `name` (+ `control`, ou o `SgForm` mais próximo) o valor do formulário é o texto no formato de `valueMode` (`''` quando vazio). O campo registra um **`validator` próprio** (`_formValidate`) em `registerField`, que roda também no `handleSubmit`/`trigger`: obrigatório (`required`, com `requiredMessage` ou o texto i18n `components.inputs.required`), data válida e intervalo (`minDate`/`maxDate`); campo desabilitado nunca falha. `validation` recebe o texto **local**. A prop `rules` não existe mais.
- **Idioma:** o texto exibido segue o idioma do `SgComponentsI18nProvider` (`sgDisplayDateTime`; a hora é sempre 24h).

## SgFileUpload

> **Flutter** · estado de paridade: **parcial** (React tem o mesmo contrato, com arrastar e soltar e `File` do navegador) · é o componente **base** de arquivos; o `SgImageUpload` o compõe.

Campo de anexo de arquivos com validação por tipo (conferido pelo conteúdo), tamanho e quantidade.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/files/sg_file_upload.dart` (linha 146) · classe `class SgFileUpload extends StatefulWidget implements SgFileUploadProps`; lógica pura em `sg_file_logic.dart`. As props vêm do contrato gerado a partir do React. Vetores compartilhados: `test/widgets/file_upload_vectors`.
- Construtor: `const SgFileUpload({...})` com 30 parâmetros nomeados, 29 do contrato React e 1 extra do Flutter (`picker`).
- **Sem retrocompatibilidade:** o valor é **sempre uma lista de `SgFile`** (um arquivo = lista de um). `SgImageFile` foi removido.

### Props de SgFileUpload

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `accept` | `String?` | — | não | React | Tipos extras em texto livre (.pdf, image/png, image/*), separados por virgula; soma-se ao mediaType. |
| `control` | `SgFormController?` | — | não | React | — |
| `defaultValue` | `List<SgFile>?` | — | não | React | Arquivos iniciais (campo nao controlado). |
| `dropManyTextKey` | `String?` | — | não | React | — |
| `dropTextKey` | `String?` | — | não | React | Chaves de i18n do texto da area vazia (um arquivo / varios). |
| `enabled` | `bool?` | `true` † | não | React | Desabilita a escolha e a remocao. |
| `error` | `String?` | — | não | React | — |
| `extraCheck` | `SgFileCheck?` | — | não | React | Regra extra, assincrona, por arquivo (depois da conferencia de tipo). E como o SgImageUpload confere dimensao. |
| `hintText` | `String?` | — | não | React | — |
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `keyPrefix` | `String` | `'sg-file'` | não | React | Prefixo do `data-sg` dos elementos internos (`sg-file`, `sg-image`). |
| `label` | `String?` | — | não | React | Rotulo exibido acima da area. |
| `labelText` | `String?` | — | não | React | — |
| `maxFiles` | `num?` | `1` † | não | React | Quantos arquivos o campo guarda. Com 1, escolher outro substitui; maior que 1 liga a selecao multipla. |
| `maxSizePerFile` | `Object?` | — | não | React | Tamanho maximo de cada arquivo: bytes (numero) ou texto com unidade ("500KB", "1.5MB", "1GB"). |
| `maxSizeTotal` | `Object?` | — | não | React | Tamanho maximo da soma dos arquivos: bytes (numero) ou texto com unidade. |
| `mediaType` | `List<SgMediaType>?` | — | não | React | Tipos aceitos: image, video, audio, pdf, doc, docx, xls, xlsx, ppt, pptx, csv, txt, zip ou all. O tipo e conferido pelo conteudo do arquivo. |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<List<SgFile>>?` | — | não | React | Lista de arquivos validos apos escolher ou remover. |
| `onEnter` | `VoidCallback?` | — | não | React | — |
| `onError` | `void Function(SgFileError code, String message, String fileName)?` | — | não | React | Arquivo recusado (type, size, total, count). Os demais seguem validos. |
| `onExit` | `VoidCallback?` | — | não | React | — |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `thumbnailBuilder` | `SgFileThumbnailBuilder?` | — | não | React | Miniatura de cada arquivo (sem ela, a lista usa o icone do tipo). |
| `thumbnailSize` | `double?` | `96` † | não | React | Lado da miniatura em px (padrao 96). |
| `typeNames` | `String?` | — | não | React | Texto dos tipos aceitos na mensagem de tipo recusado (padrao: mediaType/accept). |
| `value` | `List<SgFile>?` | — | não | React | Arquivos controlados (sempre lista; um arquivo = lista de um). Um arquivo ja salvo entra como { name, url }. |
| `picker` | `SgFilePicker?` | — | não | Flutter | Extra do Flutter (nao existe no React): substitui o seletor do sistema (testes, ou outra origem de arquivo). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Eventos, formulário e comportamento

- `onChange(List<SgFile>)`: lista de arquivos **válidos** após escolher ou remover. `onError(SgFileError code, String message, String fileName)`: arquivo recusado, com `message` traduzida; **por arquivo**, os demais seguem válidos.
- `mediaType` é conferido pelo conteúdo (assinatura), não só pela extensão; `accept` (texto livre, ex.: `.pdf`, `image/png`, `image/*`, separado por vírgula) **soma-se** ao `mediaType`. Com `maxFiles` igual a `1` (padrão), escolher outro arquivo **substitui**; maior que `1` liga a seleção múltipla e a grade. Não há prop `multiple`.
- **Formulário:** com `name` (+ `control`, ou o `SgForm` mais próximo) o valor do formulário é a lista de `SgFile` (`null` quando vazia). O campo registra a mensagem de obrigatório em `registerField(required:)` quando `required: true`; o texto é `requiredMessage ?? ''`, ou seja, **sem `requiredMessage` a mensagem de obrigatório fica vazia** (o código não usa o texto i18n padrão aqui). Não registra `validator` próprio. `enabled: false` desabilita a escolha e a remoção; `readOnly` só mostra.

**Tipos:**
- `SgFile({name, bytes?, url?, mimeType?, size?})`: `bytes` para o arquivo escolhido; `url` para um já salvo; `size` é `bytes.length` quando há bytes.
- `SgMediaType`: `image`, `video`, `audio` (**grupos**) e `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `csv`, `txt`, `zip` (**formatos**), mais `all`. Cada valor guarda extensões e MIME.
- `SgFileError { type, size, total, count, dimension, aspect }`: `type` (fora do aceito), `size` (acima de `maxSizePerFile`), `total` (soma acima de `maxSizeTotal`), `count` (acima de `maxFiles`); `dimension` e `aspect` só no `SgImageUpload`.

**Unidades de tamanho (decisão da F1):** `B`, `KB`, `MB`, `GB`, `TB`; **base 1024**; **sem diferenciar maiúscula/minúscula**; aceita decimal (`"1.5MB"`); número puro é bytes; **texto inválido = sem limite**. `maxSizePerFile` e `maxSizeTotal` aceitam número (bytes) ou texto com unidade.

**Tipo pelo conteúdo:** sem extensão conhecida, o tipo é deduzido da **assinatura** do arquivo (png, jpeg, gif, webp, bmp, tiff, ico, avif, heic, svg), então `.jfif` e arquivos sem extensão passam (correção do commit `130d184`).

## SgImageUpload

> **Flutter** · estado de paridade: **parcial** (React tem o mesmo contrato, com arrastar e soltar e `File` do navegador) · **composição** do `SgFileUpload` (não herança): mesmas regras, mais as de imagem.

Campo de imagem com miniatura e validação de formato, tamanho, dimensão e proporção.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/files/sg_image_upload.dart` (linha 18) · classe `class SgImageUpload extends StatelessWidget implements SgImageUploadProps`: monta um `SgFileUpload` com `mediaType: [image]`, miniaturas e `extraCheck`.
- Construtor: `const SgImageUpload({...})` com 26 parâmetros nomeados, 25 do contrato React e 1 extra do Flutter (`picker`).

### Props de SgImageUpload

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `accept` | `String?` | — | não | React | Restringe os formatos de imagem em texto livre (.png, image/jpeg), separados por virgula. |
| `aspect` | `num?` | — | não | React | Proporcao largura/altura exigida (1 = quadrada). |
| `control` | `SgFormController?` | — | não | React | — |
| `defaultValue` | `List<SgFile>?` | — | não | React | Arquivos iniciais (campo nao controlado). |
| `enabled` | `bool?` | `true` † | não | React | Desabilita a escolha e a remocao. |
| `error` | `String?` | — | não | React | — |
| `hintText` | `String?` | — | não | React | — |
| `id` | `String` | — | sim | React | Identificador unico do campo. |
| `label` | `String?` | — | não | React | Rotulo exibido acima da area. |
| `labelText` | `String?` | — | não | React | — |
| `maxFiles` | `num?` | `1` † | não | React | Quantas imagens o campo guarda. Com 1, escolher outra substitui; maior que 1 liga a selecao multipla e a grade de miniaturas. |
| `maxSizePerFile` | `Object?` | — | não | React | Tamanho maximo de cada imagem: bytes (numero) ou texto com unidade ("500KB", "2MB"). |
| `maxSizeTotal` | `Object?` | — | não | React | Tamanho maximo da soma das imagens: bytes (numero) ou texto com unidade. |
| `minHeight` | `num?` | — | não | React | Altura minima em px. |
| `minWidth` | `num?` | — | não | React | Largura minima em px. |
| `name` | `String?` | — | não | React | Nome do campo para formularios. |
| `onChange` | `ValueChanged<List<SgFile>>?` | — | não | React | Lista de imagens validas apos escolher ou remover. |
| `onEnter` | `VoidCallback?` | — | não | React | — |
| `onError` | `void Function(SgFileError code, String message, String fileName)?` | — | não | React | Imagem recusada (type, size, total, count, dimension, aspect). As demais seguem validas. |
| `onExit` | `VoidCallback?` | — | não | React | — |
| `previewHeight` | `num?` | `160` † | não | React | Altura da miniatura em px (padrao 160; na grade, no maximo 120). |
| `readOnly` | `bool?` | — | não | React | — |
| `required` | `bool?` | — | não | React | — |
| `requiredMessage` | `String?` | — | não | React | — |
| `value` | `List<SgFile>?` | — | não | React | Imagens controladas (sempre lista; uma imagem = lista de uma). Uma imagem ja salva entra como { name, url }. |
| `picker` | `SgFilePicker?` | — | não | Flutter | Extra do Flutter: substitui o seletor do sistema (testes, ou outra origem de arquivo). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Eventos, formulário e comportamento

- Tem as mesmas props de limite e valor do `SgFileUpload` (`value`/`defaultValue`/`onChange` em `List<SgFile>`, `maxFiles` padrão `1`, `maxSizePerFile`, `maxSizeTotal`, `onError` com o nome do arquivo, `picker`, formulário) **e** as de imagem da tabela. **`maxSizeBytes` foi removido** (agora `maxSizePerFile`).
- `accept` aqui **estreita** os formatos de imagem (`.png`, `image/jpeg`); no `SgFileUpload` ele soma.
- **Formulário:** repassa `name`, `control`, `required` e `requiredMessage` ao `SgFileUpload` interno, então o comportamento de formulário e de `required` é o descrito lá (inclusive a mensagem de obrigatório vazia sem `requiredMessage`).
- `maxFiles > 1` mostra a **grade de miniaturas** (altura da miniatura limitada a 120). Sem recorte e sem compressão. Dimensão (erro `dimension`) e proporção (erro `aspect`) são lidas só quando há `minWidth`, `minHeight` ou `aspect`.

## SgCameraCapture

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCameraCapture` (mesmo nome).

Captura de foto pela câmera, com guia de enquadramento e alternância entre frontal e traseira.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/camera/sg_camera_capture.dart` (linha 158) · classe `class SgCameraCapture extends StatefulWidget implements SgCameraCaptureProps`; lógica pura em `sg_camera_logic.dart`.
- Construtor: `const SgCameraCapture({...})` com 13 parâmetros nomeados, 12 do contrato React e 1 extra do Flutter (`backend`).

### Props de SgCameraCapture

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `allowSwitch` | `bool?` | `true` † | não | React | Mostra o botao de alternar entre frontal e traseira. |
| `enabled` | `bool?` | `true` † | não | React | Nao abre a camera nem permite capturar. |
| `facing` | `SgCameraCaptureFacing?` | `user` † | não | React | Camera inicial: frontal (user) ou traseira (environment). Valores: `user`, `environment`. |
| `guide` | `SgCameraCaptureGuide?` | `none` † | não | React | Guia de enquadramento sobre a pre-visualizacao. Valores: `none`, `oval`, `rect`. |
| `hintText` | `String?` | — | não | React | — |
| `id` | `String` | — | sim | React | Identificador unico do componente. |
| `label` | `String?` | — | não | React | Rotulo exibido acima da pre-visualizacao. |
| `labelText` | `String?` | — | não | React | — |
| `onCapture` | `ValueChanged<Uint8List>?` | — | não | React | Imagem JPEG capturada. |
| `onError` | `void Function(SgCameraError code, String message)?` | — | não | React | Camera indisponivel (permission, noCamera, failed). |
| `previewHeight` | `num?` | `320` † | não | React | Altura da pre-visualizacao em px. |
| `resolution` | `SgCameraCaptureResolution?` | `medium` † | não | React | Resolucao pedida (640x480, 1280x720, 1920x1080). Valores: `low`, `medium`, `high`. |
| `backend` | `SgCameraBackend` | `const SgSystemCameraBackend()` | não | Flutter | Extra do Flutter: origem da camera (padrao: pacote `camera`). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Eventos e comportamento

- `onCapture(Uint8List)`: imagem **JPEG** capturada (bytes). `onError(SgCameraError code, String message)`: câmera indisponível, com `message` já traduzida. `enabled: false` não abre a câmera nem permite capturar. **Sem ligação com formulário** (o widget não tem `name` nem `control`).
- **Web:** a prévia da câmera frontal é espelhada e a foto capturada **não** é; no Flutter web a câmera usa `getUserMedia` próprio (o `camera_web` falhava com câmeras virtuais paradas).

**Tipos:** `SgCameraError { permission, noCamera, failed }`; `SgCameraBackend` (`list()` e `open(camera, resolution)` devolvendo um `SgCameraSession` com `buildPreview()`, `capture()` e `dispose()`); `SgCameraException(code, [message])`. A classificação do erro da plataforma é `sgClassifyCameraError`. O pacote `camera` (`^0.12.0+2`) é dependência do `seedgrid_components`.

## SgColorPicker

> **Flutter** · estado de paridade: **somente Flutter** (não há equivalente React) · seletor de cor `#RRGGBB`.

Painel de escolha de cor com prévia, área de saturação e brilho com barra de matiz (modo `gradient`) ou três sliders (modo `sliders`), campo hex com validação e cores predefinidas.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/color/sg_color_picker.dart` (linha 119) · classe `class SgColorPicker extends StatefulWidget`; props escritas à mão em `sg_color_picker_props.dart` (sem contrato gerado do React).
- Construtor: `const SgColorPicker({...})` com 14 parâmetros nomeados, todos do Flutter (o componente não existe no React).

### Props de SgColorPicker

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | Flutter | Identificador unico (base das chaves dos sliders, do campo hex e das cores predefinidas). |
| `ariaLabel` | `String?` | — | não | Flutter | Rótulo de acessibilidade do painel. |
| `control` | `SgFormController?` | — | não | Flutter | Controlador do formulário (usado junto com name). |
| `defaultValue` | `String?` | — | não | Flutter | Cor inicial '#RRGGBB' quando nao controlado. |
| `enabled` | `bool` | `true` | não | Flutter | Padrao `true`; `false` bloqueia sliders, campo hex e cores predefinidas. |
| `error` | `String?` | — | não | Flutter | Mensagem de erro externa, exibida abaixo do painel. |
| `labelText` | `String?` | — | não | Flutter | Título exibido acima do painel. |
| `mode` | `SgColorPickerMode` | `SgColorPickerMode.gradient` | não | Flutter | Forma de escolher a cor: [SgColorPickerMode.gradient] (padrao, classico) ou [SgColorPickerMode.sliders]. Valores: `gradient`, `sliders`. |
| `name` | `String?` | — | não | Flutter | Nome do campo no formulario. |
| `onChange` | `ValueChanged<String>?` | — | não | Flutter | Recebe a cor '#RRGGBB' maiuscula a cada mudanca valida. |
| `presets` | `List<String>?` | — | não | Flutter | Cores predefinidas ('#RRGGBB'); tocar numa delas escolhe a cor. |
| `showHex` | `bool` | `true` | não | Flutter | Mostra o campo de texto hex (#RRGGBB) com validação. |
| `value` | `String?` | — | não | Flutter | Cor controlada '#RRGGBB'. |
| `width` | `Object?` | — | não | Flutter | Numero (px) ou texto 'N%'. |

### Eventos, formulário e comportamento

- `onChange(String)`: com a cor `#RRGGBB` em maiúsculas, a cada mudança válida (arrastar, setas, sliders, preset ou hex válido digitado). Hex inválido ou incompleto mostra o erro i18n e **não** emite.
- **Estado:** controlado quando `value` é informado; senão guarda o próprio estado, começando em `defaultValue` (ou `#000000`). Cores fora do formato `#RRGGBB` são ignoradas (`sgNormalizeHex`).
- **Formulário:** com `name` (+ `control`, ou o `SgForm` mais próximo) o valor do formulário é o texto `#RRGGBB` (inicial `defaultValue`, depois `value`, depois `#000000`). Não registra `required` nem `validator`; o erro exibido é `error` ou o do formulário (`resolveFieldError`).
- **Diálogo:** `showSgColorPicker(context, {id, initialValue, presets, showHex, mode, title, okLabel, cancelLabel, barrierDismissible})` abre o painel num diálogo e devolve a cor escolhida (`null` se cancelar), como `showDatePicker`.
- **Acessibilidade e teclado:** a prévia tem `Semantics(label, value: hex)`; as cores predefinidas são `Semantics(button, selected)`; a área de saturação/brilho aceita setas (passo 1%, 10% com Shift) e a barra de matiz aceita setas (passo 1, 10 com Shift). `enabled: false` bloqueia sliders, campo hex e predefinidas. Textos nos cinco idiomas (`pt-BR`, `pt-PT`, `en-US`, `es`, `fr`), num mapa interno do componente.

## Internacionalização

Chaves `components.inputs.datetime.*`, `components.inputs.fileupload.*` (`drop`, `dropMany`, `remove`, `loading`, `type`, `size`, `total`, `count`, `file`), `components.inputs.imageupload.*` e `components.inputs.camera.*` nos cinco idiomas (`messages_pt_br.dart`, `messages_pt_pt.dart`, `messages_en_us.dart`, `messages_es.dart`, `messages_fr.dart`). Os textos do showcase dos componentes têm tradução em `tools/showcase_i18n/traducoes/`.

## Não verificado

- Não executei o showcase nem `flutter test`; a câmera **não foi testada em dispositivo real**, só com `SgCameraBackend` simulado.
