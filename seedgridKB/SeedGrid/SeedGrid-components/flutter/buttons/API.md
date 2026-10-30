---
description: "API Flutter de Botões: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, buttons, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Botões (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/buttons/API|API — Botões (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/buttons/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/buttons/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgButton

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgButton` (mesmo nome).

Botao de acao com suporte a severity, appearance, shape, loading e icones para acoes principais e secundarias.

- Arquivo: `packages/seedgrid_components/lib/src/buttons/sg_button.dart` (linha 162) · classe `class SgButton extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_button.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgButton({...})` com 15 parâmetro(s) nomeado(s), 11 do contrato React e 4 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgButton

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `severity` | `SgSeverity` | `SgSeverity.primary` | não | React | Define o peso visual e semantico da acao. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`. |
| `appearance` | `SgAppearance` | `SgAppearance.solid` | não | React | Variante visual base do botao. Valores: `solid`, `outline`, `ghost`. |
| `size` | `SgSize?` | — | não | React | Valores: `sm`, `md`, `lg`. |
| `shape` | `SgButtonShape?` | — | não | React | Valores: `circle`, `square`, `rounded`, `default`. |
| `elevation` | `SgElevation` | `SgElevation.none` | não | React | Valores: `none`, `sm`, `md`. |
| `label` | `Object?` | — | não | React | Conteudo textual principal do botao. |
| `iconOnly` | `bool?` | — | não | React | — |
| `leftIcon` | `Widget?` | — | não | React | Icone exibido antes do label. |
| `rightIcon` | `Widget?` | — | não | React | Icone exibido depois do label. |
| `loading` | `bool` | `false` | não | React | Exibe spinner e bloqueia interacao enquanto a acao esta em progresso. |
| `customColors` | `SgButtonCustomColors?` | — | não | React | Tipo no React: `SgButtonCustomColors`. |
| `onClick` | `VoidCallback?` | — | não | Flutter | `onClick` do botao HTML. |
| `disabled` | `bool?` | — | não | Flutter | `disabled` do botao HTML. |
| `type` | `SgButtonType` | `SgButtonType.button` | não | Flutter | `type` do botao HTML. |
| `child` | `Object?` | — | não | Flutter | `children` no React (tem precedencia sobre [label]). `String` ou `Widget`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- Nenhuma ressalva registrada na tabela de paridade; o componente está `portado`.
- **Extras do Flutter** (o React os herda do `<button>` HTML; aqui são o conjunto fechado definido pela ADR 50): `onClick`, `disabled`, `type` (`SgButtonType.button`, `submit`, `reset`) e `child`.
- `child` tem precedência sobre `label`; os dois aceitam `String` ou `Widget` (convertidos por `sgNode`).
- **Não portado:** `className` e `style` (ADR 50); use `customColors`, `size`, `shape` e `elevation`.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `buttons/sg_button.dart`, `_SgButtonState._onTap`)
- `onClick: VoidCallback?`: chamado ao tocar/clicar, ou ao pressionar Enter ou Espaço com o foco no botão. Não dispara com `disabled: true` nem com `loading: true` (o botão fica desabilitado nos dois casos).
- Não há controller: o estado (hover, pressionado, foco) é interno ao `State`.

**Formulário**
- `type: SgButtonType.submit` registra o botão no `SgForm` mais próximo (`SgForm.registerSubmitButton` em `initState`); ao tocar, chama `onClick` e depois aciona o envio do `SgForm` (`SgForm.submitOf`), que roda os callbacks `onValid`/`onInvalid` do formulário.
- Fora de um `SgForm`, `type: submit` lança `FlutterError` no toque, com a orientação de usar `onClick: () => form.handleSubmit(...)`.
- `SgButtonType.reset` existe no enum, mas o `_onTap` só trata `submit`: **não há comportamento de reset** confirmado no código.

