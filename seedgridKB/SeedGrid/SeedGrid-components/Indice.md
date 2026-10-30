---
tags: [seedgrid, component, indice]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components
branch: main
commit: ad30fc11de
fonte-flutter: front/seedgrid-fe-flutter
commit-flutter: e9989b8
analisado-em: 2026-10-30
gerado-por: scripts/kb-catalogs.mjs --only components
---

# Índice dos componentes SeedGrid (React e Flutter)

> **Duas plataformas, os mesmos nomes de componente.** **React** = `@seedgrid/fe-components` (`front/seedgrid-fe-components`); **Flutter** = `seedgrid_components` (`front/seedgrid-fe-flutter`, não publicado). `SgButton` existe nas duas, com API quase igual. Antes de escolher ou copiar código, leia [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]] (onde está cada uma, como escolher, placar de paridade). Cada seção abaixo diz a plataforma no título.

**React.** Monorepo `front/seedgrid-fe-components` (pnpm + Turborepo, React 19). Pacote principal `@seedgrid/fe-components` 2026.7.1; importação pública pelo barrel `src/index.ts` (`import { SgButton } from "@seedgrid/fe-components"`) e CSS em `@seedgrid/fe-components/style.css` — detalhes em [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]].

**Flutter.** Monorepo `front/seedgrid-fe-flutter` (pub workspaces); pacote `seedgrid_components` (importação `package:seedgrid_components/seedgrid_components.dart`), com `seedgrid_theme` e `seedgrid_commons`; notas em [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Flutter: visão geral]], [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]], [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]].

- **Exportado = sim**: disponível no barrel público. **não**: interno (documentado só para referência).
- Cada grupo tem `Visao-geral` (quando usar), `API` (props completas, eventos, a11y) e `Exemplos` (React: TSX validado contra a API; Flutter: Dart copiado das regiões do showcase), nas duas plataformas.
- Contratos comuns: react-hook-form e base `SgInputText` em [[SeedGrid/SeedGrid-components/inputs-texto/API|inputs-texto/API]].
- App de vitrine: [[SeedGrid/SeedGrid-components/showcase|Showcase]]. Pacotes de tema/core/playground: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]]. Módulos de tela ligados às extensions: [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos]].
- Esta nota é **gerada** (`node scripts/kb-catalogs.mjs --only components --write`) a partir das notas de cada grupo; os resumos são a 1ª frase da coluna "Para que serve"/"Use para" da Visao-geral (≤100 caracteres) — corrija a nota de origem e regenere.

## Resumo — React

| Grupo | Componentes `Sg*` | Outros símbolos (hooks, funções, pacotes) | Notas (React) |
|---|---|---|---|
| Inputs de texto e documentos | 15 | 0 | [[SeedGrid/SeedGrid-components/inputs-texto/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] · [[SeedGrid/SeedGrid-components/inputs-texto/Exemplos\|Exemplos]] |
| Inputs de seleção e valores | 14 | 0 | [[SeedGrid/SeedGrid-components/inputs-selecao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] · [[SeedGrid/SeedGrid-components/inputs-selecao/Exemplos\|Exemplos]] |
| Tabela de dados | 1 | 0 | [[SeedGrid/SeedGrid-components/datatable/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/datatable/API\|API]] · [[SeedGrid/SeedGrid-components/datatable/Exemplos\|Exemplos]] |
| Editor de texto rico | 1 | 0 | [[SeedGrid/SeedGrid-components/editor/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/editor/API\|API]] · [[SeedGrid/SeedGrid-components/editor/Exemplos\|Exemplos]] |
| Botões | 3 | 2 | [[SeedGrid/SeedGrid-components/buttons/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/buttons/API\|API]] · [[SeedGrid/SeedGrid-components/buttons/Exemplos\|Exemplos]] |
| Feedback e exibição | 11 | 12 | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] · [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Exemplos\|Exemplos]] |
| Layout e containers | 19 | 34 | [[SeedGrid/SeedGrid-components/layout/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/layout/API\|API]] · [[SeedGrid/SeedGrid-components/layout/Exemplos\|Exemplos]] |
| Navegação, overlay e wizard | 6 | 11 | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] · [[SeedGrid/SeedGrid-components/navegacao-e-overlay/Exemplos\|Exemplos]] |
| Gadgets (relógio, calendário, gauges, QR) | 10 | 22 | [[SeedGrid/SeedGrid-components/gadgets/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/gadgets/API\|API]] · [[SeedGrid/SeedGrid-components/gadgets/Exemplos\|Exemplos]] |
| Dígitos animados | 8 | 0 | [[SeedGrid/SeedGrid-components/digits/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/digits/API\|API]] · [[SeedGrid/SeedGrid-components/digits/Exemplos\|Exemplos]] |
| Providers (ambiente/persistência e realtime) | 2 | 16 | [[SeedGrid/SeedGrid-components/providers/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/providers/API\|API]] · [[SeedGrid/SeedGrid-components/providers/Exemplos\|Exemplos]] |
| Fundamentos do @seedgrid/fe-components | 0 | 8 | [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] · [[SeedGrid/SeedGrid-components/fundamentos/Exemplos\|Exemplos]] |
| Pacotes de apoio | 0 | 4 | [[SeedGrid/SeedGrid-components/pacotes/Visao-geral\|Visão geral]] |
| Módulos de tela @seedgrid/fe-* | 0 | 10 | [[SeedGrid/SeedGrid-components/modulos/Visao-geral\|Visão geral]] |
| Showcase | 0 | 1 | [[SeedGrid/SeedGrid-components/showcase\|Showcase]] |
| **Total React** | **90** | **120** |  |

