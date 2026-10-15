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

## Inputs de texto e documentos

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgInputText` | sim | Texto curto livre (nome, título, código) | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputTextArea` | sim | Texto longo multilinha, com mínimo de linhas e palavras | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputTextSearch` | sim | Caixa de busca com debounce (onSearchChange) | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputEmail` | sim | E-mail com validação de formato e bloqueio de domínios temporários | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputPassword` | sim | Senha com política configurável, barra de força, olho e gerador | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputPhone` | sim | Telefone BR com máscara (10 ou 11 dígitos) | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputCPF` | sim | CPF com máscara e dígito verificador | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputCNPJ` | sim | CNPJ numérico ou alfanumérico, com consulta pública opcional | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputCPFCNPJ` | sim | Campo único que aceita CPF ou CNPJ e detecta qual é | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputPostalCode` | sim | CEP/código postal de BR, PT, US, ES, UY, AR e PY, com ViaCEP opcional | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputDate` | sim | Data com o widget nativo (type="date") e limites min/max | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputBirthDate` | sim | Data de nascimento com idade mínima/máxima | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputNumber` | sim | Número decimal formatado pelo locale, com min/max | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputCurrency` | sim | Valor monetário com símbolo via Intl (padrão BRL) | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |
| `SgInputOTP` | sim | Código de uso único segmentado, com máscara (999999, ###-###) | [[SeedGrid/SeedGrid-components/inputs-texto/API\|API]] |

## Inputs de seleção e valores

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgAutocomplete` | sim | Busca em fonte grande ou remota, com sugestões enquanto o usuário digita (debounce, cache… | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgCombobox` | sim | Select de uma opção a partir de lista fixa ou carregada uma vez (type-ahead, agrupamento) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgCheckboxGroup` | sim | Poucas opções, várias escolhas, todas visíveis; "selecionar todos" | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgRadioGroup` | sim | Poucas opções, uma escolha, todas visíveis | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgMultiSelect` | sim | Várias escolhas em dropdown compacto (resumo "N selecionadas") | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgMultiSelectChips` | sim | Várias escolhas exibidas como chips removíveis | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgOrderList` | sim | Ordenar uma lista (prioridade, etapas) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgPickList` | sim | Transferir itens entre "disponíveis" e "selecionados" | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgPeriodSelector` | sim | Filtro de período relativo a hoje ("este mês", "últimos…", personalizado) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgYearPartSelector` | sim | Recorte absoluto do ano (semestre, trimestre ou bimestre de um ano X) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgToggleSwitch` | sim | Liga/desliga booleano | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgRating` | sim | Avaliação por estrelas (inteiras ou meias) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgSlider` | sim | Número em faixa contínua (range nativo) | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |
| `SgStepperInput` | sim | Número inteiro ou com passo, com botões +/− | [[SeedGrid/SeedGrid-components/inputs-selecao/API\|API]] |

## Tabela de dados

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgDatatable` | sim | O SgDatatable é a tabela de dados do pacote @seedgrid/fe-components (v2026.7.1) | [[SeedGrid/SeedGrid-components/datatable/API\|API]] |

## Editor de texto rico

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgTextEditor` | sim | O SgTextEditor é o editor de texto rico (HTML) do pacote @seedgrid/fe-components (v2026.7.1)… | [[SeedGrid/SeedGrid-components/editor/API\|API]] |

## Botões

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgButton` | sim | Botão de ação com severity, appearance (solid/outline/ghost), size, shape, elevation, ícones… | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `SgSplitButton` | sim | Ação principal + menu dropdown de ações secundárias (items) | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `SgFloatActionButton` | sim | FAB fixo/absoluto com ações secundárias (layouts linear, circle, semi-circle, quarter-circle)… | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `buildFabStorageKey` | sim | null sem dragId; senão sg-fab-pos:${dragId} | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `parseStoredFabDragPosition` | sim | Aceita string JSON ou objeto; retorna {x,y} só se ambos forem números finitos, senão null | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |

## Feedback e exibição

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgAvatar` | sim | Avatar com imagem, ícone, iniciais ou fallback; severidade, formato e tamanhos | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgAvatarGroup` | sim | Avatares sobrepostos com contador +N | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgBadge` | sim | Etiqueta/contador com severidade, variantes, ponto pulsante, ícones e remoção | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgBadgeOverlay` | sim | Posiciona um badge sobre outro elemento | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgSkeleton` | sim | Placeholder de carregamento (formas e animações wave/pulse) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgToaster` | sim | Pilha fixa de toasts disparados por toast(...) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgToastHost` | sim | Define onde os toasts aparecem; vários hosts → o último montado vence | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgWhistler` | sim | Lista de avisos no fluxo do layout, disparados por sgWhistle.* | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgWhistleHost` | sim | Define onde os whistles aparecem (mesma regra de prioridade) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgToasterHostContext` | não | Contexto booleano que faz o SgToaster interno do host pular a checagem de host | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `SgWhistlerHostContext` | não | Idem para whistles | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `dismissSgToast` | sim | sem id fecha todos; com id remove aquele | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `subscribeSgToasts` | sim | chama o listener imediatamente com o snapshot atual e a cada mudança; retorna a função de… | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `registerHost` | sim | empilha (ignora duplicado) e notifica | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `unregisterHost` | sim | remove e notifica | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `getActiveHostId` | sim | topo da pilha | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `hasAnyHost` | sim | pilha não vazia | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `subscribeHostRegistry` | sim | listener de mudanças; retorna cancelamento | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `nextHostId` | sim | sg-toast-host-<n> | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `dismissSgWhistle` | sim | sem id remove todos (chamando onClose de cada) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `subscribeSgWhistles` | sim | snapshot imediato + mudanças; retorna cancelamento | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `toast` | sim | API imperativa de toasts (src/commons/SgToast.ts) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |
| `sgWhistle` | sim | API imperativa de whistles (src/commons/SgWhistle.ts) | [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API\|API]] |

