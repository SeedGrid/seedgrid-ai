---
description: "API Flutter de Gadgets (relógio, calendário, gauges, QR): construtor, parâmetros com tipo e padrão, origem (React ou extra do Flutter), diferenças do React, callbacks, controllers e acessibilidade de cada widget."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, gadgets, api]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# API — Gadgets (relógio, calendário, gauges, QR) (Flutter)

> **Plataforma: Flutter.** API Dart do grupo; a API React equivalente está em [[SeedGrid/SeedGrid-components/gadgets/API|API — Gadgets (relógio, calendário, gauges, QR) (React)]]. Visão geral: [[SeedGrid/SeedGrid-components/flutter/gadgets/Visao-geral|Visão geral (Flutter)]] · exemplos: [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos|Exemplos (Flutter)]].

> **Como ler as tabelas.** Extraídas por script do código Dart: o **tipo** é o do campo `final` do widget; o **padrão** é o do construtor (`this.x = valor`) e, quando o construtor não declara, o do contrato gerado do React (marcado com †); **Origem** = `React` (prop do contrato, nome e valores iguais aos do React; ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]) ou `Flutter` (extra do Dart, como `controller`, `onClick`, `child`). Descrições: contrato gerado (texto original, sem acento quando assim na fonte) ou comentário `///` do widget. Valores de enum aparecem na descrição como o React os escreve; no Dart são os enums de `generated/enums.g.dart` (ex.: `SgSeverity.primary` ↔ `'primary'`).

## SgCalendar

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgCalendar` (mesmo nome).

Calendario mensal em formato de gadget com suporte a locale, multi-mes, regras de selecao e card configuravel.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/calendar/sg_calendar.dart` (linha 68) · classe `class SgCalendar extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_calendar.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgCalendar({...})` com 20 parâmetro(s) nomeado(s), 19 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgCalendar

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `Object?` | — | não | React | Data selecionada de forma controlada. Tipo no React: `string \| Date`. |
| `defaultValue` | `Object?` | — | não | React | Data inicial quando nao ha `value` (nao sai no contrato gerado; ver o topo do arquivo). Tipo no React: `((string \| number \| readonly string[]) & (string \| Date))`. |
| `onValueChange` | `ValueChanged<DateTime>?` | — | não | React | Callback disparado ao selecionar uma data. Tipo no React: `((date: Date) => void)`. |
| `viewDate` | `Object?` | — | não | React | Mes visivel de forma controlada. Tipo no React: `string \| Date`. |
| `defaultViewDate` | `Object?` | — | não | React | Tipo no React: `string \| Date`. |
| `onViewDateChange` | `ValueChanged<DateTime>?` | — | não | React | Tipo no React: `((viewDate: Date) => void)`. |
| `locale` | `String` | `'pt-BR'` | não | React | Locale usado para formatacao de mes e dias. |
| `weekStartsOn` | `num` | `0` | não | React | Primeiro dia da semana. Tipo no React: `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`. |
| `weekdayFormat` | `SgCalendarWeekdayFormat` | `SgCalendarWeekdayFormat.narrow` | não | React | Valores: `narrow`, `short`, `long`. |
| `numberOfMonths` | `num` | `1` | não | React | Quantidade de meses visiveis ao mesmo tempo. |
| `monthsPerLine` | `num` | `3` | não | React | — |
| `monthMinWidth` | `Object?` | — | não | React | Numero (px) ou texto (`'320px'`, `'20rem'`). Padrao: 332 px (1 coluna) ou 256 px. Tipo no React: `string \| number`. |
| `showAdjacentMonths` | `bool` | `true` | não | React | — |
| `minDate` | `Object?` | — | não | React | Limite minimo de selecao. Tipo no React: `string \| Date`. |
| `maxDate` | `Object?` | — | não | React | Limite maximo de selecao. Tipo no React: `string \| Date`. |
| `isDateDisabled` | `bool Function(DateTime date)?` | — | não | React | Tipo no React: `((date: Date) => boolean)`. |
| `showTodayShortcut` | `bool` | `true` | não | React | — |
| `cardTitle` | `Widget?` | — | não | React | — |
| `cardProps` | `SgCalendarCardProps?` | — | não | React | Tipo no React: `Omit<SgCardProps, "title" \| "children">`. |
| `today` | `DateTime?` | — | não | Flutter | Extra do Flutter: fixa o "hoje" (no React e `new Date()` no primeiro render). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Locales: dados gerados do `Intl` para 33 locales (pt, en, es, fr, de, it, nl, ja, zh, ko, ru, pl, sv, tr, da, nb, fi, cs, hu, uk, el e variantes regionais). Locale sem dados cai no idioma e, sem ele, em `en-US` (`sgCalendarLocaleData`). O React aceita qualquer locale do navegador.
- **Não portado:** locales de escritas com dígitos não latinos (ficam fora, segundo o comentário de `sgCalendarLocaleData`).
- `cardProps` é um `SgCalendarCardProps`, subconjunto do `SgCard` (sem `className`/`style`; campo nulo mantém o padrão do calendário).
- Datas em texto só em ISO 8601 (`YYYY-MM-DD` vale no fuso local). **Não portado:** formatos livres que o JavaScript aceita, como "March 7, 2021" (comentário de `sgParseDateInput`).
- Prop extra do Flutter: `today`, que fixa o "hoje" (no React é `new Date()` no primeiro render).
- `defaultValue` foi acrescentado à mão ao contrato gerado; o gerador já passou a manter props redeclaradas (docs/PARIDADE.md).
- Os ícones SVG viraram `CustomPaint` (`_ChevronPainter`).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `calendar/sg_calendar.dart`):
- `onValueChange: ValueChanged<DateTime>?`: dispara ao escolher um dia habilitado (toque, Enter ou Espaço) e ao usar o atalho "hoje" (só se hoje não estiver desabilitado). Não dispara em dia desabilitado.
- `onViewDateChange: ValueChanged<DateTime>?`: dispara quando o mês visível muda (setas anterior/próximo, atalho "hoje" ou seleção de um dia de outro mês). Recebe o dia 1 do mês.
- `isDateDisabled: bool Function(DateTime)?`: consultado para cada dia, junto com `minDate`/`maxDate`.
- `cardProps.onOpenChange: ValueChanged<bool>?`: repassado ao `SgCard` que embrulha o calendário.

