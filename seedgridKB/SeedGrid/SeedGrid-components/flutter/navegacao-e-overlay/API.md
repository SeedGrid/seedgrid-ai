---
description: "API Flutter de Navegação, overlay e wizard: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, navegacao-e-overlay, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Navegação, overlay e wizard (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/navegacao-e-overlay/API|API — Navegação, overlay e wizard (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/navegacao-e-overlay/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgDockMenu

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDockMenu` (mesmo nome).

Menu de acoes ou navegacao com estilo dock, suporte a badges, magnify, posicoes ancoradas e persistencia de arraste.

- Arquivo: `packages/seedgrid_components/lib/src/menus/dock_menu/sg_dock_menu.dart` (linha 68) · classe `class SgDockMenu extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_dock_menu.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDockMenu({...})` com 16 parâmetro(s) nomeado(s), 16 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgDockMenu

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String?` | — | não | React | Unique identifier for the dock |
| `items` | `List<SgDockMenuItem>` | — | sim | React | Itens exibidos no dock com icone, label, badge e acao. Tipo no React: `SgDockMenuItem[]`. |
| `position` | `SgDockMenuPosition?` | `SgDockMenuPosition.centerBottom` | não | React | Posicionamento principal do dock na area alvo. Valores: `left-top`, `left-center`, `left-bottom`, `center-top`, `center-bottom`, `right-top`, `right-center`, `right-bottom`. |
| `enableDragDrop` | `bool?` | `false` | não | React | Permite reposicionamento manual do dock. |
| `dragId` | `String?` | — | não | React | ID for persisting drag position |
| `offset` | `SgDockMenuOffset?` | — | não | React | Offset from the edge Tipo no React: `{ x?: number; y?: number; }`. |
| `itemClassName` | `String?` | — | não | React | Custom class name for items |
| `zIndex` | `num?` | `50` | não | React | Camada visual usada quando o dock esta sobreposto. |
| `itemSize` | `num?` | `48` | não | React | Tamanho visual padrao dos itens do dock. |
| `gap` | `num?` | `16` | não | React | Espacamento entre os itens do dock. |
| `backgroundColor` | `String?` | `kSgDockMenuDefaultBackground` | não | React | Background color |
| `showLabels` | `bool?` | `true` | não | React | Exibe labels contextuais dos itens. |
| `magnify` | `bool?` | `true` | não | React | Ativa efeito de ampliacao ao passar o mouse. |
| `magnifyScale` | `num?` | `1.5` | não | React | Magnification scale |
| `borderRadius` | `num?` | `16` | não | React | Border radius |
| `elevation` | `SgDockMenuElevation?` | `SgDockMenuElevation.lg` | não | React | Shadow elevation Valores: `none`, `sm`, `md`, `lg`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- O zoom por proximidade e o rótulo ao passar só funcionam com mouse ou caneta (desktop/web); em toque não há zoom nem rótulo (não existe hover). O rótulo vira o rótulo de acessibilidade do botão.
- Não existem `className`, `itemClassName`, `style` nem `item.className` (ADR 50). `zIndex` é aceito e ignorado: o Flutter não tem z-index (vale a ordem na árvore).
- **Não portado:** `position: fixed` na viewport. O dock se ancora na área que o pai dá ao widget (use dentro de um `Stack` ou como filho que preenche a tela).
- Sem `SgEnvironmentProvider`, a posição arrastada vai para o `shared_preferences` (no web, `localStorage` com o prefixo `flutter.`); com o provider, usa a estratégia do ambiente.
- O menu de contexto (redefinir posição) abre com botão direito ou toque longo.
- `backdrop-filter` é aproximado por `BackdropFilter`; goldens não feitos e não testado em dispositivo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/menus/dock_menu/sg_dock_menu.dart`): o widget não tem callbacks próprios; o clique é por item (`SgDockMenuItem.onClick`, não chamado se `disabled`).

**Controller, formulário e estado**: sem controller. Com `enableDragDrop: true` e `dragId`, a posição é lida e gravada por `SgEnvironmentProvider` (`useSgPersistence`) ou por `SharedPreferences`, na chave de `buildDockMenuStorageKey`. O menu de contexto (`onSecondaryTapDown` ou `onLongPress`) abre um `showDialog` com Cancelar e Confirmar que apaga a posição salva, só quando `enableDragDrop` está ligado, há `dragId` e existe posição salva (`buildDockMenuContextMenuState`). Símbolos públicos: `SgDockMenuItem`, `SgDockMenuOffset`, `SgDockMenuDragPosition`, `SgDockMenuOrientation`, `buildDockMenuStorageKey`.

**Acessibilidade** (Confirmado): o dock é `Semantics(container: true, identifier: id)`; cada item é `Semantics(button: true, enabled, label: item.label, excludeSemantics: true)` com `FocusableActionDetector` (`ActivateIntent` aciona o item; há anel de foco).

## SgPopup

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPopup` (mesmo nome).

