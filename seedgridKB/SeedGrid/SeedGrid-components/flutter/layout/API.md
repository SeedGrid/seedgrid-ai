---
description: "API Flutter de Layout e containers: construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, layout, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Layout e containers (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/layout/API|API — Layout e containers (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/layout/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/layout/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgStack

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgStack` (mesmo nome).

Primitive de layout flexivel para empilhar elementos em linha ou coluna com controle de gap, alinhamento e wrap.

- Arquivo: `packages/seedgrid_components/lib/src/layout/basic/sg_stack.dart` (linha 9) · classe `class SgStack extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_stack.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgStack({...})` com 7 parâmetro(s) nomeado(s), 6 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgStack

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `align` | `SgStackAlign?` | `stretch` † | não | React | Alinhamento dos itens no eixo cruzado. Valores: `start`, `center`, `end`, `stretch`. |
| `children` | `List<Widget>` | `const []` | não | Flutter | `children` no React. |
| `direction` | `SgStackDirection?` | `column` † | não | React | Direcao principal do empilhamento. Valores: `row`, `column`. |
| `gap` | `Object?` | `0` † | não | React | Espacamento entre os itens. Tipo no React: `string \| number`. |
| `grow` | `bool?` | `false` † | não | React | Permite que o stack cresca ocupando espaco disponivel. |
| `justify` | `SgStackJustify?` | `start` † | não | React | Distribuicao dos itens no eixo principal. Valores: `start`, `center`, `end`, `between`, `around`, `evenly`. |
| `wrap` | `bool?` | `false` † | não | React | Permite quebra de linha quando necessario. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Os breakpoints do `SgGrid`/`SgPanel`/`SgStack` medem a **janela** (`MediaQuery`), como o `@media (min-width)` do React, e não o contêiner.
- `gap` e `padding` aceitam número (px), `'Npx'`, `'Nrem'`, `vh`/`vw`/`vmin`/`vmax` e `calc()`/`min()`/`max()`/`clamp()`.
- `grow` só vale com pai flex (`Row`/`Column`/`Flex`); `align: stretch` só iguala os irmãos quando o pai fixa o eixo transversal.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum: o widget não tem callbacks próprios (`basic/sg_stack.dart`).

**Controller, formulário e estado**
- `StatelessWidget`, sem controller e sem ligação com `SgForm`.
- Os filhos entram por `children` (`List<Widget>`). O `child` do contrato React é só um getter derivado (`Column(children: children)`), não um parâmetro do construtor.
- Padrões efetivos no `build`: `direction` coluna, `justify` `start`, `align` `stretch`, `gap` 0. `wrap: true` troca o `Flex` por `Wrap` e, nesse caso, `stretch` cai em `start`.
- `grow: true` envolve o corpo em `Expanded` **somente** se o `RenderObject` ancestral mais próximo for um `RenderFlex`; em outro pai é ignorado.
- `align: stretch` só estica quando o pai fixa o eixo transversal; com altura/largura automática cada filho mantém o seu tamanho (o CSS igualaria os irmãos).

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `basic/sg_stack.dart`; o widget só compõe `Flex`/`Wrap`, que não acrescentam semântica própria (Inferência).

## SgGrid

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgGrid` (mesmo nome).

Primitive de layout em grade responsiva para distribuicao de cards, blocos e formularios em colunas e linhas.

- Arquivo: `packages/seedgrid_components/lib/src/layout/basic/sg_grid.dart` (linha 41) · classe `class SgGrid extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_grid.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgGrid({...})` com 9 parâmetro(s) nomeado(s), 8 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgGrid

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `align` | `SgGridAlign?` | — | não | React | `alignItems`: alinhamento vertical do item dentro da celula (padrao `stretch`). Valores: `start`, `center`, `end`, `stretch`. |
| `children` | `List<Widget>` | `const []` | não | Flutter | `children` no React. Um filho `SgPanel` com `span`/`rowSpan` ocupa varias celulas. |
| `columns` | `Object?` | — | não | React | Define a quantidade de colunas base e por breakpoint. Tipo no React: `SgGridColumns`. |
| `dense` | `bool?` | `false` † | não | React | Ativa preenchimento denso do fluxo de grade. |
| `gap` | `Object?` | `0` † | não | React | Espacamento entre os itens da grade. Tipo no React: `string \| number`. |
| `justify` | `SgGridJustify?` | — | não | React | Valores: `start`, `center`, `end`, `stretch`, `between`, `around`, `evenly`. |
| `minItemWidth` | `Object?` | — | não | React | Largura minima dos itens em modo auto-fit. Tipo no React: `string \| number`. |
| `padding` | `Object?` | — | não | React | Espacamento interno do container grid. Tipo no React: `string \| number`. |
| `rowHeight` | `Object?` | — | não | React | Altura automatica das linhas da grade. Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Os breakpoints medem a **janela**, como o `@media` do React, e não o contêiner.
- `span` e `rowSpan` são lidos dos filhos `SgPanel`; o `rowSpan` reparte o excesso de altura por igual entre as linhas, como o CSS grid.
- `gap` e `padding` aceitam número, `'Npx'`, `'Nrem'`, `vh`/`vw`/`vmin`/`vmax` e `calc()`/`min()`/`max()`/`clamp()`.
- `justify` existe no contrato, mas com colunas `1fr` não tem efeito visível; o porte guarda a prop e também não faz nada (comentário de cabeçalho de `basic/sg_grid.dart`).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `StatelessWidget` sem controller. `children` (`List<Widget>`); o `child` do contrato é um getter derivado.
- `columns` aceita inteiro ou `Map` com as chaves `base`, `sm`, `md`, `lg`, `xl`, `2xl`; resolvido por `sgGridColumnsFor(columns, larguraDaJanela)` contra `kSgGridBreakpoints` (640, 768, 1024, 1280, 1536 px). Sem `columns`, 1 coluna.
- `minItemWidth` liga as colunas automáticas (`auto-fit`) e **vence** `columns`. `rowHeight` fixa a altura das linhas; sem ele a linha tem a altura do maior item. `dense` liga o preenchimento denso.
- Só filhos `SgPanel` participam de `span`/`rowSpan` (teste `c is SgPanel`); qualquer outro widget ocupa uma célula. A colocação automática é `sgGridPlace` (equivale a `grid-auto-flow: row` ou `dense`).
- `align` (padrão `stretch`) é o alinhamento vertical do item na célula.

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `basic/sg_grid.dart`; o layout é um `RenderObject` próprio (`RenderSgGrid`) sem semântica adicional (Inferência).

## SgPanel

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPanel` (mesmo nome).

Container visual e estrutural para agrupamento de conteudo, composicao de secoes e cenarios com dock, padding e scroll.

- Arquivo: `packages/seedgrid_components/lib/src/layout/basic/sg_panel.dart` (linha 31) · classe `class SgPanel extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_panel.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPanel({...})` com 20 parâmetro(s) nomeado(s), 19 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgPanel

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `align` | `SgPanelAlign?` | `client` † | não | React | Posicionamento relativo ao container pai em cenarios de dock. Valores: `top`, `left`, `right`, `bottom`, `client`. |
| `borderStyle` | `SgPanelBorderStyle?` | `dashed` † | não | React | Estilo visual da borda do container. Valores: `none`, `solid`, `dashed`. |
| `children` | `List<Widget>` | `const []` | não | Flutter | `children` no React. |
| `contentAlign` | `SgPanelContentAlign?` | — | não | React | Valores: `start`, `center`, `end`, `stretch`. |
| `contentClassName` | `String?` | — | não | React | Sem efeito no Flutter (nao ha classe CSS); existe para cumprir o contrato. |
| `contentDirection` | `SgPanelContentDirection?` | — | não | React | Valores: `row`, `column`. |
| `contentGap` | `Object?` | — | não | React | Padrao 10. Tipo no React: `string \| number`. |
| `contentJustify` | `SgPanelContentJustify?` | — | não | React | Valores: `start`, `center`, `end`, `between`, `around`, `evenly`. |
| `contentPadding` | `Object?` | `0` † | não | React | Espacamento interno entre a borda e o conteudo. Tipo no React: `string \| number`. |
| `contentStyle` | `Object?` | — | não | React | Sem efeito no Flutter (nao ha `CSSProperties`); existe para cumprir o contrato. Tipo no React: `React.CSSProperties`. |
| `contentWrap` | `bool?` | — | não | React | — |
| `height` | `Object?` | — | não | React | Altura do painel quando dockado ou usado em composicoes controladas. Tipo no React: `SgDockPercent`. |
| `minHeightPx` | `num?` | — | não | React | — |
| `minWidthPx` | `num?` | — | não | React | — |
| `padding` | `Object?` | `0` † | não | React | Espacamento externo do painel em relacao ao slot recebido do pai. Tipo no React: `string \| number`. |
| `rowSpan` | `num?` | — | não | React | Linhas ocupadas dentro de um SgGrid. |
| `scrollable` | `Object?` | `false` † | não | React | Habilita scroll apenas quando desejado. Tipo no React: `SgPanelScrollable`. |
| `scrollbarGutter` | `bool?` | `false` † | não | React | Reserva espaco visual para scrollbar. |
| `span` | `num?` | — | não | React | Colunas ocupadas dentro de um SgGrid. |
| `width` | `Object?` | — | não | React | Largura do painel quando dockado ou usado em composicoes controladas. Tipo no React: `SgDockPercent`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Os breakpoints medem a **janela**, como o `@media` do React.
- `span` e `rowSpan` valem dentro de um `SgGrid`; `grow` só vale com pai flex e `stretch` só iguala irmãos com eixo transversal fixo.
- `gap` e `padding` aceitam número, `'Npx'`, `'Nrem'`, `vh`/`vw`/`vmin`/`vmax` e `calc()`/`min()`/`max()`/`clamp()`.
- `contentClassName` e `contentStyle` são aceitos sem efeito (não há classe CSS nem `CSSProperties` no Flutter); `scrollbarGutter` não reserva espaço, porque as barras de rolagem do Flutter flutuam sobre o conteúdo.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `StatelessWidget`, `children` (`List<Widget>`). Sem controller.
- **Atenção (pegadinha herdada do React):** `padding` é a margem **externa** e `contentPadding` é o espaço **interno**.
- Filhos `SgPanel` com `align` explícito (`top`, `left`, `bottom`, `right`, `client`) são ancorados nas bordas por `sgDockContent` (`basic/dock_content.dart`, teste `c is SgPanel && c.align != null`); os demais filhos fluem em `contentDirection` (padrão: linha se o próprio `align` é `top`/`bottom`, senão coluna), `contentGap` (padrão 10), `contentJustify`, `contentAlign` e `contentWrap`.
- `width`/`height` são porcentagem (número ou `'N%'`) do espaço disponível; quando o pai de docking já dimensionou o painel (`SgPanelDocked`) a porcentagem não é repetida. `minWidthPx`/`minHeightPx` fixam mínimos.
- `scrollable`: `true`/`'auto'`/`'y'` rola na vertical, `'x'` na horizontal, `false`/nulo corta (`ClipRect`). `borderStyle` padrão `dashed` (desenhado por `CustomPainter`).

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `basic/sg_panel.dart`; não confirmado se a semântica dos filhos é suficiente para o conjunto.

## SgScreen

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgScreen` (mesmo nome).