**Controller e estado:** não há controller. `value` e `viewDate` são controlados quando não nulos (`_valueControlled`/`_viewControlled`); sem eles o widget guarda estado interno, iniciado por `defaultValue`/`defaultViewDate` ou por hoje. Com `value` controlado e `viewDate` livre, o mês visível acompanha o mês do `value`. `numberOfMonths` é limitado a 1..12. Rótulos dos botões de mês vêm do i18n (`components.gadgets.calendar.previousMonth`/`nextMonth`).

**Acessibilidade:** cada dia é um `Semantics(button: true, selected, enabled, label: '<dia>')` com `Focus`; Enter e Espaço escolhem o dia. Os botões de mês têm `Tooltip` e `Semantics(button, label)`. O rótulo do dia é só o número, sem mês e ano (confirmado). Não há navegação por setas entre os dias (só um `onKeyEvent`, para Enter/Espaço), como no React.

## SgClock

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgClock` (mesmo nome).

Relogio analogico ou digital com multiplos estilos visuais, timezone, formato 12h/24h e temas.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/clock/sg_clock.dart` (linha 217) · classe `class SgClock extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_clock.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgClock({...})` com 14 parâmetro(s) nomeado(s), 14 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgClock

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `clockStyle` | `SgClockClockStyle` | `SgClockClockStyle.digital` | não | React | Modo principal de exibicao do relogio. Valores: `digital`, `analog`. |
| `size` | `Object` | `'md'` | não | React | Escala visual do relogio. Tipo no React: `number \| "sm" \| "md" \| "lg"`. |
| `initialServerTime` | `String?` | — | não | React | — |
| `timezone` | `String?` | — | não | React | Timezone usada no calculo da hora exibida. |
| `locale` | `String` | `'pt-BR'` | não | React | — |
| `format` | `SgClockFormat` | `SgClockFormat.v24h` | não | React | Formato horario do relogio. Valores: `12h`, `24h`. |
| `showSeconds` | `bool` | `true` | não | React | Exibe ou oculta os segundos. |
| `digitalStyle` | `SgClockDigitalStyle` | `SgClockDigitalStyle.defaultValue` | não | React | Estilo visual do relogio digital. Valores: `default`, `segment`, `sevenSegment`, `roller3d`, `flip`, `fade`, `matrix`, `neon`, `discard`. |
| `secondHandMode` | `SgClockSecondHandMode` | `SgClockSecondHandMode.step` | não | React | Valores: `step`, `smooth`. |
| `themeId` | `String` | `'classic'` | não | React | Tema visual aplicado ao relogio. |
| `theme` | `SgClockTheme?` | — | não | React | Tema avulso (tem precedencia sobre `themeId`). Tipo no React: `SgClockTheme`. |
| `centerOverlay` | `Widget?` | — | não | React | — |
| `cardTitle` | `Widget?` | — | não | React | — |
| `cardProps` | `SgClockCardProps?` | — | não | React | Tipo no React: `Omit<SgCardProps, "title" \| "children">`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Não portado:** tema por URL/SVG livre (decisão do dono, ADR 51/D8). Um tema com `url` não é desenhado e `SgClockThemeLayer` reporta `SgClockUrlThemeUnsupportedError` por `FlutterError.reportError`, uma vez por montagem ou troca de tema. Use tema embutido, JSON `sg-clock-theme/1` ou `paint`.
- Fuso: o Dart não tem banco IANA; o relógio usa uma tabela própria gerada do `Intl` com 464 nomes (`clock_tz_data.g.dart`, 86 padrões, válida de 2019-01-01 a 2046-01-01 segundo o cabeçalho do arquivo). Deve ser regerada quando um país mudar a regra de horário de verão ou o fim do intervalo se aproximar. Fuso padrão (`timezone` nulo) = o da máquina. Zona fora da tabela: `registerSgClockTimeZone`.
- Períodos do dia (AM/PM e equivalentes) gerados para 33 locales, segundo o docs/PARIDADE.md.
- `cardProps` é um `SgClockCardProps` (subconjunto do `SgCard`).
- Os 8 estilos digitais usam os widgets de dígitos, ligados por `registerSgClockDigitalStyle` (os padrões são registrados por `ensureSgClockDigitalStyles`); estilo sem construtor registrado cai no `default`.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum callback próprio (o construtor não tem `on*`). Só `cardProps.onOpenChange: ValueChanged<bool>?`, repassado ao `SgCard`.