Overlay contextual ancorado a um elemento para exibir acoes, detalhes curtos ou conteudo complementar sem abrir um modal completo.

- Arquivo: `packages/seedgrid_components/lib/src/overlay/sg_popup.dart` (linha 64) · classe `class SgPopup extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_popup.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPopup({...})` com 19 parâmetro(s) nomeado(s), 19 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgPopup

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `title` | `String?` | — | não | React | Titulo opcional do popup. |
| `subtitle` | `String?` | — | não | React | Subtitulo opcional do popup. |
| `open` | `bool?` | — | não | React | Controla a visibilidade do popup em modo controlado. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Callback disparado quando o estado de abertura muda. Tipo no React: `((open: boolean) => void)`. |
| `defaultOpen` | `bool` | `false` | não | React | — |
| `onOpen` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `onClose` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `anchorRef` | `GlobalKey` | — | sim | React | Elemento ancora usado para posicionar o popup. Tipo no React: `React.RefObject<HTMLElement>`. |
| `placement` | `SgPopupPlacement` | `SgPopupPlacement.auto` | não | React | Posicionamento principal do popup em relacao a ancora. Valores: `top`, `left`, `right`, `bottom`, `auto`. |
| `preferPlacement` | `SgPopupPreferPlacement` | `SgPopupPreferPlacement.right` | não | React | Valores: `top`, `left`, `right`, `bottom`. |
| `align` | `SgPopupAlign` | `SgPopupAlign.start` | não | React | Valores: `start`, `center`, `end`. |
| `offset` | `num` | `8` | não | React | — |
| `padding` | `num` | `8` | não | React | — |
| `closeOnOutsideClick` | `bool` | `true` | não | React | Fecha o popup quando o usuario clica fora dele. |
| `closeOnEscape` | `bool` | `true` | não | React | — |
| `zIndex` | `num` | `60` | não | React | Sem efeito no Flutter (a ordem e a do Overlay); mantido pelo contrato. |
| `minWidth` | `Object?` | `180` | não | React | Numero (px) ou texto `'180px'`; outras unidades CSS nao sao entendidas. Padrao 180. Tipo no React: `string \| number`. |
| `actions` | `List<SgPopupAction>?` | — | não | React | Lista de acoes contextuais renderizadas no popup. Tipo no React: `SgPopupAction[]`. |
| `child` | `Widget?` | — | não | React | `children` no React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- `anchorRef` vira uma `GlobalKey` do widget âncora (no React é um `RefObject<HTMLElement>`).
- `zIndex` só cumpre o contrato: a ordem das camadas é a do `Overlay`.
- `minWidth` aceita número ou texto em px (`'180px'`); outras unidades CSS não são entendidas (comentário da prop).
- **Não portado:** arrastar e redimensionar (o React também não tem).
- Golden com a fonte de teste do Flutter (sem comparação visual de texto).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/overlay/sg_popup.dart`, `_SgPopupState`)
- `onOpenChange(bool)`: a cada mudança pedida (clique fora, Esc, ação com `closeOnClick`).
- `onOpen` / `onClose`: depois que o estado de aberto mudou de fato (via `addPostFrameCallback`), como o efeito do React. O estado inicial não conta como transição.
- `SgPopupAction.onClick`: ao tocar a ação; fecha o popup se `closeOnClick` (padrão `true`). Ação `disabled` não dispara.

**Controller, formulário e estado**: controlado quando `open` é `bool`; senão usa `defaultOpen`. O painel é desenhado no `Overlay` raiz (`OverlayPortal`), posicionado por `computePopupPosition` (`placement` `auto`, `preferPlacement`, `align`, `offset`, `padding`) e reposicionado quando um `Scrollable` ancestral da âncora rola. Clique fora e Esc são escutados globalmente (`pointerRouter` e `HardwareKeyboard`), sem bloquear o que está atrás.

**Acessibilidade** (Confirmado): o painel é `Semantics(container: true, explicitChildNodes: true, label: title ?? i18n 'components.popup.ariaLabel')`; cada ação é `Semantics(button: true, enabled)` e `hint` vira `Tooltip`. Esc fecha (se `closeOnEscape`). Não há foco preso: o popup não é modal (Inferência: nenhum `FocusScope` em `sg_popup.dart`).

## SgDialog

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDialog` (mesmo nome).

