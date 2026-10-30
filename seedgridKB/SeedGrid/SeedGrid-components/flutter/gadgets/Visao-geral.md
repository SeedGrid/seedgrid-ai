---
description: "Gadgets (relógio, calendário, gauges, QR) em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, gadgets]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Gadgets (relógio, calendário, gauges, QR) — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets (relógio, calendário, gauges, QR) — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/gadgets/API|API — Gadgets (relógio, calendário, gauges, QR) (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/gadgets/Exemplos|Exemplos — Gadgets (relógio, calendário, gauges, QR) (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

10 componente(s): **10 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgCalendar` | portado | Calendário mensal com vários meses, locale, limites e dias bloqueados. | `pages/sg_calendar_page.dart` |
| `SgClock` | portado | Relógio digital ou analógico com fuso, 12h/24h, temas e estilos de dígito. | `pages/sg_clock_page.dart` |
| `SgTimeProvider` | portado | Fornece a hora do servidor, com tick por segundo, a toda a árvore. | `pages/sg_time_provider_page.dart` |
| `SgClockThemeProvider` | portado | Resolve temas de relógio (locais e globais) com modo e tema de recuo. | `pages/sg_clock_theme_provider_page.dart` |
| `SgClockThemePicker` | portado | Seletor de tema de relógio com miniatura e busca. | `pages/sg_clock_theme_picker_page.dart` |
| `SgClockThemePreview` | portado | Miniatura de um tema de relógio com ponteiros fixos. | `pages/sg_clock_theme_preview_page.dart` |
| `SgLinearGauge` | portado | Medidor linear com faixas, ponteiros extras e ajuste por arrasto. | `pages/sg_linear_gauge_page.dart` |
| `SgRadialGauge` | portado | Medidor radial com ponteiros, faixas, anotações e ângulos configuráveis. | `pages/sg_radial_gauge_page.dart` |
| `SgQRCode` | portado | QR Code com cores, margem, nível de correção e logo central. | `pages/sg_qr_code_page.dart` |
| `SgStringAnimator` | portado | Anima a troca de um texto por outro, letra a letra, com dígitos animados. | `pages/sg_string_animator_page.dart` |

## Quando usar

- `SgCalendar`: para escolher ou mostrar uma data num painel sempre visível. Para um campo de formulário com máscara use `SgInputDate` ([[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Inputs de texto (Flutter)]]); para intervalos prontos use `SgPeriodSelector` ([[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Inputs de seleção (Flutter)]]).
- `SgClock`: relógio de painel (digital ou analógico, com fuso). Para só um número animado use um dígito ([[SeedGrid/SeedGrid-components/flutter/digits/Visao-geral|Dígitos (Flutter)]]); para vários relógios sincronizados ponha um `SgTimeProvider` acima.
- `SgTimeProvider`: quando a hora precisa vir do servidor e valer para toda a árvore (vários relógios batendo juntos); sem ele cada `SgClock` conta sozinho a partir de `initialServerTime`.
- `SgClockThemeProvider`: quando o app tem temas próprios de relógio, modo `strict` ou tema de recuo; sem ele só vale o registro global (`registerTheme`).
- `SgClockThemePicker`: para o usuário escolher o tema (exige um `SgClockThemeProvider` acima, senão a lista é vazia); `SgClockThemePreview` para mostrar um tema em miniatura sem seleção.
- `SgLinearGauge` e `SgRadialGauge`: para mostrar uma medida com faixas (radial para dial/velocímetro, linear para barra). O arrasto não é um campo de formulário: para ajustar um valor num formulário use `SgSlider` ([[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Visao-geral|Inputs de seleção (Flutter)]]).
- `SgQRCode`: para exibir um texto/URL como QR (a leitura fica com a câmera do usuário).
- `SgStringAnimator`: para trocar um texto curto por outro com efeito de dígitos; para um único caractere use o dígito direto.

## O que muda em relação ao React

Os dez componentes estão **portados** ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]). Diferenças de plataforma que o grupo concentra: o relógio usa uma tabela de fusos própria (sem banco IANA no Dart) e **não** aceita tema por URL/SVG livre; o calendário cobre 33 locales com dados gerados do `Intl`; os medidores animam o ponteiro inteiro e expõem `Semantics` no lugar de `role="meter"`; o QR usa o algoritmo `qrcodegen` portado; o `ref` do `SgStringAnimator` virou `SgStringAnimatorController`. Detalhes por componente na [[SeedGrid/SeedGrid-components/flutter/gadgets/API|API]]; regras gerais em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] e [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Hooks e funções auxiliares do grupo React ([[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets (React)]]) e o que existe no Flutter (nomes conferidos nos arquivos exportados pelo barril; a tabela de símbolos mais abaixo respeita os `show` do barril):

| Família no React | Equivalente no Flutter |
|---|---|
| `useSgTime`, `useSgTimeContext` | funções com o mesmo nome que recebem o `BuildContext` (`useSgTime(context)`, `useSgTimeContext(context)`); não são hooks. Extra: `SgClockEnvironment` (tempo injetável em teste) |
| `registerTheme(s)`, `getTheme`, `hasTheme`, `listThemes`, `unregisterTheme`, `clearThemes` | mesmos nomes (`clock/clock_theme.dart`); extra: `registerSgClockBuiltInThemes()` |
| `createThemeResolver`, `resolveTheme`, `useSgClockThemeResolver` | mesmos nomes (`useSgClockThemeResolver(context)` é função, não hook); `SgClockThemeScope` expõe o resolvedor |
| `filterClockThemes`, `resolveClockThemeSelection` | mesmos nomes |
| `sgClockThemesBuiltIn` | getter de mesmo nome, com 10 temas (lidos do JSON `sg-clock-theme/1`); **não** são registrados sozinhos |
| `ThemeLayer` | `SgClockThemeLayer` |
| `useDarkFlag` | `sgClockIsDark(context)` (brilho do `Theme` do Flutter) |
| `SG_STRING_ANIMATOR_DEFAULT_CHARSET` | `kSgStringAnimatorDefaultCharset` |
| `gauge/math.ts` (`clampGaugeValue`, `valueToGaugeRatio`...; interno no React) | `gauge/gauge_math.dart` tem os mesmos nomes (`clampGaugeValue`, `valueToGaugeRatio`, `ratioToGaugeValue`...), mas o barril só exporta `jsRound` e `jsRoundText`: também **interno** no Flutter |
| `ref` do `SgStringAnimator` | `SgStringAnimatorController` (prop extra `controller`) |
| `theme.url` (SVG remoto injetado por `ThemeLayer`) | **Não portado** (ADR 51/D8): gera `SgClockUrlThemeUnsupportedError` |

Símbolos exclusivos do Flutter: `registerSgClockTimeZone`, `registerSgClockDigitalStyle`, `SgClockUnsupportedTimeZoneError`, `QrDataTooLongException`, `SgClockOp` e derivados (`SgClockCircle`, `SgClockPath`...). Não encontrei no React um símbolo do grupo sem equivalente ou marcação de "não portado" além do tema por URL.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `sgNormalizeDate` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgStartOfMonth` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgAddMonths` | função | `addMonths` do React: sempre cai no dia 1 do mes resultante. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgAddDays` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgIsSameDay` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgIsSameMonth` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgParseDateInput` | função | `parseDateInput` do React: aceita `DateTime` ou texto. `'YYYY-MM-DD'` vale no fuso LOCAL (nao em UTC); outros textos seguem o `DateTime.tryParse` do Dart (ISO 8601; formatos livres que o JavaScript aceita, como "March 7, 2021", nao sao suportados). Invalido ou vazio = `null`. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgClampWeekStart` | função | `clampWeekStart`: inteiro modulo 7 (negativo volta para 0..6); nao numerico = 0. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgClampInt` | função | `clampInt`. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgDateKey` | função | `dateKey`: `YYYY-MM-DD`. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgMonthGrid` | função | Os 42 dias (6 semanas) da grade de um mes, comecando em [weekStartsOn] (0 = domingo). | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgCapitalizeFirst` | função | — | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgCalendarLocaleData` | função | Dados do locale pedido. O React aceita qualquer locale (`Intl.DateTimeFormat`); aqui os 33 que tem dados gerados (pt, en, es, fr, de, it, nl, ja, zh, ko, ru, pl, sv, tr, da, nb, fi, cs, hu, uk, el e variantes regionais). Locale sem dados cai no idioma e, sem ele, em en-US (escritas com digitos nao latinos ficam fora). | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgFormatMonthYear` | função | Titulo do mes: `Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'})` + capitalizeFirst. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgFormatSelectedDate` | função | Data selecionada: `{weekday: 'long', day: 'numeric', month: 'long'}` + capitalizeFirst. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `sgWeekdayLabels` | função | Cabecalho dos dias da semana, na ordem que comeca em [weekStartsOn], com a primeira letra maiuscula. | `lib/src/gadgets/calendar/calendar_logic.dart` |
| `SgCalendarCardProps` | class | `cardProps` do React (`Omit<SgCardProps, 'title' \| 'children'>`): subconjunto do [SgCard] que faz sentido para o calendario. Campo nulo = mantem o padrao do calendario. `className`/`style` nao existem. | `lib/src/gadgets/calendar/sg_calendar.dart` |
| `sgStringAnimatorSafeEmpty` | função | `emptyChar.charAt(0) \|\| " "`. | `lib/src/gadgets/string_animator/sg_string_animator.dart` |
| `sgStringAnimatorStepDelay` | função | Atraso entre os passos: velocidade limitada a 1-100 e `Math.round(600 - (v - 1) * 5.65)`. v=1 -> 600 ms, v=50 -> 323 ms, v=100 -> 41 ms. | `lib/src/gadgets/string_animator/sg_string_animator.dart` |
| `sgStringAnimatorPad` | função | `padStart`/`padEnd` do React, medidos em unidades UTF-16 (como o JavaScript). | `lib/src/gadgets/string_animator/sg_string_animator.dart` |
| `sgStringAnimatorChars` | função | `Array.from(s)` do JavaScript: um item por code point. | `lib/src/gadgets/string_animator/sg_string_animator.dart` |
| `SgStringAnimatorController` | class | Controle imperativo (o `ref` do React). | `lib/src/gadgets/string_animator/sg_string_animator.dart` |
| `SgClockPaint` | class | Cor de um preenchimento/traco, com variante clara e escura (`dark:` do Tailwind). `none` = sem pintura (`fill-none`). | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockGradient` | class | Gradiente radial do SVG (`objectBoundingBox`, valores em `%`). | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockOp` | class | Uma figura do tema. Padroes do SVG: preenchimento preto, sem traco, largura de traco 1. | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockCircle` | class | — | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockEllipse` | class | — | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockLine` | class | — | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockRect` | class | — | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockPath` | class | Caminho SVG. Suporta M/m, L/l, H/h, V/v, C/c e Z/z (os usados pelos temas embutidos). | `lib/src/gadgets/clock/clock_ops.dart` |
| `parseSvgPath` | função | Converte `d` do SVG em [Path]. Lanca [FormatException] para comando nao suportado. | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockText` | class | — | `lib/src/gadgets/clock/clock_ops.dart` |
| `SgClockOpsPainter` | class | Pinta as [ops] de um tema (espaco 100x100) escalando para [size]. | `lib/src/gadgets/clock/clock_ops.dart` |
| `ensureSgClockDigitalStyles` | função | Registra os 8 estilos digitais que ainda nao tem construtor. Idempotente; nao sobrescreve um construtor que o app registrou antes (use [registerSgClockDigitalStyle] depois para trocar um). | `lib/src/gadgets/clock/clock_digital_styles.dart` |
| `registerSgClockDigitalStyles` | função | Registra os 8 estilos digitais, substituindo o que existir (para quem quer chamar de forma explicita). | `lib/src/gadgets/clock/clock_digital_styles.dart` |
| `SgClockThemeRenderArgs` | class | Argumentos que o tema recebe ao desenhar: `size` em px e se o modo e escuro. | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemePaint` | typedef | Desenho livre de um tema no espaco 100x100 (equivale a `render` do React). | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockUrlThemeUnsupportedError` | class | Erro de tema por URL (SVG livre): nao portado. Mensagem clara e testada. | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockTheme` | class | Tema do relogio. `ops` (JSON proprio) e/ou `paint` (desenho livre) fazem o papel de `render` do React. | `lib/src/gadgets/clock/clock_theme.dart` |
| `parseSgClockThemesJson` | função | Interpreta um documento `sg-clock-theme/1` (`{formato, viewBox, temas: [...]}`). | `lib/src/gadgets/clock/clock_theme.dart` |
| `registerTheme` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `registerThemes` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `registerSgClockBuiltInThemes` | função | Atalho: `registerThemes(sgClockThemesBuiltIn)`. | `lib/src/gadgets/clock/clock_theme.dart` |
| `getTheme` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `hasTheme` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `listThemes` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `unregisterTheme` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `clearThemes` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemeResolveMode` | enum | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemeResolver` | class | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `createThemeResolver` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemeProviderValue` | class | `value` do `SgClockThemeProvider`. | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemeScope` | class | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `useSgClockThemeResolver` | função | `useSgClockThemeResolver`: o resolvedor do `SgClockThemeProvider` mais proximo, ou nulo. | `lib/src/gadgets/clock/clock_theme.dart` |
| `filterClockThemes` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `resolveClockThemeSelection` | função | — | `lib/src/gadgets/clock/clock_theme.dart` |
| `resolveTheme` | função | `resolveTheme` de renderTheme.tsx. | `lib/src/gadgets/clock/clock_theme.dart` |
| `sgClockIsDark` | função | Equivale a `useDarkFlag`: o brilho do tema do Flutter (que o `SeedThemeProvider` mantem em dia). | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockThemeLayer` | class | Camada do tema: pinta `ops`/`paint` no espaco 100x100 escalado para [size]. Se o tema tem `url`, reporta [SgClockUrlThemeUnsupportedError] (uma vez por montagem/troca de tema) e nao desenha a URL. | `lib/src/gadgets/clock/clock_theme.dart` |
| `SgClockUnsupportedTimeZoneError` | class | Zona que o Intl conhece mas esta porte nao: mensagem clara, com o caminho para acrescentar. | `lib/src/gadgets/clock/clock_tz.dart` |
| `SgClockOffsetOf` | typedef | Deslocamento (minutos a leste de UTC) de [timezone] no instante [utc]. | `lib/src/gadgets/clock/clock_tz.dart` |
| `registerSgClockTimeZone` | função | Acrescenta (ou substitui) uma zona. [offsetMinutes] recebe o instante em UTC. | `lib/src/gadgets/clock/clock_tz.dart` |
| `clearSgClockCustomTimeZones` | função | Remove as zonas acrescentadas por [registerSgClockTimeZone] (uso em testes). | `lib/src/gadgets/clock/clock_tz.dart` |
| `sgClockOffsetMinutes` | função | Deslocamento em minutos a leste de UTC. `null` ou vazio = fuso local da maquina. Lanca [SgClockUnsupportedTimeZoneError] para zona desconhecida. | `lib/src/gadgets/clock/clock_tz.dart` |
| `SgClockCardProps` | class | `cardProps` do React (`Omit<SgCardProps, 'title' \| 'children'>`): subconjunto do [SgCard]. Campo nulo = mantem o padrao do relogio. `className`/`style` nao existem. | `lib/src/gadgets/clock/sg_clock.dart` |
| `SgClockDigitalParts` | class | Partes do relogio digital, como o React as monta com `Intl.DateTimeFormat.formatToParts`. | `lib/src/gadgets/clock/sg_clock.dart` |
| `sgClockDigitalParts` | função | Monta as partes do digital para o instante [utc]. | `lib/src/gadgets/clock/sg_clock.dart` |
| `SgClockDigitalStyleBuilder` | typedef | Desenha o relogio digital de um estilo nao padrao (digitos animados). O corpo do `SgClock` envolve o resultado com o rotulo de acessibilidade. | `lib/src/gadgets/clock/sg_clock.dart` |
| `registerSgClockDigitalStyle` | função | Liga um estilo digital (`segment`, `sevenSegment`, `roller3d`, `flip`, `fade`, `matrix`, `neon`, `discard`) a um construtor, tipicamente feito com os widgets de digitos. | `lib/src/gadgets/clock/sg_clock.dart` |
| `unregisterSgClockDigitalStyle` | função | — | `lib/src/gadgets/clock/sg_clock.dart` |
| `SgClockEnvironment` | class | Fontes de tempo do relogio. O React usa `Date.now()` e `performance.now()`; aqui sao trocaveis em teste. | `lib/src/gadgets/clock/sg_time_provider.dart` |
| `SgTimeContextValue` | class | Valor do contexto de tempo (equivale a `SgTimeContextValue`). | `lib/src/gadgets/clock/sg_time_provider.dart` |
| `useSgTimeContext` | função | `useSgTimeContext`: o contexto do `SgTimeProvider` mais proximo, ou nulo (e depende dele: reconstroi a cada tick). | `lib/src/gadgets/clock/sg_time_provider.dart` |
| `useSgTime` | função | `useSgTime`: o contexto do provider ou, sem provider, um relogio local. | `lib/src/gadgets/clock/sg_time_provider.dart` |
| `jsRound` | função | `Math.round` do JavaScript: arredonda metade para cima (-0.5 vira -0, 0.5 vira 1), nao "para longe do zero". | `lib/src/gadgets/gauges/gauge_math.dart` |
| `jsRoundText` | função | `String(Math.round(x))` do JavaScript: sem sinal em `-0` e sem `.0`. | `lib/src/gadgets/gauges/gauge_math.dart` |
| `SgRadialGaugePointerType` | enum | Tipo do ponteiro do radial: `needle` (agulha), `marker` (marcador) ou `range` (arco ate o valor). | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgRadialGaugeMarkerShape` | enum | Forma do marcador do radial. | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgLinearGaugePointerShape` | enum | Forma do ponteiro do linear. | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgRadialGaugeRange` | class | Faixa colorida do radial (`SgRadialGaugeRange`). | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgRadialGaugePointer` | class | Ponteiro adicional do radial (`SgRadialGaugePointer`). | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgRadialGaugeAnnotation` | class | Anotacao posicionada sobre o radial (`SgRadialGaugeAnnotation`). | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgLinearGaugeRange` | class | Faixa colorida do linear (`SgLinearGaugeRange`). O `label` do React nunca e desenhado. | `lib/src/gadgets/gauges/gauge_types.dart` |
| `SgLinearGaugePointer` | class | Ponteiro adicional do linear (`SgLinearGaugePointer`). | `lib/src/gadgets/gauges/gauge_types.dart` |
| `QrMatrix` | class | Matriz quadrada de modulos (true = escuro), sem margem. | `lib/src/gadgets/gauges/qr_matrix.dart` |
| `QrDataTooLongException` | class | — | `lib/src/gadgets/gauges/qr_matrix.dart` |
| `encodeQrMatrix` | função | Gera a matriz como o qrcode.react: `encodeSegments(makeSegments(text), level, 1, 40, -1, boostLevel)`. Lanca [QrDataTooLongException] se nao couber na versao 40 (o React lanca `RangeError("Data too long")`). | `lib/src/gadgets/gauges/qr_matrix.dart` |
| `SgQRCodeLayout` | class | Medidas do wrapper, como o React as calcula (`Math.round`, `Math.max`, `Math.min`). | `lib/src/gadgets/gauges/sg_qr_code.dart` |
| `sgQrCodeLayout` | função | — | `lib/src/gadgets/gauges/sg_qr_code.dart` |
| `radialGaugeCenterTexts` | função | Textos do centro quando nao ha `centerContent`: o rotulo ("Value") e o valor arredondado. | `lib/src/gadgets/gauges/sg_radial_gauge.dart` |

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase; as afirmações vêm da leitura do código no commit `e9989b8` e do `docs/paridade.json`.
- Os 33 locales do calendário e os 464 fusos foram conferidos por contagem nos arquivos gerados; os 33 locales de períodos do dia e as 118 matrizes de QR vêm do `docs/PARIDADE.md`, sem recontagem.
- Acessibilidade: li os `Semantics`/`Focus` do código; não testei com leitor de tela.
- A tabela de símbolos públicos foi filtrada pelos `show` dos barris (`gadgets_gauges.dart`, `gadgets_clock.dart`); constantes (como `kSgStringAnimatorDefaultCharset`) não entram na extração por script e foram conferidas à mão.
