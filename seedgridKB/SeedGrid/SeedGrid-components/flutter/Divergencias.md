---
description: "Divergências de propósito do Flutter em relação ao React nos componentes SeedGrid, em perguntas e respostas: decisões do dono (onChange no formulário, validadores no submit), decisões de valor programático, limites do editor e defeitos do React achados."
tags: [seedgrid, front, component, flutter, dart, divergencias, perguntas-e-respostas]
fonte: front/seedgrid-fe-flutter/docs
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Divergências do Flutter em relação ao React

> **Status: NÃO PUBLICADO.** Resumo de `docs/DIVERGENCIAS_DO_REACT.md`, `docs/VALOR_PROGRAMATICO.md`, `docs/VALOR_PROGRAMATICO_SELECAO.md` e `docs/SG_TEXT_EDITOR_PoC.md` do repositório `seedgrid-fe-flutter` (commit `314cb5a`). Os defeitos do React listados aqui foram **só registrados**: o React não foi alterado. Contexto: [[SeedGrid/SeedGrid-components/flutter/Visao-geral|Visão geral]] · regras de tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]].

## Quais decisões o dono tomou?

Ambas de 2026-10-25 (fonte: `docs/DIVERGENCIAS_DO_REACT.md`; ADR 52).

| # | Decisão | React | Flutter |
|---|---|---|---|
| 1 | O `onChange`/`onValueChange` do usuário sempre roda, também dentro de formulário | com `name` + `control`, o `Controller` troca o callback do usuário pelo `field.onChange`; o do usuário é engolido (MultiSelect, MultiSelectChips, StepperInput, Slider, Combobox, Autocomplete) | chama o callback do usuário **e** grava no formulário (`setValue`); mudar por fora (`setValue`, `reset`, prop `value`) continua sem chamar `onChange` |
| 2 | `handleSubmit` e `trigger` rodam também os validadores do próprio componente | só rodam as `rules` do campo; CPF/CNPJ/e-mail/telefone/CEP/datas validam só no blur, então um CPF inválido passava no envio | o envio e o `trigger` executam também o validador do componente; CPF inválido chama `onInvalid` e mostra o erro sob o campo |

Mecanismo da decisão 2 (`form/sg_form.dart`, símbolos `SgFieldValidator`, `SgFormController.registerField(name, {rules, initialValue, validator})` e `unregisterValidator`): as `rules` rodam primeiro (ordem do RHF); o validador do componente só roda se elas passaram, então o erro das `rules` vence; o erro do validador tem `type: 'validate'`. Campo desabilitado nunca falha; campo vazio e não obrigatório não falha; `reset()` limpa os erros. Risco registrado: com `validateWithViaCep` ou `validateWithPublicaCnpj` ligados, o envio dispara a consulta de rede (memorizada pelo último valor).

Testes que fixam as decisões: `test/widgets/sg_multi_select_test.dart`, `sg_multi_select_chips_test.dart` (decisão 1) e `test/form/sg_form_component_validators_test.dart` (decisão 2).

## Que decisões de "valor programático" existem em texto, máscara, data e número?

Pergunta que os testes respondem: setar valor por código funciona sem quebrar máscara e validação? Fonte: `docs/VALOR_PROGRAMATICO.md` (cenários comparados com o React real: texto 395, máscaras BR 558, datas 232, números 632, mais 11 casos manuais).

| Id | Decisão |
|---|---|
| D1 | O campo sempre mostra o valor mascarado, venha de onde vier (inicial, `value`, `setValue`, `reset`). O React mostra o valor cru de `initialValue`/`defaultValues`. |
| D2 | O formulário guarda o valor como foi setado (cru ou formatado), como o React; `onChange` não dispara em `setValue`/`reset`/`value`. |
| D4 | Valor maior que a máscara é exibido cortado/limpo, mas a validação olha o texto cru setado (aparece o erro de tamanho). |
| D5 | Se há erro visível e o valor muda por fora, ele é revalidado; `reset` limpa o erro. |
| D6 | Telefone com DDI (`+5511987654321`) perde o DDI na tela. O React mostra número errado. |
| D7, D8 | E-mail: espaços e quebras das pontas são removidos; textarea: `\r\n` vira `\n`. |
| D9 | `maxLength` com semântica de navegador (`SgMaxLengthFormatter`): valor programático acima do limite não é cortado; só impede crescer. |
| D10 | Data aceita ISO, ISO com hora e o texto do locale; o React (`input type=date`) só entende ISO. |
| D11 | `reset()` sem valores e `setValue(null)` em número/moeda mostram o estado vazio. |
| D12 | Stepper ligado a formulário também chama `onChange`; `value` é `num?`. |

Não modeladas: D13 (`setValue(undefined)` volta ao default só no RHF) e D14 (rejeição de tecla com máscara cheia não dispara `onChanged` no Flutter; sem diferença observável).

## E nos campos de escolha e seleção?