Container estrutural de alto nivel para composicao de telas com area client, fullscreen opcional e suporte a docking.

- Arquivo: `packages/seedgrid_components/lib/src/layout/basic/sg_screen.dart` (linha 11) · classe `class SgScreen extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_screen.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgScreen({...})` com 5 parâmetro(s) nomeado(s), 4 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgScreen

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `children` | `List<Widget>` | `const []` | não | Flutter | `children` no React. |
| `fullscreen` | `bool?` | `true` † | não | React | Define se a tela ocupa toda a viewport. |
| `height` | `Object?` | — | não | React | Altura explicita quando a tela nao for fullscreen. Tipo no React: `string \| number`. |
| `padding` | `Object?` | — | não | React | Espacamento interno aplicado ao root da tela. Tipo no React: `string \| number`. |
| `width` | `Object?` | — | não | React | Largura explicita quando a tela nao for fullscreen. Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `StatelessWidget`, `children` (`List<Widget>`); o `child` do contrato é um getter derivado.
- `fullscreen` (padrão `true`): largura do pai (quando limitada) e altura igual à da **janela** (`MediaQuery.sizeOf`, o `100dvh` do React); `width`/`height` informados vencem. `padding` aceita número, `'Npx'` ou `'Nrem'`.
- O conteúdo passa por `sgDockContent(align: client)`: filhos `SgPanel` com `align` são ancorados, os demais fluem. O corpo é recortado (`ClipRect`).

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `basic/sg_screen.dart`.

## SgGroupBox

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgGroupBox` (mesmo nome).

Container simples com titulo visual para agrupar campos e conteudos relacionados em uma secao delimitada.

- Arquivo: `packages/seedgrid_components/lib/src/layout/basic/sg_group_box.dart` (linha 13) · classe `class SgGroupBox extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_group_box.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgGroupBox({...})` com 4 parâmetro(s) nomeado(s), 4 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgGroupBox

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `title` | `String` | — | sim | React | Titulo exibido no topo da secao agrupada. |
| `child` | `Widget` | — | sim | React | Conteudo agrupado dentro do fieldset. |
| `height` | `Object?` | — | não | React | Altura do bloco de agrupamento. Tipo no React: `string \| number`. |
| `width` | `Object?` | — | não | React | Largura do bloco de agrupamento. Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.
- `className` e `style` não existem no Flutter (2 props do React omitidas de propósito, ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `StatelessWidget`. `title` (`String`, obrigatório) vira a legenda em **caixa alta** sobre a borda; `child` (`Widget`, obrigatório) é o conteúdo (no React, `children`).
- `width` padrão: largura total disponível; `height` sem valor: altura do conteúdo. Ambos aceitam número (px), `'Npx'` ou `'N%'`.
- A legenda "abre" a borda superior (`_FieldsetPainter`), medida depois do primeiro quadro (`GlobalKey`).

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `basic/sg_group_box.dart`; não há equivalente declarado de `fieldset`/`legend` (não confirmado se a legenda é anunciada como rótulo do grupo).

## SgCard

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCard` (mesmo nome).

Container visual para destacar conteudo em blocos com cabecalho, descricao, acoes, rodape e estados colapsaveis.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_card.dart` (linha 71) · classe `class SgCard extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_card.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgCard({...})` com 33 parâmetro(s) nomeado(s), 32 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgCard

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String?` | — | não | Flutter | `id` do elemento HTML; tambem compoe a chave de persistencia da posicao. |
| `actions` | `Widget?` | — | não | React | — |
| `bgColor` | `String?` | — | não | React | — |
| `bgColorFooter` | `String?` | — | não | React | — |
| `bgColorTitle` | `String?` | — | não | React | — |
| `bodyClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `cardStyle` | `SgCardCardStyle` | `SgCardCardStyle.defaultValue` | não | React | Estilo visual da superficie do card. Valores: `default`, `outlined`, `flat`, `elevated`. |
| `clickable` | `bool` | `false` | não | React | Transforma o card em superficie clicavel. |
| `collapseIcon` | `Widget?` | — | não | React | — |
| `collapseIconSize` | `num` | `18` | não | React | — |
| `collapseToggleAlign` | `SgCardCollapseToggleAlign` | `SgCardCollapseToggleAlign.left` | não | React | Valores: `left`, `right`. |
| `collapsible` | `bool` | `false` | não | React | Permite recolher e expandir o conteudo do card. |
| `defaultOpen` | `bool` | `true` | não | React | — |
| `defaultPosition` | `SgCardPosition?` | — | não | React | Tipo no React: `SgCardPosition`. |
| `description` | `Object?` | — | não | React | Descricao ou subtitulo complementar do cabecalho. |
| `disabled` | `bool` | `false` | não | React | — |
| `dragPersistKey` | `String?` | — | não | React | — |
| `draggable` | `bool` | `false` | não | React | `draggable` do React: o cabecalho arrasta o cartao. |
| `footer` | `Widget?` | — | não | React | — |
| `footerClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `header` | `Widget?` | — | não | React | — |
| `headerClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `leading` | `Widget?` | — | não | React | — |
| `onClick` | `VoidCallback?` | — | não | React | Callback disparado quando o card e acionado. Tipo no React: `React.MouseEventHandler<HTMLElement>`. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((open: boolean) => void)`. |
| `onPositionChange` | `ValueChanged<SgCardPosition>?` | — | não | React | Tipo no React: `((position: SgCardPosition) => void)`. |
| `open` | `bool?` | — | não | React | Controlado: se nao for nulo, vale no lugar do estado interno. |
| `size` | `SgCardSize` | `SgCardSize.md` | não | React | Escala geral de espacos e dimensoes do card. Valores: `sm`, `md`, `lg`. |
| `title` | `Object?` | — | não | React | Titulo principal do card. |
| `toggleOnHeaderClick` | `bool` | `true` | não | React | — |
| `trailer` | `Widget?` | — | não | React | — |
| `trailing` | `Widget?` | — | não | React | — |
| `child` | `Widget?` | — | não | React | Conteudo principal exibido dentro do card. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- A posição arrastada (`dragPersistKey`/`id`) é guardada no `SgEnvironmentProvider` ou em `shared_preferences` (como o `localStorage` do React) e lida logo após a montagem.
- `onPositionChange` dispara na montagem, como no React.
- `bodyClassName`, `headerClassName` e `footerClassName` são aceitos sem efeito; `className`/`style` não existem (ADR 50).
- Golden com a fonte de teste do Flutter: sem comparação visual de texto com o React.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onClick` (`VoidCallback?`): só dispara quando o cartão é interativo (`clickable` ou `onClick` informado) **e** não é `collapsible` nem `draggable`; Enter e Espaço também o chamam.
- `onOpenChange` (`ValueChanged<bool>?`): ao recolher/expandir, apenas com `collapsible: true`; é chamado também no modo controlado (`open`).
- `onPositionChange` (`ValueChanged<SgCardPosition>?`): após a montagem (frame seguinte), a cada atualização do arraste e quando uma posição salva é carregada.

**Controller, formulário e estado**
- `open` controlado, ou `defaultOpen` (padrão `true`). `toggleOnHeaderClick` (padrão `true`) decide se tocar no cabeçalho alterna; o botão de seta (`collapseToggleAlign`, `collapseIcon`) sempre alterna.
- `draggable: true`: o **cabeçalho** arrasta o cartão; depois de deslocado ele passa a flutuar no `Overlay` (`OverlayPortal`) para continuar agarrável fora da área dos pais, e volta ao fluxo se retornar à origem.
- Persistência da posição: chave `dragPersistKey` ou `sg-card-pos:<id>` (`id` é extra do Flutter). `SgCardPositionStore` (`read`/`write`/`clear`) guarda em memória do processo; o disco usa `useSgPersistence` quando há `SgEnvironmentProvider` e `SharedPreferences` caso contrário; grava ao soltar (`_dragEnd`) e lê depois de montar, sem sobrescrever se o usuário já moveu.
- `title` e `description` são `Object?` (`String` ou `Widget`).

**Acessibilidade**
- Botão de recolher: `Semantics(button, expanded, label)` com o texto i18n `components.actions.collapse`/`components.actions.expand`.
- Cabeçalho recolhível: `Focus` + `Semantics(button, expanded)`; Enter e Espaço alternam.
- Cartão clicável: `Semantics(button, enabled)` + `Focus`; Enter/Espaço chamam `onClick`.

## SgAccordion

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgAccordion` (mesmo nome).

