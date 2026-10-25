---
description: "Componentes SeedGrid em Flutter (seedgrid-fe-flutter), em perguntas e respostas: o que é o porte, pacotes, como rodar, regras de escrita, o que muda em relação ao React e o que ainda falta. Não publicado."
tags: [seedgrid, front, component, flutter, dart, perguntas-e-respostas]
fonte: front/seedgrid-fe-flutter
branch: main
commit: 2e33260
analisado-em: 2026-10-25
---

# Componentes SeedGrid em Flutter

> **Status: NÃO PUBLICADO.** O repositório `front/seedgrid-fe-flutter` existe, tem commits locais e **não** tem tag nem publicação no pub.dev (publicar só com autorização do dono). A árvore de trabalho tinha alterações sem commit na data da análise (`analisado-em`), então o que está aqui vale para o commit `2e33260` mais o que o `README.md` e os `docs/` dizem. Notas do grupo: [[SeedGrid/SeedGrid-components/flutter/API-por-grupo|API por grupo]] · [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução React → Dart]] · [[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]. Versão React de referência: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]].

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
- Sem referência a PrimeFaces/PrimeReact em exemplos; arquivos em UTF-8.

Para portar um componente novo: ler o componente React e o contrato gerado `lib/src/generated/<comp>.g.dart`, escrever o widget em `lib/src/<grupo>/`, exportar no **barril do grupo** (nunca no arquivo raiz), testar cada prop pública e criar a página de showcase (passos no `README.md`, "Como portar um componente").

## Em que o Flutter se comporta diferente do React?

Decisões deliberadas (detalhe em [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]): em formulário o `onChange` do usuário **sempre** é chamado (o React o engole em Combobox, Autocomplete, MultiSelect e Slider); os validadores dos componentes rodam também em `handleSubmit`/`trigger` (no React só no blur); campo com valor inicial mostra sempre o valor mascarado; breakpoints do `SgGrid` medem a janela, como o `@media` do React. Alvo **mobile-first**: abaixo de 600 px a lista de opções (combobox, split button, colunas do datatable, menu) vira painel de baixo (ADR 51).

## O que ainda falta?

- Publicação (pub.dev): só com autorização do dono.
- Segundo o `docs/PARIDADE.md`, dos 89 componentes do React nenhum está pendente; a maioria está `parcial`, com o motivo registrado ([[SeedGrid/SeedGrid-components/flutter/Paridade|Paridade]]).
- Limitações recorrentes registradas na tabela: goldens com a fonte de teste do Flutter (sem comparação visual de texto com o React); não testado em IME nem em dispositivo; tema por URL/SVG livre do `SgClock` não portado (ADR 51).
- O `README.md` do repositório ainda diz que as ondas 1 a 6 "não começaram"; está desatualizado em relação ao `docs/PARIDADE.md` e ao histórico de commits (`feat: Onda 5`, `feat: Onda 6`). Vale o histórico e a tabela de paridade.

## Não verificado

- Não executei `flutter test`, `tools/ci.sh` nem o showcase para esta nota; os números de testes e de paridade vêm dos `docs/` do repositório e do plano em `seedgrid-platform-work/planos/seedgrid-fe-components/`.
- O conteúdo das ADR 48 a 52 foi lido só por intermédio das citações do `docs/TABELA_DE_TRADUCAO.md` e do plano.
