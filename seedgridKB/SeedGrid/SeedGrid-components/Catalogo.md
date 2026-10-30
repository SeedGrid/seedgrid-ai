---
tags: [seedgrid, component, catalogo]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components
branch: main
commit: ad30fc11de
fonte-flutter: front/seedgrid-fe-flutter
commit-flutter: e9989b8
analisado-em: 2026-10-30
gerado-por: scripts/kb-catalogs.mjs --only catalogo
---

# Catálogo dos componentes SeedGrid (resumo de cada símbolo, React e Flutter)

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

## Inputs de texto e documentos — React

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

## Inputs de seleção e valores — React

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

## Tabela de dados — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgDatatable` | sim | O SgDatatable é a tabela de dados do pacote @seedgrid/fe-components (v2026.7.1) | [[SeedGrid/SeedGrid-components/datatable/API\|API]] |

## Editor de texto rico — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgTextEditor` | sim | O SgTextEditor é o editor de texto rico (HTML) do pacote @seedgrid/fe-components (v2026.7.1)… | [[SeedGrid/SeedGrid-components/editor/API\|API]] |

## Botões — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `SgButton` | sim | Botão de ação com severity, appearance (solid/outline/ghost), size, shape, elevation, ícones… | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `SgSplitButton` | sim | Ação principal + menu dropdown de ações secundárias (items) | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `SgFloatActionButton` | sim | FAB fixo/absoluto com ações secundárias (layouts linear, circle, semi-circle, quarter-circle)… | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `buildFabStorageKey` | sim | null sem dragId; senão sg-fab-pos:${dragId} | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |
| `parseStoredFabDragPosition` | sim | Aceita string JSON ou objeto; retorna {x,y} só se ambos forem números finitos, senão null | [[SeedGrid/SeedGrid-components/buttons/API\|API]] |

## Feedback e exibição — React

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

## Layout e containers — React

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

## Navegação, overlay e wizard — React

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

## Gadgets (relógio, calendário, gauges, QR) — React

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

## Dígitos animados — React

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

## Providers (ambiente/persistência e realtime) — React

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

## Fundamentos do @seedgrid/fe-components — React

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

## Pacotes de apoio — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `@seedgrid/fe-theme` | sim | Tema por cor seed, tokens --sg-*, SeedThemeProvider | [[SeedGrid/SeedGrid-components/pacotes/fe-theme\|fe-theme]] |
| `@seedgrid/fe-core` | sim | Manifesto de módulo da CLI, registry, persistência, createApiClient, erros | [[SeedGrid/SeedGrid-components/pacotes/fe-core\|fe-core]] |
| `@seedgrid/fe-commons` | sim | createHttpClient, buscarCep, buscarCnpj | [[SeedGrid/SeedGrid-components/pacotes/fe-commons\|fe-commons]] |
| `@seedgrid/fe-playground` | sim | SgPlayground (Sandpack) | [[SeedGrid/SeedGrid-components/pacotes/fe-playground\|fe-playground]] |

## Módulos de tela @seedgrid/fe-* — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `Composição do front e do admin (adicionar e remover módulos)` | sim | Os módulos @seedgrid/fe-* são copiados para o app pela CLI SeedGrid ("scaffold", modelo shadcn): a… | [[SeedGrid/SeedGrid-components/modulos/Composicao-do-admin\|Composicao-do-admin]] |
| `@seedgrid/fe-apikeys` | sim | Gestão de chaves de integração criadas por role, com o segredo exibido uma única vez na criação | [[SeedGrid/SeedGrid-components/modulos/fe-apikeys\|fe-apikeys]] |
| `@seedgrid/fe-audit` | sim | Consulta somente-leitura do trilho de auditoria (audit log) com filtros e detalhe antes/depois | [[SeedGrid/SeedGrid-components/modulos/fe-audit\|fe-audit]] |
| `@seedgrid/fe-backup` | sim | Cria jobs de export, acompanha o status com polling, baixa o ZIP gerado e remove jobs | [[SeedGrid/SeedGrid-components/modulos/fe-backup\|fe-backup]] |
| `@seedgrid/fe-billing-platform` | sim | CRUD de planos, faixas de preço (terms) com publicação/arquivamento e configuração do trial | [[SeedGrid/SeedGrid-components/modulos/fe-billing-platform\|fe-billing-platform]] |
| `@seedgrid/fe-billing-user` | sim | Assinatura corrente, uso do ciclo, checkout (1ª assinatura), troca de plano com prévia de rateio… | [[SeedGrid/SeedGrid-components/modulos/fe-billing-user\|fe-billing-user]] |
| `@seedgrid/fe-login-tenancy` | sim | URL única, o usuário escolhe a empresa após o login e o backend re-emite o par de tokens escopado… | [[SeedGrid/SeedGrid-components/modulos/fe-login-tenancy\|fe-login-tenancy]] |
| `@seedgrid/fe-security` | sim | Módulo-base de segurança do front SeedGrid (Next.js): sessão server-side com cookies httpOnly… | [[SeedGrid/SeedGrid-components/modulos/fe-security\|fe-security]] |
| `@seedgrid/fe-self-enter` | sim | Pedido público de acesso (nome/e-mail/senha) com confirmação de e-mail, convites de administrador… | [[SeedGrid/SeedGrid-components/modulos/fe-self-enter\|fe-self-enter]] |
| `@seedgrid/fe-subdomain-tenancy` | sim | Cada tenant vive em empresa.<sufixo>, com signup público que cria tenant + usuário root e… | [[SeedGrid/SeedGrid-components/modulos/fe-subdomain-tenancy\|fe-subdomain-tenancy]] |

## Showcase — React