Container colapsavel por secoes para organizar conteudo em paineis expansivos, verticais ou horizontais.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_accordion.dart` (linha 46) · classe `class SgAccordion extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_accordion.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgAccordion({...})` com 18 parâmetro(s) nomeado(s), 18 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgAccordion

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String?` | — | não | React | `id` do elemento no React. Aceito para cumprir o contrato; sem efeito visual no Flutter. |
| `items` | `List<SgAccordionItem>` | — | sim | React | Colecao de secoes renderizadas pelo accordion. Tipo no React: `SgAccordionItem[]`. |
| `activeIndex` | `List<int>?` | — | não | React | Estado controlado dos paineis abertos. Tipo no React: `number \| number[]`. |
| `animationDuration` | `num` | `220` | não | React | Milissegundos. |
| `collapsible` | `bool` | `true` | não | React | Permite fechar um painel ja ativo. |
| `contentClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `defaultActiveIndex` | `List<int>?` | — | não | React | Estado inicial dos paineis abertos. Tipo no React: `number \| number[]`. |
| `defaultOpenFirst` | `bool` | `true` | não | React | — |
| `headerBackgroundColor` | `String?` | — | não | React | Cor base dos headers do accordion. |
| `headerClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `horizontalHeaderWidth` | `Object?` | `52` | não | React | Largura do cabecalho na horizontal: numero (px) ou `'Npx'`. Tipo no React: `string \| number`. |
| `horizontalMinHeight` | `Object?` | `220` | não | React | Altura minima na horizontal: numero (px) ou `'Npx'`. Tipo no React: `string \| number`. |
| `keepMounted` | `bool` | `true` | não | React | — |
| `multiple` | `bool` | `false` | não | React | Permite manter varios paineis abertos simultaneamente. |
| `onActiveIndexChange` | `ValueChanged<List<int>>?` | — | não | React | Callback disparado quando o conjunto de paineis abertos muda. Tipo no React: `((indexes: number[]) => void)`. |
| `onItemToggle` | `void Function(int index, bool isOpen)?` | — | não | React | Tipo no React: `((index: number, isOpen: boolean) => void)`. |
| `orientation` | `SgAccordionOrientation` | `SgAccordionOrientation.vertical` | não | React | Direcao de expansao dos paineis. Valores: `vertical`, `horizontal`. |
| `panelClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.
- `activeIndex`/`defaultActiveIndex` são sempre `List<int>` (no React aceitam `number | number[]`); um índice único é uma lista de um.
- `className` e `*ClassName` não existem (ADR 50): `contentClassName`, `headerClassName` e `panelClassName` são ignorados; `id` é aceito sem efeito visual.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onActiveIndexChange` (`ValueChanged<List<int>>?`): recebe a lista normalizada de índices abertos a cada alternância (também no modo controlado).
- `onItemToggle` (`void Function(int index, bool isOpen)?`): chamado depois, com o índice e o novo estado do item.

**Controller, formulário e estado**
- Sem controller. `activeIndex` controla de fora; sem ele vale o estado interno iniciado por `defaultActiveIndex` ou, com `defaultOpenFirst` (padrão `true`), pelo primeiro item.
- `multiple` permite vários abertos; `collapsible: false` impede fechar o item aberto; `keepMounted` (padrão `true`) mantém o conteúdo montado quando fechado.
- `orientation` `vertical` (padrão) ou `horizontal` (`horizontalHeaderWidth` 52, `horizontalMinHeight` 220). `SgAccordionItem`: `id`, `title`, `content` (obrigatórios os dois últimos), `disabled`, `icon`, `end` (só vertical), `headerBackgroundColor`.

**Acessibilidade**
- Cabeçalho: `Semantics(button, enabled, expanded)` sobre um `InkWell`.
- Painel fechado: `ExcludeFocus` + `IgnorePointer`; o conteúdo é um `Semantics(container: true)`.
- Teclado do cabeçalho: depende do `InkWell` do Material (Inferência); não há tratamento de tecla próprio em `containers/sg_accordion.dart`.

## SgPageControl

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPageControl` (mesmo nome).

Controle de paginas em abas para alternar entre paineis de conteudo relacionados em uma mesma area da tela.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_page_control.dart` (linha 103) · classe `class SgPageControl extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_page_control.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPageControl({...})` com 19 parâmetro(s) nomeado(s), 18 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgPageControl

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `children` | `List<SgPageControlPage>` | — | sim | Flutter | As paginas (os `children` do React). |
| `activeIndex` | `int?` | — | não | React | Indice ativo em modo controlado. |
| `activePageId` | `String?` | — | não | React | Id da pagina ativa em modo controlado. |
| `ariaLabel` | `String?` | — | não | React | — |
| `defaultActiveIndex` | `int` | `0` | não | React | — |
| `defaultActivePageId` | `String?` | — | não | React | — |
| `emptyMessage` | `Widget?` | — | não | React | Padrao: texto i18n `components.pageControl.empty`. |
| `fullWidthTabs` | `bool` | `false` | não | React | Distribui as abas em larguras iguais a partir do tablet; no celular elas mantem a largura natural e a lista rola. |
| `hiddenPageIds` | `List<String>?` | — | não | React | Tipo no React: `string[]`. |
| `keepMounted` | `bool` | `false` | não | React | Mantem paineis inativos montados no DOM. |
| `keyboardNavigation` | `bool` | `true` | não | React | — |
| `mobilePageControl` | `SgPageControlMobilePageControl` | `SgPageControlMobilePageControl.scroll` | não | React | Comportamento no celular: rolagem horizontal das abas ou troca por um select nativo. Valores: `scroll`, `select`. |
| `onActiveIndexChange` | `void Function(int index, SgPageControlContext context)?` | — | não | React | Tipo no React: `((index: number, context: { pageId: string; page: SgPageControlPageProps; }) => void)`. |
| `onActivePageIdChange` | `void Function(String pageId, SgPageControlContext context)?` | — | não | React | Callback disparado quando a pagina ativa muda. Tipo no React: `((pageId: string, context: { index: number; page: SgPageControlPageProps; }) => void)`. |
| `pageControlStyle` | `SgPageControlPageControlStyle` | `SgPageControlPageControlStyle.underline` | não | React | Estilo visual da lista de abas. Valores: `underline`, `pills`. |
| `panelClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `size` | `SgPageControlSize` | `SgPageControlSize.md` | não | React | Escala visual das abas. Valores: `sm`, `md`, `lg`. |
| `tabClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `tabListClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.
- `children` é uma lista de `SgPageControlPage` (como no React); o `child` do contrato é um getter que devolve a coluna delas.
- Herdado do React: `SgPageControlPage.keepMounted` existe mas não é lido (vale só o `keepMounted` do `SgPageControl`); as setas só movem o foco e Enter/Espaço selecionam.
- `panelClassName`, `tabClassName` e `tabListClassName` são ignorados (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onActiveIndexChange` (`void Function(int index, SgPageControlContext context)?`) e `onActivePageIdChange` (`void Function(String pageId, SgPageControlContext context)?`): chamados juntos ao selecionar uma aba (também no modo controlado). O índice conta só as páginas **visíveis**. `SgPageControlContext` traz `index`, `pageId` e `page`.

**Controller, formulário e estado**
- Ativa por `activePageId` (vence), `activeIndex` ou, sem controle externo, `defaultActivePageId`/`defaultActiveIndex` (padrão 0). Página inexistente ou oculta cai na primeira visível.
- Oculta páginas por `SgPageControlPage.hidden` ou `hiddenPageIds`. O id padrão é `sg-page-control-page-<posição, 1-based>`. `keepMounted` (padrão `false`) mantém os painéis inativos montados.
- `pageControlStyle`: `underline` (padrão) ou `pills`; `size` `sm`/`md`/`lg`. A partir de 768 px de largura `fullWidthTabs` iguala as abas; abaixo disso a lista rola, ou vira um `DropdownButton` com `mobilePageControl: select`.

**Acessibilidade**
- Cada aba usa `Tooltip` (com `hint`), `Semantics(selected/button)` e `FocusNode` próprio; a lista tem `Semantics(label)` com `ariaLabel` ou o texto i18n `components.pageControl.ariaLabel`. O cabeçalho do arquivo registra que o `role` ARIA de abas **não** é usado (o Flutter exigiria `role: tab` em todos os filhos).
- Teclado (`keyboardNavigation`, padrão `true`): setas, Home e End movem o foco entre as abas (circular); Enter e Espaço selecionam. Com `false` as teclas de navegação são consumidas sem efeito.