## Resumo — Flutter

| Grupo | Componentes (placar de paridade) | Portados | Parciais | Não portados | Outros símbolos (apoio, controllers, enums, funções) | Notas (Flutter) |
|---|---|---|---|---|---|---|
| Inputs de texto e documentos | 15 | 15 | 0 | 0 | 27 | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Exemplos\|Exemplos]] |
| Inputs de seleção e valores | 14 | 14 | 0 | 0 | 51 | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos\|Exemplos]] |
| Tabela de dados | 1 | 1 | 0 | 0 | 11 | [[SeedGrid/SeedGrid-components/flutter/datatable/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/datatable/Exemplos\|Exemplos]] |
| Editor de texto rico | 1 | 1 | 0 | 0 | 7 | [[SeedGrid/SeedGrid-components/flutter/editor/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/editor/Exemplos\|Exemplos]] |
| Botões | 3 | 3 | 0 | 0 | 10 | [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/buttons/Exemplos\|Exemplos]] |
| Feedback e exibição | 9 | 9 | 0 | 0 | 31 | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos\|Exemplos]] |
| Layout e containers | 19 | 19 | 0 | 0 | 67 | [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos\|Exemplos]] |
| Navegação, overlay e wizard | 6 | 6 | 0 | 0 | 16 | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos\|Exemplos]] |
| Gadgets (relógio, calendário, gauges, QR) | 10 | 10 | 0 | 0 | 90 | [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos\|Exemplos]] |
| Dígitos animados | 8 | 8 | 0 | 0 | 38 | [[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/digits/Exemplos\|Exemplos]] |
| Providers (ambiente/persistência e realtime) | 2 | 2 | 0 | 0 | 46 | [[SeedGrid/SeedGrid-components/flutter/providers/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/providers/Exemplos\|Exemplos]] |
| Fundamentos do @seedgrid/fe-components | 1 | 1 | 0 | 0 | 12 | [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral\|Visão geral]] · [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] · [[SeedGrid/SeedGrid-components/flutter/fundamentos/Exemplos\|Exemplos]] |
| **Total Flutter** | **89** | **89** | **0** | **0** | **406** |  |

## Onde está cada símbolo

Procure o nome abaixo e abra só a seção dele: `Grep "^## NomeDoComponente"` no `API.md` do grupo (props completas) e depois leia essa faixa com `offset`/`limit`. Para escolher o componente por necessidade ("preciso de X"), leia [[SeedGrid/SeedGrid-components/Preciso-de|Preciso de X, use Y]] e valide as props com a skill `sg-componente`. O resumo de cada símbolo, e se ele é exportado, está em [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]] (leia só se precisar escolher entre componentes parecidos).

### React