**Controller e estado** (confirmado em `clock/sg_clock.dart`, `clock_tz.dart`, `clock_theme.dart`):
- Sem `SgTimeProvider` acima, o relógio cria um `Timer.periodic` de 1 s e se redesenha; com provider, usa `ctx.nowMs()` e reconstrói a cada tick do provider (o `initialServerTime` do relógio passa a ser ignorado). Não há `TickerMode` nem pausa por visibilidade: o timer só para ao sair da árvore.
- A hora de partida é `initialServerTime` (ISO 8601; inválido vira o agora, via `SgClockEnvironment.now`) e só avança depois do primeiro quadro (`_hydrated`).
- Tema: `theme` avulso vence `themeId`. Com `SgClockThemeProvider` acima, usa `resolveTheme(resolver, themeId, 'classic')`; sem ele, `getTheme(themeId) ?? getTheme('classic')` no registro global. **Os 10 temas embutidos não são registrados sozinhos**: chame `registerSgClockBuiltInThemes()` ou passe `sgClockThemesBuiltIn` ao provider. Sem tema resolvido, a face fica vazia e só os ponteiros são desenhados.
- Fuso inválido: `sgClockOffsetMinutes` lança `SgClockUnsupportedTimeZoneError`; o relógio reporta o erro uma vez por `FlutterError.reportError` e usa o fuso da máquina. Formatos aceitos: nome da tabela, `UTC`/`GMT`, deslocamento (`+03:00`) e `Etc/GMT+N`.
- `secondHandMode: smooth` usa os milissegundos do instante; `step` usa o segundo inteiro.

**Acessibilidade:** o analógico é um `Semantics(label)` com o texto i18n `components.gadgets.clock.analogAria`; o digital usa `digitalAria`. O rótulo é fixo (título do relógio, não a hora). No estilo `default` o `Text` com a hora continua na árvore semântica (não há `excludeSemantics`); nos estilos animados depende dos dígitos usados (ver [[SeedGrid/SeedGrid-components/flutter/digits/API|API dos dígitos]]).

## SgTimeProvider

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgTimeProvider` (mesmo nome).

Provider de tempo sincronizado com o servidor, usado para clocks e gadgets temporais com atualizacao em tick controlado.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/clock/sg_time_provider.dart` (linha 72) · classe `class SgTimeProvider extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_time_provider.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgTimeProvider({...})` com 2 parâmetro(s) nomeado(s), 2 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgTimeProvider

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `initialServerTime` | `String` | — | sim | React | Timestamp inicial do servidor em formato ISO 8601. |
| `child` | `Widget` | — | sim | React | Arvore que vai consumir tempo sincronizado via useSgTime. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- `initialServerTime` inválido cai no "agora" (o React propagaria `NaN`).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `clock/sg_time_provider.dart`):
- Fornece um `SgTimeContextValue` (`serverStartMs`, `perfStartMs`, `tick`, `nowMs()`) por um `InheritedWidget` interno. O primeiro tick é alinhado à virada do segundo (`Timer` de `1000 - now % 1000` ms) e depois sobe a cada 1 s (`Timer.periodic`).
- `nowMs()` devolve a hora do servidor mais o tempo monotônico decorrido; antes do primeiro quadro (`_hydrated`) devolve só a hora inicial.
- Leitura: `useSgTimeContext(context)` devolve o contexto do provider mais próximo ou nulo (e registra dependência: reconstrói a cada tick); `useSgTime(context)` devolve o contexto ou, sem provider, um relógio local com `tick` 0.
- `SgClockEnvironment.now` e `SgClockEnvironment.elapsed` são trocáveis em teste (`reset()` restaura).
- `initialServerTime` é lido só no `initState`: o arquivo não implementa `didUpdateWidget`, então mudar a prop depois não reinicia o relógio (confirmado por leitura do arquivo).

**Acessibilidade:** não aplicável; o widget não desenha nada, só repassa o `child`.

## SgClockThemeProvider

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgClockThemeProvider` (mesmo nome).

Provider de resolucao de temas de relogio, com suporte a fallback, temas locais e integracao com o registro global.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/clock/sg_clock_theme_widgets.dart` (linha 26) · classe `class SgClockThemeProvider extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_clock_theme_provider.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgClockThemeProvider({...})` com 2 parâmetro(s) nomeado(s), 2 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgClockThemeProvider

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `SgClockThemeProviderValue?` | — | não | React | Tipo no React: `SgClockThemeProviderValue`. |
| `child` | `Widget` | — | sim | React | Arvore que vai consumir o resolver de temas. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- Nenhuma ressalva registrada na tabela de paridade para este componente.

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado** (confirmado em `clock/sg_clock_theme_widgets.dart` e `clock_theme.dart`):
- `value` é um `SgClockThemeProviderValue(mode, fallbackThemeId, themes)`. Padrões: `mode` = `SgClockThemeResolveMode.fallback`, `fallbackThemeId` = `'classic'`, `themes` = vazio.
- O provider cria um `SgClockThemeResolver` com `createThemeResolver` e o expõe por `SgClockThemeScope`; filhos o leem com `useSgClockThemeResolver(context)` (nulo sem provider). O resolvedor só é recriado se `mode`, `fallbackThemeId` ou a **identidade** da lista `themes` mudar; para trocar os temas locais passe uma lista nova.
- `resolve(id)` procura primeiro nos temas locais e depois no registro global; em `strict` devolve nulo se não achar, em `fallback` tenta o `fallbackThemeId`. `list()` mistura globais e locais, ordenados por `order` (padrão 999, ordenação estável). Há `registerLocal` e `registerManyLocal`.
- Registro global: `registerTheme` (lança `ArgumentError` se `id` for vazio), `registerThemes`, `getTheme`, `hasTheme`, `listThemes`, `unregisterTheme`, `clearThemes`.