Overlay modal para apresentar conteudo focado, confirmacoes e fluxos curtos com controle de abertura, fechamento e severidade visual.

- Arquivo: `packages/seedgrid_components/lib/src/overlay/sg_dialog.dart` (linha 20) · classe `class SgDialog extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_dialog.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDialog({...})` com 31 parâmetro(s) nomeado(s), 31 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgDialog

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `open` | `bool?` | — | não | React | Controla a abertura do dialog em modo controlado. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Callback disparado quando o estado de abertura muda. Tipo no React: `((open: boolean) => void)`. |
| `defaultOpen` | `bool` | `false` | não | React | — |
| `title` | `Object?` | — | não | React | Titulo principal do dialog. |
| `subtitle` | `Object?` | — | não | React | Subtitulo complementar do dialog. |
| `leading` | `Widget?` | — | não | React | — |
| `trailing` | `Widget?` | — | não | React | — |
| `child` | `Widget?` | — | não | React | Conteudo principal do corpo do dialog. |
| `footer` | `Widget?` | — | não | React | — |
| `size` | `SgDialogSize` | `SgDialogSize.md` | não | React | Escala do container modal. Valores: `sm`, `md`, `lg`, `xl`, `full`. |
| `severity` | `SgDialogSeverity` | `SgDialogSeverity.plain` | não | React | Tom semantico do cabecalho e acentos visuais. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`. |
| `animation` | `SgDialogAnimation` | `SgDialogAnimation.zoom` | não | React | Valores: `fade`, `zoom`, `slideUp`. |
| `transitionMs` | `num` | `160` | não | React | — |
| `autoCloseMs` | `num?` | — | não | React | — |
| `customColor` | `Object?` | — | não | React | Fundo customizado: `Color` ou texto CSS (`#hex`, `rgb()`, `hsl()`), como no React. Tipo no React: `Property.BackgroundColor`. |
| `elevation` | `Object?` | — | não | React | `'none' \| 'sm' \| 'md' \| 'lg'` (texto, como no React) ou `List<BoxShadow>`. Tipo no React: `"sm" \| "md" \| "lg" \| Property.BoxShadow`. |
| `shadow` | `List<BoxShadow>?` | — | não | React | Obsoleto no React (use [elevation]). Tipo no React: `Property.BoxShadow`. |
| `showTopAccent` | `bool` | `true` | não | React | — |
| `overlayClassName` | `String?` | — | não | React | Sem equivalente (classes CSS): existe so para cumprir o contrato, sem efeito. |
| `contentClassName` | `String?` | — | não | React | — |
| `headerClassName` | `String?` | — | não | React | — |
| `bodyClassName` | `String?` | — | não | React | — |
| `footerClassName` | `String?` | — | não | React | — |
| `closeable` | `bool` | `true` | não | React | — |
| `onClose` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `closeOnOverlayClick` | `bool` | `true` | não | React | Fecha o dialog ao clicar fora do conteudo. |
| `closeOnEsc` | `bool` | `true` | não | React | — |
| `lockBodyScroll` | `bool` | `true` | não | React | No Flutter o fundo modal sempre bloqueia o conteudo de tras; a prop nao muda nada. |
| `initialFocusRef` | `FocusNode?` | — | não | React | Foco inicial (no React, `RefObject<HTMLElement>`). Tipo no React: `React.RefObject<HTMLElement>`. |
| `restoreFocus` | `bool` | `true` | não | React | — |
| `ariaLabel` | `String?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- `lockBodyScroll` não tem efeito: o fundo modal do Flutter já bloqueia o conteúdo de trás.
- As props de classe CSS (`overlayClassName`, `contentClassName`, `headerClassName`, `bodyClassName`, `footerClassName`) são aceitas sem efeito.
- O acento do topo é uma faixa de 4 px; a ordem das camadas é a do `Overlay` (o `SgDialog` não tem prop `zIndex`).
- A `severity` tinge o **fundo** (12% da cor da severidade sobre o fundo, só sem `customColor`) e a faixa do topo, com a cor do `SgButton` da mesma severidade; `plain` não tinge (comentário em `overlay/sg_dialog.dart`).
- `initialFocusRef` é um `FocusNode` (no React, `RefObject<HTMLElement>`).
- Golden com a fonte de teste do Flutter.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/overlay/sg_dialog.dart`, `_SgDialogState`)
- `onOpenChange(bool)`: chamado em toda mudança de aberto, inclusive por Esc, clique no fundo, botão X e `autoCloseMs`.
- `onClose`: chamado quando o diálogo se fecha (depois de `onOpenChange(false)`).