| Nome | Exportado | Resumo | Nota |
|---|---|---|---|
| `apps/showcase` | não | App Next.js que demonstra todos os componentes do @seedgrid/fe-components (páginas com exemplos… | [[SeedGrid/SeedGrid-components/showcase\|showcase]] |

## Inputs de texto e documentos — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgInputText` | portado | Campo de texto de uso geral; base de quase todos os outros | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputTextArea` | portado | Texto longo em várias linhas, com limites de caracteres, palavras e linhas | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputTextSearch` | portado | Campo de busca que dispara onSearchChange depois de um debounce | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputEmail` | portado | E-mail com validação de formato e bloqueio de domínios descartáveis | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputPassword` | portado | Senha com política configurável, barra de força, olho e gerador | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputPhone` | portado | Telefone brasileiro (10 ou 11 dígitos) com máscara e remoção do DDI | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputCPF` | portado | CPF com máscara e validação dos dígitos verificadores | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputCNPJ` | portado | CNPJ numérico ou alfanumérico, com consulta pública opcional | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputCPFCNPJ` | portado | Campo único que aceita CPF ou CNPJ e detecta qual foi digitado | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputPostalCode` | portado | CEP e códigos postais de 7 países, com consulta opcional ao ViaCEP | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputDate` | portado | Data em texto com máscara e calendário próprio; valor ISO | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputBirthDate` | portado | Data de nascimento com idade mínima e máxima | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputNumber` | portado | Número decimal formatado pelo idioma, com limites mínimo e máximo | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputCurrency` | portado | Valor monetário com símbolo, moeda e separadores do idioma | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputOTP` | portado | Código de uso único em slots, com máscara, colagem e controller | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgMaskFormatter` | sim | Aplica [mask] a cada edicao e posiciona o cursor depois do mesmo trecho significativo… | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgPhoneStripDdi` | sim | Telefone brasileiro com DDI (+55 11 98765-4321, 5511987654321): tira o 55 | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgViaCepResult` | sim | Resposta do ViaCEP (o ViaCepResponse do React, com erro) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgIso` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgParseIso` | sim | Data ISO yyyy-MM-dd -> DateTime (dia, sem hora); null se invalida ou inexistente (ex.: 2026-02-31) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `showSgDatePicker` | sim | Abre o calendario e devolve a data escolhida (yyyy-MM-dd) ou null se cancelado | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgDatePickerDialog` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgToDateValue` | sim | toDateValue do React: String passa como esta; DateTime vira a data ISO em UTC | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgFormatDateDisplay` | sim | formatDateDisplay do React (usado nas mensagens de intervalo): ISO em en-US, dd/MM/yyyy nos demais | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgDisplayDate` | sim | Texto do campo para uma data ISO (dd/MM/yyyy; MM/dd/yyyy em en-US). '' se invalida | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgDateMask` | sim | Máscara de data: só dígitos, no máximo 8, com barras | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgIsoFromDisplay` | sim | Texto -> ISO. '' se incompleto ou data inexistente (como o valor do <input type="date">) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `sgNormalizeDateValue` | sim | Valor recebido de fora (setValue, value, valor inicial) -> data ISO yyyy-MM-dd; '' se nao for uma… | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgNumberSeparators` | sim | Separadores usados pelo SgInputNumber (React: getSeparators) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgCurrencyMeta` | sim | Metadados da moeda (React: CurrencyMeta) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `resolveNumberLocale` | sim | Acha o locale da tabela: troca _ por -, tenta exato, depois pelo idioma, senao en-US | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `numberSeparators` | sim | Equivale a getSeparators(locale) do React, INCLUINDO a esquisitice dele: em es e pt-PT o ICU nao… | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `resolveCurrencyMeta` | sim | Equivale a resolveCurrencyMeta do React. [currency] ja em maiusculas | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgNumberState` | sim | Estado digitado: sinal, parte inteira, parte decimal e se o separador decimal ja foi digitado | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `OtpSlotKind` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `OtpMask` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `parseOtpMask` | sim | Mascara vazia ou sem nenhum slot cai em 999999 (igual ao React) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `textToSlotValues` | sim | Distribui [text] nos slots, pulando caracteres que o slot da vez nao aceita | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `slotValuesToRaw` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `slotValuesToMasked` | sim | Valor com separadores: so escreve separador entre slots ja preenchidos (nunca no inicio nem no fim) | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `SgInputOTPController` | sim | Equivale ao SgInputOTPRef do React | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |
| `kSgWidgetMaxDate` | sim | Teto de ano de 4 dígitos do campo (o WIDGET_MAX_DATE do React); só vale para o calendário | [[SeedGrid/SeedGrid-components/flutter/inputs-texto/API\|API]] |

## Inputs de seleção e valores — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgAutocomplete` | portado | Texto com sugestões de uma fonte local ou assíncrona, com debounce e cache; devolve o texto | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgCombobox` | portado | Lista de escolha única com type-ahead; devolve o id do item (fonte local ou assíncrona) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgCheckboxGroup` | portado | Grupo de caixas de marcação para escolha múltipla, com a opção "marcar todos" | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgRadioGroup` | portado | Grupo de botões de rádio para escolha única, na vertical ou na horizontal | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgMultiSelect` | portado | Seleção múltipla em lista suspensa com busca opcional; mostra rótulos ou um resumo | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgMultiSelectChips` | portado | Seleção múltipla em lista suspensa; os itens escolhidos viram chips removíveis no campo | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgOrderList` | portado | Lista cujos itens o usuário reordena por botões, atalhos de teclado ou arrastando | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickList` | portado | Duas listas (origem e destino) para transferir itens, com filtro e reordenação | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPeriodSelector` | portado | Período pré-definido (este mês, último trimestre...) ou personalizado, resolvido em datas | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgYearPartSelector` | portado | Ano + recorte (semestre, trimestre, bimestre) + fatia, resolvidos em datas | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgToggleSwitch` | portado | Interruptor liga/desliga com rótulo, descrição e validação | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgRating` | portado | Avaliação por estrelas (inteira ou meia), com botão de zerar e teclado | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgSlider` | portado | Controle deslizante numérico entre um mínimo e um máximo, com passo | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgStepperInput` | portado | Campo numérico com botões e setas para aumentar ou diminuir dentro de um intervalo | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgChoiceGroupBoxProps` | sim | groupBoxProps do React: o que se pode repassar ao SgGroupBox (titulo, largura e altura) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgCheckboxGroupOption` | sim | Opcao do grupo (SgCheckboxGroupOption). value e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgCheckboxGroupController` | sim | Equivale a SgCheckboxGroupRef do React (getChecked/setChecked/checkAll/clearAll) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgRadioGroupOption` | sim | Opcao do grupo (SgRadioGroupOption). value e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgSwitch` | sim | Alias, como SgSwitch no React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `ChoiceKind` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `ChoiceTile` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgListGroupBoxProps` | sim | groupBoxProps do React: o que se pode repassar ao SgGroupBox (titulo, largura e altura) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgOrderListItem` | sim | Item da lista (SgOrderListItem). value e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgOrderListItemState` | sim | Segundo argumento do itemTemplate | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgOrderListController` | sim | Equivale a SgOrderListRef do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListItem` | sim | Item da lista (SgPickListItem). value e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListListName` | sim | SgPickListListName | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListChangeType` | sim | SgPickListChangeType: o texto de [value] e o do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListValue` | sim | SgPickListValue: as duas listas | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListChangeEvent` | sim | SgPickListChangeEvent: o valor novo mais o tipo da mudanca | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListItemState` | sim | Segundo argumento do itemTemplate | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgPickListController` | sim | Equivale a SgPickListRef do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgMultiSelectOptionValue` | sim | string \| number do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgMultiSelectOption` | sim | Uma opcao (SgMultiSelectOption do React) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `PeriodPreset` | sim | PeriodPreset do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `ResolvedPeriod` | sim | ResolvedPeriod do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `ResolvePeriodOptions` | sim | ResolvePeriodOptions do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `periodPresetLabel` | sim | Rotulo do preset no locale pedido (ASCII sem acentos, como no React) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `resolvePeriod` | sim | Resolve um preset temporal para um intervalo real de datas | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `buildPeriodOptions` | sim | Opcoes do combo a partir dos flags permit* | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `parseIsoDate` | sim | Converte o valor ISO yyyy-MM-dd do campo de data em DateTime local | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `YearPartKind` | sim | YearPartKind do React | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `YearPartValue` | sim | YearPartValue do React: ano, recorte e fatia (base 1) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `ResolvedYearPart` | sim | ResolvedYearPart do React: espelha ResolvedPeriod, mas as datas nunca sao nulas | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `pickLocaleLabel` | sim | pickLocale do React: o locale pedido, senao pt-BR, senao o primeiro | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartCount` | sim | Quantas fatias cabem no ano para este recorte | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartMonths` | sim | Quantos meses tem cada fatia deste recorte: 6, 3 ou 2 | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartKindLabel` | sim | Nome do recorte no locale pedido ("Trimestre", "Quarter") | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartLabel` | sim | Rotulo de uma fatia: "Trimestre 1 (Q1)", "Semestre 2 (S2)", "Bimestre 3" | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `YearPartOption` | sim | Opcao do combo da fatia | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartOptions` | sim | Opcoes prontas para o combo da fatia, ja no locale pedido | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `isValidYearPart` | sim | A fatia existe neste recorte? | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `clampYearPart` | sim | Ao trocar o recorte, mantem a fatia quando couber e cai na primeira quando nao couber | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `resolveYearPart` | sim | Resolve o recorte para o intervalo fechado de datas (fim em 23:59:59.999) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `yearPartOf` | sim | Em que fatia do recorte esta data cai | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgAutocompleteItem` | sim | SgAutocompleteItem do React. id e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgAutocompleteSource` | sim | SgAutocompleteSource do React: devolve a lista (ou um Future dela) para o texto digitado | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `sgDefaultMapItem` | sim | Mapeamento padrao do SgCombobox (defaultMapItem do React): texto/numero viram id=label; mapas usam… | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `sgIdEquals` | sim | idEquals do React: compara como texto; nulo nunca e igual | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgSelectItemBuilder` | sim | — | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgSelectList` | sim | Lista de opcoes: carregando, vazio, plana ou agrupada, com item ativo, tooltip e rolagem ate o ativo | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgSelectOverlay` | sim | Superficie da lista: ancorada ao campo (larga) ou painel de baixo acima do teclado (estreita) | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `sgSelectNarrow` | sim | A lista cabe como painel de baixo? | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `sgDropdownMaxWidth` | sim | maxWidth: min(32rem, 100vw - 24px) do React: largura maxima do popup ancorado | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |
| `SgDropdownHost` | sim | Envolve o campo ([field]) e mostra a lista quando [open] e verdadeiro. - Largo: [popup] fica… | [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API\|API]] |