**Acessibilidade**
- O widget é envolvido por `Semantics(button: true, enabled: !isDisabled)`; não define `label` próprio, então o texto vem do conteúdo (`label`/`child`). Inferência: um botão só com ícone (`iconOnly`) fica sem rótulo para leitores de tela, a menos que o `Widget` do ícone traga `semanticLabel`/`Tooltip`.
- Foco por teclado: `Focus(canRequestFocus: !isDisabled)` com anel de foco desenhado (`ring` do tema) e ativação por Enter e Espaço (`onKeyEvent`).
- Desabilitado: opacidade 0,6 e cursor `forbidden`.

## SgSplitButton

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgSplitButton` (mesmo nome).

Botao de acao com trigger principal e menu secundario acoplado para variacoes contextuais da mesma tarefa.

- Arquivo: `packages/seedgrid_components/lib/src/buttons/sg_split_button.dart` (linha 71) · classe `class SgSplitButton extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_split_button.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgSplitButton({...})` com 12 parâmetro(s) nomeado(s), 12 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgSplitButton

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `items` | `List<SgSplitButtonItem>` | — | sim | React | Lista de acoes secundarias exibidas no menu dropdown. Tipo no React: `SgSplitButtonItem[]`. |
| `label` | `String?` | — | não | React | Conteudo textual principal da acao. |
| `leftIcon` | `Widget?` | — | não | React | Icone exibido junto do label principal. |
| `severity` | `SgSeverity` | `SgSeverity.primary` | não | React | Peso visual e semantico da acao principal. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`. |
| `appearance` | `SgAppearance` | `SgAppearance.solid` | não | React | Variante visual base do split button. Valores: `solid`, `outline`, `ghost`. |
| `size` | `SgSize` | `SgSize.md` | não | React | Valores: `sm`, `md`, `lg`. |
| `shape` | `SgSplitButtonShape` | `SgSplitButtonShape.defaultValue` | não | React | Valores: `square`, `rounded`, `default`. |
| `elevation` | `SgElevation` | `SgElevation.none` | não | React | Valores: `none`, `sm`, `md`. |
| `disabled` | `bool` | `false` | não | React | Desabilita a acao principal e o menu secundario. |
| `loading` | `bool` | `false` | não | React | Exibe estado de carregamento na acao principal. |
| `onClick` | `VoidCallback?` | — | não | React | Callback disparado na acao principal. Tipo no React: `(() => void)`. |
| `customColors` | `SgButtonCustomColors?` | — | não | React | Tipo no React: `SgButtonCustomColors`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- Em largura menor que 600 px o menu vira um painel de baixo (ADR 51); em tela larga abre colado abaixo do botão principal.
- `items` é `List<SgSplitButtonItem>` (classe Dart no lugar do tipo estrutural do React) e `label` é `String`, como no React.
- Não há setas de teclado no menu (o React também não tem).
- Divisória e sombras aproximadas; **não testado em dispositivo**.
- **Não portado:** `className` e `style` (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `buttons/sg_split_button.dart`)
- `onClick: VoidCallback?`: chamado ao tocar no botão principal (o segmento da esquerda).
- `SgSplitButtonItem.onClick: VoidCallback?`: chamado ao escolher o item; em seguida o menu fecha (`_itemClick`). Item com `disabled: true` não dispara nada nem fecha o menu.
- `SgSplitButtonItem` tem `label` (obrigatório), `icon`, `onClick`, `disabled` e `separator` (linha antes do item; ignorada no primeiro).
- Não há callback de abrir/fechar o menu nem controller: o estado `_open` é interno.

**Comportamento do menu**
- Seta (segmento da direita) alterna o menu; não abre com `disabled` ou `loading` (`_toggle`).
- Fecha ao tocar fora (`TapRegion.onTapOutside`) e ao pressionar Esc (handler em `HardwareKeyboard`, registrado só enquanto aberto).
- O menu é desenhado no `Overlay` raiz (`OverlayPortal`, `OverlayChildLocation.rootOverlay`), então não é cortado pelo pai.
- Abaixo de `kSgSelectNarrowWidth` (600 px, `inputs/dropdown/sg_dropdown_host.dart`) os itens têm altura mínima de 48 e o menu é um painel de baixo.

