---
description: "Exemplos Dart (Flutter) de Data e hora, imagem e câmera, copiados dos snippets do showcase do seedgrid_components."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages
branch: main
commit: 00e893c
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
      rules: const SgRules(required: 'Anexe ao menos um arquivo'),
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
  disabled: true,
  defaultValue: [SgFile(name: 'contrato.pdf', size: 482304)],
)
```

## SgImageUpload: básico

O valor é `List<SgFile>` (use `files.first` com `maxFiles` padrão 1). Os snippets completos estão em `sg_image_upload_page.snippets.g.dart`.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    SgImageUpload(
      id: 'foto',
      labelText: 'Foto',
      onChange: (files) => setState(
        () => _info = files.isEmpty
            ? null
            : '${files.first.name} (${files.first.size} bytes)',
      ),
    ),
    const SizedBox(height: 8),
    Text('Valor atual: ${_info ?? '-'}'),
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
