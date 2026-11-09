---
description: "Exemplos Dart (Flutter) de Data e hora, imagem, câmera e seletor de cor, copiados dos snippets do showcase do seedgrid_components."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 3e7ea56
analisado-em: 2026-11-09
---

# Exemplos — Data e hora, imagem e câmera (Flutter)

> **Plataforma: Flutter.** Os exemplos React do mesmo grupo estão em [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API (Flutter)]].

Os trechos são cópia 1:1 dos `*.snippets.g.dart` do showcase em seedgrid-fe-flutter 3e7ea56 (`sg_input_date_time_page`, `sg_file_upload_page`, `sg_image_upload_page`, `sg_camera_capture_page`, `sg_color_picker_page`), na ordem e com os títulos do showcase; `context.tx(...)`/`context.txf(...)` (i18n do showcase) viraram o literal e a interpolação. O showcase não usa `setState` de página: campos de formulário usam `name` + `control: SgFormController` e o estado de exibição é local (`ValueNotifier` com `ValueListenableBuilder`/`ListenableBuilder`); a linha **Ajuste** abaixo de cada bloco mostra a declaração dos campos da página que o trecho usa. Todos supõem `import 'package:flutter/material.dart';` e `import 'package:seedgrid_components/seedgrid_components.dart';`.


## SgInputDateTime: Básico

O onChange entrega o instante em ISO 8601 UTC (ou null se o campo estiver incompleto).

Região `sgInputDateTimeBasico` em `sg_input_date_time_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'demo-basic',
      labelText: 'Quando',
      onChange: (value, local) => _instante.value = value,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String?>(
      valueListenable: _instante,
      builder: (context, instante, _) => Text(
        'Valor: ${instante ?? '-'}',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_instante`), definido assim na página do showcase:

```dart
final ValueNotifier<String?> _instante = ValueNotifier<String?>(null);
```

## SgInputDateTime: Fusos horários

O mesmo instante exibido em UTC, -03:00 e +05:30; editar um campo atualiza os outros.

Região `sgInputDateTimeFusos` em `sg_input_date_time_page.snippets.g.dart`.

```dart
ValueListenableBuilder<String>(
  valueListenable: _fuso,
  builder: (context, fuso, _) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SgInputDateTime(
        id: 'demo-zone-utc',
        labelText: 'UTC',
        timeZone: 'UTC',
        value: fuso,
        // Campo incompleto (null) não mexe nos outros: só um instante válido atualiza.
        onChange: (value, local) {
          if (value != null) _fuso.value = value;
        },
      ),
      const SizedBox(height: 12),
      SgInputDateTime(
        id: 'demo-zone-sp',
        labelText: '-03:00',
        timeZone: '-03:00',
        value: fuso,
        onChange: (value, local) {
          if (value != null) _fuso.value = value;
        },
      ),
      const SizedBox(height: 12),
      SgInputDateTime(
        id: 'demo-zone-in',
        labelText: '+05:30',
        timeZone: '+05:30',
        value: fuso,
        onChange: (value, local) {
          if (value != null) _fuso.value = value;
        },
      ),
      const SizedBox(height: 8),
      Text('Valor: $fuso'),
    ],
  ),
)
```

