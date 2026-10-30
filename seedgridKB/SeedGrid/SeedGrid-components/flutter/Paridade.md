---
description: "Tabela de paridade React × Flutter dos componentes SeedGrid, em perguntas e respostas: placar (89 portados, 0 parciais, 0 não portados), o que mudou no critério de parcial, quais portados não têm ressalva, limitações que se repetem, perdas do editor e como ler e regenerar o docs/PARIDADE.md."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, paridade, perguntas-e-respostas]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/docs/PARIDADE.md
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Paridade React × Flutter

> **Plataforma: Flutter (comparada com o React).** Resumo de `docs/PARIDADE.md` e `docs/paridade.json` (gerados por `node tools/parity_table/generate.mjs` a partir do `@seedgrid/fe-components` 2026.7.1; **não edite à mão**), commit `e9989b8` do repositório Flutter. A tabela completa, com o motivo de cada ressalva, fica no repositório e, por componente, na seção "Diferenças do React" de cada `<grupo>/API`. Visão geral das duas plataformas: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]] · [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral do Flutter]].

## Qual é o placar?

**89 componentes** do React: **89 portados, 0 parciais, 0 pendentes, 0 não aplicáveis** (cabeçalho do `docs/PARIDADE.md` e `resumo` do `docs/paridade.json`, commit `e9989b8`). Por grupo: [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|inputs-texto]] 15, [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|inputs-selecao]] 14, [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|layout]] 19, [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|gadgets]] 10, [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral|feedback-e-exibicao]] 9, [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral|digits]] 8, [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|navegacao-e-overlay]] 6, [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|buttons]] 3, [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral|providers]] 2, [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral|datatable]] 1, [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral|editor]] 1 e [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral|fundamentos]] 1 (`SgComponentsI18nProvider`). Soma das colunas da tabela: 2042 props no contrato, 154 omitidas de propósito e 549 genéricas.

**O critério mudou.** A versão anterior desta nota (commit `314cb5a`) dizia 27 portados e 62 parciais. Desde o commit `b1dfe4e` ("parcial só para funcionalidade que falta") o `parcial` não é mais usado para diferença de propósito ou limitação de teste: os 62 antigos `parcial` agora são `portado` **com ressalva registrada** na coluna "Onde / motivo", e os 27 sem ressalva são os mesmos de antes. Os componentes que só ganharam o status final depois (`SgClock`, `SgRealtimeProvider`, `SgMenu`, `SgCalendar`, `SgInputNumber`/`SgInputCurrency`, `SgPeriodSelector`, `SgWizard`, layout, `SgTextEditor`) saíram do status parcial pelos commits listados no histórico do repositório (`git log 314cb5a..e9989b8`); não repito o que cada um corrigiu aqui, está na ressalva de cada um.

- `portado`: o componente existe e cobre a funcionalidade do React; a coluna "Onde / motivo" registra o arquivo e, depois do travessão, as ressalvas.
- Colunas extras: "Omitidas" = props do React que não existem no Flutter de propósito (`className`, `style`, `register`, atributos HTML; ADR 50); "Genéricas" = props cujo tipo Dart do contrato ainda é genérico (função, união, tipo a portar; lista em `tools/gen_props/excecoes.json`).
- **Não portado de verdade** (não aparece como pendente, mas é limite registrado): tema de relógio por URL/SVG livre; `href` real no `SgBreadcrumb` e no `SgMenu`; tabelas e iframes no `SgTextEditor`; ligação do SDK Pulse por dependência no `SgRealtimeProvider`; hooks do React (viraram widget, função ou controller; ver a seção "Símbolos do React" de cada `<grupo>/Visao-geral`).

## Quais estão portados sem nenhuma ressalva?

27 componentes têm o campo "Onde / motivo" só com o caminho do arquivo:

| Onda | Componentes |
|---|---|
| 0 | `SgComponentsI18nProvider`, `SgEnvironmentProvider` |
| 1 | `SgAvatar`, `SgAvatarGroup`, `SgBadge`, `SgBadgeOverlay`, `SgButton`, `SgInputCPF`, `SgInputCPFCNPJ`, `SgInputPhone`, `SgSkeleton`, `SgStepperInput` |
| 2 | `SgAccordion`, `SgExpandablePanel`, `SgGroupBox`, `SgPageControl`, `SgPageControlPage`, `SgScreen`, `SgToastHost`, `SgToaster`, `SgWhistleHost`, `SgWhistler`, `SgWizardPage` |
| 3 | `SgYearPartSelector` |
| 4 | `SgClockThemeProvider`, `SgFlipDigit`, `SgSegmentDigit` |

As ondas 5 (navegação e dados pesados: `SgDatatable`, `SgDockMenu`, `SgFloatActionButton`, `SgMenu`, `SgSplitButton`, `SgToolBar`, `SgToolbarIconButton`) e 6 (`SgTextEditor`) têm ressalva em todos os componentes. Números de onda do plano: 0 fundação, 1 formulário e inputs básicos, 2 layout/overlay/providers, 3 seleção avançada e dados, 4 dígitos e gadgets, 5 navegação e dados pesados, 6 editor.