**Acessibilidade**
- Cada segmento usa `Semantics(button: true, enabled: ...)`; o da seta recebe `label` do i18n (`components.actions.openList` ou `components.actions.close`) e `expanded` conforme o menu está aberto.
- Cada item do menu também é `Semantics(button: true, enabled: !disabled)`.
- Foco e ativação por Enter/Espaço nos segmentos (`Focus` + `onKeyEvent`).
- Não há navegação por setas dentro do menu (ver acima).

## SgFloatActionButton

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgFloatActionButton` (mesmo nome).

Botao de acao flutuante para tarefas de alto destaque, com suporte a hint, posicao fixa e expansao de acoes secundarias.

- Arquivo: `packages/seedgrid_components/lib/src/buttons/sg_float_action_button.dart` (linha 290) · classe `class SgFloatActionButton extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_float_action_button.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgFloatActionButton({...})` com 30 parâmetro(s) nomeado(s), 30 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgFloatActionButton

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `hint` | `String?` | — | não | React | Rotulo textual complementar exibido como hint. |
| `hintPosition` | `SgFloatActionButtonHintPosition?` | — | não | React | Valores: `top`, `left`, `right`, `bottom`. |
| `hintDelay` | `num` | `300` | não | React | — |
| `icon` | `Widget?` | — | não | React | Icone principal exibido no FAB. |
| `activeIcon` | `Widget?` | — | não | React | — |
| `position` | `SgFloatActionButtonPosition` | `SgFloatActionButtonPosition.rightBottom` | não | React | Posicao do FAB na area visivel. Valores: `left-top`, `left-center`, `left-bottom`, `center-top`, `center-bottom`, `right-top`, `right-center`, `right-bottom`. |
| `offset` | `SgFABOffset?` | — | não | React | Tipo no React: `{ x?: number; y?: number; }`. |
| `enableDragDrop` | `bool` | `false` | não | React | — |
| `dragId` | `String?` | — | não | React | — |
| `severity` | `SgFloatActionButtonSeverity` | `SgFloatActionButtonSeverity.primary` | não | React | Peso visual da acao flutuante. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`. |
| `floatActionButtonStyle` | `SgFloatActionButtonFloatActionButtonStyle?` | — | não | React | Sem efeito: como `severity` ja tem padrao, o React nunca chega a ler este sinonimo. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`. |
| `color` | `String?` | — | não | React | Cor CSS (`#hex`, `rgb()`, `hsl()`) do fundo; o texto/icone fica branco. |
| `size` | `SgFloatActionButtonSize` | `SgFloatActionButtonSize.md` | não | React | Valores: `sm`, `md`, `lg`. |
| `shape` | `SgFloatActionButtonShape` | `SgFloatActionButtonShape.circle` | não | React | Valores: `circle`, `square`, `rounded`. |
| `elevation` | `SgFloatActionButtonElevation` | `SgFloatActionButtonElevation.md` | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `disabled` | `bool` | `false` | não | React | Desabilita a acao principal e as acoes derivadas. |
| `loading` | `bool` | `false` | não | React | Exibe estado de carregamento no FAB. |
| `autoHideOnScroll` | `bool` | `false` | não | React | — |
| `hideDirection` | `SgFloatActionButtonHideDirection` | `SgFloatActionButtonHideDirection.down` | não | React | Valores: `down`, `up`. |
| `animation` | `SgFloatActionButtonAnimation` | `SgFloatActionButtonAnimation.scale` | não | React | Valores: `none`, `pulse`, `fade`, `scale`, `slide`, `rotate`. |
| `animationOn` | `SgFloatActionButtonAnimationOn` | `SgFloatActionButtonAnimationOn.mount` | não | React | Valores: `mount`, `hover`, `click`. |
| `animationDuration` | `num` | `200` | não | React | — |
| `direction` | `SgFloatActionButtonDirection?` | — | não | React | Valores: `left`, `right`, `down`, `up`. |
| `type` | `SgFloatActionButtonType` | `SgFloatActionButtonType.linear` | não | React | Valores: `circle`, `linear`, `semi-circle`, `quarter-circle`. |
| `radius` | `num?` | — | não | React | — |
| `transitionDelay` | `num` | `30` | não | React | — |
| `actions` | `List<SgFABAction>?` | — | não | React | Acoes secundarias exibidas a partir do botao flutuante. Tipo no React: `SgFABAction[]`. |
| `onClick` | `VoidCallback?` | — | não | React | Callback da acao principal do FAB. Tipo no React: `(() => void)`. |
| `zIndex` | `num` | `50` | não | React | Sem efeito: a ordem das camadas e a do Overlay (ou do `Stack`, com `absolute`). |
| `absolute` | `bool` | `false` | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React (docs/PARIDADE.md)