## Tabela de dados — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgDatatable` | portado | Tabela com paginação, ordenação, filtros, seleção e gerenciador de colunas | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableController` | sim | Equivale a SgDatatableRef do React | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableRow` | sim | SgDatatableRow | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableSortOrder` | sim | SgDatatableSortOrder: 1 (crescente), -1 (decrescente) ou 0 (sem ordem) | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableSelection` | sim | SgDatatableSelection<T>: T \| T[] \| null | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableFilterMatchMode` | sim | SgDatatableFilterMatchMode | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableColumnAlign` | sim | SgDatatableColumnAlign | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableSortEvent` | sim | SgDatatableSortEvent | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatablePageEvent` | sim | SgDatatablePageEvent | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableFilterEvent` | sim | SgDatatableFilterEvent | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableCellMeta` | sim | SgDatatableCellMeta<T>: segundo argumento de body | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |
| `SgDatatableColumn` | sim | SgDatatableColumn<T>. className, headerClassName e bodyClassName do React nao existem (ADR 50, sem… | [[SeedGrid/SeedGrid-components/flutter/datatable/API\|API]] |

## Editor de texto rico — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgTextEditor` | portado | Editor de texto rico com barra, HTML do corpo, CSS opcional, salvar e carregar | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `SgTextEditorFile` | sim | Arquivo gerado por onSave (equivale ao File do navegador) | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `SgTextEditorSaveMeta` | sim | SgTextEditorSaveMeta do React | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `SgTextEditorHtmlFilePicker` | sim | Seletor de arquivo HTML (devolve nulo se o usuario cancelar) | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `sgIsAllowedLinkUri` | sim | isAllowedUri do TipTap Link: relativo ou protocolo permitido | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `sgCssColorToHex` | sim | Cor CSS -> #rrggbb (ou nulo) | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `sgCssColorToQuill` | sim | Cor CSS -> valor de cor do Delta: #rrggbb quando opaca e rgba(r, g, b, a) quando tem transparencia… | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |
| `SgTextEditorHtml` | sim | Conversao entre o HTML do SgTextEditor (corpo, como editor.getHTML()) e Delta | [[SeedGrid/SeedGrid-components/flutter/editor/API\|API]] |

## Botões — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgButton` | portado | Botão de ação com severidade, aparência, tamanho, formato, ícones e carregamento | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgSplitButton` | portado | Ação principal com menu de ações secundárias acoplado | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgFloatActionButton` | portado | Botão flutuante com speed-dial, dica, arrastar e auto-ocultar ao rolar | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgButtonType` | sim | type do <button> do HTML. submit dentro de um [SgForm] aciona o envio do formulario (os callbacks… | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgButtonCustomColors` | sim | Cores customizadas do botao (SgButtonCustomColors do React) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgButtonColors` | sim | Cores ja resolvidas (equivale a resolveButtonColors do React) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `resolveButtonColors` | sim | — | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgFABAction` | sim | Uma acao secundaria do speed-dial (SgFABAction do React) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgFABOffset` | sim | offset do React ({ x?: number; y?: number }) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `buildFabStorageKey` | sim | Porte de buildFabStorageKey (fab-helpers.ts) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `parseStoredFabDragPosition` | sim | Porte de parseStoredFabDragPosition (fab-helpers.ts): aceita texto JSON ou objeto com x e y… | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `computeFabItemPositions` | sim | Porte de computeItemPositions: deslocamento (x, y) de cada acao em relacao ao centro do botao | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |
| `SgSplitButtonItem` | sim | Item do menu (SgSplitButtonItem do React) | [[SeedGrid/SeedGrid-components/flutter/buttons/API\|API]] |

## Feedback e exibição — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgAvatar` | portado | Avatar com imagem, ícone, iniciais ou fallback, com severidade, forma e tamanho | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgAvatarGroup` | portado | Avatares sobrepostos com limite visível e contador de quem ficou de fora | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgBadge` | portado | Etiqueta ou contador com severidade, ponto pulsante, ícones, clique e remoção | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgBadgeOverlay` | portado | Posiciona um selo (badge) sobre um canto ou lado de outro widget | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgSkeleton` | portado | Placeholder de carregamento com formas e animação de onda ou pulso | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToaster` | portado | Pilha de toasts disparados por toast(...), com posição, duração e cores | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastHost` | portado | Define onde os toasts aparecem; com vários hosts, vale o último montado | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistler` | portado | Lista de avisos no fluxo do layout, disparados por sgWhistle.* | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleHost` | portado | Define onde os whistles aparecem; com vários hosts, vale o último montado | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgAvatarCustomColors` | sim | Cores customizadas do avatar | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `normalizeAvatarLabel` | sim | normalizeLabel do React: até 2 letras = maiúsculas; 2+ palavras = iniciais das 2 primeiras; senão… | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgBadgeCustomColors / SgBadgeColors / resolveBadgeColors` | sim | Cores customizadas e cores resolvidas do badge | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgCssSize` | sim | Dimensão do React já interpretada (pixels ou fração do espaço disponível) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `toast` | sim | API imperativa de toasts (toast do React) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastType` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastOptions` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastAction` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastRecord` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastPromiseMessages` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastId` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToastListener` | sim | Tipos do toast (default é defaultValue) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `dismissSgToast` | sim | Remove um toast (ou todos) e assina as mudanças | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `subscribeSgToasts` | sim | Remove um toast (ou todos) e assina as mudanças | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `sgToNode` | sim | Converte String (ou qualquer valor) em Widget; Widget passa direto; null vira null | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToasterTypeColors` | sim | Cores por tipo de toast | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgToasterCustomColors` | sim | Cores por tipo de toast | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `sgWhistle` | sim | API imperativa de whistles (sgWhistle do React) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleSeverity` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleBorderStyle` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleAction` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleOptions` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleCustomOptions` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleRecord` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistlePromiseStates` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleId` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleListener` | sim | Tipos do whistle (message é obrigatório em SgWhistleOptions) | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `dismissSgWhistle` | sim | Remove um whistle (chama o onClose) e assina as mudanças | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `subscribeSgWhistles` | sim | Remove um whistle (chama o onClose) e assina as mudanças | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `SgWhistleColors` | sim | Cores por severidade de whistle | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |
| `resolveWhistleColors` | sim | Cores por severidade de whistle | [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/API\|API]] |

