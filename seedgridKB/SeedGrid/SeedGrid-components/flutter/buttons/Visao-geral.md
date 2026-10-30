---
description: "Botões em Flutter (seedgrid_components): quando usar e para que serve cada widget, estado de paridade com o React e símbolos públicos do grupo."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, buttons]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages/seedgrid_components/lib/src
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Botões — Flutter (`seedgrid_components`)

> **Plataforma: Flutter.** Esta nota descreve os widgets Dart do pacote `seedgrid_components` (repositório `front/seedgrid-fe-flutter`, commit `e9989b8`, **não publicado** no pub.dev). O mesmo grupo em **React** está em [[SeedGrid/SeedGrid-components/buttons/Visao-geral|Botões — React]]. Como escolher entre as duas plataformas e o placar geral: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

- API completa (construtor, parâmetros, callbacks, controllers, acessibilidade): [[SeedGrid/SeedGrid-components/flutter/buttons/API|API — Botões (Flutter)]]
- Exemplos Dart: [[SeedGrid/SeedGrid-components/flutter/buttons/Exemplos|Exemplos — Botões (Flutter)]]
- Traduzir do React: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · estado por componente: [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]] · divergências: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]

## Placar do grupo

3 componente(s): **3 portado(s)**, **0 parcial(is)**, **0 não portado(s)** (fonte: `docs/paridade.json` do repositório Flutter, commit `e9989b8`).

## Para que serve

| Componente | Estado | Para que serve | Página do showcase |
|---|---|---|---|
| `SgButton` | portado | Botão de ação com severidade, aparência, tamanho, formato, ícones e carregamento. | `pages/sg_button_page.dart` |
| `SgSplitButton` | portado | Ação principal com menu de ações secundárias acoplado. | `pages/sg_split_button_page.dart` |
| `SgFloatActionButton` | portado | Botão flutuante com speed-dial, dica, arrastar e auto-ocultar ao rolar. | `pages/sg_float_action_button_page.dart` |

## Quando usar

- `SgButton`: qualquer ação simples (salvar, cancelar, enviar). Dentro de um `SgForm`, use `type: SgButtonType.submit` para enviar o formulário. Para ação principal com variações da mesma tarefa, prefira `SgSplitButton`.
- `SgSplitButton`: uma ação padrão mais algumas alternativas (por exemplo "Salvar" e "Salvar como…"). Se as alternativas são ações independentes da tela, use botões separados.
- `SgFloatActionButton`: ação de destaque que flutua sobre o conteúdo (criar item), com ações secundárias em leque (`actions`). Para ação dentro do fluxo da página, use `SgButton`.

## O que muda em relação ao React

- `onClick`, `disabled`, `type` e `child` do `SgButton` são extras explícitos (no React vêm do `<button>`); `className`/`style` não existem (ADR 50).
- Em largura menor que 600 px o menu do `SgSplitButton` vira painel de baixo (ADR 51).
- O `SgFloatActionButton` flutua no `Overlay` raiz (`absolute: false`) e guarda a posição arrastada em `SharedPreferences` ou no `SgEnvironmentProvider`; `hint` por hover não existe no toque.
- Resumo de todas as decisões: [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]] · regras de tradução: [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]].

## Símbolos do React do mesmo grupo sem componente equivalente

Fonte: [[SeedGrid/SeedGrid-components/buttons/Visao-geral|Botões — React]] (seção "Funções e tipos exportados").

| Símbolo React | Equivalente Flutter |
|---|---|
| `buildFabStorageKey` | `buildFabStorageKey` (`buttons/sg_float_action_button.dart`), mesma chave `sg-fab-pos:<dragId>` |
| `parseStoredFabDragPosition` | `parseStoredFabDragPosition`, devolve `Offset?` |
| tipos `SgButtonCustomColors`, `SgSplitButtonItem`, `SgFABAction`, `FABPosition` e demais aliases | classes `SgButtonCustomColors`, `SgSplitButtonItem`, `SgFABAction`, `SgFABOffset` e enums de `generated/enums.g.dart` (`SgFloatActionButtonPosition` etc.) |
| helper interno de posição das ações | `computeFabItemPositions` (porte de `computeItemPositions`) |

Nenhum símbolo do grupo React ficou sem equivalente confirmado.

## Não verificado

- Não executei o showcase nem `flutter test`; o comportamento descrito vem da leitura de `buttons/*.dart`.
- `SgButtonType.reset` existe, mas não encontrei código que o trate (ver [[SeedGrid/SeedGrid-components/flutter/buttons/API|API]]).
- Não verifiquei leitores de tela reais.

## Símbolos públicos do grupo (além dos widgets)

Extraído por script dos arquivos exportados pelo `seedgrid_components.dart` (declarações de nível superior sem `_`). Descrição = comentário `///` do código, quando existe.

| Símbolo | Tipo | Descrição | Arquivo |
|---|---|---|---|
| `SgButtonType` | enum | `type` do `<button>` do HTML. `submit` dentro de um [SgForm] aciona o envio do formulario (os callbacks 'onValid'/'onInvalid' do SgForm). | `lib/src/buttons/sg_button.dart` |
| `SgButtonCustomColors` | class | Cores customizadas do botao (`SgButtonCustomColors` do React). Todas opcionais. | `lib/src/buttons/sg_button.dart` |
| `SgButtonColors` | class | Cores ja resolvidas (equivale a `resolveButtonColors` do React). | `lib/src/buttons/sg_button.dart` |
| `resolveButtonColors` | função | — | `lib/src/buttons/sg_button.dart` |
| `SgFABAction` | class | Uma acao secundaria do speed-dial (`SgFABAction` do React). | `lib/src/buttons/sg_float_action_button.dart` |
| `SgFABOffset` | class | `offset` do React (`{ x?: number; y?: number }`). | `lib/src/buttons/sg_float_action_button.dart` |
| `buildFabStorageKey` | função | Porte de `buildFabStorageKey` (fab-helpers.ts). | `lib/src/buttons/sg_float_action_button.dart` |
| `parseStoredFabDragPosition` | função | Porte de `parseStoredFabDragPosition` (fab-helpers.ts): aceita texto JSON ou objeto com `x` e `y` numericos finitos; qualquer outra coisa vira `null`. | `lib/src/buttons/sg_float_action_button.dart` |
| `computeFabItemPositions` | função | Porte de `computeItemPositions`: deslocamento (x, y) de cada acao em relacao ao centro do botao. | `lib/src/buttons/sg_float_action_button.dart` |
| `SgSplitButtonItem` | class | Item do menu (`SgSplitButtonItem` do React). | `lib/src/buttons/sg_split_button.dart` |