## Layout e containers

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgStack` | sim | Flex em linha/coluna com gap, justify, align, wrap, grow | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgGrid` | sim | Grade CSS com colunas por breakpoint ou minItemWidth (auto-fit); respeita span/rowSpan dos filhos | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgPanel` | sim | Painel com borda/scroll e docking de painéis filhos por align (top/left/right/bottom/client) | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgScreen` | sim | Raiz de tela (100% × 100dvh por padrão) com o mesmo docking de SgPanel | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgGroupBox` | sim | fieldset + legend para agrupar campos | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgCard` | sim | Card com cabeçalho/rodapé, clicável, colapsável e arrastável (posição persistida) | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgAccordion` | sim | Seções colapsáveis verticais ou horizontais, controladas ou não | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgPageControl` | sim | Abas com páginas declarativas; select nativo opcional no celular | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgPageControlPage` | sim | Declaração de uma página do SgPageControl | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgExpandablePanel` | sim | Painel expansível inline ou overlay (drawer) com resize, foco preso e Esc | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgCarousel` | sim | Carrossel com vários itens visíveis, circular, autoplay, navegadores e indicadores | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgBreadcrumb` | sim | Trilha de navegação com colapso de excedentes ou rolagem | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgMenu` | sim | Menu de navegação: sidebar, drawer, inline, híbrido; variantes painel, em camadas e mega menu… | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgTreeView` | sim | Árvore com busca, checkboxes em cascata, modo confirmação, trilhas extras e ref imperativa | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgDockLayout` | sim | Provedor de zonas de encaixe e do estado persistido das toolbars | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgDockZone` | sim | Zona nomeada (top/bottom/left/right/free) de um SgDockLayout | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgDockScreen` | sim | SgScreen + SgDockLayout com grade 3×3 pronta | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgToolBar` | sim | Barra de ferramentas colapsável, arrastável entre zonas ou livre | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `SgToolbarIconButton` | sim | Botão de toolbar com ícone, rótulo, hint (tooltip), severidade e loading automático para onClick… | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `useSgDockLayout` | não | Hook do contexto do dock (exportado só de SgDockLayout.tsx) | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `renderDockContent e helpers de sgDocking.tsx` | não | Motor de docking de SgPanel/SgScreen | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `parseStoredPanelDragPosition` | sim | Aceita objeto ou string JSON; retorna {x,y} se ambos forem números finitos | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `buildToolbarStorageKey` | sim | sg-toolbar-pos:<id> | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `buildDockMenuStorageKey` | sim | sg-dockmenu-pos:<dragId>:parent\|viewport; null sem dragId (usado pelo SgDockMenu — ver navegação e… | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveToolbarOrientationDirection` | sim | Função exportada de src/layout/toolbar-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveToolbarDockOrientationDirection` | sim | Função exportada de src/layout/toolbar-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `buildToolbarLayoutState` | sim | Função exportada de src/layout/toolbar-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `buildMenuMaps` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `collectParentChain` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `computeActiveSets` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveEffectiveActiveId` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `mergeExpandedIdsForActivePath` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveTieredActiveState` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuLayoutState` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuNodeActionIntent` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveExpandedIdsToggle` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuHintPosition` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveHorizontalDockAlign` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveTieredHoverPath` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveTieredHoverIntent` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveTieredClickState` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuSearchSelectionState` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveTieredNodeClickIntent` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMegaMenuActiveNode` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMegaMenuInteraction` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMegaMenuHoverActiveId` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuAutocompleteItems` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `filterMenuNodes` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `collectMenuSearchEntries` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `flattenVisibleNodes` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `resolveMenuKeyboardAction` | sim | Função exportada de src/layout/menu-logic.ts | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `sgTreeFromJson` | sim | converte JSON (ícone por chave do registro) | [[SeedGrid/SeedGrid-components/layout/API\|API]] |
| `sgTreeFromJsonWithChecked` | sim | idem e coleta checked: true, incluindo todos os descendentes de ramos marcados | [[SeedGrid/SeedGrid-components/layout/API\|API]] |

## Navegação, overlay e wizard

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgDockMenu` | sim | Dock flutuante de ações com ícones, badges, efeito magnify, 8 posições ancoradas e arraste com… | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `SgPopup` | sim | Overlay contextual ancorado a um elemento (anchorRef), com título, lista de ações e/ou conteúdo… | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `SgDialog` | sim | Modal com cabeçalho/corpo/rodapé, severidade, animação, auto-fechamento, foco inicial, focus trap… | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `SgConfirmationDialog` | sim | SgDialog especializado em confirmar/cancelar, com ícone por severidade e botões configuráveis | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `SgWizard` | sim | Fluxo em etapas com stepper opcional, validação automática dos inputs da etapa, guardas… | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `SgWizardPage` | sim | Etapa de um SgWizard (título/ícone usados no stepper) | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `resolveDockMenuOrientation` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `resolveDockMenuLiftDirection` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuLayout` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuItemMotion` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuLabelStyle` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuContainerStyle` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuContextMenuState` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `buildDockMenuStorageKey` | sim | Função exportada de src/menus/dock-menu-logic.ts | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `clampWizardStep` | sim | initialStep ?? 0 limitado a [0, max(pageCount - 1, 0)] | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `canNavigateToWizardStep` | sim | false fora do intervalo ou para a etapa atual; anterior permitida em previous/previous-and-next… | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |
| `canProceedWizardAction` | sim | Executa validateCurrentPage → validateStep(step) → beforeAction(step), parando no primeiro false | [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API\|API]] |