## Layout e containers — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgStack` | portado | Empilha filhos em linha ou coluna, com espaçamento, alinhamento e quebra de linha | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgGrid` | portado | Grade responsiva de colunas por breakpoint, com spans de linha e coluna via SgPanel | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgPanel` | portado | Contêiner com borda, ancoragem de painéis por align, rolagem e fluxo flex do conteúdo | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgScreen` | portado | Raiz de tela cheia (largura do pai, altura da janela) com ancoragem de painéis | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgGroupBox` | portado | Agrupa campos relacionados numa caixa com legenda sobre a borda | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCard` | portado | Cartão com cabeçalho, descrição, rodapé, recolher e arraste com posição salva | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgAccordion` | portado | Seções expansíveis na vertical ou horizontal, com um ou vários itens abertos | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgPageControl` | portado | Abas para alternar páginas na mesma área, com navegação por teclado | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgPageControlPage` | portado | Declara uma aba (título, dica, ícone e conteúdo) dentro de um SgPageControl | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgExpandablePanel` | portado | Painel que expande numa direção, em linha ou como gaveta sobre a tela | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCarousel` | portado | Carrossel de itens com autoplay, indicadores, navegadores e gesto de deslizar | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgBreadcrumb` | portado | Trilha de navegação com colapso de itens, separadores e ícone de início | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenu` | portado | Menu de navegação em árvore, cascata ou mega, com busca, recolher e gaveta | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeView` | portado | Árvore de dados com busca, caixas de seleção, colunas extras e controller | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockLayout` | portado | Contexto das toolbars encaixáveis: zonas, ordem, recolhimento e persistência | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockZone` | portado | Região nomeada (top, bottom, left, right, free) onde as toolbars se encaixam | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockScreen` | portado | Tela com SgDockLayout e grade de zonas pronta (SgScreen mais dock) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgToolBar` | portado | Barra de ferramentas recolhível, arrastável e encaixável em zonas | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgToolbarIconButton` | portado | Botão compacto de toolbar com ícone, rótulo, dica, carregamento e severidade | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgSpace` | sim | number \| string do React -> logical pixels. null quando nao ha valor ou a unidade nao e suportada.… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgPercent` | sim | SgDockPercent do React (number \| "N%", ambos significam porcentagem) -> N. null se invalido | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgSize` | sim | Largura/altura estilo toCssSize: numero = px, 'N%' = fracao do espaco disponivel… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgGridColumnsFor` | sim | Equivale a normalizeColumns: columns e um inteiro ou {base, sm, md, lg, xl, 2xl} | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgGridCell` | sim | Posicao de um item na grade (resultado da colocacao automatica do CSS grid) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgGridPlace` | sim | Colocacao automatica do CSS grid (grid-auto-flow: row ou dense). [spans] = (colunas, linhas) por… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgAccordionItem` | sim | Item do acordeao (SgAccordionItem do React) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgBreadcrumbSeparator` | sim | Separadores prontos do React ("slash" \| "chevron" \| "dot" \| "arrow") | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgBreadcrumbItem` | sim | Item do breadcrumb (SgBreadcrumbItem do React) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCardPosition` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCardPositionStore` | sim | Posicoes salvas por chave (dragPersistKey, ou sg-card-pos:<id>) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCarouselNavigators` | sim | customNavigators do React: botoes proprios de anterior/proximo | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgExpandablePanelAnimationType` | sim | animation.type do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgExpandablePanelAnimation` | sim | animation do React: tipo (slide por padrao) e duracao em ms (180 por padrao) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgExpandablePanelSize` | sim | size do React: min, max e default (defaultSize, porque default e palavra reservada em Dart) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgPageControlContext` | sim | Contexto passado aos callbacks de troca de pagina ({ index, page } / { pageId, page } no React) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockOrientation` | sim | SgDockToolbarState["orientation"] | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockToolbarState` | sim | SgDockToolbarState do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockLayoutState` | sim | SgDockLayoutState do React (version: 1) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockDropIndicator` | sim | Onde e como soltar uma toolbar (SgDockDropIndicator) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockLayoutStore` | sim | Persistencia do estado do layout | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockLayoutController` | sim | Estado e coordenacao do SgDockLayout (equivale ao DockContextValue do React) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `useSgDockLayout` | sim | useSgDockLayout do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `t_` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockAlign` | sim | SgDockAlign do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockContentDirection` | sim | SgDockContentDirection do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockContentJustify` | sim | SgDockContentJustify do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockContentAlign` | sim | SgDockContentAlign do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `getDefaultContentDirection` | sim | getDefaultContentDirection | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `getDefaultContentAlign` | sim | getDefaultContentAlign | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `getDefaultContentGap` | sim | getDefaultContentGap | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `toSpacePx` | sim | toCssSpace em pixels logicos: numero = px; texto aceita 12, 12px, 1rem e 1em (16 px) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockSize` | sim | Medida de encaixe: numero ou 'N%' (SgDockPercent). isPercent = fracao do container | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `toDockSize` | sim | toCssPercent: numero e texto 'N%' sao porcentagem; 'Npx' e pixel; o resto e null | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockable` | sim | Item de encaixe (equivale a um SgPanel com align no React) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockItem` | sim | Embrulha qualquer widget como item de encaixe | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgDockContent` | sim | renderDockContent do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgCheckedState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeFilter` | sim | Resultado de filterTreeByQuery | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `filterTreeByQuery` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `computeCheckedState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `computeCascadeValue` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgTreeFromJson` | sim | sgTreeFromJson: troca o nome do icone pelo widget do registro; children vazio vira nulo | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeNode` | sim | No da arvore (SgTreeNode). meta e livre | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeNodeJson` | sim | No em forma de dado (SgTreeNodeJson): o icone e o NOME de um icone do registro | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeIconRegistry` | sim | SgTreeIconRegistry: nome do icone -> widget | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeTrackOption` | sim | Opcao de uma trilha enum | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeTrack` | sim | Uma coluna extra por linha (SgTreeTrack). width e um valor CSS ("140px", "12rem"); padrao 110px.… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeTrackBoolean` | sim | Trilha de checkbox com cascata pai -> filhos propria, controlada de fora | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeTrackEnum` | sim | Trilha de lista de opcoes (valor escolhido / sem valor / misto) com cascata | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeTrackCustom` | sim | Celula livre alinhada com as outras: a arvore so cede a celula (largura e cabecalho) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeConfirmBar` | sim | Barra de confirmacao (SgTreeConfirmBar); null no confirmBar = false do React | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeViewController` | sim | Equivale a SgTreeViewRef do React (ref vira controller, ADR 50) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeViewControllerHost` | sim | Contrato interno entre o estado do widget e o [SgTreeViewController] | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgTreeViewState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuStyleKind` | sim | Variante efetiva do menu (menuVariantStyle normalizado para panel, tiered, mega-horizontal ou… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuNode` | sim | Item do menu (SgMenuNode do React). badge e texto ou numero | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuSelection` | sim | Selecao ativa por id ou por url (SgMenuSelection) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuBrand` | sim | Bloco de marca no topo (SgMenuBrand). imageSrc e uma URL de rede | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuUser` | sim | Bloco do usuario (SgMenuUser). avatarSrc e uma URL de rede | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgMenuSearch` | sim | Busca integrada (search: { enabled, placeholder }) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgToolBarSize` | sim | SgToolBarSize do React (w/h em px) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `SgToolbarScope` | sim | Orientacao da toolbar que contem o botao (o SgToolbarOrientationContext do React), mais a chave da… | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `sgToolbarSeverityColors` | sim | BTN_COLORS do React: fundo, texto e anel por severidade, lidos dos aliases do tema | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `kSgToolBarNarrowWidth` | sim | Largura (600 px) abaixo da qual o menu de overflow da SgToolBar abre como painel inferior | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `kSgGridBreakpoints` | sim | Breakpoints do React em px de largura da janela (sm 640 ... 2xl 1536) | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |
| `kSgDockSideColumn` | sim | 12rem do React (192 px): largura das colunas laterais do SgDockScreen | [[SeedGrid/SeedGrid-components/flutter/layout/API\|API]] |

