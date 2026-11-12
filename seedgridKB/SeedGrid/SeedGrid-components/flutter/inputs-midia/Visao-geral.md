---
description: "Data e hora, arquivo, imagem, câmera e seletor de cor em Flutter (seedgrid_components): quando usar cada widget, estado de paridade com o React e diferenças de plataforma (valor em bytes, seletor do sistema, pacote camera)."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-midia]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: 8a43f9d
analisado-em: 2026-11-07
---

# Data e hora, imagem e câmera — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `8a43f9d` na `main`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|Data e hora, imagem e câmera — React]] (commits locais, **ainda não publicados** no npm; o `SgFileUpload` e a nova API do `SgImageUpload` já estão no React, commit `bb0ad1f`).

- API completa (construtor, parâmetros, callbacks, erros): [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API — Data e hora, imagem e câmera (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Exemplos|Exemplos — Data e hora, imagem e câmera (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

4 componente(s) com equivalente no React: **2 portado(s)** (`SgInputDateTime`, `SgCameraCapture`), **2 parcial(is)** (`SgFileUpload`, `SgImageUpload`), **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e5e8baf`, não reconferida nesta revisão; planos P132, P133, P134 e P141). O motivo do "parcial": aqui o toque abre o seletor do sistema (`file_picker`) e o valor é `SgFile`, sem arrastar e soltar; o React aceita arrastar e soltar e entrega `File` do navegador.

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgInputDateTime` | portado | Data e hora com máscara, calendário e seletor; o valor trafega em `local` (padrão), `utc` ou `offset` (`valueMode`). | `pages/sg_input_date_time_page.dart` |
| `SgFileUpload` | parcial | **Base de arquivos**: escolhe um ou vários arquivos de qualquer tipo (`mediaType`), valida o tipo pelo conteúdo, a quantidade e o tamanho (por arquivo e total); o valor é sempre uma lista. | `pages/sg_file_upload_page.dart` |
| `SgImageUpload` | parcial | **Composição** do `SgFileUpload` só para imagens: miniaturas (grade com `maxFiles > 1`), dimensão mínima e proporção. | `pages/sg_image_upload_page.dart` |
| `SgCameraCapture` | portado | Pré-visualização da câmera com guia de enquadramento, troca frontal/traseira e captura em JPEG. | `pages/sg_camera_capture_page.dart` |
| `SgColorPicker` | só Flutter | Seletor de cor `#RRGGBB`: área de saturação e brilho com barra de matiz (ou três sliders), campo hex com validação, cores predefinidas e `showSgColorPicker` para abrir num diálogo. Não existe no React. | `pages/sg_color_picker_page.dart` |

## Quando usar

Mesmas recomendações do React (ver [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral#Quando usar|Quando usar]]): `SgInputDateTime` para timestamps, `SgImageUpload` para escolher uma imagem, `SgCameraCapture` para tirar a foto na hora. O envio ao servidor é sempre do host.

## O que muda em relação ao React

- **Valores:** `SgFileUpload` e `SgImageUpload` entregam `List<SgFile>` (nome, bytes ou url, tipo, tamanho), **sempre lista**. No React o valor também é lista (`SgFileValue[]`: `File` ou `{ name, url, size?, type? }`). `SgCameraCapture.onCapture` entrega `Uint8List` (JPEG) e, no React, um `Blob`.
- **`SgFileUpload` e `SgImageUpload`:** o toque abre o seletor do sistema (`file_picker`); **não há arrastar e soltar**. Vários arquivos vêm de `maxFiles > 1` (não existe `multiple`). Os limites `maxSizePerFile` e `maxSizeTotal` aceitam bytes ou texto com unidade (`"1.5MB"`). O tipo é conferido pelo **conteúdo** (assinatura). A prop `picker` (só no Flutter) troca o seletor; o React tem, em troca, `pickerAccept`. Os nomes das demais props (`thumbnailBuilder`, `extraCheck`, `thumbnailSize`, `keyPrefix`, `dropTextKey`, `dropManyTextKey`, `typeNames`) são **iguais** nas duas plataformas. **Sem retrocompatibilidade**: `SgImageFile` e `maxSizeBytes` deixaram de existir.
- **`SgInputDateTime`:** em vez do `datetime-local` nativo, usa máscara por idioma, calendário próprio e `showTimePicker` do Material. **Fusos:** valem `local` (o do dispositivo), `UTC`, deslocamento fixo (`-03:00`) e nome IANA (`America/Sao_Paulo`, `Asia/Tokyo`), este pela tabela própria do `SgClock` (horário de verão de 2019 a 2045, sem dependência nova); nome IANA desconhecido cai em `local`. **Valor:** a prop `valueMode` (`SgInputDateTimeValueMode.local` padrão, `utc`, `offset`) escolhe o formato que sai (`onChange`, formulário) e que o formulário aceita, igual ao React (`2026-01-15T10:30`, `2026-01-15T13:30:00Z`, `2026-01-15T10:30:00-03:00`). **Mudança que quebra:** o padrão antes era UTC com milissegundos (`...:00.000Z`); um `Instant` do Java não lê o padrão `local`, use `valueMode: SgInputDateTimeValueMode.utc`. `alwaysFloat` não tem efeito. Data impossível (31/02) mostra "Data e hora inválidas".
- **`SgCameraCapture`:** usa o pacote `camera` (**dependência nova** do `seedgrid_components`, `^0.12.0+2`; vale para qualquer consumidor do pacote). A origem da câmera é injetável (`backend`, extra do Flutter). A câmera pausa em segundo plano e reabre ao voltar. No web, a prévia frontal é espelhada e a foto capturada não; o web usa `getUserMedia` próprio (o `camera_web` falhava com câmeras virtuais paradas). `onFrame` fica fora da primeira versão.
- **Formulário:** `SgInputDateTime`, `SgFileUpload` e `SgImageUpload` ligam-se ao `SgFormController` (`name` + `control`). `SgInputDateTime` registra um validador próprio (obrigatório, data válida e intervalo) que roda **no submit**; `SgFileUpload`/`SgImageUpload` registram a mensagem de `required` (sem `requiredMessage` ela fica vazia). Não existe mais a prop `rules`. `SgColorPicker` liga-se ao formulário sem `required`. `SgCameraCapture` não tem ligação com formulário.
- **Não testado em dispositivo real:** a câmera foi validada só com câmera simulada (`SgCameraBackend`).

## Limitações e pontos de atenção

- A permissão de câmera precisa ser declarada em cada plataforma de destino (Android, iOS); o pacote `camera` documenta isso. **Inferência**, pelo comportamento do plugin.
- Vetores de teste compartilhados com o React (`test/widgets/*_vectors`) garantem as mesmas regras de fuso, validação, guia e classificação de erro nas duas plataformas. **Confirmado** no relato da `front`.