## Gadgets (relógio, calendário, gauges, QR)

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgCalendar` | sim | Calendário mensal (1–12 meses), seleção controlada/não controlada, limites e datas desabilitadas | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgClock` | sim | Relógio digital (9 estilos) ou analógico com temas SVG | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgTimeProvider` | sim | Hora sincronizada com o servidor (initialServerTime + performance.now()), tick por segundo | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `useSgTime` | sim | Hora sincronizada com o servidor (initialServerTime + performance.now()), tick por segundo | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgClockThemeProvider` | sim | Resolvedor de temas por contexto (temas locais + globais, modo strict/fallback) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `useSgClockThemeResolver` | sim | Resolvedor de temas por contexto (temas locais + globais, modo strict/fallback) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `createThemeResolver` | sim | Resolvedor de temas por contexto (temas locais + globais, modo strict/fallback) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `registerTheme` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `registerThemes` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `getTheme` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `hasTheme` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `listThemes` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `unregisterTheme` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `clearThemes` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `resolveTheme` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `ThemeLayer` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `useDarkFlag` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `sgClockThemesBuiltIn` | sim | Registro global e renderização de temas do relógio | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgClockThemePicker` | sim | Seletor de tema com preview e busca | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgClockThemePreview` | sim | Miniatura SVG de um tema | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgLinearGauge` | sim | Medidor linear com faixas e ponteiros arrastáveis | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgRadialGauge` | sim | Medidor radial (needle/marker/range), anotações e conteúdo central | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgQRCode` | sim | QR Code SVG com logo central e fallback | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SgStringAnimator` | sim | Anima texto de origem → destino caractere a caractere com dígitos animados | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `SG_STRING_ANIMATOR_DEFAULT_CHARSET` | sim | Anima texto de origem → destino caractere a caractere com dígitos animados | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `useSgTimeContext` | não | Contexto bruto do SgTimeProvider (null sem provider), usado por SgClock | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `filterClockThemes` | não | Busca/seleção do picker (testados em clock-theme-picker.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `resolveClockThemeSelection` | não | Busca/seleção do picker (testados em clock-theme-picker.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `themes/search.ts` | não | Busca/seleção do picker (testados em clock-theme-picker.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `gauge/math.ts` | não | Matemática dos medidores (testada em gauge-math.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `clampGaugeValue` | não | Matemática dos medidores (testada em gauge-math.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |
| `valueToGaugeRatio` | não | Matemática dos medidores (testada em gauge-math.test.mjs) | [[SeedGrid/SeedGrid-components/gadgets/API\|API]] |

## Dígitos animados

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgDiscardDigit` | sim | Pilha de folhas; a do topo é descartada/chega ao trocar o valor; paginação imperativa via ref | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgFadeDigit` | sim | Card com fade-out/fade-in (200 ms fixos) | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgFlipDigit` | sim | Card flip via @pqina/flip (import dinâmico, SSR-safe) | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgMatrixDigit` | sim | Texto em matriz de pontos 5×7 (LED) | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgNeonDigit` | sim | Texto com brilho neon e troca animada | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgRoller3DDigit` | sim | Tambor vertical que rola até value dentro de items | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgSegmentDigit` | sim | Segmentos SVG compactos com currentColor; suporta  | [[SeedGrid/SeedGrid-components/digits/API\|API]] |
| `SgSevenSegmentDigit` | sim | Display LED de 7 segmentos com paletas, glow e skew; hexadecimal 0-F | [[SeedGrid/SeedGrid-components/digits/API\|API]] |

## Providers (ambiente/persistência e realtime)

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgEnvironmentProvider` | sim | Fornece namespace, estratégia e configuração de persistência | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgEnvironment` | sim | Lê o ambiente (ou o padrão, sem provider) | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgNamespaceProvider` | sim | Atalho para useSgEnvironment().namespaceProvider | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgPersistence` | sim | load/save/clear com chave isolada por namespace e escopo | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgPersistentState` | sim | "useState persistido" com hidratação assíncrona | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useHasSgEnvironmentProvider` | não | Diz se há provider; usado por FAB, Card, Menu, ToolBar, DockMenu | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `buildSgPersistenceKey` | sim | Monta a chave sg:<namespace>[:<scope>]:<baseKey> | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `createLocalStorageStrategy` | sim | Estratégia sobre window.localStorage | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `createApiPersistenceStrategy` | sim | Estratégia REST (GET/POST/DELETE {baseUrl}/sg/persistence) | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `createCompositePersistenceStrategy` | sim | Combina primária + secundária (strict/fallback/mirror) | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `readLocalPersistentState` | sim | Helpers puros de estado persistido em Storage | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `writeLocalPersistentState` | sim | Helpers puros de estado persistido em Storage | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `clearLocalPersistentState` | sim | Helpers puros de estado persistido em Storage | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `resolvePersistedStateValue` | sim | Helpers puros de estado persistido em Storage | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `SgRealtimeProvider` | sim | Conexão ao Pulse e distribuição de avisos | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgRealtimeEvent` | sim | Registra handler por channel + padrão de evento | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `useSgRealtimeStatus` | sim | { status, connected } para decidir aviso × polling | [[SeedGrid/SeedGrid-components/providers/API\|API]] |
| `matchesSgRealtimeEvent` | sim | Casa nome exato, prefixo.* ou * | [[SeedGrid/SeedGrid-components/providers/API\|API]] |

## Fundamentos do @seedgrid/fe-components

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `masks.ts` | sim | Máscaras de CPF, CNPJ (inclusive alfanumérico), CPF/CNPJ, CEP e códigos postais… | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `validators.ts` | sim | Validação CPF, CNPJ (alfanumérico), e-mail, domínios de e-mail descartáveis, senha (política)… | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `blocked-email-domains.ts` | sim | Lista padrão de 37 domínios descartáveis | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `rhf.ts` | não | Tipo RhfFieldProps e helpers resolveFieldError, mergeRequiredRule, usados internamente pelos inputs | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `i18n/` | sim | Provider, hooks, t, catálogos pt-BR, pt-PT, en-US, es, fr (214 chaves components.* cada) | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `injectStyles.ts` | não | Injeção do CSS compilado no <head> | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `generated/compiledStyles.ts` | não | Constante SEEDGRID_COMPILED_CSS (auto-gerada, ~67 KB) | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |
| `ai-meta/` | não | Tipos SgMetaV0/SgAiHintsV0 dos *.meta.ts e generated-props.json; alimentam o manifesto de IA | [[SeedGrid/SeedGrid-components/fundamentos/API\|API]] |

## Pacotes de apoio

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `@seedgrid/fe-theme` | sim | Tema por cor seed, tokens --sg-*, SeedThemeProvider | [[SeedGrid/SeedGrid-components/pacotes/fe-theme\|fe-theme]] |
| `@seedgrid/fe-core` | sim | Manifesto de módulo da CLI, registry, persistência, createApiClient, erros | [[SeedGrid/SeedGrid-components/pacotes/fe-core\|fe-core]] |
| `@seedgrid/fe-commons` | sim | createHttpClient, buscarCep, buscarCnpj | [[SeedGrid/SeedGrid-components/pacotes/fe-commons\|fe-commons]] |
| `@seedgrid/fe-playground` | sim | SgPlayground (Sandpack) | [[SeedGrid/SeedGrid-components/pacotes/fe-playground\|fe-playground]] |

## Módulos de tela @seedgrid/fe-*

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `@seedgrid/fe-apikeys` | sim | Gestão de chaves de integração criadas por role, com o segredo exibido uma única vez na criação | [[SeedGrid/SeedGrid-components/modulos/fe-apikeys\|fe-apikeys]] |
| `@seedgrid/fe-audit` | sim | Consulta somente-leitura do trilho de auditoria (audit log) com filtros e detalhe antes/depois | [[SeedGrid/SeedGrid-components/modulos/fe-audit\|fe-audit]] |
| `@seedgrid/fe-backup` | sim | Cria jobs de export, acompanha o status com polling, baixa o ZIP gerado e remove jobs | [[SeedGrid/SeedGrid-components/modulos/fe-backup\|fe-backup]] |
| `@seedgrid/fe-billing-platform` | sim | CRUD de planos, faixas de preço (terms) com publicação/arquivamento e configuração do trial | [[SeedGrid/SeedGrid-components/modulos/fe-billing-platform\|fe-billing-platform]] |
| `@seedgrid/fe-billing-user` | sim | Assinatura corrente, uso do ciclo, checkout (1ª assinatura), troca de plano com prévia de rateio… | [[SeedGrid/SeedGrid-components/modulos/fe-billing-user\|fe-billing-user]] |
| `@seedgrid/fe-login-tenancy` | sim | URL única, o usuário escolhe a empresa após o login e o backend re-emite o par de tokens escopado… | [[SeedGrid/SeedGrid-components/modulos/fe-login-tenancy\|fe-login-tenancy]] |
| `@seedgrid/fe-security` | sim | Módulo-base de segurança do front SeedGrid (Next.js): sessão server-side com cookies httpOnly… | [[SeedGrid/SeedGrid-components/modulos/fe-security\|fe-security]] |
| `@seedgrid/fe-self-enter` | sim | Pedido público de acesso (nome/e-mail/senha) com confirmação de e-mail, convites de administrador… | [[SeedGrid/SeedGrid-components/modulos/fe-self-enter\|fe-self-enter]] |
| `@seedgrid/fe-subdomain-tenancy` | sim | Cada tenant vive em empresa.<sufixo>, com signup público que cria tenant + usuário root e… | [[SeedGrid/SeedGrid-components/modulos/fe-subdomain-tenancy\|fe-subdomain-tenancy]] |

## Showcase

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `apps/showcase` | não | App Next.js que demonstra todos os componentes do @seedgrid/fe-components (páginas com exemplos… | [[SeedGrid/SeedGrid-components/showcase\|showcase]] |
