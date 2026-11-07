---
description: "Exemplos Dart (Flutter) de Data e hora, imagem e câmera, copiados dos snippets do showcase do seedgrid_components."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: e5e8baf
analisado-em: 2026-11-04
---

# Exemplos — Data e hora, imagem e câmera (Flutter)

> **Plataforma: Flutter.** Os exemplos React do mesmo grupo estão em [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API (Flutter)]].

Os trechos vêm dos `*.snippets.g.dart` do showcase (`sg_input_date_time_page`, `sg_file_upload_page`, `sg_image_upload_page`, `sg_camera_capture_page`). Os estados (`_instante`, `_info`, `_captured`, `_form`…) são campos do `State` da página; troque-os pelos do seu widget.


## SgInputDateTime: básico

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'quando',
      labelText: 'Quando',
      onChange: (value, local) => setState(() => _instante = value),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_instante ?? '-'}'),
  ],
)
```

## SgInputDateTime: fusos horários

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'fuso-utc',
      labelText: 'UTC',
      timeZone: 'UTC',
      value: _fuso,
      // Campo incompleto (null) nao mexe nos outros: so um instante valido atualiza.
      onChange: (value, local) {
        if (value != null) setState(() => _fuso = value);
      },
    ),
    const SizedBox(height: 12),
    SgInputDateTime(
      id: 'fuso-sp',
      labelText: '-03:00',
      timeZone: '-03:00',
      value: _fuso,
      // Campo incompleto (null) nao mexe nos outros: so um instante valido atualiza.
      onChange: (value, local) {
        if (value != null) setState(() => _fuso = value);
      },
    ),
    const SizedBox(height: 12),
    SgInputDateTime(
      id: 'fuso-in',
      labelText: '+05:30',
      timeZone: '+05:30',
      value: _fuso,
      // Campo incompleto (null) nao mexe nos outros: so um instante valido atualiza.
      onChange: (value, local) {
        if (value != null) setState(() => _fuso = value);
      },
    ),
    const SizedBox(height: 8),
    Text('Valor atual: $_fuso'),
  ],
)
```

## SgInputDateTime: limites e passo de minutos

```dart
const SgInputDateTime(
  id: 'limites',
  labelText: 'Agendamento',
  timeZone: 'UTC',
  minDate: '2026-11-01T08:00:00Z',
  maxDate: '2026-11-30T18:00:00Z',
  minuteStep: 15,
  required: true,
)
```

## SgInputDateTime: com segundos

```dart
const SgInputDateTime(
  id: 'segundos',
  labelText: 'Evento',
  timeZone: 'UTC',
  defaultValue: '2026-11-03T17:30:45Z',
  showSeconds: true,
)
```

## SgInputDateTime: em formulário

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'consulta',
      name: 'consulta',
      control: _form,
      labelText: 'Consulta',
      timeZone: '-03:00',
      required: true,
      requiredMessage: 'Informe a data e a hora',
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text(context.tx('Enviar')),
      onClick: () => _form.handleSubmit(
        (values) =>
            setState(() => _enviado = '${values['consulta']}'),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

## SgInputDateTime: eventos (`onEnter` e `onExit`)

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgInputDateTime(
      id: 'eventos',
      labelText: 'Quando',
      onChange: (value, local) =>
          setState(() => _evento = 'onChange: ${value ?? local}'),
      onEnter: () => setState(() => _evento = 'onEnter'),
      onExit: () => setState(() => _evento = 'onExit'),
    ),
    const SizedBox(height: 8),
    Text('Último evento: $_evento'),
  ],
)
```

## SgFileUpload: básico (valor é lista)

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgFileUpload(
      id: 'anexo',
      labelText: 'Anexo',
      onChange: (files) => setState(() => _um = files),
    ),
    const SizedBox(height: 8),
    Text(
      'Valor atual: ${_um.isEmpty ? '-' : _um.map((f) => f.name).join(', ')}',
    ),
  ],
)
```

## SgFileUpload: vários arquivos (`maxFiles > 1`)

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgFileUpload(
      id: 'anexos',
      labelText: 'Anexos',
      maxFiles: 3,
      hintText: 'Até 3 arquivos.',
      onChange: (files) => setState(() => _varios = files),
      onError: (code, message, fileName) =>
          setState(() => _erro = '$fileName: ${code.name}'),
    ),
    const SizedBox(height: 8),
    Text('Arquivos: ${_varios.length}'),
    Text('Última recusa: $_erro'),
  ],
)
```

## SgFileUpload: limites de quantidade e de tamanho (texto com unidade)

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

## SgFileUpload: tipos aceitos (`mediaType`)

```dart
const SgFileUpload(
  id: 'planilha',
  labelText: 'Planilha ou PDF',
  mediaType: [
    SgMediaType.pdf,
    SgMediaType.xls,
    SgMediaType.xlsx,
  ],
  maxFiles: 2,
)
```

## SgFileUpload: em formulário (o valor é `List<SgFile>`)

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
      label: Text(context.tx('Enviar')),
      onClick: () => _form.handleSubmit(
        (values) => setState(
          () => _enviado =
              '${(values['comprovantes'] as List).length} arquivo(s)',
        ),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

## SgFileUpload: desabilitado com arquivo já salvo

```dart
const SgFileUpload(
  id: 'anexo-desabilitado',
  labelText: 'Anexo',
  enabled: false,
  defaultValue: [SgFile(name: 'contrato.pdf', size: 482304)],
)
```

## SgImageUpload: básico

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'foto',
      labelText: 'Foto',
      onChange: (files) => setState(() => _uma = files),
    ),
    const SizedBox(height: 8),
    Text(
      'Valor atual: ${_uma.isEmpty ? '-' : '${_uma.first.name} (${_uma.first.size} bytes)'}',
    ),
  ],
)
```

## SgImageUpload: regras (formato, tamanho, dimensão e proporção)

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

## SgImageUpload: várias imagens (grade de miniaturas)

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
      onChange: (files) => setState(() => _galeria = files),
    ),
    const SizedBox(height: 8),
    Text('Imagens: ${_galeria.length}'),
  ],
)
```

## SgImageUpload: imagem já salva (URL)

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

## SgImageUpload: em formulário (o valor é `List<SgFile>`)

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
      label: Text(context.tx('Enviar')),
      onClick: () => _form.handleSubmit(
        (values) => setState(
          () => _enviado =
              (values['documento'] as List).cast<SgFile>().first.name,
        ),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

## SgImageUpload: desabilitado

```dart
const SgImageUpload(
  id: 'foto-desabilitada',
  labelText: 'Foto',
  enabled: false,
)
```

## SgCameraCapture: básico

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
        onCapture: (image) => setState(() => _captured = image),
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_captured?.length ?? '-'} bytes'),
    if (_captured != null) Image.memory(_captured!, width: 160),
  ],
)
```

## SgCameraCapture: guia oval (selfie)

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
        onCapture: (image) => setState(() => _selfie = image),
      ),
    ),
    if (_selfie != null) ...[
      const SizedBox(height: 8),
      Image.memory(_selfie!, width: 160),
    ],
  ],
)
```

## SgCameraCapture: guia retangular (documento)

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
        onCapture: (image) => setState(() => _documento = image),
      ),
    ),
    if (_documento != null) ...[
      const SizedBox(height: 8),
      Image.memory(_documento!, width: 160),
    ],
  ],
)
```

## SgCameraCapture: tratar erros da câmera

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
            setState(() => _cameraError = '${code.name}: $message'),
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_cameraError ?? '-'}'),
  ],
)
```