- **Inputs de texto e documentos** (`inputs-texto/`, React): SgInputText, SgInputTextArea, SgInputTextSearch, SgInputEmail, SgInputPassword, SgInputPhone, SgInputCPF, SgInputCNPJ, SgInputCPFCNPJ, SgInputPostalCode, SgInputDate, SgInputBirthDate, SgInputNumber, SgInputCurrency, SgInputOTP
- **Inputs de seleção e valores** (`inputs-selecao/`, React): SgAutocomplete, SgCombobox, SgCheckboxGroup, SgRadioGroup, SgMultiSelect, SgMultiSelectChips, SgOrderList, SgPickList, SgPeriodSelector, SgYearPartSelector, SgToggleSwitch, SgRating, SgSlider, SgStepperInput
- **Tabela de dados** (`datatable/`, React): SgDatatable
- **Editor de texto rico** (`editor/`, React): SgTextEditor
- **Botões** (`buttons/`, React): SgButton, SgSplitButton, SgFloatActionButton, buildFabStorageKey, parseStoredFabDragPosition
- **Feedback e exibição** (`feedback-e-exibicao/`, React): SgAvatar, SgAvatarGroup, SgBadge, SgBadgeOverlay, SgSkeleton, SgToaster, SgToastHost, SgWhistler, SgWhistleHost, SgToasterHostContext, SgWhistlerHostContext, dismissSgToast, subscribeSgToasts, registerHost, unregisterHost, getActiveHostId, hasAnyHost, subscribeHostRegistry, nextHostId, dismissSgWhistle, subscribeSgWhistles, toast, sgWhistle
- **Layout e containers** (`layout/`, React): SgStack, SgGrid, SgPanel, SgScreen, SgGroupBox, SgCard, SgAccordion, SgPageControl, SgPageControlPage, SgExpandablePanel, SgCarousel, SgBreadcrumb, SgMenu, SgTreeView, SgDockLayout, SgDockZone, SgDockScreen, SgToolBar, SgToolbarIconButton, useSgDockLayout, renderDockContent e helpers de sgDocking.tsx, parseStoredPanelDragPosition, buildToolbarStorageKey, buildDockMenuStorageKey, resolveToolbarOrientationDirection, resolveToolbarDockOrientationDirection, buildToolbarLayoutState, buildMenuMaps, collectParentChain, computeActiveSets, resolveEffectiveActiveId, mergeExpandedIdsForActivePath, resolveTieredActiveState, resolveMenuLayoutState, resolveMenuNodeActionIntent, resolveExpandedIdsToggle, resolveMenuHintPosition, resolveHorizontalDockAlign, resolveTieredHoverPath, resolveTieredHoverIntent, resolveTieredClickState, resolveMenuSearchSelectionState, resolveTieredNodeClickIntent, resolveMegaMenuActiveNode, resolveMegaMenuInteraction, resolveMegaMenuHoverActiveId, resolveMenuAutocompleteItems, filterMenuNodes, collectMenuSearchEntries, flattenVisibleNodes, resolveMenuKeyboardAction, sgTreeFromJson, sgTreeFromJsonWithChecked
- **Navegação, overlay e wizard** (`navegacao-e-overlay/`, React): SgDockMenu, SgPopup, SgDialog, SgConfirmationDialog, SgWizard, SgWizardPage, resolveDockMenuOrientation, resolveDockMenuLiftDirection, buildDockMenuLayout, buildDockMenuItemMotion, buildDockMenuLabelStyle, buildDockMenuContainerStyle, buildDockMenuContextMenuState, buildDockMenuStorageKey, clampWizardStep, canNavigateToWizardStep, canProceedWizardAction
- **Gadgets (relógio, calendário, gauges, QR)** (`gadgets/`, React): SgCalendar, SgClock, SgTimeProvider, useSgTime, SgClockThemeProvider, useSgClockThemeResolver, createThemeResolver, registerTheme, registerThemes, getTheme, hasTheme, listThemes, unregisterTheme, clearThemes, resolveTheme, ThemeLayer, useDarkFlag, sgClockThemesBuiltIn, SgClockThemePicker, SgClockThemePreview, SgLinearGauge, SgRadialGauge, SgQRCode, SgStringAnimator, SG_STRING_ANIMATOR_DEFAULT_CHARSET, useSgTimeContext, filterClockThemes, resolveClockThemeSelection, themes/search.ts, gauge/math.ts, clampGaugeValue, valueToGaugeRatio
- **Dígitos animados** (`digits/`, React): SgDiscardDigit, SgFadeDigit, SgFlipDigit, SgMatrixDigit, SgNeonDigit, SgRoller3DDigit, SgSegmentDigit, SgSevenSegmentDigit
- **Providers (ambiente/persistência e realtime)** (`providers/`, React): SgEnvironmentProvider, useSgEnvironment, useSgNamespaceProvider, useSgPersistence, useSgPersistentState, useHasSgEnvironmentProvider, buildSgPersistenceKey, createLocalStorageStrategy, createApiPersistenceStrategy, createCompositePersistenceStrategy, readLocalPersistentState, writeLocalPersistentState, clearLocalPersistentState, resolvePersistedStateValue, SgRealtimeProvider, useSgRealtimeEvent, useSgRealtimeStatus, matchesSgRealtimeEvent
- **Fundamentos do @seedgrid/fe-components** (`fundamentos/`, React): masks.ts, validators.ts, blocked-email-domains.ts, rhf.ts, i18n/, injectStyles.ts, generated/compiledStyles.ts, ai-meta/
- **Pacotes de apoio** (`pacotes/`, React): @seedgrid/fe-theme, @seedgrid/fe-core, @seedgrid/fe-commons, @seedgrid/fe-playground
- **Módulos de tela @seedgrid/fe-*** (`modulos/`, React): Composição do front e do admin (adicionar e remover módulos), @seedgrid/fe-apikeys, @seedgrid/fe-audit, @seedgrid/fe-backup, @seedgrid/fe-billing-platform, @seedgrid/fe-billing-user, @seedgrid/fe-login-tenancy, @seedgrid/fe-security, @seedgrid/fe-self-enter, @seedgrid/fe-subdomain-tenancy
- **Showcase** (`showcase/`, React): apps/showcase