**Acessibilidade:** não aplicável; o widget só repassa o `child`.

## SgClockThemePicker

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgClockThemePicker` (mesmo nome).

Seletor visual de temas de relogio com preview embutido, filtro de temas e integracao com o resolver de temas do clock.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/clock/sg_clock_theme_widgets.dart` (linha 152) · classe `class SgClockThemePicker extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_clock_theme_picker.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgClockThemePicker({...})` com 9 parâmetro(s) nomeado(s), 9 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgClockThemePicker

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String` | — | sim | React | ID do tema atualmente selecionado. |
| `onChange` | `ValueChanged<String>` | — | sim | React | Callback disparado quando um novo tema e escolhido. Tipo no React: `(id: string) => void`. |
| `label` | `String?` | — | não | React | Rotulo opcional exibido acima do seletor. |
| `placeholder` | `String?` | — | não | React | Texto exibido quando nenhum tema valido esta resolvido. |
| `filter` | `bool Function(SgClockTheme theme)?` | — | não | React | Filtro adicional sobre a lista de temas disponiveis. Tipo no React: `((theme: SgClockTheme) => boolean)`. |
| `previewSize` | `num` | `56` | não | React | Tamanho do preview visual de cada tema. |
| `searchable` | `bool` | `true` | não | React | Ativa busca textual na lista de temas. |
| `fallbackThemeId` | `String` | `'classic'` | não | React | Tema usado quando o valor atual nao pode ser resolvido. |
| `defaultOpen` | `bool` | `false` | não | React | Abre a lista inicialmente no primeiro render. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O painel é um `OverlayPortal`, não um popup absoluto.
- **Não portado:** temas por URL/SVG livre; só temas embutidos e registrados (decisão do dono, ADR 51/D8).
- A comparação visual (golden) usa a fonte de teste do Flutter, sem comparação visual de texto com o React.

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `clock/sg_clock_theme_widgets.dart`):
- `onChange: ValueChanged<String>` (obrigatório): recebe o `id` do tema escolhido, ao tocar num item da lista ou escolher na busca; depois fecha o painel (`_pick`).
- `filter: bool Function(SgClockTheme)?`: restringe a lista do resolvedor.

**Controller e estado:** não há controller. `value` é o `id` atual (sempre controlado pelo pai). O painel abre/fecha por `OverlayPortalController` (`defaultOpen` abre na montagem) e fecha ao tocar fora (`TapRegion.onTapOutside`). **A lista vem do `SgClockThemeProvider` mais próximo; sem ele a lista é vazia** (`resolver?.list() ?? []`), como no React. A seleção exibida usa `resolveClockThemeSelection` (resolvedor, depois lista, depois `fallbackThemeId`). Com `searchable`, o painel traz um `SgAutocomplete` que filtra por `id`, `label` e `tags` (`filterClockThemes`).

**Acessibilidade:** nenhum `Semantics` explícito no seletor (o botão é um `InkWell`; a miniatura usa `ExcludeSemantics`); não confirmado como os leitores de tela anunciam o botão e a lista. Não há tratamento de `Escape` nem de teclado próprio no arquivo; o painel fecha por toque fora ou ao escolher (confirmado por busca de `LogicalKeyboardKey`/`FocusNode`, sem resultados).

## SgClockThemePreview

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgClockThemePreview` (mesmo nome).

Preview visual compacto de um tema de relogio, renderizado em SVG para comparacao rapida de estilos.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/clock/sg_clock_theme_widgets.dart` (linha 69) · classe `class SgClockThemePreview extends StatelessWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_clock_theme_preview.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgClockThemePreview({...})` com 2 parâmetro(s) nomeado(s), 2 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgClockThemePreview

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `theme` | `SgClockTheme` | — | sim | React | Tema visual usado na renderizacao do preview. Tipo no React: `SgClockTheme`. |
| `size` | `num` | `64` | não | React | Dimensao do preview quadrado em pixels. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- **Não portado:** temas por URL/SVG livre; só temas embutidos no formato JSON `sg-clock-theme/1` (decisão do dono, ADR 51/D8).
- A comparação visual (golden) usa a fonte de teste do Flutter, sem comparação visual de texto com o React.

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum.

**Controller e estado:** `StatelessWidget`. Recebe o `SgClockTheme` pronto (não usa resolvedor) e o desenha por `SgClockThemeLayer` com ponteiros fixos (hora 305 graus, minuto 60, segundo 180), na cor do texto do tema. `size` padrão 64. Como a camada de tema, reporta `SgClockUrlThemeUnsupportedError` se o tema tiver `url`.

**Acessibilidade:** `ExcludeSemantics` envolve a miniatura: ela é ignorada por leitores de tela (confirmado em `sg_clock_theme_widgets.dart`).

## SgLinearGauge

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgLinearGauge` (mesmo nome).