**Controller, formulário e estado**: controlado quando `open != null`; senão `defaultOpen` + estado interno. O diálogo é desenhado no `Overlay` raiz via `OverlayPortal`, com animação (`animation`, `transitionMs`) e `autoCloseMs` opcional.

**Acessibilidade e foco** (Confirmado)
- `Semantics(scopesRoute: true, namesRoute: true, label)`; o rótulo é `ariaLabel`, senão o texto do `title`, senão i18n `components.dialog.ariaLabel`. O botão de fechar tem `Semantics(label, excludeSemantics: true)` (i18n `components.dialog.close`).
- Esc fecha por `HardwareKeyboard` (se `closeOnEsc`). O conteúdo fica num `FocusScope` (`FocusScopeNode`): o foco inicial vai para `initialFocusRef` ou para o primeiro foco do escopo; com `closeOnEsc` o foco circula (`TraversalEdgeBehavior.closedLoop`). `restoreFocus` (padrão `true`) devolve o foco ao elemento anterior ao fechar.

## SgConfirmationDialog

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgConfirmationDialog` (mesmo nome).

Dialog especializado em confirmacao de acoes sensiveis, com mensagem, severidade e botoes de confirmar e cancelar.

- Arquivo: `packages/seedgrid_components/lib/src/overlay/sg_confirmation_dialog.dart` (linha 40) · classe `class SgConfirmationDialog extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_confirmation_dialog.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgConfirmationDialog({...})` com 37 parâmetro(s) nomeado(s), 37 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgConfirmationDialog

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `open` | `bool?` | — | não | React | Controla a abertura do dialog de confirmacao. |
| `defaultOpen` | `bool` | `false` | não | React | — |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((open: boolean) => void)`. |
| `onClose` | `VoidCallback?` | — | não | React | Tipo no React: `(() => void)`. |
| `title` | `Object?` | — | não | React | Titulo principal da confirmacao. |
| `message` | `Object?` | — | não | React | Mensagem principal explicando o risco ou decisao. |
| `icon` | `Widget?` | — | não | React | `null` usa o icone padrao da severidade (info, warning, danger); sem icone para as demais. |
| `iconPlacement` | `SgConfirmationDialogIconPlacement` | `SgConfirmationDialogIconPlacement.left` | não | React | Valores: `top`, `left`. |
| `severity` | `SgDialogSeverity` | `SgDialogSeverity.warning` | não | React | Tom semantico da confirmacao. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`. |
| `customColor` | `Object?` | — | não | React | Tipo no React: `Property.BackgroundColor`. |
| `elevation` | `Object?` | — | não | React | Tipo no React: `"sm" \| "md" \| "lg" \| Property.BoxShadow`. |
| `showSeverityAccent` | `bool` | `false` | não | React | — |
| `cancelButton` | `SgConfirmationDialogButtonConfig?` | — | não | React | Configuracao visual e comportamental do botao de cancelamento. Tipo no React: `SgConfirmationDialogButtonConfig`. |
| `confirmButton` | `SgConfirmationDialogButtonConfig?` | — | não | React | Configuracao visual e comportamental do botao de confirmacao. Tipo no React: `SgConfirmationDialogButtonConfig`. |
| `onCancel` | `VoidCallback?` | — | não | React | Callback disparado quando o usuario cancela a acao. Tipo no React: `(() => void)`. |
| `onConfirm` | `VoidCallback?` | — | não | React | Callback disparado quando o usuario confirma a acao. Tipo no React: `(() => void)`. |
| `closeOnCancel` | `bool` | `true` | não | React | — |
| `closeOnConfirm` | `bool` | `true` | não | React | — |
| `closeable` | `bool` | `false` | não | React | — |
| `size` | `SgDialogSize` | `SgDialogSize.sm` | não | React | Valores: `sm`, `md`, `lg`, `xl`, `full`. |
| `subtitle` | `Object?` | — | não | React | `String` ou `Widget` (React: `ReactNode`). |
| `leading` | `Widget?` | — | não | React | — |
| `trailing` | `Widget?` | — | não | React | — |
| `animation` | `SgDialogAnimation` | `SgDialogAnimation.zoom` | não | React | Valores: `fade`, `zoom`, `slideUp`. |
| `transitionMs` | `num` | `160` | não | React | — |
| `autoCloseMs` | `num?` | — | não | React | — |
| `overlayClassName` | `String?` | — | não | React | Sem equivalente (classes CSS): so cumprem o contrato, sem efeito. |
| `contentClassName` | `String?` | — | não | React | — |
| `headerClassName` | `String?` | — | não | React | — |
| `bodyClassName` | `String?` | — | não | React | — |
| `footerClassName` | `String?` | — | não | React | — |
| `closeOnOverlayClick` | `bool` | `true` | não | React | — |
| `closeOnEsc` | `bool` | `true` | não | React | — |
| `lockBodyScroll` | `bool` | `true` | não | React | — |
| `initialFocusRef` | `FocusNode?` | — | não | React | Tipo no React: `React.RefObject<HTMLElement>`. |
| `restoreFocus` | `bool` | `true` | não | React | — |
| `ariaLabel` | `String?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- `lockBodyScroll` não tem efeito: o fundo modal do Flutter já bloqueia o conteúdo de trás.
- As props de classe CSS são aceitas sem efeito.
- Os ícones padrão de severidade (info, aviso, perigo) usam ícones do Material em vez dos SVG do React (comentário em `overlay/sg_confirmation_dialog.dart`).
- Os padrões do React estão mantidos: `severity: warning`, `closeable: false`, `size: sm`, `showSeverityAccent: false`; fecha ao cancelar e ao confirmar.
- Herda do `SgDialog` a severidade que tinge o fundo e a faixa do topo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/overlay/sg_confirmation_dialog.dart`, `_SgConfirmationDialogState`)
- `onConfirm` e `confirmButton.onClick`: ao tocar o botão de confirmar (os dois são chamados); fecha se `closeOnConfirm`.
- `onCancel` e `cancelButton.onClick`: ao tocar cancelar. Fechar pelo diálogo (Esc, fundo, X) **também conta como cancelar** (`_handleDialogOpenChange`).
- `onOpenChange(bool)` e `onClose`: como no `SgDialog`.

**Controller, formulário e estado**: controlado por `open` ou por `defaultOpen`. É um `SgDialog` com o rodapé de dois `SgButton` (chaves `sg-confirmation-cancel` e `sg-confirmation-confirm`) dentro de um `Wrap`, para quebrar linha em tela estreita.

**Acessibilidade e foco**: herdados do `SgDialog` (`scopesRoute`/`namesRoute`, Esc, `initialFocusRef`, `restoreFocus`). Os rótulos padrão dos botões vêm do i18n (`components.actions.cancel` e `components.actions.confirm`); o ícone padrão não declara `Semantics` próprio (Inferência).

## SgWizard

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgWizard` (mesmo nome).

