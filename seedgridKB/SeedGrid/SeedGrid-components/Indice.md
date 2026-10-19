---
tags: [seedgrid, component, indice]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
gerado-por: scripts/kb-catalogs.mjs --only components
---

# Índice dos componentes SeedGrid (front-end)

Monorepo `front/seedgrid-fe-components` (pnpm + Turborepo, React 19). Pacote principal `@seedgrid/fe-components` 2026.7.1; importação pública pelo barrel `src/index.ts` (`import { SgButton } from "@seedgrid/fe-components"`) e CSS em `@seedgrid/fe-components/style.css` — detalhes em [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]].

- **Exportado = sim**: disponível no barrel público. **não**: interno (documentado só para referência).
- Cada grupo tem `Visao-geral` (quando usar), `API` (props completas, eventos, a11y) e `Exemplos` (TSX validado contra a API).
- Contratos comuns: react-hook-form e base `SgInputText` em [[SeedGrid/SeedGrid-components/inputs-texto/API|inputs-texto/API]].
- App de vitrine: [[SeedGrid/SeedGrid-components/showcase|Showcase]]. Pacotes de tema/core/playground: [[SeedGrid/SeedGrid-components/pacotes/Visao-geral|Pacotes]]. Módulos de tela ligados às extensions: [[SeedGrid/SeedGrid-components/modulos/Visao-geral|Módulos]].
- Esta nota é **gerada** (`node scripts/kb-catalogs.mjs --only components --write`) a partir das notas de cada grupo; os resumos são a 1ª frase da coluna "Para que serve"/"Use para" da Visao-geral (≤100 caracteres) — corrija a nota de origem e regenere.

## Resumo

| Grupo | Componentes `Sg*` | Outros símbolos (hooks, funções, pacotes) | Notas |
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
| Módulos de tela @seedgrid/fe-* | 0 | 9 | [[SeedGrid/SeedGrid-components/modulos/Visao-geral\|Visão geral]] |
| Showcase | 0 | 1 | [[SeedGrid/SeedGrid-components/showcase\|Showcase]] |
| **Total** | **90** | **119** |  |

## Onde está cada símbolo

Procure o nome abaixo e abra só a seção dele: `Grep "^## NomeDoComponente"` no `API.md` do grupo (props completas) e depois leia essa faixa com `offset`/`limit`. Para escolher o componente por necessidade ("preciso de X"), leia [[SeedGrid/SeedGrid-components/Preciso-de|Preciso de X, use Y]] e valide as props com a skill `sg-componente`. O resumo de cada símbolo, e se ele é exportado, está em [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]] (leia só se precisar escolher entre componentes parecidos).