## Navegação, overlay e wizard — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgDockMenu` | portado | Menu de ações no estilo dock, com zoom, selos, rótulos, oito posições e arraste | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgPopup` | portado | Painel ancorado a um widget para ações e detalhes curtos, sem abrir um modal | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgDialog` | portado | Diálogo modal com severidade, tamanhos, animação e controle de foco | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgConfirmationDialog` | portado | Diálogo de confirmação com mensagem, severidade e botões de confirmar e cancelar | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgWizard` | portado | Fluxo em etapas com stepper, validação por etapa e finalização assíncrona | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgWizardPage` | portado | Uma etapa do SgWizard, com título, ícone e conteúdo | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgWizardLabels` | sim | Textos dos botões (parcial; o que faltar vem do i18n) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `clampWizardStep` | sim | Lógica de navegação e guardas do wizard (equivalem às funções do React) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `canNavigateToWizardStep` | sim | Lógica de navegação e guardas do wizard (equivalem às funções do React) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `canProceedWizardAction` | sim | Lógica de navegação e guardas do wizard (equivalem às funções do React) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `parseCssColor` | sim | Cor CSS em texto (#hex, rgb(), hsl()); null se não entender | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `relativeLuminance` | sim | Luminância relativa de uma cor | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `kDialogDefaultShadow` | sim | Sombra padrão do diálogo quando não há elevation nem shadow (shadow-2xl do Tailwind) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgConfirmationDialogButtonConfig` | sim | Configuração de um dos botões do SgConfirmationDialog (className não existe) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgPopupSeverity` | sim | Severidades e ação do popup | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgPopupAction` | sim | Severidades e ação do popup | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `computePopupPosition` | sim | Equivale a computePosition + chooseAutoPlacement do React (devolve o canto superior esquerdo) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgDockMenuItem` | sim | Item do dock (id, icon, label, onClick, disabled, badge) | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgDockMenuOffset` | sim | Deslocamento, posição salva, orientação e chave de persistência do dock | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgDockMenuDragPosition` | sim | Deslocamento, posição salva, orientação e chave de persistência do dock | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `SgDockMenuOrientation` | sim | Deslocamento, posição salva, orientação e chave de persistência do dock | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |
| `buildDockMenuStorageKey` | sim | Deslocamento, posição salva, orientação e chave de persistência do dock | [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/API\|API]] |