- `absolute: false` flutua no `Overlay` raiz (equivalente a `position: fixed`); `absolute: true` preenche o pai, que deve ser um `Stack` de tamanho definido.
- `zIndex` não tem efeito (a ordem é a do `Overlay`/`Stack`); `floatActionButtonStyle` é aceito e ignorado, como no React (que nunca lê o sinônimo porque `severity` tem padrão).
- O padrão de `position` é `rightBottom` (o meta do React cita `bottom-right`, valor que não existe).
- `offset` vira `SgFABOffset` e `actions` vira `List<SgFABAction>`.
- Botão direito ou toque longo (500 ms) abre o menu de reiniciar a posição.
- Sem `dragId` a posição não é guardada; com `SgEnvironmentProvider` usa o namespace dele.
- `autoHideOnScroll` escuta a rolagem vertical do `Scrollable` mais externo abaixo do `Scaffold`, não a janela.
- O `hint` e a dica das ações aparecem por hover; no toque não há hover.
- Animações e sombras aproximadas pelo Flutter; **não testado em dispositivo**.
- **Não portado:** `className` e `style` (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `buttons/sg_float_action_button.dart`)
- `onClick: VoidCallback?`: chamado ao tocar no botão principal **somente quando não há `actions`**; com `actions`, o toque só abre ou fecha o speed-dial (`_handleClick`).
- `SgFABAction.onClick: VoidCallback?`: chamado ao escolher a ação (`acts[i].onClick?.call()`). `SgFABAction` tem `icon` (obrigatório), `label`, `onClick`, `severity`, `floatActionButtonStyle` e `disabled`.
- Não há callback de posição (`onPositionChange` não existe neste widget) nem controller.
- Fecha o speed-dial ao tocar fora (`TapRegion`) e com Esc.

**Persistência da posição arrastada** (`enableDragDrop: true` e `dragId` informado)
- Chave: `buildFabStorageKey(dragId)` = `sg-fab-pos:<dragId>`. Com `SgEnvironmentProvider` na árvore usa `SgPersistence` (`load`/`save`/`clear`); sem ele usa `SharedPreferences` direto, gravando JSON `{"x":…, "y":…}`. Valor inválido é apagado ao ler (`parseStoredFabDragPosition`). Erros de leitura/escrita são ignorados.
- Veja [[SeedGrid/SeedGrid-components/flutter/providers/API|API dos providers (Flutter)]].

**Acessibilidade**
- `Semantics(button: true, enabled, label, expanded)`: o `label` é o `hint` ou, sem `hint`, o texto i18n `components.actions.open`/`components.actions.close`; `expanded` só é informado quando há `actions`.
- Cada ação do speed-dial tem `Semantics(button: true, enabled, label: a.label)`.
- Foco por teclado e ativação com Enter/Espaço (`Focus` + `onKeyEvent`). O balão de dica é excluído da semântica (`ExcludeSemantics`).