## SgPageControlPage

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgPageControlPage` (mesmo nome).

Declaracao de uma pagina individual dentro de um SgPageControl, com titulo, hint, icone e conteudo associado.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_page_control.dart` (linha 33) · classe `class SgPageControlPage extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_page_control_page.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgPageControlPage({...})` com 9 parâmetro(s) nomeado(s), 9 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgPageControlPage

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `title` | `Widget` | — | sim | React | Titulo exibido na aba da pagina. |
| `child` | `Widget` | — | sim | React | Conteudo exibido no painel desta pagina. |
| `disabled` | `bool` | `false` | não | React | Desabilita a selecao da pagina. |
| `hidden` | `bool` | `false` | não | React | Oculta a pagina sem remove-la da estrutura. |
| `hint` | `String?` | — | não | React | Descricao curta associada a aba. |
| `icon` | `Widget?` | — | não | React | Icone opcional da aba. |
| `id` | `String?` | — | não | React | Identificador estavel da pagina. |
| `keepMounted` | `bool?` | `false` † | não | React | Sem efeito (igual ao React: so o `keepMounted` do SgPageControl e lido). |
| `tabClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.
- `keepMounted` não é lido (herdado do React: vale o do `SgPageControl`); `tabClassName` é ignorado (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum: é só a declaração de uma página.

**Controller, formulário e estado**
- `StatelessWidget` cujo `build` devolve o próprio `child`; fora de um `SgPageControl` mostra só o conteúdo. Campos: `title` e `child` (obrigatórios), `disabled` (a aba não pode ser selecionada), `hidden`, `hint`, `icon`, `id`.
- `hint` é o tooltip da aba e também o texto da opção no modo `select` quando `title` não é um `Text`.

**Acessibilidade**
- Tratada pelo `SgPageControl` que a contém (tooltip, foco, `Semantics`); ver a seção dele.

## SgExpandablePanel

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgExpandablePanel` (mesmo nome).