## Gadgets (relógio, calendário, gauges, QR) — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgCalendar` | portado | Calendário mensal com vários meses, locale, limites e dias bloqueados | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClock` | portado | Relógio digital ou analógico com fuso, 12h/24h, temas e estilos de dígito | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgTimeProvider` | portado | Fornece a hora do servidor, com tick por segundo, a toda a árvore | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeProvider` | portado | Resolve temas de relógio (locais e globais) com modo e tema de recuo | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemePicker` | portado | Seletor de tema de relógio com miniatura e busca | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemePreview` | portado | Miniatura de um tema de relógio com ponteiros fixos | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgLinearGauge` | portado | Medidor linear com faixas, ponteiros extras e ajuste por arrasto | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGauge` | portado | Medidor radial com ponteiros, faixas, anotações e ângulos configuráveis | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgQRCode` | portado | QR Code com cores, margem, nível de correção e logo central | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgStringAnimator` | portado | Anima a troca de um texto por outro, letra a letra, com dígitos animados | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgNormalizeDate` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgStartOfMonth` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgAddMonths` | sim | addMonths do React: sempre cai no dia 1 do mes resultante | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgAddDays` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgIsSameDay` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgIsSameMonth` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgParseDateInput` | sim | parseDateInput do React: aceita DateTime ou texto. 'YYYY-MM-DD' vale no fuso LOCAL (nao em UTC)… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgClampWeekStart` | sim | clampWeekStart: inteiro modulo 7 (negativo volta para 0..6); nao numerico = 0 | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgClampInt` | sim | clampInt | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgDateKey` | sim | dateKey: YYYY-MM-DD | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgMonthGrid` | sim | Os 42 dias (6 semanas) da grade de um mes, comecando em [weekStartsOn] (0 = domingo) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgCapitalizeFirst` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgCalendarLocaleData` | sim | Dados do locale pedido | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgFormatMonthYear` | sim | Titulo do mes: Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}) + capitalizeFirst | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgFormatSelectedDate` | sim | Data selecionada: {weekday: 'long', day: 'numeric', month: 'long'} + capitalizeFirst | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgWeekdayLabels` | sim | Cabecalho dos dias da semana, na ordem que comeca em [weekStartsOn], com a primeira letra maiuscula | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgCalendarCardProps` | sim | cardProps do React (Omit<SgCardProps, 'title' \| 'children'>): subconjunto do [SgCard] que faz… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgStringAnimatorSafeEmpty` | sim | emptyChar.charAt(0) \|\| " " | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgStringAnimatorStepDelay` | sim | Atraso entre os passos: velocidade limitada a 1-100 e Math.round(600 - (v - 1) * 5.65). v=1 -> 600… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgStringAnimatorPad` | sim | padStart/padEnd do React, medidos em unidades UTF-16 (como o JavaScript) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgStringAnimatorChars` | sim | Array.from(s) do JavaScript: um item por code point | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgStringAnimatorController` | sim | Controle imperativo (o ref do React) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockPaint` | sim | Cor de um preenchimento/traco, com variante clara e escura (dark: do Tailwind). none = sem pintura… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockGradient` | sim | Gradiente radial do SVG (objectBoundingBox, valores em %) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockOp` | sim | Uma figura do tema | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockCircle` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockEllipse` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockLine` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockRect` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockPath` | sim | Caminho SVG | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `parseSvgPath` | sim | Converte d do SVG em [Path] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockText` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockOpsPainter` | sim | Pinta as [ops] de um tema (espaco 100x100) escalando para [size] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `ensureSgClockDigitalStyles` | sim | Registra os 8 estilos digitais que ainda nao tem construtor | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerSgClockDigitalStyles` | sim | Registra os 8 estilos digitais, substituindo o que existir (para quem quer chamar de forma… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeRenderArgs` | sim | Argumentos que o tema recebe ao desenhar: size em px e se o modo e escuro | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemePaint` | sim | Desenho livre de um tema no espaco 100x100 (equivale a render do React) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockUrlThemeUnsupportedError` | sim | Erro de tema por URL (SVG livre): nao portado | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockTheme` | sim | Tema do relogio. ops (JSON proprio) e/ou paint (desenho livre) fazem o papel de render do React | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `parseSgClockThemesJson` | sim | Interpreta um documento sg-clock-theme/1 ({formato, viewBox, temas: [...]}) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerTheme` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerThemes` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerSgClockBuiltInThemes` | sim | Atalho: registerThemes(sgClockThemesBuiltIn) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `getTheme` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `hasTheme` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `listThemes` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `unregisterTheme` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `clearThemes` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeResolveMode` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeResolver` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `createThemeResolver` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeProviderValue` | sim | value do SgClockThemeProvider | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeScope` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `useSgClockThemeResolver` | sim | useSgClockThemeResolver: o resolvedor do SgClockThemeProvider mais proximo, ou nulo | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `filterClockThemes` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `resolveClockThemeSelection` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `resolveTheme` | sim | resolveTheme de renderTheme.tsx | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgClockIsDark` | sim | Equivale a useDarkFlag: o brilho do tema do Flutter (que o SeedThemeProvider mantem em dia) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockThemeLayer` | sim | Camada do tema: pinta ops/paint no espaco 100x100 escalado para [size] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockUnsupportedTimeZoneError` | sim | Zona que o Intl conhece mas esta porte nao: mensagem clara, com o caminho para acrescentar | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockOffsetOf` | sim | Deslocamento (minutos a leste de UTC) de [timezone] no instante [utc] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerSgClockTimeZone` | sim | Acrescenta (ou substitui) uma zona. [offsetMinutes] recebe o instante em UTC | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `clearSgClockCustomTimeZones` | sim | Remove as zonas acrescentadas por [registerSgClockTimeZone] (uso em testes) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgClockOffsetMinutes` | sim | Deslocamento em minutos a leste de UTC. null ou vazio = fuso local da maquina | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockCardProps` | sim | cardProps do React (Omit<SgCardProps, 'title' \| 'children'>): subconjunto do [SgCard] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockDigitalParts` | sim | Partes do relogio digital, como o React as monta com Intl.DateTimeFormat.formatToParts | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgClockDigitalParts` | sim | Monta as partes do digital para o instante [utc] | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockDigitalStyleBuilder` | sim | Desenha o relogio digital de um estilo nao padrao (digitos animados) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `registerSgClockDigitalStyle` | sim | Liga um estilo digital (segment, sevenSegment, roller3d, flip, fade, matrix, neon, discard) a um… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `unregisterSgClockDigitalStyle` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgClockEnvironment` | sim | Fontes de tempo do relogio | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgTimeContextValue` | sim | Valor do contexto de tempo (equivale a SgTimeContextValue) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `useSgTimeContext` | sim | useSgTimeContext: o contexto do SgTimeProvider mais proximo, ou nulo (e depende dele: reconstroi a… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `useSgTime` | sim | useSgTime: o contexto do provider ou, sem provider, um relogio local | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `jsRound` | sim | Math.round do JavaScript: arredonda metade para cima (-0.5 vira -0, 0.5 vira 1), nao "para longe… | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `jsRoundText` | sim | String(Math.round(x)) do JavaScript: sem sinal em -0 e sem .0 | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGaugePointerType` | sim | Tipo do ponteiro do radial: needle (agulha), marker (marcador) ou range (arco ate o valor) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGaugeMarkerShape` | sim | Forma do marcador do radial | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgLinearGaugePointerShape` | sim | Forma do ponteiro do linear | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGaugeRange` | sim | Faixa colorida do radial (SgRadialGaugeRange) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGaugePointer` | sim | Ponteiro adicional do radial (SgRadialGaugePointer) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgRadialGaugeAnnotation` | sim | Anotacao posicionada sobre o radial (SgRadialGaugeAnnotation) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgLinearGaugeRange` | sim | Faixa colorida do linear (SgLinearGaugeRange) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgLinearGaugePointer` | sim | Ponteiro adicional do linear (SgLinearGaugePointer) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `QrMatrix` | sim | Matriz quadrada de modulos (true = escuro), sem margem | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `QrDataTooLongException` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `encodeQrMatrix` | sim | Gera a matriz como o qrcode.react: encodeSegments(makeSegments(text), level, 1, 40, -1, boostLevel) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `SgQRCodeLayout` | sim | Medidas do wrapper, como o React as calcula (Math.round, Math.max, Math.min) | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `sgQrCodeLayout` | sim | — | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |
| `radialGaugeCenterTexts` | sim | Textos do centro quando nao ha centerContent: o rotulo ("Value") e o valor arredondado | [[SeedGrid/SeedGrid-components/flutter/gadgets/API\|API]] |

