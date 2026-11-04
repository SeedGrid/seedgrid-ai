---
description: "Exemplos Dart (Flutter) de Data e hora, imagem e câmera, copiados dos snippets do showcase do seedgrid_components."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 6a35c93
analisado-em: 2026-11-04
---

# Exemplos — Data e hora, imagem e câmera (Flutter)

> **Plataforma: Flutter.** Os exemplos React do mesmo grupo estão em [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API (Flutter)]].

Os trechos vêm dos `*.snippets.g.dart` do showcase (`sg_input_date_time_page`, `sg_image_upload_page`, `sg_camera_capture_page`). Os estados (`_instante`, `_info`, `_captured`, `_form`…) são campos do `State` da página; troque-os pelos do seu widget.

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

## SgInputDateTime: em formulário (fuso -03:00)

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
      rules: const SgRules(required: 'Informe a data e a hora'),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text(context.tx('Enviar')),
      onClick: () => _form.handleSubmit(
        (values) => setState(() => _enviado = '${values['consulta']}'),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
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
      onChange: (file) => setState(
        () => _info = file == null ? null : '${file.name} (${file.size} bytes)',
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_info ?? '-'}'),
  ],
)
```

## SgImageUpload: regras (tipo, tamanho, dimensão e proporção)

```dart
const SgImageUpload(
  id: 'avatar',
  labelText: 'Avatar',
  accept: 'image/png,image/jpeg',
  maxSizeBytes: 2 * 1024 * 1024,
  minWidth: 200,
  minHeight: 200,
  aspect: 1,
  hintText: 'PNG ou JPEG, até 2 MB, quadrada, mínimo 200 × 200 px.',
)
```

## SgImageUpload: em formulário (o valor é `SgImageFile`)

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'documento',
      name: 'documento',
      control: _form,
      labelText: 'Foto do documento',
      rules: const SgRules(required: 'Escolha uma imagem'),
    ),
    const SizedBox(height: 12),
    SgButton(
      label: Text(context.tx('Enviar')),
      onClick: () => _form.handleSubmit(
        (values) => setState(
          () => _enviado = (values['documento'] as SgImageFile).name,
        ),
      ),
    ),
    if (_enviado.isNotEmpty) Text('Enviado: $_enviado'),
  ],
)
```

## SgCameraCapture: básico

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCameraCapture(
      id: 'foto',
      labelText: 'Foto',
      onCapture: (image) => setState(() => _captured = '${image.length} bytes'),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_captured ?? '-'}'),
  ],
)
```

## SgCameraCapture: guia oval (selfie)

```dart
const SgCameraCapture(
  id: 'selfie',
  labelText: 'Selfie',
  facing: SgCameraCaptureFacing.user,
  guide: SgCameraCaptureGuide.oval,
)
```

## SgCameraCapture: guia retangular (documento)

```dart
const SgCameraCapture(
  id: 'documento',
  labelText: 'Documento',
  facing: SgCameraCaptureFacing.environment,
  guide: SgCameraCaptureGuide.rect,
  resolution: SgCameraCaptureResolution.high,
  previewHeight: 240,
)
```

## SgCameraCapture: tratar erros da câmera

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgCameraCapture(
      id: 'foto-erros',
      labelText: 'Foto',
      onError: (code, message) =>
          setState(() => _cameraError = '${code.name}: $message'),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_cameraError ?? '-'}'),
  ],
)
```