Painel expansivel inline ou overlay, com direcao, tamanho, backdrop e comportamento de foco configuraveis.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_expandable_panel.dart` (linha 37) · classe `class SgExpandablePanel extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_expandable_panel.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgExpandablePanel({...})` com 28 parâmetro(s) nomeado(s), 28 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgExpandablePanel

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `child` | `Widget` | — | sim | React | Conteudo principal do painel. |
| `expandTo` | `SgExpandablePanelExpandTo` | — | sim | React | Direcao para a qual o painel se expande. Valores: `top`, `left`, `right`, `bottom`. |
| `animation` | `SgExpandablePanelAnimation?` | — | não | React | Tipo no React: `SgExpandablePanelAnimation`. |
| `ariaLabel` | `String?` | — | não | React | — |
| `bodyClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `border` | `bool` | `true` | não | React | — |
| `closeOnEsc` | `bool` | `true` | não | React | — |
| `closeOnOutsideClick` | `bool?` | — | não | React | Padrao: `true` no modo overlay, `false` no inline. |
| `contentClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `defaultOpen` | `bool` | `false` | não | React | — |
| `elevation` | `SgExpandablePanelElevation` | `SgExpandablePanelElevation.md` | não | React | Valores: `none`, `sm`, `md`, `lg`. |
| `footer` | `Widget?` | — | não | React | — |
| `footerClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `handle` | `Widget?` | — | não | React | — |
| `header` | `Widget?` | — | não | React | — |
| `headerClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `mode` | `SgExpandablePanelMode` | `SgExpandablePanelMode.inline` | não | React | Modo de renderizacao do painel. Valores: `inline`, `overlay`. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Callback disparado ao abrir ou fechar o painel. Tipo no React: `((open: boolean) => void)`. |
| `onSizeChange` | `ValueChanged<double>?` | — | não | React | Recebe o novo tamanho em px (`double`) ao redimensionar. Tipo no React: `((size: number \| string) => void)`. |
| `open` | `bool?` | — | não | React | Controla a abertura do painel. |
| `overlayClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `placement` | `SgExpandablePanelPlacement` | `SgExpandablePanelPlacement.start` | não | React | Valores: `start`, `center`, `end`. |
| `resizable` | `bool` | `false` | não | React | Permite redimensionar o painel. |
| `role` | `SgExpandablePanelRole?` | — | não | React | Valores: `dialog`, `region`. |
| `rounded` | `SgExpandablePanelRounded` | `SgExpandablePanelRounded.lg` | não | React | Valores: `none`, `md`, `lg`, `xl`. |
| `showBackdrop` | `bool` | `true` | não | React | — |
| `size` | `SgExpandablePanelSize?` | — | não | React | Configuracao de tamanho minimo, maximo e padrao. Tipo no React: `SgExpandablePanelSize`. |
| `trapFocus` | `bool?` | — | não | React | Padrao: `true` no modo overlay. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada em `docs/PARIDADE.md` para este componente.
- `mode: overlay` usa o `Overlay` do Flutter (no React, um portal no `body`); `mode: inline` anima a largura/altura do próprio painel.
- `className`/`style` não existem; `bodyClassName`, `contentClassName`, `footerClassName`, `headerClassName` e `overlayClassName` são ignorados (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onOpenChange` (`ValueChanged<bool>?`): no código, `_setOpen` só é chamado pela tecla Esc (`closeOnEsc`, padrão `true`) e pelo toque no fundo (`closeOnOutsideClick`), que existem **apenas no modo `overlay`**. No modo `inline` o widget não tem gatilho interno de abrir/fechar: quem controla é `open`/`defaultOpen` por fora.
- `onSizeChange` (`ValueChanged<double>?`): novo tamanho em px ao redimensionar (`resizable: true`, arrastando a alça de 10 px).

**Controller, formulário e estado**
- `open` controlado, ou `defaultOpen` (padrão `false`). `expandTo` (obrigatório) define a direção; `placement` `start`/`center`/`end`; `size` (`SgExpandablePanelSize`: `min`, `max`, `defaultSize`; padrões de recuo 320 px no eixo x e 280 px no y; mínimo 180/140 px).
- `animation` (`SgExpandablePanelAnimation`: tipo `slide` por padrão, `fade` ou `none`; 180 ms). No `overlay` a saída é animada e o foco volta a quem o tinha antes de abrir.
- Padrões que dependem do modo: `closeOnOutsideClick` e `trapFocus` valem `true` no `overlay` (o código só usa esses dois no overlay).

**Acessibilidade**
- `Semantics(container, explicitChildNodes, label)` com `ariaLabel` ou o texto i18n `components.expandablePanel.ariaLabel`; `role` padrão `dialog` no overlay e `region` no inline (no overlay, `scopesRoute`/`namesRoute`).
- Overlay: `FocusScope` quando `trapFocus`, `Focus(autofocus)` e Esc. Não há atalho de teclado para redimensionar (só arrasto).

## SgCarousel

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCarousel` (mesmo nome).

Componente de navegacao sequencial para colecoes visuais com autoplay, navegadores e indicadores.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_carousel.dart` (linha 23) · classe `class SgCarousel extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_carousel.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgCarousel({...})` com 16 parâmetro(s) nomeado(s), 16 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgCarousel

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `items` | `List<Widget>` | — | sim | React | Colecao de slides renderizados. Tipo no React: `React.ReactNode[]`. |
| `autoPlay` | `bool` | `false` | não | React | Ativa reproducao automatica do carousel. |
| `autoPlayInterval` | `num` | `3000` | não | React | Auto play interval in milliseconds |
| `circular` | `bool` | `true` | não | React | Permite loop continuo dos itens. |
| `customNavigators` | `SgCarouselNavigators?` | — | não | React | Custom render for navigation buttons Tipo no React: `{ prev?: React.ReactNode; next?: React.ReactNode; }`. |
| `gap` | `num` | `16` | não | React | Gap between items in pixels |
| `height` | `Object?` | — | não | React | Height of the carousel container Tipo no React: `string \| number`. |
| `id` | `String?` | — | não | React | Unique identifier for the carousel |
| `itemClassName` | `String?` | — | não | React | Custom class name for items |
| `numScroll` | `num` | `1` | não | React | Quantidade de itens avancados por interacao. |
| `numVisible` | `num` | `1` | não | React | Quantidade de itens visiveis simultaneamente. |
| `onIndexChange` | `ValueChanged<int>?` | — | não | React | Callback when active index changes Tipo no React: `((index: number) => void)`. |
| `orientation` | `SgCarouselOrientation` | `SgCarouselOrientation.horizontal` | não | React | Orientacao do fluxo do carousel. Valores: `vertical`, `horizontal`. |
| `showIndicators` | `bool` | `true` | não | React | Exibe indicadores de pagina. |
| `showNavigators` | `bool` | `true` | não | React | Show navigation buttons |
| `width` | `Object?` | `'100%'` | não | React | Width of the carousel container Tipo no React: `string \| number`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Extras do Flutter:** deslizar o dedo troca de slide (limiar de 40 px ou 300 px/s) e o autoplay pausa enquanto o dedo/ponteiro está sobre o carrossel (no React só o hover pausa).
- No modo vertical os botões e indicadores ocupam 20 px em cima/embaixo e 24 px à direita (toque fora da área do pai não chega).
- Vertical sem `height` usa 300 px (o React colapsaria a 0).
- `itemClassName` é ignorado (ADR 50).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onIndexChange` (`ValueChanged<int>?`): quando o índice ativo muda (índice do primeiro item visível); nunca na montagem.

**Controller, formulário e estado**
- Sem controller nem modo controlado: o índice ativo é interno. `numVisible` e `numScroll` (mínimo 1) definem a janela e o passo; `circular` (padrão `true`) volta ao início/fim.
- `autoPlay` (padrão `false`) com `autoPlayInterval` (3000 ms): cada mudança de slide reinicia o intervalo inteiro. `gap` 16 px; `width` padrão `'100%'`.
- `customNavigators` (`SgCarouselNavigators`: `prev`, `next`) troca os botões; `showNavigators`/`showIndicators` (padrão `true`).

**Acessibilidade**
- Botões anterior/próximo: `Semantics(button, enabled)` (sem rótulo definido no código; não confirmado se os `customNavigators` fornecem um).
- Indicadores: `Semantics(label)` com o texto i18n `components.carousel.goToSlide`.

## SgBreadcrumb

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgBreadcrumb` (mesmo nome).

Navegacao hierarquica compacta para indicar caminho atual e permitir retorno a niveis anteriores.

- Arquivo: `packages/seedgrid_components/lib/src/layout/containers/sg_breadcrumb.dart` (linha 96) · classe `class SgBreadcrumb extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_breadcrumb.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgBreadcrumb({...})` com 13 parâmetro(s) nomeado(s), 13 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgBreadcrumb

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `items` | `List<SgBreadcrumbItem>` | — | sim | React | Lista ordenada de niveis do caminho de navegacao. Tipo no React: `SgBreadcrumbItem[]`. |
| `ariaLabel` | `String?` | — | não | React | — |
| `homeHref` | `String` | `'/'` | não | React | — |
| `homeLabel` | `Widget` | `const Text('Home')` | não | React | O React usa o texto literal `Home` (nao passa pelo i18n). |
| `itemClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `maxItems` | `num?` | — | não | React | Quantidade maxima de itens visiveis antes do colapso. |
| `onNavigate` | `void Function(SgBreadcrumbItem item, int index)?` | — | não | React | Callback disparado ao navegar por um item. Tipo no React: `((item: SgBreadcrumbItem, index: number) => void)`. |
| `overflowBehavior` | `SgBreadcrumbOverflowBehavior` | `SgBreadcrumbOverflowBehavior.collapse` | não | React | Comportamento quando o caminho excede o espaco disponivel. Valores: `collapse`, `scroll`. |
| `overflowLabel` | `String?` | — | não | React | — |
| `separator` | `Object?` | `SgBreadcrumbSeparator.chevron` | não | React | Separador visual entre os niveis. Tipo no React: `string \| number \| bigint \| boolean \| React.ReactElement<unknown, string \| React.JSXElementConstructor<any>> \| Iterable<React.ReactNode> \| React.ReactPortal \| Promise<AwaitedReactNode>`. |
| `showHomeIcon` | `bool` | `false` | não | React | Adiciona um item inicial com icone de home. |
| `size` | `SgBreadcrumbSize` | `SgBreadcrumbSize.md` | não | React | Valores: `sm`, `md`, `lg`. |
| `variant` | `SgBreadcrumbVariant` | `SgBreadcrumbVariant.defaultValue` | não | React | Variante visual do breadcrumb. Valores: `primary`, `default`, `subtle`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Não portado:** a navegação por `href`. Um item com `href` ou `onClick` é clicável e dispara `onClick` e `onNavigate`, mas não abre a URL (não há `url_launcher`); quem navega é o app.
- `itemClassName` é ignorado (ADR 50); `homeLabel` usa o texto literal `Home` (como o React, não passa pelo i18n).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onNavigate` (`void Function(SgBreadcrumbItem item, int index)?`): ao tocar num item clicável (não desabilitado, com `href` ou `onClick`), inclusive pelo menu de colapso; o item **Home** (`showHomeIcon`) usa `index == -1`. O `onClick` do próprio `SgBreadcrumbItem` roda antes.

**Controller, formulário e estado**
- `StatelessWidget`. `items` (obrigatório): `SgBreadcrumbItem` com `id`, `label`, `href`, `icon`, `disabled`, `hidden` (não entra no caminho) e `onClick`.
- Colapso: com `overflowBehavior: collapse` (padrão) e `maxItems >= 2`, mostra o primeiro, um menu "..." (`MenuAnchor`) e os últimos; `scroll` rola na horizontal. `separator` aceita `SgBreadcrumbSeparator` (`slash`, `chevron`, `dot`, `arrow`), o texto do enum ou um `Widget`. `variant` e `size` ajustam o visual.

**Acessibilidade**
- Contêiner: `Semantics(container, label)` com `ariaLabel` ou `components.breadcrumb.ariaLabel`; botão "..." com `Semantics(button, label)` de `overflowLabel`/`components.breadcrumb.overflow`.
- Itens clicáveis: `Semantics(button)` + `InkWell`; o item atual: `Semantics(selected: true)`.

## SgMenu

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgMenu` (mesmo nome).

Componente de navegacao estruturada com suporte a sidebar, drawer, menu inline e variantes hierarquicas ou mega menu.

- Arquivo: `packages/seedgrid_components/lib/src/layout/menu/sg_menu.dart` (linha 41) · classe `class SgMenu extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_menu.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgMenu({...})` com 47 parâmetro(s) nomeado(s), 47 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgMenu

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `menu` | `List<SgMenuNode>` | — | sim | React | Arvore de itens e subitens do menu. Tipo no React: `SgMenuNode[]`. |
| `ariaLabel` | `String?` | — | não | React | — |
| `border` | `bool` | `true` | não | React | — |
| `brand` | `SgMenuBrand?` | — | não | React | Bloco de marca no topo do menu. Tipo no React: `SgMenuBrand`. |
| `closeOnNavigate` | `bool?` | — | não | React | Padrao: `true`. |
| `collapsed` | `bool?` | — | não | React | Controla o estado colapsado do menu. |
| `collapsedWidth` | `Object?` | `72` | não | React | Numero (px) ou texto (`'72px'`, `'20%'`). Tipo no React: `string \| number`. |
| `defaultCollapsed` | `bool` | `false` | não | React | — |
| `defaultExpandedIds` | `List<String>` | `const []` | não | React | Tipo no React: `string[]`. |
| `defaultOpen` | `bool` | `false` | não | React | — |
| `defaultPinned` | `bool` | `false` | não | React | — |
| `density` | `SgMenuDensity` | `SgMenuDensity.comfortable` | não | React | Valores: `compact`, `comfortable`. |
| `dockable` | `bool` | `false` | não | React | — |
| `dockZone` | `SgDockZoneId?` | — | não | React | Valores: `top`, `left`, `right`, `bottom`, `free`. |
| `draggable` | `bool` | `false` | não | React | — |
| `elevation` | `SgMenuElevation` | `SgMenuElevation.none` | não | React | Valores: `none`, `sm`, `md`. |
| `expandedIds` | `List<String>?` | — | não | React | Tipo no React: `string[]`. |
| `expandedWidth` | `Object?` | `280` | não | React | Tipo no React: `string \| number`. |
| `footer` | `Widget?` | — | não | React | — |
| `id` | `String?` | — | não | React | Chave do estado persistido do recolhimento (`sg-menu:<id>:collapsed`) e id do encaixe. |
| `indent` | `num` | `16` | não | React | — |
| `keyboardNavigation` | `bool` | `true` | não | React | — |
| `menuStyle` | `SgMenuMenuStyle` | `SgMenuMenuStyle.sidebar` | não | React | Modo estrutural do menu. Valores: `inline`, `sidebar`, `drawer`, `hybrid`. |
| `menuVariantStyle` | `SgMenuMenuVariantStyle` | `SgMenuMenuVariantStyle.panel` | não | React | Variante visual e comportamental do menu. Valores: `panel`, `tiered`, `mega-horizontal`, `mega-vertical`, `PanelMenu`, `Tiered`, `MegaMenuHorizontal`, `MegaMenuVertical`. |
| `mode` | `SgMenuMode` | `SgMenuMode.multiple` | não | React | Valores: `multiple`, `accordion`. |
| `onAction` | `void Function(SgMenuNode node)?` | — | não | React | Tipo no React: `((node: SgMenuNode) => void)`. |
| `onCollapsedChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((value: boolean) => void)`. |
| `onExpandedIdsChange` | `ValueChanged<List<String>>?` | — | não | React | Tipo no React: `((ids: string[]) => void)`. |
| `onItemClick` | `void Function(SgMenuNode node)?` | — | não | React | Tipo no React: `((node: SgMenuNode) => void)`. |
| `onNavigate` | `void Function(SgMenuNode node)?` | — | não | React | Callback disparado na navegacao por um item. Tipo no React: `((node: SgMenuNode) => void)`. |
| `onOpenChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((value: boolean) => void)`. |
| `onPinnedChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((value: boolean) => void)`. |
| `open` | `bool?` | — | não | React | Controlado (drawer/hybrid). |
| `openSubmenuOnHover` | `bool` | `false` | não | React | — |
| `orientationDirection` | `SgMenuOrientationDirection?` | — | não | React | Valores: `horizontal-left`, `horizontal-right`, `vertical-up`, `vertical-top`, `vertical-down`. |
| `overlayBackdrop` | `bool?` | — | não | React | Padrao: `true` no drawer. |
| `overlaySize` | `SgExpandablePanelSize?` | — | não | React | Tipo no React: `SgExpandablePanelSize`. |
| `pinned` | `bool?` | — | não | React | — |
| `position` | `SgMenuPosition` | `SgMenuPosition.left` | não | React | Valores: `left`, `right`. |
| `search` | `SgMenuSearch?` | — | não | React | Configuracao opcional de busca integrada. Tipo no React: `{ enabled: boolean; placeholder?: string; }`. |
| `selection` | `SgMenuSelection?` | — | não | React | Selecao ativa por id ou url. Tipo no React: `SgMenuSelection`. |
| `showCollapseButton` | `bool` | `false` | não | React | — |
| `showPinButton` | `bool` | `false` | não | React | — |
| `user` | `SgMenuUser?` | — | não | React | Bloco de usuario exibido no menu. Tipo no React: `SgMenuUser`. |
| `userMenu` | `List<SgMenuNode>?` | — | não | React | Tipo no React: `SgMenuNode[]`. |
| `userSectionClassName` | `String?` | — | não | React | Sem efeito: `className` nao existe no Flutter (ADR 50). |
| `userSectionStyle` | `Object?` | — | não | React | Sem efeito: `style` nao existe no Flutter (ADR 50). Tipo no React: `React.CSSProperties`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Não portado:** a navegação própria. O React faz `window.location.assign(url)`; aqui só se chama `onNavigate`.
- Motor próprio (widgets + `Overlay`), sem `MenuAnchor`/`MenuBar` do Material.
- `brand.imageSrc` e `user.avatarSrc` são URLs de rede.
- `className`, `style`, `userSectionClassName` e `userSectionStyle` são aceitos sem efeito (ADR 50).
- `collapsedWidth`/`expandedWidth` aceitam px, %, rem, vw/vh e `calc()`.
- Encaixe (`dockable`): não há portal; o widget se registra no `SgDockLayout` mas quem o coloca dentro do `SgDockZone` é o app.
- A dica (`hint`) aparece sempre abaixo do item (o React a põe à direita).
- No trilho recolhido do modo híbrido o botão de fixar fica cortado, igual ao React (72 px, botões de 32 px que não encolhem e `aside` com overflow oculto).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onItemClick(SgMenuNode)`: toda ativação de item habilitado (antes de navegar). `onNavigate(SgMenuNode)`: se o nó tem `url` não vazia; o menu não navega sozinho.
- `onAction(SgMenuNode)`: só quando o nó tem `onClick`, logo depois de executá-lo. Também existem `SgMenuNode.onClick`, `SgMenuBrand.onClick` e `SgMenuUser.onClick`.
- Estado: `onExpandedIdsChange(List<String>)`, `onCollapsedChange(bool)`, `onOpenChange(bool)` (drawer/híbrido), `onPinnedChange(bool)`.

**Controller, formulário e estado**
- Sem controller. Cada estado tem versão controlada e inicial: `expandedIds`/`defaultExpandedIds`, `collapsed`/`defaultCollapsed`, `open`/`defaultOpen`, `pinned`/`defaultPinned`. O item ativo vem de `selection` (`SgMenuSelection(activeId, activeUrl)`) ou do último clicado.
- `menuStyle`: `inline`, `sidebar` (padrão), `drawer`, `hybrid`; `menuVariantStyle`: `panel` (árvore, padrão), `tiered` (submenus em cascata, abre por clique ou por hover com `openSubmenuOnHover`), `mega-horizontal`, `mega-vertical` (o contrato aceita ainda quatro nomes alternativos, listados na tabela acima, que o código normaliza para estes). `mode`: `multiple` ou `accordion`.
- Abaixo de 600 px (`kSgSelectNarrowWidth`) o `tiered` vira árvore e o `mega` empilha; `drawer`/`hybrid` já usam painel lateral (`SgExpandablePanel` em overlay).
- Persistência: com `id` e `collapsed` não controlado, o recolhimento é guardado em `sg-menu:<id>:collapsed` por `SgPersistentState` (`SgEnvironmentProvider` ou `SharedPreferences`). `dockable`/`dockZone`/`draggable` registram o menu no `SgDockLayout` mais próximo (`registerToolbar`).
- `search` (`SgMenuSearch(enabled, placeholder)`), `brand`, `user`, `userMenu`, `footer`, `showCollapseButton`, `showPinButton`.

**Acessibilidade**
- Região de navegação com `Semantics(label)` de `ariaLabel` ou `components.menu.ariaLabel`; itens, botões e cabeçalhos usam `Semantics` e um `FocusNode` por item.
- Teclado (`keyboardNavigation`, padrão `true`): setas, Enter e Espaço via `resolveMenuKeyboardAction` (mesmas regras do React).
- `hint`: `Tooltip` do Material (hover ou pressionar); com o menu recolhido o `label` vira a dica.

## SgTreeView

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgTreeView` (mesmo nome).

Navegacao hierarquica para estruturas em arvore com expansao, selecao, busca, checkboxes e suporte a dados aninhados.

- Arquivo: `packages/seedgrid_components/lib/src/layout/tree/sg_tree_view.dart` (linha 63) · classe `class SgTreeView extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_tree_view.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgTreeView({...})` com 31 parâmetro(s) nomeado(s), 29 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgTreeView

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `nodes` | `List<SgTreeNode>` | — | sim | React | Lista hierarquica de nos exibidos pela arvore. Tipo no React: `SgTreeNode[]`. |
| `size` | `SgTreeViewSize` | `SgTreeViewSize.md` | não | React | Escala visual da arvore e dos itens. Valores: `sm`, `md`, `lg`. |
| `density` | `SgTreeViewDensity` | `SgTreeViewDensity.normal` | não | React | Valores: `compact`, `comfortable`, `normal`. |
| `tone` | `SgTreeViewTone` | `SgTreeViewTone.defaultValue` | não | React | Valores: `default`, `muted`. |
| `iconTone` | `SgTreeViewIconTone` | `SgTreeViewIconTone.defaultValue` | não | React | Valores: `primary`, `default`. |
| `checkable` | `bool` | `false` | não | React | — |
| `checkMode` | `SgTreeViewCheckMode` | `SgTreeViewCheckMode.live` | não | React | Valores: `live`, `confirm`. |
| `confirmSelection` | `SgTreeViewConfirmSelection` | `SgTreeViewConfirmSelection.leafOnly` | não | React | Valores: `all`, `leafOnly`. |
| `checkedIds` | `List<String>?` | — | não | React | Nos marcados em cenarios de checkbox tree. Tipo no React: `string[]`. |
| `defaultCheckedIds` | `List<String>?` | — | não | React | Tipo no React: `string[]`. |
| `onCheckedChange` | `ValueChanged<List<String>>?` | — | não | React | Tipo no React: `((ids: string[]) => void)`. |
| `checkableLabel` | `String?` | — | não | React | Cabecalho da coluna do checkbox principal -- so' e' desenhado quando `tracks` tambem esta' presente (e' o cabecalho de colunas como um todo que fica ambiguo com 2+ controles por linha, nao o checkbox sozinho). |
| `tracks` | `List<SgTreeTrack>?` | — | não | React | Trilhas de selecao extras, uma por coluna de controle na linha -- ver SgTreeTrack. Tipo no React: `SgTreeTrack[]`. |
| `expandedIds` | `List<String>?` | — | não | React | Tipo no React: `string[]`. |
| `defaultExpandedIds` | `List<String>?` | — | não | React | Tipo no React: `string[]`. |
| `onExpandedChange` | `ValueChanged<List<String>>?` | — | não | React | Tipo no React: `((ids: string[]) => void)`. |
| `onExpand` | `ValueChanged<SgTreeNode>?` | — | não | React | Tipo no React: `((node: SgTreeNode) => void)`. |
| `onCollapse` | `ValueChanged<SgTreeNode>?` | — | não | React | Tipo no React: `((node: SgTreeNode) => void)`. |
| `onLeafClick` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((id: string) => void)`. |
| `branchLabelBehavior` | `SgTreeViewBranchLabelBehavior` | `SgTreeViewBranchLabelBehavior.toggle` | não | React | Valores: `none`, `toggle`. |
| `searchable` | `bool` | `false` | não | React | Habilita campo interno de busca para filtrar nos. |
| `searchPlaceholder` | `String?` | — | não | React | — |
| `searchValue` | `String?` | — | não | React | — |
| `defaultSearchValue` | `String?` | — | não | React | — |
| `onSearchChange` | `ValueChanged<String>?` | — | não | React | Tipo no React: `((v: string) => void)`. |
| `expandMatchesOnSearch` | `bool` | `true` | não | React | — |
| `confirmBar` | `SgTreeConfirmBar?` | — | não | React | `null` = `false` do React (sem barra). Tipo no React: `SgTreeConfirmBar`. |
| `emptyText` | `String?` | — | não | React | — |
| `maxHeightClassName` | `String?` | `max-h-[60vh]` † | não | React | Classe Tailwind do React (`max-h-[60vh]`): sem efeito no Flutter; use [maxHeight]. |
| `maxHeight` | `double?` | — | não | Flutter | Altura maxima, em px, da area que rola. Padrao: 60% da altura da tela (o `max-h-[60vh]` do React). |
| `controller` | `SgTreeViewController?` | — | não | Flutter | `ref` do React. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Extra do Flutter:** a lista focada aceita setas, Home/End, Enter, Espaço e `*` (o React não tem navegação por teclado própria).
- A lista é **virtualizada** (`ListView.builder` com extensão fixa); no React todas as linhas ficam no DOM.
- `maxHeightClassName` (classe Tailwind) é aceito sem efeito; use `maxHeight` (px, padrão 60% da altura da tela).
- `SgTreeConfirmBar.sticky` não tem efeito (a barra do Flutter fica sempre fora da área que rola).
- Layout de celular próprio (busca em linha, barra empilhada).
- Medição registrada: com 10.100 nós em debug de teste, primeira construção 142 ms, 19 linhas construídas, quadro de rolagem médio 59,6 ms (release, dispositivo e GPU não medidos).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onCheckedChange(List<String>)` (modo `live`; no modo `confirm` a seleção fica pendente), `onExpandedChange(List<String>)`, `onExpand(SgTreeNode)`, `onCollapse(SgTreeNode)`, `onLeafClick(String id)` (toque no rótulo de folha), `onSearchChange(String)`.
- `SgTreeConfirmBar`: `onConfirm(List<String>)` (folhas por padrão, `confirmSelection: leafOnly`) e `onCancel`. Trilhas: `SgTreeTrackBoolean.onCheckedChange(List<String>)` e `SgTreeTrackEnum.onChange(Map<String, String?>)`.

