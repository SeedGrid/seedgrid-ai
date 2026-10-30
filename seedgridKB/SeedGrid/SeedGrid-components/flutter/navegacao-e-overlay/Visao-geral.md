---
description: "Navegação, overlay e wizard em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, navegacao-e-overlay]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Navegação, overlay e wizard — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Visao-geral|Navegação, overlay e wizard — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API|API — Navegação, overlay e wizard (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Exemplos — Navegação, overlay e wizard (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

6 componente(s): **6 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgDockMenu` | portado | Menu de ações no estilo dock, com zoom, selos, rótulos, oito posições e arraste. | `pages/sg_dock_menu_page.dart` |
| `SgPopup` | portado | Painel ancorado a um widget para ações e detalhes curtos, sem abrir um modal. | `pages/sg_popup_page.dart` |
| `SgDialog` | portado | Diálogo modal com severidade, tamanhos, animação e controle de foco. | `pages/sg_dialog_page.dart` |
| `SgConfirmationDialog` | portado | Diálogo de confirmação com mensagem, severidade e botões de confirmar e cancelar. | `pages/sg_confirmation_dialog_page.dart` |
| `SgWizard` | portado | Fluxo em etapas com stepper, validação por etapa e finalização assíncrona. | `pages/sg_wizard_demo_page.dart` |
| `SgWizardPage` | portado | Uma etapa do `SgWizard`, com título, ícone e conteúdo. | `pages/sg_wizard_page_page.dart` |

## Quando usar

- `SgDialog`: conteúdo focado e modal (formulário curto, detalhe). Para só perguntar "confirma?" use `SgConfirmationDialog`.
- `SgConfirmationDialog`: ações sensíveis (excluir, sair sem salvar), com `onConfirm`/`onCancel`. Para mensagem que não exige resposta use `toast` ([[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral|Feedback e exibição]]).
- `SgPopup`: painel pequeno ancorado a um widget (menu de ações, detalhe) que não bloqueia a tela. Exige uma `GlobalKey` na âncora; para ação principal + menu num botão só, use `SgSplitButton` ([[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Botões]]).
- `SgDockMenu`: barra de atalhos estilo dock (desktop com mouse se beneficia do zoom). Para navegação lateral completa use `SgMenu` ([[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|Layout]]).
- `SgWizard` + `SgWizardPage`: fluxos longos divididos em etapas com validação a cada passo. Para abas livres, sem ordem obrigatória, use `SgPageControl`.

## O que muda em relação ao React

- Diálogo e popup desenham no `Overlay` raiz (`OverlayPortal`); `zIndex` e `lockBodyScroll` existem por contrato, sem efeito; props de classe CSS são aceitas e ignoradas.
- `SgPopup.anchorRef` é uma `GlobalKey`; `SgDialog.initialFocusRef` é um `FocusNode`; textos (`title`, `message`, `subtitle`) aceitam `String` ou `Widget`.
- `SgDockMenu` não é `position: fixed`: ancora na área que o pai dá (use `Stack`); zoom e rótulo só com mouse/caneta.
- `SgWizard` valida pela API de formulário do Dart (`SgFormController.trigger`, `SgValidationScope`), não varrendo inputs do DOM.
- Placar do grupo: 6 de 6 portados. Detalhes: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte do lado React: `navegacao-e-overlay/Visao-geral` ("Funções e tipos públicos relacionados").

| Símbolo do React | Equivalente em Flutter |
|---|---|
| `clampWizardStep`, `canNavigateToWizardStep`, `canProceedWizardAction` | portado e exportado (`feedback/sg_wizard.dart`) |
| `buildDockMenuStorageKey` | portado e exportado (`menus/dock_menu/dock_menu_logic.dart`, via barril com `show`) |
| `resolveDockMenuOrientation`, `resolveDockMenuLiftDirection`, `buildDockMenuLayout`, `buildDockMenuItemMotion`, `buildDockMenuContainerStyle`, `buildDockMenuContextMenuState`, `buildDockMenuLabelStyle` | existem no arquivo `dock_menu_logic.dart` (o último como `buildDockMenuLabelSide`), mas **não são exportados** pelo barril (`menus_dock.dart` usa `show` de 4 símbolos): não são API pública |
| `parseStoredPanelDragPosition` | existe em `dock_menu_logic.dart`, não exportado pelo barril de menus (**não confirmado** se outro barril o exporta; `SgDockMenu` o usa internamente) |
| Tipos `SgPopupPlacement`, `SgPopupPreferPlacement`, `SgPopupAlign`, `SgDialogSize`, `SgDialogSeverity`, `SgDialogAnimation`, `SgWizardStepper`, `WizardStepNavigation` | enums gerados (`SgPopupPlacement`, …, `SgWizardStepNavigation`) em `generated/enums.g.dart`, exportados; `SgPopupSeverity` fica em `overlay/sg_popup.dart` |
| `WizardGuardRunner` | sem tipo nomeado: os guardas são `FutureOr<bool> Function(int)` nos parâmetros do `SgWizard` |

## Não verificado

- Não executei `flutter test` nem o showcase para esta nota; leitura estática no commit `e9989b8`.
- `parseStoredPanelDragPosition`: só confirmei que não sai pelo barril de menus; não busquei exportação em outros barris.
- Não conferi o texto efetivo das chaves de i18n (apenas os nomes).

## Símbolos públicos do grupo (além dos widgets)

Extraído dos barris `overlay/overlay.dart` (exporta só `parseCssColor`, `relativeLuminance`, `kDialogDefaultShadow` de `overlay_support.dart`), `menus/menus_dock.dart` (só 4 símbolos de `dock_menu_logic.dart`) e `feedback/feedback.dart` (`sg_wizard.dart` inteiro); descrição = comentário `///` do código quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgWizardLabels` | class | Textos dos botões (parcial; o que faltar vem do i18n). | `lib/src/feedback/sg_wizard.dart` |
| `clampWizardStep`, `canNavigateToWizardStep`, `canProceedWizardAction` | função | Lógica de navegação e guardas do wizard (equivalem às funções do React). | `lib/src/feedback/sg_wizard.dart` |
| `parseCssColor` | função | Cor CSS em texto (`#hex`, `rgb()`, `hsl()`); `null` se não entender. | `lib/src/overlay/overlay_support.dart` |
| `relativeLuminance` | função | Luminância relativa de uma cor. | `lib/src/overlay/overlay_support.dart` |
| `kDialogDefaultShadow` | constante | Sombra padrão do diálogo quando não há `elevation` nem `shadow` (`shadow-2xl` do Tailwind). | `lib/src/overlay/overlay_support.dart` |
| `SgConfirmationDialogButtonConfig` | class | Configuração de um dos botões do `SgConfirmationDialog` (`className` não existe). | `lib/src/overlay/sg_confirmation_dialog.dart` |
| `SgPopupSeverity`, `SgPopupAction` | enum / class | Severidades e ação do popup. | `lib/src/overlay/sg_popup.dart` |
| `computePopupPosition` | função | Equivale a `computePosition` + `chooseAutoPlacement` do React (devolve o canto superior esquerdo). | `lib/src/overlay/sg_popup.dart` |
| `SgDockMenuItem` | class | Item do dock (`id`, `icon`, `label`, `onClick`, `disabled`, `badge`). | `lib/src/menus/dock_menu/sg_dock_menu.dart` |
| `SgDockMenuOffset`, `SgDockMenuDragPosition`, `SgDockMenuOrientation`, `buildDockMenuStorageKey` | class / enum / função | Deslocamento, posição salva, orientação e chave de persistência do dock. | `lib/src/menus/dock_menu/dock_menu_logic.dart` |