## Que limitações se repetem nas ressalvas?

Textos da coluna "Onde / motivo":
- **Goldens com a fonte de teste do Flutter:** não há comparação visual de texto com o React (inputs, escolha, diálogos, dígitos, gadgets).
- **Não testado em IME nem em dispositivo** (inputs e gadgets).
- **`inputProps`/`className`/`style` não existem** (ADR 50); `inputProps` é aceito e ignorado.
- **Sem `Intl` em tempo de execução:** `SgInputNumber` e `SgInputCurrency` usam tabela gerada (30 locales latinos e 162 moedas; locale sem dados cai no idioma e depois em `en-US`); `SgCalendar` tem 33 locales gerados do `Intl` do Node; `SgClock` tem tabela IANA própria (464 zonas, 2019 a 2045).
- **Decisões do dono (2026-10-25 e 2026-10-26):** "validadores do componente rodam no submit" (inputs de texto, máscara, número, data, `SgToggleSwitch`, `SgInputOTP`) e "onChange do usuário também dentro de formulário" (`SgMultiSelect`, `SgMultiSelectChips`). Ver [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].
- **Valor nulo = não controlado** (Dart não distingue `null` de indefinido): `SgCombobox`, `SgPeriodSelector` (com a exceção de que voltar o `value` para nulo limpa o campo), `SgRating`, `SgInputText` e outros. No `SgInputText`, `value` controla o texto; com `name` + formulário o valor do formulário manda e `value` é ignorado, como no React.
- **Motor diferente do React:** `SgSlider` (Slider do Material tematizado), `SgDatatable` e `SgMenu` (motor próprio), `SgQRCode` (algoritmo qrcodegen portado, conferido contra o `qrcode.react` em 118 matrizes), `SgTextEditor` (`flutter_quill`).
- **Sem hover no toque:** `SgDockMenu` (sem zoom nem rótulo), dicas do `SgFloatActionButton`.
- **Sem navegação por `href`:** `SgBreadcrumb` dispara `onClick`/`onNavigate`, não abre a URL (falta `url_launcher`); `SgMenu` só chama `onNavigate`.
- **Tema por URL/SVG livre do relógio:** não portado (`SgClockUrlThemeUnsupportedError`; ADR 51/D8).
- **Persistência:** `SgCard` guarda a posição arrastada pelo `SgEnvironmentProvider` ou `shared_preferences` (commit `612b9ed`); `SgDockLayout` usa um `SgDockLayoutStore` plugável e só guarda em memória sem ele.

## O que o `SgTextEditor` não suporta?

Motor `flutter_quill` (MIT) em vez de TipTap; o conteúdo trafega como HTML por conversor próprio (`sg_text_editor_html.dart`; HTML do TipTap lido e reescrito igual em 160+ fixtures do TipTap real, segundo o `docs/PARIDADE.md`). Desde o commit `998d709` vários casos antes perdidos são **preservados** com atributos próprios no Delta (`docs/SG_TEXT_EDITOR_PoC.md`): `sub` e `sup` juntos, `<mark>` sem cor, cor com alfa, cor por nome, tamanho em em/rem/pt/%, `<ol start>` (numerado na tela só no primeiro nível) e a linguagem do bloco de código.

Continua **sem suporte** (limites do modelo Delta e decisões do dono): tabelas e iframes (descartados; a barra não tem botão de tabela, por decisão do dono); `<br>` vira U+2028; item de lista com vários parágrafos vira um item com quebra suave; citação com lista, título ou citação aninhada é achatada; título dentro de item de lista vira item comum; regras de markdown (`# `, `- `, `1. `, `> `) e atalhos só os do `flutter_quill` (dependência `flutter_quill: ^11.5.0` em `packages/seedgrid_components/pubspec.yaml`, travada até o repositório subir para Flutter >= 3.44). Cor do texto e destaque por seletor próprio (paleta + hex); diálogos de link/imagem próprios no lugar de `window.prompt` (cancelar não remove o link); `disabled` reativo. Salvar/carregar HTML usa `file_picker` (extra `htmlFilePicker`); `onSave` recebe `SgTextEditorFile`.

## Como leio e regenero a tabela?

```bash
node tools/parity_table/generate.mjs        # regrava docs/PARIDADE.md e docs/paridade.json
```

A mesma fonte alimenta o catálogo do showcase: componente do React ainda sem widget apareceria como "pendente" (hoje não há nenhum). O estado vem de `src/index.ts` do React e do estado do repositório Dart.

## Não verificado

- Não rodei `flutter test` nem o gerador ao escrever esta nota; os números (89/0/0/0, 27 sem ressalva, 2042/154/549) são os de `docs/paridade.json` no commit `e9989b8` (somas feitas por mim sobre o JSON).
- A afirmação de que os 62 antigos `parcial` são os atuais portados-com-ressalva vem da comparação das duas listas (a de 27 sem ressalva é idêntica nas duas versões da nota); o critério novo vem da mensagem do commit `b1dfe4e`, não de um documento do repositório.
- Os números sobre locales, moedas, fusos e QR vêm do texto da tabela; não os recontei no código.