**Controller, formulário e estado**
- `SgTreeViewController` (o `ref` do React): `getCheckedIds`, `getCheckedLeafIds`, `setCheckedIds`, `getExpandedIds`, `setExpandedIds`, `expandAll`, `collapseAll`, `clearChecked`.
- Controlados e iniciais: `checkedIds`/`defaultCheckedIds`, `expandedIds`/`defaultExpandedIds`, `searchValue`/`defaultSearchValue`. `checkMode` `live` (padrão) ou `confirm` (usa `confirmBar`); `expandMatchesOnSearch` (padrão `true`); `branchLabelBehavior` `toggle` (padrão; tocar no rótulo de um ramo o expande/recolhe) ou `none`.
- `tracks`: colunas extras (`SgTreeTrackBoolean`, `SgTreeTrackEnum`, `SgTreeTrackCustom`), largura CSS (padrão 110 px). Dados em JSON: `sgTreeFromJson` / `sgTreeFromJsonWithChecked` com um `SgTreeIconRegistry`.

**Acessibilidade**
- Caixas de seleção: `Semantics(label, checked, mixed)`; rótulo do nó: `Semantics(button, enabled)`; trilhas: `Semantics(label)` com `ariaLabel`, `label` ou `id`. Não há `Semantics` de árvore (papel `tree`) explícito: não confirmado.
- Teclado (lista focada): ↑/↓, Home/End movem; → expande (ou desce) e ← recolhe (ou sobe ao pai); Enter ativa o rótulo; Espaço marca; `*` expande o ramo inteiro.

