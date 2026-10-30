---
description: "API Flutter de Editor de texto rico: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, editor, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Editor de texto rico (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/editor/API|API — Editor de texto rico (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgTextEditor

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgTextEditor` (mesmo nome).

Editor de texto rico para conteudo formatado, comentarios elaborados e edicao textual com recursos visuais.

- Arquivo: `packages/seedgrid_components/lib/src/inputs/editor/sg_text_editor.dart` (linha 76) · classe `class SgTextEditor extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_text_editor.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgTextEditor({...})` com 20 parâmetro(s) nomeado(s), 19 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 3.

### Props de SgTextEditor

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador unico do editor. |
| `borderRadius` | `Object?` | — | não | React | Numero (px) ou texto CSS em `px`/`rem`. Padrao: 8 (rounded-lg). Tipo no React: `string \| number`. |
| `control` | `SgFormController?` | — | não | React | Tipo no React: `any`. |
| `cssEditorLabel` | `String?` | — | não | React | — |
| `cssText` | `String?` | `''` | não | React | — |
| `defaultValueHtml` | `String?` | — | não | React | — |
| `disabled` | `bool?` | — | não | React | — |
| `error` | `String?` | — | não | React | — |
| `fileName` | `String?` | — | não | React | — |
| `height` | `num?` | `320` | não | React | Altura do editor. |
| `name` | `String?` | — | não | React | — |
| `onChangeHtml` | `ValueChanged<String>?` | — | não | React | Recebe o HTML do corpo (`editor.getHTML()`) a cada edicao do usuario. Tipo no React: `((htmlBody: string) => void)`. |
| `onCssTextChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((cssText: string) => void)`. |
| `onLoad` | `ValueChanged<SgTextEditorSaveMeta>?` | — | não | React | Tipo no React: `((meta: SgTextEditorSaveMeta) => void)`. |
| `onSave` | `void Function(SgTextEditorFile file, SgTextEditorSaveMeta meta)?` | — | não | React | Callback de persistencia do conteudo. Tipo no React: `((file: File, meta: SgTextEditorSaveMeta) => void)`. |
| `placeholder` | `String?` | — | não | React | Texto de ajuda inicial. |
| `rules` | `SgRules?` | — | não | React | Tipo no React: `RegisterOptions<any>`. |
| `showCssEditor` | `bool?` | `false` | não | React | — |
| `valueHtml` | `String?` | — | não | React | — |
| `htmlFilePicker` | `SgTextEditorHtmlFilePicker?` | — | não | Flutter | Dart: seletor do botao "Carregar HTML" (padrao: seletor de arquivos do sistema). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md e docs/SG_TEXT_EDITOR_PoC.md)

- **Motor:** `flutter_quill` (MIT, `^11.5.0`) nativo, no lugar do TipTap. O conteúdo trafega como HTML do corpo por conversor próprio (`sg_text_editor_html.dart`): HTML do TipTap lido e reescrito igual em 160+ fixtures do TipTap real; 154 de 166 saídas do Dart relidas pelo TipTap real ficam iguais ao canônico.
- **Preservados com atributos próprios:** `<sub>` e `<sup>` juntos, `<mark>` sem cor, cor com alfa, nome de cor e tamanho em `em`/`pt`/`%`, `ol start` (numerado na tela só no primeiro nível) e a linguagem do bloco de código.
- **Não portado:** tabelas e `iframe` (descartados na leitura, por decisão do dono; a barra não tem botão de tabela). O PoC acrescenta `video`, `input`, `script` e `style`, também descartados.
- **Limites do modelo Delta (linear):** `<br>` vira U+2028; item de lista com vários parágrafos vira um item com quebra suave; citação com lista, título ou outra citação aninhada é achatada; título dentro de item de lista vira item comum; bloco de código perde marcas internas (o TipTap também as descarta).
- **Não portado:** regras de markdown (`# `, `- `, `1. `, `> `); só valem os atalhos do próprio `flutter_quill` (incluindo Ctrl+Z).
- Cor do texto e destaque por seletor próprio (paleta + `#rrggbb`) no lugar do `<input type="color">`; diálogos próprios de link e imagem no lugar de `window.prompt` (cancelar não remove o link).
- `disabled` é reativo (no React só vale na criação); `onSave` recebe `SgTextEditorFile` no lugar de `File`; Salvar e Carregar HTML usam `file_picker` (extra `htmlFilePicker`).
- Não testado em dispositivo nem com IME; sem `className`/`style` (ADR 50).
- Defeitos do React registrados (não corrigidos no React; o Dart mostra o placeholder): ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]].

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `inputs/editor/sg_text_editor.dart`)
- `onChangeHtml: ValueChanged<String>?`: recebe o HTML do corpo a cada edição **local** do usuário (`_onDocChange`, só para `ChangeSource.local`). Carregar HTML e mudar `valueHtml` por fora **não** o disparam (`_setContent` cancela a assinatura enquanto troca o documento).
- `onSave: void Function(SgTextEditorFile file, SgTextEditorSaveMeta meta)?`: ao tocar em Salvar. `SgTextEditorFile` tem `name` (padrão `fileName` ou `<id>.html`), `mimeType` (`text/html;charset=utf-8`), `bytes` e o getter `text`. `SgTextEditorSaveMeta` tem `htmlDocument`, `contentHtml`, `cssText`.
- `onLoad: ValueChanged<SgTextEditorSaveMeta>?`: depois de carregar um arquivo HTML (o `<style>` do `<head>` vai para o CSS; o corpo vira o conteúdo).
- `onCssTextChange: ValueChanged<String>?`: ao editar o CSS (`showCssEditor`) e quando um arquivo carregado traz CSS diferente do atual.
- Salvar e Carregar HTML aparecem na barra mesmo sem `onSave`/`onLoad` (herdado do React, comentário do código).
- `htmlFilePicker: SgTextEditorHtmlFilePicker?` (`Future<SgTextEditorFile?> Function()`): troca o seletor de arquivos; devolver `null` cancela.

**Controlado, formulário e estado**
- `valueHtml` controla o conteúdo; `defaultValueHtml` só inicializa. `valueHtml` voltando a `null` depois de ter valor limpa o editor.
- Com `name` e um `SgForm` (ou `control`), o campo se registra com `rules` (`registerField`), o valor do formulário manda e cada edição faz `setValue` (revalidando se já há erro ou envio). O componente **não** registra validador próprio, só as `rules`. O documento vazio vale `<p></p>`, então `required` passa depois de digitar e apagar tudo (pegadinha herdada do React).
- Não há controller próprio; o `QuillController` é interno.
- `error` e o erro do formulário são combinados por `resolveFieldError`.

**Conversor HTML** (`SgTextEditorHtml`, `sg_text_editor_html.dart`): `toDelta`/`fromDelta` para o corpo e `parseDocument`/`buildDocument` para o documento completo; marcas na ordem do esquema do TipTap.

**Acessibilidade**
- Área de edição: `Semantics(label: i18n 'components.textEditor.editorAriaLabel', textField: true, multiline: true, readOnly: disabled)`.
- Barra: botões com `Semantics` e `Tooltip` (`sg_text_editor_toolbar.dart`); amostras de cor com `Semantics(button: true, label: <cor>)`.
- Alvos de toque de 44 px abaixo de 600 px de largura (36 px acima).
- Atalho próprio: Shift+Enter insere quebra suave; os demais são os do `flutter_quill`.
- Leitores de tela reais: **não confirmado**.

