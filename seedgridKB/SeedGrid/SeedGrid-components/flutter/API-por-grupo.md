---
description: "Índice da API Flutter dos componentes SeedGrid por grupo (botões, inputs, layout, overlay, feedback, gadgets, dígitos, providers, fundamentos): onde fica cada widget no código Dart e a nota de API completa de cada grupo (construtor, parâmetros, callbacks, controllers, acessibilidade)."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, api, indice]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API por grupo (Flutter)

> **Plataforma: Flutter.** Esta nota virou o **índice**: a API completa de cada widget (construtor, cada parâmetro com tipo Dart e padrão, origem React ou extra do Flutter, diferenças do React, callbacks, controllers, formulário e acessibilidade) fica na nota `API` do grupo, nas pastas `flutter/<grupo>/`. A versão anterior (commit `314cb5a`) era um mapa de 72 linhas sem as props; foi substituída. A API React equivalente de cada grupo está em `SeedGrid/SeedGrid-components/<grupo>/API`. Visão geral: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral (Flutter)]] · estado de cada um: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · regras React → Dart: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Onde fica cada grupo?

Caminhos relativos a `packages/seedgrid_components/lib/src/`. Nomes de widget iguais aos do React. A fonte de verdade das listas é o `docs/paridade.json` (coluna `onde`) e os arquivos citados em cada seção `## Sg...` da nota de API.

| Grupo | Pastas no código | Widgets | API completa |
|---|---|---|---|
| Inputs de texto e documentos | `inputs/` (`sg_input_text.dart`), `inputs/text/`, `inputs/masked/`, `inputs/number/`, `inputs/otp/` | `SgInputText`, `SgInputTextArea`, `SgInputTextSearch`, `SgInputEmail`, `SgInputPassword`, `SgInputPhone`, `SgInputCPF`, `SgInputCNPJ`, `SgInputCPFCNPJ`, `SgInputPostalCode`, `SgInputDate`, `SgInputBirthDate`, `SgInputNumber`, `SgInputCurrency`, `SgInputOTP` | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| Inputs de seleção e valores | `inputs/select/`, `inputs/multi/`, `inputs/choice/`, `inputs/lists/`, `inputs/period/`, `inputs/number/` (`SgStepperInput`) | `SgAutocomplete`, `SgCombobox`, `SgCheckboxGroup`, `SgRadioGroup`, `SgMultiSelect`, `SgMultiSelectChips`, `SgOrderList`, `SgPickList`, `SgPeriodSelector`, `SgYearPartSelector`, `SgToggleSwitch`, `SgRating`, `SgSlider`, `SgStepperInput` | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| Tabela de dados | `inputs/datatable/` | `SgDatatable` (+ `SgDatatableController`, `SgDatatableColumn`) | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| Editor de texto rico | `inputs/editor/` | `SgTextEditor` | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| Botões | `buttons/` | `SgButton`, `SgSplitButton`, `SgFloatActionButton` | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| Feedback e exibição | `commons/`, `feedback/` | `SgAvatar`, `SgAvatarGroup`, `SgBadge`, `SgBadgeOverlay`, `SgSkeleton`, `SgToaster`, `SgToastHost`, `SgWhistler`, `SgWhistleHost` | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| Layout e containers | `layout/basic/`, `layout/containers/`, `layout/dock/`, `layout/tree/`, `layout/menu/` | `SgStack`, `SgGrid`, `SgPanel`, `SgScreen`, `SgGroupBox`, `SgCard`, `SgAccordion`, `SgPageControl`, `SgPageControlPage`, `SgExpandablePanel`, `SgCarousel`, `SgBreadcrumb`, `SgMenu`, `SgTreeView`, `SgDockLayout`, `SgDockZone`, `SgDockScreen`, `SgToolBar`, `SgToolbarIconButton` | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| Navegação, overlay e wizard | `menus/dock_menu/`, `overlay/`, `feedback/sg_wizard.dart` | `SgDockMenu`, `SgPopup`, `SgDialog`, `SgConfirmationDialog`, `SgWizard`, `SgWizardPage` | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| Gadgets | `gadgets/calendar/`, `gadgets/clock/`, `gadgets/gauges/`, `gadgets/string_animator/` | `SgCalendar`, `SgClock`, `SgTimeProvider`, `SgClockThemeProvider`, `SgClockThemePicker`, `SgClockThemePreview`, `SgLinearGauge`, `SgRadialGauge`, `SgQRCode`, `SgStringAnimator` | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| Dígitos animados | `digits/simple/`, `digits/animated/` | `SgSevenSegmentDigit`, `SgSegmentDigit`, `SgMatrixDigit`, `SgNeonDigit`, `SgFadeDigit`, `SgFlipDigit`, `SgRoller3DDigit`, `SgDiscardDigit` | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| Providers | `providers/` | `SgEnvironmentProvider`, `SgRealtimeProvider` | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| Fundamentos (formulário, i18n, tema, commons) | `form/`, `i18n/`, `props/`, `theme_access.dart`, `generated/enums.g.dart`; pacotes `seedgrid_theme` e `seedgrid_commons` | `SgComponentsI18nProvider`, `SgForm`/`SgFormController`/`SgRules` (sem equivalente 1:1: substitui o react-hook-form, ADR 49), tema, máscaras e validadores | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |

## Como acho o contrato completo de um componente?

1. A nota `flutter/<grupo>/API` do grupo, seção `## NomeDoComponente` (`Grep "^## NomeDoComponente"` na nota e leia só a faixa).
2. `lib/src/generated/<comp>.g.dart`: interface `<Comp>Props` com tipo, default e enum de cada prop do React. Arquivos gerados: não edite.
3. Página do showcase: `apps/seedgrid_showcase/lib/pages/<snake>_page.dart`, com exemplos (código = renderizado) e a "Referência de Props"; o ao vivo fica em `components-flutter.seedgrid.com.br`.
4. Teste do componente: `packages/seedgrid_components/test/widgets/<comp>_test.dart`.

## Não verificado

- Os grupos e pastas vêm dos barris `lib/src/**/*.dart` e do `docs/paridade.json`; a conferência de cada widget está nas notas de API de cada grupo.
- Não executei `flutter test` nem `flutter analyze`.