### Flutter

Só os widgets e símbolos principais; os de apoio ficam no Catálogo. Mesmo critério, nas notas `flutter/<grupo>/API.md` (`Grep "^## NomeDoComponente"` dentro de `flutter/<grupo>/API.md`; sem o prefixo `flutter/` o grupo é o React).

- **Inputs de texto e documentos** (`flutter/inputs-texto/`, Flutter): SgInputText, SgInputTextArea, SgInputTextSearch, SgInputEmail, SgInputPassword, SgInputPhone, SgInputCPF, SgInputCNPJ, SgInputCPFCNPJ, SgInputPostalCode, SgInputDate, SgInputBirthDate, SgInputNumber, SgInputCurrency, SgInputOTP — mais 27 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Inputs de seleção e valores** (`flutter/inputs-selecao/`, Flutter): SgAutocomplete, SgCombobox, SgCheckboxGroup, SgRadioGroup, SgMultiSelect, SgMultiSelectChips, SgOrderList, SgPickList, SgPeriodSelector, SgYearPartSelector, SgToggleSwitch, SgRating, SgSlider, SgStepperInput — mais 51 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Tabela de dados** (`flutter/datatable/`, Flutter): SgDatatable — mais 11 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Editor de texto rico** (`flutter/editor/`, Flutter): SgTextEditor — mais 7 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Botões** (`flutter/buttons/`, Flutter): SgButton, SgSplitButton, SgFloatActionButton — mais 10 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Feedback e exibição** (`flutter/feedback-e-exibicao/`, Flutter): SgAvatar, SgAvatarGroup, SgBadge, SgBadgeOverlay, SgSkeleton, SgToaster, SgToastHost, SgWhistler, SgWhistleHost — mais 31 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Layout e containers** (`flutter/layout/`, Flutter): SgStack, SgGrid, SgPanel, SgScreen, SgGroupBox, SgCard, SgAccordion, SgPageControl, SgPageControlPage, SgExpandablePanel, SgCarousel, SgBreadcrumb, SgMenu, SgTreeView, SgDockLayout, SgDockZone, SgDockScreen, SgToolBar, SgToolbarIconButton — mais 67 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Navegação, overlay e wizard** (`flutter/navegacao-e-overlay/`, Flutter): SgDockMenu, SgPopup, SgDialog, SgConfirmationDialog, SgWizard, SgWizardPage — mais 16 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Gadgets (relógio, calendário, gauges, QR)** (`flutter/gadgets/`, Flutter): SgCalendar, SgClock, SgTimeProvider, SgClockThemeProvider, SgClockThemePicker, SgClockThemePreview, SgLinearGauge, SgRadialGauge, SgQRCode, SgStringAnimator — mais 90 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Dígitos animados** (`flutter/digits/`, Flutter): SgDiscardDigit, SgFadeDigit, SgFlipDigit, SgMatrixDigit, SgNeonDigit, SgRoller3DDigit, SgSegmentDigit, SgSevenSegmentDigit — mais 38 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Providers (ambiente/persistência e realtime)** (`flutter/providers/`, Flutter): SgEnvironmentProvider, SgRealtimeProvider — mais 46 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
- **Fundamentos do @seedgrid/fe-components** (`flutter/fundamentos/`, Flutter): SgForm, SgFormController, SgRules, SgValidationScope, SgComponentsI18nProvider, setComponentsI18n, sgNode, SeedThemeProvider, SgTheme, maskCpf, isValidCpf, buscarCep, SgHttpClient — mais 12 símbolo(s) de apoio (controllers, enums, funções) no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]
