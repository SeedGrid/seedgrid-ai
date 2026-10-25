---
description: "Componentes SeedGrid em Flutter (seedgrid-fe-flutter), em perguntas e respostas: o que é o porte, pacotes, como rodar, regras de escrita, o que muda em relação ao React e o que ainda falta. Não publicado."
tags: [seedgrid, front, component, flutter, dart, perguntas-e-respostas]
fonte: front/seedgrid-fe-flutter
branch: main
commit: 314cb5a
analisado-em: 2026-10-25
---

# Componentes SeedGrid em Flutter

> **Status: NÃO PUBLICADO.** O repositório `front/seedgrid-fe-flutter` existe, tem commits locais e **não** tem tag nem publicação no pub.dev (publicar só com autorização do dono). Na data da análise (`analisado-em`) a árvore de trabalho estava limpa (`git status` sem alterações), então o que está aqui vale para o commit `314cb5a` mais o que o `README.md` e os `docs/` dizem. Notas do grupo: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]. Versão React de referência: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]].

## O que é?

Um **porte familiar** dos componentes React de `@seedgrid/fe-components`: mesmos nomes de widget (`SgButton`, `SgInputCPF`, `SgDatatable`…), de props e de valores, para quem já usa o React usar o Flutter com facilidade. **Não** é pixel a pixel e **não** reaproveita código React. Fonte: `README.md` do repositório (abertura) e ADR 48 a 52 da KB de plataforma (`SeedGrid/Dev/ADR/`).

## Que pacotes existem?

Monorepo Dart (pub workspaces). Versão dos pacotes = versão do `@seedgrid/fe-components` (no `README.md`: 2026.7.1).

| Pacote | O que é | Origem no React |
|---|---|---|
| `packages/seedgrid_theme` | tokens, escala de cor por hex, claro/escuro, `SgTheme` | `@seedgrid/fe-theme` |
| `packages/seedgrid_commons` | máscaras, validadores, CEP, CNPJ, cliente HTTP | `masks.ts`, `validators.ts`, `@seedgrid/fe-commons` |
| `packages/seedgrid_components` | contratos de props gerados, i18n (5 idiomas), widgets | `@seedgrid/fe-components` |
| `apps/seedgrid_showcase` | showcase: cabeçalho fixo, âncoras, exemplos, playground, referência de props | `apps/showcase` |

## Como rodo e valido?

```bash
flutter pub get
bash tools/ci.sh        # formato, análise, testes e arquivos gerados em dia
cd apps/seedgrid_showcase && flutter run -d chrome
```

`tools/` tem os geradores (Node 22; leem o repositório React, que não é alterado): vetores de paridade de máscara, validação e tema; exportação do i18n; extração e emissão das props; extração do código dos exemplos do showcase; tabela de paridade. A lista com os comandos está no `README.md`.

## Quais regras valem para escrever um componente?

Do `README.md` ("Regras"):
- Widget escrito à mão declara `implements <Comp>Props` (interface gerada): o analisador acusa prop faltando.
- **Não edite** `*.g.dart`, `props-spec.json`, `excecoes.json`, `snippets.g.dart` nem `docs/PARIDADE.md` (são gerados).
- No showcase, o código exibido é o trecho entre `// #region` e `// #endregion` da própria página (1:1 com o renderizado).
- Sem `className`/`style`; `enabled` vira `disabled`; eventos mantêm o nome do React (`onChange`, não `onChanged`); valores string do React viram enum.
- Props de **texto** (`SgButton.label`/`child`, `SgCard.title`/`description`, `SgDialog.title`/`subtitle`, `SgConfirmationDialog.title`/`message`/`subtitle` e `confirmButton.label`) são `Object?`: aceitam `String` ou `Widget`, convertidos por `sgNode` (`lib/src/props/sg_node.dart`; lista fechada `TEXT_OR_WIDGET` em `tools/gen_props/emit.mjs`).
- Sem referência a PrimeFaces/PrimeReact em exemplos; arquivos em UTF-8.

Para portar um componente novo: ler o componente React e o contrato gerado `lib/src/generated/<comp>.g.dart`, escrever o widget em `lib/src/<grupo>/`, exportar no **barril do grupo** (nunca no arquivo raiz), testar cada prop pública e criar a página de showcase (passos no `README.md`, "Como portar um componente").

## Em que o Flutter se comporta diferente do React?

Decisões deliberadas (detalhe em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]] e no `docs/DIVERGENCIAS_DO_REACT.md`, decisões do dono de 2026-10-25): em formulário o `onChange` do usuário **sempre** é chamado (o React o engole em Combobox, Autocomplete, MultiSelect, Slider e outros; a varredura achou só `SgMultiSelect` e `SgMultiSelectChips` ainda engolindo, corrigidos); os validadores dos componentes rodam também em `handleSubmit`/`trigger` (no React só no blur), via `SgFormController.registerField(validator:)`; campo com valor inicial mostra sempre o valor mascarado; breakpoints do `SgGrid` medem a janela, como o `@media` do React. Por causa das duas primeiras decisões, 18 componentes passaram de `portado` para `parcial` ou ganharam a ressalva ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]). Também: `SgForm` envia no Enter de campo de uma linha (`submitOnEnter`) e `SgToaster` pode ficar solto numa `Column`/`ListView` (desenha no `Overlay`). Alvo **mobile-first**: abaixo de 600 px a lista de opções (combobox, split button, colunas do datatable, menu) vira painel de baixo (ADR 51).

## O que ainda falta?

- Publicação (pub.dev): só com autorização do dono.
- Segundo o `docs/PARIDADE.md`, dos 89 componentes do React nenhum está pendente: 24 `portado` e 65 `parcial`, com o motivo registrado (inclui o `SgTextEditor`, portado na Onda 6 com `flutter_quill`) ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]).
- Limitações recorrentes registradas na tabela: goldens com a fonte de teste do Flutter (sem comparação visual de texto com o React); não testado em IME nem em dispositivo; tema por URL/SVG livre do `SgClock` não portado (ADR 51).
- O `README.md` do repositório (tabela de pacotes) ainda diz que as ondas 1 a 6 "ainda não começaram"; está desatualizado em relação ao `docs/PARIDADE.md` e ao histórico de commits (`feat: Onda 5`, `feat: Onda 6`). Vale o histórico e a tabela de paridade.

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase para esta nota; os números de paridade vêm do `docs/PARIDADE.md` (e `docs/paridade.json`) do repositório.
- O texto "18 componentes" vem da decisão do dono registrada para esta revisão; o `docs/PARIDADE.md` não conta quantos mudaram, só registra "validadores do componente rodam no submit (decisao do dono)" e "onChange do usuario tambem dentro de formulario (decisao do dono)" nas linhas.
- O conteúdo das ADR 48 a 52 foi lido só por intermédio das citações do `docs/TABELA_DE_TRADUCAO.md` e do plano.