## Dígitos animados — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgDiscardDigit` | portado | Pilha de folhas: a do topo é descartada ao trocar o valor, com paginação | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgFadeDigit` | portado | Cartão que apaga o caractere atual e acende o novo (fade de 200 ms) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgFlipDigit` | portado | Cartão que vira como placar de aeroporto ao trocar o caractere | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgMatrixDigit` | portado | Texto em matriz de pontos 5x7, no estilo painel LED | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgNeonDigit` | portado | Texto com brilho neon e troca que apaga e acende | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgRoller3DDigit` | portado | Tambor vertical que rola até o valor dentro de uma lista de itens | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgSegmentDigit` | portado | Dígito compacto em retângulos, na cor do tema, com suporte a dois pontos | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgSevenSegmentDigit` | portado | Display LED de sete segmentos com paletas, brilho e inclinação | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sgEaseOutBounce` | sim | ease-out-bounce do Tick (padrao do flip: flipEasing) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sgEaseOutCubic` | sim | ease-out-cubic do Tick | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sgEaseOutSine` | sim | ease-out-sine do Tick | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgFlipCard` | sim | Uma carta: frente (metade de cima) e verso (metade de baixo) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgFlipEngine` | sim | — | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgDiscardMotion` | sim | Movimento sorteado de uma folha (o que createRandomMotion devolve no React) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sgCreateRandomMotion` | sim | createRandomMotion do React (mesma ordem de sorteios: lado, tx, ty, rotateZ, rotateX, scale) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgDiscardMetrics` | sim | Medidas do conjunto (iguais as do React) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sgDiscardDepth` | sim | Profundidade da pilha: totalNumberPages manda; senao stackDepth (2 a 30) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgDiscardDigitController` | sim | Equivale ao ref (SgDiscardDigitHandle) do React | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgFlipDigitState` | sim | Estado publico para testes: expoe o motor e o relogio do flip | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgRollerMetrics` | sim | Medidas do roller: iguais as do React (Math.round do JS arredonda .5 para cima) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `parseDigitColor` | sim | Converte um texto de cor CSS em [Color]; devolve null se nao entender | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `resolveDigitColor` | sim | [parseDigitColor] com cor de reserva (a prop invalida cai no padrao, em vez de quebrar) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `paintOuterShadow` | sim | box-shadow: dx dy blur spread color (sombra externa): desenha [rrect] deslocado e dilatado… | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `paintInsetShadow` | sim | box-shadow: inset dx dy blur spread color: preenche o que fica FORA do [rrect] (encolhido pelo… | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `scaleAlpha` | sim | Mesma cor com o alfa multiplicado por [factor] (0..1) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `matrixGlyph` | sim | Glifo de um caractere ja em maiusculo | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `jsToUpperCase` | sim | Maiusculas com as mesmas regras do String.prototype.toUpperCase do JavaScript | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `matrixChars` | sim | Caracteres a desenhar: [value] em maiusculo (como o JavaScript), por ponto de codigo; vazio vira… | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `matrixGlowSize` | sim | Raio do brilho dos pontos acesos | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `NeonShadow` | sim | Camada de sombra: 0 0 {blur}px {color}; [inset] = sombra interna do contorno | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `NeonMetrics` | sim | — | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `neonMetrics` | sim | Raios do brilho, proporcionais a [fontSize] e a [shadowStrength] (minimo 0,2) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `neonTextShadows` | sim | Sombras do texto: acesas (5 camadas) ou apagadas (1 camada fraca) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `neonContainerShadows` | sim | Sombras do contorno: uma interna escura e duas externas coloridas (ou a versao apagada, de duas… | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `lerpNeonShadows` | sim | Interpola duas listas de sombras como o CSS: par a par, e a lista mais curta e completada com… | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SegmentGeometry` | sim | — | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `segmentGeometry` | sim | char, grade, tamanho final e retangulos para [value] com altura [size] | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SevenSegmentPaletteColors` | sim | Cores de uma paleta (como texto CSS, igual ao React) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sevenSegmentActive` | sim | Segmentos acesos para [value]: usa o primeiro caractere, em maiusculo (segmentSetFor do React) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SevenSegmentLayout` | sim | Geometria do painel e dos 7 segmentos, em pixels (todas as contas do React, na mesma ordem) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `sevenSegmentLayout` | sim | — | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgMatrixPainter` | sim | Pintor da matriz (publico para os testes) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `neonFontWeight` | sim | fontWeight do React: numero (100..900) ou texto (bold, normal, 600) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgNeonBoxPainter` | sim | Pintor do contorno do neon: sombras externas, fundo e sombras internas (publico para os testes) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgSegmentPainter` | sim | Pintor do glifo (publico para os testes) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |
| `SgSevenSegmentPainter` | sim | Pintor do display (publico para os testes inspecionarem levels) | [[SeedGrid/SeedGrid-components/flutter/digits/API\|API]] |