Fonte: `docs/VALOR_PROGRAMATICO_SELECAO.md`. Vias testadas: valor inicial, `value` controlado, `name`+`control`, opções tardias, o que `onChange` emite, validação, foco/painel aberto, `disabled`/`readOnly`. Vetores do React real (esbuild + jsdom) para Combobox, Autocomplete, MultiSelect, MultiSelectChips, CheckboxGroup, RadioGroup, ToggleSwitch, Slider, Rating e InputOTP; testes diretos no Flutter para PickList, OrderList, Calendar, PeriodSelector, YearPartSelector e TextEditor.

Decisões:
- Dart não distingue `null` de `undefined`: `value: null` significa "sem valor controlado" e, se antes havia valor, **limpa** o campo.
- Com erro mostrado (ou depois de um submit), o usuário mudar o valor **revalida**.
- Campos sem valor no formulário registram o padrão do tipo (`[]` em multi/checkbox, `false` no toggle, o mínimo no slider); o React deixa `undefined`.
- Mudar por fora nunca emite `onChange`; OTP com `value: null` depois de valor não nulo é ignorado.

Bugs do **Flutter** achados e corrigidos (mesma fonte): não limpava por fora (Combobox, RadioGroup, CheckboxGroup, ToggleSwitch, MultiSelect/Chips, Autocomplete, PeriodSelector, TextEditor); Autocomplete perdia `setValue` com o campo focado; RadioGroup emitia de novo ao tocar no radio marcado; Combobox não revalidava após escolher; PeriodSelector e TextEditor mantinham a última escolha após `reset()`; OTP refazia o valor a partir do cortado pela máscara antiga; `initialValue` do Slider usava tipo diferente do resto.

## Que defeitos do React foram encontrados?

Só registrados, não corrigidos.

Texto, máscara, data e número (`docs/VALOR_PROGRAMATICO.md`):
1. `initialValue`/`defaultValues` não passam pela máscara.
2. Telefone com DDI mostra número errado.
3. Erro de validação antigo permanece depois de mudar o valor por fora.
4. `reset()` sem valores / `setValue(null)` deixam texto antigo em número e moeda.
5. Stepper em formulário ignora o `onChange` do usuário.
6. `handleSubmit`/`trigger` não executam os validadores dos componentes.
7. Datas: `<input type=date>` só entende ISO.
8. Validação de data/idade mínima depende do valor do DOM no blur.

Escolha e seleção (`docs/VALOR_PROGRAMATICO_SELECAO.md`, D-1 a D-10): `onValueChange`/`onChange` engolido no formulário; Autocomplete não guarda `lastSelected` do valor inicial; `SgInputText` ignora `inputProps.onFocus` (então `openOnFocus` não funciona); no ToggleSwitch `checked` sobrepõe o valor do formulário; Slider recebe NaN de texto não numérico; erro posto por `trigger` não revalida ao mudar o valor; CheckboxGroup com `value: null` quebra no modo simples; RadioGroup com `undefined` cai no estado antigo; `reset` sem padrão deixa a última escolha em PeriodSelector e TextEditor; o `readOnly` do OTP não impede o jsdom de digitar (artefato do teste).

Editor `SgTextEditor` (`docs/SG_TEXT_EDITOR_PoC.md`): o placeholder nunca aparece; `required` passa com o editor vazio (`<p></p>`); "Carregar HTML" e mudar `valueHtml` por fora não chamam `onChangeHtml`; cancelar o `window.prompt` do link remove o link e URL sem protocolo vira link relativo; imagem `data:` inserida pela barra some ao recarregar; `<span>` vazio e releitura não idempotente; fonte "Padrão" grava `font-family: inherit`; os `<select>` de fonte e tamanho não refletem a seleção; `toggleBulletList` sobre lista numerada aninhada apaga o item filho; `exec()` chama `editor.chain().focus()` sem `.run()`.

## O que o editor Flutter não suporta?

Motor: `flutter_quill` 11.5.0 (MIT), travado até o repositório subir para Flutter >= 3.44; conversão HTML própria (`sg_text_editor_html.dart`) conferida contra o TipTap 2.27.2 real (264 fixtures: 166 de HTML, 91 de comandos, 7 de documento completo). Perdas explícitas, cobertas por teste (fonte: `docs/SG_TEXT_EDITOR_PoC.md`, seção "NÃO suportados"):

- `<sub>` e `<sup>` no mesmo trecho: vence o mais interno; `<mark>` sem cor vira `#ffff00`; cor com alfa perde o alfa; `font-size` em `em`/`rem`/`pt`/`%` vira px.
- `<ol start="3">` recomeça em 1; item de lista com vários parágrafos vira um item; citação com conteúdo aninhado é achatada; título dentro de item de lista vira item comum.
- Bloco de código perde marcas e linguagem; tabelas, `iframe`, `video`, `input`, `script`, `style` são descartados; imagem `data:` é descartada na leitura.
- Atalhos de markdown (`# `, `- `, `1. `) não existem.

## Não verificado

- Não executei os testes citados nem conferi os números (cenários, fixtures) contra os arquivos de teste; vêm dos `docs/` do repositório.
- As ADR 49, 50, 51 e 52 foram usadas só pelas citações nos `docs/`.
- Se uma decisão tiver mudado depois do commit `314cb5a`, o `docs/` do repositório manda.