Gauge linear para exibicao de medicao, faixas de valor, ponteiros adicionais e ajuste arrastavel em eixos horizontal ou vertical.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/gauges/sg_linear_gauge.dart` (linha 21) · classe `class SgLinearGauge extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_linear_gauge.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgLinearGauge({...})` com 30 parâmetro(s) nomeado(s), 30 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgLinearGauge

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `min` | `num` | `0` | não | React | Valor minimo da escala. |
| `max` | `num` | `100` | não | React | Valor maximo da escala. |
| `value` | `num?` | — | não | React | Valor do ponteiro principal. |
| `defaultValue` | `num?` | `min` † | não | React | Valor inicial (nao controlado). Padrao: [min]. |
| `onValueChange` | `ValueChanged<double>?` | — | não | React | Callback do ponteiro principal. Tipo no React: `((value: number) => void)`. |
| `pointers` | `List<SgLinearGaugePointer>?` | — | não | React | Ponteiros adicionais renderizados sobre o eixo. Tipo no React: `SgLinearGaugePointer[]`. |
| `onPointerValueChange` | `void Function( String pointerId, double value, SgLinearGaugePointer pointer, )?` | — | não | React | Tipo no React: `((pointerId: string, value: number, pointer: SgLinearGaugePointer) => void)`. |
| `ranges` | `List<SgLinearGaugeRange>?` | — | não | React | Faixas coloridas aplicadas sobre a escala. Tipo no React: `SgLinearGaugeRange[]`. |
| `orientation` | `SgLinearGaugeOrientation` | `SgLinearGaugeOrientation.horizontal` | não | React | Orientacao do gauge. Valores: `vertical`, `horizontal`. |
| `isAxisInversed` | `bool` | `false` | não | React | — |
| `showPrimaryPointer` | `bool` | `true` | não | React | — |
| `primaryPointerShape` | `SgLinearGaugePrimaryPointerShape` | `SgLinearGaugePrimaryPointerShape.triangle` | não | React | Valores: `circle`, `triangle`, `inverted-triangle`, `diamond`, `rect`. |
| `primaryPointerColor` | `String` | `'hsl(var(--primary))'` | não | React | Cor CSS do ponteiro primario. |
| `primaryPointerSize` | `num` | `11` | não | React | — |
| `primaryPointerDraggable` | `bool` | `false` | não | React | Permite arrastar o ponteiro principal. |
| `barPointer` | `bool` | `true` | não | React | — |
| `barColor` | `String` | `'hsl(var(--primary))'` | não | React | Cor CSS da barra. |
| `barThickness` | `num` | `8` | não | React | — |
| `showTicks` | `bool` | `true` | não | React | Exibe ticks da escala. |
| `showLabels` | `bool` | `true` | não | React | Exibe rotulos da escala. |
| `majorTickCount` | `num` | `5` | não | React | — |
| `minorTicksPerInterval` | `num` | `1` | não | React | — |
| `labelFormatter` | `String Function(double value)?` | — | não | React | Texto do rotulo de cada marca principal (no React devolve `ReactNode` dentro de um `<text>`). Tipo no React: `((value: number) => React.ReactNode)`. |
| `axisColor` | `String` | `'hsl(var(--border))'` | não | React | — |
| `axisThickness` | `num` | `10` | não | React | — |
| `width` | `num?` | `orientation === "horizontal" ? 360 : 140` † | não | React | Padrao: 360 (horizontal) ou 140 (vertical). |
| `height` | `num?` | `orientation === "horizontal" ? 120 : 360` † | não | React | Padrao: 120 (horizontal) ou 360 (vertical). |
| `animate` | `bool` | `true` | não | React | — |
| `animationDuration` | `num` | `350` | não | React | Milissegundos. |
| `ariaLabel` | `String?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React, a `transition: all` quase não age na geometria do SVG; no Flutter o ponteiro inteiro anima com `ease-out` em `animationDuration` ms (`GaugeValueAnimator`).
- `primaryPointerLabel` e `pointer.label` que não sejam texto são desenhados como sobreposição (overlay).
- **Não portado:** o `label` de `SgLinearGaugeRange` existe no tipo do React mas nunca é desenhado (nem no React nem aqui).
- Arrastar usa área de toque de 16 px (`kGaugeTouchSlop`) em volta do ponteiro.
- A acessibilidade usa `Semantics`, não `role="meter"`.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `gauges/sg_linear_gauge.dart`):
- `onValueChange: ValueChanged<double>?`: valor do ponteiro principal (já limitado a `min`/`max`), a cada movimento do arrasto; só há arrasto com `primaryPointerDraggable: true`.
- `onPointerValueChange: void Function(String pointerId, double value, SgLinearGaugePointer pointer)?` e `SgLinearGaugePointer.onValueChange`: arrasto de ponteiro adicional (o do ponteiro dispara antes).
- `labelFormatter: String Function(double)?`: formata os rótulos do eixo.

**Controller e estado:** sem controller. `value` controla quando não nulo; senão o estado interno parte de `defaultValue` (ou `min`). Mudança de valor por fora anima (`animate`, `animationDuration` padrão 350 ms); durante o arrasto não anima. Ponteiros adicionais guardam o valor arrastado internamente e o ressincronizam quando a lista `pointers` muda de identidade ou `min`/`max` mudam. Em tela estreita o medidor encolhe (`FittedBox`, `BoxFit.scaleDown`).

