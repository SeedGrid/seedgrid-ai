---
description: "Editor de texto rico em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, editor]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Editor de texto rico — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/editor/Visao-geral|Editor de texto rico — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/editor/API|API — Editor de texto rico (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos|Exemplos — Editor de texto rico (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

1 componente(s): **1 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgTextEditor` | portado | Editor de texto rico com barra, HTML do corpo, CSS opcional, salvar e carregar. | `pages/sg_text_editor_page.dart` |

## Quando usar

- `SgTextEditor`: conteúdo formatado (negrito, listas, links, imagens, alinhamento) que precisa sair como HTML. Para texto simples de várias linhas, use `SgInputTextArea` ([[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|inputs de texto]]).
- O conteúdo é HTML do corpo. O conversor descarta `script`, `style`, `iframe` e links com protocolo não permitido (PoC), mas **Inferência**: trate o HTML como entrada não confiável e valide no servidor antes de exibi-lo em outro lugar.

## O que muda em relação ao React

- O motor é o `flutter_quill` (Delta) com conversor HTML próprio; tabelas e `iframe` são descartados e há limites do modelo linear (listas e citações aninhadas).
- Seletor de cor e diálogos de link/imagem próprios; `disabled` reativo; `onSave` entrega `SgTextEditorFile`.
- Detalhes: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] (editor e defeitos do React) · [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte: [[SeedGrid/SeedGrid-components/editor/Visao-geral|Editor de texto rico — React]]. O grupo React só exporta `SgTextEditor` e seus tipos; no Dart: `SgTextEditorFile`, `SgTextEditorSaveMeta`, `SgTextEditorHtmlFilePicker`, `SgTextEditorHtml` e `SgTextEditorCommands` (tabela abaixo). Nenhum símbolo ficou sem equivalente confirmado.

## Não verificado

- Não executei `flutter test` nem o showcase; os números de fixtures (160+, 154 de 166, 264 no PoC) vêm de `docs/PARIDADE.md` e `docs/SG_TEXT_EDITOR_PoC.md`. O PoC é anterior a algumas correções (sub+sup, mark, alfa agora preservados); vale o `docs/PARIDADE.md` atual.
- Comportamento em dispositivo, IME e leitores de tela: não verificado.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgTextEditorFile` | class | Arquivo gerado por `onSave` (equivale ao `File` do navegador). | `lib/src/inputs/editor/sg_text_editor.dart` |
| `SgTextEditorSaveMeta` | class | `SgTextEditorSaveMeta` do React. | `lib/src/inputs/editor/sg_text_editor.dart` |
| `SgTextEditorHtmlFilePicker` | typedef | Seletor de arquivo HTML (devolve nulo se o usuario cancelar). | `lib/src/inputs/editor/sg_text_editor.dart` |
| `sgIsAllowedLinkUri` | função | `isAllowedUri` do TipTap Link: relativo ou protocolo permitido. | `lib/src/inputs/editor/sg_text_editor_html.dart` |
| `sgCssColorToHex` | função | Cor CSS -> `#rrggbb` (ou nulo). O canal alfa e descartado; para guardar o alfa use [sgCssColorToQuill]. | `lib/src/inputs/editor/sg_text_editor_html.dart` |
| `sgCssColorToQuill` | função | Cor CSS -> valor de cor do Delta: `#rrggbb` quando opaca e `rgba(r, g, b, a)` quando tem transparencia (o flutter_quill le os dois formatos). Nulo se a cor for invalida. | `lib/src/inputs/editor/sg_text_editor_html.dart` |
| `SgTextEditorHtml` | class | Conversao entre o HTML do SgTextEditor (corpo, como `editor.getHTML()`) e Delta. | `lib/src/inputs/editor/sg_text_editor_html.dart` |