## Providers (ambiente/persistência e realtime) — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgEnvironmentProvider` | portado | Fornece namespace, estratégia e configuração de persistência à árvore | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeProvider` | portado | Avisos em tempo real do Pulse para o usuário logado, com status e reconexão | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `NamespaceProvider` | sim | { getNamespace: () => string \| null } do React | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `PersistenceStrategy` | sim | Estrategia de persistencia: load, save e clear por chave | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistenceRecordDTO` | sim | Registro enviado e recebido pela persistencia por API (SgPersistenceRecordDTO) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistenceMode` | sim | "strict" \| "fallback" \| "mirror" | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistenceConfig` | sim | { scope, mode, stateVersion } | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgEnvironmentValue` | sim | Resultado de useSgEnvironment: namespace, estrategia e configuracao | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgEnvironment` | sim | SgEnvironment no React e um alias de SgEnvironmentValue | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `buildSgPersistenceKey` | sim | chave final = sg:<namespace>[:<scope>]:<baseKey>; null sem namespace (nada e persistido) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `createLocalStorageStrategy` | sim | Estrategia local (localStorage no React, shared_preferences no Flutter) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `createApiPersistenceStrategy` | sim | Estrategia por API: GET/POST/DELETE {baseUrl}/sg/persistence | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `createCompositePersistenceStrategy` | sim | Combina duas estrategias: - strict: so a primaria (erro propaga); - fallback: primaria e, se… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgStringStorage` | sim | Pick<Storage, "getItem" \| "setItem" \| "removeItem"> do React | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SharedPreferencesStorage` | sim | [SgStringStorage] sobre uma instancia ja carregada de SharedPreferences | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `resolvePersistedStateValue` | sim | null => [defaultValue]; senao [deserialize] do valor carregado | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `readLocalPersistentState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `writeLocalPersistentState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `clearLocalPersistentState` | sim | — | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistentState` | sim | Estado persistido (equivale ao retorno de useSgPersistentState): value, setValue, clear e hydrated | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistentStateBuilder` | sim | Dono do ciclo de vida de um [SgPersistentState]: cria ao montar, descarta ao sair e reconstroi a… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistencePartial` | sim | Valores opcionais de persistence (no React o value e um Partial<SgEnvironmentValue> lido campo a… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgEnvironmentPartial` | sim | Partial<SgEnvironmentValue>: o que faltar usa o padrao do ambiente | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `useSgEnvironment` | sim | useSgEnvironment(): o ambiente do provider mais proximo, ou o padrao | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `useHasSgEnvironmentProvider` | sim | useHasSgEnvironmentProvider() | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `useSgNamespaceProvider` | sim | useSgNamespaceProvider() | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPersistence` | sim | Resultado de useSgPersistence(): load, save e clear ja com a chave final… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `useSgPersistence` | sim | useSgPersistence() | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgFetchRequest` | sim | Pedido HTTP (equivale aos argumentos input + init do fetch) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgFetchResponse` | sim | Resposta HTTP (equivale ao Response: ok, status e json()) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgFetcher` | sim | Equivale ao fetch injetavel do React | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `sgDefaultFetcher` | sim | Fetcher padrao: [SgHttpClient] de seedgrid_commons | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPulseState` | sim | Estados do cliente, com os mesmos nomes do ConnectionState do SDK | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPulseToken` | sim | Token curto de conexao (PulseConnectToken) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPulseMessage` | sim | Mensagem recebida (PulseIncomingMessage, so os campos que o provider usa) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPulseTokenGetter` | sim | — | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgPulseConnection` | sim | Cliente do Pulse | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgSimulatedPulseConnection` | sim | Conexao simulada, sem rede: serve ao showcase e aos testes | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeStatus` | sim | Estado do realtime, do ponto de vista da tela: - disabled: o backend respondeu {enabled:false} (ou… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeConnectResponse` | sim | Resposta do POST /realtime/connect das extensoes de realtime (Java e Rust) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeEvent` | sim | Aviso recebido. data so traz identificadores: busque o registro pela API de sempre | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgTokenRequestInit` | sim | RequestInit do pedido de token (cabecalhos e corpo) | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `requestRealtimeToken` | sim | Pede o token ao backend | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeListener` | sim | — | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `matchesSgRealtimeEvent` | sim | backup.finished.* casa backup.finished.success e backup.finished.error; * casa tudo | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeSubscription` | sim | Assinatura de [listenSgRealtimeEvent] | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `listenSgRealtimeEvent` | sim | Chama [handler] a cada aviso do [channel] cujo nome casa [events] (String ou List de String… | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |
| `SgRealtimeEventListener` | sim | Equivale a useSgRealtimeEvent: ouve enquanto estiver montado | [[SeedGrid/SeedGrid-components/flutter/providers/API\|API]] |

## Fundamentos do @seedgrid/fe-components — Flutter

| Nome | Estado de paridade (componente) / Exportado (símbolo) | Resumo | Nota |
|---|---|---|---|
| `SgForm` | apoio, substitui useForm | Mantém o SgFormController acessível aos campos e envia com Enter ou botão submit | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgFormController` | apoio, substitui useForm | Guarda valores, regras, erros e estado do formulário: setValue, trigger, reset, handleSubmit | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgRules` | apoio, equivalente ao React | Regras de campo no estilo RegisterOptions do react-hook-form (required, min, max, pattern, validate) | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgValidationScope` | apoio, só no Flutter | Registra campos sem formulário para o SgWizard validá-los ao avançar de etapa | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgComponentsI18nProvider` | portado | Define o idioma (5 embutidos) e as mensagens dos componentes abaixo dele | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `setComponentsI18n` | apoio, equivalente ao React | Define o idioma e as mensagens globais dos componentes, fora de árvore de widgets | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `sgNode` | apoio, só no Flutter | Converte String/num em Text nas props de texto que aceitam String ou Widget | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SeedThemeProvider` | apoio, parcial (sem persistência nem applyTo) | Gera o tema SeedGrid por cor seed, claro/escuro, e o injeta no ThemeData | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgTheme` | apoio, mapa de variáveis mantido | Guarda as variáveis --sg-* com os mesmos nomes do React e getters tipados de cor | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `maskCpf` | apoio, equivalente ao React | Máscaras de CPF, CNPJ, CEP (7 países) e telefone, com os mesmos nomes de função do React | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `isValidCpf` | apoio, equivalente ao React | Valida CPF, CNPJ alfanumérico, e-mail, domínio descartável, senha, datas e idade mínima | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `buscarCep` | apoio, equivalente ao React | Consulta CEP no ViaCEP e CNPJ na API pública, com cliente HTTP injetável | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
| `SgHttpClient` | apoio, equivalente ao React | Cliente HTTP mínimo com baseUrl, token Bearer e erro SgHttpException | [[SeedGrid/SeedGrid-components/flutter/fundamentos/API\|API]] |