**Acessibilidade:** `Semantics(container: true, label: ariaLabel ?? i18n 'components.gadgets.gauge.linearAria', value: <valor atual>)`. Não há `Focus` nem teclado: o ajuste do valor é só por arrasto (toque/mouse), como no React.

## SgRadialGauge

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgRadialGauge` (mesmo nome).

Gauge radial com ponteiros, faixas, anotacoes e controle de angulos para cenarios de speedometer, dial e medicao circular.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/gauges/sg_radial_gauge.dart` (linha 29) · classe `class SgRadialGauge extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_radial_gauge.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgRadialGauge({...})` com 35 parâmetro(s) nomeado(s), 35 do contrato React e 0 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 2.

### Props de SgRadialGauge

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `min` | `num` | `0` | não | React | Valor minimo da escala. |
| `max` | `num` | `100` | não | React | Valor maximo da escala. |
| `value` | `num?` | — | não | React | Valor do ponteiro principal. |
| `defaultValue` | `num?` | `min` † | não | React | Valor inicial (nao controlado). Padrao: [min]. |
| `onValueChange` | `ValueChanged<double>?` | — | não | React | Callback do ponteiro principal. Tipo no React: `((value: number) => void)`. |
| `pointers` | `List<SgRadialGaugePointer>?` | — | não | React | Ponteiros adicionais do tipo needle, marker ou range. Tipo no React: `SgRadialGaugePointer[]`. |
| `onPointerValueChange` | `void Function( String pointerId, double value, SgRadialGaugePointer pointer, )?` | — | não | React | Tipo no React: `((pointerId: string, value: number, pointer: SgRadialGaugePointer) => void)`. |
| `ranges` | `List<SgRadialGaugeRange>?` | — | não | React | Faixas coloridas sobre o arco principal. Tipo no React: `SgRadialGaugeRange[]`. |
| `annotations` | `List<SgRadialGaugeAnnotation>?` | — | não | React | Anotacoes posicionadas por valor ou angulo. Tipo no React: `SgRadialGaugeAnnotation[]`. |
| `startAngle` | `num` | `135` | não | React | Angulo inicial do arco. |
| `endAngle` | `num` | `45` | não | React | Angulo final do arco. |
| `isAxisInversed` | `bool` | `false` | não | React | — |
| `showPrimaryPointer` | `bool` | `true` | não | React | — |
| `primaryPointerType` | `SgRadialGaugePrimaryPointerType` | `SgRadialGaugePrimaryPointerType.needle` | não | React | Tipo visual do ponteiro principal. Valores: `range`, `needle`, `marker`. |
| `primaryPointerColor` | `String` | `'hsl(var(--primary))'` | não | React | Cor CSS do ponteiro primario. |
| `primaryPointerWidth` | `num` | `3` | não | React | — |
| `primaryPointerSize` | `num` | `12` | não | React | — |
| `primaryPointerShape` | `SgRadialGaugePrimaryPointerShape` | `SgRadialGaugePrimaryPointerShape.circle` | não | React | Valores: `circle`, `square`, `triangle`, `diamond`. |
| `primaryPointerDraggable` | `bool` | `false` | não | React | — |
| `primaryPointerLabel` | `Widget?` | — | não | React | No React e `ReactNode` desenhado num `<text>` do SVG. Um `Text` com texto vira rotulo na propria cena; outro widget aparece sobreposto acima da ponta da agulha. |
| `showTicks` | `bool` | `true` | não | React | — |
| `showLabels` | `bool` | `true` | não | React | — |
| `majorTickCount` | `num` | `5` | não | React | — |
| `minorTicksPerInterval` | `num` | `1` | não | React | — |
| `labelFormatter` | `String Function(double value)?` | — | não | React | Texto do rotulo de cada marca principal (no React devolve `ReactNode` dentro de um `<text>`). Tipo no React: `((value: number) => React.ReactNode)`. |
| `axisColor` | `String` | `'hsl(var(--border))'` | não | React | — |
| `ringThickness` | `num?` | — | não | React | Vence [axisWidth] quando informado. |
| `axisWidth` | `num` | `14` | não | React | — |
| `radiusFactor` | `num` | `0.9` | não | React | — |
| `centerContent` | `Widget?` | — | não | React | — |
| `width` | `num` | `300` | não | React | — |
| `height` | `num` | `300` | não | React | — |
| `animate` | `bool` | `true` | não | React | — |
| `animationDuration` | `num` | `350` | não | React | Milissegundos. |
| `ariaLabel` | `String?` | — | não | React | — |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- No React, a `transition: all` quase não age na geometria do SVG; no Flutter o ponteiro inteiro anima com `ease-out` em `animationDuration` ms.
- `primaryPointerLabel` e `pointer.label` que não sejam texto são desenhados como sobreposição (overlay).
- Arrastar usa área de toque de 16 px (`kGaugeTouchSlop`).
- A acessibilidade usa `Semantics`, não `role="meter"`.
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `gauges/sg_radial_gauge.dart`):
- `onValueChange: ValueChanged<double>?`: valor do ponteiro principal (limitado a `min`/`max`) a cada movimento do arrasto; exige `primaryPointerDraggable: true`.
- `onPointerValueChange: void Function(String pointerId, double value, SgRadialGaugePointer pointer)?` e `SgRadialGaugePointer.onValueChange`: arrasto de ponteiro adicional (o do ponteiro dispara antes). `pointerId` é o `id` do ponteiro ou `sg-radial-pointer-<índice>`.
- `labelFormatter: String Function(double)?`: formata os rótulos do eixo.