## SgDockLayout

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDockLayout` (mesmo nome).

Layout estrutural com zonas de dock e persistencia de estado para barras e paines arrastaveis.

- Arquivo: `packages/seedgrid_components/lib/src/layout/dock/sg_dock_layout.dart` (linha 413) · classe `class SgDockLayout extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_dock_layout.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDockLayout({...})` com 4 parâmetro(s) nomeado(s), 3 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgDockLayout

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador do layout usado para persistencia e coordenacao interna. |
| `child` | `Widget` | — | sim | React | Zonas, toolbars e conteudo estrutural do layout. |
| `defaultState` | `SgDockLayoutState?` | — | não | React | Estado inicial das toolbars e zonas do layout. Tipo no React: `SgDockLayoutState`. |
| `store` | `SgDockLayoutStore?` | — | não | Flutter | Persistencia do estado (no React, `useSgPersistentState`). Nulo = so em memoria. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React o `SgDockLayout` guarda o estado das toolbars encaixáveis (não é motor de layout) e não há divisores arrastáveis.
- A persistência é plugável por `SgDockLayoutStore` (sem `store`, só em memória).
- A toolbar se registra por `registerToolbar(id, key)` em vez de ser achada pelo DOM.
- `className` e `style` não existem. Golden com a fonte de teste do Flutter.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum callback no widget. As mudanças são observadas no `SgDockLayoutController` (`ChangeNotifier`).

**Controller, formulário e estado**
- `SgDockLayout.maybeOf(context)` (ouve mudanças), `SgDockLayout.maybeReadOf(context)` (não ouve) e `useSgDockLayout(context)` devolvem o `SgDockLayoutController`, ou `null` fora do layout.
- O controller guarda `SgDockLayoutState` (por toolbar: `zone`, `collapsed`, `orientation`, `order`) e expõe `registerZone`, `registerToolbar`, `getZoneAtPoint`, `getToolbarZone`, `getToolbarOrder`, `placeToolbar(id, zone, index)`, `moveToolbar(id, zone)`, `getToolbarCollapsed`, `setToolbarCollapsed`, `getZoneToolbarCount`, e o estado de arraste (`isDropPreviewActive`, `draggingToolbarId`, `dropIndicator`).
- `defaultState` define o estado inicial. `store` (`SgDockLayoutStore`: `load(key)` e `save(key, state)`) persiste; a chave é `dock-layout:<id>`. O pacote **não traz implementação** de `SgDockLayoutStore` (busca em `lib/`): quem quiser persistir implementa a interface.
- Soltar o ponteiro (`onPointerUp`/`onPointerCancel`) ou o app sair de `resumed` cancela a prévia de soltura.

**Acessibilidade**
- Nenhum `Semantics` explícito encontrado em `dock/sg_dock_layout.dart`; o widget só provê o contexto.

## SgDockZone

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDockZone` (mesmo nome).

Regiao nomeada dentro de um dock layout usada para alojar toolbars e conteudo por zona.

- Arquivo: `packages/seedgrid_components/lib/src/layout/dock/sg_dock_zone.dart` (linha 18) · classe `class SgDockZone extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_dock_zone.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDockZone({...})` com 5 parâmetro(s) nomeado(s), 2 do contrato React e 3 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgDockZone

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `zone` | `SgDockZoneId` | — | sim | React | Identificador da zona dentro do dock layout. Valores: `top`, `left`, `right`, `bottom`, `free`. |
| `child` | `Widget?` | — | não | React | Conteudo renderizado dentro da zona. |
| `children` | `List<Widget>?` | — | não | Flutter | Varios filhos; tem precedencia sobre [child]. |
| `width` | `double?` | — | não | Flutter | Largura fixa da zona (px). O React usa classes (`w-44`). |
| `height` | `double?` | — | não | Flutter | Altura fixa da zona (px). O React usa classes (`h-20`). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React o `SgDockLayout` guarda o estado das toolbars (não é motor de layout) e não há divisores arrastáveis.
- A posição da zona não vem de classes CSS: quem a coloca (`SgDockScreen` ou um `Stack` com `Positioned`) decide onde ela fica.
- Extras do Flutter: `children` (vários filhos, como no React), `width` e `height` (px).
- `className` e `style` não existem; persistência por `SgDockLayoutStore` plugável.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `zone` (obrigatório, `SgDockZoneId`: `top`, `bottom`, `left`, `right`, `free`). `children` tem precedência sobre `child`; `width`/`height` fixam o tamanho em px.
- Registra-se no `SgDockLayout` mais próximo (`registerZone`) para receber toolbars arrastadas. Durante o arraste desenha encaixes tracejados (`sg-dock-slot-<i>`, texto `><`) e destaca o ativo. Fora de um `SgDockLayout` funciona como contêiner comum.

**Acessibilidade**
- `Semantics(container: true, identifier: 'sg-dock-zone-<zona>')` (`dock/sg_dock_zone.dart`); sem rótulo falado.