- **Inputs de texto e documentos** (`inputs-texto/`): SgInputText, SgInputTextArea, SgInputTextSearch, SgInputEmail, SgInputPassword, SgInputPhone, SgInputCPF, SgInputCNPJ, SgInputCPFCNPJ, SgInputPostalCode, SgInputDate, SgInputBirthDate, SgInputNumber, SgInputCurrency, SgInputOTP
- **Inputs de seleção e valores** (`inputs-selecao/`): SgAutocomplete, SgCombobox, SgCheckboxGroup, SgRadioGroup, SgMultiSelect, SgMultiSelectChips, SgOrderList, SgPickList, SgPeriodSelector, SgYearPartSelector, SgToggleSwitch, SgRating, SgSlider, SgStepperInput
- **Tabela de dados** (`datatable/`): SgDatatable
- **Editor de texto rico** (`editor/`): SgTextEditor
- **Botões** (`buttons/`): SgButton, SgSplitButton, SgFloatActionButton, buildFabStorageKey, parseStoredFabDragPosition
- **Feedback e exibição** (`feedback-e-exibicao/`): SgAvatar, SgAvatarGroup, SgBadge, SgBadgeOverlay, SgSkeleton, SgToaster, SgToastHost, SgWhistler, SgWhistleHost, SgToasterHostContext, SgWhistlerHostContext, dismissSgToast, subscribeSgToasts, registerHost, unregisterHost, getActiveHostId, hasAnyHost, subscribeHostRegistry, nextHostId, dismissSgWhistle, subscribeSgWhistles, toast, sgWhistle
- **Layout e containers** (`layout/`): SgStack, SgGrid, SgPanel, SgScreen, SgGroupBox, SgCard, SgAccordion, SgPageControl, SgPageControlPage, SgExpandablePanel, SgCarousel, SgBreadcrumb, SgMenu, SgTreeView, SgDockLayout, SgDockZone, SgDockScreen, SgToolBar, SgToolbarIconButton, useSgDockLayout, renderDockContent e helpers de sgDocking.tsx, parseStoredPanelDragPosition, buildToolbarStorageKey, buildDockMenuStorageKey, resolveToolbarOrientationDirection, resolveToolbarDockOrientationDirection, buildToolbarLayoutState, buildMenuMaps, collectParentChain, computeActiveSets, resolveEffectiveActiveId, mergeExpandedIdsForActivePath, resolveTieredActiveState, resolveMenuLayoutState, resolveMenuNodeActionIntent, resolveExpandedIdsToggle, resolveMenuHintPosition, resolveHorizontalDockAlign, resolveTieredHoverPath, resolveTieredHoverIntent, resolveTieredClickState, resolveMenuSearchSelectionState, resolveTieredNodeClickIntent, resolveMegaMenuActiveNode, resolveMegaMenuInteraction, resolveMegaMenuHoverActiveId, resolveMenuAutocompleteItems, filterMenuNodes, collectMenuSearchEntries, flattenVisibleNodes, resolveMenuKeyboardAction, sgTreeFromJson, sgTreeFromJsonWithChecked
- **Navegação, overlay e wizard** (`navegacao-e-overlay/`): SgDockMenu, SgPopup, SgDialog, SgConfirmationDialog, SgWizard, SgWizardPage, resolveDockMenuOrientation, resolveDockMenuLiftDirection, buildDockMenuLayout, buildDockMenuItemMotion, buildDockMenuLabelStyle, buildDockMenuContainerStyle, buildDockMenuContextMenuState, buildDockMenuStorageKey, clampWizardStep, canNavigateToWizardStep, canProceedWizardAction
- **Gadgets (relógio, calendário, gauges, QR)** (`gadgets/`): SgCalendar, SgClock, SgTimeProvider, useSgTime, SgClockThemeProvider, useSgClockThemeResolver, createThemeResolver, registerTheme, registerThemes, getTheme, hasTheme, listThemes, unregisterTheme, clearThemes, resolveTheme, ThemeLayer, useDarkFlag, sgClockThemesBuiltIn, SgClockThemePicker, SgClockThemePreview, SgLinearGauge, SgRadialGauge, SgQRCode, SgStringAnimator, SG_STRING_ANIMATOR_DEFAULT_CHARSET, useSgTimeContext, filterClockThemes, resolveClockThemeSelection, themes/search.ts, gauge/math.ts, clampGaugeValue, valueToGaugeRatio
- **Dígitos animados** (`digits/`): SgDiscardDigit, SgFadeDigit, SgFlipDigit, SgMatrixDigit, SgNeonDigit, SgRoller3DDigit, SgSegmentDigit, SgSevenSegmentDigit
- **Providers (ambiente/persistência e realtime)** (`providers/`): SgEnvironmentProvider, useSgEnvironment, useSgNamespaceProvider, useSgPersistence, useSgPersistentState, useHasSgEnvironmentProvider, buildSgPersistenceKey, createLocalStorageStrategy, createApiPersistenceStrategy, createCompositePersistenceStrategy, readLocalPersistentState, writeLocalPersistentState, clearLocalPersistentState, resolvePersistedStateValue, SgRealtimeProvider, useSgRealtimeEvent, useSgRealtimeStatus, matchesSgRealtimeEvent
- **Fundamentos do @seedgrid/fe-components** (`fundamentos/`): masks.ts, validators.ts, blocked-email-domains.ts, rhf.ts, i18n/, injectStyles.ts, generated/compiledStyles.ts, ai-meta/
- **Pacotes de apoio** (`pacotes/`): @seedgrid/fe-theme, @seedgrid/fe-core, @seedgrid/fe-commons, @seedgrid/fe-playground
- **Módulos de tela @seedgrid/fe-*** (`modulos/`): @seedgrid/fe-apikeys, @seedgrid/fe-audit, @seedgrid/fe-backup, @seedgrid/fe-billing-platform, @seedgrid/fe-billing-user, @seedgrid/fe-login-tenancy, @seedgrid/fe-security, @seedgrid/fe-self-enter, @seedgrid/fe-subdomain-tenancy
- **Showcase** (`showcase/`): apps/showcase