Fluxo multi-etapas com stepper, validacao por etapa, navegacao controlada e finalizacao assincrona.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_wizard.dart` (linha 97) · classe `class SgWizard extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_wizard.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgWizard({...})` com 12 parâmetro(s) nomeado(s), 10 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgWizard

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `children` | `List<SgWizardPage>` | — | sim | Flutter | As etapas (`SgWizardPage`), na ordem. |
| `onFinish` | `FutureOr<void> Function()` | — | sim | React | Acao executada ao concluir o wizard. Tipo no React: `() => void \| Promise<void>`. |
| `onStepChange` | `ValueChanged<int>?` | — | não | React | Callback disparado ao trocar de etapa. Tipo no React: `((index: number) => void)`. |
| `onBeforeNext` | `FutureOr<bool> Function(int index)?` | — | não | React | Roda ao clicar em Proximo; devolver false (ou uma Promise<false>) impede o avanco. Enquanto e aguardado, o botao fica desabilitado. Tipo no React: `((index: number) => boolean \| Promise<boolean>)`. |
| `onBeforeFinish` | `FutureOr<bool> Function(int index)?` | — | não | React | Roda ao clicar em concluir; devolver false impede a finalizacao. Tipo no React: `((index: number) => boolean \| Promise<boolean>)`. |
| `validateStep` | `FutureOr<bool> Function(int index)?` | — | não | React | Valida a etapa atual antes de avancar. Tipo no React: `((index: number) => boolean \| Promise<boolean>)`. |
| `nextDisabled` | `bool` | `false` | não | React | Desabilita o avanco de forma declarativa: o botao Proximo fica desabilitado e o stepper para de oferecer as etapas seguintes. Use quando o bloqueio JA e conhecido (ex.: uma checagem assincrona ja resolveu que a etapa nao pode avancar) — onBeforeNext/validateStep so agem no clique e deixam o botao com aparencia de clicavel. Nao afeta o botao da ultima etapa; para isso use onBeforeFinish. |
| `initialStep` | `int?` | `0` † | não | React | Indice inicial da etapa ativa. |
| `labels` | `SgWizardLabels?` | — | não | React | Tipo no React: `Partial<SgWizardLabels>`. |
| `stepper` | `SgWizardStepper` | `SgWizardStepper.none` | não | React | Modo visual do stepper. Valores: `none`, `numbered`, `icons`. |
| `stepNavigation` | `SgWizardStepNavigation` | `SgWizardStepNavigation.previousAndNext` | não | React | Define quais etapas podem ser acessadas clicando no stepper. Valores: `none`, `previous`, `previous-and-next`. |
| `control` | `SgFormController?` | — | não | Flutter | Extra do Flutter: formulario usado para validar a etapa (senao, o SgForm mais proximo). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Validação diferente:** o React valida a página focando e saindo de cada `<input>` e contando `[data-sg-error]`. No Flutter a etapa é validada por `SgFormController.trigger(fields)` e também pelos campos sem formulário registrados no `SgValidationScope` da etapa; os campos se validam sob demanda e bloqueiam o avanço.
- Extras do Flutter: `SgWizardPage.fields` (nomes dos campos da etapa; nulo valida todos) e `SgWizard.control` (formulário a usar; senão o `SgForm` mais próximo).
- Sem formulário nem campos registrados, a etapa é considerada válida (como uma página sem inputs).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_wizard.dart`, `_SgWizardState`)
- `onFinish: FutureOr<void> Function()` (obrigatório): depois de validar a última etapa; o botão fica desabilitado enquanto o `Future` roda.
- `onStepChange(int)`: a cada mudança de etapa e uma vez depois da montagem, com a etapa inicial.
- `onBeforeNext(int)`, `onBeforeFinish(int)` e `validateStep(int)`: retornam `FutureOr<bool>`; `false` impede o avanço. Ordem (`canProceedWizardAction`): validação da página, `validateStep`, `onBefore*`.

