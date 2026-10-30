---
description: "Inputs de seleção e valores em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, inputs-selecao]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Inputs de seleção e valores — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/inputs-selecao/Visao-geral|Inputs de seleção e valores — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API — Inputs de seleção e valores (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

14 componente(s): **14 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgAutocomplete` | portado | Texto com sugestões de uma fonte local ou assíncrona, com debounce e cache; devolve o texto. | `pages/sg_autocomplete_page.dart` |
| `SgCombobox` | portado | Lista de escolha única com type-ahead; devolve o id do item (fonte local ou assíncrona). | `pages/sg_combobox_page.dart` |
| `SgCheckboxGroup` | portado | Grupo de caixas de marcação para escolha múltipla, com a opção "marcar todos". | `pages/sg_checkbox_group_page.dart` |
| `SgRadioGroup` | portado | Grupo de botões de rádio para escolha única, na vertical ou na horizontal. | `pages/sg_radio_group_page.dart` |
| `SgMultiSelect` | portado | Seleção múltipla em lista suspensa com busca opcional; mostra rótulos ou um resumo. | `pages/sg_multi_select_page.dart` |
| `SgMultiSelectChips` | portado | Seleção múltipla em lista suspensa; os itens escolhidos viram chips removíveis no campo. | `pages/sg_multi_select_chips_page.dart` |
| `SgOrderList` | portado | Lista cujos itens o usuário reordena por botões, atalhos de teclado ou arrastando. | `pages/sg_order_list_page.dart` |
| `SgPickList` | portado | Duas listas (origem e destino) para transferir itens, com filtro e reordenação. | `pages/sg_pick_list_page.dart` |
| `SgPeriodSelector` | portado | Período pré-definido (este mês, último trimestre...) ou personalizado, resolvido em datas. | `pages/sg_period_selector_page.dart` |
| `SgYearPartSelector` | portado | Ano + recorte (semestre, trimestre, bimestre) + fatia, resolvidos em datas. | `pages/sg_year_part_selector_page.dart` |
| `SgToggleSwitch` | portado | Interruptor liga/desliga com rótulo, descrição e validação. | `pages/sg_toggle_switch_page.dart` |
| `SgRating` | portado | Avaliação por estrelas (inteira ou meia), com botão de zerar e teclado. | `pages/sg_rating_page.dart` |
| `SgSlider` | portado | Controle deslizante numérico entre um mínimo e um máximo, com passo. | `pages/sg_slider_page.dart` |
| `SgStepperInput` | portado | Campo numérico com botões e setas para aumentar ou diminuir dentro de um intervalo. | `pages/sg_stepper_input_page.dart` |

## Quando usar

| Preciso de... | Use | Em vez de |
|---|---|---|
| Escolher **um** item de uma lista conhecida (sem buscar por texto) | `SgCombobox` | `SgAutocomplete` (quando a lista é grande ou vem de busca remota) ou `SgRadioGroup` (poucas opções sempre visíveis) |
| Digitar e receber sugestões de uma busca (cidade, produto, cliente) | `SgAutocomplete` | `SgCombobox` (que só carrega a lista inteira) |
| Escolher **vários** itens, ocupando pouco espaço | `SgMultiSelect` (resumo) ou `SgMultiSelectChips` (chips visíveis e removíveis) | `SgCheckboxGroup` (poucas opções sempre visíveis) |
| Marcar várias opções sempre visíveis, com "marcar todos" | `SgCheckboxGroup` | `SgMultiSelect` |
| Escolher uma opção entre poucas, todas visíveis | `SgRadioGroup` | `SgCombobox` |
| Ordenar manualmente uma lista | `SgOrderList` | `SgPickList` (que também ordena, mas serve para transferir) |
| Transferir itens entre "disponíveis" e "escolhidos" | `SgPickList` | `SgMultiSelect` (quando não importa ver as duas listas) |
| Um intervalo de datas por nome (este mês, último trimestre) | `SgPeriodSelector` | `SgInputDate` duas vezes |
| Ano + semestre, trimestre ou bimestre | `SgYearPartSelector` | `SgPeriodSelector` |
| Ligar/desligar uma opção | `SgToggleSwitch` | `SgCheckboxGroup` com uma opção |
| Nota de 1 a N estrelas | `SgRating` | `SgSlider` |
| Valor numérico por arrasto, dentro de limites | `SgSlider` | `SgStepperInput` (quando o valor exato importa) |
| Quantidade inteira com botões de mais e menos | `SgStepperInput` | `SgInputNumber` (grupo [[SeedGrid/SeedGrid-components/flutter/inputs-texto/Visao-geral|Inputs de texto e documentos (Flutter)]], formatação e máscara) |

Todos aceitam `name` + `control` para ligar ao `SgForm`; veja o "Comportamento comum" na [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/API|API do grupo]].

## O que muda em relação ao React

Os nomes de widget, de props e de valores são os do React ([[SeedGrid/SeedGrid-components/inputs-selecao/Visao-geral|Inputs de seleção e valores (React)]]); as diferenças estão resumidas aqui e detalhadas, por componente, na seção "Diferenças do React" da API.

- **Formulário:** o `SgForm`/`SgFormController` substitui o `react-hook-form`. O `onChange` do usuário **sempre** é chamado, também dentro de formulário (no React, `SgMultiSelect` e `SgMultiSelectChips` o engoliam); só `SgToggleSwitch` registra validador próprio que roda também no `handleSubmit`. Detalhe em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]].
- **Nulo = não controlado:** o Dart não distingue `null` de indefinido; `value: null` significa "sem valor controlado" e, se antes havia valor, limpa o campo (`SgCombobox`, `SgAutocomplete`, `SgPeriodSelector`, `SgToggleSwitch`).
- **`ref` virou `controller`:** `SgCheckboxGroupController`, `SgOrderListController`, `SgPickListController`.
- **Mobile:** abaixo de 600 px a lista de opções de combobox, autocomplete e multisseleção vira painel de baixo (ADR 51); `SgOrderList` e `SgPickList` arrastam por toque longo (cerca de 150 ms) e o `SgPickList` move por duplo toque.
- **Sem estilo CSS:** não existem `className`, `style` nem `inputProps` (aceito e ignorado); tipos e enums seguem [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]].
- Estado de paridade de cada widget: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]].

## Símbolos do React do mesmo grupo sem componente equivalente

| Símbolo no React | Equivalente no Flutter |
|---|---|
| `SgCheckboxGroupRef`, `SgOrderListRef`, `SgPickListRef` | `SgCheckboxGroupController`, `SgOrderListController`, `SgPickListController` (props `controller`) |
| `SgComboboxSource` | `SgAutocompleteSource<T>` (`FutureOr<List<T>> Function(String query)`) ou `List<T>` na prop `source` |
| `SgSwitch`, `SgSwitchProps` (alias não reexportado no React) | `typedef SgSwitch = SgToggleSwitch` (`sg_toggle_switch.dart`) |
| `PeriodPreset`, `ResolvedPeriod`, `ResolvePeriodOptions`, `resolvePeriod`, `periodPresetLabel`, `buildPeriodOptions` | Portados em `inputs/period/period_logic.dart` (`PeriodPreset` com os nomes legíveis sobre o enum gerado `SgPeriodSelectorValue`); `buildPeriodOptions` devolve `List<SgAutocompleteItem>` |
| `YearPartKind`, `YearPartValue`, `ResolvedYearPart`, `resolveYearPart`, `yearPartOptions`, `yearPartLabel`, `yearPartKindLabel`, `yearPartCount`, `yearPartMonths`, `isValidYearPart`, `clampYearPart`, `yearPartOf` | Portados em `inputs/period/year_part.dart`, mesmos nomes |
| `SgMultiSelectOption`, `SgMultiSelectOptionValue` | Exportados (`SgMultiSelectOption`, `typedef SgMultiSelectOptionValue = Object`) |
| `SgMultiSelectDropdown`, `useSgMultiSelect` (internos no React, não exportados) | Sem equivalente público: o Flutter tem `SgMultiSelectController` e o dropdown internos (`multi/`), não exportados pelo barril |
| `SgOrderListItem`, `SgPickListItem` e tipos do `SgPickList` (`SgPickListValue`, `SgPickListChangeEvent`, `SgPickListChangeType`...) | Portados com os mesmos nomes (ver a tabela "Símbolos públicos do grupo" abaixo) |
| `SgRatingSize` | Enum gerado `SgRatingSize` (`generated/enums.g.dart`) |

Tudo o que o React exporta neste grupo tem equivalente em Dart; **nenhum** símbolo ficou sem porte, exceto os dois internos acima, que o React também não exporta. Fontes: `API.md` do grupo React, `inputs/*_inputs.dart` (barris) e `inputs/period/*.dart` no Flutter.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart`, **filtrado à mão pelas cláusulas `show` dos barris** `inputs/choice_inputs.dart`, `lists/list_inputs.dart`, `multi_inputs.dart` e `number_inputs.dart` (símbolos auxiliares internos como `ChoiceFieldBinding`, `ListFieldBinding`, `SgMultiSelectController` e `ListEntryTile` **não** são públicos). Declarações de nível superior sem `_`. Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgChoiceGroupBoxProps` | class | `groupBoxProps` do React: o que se pode repassar ao SgGroupBox (titulo, largura e altura). | `lib/src/inputs/choice/choice_shared.dart` |
| `SgCheckboxGroupOption` | class | Opcao do grupo (`SgCheckboxGroupOption`). `value` e texto ou numero. | `lib/src/inputs/choice/sg_checkbox_group.dart` |
| `SgCheckboxGroupController` | class | Equivale a `SgCheckboxGroupRef` do React (getChecked/setChecked/checkAll/clearAll). | `lib/src/inputs/choice/sg_checkbox_group.dart` |
| `SgRadioGroupOption` | class | Opcao do grupo (`SgRadioGroupOption`). `value` e texto ou numero. | `lib/src/inputs/choice/sg_radio_group.dart` |
| `SgSwitch` | typedef | Alias, como `SgSwitch` no React. | `lib/src/inputs/choice/sg_toggle_switch.dart` |
| `ChoiceKind` | enum | — | `lib/src/inputs/choice/choice_tile.dart` |
| `ChoiceTile` | class | — | `lib/src/inputs/choice/choice_tile.dart` |
| `SgListGroupBoxProps` | class | `groupBoxProps` do React: o que se pode repassar ao SgGroupBox (titulo, largura e altura). | `lib/src/inputs/lists/lists_shared.dart` |
| `SgOrderListItem` | class | Item da lista (`SgOrderListItem`). `value` e texto ou numero. | `lib/src/inputs/lists/sg_order_list.dart` |
| `SgOrderListItemState` | class | Segundo argumento do `itemTemplate`. | `lib/src/inputs/lists/sg_order_list.dart` |
| `SgOrderListController` | class | Equivale a `SgOrderListRef` do React. | `lib/src/inputs/lists/sg_order_list.dart` |
| `SgPickListItem` | class | Item da lista (`SgPickListItem`). `value` e texto ou numero. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListListName` | enum | `SgPickListListName`. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListChangeType` | enum | `SgPickListChangeType`: o texto de [value] e o do React. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListValue` | class | `SgPickListValue`: as duas listas. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListChangeEvent` | class | `SgPickListChangeEvent`: o valor novo mais o tipo da mudanca. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListItemState` | class | Segundo argumento do `itemTemplate`. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgPickListController` | class | Equivale a `SgPickListRef` do React. | `lib/src/inputs/lists/sg_pick_list.dart` |
| `SgMultiSelectOptionValue` | typedef | `string \| number` do React. | `lib/src/inputs/multi/multi_select_core.dart` |
| `SgMultiSelectOption` | class | Uma opcao (`SgMultiSelectOption` do React). | `lib/src/inputs/multi/multi_select_core.dart` |
| `PeriodPreset` | class | `PeriodPreset` do React. O tipo e o enum gerado [SgPeriodSelectorValue] (cujo `.value` e o texto do React, ex.: `"THIS_WEEK"`); aqui ficam os nomes legiveis. `PeriodPreset.thisWeek == SgPeriodSelectorValue.thisWeek`. | `lib/src/inputs/period/period_logic.dart` |
| `ResolvedPeriod` | class | `ResolvedPeriod` do React. ALL e CUSTOM (sem preenchimento) devolvem datas nulas. | `lib/src/inputs/period/period_logic.dart` |
| `ResolvePeriodOptions` | class | `ResolvePeriodOptions` do React. | `lib/src/inputs/period/period_logic.dart` |
| `periodPresetLabel` | função | Rotulo do preset no locale pedido (ASCII sem acentos, como no React). | `lib/src/inputs/period/period_logic.dart` |
| `resolvePeriod` | função | Resolve um preset temporal para um intervalo real de datas.  Convencoes (as do React): semana comeca na SEGUNDA-FEIRA; quinzena e de calendario (1..15 e 16..fim do mes); start = 00:00:00.000 local, end = 23:59:59.999 local; ALL/CUSTOM devolvem datas nulas; minDate/maxDate fazem clamp. `ref` padrao: agora. | `lib/src/inputs/period/period_logic.dart` |
| `buildPeriodOptions` | função | Opcoes do combo a partir dos flags `permit*`. Como no React, flag ausente vale falso (a lista sai vazia sem nenhum flag); o componente e que usa `true` como padrao. | `lib/src/inputs/period/period_logic.dart` |
| `parseIsoDate` | função | Converte o valor ISO `yyyy-MM-dd` do campo de data em `DateTime` local. Anos incompletos (< 1000), mes ou dia fora de 1..12 / 1..31 devolvem nulo. Dia que nao existe no mes (31/02) transborda para o mes seguinte, como no JavaScript (`new Date(2026, 1, 31)` e 3 de marco). | `lib/src/inputs/period/period_logic.dart` |
| `YearPartKind` | enum | `YearPartKind` do React. O texto de [value] e o do React (`"SEMESTER"`, `"QUARTER"`, `"BIMESTER"`). | `lib/src/inputs/period/year_part.dart` |
| `YearPartValue` | class | `YearPartValue` do React: ano, recorte e fatia (base 1). | `lib/src/inputs/period/year_part.dart` |
| `ResolvedYearPart` | class | `ResolvedYearPart` do React: espelha `ResolvedPeriod`, mas as datas nunca sao nulas. | `lib/src/inputs/period/year_part.dart` |
| `pickLocaleLabel` | função | `pickLocale` do React: o locale pedido, senao pt-BR, senao o primeiro. | `lib/src/inputs/period/year_part.dart` |
| `yearPartCount` | função | Quantas fatias cabem no ano para este recorte. | `lib/src/inputs/period/year_part.dart` |
| `yearPartMonths` | função | Quantos meses tem cada fatia deste recorte: 6, 3 ou 2. | `lib/src/inputs/period/year_part.dart` |
| `yearPartKindLabel` | função | Nome do recorte no locale pedido ("Trimestre", "Quarter"). | `lib/src/inputs/period/year_part.dart` |
| `yearPartLabel` | função | Rotulo de uma fatia: "Trimestre 1 (Q1)", "Semestre 2 (S2)", "Bimestre 3". | `lib/src/inputs/period/year_part.dart` |
| `YearPartOption` | typedef | Opcao do combo da fatia. | `lib/src/inputs/period/year_part.dart` |
| `yearPartOptions` | função | Opcoes prontas para o combo da fatia, ja no locale pedido. | `lib/src/inputs/period/year_part.dart` |
| `isValidYearPart` | função | A fatia existe neste recorte? | `lib/src/inputs/period/year_part.dart` |
| `clampYearPart` | função | Ao trocar o recorte, mantem a fatia quando couber e cai na primeira quando nao couber. | `lib/src/inputs/period/year_part.dart` |
| `resolveYearPart` | função | Resolve o recorte para o intervalo fechado de datas (fim em 23:59:59.999). Lanca [RangeError] quando a fatia nao existe no recorte (igual ao React). | `lib/src/inputs/period/year_part.dart` |
| `yearPartOf` | função | Em que fatia do recorte esta data cai. | `lib/src/inputs/period/year_part.dart` |
| `SgAutocompleteItem` | class | `SgAutocompleteItem` do React. `id` e texto ou numero. | `lib/src/inputs/select/select_support.dart` |
| `SgAutocompleteSource` | typedef | `SgAutocompleteSource` do React: devolve a lista (ou um Future dela) para o texto digitado. | `lib/src/inputs/select/select_support.dart` |
| `sgDefaultMapItem` | função | Mapeamento padrao do `SgCombobox` (`defaultMapItem` do React): texto/numero viram id=label; mapas usam `id\|value\|key\|label` e `label\|name\|description\|title`; `SgAutocompleteItem` passa direto. | `lib/src/inputs/select/select_support.dart` |
| `sgIdEquals` | função | `idEquals` do React: compara como texto; nulo nunca e igual. | `lib/src/inputs/select/select_support.dart` |
| `SgSelectItemBuilder` | typedef | — | `lib/src/inputs/select/select_support.dart` |
| `SgSelectList` | class | Lista de opcoes: carregando, vazio, plana ou agrupada, com item ativo, tooltip e rolagem ate o ativo. | `lib/src/inputs/select/select_support.dart` |
| `SgSelectOverlay` | class | Superficie da lista: ancorada ao campo (larga) ou painel de baixo acima do teclado (estreita). Estilo da lista de selecao sobre o [SgDropdownHost] compartilhado; mostra/esconde conforme [open]. | `lib/src/inputs/select/select_support.dart` |
| `sgSelectNarrow` | função | A lista cabe como painel de baixo? (largura < 600) | `lib/src/inputs/dropdown/sg_dropdown_host.dart` |
| `sgDropdownMaxWidth` | função | `maxWidth: min(32rem, 100vw - 24px)` do React: largura maxima do popup ancorado. | `lib/src/inputs/dropdown/sg_dropdown_host.dart` |
| `SgDropdownHost` | class | Envolve o campo ([field]) e mostra a lista quando [open] e verdadeiro.  - Largo: [popup] fica ancorado abaixo do campo (recebe a largura medida do campo). - Estreito, [modalSheet] falso: [panel] vira painel de baixo colado acima do teclado (sem rota). - Estreito, [modalSheet] verdadeiro: [sheet] abre num `showModalBottomSheet`; se a largura mudar com a lista   aberta, chama [onNarrowChanged] para fechar e reabrir na superficie certa; se o modal fechar por gesto,   chama [onModalDismissed]. | `lib/src/inputs/dropdown/sg_dropdown_host.dart` |

## Não verificado

- Não executei `flutter test`, `flutter analyze` nem o showcase; as notas vêm da leitura do código no commit `e9989b8`. Os exemplos são os trechos do showcase (compilados pelo `flutter test` do repositório, não por mim): conferi por script que todo argumento nomeado dos exemplos existe no construtor do widget, sem checar tipos.
- Teclas e semântica internas do `Slider` do Material (`SgSlider`) e a semântica exposta pelo `SgInputText` interno (`SgCombobox`, `SgAutocomplete`, `SgMultiSelect`) **não foram confirmadas**.
- Se `required` de `SgCombobox` e `SgPeriodSelector` falha no envio quando só o prop `required` é usado: a leitura aponta que não (o `required` só chega ao campo interno sem `name`), mas **não rodei** o cenário; para exigir o campo, o caminho confirmado é `rules`.
- Padrões marcados com † na API são os do contrato React; não confirmei, componente a componente, onde o widget os aplica.
- Os textos de períodos e recortes do ano vêm de mapas embutidos sem acento (cinco idiomas no `SgYearPartSelector`: pt-BR, en-US, es, pt-PT e fr).