Ajuste: o trecho usa estado local do exemplo (`_fuso`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _fuso = ValueNotifier<String>(
  '2026-11-03T17:30:00.000Z',
);
```

## SgInputDateTime: Limites e passo de minutos

minDate/maxDate validam o intervalo e minuteStep arredonda os minutos ao sair do campo.

Região `sgInputDateTimeLimites` em `sg_input_date_time_page.snippets.g.dart`.

```dart
SgInputDateTime(
  id: 'demo-limits',
  labelText: 'Agendamento',
  timeZone: 'UTC',
  minDate: '2026-11-01T08:00:00Z',
  maxDate: '2026-11-30T18:00:00Z',
  minuteStep: 15,
  required: true,
)
```

## SgInputDateTime: Com segundos

showSeconds mostra e aceita os segundos.

Região `sgInputDateTimeSegundos` em `sg_input_date_time_page.snippets.g.dart`.

```dart
SgInputDateTime(
  id: 'demo-seconds',
  labelText: 'Evento',
  timeZone: 'UTC',
  defaultValue: '2026-11-03T17:30:45Z',
  showSeconds: true,
)
```

## SgInputDateTime: Eventos

onChange (instante ou null), onEnter (foco) e onExit (saída) informam o que o usuário fez.

Região `sgInputDateTimeEventos` em `sg_input_date_time_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'demo-events',
      labelText: 'Quando',
      onChange: (value, local) =>
          _evento.value = 'onChange: ${value ?? local}',
      onEnter: () => _evento.value = 'onEnter',
      onExit: () => _evento.value = 'onExit',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String>(
      valueListenable: _evento,
      builder: (context, evento, _) => Text(
        'Último evento: $evento',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_evento`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _evento = ValueNotifier<String>('-');
```

## SgInputDateTime: Dentro de um formulário

O formulário guarda o instante ISO 8601 UTC.

Região `sgInputDateTimeFormulario` em `sg_input_date_time_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'demo-form',
      name: 'consulta',
      control: _form,
      labelText: 'Agendamento',
      timeZone: '-03:00',
      required: true,
      requiredMessage: 'Informe a data e a hora',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['consulta']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox.shrink()
          : Text(
              'Enviado: $enviado',
            ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`, `_enviado`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
final ValueNotifier<String> _enviado = ValueNotifier<String>('');
```

## SgInputDateTime: Posição do rótulo

Compare os modos de rótulo: flutuante, acima e à esquerda.

Região `sgInputDateTimeRotulo` em `sg_input_date_time_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 16,
  runSpacing: 12,
  children: [
    SizedBox(
      width: 280,
      child: SgInputDateTime(
        id: 'sg-input-date-time-label-float',
        labelText: 'Flutuante',
        labelPosition: SgInputDateTimeLabelPosition.float,
      ),
    ),
    SizedBox(
      width: 280,
      child: SgInputDateTime(
        id: 'sg-input-date-time-label-top',
        labelText: 'Acima',
        labelPosition: SgInputDateTimeLabelPosition.top,
      ),
    ),
    SizedBox(
      width: 360,
      child: SgInputDateTime(
        id: 'sg-input-date-time-label-left',
        labelText: 'Esquerda',
        labelPosition: SgInputDateTimeLabelPosition.left,
        labelWidth: 140,
        labelAlign: SgInputDateTimeLabelAlign.end,
      ),
    ),
  ],
)
```

## SgInputDateTime: Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.datetime.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Região `sgInputDateTimeIdioma` em `sg_input_date_time_page.snippets.g.dart`.

```dart
SgComponentsI18nProvider(
  locale: 'fr',
  messages: {
    'components.inputs.datetime.min': 'Escolha uma data a partir de {min}.',
  },
  child: SgInputDateTime(
    id: 'demo-i18n',
    labelText: 'Agendamento',
    timeZone: 'UTC',
    minDate: '2026-11-01T08:00:00Z',
    defaultValue: '2026-10-01T10:00:00Z',
    required: true,
  ),
)
```

## SgFileUpload: Básico

Um arquivo de qualquer tipo. O onChange entrega a lista (de um); o envio ao servidor é do host.

Região `sgFileUploadBasico` em `sg_file_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgFileUpload(
      id: 'anexo',
      labelText: 'Anexo',
      onChange: (files) => _um.value = files,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<SgFile>>(
      valueListenable: _um,
      builder: (context, um, _) => Text(
        'Valor atual: ${um.isEmpty ? '-' : um.map((f) => f.name).join(', ')}',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_um`), definido assim na página do showcase:

```dart
final ValueNotifier<List<SgFile>> _um = ValueNotifier(const []);
```

## SgFileUpload: Vários arquivos

maxFiles maior que 1 liga a seleção múltipla; os escolhidos se somam até o limite. Cada recusa é por arquivo.

Região `sgFileUploadVarios` em `sg_file_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgFileUpload(
      id: 'anexos',
      labelText: 'Anexos',
      maxFiles: 3,
      hintText: 'Até 3 arquivos.',
      onChange: (files) => _varios.value = files,
      onError: (code, message, fileName) =>
          _erro.value = '$fileName: ${code.name}',
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<SgFile>>(
      valueListenable: _varios,
      builder: (context, varios, _) =>
          Text('Arquivos: ${varios.length}'),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _erro,
      builder: (context, erro, _) => Text('Última recusa: $erro'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_varios`, `_erro`), definido assim na página do showcase:

```dart
final ValueNotifier<List<SgFile>> _varios = ValueNotifier(const []);
final ValueNotifier<String> _erro = ValueNotifier('-');
```

## SgFileUpload: Tipos aceitos

mediaType aceita grupos (image, video, audio) e formatos (pdf, xls, xlsx...). O tipo é conferido pelo conteúdo do arquivo, não só pela extensão.

Região `sgFileUploadTipos` em `sg_file_upload_page.snippets.g.dart`.

```dart
const SgFileUpload(
  id: 'planilha',
  labelText: 'Planilha ou PDF',
  mediaType: [SgMediaType.pdf, SgMediaType.xls, SgMediaType.xlsx],
  maxFiles: 2,
)
```

## SgFileUpload: Limites de tamanho

maxSizePerFile e maxSizeTotal aceitam bytes ou texto com unidade ("500KB", "1.5MB", "1GB").

Região `sgFileUploadLimites` em `sg_file_upload_page.snippets.g.dart`.

```dart
const SgFileUpload(
  id: 'limites',
  labelText: 'Documentos',
  maxFiles: 5,
  maxSizePerFile: '2MB',
  maxSizeTotal: '5MB',
  hintText: 'Até 5 arquivos, 2 MB cada e 5 MB no total.',
)
```

## SgFileUpload: Desabilitado

Não permite escolher nem remover.

Região `sgFileUploadDesabilitado` em `sg_file_upload_page.snippets.g.dart`.

```dart
const SgFileUpload(
  id: 'anexo-desabilitado',
  labelText: 'Anexo',
  enabled: false,
  defaultValue: [SgFile(name: 'contrato.pdf', size: 482304)],
)
```

## SgFileUpload: Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.fileupload.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Região `sgFileUploadIdioma` em `sg_file_upload_page.snippets.g.dart`.

```dart
const SgComponentsI18nProvider(
  locale: 'fr',
  messages: {
    'components.inputs.fileupload.drop': 'Arraste o contrato aqui',
  },
  child: SgFileUpload(id: 'idioma', labelText: 'Anexo'),
)
```

## SgFileUpload: Dentro de um formulário

O formulário guarda a lista de arquivos e valida o obrigatório.

Região `sgFileUploadFormulario` em `sg_file_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgFileUpload(
      id: 'comprovantes',
      name: 'comprovantes',
      control: _form,
      labelText: 'Comprovantes',
      maxFiles: 3,
      required: true,
      requiredMessage: 'Anexe ao menos um arquivo',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value =
            '${(values['comprovantes'] as List).length} arquivo(s)',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`, `_enviado`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
final ValueNotifier<String> _enviado = ValueNotifier('');
```

## SgImageUpload: Básico

O onChange entrega a lista de imagens (de uma); o envio ao servidor é do host. O tipo é conferido pelo conteúdo do arquivo.

Região `sgImageUploadBasico` em `sg_image_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'foto',
      labelText: 'Foto',
      onChange: (files) => _uma.value = files,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<SgFile>>(
      valueListenable: _uma,
      builder: (context, uma, _) => Text(
        'Valor atual: ${uma.isEmpty ? '-' : '${uma.first.name} (${uma.first.size} bytes)'}',
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_uma`), definido assim na página do showcase:

```dart
final ValueNotifier<List<SgFile>> _uma = ValueNotifier(const []);
```

## SgImageUpload: Várias imagens

maxFiles maior que 1 liga a seleção múltipla e mostra a grade de miniaturas. As imagens recusadas não derrubam as demais.

Região `sgImageUploadVarias` em `sg_image_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'galeria',
      labelText: 'Galeria',
      maxFiles: 4,
      maxSizePerFile: '2MB',
      maxSizeTotal: '6MB',
      hintText: 'Até 4 imagens, 2 MB cada e 6 MB no total.',
      onChange: (files) => _galeria.value = files,
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<List<SgFile>>(
      valueListenable: _galeria,
      builder: (context, galeria, _) =>
          Text('Imagens: ${galeria.length}'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_galeria`), definido assim na página do showcase:

```dart
final ValueNotifier<List<SgFile>> _galeria = ValueNotifier(const []);
```

## SgImageUpload: Regras de validação

accept, maxSizePerFile, minWidth/minHeight e aspect recusam a imagem com uma mensagem e disparam onError.

Região `sgImageUploadRegras` em `sg_image_upload_page.snippets.g.dart`.

```dart
const SgImageUpload(
  id: 'avatar',
  labelText: 'Avatar',
  accept: 'image/png,image/jpeg',
  maxSizePerFile: '2MB',
  minWidth: 200,
  minHeight: 200,
  aspect: 1,
  hintText: 'PNG ou JPEG, até 2 MB, quadrada, mínimo 200 × 200 px.',
)
```

## SgImageUpload: Imagem já salva

Um SgFile com url é uma imagem existente no servidor e já aparece na pré-visualização.

Região `sgImageUploadSalva` em `sg_image_upload_page.snippets.g.dart`.

```dart
const SgImageUpload(
  id: 'logo',
  labelText: 'Logotipo',
  defaultValue: [
    SgFile(
      name: 'logo.png',
      url:
          'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
    ),
  ],
  previewHeight: 96,
)
```

## SgImageUpload: Desabilitado

Não permite escolher nem remover.

Região `sgImageUploadDesabilitado` em `sg_image_upload_page.snippets.g.dart`.

```dart
const SgImageUpload(
  id: 'foto-desabilitada',
  labelText: 'Foto',
  enabled: false,
)
```

## SgImageUpload: Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.imageupload.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Região `sgImageUploadIdioma` em `sg_image_upload_page.snippets.g.dart`.

```dart
const SgComponentsI18nProvider(
  locale: 'fr',
  messages: {
    'components.inputs.imageupload.drop': 'Arraste a foto aqui',
  },
  child: SgImageUpload(id: 'idioma', labelText: 'Foto'),
)
```

## SgImageUpload: Dentro de um formulário

O formulário guarda a lista de imagens e valida o obrigatório.

Região `sgImageUploadFormulario` em `sg_image_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'documento',
      name: 'documento',
      control: _form,
      labelText: 'Foto do documento',
      required: true,
      requiredMessage: 'Escolha uma imagem',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = (values['documento'] as List)
            .cast<SgFile>()
            .first
            .name,
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) => enviado.isEmpty
          ? const SizedBox()
          : Text('Enviado: $enviado'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`, `_enviado`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController();
final ValueNotifier<String> _enviado = ValueNotifier('');
```

## SgCameraCapture: Básico

O onCapture entrega a imagem JPEG (bytes); o envio ao servidor é do host. Exige a permissão de câmera do sistema.

Região `sgCameraCaptureBasico` em `sg_camera_capture_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgCameraCapture(
        id: 'foto',
        labelText: 'Foto',
        previewHeight: 240,
        onCapture: (image) => _captured.value = image,
      ),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<Uint8List?>(
      valueListenable: _captured,
      builder: (context, captured, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Valor atual: ${captured?.length ?? '-'} bytes'),
          if (captured != null) Image.memory(captured, width: 160),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_captured`), definido assim na página do showcase:

```dart
final ValueNotifier<Uint8List?> _captured = ValueNotifier(null);
```

## SgCameraCapture: Guia oval (selfie)

guide: oval com a câmera frontal ajuda a centralizar o rosto.

Região `sgCameraCaptureOval` em `sg_camera_capture_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgCameraCapture(
        id: 'selfie',
        labelText: 'Selfie',
        previewHeight: 280,
        facing: SgCameraCaptureFacing.user,
        guide: SgCameraCaptureGuide.oval,
        onCapture: (image) => _selfie.value = image,
      ),
    ),
    ValueListenableBuilder<Uint8List?>(
      valueListenable: _selfie,
      builder: (context, selfie, _) => selfie == null
          ? const SizedBox()
          : Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Image.memory(selfie, width: 160),
            ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_selfie`), definido assim na página do showcase:

```dart
final ValueNotifier<Uint8List?> _selfie = ValueNotifier(null);
```

## SgCameraCapture: Guia retangular (documento)

guide: rect com a câmera traseira e resolução alta, para documentos.

Região `sgCameraCaptureRetangular` em `sg_camera_capture_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 360,
      child: SgCameraCapture(
        id: 'documento',
        labelText: 'Documento',
        facing: SgCameraCaptureFacing.environment,
        guide: SgCameraCaptureGuide.rect,
        resolution: SgCameraCaptureResolution.high,
        previewHeight: 240,
        onCapture: (image) => _documento.value = image,
      ),
    ),
    ValueListenableBuilder<Uint8List?>(
      valueListenable: _documento,
      builder: (context, documento, _) => documento == null
          ? const SizedBox()
          : Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Image.memory(documento, width: 160),
            ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_documento`), definido assim na página do showcase:

```dart
final ValueNotifier<Uint8List?> _documento = ValueNotifier(null);
```

## SgCameraCapture: Erros de câmera

Sem permissão, sem câmera ou falha: o componente mostra o estado e chama onError com o código.

Região `sgCameraCaptureErros` em `sg_camera_capture_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SizedBox(
      width: 320,
      child: SgCameraCapture(
        id: 'foto-erros',
        labelText: 'Foto',
        previewHeight: 240,
        onError: (code, message) =>
            _cameraError.value = '${code.name}: $message',
      ),
    ),
    const SizedBox(height: 8),
    ValueListenableBuilder<String?>(
      valueListenable: _cameraError,
      builder: (context, cameraError, _) =>
          Text('Valor atual: ${cameraError ?? '-'}'),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_cameraError`), definido assim na página do showcase:

```dart
final ValueNotifier<String?> _cameraError = ValueNotifier(null);
```

## SgCameraCapture: Idioma e textos (i18n)

Os textos internos vêm do dicionário components.inputs.camera.*. Envolva o componente em SgComponentsI18nProvider (ou chame setComponentsI18n) para trocar o idioma e use messages para substituir uma chave.

Região `sgCameraCaptureIdioma` em `sg_camera_capture_page.snippets.g.dart`.

```dart
const SgComponentsI18nProvider(
  locale: 'fr',
  messages: {
    'components.inputs.camera.capture': 'Tirar foto agora',
  },
  child: SgCameraCapture(id: 'idioma', labelText: 'Foto'),
)
```

## SgColorPicker: Básico

defaultValue define a cor inicial; onChange entrega a cor em #RRGGBB maiúsculo a cada mudança válida.

Região `sgColorPickerBasico` em `sg_color_picker_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgColorPicker(
      id: 'cor-basico',
      defaultValue: '#16803D',
      ariaLabel: 'Cor',
      onChange: (hex) => _basico.value = hex,
    ),
    ValueListenableBuilder<String>(
      valueListenable: _basico,
      builder: (context, hex, _) => Text(hex),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_basico`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _basico = ValueNotifier('#16803D');
```

## SgColorPicker: Valor controlado

Com value, o pai decide a cor: o painel só muda quando o value muda.

Região `sgColorPickerControlado` em `sg_color_picker_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    ValueListenableBuilder<String>(
      valueListenable: _controlada,
      builder: (context, hex, _) => SgColorPicker(
        id: 'cor-controlada',
        labelText: 'Cor da marca',
        value: hex,
        onChange: (novo) => _controlada.value = novo,
      ),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Voltar para azul'),
      onClick: () => _controlada.value = '#0EA5E9',
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_controlada`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _controlada = ValueNotifier('#0EA5E9');
```

## SgColorPicker: Cores predefinidas

presets mostra uma paleta; tocar numa cor a escolhe.

Região `sgColorPickerPredefinidas` em `sg_color_picker_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgColorPicker(
      id: 'cor-predefinidas',
      defaultValue: '#EF4444',
      presets: const [
        '#EF4444',
        '#F97316',
        '#F59E0B',
        '#10B981',
        '#0EA5E9',
        '#7C3AED',
        '#EC4899',
      ],
      onChange: (hex) => _predefinida.value = hex,
    ),
    ValueListenableBuilder<String>(
      valueListenable: _predefinida,
      builder: (context, hex, _) => Text(hex),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_predefinida`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _predefinida = ValueNotifier('#EF4444');
```

## SgColorPicker: Barras (matiz, saturação e brilho)

mode: SgColorPickerMode.sliders troca o gradiente por três barras: matiz, saturação e brilho.

Região `sgColorPickerBarras` em `sg_color_picker_page.snippets.g.dart`.

```dart
const SgColorPicker(
  id: 'cor-barras',
  defaultValue: '#16803D',
  mode: SgColorPickerMode.sliders,
  width: '80%',
)
```

## SgColorPicker: Sem campo hex

showHex: false esconde o campo de texto #RRGGBB.

Região `sgColorPickerSemHex` em `sg_color_picker_page.snippets.g.dart`.

```dart
const SgColorPicker(
  id: 'cor-sem-hex',
  defaultValue: '#0EA5E9',
  showHex: false,
  width: '80%',
)
```

## SgColorPicker: Desabilitado

enabled: false bloqueia os sliders, o campo hex e as cores predefinidas.

Região `sgColorPickerDesabilitado` em `sg_color_picker_page.snippets.g.dart`.

```dart
const SgColorPicker(
  id: 'cor-desabilitada',
  defaultValue: '#336699',
  presets: ['#EF4444', '#10B981'],
  enabled: false,
)
```

## SgColorPicker: Dentro de um formulário

name + control ligam o seletor ao SgFormController; o valor enviado é o #RRGGBB.

Região `sgColorPickerFormulario` em `sg_color_picker_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgColorPicker(
      id: 'cor-formulario',
      name: 'marca',
      control: _form,
      presets: const ['#F97316', '#10B981', '#7C3AED'],
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text('Enviar'),
      onClick: () => _form.handleSubmit(
        (values) => _enviado.value = '${values['marca']}',
      ),
    ),
    ValueListenableBuilder<String>(
      valueListenable: _enviado,
      builder: (context, enviado, _) =>
          enviado.isEmpty ? const SizedBox.shrink() : Text(enviado),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_form`, `_enviado`), definido assim na página do showcase:

```dart
final SgFormController _form = SgFormController(
  defaultValues: {'marca': '#F97316'},
);
final ValueNotifier<String> _enviado = ValueNotifier('');
```

## SgColorPicker: Diálogo showSgColorPicker

showSgColorPicker abre o painel num diálogo e devolve a cor escolhida, ou null se cancelar.

Região `sgColorPickerDialogo` em `sg_color_picker_page.snippets.g.dart`.

```dart
Wrap(
  spacing: 12,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SgButton(
      label: Text('Escolher cor'),
      onClick: () async {
        final hex = await showSgColorPicker(
          context,
          id: 'cor-dialogo',
          initialValue: _dialogo.value,
          presets: const ['#EF4444', '#10B981', '#7C3AED'],
        );
        if (hex != null) _dialogo.value = hex;
      },
    ),
    ValueListenableBuilder<String>(
      valueListenable: _dialogo,
      builder: (context, hex, _) => Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: [
          Container(
            width: 32,
            height: 32,
            color: sgHexToColor(hex),
          ),
          Text(hex),
        ],
      ),
    ),
  ],
)
```

Ajuste: o trecho usa estado local do exemplo (`_dialogo`), definido assim na página do showcase:

```dart
final ValueNotifier<String> _dialogo = ValueNotifier('#7C3AED');
```
