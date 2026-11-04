---
description: "Data e hora, imagem e câmera em Flutter (seedgrid_components): quando usar cada widget, estado de paridade com o React e diferenças de plataforma (valor em bytes, seletor do sistema, pacote camera)."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 00e893c
analisado-em: 2026-11-04
---

# Data e hora, imagem e câmera — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `6a35c93` na `main`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Data e hora, imagem e câmera — React]] (commit local, **ainda não publicado** no npm; o `SgFileUpload` e a nova API do `SgImageUpload` só entram no React depois da validação do dono, P141.F4).

- API completa (construtor, parâmetros, callbacks, erros): [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API — Data e hora, imagem e câmera (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

4 componente(s): **4 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `6a35c93`; planos P132, P133, P134 e P141).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgInputDateTime` | portado | Campo de data e hora com máscara, calendário e seletor de hora; entrega o instante ISO 8601 UTC. | `pages/sg_input_date_time_page.dart` |
| `SgFileUpload` | portado | **Base de arquivos**: escolhe um ou vários arquivos de qualquer tipo (`mediaType`), valida o tipo pelo conteúdo, a quantidade e o tamanho (por arquivo e total); o valor é sempre uma lista. | `pages/sg_file_upload_page.dart` |
| `SgImageUpload` | portado | **Composição** do `SgFileUpload` só para imagens: miniaturas (grade com `maxFiles > 1`), dimensão mínima e proporção. | `pages/sg_image_upload_page.dart` |
| `SgCameraCapture` | portado | Pré-visualização da câmera com guia de enquadramento, troca frontal/traseira e captura em JPEG. | `pages/sg_camera_capture_page.dart` |

## Quando usar

Mesmas recomendações do React (ver [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral#Quando usar|Quando usar]]): `SgInputDateTime` para timestamps, `SgImageUpload` para escolher uma imagem, `SgCameraCapture` para tirar a foto na hora. O envio ao servidor é sempre do host.

## O que muda em relação ao React

- **Valores:** `SgFileUpload` e `SgImageUpload` entregam `List<SgFile>` (nome, bytes ou url, tipo, tamanho), **sempre lista**. `SgCameraCapture.onCapture` entrega `Uint8List` (JPEG). O React ainda entrega `File` no `SgImageUpload` até a rodada do P141.F4, quando passa a lista também.
- **`SgFileUpload` e `SgImageUpload`:** o toque abre o seletor do sistema (`file_picker`); **não há arrastar e soltar**. Vários arquivos vêm de `maxFiles > 1` (não existe `multiple`). Os limites `maxSizePerFile` e `maxSizeTotal` aceitam bytes ou texto com unidade (`"1.5MB"`). O tipo é conferido pelo **conteúdo** (assinatura). A prop extra `picker` troca o seletor. **Sem retrocompatibilidade**: `SgImageFile` e `maxSizeBytes` deixaram de existir.
- **`SgInputDateTime`:** em vez do `datetime-local` nativo, usa máscara por idioma, calendário próprio e `showTimePicker` do Material. **Sem banco de fusos**: valem `local`, `UTC` e deslocamento fixo (`-03:00`); nome IANA (`America/Sao_Paulo`) **cai em `local`**. `alwaysFloat` não tem efeito. Data impossível (31/02) mostra "Data e hora inválidas".
- **`SgCameraCapture`:** usa o pacote `camera` (**dependência nova** do `seedgrid_components`, `^0.12.0+2`; vale para qualquer consumidor do pacote). A origem da câmera é injetável (`backend`, extra do Flutter). A câmera pausa em segundo plano e reabre ao voltar. No web, a prévia frontal é espelhada e a foto capturada não; o web usa `getUserMedia` próprio (o `camera_web` falhava com câmeras virtuais paradas). `onFrame` fica fora da primeira versão.
- **Formulário:** `SgInputDateTime` e `SgImageUpload` ligam-se ao `SgFormController` (`name` + `control`); os validadores (`rules`) rodam **no submit**. `SgCameraCapture` não tem ligação com formulário.
- **Não testado em dispositivo real:** a câmera foi validada só com câmera simulada (`SgCameraBackend`).

## Limitações e pontos de atenção

- A permissão de câmera precisa ser declarada em cada plataforma de destino (Android, iOS); o pacote `camera` documenta isso. **Inferência**, pelo comportamento do plugin.
- Vetores de teste compartilhados com o React (`test/widgets/*_vectors`) garantem as mesmas regras de fuso, validação, guia e classificação de erro nas duas plataformas. **Confirmado** no relato da `front`.
