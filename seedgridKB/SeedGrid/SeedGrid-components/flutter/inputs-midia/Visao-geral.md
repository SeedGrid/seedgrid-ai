---
description: "Data e hora, imagem e câmera em Flutter (seedgrid_components): quando usar cada widget, estado de paridade com o React e diferenças de plataforma (valor em bytes, seletor do sistema, pacote camera)."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 6a35c93
analisado-em: 2026-11-04
---

# Data e hora, imagem e câmera — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `6a35c93` na `main`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Data e hora, imagem e câmera — React]] (commit local `839e245`, **ainda não publicado** no npm).

- API completa (construtor, parâmetros, callbacks, erros): [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API — Data e hora, imagem e câmera (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

3 componente(s): **3 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `6a35c93`; planos P132, P133 e P134).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgInputDateTime` | portado | Campo de data e hora com máscara, calendário e seletor de hora; entrega o instante ISO 8601 UTC. | `pages/sg_input_date_time_page.dart` |
| `SgImageUpload` | portado | Escolhe uma imagem pelo seletor do sistema, valida tipo, tamanho, dimensão e proporção, com pré-visualização. | `pages/sg_image_upload_page.dart` |
| `SgCameraCapture` | portado | Pré-visualização da câmera com guia de enquadramento, troca frontal/traseira e captura em JPEG. | `pages/sg_camera_capture_page.dart` |

## Quando usar

Mesmas recomendações do React (ver [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral#Quando usar|Quando usar]]): `SgInputDateTime` para timestamps, `SgImageUpload` para escolher uma imagem, `SgCameraCapture` para tirar a foto na hora. O envio ao servidor é sempre do host.

## O que muda em relação ao React

- **Valor da imagem:** `SgImageUpload.onChange` entrega `SgImageFile` (`name`, `bytes`, `mimeType`, `size` = `bytes.length`), **não** um `File`. `SgCameraCapture.onCapture` entrega `Uint8List` (JPEG), não um `Blob`.
- **`SgImageUpload`:** o toque abre o seletor do sistema (`file_picker`); **não há arrastar e soltar**. A prop extra `picker` troca o seletor (testes ou outra origem). `value`/`defaultValue` em texto são a URL de uma imagem salva (`Image.network`).
- **`SgInputDateTime`:** em vez do `datetime-local` nativo, usa máscara por idioma, calendário próprio e `showTimePicker` do Material. **Sem banco de fusos**: valem `local`, `UTC` e deslocamento fixo (`-03:00`); nome IANA (`America/Sao_Paulo`) **cai em `local`**. `alwaysFloat` não tem efeito. Data impossível (31/02) mostra "Data e hora inválidas".
- **`SgCameraCapture`:** usa o pacote `camera` (**dependência nova** do `seedgrid_components`, `^0.12.0+2`; vale para qualquer consumidor do pacote). A origem da câmera é injetável (`backend`, extra do Flutter). A câmera pausa em segundo plano e reabre ao voltar. `onFrame` fica fora da primeira versão.
- **Formulário:** `SgInputDateTime` e `SgImageUpload` ligam-se ao `SgFormController` (`name` + `control`); os validadores (`rules`) rodam **no submit**. `SgCameraCapture` não tem ligação com formulário.
- **Não testado em dispositivo real:** a câmera foi validada só com câmera simulada (`SgCameraBackend`).

## Limitações e pontos de atenção

- A permissão de câmera precisa ser declarada em cada plataforma de destino (Android, iOS); o pacote `camera` documenta isso. **Inferência**, pelo comportamento do plugin.
- Vetores de teste compartilhados com o React (`test/widgets/*_vectors`) garantem as mesmas regras de fuso, validação, guia e classificação de erro nas duas plataformas. **Confirmado** no relato da `front`.