## SgDockScreen

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgDockScreen` (mesmo nome).

Componente de conveniencia que combina SgScreen e SgDockLayout em uma unica raiz estrutural.

- Arquivo: `packages/seedgrid_components/lib/src/layout/dock/sg_dock_screen.dart` (linha 21) · classe `class SgDockScreen extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_dock_screen.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgDockScreen({...})` com 11 parâmetro(s) nomeado(s), 9 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgDockScreen

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador do dock layout interno. |
| `screenId` | `String?` | — | não | React | ID opcional do elemento raiz de screen. |
| `defaultState` | `SgDockLayoutState?` | — | não | React | Estado inicial das toolbars e zonas internas. Tipo no React: `SgDockLayoutState`. |
| `layoutClassName` | `String?` | — | não | React | Classes adicionais aplicadas ao layout interno de dock. |
| `fullscreen` | `bool?` | `true` | não | React | Quando ativo, a screen ocupa a viewport inteira. |
| `width` | `Object?` | — | não | React | Numero (px) ou texto (`'12px'`, `'1rem'`). Tipo no React: `string \| number`. |
| `height` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `padding` | `Object?` | — | não | React | Tipo no React: `string \| number`. |
| `child` | `Widget?` | — | não | React | Zonas e conteudo estrutural do dock screen. |
| `children` | `List<Widget>?` | — | não | Flutter | — |
| `store` | `SgDockLayoutStore?` | — | não | Flutter | Persistencia do estado do layout (ver [SgDockLayout.store]). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React o `SgDockLayout` guarda o estado das toolbars (não é motor de layout) e não há divisores arrastáveis.
- **Não portado:** `layoutClassName` (classe CSS que troca a grade) não existe e é ignorado; filhos que não são `SgDockZone` vão para a célula central (o CSS os poria na primeira célula livre).
- Persistência por `SgDockLayoutStore` plugável, repassada ao `SgDockLayout` interno.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- Nenhum.

**Controller, formulário e estado**
- `id` (obrigatório) é o id do `SgDockLayout` interno (chave de persistência); `screenId` identifica a raiz; `defaultState` e `store` são repassados ao layout.
- Grade fixa `[12rem 1fr 12rem] x [auto 1fr auto]` (`kSgDockSideColumn` = 192 px): `top` e `bottom` ocupam as 3 colunas, `left`/`right` as laterais e `free` o centro (`dock/sg_dock_screen.dart`).
- `fullscreen` (padrão `true`): largura 100% e altura da janela, como o `SgScreen`; `width`/`height`/`padding` aceitam número, `'Npx'`, `'Nrem'` e `'Nem'` (`toSpacePx`). `children` (lista) ou `child`.

**Acessibilidade**
- `Semantics(identifier: screenId, container: screenId != null)`; fora isso, nenhum `Semantics` explícito (as zonas têm o seu, ver `SgDockZone`).

## SgToolBar

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgToolBar` (mesmo nome).

Barra de ferramentas para agrupar acoes frequentes com suporte a orientacao, colapso, arraste e encaixe em zonas de layout.

- Arquivo: `packages/seedgrid_components/lib/src/layout/menu/sg_tool_bar.dart` (linha 50) · classe `class SgToolBar extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_tool_bar.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgToolBar({...})` com 18 parâmetro(s) nomeado(s), 16 do contrato React e 2 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgToolBar

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `id` | `String` | — | sim | React | Identificador estavel da toolbar. |
| `bgColor` | `String?` | — | não | React | Cor de fundo (texto CSS: `#hex`, `rgb()`, `hsl()` ou valor de token). |
| `bgColorTitle` | `String?` | — | não | React | — |
| `buttonsPerDirection` | `num?` | — | não | React | Quantidade de botoes distribuidos por direcao. |
| `child` | `Widget?` | — | não | React | Botoes e elementos de acao da toolbar. |
| `children` | `List<Widget>?` | — | não | Flutter | Varios filhos (extra do Flutter: o React recebe varios `children`); tem precedencia sobre [child]. |
| `collapsed` | `bool?` | — | não | React | Controlado: se nao for nulo, vale no lugar do estado interno (e do estado do dock). |
| `collapsible` | `bool` | `true` | não | React | Permite recolher a toolbar. |
| `defaultCollapsed` | `bool` | `false` | não | React | — |
| `defaultPosition` | `Offset?` | — | não | React | Posicao inicial do arraste livre (`{ x, y }` do React). Tipo no React: `{ x: number; y: number; }`. |
| `dockZone` | `SgToolBarDockZone` | `SgToolBarDockZone.free` | não | React | Zona de encaixe da toolbar. Valores: `top`, `left`, `right`, `bottom`, `free`. |
| `draggable` | `bool` | `false` | não | React | Permite arrastar a toolbar. |
| `freeDrag` | `bool` | `false` | não | React | — |
| `onCollapsedChange` | `ValueChanged<bool>?` | — | não | React | Tipo no React: `((collapsed: boolean) => void)`. |
| `orientationDirection` | `SgToolBarOrientationDirection?` | — | não | React | Direcao e orientacao da toolbar. Valores: `horizontal-left`, `horizontal-right`, `vertical-up`, `vertical-down`. |
| `size` | `SgToolBarSize?` | — | não | React | Tipo no React: `SgToolBarSize`. |
| `title` | `Widget?` | — | não | React | Titulo opcional exibido na barra. |
| `overflow` | `bool` | `false` | não | Flutter | EXTENSAO do Flutter (o React nao tem): itens que nao cabem vao para o menu "...". |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `className` e `style` não têm efeito (ADR 50).
- **Não portado:** o portal do encaixe. A toolbar se registra no `SgDockLayout` (zona, ordem, recolhida, arraste e soltura atualizam o estado), mas quem a coloca dentro do `SgDockZone` é o app; zonas horizontais mostram o conteúdo em linha.
- `freeDrag` fora de um `Stack` vira translação a partir do lugar natural (não há `position: fixed`).
- `size` é `SgToolBarSize`, `defaultPosition` é `Offset` e as cores (`bgColor`, `bgColorTitle`) são texto CSS.
- **Extras do Flutter:** `children` (lista) ao lado de `child` e `overflow` (itens que não cabem vão para um menu "..." feito com `SgMenu`, painel inferior abaixo de 600 px).

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onCollapsedChange` (`ValueChanged<bool>?`): ao recolher/expandir (também no modo controlado).

**Controller, formulário e estado**
- `id` (obrigatório) é a chave do dock e da posição salva. `collapsed` controla de fora (e o estado do dock também vale); `defaultCollapsed` e `collapsible` (padrão `true`).
- `draggable` (padrão `false`) habilita o arraste: dentro de um `SgDockLayout` move entre zonas (prévia de soltura, `placeToolbar`); com `freeDrag` a posição é livre (`Positioned` num `Stack`, senão translação), começa em `defaultPosition` e é salva em `sg-toolbar-pos:<id>` por `SgPersistentState`.
- `dockZone` (padrão `free`), `orientationDirection`, `buttonsPerDirection` (grade; só números finitos > 0), `size`, `title`, `overflow` (padrão `false`). O app lê a zona atual em `SgDockLayout.maybeOf(context)?.getToolbarZone(id)`.

**Acessibilidade**
- Botão de recolher: `Semantics` com o texto i18n `components.toolbar.toggle`. Itens escondidos pelo `overflow` saem da árvore semântica (`visitChildrenForSemantics`) e reaparecem no menu "..." com `label ?? hint`.
- Os botões internos (`SgToolbarIconButton`) cuidam do próprio foco e rótulo.

## SgToolbarIconButton

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgToolbarIconButton` (mesmo nome).

Botao compacto para toolbars com icone, label opcional, hint, loading e severidade visual.

- Arquivo: `packages/seedgrid_components/lib/src/layout/menu/sg_toolbar_icon_button.dart` (linha 73) · classe `class SgToolbarIconButton extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_toolbar_icon_button.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgToolbarIconButton({...})` com 9 parâmetro(s) nomeado(s), 9 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgToolbarIconButton

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `disabled` | `bool` | `false` | não | React | Desabilita interacao. |
| `hideLabel` | `bool` | `false` | não | React | Esconde o rotulo e a dica (a toolbar usa quando esta recolhida/compacta). |
| `hint` | `String?` | — | não | React | Texto auxiliar usado como dica contextual. |
| `icon` | `Widget?` | — | não | React | Icone principal exibido no botao. |
| `label` | `String?` | — | não | React | Rotulo textual da acao. |
| `loading` | `bool` | `false` | não | React | Indica processamento em andamento. |
| `onClick` | `FutureOr<void> Function()?` | — | não | React | Callback executado ao clicar no item. Tipo no React: `(() => void \| Promise<void>)`. |
| `severity` | `SgToolbarIconButtonSeverity` | `SgToolbarIconButtonSeverity.plain` | não | React | Tom visual do botao de toolbar. Valores: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`. |
| `showLabel` | `bool` | `true` | não | React | Exibe o rotulo junto do icone quando suportado pela toolbar. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `icon` é um `Widget` (não texto nem nome de ícone); para o texto curto do React passe `Text('AB')`.
- A tabela de paridade diz "dica sempre abaixo", mas o código (`_updateHintPosition`, `menu/sg_toolbar_icon_button.dart`) posiciona a dica acima ou abaixo da toolbar horizontal (acima quando a toolbar está a mais de 80 px do topo) e à direita da vertical, como o React. Vale o código; o registro de paridade está desatualizado neste ponto.
- As severidades `success` e `warning` usam `--accent` (não existe `--tertiary` no tema).
- `showLabel` segue o **código** do React (padrão `true`), não o meta (`false`).
- `onClick` pode ser assíncrono e mostra o indicador de carregamento.

### Eventos, controllers e acessibilidade

**Eventos e callbacks**
- `onClick` (`FutureOr<void> Function()?`): chamado ao tocar, ou com Enter/Espaço; ignorado se `disabled` ou carregando. Se devolver um `Future`, o botão fica em carregamento (`sg-toolbar-spinner`) até ele terminar.

**Controller, formulário e estado**
- `StatefulWidget` sem controller. Lê o `SgToolbarScope` (orientação e chave da `SgToolBar` que o contém; fora de uma toolbar vale `vertical`).
- `loading` (externo), `disabled`, `severity` (padrão `plain`; `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, `plain`), `label`, `showLabel` (padrão `true`), `hideLabel` (esconde rótulo e dica; a toolbar usa ao recolher).
- `hint`: balão próprio (`OverlayPortal`) ao passar o mouse, só se `hint != null` e `!hideLabel`.

**Acessibilidade**
- `Semantics(label: hint ?? label)`; `Focus` só quando habilitado, e Enter/Espaço ativam o botão. A dica **não** usa o `Tooltip` do Material.