**Controller e estado:** sem controller. Mesmo modelo do linear: `value` controlado quando não nulo, senão estado interno (`defaultValue` ou `min`); animação por `GaugeValueAnimator` (`SingleTickerProviderStateMixin`), sem animar durante o arrasto. `centerContent` substitui os textos do centro (rótulo e valor arredondado). Ângulos: `startAngle` 135 e `endAngle` 45 por padrão; `isAxisInversed` inverte o eixo.

**Acessibilidade:** `Semantics(container: true, label: ariaLabel ?? i18n 'components.gadgets.gauge.radialAria', value: <valor atual>)`. Sem `Focus` nem teclado: ajuste só por arrasto.

## SgQRCode

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgQRCode` (mesmo nome).

Gerador visual de QR Code com configuracao de valor, logo central, tamanho, margem e cores.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/gauges/sg_qr_code.dart` (linha 56) · classe `class SgQRCode extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_qr_code.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgQRCode({...})` com 17 parâmetro(s) nomeado(s), 16 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 0.

### Props de SgQRCode

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `value` | `String?` | — | não | React | Valor textual codificado no QR Code. |
| `size` | `num` | `220` | não | React | Tamanho do QR em pixels. |
| `margin` | `num` | `2` | não | React | Margem em modulos (minimo 0). |
| `fgColor` | `String` | `'#000000'` | não | React | Cor principal do QR Code. |
| `bgColor` | `String` | `'#FFFFFF'` | não | React | Cor de fundo do QR Code. |
| `errorCorrectionLevel` | `SgQRCodeErrorCorrectionLevel` | `SgQRCodeErrorCorrectionLevel.h` | não | React | Valores: `L`, `M`, `Q`, `H`. |
| `logoSrc` | `String?` | — | não | React | URL da logo exibida no centro do QR. |
| `logoImage` | `ImageProvider?` | — | não | Flutter | Extra do Flutter: imagem central local ou em memoria (tem precedencia sobre [logoSrc]). |
| `logoAlt` | `String` | `'Logo'` | não | React | — |
| `logoSize` | `num?` | — | não | React | Lado da imagem central. Padrao: 22% de [size] (entre 18 e [size]). |
| `logoPadding` | `num` | `6` | não | React | — |
| `logoBackgroundColor` | `String` | `'#FFFFFF'` | não | React | Cor CSS do fundo da imagem central. |
| `logoBorderRadius` | `num` | `12` | não | React | — |
| `imageClassName` | `String?` | — | não | React | Sem efeito no Flutter (classe CSS do React). |
| `logoClassName` | `String?` | — | não | React | Sem efeito no Flutter (classe CSS do React). |
| `emptyFallback` | `Widget?` | — | não | React | — |
| `onGenerateError` | `void Function(Object error)?` | — | não | React | Chamado quando o texto nao cabe em nenhum QR (o React captura o erro num ErrorBoundary). Tipo no React: `((error: Error) => void)`. |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O `qr_flutter` não serve (falha na versão 15, só modo byte, máscara diferente): o algoritmo `qrcodegen` (Nayuki, MIT) foi portado e a matriz bate com a do `qrcode.react` em 118 matrizes de teste (docs/PARIDADE.md).
- `logoSrc` só carrega URL de rede; para imagem local ou em memória use a prop extra `logoImage` (`ImageProvider`, vence `logoSrc`).
- `imageClassName` e `logoClassName` existem só para cumprir o contrato (ADR 50) e não têm efeito.
- A caixa de erro (cinza) pulsa de forma aproximada à do `animate-pulse` do Tailwind (1 -> 0,5 -> 1 em 2 s).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks** (confirmado em `gauges/sg_qr_code.dart` e `qr_matrix.dart`):
- `onGenerateError: void Function(Object error)?`: chamado, depois do quadro, quando a matriz não puder ser gerada (qualquer erro capturado em `encodeQrMatrix`; o caso normal é `QrDataTooLongException`, para texto que não cabe nem na versão 40; o React lança `RangeError("Data too long")`).
- `emptyFallback: Widget?`: mostrado no lugar do QR quando `value` é nulo, vazio ou só espaços; sem ele, nada é desenhado.

**Controller e estado:** sem controller. A matriz é recalculada só quando o texto ou `errorCorrectionLevel` mudam (`_key`). Em erro, mostra uma caixa cinza que pulsa (`AnimationController` de 1 s, repetido, parado quando a matriz volta). `size` mínimo 64 px e `margin` mínimo 0 módulos. Cores `fgColor`/`bgColor`/`logoBackgroundColor` aceitam texto CSS (`#rrggbb`, `rgb(...)`, `hsl(var(--token))`).

**Acessibilidade:** `Semantics(image: true, label: i18n 'components.gadgets.qrcode.title')` (pt-BR: "Código QR"); o conteúdo codificado não é anunciado. A imagem do logo usa `semanticLabel: logoAlt` (padrão `'Logo'`).

## SgStringAnimator

> **Flutter** · estado de paridade: **portado** · equivalente React: `SgStringAnimator` (mesmo nome).

