---
description: "Tabela de paridade React × Flutter dos componentes SeedGrid, em perguntas e respostas: quantos componentes estão portados ou parciais, quais são portados 100%, as limitações que se repetem e como ler e regenerar o docs/PARIDADE.md."
tags: [seedgrid, front, component, flutter, dart, paridade, perguntas-e-respostas]
fonte: front/seedgrid-fe-flutter/docs/PARIDADE.md
branch: main
commit: 2e33260
analisado-em: 2026-10-25
---

# Paridade React × Flutter

> **Status: NÃO PUBLICADO.** Resumo de `docs/PARIDADE.md` (gerado por `node tools/parity_table/generate.mjs` a partir do `@seedgrid/fe-components` 2026.7.1; **não edite à mão**). A tabela completa, com o motivo de cada `parcial`, fica no repositório; aqui estão os números, os componentes sem ressalva e as limitações que se repetem. Contexto: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]] · onde cada widget fica: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]].

## Qual é o placar?

**89 componentes** do React: **27 portados**, **62 parciais**, 0 pendentes, 0 não aplicáveis (cabeçalho do `docs/PARIDADE.md`).

- `portado`: sem ressalva registrada na coluna "Onde / motivo".
- `parcial`: existe o widget, com a diferença registrada (motivo na tabela).
- Colunas extras: "Omitidas" = props do React que não existem no Flutter de propósito (`className`, `style`, `register`, atributos HTML; ADR 50); "Genéricas" = props cujo tipo Dart do contrato ainda é genérico (função, união, tipo a portar; lista em `tools/gen_props/excecoes.json`).

## Quais estão portados sem ressalva?

| Onda | Componentes |
|---|---|
| 0 | `SgComponentsI18nProvider`, `SgEnvironmentProvider` |
| 1 | `SgAvatar`, `SgAvatarGroup`, `SgBadge`, `SgBadgeOverlay`, `SgButton`, `SgInputCPF`, `SgInputCPFCNPJ`, `SgInputPhone`, `SgSkeleton`, `SgStepperInput` |
| 2 | `SgAccordion`, `SgExpandablePanel`, `SgGroupBox`, `SgPageControl`, `SgPageControlPage`, `SgScreen`, `SgToaster`, `SgToastHost`, `SgWhistleHost`, `SgWhistler`, `SgWizardPage` |
| 3 | `SgYearPartSelector` |
| 4 | `SgClockThemeProvider`, `SgFlipDigit`, `SgSegmentDigit` |

Todos os demais estão `parcial`. Os números de onda são os do plano (0 = fundação, 1 = formulário e inputs básicos, 2 = layout/overlay/providers, 3 = seleção avançada e dados, 4 = dígitos e gadgets, 5 = navegação e dados pesados, 6 = editor).

## Que limitações se repetem nos `parcial`?

Textos da coluna "Onde / motivo":
- **Goldens com a fonte de teste do Flutter:** não há comparação visual de texto com o React (inputs, escolha, diálogos, dígitos, gadgets).
- **Não testado em IME nem em dispositivo** (inputs e gadgets).
- **`inputProps`/`className`/`style` não existem** (ADR 50); `inputProps` é aceito e ignorado.
- **Sem `Intl`:** `SgInputNumber` e `SgInputCurrency` usam tabela gerada de locales e moedas; `SgCalendar` cobre 9 locales; `SgClock` tem fusos embutidos.
- **Valor nulo = não controlado** (Dart não distingue `null` de indefinido): `SgCombobox`, `SgPeriodSelector`, `SgDatatable` (`sortField`/`selection`), `SgInputText`.
- **Motor diferente do React:** `SgSlider` (Slider do Material tematizado), `SgDatatable` e `SgMenu` (motor próprio), `SgQRCode` (qrcodegen portado), `SgTextEditor` (`flutter_quill`).
- **Sem hover no toque:** `SgDockMenu` (sem zoom nem rótulo), dicas do `SgFloatActionButton`.
- **Sem navegação por `href`:** `SgBreadcrumb` dispara `onClick`/`onNavigate`, não abre a URL (falta `url_launcher`); `SgMenu` só chama `onNavigate`.
- **Tema por URL/SVG livre do relógio:** não portado (`SgClockUrlThemeUnsupportedError`; ADR 51/D8).
- **Persistência de posição só em memória** (`SgCard`, `SgDockLayout`) até haver `shared_preferences` no uso, ou por store plugável.

## O que o `SgTextEditor` não suporta?

Motor `flutter_quill` (MIT) em vez de TipTap; o conteúdo trafega como HTML por conversor próprio (HTML do TipTap lido e reescrito igual em 160+ fixtures do TipTap real, segundo o `docs/PARIDADE.md`). Fora do modelo Delta: tabelas e iframes (descartados); `<br>` vira U+2028; `sub` e `sup` juntos (vence um); `<mark>` sem cor vira amarelo; cor com alfa perde o alfa; tamanho em em/pt/% vira px; `ol start`; item de lista com vários parágrafos vira um item com quebra suave; citação com lista/título/citação aninhada achata; classe de linguagem do bloco de código; regras de markdown (`# `, `- `, `1. `, `> `) e atalhos só os do `flutter_quill`. Salvar/carregar HTML usa `file_picker` (extra `htmlFilePicker`); `onSave` recebe `SgTextEditorFile`.

## Como leio e regenero a tabela?

```bash
node tools/parity_table/generate.mjs        # regrava docs/PARIDADE.md
```

A mesma fonte alimenta o menu do showcase: componentes ainda não portados apareceriam esmaecidos com a marca "pendente" (`README.md`, seção Showcase). O estado vem de `src/index.ts` do React e do estado do repositório Dart; um componente do React sem widget aparece como pendente.

## Não verificado

- Não regenerei a tabela nem rodei `flutter test`; os números (27/62/0/0) são os do cabeçalho do `docs/PARIDADE.md` no commit `2e33260`, e o repositório tinha alterações sem commit na data da análise, então o placar pode mudar.
- Antes de a T8.1 do plano (paridade final) ser marcada, a tabela deve ser regenerada e esta nota revista; ela não é a evidência dessa tarefa.