**Controller, formulário e estado**: `nextDisabled` bloqueia o "Próximo" e o stepper deixa de oferecer as etapas seguintes. `stepper` (`none`, `numbered`, `icons`) e `stepNavigation` (`none`, `previous`, `previousAndNext`) controlam o stepper. Públicos: `SgWizardLabels`, `clampWizardStep`, `canNavigateToWizardStep`, `canProceedWizardAction`. Só a etapa atual fica montada (`KeyedSubtree` por etapa).

**Acessibilidade** (Confirmado): o stepper é `Semantics(container: true, label: i18n 'components.wizard.progress')` e cada etapa `Semantics(selected: current, button: clickable)`. Os botões são `SgButton` (chaves `wizard-previous`, `wizard-next`, `wizard-finish`). Nenhum atalho de teclado dedicado encontrado.

## SgWizardPage

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgWizardPage` (mesmo nome).

Pagina individual dentro de um wizard, com titulo, icone e conteudo associado a uma etapa.

- Arquivo: `packages/seedgrid_components/lib/src/feedback/sg_wizard.dart` (linha 32) · classe `class SgWizardPage extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_wizard_page.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgWizardPage({...})` com 4 parâmetro(s) nomeado(s), 3 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgWizardPage

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `title` | `String?` | — | não | React | Titulo exibido no stepper do wizard. |
| `icon` | `Widget?` | — | não | React | Icone opcional exibido quando o wizard usa stepper por icones. |
| `child` | `Widget` | — | sim | React | Conteudo da etapa. |
| `fields` | `List<String>?` | — | não | Flutter | Extra do Flutter: nomes dos campos do formulario que pertencem a esta etapa (o que o React descobre varrendo os inputs da pagina). Nulo = valida todos os campos registrados. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React

Fonte: `docs/PARIDADE.md` (texto reescrito) e, quando indicado, o código.

- **Sem diferenças registradas** na tabela de paridade para este componente.
- Extra do Flutter: `fields` (nomes dos campos do formulário que pertencem à etapa; o React os descobre varrendo os inputs).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**: nenhum. `title` padrão é "Etapa N" (i18n `components.wizard.step`); `icon` só aparece com `stepper: icons`. O widget é um `StatelessWidget` que devolve `child` (Confirmado em `packages/seedgrid_components/lib/src/feedback/sg_wizard.dart`).

**Formulário**: `fields` limita `SgFormController.trigger(fields)` aos campos da etapa.

**Acessibilidade**: Nenhum `Semantics` explícito encontrado em `feedback/sg_wizard.dart (SgWizardPage)`; não confirmado se o widget Material interno já expõe a semântica. A semântica da etapa fica no stepper do `SgWizard`.