Componente para animar transicao entre strings usando estilos como roller3d, flip e neon em displays textuais curtos.

- Arquivo: `packages/seedgrid_components/lib/src/gadgets/string_animator/sg_string_animator.dart` (linha 134) · classe `class SgStringAnimator extends StatefulWidget`
- Contrato gerado das props (nomes, tipos e padrões do React): `packages/seedgrid_components/lib/src/generated/sg_string_animator.g.dart`
- Importação: `import 'package:seedgrid_components/seedgrid_components.dart';`
- Construtor: `const SgStringAnimator({...})` com 12 parâmetro(s) nomeado(s), 11 do contrato React e 1 extra(s) do Flutter; props do React omitidas de propósito (`className`, `style`, atributos HTML; ADR 50): 1.

### Props de SgStringAnimator

| Prop | Tipo (Dart) | Padrão | Obrigatória | Origem | Descrição |
|---|---|---|---|---|---|
| `sourceString` | `String` | — | sim | React | Texto inicial da animacao. |
| `targetString` | `String` | — | sim | React | Texto final da animacao. |
| `stringAnimatorStyle` | `SgStringAnimatorStringAnimatorStyle` | `SgStringAnimatorStringAnimatorStyle.roller3d` | não | React | Estilo visual usado na transicao. Valores: `roller3d`, `flip`, `fade`, `matrix`, `neon`, `discard`. |
| `velocity` | `num` | `50` | não | React | Velocidade de 1 (muito lento) a 100 (muito rapido). Controla o intervalo de tempo entre a troca de cada caractere. |
| `emptyChar` | `String` | `' '` | não | React | Caractere utilizado para preencher as posicoes extras quando sourceString e targetString possuem comprimentos diferentes. |
| `alignTo` | `SgStringAnimatorAlignTo` | `SgStringAnimatorAlignTo.left` | não | React | Alinhamento do texto animado. Valores: `left`, `right`. |
| `autoStart` | `bool` | `false` | não | React | Se true, inicia a animacao automaticamente quando o componente monta e sempre que targetString mudar. |
| `fontSize` | `num` | `32` | não | React | Escala visual do display. |
| `charset` | `List<String>` | `kSgStringAnimatorDefaultCharset` | não | React | Conjunto de caracteres validos para o SgRoller3DDigit. Deve conter todos os caracteres que podem aparecer em sourceString, targetString e emptyChar. Ignorado quando style != "roller3d". Tipo no React: `string[]`. |
| `color` | `String?` | — | não | React | Cor principal do texto/ponto — aplicada nos estilos "neon", "fade", "discard" e "matrix". |
| `backgroundColor` | `String?` | — | não | React | Cor de fundo — aplicada nos estilos "neon", "fade", "discard" e "matrix". |
| `controller` | `SgStringAnimatorController?` | — | não | Flutter | Equivale ao `ref` do React (`startAnimation`). |

† padrão declarado no contrato do React; o construtor Dart não o repete (o widget o aplica ao montar; **não confirmado** caso a caso).

### Diferenças do React registradas em docs/PARIDADE.md

- O `ref` do React virou `SgStringAnimatorController.startAnimation()`; a prop extra `controller` o liga ao widget.
- Os dois pontos e a célula do período são reproduzidos pelo código, fora da paridade por vetor (os vetores gerados do React cobrem a lógica de passos).
- Nota (não é divergência): `fontSize` padrão 32, o valor que o código do React usa; o meta do React diz 28 (comentário em `sg_string_animator.dart`).
- A comparação visual (golden) usa a fonte de teste do Flutter, então não há comparação visual de texto com o React; não testado em dispositivo (docs/PARIDADE.md).

### Eventos, controllers e acessibilidade

**Eventos e callbacks:** nenhum; não há evento de término da animação (o React também não emite).

**Controller e estado** (confirmado em `string_animator/sg_string_animator.dart`):
- `SgStringAnimatorController.startAnimation()` inicia (ou reinicia) a animação de `sourceString` até `targetString`; sem widget ligado ao controller, a chamada não faz nada.
- `autoStart: true` anima na montagem e sempre que `targetString` muda. Mudar `sourceString` cancela a animação em curso e volta o display à origem.
- Uma posição por passo, com atraso `sgStringAnimatorStepDelay(velocity)`: velocidade 1..100 (600 ms no 1, 323 ms no 50, 41 ms no 100). `alignTo: right` preenche à esquerda com `emptyChar` e anima da posição mais à direita. O tamanho é `max(origem, destino, 1)`, medido em unidades UTF-16 no preenchimento.
- `stringAnimatorStyle` escolhe o dígito: `roller3d` -> `SgRoller3DDigit` (único que usa `charset`), `flip` -> `SgFlipDigit`, `neon`, `fade`, `discard` e `matrix`. `color`/`backgroundColor` só chegam a neon, fade, discard e matrix; `fontSize` chega a todos menos matrix.
- Os timers (`Timer`) são cancelados no `dispose`.

**Acessibilidade:** nenhum `Semantics` explícito em `sg_string_animator.dart`; a semântica vem dos dígitos internos (neon, fade, discard e matrix expõem o caractere; flip exclui a semântica; o roller3d não tem `Semantics` explícito). Inferência: o leitor de tela lê caractere a caractere, sem um rótulo único para a palavra.

